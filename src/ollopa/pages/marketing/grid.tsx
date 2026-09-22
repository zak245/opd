// The table Campaigns and Workflows share.
//
// It is TablePage's shape with the three things these two specs add and the template does not carry:
// sortable headers that persist, a column chooser named for what it holds, and phone cards that carry
// every column the desktop row carries. Nothing is hover-only: a row's actions show on hover and on
// focus-within, and the same actions repeat in the row's "…" menu, whose accessible name is the list
// of what is in it — no menu in this product is called "More actions".
import { useMemo, useRef, type ReactNode } from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Actions, type Action } from "../../ui/Actions"
import { usePref } from "./prefs"

export interface GridColumn<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  sortBy?: (row: T) => string | number
  className?: string
  /** Columns the reader may add or remove. A column without this is always on. */
  optional?: boolean
}

export interface GridAction<T> { label: string; onClick: (row: T) => void }
export interface GridMenuItem<T> { label: string; onClick: (row: T) => void; destructive?: boolean; separatorBefore?: boolean }

export interface GridProps<T> {
  /** Sort and column choices persist under this id, per user and per workspace. */
  id: string
  rows: T[]
  rowKey: (row: T) => string
  columns: GridColumn<T>[]
  /** The row's status-dependent actions: visible on hover and on focus, and repeated in the menu. */
  actions?: (row: T) => GridAction<T>[]
  menu?: (row: T) => GridMenuItem<T>[]
  /** The accessible name of the "…" button: the list of what is behind it. */
  menuName: string
  /** Column visibility, when the page needs the same choices in its phone door as well. */
  hidden?: string[]
  onHidden?: (next: string[]) => void
  defaultSort?: { key: string; dir: "asc" | "desc" }
  onOpen?: (row: T) => void
  cardTitle: (row: T) => ReactNode
  empty?: ReactNode
  /** Extra controls that sit in the header row beside the column chooser. */
  headerExtra?: ReactNode
  /**
   * The page has put this table in a `Container` (DESIGN.md §5, containment). The grid then paints
   * no surface and draws no edge of its own — the container's outline is the boundary — its toolbar
   * lives in the container's header (see `GridColumns`), and the phone list is divided rows rather
   * than a card each, because a card inside a container is a box inside a box.
   */
  inContainer?: boolean
  /** What a row is called, for the crumb and for the return cue that lights it on the way back. */
  rowLabel?: (row: T) => string
}

