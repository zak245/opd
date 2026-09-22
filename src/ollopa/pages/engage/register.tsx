// The six nodes this folder owns, and the three panes: a sequence, a list and a template read
// beside another page.
//
// Product.tsx picks both maps up from here with the same glob; nothing else needs editing.
//
// A pane body is the record's own first level, and it is decided the same way a record page decides
// it: not from a hard-coded list of fields but from `useDisclosure`, which answers from the usage
// model for the signed-in seat at the signed-in workspace. Each block below is named by the usage
// item that owns it; `PaneBody` draws the ones at level one, in the order the usage file lists them,
// which is the order the record page reads in. So a Meridian SDR and a Meridian admin open the same
// sequence beside the same page and are shown different things, because they do different work.
//
// Then the acts: at most three, likewise chosen by the usage model, all drawn through `Actions` so
// the kind decides how each one looks. Nothing in a pane can be undone — an irreversible act stays
// on the record page with its confirmation — and nothing in a pane opens a door, a panel or another
// pane. Past these fields the way on is "Open the page" in the frame above.
import type { ReactNode } from "react"
import type { PageComponent } from "../../Product"
import type { BesideComponent } from "../../beside"
import { Separator } from "@/components/ui/separator"
import { Actions, type Action } from "../../ui/Actions"
import { declarePaneFields } from "../../ui/Beside"
import { useDisclosure, type Disclosure } from "../../ui/useDisclosure"
import { BOUNCE_GUARD, seedFor, TODAY } from "../../data/seed"
import { ListsPage } from "./Lists"
import { ListRecord } from "./ListRecord"
import { SequencesPage } from "./Sequences"
import { SequenceRecord } from "./SequenceRecord"
import { TemplatesPage } from "./Templates"
import { TemplateRecord } from "./TemplateRecord"
import { statusOf, totalPeople } from "./Sequences"
import { copyRows, usedByLine } from "./Templates"
import { agentWatch, alreadyInASequence, enrolCredits, membersOf, splitForEnrol, touchEstimate } from "./facts"
import { engage, useEngage } from "./store"
import { Chip, FamilyIcon } from "../../ui/Identity"
import { ago, day, n, rate, toast } from "./shared"

export const nodes: Record<string, PageComponent> = {
  "P-lists": ListsPage,
  "R-list": ListRecord,
  "P-sequences": SequencesPage,
  "R-sequence": SequenceRecord,
  "P-templates": TemplatesPage,
  "R-template": TemplateRecord,
}

/* ------------------------------------------------------------------------- the shape of a pane */

/**
 * One field of a pane body, named by the usage item that decides whether it belongs at level one.
 * `node` may be null when the object simply has not got the thing (no agent watches this list) —
 * object state, which is the other half of what decides a level.
 */
interface Block { id: string; node: ReactNode }

const field = (id: string, node: ReactNode): Block => ({ id, node })

/**
 * The fields the usage model puts at level one for this seat, in the record's own order — the usage
 * file's order, which is the order the record page is written in — and then the acts, which the
 * caller has already ranked and cut to three. Nothing else: a pane carries no explanation.
 */
function PaneBody({ d, blocks, acts }: { d: Disclosure; blocks: Block[]; acts: Action[] }) {
  const byId = new Map(blocks.filter((b) => b.node !== null && b.node !== undefined).map((b) => [b.id, b]))
  const shown = d.items.map((i) => byId.get(i.id)).filter((b): b is Block => !!b && d.level(b.id) === 1)

  return (
    <div className="space-y-4">
      {shown.length > 0 && (
        <dl className="space-y-2.5">
          {shown.map((b) => <div key={b.id} data-pane-item={b.id}>{b.node}</div>)}
        </dl>
      )}
      {acts.length > 0 && (
        <>
          <Separator />
          <Actions surface="pane" layout="stack" items={acts} />
        </>
      )}
    </div>
  )
}

/** One field of a record's first level, laid out the way the person pane lays its own out. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-baseline gap-3">
      <dt className="t-label text-muted-foreground">{label}</dt>
      <dd className="t-body min-w-0">{children}</dd>
    </div>
  )
}

/**
 * The acts a pane may carry: the ones this seat runs most, ranked by the usage model the way the
 * fields are, cut to the three DESIGN.md §1 allows. An act that cannot be undone is not a candidate
 * at all — it stays on the record page, and the pane's way to it is "Open the page".
 */
