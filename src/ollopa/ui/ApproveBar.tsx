// The approval bar under a queue of pending agent items.
//
// "Approve all" carries the total in its label — "Approve 8 · send 8 emails · 32 credits" — and stays
// disabled until every item has been expanded or scrolled past once. Rule 7's corollary: disclosure
// that exceeds review capacity is the same as hiding. Shown 48 people a problematic agent action step
// by step, 88.5% saw it and 23.9% stopped it; the bar budgets the reviewer's attention, not the pixel.
import { Actions } from "./Actions"
import { consequenceText, type ConsequenceProps } from "./ConsequenceLine"

export interface ApproveItem {
  id: string
  consequence: ConsequenceProps
  /** True once the person expanded the item or scrolled past it. */
  expanded: boolean
}

export interface ApproveBarProps {
  items: ApproveItem[]
  onApproveAll: () => void
  onDeclineAll: () => void
}

export function approveAllLabel(items: ApproveItem[]): string {
  const sends = items.reduce((n, i) => n + (i.consequence.sends ?? 0), 0)
  const credits = items.reduce((n, i) => n + (i.consequence.credits ?? 0), 0)
  const parts = [`Approve ${items.length}`]
  if (sends) parts.push(`send ${sends.toLocaleString()} email${sends === 1 ? "" : "s"}`)
  if (credits) parts.push(`${credits.toLocaleString()} credit${credits === 1 ? "" : "s"}`)
  return parts.join(" · ")
}

export function ApproveBar({ items, onApproveAll, onDeclineAll }: ApproveBarProps) {
  if (items.length === 0) return null
  const unread = items.filter((i) => !i.expanded).length
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
      <div className="min-w-0 text-xs text-muted-foreground">
        {unread > 0
          ? null
          : items.map((i) => consequenceText(i.consequence)).slice(0, 1).join("") + (items.length > 1 ? ` and ${items.length - 1} more` : "")}
      </div>
      {/* The total is in the primary's own label, and the reason it is off — items nobody has read
          yet, which this person can change — sits beside it (DESIGN.md §1 and §3). */}
      <Actions
        className="ml-auto"
        surface="card"
        items={[
          {
            kind: "primary",
            label: approveAllLabel(items),
            onClick: onApproveAll,
            disabledBecause: unread > 0 ? `${unread} of ${items.length} not read yet` : undefined,
          },
          { kind: "secondary", label: `Decline ${items.length}`, onClick: onDeclineAll },
        ]}
      />
    </div>
  )
}
