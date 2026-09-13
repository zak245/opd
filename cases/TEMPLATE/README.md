# Case: <screen name>

*Copy this folder to `cases/<screen-name>/` and fill every section. Delete the italics. A case is not done until it passes the review in [RULES.md](../../RULES.md) with 16 of 18, walked through by someone who did not build it.*

## The task

*One paragraph. Who is on this screen (which role), what they came to do, how often they do it. Name the one thing they must never lose sight of.*

## The common version

*What most teams ship. Two or three sentences on why it ends up that way. It is not a bad team; it is what happens when every request is added where it fits and nothing is ever moved.*

## The steps

*One row per rule applied, in the order the viewer will see them. Six is typical. Each step applies exactly one rule.*

| Step | Rule | What moves | Why, in one sentence | Evidence (must exist in the knowledge base) |
|---|---|---|---|---|
| 0 | | The common version | | |
| 1 | | | | |
| 2 | | | | |

## The numbers

*Where each usage percentage on this screen comes from. Illustrative numbers are fitted to the published shape and say so.*

| Item | Weekly use | Source or reasoning |
|---|---|---|

## Review

*Filled in by the reviewer, not the builder. Score each 0, 1 or 2.*

| # | Question | Score | Note |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | | |
| 2 | Every visible item backed by a sourced number | | |
| 3 | No third level on any screen size | | |
| 4 | Doors labelled by content, chevron and text | | |
| 5 | Doors adjacent, keyboard and touch | | |
| 6 | No dependent information split by a door | | |
| 7 | State persists; expand-all and print | | |
| 8 | User action or object state, never inferred history | | |
| 9 | Instrumented; promote, keep or delete review scheduled | | |

Total: / 18. Reviewer: . Date: .

Walkthrough done: keyboard only, both versions [ ]. Screen reader, disclosed version [ ]. Phone width [ ]. Screenshots of step 0 and the last step in `screens/` [ ].

## Files in this folder

- `model.ts`: one screen model with a layout per step. Never a separate "bad" and "good" implementation. Step N is the model with N rules on.
- `steps.ts`: the steps: rule, title, what moved, why, evidence quotes, and which doors to open on arrival so the change is visible.
- `scores.ts`: the nine rubric scores per step.
- `screens/`: screenshots of step 0 and the last step.
