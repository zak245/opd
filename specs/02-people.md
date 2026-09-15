# People

*The contacts table. The SDR's home. A full page and lesson 2. Usage items: `src/ollopa/usage/people.ts`.*

*This spec owns the table template that the other table pages extend: sortable headers with the direction always drawn, a columns-and-density popover, a bulk bar that restates its count, an in-place filter row, skeleton loading, and row actions that appear on keyboard focus as well as hover and are repeated in a menu named for the record. Companies, Lists, Inbox, Tasks, Deals, Campaigns, Accounts and Reports cite the deltas from it rather than respecifying it.*

## 1. Purpose

People holds every contact in the workspace: 18,400 at Meridian, 2,200 at Fathom, 1,000 to 6,000 in each Halyard client workspace, 9,800 at Ridgeline. An SDR opens it many times a day to find who to work next and push them into a sequence or a list. An AE opens it daily to see everyone at an account and log a call task. A marketer opens it a few times a week to build an audience from a list. The RevOps admin opens it weekly to fix owners and check what synced. Customer success does not have the page in its navigation; Accounts serves them.

A contact is disclosed in two levels here, as every record in Ollopa is: a **quick look** drawer beside the table for the glance, and the **full record page** for the visit that dwells. Prospecting is a scanning task, so the SDR lives in the drawer; research is a dwelling task, so the AE opens the page.

The one thing nobody on this page may lose sight of: **what a click will cost and how many people it will touch.** Every action that spends credits prints the price on the control. Every bulk action repeats the count it will act on. Apollo's reviewers complain about two things above all: filters with a learning curve, and money or contacts moving without a clear moment of consent. Both are disclosure mistakes.

## 2. Data

Seed: `src/ollopa/data/seed.ts`. Businesses: `src/ollopa/data/businesses.ts`.

| Field | Source | Add to seed |
|---|---|---|
| Name, title, company, email, email status, stage, sequence, last activity, owner, phone exists | `Contact` fields already seeded | – |
| Company size band, industry | `Company.employees`, `Company.industry` joined by company name | – |
| Last contacted (last outbound touch) | – | `Contact.lastContacted` |
| Phone number, revealed | – | `Contact.phoneNumber`, `Contact.phoneRevealed` |
| Seniority, department | – | derived from the title list |
| Location, time zone | – | `Contact.location { city, country }`; zone from country |
| Lists | inline in `pages/tables.tsx` | `Contact.lists[]`, `Seed.lists[]` |
| Source, created, LinkedIn, job change, opens and replies, CRM id and sync date, custom fields, do not contact | – | one field each on `Contact`; two custom fields at Meridian |
| Technologies, signals with dates, funding, revenue, founded, headcount growth, keywords | – | on `Company` |
| Saved views | – | `SavedView { id, name, filters, columns, sort, owner, sharedWith, defaultFor: Role[] }`, seeded per business (§3) |
| Credit prices | `AgentEvent.credits` already uses 12 for research | `CREDITS = { enrich: 2, revealPhone: 8, revealEmail: 1, research: 12, export: 0 }`, defined once in `src/ollopa/data/credits.ts` and read by every page that spends credits (Companies, Lists, the deal record, Agents, Home); this spec no longer owns the values, it only prints them on its controls |
| Credit balance and cap | `businesses[].credits` | – |
| Per-user credit limit | Settings item `team.users` | `users[].creditLimit`: 5,000 a month at Meridian, none at Fathom |
| Counts | `businesses[].counts.contacts` | Seed grows to 800 contacts at Meridian, 220 Fathom, 600 Halyard, 400 Ridgeline; the header counts seeded rows so filter counts and the total agree |

Counts beside filter values are live: the number next to "Verified" is the number of rows you would get by clicking it now, with every other active filter applied.

## 3. Features

### Layout, top to bottom

1. **Header.** "People", the total, **Add people ▾** (search the database, import CSV, sync from CRM now; the first two are later cases and say so).
2. **Views row.** Chips for the role's views, the active one marked; **All views (n) ▾**; **Save view**.
3. **Filter bar.** Search box; the role's level-one filter chips; every *active* filter as a chip whatever its level; **All filters (31) ▾**; **Clear**. Right side: result count and **Columns and density ▾**.
4. **Selection bar.** Appears when at least one row is selected: "25 selected", **Select all 312 matching** with **Limit per company** beside it, the role's level-one bulk buttons, **Edit or export selected ▾**.
5. **Table.** Checkbox column, the role's columns, row actions.
6. **Footer.** "Show 25 more"; rows per page.

### Search

One box, `/` focuses it. Matches name, title, company and email. Combines with filters (AND). Clearing search keeps filters. Results and count update as you type, debounced 150 ms.

### Filters

Thirty-one filters in one flat panel; the head ones for the role are also chips in the bar. AND across filters, OR within one. Every value shows a live count.

| Group | Filters |
|---|---|
| Person | Title (type-ahead, "contains"); Seniority (5 values); Department (6); Location (country, city); Time in role; Languages; Time zone |
| Company | Company (type-ahead); Company size (5 bands); Industry (10); Technology; Keywords; Signals (chips, last 7/30/90 days); Funding stage; Revenue; Founded year; Headcount growth |
| Reach | Email (Verified only · Any · None · Bounced); Has phone; Not in a sequence; Not contacted in the last N days (default 14); Replied; Opened or clicked; Do not contact (excluded by default; the toggle says how many) |
| Ownership | Owner ("Me" first); Stage (7); In list; Synced to CRM; Source; Custom fields |
| History | Last activity date; Created date; Changed job recently |

