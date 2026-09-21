// What the deal pane did to a deal in this session.
//
// A pane is rendered by the frame, not by the page behind it, so it has no page state to write
// into. This is the smallest store that lets an action in the pane show its effect at once and lets
// the board behind read the same fact, so the two can never say different things about one deal.
//
// In memory only, like the pane itself: a look and the actions taken from it are part of this
// visit, not a saved record. Nothing here is inferred and nothing outlives a reload.
import { useSyncExternalStore } from "react"
import type { Deal } from "../../data/seed"

/** The change, plus the one sentence saying what the last action did. */
export interface DealEdit extends Partial<Deal> {
  note?: string
}

let edits: Record<string, DealEdit> = {}
const listeners = new Set<() => void>()

/** Apply a change to one deal and say what it did. */
export function editDeal(id: string, change: DealEdit) {
  edits = { ...edits, [id]: { ...edits[id], ...change } }
  listeners.forEach((l) => l())
}

export function useDealEdits(): Record<string, DealEdit> {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => edits,
    () => edits,
  )
}
