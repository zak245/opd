// A card's body when it holds facts rather than rows.
//
// The wall this exists to stop: "Scale · 42 seats · $5,418 a month, billed annually · renews 15
// January 2027" — four facts in one value, read as prose, scanned by nobody. A value may join at
// most three short facts with "·"; the fourth is a field of its own, on the shared column grid
// (LAYOUTS.md §6). Anything left that is not a fact is education, and education goes (DESIGN.md §3).
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export interface Field {
  /** Stable, and the usage-model item id where there is one. */
  id?: string
  label: string
  /** One fact, or at most three joined with "·". Four is four fields. */
  value: ReactNode
  /** A second, quieter line: where it came from, when it was last touched. */
  note?: ReactNode
  /** The field's own control, at the trailing edge of its row. */
  action?: ReactNode
  /** The whole row, for a value that is a strip or a chart. */
  wide?: boolean
  [key: `data-${string}`]: unknown
}

/**
 * ```tsx
 * <Fields fields={[
 *   { label: "Plan", value: "Scale · 42 seats" },
 *   { label: "Price", value: "$5,418 a month", note: "billed annually" },
 *   { label: "Renews", value: "15 January 2027", action: <Button size="sm" variant="outline">Change plan</Button> },
 * ]} />
 * ```
 *
 * Labels and values sit on one shared column grid, so the eye reads down a column and not through a
 * sentence. Rows are divided by the library's rule.
 */
export function Fields({ fields, columns = 1, className }: {
  fields: Field[]
  /** Two columns where the values are short. The grid is shared; a page never sets a width. */
  columns?: 1 | 2
  className?: string
}) {
  if (fields.length === 0) return null
  return (
    <dl className={cn(
      "grid gap-x-6",
      columns === 2 ? "sm:grid-cols-2" : "grid-cols-1",
      className,
    )}>
      {fields.map((f, i) => {
        const { id, label, value, note, action, wide, ...rest } = f
        return (
          <div key={id ?? label} className={cn("min-w-0", wide && "sm:col-span-full")} {...rest}>
            {i > 0 && columns === 1 && <Separator className="my-0" />}
            <div className="grid grid-cols-[minmax(7rem,14rem)_minmax(0,1fr)_auto] items-baseline gap-x-4 py-2 max-sm:grid-cols-[minmax(0,1fr)_auto]">
              <dt className="t-label text-muted-foreground max-sm:col-span-2">{label}</dt>
              <dd className="t-body min-w-0">
                {value}
                {note && <div className="t-small text-muted-foreground">{note}</div>}
              </dd>
              {action && <div className="justify-self-end max-sm:col-span-2 max-sm:justify-self-start">{action}</div>}
            </div>
          </div>
        )
      })}
    </dl>
  )
}

/** A list of rows inside a card, divided by the library's rule and never by a border of our own. */
export function Rows({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("[&>*+*]:border-t [&>*+*]:border-border", className)}>{children}</div>
}
