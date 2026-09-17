// The signal that brings a left-out page back for two weeks.
//
// This is the one place in Ollopa where the product changes a person's navigation on its own, and it
// is bounded on purpose: it fires on an object-state event, it adds one item at the end of a group,
// it appears on the next load of Home and never mid-task, it asks after two weeks, and either answer
// is one click (RULES.md rule 8, the declared sidebar).
//
// STUB: the real check subscribes to the workspace's event stream. Here it reads the counted signals
// the workspace already holds — `seed.workspace.leftOut[].signals`, with the event named in
// `signalKind` — and treats a count above zero as fired. Replace `signalFired` with the stream read;
// nothing else in the shell changes.
import type { Page } from "../usage/model"
import { seedFor } from "../data/seed"
import { leftOut } from "../map"
import type { Session } from "../session"
import { TODAY } from "./notifications"

export interface Signal { page: Page; because: string; on: string; count: number }

export function plusTwoWeeks(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  d.setDate(d.getDate() + 14)
  return d.toISOString().slice(0, 10)
}

/** Has the signal for this left-out page fired, and when? Null when the page is not left out at all. */
export function signalFired(page: Page, session: Session): Signal | null {
  const omission = leftOut(page, session.profile, session.role)
  if (!omission) return null
  const w = seedFor(session.business).workspace
  const row = w.leftOut.find((l) => l.page === page)
  if (!row || row.signals === 0) return null
  const on = w.exposure?.page === page ? w.exposure.started : TODAY
  return { page, because: row.signalKind, on, count: row.signals }
}

/**
 * The one page to expose now, if any: never more than one exposure at a time, never a page the
 * person already answered, and never a page already in the sidebar.
 */
export function exposureDue(session: Session): Signal | null {
  if (session.exposures.some((e) => !e.answer)) return null
  for (const row of seedFor(session.business).workspace.leftOut) {
    const page = row.page as Page
    if (session.exposures.some((e) => e.page === page)) continue
    if (session.sidebarAdded.includes(page)) continue
    const signal = signalFired(page, session)
    if (signal) return signal
  }
  return null
}
