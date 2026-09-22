// The things that put content in a container.
//
// A component says what it is — a table, a pane, a menu — and `src/theme/levels.ts` says which
// colour role that takes and whether it floats. Nothing else in the product paints a surface, so
// moving a card behind a pane is one line in that map.
//
// `Container` is the shape the rule asks for: a heading row with the title, its count and its
// toolbar, a body, and an optional footer for a pager. `Group` is the one container-low region a
// container may hold. A container inside a container is two groups where there is one thing, so it
// is refused in development (Palmer 1992: the smallest enclosing box wins).
import {
  createContext, createElement, useContext,
  type ElementType, type ReactNode,
} from "react"
import { cn } from "@/lib/utils"
import { surfaceFor, type Component, type Role } from "@/theme/levels"

/* --------------------------------------------------------------------------------- the surface */

export interface SurfaceProps {
  /** The element to draw. A surface is not a div by default: say what it is. */
  as?: ElementType
  /** What this is — "table", "pane", "menu". The map decides the role and the shadow. */
  component?: Component
  /** A role directly, where a thing has no name in the map yet. */
  role?: Role
  className?: string
  children?: ReactNode
  [key: string]: unknown
}

export function Surface({ as = "div", component, role, className, children, ...rest }: SurfaceProps) {
  return createElement(as, { className: cn(surfaceClass(component ?? role ?? "page"), className), ...rest }, children)
}

/** The classes alone, for a component whose element is drawn by something else (a Radix content). */
export function surfaceClass(what: Component | Role): string {
  const t = surfaceFor(what)
  return cn(t.className, t.elevationClass, t.border === "strong" && "border", t.border === "soft" && "border")
}

/* ------------------------------------------------------------------------------- the container */

const InsideContainer = createContext(false)

let warned = false
function warnNested(heading: ReactNode) {
  if (!import.meta.env.DEV || warned) return
  warned = true
  console.warn(
    `[ollopa/Container] A container is being drawn inside a container${typeof heading === "string" ? ` ("${heading}")` : ""}. ` +
    "The smallest enclosing box wins, so two boxes read as two groups where there is one thing " +
    "(DESIGN.md §5, containment). Use a divider or a <Group> band instead of a second box.",
  )
}

export interface ContainerProps {
  as?: ElementType
  /** What this container holds: "table", "section", "form", "list", "card". Decides the role. */
  component?: Component
  /** The heading, at the top-left of the container's header. */
  heading?: ReactNode
  /** The count beside the heading. A person decides whether to read a container from it. */
  count?: number | string
  /** The toolbar: search, filters, a primary act. Sits at the trailing edge of the header. */
  actions?: ReactNode
  /** The pager, or whatever closes the container. */
  footer?: ReactNode
  /** Padding inside the body. Off for a table or a list, which reach the container's edges. */
  padded?: boolean
  className?: string
  bodyClassName?: string
  children?: ReactNode
  [key: string]: unknown
}

export function Container({
  as = "section", component = "section", heading, count, actions, footer,
  padded = true, className, bodyClassName, children, ...rest
}: ContainerProps) {
  const inside = useContext(InsideContainer)
  if (inside) warnNested(heading)

  return (
    <InsideContainer.Provider value={true}>
      {createElement(
        as,
        { className: cn(surfaceClass(component), "overflow-hidden rounded-[var(--radius-container)]", className), ...rest },
        <>
          {(heading || actions) && (
            <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
              {heading && (
                <h2 className="t-section inline-flex items-baseline gap-2">
                  {heading}
                  {count !== undefined && <span className="t-label font-normal tabular-nums text-muted-foreground">{count}</span>}
                </h2>
              )}
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </header>
          )}
          <div className={cn(padded ? "px-4 pb-3" : "", bodyClassName)}>{children}</div>
          {footer && (
            <footer className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2">{footer}</footer>
          )}
        </>,
      )}
    </InsideContainer.Provider>
  )
}

/**
 * The one container-low region a container may hold: a card header, a summary strip, the row you
 * are on. If a group inside a container needs a boundary, this or a divider — never a second box.
 */
export function Group({ as = "div", component = "summaryStrip", className, children, ...rest }: {
  as?: ElementType
  component?: Component
  className?: string
  children?: ReactNode
  [key: string]: unknown
}) {
  return createElement(
    as,
    { className: cn(surfaceClass(component), className), ...rest },
    children,
  )
}