function threeActs(d: Disclosure, candidates: { item: string; action: Action | null }[]): Action[] {
  return candidates
    .filter((c) => c.action && d.level(c.item) === 1)
    .sort((a, b) => d.weekly(b.item) - d.weekly(a.item))
    .slice(0, 3)
    .map((c) => c.action!)
}

function Missing({ what }: { what: string }) {
  return <p className="text-muted-foreground">That {what} is gone. It may have been archived.</p>
}

/* ------------------------------------------------------------------------------- the sequence */

/**
 * A sequence read beside another page. The blocks are the sequence record's header items, named by
 * the usage ids the record page uses for the same things, so what a seat sees here is what that seat
 * sees at the top of the record.
 */
const SequenceBeside: BesideComponent = ({ session, id }) => {
  const d = useDisclosure("sequences")
  declarePaneFields("sequences")
  const data = useEngage(session.business)
  const seq = data.sequences.find((s) => s.id === id)
  if (!seq) return <Missing what="sequence" />

  const st = statusOf(seq)
  const steps = data.stepsOf(seq.id)
  const counts = [
    ["Active", seq.active], ["Paused", seq.paused], ["Finished", seq.finished],
    ["Replied", seq.replied], ["Bounced", seq.bounced], ["Not sent", seq.notSent],
  ] as const
  const rates = [
    ["Sent", seq.sent, 0], ["Delivered", seq.delivered, seq.sent], ["Opened", seq.opened, seq.delivered],
    ["Replied", seq.replied, seq.delivered], ["Interested", seq.interested, seq.delivered], ["Meetings", seq.meetings, seq.delivered],
  ] as const

  // The same words the record's own Pause button carries, so the two can never disagree.
  const consequence = seq.status === "Active"
    ? "Pause stops emails and new tasks. Everyone keeps their place."
    : `Resume continues from each person's next step. ${n(Math.min(seq.active, seq.dailyCap))} emails go out in the next sending window.`
  const guarded = seq.guardState === "auto-paused"

  const pauseResume = () => {
    const next = seq.status === "Active" ? "Paused" : "Active"
    engage.patchSequence(session.business, seq.id, {
      status: next, pausedBy: next === "Paused" ? session.user : null, updatedAt: TODAY,
    })
    engage.logChange(session.business, seq.id, session.user, next === "Paused" ? "Paused the sequence" : "Resumed the sequence")
    toast(next === "Paused"
      ? `${seq.name} paused. Emails and new tasks stop. Everyone keeps their place.`
      : `${seq.name} resumed. ${n(seq.active)} people continue from their next step.`)
  }

  const duplicate = () => toast(`Copied ${seq.name}: steps and settings, nobody in it`)

  return (
    <PaneBody
      d={d}
      acts={threeActs(d, [
        // Archiving cannot be undone, so it is not a candidate here at all: it stays on the record
        // page with its confirmation, and the pane's way to it is "Open the page" (DESIGN.md §1).
        {
          item: "seq.page.status",
          action: {
            kind: "secondary",
            label: seq.status === "Active" ? "Pause" : "Resume",
            onClick: pauseResume,
            disabledBecause: guarded ? "Bounce guard paused this; fix the data on the page first" : undefined,
          },
        },
        {
          item: "seq.page.duplicate",
          action: { kind: "secondary", label: "Duplicate", onClick: duplicate },
        },
      ])}
      blocks={[
        field("seq.page.health", (
          <Field label="Sending">
            <Chip status={st.word}>{st.label}</Chip>
            <div className="t-small mt-1 tabular-nums text-muted-foreground">
              Bounce {seq.bounceRate7d}% · warns {BOUNCE_GUARD.warnPercent}% · pauses {BOUNCE_GUARD.pausePercent}%
            </div>
          </Field>
        )),
        field("seq.page.counts", (
          <Field label="People">
            <span className="flex flex-wrap gap-x-3 gap-y-0.5 tabular-nums">
              {counts.map(([label, value]) => <span key={label}>{label} {n(value)}</span>)}
            </span>
          </Field>
        )),
        field("seq.page.results", (
          <Field label="Results">
            <span className="flex flex-wrap gap-x-3 gap-y-0.5 tabular-nums">
              {rates.map(([label, count, of]) => (
                <span key={label}>{label} {n(count)}{of ? <span className="text-muted-foreground"> · {rate(count, of)}</span> : null}</span>
              ))}
            </span>
          </Field>
        )),
        field("seq.page.owner", <Field label="Owner">{seq.owner}</Field>),
        field("seq.page.share", (
          <Field label="Visible to">{seq.sharedWith === "Everyone" ? "Everyone in the workspace" : "Only you"}</Field>
        )),
        field("seq.steps.list", <Field label="Steps">{n(steps.length)} · {steps.filter((s) => s.on > 0).length} on</Field>),
        field("seq.settings.mailbox", (
          <Field label="Sends">
            {seq.mailboxRotation.length ? `${n(seq.mailboxRotation.length)} mailboxes in rotation` : seq.mailbox}
            {" · "}{seq.schedule} · {seq.ruleset} rules · {seq.priority} priority
          </Field>
        )),
      ]}
    />
  )
}

