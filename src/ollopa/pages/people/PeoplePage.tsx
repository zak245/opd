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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { href, navigate } from "@/app/router"
import { QuickLook } from "../../templates/QuickLook"
import { toast } from "../../templates/TablePage"
import { Panel } from "../../ui/Panel"
import { EmptyState } from "../../ui/EmptyState"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { CREDITS, STAGES, seedFor, type ContactStage } from "../../data/seed"
import type { Session } from "../../session"
import { columnsFor, STAGE_TONE, type ColumnDef } from "./columns"
import { applyFilters, chipLabel, filtersFor, type Active, type FilterContext, type FilterDef } from "./filters"
import { day, glanceFields, rowsFor, type PersonRow } from "./person"
import { needsEnrichment, viewsFor, type PeopleView } from "./views"
import { FilterChip, FiltersPanelBody, FiltersPanelFrame } from "./parts"
import { EnrichPanel } from "./EnrichPanel"

/* -------------------------------------------------------------------------------- what persists */

const key = (user: string, what: string) => `ollopa.people.${user}.${what}`

function usePersisted<T>(user: string, what: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key(user, what))
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch { return initial }
  })
  const set = useCallback((v: T) => {
    setValue(v)
    try { localStorage.setItem(key(user, what), JSON.stringify(v)) } catch { /* this visit only */ }
  }, [user, what])
  return [value, set]
}

interface Sort { key: string; dir: "asc" | "desc" }

/* ------------------------------------------------------------------------------------ the page */

