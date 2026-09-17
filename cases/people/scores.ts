// The nine review questions of RULES.md, scored 0, 1 or 2 at each step. A screen passes at 16 of 18.
//
// The order is the rubric's: decision-critical visible; every visible item backed by a number;
// no third level; doors labelled by content; doors adjacent and operable; nothing dependent split;
// state persists with expand-all and print; user action or object state; instrumented and reviewed.
//
// These are the builder's own scores. The reviewer's pass is still due.
import type { StepScores } from "@/learn/context"

export const scores: StepScores[] = [
  // 0 · the common version. The price is eight steps into a dialog, nothing on screen can say why it
  //     is on screen, and the sidebar is three levels deep. It scores for two things: the sidebar
  //     does sit next to the table it filters, and nothing on the page rearranges itself by history.
  [0, 0, 0, 0, 1, 0, 0, 1, 0],
  // 1 · rule 1. Every visible item is now there because of a weekly-use number with a source.
  [0, 2, 0, 0, 1, 0, 0, 1, 0],
  // 2 · rule 2. One panel, flat; the tabs are gone; nothing reaches three.
  [0, 2, 2, 0, 1, 0, 0, 1, 0],
  // 3 · rule 3. Headings name content, so the labels are half right; the doors still carry no counts.
  [0, 2, 2, 1, 1, 0, 0, 1, 0],
  // 4 · rule 4. Every door says what is behind it and how much of it, and sits where it reveals.
  [0, 2, 2, 2, 2, 0, 0, 1, 0],
  // 5 · rule 5. The selection controls are together and restate the result; the panel remembers.
  [0, 2, 2, 2, 2, 2, 2, 1, 0],
  // 6 · rule 6. The bar comes from selection, an object state, and nothing else moves on its own.
  [0, 2, 2, 2, 2, 2, 2, 2, 0],
  // 7 · rule 7. The price and the count are on the control that spends. 16 of 18: a pass.
  [2, 2, 2, 2, 2, 2, 2, 2, 0],
  // 8 · rule 8. Question 9 stays at 1 and not 2: the numbers are published research fitted to this
  //     workspace (USAGE-MODEL.md) and the delete review is written into this case, but there is no
  //     live door-usage instrumentation behind the screen, because there is no live product behind it.
  [2, 2, 2, 2, 2, 2, 2, 2, 1],
]
