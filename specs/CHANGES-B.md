# Changes, group B

*Reconciliation pass over 06 Inbox, 07 Tasks, 08 Deals board, 09 Deal record, 10 Campaigns, 11 Accounts and their usage files. One line per change, with what drove it. Unverified claims removed are listed at the end.*

Sources cited below: **PLAN** = a decision in PLAN.md section 2; **RULES** = a named pattern in RULES.md; **REVIEW** = a numbered item in specs/REVIEW.md; **sweep** = a finding in knowledge-base/11-what-changed-2018-2026.md.

---

## 06 Inbox

| Change | Driven by |
|---|---|
| Section 1 rewritten: the SDR and AE seats carry the area; the admin seat gets the Inbox from the declared workspace profile, not from the role. Fathom (Founder-led outbound) has it; Meridian and Ridgeline (Separated sales team) and Halyard (Agency) do not, and the page still opens by link or ⌘K with "Add to sidebar" in its header | PLAN, Navigation; PLAN, Three kinds of "cannot see it"; RULES, the declared sidebar |
| Added the two-week exposure: the first reply for someone whose profile left the Inbox out puts the page in their sidebar for two weeks, then asks "keep it?"; one exposure per period | PLAN, Teaching by exposure; sweep 09 (hints do not teach, temporary exposure does) |
| Calendar corrected: Meridian, Ridgeline and Fathom have one, Halyard has none. The "Connect a calendar to book from here" state is Halyard's, and Book meeting is removed there rather than shown dead | REVIEW §1 #5; rule 4 |
| No-access state now names the marketer and customer success only; a new state describes a page a profile left out, which is not a permission gap | PLAN, Three kinds of "cannot see it"; REVIEW §1 #11, #12 |
| Role-and-business table rewritten for all four businesses (Halyard loses Book meeting; every admin row says why the page is or is not in the sidebar) | REVIEW §1 #5, #11 |
| Stated that there is no reply drawer in the product: the composer is in this page's thread panel, and Reply on a Home row opens this page with the thread selected | REVIEW §1 #9 |
| Table behaviours shared with every table page now cite 02 People and only deltas are recorded here | REVIEW §2, table template |
| Usage table: Book meeting is 0 at Halyard; the five shape pairs recomputed from `inbox.ts`, so Halyard's SDR is 14 / 16 / 28 (24% / 28% / 48%) and no pair is outside the band | REVIEW §1 #5; USAGE-MODEL.md |
| Accelerators paragraph: the shortcut printed beside a menu item is a floor, not a teacher; the sidebar exposure is the teaching device | sweep 09 |
| `usage/inbox.ts`: `inbox.act.book-meeting` gains a Halyard override of 0 with the reason; header comment says the profile, not the seat, puts the Inbox in the founder's sidebar | REVIEW §1 #5, #11 |

## 07 Tasks

