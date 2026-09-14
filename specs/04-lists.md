# Lists

*A "real" page: the table template plus a list detail view. Usage items: `src/ollopa/usage/lists.ts`. Built page today: `Lists` in `src/ollopa/pages/tables.tsx`.*

## 1. Purpose

Lists is where people and companies are grouped so that something can be done to the group: enrol them in a sequence, put them in a campaign, export them, hand them to a teammate. There are two kinds of group. A **static list** holds exactly who was put in it. A **segment** is a saved set of filters; its members are whoever matches now, and it can add new matches to a sequence or campaign on its own.

Who lives here: the SDR (daily at Meridian, Fathom and Halyard) and the marketer (daily at Meridian and Ridgeline, where segments are the page). The admin visits weekly to see what the team built. AEs and CS do not have the page (`nav.ts`); they add people to sequences from People.

The one thing nobody may lose sight of: **a list is a group that is about to be acted on, and acting costs something.** Enrolling net-new emails spends credits, enrolling someone already in a sequence doubles outreach, and a segment that feeds a sequence keeps enrolling people after you leave. Those three consequences are on the page, never behind a door.

## 2. Data

The seed has no lists today; the built page hardcodes five rows. Add a `List` entity to `src/ollopa/data/seed.ts`, generated per business with the same deterministic `rng`.

| Field | Shown where | Source |
|---|---|---|
| `id`, `name` | Table, detail header | New. Names per business (see below) |
| `kind`: people or companies | Kind badge | New |
| `mode`: static or segment | Mode badge | New |
| `memberIds` | Records count, members table | New; drawn from `seed.contacts` or `seed.companies` ids. Segments: computed from `filters` against the seed each render |
| `newThisWeek` | "+38 this week" | New; members with `lastActivity` in the last 7 days, capped at 15% of records |
| `feeds[]`: `{ target: "sequence" or "campaign", name, auto: boolean }` | Feeds column, detail header | Sequence names from `seed.sequences`. Campaign names are strings until the Campaigns spec adds an entity |
| `filters[]`: `{ field, op, value }` (segments only) | Filter chips at the top of a segment | New; fields limited to `stage`, `title`, `industry`, `employees`, `emailStatus`, `inSequence`, `lastActivity` |
| `owner`, `visibility`: everyone or me | Owner column, visibility column (door) | Owner from `businesses.roles[].user` |
| `source`: search, csv, agent, manual | Source column (door) | New |
| `createdAt`, `updated`, `lastRefreshed` (segments) | Updated column; refresh door | New |
| `alert`: off, daily, weekly | Refresh and alerts door | New |
| `history[]`: `{ when, who, what }` | History door | New; 3 to 14 entries per list |
| `archived: boolean` | Hidden unless "Show archived" | New |
| Credits an action will spend | Detail header line before Add to sequence or Enrich | Derived: 1 credit per member whose `emailStatus` is Guessed or Unverified when enrolling; 2 credits per member to enrich (matches the People page); balance from `businesses[].credits` |
| Already in another sequence | Count in header, badge on member rows | Derived: `contact.inSequence` set and not equal to the target sequence |

Lists per business. Meridian: 14 (5 segments), including "Q4 enterprise targets" and the segment "Replied, no meeting yet" feeding "Warm inbound follow-up" with auto on. Fathom: 5, three built by the Research agent. Halyard: 12 in the shown workspace, 8 visible to "me", two from CSV. Ridgeline: 9, seven of them lifecycle segments ("Trial day 14, no invite sent", "Renewal in 60 days") feeding campaigns, auto on four.

## 3. Features

**Shown.** A `TablePage` of lists: List (name, kind badge, mode badge), Records (count and "+n this week"), Feeds, Owner, Updated; a header count; a primary button. A row opens the detail at `/ollopa/lists/:id`.

