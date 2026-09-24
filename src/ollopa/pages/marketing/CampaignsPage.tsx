// Campaigns · Audiences · Forms (`P-campaigns`): one index, one table, three objects, the sending
// policy as the page's summary strip (specs/10-campaigns.md §3 and §6, LAYOUTS.md §1).
//
// The one thing the marketer must never lose sight of is what is about to go out, to how many people,
// and what it cost last time. So the bounce guard's two thresholds and the observed rate, the daily
// cap and what it has used, the delivery cell and unsubscribes are on the page whatever the usage
// number says; everything else is asked of the usage model and never hard-coded.
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { href, useRoute } from "@/app/router"
import { follow, type Origin } from "../../chain"
import { useEdits } from "../../edits"
import { Actions } from "../../ui/Actions"
import { IndexPage, SummaryStrip, type IndexColumn, type SummaryFigure } from "../../layouts"
import { FAMILY, ink } from "./look"
import { useTick } from "../engage/shared"
import { ActedNote, undoable } from "./acted"
import { toast } from "../../templates/TablePage"
import { Chip } from "../../ui/Identity"
import { Panel } from "../../ui/Panel"
import { EmptyState } from "../../ui/EmptyState"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { BOUNCE_GUARD, CAMPAIGN_CHECKS, TODAY, seedFor, type Audience, type Campaign, type Form } from "../../data/seed"
import type { Session } from "../../session"
import type { Business } from "../../usage/model"
import { useGrid, type GridColumn } from "./grid"
import { usePref } from "./prefs"
import { addRow, patchRow, removeRow, useMarketing } from "./store"
import { netSize, rulesApplied, suppressionCounts, suppressedTotal } from "./derive"
import { ago, day, num, pct } from "./format"

/** Status is a word and a colour, never a colour alone; the reason travels with it. */
export function StatusBadge({ c }: { c: Campaign }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <Chip status={c.status}>{c.status}</Chip>
      {c.pausedBy && <span className="t-small text-muted-foreground">by {c.pausedBy.toLowerCase()}</span>}
    </span>
  )
}

