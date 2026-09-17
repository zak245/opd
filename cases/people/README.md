# Case: People — the contacts table

*Eight steps, rules 1 to 8 in order, built from [specs/02-people.md](../../specs/02-people.md) §5 and §7. Signed in as Meridian Software's SDR. Open it at [`#/learn/people?step=0`](#/learn/people?step=0).*

## The task

An SDR opens People many times a day. She is looking for who to work next and pushing them into a sequence or a list: she filters to her own unworked prospects, scans, ticks a few dozen rows and acts on them in one go. At Meridian that is 800 contacts, a saved view she built in her first week, and eight filters she touches most weeks out of the thirty-five the page holds. An AE opens the same page daily to see everyone at an account; a marketer a few times a week to build an audience; the RevOps admin weekly to fix owners. They all get the same component and a different first screen, because the split is asked of the usage model per seat and never hard-coded.

The one thing nobody on this page may lose sight of: **what a click will cost and how many people it will touch.** Revealing a mobile number spends 8 credits, enriching spends 2 a head, and a bulk action can act on hundreds of people at once. Every control that spends prints its price, and every bulk button repeats its count.

## The common version

Apollo's People page, as Apollo's own knowledge base describes it (fetched 13 September 2026; article titles and dates are in the spec's §5). A left sidebar of filters behind **Show Filters**, then a second button **More Filters**, and inside it every filter is a collapsible group with a value picker inside that — the sidebar, the group, the picker, three levels. Tabs above the results: Total, Net New, Saved. A Bulk Selection strip that is always there, holding four selection controls and eleven action buttons, none of which says how many people it will act on. Two add-to-list icons a letter apart, the second of which adds the whole company. "Add column" beside a gear that mixes choosing a column with creating a field and running an AI agent. The phone button says "Access mobile"; the price turns up at step 8 of a save dialog.

It is not a bad team. It is what happens when every request is added where it fits, the filter list grows from twenty to sixty-odd, and nothing is ever moved.

## The steps

| Step | Rule | What moves | Why, in one sentence | Evidence (must exist in the knowledge base) |
|---|---|---|---|---|
| 0 | — | The common version: the sidebar behind two buttons, the tabs, the always-on strip of eleven, two add-to-list icons, the price in a dialog | Nothing was designed; everything was added where it fitted | Sanket D., Hassnaa, ryan P., Randy — all in `sources/07-apollo-settings-map.md` |
| 1 | 1 | Eight filters leave the sidebar for the bar; the table drops from eleven columns to seven; eleven bulk actions become two plus one door; four actions this product never had simply go | The split comes from what this seat touches weekly, with a source | Nielsen 2006 (`09-expert-voices.md`); Pendo 6.4%/15.6% (`08-principles-and-checklists.md`) |
| 2 | 2 | The sidebar of groups becomes one flat panel; the Total / Net New / Saved tabs go; every value is one click from its chip | Sidebar → group → picker is three levels, and three is where people get lost | Nielsen (`sources/05-critiques…`); Landauer & Nachbar (`sources/06-academic-literature.md`) |
| 3 | 3 | "Most Popular Filters", "More Filters" and "advanced" are replaced by Person, Company, Reach, Ownership, History; Comfortable / Compact arrives | A heading names what is under it, never who it is for | Home Assistant (`sources/04-b2b-saas…`); core model; Cloudscape (`sources/13-sweep-density…`); Airtable (`11-what-changed…`) |
| 4 | 4 | One "Add to list"; every door takes its content and count into its label; "Add column" and the gear become one columns door | Cover the label, guess what is behind it, read it, be right | ryan P. (`sources/07-apollo-settings-map.md`); NN/g 0% click-through (`sources/05-critiques…`); Microsoft (`08-principles-and-checklists.md`) |
| 5 | 5 | The four scattered Bulk Selection controls become the count, "Select all 306 matching" and the per-company limit beside it; a working level-two filter surfaces as a chip; the default view moves onto the page; the panel gains a pin | Two controls that change each other's meaning cannot sit apart | Fluent 2 (`00-core-model.md`); Microsoft persist (`sources/04-b2b-saas…`); Cowan (`00-core-model.md`) |
| 6 | 6 | The always-on strip becomes a bar that appears because rows are ticked; nothing else reorders itself | Object state may move a control; last week's behaviour may not | Harris (`sources/05-critiques…`); 2004 vs 2025 (`11-what-changed…`) |
| 7 | 7 | "Access mobile" becomes "Reveal · 8 credits"; bulk buttons carry count and price; the eight-step dialog goes; the do-not-contact exclusion is stated with its count | A cost met after the click was never offered for refusal | Nielsen (`sources/01-foundations…`); Blake et al. (`sources/05-critiques…`); Randy, Rafay A. (`sources/07-apollo-settings-map.md`) |
| 8 | 8 | Shortcut keys print on every menu item and view; arrow keys walk the rows; the three keys that spend ask in place with the price; undo for ten seconds; Languages and Founded year logged for the delete review | Somebody who lives here all day needs a way past the scaffolding | NN/g heuristic 7 (`10-glossary.md`); Cockburn (`sources/06-academic-literature.md`); McGrenere & Moore, ExposeHK (`08-principles…`, `11-what-changed…`) |

## The numbers

Every number comes from `src/ollopa/usage/people.ts`, which is Meridian's SDR column of the model in [USAGE-MODEL.md](../../USAGE-MODEL.md): the share of active users in that seat who touch the item in a typical week. They are illustrative, fitted to the published shape (Nielsen's 80/20, Pendo's 6.4% median and 15.6% best-in-class, McGrenere and Moore's 27% mean with a 3–45% range), and the page reads them rather than hard-coding a level. Level one is 20% or more, or decision-critical whatever the number.

