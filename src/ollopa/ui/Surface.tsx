// The one thing that paints a surface.
//
// A component says what it is — a card, a pane, a menu — and `src/theme/levels.ts` says how deep
// that is. Nothing else in the product applies a surface class by hand, so moving a component
// between levels is one line in that map and a component's own file never mentions a depth.
import { createElement, type ElementType, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { surfaceFor, type Component, type Level } from "@/theme/levels"

export interface SurfaceProps {
  /** The element to draw. A surface is not a div by default: say what it is. */
  as?: ElementType
  /** What this is — "card", "pane", "menu". The map decides the level. */
  component?: Component
  /** A level directly, where a thing has no name in the map yet. */
  level?: Level
  /** Draw the border that reads at this level. Off for a surface that is only a tone. */
  border?: boolean
  className?: string
  children?: ReactNode
  [key: string]: unknown
}

export function Surface({ as = "div", component, level, border = true, className, children, ...rest }: SurfaceProps) {
  const tokens = surfaceFor(component ?? level ?? "page")
  return createElement(
    as,
    { className: cn(tokens.className, border && tokens.level !== 0 && "border", className), ...rest },
    children,
  )
}

/** The class alone, for a component whose element is drawn by something else (a Radix content). */
export function surfaceClass(what: Component | Level, border = true): string {
  const tokens = surfaceFor(what)
  return cn(tokens.className, border && tokens.level !== 0 && "border")
}
