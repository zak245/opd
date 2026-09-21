// The two small pieces the Inbox, Tasks and Home share: where the person is standing, and a render
// count for the walk to read.
//
// `originHere` is where the person is standing, in the words the header is using, so any control can
// hand `follow` an origin without every component being told its own route. The title is the shell's
// own h1: AppShell writes "<page> · <workspace> · ollopA" into document.title, so the first part is
// exactly the crumb the header will draw.
//
// What a pane did to a task no longer lives here: it is a record in the shared store,
// `src/ollopa/edits.ts`. One store for every kind of object means the pane, the row behind it and
// any other page reading tasks all read the same thing, so they cannot disagree — which a private
// event channel per folder could never guarantee.
import { useRef } from "react"
import type { Origin } from "../../chain"
import { clearEdit, recordEdit } from "../../edits"

/**
 * Dev only: how many times this page has rendered. A pane opening must not re-render the page it
 * opens beside — that is the property the whole mechanic rests on — so the number is on screen in
 * development and the walk reads it before and after, rather than assuming.
 */
export function useRenderCount(): number {
  const n = useRef(0)
  n.current += 1
  return n.current
}

/** Where we are now, for `follow`. `anchor` is the thing to come back to: a `data-item` id. */
export function originHere(anchor?: string): Origin {
  const route = location.hash.replace(/^#/, "") || "/"
  const title = (document.title.split(" · ")[0] ?? "").trim() || route
  return { route, title, anchor }
}


/* ------------------------------------------------------------------------------- a sent reply */

/**
 * How long a sent reply can still be pulled back. Ten seconds is what makes a send a reversible
 * act, and a reversible act asks nothing first (DESIGN.md §2): a confirmation on something an SDR
 * does forty times a day is a confirmation nobody reads.
 */
export const SEND_UNDO_MS = 10_000

/** The pending sends, so undo can catch one before it goes. Module state: a reload sends nothing. */
const going = new Map<string, number>()

/**
 * Send, at once, with ten seconds to take it back. The reply's row and the thread both read the
 * same record, so "Sending · Undo" and then "Sent" appear where the act was caused rather than in a
 * toast that floats away. `what` is the line both of them show.
 */
export function sendReply(id: string, what: string) {
  window.clearTimeout(going.get(id))
  recordEdit("reply", id, { sending: true, sent: false, note: `Sending · ${what}` })
  going.set(id, window.setTimeout(() => {
    going.delete(id)
    // It has gone, and the row says so where it was written. Answering is not the same as being
    // done with a reply — Mark done is its own act — so the reply stays where it was.
    recordEdit("reply", id, { sending: false, sent: true, note: `Sent · ${what}` })
  }, SEND_UNDO_MS))
}

/** Catch it before it goes. Nothing was sent, so the record goes entirely and the row is unsent. */
export function undoSend(id: string) {
  const t = going.get(id)
  if (t === undefined) return false
  window.clearTimeout(t)
  going.delete(id)
  clearEdit("reply", id)
  return true
}
