# Journey walk: the marketer, M1 to M6

*Walked 15 September 2026 against RULES.md, PLAN.md section 2, IA-MAP.md parts 2, 3, 5 and 6, JOURNEYS.md, the specs in `specs/` and `src/ollopa/usage/`. Six journeys, 43 issues, 52 changes. All six journeys fail as the specs stand, and the reasons are concentrated: forms and workflows have no spec and no usage items at all, the scoring settings area exists on the map and nowhere else, and two marketer journeys walk into areas the marketer's seat does not hold.*

**Who is walking.** Jonas Weber, marketer at Meridian Software (300 people, Separated sales team profile, Scale plan; admin Daniel Okafor). Camille Dubois, lifecycle marketer at Ridgeline (80 people, Product-led growth profile, Growth plan; admin Grace Mwangi). Fathom Labs and Halyard Agency declare no marketer seat, so no first screen is computed for them; where a marketer item appears at those two businesses it is the admin glancing, and the numbers say so.

**The marketer's sidebar today** (spec 00): Home · People, Lists · Campaigns · Reports, Agents, Settings. Seven entries. The map gives the marketer eight, because 6.4g puts `P-workflows` in the marketer's sidebar and no spec has caught up.

---

## M1 · Build an audience and apply the suppressions

Ridgeline, weekly. Map walk: `P-home` ─DR→ `D-home-audiences` ─LK→ `P-campaigns` ─TB→ (Audiences) ─RC→ `R-audience` ─DR→ `D-aud-suppress` ─PN→ `X-report-records` ─LK→ `R-list` ─DR→ `D-list-history` ─LK→ `R-campaign`.

### The stops

**1. `P-home`, Camille at Ridgeline.** First on screen: the greeting line, then the health strip cut to the credit projection, then Campaigns — campaigns running with sent, opened and converted since yesterday (85–90% weekly). One door: "Audiences that changed (n)", in place under the section, open by default at Ridgeline because the usage file puts it at 25 and the spec says the Ridgeline marketer's audiences door is level one and open. Approvals are almost always one empty line, because research and scoring are logged rather than queued. The thing she must never lose sight of here: **what is running and about to mail people today.**

**2. `D-home-audiences`.** Behind it: the audiences whose size moved overnight, with the delta. It is a door with a count and it expands in place. Correct container: three or four short rows that are read against the campaigns above them.

**3. `P-campaigns`, Audiences view.** The view switch reads "Campaigns 12 · Audiences 6". Switching views is object state, not a door, so it costs no level. Audience row: Audience, Type, Size, Suppressed (three counts), Last rebuilt, Used by. Two doors on the page: "More filters: owner, audience, date, goal" and "Columns: … (n)". Never lose sight of: **who will not receive this.**

**4. `R-audience`.** A page. Header, rules, size, suppression counts, campaigns using it. One door, `D-aud-suppress`, labelled "Suppressions: customers, open deals, closed-lost, in sequence".

**5. `D-aud-suppress` → `X-report-records`.** The panel listing the people behind a count, on its own channel, so the door plus the panel is still two levels.

**6. `R-list` → `D-list-history`.** The source list, and "History: 9 changes" expanding in place at the bottom of the list detail.

**7. `R-campaign`.** Attach the audience. The campaign record's Audience block names the audience, its size and its three suppressed counts at level one.

### Issues

**M1-1. The audience's suppression counts sit behind a door.** The map's `D-aud-suppress` is a door on `R-audience` named for the four suppression kinds. The usage file marks `aud.suppressed` decision-critical. Rule 7 and map 6.4b ("an audience's level-one question is who must not receive this") both say the counts cannot be one click away. The door is right for the *rules*; it is wrong for the *numbers*.

**M1-2. The four suppressions in the map are not the four in the spec.** The map and M1 name customers, open deals, closed-lost and in-sequence. Spec 10 and `campaigns.ts` name unsubscribed, bounced and in-sequence. Both sets are real and they are different in kind: unsubscribed and bounced are never optional, the other four are the marketer's choice. Nothing anywhere says so, so a marketer reading the spec would ship an audience that mails current customers.

**M1-3. "Live or frozen" and the refresh cadence have no home on an audience.** M1's steps require both. `R-audience` has "Last rebuilt" and "Rebuild now" and nothing that says whether the set keeps changing. A live audience attached to a running campaign keeps adding people to a send after the marketer has left the page — the same consequence Lists already puts at level one ("new matches added to Q4 enterprise outbound automatically · Turn off"). This is the missing step.

**M1-4. The door has no count.** "Suppressions: customers, open deals, closed-lost, in sequence" carries no number, against the 14 September door-label decision and rubric point 4.

**M1-5. "Preview a sample" has no stated path.** M1 requires it before attaching. The node that does the job exists — `X-report-records`, the records behind a number — but the map lists its only parent as `P-reports`, and neither spec says the audience's size and suppression counts are links.

**M1-6. The agent that proposes audience rules is not in the agents spec.** M1's approval line says an agent may propose rules from a plain-language brief and the rules stay visible and editable before anything attaches. Spec 13 declares three agents — research, outreach, scoring — and none of them writes an audience. A proposal that cannot be traced to a named actor is a suggestion that hints instead of exposing.

**M1-7. Where the brief lives is unstated.** M1's trigger is "a brief lands" and M2's is "the brief is approved". No node holds it.

**M1-8. Lists is left out of the Product-led growth sidebar, and the Ridgeline marketer opens lists 75% of weeks.** The map's `P-lists` sidebar column reads FO, SEP, AG. `lists.ts` gives the Ridgeline marketer 75 on "open a list" and 55 on "new segment". A daily-to-weekly item parked outside the sidebar is disclosure debt (rule 1). The omission was declared in spec 14 for *the admin* at Ridgeline and the map generalised it to the whole profile. It also makes the map's own level check wrong: it counts the Ridgeline marketer's sidebar at 8, and with Lists out and Workflows in it is 7.

### Decisions

