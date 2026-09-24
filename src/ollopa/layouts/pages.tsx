// The remaining templates: Home, Wizard, Settings and the Form sheet.
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { PageScroll } from "./frame"
import { HomeGrid } from "./MasterDetail"
import { PageFooter, PageHeader, SummaryStrip, type PageHeaderProps, type SummaryFigure } from "./parts"

// ---------------------------------------------------------------------------------- HomePage

export interface HomePageProps extends PageHeaderProps {
  figures?: SummaryFigure[]
  /** The tiles. Each is a `Section`, and each is a door to an index or a record. */
  children: ReactNode
  above?: ReactNode
}

export function HomePage({ figures, children, above, ...header }: HomePageProps) {
  return (
    <PageScroll>
      <PageHeader {...header} />
      {above}
      {figures?.length ? <SummaryStrip figures={figures} /> : null}
      <HomeGrid>{children}</HomeGrid>
    </PageScroll>
  )
}

// ---------------------------------------------------------------------------------- WizardPage

export interface WizardStep {
  id: string
  name: string
  /** Said under the name in the step list: what this step decides. */
  note?: ReactNode
}

export interface WizardPageProps extends PageHeaderProps {
  steps: WizardStep[]
  current: string
  onGo?: (id: string) => void
  /** The step's own body, in one card. */
  children: ReactNode
  /** Back and continue, in the footer. */
  footer?: ReactNode
}

/**
 * Rare, ordered steps where later depends on earlier (LAYOUTS.md §1). The step list is a real list
 * of controls, not a decoration: a step already answered can be gone back to.
 */
export function WizardPage({ steps, current, onGo, children, footer, ...header }: WizardPageProps) {
  const at = Math.max(0, steps.findIndex((s) => s.id === current))
  const step = steps[at]
  return (
    <PageScroll footer={footer ? <PageFooter>{footer}</PageFooter> : undefined}>
      <PageHeader {...header} />
      <div className="grid min-w-0 gap-4 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
        <nav aria-label="The steps" className="grid gap-1">
          {steps.map((s, i) => {
            const here = s.id === current
            const done = i < at
            return (
              <Button
                key={s.id}
                variant={here ? "secondary" : "ghost"}
                className="h-auto w-full justify-start gap-2 py-2 text-left"
                aria-current={here ? "step" : undefined}
                disabled={!onGo || (!done && !here)}
                onClick={() => onGo?.(s.id)}
              >
                <Badge variant={here ? "default" : "outline"} className="shrink-0 tabular-nums">{i + 1}</Badge>
                <span className="min-w-0">
                  <span className="block truncate">{s.name}</span>
                  {s.note && <span className="t-small block truncate font-normal text-muted-foreground">{s.note}</span>}
                </span>
              </Button>
            )
          })}
        </nav>
        <Card className="min-w-0 gap-3 py-4">
          <CardHeader>
            <CardTitle as="h3" className="t-section">{step?.name}</CardTitle>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </PageScroll>
  )
}

// ---------------------------------------------------------------------------------- SettingsPage

export interface SettingsArea {
  id: string
  name: string
  count?: number | string
}

export interface SettingsPageProps extends PageHeaderProps {
  areas: SettingsArea[]
  current?: string
  onGo?: (id: string) => void
  /** One card per area, in the same order as the index. */
  children: ReactNode
  /** The save bar. It belongs to the page, not to any one panel. */
  save?: ReactNode
  above?: ReactNode
}

/** Grouped panels, each committed on its own, with the area index beside them (LAYOUTS.md §1). */
export function SettingsPage({ areas, current, onGo, children, save, above, ...header }: SettingsPageProps) {
  return (
    <PageScroll footer={save ? <PageFooter>{save}</PageFooter> : undefined}>
      <PageHeader {...header} />
      {above}
      <div className="grid min-w-0 gap-4 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
        <nav aria-label="The areas of Settings" className="grid gap-0.5 lg:sticky lg:top-2">
          {areas.map((a) => (
            <Button
              key={a.id}
              asChild={!onGo}
              variant={a.id === current ? "secondary" : "ghost"}
              className="h-auto w-full justify-start py-1.5 text-left"
              aria-current={a.id === current ? "true" : undefined}
              onClick={onGo ? () => onGo(a.id) : undefined}
            >
              {onGo ? (
                <span className="flex w-full items-baseline gap-2">
                  <span className="min-w-0 truncate">{a.name}</span>
                  {a.count !== undefined && <span className="t-small ml-auto tabular-nums text-muted-foreground">{a.count}</span>}
                </span>
              ) : (
                <a href={`#${a.id}`}>{a.name}</a>
              )}
            </Button>
          ))}
        </nav>
        <div className="grid min-w-0 gap-4">{children}</div>
      </div>
    </PageScroll>
  )
}

// ---------------------------------------------------------------------------------- FormSheet

export interface FormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  children: ReactNode
  /** The save bar. A form is one committed set of fields, so it always has one. */
  save: ReactNode
  side?: "right" | "bottom"
  className?: string
}

/**
 * One committed set of fields (LAYOUTS.md §1). A sheet, and the only thing a sheet is still for:
 * everything that is read beside the page is the beside pane now (LAYOUTS.md §3).
 */
export function FormSheet({ open, onOpenChange, title, description, children, save, side = "right", className }: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn("flex w-full flex-col gap-0 p-0 sm:max-w-md", className)}>
        <SheetHeader className="px-5 py-4">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <Separator />
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        <Separator />
        <SheetFooter className="flex-row justify-end gap-2 px-5 py-3">{save}</SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
