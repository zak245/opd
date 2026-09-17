// Wizard answers, saved as they are made.
//
// Both wizards on this page promise the same thing in the same words — "Every change is saved as it is
// made", "Save and exit", "Resume", "Discard" — so both read and write through here. A draft is per
// workspace and per thing being set up; it survives a closed tab and a sign-out, and only Discard
// removes it. Nothing here expires on its own (spec 15 §3.1, spec 18 §3.1).
import { useCallback, useSyncExternalStore } from "react"

const listeners = new Set<() => void>()
const cache = new Map<string, unknown>()

function announce() { listeners.forEach((l) => l()) }
function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l) } }

/** The stored answers merged over the starting ones, so a new question added later still has a value. */
function read<T extends object>(key: string, start: T): T {
  const held = cache.get(key)
  if (held) return held as T
  let value = start
  try {
    const raw = localStorage.getItem(key)
    if (raw) value = { ...start, ...(JSON.parse(raw) as Partial<T>) }
  } catch { /* private mode: the draft lives for this visit only */ }
  cache.set(key, value)
  return value
}

export function writeDraft<T extends object>(key: string, value: T) {
  cache.set(key, value)
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode */ }
  announce()
}

export function discardDraft(key: string) {
  cache.delete(key)
  try { localStorage.removeItem(key) } catch { /* private mode */ }
  announce()
}

export function peekDraft<T extends object>(key: string, start: T): T {
  return read(key, start)
}

/**
 * `[draft, save, discard]`. `save` takes a patch and writes it at once — there is no Save button on a
 * wizard step, because a wizard that forgets what you typed splits context across time (rule 5).
 */
export function useDraft<T extends object>(key: string, start: T): [T, (patch: Partial<T>) => void, () => void] {
  const value = useSyncExternalStore(subscribe, () => read(key, start), () => read(key, start))
  const save = useCallback((patch: Partial<T>) => { writeDraft(key, { ...read(key, start), ...patch }) }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  const drop = useCallback(() => discardDraft(key), [key])
  return [value, save, drop]
}
