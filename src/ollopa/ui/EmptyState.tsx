// What a list says when it is empty: what this is, what to do, and the control that does it.
// No onboarding tour, no illustration, no dismissible tip — the median in-product tip is opened once
// per thousand impressions, so the empty state is the teaching and it is the work itself.
import { type ReactNode } from "react"

export interface EmptyStateProps {
  title: string
  body: string
  action?: ReactNode
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed px-4 py-6 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">{body}</p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  )
}
