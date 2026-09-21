// The six nodes this folder owns, and the three panes: a sequence, a list and a template read
// beside another page.
//
// Product.tsx picks both maps up from here with the same glob; nothing else needs editing.
//
// Each pane body is the record's own first level — the same fields, in the same order, with the same
// labels the record page opens with — and then the actions a chain arriving here needs, each a real
// button with what it will do written under it. Nothing in a pane body opens a door, a panel or
// another pane: past these fields the way on is "Open the page" in the frame above.
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import type { PageComponent } from "../../Product"
import type { BesideComponent } from "../../beside"
import { ConsequenceLine } from "../../ui/ConsequenceLine"
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
import { Pill, ago, day, n, rate, toast } from "./shared"

export const nodes: Record<string, PageComponent> = {
  "P-lists": ListsPage,
  "R-list": ListRecord,
  "P-sequences": SequencesPage,
  "R-sequence": SequenceRecord,
  "P-templates": TemplatesPage,
  "R-template": TemplateRecord,
}

/* ------------------------------------------------------------------------- the shape of a pane */

/** One field of a record's first level, laid out the way the person pane lays its own out. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-baseline gap-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

/** A button and the sentence saying what pressing it does. The two never disagree (rule 7). */
function Action({ label, disabled, onClick, children }: {
  label: string; disabled?: boolean; onClick: () => void; children: ReactNode
}) {
  return (
    <div>
      <Button size="sm" variant="outline" className="w-full justify-start" disabled={disabled} onClick={onClick}>{label}</Button>
      {children}
    </div>
  )
}

function Missing({ what }: { what: string }) {
  return <p className="text-muted-foreground">That {what} is gone. It may have been archived.</p>
}

/* ------------------------------------------------------------------------------- the sequence */

/**
 * A sequence read beside another page: the header of the sequence record, in its order — status,
 * owner, the bounce line, the six counts, the six rates, what it sends from — and the one control
 * that changes whether it is sending.
 */
