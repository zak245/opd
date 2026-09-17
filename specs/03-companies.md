# Companies

*The accounts table: which companies the workspace holds, how many people it holds at each, and the company record behind every row, at two levels — a quick-look drawer and a full record page. A "real" page built from the table template; the record page is built from the record template shared with the deal record. Usage data: `src/ollopa/usage/companies.ts`.*

## 1. Purpose

Companies is where a person moves from "which accounts" to "which people at them". The SDR lives here daily (all day at Halyard): filter a set of accounts, see how many contacts are held at each and whether any are in a sequence, then find people. Customer success uses it daily the other way round: which current clients have gone quiet. The AE checks ownership and open deals before touching an account, several times a week. The RevOps admin reassigns owners and watches CRM sync, weekly. The marketer has no access.

The one thing nobody must lose sight of: **the contacts held at each company**. A row is not a company; it is "this company, the 4 people we hold there, 2 in a sequence, last touched 3 days ago". Every level-one decision follows from that.

Route: `#/ollopa/companies`. The record page: `#/ollopa/companies/<id>`, rendered under the `companies` page key. The quick look has no route of its own; it is a drawer beside the table, and the record page is what a link or a deep link opens.

## 2. Data

Seed type `Company` in `src/ollopa/data/seed.ts` plus derived rows from the same seed.

| Field | Shown where | Source | Seed change |
|---|---|---|---|
| Name, domain | Column 1, record header | `Company.name`, `Company.domain` | none |
| Stage | Column, filter, record header | `Company.stage`. The five account stages are owned by Settings (`pipe.contact-stages`) and read here: Cold, Active opportunity, Current client, Churned, Do not prospect | Settings defines the fifth value; a blocklisted account is safety state and must be visible on the row |
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

**Filters.** Level-one filters are chips next to the search box; the rest sit behind one door named by what is inside it — "Additional filters: owner, location, activity, signals, lists, fields" — which expands a second row in place. No door in Ollopa is called "More", "More filters", "More actions", "Other" or "Advanced"; a door label names its contents (PLAN, 14 Sep 2026). Each filter is a select with "all" first; values inside a filter are OR, across filters AND, stated once as "Matching all of: Stage, Industry". "Clear" appears when anything is set. Values persist. Full list in section 4.

**Columns.** Seven by default per role; "Columns: 7 of 20" opens a popover of checkboxes in table order. Choices persist. Widths are fixed; no horizontal scroll at desktop width.

**The record has two levels.** Clicking the row (or `Space`) opens the **quick look**: a flat drawer beside the table, the table still in view, holding the few fields a glance needs in the same order and with the same labels as the top of the record page — name and domain, stage, owner, contacts held, contacts in a sequence, last activity, open deals. Nothing collapses inside it and nothing is editable except the stage badge, the one field the glance exists for. `Esc` closes it; `j` and `k` move it down the table. The name, `Enter`, and every link from elsewhere open the **record page**. Removing the drawer would cost only speed, which is the test it has to pass. It is the same quick look Accounts opens from its own rows, rendered there with the customer-state field set — health with its band and 30-day change, the four health drivers as flat lines directly under it, renewal and days left, value, open risks, last touch, champion, owner and the next step — so a health score is never across a door from the reasons that sum to it ([11 Accounts](11-accounts.md) §3).

**Row actions.** The seat's level-one actions appear as text buttons with icons on hover and on keyboard focus; the "…" button is always visible, is named "Actions for {company}", and its menu repeats the visible actions, then the rest, with Remove last below a divider and its consequence written into the label.

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

**Agent research, and the brief it produces.** The research door on the record lists runs, newest first, and every row carries its provenance in words rather than an icon: which agent ran it, when, and how many sources it read — "Research agent · 12 Sep 09:02 · 14 sources · 12 credits". The latest run carries **"Open the brief"**.

The brief is a record page built from the shared record template, which spec 09 §6.8 owns; what this page settles is what a research brief about a company has to carry. The header names the actor and the run time, so nobody has to ask whether a person or an agent wrote it. Every source is listed with a link, so every generated line can be checked at its origin. The run's credit cost sits on the record itself, not in a billing screen, because the next thing a reader decides is whether to spend again. And that decision has one control, **"Research again · 12 credits"**, which prices itself before the click. The brief has no doors: it is read top to bottom, and a brief with a door is a brief somebody skims.

