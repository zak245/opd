// The parts every page is made of (LAYOUTS.md §2). A page fills these; it never lays itself out.
//
// Each part is a thin composition of shadcn as shipped. None of them declares a colour, a radius,
// a shadow or a spacing scale of its own: the library carries the look, `identity.ts` carries the
// six families and five statuses, and `Actions` carries the action grammar.
import { useId, useMemo, useState, useSyncExternalStore, type ReactNode } from "react"
import { SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"
import { Actions, type Action } from "../ui/Actions"
import { FamilyIcon } from "../ui/Identity"
import { familyOf } from "../identity"

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

export interface ToolbarControl {
  /** Used for the door's label and as the key. Say what the control is for: "Stage", "Owner". */
  name: string
  node: ReactNode
  /** Keep it out in front whatever the count: the search always is. */
  always?: boolean
}

/**
 * Search, filters, views, columns — in the card's header, never in the page header.
 *
 * At most five controls sit in front (LAYOUTS.md §2, memo 30 part H rule 15). The sixth and beyond
 * go behind one door, and the door is labelled by what is inside it, automatically — so a page
 * never has to decide what to hide or what to call it.
 */
export function Toolbar({ controls, count, max = 5, className }: {
  controls: ToolbarControl[]
  /** The count this toolbar filters, printed at the end of the row. */
  count?: ReactNode
  max?: number
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const phone = usePhone()
  const shown = useMemo(() => {
    const always = controls.filter((c) => c.always)
    const rest = controls.filter((c) => !c.always)
    // At 400 a toolbar of five rows is the page. One thing in front — the search — and one door
    // for the rest, so the content starts on the first screen (LAYOUTS.md §5).
    const room = phone ? 0 : Math.max(0, max - always.length)
    return { front: [...always, ...rest.slice(0, room)], behind: rest.slice(room) }
  }, [controls, max, phone])

  const label = shown.behind.length === 0 ? "" : phone
    ? "Filters and views"
    : `Filter by ${shown.behind.map((c) => c.name.toLowerCase()).join(", ")}`

  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
      <div className="flex w-full min-w-0 flex-wrap items-center gap-2">
        {shown.front.map((c) => <div key={c.name} className="shrink-0">{c.node}</div>)}
        {count !== undefined && (
          <span className="t-label ml-auto shrink-0 tabular-nums text-muted-foreground">{count}</span>
        )}
      </div>
      {shown.behind.length > 0 && (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="-ml-2" aria-controls={id}>
              <ChevronRight className={cn("transition-transform", open && "rotate-90")} aria-hidden="true" />
              <SlidersHorizontal aria-hidden="true" />
              {label}
              <Badge variant="outline" className="ml-1">{shown.behind.length}</Badge>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent id={id} className="pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {shown.behind.map((c) => <div key={c.name}>{c.node}</div>)}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
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
    // One line at 400, scrolled rather than wrapped: a strip that wraps to four rows is a block.
    <div className={cn("flex items-baseline gap-x-8 gap-y-2 py-2", phone ? "overflow-x-auto" : "flex-wrap", className)}>
      {figures.map((f) => (
        <div key={f.label} className={cn("min-w-0", phone && "shrink-0")}>
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
  heading, count, actions, footer, padded = true, className, bodyClassName, children,
  as: _as, component: _component, level: _level, role: _role, border: _border, ...rest
}: SectionProps) {
  return (
    <Card className={cn("gap-3 py-4", className)} {...rest}>
      {(heading || actions) && (
        <CardHeader className="min-w-0 flex-wrap items-start gap-2 px-4 [grid-template-columns:minmax(0,1fr)] sm:[grid-template-columns:auto_minmax(0,1fr)]">
          {heading && (
            <CardTitle className="t-section inline-flex items-baseline gap-2">
              {heading}
              {count !== undefined && (
                <span className="t-label font-normal tabular-nums text-muted-foreground">{count}</span>
              )}
            </CardTitle>
          )}
          {actions && (
            <CardAction className="col-start-1 row-start-2 flex w-full min-w-0 flex-wrap items-center gap-2 justify-self-start sm:col-start-2 sm:row-start-1 sm:justify-self-end">
              {actions}
            </CardAction>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(padded ? "px-4" : "px-0", bodyClassName)}>{children}</CardContent>
      {footer && <><Separator /><CardFooter className="px-4 pt-3">{footer}</CardFooter></>}
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
