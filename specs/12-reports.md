# Reports

*A "real" page. Five fixed reports, not a report builder. Breakdown tables come from the table template, with a tile row and one chart above them.*

## 1. Purpose

Reports is where a leader checks how the team is doing, where a seller commits to a number, and where the one figure that needs a conversation is found. Five fixed reports: **Activity** (emails, calls, meetings booked, tasks done, by rep), **Pipeline** (created, won, lost, open by stage, weighted pipeline), **Sequences** (sent, replied, bounced, by sequence and by step), **Campaign results** (sent, opened, replied, unsubscribed, pipeline sourced and influenced, by campaign and by audience) and **Forecast** (every deal in the period by category, the goal as the denominator, the predicted number beside the submitted one, and the submission itself). One date range and one team filter apply to all five. What is on screen can be printed on any plan and exported as a CSV on Growth and above; the scheduled weekly email is Scale.

Who lives here: the RevOps admin (weekly ops review and the forecast process), the account executive (the forecast and the pipeline call, weekly), the **account executive with direct reports** — the sales leader, who is an AE seat with `reports > 0` and no sixth seat (IA-MAP 6.4j) — the marketer (campaign results, most days), customer success (the renewal book and its expansion upside, weekly). Founders at Fathom Labs and the ops lead at Halyard are admins and use it as leaders do; at Halyard it is also the client report, every week, ten times over. The SDR has no Reports entry; their numbers live on Sequences and Home.

**Forecast is the fifth tab and not a sixth page.** Three journeys submit a number — the AE, the AE with reports, and the CSM reading renewals — and one node serves all three, at the seat's own position in the hierarchy (IA-MAP 6.4d). On this page **Forecast means the number a person submitted**; the Pipeline report's arithmetic is called **Weighted pipeline**, because one word may not mean two things on one page.

The one thing they must never lose sight of: **the overview is the content**. Shneiderman's mantra, "overview first, zoom and filter, then details on demand", is a disclosure sequence for data, and the knowledge base warns that collapsing the overview to "simplify" removes the step that makes drill-down possible (00-core-model §4, §8.2). The headline numbers are always on screen. What is disclosed is the record-level detail behind them, never the numbers themselves.

## 2. Data

Sources are `src/ollopa/data/seed.ts` and `businesses.ts`. The seed's fixed "today" is 13 September 2026.

