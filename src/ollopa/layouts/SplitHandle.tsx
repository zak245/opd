// The divider of a split, with every affordance it owes a person (LAYOUTS.md §4).
//
// Material gives the divider a handle and an overlapping touch target; Apple prefers a hairline and
// a toolbar button. The two systems give opposite answers to one discoverability problem (memo 30,
// the disagreements), so this takes Material's side and adds what the W3C window-splitter pattern
// asks for and nobody ships: arrow-key resizing, Home and End, and a double-click that resets.
//
// The size is remembered per person and per split, because a split someone widened and lost is a
// split they stop touching.
import { useCallback, useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
  ResizableHandle, ResizablePanel, ResizablePanelGroup,
} from "@/components/ui/resizable"
import type { PanelImperativeHandle } from "react-resizable-panels"
import { useSession } from "../session"

/** One step of an arrow key, as a percentage of the group. The W3C pattern asks for a keyboard. */
const STEP = 4

function key(who: string, id: string) {
  return `ollopa.split.${who}.${id}`
}

export interface SplitProps {
  /** Remembered under this name, per person. */
  id: string
  list: ReactNode
  detail: ReactNode
  /** The list's share of the width, before the person changes it. */
  defaultSize?: number
  minSize?: number
  maxSize?: number
  /** At this width and below the split collapses to one pane; the caller decides which to show. */
  className?: string
}

/**
 * A two-pane split with a real handle. Both panes are always in the DOM, so a selection survives
 * the split being dragged shut and re-opened.
 */
export function Split({ id, list, detail, defaultSize = 38, minSize = 22, maxSize = 62, className }: SplitProps) {
  const session = useSession()
  const who = session ? `${session.business}.${session.user}` : "anon"
  const panel = useRef<PanelImperativeHandle>(null)
  const start = useRef(defaultSize)

  // Read once, before the group mounts, so there is no flash of the default size.
  if (start.current === defaultSize) {
    try {
      const was = Number(localStorage.getItem(key(who, id)))
      if (Number.isFinite(was) && was >= minSize && was <= maxSize) start.current = was
    } catch { /* private mode */ }
  }

  const remember = useCallback((size: number) => {
    try { localStorage.setItem(key(who, id), String(Math.round(size))) } catch { /* private mode */ }
  }, [who, id])

  const nudge = useCallback((by: number) => {
    const p = panel.current
    if (!p) return
    const next = Math.min(maxSize, Math.max(minSize, p.getSize().asPercentage + by))
    p.resize(`${next}%`)
    remember(next)
  }, [maxSize, minSize, remember])

  const reset = useCallback(() => {
    panel.current?.resize(`${defaultSize}%`)
    remember(defaultSize)
  }, [defaultSize, remember])

  return (
    <ResizablePanelGroup orientation="horizontal" className={cn("min-h-0", className)}>
      {/* react-resizable-panels reads a bare number as pixels; a percentage has to say so. */}
      <ResizablePanel panelRef={panel} defaultSize={`${start.current}%`} minSize={`${minSize}%`} maxSize={`${maxSize}%`}
                      onResize={(size) => remember(size.asPercentage)} className="min-w-0">
        {list}
      </ResizablePanel>
      <SplitHandle onNudge={nudge} onReset={reset} />
      <ResizablePanel minSize={`${100 - maxSize}%`} className="min-w-0">{detail}</ResizablePanel>
    </ResizablePanelGroup>
  )
}

/**
 * The grip itself: visible at rest, not only on hover, with the resize cursor, the arrow keys and a
 * double-click that puts it back. Exported on its own for a split this file does not build.
 */
export function SplitHandle({ onNudge, onReset, className }: {
  onNudge: (by: number) => void
  onReset: () => void
  className?: string
}) {
  const el = useRef<HTMLDivElement>(null)

  // react-resizable-panels handles its own keys, but only Shift+arrow and only in some versions;
  // the pattern asks for plain arrows, Home and End, so they are taken here.
  useEffect(() => {
    const node = el.current
    if (!node) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); onNudge(-STEP) }
      else if (e.key === "ArrowRight") { e.preventDefault(); onNudge(STEP) }
      else if (e.key === "Home") { e.preventDefault(); onNudge(-100) }
      else if (e.key === "End") { e.preventDefault(); onNudge(100) }
      else if (e.key === "Enter") { e.preventDefault(); onReset() }
    }
    node.addEventListener("keydown", onKey)
    return () => node.removeEventListener("keydown", onKey)
  }, [onNudge, onReset])

  return (
    <ResizableHandle
      withHandle
      elementRef={el}
      aria-label="Resize the two panes. Left and right arrows resize, Enter puts it back."
      title="Drag to resize · arrows to nudge · double-click to reset"
      onDoubleClick={onReset}
      // Visible at rest — hover may aid scanning, it may not be the only route (memo 30, rule 13)
      // — with a hit area wider than the rule it sits on, as Material asks.
      className={cn(
        "cursor-col-resize after:w-3 [&>div]:h-8 [&>div]:w-3 [&>div]:bg-background [&>div]:text-muted-foreground [&>div>svg]:size-3",
        className,
      )}
    />
  )
}