- **M1-1.** Split the numbers from the rules. On `R-audience`, level one: total size, net size after suppressions, and one line of six counts — "Suppressed 412: unsubscribed 96, bounced 41 · customers 180, open deals 22, closed-lost 51, in an active sequence 22". The door keeps only the rules that produce them and the upload. *Rule 7, and map 6.4b.*
- **M1-2.** Name the two kinds. The first two counts are labelled "always applied" and have no off switch; the other four are checkboxes in the door with their counts beside them. Spec 10 and `campaigns.ts` adopt all six. *Rule 7: how data is used is never inferred from a label.*
- **M1-3.** Mode goes to level one on `R-audience`, beside the size: "Mode: live · refreshes daily 06:00 · new matches are added to Lifecycle: trial day 7 · Freeze". Frozen audiences read "Frozen at 1,240 on 12 Sep". The off switch is one click, the same length as the on switch. *Rule 7 (commitment and its exit) and rule 5 (size and what changes it stay together).*
- **M1-4.** Relabel the door "Suppression rules: customers, open deals, closed-lost, in sequence (4 applied)". *Rule 4 and the 14 September door-label decision.*
- **M1-5.** Every count on `R-audience` — size, net size and each of the six — is a link opening `X-report-records`, whose title names the number ("180 customers suppressed, Lifecycle Q4"). Add `R-audience` as a second parent of that node, the way `X-calllog` has two. That is M1's sample preview; no new node. *The quick-look-and-record pattern: a panel that only reads loses speed, not a feature.*
- **M1-6.** The research agent gains the kind "proposed an audience rule set". It is logged, never queued, and the proposal appears in the audience's rule builder marked "Proposed by the research agent 14 Sep · not applied" with Apply and Discard. Nothing is applied silently. *Rule 6 (nothing changes place or state on its own) and the exposure-over-hints decision.*
- **M1-7.** The brief is the campaign's Notes, which spec 10 already has, and an audience shows "Built for: Q4 trial nurture" linking to the campaign. No new object. *Rule 2: a brief does not earn a third level.*
- **M1-8.** Profile omissions are declared per seat, not per profile. The map's `P-lists` sidebar cell becomes "FO, SEP, AG; PLG for the marketer seat only", and spec 00's Product-led growth row says Lists is left out of the admin's and the account executive's sidebars and kept for the marketer. This restores the map's own count of 8. *Rule 1: hide the rare, never the necessary.*

### Score

**No.** No third level and nothing critical lost once M1-1 is applied, but the specs forgot a step: **choosing live or frozen and setting the refresh cadence**, which M1 names twice and no node holds.

---

## M2 · Build, QA, launch and follow up a campaign

Ridgeline, weekly. Map walk: `P-campaigns` ─RC→ `R-campaign` ─LK→ `P-templates` ─LK→ `R-campaign` ─PN→ `X-sendtest` ─PN→ `X-qa` ─PN→ `X-schedule` ─PN→ `X-recipients` ─LK→ `P-reports`.

### The stops

**1. `P-campaigns`.** For Camille the level-one columns are the Ridgeline set: Campaign, Status, Audience, Delivery (sent, delivered, bounced with the observed rate against warn 4% and pause 6%), Opened, Clicked, Converted, Unsubscribed, Trigger, Last send. Above the table one policy line carrying the guard's two thresholds, the observed rate, the daily cap and the domain's health. Never lose sight of: **what is about to go out, to how many, and what the last one cost.**

**2. `R-campaign`.** Results funnel, Audience block, Content, then Trigger (Ridgeline) or Schedule. Doors below: Sends by day (open by default at Ridgeline), Recipients (1,240) as a drawer, Links clicked, Variants, Goal and attribution window, Delivery settings, Resend, Activity and Notes. Every door one level, none inside another.

**3. `P-templates` and back.** A page, because a template is an independent task — the map's first refusal of a third level.

**4. `X-sendtest`.** A small dialog; the test carries a working unsubscribe link that unsubscribes nobody, and the toast names the mailbox.

**5. `X-qa`.** The map's node: "QA checklist, run by someone who did not build it".

**6. `X-schedule`.** Date, time, timezone, send speed, and a summary naming recipients, mailbox and time with the suppressed counts. Above the workspace threshold the button reads "Request approval" and the row reads "Awaiting approval: Grace Mwangi". The threshold is read from Settings, never written here.

**7. `X-recipients`, then `P-reports`.** Per-person results; the seven-day report.

### Issues

**M2-1. `X-qa` exists on the map and nowhere in spec 10.** The word QA does not appear in the campaigns spec. M2's central control — the thing 17§4 calls a non-negotiable part of campaign QA, run by someone who did not build it — has no fields, no states and no usage number.

**M2-2. "Does a QA failure block the launch" is undecided.** JOURNEYS names it as a decision and nothing answers it.

**M2-3. The event follow-up split has no path.** M2 requires splitting the follow-up by attended, no-show and hand-raiser. Nothing on `R-campaign` produces an audience from a campaign's own outcomes, and the map has no edge from a campaign to an audience in that direction (only audience → campaign).

**M2-4. "Pass hand-raisers to sales" walks into a seat gap.** The obvious control is `X-enrol`, whose seats are SDR, AE and OPS. A marketer cannot enrol anyone in a sequence, by design, and there is no other stated route.

**M2-5. The launch approval is stated twice with two different owners.** JOURNEYS says the launch is per-item and crosses the admin threshold whenever the audience exceeds 1,000, "which it almost always does". Spec 10 says a marketer schedules their own sends and there is no queue for ordinary work. Both are right about different sends and neither says which is which on screen.

**M2-6. "Preview on desktop and phone" is missing.** Spec 10's Content block has a rendered preview and no width switch. A lifecycle send that breaks at 400 px is the one QA failure that costs money.

**M2-7. "Watch the first hour" has no surface.** A campaign in Sending state shows the same columns as a sent one. The bounce rate is the safety state and it is most decision-critical in the first hour.

### Decisions

