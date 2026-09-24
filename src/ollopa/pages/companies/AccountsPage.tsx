// `P-accounts`: the customer-state view of the same companies (specs/11 §3 and §6).
//
// A CSM starts the day here, and the one thing nobody may lose sight of is which accounts are
// renewing soon and are not healthy. So the renewal counters, the value at risk, the renewal date
// and days left, the contract value and the open risks are on the surface at every business —
// including Halyard, where they read zero.
//
// The record behind a row is the company record. This page builds no second one.
import { useMemo, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { follow } from "../../chain"
import { toast } from "../../templates/TablePage"
import { Separator } from "@/components/ui/separator"
import { Rows, Section, type SummaryFigure, type ToolbarControl, MetaLine } from "../../layouts"
import { Actions } from "../../ui/Actions"
import { Chip } from "../../ui/Identity"
import { Panel } from "../../ui/Panel"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { TODAY, seedFor, type AccountRisk } from "../../data/seed"
import type { Session } from "../../session"
import { DataTable, type Col, type FilterDef, type MenuAction, type RowAction } from "./Table"
import { viewsOf, type CompanyView } from "./data"
import { bandChip, quickLookFields, stageChip } from "./quickLook"
import { ago, day, daysLeft, delta, money, renewalText } from "./format"
import { usePageState } from "./persist"
import { applyChange, changeFor, undoChange, useChanges } from "./changes"
import { ConfirmStrip, Notice } from "./strips"
import { PlayPanel } from "./PlayPanel"

const RISK_TYPES = ["Usage drop", "Champion left", "Escalation", "Budget cut", "Competitor", "Onboarding stalled", "Churn notice"]

type Pending =
  | { kind: "churn"; row: CompanyView }
  | { kind: "remove"; row: CompanyView }
  | { kind: "accept"; row: CompanyView }

export function AccountsPage({ session }: { session: Session }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const d = useDisclosure("accounts")
  const changes = useChanges()

  const [state, setState] = usePageState("accounts", session.business, session.user, {
    filters: {} as Record<string, string>,
    columns: null as string[] | null,
    // A product-led CS lead reaches the renewal through the unhealthy account, not the other way round.
    sort: (session.business === "ridgeline"
      ? { id: "acct.health", dir: "asc" }
      : { id: "acct.renewal", dir: "asc" }) as { id: string; dir: "asc" | "desc" },
    windows: [] as number[],
    mine: session.role === "cs" || session.role === "ae",
  })

  const [pending, setPending] = useState<Pending | null>(null)
  const [notice, setNotice] = useState<{ text: string; undo?: () => void } | null>(null)
  const [touching, setTouching] = useState<CompanyView | null>(null)
  const [risking, setRisking] = useState<CompanyView | null>(null)
  const [playing, setPlaying] = useState<CompanyView | null>(null)

  const hasAe = b.roles.some((r) => r.role === "ae")
  const hasCampaigns = b.counts.campaigns > 0
  const crmName = (b.crm ?? "").replace(/\s*\(.*\)$/, "")

  /* --------------------------------------------------------------------------------- the rows */

  const all = useMemo(() => {
    void changes
    return viewsOf(seed)
      .filter((v) => v.account)
      .map((v) => {
        const c = changeFor(v.company.id)
        const a = v.account!
        if (!c.nextStep && !c.risks && !c.resolvedRisks && !c.churned && !c.owner && !c.dismissedSignals) return v
        return {
          ...v,
          account: {
            ...a,
            ...(c.owner ? { owner: c.owner } : {}),
            ...(c.nextStep ? { nextStep: c.nextStep } : {}),
            risks: [...(c.risks ?? []), ...a.risks].filter((r) => !(c.resolvedRisks ?? []).includes(r.id)),
            signals: a.signals.filter((s) => !(c.dismissedSignals ?? []).includes(s.id)),
            ...(c.churned ? { stage: "Churned" as const, forecast: "Lost" as const } : {}),
          },
        }
      })
      .filter((v) => !changeFor(v.company.id).removed)
  }, [seed, changes])

  // Churned accounts are out of the default view; the filter in the door brings them back.
  const rows = all.filter((v) => {
    if (state.filters["view.churned"] !== "Included" && v.account!.stage === "Churned") return false
    if (state.mine && session.role === "cs" && v.account!.owner !== session.user) return false
    if (state.mine && session.role === "ae" && v.account!.ae !== session.user) return false
    if (state.windows.length > 0) {
      const n = daysLeft(v.account!.renewal)
      if (!state.windows.some((w) => n >= 0 && n <= w)) return false
    }
    return true
  })

  const owners = Array.from(new Set(all.map((v) => v.account!.owner))).sort()

  /* ------------------------------------------------------------------------------- leaving */

  /** This table, and the row being left: every move off this page carries both. */
  const origin = (anchor?: string) => ({ route: "/ollopa/accounts", title: "Accounts", anchor })

  /** The account's record, with this table and this row kept on the trail. */
  const openAccount = (v: CompanyView) => follow(`/ollopa/companies/${v.company.id}`, origin(v.company.id))

  /* -------------------------------------------------------------------- the counters and strip */

  const windowCount = (days: number) => {
    const list = all.filter((v) => v.account!.stage !== "Churned" && daysLeft(v.account!.renewal) >= 0 && daysLeft(v.account!.renewal) <= days)
    return { n: list.length, value: list.reduce((s, v) => s + v.account!.value, 0) }
  }
  const atRisk = all.filter((v) => v.account!.band === "At risk" && v.account!.stage !== "Churned")
  const valueAtRisk = atRisk.reduce((s, v) => s + v.account!.value, 0)
  const handoffs = hasAe
    ? all.filter((v) => v.account!.handoff && !v.account!.handoff!.accepted && v.account!.owner === session.user)
    : []

  const toggleWindow = (days: number) =>
    setState({ windows: state.windows.includes(days) ? state.windows.filter((w) => w !== days) : [...state.windows, days] })

  /** The numbers this page is judged by, as one band above the card (LAYOUTS.md §2). */
  const figures: SummaryFigure[] = [
    ...[30, 60, 90].map((days) => {
      const { n, value } = windowCount(days)
      return { label: `Renewals · ${days} days`, value: money(value, b.currency), note: `${n} account${n === 1 ? "" : "s"}` }
    }),
    { label: "Value at risk", value: money(valueAtRisk, b.currency), note: `${atRisk.length} account${atRisk.length === 1 ? "" : "s"}` },
  ]

  /**
   * Narrowing the table to a renewal window is a filter, so it sits with the other filters — and it
   * is one control, not three. Three separate pills counted as three against the five the toolbar
   * may hold in front (LAYOUTS.md §2), so the windows are one joined segmented control with the
   * word in front of them.
   */
  const windowControl: ToolbarControl[] = [{
    name: "Renewals due",
    node: (
      <div className="flex shrink-0 items-center gap-2">
        <span className="t-label text-muted-foreground">Renewals</span>
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          aria-label="Renewals due"
          value={state.windows.map(String)}
          onValueChange={(next) => setState({ windows: next.map(Number) })}
        >
          {[30, 60, 90].map((days) => (
            <ToggleGroupItem key={days} value={String(days)} className="tabular-nums">
              {days}d · {windowCount(days).n}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    ),
  }]

  /** What sits above the table: a hand-off waiting for this seat, and what just happened. */
  const above: ReactNode = (
    <>
      {handoffs.length > 0 && (
        <Section heading="Hand-offs waiting for you" count={handoffs.length}>
          <Rows>
            {handoffs.map((v) => {
              const h = v.account!.handoff!
              return (
                <div key={v.company.id} className="flex flex-wrap items-start justify-between gap-2 py-2 first:pt-0">
                  <div className="min-w-0">
                    <div className="t-body">{v.account!.name}</div>
                    {/* Each fact carries its label; the prose line "Why they bought: …" was a
                        paragraph in a card body, and a paragraph is not a value. */}
                    <MetaLine values={[
                      { key: "from", label: "From", value: h.from },
                      { key: "sent", label: "Sent", value: day(h.sent) },
                      { key: "why", label: "Why they bought", value: h.whyTheyBought },
                    ]} />
                  </div>
                  <Actions surface="card" items={[{ kind: "secondary", label: "Accept the hand-off", onClick: () => setPending({ kind: "accept", row: v }) }]} />
                </div>
              )
            })}
          </Rows>
        </Section>
      )}

      {notice && <Notice text={notice.text} undo={notice.undo} onDone={() => setNotice(null)} />}

      {pending?.kind === "accept" && (
        <ConfirmStrip
          text={`You become the owner of ${pending.row.account!.name}. The account joins your book, the health baseline is taken today, and ${pending.row.account!.handoff!.from} is told.`}
          confirmLabel="Accept the hand-off"
          onConfirm={() => {
            const v = pending.row
            applyChange(v.company.id, { owner: session.user })
            setNotice({ text: `${v.account!.name} is yours. The record opens at the hand-off checklist.` })
            setPending(null)
            follow(`/ollopa/companies/${v.company.id}`, origin(v.company.id))
          }}
          onCancel={() => setPending(null)}
        />
      )}
      {pending?.kind === "churn" && (
        <ConfirmStrip
          tone="destructive"
          text={`${pending.row.account!.name}: the stage becomes Churned, the row leaves the default view, and sequences already exclude it.`}
          confirmLabel="Mark churned"
          onConfirm={() => {
            const v = pending.row
            applyChange(v.company.id, { churned: true, stage: "Churned" })
            setNotice({ text: `${v.account!.name} marked churned`, undo: () => undoChange(v.company.id, ["churned", "stage"]) })
            setPending(null)
          }}
          onCancel={() => setPending(null)}
        />
      )}
      {pending?.kind === "remove" && (
        <ConfirmStrip
          tone="destructive"
          text={`${pending.row.account!.name} is removed from Accounts and from every list it is on. The company stays on Companies.`}
          confirmLabel="Remove account"
          onConfirm={() => {
            const v = pending.row
            applyChange(v.company.id, { removed: true })
            setNotice({ text: `${v.account!.name} removed from Accounts`, undo: () => undoChange(v.company.id, ["removed"]) })
            setPending(null)
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  )

  /* ------------------------------------------------------------------------------- the columns */

  const columnDefs: Col<CompanyView>[] = [
    {
      id: "acct.name", priority: 1 as const, header: "Account", always: true, phone: true, sortValue: (v) => v.account!.name.toLowerCase(),
      cell: (v) => (
        /* The row's own id on the name, so a return from the record lands on the name and the
           keyboard carries on from there rather than from the row's checkbox. */
        <div className="min-w-0" data-item={v.company.id} data-item-label={v.account!.name}>
          <button
            type="button"
            className="min-w-0 truncate font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={(e) => { e.stopPropagation(); openAccount(v) }}
          >
            {v.account!.name}
          </button>
          <div className="truncate font-mono t-small text-muted-foreground">{v.account!.domain}</div>
        </div>
      ),
    },
    {
      id: "acct.health", priority: 1 as const, header: "Health", phone: true, className: "min-w-36 whitespace-nowrap", sortValue: (v) => v.account!.health,
      cell: (v) => (
        <span className="inline-flex items-baseline gap-1.5">
          <span className="font-medium tabular-nums">{v.account!.health}</span>
          {bandChip(v.account!.band)}
        </span>
      ),
    },
    { id: "acct.health-trend", priority: 3 as const, header: "30-day change", className: "whitespace-nowrap", sortValue: (v) => v.account!.healthDelta30, cell: (v) => delta(v.account!.healthDelta30) },
    {
      id: "acct.renewal", priority: 1 as const, header: "Renewal", phone: true, className: "whitespace-nowrap", sortValue: (v) => v.account!.renewal,
      cell: (v) => {
        const n = daysLeft(v.account!.renewal)
        return <span className={cn(n >= 0 && n < 30 && "font-medium [color:var(--warning-ink)]")}>{renewalText(v.account!.renewal)}</span>
      },
    },
    { id: "acct.value", priority: 3 as const, header: "Contract value", className: "whitespace-nowrap tabular-nums", sortValue: (v) => v.account!.value, cell: (v) => money(v.account!.value, b.currency) },
    {
      id: "acct.risks", header: "Open risks", className: "min-w-36", sortValue: (v) => v.account!.risks.filter((r) => !r.resolved).length,
      cell: (v) => {
        const open = v.account!.risks.filter((r) => !r.resolved)
        if (open.length === 0) return <span className="text-muted-foreground">None</span>
        const churn = open.find((r) => r.type === "Churn notice")
        // A churn notice is written out, never a count or a colour on its own (rule 7).
        return <Chip status={churn ? "blocked" : "warning"}>{open.length} · {(churn ?? open[0]).type}</Chip>
      },
    },
    { id: "acct.last-touch", priority: 3 as const, header: "Last touch", className: "whitespace-nowrap", sortValue: (v) => v.account!.lastTouch, cell: (v) => ago(v.account!.lastTouch) },
    {
      id: "acct.next-step", header: "Next step", sortValue: (v) => v.account!.nextStep.due,
      className: "min-w-[12rem] whitespace-normal",
      cell: (v) => (
        <NextStepCell
          value={v.account!.nextStep}
          onSave={(next) => { applyChange(v.company.id, { nextStep: next }); toast(`Next step on ${v.account!.name} · ${next.text}`) }}
        />
      ),
    },
    {
      id: "acct.signals", priority: 3 as const, header: "Expansion signals", sortValue: (v) => v.account!.signals.filter((s) => !s.dismissed).length,
      cell: (v) => {
        const live = v.account!.signals.filter((s) => !s.dismissed)
        return live.length === 0 ? <span className="text-muted-foreground">—</span> : <span>{live.length} · {live[0].kind}</span>
      },
    },
    { id: "acct.seats", priority: 3 as const, header: "Seats", className: "whitespace-nowrap tabular-nums", sortValue: (v) => v.account!.seatsActive / v.account!.seatsBought, cell: (v) => `${v.account!.seatsActive} of ${v.account!.seatsBought}` },
    { id: "acct.usage", priority: 3 as const, header: "Usage, 30 days", className: "whitespace-nowrap tabular-nums", sortValue: (v) => v.account!.usage30, cell: (v) => `${v.account!.usage30} · ${v.account!.usageDelta30 >= 0 ? "up" : "down"} ${Math.abs(v.account!.usageDelta30)}%` },
    { id: "acct.owner", priority: 3 as const, header: "Owner", sortValue: (v) => v.account!.owner, cell: (v) => v.account!.owner },
    { id: "acct.champion", header: "Champion", sortValue: (v) => v.account!.champion, cell: (v) => v.account!.champion },
    { id: "acct.plan", header: "Plan", sortValue: (v) => v.account!.plan, cell: (v) => v.account!.plan },
    { id: "acct.forecast", header: "Forecast", sortValue: (v) => v.account!.forecast, cell: (v) => v.account!.forecast },
    { id: "acct.terms", header: "Notice and auto-renew", className: "whitespace-nowrap", cell: (v) => `${v.account!.noticeDays} days · ${v.account!.autoRenew ? "auto-renews" : "does not auto-renew"}` },
    { id: "acct.ae", header: "Account executive", sortValue: (v) => v.account!.ae, cell: (v) => v.account!.ae },
    { id: "acct.stage", header: "Stage", className: "min-w-36 whitespace-nowrap", sortValue: (v) => v.account!.stage, cell: (v) => stageChip(v.account!.stage) },
    { id: "acct.contacts-held", header: "Contacts held", className: "tabular-nums", sortValue: (v) => v.contacts.length, cell: (v) => v.contacts.length },
    { id: "acct.industry-size", header: "Industry and employees", cell: (v) => `${v.company.industry} · ${v.company.employees.toLocaleString()}` },
    { id: "acct.parent", header: "Parent account", sortValue: (v) => v.company.parent ?? "", cell: (v) => v.company.parent ?? <span className="text-muted-foreground">—</span> },
    { id: "acct.crm-sync", header: "CRM sync", cell: (v) => v.account!.crmSync },
  ]
  // Removed, not disabled, where the workspace has no CRM (rule 4).
  const allColumns = columnDefs.filter((c) => (b.crm ? true : c.id !== "acct.crm-sync"))

  // An index is one full-width column (LAYOUTS.md §6), so the default set has to fit at 1440. Seven
  // columns did not: the table scrolled sideways on the widest screen. The last touch is the one
  // the renewal, the risks and the next step already speak for, so it comes out of the default set
  // and stays in the column picker.
  const DEFAULT_OUT = ["acct.last-touch"]
  const defaultColumnIds = allColumns
    .filter((c) => c.always || (d.level(c.id) === 1 && !DEFAULT_OUT.includes(c.id)))
    .map((c) => c.id)
  const chosenIds = state.columns ?? defaultColumnIds
  const columns = allColumns.filter((c) => chosenIds.includes(c.id) || c.always)

  /* ------------------------------------------------------------------------------- the filters */

  const filterDefs: FilterDef<CompanyView>[] = [
    { id: "view.health", name: "health band", label: "Health band", options: ["Healthy", "Watch", "At risk"], get: (v) => v.account!.band },
    { id: "view.owner", name: "owner", label: "Owner", options: owners, get: (v) => v.account!.owner },
    { id: "view.risk", name: "risk type", label: "Risk type", options: RISK_TYPES, get: (v) => v.account!.risks.find((r) => !r.resolved)?.type ?? "" },
    { id: "view.plan", name: "plan", label: "Plan", options: ["Starter", "Growth", "Scale"], get: (v) => v.account!.plan },
    { id: "view.churned", name: "churned accounts", label: "Churned accounts", options: ["Included"], get: () => "Included" },
  ]
  // The health band is the one filter in front. Owner joins the risk type and the plan behind the
  // door: with the search, the renewal windows and the columns the toolbar was already at seven
  // controls, and five is the most that may sit in front (LAYOUTS.md §2).
  const chips = filterDefs.filter((f) => f.id !== "view.churned" && f.id !== "view.owner" && d.level(f.id) === 1)
  const doorFilters = filterDefs.filter((f) => !chips.includes(f)).sort((x, y) => d.weekly(y.id) - d.weekly(x.id))

  /* ------------------------------------------------------------------------------- the actions */

  const logTouch = (v: CompanyView, kind: string, note: string) => {
    const before = changeFor(v.company.id).touches ?? []
    applyChange(v.company.id, { touches: [{ kind, at: TODAY, note, by: session.user }, ...before] })
    setNotice({ text: `${kind} logged on ${v.account!.name}. Last touch is today and the health score follows it.`, undo: () => undoChange(v.company.id, ["touches"]) })
  }

  const addRisk = (v: CompanyView, type: string, note: string, owner: string) => {
    const before = changeFor(v.company.id).risks ?? []
    const risk: AccountRisk = { id: `risk-local-${before.length + 1}`, type, opened: TODAY, owner, note, resolved: null }
    applyChange(v.company.id, { risks: [risk, ...before] })
    setNotice({ text: `${type} opened on ${v.account!.name}. The health score drops by ${type === "Churn notice" ? 37 : 12}.`, undo: () => undoChange(v.company.id, ["risks"]) })
  }

  const rowActionDefs: (RowAction<CompanyView> & { usage: string; always?: boolean })[] = [
    { id: "touch", usage: "work.log-touch", label: () => "Log touch", onClick: (v) => setTouching(v) },
    { id: "risk", usage: "risk.add", label: () => "Add risk", onClick: (v) => setRisking(v) },
    { id: "open", usage: "acct.name", label: () => "Open", onClick: openAccount },
    // Ridgeline's CS lead feeds the lifecycle campaigns, so the control is on the row there (specs/11 §3).
    ...(session.business === "ridgeline" && session.role === "cs" && hasCampaigns
      ? [{
          id: "campaign", usage: "work.campaign", always: true, label: () => "Add to campaign",
          onClick: (v: CompanyView) => toast(`${v.contacts.length} contacts at ${v.account!.name} added to a lifecycle campaign`),
        }]
      : []),
  ]
  const visible = rowActionDefs
    .filter((a) => a.always || (d.level(a.usage) === 1 && d.weekly(a.usage) > 0))
    .sort((x, y) => d.weekly(y.usage) - d.weekly(x.usage))
  const visibleIds = visible.map((a) => a.id)

  // The "…" button is named for what it holds, not "More actions".
  const menuOrder = ["Renewal deal", "expansion deal", "run a play", "email champion", "book review", "change owner",
    ...(hasCampaigns ? ["add to campaign"] : []), ...(b.crm ? ["push to CRM"] : []), "mark churned", "remove"]

  const menuActions: MenuAction<CompanyView>[] = [
    ...rowActionDefs.filter((a) => !visibleIds.includes(a.id)).map((a) => ({ id: a.id, label: a.label, onClick: a.onClick })),
    { id: "renewal", label: () => "Create renewal deal", onClick: (v) => { toast(`Renewal deal created on ${v.account!.name} · ${money(v.account!.value, b.currency)}`); follow("/ollopa/deals", origin(v.company.id)) } },
    { id: "expansion", label: () => "Create expansion deal", onClick: (v) => { toast(`Expansion deal created on ${v.account!.name}`); follow("/ollopa/deals", origin(v.company.id)) } },
    { id: "play", label: () => "Run a play", onClick: (v) => setPlaying(v) },
    { id: "email", label: (v) => `Email ${v.account!.champion}`, onClick: (v) => toast(`Composer open to ${v.account!.champion}`) },
    { id: "review", label: () => "Book a review meeting", onClick: (v) => toast(`Calendar open with the champion prefilled`) },
    { id: "owner", label: () => "Change owner to me", onClick: (v) => { applyChange(v.company.id, { owner: session.user }); setNotice({ text: `${v.account!.name} is yours. The hand-off notes travel with it.`, undo: () => undoChange(v.company.id, ["owner"]) }) } },
    ...(hasCampaigns && !visibleIds.includes("campaign")
      ? [{ id: "campaign2", label: () => "Add to campaign", onClick: (v: CompanyView) => toast(`${v.contacts.length} contacts at ${v.account!.name} added to a lifecycle campaign`) }]
      : []),
    ...(b.crm
      ? [{
          id: "push", label: () => `Push to ${crmName} now`,
          onClick: (v: CompanyView) => {
            applyChange(v.company.id, { pushedToCrmAt: TODAY })
            setNotice({ text: v.account!.crmSync === "error" ? `${crmName} refused ${v.account!.name}: a required field is empty in the CRM.` : `${v.account!.name} pushed to ${crmName}` })
          },
        }]
      : []),
    { id: "churn", destructive: true, label: () => "Mark churned · the row leaves the default view, sequences already exclude it", onClick: (v) => setPending({ kind: "churn", row: v }) },
    { id: "remove", destructive: true, label: () => "Remove · leaves Accounts and its lists, the company stays on Companies", onClick: (v) => setPending({ kind: "remove", row: v }) },
  ]

  /* -------------------------------------------------------------------------------- the render */

  const empty = session.business === "halyard"
    ? { title: "This workspace has no current clients", body: "Clients of this workspace are kept out of sequences automatically once their stage is set." }
    : { title: "No client accounts yet", body: "An account appears here when a deal is closed won, or when a company's stage is set to Current client on Companies." }

  return (
    <>
      <DataTable<CompanyView>
        family="accounts"
        title="Accounts"
        total={all.length}
        rows={rows}
        rowKey={(v) => v.company.id}
        searchHint="Search accounts"
        noun="accounts"
        searchText={(v) => `${v.account!.name} ${v.account!.domain} ${v.account!.champion} ${v.account!.owner}`}
        figures={figures}
        above={above}
        extraControls={windowControl}
        primary={session.role === "ae" && hasAe ? { label: "Send hand-off", onClick: () => toast("Pick a customer success manager; the account joins their queue.") } : undefined}
        chips={chips}
        doorFilters={doorFilters}
        columns={columns}
        allColumns={allColumns}
        onColumnsChange={(ids) => setState({ columns: ids })}
        sort={state.sort}
        onSortChange={(sort) => setState({ sort })}
        filters={state.filters}
        onFiltersChange={(filters) => setState({ filters })}
        pageMenu={{
          label: "My accounts, grouping, export, score settings",
          items: [
            { label: state.mine ? "Show every account" : "Show only my accounts", onClick: () => setState({ mine: !state.mine }) },
            { label: "Group by owner", onClick: () => setState({ sort: { id: "acct.owner", dir: "asc" } }) },
            { label: "Export CSV", onClick: () => toast(`Exported ${rows.length} accounts · ${columns.length} visible columns`) },
            { label: "Health score model (Settings)", onClick: () => follow("/ollopa/settings/scoring", origin()) },
            { label: "Which signals fire (Settings)", onClick: () => follow("/ollopa/settings/scoring", origin()) },
          ],
        }}
        rowActions={visible}
        menuActions={menuActions}
        menuLabel={(v) => `${menuOrder.join(", ")} — for ${v.account!.name}`}
        rowDoor={{
          id: (v) => `accounts.signals.${v.company.id}`,
          label: (v) => (v.account!.signals.length === 0 ? null : "Signals and news"),
          count: (v) => v.account!.signals.length,
          content: (v) => (
            <ul className="space-y-2 py-1">
              {v.account!.signals.map((s) => (
                <li key={s.id} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-medium">{s.kind}</span>
                  <MetaLine values={[
                    { key: "detail", label: "Detail", value: s.detail },
                    { key: "source", label: "Source", value: s.source },
                    { key: "fired", label: "Fired", value: day(s.fired) },
                    { key: "routed", label: "Routed to", value: s.routedTo },
                    { key: "due", label: "Due", value: day(s.dueBy) },
                    { key: "outcome", label: "Outcome", value: s.outcome || "none yet" },
                  ]} />
                  <span className="ml-auto">
                    <Actions
                      surface="card"
                      items={[
                        { kind: "secondary", label: "Route it", onClick: () => { toast(`Expansion deal and a task created from “${s.kind}”, with the brief attached`); follow("/ollopa/deals", origin(v.company.id)) } },
                        { kind: "destructive", label: "Dismiss", onClick: () => { applyChange(v.company.id, { dismissedSignals: [...(changeFor(v.company.id).dismissedSignals ?? []), s.id] }); toast(`“${s.kind}” dismissed`) } },
                      ]}
                    />
                  </span>
                </li>
              ))}
            </ul>
          ),
        }}
        quickLook={{
          title: (v) => v.account!.name,
          fields: (v) => quickLookFields(v, b.currency, d.level),
          editable: (v) => ({
            label: "Next step",
            value: v.account!.nextStep.text,
            onChange: (text) => { applyChange(v.company.id, { nextStep: { text, due: v.account!.nextStep.due } }); toast(`Next step on ${v.account!.name} · ${text}`) },
          }),
          onOpen: openAccount,
        }}
        rowKeys={{
          l: (v) => setTouching(v),
          r: (v) => setRisking(v),
          n: (v) => setTouching(v),
          o: openAccount,
          "1": () => toggleWindow(30),
          "2": () => toggleWindow(60),
          "3": () => toggleWindow(90),
        }}
        bulk={[
          { label: "Assign owner to me", onClick: (vs) => { vs.forEach((v) => applyChange(v.company.id, { owner: session.user })); setNotice({ text: `${vs.length} accounts are yours`, undo: () => vs.forEach((v) => undoChange(v.company.id, ["owner"])) }) } },
          ...(hasCampaigns ? [{ label: "Add to campaign", onClick: (vs: CompanyView[]) => toast(`${vs.length} accounts added to a lifecycle campaign`) }] : []),
          { label: "Export CSV", onClick: (vs) => toast(`Exported ${vs.length} accounts · ${columns.length} visible columns`) },
        ]}
        phoneSummary={(v) => `${v.account!.risks.filter((r) => !r.resolved).length} open risk · ${v.account!.owner}`}
        empty={empty}
      />

      <TouchPanel row={touching} onClose={() => setTouching(null)} onLog={logTouch} />
      <RiskPanel row={risking} owner={session.user} onClose={() => setRisking(null)} onAdd={addRisk} />
      <PlayPanel
        open={Boolean(playing)}
        onOpenChange={(o) => { if (!o) setPlaying(null) }}
        view={playing}
        user={session.user}
        currency={b.currency}
        onRun={(summary) => { setNotice({ text: `Play run · ${summary}` }); setPlaying(null) }}
      />

    </>
  )
}

/* -------------------------------------------------------------------------------- small pieces */

/** The next step is read and set in one cell: one item, not two (rule 5). */
function NextStepCell({ value, onSave }: { value: { text: string; due: string }; onSave: (v: { text: string; due: string }) => void }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value.text)
  if (editing) {
    return (
      <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Input
          autoFocus
          aria-label="Next step"
          className="h-7 w-44 t-small"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { onSave({ text, due: value.due }); setEditing(false) }
            if (e.key === "Escape") { setText(value.text); setEditing(false) }
          }}
          onBlur={() => { onSave({ text, due: value.due }); setEditing(false) }}
        />
      </span>
    )
  }
  return (
    <button
      type="button"
      className="block w-full truncate text-left hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      onClick={(e) => { e.stopPropagation(); setEditing(true) }}
    >
      {value.text} <span className="text-muted-foreground">· {day(value.due)}</span>
      <span className="sr-only">Edit the next step</span>
    </button>
  )
}

function TouchPanel({ row, onClose, onLog }: { row: CompanyView | null; onClose: () => void; onLog: (v: CompanyView, kind: string, note: string) => void }) {
  const [kind, setKind] = useState("Call")
  const [note, setNote] = useState("")
  if (!row) return null
  return (
    <Panel id="log-touch" title={`Log a touch on ${row.account!.name}`} open onOpenChange={(o) => { if (!o) onClose() }}
      footer={<Actions surface="dialog" layout="stack" items={[{
        kind: "primary", label: `Log the ${kind.toLowerCase()}`,
        disabledBecause: note.trim() ? undefined : "Say what happened, above",
        onClick: () => { onLog(row, kind, note); setNote(""); onClose() },
      }]} />}>
      <div className="space-y-3">
        <div>
          <Label htmlFor="touch-kind" className="t-small">Kind</Label>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger id="touch-kind" className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{["Call", "Email", "Meeting"].map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="touch-note" className="t-small">What happened</Label>
          <Textarea id="touch-note" rows={3} className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
    </Panel>
  )
}

function RiskPanel({ row, owner, onClose, onAdd }: { row: CompanyView | null; owner: string; onClose: () => void; onAdd: (v: CompanyView, type: string, note: string, owner: string) => void }) {
  const [type, setType] = useState(RISK_TYPES[0])
  const [note, setNote] = useState("")
  const [who, setWho] = useState(owner)
  if (!row) return null
  return (
    <Panel id="add-risk" title={`Add a risk on ${row.account!.name}`} open onOpenChange={(o) => { if (!o) onClose() }}
      footer={<Actions surface="dialog" layout="stack" items={[{
        kind: "primary", label: "Add the risk",
        disabledBecause: note.trim() ? undefined : "Say what is happening, above",
        onClick: () => { onAdd(row, type, note, who); setNote(""); onClose() },
      }]} />}>
      <div className="space-y-3">
        <div>
          <Label htmlFor="risk-type" className="t-small">Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="risk-type" className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{RISK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="risk-note" className="t-small">What is happening</Label>
          <Textarea id="risk-note" rows={3} className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="risk-owner" className="t-small">Owner</Label>
          <Input id="risk-owner" className="mt-1" value={who} onChange={(e) => setWho(e.target.value)} />
        </div>
      </div>
    </Panel>
  )
}
