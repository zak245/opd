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

/**
 * How wide the pane is reading, which is also how much of the record it shows.
 *
 * `beside` is the glance: the object's first level and the acts the chain needs, with the page
 * still doing its job next to it. `expanded` is the same pane widened over the page, showing the
 * next level of the record, so the whole thing can be read without leaving. There is no third:
 * past `expanded` the way on is "Open the page", which pushes the trail.
 *
 * The mode is the pane's, not the object's: it survives `]` and `[` and the one step back inside
 * the pane — a person who widened the pane to read one contact is still reading contacts when they
 * step to the next — and it goes back to `beside` when the pane closes, because the next glance is
 * a glance again.
 */
export type BesideMode = "beside" | "expanded"

/** What the pane was showing before a related object replaced it. One step, never two. */
interface State {
  target: BesideTarget | null
  parent: BesideTarget | null
  mode: BesideMode
  /** Which way the last content swap went: 1 for next, -1 for previous, 0 for "it just opened". */
  dir: 1 | -1 | 0
}

let state: State = { target: null, parent: null, mode: "beside", dir: 0 }
const listeners = new Set<() => void>()
function announce() { listeners.forEach((l) => l()) }

/**
 * The row on the page this pane is being read from, worked out once, at the moment it opens.
 *
 * The pane marks that row while it is open, so the page says which one it is showing. Most of the
 * time the pane's own object is the row and the mark is found by id. It is not, when the pane holds
 * something the row points at — a contact's company, a deal's account — and it is not when the pane
 * was opened from a row's "…", because the menu item that was clicked lives in a portal and not in
 * the row at all. Both are answered here, while the menu is still open and still connected, because
 * a frame later it is neither.
 */
let openedFrom: HTMLElement | null = null

/**
 * `data-item` names two different things: an object on a row ("c-13", "co-1") and a usage-model item
 * on a control ("people.search"). Only the first is a row, and the dot is what tells them apart.
 */
export function isRowItem(el: Element | null | undefined): boolean {
  const id = el?.getAttribute?.("data-item") ?? ""
  return id !== "" && !id.includes(".")
}

/** The nearest thing above `el` that is a row, ignoring the controls that share the attribute. */
function rowFrom(el: HTMLElement | null | undefined): HTMLElement | null {
  let node: HTMLElement | null = el?.isConnected ? el : null
  while (node) {
    if (isRowItem(node)) return node
    node = node.parentElement
  }
  return null
}

function rowBehind(opener: HTMLElement | null | undefined): HTMLElement | null {
  const own = rowFrom(opener)
  if (own) return own
  // Opened from a row's "…": the menu's own trigger is in the row, and it is the one control on the
  // page whose menu is open right now.
  const trigger = document.querySelector<HTMLElement>('[aria-haspopup="menu"][data-state="open"]')
  return rowFrom(trigger)
}

/** The row the pane is being read from, for the mark the page carries while it is open. */
export function besideOpenedFrom(): HTMLElement | null {
  return openedFrom?.isConnected ? openedFrom : null
}

export function openBeside(target: BesideTarget) {
  openedFrom = rowBehind(target.opener)
  state = { target, parent: null, mode: "beside", dir: 0 }
  announce()
}

export function closeBeside() {
  if (!state.target) return
  openedFrom = null
  state = { target: null, parent: null, mode: "beside", dir: 0 }
  announce()
}

/* --------------------------------------------------------------- beside, expanded, and the page */

export function useBesideMode(): BesideMode {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => state.mode,
    () => state.mode,
  )
}

/** The pane's mode outside React, for an effect that must not read a stale render. */
export function besideMode(): BesideMode { return state.mode }

/**
 * Widen the pane over the page, or narrow it back. One control in the pane header does both, so
 * getting there and getting back are the same move (RULES.md rule 4: a door that opens closes).
 * Nothing else changes: the page behind is not touched, the trail does not grow, and the row that
 * opened the pane keeps its mark.
 */
export function toggleBesideMode() {
  if (!state.target) return
  state = { ...state, mode: state.mode === "beside" ? "expanded" : "beside", dir: 0 }
  announce()
}

/** Which way the pane's content last moved, so the movement points the way the person went. */
export function useBesideDir(): 1 | -1 | 0 {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => state.dir,
    () => state.dir,
  )
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
  // The width the person chose stays: they widened the pane to read, and they are still reading.
  state = { ...state, target, parent: state.parent ?? state.target, dir: 1 }
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
  state = { ...state, target: state.parent, parent: null, dir: -1 }
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
    state = { ...state, target: { ...t, list: { ids: t.list.ids, index } }, parent: null, dir: by }
    announce()
    return
  }
  state = {
    ...state,
    target: { ...t, id: t.list.ids[index], list: { ids: t.list.ids, index } },
    parent: null,
    dir: by,
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
