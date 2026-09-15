# 09 · Deal record

*The AE's deal page. A full page, and lesson 3. It also defines the record template — and the quick look that goes with it — for the contact page, the company page, the account page and the detail views in Settings.*

## 1. Purpose

A deal record answers four questions without a click: where is this deal, how much is it, when does it close, and what happens next. Everything else on the page exists to make those four answers true.

Who lives here:

| Role | Business | How often | What they do here |
|---|---|---|---|
| Account executive | Meridian, Ridgeline | All day | Moves stages, logs calls, sets the next step, forecasts |
| Founder (admin seat) | Fathom | Daily | Works the 19 deals themselves, relies on agent research |
| Agency ops lead (admin seat) | Halyard | Daily, across ten workspaces | Tracks hand-off of booked meetings to each client's CRM |
| Customer success | Ridgeline, Meridian | Daily at Ridgeline, weekly at Meridian | Renewals and expansion deals |
| RevOps admin | Meridian, Ridgeline | Weekly | Audits history, fixes ownership, checks CRM sync |
| SDR, marketer | All | Never | No access; the page says so and names who has it |

The one thing nobody must lose sight of: the next step and its date. A deal with no next step is a deal that is not being worked. The header shows it, and it shows it as empty when it is empty.

## 2. Data

Every field on the page, where it comes from, and what the seed must gain. `Deal` in `src/ollopa/data/seed.ts` has `id, name, company, amount, stage, probability, closeDate, owner, lastActivity, nextStep`. The rest is added.

### 2.1 Fields shown

| Field | Source | Notes |
|---|---|---|
| Deal name | `Deal.name` | Editable title |
| Company | `Deal.company` → `Company` | Link to the company page |
| Stage | `Deal.stage` | Five stages, defined here and read by the board, Reports and Settings: Qualified, Discovery, Proposal, Negotiation, Closed won. `DEAL_STAGES` in the seed already holds exactly these and does not change. There is no Closed lost stage and no outcome flag: a deal that is lost is archived with a reason. Order comes from the business's pipeline definition (below) |
| Amount and currency | `Deal.amount`, add `Deal.currency` | Meridian: USD, EUR, GBP. Others: workspace default only |
| Close date | `Deal.closeDate` | |
| Owner | `Deal.owner` | A seat at the business |
| Next step and date | `Deal.nextStep`, add `Deal.nextStepDue` | |
| Probability | `Deal.probability` | Default from the stage; an override is stored on the deal |
| Forecast category | add `Deal.forecast` | `Pipeline · Best case · Commit · Closed · Omitted`. Default from the stage |
| Last activity | `Deal.lastActivity` | Derived from the newest timeline item once activities exist |
| Created, age | add `Deal.createdAt` | |
| Pipeline | add `Deal.pipeline` | Meridian: New business, Expansion. Ridgeline: Expansion, Renewal. Fathom and Halyard: one |
| Lost reason and archive date | add `Deal.lostReason`, `Deal.archivedAt` | A reason is required when a deal is archived as lost: Price, No decision, Competitor, Timing. An archived deal keeps its last open stage, leaves the board and the forecast, and stays on the company and in Reports |
| Custom fields | add `Deal.custom: Record<string, string \| number \| boolean>` and `customFieldDefs` per business | See 2.3 |
| CRM record | add `Deal.crmId`, `Deal.crmSyncedAt`, `Deal.crmError` | Only where a CRM is connected |
| Contacts on the deal | add `DealContact { dealId, contactId, role }` | Role: Champion, Economic buyer, Technical, User, Other |
| Activity timeline | add `DealActivity` | See 2.2 |
| Tasks | `Task`, add `Task.dealId` | |
| Files | add `DealFile { id, dealId, name, size, uploadedBy, at }` | |
| History | derived from `DealActivity` of kind `stage` and `field` | |
| Company signals | add `Company.signals: Signal[]` | Ridgeline: product usage. Others: news and hiring from the research agent |
| Agent proposal | `AgentEvent`, add `AgentEvent.dealId` | Kind `proposed` with `needsApproval` |
| All fields tail | add to `Deal`: `dealType, source, campaign, competitor, contractTerm, paymentTerms, discount, proposalLink, esign, splitOwners, tags, priority, lineItems` | Weighted amount is computed: amount × probability |

### 2.2 Timeline items

`DealActivity { id, dealId, kind, at, by, summary, detail?, meta? }`, kind one of `email · call · meeting · note · stage · field · task · agent · file`. Seed six to twenty per deal, deterministic from the business seed. Emails carry `meta.direction` and a body; calls carry duration and outcome; stage items carry from and to; field items carry field, old and new.

### 2.3 Custom fields per business

| Business | Fields | Group |
|---|---|---|
| Meridian | Use case (picklist), Legal review (Not started, In review, Approved), Security review (same), Procurement portal (checkbox), Region (picklist), Champion confirmed (checkbox) | Commercial; Legal |
| Fathom | none | door removed |
| Halyard | Hand-off status (Booked, Handed off, Client accepted, Client rejected), Meeting date (date), Client feedback (multi-line) | Client hand-off |
| Ridgeline | Plan tier (picklist), Seats (number), Renewal type (Auto, Negotiated), Usage score (number, read-only from signals) | Plan |

### 2.4 Pipelines

Add `pipelines` per business: name, stages, and per stage a default probability and forecast category. Meridian and Ridgeline have two pipelines; Fathom and Halyard have one. Stage names stay those of the seed: Qualified 10% Pipeline, Discovery 25% Pipeline, Proposal 50% Best case, Negotiation 75% Commit, Closed won 100% Closed. Five stages, no sixth; losing a deal is archiving it, not a stage.

## 3. Features

### 3.1 What is shown

