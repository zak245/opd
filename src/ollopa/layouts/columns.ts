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
import { useSyncExternalStore } from "react"

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
