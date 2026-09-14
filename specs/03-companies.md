# Companies

*The accounts table: which companies the workspace holds, how many people it holds at each, and a light company record behind every row. A "real" page built from the table template; the record is built from the record template shared with the deal record. Usage data: `src/ollopa/usage/companies.ts`.*

## 1. Purpose

Companies is where a person moves from "which accounts" to "which people at them". The SDR lives here daily (all day at Halyard): filter a set of accounts, see how many contacts are held at each and whether any are in a sequence, then find people. Customer success uses it daily the other way round: which current clients have gone quiet. The AE checks ownership and open deals before touching an account, several times a week. The RevOps admin reassigns owners and watches CRM sync, weekly. The marketer has no access.

The one thing nobody must lose sight of: **the contacts held at each company**. A row is not a company; it is "this company, the 4 people we hold there, 2 in a sequence, last touched 3 days ago". Every level-one decision follows from that.

Route: `#/ollopa/companies`. The record: `#/ollopa/companies/<id>`, rendered under the `companies` page key.

## 2. Data

Seed type `Company` in `src/ollopa/data/seed.ts` plus derived rows from the same seed.

| Field | Shown where | Source | Seed change |
|---|---|---|---|
| Name, domain | Column 1, record header | `Company.name`, `Company.domain` | none |
| Stage | Column, filter, record header | `Company.stage` (Cold, Active opportunity, Current client, Churned) | add `Do not prospect`: a blocklisted account is safety state and must be visible |
| Contacts held | Column, record list | derived: `contacts.filter(c => c.company === name)` | `Company.contacts` becomes derived; today it is a random count that does not match the contacts array |
| Contacts in a sequence | Column, filter, record door | derived: contacts at company with `inSequence` | none |
| Last activity | Column, filter, record header | `Company.lastActivity`; on the record, the max of company, contact, reply and task dates | none |
| Last reply | Column | derived from `replies` by company | none |
| Owner | Column, filter | `Company.owner` | none |
| Industry, Employees | Columns, filters | `Company.industry`, `Company.employees` | none |
| Open deals | Column, filter, record | derived from `deals` by company, stage not Closed won | none |
| Location, Founded, Description | Company details door, filters | new | add `location`, `founded`, `description` |
| Revenue band | Column, filter | new | add `revenue` (six bands) |
| Signals | Column, filter, record door | new | add `signals: ("Hiring" \| "Funded" \| "Intent" \| "Visited site")[]` |
| Fit score | Column | `agentEvents` of kind `scored` for the company; otherwise none | add `company` to `AgentEvent` so events match by id, not by name inside `summary` |
| Agent research | Row action, record door | `agentEvents` kind `researched`, credits per run | same |
| Source, Added on, Enriched on | Columns, filters | new | add `source: "Found" \| "Imported" \| "CRM"`, `addedOn`, `enrichedOn` |
| Parent company | Column, filter, record door | new | add `parent: string \| null` (about 8% of rows) |
| Lists | Record door, filter | the five lists in `pages/tables.tsx` | move list membership into the seed: `Company.lists: string[]` |
| Notes, Files | Record doors | new | add `notes: { by, on, text }[]`; files stay an empty door with an upload control |
| Open tasks | Record door | `tasks` by company | none |
| CRM sync | Record door, Push to CRM | new | add `crm: { synced: boolean; lastError: string \| null } \| null`; `null` at Fathom |
| Custom fields | Record door, filter | the workspace's account fields | add two fields per business, for example `Tier` and `Region` |

Counts in the header come from `businesses.ts` (`counts.companies`).

## 3. Features

**Shown.** The workspace's companies as a table: title, count against the total, search box, filter chips, sortable headers with the direction shown, "Show 25 more" paging. Default sort: last activity, newest first.

**Search.** One box, shortcut `/`. Matches name, domain, industry, and the names and emails of contacts held, so "Vera Kim" returns the account that holds her, with "holds Vera Kim" under the name.

