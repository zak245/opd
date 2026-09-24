// Index: find and act on many things of one kind (LAYOUTS.md §1).
//
// **One shape, everywhere.** People, Companies, Lists, Sequences, Templates, Campaigns, Accounts,
// Workflows, Requests, the Tasks list and the Deals table are the same page with different rows:
// the same header, the same card, the same row, the same footer, the same keyboard. A page passes
// data, columns and acts. **It cannot pass a class, a width or an order** — that is the whole
// point, and it is why this file takes no `className`.
//
// The card header is the toolbar, and the toolbar is not built here: the search, the named
// controls, the one door and the count are the filters part's, handed in through `toolbar`.
//
// Anything a page needs that this shape has no room for goes in `slot`, the one named place, used
// the same way by every page that needs it: the Deals board/table switch, Campaigns' three object
// types, the Tasks list's "Expand all".
import { Fragment, useCallback, useMemo, type ReactNode } from "react"
import { ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { openBeside, type BesideTarget } from "../beside"
import { PageScroll } from "./frame"
import { MetaLine } from "./MetaLine"
import { PageFooter, PageHeader, Toolbar, type PageHeaderProps } from "./parts"
import { useFitColumns, type ColumnPriority } from "./columns"
import {
  FilterBar, FilterEmpty, clearFilter, filterSignature, useSettle,
  type FilterBarProps, type ResultCountProps,
} from "./filters"

export interface IndexColumn<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  /** Give a comparator and the header sorts. The template draws the control and the arrow. */
  sort?: (a: T, b: T) => number
  /** 1 is drawn at every width, 3 folds first. Unset means 2. */
  priority?: ColumnPriority
  /** Right-aligned numbers, a fixed width: the template decides how, the page says which. */
  numeric?: boolean
}

export interface IndexPageProps<T> extends Omit<PageHeaderProps, "className"> {
  /**
   * The filtering pattern (LAYOUTS.md §2), drawn in the card's header by `FilterBar`: the search,
   * the seat's named filters, the one "Filters and views" door, the count at the trailing edge,
   * the applied line and the one "Clear all". A page hands over the parts, never the row.
   */
  filters?: FilterBarProps
  /** An already-built row, for a page that has not come onto `filters` yet. */
  toolbar?: ReactNode

  columns: IndexColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  /**
   * **What a click on the row's name opens: the pane beside the page, not the page.**
   *
   * Give the object this row is — `(row) => ({ kind: "list", id: row.id })` — and the template
   * does the rest: a plain left click on the name opens it beside, with the ids of every row in
   * the order shown and this row's place among them, so `[` and `]` walk the list. The name keeps
   * its real `href`, so copy-link, middle-click and ⌘-click still go to the page, and a modified
   * click is left alone. Opening the whole page is the deliberate step: it stays on the row's "…".
   *
   * Return `null` for a row that has no pane. Without this prop the name behaves as the page drew
   * it (BUILD-CHAINS.md: beside, not instead).
   */
  beside?: (row: T) => BesideTarget | null
  /** The row's name, as a link. Its chips sit inline beside it. */
  name: (row: T) => ReactNode
  /** What the name column is called. The page's own title, unless it reads oddly in a header. */
  nameHeader?: string
  /**
   * The row's one visible act, at the trailing edge before the "…" (LAYOUTS.md §4). One act, the
   * one this seat uses most; everything else is in the menu. Drawn at rest, never on hover only.
   */
  acts?: (row: T) => ReactNode
  /** The row's "…" menu, at the trailing edge. */
  menu?: (row: T) => ReactNode
  /**
   * Detail that belongs to one row and is too big for a cell — a per-row door such as Accounts'
   * "Signals and news". Return the content while the page has the row open and `null` when it is
   * closed: it is drawn as a full-width sub-row under its own row, never inside the name cell.
   */
  subRow?: (row: T) => ReactNode
  /** Attributes a row must carry to be found again: `data-item`, a click, a keyboard handler. */
  rowProps?: (row: T) => Record<string, unknown>
  /** The name column sorts too, under the key "name". */
  nameSort?: (a: T, b: T) => number
  /** Which column the rows are in the order of, and which way. The template does the sorting. */
  sort?: { key: string; dir: "asc" | "desc" }
  onSort?: (key: string, dir: "asc" | "desc") => void

  /** Bulk acts. A checkbox column appears when and only when this is given. */
  bulk?: {
    selected: string[]
    onChange: (ids: string[]) => void
    /** The bar that replaces the pager while rows are selected. */
    bar: ReactNode
  }
  /** The pager, in the card's footer. */
  pager?: ReactNode
  /**
   * What the table says when nothing matches. Left out on a page that passes `filters`, the
   * pattern's own `FilterEmpty` names the filter that emptied the list and offers to clear it.
   */
  empty?: ReactNode

  /**
   * The one named place for what this shape has no room for: a view switch, a set of object tabs,
   * an "Expand all". It sits between the page header and the card, at the leading edge, on every
   * page that needs it.
   */
  slot?: ReactNode
  /** Above the card and below the slot: a summary band. Never filters. */
  above?: ReactNode
}

