// The nine review questions of RULES.md, scored 0, 1 or 2, one row per step, filled as the rules land.
// A screen needs 16 of 18 to pass. Question 7 stops at 1 and says why in README.md.
import type { StepScores } from "../../src/learn/context"

export const scores: StepScores[] = [
  //     1  2  3  4  5  6  7  8  9
  /* 0 */[0, 0, 0, 0, 0, 0, 0, 0, 0],
  /* 1 */[0, 0, 2, 0, 1, 0, 0, 0, 0],
  /* 2 */[1, 0, 2, 2, 2, 0, 0, 0, 0],
  /* 3 */[1, 0, 2, 2, 2, 2, 1, 0, 0],
  /* 4 */[2, 0, 2, 2, 2, 2, 1, 0, 0],
  /* 5 */[2, 2, 2, 2, 2, 2, 1, 0, 0],
  /* 6 */[2, 2, 2, 2, 2, 2, 1, 2, 0],
  /* 7 */[2, 2, 2, 2, 2, 2, 1, 2, 2],
]