- **M2-1.** Spec 10 gains an `X-qa` panel on `R-campaign`, flat, no doors inside: eight checks (audience attached and refreshed; suppressions applied with their counts; subject and preheader present; links resolve; unsubscribe link present and working; from name and mailbox correct; rendered at desktop and 400 px; send window and timezone). Each row is pass, fail or not run, each failure is stated in words, and each failure's "Fix" is a link that navigates to the block on the campaign page — navigation, not a second level. The panel records who ran it and when, and states "Run by the person who built this campaign" when that is true, because 17§4 says a builder should not QA their own work. *Rule 4 (the door opens onto something), rule 2 (no door inside a door).*
- **M2-2.** A QA failure does not disable Schedule. `X-schedule` carries one line above the button — "QA: 2 checks failed — unsubscribe link missing, no phone render. Run 11:04 by Camille Dubois" — and the same line travels with the request when the send crosses the threshold, so the approver reads it too. *Rule 4 (remove, never disable), rule 7 (the consequence is stated where the decision is made, and rule 7 applies to the approver's screen too).*
- **M2-3.** `R-campaign` gains one level-one line under Results for campaigns with an event or a link goal: "Build an audience from: attended 312 · did not attend 188 · hand-raisers 24". Each is one click to a new `R-audience` pre-filled. No new node; three counts visible without a click. *Rule 1 (weekly work for the seat that owns the page) and rule 5 (the split sits under the results it is cut from).*
- **M2-4.** "Hand to sales" on `R-audience` writes the people into a named list owned by a sales user and states the consequence before the click: "24 people go to Marcus Adeyemi's 'Inbound hand-raisers' list. He enrols them; this does not send anything." Lists already own the feed and its off switch, so there is one place to stop it. The marketer never reaches `X-enrol`. *Spec 04's "Lists owns the feed", and the three kinds of "cannot see it" — a seat gap is explained, never worked around.*
- **M2-5.** One sentence in spec 10 and on the schedule dialog: the sender approves their own send; above the workspace threshold (a Settings item, default 1,000 recipients or 500 credits) a second, admin approval is needed, and the dialog names the approver and the count before the button. A lifecycle campaign crosses the threshold on its *enrolment over the period*, not on one send, so the trigger block states "About 1,400 people over 30 days · above the 1,000 threshold, Grace Mwangi approves once at launch". *PLAN.md's approval rule: approvals at a task boundary, with the consequence stated, never mid-task.*
- **M2-6.** The Content block's preview gains a desktop and a 400 px width switch, side by side, not a menu. *Rule 5: the two views are compared, so they are not split by a door.*
- **M2-7.** While a campaign's status is Sending, its row and its record show sent-so-far against the total, the observed bounce rate against both thresholds, and Pause at the same size as Schedule. *Rule 7: safety state and the stop control are never one click away.*

### Score

**No.** Two steps the specs forgot: **the QA checklist**, which has a node on the map and no spec at all, and **the event follow-up split and the hand-off to sales**, which have no path from a campaign to an audience or to a sales-owned list.

---

## M3 · Maintain the lead-scoring model

Meridian, monthly. Map walk: `P-reports` ─TB→ (Pipeline) ─DR→ `D-report-conv` ─PN→ `X-report-records` ─LK→ `P-settings` ─LK→ `S-scoring` ─LK→ `P-people` ─DR→ `D-people-filters`.

### The stops

**1. `P-reports`, Pipeline tab.** Jonas at Meridian, on Scale, so nothing is locked. Overview strip on arrival, then tiles (Created, Won, Lost, Open pipeline, Weighted forecast), one chart, one breakdown table by stage. Tabs are pages, not doors. Never lose sight of: **the overview is the content.**

**2. `D-report-conv`.** "Stage-to-stage conversion" expands in place under the by-stage table it depends on.

**3. `X-report-records`.** The drawer from the Won count: that row week by week, then the records — deal, company, amount, owner, closed on — with Export and Open per row.

**4. `P-settings` → `S-scoring`.** The settings page, thirteen areas, in-page anchors, no settings shell. Scoring is the tenth area.

**5. `P-people` → `D-people-filters`.** Thirty-one filters in one flat panel; the head ones for the role are chips in the bar.

### Issues

**M3-1. `S-scoring` does not exist outside the map.** Spec 14 has twelve areas and no signals, scoring or personas. `settings.ts` has no scoring item. The whole middle of this journey — weights, decay, distribution preview, publish — has no spec, no fields and no numbers. The map's own 6.5 lists `S-scoring` as one of nine nodes the specs must absorb; none has.

**M3-2. The number the journey turns on does not exist.** M3's method is to read the score each closed-won customer carried *at first sales contact* and take the median. No object stores a stamped score. The `Score` object in JOURNEYS has a model, inputs, weights, distribution and a primary flag — all live values. Recalibrating a threshold from today's recomputed scores is circular: the model grades its own homework.

**M3-3. A settings area is allowed at most one door, and the scoring model needs more than one door's worth.** Personas, signals, score models, weights, decay, distribution preview and the routing threshold will not fit under one heading without a door inside a door. Every comparable area solves this with a panel on its own channel — `X-field` on `S-pipeline`, `X-user` on `S-team`, `X-territory` on `S-prospecting` — and the map gave `S-scoring` no panels at all.

**M3-4. There is no score filter and no score column on People.** `people.ts` has zero occurrences of "score". Spec 02 lists 31 filters across five groups and none of them is Score or Persona. M3's last stop is that filter panel, and M4's whole routing gate is a score comparison. The map's door label "All filters (31)" is therefore also wrong.

**M3-5. Publishing a threshold has no consequence line.** M3 says moving the threshold is a human publish "because it changes who gets called", and names a decision — grandfather those already routed, or not. Nothing states what publishing does before it is done.

**M3-6. "Tell sales" is a step with no surface.** A threshold change silently alters who reaches a rep's queue. Sales finding out by noticing is the complaint that started the journey.

**M3-7. The distribution check has a published test and no home.** 17§4: "if 80% of your database scores above MQL, the threshold isn't doing work". That is a one-line health check and it belongs beside the threshold.

### Decisions

- **M3-1.** Add `S-scoring`, "Signals, scoring and personas", to spec 14 as the tenth area, between Sequences and Agents and AI, seats OPS and MK, on every plan. Level one: the primary score with its threshold and the share of the database above it; the list of score models with their inputs; personas with their sizes; signals with their freshness. One door: "Retired signals, retired personas and archived models (n)". *Rule 1 (monthly work with a decision attached is still level one for the seat that owns it), rule 7 (routing thresholds decide who gets called and are never gated).*
- **M3-2.** The score is stamped. When a person is routed, the score, the model version and the date are written onto the person and copied onto any deal created from them, and they are never recomputed. The Pipeline report's Won records drawer gains a "Score at first contact" column for the marketer and admin seats, and the drawer's export carries it. This is the only way M3's median can be taken. *Rule 7 corollary: a number that cannot be audited cannot be reviewed, and the review is the journey.*
- **M3-3.** Add three panels to the map under `S-scoring`, each level two on its own channel, each flat: `X-score` ("Score model: inputs, weights, decay, distribution preview, publish"), `X-persona` ("Persona: title, seniority, department, industry, size, geography") and `X-signal` ("Signal: definition, source, freshness, talking tips"). Nothing inside them opens further. *Rule 2, and the map's own resolution of the same problem for `X-field`.*
- **M3-4.** Add two filters and two columns to spec 02 and `people.ts`: Score (a band picker printing the count in each band, plus "above the MQL threshold" as a named value) and Persona. The door label becomes "All filters (33)". Give the Meridian marketer a seeded view, "Above the MQL threshold". *Rule 1: the gate the routing runs on is the marketer's weekly question.*
- **M3-5.** `X-score` publishes with a consequence line above the button, not a toast after it: "Publish threshold 62 (was 55). 214 people are above it today; 148 will be. 66 already routed stay routed. Takes effect for new leads only." Grandfathering is a radio pair in the same panel with its own count on each option. *Rule 7 and PLAN.md's "Approve all with the consequence in the label".*
- **M3-6.** Publishing writes one row to the rep-facing surfaces rather than a notification nobody reads: the People page's Score filter shows "Threshold 62, published 15 Sep by Jonas Weber" next to the band list, and the Slack event list gains a sixth kind, "scoring threshold published", off by default and set at connection time. *Rule 6: adaptation is offered at a task boundary and is transparent; and hints do not teach, so the change is exposed where the score is read, not announced once.*
- **M3-7.** `X-score`'s distribution preview prints the share above the threshold with the published test beside it: "68% of people score above 62. Above 80% the threshold is not doing work (17§4)." *Rule 2 of the review score: every visible item is backed by a number with a source — including this one.*

### Score

**No.** Two steps the specs forgot: **the scoring settings area itself**, and **the score each customer carried at first sales contact**, without which the median method at the centre of the journey cannot be run.

---

## M4 · Route new MQLs and honour the SLA

Meridian, daily. Map walk: `P-workflows` ─RC→ `R-workflow` ─DR→ `D-wf-runs` ─LK→ `S-scoring` ─LK→ `X-territory` ─LK→ `P-tasks` ─DR→ `D-task-filters`.

### The stops

**1. `P-workflows`.** In the marketer's sidebar per map 6.4g, Growth-gated, and Meridian is on Scale. A table of workflows with their trigger, status, enrolment and credit ceiling. Never lose sight of: **which rule is firing, on whom, and what it is about to cost.**

**2. `R-workflow`.** Trigger, enrolment filters, rules, actions, limits, credit ceiling, run history.

**3. `D-wf-runs`.** "Run history and enrolment · n", a door with a count.

**4. `S-scoring`.** The score gate the routing reads.

**5. `X-territory`.** "Territory: filters and owners" — a panel whose seats are OPS only.

**6. `P-tasks` → `D-task-filters`.** A page whose seats are SDR, AE, CS and OPS. Spec 07 is explicit: the marketer never works tasks and gets the no-access page.

### Issues

**M4-1. The journey's last two stops are areas the marketer's seat does not hold.** `X-territory` is OPS-only and `P-tasks` names the marketer in its no-access state by name. Walked literally, M4 ends on `G-noaccess` twice. This is the map contradicting itself: part 5 routes a seat through nodes part 2 denies it.

**M4-2. `P-workflows` and `R-workflow` have no spec.** Neither does `D-wf-runs`. There are sixteen page specs and none of them is Workflows; `model.ts`'s `Page` type has no "workflows" value, so no usage item can be written for it. The marketer's daily journey runs entirely through pages that do not exist below the map.

**M4-3. Round robin cannot skip anyone on leave.** M4 requires it. Spec 14's user fields are name, title, role, profile, status, credit limit, credits used and last active. "Status" is active or deactivated. A round robin that hands a two-hour SLA lead to someone on holiday is the 47-hour average response the journey exists to prevent.

**M4-4. The SLA timer, the window and the reassignment rule have no home.** Sub-five-minute leads close at 32% against 12% (17§4, n=939). The clock is the journey's single most consequential object and nothing shows it.

**M4-5. "Review misroutes weekly" has no queue.** Map 6.4c decided routing exceptions stay on `P-workflows` "where the rule that produced them is one click away". Nothing implements that decision.

**M4-6. The door label breaks the 14 September rule.** `D-task-filters` is "More filters: source, status, sort". PLAN.md: never "More", "More filters", "More actions", "Other" or "Advanced". `D-camp-filters` has the same fault.

**M4-7. Daily work with no first screen.** M4 is daily for the Meridian marketer and Home shows them campaigns only. A daily duty with a clock on it and no place on Home is disclosure debt of the plainest kind.

### Decisions

- **M4-1.** Amend the map's M4 walk. It ends `… ─DR→ D-wf-runs ─LK→ S-scoring ─LK→ R-workflow (the rule row) ─DR→ D-wf-runs (exceptions)`. The named-account override is **named in the rule row and not opened**: "Named accounts route to their owner — 42 accounts, set by Daniel Okafor in Settings › Team and access › Territories", and for a marketer the link opens the no-access page that says the same thing. The rep's queue is verified from the run row, which names the rep and the task it created. Remove M4 from the `P-tasks`, `D-task-filters` and `X-territory` journey columns. *The three kinds of "cannot see it": a seat gap is explained in place, never routed through.*
- **M4-2.** Write `specs/17-workflows.md` covering `P-workflows`, `R-workflow` and `D-wf-runs`, and add `workflows` to the `Page` type with a `workflows.ts` usage file registered in `index.ts`. Seats OPS and MK; Growth-gated, shown on Starter with a lock and the plan name at the entry point. *Map 6.5: the nine new nodes must be absorbed in journey order, and this is the first journey that needs them.*
- **M4-3.** Add availability to the user: Available, or Away until a date, set by the person or the admin, shown in `S-team` and in `X-user`, and read by any routing rule. The rule row prints what it will do: "Weighted round robin across 6 reps · 1 away until 18 Sep · skipped". *Rule 7: who is on the receiving end of an automatic action is part of the action.*
- **M4-4.** The SLA lives on `R-workflow` at level one: the window per lead heat, the count now running, the count breached today, and the reassignment rule in words ("Past 2 hours, reassign to the next rep and notify the first"). Breached rows show the elapsed time in text, not colour. *Rule 7 (safety state) and rule 1 (daily).*
- **M4-5.** `D-wf-runs` splits into two named sections inside the one door — "Enrolled (n)" and "Could not route (n)" — with the reason on every exception row and the rule that produced it one link away. No third level: the door is the level, the sections are not doors. *Map 6.4c, and rule 2.*
- **M4-6.** Rename both doors: "Additional filters: source, status, sort (n)" on Tasks and "Additional filters: owner, audience, date, goal (n)" on Campaigns. *PLAN.md, 14 September.*
- **M4-7.** Home's Campaigns section gains one line for the marketer: "Routing: 41 leads today · 3 past the SLA window · 2 could not be routed", each count a link to the workflow filtered. Not a new section — the marketer's page keeps its shape. *Rule 1, and Home's own rule that a section the seat does not hold is absent rather than empty.*

### Score

**No.** The journey cannot be completed at all: **two of its stops are areas the marketer's seat does not hold**, and the pages that should carry the SLA clock and the exception queue have no spec.

---

## M5 · Work inbound form submissions

Ridgeline, daily, `[BOUNDARY: forms]`. Map walk: `P-campaigns` ─TB→ (Forms) ─RC→ `R-form` ─LK→ `R-job` ─LK→ `R-workflow` ─LK→ `P-tasks` ─LK→ `R-campaign`.

### The stops

**1. `P-campaigns`, Forms view.** The map's page is named "Campaigns · Audiences · Forms" — three views on one table, the switch being object state and costing no level. Never lose sight of: **what inbound cost today and what did not get through.**

**2. `R-form`.** A record: the form, its fields, its enrichment job, its credit cap, the campaign it reports to, the workflow it routes with.

**3. `R-job`.** The enrichment job: source, fields, waterfall lineup, matched, credits.

**4. `R-workflow`.** Routing.

**5. `P-tasks`.** The rep's queue.

**6. `R-campaign`.** The conversion reported back.

### Issues

**M5-1. Forms do not exist below the map.** Spec 10's view switch reads "Campaigns 12 · Audiences 6" — two views. The word "form" appears in spec 10 only inside a quoted Apollo URL. `campaigns.ts` has 69 items and none is a form item. `R-form` is a record with no spec, no fields, no states and no numbers. This is the largest single gap in the group, and M5 is a *daily* journey.

**M5-2. The credit cap — the whole reason forms came inside the boundary — has no stated level.** PLAN.md's boundary decision says the cap "is the interesting control". A cap is a fee and a commitment; rule 7 puts it on screen without a click, with the observed spend beside it, exactly as the bounce guard's two thresholds sit beside the observed rate.

**M5-3. `P-tasks` again.** Same seat break as M4. The marketer confirms the submission reached a rep; they do not work the rep's queue.

**M5-4. "Which fields to ask versus enrich" and "hide fields already known" are named decisions with no answer.** Progressive profiling is literally progressive disclosure applied to a form, and the library has no position on it.

**M5-5. The daily journey has no first screen.** Same shape as M4-7 and worse, because at Ridgeline inbound is the front door.

**M5-6. What happens when the cap is reached is unstated.** A form that silently stops enriching, or silently keeps spending, are both failures and nothing chooses.

**M5-7. "The rep reads them before the first touch" has no carrier.** The answers have to travel from the submission to whatever the rep opens. Nothing says they do.

### Decisions

- **M5-1.** Spec 10 becomes "Campaigns · Audiences · Forms": a third view on the same table (Form, Status, Submissions 7 days, Enrichment spend against the cap, Routes to, Reports to, Last submission), and an `R-form` record section covering fields, enrichment, routing, reporting, states and phone width. `campaigns.ts` gains a "Forms" area. The view switch stays object state; no new page and no new level. *Map 2.10, which already decided forms are a third view rather than a page.*
- **M5-2.** On the Forms row and at the top of `R-form`, level one and marked decision-critical: "Enrichment cap 200 credits a day · 68 used today · 41 of 44 submissions matched". *Rule 7: a fee and a cap are never behind a door, and the observed number sits beside the limit the way the bounce rate sits beside the guard.*
- **M5-3.** Amend the map's M5 walk to `… ─LK→ R-workflow ─DR→ D-wf-runs ─LK→ R-campaign`, and remove M5 from `P-tasks`. The run row names the rep and the task it created, which is what the marketer needs to see. *Same rule as M4-1.*
- **M5-4.** Ollopa's position, written into spec 10: a form asks for what routing needs and enrichment fills the rest; a field already known for a returning visitor is **removed, not disabled or pre-filled invisibly**, and the form says so in one line to the visitor ("We already have your company details"). The form editor shows each field with "asked" or "enriched (2 credits)" beside it, so the cost of the design is visible while it is being designed. *Rule 4 (remove, never disable) and rule 7 (the fee is stated before the decision, here the marketer's design decision).*
- **M5-5.** Home's Campaigns section gains, for the marketer, "Forms: 44 submissions today · 2 could not be routed · enrichment 68 of 200 credits". Ridgeline overrides put it high; Meridian lower. *Rule 1.*
- **M5-6.** At the cap, enrichment stops and submissions keep being accepted and routed un-enriched, marked "not enriched — daily cap reached 14:20" on the person and on the run row, with "Raise the cap" beside it. Nothing is dropped and nothing spends past the number. *Rule 7 (no silent spend, no silent loss) and the gated-features rule that no gate appears after work the user cannot keep — the visitor's submission is kept.*
- **M5-7.** The submission's answers are written to the person as a note titled "Form: Request a demo, 15 Sep" and shown in the contact record's level-one block, not behind the history door, for as long as the person's stage is pre-first-touch. *Rule 5: the answers and the first touch are used together, so a door does not separate them.*

