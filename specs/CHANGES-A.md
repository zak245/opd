# Change log, group A

*Specs 00 to 05 and their usage files, reconciled against PLAN.md section 2 (decisions of 13 and 14 September 2026), RULES.md and its three named patterns, specs/REVIEW.md sections 1 to 4 and 6, and knowledge-base/11-what-changed-2018-2026.md. One line per change. Unverified claims removed are listed at the end.*

## One rule adopted across the group

- **Shape-check denominator.** Every spec in this group now states the same rule: the denominator is every item in the page's own usage file that the seat has at that business — a weekly number above zero, or decision-critical — computed with `weeklyUse()` and `bandOf()` from `model.ts`. Seats a business has not declared return zero (`SEATS`), so no phantom seat is measured, and a seat that cannot open the page gets no row at all. Every shape table in specs 00 to 05 was recomputed from the files after the edits below, not adjusted by hand. Drove it: REVIEW §3, "Head share above 25%… Pick one rule", and the seats decision (PLAN, 14 Sep).
- **Destructive actions are decision-critical.** People, Companies and Sequences now mark remove, do-not-contact, archive, delete draft and delete step `critical: true`, matching `lists.row.delete`, and each spec says what that means in practice: the action sits in the always-visible actions menu with its consequence written into its label, never hover-only, never behind an unnamed control. Drove it: REVIEW §3, "Mark every destructive action critical, or none", and PLAN §5 ("the reviewer looks for… the destructive action without clicking").
- **Door labels.** Every door in the group is named by its contents. Renames are listed per spec below. Drove it: the door-label decision (PLAN, 14 Sep).

## 00 Sign-in, app shell, ⌘K palette and notifications

- §1, §3.2: the sidebar is now declared, not role-derived — seat (declared at invite) plus workspace profile (declared at set-up, editable in Settings › How your team works), with the four profiles named and what each leaves out. Decision: Navigation (14 Sep).
- §3.2: added the seat overlay — a seat may carry two roles' areas; Fathom's founder and Halyard's ops lead are admin plus SDR, so Inbox and Tasks are theirs. Closes REVIEW §1 #11, which said 06, 07 and 08 were unbuildable without it.
- §3.2: added the three kinds of "cannot see it" as a table (object you do not own; area your seat does not hold; page the profile left out) and made the no-access page the answer to the middle one only. Decision: Three kinds of "cannot see it" (14 Sep); closes REVIEW §1 #12.
- §3.2: added "Add to sidebar" in the page header for a page the profile left out, with added items going to the end of their group and staying, and "Remove from sidebar" as the equally short path back. Decision: Navigation and the three kinds (14 Sep).
- §3.2: added teaching by exposure — the page appears for two weeks after a strong signal, then asks "keep it?", one exposure per period, answer final until a new signal, never mid-task. Decision: Teaching by exposure (14 Sep); finding: sweep 09, hints do not teach, temporary exposure does.
- §1, §3.2: the client workspace name at Halyard moves into the top bar, drawn by the shell on every page. Closes REVIEW §1 #16.
- §2: added `profile` and `NAV.profiles` to the data list, plus localStorage for added pages and for the exposure state.
- §2, §3.4: the bounce-guard seed no longer invents a "5.1% warning"; the thresholds are the product's single pair (warn 4%, pause 6%, owned by Settings) and the seeded events carry observed rates of 4.3% and 6.2%. Decision: Bounce guard (14 Sep); closes REVIEW §1 #6.
- §3.4: agent approvals rewritten — the owner approves, the admin may approve for anyone, low-cost reversible work is logged rather than queued, rows arrive in batches at a task boundary, and a second admin approval applies above the Settings threshold. Decision: Agent approvals (14 Sep); findings: sweep 09 (task boundaries) and sweep 14 (queues rubber-stamp).
- §3.4: the panel footer now says the delivery preferences are fields on your own user row and that there is no separate Notifications settings page to link to. Closes the open conflict in REVIEW §2 between 00 and 14.
- §3.3: the palette's "role gaps" became "seat gaps and profile gaps": a page the profile left out is a normal result marked "not in your sidebar".
- §4: two usage items added to `shell.ts` (Add to sidebar; "keep this page?"), Inbox and Tasks given Fathom and Halyard admin overrides for the seat overlay; the shape check recomputed and the denominator rule stated, with the without-navigation figure kept in brackets and explained.
- §6: level tables now read by seat after the profile subtracts; "Removed rather than hidden" gains the 24-task onboarding checklist (spec 16 replaces it) and read-only-by-link views.
- §7: the rule 8 line no longer cites Superhuman; it cites Bailly et al. (IHM 2025) and ExposeHK. The review cadence no longer promises deletion below 3%, because that threshold has no evidence behind it (RULES rule 8).
- §2, §3: the Campaign fields the palette shows are read from spec 10's entity rather than defined here. Closes REVIEW §1 #3.
- Referenced the workspace set-up page as **spec 16** in §1 and §3.2 (editor C writes it).

