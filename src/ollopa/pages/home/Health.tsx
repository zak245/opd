// The health strip and the set-up door: the state of the workspace, above everything, without a click.
//
// Only what needs attention gets a line of its own; what is fine is one sentence, because the bounce
// guard state and the credit burn are decisions and are never behind a door. A bounce trip links to
// where it is fixed, which is a different place in each of three cases: the paused sequence when one
// sequence tripped, Sequences filtered to auto-paused when several did, and Settings when the trip is
// mailbox-level and belongs to no single sequence.
import { useState } from "react"
import { href } from "@/app/router"
import { follow } from "../../chain"
import { originHere } from "../work/register"
import { toast } from "../../templates/TablePage"
import { Button } from "@/components/ui/button"
import { Door, type Disclosure, type HealthLine } from "../../ui"
import type { HomeData, SetupRow } from "./data"
import { count } from "./format"

const RANK = { error: 0, warning: 1, info: 2 }

export function healthLines(data: HomeData, d: Disclosure): HealthLine[] {
  const h = data.health
  // The strip carries an item for the seats that actually watch it: the seat's weekly use of the item,
  // not just whether the seat has it at all. Credit burn is the exception — it is the price of the
  // workspace, so anyone who holds it sees it (spec 01 §3.8, the strip row).
  const holds = (id: string) => d.weekly(id) >= 8
  const lines: HealthLine[] = []

  if (holds("home.health.bounce") && h.bounceGuard !== "ok") {
    lines.push({
      kind: h.bounceGuard === "paused" ? "error" : "warning",
      text: h.bounceGuard === "paused"
        ? `Bounce guard paused sending · ${h.bounceRate}% of ${count(h.bounceVolume)} sent — it pauses at ${h.guard.pausePercent}%`
        : `Bounce ${h.bounceRate}% · the guard warns at ${h.guard.warnPercent}% and pauses at ${h.guard.pausePercent}%`,
      href: href(h.bounceHref),
    })
  }

  if (holds("home.agents.paused") && h.pausedOutreach > 0) {
    lines.push({
      kind: "warning",
      text: `An agent paused outreach in ${h.pausedOutreach} place${h.pausedOutreach === 1 ? "" : "s"}`,
      href: href("/ollopa/agents?filter=paused"),
    })
  }

  if (holds("home.health.mailboxes") && h.mailboxesNearLimit > 0) {
    lines.push({
      kind: "warning",
      text: `${h.mailboxesNearLimit} mailbox${h.mailboxesNearLimit === 1 ? "" : "es"} near the daily limit`,
      href: href("/ollopa/settings/email-sending?row=mail.mailboxes"),
    })
  }

  if (holds("home.health.sync") && h.syncErrors > 0) {
    lines.push({
      kind: "warning",
      text: `${h.crmName}: ${h.syncErrors} record${h.syncErrors === 1 ? "" : "s"} did not sync`,
      href: href("/ollopa/settings/integrations?row=int.error-log"),
    })
  }

  if (d.weekly("home.health.credits") > 0) {
    const tight = h.daysOfCredit <= 21
    lines.push({
      kind: tight ? "warning" : "info",
      text: tight
        ? `Credits: at ${count(h.credits.burnPerWeek)} a week the cap is reached on ${h.runsOutOn}`
        : `Credits on track · ${count(h.credits.balance)} left, ${count(h.credits.burnPerWeek)} a week, cap reached ${h.runsOutOn}`,
      href: href("/ollopa/settings/plan?row=plan.credits"),
    })
  }

  if (holds("home.health.invites") && h.invitesPending > 0) {
    lines.push({
      kind: "info",
      text: `${h.invitesPending} invitation${h.invitesPending === 1 ? "" : "s"} not accepted`,
      href: href("/ollopa/settings/team?row=team.users"),
    })
  }

  if (holds("home.health.bounce") && h.bounceGuard === "ok") {
    const clean = holds("home.health.sync") && h.syncErrors === 0
    lines.push({
      kind: "info",
      text: `Sending healthy · bounce ${h.bounceRate}%${clean ? " · sync clean" : ""}`,
      href: href("/ollopa/settings/email-sending?row=mail.bounce-guard"),
    })
  }

  return lines.sort((a, b) => RANK[a.kind] - RANK[b.kind])
}

/** True when a line needs a human: the strip carries a border as well as the words (never colour alone). */
export function needsAttention(lines: HealthLine[]): boolean {
  return lines.some((l) => l.kind !== "info")
}

/**
 * The steps the workspace has not finished. A row leaves when its answer is done or declared —
 * "ollopA is our CRM" removes the CRM row — and the door is removed, not disabled, when the list empties.
 */
export function SetupDoor({ rows }: { rows: SetupRow[] }) {
  const [declared, setDeclared] = useState<Record<string, string>>({})
  const live = rows.filter((r) => !declared[r.id])
  if (live.length === 0) return null
  const nouns = [...new Set(live.map((r) => r.noun))].join(", ")
  const answered = rows.filter((r) => declared[r.id])

  return (
    <div className="border-b px-4 py-1 sm:px-6">
      <Door id="home.health.setup" label={`Not set up yet: ${nouns}`} count={live.length}>
        <ul className="divide-y">
          {live.map((r) => (
            <li key={r.id} data-item={r.id} data-item-label={r.noun} className="flex flex-wrap items-center gap-2 py-1.5 text-xs">
              <span className="min-w-0 flex-1">{r.text}</span>
              {/* A set-up step is a page in Settings: the trail keeps Home and this row, so
                  finishing it comes back to the door still open and the row lit. */}
              <button type="button" className="shrink-0 underline underline-offset-4"
                      onClick={() => follow(r.href, originHere(r.id))}>
                Open
              </button>
              {r.declare && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 shrink-0 px-2 text-xs"
                  onClick={() => { setDeclared((x) => ({ ...x, [r.id]: r.declare! })); toast(`Saved · ${r.declare}`) }}
                >
                  {r.declare}
                </Button>
              )}
            </li>
          ))}
          {answered.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2 py-1.5 text-xs text-muted-foreground">
              <span className="min-w-0 flex-1">{r.noun}: {declared[r.id]}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 shrink-0 px-2 text-xs"
                onClick={() => setDeclared((x) => { const next = { ...x }; delete next[r.id]; return next })}
              >
                Change this
              </Button>
            </li>
          ))}
        </ul>
      </Door>
    </div>
  )
}
