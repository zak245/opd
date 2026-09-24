// The parts every page is made of (LAYOUTS.md §2). A page fills these; it never lays itself out.
//
// Each part is a thin composition of shadcn as shipped. None of them declares a colour, a radius,
// a shadow or a spacing scale of its own: the library carries the look, `identity.ts` carries the
// six families and five statuses, and `Actions` carries the action grammar.
import { useSyncExternalStore, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Actions, type Action } from "../ui/Actions"
import { FamilyIcon } from "../ui/Identity"
import { familyOf } from "../identity"
import { FilterBar, type FilterBarProps } from "./filters"

/** True below `sm`. Read, never rendered twice: two branches put every control in the DOM twice. */
const PHONE = "(max-width: 639px)"
export function usePhone() {
  return useSyncExternalStore(
    (f) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {}
      const m = window.matchMedia(PHONE)
      m.addEventListener("change", f)
      return () => m.removeEventListener("change", f)
    },
    () => typeof window !== "undefined" && window.matchMedia?.(PHONE).matches === true,
    () => false,
  )
}

// ---------------------------------------------------------------------------------- PageHeader

export interface PageHeaderProps {
  /** A page id or a pane kind: the family decides the icon and the title's ink. */
  family: string
  title: string
  /** How many things this page is about. Printed beside the title, never inside it. */
  count?: number | string
  /** One line under the title. Not a place for filters. */
  description?: ReactNode
  /** The one primary act, and anything else that belongs to the page rather than to a row. */
  actions?: Action[]
  /** Acts that go behind the "…" menu. */
  more?: Action[]
  /** A control that belongs on the title line rather than among the acts: "Expand all". */
  trailing?: ReactNode
  className?: string
}

/**
 * The top line of a page: the family icon and title, the count, the one primary act and the "…".
 * Never filters — those are the Toolbar's, inside the card (LAYOUTS.md §2).
 */
