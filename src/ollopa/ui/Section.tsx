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
        <CardHeader className="flex-wrap items-start gap-2 px-4 [grid-template-columns:1fr] sm:[grid-template-columns:auto_1fr]">
          {heading && (
            <CardTitle className="t-section inline-flex items-baseline gap-2">
              {heading}
              {count !== undefined && (
                <span className="t-label font-normal tabular-nums text-muted-foreground">{count}</span>
              )}
            </CardTitle>
          )}
          {actions && (
            <CardAction className="col-start-1 row-start-2 flex w-full flex-wrap items-center gap-2 justify-self-start sm:col-start-2 sm:row-start-1 sm:justify-self-end">
              {actions}
            </CardAction>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(padded ? "px-4" : "px-0", bodyClassName)}>{children}</CardContent>
      {footer && <CardFooter className="border-t px-4 pt-3">{footer}</CardFooter>}
    </Card>
  )
}

/** The previous name, for the files that adopted it. */
export const Container = Section

/**
 * A band inside a section — a summary strip, a card header, the row you are on. It is a `div` with
 * shadcn's muted background and nothing else; the withdrawn rule's "container-low" role is gone.
 */
export function Group({ className, children, ...rest }: {
  className?: string
  children?: ReactNode
  [key: string]: unknown
}) {
  const { as: _as, component: _component, ...props } = rest
  return <div className={cn("bg-muted", className)} {...props}>{children}</div>
}
