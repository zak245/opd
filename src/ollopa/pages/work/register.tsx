// The Inbox and Tasks nodes, registered as the map types them (IA-MAP part 2.7 and 2.8) — plus the
// two panes this folder owns, the reply and the task, for the pages that open one beside themselves.
//
// Two of these are pages and one is a route:
//   P-inbox   page          the master half; the thread is the other half of the same page
//   X-thread  detail pane   /ollopa/inbox/:id renders the same page with that thread open
//   P-tasks   page          queue body for SDR and AE, list body for CS and OPS
//
// The rest are panels, which are components a page opens and not destinations of their own, so they
// are exported rather than registered: `X-queue` is the Tasks body, and `X-calllog`, `X-linkedin`
// and `X-meeting` are opened from a row, from the queue body, and — by the contact, company and deal
// records — from theirs. `D-thread-agent` and `X-reply` live inside the thread, where sending the
// agent's draft is the approval.
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PageComponent } from "../../Product"
import { closeBeside, openBeside, openBesideNested, type BesideComponent } from "../../beside"
import { follow } from "../../chain"
import { editOf, recordEdit } from "../../edits"
import { ConsequenceLine } from "../../ui/ConsequenceLine"
import { seedFor } from "../../data/seed"
import { Inbox, ThreadRoute } from "./Inbox"
import { Tasks } from "./Tasks"
import { originHere } from "./acts"
import { calendarOf, contactIndex, repliesFor, tasksFor } from "./data"
import { day, dueLabel, tomorrow, waiting } from "./format"

export const nodes: Record<string, PageComponent> = {
  "P-inbox": ({ session }) => <Inbox session={session} />,
  "X-thread": ({ session, id }) => <ThreadRoute session={session} id={id} />,
  "P-tasks": ({ session }) => <Tasks session={session} />,
}

function say(text: string) {
  document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: text }))
}

/** One field of a pane's first level, in the grid the person pane uses, so the two panes match. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-baseline gap-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

/* ------------------------------------------------------------------------------------ the reply */

/**
 * A reply read beside another page — Home, mostly, where the row names it and the thread is a page
 * away. The body is the thread's own first level in the thread's order: who, what the reply agent
 * read it as, and the message itself. Then the two things a person does with a reply.
 *
 * Neither action pretends to be the composer: there is one composer in the product and it is in the
 * thread, so Reply goes there with the trail holding the page it left — which is why the button says
 * what it will do and what it will not.
 */
