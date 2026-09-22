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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { href } from "@/app/router"
import { FamilyIcon } from "../../ui/Identity"
import { openBeside } from "../../beside"
import { follow } from "../../chain"
import { clearEdit, type Edit } from "../../edits"
import { navItem } from "../../nav"
import type { Page } from "../../usage/model"
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
      <div className="t-label text-muted-foreground">{label}</div>
      <div className="t-body tabular-nums">
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
        tone === "warning" && "border-[color:var(--warning-ink)]",
        tone === "error" && "border-[color:var(--danger-ink)]",
      )}
    >
      <span className="t-small block text-muted-foreground">{label}</span>
      <span className="t-body block font-medium tabular-nums">{n(count)}</span>
      <span className="sr-only">filter people by {label.toLowerCase()}</span>
    </button>
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
            /* The card is the row, so it behaves like the row above: focusable, Enter opens it, x
               selects it. The two controls inside it — select, and the name that opens the record —
               are siblings of each other and never nested, because a control inside a control is
               invalid HTML with no defined keyboard activation. The select is a real checkbox input
               with its own label, so Space toggles it without anything being wired up. */
            <li
              key={key}
              className="flex items-start gap-2 px-4 py-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              data-row-key={key}
              tabIndex={p.onOpen ? 0 : undefined}
              onClick={p.onOpen ? (e) => { (e.currentTarget as HTMLElement).focus(); p.onOpen!(row) } : undefined}
              onKeyDown={p.onOpen ? (e) => {
                if (e.key === "Enter" && e.target === e.currentTarget) { e.preventDefault(); p.onOpen!(row) }
                if (e.key === "x" && e.target === e.currentTarget && p.selection) { e.preventDefault(); toggle(key) }
              } : undefined}
            >
              {p.selection && (
                <label className="mt-1 flex shrink-0 items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="size-4 accent-current"
                    checked={selected.includes(key)}
                    onChange={() => toggle(key)}
                  />
                  <span className="sr-only">Select {p.menuLabel(row)}</span>
                </label>
              )}
              <div className="min-w-0 flex-1">
                {primary.cell(row)}
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
              {/* Pinned to the right edge: opening a pane narrows the table, and the controls for
                  the row you opened the pane to decide about must not scroll away with it. */}
              <TableHead className="sticky right-0 z-20 w-px bg-background"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => {
              const key = p.rowKey(row)
              return (
                <TableRow
                  key={key}
                  // An opaque row background, so the pinned cell can inherit it and nothing shows
                  // through the rows sliding under it.
                  className={cn("group bg-background hover:bg-muted has-aria-expanded:bg-muted", p.onOpen && "cursor-pointer")}
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
                  <TableCell className="sticky right-0 bg-inherit py-1 pr-3" onClick={(e) => e.stopPropagation()}>
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
          className="sticky bottom-0 z-20 flex flex-wrap items-center gap-2 border-t surface-overlay/95 px-4 py-2 backdrop-blur"
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
      {/* Related objects and ordinary acts first, the destructive one last after a rule — the
          order DESIGN.md §1 fixes for a menu, so the page cannot put a delete in the middle. */}
      <DropdownMenuContent align="end" className="max-w-[18rem]">
        {actions.map((a, i) => <DropdownMenuItem key={`a${i}`} onSelect={() => a.onClick(row)}>{a.label(row)}</DropdownMenuItem>)}
        {actions.length > 0 && items.length > 0 && <DropdownMenuSeparator />}
        {items.filter((m) => !m.destructive).map((m, i) => (
          <DropdownMenuItem key={`m${i}`} onSelect={m.onClick} className="whitespace-normal">{m.label}</DropdownMenuItem>
        ))}
        {items.some((m) => m.destructive) && <DropdownMenuSeparator />}
        {items.filter((m) => m.destructive).map((m, i) => (
          <DropdownMenuItem key={`d${i}`} onSelect={m.onClick} variant="destructive" className="whitespace-normal">{m.label}</DropdownMenuItem>
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

/* --------------------------------------------------------- the two ways out of an Engage page */

/**
 * A related object opened beside the page. The page stays where it is and does not re-render.
 *
 * The id goes on the element as `data-item` as well as into the pane, so the pane frame can mark
 * the row it is reading and a return from the trail can find it again.
 */
export function BesideLink({ kind, id, list, className, children }: {
  kind: string
  id: string
  /** The ids in the order they are on screen, so `[` and `]` walk what the person is looking at. */
  list?: { ids: string[]; index: number }
  className?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      data-item={id}
      className={className}
      onClick={(e) => { e.stopPropagation(); openBeside({ kind, id, list, opener: e.currentTarget }) }}
    >
      {children}
    </button>
  )
}

/**
 * A link that leaves for a whole page and remembers where it was, so the crumb comes back to this
 * exact element. Never a bare `navigate()` to a related object (BUILD-CHAINS, rules for builders).
 *
 * It stays a real `<a href>`, so ⌘-click still opens a new tab — and a new tab is a fresh start
 * with an empty trail, which is what the store does with any hash change it did not ask for.
 */
export function FollowLink({ to, route, title, anchor, className, children }: {
  to: string
  /** Where we are now: the route the crumb returns to. */
  route: string
  /** The page's h1 as it reads right now, so the crumb reads the way the page did. */
  title: string
  /** This element's own id, lit and focused on the way back. */
  anchor: string
  className?: string
  children: ReactNode
}) {
  return (
    <a
      href={href(to)}
      data-item={anchor}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        e.stopPropagation()
        follow(to, { route, title, anchor })
      }}
    >
      {children}
    </a>
  )
}

/* ------------------------------------------------- what an action did, shown where it was caused */

/** How long the row offers to undo the action that changed it. */
export const UNDO_MS = 10_000

/**
 * Re-render once a second while something on the page is still undoable, so the ten seconds are
 * really ten seconds and the Undo does not linger after its window has closed. Idle otherwise.
 */
export function useTick(active: boolean) {
  const [, bump] = useState(0)
  useEffect(() => {
    if (!active) return
    const t = window.setInterval(() => bump((v) => v + 1), 1000)
    return () => window.clearInterval(t)
  }, [active])
}

/** True while the record is new enough that the row should still offer Undo. */
export const undoable = (e?: Edit) => !!e?.at && Date.now() - e.at < UNDO_MS

/**
 * One line under a row's name saying what the last action did to it, with Undo while the window is
 * open. This is chain rule 8 in one component: a pane action writes to `edits`, and the row it was
 * caused on says so at once, in place, without the page being told anything by the pane.
 */
export function RowNote({ kind, id, note, at }: { kind: string; id: string; note: string; at?: number }) {
  const fresh = !!at && Date.now() - at < UNDO_MS
  return (
    <div role="status" className="t-small mt-0.5 flex flex-wrap items-center gap-2">
      <span className="rounded bg-muted px-1.5 py-0.5">{note}</span>
      {fresh && (
        <button
          type="button"
          className="underline underline-offset-2 hover:text-foreground"
          onClick={(e) => { e.stopPropagation(); clearEdit(kind, id) }}
        >
          Undo
        </button>
      )}
    </div>
  )
}

/**
 * The page's h1 exactly as the shell writes it, so `Origin.title` is the title the person read and a
 * crumb can never say something the page never said (chain rule 3). A record reads "{name} · {page}".
 */
export function h1Of(page: Page, record?: string): string {
  const label = navItem(page)?.label ?? page
  return record ? `${record} · ${label}` : label
}

/**
 * The row's name as the way in. People, Companies and Campaigns make the name a control; these
 * pages did not, so the product taught two rules for the same gesture. Now it teaches one.
 */
export function RowOpen({ to, onOpen, className, children }: {
  /** The record this row is the way into. */
  to: string
  /** What a plain click does instead of following the href: `follow`, which keeps the trail. */
  onOpen: () => void
  className?: string
  children: ReactNode
}) {
  return (
    <a
      href={href(to)}
      // A destination is a link, never a button (DESIGN.md §1) — so ⌘-click opens a new tab and the
      // row name reads the way People, Companies and Campaigns read theirs. The plain click is the
      // page's: it goes through `follow`, so the crumb comes back to this row.
      data-row-open
      className={cn(
        "rounded text-left font-medium underline-offset-4 hover:underline focus-visible:underline",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        e.stopPropagation()
        onOpen()
      }}
    >
      {children}
    </a>
  )
}
