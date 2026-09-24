// Master-detail, board, queue and home: the templates whose shape is the point.
//
// Each sets its own measure and its own three-width behaviour (LAYOUTS.md §5). Nothing is removed
// as the page narrows — only how much is visible at once.
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Split } from "./SplitHandle"
import { Measured } from "./frame"
import { PageHeader, Toolbar, type PageHeaderProps, type ToolbarControl } from "./parts"

/**
 * True below `sm`. Read rather than rendered twice: a template that draws both branches puts every
 * row in the DOM twice, which doubles what a screen reader walks and what a test script clicks.
 */
const PHONE = "(max-width: 639px)"
function usePhone() {
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

// ---------------------------------------------------------------------------------- MasterDetail

export interface MasterDetailProps extends PageHeaderProps {
  /** Remembered per person: the split's width. */
  id: string
  list: ReactNode
  detail: ReactNode
  /** True while something is open. At 400 this is what decides which of the two panes is shown. */
  selected: boolean
  /** Back to the list at 400. The selection is kept, exactly as Material asks. */
  onBack?: () => void
  /** The name of the thing that is open, for the phone's back line. */
  backLabel?: string
  above?: ReactNode
}

/**
 * A list and the open item, side by side, with a real handle between them. At 400 it collapses to
 * one pane and keeps the selection — the collapse is a change of what is visible, not of state.
 */
export function MasterDetail({ id, list, detail, selected, onBack, backLabel, above, ...header }: MasterDetailProps) {
  const phone = usePhone()
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-4 pt-4 sm:px-6">
        <Measured><PageHeader {...header} />{above}</Measured>
      </div>

      {phone ? (
        // 400: one pane. The selection is the page's state, so it survives the collapse.
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3">
          {selected ? (
            <>
              {onBack && (
                <Button variant="ghost" size="sm" className="mb-2 -ml-2 self-start text-muted-foreground" onClick={onBack}>
                  <ChevronLeft aria-hidden="true" />
                  {backLabel ?? "Back to the list"}
                </Button>
              )}
              <div className="min-h-0 flex-1">{detail}</div>
            </>
          ) : (
            <div className="min-h-0 flex-1">{list}</div>
          )}
        </div>
      ) : (
        // 1440 and 1024: two panes with the handle between them.
        <div className="flex min-h-0 flex-1 px-4 pb-4 pt-3 sm:px-6">
          <Measured className="flex min-h-0 flex-1">
            <Split id={id} list={list} detail={detail} className="flex-1" />
          </Measured>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------------- QueuePage

export interface QueuePageProps extends Omit<MasterDetailProps, "id"> {
  id?: string
  /** Where in the queue this is, for the walk: "3 of 17". */
  position?: ReactNode
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
}

/**
 * A master-detail ordered by work left, walked with previous and next (LAYOUTS.md §1). The walk is
 * part of the template, not of the page, so every queue in the product is walked the same way.
 */
export function QueuePage({
  id = "queue", position, onPrevious, onNext, hasPrevious = true, hasNext = true, detail, ...rest
}: QueuePageProps) {
  return (
    <MasterDetail
      id={id}
      detail={
        <div className="flex h-full min-h-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">{detail}</div>
          {(onPrevious || onNext) && (
            <>
              <Separator />
              <div className="flex shrink-0 items-center justify-between gap-2 px-1 py-2">
                <Button variant="ghost" size="sm" disabled={!hasPrevious} onClick={onPrevious}>
                  <ChevronLeft aria-hidden="true" />
                  Previous
                </Button>
                {position && <span className="t-small tabular-nums text-muted-foreground">{position}</span>}
                <Button variant="ghost" size="sm" disabled={!hasNext} onClick={onNext}>
                  Next
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </>
          )}
        </div>
      }
      {...rest}
    />
  )
}

// ---------------------------------------------------------------------------------- BoardPage

export interface BoardStage {
  id: string
  name: string
  /** What the column's heading says after the name: a count, a total. */
  note?: ReactNode
  cards: ReactNode
}

export interface BoardPageProps extends PageHeaderProps {
  stages: BoardStage[]
  /**
   * The filtering pattern, built by the page with `FilterBar` and handed over whole — the same
   * prop `IndexPage` takes, so a board's row is the index's row: search, the seat's filters, the
   * one door, the count at the trailing edge. It wins over `controls`.
   */
  toolbar?: ReactNode
  /** Search, filters, views — through the same Toolbar an index uses, so a board gets the phone
   *  rule too: one control in front and one door for the rest. */
  controls?: ToolbarControl[]
  /** Printed at the end of the toolbar row: "11 open of 214". */
  shown?: ReactNode
  above?: ReactNode
  /**
   * The column's width, if a board ever needs to say. It should not: the default shares the width
   * between the stages with a 10 rem floor, so four fit at 1024 and five at 1440, and the board
   * scrolls only when the count makes fitting impossible.
   */
  columnWidth?: string
}

/**
 * Cards grouped by one property (LAYOUTS.md §1). Fluid: the only template with no maximum width.
 * At 400 it shows one stage at a time with a switcher — the behaviour no design system read for
 * memo 30 documents, so it is written down here.
 */
export function BoardPage({ stages, toolbar, controls, shown: shownCount, above, columnWidth = "min-w-40 max-w-[22rem] flex-1", ...header }: BoardPageProps) {
  const phone = usePhone()
  const [only, setOnly] = useState(stages[0]?.id ?? "")
  useEffect(() => {
    if (stages.length && !stages.some((s) => s.id === only)) setOnly(stages[0].id)
  }, [stages, only])
  const shown = stages.find((s) => s.id === only) ?? stages[0]

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* One track, and it may be narrower than its content: without `minmax(0,1fr)` a grid track
          sizes to its widest child's max-content, so one long door label makes the whole header
          wider than a 400 screen and pushes the page's primary act off it. */}
      <div className="grid gap-2 px-4 pt-4 [grid-template-columns:minmax(0,1fr)] sm:px-6">
        <PageHeader {...header} />
        {toolbar ?? (controls?.length ? <Toolbar controls={controls} count={shownCount} /> : null)}
        {above}
      </div>

      {/* One stage at a time at 400, with the switcher that says which. */}
      {phone && (
      <div className="px-4 pt-3">
        <div className="overflow-x-auto">
          <ToggleGroup type="single" variant="outline" size="sm" value={only} className="w-fit"
                       aria-label="Which stage to show"
                       onValueChange={(v) => { if (v) setOnly(v) }}>
            {stages.map((s) => <ToggleGroupItem key={s.id} value={s.id} className="shrink-0">{s.name}</ToggleGroupItem>)}
          </ToggleGroup>
        </div>
      </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 pt-3 sm:px-6">
        {!phone && (
        <div className="flex gap-4 min-w-full items-start">
          {stages.map((s) => (
            <section key={s.id} data-stage-column={s.id} className={cn("flex min-w-0 flex-col gap-3", columnWidth)}>
              <h3 className="t-section inline-flex items-baseline gap-2">
                {s.name}
                {s.note && <span className="t-label font-normal tabular-nums text-muted-foreground">{s.note}</span>}
              </h3>
              {s.cards}
            </section>
          ))}
        </div>
        )}
        {phone && shown && (
          <section data-stage-column={shown.id} className="flex flex-col gap-3">
            <h3 className="t-section inline-flex items-baseline gap-2">
              {shown.name}
              {shown.note && <span className="t-label font-normal tabular-nums text-muted-foreground">{shown.note}</span>}
            </h3>
            {shown.cards}
          </section>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------------- HomePage

/**
 * A grid of summary tiles, each a door to an index or a record (LAYOUTS.md §1).
 *
 * Two columns of equal count leave the shorter one empty below the fold — §6 says no region of a
 * page is empty at rest. So the tiles are laid out in a **masonry column flow**: the browser fills
 * by height, not by count, and a tall tile on the right no longer leaves the lower left blank.
 * A tile that must span both columns marks itself `data-wide` — `<Section data-wide>` — and the
 * grid gives it the full width above `lg`.
 */
export function HomeGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      // `columns` flows by height. Each tile avoids being split across a column break, and a wide
      // tile leaves the flow entirely by spanning all of it.
      "gap-4 lg:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid",
      "[&>[data-wide]]:column-span-all",
      className,
    )}>{children}</div>
  )
}
