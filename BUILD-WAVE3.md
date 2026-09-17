# Wave 3: lessons and the library site

Wave 2 built every page of ollopA in its final form. Wave 3 builds the two surfaces that teach: the lesson view, which shows a page evolving one rule at a time, and the library site, which holds the rules, the cases and the knowledge base. Read `BUILD-BRIEF.md`, `RULES.md`, `PLAN.md` sections 3 to 5, and `src/learn/context.ts`, which is the contract every builder here works to.

## The contract

**A lesson is the real page at a step.** The stage renders the same component the product routes to (`PageBody` in `src/ollopa/Product.tsx`), inside a `LessonProvider`. The page reads `useLesson()`: null in the product means every rule is on; on a stage it names the case, the step and `rulesOn`. Step 0 has no rule on and renders the common version the spec's section 5 describes, from the same rows, seed and usage numbers. There is never a second implementation of a page. `ruleOn(lesson, n)` is the only branch a page needs.

**Pages tag what can move.** The lesson view finds moves by comparing the DOM before and after a step, so a page marks:

- `data-item="<id>"` on every element that is a thing: a row, a column header, a button, a chip, a card, a strip line, a menu entry. Use the usage item id where one exists (`src/ollopa/usage/<page>.ts`); otherwise a stable id in the same style. The same thing keeps the same id at every step, whatever it looks like.
- `data-container="<id>" data-container-label="<label>"` on every place a thing can live: a strip, an area, a table header row, a bulk bar, a menu, a panel body, a parody tab. The `Door` primitive tags its own body and root (`data-door`, `data-open`), so a page never tags a door by hand.
- A move is a change of container or a change of order inside a container. Things that shift to make room are not moves.
- A thing is hidden when an ancestor `[data-door]` has `data-open="false"`, or an ancestor is a closed parody tab (`data-container` with `data-open="false"`). Never measure size to decide.

**A case folder is data, not code.** `cases/<id>/` holds:

- `README.md` from `cases/TEMPLATE/README.md`, every section filled.
- `case.ts` exporting `meta: CaseMeta` (id, title, summary, node, recordId, session, spec).
- `steps.ts` exporting `steps: LessonStep[]`. Step 0 is the common version with `rule: null` and `chrome: "own"` where the parody draws its own chrome; later steps carry the rule, what moved, why, the evidence quotes with their source names, and the doors to open on arrival.
- `scores.ts` exporting `scores: StepScores[]`, one row of nine per step, filled as the rules land.
- `screens/step-0.png` and `screens/step-last.png` at 1440, taken with `scripts/shot.mjs` against `#/learn/<id>?step=N`.

The lesson view discovers cases with `import.meta.glob("../../cases/*/case.ts")` and the site does the same for `README.md`.

**Evidence must exist.** Every quote in `steps.ts` is in `knowledge-base/` or `knowledge-base/sources/`. Search before you write; if the sentence is not there, do not use it.

## Owners

Eight builders, disjoint folders. A builder edits only what its row names.

| Builder | Owns | Builds |
|---|---|---|
| Lesson view | `src/learn/` (not `context.ts` types; add to it, never change what exists), `src/ollopa/ui/Door.tsx` (the data attributes and an open-by-id event only) | The six parts of PLAN.md section 4 on shadcn: rail, stage, delta with in-flow ghosts, score, evidence behind a toggle, controls. Route `#/learn/<id>?step=N`. Signs the session in as the case says. Ghost timings from PLAN.md. Arrow keys on the rail; every control reachable by keyboard. Phone width: rail becomes a top strip, score and evidence a sheet. Test against `cases/settings/` once it exists; until then against a case you write in `cases/_smoke/` and delete before you finish. |
| Library site | `src/site/`, `package.json` (a markdown renderer only) | `#/` is `RULES.md` rendered as the front page with the eight rules, the three patterns and the score; `#/cases` lists every case folder with title, summary, step-0 and step-last screenshots and "Open the lesson"; `#/cases/<id>` renders the case README; `#/kb` and `#/kb/<slug>` render `knowledge-base/` and `knowledge-base/sources/`; `#/contribute` is the template plus the checklist from PLAN.md section 5; a header with those five links and "Open ollopA". Markdown links between files become hash routes. Same tokens and theme as the product. |
| Settings case | `cases/settings/`, `src/ollopa/pages/settings/` | Spec 14 sections 5 and 7: six steps, rules 7, 1, 2, 4, 5, 8. Step 0 is the Apollo parody with its own settings shell. Meridian admin. |
| People case | `cases/people/`, `src/ollopa/pages/people/` | Spec 02 sections 5 and 7: eight steps, rules 1 to 8 in order. Meridian SDR. |
| Deal record case | `cases/deal-record/`, `src/ollopa/pages/deal/` | Spec 09 sections 5 and 7: eight steps, rules 1 to 8 in order. Meridian AE, a deal in Proposal with activity, files and a proposal card. |
| Connect case | `cases/connect/`, `src/ollopa/pages/connect/` | Spec 15 sections 5 and 7: seven steps, rules 2, 4, 5, 7, 1, 6, 8. Meridian admin, the Salesforce path. |
| Agents case | `cases/agents/`, `src/ollopa/pages/agents/` | Spec 13 sections 5 and 7: six steps, rules 7, 1, 2, 4, 5, 8. Meridian SDR. |

A case builder keeps its page's final form exactly as wave 2 shipped it: the last step must render the same DOM as the product. Add the step branches; do not redesign. Where the spec's section 5 names an Apollo article or memo section, the parody follows it; nothing in step 0 is invented.

## Deliver

- `npx tsc -b` and `npx vite build` pass with your folder in.
- A case: walk every step with the keyboard; take the two screenshots; look at them; fill the README including the review table with your own scores and a note that the reviewer's pass is still due.
- Reply in 250 words: what is built, the self-score of the last step with proof lines, every evidence quote's source file, deviations from the spec stated plainly, file paths.