- **Header.** Back link to Deals. Title. Company link. A status ribbon only when the deal is closed or has a sync error. A field grid: stage stepper with probability and forecast category under it; amount; close date; next step with date; owner; last activity. Pipeline and currency appear only where the business has more than one. Actions: Log activity, Mark won, Mark lost and archive, Delete deal.
- **Main column.** The activity timeline. A composer at the top (Call, Email, Meeting, Note). Filter chips: All, Emails, Calls, Meetings, Notes, Changes. Items grouped by day, newest first. Each item: kind icon, who, when, summary. Emails show two lines and a "Show full email" door. A pinned note sits above the day groups.
- **Side panel.** Cards: Next step (mirrors the header on phone only); Contacts on the deal; Open tasks; Company summary. Then doors: Custom fields, History, Files, Company signals and news, All fields, Sync history. A pending agent proposal is a card above the contacts while it exists.

### 3.2 Actions

| Action | Where | Outcome |
|---|---|---|
| Edit any header field | Click or Enter on the field | Editor opens in place; Enter saves, Esc cancels; toast with Undo; a `field` item lands on the timeline |
| Move stage | Click a step in the stepper, or S | Stage, probability and forecast update together; a `stage` item lands on the timeline; the board reflects it |
| Set next step | Header | Text and date; empty state reads "No next step" in the warning colour |
| Log call, meeting, note | Composer, or C, M, N | Item added; Last activity updates |
| Email | Composer, or E | Pick recipients from the deal's contacts; drafts in place; sending logs the email |
| Create task | Tasks card, or T | Task with due date, assigned to owner by default; appears on the Tasks page |
| Mark task done | Tasks card | Row leaves the card; a `task` item lands on the timeline |
| Add contact | Contacts card | Search people at the company; set role |
| Set contact role, remove contact | Contacts card row menu | Role chip changes; removal keeps the contact record |
| Mark won | Header, or W | Confirm: "Stage becomes Closed won, forecast Closed, 2 open tasks close." Deal locks; Reopen appears |
| Mark lost and archive | Header, or Shift+W | A reason is required. The consequence is written before confirming: "Archived as lost. The deal leaves the board and the forecast, its 2 open tasks close, and it stays on Northwind Analytics and in Reports." Fields lock; Reopen appears |
| Reopen | Ribbon | Returns the deal to its last open stage |
| Delete deal | Header | Confirm: "Removes this deal and its 14 activities. Contacts, the company and files stay on the company." Undo for 10 seconds |
| Enrich | Signals door | Button reads "Enrich · 2 credits"; runs and lists changed fields |
| Approve or dismiss agent proposal | Proposal card | Approve applies the next step or sends the draft; the card says which and any credits |
| Ask research agent | Proposal card footer or palette | "Research this company · 12 credits" |
| Upload, delete file | Files door | Drag or pick; delete asks once |
| Copy link, follow, duplicate, export | Header "…" menu | Each shows a toast naming what happened |

There are no bulk actions on a record. Bulk lives on the board.

### 3.3 Filters, search, sorting

The timeline filter chips are the only filter. Filter state persists per user. Timeline is always newest first; "Load older" appends. The Contacts card is ordered by role then last touch. Files by upload date. There is no search on the page; the browser's find works because doors use `hidden=until-found`.

### 3.4 States

| State | What the page shows |
|---|---|
| Loading | Header skeleton, three timeline skeleton rows |
| Error | "Could not load this deal. Retry." with the back link |
| No access | Full page: "Deals are worked by account executives. At Meridian that is Elena Vasquez; Daniel Okafor (RevOps admin) can grant access." Names come from the business's seats |
| Deal not found | "This deal was deleted or moved. Back to Deals." |
| No activity | Composer with "No activity yet. Log the first call or note." |
| No contacts | "No contacts on this deal yet. Add the people you are talking to." |
| No next step | The field reads "No next step" in the warning colour |
| Closed or archived | Ribbon "Won on 12 Sep 2026" or "Archived as lost on 11 Sep 2026 · Price"; fields read-only; Reopen |
| Sync error | Ribbon "Not synced to Salesforce since Tuesday: field mapping error. Sync history ›" |

### 3.5 Keyboard and shortcuts

Tab order: back link, title, header fields in reading order, actions, composer, timeline items, side cards, doors. Every door is a button inside a heading with `aria-expanded`. Shortcuts: S stage, C call, E email, M meeting, N note, T task, W won, Shift+W mark lost and archive, G then H history, [ and ] previous and next deal in board order, Esc back to the board, ⌘K palette. The palette lists every action with its shortcut. Focus moves into a drawer when it opens and returns on close.

### 3.6 Accessibility

All editors are real inputs with labels. Stage stepper is a radiogroup. Status ribbon is a live region. Colour never carries meaning alone: "No next step" also has text. Reduced motion swaps the 180 ms reveal for a crossfade. Contrast meets AA in both themes.

### 3.7 Phone width

One column. Order: back and title; stage as a horizontally scrolling stepper; amount, close date, next step, owner in a two-column grid; a sticky bottom bar with Log activity and Move stage; agent proposal if any; contacts (three shown, "All 5 contacts" expands in place); timeline; tasks; company; the doors. Nothing gains a level. Drawers become full-height sheets.

### 3.8 By role and business

| | Meridian | Fathom | Halyard | Ridgeline |
|---|---|---|---|---|
| Who opens it | AE, CS, admin | Founder (admin) | Ops lead (admin) | AE, CS, admin |
| Pipelines | 2, shown | 1, field removed | 1, field removed | 2, shown |
| Currency | 3, shown with amount | removed | removed | removed |
| Custom fields | Door, 6 fields | Door removed | In the header grid (3 fields) | In the header grid for AE and CS (4 fields); door for admin |
| CRM sync line | Salesforce, shown | removed | Client CRM, shown; sync history open by default | HubSpot, shown |
| Signals | Door | Card (agent research) | Door | Card (product usage) for AE and CS |
| History | Door | Door | Open by default | Door |
| Other deals at the company | Door | Door | Door | Card for AE and CS |
| Agent proposal | Card when pending | Card when pending; Ask research agent visible | Card when pending | Card when pending |