**Filters.** Level-one filters are chips next to the search box; the rest sit behind one door, "More filters", which expands a second row in place. Each filter is a select with "all" first; values inside a filter are OR, across filters AND, stated once as "Matching all of: Stage, Industry". "Clear" appears when anything is set. Values persist. Full list in section 4.

**Columns.** Seven by default per role; "Columns: 7 of 20" opens a popover of checkboxes in table order. Choices persist. Widths are fixed; no horizontal scroll at desktop width.

**Row actions.** The role's level-one actions appear as text buttons with icons on hover and on keyboard focus; the "…" button is always visible and its menu repeats the visible actions, then the rest, with Remove last below a divider.

| Action | Outcome |
|---|---|
| Find people | Goes to People with the company filter set, shown there as "at Northwind Analytics · Clear" |
| Open | Goes to the record |
| Add to list | Popover: pick a list or type a new name; toast "Added to Q4 enterprise targets · Undo" |
| Research (12 credits) | Cost on the label. Inline confirm: "Run the research agent on Northwind Analytics for 12 credits? Balance 1,840,000." Result lands in the record's research door and in Agents |
| Change stage | Popover of the five stages; Do not prospect says "Stops all sequences for 4 contacts here" before confirming |
| Change owner | Popover of users; toast with Undo |
| Edit | Drawer: name, domain, industry, employees, location, custom fields; Save, Cancel |
| Push to CRM | Item reads "Push to Salesforce · updates 3 fields, never deletes"; error inline on failure. Removed when no CRM is connected |
| Export CSV | Visible columns for the row or the selection |
| Merge duplicates | Drawer: pick the other record, choose which values win, Merge |
| Flag data as wrong | Popover: field, what is wrong, Send |
| Remove | Item reads "Remove · leaves 2 lists, stops sequences for 2 contacts, keeps the contacts"; inline confirm repeats it; toast "Removed · Undo" for 10 seconds |

**Bulk.** Checkbox per row and in the header, which offers "This page (25)" and "All 3,100 matching". While anything is selected a bar replaces the filter row: "12 selected · Add to list · Find people · Change stage · Change owner · Export · Push to CRM · Remove · Clear". Bulk Remove and Push show what they affect before confirming. Escape clears.

**Page actions.** "Find companies" (primary) opens a drawer over the table: a flat list of database filters (industry, employees, location, revenue, funding, hiring, technology, keywords, intent), a live count, results with Save and Find people per row, bulk Save. The header says saving is free and finding people costs "1 credit per verified email". Drawer filters persist. "Import CSV" is a drawer: file, column mapping, stage, owner, list, duplicates ("update existing" default); progress and result appear as a banner on this page, not in Settings. "Views" is a popover of saved views (Mine, Shared, Default) with Set as default and Delete as text buttons; "Save view" appears in the filter row when the filters differ from the active view. "Alert me" on a view sends a daily or weekly digest. "More" holds the page actions under level one for the role.

**States.** Empty workspace: "No companies yet" with Find companies and Import CSV. Filtered empty: "Nothing matches. Clear the search or a filter" with a Clear button (built). Loading: header and filter row at once, 10 skeleton rows, counts as "…". Error: a banner "Companies could not load. Retry" above the last loaded rows. No access: the marketer sees the built page, "Companies is not part of your role. It is used by: SDR, Account executive, Customer success, RevOps admin. If you need it, ask Daniel Okafor (RevOps admin) to change your permissions", with Back to Home. Role-gated actions inside the page (Change owner for a Meridian SDR, Push to CRM for CS) are removed from menus, and the menu ends with one grey line, "Owner changes: ask Daniel Okafor".

**Keyboard.** `/` search, `↑ ↓` move the row focus, `Enter` open, `f` find people, `l` add to list, `r` research (opens the cost confirmation), `x` select, `⇧A` select the page, `Esc` clear selection or close a door, `c` columns, `v` views, `⌘K` the palette, which lists every action with its shortcut. Tab order: search, filters, More filters, Columns, Views, Find companies, then the table. Row action buttons are in the DOM at all times; they change opacity, not presence.