export function IndexPage<T>({
  filters, toolbar,
  columns, rows: given, rowKey, name, nameHeader, beside, acts, menu, subRow, rowProps, nameSort, sort, onSort,
  bulk, pager, empty, slot, above, ...header
}: IndexPageProps<T>) {
  // The row's name is drawn outside this set, so every column in it may fold into the meta line.
  const fit = useFitColumns(columns, { priorityOf: (c) => c.priority, keepFirst: false })

  // The order is the template's: a page says which column and which way, and hands over a
  // comparator per column, so no two indexes sort by different means.
  const rows = useMemo(() => {
    const of = sort?.key === "name" ? nameSort : columns.find((c) => c.key === sort?.key)?.sort
    if (!sort || !of) return given
    const out = [...given].sort(of)
    return sort.dir === "desc" ? out.reverse() : out
  }, [given, columns, sort, nameSort])

  // A filter change does not swap the rows under the person: they settle, on the one duration and
  // the one curve the pattern owns (`MOTION`), and stand still under `prefers-reduced-motion`.
  const settle = useSettle(filters ? `${filterSignature(filters)}|${rows.length}` : rows.length)

  // "Clear all" is the pattern's, derived from the filters themselves: no page writes one, and no
  // page can write one that forgets a filter it added later.
  const clearAll = useCallback(() => {
    filters?.search?.onChange("")
    for (const f of filters?.filters ?? []) clearFilter(f)
  }, [filters])

  const noun = nounOf(filters)
  const nothing = empty ?? (filters
    ? (
      <FilterEmpty
        noun={noun}
        filters={filters.filters}
        search={filters.search?.value}
        onClearSearch={() => filters.search?.onChange("")}
        onClearAll={clearAll}
      />
    )
    : "Nothing matches. Clear the search or a filter.")

  const span = fit.shown.length + 1 + (bulk ? 1 : 0) + (acts || menu ? 1 : 0)
  const allOn = rows.length > 0 && rows.every((r) => bulk?.selected.includes(rowKey(r)))
  const someOn = (bulk?.selected.length ?? 0) > 0

  // The ids in the order shown, worked out once per render: the pane is handed the list it was
  // opened from, which is what `[` and `]` walk.
  const ids = useMemo(() => rows.map(rowKey), [rows, rowKey])

  /**
   * A plain click on the name opens the pane. It is caught here, on the way down, so the page's own
   * link handler never runs: no page can make its name open the whole record by mistake.
   */
  const interceptName = (r: T, index: number) => (e: React.MouseEvent<HTMLElement>) => {
    if (!beside) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    // A click on a chip beside the name is not a click on the name.
    const link = (e.target as HTMLElement).closest("a")
    if (!link) return
    const target = beside(r)
    if (!target) return
    e.preventDefault()
    e.stopPropagation()
    openBeside({ ...target, list: { ids, index }, opener: link })
  }

  const row = (r: T, index: number) => {
    const id = rowKey(r)
    return (
      <TableRow key={id} {...(rowProps?.(r) ?? {})}>
        {bulk && (
          <TableCell className="w-8" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              aria-label={`Select ${id}`}
              checked={bulk.selected.includes(id)}
              onCheckedChange={(v) => bulk.onChange(v ? [...bulk.selected, id] : bulk.selected.filter((x) => x !== id))}
            />
          </TableCell>
        )}
        {/* `w-full max-w-0` gives the name cell whatever the other columns leave and nothing more,
            so a long meta line truncates inside it instead of pushing the table sideways; the
            minimum is what keeps the name readable — under it, a column folds instead. */}
        <TableCell className="t-body w-full max-w-0 min-w-[12rem] py-2">
          <span className="flex min-w-0 flex-wrap items-center gap-2" onClickCapture={interceptName(r, index)}>
            {name(r)}
          </span>
          <MetaLine values={fit.folded.map((c) => ({ key: c.key, label: c.header, value: c.cell(r) }))} />
        </TableCell>
        {fit.shown.map((c) => (
          <TableCell key={c.key} className={cn("t-body py-2", c.numeric && "tabular-nums")}>{c.cell(r)}</TableCell>
        ))}
        {(acts || menu) && (
          <TableCell style={{ width: 1 }} className="py-1 pr-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-end gap-1 whitespace-nowrap">
              {acts?.(r)}
              {menu?.(r)}
            </div>
          </TableCell>
        )}
      </TableRow>
    )
  }

  /** The row, and under it the detail the page has opened for that row. */
  const rowWithDetail = (r: T, index: number) => {
    const under = subRow?.(r)
    if (!under) return row(r, index)
    return (
      <Fragment key={`${rowKey(r)}-group`}>
        {row(r, index)}
        <TableRow data-sub-row={rowKey(r)} className="hover:bg-transparent">
          <TableCell colSpan={span} className="bg-muted/30 py-3">{under}</TableCell>
        </TableRow>
      </Fragment>
    )
  }

  return (
    <PageScroll>
      <PageHeader {...header} />
      {slot && <div className="flex flex-wrap items-center gap-2">{slot}</div>}
      {above}
      <Card className="gap-0 overflow-hidden py-0">
        {(filters || toolbar) && (
          <>
            <CardHeader className="gap-2 py-3 [grid-template-columns:minmax(0,1fr)]">
              {filters ? <FilterBar {...filters} /> : toolbar}
            </CardHeader>
            <Separator />
          </>
        )}
        <CardContent className="px-0">
          <div ref={fit.ref} className="w-full min-w-0">
            <div className={cn("w-full min-w-0", settle.className)} style={settle.style} data-settling={settle["data-settling"]}>
            <Table>
              <TableHeader>
                <TableRow>
                  {bulk && (
                    <TableHead className="w-8">
                      <Checkbox
                        aria-label={allOn ? "Clear the selection" : `Select the ${rows.length} rows shown`}
                        checked={allOn}
                        onCheckedChange={(v) => bulk.onChange(v ? rows.map(rowKey) : [])}
                      />
                    </TableHead>
                  )}
                  <TableHead className="t-label" aria-sort={ariaSort(sort, "name")}>
                    {nameSort && onSort
                      ? sortable(nameHeader ?? header.title, "name", sort, onSort)
                      : nameHeader ?? header.title}
                  </TableHead>
                  {fit.shown.map((c) => (
                    <TableHead key={c.key} className="t-label" aria-sort={ariaSort(sort, c.key)}>
                      {c.sort && onSort ? sortable(c.header, c.key, sort, onSort) : c.header}
                    </TableHead>
                  ))}
                  {(acts || menu) && <TableHead style={{ width: 1 }}><span className="sr-only">Actions</span></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(rowWithDetail)}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={span}
                               className="t-body py-10 text-center text-muted-foreground">
                      {nothing}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </div>
        </CardContent>
        {(pager || (someOn && bulk)) && (
          <>
            <Separator />
            <CardFooter className="justify-center py-3">
              {someOn && bulk ? <div className="flex w-full flex-wrap items-center gap-2">{bulk.bar}</div> : pager}
            </CardFooter>
          </>
        )}
      </Card>
    </PageScroll>
  )
}