Role differences at one business come from the usage model only. The admin at Meridian sees Owner and History at level one; the AE sees Log call and Tasks at level one. Same page, no mode.

## 4. Usage items

68 items in 9 areas. Code: `src/ollopa/usage/deal.ts`. Numbers are share of active users in the role touching the item in a typical week. "Touch" means reading to decide or editing. Baseline is Meridian; overrides where the business changes the number. Decision-critical items are marked ★ and always level one.

| Item | AE | CS | Admin | Overrides |
|---|---|---|---|---|
| **Header fields** | | | | |
| Stage | 95 | 60 | 40 | Fathom admin 80 · Halyard admin 70 · Ridgeline CS 80 |
| Amount | 70 | 45 | 35 | Fathom admin 60 · Halyard admin 30 |
| Close date | 75 | 60 | 35 | Fathom admin 55 · Halyard admin 25 · Ridgeline CS 80 |
| Next step and its date | 85 | 55 | 30 | Fathom admin 70 · Halyard admin 60 |
| Owner | 15 | 10 | 30 | Fathom admin 10 · Halyard admin 45 |
| Probability | 15 | 10 | 18 | Fathom admin 6 · Halyard admin 4 |
| Forecast category | 25 | 20 | 35 | Fathom admin 6 · Halyard admin 4 · Ridgeline CS 30 |
| Last activity | 40 | 35 | 40 | Halyard admin 50 |
| Created date and age | 10 | 6 | 15 | |
| Rename deal | 5 | 3 | 3 | |
| Currency | 6 | 2 | 3 | 0 everywhere but Meridian |
| Pipeline | 4 | 4 | 6 | Fathom, Halyard 0 · Ridgeline AE 6, CS 8, admin 8 |
| **Closing** | | | | |
| Mark won | 45 | 35 | 15 | Fathom admin 30 · Halyard admin 20 |
| Mark lost and archive, with a reason | 35 | 25 | 15 | Fathom admin 25 · Halyard admin 25 |
| Reopen a closed deal | 3 | 5 | 3 | |
| Delete deal ★ | 1 | 0.5 | 3 | |
| **Activity timeline** | | | | |
| Activity timeline | 95 | 75 | 60 | Fathom admin 80 · Halyard admin 70 |
| Log a call | 70 | 35 | 12 | Fathom admin 55 · Halyard admin 5 · Ridgeline AE 50 |
| Email a contact from the deal | 40 | 40 | 10 | Fathom admin 45 · Halyard admin 8 |
| Log a meeting | 15 | 12 | 8 | Fathom admin 20 |
| Add a note | 60 | 55 | 25 | Fathom admin 50 · Halyard admin 55 |
| Filter the timeline by kind | 30 | 20 | 25 | |
| Show the full email | 25 | 20 | 10 | |
| Pin a note to the top | 8 | 10 | 3 | |
| Edit or delete a note | 8 | 6 | 3 | |
| Load older activity | 20 | 15 | 15 | |
| **Tasks** | | | | |
| Open tasks on this deal | 45 | 40 | 15 | Fathom admin 40 · Halyard admin 30 |
| Create a task | 45 | 35 | 10 | Fathom admin 35 · Halyard admin 25 |
| Mark a task done | 20 | 20 | 5 | |
| **Contacts and company** | | | | |
| Contacts on the deal, with roles | 70 | 55 | 35 | Fathom admin 60 · Halyard admin 45 |
| Add a contact | 18 | 12 | 10 | Fathom admin 20 |
| Set a contact's role | 15 | 8 | 5 | |
| Remove a contact | 4 | 2 | 2 | |
| Company summary | 50 | 60 | 30 | Fathom admin 45 · Halyard admin 35 |
| Other deals at this company | 12 | 30 | 10 | Ridgeline AE 30, CS 45 |
| Company signals and news | 15 | 10 | 5 | Fathom admin 30 · Ridgeline AE 45, CS 50 |
| Enrich company and contacts (credits) | 6 | 3 | 8 | Fathom admin 20 |
| **Details** | | | | |
| Custom fields | 12 | 10 | 15 | Fathom admin 0 · Halyard admin 65 · Ridgeline AE 40, CS 45, admin 20 |
| All fields | 6 | 4 | 12 | Fathom admin 4 |
| History of stage and field changes | 12 | 8 | 25 | Halyard admin 25 · Fathom admin 6 |
| Files | 12 | 15 | 5 | Halyard admin 3 · Fathom admin 8 |
| Upload a file | 8 | 10 | 3 | |
| Delete a file | 1 | 1 | 1 | |
| **Sync and agents** | | | | |
| CRM sync status and link | 20 | 10 | 35 | Fathom admin 0 · Halyard admin 55 · Ridgeline AE 15, CS 10, admin 25 |
| Sync history and errors for this deal | 4 | 2 | 15 | Fathom admin 0 · Halyard admin 20 |
| Pending agent proposal | 20 | 10 | 10 | Fathom admin 40 · Ridgeline AE 25, CS 15 |
| Ask the research agent (credits) | 10 | 5 | 5 | Fathom admin 35 |
| **All fields (the tail)** | | | | |
| Deal type | 4 | 4 | 6 | Ridgeline CS 8 |
| Lead source | 3 | 1 | 8 | |
| Campaign attribution | 2 | 1 | 6 | |
| Competitor | 8 | 3 | 4 | |
| Contract term | 8 | 12 | 4 | Ridgeline CS 18 |
| Payment terms | 4 | 3 | 3 | |
| Discount | 6 | 4 | 4 | |
| Proposal link | 8 | 3 | 1 | |
| Signature status | 6 | 4 | 2 | |
| Split owners | 3 | 2 | 4 | Fathom admin 0 |
| Tags | 4 | 4 | 4 | |
| Priority flag | 5 | 5 | 3 | |
| Weighted amount | 3 | 1 | 6 | |
| Line items | 4 | 6 | 2 | Ridgeline CS 12, AE 8 |
| CRM record id | 1 | 1 | 4 | Fathom admin 0 |
| **Accelerators** | | | | |
| Keyboard shortcuts and command palette | 18 | 8 | 6 | Fathom admin 10 |
| Expand all sections and print | 3 | 3 | 5 | |
| Copy link to deal | 8 | 6 | 5 | Halyard admin 15 |
| Follow deal for notifications | 5 | 8 | 10 | |
| Duplicate deal | 2 | 3 | 1 | |
| Export this deal | 2 | 1 | 4 | |