**Accessibility.** A real `<table>` with `aria-sort`; each door a `<button>` with `aria-expanded` and `aria-controls`; counts and filter changes announced through a polite live region; targets at least 24 px; the stage badge carries text, never colour alone; focus moves into a drawer on open and back to the trigger on close; reduced motion gets a crossfade.

**Phone width.** Three columns: Company (name, domain, "4 contacts · 2 in sequence" as a second line), Stage, Last activity. Tap opens the record; each row keeps a visible "…". Chips scroll horizontally; More filters is a bottom sheet; Find companies is a full-screen sheet; the bulk bar sticks to the bottom. Nothing one level deep on desktop becomes two on the phone.

**By role and business.** Level one is decided by the usage model (section 6). Independent of numbers: Push to CRM and the CRM door are removed at Fathom (no CRM); "Find companies" is a primary button wherever an outbound role uses it weekly and lives in "More" at Ridgeline.

## 4. Usage items

Weekly use, share of active users in the role, baseline Meridian. Overrides as business and role. Critical items are level one regardless (rule 7). Source: `USAGE-MODEL.md`; every row is an entry in `companiesItems`.

| Item | SDR | AE | CS | Admin | Overrides |
|---|---|---|---|---|---|
| **Search and filters** | | | | | |
| Search by company, domain or a contact's name | 90 | 60 | 70 | 30 | Fat ADMIN 80; Rid SDR 60 |
| Stage filter | 55 | 30 | 60 | 15 | Fat ADMIN 45 |
| Industry filter | 40 | 10 | 8 | 8 | Fat ADMIN 35; Rid SDR 12 |
| Owner filter | 15 | 25 | 18 | 20 | Fat SDR 3; Fat ADMIN 3 |
| Employees filter | 25 | 6 | 4 | 4 | Fat ADMIN 25; Rid SDR 6 |
| Location filter | 8 | 4 | 3 | 3 | Hal SDR 25 |
| Last activity filter | 8 | 6 | 18 | 4 | Rid CS 30 |
| In list filter | 8 | 3 | 4 | 3 | Hal SDR 18 |
| Signals filter (hiring, funding, intent) | 12 | 4 | 3 | 2 | Fat SDR 25; Fat ADMIN 22; Rid CS 12 |
| Has contacts in a sequence filter | 10 | 3 | 1 | 2 | Hal SDR 22; Rid SDR 1 |
| Has open deals filter | 4 | 15 | 12 | 3 | — |
| Technology filter | 3 | 1 | 1 | 1 | — |
| Funding filter | 4 | 2 | 1 | 1 | Fat SDR 12; Fat ADMIN 10 |
| Revenue filter | 4 | 3 | 1 | 1 | — |
| Founded year filter | 2 | 1 | 0.5 | 0.5 | — |
| Keywords filter | 4 | 1 | 1 | 1 | — |
| Parent company filter | 1 | 2 | 3 | 2 | — |
| Custom field filter | 3 | 3 | 4 | 6 | — |
| Source filter (found, imported, CRM) | 2 | 1 | 1 | 6 | Hal ADMIN 15 |
| Added on filter | 3 | 1 | 1 | 5 | — |
| **Columns** | | | | | |
| Company and domain | 95 | 60 | 75 | 30 | Fat ADMIN 80 |
| Contacts held | 80 | 40 | 50 | 20 | Fat ADMIN 70 |
| Stage | 70 | 45 | 70 | 20 | Fat ADMIN 60 |
| Last activity | 60 | 40 | 65 | 15 | Fat ADMIN 50 |
| Industry | 25 | 8 | 10 | 8 | Fat ADMIN 25; Rid SDR 10 |
| Employees | 18 | 12 | 8 | 6 | Fat ADMIN 18 |
| Owner | 25 | 30 | 30 | 25 | Fat SDR 4; Fat ADMIN 4 |
| Contacts in a sequence | 35 | 8 | 3 | 5 | Hal SDR 50; Hal ADMIN 25; Rid SDR 3; Rid ADMIN 1; Fat ADMIN 30 |
| Open deals | 8 | 30 | 25 | 6 | Fat SDR 15; Fat ADMIN 22 |
| Last reply | 15 | 8 | 6 | 2 | Hal SDR 22 |
| Location | 6 | 5 | 5 | 3 | Hal SDR 22 |
| Signals | 8 | 4 | 4 | 2 | Fat SDR 20; Fat ADMIN 18; Rid CS 15 |
| Fit score | 5 | 3 | 2 | 2 | Fat SDR 15; Fat ADMIN 12 |
| Parent company | 1 | 3 | 4 | 2 | — |
| Added on | 3 | 2 | 2 | 8 | — |
| Source | 2 | 1 | 1 | 8 | Hal ADMIN 15 |
| Revenue | 3 | 3 | 1 | 1 | — |
| Founded | 1 | 0.5 | 0.5 | 0.5 | — |
| Company phone | 3 | 2 | 3 | 1 | — |
| Enriched on | 2 | 1 | 1 | 5 | — |
| **Row and bulk actions** | | | | | |
| Find people at this company | 85 | 30 | 20 | 10 | Fat ADMIN 65; Rid SDR 30; Rid CS 10 |
| Open the company record | 60 | 50 | 70 | 20 | Fat ADMIN 50 |
| Add to list | 50 | 10 | 12 | 6 | Fat ADMIN 40; Rid SDR 15; Hal SDR 60; Hal ADMIN 20 |
| Research with the agent, credit cost shown (critical) | 30 | 10 | 8 | 8 | Fat SDR 50; Fat ADMIN 40 |
| Select rows and the bulk bar | 40 | 10 | 15 | 15 | Rid SDR 10; Fat ADMIN 30 |
| Change stage | 12 | 20 | 25 | 6 | — |
| Change owner | 5 | 6 | 10 | 25 | Fat SDR 0; Fat ADMIN 2 |
| Edit company | 4 | 5 | 8 | 10 | — |
| Push to CRM, with what it overwrites | 5 | 12 | 5 | 15 | Fat SDR 0; Fat ADMIN 0 |
| Export CSV | 4 | 3 | 8 | 15 | Hal ADMIN 30 |
| Remove from workspace, with what it stops | 3 | 1 | 2 | 4 | — |
| Merge duplicates | 1 | 1 | 1 | 5 | — |
| Flag data as wrong | 2 | 1 | 1 | 1 | — |
| **Page actions** | | | | | |
| Find companies in the database | 70 | 15 | 3 | 10 | Fat ADMIN 55; Hal SDR 75; Hal ADMIN 30; Rid SDR 10; Rid ADMIN 3 |
| Import a CSV | 5 | 2 | 3 | 12 | Hal ADMIN 35; Hal SDR 15 |
| Saved views | 18 | 12 | 25 | 8 | Hal SDR 45; Hal ADMIN 25 |
| Sort by a column | 12 | 20 | 18 | 10 | — |
| Choose columns | 4 | 4 | 6 | 6 | — |
| Alert me when a view gains companies | 4 | 1 | 2 | 1 | — |
| Command palette and shortcuts | 15 | 10 | 8 | 10 | Hal SDR 30 |
| **Company record** | | | | | |
| Name, domain, stage, owner, last activity | 60 | 50 | 70 | 20 | Fat ADMIN 50 |
| Contacts at this company | 60 | 45 | 65 | 15 | Fat ADMIN 50 |
| Recent activity, last five | 40 | 40 | 60 | 10 | Fat ADMIN 35 |
| Open deals | 15 | 50 | 45 | 10 | Fat SDR 25; Fat ADMIN 30 |
| Contacts in sequences here | 25 | 6 | 2 | 3 | Hal SDR 45; Rid SDR 3; Fat ADMIN 25 |
| Notes | 8 | 20 | 30 | 3 | — |
| Open tasks here | 12 | 18 | 18 | 3 | — |
| Agent research, last run and cost | 18 | 10 | 6 | 6 | Fat SDR 45; Fat ADMIN 40 |
| Company details: industry, size, location, founded, description | 18 | 15 | 12 | 8 | Fat ADMIN 20 |
| All activity | 10 | 15 | 18 | 4 | — |
| Signals and news | 8 | 6 | 8 | 2 | Fat SDR 18; Fat ADMIN 15; Rid CS 15 |
| Custom fields | 3 | 5 | 8 | 10 | — |
| CRM sync status and last error | 4 | 8 | 6 | 20 | Fat SDR 0; Fat ADMIN 0 |
| Parent and subsidiaries | 1 | 3 | 4 | 2 | — |
| Similar companies | 4 | 2 | 1 | 1 | Fat SDR 12; Fat ADMIN 10 |
| Files | 1 | 4 | 5 | 1 | — |
| Lists this company is in | 4 | 3 | 5 | 3 | Hal SDR 15 |

