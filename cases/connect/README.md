# Case: Connecting a CRM

Built from [specs/15-connect-integration.md](../../specs/15-connect-integration.md), sections 5 and 7. Seat: Meridian Software, RevOps admin. Lesson: `#/learn/connect?step=0`.

## The task

Daniel Okafor is Meridian Software's one RevOps admin, on the Scale plan with 42 seats. He is connecting Salesforce, and Salesforce is the system of record for 18,400 contacts, 3,100 companies and 214 open deals. He does this once per system and then lives with the result: after the connection, the weekly work is the integration page — status at 40 uses a week, errors at 30, retry and pull-now and sync history at 20 each. Setting up the connection is a first-time task; the spec calls it "intensive at setup, then on field changes; error logs weekly". The one thing he must never lose sight of is what the connection will do to Salesforce: what it will create there, what a deletion will delete and what a merge will merge, because Salesforce is where the company keeps its truth and a mirrored merge cannot be unmerged.

## The common version

Most teams ship what Apollo ships, and Apollo did not design it either. Integrations is a marketplace, so the first decision is a product variant — "Connect" or "Connect to Sandbox", "HubSpot CRM" or "HubSpot Data Enrichment" — before anyone has asked what the connection is for. Authorising runs across four systems with no step count, no progress and no resume, and its buttons are "Save and next" and "Done". A six-hour timer then switches syncing on by itself, however the settings happen to be set. And the settings themselves are four levels deep — page, object tab, Sync sub-tab, an "Advanced sync" block — because each switch was added where it fitted and nothing was ever moved. Deletion sync and merge sync, the two switches that decide what the connection can destroy, ended up inside the block nobody could name, so it got called "Advanced". The error log is another tab and the fix is on hover.

## The steps

| Step | Rule | What moves | Why, in one sentence | Evidence (must exist in the knowledge base) |
|---|---|---|---|---|
| 0 | — | The common version: marketplace, four-context authorisation, a six-hour timer, page › Contacts tab › Sync sub-tab › "Advanced sync", an error log with hover-only detail, a plan-gated door onto "available on certain plans" | What happens when every sync setting is added where it fits and nothing is ever moved | "Integrations (D1; per-integration pages D2; tabs D3; sub-tabs D4)"; "6-hour configuration window before auto-sync starts."; "hover for the description, full error and suggested fix" (07-apollo-settings-map.md, 16-apollo-workflow-inventory.md) |
| 1 | 2. Stop at two levels | Page › tab › sub-tab › block becomes six flat steps; pull and push conditions, field pairs, stage mapping and activity types leave their tabs for the step they belong to; the error log leaves the tab strip | A fourth level is where an admin gets lost; it is a structural problem, not a widget problem | Nielsen: "Designs that go beyond 2 disclosure levels typically have low usability…"; Pajamas: "three or more suggests the feature needs redesign" (00-core-model.md, sources/03-pattern-catalog.md) |
| 2 | 4. Make the door obvious and honest | "Advanced sync" becomes "Deletions and merges"; "Next" and "Done" become one button that says where it goes; "Step 3 of 6" appears in text; the suggested fix leaves the hover card for the error row; the plan-gated door goes | A label is the only scent a door has, and a door must always open onto something | Microsoft: "Remove (don't disable) progressive disclosure controls that don't apply…"; NN/g: "0% click-through on an unlabelled non-standard icon" (sources/04-b2b-saas-practice-and-case-studies.md, sources/11-sweep-navigation-findability.md) |
| 3 | 5. Keep context across the boundary | The write rule leaves its own block for the row of the pair it governs; the matching key leaves the Accounts tab to join deletion and merge in one group; every answer saves as it is made and the draft resumes | Fields edited together must be seen together, and a wizard that forgets what you typed splits context across time | Fluent 2: "Never put information in one accordion item that needs to be referenced in another accordion item"; Cowan: "averaging about four chunks" (00-core-model.md, sources/02-cognitive-science.md) |
| 4 | 7. Decision-critical is never behind a door | The timer goes and a button replaces it; deletion, merge and matching come out of the door onto the open page with a consequence line each; the review step states what the first sync will pull, push, delete and merge; the sync-user requirements move above the sign-in button | What a connection will do to the system of record is the one thing the admin must never lose sight of | Nielsen: "never hide decision-critical information (price, requirements, risks, privacy terms) behind the second level"; "Apollo mirrors your CRM: it never auto-merges or auto-deletes duplicates" (sources/01-foundations-and-definitions.md, sources/16-apollo-workflow-inventory.md) |
| 5 | 1. Hide the rare, never the necessary | The error log leaves the wizard for the integration page, where status, errors, retry, pull-now and history are level one; activity types and the unmapped-field tail go behind two doors in the wizard | Level one is decided by weekly use per role and business, measured, not by what felt important | Nielsen: "You must disclose everything that users frequently need up front."; "preferred to have unused functions tucked away." (00-core-model.md, sources/06-academic-literature.md) |
| 6 | 6. Stable, user-controlled disclosure | The condition builder appears because the radio beside it was chosen, not pre-filled; "14 fields were mapped for you" becomes "mapped, suggested, required unmapped" with saving as the confirmation; the step list is derived from the kind chosen | Object state is predictable; a timer and an inferred history are not | Findlater and McGrenere: "The static menu was found to be significantly faster than the adaptive menu"; Todi et al.: "Static 2283 ms, Frequency 2298 ms, MCTS 2162 ms" (sources/06-academic-literature.md, 00-core-model.md) |
| 7 | 8. Fade the scaffold; give experts accelerators | The page becomes the wizard as shipped: one step at a time, the five answered steps leaving the page for the step list where each is a link carrying its answer; ⌘S is printed on Save and exit; editing, retrying and re-authorising are never the wizard | The wizard is scaffolding for the first connection; the tenth connection and every later edit need a way past it | Budiu: wizards become "annoying and overly controlling"; NN/g heuristic 7: accelerators "unseen by the novice"; Cockburn: users "persistently fail to adopt faster methods" (00-core-model.md, 09-expert-voices.md) |