### Score

**No.** The specs forgot the whole object: **forms have no spec section, no usage items and no first screen**, and the credit cap that justified bringing them inside the boundary has no stated home.

---

## M6 · Report on campaigns and reallocate

Ridgeline, monthly. Map walk: `P-home` ─DR→ `D-home-audiences` ─LK→ `P-reports` ─TB→ (Campaign results) ─DR→ `D-report-columns` ─PN→ `X-report-records` ─PN→ `X-export` ─LK→ `P-campaigns` ─DR→ `D-camp-filters`.

### The stops

**1. `P-home` → `D-home-audiences`.** As M1.

**2. `P-reports`, Campaign results.** Overview strip, then tiles — Sent, Opened, Replied, Deals created, Pipeline created — one chart, one table: one row per campaign with kind, audience, sent, opened, replied, deals, pipeline, status. On the control bar: date range, team, person, compare, Export, Print, "Exports and prints spend no credits", "Data as of". Never lose sight of: **the overview is the content.**

**3. `D-report-columns`.** "Columns: 7 of 10", a popover.

**4. `X-report-records`.** The drawer from any count.

**5. `X-export`.** A menu: this table, the records, copy link, email weekly.

**6. `P-campaigns` → `D-camp-filters`.** Back to the list to act on what the report said.