## 01 Home

- §1, §3.1: the approval section rewritten — only irreversible or costly actions queue; research, scoring and saved drafts are logged and appear in "What agents did this week"; batches arrive at task boundaries and say which run they came from; the owner approves and the admin may approve for anyone; an over-threshold item waits on the admin and says so. Decision: Agent approvals (14 Sep); closes REVIEW §1 #7.
- §3.2, §6.7: the reply drawer is gone. Reply opens Inbox with that thread and its in-panel composer. Closes REVIEW §1 #9.
- §3.4: the no-access row no longer says "only the admin can approve this" for ordinary items; that sentence now applies to workspace-level actions and to anything over the threshold.
- §2.2: `AgentEvent` gains owner, decidedBy, needsSecondApproval and batchKey; `Campaign` is read from spec 10 rather than redefined; `WorkspaceHealth` is marked as owned here, with the other four surfaces rendering subsets. Closes REVIEW §1 #3 and §2.
- §3.1: Home no longer prints the Halyard client workspace name; the shell does. Closes REVIEW §1 #16.
- §3.8: added the Halyard calendar state — no calendar there, so the reply row offers "Connect a calendar to book from here". Closes REVIEW §1 #5 from Home's side.
- §6.3: the pipeline door now names the five stages the product has and says there is no Closed lost column, a lost deal being archived. Decision: Deal stages (13 Sep). Note this overrides REVIEW §1 #1's recommendation of six stages, as the brief instructs.
- §6.3: the row menu is named "Actions for {contact or deal}" rather than "Row menu (…)". Decision: Door labels (14 Sep).
- §4: approvals for the marketer and customer success fall from 15 and 5 to 5 and 3 (and at Ridgeline from 25 and 20 to 6 and 5), because their agents research and score, which is now logged rather than queued; a new decision-critical item, "Over the threshold: needs the admin's second approval", was added to `home.ts` and the table.
- §4: shape check recomputed against the group's one denominator; nine pairs, and the ones over the band are argued rather than adjusted.
- §5.2: the Spool "fewer than 5%" claim re-based as a 2011 anecdote about consumer Word with no post-2018 replacement; the onboarding problem now carries the Produktly step-count numbers. Finding: sweep 15 and sweep 10.

## 02 People

- §1, §3: the contact is now disclosed at two levels — a flat quick-look drawer beside the table (read-only except the stage badge, no doors inside) and the full record page from the shared template, with related lists as sections and at most one tab. Decision: Records, drawer and page (14 Sep).
- §3: row actions split into "Quick look" and "Open the full contact record"; `Space` opens the quick look, `Enter` the page; the drawer is defined as the top of the page cut short, so removing it would cost only speed.
- §4: `people.ts` gains `people.row.quick-look`; `people.row.open` re-weighted (SDR 70 → 45 for the page, 70 for the drawer; AE 70 → 60 page, 45 drawer) because prospecting is a scanning task and research a dwelling one.
- §4: Remove, bulk Remove and Mark do not contact marked decision-critical.
- §3: the "Add to list" row action for account executives now links its toast to People filtered to that list, never to the Lists page. Closes REVIEW §1 #15.
- §3: the no-access state is stated as an area the seat does not hold, with no read-only view. Decision: Three kinds of "cannot see it" (14 Sep).
- §2: the credit price list is marked as living in `src/ollopa/data/credits.ts`, cited here rather than owned. REVIEW §2.
- Header note: this spec owns the table-template extensions the other table pages cite. REVIEW §2.
- §7 step 1: "Pendo 2024, 6% of features carry 80% of clicks" corrected to 6.4% median, best-in-class 15.6%, with the consequence that a wide head is not automatically a failure. Finding: sweep 15.
- §7 step 2: rewritten around the quick look and the record, and why nothing reaches three levels.
- §7 step 3: the McGrenere, Baecker and Booth 2002 citation corrected — it is the two-interface design the user fills in themselves, not role-seeded defaults; Airtable 2023 added for routing by the job, and Salesforce and Cloudscape for density as the one legitimate mode.
- §5: added a note on which of the cited Apollo articles are recorded in the knowledge base and which were fetched live, so every claim can be reopened.
- §4: shape check recomputed (114 items); customer success no longer gets a row, because the seat cannot open the page.