const ReplyBeside: BesideComponent = ({ session, id }) => {
  const seed = seedFor(session.business)
  const r = repliesFor(session).find((x) => x.id === id)
  if (!r) return <p className="text-muted-foreground">This reply is not in {seed.workspace.name}.</p>

  const contact = contactIndex(session.business)(r.contactId)
  const calendar = calendarOf(session.business)
  const thread = `/ollopa/inbox/${r.id}`
  const first = r.contact.split(" ")[0]

  return (
    <div className="space-y-4">
      <dl className="space-y-2.5">
        <Field label="Read as">
          <span className="flex flex-wrap items-baseline gap-2">
            <Badge variant="secondary" className="px-1.5 py-0 text-[11px] font-normal">{r.outcome}</Badge>
            <span className="text-xs text-muted-foreground">by {r.classifiedBy ?? "nobody yet"}</span>
          </span>
        </Field>
        <Field label="Waiting">{waiting(r.received)}</Field>
        <Field label="Sequence">{r.sequence} · step {r.step.n} of {r.step.of}</Field>
        <Field label="To"><span className="font-mono text-xs">{r.box}</span></Field>
        <Field label="Email"><span className="font-mono text-xs">{contact?.email}{contact && ` · ${contact.emailStatus}`}</span></Field>
      </dl>

      {/* What they actually wrote: the reason this pane exists rather than a row of fields. */}
      <article className="rounded-lg border p-3">
        <p className="whitespace-pre-line text-sm">{r.body}</p>
        {r.outcome === "Not now" && r.followUpOn && (
          <p className="pt-2 text-xs text-muted-foreground">They named a date: {day(r.followUpOn)}.</p>
        )}
        {r.outcome === "Out of office" && r.returnsOn && (
          <p className="pt-2 text-xs text-muted-foreground">Back on {day(r.returnsOn)}. The sequence resumes then by itself.</p>
        )}
      </article>

      <div className="space-y-3 border-t pt-3">
        <div>
          <Button size="sm" variant="outline" className="w-full justify-start"
                  onClick={() => follow(thread, originHere(r.id))}>
            Reply to {first}
          </Button>
          <ConsequenceLine className="mt-1" changes={`Opens the thread in Inbox, where the composer is. Nothing is sent until you press Send there`} />
        </div>

        {calendar ? (
          <div>
            <Button size="sm" variant="outline" className="w-full justify-start"
                    onClick={() => follow(`${thread}?meeting=new`, originHere(r.id))}>
              Book a meeting
            </Button>
            <ConsequenceLine className="mt-1" changes={`Opens the thread with the times ${calendar.name} has free; the invite goes out when you confirm it`} />
          </div>
        ) : (
          <ConsequenceLine changes="No calendar is connected, so nothing can be booked from here" />
        )}

        {/* One step in, never two: from the contact the way on is "Open the page". */}
        <div>
          <Button size="sm" variant="ghost" className="w-full justify-start"
                  onClick={() => openBesideNested({ kind: "person", id: r.contactId })}>
            {r.contact} ›
          </Button>
          <ConsequenceLine className="mt-1" changes={`Reads ${first}'s record here, with this reply one step behind`} />
        </div>
      </div>
    </div>
  )
}

ReplyBeside.head = ({ session, id }) => {
  const r = repliesFor(session).find((x) => x.id === id)
  if (!r) return { name: id, context: "", route: `/ollopa/inbox/${id}` }
  const contact = contactIndex(session.business)(r.contactId)
  return { name: r.contact, context: `${contact?.title ?? r.outcome} · ${r.company}`, route: `/ollopa/inbox/${r.id}` }
}

/* ------------------------------------------------------------------------------------- the task */

/**
 * A task read beside another page. The body is the first level of a task the way the queue opens it:
 * when it is due, what kind it is, who it is with, which step it came from. Done and Snooze are here
 * because they are the whole point of a task, and the page behind is told so its row changes in place.
 */
