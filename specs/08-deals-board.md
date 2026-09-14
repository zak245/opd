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
| Stage | `Deal.stage` | Qualified, Discovery, Proposal, Negotiation, Closed won |
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
| `forecastCategory` | Pipeline, Best case, Commit, Closed, Omitted | Defaults from stage (Qualified, Discovery → Pipeline; Proposal → Best case; Negotiation → Commit; Closed won → Closed); one deal in ten overrides, two per business are Omitted |
| `stageEnteredAt`, `createdAt` | dates | Days in stage; created-date filter |
| `Closed lost` stage, `lostReason` | stage; Price, No decision, Competitor, Timing | One closed-lost deal per six open |
| `syncState` | synced, error, null | Only where a CRM is connected (Meridian, Ridgeline); one in twenty in error |
| `agentProposal` | string or null | A proposed next step awaiting approval; more often at Fathom |
| `currency` | ISO code, optional | A handful at Meridian and Halyard, to show conversion |
| Row count | generate `counts.openDeals` rows, not `min(openDeals, 40)` | Column counts must match the business |

## 3. Features

### Shown

- **Header.** "Deals", the pipeline name when there is more than one, scope (Mine, My team, All), period (Closing: any time, this month, this quarter, next quarter, overdue), search, Board or Table, and "New deal".
- **Forecast strip.** Commit, Best case (commit plus best case), Pipeline (all open), Closed won, each as count and sum for the current scope and period. Omitted appears only when its count is above zero.
- **Board.** One column per open stage in pipeline order; header shows stage, count and sum. Closed won and Closed lost are narrow rails at the right with count and sum; clicking a rail expands it into a column.
- **Card.** Deal name (link to the record), company, amount, next step, close date. Object-state markers: "3 days overdue"; "Stale, 21 days"; "Not syncing to CRM"; "Agent proposes: Send security questionnaire. Approve · Dismiss". Owner initials sit on the card where the role's usage puts them at level one (admin, Halyard), else inside the card's door.
- **Table view.** Built on `TablePage`. Columns: Deal, Company, Stage, Amount, Forecast, Close date, Next step, Owner, Last activity, Days in stage. Same scope, period, search and filters.

### Actions

| Action | Where | Outcome |
|---|---|---|
| Open record | Card title, Enter on a card, table row | The deal record |
| Drag to stage | Pointer or touch; Space, arrows, Space | Stage changes; toast "Moved to Proposal. Undo"; live region announces |
| Move to stage | Card menu, stages listed flat | Same as drag |
| Edit in place | Click amount, close date or next step | Becomes an input; Enter saves, Escape cancels |
| Close won | Drop on the rail, or menu | A sheet on the card states what happens: pushed to the CRM where connected, account moves to Customer success, counted as Closed. Confirm or cancel |
| Close lost | Drop on the rail, or menu | Same sheet; lost reason required |
| Reopen | Menu on a closed card | Back to the last open stage |
| Log a call or note | Card menu | Short form in a drawer; saved to the deal's activity |
| Change owner, change forecast category | Card menu | Inline select |
| Approve or dismiss an agent proposal | Buttons on the card | Approve sets the next step; both clear the badge and write to the agent log |
| New deal | Header button, N | Drawer: name, company, pipeline (if more than one), stage, amount, close date, owner, next step |
| Bulk: change owner, move, change close date, export, delete | Selection bar on checking cards or rows | Applies to the selection; delete asks once and names what goes |
| Export, Import, Print, Edit stages | Page menu "Import, export, print and stages" | Export downloads the view; import opens a CSV drawer; print expands all; Edit stages goes to Settings › Pipeline and data |
| Delete | Card menu, below a divider, consequence beside it | Dialog: "Delete Northwind · Platform? Its 14 activities and notes go with it. The CRM opportunity is not deleted." |

### Filters, search, sorting, columns

- Level one: scope, period, search (deal name, company, owner, next step).
- The filter door, "Filters: owner, forecast category, stale, amount, company, created, lost reason, custom fields", opens in place under the header and shows "2 filters on". Owner and forecast category sit at level one for the admin at Meridian and Halyard.
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

