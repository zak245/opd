// The briefing: the thirty seconds a returning person gets before they decide anything.
//
// One sentence, the spend against the cap, and one tile per agent saying what it is allowed to do,
// what it never does without a person, and what it has actually done for the person reading it.
// There is no confidence badge here or anywhere else on the page: no threshold behind one has been
// calibrated against outcomes, and an uncalibrated number is read as a guarantee.
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { href } from "@/app/router"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Fields, Section, type Field } from "../../layouts"
import { Actions } from "../../ui/Actions"
import { Chip, FamilyIcon } from "../../ui/Identity"
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
  /** The digest, in parts: a card body holds facts, not a sentence about them (LAYOUTS.md §2). */
  digest: { since: string; agents: number; events: number; waiting: number; exceptions: number }
  /** A run that stopped at its daily credit cap, if one did. A credit fact, not a decision. */
  capped: { text: string; at: string } | null
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

/**
 * The exceptions: the page's Alert part, above the cards and never inside one (LAYOUTS.md §2).
 * One line per exception with its own acts on that line, and nothing here when nothing is wrong.
 */
export function Exceptions({ rules, exceptions, onResume }: {
  rules: RuleFlags
  exceptions: Exception[]
  onResume: (id: string) => void
}) {
  if (exceptions.length === 0) return null
  const capLine = exceptions.findIndex((x) => x.id.startsWith("cap-"))
  const pauseLine = exceptions.findIndex((x) => !x.id.startsWith("cap-"))
  return (
    <Alert variant={pauseLine >= 0 ? "destructive" : "default"} className="mb-3">
      <AlertTitle className="line-clamp-none">
        {exceptions.length} {exceptions.length === 1 ? "exception" : "exceptions"}
      </AlertTitle>
      <AlertDescription className="grid gap-1.5">
        {exceptions.map((x, i) => (
          <div key={x.id}
            data-item={i === capLine ? "exc.cap-reached" : i === pauseLine ? "exc.paused" : `exc.line.${x.id}`}
            data-item-label={i === capLine ? "An agent stopped at its credit cap" : "Outreach paused and why"}
            data-container={`exception.${x.id}`} data-container-label="the exception line"
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="w-full min-w-0 sm:flex-1">{x.text}</span>
            {/* Rule 5: the control sits on the line it belongs to, not in a row under the block. */}
            {/* Two comparable acts, so neither is filled (DESIGN.md §1). */}
            {x.resume && rules.r5 && (
              <Actions surface="card" items={[
                { kind: "secondary", label: "Resume", onClick: () => onResume(x.id), dataItem: i === pauseLine ? "exc.resume" : `exc.resume.${x.id}`, dataItemLabel: "Resume or keep paused" },
                { kind: "secondary", label: "Keep paused", onClick: () => document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: "Kept paused. Nothing is sent." })) },
              ]} />
            )}
            {x.href && <a className="underline underline-offset-4" href={href(x.href)}>{x.hrefLabel}</a>}
          </div>
        ))}
        {!rules.r5 && exceptions.some((x) => x.resume) && (
          <div className="pt-1">
            <Actions surface="card" items={[{
              kind: "secondary", label: "Resume paused items",
              onClick: () => onResume(exceptions.find((x) => x.resume)!.id),
              dataItem: "exc.resume", dataItemLabel: "Resume or keep paused",
            }]} />
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

/**
 * A tile's fields. The same label-and-value pairs as `Fields`, stacked, because a tile is a third
 * of the page wide and `Fields` sets its label column from the viewport rather than from the card:
 * in a 340 px tile "Never without a person" beside its value squeezed the value to five lines.
 * Swap this for `Fields` when the shared part can read its container.
 */
function TileFields({ fields }: { fields: Field[] }) {
  return (
    <dl className="grid gap-2">
      {fields.map((f) => (
        <div key={f.id ?? f.label} className="grid gap-0.5">
          <dt className="t-label text-muted-foreground">{f.label}</dt>
          <dd className="t-body min-w-0">
            {f.value}
            {f.note && <div className="t-small text-muted-foreground">{f.note}</div>}
            {f.action && <div className="mt-1">{f.action}</div>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** "sending an email, enrolling anyone" as one value: first letter up, the rest as written. */
function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function Briefing(p: BriefingProps) {
  const { seed, session, d, spend, rules } = p
  const third = gate("agents.third", session.business)
  const missing = p.agents.length < 3
  const settingsLink = session.role === "admin"
    ? <a className="underline underline-offset-4" href={href("/ollopa/settings/agents")}>Agent settings</a>
    : <span>Agent settings are changed by {p.admin ? `${p.admin.user}, ${p.admin.title}` : "your admin"}.</span>

  const pct = Math.min(100, Math.round((spend.week / Math.max(1, spend.weekCap)) * 100))

  return (
    <>
      {/* The briefing is one container: what has happened, then the two bands a person reads before
          deciding anything. A band is container-low, never a second box (DESIGN.md §5). */}
      <Section
        data-container="briefing" data-container-label="the briefing"
        heading={p.workspace
          ? <span data-item="brief.workspace" data-item-label="Which client workspace this page shows">{p.workspace}</span>
          : "Since you last looked"}
      >
        <Fields fields={[
          { id: "since", label: "Since", value: p.digest.since, "data-item": "brief.digest", "data-item-label": "Since you last looked" },
          { id: "ran", label: "The agents ran", value: `${p.digest.agents} ${p.digest.agents === 1 ? "agent" : "agents"} · ${p.digest.events} events` },
          { id: "waiting", label: "Waiting for you", value: <span className="tabular-nums">{p.digest.waiting}</span> },
          ...(p.digest.exceptions > 0
            ? [{ id: "exceptions", label: "Exceptions", value: <span className="tabular-nums">{p.digest.exceptions}</span> }]
            : []),
          {
            id: "week", label: "Credits this week",
            value: (
              <span data-item="brief.credits-week" data-item-label="Credits this week against the cap" className="tabular-nums">
                {spend.week.toLocaleString()} of {spend.weekCap.toLocaleString()}
              </span>
            ),
            note: (
              <Progress
                value={pct}
                // The accent is the bar; past the cap it is the danger role. Both are the library's
                // own tokens on its own slot — nothing here paints a colour of its own.
                className={cn("mt-1 w-40", pct > 85 && "[&_[data-slot=progress-indicator]]:bg-destructive")}
                aria-label={`${spend.week.toLocaleString()} credits this week of the agents' ${spend.weekCap.toLocaleString()} weekly cap`}
              />
            ),
          },
          ...(d.atLevelOne("brief.credits-today")
            ? [{
              id: "today", label: "Spent today",
              value: <span data-item="brief.credits-today" data-item-label="Credits spent today" className="tabular-nums">{spend.today.toLocaleString()}</span>,
            }]
            : []),
          ...(p.capped
            ? [{
              id: "capped", label: "Stopped at its cap",
              value: <span data-item="exc.cap-reached" data-item-label="An agent stopped at its credit cap">{p.capped.text}</span>,
              note: "Work that spends credits waits for the cap to reset at 00:00",
            }]
            : []),
          {
            id: "balance", label: "Workspace balance",
            value: <span data-item="credits.balance" data-item-label="Workspace credit balance" className="tabular-nums">{spend.balance.toLocaleString()}</span>,
          },
          ...(seed.agents.length > 0
            ? [{
              id: "second", label: "A second approval",
              value: `Over ${seed.secondApproval.recipients.toLocaleString()} recipients · over ${seed.secondApproval.credits.toLocaleString()} credits`,
            }]
            : []),
          // The admin's own way in is the page header's; this row is for the seat that has none.
          ...(session.role !== "admin"
            ? [{
              id: "settings", label: "Agent settings",
              value: <span data-item="set.link" data-item-label="Agent settings, or who can change them">{settingsLink}</span>,
            }]
            : []),
          ...(!rules.r4
            ? [{
              id: "scoring", label: "Scoring rules",
              value: (
                <a data-item="set.scoring-link" data-item-label="Scoring rules, or who can change them"
                  className="underline underline-offset-4" href={href("/ollopa/settings/scoring")}>Scoring rules →</a>
              ),
            }]
            : []),
        ] as Field[]} />
      </Section>

      {/* The one place a card per thing is right: each agent is read on its own, so each tile is its
          own container and every tile in the set has the same structure (DESIGN.md §5). */}
      <ul className={cn("grid items-stretch gap-3", d.atLevelOne("brief.status") ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-3")}>
        {p.agents.map((a) => {
          const paused = p.pausedHere[a.id] || !a.on
          const track = p.trackOf(a)
          const selected = p.filterAgent === a.name
          return (
            <li key={a.id} data-item={`brief.tile.${a.id}`} data-item-label={a.name}
              data-container={`tile.${a.id}`} data-container-label={`the ${a.name} tile`}>
            <Card className={cn("h-full gap-3 py-4", selected && "ring-2 ring-ring")}>
              <CardHeader>
                <CardTitle className="t-label inline-flex items-center gap-2">
                  <FamilyIcon of="agents" />
                  {/* Rule 8: the tile becomes a one-click filter for the ledger below it. */}
                  {rules.r8 ? (
                    <button className="text-left hover:underline" aria-pressed={selected}
                      onClick={() => p.onFilterAgent(selected ? "all" : a.name)}>{a.name}</button>
                  ) : (
                    <span>{a.name}</span>
                  )}
                </CardTitle>
                <CardAction><Chip status={paused ? "paused" : "active"}>{paused ? "Paused" : "On"}</Chip></CardAction>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-2">
              <TileFields fields={[
                { id: "runs", label: "Runs today", value: <span className="tabular-nums">{p.runsToday(a)}</span> },
                { id: "spent", label: "Credits today", value: <span className="tabular-nums">{a.spentToday.toLocaleString()} of {a.capPerDay.toLocaleString()}</span> },
                // What it can do is education and lives on the library site. What it may never do
                // alone is an approval limit, which is decision-critical and stays (BUILD-BRIEF).
                ...(d.atLevelOne("brief.status")
                  ? [{ id: "approval", label: "Never without a person", value: sentenceCase(a.needsApprovalFor.join(" · ")) }]
                  : []),
                ...(d.atLevelOne("brief.track-record") && track.proposed > 0
                  ? [{
                    id: "track", label: "Last 30 days for you",
                    value: `${track.proposed} proposed · ${track.approved} approved · ${track.declined} declined`,
                    note: `${track.waiting} still waiting`,
                  }]
                  : []),
                // The research agent keeps reading a saved list: what it is reading, what it has
                // spent, and the switch that stops it, on the row it belongs to.
                ...(a.id === "research" && p.watch
                  ? [{
                    id: "watch", label: "Watching", value: `“${p.watch.list}”`,
                    note: `${p.watch.done} companies read · ${p.watch.credits.toLocaleString()} credits so far`,
                    action: (
                      <label className="t-small flex items-center gap-1.5">
                        <Switch checked={p.watching} onCheckedChange={p.onWatch} aria-label={`Watch “${p.watch.list}”`} />
                        <span>{p.watching ? "Watching" : "Off"}</span>
                      </label>
                    ),
                  }]
                  : []),
                // Rule 4: the link sits on the thing it opens, and is removed rather than left dead.
                ...(a.id === "scoring" && rules.r4
                  ? [{
                    id: "scoring", label: "Scoring rules",
                    value: (
                      <span data-item="set.scoring-link" data-item-label="Scoring rules, or who can change them">
                        {session.role === "admin" || session.role === "marketer"
                          ? <a className="underline underline-offset-4" href={href("/ollopa/settings/scoring")}>Scoring rules →</a>
                          : <>Changed by {p.admin ? `${p.admin.user}, ${p.admin.title}` : "your admin"}</>}
                      </span>
                    ),
                  }]
                  : []),
              ] as Field[]} />

              {/* A seat that may not pause an agent sees no control at all, not a grey one. */}
              {p.canPause && (
                <Actions className="mt-auto pt-1" surface="card" items={[{
                  kind: "secondary",
                  label: paused ? "Resume" : "Pause",
                  onClick: () => p.onPause(a, !paused),
                  dataItem: `set.pause-agent.${a.id}`,
                  dataItemLabel: `Pause ${a.name} now`,
                }]} />
              )}
              </CardContent>
            </Card>
            </li>
          )
        })}

        {/* The agent this workspace does not run, in its place, with its description intact. */}
        {missing && (
          <li>
          <Card className="h-full gap-3 border-dashed py-4">
            <CardHeader>
              <CardTitle className="t-label inline-flex items-center gap-2">
                <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                Scoring agent
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-2">
            <TileFields fields={[{ id: "approval", label: "Never without a person", value: "Changing the primary score model" }]} />
            {third.locked ? (
              <div className="mt-auto pt-1">
                <Locked feature="A third agent" plan={third.plan} pricePerMonth={third.pricePerMonth} what={third.what}>
                  <Actions surface="card" items={[{ kind: "secondary", label: "Turn the scoring agent on" }]} />
                </Locked>
                <p className="t-small mt-1.5 tabular-nums text-muted-foreground">{third.plan} · {dollars(third.pricePerMonth)} a month for this workspace.</p>
              </div>
            ) : (
              <p className="t-small mt-auto pt-1">
                {session.role === "admin"
                  ? <a className="underline underline-offset-4" href={href("/ollopa/settings/agents")}>Turn the scoring agent on</a>
                  : <>{p.admin ? `${p.admin.user}, ${p.admin.title}` : "Your admin"} can turn the scoring agent on.</>}
              </p>
            )}
            </CardContent>
          </Card>
          </li>
        )}
      </ul>
    </>
  )
}
