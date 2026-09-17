# Deals board

*A "real" page: seed data, navigation and the rules applied, built from the table template for its table view and a small board component for its board view. The deal record is a separate spec (lesson 3). This page is the pipeline: columns by stage, cards, sums, forecast.*

## 1. Purpose

The board is where an account executive works the pipeline: sees every open deal by stage, moves deals as they progress, keeps the next step and close date honest, and reads the forecast. It is the AE's first screen after Home and stays open all day. The RevOps admin opens it weekly to review ownership, stale deals and the forecast. Customer success opens it for handoffs and, at Ridgeline, to run renewal and expansion deals. SDRs and marketers do not have the page; reached by link, it says so and names who does.

The one thing the AE must never lose sight of: what each deal is worth, when it closes, and what has to happen next. Everything else serves those three.

Deal cards link to the deal record (`page: "deal"`, route `/ollopa/deals/:id`), specified separately. The company name on a card opens the Companies table searched for that company; a company record is a later case.

## 2. Data

Rows come from `seedFor(business).deals` (`src/ollopa/data/seed.ts`, type `Deal`). Counts come from `businesses.ts`.

| Field shown | Source | Note |
|---|---|---|
| Deal name, company | `Deal.name`, `Deal.company` | |
| Amount | `Deal.amount` | In the workspace default currency (`ws.currency`) |
| Stage | `Deal.stage` | Five stages: Qualified, Discovery, Proposal, Negotiation, Closed won. There is no Closed lost stage and no outcome flag; a lost deal is archived with a reason. The list and its probabilities are defined once in [09 Deal record](09-deal-record.md) and read here |
| Probability | `Deal.probability` | Owned by the setting "Pipelines and stages" |
| Close date | `Deal.closeDate` | Overdue when before today (2026-09-13 in the seed) |
| Owner | `Deal.owner` | A user from `businesses.roles` |
| Next step | `Deal.nextStep` | |
| Last activity | `Deal.lastActivity` | Stale marker at 14 days or more |
| Count, sum, weighted sum per column | Derived | Weighted = amount × probability |
| Forecast strip | Derived from rows and forecast category | Commit, best case, pipeline, closed won for the period |
| Total deals | `counts.openDeals` | "40 of 214" until the seed generates all rows |

**To add to the seed** (deterministic, same `rng`):

| Field | Type | Why |
|---|---|---|
| `pipeline` | Meridian: "New business", "Renewals and expansion"; Ridgeline: "Expansion", "Renewals"; one at Fathom and Halyard | The pipeline picker exists only with more than one |
| `forecastCategory` | Pipeline, Best case, Commit, Closed, Omitted | Defaults from stage (Qualified, Discovery → Pipeline; Proposal → Best case; Negotiation → Commit; Closed won → Closed); one deal in ten overrides, two per business are Omitted. Archiving a deal takes it out of the forecast altogether |
| `stageEnteredAt`, `createdAt` | dates | Days in stage; created-date filter |
| `archivedAt`, `lostReason` | date; Price, No decision, Competitor, Timing | A lost deal is archived, not moved to a sixth stage. One archived deal per six open, so the archived filter has rows |
| `syncState` | synced, error, null | Only where a CRM is connected (Meridian, Ridgeline); one in twenty in error |
| `agentProposal` | string or null | A proposed next step awaiting approval; more often at Fathom |
| `currency` | ISO code, optional | A handful at Meridian and Halyard, to show conversion |
| `lastProspectActivityAt` | date or null | The last time *they* did something: replied, opened the proposal, attended. Distinct from `lastActivity`, which counts our touches too. A deal where only we have spoken is not a deal that is moving |
| `contactCount` | number | Derived from `DealContact`. Feeds the "Too few contacts" warning |
| `seniorSponsor` | boolean | Derived: true when any `DealContact.role` is Economic buyer or Champion at director level or above. Feeds the "No senior sponsor" warning |
| `warnings[]` | computed, never stored | The six below, each carrying its observed number and the threshold it crossed |
| Row count | generate `counts.openDeals` rows, not `min(openDeals, 40)` | Column counts must match the business |

**The six deal warnings.** They are computed from the fields above, never stored, and the thresholds are set once by the admin in Settings › Pipeline and data, where each one shows the observed workspace value beside it. The warnings themselves, their names and their defaults are defined in [09 Deal record](09-deal-record.md) §2 and read here, so one fact has one owner:

| Warning | Fires when | Default |
|---|---|---|
| No activity | `lastActivity` older than the threshold | 14 days |
| Ghosted | `lastProspectActivityAt` older than the threshold while `lastActivity` is recent | 21 days |
| Overdue | `closeDate` before today and the stage is open | — |
| Too few contacts | `contactCount` under the threshold at Proposal or later | 3 |
| No senior sponsor | `seniorSponsor` false at Proposal or later | — |
| Stalled in stage | `stageEnteredAt` older than the threshold for that stage | 30 days |

## 3. Features

### Shown

- **Header.** "Deals", the pipeline name when there is more than one, scope (Mine, My team, All), period (Closing: any time, this month, this quarter, next quarter, overdue), search, Board or Table, and "New deal".
- **Forecast strip.** Commit, Best case (commit plus best case), Pipeline (all open), Closed won, each as count and sum for the current scope and period. Omitted appears only when its count is above zero. For an AE with direct reports a fifth figure sits beside them, observed and required on one line: **"Coverage 3.1x · this team's 20% win rate needs 5.0x"**. Either number alone is unreadable, so neither is shown alone. The pair is **read, not recomputed here**: the win rate and the coverage it requires are computed once in [12 Reports](12-reports.md) at the foot of the stage-to-stage conversion door, and this strip prints the same figure word for word, so the board and the Pipeline report can never disagree about what coverage is enough.
- **Board.** One column per open stage in pipeline order; header shows stage, count and sum. Closed won is a narrow rail at the right with count and sum; clicking it expands it into a column. There is no lost rail: a deal that is lost is archived and leaves the board, and the filter "Archived deals and the reason each was lost" brings them back into view.
- **Card.** Deal name (link to the record), company, amount, **next step with its date on the same line** ("Security review · Thu 18 Sep", or "No next step" where there is none), close date, and, for the AE, the forecast category. Next step and its date are never separated: a next step without a date is a wish, and the record shows them together, so the card does too.
- **The warnings on the card**, as text chips, never colour alone, each printing the observed number against its threshold:

  > No activity · 19d of 14 — Ghosted · 24d of 21 — Overdue · 3d — Too few contacts · 2 of 3 — No senior sponsor — Stalled in stage · 41d of 30

  A chip appears only when its warning fires, which is object state, not history (rule 6). The number and the threshold travel together because a bare "Stale" tells the AE nothing she can act on, and the threshold lives in Settings where she cannot see it from here.
- **The touch pair.** "Last touch 3d · last reply 19d" replaces the single stale line. Our activity and theirs are two different facts and the gap between them is the deal's real temperature.
- Other object-state markers: "Not syncing to CRM"; the agent proposal card. Owner initials sit on the card where the role's usage puts them at level one (the admin, Halyard, and an AE with direct reports), else inside the quick look.
- **Table view.** Built on `TablePage`. Columns: Deal, Company, Stage, Amount, Forecast, Close date, **Next step and its date in one column**, Owner, Last touch and last reply, Warnings, Days in stage. Same scope, period, search and filters.

### Actions

| Action | Where | Outcome |
|---|---|---|
| Open record | Card title, Enter on a card, table row | The deal record |
| Drag to stage | Pointer or touch; Space, arrows, Space | Stage changes; toast "Moved to Proposal. Undo"; live region announces |
| Move to stage | Card menu, stages listed flat | Same as drag |
| Edit in place | Click amount, close date or next step | Becomes an input; Enter saves, Escape cancels. The next-step editor is **one control with two fields, the text and its date**, saved together: a next step with no date is not a next step, and an editor that can save one without the other invites exactly that |
| Close won | Drop on the rail, or menu | A sheet on the card states what happens: pushed to the CRM where connected, account moves to Customer success, counted as Closed. Confirm or cancel |
| Mark lost and archive | Card menu | A sheet states what happens: a reason is required, the deal leaves the board and the forecast, it stays on the company and in Reports, and the CRM opportunity is not deleted. Confirm or cancel; Undo in the toast |
| Reopen | Menu on a closed card, or from the archived filter | Back to the last open stage |
| Log a call or note | Card menu | Short form in a drawer; saved to the deal's activity |
| Change owner, change forecast category | Card menu | Inline select |
| Use this next step, or dismiss it | Buttons on the card, the same size | The buttons read **"Use this next step · Dismiss"**, not Approve and Decline: setting a next step is cheap and reversible, it is applied with Undo in the toast, and the ledger records it either way. Approve and Decline are reserved for the irreversible and the costly, so that the words keep their meaning where they matter. The deal's owner approves their own agent's proposals and the admin may approve for anyone, as the approval policy in Settings says. Research, scoring and saved drafts are logged, not queued; only an irreversible or costly act (sending the email, moving the stage, spending above the credit cap) waits for a person, and the card states which it is. Proposals wait on the card for the next time the AE looks at the deal; nothing interrupts a person mid-task |
| New deal | Header button, N | Drawer: name, company, pipeline (if more than one), stage, amount, close date, owner, next step |
| Bulk: change owner, move, change close date, export, delete | Selection bar on checking cards or rows | Applies to the selection; delete asks once and names what goes |
| Export, Import, Print, Edit stages | Page menu "Import, export, print and stages" | Export downloads the view; import opens a CSV drawer; print expands all; Edit stages goes to Settings › Pipeline and data |
| Delete | **Not on the card.** The deal record's header carries it with its consequence visible without a click, and the bulk bar carries it for a selection, naming what goes | The record's dialog: "Delete Northwind · Platform? Its 14 activities and notes go with it. The CRM opportunity is not deleted." The bulk bar names the count and the same consequence. A card menu is a door, and a destructive action whose consequence only appears after the door is opened is behind a door (rule 7) |