One brief opens from four places and is the same object in all four: the research door here, the meeting panel, the deal record, and Home's overnight research line.

**Bulk.** Checkbox per row and in the header, which offers "This page (25)" and "All 3,100 matching". While anything is selected a bar replaces the filter row: "12 selected · Add to list · Find people · Change stage · Change owner · Export · Push to CRM · Remove · Clear". Bulk Remove and Push show what they affect before confirming. Escape clears.

**Page actions.** "Find companies" (primary) opens a drawer over the table: a flat list of database filters (industry, employees, location, revenue, funding, hiring, technology, keywords, intent), a live count, results with Save and Find people per row, bulk Save. The header says saving is free and finding people costs "1 credit per verified email". Drawer filters persist.

Two **exclusions sit at level one in that drawer, above the database filters**, and both are on by default for the SDR: "Exclude companies I already own" and "Exclude companies with a contact in a sequence". Each restates the count as it is turned on or off — "2,860 matching · 240 excluded, already yours" — so the number in front of the person is always the number they would buy. They are level one because they are the difference between prospecting and prospecting the same accounts twice, and a person who finds that out after spending credits has been charged for a mistake the product could have named. They are removed, not disabled, for a seat that owns nothing.

"Import CSV" opens the **import wizard page** with Companies as the destination, and ends on the job record, never on a toast. There is one import wizard in the product, reached from People, Companies and Lists, and [18 Import and enrichment](18-import-and-enrichment.md) owns its five steps, its ten-row credit trial and its job record. This page holds the entry point and nothing else: no drawer body, and no second copy of the flow. "Views" is a popover of saved views (Mine, Shared, Default) with Set as default and Delete as text buttons; "Save view" appears in the filter row when the filters differ from the active view. "Alert me" on a view sends a daily or weekly digest. The page actions that sit under level one for the seat live in one menu named by its contents: "Import, export all, merge, alerts".

**States.** Empty workspace: "No companies yet" with Find companies and Import CSV. Filtered empty: "Nothing matches. Clear the search or a filter" with a Clear button (built). Loading: header and filter row at once, 10 skeleton rows, counts as "…". Error: a banner "Companies could not load. Retry" above the last loaded rows. No access: Companies is an area the marketer's seat does not hold, so the marketer gets the shell's no-access page, "Companies is not part of your seat. It is used by: SDR, Account executive, Customer success, RevOps admin. If you need it, ask Daniel Okafor (RevOps admin) to change your permissions", with Back to Home. There is no read-only view. Actions the seat may not take (Change owner for a Meridian SDR, Push to CRM for CS) are removed from menus, and the menu ends with one line in body contrast, "Owner changes: ask Daniel Okafor". If the workspace profile had left Companies out of a seat's sidebar, the page would open as normal and its header would offer "Add to sidebar"; the three kinds of "cannot see it" are kept apart (spec 00).

**Keyboard.** `/` search, `↑ ↓` move the row focus, `Space` quick look, `Enter` open the record page, `f` find people, `l` add to list, `r` research (opens the cost confirmation), `x` select, `⇧A` select the page, `Esc` clear selection or close a door, `c` columns, `v` views, `⌘K` the palette, which lists every action with its shortcut. Tab order: search, filters, Additional filters, Columns, Views, Find companies, then the table. Row action buttons are in the DOM at all times; they change opacity, not presence.

**Accessibility.** A real `<table>` with `aria-sort`; each door a `<button>` with `aria-expanded` and `aria-controls`; counts and filter changes announced through a polite live region; targets at least 24 px; the stage badge carries text, never colour alone; focus moves into a drawer on open and back to the trigger on close; reduced motion gets a crossfade.

**Phone width.** Three columns: Company (name, domain, "4 contacts · 2 in sequence" as a second line), Stage, Last activity. Tap opens the record; each row keeps a visible "…". Chips scroll horizontally; the additional-filters door is a bottom sheet; Find companies is a full-screen sheet; the bulk bar sticks to the bottom. Nothing one level deep on desktop becomes two on the phone.