Rules for every filter:

- A chip opens its picker in place, under itself. Enter applies, Escape closes. The chip then reads "Title: VP Sales, CRO ×".
- The panel is a non-modal side panel that pushes the table. Every filter is a flat field under a group heading; nothing inside expands. Top values and counts are printed, with a "search values" box for the rest. The panel can be pinned open; pinned state persists per user.
- An active level-two filter shows as a chip while active. A hidden cause is not allowed.
- **Clear** removes all filters and search in one click; `⌘Z` undoes it for 10 seconds.
- Filters that cannot apply are removed, not disabled: Fathom has no "Synced to CRM" (no CRM) and no "Custom fields" (none defined).

### Saved views

A view is a named set of filters, columns, sort and density, owned by a user, shareable with the workspace. Seeded defaults:

| Business, role | Default view | Filters | Extra columns |
|---|---|---|---|
| Meridian SDR | My prospects to work | Owner: me · Email: verified · Not in a sequence · Stage: Cold, Approaching | – |
| Meridian AE | My accounts' people | Owner: me · Stage: Replied, Interested, Meeting booked | Phone, Last activity |
| Meridian marketer | Audience: verified | Email: verified | Lists, Industry, Company size |
| Meridian admin | Everyone | none | Owner, Source, CRM |
| Fathom, both roles | To work this week | Email: verified · Not in a sequence · Signals in 30 days | Signals, Phone |
| Halyard SDR | Client ICP, one per workspace | Title, Company size, Industry, Location for that client | Location |
| Halyard admin | Everyone in this workspace | none | Owner, Source |
| Ridgeline SDR | Signals this week | Signals in 7 days · Stage not Not interested | Signals, Last activity |
| Ridgeline AE | My expansion accounts | Owner: me · Signals in 30 days | Signals, Last activity |

Actions: save (name field inline in the views row), rename, set as my default, share with everyone, email me when it gains people (daily or weekly), delete with undo. Switching views replaces filters, columns and sort. Editing a filter inside a view marks the chip "edited" and offers **Save** or **Revert** inline; nothing saves silently. A view lives in the workspace it was made in; at Halyard that is one client workspace.

### Columns, sorting, density

- **Columns and density ▾** holds a checklist of the 25 columns in display order, drag to reorder, **Reset to the SDR default** (named for the role), density (Comfortable, Compact) and rows per page (25, 50, 100). All of it persists per user and per view.
- Defaults are the head columns in §4. SDR: Name, Company, Email, Stage, Sequence, Last contacted. AE: adds Phone, Last activity, Owner; drops Sequence. Marketer: Name, Company, Email, Lists. Admin: Name, Company, Email, Owner. Fathom adds Signals and Phone; Ridgeline adds Signals and Last activity.
- **Sort.** Click a header to sort, again to reverse, a third time to clear. The arrow is always drawn. Secondary sort by name. Sort is part of the view.
- **Density.** Compact halves row padding and moves the title under Name into the row's accessible name and tooltip.
- Columns never move on their own. An added column goes to the end; the user drags it from there.

### Row actions

Every row has: the name as a link, the stage badge as an inline picker, the phone cell as a reveal button when unrevealed, up to five action buttons (on hover and on keyboard focus; on touch through the menu), and an **Actions for {name}** menu holding every row action with its shortcut.

| Action | Outcome | Level one for |
|---|---|---|
| Quick look | A flat drawer beside the table, the table still in view: photo-less header (name, title, company, owner), email and status, phone, stage, sequence and step, last contacted, do-not-contact state. Read-only except the stage badge, the one field the glance exists for. No doors and no sections inside it; it is the top of the record page, cut short. `Esc` closes it, `j`/`k` move it down the table without closing. | SDR; Halyard SDR; Fathom admin; Ridgeline SDR |
| Open the full contact record | The record page at `/people/:id`, from the shared record template (spec 09 owns the template): header, key fields, then related lists — companies' people, deals, activity, tasks — as scrolling sections, with doors only for long rarely-needed content (full history, enrichment, custom fields, files). At most one tab, and this record does not need it. Back restores scroll, selection and filters. | AE, everyone by link |
| Add to sequence | Picker of active sequences anchored to the row; Sequence cell updates; toast with undo. Already in one: the picker says so and offers to move. | SDR; Fathom admin |
| Add to list | Picker with "New list"; Lists cell updates; toast with undo. The toast links to People filtered to that list, not to the Lists page, because account executives and customer success do not hold Lists. | SDR, marketer |
| Create a call task | Task due today; toast links to Tasks. | SDR, AE |
| Change stage | The badge opens the seven stages. Not interested or Unresponsive also leaves the sequence, and says so before you confirm. | AE; Ridgeline SDR |
| Reveal phone · 8 credits | The phone cell button. One click; toast "Phone revealed · 8 credits · 1,839,992 left". No dialog: the price was on the button. | Cell button, always |
| Enrich · 2 credits | Refreshes email, title, company, phone. Enriched within 30 days: "Enriched 12 days ago · enrich again · 2 credits". | Fathom |
| Ask the research agent · 12 credits | Queues a run; toast links to Agents. | Fathom |
| One-off email; Copy email; Open the company; Edit fields; Add a note; Add to a deal | Compose drawer; clipboard; navigation; edit drawer with the note field; deal picker for that company. | Menu |
| Mark do not contact | Confirms in place: "Removes from all sequences and blocks outreach. Undo for 10 seconds." | Menu |
| Assign owner | User picker. Meridian: AE on their accounts, admin on all; the SDR's menu shows "Owner changes: Daniel Okafor (RevOps admin)" in its place. | Menu; admin body |
| Push to CRM now; Merge duplicate | Pushes with result or error text (absent at Fathom); side-by-side merge drawer. | Menu |
| Remove from workspace | Below a divider; undo for 10 seconds. Meridian SDR sees "Removal: Daniel Okafor (RevOps admin)". | Menu |

