// What these pages changed, kept.
//
// Every action on Campaigns and Workflows does something the session can see: a pause is paused when
// you come back, a frozen audience stays frozen, a raised ceiling is the number the row prints, a new
// draft is a row you can open. The seed is the starting state; this holds the difference, per
// workspace, so the table and the record can never disagree about what somebody just did.
import { useSyncExternalStore } from "react"
import { seedFor, type Audience, type Campaign, type Form, type Workflow } from "../../data/seed"
import type { Business } from "../../usage/model"

type Kind = "campaigns" | "audiences" | "forms" | "workflows"

interface Changes {
  patched: { campaigns: Record<string, Partial<Campaign>>; audiences: Record<string, Partial<Audience>>; forms: Record<string, Partial<Form>>; workflows: Record<string, Partial<Workflow>> }
  added: { campaigns: Campaign[]; audiences: Audience[]; forms: Form[]; workflows: Workflow[] }
  removed: string[]
}

const empty = (): Changes => ({
  patched: { campaigns: {}, audiences: {}, forms: {}, workflows: {} },
  added: { campaigns: [], audiences: [], forms: [], workflows: [] },
  removed: [],
})

const key = (b: Business) => `ollopa.marketing.${b}`
const cache = new Map<Business, Changes>()
const listeners = new Set<() => void>()
/** One object per business, replaced on every write, so useSyncExternalStore sees a new snapshot. */
const views = new Map<Business, ReturnType<typeof build>>()

function changes(b: Business): Changes {
  const held = cache.get(b)
  if (held) return held
  let loaded = empty()
  try {
    const raw = localStorage.getItem(key(b))
    if (raw) loaded = { ...empty(), ...(JSON.parse(raw) as Changes) }
  } catch { /* private mode: this visit only */ }
  cache.set(b, loaded)
  return loaded
}

function save(b: Business, next: Changes) {
  cache.set(b, next)
  views.delete(b)
  try { localStorage.setItem(key(b), JSON.stringify(next)) } catch { /* private mode: this visit only */ }
  listeners.forEach((l) => l())
}

function merge<T extends { id: string }>(rows: T[], patched: Record<string, Partial<T>>, added: T[], removed: string[]): T[] {
  return [...rows, ...added]
    .filter((r) => !removed.includes(r.id))
    .map((r) => (patched[r.id] ? { ...r, ...patched[r.id] } : r))
}

function build(b: Business) {
  const seed = seedFor(b)
  const c = changes(b)
  return {
    campaigns: merge<Campaign>(seed.campaigns, c.patched.campaigns, c.added.campaigns, c.removed),
    audiences: merge<Audience>(seed.audiences, c.patched.audiences, c.added.audiences, c.removed),
    forms: merge<Form>(seed.forms, c.patched.forms, c.added.forms, c.removed),
    workflows: merge<Workflow>(seed.workflows, c.patched.workflows, c.added.workflows, c.removed),
  }
}

function snapshot(b: Business) {
  const held = views.get(b)
  if (held) return held
  const next = build(b)
  views.set(b, next)
  return next
}

/** The campaigns, audiences, forms and workflows of a workspace, with this session's changes applied. */
export function useMarketing(business: Business) {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => snapshot(business),
    () => snapshot(business),
  )
}

export function patchRow(business: Business, kind: "campaigns", id: string, patch: Partial<Campaign>): void
export function patchRow(business: Business, kind: "audiences", id: string, patch: Partial<Audience>): void
export function patchRow(business: Business, kind: "forms", id: string, patch: Partial<Form>): void
export function patchRow(business: Business, kind: "workflows", id: string, patch: Partial<Workflow>): void
export function patchRow(business: Business, kind: Kind, id: string, patch: object) {
  const c = changes(business)
  const area: Record<string, object> = { ...(c.patched[kind] as Record<string, object>) }
  area[id] = { ...(area[id] ?? {}), ...patch }
  save(business, { ...c, patched: { ...c.patched, [kind]: area } as Changes["patched"] })
}

export function addRow(business: Business, kind: "campaigns", row: Campaign): void
export function addRow(business: Business, kind: "audiences", row: Audience): void
export function addRow(business: Business, kind: "forms", row: Form): void
export function addRow(business: Business, kind: "workflows", row: Workflow): void
export function addRow(business: Business, kind: Kind, row: { id: string }) {
  const c = changes(business)
  const next = [row, ...(c.added[kind] as { id: string }[])]
  save(business, { ...c, added: { ...c.added, [kind]: next } as Changes["added"] })
}

/** Deleting a draft. Sent campaigns are archived, never deleted, so the caller decides which this is. */
export function removeRow(business: Business, id: string) {
  const c = changes(business)
  save(business, { ...c, removed: [...c.removed, id] })
}
