// The nine review questions of RULES.md, scored 0, 1 or 2, one row per step. A screen needs 16 of 18.
//
// The order is the rubric's: decision-critical visible · every item has a sourced number · no third
// level · doors named by content · doors adjacent and reachable · nothing dependent split · state
// persists · never inferred history · instrumented with a scheduled review.
//
// The last row is spec 14 §6.8: 17 of 18, with point 9 at 1 because the demo has no analytics behind
// the promote-keep-delete review it schedules.
import type { StepScores } from "@/learn/context"

export const scores: StepScores[] = [
  [0, 0, 0, 0, 1, 0, 0, 2, 0], //  3 · step 0, the common version
  [1, 0, 0, 0, 1, 0, 0, 2, 0], //  4 · rule 7: the strip
  [2, 2, 1, 0, 2, 0, 0, 2, 0], //  9 · rule 1: one page, levels from the usage model
  [2, 2, 2, 0, 2, 0, 0, 2, 0], // 10 · rule 2: the tabs go
  [2, 2, 2, 2, 2, 0, 0, 2, 0], // 12 · rule 4: names, counts and real locks
  [2, 2, 2, 2, 2, 2, 2, 2, 0], // 16 · rule 5: the pairs, and state that persists
  [2, 2, 2, 2, 2, 2, 2, 2, 1], // 17 · rule 8: the accelerators
]
