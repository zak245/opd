// The table both entry tables into one object are built from: Companies and Accounts.
//
// `templates/TablePage` is the shared table and stays the primitives builder's; it does not yet carry
// the sortable headers, the columns popover, the bulk bar, the in-place filter door or the row door
// that specs/03 §8 and specs/11 §3 name, so those live here until it does. Everything else is the
// same contract: a row opens a flat quick look, the name opens the record, row actions are visible on
// hover AND on focus AND in the row's named menu, and every door says what it holds with a count.
//
// The page decides what is level one; this file only lays it out.
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { MoreHorizontal, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Door } from "../../ui/Door"
import { EmptyState } from "../../ui/EmptyState"
import { QuickLook, type QuickLookEditable, type QuickLookField } from "../../templates/QuickLook"

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
  title: string
  total?: number
  rows: T[]
  rowKey: (row: T) => string
  searchText: (row: T) => string
  searchHint?: string
  /** Above the filter row: the renewal counters and the hand-off strip. */
  strip?: ReactNode
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
  const activeFilters = [...p.chips, ...p.doorFilters].filter((f) => p.filters[f.id] && p.filters[f.id] !== "all")
  const doorActive = p.doorFilters.filter((f) => p.filters[f.id] && p.filters[f.id] !== "all").length

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

  const header = (col: Col<T>) => {
    const sorted = p.sort.id === col.id
    return (
      <TableHead
        key={col.id}
        aria-sort={sorted ? (p.sort.dir === "asc" ? "ascending" : "descending") : "none"}
        className={cn("align-bottom", col.className, !col.phone && "hidden md:table-cell")}
      >
        {col.sortValue ? (
          <button
            type="button"
            className="inline-flex items-start gap-1 rounded text-left hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={() => p.onSortChange({ id: col.id, dir: sorted && p.sort.dir === "asc" ? "desc" : "asc" })}
          >
            {col.header}
            <span aria-hidden="true" className="text-muted-foreground">{sorted ? (p.sort.dir === "asc" ? "↑" : "↓") : ""}</span>
            <span className="sr-only">{sorted ? `sorted ${p.sort.dir === "asc" ? "ascending" : "descending"}` : "sort by this column"}</span>
          </button>
        ) : col.header}
      </TableHead>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-5 lg:px-6">
        <h2 className="t-section">
          {p.title}
          <span className="pl-2 t-body font-normal tabular-nums text-muted-foreground">
            {rows.length.toLocaleString()}{p.total ? ` of ${p.total.toLocaleString()}` : ""}
          </span>
        </h2>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {p.views}
          {p.pageMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-0 max-w-full truncate">{p.pageMenu.label}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {p.pageMenu.items.map((i) => <DropdownMenuItem key={i.label} onSelect={i.onClick}>{i.label}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {p.primary && <Button size="sm" onClick={p.primary.onClick}>{p.primary.label}</Button>}
        </div>
      </div>

      {p.strip && <div className="px-5 pt-3 lg:px-6">{p.strip}</div>}

      {/* While anything is selected the bar replaces the filter row, so the two never fight. */}
      {selected.length > 0 || allMatching ? (
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 lg:px-6">
          <span className="t-label tabular-nums">
            {allMatching ? `All ${rows.length.toLocaleString()} matching selected` : `${selected.length} selected`}
          </span>
          {!allMatching && pageSelected && rows.length > shown.length && (
            <Button size="sm" variant="ghost" className="h-7 t-small" onClick={() => setAllMatching(true)}>
              Select all {rows.length.toLocaleString()} matching
            </Button>
          )}
          {(p.bulk ?? []).map((a) => (
            <Button key={a.label} size="sm" variant={a.destructive ? "ghost" : "outline"}
              className={cn("h-7 t-small", a.destructive && "text-destructive hover:bg-destructive/10 hover:text-destructive")}
              onClick={() => { a.onClick(selectedRows); clearSelection() }}>
              {a.label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" className="h-7 t-small" onClick={clearSelection}>Clear</Button>
        </div>
      ) : (
        <div className="px-5 py-3 lg:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              ref={search}
              aria-label={p.searchHint ?? "Search"}
              placeholder={p.searchHint ?? "Search"}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-64"
            />
            {p.chips.map((f) => (
              <Select key={f.id} value={p.filters[f.id] ?? "all"} onValueChange={(v) => setFilter(f.id, v)}>
                <SelectTrigger className="h-9 w-auto min-w-36" aria-label={f.label}><SelectValue placeholder={f.label} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{f.label}: all</SelectItem>
                  {f.options.filter(Boolean).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            ))}
            <ColumnsPopover columns={p.allColumns} chosen={p.columns.map((c) => c.id)} onChange={p.onColumnsChange} />
            {activeFilters.length > 0 && (
              <>
                <span className="t-small text-muted-foreground">Matching all of: {activeFilters.map((f) => f.label).join(", ")}</span>
                <Button size="sm" variant="ghost" className="h-7 t-small" onClick={() => p.onFiltersChange({})}>Clear</Button>
              </>
            )}
          </div>

          {p.doorFilters.length > 0 && (
            <div className="pt-1">
              <Door
                id={`${p.title.toLowerCase()}.filters`}
                label={`Additional filters: ${Array.from(new Set(p.doorFilters.map((f) => f.name))).join(", ")}${doorActive ? ` · ${doorActive} on` : ""}`}
                count={p.doorFilters.length}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {p.doorFilters.map((f) => (
                    <Select key={f.id} value={p.filters[f.id] ?? "all"} onValueChange={(v) => setFilter(f.id, v)}>
                      <SelectTrigger className="h-8 w-auto min-w-36" aria-label={f.label}><SelectValue placeholder={f.label} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{f.label}: all</SelectItem>
                        {f.options.filter(Boolean).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ))}
                </div>
              </Door>
            </div>
          )}
        </div>
      )}

      <div role="status" aria-live="polite" className="sr-only">{rows.length} rows match</div>

      <div className="min-h-0 flex-1 overflow-auto border-t">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              {hasBulk && (
                <TableHead className="w-8 pl-4 lg:pl-6">
                  <Checkbox
                    aria-label={`Select this page (${shown.length})`}
                    checked={pageSelected}
                    onCheckedChange={(v) => (v ? setSelected(shown.map(p.rowKey)) : clearSelection())}
                  />
                </TableHead>
              )}
              {p.columns.map(header)}
              <TableHead className="sticky right-0 z-20 w-12 bg-background"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody ref={body}>
            {shown.map((r) => {
              const id = p.rowKey(r)
              const door = p.rowDoor?.label(r) ?? null
              return (
                <Fragment key={id}>
                  <TableRow
                    data-row
                    tabIndex={0}
                    className="group cursor-pointer align-top"
                    onClick={(e) => { const el = e.currentTarget as HTMLElement; el.focus(); cameFrom.current = el; setGlancing(r) }}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) return
                      const handler = p.rowKeys?.[e.key]
                      if (handler) { e.preventDefault(); handler(r); return }
                      if (p.enterOpensRecord && e.key === "Enter") { e.preventDefault(); p.quickLook.onOpen(r); return }
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cameFrom.current = e.currentTarget as HTMLElement; setGlancing(r) }
                    }}
                  >
                    {hasBulk && (
                      <TableCell className="py-2 pl-4 lg:pl-6" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          aria-label={`Select row ${id}`}
                          checked={allMatching || selected.includes(id)}
                          onCheckedChange={(v) => setSelected((s) => (v ? [...s, id] : s.filter((x) => x !== id)))}
                        />
                      </TableCell>
                    )}
                    {p.columns.map((c, i) => (
                      <TableCell
                        key={c.id}
                        className={cn("py-2", c.className, !c.phone && "hidden md:table-cell", i === 0 && "max-w-[8rem] md:max-w-none")}
                      >
                        {c.cell(r)}
                        {i === 0 && p.phoneSummary && (
                          <div className="pt-0.5 t-small break-words text-muted-foreground md:hidden">{p.phoneSummary(r)}</div>
                        )}
                      </TableCell>
                    ))}
                    {/* The row's actions are in the DOM at all times and change opacity, never presence.
                        They are laid over the row rather than in it, so a seat with four of them does
                        not widen the table, and the "…" stays pinned to the right edge. */}
                    <TableCell className="sticky right-0 z-10 w-12 bg-background py-1 pr-2 lg:pr-5" onClick={(e) => e.stopPropagation()}>
                      <div className="relative flex items-center justify-end gap-1">
                        <div className="absolute top-1/2 right-full mr-1 hidden -translate-y-1/2 items-center gap-1 rounded-md surface-raised opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 md:flex">
                        {p.rowActions.map((a) => (
                          <Button
                            key={a.id}
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 t-small"
                            onClick={() => a.onClick(r)}
                          >
                            {a.icon && <a.icon className="size-3.5" aria-hidden="true" />}
                            {a.label(r)}
                          </Button>
                        ))}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="size-7" aria-label={p.menuLabel(r)}>
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="max-w-xs">
                            <DropdownMenuItem onSelect={(e) => { cameFrom.current = (e.currentTarget as HTMLElement).closest("tr")?.previousElementSibling as HTMLElement ?? null; setGlancing(r) }}>Quick look</DropdownMenuItem>
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
                      </div>
                    </TableCell>
                  </TableRow>
                  {door && p.rowDoor && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={p.columns.length + (hasBulk ? 1 : 0) + 1} className="py-0 pl-5 lg:pl-6">
                        <Door id={p.rowDoor.id(r)} label={door} count={p.rowDoor.count(r)}>
                          {p.rowDoor.content(r)}
                        </Door>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={p.columns.length + (hasBulk ? 1 : 0) + 1} className="py-10">
                  {q || activeFilters.length > 0 ? (
                    <EmptyState
                      title="Nothing matches"
                      body="Clear the search or a filter."
                      action={<Button size="sm" variant="outline" onClick={() => { setQ(""); p.onFiltersChange({}) }}>Clear</Button>}
                    />
                  ) : (
                    <EmptyState title={p.empty.title} body={p.empty.body} action={p.empty.action} />
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {rows.length > limit && (
          <div className="flex justify-center border-t py-3">
            <Button variant="outline" size="sm" onClick={() => setLimit((l) => l + (p.pageSize ?? 25))}>
              Show {Math.min(p.pageSize ?? 25, rows.length - limit)} more
            </Button>
          </div>
        )}
      </div>

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
    </div>
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
              <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 t-body hover:bg-muted">
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