| | AE | CS | Admin |
|---|---|---|---|
| Meridian | Scope defaults to Mine; owner inside the card door; owner and forecast filters inside the filter door | Scope All; strip collapsed to its door; card shows name, company, amount, close date | Scope All; owner on the card; owner and forecast filters in the header; weighted sum in the column header |
| Fathom | No seat; the founder (admin) is the AE | No seat | Scope All; no pipeline picker; no CRM badges (removed); agent proposals common; strip at level one |
| Halyard | No seat | No seat | One small pipeline per client workspace; owner on the card; strip is a door; saved views per client |
| Ridgeline | Pipeline picker at level one | Pipeline picker and New deal at level one; next step and close date on the card | Sync badges where the CRM is connected |

## 4. Usage items

Method: USAGE-MODEL.md. Baseline is Meridian. Overrides: F = Fathom admin, H = Halyard admin, R = Ridgeline (role named). Critical items (rule 7) are marked * and are level one regardless. Data: `src/ollopa/usage/deals.ts`.

| Item | Area | AE | CS | Admin | Overrides |
|---|---|---|---|---|---|
| Stage columns | Board | 95 | 20 | 40 | F 90, H 35, R cs 60 |
| Deal name and company | Board | 95 | 20 | 40 | F 90, H 35, R cs 60 |
| Amount | Board | 90 | 20 | 40 | F 85, H 30, R cs 50 |
| Next step | Board | 80 | 10 | 10 | F 70, H 25, R cs 40 |
| Close date | Board | 75 | 20 | 25 | F 60, H 20, R cs 55 |
| Owner | Board | 15 | 10 | 60 | F 10, H 35, R cs 15 |
| Days in stage | Board | 18 | 4 | 15 | F 8, R ae 10 |
| Last activity | Board | 15 | 8 | 15 | F 8, H 8 |
| Forecast category on the card | Board | 15 | 3 | 15 | F 6, H 2 |
| Stage probability | Board | 4 | 1 | 3 | |
| Contacts on the deal | Board | 4 | 3 | 1 | |
| Original currency when it differs | Board | 3 | 0 | 2 | R 0 (removed) |
| CRM sync error on the card * | Board | 3 | 1 | 20 | F 0, H 0 (removed), R admin 10 |
| Agent-proposed next step awaiting approval * | Board | 12 | 2 | 5 | F 35, R ae 18, cs 10 |
| Stale marker | Board | 18 | 5 | 15 | |
| Count and sum per column | Board | 85 | 15 | 40 | F 70, H 35, R cs 30 |
| Weighted sum per column | Board | 12 | 2 | 30 | F 2, H 3 |
| Stale deals per column | Board | 4 | 0 | 12 | |
| Drag a card to another stage | Board | 70 | 8 | 10 | F 65, H 15, R cs 30 |
| Move to a stage from the card menu | Board | 10 | 4 | 3 | |
| Closed won and closed lost columns | Board | 15 | 4 | 15 | F 10, H 10 |
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
| Owner filter | Filters | 4 | 6 | 45 | F 2, H 30 |
| Forecast category filter | Filters | 12 | 2 | 35 | F 2, H 3 |
| No activity for 14 days | Filters | 18 | 6 | 15 | F 10 |
| Amount range | Filters | 3 | 1 | 3 | |
| Company | Filters | 4 | 8 | 3 | R cs 15 |
| Created date | Filters | 2 | 0 | 4 | |
| Custom deal fields | Filters | 2 | 0 | 4 | F 0 (removed) |
| Lost reason | Filters | 2 | 0 | 4 | |
| Open the deal record | Actions | 95 | 20 | 35 | F 90, H 30, R cs 60 |
| Edit amount, close date or next step in place | Actions | 55 | 8 | 10 | F 50, H 15, R cs 30 |
| New deal | Actions | 15 | 4 | 4 | F 30, H 15, R ae 18, cs 30 |
| Log a call or note from the card | Actions | 15 | 6 | 2 | F 15, R ae 8 |
| Change forecast category | Actions | 10 | 1 | 3 | |
| Change owner | Actions | 3 | 2 | 12 | F 2, H 10 |
| Close won, showing what happens next * | Actions | 15 | 4 | 3 | F 20, R cs 15 |
| Close lost, with reason * | Actions | 18 | 3 | 3 | F 20, R cs 10 |
| Reopen a closed deal | Actions | 2 | 0 | 2 | |
| Bulk: change owner | Actions | 1 | 0 | 12 | F 2, H 8 |
| Bulk: move to a stage | Actions | 3 | 0 | 4 | |
| Bulk: change close date | Actions | 3 | 0 | 4 | |
| Export CSV | Actions | 4 | 2 | 12 | F 3, H 10 |
| Import CSV | Actions | 0 | 0 | 1 | F 2 |
| Delete deal, showing what is lost * | Actions | 2 | 0 | 3 | |
| Edit stages (opens Settings) | Actions | 2 | 0 | 4 | F 8 |
| Print the board | Actions | 1 | 0 | 2 | |
| Forecast strip | Forecast | 45 | 6 | 40 | F 30, H 8, R ae 40, cs 15 |
| Omitted deals in the period | Forecast | 3 | 0 | 4 | |
| Keyboard shortcuts | Shortcuts | 10 | 2 | 4 | |
| Command palette | Shortcuts | 8 | 3 | 4 | F 6 |

