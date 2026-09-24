// `P-companies`: which companies the workspace holds, how many people it holds at each, and the
// record behind every row (specs/03 §3 and §6).
//
// A row is not a company. It is "this company, the 4 people we hold there, 2 in a sequence, last
// touched 3 days ago", and every level-one decision follows from that. What sits at level one is
// asked of the usage model for this seat at this business and never hard-coded, which is how one
// page serves four businesses and four seats with no mode switch.
import { useMemo, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { href } from "@/app/router"
import { Separator } from "@/components/ui/separator"
import { follow } from "../../chain"
import { toast } from "../../templates/TablePage"
import { Actions } from "../../ui/Actions"
import { Panel } from "../../ui/Panel"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { ACCOUNT_STAGES, CREDITS, TODAY, seedFor, type AccountStage } from "../../data/seed"
import type { Session } from "../../session"
import { DataTable, type Col, type FilterDef, type MenuAction, type RowAction } from "./Table"
import { viewsOf, type CompanyView } from "./data"
import { quickLookFields, stageChip } from "./quickLook"
import { ago, day } from "./format"
import { usePageState } from "./persist"
import { applyChange, changeFor, undoChange, useChanges } from "./changes"
import { ConfirmStrip, Notice } from "./strips"

type Pending =
  | { kind: "research"; row: CompanyView }
  | { kind: "stage"; row: CompanyView; to: AccountStage }
  | { kind: "owner"; row: CompanyView; to: string }
  | { kind: "list"; row: CompanyView }
  | { kind: "remove"; row: CompanyView }
  | { kind: "push"; row: CompanyView }
  | { kind: "bulk-remove"; rows: CompanyView[] }
  | { kind: "bulk-push"; rows: CompanyView[] }

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort()

const EMPLOYEE_BANDS: [string, (n: number) => boolean][] = [
  ["Under 50", (n) => n < 50], ["50–199", (n) => n >= 50 && n < 200], ["200–999", (n) => n >= 200 && n < 1_000],
  ["1,000–4,999", (n) => n >= 1_000 && n < 5_000], ["5,000 and over", (n) => n >= 5_000],
]
const bandOf = (n: number) => EMPLOYEE_BANDS.find(([, test]) => test(n))?.[0] ?? "Under 50"

const ACTIVITY_BANDS = ["In the last 7 days", "In the last 30 days", "Over 30 days ago"]
const activityBand = (iso: string) => {
  const days = Math.round((Date.parse(TODAY) - Date.parse(iso)) / 86_400_000)
  return days <= 7 ? ACTIVITY_BANDS[0] : days <= 30 ? ACTIVITY_BANDS[1] : ACTIVITY_BANDS[2]
}

export function CompaniesPage({ session }: { session: Session }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const d = useDisclosure("companies")
  const changes = useChanges()

  const [state, setState] = usePageState("companies", session.business, session.user, {
    filters: {} as Record<string, string>,
    columns: null as string[] | null,
    sort: { id: "co.col.last-activity", dir: "desc" } as { id: string; dir: "asc" | "desc" },
    view: "All companies",
    exclusions: { owned: true, inSequence: true },
    findFilters: {} as Record<string, string>,
  })

  const [pending, setPending] = useState<Pending | null>(null)
  const [notice, setNotice] = useState<{ text: string; undo?: () => void } | null>(null)
  const [findOpen, setFindOpen] = useState(false)
  const [editing, setEditing] = useState<CompanyView | null>(null)
  const [merging, setMerging] = useState<CompanyView | null>(null)
  const [flagging, setFlagging] = useState<CompanyView | null>(null)
  const [listName, setListName] = useState("")
  const [saved, setSaved] = useState<string[]>([])

  /* ---------------------------------------------------------------------------------- the rows */

  const rows = useMemo(() => {
    void changes
    return viewsOf(seed)
      .map((v) => {
        const c = changeFor(v.company.id)
        if (!c.stage && !c.owner && !c.name && !c.domain && !c.industry && c.employees === undefined) return v
        return {
          ...v,
          company: {
            ...v.company,
            ...(c.stage ? { stage: c.stage } : {}),
            ...(c.owner ? { owner: c.owner } : {}),
            ...(c.name ? { name: c.name } : {}),
            ...(c.domain ? { domain: c.domain } : {}),
            ...(c.industry ? { industry: c.industry } : {}),
            ...(c.employees !== undefined ? { employees: c.employees } : {}),
          },
        }
      })
      .filter((v) => !changeFor(v.company.id).removed)
  }, [seed, changes])

  const owners = unique(seed.companies.map((c) => c.owner))
  const crmName = (b.crm ?? "the CRM").replace(/\s*\(.*\)$/, "")
  // Two seat gaps the spec names: an SDR does not reassign accounts, and customer success does not
  // push to the CRM of record. Removed from the menu, with one line naming who can (rule 4).
  const canChangeOwner = session.role !== "sdr"
  const canPushCrm = Boolean(b.crm) && session.role !== "cs"
  const admin = b.roles.find((r) => r.role === "admin")

  /* ------------------------------------------------------------------------------- the columns */

  const allColumns: Col<CompanyView>[] = [
    {
      id: "co.col.company", header: "Company", always: true, phone: true, sortValue: (v) => v.company.name.toLowerCase(),
      cell: (v) => (
        /* The row's own id on the name, so a return from the record lands on the name and the
           keyboard carries on from there rather than from the row's checkbox. */
        <div className="min-w-0" data-item={v.company.id} data-item-label={v.company.name}>
          <div className="flex min-w-0 items-center gap-1.5">
            {/* A real link: a plain click is intercepted by the template and opens the company
                beside the list, and ⌘-click, the middle button and copy-link still reach the
                record (BUILD-CHAINS.md, mechanic 1). */}
            <a
              href={href(`/ollopa/companies/${v.company.id}`)}
              className="min-w-0 truncate font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              onClick={(e) => { e.preventDefault(); openCompany(v) }}
            >
              {v.company.name}
            </a>
            {/* Safety state stays on the row whatever the columns say. */}
            {v.company.stage === "Do not prospect" && stageChip(v.company.stage)}
          </div>
          <div className="truncate font-mono t-small text-muted-foreground">{v.company.domain}</div>
        </div>
      ),
    },
    { id: "co.col.contacts", header: "Contacts held", className: "tabular-nums", sortValue: (v) => v.contacts.length, cell: (v) => v.contacts.length },
    { id: "co.col.in-sequence", header: "In a sequence", className: "tabular-nums", sortValue: (v) => v.inSequence.length, cell: (v) => (v.inSequence.length === 0 ? <span className="text-muted-foreground">—</span> : v.inSequence.length) },
    { id: "co.col.stage", priority: 1 as const, header: "Stage", phone: true, className: "min-w-36 whitespace-nowrap", sortValue: (v) => v.company.stage, cell: (v) => stageChip(v.company.stage) },
    // The column is the company's own last activity; the record header widens it to the newest of
    // the company, its contacts, its replies and its deals.
    { id: "co.col.last-activity", header: "Last activity", phone: true, className: "whitespace-nowrap", sortValue: (v) => v.company.lastActivity, cell: (v) => <span title={day(v.company.lastActivity)}>{ago(v.company.lastActivity)}</span> },
    { id: "co.col.industry", priority: 3 as const, header: "Industry", sortValue: (v) => v.company.industry, cell: (v) => v.company.industry },
    { id: "co.col.employees", priority: 3 as const, header: "Employees", className: "tabular-nums", sortValue: (v) => v.company.employees, cell: (v) => v.company.employees.toLocaleString() },
    { id: "co.col.owner", priority: 3 as const, header: "Owner", sortValue: (v) => v.company.owner, cell: (v) => v.company.owner },
    { id: "co.col.open-deals", header: "Open deals", className: "tabular-nums", sortValue: (v) => v.openDeals.length, cell: (v) => v.openDeals.length || <span className="text-muted-foreground">—</span> },
    { id: "co.col.last-reply", header: "Last reply", className: "whitespace-nowrap", sortValue: (v) => v.lastReply ?? "", cell: (v) => (v.lastReply ? ago(v.lastReply) : <span className="text-muted-foreground">never</span>) },
    { id: "co.col.location", priority: 3 as const, header: "Location", sortValue: (v) => v.company.location.country, cell: (v) => `${v.company.location.city}, ${v.company.location.country}` },
    { id: "co.col.signals", header: "Signals", sortValue: (v) => v.company.signals.length, cell: (v) => v.company.signals.join(", ") || <span className="text-muted-foreground">—</span> },
    { id: "co.col.score", header: "Fit score", className: "tabular-nums", sortValue: (v) => v.company.fitScore ?? -1, cell: (v) => v.company.fitScore ?? <span className="text-muted-foreground">not scored</span> },
    { id: "co.col.parent", header: "Parent company", sortValue: (v) => v.company.parent ?? "", cell: (v) => v.company.parent ?? <span className="text-muted-foreground">—</span> },
    { id: "co.col.added", header: "Added on", className: "whitespace-nowrap", sortValue: (v) => v.company.addedOn, cell: (v) => day(v.company.addedOn) },
    { id: "co.col.source", header: "Source", sortValue: (v) => v.company.source, cell: (v) => v.company.source },
    { id: "co.col.revenue", priority: 3 as const, header: "Revenue", sortValue: (v) => v.company.revenue, cell: (v) => v.company.revenue },
    { id: "co.col.founded", header: "Founded", className: "tabular-nums", sortValue: (v) => v.company.founded, cell: (v) => v.company.founded },
    { id: "co.col.enriched", header: "Enriched on", className: "whitespace-nowrap", sortValue: (v) => v.company.enrichedOn ?? "", cell: (v) => (v.company.enrichedOn ? day(v.company.enrichedOn) : <span className="text-muted-foreground">never</span>) },
  ]

  const defaultColumnIds = allColumns.filter((c) => c.always || d.level(c.id) === 1).map((c) => c.id)
  const chosenIds = state.columns ?? defaultColumnIds
  const columns = allColumns.filter((c) => chosenIds.includes(c.id) || c.always)

  /* ------------------------------------------------------------------------------- the filters */

  const filterDefs: FilterDef<CompanyView>[] = [
    { id: "co.filter.stage", name: "stage", label: "Stage", options: [...ACCOUNT_STAGES], get: (v) => v.company.stage },
    { id: "co.filter.industry", name: "industry", label: "Industry", options: unique(seed.companies.map((c) => c.industry)), get: (v) => v.company.industry },
    { id: "co.filter.employees", name: "size", label: "Employees", options: EMPLOYEE_BANDS.map(([n]) => n), get: (v) => bandOf(v.company.employees) },
    { id: "co.filter.owner", name: "owner", label: "Owner", options: owners, get: (v) => v.company.owner },
    { id: "co.filter.location", name: "location", label: "Location", options: unique(seed.companies.map((c) => c.location.country)), get: (v) => v.company.location.country },
    { id: "co.filter.last-activity", name: "activity", label: "Last activity", options: ACTIVITY_BANDS, get: (v) => activityBand(v.company.lastActivity) },
    { id: "co.filter.list", name: "lists", label: "In list", options: unique(seed.lists.filter((l) => l.kind === "companies").map((l) => l.name)), get: (v) => v.company.lists[0] ?? "" },
    { id: "co.filter.signals", name: "signals", label: "Signals", options: unique(seed.companies.flatMap((c) => c.signals)), get: (v) => v.company.signals[0] ?? "" },
    { id: "co.filter.in-sequence", name: "sequences", label: "Contacts in a sequence", options: ["Yes", "No"], get: (v) => (v.inSequence.length > 0 ? "Yes" : "No") },
    { id: "co.filter.open-deals", name: "deals", label: "Open deals", options: ["Yes", "No"], get: (v) => (v.openDeals.length > 0 ? "Yes" : "No") },
    { id: "co.filter.technology", name: "fields", label: "Technology", options: unique(seed.companies.flatMap((c) => c.technologies)), get: (v) => v.company.technologies[0] ?? "" },
    { id: "co.filter.funding", name: "fields", label: "Funding", options: ["Raised", "Not raised"], get: (v) => (v.company.funding ? "Raised" : "Not raised") },
    { id: "co.filter.revenue", name: "fields", label: "Revenue", options: unique(seed.companies.map((c) => c.revenue)), get: (v) => v.company.revenue },
    { id: "co.filter.source", name: "fields", label: "Source", options: ["Found", "Imported", "CRM"], get: (v) => v.company.source },
    { id: "co.filter.parent", name: "fields", label: "Parent company", options: unique(seed.companies.map((c) => c.parent ?? "")), get: (v) => v.company.parent ?? "" },
  ]

  const chips = filterDefs.filter((f) => d.level(f.id) === 1)
  // The door's label names what is behind it, group by group, in the order this seat uses them.
  const doorFilters = filterDefs.filter((f) => d.level(f.id) === 2).sort((x, y) => d.weekly(y.id) - d.weekly(x.id))

  /* ------------------------------------------------------------------------------- the actions */

  /** This table, and the row being left: every move off this page carries both. */
  const origin = (anchor?: string) => ({ route: "/ollopa/companies", title: "Companies", anchor })

  /** The company record, with this table and this row kept on the trail. */
  const openCompany = (v: CompanyView) => follow(`/ollopa/companies/${v.company.id}`, origin(v.company.id))

  const findPeople = (v: CompanyView) => {
    toast(`People · at ${v.company.name}`)
    follow(`/ollopa/people?company=${v.company.id}`, origin(v.company.id))
  }

  const addToList = (v: CompanyView, name: string) => {
    applyChange(v.company.id, { lists: [...(changeFor(v.company.id).lists ?? v.company.lists), name] })
    setNotice({ text: `Added to ${name}`, undo: () => undoChange(v.company.id, ["lists"]) })
    toast(`Added to ${name}`)
  }

  const runResearch = (v: CompanyView) => {
    const runs = changeFor(v.company.id).researchRuns ?? []
    applyChange(v.company.id, {
      researchRuns: [{ id: `run-${runs.length + 1}`, agent: "Research agent", at: TODAY, sources: 14, credits: CREDITS.research }, ...runs],
    })
    setNotice({ text: `Research agent ran on ${v.company.name} · ${CREDITS.research} credits. The brief is in the record's research door.` })
    toast(`Researched ${v.company.name} · ${CREDITS.research} credits`)
  }

  const rowActionDefs: (RowAction<CompanyView> & { usage: string })[] = [
    { id: "find", usage: "co.act.find-people", label: () => "Find people", onClick: findPeople },
    { id: "open", usage: "co.act.open", label: () => "Open", onClick: openCompany },
    { id: "list", usage: "co.act.add-list", label: () => "Add to list", onClick: (v) => { setListName(""); setPending({ kind: "list", row: v }) } },
    { id: "research", usage: "co.act.research", label: () => `Research · ${CREDITS.research} credits`, onClick: (v) => setPending({ kind: "research", row: v }) },
    { id: "stage", usage: "co.act.stage", label: () => "Change stage", onClick: (v) => setPending({ kind: "stage", row: v, to: v.company.stage }) },
    { id: "owner", usage: "co.act.owner", label: () => "Change owner", onClick: (v) => setPending({ kind: "owner", row: v, to: v.company.owner }) },
  ]

  const visible = rowActionDefs
    .filter((a) => d.level(a.usage) === 1 && d.weekly(a.usage) > 0 && (a.id !== "owner" || canChangeOwner))
    .sort((x, y) => d.weekly(y.usage) - d.weekly(x.usage))
  const visibleIds = visible.map((a) => a.id)

  const menuActions: MenuAction<CompanyView>[] = [
    ...rowActionDefs
      .filter((a) => !visibleIds.includes(a.id) && (a.id !== "owner" || canChangeOwner))
      .map((a) => ({ id: a.id, label: a.label, onClick: a.onClick })),
    { id: "edit", label: () => "Edit", onClick: (v) => setEditing(v) },
    ...(canPushCrm ? [{ id: "push", label: () => `Push to ${crmName} · updates 3 fields, never deletes`, onClick: (v: CompanyView) => setPending({ kind: "push", row: v }) }] : []),
    { id: "export", label: () => "Export CSV", onClick: (v) => toast(`Exported ${v.company.name} · ${columns.length} visible columns`) },
    { id: "merge", label: () => "Merge duplicates", onClick: (v) => setMerging(v) },
    { id: "flag", label: () => "Flag data as wrong", onClick: (v) => setFlagging(v) },
    {
      id: "remove", destructive: true,
      label: (v) => `Remove · leaves ${v.company.lists.length} list${v.company.lists.length === 1 ? "" : "s"}, stops sequences for ${v.inSequence.length} contact${v.inSequence.length === 1 ? "" : "s"}, keeps the contacts`,
      onClick: (v) => setPending({ kind: "remove", row: v }),
    },
  ]

  /* -------------------------------------------------------------------------- page-level actions */

  const findIsPrimary = d.level("co.page.find") === 1 && d.weekly("co.page.find") > 0
  const viewsAtLevelOne = d.level("co.page.views") === 1

  const pageMenuItems = [
    ...(findIsPrimary ? [] : [{ label: "Find companies", onClick: () => setFindOpen(true) }]),
    { label: "Import CSV", onClick: () => follow("/ollopa/import", origin()) },
    { label: "Export all", onClick: () => toast(`Exported ${rows.length.toLocaleString()} companies · ${columns.length} visible columns`) },
    { label: "Merge duplicates", onClick: () => setMerging(rows[0] ?? null) },
    { label: "Alert me when a view gains companies", onClick: () => toast(`Daily digest on for “${state.view}”`) },
    ...(viewsAtLevelOne ? [] : [{ label: "Saved views", onClick: () => toast(`Views: ${seed.savedViews.filter((v) => v.object === "company").map((v) => v.name).join(", ") || "none saved"}`) }]),
  ]
  const pageMenuLabel = findIsPrimary ? "Import, export all, merge, alerts" : "Find companies, import, export all, merge, alerts"

  /* ---------------------------------------------------------------------------- Find companies */

  const excluded = {
    owned: rows.filter((v) => v.company.owner === session.user).length,
    inSequence: rows.filter((v) => v.inSequence.length > 0).length,
  }
  const findRows = rows.filter((v) => {
    if (state.exclusions.owned && v.company.owner === session.user) return false
    if (state.exclusions.inSequence && v.inSequence.length > 0) return false
    for (const [key, value] of Object.entries(state.findFilters)) {
      if (!value || value === "all") continue
      const f = filterDefs.find((x) => x.id === key)
      if (f && f.get(v) !== value) return false
    }
    return true
  })
  const findRemoved = rows.length - findRows.length

  /* ------------------------------------------------------------------------------- the strips */

  const stageConsequence = (v: CompanyView, to: AccountStage) =>
    to === "Do not prospect"
      ? `Stage becomes Do not prospect. Stops all sequences for ${v.inSequence.length} contact${v.inSequence.length === 1 ? "" : "s"} here.`
      : `Stage becomes ${to}.`

  const strip: ReactNode = (
    <div className="space-y-2">
      {notice && <Notice text={notice.text} undo={notice.undo} onDone={() => setNotice(null)} />}
      {pending?.kind === "research" && (
        <ConfirmStrip
          text={`Run the research agent on ${pending.row.company.name} for ${CREDITS.research} credits? Balance ${seed.credits.balance.toLocaleString()}.`}
          confirmLabel={`Run · ${CREDITS.research} credits`}
          onConfirm={() => { runResearch(pending.row); setPending(null) }}
          onCancel={() => setPending(null)}
        />
      )}
      {pending?.kind === "stage" && (
        <ConfirmStrip
          text={stageConsequence(pending.row, pending.to)}
          confirmLabel="Change stage"
          tone={pending.to === "Do not prospect" ? "destructive" : undefined}
          onConfirm={() => {
            const v = pending.row, to = pending.to
            applyChange(v.company.id, { stage: to })
            setNotice({ text: `${v.company.name} · stage ${to}`, undo: () => undoChange(v.company.id, ["stage"]) })
            setPending(null)
          }}
          onCancel={() => setPending(null)}
        >
          <Select value={pending.to} onValueChange={(to) => setPending({ ...pending, to: to as AccountStage })}>
            <SelectTrigger className="h-8 w-52" aria-label="Stage"><SelectValue /></SelectTrigger>
            <SelectContent>{ACCOUNT_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </ConfirmStrip>
      )}
      {pending?.kind === "owner" && (
        <ConfirmStrip
          text={`${pending.row.company.name} moves to ${pending.to}. The contacts here keep their own owners.`}
          confirmLabel="Change owner"
          onConfirm={() => {
            const v = pending.row, to = pending.to
            applyChange(v.company.id, { owner: to })
            setNotice({ text: `${v.company.name} · owner ${to}`, undo: () => undoChange(v.company.id, ["owner"]) })
            setPending(null)
          }}
          onCancel={() => setPending(null)}
        >
          <Select value={pending.to} onValueChange={(to) => setPending({ ...pending, to })}>
            <SelectTrigger className="h-8 w-52" aria-label="Owner"><SelectValue /></SelectTrigger>
            <SelectContent>{owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </ConfirmStrip>
      )}
      {pending?.kind === "list" && (
        <ConfirmStrip
          text={`Add ${pending.row.company.name} to a list.`}
          confirmLabel="Add to list"
          onConfirm={() => { if (listName) addToList(pending.row, listName); setPending(null) }}
          onCancel={() => setPending(null)}
        >
          <Select value={listName} onValueChange={setListName}>
            <SelectTrigger className="h-8 w-56" aria-label="List"><SelectValue placeholder="Pick a list" /></SelectTrigger>
            <SelectContent>{seed.lists.filter((l) => l.kind === "companies").map((l) => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input className="h-8 w-48" aria-label="Or a new list name" placeholder="Or a new list name" value={listName} onChange={(e) => setListName(e.target.value)} />
        </ConfirmStrip>
      )}
      {pending?.kind === "push" && (
        <ConfirmStrip
          text={`Push ${pending.row.company.name} to ${crmName}: updates 3 fields, never deletes.`}
          confirmLabel={`Push to ${crmName}`}
          onConfirm={() => {
            const v = pending.row
            applyChange(v.company.id, { pushedToCrmAt: TODAY })
            setNotice({ text: v.company.crm?.lastError ? `${crmName} refused ${v.company.name}: ${v.company.crm.lastError}` : `${v.company.name} pushed to ${crmName} · 3 fields updated` })
            setPending(null)
          }}
          onCancel={() => setPending(null)}
        />
      )}
      {pending?.kind === "remove" && (
        <ConfirmStrip
          tone="destructive"
          text={`Remove ${pending.row.company.name}: leaves ${pending.row.company.lists.length} list${pending.row.company.lists.length === 1 ? "" : "s"}, stops sequences for ${pending.row.inSequence.length} contact${pending.row.inSequence.length === 1 ? "" : "s"}, keeps the ${pending.row.contacts.length} contacts.`}
          confirmLabel="Remove"
          onConfirm={() => {
            const v = pending.row
            applyChange(v.company.id, { removed: true })
            setNotice({ text: `${v.company.name} removed`, undo: () => undoChange(v.company.id, ["removed"]) })
            setPending(null)
          }}
          onCancel={() => setPending(null)}
        />
      )}
      {pending?.kind === "bulk-remove" && (
        <ConfirmStrip
          tone="destructive"
          text={`Remove ${pending.rows.length} companies: they leave every list they are on and stop sequences for ${pending.rows.reduce((n, v) => n + v.inSequence.length, 0)} contacts. The contacts stay.`}
          confirmLabel={`Remove ${pending.rows.length}`}
          onConfirm={() => {
            const ids = pending.rows.map((v) => v.company.id)
            ids.forEach((x) => applyChange(x, { removed: true }))
            setNotice({ text: `${ids.length} companies removed`, undo: () => ids.forEach((x) => undoChange(x, ["removed"])) })
            setPending(null)
          }}
          onCancel={() => setPending(null)}
        />
      )}
      {pending?.kind === "bulk-push" && (
        <ConfirmStrip
          text={`Push ${pending.rows.length} companies to ${crmName}: updates 3 fields on each, never deletes.`}
          confirmLabel={`Push ${pending.rows.length}`}
          onConfirm={() => {
            pending.rows.forEach((v) => applyChange(v.company.id, { pushedToCrmAt: TODAY }))
            setNotice({ text: `${pending.rows.length} companies pushed to ${crmName}` })
            setPending(null)
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  )

  /* ---------------------------------------------------------------------------------- render */

  return (
    <>
      <DataTable<CompanyView>
        family="companies"
        title="Companies"
        total={b.counts.companies}
        rows={rows}
        rowKey={(v) => v.company.id}
        beside={(v) => ({ kind: "company", id: v.company.id })}
        searchHint="Search a company, a domain or a person"
        noun="companies"
        searchText={(v) => `${v.company.name} ${v.company.domain} ${v.company.industry} ${v.contacts.map((c) => `${c.name} ${c.email}`).join(" ")}`}
        above={notice || pending ? strip : undefined}
        below={(!canChangeOwner || (Boolean(b.crm) && !canPushCrm)) && admin ? (
          <p className="t-small text-muted-foreground">
            {!canChangeOwner ? "Owner changes" : `Pushes to ${crmName}`}: ask {admin.user} ({admin.title}).
          </p>
        ) : undefined}
        chips={chips}
        doorFilters={doorFilters}
        columns={columns}
        allColumns={allColumns}
        onColumnsChange={(ids) => setState({ columns: ids })}
        sort={state.sort}
        onSortChange={(sort) => setState({ sort })}
        filters={state.filters}
        onFiltersChange={(filters) => setState({ filters })}
        primary={findIsPrimary ? { label: "Find companies", onClick: () => setFindOpen(true) } : undefined}
        pageMenu={{ label: pageMenuLabel, items: pageMenuItems }}
        views={viewsAtLevelOne
          ? <ViewsPopover name={state.view} views={seed.savedViews.filter((x) => x.object === "company").map((x) => x.name)} onPick={(name) => setState({ view: name })} />
          : undefined}
        rowActions={visible}
        menuActions={menuActions}
        menuLabel={(v) => `Actions for ${v.company.name}`}
        enterOpensRecord
        rowKeys={{
          f: findPeople,
          l: (v) => { setListName(""); setPending({ kind: "list", row: v }) },
          r: (v) => setPending({ kind: "research", row: v }),
          o: openCompany,
        }}
        bulk={[
          { label: "Add to list", onClick: (vs) => { const name = seed.lists.find((l) => l.kind === "companies")?.name ?? "New list"; vs.forEach((v) => addToList(v, name)) } },
          { label: "Find people", onClick: (vs) => { toast(`People · at ${vs.length} companies`); follow("/ollopa/people", origin()) } },
          { label: "Export", onClick: (vs) => toast(`Exported ${vs.length} companies · ${columns.length} visible columns`) },
          ...(canPushCrm ? [{ label: `Push to ${crmName}`, onClick: (vs: CompanyView[]) => setPending({ kind: "bulk-push" as const, rows: vs }) }] : []),
          { label: "Remove", destructive: true, onClick: (vs) => setPending({ kind: "bulk-remove", rows: vs }) },
        ]}
        quickLook={{
          title: (v) => v.company.name,
          fields: (v) => quickLookFields(v, b.currency, d.level),
          editable: (v) => ({
            label: "Stage",
            value: v.company.stage,
            options: [...ACCOUNT_STAGES],
            onChange: (to) => { applyChange(v.company.id, { stage: to as AccountStage }); toast(`${v.company.name} · stage ${to}`) },
          }),
          onOpen: openCompany,
        }}
        phoneSummary={(v) => `${v.contacts.length} contacts · ${v.inSequence.length} in a sequence`}
        empty={{
          title: "No companies yet",
          body: "Find companies in the database, or bring a CSV.",
          action: (
            <Actions
              surface="card"
              items={[
                { kind: "primary", label: "Find companies", onClick: () => setFindOpen(true) },
                { kind: "link", label: "Import a CSV", href: href("/ollopa/import"), onClick: () => follow("/ollopa/import", origin()) },
              ]}
            />
          ),
        }}
      />

      {/* `X-findcos`: the database, flat. The two exclusions sit above the filters and restate the
          count as they are turned on and off, because the number in front of you must be the number
          you would buy. */}
      <Panel id="find-companies" title="Find companies" open={findOpen} onOpenChange={setFindOpen}
        footer={
          <Actions surface="dialog" layout="stack" items={[{
            kind: "primary",
            label: `Save ${Math.min(25, findRows.length)} to the workspace`,
            disabledBecause: findRows.length ? undefined : "Nothing matches these filters",
            onClick: () => { setSaved((s) => [...s, ...findRows.slice(0, 25).map((v) => v.company.id)]); toast(`Saved ${Math.min(25, findRows.length)} companies`) },
          }]} />
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-start gap-2 t-body">
              <Checkbox className="mt-0.5" checked={state.exclusions.owned} onCheckedChange={(x) => setState({ exclusions: { ...state.exclusions, owned: Boolean(x) } })} />
              <span>Exclude companies I already own
                <span className="block t-small text-muted-foreground">{excluded.owned} companies are yours</span>
              </span>
            </label>
            <label className="flex items-start gap-2 t-body">
              <Checkbox className="mt-0.5" checked={state.exclusions.inSequence} onCheckedChange={(x) => setState({ exclusions: { ...state.exclusions, inSequence: Boolean(x) } })} />
              <span>Exclude companies with a contact in a sequence
                <span className="block t-small text-muted-foreground">{excluded.inSequence} companies have someone in a sequence</span>
              </span>
            </label>
            <p className="t-label tabular-nums">
              {findRows.length.toLocaleString()} matching · {findRemoved.toLocaleString()} excluded
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {filterDefs
              .filter((f) => ["co.filter.industry", "co.filter.employees", "co.filter.location", "co.filter.revenue", "co.filter.funding", "co.filter.technology", "co.filter.signals"].includes(f.id))
              .map((f) => (
                <label key={f.id} className="t-small text-muted-foreground">
                  {f.label}
                  <Select value={state.findFilters[f.id] ?? "all"} onValueChange={(x) => setState({ findFilters: { ...state.findFilters, [f.id]: x } })}>
                    <SelectTrigger className="mt-1 h-8" aria-label={f.label}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{f.label}: all</SelectItem>
                      {f.options.filter(Boolean).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </label>
              ))}
          </div>

          <ul>
            {findRows.slice(0, 12).map((v, i) => (
              <li key={v.company.id} className="flex flex-wrap items-center gap-2 p-2">
                {i > 0 && <Separator className="-mt-px w-full" />}
                <div className="min-w-0 flex-1">
                  <div className="truncate t-label">{v.company.name}</div>
                  <div className="t-small text-muted-foreground">{v.company.industry} · {v.company.employees.toLocaleString()} people · {v.company.location.country}</div>
                </div>
                <Actions
                  surface="card"
                  items={[
                    {
                      kind: "secondary",
                      label: saved.includes(v.company.id) ? "Saved" : "Save",
                      disabledBecause: saved.includes(v.company.id) ? "Already in the workspace" : undefined,
                      onClick: () => { setSaved((s) => [...s, v.company.id]); toast(`Saved ${v.company.name}`) },
                    },
                    { kind: "link", label: "Find people", href: href(`/ollopa/people?company=${v.company.id}`), onClick: () => findPeople(v) },
                  ]}
                />
              </li>
            ))}
            {findRows.length === 0 && <li className="p-3 t-body text-muted-foreground">Nothing matches. Turn an exclusion off, or clear a filter.</li>}
          </ul>
        </div>
      </Panel>

      {editing && <EditPanel row={editing} onClose={() => setEditing(null)} onSaved={(text) => { setNotice({ text }); setEditing(null) }} />}

      <Panel id="merge-companies" title="Merge duplicates" open={Boolean(merging)} onOpenChange={(o) => { if (!o) setMerging(null) }}
        footer={<Actions surface="dialog" layout="stack" items={[{
          kind: "primary", label: "Merge the two records",
          onClick: () => { toast(`${merging?.company.name} merged. The other record's contacts came with it.`); setMerging(null) },
          irreversible: {
            title: `Merge into ${merging?.company.name ?? "this company"}?`,
            consequence: `The other record's contacts, deals and lists come across and that record is removed. A merge cannot be undone.`,
            confirmLabel: "Merge the two records",
          },
        }]} />}>
        {merging && (
          <div className="space-y-3 t-body">
            <Select defaultValue={rows.find((v) => v.company.id !== merging.company.id)?.company.id}>
              <SelectTrigger aria-label="The other record"><SelectValue /></SelectTrigger>
              <SelectContent>{rows.slice(0, 20).filter((v) => v.company.id !== merging.company.id).map((v) => <SelectItem key={v.company.id} value={v.company.id}>{v.company.name}</SelectItem>)}</SelectContent>
            </Select>
            <fieldset className="space-y-1">
              <legend className="t-small text-muted-foreground">Which values win</legend>
              {["Name", "Domain", "Industry", "Owner"].map((f) => (
                <label key={f} className="flex items-center gap-2 t-body"><Checkbox defaultChecked /> Keep {merging.company.name}'s {f.toLowerCase()}</label>
              ))}
            </fieldset>
          </div>
        )}
      </Panel>

      <Panel id="flag-company" title="Flag data as wrong" open={Boolean(flagging)} onOpenChange={(o) => { if (!o) setFlagging(null) }}
        footer={<Actions surface="dialog" layout="stack" items={[{
          kind: "primary", label: "Send the flag",
          onClick: () => { toast(`Flagged ${flagging?.company.name}. ${admin?.user ?? "Your admin"} sees it on Requests.`); setFlagging(null) },
        }]} />}>
        {flagging && (
          <div className="space-y-3">
            <label className="block t-small text-muted-foreground">
              Field
              <Select defaultValue="Industry">
                <SelectTrigger className="mt-1" aria-label="Field"><SelectValue /></SelectTrigger>
                <SelectContent>{["Name", "Domain", "Industry", "Employees", "Location", "Revenue"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="block t-small text-muted-foreground">
              What is wrong
              <Textarea className="mt-1" rows={3} placeholder={`What ${flagging.company.name} should say instead`} />
            </label>
          </div>
        )}
      </Panel>
    </>
  )
}

/* -------------------------------------------------------------------------------- small pieces */

function ViewsPopover({ name, views, onPick }: { name: string; views: string[]; onPick: (name: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">Views: {name}</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-2">
        <ul className="space-y-0.5">
          {["All companies", ...views].map((v) => (
            <li key={v} className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="min-w-0 flex-1 justify-start truncate" onClick={() => onPick(v)}>{v}</Button>
              <Button variant="link" size="sm" className="text-muted-foreground" onClick={() => toast(`“${v}” is your default view`)}>Set as default</Button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

function EditPanel({ row, onClose, onSaved }: { row: CompanyView; onClose: () => void; onSaved: (text: string) => void }) {
  const [name, setName] = useState(row.company.name)
  const [domain, setDomain] = useState(row.company.domain)
  const [industry, setIndustry] = useState(row.company.industry)
  const [employees, setEmployees] = useState(String(row.company.employees))
  const [city, setCity] = useState(row.company.location.city)
  return (
    <Panel id="edit-company" title={`Edit ${row.company.name}`} open onOpenChange={(o) => { if (!o) onClose() }}
      footer={
        <span className="flex w-full gap-2">
          <Button className="flex-1" onClick={() => {
            applyChange(row.company.id, { name, domain, industry, employees: Number(employees) || row.company.employees, city })
            toast(`Saved · ${name}`)
            onSaved(`Saved · ${name}`)
          }}>Save</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </span>
      }
    >
      <div className="space-y-3">
        {[
          { id: "name", label: "Name", value: name, set: setName },
          { id: "domain", label: "Domain", value: domain, set: setDomain },
          { id: "industry", label: "Industry", value: industry, set: setIndustry },
          { id: "employees", label: "Employees", value: employees, set: setEmployees },
          { id: "city", label: "City", value: city, set: setCity },
        ].map((f) => (
          <div key={f.id}>
            <Label htmlFor={`edit-${f.id}`} className="t-small">{f.label}</Label>
            <Input id={`edit-${f.id}`} className="mt-1" value={f.value} onChange={(e) => f.set(e.target.value)} />
          </div>
        ))}
        {Object.entries(row.company.custom).map(([k, v]) => (
          <div key={k}>
            <Label htmlFor={`edit-${k}`} className="t-small">{k}</Label>
            <Input id={`edit-${k}`} className="mt-1" defaultValue={v} />
          </div>
        ))}
      </div>
    </Panel>
  )
}
