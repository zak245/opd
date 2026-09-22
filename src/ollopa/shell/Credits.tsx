// The credits pill and the credit breakdown panel.
//
// The pill is the workspace's running meter: balance, this week's burn, and the run-out date when it
// falls inside the billing period. It is decision-critical, so it never collapses to an icon, it is on
// every page at every width, and its tone is written out in the tooltip so colour is never the only
// signal (rule 7). Clicking it opens the breakdown on its own channel, over the page — spend by
// feature, by person and by surface, every row a link to the job, the person or the key.
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { href } from "@/app/router"
import { seedFor, type Surface } from "../data/seed"
import type { Session } from "../session"
import { Panel } from "../ui/Panel"
import { runwayWeeks, shortDate, TODAY } from "./notifications"

export function credits(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "") + "k"
  return String(n)
}

type Tone = "neutral" | "warning" | "error"

function toneOf(weeks: number): Tone {
  return weeks < 1 ? "error" : weeks < 2 ? "warning" : "neutral"
}

const TONE_WORDS: Record<Tone, string> = {
  neutral: "Balance is comfortable at this rate.",
  warning: "Balance runs out in under two weeks at this rate.",
  error: "Balance runs out in under a week at this rate.",
}

const SURFACE_LABEL: Record<Surface, string> = {
  app: "App",
  automation: "Automation",
  api: "API",
  mcp: "MCP",
  cli: "CLI",
  agent: "Agents",
}

const SURFACE_LINK: Record<Surface, string> = {
  app: "/ollopa/people",
  automation: "/ollopa/workflows",
  api: "/ollopa/settings/developer",
  mcp: "/ollopa/settings/developer",
  cli: "/ollopa/settings/developer",
  agent: "/ollopa/agents",
}

interface SpendRow { label: string; amount: number; href: string; note?: string }

function Group({ title, rows }: { title: string; rows: SpendRow[] }) {
  const [all, setAll] = useState(false)
  const shown = all ? rows : rows.slice(0, 5)
  return (
    <section className="border-t px-5 py-3">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
      <ul className="mt-2 grid gap-1.5">
        {shown.map((r) => (
          <li key={r.label} className="flex items-baseline gap-3 text-sm">
            <a className="min-w-0 flex-1 truncate underline-offset-4 hover:underline" href={href(r.href)}>{r.label}</a>
            {r.note && <span className="shrink-0 text-xs text-muted-foreground">{r.note}</span>}
            <span className="shrink-0 tabular-nums text-muted-foreground">{credits(r.amount)}</span>
          </li>
        ))}
      </ul>
      {rows.length > 5 && !all && (
        <button className="mt-2 text-sm underline underline-offset-4" onClick={() => setAll(true)}>
          Show the rest ({rows.length - 5})
        </button>
      )}
    </section>
  )
}

export function CreditsPanel({ session, open, onOpenChange }: { session: Session; open: boolean; onOpenChange: (o: boolean) => void }) {
  const seed = seedFor(session.business)
  const c = seed.credits
  const weeks = runwayWeeks(session.business)
  const tone = toneOf(weeks)
  const projection = Math.round(c.burnPerWeek * 4.33)

  const byFeature: SpendRow[] = [...c.byFeature]
    .sort((a, b) => b.credits - a.credits)
    .map((f) => ({ label: f.feature, amount: f.credits, href: "/ollopa/agents" }))
  const byPerson: SpendRow[] = [...c.byUser]
    .sort((a, b) => b.used - a.used)
    .map((u) => ({ label: u.user, amount: u.used, href: "/ollopa/settings/team", note: u.limit ? `of ${credits(u.limit)}` : undefined }))
  const bySurface: SpendRow[] = (Object.keys(c.bySurface) as Surface[])
    .map((s) => ({ label: SURFACE_LABEL[s], amount: c.bySurface[s], href: SURFACE_LINK[s] }))
    .sort((a, b) => b.amount - a.amount)

  return (
    <Panel
      id="credits"
      title="Credits"
      open={open}
      onOpenChange={onOpenChange}
      footer={<a className="text-sm underline underline-offset-4" href={href("/ollopa/settings/plan")}>Settings › Plan, billing and usage › Credit balance and burn rate</a>}
    >
      <div className="pb-3">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-1">
          <div>
            <div className="text-2xl font-semibold tabular-nums">{credits(c.balance)}</div>
            <div className="text-xs text-muted-foreground">Balance</div>
          </div>
          <div>
            <div className="text-2xl font-semibold tabular-nums">{credits(c.burnPerWeek)}</div>
            <div className="text-xs text-muted-foreground">This week</div>
          </div>
          <div>
            <div className="text-2xl font-semibold tabular-nums">{shortDate(c.runsOutOn)}</div>
            <div className="text-xs text-muted-foreground">Runs out</div>
          </div>
        </div>
        <p className={cn("mt-3 text-sm", tone === "error" && "text-destructive", tone === "warning" && "[color:var(--warning-ink)]")}>
          {TONE_WORDS[tone]} About {weeks.toFixed(1)} weeks at this rate.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cap {c.monthlyCap.toLocaleString()} a month, resets {shortDate(c.cycleEnds)}. At this burn the month ends at {projection.toLocaleString()}
          {projection > c.monthlyCap ? `, which is ${(projection - c.monthlyCap).toLocaleString()} over the cap.` : ", inside the cap."}
        </p>
      </div>
      <Group title="By feature" rows={byFeature} />
      <Group title="By person" rows={byPerson} />
      <Group title="By surface" rows={bySurface} />
    </Panel>
  )
}

export function CreditsPill({ session, onOpen, compact }: { session: Session; onOpen: () => void; compact?: boolean }) {
  const seed = seedFor(session.business)
  const c = seed.credits
  const weeks = runwayWeeks(session.business)
  const tone = toneOf(weeks)
  const mine = c.byUser.find((u) => u.user === session.user)
  const insidePeriod = c.runsOutOn <= c.cycleEnds && c.runsOutOn >= TODAY

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* It opens the credits panel, so it is a Button, not a Badge. Ghost, because the number is
            the thing to read; only a tight or spent balance takes a status ink. */}
        <Button
          type="button"
          variant="ghost"
          size={compact ? "xs" : "sm"}
          onClick={onOpen}
          className={cn(
            "shrink-0 tabular-nums",
            tone === "warning" && "[color:var(--warning-ink)]",
            tone === "error" && "text-destructive",
          )}
        >
          {compact
            ? `${credits(c.balance)} · ${credits(c.burnPerWeek)}/wk`
            : `${credits(c.balance)} credits · ${credits(c.burnPerWeek)}/wk${insidePeriod ? ` · out ${shortDate(c.runsOutOn)}` : ""}`}
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>
          Balance and this week's burn. Cap {credits(c.monthlyCap)} per month, resets {shortDate(c.cycleEnds)}. About {weeks.toFixed(1)} weeks at this rate. {TONE_WORDS[tone]}
        </p>
        {mine?.limit != null && (
          <p className="mt-1">Your limit: {credits(Math.max(mine.limit - mine.used, 0))} of {credits(mine.limit)} left this month.</p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