A picker or drawer that follows a chosen action is the action's form, not a third level. Doors reveal options; forms complete a choice already made.

### Bulk selection and actions

- Checkbox, `x` on a focused row, Shift-click for a range, `⌘A` for the page. **Select all 312 matching** names the count. **Limit per company** beside it caps per company and restates the result: "Select 212 people, up to 2 per company". They sit together because one changes the meaning of the other.
- Every bulk button repeats the count: **Add 25 to sequence**, **Add 25 to list**, **Enrich 25 · 50 credits**, **Export 25 · no credits**.
- Outcomes: Add to sequence skips people already in one ("3 skipped, already in a sequence"); Enrich skips people enriched within 30 days; Export opens a small panel (columns as shown or all fields, "no credits") and downloads; Change stage; Ask the research agent with cost; Email selected; Assign owner; Push to CRM; Merge (enabled only with exactly two selected, otherwise the item says "select two"); Remove.
- A spend above 100 credits confirms inline in the bar: "Enrich 312 people for 624 credits? 1,838,376 will remain. Enrich · Cancel". Below that, the button acts at once.
- Escape clears the selection. It survives paging and sorting; a filter change clears it with an undoable toast.

### Credit cost at the moment of intent

**A price is printed on the control that spends it, in the same words every time: "· 8 credits".** The toast after prints cost and remaining balance. Crossing the user's monthly limit: the control reads "Enrich · 2 credits · over your limit" and, clicked, explains "Your limit is 5,000 credits a month; 4,999 used. Daniel Okafor (RevOps admin) can raise it." Zero balance: "· no credits left" and who can add credits. Nothing is greyed; the control opens and explains.

### States

| State | Shows |
|---|---|
| Empty workspace | "No people yet." Search the database · Import CSV. No filter bar or views row. |
| No results | "Nothing matches. Remove 'Title: CFO' (would give 41) or clear all filters." Names the last chip added. |
| Loading | Skeleton rows in the current layout; counts "…"; last count stays, dimmed. |
| Error | "People could not load. Try again." Filters intact; a second failure adds "Copy details". |
| No access | An area the seat does not hold. CS following a link gets the shell's no-access page: "People is for SDRs, account executives, marketers and admins at Meridian. Ask Daniel Okafor (RevOps admin) if you need it." Link to Accounts. There is no read-only view of the table. |
| Partial permission | The item is replaced by a line naming who can. Never disabled. |
| Do not contact | Outreach actions replaced by "Do not contact, since 2026-08-30". |
| Unsaved view edits | Chip reads "My prospects to work · edited", Save and Revert. |

### Keyboard and shortcuts

| Key | Does |
|---|---|
| `/` | Focus search |
| `↑` `↓`, `j` `k` | Move row focus; the focused row shows its buttons |
| `Space` | Quick look on the focused row; again, or `Esc`, closes it |
| `Enter` | Open the focused contact's record page |
| `x`, `⇧x`, `⌘A` | Select row, extend, select page |
| `s` `l` `c` | Sequence, list, call task for the focused row or selection |
| `e` `p` `r` | Enrich, reveal phone, research: price appears inline, "Enter to spend 8 credits, Esc to cancel" |
| `t` | Change stage |
| `f`, `⇧F` | Open or close the filters panel; pin it |
| `v`, `1`–`9` | Views list; switch to the nth view |
| `⌘K` | Palette: every action with its shortcut printed |
| `?` | Shortcuts sheet |
| `Esc` | Close the open picker, else clear selection |
| `⌘Z` | Undo within 10 seconds |

Every menu item prints its shortcut; so does the palette, which teaches its own bypass.

### Accessibility

Table semantics; `aria-sort` on headers. Row buttons stay in the DOM and reveal on `:focus-within` as well as hover; the menu is the touch and screen-reader route. Every door is a `button` with `aria-expanded`, text and a chevron. Pickers are listboxes. The panel is a labelled region: focus moves in when opened by keyboard and returns on close. A live region announces the count after a filter change and every toast. Reduced motion swaps the slide for a fade. Price text has body contrast, not muted.

### Phone width

Same items, no level change. Header: "People · 312", **Add people**. Views scroll as chips. The bar becomes search plus **Filters · 2 active ▾**, opening the same flat panel as a full-height sheet with active filters at its top. Rows become cards: name, title, company, stage, sequence, last contacted, **Actions**; the phone reveal button stays with its price. A **Select** toggle shows checkboxes; the selection bar becomes a bottom sheet with the same buttons and counts. Chosen columns decide which lines a card shows. Print prints the current rows with the active filters as a header line.

### By role and by business

Level-one sets follow §4 and the seeded views. SDR: sequence-first chips and buttons. AE: account-first chips (Company, Owner, Stage, Not contacted), Phone and Last activity columns, stage badge. Marketer: audience chips (Seniority, Company size, Industry, In list), list and export buttons. Admin: Owner and Synced to CRM chips, Assign owner in the selection bar. Fathom's admin is a founder doing outbound: the SDR's page plus Enrich, Research and Reveal at level one, no Owner, no CRM items. Halyard's SDR keeps Company size, Industry and Location as chips because the ICP changes with the client, and Export in the bar because lists go to clients. Ridgeline swaps sequence for signals: Signals is a chip, a column and the default view; Add to sequence drops to the menu; Change stage becomes a row button.