**By role and business.** Level one is decided by the usage model (section 6). Independent of numbers: Push to CRM and the CRM door are removed at Fathom (no CRM); "Find companies" is a primary button wherever an outbound seat uses it weekly, and at Ridgeline it moves into the page-actions menu, whose label then reads "Find companies, import, export all, merge, alerts".

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
| Quick look: the drawer beside the table | 55 | 30 | 45 | 12 | Fat ADMIN 45; Hal SDR 65; Rid CS 55 |
| Open the full company record | 35 | 45 | 55 | 20 | Fat ADMIN 40 |
| Add to list | 50 | 10 | 12 | 6 | Fat ADMIN 40; Rid SDR 15; Hal SDR 60; Hal ADMIN 20 |
| Research with the agent, credit cost shown (critical) | 30 | 10 | 8 | 8 | Fat SDR 50; Fat ADMIN 40 |
| Select rows and the bulk bar | 40 | 10 | 15 | 15 | Rid SDR 10; Fat ADMIN 30 |
| Change stage | 12 | 20 | 25 | 6 | — |
| Change owner | 5 | 6 | 10 | 25 | Fat SDR 0; Fat ADMIN 2 |
| Edit company | 4 | 5 | 8 | 10 | — |
| Push to CRM, with what it overwrites | 5 | 12 | 5 | 15 | Fat SDR 0; Fat ADMIN 0 |
| Export CSV | 4 | 3 | 8 | 15 | Hal ADMIN 30 |
| Remove from workspace, with what it stops (critical) | 3 | 1 | 2 | 4 | — |
| Merge duplicates | 1 | 1 | 1 | 5 | — |
| Flag data as wrong | 2 | 1 | 1 | 1 | — |
| **Page actions** | | | | | |
| Find companies in the database | 70 | 15 | 3 | 10 | Fat ADMIN 55; Hal SDR 75; Hal ADMIN 30; Rid SDR 10; Rid ADMIN 3 |
| Exclude companies I already own (Find companies) ✱ | 55 | 12 | 2 | 10 | Fat ADMIN 45; Hal SDR 60, ADMIN 25; Rid SDR 8 |
| Exclude companies with a contact in a sequence ✱ | 50 | 10 | 2 | 8 | Fat ADMIN 40; Hal SDR 55, ADMIN 22; Rid SDR 6 |
| Import a CSV (opens the import wizard page) | 5 | 2 | 3 | 12 | Hal ADMIN 35; Hal SDR 15 |
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
| Health score with its band and 30-day change | 2 | 18 | 45 | 8 | Rid CS 60, AE 40; Fat ADMIN 20; Hal ADMIN 2 |
| Health drivers: the four numbers that sum to the score | 1 | 8 | 25 | 5 | Rid CS 45, AE 20; Fat ADMIN 10; Hal ADMIN 1 |
| Renewal terms: date, days left and contract value ✱ | 1 | 20 | 40 | 10 | Rid CS 25, AE 25; Fat ADMIN 18; Hal ADMIN 2 |
| Next step with its date | 2 | 18 | 40 | 5 | Rid CS 40, AE 30; Fat ADMIN 12; Hal ADMIN 1 |
| Open risks ✱ | 1 | 12 | 35 | 6 | Rid CS 45, AE 25; Fat ADMIN 12; Hal ADMIN 2 |
| First value and the goals agreed at the start | 0.5 | 5 | 22 | 3 | Rid CS 18, AE 8; Fat ADMIN 6; Hal ADMIN 0.5 |
| Expansion signals | 2 | 12 | 15 | 3 | Rid CS 40, AE 45; Fat ADMIN 8; Hal ADMIN 1 |
| The hand-off brief: why they bought and what was promised | 0.5 | 10 | 18 | 2 | Rid CS 12, AE 15; Fat ADMIN 0; Hal ADMIN 0 |
| Touches: the logged calls, emails and meetings | 3 | 12 | 30 | 3 | Rid CS 18, AE 12; Fat ADMIN 8; Hal ADMIN 1 |
| Usage over 90 days | 0.5 | 5 | 15 | 2 | Rid CS 35, AE 25; Fat ADMIN 4; Hal ADMIN 0.5 |
| Seats and last sign-in | 0.5 | 4 | 12 | 2 | Rid CS 18, AE 20; Fat ADMIN 3; Hal ADMIN 0.5 |
| Agent research: runs, each with agent, date, sources and cost | 18 | 10 | 6 | 6 | Fat SDR 45; Fat ADMIN 40 |
| Open the brief from the latest run | 25 | 15 | 5 | 8 | Fat SDR 50, ADMIN 45; Rid SDR 10, AE 20 |
| Research again · 12 credits ✱ | 12 | 6 | 3 | 5 | Fat SDR 30, ADMIN 25 |
| Company details: industry, size, location, founded, description | 18 | 15 | 12 | 8 | Fat ADMIN 20 |
| All activity | 10 | 15 | 18 | 4 | — |
| Signals and news | 8 | 6 | 8 | 2 | Fat SDR 18; Fat ADMIN 15; Rid CS 15 |
| CRM sync status and last error | 4 | 8 | 6 | 20 | Fat SDR 0; Fat ADMIN 0 |
| Parent and subsidiaries | 1 | 3 | 4 | 2 | — |
| Full history, custom fields and files: custom fields | 3 | 5 | 8 | 10 | — |
| Full history, custom fields and files: files | 1 | 4 | 5 | 1 | — |
| Full history, custom fields and files: lists this company is in | 4 | 3 | 5 | 3 | Hal SDR 15 |
| Enrichment: each field, where it came from and when | 6 | 4 | 3 | 15 | Fat SDR 12, ADMIN 12; Hal ADMIN 20; Rid SDR 3 |
| Re-enrich this company · credit estimate shown ✱ | 4 | 2 | 1 | 8 | Fat SDR 10, ADMIN 10; Hal ADMIN 15 |