SequenceBeside.head = ({ session, id }) => {
  const seq = seedFor(session.business).sequences.find((s) => s.id === id)
  if (!seq) return { name: id, context: "", route: `/ollopa/sequences/${id}` }
  return {
    name: seq.name,
    context: `${statusOf(seq).label} · ${n(totalPeople(seq))} people · ${seq.owner}`,
    route: `/ollopa/sequences/${seq.id}`,
  }
}

/* ----------------------------------------------------------------------------------- the list */

/**
 * A list read beside another page: what the count means as work, what the next enrolment would
 * spend, and the standing arrangements — each with the off switch the record carries, because a
 * thing that keeps spending without anyone touching it belongs in front of whoever is looking.
 * Every one of those is a usage item, and a seat that does not work lists this way is shown fewer.
 */
const ListBeside: BesideComponent = ({ session, id }) => {
  const d = useDisclosure("lists")
  declarePaneFields("lists")
  const data = useEngage(session.business)
  const seed = seedFor(session.business)
  const list = data.lists.find((l) => l.id === id)
  if (!list) return <Missing what="list" />

  const count = list.memberIds.length
  const people = membersOf(list, session.business)
  const enrolable = splitForEnrol(people).adding
  const credits = enrolCredits(enrolable)
  const doubled = alreadyInASequence(enrolable).length
  const watch = agentWatch(list, session.business)
  const autoFeed = list.feeds.find((f) => f.auto)
  const kind = list.kind === "people" ? "people" : "companies"

  const turnOffFeed = () => {
    if (!autoFeed) return
    engage.patchList(session.business, list.id, { feeds: list.feeds.map((x) => (x.name === autoFeed.name ? { ...x, auto: false } : x)) })
    toast(`New matches are no longer added to ${autoFeed.name}`)
  }
  const turnOffWatch = () => {
    engage.patchList(session.business, list.id, { source: "manual" })
    toast(`${watch?.agent} no longer watches ${list.name}`)
  }
  const refresh = () => {
    engage.patchList(session.business, list.id, { lastRefreshed: TODAY })
    toast(`${list.name} refreshed · ${n(count)} match now`)
  }

  return (
    <PaneBody
      d={d}
      acts={threeActs(d, [
        { item: "detail.auto-feed", action: autoFeed ? { kind: "secondary", label: `Turn off the feed into ${autoFeed.name}`, onClick: turnOffFeed } : null },
        { item: "lists.agent-watch", action: watch ? { kind: "secondary", label: `Turn off ${watch.agent} here`, onClick: turnOffWatch } : null },
        { item: "detail.refresh", action: list.mode === "segment" ? { kind: "secondary", label: "Refresh now", onClick: refresh } : null },
      ])}
      blocks={[
        field("detail.filters", list.mode === "segment" ? (
          <Field label="Filters">
            <span className="flex flex-wrap gap-1">
              {list.filters.map((f, i) => <span key={i} className="rounded-full border px-2 py-0.5 text-xs">{f.field} {f.op} {f.value}</span>)}
              {list.suppressions.map((s) => <span key={s} className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">excludes {s}</span>)}
            </span>
          </Field>
        ) : null),
        field("detail.new-since", list.newThisWeek > 0
          ? <Field label="New this week">{n(list.newThisWeek)} {kind}</Field>
          : null),
        field("detail.credits", list.kind === "people" ? (
          <Field label="Next enrolment">
            <span className="tabular-nums">{n(enrolable.length)} can be added · {n(credits)} credits · balance {n(seed.credits.balance)}</span>
          </Field>
        ) : null),
        field("detail.in-other-sequence", doubled > 0 ? (
          <Field label="Double outreach">
            <span className="font-medium tabular-nums" style={{ color: "var(--warning-ink)" }}>{n(doubled)} already in another sequence</span>
          </Field>
        ) : null),
        field("lists.touch-estimate", (
          <Field label="As work">{n(count)} {kind} · {touchEstimate(count, session.business)}</Field>
        )),
        field("lists.agent-watch", watch ? (
          <Field label="Agent watch">{watch.agent} · about {n(watch.perWeek)} credits a week</Field>
        ) : null),

      ]}
    />
  )
}

ListBeside.head = ({ session, id }) => {
  const list = seedFor(session.business).lists.find((l) => l.id === id)
  if (!list) return { name: id, context: "", route: `/ollopa/lists/${id}` }
  const kind = list.kind === "people" ? "people" : "companies"
  return {
    name: list.name,
    context: `${n(list.memberIds.length)} ${kind} · ${list.mode === "segment" ? "Segment" : "Static"} · ${list.owner}`,
    route: `/ollopa/lists/${list.id}`,
  }
}

/* ------------------------------------------------------------------------------- the template */

/**
 * A template or snippet read beside the step that uses it. The template items live on the sequences
 * page in the usage model, so that is the page this asks — the same question the template record
 * asks about the same six things.
 */
const TemplateBeside: BesideComponent = ({ session, id }) => {
  const d = useDisclosure("sequences")
  declarePaneFields("sequences")
  const rows = copyRows(session.business)
  const row = rows.find((r) => r.id === id)
  if (!row) return <Missing what="template" />

  const seed = seedFor(session.business)
  const mine = seed.mailboxes.find((m) => m.owner === session.user)?.address
    ?? seed.users.find((u) => u.name === session.user)?.mailbox
    ?? "your own address"

  // The preview, as a reading and not a control: a pane opens no further level, so it names the
  // variables that would go out empty rather than offering a contact picker.
  const values = new Set(["{{first_name}}", "{{company}}", "{{title}}", "{{signal}}", "{{owner}}"])
  const tokens = [...new Set([...row.subject.matchAll(/\{\{[a-z_]+\}\}/g), ...row.body.matchAll(/\{\{[a-z_]+\}\}/g)].map((m) => m[0]))]
  const unfilled = tokens.filter((t) => !values.has(t))

  return (
    <PaneBody
      d={d}
      acts={threeActs(d, [
        // Archiving shared copy cannot be undone, so it is not a candidate: it stays on the record
        // page with its confirmation. Sending a test spends an email, which is the one thing that
        // earns a line beside a control (DESIGN.md §2).
        { item: "tpl.test-send", action: { kind: "secondary", label: "Send a test to me", onClick: () => toast(`Test sent to ${mine}`), cost: "1 email", consequence: `To ${mine}, nobody else` } },
      ])}
      blocks={[
        field("tpl.body", (
          <Field label={row.kind === "Template" ? "Subject" : "Body"}>
            {row.kind === "Template" && <div className="font-medium">{row.subject || "No subject"}</div>}
            <div className="whitespace-pre-wrap">{row.body}</div>
          </Field>
        )),
        field("tpl.used-by", <Field label="Used by">{usedByLine(row)}</Field>),
        field("tpl.preview", (
          <Field label="Variables">
            {tokens.length === 0
              ? "None"
              : unfilled.length === 0
                ? `${n(tokens.length)}, all filled from the contact`
                : `${n(unfilled.length)} of ${n(tokens.length)} unfilled: ${unfilled.join(", ")}`}
          </Field>
        )),
      ]}
    />
  )
}

TemplateBeside.head = ({ session, id }) => {
  const row = copyRows(session.business).find((r) => r.id === id)
  if (!row) return { name: id, context: "", route: `/ollopa/templates/${id}` }
  return {
    name: row.name,
    context: `${row.kind} · ${row.folder} · used by ${usedByLine(row)}`,
    route: `/ollopa/templates/${row.id}`,
  }
}

export const besides: Record<string, BesideComponent> = {
  sequence: SequenceBeside,
  list: ListBeside,
  template: TemplateBeside,
}