| Item | Weekly use (Meridian SDR) | Source or reasoning |
|---|---|---|
| Result count for the filters | 90 | Read before every bulk action; the number the selection bar repeats |
| Name, Company, Email columns | 95, 90, 75 | The three the scan is made of |
| Add to sequence (row) | 60 | The SDR's job, done one row at a time |
| Saved views | 55 | The view carries the filter combination, so the view is weekly and the filters inside it are not |
| Select rows, page, or all matching | 50 | Half of prospecting is a bulk action |
| Title, Not in a sequence filters | 45, 45 | The two chips that define "who have I not worked yet" |
| Stage, Sequence columns; Add selected to sequence | 45, 45, 45 | |
| Email filter (verified / any / none / bounced) | 40 | |
| Persona, Score, Owner filters | 30, 30, 30 | Persona and Score are declared once in Settings and read here |
| Add selected to list | 28 | |
| Company, Stage filters | 25, 25 | Company is the AE's first filter (45) and the SDR's fifth |
| Credit cost and balance before a spend | 25, and **critical** | Level one whatever the number (rule 7) |
| Reveal phone (8 credits) | 18 | Low reach, high repetition on a calling day: a density item, not a door item |
| Enrich (2 credits) | 15 | Level two for this seat; level one at Fathom, where the founder does outbound (30) |
| Has phone, In list, Signals filters | 12, 15, 15 | The body: real filters, not weekly ones for this seat |
| Choose and order columns | 6 | A door item |
| Languages, Founded year filters | 1, 1 | The tail. Logged at rule 8 for the next promote-keep-delete review |
| Mark do not contact; Remove from workspace | 4, 3, both **critical** | Never hidden: they sit in the row menu with the consequence written into the label |

Two numbers in the case text come from the rendered page rather than the model: the workspace holds **35** filters for this seat (the spec's §5 quotes Apollo's glossary at 63) and **26** columns.

## What a lesson stage sets, and why

The stage is the product component with rules switched on, but a few pieces of page state are set so the rules can be seen landing. All of them are states a person could reach by clicking; none of them is a second implementation.

- **Three rows are ticked.** The bar that acts on a selection is half of what this screen teaches and it is not on screen until something is selected.
- **No saved view, one body filter on** ("has a phone number on file"). The seat's default view narrows 800 rows to 9, which is too few to show a bulk action honestly; and the body filter is the hidden cause that rule 5 surfaces as a chip.
- **Sorted by score, descending**, which is what an SDR does first.
- **Phone is added to the columns**, after Email. The SDR's seat does not get it by default — she reveals a number about once a week — but the price on that button is what this screen is most about, and a rule the viewer cannot see land has not been taught.
- **Nothing is read from or written to `localStorage`.** A step must render from the seed and the usage model alone.

## Review

*Filled in by the reviewer, not the builder. The scores below are the builder's own, from `scores.ts`, for the last step. **The reviewer's pass is still due.***

