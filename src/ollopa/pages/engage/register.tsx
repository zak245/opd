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
// Then the actions the chain needs, each a real button with what it will do written under it, and
// each one likewise a usage item. Nothing in a pane body opens a door, a panel or another pane: past
// these fields the way on is "Open the page" in the frame above.
import { declarePaneFields } from "../../ui/Beside"
import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import type { PageComponent } from "../../Product"
import type { BesideComponent } from "../../beside"
import { ConsequenceLine } from "../../ui/ConsequenceLine"
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

/**
 * One block of a pane body, named by the usage item that decides whether it belongs at level one.
 * `node` may be null when the object simply has not got the thing (no agent watches this list, this
 * sequence is not a draft) — object state, which is the other half of what decides a level.
 */
interface Block {
  /** A usage item id on the record's page. */
  id: string
  kind: "field" | "action"
  node: ReactNode
}

const field = (id: string, node: ReactNode): Block => ({ id, kind: "field", node })
const action = (id: string, node: ReactNode): Block => ({ id, kind: "action", node })

/**
 * The blocks the usage model puts at level one for this seat, in the record's own order.
 *
 * The order comes from `d.items` — the usage file's order, which is the order the record page is
 * written in — so the pane and the record can never disagree about what comes first. Fields keep
 * that order among themselves and actions among themselves, because a record reads as what it is
 * and then what you can do to it.
 */
function PaneBody({ d, blocks, tail }: { d: Disclosure; blocks: Block[]; tail?: ReactNode }) {
  const byId = new Map(blocks.filter((b) => b.node !== null && b.node !== undefined).map((b) => [b.id, b]))
  const shown = d.items.map((i) => byId.get(i.id)).filter((b): b is Block => !!b && d.level(b.id) === 1)
  const fields = shown.filter((b) => b.kind === "field")
  const actions = shown.filter((b) => b.kind === "action")

  return (
    <div className="space-y-4">
      {fields.length > 0 && (
        <dl className="space-y-2.5">
          {fields.map((b) => <div key={b.id} data-pane-item={b.id}>{b.node}</div>)}
        </dl>
      )}
      {actions.length > 0 && (
        <div className="space-y-3 border-t pt-3">
          {actions.map((b) => <div key={b.id} data-pane-item={b.id}>{b.node}</div>)}
        </div>
      )}
      {tail && <p className="border-t pt-3 text-xs text-muted-foreground">{tail}</p>}
    </div>
  )
}

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
    <>
      <Button size="sm" variant="outline" className="w-full justify-start" disabled={disabled} onClick={onClick}>{label}</Button>
      {children}
    </>
  )
}

/**
 * A destructive action inside a pane. A pane may not open a panel, so the confirmation is the
 * control itself: the first press arms it and says what the second press will do, and the second
 * press does it. The result is visible before commitment either way (rule 7, chain card 7).
 */
