// X-queue — work the queue: one task at a time, the person beside it, Done and Next.
//
// The queue is a **body**, not a drawer: it replaces the page's body and the list replaces it back,
// so the list's filters and row doors stay at level two either way and nothing nests. It is the
// opening body for the SDR and the AE seats (PLAN.md, the S1 walk decision of 15 September 2026).
//
// It renders the call and LinkedIn panels directly as its own body, so working a call block is
// page → panel → next panel, never page → door → panel. The outcome buttons, the snooze options and
// the contact are all on screen, so the queue has no inner door at all.
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { follow } from "../../chain"
import { Actions, type Action } from "../../ui/Actions"
import { EmptyState } from "../../ui/EmptyState"
import type { Task } from "../../data/seed"
import type { Session } from "../../session"
import { day, dueLabel, localTime } from "./format"
import { originHere } from "./acts"
import { contactIndex, mailboxOf, meetingForTask } from "./data"
import { CallLogBody } from "./CallLog"
import { InviteCounter, LinkedInBody } from "./LinkedIn"
import { MeetingPanel } from "./MeetingPanel"

export interface QueueProps {
  session: Session
  /** The current list, in its current order. The queue takes it as it is. */
  tasks: Task[]
  /** "due" is the default and stays the default; "score" is the scoring agent's, chosen by a person. */
  sort: "due" | "score"
  onSort: (s: "due" | "score") => void
  /** Whether this business scores contacts at all. Removed where it does not. */
  scores: boolean
  /** How many tasks are due tomorrow, for the end of the queue. */
  dueTomorrow: number
  onDone: (t: Task, outcome?: string) => void
  onSnooze: (t: Task) => void
  onSkip: (t: Task) => void
  onSnoozeRest: () => void
  /** The contact this task points at, beside the queue, with the queue as the list ] walks. */
  onOpenContact: (t: Task, opener?: HTMLElement | null) => void
  /** The deal this task points at, where it has one. Same list, same page underneath. */
  onOpenDeal: (t: Task, opener?: HTMLElement | null) => void
  /** The whole list, as a body rather than a queue: what "See the list" opens. */
  onSeeList: () => void
  say: (message: string, undo?: () => void) => void
}

const CALL_OUTCOMES = ["Connected", "Voicemail", "No answer", "Wrong number"]