| Change | Driven by |
|---|---|
| The marketer's empty state with a New task button is gone; the marketer has no access to the area and gets the shell's no-access page naming the four seats that work tasks and the admin who can change access | PLAN, Three kinds of "cannot see it"; REVIEW §1 #12, §5 #5 |
| Section 1 gains a paragraph separating the area (carried by the seat) from the sidebar (declared by the workspace profile), with "Add to sidebar" and the two-week exposure for a page a profile leaves out | PLAN, Navigation and Teaching by exposure; RULES, the declared sidebar |
| Row menu renamed: the "…" button's accessible name lists its contents instead of reading "More actions" | PLAN, Door labels |
| Self-score corrected: point 2 drops from 2 to 1, total 16 of 18, and the shape paragraph now says plainly that four of five pairs are over the head band on an argument rather than a measurement | REVIEW §4 (07 scored 2 where 02 and 03 scored down for less); sweep 15 (no density-versus-disclosure test exists) |
| Usage table: the task rows lose the decision-critical mark (they are the page's own content, head by usage); the due-today and overdue counts keep it with the safety-state argument written out; Delete a manual task gains it | REVIEW §3 (critical marks that rule 7 does not cover; destructive actions unmarked) |
| Apollo plan gating on call tasks no longer implies Ollopa gates nothing: the removed-list now says what Ollopa's plan table actually gates and that it never gates the day's work | PLAN, Plan gating |
| Rule 8 line: the printed shortcut is a floor; the queue is the exposure that teaches | sweep 09 |
| Table behaviours cite 02 People; only deltas are recorded here | REVIEW §2 |
| `usage/tasks.ts`: marketer numbers removed from all three items that carried them; `tasks.rows` unmarked; `tasks.summary` note rewritten; `tasks.delete` marked critical; header comment records the seat-versus-profile split | PLAN, Seats per business and Three kinds of "cannot see it"; REVIEW §3 |

## 08 Deals board

| Change | Driven by |
|---|---|
| Five stages, not six. The Closed lost rail is gone, the board shows one Closed won rail, and a lost deal is archived with a reason: it leaves the board and the forecast and stays on the company and in Reports | PLAN, Deal stages (13 Sep 2026); overrides REVIEW §1 #1, which recommended six |
| Seed additions changed from a `Closed lost` stage to `archivedAt` plus `lostReason`; the filter "Lost reason" became "Archived deals and the reason each was lost" | PLAN, Deal stages |
| "Close lost" became "Mark lost and archive", with the consequence stated on the sheet before it happens | PLAN, Deal stages; rule 7 |
| Agent proposals now follow one policy: the deal's owner approves, the admin may approve for anyone, research and saved drafts are logged rather than queued, only irreversible or costly actions wait, and the card waits for the next visit instead of interrupting | PLAN, Agent approvals; REVIEW §1 #7; sweep 09 (task-boundary acceptance) |
| Added the reviewer-capacity caution: 88.5% seen and 23.9% stopped, so the board keeps the queue short and writes the consequence on the item | sweep 14; rule 7's corollary |
| Fathom's row no longer calls the founder "the AE": Fathom has no AE seat, the admin seat works the pipeline, and the profile puts Deals in the sidebar | REVIEW §1 #11 |
| Halyard's row says the workspace name is rendered by the shell's top bar, not by this page | REVIEW §1 #16 |
| Section 4 records that `weeklyUse` returns zero for a seat a business has not declared, so no AE or CS first screen exists at Fathom or Halyard; table behaviours cite 02 People | PLAN, Seats per business; REVIEW §2, §3 |
| `usage/deals.ts`: `deals.board.closed-columns` → `deals.board.closed-won-rail`; `deals.action.close-lost` → `deals.action.mark-lost` with a new label and note; `deals.filter.lost-reason` → `deals.filter.archived`; the agent-proposal note names who approves; header comment records the five stages | PLAN, Deal stages and Agent approvals |

## 09 Deal record

| Change | Driven by |
|---|---|
| The stage list is defined here, once, as five stages, and the instruction to add "Closed lost" to `DEAL_STAGES` is deleted; the seed file is unchanged. A lost deal is archived with a required reason (`lostReason`, `archivedAt`) | PLAN, Deal stages; REVIEW §1 #1 resolved in PLAN's direction |
| "Mark lost" became "Mark lost and archive" everywhere: header action, actions table, ribbon, shortcut, usage label, level table | PLAN, Deal stages |
| Section 6.8 is now the home of the quick-look-and-record pattern and states it as RULES.md does: a flat drawer with no doors and one editable field for scanning; a record page of sections with doors only for long rare content and at most one tab for a related table big enough to be its own page; the same fields, labels and order in both; the test that removing the drawer loses only speed | PLAN, Records: drawer and page; RULES, the quick look and the record; REVIEW §1 #14, §2 |
| `RecordPage` gains `quickLook` and an optional single `tab`, plus two enforced rules: a quick look that needs a door is a record page, and related lists are sections, never tabs | PLAN, Records: drawer and page |
| The template table now covers Deal, Contact, Company, Account and the two Settings records, with a quick-look column; the company page gets the one permitted tab ("People (48)") | REVIEW §2, record template owner |
| Section 6.6 gains the approval policy: the object's owner approves, the admin may approve for anyone, low-cost reversible work is logged not queued, a second admin approval above a Settings threshold, and approvals at task boundaries | PLAN, Agent approvals; sweeps 09 and 14 |
| Spool's "fewer than 5% ever changed a setting" is no longer used as evidence in section 5.2 or lesson step 3; it is labelled a 2011 anecdote about consumer Word with no post-2018 replacement, and the argument now rests on rule 6 | sweep 15; RULES rule 6 |
| Lesson step 6 re-based: the reason not to reorder is no longer Gajos's un-replicated 70% threshold but Todi et al. (CHI 2021) and Gaspar-Figueiredo et al. (JSS 2025) — spatial adaptation loses at any accuracy | sweep 08 |
| Lesson step 8: the palette's inline hint is the floor, with the tooltip and exposure numbers | sweep 09 |
| `usage/deal.ts`: `close.lost` relabelled with the archive consequence; `agent.proposal` note names who approves and why the card waits for a task boundary; header comment records the five stages | PLAN, Deal stages and Agent approvals |

## 10 Campaigns

| Change | Driven by |
|---|---|
| The `Campaign` entity is defined here and nowhere else, with the full field list written out; there is no `channel` field, and Reports adds only `dealsCreated` and `pipelineAmount` | REVIEW §1 #3, §2 |
| The hard-coded "over 5,000 recipients" second approval is replaced by the workspace's threshold, a Settings item with a default of 1,000 recipients or 500 credits in one action; the marketer approves ordinary sends, and the dialog says what the approver will see | PLAN, Agent approvals; REVIEW §1 #7, §5 #6 |
| One bounce guard pair everywhere: warn 4%, pause 6%, owned by Settings and adjustable by the admin, with the observed rate printed beside them. The policy line and the delivery column were rewritten, and the 6.2% seed campaign is explained as passing the pause threshold | PLAN, Bounce guard; REVIEW §1 #6, §5 #7 |
| Door labels renamed: the row menu is named for its contents instead of "More actions (⋯)", and "Show 6 more columns" became "Columns: owner, trigger, last send, from, tags, created (6)" | PLAN, Door labels; REVIEW §1 #13, §4 (point 4 was scored 2 with an unlabelled row menu) |
| Audiences show a read-only "Fed by {list}" line linking to Lists, which owns the feed and its off switch | REVIEW §1 #8 |
| Usage marks: Status and Audience lose the decision-critical mark (head items anyway; the rule 7 obligation sits on the send dialog), Delete draft gains it, and the Fathom and Halyard level-one count drops from 8 to 7, all seven named | REVIEW §3 |
| Section 4 records that `weeklyUse` returns zero for the marketer seat Fathom and Halyard never declared | PLAN, Seats per business; REVIEW §3 |
| Apollo's plan gates on click metrics and A/B tests are still removed, but the text now says what Ollopa's own plan table gates instead of implying nothing is gated | PLAN, Plan gating; REVIEW §1 #10 resolved in PLAN's direction |
| Table behaviours cite 02 People; three new review rows record the approval, bounce guard and entity fixes | REVIEW §2 |
| `usage/campaigns.ts`: approval item relabelled and its note now points at the Settings threshold; bounce guard item relabelled with both numbers and the observed rate; delivery note carries the pair; `camp.list.status` and `camp.list.audience` unmarked; `camp.act.delete-draft` marked | PLAN, Agent approvals and Bounce guard; REVIEW §3 |

## 11 Accounts

| Change | Driven by |
|---|---|
| The account is now a full record page at `/ollopa/accounts/:id`, built from 09's `RecordPage`: field grid, eleven scrolling sections, side cards, and four doors (History, Files, All fields, Enrichment). No tabs | PLAN, Records: drawer and page; REVIEW §1 #14, §5 #9 |
| The drawer is now only the flat quick look: the same fields in the same order as the top of the record page, nothing collapsing inside it, read-only except the next step. This closes the rule-2 violation properly — fifteen collapsible sections in a drawer were a door inside a door, and renaming them headings did not change that | RULES, the quick look and the record; REVIEW §4 (11's rule 2 problem) |
| The three doors called "More columns", "More filters" and "More actions" now name their contents, with counts; the row menu's button carries the same list as its accessible name | PLAN, Door labels; REVIEW §1 #13, §4 (point 4 was scored 2 with three "More" doors) |
| Account stages are the five values owned by Settings › Pipeline and data; this page lists Current client, and Churned when the filter includes it | REVIEW §1 #2 |
| The agent's proposed next step follows the one approval policy: the account's owner approves, the admin may approve for anyone, scoring is logged rather than queued | PLAN, Agent approvals; REVIEW §1 #7 |
| Usage marks: hand-offs waiting loses the decision-critical mark (a queue, not a price or a safety state, and a head item anyway); Mark churned and Remove account gain it; level one for Meridian CS is 19, Ridgeline CS 25, Ridgeline AE 24 | REVIEW §3 |
| Section 4 records that `weeklyUse` returns zero for the CS and AE seats Fathom and Halyard never declared | PLAN, Seats per business |
| Keyboard, accessibility, phone width, persistence and accelerators rewritten for the quick look and the record page; the record page's deep link is named as something a drawer cannot carry | RULES, the quick look and the record; sweep 11 (deep links as a main route) |
| Score lines 3 and 4 rewritten to say what changed structurally rather than asserting compliance; rule 2 added to section 7 | REVIEW §4 |
| Table behaviours cite 02 People; only deltas are recorded here | REVIEW §2 |
| `usage/accounts.ts`: `ho.waiting` unmarked with the reason; `work.churned` and `work.remove` marked critical; header comment records the quick look and the record page | REVIEW §3; PLAN, Records: drawer and page |

## Checked and already correct

- The duplicate usage item ids REVIEW §3 named (`tasks.done` in `tasks.ts` and `deal.ts`, `camp.sort` in `campaigns.ts` and `reports.ts`) no longer exist: `deal.ts` uses `deal.tasks.done` and `reports.ts` has no `camp.sort`. No ids across the sixteen usage files collide.
- The five shape pairs in 06, the four in 07, the seven in 08, the five in 09.1, the four in 10 and the six in 11 were recomputed from the usage files with `shape()`. Every published number now matches the code; the only one that moved is Halyard's SDR on the Inbox, listed above.
- `npx tsc -b` is clean after the usage edits.

## Unverified or untraceable claims removed

1. **06 §5** — a Capterra complaint that "the inbox doesn't always sync well". It existed only in a search summary with no reachable review, so it is gone; the sentence now says why it is not used.
2. **06 §6** — "Column chooser, density toggle, saved views: under 3% in every segment". Those three items carry no number in `inbox.ts` and the page has five fixed columns; the invented percentage is replaced by the real reason.
3. **06 §5** — the Apollo reply-classifier figures (90% accuracy, out-of-office precision above 99%, willing-to-meet recall above 90%) now carry the tech-blog URL and are labelled as Apollo's own numbers, not independently checked.
4. **07 §5** — "the six first-party screenshots inside them, fetched 13 Sep 2026 through the KB's Zendesk API". Nothing traceable stands behind that. The section now states that three article titles and their dates are its whole source and that every layout detail that is not a direct quotation is a description of screenshots that cannot be checked against a URL. The two details the spec already flagged (what the moon icon and the red "!" mean) stay flagged.
5. **08 §5** — the Salesforge "praise to keep" is now labelled secondary and not confirmed by Apollo's own knowledge base.
6. **09 §5.2 and lesson step 3; 11 §5** — Spool's "fewer than 5% of users ever changed a setting" is no longer used as evidence. It is a 2011 anecdote about consumer Word and sweep 15 found no post-2018 replacement.
7. **09 lesson step 6** — "adaptation needs about 70% accuracy to pay" (Gajos et al. 2008) is no longer the argument; it was never replicated. Replaced by Todi et al. (CHI 2021) and Gaspar-Figueiredo et al. (JSS 2025).
8. **10 §3** — the second approval "over 5,000 recipients at Meridian" was a number with no owner and no source. Removed in favour of the Settings threshold.
9. **11 §5** — Gainsight's Customer 360 Summary defaults are now marked **unverified**: only a search excerpt was reachable and the page itself could not be fetched.
10. **11 §5** — the per-user-layout complaint no longer leans on the Spool figure; the objection is stated as rule 6 itself.

*Nothing in these six specs now asserts a number or an Apollo fact without either a link, a named article and date, or an explicit "unverified".*
