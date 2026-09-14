# Accounts

*The customer success page. A "real" page built from the table template. Usage numbers live in `src/ollopa/usage/accounts.ts`; nothing from them is shown in the product.*

## 1. Purpose

Accounts is where a customer success manager (CSM) starts the day. It lists the client accounts, each with a health score, the renewal date, seats and usage, expansion signals and open risks. It also holds two queues: renewals due in the next 30, 60 and 90 days, and hand-offs arriving from account executives after a deal closes.

Who lives here: customer success, daily. Account executives visit weekly, to send a hand-off or to pick up an expansion signal. The RevOps admin visits monthly, to reassign owners and to check CRM sync. SDRs and marketers do not have the page; the page says so and names the admin.

The one thing nobody may lose sight of: **which accounts are renewing soon and are not healthy.** Everything else on the page exists to change that answer.

Ridgeline, the product-led customer, is where the page matters most. It has almost no outbound; seats, usage and signals are its pipeline. Meridian is the baseline. Fathom has no CS role, so the founder keeps the accounts herself. Halyard's ten clients are workspaces, not accounts, so the page there only holds each client's own customers, kept out of sequences.

## 2. Data

### Fields shown

| Field | Source |
|---|---|
| Account name, domain, industry, employees, contacts held, stage | `Company` in `seed.ts` (stage `Current client`; `Churned` when included) |
| Owner (CSM), account executive of record | `businesses.ts` role seats (`cs`, `ae`); at Fathom both are the founder |
| Plan, seats bought, seats active, usage last 30 days, usage change | New: `Account` (below) |
| Health score, band, change over 30 days, drivers | New: computed from `Account` by the formula below |
| Renewal date, days left, contract value per year, billing, notice period, auto-renew, forecast | New: `Account` |
| Champion, last touch, next step and date | New: `Account`; last touch defaults to `Company.lastActivity` |
| Open risks (type, opened, owner, note, resolved) | New: `AccountRisk[]` |
| Expansion signals (kind, fired, source, detail, dismissed) | New: `AccountSignal[]` |
| Hand-off (from, sent, accepted, why they bought, what was promised, checklist) | New: `Handoff` |
| Deals at the account | `Deal` in `seed.ts`, matched on company; names already include "Renewal" and "Expansion" |
| Activity timeline | `Task`, `Reply`, `Deal.lastActivity` and logged touches, matched on company |
| Agent-proposed next step | `AgentEvent` with `kind: "scored"` for the company; approval reuses `needsApproval` |
| CRM sync status | New: `Account.crmSync`; "Not connected" at Fathom, which has no CRM |

### To add to the seed

Add to `seed.ts`, deterministic from the same `rng`; `seedFor` returns `accounts` next to the existing collections and `businesses.ts` is unchanged.

- `Account { id, companyId, name, domain, stage, owner, ae, plan, seatsBought, seatsActive, usage30, usageDelta30, health, band, healthDelta30, drivers, renewal, value, billing, noticeDays, autoRenew, forecast, champion, lastTouch, nextStep, risks, signals, handoff, crmSync }`, one per company at stage `Current client` or `Churned`: about 20 at Ridgeline, 10 elsewhere.
- `AccountRisk { id, type, opened, owner, note, resolved }`; types Usage drop, Champion left, Escalation, Budget cut, Competitor, Churn notice. A third of accounts carry one open risk; one account each at Meridian and Ridgeline carries a Churn notice.
- `AccountSignal { id, kind, fired, source, detail, dismissed }`; kinds Seats over 90%, New team joined, Pricing page visits, Hiring in your buyer's team, Feature limit hit, Executive sponsor changed; sources Product, Website, Research agent, CRM. Ridgeline 0 to 3 per account, others 0 to 1.
- `Handoff { from, sent, accepted, whyTheyBought, promised, checklist }` on a quarter of Meridian and Ridgeline accounts touched in the last 21 days, `from` an AE seat; `null` at Fathom and Halyard, which have no AE.
- Renewal: today plus `(i × 23 + 9) mod 365` days for the i-th account, so every window has rows. Plans Starter 49, Growth 79, Scale 129 per seat; seats 5, 10, 25, 50 or 100; value = seats × price × 12; seats active 35% to 100% of bought; usage index 20 to 100, change −40% to +40%.
- Health = clamp(55 + usage + seats + touch + risks + signals, 0, 100): usage = change ÷ 2, capped ±20; seats = +10 at 90% utilisation, 0 from 60%, −10 below; touch = +10 within 14 days, 0 within 30, −15 after; risks = −12 each, −25 more for a churn notice; signals = +5 each, capped +10. Bands: Healthy from 70, Watch from 40, At risk below. Drivers are stored, so the drawer's breakdown always sums to the score.
- Forecast: At risk band → At risk; Healthy and renewing within 90 days → Commit; otherwise Likely; churned → Lost.

