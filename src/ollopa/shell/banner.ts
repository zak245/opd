// What a page has to say above its own content, so the shell can say it in one place.
//
// Round 11's rule: above the content there is the header and one Alert, and nothing else. A page
// that has workspace health to report or a workspace change to announce does not draw a band of its
// own — it publishes here, and the shell folds the items into the Alert it already draws.
//
// A module-level store rather than a context, for the same reason `edits.ts` is one: the publisher
// is deep inside a page and the reader is above it in the tree.
import { useSyncExternalStore } from "react"

export interface BannerItem {
  kind: "error" | "warning" | "info"
  text: string
  href: string
}

export interface BannerNews {
  text: string
  href?: string
}

interface Banner {
  items: BannerItem[]
  news?: BannerNews
}

const EMPTY: Banner = { items: [] }
let snapshot: Banner = EMPTY
const subscribers = new Set<() => void>()

function emit() {
  for (const f of subscribers) f()
}

/** Said by the page, from an effect. Replaces whatever the last page said. */
export function setBanner(items: BannerItem[], news?: BannerNews) {
  snapshot = items.length === 0 && !news ? EMPTY : { items, news }
  emit()
}

export function clearBanner() {
  if (snapshot === EMPTY) return
  snapshot = EMPTY
  emit()
}

export function useBanner(): Banner {
  return useSyncExternalStore(
    (f) => { subscribers.add(f); return () => { subscribers.delete(f) } },
    () => snapshot,
    () => snapshot,
  )
}
