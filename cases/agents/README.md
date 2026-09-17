# Case: Agents

*Built from [specs/13-agents.md](../../specs/13-agents.md) §5 and §7. Open it: [`#/learn/agents?step=0`](../../#/learn/agents?step=0). The page is `src/ollopa/pages/agents/`; the seat is Meridian Software, SDR.*

## The task

An SDR at Meridian Software opens this page first thing, most mornings, and again after the afternoon call block — the briefing is used by 65% of SDRs in a typical week. Three agents ran while she was away: one researched companies, one drafted and proposed outreach, one scored records. She is here to answer one question and then a handful of decisions: what did they do, what is waiting for me, and what has it cost. The thing she must never lose sight of is the spend against the cap and the consequence of each approval, because an email an agent sends cannot be unsent and a credit it spends is not refunded. The queue is deliberately short: only what is irreversible or costly waits for her, because a queue of forty is a queue nobody reads.

## The common version

Apollo has no page called Agents, so what most teams get is the spread. The assistant is a chat you reach from a top-bar button, with previous conversations behind an unlabelled "⌄" beside the chat title; it asks you to confirm a credit-consuming action inside the conversation, at the moment it asks, and that confirmation scrolls away with the rest of the thread. The runs live on a workflow's Enrollment tab, as records completed or failed with reasons like "credit limit" and "inactive mailbox". The agents themselves are steps on a tab nobody opens. The credits are in a separate settings shell, four levels down at Settings › Credits and activity › Credit usage › AI runs, behind the permission "Can access the credit usage page…". A second "power-up" meter counts credits the balance pill does not.

It is not a bad team. Each AI feature shipped where it was built — the assistant in 2026, AI research on the table, workflows years earlier, credits in billing — and nothing was ever moved. The result is that the person making the decision and the number that should decide it are on different screens.

Nothing in step 0 is invented. Every part of it is in the Apollo knowledge-base articles catalogued in [`16-apollo-workflow-inventory.md`](../../knowledge-base/sources/16-apollo-workflow-inventory.md) §18 and [`07-apollo-settings-map.md`](../../knowledge-base/sources/07-apollo-settings-map.md), and the reviewer complaints are quoted verbatim from §"Credits / billing confusion" of the latter.

## The steps

| Step | Rule | What moves | Why, in one sentence | Evidence (must exist in the knowledge base) |
|---|---|---|---|---|
| 0 | — | The common version: a chat with "Previous chats ⌄", a workflow Enrollment tab with the runs, approvals inside the chat transcript, credits four levels down behind a permission, "power-up" credits on a separate meter, no step log. | What happens when each AI feature ships where it was built and nothing is ever moved. | "messages are free; credits only on credit-consuming actions" (`sources/16-apollo-workflow-inventory.md`); "Requires the permission \"Can access the credit usage page…\"." and "racked up a separate bill" and "watch the credit system closely or you'll get surprised at the end of the month" (`sources/07-apollo-settings-map.md`) |
| 1 | 7. Decision-critical is never behind a door | Confirmations leave the chat and become "Waiting for you" with the consequence, the mailbox, the time and the credits on each item. Credits this week against the cap and the workspace balance come up from Settings into the briefing; the second "power-up" meter goes. Failure reasons become exception lines with Resume. Agent tiles come off the workflow's Steps tab with a Pause on each. Research, scoring and saved drafts stop asking and are logged with an Undo. | The consequence and the spend must be where the decision is made — and a queue longer than a person can review is its own way of hiding. | "never hide decision-critical information (price, requirements, risks, privacy terms) behind the second level." (`sources/01-foundations-and-definitions.md`); "participants often noticed questionable actions, but treated them as routine, harmless, or not worth interrupting." (`sources/14-sweep-agent-disclosure.md`); "Disclosure that exceeds review capacity is equivalent to hiding." (`08-principles-and-checklists.md`); "Post-commit suggestions drew 52% engagement…" (`00-core-model.md`) |
| 2 | 1. Hide the rare, never the necessary | The chat transcript goes; its lines become ledger rows at level one. Steps, sources and per-step credits go behind one door per row. Date, outcome, kind and surface filters go behind one door named for them; agent, contact and search stay out; the teammate filter is removed for a seat that sees only its own items. | Level one is decided by measured weekly use for this seat at this business, not by what felt important. | "You must disclose everything that users frequently need up front." and "disclose by exception ... keep the full activity ledger 1 click away." and "Pendo's data: 6% of features generate 80% of clicks." (`09-expert-voices.md`) |
| 3 | 2. Stop at two levels | Settings › Credits and activity › Credit usage › AI runs becomes the Credits column and the per-day digest. Chat › ⌄ › previous chat › scroll becomes a row and its step log. The Enrollment tab folds into the ledger. On the phone the filters become one sheet. | A third level means the structure is wrong, not the widget. | "designs that go beyond 2 disclosure levels typically have low usability…" (`sources/05-critiques-pitfalls-and-measurement.md`); Landauer and Nachbar, "selection time per level grows only logarithmically…" (`sources/06-academic-literature.md`); "three or more suggests the feature needs redesign." (`08-principles-and-checklists.md`) |
| 4 | 4. Make the door obvious and honest | "⌄" and "Preview" become "Step log · 3 steps · 12 credits" and "Read the draft · 142 words · 3 inputs". Every row and item starts with the actor's name, and the Actor column joins the table. The scoring-rules link moves onto the Scoring agent's tile, replaced by the admin's name where the seat cannot change them. Approve and Decline are removed on decided items, never greyed. | The label is the only scent a door gives, and a control that cannot deliver is removed rather than disabled. | "Obscure icon = wasted feature." (`sources/05-critiques-pitfalls-and-measurement.md`); "Remove (don't disable) progressive disclosure controls that don't apply in the current context." and "Name the actor, every time." (`sources/04-b2b-saas-practice-and-case-studies.md`) |
| 5 | 5. Keep context across the boundary | The consequence sentence and the credits come out of the draft door and sit beside Approve. Credits per step sit beside each step. Resume moves onto the exception line. Expand all, Collapse all and print arrive; door state, filters and column choices persist per user and workspace. | Fields read together must not be split by a door: working memory holds about four chunks and the trip loses them. | "Cowan's 4±1 chunks: never separate mutually dependent information across a disclosure boundary" (`00-core-model.md`); "Never put information in one accordion item that needs to be referenced in another accordion item" (`sources/03-pattern-catalog.md`); "If a user expands or collapses an item, make the state persist…" (`sources/04-b2b-saas-practice-and-case-studies.md`) |
| 6 | 8. Fade the scaffold; give experts accelerators | `j` `k` `a` `d` `e` `x` `/` and Escape come on, printed in the "…" menus. "Review all 3" appears and opens the batch with the whole consequence in the button's label. Each agent tile becomes a one-click filter. Door opens and filter use are counted per role and reviewed each March and September. | The person who lives on this screen needs a way past the scaffolding that teaches itself. | "unseen by the novice user" (`10-glossary.md`); "persistently fail to adopt faster methods" (`00-core-model.md`); "preferred unused ones \"tucked away\" (45%) over removed (24.5%)" (`09-expert-voices.md`) |