const SequenceBeside: BesideComponent = ({ session, id }) => {
  const data = useEngage(session.business)
  const seq = data.sequences.find((s) => s.id === id)
  if (!seq) return <Missing what="sequence" />

  const st = statusOf(seq)
  const steps = data.stepsOf(seq.id)
  const total = totalPeople(seq)
  const feeder = data.lists.find((l) => l.feeds.some((f) => f.name === seq.name))
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
  const blocked = seq.guardState === "auto-paused"

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

  return (
    <div className="space-y-4">
      <dl className="space-y-2.5">
        <Field label="Status"><Pill tone={st.tone}>{st.label}</Pill></Field>
        <Field label="Owner">{seq.owner} · {seq.sharedWith === "Everyone" ? "Shared with the workspace" : "Only you"}</Field>
        <Field label="Bounce rate">
          {seq.bounceRate7d}% over 7 days · warns at {BOUNCE_GUARD.warnPercent}%, pauses at {BOUNCE_GUARD.pausePercent}%
        </Field>
        <Field label="People">
          <span className="flex flex-wrap gap-x-3 gap-y-0.5 tabular-nums">
            {counts.map(([label, value]) => (
              <span key={label}>{label} {n(value)}</span>
            ))}
          </span>
        </Field>
        <Field label="Steps">{n(steps.length)} · {steps.filter((s) => s.on > 0).length} on</Field>
        <Field label="Results">
          <span className="flex flex-wrap gap-x-3 gap-y-0.5 tabular-nums">
            {rates.map(([label, count, of]) => (
              <span key={label}>{label} {n(count)}{of ? <span className="text-muted-foreground"> · {rate(count, of)}</span> : null}</span>
            ))}
          </span>
        </Field>
        <Field label="Sends">
          {seq.mailboxRotation.length ? `${n(seq.mailboxRotation.length)} mailboxes in rotation` : seq.mailbox}
          {" · "}{seq.schedule} · {seq.ruleset} rules · {seq.priority} priority
        </Field>
        {feeder && <Field label="Fed by">{feeder.name}</Field>}
      </dl>

      <div className="space-y-3 border-t pt-3">
        <Action
          label={blocked ? "Review and resume on the page" : seq.status === "Active" ? "Pause" : "Resume"}
          disabled={blocked}
          onClick={pauseResume}
        >
          <ConsequenceLine
            className="mt-1"
            changes={blocked
              ? "Bounce guard paused this. Resuming needs the bounced people removed or the data fixed first, on the page."
              : consequence}
          />
        </Action>

        <Action label="Duplicate" onClick={() => toast(`Copied ${seq.name}: steps and settings, nobody in it`)}>
          <ConsequenceLine className="mt-1" changes={`Copies the ${n(steps.length)} steps and the sending settings. Nobody is put in the copy.`} />
        </Action>

        <Action label="Export people (CSV)" onClick={() => toast(`Exported ${n(total)} people from ${seq.name}`)}>
          <ConsequenceLine className="mt-1" changes={`Writes ${n(total)} rows, in the order the sequence shows them`} />
        </Action>
      </div>

      <p className="border-t pt-3 text-xs text-muted-foreground">
        The steps, the enrolled people and the sending settings are on the page.
      </p>
    </div>
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
 * A list read beside another page: the count as work, who owns it, what the next enrolment would
 * spend, and the standing arrangements — each with the off switch the record carries, because a
 * thing that keeps spending without anyone touching it belongs in front of whoever is looking.
 */
const ListBeside: BesideComponent = ({ session, id }) => {
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
  const autoFeeds = list.feeds.filter((f) => f.auto)

  return (
    <div className="space-y-4">
      <dl className="space-y-2.5">
        <Field label="Kind">
          <span className="flex flex-wrap items-center gap-1.5">
            <Pill tone="muted">{list.kind === "people" ? "People" : "Companies"}</Pill>
            <Pill tone={list.mode === "segment" ? "good" : "muted"}>{list.mode === "segment" ? "Segment" : "Static"}</Pill>
            {list.archived && <Pill tone="muted">Archived</Pill>}
          </span>
        </Field>
        <Field label="Count">
          {n(count)} {list.kind === "people" ? "people" : "companies"} · {touchEstimate(count, session.business)}
          {list.newThisWeek > 0 && <> · +{n(list.newThisWeek)} this week</>}
        </Field>
        <Field label="Owner">
          {list.owner} · {list.visibility === "everyone" ? "Everyone can see it" : "Only you can see it"}
        </Field>
        <Field label={list.mode === "segment" ? "Refreshed" : "Updated"}>
          {list.mode === "segment" && list.lastRefreshed ? `${day(list.lastRefreshed)} · ${ago(list.lastRefreshed)}` : ago(list.updated)}
        </Field>
        {list.kind === "people" && (
          <Field label="Next enrolment">
            <span className="tabular-nums">
              {n(enrolable.length)} can be added · {n(credits)} credits · balance {n(seed.credits.balance)}
            </span>
            {doubled > 0 && (
              <div className="text-xs font-medium text-amber-700 dark:text-amber-400">{n(doubled)} already in another sequence</div>
            )}
          </Field>
        )}
        {list.mode === "segment" && (
          <Field label="Filters">
            <span className="flex flex-wrap gap-1">
              {list.filters.map((f, i) => <span key={i} className="rounded-full border px-2 py-0.5 text-xs">{f.field} {f.op} {f.value}</span>)}
              {list.suppressions.map((s) => <span key={s} className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">excludes {s}</span>)}
            </span>
          </Field>
        )}
      </dl>

      <div className="space-y-3 border-t pt-3">
        {autoFeeds.map((f) => (
          <Action
            key={f.name}
            label={`Turn off the feed into ${f.name}`}
            onClick={() => {
              engage.patchList(session.business, list.id, { feeds: list.feeds.map((x) => (x.name === f.name ? { ...x, auto: false } : x)) })
              toast(`New matches are no longer added to ${f.name}`)
            }}
          >
            <ConsequenceLine className="mt-1" changes={`New matches stop being added to ${f.name}. Everyone already in it stays where they are.`} />
          </Action>
        ))}

        {watch && (
          <Action
            label={`Turn off ${watch.agent} on this list`}
            onClick={() => { engage.patchList(session.business, list.id, { source: "manual" }); toast(`${watch.agent} no longer watches ${list.name}`) }}
          >
            <ConsequenceLine className="mt-1" credits={watch.perWeek} changes={`Stops about ${n(watch.perWeek)} credits a week. Research already done stays on the records`} />
          </Action>
        )}

        {list.mode === "segment" && (
          <Action
            label="Refresh now"
            onClick={() => { engage.patchList(session.business, list.id, { lastRefreshed: TODAY }); toast(`${list.name} refreshed · ${n(count)} match now`) }}
          >
            <ConsequenceLine className="mt-1" changes={`Re-runs the filters. ${n(count)} match right now`} />
          </Action>
        )}

        <Action label="Export CSV" onClick={() => toast(`Exported ${list.name} · ${n(count)} rows, in the order shown`)}>
          <ConsequenceLine className="mt-1" changes={`Writes ${n(count)} rows, in the order the list shows them`} />
        </Action>
      </div>

      <p className="border-t pt-3 text-xs text-muted-foreground">
        The {n(count)} {list.kind === "people" ? "people" : "companies"} are on the page, with search.
      </p>
    </div>
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
 * A template or snippet read beside the step that uses it: the copy itself, which is its first
 * level, and who else an edit to it would reach — the one thing a person about to change shared
 * copy has to see before they change it.
 */
const TemplateBeside: BesideComponent = ({ session, id }) => {
  const rows = copyRows(session.business)
  const row = rows.find((r) => r.id === id)
  if (!row) return <Missing what="template" />

  const seed = seedFor(session.business)
  const mine = seed.mailboxes.find((m) => m.owner === session.user)?.address
    ?? seed.users.find((u) => u.name === session.user)?.mailbox
    ?? "your own address"

  return (
    <div className="space-y-4">
      <dl className="space-y-2.5">
        <Field label="Kind">
          <span className="flex flex-wrap items-center gap-1.5">
            <Pill tone="muted">{row.kind}</Pill><Pill tone="muted">{row.folder}</Pill>
          </span>
        </Field>
        <Field label="Owner">{row.owner}</Field>
        <Field label="Updated">{row.updated ? day(row.updated) : "—"} · last used {row.lastUsed ? ago(row.lastUsed) : "never"}</Field>
        {row.kind === "Template" && <Field label="Subject">{row.subject || "No subject"}</Field>}
        <Field label="Body"><span className="block whitespace-pre-wrap">{row.body}</span></Field>
        <Field label="Used by">{usedByLine(row)}</Field>
      </dl>

      <div className="space-y-3 border-t pt-3">
        <Action label={`Send a test to ${mine}`} onClick={() => toast(`Test sent to ${mine}`)}>
          <ConsequenceLine className="mt-1" sends={1} to="you" from={mine} changes="It goes to your own address and nobody else" />
        </Action>

        <Action label="Copy the text" onClick={() => toast(`${row.name} copied · this copy is not linked, so edits here change nothing else`)}>
          <ConsequenceLine className="mt-1" changes="Takes a copy. A copy is not linked, so editing it changes nothing else" />
        </Action>
      </div>

      <p className="border-t pt-3 text-xs text-muted-foreground">
        Editing the copy and the full list of what uses it are on the page.
      </p>
    </div>
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