**Shape check** (77 items, computed with `shape()` from `model.ts`):

| Pair | Head | Body | Tail | Read |
|---|---|---|---|---|
| Meridian SDR | 21 (27%) | 26 (34%) | 30 (39%) | Head slightly over the 25% mark. The SDR lives on this page; it is the density case named in PRODUCT.md, and 21 items is still a search box, four chips, seven columns, five row actions, one button and three record blocks |
| Ridgeline CS | 17 (22%) | 29 (38%) | 31 (40%) | Within shape |
| Meridian admin | 10 (13%) | 34 (44%) | 33 (43%) | A visitor's profile: search, owner, CRM |
| Halyard SDR | 27 (35%) | 21 (27%) | 29 (38%) | The agency case: views, location and in-sequence are daily, so the head grows, which is the point of the per-business override |

Reading a column counts as touching it only when the role reads it to decide something or sorts by it; that is why Employees (filtered on, then ignored) sits under 20 for everyone.

## 5. Before: the common version

Modelled on Apollo's Companies page and account profile. Knowledge base articles, fetched through the Zendesk API on 13 September 2026: [Search for Companies](https://knowledge.apollo.io/hc/en-us/articles/4412658766477) (31 Aug 2026), [Use Search Filters](https://knowledge.apollo.io/hc/en-us/articles/4412665755661) (11 Sep 2026, "the glossary"), [View and Edit Accounts](https://knowledge.apollo.io/hc/en-us/articles/5995865049229) (1 Sep 2026), [Save Contacts and Accounts](https://knowledge.apollo.io/hc/en-us/articles/4413032484493) (9 Sep 2026), [Stages Overview](https://knowledge.apollo.io/hc/en-us/articles/4410623601165) (28 Aug 2026), [Saved Searches](https://knowledge.apollo.io/hc/en-us/articles/4409803718669) (30 Aug 2026), [Import a CSV of Accounts](https://knowledge.apollo.io/hc/en-us/articles/4409154067981) (31 Aug 2026), [Account Hierarchy](https://knowledge.apollo.io/hc/en-us/articles/10279502128397) (3 Sep 2026).

