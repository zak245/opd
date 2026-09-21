// What an action did to an object this session, so the row behind a pane shows it at once.
//
// The pane is drawn by the shell and the row by the page; they share no props. Opening the pane must
// not re-render the page (that is the property the whole mechanic rests on), but acting must show
// its effect where it was caused (chain rule 8). So an action writes one small record here, and only
// the rows that read that object's kind re-render. One store for every kind of object: person,
// deal, task, reply, company, sequence, and whatever a page adds. Nothing here is a saved edit; it is
// what happened while the person was working, and a reload starts clean like the demo's other local
// state. Undo drops the record.
import { useSyncExternalStore } from "react"

/** The patch is whatever the kind's rows and pane agree to read; keep it small and in plain words. */
export type Edit = Record<string, unknown> & {
  /** One line saying what the last action did, in the words the row shows under its name. */
  note?: string
  /** When the action was taken; the row can offer undo for a short while after it. */
  at?: number
}

type Kind = string
let edits: Record<Kind, Record<string, Edit>> = {}
const listeners = new Map<Kind, Set<() => void>>()
const EMPTY: Record<string, Edit> = {}

function notify(kind: Kind) {
  listeners.get(kind)?.forEach((l) => l())
}

/** Record what an action did. Merges into what is already known about that object. */
export function recordEdit(kind: Kind, id: string, patch: Edit) {
  const forKind = edits[kind] ?? EMPTY
  edits = { ...edits, [kind]: { ...forKind, [id]: { ...forKind[id], ...patch, at: Date.now() } } }
  notify(kind)
}

/** Undo: drop everything recorded about this object. */
export function clearEdit(kind: Kind, id: string) {
  const forKind = edits[kind]
  if (!forKind?.[id]) return
  const next = { ...forKind }
  delete next[id]
  edits = { ...edits, [kind]: next }
  notify(kind)
}

/** The record for one object right now, for a pane that draws one thing and does not subscribe. */
export function editOf(kind: Kind, id: string): Edit | undefined {
  return edits[kind]?.[id]
}

function subscribeTo(kind: Kind) {
  return (l: () => void) => {
    let set = listeners.get(kind)
    if (!set) { set = new Set(); listeners.set(kind, set) }
    set.add(l)
    return () => { set!.delete(l) }
  }
}

/** Every record of one kind, for a list that draws many rows. Re-renders only when that kind changes. */
export function useEdits(kind: Kind): Record<string, Edit> {
  return useSyncExternalStore(subscribeTo(kind), () => edits[kind] ?? EMPTY, () => EMPTY)
}

/** One object's record, subscribed, for a row or a pane that must follow it. */
export function useEdit(kind: Kind, id: string): Edit | undefined {
  return useSyncExternalStore(subscribeTo(kind), () => edits[kind]?.[id], () => undefined)
}

/** Wipe everything, on sign-out. */
export function clearAllEdits() {
  edits = {}
  for (const kind of listeners.keys()) notify(kind)
}