/** Sent, delivered and bounced are one fact and never sit in different cells (rule 5). */
export function DeliveryCell({ c }: { c: Campaign }) {
  const rate = c.sent ? (c.bounced / c.sent) * 100 : 0
  const past = rate >= BOUNCE_GUARD.pausePercent ? "pause" : rate >= BOUNCE_GUARD.warnPercent ? "warn" : null
  if (c.sent === 0) return <span className="text-muted-foreground">Nothing sent yet</span>
  return (
    <div className="min-w-0 tabular-nums">
      <div className="t-body">{num(c.sent)} sent</div>
      <div className="t-small text-muted-foreground">{num(c.delivered)} delivered · {pct(c.delivered, c.sent)}</div>
      <div
        className={cn("t-small", past ? "font-medium" : "text-muted-foreground")}
        style={past ? ink(past === "pause" ? "danger" : "warning") : undefined}
      >
        {num(c.bounced)} bounced · {pct(c.bounced, c.sent)}
        {past === "warn" && ` — past the ${BOUNCE_GUARD.warnPercent}% warn threshold`}
        {past === "pause" && ` — past the ${BOUNCE_GUARD.pausePercent}% pause threshold`}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------------- the page */

type View = "campaigns" | "audiences" | "forms"

export function CampaignsPage({ session }: { session: Session }) {
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const rows = useMarketing(session.business)
  const d = useDisclosure("campaigns")
  const admin = b.roles.find((r) => r.role === "admin")?.user ?? "your admin"
  const isAdmin = session.role === "admin"

  const [view, setView] = usePref<View>("campaigns.view", "campaigns")
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [kind, setKind] = useState("all")
  const [owner, setOwner] = useState("all")
  const [audience, setAudience] = useState("all")
  const [when, setWhen] = useState("all")
  const [newPanel, setNewPanel] = useState(false)
  const [archiving, setArchiving] = useState<Campaign | null>(null)
  const [archiveReason, setArchiveReason] = useState("")
  const [deleting, setDeleting] = useState<Campaign | null>(null)
  const route = useRoute()
  // What a pane's actions did to these three objects this session, from the one store every page
  // reads, so a campaign paused from a pane beside another page says so on its row here.
  const campaignEdits = useEdits("campaign")
  const audienceEdits = useEdits("audience")
  const formEdits = useEdits("form")
  useTick(Object.values({ ...campaignEdits, ...audienceEdits, ...formEdits }).some(undoable))

  const at = (id: string) => d.level(id) === 1

  /**
   * The one way off this page. Opening a row is a step in a chain, not a jump: the trail keeps
   * "Campaigns" and the row that was left, so the crumb back lands on it, lit and focused.
   */
  const from = (anchor?: string): Origin => ({ route: route.raw, title: "Campaigns", anchor })
  const open = (to: string, anchor: string) => follow(to, from(anchor))

  /* ------------------------------------------------------------------- filters, level one and two */

  const filterControls = [
    { id: "camp.filter.status", key: "status", label: "Status", value: status, set: setStatus, options: ["Draft", "Scheduled", "Sending", "Sent", "Running", "Paused", "Archived"] },
    { id: "camp.filter.kind", key: "kind", label: "Kind", value: kind, set: setKind, options: ["Email", "Lifecycle"] },
    { id: "camp.filter.owner", key: "owner", label: "Owner", value: owner, set: setOwner, options: [...new Set(rows.campaigns.map((c) => c.owner))] },
    { id: "camp.filter.audience", key: "audience", label: "Audience", value: audience, set: setAudience, options: rows.audiences.map((a) => a.name) },
    { id: "camp.filter.date", key: "date", label: "Date", value: when, set: setWhen, options: ["Sent in the last 30 days", "Sending or scheduled"] },
  ]

  const Filter = ({ f }: { f: (typeof filterControls)[number] }) => (
    <Select value={f.value} onValueChange={f.set}>
      <SelectTrigger className="h-8 w-44 text-xs" aria-label={f.label}><SelectValue placeholder={f.label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{f.label}: all</SelectItem>
        {f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  )

  const campaigns = useMemo(() => rows.campaigns.filter((c) => {
    const needle = q.trim().toLowerCase()
    const aud = rows.audiences.find((a) => a.id === c.audienceId)
    if (needle && !`${c.name} ${c.subject} ${aud?.name ?? ""}`.toLowerCase().includes(needle)) return false
    if (status !== "all" && c.status !== status) return false
    if (kind !== "all" && c.kind !== kind) return false
    if (owner !== "all" && c.owner !== owner) return false
    if (audience !== "all" && aud?.name !== audience) return false
    if (when === "Sent in the last 30 days" && !(c.status === "Sent" && c.sendAt)) return false
    if (when === "Sending or scheduled" && !["Sending", "Scheduled"].includes(c.status)) return false
    return true
  }), [rows.campaigns, rows.audiences, q, status, kind, owner, audience, when])

  const forms = useMemo(() => rows.forms.filter((f) => f.name.toLowerCase().includes(q.trim().toLowerCase())), [rows.forms, q])
  const audiences = useMemo(() => rows.audiences.filter((a) => a.name.toLowerCase().includes(q.trim().toLowerCase())), [rows.audiences, q])

  /* -------------------------------------------------------------------------------- the actions */

  const pause = (c: Campaign) => {
    patchRow(session.business, "campaigns", c.id, { status: "Paused", pausedBy: session.user })
    toast(`${c.name} paused. The send time is kept; Resume asks for a new one if it has passed.`)
  }
  const resume = (c: Campaign) => {
    const passed = c.sendAt !== null && c.sendAt < TODAY
    patchRow(session.business, "campaigns", c.id, { status: c.kind === "Lifecycle" ? "Running" : passed ? "Draft" : "Scheduled", pausedBy: null })
    toast(passed ? `${c.name} resumed as a draft: the kept send time has passed, so choose a new one.` : `${c.name} resumed.`)
  }
  const duplicate = (c: Campaign) => {
    const copy: Campaign = {
      ...c, id: `${c.id}-copy-${Date.now().toString(36)}`, name: `${c.name} (copy)`, status: "Draft", pausedBy: null,
      sent: 0, delivered: 0, bounced: 0, opened: 0, clicked: 0, replied: 0, converted: 0, unsubscribed: 0, complaints: 0,
      qa: { by: null, on: null, checklist: c.qa.checklist.map((k) => ({ ...k, done: false })), checks: c.qa.checks.map((k) => ({ ...k, state: "not run" as const })) },
      activity: [{ at: TODAY, by: session.user, what: `Duplicated from ${c.name}` }],
      dealsCreated: 0, pipelineAmount: 0, pipelineInfluenced: 0,
    }
    addRow(session.business, "campaigns", copy)
    toast(`${copy.name} created as a draft. Audience, content and schedule kept; results reset.`)
  }

  const rowActions = (c: Campaign) => {
    switch (c.status) {
      case "Draft": return [{ label: "Edit", onClick: () => open(`/ollopa/campaigns/${c.id}`, c.id) }, { label: "Send test", onClick: () => open(`/ollopa/campaigns/${c.id}?open=test`, c.id) }]
      case "Scheduled": return [{ label: "Pause", onClick: () => pause(c) }, { label: "Send test", onClick: () => open(`/ollopa/campaigns/${c.id}?open=test`, c.id) }]
      case "Sending": case "Running": return [{ label: "Pause", onClick: () => pause(c) }]
      case "Paused": return [{ label: "Resume", onClick: () => resume(c) }]
      default: return [{ label: "Duplicate", onClick: () => duplicate(c) }]
    }
  }


  const rowMenu = (c: Campaign) => [
    { label: "Open the page", kind: "secondary" as const, onClick: () => open(`/ollopa/campaigns/${c.id}`, c.id) },
    { label: "Duplicate", kind: "secondary" as const, onClick: () => duplicate(c) },
    { label: "Compare with…", kind: "secondary" as const, onClick: () => toast(`Pick a second campaign to compare with ${c.name}.`) },
    { label: "Export results", kind: "secondary" as const, onClick: () => toast(`${c.name}: results exported as CSV, with the filters you are looking at.`) },
    { label: "Archive", kind: "destructive" as const, onClick: () => { setArchiveReason(""); setArchiving(c) } },
    ...(c.status === "Draft" ? [{ label: "Delete draft", kind: "destructive" as const, onClick: () => setDeleting(c) }] : []),
  ]

  /* ------------------------------------------------------------------------------- the columns */

  const campaignColumns: IndexColumn<Campaign>[] = [
    // The name is the control, as it is on People: one thing to tab to, one thing to press, and
    // the row is the anchor the crumb comes back to.
    { key: "status", priority: 1, header: "Status", cell: (c) => <StatusBadge c={c} /> },
    { key: "subject", priority: 3, header: "Subject", cell: (c) => c.subject },
    { key: "audience", priority: 1, header: "Audience", cell: (c) => {
      const a = rows.audiences.find((x) => x.id === c.audienceId)
      return a
        ? <div className="min-w-0"><div className="truncate">{a.name}</div><div className="text-xs tabular-nums text-muted-foreground">{num(netSize(a))} after suppressions</div></div>
        : <span className="text-muted-foreground">Audience removed; {num(c.audienceSize)} people at send time</span>
    } },
    { key: "delivery", priority: 1, header: "Delivery", cell: (c) => <DeliveryCell c={c} /> },
    { key: "opens", priority: 2, header: "Opened", cell: (c) => (
      <div className="tabular-nums"><div>{pct(c.opened, c.delivered)}</div><div className="text-xs text-muted-foreground">{num(c.opened)}</div></div>
    ) },
    { key: "clicks", priority: 2, header: "Clicked", cell: (c) => (
      <div className="tabular-nums"><div>{pct(c.clicked, c.delivered)}</div><div className="text-xs text-muted-foreground">{num(c.clicked)}</div></div>
    ) },
    { key: "replied", priority: 2, header: "Replied", cell: (c) => <span className="tabular-nums">{num(c.replied)}</span> },
    { key: "converted", priority: 2, header: "Converted", cell: (c) => (
      <div className="tabular-nums"><div>{num(c.converted)}</div><div className="text-xs text-muted-foreground">{c.goal}</div></div>
    ) },
    { key: "unsubscribed", priority: 3, header: "Unsubscribed", cell: (c) => (
      <div className="tabular-nums"><div>{num(c.unsubscribed)}</div><div className="text-xs text-muted-foreground">{pct(c.unsubscribed, c.delivered)}</div></div>
    ) },
    { key: "send", priority: 2, header: "Send", cell: (c) => (
      c.kind === "Lifecycle" ? <span className="text-muted-foreground">Runs on a trigger</span>
        : c.status === "Scheduled" ? <span>Scheduled {day(c.sendAt)}</span>
          : <span className="text-muted-foreground">{c.sendAt ? `Sent ${day(c.sendAt)}` : "Not scheduled"}</span>
    ) },
    { key: "trigger", priority: 3, header: "Trigger", cell: (c) => c.trigger ?? <span className="text-muted-foreground">—</span> },
    { key: "lastSend", priority: 3, header: "Last send", cell: (c) => (c.sendAt ? ago(c.sendAt) : "—") },
    { key: "owner", priority: 3, header: "Owner", cell: (c) => c.owner },
    { key: "from", priority: 3, header: "From", cell: (c) => <span className="text-xs">{c.fromName}<br />{c.fromMailbox}</span> },
    { key: "variants", priority: 3, header: "A/B", cell: (c) => (c.variants.length ? `${c.variants.length} variants` : "—") },
    { key: "created", priority: 3, header: "Created", cell: (c) => day(c.activity[c.activity.length - 1]?.at ?? c.sendAt) },
  ]

  const audienceColumns: IndexColumn<Audience>[] = [
    { key: "type", priority: 2, header: "Type", cell: (a) => a.type },
    { key: "mode", priority: 2, header: "Mode", cell: (a) => (
      a.mode === "live"
        ? <span>Live · refreshes daily {a.refreshAt ? "06:00" : ""}</span>
        : <span>Frozen at {num(a.size)} on {day(a.frozenAt)}</span>
    ) },
    { key: "size", priority: 2, header: "Size", cell: (a) => num(a.size) },
    { key: "net", priority: 1, header: "Net size", cell: (a) => <span className="font-medium">{num(netSize(a))}</span> },
    { key: "suppressed", priority: 3, header: "Suppressed", cell: (a) => (
      <ul className="t-small">
        {suppressionCounts(a).map((s) => (
          <li key={s.key} className={s.on ? "" : "text-muted-foreground"}>
            <span className="tabular-nums">{num(s.count)}</span> {s.label}
            {s.always ? ", always applied" : s.on ? "" : ", off"}
          </li>
        ))}
      </ul>
    ) },
    { key: "rebuilt", priority: 3, header: "Last rebuilt", cell: (a) => ago(a.lastRebuilt) },
    { key: "usedBy", priority: 3, header: "Used by", cell: (a) => (a.usedBy.length ? a.usedBy.join(", ") : <span className="text-muted-foreground">No campaign yet</span>) },
  ]

  const formColumns: IndexColumn<Form>[] = [
    { key: "status", priority: 1, header: "Status", cell: (f) => <Chip status={f.status}>{f.status}</Chip> },
    { key: "submissions", priority: 1, header: "Submissions, 7 days", cell: (f) => num(f.submissions7d) },
    { key: "enrichment", priority: 2, header: "Enrichment spend", cell: (f) => (
      <div className="min-w-0 tabular-nums">
        <div
          className={f.enrichUsedToday >= f.enrichCapDaily ? "t-body font-medium" : "t-body"}
          style={f.enrichUsedToday >= f.enrichCapDaily ? ink("warning") : undefined}
        >
          {num(f.enrichUsedToday)} of {num(f.enrichCapDaily)} credits today
        </div>
        <div className="t-small text-muted-foreground">{num(f.matched)} of {num(f.submissions7d)} matched</div>
      </div>
    ) },
    { key: "unrouted", priority: 1, header: "Could not route", cell: (f) => (
      f.unrouted > 0
        ? <span className="font-medium" style={ink("danger")}>{num(f.unrouted)} reached nobody</span>
        : <span className="text-muted-foreground">0</span>
    ) },
    { key: "routes", priority: 2, header: "Routes to", cell: (f) => f.routesTo },
    { key: "reports", priority: 3, header: "Reports to", cell: (f) => f.reportsTo },
    { key: "last", priority: 3, header: "Last submission", cell: (f) => ago(f.lastSubmission) },
  ]

  /* --------------------------------------------------------------------------------- the states */

  const nothing = rows.campaigns.length === 0 && rows.audiences.length === 0 && rows.forms.length === 0

  const views: { key: View; label: string; count: number }[] = [
    { key: "campaigns", label: "Campaigns", count: rows.campaigns.length },
    { key: "audiences", label: "Audiences", count: rows.audiences.length },
    { key: "forms", label: "Forms", count: rows.forms.length },
  ]

  /* ------------------------------------------------------------------------------- the bodies */

  const shownRows = view === "campaigns" ? campaigns.length : view === "audiences" ? audiences.length : forms.length
  const totalRows = view === "campaigns" ? rows.campaigns.length : view === "audiences" ? rows.audiences.length : rows.forms.length

  const audienceMenu = (a: Audience) => [
    { label: "Rebuild now", kind: "secondary" as const, onClick: () => { patchRow(session.business, "audiences", a.id, { lastRebuilt: TODAY }); toast(`${a.name} rebuilt · ${num(netSize(a))} after suppressions.`) } },
    { label: "Open the page", kind: "secondary" as const, onClick: () => open(`/ollopa/audiences/${a.id}`, a.id) },
    { label: "Hand to sales", kind: "secondary" as const, onClick: () => open(`/ollopa/audiences/${a.id}`, a.id) },
    { label: a.mode === "live" ? "Freeze" : "Make live", kind: "secondary" as const, onClick: () => { patchRow(session.business, "audiences", a.id, a.mode === "live" ? { mode: "frozen", frozenAt: TODAY, refreshAt: null } : { mode: "live", frozenAt: null, refreshAt: TODAY }); toast(`${a.name} is now ${a.mode === "live" ? "frozen" : "live"}.`) } },
    { label: "Delete audience", kind: "destructive" as const, onClick: () => toast(a.usedBy.length ? `${a.name} cannot be deleted: ${a.usedBy[0]} uses it.` : `${a.name} deleted.`) },
  ]

  const formMenu = (f: Form) => [
    { label: f.status === "Live" ? "Turn off" : "Turn on", kind: "secondary" as const, onClick: () => { patchRow(session.business, "forms", f.id, { status: f.status === "Live" ? "Off" : "Live" }); toast(`${f.name} is now ${f.status === "Live" ? "off — submissions stop" : "live — submissions are accepted and routed"}.`) } },
    { label: "Open the page", kind: "secondary" as const, onClick: () => open(`/ollopa/forms/${f.id}`, f.id) },
    { label: "Copy the form link", kind: "secondary" as const, onClick: () => toast(`Link to ${f.name} copied.`) },
    { label: "Export submissions", kind: "secondary" as const, onClick: () => toast(`${f.name}: submissions exported as CSV.`) },
  ]

  /* ------------------------------------------------------------------------------- the policy */

  const policy = seed.sendPolicy
  const guard = seed.bounceGuard
  // A workspace with no campaign cap has no marketing domain either: its domains belong to outbound
  // (Halyard sends for its clients). Saying otherwise would be a claim the workspace cannot back.
  const domain = policy.dailyCap > 0 ? seed.domains[0] : undefined
  const figures: SummaryFigure[] = [
    {
      label: "Bounce guard",
      value: (
        // A destination, so a real link; it keeps this page on the trail behind it.
        <a
          id="campaigns-policy"
          href={href("/ollopa/settings/email-sending?row=mail.bounce-guard")}
          onClick={(ev) => { if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); follow("/ollopa/settings/email-sending?row=mail.bounce-guard", from("campaigns-policy")) } }}
        >
          <span style={guard.observedPercent >= guard.warnPercent ? ink("warning") : undefined}>
            {guard.observedPercent}% this week
          </span>
        </a>
      ),
      note: `warns at ${guard.warnPercent}% · pauses at ${guard.pausePercent}%`,
    },
    policy.dailyCap > 0
      ? { label: "Sends today", value: `${num(policy.usedToday)} of ${num(policy.dailyCap)}`, note: "the daily cap" }
      : { label: "Sends today", value: "None", note: "none set up yet" },
    domain
      ? { label: "Marketing domain", value: domain.domain, note: domain.spf && domain.dkim && domain.dmarc ? "SPF, DKIM and DMARC pass" : "needs SPF, DKIM or DMARC" }
      : { label: "Marketing domain", value: "None", note: `${admin} can add one in Settings › Email sending` },
  ]

  /* -------------------------------------------------------------------------------- the render */

  /** The view switch: three objects on one table, in the one named slot every index uses. */
  const viewSwitch = (
    <ToggleGroup
      type="single" variant="outline" aria-label="What this table shows"
      value={view} onValueChange={(v) => { if (v) setView(v as View) }}
    >
      {views.map((v) => (
        <ToggleGroupItem key={v.key} value={v.key}>
          {v.label} <span className="tabular-nums">{v.count}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )

  const shared = {
    family: FAMILY,
    title: "Campaigns",
    count: totalRows,
    description: "One send to an audience, or a lifecycle campaign that runs on a trigger.",
    actions: [
      { kind: "primary" as const, label: "New campaign", onClick: () => setNewPanel(true) },
      ...(view === "audiences" ? [{ kind: "secondary" as const, label: "New audience", onClick: () => toast("New audience: name it, pick lists, add segment filters, choose live or frozen.") }] : []),
      ...(view === "forms" ? [{ kind: "secondary" as const, label: "New form", onClick: () => toast("New form: name it, add the fields, and choose where submissions go.") }] : []),
    ],
    slot: viewSwitch,
    above: <SummaryStrip figures={figures} />,
  }

  // One row: search, the filters this seat sets most, the door, the count. Everything the usage
  // model ranks below the first three falls into the door with the columns.
  const ranked = [...filterControls].sort((a, b) => d.weekly(b.id) - d.weekly(a.id))
  const filters = nothing ? undefined : {
    search: { value: q, onChange: setQ, placeholder: "Search campaigns, subjects and audiences" },
    controls: view === "campaigns"
      ? ranked.slice(0, 3).map((f) => ({ name: f.label, value: f.value === "all" ? undefined : f.value, onClear: () => f.set("all"), node: <Filter f={f} /> }))
      : [],
    behind: view === "campaigns"
      ? ranked.slice(3).map((f) => ({ name: f.label, group: "filters" as const, value: f.value === "all" ? undefined : f.value, onClear: () => f.set("all"), node: <Filter f={f} /> }))
      : [],
    count: { shown: shownRows, total: totalRows, noun: view },
    onClearAll: () => { setQ(""); for (const f of filterControls) f.set("all") },
    doorId: `campaigns.filters.${view}`,
  }

  return (
    <>
      {view === "campaigns" && (
        <IndexPage
          {...shared}
          filters={filters}
          beside={(c) => ({ kind: "campaign", id: c.id })}
          columns={campaignColumns}
          rows={campaigns}
          rowKey={(c) => c.id}
          rowProps={(c) => ({ "data-item": c.id, "data-item-label": c.name })}
          name={(c) => (
            <>
              <a href={href(`/ollopa/campaigns/${c.id}`)} className="min-w-0 truncate font-medium hover:underline">{c.name}</a>
              <span className="t-small shrink-0 text-muted-foreground">{c.kind}</span>
              <ActedNote business={session.business} kind="campaign" id={c.id} edit={campaignEdits[c.id]} />
            </>
          )}
          menu={(c) => <Actions surface="row" layout="menu" menuLabel={c.name} items={[...rowActions(c).map((a) => ({ ...a, kind: "secondary" as const })), ...rowMenu(c)]} />}
          empty={
            <EmptyState
              title="No campaigns yet"
              body={`A campaign sends one email to an audience built from your lists. Start with an audience, or create an email campaign.${
                seed.sendPolicy.dailyCap === 0 ? ` This workspace has no marketing domain: ${admin} can add one in Settings › Email sending.` : ""
              }`}
              action={
                <Actions surface="card" items={[
                  { kind: "primary", label: "Create an email campaign", onClick: () => setNewPanel(true) },
                  { kind: "secondary", label: "New audience", onClick: () => toast("New audience: name it, pick lists, add segment filters, choose live or frozen.") },
                ]} />
              }
            />
          }
        />
      )}

      {view === "audiences" && (
        <IndexPage
          {...shared}
          filters={filters}
          beside={(a) => ({ kind: "audience", id: a.id })}
          columns={audienceColumns}
          rows={audiences}
          rowKey={(a) => a.id}
          rowProps={(a) => ({ "data-item": a.id, "data-item-label": a.name })}
          name={(a) => (
            <span className="min-w-0">
              <a href={href(`/ollopa/audiences/${a.id}`)} className="font-medium hover:underline"
                onClick={(ev) => { ev.stopPropagation(); if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); open(`/ollopa/audiences/${a.id}`, a.id) } }}>{a.name}</a>
              <ActedNote business={session.business} kind="audience" id={a.id} edit={audienceEdits[a.id]} />
            </span>
          )}
          menu={(a) => <Actions surface="row" layout="menu" menuLabel={a.name} items={audienceMenu(a)} />}
        />
      )}

      {view === "forms" && (
        <IndexPage
          {...shared}
          filters={filters}
          beside={(f) => ({ kind: "form", id: f.id })}
          columns={formColumns}
          rows={forms}
          rowKey={(f) => f.id}
          rowProps={(f) => ({ "data-item": f.id, "data-item-label": f.name })}
          name={(f) => (
            <span className="min-w-0">
              <a href={href(`/ollopa/forms/${f.id}`)} className="font-medium hover:underline"
                onClick={(ev) => { ev.stopPropagation(); if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); open(`/ollopa/forms/${f.id}`, f.id) } }}>{f.name}</a>
              <ActedNote business={session.business} kind="form" id={f.id} edit={formEdits[f.id]} />
            </span>
          )}
          menu={(f) => <Actions surface="row" layout="menu" menuLabel={f.name} items={formMenu(f)} />}
        />
      )}

      {/* ------------------------------------------------------------------ new campaign: which kind */}
      <Panel id="campaign-new" title="New campaign" open={newPanel} onOpenChange={setNewPanel}>
        <div className="space-y-3">
          <Actions surface="dialog" layout="stack" items={(["Email", "Lifecycle"] as const).map((k) => ({
            kind: "secondary" as const,
            label: k === "Email" ? "Email campaign — one send" : "Lifecycle campaign — runs on a trigger",
            onClick: () => {
              const draft: Campaign = {
                id: `camp-new-${Date.now().toString(36)}`, name: k === "Email" ? "Untitled email campaign" : "Untitled lifecycle campaign", kind: k,
                status: "Draft", pausedBy: null, subject: "", previewText: "", fromName: session.user, fromMailbox: `marketing@${b.id === "meridian" ? "meridian.io" : `${b.id}.com`}`,
                audienceId: rows.audiences[0]?.id ?? "", audienceSize: rows.audiences[0]?.size ?? 0, sendAt: null,
                trigger: k === "Lifecycle" ? "Trial reaches day 7" : null, delayDays: k === "Lifecycle" ? 0 : null, exitRule: k === "Lifecycle" ? "Exits on reply or on upgrade" : null,
                sent: 0, delivered: 0, bounced: 0, opened: 0, clicked: 0, replied: 0, converted: 0, unsubscribed: 0, complaints: 0,
                goal: "Booked demo", owner: session.user,
                qa: { by: null, on: null, checklist: [{ item: "Suppressions applied", done: false }, { item: "Links tested", done: false }, { item: "Preview on phone", done: false }, { item: "Someone who did not build it checked it", done: false }], checks: CAMPAIGN_CHECKS.map((name) => ({ name, state: "not run" as const })) },
                links: [], attributionDays: 30,
                sendsByDay: [], variants: [], activity: [{ at: TODAY, by: session.user, what: "Draft created" }],
                dealsCreated: 0, pipelineAmount: 0, pipelineInfluenced: 0,
              }
              addRow(session.business, "campaigns", draft)
              setNewPanel(false)
              toast(`${draft.name} created. Nothing sends until you schedule it.`)
              open(`/ollopa/campaigns/${draft.id}`, draft.id)
            },
          }))} />
        </div>
      </Panel>

      {/* ------------------------------------------------------------- archive asks for one line */}
      <Panel
        id="campaign-archive" title={archiving ? `Archive ${archiving.name}` : "Archive"} open={!!archiving} onOpenChange={(o) => { if (!o) setArchiving(null) }}
        footer={
          <Actions surface="dialog" layout="stack" items={[{
            kind: "primary", label: "Archive the campaign",
            onClick: () => {
              if (!archiving) return
              patchRow(session.business, "campaigns", archiving.id, {
                status: "Archived",
                activity: [{ at: TODAY, by: session.user, what: `Retired — ${archiveReason.trim()}` }, ...archiving.activity],
              })
              toast(`${archiving.name} archived. The reason is on the campaign and on its row in Reports.`)
              setArchiving(null)
            },
            disabledBecause: archiveReason.trim() ? undefined : "Say why it is being retired",
          }]} />
        }
      >
        <div className="space-y-3">
          <p className="text-muted-foreground">Results are kept. The line you write goes to this campaign's Notes and to its row in Reports.</p>
          <div>
            <Label htmlFor="archive-reason" className="text-xs">Why it is being retired</Label>
            <Textarea id="archive-reason" rows={3} value={archiveReason} onChange={(e) => setArchiveReason(e.target.value)} placeholder="Audience overlapped with the trial nudge." className="mt-1" />
          </div>
          <p className="text-xs text-muted-foreground">Written as: “Retired {day(TODAY)} by {session.user} — {archiveReason.trim() || "…"}”</p>
        </div>
      </Panel>

      {/* ------------------------------------------------------------------- delete draft, in words */}
      <Panel
        id="campaign-delete" title={deleting ? `Delete ${deleting.name}` : "Delete draft"} open={!!deleting} onOpenChange={(o) => { if (!o) setDeleting(null) }}
        footer={
          <Actions surface="dialog" layout="stack" items={[{
            kind: "destructive", label: "Delete the draft",
            onClick: () => {
              if (!deleting) return
              removeRow(session.business, deleting.id)
              toast(`${deleting.name} deleted.`)
              setDeleting(null)
            },
          }]} />
        }
      >
        <p className="text-sm">Deletes the draft and its test sends.</p>
      </Panel>
    </>
  )
}
