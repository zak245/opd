// The table both entry tables into one object are built from: Companies and Accounts.
//
// `templates/TablePage` is the shared table and stays the primitives builder's; it does not yet carry
// the sortable headers, the columns popover, the bulk bar, the in-place filter door or the row door
// that specs/03 §8 and specs/11 §3 name, so those live here until it does. Everything else is the
// same contract: a row opens a flat quick look, the name opens the record, row actions are visible on
// hover AND on focus AND in the row's named menu, and every door says what it holds with a count.
//
// The page decides what is level one; this file only lays it out.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { MoreHorizontal, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Door } from "../../ui/Door"
import { IndexPage, SummaryStrip, type SummaryFigure } from "../../layouts"
import { FilterBar, FilterEmpty, type DoorItem, type FilterControl } from "../../layouts/filters"
import type { BesideTarget } from "../../beside"
import { EmptyState } from "../../ui/EmptyState"
import { QuickLook, type QuickLookEditable, type QuickLookField } from "../../templates/QuickLook"
import { type ColumnPriority } from "../../layouts/columns"

/* ------------------------------------------------------------------------------------- the parts */

export interface Col<T> {
  /** The usage item id, so the page can ask the model where the column belongs. */
  id: string
  header: string
  cell: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  className?: string
  /** Stays on screen at phone width. Nothing one level deep on desktop becomes two on the phone. */
  phone?: boolean
  /** The identifying column: always shown, never removable in the columns popover. */
  always?: boolean
  /**
   * How hard this column fights for its place (LAYOUTS.md §5): 1 is drawn at every width, 2 from
   * 1280, 3 from 1536. What leaves the table joins the row's meta line under the name — it is not
   * removed, and the columns popover still lists it. Unset means 2.
   */
  priority?: ColumnPriority
}

export interface FilterDef<T> {
  id: string
  /** The word that goes in the door's label: "owner", "location", "signals". */
  name: string
  label: string
  options: string[]
  get: (row: T) => string
}

export interface RowAction<T> { id: string; label: (row: T) => string; icon?: LucideIcon; onClick: (row: T) => void }
export interface MenuAction<T> { id: string; label: (row: T) => string; onClick: (row: T) => void; destructive?: boolean }
export interface BulkAction<T> { label: string; onClick: (rows: T[]) => void; destructive?: boolean }

export interface RowDoorSpec<T> {
  id: (row: T) => string
  /** Null removes the door for this row: a door that opens onto nothing is worse than no door. */
  label: (row: T) => string | null
  count: (row: T) => number
  content: (row: T) => ReactNode
}

export interface QuickLookSpec<T> {
  title: (row: T) => string
  fields: (row: T) => QuickLookField[]
  editable?: (row: T) => QuickLookEditable | undefined
  onOpen: (row: T) => void
}

