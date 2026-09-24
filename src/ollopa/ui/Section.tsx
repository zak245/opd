// A section of a page, composed from shadcn's Card and nothing else.
//
// The look — radius, border, shadow, padding — is shadcn's, shipped. This adds only the arrangement
// every section in the product shares: a heading with its count, a place for the section's own
// controls, the body, and a footer for a pager. It declares no colour, no shadow and no radius.
//
// It replaces the `Container` primitive of the withdrawn containment rule, which invented its own
// surface roles. The name is kept so the pages that adopted it keep working.
import type { ElementType, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export interface SectionProps {
  as?: ElementType
  /** The heading, top-left. */
  heading?: ReactNode
  /** The count beside it: a person decides whether to read a section from it. */
  count?: number | string
  /** The section's own controls, at the trailing edge of the header. */
  actions?: ReactNode
  /** A pager, or whatever closes the section. */
  footer?: ReactNode
  /** Off for a table or a list, which reach the card's edges. */
  padded?: boolean
  className?: string
  bodyClassName?: string
  children?: ReactNode
  [key: string]: unknown
}

export function Section({
  heading, count, actions, footer, padded = true, className, bodyClassName, children,
  as: _as, component: _component, level: _level, role: _role, border: _border, ...rest
}: SectionProps) {
  return (
    <Card className={cn("gap-3 py-4", className)} {...rest}>
      {(heading || actions) && (
        <CardHeader className={cn(
          "min-w-0 flex-wrap items-start gap-2 px-4 [grid-template-columns:minmax(0,1fr)]",
          heading && "sm:[grid-template-columns:auto_minmax(0,1fr)]",
        )}>
          {heading && (
            <CardTitle className="t-section inline-flex items-baseline gap-2">
              {heading}
              {count !== undefined && (
                <span className="t-label font-normal tabular-nums text-muted-foreground">{count}</span>
              )}
            </CardTitle>
          )}
          {actions && (
            <CardAction className={cn(
              "col-start-1 row-start-2 flex w-full min-w-0 flex-wrap items-center gap-2 justify-self-start",
              // With a heading beside them the controls sit at the trailing edge of its line; with
              // no heading they are the whole header and start at the card's own leading edge.
              heading ? "sm:col-start-2 sm:row-start-1 sm:justify-self-end" : "row-start-1",
            )}>
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

/** The previous name, for the files that adopted it. */
export const Container = Section

/**
 * A band inside a section — a summary strip, a row of facts. It carries no tint and no border: a
 * full-bleed grey bar inside a card body is the invented look the owner rejected, so grouping is
 * done with a `Divider` above it and the card's own padding around it.
 */
export function Group({ className, children, ...rest }: {
  className?: string
  children?: ReactNode
  [key: string]: unknown
}) {
  const { as: _as, component: _component, ...props } = rest
  return <div className={cn(className)} {...props}>{children}</div>
}