## 4. Usage items

Weekly use is the share of active users in a role touching the item in a typical week (USAGE-MODEL.md). Baseline is Meridian; overrides are business, role, number. ✱ marks decision-critical, level one regardless. Level one is 20 and above. Tail items with the same reasoning share a row; every item is listed. Notes are in `people.ts`.

| Item | SDR | AE | Mkt | Admin | Overrides |
|---|---|---|---|---|---|
| Search | 85 | 60 | 25 | 25 | Ridgeline SDR 60 |
| Result count | 90 | 60 | 40 | 30 | |
| Saved views | 55 | 15 | 25 | 10 | Halyard SDR 80, admin 35; Fathom SDR 40, admin 30; Ridgeline SDR 30 |
| Save view | 12 | 3 | 8 | 5 | Halyard SDR 18, admin 15 |
| Share view | 4 | 1 | 5 | 8 | Halyard admin 25; Fathom 0 |
| Set default · Rename · Delete · Alerts | 3 · 3 · 2 · 3 | 2 · 1 · 1 · 2 | 2 · 2 · 2 · 4 | 4 · 2 · 2 · 1 | Halyard SDR default 10; Ridgeline alerts SDR 12, AE 6 |
| Filter: Title | 45 | 20 | 25 | 10 | Ridgeline SDR 20; Fathom admin 40 |
| Filter: Email | 40 | 12 | 30 | 8 | Fathom admin 35 |
| Filter: Not in a sequence | 45 | 8 | 5 | 3 | Ridgeline SDR 6; Fathom admin 40 |
| Filter: Stage | 25 | 30 | 10 | 5 | Ridgeline SDR 35, AE 35 |
| Filter: Owner | 30 | 35 | 10 | 20 | Fathom 3; Halyard admin 25 |
| Filter: Company | 25 | 45 | 10 | 8 | Ridgeline SDR 35 |
| Clear all filters | 35 | 25 | 20 | 15 | |
| Filter: Seniority | 15 | 8 | 20 | 5 | |
| Filter: Department | 10 | 5 | 15 | 3 | |
| Filter: Company size | 18 | 12 | 25 | 5 | Halyard SDR 30; Ridgeline SDR 8 |
| Filter: Industry | 15 | 8 | 25 | 5 | Halyard SDR 28; Ridgeline SDR 6 |
| Filter: Location | 18 | 8 | 15 | 5 | Halyard SDR 35 |
| Filter: Technology | 8 | 4 | 8 | 2 | Halyard SDR 15 |
| Filter: Signals | 15 | 15 | 12 | 3 | Ridgeline SDR 55, AE 35; Fathom 25 |
| Filter: Has phone | 12 | 10 | 2 | 2 | Halyard SDR 15 |
| Filter: Not contacted in N days | 18 | 22 | 5 | 3 | Ridgeline SDR 12 |
| Filter: In list | 15 | 5 | 30 | 5 | Halyard SDR 18 |
| Filter: Last activity date | 8 | 15 | 5 | 5 | Ridgeline SDR 20, AE 25 |
| Filter: Changed job · Replied · Opened · Bounced | 4 · 4 · 3 · 4 | 8 · 6 · 4 · 2 | 3 · 4 · 6 · 5 | 2 · 1 · 1 · 6 | |
| Filter: Keywords · Funding · Revenue · Growth · Time in role · Time zone | 3 · 4 · 4 · 3 · 3 · 3 | 2 · 2 · 3 · 2 · 2 · 2 | 6 · 4 · 4 · 3 · 2 · 1 | 1 · 1 · 1 · 1 · 1 · 1 | Fathom funding 12; Halyard time zone SDR 8 |
| Filter: Created · Source · Synced to CRM · Custom fields | 4 · 3 · 2 · 4 | 2 · 2 · 4 · 4 | 6 · 8 · 3 · 6 | 12 · 15 · 20 · 10 | Fathom admin CRM 2 |
| Filter: Languages · Founded year | 1 · 1 | 1 · 0.5 | 1 · 2 | 0.5 · 0.5 | Delete-review candidates |
| Column: Name and title · Company | 95 · 90 | 80 · 80 | 60 · 60 | 50 · 50 | |
| Column: Email and status | 75 | 50 | 45 | 30 | |
| Column: Stage | 45 | 40 | 15 | 15 | Fathom admin 40 |
| Column: Sequence | 45 | 15 | 5 | 10 | Ridgeline SDR 12; Fathom admin 40 |
| Column: Last contacted | 40 | 30 | 8 | 5 | Fathom admin 35 |
| Column: Last activity | 15 | 40 | 10 | 15 | Ridgeline SDR 45 |
| Column: Owner | 18 | 30 | 10 | 30 | Fathom 3 |
| Column: Phone | 15 | 25 | 3 | 5 | Halyard SDR 15; Fathom 25 |
| Column: Signals | 12 | 12 | 8 | 3 | Ridgeline SDR 55, AE 40; Fathom 22 |
| Column: Location | 12 | 10 | 12 | 4 | Halyard SDR 18 |
| Column: Lists | 4 | 3 | 20 | 3 | |
| Column: Seniority · Department · Company size · Industry | 4 · 3 · 4 · 4 | 5 · 4 · 10 · 8 | 12 · 10 · 15 · 15 | 2 · 2 · 3 · 3 | |
| Column: Technologies · LinkedIn · Opens and replies · Job change | 3 · 8 · 4 · 3 | 3 · 6 · 4 · 5 | 4 · 2 · 6 · 2 | 2 · 1 · 1 · 1 | Halyard technologies SDR 12 |
| Column: Source · Created · CRM record · Custom fields · Time zone | 2 · 2 · 1 · 3 · 2 | 2 · 2 · 3 · 4 · 2 | 5 · 5 · 1 · 4 · 1 | 12 · 8 · 10 · 6 · 1 | Fathom admin CRM 1 |
| Sort by a column | 25 | 25 | 15 | 15 | |
| Choose columns · Reset · Density · Rows per page | 6 · 1 · 3 · 3 | 5 · 1 · 3 · 2 | 10 · 2 · 3 · 4 | 8 · 2 · 3 · 3 | |
| Row: Quick look (drawer) | 70 | 45 | 20 | 15 | Halyard SDR 75; Ridgeline SDR 60, AE 40; Fathom admin 55 |
| Row: Open the full record page | 45 | 60 | 12 | 20 | Fathom admin 40; Ridgeline AE 55 |
| Row: Add to sequence | 60 | 20 | 3 | 5 | Ridgeline SDR 12, AE 5; Fathom admin 50 |
| Row: Add to list | 30 | 10 | 30 | 5 | Fathom admin 20 |
| Row: Call task | 22 | 25 | 0 | 2 | Ridgeline SDR 10; Fathom admin 20 |
| Row: Change stage | 18 | 20 | 2 | 3 | Ridgeline SDR 30 |
| Row: Reveal phone (8 credits) | 18 | 15 | 1 | 2 | Halyard SDR 18; Fathom 25 |
| Row: Enrich (2 credits) | 15 | 8 | 5 | 5 | Fathom SDR 30, admin 25 |
| Row: One-off email | 12 | 18 | 1 | 2 | |
| Row: Research agent (12 credits) | 10 | 8 | 2 | 3 | Fathom 30 |
| Row: Open company · Edit · Note · Copy email | 10 · 4 · 4 · 4 | 15 · 12 · 15 · 8 | 3 · 3 · 1 · 2 | 3 · 8 · 1 · 2 | |
| Row: Add to deal · Do not contact ✱ · Assign owner · Push to CRM · Merge · Remove ✱ | 3 · 4 · 3 · 4 · 1 · 3 | 12 · 4 · 6 · 6 · 1 · 2 | 0 · 3 · 2 · 2 · 1 · 2 | 1 · 4 · 15 · 10 · 4 · 6 | Ridgeline AE deal 18; Fathom owner 0, CRM 1 |
| Bulk: Select rows, page, all matching | 50 | 20 | 30 | 15 | Fathom admin 40 |
| Bulk: Limit per company | 10 | 2 | 5 | 1 | |
| Bulk: Add to sequence | 45 | 10 | 2 | 4 | Ridgeline SDR 8; Fathom admin 40 |
| Bulk: Add to list | 28 | 8 | 35 | 5 | Fathom admin 20 |
| Bulk: Enrich (2 credits each) | 12 | 4 | 8 | 8 | Fathom 25 |
| Bulk: Export CSV | 8 | 5 | 25 | 15 | Halyard SDR 30, admin 40 |
| Bulk: Stage · Research · Email · Assign owner · Push to CRM · Merge · Remove ✱ | 4 · 4 · 3 · 2 · 3 · 0.5 · 1 | 8 · 4 · 6 · 3 · 3 · 0.5 · 1 | 2 · 2 · 2 · 2 · 3 · 1 · 2 | 3 · 3 · 1 · 20 · 10 · 3 · 5 | Fathom research 25, owner 0, CRM 1; Halyard admin owner 20 |
| ✱ Credit cost and balance before enrich, reveal or research | 25 | 15 | 5 | 15 | Fathom SDR 35, admin 40 |

