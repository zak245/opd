// P-people: the contacts table, the SDR's home (spec 02).
//
// One screen — header, views row, filter bar, table — and one door per channel: a chip's picker, the
// filters panel, the views list, the columns door, a row's menu, the selection menu. No tabs, no
// sidebar unless it is pinned, and nothing three levels deep: table to quick look is one level, table
// to record page is one level, and the drawer holds no doors.
//
// What sits in the bar and what sits in the panel is asked of the usage model for this seat at this
// business and never hard-coded, which is what lets the SDR, the AE, the marketer and the admin open
// the same page without a mode switch. The one thing nobody may lose sight of is what a click costs
// and how many people it touches: the price is on the control, and every bulk button repeats its count.
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronsUpDown, ListPlus, MoreHorizontal, Phone, Send, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { href, navigate, useRoute } from "@/app/router"
import { ruleOn, useLesson } from "@/learn/context"
import { QuickLook } from "../../templates/QuickLook"
import { Actions } from "../../ui/Actions"
import { IndexPage, type ToolbarControl } from "../../layouts"
import { openBeside } from "../../beside"
import { follow } from "../../chain"
import { useEdits } from "../../edits"
import { toast } from "../../templates/TablePage"
import { Panel } from "../../ui/Panel"
import { EmptyState } from "../../ui/EmptyState"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { CREDITS, STAGES, seedFor, type ContactStage } from "../../data/seed"
import { SEATS, itemById, weeklyUse } from "../../usage"
import type { Session } from "../../session"
import { columnsFor, STAGE_TONE, type ColumnDef } from "./columns"
import { applyFilters, chipLabel, filtersFor, type Active, type FilterContext, type FilterDef } from "./filters"
import { day, glanceFields, rowsFor, type PersonRow } from "./person"
import type { PersonEdit } from "./edits"
import { needsEnrichment, viewsFor, type PeopleView } from "./views"
import { FilterChip, FiltersPanelBody } from "./parts"
import { EnrichPanel } from "./EnrichPanel"
import { BulkSelection, CreditsDialog, ParodyColumns, ParodySelection, ParodySidebar, ParodyTabs, ParodyViewsDoor } from "./parody"

/* -------------------------------------------------------------------------------- what persists */

const key = (user: string, what: string) => `ollopa.people.${user}.${what}`

/**
 * `remember` is false on a lesson stage: a step must render from the seed and the usage model alone,
 * so what a previous visit to the product left in this browser cannot change what a step shows.
 */
function usePersisted<T>(user: string, what: string, initial: T, remember = true): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (!remember) return initial
    try {
      const raw = localStorage.getItem(key(user, what))
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch { return initial }
  })
  const set = useCallback((v: T) => {
    setValue(v)
    if (!remember) return
    try { localStorage.setItem(key(user, what), JSON.stringify(v)) } catch { /* this visit only */ }
  }, [user, what, remember])
  return [value, set]
}

interface Sort { key: string; dir: "asc" | "desc" }

/* ------------------------------------------------------------------------------------ the page */