**Layout and navigation.** Left nav group "Prospect & enrich" holds People, Companies, Lists, Data enrichment. The Companies page has a filter panel on the left, opened by "Show Filters"; the full set is behind "More Filters". Above the results, three counters, Total, Net new and Saved; "Saved" is a separate view of the same table for accounts already in the workspace. Results are a table with a "Bulk Selection" checkbox offering "Select number of companies", "Select this page" and "Select all". Ticking rows reveals an action bar: Save, Find people, List, Workflows, Export, Edit, Push to CRM, and "… > Prospect on LinkedIn". A "Qualify Account > Click to run" AI power-up sits on rows. Saved searches live under a "Default view" selector with All, Your, Favorites and Shared. Import is "Import > CSV". Account stages: Cold, Current Client, Active Opportunity, Dead Opportunity, Do Not Prospect.

**The record.** "Click Saved… then click a company." Six widgets on the left (Company details, Record details, Tasks, Deals, Contacts, Notes) and eleven tabs on the right (Overview, Activities, People, Recommendations, Existing contacts, Sequences, Conversations, Enrichment, Locations, All fields, Files). Record details has "See all fields" and a ⚙ to add fields to the widget. A "Layout > Create layout > Add widget > Create widget" builder lets each user rearrange the page. Actions menu: Edit company info, Flag as inaccurate, Delete account.

