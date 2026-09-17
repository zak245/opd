// A heading for a scrolling section or a side card: the name, what it holds, and at most one action.
// The count is part of the label, not decoration — a person decides whether to read a section from it.
import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface SectionHeaderProps {
  title: string
  count?: number
  action?: ReactNode
  className?: string
}

export function SectionHeader({ title, count, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2 pb-2", className)}>
      <h3 className="text-sm font-semibold">
        {title}
        {count !== undefined && <span className="ml-1.5 font-normal tabular-nums text-muted-foreground">{count}</span>}
      </h3>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  )
}