## 3. Features

### Shown

- A header strip: **Renewals due** as three counters, 30, 60 and 90 days, each with count and renewing value; **Value at risk** (renewing value on At risk accounts); **Hand-offs waiting for you**, present only when one exists and only where an AE role exists.
- The table, one row per account. Health is a number with its band as text, never colour alone, and an arrow for the 30-day change. Renewal shows the date and days left, emphasised under 30 days. Open risks shows the count and newest type; a churn notice is written out. Next step edits in place.
- Row actions on hover and keyboard focus: **Log touch**, **Add risk**, **Open**; all repeat in the row's "More actions" menu, so nothing is hover-only.
- A drawer for one account: one scrolling column with headed sections for health drivers; renewal (date, value, billing, notice period, auto-renew, forecast, Create renewal deal); risks; signals; hand-off notes; next step and touches; timeline; usage over 90 days; seats and last sign-in; contacts and champion; deals; notes; files; all fields; CRM sync. Sections collapse, remember their state, and never hide one another.

### Actions

| Where | Action | Outcome |
|---|---|---|
| Row | Log touch | Type, date, note in the drawer's touch section; last touch and health recompute; toast |
| Row | Add risk | Type, note, owner; risk count and health update; toast |
| Row | Open | Drawer opens, focus moves in; Esc returns focus to the row |
| Row menu | Create renewal or expansion deal | Deal created on Deals with the account's name and value; linked in the deals section |
| Row menu | Email the champion, Book a review meeting | Composer or calendar opens with the champion prefilled |
| Row menu | Change owner | Picker; hand-off notes travel with the account |
| Row menu | Add to campaign | Contacts added to a lifecycle campaign; Ridgeline only, the only business running them |
| Row menu | Push to CRM now | Sync status updates; errors named inline |
| Row menu | Mark churned | Confirm step says: stage becomes Churned, the row leaves the default view, sequences already exclude it; undo in the notification |
| Row menu | Remove account | Confirm step says: removed from Accounts and lists, the company stays on Companies; undo in the notification |
| Drawer | Resolve risk, Dismiss signal, Set next step, Add note, Approve or decline the agent's step | In place; health recomputes where relevant |
| Hand-off strip | Accept | You become owner, the checklist opens in the drawer, the count drops |
| Hand-off strip | Send hand-off (AE) | Pick a CSM; the account joins that CSM's queue |
| Bulk | Assign owner, Add to campaign, Export CSV | Applies to checked rows; count in the toast |
| Page | Health score model, Which signals fire | Open Settings; the link says what changes there |

### Filters, search, sorting, columns

- Search matches name, domain, champion and owner.
- The 30/60/90 counters are toggle filters; health band and owner are visible selects; "More filters" holds risk type, plan and "Include churned accounts".
- Sort by renewal (soonest, the default), health (lowest), value (highest) or last touch (oldest); headers are sortable and announce the sort.
- Default columns follow the usage model per role and business (section 6); "More columns" lists the rest with a count.

### States