export function Grid<T>(p: GridProps<T>) {
  const [sort, setSort] = usePref<{ key: string; dir: "asc" | "desc" }>(`${p.id}.sort`, p.defaultSort ?? { key: p.columns[0].key, dir: "asc" })
  const optional = p.columns.filter((c) => c.optional)
  const [ownHidden, setOwnHidden] = usePref<string[]>(`${p.id}.hidden`, optional.map((c) => c.key))
  const hidden = p.hidden ?? ownHidden
  const setHidden = p.onHidden ?? setOwnHidden
  const body = useRef<HTMLTableSectionElement>(null)

  const shown = p.columns.filter((c) => !c.optional || !hidden.includes(c.key))

  const rows = useMemo(() => {
    const col = p.columns.find((c) => c.key === sort.key)
    if (!col?.sortBy) return p.rows
    const dir = sort.dir === "asc" ? 1 : -1
    return [...p.rows].sort((a, b) => {
      const x = col.sortBy!(a), y = col.sortBy!(b)
      return (x < y ? -1 : x > y ? 1 : 0) * dir
    })
  }, [p.rows, p.columns, sort])

  // Arrows move through rows; Enter opens. The row is the focus target, so a screen reader reads the
  // whole row before the reader commits to opening it.
  const onRowKey = (e: React.KeyboardEvent<HTMLTableRowElement>, row: T) => {
    if (e.target !== e.currentTarget) return
    if (e.key === "Enter") { e.preventDefault(); p.onOpen?.(row) }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      const all = Array.from(body.current?.querySelectorAll<HTMLTableRowElement>("tr[tabindex]") ?? [])
      const i = all.indexOf(e.currentTarget)
      all[e.key === "ArrowDown" ? Math.min(i + 1, all.length - 1) : Math.max(i - 1, 0)]?.focus()
    }
  }

  /**
   * Every control on a row is drawn by its kind, not by this file: the row's own acts and the ones
   * behind the "…" are one list, and `Actions` puts the destructive one last, after a separator,
   * and never next to a benign one (DESIGN.md §1).
   */
  const rowItems = (row: T): Action[] => [
    ...(p.actions?.(row) ?? []).map((a): Action => ({ kind: "secondary", label: a.label, onClick: () => a.onClick(row) })),
    ...(p.menu?.(row) ?? []).map((m): Action => ({ kind: m.destructive ? "destructive" : "secondary", label: m.label, onClick: () => m.onClick(row) })),
  ]

  const rowMenu = (row: T) => {
    const items = rowItems(row)
    if (items.length === 0) return null
    // `Actions` names its own trigger, so the list of what is behind it — which is this product's
    // rule for a menu's accessible name — is carried by the group around it.
    return (
      <div role="group" aria-label={p.menuName}>
        <Actions surface="card" layout="menu" items={items} />
      </div>
    )
  }

  if (p.rows.length === 0 && p.empty) return <>{p.empty}</>

  return (
    <div>
      {!p.inContainer && (optional.length > 0 || p.headerExtra) && (
        <div className="hidden flex-wrap items-center justify-end gap-2 px-6 pb-2 md:flex">
          {p.headerExtra}
          {optional.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Columns: {optional.map((c) => c.header.toLowerCase()).join(", ")} ({optional.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64">
                <fieldset>
                  <legend className="pb-2 text-xs font-medium">Columns you can add</legend>
                  <div className="space-y-2">
                    {optional.map((c) => (
                      <label key={c.key} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={!hidden.includes(c.key)}
                          onCheckedChange={(v) => setHidden(v ? hidden.filter((k) => k !== c.key) : [...hidden, c.key])}
                        />
                        {c.header}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------- the table, from tablet up */}
      <div className={cn("hidden overflow-x-auto md:block", p.inContainer ? "" : "surface-raised border-t")}>
        <Table>
          <TableHeader className={cn("sticky top-0 z-10", p.inContainer ? "surface-container" : "surface-raised")}>
            <TableRow>
              {shown.map((c) => (
                <TableHead key={c.key} className={cn("t-label", c.className)}>
                  {c.sortBy ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      aria-label={`Sort by ${c.header}`}
                      onClick={() => setSort({ key: c.key, dir: sort.key === c.key && sort.dir === "asc" ? "desc" : "asc" })}
                    >
                      {c.header}
                      {sort.key === c.key
                        ? (sort.dir === "asc" ? <ArrowUp className="size-3" aria-hidden="true" /> : <ArrowDown className="size-3" aria-hidden="true" />)
                        : <ChevronsUpDown className="size-3 opacity-40" aria-hidden="true" />}
                    </button>
                  ) : c.header}
                </TableHead>
              ))}
              <TableHead className="w-px"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody ref={body}>
            {rows.map((row) => (
              <TableRow
                key={p.rowKey(row)}
                // The row is tagged with its own id, so a page the trail is holding can scroll back
                // to it, light it and focus it, and so the pane can mark the row it is reading.
                data-item={p.rowKey(row)}
                data-item-label={p.rowLabel?.(row)}
                className="group cursor-pointer align-top"
                tabIndex={0}
                onClick={(e) => { (e.currentTarget as HTMLElement).focus(); p.onOpen?.(row) }}
                onKeyDown={(e) => onRowKey(e, row)}
              >
                {/* A column that carries a sentence wraps onto a second line (its className says so);
                    nothing is ever truncated behind a tooltip. */}
                {shown.map((c) => <TableCell key={c.key} className={cn("t-body py-2", c.className)}>{c.cell(row)}</TableCell>)}
                <TableCell className="py-1 pr-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {/* The row's own acts, repeated in the menu beside them: nothing is hover-only,
                        so they appear on hover and on focus and are reachable either way. */}
                    {(p.actions?.(row) ?? []).length > 0 && (
                      <div className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100">
                        <Actions
                          surface="card"
                          items={(p.actions?.(row) ?? []).map((a): Action => ({ kind: "secondary", label: a.label, onClick: () => a.onClick(row) }))}
                        />
                      </div>
                    )}
                    {rowMenu(row)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={shown.length + 1} className="t-body py-10 text-center text-muted-foreground">Nothing matches. Clear the search or a filter.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* -------------------------- the phone: cards carrying every column the desktop row carries */}
      {/* The phone: one list with dividers between rows when the page has contained it, and a card
          each when it has not. A card inside a container reads as two groups where there is one. */}
      <ul className={cn("md:hidden", p.inContainer ? "" : "space-y-2 border-t px-4 py-3")}>
        {rows.map((row) => (
          <li
            key={p.rowKey(row)}
            data-item={p.rowKey(row)}
            data-item-label={p.rowLabel?.(row)}
            className={cn(p.inContainer ? "border-t px-4 py-3 first:border-t-0" : "surface-raised rounded-lg border p-3")}
          >
            <div className="flex items-start gap-2">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => p.onOpen?.(row)}>{p.cardTitle(row)}</button>
              {rowMenu(row)}
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {shown.slice(1).map((c) => (
                <div key={c.key} className="min-w-0">
                  <dt className="t-small text-muted-foreground">{c.header}</dt>
                  <dd className="t-small min-w-0">{c.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
        {rows.length === 0 && <li className="t-body py-8 text-center text-muted-foreground">Nothing matches. Clear the search or a filter.</li>}
      </ul>
    </div>
  )
}

/**
 * The column chooser on its own, for a page that has put the grid in a `Container`: the toolbar
 * belongs in the container's header, and the container is drawn outside the grid.
 */
export function GridColumns<T>({ columns, hidden, onHidden }: {
  columns: GridColumn<T>[]
  hidden: string[]
  onHidden: (next: string[]) => void
}) {
  const optional = columns.filter((c) => c.optional)
  if (optional.length === 0) return null
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="t-small h-8">
          Columns: {optional.map((c) => c.header.toLowerCase()).join(", ")} ({optional.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <fieldset>
          <legend className="t-label pb-2">Columns you can add</legend>
          <div className="space-y-2">
            {optional.map((c) => (
              <label key={c.key} className="t-body flex items-center gap-2">
                <Checkbox
                  checked={!hidden.includes(c.key)}
                  onCheckedChange={(v) => onHidden(v ? hidden.filter((k) => k !== c.key) : [...hidden, c.key])}
                />
                {c.header}
              </label>
            ))}
          </div>
        </fieldset>
      </PopoverContent>
    </Popover>
  )
}