**Shape check.** One rule across this group: the denominator is every item in `companies.ts` that the seat has at that business — a weekly number above zero, or decision-critical — computed with `weeklyUse()` and `bandOf()` from `model.ts`. 94 items in the file: the eleven customer-state items and the two enrichment-drawer items the record renders were added and Similar companies was removed with its door.

| Pair | Items | Head | Body | Tail | Read |
|---|---|---|---|---|---|
| Meridian SDR | 94 | 25 (27%) | 28 (30%) | 41 (44%) | Just over the 25% mark, and closer to the band than before: the SDR lives on this page and it is the density case named in PRODUCT.md, but the customer state is almost nothing to this seat, so twelve of the thirteen new items land in the tail, enrichment provenance is the thirteenth and sits in the body, and the head does not move at all. 25 items is still a search box, four chips, seven columns, five row actions, one button, the two exclusions in Find companies, the quick look and three record blocks |
| Ridgeline CS | 94 | 25 (27%) | 34 (36%) | 35 (37%) | The second density case on this page, and the reason the customer state is measured here at all: at Ridgeline every account is a current client, so seven of the eleven customer-state items are head for this seat — health and its drivers, renewal, next step, risks, expansion signals and usage over 90 days. Over the band by two points, stated rather than corrected by pretending a CSM does not read them |
| Meridian admin | 94 | 10 (11%) | 46 (49%) | 38 (40%) | A visitor's profile: search, owner, CRM. The head does not move; enrichment provenance is the one new item this seat reads often, and at 15 it sits near the top of its door, which is where the admin's questions about where a field came from belong |
| Halyard SDR | 94 | 31 (33%) | 23 (24%) | 40 (43%) | The agency case: views, location, in-sequence and the two prospecting exclusions are daily, so the head grows, which is the point of the per-business override. The customer state costs the agency nothing — its clients are workspaces, not accounts — so the added items are tail here and the head share falls five points |

The marketer holds no row here: the seat cannot open the page, so measuring its five decision-critical items would describe a page that does not exist for them.

Reading a column counts as touching it only when the role reads it to decide something or sorts by it; that is why Employees (filtered on, then ignored) sits under 20 for everyone.

## 5. Before: the common version