**Notes on the last step.** *Rule 3:* there is no "Simple" or "Advanced" agent view and no Autopilot switch; what an agent may do without a person is set per action in Settings, and everyone sees the same items ordered by frequency for their seat. *Rule 6:* the queue is oldest first and the ledger newest first, always; "Since you last looked" is a sentence, not a reordering, and nothing is promoted by predicted importance or past behaviour.

## The numbers

Every percentage is the weekly reach for the signed-in seat, from [`src/ollopa/usage/agents.ts`](../../src/ollopa/usage/agents.ts), which the page reads through `useDisclosure("agents")`. The page never renders a percentage. Numbers below are for **Meridian Software, SDR** unless a row says otherwise; they are illustrative, fitted to the published shape Pendo and McGrenere describe, and each names its reasoning.

| Item | Weekly use | Source or reasoning |
|---|---|---|
| `brief.digest` — since you last looked | 65% | Nielsen's 30-second briefing test for a returning user (`09-expert-voices.md`). An SDR opens the page most working days. |
| `brief.credits-week` — credits this week against the cap | 25%, **critical** | Rule 7: spend is decision-critical whatever the number. Reviewers name unpredictable credit burn as the top complaint (`sources/07-apollo-settings-map.md`). |
| `brief.credits-today` | 12% | Fitted below the weekly figure; promoted for Fathom's founders (65%) who watch burn daily. |
| `brief.status` — what each agent may do | 18% | Just under the 20% level-one threshold for an SDR who already knows; 40% for a Meridian admin, 65% for Halyard's ops lead. |
| `brief.track-record` | 30% | The only honest answer to "can I trust it". Level one for every seat that sees a proposal. |
| `exc.paused`, `exc.cap-reached` | 15%, 3%, both **critical** | Safety state (rule 7). Rare at Meridian's cap, weekly at Fathom's; present only while something is paused. |
| `wait.list`, `wait.consequence` | 70%, **critical** | A pending approval is the rule 7 test: find it without clicking. An SDR is the seat the queue exists for. |
| `wait.approve` / `wait.decline` | 70% / 45% | Approving is the job; declining is about two thirds as common. |
| `wait.read-draft` | 55% | One door per item, labelled with what is behind it. |
| `wait.bulk` | 12% | Below threshold here, so the batch lives in a panel behind "Review all 3"; 45% for Halyard's specialists, who clear forty drafts at a time, where it is on the page. |
| `wait.skipped` | 25%, **critical** | A queue saying "3 waiting" while records were silently dropped is a count that lies. |
| `act.ledger` — every event, newest first | 35% (admin 50%) | Nielsen (2026): keep the full activity ledger one click away. Here it is on the page. |
| `act.credits-per-event` | 20%, **critical** | Spend is decision-critical, so the Credits column is never behind the door. |
| `act.steps` — step log per event | 15% (admin 18%) | Read on demand, not on every visit: the body of the band, so one door per row. |
| `act.day-digest` | 12% (admin 45%) | "Digest the milestones" — what Fathom and Halyard admins read first. |
| `act.filter-agent` / `act.filter-contact` / `act.search` | 12% / 15% / 10% | Out of the door because they are how an SDR narrows the list; the ones below stay in. |
| `act.filter-date` / `-status` / `-kind` / `act.surface` | 4% / 4% / 4% / 8% | Behind one door labelled "Date, outcome, kind, surface". Any of them at 20%+ for the signed-in seat comes back out. |
| `act.filter-person` — teammate | 0% here, 30% Halyard admin | Removed, not disabled, for a seat that only sees its own items, with a line naming who does see everyone. |
| `act.undo` | 10% | What makes "reversible, so we did not queue it" true rather than asserted. |
| `act.expand-all` / `act.print` / `act.columns` | 2% / 1% / 1% | The review candidates named in step 6: promote, keep or delete each March and September. |
| `set.pause-agent` | 2%, **critical** | A kill switch is safety state, so it is on the tile for anyone allowed to use it. |