| Add people | 35 | 10 | 15 | 10 | Ridgeline SDR 8; Fathom admin 40 |
| Import CSV | 4 | 2 | 15 | 10 | Halyard SDR 12, admin 30 |
| Command palette | 15 | 10 | 5 | 8 | |
| Shortcuts sheet · Copy view link · Sync from CRM · Print | 4 · 4 · 1 · 0.5 | 3 · 3 · 2 · 1 | 2 · 4 · 1 · 1 | 2 · 4 · 8 · 1 | Fathom sync 1 |

**Shape check.** One rule across this group: the denominator is every item in `people.ts` that the seat has at that business — a weekly number above zero, or decision-critical — computed with `weeklyUse()` and `bandOf()` from `model.ts`. 114 items in the file; head 20 and above, body 5–20, tail under 5; target about 15–25 / 25–35 / 45–60.

| Pair | Items | Head | Body | Tail |
|---|---|---|---|---|
| Meridian SDR | 114 | 27 (24%) | 29 (25%) | 58 (51%) |
| Meridian AE | 114 | 23 (20%) | 43 (38%) | 48 (42%) |
| Meridian marketer | 112 | 19 (17%) | 42 (38%) | 51 (46%) |
| Meridian admin | 114 | 10 (9%) | 48 (42%) | 56 (49%) |
| Fathom SDR | 111 | 34 (31%) | 22 (20%) | 55 (50%) |
| Halyard SDR | 114 | 31 (27%) | 29 (25%) | 54 (47%) |
| Ridgeline SDR | 114 | 26 (23%) | 31 (27%) | 57 (50%) |

