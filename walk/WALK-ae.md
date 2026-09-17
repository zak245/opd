# Journey walk: the account executive, A1 to A7

*Walked 15 September 2026 against RULES.md, PLAN.md section 2, IA-MAP.md parts 2, 3, 5 and 6, JOURNEYS.md, the specs the journeys touch, and USAGE-MODEL.md. The seat is the AE. The reference business is Meridian Software (Scale, separated roles, 214 open deals, Elena Vasquez in the AE seat, Daniel Okafor in the admin seat); Ridgeline's expansion AE is checked at every stop where the two differ, and Fathom and Halyard are checked for removals, because neither declares an AE seat.*

**One thing to say before the stops.** The map was written on 15 September, after the boundary widened; the specs were written before it. IA-MAP §6.5 says so itself and hands the specs nine new nodes to absorb. Four of those nine sit inside this group — `X-meeting`, `X-calllog`, `R-brief` and `D-deal-evidence` — and none has been absorbed yet. That is the reason five of the seven journeys fail rather than merely limp. The failures are absences, not wrong decisions.

**The rule I used most.** Density wins for all-day seats (PRODUCT.md: the SDR and the AE are the density argument; IA-MAP part 4 accepts the same for `P-tasks`). Where a number and a rule disagreed, the rule decided and I said which.

---

## A1 · Work the board and answer the warnings

*Meridian, daily. Walk: `P-home` ─DR→ `D-home-pipeline` ─LK→ `P-deals` ─DR→ `D-deals-filters` ─RC→ `Q-deal` ─QO→ `R-deal` ─DR→ `D-deal-activity` ─AI→ `P-agents` ─DR→ `D-agent-item`.*

### The stops

**1. `P-home`.** Elena sees, first: the health strip (credits on track), then in the right column the approval queue, then Pipeline — "Your open deals · $2.1m · 31", with "No next step (7)" and "Closing in 30 days (9)" under it — then Your week. Doors: "Tomorrow and later (n)" over tasks, "Not now and out-of-office replies (n)" over replies, "By stage and forecast category" over pipeline, "What agents did this week (n)". All expand in place; the agent batch opens as a panel. The thing she must never lose sight of here is what an agent is about to do on her behalf, and Home holds it at level one with the consequence and the credits on the row.

**2. `D-home-pipeline`.** Count and total per stage across the five stages, plus the forecast categories. In place, at the bottom of the Pipeline section. Nothing dependent is split.

**3. `P-deals`.** First: the header (pipeline picker, scope defaulting to Mine, period, search, Board or Table, New deal), the forecast strip (Commit, Best case, Pipeline, Closed won as count and sum), then five stage columns with count and sum, then cards carrying name, company, amount, next step, close date and object-state badges. Doors: the filter door, the view-options popover, the card door, the card menu, the page menu, the Closed won rail. The thing she must never lose sight of: what each deal is worth, when it closes and what has to happen next.

**4. `D-deals-filters`.** Opens in place under the header, label lists its contents, shows "n filters on", state and values persist.

**5. `Q-deal`.** *Does not exist in spec 08.* What exists instead is a door on the card labelled "Owner, activity and forecast".

**6. `R-deal`.** Header grid: stage stepper with probability and forecast under it, amount, close date, next step with its date, owner, last activity; actions row with Log activity, Mark won, Mark lost and archive, Delete with its consequence beside it. Timeline is the page. Side cards: agent proposal when pending, contacts with roles, open tasks, company. Six doors in the side panel, each in place except Signals, which is a drawer so the deal stays in view.

**7. `D-deal-activity`.** In the map this is the record's "All activity · n" door; in spec 09 the timeline *is* the main column and the filter chips do that work. No conflict, but the map node and the spec use different words for the same thing.

**8. `P-agents` and 9. `D-agent-item`.** Briefing sentence, exceptions, "Waiting for you" with a consequence sentence and credits on every item, then the ledger. The item's door is labelled by what it holds ("Read the draft · 142 words"). Level two, flat, no door inside it.

### Issues

**A1-1. Six of the eight warnings the journey is named after do not exist.** JOURNEYS A1 lists no activity, ghosted, overdue, too few contacts, no senior sponsor and stalled in stage; memo 18§1 gives all eight with Gong's published defaults. Spec 08 ships object-state markers for overdue, stale (14 days), sync error and agent proposal. Ghosted (no *prospect* activity, as distinct from no activity by anyone), too few contacts and no senior sponsor are absent, and the seed has no field that could compute them. Rule 1: this is the AE's first act of the day at the business where the page is dense on purpose, and it is not on the page.

**A1-2. Map and spec disagree about the filter door.** `D-deals-filters` is labelled "Warnings, owner, stage, close date, forecast category" in IA-MAP §2.9. Spec 08 labels it "Filters: owner, forecast category, stale, amount, company, created, archived and its reason, custom fields". Warnings are in the map and not in the spec.

**A1-3. The warnings have no owner.** The product already has the right precedent: one bounce-guard pair, owned by Settings, and every page that shows it prints the observed rate beside the threshold (PLAN, 14 Sep). Deal warnings have no Settings home at all — spec 14's Pipeline and data holds pipelines, stages, contact stages, custom fields, currency and enrichment order, and nothing else. A threshold nobody can see or set is a number the AE cannot argue with, and A1's first decision is "which warnings are noise".

**A1-4. The quick look is missing from the board, and a duplicate disclosure stands in its place.** PLAN's "Records: drawer and page" decision, the named pattern in RULES.md, the map's `Q-deal`, and spec 09 §6.8 — which states in writing that "the board's card opens a quick look with stage editable in place" — all say the board has one. Spec 08 never mentions it and ships a card door holding owner, days in stage, last activity, forecast category, probability, contacts and currency. That door is a second, differently-ordered view of the record's top, which is exactly what the pattern's test forbids.

**A1-5. The next step is split from its date on the board.** Spec 09 makes "next step with its date" one dependent pair and scores rule 6 a 2 for it. Spec 08's card, table column, inline editor and E shortcut all carry the text and not the date. A1's last step is "set the next step **and its date**". Rule 5.

**A1-6. The trigger has no surface.** A1 fires on "start of day, or an overnight warning". Home's health strip is workspace health (sending, sync, credits); the AE's Pipeline section counts deals with no next step and deals closing in 30 days. Nothing on Home says a warning fired overnight, so the trigger is only reachable by going to the board and looking.