**Problems, each with its source.**

1. *Filters are three or four levels deep.* "Click Show Filters > More Filters" (Search for Companies), then a filter, then for Industry "Advanced Settings > Is known / Is unknown" (glossary). Rule 2.
2. *The door is labelled by audience and by plan.* "Some Apollo plans include more filters than others. To access advanced filters, upgrade your plan" (glossary). Reviewers report the cost: "a learning curve at the start, especially with advanced filters" (Sanket D., Capterra, 10 Apr 2026); "the gap between basic usage… and advanced usage… is wide" (SyncGTM review, 2026, secondary). Rules 3 and 4.
3. *Sixty-five filters, twenty of them "Most popular".* The glossary lists 20 popular and about 45 further "People and company filters". The Salesforge four-week review counts "65-plus attributes". No frequency data decides which twenty are up front. Rule 1.
4. *The same table split into Net new and Saved.* The KB advises: "Don't see any search results?… you may have already saved all matching records… click Saved" (glossary). The user holds a mode in their head to know why a company is missing. Rule 5.
5. *Hover-only controls.* "Hover over the saved search you want to edit and click …"; "Hover over a task and click ✓"; "hover over an editable field… then click Edit" (Saved Searches; View and Edit Accounts). No touch or keyboard route is documented. Rule 4.
6. *Unlabelled icons cause wrong bulk actions.* "I accidentally spent a bunch of time individually selecting people only to click on the wrong 'add to list' icon that just added the entire company to my list" (Ryan P., Capterra, 31 Oct 2025). Rule 4.
7. *Credit cost comes last.* Saving companies leads to a wizard whose penultimate step is "Review the credit usage estimate" (Save Contacts and Accounts); the Qualify Account power-up runs AI research from a row with no cost on the control. Reviewers: "Apollo AI assistant ran operations quoting me a certain amount of credits, and then racked up a separate bill" (Paige Robillard, Trustpilot, 18 Aug 2026). Rule 7.
8. *A record with six widgets and eleven tabs, two of them "being deprecated"* and still shown (View and Edit Accounts), plus a per-user layout builder. Spool (2011): fewer than 5% change a setting; the builder is the "let users customise it" fix for a default nobody chose. Rules 1 and 8.
9. *Context leaves the page.* Import status is at "Settings > Imports and exports > Account Import" (Import a CSV of Accounts); the parent-company field needs "See all fields" first (Hierarchy). Rule 5.
10. *Too many clicks, in reviewers' words.* "too many clicks to reach data" (Hassnaa, Trustpilot, 4 Sep 2026); "a little busy when I only need quick validation" (Ellie A., Capterra, 16 May 2026); "one click too many each time" (G2 reviewer via SyncGTM, secondary).
11. *Delete consequence.* The KB warns that deleting removes the account from "any lists, tasks, or sequences where the account is currently active"; whether the dialog says so is unverified. Rule 7.

**What Apollo gets right, kept in the after.** Counts update as filters change, "in under two seconds"; "Has email" toggles "do real filtering" (Salesforge review). AND-across, OR-within logic is stated plainly. A "Search or ask a question ⌘K" box sits in the top bar (KB screenshots, `knowledge-base/sources/07-apollo-settings-map.md`). Admins can set a default saved view per user, team or company (Manage Search Sharing and Defaults, 2 Sep 2026).

## 6. After: the disclosed version

