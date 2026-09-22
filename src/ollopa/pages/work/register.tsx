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
import { href } from "@/app/router"
import type { PageComponent } from "../../Product"
import { closeBeside, openBeside, openBesideNested, type BesideComponent } from "../../beside"
import { follow } from "../../chain"
import { clearEdit, editOf, recordEdit, useEdit } from "../../edits"
import { Actions, type Action } from "../../ui/Actions"
import { Chip, FamilyIcon } from "../../ui/Identity"
import { declarePaneFields, useBesideDone } from "../../ui/Beside"
import { useDisclosure, type Disclosure } from "../../ui/useDisclosure"
import { seedFor } from "../../data/seed"
import { Inbox, ThreadRoute } from "./Inbox"
import { Tasks } from "./Tasks"
import { originHere } from "./acts"
import { aeSeats, calendarOf, contactIndex, dealFor, repliesFor, tasksFor } from "./data"
import { day, dueLabel, localTime, tomorrow, waiting } from "./format"

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
      <dt className="t-label text-muted-foreground">{label}</dt>
      <dd className="t-body min-w-0">{children}</dd>
    </div>
  )
}

/**
 * A field of the record, named by the usage item that decides whether it sits at level one.
 *
 * A pane shows the record's **first level**, which means the seat's first level and not a list this
 * file chose: the same question the page asks (`useDisclosure`) answered for the signed-in seat at
 * the signed-in business. The list below is in the record's own order; what survives the filter is
 * what the Inbox and Tasks would have put on the surface for this person.
 */
interface PaneField {
  /** The usage item this field belongs to, on the record's own page. */
  item: string
  label: string
  value: ReactNode
}

