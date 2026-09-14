# Reports

*A "real" page. Four fixed reports, not a report builder. Breakdown tables come from the table template, with a tile row and one chart above them.*

## 1. Purpose

Reports is where a leader checks how the team is doing and finds the one number that needs a conversation. Four fixed reports: **Activity** (emails, calls, meetings booked, tasks done, by rep), **Pipeline** (created, won, lost, open by stage, weighted forecast), **Sequences** (sent, replied, bounced, by sequence and by step) and **Campaign results** (sent, opened, replied, pipeline created, by campaign and by audience). One date range and one team filter apply to all four. Export of what is on screen.

Who lives here: the RevOps admin (weekly ops review), the account executive (the forecast before the weekly pipeline call), the marketer (campaign results, most days), customer success (renewal pipeline, weekly). Founders at Fathom Labs and the ops lead at Halyard are admins and use it as leaders do; at Halyard it is also the client report, every week, ten times over. The SDR has no Reports entry; their numbers live on Sequences and Home.

The one thing they must never lose sight of: **the overview is the content**. Shneiderman's mantra, "overview first, zoom and filter, then details on demand", is a disclosure sequence for data, and the knowledge base warns that collapsing the overview to "simplify" removes the step that makes drill-down possible (00-core-model §4, §8.2). The headline numbers are always on screen. What is disclosed is the record-level detail behind them, never the numbers themselves.

## 2. Data

Sources are `src/ollopa/data/seed.ts` and `businesses.ts`. The seed's fixed "today" is 13 September 2026.

| Field | Where shown | Source | To add to seed |
|---|---|---|---|
| Rep name, role, team | By-rep tables, team and person filters | `businesses.roles`: 2–5 demo users; Meridian has 42 | `users: User[]` per business to `counts.users` (cap 42): name, role, team. Teams: Meridian = Sales development, AE East, AE West, Customer success, Marketing; Ridgeline = Inbound, Expansion, Customer success, Lifecycle marketing; Fathom and Halyard = none |
| Emails, calls, meetings booked, tasks done, per rep per week | Activity tiles, trend, table, drawer | none | `activityEvents`: kind (email, call, meeting, task), user, contact, company, date; 13 weeks, about 25 per user per week. "Meeting booked" = a contact moved to stage "Meeting booked"; Ollopa has no booking tool |
| Deals created, won, lost, open, by stage and rep | Pipeline tiles, tables, drawer | `deals`: open deals only, with `stage`, `amount`, `probability`, `closeDate`, `owner` | `createdDate`, `closedDate`, `outcome` (open, won, lost), `lostReason` (price, timing, competitor, no decision, other); closed deals for 13 weeks, about 1.5× the open count |
| Weighted forecast | Pipeline tile | `amount × probability`, open deals closing in range | nothing; the method is printed on the tile |
| Stage-to-stage conversion | Pipeline door | none | `stageHistory: { dealId, stage, enteredOn }[]` |
| Sequence sent, delivered, replied, bounced, rates | Sequences tiles and table | `sequences`: `active`, `replied`, `bounced`, `steps` (a count) | `sent`, `delivered`, `stepStats: { n, kind, sent, delivered, opened, replied, bounced }[]`, weekly `series` |
| Bounce rate against the bounce guard | Sequences tile | threshold is Settings item `mail.bounce-guard` | `bounceGuardThreshold` per business (3.5%) in `businesses.ts` |
| Campaign name, channel, audience, sent, opened, replied, deals, pipeline | Campaign tiles, table, audience door | `counts.campaigns` is a number only | `campaigns: Campaign[]`: name, channel (email, in-app, webinar, event), audience, sent, delivered, opened, clicked, replied, dealsCreated, pipelineAmount, startedOn, status, owner, `byAudience`. Meridian 12, Ridgeline 8, Fathom 0, Halyard 0 |
| Data as of | Control bar | none | a constant per seed: "Data as of 13 Sep 2026, 08:00; refreshes hourly" |

All numbers are computed at render from these rows, so the four reports and every drawer agree. Apollo's "metric availability varies by analytics surface" (§5) is what happens when they are not.

## 3. Features

### Layout

One page, `/reports/:report`. A control bar: report tabs (Activity, Pipeline, Sequences, Campaign results), date range, team, person, the compare toggle where the role's use puts it at level one, Export, Print, "Data as of 13 Sep 2026, 08:00". Below: a **tile row** (four or five headline numbers, with the change against the previous period when compare is on), **one chart** (weekly trend for the range), **one breakdown table** on `TablePage`. On arrival an **overview strip** shows the tile row of every report the role uses (§6), each with "Open the Pipeline report".

