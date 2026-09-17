// The nine review questions of RULES.md, scored 0, 1 or 2, one row per step. A screen needs 16 of 18.
//
// These are the builder's own scores, with the reasoning in README.md. The reviewer's pass is still due.
import type { StepScores } from "@/learn/context"

export const scores: StepScores[] = [
  // 0 — the common version: credits four levels down, approvals inside a chat, an unlabelled chevron.
  [0, 0, 0, 0, 1, 0, 0, 1, 0],
  // 1 — rule 7: spend, queue and exceptions at level one; still four levels deep elsewhere.
  [2, 0, 0, 0, 1, 1, 0, 1, 0],
  // 2 — rule 1: level one is decided by measured weekly use for this seat.
  [2, 2, 0, 0, 1, 1, 0, 1, 0],
  // 3 — rule 2: nothing is more than one door from the page, on either screen size.
  [2, 2, 2, 0, 1, 1, 0, 1, 0],
  // 4 — rule 4: doors labelled by content, controls removed rather than disabled.
  [2, 2, 2, 2, 1, 1, 0, 1, 0],
  // 5 — rule 5: the consequence sits beside Approve; state persists; expand all and print exist.
  [2, 2, 2, 2, 2, 2, 2, 1, 0],
  // 6 — rule 8: accelerators, and the scheduled promote/keep/delete review. Question 9 is a 1, not a
  //     2: the counting is specified and the review is diarised, but OPD has no analytics behind it,
  //     so nothing has actually been counted yet.
  [2, 2, 2, 2, 2, 2, 2, 2, 1],
]