- **Empty:** "No client accounts yet. An account appears here when a deal is closed won, or when a company's stage is set to Current client on Companies." At Halyard: "This workspace has no current clients. Clients of this workspace are kept out of sequences automatically once their stage is set."
- **Nothing matches:** the template's "Nothing matches. Clear the search or a filter."
- **Loading:** skeleton rows; counters show a dash.
- **Error:** "Accounts could not load. Retry." Row-level CRM errors show inline, with the error text, never a red icon alone.
- **No access:** the shell's NoAccess page: used by Customer success, Account executive, RevOps admin; ask the named admin.

### Keyboard

`/` focuses search. `j` and `k` move rows, Enter opens the drawer, Esc closes it and returns focus. `l` logs a touch, `r` adds a risk, `n` edits the next step on the focused row. `1`, `2`, `3` toggle the 30, 60 and 90-day filters. `⌘K` opens the palette, which lists every action with its shortcut.

### Accessibility

Real table semantics; `aria-sort` on headers; counters are toggle buttons with `aria-pressed`; the drawer is a dialog with focus trap and return; toasts use the shell's live region; band and severity are text plus colour; reveals animate at 200 ms with a reduced-motion crossfade; collapsed sections use `hidden=until-found` so find-in-page works.

### Phone width

Cards instead of rows: name, health, days to renewal, open risks, owner. Everything else is in the drawer, now a full-screen sheet. Counters scroll horizontally; "More actions" is always visible. Still two levels: list, then drawer.

### By role and business

- **CS:** the full page. Default filter: my accounts. Default sort: renewal.
- **AE:** the same table, default sort by expansion signals, default filter "accounts I sold". The hand-off panel shows hand-offs sent by the AE and still waiting, with a "Send hand-off" button.
- **Admin:** owner column and owner filter at level one, group by owner, bulk owner assignment, CRM sync column, links to the health model and signal rules.
- **Fathom:** no hand-off panel (no AE role; the panel is removed, not disabled). Agent-proposed next steps at level one.
- **Halyard:** no hand-off panel; the counters are usually zero; the page opens on the empty state described above.
- **Ridgeline:** seats, usage and signals columns at level one; usage chart and seat list at the top of the drawer; "Add to campaign" as a visible row action for CS.

## 4. Usage items

Weekly use is the share of active users in the role touching the item in a typical week (USAGE-MODEL.md). Baseline is Meridian. SDR and marketer have no access and carry no number. Marked items (*) are decision-critical and always level one. Full data, with notes, in `src/ollopa/usage/accounts.ts`.

