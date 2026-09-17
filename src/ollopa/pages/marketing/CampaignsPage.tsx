// Campaigns · Audiences · Forms (`P-campaigns`): one page, one table, three objects, a policy line
// above (specs/10-campaigns.md §3 and §6).
//
// The one thing the marketer must never lose sight of is what is about to go out, to how many people,
// and what it cost last time. So the bounce guard's two thresholds and the observed rate, the daily
// cap and what it has used, the delivery cell and unsubscribes are on the page whatever the usage
// number says; everything else is asked of the usage model and never hard-coded.
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { href, navigate } from "@/app/router"
import { toast } from "../../templates/TablePage"
import { Door } from "../../ui/Door"
import { Panel } from "../../ui/Panel"
import { EmptyState } from "../../ui/EmptyState"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { BOUNCE_GUARD, CAMPAIGN_CHECKS, TODAY, seedFor, type Audience, type Campaign, type Form } from "../../data/seed"
import type { Session } from "../../session"
import type { Business } from "../../usage/model"
import { Grid, type GridColumn } from "./grid"
import { usePref } from "./prefs"
import { addRow, patchRow, removeRow, useMarketing } from "./store"
import { netSize, rulesApplied, suppressionCounts, suppressedTotal } from "./derive"
import { ago, day, num, pct } from "./format"

const STATUS_TONE: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Scheduled: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  Sending: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  Sent: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200",
  Running: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200",
  Paused: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  Archived: "bg-muted text-muted-foreground",
}