export function Queue(p: QueueProps) {
  const contactOf = contactIndex(p.session.business)
  const [i, setI] = useState(0)
  const [note, setNote] = useState("")
  const [email, setEmail] = useState("")
  const [meetingOpen, setMeetingOpen] = useState(false)
  const mailbox = mailboxOf(p.session)

  // The queue always restarts at the first open task, because order is the point.
  useEffect(() => { setI(0) }, [p.sort])
  useEffect(() => { if (i > 0 && i >= p.tasks.length) setI(Math.max(0, p.tasks.length - 1)) }, [i, p.tasks.length])

  const task = p.tasks[i]
  // Done, snooze and skip take the task off the list, so the same index is already the next task.
  const advance = () => { setNote(""); setEmail("") }

  if (!task) {
    return (
      <div className="p-6">
        <EmptyState
          title="Done for today."
          body={p.dueTomorrow > 0 ? `${p.dueTomorrow} due tomorrow.` : "Nothing is due tomorrow either."}
          action={<Actions surface="card" items={[{ kind: "secondary", label: "See the list", onClick: p.onSeeList }]} />}
        />
      </div>
    )
  }

  const contact = contactOf(task.contactId)
  const next = p.tasks[i + 1] ?? task
  const sequenceWaiting = task.sequence && task.status === "Open"

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ------------------------------------------------------------------- where you are */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2 sm:px-6">
        <span className="text-sm font-medium tabular-nums">Task {i + 1} of {p.tasks.length}</span>
        <Badge variant="outline">{task.kind}</Badge>
        <span className="min-w-0 truncate text-sm">{task.contact}, {task.company}</span>
        <div className="ml-auto flex items-center gap-1">
          <Button size="icon-sm" variant="ghost" aria-label="Previous task" disabled={i === 0} onClick={() => setI((n) => n - 1)}><ChevronLeft className="size-4" /></Button>
          <Button size="icon-sm" variant="ghost" aria-label="Next task" disabled={i >= p.tasks.length - 1} onClick={() => setI((n) => n + 1)}><ChevronRight className="size-4" /></Button>
        </div>
      </div>

      {/* The count is never left to be read as a lie: the queue shows one task and says where the
          rest are, names the one that comes next, and carries the control that shows them all. */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b px-4 py-1.5 text-xs sm:px-6">
        <span className="text-muted-foreground">
          {p.tasks.length === 1
            ? "The last one; nothing else is waiting behind it."
            : <>One at a time. {p.tasks.length - i - 1 > 0
                ? <>{p.tasks.length - i - 1} more behind this one · next: <span className="text-foreground">{next.contact} · {next.step ? next.step.title : next.title}</span></>
                : <>{p.tasks.length - 1} already worked; this is the last.</>}</>}
        </span>
        <Button size="sm" variant="ghost" className="ml-auto h-6 px-2 text-xs" onClick={p.onSeeList}>
          See the list
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-4 py-1.5 text-xs sm:px-6">
        {p.scores ? (
          <span className="flex items-center gap-2">
            Sort:
            <button className={p.sort === "due" ? "font-medium underline underline-offset-4" : "underline underline-offset-4 opacity-70"} onClick={() => p.onSort("due")}>due</button>
            ·
            <button className={p.sort === "score" ? "font-medium underline underline-offset-4" : "underline underline-offset-4 opacity-70"} onClick={() => p.onSort("score")}>call score</button>
            {p.sort === "score" && <span className="text-muted-foreground">Ranked by the scoring agent · <button type="button" className="underline underline-offset-4" onClick={() => follow("/ollopa/settings/scoring?row=score.weights", originHere(task.contactId))}>how it was built</button></span>}
          </span>
        ) : (
          <span className="text-muted-foreground">Overdue first, then oldest due</span>
        )}
        {p.tasks.some((t) => t.kind === "LinkedIn") && <InviteCounter session={p.session} onSnoozeRest={p.onSnoozeRest} />}
      </div>

      {/* -------------------------------------------------------------------------- the task */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-5">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-base font-semibold">{task.step ? `Step ${task.step.n} of ${task.step.of} · ${task.title}` : task.title}</h3>
              <span className={dueLabel(task.due).startsWith("Overdue") ? "text-sm font-medium text-destructive" : "text-sm text-muted-foreground"}>{dueLabel(task.due)}</span>
            </div>
            <p className="pt-0.5 text-sm text-muted-foreground">
              From {task.createdBy === "sequence" ? `“${task.sequence}”` : task.createdBy === "agent" ? task.creator : `${task.creator}, by hand`}
              {sequenceWaiting && <> · the sequence waits at this step</>}
            </p>
          </div>

          {/* The contact, already open: the queue never asks for a door to see who this is. */}
          <div className="rounded-lg border p-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1" data-item={task.contactId} data-item-label={task.contact}>
              <button
                type="button"
                className="font-medium underline underline-offset-4"
                onClick={(e) => p.onOpenContact(task, e.currentTarget)}
              >
                {task.contact}
              </button>
              <span className="text-sm text-muted-foreground">{contact?.title} · {task.company}</span>
              {task.dealId && (
                <span data-item={task.dealId}>
                  <button
                    type="button"
                    className="text-sm underline underline-offset-4"
                    onClick={(e) => p.onOpenDeal(task, e.currentTarget)}
                  >
                    The deal
                  </button>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-sm">
              {contact?.phoneNumber && <span className="font-mono">{contact.phoneNumber}</span>}
              {contact?.doNotCall && (
                <span className="rounded border border-destructive px-1.5 py-0.5 text-xs text-destructive">Do not call · {contact.doNotCallSource}</span>
              )}
              {contact?.tz && <span className="text-muted-foreground">{localTime(contact.tz)} their time</span>}
              <span className="font-mono text-xs text-muted-foreground">{contact?.email} · {contact?.emailStatus}</span>
            </div>
            {p.scores && contact && (
              <p className="pt-1 text-sm">
                Fit {contact.score} {contact.score >= contact.scorePrevious ? "▲" : "▼"} from {contact.scorePrevious}
                <span className="text-muted-foreground"> — {contact.scoreReasons.join(", ")}</span>
              </p>
            )}
          </div>

          {task.history.length > 0 && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">What has happened</h4>
              <ul className="pt-1 text-sm">
                {task.history.map((h, k) => (
                  <li key={k} className="flex flex-wrap gap-x-3 py-0.5">
                    <span className="tabular-nums text-muted-foreground">{day(h.when)}</span>
                    <span>Step {h.step} · {h.kind}</span>
                    <span className="text-muted-foreground">{h.result}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ---------------------------------------------- the panel this kind of task needs */}
          {task.kind === "Call" && (
            <CallLogBody session={p.session} task={task} say={p.say} asBody onLogged={(disposition) => { p.onDone(task, disposition); advance() }} />
          )}
          {task.kind === "LinkedIn" && (
            <LinkedInBody session={p.session} task={task} say={p.say} onSnoozeRest={p.onSnoozeRest} onComplete={() => { p.onDone(task); advance() }} />
          )}
          {task.kind === "Meeting" && (
            <div>
              <Actions surface="card" items={[{ kind: "secondary", label: "Open the meeting", onClick: () => setMeetingOpen(true) }]} />
            </div>
          )}
          {(task.kind === "Email" || task.kind === "Follow-up") && (
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="queue-email">Write to {task.contact.split(" ")[0]}</label>
              <Textarea id="queue-email" rows={5} className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Actions
                  surface="card"
                  items={[{
                    kind: "primary",
                    label: "Send and mark done",
                    onClick: () => { p.say(`Email sent to ${task.contact} from ${mailbox}. Task done.`); p.onDone(task); advance() },
                    cost: "1 email",
                    consequence: `to ${task.contact} from ${mailbox}`,
                    disabledBecause: email.trim() ? undefined : "Write something first",
                  }]}
                />
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes on this task</h4>
            <ul className="pt-1 text-sm">
              {task.notes.map((n, k) => (
                <li key={k} className="py-0.5"><span className="text-muted-foreground">{day(n.when)} · {n.who}: </span>{n.text}</li>
              ))}
            </ul>
            <form className="flex gap-2 pt-1" onSubmit={(e) => { e.preventDefault(); if (!note.trim()) return; p.say(`Note added to ${task.contact}'s task.`); setNote("") }}>
              <Input aria-label="Add a note to this task" placeholder="Add a note" className="h-8" value={note} onChange={(e) => setNote(e.target.value)} />
              <Button size="sm" type="submit" variant="outline">Add</Button>
            </form>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------------- the footer */}
      <div className="shrink-0 border-t px-4 py-3 sm:px-6">
        {/* Done is the act the queue exists for, so it is the one filled control here; snoozing and
            skipping are the other two the person came for. A call has four comparable outcomes
            instead, and four comparable acts are never one filled and three outlined. */}
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2">
          {task.kind === "Call" ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Done:</span>
              <Actions
                surface="card"
                items={CALL_OUTCOMES.map((o) => ({ kind: "secondary" as const, label: o, onClick: () => { p.onDone(task, o); advance() } }))}
              />
            </div>
          ) : (
            <Actions
              surface="card"
              items={([{ kind: "primary", label: "Done", onClick: () => { p.onDone(task); advance() } }]) as Action[]}
            />
          )}
          <Actions
            surface="card"
            items={([
              { kind: "secondary", label: "Snooze to tomorrow", onClick: () => { p.onSnooze(task); advance() } },
              { kind: "secondary", label: "Skip", onClick: () => { p.onSkip(task); advance() } },
            ]) as Action[]}
          />
        </div>
      </div>

      {meetingOpen && (
        <MeetingPanel
          session={p.session}
          open
          onOpenChange={setMeetingOpen}
          contactId={task.contactId}
          contactName={task.contact}
          company={task.company}
          meeting={meetingForTask(p.session.business, task.id)}
          dealId={task.dealId}
          sequence={task.sequence}
          say={p.say}
        />
      )}
    </div>
  )
}
