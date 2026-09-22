// The marketing folder's nodes — Campaigns with its three objects, and Workflows with its record —
// and the four panes those objects read in when another page opens one beside itself.
//
// A pane body is the record's own first level. Not a fixed list of fields: the same question the
// record page asks, `useDisclosure`, decides which of the record's fields the pane carries, for this
// seat at this business, and they stay in the record's own order.
//
// Under them are the acts a chain runs here — at most three, gated by the same model, all secondary
// because they are comparable (DESIGN.md §1) — and nothing that cannot be undone. Sending, resuming
// a send, turning a routing workflow on or off and deleting anything are all irreversible, so they
// stay on the record page with their confirmation, and the pane's way to them is "Open the page".
// That leaves these panes with one act each, and the workflow pane with none, which is the honest
// answer: reading a workflow beside a form is reading, not operating it.
//
// Nothing is written under a control that is free and can be undone (DESIGN.md §3). What an act did
// is said afterwards, where it was caused: the frame's footer line and the row behind both read the
// one shared edits record, and Undo there puts the row back.
import { type ReactNode } from "react"
import type { PageComponent } from "../../Product"
import type { BesideComponent } from "../../beside"
import { Actions, type Action } from "../../ui/Actions"
import { Chip } from "../../ui/Identity"
import { ink } from "./look"
import { declarePaneFields, useBesideDone } from "../../ui/Beside"
import { useDisclosure, type Disclosure } from "../../ui/useDisclosure"
import { toast } from "../../templates/TablePage"
import { TODAY } from "../../data/seed"
import { CampaignsPage } from "./CampaignsPage"
import { CampaignRecord } from "./CampaignRecord"
import { AudienceRecord } from "./AudienceRecord"
import { FormRecord } from "./FormRecord"
import { WorkflowsPage } from "./WorkflowsPage"
import { WorkflowRecord } from "./WorkflowRecord"
import { actOn, undoAct, useActed } from "./acted"
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

