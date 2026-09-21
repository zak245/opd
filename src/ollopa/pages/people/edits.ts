// The people folder's names for the one shared store, and nothing else.
//
// What an action did to a person has to be readable by whatever page the pane was opened over — a
// sequence's enrolled list, a company's contacts, a task queue — so it cannot live in this folder.
// It lives in `src/ollopa/edits.ts`, under the kind "person", and this file only puts a typed name
// on the four calls this folder makes. Anything outside the folder reads the same fact with
// `useEdits("person")`.
import { clearEdit, recordEdit, useEdit, useEdits, type Edit } from "../../edits"

/** What this folder writes about a person. The rows and the pane agree on these three words. */
export interface PersonEdit extends Edit {
  /** The sequence they are in now. "" means an action took them out of the one they were in. */
  sequence?: string
  /** One line saying what the last action did, in the words the row shows under the name. */
  note?: string
  /** The phone was revealed in this session. */
  phoneRevealed?: boolean
}

/** The kind every person record in the shared store is filed under. */
export const PERSON = "person"

/** Record what an action did to a person. */
export function editPerson(id: string, patch: PersonEdit) {
  recordEdit(PERSON, id, patch)
}

/** Undo: drop everything this session recorded about them. */
export function clearPersonEdit(id: string) {
  clearEdit(PERSON, id)
}

/** One person, subscribed, for the pane — which draws one and must follow it. */
export function usePersonEdit(id: string): PersonEdit | undefined {
  return useEdit(PERSON, id) as PersonEdit | undefined
}

/**
 * Every person acted on this session, for a list that draws many rows. The same thing as
 * `useEdits("person")` from the shared store, with this folder's type on it; a page outside the
 * folder can call either.
 */
export function usePersonEdits(): Record<string, PersonEdit> {
  return useEdits(PERSON) as Record<string, PersonEdit>
}