| Item | CS | AE | Admin | Overrides |
|---|---|---|---|---|
| **Account list** | | | | |
| Account name and domain | 95 | 30 | 20 | Ridgeline AE 45; Fathom admin 35; Halyard admin 5 |
| Health score and band | 90 | 20 | 12 | Ridgeline AE 40, admin 20; Fathom admin 30; Halyard admin 3 |
| Health change over 30 days | 18 | 5 | 3 | Ridgeline CS 18, AE 15 |
| Renewal date and days left * | 85 | 20 | 15 | Fathom admin 30; Halyard admin 3 |
| Contract value per year * | 40 | 25 | 15 | Fathom admin 25; Halyard admin 2 |
| Seats bought and seats active | 15 | 8 | 5 | Ridgeline CS 60, AE 35, admin 10 |
| Usage, last 30 days | 18 | 6 | 4 | Ridgeline CS 85, AE 35, admin 15 |
| Owner | 12 | 10 | 25 | Fathom admin 5; Halyard admin 3 |
| Open risks * | 80 | 12 | 10 | Fathom admin 25; Halyard admin 3 |
| Expansion signals | 18 | 18 | 5 | Ridgeline CS 70, AE 65; Fathom admin 10 |
| Last touch | 60 | 8 | 5 | Fathom admin 20 |
| Next step and date | 55 | 6 | 3 | Fathom admin 20 |
| Champion | 15 | 8 | 2 | |
| Plan | 4 | 8 | 3 | Ridgeline CS 15, AE 20 |
| Renewal forecast | 15 | 5 | 6 | |
| Notice period and auto-renew | 4 | 3 | 3 | |
| Account executive of record | 4 | 4 | 2 | |
| Account stage | 4 | 4 | 6 | |
| Contacts held | 4 | 4 | 2 | |
| Industry and employees | 2 | 3 | 1 | |
| Parent account | 2 | 2 | 2 | |
| CRM sync status | 3 | 2 | 12 | Fathom admin 1; Halyard admin 2 |
| **Renewals** | | | | |
| Renewals due in 30, 60 and 90 days | 80 | 12 | 15 | Ridgeline AE 25; Fathom admin 30; Halyard admin 3 |
| Contract value at risk * | 18 | 8 | 15 | Fathom admin 15; Halyard admin 2 |
| Create renewal deal | 12 | 10 | 1 | Ridgeline CS 15, AE 25 |
| Lapsed renewals | 4 | 2 | 4 | |
| **Hand-offs** | | | | |
| Hand-offs waiting for you * | 25 | 25 | 4 | Ridgeline CS 15, AE 20; Fathom and Halyard 0 |
| Accept hand-off | 18 | 2 | 2 | Ridgeline CS 12; Fathom and Halyard 0 |
| Send hand-off to customer success | 1 | 25 | 2 | Ridgeline AE 18; Fathom and Halyard 0 |
| Why they bought and what was promised | 18 | 20 | 2 | Fathom and Halyard 0 |
| Hand-off checklist | 4 | 4 | 2 | Fathom and Halyard 0 |
| **Risks and signals** | | | | |
| Add risk (type, note, owner) | 30 | 4 | 1 | Fathom admin 10 |
| Resolve risk | 15 | 2 | 1 | Fathom admin 6 |
| Churn notice received * | 4 | 2 | 3 | |
| What fired, when, and from where | 15 | 15 | 2 | Ridgeline CS 60, AE 55 |
| Pricing and docs page visits | 4 | 8 | 1 | Ridgeline CS 18, AE 40 |
| Create expansion deal | 4 | 20 | 1 | Ridgeline CS 15, AE 50 |
| Dismiss signal | 4 | 6 | 1 | Ridgeline CS 12, AE 18 |
| Which signals fire (opens Settings) | 2 | 1 | 5 | |
| **Working an account** | | | | |
| Log a touch | 75 | 10 | 2 | Fathom admin 15 |
| Add note | 35 | 8 | 2 | Fathom admin 10 |
| Email the champion | 15 | 6 | 1 | |
| Book a review meeting | 12 | 5 | 1 | |
| Activity timeline | 18 | 12 | 4 | |
| What makes up the score | 18 | 5 | 8 | Ridgeline CS 50, AE 15 |
| Usage over 90 days | 15 | 5 | 2 | Ridgeline CS 60, AE 25 |
| Who has a seat and last sign-in | 12 | 5 | 2 | Ridgeline CS 45, AE 20 |
| Contacts at the account | 18 | 10 | 2 | |
| Deals at the account | 12 | 25 | 4 | |
| Add contacts to a lifecycle campaign | 4 | 2 | 1 | Ridgeline CS 18 |
| Agent-proposed next step | 15 | 5 | 5 | Ridgeline CS 18; Fathom admin 25 |
| Files | 4 | 2 | 1 | |
| All fields, including custom fields | 4 | 2 | 6 | |
| Change owner | 4 | 3 | 12 | Fathom admin 1; Halyard admin 2 |
| Mark churned | 3 | 1 | 2 | |
| Remove account | 1 | 0.5 | 2 | |
| Push to CRM now | 3 | 2 | 6 | Fathom admin 0; Halyard admin 1 |
| **Views and filters** | | | | |
| Search | 65 | 30 | 20 | Fathom admin 25; Halyard admin 5 |
| Filter by health band | 45 | 12 | 8 | Fathom admin 15 |
| Filter by owner | 12 | 8 | 25 | Fathom admin 2; Halyard admin 3 |
| Filter by risk type | 10 | 3 | 2 | |
| Filter by plan | 4 | 5 | 2 | Ridgeline CS 15, AE 12 |
| Include churned accounts | 3 | 2 | 3 | |
| Sort by renewal, health or value | 40 | 12 | 10 | Fathom admin 15 |
| Saved views | 4 | 3 | 4 | |
| Choose columns | 4 | 2 | 4 | |
| Group by owner | 3 | 1 | 8 | Fathom admin 0; Halyard admin 1 |
| Export CSV | 4 | 2 | 6 | Halyard admin 2 |
| Bulk assign owner | 2 | 1 | 8 | Fathom admin 0; Halyard admin 2 |
| Bulk add to campaign | 3 | 1 | 1 | Ridgeline CS 12 |
| Health score model (opens Settings) | 2 | 1 | 5 | Halyard admin 1 |

