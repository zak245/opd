// The trail: where the person came from, in their own words, built only from their own moves.
//
// One store, in memory and mirrored to sessionStorage under a key made of the workspace and the
// person, so two tabs signed in as two seats never share a path and nothing survives a sign-out.
// sessionStorage, never localStorage: a path is a thing you are in the middle of, not a setting.
//
// Nothing here infers anything. The trail grows only when a page calls `follow`, it shrinks only
// when the person clicks a crumb (`back`), and it empties whenever the person starts somewhere
// fresh: the sidebar, the bottom bar, the palette, a deep link, the browser's own back button.
import { useSyncExternalStore } from "react"
import { navigate } from "@/app/router"
import { closeBeside } from "./beside"
import { clearAllEdits } from "./edits"

export interface Origin {
  /** "/ollopa/sequences/seq-3" — the hash route without the "#". */
  route: string
  /** The page's h1 at the moment of leaving, so the crumb reads the way the page did. */
  title: string
  /** A `data-item` id, a door id or an element id to return to. */
  anchor?: string
}

/**
 * How many origins the trail holds. The page stack mounts the current page plus every page on the
 * trail and is capped at five, so the trail is capped at four: every crumb is a mounted page, and
 * clicking one is instant. A fifth move drops the oldest crumb.
 */
export const TRAIL_MAX = 4

/** How long the returned-to thing stays lit. The lesson view uses the same three seconds. */
export const RETURN_HIGHLIGHT_MS = 3000

let trail: Origin[] = []
/** route → anchor, set by `back`, read once by the page when it arrives. */
let cues: Record<string, string> = {}
/** Routes arrived at by `follow`, read once, so the shell knows to put focus on the new page's h1. */
let arrivals: Record<string, true> = {}
/** The storage key for the signed-in seat, or null when nobody is signed in. */
let key: string | null = null
/** The route `follow` or `back` asked for, so the hash listener can tell a move from a fresh start. */
let expecting: string | null = null
/**
 * The route `back` is on its way to. Product keeps it mounted until it is the current route, so the
 * page being returned to is never dropped for a frame and never remounted — which is what kept an
 * unsaved field alive on the way back.
 */
let pending: string | null = null

const listeners = new Set<() => void>()
function announce() { listeners.forEach((l) => l()) }

function read(k: string): Origin[] {
  try {
    const raw = sessionStorage.getItem(k)
    return raw ? (JSON.parse(raw) as Origin[]) : []
  } catch { return [] }
}

function write() {
  if (!key) return
  try { sessionStorage.setItem(key, JSON.stringify(trail)) } catch { /* private mode: memory only */ }
}

/** Compare routes without their query string: "/ollopa/people?q=a" returns to "/ollopa/people". */
export function routeKey(route: string): string {
  return (route.startsWith("#") ? route.slice(1) : route).split("?")[0].replace(/\/+$/, "") || "/"
}

/**
 * A crumb is the record's name, not the page's whole h1: "Q4 enterprise outbound · Sequences" is how
 * the header names the page, and "Q4 enterprise outbound" is what the person went there for.
 */
export function crumbName(title: string): string {
  return title.split(" · ")[0]
}

/**
 * Point the store at a seat. The shell calls this on every render with the signed-in business and
 * user, and with nulls when nobody is signed in — which is what clears the trail on sign-out.
 * Cheap and idempotent: it does nothing while the seat is the same.
 */
export function bindChain(business: string | null, user: string | null) {
  const next = business && user ? `ollopa.chain.${business}.${user}` : null
  if (next === key) return
  if (key && !next) { try { sessionStorage.removeItem(key) } catch { /* ignore */ } }
  key = next
  trail = next ? read(next) : []
  cues = {}
  arrivals = {}
  // What happened while the last person was working goes with them: a sign-out, a switch of
  // account and a change of seat all start clean.
  clearAllEdits()
}

/**
 * Navigate. Returns true when a `hashchange` is on its way, which is the render that will show the
 * new trail and the new route in the same commit. Nothing here announces: announcing first would
 * paint one frame with the new trail and the old route, and that frame is what unmounted the page
 * being returned to.
 */
function go(to: string): boolean {
  // Leaving the page takes the pane with it: a pane is a look at something beside where you are,
  // and you are no longer there. Anything still lit on the page you are leaving goes out too.
  closeBeside()
  clearHighlight()
  const before = location.hash
  navigate(to)
  if (location.hash === before) { expecting = null; pending = null; return false }
  return true
}

/** The route `back` is heading for, until it arrives. Product mounts it alongside the current page. */
export function usePendingReturn(): string | null {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => pending,
    () => pending,
  )
}

export function useTrail(): Origin[] {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => trail,
    () => trail,
  )
}

/** The trail as it stands, for code that is not a component. */
export function currentTrail(): Origin[] { return trail }

/**
 * Leave the current page for `to`, remembering where you were. The only way a page goes to a
 * related page: a bare `navigate()` would arrive with nothing to go back to.
 */
export function follow(to: string, origin: Origin) {
  const next = [...trail, origin]
  trail = next.length > TRAIL_MAX ? next.slice(next.length - TRAIL_MAX) : next
  write()
  expecting = routeKey(to)
  // Arriving by a move the person made is not arriving from nowhere: the shell puts focus on the
  // new page's own title, so the crumb back is one Shift+Tab away rather than a walk through the
  // whole sidebar.
  arrivals[routeKey(to)] = true
  if (!go(to)) announce()
}