## Review

*Filled in by the reviewer, not the builder. Score each 0, 1 or 2.*

The builder's own scores are in [`scores.ts`](scores.ts), one row per step; the last step is **17 of 18**. They are reproduced here as a starting point for the reviewer, **not as a pass**. A reviewer who did not build this has not yet walked it.

| # | Question | Score | Note |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | Credits this week against the cap, the workspace balance, every waiting item with its consequence and cost, and both exception lines are on the page with no click. |
| 2 | Every visible item backed by a sourced number | 2 | Every item on the page is declared in `src/ollopa/usage/agents.ts` with a weekly figure per seat and business and a note saying where it comes from. The figures are illustrative, fitted to the published shape, as RULES.md requires them to say. |
| 3 | No third level on any screen size | 2 | Page → item door, page → step-log door, page → filters door, page → batch panel. On the phone the filters become one sheet and the step log still opens in place. |
| 4 | Doors labelled by content, chevron and text | 2 | "Step log · 3 steps · 12 credits", "Read the draft · 69 words · 3 inputs", "Date, outcome, kind, surface". The `Door` primitive supplies the chevron, the text and `aria-expanded`. |
| 5 | Doors adjacent, keyboard and touch | 2 | Each door sits directly under the thing it belongs to; each is a button inside a heading, reachable by Tab and by `e` on the focused item. |
| 6 | No dependent information split by a door | 2 | The consequence sentence and the credits sit beside Approve; per-step credits sit beside each step; the row total sits on the row. |
| 7 | State persists; expand-all and print | 2 | Door state, filter values and hidden columns persist per user; Expand all / Collapse all is in the ledger header; printing expands every door and restores it. |
| 8 | User action or object state, never inferred history | 2 | Queue oldest first, ledger newest first, always. "Since you last looked" is a sentence; nothing moves because of it. Nothing is promoted from past behaviour. |
| 9 | Instrumented; promote, keep or delete review scheduled | 1 | The counting and the March/September review are specified in step 6, but OPD has no analytics behind it, so nothing has actually been counted. An honest 1 until it has. |