**A1-7. Spec 09 contradicts itself about the pending agent proposal.** §6.2 puts it at level 2 for the Meridian admin, the Meridian CS, the Halyard admin and the Ridgeline CS. §6.6 says what approving it will do is visible without a click. Rule 7's test names a pending approval explicitly, and the proposal that matters here is a stage change, which spec 13 classifies as irreversible and queue-worthy. A pending approval behind a door fails the test for four of seven role and business pairs.

**A1-8. The same verb is used for two different things.** Spec 13 reserves Approve and Decline for items that cannot be taken back, and logs the reversible ones with an Undo, precisely so the queue stays short enough to be read (Chen et al.: 88.5% seen, 23.9% stopped). Spec 08's card and spec 09's proposal card say "Approve · Dismiss" for a proposed *next step*, which is a reversible field write. Training the Approve reflex on the cheap case is how the expensive case gets rubber-stamped.

### Decisions

- **Warnings become a named, shared object-state set of six**, computed per deal and shown as text chips on the card, in a column in the table view, and as the first group inside the filter door: No activity · Ghosted · Overdue · Too few contacts · No senior sponsor · Stalled in stage. Six, not Gong's eight: Pricing not mentioned and Red flag both need conversation content, which is outside the boundary (PLAN, 15 Sep), so they are removed, not hidden. *Rule 1, and the boundary decision of 15 Sep.*
- **The thresholds move to Settings › Pipeline and data as one editable block, "Deal warnings", and every warning chip prints the observed number against the threshold** — "Ghosted · 11 days, warns at 7" — exactly as the bounce guard does. The chip's tooltip is not the mechanism; the text is. *The bounce-guard precedent; rule 4 (never hover-only); rule 7 (the number the decision rests on is on the page).*
- **Home's AE Pipeline section gains one line above the two it has: "Needs attention (n)", linking to Deals filtered to warnings.** Weekly use for the Meridian AE is 70 and for the Ridgeline AE 45; it is a head item, not a door item. *Rule 1.*
- **Spec 08 adopts `Q-deal` and drops the card door.** Enter or a click on the card opens a flat drawer beside the board holding the top of the record in the record's order and with the record's labels — stage, amount, close date, next step with its date, owner, last activity — with stage the one editable field. The card title opens the record. The card keeps its badges. *The quick-look pattern; PLAN 14 Sep; and spec 09 §6.8, which already says this.*
- **Next step and its date travel together everywhere**: card, table column, quick look, inline editor, board filter. *Rule 5.*
- **The reversible suggestion loses the word Approve.** On the board card and on the deal record, a proposed next step reads "Use this next step · Dismiss", is applied with an Undo in the toast, and is logged in the agent ledger. Approve and Decline stay for the queue: send, sequence enrolment, spend above cap, stage change. *Rule 7's corollary — budget the reviewer, not the pixel; spec 13's own policy table.*
- **The pending agent proposal is decision-critical and is level one for every seat when one exists, removed when none does.** Mark it ★ in `deal.ts`. *Rule 7, and the state-not-history clause of rule 6.*

### Score

**No.** She reaches the board and the record without a third level and without losing the amount, the date or the next step. She cannot do the step the journey is named for: read the warnings. Missing step: the six warnings, their thresholds, and the filter that groups them.

---

## A2 · Prepare, run and follow up a call

*Meridian, daily. Walk: `P-tasks` ─PN→ `X-meeting` ─LK→ `R-brief` ─LK→ `R-deal` ─DR→ `D-deal-evidence` ─PN→ `X-reply` ─PN→ `X-task`.*

### The stops

**1. `P-tasks`.** For an AE seat the page opens in queue mode by default (S1 walk decision, 15 Sep), with the list as the door. Row shows the task, the contact, the company, the due date and the source. The thing she must never lose sight of: what is due now and what it is attached to.

**2. `X-meeting`.** *No spec.* The map defines it as a panel — attendees, status, prep, follow-up — with four parents including `P-tasks`. Spec 07 does not contain the word "meeting".

**3. `R-brief`.** *No spec.* The map makes it a level-1 record reached from the deal, the company, the meeting panel and Home.

**4. `R-deal`.** As A1.

**5. `D-deal-evidence`.** *No spec.* In the map it is "Evidence and source quotes · n", AE and OPS, present only where a conversation input exists.

**6. `X-reply`.** In the map, "Reply, with the agent draft beside it", parents `X-thread` and `R-person`. A2 opens it from `R-deal`, which is not one of its parents. Spec 09 instead has an Email action in the timeline composer that "drafts in place" with no agent draft beside it and no consequence line.

**7. `X-task`.** Exists as a panel in the map with `R-deal` as a parent; spec 09's Tasks card has Create with a due date and a default owner.

### Issues

**A2-1. Three of the seven stops have no spec.** `X-meeting`, `R-brief` and `D-deal-evidence` are nodes the map created on 15 September and §6.5 handed to the specs. Nothing has absorbed them. `X-calllog`, which A2 also needs when the meeting is a call, is in the same position.

**A2-2. `X-reply` has the wrong parents.** The AE's follow-up is written against the deal, not against an inbox thread. The map's parent list makes A2's sixth stop unreachable by its own rules.

**A2-3. Two mechanisms for one act.** Spec 09's composer Email and the map's `X-reply` both write the follow-up. One of them has the agent draft beside it and one does not, and the journey requires the one that does ("generate the follow-up, edit, send inside one business day").

**A2-4. The one gate every vendor ships has no consequence line here.** JOURNEYS A2 says "the send is per-item". Spec 13 writes the sentence properly for queue items ("Sends now from marcus@meridian.io. 0 credits. Replies land in your Inbox"). Spec 09's Email action says only "drafts in place; sending logs the email". Rule 7.

**A2-5. The daily journey is priced as a monthly one.** Spec 09's usage table has "Log a meeting 15" for the AE and nothing for preparing one or following one up. A2 is Meridian-daily and memo 18§1 puts 22% of the AE week in customer meetings and another 16% in preparation. The usage file cannot decide the level of a thing it does not list.

**A2-6. The action items are created one at a time.** A2 ends "turn action items into tasks with owners and dates", plural, at the end of a call — a task boundary in the exact sense rule 6 uses. One Create per item is the mid-task shape.

### Decisions