| Report | Tiles | Chart | Table rows | Row door (level two) |
|---|---|---|---|---|
| Activity | Emails sent, Calls made, Meetings booked, Tasks done | Four series by week | One per rep: the four counts, tasks overdue | "312 emails" opens the records drawer |
| Pipeline | Created, Won, Lost, Open pipeline, Weighted forecast | Created vs won amount by week | By stage (default) or by rep, switched at level one: count, amount, average age | "14 deals" opens the drawer; "Stage-to-stage conversion" and "Lost reasons: 5" expand in place |
| Sequences | Sent, Delivered, Reply rate, Bounce rate | Sent and replied by week | One per sequence: sent, delivered, opened, replied, bounced, both rates, status | "Steps: 5" expands in place; "Open sequence" navigates |
| Campaign results | Sent, Opened, Replied, Deals created, Pipeline created | Sent and replied by week | One per campaign: channel, audience, sent, opened, replied, deals, pipeline, status | "Audience: 4 segments" expands in place; "22 deals" opens the drawer |

### Actions

| Action | Where | Outcome |
|---|---|---|
| Switch report | Tab, or keys 1–4 | URL changes; filters carry over |
| Date range | Select: This week, Last 7 days, Last 30 days, This quarter, Last quarter, Last 90 days, This year; "Custom range" opens two date fields inside the same menu | Everything recomputes; range is in the URL and remembered |
| Team, Person | Selects; Person lists the chosen team's members | Recompute; a chip "AE East · Elena Vasquez" states what is applied |
| Compare with previous period | Toggle | Tiles show the delta; chart adds a dotted previous-period line |
| Export | Menu: "This table (18 rows)", "Records behind this table", "Copy link with these filters", "Email me this report every Monday", and the line "Report exports spend no credits" | CSV downloads at once, filters applied, header row names the range |
| Print or save as PDF | Button | Print stylesheet: every door expanded, filters as a caption, no control bar |
| Choose columns | Table button "Columns: 7 of 10" | Persisted per report |
| Row door | Link in the cell, chevron and count | Drawer or in-place expansion |
| Open record | Link in the drawer | Navigates to the deal, sequence or campaign; Back returns with the drawer open |
| Sort | Column headers | Persisted per report |

No bulk actions; nothing here changes data.

**The records drawer** opens from any count. Its title names the number: "14 deals won, AE East, last 30 days". First section: that row week by week. Second: the records as a table (deal, company, amount, owner, closed on) with "Export these 14 rows" and "Open" per row. Closing returns focus to the cell that opened it. One drawer at a time.

**Filters and search.** The three filters above. No free-text search: tables have at most 42 rows (reps), 26 (sequences), 12 (campaigns) or 5 (stages), so `TablePage`'s search box is hidden.

### States

| State | What the page shows |
|---|---|
| Loading | Tiles and table keep their layout with placeholder bars; the control bar works |
| Empty range | Tiles show 0; the table says "Nothing in this range" with "Show last 90 days"; a zero is not a link, so there is no door |
| A real zero | Ridgeline's Sequences report: two sequences, 0 sent this period. Data, shown as data |
| Error | Last numbers stay, with "Could not refresh; showing data as of 13 Sep, 08:00. Retry" |
| No access | An SDR at `/reports`: "Reports is for account executives, marketers, customer success and admins. Your sequence numbers are on Sequences and today's activity is on Home. Daniel Okafor (RevOps admin) can give you access." |
| Restricted scope | An AE at Meridian: the team select is replaced by "AE East (your team). Daniel Okafor can widen this." |

### Keyboard, accessibility, phone

Tab order: tabs, range, team, person, compare, export, print, tiles (each a link to its records), table; the chart is skipped and carries `aria-describedby` to a sentence ("Emails sent rose from 1,240 to 1,610 over 13 weeks"). Keys: 1–4 reports, D range, T team, E export, P print, ? lists them; arrows move through the table, Enter opens a row door, Escape closes the drawer and returns focus. Cmd+K, the global palette, lists every action with its key.

Every door is a `button` with `aria-expanded` and a visible label with a count. Deltas use text and an arrow, not colour alone. The bounce tile at or over the threshold adds "over threshold" in words. Reduced motion: crossfade.

At phone width the control bar wraps to two rows, tabs scroll sideways, tiles go two per row, the table keeps a sticky first column and scrolls inside its own container, the drawer becomes a full-height sheet. Every one-click door on desktop is one tap on the phone.

### By role and by business

