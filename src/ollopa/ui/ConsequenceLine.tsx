// One sentence saying what a control will do, in the words the product uses everywhere:
// "Sends 1 email to Nadia Berg from marcus@ · 4 credits".
//
// Every approval item, every destructive action and every agent proposal carries one, before the
// click, never after (rule 7). It is text, not a tooltip: the FTC's 2022 dark-patterns report names
// the tooltip as the mechanism of a deceptive act.
import { cn } from "@/lib/utils"

export interface ConsequenceProps {
  sends?: number
  to?: string
  from?: string
  credits?: number
  changes?: string
}

/** The sentence as a plain string, so a button label or an aria-label can carry the same words. */
export function consequenceText(p: ConsequenceProps): string {
  const parts: string[] = []
  if (p.sends !== undefined) {
    let s = `Sends ${p.sends.toLocaleString()} email${p.sends === 1 ? "" : "s"}`
    if (p.to) s += ` to ${p.to}`
    if (p.from) s += ` from ${p.from}`
    parts.push(s)
  }
  if (p.changes) parts.push(p.changes)
  const sentence = parts.join(". ")
  const credits = p.credits !== undefined ? `${p.credits.toLocaleString()} credit${p.credits === 1 ? "" : "s"}` : ""
  if (!sentence) return credits
  return credits ? `${sentence} · ${credits}` : sentence
}

export function ConsequenceLine(p: ConsequenceProps & { className?: string }) {
  const text = consequenceText(p)
  if (!text) return null
  return <p className={cn("text-xs text-muted-foreground", p.className)}>{text}</p>
}
