# Case: The deal record

## The task

The account executive at Meridian Software — Elena Vasquez, one of a team whose sales manager sits beside her — is on this page all day. She opens a deal to answer four questions and then to act on them: where is this deal, how much is it, when does it close, and what happens next. Between those she logs the call she just finished, validates what the research agent extracted from it, reads what a teammate asked her on the timeline, and decides whether the agent's proposal to move the stage is right. She does this many times a day, every day, and it is the densest page in the product on purpose. The one thing she must never lose sight of is **the next step and its date**: a deal with no next step is a deal nobody is working, so the header shows it, and shows it as empty when it is empty.

The record in this lesson is `d-1`, *Chalkhill Labs · Pilot* — €180,000, closing 15 September, four items on the timeline, three files, three contacts with roles, a meeting, eight qualification elements of which one is validated, and a research agent waiting for a decision.

## The common version

What most teams ship is a profile page in two halves: a left column of stacked widgets — general deal information, Record details with *See all fields*, Account, Contacts, Tasks, Notes — and a right strip of tabs: *Activities, Files, Notes, All Fields, Enrichment*. A gear lets each person hide the widgets they do not want. A field is edited by hovering it until the word *Edit* appears. *Delete deal* is inside a "…" menu. The custom fields the team asked for land on the *All Fields* tab, inside a field group, five interactions from the sign-in. Probability and forecast category are not on the page at all: they are set per stage in Settings, three levels away.

It is not a bad team. It is what happens when every request is added where it fits — a widget for one, a tab for the next — and nothing is ever moved. The result is that the timeline you read to decide the next step sits on a tab beside the field you edit to record it, and Notes exists twice.

Modelled on Apollo's deal profile page, with the contact and account profile pages where the deal article is thin (specs/09-deal-record.md §5, from Apollo's knowledge base as fetched on 13 September 2026). Nothing in step 0 is invented.

## The steps

| Step | Rule | What moves | Why, in one sentence | Evidence (must exist in the knowledge base) |
|---|---|---|---|---|
| 0 | — | The common version | Every request landed where it fit and nothing was ever moved | 16-apollo-workflow-inventory §14 and §10; 07-apollo-settings-map (Deal fields & stages; Hassnaa, Trustpilot) |
| 1 | 1 · Hide the rare, never the necessary | Stage, amount, close date, next step, last activity, pipeline and currency leave the General deal information widget for a header grid; the Activities tab dissolves and the timeline becomes the page; Contacts and Tasks leave the widget panel for cards beside it; the *Champion confirmed* checkbox inside the All Fields tab becomes the Qualification card | Everything this seat touches most weeks is visible without a click | 09-expert-voices (Nielsen 2006); 08-principles-and-checklists; 16-apollo-workflow-inventory §14 |
| 2 | 2 · Stop at two levels | The tab strip is deleted: Files, Enrichment and All Fields become doors, the Notes tab becomes the Notes chip on the timeline filter, and the field groups inside All Fields stop being a third level | Every item is on the page or behind exactly one door | 05-critiques (Nielsen 2006); 06-academic-literature (Landauer & Nachbar 1985); 00-core-model |
| 3 | 3 · Split by task frequency, not user skill | The gear goes, and with it the per-user layout; nothing else on screen changes | A per-user layout hands the design problem back to the user | 04-b2b-saas-practice (Home Assistant 2026); 09-expert-voices (Findlater & McGrenere); 08-principles-and-checklists (no post-2018 settings benchmark) |
| 4 | 4 · Make the door obvious and honest | Seven door labels gain their content and their count; hover-to-edit is replaced by a real control reached with Tab and opened with Enter | A label says what is behind it, and an affordance that appears only under a pointer does not exist for a keyboard | 08-principles-and-checklists (NN/g 2014); 04-b2b-saas-practice (Microsoft Windows UX Guide); 05-critiques (hover has no scent) |
| 5 | 5 · Keep context across the boundary | Probability and forecast category leave the All fields door for the stage stepper; the next step's date joins the next step on one line; Signals and news becomes a drawer; doors remember whether they were left open | Values set together and read together must not be split by a boundary | 03-pattern-catalog (Microsoft Fluent 2); 02-cognitive-science (Cowan 2001); 04-b2b-saas-practice (Microsoft Windows UX Guide) |
| 6 | 6 · Prefer stable, user-controlled disclosure | The research agent's proposal leaves the notification bell for a card that is there because the object has a proposal waiting | A decision waiting for a person is not something to be found by opening a bell, and spatial adaptation loses at any accuracy | 05-critiques (Jensen Harris); 11-what-changed-2018-2026 (Todi et al., CHI 2021) |
| 7 | 7 · Decision-critical information is never behind a door | *Delete deal* leaves the "…" menu for the actions row with what it removes beside it; Mark won and Mark lost write their consequence before confirming; Enrich carries its price; the stage gate moves onto the step | Price, consequence and what a destructive action destroys are what a person decides on | 01-foundations (Nielsen); 05-critiques (Nouwens et al. 2020); 07-apollo-settings-map (credit surprise, Reddit via Cleverly) |
| 8 | 8 · Fade the scaffold; give experts accelerators | Nothing moves for a first-time reader; S, C, E, M, N, T, W, Shift+W, G then H, `[` and `]` and Esc arrive, every one listed in ⌘K, and doors stay open across deals | The resident needs a way past the scaffolding, and a palette hint is the floor of teaching, not the ceiling | 10-glossary (NN/g heuristic 7); 06-academic-literature (Cockburn et al. 2014); 09-expert-voices (McGrenere & Moore 2000); 09-sweep-layers-and-promotion (ExposeHK, IHM 2025) |