### Filters, search, sorting, columns

- Level one: scope, period, search (deal name, company, owner, next step), and two counting chips: **"No next step (n)"** and, where the seat has reports, **"Comments waiting for you (n)"**. Both are filters that carry their own count, so the number is read without opening anything and clicking applies it.
- The filter door, **"Filters: warnings, no next step, owner, forecast category, amount, company, created, archived and its reason, custom fields"**, opens in place under the header and shows "2 filters on". Warnings is first, and each of the six carries its count inside the door. The old "stale" filter is gone: it was one of the six warnings without a name, and the door now says which one it means. Owner and forecast category sit at level one for the admin at Meridian and Halyard and for an AE with reports, who reads the board by rep.
- Cards are ordered by close date within a column; other orders, table columns ("Columns, 10 of 16"), density and saved views live in the view options door. Table sorts by any header.

### States

| State | Shown |
|---|---|
| Empty workspace | Stage columns with "No deals yet", buttons New deal and Import CSV |
| No match | "Nothing matches. Clear search or filters" with a clear button; columns stay |
| Empty column | "0 · $0" and a visible drop target |
| Loading | Column skeletons with the stage names from settings |
| Error | "Deals could not load. Retry" in the board area; header stays usable |
| No access | "Deals is for account executives, customer success and admins. At Meridian Software, Elena Vasquez or Daniel Okafor can open it." |
| Cannot move | A Meridian CSM dragging another's deal: refused, and the card says "Owned by Elena Vasquez. Only the owner or an admin can move it" |

### Keyboard and shortcuts

Tab reaches every control, header and card. J and K move between cards, left and right between columns, Enter opens, Space picks up and drops (the ARIA drag pattern), Escape cancels, M opens the move list, E edits the next step, N new deal, / search, B and T switch view, Z undoes. ⌘K opens the palette; every command shows its shortcut, and "Keyboard shortcuts" is an entry in the palette and the page menu.

### Accessibility

Each column is a list named "Proposal, 12 deals, 480,000 dollars"; each card a list item named for the deal. Overdue and stale carry text, never colour alone. Every door is a button with `aria-expanded`. Moves are announced. Focus is visible; reveals take 150–240 ms and respect reduced motion. Nothing is hover-only.

### Phone width

Columns become one column with a row of stage chips at the top, each with count and sum. The strip is a two-by-two grid. Moves go through the card menu; long-press drag also works. The table becomes a card list. The doors are the same doors.

### By role and by business

An account executive with direct reports is not a sixth seat. It is an AE seat with `reports > 0` (IA-MAP 6.4j), and it changes three things on this page. At Meridian that seat is Priya Raman, the sales manager, and Elena Vasquez reports to her.

| | AE | AE with reports | CS | Admin |
|---|---|---|---|---|
| Meridian | Scope defaults to Mine; owner inside the quick look; owner and forecast filters inside the filter door | Scope defaults to **My team**; owner on the card at level one; the owner filter in the header beside scope; the coverage figure in the strip; the "Comments waiting for you (n)" chip | Scope All; strip collapsed to its door; card shows name, company, amount, close date | Scope All; owner on the card; owner and forecast filters in the header; weighted sum in the column header |
| Fathom | No AE seat exists | No such seat | No seat | The founder's admin seat works the pipeline, and the Founder-led outbound profile puts Deals in her sidebar; scope All; no pipeline picker; no CRM badges (removed); agent proposals common; strip at level one |
| Halyard | No seat | No such seat | No seat | One small pipeline per client workspace, with the workspace's name shown by the shell's top bar rather than by this page; owner on the card; strip is a door; saved views per client |
| Ridgeline | Pipeline picker at level one | Ridgeline declares one AE seat and no reports, so the column does not apply | Pipeline picker and New deal at level one; next step and close date on the card | Sync badges where the CRM is connected |

