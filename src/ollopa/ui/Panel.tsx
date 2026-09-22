// The panel: a side sheet for a subtask that must keep the page behind it in view.
//
// It is a container, not a level of its own beyond the one it costs: a panel may open a page, never
// another panel, and it never contains a door (rule 2). Focus moves in when it opens, is trapped
// while it is open, Escape closes it and focus returns to the control that opened it — all of which
// the shadcn sheet (Radix dialog) already does; this wrapper adds the rules and the shape.
import { type ReactNode } from "react"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { FlatProvider } from "./Door"
import { Separator } from "@/components/ui/separator"

export interface PanelProps {
  id: string
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: "right" | "bottom"
  children: ReactNode
  footer?: ReactNode
}

export function Panel({ id, title, open, onOpenChange, side = "right", children, footer }: PanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id={id}
        side={side}
        className={cn("bg-popover", "gap-0 p-0", side === "right" ? "w-full sm:max-w-lg" : "max-h-[85vh]")}
      >
        <SheetHeader className="px-5 py-4">
          <SheetTitle className="t-section">{title}</SheetTitle>
          <SheetDescription className="sr-only">Press Escape to close and return to the page.</SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm">
          {/* A panel never contains a door: anything openable inside renders flat. */}
          <FlatProvider value={true}>{children}</FlatProvider>
        </div>
        {footer && <><Separator /><SheetFooter className="px-5 py-3">{footer}</SheetFooter></>}
      </SheetContent>
    </Sheet>
  )
}
