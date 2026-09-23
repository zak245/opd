// Index: find and act on many things of one kind (LAYOUTS.md §1).
//
// One full-width column (Polaris; memo 30 part H rule 1). The page header carries the object's
// acts, the card's header carries the toolbar, the card's body carries the rows and the card's
// footer carries the pager. At 400 the table becomes a divided list, because a clipped table is
// the one thing §5 forbids by name.
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PageScroll } from "./frame"
import { PageFooter, PageHeader, Toolbar, type PageHeaderProps, type ToolbarControl } from "./parts"

export interface IndexPageProps extends PageHeaderProps {
  /** Search, filters, views, columns. Five in front; the rest go behind one door, automatically. */
  controls?: ToolbarControl[]
  /** Printed at the end of the toolbar row: "9 of 800". */
  shown?: ReactNode
  /** The desktop body: a shadcn Table. Hidden at 400, where `rows` is shown instead. */
  table: ReactNode
  /** The box the table is measured against, so its columns can fold to fit it. */
  tableRef?: React.Ref<HTMLDivElement>
  /** The same things as a divided list, for 400. Falls back to the table when a page has none. */
  rows?: ReactNode
  /** The pager, in the card's footer. */
  pager?: ReactNode
  /** The bulk bar, stuck to the bottom of the page while a selection stands. */
  bulk?: ReactNode
  /** Anything above the card: a summary strip, a status row. Never filters. */
  above?: ReactNode
  children?: ReactNode
}

export function IndexPage({
  controls, shown, table, tableRef, rows, pager, bulk, above, children, ...header
}: IndexPageProps) {
  return (
    <PageScroll footer={bulk ? <PageFooter>{bulk}</PageFooter> : undefined}>
      <PageHeader {...header} />
      {above}
      <Card className="gap-0 overflow-hidden py-0">
        {controls?.length ? (
          <>
            <CardHeader className="gap-2 px-4 py-3 [grid-template-columns:minmax(0,1fr)]">
              <Toolbar controls={controls} count={shown} />
            </CardHeader>
            <Separator />
          </>
        ) : null}
        <CardContent className="px-0">
          {/* One set of things, drawn twice: a table where there is room, a divided list where
              there is not. Never a table with its last columns cut off. */}
          <div ref={tableRef} className={cn("w-full min-w-0", rows ? "hidden sm:block" : "block")}>{table}</div>
          {rows && <div className="sm:hidden [&>*+*]:border-t [&>*+*]:border-border">{rows}</div>}
        </CardContent>
        {pager && <><Separator /><CardFooter className="justify-center px-4 py-3">{pager}</CardFooter></>}
      </Card>
      {children}
    </PageScroll>
  )
}