Seventy-one items. Shape check, computed from the file with `shape()`:

| Pair | Head (≥20) | Body (5–19) | Tail (<5) | Verdict |
|---|---|---|---|---|
| Meridian, CS | 15 (21%) | 24 (34%) | 32 (45%) | Fits the published shape |
| Ridgeline, CS | 21 (30%) | 25 (35%) | 25 (35%) | Head deliberately over: a product-led CS lead's whole job is this page; seats, usage and signals join the head |
| Ridgeline, AE | 19 (27%) | 22 (31%) | 30 (42%) | Fits |
| Meridian, admin | 4 (6%) | 24 (34%) | 43 (61%) | Fits; the admin rarely comes here |
| Fathom, admin | 10 (14%) | 17 (24%) | 44 (62%) | Fits; a founder checks weekly |
| Halyard, admin | 0 | 13 (18%) | 58 (82%) | The page is nearly empty for the agency, as intended |

Level one for Meridian CS is 17 items: the 15 head items plus two low-use decision-critical items (value at risk, churn notice). For Ridgeline CS it is 24.

## 5. Before: the common version

Apollo has no customer success product. What it has for existing clients is an account stage, a prospecting guard, a general account profile, signals built for prospecting, and a workflow recipe for renewals. The layout below is Apollo's where Apollo has something, and Gainsight's Customer 360 or HubSpot's company record where it has nothing; each borrowed piece says so.

**Where the client list lives.** Companies › Saved, filtered by the account stage *Current Client*, one of five defaults (Cold, Current Client, Active Opportunity, Dead Opportunity, Do Not Prospect); "Churned" is a recommended custom stage, not a default (Apollo KB, *Contact and Account Stages Overview*, 28 Aug 2026). The saved-companies page is a prospecting table: columns are added one at a time, the stage changes by double-clicking the cell or check › Edit › Set stage, and "Recommendations" sit behind a light-bulb icon (KB, *Manage Saved Records in Apollo*, 12 Aug 2026). Changing the owner is check › … › Edit › Assign owner, three levels (KB, *Edit a Contact or Account Owner*, 12 Aug 2026). No renewal column, no health, no risk.

**The account page.** Companies › Saved › click a company. Left: six widgets (Company details, Record details, Tasks, Deals, Contacts, Notes). Right: eleven tabs (Overview, Activities, People, Recommendations, Existing contacts, Sequences, Conversations, Enrichment, Locations, All fields, Files), two of which the article says are "being deprecated". Overview holds a *Company insights* widget with company score, news, technologies, funding, job postings, employee trends and website visitors: prospecting intelligence, not customer health. Extra fields sit behind "See all fields" and a ⚙ "to add fields to the default widget view"; tasks complete by "Hover over a task and click ✓"; each user can "click Layout to change the account layout or create a new layout" (KB, *View and Edit Accounts*, 1 Sep 2026). A field on the All fields tab is four levels from the nav.