The Meridian admin head is under the band because the admin does not live here. Fathom's and Halyard's SDR heads run over it, which is the point of those customers: one person doing every job, and ten ICPs in one week. Customer success does not hold this page at Meridian or Ridgeline, so there is no row for it: four decision-critical items would otherwise be counted for a page that seat cannot open.

## 5. Before: the common version

Modelled on Apollo's People page, from Apollo's knowledge base (fetched through its Zendesk API, 13 Sep 2026) and public reviews. Dates are Apollo's "updated" dates.

**How to check these claims.** Two of the articles below are recorded in `knowledge-base/sources/07-apollo-settings-map.md` (the settings memo) with their ids: Sharing and defaults (40430351927437) and Data requests (4738396786701). The others were fetched live on 13 September 2026 and are *not* reproduced in the knowledge base, so each claim carries the article title and its updated date and can be reopened at knowledge.apollo.io; none of them is quoted here from memory. Anything with no first-party article — review-site round-ups, credit unit prices, hover behaviour — is labelled secondary or unverified, and nothing rests on it.

**Where it is.** Left navigation, group "Prospect & enrich", item "People". The top bar carries "Search or ask a question in Apollo ⌘K" and a credits pill, "1.8M credits" (KB screenshots, `knowledge-base/sources/07-apollo-settings-map.md` §6).

**Layout.** A left sidebar of filters, the results table, and tabs above it: Total, Net New (matches not yet saved), Saved (already contacts). Sources: "How to Prospect in Apollo" (5 Sep 2026); "Save and Share a Search or Set a Search Alert" (30 Aug 2026).

**Filters.** "Click **Show Filters** > **More Filters** to see all the available filters" ("Search for People", 5 Sep 2026; "Search Filters Glossary", 11 Sep 2026). The glossary lists 20 "Most Popular Filters" and 43 further "People and Company Filters"; Apollo's magazine says "65+ data attributes" and a "Show More Filters" button ("Advanced Filters", Oct 2021). "AND logic across filters and OR logic within each filter" ("Search for People"). Each filter is a collapsible group in the sidebar; inside it, a value picker. Counts beside values: unverified.

**Saved searches.** "Save as new search" at the bottom of the sidebar; open one by clicking the current view name, then "All searches", "Your searches", "Favorites", "Shared". Visibility Restricted, Everyone, Share with; alerts Daily, Weekly, Monthly; "You can only set subscription alerts on the saved searches you own" (30 Aug 2026). The *default* view is set in Settings › Users and teams › Sharing and defaults, Professional plan and up ("Manage Search Sharing and Defaults").

**Selection and bulk actions.** "Check one or more prospects", or "Bulk Selection at the top of the search results": "Select number of people", "Max people per company", "Select this page", "Select all". Bulk actions: Save, Email, Sequence, Workflows, List, Export, Research with AI, Push to CRM, View companies, Assign owner, Assign account ("Search for People"). Two list controls: "Add to list" for people, "Add to lists" for companies ("Create and Use a List", 28 Aug 2026).

**Credits.** "Apollo charges credits each time you access a verified email or any phone number for net-new contacts"; buttons "Access email" and "Access mobile" beside the name ("How Do Data Requests Work?", 10 Sep 2026; "Access a Prospect's Phone Number", 27 Aug 2026). Saving costs credits: step 8 of the save flow is "Review the credit usage estimate" ("Save Contacts and Accounts", 9 Sep 2026). "Exporting saved contacts to a CSV may require export credits, depending on your Apollo plan" ("Export Contacts to a CSV", 26 Aug 2026). No article prints the unit price; reviewers quote about 1 credit per email and 8 per mobile (Capterra summaries; unverified against the KB).

**Columns.** "Add column", then "Add existing column", "Create field" or an AI research column; a gear icon opens "page view options, including the display order of page columns" ("Manage Saved Records in Apollo", 12 Aug 2026). Table shortcuts: none documented; unverified.

**Documented problems.**

| Problem | Evidence |
|---|---|
| Daily filters two clicks away, behind "Show Filters" then "More Filters", in a sidebar of 63 | KB above; "a learning curve at the start, especially with advanced filters." Sanket D., Capterra, 10 Apr 2026 |
| Three levels to a value (sidebar, group, picker) plus tabs above | KB structure; "too many clicks to reach data many navigation buttons seems to be not in the logical place" Hassnaa, Trustpilot, 4 Sep 2026 |
| Filters split into "Most Popular" and the rest, called "advanced" | Glossary; Apollo magazine; Sanket D. |
| Two near-identical add-to-list controls | KB "Create and Use a List"; "I accidentally spent a bunch of time individually selecting people only to click on the wrong 'add to list' icon that just added the entire company to my list." ryan P., Capterra, 31 Oct 2025 |
| Bulk actions do not restate the count | "You want to only add 25 of out of 700 contacts to an email automation sequence...The damn thing adds all 700 at once" Jake Straface, Trustpilot, 11 Aug 2026 |
| Cost shown at step 8 of a dialog or not at all; exports may cost by plan | KB "Save Contacts and Accounts", "Export Contacts to a CSV"; "excessive credit consumption even for email-only exports" Rafay A., Capterra, 8 Jan 2026; "It's called nickel and diming." Randy, Trustpilot, 4 Sep 2026 |
| Default view set in Settings, away from the page | KB "Manage Search Sharing and Defaults" |
| Counts change between visits without explanation | "if you save your search show you one number, next time is different." Zaro D., Capterra, 15 Jul 2026 |
| Column door mixes picking a column with creating fields and running AI | KB "Manage Saved Records" |
| Large searches lag | 2026 reviews of "lag and freezes on very large lists and complex searches" (SyncGTM round-up, secondary) |