## 4. Usage items

Method: USAGE-MODEL.md. Baseline is Meridian. Overrides: F = Fathom admin, H = Halyard admin, R = Ridgeline (role named). Critical items (rule 7) are marked * and are level one regardless. Data: `src/ollopa/usage/deals.ts`. Fathom and Halyard have declared only an admin and an SDR seat, and `weeklyUse` returns zero for a seat a business does not have (`SEATS` in `usage/model.ts`), so no AE or CS first screen is ever computed there. The shared table behaviours used by the table view are specified once in [02 People](02-people.md); this spec records only the board's own.

| Item | Area | AE | CS | Admin | Overrides |
|---|---|---|---|---|---|
| Stage columns | Board | 95 | 20 | 40 | F 90, H 35, R cs 60 |
| Deal name and company | Board | 95 | 20 | 40 | F 90, H 35, R cs 60 |
| Amount | Board | 90 | 20 | 40 | F 85, H 30, R cs 50 |
| Next step, with its date | Board | 80 | 10 | 10 | F 70, H 25, R cs 40 |
| Close date | Board | 75 | 20 | 25 | F 60, H 20, R cs 55 |
| Owner | Board | 15 (AE+ 60) | 10 | 60 | F 10, H 35, R cs 15 |
| Days in stage | Board | 18 | 4 | 15 | F 8, R ae 10 |
| Last activity | Board | 15 | 8 | 15 | F 8, H 8 |
| Forecast category on the card | Board | 15 | 3 | 15 | F 6, H 2 |
| Stage probability | Board | 4 | 1 | 3 | |
| Contacts on the deal | Board | 4 | 3 | 1 | |
| Original currency when it differs | Board | 3 | 0 | 2 | R 0 (removed) |
| CRM sync error on the card * | Board | 3 | 1 | 20 | F 0, H 0 (removed), R admin 10 |
| Agent-proposed next step awaiting approval * | Board | 12 | 2 | 5 | F 35, R ae 18, cs 10 |
| The six warnings, each with its number against its threshold | Board | 80 (AE+ 85) | 15 | 40 | F 60, H 25, R ae 50, cs 30 |
| Last touch and last reply, side by side | Board | 45 (AE+ 50) | 10 | 20 | F 35, H 15, R ae 30, cs 20 |
| Count and sum per column | Board | 85 | 15 | 40 | F 70, H 35, R cs 30 |
| Weighted sum per column | Board | 12 | 2 | 30 | F 2, H 3 |
| Stale deals per column | Board | 4 | 0 | 12 | |
| Drag a card to another stage | Board | 70 | 8 | 10 | F 65, H 15, R cs 30 |
| Move to a stage from the card menu | Board | 10 | 4 | 3 | |
| Closed won rail | Board | 15 | 4 | 15 | F 10, H 10 |
| Collapse a stage column | Board | 4 | 1 | 2 | |
| Order cards within a column | Board | 3 | 0 | 3 | |
| Expand or collapse all cards | Board | 4 | 2 | 4 | |
| Board or table | Views | 18 | 8 | 15 | F 6, H 10, R cs 12 |
| Sort the table | Views | 12 | 5 | 15 | F 4 |
| Choose table columns | Views | 4 | 2 | 8 | |
| Saved views | Views | 4 | 1 | 4 | F 1, H 12 |
| Pipeline picker | Views | 6 | 12 | 10 | F 0, H 0 (removed), R ae 45, cs 45, admin 20 |
| Card density | Views | 2 | 0 | 1 | |
| Mine, my team or all | Filters | 65 | 25 | 45 | F 6, H 15, R cs 35 |
| Search | Filters | 40 | 15 | 25 | F 15, H 25 |
| Closing period | Filters | 55 | 15 | 35 | F 30, H 6, R cs 30 |
| Owner filter | Filters | 4 (AE+ 55) | 6 | 45 | F 2, H 30 |
| Forecast category filter | Filters | 12 | 2 | 35 | F 2, H 3 |
| Filter by warning (the six, each with its count) | Filters | 80 (AE+ 80) | 15 | 40 | F 45, H 25, R ae 50, cs 25 |
| No next step (n), as a chip at level one | Filters | 60 (AE+ 60) | 10 | 30 | F 35, H 20, R ae 45, cs 20 |
| Comments waiting for you (n) | Filters | 20 (AE+ 55) | 6 | 10 | F 4, H 4, R ae 12 |
| Amount range | Filters | 3 | 1 | 3 | |
| Company | Filters | 4 | 8 | 3 | R cs 15 |
| Created date | Filters | 2 | 0 | 4 | |
| Custom deal fields | Filters | 2 | 0 | 4 | F 0 (removed) |
| Archived deals and the reason each was lost | Filters | 2 | 0 | 4 | |
| Open the deal record | Actions | 95 | 20 | 35 | F 90, H 30, R cs 60 |
| Edit amount, close date or next step in place | Actions | 55 | 8 | 10 | F 50, H 15, R cs 30 |
| New deal | Actions | 15 | 4 | 4 | F 30, H 15, R ae 18, cs 30 |
| Log a call or note from the card | Actions | 15 | 6 | 2 | F 15, R ae 8 |
| Change forecast category | Actions | 10 | 1 | 3 | |
| Change owner | Actions | 3 | 2 | 12 | F 2, H 10 |
| Close won, showing what happens next * | Actions | 15 | 4 | 3 | F 20, R cs 15 |
| Mark lost and archive, with a reason * | Actions | 18 | 3 | 3 | F 20, R cs 10 |
| Reopen a closed deal | Actions | 2 | 0 | 2 | |
| Bulk: change owner | Actions | 1 | 0 | 12 | F 2, H 8 |
| Bulk: move to a stage | Actions | 3 | 0 | 4 | |
| Bulk: change close date | Actions | 3 | 0 | 4 | |
| Export CSV | Actions | 4 | 2 | 12 | F 3, H 10 |
| Import CSV | Actions | 0 | 0 | 1 | F 2 |
| Delete deal, showing what is lost * (on the record and in the bulk bar, not the card) | Actions | 2 | 0 | 3 | |
| Edit stages (opens Settings) | Actions | 2 | 0 | 4 | F 8 |
| Print the board | Actions | 1 | 0 | 2 | |
| Forecast strip | Forecast | 45 | 6 | 40 | F 30, H 8, R ae 40, cs 15 |
| Coverage against required coverage | Forecast | 12 (AE+ 70) | 1 | 15 | F 8, H 5, R ae 10 |
| Omitted deals in the period | Forecast | 3 | 0 | 4 | |
| Keyboard shortcuts | Shortcuts | 10 | 2 | 4 | |
| Command palette | Shortcuts | 8 | 3 | 4 | F 6 |

