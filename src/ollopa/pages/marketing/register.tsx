// The marketing folder's nodes — Campaigns with its three objects, and Workflows with its record —
// and the four panes those objects read in when another page opens one beside itself.
//
// A pane body is the record's own first level: the same fields, in the same order, with the same
// labels the record page opens with, and then the actions a chain arriving here needs, each a real
// button with what it will do written under it. Nothing in a pane opens a door, a panel or a further
// level: past these fields the way on is "Open the page" in the frame above.
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import type { PageComponent } from "../../Product"
import type { BesideComponent } from "../../beside"
import { ConsequenceLine } from "../../ui/ConsequenceLine"
import { toast } from "../../templates/TablePage"
import { businessById } from "../../data/businesses"
import { TODAY, seedFor } from "../../data/seed"
import { CampaignsPage } from "./CampaignsPage"
import { CampaignRecord } from "./CampaignRecord"
import { AudienceRecord } from "./AudienceRecord"
import { FormRecord } from "./FormRecord"
import { WorkflowsPage } from "./WorkflowsPage"
import { WorkflowRecord } from "./WorkflowRecord"
import { netSize, suppressedTotal } from "./derive"
import { ago, day, num } from "./format"
import { marketingRows, patchRow, useMarketing } from "./store"

export const nodes: Record<string, PageComponent> = {
  "P-campaigns": CampaignsPage,
  "R-campaign": CampaignRecord,
  "R-audience": AudienceRecord,
  "R-form": FormRecord,
  "P-workflows": WorkflowsPage,
  "R-workflow": WorkflowRecord,
}

/* ---------------------------------------------------------------- the shape every pane body has */

interface Line { label: string; value: ReactNode; under?: ReactNode }