| Field | Where shown | Source | To add to seed |
|---|---|---|---|
| Rep name, role, team | By-rep tables, team and person filters | `businesses.roles`: 2–5 demo users; Meridian has 42 | `users: User[]` per business to `counts.users` (cap 42): name, role, team. Teams: Meridian = Sales development, AE East, AE West, Customer success, Marketing; Ridgeline = Inbound, Expansion, Customer success, Lifecycle marketing; Fathom and Halyard = none |
| Emails, calls, meetings booked, tasks done, per rep per week | Activity tiles, trend, table, drawer | none | `activityEvents`: kind (email, call, meeting, task), user, contact, company, date; 13 weeks, about 25 per user per week. "Meeting booked" = a contact moved to stage "Meeting booked"; Ollopa has no booking tool |
| Deals created, won, lost, open, by stage and rep | Pipeline tiles, tables, drawer | `deals`: open deals with `stage`, `amount`, `probability`, `closeDate`, `owner`. Five stages, defined in spec 09 and listed in Settings: Qualified, Discovery, Proposal, Negotiation, Closed won | `createdDate`, `closedDate`, and the archive fields spec 09 defines (`archivedOn`, `lostReason`: price, timing, competitor, no decision, other); 13 weeks of closed deals, about 1.5× the open count. Ollopa has no "Closed lost" stage and no outcome flag (PLAN.md, 13 Sep 2026): **won** means the deal reached Closed won, **lost** means it was archived, and the Lost tile says so in words under the number |
| Weighted pipeline | Pipeline tile | `amount × probability`, open deals closing in range | nothing; the method is printed on the tile. Renamed from "Weighted forecast": on this page Forecast is the submitted commitment |
| Stage-to-stage conversion | Pipeline door | none | `stageHistory: { dealId, stage, enteredOn }[]` |
| Sequence sent, delivered, replied, bounced, rates | Sequences tiles and table | `sequences`: `active`, `replied`, `bounced`, `steps` (a count) | `sent`, `delivered`, `stepStats: { n, kind, sent, delivered, opened, replied, bounced }[]`, weekly `series` |
| Bounce rate against the bounce guard | Sequences tile | The one pair for the whole product, owned by the Settings item `mail.bounce-guard`: warns at 4%, pauses at 6% | the observed 7-day rate and volume per business, from the `settings` seed in spec 14: Meridian 1.9% of 14,200, Fathom 3.6% of 620, Halyard 4.4% of 9,800, Ridgeline 0.8% of 410. Reports stores no threshold of its own and prints the same two numbers as every other page |
| Campaign name, kind, audience, sent, opened, replied, deals, pipeline | Campaign tiles, table, audience door | `campaigns` and `audiences`, the two entities spec 10 defines and owns: `name`, `kind` (Email or Lifecycle), `status`, `owner`, `audienceId`, `audienceSize`, `sent`, `delivered`, `opened`, `clicked`, `replied`, `converted`, `unsubscribed`, `goal` | two fields, added to spec 10's `Campaign` and to nothing else: `dealsCreated` and `pipelineAmount`. Reports does not define a `channel`, does not redefine the entity, and reads the audience breakdown from spec 10's `Audience` (`name`, `type`, `size`, `sources[]`). Meridian 12 campaigns and 6 audiences, Ridgeline 8 and 5, Fathom and Halyard none |
| Forecast category per deal | Forecast tab, roll-up, records drawer | none | `Deal.forecastCategory`: Omitted, Pipeline, Best case, Commit, Closed. Five, owned by Settings (`pipe.forecast-categories`) and read here; the definition text is owned there too |
| The goal for the period, per user and per team | Forecast tab, as the denominator | none | `goals[]`: `{ period, userId?, teamId?, amount }`. A goal is an attribute, not an object (IA-MAP 6.3); set in Settings › Pipeline and data beside the forecast categories |
| The submission deadline | Forecast tab | none | `settings.pipeline.submissionWindow`: `{ day: "Friday", time: "16:00", opensOn: "Wednesday" }` |
| Submissions: period, number, split by category, judgement note, submitted at, by whom | Forecast tab, `X-forecast` | none | `forecastSubmissions[]`: one per person per period, kept for ever. Three past periods seeded so "last cycle's call beside what happened" has data |
| The predicted number, and the deals driving the difference | Forecast tab, `X-forecast` | none | `forecastPrediction`: `{ period, userId, amount, drivers: dealId[] }`, one per person per period. No agent writes a submission; the prediction is a number beside the person's, never in place of it |
| Win rate and the coverage it requires | Pipeline door, and the Deals board strip | computed from closed deals in range | nothing; required coverage is 1 ÷ win rate (`19-revops-and-developer-notes.md` §4.5) and is computed once, here, and read by spec 08 |
| Score at first contact | Pipeline report's Won drawer and its export | none | `Deal.scoreAtFirstContact`: `{ score, modelVersion, stampedOn }`, written when a person is routed and never recomputed |
| Unsubscribed and complaints per campaign | Campaign results tiles and table | `campaigns.unsubscribed` (exists, spec 10) | `Campaign.complaints`, a count |
| Pipeline sourced and influenced | Campaign results tiles and table | `Campaign.dealsCreated`, `pipelineAmount` (added by this spec to spec 10's entity) | `Campaign.pipelineInfluenced`, and the two conventions as constants: sourced = first touch within 90 days, influenced = any touch within the window |
| Personas per campaign audience | Campaign results row door | none | read from Settings › Signals, scoring and personas (`S-scoring`); Reports defines no persona of its own |
| Calls logged, and calls with a coaching note in the last 30 days | Activity table and the records drawer | none | `calls[]` from spec 07's `X-calllog` (purpose, disposition, duration, notes) with `coachingNote?: { by, at, wentWell, toChange, nextWeek }`; 13 weeks, about 12 per SDR per week at Meridian |
| Data as of | Control bar | none | a constant per seed: "Data as of 13 Sep 2026, 08:00; refreshes hourly" |

All numbers are computed at render from these rows, so the four reports and every drawer agree. Apollo's "metric availability varies by analytics surface" (§5) is what happens when they are not.

## 3. Features

### Layout

One page, `/reports/:report`. A control bar: report tabs (Activity, Pipeline, Sequences, Campaign results, Forecast), date range, team, person, the compare toggle where the role's use puts it at level one, Export, Print, the line "Exports and prints spend no credits", and "Data as of 13 Sep 2026, 08:00". The no-credits line is a fee statement, so it sits on the bar in plain sight and not inside the Export menu (rule 7). Below: a **tile row** (four or five headline numbers, with the change against the previous period when compare is on), **one chart** (weekly trend for the range), **one breakdown table** on `TablePage`. On arrival an **overview strip** shows the tile row of every report the role uses (§6), each with "Open the Pipeline report".

| Report | Tiles | Chart | Table rows | Row door (level two) |
|---|---|---|---|---|
| Activity | Emails sent, Calls made, Meetings booked, Tasks done; for a seat with reports, also **Reps coached this week · 3 of 8** | Four series by week | One per rep: the four counts, tasks overdue; for a seat with reports, also **Calls logged** and **Calls with a coaching note (30 days)** | "312 emails" and "84 calls" open the records drawer |
| Pipeline | Created, Won (reached Closed won), Lost (archived), Open pipeline, Weighted pipeline | Created vs won amount by week | By stage (default) or by rep, switched at level one: count, amount, average age. Five stages, no Closed lost column | "14 deals" opens the drawer; "Stage-to-stage conversion" (whose last line reads "Win rate 20% · needs 5.0x coverage") and "Lost reasons: 5" expand in place |
| Sequences | Sent, Delivered, Reply rate, Bounce rate | Sent and replied by week | One per sequence: sent, delivered, opened, replied, bounced, both rates, status | "Steps: 5" expands in place; "Open sequence" navigates |
| Campaign results | Sent, Opened, Replied, **Unsubscribed** (count and rate), Pipeline **sourced** and **influenced** side by side | Sent and replied by week | One per campaign: kind (Email or Lifecycle), audience, sent, opened, replied, unsubscribed and its rate, complaints and its rate, deals, sourced, influenced, status | "Audience: 4 segments" and "Persona: 3" each expand in place; "22 deals" opens the drawer |
| Forecast | The five categories as count and sum; the goal for the period with attainment; the predicted number beside the submitted one; the deadline | Submitted against goal, by period | One per deal: company, amount, close date, category, next step, owner, risk. For a seat with reports, one row per rep with submitted-or-not and when, drilling to that rep's deals | "3 deals move the difference" opens the drawer sorted by category then risk |

### Actions

| Action | Where | Outcome |
|---|---|---|
| Switch report | Tab, or keys 1–5 | URL changes; filters carry over |
| Date range | Select: This week, Last 7 days, Last 30 days, **This month, Last month**, This quarter, Last quarter, Last 90 days, This year; "Custom range" opens two date fields inside the same menu | Everything recomputes; range is in the URL and remembered. A monthly quota period needs a monthly range |
| Team, Person | Selects; Person lists the chosen team's members | Recompute; a chip "AE East · Elena Vasquez" states what is applied |
| Compare with previous period | Toggle | Tiles show the delta; chart adds a dotted previous-period line |
| Export | Menu: "This table (18 rows)", "Records behind this table", "Copy link with these filters", "Email me this report every Monday" | CSV downloads at once, filters applied, header row names the range. On **Starter** the two CSV lines carry a lock and the plan name; the weekly email carries a lock on Starter and Growth. The rule, owned by spec 14's plan table: exporting a table a seat can already read is on every plan, exporting a report is Growth, scheduled delivery is Scale |
| Submit a forecast | Forecast tab, "Submit your forecast" | Opens `X-forecast`. Submitting writes the period, the number, the split, the note and the time, and tells the people the consequence sentence names |
| Read the fee line | On the control bar, beside Export | Nothing to click: "Exports and prints spend no credits" states the fee before the decision is made, not inside the menu where the decision is confirmed |
| Print or save as PDF | Button | Print stylesheet: every door expanded, filters as a caption, no control bar |
| Choose columns | Table button "Columns: 7 of 10" | Persisted per report |
| Row door | Link in the cell, chevron and count | Drawer or in-place expansion |
| Open record | Link in the drawer | Navigates to the deal, sequence or campaign; Back returns with the drawer open |
| Sort | Column headers | Persisted per report |

No bulk actions; nothing here changes data.

**The records drawer** opens from any count. Its title names the number: "14 deals won, AE East, last 30 days". First section: that row week by week. Second: the records as a table with "Export these 14 rows" and "Open" per row. The record kinds are **deals, sequences, campaigns, people and calls**; a call row shows purpose, disposition, duration and whether it carries a coaching note, and opens the call. On the Pipeline report's Won drawer the columns are deal, company, amount, owner, closed on and — for the marketer and admin seats — **score at first contact**, which is in the export too. On the **Forecast** tab the records sort by forecast category and then by risk, not by amount, and the drawer says so in its subtitle. Closing returns focus to the cell that opened it. One drawer at a time.

**The Forecast tab.** Level one, in this order:

1. **The period, the deadline and the scope chip.** "Q4 · submit by Friday 16:00 · Scope: your deals" — or "Scope: AE East (8 reps)" for a seat with reports, or "Scope: your renewal book" for a CSM. The roll-up sits at the seat's own position in the hierarchy: an AE sees their own deals; an AE with direct reports sees the team roll-up first and drills to one rep; a CSM sees renewal-typed deals grouped **Renewal base** and **Expansion upside**, with separate totals.
2. **The five categories**, each as a count and a sum, and each with **its definition printed as text under its label**: "Commit — about a 90% number. You would be surprised to lose it." Never a tooltip: the FTC's 2022 dark-patterns report names a tooltip as the mechanism of a deceptive act, and a category definition is what the commitment means.
3. **The goal for the period as the denominator**, with attainment: "$412,000 of $600,000 · 69%". The goal is set in Settings › Pipeline and data, per period, per user or team.
4. **The predicted number beside the submitted one**, with the deals driving the difference as a link: "You: $340,000 · Predicted: $298,000 · 3 deals move the difference". Beside, never instead. Under the pair, one line: **"No agent submits a forecast."**
5. **Last submission**, with its date and the delta since: "Submitted $325,000 on 6 Sep · +$15,000".
6. **The submissions strip** for this period, for a seat that has reports or is the admin: who has submitted and when, and who has not.
7. The table of deals, and the button, "Submit your forecast".

**`X-forecast`, "Submit your forecast".** A panel, flat, no doors. A row per category: the roll-up on the left, an adjustment field beside it, and the last submitted value beside that, so the three numbers are read together. The adjustment is the person's number and **never alters the underlying roll-up**; both are shown afterwards. Then the judgement note. Then the submission-changes history — what changed since last time and who changed it. Then one button carrying its consequence: "Submit $340,000 for Q4 · Priya Raman and Daniel Okafor see it · you can resubmit until Friday 16:00". The panel opens with **last cycle's call beside what actually happened** ("You called $310,000. It closed at $284,000."), because a forecast with no memory teaches nobody anything. For a seat with reports the team roll-up is first and the rep rows are under it. No agent ever submits.

**Filters and search.** The three filters above. No free-text search: tables have at most 42 rows (reps), 26 (sequences), 12 (campaigns) or 5 (stages), so `TablePage`'s search box is hidden.

### States

| State | What the page shows |
|---|---|
| Loading | Tiles and table keep their layout with placeholder bars; the control bar works |
| Empty range | Tiles show 0; the table says "Nothing in this range" with "Show last 90 days"; a zero is not a link, so there is no door |
| A real zero | Ridgeline's Sequences report: two sequences, 0 sent this period. Data, shown as data |
| Error | Last numbers stay, with "Could not refresh; showing data as of 13 Sep, 08:00. Retry" |
| No access | An SDR at `/reports`: "Reports is for account executives, marketers, customer success and admins. Your sequence numbers are on Sequences and today's activity is on Home. Daniel Okafor (RevOps admin) can give you access." |
| Restricted scope | An AE at Meridian with no reports: the team select is replaced by "AE East (your team). Daniel Okafor can widen this." An AE **with** reports gets a working team select fixed to her own team, and the person filter promoted beside it: scope is the whole reason she is on the page |
| Locked report | Fathom, on Starter: the Pipeline and Sequences tabs sit where they always sit, with a lock and the word Growth. Opening one shows the report's shape — the tile labels, the chart frame, "18 rows" — with the numbers that are never gated printed in full (weighted pipeline, bounce rate against the guard, the unsubscribe rate), and one panel: what the report does, that it is on Growth, one total for the period — "$237 a month for your 3 seats", never a per-seat breakdown (gated-features pattern rule 4) — and one button. Nothing is greyed out and nothing has moved |
| Forecast on Starter | The tab is **not** locked: a submitted forecast is a commitment, and decision-critical items are on every plan (gated-features pattern rule 6). The categories, the goal, the predicted pair and Submit all work. The **team roll-up** carries the lock and the plan name, because teams are a Growth feature and there is no team to roll up on Starter |
| Forecast not yet submitted, past the deadline | "Not submitted · deadline was Friday 16:00". The button still works; nothing is closed off, and the submissions strip shows the gap to whoever reads it |

### Keyboard, accessibility, phone

Tab order: tabs, range, team, person, compare, export, print, tiles (each a link to its records), table; the chart is skipped and carries `aria-describedby` to a sentence ("Emails sent rose from 1,240 to 1,610 over 13 weeks"). Keys: 1–5 reports, D range, T team, E export, P print, ? lists them; arrows move through the table, Enter opens a row door, Escape closes the drawer and returns focus. Cmd+K, the global palette, lists every action with its key.

Every door is a `button` with `aria-expanded` and a visible label with a count. Deltas use text and an arrow, not colour alone. The bounce tile at or over the threshold adds "over threshold" in words. Reduced motion: crossfade.

At phone width the control bar wraps to two rows, tabs scroll sideways, tiles go two per row, the table keeps a sticky first column and scrolls inside its own container, the drawer becomes a full-height sheet. Every one-click door on desktop is one tap on the phone.

### By role and by business

| | Default report | In the overview strip | Removed, not disabled | Locked by plan |
|---|---|---|---|---|
| Meridian admin | Activity | Activity, Pipeline, Sequences, Forecast | nothing | nothing; Meridian is on Scale |
| Meridian AE | Forecast in the submission window, Pipeline otherwise | Pipeline, Forecast | Team select (fixed to own team) | nothing |
| Meridian AE with reports | Forecast | Forecast, Pipeline, Activity | nothing; the team select is a working control | nothing |
| Meridian marketer | Campaign results | Campaign results | Forecast tab | nothing |
| Meridian CS | Forecast (the renewal book) | Forecast, Pipeline | nothing | nothing |
| Fathom founder (admin) | Activity | Activity, Forecast, plus the locked Pipeline and Sequences tiles | Campaign results tab, Team select | Pipeline, Sequences (Starter); the CSV lines and the weekly email (Starter); the Forecast **team roll-up** only |
| Halyard ops lead (admin) | Activity | Activity, Sequences | Campaign results tab, Team select (the workspace is the client), Forecast (no AE or CS seat here, and the admin's own pipeline is small) | the scheduled weekly email only (Scale). **Growth includes CSV export, so the weekly client report leaves as a CSV** |
| Ridgeline marketer | Campaign results | Campaign results | Forecast tab | the scheduled weekly email (Scale) |
| Ridgeline CS, AE | Forecast | Forecast, Pipeline (CS also Activity) | nothing | as above |
| Ridgeline admin | Pipeline | Pipeline, Activity, Campaign results, Forecast | nothing; two sequences are real data | as above |

**What each plan includes** (the table is owned by spec 14; Reports renders its "reports" row). Starter: the Activity report, and the Forecast tab without its team roll-up. Growth: all five reports, plus CSV export. Scale: all five, plus CSV export and the scheduled weekly email. That is PLAN.md's plan table read straight, and spec 14 states the owning rule once for the whole product: **exporting a table a seat can already read is on every plan; exporting a report is Growth; scheduled delivery is Scale.** Reports, Tasks and the CLI all render it.

Three rules hold wherever a lock appears. The lock sits at the entry point — on the tab, on the Export control — and never after a person has set a range, picked a team and read the numbers, because charging for the exit from work already done is drip pricing (gated-features pattern rule 7). Safety and decision-critical numbers are on every plan, so a locked Pipeline report still prints the weighted pipeline, a locked Sequences report still prints the bounce rate and the guard's two thresholds, a locked Campaign results report still prints the unsubscribe rate, and the Forecast tab is never locked as a tab at all (pattern rule 6). And a lock does not promote or demote anything: level one is still decided by the weekly numbers in §4 (pattern rule 9).

## 4. Usage items

Share of active users in a role touching the item in a typical week. Baseline is Meridian; overrides per business (Fa, Ha, Ri). Fitted to the shape in USAGE-MODEL.md (Nielsen 80/20, Pendo 6%, McGrenere and Moore). No SDR column: no access. **AE+** is an AE seat with direct reports — a seat modifier, not a seat: no business declares a sixth one, and an item carries an AE+ number only where the leader's week differs from the AE's (`UsageRole` in `model.ts`, USAGE-MODEL.md). **DC** = decision-critical, level one regardless. Same table in code: `src/ollopa/usage/reports.ts`.

| Item | AE | AE+ | Mkt | CS | Admin | Overrides | Note |
|---|---|---|---|---|---|---|---|
| Overview strip | 45 | 45 | 55 | 30 | 60 | Fa 55; Ha 70; Ri ae 35, mkt 60, cs 45, admin 50 | The visit itself |
| Activity report | 8 | 8 | 12 | 10 | 45 | Fa 55; Ha 65; Ri cs 20, admin 30 | The only report Starter includes |
| Pipeline report | 45 | 45 | 10 | 22 | 40 | Fa 8; Ha 15; Ri ae 35, cs 40 | Ridgeline renewals are deals; locked at Fathom, which reads the board on Deals |
| Sequences report | 4 | 4 | 4 | 1 | 25 | Fa 6; Ha 65; Ri admin 4, mkt 2 | Locked at Fathom; step numbers are on Sequences |
| Campaign results | 2 | 2 | 55 | 4 | 12 | Fa 0; Ha 0; Ri mkt 60, cs 12, admin 22 | Removed where 0 |
| Date range presets | 35 | 35 | 50 | 22 | 55 | Fa 50; Ha 65 | |
| Custom date range | 4 | 4 | 12 | 3 | 8 | Ha 18 | Client billing periods |
| Team filter | 10 | **55** | 18 | 6 | 40 | Fa 0; Ha 0; Ri admin 30 | Removed where 0. A working control for a leader, a sentence for a scoped AE |
| Person filter | 15 | **40** | 4 | 12 | 18 | Fa 35; Ha 50 | Small teams look at people; so does a leader, every week |
| Compare with previous period | 15 | 15 | 30 | 8 | 15 | Ri mkt 35 | In the range menu when under 20 |
| Export CSV | 6 | 6 | 22 | 5 | 25 | Fa 2; **Ha 45**; Ri mkt 25 | Growth and above. Halyard is on Growth, so the weekly client report leaves as a CSV |
| Exports and prints spend no credits **DC** | 4 | 4 | 12 | 3 | 12 | Fa 3; Ha 25; Ri mkt 8 | The fee statement, on the bar beside Export |
| Print or save as PDF | 2 | 2 | 8 | 2 | 4 | Ha 20 | Never gated. Halyard prints for a client who wants paper; the report itself leaves as a CSV |
| Copy link with filters | 4 | 4 | 12 | 3 | 10 | Ha 15 | |
| Email this report weekly | 1 | 1 | 4 | 1 | 4 | Fa 1; Ha 3 | Scale only — the one thing on this page that is |
| Choose columns | 2 | 2 | 3 | 2 | 4 | | |
| Chart or table for the trend | 2 | 2 | 4 | 2 | 4 | | |
| Time grain | 2 | 2 | 4 | 2 | 4 | | |
| Records behind a number | 30 | 30 | 18 | 18 | 30 | Ha 40; Ri cs 30 | The main door |
| Week by week for one row | 8 | 8 | 10 | 5 | 8 | | First section of the drawer |
| Open the record from the drawer | 18 | 18 | 4 | 10 | 4 | | Navigation, not a level |
| Step by step for a sequence | 2 | 2 | 3 | 1 | 18 | Fa 4; Ha 55; Ri admin 2 | Apollo's documented gap; inside the locked report at Fathom |
| Audience breakdown for a campaign | 1 | 1 | 35 | 2 | 3 | Fa 0; Ha 0; Ri mkt 40 | |
| How these numbers are counted | 4 | 4 | 4 | 4 | 4 | | Definitions door |
| Weighted pipeline **DC** | 45 | 45 | 4 | 12 | 35 | Ha 10; Ri ae 35, cs 30 | Method on the tile. Renamed: on this page Forecast means the submitted number |
| By stage or by rep switch | 25 | 25 | 4 | 12 | 18 | | |
| Stage-to-stage conversion | 10 | 10 | 3 | 3 | 12 | | Its last line is the coverage figure below |
| Lost reasons | 8 | 8 | 3 | 6 | 8 | Ri cs 15 | |
| Unweighted pipeline toggle | 3 | 3 | 1 | 2 | 4 | | |
| Win rate and the coverage it requires | 12 | **55** | 3 | 4 | 12 | Fa 4; Ha 6; Ri ae 10, cs 5, admin 10 | Required coverage = 1 ÷ win rate (19§4.5); computed once here and read by the Deals board strip |
| Score at first contact | 3 | 3 | 15 | 2 | 12 | Fa 3; Ha 3; Ri mkt 18, admin 14 | In the Won drawer and its export; stamped with the model version, never recomputed |
| This month and Last month | 15 | 18 | 18 | 12 | 18 | Fa 25; Ha 40; Ri mkt 18, cs 12, admin 15 | A monthly quota is read on a monthly range |
| Calls as a record kind in the drawer | 6 | 40 | 1 | 3 | 4 | Fa 12; Ha 15; Ri admin 4 | |
| Persona: n, beside the audience breakdown | 1 | 1 | 30 | 2 | 4 | Fa 0; Ha 0; Ri mkt 35, admin 5 | Reads the personas defined in Settings › Signals, scoring and personas |
| Unsubscribed: count and rate **DC** | 2 | 2 | 45 | 2 | 18 | Fa 0; Ha 0; Ri mkt 50, admin 20 | Safety state for a sending product; prints even where the report is locked |
| Complaints: count and rate | 1 | 1 | 15 | 1 | 6 | Fa 0; Ha 0; Ri mkt 18, admin 8 | |
| Sourced and influenced side by side, each with its convention | 4 | 4 | 40 | 3 | 10 | Fa 0; Ha 0; Ri mkt 45, admin 12 | The definition and the window that changes it live in the definitions door |
| Calls logged per rep | 4 | **45** | 2 | 3 | 12 | Fa 18; Ha 25; Ri admin 6 | |
| Calls with a coaching note (30 days) | 3 | **60** | 1 | 2 | 4 | Fa 6; Ha 8; Ri admin 3 | The note lives inside the call (spec 07); this is the count of calls that have one |
| Reps coached this week · 3 of 8 | 1 | **55** | 1 | 1 | 3 | Fa 4; Ha 6; Ri admin 2 | A tile, and the leader's own adherence number rather than the team's |
| The Forecast tab | 65 | 85 | – | 30 | 30 | Fa 8; Ha 8; Ri ae 50, cs 45, admin 26 | Removed for the marketer seat |
| The five categories as count and sum | 70 | 80 | – | 35 | 30 | Fa 8; Ha 8; Ri ae 55, cs 45, admin 25 | At the seat's own position in the hierarchy |
| The goal as the denominator, with attainment | 55 | 70 | – | 25 | 15 | Fa 4; Ha 4; Ri ae 40, cs 35, admin 12 | A goal is an attribute, set in Settings |
| Each category's definition, under its label **DC** | 12 | 14 | – | 10 | 4 | Fa 3; Ha 3; Ri ae 10, cs 10, admin 3 | Text, never a tooltip |
| The predicted number beside the submitted one **DC** | 45 | 60 | – | 20 | 15 | Fa 4; Ha 4; Ri ae 35, cs 25, admin 12 | Beside, never instead |
| No agent submits a forecast **DC** | 8 | 10 | – | 5 | 4 | Fa 2; Ha 2; Ri ae 6, cs 5, admin 3 | Stated beside the pair |
| The submission deadline **DC** | 30 | 45 | – | 18 | 12 | Fa 3; Ha 3; Ri ae 25, cs 20, admin 10 | |
| The submissions strip for this period | 18 | 65 | – | 10 | 35 | Fa 3; Ha 3; Ri ae 14, cs 8, admin 28 | Who has submitted, and who has not |
| The scope chip | 14 | 45 | – | 12 | 4 | Fa 3; Ha 3; Ri ae 12, cs 12, admin 3 | |
| Renewal base and Expansion upside, separate totals | 4 | 5 | – | 35 | 4 | Fa 2; Ha 2; Ri cs 45, admin 4 | The CSM's reading of the same tab |
| Submit, with its consequence and who receives it **DC** | 65 | 75 | – | 30 | 8 | Fa 4; Ha 4; Ri ae 45, cs 40, admin 6 | |
| Adjust a category away from the roll-up | 45 | 55 | – | 20 | 3 | Fa 3; Ha 3; Ri ae 35, cs 25, admin 3 | The roll-up itself is never altered |
| The judgement note | 40 | 50 | – | 18 | 3 | Fa 3; Ha 3; Ri ae 30, cs 20, admin 3 | |
| Last cycle's call beside what happened **DC** | 35 | 55 | – | 15 | 6 | Fa 3; Ha 3; Ri ae 28, cs 18, admin 5 | Every submission is kept |
| What changed since the last submission | 14 | 18 | – | 8 | 4 | Fa 3; Ha 3; Ri ae 12, cs 6, admin 3 | |
| On Forecast, records sort by category then risk | 12 | 16 | – | 8 | 3 | Fa 2; Ha 2; Ri ae 10, cs 8, admin 3 | |
| On Starter: the number and the goal show; the team roll-up is Growth | 1 | 1 | – | 1 | 2 | Fa 12; Ha 1; Ri 1 | |
| Sort reps | 5 | 5 | 4 | 6 | 18 | Ha 50 | |
| Weekly activity trend | 5 | 5 | 10 | 6 | 15 | | |
| Meetings booked | 8 | 8 | 10 | 4 | 35 | Fa 40 | Founders count meetings |
| Bounce rate **DC** | 1 | 1 | 2 | 1 | 15 | Fa 30; Ha 50; Ri admin 3 | Safety state |
| Sort sequences by reply rate | 2 | 2 | 4 | 1 | 15 | Ha 45 | |
| Include bot opens | 1 | 1 | 2 | 1 | 3 | | |
| Show archived sequences | 1 | 1 | 1 | 1 | 3 | | |
| Conversion to pipeline | 4 | 4 | 40 | 3 | 10 | Fa 0; Ha 0; Ri mkt 50 | |
| Sort campaigns | 1 | 1 | 25 | 2 | 3 | Fa 0; Ha 0 | |
| Exclude internal contacts | 1 | 1 | 2 | 1 | 2 | | |
| Data as of **DC** | 12 | 12 | 20 | 8 | 25 | | |

Shape check, 68 items, computed from `reports.ts` with `shape()`. The denominator is every item that exists for that role at that business — an item whose number is 0 or absent is removed there and is not on their page. That one rule is used for every pair below and in specs 13, 14, 15, 16, 17, 18 and 19.

| Pair | Items on their page | Head | Body | Tail | Verdict |
|---|---|---|---|---|---|
| AE, Meridian | 68 | 15 (22%) | 22 (32%) | 31 (46%) | fits |
| Marketer, Meridian | 51 | 12 (24%) | 14 (27%) | 25 (49%) | fits. Seventeen Forecast items are absent for this seat, so the denominator is smaller |
| CS, Meridian | 68 | 10 (15%) | 24 (35%) | 34 (50%) | fits |
| CS, Ridgeline | 68 | 15 (22%) | 21 (31%) | 32 (47%) | fits. Renewals are deals here, so the Forecast tab is the CSM's weekly page |
| Admin, Meridian | 68 | 14 (21%) | 28 (41%) | 26 (38%) | head fits; body six points over and the tail light, because a fixed-report page accumulates few rarely-used controls by design, and the admin runs the forecast process without submitting one |
| Admin, Halyard | 59 | 17 (29%) | 16 (27%) | 26 (44%) | the resident role, and the stretch case. Nine items are removed here, so the denominator is smaller and the same head is a bigger share. The client report is this person's weekly job and most of this page is in it |
| Admin, Fathom | 59 | 10 (17%) | 18 (31%) | 31 (53%) | fits. Starter narrows the page: two reports are locked and the founder lives in the third, with the Forecast tab open and only its team roll-up locked |
| **AE with reports, Meridian** | 68 | 24 (35%) | 17 (25%) | 27 (40%) | **ten points over on the head, and kept.** All three of this seat's journeys land on this page — inspect the pipeline, roll the forecast up, coach from the calls — so it is an all-day page for an all-day seat, and the same judgement that kept the SDR's Tasks queue dense applies. Named here rather than smoothed away |

Decision-critical: weighted pipeline (the method must sit under the number), bounce rate (safety state: the guard warns at 4% and pauses at 6%), the unsubscribe rate (the same, for a sending product), data as of (a stale number acted on is a wrong decision), "Exports and prints spend no credits" (a fee statement, rule 7), and seven on the Forecast tab — the category definitions, the predicted pair, "no agent submits a forecast", the deadline, Submit with its consequence, and last cycle's call beside what happened. A submitted forecast is a commitment reported upward, which is rule 7's own word, and it is why the tab is on every plan. Twelve marked in prose and twelve marked in `reports.ts`.

## 5. Before: the common version

Apollo's Analytics, as its knowledge base documents it in September 2026, is a report builder with dashboards on top. It is the shape most GTM tools ship.

**Navigation and depth.** Analytics sits in the left nav under "Tools & automations" (07-apollo-settings-map §6). Its landing page offers "Create dashboard", "Create report", "Create goal", recently used items, and a default-dashboard dropdown with "Set as default", "Favorite" and "Open dashboard" ([Analytics Overview](https://knowledge.apollo.io/hc/en-us/articles/33574373762317-Analytics-Overview), updated 11 Sep 2026). To reach a number: Dashboards, pick one from a list "organized by default by creation date", "ensure you set the correct date range, and click Run", find the widget, then "Click ... > View Report within an individual widget to open the full report" ([Use Analytics Dashboards](https://knowledge.apollo.io/hc/en-us/articles/4411230325517-Use-Analytics-Dashboards)). Four levels to the detail, and the report opens with its own filters. The same numbers also live on Deals > Analytics, Sequences > Analytics and Emails > Analytics, each a page-level dashboard with a "Go to Analytics" link ([Report on Deals](https://knowledge.apollo.io/hc/en-us/articles/27459823138573-Report-on-Deals); [Report on Sequences](https://knowledge.apollo.io/hc/en-us/articles/9386141889549-Report-on-Sequences)).

**Volume.** Fourteen pre-built dashboards; Deal analytics alone has thirteen widgets, Email engagement ten. The reports matrix has eight categories and, by my count, more than forty named reports, a custom builder ("select at least 1 metric", "add at least 1 dimension") and a separate metrics glossary ([Use Analytics Reports](https://knowledge.apollo.io/hc/en-us/articles/4410826842381-Use-Analytics-Reports)). Goals are a third object with templates, folders and alerts; their CRM stage mapping lives under Settings > Analytics > Goals ([Set and Track Goals](https://knowledge.apollo.io/hc/en-us/articles/20676039270541-Set-and-Track-Goals)). A "Metrics" settings item appears only for teams with custom metrics (07-apollo-settings-map §1.3).

**Documented problems.**

1. *Two time filters that disagree, and a Run button.* Dashboards offer Today, Current Week, Last 7 days, Last 30 days, Weekly, Monthly, Quarterly, All Time and compute only on "click Run"; each widget then has its own "last 7 days, 4 weeks, 6 months, or 12 months". Custom Range exists on reports, not dashboards (Use Analytics Dashboards; Use Analytics Reports).
2. *Filters that override silently.* "If you use a dashboard filter that conflicts with a filter from an underlying report, Apollo discards and replaces the report filter with the dashboard filter whenever you view the dashboard. However, when you view the report, the original filter remains in effect." (Use Analytics Dashboards.) Dependent information split by a boundary, rule 5.
3. *Hover-only counts.* "Hover over a statistic for more details" (dashboards); "When you hover over a statistic, Apollo shows the numerical count" (Report on Sequences). Rule 4.
4. *One metric, several meanings.* "Metric availability varies by analytics surface. Emails > Analytics, sequence reports, Analytics > Reports, and dashboard widgets may show different metric sets." ([Access and Use Email Analytics](https://knowledge.apollo.io/hc/en-us/articles/4425592135821-Access-and-Use-Email-Analytics).)
5. *Export is not where the view is.* "To export sequence performance data, use Analytics Reports" (same article). Deal exports run in the background, arrive by email, and "might not retain the sort order displayed in Apollo" ([Export Deals to a CSV](https://knowledge.apollo.io/hc/en-us/articles/48217941127437-Export-Deals-to-a-CSV)).
6. *Gates in the reading path, and an unnamed admin.* Every analytics article opens with "Access to analytics depends on your Apollo plan"; custom reports are on "some Apollo plans"; "If you don't have permission, reach out to an Apollo admin". Ollopa gates reports by plan too, so the gate itself is not the fault. Three things are: the plan rule is told in the documentation rather than shown on the tab, the reader cannot tell which of the forty reports their own plan includes, and the sentence names no admin, so the request has nowhere to go. Ollopa's answer is the gated-features pattern: the lock is on the tab with the plan name, the panel carries the cost and one button, and a person who cannot upgrade asks a named admin from that panel.
7. *Users: too many clicks, not deep where it matters.* "navigating between campaigns, contacts, and analytics feels like one click too many each time" (G2 reviewer via SyncGTM's round-up, secondary). "too many clicks to reach data" (Hassnaa, Trustpilot, 4 Sep 2026). "The reporting is decent but not deep enough. I can see open and reply rates, but drilling into which specific step in a sequence is causing drop-off takes more effort than it should" (G2 reviewer, quoted in third-party round-ups surfaced by search; original not fetched, **unverified**).

**What Apollo gets right and Ollopa keeps.** Numbers next to the object (Deals > Analytics). Per-widget "Export to CSV" and "Copy Link". "Created by Apollo" as an honest label for fixed reports.

## 6. After: the disclosed version

### Level one, by role

Level one is the overview strip on arrival, then the default report's control bar, tiles, chart and table. Report tabs are page navigation (each has a URL, reachable from the left nav and the strip), not doors; levels are counted inside each report.

| Role at business | Level one beyond tiles, chart and table | Level two |
|---|---|---|
| Meridian admin | Activity, Pipeline, Sequences, Forecast in the strip; range; team; export CSV; meetings booked; the submissions strip; weighted pipeline, bounce, unsubscribe rate, fee line, data as of (DC) | Person (in the team menu); compare and custom range (in the range menu); records; steps; conversion; lost reasons; columns; print, link, weekly email (in Export) |
| Meridian AE | Forecast and Pipeline; range; by stage or by rep; the five categories with their definitions, the goal, the predicted pair, the deadline, Submit, adjust and the note; weighted pipeline, data as of (DC) | Records with "Open deal"; compare and custom range; conversion and its coverage line; lost reasons; Export; the scope chip; what changed since last time |
| **Meridian AE with reports** | Forecast first, with the team roll-up and the submissions strip; the team select as a working control with the person filter beside it; calls logged and calls with a coaching note; Reps coached this week; coverage against win rate | Records, calls among them; conversion; Export; the drill to one rep, which is navigation |
| Meridian marketer | Campaign results; range; compare toggle; export CSV; audience breakdown; persona; unsubscribed (DC); sourced and influenced; conversion to pipeline; sort; data as of (DC) | Records; custom range; team; print, link, weekly email; complaints; score at first contact |
| Meridian CS | Forecast and Pipeline; range; Renewal base and Expansion upside with their totals; the goal, the predicted pair, Submit; weighted pipeline (DC) | Records; lost reasons; person; Export; what changed since last time |
| Fathom founder | Activity; Forecast with the team roll-up locked; range; person (no teams, so it stands alone); meetings booked; the locked Pipeline and Sequences tabs with their plan name; weighted pipeline, bounce, fee line, data as of (DC) | Records; Export; conversion; steps |
| Halyard ops lead | Activity, Sequences; range and This month; person; export CSV; print; steps; sort reps, sort sequences; bounce, weighted pipeline, fee line, data as of (DC) | Custom range, link; records; the locked weekly email inside the Export door |
| Ridgeline CS | Forecast, Pipeline, Activity; range; the renewal split; weighted pipeline (DC); records | Lost reasons; person; compare |

### Every door

| Label as shown | Container | Why |
|---|---|---|
| "14 deals", "312 emails", "22 deals" (count in the cell, chevron) | Drawer | Heavy subtask that must keep the table in view for comparison (rule 5) |
| "Steps: 5" | Expand in place under the row | Short, compared against sibling rows |
| "Audience: 4 segments" | Expand in place | Same |
| "Stage-to-stage conversion" | Expand in place under the by-stage table | Depends on the numbers above it. Its last line is "Win rate 20% · needs 5.0x coverage", the same figure the Deals board strip prints, computed once |
| "Persona: 3" | Expand in place beside the audience breakdown | Two cuts of the same audience, read together |
| "3 deals move the difference" | Drawer, sorted by category then risk | The deals that explain a gap between two numbers already on screen |
| "Submit your forecast" | Panel (`X-forecast`), flat, no doors inside it | A heavy subtask that must keep the roll-up in view. A sibling of the records drawer on the page, not a child of it |
| "Lost reasons: 5" | Expand in place beside the Lost tile | Depends on the Lost count |
| "Date range: Last 30 days" | Menu: presets, custom range, compare | Compare depends on the range |
| "Team: AE East" | Menu: teams, then that team's people | Person depends on team |
| "Export" | Menu: this table, records, copy link, email weekly | Four ways out of the page. The fee statement is not in here; it is on the bar beside the door, because a fee read after the menu opens is a fee read after the decision has started (rule 7) |
| "Columns: 7 of 10" | Popover | Small and interactive |
| "How these numbers are counted" | Expand in place under the tiles; holds the counting toggles (bot opens, archived, internal, unweighted, grain, chart or table) | Definitions and what changes them stay together |

No door contains a door. "Open deal" from the drawer is navigation; Back restores the drawer.

**Persistence.** Range, team, person, compare, sort, columns and open in-place doors persist per user and per report (localStorage, the `session.ts` pattern) and sit in the URL, so a copied link reproduces the view. "Expand all steps" and "Collapse all" sit above the Sequences table. Print expands everything.

**Accelerators.** Keys 1–4, D, T, E, P, ?, all shown in the palette. "Keep the definitions open" is a checkbox inside that door. Halyard's ops lead gets Print, the person filter and both sorts at level one because the numbers put them there, not a mode.

**Decision-critical, always visible.** Weighted pipeline with "weighted by stage probability" under the number; bounce rate with the guard's two thresholds and "over threshold" in text; data as of; and "Exports and prints spend no credits" on the control bar beside Export. The fee line used to sit inside the Export menu and was justified as sitting where the decision is made. That was wrong twice over: a fee is decision-critical whether or not the reader has decided to act, and the FTC's 2022 dark-patterns report names exactly this shape — a charge disclosed only in the control that confirms it — as the mechanism of a deceptive act. It is now on the bar, visible without a click, on every plan.

On the Forecast tab, seven more: each category's definition printed under its label rather than in a tooltip; the predicted number beside the submitted one with the deals that explain the gap; "No agent submits a forecast"; the deadline; the Submit button's consequence sentence naming who receives it; and last cycle's call beside what actually happened. A submitted forecast is a commitment, so the tab is on every plan and only the team roll-up — which needs teams, a Growth feature — carries a lock.

**Removed rather than hidden.** The report builder, custom metrics, dashboards as objects, goals and alerts as objects (a goal is an attribute set in Settings and shown here as a denominator), favourites and "set as default" (the role default does this), the Run button, per-widget time filters, the AI assistant entry point, the Campaign results tab at Fathom and Halyard, the Forecast tab for the marketer seat, the Team select at Fathom, Halyard and for a scoped AE, and any agent that submits a forecast.

**Locked rather than removed.** The opposite case, and the reason the two words are kept apart. Removed means the thing cannot exist here at any price: Fathom has no campaigns, so there is no Campaign results tab and no lock. Locked means the thing exists and this plan does not include it: Fathom's Pipeline and Sequences tabs, Fathom's CSV export, the scheduled weekly email everywhere but Meridian, and the Forecast tab's **team roll-up** on Starter. The Forecast tab itself is never locked, because a commitment is decision-critical and decision-critical items are on every plan. A removed item leaves no trace; a locked one stays exactly where it would live, with the plan name on it.

### The nine-point score

1. Weighted-pipeline method, bounce state, the unsubscribe rate, freshness and the fee line all on screen without a click, and all four print even on a locked report; the Forecast tab's seven are level one on every plan. **2**
2. Every visible item has a number in §4 with the fitted-shape source. **2**
3. Page, then drawer or in-place expansion; a record is a page, not a level; `X-forecast` and the records drawer are siblings on the page rather than parent and child; the phone keeps the count. **2**
4. Every door is text plus chevron, labelled by content with a count. **2**
5. Doors sit in the cell or under the table they explain; buttons, keyboard, touch. **2**
6. Range with compare, team with person, Lost with reasons, definitions with their toggles, each forecast category with its own definition, the roll-up with its adjustment and the last submitted value in one row, and win rate with the coverage it requires. **2**
7. Persisted per user and in the URL; expand all; print CSS. **2**
8. Level one comes from role at sign-in and object state; nothing reorders by history. **2**
9. Door opens instrumented per role and business; review scheduled; the light admin tail is its first question. **1**, because it has not run once.

**17 of 18.**

## 7. Lesson steps

Not a lesson. The rules that mattered most:

- **Rule 1.** The overview is what everyone needs weekly, so it is never behind a tab or a Run button.
- **Rule 5.** Range and compare, team and person, count and its records: each pair stays on one side of a door.
- **Rule 4.** Every count is its own door, labelled with the number it opens; nothing is hover-only.
- **Rule 7.** The weighted-pipeline method, bounce state, the unsubscribe rate, freshness and the fee statement sit on the page, not in a glossary and not inside the menu that confirms the action. A forecast category's definition is text under its label: a commitment whose meaning lives in a tooltip is the FTC's named mechanism, not a design choice.
- **One word, one meaning.** "Forecast" named an arithmetic on the Pipeline tile and a commitment on the Forecast tab. The tile is now Weighted pipeline. A page where one word means two things cannot be read quickly, whatever else it does right.
- **The gated-features pattern.** Where a plan does not include a report or an export, the lock sits on the tab or the control, at the entry point, with the plan name and one total price; the report's shape and row count still show; and the two numbers that are never gated, the forecast and the bounce rate, print anyway.

## 8. Review

| Check | Gap found | Closed by |
|---|---|---|
| All roles | SDR had no state | No-access state names the admin, points to Sequences and Home |
| All four businesses | No campaigns or teams at Fathom and Halyard | Tab and select removed, not disabled; overrides in §4 |
| All four businesses | Three plans, and three files disagreed about what each includes | §3 renders spec 14's plan table read straight from PLAN.md: Starter one report, Growth all five **plus CSV export**, Scale all five plus the scheduled weekly email. The earlier claim that export was Scale-only was wrong against PLAN.md and against the map's own edge row, and it produced a false "honest consequence" paragraph about Halyard printing a PDF. Both are gone: Halyard is on Growth and exports |
| All roles covered | The sales leader was an unnamed AE | AE+ is an AE seat with direct reports, given its own column in §4 and its own rows in §3 and §6. No sixth seat exists, so `SEATS` is unchanged |
| Every action has an outcome | Nothing on this page produced a commitment | The Forecast tab and `X-forecast`: Submit writes the period, the number, the split, the note and the time, states who receives it, and is kept for ever, so the next cycle opens with the last call beside what happened |
| Decision-critical visible | A forecast category's meaning was going to be a tooltip | Printed as text under each label. The FTC's 2022 report names a tooltip as the mechanism of a deceptive act, and a commitment's definition is exactly that kind of fact |
| Decision-critical visible | The Forecast tab was drafted as Growth-gated | It is on every plan for the seats that hold it; only the team roll-up, which needs teams, carries a lock |
| Two levels | `X-forecast` was drafted as a panel that opened the records drawer | Both are panels on the page, siblings. The drill from the team roll-up to one rep is navigation, which costs no level |
| Dependent fields together | Win rate and required coverage were computed in two places | One figure, computed here at the foot of the conversion door and read by the Deals board strip |
| Every field has a source | `bounceGuardThreshold` 3.5% was a threshold invented here | Deleted. The thresholds are Settings' single pair, 4% and 6%; 3.5% was never a threshold but an observed rate |
| Every field has a source | The Campaign entity was redefined here, with a `channel` | Spec 10 owns `Campaign` and `Audience`; Reports adds `dealsCreated` and `pipelineAmount` and nothing else |
| Every field has a source | Deals carried an `outcome` flag and a lost stage | Five stages only; lost means archived, with `archivedOn` and `lostReason` from spec 09 |
| Every field has a source | Users, activity, closed deals, stage history, step stats, campaigns, freshness absent | Listed in §2 with types |
| Every action has an outcome | Export and print had none | Outcomes table; print stylesheet |
| Empty, error, no-access | Real zero and empty range looked alike | Both defined; a zero is data, not a door |
| Keyboard | Chart unreachable | Skipped in tab order with a text summary; tiles are links |
| Phone width | Table too wide | Sticky first column, scroll inside the table; drawer becomes a sheet |
| Decision-critical visible | Fee line behind the Export door | Moved onto the control bar beside Export. The earlier justification ("the decision is made in that menu") was the FTC's deceptive shape, not a defence |
| Decision-critical visible | A locked report could have hidden the forecast and the bounce rate | Both print on a locked report; safety and decision-critical items are on every plan |
| Two levels | "Open deal" from a drawer looked like a third | Defined as navigation; Back restores the drawer |
| Doors by content | "More" on the table | "Columns: 7 of 10" |
| Dependent fields together | Compare was a separate toggle for the AE | Moved into the range menu where its number is under 20 |
| State persists | URL only | Also per user and per report |
| Accelerators | None | Keys, palette, expand all |
| Usage shape | Admin tail light | Six real tail items added; deviation stated |
| Nothing hover-only | Deltas relied on colour | Text and arrow |
| Role gaps explain themselves | Scoped AE saw a disabled Team select | A sentence naming the admin |
| No usage numbers or teaching text | Draft had "Most used" labels | Removed; defaults come from the model silently |