/** Return to trail[index], truncating the trail after it, and set the cue for that page. */
export function back(index: number) {
  const origin = trail[index]
  if (!origin) return
  // Truncate now but say nothing: the hash change is what re-renders, and by then the trail and the
  // route agree. `pending` holds the page being returned to in the mounted set meanwhile, so even a
  // stray render from somewhere else cannot drop it.
  trail = trail.slice(0, index)
  write()
  if (origin.anchor) cues[routeKey(origin.route)] = origin.anchor
  expecting = routeKey(origin.route)
  pending = origin.route
  if (!go(origin.route)) announce()
}

/** Called by the shell on sidebar, bottom bar, palette and deep-link navigation. */
export function clearTrail() {
  if (trail.length === 0 && Object.keys(cues).length === 0 && pending === null) return
  trail = []
  cues = {}
  arrivals = {}
  pending = null
  write()
  announce()
}

/**
 * A page that lights something of its own on arrival — a settings row named by `?row=` — says so,
 * and the shell leaves focus where the page put it rather than pulling it to the page's title.
 * Page effects run before the shell's, so saying it in the page's own arrival effect is enough.
 */
let arrivalHandled = false
export function arrivalHandledHere() { arrivalHandled = true }
export function takeArrivalHandled(): boolean {
  const was = arrivalHandled
  arrivalHandled = false
  return was
}

/** Did the person arrive here by following a link from another page? Consumed once. */
export function takeArrival(route: string): boolean {
  const k = routeKey(route)
  if (!arrivals[k]) return false
  delete arrivals[k]
  return true
}

/** The anchor a page should scroll to and light on arrival. Consumed once. */
export function takeReturnCue(route: string): string | undefined {
  const k = routeKey(route)
  const anchor = cues[k]
  if (anchor === undefined) return undefined
  delete cues[k]
  return anchor
}


/* ------------------------------------------------------------------------------ the return cue */

/**
 * The phone's bottom bar covers the foot of the page, so "in view" stops above it. It is a fixed
 * element, which has no `offsetParent` even when it is on screen, so its height is what says
 * whether it is there.
 */
function bottomBarHeight(): number {
  const bar = document.querySelector<HTMLElement>('nav[aria-label="Pages"]')
  return bar ? bar.getBoundingClientRect().height : 0
}

/** The thing a `data-item`, `data-row-key`, door id or element id names, on the page you can see. */
export function findAnchor(anchor: string): HTMLElement | null {
  const root = document.querySelector<HTMLElement>('[data-page-active="true"]') ?? document.body
  const id = CSS.escape(anchor)
  // A page may render the same thing twice — a table above `sm`, a card list below it — so take the
  // copy that is actually on screen.
  const all = root.querySelectorAll<HTMLElement>(`[data-item="${id}"], [data-row-key="${id}"], [data-door="${id}"], #${id}`)
  return Array.from(all).find((el) => el.offsetParent !== null) ?? all[0] ?? null
}

/**
 * One thing is lit at a time. Three seconds is long enough to open a second pane inside, and two
 * rows lit at once says two things are "the one you came back to", which is a lie about state. So
 * every new cue — and opening a pane, and following a link — puts out whatever was lit before.
 */
let lit: number[] = []
export function clearHighlight() {
  lit.forEach((t) => window.clearTimeout(t))
  lit = []
  document.querySelectorAll(".ollopa-returned").forEach((el) => el.classList.remove("ollopa-returned"))
}

/** Light one element for the three seconds, and put out anything else that was lit. */
export function lightUp(el: HTMLElement) {
  clearHighlight()
  void el.offsetWidth
  el.classList.add("ollopa-returned")
  lit.push(window.setTimeout(() => el.classList.remove("ollopa-returned"), RETURN_HIGHLIGHT_MS))
}

/**
 * Light the thing you left, once: scroll it into view if it drifted out (clear of the phone's
 * bottom bar), hold it lit for three seconds, and move focus to it — the row's own name link where
 * it has one, so the keyboard carries on from the row and not from the top of the page.
 */
export function showReturn(anchor: string | HTMLElement) {
  const found = typeof anchor === "string" ? findAnchor(anchor) : anchor
  if (!found || !found.isConnected) return
  const el = (found.closest("tr, li") as HTMLElement | null) ?? found

  const scroller = el.closest<HTMLElement>("[data-page]")
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (scroller) {
    const box = el.getBoundingClientRect()
    const frame = scroller.getBoundingClientRect()
    const top = frame.top
    const bottom = Math.min(frame.bottom, window.innerHeight - bottomBarHeight())
    if (box.top < top || box.bottom > bottom) {
      const wanted = top + Math.max(0, (bottom - top - box.height) / 2)
      scroller.scrollTo({ top: scroller.scrollTop + (box.top - wanted), behavior: reduce ? "auto" : "smooth" })
    }
  }

  lightUp(el)

  // Where focus lands. When the anchor names a part of the row — the name cell — focus that part,
  // because it is the thing the person left. When the anchor is the whole row and the row can take
  // focus, focus the row: landing on the first button inside it would put Enter on an action
  // nobody asked for.
  const move = (found === el && el.matches("a, button, [tabindex]") ? el : null)
    ?? found.querySelector<HTMLElement>("a, button, [tabindex]")
    ?? (el.matches("a, button, [tabindex]") ? el : null)
    ?? el
  if (!move.matches("a, button, input, [tabindex]")) move.setAttribute("tabindex", "-1")
  move.focus({ preventScroll: true })
}

// Any hash change the store did not ask for is a fresh start: a deep link, a pasted URL, the
// browser's own back button, or a link the shell owns. Nothing is inferred from it; the trail goes.
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    const now = routeKey(location.hash.replace(/^#/, "") || "/")
    // The route we asked for has landed. Nothing is announced here on purpose: the router notifies
    // for this same event, and that one render sees the final trail and the final route together.
    if (expecting && expecting === now) { expecting = null; pending = null; return }
    expecting = null
    pending = null
    clearTrail()
  })
}