## 03 Companies

- §3, §6: the record now has two levels — the quick-look drawer beside the table and the record page — and the record page's related lists (contacts, deals, activity, notes, tasks, contacts in sequences) became **scrolling sections rather than tabs**, with doors kept for long rarely-needed content and the one allowed tab explicitly not used. Decision: Records, drawer and page (14 Sep); closes REVIEW §1 #14 from this side.
- §3, §6: "More filters" renamed "Additional filters: owner, location, activity, signals, lists, fields (2 on)", and the page menu "More" renamed "Import, export all, merge, alerts"; every other mention updated. Decision: Door labels (14 Sep); closes REVIEW §1 #13 and the point-4 problem in REVIEW §4.
- §6: the point-4 score line now states the renames instead of claiming content labels it did not have.
- §2: the five account stages are owned by Settings (`pipe.contact-stages`) and read here, including Do not prospect. Closes REVIEW §1 #2.
- §3: the marketer's no-access state rewritten as an area the seat does not hold, with the profile case kept separate.
- §4: `companies.ts` gains `co.act.quick-look`; `co.act.open` re-weighted; Remove marked decision-critical; shape check recomputed (78 items) with the marketer row dropped.
- §5 problem 8: the Spool figure re-based and the argument moved onto tabs and rules 1 and 8. Finding: sweep 15; NN/g on tabs.
- §6: "Removed, not hidden" now explains plan gating instead of implying Ollopa has none: Ollopa gates by plan through the named pattern, but nothing on this page is on the plan table, so no lock appears here. Decision: Plan gating (13 Sep), which overrides REVIEW §1 #10.
- §5: added the source note on which articles are in the knowledge base and which were fetched live.

## 04 Lists