export function PageHeader({ family, title, count, description, actions, more, trailing, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-x-4 gap-y-2", className)}>
      <div className="min-w-0">
        <h2 className="t-title inline-flex items-center gap-2" style={{ color: familyOf(family).ink }}>
          <FamilyIcon of={family} size="header" />
          <span className="min-w-0">{title}</span>
          {count !== undefined && (
            <span className="t-body font-normal tabular-nums text-muted-foreground">
              · {typeof count === "number" ? count.toLocaleString() : count}
            </span>
          )}
        </h2>
        {description && <p className="t-body text-muted-foreground">{description}</p>}
      </div>
      {(actions?.length || more?.length || trailing) && (
        <div className="flex shrink-0 items-center gap-2">
          {actions?.length ? <Actions surface="page" items={actions} /> : null}
          {trailing}
          {more?.length ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`More for ${title}`}>…</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {more.map((a) => (
                  <DropdownMenuItem key={a.label} onSelect={() => a.onClick?.()}>{a.label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------------- StatusRow

/**
 * One line of state above the page: badges and, at a phone width, a line that scrolls rather than
 * wrapping. The shell draws the workspace's own row; this is for a page with state of its own.
 */
export function StatusRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 overflow-x-auto py-1", className)}>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------------- Toolbar

/**
 * The filter row in the card's header — search, the seat's filters, the one door, the count.
 *
 * It is the one filtering pattern (LAYOUTS.md §2), and `FilterBar` in `filters.tsx` is where it is
 * built. This is the name the pages import; it adds nothing and decides nothing. **A page declares
 * data only**: a filter's name, its kind, its options, its value and what changes it. There is no
 * way to hand the row a control, because a page that can draw the row can make its index look like
 * a different product, and four of them did.
 */
export function Toolbar(props: FilterBarProps) {
  return <FilterBar {...props} />
}

// ---------------------------------------------------------------------------------- SummaryStrip

export interface SummaryFigure {
  label: string
  value: ReactNode
  note?: ReactNode
  href?: string
}

/**
 * The numbers a page is judged by: one band, never a row of boxes (LAYOUTS.md §2). It is a band of
 * text on the page's own surface, so it does not compete with the sections under it.
 */
export function SummaryStrip({ figures, className }: { figures: SummaryFigure[]; className?: string }) {
  const phone = usePhone()
  if (figures.length === 0) return null
  return (
    // A band, at every width. On a phone it wraps onto two or three rows rather than scrolling:
    // a figure cut mid-word ("Clos…") is a number nobody can read (LAYOUTS.md §2).
    <div className={cn("flex flex-wrap items-baseline py-2", phone ? "gap-x-6 gap-y-1" : "gap-x-8 gap-y-2", className)}>
      {figures.map((f) => (
        <div key={f.label} className="min-w-0">
          <div className="t-label text-muted-foreground">{f.label}</div>
          <div className="t-section tabular-nums">
            {f.href ? <a className="underline-offset-4 hover:underline" href={f.href}>{f.value}</a> : f.value}
            {f.note && <span className="t-label ml-2 font-normal text-muted-foreground">{f.note}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------------- Section

export interface SectionProps {
  heading?: ReactNode
  count?: number | string
  /** The section's own controls, in its card header. */
  actions?: ReactNode
  /**
   * The heading level of the card's title. The page's own title is an `h2`, so a section card
   * under it is an `h3` — and a card nested inside a section is an `h4`. It changes the outline
   * a screen reader jumps through, never the look.
   */
  level?: 2 | 3 | 4
  footer?: ReactNode
  /** Turn the card's body padding off where the body is a table or a divided list. */
  padded?: boolean
  bodyClassName?: string
  className?: string
  children?: ReactNode
  [key: string]: unknown
}

/** One card per section, the heading and count on the card, the rows divided inside it. */
export function Section({
  heading, count, actions, footer, padded = true, className, bodyClassName, children, level = 3,
  as: _as, component: _component, role: _role, border: _border, ...rest
}: SectionProps) {
  return (
    <Card className={cn("gap-3 py-4", className)} {...rest}>
      {(heading || actions) && (
        <CardHeader className={cn(
          "min-w-0 flex-wrap items-start gap-2 [grid-template-columns:minmax(0,1fr)]",
          heading && "md:[grid-template-columns:minmax(0,auto)_minmax(0,1fr)]",
        )}>
          {heading && (
            // A heading is as long as the thing is called. It wraps inside its own column rather
            // than spilling into the action column, where its count ended up under a button.
            <CardTitle as={`h${level}`} className="t-section flex min-w-0 flex-wrap items-baseline gap-2">
              <span className="min-w-0">{heading}</span>
              {count !== undefined && (
                <span className="t-label font-normal tabular-nums text-muted-foreground">{count}</span>
              )}
            </CardTitle>
          )}
          {actions && (
            // Below `md` the section's controls drop under the heading and take the full width;
            // above it they sit at the trailing edge of the same line.
            <CardAction className={cn(
              "col-start-1 row-start-2 flex w-full min-w-0 flex-wrap items-center gap-2 justify-self-start",
              // With a heading beside them the controls sit at the trailing edge of its line; with
              // no heading they are the whole header and start at the card's own leading edge.
              heading && "md:col-start-2 md:row-start-1 md:w-auto md:justify-self-end",
              !heading && "row-start-1",
            )}>
              {actions}
            </CardAction>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(!padded && "px-0", bodyClassName)}>{children}</CardContent>
      {footer && <><Separator /><CardFooter className="pt-3">{footer}</CardFooter></>}
    </Card>
  )
}

/** The name the pages adopted before the layouts folder existed. */
export const Container = Section

/**
 * A band inside a section. No tint and no border: a full-bleed grey bar inside a card body is the
 * invented look the owner rejected, so grouping is a `Separator` and the card's own padding.
 */
export function Group({ className, children, ...rest }: {
  className?: string
  children?: ReactNode
  [key: string]: unknown
}) {
  const { as: _as, component: _component, ...props } = rest
  return <div className={cn(className)} {...props}>{children}</div>
}

/** A list of rows inside a section, divided by the library's rule and never by a border. */
export function Rows({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("[&>*+*]:border-t [&>*+*]:border-border", className)}>{children}</div>
  )
}

// ---------------------------------------------------------------------------------- SideRail

/**
 * The related things on a record: narrower than the main column at 1440, stacked under it at 1024
 * and below (LAYOUTS.md §5). The rail never carries the record's own decisions.
 */
export function SideRail({ children, className }: { children: ReactNode; className?: string }) {
  return <aside className={cn("grid min-w-0 gap-4", className)}>{children}</aside>
}

// ---------------------------------------------------------------------------------- PageFooter

/**
 * The pager, the bulk bar and the save bar. It sticks to the bottom of the page's own scroller, so
 * what it says about a selection stays true while the list is scrolled.
 */
export function PageFooter({ children, sticky = true, className }: {
  children: ReactNode
  sticky?: boolean
  className?: string
}) {
  return (
    <div className={cn(sticky && "sticky bottom-0 z-20", "bg-background", className)}>
      <Separator />
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 sm:px-6">{children}</div>
    </div>
  )
}