**Shape check** (66 items, computed with `shape()` from `model.ts`):

| Pair | Head | Body | Tail |
|---|---|---|---|
| Meridian, AE | 18 (27%) | 20 (30%) | 28 (42%) |
| Meridian, admin | 19 (29%) | 18 (27%) | 29 (44%) |
| Fathom, admin | 19 (29%) | 14 (21%) | 33 (50%) |
| Halyard, admin | 13 (20%) | 20 (30%) | 33 (50%) |
| Ridgeline, AE | 18 (27%) | 20 (30%) | 28 (42%) |
| Ridgeline, CS | 17 (26%) | 13 (20%) | 36 (55%) |
| Meridian, CS | 6 (9%) | 20 (30%) | 40 (61%) |

Halyard's admin is inside the band. Five pairs are two to four points over it and one is under, and both directions are stated rather than fitted.

The overshoot has one cause: this pass added the six deal warnings, the touch pair, the warning filter, the no-next-step chip, the comments chip and the coverage figure, and removed the two unnamed "stale" items they replace. Every one of them is something an AE reads on a Monday morning, so every one lands in the head. Two to four points over a band drawn from Word in 2000 and Pendo's 2024 median is not a reason to re-rate a number downward; re-rating one to fit the band is exactly the lie the check exists to catch. The page also did not get deeper as it got wider: the warnings are chips on the card, the chips are counting filters at level one, and the card's door was deleted in this same pass.

Meridian's CSMs visit for handoffs only, so their head is under the band by design; the CS view is deliberately lean.

## 5. Before: the common version

Modelled on Apollo's Deals page as documented in its knowledge base (articles updated 30 August to 3 September 2026) and reviews.

