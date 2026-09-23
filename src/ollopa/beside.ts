// The pane store: which related object is open beside the page, and nothing else.
//
// It is deliberately separate from the trail and from the session. Opening a pane changes only
// this store, so the page behind it does not re-render: that is the property the whole mechanic
// rests on, and the sequence page's dev render counter is there to keep us honest about it.
//
// In memory only. A pane is a look, not a place: it has no URL, it survives nothing, and a reload
// lands on the page with no pane open.
import { useSyncExternalStore, type ReactNode } from "react"
import type { Session } from "./session"

export interface BesideTarget {
  /** "person" | "company" | "deal" | "sequence" | "audience" | "campaign" | "list" | "setting" | … */
  kind: string
  id: string
  /** When opened from a list: the ids in the order shown, so next and previous walk that list. */
  list?: { ids: string[]; index: number }
  /** The element that opened it; focus returns there on close. */
  opener?: HTMLElement | null
}

/** What the pane was showing before a related object replaced it. One step, never two. */
interface State { target: BesideTarget | null; parent: BesideTarget | null }

let state: State = { target: null, parent: null }
const listeners = new Set<() => void>()
function announce() { listeners.forEach((l) => l()) }

export function openBeside(target: BesideTarget) {
  state = { target, parent: null }
  announce()
}

export function closeBeside() {
  if (!state.target) return
  state = { target: null, parent: null }
  announce()
}

/** The pane's current target, read outside React. For an effect that must not see a stale render. */
export function besideTarget(): BesideTarget | null { return state.target }

export function useBeside(): BesideTarget | null {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => state.target,
    () => state.target,
  )
}

/**
 * Open a related object from inside the pane: the content swaps in place and the header gets one
 * "‹ back to what you were reading". At most one step — a pane never becomes a second browser, so
 * from the second object the only way on is "Open the page".
 */
export function openBesideNested(target: BesideTarget) {
  state = { target, parent: state.parent ?? state.target }
  announce()
}

/** The one step back inside the pane, or null when there is nothing behind the current content. */
export function useBesideParent(): BesideTarget | null {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => state.parent,
    () => state.parent,
  )
}

/** Take the one step back inside the pane. */
export function besideBack() {
  if (!state.parent) return
  state = { target: state.parent, parent: null }
  announce()
}

/** Step to another id in the list the pane was opened from. Ignored when there is no list. */
export function besideStep(by: 1 | -1) {
  const t = state.target
  if (!t?.list) return
  const index = t.list.index + by
  if (index < 0 || index >= t.list.ids.length) return
  // A quick look walks the opener's own list — the ids here are places in it, not objects — so the
  // opener is asked to step and the pane is told where it now is.
  if (t.kind === "quick-look") {
    stepQuickLook?.(by)
    state = { target: { ...t, list: { ids: t.list.ids, index } }, parent: null }
    announce()
    return
  }
  state = {
    target: { ...t, id: t.list.ids[index], list: { ids: t.list.ids, index } },
    parent: null,
  }
  announce()
}

/**
 * Pane kinds registered by the core rather than by a page folder — the quick look is one, because
 * every index page can open one. Kept here rather than in `Product.tsx` so the pane, the quick look
 * and the registry do not import one another in a circle.
 */
const core: Record<string, BesideComponent> = {}
export function registerBeside(kind: string, component: BesideComponent) { core[kind] = component }
export function coreBesides(): Record<string, BesideComponent> { return core }

/**
 * How the pane steps a quick look. Set once by the quick look itself, so this file does not have to
 * know what a quick look is.
 */
let stepQuickLook: ((by: 1 | -1) => void) | null = null
export function setQuickLookStepper(f: (by: 1 | -1) => void) { stepQuickLook = f }

/* ------------------------------------------------------------------ what a page folder registers */

/**
 * A pane renderer, registered by the page folder that owns the object:
 *
 *   export const besides: Record<string, BesideComponent> = { person: PersonBeside }
 *
 * The body is the component itself. `head` is the one line the pane frame needs before the body
 * has rendered — the object's name, one line of context, and the route "Open the page" goes to —
 * so the frame can draw its header without asking the body to draw one of its own.
 */
export interface BesideHead {
  name: string
  /** One line: "VP Engineering · Northwind" — never two. */
  context: string
  /** The full record, for "Open the page". */
  route: string
}

export interface BesideComponent {
  (props: { session: Session; id: string; target: BesideTarget }): ReactNode
  head?: (args: { session: Session; id: string; target: BesideTarget }) => BesideHead | null
}