**Detail view.** Breadcrumb "Lists › name". Header: editable name, kind and mode badges, records, new this week, Feeds line ("Feeds Q4 enterprise outbound · new matches added automatically"), owner, updated or last refreshed. Segments show their filter chips under the header with "Edit filters". Static lists show "Add people" (or "Add companies"). Then the members table: Name and title, Company, Email and status, Stage, Sequence, Added (date, by whom), Last activity. Companies lists: Company, Industry, Employees, Contacts, Stage, Added.

**Actions.**

| Level | Action | Outcome |
|---|---|---|
| Page | New list | Chooser in place: Static list, Segment from filters, Import CSV. Static: name, kind, then the People or Companies table in a drawer to pick members. Segment: name, kind, filters, live count. CSV: file, field mapping, "Import 1,204 rows as a people list" |
| Row, visible on hover and focus | Add to sequence (people lists; SDR, admin); Add to campaign (marketer) | Picker names the sequence or campaign, shows credits and "n already in another sequence", confirms with "Add 1,240 people" |
| Row, always in "…" | Open · Add to sequence or campaign · Export CSV · Duplicate · Rename · Pin to top · Change who can see it · Convert to segment / Freeze as static · Archive · Delete list (people stay in People) | Export: all emails or verified only; file downloads; order matches the table. Delete: confirm names the list and states "The 1,240 people stay in People. Running sequences keep their contacts." Undo for 10 seconds in the toast |
| Companies list rows | "Find people at these companies" replaces Add to sequence | Opens People filtered to the companies |
| Bulk (checkbox column) | Add to sequence, Add to campaign, Export, Archive, Delete | Same outcomes; the bar shows the count |
| Detail, page | Add to sequence / campaign, Export CSV, Refresh now (segments) | As above; Refresh recomputes members and updates "last refreshed" |
| Detail, member row (hover, focus, and "…") | Remove from list · Sequence · Call · View · Enrich (2 credits) · Set stage · Assign owner · Create call task | Toast per action; Remove has undo |
| Detail, bulk | Remove, Add to sequence, Export, Enrich, Set stage, Assign owner, Create call tasks, Set a custom field, Merge duplicates | Credits stated in the bar before Enrich runs |

**Filters and search.** Search box (name, owner). Filters at level one: Kind (people, companies), Owner (mine, team, a person). Behind one door "Mode, source, archived ▾": Mode (static, segment), Source, Show archived. Filter and door state persist per user.

**Sorting and columns.** Sort by Updated (default, newest first), Records, Name; clicking a header. Columns door "Columns: visibility, source, created ▾" adds the three tail columns; choice persists. Detail members table sorts by Added (default), Name, Last activity.

**States.** Empty: "No lists yet. Make one from People, Companies, or here." with the New list chooser open. Empty search: the template's "Nothing matches. Clear the search or a filter." Empty segment: "No one matches these filters right now. Widen a filter or wait for the next refresh." Loading: skeleton rows. Error: "Lists could not load. Retry.", keeping the last good table. No access (AE, CS): the shell's `NoAccess` page names the roles that use Lists and the admin to ask; it adds one line: "You can still add people to a sequence from People."

**Keyboard.** `/` focus search, `n` New list, `j`/`k` move, `Enter` open, `s` Add to sequence, `c` Add to campaign, `e` Export, `x` select, `Esc` close a door or drawer, `⌘K` palette listing each of these with its key. Every door is a button with `aria-expanded`; drawers trap and return focus.

**Accessibility.** Row actions render on focus as well as hover and always exist in the "…" menu. Badges carry text. Credits and warnings are live regions. Nothing is hover-only.

**Phone width.** Table becomes cards: name, badges, records, feeds. Row actions live in the "…" only; the bulk bar docks to the bottom. Detail header stacks; filter chips wrap; members table becomes cards. Same two levels; nothing moves to a third.

**By role and business.** Level-one differences come from the usage model, not switches. SDR: Add to sequence is the visible row action; New list opens on Static. Marketer: Add to campaign is the visible row action; New list opens on Segment; new-since and refresh are in the detail header. Admin: Owner filter defaults to Team. Fathom and Halyard have no campaigns, so Add to campaign is absent from every menu. Halyard: Export and Duplicate join the visible row actions; Import CSV is a header button; History is level one in detail for the ops lead. Ridgeline: the marketer's segment view is the default; the inbound SDR sees the row and criticals only, everything else in doors.

