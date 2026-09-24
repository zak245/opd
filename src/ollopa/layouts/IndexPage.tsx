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
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { PageScroll } from "./frame"
import { MetaLine } from "./MetaLine"
import { PageFooter, PageHeader, type PageHeaderProps } from "./parts"
import { useFitColumns, type ColumnPriority } from "./columns"

export interface IndexColumn<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  /** 1 is drawn at every width, 3 folds first. Unset means 2. */
  priority?: ColumnPriority
  /** Right-aligned numbers, a fixed width: the template decides how, the page says which. */
  numeric?: boolean
}

export interface IndexControl {
  /** Names the control in the door's label: "Stage", "Owner". */
  name: string
  node: ReactNode
}

export interface IndexPageProps<T> extends Omit<PageHeaderProps, "className"> {
  /**
   * The card header. The search, the named controls, the one "Filters and views" door and the
   * count live in here, and they are the filters agent's, not a page's: build them with the
   * `Toolbar` part and hand the result over. This template only decides where it sits.
   */
  toolbar?: ReactNode

  columns: IndexColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  /** The row's name, as a link. Its chips sit inline beside it. */
  name: (row: T) => ReactNode
  /** The row's "…" menu, at the trailing edge. */
  menu?: (row: T) => ReactNode
  /** Attributes a row must carry to be found again: `data-item`, a click, a keyboard handler. */
  rowProps?: (row: T) => Record<string, unknown>

  /** Bulk acts. A checkbox column appears when and only when this is given. */
  bulk?: {
    selected: string[]
    onChange: (ids: string[]) => void
    /** The bar that replaces the pager while rows are selected. */
    bar: ReactNode
  }
  /** The pager, in the card's footer. */
  pager?: ReactNode
  /** What the table says when nothing matches. */
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
  toolbar,
  columns, rows, rowKey, name, menu, rowProps,
  bulk, pager, empty, slot, above, ...header
}: IndexPageProps<T>) {
  const fit = useFitColumns(columns, { priorityOf: (c) => c.priority })

  const allOn = rows.length > 0 && rows.every((r) => bulk?.selected.includes(rowKey(r)))
  const someOn = (bulk?.selected.length ?? 0) > 0

  const row = (r: T) => {
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
        <TableCell className="t-body py-2">
          <span className="flex min-w-0 flex-wrap items-center gap-2">{name(r)}</span>
          <MetaLine values={fit.folded.map((c) => ({ key: c.key, label: c.header, value: c.cell(r) }))} />
        </TableCell>
        {fit.shown.map((c) => (
          <TableCell key={c.key} className={cn("t-body py-2", c.numeric && "tabular-nums")}>{c.cell(r)}</TableCell>
        ))}
        {menu && (
          <TableCell style={{ width: 1 }} className="py-1 pr-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-end">{menu(r)}</div>
          </TableCell>
        )}
      </TableRow>
    )
  }

  return (
    <PageScroll>
      <PageHeader {...header} />
      {slot && <div className="flex flex-wrap items-center gap-2">{slot}</div>}
      {above}
      <Card className="gap-0 overflow-hidden py-0">
        {toolbar && (
          <>
            <CardHeader className="gap-2 py-3 [grid-template-columns:minmax(0,1fr)]">{toolbar}</CardHeader>
            <Separator />
          </>
        )}
        <CardContent className="px-0">
          <div ref={fit.ref} className="w-full min-w-0">
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
                  <TableHead className="t-label">{header.title}</TableHead>
                  {fit.shown.map((c) => <TableHead key={c.key} className="t-label">{c.header}</TableHead>)}
                  {menu && <TableHead style={{ width: 1 }}><span className="sr-only">Actions</span></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row)}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={fit.shown.length + 1 + (bulk ? 1 : 0) + (menu ? 1 : 0)}
                               className="t-body py-10 text-center text-muted-foreground">
                      {empty ?? "Nothing matches. Clear the search or a filter."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
  controls?: { name: string; node: ReactNode; always?: boolean; pin?: boolean }[]
  shown?: ReactNode
  table: ReactNode
  tableRef?: React.Ref<HTMLDivElement>
  rows?: ReactNode
  pager?: ReactNode
  bulk?: ReactNode
  above?: ReactNode
  children?: ReactNode
}

export function LegacyIndexPage({
  controls, shown, table, tableRef, rows, pager, bulk, above, children, ...header
}: LegacyIndexPageProps) {
  return (
    <PageScroll footer={bulk ? <PageFooter>{bulk}</PageFooter> : undefined}>
      <PageHeader {...header} />
      {above}
      <Card className="gap-0 overflow-hidden py-0">
        {controls?.length ? (
          <>
            <CardHeader className="gap-2 py-3 [grid-template-columns:minmax(0,1fr)]">
              <Toolbar controls={controls} count={shown} />
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

import { Toolbar } from "./parts"