| | Default report | In the overview strip | Removed, not disabled |
|---|---|---|---|
| Meridian admin | Activity | Activity, Pipeline, Sequences | nothing |
| Meridian AE | Pipeline | Pipeline | Team select (fixed to own team) |
| Meridian marketer | Campaign results | Campaign results | nothing |
| Meridian CS | Pipeline | Pipeline | nothing |
| Fathom founder (admin) | Pipeline | Pipeline, Activity, Sequences | Campaign results tab, Team select |
| Halyard ops lead (admin) | Activity | Activity, Sequences | Campaign results tab, Team select (the workspace is the client) |
| Ridgeline marketer | Campaign results | Campaign results | nothing |
| Ridgeline CS, AE | Pipeline | Pipeline (CS also Activity) | nothing |
| Ridgeline admin | Pipeline | Pipeline, Activity, Campaign results | nothing; two sequences are real data |

## 4. Usage items

Share of active users in a role touching the item in a typical week. Baseline is Meridian; overrides per business (Fa, Ha, Ri). Fitted to the shape in USAGE-MODEL.md (Nielsen 80/20, Pendo 6%, McGrenere and Moore). No SDR column: no access. **DC** = decision-critical, level one regardless. Same table in code: `src/ollopa/usage/reports.ts`.

| Item | AE | Mkt | CS | Admin | Overrides | Note |
|---|---|---|---|---|---|---|
| Overview strip | 45 | 55 | 30 | 60 | Fa 55; Ha 70; Ri ae 35, mkt 60, cs 45, admin 50 | The visit itself |
| Activity report | 8 | 12 | 10 | 45 | Fa 40; Ha 65; Ri cs 20, admin 30 | |
| Pipeline report | 45 | 10 | 22 | 40 | Fa 50; Ha 15; Ri ae 35, cs 40 | Ridgeline renewals are deals |
| Sequences report | 4 | 4 | 1 | 25 | Fa 40; Ha 65; Ri admin 4, mkt 2 | |
| Campaign results | 2 | 55 | 4 | 12 | Fa 0; Ha 0; Ri mkt 60, cs 12, admin 22 | Removed where 0 |
| Date range presets | 35 | 50 | 22 | 55 | Fa 50; Ha 65 | |
| Custom date range | 4 | 12 | 3 | 8 | Ha 18 | Client billing periods |
| Team filter | 10 | 18 | 6 | 40 | Fa 0; Ha 0; Ri admin 30 | Removed where 0 |
| Person filter | 15 | 4 | 12 | 18 | Fa 35; Ha 50 | Small teams look at people |
| Compare with previous period | 15 | 30 | 8 | 15 | Ri mkt 35 | In the range menu when under 20 |
| Export CSV | 6 | 22 | 5 | 25 | Fa 10; Ha 70; Ri mkt 18 | Halyard's client report |
| Print or save as PDF | 2 | 8 | 2 | 4 | Ha 30 | |
| Copy link with filters | 4 | 12 | 3 | 10 | Ha 15 | |
| Email this report weekly | 1 | 4 | 1 | 4 | Ha 15 | |
| Choose columns | 2 | 3 | 2 | 4 | | |
| Chart or table for the trend | 2 | 4 | 2 | 4 | | |
| Time grain | 2 | 4 | 2 | 4 | | |
| Records behind a number | 30 | 18 | 18 | 30 | Ha 40; Ri cs 30 | The main door |
| Week by week for one row | 8 | 10 | 5 | 8 | | First section of the drawer |
| Open the record from the drawer | 18 | 4 | 10 | 4 | | Navigation, not a level |
| Step by step for a sequence | 2 | 3 | 1 | 18 | Fa 30; Ha 55; Ri admin 2 | Apollo's documented gap |
| Audience breakdown for a campaign | 1 | 35 | 2 | 3 | Fa 0; Ha 0; Ri mkt 40 | |
| How these numbers are counted | 4 | 4 | 4 | 4 | | Definitions door |
| Weighted forecast **DC** | 45 | 4 | 12 | 35 | Ha 10; Ri ae 35, cs 30 | Method on the tile |
| By stage or by rep switch | 25 | 4 | 12 | 18 | | |
| Stage-to-stage conversion | 10 | 3 | 3 | 12 | | |
| Lost reasons | 8 | 3 | 6 | 8 | Ri cs 15 | |
| Unweighted forecast toggle | 3 | 1 | 2 | 4 | | |
| Sort reps | 5 | 4 | 6 | 18 | Ha 50 | |
| Weekly activity trend | 5 | 10 | 6 | 15 | | |
| Meetings booked | 8 | 10 | 4 | 35 | Fa 40 | Founders count meetings |
| Bounce rate **DC** | 1 | 2 | 1 | 15 | Fa 30; Ha 50; Ri admin 3 | Safety state |
| Sort sequences by reply rate | 2 | 4 | 1 | 15 | Ha 45 | |
| Include bot opens | 1 | 2 | 1 | 3 | | |
| Show archived sequences | 1 | 1 | 1 | 3 | | |
| Conversion to pipeline | 4 | 40 | 3 | 10 | Fa 0; Ha 0; Ri mkt 50 | |
| Sort campaigns | 1 | 25 | 2 | 3 | Fa 0; Ha 0 | |
| Exclude internal contacts | 1 | 2 | 1 | 2 | | |
| Data as of **DC** | 12 | 20 | 8 | 25 | | |