Rule 3 is not a step. One wizard serves Fathom's first connection and Halyard's tenth; the difference is accelerators, not an expert mode.

## The numbers

Every number is from [`src/ollopa/usage/connect.ts`](../../src/ollopa/usage/connect.ts), for Meridian's admin seat. They are illustrative, fitted to the published shape (Pendo 2024: 6.4% of features generate 80% of clicks at the median, 15.6% best-in-class; McGrenere and Moore 2000: Word users touched 27% of functions, range 3% to 45%). Level one is 20 or more uses a week, or decision-critical whatever the number.

| Item | Weekly use | Source or reasoning |
|---|---|---|
| `int.status` — status, last and next sync, records and errors today | 40 | Decision-critical: sync state is safety state. The admin's most-visited thing on this page, checked daily plus on every report of a missing record. |
| `int.errors` — errors grouped by cause | 30 | The spec's own cadence: "error logs weekly" for a healthy connection, daily for one with 3 errors today as Meridian's has. |
| `int.retry`, `int.pull-push-now`, `int.history` | 20, 20, 20 | Each follows from reading the errors: retry the group, force a pull, check what the last run did. |
| `int.edit-mapping` | 15 | A CRM field changes a few times a month across five objects. Level two: a door on the integration page, never the wizard. |
| `wiz.authorise` | 6 | Tokens and passwords expire; the admin re-authorises far more often than they connect something new. |
| `wiz.choose`, `wiz.objects`, `wiz.mapping`, `wiz.review` | 5 each | The first connection's spine. At Halyard, which onboards a client CRM most months, the same items run 22–25. |
| `wiz.deletion`, `wiz.merge`, `wiz.matching-key` | 3 each | Rare, and all three decision-critical: level one whatever the number, because they decide what the connection can destroy. |
| `wiz.sf-permissions` | 2 | Decision-critical: a requirement discovered after the consent screen is discovered too late. |
| `wiz.template` | 1 (Halyard 22) | Halyard's accelerator, not Meridian's. Below the threshold here, so it does not render on this stage — which is what rule 8 asks for: the accelerator appears where it is used. |

## Review

*Builder's own scores. A reviewer's pass by someone who did not build it is still due.*

