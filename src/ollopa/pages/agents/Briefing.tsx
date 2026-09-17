// The briefing: the thirty seconds a returning person gets before they decide anything.
//
// One sentence, the spend against the cap, and one tile per agent saying what it is allowed to do,
// what it never does without a person, and what it has actually done for the person reading it.
// There is no confidence badge here or anywhere else on the page: no threshold behind one has been
// calibrated against outcomes, and an uncalibrated number is read as a guarantee.
import { Bot, Lock, Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { href } from "@/app/router"
import { Locked } from "../../ui/Locked"
import { gate, money as dollars } from "../../ui/gate"
import type { Disclosure } from "../../ui/useDisclosure"
import type { Agent, Seed } from "../../data/seed"
import type { Session } from "../../session"
import type { RuleFlags, TrackRecord, Watch, Exception, Spend } from "./model"

export interface BriefingProps {
  /** Which of the case's six rules have landed. Every flag is true in the product. */
  rules: RuleFlags
  seed: Seed
  session: Session
  d: Disclosure
  spend: Spend
  sentence: string
  workspace: string | null
  agents: Agent[]
  pausedHere: Record<string, boolean>
  onPause: (agent: Agent, paused: boolean) => void
  trackOf: (agent: Agent) => TrackRecord
  runsToday: (agent: Agent) => number
  watch: Watch | null
  watching: boolean
  onWatch: (on: boolean) => void
  canPause: boolean
  admin: { user: string; title: string } | null
  filterAgent: string
  onFilterAgent: (name: string) => void
  exceptions: Exception[]
  onResume: (id: string) => void
}

export function Briefing(p: BriefingProps) {
  const { seed, session, d, spend, rules } = p
  // The exception lines the parody kept as failure reasons on a workflow run: the same two things,
  // now at level one, so they keep their ids across the step (rule 7).
  const capLine = p.exceptions.findIndex((x) => x.id.startsWith("cap-"))
  const pauseLine = p.exceptions.findIndex((x) => !x.id.startsWith("cap-"))
  const third = gate("agents.third", session.business)
  const missing = p.agents.length < 3
  const settingsLink = session.role === "admin"
    ? <a className="underline underline-offset-4" href={href("/ollopa/settings/agents")}>Agent settings</a>
    : <span>Agent settings are changed by {p.admin ? `${p.admin.user}, ${p.admin.title}` : "your admin"}.</span>

  const pct = Math.min(100, Math.round((spend.week / Math.max(1, spend.weekCap)) * 100))

  return (
    <section aria-labelledby="agents-briefing" data-container="briefing" data-container-label="the briefing">
      <h2 id="agents-briefing" className="sr-only">Briefing</h2>

      {p.workspace && <p data-item="brief.workspace" data-item-label="Which client workspace this page shows"
        className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{p.workspace}</p>}

      <p data-item="brief.digest" data-item-label="Since you last looked" className="text-sm">{p.sentence}</p>

      {/* Spend is decision-critical, so it is here at every width and on every role's page. */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <div data-item="brief.credits-week" data-item-label="Credits this week against the cap" className="h-1.5 w-40 overflow-hidden rounded-full bg-muted" role="img"
          aria-label={`${spend.week.toLocaleString()} credits this week of the agents' ${spend.weekCap.toLocaleString()} weekly cap`}>
          <div className={cn("h-full rounded-full", pct > 85 ? "bg-destructive" : "bg-foreground")} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm tabular-nums">
          {spend.week.toLocaleString()} credits this week of {spend.weekCap.toLocaleString()}
        </span>
        {d.atLevelOne("brief.credits-today") && (
          <span data-item="brief.credits-today" data-item-label="Credits spent today"
            className="text-sm tabular-nums text-muted-foreground">{spend.today.toLocaleString()} today</span>
        )}
        <span data-item="credits.balance" data-item-label="Workspace credit balance"
          className="text-sm tabular-nums text-muted-foreground">Workspace balance {spend.balance.toLocaleString()}</span>
      </div>

      {/* Exceptions exist only while something is paused or capped. Nothing here when nothing is wrong. */}
      {p.exceptions.length > 0 && (
        <div role="status" className="mt-3 grid gap-1.5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/40">
          {p.exceptions.map((x, i) => (
            <div key={x.id}
              data-item={i === capLine ? "exc.cap-reached" : i === pauseLine ? "exc.paused" : `exc.line.${x.id}`}
              data-item-label={i === capLine ? "An agent stopped at its credit cap" : "Outreach paused and why"}
              data-container={`exception.${x.id}`} data-container-label="the exception line"
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="w-full min-w-0 sm:flex-1">{x.text}</span>
              {/* Rule 5: the control sits on the line it belongs to, not in a row under the block. */}
              {x.resume && rules.r5 && <Button data-item={i === pauseLine ? "exc.resume" : `exc.resume.${x.id}`} data-item-label="Resume or keep paused" size="sm" variant="outline" className="h-7" onClick={() => p.onResume(x.id)}>Resume</Button>}
              {x.resume && rules.r5 && <Button size="sm" variant="ghost" className="h-7" onClick={() => document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: "Kept paused. Nothing is sent." }))}>Keep paused</Button>}
              {x.href && <a className="underline underline-offset-4" href={href(x.href)}>{x.hrefLabel}</a>}
            </div>
          ))}
          {!rules.r5 && p.exceptions.some((x) => x.resume) && (
            <div className="pt-1">
              <Button data-item="exc.resume" data-item-label="Resume or keep paused" size="sm" variant="outline" className="h-7"
                onClick={() => p.onResume(p.exceptions.find((x) => x.resume)!.id)}>Resume paused items</Button>
            </div>
          )}
        </div>
      )}

      <ul className={cn("mt-4 grid gap-3", d.atLevelOne("brief.status") ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-3")}>
        {p.agents.map((a) => {
          const paused = p.pausedHere[a.id] || !a.on
          const track = p.trackOf(a)
          const selected = p.filterAgent === a.name
          return (
            <li key={a.id} data-item={`brief.tile.${a.id}`} data-item-label={a.name}
              data-container={`tile.${a.id}`} data-container-label={`the ${a.name} tile`}
              className={cn("rounded-lg border p-3", selected && "ring-2 ring-ring")}>
              <div className="flex items-start gap-2">
                <Bot className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {/* Rule 8: the tile becomes a one-click filter for the ledger below it. */}
                {rules.r8 ? (
                  <button
                    className="min-w-0 flex-1 text-left text-sm font-medium hover:underline"
                    aria-pressed={selected}
                    onClick={() => p.onFilterAgent(selected ? "all" : a.name)}
                  >
                    {a.name}
                  </button>
                ) : (
                  <span className="min-w-0 flex-1 text-sm font-medium">{a.name}</span>
                )}
                <span className="shrink-0 text-xs text-muted-foreground">{paused ? "Paused" : "On"}</span>
              </div>

              <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                {p.runsToday(a)} runs today · {a.spentToday.toLocaleString()} of {a.capPerDay.toLocaleString()} credits today
              </p>

              {d.atLevelOne("brief.status") && (
                <>
                  <p className="mt-2 text-xs">It can: {a.can.join(", ").toLowerCase()}.</p>
                  <p className="mt-0.5 text-xs">It never does this without a person: {a.needsApprovalFor.join(", ").toLowerCase()}.</p>
                </>
              )}

              {d.atLevelOne("brief.track-record") && track.proposed > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Last 30 days for you: {track.proposed} proposals · you approved {track.approved}, declined {track.declined}, {track.waiting} still waiting.
                </p>
              )}

              {/* The research agent keeps reading a saved list. Its running total, and the switch that stops it. */}
              {a.id === "research" && p.watch && (
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md bg-muted px-2 py-1.5 text-xs">
                  <span className="min-w-0 flex-1 tabular-nums">
                    Watching “{p.watch.list}”: {p.watch.done} companies read, {p.watch.credits.toLocaleString()} credits so far
                  </span>
                  <label className="flex shrink-0 items-center gap-1.5">
                    <Switch checked={p.watching} onCheckedChange={p.onWatch} aria-label={`Watch “${p.watch.list}”`} />
                    <span>{p.watching ? "Watching" : "Off"}</span>
                  </label>
                </div>
              )}

              {/* Rule 4: the link sits on the thing it opens, and is removed rather than left dead. */}
              {a.id === "scoring" && rules.r4 && (
                <p data-item="set.scoring-link" data-item-label="Scoring rules, or who can change them" className="mt-2 text-xs">
                  {session.role === "admin" || session.role === "marketer"
                    ? <a className="underline underline-offset-4" href={href("/ollopa/settings/scoring")}>Scoring rules →</a>
                    : <>Scoring rules are changed by {p.admin ? `${p.admin.user}, ${p.admin.title}` : "your admin"}.</>}
                </p>
              )}

              {p.canPause && (
                <div className="mt-3">
                  <Button data-item={`set.pause-agent.${a.id}`} data-item-label={`Pause ${a.name} now`}
                    size="sm" variant="outline" className="h-7" onClick={() => p.onPause(a, !paused)}>
                    {paused ? <><Play className="size-3.5" aria-hidden="true" />Resume</> : <><Pause className="size-3.5" aria-hidden="true" />Pause</>}
                  </Button>
                </div>
              )}
            </li>
          )
        })}

        {/* The agent this workspace does not run, in its place, with its description intact. */}
        {missing && (
          <li className="rounded-lg border border-dashed p-3">
            <div className="flex items-start gap-2">
              <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1 text-sm font-medium">Scoring agent</span>
            </div>
            <p className="mt-2 text-xs">It can: score a person or company, explain the score from its inputs.</p>
            <p className="mt-0.5 text-xs">It never does this without a person: changing the primary score model.</p>
            {third.locked ? (
              <div className="mt-3">
                <Locked feature="A third agent" plan={third.plan} pricePerMonth={third.pricePerMonth} what={third.what}>
                  <Button size="sm" variant="outline" className="h-7">Turn the scoring agent on</Button>
                </Locked>
                <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">{third.plan} · {dollars(third.pricePerMonth)} a month for this workspace.</p>
              </div>
            ) : (
              <p className="mt-3 text-xs">
                {session.role === "admin"
                  ? <a className="underline underline-offset-4" href={href("/ollopa/settings/agents")}>Turn the scoring agent on</a>
                  : <>{p.admin ? `${p.admin.user}, ${p.admin.title}` : "Your admin"} can turn the scoring agent on.</>}
              </p>
            )}
          </li>
        )}
      </ul>

      <p className="mt-3 text-xs text-muted-foreground">
        <span data-item="set.link" data-item-label="Agent settings, or who can change them">{settingsLink}</span>{" "}
        {!rules.r4 && (
          <a data-item="set.scoring-link" data-item-label="Scoring rules, or who can change them"
            className="underline underline-offset-4" href={href("/ollopa/settings/scoring")}>Scoring rules →</a>
        )}{" "}
        {seed.agents.length > 0 && <>Second approval above {seed.secondApproval.recipients.toLocaleString()} recipients or {seed.secondApproval.credits.toLocaleString()} credits in one action.</>}
      </p>
    </section>
  )
}
