import { useMemo, useState, type ReactNode } from "react"
import { MoreHorizontal, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { LegacyIndexPage as IndexPage } from "../layouts/IndexPage"
import { useFitColumns } from "../layouts/columns"
import { Chip, FamilyIcon } from "../ui/Identity"
import { familyOf } from "../identity"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QuickLook, type QuickLookEditable, type QuickLookField } from "./QuickLook"
import { Separator } from "@/components/ui/separator"
import { MetaLine } from "../layouts/MetaLine"

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
  /**
   * This column shows a state word. Return it and the template draws the status chip from the one
   * status set — a page never picks the colour, and the chip always carries the word (DESIGN.md §5).
   */
  status?: (row: T) => string
}
/**
 * A column that holds a chip — a status column, or one named for a stage or a state — gets a floor
 * on its width, because a chip that is clipped ("Approachi") stops being a word.
 */
const chipColumn = <T,>(c: Column<T>) => !!c.status || /stage|status|state/i.test(c.key) || /stage|status|state/i.test(c.header)
export interface RowAction<T> { label: string | ((row: T) => string); icon?: LucideIcon; onClick: (row: T) => void }
const lbl = <T,>(a: RowAction<T>, r: T) => (typeof a.label === "function" ? a.label(r) : a.label)
export interface MoreAction<T> { label: string; onClick: (row: T) => void; destructive?: boolean }
export interface Filter<T> { key: string; label: string; options: string[]; get: (row: T) => string }
/**
 * The quick look this table opens: level one of the record, flat, with the same labels in the same
 * order as the top of the record page (RULES.md, the quick look and the record). The row opens it by
 * click or by Enter, and "Quick look" is the first entry in the row's "…" menu, so nothing is
 * pointer-only. "Open" goes to the record page, which is the thing that carries a link.
 */
export interface QuickLookSpec<T> {
  title: (row: T) => string
  fields: (row: T) => QuickLookField[]
  /** At most one editable field, and which one it is may depend on who is looking. */
  editable?: (row: T) => QuickLookEditable | undefined
  onOpen: (row: T) => void
}

export interface TablePageProps<T> {
  title: string
  /**
   * The family these rows belong to — a page id like "people", or a pane kind. The title takes its
   * icon and ink, and the quick look takes its top bar (DESIGN.md §5). A page names its family; it
   * never names a colour.
   */
  family?: string
  description?: string
  total?: number
  /** What the page is a list of, so the count and the search box say what they are about. */
  noun?: string
  rows: T[]
  rowKey: (row: T) => string
  columns: Column<T>[]
  searchText: (row: T) => string
  filters?: Filter<T>[]
  /** Visible on hover and on keyboard focus. The same actions also live in the "…" menu, so nothing is hover-only. */
  rowActions?: RowAction<T>[]
  moreActions?: MoreAction<T>[]
  primary?: { label: string; onClick: () => void }
  pageSize?: number
  quickLook?: QuickLookSpec<T>
}

