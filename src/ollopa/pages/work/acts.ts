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
