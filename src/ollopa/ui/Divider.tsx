// The one rule between two things. It is shadcn's Separator and nothing else — the product has no
// divider of its own, so `border-t` and `border-b` used as a rule are a bug, not a style.
//
// Use it between rows of a list, between a card's sections, and beside a control in a bar
// (`orientation="vertical"`). Borders that draw a box — a Card's edge, an input's outline — are the
// component's own and stay where they are.
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function Divider({ className, orientation = "horizontal", ...rest }: React.ComponentProps<typeof Separator>) {
  return <Separator orientation={orientation} className={cn(orientation === "vertical" && "data-[orientation=vertical]:h-4", className)} {...rest} />
}
