import { useSyncExternalStore } from "react"

// Hash routing so the whole thing is one static build.
//   #/                     library home
//   #/ollopa               product (sign-in when no session)
//   #/ollopa/people        a product page
//   #/learn/settings?step=2   a lesson at a step

export interface Route { path: string[]; query: URLSearchParams; raw: string }

function parse(): Route {
  const raw = location.hash.replace(/^#/, "") || "/"
  const [p, q = ""] = raw.split("?")
  return { path: p.split("/").filter(Boolean), query: new URLSearchParams(q), raw }
}

let current = parse()
const listeners = new Set<() => void>()
window.addEventListener("hashchange", () => { current = parse(); listeners.forEach((l) => l()) })

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
