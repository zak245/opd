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
/** The storage key for the signed-in seat, or null when nobody is signed in. */
let key: string | null = null
/** The route `follow` or `back` asked for, so the hash listener can tell a move from a fresh start. */
let expecting: string | null = null

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
}

/** Navigate, and drop the expectation when the hash did not actually change (no event will come). */
function go(to: string) {
  // Leaving the page takes the pane with it: a pane is a look at something beside where you are,
  // and you are no longer there.
  closeBeside()
  const before = location.hash
  navigate(to)
  if (location.hash === before) expecting = null
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
  announce()
  go(to)
}

/** Return to trail[index], truncating the trail after it, and set the cue for that page. */
export function back(index: number) {
  const origin = trail[index]
  if (!origin) return
  trail = trail.slice(0, index)
  write()
  if (origin.anchor) cues[routeKey(origin.route)] = origin.anchor
  expecting = routeKey(origin.route)
  announce()
  go(origin.route)
}

/** Called by the shell on sidebar, bottom bar, palette and deep-link navigation. */
export function clearTrail() {
  if (trail.length === 0 && Object.keys(cues).length === 0) return
  trail = []
  cues = {}
  write()
  announce()
}

/** The anchor a page should scroll to and light on arrival. Consumed once. */
export function takeReturnCue(route: string): string | undefined {
  const k = routeKey(route)
  const anchor = cues[k]
  if (anchor === undefined) return undefined
  delete cues[k]
  return anchor
}

// Any hash change the store did not ask for is a fresh start: a deep link, a pasted URL, the
// browser's own back button, or a link the shell owns. Nothing is inferred from it; the trail goes.
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    const now = routeKey(location.hash.replace(/^#/, "") || "/")
    if (expecting && expecting === now) { expecting = null; return }
    expecting = null
    clearTrail()
  })
}