/** Status is a word and a colour, never a colour alone; the reason travels with it. */
export function StatusBadge({ c }: { c: Campaign }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <Badge variant="secondary" className={STATUS_TONE[c.status] ?? ""}>{c.status}</Badge>
      {c.pausedBy && <span className="text-xs text-muted-foreground">by {c.pausedBy.toLowerCase()}</span>}
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
      <div>{num(c.sent)} sent</div>
      <div className="text-xs text-muted-foreground">{num(c.delivered)} delivered · {pct(c.delivered, c.sent)}</div>
      <div className={cn("text-xs", past ? "font-medium text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>
        {num(c.bounced)} bounced · {pct(c.bounced, c.sent)}
        {past === "warn" && ` — past the ${BOUNCE_GUARD.warnPercent}% warn threshold`}
        {past === "pause" && ` — past the ${BOUNCE_GUARD.pausePercent}% pause threshold`}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------- the policy line */

function PolicyLine({ business, admin }: { business: Business; admin: string }) {
  const seed = seedFor(business)
  const policy = seed.sendPolicy
  const guard = seed.bounceGuard
  // A workspace with no campaign cap has no marketing domain either: its domains belong to outbound
  // (Halyard sends for its clients). Saying otherwise would be a claim the workspace cannot back.
  const domain = policy.dailyCap > 0 ? seed.domains[0] : undefined
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b bg-muted/40 px-6 py-2 text-xs">
      <span>Bounce guard: warn {guard.warnPercent}%, pause {guard.pausePercent}%</span>
      <span aria-hidden="true">·</span>
      <span className={guard.observedPercent >= guard.warnPercent ? "font-medium text-amber-700 dark:text-amber-400" : ""}>
        observed {guard.observedPercent}% this week
      </span>
      <span aria-hidden="true">·</span>
      {policy.dailyCap > 0
        ? <span>{num(policy.usedToday)} of {num(policy.dailyCap)} sends used today</span>
        : <span>No campaign sending set up yet</span>}
      <span aria-hidden="true">·</span>
      {domain
        ? <span>{domain.domain} {domain.spf && domain.dkim && domain.dmarc ? "healthy" : "needs SPF, DKIM or DMARC"}</span>
        : <span>No marketing domain — {admin} can add one in Settings › Email sending</span>}
      <a className="underline" href={href("/ollopa/settings")}>Sending policy</a>
    </p>
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

  const at = (id: string) => d.level(id) === 1

  /* ------------------------------------------------------------------- filters, level one and two */

  const filterControls = [
    { id: "camp.filter.status", key: "status", label: "Status", value: status, set: setStatus, options: ["Draft", "Scheduled", "Sending", "Sent", "Running", "Paused", "Archived"] },
    { id: "camp.filter.kind", key: "kind", label: "Kind", value: kind, set: setKind, options: ["Email", "Lifecycle"] },
    { id: "camp.filter.owner", key: "owner", label: "Owner", value: owner, set: setOwner, options: [...new Set(rows.campaigns.map((c) => c.owner))] },
    { id: "camp.filter.audience", key: "audience", label: "Audience", value: audience, set: setAudience, options: rows.audiences.map((a) => a.name) },
    { id: "camp.filter.date", key: "date", label: "Date", value: when, set: setWhen, options: ["Sent in the last 30 days", "Sending or scheduled"] },
  ]
  const levelOneFilters = filterControls.filter((f) => at(f.id))
  const behindTheDoor = filterControls.filter((f) => !at(f.id))
  const activeCount = filterControls.filter((f) => f.value !== "all").length
  const activeBehind = behindTheDoor.filter((f) => f.value !== "all").length

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
      case "Draft": return [{ label: "Edit", onClick: () => navigate(`/ollopa/campaigns/${c.id}`) }, { label: "Send test", onClick: () => navigate(`/ollopa/campaigns/${c.id}?open=test`) }]
      case "Scheduled": return [{ label: "Pause", onClick: () => pause(c) }, { label: "Send test", onClick: () => navigate(`/ollopa/campaigns/${c.id}?open=test`) }]
      case "Sending": case "Running": return [{ label: "Pause", onClick: () => pause(c) }]
      case "Paused": return [{ label: "Resume", onClick: () => resume(c) }]
      default: return [{ label: "Duplicate", onClick: () => duplicate(c) }]
    }
  }

  const rowMenu = (c: Campaign) => [
    { label: "Open", onClick: () => navigate(`/ollopa/campaigns/${c.id}`) },
    { label: "Duplicate", onClick: () => duplicate(c) },
    { label: "Compare with…", onClick: () => toast(`Pick a second campaign to compare with ${c.name}.`) },
    { label: "Export results", onClick: () => toast(`${c.name}: results exported as CSV, with the filters you are looking at.`) },
    { label: "Archive", separatorBefore: true, onClick: () => { setArchiveReason(""); setArchiving(c) } },
    ...(c.status === "Draft" ? [{ label: "Delete draft", destructive: true, onClick: () => setDeleting(c) }] : []),
  ]

  /* ------------------------------------------------------------------------------- the columns */

  const campaignColumns: GridColumn<Campaign>[] = [
    { key: "name", header: "Campaign", sortBy: (c) => c.name, className: "min-w-[13rem] whitespace-normal", cell: (c) => (
      <div className="min-w-0">
        <div className="font-medium">{c.name} <span className="font-normal text-muted-foreground">· {c.kind}</span></div>
        <div className="truncate text-xs text-muted-foreground">{c.subject}</div>
      </div>
    ) },
    { key: "status", header: "Status", sortBy: (c) => c.status, cell: (c) => <StatusBadge c={c} />, optional: !at("camp.list.status") },
    { key: "audience", header: "Audience", sortBy: (c) => c.audienceSize, optional: !at("camp.list.audience"), className: "min-w-[10rem] whitespace-normal", cell: (c) => {
      const a = rows.audiences.find((x) => x.id === c.audienceId)
      return a
        ? <div className="min-w-0"><div className="truncate">{a.name}</div><div className="text-xs tabular-nums text-muted-foreground">{num(netSize(a))} after suppressions</div></div>
        : <span className="text-muted-foreground">Audience removed; {num(c.audienceSize)} people at send time</span>
    } },
    { key: "delivery", header: "Delivery", sortBy: (c) => c.sent, className: "min-w-[10rem] whitespace-normal", cell: (c) => <DeliveryCell c={c} /> },
    { key: "opens", header: "Opened", sortBy: (c) => (c.delivered ? c.opened / c.delivered : 0), optional: !at("camp.list.opens-clicks"), cell: (c) => (
      <div className="tabular-nums"><div>{pct(c.opened, c.delivered)}</div><div className="text-xs text-muted-foreground">{num(c.opened)}</div></div>
    ) },
    { key: "clicks", header: "Clicked", sortBy: (c) => (c.delivered ? c.clicked / c.delivered : 0), optional: !at("camp.list.opens-clicks"), cell: (c) => (
      <div className="tabular-nums"><div>{pct(c.clicked, c.delivered)}</div><div className="text-xs text-muted-foreground">{num(c.clicked)}</div></div>
    ) },
    { key: "replied", header: "Replied", sortBy: (c) => c.replied, optional: !at("camp.list.replies"), cell: (c) => <span className="tabular-nums">{num(c.replied)}</span> },
    { key: "converted", header: "Converted", sortBy: (c) => c.converted, optional: !at("camp.list.conversions"), cell: (c) => (
      <div className="tabular-nums"><div>{num(c.converted)}</div><div className="text-xs text-muted-foreground">{c.goal}</div></div>
    ) },
    { key: "unsubscribed", header: "Unsubscribed", sortBy: (c) => c.unsubscribed, cell: (c) => (
      <div className="tabular-nums"><div>{num(c.unsubscribed)}</div><div className="text-xs text-muted-foreground">{pct(c.unsubscribed, c.delivered)}</div></div>
    ) },
    { key: "send", header: "Send", sortBy: (c) => c.sendAt ?? "", optional: !at("camp.list.send-time"), className: "min-w-[8rem] whitespace-normal", cell: (c) => (
      c.kind === "Lifecycle" ? <span className="text-muted-foreground">Runs on a trigger</span>
        : c.status === "Scheduled" ? <span>Scheduled {day(c.sendAt)}</span>
          : <span className="text-muted-foreground">{c.sendAt ? `Sent ${day(c.sendAt)}` : "Not scheduled"}</span>
    ) },
    { key: "trigger", header: "Trigger", optional: !at("camp.list.trigger"), className: "min-w-[9rem] whitespace-normal", cell: (c) => c.trigger ?? <span className="text-muted-foreground">—</span> },
    { key: "lastSend", header: "Last send", optional: !at("camp.list.last-send"), sortBy: (c) => c.sendAt ?? "", cell: (c) => (c.sendAt ? ago(c.sendAt) : "—") },
    { key: "owner", header: "Owner", optional: !at("camp.list.owner"), sortBy: (c) => c.owner, cell: (c) => c.owner },
    { key: "from", header: "From", optional: !at("camp.list.from"), cell: (c) => <span className="text-xs">{c.fromName}<br />{c.fromMailbox}</span> },
    { key: "variants", header: "A/B", optional: !at("camp.list.variants"), cell: (c) => (c.variants.length ? `${c.variants.length} variants` : "—") },
    { key: "created", header: "Created", optional: !at("camp.list.created"), cell: (c) => day(c.activity[c.activity.length - 1]?.at ?? c.sendAt) },
  ]

  // The column choices are the page's, not the table's, because the phone shows them inside the one
  // door that replaces the filter row, and both must move together.
  const optionalCampaignColumns = campaignColumns.filter((c) => c.optional)
  const [hiddenColumns, setHiddenColumns] = usePref<string[]>("campaigns.hidden", optionalCampaignColumns.map((c) => c.key))

  const audienceColumns: GridColumn<Audience>[] = [
    { key: "name", header: "Audience", sortBy: (a) => a.name, cell: (a) => <span className="font-medium">{a.name}</span> },
    { key: "type", header: "Type", sortBy: (a) => a.type, cell: (a) => a.type },
    { key: "mode", header: "Mode", sortBy: (a) => a.mode, cell: (a) => (
      a.mode === "live"
        ? <span>Live · refreshes daily {a.refreshAt ? "06:00" : ""}</span>
        : <span>Frozen at {num(a.size)} on {day(a.frozenAt)}</span>
    ) },
    { key: "size", header: "Size", sortBy: (a) => a.size, className: "tabular-nums", cell: (a) => num(a.size) },
    { key: "net", header: "Net size", sortBy: (a) => netSize(a), className: "tabular-nums", cell: (a) => <span className="font-medium">{num(netSize(a))}</span> },
    { key: "suppressed", header: "Suppressed", sortBy: (a) => suppressedTotal(a), cell: (a) => (
      <ul className="text-xs">
        {suppressionCounts(a).map((s) => (
          <li key={s.key} className={s.on ? "" : "text-muted-foreground"}>
            <span className="tabular-nums">{num(s.count)}</span> {s.label}
            {s.always ? ", always applied" : s.on ? "" : ", off"}
          </li>
        ))}
      </ul>
    ) },
    { key: "rebuilt", header: "Last rebuilt", sortBy: (a) => a.lastRebuilt, cell: (a) => ago(a.lastRebuilt) },
    { key: "usedBy", header: "Used by", cell: (a) => (a.usedBy.length ? a.usedBy.join(", ") : <span className="text-muted-foreground">No campaign yet</span>) },
  ]

  const formColumns: GridColumn<Form>[] = [
    { key: "name", header: "Form", sortBy: (f) => f.name, cell: (f) => <span className="font-medium">{f.name}</span> },
    { key: "status", header: "Status", sortBy: (f) => f.status, cell: (f) => <Badge variant="secondary" className={f.status === "Live" ? STATUS_TONE.Sent : STATUS_TONE.Draft}>{f.status}</Badge> },
    { key: "submissions", header: "Submissions, 7 days", sortBy: (f) => f.submissions7d, className: "tabular-nums", cell: (f) => num(f.submissions7d) },
    { key: "enrichment", header: "Enrichment spend", sortBy: (f) => f.enrichUsedToday, cell: (f) => (
      <div className="min-w-0 tabular-nums">
        <div className={f.enrichUsedToday >= f.enrichCapDaily ? "font-medium text-amber-700 dark:text-amber-400" : ""}>
          {num(f.enrichUsedToday)} of {num(f.enrichCapDaily)} credits today
        </div>
        <div className="text-xs text-muted-foreground">{num(f.matched)} of {num(f.submissions7d)} matched</div>
      </div>
    ) },
    { key: "unrouted", header: "Could not route", sortBy: (f) => f.unrouted, className: "tabular-nums", cell: (f) => (
      f.unrouted > 0
        ? <span className="font-medium text-amber-700 dark:text-amber-400">{num(f.unrouted)} reached nobody</span>
        : <span className="text-muted-foreground">0</span>
    ) },
    { key: "routes", header: "Routes to", cell: (f) => f.routesTo },
    { key: "reports", header: "Reports to", cell: (f) => f.reportsTo },
    { key: "last", header: "Last submission", sortBy: (f) => f.lastSubmission, cell: (f) => ago(f.lastSubmission) },
  ]

  /* --------------------------------------------------------------------------------- the states */

  const nothing = rows.campaigns.length === 0 && rows.audiences.length === 0 && rows.forms.length === 0

  const views: { key: View; label: string; count: number }[] = [
    { key: "campaigns", label: "Campaigns", count: rows.campaigns.length },
    { key: "audiences", label: "Audiences", count: rows.audiences.length },
    { key: "forms", label: "Forms", count: rows.forms.length },
  ]

  const filterRow = (
    <>
      <Input aria-label="Search campaigns, subjects and audiences" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-56" />
      {view === "campaigns" && levelOneFilters.map((f) => <Filter key={f.key} f={f} />)}
    </>
  )

  const doorLabel = `Additional filters: ${behindTheDoor.map((f) => f.label.toLowerCase()).join(", ")}`

  return (
    <div className="flex h-full flex-col">
      {/* Decision-critical, above everything, on every plan: the guard, the observed rate, the cap. */}
      <PolicyLine business={session.business} admin={admin} />

      <div className="flex flex-wrap items-end justify-between gap-3 px-6 pt-4">
        <div>
          <h2 className="text-lg font-semibold">Campaigns</h2>
          <p className="text-sm text-muted-foreground">One send to an audience, or a lifecycle campaign that runs on a trigger.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {view === "audiences" && <Button variant="outline" onClick={() => toast("New audience: name it, pick lists, add segment filters, choose live or frozen.")}>New audience</Button>}
          {view === "forms" && <Button variant="outline" onClick={() => toast("New form: name it, add the fields, and choose where submissions go.")}>New form</Button>}
          <Button onClick={() => setNewPanel(true)}>New campaign</Button>
        </div>
      </div>

      {/* The view switch is state, not a door: three objects on one table (IA-MAP 3, P-campaigns). */}
      <div role="group" aria-label="What this table shows" className="flex flex-wrap gap-1 px-6 pt-3">
        {views.map((v) => (
          <button
            key={v.key}
            type="button"
            aria-pressed={view === v.key}
            onClick={() => setView(v.key)}
            className={cn("rounded-md border px-3 py-1 text-sm", view === v.key ? "bg-foreground text-background" : "hover:bg-muted")}
          >
            {v.label} <span className="tabular-nums">{v.count}</span>
          </button>
        ))}
      </div>

      {nothing ? (
        <div className="px-6 py-10">
          <EmptyState
            title="No campaigns yet"
            body={`A campaign sends one email to an audience built from your lists. Start with an audience, or create an email campaign.${
              seed.sendPolicy.dailyCap === 0 ? ` This workspace has no marketing domain: ${admin} can add one in Settings › Email sending.` : ""
            }`}
            action={
              <span className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => toast("New audience: name it, pick lists, add segment filters, choose live or frozen.")}>New audience</Button>
                <Button size="sm" onClick={() => setNewPanel(true)}>Create an email campaign</Button>
              </span>
            }
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          {/* From tablet up: the filter row, then the door that ends it, named for what is behind it. */}
          <div className="hidden px-6 py-3 md:block">
            <div className="flex flex-wrap items-center gap-2">{filterRow}</div>
            {view === "campaigns" && behindTheDoor.length > 0 && (
              <div className="pt-2">
                <Door id="campaigns.filters" label={doorLabel} count={activeBehind || undefined}>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {behindTheDoor.map((f) => <Filter key={f.key} f={f} />)}
                  </div>
                </Door>
              </div>
            )}
          </div>

          {/* The phone: one door replacing two, with the same values. */}
          <div className="px-4 py-3 md:hidden">
            <div className="pb-2">{<Input aria-label="Search campaigns" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="h-8" />}</div>
            {view === "campaigns" && (
              <Door id="campaigns.filters.phone" label="Filters and columns" count={activeCount || undefined}>
                <div className="grid gap-2 pt-1">{filterControls.map((f) => <Filter key={f.key} f={f} />)}</div>
                <fieldset className="pt-3">
                  <legend className="pb-2 text-xs font-medium">Columns you can add</legend>
                  <div className="space-y-2">
                    {optionalCampaignColumns.map((c) => (
                      <label key={c.key} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={!hiddenColumns.includes(c.key)}
                          onCheckedChange={(v) => setHiddenColumns(v ? hiddenColumns.filter((k) => k !== c.key) : [...hiddenColumns, c.key])}
                        />
                        {c.header}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </Door>
            )}
          </div>

          {view === "campaigns" && (
            <Grid<Campaign>
              id="campaigns"
              rows={campaigns}
              rowKey={(c) => c.id}
              columns={campaignColumns}
              defaultSort={{ key: "name", dir: "asc" }}
              actions={rowActions}
              menu={rowMenu}
              hidden={hiddenColumns}
              onHidden={setHiddenColumns}
              menuName="Open, duplicate, compare, export results, archive, delete draft"
              onOpen={(c) => navigate(`/ollopa/campaigns/${c.id}`)}
              cardTitle={(c) => <span className="font-medium">{c.name} · {c.kind}</span>}
            />
          )}
          {view === "audiences" && (
            <Grid<Audience>
              id="audiences"
              rows={audiences}
              rowKey={(a) => a.id}
              columns={audienceColumns}
              defaultSort={{ key: "name", dir: "asc" }}
              actions={(a) => [{ label: "Rebuild now", onClick: () => { patchRow(session.business, "audiences", a.id, { lastRebuilt: TODAY }); toast(`${a.name} rebuilt · ${num(netSize(a))} after suppressions.`) } }]}
              menu={(a) => [
                { label: "Open", onClick: () => navigate(`/ollopa/audiences/${a.id}`) },
                { label: "Hand to sales", onClick: () => navigate(`/ollopa/audiences/${a.id}`) },
                { label: a.mode === "live" ? "Freeze" : "Make live", onClick: () => { patchRow(session.business, "audiences", a.id, a.mode === "live" ? { mode: "frozen", frozenAt: TODAY, refreshAt: null } : { mode: "live", frozenAt: null, refreshAt: TODAY }); toast(`${a.name} is now ${a.mode === "live" ? "frozen" : "live"}.`) } },
                { label: "Delete audience", destructive: true, separatorBefore: true, onClick: () => toast(a.usedBy.length ? `${a.name} cannot be deleted: ${a.usedBy[0]} uses it.` : `${a.name} deleted.`) },
              ]}
              menuName="Open, hand to sales, freeze, delete audience"
              onOpen={(a) => navigate(`/ollopa/audiences/${a.id}`)}
              cardTitle={(a) => <span className="font-medium">{a.name}</span>}
            />
          )}
          {view === "forms" && (
            <Grid<Form>
              id="forms"
              rows={forms}
              rowKey={(f) => f.id}
              columns={formColumns}
              defaultSort={{ key: "submissions", dir: "desc" }}
              actions={(f) => [{ label: f.status === "Live" ? "Turn off" : "Turn on", onClick: () => { patchRow(session.business, "forms", f.id, { status: f.status === "Live" ? "Off" : "Live" }); toast(`${f.name} is now ${f.status === "Live" ? "off — submissions stop" : "live — submissions are accepted and routed"}.`) } }]}
              menu={(f) => [
                { label: "Open", onClick: () => navigate(`/ollopa/forms/${f.id}`) },
                { label: "Copy the form link", onClick: () => toast(`Link to ${f.name} copied.`) },
                { label: "Export submissions", onClick: () => toast(`${f.name}: submissions exported as CSV.`) },
              ]}
              menuName="Open, copy the form link, export submissions"
              onOpen={(f) => navigate(`/ollopa/forms/${f.id}`)}
              cardTitle={(f) => <span className="font-medium">{f.name}</span>}
            />
          )}
        </div>
      )}

      {!isAdmin && (
        <p className="border-t px-6 py-2 text-xs text-muted-foreground">
          Owners and sending policy are the admin's: {admin} can change an owner or the bounce guard.
        </p>
      )}

      {/* ------------------------------------------------------------------ new campaign: which kind */}
      <Panel id="campaign-new" title="New campaign" open={newPanel} onOpenChange={setNewPanel}>
        <div className="space-y-3">
          <p className="text-muted-foreground">An email campaign sends once, now or at a time you choose. A lifecycle campaign runs: a trigger adds people and it mails them while it runs.</p>
          {(["Email", "Lifecycle"] as const).map((k) => (
            <Button key={k} variant="outline" className="w-full justify-start" onClick={() => {
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
              navigate(`/ollopa/campaigns/${draft.id}`)
            }}>
              {k === "Email" ? "Email campaign — one send" : "Lifecycle campaign — runs on a trigger"}
            </Button>
          ))}
        </div>
      </Panel>

      {/* ------------------------------------------------------------- archive asks for one line */}
      <Panel
        id="campaign-archive" title={archiving ? `Archive ${archiving.name}` : "Archive"} open={!!archiving} onOpenChange={(o) => { if (!o) setArchiving(null) }}
        footer={
          <Button className="w-full" disabled={!archiveReason.trim()} onClick={() => {
            if (!archiving) return
            patchRow(session.business, "campaigns", archiving.id, {
              status: "Archived",
              activity: [{ at: TODAY, by: session.user, what: `Retired — ${archiveReason.trim()}` }, ...archiving.activity],
            })
            toast(`${archiving.name} archived. The reason is on the campaign and on its row in Reports.`)
            setArchiving(null)
          }}>Archive</Button>
        }
      >
        <div className="space-y-3">
          <p className="text-muted-foreground">Results are kept. The line you write goes to this campaign's Notes and to its row in Reports, so the next person who asks why it stopped can read the answer.</p>
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
          <Button variant="destructive" className="w-full" onClick={() => {
            if (!deleting) return
            removeRow(session.business, deleting.id)
            toast(`${deleting.name} deleted.`)
            setDeleting(null)
          }}>Delete the draft</Button>
        }
      >
        <p className="text-sm">Deletes the draft and its test sends. Sent campaigns are archived, never deleted.</p>
      </Panel>
    </div>
  )
}