/** The record's header grid, in the pane's one column. Same labels, same order, no links. */
function Fields({ d, fields }: { d: Disclosure; fields: PaneField[] }) {
  const shown = fields.filter((f) => d.level(f.item) === 1)
  if (shown.length === 0) return null
  return (
    <dl className="space-y-2.5">
      {shown.map((f) => (
        <div key={f.label} className="grid grid-cols-[7rem_1fr] items-baseline gap-3">
          <dt className="t-label text-muted-foreground">{f.label}</dt>
          <dd className="t-body min-w-0">
            {f.value}
            {f.under && <div className="t-small text-muted-foreground">{f.under}</div>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** The acts this seat runs most, ranked by the model, three at most (DESIGN.md §1). */
function acts(d: Disclosure, candidates: { item: string; action: Action }[]): Action[] {
  return candidates
    .filter((c) => d.level(c.item) === 1)
    .sort((a, b) => d.weekly(b.item) - d.weekly(a.item))
    .slice(0, 3)
    .map((c) => c.action)
}

function Missing({ what }: { what: string }) {
  return <p className="t-body text-muted-foreground">That {what} is not here. It may have been deleted.</p>
}

/* --------------------------------------------------------------------------- audience (R-audience) */

const AudienceBeside: BesideComponent = ({ session, id }) => {
  const rows = useMarketing(session.business)
  const d = useDisclosure("campaigns")
  declarePaneFields("campaigns")
  // What an action took on this audience this session. The rows behind read the same record, so the
  // pane and the page can never say two different things about it — and Undo here is a real undo:
  // the record carries the values the act replaced.
  const acted = useActed("audience", id)
  useBesideDone(typeof acted?.note === "string"
    ? { note: acted.note, onUndo: () => undoAct(session.business, "audience", id, acted) }
    : null)

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

      {/* Freezing and making live are the one act this chain runs from here, and the model keeps it
          at level one for every seat because a live audience is a commitment the send makes. Both
          directions are reversible and free, so nothing is written under the control. */}
      <div className="border-t pt-3">
        <Actions surface="pane" layout="stack" items={acts(d, [
          {
            item: "aud.mode",
            action: {
              kind: "secondary",
              label: live ? "Freeze" : "Make live",
              onClick: () => {
                actOn(
                  session.business, "audience", a.id,
                  live ? { mode: "frozen", frozenAt: TODAY, refreshAt: null } : { mode: "live", frozenAt: null, refreshAt: TODAY },
                  { mode: a.mode, frozenAt: a.frozenAt, refreshAt: a.refreshAt },
                  live ? `frozen at ${num(a.size)} · no new match is added` : "live again · refreshes daily at 06:00",
                )
                toast(live ? `${a.name} frozen at ${num(a.size)}. No new matches are added.` : `${a.name} is live again and refreshes daily at 06:00.`)
              },
            },
          },
          {
            item: "aud.rebuild",
            action: {
              kind: "secondary",
              label: "Rebuild now",
              onClick: () => {
                actOn(session.business, "audience", a.id, { lastRebuilt: TODAY }, { lastRebuilt: a.lastRebuilt },
                  `rebuilt today · ${num(net)} after suppressions`)
                toast(`${a.name} rebuilt · ${num(net)} after suppressions.`)
              },
            },
          },
        ])} />
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
  const acted = useActed("campaign", id)
  useBesideDone(typeof acted?.note === "string"
    ? { note: acted.note, onUndo: () => undoAct(session.business, "campaign", id, acted) }
    : null)

  const c = rows.campaigns.find((x) => x.id === id)
  if (!c) return <Missing what="campaign" />

  const audience = rows.audiences.find((x) => x.id === c.audienceId)
  const recipients = audience ? netSize(audience) : c.audienceSize
  const sending = c.status === "Sending" || c.status === "Running"
  const mine = c.owner === session.user || session.role === "admin"

  return (
    <div className="space-y-4">
      <Fields d={d} fields={[
        { item: "camp.list.name", label: "Kind", value: c.kind },
        { item: "camp.list.status", label: "Status", value: <Chip status={c.status}>{c.status}</Chip>, under: c.pausedBy ? `by ${c.pausedBy.toLowerCase()}` : undefined },
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

      {/* Stopping a send is the one act that may never be further away than starting it, so it is
          here; starting again is a send, and a send cannot be undone, so Resume and Schedule stay on
          the record page with their confirmations. A seat that does not own this campaign gets the
          sentence naming who does, not a control it cannot press (RULES.md rule 4). */}
      {sending && (
        <div className="border-t pt-3">
          {mine ? (
            <Actions surface="pane" layout="stack" items={acts(d, [{
              item: "camp.act.pause",
              action: {
                kind: "secondary",
                label: "Pause",
                onClick: () => {
                  actOn(session.business, "campaign", c.id, { status: "Paused", pausedBy: session.user }, { status: c.status, pausedBy: c.pausedBy },
                    `paused by ${session.user} · the send time is kept`)
                  toast(`${c.name} paused. The send time is kept.`)
                },
              },
            }])} />
          ) : (
            <p className="text-xs text-muted-foreground">Owned by {c.owner}; the owner or an admin can pause this send.</p>
          )}
        </div>
      )}
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
  useBesideDone(typeof acted?.note === "string"
    ? { note: acted.note, onUndo: () => undoAct(session.business, "form", id, acted) }
    : null)

  const f = rows.forms.find((x) => x.id === id)
  if (!f) return <Missing what="form" />

  const live = f.status === "Live"
  const atCap = f.enrichUsedToday >= f.enrichCapDaily

  return (
    <div className="space-y-4">
      <Fields d={d} fields={[
        { item: "form.row", label: "Status", value: <Chip status={f.status}>{f.status}</Chip> },
        { item: "form.submissions", label: "Submissions, 7 days", value: <span className="tabular-nums">{num(f.submissions7d)}</span> },
        { item: "form.routing", label: "Routes to", value: f.routesTo },
        { item: "form.row", label: "Reports to", value: f.reportsTo },
        { item: "form.row", label: "Last submission", value: day(f.lastSubmission) },
        // Spend against a cap and a person who reached nobody are both decision-critical, so the
        // model keeps them at level one for every seat, and so does this pane.
        {
          item: "form.cap", label: "Enrichment today",
          value: <span className={atCap ? "font-medium tabular-nums" : "tabular-nums"} style={atCap ? ink("warning") : undefined}>{num(f.enrichUsedToday)} of {num(f.enrichCapDaily)} credits</span>,
          under: `${num(f.matched)} of ${num(f.submissions7d)} matched`,
        },
        {
          item: "form.unrouted", label: "Could not route",
          value: f.unrouted > 0
            ? <span className="font-medium tabular-nums" style={ink("danger")}>{num(f.unrouted)} reached nobody</span>
            : <span className="tabular-nums">0</span>,
        },
      ]} />

      <div className="border-t pt-3">
        <Actions surface="pane" layout="stack" items={acts(d, [{
          item: "form.row",
          action: {
            kind: "secondary",
            label: live ? "Turn the form off" : "Turn the form on",
            onClick: () => {
              actOn(session.business, "form", f.id, { status: live ? "Off" : "Live" }, { status: f.status },
                live ? "turned off · submissions stop, the ones you have are kept" : `turned on · routing to ${f.routesTo}`)
              toast(live ? `${f.name} is off. Submissions stop; the ones you have are kept.` : `${f.name} is live. Submissions are accepted and routed to ${f.routesTo}.`)
            },
          },
        }])} />
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

/**
 * The workflow pane carries no act at all, and that is the rule working rather than an omission.
 * Turning a routing workflow off loses every lead it would have routed while it was off; turning it
 * on enrols people and spends credits. Neither can be undone, so both stay on the record page with
 * their confirmation, and the way to them from here is "Open the page" in the header above.
 */
const WorkflowBeside: BesideComponent = ({ session, id }) => {
  const rows = useMarketing(session.business)
  const d = useDisclosure("workflows")
  declarePaneFields("workflows")
  const acted = useActed("workflow", id)
  useBesideDone(typeof acted?.note === "string"
    ? { note: acted.note, onUndo: () => undoAct(session.business, "workflow", id, acted) }
    : null)

  const w = rows.workflows.find((x) => x.id === id)
  if (!w) return <Missing what="workflow" />

  const on = w.status === "on"
  const atCeiling = w.ceiling.spentToday >= w.ceiling.perDay

  return (
    <div className="space-y-4">
      <Fields d={d} fields={[
        { item: "wf.trigger", label: "Trigger", value: `When ${w.trigger}` },
        { item: "wf.status", label: "Status", value: <Chip status={on ? "active" : "off"}>{on ? "On" : "Off"}</Chip>, under: `${w.statusChangedBy}, ${ago(w.statusChangedOn)}` },
        { item: "wf.table", label: "Owner", value: w.owner },
        {
          item: "wf.ceiling", label: "Credit ceiling",
          value: <span className={atCeiling ? "font-medium tabular-nums" : "tabular-nums"} style={atCeiling ? ink("warning") : undefined}>{num(w.ceiling.spentToday)} of {num(w.ceiling.perDay)} today</span>,
          under: `${num(w.ceiling.perRun)} a run at most`,
        },
        { item: "wf.history", label: "Last edited", value: `${w.editedBy}, ${day(w.editedOn)}` },
        ...(w.sla
          ? [
            { item: "wf.sla-running", label: "On the clock", value: <span className="tabular-nums">{num(w.sla.running)} running</span>, under: `Window ${w.sla.windows.hot} hot · ${w.sla.windows.warm} warm` },
            { item: "wf.sla-breached", label: "Breached today", value: <span className="font-medium tabular-nums" style={w.sla.breachedToday > 0 ? ink("danger") : undefined}>{num(w.sla.breachedToday)}</span> },
          ]
          : []),
      ]} />
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
