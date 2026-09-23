// Which columns a table shows at this width, in one place.
//
// LAYOUTS.md §5 says nothing is removed as the page narrows, only how much is visible at once, and
// §6 says an index is one full-width column. A table that scrolls sideways inside its card breaks
// both: the last columns are gone, and the page is wider than the column it is supposed to be.
//
// So a column carries a **priority**, and the width decides how many priorities are drawn:
//
//   1  the row's own name and the one or two facts it is read for — always drawn
//   2  facts worth a column on a wide screen                      — drawn at 1280 and above
//   3  facts that are still worth reading, just not in a column   — drawn at 1536 and above
//
// What leaves the table is not removed: it joins the row's meta line under the name, which is the
// same place the 400 divided list already puts it, and it stays in the column picker.
import { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"

/** 1 is essential, 3 drops first. A column with no priority is treated as 2. */
export type ColumnPriority = 1 | 2 | 3

/** The width bands the rule uses. They are Tailwind's `md`, `xl` and `2xl`. */
export type Band = "phone" | "narrow" | "wide" | "widest"

const QUERIES: [Band, string][] = [
  ["widest", "(min-width: 1536px)"],
  ["wide", "(min-width: 1280px)"],
  ["narrow", "(min-width: 768px)"],
]

function read(): Band {
  if (typeof window === "undefined" || !window.matchMedia) return "wide"
  for (const [band, q] of QUERIES) if (window.matchMedia(q).matches) return band
  return "phone"
}

/** The width band the page is in, as a subscription so a resize re-renders the table. */
export function useBand(): Band {
  return useSyncExternalStore(
    (f) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {}
      const ms = QUERIES.map(([, q]) => window.matchMedia(q))
      for (const m of ms) m.addEventListener("change", f)
      return () => { for (const m of ms) m.removeEventListener("change", f) }
    },
    read,
    () => "wide" as Band,
  )
}

/** How deep the table goes in each band. */
const DEPTH: Record<Band, number> = { phone: 1, narrow: 1, wide: 2, widest: 3 }

/**
 * Split a column set into the ones the table draws here and the ones that fold into the row's meta
 * line. Nothing is dropped: `folded` is what the row says under its name, and the caller's column
 * picker still lists every column.
 *
 * ```tsx
 * const { shown, folded } = useColumnFit(columns, (c) => c.priority)
 * ```
 */
export function useColumnFit<T>(columns: T[], priorityOf: (column: T) => ColumnPriority | undefined) {
  const band = useBand()
  const depth = DEPTH[band]
  const shown: T[] = []
  const folded: T[] = []
  for (const c of columns) {
    const p = priorityOf(c) ?? 2
    if (p <= depth) shown.push(c)
    else folded.push(c)
  }
  // A table with nothing in it is not a table: the first column is always drawn, whatever it says.
  if (shown.length === 0 && columns.length > 0) {
    shown.push(columns[0])
    folded.splice(folded.indexOf(columns[0]), 1)
  }
  return { band, shown, folded }
}

/* ------------------------------------------------------------------ measuring, not guessing */

/**
 * Fold columns until the table fits **its container**, not the viewport.
 *
 * The width band a page is in says nothing about the room a table actually has: the same index is
 * 1134 px wide at 1440 and 694 px inside a record's main column, and a page that folds by viewport
 * gets one of the two wrong. So this measures: it renders, asks whether the table is wider than the
 * box around it, and folds one more column each time it is, lowest priority and right-most first.
 *
 * What folds is not removed — the caller draws `folded` under the row's own name, which is where
 * the 400 divided list already puts it, and the column picker still lists every column.
 *
 * ```tsx
 * const { ref, shown, folded } = useFitColumns(columns, { priorityOf: (c) => c.priority })
 * <div ref={ref}><Table>…{shown.map(…)}</Table></div>
 * ```
 */
export function useFitColumns<T>(columns: T[], opts?: {
  /** 1 never folds, 3 folds first. Without it the right-most column folds first. */
  priorityOf?: (column: T) => ColumnPriority | undefined
  /** Columns that must stay whatever happens. The first column is always kept. */
  keep?: (column: T) => boolean
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [dropped, setDropped] = useState(0)
  // True when everything that may fold has folded and the table still does not fit. A caller that
  // has another shape — `RowsTable` has a divided list — uses it instead of clipping.
  const [tight, setTight] = useState(false)

  // Worst first: the highest priority number, then the right-most. The first column is the row's
  // own name and never folds.
  const order = useMemo(() => {
    const foldable = columns
      .map((c, i) => ({ c, i }))
      .filter(({ c, i }) => i > 0 && !(opts?.keep?.(c) ?? false))
    return foldable
      .sort((a, b) => ((opts?.priorityOf?.(b.c) ?? 2) - (opts?.priorityOf?.(a.c) ?? 2)) || (b.i - a.i))
      .map(({ c }) => c)
    // The identity of a column set is its length and its order, which the caller rebuilds each render.
  }, [columns, opts])

  const hidden = new Set(order.slice(0, Math.min(dropped, order.length)))
  const shown = columns.filter((c) => !hidden.has(c))
  const folded = columns.filter((c) => hidden.has(c))

  useLayoutEffect(() => {
    const box = ref.current
    if (!box) return
    // A table is asked to shrink before anything is taken out of it: the actions column takes its
    // content and never the slack, and a text column truncates rather than holding a column open.
    // Only when the table at those minimums is still wider than the box does a column fold.
    const shrink = () => {
      const table = box.querySelector("table")
      if (!table) return
      table.style.tableLayout = "auto"
      table.style.width = "100%"
    }

    const check = () => {
      shrink()
      // shadcn's Table brings its own `overflow-x-auto` container, so the box around it never
      // overflows — the scroller inside it does, and that is the thing to measure and to kill.
      const inner = box.querySelector<HTMLElement>('[data-slot="table-container"]')
      const scroller = inner ?? box
      const room = scroller.clientWidth
      const needs = scroller.scrollWidth
      // A table that mounts hidden — inside a closed door, behind a tab — has no box to measure.
      // Come back on the next frame rather than deciding from a zero, and keep coming back until
      // it is on screen, or a door that opens later gets yesterday's answer for ever.
      if (room === 0) { again = requestAnimationFrame(check); return }
      if (needs - room > 1) {
        setDropped((d) => (d < order.length ? d + 1 : d))
        if (dropped >= order.length) setTight(true)
      } else if (dropped > 0 && room - needs > 200) {
        setTight(false)
        // Room to spare: put one back. The gap has to be wider than a column, or the one that
        // comes back pushes the table over and the pair flip for ever.
        setDropped((d) => Math.max(0, d - 1))
      }
    }
    let again = 0
    check()
    // The box may never resize while the thing inside it does — a door opening changes the
    // scroller, not the column it sits in — so both are watched.
    const ro = new ResizeObserver(check)
    ro.observe(box)
    const inner = box.querySelector('[data-slot="table-container"]')
    if (inner) ro.observe(inner)
    const table = box.querySelector("table")
    if (table) ro.observe(table)
    // One more look after the first paint: fonts and the library's own styles land after mount,
    // and the first measurement is taken before either.
    const settle = requestAnimationFrame(check)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(settle)
      cancelAnimationFrame(again)
    }
  })

  // A column set that changed under us starts again, or a page keeps yesterday's folding.
  const key = columns.length
  useLayoutEffect(() => { setDropped(0) }, [key])

  return { ref, shown, folded, tight }
}