**Navigation and default.** Deals sits under "Win deals" beside Meetings and Conversations ([Apollo settings map](../knowledge-base/sources/07-apollo-settings-map.md), §6). The page opens as a table sorted by creation date: "By default, your deals are arranged in a table view and ordered chronologically by creation date" ([Access and Manage Deals](https://knowledge.apollo.io/hc/en-us/articles/27945345029645-Access-and-Manage-Deals)). The board is a door away: "Click View options… switch between table or kanban board and add or remove fields from your layout" (same). Inside View options sit "Fields", "Filters" and "Group by" ([Customize Your Apollo Layout](https://knowledge.apollo.io/hc/en-us/articles/15065640273165-Customize-Your-Apollo-Layout)), so a card field change is level three.

**What is not on the board.** The KB documents no default card fields, no per-column sums and no drag; drag is asserted only by a third-party comparison (The SaaS Source: "a standard Kanban board with drag-and-drop stages"; unverified). Forecast categories are set per stage in Settings ("choose the deal type, probability, and forecast category", [Set Up Deals](https://knowledge.apollo.io/hc/en-us/articles/40691781463437-Set-Up-Deals)) but appear on no card; they surface in a pie chart on a separate Analytics tab, "Forecasted Revenue by Category… Pipeline, Closed, Omitted, and Other", as do at-risk deals, "Deals for Follow-Up" ([Report on Deals](https://knowledge.apollo.io/hc/en-us/articles/27459823138573-Report-on-Deals)).

**Depth and scatter.** Stages: Settings › Objects, fields, stages › Deal fields & stages › Pipelines › Create stage, four levels. The deal form is customised inside a create dialog: "Deals › Create deal › Customize deal form". Currency is a third place: Settings › Deal fields & stages › Currency (all [Set Up Deals](https://knowledge.apollo.io/hc/en-us/articles/40691781463437-Set-Up-Deals)). Export leaves the page: "Edit export CSV settings… in Settings › CSV Export Settings" ([Access and Manage Deals](https://knowledge.apollo.io/hc/en-us/articles/27945345029645-Access-and-Manage-Deals)).

**Silent gaps.** "By default, only Apollo admins can access or edit deals" ([Set Up Deals](https://knowledge.apollo.io/hc/en-us/articles/40691781463437-Set-Up-Deals)). A rep without the permission sees nothing: "If you don't see deals, you may not have the necessary permissions. Contact an Apollo admin" ([Access and Manage Deals](https://knowledge.apollo.io/hc/en-us/articles/27945345029645-Access-and-Manage-Deals)). The permission has six parts (view, delete, change ownership, assign, edit currency, bulk import) the page never explains.

**Destructive action.** Delete is behind an ellipsis on the record, "Click … › Delete deal" (same article), with no statement of what goes with it. Whether the board can delete is unverified.

**Complaints with a source.** "too many clicks to reach data many navigation buttons seems to be not in the logical place" (Hassnaa, Trustpilot, 4 Sep 2026); "navigating between campaigns, contacts, and analytics feels like one click too many each time" (G2 via SyncGTM, secondary); "Name of the features is a bit confusing to me" (Capterra). Reviews call the module "lightweight deal management" with "basic reporting, no forecasting" (The SaaS Source, secondary); Apollo's KB says the HubSpot deals sync "doesn't support forecasting" ([Set Up Deals](https://knowledge.apollo.io/hc/en-us/articles/40691781463437-Set-Up-Deals)). Quotes are collected in the [Apollo settings map](../knowledge-base/sources/07-apollo-settings-map.md), §3.

**Praise to keep.** Saved views that "sync across sessions" and one-click bulk export (Salesforge hands-on review of Apollo; secondary, and not confirmed by Apollo's own knowledge base). Both stay.

## 6. After: the disclosed version

**Layout.** Header row (title, pipeline picker where it applies, scope, period, search, Board or Table, New deal). Forecast strip. Board columns, or the table. A page menu at the far right, "Import, export, print and stages". Nothing else at level one.

**Level one and level two by role** (Meridian; other businesses follow the overrides in section 4):

| Role | Level one | Level two |
|---|---|---|
| AE | Columns with count and sum; card with name, company, amount, next step **with its date**, close date, **forecast category**, the warning chips and the touch pair; drag; scope; period; search; the "No next step (n)" chip; edit in place; forecast strip; close won; mark lost and archive | The quick look. Filter door, warnings first. View options. Card menu. Page menu |
| AE with reports | As the AE, plus scope defaulting to My team, owner on the card, the owner filter beside scope, the coverage figure in the strip, and the "Comments waiting for you (n)" chip | The same doors |
| CS | Columns; card with name, company, amount, close date, next step with its date and the warning chips; scope; open record; close won; mark lost and archive | The quick look. Strip collapsed to "Forecast for this quarter". Same doors |
| Admin | As AE plus owner on the card, weighted sum in the header, owner and forecast filters in the header, sync badges | The rest of the filter door; the same menus |

Forecast category is level one on the card for the AE, matching the record. It was in the card's door and the record's header at the same time, which meant the same fact sat at two levels depending on which page you were on; one fact, one level.

**Every door, label and container.**

| Door | Label | Container | Persists |
|---|---|---|---|
| Card (the quick look, `Q-deal`) | The card itself is the control: clicking it opens a flat drawer beside the board | Drawer, level one of the record, no doors inside it | Width per user; it opens on the card that was clicked |
| Column header | "Weighted total and stale deals" | In place under the header | Per column |
| Closed won rail | "Closed won · 9 · $612k" | Expands into a column | Per user |
| Filters | "Filters: warnings, no next step, owner, forecast category, amount, company, created, archived and its reason, custom fields", with "n filters on" | In place under the header | Open state and values |
| Forecast strip (CS, Halyard) | "Forecast for this quarter: commit, best case, pipeline, closed won" | In place | Per user |
| View options | "View: table columns, card order, density, saved views" | Popover | Values |
| Card menu | "…", named "Actions for Northwind · Platform: open, next step, log, owner, forecast, move, close won, mark lost" | Menu: Open, Edit next step, Log a call or note, Change owner, Change forecast category, Move to (the five stages, flat), Close won, Mark lost and archive. **No Delete**: it lives on the record, where its consequence is visible without a click, and in the bulk bar | n/a |
| Page menu | "Import, export, print and stages" | Menu | n/a |
| New deal; Log a call or note | Button; menu item | Drawer | Draft kept |
| Close won; mark lost and archive | Drop or menu item | Sheet on the card | n/a |
| Delete | Menu item | Dialog (a confirmation, not a disclosure) | n/a |

**The quick look.** The card's door is gone. A card no longer expands under itself into "Owner, activity and forecast"; clicking it opens `Q-deal`, a flat drawer beside the board holding **stage, amount, close date, next step with its date, owner, last activity** — the same fields, in the record's order, with the record's labels. It is the top of the record cut short, which is the test the quick-look pattern sets: remove the drawer and you lose only speed.

It is read-only except for one field, and which one depends on ownership:

- **The owner** edits the stage, because moving a deal is the whole reason to glance at it from a board.
- **Anyone else** — the manager on My team, the admin, the CSM — gets the comment composer instead. They came to say something to the owner, not to move someone else's deal, and the board already refuses that move.

A footer link, "Open the deal record", is the only way deeper. Table to drawer is one level; table to record is one level; the drawer has no doors, so nothing here reaches three. The old card door was a second version of the record growing inside the board, which is what the pattern's test forbids.

No door contains a door: the move list is flat, the filter row has no sub-menus, the popover has no tabs.

**Decision-critical, always visible.** The consequence of closing is on the sheet before the drop lands. That sentence has one owner: [09 Deal record](09-deal-record.md) §3.2 writes it and this page renders it word for word, so the board and the record can never say two different things about what closing a deal does. So is the consequence of archiving a lost deal (off the board, out of the forecast, kept on the company). The six warnings are on the card with their numbers and thresholds, because a deal that nobody has touched in three weeks is state the AE answers for. A pending agent proposal and a CRM sync error are on the card, and the proposal states what using it will do. Delete is not on the card at all: it is on the record with its consequence in view, and in the bulk bar naming what goes. Undo for a move is as short as the move.

One caution the evidence forces. Showing someone a pending agent action is not the same as having it reviewed: asked to approve step by step, people saw a planted problematic action 88.5% of the time and stopped it 23.9% (Chen et al., N=48, in [11 What changed](../knowledge-base/11-what-changed-2018-2026.md)). That is why the board queues nothing that can be undone cheaply, states the consequence on the item rather than in a policy page, and keeps the number of approvals small enough to be read.

**Removed rather than hidden.** A sixth "Closed lost" column and an outcome flag: a lost deal is archived with a reason, so the board shows the five stages a live deal passes through. The creation-date default sort. The pipeline picker where there is one pipeline. CRM badges where no CRM is connected. The custom-field filter where no custom fields exist. The currency line where one currency is used. "Group by" anything other than stage. "Customize deal form" from the create dialog; Settings › Pipeline and data owns it and the page menu links there. The separate Analytics tab; the strip is on the board and Reports has the rest. Deal type on the card, except for the CS seat, where every deal is a renewal or an expansion and the type is the first thing read (see 09). The card's own door, deleted in favour of the quick look. Delete from the card menu. A bare "Stale" marker with no number and no threshold behind it.

**Persistence.** View, scope, period, filters, open doors, expanded rails and cards, table columns and sort, per user per workspace, in localStorage under `ollopa.deals.<business>.<role>`. A door left open is open next visit. Print expands every door and rail into a list by stage.

**Accelerators.** The shortcuts in section 3, shown in the palette and every menu item. "Expand all cards" and "Filters open" persist, so a daily user never touches a door. Bulk actions on selection. Undo with Z. Nothing moves on its own; there is no "Recent".

**Instrumentation and review.** Every door and menu logs opens per role and business. Twice a year, level-two items above 20% in a segment are promoted and items under 3% everywhere are deletion candidates (first: card density, print, created-date filter).

**Score.**

| # | Point | Score | Why |
|---|---|---|---|
| 1 | Decision-critical visible | 2 | Close consequences (owned by 09), the six warnings with their numbers, sync errors, agent proposals, and delete moved to where its consequence is visible without a click |
| 2 | Every visible item backed by a number | 2 | Sixty-six items in `deals.ts`. Five of the seven pairs now sit two to four points above the head band after the warnings arrived; the numbers are stated with their cause in section 4 rather than re-rated to fit |
| 3 | Two levels on every screen size | 2 | Flat move list, no sub-menus; the card's door replaced by a flat quick look whose only route deeper is the record; phone keeps the same doors |
| 4 | Doors labelled by content, chevron and text | 2 | No "More", "Advanced" or "Other" |
| 5 | Doors adjacent, keyboard and touch | 2 | Card door under the card, column door under the header, filter row under the header; every door a button |
| 6 | Dependent information together | 2 | Sum with weighted sum; amount with currency; close with its consequence; archiving with its reason |
| 7 | State persists; expand all and print | 2 | Listed above |
| 8 | User action or object state only | 2 | Badges by object state; nothing reorders by history |
| 9 | Instrumented and reviewed | 1 | The plan exists; the demo cannot show a completed review |

Total 17 of 18.

## 7. Lesson steps

Not a lesson. The rules that mattered most:

- **Rule 1.** The board, sums, next step with its date and the six warnings are what AEs touch daily; they are level one, and the table is the alternative, not the default.
- **Rule 5.** Next step and its date, an observed number and its threshold, and coverage and required coverage are three pairs that are useless apart, so none of them is ever split.
- **Rule 7.** Closing a deal, archiving a lost one, a failed sync, a pending agent proposal and delete all show their consequence without a click — and the number of things asking for approval is kept small, because a queue nobody can read is the same as hiding it.
- **Rule 2.** Stages, forecast categories and the deal form no longer live three settings places away; the page links once to one place, and no menu holds a menu.
- **Rule 4.** Access failures name who can open the page; the filter door and card door say what they hold.

## 8. Review

| Check | Result |
|---|---|
| All roles covered | AE, AE with reports, CS and admin have level-one tables; SDR and marketer have the no-access state. Gap: no column described an AE with direct reports, although IA-MAP 6.4j names the seat; closed with the AE+ column and `ae_plus` numbers in `deals.ts`. Gap: the spec called Fathom's founder "the AE". Closed: Fathom has no AE seat; the founder's admin seat works the pipeline and her workspace profile puts Deals in the sidebar |
| All four businesses covered | Section 3 table and section 4 overrides. Gap: only the admin opens the page at Halyard; stated |
| Every field has a source | Section 2. Gap: forecast category, days in stage and the archive fields were missing from the seed; listed |
| Five stages | Gap: an earlier draft added a sixth stage, Closed lost. Closed: five stages, defined once in 09; a lost deal is archived with a reason and leaves the board and the forecast |
| Every action has an outcome | Section 3 actions table |
| Empty, error, no-access states | Section 3, plus no-match, empty column and cannot-move |
| Keyboard | Full list, ARIA drag pattern, undo |
| Phone width | Chips for columns, menu for moves, same doors |
| Decision-critical visible | The marked items in section 4, placed in section 6. Gap: delete sat in the card menu, so its consequence appeared only after a door was opened; closed by moving it to the record and the bulk bar. Gap: the card said "Stale, 21 days" without saying what 21 days was measured against; closed by the six named warnings, each printing its number against its threshold |
| Two levels maximum | Checked door by door; the move list was a sub-menu in the first draft and is now flat. Gap: the card's door had grown into a second version of the record, which the quick-look pattern forbids; closed by deleting it and opening `Q-deal` instead |
| Doors labelled by content | Section 6 table |
| Dependent fields together | Sum with weighted; amount with currency; close with consequence; archiving with its reason |
| State persists | Section 6 |
| Accelerators present | Shortcuts, palette, expand all, bulk, undo |
| Usage shape checked | Seven pairs recomputed from `deals.ts` after the warnings arrived; one fits, five are two to four points over and one is under, all stated with their cause in section 4 |
| Nothing hover-only | Card menu and edit in place work by click, keyboard and touch; the card door is a button |
| Role gaps explain themselves | No-access and cannot-move states name who can |
| No usage numbers or teaching text in the product | The page shows counts and sums of deals, never usage shares; numbers live in `deals.ts` and here |
