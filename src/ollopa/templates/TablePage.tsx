import { useMemo, useState, type ReactNode } from "react"
import { MoreHorizontal, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Chip, FamilyIcon } from "../ui/Identity"
import { familyOf } from "../identity"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QuickLook, type QuickLookEditable, type QuickLookField } from "./QuickLook"

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

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3 px-6 pt-5">
        <div>
          <h2 className="t-title inline-flex items-center gap-2" style={{ color: familyOf(p.family).ink }}>
            <FamilyIcon of={p.family} size="header" />
            {p.title}
          </h2>
          {p.description && <p className="t-body text-muted-foreground">{p.description}</p>}
        </div>
        {p.primary && <Button onClick={p.primary.onClick}>{p.primary.label}</Button>}
      </div>
      <div className="flex flex-wrap items-center gap-2 px-6 py-3">
        <Input aria-label="Search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
        {(p.filters ?? []).map((f) => (
          <Select key={f.key} value={active[f.key] ?? "all"} onValueChange={(v) => setActive((a) => ({ ...a, [f.key]: v }))}>
            <SelectTrigger className="w-44" aria-label={f.label}><SelectValue placeholder={f.label} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{f.label}: all</SelectItem>
              {f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        ))}
        <span className="t-label ml-auto tabular-nums text-muted-foreground">
          {rows.length.toLocaleString()} shown{p.total ? ` of ${p.total.toLocaleString()}` : ""}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto border-t">
        <Table>
          <TableHeader className="surface-page sticky top-0">
            <TableRow>
              {p.columns.map((c) => <TableHead key={c.key} className={cn("t-label", c.className)}>{c.header}</TableHead>)}
              {(p.rowActions || p.moreActions) && <TableHead className="w-px"><span className="sr-only">Actions</span></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, limit).map((r) => (
              <TableRow
                key={p.rowKey(r)}
                // The row you are on is the raised surface: hovered, focused, or the one the quick
                // look is open on (DESIGN.md §5, the three depths).
                className={cn(
                  "group hover:[background-color:var(--surface-raised)] focus-visible:[background-color:var(--surface-raised)] focus-visible:[box-shadow:inset_0_0_0_1px_var(--border-strong)]",
                  p.quickLook && "cursor-pointer",
                  glancing && p.rowKey(glancing) === p.rowKey(r) && "[background-color:var(--surface-raised)]",
                )}
                tabIndex={p.quickLook ? 0 : undefined}
                onClick={p.quickLook ? (e) => { e.currentTarget.focus(); setGlancing(r) } : undefined}
                onKeyDown={p.quickLook ? (e) => { if (e.key === "Enter" && e.target === e.currentTarget) { e.preventDefault(); setGlancing(r) } } : undefined}
              >
                {p.columns.map((c) => (
                  <TableCell key={c.key} className={cn("t-body py-2 tabular-nums", c.className)}>
                    {/* A column that shows a state word draws it as a status chip, from the one set,
                        always with the word in it. */}
                    {c.status ? <Chip status={c.status(r)} /> : c.cell(r)}
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
              <TableRow><TableCell colSpan={p.columns.length + 1} className="t-body py-10 text-center text-muted-foreground">Nothing matches. Clear the search or a filter.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        {p.quickLook && glancing && (
          <QuickLook
            open
            onOpenChange={(o) => { if (!o) setGlancing(null) }}
            family={p.family}
            title={p.quickLook.title(glancing)}
            fields={p.quickLook.fields(glancing)}
            editable={p.quickLook.editable?.(glancing)}
            onOpen={() => { const row = glancing; setGlancing(null); p.quickLook!.onOpen(row) }}
          />
        )}
        {rows.length > limit && (
          <div className="flex justify-center border-t py-3">
            <Button variant="outline" size="sm" onClick={() => setLimit((l) => l + (p.pageSize ?? 25))}>Show {Math.min(p.pageSize ?? 25, rows.length - limit)} more</Button>
          </div>
        )}
      </div>
    </div>
  )
}

/** Small helpers shared by table pages. */
export function toast(msg: string) {
  document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: msg }))
}
