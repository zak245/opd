// What the pane's actions did to a person, for the rest of the session.
//
// A person read beside a page can be added to a sequence, written to or called from inside the
// pane. The row behind the pane — the People table's row, the "People at this company" card on a
// contact record — has to show that at once, in place, because that is where the action was caused
// (chain rule 8). The pane and the page are two different components with no props between them,
// so the fact lives here instead, in one small store both of them read.
//
// In memory only, and only for this session: nothing here is a saved edit, it is what happened
// while the person was working. A reload starts clean, the same way the demo's other local edits do.
import { useSyncExternalStore } from "react"

export interface PersonEdit {
  /** The sequence they are in now. "" means an action took them out of the one they were in. */
  sequence?: string
  /** One line saying what the last action did, in the words the row shows under the name. */
  note?: string
  /** The phone was revealed in this session. */
  phoneRevealed?: boolean
}

let edits: Record<string, PersonEdit> = {}
const listeners = new Set<() => void>()

/** Record what an action did. Replaces the map, so `useSyncExternalStore` sees a new snapshot. */
export function editPerson(id: string, patch: PersonEdit) {
  edits = { ...edits, [id]: { ...edits[id], ...patch } }
  listeners.forEach((l) => l())
}

/** Undo one action: drop everything recorded about this person. */
export function clearPersonEdit(id: string) {
  if (!edits[id]) return
  const next = { ...edits }
  delete next[id]
  edits = next
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

/** The whole map, for a list that draws many rows. */
export function usePersonEdits(): Record<string, PersonEdit> {
  return useSyncExternalStore(subscribe, () => edits, () => edits)
}

/** One person, for the pane, which only ever draws one. */
export function personEdit(id: string): PersonEdit | undefined {
  return edits[id]
}