- **Spec 07 gains `X-meeting` as a panel on the task row**, and spec 09 gains it on the deal: attendees with their roles on the deal, status (booked, held, no-show, cancelled), the prep brief link, the qualification gaps as a count, and after the meeting the summary, the action items and the follow-up draft. Flat; the brief opens as a page, because a brief is an independent task (rule 5's container guidance, the same call the map made for templates). *IA-MAP §6.5.*
- **`R-brief` gets a section in spec 09 as a record built from the shared `RecordPage` template**: header (what it is for, which deal or company, who wrote which part), main as sections, no doors. Authorship is per section and visible, because the same rule has to hold for a brief as for an extracted field. *The record template; the AI-provenance rule below.*
- **`X-reply` gains `R-deal` as a parent, and spec 09's composer Email *is* that panel.** One node, three parents, like `X-calllog`. It carries the agent draft beside the human's, and the send button carries the sentence: mailbox, credits, where replies land. *Rule 7; IA-MAP part 4's "one node, two parents, never nested" resolution.*
- **The follow-up panel lists the action items with checkboxes and one "Create 3 tasks" button, offered when the panel is closed, not while the summary is being corrected.** *Rule 6: offered at a task boundary, not mid-task.*
- **`deal.ts` gains three items**: prepare from the brief (AE 65, CS 30, admin 5), correct the summary and action items (AE 55), send the follow-up (AE 60). "Log a meeting" stays at 15 as the after-the-fact case. *Rule 1: an item nobody has counted cannot be placed.*

### Score

**No.** Missing step: the meeting itself — prep brief, summary correction and follow-up draft — which the map has as nodes and no spec describes.

---

## A3 · Fill and validate the qualification fields

*Meridian, weekly per deal. Walk: `P-deals` ─RC→ `R-deal` ─DR→ `D-deal-evidence` ─LK→ `R-person` ─LK→ `R-deal` ─DR→ `D-deal-history`.*

### The stops

**1. `P-deals`.** As A1. A dwelling task, so the row goes straight to the record; that is the map's own "quick look, then record" condition and it is right here.

**2. `R-deal`.** Here is where the journey stops dead. The record holds stage, amount, close date, next step, owner, last activity, a timeline, contacts with five roles, tasks, company, and six doors. It holds no qualification fields. The nearest thing is one Meridian *custom* field, "Champion confirmed (checkbox)", sitting inside the Custom fields door at level two.

**3. `D-deal-evidence`.** Not in spec 09's door table.

**4. `R-person`.** Exists; the contact record is `R-person` and carries the role the deal gave them.

**5. `D-deal-history`.** "History (12 changes)", in place in the side panel, stage and field changes with who and when, and a last line naming Daniel Okafor as the person who sets stages. That last line is the best example of the "role gaps explain themselves" rule anywhere in the specs.

### Issues

**A3-1. The journey has no home.** MEDDPICC is in four of five live 2026 AE postings (memo 18§2). Nothing in any spec names Metrics, Economic buyer, Decision criteria, Decision process, Paper process, Pain, Champion or Competition as fields of a deal.

**A3-2. `D-deal-evidence` does not exist in spec 09.** It is in the map with two journeys on it (A3, G5) and it is where the map puts the extracted-field proposal and its source quote (§6.3, the conversation object's resolution).

**A3-3. The product has not chosen between memo 18§2's two models.** Model A (Gong AI Data Extractor) fills CRM fields "with no rep input required" and, verbatim, "when new or better information is found, the previous value is overwritten", with no documented review step. Model B (Gong Playbooks) suggests and colours four states, ending at "validated by either the AE or manager". JOURNEYS A3 picks B in its approval line — "a visible state — suggested, edited, validated — and never silently overwrites a validated value". No spec carries it. This is the single sharpest finding in the source memo and the specs are silent on it.

**A3-4. The trigger does not exist.** A3 fires when "a stage gate blocks the advance". Spec 14's Pipeline and data has no required-at-stage rule, and the map's `X-field` panel does ("type, values, required-at-stage, CRM mapping", journeys O9, O3 and A3). Spec 09's Move stage action says stage, probability and forecast change together and nothing about being refused.

**A3-5. Putting the evidence behind a door and the value somewhere else would break rule 5.** The value and the quote that justifies it are the dependent pair in this journey: the decision A3 names is "is the evidence good enough to call a champion a champion". They cannot sit on opposite sides of a door. This is the same shape as the connect wizard's field-mapping write rule, which IA-MAP part 4 resolved by putting the rule in the row of the pair it governs.

**A3-6. "Blockers" has no role.** `DealContact.role` is Champion, Economic buyer, Technical, User, Other. A3 says "map the economic buyer, champion and blockers"; memo 18§2 names Competition as an element.

**A3-7. The qualification model is smuggled in as a per-business custom field.** "Champion confirmed (checkbox)" at Meridian is the product's real model wearing a disguise, and a checkbox is precisely what memo 18§2's practitioner source calls out: "A checkbox that says 'Champion: Yes' tells you nothing about evidence quality."

**A3-8. No usage rows.** `deal.ts` has 68 items and none of them is qualification, so the level cannot be computed and the shape check in §4.1 is measuring a page that is missing its weekly work.

### Decisions

- **Qualification becomes a product field set on the deal, not a custom field.** Eight elements from MEDDPICC, because four of five postings name it and the product should ship one framework rather than a builder: Metrics, Economic buyer, Decision criteria, Decision process, Paper process, Pain, Champion, Competition. `Deal.qualification: Record<element, { value, state, source, updatedBy, at }>`, `state` one of suggested, edited, validated. *Rule 1; memo 18§2.*
- **It renders as a level-one side card on the deal for the AE, above Contacts: "Qualification · 5 of 8 · 2 to validate".** Each row carries the element, its value, its state chip, and one line of provenance — "From the 4 Sep call with Amara Okonkwo" — with Validate and Edit on the row. Weekly use puts it there (see below) and rule 5 keeps the provenance line beside the value it justifies. For the Meridian admin and CS it is a door; at Halyard it is removed, because Halyard's deals are booked meetings handed to a client CRM and there is nothing to qualify. *Rules 1, 4 and 5.*
- **`D-deal-evidence` is added to spec 09 as the door "Evidence and source quotes (n)"**, holding the full quotes with their dates and sources and the extraction runs that produced them. Long content, rarely needed alongside the rest: the door test, exactly as the record template states it. The one-line provenance stays on the card, so nothing dependent crosses the door. The door is removed where no conversation input exists (rule 4: a door always opens onto something). *Rules 2, 4, 5.*
- **The product picks Model B, in writing, in spec 09 §6.6 and spec 13's policy table.** Extraction is logged, never queued; a suggested value is never written over a validated one; an extraction that contradicts a validated value appears as a proposal on the card with both values side by side and the AE chooses. *JOURNEYS A3's approval line; rule 6, user-controlled disclosure; rule 7's corollary, because a silent overwrite is disclosure that never happened.*
- **Required-at-stage arrives in two places.** Spec 14's Pipeline and data gains "Required to enter a stage" per stage, set in the `X-field` panel; spec 09 gains a blocked state on Move stage: "Proposal needs Economic buyer and Metrics. Set by Daniel Okafor in Settings › Pipeline and data." The stepper shows the gate before the click, not after it. *Rule 4 (deliver on the promise), rule 7 (the consequence before the action), and the product rule that role gaps explain themselves.*
- **`DealContact.role` gains Blocker.** *JOURNEYS A3.*
- **"Champion confirmed" is deleted from Meridian's custom fields**, replaced by the Champion element with its state and its evidence. *Rule 1: the same thing in two places is not two items.*
- **`deal.ts` gains three rows:** qualification card (AE 65, CS 10, admin 12; Fathom admin 20, Halyard 0, Ridgeline AE 45, CS 15), validate or correct an extracted value (AE 55, CS 8, admin 6), evidence and source quotes door (AE 18, admin 10). Two head items, one body item: the AE's head share rises about two points, which is the density argument already accepted for this seat, and the door keeps the tail honest. *USAGE-MODEL.md; PRODUCT.md on the AE as the density case.*

### Score

**No.** The journey cannot start. Missing steps: the qualification fields, their three states, their evidence, and the stage gate that triggers the whole thing.

---

## A4 · Keep next steps and close dates honest

*Meridian, weekly. Walk: `P-deals` ─DR→ `D-deals-filters` ─RC→ `Q-deal` ─QO→ `R-deal` ─PN→ `X-note` ─AI→ `P-agents` ─DR→ `D-agent-item`.*

### The stops

**1. `P-deals`** as A1. **2. `D-deals-filters`**: owner, forecast category, stale, amount, company, created, archived and its reason, custom fields. **3. `Q-deal`**: missing, as A1-4. **4. `R-deal`** as A1. **5. `X-note`**: the note panel, reachable from any record. **6–7. `P-agents`, `D-agent-item`** as A1.

The thing she must never lose sight of at every one of these stops is the same: a deal with no next step is a deal that is not being worked. Spec 09 says exactly that and shows the field as empty in the warning colour when it is empty, which is the best single line in the spec.

### Issues

**A4-1. The journey's first step is impossible.** "Filter to deals with no next step, a past close date, or nothing moved in fourteen days." Past close date is the period filter (overdue) and fourteen days is the stale filter, but there is no "no next step" filter on the board — while Home gives the same AE "Deals with no next step" at 60% weekly. The highest-frequency pipeline-hygiene question in the product is answerable on Home and not on the page built to answer it.

**A4-2. `Q-deal` missing** — same as A1-4, and A4 is the journey where the quick look earns its keep, because re-dating twelve deals is a scanning task.

**A4-3. The same field sits at two levels in two specs.** Forecast category: level one on the record for the Meridian AE (spec 09 §6.2), level two inside the card door on the board (spec 08 §6). A4 sets it weekly. Same seat, same business, same field, two answers.

**A4-4. "Leave one line for the manager" has no reader.** Notes have an author and a body and no audience, so a note written for a manager is indistinguishable from a note written for oneself.

**A4-5. Nothing states that auto-accept is not offered.** JOURNEYS A4 makes it a deliberate product decision — "accepting is a click per deal, and auto-accept is deliberately not offered" — and no spec says so, which means the next person to read the specs will offer it.

### Decisions

- **"No next step" becomes a level-one filter chip on the board for every seat that holds the page**, sitting with scope and period rather than inside the filter door, and it is the first chip in the warnings group. Meridian AE 60, Ridgeline AE 45, admin 30. *Rule 1: 20% or more is level one, and this one is at 60.*
- **The board adopts the quick look** (see A1) and the quick look is where a re-date happens for a scanning pass — with one exception to the pattern's "one editable field": the deal's quick look edits stage, and stage alone, because that is the field the glance exists for. Re-dating twelve deals happens in the table view's inline editor. *The quick-look pattern, and its test: removing the drawer loses only speed.*
- **Forecast category is level one on the board card for the AE**, beside the amount, matching the record. 25% weekly for the Meridian AE, and it is the number A5 will report upward, so rule 7 backs the same placement. *Rule 1 and rule 7; and one item may not have two levels for one seat.*
- **A note gains an audience: `Note.to?: user` and `Note.mentions: user[]`.** A note addressed to someone shows "For Priya Raman" on the timeline item and reaches her as a bell row; the deal's card and the record show "Comment waiting for your reply" as object state when one is unanswered. This also gives A6 the comments it needs. *Rule 6: object state, never inferred history.*
- **Spec 09 §6.6 and spec 13's policy table both state that a proposal is never applied without a person, and that there is no auto-accept setting.** *Rule 7's corollary, and PLAN's agent-approval decision of 14 Sep.*

### Score

**No.** Missing step: filtering the board to deals with no next step.

---

## A5 · Submit the weekly forecast

*Meridian, weekly. Walk: `P-reports` ─TB→ (Forecast) ─PN→ `X-report-records` ─RC→ `R-deal` ─DR→ `D-deal-history` ─LK→ `P-reports` ─PN→ `X-forecast`.*

### The stops

**1. `P-reports`.** Spec 12 opens on a tile row, one chart and a breakdown table, with the range and the team filter at level one, and it is right about the thing that matters most here: the overview is the content, and what gets disclosed is the records behind a number, never the number. For the Meridian AE the first tab is Pipeline, and level one is the weighted forecast with "weighted by stage probability" printed under it, marked decision-critical.

**2. The Forecast tab.** *Does not exist.* Spec 12 declares four fixed reports: Activity, Pipeline, Sequences, Campaign results. The map declares five and puts A5, L2 and C6 on the fifth.

**3. `X-report-records`.** Exists: any count is a link, and the panel lists the records behind it with "Open deal".

**4–5. `R-deal`, `D-deal-history`.** Exist.

**6. `X-forecast`.** *Does not exist.* The map has it as a panel on the Forecast tab, seats AE, CS and OPS, with the AE-with-reports seeing the team roll-up first.

### Issues

**A5-1. The tab is missing, and with it the journey.** Three journeys across three roles (A5, L2, C6) land on it; IA-MAP §6.4d resolves them into one node deliberately. Nothing in the specs implements either the tab or the node.

**A5-2. Nothing submits.** The steps A5 lists — read the roll-up of commit, best case and pipeline; adjust a category; enter the number; write the judgement note; check the change history; submit — have no surface. Memo 18§4 gives the shape from Gong's shipped flow: select period and team, click a submission cell, a panel opens on the right, enter the number, review the roll-up, write notes for managers, check submission changes, save.

**A5-3. There is no denominator.** IA-MAP §6.3 decides that a goal is an attribute, "a target per period per user or team, set in `S-pipeline` beside the forecast categories and shown as the denominator on the Forecast tab". Spec 14's Pipeline and data does not have it and spec 12 has no target on any tile.

**A5-4. Commit has no published meaning anywhere in the product.** Memo 18§4: Clari, "reps should expect to close about 90% of the deals in the commit category"; Kellblog, "forecast category should effectively equal probability". A5's own first decision is "what counts as commit — roughly a 90% number". Spec 12 already accepts this argument for the weighted forecast and prints the method under the number; the categories get nothing.

**A5-5. Submission history would be a third level if it went inside the panel.** `X-forecast` is level two. A door inside it is level three, which IA-MAP part 4 forbids per channel.

**A5-6. Two different numbers share one word.** Spec 12's level-one "forecast" for the AE is the weighted pipeline, computed as amount × probability. A5's forecast is a human commitment. Both are called forecast, and one of them is reported upward.

**A5-7. The plan table disagrees with itself about CSV export.** PLAN's plan row reads "reports activity only / all plus CSV export / all plus CSV export and scheduled email" and the map's edge reads "CSV at Growth, scheduled email at Scale". Spec 12 puts CSV at Scale and, on that basis, has Halyard's ops lead — on Growth — printing a PDF every week instead of exporting. The spec even writes the consequence up as an honest pricing gap, which it is not: it is a spec contradicting the decision it renders.

**A5-8. No agent ever submits — decided in the map, written nowhere.** IA-MAP §6.4d states it; spec 12 and spec 13 are silent.

### Decisions

- **Spec 12 gains a fifth fixed report, Forecast**, in the tab strip in the map's order, for seats AE, CS and OPS. Level one on it: the five categories as count and sum for the period (Commit, Best case, Pipeline, Omitted, Closed), the goal for the period as the denominator with attainment, the predicted number beside the submitted one **with the deals driving the difference listed under it**, your last submission with its date and its delta, and the submission deadline. *Rule 1; IA-MAP §6.4d.*
- **`X-forecast` is added as a panel on that tab, flat, no doors inside it.** Contents: a row per category with the roll-up number and an adjustable number beside it, the judgement note, the last submitted value repeated beside the input, and a submit button carrying its consequence — "Submits $412,000 as your commit for Q4 to Priya Raman. She sees it at once; you can resubmit until Friday 17:00." Where the seat has reports, the team roll-up opens first and a rep is one click down, which is a filter, not a level. *Rule 2 per channel; rule 7 on the consequence; IA-MAP §6.4d on the roll-up being a position in the hierarchy, not a screen.*
- **Submission history sits on the tab, not in the panel**: a "Submissions" strip showing this period's submissions with who, when and the delta. *Rule 2 — the alternative is a third level.*
- **Each category prints its definition under its label, once, as text**: "Commit · about a 90% number" · "Best case · qualified, with a plan, still needs work" · "Pipeline · early, still being worked" · "Omitted · not counted". No tooltip: the FTC's 2022 dark-patterns report names the tooltip as the mechanism of a deceptive act, and spec 12 has already moved a fee line out of a menu on that argument. *Rule 7.*
- **The two numbers get two names.** The tile computed as amount × probability is "Weighted pipeline"; "Forecast" means the submitted commitment. Spec 12's Pipeline tab and its usage file rename accordingly. *Rule 4, read as honesty about what a label names.*
- **Goals move into Settings › Pipeline and data as "Targets per period, per user and per team"**, beside the forecast categories, admin-owned, and the Forecast tab names who set them. *IA-MAP §6.3; the product rule that role gaps explain themselves.*
- **Spec 12 is corrected to the PLAN table: CSV export unlocks at Growth, the scheduled weekly email at Scale.** Halyard's ops lead exports; the invented PDF workaround and the "honest consequence" paragraph go. *PLAN's plan-gating decision of 13 Sep, which the specs render rather than decide.*
- **"No agent ever submits a forecast" is written into spec 12's Forecast section and spec 13's policy table**, alongside the predicted-number pair. *IA-MAP §6.4d; rule 7 — a number reported upward is a commitment, and a commitment is not an agent's to make.*

### Score

**No.** Missing steps: the Forecast tab, the submission panel, the goal, and the definition of commit.

---

## A6 · Prepare for and survive the deal review

*Meridian, weekly. Walk: `P-deals` ─DR→ `D-deals-filters` ─RC→ `R-deal` ─DR→ `D-deal-activity` ─PN→ `X-note` ─PN→ `X-task` ─LK→ `P-reports`.*

### The stops

**1–2. `P-deals`, `D-deals-filters`** as A1. **3. `R-deal`** as A1; this is a dwelling stop and the record is right. **4. `D-deal-activity`**: the timeline and its filter chips. **5. `X-note`**, **6. `X-task`**: panels on the record. **7. `P-reports`**: the Pipeline tab.

The thing she must never lose sight of: whether every deal she is bringing has an owner, a close date and a next step. Memo 18§5, from Clari: no owner, date and next step means no review.

### Issues

**A6-1. The comments the journey turns on do not exist.** "Answer the manager's comments in place" is step four. JOURNEYS lists comment as an object of A6; the 31-object model folds it into note, and note has no recipient, no mention and no unanswered state. IA-MAP §6.4j names "comments on `R-deal`" as one of the three leader-conditioned AE features and no spec carries it.

**A6-2. There is no manager.** `businesses.ts` declares one AE seat per business. The map's decision (§6.4j) is that the leader is an AE seat with `reports > 0` and that every leader-only feature is conditioned on it. No business declares such a seat, `Role` has no `reports` field, and so A6's counterpart — and L1, L2 and L3 entirely — cannot be rendered at any business.

**A6-3. "The deals the manager flagged" is not a filter and not a state.** The nearest field is the Priority flag in the All fields tail at 5% weekly, which is the AE's own flag, not the manager's.

**A6-4. There is no review-ready state.** The journey's second step is "confirm each has an owner, close date and next step, or fix it first". Owner sits at level two for the AE (15% weekly), next step at level one, close date at level one. Nothing puts the three together as one readable condition, which is what the review actually inspects.

**A6-5. Async is the point and the specs are synchronous.** Memo 18§5's published manager workflow makes step four "tag reps with comments on accounts and activities *rather than waiting for meetings*", and Clari's ratio — 90% coaching, 10% line-by-line review — is the reason. A product with no comment forces the 10% shape.

### Decisions

- **A note becomes the comment**, with `to` and `mentions` as decided in A4, an unanswered state, and a reply in place on the timeline item. No new object: JOURNEYS' 31-object test ("would someone name it in a sentence about their day") passes for "note" and the reply is an attribute of it. *Rule 5 — the answer belongs beside the thing being answered; the object model of 15 Sep.*
- **`businesses.ts` declares a second AE seat at Meridian with reports**: "Sales manager", Priya Raman, `reports: ["Elena Vasquez"]`, and `Role` gains `reports?: string[]`. Ridgeline keeps one AE seat, so the conditioned features are absent there, which is the point of declaring seats. *PLAN's seats decision of 14 Sep; IA-MAP §6.4j. Without this, four journeys have no actor.*
- **Three features are conditioned on `reports > 0`, named once and read by three specs**: the team roll-up first on `X-forecast`, the rep filter at level one in `D-deals-filters`, and comments on `R-deal`. *IA-MAP §6.4j.*
- **The board gains a level-one chip driven by object state, "Comments waiting for you (n)"**, and the filter door gains "Commented by my manager". It appears because a comment is unanswered, not because of anything anyone did last week. *Rule 6.*
- **"Review ready" becomes one visible condition, not three fields**: the card and the quick look print "Needs owner · close date · next step" naming only the missing ones, and the filter door carries "Not review ready". *Rule 1 and memo 18§5.*

### Score

**No.** Missing steps: the manager's comments, and a seat for the manager to hold.

---

## A7 · Close won and hand off to CS

*Meridian, monthly. Walk: `R-deal` ─LK→ `R-brief` ─DR→ `D-deal-files` ─LK→ `R-company` ─PN→ `X-book` ─PN→ `X-task` ─LK→ `P-accounts`.*

### The stops

**1. `R-deal`** as A1; Mark won is level one for the AE with a confirmation that names the stage, the forecast category and the tasks that will close. **2. `R-brief`**: no spec. **3. `D-deal-files`**: "Files (2)", in place in the side panel, with upload and per-file delete. **4. `R-company`**: the account face of the company record, with health, renewal, hand-off notes and the rest as scrolling sections and only four doors. **5. `X-book`**, **6. `X-task`**: panels. **7. `P-accounts`**: the CS table, with a hand-off strip that appears only when a hand-off exists and only where an AE seat exists — a good removal.

The thing she must never lose sight of: what was actually promised, because that is what the CSM will be held to.

### Issues

**A7-1. A broken edge in the map.** `R-brief ─DR→ D-deal-files`: `D-deal-files` is a door on `R-deal`, and the walk opens it from `R-brief`, which is a different page. The level counter resets at a page, so nothing here is three deep; the route is simply not walkable as written.

**A7-2. `R-brief` has no spec** (also A2-1).

**A7-3. The gate is in the journey and in neither spec.** A7 says "mark the handoff complete, **the gate on closed-won**", from 17§2: "Handoff Complete" required before Closed Won. Spec 09's Mark won confirmation lists stage, forecast and open tasks. Spec 11 treats the hand-off as something an AE sends from the Accounts page afterwards. As specified, a deal can close won with nothing written down, which is the failure the source describes.

**A7-4. The hand-off is missing three of the five things A7 names.** Spec 11's `Handoff { from, sent, accepted, whyTheyBought, promised, checklist }` covers goals in the customer's words and promises beyond the order form. It has no signer-versus-users distinction, no risks and dissenters, and no deadline and why — and "risks and dissenters" is the field the CSM most needs and the AE least wants to write.

**A7-5. Authorship of a generated brief is unspecified.** A7's approval line: "The brief is agent-drafted and editable; the AE signs it, and the CSM sees who wrote which part." Nothing says so. This is the same rule as A3's suggested/edited/validated state, and the product should not invent it twice.

**A7-6. Two owners, one word.** A7 ends "transfer ownership". The deal has an owner and the account has an owner and a separate `ae` field; nothing says which one moves at close.

**A7-7. The close-won consequence is written twice and differently.** Spec 08's sheet says pushed to the CRM, account moves to customer success, counted as closed. Spec 09's confirm says stage becomes Closed won, forecast Closed, two open tasks close. The same act, two consequence lines, neither complete.

### Decisions

- **The map's A7 walk is corrected** to `R-deal ─LK→ R-brief ─LK→ R-deal ─DR→ D-deal-files ─LK→ R-company …`, the same return hop A3 already uses. *IA-MAP convention 1: navigation costs no level, so the return is free.*
- **Mark won gates on the hand-off brief wherever the business declares a CS seat.** The confirmation reads: "Closing won needs the hand-off brief. 4 of 7 sections filled — risks and the deadline are empty. Complete the brief ›". Where no CS seat exists — Fathom, Halyard — the gate is removed, not disabled. *17§2; rule 4 (remove, do not disable); rule 7 (the consequence before the action).*
- **One close-won consequence line, written once in spec 09 and read by spec 08**: stage, forecast category, the open tasks that close, the CRM push where a CRM is connected, the account's move to customer success, and the hand-off's arrival in the CSM's queue. *Rule 7; the same single-source rule the product already uses for deal stages and the bounce guard.*
- **`Handoff` gains `signer`, `users[]`, `risks`, `dissenters`, `deadline` and `deadlineWhy`**, and the brief's sections are the seven A7 names. *JOURNEYS A7; 18§8b.*
- **Provenance is one rule, stated once and applied to both the extracted field and the generated brief**: every generated value carries its state (suggested, edited, validated), its author, and its source; a human signature is recorded per section; nothing generated overwrites something a human validated. Written in spec 09 §6.6 and referenced by spec 11 and spec 13. *Rule 7's corollary; memo 18§2's Model B; JOURNEYS A3 and A7.*
- **At close won the account's owner becomes the accepting CSM and the deal keeps its AE**, so reporting and commission stay attached to the person who sold it; spec 11 says so in the hand-off Accept action. *The one-object decision for company and account (JOURNEYS §1), read through to its consequence.*

### Score

**No.** Missing step: the hand-off gate on closed won, and the brief it gates on.

---

## Consolidated change list

| # | File | Location | Current | New | Rule |
|---|---|---|---|---|---|
| 1 | `specs/08-deals-board.md` | §2 seed additions | `syncState`, `agentProposal`, `currency`, `stageEnteredAt` | Add `lastProspectActivityAt`, `contactCount`, `seniorSponsor` (derived from `DealContact.role`), and a computed `warnings[]` of six | 1 |
| 2 | `specs/08-deals-board.md` | §3 Shown, Card | Object-state markers: overdue, stale, not syncing, agent proposal | Add the six warnings as text chips: No activity · Ghosted · Overdue · Too few contacts · No senior sponsor · Stalled in stage, each printing the observed number against its threshold | 1, 7 |
| 3 | `specs/08-deals-board.md` | §3 and §6, filter door | "Filters: owner, forecast category, stale, amount, company, created, archived and its reason, custom fields" | "Filters: warnings, no next step, owner, forecast category, amount, company, created, archived and its reason, custom fields", warnings first, and the map's label matched | 4 |
| 4 | `specs/08-deals-board.md` | §3 Filters, level one | Level one: scope, period, search | Add the chips "No next step (n)" and, where the seat has reports, "Comments waiting for you (n)" | 1, 6 |
| 5 | `specs/08-deals-board.md` | §6 doors table, Card door | Card door "Owner, activity and forecast" expanding under the card | Delete. The card opens `Q-deal`: a flat drawer beside the board holding stage, amount, close date, next step with its date, owner, last activity, in the record's order and labels, stage the only editable field, footer link "Open the deal record" | 2, 5 (quick-look pattern) |
| 6 | `specs/08-deals-board.md` | §3 Shown, Card and Table view; §3 Actions, Edit in place | Next step, no date | Next step and its date together on the card, in the table column, in the quick look and in the inline editor | 5 |
| 7 | `specs/08-deals-board.md` | §6 level table, AE row | Forecast category in the card door (level 2) | Forecast category level one on the card for the AE, matching the record | 1, 7 |
| 8 | `specs/08-deals-board.md` | §3 Actions, agent proposal | "Approve sets the next step" | "Use this next step · Dismiss", applied with Undo, logged in the ledger; Approve and Decline reserved for irreversible items | 7 |
| 9 | `specs/08-deals-board.md` | §6 Decision-critical | Delete in the card menu with its consequence | Delete leaves the card menu; deletion of a deal lives on the record, where the consequence is visible without a click, and in the bulk bar, which names what goes | 7 |
| 10 | `specs/08-deals-board.md` | §3 By role and business | No AE-with-reports column | Add the `reports > 0` condition: rep filter at level one, comments chip, team scope default | 1 |
| 11 | `specs/01-home.md` | §3.1 Pipeline section | "Your open deals", "No next step (n)", "Closing in 30 days (n)" | Add "Needs attention (n)" as the first line, linking to Deals filtered to warnings | 1 |
| 12 | `specs/01-home.md` | §4 usage items | No warnings item | Add `pipeline.warnings`: AE 70, admin 25, CS 10; Ridgeline AE 45; Fathom admin 40 | 1 |
| 13 | `specs/09-deal-record.md` | §2.1 fields | No qualification fields | Add `Deal.qualification: Record<element, { value, state: "suggested" \| "edited" \| "validated", source, updatedBy, at }>` over eight MEDDPICC elements, and `QualEvidence { id, dealId, element, quote, sourceKind, sourceId, at }` | 1 |
| 14 | `specs/09-deal-record.md` | §3.1 Side panel; §6.1 layout | Cards: proposal, contacts, tasks, company | Add the Qualification card above Contacts for the AE: "Qualification · 5 of 8 · 2 to validate"; each row element, value, state chip, one line of provenance, Validate and Edit. Door for the Meridian admin and CS; removed at Halyard | 1, 5 |
| 15 | `specs/09-deal-record.md` | §6.3 doors table | Six doors | Add "Evidence and source quotes (n)": full quotes with dates and sources, and the extraction runs. Removed where no conversation input exists | 2, 4 |
| 16 | `specs/09-deal-record.md` | §2.3 custom fields, Meridian | "Champion confirmed (checkbox)" | Delete; the Champion element with its state replaces it | 1 |
| 17 | `specs/09-deal-record.md` | §2.1, `DealContact.role` | Champion, Economic buyer, Technical, User, Other | Add Blocker | 1 |
| 18 | `specs/09-deal-record.md` | §3.2 Actions, Move stage | "Stage, probability and forecast update together" | Add the blocked case: the stepper shows the gate before the click — "Proposal needs Economic buyer and Metrics. Set by Daniel Okafor in Settings › Pipeline and data" | 4, 7 |
| 19 | `specs/09-deal-record.md` | §3.4 States | Nine states | Add "Blocked by stage requirements" | 4 |
| 20 | `specs/09-deal-record.md` | §6.2 level table, Agent proposal row | 1 for AE and Fathom, 2 elsewhere | 1 for every seat when one exists, removed when none does; marked ★ in §4 | 7 |
| 21 | `specs/09-deal-record.md` | §6.6 Decision-critical | Approval policy prose | Add the provenance rule in full: state, author and source on every generated value; a human signature per brief section; nothing generated overwrites a validated value; no auto-accept setting exists | 7 |
| 22 | `specs/09-deal-record.md` | §3.2 Actions, Email | "drafts in place; sending logs the email" | The composer's Email *is* `X-reply`: the agent draft beside the human's, and the send button carries mailbox, credits and where replies land | 7 |
| 23 | `specs/09-deal-record.md` | §3.1 Side panel | No meeting or brief | Add the meeting panel (attendees and roles, status, prep brief link, qualification gaps count; after the call: summary, action items, follow-up draft) and the brief as a record page built from `RecordPage` with sections, no doors, authorship per section | 5 |
| 24 | `specs/09-deal-record.md` | §3.2 Actions | Create task, one at a time | The follow-up panel lists action items with checkboxes and one "Create n tasks" button, offered when the panel closes | 6 |
| 25 | `specs/09-deal-record.md` | §3.2 Actions, Mark won | "Stage becomes Closed won, forecast Closed, 2 open tasks close" | One consequence line owned here and read by spec 08: stage, forecast, tasks closing, CRM push where connected, the account's move to customer success, the hand-off's arrival in the CSM's queue. Gated on the hand-off brief where a CS seat exists; gate removed where none does | 4, 7 |
| 26 | `specs/09-deal-record.md` | §2.1 fields; notes | `Note` has author and body | Add `Note.to?: user`, `Note.mentions: user[]`, and an unanswered state; a reply in place on the timeline item; "For Priya Raman" on the item | 5, 6 |
| 27 | `specs/09-deal-record.md` | §6.3 doors table, counts | "Company signals and news", "All fields", "Sync history" carry no count | "Company signals and news (n)", "All fields (17)", "Sync history · last 10". "Show full email" keeps none: it is one email | 4 |
| 28 | `specs/09-deal-record.md` | §4 usage items | 68 items | Add: qualification card (AE 65, CS 10, admin 12; Fathom admin 20, Halyard 0, Ridgeline AE 45, CS 15); validate an extracted value (AE 55, CS 8, admin 6); evidence door (AE 18, admin 10); prepare from the brief (AE 65, CS 30, admin 5); correct the summary and action items (AE 55); send the follow-up (AE 60). Recompute §4.1 | 1 |
| 29 | `specs/12-reports.md` | §1, §3, throughout | Four fixed reports | Five: Activity, Pipeline, Sequences, Campaign results, **Forecast**. Forecast for seats AE, CS and OPS | 1 |
| 30 | `specs/12-reports.md` | §3, new Forecast section | — | Level one: the five categories as count and sum; the goal for the period as denominator with attainment; the predicted number beside the submitted one with the deals driving the difference; last submission with date and delta; the deadline; a Submissions strip for this period | 1, 7 |
| 31 | `specs/12-reports.md` | §3, new panel | — | `X-forecast`, flat, no doors: a row per category with roll-up and adjustment, the judgement note, the last submitted value beside the input, and a submit button carrying its consequence sentence. Team roll-up first where the seat has reports | 2, 7 |
| 32 | `specs/12-reports.md` | Forecast section, category labels | — | Each category prints its definition as text under its label; commit reads "about a 90% number". No tooltip | 7 |
| 33 | `specs/12-reports.md` | §3 tiles, Pipeline tab | Tile "Weighted forecast" | Rename to "Weighted pipeline"; "Forecast" means the submitted commitment | 4 |
| 34 | `specs/12-reports.md` | §1, §3 Export, §3 plan table, §4 | CSV export at Scale; Halyard prints a PDF; the "honest consequence" paragraph | CSV export at Growth, scheduled weekly email at Scale, per PLAN's plan table and the map's edge. Halyard exports; delete the PDF workaround and the paragraph | plan-gating pattern |
| 35 | `specs/12-reports.md` | Forecast section | — | "No agent submits a forecast", stated beside the predicted-number pair | 7 |
| 36 | `specs/14-settings.md` | §1 and §3, Pipeline and data | Pipelines and stages, contact and account stages, custom fields, currency, enrichment order | Add three items: **Required to enter a stage** (per stage, set in the field panel); **Deal warnings** (the six, each with its threshold and the observed workspace value); **Targets per period, per user and per team** beside the forecast categories. Usage rows in `settings.ts` for each | 1, 7 |
| 37 | `specs/11-accounts.md` | §2, `Handoff` | `{ from, sent, accepted, whyTheyBought, promised, checklist }` | Add `signer`, `users[]`, `risks`, `dissenters`, `deadline`, `deadlineWhy`; the brief's seven sections named | 1 |
| 38 | `specs/11-accounts.md` | §3 Actions, Accept hand-off | "You become owner" | State it fully: the account's owner becomes the accepting CSM, the deal keeps its AE for reporting; and the CSM sees who wrote which section of the brief | 7 |
| 39 | `specs/07-tasks.md` | §3 features | No meeting | Add `X-meeting` as a panel on the task row, flat, with the prep brief and follow-up as described in change 23 | 1 |
| 40 | `IA-MAP.md` | §2.7, `X-reply` parents | `X-thread`, `R-person` | `X-thread`, `R-person`, `R-deal` | 5 |
| 41 | `IA-MAP.md` | §5, A7 walk | `R-deal ─LK→ R-brief ─DR→ D-deal-files` | `R-deal ─LK→ R-brief ─LK→ R-deal ─DR→ D-deal-files ─LK→ R-company …` | 2 (convention 1) |
| 42 | `IA-MAP.md` | §2.12, `P-reports` | "Five tabs, one page" with no spec behind the fifth | Unchanged in substance; add the note that spec 12 now owns Forecast, `X-forecast` and the goal denominator | — |
| 43 | `IA-MAP.md` | §2.9, `D-deals-filters` | "Warnings, owner, stage, close date, forecast category" | "Warnings, no next step, owner, stage, close date, forecast category" — and spec 08 matched to it | 4 |
| 44 | `IA-MAP.md` | §6.4j | The leader is an AE seat with `reports > 0`; three conditioned features named in prose | Keep, and add that no business currently declares such a seat, resolved by change 45 | — |
| 45 | `src/ollopa/data/businesses.ts` | Meridian `roles` | One AE seat, Elena Vasquez | Add `{ role: "ae", title: "Sales manager", user: "Priya Raman", initials: "PR", reports: ["Elena Vasquez"] }`; `Role` gains `reports?: string[]`. Ridgeline keeps one AE seat | PLAN, seats per business |
| 46 | `src/ollopa/usage/deal.ts` | items | 68 | The six rows of change 28, with the per-business overrides | 1 |
| 47 | `src/ollopa/usage/deals.ts` | items | 62 | Add warnings (AE 80, admin 40, CS 15; Ridgeline AE 50; Halyard admin 25), no-next-step filter (AE 60, admin 30; Ridgeline AE 45), comments chip (AE 20, AE-with-reports 55) | 1 |
| 48 | `src/ollopa/usage/reports.ts` | items | No forecast submission | Add the Forecast tab's level-one items and the submission panel: read the roll-up (AE 70, CS 35, admin 40), adjust a category (AE 45), judgement note (AE 40), submit (AE 65), submissions strip (AE 25); Halyard and Fathom admin 10 | 1 |

---

## What the walk found, in one line each

- **47 issues, 48 changes.** All seven journeys fail, and five of the seven fail on absence rather than on a wrong decision.
- **The single largest hole is the Forecast tab**, which three journeys across three roles land on and no spec implements.
- **The second is qualification**, which is the AE's weekly work, is named in four of five live job postings, and exists in the product only as a Meridian checkbox inside a door.
- **The third is the four boundary nodes** — meeting, call log, brief, evidence — that the map created on 15 September and that §6.5 handed to the specs. They are still unclaimed.
- **The pattern that keeps recurring** is one fact written in two specs with two answers: forecast category at two levels, close-won with two consequence lines, the quick look asserted in spec 09 and absent in spec 08, CSV export at two plan tiers. Every one of those is fixed by naming a single owner for the fact, which is what the product already does for deal stages and the bounce guard.
