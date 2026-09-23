// A table that is a table where there is room and a divided list where there is not.
//
// LAYOUTS.md §5: "an index shows rows as a divided list, never a clipped table". The rule reached
// the index pages and not the tables *inside* records — a sequence's results, a company's contacts
// — which went on sitting in an `overflow-x-auto` div and losing their last columns at 400.
//
// One set of column definitions draws both: a shadcn Table above `md`, and below it one block per
// row with the same columns as label-and-value pairs. Nothing is removed; only the shape changes.
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { usePhone } from "./parts"

export interface RowsColumn<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
  /** Say it first, as the row's own name, rather than as one label among the rest. */
  lead?: boolean
  /** Left out of the stacked form: a column that repeats what the lead already says. */
  phone?: false
}

export interface RowsTableProps<T> {
  columns: RowsColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  /** Attributes a row must carry to be found again: `data-item`, an id, a click. */
  rowProps?: (row: T) => Record<string, unknown>
  /** What the table says when it has nothing in it. */
  empty?: ReactNode
  className?: string
}

/**
 * ```tsx
 * <RowsTable
 *   columns={[
 *     { key: "step", header: "Step", lead: true, cell: (r) => r.name },
 *     { key: "sent", header: "Sent", cell: (r) => r.sent },
 *   ]}
 *   rows={steps}
 *   rowKey={(r) => r.id}
 * />
 * ```
 */
export function RowsTable<T>({ columns, rows, rowKey, rowProps, empty, className }: RowsTableProps<T>) {
  const phone = usePhone()
  const lead = columns.find((c) => c.lead) ?? columns[0]
  const rest = columns.filter((c) => c !== lead && c.phone !== false)

  if (rows.length === 0 && empty) {
    return <div className={cn("t-body px-4 py-6 text-center text-muted-foreground", className)}>{empty}</div>
  }

  // Below `md` the same columns are a stack per row. No scroller, so nothing is cut off.
  if (phone) {
    return (
      <div className={cn("[&>*+*]:border-t [&>*+*]:border-border", className)}>
        {rows.map((r) => (
          <div key={rowKey(r)} className="px-4 py-3" {...(rowProps?.(r) ?? {})}>
            <div className="t-body font-medium">{lead.cell(r)}</div>
            <dl className="mt-1 grid grid-cols-[minmax(5rem,auto)_minmax(0,1fr)] gap-x-3 gap-y-0.5">
              {rest.map((c) => (
                <div key={c.key} className="col-span-2 grid grid-cols-subgrid items-baseline">
                  <dt className="t-small text-muted-foreground">{c.header}</dt>
                  <dd className="t-small min-w-0">{c.cell(r)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((c) => <TableHead key={c.key} className={cn("t-label", c.className)}>{c.header}</TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={rowKey(r)} {...(rowProps?.(r) ?? {})}>
            {columns.map((c) => (
              <TableCell key={c.key} className={cn("t-body py-2 tabular-nums", c.className)}>{c.cell(r)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