Shape check, 39 items, computed from the code:

| Pair | Head | Body | Tail | Verdict |
|---|---|---|---|---|
| AE, Meridian | 6 (15%) | 13 (33%) | 20 (51%) | fits |
| Marketer, Meridian | 9 (23%) | 10 (26%) | 20 (51%) | fits |
| CS, Ridgeline | 6 (15%) | 12 (31%) | 21 (54%) | fits |
| Admin, Meridian | 11 (28%) | 15 (38%) | 13 (33%) | head fits; tail light, because a fixed-report page accumulates few rarely-used controls by design |
| Admin, Halyard | 14 (36%) | 11 (28%) | 14 (36%) | the resident role; five items are removed here and count in the tail |

Decision-critical: weighted forecast (a commitment reported upward; the method must sit under the number), bounce rate (safety state: at the bounce-guard threshold sending pauses), data as of (a stale number acted on is a wrong decision), and the export menu's "spend no credits" line (a fee statement, rule 7).

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
6. *Gates in the reading path.* Every analytics article opens with "Access to analytics depends on your Apollo plan"; custom reports are on "some Apollo plans"; "If you don't have permission, reach out to an Apollo admin". Which admin, the page does not say.
7. *Users: too many clicks, not deep where it matters.* "navigating between campaigns, contacts, and analytics feels like one click too many each time" (G2 reviewer via SyncGTM's round-up, secondary). "too many clicks to reach data" (Hassnaa, Trustpilot, 4 Sep 2026). "The reporting is decent but not deep enough. I can see open and reply rates, but drilling into which specific step in a sequence is causing drop-off takes more effort than it should" (G2 reviewer, quoted in third-party round-ups surfaced by search; original not fetched, **unverified**).

**What Apollo gets right and Ollopa keeps.** Numbers next to the object (Deals > Analytics). Per-widget "Export to CSV" and "Copy Link". "Created by Apollo" as an honest label for fixed reports.

## 6. After: the disclosed version

### Level one, by role

Level one is the overview strip on arrival, then the default report's control bar, tiles, chart and table. Report tabs are page navigation (each has a URL, reachable from the left nav and the strip), not doors; levels are counted inside each report.

| Role at business | Level one beyond tiles, chart and table | Level two |
|---|---|---|
| Meridian admin | Activity, Pipeline, Sequences in the strip; range; team; export CSV; meetings booked; forecast, bounce, data as of (DC) | Person (in the team menu); compare and custom range (in the range menu); records; steps; conversion; lost reasons; columns; print, link, weekly email (in Export) |
| Meridian AE | Pipeline; range; by stage or by rep; forecast, data as of (DC) | Records with "Open deal"; compare and custom range; conversion; lost reasons; Export |
| Meridian marketer | Campaign results; range; compare toggle; export CSV; audience breakdown; conversion to pipeline; sort; data as of (DC) | Records; custom range; team; print, link, weekly email |
| Meridian CS | Pipeline; range; forecast (DC) | Records; lost reasons; person; Export |
| Fathom founder | Pipeline, Activity, Sequences; range; person (no teams, so it stands alone); meetings booked; steps; forecast, bounce (DC) | Records; Export; conversion |
| Halyard ops lead | Activity, Sequences; range; person; export CSV; print; steps; sort reps, sort sequences; bounce, forecast (DC) | Custom range, weekly email, link; records |
| Ridgeline CS | Pipeline, Activity; range; forecast (DC); records | Lost reasons; person; compare |

### Every door

| Label as shown | Container | Why |
|---|---|---|
| "14 deals", "312 emails", "22 deals" (count in the cell, chevron) | Drawer | Heavy subtask that must keep the table in view for comparison (rule 5) |
| "Steps: 5" | Expand in place under the row | Short, compared against sibling rows |
| "Audience: 4 segments" | Expand in place | Same |
| "Stage-to-stage conversion" | Expand in place under the by-stage table | Depends on the numbers above it |
| "Lost reasons: 5" | Expand in place beside the Lost tile | Depends on the Lost count |
| "Date range: Last 30 days" | Menu: presets, custom range, compare | Compare depends on the range |
| "Team: AE East" | Menu: teams, then that team's people | Person depends on team |
| "Export" | Menu: this table, records, copy link, email weekly, "spend no credits" | Four ways out of the page |
| "Columns: 7 of 10" | Popover | Small and interactive |
| "How these numbers are counted" | Expand in place under the tiles; holds the counting toggles (bot opens, archived, internal, unweighted, grain, chart or table) | Definitions and what changes them stay together |

No door contains a door. "Open deal" from the drawer is navigation; Back restores the drawer.

**Persistence.** Range, team, person, compare, sort, columns and open in-place doors persist per user and per report (localStorage, the `session.ts` pattern) and sit in the URL, so a copied link reproduces the view. "Expand all steps" and "Collapse all" sit above the Sequences table. Print expands everything.

**Accelerators.** Keys 1–4, D, T, E, P, ?, all shown in the palette. "Keep the definitions open" is a checkbox inside that door. Halyard's ops lead gets Export and Print at level one because the numbers put them there, not a mode.

**Decision-critical, always visible.** Forecast with "weighted by stage probability" under the number; bounce rate with its threshold and "over threshold" in text; data as of. The no-credits line is inside the Export menu, the one place the export decision is made.

**Removed rather than hidden.** The report builder, custom metrics, dashboards as objects, goals and alerts, favourites and "set as default" (the role default does this), the Run button, per-widget time filters, the AI assistant entry point, the Campaign results tab at Fathom and Halyard, the Team select at Fathom, Halyard and for a scoped AE.

### The nine-point score

1. Forecast method, bounce state and freshness on screen; the fee line at the point of decision. **2**
2. Every visible item has a number in §4 with the fitted-shape source. **2**
3. Page, then drawer or in-place expansion; a record is a page, not a level; the phone keeps the count. **2**
4. Every door is text plus chevron, labelled by content with a count. **2**
5. Doors sit in the cell or under the table they explain; buttons, keyboard, touch. **2**
6. Range with compare, team with person, Lost with reasons, definitions with their toggles. **2**
7. Persisted per user and in the URL; expand all; print CSS. **2**
8. Level one comes from role at sign-in and object state; nothing reorders by history. **2**
9. Door opens instrumented per role and business; review scheduled; the light admin tail is its first question. **1**, because it has not run once.

**17 of 18.**

## 7. Lesson steps

Not a lesson. The rules that mattered most:

- **Rule 1.** The overview is what everyone needs weekly, so it is never behind a tab or a Run button.
- **Rule 5.** Range and compare, team and person, count and its records: each pair stays on one side of a door.
- **Rule 4.** Every count is its own door, labelled with the number it opens; nothing is hover-only.
- **Rule 7.** Forecast method, bounce state and freshness sit on the tile, not in a glossary.

## 8. Review

| Check | Gap found | Closed by |
|---|---|---|
| All roles | SDR had no state | No-access state names the admin, points to Sequences and Home |
| All four businesses | No campaigns or teams at Fathom and Halyard | Tab and select removed, not disabled; overrides in §4 |
| Every field has a source | Users, activity, closed deals, stage history, step stats, campaigns, freshness absent | Listed in §2 with types |
| Every action has an outcome | Export and print had none | Outcomes table; print stylesheet |
| Empty, error, no-access | Real zero and empty range looked alike | Both defined; a zero is data, not a door |
| Keyboard | Chart unreachable | Skipped in tab order with a text summary; tiles are links |
| Phone width | Table too wide | Sticky first column, scroll inside the table; drawer becomes a sheet |
| Decision-critical visible | Fee line behind the Export door | Kept there and justified: the decision is made in that menu |
| Two levels | "Open deal" from a drawer looked like a third | Defined as navigation; Back restores the drawer |
| Doors by content | "More" on the table | "Columns: 7 of 10" |
| Dependent fields together | Compare was a separate toggle for the AE | Moved into the range menu where its number is under 20 |
| State persists | URL only | Also per user and per report |
| Accelerators | None | Keys, palette, expand all |
| Usage shape | Admin tail light | Six real tail items added; deviation stated |
| Nothing hover-only | Deltas relied on colour | Text and arrow |
| Role gaps explain themselves | Scoped AE saw a disabled Team select | A sentence naming the admin |
| No usage numbers or teaching text | Draft had "Most used" labels | Removed; defaults come from the model silently |
