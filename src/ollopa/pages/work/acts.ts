// The two small pieces the Inbox, Tasks and Home share when a chain crosses two objects.
//
// `originHere` is where the person is standing, in the words the header is using, so any control can
// hand `follow` an origin without every component being told its own route. The title is the shell's
// own h1: AppShell writes "<page> · <workspace> · ollopA" into document.title, so the first part is
// exactly the crumb the header will draw.
//
// The second piece is for a task acted on from a pane. A pane is drawn by the shell, not by the page
// behind it, so it cannot reach into that page's state — and an action must still show its effect
// where it was caused (rule 8). So the pane says what happened and the page that owns the row
// applies it: one event, one listener, no shared store and no re-render of the page while the pane
// is merely open.
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

export type TaskAct = "done" | "snoozed"

const TASK_ACT = "ollopa:task-act"

/** Said by a task pane; heard by the page whose row the task is on. */
export function actOnTask(id: string, what: TaskAct) {
  document.dispatchEvent(new CustomEvent(TASK_ACT, { detail: { id, what } }))
}

/** Listen, and stop listening. Returns the cleanup an effect wants. */
export function onTaskAct(run: (id: string, what: TaskAct) => void): () => void {
  const on = (e: Event) => {
    const d = (e as CustomEvent<{ id: string; what: TaskAct }>).detail
    if (d) run(d.id, d.what)
  }
  document.addEventListener(TASK_ACT, on)
  return () => document.removeEventListener(TASK_ACT, on)
}