Total: 17 / 18. Reviewer: *still due*. Date: *—*.

Walkthrough done: keyboard only, both versions [x] (← → across all seven steps and back, plus `j`/`k`/`a`/`d`/`e`/`x`/`/` on the last step). Screen reader, disclosed version [ ] *not yet done*. Phone width [x] (390 px: rail becomes a strip, filters become one sheet, rows become two lines). Screenshots of step 0 and the last step in `screens/` [x].

## Deviations from the spec, stated plainly

- **The lesson keeps the product's chrome at step 0** (`chrome: "product"`). The parody draws Apollo's top bar, chat, workflow panel and credits crumb inside the page body rather than replacing the Ollopa shell, so that steps 0 to 6 share one frame and the delta measures only the page. The consequence is that Ollopa's own credits pill is visible in the shell at step 0, beside the parody's "power-up" meter. What step 1 moves is the *agents'* spend against their cap, which really is four levels down at step 0.
- **No modal is introduced for the draft.** The spec's step 5 says the draft "expands under its own item, not in a modal". Apollo's assistant shows the draft inline in the chat, so no modal was ever there to remove; nothing moves for that clause and the step's text does not claim it does.
- **The locked third-agent tile does not appear.** Meridian runs all three agents, so the gated tile the usage model describes (`brief.locked-agent`) is a Fathom and Halyard case, not this one.
- **Per-row controls are not separately tagged.** `data-item` goes on every waiting item, tile, ledger row, filter, search box, column header and page-level control. Undo, the "…" menu and the per-item menu entries are parts of a row rather than things that move, so tagging them would have filled the delta list with noise.

## Files in this folder

- `case.ts`: the case's id, title, summary, the page node the stage renders (`P-agents`), the seat it signs in as (Meridian, SDR), and the spec it is built from.
- `steps.ts`: the seven steps: rule, title, what moved, why, evidence quotes with their sources, and which doors to open on arrival so the change is visible.
- `scores.ts`: the nine rubric scores per step.
- `screens/`: `step-0.png` and `step-last.png`, 1440 × 900, taken with `scripts/shot.mjs` against `#/learn/agents`.

The page itself lives in `src/ollopa/pages/agents/` and reads `useLesson()` (`src/learn/context.ts`): one component, one model, a layout per step. `ruleFlags()` in `model.ts` turns the lesson into the six booleans the page branches on — 7, 1, 2, 4, 5 and 8, never 3 or 6, because those are notes on the last step and a branch on them would be false when the product is meant to be whole. `Parody.tsx` holds step 0's surfaces and nothing else. There is never a separate "bad" and "good" implementation.
