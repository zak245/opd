// Step 0 of the lesson: the common version, drawn from `specs/13-agents.md` §5 and nothing else.
//
// Apollo has no page called Agents. What this page does is spread across five surfaces, so the
// common version is that spread, on one screen: an AI Assistant chat with "Previous chats ⌄", a
// workflow's Enrollment tab with runs and failure reasons, and a credits page four levels down in
// Settings behind a permission. Every part of it carries its source in a comment. Nothing here is
// invented: if the KB articles do not describe it, it is not on this screen.
//
// The pieces carry the same `data-item` ids the product uses, so the lesson can show each one
// walking from here to where it belongs (`src/learn/delta.ts`).
import { useState, type ReactNode } from "react"
import { ChevronDown, ChevronRight, Lock, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Agent, AgentEvent, Seed } from "../../data/seed"
import type { Session } from "../../session"
import { day } from "../deal/format"
import { draftFor, type Exception, type Run, type Spend } from "./model"

/* ------------------------------------------------------------------------------ a fold */

/**
 * A collapsed place in the parody: a chevron-only "Previous chats ⌄", an inactive workflow tab, the
 * credits page nobody opens. It tags itself the way a container must, so the lesson can tell that a
 * thing inside it is hidden without measuring anything.
 */
function Fold({ id, label, trigger, children, defaultOpen = false, className }: {
  id: string; label: string; trigger: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={className}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        {trigger}
      </button>
      <div data-container={id} data-container-label={label} data-open={open ? "true" : "false"} className={open ? "" : "hidden"}>
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------- the top bar */

/**
 * Apollo's top bar: "a credits balance pill ('1.8M credits'), a black AI Assistant button"
 * (`07-apollo-settings-map.md` §"Global chrome"). The second, "power-up" meter is the one a reviewer
 * was billed from without warning (Robillard, Trustpilot, 18 Aug 2026).
 */
export function ParodyTopBar({ spend, showCredits, showAssistant }: { spend: Spend; showCredits: boolean; showAssistant: boolean }) {
  return (
    <div data-container="apollo.topbar" data-container-label="the top bar"
      className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
      {/* The second meter: "a separate bill for some special 'power up' credits" (Robillard, 18 Aug 2026).
          It counts what the balance pill does not, and it is the only credit number on the page. */}
      {showCredits && (
        <span data-item="credits.powerups" data-item-label="Power-up credits, a second meter"
          className="rounded-full border bg-background px-2 py-0.5 text-xs tabular-nums">
          Power-ups {Math.round(spend.week / 3).toLocaleString()} used
        </span>
      )}
      <span className="text-xs text-muted-foreground">Search or ask a question ⌘K</span>
      {showAssistant && (
        <span data-item="assistant.button" data-item-label="AI Assistant"
          className="ml-auto rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background">
          AI Assistant
        </span>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------- the chat */

export interface ParodyChatProps {
  seed: Seed
  session: Session
  /** Today's events, as the assistant's own messages. */
  recent: AgentEvent[]
  /** Everything older, behind "Previous chats ⌄". */
  older: AgentEvent[]
  /** The confirmations the assistant asks for, inside the conversation. */
  asks: ReactNode
  /** Rule 7 has landed: the confirmations have left, and what is left is logged with an Undo. */
  r7: boolean
  onUndo: (e: AgentEvent) => void
  undone: Record<string, unknown>
}

/**
 * "Click AI Assistant from the nav to open the full-screen experience"; "To view previous chats,
 * click ⌄ beside your current chat title" (KB 39359204112397, 43512338043789). The assistant "asks
 * you to confirm before performing an action that uses credits", in the conversation, at the moment
 * it asks. Neither article describes an activity log, a queue of pending confirmations, or a view of
 * what the assistant did while you were away.
 */
export function ParodyChat(p: ParodyChatProps) {
  return (
    <section aria-label="AI Assistant" className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
        <h2 className="text-sm font-medium">Prospecting and outreach</h2>
        {/* The unlabelled door: a chevron beside the chat title, and nothing else (rule 4, NN/g 2014). */}
        <Fold id="chat.previous" label="Previous chats"
          trigger={<><ChevronDown className="size-4" aria-hidden="true" /><span className="sr-only">Previous chats</span></>}>
          <div className="mt-1 grid gap-1 border-l pl-3">
            {p.older.map((e) => <ChatLine key={e.id} e={e} r7={p.r7} onUndo={() => p.onUndo(e)} undone={!!p.undone[e.id]} />)}
          </div>
        </Fold>
        <span className="ml-auto text-xs text-muted-foreground">Unlimited chats on this plan</span>
      </div>

      <div data-container="chat" data-container-label="the chat" className="grid gap-2 p-3">
        <p className="text-xs text-muted-foreground">
          Sending a message doesn’t use credits. Credits go when the assistant performs a
          credit-consuming action, and it asks you to confirm first.
        </p>
        {p.recent.map((e) => <ChatLine key={e.id} e={e} r7={p.r7} onUndo={() => p.onUndo(e)} undone={!!p.undone[e.id]} />)}
        {p.asks}
      </div>
    </section>
  )
}

/** One thing the assistant says it did. No credits here: those live in Settings (KB 9527776320781). */
function ChatLine({ e, r7, onUndo, undone }: { e: AgentEvent; r7: boolean; onUndo: () => void; undone: boolean }) {
  return (
    <div data-item={`act.row.${e.id}`} data-item-label={e.summary}
      className="flex flex-wrap items-baseline gap-x-2 rounded-md bg-muted/50 px-2 py-1.5 text-sm">
      <span className="min-w-0 flex-1">{e.summary}</span>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{day(e.when)} {e.at}</span>
      {/* Rule 7 cut the queue: what is reversible stopped asking, and got an Undo instead. */}
      {r7 && e.undoable && !undone && (
        <Button variant="ghost" size="sm" className="h-6 shrink-0 px-2 text-xs" onClick={onUndo}>Undo</Button>
      )}
    </div>
  )
}

/**
 * One confirmation, inside the conversation, where Apollo puts it. It names the action and asks. It
 * does not say which mailbox, when it sends, what it costs, or whose item it is: none of that is in
 * the article, so none of it is here.
 */
export function ParodyAsk({ e, seed, itemId, container, onApprove, onDecline }: {
  e: AgentEvent; seed: Seed; itemId: string; container?: string; onApprove: () => void; onDecline: () => void
}) {
  const draft = draftFor(e)
  const what = e.ifApproved?.action === "enrol"
    ? `add ${(e.ifApproved.recipients ?? 0).toLocaleString()} people to “${e.ifApproved.sequence}”`
    : e.ifApproved?.action === "stage" ? `move ${seed.deals.find((d) => d.id === e.dealId)?.company ?? "the deal"} to ${e.ifApproved.stage}`
      : `send this email to ${e.contact}`
  return (
    <div data-item={itemId} data-item-label={e.summary}
      data-container={container} data-container-label={container ? "the item" : undefined}
      className="rounded-md border border-dashed bg-background p-2.5 text-sm">
      <p>I’m ready to {what}. Shall I go ahead?</p>
      {draft && <pre className="mt-1.5 max-h-24 overflow-hidden whitespace-pre-wrap rounded bg-muted p-2 font-sans text-xs">{draft}</pre>}
      <div className="mt-2 flex gap-2">
        <Button data-item={container ? `wait.approve.${e.id}` : undefined} data-item-label="Approve" size="sm" className="h-7" onClick={onApprove}>Confirm</Button>
        <Button data-item={container ? `wait.decline.${e.id}` : undefined} data-item-label="Decline" size="sm" variant="ghost" className="h-7" onClick={onDecline}>Cancel</Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ the workflow */

export interface ParodyWorkflowProps {
  name: string
  runs: Run[]
  agents: Agent[]
  exceptions: Exception[]
  seed: Seed
  /** Before rule 1 the filters and the search still live here, on the Enrollment tab. */
  showFilters: boolean
  /** Before rule 7 the agent tiles are steps of a workflow, on a tab nobody opens. */
  showSteps: boolean
  /** Before rule 7 a failed run is the only place "capped" and "paused" are said. */
  showFailures: boolean
  showSettingsLink: boolean
}

/**
 * "Runs show on the workflow's Enrollment tab: limits, run history, records completed or failed, and
 * failure reasons 'credit limit, missing owner, inactive mailbox'" (KB 4413804036109). The Steps tab
 * holds the rules, actions and agents. Notifications exist only if the builder added a step for them.
 */
export function ParodyWorkflow(p: ParodyWorkflowProps) {
  return (
    <section aria-label="Workflow" className="mt-4 rounded-lg border bg-card">
      <div className="flex flex-wrap items-baseline gap-2 border-b px-3 py-2">
        <h2 className="text-sm font-medium">Workflows › {p.name}</h2>
        <span className="text-xs text-muted-foreground">On · edited 2 days ago</span>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b px-3 py-1.5 text-xs">
        {p.showSettingsLink && (
          <Fold id="tab.overview" label="the Overview tab"
            trigger={<><ChevronRight className="size-3.5" aria-hidden="true" />Overview</>}>
            <p data-item="set.link" data-item-label="Agent settings and credit limits"
              className="px-1.5 py-1 text-xs text-muted-foreground">
              Credit limits: {p.agents[0]?.capPerRun ?? 40} per run, {(p.agents[0]?.capPerDay ?? 0).toLocaleString()} a day. Set on the workflow.
            </p>
          </Fold>
        )}
        <span className="rounded-md bg-muted px-2 py-1 font-medium">Enrollment</span>
        {p.showSteps && (
          <Fold id="tab.steps" label="the Steps tab"
            trigger={<><ChevronRight className="size-3.5" aria-hidden="true" />Steps</>}>
            <ul className="grid gap-1 px-1.5 py-1">
              {p.agents.map((a) => (
                <li key={a.id} data-item={`brief.tile.${a.id}`} data-item-label={a.name}
                  className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                  <Bot className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium">{a.name}</span>
                  <span className="text-muted-foreground">step {p.agents.indexOf(a) + 3}</span>
                </li>
              ))}
            </ul>
          </Fold>
        )}
      </div>

      {p.showFilters && (
        <div data-container="tab.enrollment" data-container-label="the Enrollment tab" className="grid gap-2 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Input data-item="act.search" data-item-label="Search the activity" className="h-8 w-48" placeholder="Search" aria-label="Search" readOnly />
            <ParodySelect id="act.filter-agent" label="Agent" value="Every agent" />
            <ParodySelect id="act.filter-contact" label="Contact or company" value="Any contact or company" />
            <ParodySelect id="act.filter-date" label="Date range" value="Every day" />
            <ParodySelect id="act.filter-person" label="Team member" value="Everyone" />
            <ParodySelect id="act.filter-status" label="Outcome" value="Every outcome" />
            <ParodySelect id="act.filter-kind" label="Kind" value="Every kind" />
            <ParodySelect id="act.surface" label="Surface" value="Every surface" />
          </div>
          <RunTable {...p} />
        </div>
      )}
      {!p.showFilters && (
        <div data-container="tab.enrollment" data-container-label="the Enrollment tab" className="px-3 py-2">
          <RunTable {...p} />
        </div>
      )}
    </section>
  )
}

function RunTable(p: ParodyWorkflowProps) {
  const cap = p.exceptions.find((x) => x.id.startsWith("cap-"))
  const pause = p.exceptions.find((x) => !x.id.startsWith("cap-"))
  return (
    <div className="text-sm">
      <div className="grid grid-cols-[7rem_minmax(0,1fr)_6rem_6rem] gap-2 border-b pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>When</span><span>Run</span><span>Completed</span><span>Failed</span>
      </div>
      <ul className="divide-y">
        {p.runs.map((run) => (
          <li key={run.key} data-item={`run.${run.key}`} data-item-label={`Run: ${run.label}`}
            className="grid grid-cols-[7rem_minmax(0,1fr)_6rem_6rem] gap-2 py-1.5">
            <span className="tabular-nums text-muted-foreground">{day(run.when)} {run.at}</span>
            <span className="min-w-0 truncate">{run.label}{run.reason ? ` · ${run.reason}` : ""}</span>
            <span className="tabular-nums">{run.completed}</span>
            <span className="tabular-nums">{run.failed}</span>
          </li>
        ))}
      </ul>
      {p.showFailures && (
        <div className="mt-2 grid gap-1 border-t pt-2 text-xs text-muted-foreground">
          {cap && <p data-item="exc.cap-reached" data-item-label="An agent stopped at its credit cap">Failed: credit limit. {cap.text}</p>}
          {pause && <p data-item="exc.paused" data-item-label="Outreach paused and why">Failed: inactive mailbox. {pause.text}</p>}
          <p data-item="exc.resume" data-item-label="Resume or keep paused">
            Re-enrol the failed records from the workflow’s ⋯ menu.
          </p>
        </div>
      )}
    </div>
  )
}

function ParodySelect({ id, label, value }: { id: string; label: string; value: string }) {
  return (
    <Select value="all">
      <SelectTrigger data-item={id} data-item-label={label} className="h-8 w-36" aria-label={label}><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="all">{value}</SelectItem></SelectContent>
    </Select>
  )
}

/* ------------------------------------------------------------------- the credits page */

/**
 * Settings › Credits and activity › Credit usage › AI runs. Four levels, in a separate settings
 * shell, gated by the permission "Can access the credit usage page and check how much credit other
 * users used" (KB 9527776320781; `07-apollo-settings-map.md` §"Credits and activity").
 */
export function ParodyCredits({ spend, runs, showWeek }: { spend: Spend; runs: Run[]; showWeek: boolean }) {
  return (
    <section aria-label="Credit usage" className="mt-4 rounded-lg border border-dashed bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">
          Settings › Credits and activity › Credit usage › <span className="font-medium text-foreground">AI runs</span>
          {" · "}needs “Can access the credit usage page”
        </p>
        <Fold id="settings.ai-runs" label="Settings › Credits and activity › Credit usage › AI runs"
          className="ml-auto"
          trigger={<><ChevronRight className="size-3.5" aria-hidden="true" />Open</>}>
          <div className="mt-2 grid gap-1.5 rounded-md border bg-background p-2 text-xs">
            {showWeek && (
              <>
                <p data-item="credits.balance" data-item-label="Workspace credit balance" className="tabular-nums">
                  Workspace balance {spend.balance.toLocaleString()}
                </p>
                <p data-item="brief.credits-week" data-item-label="Credits this week against the cap" className="tabular-nums">
                  {spend.week.toLocaleString()} credits this week of {spend.weekCap.toLocaleString()}
                </p>
                <p data-item="brief.credits-today" data-item-label="Credits spent today" className="tabular-nums">
                  {spend.today.toLocaleString()} today
                </p>
              </>
            )}
            <div data-item="act.credits-per-event" data-item-label="Credits per event" className="border-t pt-1.5">
              <p className="font-medium">AI runs</p>
              <ul className="grid gap-0.5">
                {runs.slice(0, 4).map((r) => (
                  <li key={r.key} className="flex justify-between gap-2 tabular-nums">
                    <span className="truncate">{r.label}</span><span>{r.credits.toLocaleString()} credits</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Fold>
      </div>
    </section>
  )
}

/** The one line the parody says about itself, so nobody reads step 0 as a design proposal. */
export function ParodyNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Five surfaces, one job: the assistant asks in the chat, the workflow keeps the runs, and the
      credits are four levels down in Settings behind a permission.
    </p>
  )
}
