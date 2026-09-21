// The marketing folder's nodes — Campaigns with its three objects, and Workflows with its record —
// and the four panes those objects read in when another page opens one beside itself.
//
// A pane body is the record's own first level. Not a fixed list of fields: the same question the
// record page asks, `useDisclosure`, decides which of the record's fields the pane carries, for this
// seat at this business, and they stay in the record's own order. So a Ridgeline marketer and a
// Meridian admin open the same campaign beside the same page and read different first levels, which
// is the whole point of the disclosure model — a pane that hard-codes its fields is a second, silent
// answer to a question the product already answers in one place.
//
// Under the fields are the actions the chain needs, each a real button with what it will do written
// under it, and one line saying what the last action did with Undo beside it. Nothing in a pane
// opens a door, a panel or a further level: past these the way on is "Open the page" above.
import { declarePaneFields } from "../../ui/Beside"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import type { PageComponent } from "../../Product"
import type { BesideComponent } from "../../beside"
import { ConsequenceLine } from "../../ui/ConsequenceLine"
import { useDisclosure, type Disclosure } from "../../ui/useDisclosure"
import { toast } from "../../templates/TablePage"
import { businessById } from "../../data/businesses"
import { TODAY, seedFor } from "../../data/seed"
import { CampaignsPage } from "./CampaignsPage"
import { CampaignRecord } from "./CampaignRecord"
import { AudienceRecord } from "./AudienceRecord"
import { FormRecord } from "./FormRecord"
import { WorkflowsPage } from "./WorkflowsPage"
import { WorkflowRecord } from "./WorkflowRecord"
import { ActedNote, actOn, noteOn, useActed } from "./acted"
import { netSize, suppressedTotal } from "./derive"
import { ago, day, num } from "./format"
import { marketingRows, useMarketing } from "./store"

export const nodes: Record<string, PageComponent> = {
  "P-campaigns": CampaignsPage,
  "R-campaign": CampaignRecord,
  "R-audience": AudienceRecord,
  "R-form": FormRecord,
  "P-workflows": WorkflowsPage,
  "R-workflow": WorkflowRecord,
}

/* ---------------------------------------------------------------- the shape every pane body has */

/**
 * One field of the record, with the usage item that decides whether it is at level one. `item` is
 * never optional: a field with no item behind it would be a field nobody can move.
 */
interface PaneField {
  item: string
  label: string
  value: ReactNode
  under?: ReactNode
}

/** What the usage model puts at level one for this seat, in the record's own order. */
function levelOne(d: Disclosure, fields: PaneField[]) {
  return fields.filter((f) => d.level(f.item) === 1)
}