function ArmedAction({ label, armedLabel, consequence, onConfirm }: {
  label: string; armedLabel: string; consequence: ReactNode; onConfirm: () => void
}) {
  const [armed, setArmed] = useState(false)
  return (
    <>
      <Button
        size="sm"
        variant={armed ? "destructive" : "outline"}
        className="w-full justify-start"
        onClick={() => { if (armed) { setArmed(false); onConfirm() } else setArmed(true) }}
      >
        {armed ? armedLabel : label}
      </Button>
      {consequence}
      {armed && (
        <button type="button" className="mt-1 text-xs underline underline-offset-2" onClick={() => setArmed(false)}>
          Leave it as it is
        </button>
      )}
    </>
  )
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
  const total = totalPeople(seq)
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

  const archive = () => {
    engage.patchSequence(session.business, seq.id, { archivedAt: TODAY, status: "Paused" })
    engage.logChange(session.business, seq.id, session.user, "Archived the sequence")
    toast(`${seq.name} archived · ${n(seq.active + seq.paused)} people marked finished, their scheduled emails deleted`)
  }

  return (
    <PaneBody
      d={d}
      tail="The steps, the enrolled people and the sending settings are on the page."
      blocks={[
        field("seq.page.health", (
          <Field label="Sending">
            <Pill tone={st.tone}>{st.label}</Pill>
            <div className="mt-1 text-xs text-muted-foreground">
              Bounce rate {seq.bounceRate7d}% over 7 days · warns at {BOUNCE_GUARD.warnPercent}%, pauses at {BOUNCE_GUARD.pausePercent}%
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

        action("seq.page.status", (
          <Action
            label={guarded ? "Review and resume on the page" : seq.status === "Active" ? "Pause" : "Resume"}
            disabled={guarded}
            onClick={pauseResume}
          >
            <ConsequenceLine
              className="mt-1"
              changes={guarded
                ? "Bounce guard paused this. Resuming needs the bounced people removed or the data fixed first, on the page."
                : consequence}
            />
          </Action>
        )),
        action("seq.page.duplicate", (
          <Action label="Duplicate" onClick={() => toast(`Copied ${seq.name}: steps and settings, nobody in it`)}>
            <ConsequenceLine className="mt-1" changes={`Copies the ${n(steps.length)} steps and the sending settings. Nobody is put in the copy.`} />
          </Action>
        )),
        action("seq.page.archive", seq.archivedAt ? null : (
          <ArmedAction
            label="Archive"
            armedLabel={`Archive ${seq.name} · press again`}
            onConfirm={archive}
            consequence={<ConsequenceLine className="mt-1" changes={`Marks ${n(seq.active + seq.paused)} people finished and deletes their scheduled emails. Their replies and activity stay on their records.`} />}
          />
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

  return (
    <PaneBody
      d={d}
      tail={`The ${n(count)} ${kind} are on the page, with search.`}
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
            <span className="font-medium text-amber-700 tabular-nums dark:text-amber-400">{n(doubled)} already in another sequence</span>
          </Field>
        ) : null),
        field("lists.touch-estimate", (
          <Field label="As work">{n(count)} {kind} · {touchEstimate(count, session.business)}</Field>
        )),

        action("detail.auto-feed", autoFeed ? (
          <Action
            label={`Turn off the feed into ${autoFeed.name}`}
            onClick={() => {
              engage.patchList(session.business, list.id, { feeds: list.feeds.map((x) => (x.name === autoFeed.name ? { ...x, auto: false } : x)) })
              toast(`New matches are no longer added to ${autoFeed.name}`)
            }}
          >
            <ConsequenceLine className="mt-1" changes={`New matches stop being added to ${autoFeed.name}. Everyone already in it stays where they are.`} />
          </Action>
        ) : null),
        action("lists.agent-watch", watch ? (
          <Action
            label={`Turn off ${watch.agent} on this list`}
            onClick={() => { engage.patchList(session.business, list.id, { source: "manual" }); toast(`${watch.agent} no longer watches ${list.name}`) }}
          >
            <ConsequenceLine className="mt-1" credits={watch.perWeek} changes={`Stops about ${n(watch.perWeek)} credits a week. Research already done stays on the records`} />
          </Action>
        ) : null),
        action("detail.refresh", list.mode === "segment" ? (
          <Action
            label="Refresh now"
            onClick={() => { engage.patchList(session.business, list.id, { lastRefreshed: TODAY }); toast(`${list.name} refreshed · ${n(count)} match now`) }}
          >
            <ConsequenceLine className="mt-1" changes={`Re-runs the filters. ${n(count)} match right now · last refreshed ${list.lastRefreshed ? ago(list.lastRefreshed) : "never"}`} />
          </Action>
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
      tail="Editing the copy and the full list of what uses it are on the page."
      blocks={[
        field("tpl.body", (
          <Field label={row.kind === "Template" ? "Subject" : "Body"}>
            {row.kind === "Template" && <div className="font-medium">{row.subject || "No subject"}</div>}
            <div className="whitespace-pre-wrap">{row.body}</div>
            {row.snippetIds.length > 0 && (
              <div className="mt-1 text-xs text-muted-foreground">
                Nests {n(row.snippetIds.length)} {row.snippetIds.length === 1 ? "snippet" : "snippets"}, owned elsewhere
              </div>
            )}
          </Field>
        )),
        field("tpl.used-by", <Field label="Used by">{usedByLine(row)}</Field>),
        field("tpl.preview", (
          <Field label="Variables">
            {tokens.length === 0
              ? "None in this copy"
              : unfilled.length === 0
                ? `${n(tokens.length)} — all of them fill from the contact`
                : `${n(unfilled.length)} of ${n(tokens.length)} have no value from a contact: ${unfilled.join(", ")}`}
          </Field>
        )),

        action("tpl.test-send", (
          <Action label={`Send a test to ${mine}`} onClick={() => toast(`Test sent to ${mine}`)}>
            <ConsequenceLine className="mt-1" sends={1} to="you" from={mine} changes="It goes to your own address and nobody else" />
          </Action>
        )),
        action("tpl.archive", (
          <ArmedAction
            label="Archive"
            armedLabel={`Archive ${row.name} · press again`}
            onConfirm={() => toast(`${row.name} archived · ${n(row.usedBySteps.length)} steps keep the text they have today`)}
            consequence={<ConsequenceLine
              className="mt-1"
              changes={row.usedBySteps.length
                ? `${n(row.usedBySteps.length)} linked ${row.usedBySteps.length === 1 ? "step keeps" : "steps keep"} the text they have today; nothing changes for anyone in a sequence`
                : "Nothing uses this today"}
            />}
          />
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
