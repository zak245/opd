import { useSyncExternalStore } from "react"
import type { Business, Role } from "./usage/model"

export interface Session { business: Business; role: Role }

const KEY = "ollopa.session"
let current: Session | null = read()
const listeners = new Set<() => void>()

function read(): Session | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch { return null }
}

export function signIn(s: Session) {
  current = s
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode: session lives in memory only */ }
  listeners.forEach((l) => l())
}

export function signOut() {
  current = null
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  listeners.forEach((l) => l())
}

export function useSession(): Session | null {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => current,
    () => current,
  )
}