export interface DataTableProps<T> {
  /** The family whose icon and ink the page header wears. */
  family: string
  title: string
  total?: number
  rows: T[]
  rowKey: (row: T) => string
  searchText: (row: T) => string
  searchHint?: string
  /** The numbers this page is judged by, as one band above the card. */
  figures?: SummaryFigure[]
  /** Sections above the table: a hand-off waiting, a notice, a confirmation. Never filters. */
  above?: ReactNode
  /** A control this page has that is not a column filter — the renewal windows on Accounts. */
  extraControls?: FilterControl[]
  /** One line under the card: the sentence naming who can do what this seat cannot (rule 4). */
  below?: ReactNode
  /** Level-one filters, as visible selects beside the search box. */
  chips: FilterDef<T>[]
  /** Level-two filters, behind one door named by what is inside it. */
  doorFilters: FilterDef<T>[]
  columns: Col<T>[]
  /** Every column this table can show, in table order, for the columns popover. */
  allColumns: Col<T>[]
  onColumnsChange: (ids: string[]) => void
  sort: { id: string; dir: "asc" | "desc" }
  onSortChange: (sort: { id: string; dir: "asc" | "desc" }) => void
  filters: Record<string, string>
  onFiltersChange: (filters: Record<string, string>) => void
  primary?: { label: string; onClick: () => void }
  /** Page actions under level one for this seat, in one menu named by its contents. */
  pageMenu?: { label: string; items: { label: string; onClick: () => void }[] }
  views?: ReactNode
  rowActions: RowAction<T>[]
  menuActions: MenuAction<T>[]
  /** The "…" button's accessible name, which is the list of what it holds. */
  menuLabel: (row: T) => string
  rowDoor?: RowDoorSpec<T>
  bulk?: BulkAction<T>[]
  quickLook: QuickLookSpec<T>
  /** Single keys handled on the focused row, e.g. f, l, r on Companies. */
  rowKeys?: Record<string, (row: T) => void>
  /** Companies: Space glances, Enter opens the record. Accounts: Enter glances, `o` opens it. */
  enterOpensRecord?: boolean
  empty: { title: string; body: string; action?: ReactNode }
  /** Below the first cell at phone width: the fields the phone layout folds into the row. */
  phoneSummary?: (row: T) => ReactNode
  pageSize?: number
  /** What this page is a list of, so the count says what it counts: "companies", "accounts". */
  noun?: string
  /**
   * What a plain click on the row's name opens beside the list. The template intercepts the click
   * and adds the list and this row's place in it, so `[` and `]` walk the rows as shown.
   */
  beside?: (row: T) => BesideTarget | null
}

/* ------------------------------------------------------------------------------------- the table */