| # | Question | Score | Note |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | "Reveal · 8 credits" on the cell, "Enrich 3 · 6 credits" and "Export 3 · no credits" on the bulk buttons, the balance in every message after a spend, the do-not-contact exclusion stated with its count, and the two destructive row actions always in the menu with their consequence in the label. |
| 2 | Every visible item backed by a sourced number | 2 | Every chip, column, row button and bulk button is at level one because `src/ollopa/usage/people.ts` puts it there for this seat at this business; the page hard-codes no level. |
| 3 | No third level on any screen size | 2 | Screen → one door, on every channel: a chip's picker, the filters panel, the views list, the columns door, a row's menu, the selection menu. The record is table → quick look and table → record page, and the drawer holds no doors. At phone width the panel is a sheet, not a second level. |
| 4 | Doors labelled by content, chevron and text | 2 | "All filters (35)", "All views (6)", "Columns and density · 8 of 26", "Edit or export selected", "Actions for Amara Okonkwo". Chevron plus text on every one. Doors that cannot apply are removed, not greyed. |
| 5 | Doors adjacent, keyboard and touch | 2 | Every door opens beside what it reveals; all are buttons with `aria-expanded`, reachable by Tab and operable by Enter and Space; nothing is hover-only. |
| 6 | No dependent information split by a door | 2 | The per-company limit is inside "select all matching" and restates the result; a level-two filter that is doing work shows as a chip in the bar; the score chip prints its threshold, its publish date and who published it. |
| 7 | State persists; expand-all and print | 2 | The panel's pin, the density, the rows per page, the sort and the chosen columns persist per user; the print stylesheet prints the filters that produced the rows and hides the controls. |
| 8 | User action or object state, never inferred history | 2 | The selection bar comes from selection; a new column goes to the end; chips stay where the seat's numbers put them; a view changes only when somebody saves it. |
| 9 | Instrumented; promote, keep or delete review scheduled | 1 | The numbers are published research fitted to this workspace and the delete candidates (Languages, Founded year) are named in step 8 — but there is no live door-usage instrumentation, because there is no live product behind the screen. |

Total: 17 / 18. Reviewer: *(still due)*. Date: .

Walkthrough done: keyboard only, both versions [x]. Screen reader, disclosed version [ ]. Phone width [ ]. Screenshots of step 0 and the last step in `screens/` [x].

## Deviations from the spec

- **The sidebar holds 35 filters, not 63.** §5 records Apollo's glossary at 20 "Most Popular" plus 43 more. This page has thirty-five real filters in `filters.ts`, and inventing thirty more names to reach the documented total would be inventing. The structure §5 documents — Show Filters, then More Filters, then a collapsible group per filter with a picker inside — is reproduced exactly, with the same 20/rest split.
- **Eight filters become chips, not six.** §7 says six; the usage model puts eight of this page's filters at 20% or more for Meridian's SDR. The page asks the model rather than the spec's prose.
- **One jump landed one step later than §7 places it.** §7 gives the count on a bulk button to rule 4 and the price to rule 7; both are honoured. But §7's "select all matching and limit per company sit together" is rule 5 here *and* the whole bar becomes selection-driven at rule 6, so the pair appears at 5 inside a strip that is still unconditional, and the strip goes at 6.
- **Bulk actions that move into the overflow menu are reported as "gone".** Radix renders a closed menu's items nowhere, so the delta cannot say "now behind Edit or export selected" for them. The step's text says where they went.
- **One wave-2 bug fixed:** the stage badge was copying the "· also leaves the sequence" note out of its menu item into the trigger. The trigger now prints the stage and only the stage; the note stays on the option, where the choice is made.

## Files in this folder

- `case.ts`: the case's id, title, summary, the page node the stage renders (`P-people`), the seat it signs in as (Meridian, SDR) and the spec it is built from.
- `steps.ts`: nine steps — the common version and rules 1 to 8 — each with what moved, why, the evidence quotes with their source files, and which doors to open on arrival.
- `scores.ts`: the nine rubric scores per step, 2 at step 0 rising to 17 at the last.
- `screens/step-0.png`, `screens/step-last.png`: 1440-wide screenshots taken with `scripts/shot.mjs`.

The page itself lives in `src/ollopa/pages/people/` and reads `useLesson()` (`src/learn/context.ts`): one component, one model, a layout per step. `parody.tsx` holds the pieces only the common version uses. Never a separate "bad" and "good" implementation — step N is the page with N rules on, and step 8 is the product.