Modelled on Apollo's Companies page and account profile. Two of these articles are in the settings memo's source list (Stages 4410623601165, Sharing and defaults 40430351927437); the others were fetched live on 13 September 2026 and are not reproduced in the knowledge base, so each is cited by title, URL and updated date and can be reopened. Anything resting on a review site is labelled secondary. Knowledge base articles, fetched through the Zendesk API on 13 September 2026: [Search for Companies](https://knowledge.apollo.io/hc/en-us/articles/4412658766477) (31 Aug 2026), [Use Search Filters](https://knowledge.apollo.io/hc/en-us/articles/4412665755661) (11 Sep 2026, "the glossary"), [View and Edit Accounts](https://knowledge.apollo.io/hc/en-us/articles/5995865049229) (1 Sep 2026), [Save Contacts and Accounts](https://knowledge.apollo.io/hc/en-us/articles/4413032484493) (9 Sep 2026), [Stages Overview](https://knowledge.apollo.io/hc/en-us/articles/4410623601165) (28 Aug 2026), [Saved Searches](https://knowledge.apollo.io/hc/en-us/articles/4409803718669) (30 Aug 2026), [Import a CSV of Accounts](https://knowledge.apollo.io/hc/en-us/articles/4409154067981) (31 Aug 2026), [Account Hierarchy](https://knowledge.apollo.io/hc/en-us/articles/10279502128397) (3 Sep 2026).

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
8. *A record with six widgets and eleven tabs, two of them "being deprecated"* and still shown (View and Edit Accounts), plus a per-user layout builder. Tabs are the disclosure mistake here — NN/g's rule is that tabs work only when the two sides are never needed together, and a company's people, deals and activity are read side by side — and the layout builder is the "let users customise it" answer to a default nobody chose. The figure often quoted for that ("fewer than 5% ever change a setting", Spool, UIE 2011) is a 2011 anecdote about consumer Word and there is no post-2018 replacement (`knowledge-base/11-what-changed-2018-2026.md`, rule 6), so it is not evidence about Apollo; the argument rests on rules 1 and 8, not on that number.
9. *Context leaves the page.* Import status is at "Settings > Imports and exports > Account Import" (Import a CSV of Accounts); the parent-company field needs "See all fields" first (Hierarchy). Rule 5.
10. *Too many clicks, in reviewers' words.* "too many clicks to reach data" (Hassnaa, Trustpilot, 4 Sep 2026); "a little busy when I only need quick validation" (Ellie A., Capterra, 16 May 2026); "one click too many each time" (G2 reviewer via SyncGTM, secondary).
11. *Delete consequence.* The KB warns that deleting removes the account from "any lists, tasks, or sequences where the account is currently active"; whether the dialog says so is unverified. Rule 7.

**What Apollo gets right, kept in the after.** Counts update as filters change, "in under two seconds"; "Has email" toggles "do real filtering" (Salesforge review). AND-across, OR-within logic is stated plainly. A "Search or ask a question ⌘K" box sits in the top bar (KB screenshots, `knowledge-base/sources/07-apollo-settings-map.md`). Admins can set a default saved view per user, team or company (Manage Search Sharing and Defaults, 2 Sep 2026).

## 6. After: the disclosed version

**Layout.** One table, one search box, the role's filter chips, one primary button. No Net new or Saved split: the workspace's companies are the table, and the database is a drawer. Row actions on hover and focus, "…" always visible. Doors expand in place or open a drawer; the record is a page.

**Level one and level two by role, at Meridian.**

| Role | Level one | Level two, by door |
|---|---|---|
| SDR | Search; chips Stage, Industry, Employees; columns Company, Contacts held, Stage, Last activity, Industry, Owner, In a sequence; the quick look; row actions Find people, Add to list, Research (12 credits), Open; bulk bar; Find companies | Additional filters (owner, location, activity, signals, lists, deals, fields); Columns; Views; row menu (stage, owner, edit, push, export, merge, flag, remove); the page-actions menu (import, export all, merge, alerts) |
| AE | Search; chips Stage, Owner; columns Company, Contacts held, Stage, Last activity, Owner, Open deals; row actions Find people, Research, Change stage, Open the record page | Additional filters; Columns; Views; row menu; the page-actions menu, which for this seat also holds Find companies; the quick look |
| CS | Search; chip Stage; columns as AE; the quick look; row actions Find people, Research, Change stage, Open; Views | Additional filters (last activity is first in the door); Columns; row menu; the page-actions menu |
| Admin | Search; chip Owner; columns Company, Contacts held, Stage, Owner; row actions Open, Research, Change owner | Additional filters; Columns; Views; row menu (push to CRM is first); the page-actions menu (import is first); the quick look |

**Across the four businesses.** Fathom: only SDR and founder-admin; the admin's page equals the SDR's, Signals becomes a chip for both, Owner chip and column drop to level two, Push to CRM and the CRM door are removed. Halyard: the outbound specialist gains Location and In-sequence chips, Location and Last reply columns, and Views at level one; the ops lead gets Import CSV as a second button. Ridgeline: Find companies moves into the page-actions menu for everyone, the In-sequence column goes to level two, Last activity becomes a chip for CS, Open deals is a level-one column for AE and CS, and the Signals column is level one for CS.

**Doors, labels, containers.**

| Door | Label | Container | Content |
|---|---|---|---|
| Additional filters | "Additional filters: owner, location, activity, signals, lists, fields (2 on)" | In place, second row | The level-two filters for the seat, in usage order |
| Columns | "Columns: 7 of 20" | Popover | Checkbox list in table order |
| Views | "Views: All companies" | Popover | Saved views with Set as default, Delete |
| Row menu | "…" with `aria-label="Actions for Northwind Analytics"` | Menu | All row actions; Remove last with its consequence in the label |
| Quick look | the row, or "Quick look" in the row menu | Drawer beside the table | The glance fields, flat: no doors and no sections inside |
| Find companies | "Find companies" | Drawer | Two exclusions first — already owned, contact in a sequence — each restating the count; then flat database filters, count, results with Save and Find people; cost line in the header |
| Import CSV | "Import CSV" | A page, not a door | The import wizard ([18](18-import-and-enrichment.md)), with Companies as the destination; it ends on the job record. The entry point is all this page owns |
| Page actions | "Import, export all, merge, alerts" | Menu | Page actions under 20% for the seat |
| Record doors | The eight the record template names ([09](09-deal-record.md) §6.8), for long content rarely needed beside the rest: "All activity · 48", "Agent research · 3 runs, last 2 Sep, 12 credits a run", "Signals and news · 3", "CRM sync · synced 09:10", "Parent and subsidiaries", "Full history, custom fields and files", Enrichment, and one tab, "People (n)" | In place; Enrichment is a drawer and People is the one tab | Each opens on its content; a zero count opens on the add control. The research door's first row is the latest run, carrying **"Open the brief"** and the provenance line beneath it |

Every door is a button with chevron and text, sits directly above what it reveals, and is removed rather than disabled when it cannot apply (CRM at Fathom; Change owner for a role that may not change owners is replaced by the one-line explanation).

**The record page.** Level two of the record, from the template shared with the deal record ([09](09-deal-record.md) §6.8 owns it). Header: name, domain, stage badge, owner, last activity, open deals count, company details (industry, size, location, founded) as key fields; actions Find people, Add to list, Research (12 credits), "…" (edit, push, remove with its consequence). **The header switches on the customer state**: when `Company.stage` is Current client or Churned it also carries health with its band, renewal and days left, contract value, open risks, last touch and next step, and loses them again when the stage changes back. There is one record, not two: `/ollopa/accounts/:id` redirects here, and [11 Accounts](11-accounts.md) builds no record of its own.

Then the related lists, as **scrolling sections, not tabs**: Contacts at this company (name, title, stage, sequence, last activity, row actions Sequence and Call), Open deals, Recent activity, Notes, Open tasks, Contacts in sequences. Sections are headings with content under them; a person reading a company reads its people *and* its deals *and* its last activity together, and a tab would hide one behind another. The template allows at most one tab, "People (n)", for a related table big enough to be a page of its own; this record does not use it at Meridian, because the largest related list there is 40 contacts and a section holds that with a "Show all 40" link into People.

**When the company is a customer**, the sections gain the customer-state block and lose it again when it is not, in this order: health drivers (the four stored numbers that sum to the score, as a section directly under the health field — never across a door from it), renewal terms, first value and the goals agreed at the start, open risks, expansion signals, the hand-off brief, touches, usage over 90 days, seats and last sign-in. Side cards gain renewal, champion and CRM sync. The field set, the section order and the quick look's customer-state fields are [11 Accounts](11-accounts.md) §3's to describe and [09](09-deal-record.md) §6.8's to define; this page renders them, adds nothing of its own, and keeps the same labels in the same order so the drawer stays the top of the page cut short.

Below the sections sit the **eight** doors [09](09-deal-record.md) §6.8 names, in usage order for the seat, for long content rarely needed alongside the rest: "All activity · 48", "Agent research · 3 runs", "Signals and news · 3", "CRM sync · synced 09:10", "Parent and subsidiaries", "Full history, custom fields and files", Enrichment (a drawer), and the one tab, "People (n)", where the list is big enough to be its own page. Custom fields, history and files are one door and not three, because a person who opens it reads whichever of the three they came for and the usage model counts them one at a time; Similar companies and Locations are removed rather than kept as doors onto a single field or a guess. The research door's first row is the latest run, carrying **"Open the brief"** and the provenance line beneath it. "Expand all" sits at the top of that group; print expands all. The order of the header fields and of the first section is exactly the order of the quick look, so the drawer is the top of this page cut short.

**Persistence.** Per user per business under `ollopa.companies.<business>.<user>`: filter values, the additional-filters door open or closed, columns, sort, active view, drawer filters, each record door, Expand all. Nothing resets on navigation.

**Accelerators.** The shortcuts in section 3, shown in the palette and on menu items; the additional-filters door kept open; type-ahead in every popover; the bulk bar; a default view as the one-click daily setup.

**Decision-critical, visible without a click.** The credit cost on Research, on "Research again" in the brief, and in the Find companies header, where the two exclusions and the counts they remove sit above the filters; the Do not prospect badge on the row; what Remove, Do not prospect and Push to CRM will do, on the control and again in the inline confirmation, with the credit balance. No price lives on this page. Undo is one click in the toast, no longer than the action.

**Removed, not hidden.** The Net new / Saved / Total split; the per-user layout builder; the eleven record tabs, which become sections (the two deprecated ones are gone); Prospect on LinkedIn, Workflows, Conversations, Meeting assistant, Locations and Similar companies (outside the boundary, or a single field, or a door onto a guess); the separate "Qualify account" power-up, folded into Research with its cost; hover-only ticks and edits; the 100-page cap; import status in Settings. Apollo's plan-gated filters are removed rather than copied: Ollopa does gate by plan (Starter, Growth, Scale) and does it by the named gated-features pattern in `RULES.md`, but nothing on this page is on the plan table, so there is no lock to show here and no filter behind one.

**Score.**

1. Decision-critical visible: 2. Cost, consequence and blocklist state are on the controls and the row.
2. Usage-backed: 2. Ninety-four items in `companies.ts`, four shape checks.
3. Two levels: 2. Page, then one door; drawer contents are flat; phone is the same depth.
4. Doors labelled by content with chevron and text: 2. Counts on every door, and the two doors that were labelled by nothing are renamed: "More filters" is now "Additional filters: owner, location, activity, signals, lists, fields", and the page menu "More" is now "Import, export all, merge, alerts". Nothing in this spec is called More, Other or Advanced.
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
| Doors labelled by content | Section 6, with counts. Gap found in the reconciliation pass: "More filters" and "More" named nothing; both renamed after what is behind them |
| Dependent fields together | Contacts and In a sequence; action and cost; stage and consequence. Gap: Apollo hides the parent field behind "See all fields" and the hierarchy elsewhere; closed by one door holding both |
| State persists, accelerators | Section 6 |
| Usage shape | Four pairs in section 4 against one stated denominator; the SDR head and the Ridgeline CS head both at 27% and each explained |
| Nothing hover-only | Row actions also on focus and in "…"; no hover ticks |
| Role gaps explain themselves | No-access page and the in-menu line |
| No usage numbers or teaching text | Numbers live in `companies.ts` and here; the page shows counts of data only |

Difference from what is built: `pages/tables.tsx` shows Industry and Employees for every role, has no Owner filter, no additional-filters door, no bulk bar, and "View" is a toast. The template gains sortable headers, a columns popover, a bulk bar and an in-place door row.