### 4.1 Shape check

Computed with `shape()` from `usage/model.ts`.

| Pair | Head | Body | Tail | Reading |
|---|---|---|---|---|
| Meridian, admin | 21% | 47% | 32% | Fits the shape. A weekly visitor |
| Meridian, CS | 29% | 35% | 35% | Slightly head-heavy; CS works renewals here weekly |
| Meridian, AE | 32% | 41% | 26% | Head-heavy by a third. The AE is the resident role; the page is dense on purpose (PRODUCT.md: "the SDR and the AE are the density argument"). Every head item is one the AE touches on most deals most days |
| Halyard, admin | 28% | 34% | 38% | Head-heavy because hand-off fields, history and sync are promoted |
| Ridgeline, CS | 32% | 35% | 32% | Signals, related deals and plan fields promoted |

Two decisions do not follow the number alone. Probability stays with stage although it is at 15: it is set by the stage and never crosses a door from it (rule 5). Delete stays visible at 1: it is destructive (rule 7).

## 5. Before: the common version

Modelled on Apollo's deal profile page, with the contact and account profile pages where the deal article is thin, from Apollo's knowledge base as fetched on 13 September 2026. Reviews are named where a quote is used; anything not confirmed by a first-party source is marked unverified.

### 5.1 Layout

Deals open from a table or kanban board reached under *Win deals › Deals*. Clicking a deal opens a profile page in two halves ([Access and Manage Deals](https://knowledge.apollo.io/hc/en-us/articles/27945345029645)):

- **Left panel**, stacked widgets: "general deal information, account record details, contacts, tasks, and notes". On the contact and account pages the same panel has a *Record details* widget with "See all fields" and "a gear icon to customize widget visibility" ([View and Edit Contacts](https://knowledge.apollo.io/hc/en-us/articles/5995459280525), [View and Edit Accounts](https://knowledge.apollo.io/hc/en-us/articles/5995865049229)).
- **Right side**, tabs: on the deal, *Activities*, *Files*, *Notes*. On the contact page seven tabs: *Prospect, Activities, Sequences, Conversations, Enrichment, All Fields, Files*. On the account page nine, adding *People* and *Locations*.
- **Actions**: *Email all contacts*, *Create task*, *Create note*, and *… › Delete deal*.
- **Fields**: creating a deal requires name, pipeline and stage; the admin may make more fields required and reorders the form from *Deals › Create deal › Customize deal form* ([Create a Deal](https://knowledge.apollo.io/hc/en-us/articles/4415062486669), [Set Up Deals](https://knowledge.apollo.io/hc/en-us/articles/40691781463437)). Custom deal fields are created in *Settings › Data management › Objects, fields, stages › Deal fields & stages › Fields* and "display across Apollo, including when you view All Fields for a deal" ([Create Custom Deal Fields](https://knowledge.apollo.io/hc/en-us/articles/41033810169357)).
- **Stage semantics**: probability and forecast category are set per stage in Settings, three levels down from the deal (*Settings › Objects, fields, stages › Deal fields & stages › Pipelines*). Whether the deal page itself shows probability or forecast category is unverified.
- **Editing**: on the contact page, "hovering over an editable field like phone number and clicking Edit" updates it; on the deal page the mechanism is unverified.
- **Access**: "by default, only Apollo admins can access or edit deals"; a non-admin who cannot see deals is told to "contact your Apollo admin" (Set Up Deals; Access and Manage Deals).

Depth from the sign-in: nav › Deals › deal › tab › field, and for a custom field: nav › Deals › deal › All Fields tab › field group › field. Five interactions to the field the admin created because the team tracks it.

### 5.2 Documented problems

| Problem | Rule broken | Source |
|---|---|---|
| Custom fields, made because the team tracks them, land on an *All Fields* tab, not on the record. What the team needs weekly is two clicks away | 1 | Create Custom Deal Fields |
| Activities sit on a tab beside the fields. To decide the next step you read the timeline on one tab and edit the field on the panel; comparison across a boundary | 5 | Access and Manage Deals; NN/g on tab switching |
| Notes are both a left widget and a right tab. Two doors to the same content | 4 | Access and Manage Deals |
| Probability and forecast category live in Settings, three levels from the stage they belong to | 2, 5 | Set Up Deals |
| The deal form is customised under *Create deal*, custom fields under Settings: one object configured in two places | 5 | Set Up Deals; Create Custom Deal Fields |
| Hover-then-Edit on a record field: no touch, no keyboard, fails WCAG 1.4.13 | 4 | View and Edit Contacts |
| A gear icon lets each user hide widgets, so the default split is left to each user to repair | 6 | View and Edit Contacts. The line usually quoted here — Spool's "fewer than 5% ever changed a setting" — is a 2011 anecdote about consumer Word, and no post-2018 settings-usage benchmark exists ([11 What changed](../knowledge-base/11-what-changed-2018-2026.md)), so the argument rests on rule 6 itself: a default nobody chose is not fixed by a control nobody finds |
| Delete sits in a "…" menu with no consequence shown until clicked | 7 | Access and Manage Deals |
| Enrichment on a record spends credits; the credit cost on the *Enrichment* tab is unverified, and users report surprise spend: "watch the credit system closely or you'll get surprised at the end of the month" | 7 | View and Edit Contacts; Reddit via Cleverly (secondary) |
| Non-admins get no deals by default and no explanation in the product beyond "contact your Apollo admin" | product rule: role gaps explain themselves | Set Up Deals |
| Seven to nine tabs on a record; "too many clicks to reach data, many navigation buttons seem to be not in the logical place" | 2 | Hassnaa, Trustpilot, 4 Sep 2026 |
| "The CRM features are basic. It is a mile wide and an inch deep in some areas" | scope, not disclosure | SyncGTM review round-up (secondary) |

Nothing in the 2025 or 2026 release notes changes the deal page structure; the only deal-page entries are *Email all contacts* (Sep 2025) and CSV export (Dec 2025) ([Release Notes 2025](https://knowledge.apollo.io/hc/en-us/articles/34072157047309), [Release Notes 2026](https://knowledge.apollo.io/hc/en-us/articles/43226752968077)).

## 6. After: the disclosed version

### 6.1 Layout

```
← Deals   Northwind Analytics · Platform            Synced to Salesforce 4 min ago · Open in Salesforce
          Northwind Analytics ›

Qualified ─ Discovery ─ [Proposal] ─ Negotiation ─ Closed won        50% · Best case
Amount $48,000 USD   Close 20 Oct 2026   Next step: Security review call · 17 Sep   Owner Elena Vasquez   Last activity 2 days ago

[Log activity]  [Mark won]  [Mark lost and archive]                         Delete deal · removes 14 activities   …

┌─ Timeline ───────────────────────────────────┐  ┌─ Side panel ─────────────────────────────┐
│ Call · Email · Meeting · Note                 │  │ Research agent proposes next step:        │
│ All · Emails · Calls · Meetings · Notes · Chg │  │ "Send security questionnaire" Approve Dismiss │
│ Today                                         │  │ Contacts on the deal (3)   Add            │
│  ✉ Elena → Amara Okonkwo  Re: pricing  ⌄ full │  │  Amara Okonkwo · Champion · 2 d  Email Call│
│  ☎ Call with Ben Fischer · 22 min · Positive  │  │ Open tasks (2)             Create         │
│ Yesterday                                     │  │ Northwind Analytics · Software · 800 ·    │
│  ⇢ Stage Discovery → Proposal · Elena         │  │   Active opportunity · owner Marcus       │
│  …                                            │  │ ⌄ Custom fields (6)                       │
│ Load older                                    │  │ ⌄ History (12 changes)                    │
└───────────────────────────────────────────────┘  │ ⌄ Files (2)                               │
                                                   │ ⌄ Company signals and news                │
                                                   │ ⌄ All fields                              │
                                                   │ ⌄ Sync history                            │
                                                   └───────────────────────────────────────────┘
```

Two levels. The page is level one. Each door is level two. No door contains a door: the "Show full email" door on a timeline item is a sibling of the side-panel doors, not a child.

### 6.2 Level one and level two by role and business

| Item | Meridian AE | Meridian admin | Meridian CS | Fathom admin | Halyard admin | Ridgeline AE | Ridgeline CS |
|---|---|---|---|---|---|---|---|
| Stage group, amount, close date, next step, last activity | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| Owner | 2 (in All fields) | 1 | 2 | 2 | 1 | 2 | 2 |
| Forecast category | 1 | 1 | 1 | with stage | with stage | 1 | 1 |
| Mark won; Mark lost and archive | 1 | 2 (… menu) | 1 | 1 | 1 | 1 | 1 |
| Delete ★ | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| Timeline, note, filter | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| Log call, email | 1 | 2 (composer "More") | 1 | 1 | 2 | 1 | 1 |
| Tasks card | 1 | 2 (door) | 1 | 1 | 1 | 1 | 1 |
| Contacts, company | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| Custom fields | 2 | 2 | 2 | removed | 1 (header grid) | 1 (header grid) | 1 (header grid) |
| History | 2 | 1 (open) | 2 | 2 | 1 (open) | 2 | 2 |
| Signals | 2 | 2 | 2 | 1 (card) | 2 | 1 (card) | 1 (card) |
| Other deals at company | 2 | 2 | 1 (card) | 2 | 2 | 1 (card) | 1 (card) |
| Sync status line | 1 | 1 | 2 | removed | 1 | 2 | 2 |
| Sync history | 2 | 2 | 2 | removed | 1 (open) | 2 | 2 |
| Agent proposal | 1 when pending | 2 | 2 | 1 when pending | 2 | 1 when pending | 2 |
| Files, All fields, Enrich, Ask agent | 2 | 2 | 2 | 2 (Enrich and Ask agent 1) | 2 | 2 | 2 |

"Owner 2" for the AE means the field is in the All fields door, not the header. When a role is at level 2 for Mark won, the action moves to the "…" menu with text; it is never removed, because an admin does close deals.

### 6.3 Doors

| Door label | Count shown | Container | Content | Why a door |
|---|---|---|---|---|
| Custom fields (6) | number of fields | In place, side panel | The business's custom fields, grouped as the admin grouped them; inline editors | 12–15% at Meridian |
| History (12 changes) | number of changes | In place, side panel | Stage and field changes with who and when; "Stages are set in Settings › Pipelines by Daniel Okafor" as its last line | 12% AE; admins audit |
| Files (2) | number | In place, side panel | List with upload target; delete per file | 12% |
| Open tasks (2) | number of open tasks | In place, side panel | The tasks card's rows and Create; a card, not a door, wherever the role is at 20 or above | 15% for the Meridian admin |
| Company signals and news | none | Drawer | Signals, news, hiring; "Enrich · 2 credits" button; last enriched date; "Research this company · 12 credits" | Heavy content; keeps deal context |
| All fields | none | In place, side panel | Every remaining field with editors: owner (AE), deal type, source, campaign, competitor, contract term, payment terms, discount, proposal link, signature status, split owners, tags, priority, weighted amount, line items, CRM id, created | The tail |
| Sync history | none | In place, side panel | Last ten syncs; errors with the field that failed; link to Settings › Integrations for the admin, the admin's name for others. Holds the sync status line too for roles where that line is level two | 4% AE |
| Show full email | none | In place, on the item | The whole message | Two lines answer most reads |
| All 5 contacts (phone only) | number | In place | Remaining contacts | Screen height |

Removed rather than hidden: currency where one currency; pipeline where one pipeline; the custom-fields door where none exist; the sync line and sync history where no CRM; split owners at Fathom.

### 6.4 Persistence

Each door remembers open or closed per user, across deals, in local storage under `ollopa.deal.doors.<role>`. The timeline filter persists the same way. "Expand all" and "Collapse all" sit at the top of the side panel; print CSS expands every door and the full emails. Door contents use `hidden=until-found` so browser find reaches them.

### 6.5 Accelerators

Shortcuts as listed in 3.5. The palette (⌘K) lists each action with its shortcut every time. [ and ] walk the board order without going back. A resident who keeps History open never sees a door there again. The board row for a deal shows stage, amount, close and next step, so an AE who only needs those never opens the record.

### 6.6 Decision-critical items

Visible without a click: the delete button with its consequence sentence next to it; the credit cost on Enrich and on Ask the research agent; the consequence sentence on Mark won and on Mark lost and archive before confirming; the sync error ribbon; what approving an agent proposal will do (send an email, spend credits, move the stage) on the proposal card. The path to reopen a closed or archived deal is one click, the same as closing it.

Who approves, and how often. The deal's owner approves their own agent's actions and the admin may approve for anyone (the policy is one item in Settings, not a rule invented per page). Research, scoring and drafts that are saved rather than sent are logged, never queued. Only irreversible or costly actions wait for a person: sending an email, spending above the credit cap, changing the stage. A second, admin approval is required above a threshold that is a setting. The proposal card waits for the next visit to the deal instead of interrupting, because a suggestion arriving at a task boundary is taken and the same suggestion mid-task is dismissed (52% engagement post-commit against 62% dismissal mid-edit, Kuo et al. 2026). And the queue is kept short on purpose: shown a problematic agent action and asked to approve it, people saw it 88.5% of the time and stopped it 23.9% (Chen et al., N=48), so disclosure past a reviewer's capacity is the same as hiding it.

### 6.7 What was removed

The *Customize deal form* screen (fields are configured in one place, Settings › Pipeline and data); the widget-visibility gear; the *Notes* tab (notes are timeline items); the *Activities* tab (the timeline is the page); *Email all contacts* as a separate button (the composer's Email picks recipients from the deal's contacts); *Locations* on a deal; probability as a free-standing field (it is the stage's number unless overridden, and lives under the stepper).

### 6.8 The record template, and the quick look

The deal page is the first use of `RecordPage`, the second shared template after `TablePage`. The contact page, the company page, the account page and the detail views in Settings (a user, a mailbox, an integration) reuse it. The template decides structure; the usage model decides what sits at level one.

**A record is disclosed in two levels, and often should be.** This is the pattern named in RULES.md, and this spec is where it is defined for every record in the product.

- **The quick look** is level one: a flat drawer opened from a table row, keeping the table in view. It shows the few fields a glance needs, in the same order and with the same labels as the top of the full record. Nothing collapses inside it. It is read-only except for the one field the glance exists for — a deal's stage on the board, an account's next step on the accounts table. It serves scanning tasks, where a person moves through many rows and needs a glance at each.
- **The record page** is level two: everything about the object, from this template. Header, key fields, related lists as scrolling sections (people at a company, deals, activity), and doors only for long content that is rarely needed alongside the rest — full history, enrichment data, custom fields, files. At most one tab, for a related table big enough to be a page of its own, with a count in its label; sections otherwise, because tabs hide what a person may need to see side by side. It serves dwelling tasks, where a person has chosen the object and is working on it.
- **The test.** Remove the drawer and you lose only speed. If removing it would lose a feature, it has become a second version of the record, and that is against the rules.
- **The count.** Table to drawer is one level, table to page is one level, page to a door or a tab is a second. Nothing reaches three, because the drawer has no doors and a tab has none.

The deal uses both: the board's card opens a quick look with stage editable in place (the one field the glance exists for), and the card title opens this page. The account page in [11 Accounts](11-accounts.md) is the same arrangement on a table instead of a board.

```
RecordPage<T> {
  back: { label, href }                       // "← Deals"
  title: { value, onRename? }                 // editable when onRename is given
  subtitle?: { label, href }                  // parent object: the company
  ribbon?: { tone, text, action? }            // object state only: closed, archived, sync error, deactivated
  fields: Field[]                             // the header grid
  actions: { primary: Action[]; secondary: Action[]; destructive?: { label, consequence, onConfirm } }
  main: { kind: "timeline", items, composer, filters } | { kind: "sections", sections }
  side: Card[]                                // contacts, tasks, company; or status cards in Settings
  doors: Door[]                               // side-panel doors, in this order
  tab?: { label, count, table }               // at most one, for a related table big enough to be its own page
  quickLook: { fields: FieldKey[]; editable?: FieldKey }   // the drawer: the top of this page, cut short
  shortcuts: Shortcut[]                       // shown in the palette
  noAccess?: { message, who: Seat[] }         // names who can
}

Field { key, label, value, editor: "text" | "number" | "money" | "date" | "select" | "user" | "stepper" | "readonly",
        group?: string, dependsOn?: key[], level?: 1 | 2 }   // level comes from usage unless dependsOn forces 1
Door  { id, label, count?, container: "inline" | "drawer", content, openByDefault?: boolean }
Card  { title, count?, action?, rows, rowActions }
```

Rules the template enforces, so every record page inherits them:

1. Fields with `level 2` render inside the *All fields* door. A field with `dependsOn` renders beside its parent whatever its level.
2. A `Door` with no content is not rendered. A `Door` whose `openByDefault` is true for the signed-in role and business renders open, with its chevron, so it can still be closed.
3. The destructive action renders as text with its consequence beside it, last in the actions row, never inside a menu.
4. Every door is a `button` inside a heading with `aria-expanded` and `aria-controls`; chevron plus label plus count.
5. Door state and filter state persist per user. Expand all, collapse all and print behaviour are built in.
6. Row actions in cards are visible on hover and focus and repeated in each row's "…" menu.
7. On phone: header, then the sticky action bar, then side cards, then main, then doors. Drawers become sheets. No item changes level.
8. No usage numbers, sources or teaching text render anywhere.
9. `quickLook` renders as a flat drawer: the named fields in the order they appear in `fields`, with the same labels, no doors, no collapsing sections, and at most one editable field. A quick look that needs a door is a record page.
10. `tab` is optional and there is never more than one. Related lists are sections in `main`, not tabs.

How the other pages fill it:

| Page | Header fields (level one at Meridian, primary role) | Main | Side cards | Doors | Quick look |
|---|---|---|---|---|---|
| Deal | Stage, amount, close date, next step, owner, last activity | Timeline | Contacts, tasks, company | Custom fields, History, Files, Signals (drawer), All fields, Sync history | Stage, amount, close date, next step; stage editable |
| Contact | Name, title, company, email with status, phone, stage, owner, in sequence | Timeline | Company, open deals, tasks | Sequences (2), Custom fields, History, Enrichment (drawer), Files, All fields | Name, title, company, email with status, phone; email status read-only, stage editable |
| Company | Name, domain, industry, employees, stage, owner, open deals count | Sections: contacts, open deals, activity | Contacts (top 5), open deals, signals | Custom fields, Locations, History, Enrichment (drawer), Files, All fields; one tab, "People (48)", where the list is big enough to be its own page | Name, domain, industry, employees, stage, owner |
| Account | Health with band, renewal and days left, contract value, open risks, last touch, next step | Sections: health drivers, renewal terms, risks, signals, hand-off, touches, usage, seats, contacts, deals | Renewal, champion, CRM sync | History, Files, All fields, Enrichment (drawer) | Health, renewal and days left, value, open risks, next step; next step editable |
| Settings › user | Name, email, role, permission profile, credit limit, status | Sections: access, mailboxes, activity | Credit usage this month, last sign-in | Teams, Territories, Sessions, Audit log | Name, email, role, status |
| Settings › mailbox | Address, owner, warm-up status, daily limit and sent today, deliverability score | Sections: limits, signature | Bounce guard state ★ (warn 4%, pause 6%, with the observed rate) | Warm-up settings, Tracking, Forwarding, History | Address, owner, warm-up status, sent today |

### 6.9 The nine-point score

| # | Question | Score | Line |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | Delete with consequence, credit costs, close consequences, sync error, agent consequence all on the page |
| 2 | Every visible item backed by a usage number with a source | 2 | 68 items in `deal.ts`, USAGE-MODEL.md shape, the two exceptions explained by rules 5 and 7 |
| 3 | No path exceeds two levels on any screen size | 2 | Page and one door; phone reorders but never nests |
| 4 | Every door labelled by content with chevron and text | 2 | Counts on Custom fields, History, Files; no "More" or "Advanced" |
| 5 | Every door next to what it reveals; keyboard and touch | 2 | Doors in the side panel next to the cards they extend; buttons with `aria-expanded` |
| 6 | No dependent information split across a door | 2 | Stage, probability and forecast in one group; next step with its date; amount with currency |
| 7 | Door state persists; expand-all and print exist | 2 | Per user across deals; expand all, collapse all, print CSS |
| 8 | Disclosure driven by user action or object state | 2 | Agent proposal and ribbons by object state; nothing reorders by history |
| 9 | Door usage instrumented and a scheduled review | 1 | Door opens are logged to the console event bus in the demo; the semi-annual promote, keep or delete review is written into this spec but no analytics exist |

Total: 17 of 18.

## 7. Lesson steps

Lesson 3 starts from the common version and applies one rule per step. Each step names what moves and the evidence.

**Step 0 · The common version.** A deal profile with a left panel of widgets, a right strip of tabs (Activities, Files, Notes), *See all fields*, a gear to hide widgets, hover-to-edit, delete in a "…" menu, custom fields on an *All Fields* tab, stage semantics in Settings three levels away. Sources in section 5.

**Step 1 · Rule 1, hide the rare, never the necessary.** Move stage, amount, close date, next step and last activity into a header grid; make the timeline the page; put Contacts and Tasks beside it. At Halyard, move Hand-off status, Meeting date and Client feedback into the header grid too; at Ridgeline, Plan tier, Seats, Renewal type and Usage score. Evidence: the usage table, section 4; Nielsen 2006 "disclose everything that users frequently need up front"; Create Custom Deal Fields puts the fields the team tracks on a tab. What moves: seven fields up one level; the *Activities* tab dissolves into the page.

**Step 2 · Rule 2, stop at two levels.** Delete the tab strip. Every former tab becomes a side-panel door or a timeline filter. *All Fields › field group › field* becomes *All fields › field*. Evidence: Nielsen 2006 on designs beyond two levels; Landauer and Nachbar 1985, breadth beats depth; Hassnaa's Trustpilot review, "too many clicks to reach data". What moves: three tabs and one nested tab level become six doors, each one click from the page.

**Step 3 · Rule 3, split by task frequency, not user skill.** Remove the widget-visibility gear and the idea of a per-user layout. The admin and the AE see the same page; what differs is which items are level one, decided by the usage model per role and business. Evidence: Findlater and McGrenere 2004, users prefer stable layouts; Home Assistant 2026 deleted its Advanced and Expert labels because "they implicitly tell users that certain features are not for them". The figure often quoted here, Spool's "fewer than 5% ever changed a setting", is a 2011 anecdote about consumer Word and there is no post-2018 replacement, so it is not the argument: the argument is that a per-user layout hands the design problem to the user. What moves: nothing on screen; the gear goes, and the split is now a table in `deal.ts` rather than 42 private configurations.

**Step 4 · Rule 4, make the door obvious and honest.** Label every door by content with a count: *Custom fields (6)*, *History (12 changes)*, *Files (2)*. Replace hover-to-edit with click or Enter on the field, an editor in place, and a visible pencil on focus. Remove currency, pipeline, custom fields and sync where a business has none of them. Evidence: NN/g 2014, 0% click-through on an unlabelled icon; Microsoft Windows UX Guide, remove controls that do not apply; WCAG 1.4.13 on hover-only content. What moves: seven door labels, one editing mechanism, four removals per business profile.

**Step 5 · Rule 5, keep context across the boundary.** Put probability and forecast category directly under the stage stepper and change all three together. Put the next step's date on the next step. Put the contacts beside the timeline, not on another tab. Expand doors in place; use a drawer only for signals and enrichment, which need room but must keep the deal in view. Doors remember whether you left them open. Evidence: Microsoft Fluent 2, never split information that must be referenced together; Cowan 2001, about four chunks; Microsoft Windows UX Guide on persisting expand state. What moves: probability and forecast out of Settings and onto the stage; contacts out of the tab strip and beside the timeline.

**Step 6 · Rule 6, stable, user-controlled disclosure.** Nothing on the page reorders itself. The agent proposal card appears because a proposal exists, and disappears when it is approved or dismissed. Ridgeline's product-signals card is there because the business profile says so at sign-in, not because someone opened the door last week. Evidence: Jensen Harris on Office 2000's inferred menus, and the two modern re-tests that re-based the argument — Todi et al. (CHI 2021, 18 participants, 6,480 trials: static 2283 ms against frequency reordering 2298 ms, and 15% slower outside the promoted head) and Gaspar-Figueiredo et al. (JSS 2025, n=40, no significant difference either way). Spatial adaptation loses at any accuracy, so the old "about 70% accuracy" threshold (Gajos et al. 2008, never replicated) is no longer the reason. What moves: the agent proposal from a notification bell to a card driven by object state.

**Step 7 · Rule 7, decision-critical information is never behind a door.** Take Delete out of the "…" menu and put it in the actions row with "removes 14 activities" beside it. Put the credit cost on Enrich and on Ask the research agent. Show what Mark won and Mark lost do before confirming. Show the sync error as a ribbon. Say on the proposal card that approving sends an email. Evidence: Nielsen 2026, never hide consequences; Nouwens et al. 2020 on second-page choices; Trustpilot and Cleverly on surprise credit spend. What moves: one button up a level, four consequence sentences and two prices onto the page.

**Step 8 · Rule 8, fade the scaffold; give experts accelerators.** Add S, C, E, M, N, T, W and Shift+W; [ and ] to walk the board; ⌘K with every shortcut shown; expand all and print; doors that stay open once opened. Log each door open, and every six months promote what everyone opens, keep what some open, delete what nobody opens. Evidence: NN/g heuristic 7; Cockburn et al. 2014 on users failing to adopt faster methods unless pulled; McGrenere and Moore 2000, tuck away 45% versus remove 24.5%. The palette's inline hint is the floor, not the teacher: 749 tooltip exposures produced two shortcut activations and tooltips explain 1% of shortcut discovery, while a period of full exposure took usage from 9.79% to 86.20%, holding at 73.09% after it ended (IHM 2025, in [11 What changed](../knowledge-base/11-what-changed-2018-2026.md)). What moves: nothing visible for a first-time user; everything for the resident.

**Close.** Score the page with the nine questions. Show Meridian AE, Meridian admin, Halyard admin and Ridgeline CS side by side: the same template, four different level-one sets, no mode switch.

## 8. Review

| Check | Result | Gap found and how it was closed |
|---|---|---|
| All roles covered | Yes | SDR and marketer had no row at first; added the no-access state naming the AE and admin seats for the business |
| All four businesses covered | Yes | Halyard needed a reason to be on a deal page at all; the hand-off model (booked meeting handed to a client CRM) gives it one and drives its overrides |
| Every field has a source | Yes | Forecast category, currency, pipeline, custom fields, contacts, activities, files and the tail were not in the seed; section 2 lists each addition |
| Every action has an outcome | Yes | Duplicate, export, follow and copy link had none; each now shows a toast naming what happened |
| Empty, error and no-access states | Yes | Added not-found and closed states, which the brief's list does not name but a record needs |
| Keyboard | Yes | Shift+W for lost replaced an earlier X, which collides with common cut bindings |
| Phone width | Yes | The "All 5 contacts" in-place door is phone-only; added to the doors table so it is not a hidden extra level |
| Decision-critical visible | Yes | Agent approval consequence was missing; added to the proposal card |
| Two levels maximum | Yes | *All fields › field group* was a nested level; groups are headings inside one door, not doors. The quick-look drawer is flat and adds no level of its own |
| Five stages | Yes | An earlier draft added "Closed lost" as a sixth stage with a lost reason. Closed: five stages defined here, and losing a deal means archiving it with a reason; the board, Reports and Settings read this list |
| The quick look | Yes | The pattern was only implied. Section 6.8 now states it for every record in the product: flat drawer, sections not tabs, at most one tab, same fields in the same order as the top of the page |
| Doors labelled by content | Yes | "Details" was an early label; replaced by six content labels |
| Dependent fields together | Yes | Probability at 15% would have gone behind a door by number; rule 5 keeps it with stage, stated in 4.1 |
| State persists | Yes | Per user across deals, not per deal, so a resident's preference holds |
| Accelerators present | Yes | Section 6.5 |
| Usage shape checked | Yes | Five pairs in 4.1; the AE's head-heavy shape is explained, not hidden |
| Nothing hover-only | Yes | Hover-to-edit replaced; card row actions appear on focus and in a menu |
| Role gaps explain themselves | Yes | Stage editing and field management name the admin seat inside the History and Custom fields doors; no-access page names seats |
| No usage numbers or teaching text in the product | Yes | Counts on doors are object counts, not usage; nothing from section 4 renders |

Word count: about 5,600.