## 4. Usage items

Weekly share of active users per role, baseline Meridian. Overrides where the business changes the number (F Fathom, H Halyard, R Ridgeline). † decision-critical, always level one. Full data and notes: `src/ollopa/usage/lists.ts`.

| Item | SDR | Marketer | Admin | Overrides |
|---|---|---|---|---|
| List name, kind and mode | 90 | 65 | 30 | F admin 60; H admin 50; R sdr 15, mk 75, admin 12 |
| Records and new this week | 80 | 60 | 25 | F admin 55; H admin 45; R sdr 12, mk 70, admin 10 |
| Feeds (sequence or campaign) | 55 | 55 | 15 | F admin 40; H admin 25; R sdr 8, mk 65, admin 6 |
| Owner and updated | 18 | 18 | 25 | F sdr 8, admin 12; H sdr 35, admin 40; R sdr 6, mk 18 |
| Visibility column | 4 | 5 | 8 | F 0; H admin 15 |
| Source column | 6 | 8 | 6 | F sdr 15, admin 25 |
| Created date column | 2 | 2 | 3 | |
| Search lists | 30 | 25 | 20 | F 8; H sdr 45, admin 40; R sdr 5, mk 18, admin 6 |
| Filter by kind | 15 | 12 | 6 | F 3 |
| Filter by owner | 18 | 15 | 22 | F 2; H sdr 18, admin 40; R sdr 4, mk 12, admin 10 |
| Filter by mode | 6 | 12 | 4 | R mk 18 |
| Sort | 12 | 10 | 8 | H sdr 15 |
| Show archived lists | 2 | 3 | 5 | H admin 15 |
| Open a list | 85 | 60 | 25 | F admin 55; H sdr 90, admin 45; R sdr 15, mk 75, admin 10 |
| New list (static) | 30 | 15 | 10 | F admin 30; H sdr 45, admin 15; R sdr 5, mk 10, admin 3 |
| New segment | 12 | 35 | 8 | F admin 15; H sdr 15; R sdr 3, mk 55, admin 6 |
| Import a CSV | 10 | 15 | 8 | F sdr 5, admin 10; H 18; R sdr 2, mk 12, admin 4 |
| Add to sequence | 60 | 5 | 10 | F admin 40; H sdr 75, admin 20; R sdr 8, mk 2, admin 2 |
| Add to campaign | 3 | 50 | 4 | F 0; H 0; R sdr 2, mk 65, admin 4 |
| Export CSV | 12 | 15 | 10 | F sdr 6, admin 8; H sdr 30, admin 25; R sdr 3, mk 15, admin 6 |
| Duplicate | 6 | 8 | 3 | H 18 |
| Rename | 5 | 5 | 3 | |
| Pin to top | 5 | 6 | 3 | |
| Change who can see it | 3 | 4 | 6 | F 0; H admin 15 |
| Convert to segment / freeze | 3 | 6 | 2 | R mk 8 |
| Archive | 4 | 5 | 6 | H admin 15 |
| Delete list † | 3 | 3 | 4 | |
| Members table | 85 | 60 | 25 | F admin 55; H sdr 90, admin 45; R sdr 15, mk 70, admin 10 |
| Segment filters | 15 | 40 | 6 | H sdr 15; R sdr 3, mk 55, admin 5 |
| New since your last visit | 18 | 35 | 8 | H sdr 18; R sdr 5, mk 45, admin 6 |
| Add people or companies | 50 | 15 | 10 | F admin 30; H sdr 60, admin 15; R sdr 6, mk 10, admin 3 |
| Remove from list | 15 | 12 | 6 | F admin 15; H sdr 18; R sdr 4, mk 8, admin 2 |
| Credits this action will spend † | 30 | 10 | 15 | F sdr 45, admin 50; H sdr 40, admin 30; R sdr 5, mk 12, admin 8 |
| Already in another sequence † | 25 | 5 | 5 | F admin 20; H sdr 45, admin 15; R sdr 3, mk 2, admin 1 |
| New matches added automatically † | 10 | 30 | 8 | F admin 12; R sdr 2, mk 45, admin 6 |
| Refresh now, last refreshed | 8 | 15 | 4 | R mk 25 |
| Email me when the segment gains matches | 5 | 12 | 2 | R mk 15 |
| Choose columns | 6 | 8 | 4 | |
| History | 4 | 5 | 10 | H admin 22 |
| Enrich members | 10 | 6 | 5 | F sdr 15, admin 20; R sdr 2, mk 4, admin 2 |
| Set stage | 8 | 2 | 3 | |
| Assign owner | 4 | 2 | 12 | F admin 2; H admin 15 |
| Create call tasks | 12 | 0 | 2 | H sdr 18; R sdr 3 |
| Print or expand everything | 1 | 2 | 2 | |
| Description | 3 | 5 | 3 | |
| Copy link to list | 4 | 6 | 3 | |
| Max people per company when adding | 6 | 2 | 2 | H sdr 12 |
| Use as an exclusion in People search | 4 | 3 | 2 | |
| Set a custom field for selected | 3 | 4 | 6 | |
| Find and merge duplicates | 3 | 4 | 6 | |
| Push list to the CRM as a campaign | 2 | 8 | 8 | F sdr 0, admin 1 |