## 6. After: the disclosed version

**Layout.** One screen: header, views row, filter bar, table. One door per channel: a chip's picker, the filters panel, the views list, the columns door, a row's menu, the selection menu, the palette. No tabs. No sidebar unless pinned.

**Level one and level two by role at Meridian.**

| Role | Level one | Level two, top of its door |
|---|---|---|
| SDR | Search, count, views; chips Title, Email, Not in a sequence, Stage, Owner, Company; columns Name, Company, Email, Stage, Sequence, Last contacted; the quick look; row buttons Sequence, List, Call; bulk Add to sequence, Add to list; Add people; price on every paid control | Seniority, Company size, Location, Not contacted, In list, Signals; Phone and Last activity columns; Enrich, Reveal phone, Change stage, One-off email; bulk Enrich, Export |
| AE | Chips Title, Stage, Owner, Company, Not contacted; columns add Phone, Last activity, Owner; row buttons Sequence, Call; stage badge | One-off email, Add a note, Edit fields, Add to a deal; Signals; Last activity date |
| Marketer | Chips Title, Email, Seniority, Company size, Industry, In list; columns Name, Company, Email, Lists; row button List; bulk Add to list, Export | Department, Location; Industry and Company size columns; Import CSV |
| Admin | Chips Owner, Synced to CRM; columns Name, Company, Email, Owner; bulk Assign owner | Source, Created, Custom fields; CRM column; Push to CRM; Import; Sync now |

**Across the businesses.** Fathom: the admin's page is the SDR's plus Enrich, Research and Reveal at level one; no Owner chip or column; no CRM items exist. Halyard: Company size, Industry and Location join the SDR's chips, Export joins the selection bar, Share a view is level one for the ops lead. Ridgeline: Signals and Last activity are chips and columns for SDR and AE; Add to sequence and Not in a sequence fall to level two; Change stage rises to a row button.

**Doors.**

| Door | Label | Content | Container | Persists |
|---|---|---|---|---|
| Filter chip | "Title ▾", then "Title: VP Sales ▾" | Values with counts | Popover in place | Value, in the view |
| All filters | "All filters (31) ▾", "2 more active" | Every filter, flat, grouped | Non-modal side panel, pinnable | Open and pinned |
| Views | "All views (12) ▾" | Mine, shared, search | Popover | Active view |
| Save view | "Save view" | Name field | Inline | – |
| Add people | "Add people ▾" | Database, Import CSV, Sync from CRM | Menu | – |
| Columns and density | "Columns and density ▾" | Checklist, order, reset, density, rows per page | Popover | All, per user and view |
| Row menu | "Actions for Amara Okonkwo" | Every row action with shortcut | Menu | – |
| Stage badge | "Cold ▾" | Seven stages | Popover | – |
| Selection menu | "Edit or export selected ▾" | Stage, email, research, owner, CRM, merge, export, remove | Menu | – |
| Quick look | the row itself, plus "Quick look" in the row menu with its key | The few fields a glance needs, flat | Drawer beside the table | Open or closed, per user |
| Name, company | Link | The full record | Page, with back | Scroll and selection |
| Palette | "⌘K" | Every action with shortcut | Overlay | – |

**Accelerators.** Pin the panel. Shortcuts on every menu item and in the palette. Number keys for views. Compact density. Undo on everything undoable. Row buttons on keyboard focus, so a keyboard user never opens the menu.

**Decision-critical, always visible.** The price on every paid control. The count on every bulk button. The consequence of a stage change to Not interested and of Do not contact. The per-user limit when it binds. The balance after each spend.

**Removed, not hidden.** The Net New / Saved tabs (the page holds contacts; finding new people is behind Add people). "Select number of people" (Select all matching with Limit per company covers it). Workflows, Assign account and View companies as bulk actions (outside the boundary or served by Companies). Creating fields from the column door (Settings does that). "Favorites" for views. Export credits (export is free and says so). The second add-to-list control. A second version of the contact: the quick look shows the same fields, in the same order, with the same labels as the top of the record page, and removing it would cost only speed.

**Score.**

| Point | Score | Why |
|---|---|---|
| 1 Decision-critical visible | 2 | Price on the control, count on the bulk button, consequence before the click |
| 2 Usage numbers with a source | 2 | 114 items in `people.ts`; shape checked for seven pairs against one denominator |
| 3 Two levels on every size | 2 | One door per channel; the phone sheet keeps it |
| 4 Doors labelled by content, chevron and text | 2 | No "More", no "Advanced"; counts in labels |
| 5 Door beside what it reveals, keyboard and touch | 2 | Chips open under themselves; row menu on touch; focus reveal |
| 6 Dependent fields together | 2 | Select all with Limit per company; Email with its statuses |
| 7 State persists, expand-all and print | 2 | Panel pin, columns, density, sort, view; print with the filters line |
| 8 User action or object state only | 2 | Selection bar by selection; nothing reorders by history |
| 9 Instrumented and reviewed | 1 | Door opens and item use logged per role; the semi-annual promote, keep or delete review is a team commitment the product cannot enforce |

17 of 18.

## 7. Lesson steps