| # | Question | Score | Note |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | Deletion, merge, matching and the sync-user requirements are on the open page with a consequence line each; the review step states what the first sync will pull, push, delete and merge, in counts, before the button. |
| 2 | Every visible item backed by a sourced number | 2 | Every item on the page is in `usage/connect.ts` with a weekly number per role and per business, and a note saying where the split came from. |
| 3 | No third level on any screen size | 2 | Page, then at most one door. At phone width the step list is a disclosure and the steps are the page; nothing reaches three. |
| 4 | Doors labelled by content, chevron and text | 2 | "Deletions and merges", "Which activities to push (emails, calls, tasks, meetings)", "Show 18 unmapped Salesforce fields" — each with a chevron, text and a count, from the shared `Door`. |
| 5 | Doors adjacent, keyboard and touch | 2 | Every door is a `<button>` in a heading with `aria-expanded`, sitting in the step it belongs to. Nothing is hover-only; the error fix is in the row. |
| 6 | No dependent information split by a door | 2 | The write rule is in its pair's row; deletion, merge and matching are one group; the stage map names the push-by-stage rule it serves. |
| 7 | State persists; expand-all and print | 1 | **The honest gap.** Door state persists per user and closed content stays in the DOM for find-in-page and print, but the wizard has no `DoorGroup`, so there is no Expand all on it and printing does not force the doors open. The integration page has both. Fixing it is one wrapper. |
| 8 | User action or object state, never inferred history | 2 | The timer is gone; the condition builder follows the radio; a suggested mapping is declared as a suggestion and confirmed by saving; the step list follows the kind chosen. |
| 9 | Instrumented; promote, keep or delete review scheduled | 2 | `usage/connect.ts` carries the number, the per-business override and the reasoning for all 37 items; RULES.md rule 8 schedules the twice-yearly promote, keep or delete pass. Note that the instrument is the usage model, not live analytics: OPD has none. |

Total: 17 / 18. Reviewer: *(pending — the builder scored this)*. Date: 17 Sep 2026.

Walkthrough done: keyboard only, both versions [x] — all eight steps walked with ← and →, 56 focusable controls at the last step, focus lands on the step heading on arrival. Screen reader, disclosed version [ ] — not yet run. Phone width [ ] — the layout uses the product's own responsive rules but has not been walked at 400px. Screenshots of step 0 and the last step in `screens/` [x].

## Deviations from the spec, stated plainly

- **The stage is the wizard, not both surfaces.** The case's node is `W-connect`, so half of steps 4, 5 and 7 — the integration page becoming "status plus five doors", Pause on the strip, Disconnect with its consequence, re-running a mapping without the wizard — is described in `moved` but happens on `R-integration`, which this lesson does not render. The error log is on the stage at steps 0 to 4 because Apollo puts it on the same page as the sync settings, and it leaves at step 5, which is where rule 1 sends it.
- **Steps 1 to 6 show all six setup steps on one scrolling page.** The spec's rule-2 step says "one page per step". The shipped wizard does exactly that; the lesson shows the six steps stacked from step 1 so that the moves between them are visible at all, and the split into one-step-at-a-time is what rule 8 lands at the last step, together with done steps becoming links. This is a teaching compromise, not a product difference: the last step is the shipped wizard, byte for byte.
- **The plan-gated door is removed rather than turned into a lock.** Spec step 2 allows either. Meridian is on Scale, which includes selective sync, two-way sync and custom objects, so nothing on this workspace is locked and the door simply goes. The lock-at-the-entry-point half of the rule is visible on a Starter or Growth workspace, not this one.
- **Push-by-stage and stage mapping do not share a tab.** Spec step 3 says they should. The shipped page puts stage mapping on the mapping step and push-by-stage on the rules step, with a line on the stage map naming the rule it serves. The rest of rule 5 — the write rule in its pair's row, deletion, merge and matching in one group, answers saved as they are made — is implemented as written.

## Files in this folder

- `case.ts`: the case's id, title, summary, the page node the stage renders (`W-connect`, record `salesforce`), the seat it signs in as (Meridian, admin), and the spec it is built from.
- `steps.ts`: the eight steps: rule, title, what moved, why, 26 evidence quotes with their sources, and which doors to open on arrival so the change is visible.
- `scores.ts`: the nine rubric scores per step, 0 at step 0 and 17 of 18 at the last.
- `screens/`: `step-0.png` and `step-last.png`, 1440×900.

The page itself lives in `src/ollopa/pages/connect/` and reads `useLesson()` (`src/learn/context.ts`): `ConnectWizard.tsx` renders the shipped wizard whenever every rule is on — which is always true in the product, where `useLesson()` is null — and `lesson.tsx` holds the layouts for the steps before that. One component, one model, a layout per step. Never a separate "bad" and "good" implementation.
