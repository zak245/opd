// The two pieces every surface uses to say what a thing is and what state it is in.
//
// `FamilyIcon` draws a family's fixed glyph in its fixed ink; `Chip` draws a family or a status as
// a tinted word. They read `identity.ts` and nothing else, so no page picks a hue — which is the
// point of DESIGN.md §5. A family chip always carries its icon; a status chip always carries its
// word, so neither leans on colour alone.
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { familyOf, iconOf, statusOf, STATUSES, type Status } from "../identity"

/** 16 px in a row or a chip, 20 px in a header (DESIGN.md §5). */
export type IconSize = "row" | "header"

export function FamilyIcon({ of, size = "row", className, tone = "ink", label }: {
  /** A page id or a pane kind: "people", "deal", "agent-run". */
  of: string | undefined | null
  size?: IconSize
  className?: string
  /** `ink` for the family colour, `current` where the surrounding text already carries it. */
  tone?: "ink" | "current"
  /** Give it a name where it is the only thing saying what this is. */
  label?: string
}) {
  const Icon = iconOf(of)
  const family = familyOf(of)
  return (
    <Icon
      className={cn("shrink-0", size === "header" ? "size-5" : "size-4", className)}
      style={tone === "ink" ? { color: family.ink } : undefined}
      aria-hidden={label ? undefined : "true"}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  )
}

/** A thin bar in a family's hue: the pane's top edge, the active sidebar row's leading edge. */
export function FamilyBar({ of, className }: { of: string | undefined | null; className?: string }) {
  return <div aria-hidden="true" className={cn("shrink-0", className)} style={{ backgroundColor: familyOf(of).fill }} />
}

/**
 * A word in a tinted box. Two kinds and no third: a family chip says what an object is and carries
 * its icon; a status chip says what state a thing is in and always carries the word.
 */
export function Chip({ family, status, children, icon = true, className }: {
  /** A page id or a pane kind. Colours the chip by family. */
  family?: string | null
  /** A state word — "Active", "Bounced", "Paused". Colours the chip by what that word means. */
  status?: string | null
  children?: ReactNode
  /** Family chips carry their icon by default; turn it off only where the icon is already beside it. */
  icon?: boolean
  className?: string
}) {
  const word = children ?? status
  if (status !== undefined && status !== null) {
    const look = STATUSES[statusOf(status)]
    return (
      <span
        className={cn("t-small inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium", className)}
        style={{ backgroundColor: look.tint, color: look.ink }}
      >
        {word}
      </span>
    )
  }
  const look = familyOf(family)
  return (
    <span
      className={cn("t-small inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium", className)}
      style={{ backgroundColor: look.tint, color: look.ink }}
    >
      {icon && <FamilyIcon of={family} tone="current" className="size-3" />}
      {word ?? look.name}
    </span>
  )
}

/** The tone a status word maps to, for a page that draws its own row rather than a chip. */
export function statusTone(word: string | undefined | null): Status {
  return statusOf(word)
}
