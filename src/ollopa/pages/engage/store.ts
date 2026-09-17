// What the session remembers about lists, sequences, steps and templates.
//
// The seed is deterministic and read-only. Every action on these pages has to do something a person
// can see — a paused sequence stays paused when you go back to the list, a saved step keeps its new
// subject, a new draft is really there — so the changes land here, as an overlay per workspace that
// lives as long as the tab. Nothing pretends: if it is not written here, the control does not claim
// to have done it.
import { useSyncExternalStore } from "react"
import {
  seedFor, TODAY,
  type Enrollment, type List, type Sequence, type SequenceChange, type SequenceStep, type Template,
} from "../../data/seed"
import type { Business } from "../../usage/model"

interface Overlay {
  lists: Record<string, Partial<List>>
  removedLists: string[]
  sequences: Record<string, Partial<Sequence>>
  extraSequences: Sequence[]
  steps: Record<string, Partial<SequenceStep>>
  extraSteps: SequenceStep[]
  removedSteps: string[]
  stepOrder: Record<string, string[]>
  enrollments: Record<string, Partial<Enrollment>>
  removedEnrollments: string[]
  extraEnrollments: Enrollment[]
  changes: SequenceChange[]
  templates: Record<string, Partial<Template>>
}

const empty = (): Overlay => ({
  lists: {}, removedLists: [], sequences: {}, extraSequences: [], steps: {}, extraSteps: [],
  removedSteps: [], stepOrder: {}, enrollments: {}, removedEnrollments: [], extraEnrollments: [],
  changes: [], templates: {},
})

const overlays: Record<string, Overlay> = {}
const listeners = new Set<() => void>()
let version = 0

function overlay(business: Business): Overlay {
  return (overlays[business] ??= empty())
}
function changed() { version++; listeners.forEach((l) => l()) }

/** Every mutator a page on these four nodes needs. Each one is called from a control the user pressed. */
export const engage = {
  patchList(business: Business, id: string, patch: Partial<List>) {
    const o = overlay(business)
    o.lists[id] = { ...o.lists[id], ...patch }
    changed()
  },
  deleteList(business: Business, id: string) {
    const o = overlay(business)
    if (!o.removedLists.includes(id)) o.removedLists.push(id)
    changed()
  },
  undeleteList(business: Business, id: string) {
    const o = overlay(business)
    o.removedLists = o.removedLists.filter((x) => x !== id)
    changed()
  },
  patchSequence(business: Business, id: string, patch: Partial<Sequence>) {
    const o = overlay(business)
    const extra = o.extraSequences.find((s) => s.id === id)
    if (extra) Object.assign(extra, patch)
    else o.sequences[id] = { ...o.sequences[id], ...patch }
    changed()
  },
  addSequence(business: Business, seq: Sequence, steps: SequenceStep[]) {
    const o = overlay(business)
    o.extraSequences.push(seq)
    o.extraSteps.push(...steps)
    changed()
  },
  patchStep(business: Business, id: string, patch: Partial<SequenceStep>) {
    const o = overlay(business)
    const extra = o.extraSteps.find((s) => s.id === id)
    if (extra) Object.assign(extra, patch)
    else o.steps[id] = { ...o.steps[id], ...patch }
    changed()
  },
  addStep(business: Business, step: SequenceStep) {
    overlay(business).extraSteps.push(step)
    changed()
  },
  removeStep(business: Business, id: string) {
    const o = overlay(business)
    o.extraSteps = o.extraSteps.filter((s) => s.id !== id)
    if (!o.removedSteps.includes(id)) o.removedSteps.push(id)
    changed()
  },
  /** Reorder is an explicit list of step ids, so Move up and Move down survive a re-render. */
  setStepOrder(business: Business, sequenceId: string, ids: string[]) {
    overlay(business).stepOrder[sequenceId] = ids
    changed()
  },
  patchEnrollment(business: Business, id: string, patch: Partial<Enrollment>) {
    const o = overlay(business)
    const extra = o.extraEnrollments.find((e) => e.id === id)
    if (extra) Object.assign(extra, patch)
    else o.enrollments[id] = { ...o.enrollments[id], ...patch }
    changed()
  },
  removeEnrollment(business: Business, id: string) {
    const o = overlay(business)
    o.extraEnrollments = o.extraEnrollments.filter((e) => e.id !== id)
    if (!o.removedEnrollments.includes(id)) o.removedEnrollments.push(id)
    changed()
  },
  undoRemoveEnrollment(business: Business, id: string) {
    const o = overlay(business)
    o.removedEnrollments = o.removedEnrollments.filter((x) => x !== id)
    changed()
  },
  addEnrollments(business: Business, rows: Enrollment[]) {
    overlay(business).extraEnrollments.push(...rows)
    changed()
  },
  logChange(business: Business, sequenceId: string, who: string, what: string) {
    overlay(business).changes.unshift({ id: `ch-${Date.now()}-${version}`, sequenceId, when: TODAY, who, what })
    changed()
  },
  patchTemplate(business: Business, id: string, patch: Partial<Template>) {
    const o = overlay(business)
    o.templates[id] = { ...o.templates[id], ...patch }
    changed()
  },
}

export interface EngageData {
  lists: List[]
  sequences: Sequence[]
  stepsOf: (sequenceId: string) => SequenceStep[]
  enrollmentsOf: (sequenceId: string) => Enrollment[]
  changesOf: (sequenceId: string) => SequenceChange[]
  templates: Template[]
}

/** The seed with this session's changes on top. Every page on these nodes reads this, never the seed. */
export function useEngage(business: Business): EngageData {
  useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => version,
    () => version,
  )
  const seed = seedFor(business)
  const o = overlay(business)

  const lists = seed.lists
    .filter((l) => !o.removedLists.includes(l.id))
    .map((l) => (o.lists[l.id] ? { ...l, ...o.lists[l.id] } : l))

  const sequences = [
    ...o.extraSequences,
    ...seed.sequences.map((s) => (o.sequences[s.id] ? { ...s, ...o.sequences[s.id] } : s)),
  ]

  const allSteps = [
    ...seed.sequenceSteps.map((s) => (o.steps[s.id] ? { ...s, ...o.steps[s.id] } : s)),
    ...o.extraSteps,
  ].filter((s) => !o.removedSteps.includes(s.id))

  const allEnrollments = [
    ...seed.enrollments.map((e) => (o.enrollments[e.id] ? { ...e, ...o.enrollments[e.id] } : e)),
    ...o.extraEnrollments,
  ].filter((e) => !o.removedEnrollments.includes(e.id))

  const templates = seed.templates.map((t) => (o.templates[t.id] ? { ...t, ...o.templates[t.id] } : t))

  return {
    lists,
    sequences,
    templates,
    stepsOf: (sequenceId) => {
      const mine = allSteps.filter((s) => s.sequenceId === sequenceId)
      const order = o.stepOrder[sequenceId]
      const sorted = order
        ? [...mine].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
        : [...mine].sort((a, b) => a.order - b.order)
      return sorted.map((s, i) => (s.order === i + 1 ? s : { ...s, order: i + 1 }))
    },
    enrollmentsOf: (sequenceId) => allEnrollments.filter((e) => e.sequenceId === sequenceId),
    changesOf: (sequenceId) => [
      ...o.changes.filter((c) => c.sequenceId === sequenceId),
      ...seed.sequenceChanges.filter((c) => c.sequenceId === sequenceId),
    ],
  }
}
