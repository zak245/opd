// What the set-up answers moved in the sidebar, in one line, for the row that sent you there.
//
// Changing the three answers redraws every sidebar. The person who changed them is standing on the
// Settings row "Workspace profile" when they come back, so that is where the sentence belongs — not
// in a toast that has gone by the time they land, and not on Home, which they never asked for.
//
// In memory only. It is the tail end of one move, not a setting: a reload has no move to report.
import { useSyncExternalStore } from "react"
import { NAV } from "../../nav"
import { seatCarries } from "../../nav"
import { leftOut } from "../../map"
import { PROFILE_LABEL, type Profile } from "../../session"
import type { Business, Role } from "../../usage/model"

let line: string | null = null
const listeners = new Set<() => void>()
function announce() { listeners.forEach((l) => l()) }

export function noteSidebarMove(text: string) { line = text; announce() }

/** Cleared when the person leaves Settings: the line belonged to the row they were standing on. */
export function clearSidebarMove() {
  if (line === null) return
  line = null
  announce()
}

// Leaving Settings ends the line. It is hung on the hash rather than on the settings page's own
// unmount because the page stack drops and remounts the origin page for one frame on the way back,
// and a sentence about what just happened must not be thrown away by that.
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    if (!location.hash.replace(/^#/, "").startsWith("/ollopa/settings")) clearSidebarMove()
  })
}

export function useSidebarMove(): string | null {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => line,
    () => line,
  )
}

/** The sidebar one seat gets under one profile: the seat's pages, minus what the profile leaves out. */
function sidebarLabels(profile: Profile, business: Business, role: Role): string[] {
  return NAV
    .filter((n) => !n.optional && seatCarries(n.page, business, role))
    .filter((n) => !leftOut(n.page, profile, role))
    .map((n) => n.label)
}

function list(items: string[]): string {
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}

/**
 * One sentence saying what the answers moved for the seat that changed them: which pages joined the
 * sidebar, which left it, and the shape the workspace is now. Nothing is inferred — both sides are
 * computed from the declared profile and the declared seat.
 */
export function movedLine(business: Business, role: Role, before: Profile, after: Profile): string {
  const was = sidebarLabels(before, business, role)
  const now = sidebarLabels(after, business, role)
  const joined = now.filter((l) => !was.includes(l))
  const left = was.filter((l) => !now.includes(l))
  const shape = PROFILE_LABEL[after]
  if (joined.length === 0 && left.length === 0) {
    return `Saved. ${shape}: your sidebar is unchanged — ${now.join(", ")}.`
  }
  if (joined.length && left.length) {
    return `Saved. ${shape}: ${list(joined)} joined your sidebar, and ${list(left)} left it.`
  }
  if (joined.length) return `Saved. ${shape}: ${list(joined)} joined your sidebar.`
  return `Saved. ${shape}: ${list(left)} left your sidebar.`
}
