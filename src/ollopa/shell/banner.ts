// What a page needs decided, so the shell can say it in one place.
//
// One band, one item, one decision (LAYOUTS.md §2). A line earns the band only if something is
// stopped, spending or at risk until it is answered, and the answer is a choice the person makes
// rather than a page they visit. A pointer to a page is not an alert; a filter is not an alert; a
// limit that clears itself is not an alert. So a page hands over at most one item, and that item
// carries the act that decides it — an item with no act is not published at all.
//
// A module-level store rather than a context, for the same reason `edits.ts` is one: the publisher
// is deep inside a page and the reader is above it in the tree.
import { useEffect, useSyncExternalStore } from "react"

export interface AlertItem {
  /** Stable within the page, so React can key it. */
  id: string
  /** The thing itself, in its own words. It becomes the band's title. */
  text: string
  /** The acts that decide it, at most two, drawn through `Actions`. */
  acts?: { label: string; onClick: () => void }[]
  /** Where it is decided, when the act is a destination rather than a choice. */
  href?: string
  /** Danger rather than a warning. It is this item's own, never a sibling's. */
  danger?: boolean
}

let pageAlerts: AlertItem[] = []
const alertSubscribers = new Set<() => void>()

/**
 * A page says the one thing it needs decided. Everything past the first item that carries an act is
 * dropped: the band holds one item, and a page that wants to say more says it in its own first
 * section, next to what it is about (RULES.md rule 5).
 */
export function declareAlerts(items: AlertItem[]) {
  const kept = items.filter((i) => i.acts?.length).slice(0, 1)
  pageAlerts = kept
  for (const f of alertSubscribers) f()
  return () => {
    if (pageAlerts === kept) {
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
 * useDeclareAlerts(paused ? [{
 *   id: paused.id, text: paused.text, danger: true,
 *   acts: [{ label: "Resume", onClick: () => resume(paused) }],
 * }] : [])
 * ```
 */
export function useDeclareAlerts(items: AlertItem[]) {
  // The list is rebuilt on every render of the page, so its words are its identity.
  const key = items.map((i) => `${i.id}|${i.text}|${i.danger ? "!" : ""}`).join("\n")
  useEffect(() => declareAlerts(items), [key]) // eslint-disable-line react-hooks/exhaustive-deps
}
