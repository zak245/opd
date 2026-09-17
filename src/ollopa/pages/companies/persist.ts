// What these two tables remember, per user and per workspace (specs/03 §6 "Persistence",
// specs/11 §6). Filter values, the additional-filters door, columns, sort, the active view and the
// Find companies drawer's own filters. Door open state is the Door primitive's own business.
//
// Nothing here is inferred: every value was written by something the person did.
import { useCallback, useState } from "react"
import type { Business } from "../../usage/model"

const key = (page: string, business: Business, user: string) => `ollopa.${page}.${business}.${user}`

function read<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k)
    return raw ? ({ ...fallback, ...(JSON.parse(raw) as object) } as T) : fallback
  } catch {
    return fallback
  }
}

/** One JSON blob per page per user per workspace; `set` merges and writes through. */
export function usePageState<T extends object>(page: string, business: Business, user: string, initial: T) {
  const k = key(page, business, user)
  const [state, setState] = useState<T>(() => read(k, initial))
  const set = useCallback((patch: Partial<T>) => {
    setState((s) => {
      const next = { ...s, ...patch }
      try { localStorage.setItem(k, JSON.stringify(next)) } catch { /* private mode: this visit only */ }
      return next
    })
  }, [k])
  return [state, set] as const
}