**Layout.** One table, one search box, the role's filter chips, one primary button. No Net new or Saved split: the workspace's companies are the table, and the database is a drawer. Row actions on hover and focus, "…" always visible. Doors expand in place or open a drawer; the record is a page.

**Level one and level two by role, at Meridian.**

| Role | Level one | Level two, by door |
|---|---|---|
| SDR | Search; chips Stage, Industry, Employees; columns Company, Contacts held, Stage, Last activity, Industry, Owner, In a sequence; row actions Find people, Add to list, Research (12 credits), Open; bulk bar; Find companies | More filters (owner, location, activity, signals, lists, deals, fields); Columns; Views; row menu (stage, owner, edit, push, export, merge, flag, remove); More (import, export all, alerts) |
| AE | Search; chips Stage, Owner; columns Company, Contacts held, Stage, Last activity, Owner, Open deals; row actions Find people, Research, Change stage, Open | More filters; Columns; Views; row menu; More (Find companies moves here) |
| CS | Search; chip Stage; columns as AE; row actions Find people, Research, Change stage, Open; Views | More filters (last activity is first in the door); Columns; row menu; More |
| Admin | Search; chip Owner; columns Company, Contacts held, Stage, Owner; row actions Open, Research, Change owner | More filters; Columns; Views; row menu (push to CRM is first); More (import is first) |

**Across the four businesses.** Fathom: only SDR and founder-admin; the admin's page equals the SDR's, Signals becomes a chip for both, Owner chip and column drop to level two, Push to CRM and the CRM door are removed. Halyard: the outbound specialist gains Location and In-sequence chips, Location and Last reply columns, and Views at level one; the ops lead gets Import CSV as a second button. Ridgeline: Find companies moves into "More" for everyone, the In-sequence column goes to level two, Last activity becomes a chip for CS, Open deals is a level-one column for AE and CS, and the Signals column is level one for CS.

**Doors, labels, containers.**

| Door | Label | Container | Content |
|---|---|---|---|
| More filters | "More filters: owner, location, activity, signals, lists, fields · 2 on" | In place, second row | The level-two filters for the role, in usage order |
| Columns | "Columns: 7 of 20" | Popover | Checkbox list in table order |
| Views | "Views: All companies" | Popover | Saved views with Set as default, Delete |
| Row menu | "…" with `aria-label="Actions for Northwind Analytics"` | Menu | All row actions; Remove last with its consequence |
| Find companies | "Find companies" | Drawer | Flat database filters, count, results with Save and Find people; cost line in the header |
| Import CSV | "Import CSV" | Drawer | File, mapping, stage, owner, list, duplicates |
| More | "More: import, export all, merge, alerts" | Menu | Page actions under 20% for the role |
| Record doors | "Company details", "All activity · 48", "Agent research · 3 runs, last 2 Sep, 12 credits a run", "Notes · 2", "Open tasks · 1", "Contacts in sequences · 2", "Signals and news · 3", "Custom fields · 2", "CRM sync · synced 09:10", "Parent and subsidiaries", "Similar companies", "Files · 0", "Lists · 2" | In place | Each opens on its content; a zero count opens on the add control |

Every door is a button with chevron and text, sits directly above what it reveals, and is removed rather than disabled when it cannot apply (CRM at Fathom; Change owner for a role that may not change owners is replaced by the one-line explanation).

**The record page.** Header: name, domain, stage badge, owner, last activity; actions Find people, Add to list, Research (12 credits), "…" (edit, push, remove). Level one: Contacts at this company (name, title, stage, sequence, last activity, row actions Sequence and Call), then the role's blocks: Recent activity for everyone, Open deals and Notes for AE and CS, Contacts in sequences for SDR. Below, the doors in usage order for the role, "Expand all" at the top of the group; print expands all. The deal record uses the same template with its own blocks.

**Persistence.** Per user per business under `ollopa.companies.<business>.<user>`: filter values, More filters open or closed, columns, sort, active view, drawer filters, each record door, Expand all. Nothing resets on navigation.