/** The older shape, kept while the pages that still compose their own table move across. */
export interface LegacyIndexPageProps extends PageHeaderProps {
  /** The filtering pattern, exactly as `IndexPage` takes it. */
  filters?: FilterBarProps
  /**
   * An already-built row. **Only the lesson stages use this**, because a lesson exists to show the
   * version we are criticising and has to be allowed to draw it. No product page passes it: a page
   * that can draw its own filter row can make its index look like a different product.
   */
  toolbar?: ReactNode
  table: ReactNode
  tableRef?: React.Ref<HTMLDivElement>
  rows?: ReactNode
  pager?: ReactNode
  bulk?: ReactNode
  above?: ReactNode
  children?: ReactNode
}

export function LegacyIndexPage({
  filters, toolbar, table, tableRef, rows, pager, bulk, above, children, ...header
}: LegacyIndexPageProps) {
  return (
    <PageScroll footer={bulk ? <PageFooter>{bulk}</PageFooter> : undefined}>
      <PageHeader {...header} />
      {above}
      <Card className="gap-0 overflow-hidden py-0">
        {filters || toolbar ? (
          <>
            <CardHeader className="gap-2 py-3 [grid-template-columns:minmax(0,1fr)]">
              {filters ? <Toolbar {...filters} /> : toolbar}
            </CardHeader>
            <Separator />
          </>
        ) : null}
        <CardContent className="px-0">
          <div ref={tableRef} className={cn("w-full min-w-0", rows ? "hidden sm:block" : "block")}>{table}</div>
          {rows && <div className="sm:hidden [&>*+*]:border-t [&>*+*]:border-border">{rows}</div>}
        </CardContent>
        {pager && <><Separator /><CardFooter className="justify-center py-3">{pager}</CardFooter></>}
      </Card>
      {children}
    </PageScroll>
  )
}

type SortState = { key: string; dir: "asc" | "desc" } | undefined

const ariaSort = (sort: SortState, key: string) =>
  sort?.key !== key ? "none" : sort.dir === "asc" ? "ascending" : "descending"

/** A header that sorts: the word, an arrow, and the library's own focus ring. Nothing bespoke. */
function sortable(label: string, key: string, sort: SortState, onSort: (k: string, d: "asc" | "desc") => void) {
  const on = sort?.key === key
  return (
    <button
      type="button"
      className="flex items-center gap-1 whitespace-nowrap text-left hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      onClick={() => onSort(key, on && sort!.dir === "asc" ? "desc" : "asc")}
    >
      <span>{label}</span>
      <ChevronsUpDown
        aria-hidden="true"
        className={cn("size-3 shrink-0", on ? "text-foreground" : "text-muted-foreground/50", on && sort!.dir === "desc" && "rotate-180")}
      />
    </button>
  )
}

/** What the page is a list of, for the empty state and the count: "people", "lists". */
function nounOf(filters?: FilterBarProps): string {
  const c = filters?.count
  return typeof c === "object" && c !== null && "noun" in c ? String((c as ResultCountProps).noun) : "rows"
}