/** The record's header grid, in the pane's one column. Same labels, same order, no links. */
function Fields({ d, fields }: { d: Disclosure; fields: PaneField[] }) {
  const shown = levelOne(d, fields)
  if (shown.length === 0) return null
  return (
    <dl className="space-y-2.5">
      {shown.map((f) => (
        <div key={f.label} className="grid grid-cols-[7rem_1fr] items-baseline gap-3">
          <dt className="text-xs text-muted-foreground">{f.label}</dt>
          <dd className="min-w-0">
            {f.value}
            {f.under && <div className="text-xs text-muted-foreground">{f.under}</div>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** One action: the control, and the sentence saying what it will do, directly under it (rule 7). */
function Action({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <div>
      <Button size="sm" variant="outline" className="w-full justify-start" disabled={disabled} onClick={onClick}>{label}</Button>
      {children}
    </div>
  )
}

function Missing({ what }: { what: string }) {
  return <p className="text-muted-foreground">That {what} is not here. It may have been deleted.</p>
}

/* --------------------------------------------------------------------------- audience (R-audience) */

const AudienceBeside: BesideComponent = ({ session, id }) => {
  const rows = useMarketing(session.business)
  const d = useDisclosure("campaigns")
  declarePaneFields("campaigns")
  // What an action took on this audience this session. The rows behind read the same record, so the
  // pane and the page can never say two different things about it.
  const acted = useActed("audience", id)
  const a = rows.audiences.find((x) => x.id === id)
  if (!a) return <Missing what="audience" />

  const net = netSize(a)
  const live = a.mode === "live"

  return (
    <div className="space-y-4">
      <Fields d={d} fields={[
        { item: "aud.list", label: "Type", value: a.type },
        { item: "aud.list", label: "Total size", value: <span className="tabular-nums">{num(a.size)}</span> },
        { item: "aud.suppressed", label: "After suppressions", value: <span className="font-medium tabular-nums">{num(net)}</span>, under: `${num(suppressedTotal(a))} suppressed` },
        { item: "aud.list", label: "Last rebuilt", value: `${day(a.lastRebuilt)} · ${ago(a.lastRebuilt)}` },
        { item: "aud.used-by", label: "Built for", value: a.usedBy[0] ?? "No campaign yet" },
      ]} />

      <ActedNote business={session.business} kind="audience" id={a.id} edit={acted} />

      <div className="space-y-3 border-t pt-3">
        <Action label="Rebuild now" onClick={() => {
          actOn(session.business, "audience", a.id, { lastRebuilt: TODAY }, { lastRebuilt: a.lastRebuilt },
            `rebuilt today · ${num(net)} after suppressions`)
          toast(`${a.name} rebuilt · ${num(net)} after suppressions.`)
        }}>
          <ConsequenceLine className="mt-1" changes={`Runs the rules again now; the total and the ${num(net)} after suppressions may both change`} />
        </Action>

        <Action label={live ? "Freeze" : "Make live"} onClick={() => {
          actOn(
            session.business, "audience", a.id,
            live ? { mode: "frozen", frozenAt: TODAY, refreshAt: null } : { mode: "live", frozenAt: null, refreshAt: TODAY },
            { mode: a.mode, frozenAt: a.frozenAt, refreshAt: a.refreshAt },
            live ? `frozen at ${num(a.size)} · no new match is added` : "live again · refreshes daily at 06:00",
          )
          toast(live ? `${a.name} frozen at ${num(a.size)}. No new matches are added.` : `${a.name} is live again and refreshes daily at 06:00.`)
        }}>
          <ConsequenceLine
            className="mt-1"
            changes={live
              ? `Holds ${a.name} at ${num(a.size)}; no new match is added to ${a.usedBy[0] ?? "any campaign"} again`
              : `Refreshes ${a.name} daily at 06:00 and adds new matches to ${a.usedBy[0] ?? "the campaigns using it"}`}
          />
        </Action>
      </div>
    </div>
  )
}

AudienceBeside.head = ({ session, id }) => {
  const a = marketingRows(session.business).audiences.find((x) => x.id === id)
  if (!a) return { name: id, context: "", route: `/ollopa/audiences/${id}` }
  return {
    name: a.name,
    context: `${a.type} · ${a.mode === "live" ? "live" : "frozen"} · ${num(netSize(a))} after suppressions`,
    route: `/ollopa/audiences/${a.id}`,
  }
}

/* --------------------------------------------------------------------------- campaign (R-campaign) */

const CampaignBeside: BesideComponent = ({ session, id }) => {
  const rows = useMarketing(session.business)
  const d = useDisclosure("campaigns")
  declarePaneFields("campaigns")
  const b = businessById(session.business)
  const acted = useActed("campaign", id)
  const c = rows.campaigns.find((x) => x.id === id)
  if (!c) return <Missing what="campaign" />

  const audience = rows.audiences.find((x) => x.id === c.audienceId)
  const recipients = audience ? netSize(audience) : c.audienceSize
  const testTo = `${session.user.split(" ")[0].toLowerCase()}@${b.id === "meridian" ? "meridian.io" : `${b.id}.com`}`
  const sending = c.status === "Sending" || c.status === "Running"

  return (
    <div className="space-y-4">
      <Fields d={d} fields={[
        { item: "camp.list.name", label: "Kind", value: c.kind },
        { item: "camp.list.status", label: "Status", value: c.status, under: c.pausedBy ? `by ${c.pausedBy.toLowerCase()}` : undefined },
        { item: "camp.list.owner", label: "Owner", value: c.owner },
        {
          item: "camp.detail.audience", label: "Audience",
          value: audience ? audience.name : `Audience removed; ${num(c.audienceSize)} people at send time`,
          under: `${num(recipients)} after suppressions`,
        },
        { item: "camp.list.conversions", label: "Goal", value: c.goal },
        ...(c.kind === "Lifecycle"
          ? [{ item: "camp.detail.trigger", label: "Trigger", value: c.trigger ?? "—", under: "Measured on enrolment over the period" }]
          : [{ item: "camp.list.send-time", label: "Send", value: c.status === "Scheduled" ? `Scheduled ${day(c.sendAt)}` : c.sendAt ? `Sent ${day(c.sendAt)}` : "Not scheduled" }]),
        { item: "camp.list.from", label: "From", value: `${c.fromName} · ${c.fromMailbox}` },
      ]} />

      <ActedNote business={session.business} kind="campaign" id={c.id} edit={acted} />

      <div className="space-y-3 border-t pt-3">
        {/* A send in flight is the one thing a person reading this beside another page may have to
            stop, so pause is the first control and it is never further away than one click. */}
        {sending || c.status === "Paused" ? (
          <Action
            label={c.status === "Paused" ? "Resume" : "Pause"}
            onClick={() => {
              if (c.status === "Paused") {
                const passed = c.sendAt !== null && c.sendAt < TODAY
                const next = c.kind === "Lifecycle" ? "Running" : passed ? "Draft" : "Scheduled"
                actOn(session.business, "campaign", c.id, { status: next, pausedBy: null }, { status: c.status, pausedBy: c.pausedBy },
                  passed ? "resumed as a draft · the kept send time has passed" : `resumed · ${next.toLowerCase()}`)
                toast(passed ? `${c.name} resumed as a draft: the kept time has passed.` : `${c.name} resumed.`)
              } else {
                actOn(session.business, "campaign", c.id, { status: "Paused", pausedBy: session.user }, { status: c.status, pausedBy: c.pausedBy },
                  `paused by ${session.user} · the send time is kept`)
                toast(`${c.name} paused. The send time is kept.`)
              }
            }}
          >
            <ConsequenceLine
              className="mt-1"
              changes={c.status === "Paused"
                ? "Starts sending again from where it stopped; the kept send time is used, or asked for again when it has passed"
                : `Stops the send now. The ${num(c.sent)} already sent stay sent; the send time is kept.`}
            />
          </Action>
        ) : null}

        <Action label={`Send a test to ${testTo}`} onClick={() => {
          noteOn("campaign", c.id, `test sent to ${testTo}`)
          toast(`Test sent to ${testTo} from ${c.fromMailbox}.`)
        }}>
          <ConsequenceLine
            className="mt-1"
            sends={1} to={testTo} from={c.fromMailbox}
            changes="The test carries a working unsubscribe link that unsubscribes nobody"
          />
        </Action>
      </div>
    </div>
  )
}

CampaignBeside.head = ({ session, id }) => {
  const rows = marketingRows(session.business)
  const c = rows.campaigns.find((x) => x.id === id)
  if (!c) return { name: id, context: "", route: `/ollopa/campaigns/${id}` }
  const audience = rows.audiences.find((x) => x.id === c.audienceId)
  return {
    name: c.name,
    context: `${c.kind} · ${c.status} · ${num(audience ? netSize(audience) : c.audienceSize)} recipients`,
    route: `/ollopa/campaigns/${c.id}`,
  }
}

/* ----------------------------------------------------------------------------------- form (R-form) */

const FormBeside: BesideComponent = ({ session, id }) => {
  const rows = useMarketing(session.business)
  const d = useDisclosure("campaigns")
  declarePaneFields("campaigns")
  const acted = useActed("form", id)
  const f = rows.forms.find((x) => x.id === id)
  if (!f) return <Missing what="form" />

  const live = f.status === "Live"
  const atCap = f.enrichUsedToday >= f.enrichCapDaily

  return (
    <div className="space-y-4">
      <Fields d={d} fields={[
        { item: "form.row", label: "Status", value: f.status },
        { item: "form.submissions", label: "Submissions, 7 days", value: <span className="tabular-nums">{num(f.submissions7d)}</span> },
        { item: "form.routing", label: "Routes to", value: f.routesTo },
        { item: "form.row", label: "Reports to", value: f.reportsTo },
        { item: "form.row", label: "Last submission", value: day(f.lastSubmission) },
        // Spend against a cap and a person who reached nobody are both decision-critical, so the
        // usage model keeps them at level one for every seat, and so does this pane.
        {
          item: "form.cap", label: "Enrichment today",
          value: <span className={atCap ? "font-medium tabular-nums text-amber-700 dark:text-amber-400" : "tabular-nums"}>{num(f.enrichUsedToday)} of {num(f.enrichCapDaily)} credits</span>,
          under: `${num(f.matched)} of ${num(f.submissions7d)} matched${atCap ? " · at the cap, submissions are still accepted and routed" : ""}`,
        },
        {
          item: "form.unrouted", label: "Could not route",
          value: f.unrouted > 0
            ? <span className="font-medium tabular-nums text-amber-700 dark:text-amber-400">{num(f.unrouted)} reached nobody</span>
            : <span className="tabular-nums">0</span>,
        },
      ]} />

      <ActedNote business={session.business} kind="form" id={f.id} edit={acted} />

      <div className="space-y-3 border-t pt-3">
        <Action label={live ? "Turn the form off" : "Turn the form on"} onClick={() => {
          actOn(session.business, "form", f.id, { status: live ? "Off" : "Live" }, { status: f.status },
            live ? "turned off · submissions stop, the ones you have are kept" : `turned on · routing to ${f.routesTo}`)
          toast(live ? `${f.name} is off. Submissions stop; the ones you have are kept.` : `${f.name} is live. Submissions are accepted and routed to ${f.routesTo}.`)
        }}>
          <ConsequenceLine
            className="mt-1"
            changes={live
              ? `Stops accepting submissions now. The ${num(f.submissions.length)} you already have are kept.`
              : `Starts accepting submissions and routing them to ${f.routesTo}`}
          />
        </Action>

        <Action label="Copy the form link" onClick={() => {
          noteOn("form", f.id, "link copied")
          toast(`Link to ${f.name} copied.`)
        }}>
          <ConsequenceLine className="mt-1" changes="Copies the public link to your clipboard; nothing about the form changes" />
        </Action>
      </div>
    </div>
  )
}

FormBeside.head = ({ session, id }) => {
  const f = marketingRows(session.business).forms.find((x) => x.id === id)
  if (!f) return { name: id, context: "", route: `/ollopa/forms/${id}` }
  return {
    name: f.name,
    context: `${f.status} · ${num(f.submissions7d)} submissions in 7 days · routes to ${f.routesTo}`,
    route: `/ollopa/forms/${f.id}`,
  }
}

/* --------------------------------------------------------------------------- workflow (R-workflow) */

const WorkflowBeside: BesideComponent = ({ session, id }) => {
  const rows = useMarketing(session.business)
  const d = useDisclosure("workflows")
  declarePaneFields("workflows")
  const seed = seedFor(session.business)
  const acted = useActed("workflow", id)
  const w = rows.workflows.find((x) => x.id === id)
  if (!w) return <Missing what="workflow" />

  const on = w.status === "on"
  const atCeiling = w.ceiling.spentToday >= w.ceiling.perDay
  const matchNow = seed.contacts.filter((c) => w.enrolment.length === 0 || w.enrolment.every((f) => {
    if (f.field === "country") return f.value.split(",").map((v) => v.trim()).includes(c.location.country)
    if (f.field === "emailStatus") return c.emailStatus === f.value
    return true
  })).length

  return (
    <div className="space-y-4">
      <Fields d={d} fields={[
        { item: "wf.trigger", label: "Trigger", value: `When ${w.trigger}` },
        { item: "wf.status", label: "Status", value: on ? "On" : "Off", under: `${w.statusChangedBy}, ${ago(w.statusChangedOn)}` },
        { item: "wf.table", label: "Owner", value: w.owner, under: `Told when it errors: ${w.owner}` },
        {
          item: "wf.ceiling", label: "Credit ceiling",
          value: <span className={atCeiling ? "font-medium tabular-nums text-amber-700 dark:text-amber-400" : "tabular-nums"}>{num(w.ceiling.spentToday)} of {num(w.ceiling.perDay)} today</span>,
          under: atCeiling ? `Reached · at most ${num(w.ceiling.perRun)} a run` : `${num(w.ceiling.perRun)} a run at most`,
        },
        { item: "wf.history", label: "Last edited", value: `${w.editedBy}, ${day(w.editedOn)}` },
        ...(w.sla
          ? [
            { item: "wf.sla-running", label: "On the clock", value: <span className="tabular-nums">{num(w.sla.running)} running</span>, under: `Window ${w.sla.windows.hot} hot · ${w.sla.windows.warm} warm` },
            { item: "wf.sla-breached", label: "Breached today", value: <span className={w.sla.breachedToday > 0 ? "font-medium tabular-nums text-amber-700 dark:text-amber-400" : "tabular-nums"}>{num(w.sla.breachedToday)}</span> },
          ]
          : []),
      ]} />

      <ActedNote business={session.business} kind="workflow" id={w.id} edit={acted} />

      <div className="space-y-3 border-t pt-3">
        <Action label={on ? "Turn off" : "Turn on"} onClick={() => {
          actOn(
            session.business, "workflow", w.id,
            { status: on ? "off" : "on", statusChangedBy: session.user, statusChangedOn: TODAY },
            { status: w.status, statusChangedBy: w.statusChangedBy, statusChangedOn: w.statusChangedOn },
            on ? `turned off · the ${num(w.sla?.running ?? 0)} already running finish` : `turned on · ${num(matchNow)} match the filter today`,
          )
          toast(on
            ? `${w.name} stops enrolling. The ${num(w.sla?.running ?? 0)} people already running finish their steps.`
            : `${w.name} is on. ${num(matchNow)} people match the filter today.`)
        }}>
          <ConsequenceLine
            className="mt-1"
            changes={on
              ? `Stops enrolling. The ${num(w.sla?.running ?? 0)} people already running finish their steps.`
              : `Turns on now. ${num(matchNow)} people match the filter today; the daily limit is ${num(w.limits.perDay)}, so the rest wait.`}
          />
        </Action>
      </div>
    </div>
  )
}

WorkflowBeside.head = ({ session, id }) => {
  const w = marketingRows(session.business).workflows.find((x) => x.id === id)
  if (!w) return { name: id, context: "", route: `/ollopa/workflows/${id}` }
  return {
    name: w.name,
    context: `${w.status === "on" ? "On" : "Off"} · when ${w.trigger} · ${w.owner}`,
    route: `/ollopa/workflows/${w.id}`,
  }
}

export const besides: Record<string, BesideComponent> = {
  audience: AudienceBeside,
  campaign: CampaignBeside,
  form: FormBeside,
  workflow: WorkflowBeside,
}