**Accelerators.** The shortcuts in section 3, shown in the palette and on menu items; More filters kept open; type-ahead in every popover; the bulk bar; a default view as the one-click daily setup.

**Decision-critical, visible without a click.** The credit cost on Research and in the Find companies header; the Do not prospect badge on the row; what Remove, Do not prospect and Push to CRM will do, on the control and again in the inline confirmation, with the credit balance. No price lives on this page. Undo is one click in the toast, no longer than the action.

**Removed, not hidden.** The Net new / Saved / Total split; the per-user layout builder; the two deprecated tabs; Prospect on LinkedIn, Workflows, Conversations, Meeting assistant and Locations (outside the boundary, or a single field); the separate "Qualify account" power-up, folded into Research with its cost; plan-gated filters; hover-only ticks and edits; the 100-page cap; import status in Settings.

**Score.**

1. Decision-critical visible: 2. Cost, consequence and blocklist state are on the controls and the row.
2. Usage-backed: 2. Seventy-seven items in `companies.ts`, four shape checks.
3. Two levels: 2. Page, then one door; drawer contents are flat; phone is the same depth.
4. Doors labelled by content with chevron and text: 2. Counts on every door.
5. Adjacent, keyboard, touch: 2. In-place rows and popovers under their buttons; every action has a key and a visible "…".
6. Nothing dependent split: 2. Contacts held and In a sequence are neighbours; cost sits with the action; stage and its consequence sit together.
7. Persistence, expand all, print: 2.
8. User or object state only: 2. The bulk bar follows selection; no "recent" or reordering.
9. Instrumented and reviewed: 1. Door-open events are named in the spec (`door.open` with door id, role, business) but no analytics runs behind the demo; the semi-annual promote-or-delete review follows RULES.md.

Total: 17 of 18.

## 7. Rules that mattered most

- **Rule 1.** Contacts held and In a sequence are columns, not record tabs, because the SDR reads them on every row; Employees is a filter, not a column, because it is set once and then ignored.
- **Rule 2.** Filters are a chip row and one in-place door. Apollo's Show Filters > More Filters > filter > Advanced Settings became one click.
- **Rule 4.** No hover-only control anywhere; every door says what it holds and how much; nothing is labelled "advanced".
- **Rule 7.** Research carries its credit cost on the button; Remove and Do not prospect say what they stop before the click.

## 8. Review

| Check | Result |
|---|---|
| All roles | SDR, AE, CS, admin in section 6; marketer on the no-access page. Gap: gated actions had no explanation inside the page; closed with the "ask Daniel Okafor" line in the row menu |
| All four businesses | Section 6 and the overrides. Gap: Fathom had Push to CRM at 5%; closed by removing it, no CRM |
| Every field has a source | Section 2. Gap: `Company.contacts` did not match the contacts array; closed by deriving it |
| Every action has an outcome | Section 3 |
| Empty, error, no-access | Section 3. Gap: the template has no loading state; specified as skeleton rows |
| Keyboard, phone width | Section 3; same depth on the phone |
| Decision-critical visible | Cost, consequence, blocklist badge, balance |
| Two levels maximum | Checked per channel: table, drawer, menu, record |
| Doors labelled by content | Section 6, with counts |
| Dependent fields together | Contacts and In a sequence; action and cost; stage and consequence. Gap: Apollo hides the parent field behind "See all fields" and the hierarchy elsewhere; closed by one door holding both |
| State persists, accelerators | Section 6 |
| Usage shape | Four pairs in section 4; SDR head at 27% explained |
| Nothing hover-only | Row actions also on focus and in "…"; no hover ticks |
| Role gaps explain themselves | No-access page and the in-menu line |
| No usage numbers or teaching text | Numbers live in `companies.ts` and here; the page shows counts of data only |

Difference from what is built: `pages/tables.tsx` shows Industry and Employees for every role, has no Owner filter, no More filters door, no bulk bar, and "View" is a toast. The template gains sortable headers, a columns popover, a bulk bar and an in-place door row.