**Keeping clients out of outreach.** Admin Settings › All Settings › Rules of Engagement › Prospecting Config › *Exclude Account Stages*. If a rep prospects from an excluded stage "Apollo displays a warning message... they can still add the flagged prospect by clicking Add People" (KB, *Configure Prospect Settings in Apollo*, 5 Sep 2026). Sequence rulesets exclude Current client, Active opportunity and Dead opportunity by default (KB, *Manage Sequence Rulesets*, 8 Sep 2026). This is the whole of Apollo's customer-success logic: a warning and an exclusion.

**Renewals.** Apollo's own recipe for "the Head of Customer Success" is a five-step build: a sequence, a list, a custom field in the CRM, a custom *contact* field in Apollo mapped to it, and a workflow triggered when the field lands 1 to 3 months in the future (KB, *Use Case: Automate Customer Renewal Notifications Using Workflows*, 30 Jul 2026). The renewal date lives in the CRM, on the contact, and is never shown as a list.

**Signals and visits.** Signals are search filters and score criteria, made under Settings › Ideal customer profile › Signals and used from Show Filters › Signals (KB, *Create and Use a Signal*, 28 Jul 2026). Website visits are read by going "to the company page, then hover over Website visits"; "If a company hasn't visited your tracked domains, the icon won't appear"; contact-level tracking is US only and data "may take up to 7 days to appear" (KB, *Use Website Visitors Data*, 8 Jul 2026). Scores are explained by "Hover over an individual score" or "click Show breakdown" on the profile (KB, *Scores Overview*, 11 Sep 2026). Buying intent is a 0 to 100 score from Bombora, plan-gated (KB, *Buying Intent Overview*, 11 Sep 2026).

**Health, risks, hand-offs: modelled on Gainsight and HubSpot.** Gainsight's Customer 360 is a record page with up to seventeen sections (Attributes, Cockpit, Company Hierarchy, Company Intelligence, Embed Page, Forecast, Leads, People, Relationship, Reports, Scorecard, Success Plan, Summary, Survey, Timeline, Usage, Sponsor Tracking), "CSM Layout and Exec Layout" pre-built, up to fifty layouts, and "Admins can create a new layout for different groups of end-users" (Gainsight support, *Configure 360 Layouts*). Its Summary defaults are Health Score, Open CTAs, Active Success Plans and NPS, plus a Renewal Date widget counting days left (Gainsight support, *Configure Customer 360 Summary*, from the search excerpt; the page itself could not be fetched). HubSpot has no native health: teams add a company property, a Green/Yellow/Red dropdown or a 0 to 100 number set by workflows, read on the record, in saved views and dashboards. A competing vendor sums it up: "It is rule-based. You hand-pick the weights and thresholds" and "It doesn't explain itself... there are no ranked drivers behind the score" (customerscore.io; competitor source, unverified against HubSpot's documentation). HubSpot's own guidance recommends bands like "Healthy, Monitor, and At risk" and warns scores must be "reviewed and adjusted regularly" (HubSpot blog, *Customer health score*).

**Documented problems.**

| Problem | Source |
|---|---|
| Too many clicks; things not where expected | "too many clicks to reach data many navigation buttons seems to be not in the logical place" — Hassnaa, Trustpilot, 4 Sep 2026 |
| Hover-only icons cause wrong actions | "I accidentally spent a bunch of time individually selecting people only to click on the wrong 'add to list' icon that just added the entire company to my list" — ryan P., Capterra, 31 Oct 2025 |
| Labels do not say what is behind them | "Name of the features is a bit confusing to me" — Capterra reviewer, via Capterra summary |
| Each screen is one click short | "navigating between campaigns, contacts, and analytics feels like one click too many each time" — G2 reviewer via SyncGTM (secondary) |
| Visits, scores and tasks are hover-only; the visit icon vanishes when empty | Apollo KB, *Use Website Visitors Data*, *Scores Overview*, *View and Edit Accounts* |
| Renewal needs five build steps and a CRM field | Apollo KB, *Automate Customer Renewal Notifications* |
| The guard against emailing clients can be clicked through | Apollo KB, *Configure Prospect Settings* |
| Per-user layouts instead of a right default | Apollo "Layout" per user; Gainsight's fifty layouts; fewer than 5% of users customise anything (Spool, rule 6) |
| The CS tool is a chore for the CSM | "At the CSM level it's tedious as hell" — u/TheLuo, Reddit, via GainTrace (secondary, undated); "tons of hidden system limitations and nuances that just make the system feel old, out dated and clunky" — James W., Revenue Ops Manager, Capterra, 27 May 2024; "It's a clunky system" — Sales Director, Capterra, 25 Jul 2022; "Adopters should consider staffing specifically for GS administration" — Sr. Director Client Operations, Capterra, Feb 2018 |
| Health without reasons | customerscore.io on HubSpot (competitor source) |