export function PeoplePage({ session }: { session: Session }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const d = useDisclosure("people")

  /* ------------------------------------------------------------------------------ which step this is
   *
   * Null in the product, where every rule is on. On a lesson stage `ruleOn` says which rules have
   * landed, and the page draws the layout for that step from the same rows, the same seed and the
   * same usage numbers. There is no second implementation of this page: step 0 is this component
   * with no rule on, and the last step is this component with all eight on, which is the product.
   */
  const lesson = useLesson()
  const rHead = ruleOn(lesson, 1)     // the usage model decides what sits at level one
  const rFlat = ruleOn(lesson, 2)     // one flat panel, no tabs, nothing three deep
  const rContent = ruleOn(lesson, 3)  // headings name content, not an audience; density arrives
  const rDoors = ruleOn(lesson, 4)    // one "Add to list", every door labelled with its count
  const rContext = ruleOn(lesson, 5)  // dependent controls together; the default view on the page
  const rStable = ruleOn(lesson, 6)   // the selection bar comes from selection, an object state
  const rPrice = ruleOn(lesson, 7)    // the price and the count on the control, never in a dialog
  const rExpert = ruleOn(lesson, 8)   // shortcuts, number keys, undo
  const onStage = lesson !== null

  const allRows = useMemo(() => rowsFor(seed), [seed])
  const ctx: FilterContext = useMemo(
    () => ({ seed, user: session.user, crm: b.crm }),
    [seed, session.user, b.crm],
  )
  const defs = useMemo(() => filtersFor(ctx, allRows), [ctx, allRows])
  const views = useMemo(() => viewsFor(seed), [seed])
  const allColumns = useMemo(() => columnsFor(ctx, false), [ctx])

  /** The seat's default columns: the ones the usage model puts at level one, in display order. */
  const defaultColumns = useMemo(
    () => allColumns.filter((c) => d.level(c.id) === 1).map((c) => c.id),
    [allColumns, d],
  )

  /**
   * The highest weekly use any seat at this business has for an item. Before rule 1 the page is not
   * cut to the seat at all — one table, one sidebar, one set of buttons for everybody — so what it
   * shows is what somebody, somewhere in the workspace, uses weekly. The number still comes from the
   * usage model; the common version's mistake is not the numbers, it is not asking for them.
   */
  const anyRoleWeekly = useCallback((id: string) => {
    const item = itemById(id)
    if (!item) return 0
    return Math.max(...SEATS[session.business].map((r) => weeklyUse(item, session.business, r)))
  }, [session.business])

  /** One table for every seat: the union of what each seat reads weekly, in display order. */
  const unionColumns = useMemo(
    () => allColumns.filter((c) => anyRoleWeekly(c.id) >= 20).map((c) => c.id),
    [allColumns, anyRoleWeekly],
  )

  /**
   * The glossary's split: 20 "Most Popular Filters" and the rest. Popularity here is a ranking of
   * the whole workspace, which is why it is the wrong ranking for any one person in it.
   */
  const popularFilters = useMemo(
    () => [...defs].sort((x, y) => anyRoleWeekly(y.id) - anyRoleWeekly(x.id)).slice(0, 20),
    [defs, anyRoleWeekly],
  )
  const restFilters = useMemo(() => defs.filter((f) => !popularFilters.includes(f)), [defs, popularFilters])

  const defaultView = views.find((v) => v.defaultFor.includes(session.role)) ?? null

  /**
   * A chain that left a company for "everybody at it" arrives with the company in the route. The
   * filter it carried is set here, as an ordinary filter chip a person can see and drop — never a
   * hidden narrowing, and never a mode.
   */
  const route = useRoute()
  const arrivedWith = route.query.get("company")

  /* ------------------------------------------------------------------------------------- state */

  const [typed, setTyped] = useState("")
  const [q, setQ] = useState("")
  /**
   * A lesson opens with one filter from the body switched on as well as the seat's default view:
   * "has a phone number on file", which an SDR sets on a calling day and then forgets about. Until
   * rule 5 it is doing its work from inside the panel and the page says nothing about it, which is
   * what a hidden cause looks like — and what somebody means by "the count changed and I do not know
   * why". In the product it is an ordinary filter a person either set or did not.
   */
  const [active, setActive] = useState<Active>(
    onStage ? { "people.f.phone": ["A phone number on file"] }
      : arrivedWith ? { "people.f.company": [arrivedWith] }
      : defaultView?.filters ?? {},
  )
  const keep = !onStage
  const [viewId, setViewId] = usePersisted<string | null>(session.user, "view", onStage ? null : defaultView?.id ?? null, keep)
  const [sort, setSort] = usePersisted<Sort | null>(session.user, "sort", onStage ? { key: "score", dir: "desc" } : defaultView?.sort ?? null, keep)
  const [columns, setColumns] = usePersisted<string[]>(session.user, "columns", [], keep)
  const [density, setDensity] = usePersisted<"Comfortable" | "Compact">(session.user, "density", "Comfortable", keep)
  const [pageSize, setPageSize] = usePersisted<number>(session.user, "pageSize", 25, keep)
  const [pinned, setPinned] = usePersisted<boolean>(session.user, "pinned", false, keep)
  /* A lesson arrives with the place a change happens in already open, so the change can be seen. The
     panel is the lesson at the two steps where the filters move into it and the labels have not been
     fixed yet; from rule 4 on, a closed panel with an honest label on its door is the point, which is
     also how the product opens. */
  const [panelOpen, setPanelOpen] = useState(onStage && !rDoors)
  /* The common version's own state: the sidebar behind "Show Filters", the second button inside it,
     the tab strip above the results, and the dialog that holds the price. */
  const [showFilters, setShowFilters] = useState(onStage)
  const [moreFilters, setMoreFilters] = useState(false)
  const [tab, setTab] = useState("total")
  const [creditsDialog, setCreditsDialog] = useState(false)
  const [includeDnc, setIncludeDnc] = useState(false)
  const [shown, setShown] = useState(25)
  const [selected, setSelected] = useState<string[]>([])
  const [allMatching, setAllMatching] = useState(false)
  const [perCompany, setPerCompany] = useState<number | null>(null)
  const [glancing, setGlancing] = useState<PersonRow | null>(null)
  const [enrichFor, setEnrichFor] = useState<PersonRow[] | null>(null)
  const [lastChip, setLastChip] = useState<string | null>(null)
  const [undo, setUndo] = useState<{ text: string; run: () => void } | null>(null)
  const [phoneFilters, setPhoneFilters] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [focused, setFocused] = useState(0)
  const [lastClicked, setLastClicked] = useState<number | null>(null)
  const [localStage, setLocalStage] = useState<Record<string, ContactStage>>({})
  const [revealed, setRevealed] = useState<string[]>([])
  const [localSeq, setLocalSeq] = useState<Record<string, string>>({})
  /** A key that spends money asks once, in place, with the price in the question. */
  const [pending, setPending] = useState<{ text: string; run: () => void } | null>(null)
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([])
  const searchRef = useRef<HTMLInputElement>(null)
  // What a pane's actions did to somebody in this session, from the one store every page reads, so
  // a row acted on from a pane beside any page reads the same here as it did there.
  const edits = useEdits("person") as Record<string, PersonEdit>

  /**
   * Leaving this table for a record: the row is the anchor, so the crumb back lands on it, lit and
   * focused, with the search, the filters, the scroll and the selection exactly as they were.
   */
  const leaveFor = (to: string, anchor: string) =>
    follow(to, { route: route.raw, title: "People", anchor })

  const view = views.find((v) => v.id === viewId) ?? null
  /** The saved views that sit in the row itself, as a set of toggles; the rest live behind the door. */
  const chipViews = views
    .filter((v) => v.defaultFor.includes(session.role) || v.owner === session.user || (v.shipped && d.level("people.views.needs-enrichment") === 1))
    .slice(0, 4)
  const seatColumns = [...defaultColumns, ...(view?.extraColumns ?? []).filter((c) => !defaultColumns.includes(c))]
  /**
   * A lesson adds Phone at the end, as a person would from the columns door. The SDR's seat does not
   * get it by default — she reveals a number about once a week — but the price on that button is the
   * thing this screen is most about, and a rule the viewer cannot see land has not been taught.
   */
  const withPhone = (ids: string[]) => {
    if (!onStage || ids.includes("people.col.phone")) return ids
    const at = ids.indexOf("people.col.email")
    const out = [...ids]
    out.splice(at < 0 ? out.length : at + 1, 0, "people.col.phone")
    return out
  }
  const shownColumnIds = columns.length > 0 ? columns : withPhone(rHead ? seatColumns : unionColumns)
  const shownColumns = shownColumnIds
    .map((id) => allColumns.find((c) => c.id === id))
    .filter((c): c is ColumnDef => Boolean(c))

  // The lesson view opens the place a change happens in, by id, so the change can be seen. The panel
  // and the common version's sidebar are not `Door`s, so they answer the same event themselves.
  useEffect(() => {
    const onDoor = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string; open: boolean }>).detail
      if (!detail) return
      if (detail.id === "people.filters.panel") setPanelOpen(detail.open)
      if (detail.id === "people.parody.sidebar") setShowFilters(detail.open)
      if (detail.id === "people.parody.more") { setShowFilters(detail.open); setMoreFilters(detail.open) }
    }
    document.addEventListener("ollopa:door", onDoor)
    return () => document.removeEventListener("ollopa:door", onDoor)
  }, [])

  // Results and count update as you type, debounced 150 ms; the old count stays, dimmed, until then.
  useEffect(() => {
    const t = window.setTimeout(() => setQ(typed), 150)
    return () => window.clearTimeout(t)
  }, [typed])
  const settling = typed !== q

  /* ------------------------------------------------------------------------------ what is shown */

  const filtered = useMemo(() => {
    let out = applyFilters(allRows, active, q, ctx, { includeDoNotContact: includeDnc })
    if (view?.shipped) out = out.filter(needsEnrichment)
    return out
  }, [allRows, active, q, ctx, includeDnc, view])

  const sorted = useMemo(() => {
    if (!sort) return filtered
    const col = allColumns.find((c) => c.key === sort.key)
    if (!col) return filtered
    const dir = sort.dir === "asc" ? 1 : -1
    return [...filtered].sort((x, y) => {
      const a = col.sort(x), c = col.sort(y)
      if (a === c) return x.name.localeCompare(y.name)
      return (a > c ? 1 : -1) * dir
    })
  }, [filtered, sort, allColumns])

  const page = sorted.slice(0, shown)

  // A lesson opens with three rows ticked, because the bar that acts on a selection is half of what
  // this screen teaches and it is not on screen until something is selected. It is the page's own
  // state, set once: the last step is the product with three rows ticked.
  const seeded = useRef(false)
  useEffect(() => {
    if (!onStage || seeded.current || page.length === 0) return
    seeded.current = true
    setSelected(page.slice(0, 3).map((p) => p.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onStage, page.length])

  const stageOf = (p: PersonRow) => localStage[p.id] ?? p.stage
  const seqOf = (p: PersonRow) => localSeq[p.id] ?? edits[p.id]?.sequence ?? p.inSequence
  const isRevealed = (p: PersonRow) => p.phoneRevealed || revealed.includes(p.id) || edits[p.id]?.phoneRevealed === true

  /**
   * A chain that arrives with a company sets that filter here, and it has to work on a People page
   * that is already mounted behind the trail as well as on a fresh one: the route is the same page,
   * so nothing remounts. It is set once per company arrived with, and it is an ordinary chip the
   * person can see in the bar and drop — never a hidden narrowing.
   */
  useEffect(() => {
    if (!arrivedWith || onStage) return
    setActive((a) => (a["people.f.company"]?.[0] === arrivedWith ? a : { "people.f.company": [arrivedWith] }))
  }, [arrivedWith, onStage])

  /** A value's count is what clicking it now would give, with every other active filter applied. */
  const counts = useMemo(() => {
    const cache = new Map<string, number>()
    return (f: FilterDef, value: string) => {
      const k = `${f.id}::${value}`
      const hit = cache.get(k)
      if (hit !== undefined) return hit
      const base = applyFilters(allRows, active, q, ctx, { except: f.id, includeDoNotContact: includeDnc })
      const n = base.filter((p) => f.match(p, [value], ctx)).length
      cache.set(k, n)
      return n
    }
  }, [allRows, active, q, ctx, includeDnc])

  const valuesOf = useCallback((f: FilterDef) => f.values(ctx, allRows), [ctx, allRows])

  /* --------------------------------------------------------------------------- filters and view */

  const activeCount = Object.values(active).filter((v) => v.length > 0).length
  // Before rule 1 nothing is asked of the usage model, so no filter is in the bar: every one of them
  // is in the sidebar, at the same depth, whether this seat opens it every morning or never.
  const chipFilters = rHead ? defs.filter((f) => d.level(f.id) === 1) : []
  // Before rule 5 a filter that is doing something from inside the panel says nothing on the page.
  const activeElsewhere = rContext
    ? defs.filter((f) => d.level(f.id) === 2 && (active[f.id]?.length ?? 0) > 0)
    : []
  const edited = Boolean(view) && JSON.stringify(active) !== JSON.stringify(view!.filters)

  const setFilter = (id: string, chosen: string[]) => {
    setActive((a) => ({ ...a, [id]: chosen }))
    setLastChip(chosen.length ? id : null)
    if (selected.length) { clearSelection(`Selection cleared by a filter change.`, selected) }
  }

  const clearAll = () => {
    const before = { ...active }, beforeQ = typed
    setActive({}); setTyped(""); setQ(""); setLastChip(null)
    offerUndo("Filters and search cleared.", () => { setActive(before); setTyped(beforeQ); setQ(beforeQ) })
  }

  const openView = (v: PeopleView) => {
    setViewId(v.id)
    setActive(v.filters)
    setSort(v.sort ?? null)
    setColumns([])
    setShown(pageSize)
    toast(`${v.name} · ${v.sharedWith === "everyone" ? "shared with everyone" : "yours"}`)
  }

  /* -------------------------------------------------------------------------- undo, for 10 seconds */

  const undoTimer = useRef<number | undefined>(undefined)
  const offerUndo = (text: string, run: () => void) => {
    toast(text)
    // Undo is an accelerator: it arrives with rule 8, and before it the action is simply done.
    if (!rExpert) return
    setUndo({ text, run })
    window.clearTimeout(undoTimer.current)
    undoTimer.current = window.setTimeout(() => setUndo(null), 10_000)
  }

  const clearSelection = (why: string, ids: string[]) => {
    setSelected([]); setAllMatching(false)
    offerUndo(why, () => setSelected(ids))
  }

  /* ------------------------------------------------------------------------------ the selection */

  const selectedRows = allMatching ? capPerCompany(sorted, perCompany) : allRows.filter((p) => selected.includes(p.id))
  const count = selectedRows.length

  const toggleRow = (p: PersonRow, index: number, shift: boolean) => {
    if (shift && lastClicked !== null) {
      const [from, to] = index < lastClicked ? [index, lastClicked] : [lastClicked, index]
      const ids = page.slice(from, to + 1).map((r) => r.id)
      setSelected((s) => Array.from(new Set([...s, ...ids])))
    } else {
      setSelected((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))
    }
    setLastClicked(index)
    setAllMatching(false)
  }

  /* ------------------------------------------------------------------------- spending and limits */

  const seat = b.roles.find((r) => r.user === session.user)
  const admin = b.roles.find((r) => r.role === "admin")
  const spentByMe = seed.credits.byUser.find((u) => u.user === session.user)?.used ?? 0
  const myLimit = seat?.creditLimit ?? seed.credits.perUserLimit ?? null
  const balance = seed.credits.balance

  /** The words on a paid control, in the same shape every time, and what happens when they bind. */
  const priceState = (cost: number) => {
    if (cost > balance) return { suffix: rPrice ? " · no credits left" : "", why: `The workspace has ${balance.toLocaleString()} credits left. ${admin ? `${admin.user} (${admin.title})` : "Your admin"} can add more.` }
    if (myLimit !== null && spentByMe + cost > myLimit) return { suffix: rPrice ? " · over your limit" : "", why: `Your limit is ${myLimit.toLocaleString()} credits a month; ${spentByMe.toLocaleString()} used. ${admin ? `${admin.user} (${admin.title})` : "Your admin"} can raise it.` }
    return { suffix: "", why: null as string | null }
  }

  const spend = (cost: number, done: string) => {
    const state = priceState(cost)
    if (state.why) { toast(state.why); return }
    // Rule 7 puts the balance in the message: what it cost, and what is left, every time.
    toast(rPrice ? `${done} · ${cost} credits · ${(balance - cost).toLocaleString()} left` : done)
  }

  /** What a control that spends says after its name. Before rule 7 it says nothing. */
  const price = (cost: number) => (rPrice ? ` · ${cost.toLocaleString()} credits${priceState(cost).suffix}` : "")

  /* --------------------------------------------------------------------------------- row actions */

  interface RowAct { id: string; label: (p: PersonRow) => string; shortcut?: string; run: (p: PersonRow) => void; destructive?: boolean; icon?: typeof Send }

  const moveStage = (p: PersonRow, to: ContactStage) => {
    const from = stageOf(p)
    setLocalStage((s) => ({ ...s, [p.id]: to }))
    const leaves = (to === "Not interested" || to === "Unresponsive") && Boolean(seqOf(p))
    if (leaves) setLocalSeq((s) => ({ ...s, [p.id]: "" }))
    offerUndo(
      `${p.name} · ${from} → ${to}${leaves ? ` · left ${seqOf(p)}` : ""}`,
      () => { setLocalStage((s) => ({ ...s, [p.id]: from })); setLocalSeq((s) => { const n = { ...s }; delete n[p.id]; return n }) },
    )
  }

  const rowActs: RowAct[] = [
    { id: "people.row.sequence", icon: Send, shortcut: "s", label: (p) => (seqOf(p) ? "Move sequence" : "Sequence"), run: (p) => (seqOf(p) ? toast(`${p.name} is already in ${seqOf(p)}. Choose a sequence to move them to.`) : (setLocalSeq((s) => ({ ...s, [p.id]: seed.sequences[0]?.name ?? "Outbound" })), offerUndo(`${p.name} added to ${seed.sequences[0]?.name ?? "a sequence"}.`, () => setLocalSeq((s) => { const n = { ...s }; delete n[p.id]; return n })))) },
    { id: "people.row.list", icon: ListPlus, shortcut: "l", label: () => (rDoors ? "List" : "Add to list"), run: (p) => offerUndo(`${p.name} added to ${seed.lists.find((l) => l.kind === "people")?.name ?? "a list"}.`, () => toast(`${p.name} taken off the list again.`)) },
    { id: "people.row.call", icon: Phone, shortcut: "c", label: () => "Call task", run: (p) => toast(`Call task due today for ${p.name}. It is in Tasks.`) },
    { id: "people.row.enrich", icon: Sparkles, shortcut: "e", label: () => `Enrich${price(CREDITS.enrich)}`, run: (p) => spend(CREDITS.enrich, `${p.name} enriched`) },
    { id: "people.row.research-agent", shortcut: "r", label: () => `Research${price(CREDITS.research)}`, run: (p) => spend(CREDITS.research, `Research queued for ${p.name}`) },
    { id: "people.row.email", label: () => "One-off email", run: (p) => toast(`Writing to ${p.email}.`) },
    // The company is a look, not a place to go: it opens beside the table with the table untouched.
    { id: "people.row.view-company", label: () => "Open the company beside", run: (p) => openBeside({ kind: "company", id: p.companyId, opener: document.activeElement as HTMLElement | null }) },
    { id: "people.row.copy-email", label: () => "Copy email", run: (p) => { navigator.clipboard?.writeText(p.email); toast(`${p.email} copied.`) } },
    // Both of these are done on the record, so they are a move with a way back, not a jump.
    { id: "people.row.edit", label: () => "Edit fields", run: (p) => leaveFor(`/ollopa/people/${p.id}`, p.id) },
    { id: "people.row.note", label: () => "Add a note", run: (p) => leaveFor(`/ollopa/people/${p.id}`, p.id) },
    { id: "people.row.add-to-deal", label: () => "Add to a deal", run: (p) => toast(`Choose a deal at ${p.company}.`) },
    { id: "people.row.assign-owner", label: () => "Assign owner", run: (p) => toast(`Owner of ${p.name} changed.`) },
    { id: "people.row.push-crm", label: () => `Push to ${b.crm ?? "CRM"} now`, run: (p) => toast(`${p.name} pushed to ${b.crm}.`) },
    { id: "people.row.merge", label: () => "Merge duplicate", run: (p) => toast(`Merging ${p.name}: choose the record to merge with.`) },
    { id: "people.row.dnc", label: () => "Mark do not contact", run: (p) => offerUndo(`${p.name} marked do not contact. Removed from all sequences and outreach blocked.`, () => toast(`${p.name} is contactable again.`)) },
    { id: "people.row.remove", destructive: true, label: () => "Remove from workspace", run: (p) => offerUndo(`${p.name} removed from the workspace.`, () => toast(`${p.name} is back.`)) },
  ]

  const usable = rowActs.filter((a) => d.weekly(a.id) > 0 || a.id === "people.row.dnc" || a.id === "people.row.remove")
  const rowButtons = (rHead
    ? usable.filter((a) => d.level(a.id) === 1 && !a.destructive).sort((x, y) => d.weekly(y.id) - d.weekly(x.id))
    : rowActs.filter((a) => anyRoleWeekly(a.id) >= 20 && !a.destructive).sort((x, y) => anyRoleWeekly(y.id) - anyRoleWeekly(x.id))
  ).slice(0, 5)

  /**
   * The second add-to-list control: "Add to list" for people sits beside "Add to lists" for
   * companies ("Create and Use a List", 28 Aug 2026), one letter apart and one icon apart, and the
   * second one adds everybody at the company. Rule 4 leaves one door, labelled by what is behind it.
   */
  const companyListAct: RowAct = {
    id: "people.row.list-companies",
    icon: ListPlus,
    label: () => "Add to lists",
    run: (p) => offerUndo(
      `Everyone at ${p.company} added to ${seed.lists.find((l) => l.kind === "companies")?.name ?? "a list"}.`,
      () => toast("Taken off the list again."),
    ),
  }

  /* -------------------------------------------------------------------------------- bulk actions */

  interface BulkAct {
    id: string
    /** What the common version writes on the button: the action, and nothing about who it will touch. */
    plain: string
    /** What the button says once it restates its count (rule 4) and prints its price (rule 7). */
    label: (n: number, price: boolean) => string
    run: () => void
    destructive?: boolean
  }

  const bulkActs: BulkAct[] = [
    { id: "people.bulk.sequence", plain: "Sequence", label: (n) => `Add ${n} to sequence`, run: () => offerUndo(`${count} added to ${seed.sequences[0]?.name ?? "a sequence"} · 3 skipped, already in a sequence.`, () => toast("Taken back out of the sequence.")) },
    { id: "people.bulk.list", plain: "List", label: (n) => `Add ${n} to list`, run: () => offerUndo(`${count} added to ${seed.lists.find((l) => l.kind === "people")?.name ?? "a list"}.`, () => toast("Taken off the list.")) },
    { id: "people.bulk.enrich", plain: "Enrich", label: (n, price) => `Enrich ${n}${price ? ` · ${(n * CREDITS.enrich).toLocaleString()} credits` : ""}`, run: () => (rPrice ? setEnrichFor(selectedRows) : setCreditsDialog(true)) },
    { id: "people.bulk.export", plain: "Export", label: (n, price) => `Export ${n}${price ? " · no credits" : ""}`, run: () => toast(`${count} people exported as CSV${rPrice ? " · no credits" : ""}.`) },
    { id: "people.bulk.stage", plain: "Change stage", label: (n) => `Change stage of ${n}`, run: () => toast(`Choose the stage for ${count} people.`) },
    { id: "people.bulk.research-agent", plain: "Research with AI", label: (n, price) => `Research ${n}${price ? ` · ${(n * CREDITS.research).toLocaleString()} credits` : ""}`, run: () => spend(count * CREDITS.research, `Research queued for ${count} people`) },
    { id: "people.bulk.email", plain: "Email", label: (n) => `Email ${n}`, run: () => toast(`Writing to ${count} people.`) },
    { id: "people.bulk.assign-owner", plain: "Assign owner", label: (n) => `Assign owner of ${n}`, run: () => toast(`Owner changed for ${count} people.`) },
    { id: "people.bulk.push-crm", plain: `Push to ${b.crm ?? "CRM"}`, label: (n) => `Push ${n} to ${b.crm ?? "CRM"}`, run: () => toast(`${count} pushed to ${b.crm}.`) },
    { id: "people.bulk.merge", plain: "Merge duplicates", label: () => (count === 2 ? "Merge the two selected" : "Merge duplicates — select two"), run: () => (count === 2 ? toast("Side by side: choose which value wins.") : toast("Select exactly two people to merge.")) },
    { id: "people.bulk.remove", destructive: true, plain: "Remove", label: (n) => `Remove ${n} from the workspace`, run: () => offerUndo(`${count} removed from the workspace.`, () => toast("They are back.")) },
  ]

  /**
   * The eleven the common version puts in a row: Save, Email, Sequence, Workflows, List, Export,
   * Research with AI, Push to CRM, View companies, Assign owner, Assign account ("Search for
   * People", 5 Sep 2026). Four of them — Save, Workflows, View companies, Assign account — are
   * Apollo's and not this product's, so they are here and nowhere else.
   */
  const parodyOnlyBulk: BulkAct[] = [
    { id: "people.bulk.save", plain: "Save", label: () => "Save", run: () => setCreditsDialog(true) },
    { id: "people.bulk.workflows", plain: "Workflows", label: () => "Workflows", run: () => toast("Choose a workflow to run on the selection.") },
    // The common version's jump, kept bare on purpose: it throws the selection and the filters away
    // and leaves nothing to come back to. That is the thing being shown, so it stays a `navigate`.
    { id: "people.bulk.view-companies", plain: "View companies", label: () => "View companies", run: () => navigate("/ollopa/companies") },
    { id: "people.bulk.assign-account", plain: "Assign account", label: () => "Assign account", run: () => toast("Choose the account these people belong to.") },
  ]
  const byId = (id: string) => [...bulkActs, ...parodyOnlyBulk].find((a) => a.id === id)!
  const parodyBulk: BulkAct[] = [
    "people.bulk.save", "people.bulk.email", "people.bulk.sequence", "people.bulk.workflows",
    "people.bulk.list", "people.bulk.export", "people.bulk.research-agent", "people.bulk.push-crm",
    "people.bulk.view-companies", "people.bulk.assign-owner", "people.bulk.assign-account",
  ].map(byId)

  const usableBulk = bulkActs.filter((a) => d.weekly(a.id) > 0 || a.id === "people.bulk.remove")
  const bulkButtons = rHead
    ? usableBulk.filter((a) => d.level(a.id) === 1 && !a.destructive).sort((x, y) => d.weekly(y.id) - d.weekly(x.id))
    : parodyBulk
  /** What a bulk button says at this step: the bare action, then the count, then the price. */
  const bulkLabel = (a: BulkAct) => (rDoors ? a.label(count, rPrice) : a.plain)

  /* ------------------------------------------------------------------------------- the keyboard */

  const focusRow = (i: number) => {
    const at = Math.max(0, Math.min(i, page.length - 1))
    setFocused(at)
    rowRefs.current[at]?.focus()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Accelerators are rule 8: before it lands, the page is reachable but has no fast path.
      if (!rExpert) return
      const t = e.target as HTMLElement | null
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo?.run(); setUndo(null); return }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a" && !typing) {
        e.preventDefault(); setSelected(page.map((p) => p.id)); setAllMatching(false); return
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); return }
      if (e.key.toLowerCase() === "f") { e.preventDefault(); e.shiftKey ? setPinned(!pinned) : setPanelOpen(!panelOpen); return }
      if (e.key >= "1" && e.key <= "9") {
        const v = views[Number(e.key) - 1]
        if (v) { e.preventDefault(); openView(v) }
        return
      }
      if (e.key === "Escape") {
        if (selected.length) { e.preventDefault(); setSelected([]); setAllMatching(false) }
        return
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const onRowKey = (e: React.KeyboardEvent<HTMLTableRowElement>, p: PersonRow, i: number) => {
    if (e.target !== e.currentTarget) return
    const k = e.key
    // Arrow keys walk the table at every step; the letter keys are the rule 8 accelerators.
    if (!rExpert && k !== "ArrowDown" && k !== "ArrowUp" && k !== "Enter" && k !== " ") return
    if (pending) {
      if (k === "Enter") { e.preventDefault(); pending.run(); setPending(null); return }
      if (k === "Escape") { e.preventDefault(); setPending(null); return }
    }
    if (k === "ArrowDown" || k === "j") { e.preventDefault(); focusRow(i + 1); return }
    if (k === "ArrowUp" || k === "k") { e.preventDefault(); focusRow(i - 1); return }
    if (k === "Enter" || k === " ") { e.preventDefault(); setGlancing(p); return }
    if (k === "o") { e.preventDefault(); leaveFor(`/ollopa/people/${p.id}`, p.id); return }
    if (k === "x") { e.preventDefault(); toggleRow(p, i, e.shiftKey); return }
    if (k === "t") {
      e.preventDefault()
      ;(rowRefs.current[i]?.querySelector("[aria-label='Stage']") as HTMLElement | null)?.click()
      return
    }
    // The three keys that spend: the price appears in the question, not after the click.
    if (k === "p" && p.phone && !isRevealed(p)) {
      e.preventDefault()
      setPending({ text: `Reveal ${p.name}'s phone. Enter to spend ${CREDITS.revealPhone} credits, Esc to cancel.`, run: () => reveal(p) })
      return
    }
    if (k === "e" || k === "r") {
      const cost = k === "e" ? CREDITS.enrich : CREDITS.research
      const what = k === "e" ? "Enrich" : "Research"
      e.preventDefault()
      setPending({
        text: `${what} ${p.name}. Enter to spend ${cost} credits, Esc to cancel.`,
        run: () => spend(cost, k === "e" ? `${p.name} enriched` : `Research queued for ${p.name}`),
      })
      return
    }
    const act = rowActs.find((a) => a.shortcut === k)
    if (act && d.weekly(act.id) > 0) { e.preventDefault(); act.run(p) }
  }

  const reveal = (p: PersonRow) => {
    const state = priceState(CREDITS.revealPhone)
    if (state.why) { toast(state.why); return }
    setRevealed((r) => [...r, p.id])
    toast(`Phone revealed · ${CREDITS.revealPhone} credits · ${(balance - CREDITS.revealPhone).toLocaleString()} left`)
  }

  /* --------------------------------------------------------------------------------- the header */

  // The header counts the rows this workspace actually holds, so the total and every filter count
  // agree with each other (spec 02 §2). A number nobody can reproduce is the complaint reviewers make.
  const total = allRows.length
  const scoreModel = seed.scoreModels.find((m) => m.primary) ?? seed.scoreModels[0]

  /** The one act this page exists for, for the empty state; the header takes the same act as props. */
  const addPeople = (
    <Actions surface="page" items={[{
      kind: "primary",
      label: "Add people",
      onClick: () => toast("Find people searches the database beside this table. It is a later case."),
    }]} />
  )

  /**
   * What says how many people the buttons beside it will touch. Rule 5 replaces the four scattered
   * Bulk Selection controls with the count, the one control that changes it, and — once it is on —
   * the per-company limit beside it, restating the result in words.
   */
  const selectionControls = rContext ? (
    <>
      {count > 0 && <span className="text-sm font-medium tabular-nums">{count.toLocaleString()} selected</span>}
      {!allMatching && sorted.length > selected.length && (
        <Button size="sm" variant="outline" data-item="people.bulk.select" data-item-label="Select all matching" className="h-7 px-2 text-xs" onClick={() => setAllMatching(true)}>
          Select all {sorted.length.toLocaleString()} matching
        </Button>
      )}
      {allMatching && (
        /* One changes the meaning of the other, so they sit together and restate the result. */
        <span className="flex items-center gap-1.5 text-xs" data-item="people.bulk.limit-per-company" data-item-label="Limit per company">
          <label htmlFor="per-company" className="text-muted-foreground">Limit per company</label>
          <Select value={perCompany === null ? "all" : String(perCompany)} onValueChange={(v) => setPerCompany(v === "all" ? null : Number(v))}>
            <SelectTrigger id="per-company" className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">No limit</SelectItem>
              {[1, 2, 3, 5].map((n) => <SelectItem key={n} value={String(n)}>{n} per company</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">
            Select {count.toLocaleString()} people{perCompany ? `, up to ${perCompany} per company` : ""}
          </span>
        </span>
      )}
    </>
  ) : (
    <ParodySelection
      perCompany={perCompany}
      onNumber={(n) => { setSelected(page.slice(0, n).map((p) => p.id)); setAllMatching(false) }}
      onPerCompany={setPerCompany}
      onSelectPage={() => { setSelected(page.map((p) => p.id)); setAllMatching(false) }}
      onSelectAll={() => setAllMatching(true)}
    />
  )

  /** The bulk buttons themselves, wherever this step puts them. */
  const bulkStrip = (
    <>
      {bulkButtons.map((a) => (
        <Button key={a.id} size="sm" className="h-7 px-2 text-xs" data-item={a.id} data-item-label={a.plain} onClick={a.run}>
          {bulkLabel(a)}
        </Button>
      ))}
      {rHead && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" data-item="people.bulk.more" data-item-label={rDoors ? "Edit or export selected" : "More actions"}>
              {rDoors ? "Edit or export selected" : "More"} <ChevronDown aria-hidden="true" className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" data-container="people.bulk.menu" data-container-label={rDoors ? "Edit or export selected" : "the more menu"}>
            {usableBulk.filter((a) => !a.destructive).map((a) => (
              <DropdownMenuItem key={a.id} data-item={a.id} data-item-label={a.plain} onSelect={a.run}>{bulkLabel(a)}</DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {usableBulk.filter((a) => a.destructive).map((a) => (
              <DropdownMenuItem key={a.id} data-item={a.id} data-item-label={a.plain} className="text-destructive" onSelect={a.run}>{bulkLabel(a)}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {count > 0 && (
        <Button size="sm" variant="ghost" data-item="people.bulk.clear" data-item-label="Clear selection" className="h-7 px-2 text-xs" onClick={() => { setSelected([]); setAllMatching(false) }}>
          Clear selection
        </Button>
      )}
    </>
  )

  const filtersBody = (
    <FiltersPanelBody
      filters={defs}
      active={active}
      values={valuesOf}
      count={counts}
      onChange={setFilter}
      onClear={clearAll}
      dnc={allRows.filter((p) => p.doNotContact).length}
      includeDnc={includeDnc}
      onIncludeDnc={setIncludeDnc}
      showDnc={rPrice}
      headings={rContent ? undefined : [
        { label: `Most Popular Filters (${popularFilters.length})`, filters: popularFilters },
        { label: `More Filters (${restFilters.length}) · advanced`, filters: restFilters },
      ]}
    />
  )

  const sortHeader = (c: ColumnDef) => {
    const on = sort?.key === c.key
    return (
      <button
        type="button"
        // A header never clips to "Co": it is as wide as its own word, and the table scrolls
        // sideways instead, which is what the library's own table container is for.
        className="flex items-center gap-1 whitespace-nowrap rounded px-1 py-0.5 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onClick={() => setSort(!on ? { key: c.key, dir: "asc" } : sort!.dir === "asc" ? { key: c.key, dir: "desc" } : null)}
      >
        <span>{c.header}</span>
        <ChevronsUpDown
          aria-hidden="true"
          className={cn("size-3 shrink-0", on ? "text-foreground" : "text-muted-foreground/50", on && sort!.dir === "desc" && "rotate-180")}
        />
      </button>
    )
  }

  if (allRows.length === 0) {
    // The empty page is the same page: the template sets the width and the padding, not this file.
    return (
      <IndexPage
        family="people"
        title="People"
        count={0}
        table={
          <EmptyState
            title="No people yet."
            body="Find them in the database, or bring a CSV you already have."
            action={addPeople}
          />
        }
      />
    )
  }

  /**
   * What the table's container carries in its header: the views, the search, the filter chips, the
   * result count and the columns control (DESIGN.md §5 — a table's toolbar and its count belong to
   * the container, not to the canvas above it).
   */
  /**
   * The toolbar's controls, in the card's header: the views, the search, the filter chips this seat
   * reads weekly, the one door that holds the rest, and the count with the columns control at the
   * trailing edge. The template decides how many sit in front and labels its own door; a filter
   * that is on is marked `always`, because a cause the person cannot see is the thing rule 5 bans.
   */
  const controls: ToolbarControl[] = [
    {
      name: "Views",
      node: (
        <span className="flex flex-wrap items-center gap-2" data-container="people.views.row" data-container-label="the views row">
          {rHead && d.level("people.views.saved") === 1 && chipViews.length > 0 && (
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={2}
            className="flex-wrap"
            value={viewId ?? ""}
            onValueChange={(id) => { const v = chipViews.find((x) => x.id === id); if (v) openView(v) }}
          >
            {chipViews.map((v) => (
              <ToggleGroupItem key={v.id} value={v.id} data-item={`people.view.${v.id}`} data-item-label={v.name}>
                {v.name}
                {v.shipped && <span className="tabular-nums">{allRows.filter(needsEnrichment).length.toLocaleString()}</span>}
                {viewId === v.id && edited && <span>· edited</span>}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          )}
          {rDoors ? (
        <ViewsDoor
          views={views}
          viewId={viewId}
          user={session.user}
          onOpen={openView}
          onSave={(name) => { toast(`View saved · ${name}`); setViewId(null) }}
          onAction={(what, v) => toast(`${v.name} · ${what}`)}
          onPage={rContext}
          shortcuts={rExpert}
        />
      ) : (
        <ParodyViewsDoor
          views={views}
          viewId={viewId}
          user={session.user}
          onOpen={openView}
          onDefault={rContext ? (v) => toast(`${v.name} is your default view.`) : null}
          named={!rHead}
        />
      )}
        </span>
      ),
    },
    ...(edited && view ? [{
      name: "Unsaved view",
      always: true,
      node: (
        <span className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={() => toast(`${view.name} saved with the filters you are looking at.`)}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setActive(view.filters)}>Revert</Button>
        </span>
      ),
    }] : []),
    {
      name: "Search",
      // The one control a phone keeps in front; everything else is in the door beside it.
      pin: true,
      always: true,
      node: (
        <Input
          ref={searchRef}
          data-item="people.search"
          data-item-label="Search"
          aria-label="Search people by name, title, company or email"
          placeholder={rExpert ? "Search  /" : "Search"}
          className="h-8 w-56"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
        />
      ),
    },
    ...[...chipFilters, ...activeElsewhere].map((f) => ({
      name: f.label,
      // A filter that is on is never behind a door: a hidden cause is not allowed.
      always: (active[f.id]?.length ?? 0) > 0,
      node: (
        <span data-container="people.chips" data-container-label="the filter bar">
          <FilterChip
            filter={f}
            values={valuesOf(f)}
            chosen={active[f.id] ?? []}
            count={(v) => counts(f, v)}
            onChange={(c) => setFilter(f.id, c)}
            note={f.id === "people.f.score" && scoreModel ? (
              <span className="text-xs text-muted-foreground">
                Threshold {scoreModel.threshold}, published {day(scoreModel.published)} by {scoreModel.publishedBy}
              </span>
            ) : undefined}
          />
        </span>
      ),
    })),
    {
      name: "every filter",
      node: (
        <span className="flex items-center gap-1">
          {/* Every filter, flat, for reference while the table stays readable: a popover on a
              desktop (LAYOUTS.md §3, "needed for reference only"), a sheet on a phone. */}
          <Popover open={rFlat ? panelOpen : showFilters} onOpenChange={(o) => (rFlat ? setPanelOpen(o) : setShowFilters(o))} modal={false}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-item="people.filters.all"
                data-item-label={rDoors ? "All filters" : "Show Filters"}
                onClick={(e) => {
                  if (rFlat && window.matchMedia("(max-width: 767px)").matches) { e.preventDefault(); setPhoneFilters(true) }
                }}
              >
                <ChevronDown aria-hidden="true" className={cn("size-3 transition-transform", (rFlat ? panelOpen : showFilters) && "rotate-180")} />
                {!rFlat ? (
                  <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
                ) : !rDoors ? (
                  <span>Filters</span>
                ) : (
                  <>
                    <span className="md:hidden">Filters{activeCount ? ` · ${activeCount} active` : ""}</span>
                    <span className="hidden md:inline">All filters ({defs.length}){activeElsewhere.length ? ` · ${activeElsewhere.length} more active` : ""}</span>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="hidden max-h-[70vh] w-96 overflow-y-auto md:block"
              data-container="people.filters.panel"
              data-container-label={rDoors ? `All filters (${defs.length})` : "Filters"}
              onOpenAutoFocus={(e) => { if (pinned) e.preventDefault() }}
              onInteractOutside={(e) => { if (pinned) e.preventDefault() }}
            >
              <div className="flex items-center gap-1 pb-2">
                <h3 className="flex-1 text-sm font-medium">{rDoors ? `All filters (${defs.length})` : "Filters"}</h3>
                {rContext && (
                  <Button
                    size="icon"
                    variant={pinned ? "secondary" : "ghost"}
                    className="size-7"
                    aria-pressed={pinned}
                    aria-label={pinned ? "Unpin the filters panel" : "Pin the filters panel open"}
                    data-item="people.filters.pin"
                    data-item-label="Pin the filters panel"
                    onClick={() => setPinned(!pinned)}
                  >
                    📌
                  </Button>
                )}
              </div>
              {filtersBody}
            </PopoverContent>
          </Popover>
          {(activeCount > 0 || q) && (
            <Button size="sm" variant="ghost" data-item="people.f.clear" data-item-label="Clear" onClick={clearAll}>Clear</Button>
          )}
        </span>
      ),
    },
  ]

  /** The trailing slot of the toolbar: the count this toolbar filters, and the columns control. */
  const shown_ = (
    <span className="flex items-center gap-3">
      <Badge variant="outline" data-item="people.count" data-item-label="the result count" role="status" aria-live="polite" className="tabular-nums">
        {settling ? "…" : `${sorted.length.toLocaleString()} of ${total.toLocaleString()}`}
      </Badge>
      {rDoors ? (
        <ColumnsDoor
          all={allColumns}
          shownIds={shownColumnIds}
          onChange={setColumns}
          onReset={() => setColumns([])}
          density={density}
          onDensity={setDensity}
          pageSize={pageSize}
          onPageSize={(n) => { setPageSize(n); setShown(n) }}
          roleLabel={seat?.title ?? "your seat"}
        />
      ) : (
        <ParodyColumns
          all={allColumns}
          shownIds={shownColumnIds}
          onChange={setColumns}
          density={density}
          onDensity={setDensity}
          showDensity={rContent}
        />
      )}
    </span>
  )

  const pad = density === "Compact" ? "py-1" : "py-2"

  /** The desktop body. The template hides it at 400 and shows `rows` instead. */
  const tableBody = (
          <Table>
      <TableHeader className="bg-card sticky top-0 z-10">
        <TableRow>
          <TableHead className="w-8 px-3">
            <Checkbox
              aria-label={`Select the ${page.length} people on this page`}
              checked={page.length > 0 && page.every((p) => selected.includes(p.id))}
              onCheckedChange={(v) => setSelected(v === true ? page.map((p) => p.id) : [])}
            />
          </TableHead>
          {shownColumns.map((c) => (
            <TableHead
              key={c.id}
              data-item={c.id}
              data-item-label={c.header}
              aria-sort={sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
              className={cn("px-2", c.className)}
            >
              {sortHeader(c)}
            </TableHead>
          ))}
          {/* Not sticky: a cell pinned to the right edge is as wide as the row's buttons and paints
              over the headers behind it. The library's own scroller carries the column instead. */}
          <TableHead style={{ width: 1 }} className="px-2"><span className="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {page.map((p, i) => (
          <TableRow
            key={p.id}
            ref={(el) => { rowRefs.current[i] = el }}
            data-row={i}
            /* The anchor a chain returns to: `follow` hands this id to the trail and the
               shell scrolls to it, lights it for three seconds and puts focus back on it. */
            data-item={p.id}
            data-item-label={p.name}
            tabIndex={i === focused ? 0 : -1}
            aria-label={density === "Compact" ? `${p.name}, ${p.title}, ${p.company}` : undefined}
            onFocus={() => setFocused(i)}
            onKeyDown={(e) => onRowKey(e, p, i)}
            onClick={(e) => { if ((e.target as HTMLElement).closest("a,button,input,[role=menuitem]")) return; rowRefs.current[i]?.focus(); setGlancing(p) }}
            /* The row you are on is the library's own hover and its own selected state; the
               page adds no background of its own. */
            data-state={selected.includes(p.id) || allMatching ? "selected" : undefined}
            className="group cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          >
            <TableCell className={cn("px-3", pad)}>
              <Checkbox
                aria-label={`Select ${p.name}`}
                checked={selected.includes(p.id) || allMatching}
                onCheckedChange={() => toggleRow(p, i, false)}
                onClick={(e) => { e.stopPropagation(); if (e.shiftKey) toggleRow(p, i, true) }}
              />
            </TableCell>
            {shownColumns.map((c) => (
              <TableCell key={c.id} className={cn("px-2 align-middle", pad, c.className)}>
                <div className={c.width}>
                {c.key === "name" ? (
                  <span className="flex min-w-0 items-center gap-2">
                    <a
                      className="min-w-0 underline-offset-4 hover:underline"
                      href={href(`/ollopa/people/${p.id}`)}
                      onClick={(e) => {
                        e.stopPropagation()
                        // A real href, so copy-link and open-in-a-new-tab still work; a plain
                        // click is a step in a chain, so it goes through the trail instead.
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
                        e.preventDefault()
                        leaveFor(`/ollopa/people/${p.id}`, p.id)
                      }}
                    >
                      {c.cell(p)}
                    </a>
                    {p.jobChange && d.weekly("people.job-change-update") > 0 && <JobChange p={p} onDone={(m) => offerUndo(m, () => toast("Put back as it was."))} seed={seed} />}
                  </span>
                ) : c.key === "stage" ? (
                  <StagePicker value={stageOf(p)} inSequence={rPrice && Boolean(seqOf(p))} onChange={(s) => moveStage(p, s)} />
                ) : c.key === "sequence" ? (
                  seqOf(p) || <span className="text-muted-foreground">—</span>
                ) : c.key === "phone" ? (
                  isRevealed(p) ? <span className="tabular-nums">{p.phoneNumber ?? "On file"}</span>
                    : p.phone ? (
                      <Button size="sm" variant="outline" data-item="people.row.reveal-phone" data-item-label="Reveal phone" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); reveal(p) }}>
                        {rPrice ? `Reveal · ${CREDITS.revealPhone} credits${priceState(CREDITS.revealPhone).suffix}` : "Access mobile"}
                      </Button>
                    ) : <span className="text-muted-foreground">No phone</span>
                ) : c.cell(p)}
                </div>
              </TableCell>
            ))}
            {/* The menu is always in the row; the named buttons come forward on hover and on
                keyboard focus, over the row rather than taking a column's width from it. */}
            {/* The menu is always at the right edge, whatever the table is scrolled to. The named
                buttons come forward on hover and on keyboard focus, beside it, on the row's own
                hovered surface — no border, no radius, no box of their own. */}
            <TableCell style={{ width: 1 }} className={cn("bg-card group-hover:bg-muted sticky right-0 px-2", pad)} onClick={(e) => e.stopPropagation()}>
              <div className="relative flex items-center justify-end">
                <div
                  className="bg-muted absolute top-1/2 right-full flex -translate-y-1/2 items-center gap-1 pr-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                  data-container="people.row.actions"
                  data-container-label="the row's buttons"
                >
                  {[...rowButtons, ...(rDoors ? [] : [companyListAct])].map((a) => (
                    <Button key={a.id} size="sm" variant="ghost" data-item={a.id} data-item-label={a.label(p)} className="h-7 whitespace-nowrap px-2 text-xs" onClick={() => a.run(p)}>
                      {a.icon && <a.icon aria-hidden="true" className="size-3.5" />}{a.label(p)}
                    </Button>
                  ))}
                </div>
                <RowMenu p={p} acts={usable} named={rDoors} shortcuts={rExpert} onGlance={() => setGlancing(p)} onOpen={() => leaveFor(`/ollopa/people/${p.id}`, p.id)} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  /** The same people as a divided list, for 400. The template draws the dividers. */
  const rowList = (
    <>
            {page.map((p, i) => (
        <li key={p.id} className="px-4 py-3" data-item={p.id} data-item-label={p.name}>
          <div className="flex items-start gap-2">
            {selectMode && (
        <Checkbox
          className="mt-1"
          aria-label={`Select ${p.name}`}
          checked={selected.includes(p.id) || allMatching}
          onCheckedChange={() => toggleRow(p, i, false)}
        />
            )}
            <div className="min-w-0 flex-1">
        <a
          className="font-medium underline-offset-4 hover:underline"
          href={href(`/ollopa/people/${p.id}`)}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
            e.preventDefault()
            leaveFor(`/ollopa/people/${p.id}`, p.id)
          }}
        >{p.name}</a>
        <div className="text-xs text-muted-foreground">{p.title} · {p.company}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary" className={cn("t-small font-medium", STAGE_TONE[stageOf(p)])}>{stageOf(p)}</Badge>
          <span className="text-muted-foreground">{seqOf(p) || "Not in a sequence"}</span>
          <span className="text-muted-foreground">{p.lastContacted ? day(p.lastContacted) : "Never contacted"}</span>
          {p.phone && !isRevealed(p) && (
            <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => reveal(p)}>
              {rPrice ? `Reveal · ${CREDITS.revealPhone} credits${priceState(CREDITS.revealPhone).suffix}` : "Access mobile"}
            </Button>
          )}
        </div>
            </div>
            <RowMenu p={p} acts={usable} named={rDoors} shortcuts={rExpert} onGlance={() => setGlancing(p)} onOpen={() => leaveFor(`/ollopa/people/${p.id}`, p.id)} />
          </div>
        </li>
      ))}
    </>
  )

  return (
    <>
      <IndexPage
        family="people"
        title="People"
        count={total}
        actions={[{
          kind: "primary",
          label: "Add people",
          onClick: () => toast("Find people searches the database beside this table. It is a later case."),
        }]}
        more={[
          { kind: "link", label: "Import CSV", onClick: () => leaveFor("/ollopa/import", "people.add") },
          ...(b.crm ? [{ kind: "secondary" as const, label: `Sync from ${b.crm} now`, onClick: () => toast(`Pulling changes from ${b.crm}.`) }] : []),
        ]}
        controls={controls}
        shown={shown_}
        above={
          <>
            {/* Before rule 2 the filters are a sidebar of groups, three deep. */}
            {!rFlat && (
              <ParodySidebar
                popular={popularFilters}
                rest={restFilters}
                active={active}
                values={valuesOf}
                count={counts}
                onChange={setFilter}
                open={showFilters}
                moreOpen={moreFilters}
                onMore={setMoreFilters}
                onSaveSearch={() => toast("Name this search to save it.")}
              />
            )}
            {!rFlat && (
              <ParodyTabs
                total={total}
                netNew={allRows.filter((p) => !p.enrichedOn).length}
                saved={total - allRows.filter((p) => !p.enrichedOn).length}
                tab={tab}
                onTab={setTab}
              />
            )}
            {/* The filters that produced these rows, on the printed page and nowhere else. */}
            <p className="hidden pb-2 text-xs print:block">
              {activeCount === 0 && !q ? "No filters" : [q && `Search: ${q}`, ...defs.filter((f) => active[f.id]?.length).map((f) => chipLabel(f, active[f.id]))].filter(Boolean).join(" · ")}
            </p>
          </>
        }
        table={<>{tableBody}{sorted.length === 0 && <NoResults defs={defs} active={active} lastChip={lastChip} counts={counts} onDrop={(id) => setFilter(id, [])} onClear={clearAll} />}</>}
        rows={rowList}
        pager={
          <div className="flex w-full flex-wrap items-center justify-center gap-4">
            {sorted.length > shown && (
              <Button variant="outline" size="sm" onClick={() => setShown((n) => n + pageSize)}>
                Show {Math.min(pageSize, sorted.length - shown)} more
              </Button>
            )}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <label htmlFor="rows-per-page">Rows per page</label>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setShown(Number(v)) }}>
                <SelectTrigger id="rows-per-page" className="h-7 w-20 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{[25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </span>
            <Button size="sm" variant="ghost" className="sm:hidden" onClick={() => setSelectMode((v) => !v)}>
              {selectMode ? "Done selecting" : "Select"}
            </Button>
          </div>
        }
        bulk={
          rStable
            ? (count > 0 ? (
              <span className="flex w-full flex-wrap items-center gap-2" data-container="people.bulk.bar" data-container-label="the selection bar" data-print-hide>
                {selectionControls}
                <span className="flex flex-wrap items-center gap-1.5">{bulkStrip}</span>
              </span>
            ) : undefined)
            : <BulkSelection controls={selectionControls}>{bulkStrip}</BulkSelection>
        }
      >
      {pending && (
        <Alert role="status" aria-live="assertive" data-print-hide>
          <AlertDescription className="flex-row flex-wrap items-center gap-3">
            <span className="min-w-0 flex-1">{pending.text}</span>
            <Button size="sm" onClick={() => { pending.run(); setPending(null) }}>Spend</Button>
            <Button size="sm" variant="ghost" onClick={() => setPending(null)}>Cancel</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Undo, for ten seconds, on anything undoable. ⌘Z does the same. */}
      {undo && (
        <Alert role="status" aria-live="polite" data-print-hide>
          <AlertDescription className="flex-row flex-wrap items-center gap-3">
            <span className="min-w-0 flex-1">{undo.text}</span>
            <Button size="sm" variant="outline" onClick={() => { undo.run(); setUndo(null) }}>Undo</Button>
          </AlertDescription>
        </Alert>
      )}
      </IndexPage>

      {glancing && (
        <QuickLook
          open
          /* Closing the drawer puts the keyboard back where it was: on the row it was opened from. */
          onOpenChange={(o) => { if (!o) { setGlancing(null); window.setTimeout(() => (document.querySelector(`tr[data-row="${focused}"]`) as HTMLElement | null)?.focus(), 220) } }}
          title={glancing.name}
          /* The seat's own first level, from the usage model — the same call the record header and
             the pane beside another page make, so the three cannot drift. */
          fields={glanceFields(glancing, seed, d.level).map((f) => ({ label: f.label, value: f.label === "Stage" ? stageOf(glancing) : f.value }))}
          editable={{ label: "Stage", value: stageOf(glancing), options: [...STAGES], onChange: (v) => moveStage(glancing, v as ContactStage) }}
          /* "Open" leaves for the record and hands the trail this row, so the crumb back lands on
             it, lit and focused, with the drawer closed and everything else as it was. */
          onOpen={() => { const id = glancing.id; setGlancing(null); leaveFor(`/ollopa/people/${id}`, id) }}
        />
      )}

      {enrichFor && (
        <EnrichPanel
          open
          onOpenChange={(o) => { if (!o) setEnrichFor(null) }}
          rows={enrichFor}
          session={session}
          seed={seed}
          onSpend={(summary) => toast(summary)}
        />
      )}

      <Panel id="people-filters-phone" title={`All filters (${defs.length})`} open={phoneFilters} onOpenChange={setPhoneFilters}>
        {filtersBody}
      </Panel>

      {/* The common version's price: eight steps into a dialog, and nowhere else (rule 7). */}
      {!rPrice && (
        <CreditsDialog
          open={creditsDialog}
          onOpenChange={setCreditsDialog}
          count={Math.max(count, 1)}
          cost={Math.max(count, 1) * CREDITS.enrich}
          balance={balance}
          onConfirm={() => toast(`${Math.max(count, 1)} people saved.`)}
        />
      )}
    </>
  )
}

/* ------------------------------------------------------------------------------- small pieces */

function capPerCompany(rows: PersonRow[], limit: number | null): PersonRow[] {
  if (!limit) return rows
  const seen = new Map<string, number>()
  return rows.filter((p) => {
    const n = (seen.get(p.companyId) ?? 0) + 1
    seen.set(p.companyId, n)
    return n <= limit
  })
}

/** Every row action, with its shortcut printed, named for the person it acts on. */
function RowMenu({ p, acts, named = true, shortcuts = true, onGlance, onOpen }: {
  p: PersonRow
  acts: { id: string; label: (p: PersonRow) => string; shortcut?: string; run: (p: PersonRow) => void; destructive?: boolean }[]
  /** Rule 4: the menu is named for the person it acts on, not "More". */
  named?: boolean
  /** Rule 8: every item prints the key that does it. */
  shortcuts?: boolean
  onGlance: () => void
  /** Leaves for the record through the trail, with this row as the anchor to come back to. */
  onOpen: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="size-7" data-item="people.row.more" data-item-label="the row menu" aria-label={named ? `Actions for ${p.name}` : "More"}>
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" data-container="people.row.menu" data-container-label={named ? `Actions for ${p.name}` : "the row menu"}>
        <DropdownMenuItem data-item="people.row.quick-look" data-item-label="Quick look" onSelect={onGlance}>Quick look{shortcuts && <span className="ml-auto font-mono text-xs text-muted-foreground">Enter</span>}</DropdownMenuItem>
        <DropdownMenuItem data-item="people.row.open" data-item-label="Open the full record" onSelect={onOpen}>Open the full record{shortcuts && <span className="ml-auto font-mono text-xs text-muted-foreground">o</span>}</DropdownMenuItem>
        <DropdownMenuSeparator />
        {acts.filter((a) => !a.destructive).map((a) => (
          <DropdownMenuItem key={a.id} data-item={a.id} data-item-label={a.label(p)} onSelect={() => a.run(p)}>
            {a.label(p)}
            {shortcuts && a.shortcut && <span className="ml-auto font-mono text-xs text-muted-foreground">{a.shortcut}</span>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {acts.filter((a) => a.destructive).map((a) => (
          <DropdownMenuItem key={a.id} data-item={a.id} data-item-label={a.label(p)} className="text-destructive" onSelect={() => a.run(p)}>{a.label(p)}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** The stage badge is the door: seven stages, and the two that leave the sequence say so on the item. */
function StagePicker({ value, inSequence, onChange }: { value: ContactStage; inSequence: boolean; onChange: (s: ContactStage) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ContactStage)}>
      <SelectTrigger
        aria-label="Stage"
        className={cn("h-6 w-auto gap-1 border-none px-1.5 py-0 text-xs shadow-none focus-visible:ring-2", STAGE_TONE[value])}
        onClick={(e) => e.stopPropagation()}
      >
        {/* The trigger prints the stage and only the stage: the consequence note belongs on the
            option, where the choice is made, and Radix would otherwise copy it into the badge. */}
        <span>{value}</span>
      </SelectTrigger>
      <SelectContent>
        {STAGES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
            {inSequence && (s === "Not interested" || s === "Unresponsive") && (
              <span className="ml-1 text-xs text-muted-foreground">· also leaves the sequence</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Shown while the job-change signal is live on that person, and removed when it is not (rule 4). */
function JobChange({ p, seed, onDone }: { p: PersonRow; seed: ReturnType<typeof seedFor>; onDone: (msg: string) => void }) {
  const [open, setOpen] = useState(false)
  if (!p.jobChange) return null
  const co = seed.companies.find((c) => c.id === p.jobChange!.newCompanyId)
  const known = co && (co.stage === "Current client" || co.stage === "Active opportunity")
  const deals = seed.deals.filter((dl) => dl.companyId === co?.id && !dl.archivedAt).length
  const line = co
    ? known
      ? `${co.name} — already an account · owner ${co.owner}${deals ? ` · ${deals} open deal${deals === 1 ? "" : "s"}` : ""}`
      : `${co.name} — not in the workspace yet`
    : "The new employer is not in the workspace yet"
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={open}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          Changed job
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 text-sm" onClick={(e) => e.stopPropagation()}>
        <p className="pb-2">{line}</p>
        {/* Two comparable acts, so neither is filled; both can be undone, so neither carries a
            sentence and neither asks first (DESIGN.md §1 and §3). What each does is its label. */}
        <Actions surface="card" layout="stack" items={[
          { kind: "secondary", label: "Update this record", onClick: () => { setOpen(false); onDone(`${p.name} updated to ${co?.name ?? "the new employer"}. History, notes and owner kept; taken out of any sequence aimed at ${p.jobChange!.previousCompany}.`) } },
          { kind: "secondary", label: "Create a new contact", onClick: () => { setOpen(false); onDone(`New contact started for ${p.name} at ${co?.name ?? "the new employer"}. This record stays at ${p.jobChange!.previousCompany}.`) } },
        ]} />
      </PopoverContent>
    </Popover>
  )
}

/** "All views (n)": mine, shared, the shipped one, a search, and the name field that saves this one. */
function ViewsDoor({ views, viewId, user, onOpen, onSave, onAction, onPage = true, shortcuts = true }: {
  views: PeopleView[]
  viewId: string | null
  user: string
  onOpen: (v: PeopleView) => void
  onSave: (name: string) => void
  onAction: (what: string, v: PeopleView) => void
  /** Rule 5: the default view is set here, on the page it changes, not in Settings. */
  onPage?: boolean
  /** Rule 8: the number key that opens each view is printed beside it. */
  shortcuts?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [q, setQ] = useState("")
  const matching = views.filter((v) => v.name.toLowerCase().includes(q.trim().toLowerCase()))
  const mine = matching.filter((v) => v.owner === user)
  const shared = matching.filter((v) => v.owner !== user)
  const current = views.find((v) => v.id === viewId)

  const group = (label: string, list: PeopleView[]) => list.length === 0 ? null : (
    <section className="pt-2">
      <h4 className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</h4>
      <ul className="space-y-0.5">
        {list.map((v, i) => (
          <li key={v.id}>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              onClick={() => { onOpen(v); setOpen(false) }}
            >
              <span className="min-w-0 flex-1 truncate">{v.name}</span>
              {v.alert && v.alert !== "off" && <span className="text-xs text-muted-foreground">{v.alert} email</span>}
              {shortcuts && <span className="font-mono text-xs text-muted-foreground">{views.indexOf(v) < 9 ? views.indexOf(v) + 1 : ""}</span>}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-item="people.views.saved"
          data-item-label="All views"
          aria-expanded={open}
        >
          <ChevronDown aria-hidden="true" className={cn("transition-transform", open && "rotate-180")} />
          All views ({views.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <Input aria-label="Search views" placeholder="Search views" className="h-8" value={q} onChange={(e) => setQ(e.target.value)} />
        {group("Mine", mine)}
        {group("Shared with everyone", shared)}
        <Separator className="mt-3" />
        <div className="pt-3">
          <label htmlFor="save-view" className="text-xs text-muted-foreground">Save the filters you are looking at</label>
          <div className="mt-1 flex gap-1.5">
            <Input id="save-view" className="h-8" placeholder="Name this view" value={name} onChange={(e) => setName(e.target.value)} />
            <Button size="sm" data-item="people.views.save" data-item-label="Save this view" disabled={!name.trim()} onClick={() => { onSave(name.trim()); setName(""); setOpen(false) }}>Save</Button>
          </div>
        </div>
        {current && (
          <>
            <Separator className="mt-3" />
            <div className="pt-3">
            <h4 className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{current.name}</h4>
            <div className="flex flex-wrap gap-1">
              {[...(onPage ? ["Set as my default"] : []), "Rename", "Share with everyone", "Email me daily", "Email me weekly", "Copy a link", "Delete"].map((what) => (
                <Button key={what} size="sm" variant="outline" onClick={() => { onAction(what.toLowerCase(), current); setOpen(false) }}>
                  {what}
                </Button>
              ))}
            </div>
            {!onPage && (
              <p className="pt-2 text-xs text-muted-foreground">
                Your default view is set in <a className="underline" href={href("/ollopa/settings")}>Settings › Users and teams › Sharing and defaults</a>.
              </p>
            )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

/** "Columns and density · n of m": the checklist, the reset named for the seat, density, rows per page. */
function ColumnsDoor({ all, shownIds, onChange, onReset, density, onDensity, pageSize, onPageSize, roleLabel }: {
  all: ColumnDef[]
  shownIds: string[]
  onChange: (ids: string[]) => void
  onReset: () => void
  density: "Comfortable" | "Compact"
  onDensity: (d: "Comfortable" | "Compact") => void
  pageSize: number
  onPageSize: (n: number) => void
  roleLabel: string
}) {
  const [open, setOpen] = useState(false)
  const move = (id: string, by: number) => {
    const at = shownIds.indexOf(id)
    const to = at + by
    if (at < 0 || to < 0 || to >= shownIds.length) return
    const next = [...shownIds]
    next.splice(to, 0, next.splice(at, 1)[0])
    onChange(next)
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-item="people.columns.choose"
          data-item-label="Columns and density"
          aria-expanded={open}
        >
          <ChevronDown aria-hidden="true" className={cn("transition-transform", open && "rotate-180")} />
          Columns and density · {shownIds.length} of {all.length}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80" data-container="people.columns.popover" data-container-label="Columns and density">
        <ul className="max-h-72 space-y-0.5 overflow-y-auto">
          {[...shownIds.map((id) => all.find((c) => c.id === id)).filter((c): c is ColumnDef => Boolean(c)),
            ...all.filter((c) => !shownIds.includes(c.id))].map((c) => {
            const on = shownIds.includes(c.id)
            return (
              <li key={c.id} className="flex items-center gap-1">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded px-1.5 py-1 text-left text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={() => onChange(on ? shownIds.filter((x) => x !== c.id) : [...shownIds, c.id])}
                >
                  <Checkbox checked={on} aria-hidden="true" tabIndex={-1} className="pointer-events-none" />
                  <span className="min-w-0 truncate">{c.header}</span>
                </button>
                {on && (
                  <>
                    <Button size="icon" variant="ghost" className="size-6" aria-label={`Move ${c.header} up`} onClick={() => move(c.id, -1)}>↑</Button>
                    <Button size="icon" variant="ghost" className="size-6" aria-label={`Move ${c.header} down`} onClick={() => move(c.id, 1)}>↓</Button>
                  </>
                )}
              </li>
            )
          })}
        </ul>
        <Separator className="mt-3" />
        <div className="space-y-2 pt-3">
          <Button size="sm" variant="outline" onClick={onReset}>Reset to the {roleLabel} default</Button>
          <div className="flex flex-wrap items-center gap-2" data-item="people.density" data-item-label="Density">
            <span className="text-xs text-muted-foreground">Density</span>
            <ToggleGroup type="single" variant="outline" size="sm" spacing={2} value={density} onValueChange={(v) => { if (v) onDensity(v as "Comfortable" | "Compact") }}>
              {(["Comfortable", "Compact"] as const).map((v) => (
                <ToggleGroupItem key={v} value={v}>{v}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page</span>
            <ToggleGroup type="single" variant="outline" size="sm" spacing={2} value={String(pageSize)} onValueChange={(v) => { if (v) onPageSize(Number(v)) }}>
              {[25, 50, 100].map((n) => (
                <ToggleGroupItem key={n} value={String(n)}>{n}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Nothing matches: name the chip that did it and what dropping it would give. */
function NoResults({ defs, active, lastChip, counts, onDrop, onClear }: {
  defs: FilterDef[]
  active: Active
  lastChip: string | null
  counts: (f: FilterDef, v: string) => number
  onDrop: (id: string) => void
  onClear: () => void
}) {
  const culprit = defs.find((f) => f.id === lastChip && (active[f.id]?.length ?? 0) > 0)
    ?? defs.find((f) => (active[f.id]?.length ?? 0) > 0)
  const would = culprit ? Math.max(...(active[culprit.id] ?? []).map((v) => counts(culprit, v)), 0) : 0
  return (
    <div className="px-6 py-12 text-center text-sm">
      <p className="font-medium">Nothing matches.</p>
      <p className="mt-1 text-muted-foreground">
        {culprit
          ? <>Remove “{chipLabel(culprit, active[culprit.id] ?? [])}” (would give {would.toLocaleString()}), or clear all filters.</>
          : <>Clear the search or a filter.</>}
      </p>
      <div className="mt-3 flex justify-center gap-2">
        {culprit && <Button size="sm" variant="outline" onClick={() => onDrop(culprit.id)}>Remove {culprit.label}</Button>}
        <Button size="sm" variant="ghost" onClick={onClear}>Clear all filters</Button>
      </div>
    </div>
  )
}
