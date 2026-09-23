// The frame every template sits in: the content width, the gutters and the scroller.
//
// LAYOUTS.md §6: about 1300 px on a structured page, the board fluid, set by the template and never
// by a page. A page that sets its own width is the bug this file exists to prevent.
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** The three widths a template may be. Anything else is a page laying itself out. */
export type Measure = "structured" | "fluid" | "reading"

const WIDTH: Record<Measure, string> = {
  // Structured work — an index, a record, settings, home. Memo 30, rule 9.
  structured: "mx-auto w-full max-w-[1300px]",
  // A board expands with its stages and has no maximum.
  fluid: "w-full",
  // Long prose — a wizard's step, a single committed form.
  reading: "mx-auto w-full max-w-[860px]",
}

export function Measured({ as: _as, measure = "structured", className, children }: {
  measure?: Measure
  className?: string
  children: ReactNode
  as?: never
}) {
  return <div className={cn(WIDTH[measure], className)}>{children}</div>
}

/**
 * A page's own scroller, with the gutters every template shares: 16 px at a phone, 24 px above it.
 * `pb-16` clears the phone's bottom bar; the shell pads nothing on the page's behalf.
 */
export function PageScroll({ measure = "structured", className, children, footer }: {
  measure?: Measure
  className?: string
  children: ReactNode
  /** Sticks to the bottom of this scroller rather than scrolling away with the content. */
  footer?: ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6", className)}>
        <Measured measure={measure} className="flex min-h-0 flex-col gap-4">{children}</Measured>
      </div>
      {footer}
    </div>
  )
}