### Issues

**M6-1. The CSV export is locked for a plan that includes it.** PLAN.md's plan table reads "reports: activity only / all plus CSV export / all plus CSV export and scheduled email" — CSV at **Growth**. The map's `X-export` gate column says "Growth / Scale", agreeing. Spec 12 says CSV export and the weekly email are both Scale, and `reports.ts` repeats it in `ctl.export-csv`'s note. Ridgeline is on Growth, so as specified Camille meets a lock on something she has paid for. This is worse than hiding a feature: it is a false gate, and it also mis-tells Halyard's story in the same file.

**M6-2. Unsubscribe and complaint rates are absent from Campaign results.** M6 requires reading them alongside the wins. `campaigns.ts` marks unsubscribed decision-critical on the Campaigns page, and the report that decides where next month's money goes drops it. Deciding to scale a campaign without its opt-out rate in view is the exact shape rule 7 forbids.

**M6-3. Sourced against influenced is the journey's currency and the report has one number.** Campaign results has "Pipeline created" and nothing that says which convention produced it. 17§11 records that sourced versus influenced is a convention, not a benchmark — so an unlabelled number is a claim with no method.

**M6-4. Conversion by persona is missing.** M6 reads conversion "by audience and persona rather than channel alone". The report has an audience breakdown (`det.audience`, 35–40 for the marketer) and no persona anywhere.

**M6-5. `D-camp-filters` is "More filters".** Same as M4-6.

**M6-6. "Brief the next round" and "decide what to stop" leave no trace.** A monthly reallocation that is not written down is re-argued next month. The campaign has Notes; nothing connects the decision to the campaign it retires.

**M6-7. The overview strip does not carry the marketer's second report.** The Ridgeline marketer's strip holds Campaign results only; `reports.ts` gives them Activity 12 and Pipeline 10, both below the band, so that is correct — no change. Recorded because it looked like a gap and is not.

