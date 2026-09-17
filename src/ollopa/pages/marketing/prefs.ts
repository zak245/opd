// What the reader chose, remembered per user and per workspace: the view, the sort, the columns, the
// active filters. Doors remember themselves (the Door primitive); everything else on these pages
// remembers itself here, because a view that forgets is a view you set again every morning (rule 5).
import { useCallback, useState } from "react"
import { useSession } from "../../session"

export function usePref<T>(id: string, initial: T): [T, (next: T) => void] {
  const session = useSession()
  const key = `ollopa.pref.${session?.user ?? "anon"}.${session?.business ?? "none"}.${id}`
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch { return initial }
  })
  const write = useCallback((next: T) => {
    setValue(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* private mode: this visit only */ }
  }, [key])
  return [value, write]
}
