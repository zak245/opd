// What a page has to say above its own content, so the shell can say it in one place.
//
// Round 11's rule: above the content there is the header and one Alert, and nothing else. A page
// that has workspace health to report or a workspace change to announce does not draw a band of its
// own — it publishes here, and the shell folds the items into the Alert it already draws.
//
// A module-level store rather than a context, for the same reason `edits.ts` is one: the publisher
// is deep inside a page and the reader is above it in the tree.
import { useEffect, useSyncExternalStore } from "react"

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

/* ------------------------------------------------------------------ what a page needs decided */

export interface AlertItem {
  /** Stable within the page, so React can key it and the shell can dedupe. */
  id: string
  /** One line: what needs deciding. */
  text: string
  /** The acts that decide it, drawn as inline links inside the one Alert. */
  acts?: { label: string; onClick: () => void }[]
  /** A link to where it is decided, when there is no act to run here. */
  href?: string
  /** Danger rather than a warning: it makes the one Alert destructive. */
  danger?: boolean
}

let pageAlerts: AlertItem[] = []
const alertSubscribers = new Set<() => void>()

/**
 * A page says what it needs decided; the shell folds it into the one Alert it already draws, after
 * the workspace's own items (LAYOUTS.md §2, one Alert per page). Call it from an effect and return
 * its cleanup, or use `useDeclareAlerts`.
 */
export function declareAlerts(items: AlertItem[]) {
  pageAlerts = items
  for (const f of alertSubscribers) f()
  return () => {
    if (pageAlerts === items) {
      pageAlerts = []
      for (const f of alertSubscribers) f()
    }
  }
}

export function usePageAlerts(): AlertItem[] {
  return useSyncExternalStore(
    (f) => { alertSubscribers.add(f); return () => { alertSubscribers.delete(f) } },
    () => pageAlerts,
    () => pageAlerts,
  )
}

/**
 * The hook form: the page declares what it needs decided and the shell clears it on unmount.
 *
 * ```tsx
 * useDeclareAlerts(exceptions.map((e) => ({
 *   id: e.id, text: e.text, danger: true,
 *   acts: [{ label: "Resume", onClick: () => resume(e) }],
 * })))
 * ```
 */
export function useDeclareAlerts(items: AlertItem[]) {
  // The list is rebuilt on every render of the page, so its words are its identity.
  const key = items.map((i) => `${i.id}|${i.text}|${i.danger ? "!" : ""}`).join("\n")
  useEffect(() => declareAlerts(items), [key]) // eslint-disable-line react-hooks/exhaustive-deps
}