### Decisions

- **M6-1.** PLAN.md's plan table is the decision of record and the map agrees with it. Spec 12 and `reports.ts` are wrong: **CSV export is included at Growth; only the scheduled weekly email is Scale.** Amend spec 12 §3 (the Export row, the plan paragraph and the by-role table), spec 12 §6 ("Locked rather than removed") and `ctl.export-csv`'s note. Halyard's ops lead, on Growth, exports rather than prints, so that paragraph is rewritten too — it belongs to an admin journey and the apply pass should expect the overlap. *The gated-features pattern rule 9 and rule 6: a lock never decides level, and a plan is never charged twice.*
- **M6-2.** Campaign results gains two columns and one tile: Unsubscribed (count and rate) and Complaints (count and rate), with the unsubscribe rate marked decision-critical and printed even where a report is locked, exactly as the bounce rate is on the Sequences report. *Rule 7, and the gated-features rule that safety items are on every plan.*
- **M6-3.** The Pipeline created tile prints its convention under the number, the way the weighted forecast prints "weighted by stage probability": "sourced · first touch within 90 days". Both numbers are shown — sourced and influenced, side by side, never a toggle that hides one — because the journey's first step is to compare them. The definition and the window live in the "How these numbers are counted" door together with the toggle that changes them. *Rule 7 (a number reported upward carries its method) and rule 5 (a definition and the control that changes it stay together).*
- **M6-4.** Add "Persona: n" as an expand-in-place under a campaign row, beside the existing audience breakdown, fed by the personas defined in `S-scoring`. One filter grammar, one definition, read in two places. *Map 6.4b: lists and audiences read the same persona and signal definitions from `S-scoring`.*
- **M6-5.** "Additional filters: owner, audience, date, goal (n)". *PLAN.md, 14 September.*
- **M6-6.** Retiring a campaign asks for one line and writes it to the campaign's Notes and to the report row: "Retired 30 Sep by Camille Dubois — 0.4% conversion against 2.1% on trial day 7". Archive keeps results; nothing is deleted. *Rule 7 (a destructive-shaped action states what it does) and rule 8 (the twice-yearly promote, keep or delete review needs a record to read).*
- **M6-7.** No change. Recorded so the next reviewer does not re-raise it.

### Score

**No.** One step the specs forgot and one they got wrong: **unsubscribe and complaint rates are missing from the report that decides where money goes**, and **the CSV export is locked on a plan that includes it**, so the journey's last step fails for the marketer it was written for.

---

## Reality check against the source rows

| Journey | Source | Does the flow match how the work is done? |
|---|---|---|
| M1 | 17§4 "suppression checks a non-negotiable part of campaign QA"; 16§3 | Order matches. The specs simplified in one place: they treat suppression as one number, and the source treats it as a checklist run every time. Fixed by M1-1 and M1-2. |
| M2 | 17§4 SLAs 5/10/15 days, "a builder should not QA their own work", 33% attendance, attended-to-pipeline 11.2% | Order matches; two steps were dropped. The QA reviewer's identity is in the source and in no spec (M2-1). The attendance split is where 11.2% of pipeline comes from and the specs have no path to it (M2-3). |
| M3 | 17§4 median method, threshold 40–80, the 80% test; 16§6 | Frequency matches (monthly, quarterly recalibration). The specs dropped the method entirely: no stamped score, no distribution preview, no threshold. The journey as written is unrunnable (M3-1, M3-2). |
| M4 | 17§4 2–4 hours for high intent, 47-hour average, sub-five-minute leads close 32% vs 12%; 18§8a | Frequency matches (daily, exceptions daily). Two simplifications: leave is not modelled, so the round robin the source describes cannot be built (M4-3); and the clock that the whole evidence base is about has no surface (M4-4). |
| M5 | 16§5 form builder, "Limit credit usage", automate follow-up; 16§23A | Frequency matches (daily at a PLG business). The specs have nothing at all, so "did a spec simplify it" does not apply — it was never written (M5-1). |
| M6 | 17§4; 16§10; 17§11 sourced vs influenced is a convention, not a benchmark | Frequency matches (monthly). One simplification with teeth: the source says the currency is a convention and the report prints it as a fact (M6-3). One error: the plan gate contradicts PLAN.md (M6-1). |

Two patterns across all six. First, **every stop the widened boundary created is missing below the map** — forms, workflows, scoring — and all three are marketer stops, which is why this group fails six for six while S1 passed. Second, **the marketer is the seat the specs have thought about least**: Tasks names them by name in its no-access state, Reports drops their opt-out numbers, People has no score filter, and the shell's sidebar is one entry short. None of that is a disclosure failure of the kind the rules catch; it is the map being ahead of the specs, exactly as the map's own 6.5 predicted.

---

## Change list

One row per change. Nothing here is edited by this walk; the apply pass makes them.

