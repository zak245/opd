// What a person changed on these two pages, for as long as the session lasts.
//
// The seed stays the source of truth; this is the layer on top of it, so a stage moved on the table
// is still moved when the record opens, a removed row is still gone when you come back, and Undo is
// a real reversal rather than a word in a toast.
import { useSyncExternalStore } from "react"
import type { AccountStage, AccountRisk, Play } from "../../data/seed"

export interface CompanyChange {
  stage?: AccountStage
  owner?: string
  name?: string
  domain?: string
  industry?: string
  employees?: number
  city?: string
  removed?: boolean
  lists?: string[]
  nextStep?: { text: string; due: string }
  touches?: { kind: string; at: string; note: string; by: string }[]
  risks?: AccountRisk[]
  resolvedRisks?: string[]
  dismissedSignals?: string[]
  plays?: Play[]
  notes?: { by: string; on: string; text: string }[]
  researchRuns?: { id: string; agent: string; at: string; sources: number; credits: number }[]
  pushedToCrmAt?: string
  churned?: boolean
}

const store = new Map<string, CompanyChange>()
const listeners = new Set<() => void>()
let snapshot: ReadonlyMap<string, CompanyChange> = new Map()

function commit() {
  snapshot = new Map(store)
  listeners.forEach((l) => l())
}

export function changeFor(id: string): CompanyChange {
  return store.get(id) ?? {}
}

export function applyChange(id: string, patch: CompanyChange) {
  store.set(id, { ...changeFor(id), ...patch })
  commit()
}

/** Drops one key, which is what Undo does: it does not write the old value back over a newer one. */
export function undoChange(id: string, keys: (keyof CompanyChange)[]) {
  const next = { ...changeFor(id) }
  for (const k of keys) delete next[k]
  store.set(id, next)
  commit()
}

export function useChanges(): ReadonlyMap<string, CompanyChange> {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => snapshot,
    () => snapshot,
  )
}