## 6. After: the disclosed version

**Layout.** Header strip, filter row, table, drawer. The strip holds the three renewal counters, value at risk and, when one exists, "Hand-offs waiting for you (n)". The filter row holds search, the health band select, the owner select and "More filters (3)". The table shows the level-one columns for the signed-in role and business; row actions show on hover and focus and repeat in "More actions". Clicking a row, or Enter, opens the drawer.

**Level one by role, Meridian.** CS: name, health with trend, renewal and days left, contract value, open risks, last touch, next step; the counters, value at risk and hand-offs waiting; Log touch, Add risk, Open; search, health filter, sort. AE: name, health, renewal, value, open risks, expansion signals, deals; hand-offs waiting and Send hand-off; Create expansion deal in the row actions. Admin: name, renewal, value, open risks, owner; owner filter; group by owner.

**Level two, Meridian.** Everything else, in exactly one of four doors: More columns, More filters, More actions, the drawer.

**Across the four businesses.** Fathom, admin: the hand-off strip is absent; "Agent-proposed next step" is a visible row action; owner is a level-two column. Halyard, admin: the same as Fathom, and the page mostly shows its empty state. Ridgeline, CS: seats (active of bought), usage 30 days and expansion signals become level-one columns; the drawer opens on usage and seats; "Add to campaign" is a visible row action. Ridgeline, AE: signals, seats, usage and deals at level one, sorted by signals; pricing-page visits are named in the signals column.

**Doors.**

| Door label | Container | Content behind it |
|---|---|---|
| Account name (row, "Open") | Drawer, focus-trapped, Esc returns | Health drivers, renewal terms, risks, signals, hand-off notes, touches, timeline, usage 90 days, seats, contacts, deals, notes, files, all fields, CRM sync, in one scroll with headed, collapsible sections |
| More columns (n) | Popover | The level-two columns for this role and business, with a count |
| More filters (3) | In place, under the filter row | Risk type, plan, include churned |
| More actions | Row menu | Create renewal deal, Create expansion deal, Email the champion, Book a review meeting, Change owner, Add to campaign, Push to CRM now, then a divider, Mark churned, Remove account |
| Hand-offs waiting for you (n) | In place, above the table | The hand-offs with from, sent, why they bought, Accept |

Every door has a chevron and text, sits next to what it reveals, and is removed when it has nothing behind it: no hand-off strip without hand-offs, no "Add to campaign" without campaigns, no CRM items at Fathom.

**Persistence.** Filters, sort, chosen columns, the hand-off strip's open state and each drawer section's collapsed state are remembered per user per workspace. "Expand all" sits at the top of the drawer; print expands every section.

**Accelerators.** The shortcuts in section 3; the palette shows each one; saved views for the two or three cuts a CSM repeats; "keep the drawer open while I move rows" as a remembered preference.

**Decision-critical.** Renewal date and days left, contract value, open risks with any churn notice written out, value at risk, and hand-offs waiting. All visible without a click at every business, including Halyard, where they read zero. Mark churned and Remove account state their consequence on the confirm step and put undo in the notification.