export function PeoplePage({ session }: { session: Session }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const d = useDisclosure("people")

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

  const defaultView = views.find((v) => v.defaultFor.includes(session.role)) ?? null

  /* ------------------------------------------------------------------------------------- state */

  const [typed, setTyped] = useState("")
  const [q, setQ] = useState("")
  const [active, setActive] = useState<Active>(defaultView?.filters ?? {})
  const [viewId, setViewId] = usePersisted<string | null>(session.user, "view", defaultView?.id ?? null)
  const [sort, setSort] = usePersisted<Sort | null>(session.user, "sort", defaultView?.sort ?? null)
  const [columns, setColumns] = usePersisted<string[]>(session.user, "columns", [])
  const [density, setDensity] = usePersisted<"Comfortable" | "Compact">(session.user, "density", "Comfortable")
  const [pageSize, setPageSize] = usePersisted<number>(session.user, "pageSize", 25)
  const [pinned, setPinned] = usePersisted<boolean>(session.user, "pinned", false)
  const [panelOpen, setPanelOpen] = useState(false)
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

  const view = views.find((v) => v.id === viewId) ?? null
  const shownColumnIds = columns.length > 0
    ? columns
    : [...defaultColumns, ...(view?.extraColumns ?? []).filter((c) => !defaultColumns.includes(c))]
  const shownColumns = shownColumnIds
    .map((id) => allColumns.find((c) => c.id === id))
    .filter((c): c is ColumnDef => Boolean(c))

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
  const stageOf = (p: PersonRow) => localStage[p.id] ?? p.stage
  const seqOf = (p: PersonRow) => localSeq[p.id] ?? p.inSequence
  const isRevealed = (p: PersonRow) => p.phoneRevealed || revealed.includes(p.id)

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
  const chipFilters = defs.filter((f) => d.level(f.id) === 1)
  const activeElsewhere = defs.filter((f) => d.level(f.id) === 2 && (active[f.id]?.length ?? 0) > 0)
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
    setUndo({ text, run })
    toast(text)
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
    if (cost > balance) return { suffix: " · no credits left", why: `The workspace has ${balance.toLocaleString()} credits left. ${admin ? `${admin.user} (${admin.title})` : "Your admin"} can add more.` }
    if (myLimit !== null && spentByMe + cost > myLimit) return { suffix: " · over your limit", why: `Your limit is ${myLimit.toLocaleString()} credits a month; ${spentByMe.toLocaleString()} used. ${admin ? `${admin.user} (${admin.title})` : "Your admin"} can raise it.` }
    return { suffix: "", why: null as string | null }
  }

  const spend = (cost: number, done: string) => {
    const state = priceState(cost)
    if (state.why) { toast(state.why); return }
    toast(`${done} · ${cost} credits · ${(balance - cost).toLocaleString()} left`)
  }

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
    { id: "people.row.list", icon: ListPlus, shortcut: "l", label: () => "List", run: (p) => offerUndo(`${p.name} added to ${seed.lists.find((l) => l.kind === "people")?.name ?? "a list"}.`, () => toast(`${p.name} taken off the list again.`)) },
    { id: "people.row.call", icon: Phone, shortcut: "c", label: () => "Call task", run: (p) => toast(`Call task due today for ${p.name}. It is in Tasks.`) },
    { id: "people.row.enrich", icon: Sparkles, shortcut: "e", label: (p) => (p.enrichedOn ? `Enrich · ${CREDITS.enrich} credits${priceState(CREDITS.enrich).suffix}` : `Enrich · ${CREDITS.enrich} credits${priceState(CREDITS.enrich).suffix}`), run: (p) => spend(CREDITS.enrich, `${p.name} enriched`) },
    { id: "people.row.research-agent", shortcut: "r", label: () => `Research · ${CREDITS.research} credits${priceState(CREDITS.research).suffix}`, run: (p) => spend(CREDITS.research, `Research queued for ${p.name}`) },
    { id: "people.row.email", label: () => "One-off email", run: (p) => toast(`Writing to ${p.email}.`) },
    { id: "people.row.view-company", label: () => "Open the company", run: (p) => navigate(`/ollopa/companies/${p.companyId}`) },
    { id: "people.row.copy-email", label: () => "Copy email", run: (p) => { navigator.clipboard?.writeText(p.email); toast(`${p.email} copied.`) } },
    { id: "people.row.edit", label: () => "Edit fields", run: (p) => navigate(`/ollopa/people/${p.id}`) },
    { id: "people.row.note", label: () => "Add a note", run: (p) => navigate(`/ollopa/people/${p.id}`) },
    { id: "people.row.add-to-deal", label: () => "Add to a deal", run: (p) => toast(`Choose a deal at ${p.company}.`) },
    { id: "people.row.assign-owner", label: () => "Assign owner", run: (p) => toast(`Owner of ${p.name} changed.`) },
    { id: "people.row.push-crm", label: () => `Push to ${b.crm ?? "CRM"} now`, run: (p) => toast(`${p.name} pushed to ${b.crm}.`) },
    { id: "people.row.merge", label: () => "Merge duplicate", run: (p) => toast(`Merging ${p.name}: choose the record to merge with.`) },
    { id: "people.row.dnc", label: () => "Mark do not contact", run: (p) => offerUndo(`${p.name} marked do not contact. Removed from all sequences and outreach blocked.`, () => toast(`${p.name} is contactable again.`)) },
    { id: "people.row.remove", destructive: true, label: () => "Remove from workspace", run: (p) => offerUndo(`${p.name} removed from the workspace.`, () => toast(`${p.name} is back.`)) },
  ]

  const usable = rowActs.filter((a) => d.weekly(a.id) > 0 || a.id === "people.row.dnc" || a.id === "people.row.remove")
  const rowButtons = usable
    .filter((a) => d.level(a.id) === 1 && !a.destructive)
    .sort((x, y) => d.weekly(y.id) - d.weekly(x.id))
    .slice(0, 5)

  /* -------------------------------------------------------------------------------- bulk actions */

  interface BulkAct { id: string; label: (n: number) => string; run: () => void; destructive?: boolean }

  const bulkActs: BulkAct[] = [
    { id: "people.bulk.sequence", label: (n) => `Add ${n} to sequence`, run: () => offerUndo(`${count} added to ${seed.sequences[0]?.name ?? "a sequence"} · 3 skipped, already in a sequence.`, () => toast("Taken back out of the sequence.")) },
    { id: "people.bulk.list", label: (n) => `Add ${n} to list`, run: () => offerUndo(`${count} added to ${seed.lists.find((l) => l.kind === "people")?.name ?? "a list"}.`, () => toast("Taken off the list.")) },
    { id: "people.bulk.enrich", label: (n) => `Enrich ${n} · ${(n * CREDITS.enrich).toLocaleString()} credits`, run: () => setEnrichFor(selectedRows) },
    { id: "people.bulk.export", label: (n) => `Export ${n} · no credits`, run: () => toast(`${count} people exported as CSV · no credits.`) },
    { id: "people.bulk.stage", label: (n) => `Change stage of ${n}`, run: () => toast(`Choose the stage for ${count} people.`) },
    { id: "people.bulk.research-agent", label: (n) => `Research ${n} · ${(n * CREDITS.research).toLocaleString()} credits`, run: () => spend(count * CREDITS.research, `Research queued for ${count} people`) },
    { id: "people.bulk.email", label: (n) => `Email ${n}`, run: () => toast(`Writing to ${count} people.`) },
    { id: "people.bulk.assign-owner", label: (n) => `Assign owner of ${n}`, run: () => toast(`Owner changed for ${count} people.`) },
    { id: "people.bulk.push-crm", label: (n) => `Push ${n} to ${b.crm ?? "CRM"}`, run: () => toast(`${count} pushed to ${b.crm}.`) },
    { id: "people.bulk.merge", label: () => (count === 2 ? "Merge the two selected" : "Merge duplicates — select two"), run: () => (count === 2 ? toast("Side by side: choose which value wins.") : toast("Select exactly two people to merge.")) },
    { id: "people.bulk.remove", destructive: true, label: (n) => `Remove ${n} from the workspace`, run: () => offerUndo(`${count} removed from the workspace.`, () => toast("They are back.")) },
  ]
  const usableBulk = bulkActs.filter((a) => d.weekly(a.id) > 0 || a.id === "people.bulk.remove")
  const bulkButtons = usableBulk
    .filter((a) => d.level(a.id) === 1 && !a.destructive)
    .sort((x, y) => d.weekly(y.id) - d.weekly(x.id))

  /* ------------------------------------------------------------------------------- the keyboard */

  const focusRow = (i: number) => {
    const at = Math.max(0, Math.min(i, page.length - 1))
    setFocused(at)
    rowRefs.current[at]?.focus()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
    if (pending) {
      if (k === "Enter") { e.preventDefault(); pending.run(); setPending(null); return }
      if (k === "Escape") { e.preventDefault(); setPending(null); return }
    }
    if (k === "ArrowDown" || k === "j") { e.preventDefault(); focusRow(i + 1); return }
    if (k === "ArrowUp" || k === "k") { e.preventDefault(); focusRow(i - 1); return }
    if (k === "Enter" || k === " ") { e.preventDefault(); setGlancing(p); return }
    if (k === "o") { e.preventDefault(); navigate(`/ollopa/people/${p.id}`); return }
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

  const addPeople = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">Add people <ChevronDown aria-hidden="true" className="size-3.5" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => toast("Find people searches the database beside this table. It is a later case.")}>
          Search the database
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/ollopa/import")}>Import CSV</DropdownMenuItem>
        {b.crm && <DropdownMenuItem onSelect={() => toast(`Pulling changes from ${b.crm}.`)}>Sync from {b.crm} now</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
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
    />
  )

  const sortHeader = (c: ColumnDef) => {
    const on = sort?.key === c.key
    return (
      <button
        type="button"
        className="flex items-center gap-1 rounded px-1 py-0.5 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
    return (
      <div className="p-10">
        <EmptyState
          title="No people yet."
          body="Find them in the database, or bring a CSV you already have."
          action={<div className="flex gap-2">{addPeople}</div>}
        />
      </div>
    )
  }

  const pad = density === "Compact" ? "py-1" : "py-2"

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* --------------------------------------------------------------------------- 1. header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 lg:px-6">
        <h2 className="text-lg font-semibold">
          People <span className="font-normal tabular-nums text-muted-foreground">· {total.toLocaleString()}</span>
        </h2>
        <div data-print-hide>{addPeople}</div>
      </div>

      {/* ---------------------------------------------------------------------- 2. the views row */}
      <div className="flex flex-wrap items-center gap-2 px-4 pt-3 lg:px-6" data-print-hide>
        {d.level("people.views.saved") === 1 && views
          .filter((v) => v.defaultFor.includes(session.role) || v.owner === session.user || (v.shipped && d.level("people.views.needs-enrichment") === 1))
          .slice(0, 4)
          .map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={viewId === v.id}
              onClick={() => openView(v)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                viewId === v.id ? "border-foreground bg-foreground text-background" : "hover:bg-muted",
              )}
            >
              {v.name}
              {v.shipped && <span className="ml-1 tabular-nums opacity-70">{allRows.filter(needsEnrichment).length.toLocaleString()}</span>}
              {viewId === v.id && edited && <span className="ml-1 opacity-80">· edited</span>}
            </button>
          ))}

        <ViewsDoor
          views={views}
          viewId={viewId}
          user={session.user}
          onOpen={openView}
          onSave={(name) => { toast(`View saved · ${name}`); setViewId(null) }}
          onAction={(what, v) => toast(`${v.name} · ${what}`)}
        />

        {edited && view && (
          <span className="flex items-center gap-1 text-xs">
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => toast(`${view.name} saved with the filters you are looking at.`)}>Save</Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setActive(view.filters)}>Revert</Button>
          </span>
        )}
      </div>

      {/* --------------------------------------------------------------------- 3. the filter bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 lg:px-6" data-print-hide>
        <Input
          ref={searchRef}
          aria-label="Search people by name, title, company or email"
          placeholder="Search  /"
          className="h-8 w-56"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
        />

        {/* Level one for this seat, and any level-two filter that is active: a hidden cause is not allowed. */}
        <span className="hidden flex-wrap items-center gap-2 md:flex">
          {[...chipFilters, ...activeElsewhere].map((f) => (
            <FilterChip
              key={f.id}
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
          ))}
        </span>

        {/* The one door that holds every filter, flat. On a phone it opens as a full-height sheet. */}
        <button
          type="button"
          aria-expanded={panelOpen || pinned}
          onClick={() => (window.matchMedia("(max-width: 767px)").matches ? setPhoneFilters(true) : setPanelOpen(!panelOpen))}
          className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ChevronDown aria-hidden="true" className={cn("size-3 transition-transform", (panelOpen || pinned) && "rotate-180")} />
          <span className="md:hidden">Filters{activeCount ? ` · ${activeCount} active` : ""}</span>
          <span className="hidden md:inline">All filters ({defs.length}){activeElsewhere.length ? ` · ${activeElsewhere.length} more active` : ""}</span>
        </button>

        {(activeCount > 0 || q) && (
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={clearAll}>Clear</Button>
        )}

        <span className="ml-auto flex items-center gap-3">
          <span role="status" aria-live="polite" className={cn("tabular-nums text-xs", settling ? "text-muted-foreground/60" : "text-muted-foreground")}>
            {settling ? "…" : `${sorted.length.toLocaleString()} of ${total.toLocaleString()}`}
          </span>
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
        </span>
      </div>

      {/* The filters that produced these rows, on the printed page and nowhere else. */}
      <p className="hidden px-6 pb-2 text-xs print:block">
        {activeCount === 0 && !q ? "No filters" : [q && `Search: ${q}`, ...defs.filter((f) => active[f.id]?.length).map((f) => chipLabel(f, active[f.id]))].filter(Boolean).join(" · ")}
      </p>

      {/* ----------------------------------------------------------------- 4. the selection bar */}
      {count > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-y bg-muted/50 px-4 py-2 lg:px-6" data-print-hide>
          <span className="text-sm font-medium tabular-nums">{count.toLocaleString()} selected</span>
          {!allMatching && sorted.length > selected.length && (
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setAllMatching(true)}>
              Select all {sorted.length.toLocaleString()} matching
            </Button>
          )}
          {allMatching && (
            /* One changes the meaning of the other, so they sit together and restate the result. */
            <span className="flex items-center gap-1.5 text-xs">
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
          <span className="flex flex-wrap items-center gap-1.5">
            {bulkButtons.map((a) => (
              <Button key={a.id} size="sm" className="h-7 px-2 text-xs" onClick={a.run}>{a.label(count)}</Button>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                  Edit or export selected <ChevronDown aria-hidden="true" className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {usableBulk.filter((a) => !a.destructive).map((a) => (
                  <DropdownMenuItem key={a.id} onSelect={a.run}>{a.label(count)}</DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {usableBulk.filter((a) => a.destructive).map((a) => (
                  <DropdownMenuItem key={a.id} className="text-destructive" onSelect={a.run}>{a.label(count)}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setSelected([]); setAllMatching(false) }}>Clear selection</Button>
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------------------- 5. the table */}
      <div className="flex min-h-0 flex-1">
        {(panelOpen || pinned) && (
          <FiltersPanelFrame
            title={`All filters (${defs.length})`}
            pinned={pinned}
            onPin={setPinned}
            onClose={() => { setPanelOpen(false); setPinned(false) }}
          >
            {filtersBody}
          </FiltersPanelFrame>
        )}

        <div className="min-w-0 flex-1 overflow-auto border-t">
          {/* Phone: the same items as cards, no level change. */}
          <ul className="divide-y md:hidden">
            {selectMode && <li className="px-4 py-2 text-xs text-muted-foreground">Tap a row to select it.</li>}
            {page.map((p, i) => (
              <li key={p.id} className="px-4 py-3">
                <div className="flex items-start gap-2">
                  {selectMode && (
                    <input
                      type="checkbox"
                      aria-label={`Select ${p.name}`}
                      className="mt-1"
                      checked={selected.includes(p.id) || allMatching}
                      onChange={() => toggleRow(p, i, false)}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <a className="font-medium underline-offset-4 hover:underline" href={href(`/ollopa/people/${p.id}`)}>{p.name}</a>
                    <div className="text-xs text-muted-foreground">{p.title} · {p.company}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="secondary" className={STAGE_TONE[stageOf(p)]}>{stageOf(p)}</Badge>
                      <span className="text-muted-foreground">{seqOf(p) || "Not in a sequence"}</span>
                      <span className="text-muted-foreground">{p.lastContacted ? day(p.lastContacted) : "Never contacted"}</span>
                      {p.phone && !isRevealed(p) && (
                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => reveal(p)}>
                          Reveal · {CREDITS.revealPhone} credits{priceState(CREDITS.revealPhone).suffix}
                        </Button>
                      )}
                    </div>
                  </div>
                  <RowMenu p={p} acts={usable} onGlance={() => setGlancing(p)} />
                </div>
              </li>
            ))}
          </ul>

          <table className="hidden w-full caption-bottom text-sm md:table">
            <thead className="sticky top-0 z-10 bg-background">
              <tr className="border-b">
                <th scope="col" className="w-8 px-3">
                  <input
                    type="checkbox"
                    aria-label={`Select the ${page.length} people on this page`}
                    checked={page.length > 0 && page.every((p) => selected.includes(p.id))}
                    onChange={(e) => setSelected(e.target.checked ? page.map((p) => p.id) : [])}
                  />
                </th>
                {shownColumns.map((c) => (
                  <th
                    key={c.id}
                    scope="col"
                    aria-sort={sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                    className={cn("h-9 px-2 text-left align-middle text-xs font-medium text-muted-foreground", c.className)}
                  >
                    {sortHeader(c)}
                  </th>
                ))}
                <th scope="col" className="sticky right-0 w-px border-l bg-background px-2"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {page.map((p, i) => (
                <tr
                  key={p.id}
                  ref={(el) => { rowRefs.current[i] = el }}
                  data-row={i}
                  tabIndex={i === focused ? 0 : -1}
                  aria-label={density === "Compact" ? `${p.name}, ${p.title}, ${p.company}` : undefined}
                  onFocus={() => setFocused(i)}
                  onKeyDown={(e) => onRowKey(e, p, i)}
                  onClick={(e) => { if ((e.target as HTMLElement).closest("a,button,input,[role=menuitem]")) return; rowRefs.current[i]?.focus(); setGlancing(p) }}
                  className={cn("group cursor-pointer border-b hover:bg-muted/40 focus-visible:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring", selected.includes(p.id) && "bg-muted/60")}
                >
                  <td className={cn("px-3", pad)}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${p.name}`}
                      checked={selected.includes(p.id) || allMatching}
                      onChange={() => toggleRow(p, i, false)}
                      onClick={(e) => { e.stopPropagation(); if (e.shiftKey) toggleRow(p, i, true) }}
                    />
                  </td>
                  {shownColumns.map((c) => (
                    <td key={c.id} className={cn("px-2 align-middle", pad, c.className)}>
                      <div className={c.width}>
                      {c.key === "name" ? (
                        <span className="flex min-w-0 items-center gap-2">
                          <a className="min-w-0 underline-offset-4 hover:underline" href={href(`/ollopa/people/${p.id}`)} onClick={(e) => e.stopPropagation()}>
                            {c.cell(p)}
                          </a>
                          {p.jobChange && d.weekly("people.job-change-update") > 0 && <JobChange p={p} onDone={(m) => offerUndo(m, () => toast("Put back as it was."))} seed={seed} />}
                        </span>
                      ) : c.key === "stage" ? (
                        <StagePicker value={stageOf(p)} inSequence={Boolean(seqOf(p))} onChange={(s) => moveStage(p, s)} />
                      ) : c.key === "sequence" ? (
                        seqOf(p) || <span className="text-muted-foreground">—</span>
                      ) : c.key === "phone" ? (
                        isRevealed(p) ? <span className="tabular-nums">{p.phoneNumber ?? "On file"}</span>
                          : p.phone ? (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); reveal(p) }}>
                              Reveal · {CREDITS.revealPhone} credits{priceState(CREDITS.revealPhone).suffix}
                            </Button>
                          ) : <span className="text-muted-foreground">No phone</span>
                      ) : c.cell(p)}
                      </div>
                    </td>
                  ))}
                  {/* The menu is always in the row; the named buttons come forward on hover and on
                      keyboard focus, over the row rather than taking a column's width from it. */}
                  <td className={cn("sticky right-0 w-10 border-l bg-background px-2 group-hover:bg-muted", pad)} onClick={(e) => e.stopPropagation()}>
                    <div className="relative flex items-center justify-end">
                      <div className="absolute right-7 flex items-center gap-1 rounded-md bg-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        {rowButtons.map((a) => (
                          <Button key={a.id} size="sm" variant="ghost" className="h-7 whitespace-nowrap px-2 text-xs" onClick={() => a.run(p)}>
                            {a.icon && <a.icon aria-hidden="true" className="size-3.5" />}{a.label(p)}
                          </Button>
                        ))}
                      </div>
                      <RowMenu p={p} acts={usable} onGlance={() => setGlancing(p)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sorted.length === 0 && <NoResults defs={defs} active={active} lastChip={lastChip} counts={counts} onDrop={(id) => setFilter(id, [])} onClear={clearAll} />}

          {/* ------------------------------------------------------------------- 6. the footer */}
          <div className="flex flex-wrap items-center justify-center gap-4 border-t px-4 py-3" data-print-hide>
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
            <Button size="sm" variant="ghost" className="text-xs md:hidden" onClick={() => setSelectMode((v) => !v)}>
              {selectMode ? "Done selecting" : "Select"}
            </Button>
          </div>
        </div>
      </div>

      {pending && (
        <div role="status" aria-live="assertive" className="flex items-center gap-3 border-t bg-muted/60 px-4 py-2 text-sm lg:px-6" data-print-hide>
          <span className="min-w-0 flex-1">{pending.text}</span>
          <Button size="sm" className="h-7 px-2 text-xs" onClick={() => { pending.run(); setPending(null) }}>Spend</Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setPending(null)}>Cancel</Button>
        </div>
      )}

      {/* Undo, for ten seconds, on anything undoable. ⌘Z does the same. */}
      {undo && (
        <div role="status" aria-live="polite" className="flex items-center gap-3 border-t bg-muted/60 px-4 py-2 text-sm lg:px-6" data-print-hide>
          <span className="min-w-0 flex-1">{undo.text}</span>
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { undo.run(); setUndo(null) }}>Undo</Button>
        </div>
      )}

      {glancing && (
        <QuickLook
          open
          /* Closing the drawer puts the keyboard back where it was: on the row it was opened from. */
          onOpenChange={(o) => { if (!o) { setGlancing(null); window.setTimeout(() => (document.querySelector(`tr[data-row="${focused}"]`) as HTMLElement | null)?.focus(), 220) } }}
          title={glancing.name}
          fields={glanceFields(glancing, seed).map((f) => ({ label: f.label, value: f.label === "Stage" ? stageOf(glancing) : f.value }))}
          editable={{ label: "Stage", value: stageOf(glancing), options: [...STAGES], onChange: (v) => moveStage(glancing, v as ContactStage) }}
          onOpen={() => { const id = glancing.id; setGlancing(null); navigate(`/ollopa/people/${id}`) }}
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
    </div>
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
function RowMenu({ p, acts, onGlance }: {
  p: PersonRow
  acts: { id: string; label: (p: PersonRow) => string; shortcut?: string; run: (p: PersonRow) => void; destructive?: boolean }[]
  onGlance: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="size-7" aria-label={`Actions for ${p.name}`}>
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onSelect={onGlance}>Quick look<span className="ml-auto font-mono text-xs text-muted-foreground">Enter</span></DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate(`/ollopa/people/${p.id}`)}>Open the full record<span className="ml-auto font-mono text-xs text-muted-foreground">o</span></DropdownMenuItem>
        <DropdownMenuSeparator />
        {acts.filter((a) => !a.destructive).map((a) => (
          <DropdownMenuItem key={a.id} onSelect={() => a.run(p)}>
            {a.label(p)}
            {a.shortcut && <span className="ml-auto font-mono text-xs text-muted-foreground">{a.shortcut}</span>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {acts.filter((a) => a.destructive).map((a) => (
          <DropdownMenuItem key={a.id} className="text-destructive" onSelect={() => a.run(p)}>{a.label(p)}</DropdownMenuItem>
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
        <SelectValue />
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
        <button
          type="button"
          aria-expanded={open}
          className="shrink-0 rounded-full border border-amber-400 px-1.5 py-0.5 text-[11px] text-amber-800 dark:border-amber-700 dark:text-amber-300"
          onClick={(e) => e.stopPropagation()}
        >
          Changed job
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 text-sm" onClick={(e) => e.stopPropagation()}>
        <p className="pb-2">{line}</p>
        <div className="space-y-2">
          <Button size="sm" className="w-full justify-start" onClick={() => { setOpen(false); onDone(`${p.name} updated to ${co?.name ?? "the new employer"}. History, notes and owner kept; taken out of any sequence aimed at ${p.jobChange!.previousCompany}.`) }}>
            Update this record
          </Button>
          <p className="text-xs text-muted-foreground">Keeps the history, the notes and the owner; changes company, title and email, and takes them out of any sequence aimed at {p.jobChange.previousCompany}.</p>
          <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => { setOpen(false); onDone(`New contact started for ${p.name} at ${co?.name ?? "the new employer"}. This record stays at ${p.jobChange!.previousCompany}.`) }}>
            Create a new contact
          </Button>
          <p className="text-xs text-muted-foreground">Leaves this record as it was, at {p.jobChange.previousCompany}, and starts a new one.</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** "All views (n)": mine, shared, the shipped one, a search, and the name field that saves this one. */
function ViewsDoor({ views, viewId, user, onOpen, onSave, onAction }: {
  views: PeopleView[]
  viewId: string | null
  user: string
  onOpen: (v: PeopleView) => void
  onSave: (name: string) => void
  onAction: (what: string, v: PeopleView) => void
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
              <span className="font-mono text-xs text-muted-foreground">{views.indexOf(v) < 9 ? views.indexOf(v) + 1 : ""}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ChevronDown aria-hidden="true" className={cn("size-3 transition-transform", open && "rotate-180")} />
          All views ({views.length})
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <Input aria-label="Search views" placeholder="Search views" className="h-8" value={q} onChange={(e) => setQ(e.target.value)} />
        {group("Mine", mine)}
        {group("Shared with everyone", shared)}
        <div className="mt-3 border-t pt-3">
          <label htmlFor="save-view" className="text-xs text-muted-foreground">Save the filters you are looking at</label>
          <div className="mt-1 flex gap-1.5">
            <Input id="save-view" className="h-8" placeholder="Name this view" value={name} onChange={(e) => setName(e.target.value)} />
            <Button size="sm" disabled={!name.trim()} onClick={() => { onSave(name.trim()); setName(""); setOpen(false) }}>Save</Button>
          </div>
        </div>
        {current && (
          <div className="mt-3 border-t pt-3">
            <h4 className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{current.name}</h4>
            <div className="flex flex-wrap gap-1">
              {["Set as my default", "Rename", "Share with everyone", "Email me daily", "Email me weekly", "Copy a link", "Delete"].map((what) => (
                <Button key={what} size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { onAction(what.toLowerCase(), current); setOpen(false) }}>
                  {what}
                </Button>
              ))}
            </div>
          </div>
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
        <button
          type="button"
          aria-expanded={open}
          className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ChevronDown aria-hidden="true" className={cn("size-3 transition-transform", open && "rotate-180")} />
          Columns and density · {shownIds.length} of {all.length}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
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
                  <span aria-hidden="true" className={cn("size-3.5 shrink-0 rounded-sm border", on && "border-foreground bg-foreground")} />
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
        <div className="mt-3 space-y-2 border-t pt-3">
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={onReset}>Reset to the {roleLabel} default</Button>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Density</span>
            {(["Comfortable", "Compact"] as const).map((v) => (
              <Button key={v} size="sm" variant={density === v ? "secondary" : "ghost"} aria-pressed={density === v} className="h-7 px-2 text-xs" onClick={() => onDensity(v)}>{v}</Button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Rows per page</span>
            {[25, 50, 100].map((n) => (
              <Button key={n} size="sm" variant={pageSize === n ? "secondary" : "ghost"} aria-pressed={pageSize === n} className="h-7 px-2 text-xs" onClick={() => onPageSize(n)}>{n}</Button>
            ))}
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