Shape check (51 items, `shape()` from `model.ts`), head / body / tail: Meridian SDR 22 / 45 / 33; Meridian marketer 22 / 55 / 24; Meridian admin 14 / 51 / 35; Halyard SDR 25 / 41 / 33; Ridgeline marketer 22 / 49 / 29; Fathom admin 24 / 29 / 47. Heads sit inside the 15 to 25% band; tails run under 45% for the roles that live here, expected on a screen with few settings and many actions. Ridgeline's inbound SDR has no item above 20%: the page shows the row and the four criticals and doors the rest, the honest result for a role that hardly uses it.

## 5. Before: the common version

Modelled on Apollo's Lists, from the knowledge base article "Create and Use a List" (updated 28 Aug 2026; 135 reader votes, net −75, the most downvoted article in the "lists" search results) and "Save, Share, and Set Alerts for Searches" (30 Aug 2026), fetched through Apollo's Zendesk API on 13 Sep 2026.

**Layout and depth.** Lists sits in the left nav under "Prospect & enrich". The hub "shows you the lists you created, organized by people and companies". Finding a list is behind a door: "Click Show filters to search for specific lists." Seeing a colleague's list is two doors deep: "Navigate to Lists and click Show filters > Created by. Click Team." Creating from the hub: "Create a list", name, people or companies, "Select filters", check records, "Add to list", "Create". Removing members from a list is behind an ellipsis: "check one or more prospects, then click ... > Remove from lists."

**Three things called a list.** A list is static: membership is whoever was checked. The dynamic thing is a **saved search**, on a different page (People or Companies), reached through "Default view or your current layout name", with tabs All searches, Your searches, Favorites, Shared, and alerts under "Search settings > Subscription alerts" (daily, weekly, monthly). "You can only set subscription alerts on the saved searches you own. To subscribe to a shared saved search, duplicate the search." A third concept, **saved records**, lives under "Manage records > Saved people or Saved companies" with "system searches … pre-built to quickly surface only the records you saved" ("Manage Saved Records in Apollo", 12 Aug 2026). A Capterra reviewer: "Name of the features is a bit confusing to me" (via `knowledge-base/sources/07-apollo-settings-map.md`, §3).

**Cost behind the click.** "It costs one email credit per verified email to add net new contacts to a list." To see spend: "click Settings > Manage Plan", another page. Enrolling: "A credit warning can appear even when your balance looks fine" ("Add Contacts to a Sequence", 4 Sep 2026). Reviewers: "watch the credit system closely or you'll get surprised at the end of the month" (Reddit via Cleverly, secondary).