export function DataTable<T>(p: DataTableProps<T>) {
  const [q, setQ] = useState("")
  const [limit, setLimit] = useState(p.pageSize ?? 25)
  const [glancing, setGlancing] = useState<T | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [allMatching, setAllMatching] = useState(false)
  const search = useRef<HTMLInputElement>(null)
  const body = useRef<HTMLTableSectionElement>(null)
  /** The row the drawer was opened from, so Escape puts focus back where it was. */
  const cameFrom = useRef<HTMLElement | null>(null)

  const setFilter = (id: string, value: string) => p.onFiltersChange({ ...p.filters, [id]: value })

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const out = p.rows.filter((r) => {
      if (needle && !p.searchText(r).toLowerCase().includes(needle)) return false
      for (const f of [...p.chips, ...p.doorFilters]) {
        const v = p.filters[f.id]
        if (v && v !== "all" && f.get(r) !== v) return false
      }
      return true
    })
    const col = p.allColumns.find((c) => c.id === p.sort.id)
    if (col?.sortValue) {
      const dir = p.sort.dir === "asc" ? 1 : -1
      out.sort((a, b) => {
        const x = col.sortValue!(a), y = col.sortValue!(b)
        return (x < y ? -1 : x > y ? 1 : 0) * dir
      })
    }
    return out
  }, [p, q])

  const shown = rows.slice(0, limit)
  const selectedRows = allMatching ? rows : rows.filter((r) => selected.includes(p.rowKey(r)))
  const pageSelected = shown.length > 0 && shown.every((r) => selected.includes(p.rowKey(r)))
  const hasBulk = Boolean(p.bulk?.length)

  const clearSelection = useCallback(() => { setSelected([]); setAllMatching(false) }, [])

  /* Keyboard: "/" to search, arrows to move the row focus, and the page's own single keys on the
     focused row. Never while typing; every one of them is also a visible control. */
  const focusRow = useCallback((delta: number) => {
    const all = Array.from(body.current?.querySelectorAll<HTMLTableRowElement>("tr[data-row]") ?? [])
    if (all.length === 0) return
    const at = all.findIndex((el) => el === document.activeElement || el.contains(document.activeElement))
    const to = at < 0 ? 0 : Math.min(Math.max(at + delta, 0), all.length - 1)
    all[to]?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return
      if (e.key === "/") { e.preventDefault(); search.current?.focus(); return }
      if (e.key === "Escape" && (selected.length > 0 || allMatching)) { e.preventDefault(); clearSelection(); return }
      if (e.key === "ArrowDown") { e.preventDefault(); focusRow(1); return }
      if (e.key === "ArrowUp") { e.preventDefault(); focusRow(-1) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [allMatching, clearSelection, focusRow, selected.length])

  // j and k walk the table with the drawer open, so a scan does not need the mouse.
  useEffect(() => {
    if (!glancing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "j" && e.key !== "k") return
      const at = rows.findIndex((r) => p.rowKey(r) === p.rowKey(glancing))
      const to = Math.min(Math.max(at + (e.key === "j" ? 1 : -1), 0), rows.length - 1)
      if (rows[to]) { e.preventDefault(); setGlancing(rows[to]) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [glancing, rows, p])

  /** What applies to the selection. It replaces the pager while a selection stands. */
  const bulkBar = (
    <>
      <span className="t-label tabular-nums">
        {allMatching ? `All ${rows.length.toLocaleString()} matching selected` : `${selected.length} selected`}
      </span>
      {!allMatching && pageSelected && rows.length > shown.length && (
        <Button size="sm" variant="ghost" onClick={() => setAllMatching(true)}>
          Select all {rows.length.toLocaleString()} matching
        </Button>
      )}
      {(p.bulk ?? []).map((a) => (
        <Button key={a.label} size="sm" variant={a.destructive ? "ghost" : "outline"}
          className={cn(a.destructive && "text-destructive hover:text-destructive")}
          onClick={() => { a.onClick(selectedRows); clearSelection() }}>
          {a.label}
        </Button>
      ))}
      <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
    </>
  )

  /* ------------------------------------------------------------------------------ the toolbar */

  /**
   * One filtering pattern, from `layouts/filters`: the search, the seat's named filters, one door,
   * one count and one applied line. Each filter carries its own value and its own "clear", so it
   * is dropped from its own chip rather than from a stray "×" beside it. The page still decides
   * which filters its seat reads weekly; the part decides how many fit on the row.
   */
  const filterControls: FilterControl[] = [...p.chips, ...p.doorFilters].map((f) => {
    const on = p.filters[f.id] && p.filters[f.id] !== "all" ? p.filters[f.id] : undefined
    return {
      name: f.label,
      value: on,
      onClear: () => setFilter(f.id, "all"),
      node: (
        <Select value={p.filters[f.id] ?? "all"} onValueChange={(v) => setFilter(f.id, v)}>
          <SelectTrigger className="h-8 w-auto min-w-36" aria-label={f.label}><SelectValue placeholder={f.label} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{f.label}: all</SelectItem>
            {f.options.filter(Boolean).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      ),
    }
  })

  const sortable = p.allColumns.filter((c) => c.sortValue)

  const behind: DoorItem[] = [
    ...(p.views ? [{ name: "Saved views", group: "views" as const, node: p.views }] : []),
    // The columns control is not a filter, so it is the door's own "Columns and density" group.
    { name: "Columns", group: "columns", node: <ColumnsPopover columns={p.allColumns} chosen={p.columns.map((c) => c.id)} onChange={p.onColumnsChange} /> },
    // Sorting has no place of its own in the index contract, so it sits with the columns: both
    // are the table's shape rather than which rows it holds.
    ...(sortable.length > 0 ? [{
      name: "Sort", group: "columns" as const,
      node: (
        <span className="flex items-center gap-1">
          <Select value={p.sort.id} onValueChange={(v) => p.onSortChange({ id: v, dir: p.sort.dir })}>
            <SelectTrigger className="h-8 w-auto min-w-40" aria-label="Sort by"><SelectValue /></SelectTrigger>
            <SelectContent>{sortable.map((c) => <SelectItem key={c.id} value={c.id}>{c.header}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline"
                  aria-label={p.sort.dir === "asc" ? "Sorted first to last. Reverse it." : "Sorted last to first. Reverse it."}
                  onClick={() => p.onSortChange({ id: p.sort.id, dir: p.sort.dir === "asc" ? "desc" : "asc" })}>
            {p.sort.dir === "asc" ? "First to last" : "Last to first"}
          </Button>
        </span>
      ),
    }] : []),
  ]

  const clearAll = () => { setQ(""); p.onFiltersChange({}) }
  const appliedControls = [...(p.extraControls ?? []), ...filterControls].filter((c) => c.value)

  const toolbar = (
    <FilterBar
      doorId={p.family}
      searchNode={(
        <Input
          ref={search}
          type="search"
          aria-label={p.searchHint ?? "Search"}
          placeholder={p.searchHint ?? "Search"}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-8 w-56"
        />
      )}
      controls={[...(p.extraControls ?? []), ...filterControls]}
      behind={behind}
      count={{ shown: rows.length, total: p.total ?? p.rows.length, noun: p.noun ?? "rows" }}
      onClearAll={clearAll}
    />
  )

  /* -------------------------------------------------------------------------------- the rows */

  /** Everything the row's "…" holds, in the order the rules put it: look, act, then destructive. */
  const rowMenu = (r: T) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="size-7" aria-label={p.menuLabel(r)}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-xs">
        <DropdownMenuItem onSelect={(e) => { cameFrom.current = (e.currentTarget as HTMLElement).closest("tr") as HTMLElement ?? null; setGlancing(r) }}>Look beside the list</DropdownMenuItem>
        {/* The name opens the pane, so the page keeps an explicit route of its own. */}
        <DropdownMenuItem onSelect={() => p.quickLook.onOpen(r)}>Open the page</DropdownMenuItem>
        {p.rowActions.map((a) => <DropdownMenuItem key={a.id} onSelect={() => a.onClick(r)}>{a.label(r)}</DropdownMenuItem>)}
        {p.menuActions.some((a) => !a.destructive) && <DropdownMenuSeparator />}
        {p.menuActions.filter((a) => !a.destructive).map((a) => (
          <DropdownMenuItem key={a.id} onSelect={() => a.onClick(r)}>{a.label(r)}</DropdownMenuItem>
        ))}
        {p.menuActions.some((a) => a.destructive) && <DropdownMenuSeparator />}
        {p.menuActions.filter((a) => a.destructive).map((a) => (
          <DropdownMenuItem key={a.id} onSelect={() => a.onClick(r)} className="whitespace-normal text-destructive">
            {a.label(r)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  /**
   * The row's own name, its phone summary and its row acts. The template draws the cell; this
   * decides what is in it. The acts are in the DOM at all times and change opacity, never
   * presence, so a keyboard reaches them and a seat with four does not widen the table.
   */
  const rowName = (r: T) => {
    const door = p.rowDoor?.label(r) ?? null
    return (
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex min-w-0 items-start gap-2">
          {/* Beside, not instead: the template intercepts a plain click on the name and opens the
              row beside the list (BUILD-CHAINS.md, mechanic 1). The cell only draws the link. */}
          <span className="min-w-0">{p.columns[0]?.cell(r)}</span>
          {/* LAYOUTS.md §4: the primary act and the "…" are visible at rest. The rest of the acts
              are in the "…", where they already are — a row that carries four of them inline is a
              second line, and the index contract has no place of its own for row acts. */}
          {p.rowActions.slice(0, 1).map((a) => (
            <Button key={a.id} size="sm" variant="ghost" className="shrink-0" onClick={(e) => { e.stopPropagation(); a.onClick(r) }}>
              {a.icon && <a.icon className="size-3.5" aria-hidden="true" />}
              {a.label(r)}
            </Button>
          ))}
        </span>
        {/* No phone summary: the folded columns say the same facts with their labels on, at every
            width, through the template's own meta line. Two lines saying it twice is the wall of
            text the owner objected to. */}
        {/* The row's own door. The index contract has no per-row door, so it opens under the
            row's name rather than as a sub-row of its own. */}
        {door && p.rowDoor && (
          <span className="block" onClick={(e) => e.stopPropagation()}>
            <Door id={p.rowDoor.id(r)} label={door} count={p.rowDoor.count(r)}>{p.rowDoor.content(r)}</Door>
          </span>
        )}
      </span>
    )
  }

  return (
    <>
    <IndexPage<T>
      family={p.family}
      title={p.title}
      count={p.total ?? p.rows.length}
      actions={p.primary ? [{ kind: "primary", label: p.primary.label, onClick: p.primary.onClick }] : []}
      more={(p.pageMenu?.items ?? []).map((i) => ({ kind: "secondary" as const, label: i.label, onClick: i.onClick }))}
      toolbar={toolbar}
      above={
        <>
          {p.figures?.length ? <SummaryStrip figures={p.figures} /> : null}
          {p.above}
        </>
      }
      beside={p.beside}
      columns={p.columns.slice(1).map((c) => ({ key: c.id, header: c.header, cell: c.cell, priority: c.priority }))}
      rows={shown}
      rowKey={p.rowKey}
      name={rowName}
      menu={rowMenu}
      rowProps={(r) => ({
        "data-row": true,
        "data-item": p.rowKey(r),
        tabIndex: 0,
        className: "group cursor-pointer align-top",
        onClick: (e: React.MouseEvent<HTMLTableRowElement>) => { const el = e.currentTarget as HTMLElement; el.focus(); cameFrom.current = el; setGlancing(r) },
        onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => {
          if (e.target !== e.currentTarget) return
          const handler = p.rowKeys?.[e.key]
          if (handler) { e.preventDefault(); handler(r); return }
          if (p.enterOpensRecord && e.key === "Enter") { e.preventDefault(); p.quickLook.onOpen(r); return }
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cameFrom.current = e.currentTarget as HTMLElement; setGlancing(r) }
        },
      })}
      bulk={hasBulk ? { selected, onChange: setSelected, bar: bulkBar } : undefined}
      pager={rows.length > limit ? (
        <Button variant="outline" size="sm" onClick={() => setLimit((l) => l + (p.pageSize ?? 25))}>
          Show {Math.min(p.pageSize ?? 25, rows.length - limit)} more
        </Button>
      ) : undefined}
      empty={
        q || appliedControls.length > 0
          ? <FilterEmpty noun={p.noun ?? "rows"} applied={appliedControls} onClearAll={clearAll} />
          : <EmptyState title={p.empty.title} body={p.empty.body} action={p.empty.action} />
      }
    />
    {p.below}
    {glancing && (
      <QuickLook
        open
        onOpenChange={(o) => {
          if (o) return
          setGlancing(null)
          // The drawer's own close puts focus on the body; the row it was opened from gets it back.
          const row = cameFrom.current
          requestAnimationFrame(() => requestAnimationFrame(() => row?.focus()))
        }}
        title={p.quickLook.title(glancing)}
        fields={p.quickLook.fields(glancing)}
        editable={p.quickLook.editable?.(glancing)}
        onOpen={() => { const row = glancing; setGlancing(null); p.quickLook.onOpen(row) }}
      />
    )}
    </>
  )
}

/** "Columns: 7 of 19" — a checkbox list in table order; the identifying column cannot be removed. */
function ColumnsPopover<T>({ columns, chosen, onChange }: { columns: Col<T>[]; chosen: string[]; onChange: (ids: string[]) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">Columns: {chosen.length} of {columns.length}</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-80 w-64 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {columns.map((c) => (
            <li key={c.id}>
              <label className="flex cursor-pointer items-center gap-2 px-1.5 py-1 t-body hover:bg-muted">
                <Checkbox
                  checked={chosen.includes(c.id)}
                  disabled={c.always}
                  onCheckedChange={(v) => onChange(v ? [...chosen, c.id] : chosen.filter((x) => x !== c.id))}
                />
                {c.header}
              </label>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