/** The record's header grid, in the pane's one column. Same labels, same order, no links. */
function Fields({ lines }: { lines: Line[] }) {
  return (
    <dl className="space-y-2.5">
      {lines.map((f) => (
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
  const a = rows.audiences.find((x) => x.id === id)
  if (!a) return <Missing what="audience" />

  const net = netSize(a)
  const live = a.mode === "live"

  return (
    <div className="space-y-4">
      <Fields lines={[
        { label: "Type", value: a.type },
        { label: "Total size", value: <span className="tabular-nums">{num(a.size)}</span> },
        { label: "After suppressions", value: <span className="font-medium tabular-nums">{num(net)}</span>, under: `${num(suppressedTotal(a))} suppressed` },
        { label: "Last rebuilt", value: `${day(a.lastRebuilt)} · ${ago(a.lastRebuilt)}` },
        { label: "Built for", value: a.usedBy[0] ?? "No campaign yet" },
      ]} />

      <div className="space-y-3 border-t pt-3">
        <Action label="Rebuild now" onClick={() => {
          patchRow(session.business, "audiences", a.id, { lastRebuilt: TODAY })
          toast(`${a.name} rebuilt · ${num(net)} after suppressions.`)
        }}>
          <ConsequenceLine className="mt-1" changes={`Runs the rules again now; the total and the ${num(net)} after suppressions may both change`} />
        </Action>

        <Action label={live ? "Freeze" : "Make live"} onClick={() => {
          patchRow(session.business, "audiences", a.id, live
            ? { mode: "frozen", frozenAt: TODAY, refreshAt: null }
            : { mode: "live", frozenAt: null, refreshAt: TODAY })
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
  const b = businessById(session.business)
  const c = rows.campaigns.find((x) => x.id === id)
  if (!c) return <Missing what="campaign" />

  const audience = rows.audiences.find((x) => x.id === c.audienceId)
  const recipients = audience ? netSize(audience) : c.audienceSize
  const testTo = `${session.user.split(" ")[0].toLowerCase()}@${b.id === "meridian" ? "meridian.io" : `${b.id}.com`}`
  const sending = c.status === "Sending" || c.status === "Running"

  return (
    <div className="space-y-4">
      <Fields lines={[
        { label: "Kind", value: c.kind },
        { label: "Status", value: c.status, under: c.pausedBy ? `by ${c.pausedBy.toLowerCase()}` : undefined },
        { label: "Owner", value: c.owner },
        {
          label: "Audience",
          value: audience ? audience.name : `Audience removed; ${num(c.audienceSize)} people at send time`,
          under: `${num(recipients)} after suppressions`,
        },
        { label: "Goal", value: c.goal },
        c.kind === "Lifecycle"
          ? { label: "Trigger", value: c.trigger ?? "—", under: "Measured on enrolment over the period" }
          : { label: "Send", value: c.status === "Scheduled" ? `Scheduled ${day(c.sendAt)}` : c.sendAt ? `Sent ${day(c.sendAt)}` : "Not scheduled" },
        { label: "From", value: `${c.fromName} · ${c.fromMailbox}` },
      ]} />

      <div className="space-y-3 border-t pt-3">
        {/* A send in flight is the one thing a person reading this beside another page may have to
            stop, so pause is the first control and it is never further away than one click. */}
        {sending || c.status === "Paused" ? (
          <Action
            label={c.status === "Paused" ? "Resume" : "Pause"}
            onClick={() => {
              if (c.status === "Paused") {
                const passed = c.sendAt !== null && c.sendAt < TODAY
                patchRow(session.business, "campaigns", c.id, { status: c.kind === "Lifecycle" ? "Running" : passed ? "Draft" : "Scheduled", pausedBy: null })
                toast(passed ? `${c.name} resumed as a draft: the kept time has passed.` : `${c.name} resumed.`)
              } else {
                patchRow(session.business, "campaigns", c.id, { status: "Paused", pausedBy: session.user })
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

        <Action label={`Send a test to ${testTo}`} onClick={() => toast(`Test sent to ${testTo} from ${c.fromMailbox}.`)}>
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
  const f = rows.forms.find((x) => x.id === id)
  if (!f) return <Missing what="form" />

  const live = f.status === "Live"
  const atCap = f.enrichUsedToday >= f.enrichCapDaily

  return (
    <div className="space-y-4">
      <Fields lines={[
        { label: "Status", value: f.status, under: atCap ? `At the cap: ${num(f.enrichUsedToday)} of ${num(f.enrichCapDaily)} credits used today` : undefined },
        { label: "Submissions, 7 days", value: <span className="tabular-nums">{num(f.submissions7d)}</span> },
        { label: "Routes to", value: f.routesTo, under: f.unrouted > 0 ? `${num(f.unrouted)} reached nobody` : undefined },
        { label: "Reports to", value: f.reportsTo },
        { label: "Last submission", value: day(f.lastSubmission) },
      ]} />

      <div className="space-y-3 border-t pt-3">
        <Action label={live ? "Turn the form off" : "Turn the form on"} onClick={() => {
          patchRow(session.business, "forms", f.id, { status: live ? "Off" : "Live" })
          toast(live ? `${f.name} is off. Submissions stop; the ones you have are kept.` : `${f.name} is live. Submissions are accepted and routed to ${f.routesTo}.`)
        }}>
          <ConsequenceLine
            className="mt-1"
            changes={live
              ? `Stops accepting submissions now. The ${num(f.submissions.length)} you already have are kept.`
              : `Starts accepting submissions and routing them to ${f.routesTo}`}
          />
        </Action>

        <Action label="Copy the form link" onClick={() => toast(`Link to ${f.name} copied.`)}>
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
  const seed = seedFor(session.business)
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
      <Fields lines={[
        { label: "Trigger", value: `When ${w.trigger}` },
        { label: "Status", value: on ? "On" : "Off", under: `${w.statusChangedBy}, ${ago(w.statusChangedOn)}` },
        { label: "Owner", value: w.owner, under: `Told when it errors: ${w.owner}` },
        {
          label: "Credit ceiling",
          value: <span className="tabular-nums">{num(w.ceiling.spentToday)} of {num(w.ceiling.perDay)} today</span>,
          under: atCeiling ? `Reached · at most ${num(w.ceiling.perRun)} a run` : `${num(w.ceiling.perRun)} a run at most`,
        },
        { label: "Last edited", value: `${w.editedBy}, ${day(w.editedOn)}` },
      ]} />

      <div className="space-y-3 border-t pt-3">
        <Action label={on ? "Turn off" : "Turn on"} onClick={() => {
          patchRow(session.business, "workflows", w.id, { status: on ? "off" : "on", statusChangedBy: session.user, statusChangedOn: TODAY })
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