**Step 0, the common version.** A 63-filter sidebar behind "Show Filters" and "More Filters"; tabs Total, Net New, Saved; two add-to-list icons; a bulk bar of eleven actions; credits explained at step 8 of a save dialog; the default view set in Settings.

**Step 1, rule 1: hide the rare, never the necessary.** Count what each seat touches weekly. Six filters carry the SDR's week and become chips; the other 25 go into one panel. Columns, row buttons and bulk buttons are cut to the seat's head. Evidence: §4; Nielsen 2006, "disclose everything that users frequently need up front"; Pendo 2024, where **6.4% of features generate 80% of clicks is the median and best-in-class is 15.6%** — so a wide head is not automatically a failure, and 6% is the shape of a bloated product rather than a target (`RULES.md` rule 1, corrected 14 Sep 2026).

**Step 2, rule 2: stop at two levels.** Groups-inside-a-sidebar and the tabs go. Every filter is a flat field in one panel; every value is one click from its chip. The contact has two levels and no more: table to quick look is one level, table to record page is one level, page to a door is the second. The drawer holds no doors, so nothing reaches three. Evidence: Nielsen 2006 on designs beyond two levels; Landauer and Nachbar 1985, breadth beats depth; the quick look and the record, `RULES.md`.

**Step 3, rule 3: split by task frequency, not user skill.** "Most popular" versus "more", and the word "advanced", are deleted. One panel; what sits in the bar is decided per seat and business by the numbers, not by a mode. The marketer's bar and the SDR's bar differ; neither is labelled for its audience. Density (Comfortable, Compact) is the one user-controlled mode, because it asks the user to declare nothing about their skill. Evidence: Cooper's perpetual intermediates; Home Assistant 2026 on audience labels; McGrenere, Baecker and Booth 2002, where a two-interface design the user fills in themselves beat adaptive menus (13 of 20 preferred it); Airtable's 2023 experiment for routing by the job rather than the title; Salesforce and AWS Cloudscape for density as a legitimate mode.

**Step 4, rule 4: make the door obvious and honest.** One "Add to list", with the count in the label. "All filters (31)", "All views (12)", "Columns and density", "Edit or export selected", "Actions for Amara Okonkwo". Chevron and text on every door. Doors that cannot apply are removed: no CRM items at Fathom. Evidence: ryan P., Capterra, 31 Oct 2025; NN/g 2014, 0% click-through on an unlabelled icon; Microsoft Windows UX Guide, remove rather than disable.

**Step 5, rule 5: keep context across the boundary.** Select all matching and Limit per company sit together and restate the result. An active level-two filter shows as a chip beside its effect. The default view is set on the page. The panel remembers its pin. Evidence: Fluent 2, never split referenced information across items; Microsoft Windows UX Guide on persisting expand state; Cowan 2001.

**Step 6, rule 6: stable, user-controlled disclosure.** The selection bar appears because rows are selected, an object state. Nothing reorders by history: a new column goes to the end; chips stay where the role default put them; views change only when saved. Evidence: Findlater and McGrenere 2004; Jensen Harris on Office 2000.

**Step 7, rule 7: decision-critical information is never behind a door.** "Reveal · 8 credits" on the cell. "Enrich 25 · 50 credits" on the bulk button. "Export 25 · no credits". The stage change that leaves a sequence says so first. The balance in every toast. Evidence: Nielsen 2026 on price and risk; Blake et al. 2021, deferred fees raise spending 21%; Randy and Rafay A. in §5.

**Step 8, rule 8: fade the scaffold; give experts accelerators.** Shortcuts on every menu item and in the palette; number keys for views; pin the panel; compact density; undo. Languages and Founded year are logged for the next delete review. Evidence: NN/g heuristic 7; Cockburn et al. 2014; McGrenere and Moore 2000, tuck away rather than remove when a minority uses it.

## 8. Review

| Check | Result |
|---|---|
| All roles covered | SDR, AE, marketer, admin have level-one sets, views and numbers; CS is out of the navigation and the no-access state names who to ask. Gap: CS had no state; closed. |
| All four businesses covered | Views, chips, columns and bulk buttons named for each. Gap: Halyard's per-workspace views were unstated; closed. |
| Every field has a source | §2 names the seed field or the addition for every field. |
| Every action has an outcome | §3 tables give outcome, skip rule and undo. |
| Empty, error, no-access states | §3, plus loading, no results, partial permission, do not contact, unsaved view. |
| Keyboard | Full map; every menu prints its shortcut. |
| Phone width | Same items as cards and sheets, no level change. |
| Decision-critical visible | Price, count, consequence, limit, balance. |
| Two levels maximum | One door per channel; a form after a chosen action is not a door; the quick look holds no doors. Gap: "Change stage" in the row menu opened a picker; closed by making the badge the door. |
| Doors labelled by content | No "More", "Other" or "Advanced". Gap: the selection menu was drafted as "More"; renamed. |
| Dependent fields together | Select all with Limit per company; Email with its statuses; price with its button. |
| State persists | Pin, view, columns, order, density, sort, rows per page, scroll on return. |
| Accelerators | Shortcuts, palette, pin, number keys, undo, compact. |
| Usage shape checked | Seven pairs against one stated denominator; Meridian SDR 24/25/51. |
| Nothing hover-only | Row buttons on focus and in the menu; touch uses the menu. |
| Role gaps explain themselves | Assign owner and Remove name the admin; over-limit and no-credit controls name who can help; nothing greyed. |
| No usage numbers or teaching text in the product | Numbers live in `people.ts` and here; the page shows counts and prices only. |
