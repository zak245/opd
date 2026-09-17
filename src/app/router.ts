import { useSyncExternalStore } from "react"

// Hash routing so the whole thing is one static build.
//   #/                         library home
//   #/ollopa                   the product (sign-in when no session)
//   #/ollopa/people            a page
//   #/ollopa/people/c-12       a record: the deep link is a first-class route, not a fallback
//   #/ollopa/setup             workspace set-up
//   #/ollopa/connect/salesforce   the connect wizard
//   #/ollopa/settings/plan     a settings area, the anchor written as a path segment
//   #/learn/settings?step=2    a lesson at a step

export interface Route { path: string[]; query: URLSearchParams; raw: string }

function parse(): Route {
  const raw = location.hash.replace(/^#/, "") || "/"
  const [p, q = ""] = raw.split("?")
  return { path: p.split("/").filter(Boolean), query: new URLSearchParams(q), raw }
}

let current = parse()
const listeners = new Set<() => void>()

window.addEventListener("hashchange", () => {
  const previous = current
  current = parse()
  listeners.forEach((l) => l())
  // A new page starts at the top; a query change on the same page keeps its place.
  if (previous.path.join("/") !== current.path.join("/")) {
    document.getElementById("ollopa-main")?.scrollTo({ top: 0 })
  }
})

export function useRoute(): Route {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => current,
    () => current,
  )
}

export function navigate(to: string) {
  location.hash = to.startsWith("#") ? to.slice(1) : to
}

export function href(to: string) {
  return "#" + (to.startsWith("/") ? to : "/" + to)
}

/** ⌘Enter from the palette: the same route, in a new tab. */
export function openInNewTab(to: string) {
  window.open(location.pathname + href(to), "_blank", "noopener")
}