const TaskBeside: BesideComponent = ({ session, id, target }) => {
  const seed = seedFor(session.business)
  const t = tasksFor(session).find((x) => x.id === id)
  if (!t) return <p className="text-muted-foreground">This task is not in {seed.workspace.name}.</p>

  const contact = contactIndex(session.business)(t.contactId)
  const first = t.contact.split(" ")[0]
  const from = t.createdBy === "sequence" ? `“${t.sequence}”` : t.createdBy === "agent" ? t.creator : `${t.creator}, by hand`

  /**
   * Done and Snooze both take this task off the list. The record goes to the shared store, which is
   * where the row behind reads it from, and then the pane moves with the list rather than sitting on
   * a task that is no longer there: the one that took its place, counted against the list as it is
   * now. When nothing is left the pane closes, because there is nothing beside the page to read.
   */
  const act = (what: "done" | "snoozed") => {
    const note = what === "done"
      ? `${t.kind} with ${t.contact} marked done.${t.sequence ? ` ${first} moves to the next step of “${t.sequence}”.` : ""}`
      : `${t.contact}'s ${t.kind.toLowerCase()} snoozed to ${day(tomorrow())}.${t.sequence ? " The sequence waits." : ""}`
    recordEdit("task", t.id, what === "done" ? { done: true, note } : { snoozed: true, until: tomorrow(), note })
    say(note)

    const was = target.list?.ids ?? [t.id]
    const gone = (x: string) => x === t.id || !!editOf("task", x)?.done || !!editOf("task", x)?.snoozed
    const rest = was.filter((x) => !gone(x))
    if (rest.length === 0) { closeBeside(); return }
    const index = Math.min(Math.max(0, was.indexOf(t.id)), rest.length - 1)
    openBeside({ kind: "task", id: rest[index], list: { ids: rest, index }, opener: target.opener })
  }

  return (
    <div className="space-y-4">
      <dl className="space-y-2.5">
        <Field label="Due">
          <span className={dueLabel(t.due).startsWith("Overdue") ? "font-medium text-destructive" : undefined}>{dueLabel(t.due)}</span>
        </Field>
        <Field label="Type"><Badge variant="outline" className="text-xs">{t.kind}</Badge></Field>
        <Field label="Contact">{t.contact} · {contact?.title ?? "—"}</Field>
        <Field label="Company">{t.company}</Field>
        <Field label="Step">{t.step ? `Step ${t.step.n} of ${t.step.of} · ${t.step.title}` : t.title}</Field>
        <Field label="From">{from}</Field>
        <Field label="Owner">{t.owner}</Field>
      </dl>

      {t.sequence && t.status === "Open" && dueLabel(t.due).startsWith("Overdue") && (
        <p className="text-xs text-destructive">The sequence waits at this step.</p>
      )}

      <div className="space-y-3 border-t pt-3">
        <div>
          <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => act("done")}>
            Done
          </Button>
          <ConsequenceLine
            className="mt-1"
            changes={t.sequence
              ? `Takes it off the list and moves ${first} to the next step of “${t.sequence}”; this pane moves to the task that takes its place`
              : "Takes it off the list; this pane moves to the task that takes its place"}
          />
        </div>

        <div>
          <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => act("snoozed")}>
            Snooze to tomorrow
          </Button>
          <ConsequenceLine
            className="mt-1"
            changes={t.sequence ? `Comes back on ${day(tomorrow())}; the sequence waits until then` : `Comes back on ${day(tomorrow())}`}
          />
        </div>

        <div>
          <Button size="sm" variant="ghost" className="w-full justify-start"
                  onClick={() => openBesideNested({ kind: "person", id: t.contactId })}>
            {t.contact} ›
          </Button>
          <ConsequenceLine className="mt-1" changes={`Reads ${first}'s record here, with this task one step behind`} />
        </div>
      </div>
    </div>
  )
}

TaskBeside.head = ({ session, id }) => {
  const t = tasksFor(session).find((x) => x.id === id)
  if (!t) return { name: id, context: "", route: "/ollopa/tasks" }
  return {
    name: t.step ? `Step ${t.step.n} of ${t.step.of} · ${t.title}` : t.title,
    context: `${t.kind} · ${t.contact} · ${t.company}`,
    route: "/ollopa/tasks",
  }
}

/** The two objects this folder owns, for any page that opens one beside itself. */
export const besides: Record<string, BesideComponent> = { reply: ReplyBeside, task: TaskBeside }

/** X-queue — the Tasks body. Exported so nothing else has to rebuild the one-at-a-time console. */
export { Queue } from "./Queue"
/** X-calllog — a panel from a task row, the queue body, the contact record and the deal record. */
export { CallLogPanel, CallLogBody, STOPS_SEQUENCE } from "./CallLog"
/** X-linkedin — a panel from a LinkedIn task row and the queue body. */
export { LinkedInPanel, LinkedInBody, InviteCounter } from "./LinkedIn"
/** X-meeting — owned by the Inbox for the whole product; Tasks and the deal record render it. */
export { MeetingPanel } from "./MeetingPanel"
/** X-thread and X-reply, for a record page that wants the thread and its composer in place. */
export { Thread } from "./Thread"
/** Where a page thinks it is standing, and the dev render count the walk reads. */
export { originHere, useRenderCount } from "./acts"
export { Inbox, Tasks }