| # | File | Location | Current | New | Rule |
|---|---|---|---|---|---|
| 1 | `specs/10-campaigns.md` | §3 Campaign detail; §6 Doors table | Audience block shows "name, size, three suppressed counts" | Level one on the audience record: total size, net size after suppressions, and six counts on one line — unsubscribed and bounced marked "always applied", customers, open deals, closed-lost and in-sequence as the four choices | 7 |
| 2 | `IA-MAP.md` | 2.10, node `D-aud-suppress` | "Suppressions: customers, open deals, closed-lost, in sequence" | "Suppression rules: customers, open deals, closed-lost, in sequence (4 applied)" — the door holds the rules and the upload; the counts are level one on `R-audience` | 4, 7 |
| 3 | `src/ollopa/usage/campaigns.ts` | `aud.suppressed` | Label "Suppressed: unsubscribed, bounced, in an active sequence", weekly marketer 25 | Label "Suppressed: six counts — two always applied, four chosen", weekly marketer 45, Ridgeline 55, critical kept | 7, 1 |
| 4 | `specs/10-campaigns.md` | §3 Campaign detail, audience block | No live/frozen mode, no cadence | Level one beside the size: "Mode: live · refreshes daily 06:00 · new matches are added to {campaign} · Freeze", or "Frozen at n on {date}". Off is one click | 7, 5 |
| 5 | `src/ollopa/usage/campaigns.ts` | Audiences area, new item | — | `aud.mode` "Live or frozen, refresh cadence, and what it feeds", critical, marketer 45, Ridgeline 60 | 7 |
| 6 | `IA-MAP.md` | 2.12, node `X-report-records` parent | `P-reports` | `P-reports`, `R-audience` — one node, two parents, like `X-calllog`; every count on an audience opens it | 2 |
| 7 | `specs/10-campaigns.md` | §3 Audiences | Counts are text | Size, net size and each suppression count are links opening the records panel, titled by the number | 5 |
| 8 | `specs/13-agents.md` | §1, §2 kinds, §3 Activity | Three agents; kinds researched, drafted, scored, proposed, sent, paused | The research agent also proposes audience rule sets; logged, never queued; the proposal shows in the audience's rule builder as "Proposed by the research agent {date} · not applied" with Apply and Discard | 6 |
| 9 | `specs/10-campaigns.md` | §3 Campaign detail, Notes door | Notes | Notes is where the campaign brief lives; an audience shows "Built for: {campaign}" as a link | 2 |
| 10 | `IA-MAP.md` | 2.5, node `P-lists`, sidebar column | `FO, SEP, AG` | `FO, SEP, AG; PLG for the MK seat only` — a profile omission is declared per seat | 1 |
| 11 | `specs/00-shell-signin-palette-notifications.md` | §3 profile table, Product-led growth row | "Sequences for the account executive" | "Sequences for the account executive; Lists for the admin and the account executive. The marketer keeps Lists: segments are the marketer's daily work at a product-led business" | 1 |
| 12 | `specs/10-campaigns.md` | §3, new block; §6 Doors table | No QA anywhere | `X-qa`, a flat panel on the campaign record: eight checks, pass/fail/not run, each failure in words with a Fix link that navigates, and who ran it and when, saying so when the runner built the campaign | 4, 2 |
| 13 | `src/ollopa/usage/campaigns.ts` | New "QA" items | — | `camp.qa.run` marketer 55 (Ridgeline 60), `camp.qa.who` marketer 30, `camp.qa.failures` critical marketer 35 | 1, 7 |
| 14 | `specs/10-campaigns.md` | §3 Schedule dialog | Summary, suppressed counts, approval line | Add one line above the button: "QA: n checks failed — {names}. Run {time} by {person}", or "QA not run". Schedule is never disabled. The line travels with a request for approval | 4, 7 |
| 15 | `specs/10-campaigns.md` | §3 Campaign detail, under Results | — | For event and link-goal campaigns, one level-one line: "Build an audience from: attended n · did not attend n · hand-raisers n", each one click to a pre-filled audience | 1, 5 |
| 16 | `specs/10-campaigns.md` | §3 Audiences, actions | — | "Hand to sales" writes the people to a named sales-owned list and states the consequence before the click, naming the owner and saying nothing is sent. The marketer never reaches the enrol panel | 4 (seat gaps explain themselves) |
| 17 | `specs/10-campaigns.md` | §3 Schedule; §7 | The sender approves; threshold stated | One sentence: sender approves their own send; above the workspace threshold a second admin approval, named with the count before the button. A lifecycle campaign is measured on enrolment over the period, stated in the trigger block | 7 |
| 18 | `specs/10-campaigns.md` | §3 Campaign detail, Content | "rendered preview" | Desktop and 400 px previews side by side, not a menu | 5 |
| 19 | `specs/10-campaigns.md` | §3 Shown; §6 Decision-critical | Sending status shows the same columns as Sent | While Sending: sent-so-far against the total, the observed bounce rate against both thresholds, Pause the same size as Schedule | 7 |
| 20 | `specs/14-settings.md` | §2.2, §3, §4, §6 — new area between Sequences and Agents | No scoring area | `S-scoring`, "Signals, scoring and personas", seats OPS and MK, every plan. Level one: the primary score with its threshold and the share above it; score models with inputs; personas with sizes; signals with freshness. One door: "Retired signals, retired personas and archived models (n)" | 1, 7 |
| 21 | `IA-MAP.md` | 2.14, three new panels under `S-scoring` | `S-scoring` has no panels | Add `X-score` "Score model: inputs, weights, decay, distribution preview, publish"; `X-persona` "Persona: title, seniority, department, industry, size, geography"; `X-signal` "Signal: definition, source, freshness, talking tips". All level 2, own channel, flat | 2 |
| 22 | `src/ollopa/usage/settings.ts` | New "Signals, scoring and personas" area | — | About twelve items; threshold and the share above it critical; marketer 45–60, admin 25–35, Ridgeline marketer higher on signals, Meridian marketer higher on the threshold | 1, 7 |
| 23 | `specs/12-reports.md` | §3 Pipeline row door; §2 | Won drawer lists deal, company, amount, owner, closed on | Add "Score at first contact" for the marketer and admin seats, in the drawer and in its export. The score, the model version and the date are stamped when a person is routed and never recomputed | 7 |
| 24 | `specs/02-people.md` | §3 Filters table; §3 Saved views | 31 filters, none about score or persona | Add Score (bands with counts, plus "above the MQL threshold") to Reach and Persona to Person; door label becomes "All filters (33)"; seed the Meridian marketer a view "Above the MQL threshold" | 1 |
| 25 | `src/ollopa/usage/people.ts` | Filters and Columns areas | No score items | `people.f.score` marketer 55, sdr 30, ae 25; `people.col.score` marketer 45, sdr 25; `people.f.persona` marketer 35 | 1 |
| 26 | `specs/14-settings.md` | §3, `X-score` | — | Publish states the consequence above the button: the old and new thresholds, how many are above each today, how many already routed are unaffected, and that it applies to new leads only. Grandfathering is a radio pair with a count on each option | 7 |
| 27 | `specs/14-settings.md` and `specs/00-...md` | `X-score`; §3.4 Slack events | Five Slack event kinds | Publishing writes "Threshold n, published {date} by {person}" beside the Score filter on People; Slack gains a sixth kind, "scoring threshold published", off by default | 6, 8 |
| 28 | `specs/14-settings.md` | `X-score` distribution preview | — | Print the share above the threshold with its source beside it: "68% of people score above 62. Above 80% the threshold is not doing work (17§4)" | Score point 2 |
| 29 | `IA-MAP.md` | Part 5, Marketer, M4 | `… ─LK→ S-scoring ─LK→ X-territory ─LK→ P-tasks ─DR→ D-task-filters` | `… ─LK→ S-scoring ─LK→ R-workflow (rule row) ─DR→ D-wf-runs (exceptions)`. The named-account override is named in the rule row with its owner and count, never opened by a marketer | 4 |
| 30 | `IA-MAP.md` | 2.8 `P-tasks`, `D-task-filters`; 2.14 `X-territory` — journeys column | M4 listed | Remove M4 | 4 |
| 31 | `specs/17-workflows.md` | New file | Does not exist | Spec for `P-workflows`, `R-workflow`, `D-wf-runs`: seats OPS and MK, Growth-gated with the lock at the entry point, level-one trigger, enrolment, rules, actions, credit ceiling, SLA block, run history door | Map 6.5 |
| 32 | `src/ollopa/usage/model.ts` and `index.ts` | `Page` union; imports | No "workflows" | Add `workflows` to `Page`; add `workflows.ts` and register it in `allItems` | Score point 2 |
| 33 | `src/ollopa/usage/workflows.ts` | New file | — | Items for the workflow table, record, SLA block and run history; marketer and admin numbers, Meridian marketer high on routing, Ridgeline marketer high on forms | 1 |
| 34 | `specs/14-settings.md` | §2.2 Team fields; §3 users table; `X-user` | status, credit limit, credits used, last active | Add availability: Available, or Away until a date, set by the person or the admin, read by every routing rule | 7 |
| 35 | `specs/17-workflows.md` | Record, level one | — | The SLA: window per lead heat, running count, breached today, and the reassignment rule in words. Elapsed time in text, never colour alone. The rule row prints "Weighted round robin across n reps · m away until {date} · skipped" | 7, 1 |
| 36 | `specs/17-workflows.md` | `D-wf-runs` | "Run history and enrolment · n" | Two named sections inside the one door: "Enrolled (n)" and "Could not route (n)", each exception row carrying its reason and a link to the rule. The sections are not doors | 2 |
| 37 | `specs/07-tasks.md` and `IA-MAP.md` 2.8 | `D-task-filters` label | "More filters: source, status, sort" | "Additional filters: source, status, sort (n)" | 4, PLAN 14 Sep |
| 38 | `specs/10-campaigns.md` and `IA-MAP.md` 2.10 | `D-camp-filters` label | "More filters: owner, audience, date, goal" | "Additional filters: owner, audience, date, goal (n)" | 4, PLAN 14 Sep |
| 39 | `specs/01-home.md` and `src/ollopa/usage/home.ts` | §3.1 Campaigns section | Campaigns running, results, audiences door | Add two marketer lines in the same section: "Routing: n leads today · n past the SLA window · n could not be routed" and "Forms: n submissions today · n could not be routed · enrichment n of n credits". Items `home.campaigns.routing` (Meridian marketer 65) and `home.campaigns.forms` (Ridgeline marketer 80, critical on the credit figure) | 1, 7 |
| 40 | `specs/10-campaigns.md` | §1, §3 Shown, §3 States, §6 | "Campaigns 12 · Audiences 6" | "Campaigns 12 · Audiences 6 · Forms 4". Forms row: Form, Status, Submissions 7 days, Enrichment spend against the cap, Routes to, Reports to, Last submission. An `R-form` record section: fields, enrichment, routing, reporting, states, phone width | Map 2.10 |
| 41 | `specs/10-campaigns.md` and `src/ollopa/usage/campaigns.ts` | Forms row and `R-form` header | — | Level one and decision-critical: "Enrichment cap n credits a day · m used today · x of y submissions matched". Items `form.cap` (critical, Ridgeline marketer 75), `form.submissions` (Ridgeline marketer 90), `form.unrouted` (critical, 45) | 7 |
| 42 | `IA-MAP.md` | Part 5, Marketer, M5 | `… ─LK→ R-workflow ─LK→ P-tasks ─LK→ R-campaign` | `… ─LK→ R-workflow ─DR→ D-wf-runs ─LK→ R-campaign`; remove M5 from `P-tasks` | 4 |
| 43 | `specs/10-campaigns.md` | `R-form`, field editor | — | A field already known for a returning visitor is removed, not pre-filled invisibly, and the form tells the visitor in one line. The editor marks each field "asked" or "enriched (n credits)" | 4, 7 |
| 44 | `specs/10-campaigns.md` | `R-form`, cap behaviour | — | At the cap, enrichment stops and submissions are still accepted and routed, marked "not enriched — daily cap reached {time}" on the person and the run row, with "Raise the cap" beside it | 7 |
| 45 | `specs/02-people.md` | §3, contact record block | Form answers unspecified | The submission's answers are a note titled "Form: {name}, {date}", shown at level one on the contact while the stage is pre-first-touch, not behind the history door | 5 |
| 46 | `specs/12-reports.md` | §3 Export row; §3 plan paragraph; §3 by-role table; §6 "Locked rather than removed" | CSV export and the weekly email are both Scale | CSV export is included at Growth; only the scheduled weekly email is Scale. Ridgeline's marketer and Halyard's ops lead export rather than meet a lock; rewrite Halyard's consequence paragraph accordingly | PLAN plan table; gated-features 9 |
| 47 | `src/ollopa/usage/reports.ts` | `ctl.export-csv` note | "Scale only… Halyard would use it weekly and cannot" | "Growth and above. Halyard's weekly client report leaves as a CSV; only the scheduled weekly email is Scale." Raise Halyard admin to 55 and Ridgeline marketer to 25 | 1 |
| 48 | `specs/12-reports.md` and `src/ollopa/usage/reports.ts` | Campaign results table and tiles | sent, opened, replied, deals, pipeline, status | Add Unsubscribed (count and rate, critical) and Complaints (count and rate) as columns and a tile; the unsubscribe rate prints even where a report is locked | 7 |
| 49 | `specs/12-reports.md` | Campaign results tiles; "How these numbers are counted" | "Pipeline created" | Show sourced and influenced side by side, each printing its convention under the number ("sourced · first touch within 90 days"). The definition and the window that changes it live together in the definitions door | 7, 5 |
| 50 | `specs/12-reports.md` and `src/ollopa/usage/reports.ts` | Campaign results row doors | "Audience: n segments" | Add "Persona: n" expanding in place beside it, reading the personas defined in `S-scoring`. Item `det.persona`, marketer 30, Ridgeline 35 | Map 6.4b |
| 51 | `specs/10-campaigns.md` | §3 Row actions, Archive | "Archive" | Archiving a campaign asks for one line and writes it to the campaign's Notes and to the report row: "Retired {date} by {person} — {reason}". Results are kept | 7, 8 |
| 52 | `specs/00-shell-signin-palette-notifications.md` | §3 sidebar table, Marketer row; keyboard | "Home · People, Lists · Campaigns · Reports, Agents, Settings"; no `g w` | "Home · People, Lists · Campaigns, Workflows · Reports, Agents, Settings"; add `g w` for Workflows | Map 6.4g |

---

## What the apply pass should know

- Rows 29, 30, 42 and the `P-tasks` rows are one decision applied three times: **the marketer never lands on Tasks.** If any one of them is dropped, two journeys end on a no-access page.
- Rows 46 and 47 change a paragraph and a note that belong to an admin journey (Halyard's ops lead). They are the same lines, so they are listed here rather than left for the admin group to find in conflict.
- Rows 20, 21 and 22 create the scoring area three journeys need (M3, M4, and C3, C5 and G3 outside this group). The customer-success and agent walks should be expected to want the same node and should not create a second one.
- Rows 31, 32 and 33 create the workflows spec and its usage file. The RevOps walk needs the same file for O9 and should extend it rather than duplicate it.
- No row below adds a door inside a door, moves a locked feature, or introduces an audience label. The three panel additions in row 21 are each a separate channel, which is how `S-pipeline` already holds `X-field`.