**Wrong door, wrong group.** "I accidentally spent a bunch of time individually selecting people only to click on the wrong 'add to list' icon that just added the entire company to my list." (ryan P., Capterra, 31 Oct 2025.) Companies lists cannot go to a sequence: "Sequences enroll contacts, not companies. If you start with a companies list, first find people at those companies" (KB); the control is not removed, the article explains it instead.

**Action bar with seventeen items.** Inside a list, the bar offers: add or remove from list, add to sequence, find people at companies, AI research, assign owner, email, enrich, set stage, view companies, export CSV, set custom account field, set custom contact field, create tasks, export to CRM, assign custom fields, delete or merge duplicates (KB list, verbatim order). One level, no grouping, no frequency ordering.

**Visibility.** "When you create a list, the list is visible to everyone at your organization." No private list; an agency cannot keep a client list to a team.

**Export.** "The order of rows in the exported CSV may differ from the order shown in your list." Exports above 1,000 rows run in the background; status is at "Settings > Import & Exports > CSV Exports", a fourth page ("Export Contacts to a CSV", 26 Aug 2026; 194 votes, net −62).

**Caps, reloads, duplicates.** "Apollo can display up to 100 pages of search results" (KB). A third-party guide reports a 25-per-page selection and "you need to reload the page for changes to take effect" after creating a list (Salesforge help, secondary; unverified). A G2 reviewer describes list organisation differing each time, making duplicate sequences hard to avoid (via search summary; wording unverified).

## 6. After: the disclosed version

**Layout.** The table page, dense, one door per channel. Header: title, count, "New list". Toolbar: search, Kind, Owner, the door "Mode, source, archived ▾", and "Columns: visibility, source, created ▾" at the right. Five columns. The detail view is a page because a list is an independent task; adding members opens a drawer over it so the list stays in view.

**Level one and level two.**

| Role at Meridian | Level one | Level two (one door) |
|---|---|---|
| SDR | Row (name, kind, mode, records, new this week, feeds), search, Open, New list (static first), Add to sequence, Delete with its consequence; detail: members, Add people, credits line, "n already in another sequence", auto-feed line where it applies | Filters door, columns door, "…" menu, segment door "Refresh and alerts", "History: 9 changes", bulk bar extras |
| Marketer | Same row and search; New list (segment first); Add to campaign; detail: filter chips, new since last visit, auto-feed line, refresh | Add to sequence in "…", the same doors |
| Admin | Row with Owner and updated, Owner filter set to Team, search, Open, criticals | Everything else |

Across businesses: Fathom removes Add to campaign and shows Source on the row for the founder (agent-built lists). Halyard puts Export and Duplicate on the row, Import CSV in the header, Owner filter on Team, Visibility on the row for the ops lead, History open by default in detail. Ridgeline opens on the marketer's segments; the inbound SDR gets the row and criticals only.

**Doors, labels, containers.**

| Door label | Contains | Container |
|---|---|---|
| New list ▾ | Static list · Segment from filters · Import CSV | In place, under the button |
| Mode, source, archived ▾ | Three filters | In place, toolbar row |
| Columns: visibility, source, created ▾ | Column checklist | In place |
| … (More actions), per row | Open, Add to sequence or campaign, Export, Duplicate, Rename, Pin, Change who can see it, Convert or freeze, Archive, Delete list (people stay in People) | Menu, 11 items, destructive last |
| Edit filters (segments) | The filter builder with live count | In place, replaces the chips |
| Refresh and alerts ▾ (segments) | Refresh cadence, last refreshed, email alert | In place, under the chips |
| History: 9 changes ▾ | Who added or removed what | In place, bottom of detail |
| Add people | People table with filters and Max people per company | Drawer over the detail |
| … per member row | View, Enrich (2 credits), Set stage, Assign owner, Create call task, Remove | Menu |
| ⌘K | Every action with its key | Palette |