**Removed rather than hidden.** New account and Import CSV (accounts come from closed-won deals or a stage change on Companies); Enrich, Find people and Add to sequence (they belong on Companies and People); Suggested leads and Similar companies; per-user layouts; a Recommendations tab; NPS and support tickets (outside the boundary); any door called Advanced, More or Other.

**Score.**

1. Decision-critical visible: renewal, value, risks, value at risk, hand-offs all level one. 2.
2. Usage-backed: every visible item has a number in `accounts.ts` with USAGE-MODEL.md as the source. 2.
3. Two levels: table, then one of four doors; the drawer's sections are headings, not doors; phone keeps list then sheet. 2.
4. Doors labelled by content with chevron and text, counts where useful. 2.
5. Doors adjacent and keyboard-reachable; row actions on focus; nothing hover-only. 2.
6. Dependent fields together: renewal date, value, terms and forecast in one section; risk type, note and owner in one form; next step read and set in one cell. 2.
7. State persists; expand all and print exist. 2.
8. Disclosure by user action or object state (hand-off strip, lapsed renewals, churn notice); nothing reorders from history. 2.
9. Door usage instrumented per role and business; the promote-keep-delete review is twice a year with the rest of the product. 1: the review exists on paper; the page has not been through one.

Total 17 of 18.

## 7. Lesson steps

Accounts is a real page, not a lesson. The rules that mattered most:

- **Rule 1.** The list is the product: health, renewal, risks, last touch and next step in the row, because a CSM reads them every day; seats and usage join the row only at Ridgeline, where they are read every day.
- **Rule 7.** Renewal date, value, risks and pending hand-offs never sit behind a door, even at Halyard where they are zero.
- **Rule 4.** No "Recommendations" bulb, no hover-only visit icon that vanishes when empty, no door called More; every door is named for its contents and removed when empty.
- **Rule 5.** A score always travels with its reasons; a renewal date always travels with its value and terms; a hand-off always travels with why they bought.

## 8. Review

| Check | Gap found | How it was closed |
|---|---|---|
| All roles covered | SDR and marketer had no line | Added: no access, the shell's page names the roles and the admin |
| All four businesses | Halyard's use of the page was undefined | Defined: clients are workspaces; the page holds a client's own customers; empty state written |
| Every field has a source | Health, renewal, seats, risks, signals, hand-offs are not in the seed | Section 2 specifies the `Account` collection, the formula and the deterministic rules |
| Every action has an outcome | Mark churned and Remove had no stated consequence | Consequence written on the confirm step; undo in the notification |
| Empty, error, no access | Halyard empty state and row-level CRM errors were missing | Both written |
| Keyboard | Counters had no shortcut | `1`, `2`, `3` added; palette lists everything |
| Phone width | Table would have hidden columns three deep | Cards plus full-screen sheet; two levels kept |
| Decision-critical visible | Value at risk had 18% use and would have dropped to level two | Marked critical; six items in total |
| Two levels maximum | Drawer sections risked becoming doors inside a door | Sections are headings with collapse state, not doors; expand all provided |
| Doors labelled by content | "More filters" needed scent | Count added; contents listed in the table |
| Dependent fields together | Next step was two items, read and set | Merged into one in-place cell |
| State persists | Not specified for the hand-off strip | Added to persistence |
| Accelerators | None for the counters | Shortcuts and saved views added |
| Usage shape | Ridgeline CS head reached 41% on the first pass | Trimmed to 30% by moving plan, dismiss, campaign, agent and timeline to body; the remaining overshoot is stated and justified |
| Nothing hover-only | Row actions are hover-revealed in the template | They also show on focus and repeat in the menu; on touch the menu is always visible |
| Role gaps explain themselves | Fathom and Halyard lacked the hand-off strip silently | Removed with the reason recorded here; nothing is missing for those users, so the product has nothing to explain |
| No usage numbers or teaching text in the product | The Halyard empty state read like a lesson | Rewritten as a statement of fact |