function levelOneFields(d: Disclosure, fields: PaneField[]): PaneField[] {
  return fields.filter((f) => f.value !== null && f.value !== undefined && d.level(f.item) === 1)
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
  const d = useDisclosure("inbox")
  declarePaneFields("inbox")
  const seed = seedFor(session.business)
  const edit = useEdit("reply", id)
  useBesideDone(typeof edit?.note === "string" ? { note: edit.note, onUndo: () => clearEdit("reply", id) } : null)
  const r = repliesFor(session).find((x) => x.id === id)
  if (!r) return <p className="text-muted-foreground">This reply is not in {seed.workspace.name}.</p>

  const contact = contactIndex(session.business)(r.contactId)
  const deal = dealFor(session.business, r.dealId)
  const calendar = calendarOf(session.business)
  const thread = `/ollopa/inbox/${r.id}`
  const sent = r.messages.filter((m) => m.from === "us").length
  const ae = aeSeats(session.business)[0]

  /**
   * An act here writes one record to the shared store; the Inbox row and Home's Replies row read
   * the same record and change in place, and the frame's footer offers the one way back. Nothing
   * here spends and nothing here is final, which is why no line sits under any of them.
   */
  const handle = (note: string, patch: Record<string, unknown> = {}) => {
    recordEdit("reply", r.id, { handled: true, note, ...patch })
    say(note)
  }

  /**
   * Every act this pane could carry, each named by its usage item. The model says which of them
   * this seat touches in a week; the pane takes the three it touches most and leaves the rest to
   * the thread, which "Open the page" leads to. Going to the thread is a destination, so those two
   * are links and not acts (DESIGN.md §1).
   */
  const candidates: { item: string; action: Action }[] = [
    { item: "inbox.act.reply", action: { kind: "link", label: "Reply in the thread", href: href(thread), onClick: () => follow(thread, originHere(r.id)) } },
    ...(calendar
      ? [{ item: "inbox.act.book-meeting", action: { kind: "link" as const, label: "Book a meeting", href: href(`${thread}?meeting=new`), onClick: () => follow(`${thread}?meeting=new`, originHere(r.id)) } }]
      : []),
    ...(ae
      ? [{ item: "inbox.act.hand-to-ae", action: { kind: "secondary" as const, label: `Hand to ${ae.user}`, onClick: () => handle(`handed to ${ae.user} · a task “Reply to ${r.contact.split(" ")[0]}” is on their list`, { handedTo: ae.user }) } }]
      : []),
    { item: "inbox.act.done", action: { kind: "secondary", label: "Mark done", onClick: () => handle("marked done") } },
    { item: "inbox.act.not-interested", action: { kind: "secondary", label: "Mark not interested", onClick: () => handle(`marked not interested · “${r.sequence}” is finished for them`) } },
  ]

  const acts = candidates
    .filter((c) => d.level(c.item) === 1)
    .sort((a, b) => d.weekly(b.item) - d.weekly(a.item))
    .slice(0, 3)
    .map((c) => c.action)

  // The thread's own order, each line named by the item that decides whether this seat sees it.
  const fields = levelOneFields(d, [
    {
      item: "inbox.agent-class",
      label: "Read as",
      value: (
        <span className="flex flex-wrap items-center gap-2">
          {/* A category, not a state: the reply agent read it as this. */}
          <Chip icon={false}>{r.outcome}</Chip>
          <span className="t-small text-muted-foreground">by {r.classifiedBy ?? "nobody yet"}</span>
        </span>
      ),
    },
    { item: "inbox.list.row", label: "Waiting", value: waiting(r.received) },
    { item: "inbox.list.sequence-step", label: "Sequence", value: `${r.sequence} · step ${r.step.n} of ${r.step.of}` },
    { item: "inbox.filter.mailbox", label: "To", value: <span className="font-mono t-small">{r.box}</span> },
    { item: "inbox.list.owner", label: "Owner", value: r.boxOwner },
    {
      item: "inbox.thread.contact-details",
      label: "Email",
      value: <span className="font-mono t-small">{contact?.email}{contact && ` · ${contact.emailStatus}`}</span>,
    },
    {
      item: "inbox.thread.contact-details",
      label: "Open deal",
      value: deal
        ? <span className="flex items-center gap-1.5"><FamilyIcon of="deal" label="Deal" />{deal.name} · {deal.stage}</span>
        : "None",
    },
    { item: "inbox.thread.activity", label: "Opens and clicks", value: `${contact?.opens ?? 0} opens · ${contact?.replies ?? 0} replies` },
    { item: "inbox.thread.crm-sync", label: seed.workspace.crm ?? "CRM", value: contact?.crmSyncedAt ? `Synced ${day(contact.crmSyncedAt)}` : "Not synced" },
    { item: "inbox.thread.earlier-messages", label: "Earlier", value: `${sent} message${sent === 1 ? "" : "s"} sent before this reply` },
  ])

  return (
    <div className="space-y-4">
      <dl className="space-y-2.5">
        {fields.map((f) => <Field key={f.label} label={f.label}>{f.value}</Field>)}
      </dl>

      {/* What they actually wrote: the reason this pane exists rather than a row of fields. It is
          the thread panel's own item, so a seat that does not hold the thread does not hold this. */}
      {d.atLevelOne("inbox.thread.panel") && (
      <article className="border-y py-3">
        <p className="t-body whitespace-pre-line">{r.body}</p>
        {r.outcome === "Not now" && r.followUpOn && (
          <p className="t-small pt-2 text-muted-foreground">They named a date: {day(r.followUpOn)}.</p>
        )}
        {r.outcome === "Out of office" && r.returnsOn && (
          <p className="t-small pt-2 text-muted-foreground">Back on {day(r.returnsOn)}. The sequence resumes then by itself.</p>
        )}
      </article>
      )}

      {/* The contact, one step in — the record's own Contact line made a destination, because
          navigation in a pane is a link and not an act (DESIGN.md §1). */}
      <p className="flex items-center gap-1.5 border-t pt-3">
        <FamilyIcon of="person" label="Person" />
        <a
          href={href(`/ollopa/people/${r.contactId}`)}
          onClick={(e) => { if (!e.metaKey && !e.ctrlKey && e.button === 0) { e.preventDefault(); openBesideNested({ kind: "person", id: r.contactId }) } }}
          className="t-label underline decoration-muted-foreground underline-offset-4 hover:decoration-current"
        >
          {r.contact}
        </a>
      </p>

      {/* The three acts this seat runs most on a reply, and no more. Each candidate names its usage
          item and the model ranks them, the way the contact pane does; the two that go to the thread
          are links, because they are destinations. Nothing here spends and nothing here is final, so
          nothing carries a line (DESIGN.md §2 and §3). */}
      {calendar || acts.length > 0 ? (
        <Actions surface="pane" layout="stack" items={acts} />
      ) : (
        <p className="t-small text-muted-foreground">No calendar is connected, so nothing can be booked from here.</p>
      )}
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
  const d = useDisclosure("tasks")
  declarePaneFields("tasks")
  const seed = seedFor(session.business)
  // What the last act did and the way out of it, from the same record the row behind is reading.
  const edit = useEdit("task", id)
  useBesideDone(typeof edit?.note === "string" ? { note: edit.note, onUndo: () => clearEdit("task", id) } : null)
  const t = tasksFor(session).find((x) => x.id === id)
  if (!t) return <p className="text-muted-foreground">This task is not in {seed.workspace.name}.</p>

  const contact = contactIndex(session.business)(t.contactId)
  const first = t.contact.split(" ")[0]
  const from = t.createdBy === "sequence" ? `“${t.sequence}”` : t.createdBy === "agent" ? t.creator : `${t.creator}, by hand`

  /**
   * Every act this pane could carry, named by its usage item. Done is the one act a task exists for
   * and is the pane's single filled control; snooze and skip are the other two the person came for.
   * The model decides which of the three this seat actually holds.
   */
  const candidates: { item: string; action: Action }[] = [
    { item: "tasks.done", action: { kind: "primary", label: "Done", onClick: () => act("done") } },
    { item: "tasks.snooze", action: { kind: "secondary", label: "Snooze to tomorrow", onClick: () => act("snoozed") } },
    { item: "tasks.skip", action: { kind: "secondary", label: "Skip", onClick: () => act("skipped") } },
  ]

  const acts = candidates
    .filter((c) => d.level(c.item) === 1)
    .sort((a, b) => d.weekly(b.item) - d.weekly(a.item))
    .slice(0, 3)
    .map((c) => c.action)

  const act = (what: "done" | "snoozed" | "skipped") => {
    const note =
      what === "done" ? `${t.kind} with ${t.contact} marked done.${t.sequence ? ` ${first} moves to the next step of “${t.sequence}”.` : ""}`
        : what === "skipped" ? `${t.kind} with ${t.contact} skipped.${t.sequence ? ` ${first} moves to the next step of “${t.sequence}”.` : ""}`
          : `${t.contact}'s ${t.kind.toLowerCase()} snoozed to ${day(tomorrow())}.${t.sequence ? " The sequence waits." : ""}`
    recordEdit("task", t.id,
      what === "done" ? { done: true, note }
        : what === "skipped" ? { skipped: true, note }
          : { snoozed: true, until: tomorrow(), note })
    say(note)

    const was = target.list?.ids ?? [t.id]
    // Each of the three takes this task off the list, so the pane moves with the list rather than
    // sitting on a task that is no longer there: the one that took its place, counted against the
    // list as it is now. When nothing is left it closes, because there is nothing left to read.
    const gone = (x: string) => {
      const e = editOf("task", x)
      return x === t.id || !!e?.done || !!e?.snoozed || !!e?.skipped
    }
    const rest = was.filter((x) => !gone(x))
    if (rest.length === 0) { closeBeside(); return }
    const index = Math.min(Math.max(0, was.indexOf(t.id)), rest.length - 1)
    openBeside({ kind: "task", id: rest[index], list: { ids: rest, index }, opener: target.opener })
  }

  // The row's own order, each line named by the item that decides whether this seat sees it.
  const fields = levelOneFields(d, [
    {
      item: "tasks.rows",
      label: "Due",
      value: dueLabel(t.due).startsWith("Overdue")
        ? <Chip status="overdue" className="tabular-nums">{dueLabel(t.due)}</Chip>
        : <span className="tabular-nums">{dueLabel(t.due)}</span>,
    },
    { item: "tasks.local-time", label: "Their time", value: contact?.tz ? localTime(contact.tz) : null },
    { item: "tasks.rows", label: "Type", value: <Chip family="tasks">{t.kind}</Chip> },
    {
      item: "tasks.rows",
      label: "Contact",
      // The one step in. Navigation in a pane is a link, so the record's own Contact line is the
      // destination rather than a fourth control under the acts (DESIGN.md §1).
      value: (
        <span className="flex flex-wrap items-center gap-1.5">
          <FamilyIcon of="person" label="Person" />
          <a
            href={href(`/ollopa/people/${t.contactId}`)}
            onClick={(e) => { if (!e.metaKey && !e.ctrlKey && e.button === 0) { e.preventDefault(); openBesideNested({ kind: "person", id: t.contactId }) } }}
            className="underline decoration-muted-foreground underline-offset-4 hover:decoration-current"
          >
            {t.contact}
          </a>
          <span className="text-muted-foreground">· {contact?.title ?? "—"}</span>
        </span>
      ),
    },
    {
      item: "tasks.dnc-badge",
      label: "Phone",
      value: (
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono">{contact?.phoneNumber ?? "No number"}</span>
          {contact?.doNotCall && <Chip status="blocked">Do not call · {contact.doNotCallSource}</Chip>}
        </span>
      ),
    },
    {
      item: "tasks.row-score",
      label: "Fit",
      value: contact ? `${contact.score} ${contact.score >= contact.scorePrevious ? "▲" : "▼"} from ${contact.scorePrevious}` : null,
    },
    { item: "tasks.rows", label: "Company", value: t.company },
    { item: "tasks.rows", label: "Step", value: t.step ? `Step ${t.step.n} of ${t.step.of} · ${t.step.title}` : t.title },
    { item: "tasks.rows", label: "From", value: from },
    { item: "tasks.owner-column", label: "Owner", value: t.owner },
    { item: "tasks.details", label: "Last activity", value: day(contact?.lastActivity) },
  ])

  return (
    <div className="space-y-4">
      <dl className="space-y-2.5">
        {fields.map((f) => <Field key={f.label} label={f.label}>{f.value}</Field>)}
      </dl>

      {/* The safety line: an overdue sequence task means a contact is stuck and the sequence is
          waiting. `tasks.summary` is critical, so it is on the surface for every seat that has
          the page — it is never a thing the pane decides for itself. */}
      {d.atLevelOne("tasks.summary") && t.sequence && t.status === "Open" && dueLabel(t.due).startsWith("Overdue") && (
        <p className="t-small" style={{ color: "var(--danger-ink)" }}>The sequence waits at this step.</p>
      )}

      {/* The three acts a task exists for, in the order the queue runs them: Done is the one act
          this surface is for, so it is the filled control; snoozing and skipping are the other two
          the person came for. Each is reversible and free, so none carries a line (DESIGN.md §2). */}
      <div className="border-t pt-3">
        <Actions surface="pane" layout="stack" items={acts} />
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