## The numbers

Share of active users in this seat touching the item in a typical week. The table is `src/ollopa/usage/deal.ts`; the page asks it and never renders it. OPD has no product analytics: these are opinionated splits fitted to the published shape (Nielsen's 80/20, Pendo's feature-adoption benchmarks, McGrenere & Moore's 27%-of-functions finding), and they are illustrative, as RULES.md says under "Where the numbers come from". Decision-critical items marked ★ are level one whatever the number.

| Item | Weekly use (Meridian AE) | Source or reasoning |
|---|---|---|
| Stage | 95 | Moving the stage is the job; the stepper is the page's spine |
| Activity timeline | 95 | The AE reads it on every visit; it is why the page is opened |
| Next step and its date | 85 | The one thing nobody may lose sight of; empty is a state, not a blank |
| Close date | 75 | Forecast hygiene, checked weekly |
| Amount | 70 | Read on every forecast pass |
| Contacts on the deal, with roles | 70 | Five names where one has answered is not five relationships |
| Log a call | 70 | The AE's most common write on this page |
| Prepare from the brief | 65 | Named in four of five live AE job postings |
| Qualification card | 65 | The AE's weekly work; a card for this seat, a door for CS and the admin |
| Add a note | 60 | Fitted to the shape: notes are the cheapest write |
| Send the follow-up and create the tasks | 60 | One "Create 4 tasks" button at the task boundary |
| Meeting card · Correct the summary | 55 | The agent drafts, a person edits before anything leaves |
| Validate an extracted value | 55 | A human validates; nothing generated overwrites a validated value |
| Company summary | 50 | Read for context, not edited |
| Mark won · Open tasks · Create a task | 45 | About half of Meridian's AEs close something in a given week |
| Last activity | 40 | The staleness check |
| Email a contact from the deal | 40 | Most email arrives from the mailbox; this is writing one from here |
| Mark lost and archive | 35 | Archiving with a reason is how a deal is lost |
| The stage gate ★ | 30 | Critical: a requirement met only after the click is a requirement behind a door |
| Comment to a teammate | 30 (65 for an AE with reports) | A colleague's question is not an interruption |
| Filter the timeline by kind | 30 | Fitted; filter state persists per user |
| Forecast category | 25 | Set by the stage, overridden on commit; stays with stage whatever the number (rule 5) |
| Show the full email | 25 | A door per timeline item, expanded in place |
| Pending agent proposal ★ | 20 | Critical: level one for every seat while one exists, removed when none does |
| CRM sync status · Load older | 20 | Read when something looks wrong |
| Keyboard shortcuts and palette | 18 | The accelerator layer, unseen by the novice |
| Evidence and source quotes · Add a contact | 18 | Opened when a value looks wrong |
| Probability | 15 | Below the door threshold, kept with stage because it is set by it (rule 5) |
| Company signals · Set a contact's role · Log a meeting · Owner | 15 | Meetings arrive from the calendar; manual logging is the exception |
| Custom fields · Files · History · Other deals | 12 | A door at Meridian; in the header at Halyard and Ridgeline, where they are the job |
| Ask the research agent | 10 | Carries its credit cost on the control |
| Created date and age · Account health | 8–10 | Account health is removed on a new-business deal: no account behind it |
| All fields (the tail: source, campaign, competitor, terms, tags…) | 1–8 | The tail every record accumulates; one door, groups as headings |
| Delete deal ★ | 1 | Destructive, so visible with its consequence whatever the number |

## Review

*Filled in by the builder. The reviewer's pass is still due: this case has not been walked by anyone who did not build it, so the score below is a self-score and does not count for the 16 of 18.*

| # | Question | Score | Note |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | Delete with "removes this deal and its 4 activities"; the stage gate on the step before the click; the agent proposal's full consequence; Enrich and Ask the research agent priced; Mark won and Mark lost written out before confirming |
| 2 | Every visible item backed by a sourced number | 2 | Every placement comes from `usage/deal.ts` through `useDisclosure`; nothing is hard-coded. The numbers are illustrative and say so |
| 3 | No third level on any screen size | 2 | Page, then one door. The full-email door on a timeline item is a sibling of the side doors, not a child; the field groups inside All fields are headings; phone width stacks and adds no level |
| 4 | Doors labelled by content, chevron and text | 2 | Custom fields (5), History (2), Files and the proposal (3), Evidence and source quotes (4), Signals and news, Sync history · last 10, All fields — each a button in a heading with a chevron |
| 5 | Doors adjacent, keyboard and touch | 2 | Every door is `aria-expanded` on a real button; fields open with Enter; nothing is hover-only after step 4 |
| 6 | No dependent information split by a door | 2 | Probability and forecast sit under the stage; the next step's date is on the next step; account health's band, number and drivers are one card; the qualification value, its state and its quote are one row |
| 7 | State persists; expand-all and print | 2 | Door state is stored per user per door and holds across deals; Expand all / Collapse all is in the door column; `hidden="until-found"` keeps closed content findable and printable |
| 8 | User action or object state, never inferred history | 2 | The proposal card appears because a proposal exists; the signals card and the account-health card are business and object state; nothing reorders itself |
| 9 | Instrumented; promote, keep or delete review scheduled | 1 | The usage table is the instrument and the spec commits to a twice-yearly promote/keep/delete pass, but OPD has no product analytics behind it, so door-open logging is asserted rather than shipped |

Total: 17 / 18. Reviewer: *(not yet assigned)*. Date: *(due)*.

Walkthrough done: keyboard only, both versions [x]. Screen reader, disclosed version [ ]. Phone width [x]. Screenshots of step 0 and the last step in `screens/` [x].

## Deviations from the spec, stated plainly

- **The record is at Discovery, not Proposal.** The brief asked for a Meridian deal in Proposal carrying activity, files and an agent proposal card. Running the seed, no Proposal-stage deal owned by the Meridian AE seat has a pending agent proposal: Elena's two Proposal deals (`d-79`, `d-170`) have none, and her only deals with one are `d-1` at Discovery and `d-14` at Negotiation. `d-1` was chosen because the proposal card carries steps 6 and 7, and because the proposal on it is *"move to Proposal"* — which also makes the Proposal stage gate fire on the step, the ★ item step 7 is about. The cost is that the header reads Discovery.
- **Contacts move at step 1, not step 5.** The spec says both (§7 step 1, "put Contacts and Tasks beside it", and §7 step 5, "put the contacts beside the timeline, not on another tab"). They move once, at step 1, where the rule that moves them is named.
- **The actions row carries no `data-item`.** `RecordPage` renders the action buttons from plain `{label, onClick}` props and the template is read-only for this builder, so *Delete deal* leaving the "…" menu at step 7 reports as "gone from the '…' menu" rather than sliding into the row. The step's *what moved* says where it went.
- **Ghosts cannot be drawn where the old place is itself removed.** The delta puts a ghost in the flow inside the container a thing left; when that container is gone at the next step — the widget panel at step 1, the bell at step 6, the "…" menu at step 7 — there is nowhere to put it, so those steps show the move in the list rather than as a ghost. Steps 1, 3, 4 and 5 do draw ghosts.
- **Expand all arrives with the doors, not with rule 8.** `RecordPage` renders `ExpandAll` whenever a record has doors, so it appears at step 2. Step 8 adds the shortcuts, the palette entries and the chords.
- **`All Fields` and `Enrichment` are borrowed from the contact and account pages.** Apollo's deal article names three tabs; §5 explicitly permits using the contact and account profile pages "where the deal article is thin", and the custom-field article puts deal custom fields on All Fields.
- **Two Apollo sentences the spec quotes are not in the knowledge base** — the gear "to customize widget visibility" and "hovering over an editable field like phone number and clicking Edit". Both behaviours are built into step 0 and described in the step's prose, but neither is used as an evidence quote, because the sentence is not in `knowledge-base/`.

## Files in this folder

- `case.ts`: the case's id, title, summary, the page node the stage renders (`R-deal`), the record (`d-1`), the seat it signs in as (Meridian, AE) and the spec it is built from.
- `steps.ts`: the nine steps: rule, title, what moved, why, evidence quotes with their sources, and which doors to open on arrival so the change is visible.
- `scores.ts`: the nine rubric scores per step, 1 at step 0 rising to 17 at step 8.
- `screens/`: `step-0.png` and `step-last.png` at 1440 × 900.

The page itself lives in `src/ollopa/pages/deal/` and reads `useLesson()` (`src/learn/context.ts`): one component, one model, a layout per step. Never a separate "bad" and "good" implementation. Step N is the page with N rules on; step 0 is the common version.
