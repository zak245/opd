// The one way Settings leaves for a related page.
//
// Settings is full of pointers at other objects: the CRM integration, the connect wizard, a
// developer surface, an enrichment job, the requests queue, the set-up questions. Every one of them
// used to be a bare link, which is why a person who followed one could not get back to the row they
// were reading. They all go through here instead: `follow` remembers the settings route, the page's
// own name and the row, so the crumb returns and the row is lit and focused on arrival.
//
// The anchor is always a usage item id — the same id the row carries as `data-item` and `data-row` —
// so the shell's return cue and the page's own `?row=` arrival find the same element.
import type { MouseEvent } from "react"
import { follow } from "../../chain"

/** Where we are now, without the query, so a return does not carry an old `?row=` with it. */
function here(): string {
  return location.hash.replace(/^#/, "").split("?")[0] || "/ollopa/settings"
}

/** Leave Settings for `to`, remembering the row being read. */
export function leaveSettings(to: string, anchor: string) {
  follow(to, { route: here(), title: "Settings", anchor })
}

/**
 * The same move from an `<a href>`, so the link stays a link: it can be copied, opened in a new tab
 * and read by a screen reader as the address it goes to. A plain left click follows the trail.
 */
export function leaveOnClick(to: string, anchor: string) {
  return (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    leaveSettings(to, anchor)
  }
}

/** The event the settings page listens for; `jumpToSetting` is how anything else raises it. */
export const JUMP_EVENT = "ollopa:settings-jump"

/**
 * Not a leave at all: another row on the page you are already standing on. A panel that names a row
 * — the removal list naming the API keys that could re-import the people it deletes — asks for the
 * row rather than for a route, so nothing navigates, the trail is untouched and the row is opened,
 * scrolled to and lit where it stands.
 */
export function jumpToSetting(rowId: string) {
  document.dispatchEvent(new CustomEvent(JUMP_EVENT, { detail: rowId }))
}