**Shape check** (62 items, computed with `shape()` from `model.ts`):

| Pair | Head | Body | Tail |
|---|---|---|---|
| Meridian, AE | 13 (21%) | 21 (34%) | 28 (45%) |
| Meridian, admin | 15 (24%) | 18 (29%) | 29 (47%) |
| Fathom, admin | 15 (24%) | 15 (24%) | 32 (52%) |
| Halyard, admin | 10 (16%) | 20 (32%) | 32 (52%) |
| Ridgeline, AE | 14 (23%) | 20 (32%) | 28 (45%) |
| Ridgeline, CS | 13 (21%) | 14 (23%) | 35 (56%) |
| Meridian, CS | 6 (10%) | 17 (27%) | 39 (63%) |

Six pairs fit the published shape. Meridian's CSMs visit for handoffs only, so their head is under the band by design; the CS view is deliberately lean.

## 5. Before: the common version

Modelled on Apollo's Deals page as documented in its knowledge base (articles updated 30 August to 3 September 2026) and reviews.

**Navigation and default.** Deals sits under "Win deals" beside Meetings and Conversations ([Apollo settings map](../knowledge-base/sources/07-apollo-settings-map.md), §6). The page opens as a table sorted by creation date: "By default, your deals are arranged in a table view and ordered chronologically by creation date" ([Access and Manage Deals](https://knowledge.apollo.io/hc/en-us/articles/27945345029645-Access-and-Manage-Deals)). The board is a door away: "Click View options… switch between table or kanban board and add or remove fields from your layout" (same). Inside View options sit "Fields", "Filters" and "Group by" ([Customize Your Apollo Layout](https://knowledge.apollo.io/hc/en-us/articles/15065640273165-Customize-Your-Apollo-Layout)), so a card field change is level three.

**What is not on the board.** The KB documents no default card fields, no per-column sums and no drag; drag is asserted only by a third-party comparison (The SaaS Source: "a standard Kanban board with drag-and-drop stages"; unverified). Forecast categories are set per stage in Settings ("choose the deal type, probability, and forecast category", [Set Up Deals](https://knowledge.apollo.io/hc/en-us/articles/40691781463437-Set-Up-Deals)) but appear on no card; they surface in a pie chart on a separate Analytics tab, "Forecasted Revenue by Category… Pipeline, Closed, Omitted, and Other", as do at-risk deals, "Deals for Follow-Up" ([Report on Deals](https://knowledge.apollo.io/hc/en-us/articles/27459823138573-Report-on-Deals)).

**Depth and scatter.** Stages: Settings › Objects, fields, stages › Deal fields & stages › Pipelines › Create stage, four levels. The deal form is customised inside a create dialog: "Deals › Create deal › Customize deal form". Currency is a third place: Settings › Deal fields & stages › Currency (all [Set Up Deals](https://knowledge.apollo.io/hc/en-us/articles/40691781463437-Set-Up-Deals)). Export leaves the page: "Edit export CSV settings… in Settings › CSV Export Settings" ([Access and Manage Deals](https://knowledge.apollo.io/hc/en-us/articles/27945345029645-Access-and-Manage-Deals)).

**Silent gaps.** "By default, only Apollo admins can access or edit deals" ([Set Up Deals](https://knowledge.apollo.io/hc/en-us/articles/40691781463437-Set-Up-Deals)). A rep without the permission sees nothing: "If you don't see deals, you may not have the necessary permissions. Contact an Apollo admin" ([Access and Manage Deals](https://knowledge.apollo.io/hc/en-us/articles/27945345029645-Access-and-Manage-Deals)). The permission has six parts (view, delete, change ownership, assign, edit currency, bulk import) the page never explains.

**Destructive action.** Delete is behind an ellipsis on the record, "Click … › Delete deal" (same article), with no statement of what goes with it. Whether the board can delete is unverified.

**Complaints with a source.** "too many clicks to reach data many navigation buttons seems to be not in the logical place" (Hassnaa, Trustpilot, 4 Sep 2026); "navigating between campaigns, contacts, and analytics feels like one click too many each time" (G2 via SyncGTM, secondary); "Name of the features is a bit confusing to me" (Capterra). Reviews call the module "lightweight deal management" with "basic reporting, no forecasting" (The SaaS Source, secondary); Apollo's KB says the HubSpot deals sync "doesn't support forecasting" ([Set Up Deals](https://knowledge.apollo.io/hc/en-us/articles/40691781463437-Set-Up-Deals)). Quotes are collected in the [Apollo settings map](../knowledge-base/sources/07-apollo-settings-map.md), §3.

**Praise to keep.** Saved views that "sync across sessions" and one-click bulk export (Salesforge hands-on review). Both stay.

## 6. After: the disclosed version

**Layout.** Header row (title, pipeline picker where it applies, scope, period, search, Board or Table, New deal). Forecast strip. Board columns, or the table. A page menu at the far right, "Import, export, print and stages". Nothing else at level one.

**Level one and level two by role** (Meridian; other businesses follow the overrides in section 4):

| Role | Level one | Level two |
|---|---|---|
| AE | Columns with count and sum; card with name, company, amount, next step, close date and object-state badges; drag; scope; period; search; edit in place; forecast strip; close won and lost; delete with consequence | Card door: owner, days in stage, last activity, forecast category, probability, contacts, currency. Filter door. View options. Card menu. Page menu |
| CS | Columns; card with name, company, amount, close date and badges; scope; open record; close won and lost; delete | Card door adds next step. Strip collapsed to "Forecast for this quarter". Same doors |
| Admin | As AE plus owner on the card, weighted sum in the header, owner and forecast filters in the header, sync badges | The rest of the filter door; the same menus |

**Every door, label and container.**

| Door | Label | Container | Persists |
|---|---|---|---|
| Card | "Owner, activity and forecast", chevron, owner initials as preview | In place under the card | Per user; "Expand all cards" sets all |
| Column header | "Weighted total and stale deals" | In place under the header | Per column |
| Closed rails | "Closed won · 9 · $612k", "Closed lost · 4 · $96k" | Expands into a column | Per user |
| Filters | "Filters: owner, forecast category, stale, amount, company, created, lost reason, custom fields", with "n filters on" | In place under the header | Open state and values |
| Forecast strip (CS, Halyard) | "Forecast for this quarter: commit, best case, pipeline, closed won" | In place | Per user |
| View options | "View: table columns, card order, density, saved views" | Popover | Values |
| Card menu | "…", named "Actions for Northwind · Platform" | Menu: Open, Edit next step, Log a call or note, Change owner, Change forecast category, Move to (stages flat), Close won, Close lost, divider, Delete with consequence text | n/a |
| Page menu | "Import, export, print and stages" | Menu | n/a |
| New deal; Log a call or note | Button; menu item | Drawer | Draft kept |
| Close won or lost | Drop or menu item | Sheet on the card | n/a |
| Delete | Menu item | Dialog (a confirmation, not a disclosure) | n/a |

No door contains a door: the move list is flat, the filter row has no sub-menus, the popover has no tabs.

**Decision-critical, always visible.** The consequence of closing (CRM push, handoff, counted as closed) is on the sheet before the drop lands. A pending agent proposal and a CRM sync error are on the card. Delete sits in the menu with its consequence beside it, and the confirmation names what goes. Undo for a move is as short as the move.

**Removed rather than hidden.** The creation-date default sort. The pipeline picker where there is one pipeline. CRM badges where no CRM is connected. The custom-field filter where no custom fields exist. The currency line where one currency is used. "Group by" anything other than stage. "Customize deal form" from the create dialog; Settings › Pipeline and data owns it and the page menu links there. The separate Analytics tab; the strip is on the board and Reports has the rest. Deal type.

**Persistence.** View, scope, period, filters, open doors, expanded rails and cards, table columns and sort, per user per workspace, in localStorage under `ollopa.deals.<business>.<role>`. A door left open is open next visit. Print expands every door and rail into a list by stage.

**Accelerators.** The shortcuts in section 3, shown in the palette and every menu item. "Expand all cards" and "Filters open" persist, so a daily user never touches a door. Bulk actions on selection. Undo with Z. Nothing moves on its own; there is no "Recent".

**Instrumentation and review.** Every door and menu logs opens per role and business. Twice a year, level-two items above 20% in a segment are promoted and items under 3% everywhere are deletion candidates (first: card density, print, created-date filter).

**Score.**

| # | Point | Score | Why |
|---|---|---|---|
| 1 | Decision-critical visible | 2 | Close consequences, sync errors, agent approvals and delete's consequence are on the surface |
| 2 | Every visible item backed by a number | 2 | Sixty-two items in `deals.ts`, fitted to the Nielsen, Pendo and McGrenere shape |
| 3 | Two levels on every screen size | 2 | Flat move list, no sub-menus; phone keeps the same doors |
| 4 | Doors labelled by content, chevron and text | 2 | No "More", "Advanced" or "Other" |
| 5 | Doors adjacent, keyboard and touch | 2 | Card door under the card, column door under the header, filter row under the header; every door a button |
| 6 | Dependent information together | 2 | Sum with weighted sum; amount with currency; close with its consequence; lost with reason |
| 7 | State persists; expand all and print | 2 | Listed above |
| 8 | User action or object state only | 2 | Badges by object state; nothing reorders by history |
| 9 | Instrumented and reviewed | 1 | The plan exists; the demo cannot show a completed review |

Total 17 of 18.

## 7. Lesson steps

Not a lesson. The rules that mattered most:

- **Rule 1.** The board, sums and next step are what AEs touch daily; they are level one, and the table is the alternative, not the default.
- **Rule 7.** Closing a deal, a failed sync, a pending agent proposal and delete all show their consequence without a click.
- **Rule 2.** Stages, forecast categories and the deal form no longer live three settings places away; the page links once to one place, and no menu holds a menu.
- **Rule 4.** Access failures name who can open the page; the filter door and card door say what they hold.

## 8. Review

| Check | Result |
|---|---|
| All roles covered | AE, CS, admin have level-one tables; SDR and marketer have the no-access state. Gap: the Fathom SDR had no line; closed by naming the founder |
| All four businesses covered | Section 3 table and section 4 overrides. Gap: only the admin opens the page at Halyard; stated |
| Every field has a source | Section 2. Gap: forecast category, days in stage and closed lost were missing from the seed; listed |
| Every action has an outcome | Section 3 actions table |
| Empty, error, no-access states | Section 3, plus no-match, empty column and cannot-move |
| Keyboard | Full list, ARIA drag pattern, undo |
| Phone width | Chips for columns, menu for moves, same doors |
| Decision-critical visible | Five items marked in section 4, placed in section 6 |
| Two levels maximum | Checked door by door; the move list was a sub-menu in the first draft and is now flat |
| Doors labelled by content | Section 6 table |
| Dependent fields together | Sum with weighted; amount with currency; close with consequence; lost with reason |
| State persists | Section 6 |
| Accelerators present | Shortcuts, palette, expand all, bulk, undo |
| Usage shape checked | Seven pairs computed; six fit; Meridian CS explained |
| Nothing hover-only | Card menu and edit in place work by click, keyboard and touch; the card door is a button |
| Role gaps explain themselves | No-access and cannot-move states name who can |
| No usage numbers or teaching text in the product | The page shows counts and sums of deals, never usage shares; numbers live in `deals.ts` and here |
