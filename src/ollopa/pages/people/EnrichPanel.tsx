// X-enrich: reveal and enrich, with the credit estimate (IA-MAP 2.3; spec 02 §3, "Bulk selection").
//
// The selection bar opens this rather than spending from the bar, because what you choose to reveal
// changes the price per row: the choice and the price belong on one surface (rule 5). Four things sit
// above the button and none of them is behind a door (rule 7): what to reveal with a price on each
// option, the per-row estimate, the total and the balance after it, and the exclusions stated with
// their count and an override. Above the threshold this panel *is* the confirmation; there is no
// second dialog after it.
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Panel } from "../../ui/Panel"
import { CREDITS, type Seed } from "../../data/seed"
import { businessById } from "../../data/businesses"
import type { Session } from "../../session"
import { daysSince, type PersonRow } from "./person"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export interface RevealOption {
  id: "email" | "email-mobile"
  label: string
  perRow: number
  /** What the option leaves alone, so nobody pays twice for a row that is already good. */
  skips: (p: PersonRow) => boolean
}

export const REVEAL_OPTIONS: RevealOption[] = [
  {
    id: "email",
    label: "Verified email, title and company",
    perRow: CREDITS.enrich,
    skips: (p) => p.emailStatus === "Verified" && Boolean(p.enrichedOn) && daysSince(p.enrichedOn) <= 30,
  },
  {
    id: "email-mobile",
    label: "Email and mobile",
    perRow: CREDITS.enrich + CREDITS.revealPhone,
    skips: (p) => p.emailStatus === "Verified" && p.phoneRevealed,
  },
]

export function EnrichPanel({ open, onOpenChange, rows, session, seed, onSpend }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rows: PersonRow[]
  session: Session
  seed: Seed
  onSpend: (summary: string) => void
}) {
  const [choice, setChoice] = useState<RevealOption["id"]>("email")
  const [includeDnc, setIncludeDnc] = useState(false)
  const option = REVEAL_OPTIONS.find((o) => o.id === choice)!
  const b = businessById(session.business)
  const seat = b.roles.find((r) => r.user === session.user)
  const admin = b.roles.find((r) => r.role === "admin")
  const spent = seed.credits.byUser.find((u) => u.user === session.user)?.used ?? 0
  const limit = seat?.creditLimit ?? seed.credits.perUserLimit

  const plan = useMemo(() => {
    const dnc = rows.filter((p) => p.doNotCall)
    const excluded = choice === "email-mobile" && !includeDnc ? dnc : []
    const considered = rows.filter((p) => !excluded.includes(p))
    const skipped = considered.filter(option.skips)
    const charged = considered.filter((p) => !option.skips(p))
    return { dnc, excluded, skipped, charged, total: charged.length * option.perRow }
  }, [rows, choice, includeDnc, option])

  const after = seed.credits.balance - plan.total
  const overLimit = limit !== null && limit !== undefined && spent + plan.total > limit
  const noCredits = plan.total > seed.credits.balance

  const spend = () => {
    onSpend(
      `${plan.charged.length} ${plan.charged.length === 1 ? "person" : "people"} enriched · ${plan.total.toLocaleString()} credits · ${after.toLocaleString()} left`,
    )
    onOpenChange(false)
  }

  return (
    <Panel
      id="x-enrich"
      title="Reveal and enrich"
      open={open}
      onOpenChange={onOpenChange}
      footer={
        <div className="w-full space-y-2">
          <Button className="w-full" disabled={plan.charged.length === 0} onClick={spend}>
            {overLimit
              ? `Reveal ${plan.charged.length} · ${plan.total.toLocaleString()} credits · over your limit`
              : noCredits
                ? `Reveal ${plan.charged.length} · no credits left`
                : `Reveal ${plan.charged.length} · ${plan.total.toLocaleString()} credits`}
          </Button>
          {overLimit && (
            <p className="text-xs">
              Your limit is {limit!.toLocaleString()} credits a month; {spent.toLocaleString()} used.{" "}
              {admin ? `${admin.user} (${admin.title}) can raise it.` : "Your admin can raise it."}
            </p>
          )}
          {noCredits && (
            <p className="text-xs">
              The workspace has {seed.credits.balance.toLocaleString()} credits left.{" "}
              {admin ? `${admin.user} (${admin.title}) can add more.` : "Your admin can add more."}
            </p>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        <fieldset>
          <legend className="pb-2 text-xs font-medium text-muted-foreground">What to reveal</legend>
          <div className="space-y-1.5">
            {REVEAL_OPTIONS.map((o) => (
              <label key={o.id} className="flex cursor-pointer items-start gap-2 rounded-md p-2.5 hover:bg-muted has-[:checked]:bg-muted">
                <input
                  type="radio"
                  name="reveal"
                  className="mt-1"
                  checked={choice === o.id}
                  onChange={() => setChoice(o.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">{o.label}</span>
                  <span className="block text-sm tabular-nums">· {o.perRow} credits each</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <Card className="py-3"><CardContent className="px-3"><dl className="space-y-1.5">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Selected</dt>
            <dd className="tabular-nums">{rows.length.toLocaleString()}</dd>
          </div>
          {plan.skipped.length > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">
                {choice === "email" ? "Enriched in the last 30 days — skipped, no charge" : "Email and mobile already on file — skipped, no charge"}
              </dt>
              <dd className="tabular-nums">{plan.skipped.length.toLocaleString()}</dd>
            </div>
          )}
          {plan.excluded.length > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Do-not-call — excluded</dt>
              <dd className="tabular-nums">{plan.excluded.length.toLocaleString()}</dd>
            </div>
          )}
          <Separator />
          <div className="flex justify-between gap-3">
            <dt>Charged</dt>
            <dd className="tabular-nums">{plan.charged.length.toLocaleString()} × {option.perRow}</dd>
          </div>
          <div className="flex justify-between gap-3 font-medium">
            <dt>Total</dt>
            <dd className="tabular-nums">{plan.total.toLocaleString()} credits</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Balance after</dt>
            <dd className="tabular-nums">{after.toLocaleString()} credits</dd>
          </div>
        </dl></CardContent></Card>

        {/* The exclusion is stated with its count and can be overridden on purpose, never applied
            silently: a mobile for a do-not-call record is charged and cannot be called. */}
        {choice === "email-mobile" && plan.dnc.length > 0 && (
          <Alert>
            <AlertDescription className="flex-col items-start gap-2">
            <p>
              {plan.dnc.length} of {rows.length} carry a do-not-call flag; a mobile for those is charged and
              cannot be called — {includeDnc ? "included" : "excluded"}.
            </p>
            <Button size="sm" variant="outline" onClick={() => setIncludeDnc((v) => !v)}>
              {includeDnc ? `Leave the ${plan.dnc.length} out again` : "Include them anyway"}
            </Button>
            </AlertDescription>
          </Alert>
        )}

      </div>
    </Panel>
  )
}