export function TablePage<T>(p: TablePageProps<T>) {
  const [q, setQ] = useState("")
  const [active, setActive] = useState<Record<string, string>>({})
  const [limit, setLimit] = useState(p.pageSize ?? 25)
  const [glancing, setGlancing] = useState<T | null>(null)

  // Fold whatever does not fit the box the table is actually in (LAYOUTS.md §5, §6).
  const fit = useFitColumns(p.columns)

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return p.rows.filter((r) => {
      if (needle && !p.searchText(r).toLowerCase().includes(needle)) return false
      for (const f of p.filters ?? []) {
        const v = active[f.key]
        if (v && v !== "all" && f.get(r) !== v) return false
      }
      return true
    })
  }, [p, q, active])

  // A row as it reads at 400: the first column is the name, the rest are labelled, and the row's
  // own menu is where it is on the table. Never a table with its last columns cut off.
  const phoneRow = (r: T) => (
    <div key={p.rowKey(r)} data-item={p.rowKey(r)} className="flex items-start gap-2 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="t-body font-medium">{p.columns[0]?.status ? <Chip status={p.columns[0].status(r)} /> : p.columns[0]?.cell(r)}</div>
        <dl className="mt-1 grid grid-cols-[minmax(5rem,auto)_minmax(0,1fr)] gap-x-3 gap-y-0.5">
          {p.columns.slice(1).map((c) => (
            <div key={c.key} className="col-span-2 grid grid-cols-subgrid items-baseline">
              <dt className="t-small text-muted-foreground">{c.header}</dt>
              <dd className="t-small min-w-0">{c.status ? <Chip status={c.status(r)} /> : c.cell(r)}</dd>
            </div>
          ))}
        </dl>
      </div>
      {p.moreActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="ghost" aria-label={p.quickLook ? `Actions for ${p.quickLook.title(r)}` : "More actions"}><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {p.quickLook && <DropdownMenuItem onSelect={() => setGlancing(r)}>Quick look</DropdownMenuItem>}
            {(p.rowActions ?? []).map((a, i) => <DropdownMenuItem key={i} onSelect={() => a.onClick(r)}>{lbl(a, r)}</DropdownMenuItem>)}
            {p.rowActions && p.rowActions.length > 0 && <DropdownMenuSeparator />}
            {p.moreActions.map((a) => (
              <DropdownMenuItem key={a.label} onSelect={() => a.onClick(r)} className={a.destructive ? "text-destructive" : undefined}>{a.label}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )

  return (
    <>
      <IndexPage
        family={p.family ?? "home"}
        title={p.title}
        description={p.description}
        actions={p.primary ? [{ kind: "primary", label: p.primary.label, onClick: p.primary.onClick }] : undefined}
        filters={{
          search: { value: q, onChange: setQ },
          filters: (p.filters ?? []).map((f) => ({
            kind: "one" as const,
            name: f.label,
            value: active[f.key] ?? "all",
            onChange: (v: string) => setActive((a) => ({ ...a, [f.key]: v })),
            options: f.options.map((o) => ({ value: o, label: o })),
          })),
          count: { shown: rows.length, total: p.total ?? p.rows.length, noun: p.noun ?? "rows" },
          doorId: `table.${p.title}`,
        }}
        tableRef={fit.ref}
        table={(
        <Table>
          <TableHeader className="bg-muted sticky top-0">
            <TableRow>
              {fit.shown.map((c) => <TableHead key={c.key} className={cn("t-label", chipColumn(c) && "min-w-36", c.className)}>{c.header}</TableHead>)}
              {/* The first column takes the slack; without that the actions column absorbs it. */}
              {(p.rowActions || p.moreActions) && <TableHead className="w-px whitespace-nowrap"><span className="sr-only">Actions</span></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, limit).map((r) => (
              <TableRow
                key={p.rowKey(r)}
                // The row you are on is the raised surface: hovered, focused, or the one the quick
                // look is open on (DESIGN.md §5, the three depths).
                className={cn(
                  "group hover:[background-color:var(--muted)] focus-visible:[background-color:var(--muted)]",
                  p.quickLook && "cursor-pointer",
                  glancing && p.rowKey(glancing) === p.rowKey(r) && "[background-color:var(--muted)]",
                )}
                tabIndex={p.quickLook ? 0 : undefined}
                onClick={p.quickLook ? (e) => { e.currentTarget.focus(); setGlancing(r) } : undefined}
                onKeyDown={p.quickLook ? (e) => { if (e.key === "Enter" && e.target === e.currentTarget) { e.preventDefault(); setGlancing(r) } } : undefined}
              >
                {fit.shown.map((c, i) => (
                  <TableCell key={c.key} className={cn("t-body py-2 tabular-nums", chipColumn(c) && "min-w-36 whitespace-nowrap", c.className)}>
                    {/* A column that shows a state word draws it as a status chip, from the one set,
                        always with the word in it. */}
                    {c.status ? <Chip status={c.status(r)} /> : c.cell(r)}
                    {/* What did not fit reads under the row's own name, never off the right edge. */}
                    {i === 0 && fit.folded.length > 0 && (
                      <MetaLine values={fit.folded.map((f) => ({ key: f.key, label: f.header, value: f.status ? <Chip status={f.status(r)} /> : f.cell(r) }))} />
                    )}
                  </TableCell>
                ))}
                {(p.rowActions || p.moreActions) && (
                  <TableCell className="py-1 pr-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {(p.rowActions ?? []).map((a, i) => (
                        <Button
                          key={i}
                          size="sm"
                          variant="ghost"
                          className="h-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                          onClick={() => a.onClick(r)}
                        >
                          {a.icon && <a.icon className="size-3.5" aria-hidden="true" />}
                          {lbl(a, r)}
                        </Button>
                      ))}
                      {p.moreActions && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon-sm" variant="ghost" aria-label={p.quickLook ? `Actions for ${p.quickLook.title(r)}` : "More actions"}><MoreHorizontal className="size-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {p.quickLook && <DropdownMenuItem onSelect={() => setGlancing(r)}>Quick look</DropdownMenuItem>}
                            {(p.rowActions ?? []).map((a, i) => <DropdownMenuItem key={i} onSelect={() => a.onClick(r)}>{lbl(a, r)}</DropdownMenuItem>)}
                            {p.rowActions && p.rowActions.length > 0 && <DropdownMenuSeparator />}
                            {p.moreActions.map((a) => (
                              <DropdownMenuItem key={a.label} onSelect={() => a.onClick(r)} className={a.destructive ? "text-destructive" : undefined}>{a.label}</DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={fit.shown.length + 1} className="t-body py-10 text-center text-muted-foreground">Nothing matches. Clear the search or a filter.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        )}
        rows={rows.slice(0, limit).map(phoneRow)}
        pager={rows.length > limit ? (
          <Button variant="outline" size="sm" onClick={() => setLimit((l) => l + (p.pageSize ?? 25))}>
            Show {Math.min(p.pageSize ?? 25, rows.length - limit)} more
          </Button>
        ) : undefined}
      />
      {p.quickLook && glancing && (
        <QuickLook
          open
          onOpenChange={(o) => { if (!o) setGlancing(null) }}
          family={p.family ?? "home"}
          title={p.quickLook.title(glancing)}
          fields={p.quickLook.fields(glancing)}
          editable={p.quickLook.editable?.(glancing)}
          onOpen={() => { const row = glancing; setGlancing(null); p.quickLook!.onOpen(row) }}
        />
      )}
    </>
  )
}

/** Small helpers shared by table pages. */
export function toast(msg: string) {
  document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: msg }))
}
