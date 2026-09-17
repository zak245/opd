// The pieces the four Engage nodes share: a table that sorts, selects and turns into cards on a
// phone, and the small format helpers.
//
// The table is not the shared TablePage template, because these two pages need three things it does
// not carry: a checkbox column with a bulk bar, sortable headers, and a row menu named for the record
// it acts on ("Actions for Q4 enterprise targets"), which the rules require over "More actions".
// Everything else follows the template: row actions on hover *and* on focus, repeated in the menu,
// so nothing is pointer-only.
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TODAY } from "../../data/seed"

export { toast } from "../../templates/TablePage"

/* ------------------------------------------------------------------------------------- formats */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function day(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z")
  const sameYear = iso.slice(0, 4) === TODAY.slice(0, 4)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${sameYear ? "" : " " + d.getUTCFullYear()}`
}

export function daysBetween(from: string, to: string = TODAY): number {
  return Math.round((Date.parse(to.slice(0, 10)) - Date.parse(from.slice(0, 10))) / 86_400_000)
}

export function ago(iso: string | null | undefined): string {
  if (!iso) return "—"
  const n = daysBetween(iso)
  if (n === 0) return "today"
  if (n === 1) return "yesterday"
  if (n > 1) return `${n} days ago`
  if (n === -1) return "tomorrow"
  return `in ${-n} days`
}

export const n = (v: number) => v.toLocaleString("en-US")

/** A share of a base, to one decimal, with the base guarded. Counts and rates always travel together. */
export function rate(part: number, whole: number): string {
  if (!whole) return "0%"
  const v = (part / whole) * 100
  return `${v >= 10 ? Math.round(v) : v.toFixed(1)}%`
}

/** "812 · 44%" in one cell, so a raw count is never hidden behind a hover (rule 7). */
export function CountRate({ label, count, of }: { label: string; count: number; of?: number }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm tabular-nums">
        {n(count)}
        {of !== undefined && <span className="text-muted-foreground"> · {rate(count, of)}</span>}
      </div>
    </div>
  )
}

/** A number in the header strip that is also a button: pressing it filters the table below. */
export function CountButton({ label, count, active, onClick, tone }: {
  label: string; count: number; active?: boolean; onClick: () => void; tone?: "warning" | "error"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-2.5 py-1.5 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active && "border-foreground bg-muted",
        tone === "warning" && "border-amber-300 dark:border-amber-800",
        tone === "error" && "border-destructive/50",
      )}
    >
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="block text-sm font-medium tabular-nums">{n(count)}</span>
      <span className="sr-only">filter people by {label.toLowerCase()}</span>
    </button>
  )
}

export function Pill({ children, tone }: { children: ReactNode; tone?: "warning" | "error" | "good" | "muted" }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "px-1.5 py-0 text-[11px] font-normal",
        tone === "warning" && "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
        tone === "error" && "bg-destructive/10 text-destructive",
        tone === "good" && "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200",
        tone === "muted" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </Badge>
  )
}

/* -------------------------------------------------------------------------------- the data table */

export interface Col<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  /** Sortable headers carry aria-sort and a chevron; the default sort is the page's. */
  sort?: (a: T, b: T) => number
  className?: string
  /** The one cell that titles the card at phone width. */
  primary?: boolean
  /** The same value on one line, for the card at phone width. Falls back to `cell`. */
  phoneCell?: (row: T) => ReactNode
  /** Also shown, under the title, at phone width. Everything else stays in the row's menu. */
  phone?: boolean
}

export interface RowAction<T> { label: (row: T) => string; onClick: (row: T) => void }
export interface RowMenuItem { label: string; onClick: () => void; destructive?: boolean }

export interface DataTableProps<T> {
  rows: T[]
  rowKey: (row: T) => string
  columns: Col<T>[]
  sortKey: string
  sortDir: "asc" | "desc"
  onSort: (key: string, dir: "asc" | "desc") => void
  /** Visible on hover and on keyboard focus, and repeated in the menu. */
  rowActions?: RowAction<T>[]
  menu?: (row: T) => RowMenuItem[]
  menuLabel: (row: T) => string
  onOpen?: (row: T) => void
  selection?: {
    selected: string[]
    onChange: (ids: string[]) => void
    /** The bar under the table: its label already carries the count. */
    bar: (ids: string[]) => ReactNode
  }
  empty?: ReactNode
}

export function DataTable<T>(p: DataTableProps<T>) {
  const sorted = useMemo(() => {
    const col = p.columns.find((c) => c.key === p.sortKey)
    if (!col?.sort) return p.rows
    const out = [...p.rows].sort(col.sort)
    return p.sortDir === "desc" ? out.reverse() : out
  }, [p.rows, p.columns, p.sortKey, p.sortDir])

  const ids = sorted.map(p.rowKey)
  const selected = p.selection?.selected ?? []
  const allOn = ids.length > 0 && ids.every((id) => selected.includes(id))
  const toggle = (id: string) =>
    p.selection?.onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])

  if (sorted.length === 0 && p.empty) return <>{p.empty}</>

  return (
    <div>
      {/* ------------------------------------------------------------- phone: one card per row */}
      <ul className="divide-y border-t sm:hidden">
        {sorted.map((row) => {
          const key = p.rowKey(row)
          const primary = p.columns.find((c) => c.primary) ?? p.columns[0]
          return (
            <li key={key} className="flex items-start gap-2 px-4 py-3">
              {p.selection && (
                <Checkbox className="mt-1" checked={selected.includes(key)} onCheckedChange={() => toggle(key)} aria-label={`Select ${p.menuLabel(row)}`} />
              )}
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={() => p.onOpen?.(row)}
                >
                  {primary.cell(row)}
                </button>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {p.columns.filter((c) => c.phone).map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1">
                      <span>{c.header}:</span>{(c.phoneCell ?? c.cell)(row)}
                    </span>
                  ))}
                </div>
              </div>
              <RowMenu row={row} p={p} />
            </li>
          )
        })}
      </ul>

      {/* --------------------------------------------------------------------- the table itself */}
      <div className="hidden overflow-x-auto sm:block">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              {p.selection && (
                <TableHead className="w-8">
                  <Checkbox
                    checked={allOn}
                    onCheckedChange={() => p.selection!.onChange(allOn ? [] : ids)}
                    aria-label={allOn ? "Clear the selection" : `Select all ${ids.length} rows`}
                  />
                </TableHead>
              )}
              {p.columns.map((c) => (
                <TableHead
                  key={c.key}
                  className={c.className}
                  aria-sort={p.sortKey === c.key ? (p.sortDir === "asc" ? "ascending" : "descending") : undefined}
                >
                  {c.sort ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      onClick={() => p.onSort(c.key, p.sortKey === c.key && p.sortDir === "desc" ? "asc" : "desc")}
                    >
                      {c.header}
                      {p.sortKey === c.key && (p.sortDir === "desc"
                        ? <ArrowDown className="size-3" aria-hidden="true" />
                        : <ArrowUp className="size-3" aria-hidden="true" />)}
                    </button>
                  ) : c.header}
                </TableHead>
              ))}
              <TableHead className="w-px"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => {
              const key = p.rowKey(row)
              return (
                <TableRow
                  key={key}
                  className={cn("group", p.onOpen && "cursor-pointer")}
                  tabIndex={p.onOpen ? 0 : undefined}
                  data-row-key={key}
                  onClick={p.onOpen ? (e) => { e.currentTarget.focus(); p.onOpen!(row) } : undefined}
                  onKeyDown={p.onOpen ? (e) => {
                    if (e.key === "Enter" && e.target === e.currentTarget) { e.preventDefault(); p.onOpen!(row) }
                    if (e.key === "x" && e.target === e.currentTarget && p.selection) { e.preventDefault(); toggle(key) }
                  } : undefined}
                >
                  {p.selection && (
                    <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.includes(key)} onCheckedChange={() => toggle(key)} aria-label={`Select ${p.menuLabel(row)}`} />
                    </TableCell>
                  )}
                  {p.columns.map((c) => <TableCell key={c.key} className={cn("py-2 align-top", c.className)}>{c.cell(row)}</TableCell>)}
                  <TableCell className="py-1 pr-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {(p.rowActions ?? []).map((a, i) => (
                        <Button
                          key={i}
                          size="sm"
                          variant="ghost"
                          className="h-7 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                          onClick={() => a.onClick(row)}
                        >
                          {a.label(row)}
                        </Button>
                      ))}
                      <RowMenu row={row} p={p} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={p.columns.length + 2} className="py-10 text-center text-sm text-muted-foreground">
                  Nothing matches. Clear the search or a filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {p.selection && selected.length > 0 && (
        <div
          role="region"
          aria-label={`${selected.length} selected`}
          className="sticky bottom-0 z-20 flex flex-wrap items-center gap-2 border-t bg-background/95 px-4 py-2 backdrop-blur"
        >
          <span className="text-sm font-medium tabular-nums">{n(selected.length)} selected</span>
          {p.selection.bar(selected)}
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => p.selection!.onChange([])}>Clear</Button>
        </div>
      )}
    </div>
  )
}

/** The row's own menu, named for the record: "Actions for Q4 enterprise targets", never "More". */
function RowMenu<T>({ row, p }: { row: T; p: DataTableProps<T> }) {
  const items = p.menu?.(row) ?? []
  const actions = p.rowActions ?? []
  if (items.length === 0 && actions.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="size-7 shrink-0" aria-label={`Actions for ${p.menuLabel(row)}`}>
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-[18rem]">
        {actions.map((a, i) => <DropdownMenuItem key={`a${i}`} onSelect={() => a.onClick(row)}>{a.label(row)}</DropdownMenuItem>)}
        {actions.length > 0 && items.length > 0 && <DropdownMenuSeparator />}
        {items.map((m, i) => (
          <DropdownMenuItem key={`m${i}`} onSelect={m.onClick} className={cn("whitespace-normal", m.destructive && "text-destructive")}>
            {m.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* -------------------------------------------------------------------------------- accelerators */

export interface Key { keys: string; label: string; run: () => void }

/**
 * Single-key accelerators for the people who live on the page, published to the shortcut sheet and
 * the palette so they are exposed rather than hinted at (rule 8). Never while focus is in a field.
 */
export function useKeys(keys: Key[]) {
  useEffect(() => {
    document.dispatchEvent(new CustomEvent("ollopa:shortcuts", { detail: keys.map((k) => ({ keys: k.keys, label: k.label })) }))
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return
      const pressed = e.key.length === 1 ? e.key : e.key
      const hit = keys.find((k) => k.keys === pressed)
      if (hit) { e.preventDefault(); hit.run() }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.dispatchEvent(new CustomEvent("ollopa:shortcuts", { detail: [] }))
    }
  }, [keys])
}

/** `j` and `k` walk the rows the table rendered, so the keyboard reaches every row action. */
export function moveRow(delta: number) {
  const rows = Array.from(document.querySelectorAll<HTMLElement>("tr[data-row-key]"))
  if (rows.length === 0) return
  const at = rows.findIndex((r) => r === document.activeElement || r.contains(document.activeElement))
  const next = rows[Math.min(rows.length - 1, Math.max(0, (at < 0 ? -1 : at) + delta))]
  next?.focus()
}

export function focusSearch() {
  document.querySelector<HTMLInputElement>("input[data-page-search]")?.focus()
}

/**
 * State a person set and expects to find again: a filter, a sort, a column choice. Per user and per
 * key, the way door state is (rule 5). Private mode loses it for this visit only, never the page.
 */
export function usePersisted<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch { return initial }
  })
  return [value, (next: T) => {
    setValue(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* this visit only */ }
  }]
}