- §3, §6: the row menu renamed "Actions for {list}" and the member menu "Actions for {person}"; the score line for point 4 and the review row updated. Decision: Door labels (14 Sep).
- §6: added an explicit statement that Lists owns the auto-feed and its off switch, and that a sequence or campaign fed by a list shows one read-only "Fed by…" line with no control of its own. Closes REVIEW §1 #8.
- §3: the no-access state rewritten for the three kinds — account executives and customer success do not hold the area, keep "Add to list" on People, and a profile gap (Ridgeline's AE) would open the page and offer "Add to sidebar" instead. Decisions: Three kinds of "cannot see it" and Navigation (14 Sep); REVIEW §1 #15.
- §4: shape check restated against the group's one denominator, with item counts per pair and the AE and CS rows dropped because the page is not theirs.
- §5: added the source note on the two Apollo articles and their status.

## 05 Sequences

- §1, §3.1, §3.8, §4, §6, §8: the read-only-by-link list and page for the marketer and customer success are gone. Those seats do not hold the area and get the no-access page; reading one shared sequence is an object permission inside the area, never a thinner copy of the page. Decision: Three kinds of "cannot see it" (14 Sep); closes REVIEW §1 #12 and §5 #5.
- §4: the usage table is regenerated from `sequences.ts` with the marketer and customer-success columns removed; `sequences.ts` had every marketer and cs number stripped and its header comment rewritten.
- §4: archive (list and page), delete draft and delete step marked decision-critical, consistent with the group's rule.
- §6, score point 9: 18 of 18 corrected to **17 of 18** — point 9 now scores 1 on the same evidence as every other spec, because OPD has no analytics and the review is a commitment the product cannot enforce. Closes REVIEW §4's first row.
- §3.3: the agent draft button now says a saved, unsent draft is logged and never queued; only sending is an approval. Decision: Agent approvals (14 Sep).
- §3.4: added the read-only "Fed by {list}" line, with Lists owning the feed. Closes REVIEW §1 #8.
- §6: the row and card menus named "Actions for {sequence}" and "Actions for {step}", destructive last with its consequence in the label. Decision: Door labels (14 Sep).
- §4: shape check recomputed (60 items) against the group's denominator; seven pairs, with Halyard's SDR and Ridgeline's SDR argued.
- §5: added the source note naming which articles are in the settings memo and which were fetched live.

## Usage files changed

- `shell.ts`: two items added (Add to sidebar; "keep this page?"); Inbox and Tasks gained Fathom and Halyard admin overrides for the seat overlay; the approvals notification relabelled and noted as batched; header comments record the declared sidebar and that the spec's shape check reads `shellItems` rather than `itemsFor("home")`. 78 → 80 items.
- `home.ts`: approvals and their credits re-weighted for the marketer and customer success; a new decision-critical item for the over-threshold second approval; notes rewritten for who approves, what is logged instead of queued, and Reply opening Inbox. 38 → 39 items.
- `people.ts`: quick-look item added, record-page item re-weighted and relabelled; remove, bulk remove and do-not-contact marked critical. 113 → 114 items.
- `companies.ts`: quick-look item added, record-page item re-weighted and relabelled; remove marked critical. 77 → 78 items.
- `sequences.ts`: all marketer and customer-success numbers removed; four destructive items marked critical; header comments rewritten. 60 items, unchanged in count.
- `lists.ts`: unchanged. The decisions that touch Lists (auto-feed ownership, door labels) change the spec, not the numbers, and its destructive action was already marked critical.
- `npx tsc -b` passes from the repo root after all edits.

## Claims removed or re-based

Removed outright, because they could not be traced to the knowledge base:

1. **00 §5 and §6**: "The mobile app was retired on 28 August 2026 and 'no longer sends push notifications'; mobile is the browser only." No Apollo mobile article is recorded in `knowledge-base/sources/07-apollo-settings-map.md`. The problems row now reads "Phone behaviour: not documented in the memo (unverified)" and Ollopa makes no claim about Apollo's.
2. **00 §5**: the quoted line "Click a notification to view more details and take any necessary action." Not in the memo; the surrounding description, which is in memo §1.5, was kept.
3. **00 §7**: "Evidence: Superhuman's palette." The Superhuman figures in circulation are unsourced in the guide that carries them (`knowledge-base/11-what-changed-2018-2026.md`, "Numbers this knowledge base got wrong"). Replaced with Bailly et al. (IHM 2025) and ExposeHK (IHM 2025).

Re-based rather than removed, because the claim was real but mis-stated:

4. **01 §5.2 and 03 §5 problem 8**: "Fewer than 5% of users ever change a setting (Spool, UIE 2011)" is now labelled a 2011 anecdote about consumer Microsoft Word, with the note that sweep 15 found no post-2018 settings-usage benchmark of any tier, and the argument moved onto rules 1, 6 and 8.
5. **02 §7 step 1**: "Pendo 2024, 6% of features carry 80% of clicks" is now "6.4% is the median and best-in-class is 15.6%", with the consequence stated.
6. **02 §7 step 3**: McGrenere, Baecker and Booth (2002) was cited for "role-seeded defaults"; it is a two-interface design the user fills in themselves (13 of 20 preferred it). Role-seeded routing is Airtable 2023, and that citation was added.
7. **00 §1 and §3.4**: "The rule is Nielsen's for long-running agents" now carries the quote and its location (`knowledge-base/sources/04-b2b-saas-practice-and-case-studies.md` §8.3) instead of standing on the name alone.
8. **Apollo knowledge-base articles generally** (02, 03, 04, 05): most of the articles these specs cite were fetched live from Apollo's Zendesk API on 13 September 2026 and are *not* reproduced in `knowledge-base/sources/`. Rather than delete the whole "before" version, each spec's section 5 now states which citations are recorded in the settings memo (with their article ids) and which were fetched live and carry a title, URL and updated date the reviewer can reopen. Everything resting on a review aggregator is labelled secondary, and nothing in any section 6 rests on an unverified claim. This is the one judgement call in the pass that the owner may want to overrule.

## Left for the owner

- `src/ollopa/usage/model.ts` still has no `"shell"` value in `Page`, so `itemsFor("home")` returns Home's items and the shell's together. Group A did not edit `model.ts`, which is outside its files; the specs work around it by reading `shellItems` and `homeItems` directly, and both say so. One word in the `Page` union closes it.
- `businesses.ts` puts Meridian on the Growth plan; PLAN's plan-gating decision puts Meridian on Scale. The data file is outside this group's files and the gating specs belong to editor C.
