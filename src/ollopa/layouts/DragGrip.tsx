// The grip on a card that can be dragged, and the keyboard route that is not a drag.
//
// Hover may aid scanning; it may not be the only route to a control (memo 30, rule 13), and no
// design system read for memo 30 says what a board becomes for someone who cannot drag. So a card
// carries a visible grip at rest on a pointer, a stronger one on hover and focus, and a "Move to"
// menu that does the same thing with the keyboard.
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface DragGripProps {
  /** What is being moved, for the control's name: "Gatehouse Systems · Platform". */
  label: string
  /** Where it may go, in order. The one it is in now is left out by the caller. */
  places: { id: string; name: string }[]
  onMove: (placeId: string) => void
  className?: string
}

/**
 * The grip and its keyboard twin. Put it in the card's header, first, so the pointer finds it where
 * every other board puts it and the keyboard reaches it before the card's own content.
 */
export function DragGrip({ label, places, onMove, className }: DragGripProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Move ${label}`}
          title="Drag to move · or press to choose a stage"
          className={cn(
            "-ml-1 shrink-0 cursor-grab text-muted-foreground/70",
            "hover:text-foreground focus-visible:text-foreground group-hover/card:text-foreground",
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel className="t-small text-muted-foreground">Move {label} to</DropdownMenuLabel>
        {places.map((p) => (
          <DropdownMenuItem key={p.id} onSelect={() => onMove(p.id)}>{p.name}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