Every door has a chevron and text, sits next to what it reveals, and works by keyboard and touch. Add to campaign is removed, not disabled, at Fathom and Halyard. Companies lists replace Add to sequence with "Find people at these companies".

**Persistence.** Filters, sort, column choice and each door's open state persist per user per page (localStorage in the demo). Detail doors persist per list kind, so "Refresh and alerts" left open stays open on every segment. "Expand all" and print expand every door.

**Accelerators.** Keys listed in §3; the palette shows each key every time. Daily users reach every action without a door.

**Decision-critical, always visible.** Credits before enrol or enrich ("212 net-new emails = 212 credits · balance 1.84M"). "96 already in another sequence" before enrol, with badges on the rows. "New matches added to Q4 enterprise outbound automatically · Turn off" on any segment that feeds something. Delete states what stays. The path to remove a list from a sequence's feed is one click, the same as adding it.

**Removed, not hidden.** "Saved searches" and "saved records" as separate concepts: a segment is the saved search, People is the saved records. "View companies" as an action: the Company column links. Reload after create. The 100-page cap: segments show a live count instead.

**Score.**

1. Decision-critical visible: credits, double-enrol, auto-feed, delete consequence, all at level one. 2.
2. Every visible item has a number: 51 items in `lists.ts`, shape checked. 2.
3. Two levels on every screen size: page and one door; phone keeps the same doors. 2.
4. Doors labelled by content with chevron and text; no "More" except the row ellipsis, which is the template's stable menu route. 2.
5. Doors adjacent, keyboard and touch: in-place expansions under their cause; drawers return focus. 2.
6. Dependent fields together: filters and their live count; refresh cadence and alert; credits beside the action that spends them. 2.
7. State persists; expand-all and print exist. 2.
8. Disclosure by user action or object state: segment doors appear because the object is a segment; nothing reorders from history. 2.
9. Instrumented with a scheduled review: door open-rates are planned for the demo but not built; the twice-yearly review is a rule, not a calendar entry. 1.

Total 17 of 18.

## 7. Lesson steps

Lists is a real page, not a lesson. The rules that mattered most:

- **Rule 7.** Credits, double enrolment and auto-feed are the consequences of a list; Apollo puts the price on a settings page and the warning after the click.
- **Rule 4.** One concept, two modes, one door labelled by what it does; Apollo splits the same idea across lists, saved searches and saved records, and leaves "Show filters" as the way to find your own lists.
- **Rule 1.** Halyard proves Export and Duplicate are daily for an agency and belong on the row there, and only there.
- **Rule 8.** The seventeen-item action bar becomes six visible actions, a menu ordered by use, and keys the palette teaches.

## 8. Review

| Check | Result |
|---|---|
| All roles | SDR, marketer, admin specified; AE and CS get the no-access state. Gap: `NoAccess` named no alternative path; closed by the added line |
| All four businesses | Counts, names, overrides and level one per business. Gap: a 0% campaign action at Fathom and Halyard; closed by removing it |
| Every field has a source | §2 table; campaign names noted as strings until the Campaigns spec |
| Every action has an outcome | §3 actions table |
| Empty, error, no access | §3 states; empty segment added after review |
| Keyboard | §3; palette lists every key |
| Phone width | Cards, same doors, no third level |
| Decision-critical visible | Four criticals in the header and menu label |
| Two levels maximum | Doors table. Gap: a filter builder inside a drawer would be a third level; closed by editing filters in place |
| Doors labelled by content | Doors table; "…" is the template's stable route and duplicates the visible actions |
| Dependent fields together | Filters with count; cadence with alert; credits with the action |
| State persists | §6 persistence |
| Accelerators | Keys, palette, hover-and-focus row actions |
| Usage shape | Six pairs checked, heads 14 to 25% |
| Nothing hover-only | Row actions on focus and in the menu |
| Role gaps explain themselves | No-access page; removed actions leave no disabled control |
| No usage numbers or teaching text in the product | The page shows lists and counts only; numbers live in `lists.ts` and here |
