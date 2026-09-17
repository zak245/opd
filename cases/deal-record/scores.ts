// The nine review questions of RULES.md, scored 0, 1 or 2, one row per step.
// Filled by the builder as each rule lands; the reviewer's pass is still due.
import type { StepScores } from "@/learn/context"

export const scores: StepScores[] = [
  //  1  2  3  4  5  6  7  8  9
  [0, 0, 0, 0, 0, 0, 0, 1, 0], // 0 · the common version                      1
  [0, 1, 0, 0, 1, 1, 0, 1, 0], // 1 · hide the rare, never the necessary       4
  [0, 1, 2, 0, 1, 1, 1, 1, 0], // 2 · stop at two levels                       7
  [0, 2, 2, 0, 1, 1, 1, 1, 0], // 3 · split by task frequency, not skill       8
  [0, 2, 2, 2, 2, 1, 1, 1, 0], // 4 · make the door obvious and honest        11
  [0, 2, 2, 2, 2, 2, 2, 1, 0], // 5 · keep context across the boundary        13
  [1, 2, 2, 2, 2, 2, 2, 2, 0], // 6 · stable, user-controlled disclosure      15
  [2, 2, 2, 2, 2, 2, 2, 2, 0], // 7 · decision-critical never behind a door   16
  [2, 2, 2, 2, 2, 2, 2, 2, 1], // 8 · fade the scaffold, give accelerators    17
]
