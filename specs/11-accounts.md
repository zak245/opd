# Accounts

*The customer success page: a table built from the table template and a quick look beside it. The record behind a row is the **company record**, which renders its customer state; this spec builds no second record page. Usage numbers live in `src/ollopa/usage/accounts.ts`; nothing from them is shown in the product.*

## 1. Purpose

Accounts is where a customer success manager (CSM) starts the day. It lists the client accounts, each with a health score, the renewal date, seats and usage, expansion signals and open risks. It also holds two queues: renewals due in the next 30, 60 and 90 days, and hand-offs arriving from account executives after a deal closes.

Who lives here: customer success, daily. Account executives visit weekly, to send a hand-off or to pick up an expansion signal. The RevOps admin visits monthly, to reassign owners and to check CRM sync. SDRs and marketers do not have the page; the page says so and names the admin.

The one thing nobody may lose sight of: **which accounts are renewing soon and are not healthy.** Everything else on the page exists to change that answer.

**A company and an account are one object with a customer state** (PLAN.md, 15 September 2026). There is therefore one record, not two: the company record at `/ollopa/companies/:id`, which renders the customer-state field set and sections — health and its drivers, renewal terms, risks, expansion signals, the hand-off, touches, usage over 90 days, seats, goals, first value — when `Company.stage` is Current client or Churned, and removes them when it is not. `/ollopa/accounts/:id` redirects there. This spec does not build a second record page, and a change to the record template belongs in [09](09-deal-record.md) §6.8, which owns it.

Accounts stays a **page**: the customer-state table, its columns, its filters, its quick look and its row actions. That is what a CSM needs and a company table cannot give — fifty renewals in renewal order with health beside each.

The two levels the record pattern gives every record still apply (RULES.md; the pattern is defined in [09](09-deal-record.md) §6.8). Level one is the quick look: a flat drawer beside the table, the few fields a glance needs, nothing collapsing inside it, read-only except the next step. Level two is the company record with its customer state. Remove the quick look and a CSM loses speed while scanning fifty renewals; they lose no feature, because the record holds everything. A second record page for the same object would be a second version of the record, which is what the pattern's test forbids, and it is how two pages end up disagreeing about one customer.

At **Fathom** (Founder-led outbound) and **Halyard** (Agency) the workspace profile leaves Accounts out of the sidebar. The page still opens by ⌘K and by deep link, and its header offers "Add to sidebar", which adds it at the end of its group and keeps it there. When the first deal reaches Closed won, the page appears in that sidebar for two weeks and then asks once, "keep it?"; the answer is final until a new signal, and there is never more than one such exposure in a period. This is not a permission gap and the page says nothing about permission.

Ridgeline, the product-led customer, is where the page matters most. It has almost no outbound; seats, usage and signals are its pipeline. Meridian is the baseline. Fathom has no CS role, so the founder keeps the accounts herself. Halyard's ten clients are workspaces, not accounts, so the page there only holds each client's own customers, kept out of sequences.

## 2. Data

### Fields shown

| Field | Source |
|---|---|
| Account name, domain, industry, employees, contacts held, stage | `Company` in `seed.ts`. Account stages are the five values owned by Settings › Pipeline and data (`pipe.contact-stages`): Cold, Active opportunity, Current client, Churned, Do not prospect. This page lists Current client, and Churned when the filter includes it |
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
- `AccountRisk { id, type, opened, owner, note, resolved }`; types Usage drop, Champion left, Escalation, Budget cut, Competitor, **Onboarding stalled**, Churn notice. Onboarding stalled is raised by the shipped signal "No first-value milestone in 90 days", defined in Settings › Signals, scoring and personas. A third of accounts carry one open risk; one account each at Meridian and Ridgeline carries a Churn notice.
- `AccountSignal { id, kind, fired, source, detail, dismissed, routedTo, dueBy, outcome }`; kinds Seats over 90%, New team joined, Pricing page visits, Hiring in your buyer's team, Feature limit hit, Executive sponsor changed; sources Product, Website, Research agent, CRM; `outcome` one of acted, no conversation, or not real. Ridgeline 0 to 3 per account, others 0 to 1. A signal that fired and reached nobody is the failure this object exists to prevent, so it carries who it was routed to and when it is due.
- `Handoff { from, signer, sent, accepted, whyTheyBought, promised, users, risks, dissenters, deadline, deadlineWhy, checklist }` on a quarter of Meridian and Ridgeline accounts touched in the last 21 days, `from` an AE seat; `null` at Fathom and Halyard, which have no AE. The brief has seven named sections: **why they bought**, **what was promised**, **who signed**, **who will use it**, **the risks the AE already knows about**, **who was against it**, and **the deadline and why it matters**. Each carries the name of whoever wrote it, so the CSM can see which parts the AE stood behind and which an agent drafted.
- `Account.firstValue { definition, target, confirmedOn, confirmedBy }` and `Account.goals[] { text, agreedOn, source }`. Onboarding has no end without a definition of first value, and a business review has nothing to measure against without the goals agreed at the start.
- Renewal: today plus `(i × 23 + 9) mod 365` days for the i-th account, so every window has rows. Plans Starter 49, Growth 79, Scale 129 per seat; seats 5, 10, 25, 50 or 100; value = seats × price × 12; seats active 35% to 100% of bought; usage index 20 to 100, change −40% to +40%.
- Health = clamp(55 + usage + seats + touch + risks + signals, 0, 100): usage = change ÷ 2, capped ±20; seats = +10 at 90% utilisation, 0 from 60%, −10 below; touch = +10 within 14 days, 0 within 30, −15 after; risks = −12 each, −25 more for a churn notice; signals = +5 each, capped +10. Bands: Healthy from 70, Watch from 40, At risk below. Drivers are stored, so the health-drivers section on the company record always sums to the score.
- Forecast: At risk band → At risk; Healthy and renewing within 90 days → Commit; otherwise Likely; churned → Lost.

## 3. Features

### Shown

- A header strip: **Renewals due** as three counters, 30, 60 and 90 days, each with count and renewing value; **Value at risk** (renewing value on At risk accounts); **Hand-offs waiting for you**, present only when one exists and only where an AE role exists.
- The table, one row per account. Any field an agent can write carries a state chip — suggested, edited or validated — as it does on every record (defined in [09](09-deal-record.md) §6.6). Health is a number with its band as text, never colour alone, and an arrow for the 30-day change. Renewal shows the date and days left, emphasised under 30 days. Open risks shows the count and newest type; a churn notice is written out. Next step edits in place.
- Row actions on hover and keyboard focus: **Log touch**, **Add risk**, **Open**; all repeat in the row's action menu, whose button is named for what it holds — "Renewal deal, expansion deal, email champion, book review, change owner, add to campaign, push to CRM, mark churned, remove" — so nothing is hover-only and no menu is called "More actions".
- **The quick look**, a flat drawer beside the table, opened by Enter or by clicking the row. It is the company record's quick look rendered with the customer-state field set, so it holds the same fields as the top of that record, in the same order and with the same labels: health with its band and 30-day change, **the four health drivers as flat lines directly under it**, renewal date and days left, contract value, open risks with the newest type, last touch, champion, owner, and the next step. Nothing inside it collapses and nothing inside it is a door. Only the next step is editable — that is the one field the glance exists for. Its footer has one link, "Open the company record", and the row's actions stay reachable behind it.

  The drivers are here because a score and its reasons never sit across a door from one another (rule 5). They are four stored numbers that sum to the score — usage change, seat utilisation, time since last touch, open risks and signals — and a CSM who reads "Watch, 52" without them is reading a number she cannot act on. That they are read on only about one account in five is a statement about how often she needs them, not about where they live.

- **A row door, "Signals and news · n"**, opening in place under the row: what fired, when, from where, who it was routed to and when it is due. Removed where nothing has fired.
- **The record behind a row is the company record**, at `/ollopa/companies/:id`. It is one page for one object, and it switches on the customer state rather than being a second page. When `Company.stage` is Current client or Churned, its header gains health and band, renewal and days left, contract value, open risks, last touch and next step; its sections gain, in this order: health drivers (the stored numbers that sum to the score); renewal terms (date, value, billing, notice period, auto-renew, forecast, Create renewal deal); first value and the goals agreed at the start; open risks; expansion signals; the hand-off brief; touches and the activity timeline; usage over 90 days; seats and last sign-in. Its ordinary sections — contacts, deals, activity — stay where they are. Side cards gain renewal, champion and CRM sync. The doors are the company record's doors, defined in [09](09-deal-record.md) §6.8. Nothing here is a tab: every related list is short enough to be a section, and sections can be read side by side.

  **The health drivers section** ends with one line and one control: *"Inputs and weights are set in Settings › Signals, scoring and personas by Daniel Okafor (RevOps admin)"*, and **"This flag was wrong"**, which writes a request carrying the account, the input and the reason, visible on Requests. A CSM who cannot change a model must still be able to say it is broken, and the role gap names who can (rule 4).

### Actions

| Where | Action | Outcome |
|---|---|---|
| Row | Log touch | Type, date and note in a small form on the row; the touch lands in the company record's touches section, last touch and health recompute; toast |
| Row | Add risk | Type, note, owner; risk count and health update; toast |
| Row | Open | The quick look opens beside the table, focus moves in; Esc returns focus to the row |
| Quick look | Open the company record | The company record at `/ollopa/companies/:id`, rendering its customer state; the back link returns to the table with the same filters and the row focused |
| Row menu | Create renewal or expansion deal | A **typed** deal created on Deals with the account's name and value, linked in the deals section. Renewals and expansions are typed deals, not a separate object (PLAN.md, 15 September 2026) |
| Row menu, record | **Run a play** | Opens the play panel, below |
| Row menu | Email the champion, Book a review meeting | Composer or calendar opens with the champion prefilled |
| Row menu | Change owner | Picker; hand-off notes travel with the account |
| Row menu | Add to campaign | Contacts added to a lifecycle campaign; Ridgeline only, the only business running them |
| Row menu | Push to CRM now | Sync status updates; errors named inline |
| Row menu | Mark churned | Confirm step says: stage becomes Churned, the row leaves the default view, sequences already exclude it; undo in the notification |
| Row menu | Remove account | Confirm step says: removed from Accounts and lists, the company stays on Companies; undo in the notification |
| Company record | Resolve risk, Dismiss signal, Set next step, Add note, Approve or decline the agent's step | In the section it belongs to; health recomputes where relevant. The account's owner approves the agent's step and the admin may approve for anyone, following the one approval policy in Settings; research and scoring are logged rather than queued, and the card says what approving will do |
| Hand-off strip, and the record's hand-off section | Accept | The consequence is on the button, **before** the click: *"You become the owner. The account joins your book, the health baseline is taken today, and Marcus Adeyemi is told."* Then: the account's owner becomes the accepting CSM, the **deal keeps its AE for reporting**, the record opens at the hand-off section with the checklist, and the count drops. The brief shows who wrote which section |
| Hand-off strip | Send hand-off (AE) | Pick a CSM; the account joins that CSM's queue |
| Bulk | Assign owner, Add to campaign, Export CSV | Applies to checked rows; count in the toast |
| Page | Health score model, Which signals fire | Open Settings; the link says what changes there |
| Record, signals section | Route an expansion signal | Creates a **typed expansion deal and a task for its new owner, with the brief attached**. The routing band and its SLA are in Settings › Signals, scoring and personas: under $15,000 to the account owner, $25,000 and above to the account executive of record. The `Handoff` object is the closed-won seam only and is not reused here |

### Run a play

`X-play`, opened from the row menu and from the record. A flat panel, no doors inside it. It holds, in order:

- **The play**, chosen from the risk tier or the signal kind: "Usage drop, Watch band", "Seats over 90%", "Champion left".
- **What it will create, before the button**: *"Creates 3 tasks for you, a note on the account, and emails nobody."* An expansion play adds the routing band and its SLA. A play that quietly emails a customer is the thing this line exists to prevent.
- **The owner**, and for an expansion play the band it routes into and the hours the SLA allows.
- **The recheck date**, so the play has an end.

Agent-drafted content inside a play — a suggested note, a suggested email body — is **logged, not queued**: it is written where the CSM can see it, marked as a draft, and nothing is sent by the click.

### The renewal ladder

Renewal reminder tasks are created for the account owner at **120, 90, 60 and 30 days before the renewal date**, from the setting in Settings › Pipeline and data, and land on Tasks. They are ordinary tasks with ordinary due dates. Customer success does not hold the Workflows page — it is an OPS and MK page, Growth-gated — so a CS seat is never served by a page it does not have.

### Support tickets

Support tickets are **outside the product's boundary** (PLAN.md, 15 September 2026). An escalation is recorded here as a risk of type Escalation carrying what the CSM wrote. Nothing on this page hints at a ticket integration, because a door that opens onto nothing is worse than no door (rule 4).

### Filters, search, sorting, columns

- The shared table behaviours — sortable headers, the columns popover, the bulk bar, skeleton loading, row actions on focus as well as hover — are specified once in [02 People](02-people.md); this section records only what differs here. Search matches name, domain, champion and owner.
- The 30/60/90 counters are toggle filters; health band and owner are visible selects; one more door, named for what it holds: "Additional filters: risk type, plan, churned accounts (3)".
- Sort by renewal (soonest), health (lowest), value (highest) or last touch (oldest); headers are sortable and announce the sort. The **default is renewal (soonest) everywhere except Ridgeline, where it is health (lowest)**: a product-led CS lead reads health at 90 and usage at 85 and reaches the renewal through the unhealthy account, not the other way round.
- Default columns follow the usage model per role and business (section 6); the rest sit behind a door named for them: "Columns: plan, seats, usage, champion, forecast, notice period, CRM sync (7)". No door in this product is called "More", "More columns", "More filters", "More actions", "Other" or "Advanced".

### States

- **Empty:** "No client accounts yet. An account appears here when a deal is closed won, or when a company's stage is set to Current client on Companies." At Halyard: "This workspace has no current clients. Clients of this workspace are kept out of sequences automatically once their stage is set."
- **Nothing matches:** the template's "Nothing matches. Clear the search or a filter."
- **Loading:** skeleton rows; counters show a dash.
- **Error:** "Accounts could not load. Retry." Row-level CRM errors show inline, with the error text, never a red icon alone.
- **No access:** the shell's NoAccess page: used by Customer success, Account executive, RevOps admin; ask the named admin.

### Keyboard

`/` focuses search. `j` and `k` move rows, Enter opens the quick look, `o` opens the company record, Esc closes the quick look and returns focus. `l` logs a touch, `r` adds a risk, `n` edits the next step on the focused row. `1`, `2`, `3` toggle the 30, 60 and 90-day filters. `⌘K` opens the palette, which lists every action with its shortcut.

### Accessibility

Real table semantics; `aria-sort` on headers; counters are toggle buttons with `aria-pressed`; the quick look is a dialog with focus trap and return; the company record is an ordinary page with a back link and a deep link that can be shared, which a drawer cannot carry; toasts use the shell's live region; band and severity are text plus colour; reveals animate at 200 ms with a reduced-motion crossfade; door contents use `hidden=until-found` so find-in-page works.

### Phone width

Cards instead of rows: name, health, days to renewal, open risks, owner. Counters scroll horizontally; the row's action button is always visible. The quick look becomes a full-height sheet with the same flat contents; the company record is a page, one column, sections in the order above, doors last. Still two levels: the table, then one of the quick look, the company record, the play panel, the signals row door or a door on that record.

### By role and business

- **CS:** the full page. Default filter: my accounts. Default sort: renewal.
- **AE:** the same table, default sort by expansion signals, default filter "accounts I sold". The hand-off panel shows hand-offs sent by the AE and still waiting, with a "Send hand-off" button.
- **Admin:** owner column and owner filter at level one, group by owner, bulk owner assignment, CRM sync column, links to the health model and signal rules.
- **Fathom:** no hand-off panel (no AE role; the panel is removed, not disabled). Agent-proposed next steps at level one.
- **Halyard:** no hand-off panel; the counters are usually zero; the page opens on the empty state described above.
- **Ridgeline:** seats, usage and signals columns at level one; seats and usage join the quick look, and the company record puts usage over 90 days and the seat list directly under the field grid; "Add to campaign" as a visible row action for CS.

## 4. Usage items

Weekly use is the share of active users in the role touching the item in a typical week (USAGE-MODEL.md). Baseline is Meridian. SDR and marketer have no access and carry no number; `weeklyUse` also returns zero for a seat a business has not declared (`SEATS` in `usage/model.ts`), so Fathom's and Halyard's absent CS and AE seats never compute a first screen. Marked items (*) are decision-critical and always level one. Full data, with notes, in `src/ollopa/usage/accounts.ts`.

Three marks changed in this pass. Hand-offs waiting is no longer marked critical: it is a queue, not a price, a commitment or a safety state, and it is a head item for CS and AE anyway (25 and 25) and removed where nobody hands off. Mark churned and Remove account gain the mark, because they are destructive and every other destructive action in the product carries it.

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
| Renewal reminder tasks at 120, 90, 60 and 30 days | 45 | 6 | 4 | Ridgeline CS 60; Fathom admin 12 |
| Lapsed renewals | 4 | 2 | 4 | |
| **Hand-offs** | | | | |
| Hand-offs waiting for you | 25 | 25 | 4 | Ridgeline CS 15, AE 20; Fathom and Halyard 0 |
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
| Signals and news on the row: what fired, when, from where, routed to whom | 15 | 15 | 2 | Ridgeline CS 55, AE 50 |
| Which signals fire (opens Settings) | 2 | 1 | 5 | |
| **Working an account** | | | | |
| Log a touch | 75 | 10 | 2 | Fathom admin 15 |
| Add note | 35 | 8 | 2 | Fathom admin 10 |
| Email the champion | 15 | 6 | 1 | |
| Book a review meeting | 12 | 5 | 1 | |
| Activity timeline | 18 | 12 | 4 | |
| What makes up the score (the four drivers) | 18 | 5 | 8 | Ridgeline CS 50, AE 15. **Level one everywhere**, as a stated rule-5 exception |
| Usage over 90 days | 15 | 5 | 2 | Ridgeline CS 60, AE 25 |
| Who has a seat and last sign-in | 12 | 5 | 2 | Ridgeline CS 45, AE 20 |
| Contacts at the account | 18 | 10 | 2 | |
| Deals at the account | 12 | 25 | 4 | |
| Add contacts to a lifecycle campaign | 4 | 2 | 1 | Ridgeline CS 18 |
| Agent-proposed next step | 15 | 5 | 5 | Ridgeline CS 18; Fathom admin 25 |
| Run a play: what it creates, before the button * | 35 | 6 | 2 | Ridgeline CS 70, AE 15; Fathom admin 10 |
| First value: definition, target, when it was confirmed | 30 | 4 | 2 | Ridgeline CS 55; Fathom admin 8 |
| The goals agreed at the start | 25 | 5 | 2 | Ridgeline CS 40; Fathom admin 6 |
| "This flag was wrong", which writes a request | 8 | 2 | 3 | Ridgeline CS 15 |
| Files | 4 | 2 | 1 | |
| All fields, including custom fields | 4 | 2 | 6 | |
| Change owner | 4 | 3 | 12 | Fathom admin 1; Halyard admin 2 |
| Mark churned * | 3 | 1 | 2 | |
| Remove account * | 1 | 0.5 | 2 | |
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

Seventy-seven items. Shape check, computed from the file with `shape()`:

| Pair | Head (≥20) | Body (5–19) | Tail (<5) | Verdict |
|---|---|---|---|---|
| Meridian, CS | 19 (25%) | 26 (34%) | 32 (42%) | At the top of the published band |
| Ridgeline, CS | 26 (34%) | 26 (34%) | 25 (32%) | Head deliberately over: a product-led CS lead's whole job is this page; seats, usage, signals, plays and first value join the head |
| Ridgeline, AE | 20 (26%) | 25 (32%) | 32 (42%) | One point over |
| Meridian, admin | 4 (5%) | 24 (31%) | 49 (64%) | Fits; the admin rarely comes here |
| Fathom, admin | 10 (13%) | 21 (27%) | 46 (60%) | Fits; a founder checks weekly |
| Halyard, admin | 0 | 13 (17%) | 64 (83%) | The page is nearly empty for the agency, as intended |

Six items arrived in this pass: the play panel, first value, the goals, "this flag was wrong", the signals row door and the renewal ladder. Five of the six are a CSM's weekly work, so Meridian's CS moved from 21% to the top of the band and Ridgeline's from 30% to 34%. Ridgeline's number is stated, not fitted: at a product-led business the CS lead reads health at 90, usage at 85, signals at 55 and now runs a play on most days, and re-rating one of those to fit the curve would describe a job nobody has.

Level one for Meridian CS is 23 items: the 19 head items plus four low-use decision-critical ones (value at risk, churn notice, mark churned, remove account). For Ridgeline CS it is 30, and for the Ridgeline AE 25.

## 5. Before: the common version

Apollo has no customer success product. What it has for existing clients is an account stage, a prospecting guard, a general account profile, signals built for prospecting, and a workflow recipe for renewals. The layout below is Apollo's where Apollo has something, and Gainsight's Customer 360 or HubSpot's company record where it has nothing; each borrowed piece says so.

**Where the client list lives.** Companies › Saved, filtered by the account stage *Current Client*, one of five defaults (Cold, Current Client, Active Opportunity, Dead Opportunity, Do Not Prospect); "Churned" is a recommended custom stage, not a default (Apollo KB, *Contact and Account Stages Overview*, 28 Aug 2026). The saved-companies page is a prospecting table: columns are added one at a time, the stage changes by double-clicking the cell or check › Edit › Set stage, and "Recommendations" sit behind a light-bulb icon (KB, *Manage Saved Records in Apollo*, 12 Aug 2026). Changing the owner is check › … › Edit › Assign owner, three levels (KB, *Edit a Contact or Account Owner*, 12 Aug 2026). No renewal column, no health, no risk.

**The account page.** Companies › Saved › click a company. Left: six widgets (Company details, Record details, Tasks, Deals, Contacts, Notes). Right: eleven tabs (Overview, Activities, People, Recommendations, Existing contacts, Sequences, Conversations, Enrichment, Locations, All fields, Files), two of which the article says are "being deprecated". Overview holds a *Company insights* widget with company score, news, technologies, funding, job postings, employee trends and website visitors: prospecting intelligence, not customer health. Extra fields sit behind "See all fields" and a ⚙ "to add fields to the default widget view"; tasks complete by "Hover over a task and click ✓"; each user can "click Layout to change the account layout or create a new layout" (KB, *View and Edit Accounts*, 1 Sep 2026). A field on the All fields tab is four levels from the nav.

**Keeping clients out of outreach.** Admin Settings › All Settings › Rules of Engagement › Prospecting Config › *Exclude Account Stages*. If a rep prospects from an excluded stage "Apollo displays a warning message... they can still add the flagged prospect by clicking Add People" (KB, *Configure Prospect Settings in Apollo*, 5 Sep 2026). Sequence rulesets exclude Current client, Active opportunity and Dead opportunity by default (KB, *Manage Sequence Rulesets*, 8 Sep 2026). This is the whole of Apollo's customer-success logic: a warning and an exclusion.

**Renewals.** Apollo's own recipe for "the Head of Customer Success" is a five-step build: a sequence, a list, a custom field in the CRM, a custom *contact* field in Apollo mapped to it, and a workflow triggered when the field lands 1 to 3 months in the future (KB, *Use Case: Automate Customer Renewal Notifications Using Workflows*, 30 Jul 2026). The renewal date lives in the CRM, on the contact, and is never shown as a list.

**Signals and visits.** Signals are search filters and score criteria, made under Settings › Ideal customer profile › Signals and used from Show Filters › Signals (KB, *Create and Use a Signal*, 28 Jul 2026). Website visits are read by going "to the company page, then hover over Website visits"; "If a company hasn't visited your tracked domains, the icon won't appear"; contact-level tracking is US only and data "may take up to 7 days to appear" (KB, *Use Website Visitors Data*, 8 Jul 2026). Scores are explained by "Hover over an individual score" or "click Show breakdown" on the profile (KB, *Scores Overview*, 11 Sep 2026). Buying intent is a 0 to 100 score from Bombora, plan-gated (KB, *Buying Intent Overview*, 11 Sep 2026).

**Health, risks, hand-offs: modelled on Gainsight and HubSpot.** Gainsight's Customer 360 is a record page with up to seventeen sections (Attributes, Cockpit, Company Hierarchy, Company Intelligence, Embed Page, Forecast, Leads, People, Relationship, Reports, Scorecard, Success Plan, Summary, Survey, Timeline, Usage, Sponsor Tracking), "CSM Layout and Exec Layout" pre-built, up to fifty layouts, and "Admins can create a new layout for different groups of end-users" (Gainsight support, *Configure 360 Layouts*). Its Summary defaults are reported as Health Score, Open CTAs, Active Success Plans and NPS, plus a Renewal Date widget counting days left (Gainsight support, *Configure Customer 360 Summary*; only a search excerpt was reachable and the page itself could not be fetched, so this one is **unverified**). HubSpot has no native health: teams add a company property, a Green/Yellow/Red dropdown or a 0 to 100 number set by workflows, read on the record, in saved views and dashboards. A competing vendor sums it up: "It is rule-based. You hand-pick the weights and thresholds" and "It doesn't explain itself... there are no ranked drivers behind the score" (customerscore.io; competitor source, unverified against HubSpot's documentation). HubSpot's own guidance recommends bands like "Healthy, Monitor, and At risk" and warns scores must be "reviewed and adjusted regularly" (HubSpot blog, *Customer health score*).

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
| Per-user layouts instead of a right default | Apollo "Layout" per user; Gainsight's fifty layouts. The line usually attached here, Spool's "fewer than 5% ever changed a setting", is a 2011 anecdote about consumer Word with no post-2018 replacement ([11 What changed](../knowledge-base/11-what-changed-2018-2026.md)), so the objection is rule 6 itself: fifty layouts is a design decision handed back to the customer |
| The CS tool is a chore for the CSM | "At the CSM level it's tedious as hell" — u/TheLuo, Reddit, via GainTrace (secondary, undated); "tons of hidden system limitations and nuances that just make the system feel old, out dated and clunky" — James W., Revenue Ops Manager, Capterra, 27 May 2024; "It's a clunky system" — Sales Director, Capterra, 25 Jul 2022; "Adopters should consider staffing specifically for GS administration" — Sr. Director Client Operations, Capterra, Feb 2018 |
| Health without reasons | customerscore.io on HubSpot (competitor source) |

## 6. After: the disclosed version

**Layout.** Header strip, filter row, table, quick look. The strip holds the three renewal counters, value at risk and, when one exists, "Hand-offs waiting for you (n)". The filter row holds search, the health band select, the owner select and the door "Additional filters: risk type, plan, churned accounts (3)". The table shows the level-one columns for the signed-in role and business; row actions show on hover and focus and repeat in the row's named action menu. Clicking a row, or Enter, opens the quick look beside the table; "Open the company record" in its footer, `o` on the row, or the account name opens the company record with its customer state.

**Level one by role, Meridian.** CS: name, health with trend, renewal and days left, contract value, open risks, last touch, next step; the counters, value at risk and hand-offs waiting; Log touch, Add risk, Open; search, health filter, sort. AE: name, health, renewal, value, open risks, expansion signals, deals; hand-offs waiting and Send hand-off; Create expansion deal in the row actions. Admin: name, renewal, value, open risks, owner; owner filter; group by owner.

**Level two, Meridian.** Everything else, in exactly one of these, each named for its contents: the columns door, the filters door, the "Signals and news · n" row door, the row's action menu, the play panel, the quick look, or the company record. On the record, a third of the content sits in its own second level behind the company record's doors, and nothing sits deeper than that.

**Across the four businesses.** Fathom, admin: the hand-off strip is absent; "Agent-proposed next step" is a visible row action; owner is a level-two column. Halyard, admin: the same as Fathom, and the page mostly shows its empty state. Ridgeline, CS: seats (active of bought), usage 30 days and expansion signals become level-one columns, and join the quick look; the company record puts usage over 90 days and the seat list directly under the field grid; "Add to campaign" is a visible row action. Ridgeline, AE: signals, seats, usage and deals at level one, sorted by signals; pricing-page visits are named in the signals column.

**Doors.**

| Label | Container | Content behind it |
|---|---|---|
| Open (row, Enter) | Quick look: a flat drawer beside the table, focus-trapped, Esc returns | Health and band with its 30-day change, **the four health drivers as flat lines under it**, renewal and days left, contract value, open risks, last touch, champion, owner, next step. The same fields, labels and order as the top of the company record. No sections, no doors, only the next step editable |
| Open the company record (quick-look footer, `o`, or the account name) | The company record at `/ollopa/companies/:id`, with a deep link that can be shared. `/ollopa/accounts/:id` redirects there | Everything: the field grid with the customer-state fields, then health drivers, renewal terms, first value and goals, risks, signals, the hand-off brief, touches and timeline, usage over 90 days, seats, contacts, deals and notes as scrolling sections. The doors are that record's doors, defined in [09](09-deal-record.md) §6.8 |
| Signals and news · n | In place, under the row | What fired, when, from where, the routed owner and the due date. Removed where nothing has fired |
| Run a play | Panel on its own channel, flat, no doors inside | The play, what it will create before the button, the owner, the routing band and SLA for an expansion, the recheck date |
| Columns: plan, seats, usage, champion, forecast, notice period, CRM sync (7) | Popover on the table header | The level-two columns for this role and business, with a count |
| Additional filters: risk type, plan, churned accounts (3) | In place, under the filter row | The three filters named in the label |
| Renewal deal, expansion deal, email champion, book review, change owner, add to campaign, push to CRM, mark churned, remove | Row menu, the "…" button named for that list | Those actions in that order, the two destructive ones below a divider with their consequences beside them |
| The company record's doors | On that record, per [09](09-deal-record.md) §6.8 | Long content that is rarely needed beside the rest. This spec does not define them; it reads them |
| Hand-offs waiting for you (n) | In place, above the table | The hand-offs with from, sent, why they bought, Accept |

Every door has a chevron and text, sits next to what it reveals, and is removed when it has nothing behind it: no hand-off strip without hand-offs, no "Add to campaign" without campaigns, no CRM items at Fathom, no signals door where nothing has fired. **No label in this page begins with "More".** The filter and column doors are "Additional filters: …" and "Columns: …", each followed by its contents and a count, because "More" names nothing and a door labelled by nothing is a door nobody opens on purpose.

**Persistence.** Filters, sort, chosen columns, the hand-off strip's open state and each company-record door's state are remembered per user per workspace, the way the record template does it for every record. The quick look has nothing to remember: it is flat and it opens where the row is. "Expand all" and "Collapse all" sit at the top of the company record's doors; print expands them and prints the sections in order.

**Accelerators.** The shortcuts in section 3; the palette shows each one; saved views for the two or three cuts a CSM repeats; "keep the quick look open while I move rows" as a remembered preference, which is what makes scanning fifty renewals fast. The shortcut printed in the palette is a floor rather than a teacher — hints do not teach, exposure does ([11 What changed](../knowledge-base/11-what-changed-2018-2026.md), rule 8) — so the quick look itself is the thing that carries a CSM into the company record.

**Decision-critical.** Renewal date and days left, contract value, open risks with any churn notice written out, value at risk, and hand-offs waiting. The health drivers, which never sit across a door from the score they sum to. What a play will create, before the button. What accepting a hand-off does, before the button — including that the health baseline is taken today and the sending AE is told. All visible without a click at every business, including Halyard, where they read zero. Mark churned and Remove account state their consequence on the confirm step and put undo in the notification.

**Removed rather than hidden.** New account and Import CSV (accounts come from closed-won deals or a stage change on Companies); Enrich, Find people and Add to sequence (they belong on Companies and People); Suggested leads and Similar companies; per-user layouts; a Recommendations tab; the eleven-tab record, replaced by the company record's sections and doors; **a second record page for the account**, which was a second version of one object; NPS and support tickets (outside the boundary — an escalation is a risk of type Escalation, and nothing hints at a ticket integration); any door called Advanced, More, More columns, More actions or Other.

**Score.**

1. Decision-critical visible: renewal, value, risks, value at risk, hand-offs all level one. 2.
2. Usage-backed: every visible item has a number in `accounts.ts` with USAGE-MODEL.md as the source. 2.
3. Two levels: table to quick look is one level and table to the company record is one level; the signals row door and the play panel are each one level from the table; the record to one of its doors is the second; the quick look is flat, so it can never be a level of its own, and the four health drivers are lines inside it rather than a door. An earlier draft put fifteen collapsing sections inside the drawer, which was a door inside a door and was fixed by moving them to the record, not by renaming them. 2.
4. Doors labelled by content with chevron and text, counts where useful; the three doors previously called "More columns", "More filters" and "More actions" now name what they hold, and the last survival of the word "More" is gone from the filter door. 2.
5. Doors adjacent and keyboard-reachable; row actions on focus; nothing hover-only. 2.
6. Dependent fields together: renewal date, value, terms and forecast in one section; risk type, note and owner in one form; next step read and set in one cell; the health score and the four drivers that sum to it, in the quick look and on the record; first value beside the target it is measured against. 2.
7. State persists; expand all and print exist. 2.
8. Disclosure by user action or object state (hand-off strip, lapsed renewals, churn notice, the ribbon on a churned or unsyncing account); nothing reorders from history. 2.
9. Door usage instrumented per role and business; the promote-keep-delete review is twice a year with the rest of the product. 1: the review exists on paper; the page has not been through one.

Total 17 of 18.

## 7. Lesson steps

Accounts is a real page, not a lesson. The rules that mattered most:

- **Rule 1.** The list is the product: health, renewal, risks, last touch and next step in the row, because a CSM reads them every day; seats and usage join the row only at Ridgeline, where they are read every day.
- **Rule 7.** Renewal date, value, risks and pending hand-offs never sit behind a door, even at Halyard where they are zero.
- **Rule 4.** No "Recommendations" bulb, no hover-only visit icon that vanishes when empty, and no door called More, More columns or More actions; every door is named for its contents and removed when empty.
- **Rule 5.** A score always travels with its reasons; a renewal date always travels with its value and terms; a hand-off always travels with why they bought.
- **Rule 2.** An account is a record, so it gets the record's two levels: a flat quick look for scanning and a full page for dwelling, the same template the deal, contact and company pages use. The fifteen collapsing sections that once lived in the drawer are sections on that page.

## 8. Review

| Check | Gap found | How it was closed |
|---|---|---|
| All roles covered | SDR and marketer had no line | Added: no access, the shell's page names the roles and the admin |
| All four businesses | Halyard's use of the page was undefined | Defined: clients are workspaces; the page holds a client's own customers; empty state written |
| Every field has a source | Health, renewal, seats, risks, signals, hand-offs are not in the seed | Section 2 specifies the `Account` collection, the formula and the deterministic rules |
| Every action has an outcome | Mark churned and Remove had no stated consequence | Consequence written on the confirm step; undo in the notification |
| Empty, error, no access | Halyard empty state and row-level CRM errors were missing | Both written |
| Keyboard | Counters had no shortcut | `1`, `2`, `3` added; palette lists everything |
| Phone width | Table would have hidden columns three deep | Cards, a full-height quick look, and the record page as one column; two levels kept |
| Decision-critical visible | Value at risk had 18% use and would have dropped to level two | Marked critical; six items in total |
| Two levels maximum | The drawer held fifteen collapsible sections: page to drawer to section is three levels, and calling them headings did not change what they were | Closed properly: the drawer became the flat quick look, and everything it used to hold moved onto the company record from the shared template, where sections are sections |
| Doors labelled by content | Three doors were called "More columns", "More filters" and "More actions", which rule 4's own test forbids | All three renamed to list their contents, with counts; the row menu's button carries the same list as its accessible name |
| Dependent fields together | Next step was two items, read and set | Merged into one in-place cell |
| State persists | Not specified for the hand-off strip | Added to persistence |
| Accelerators | None for the counters | Shortcuts and saved views added |
| Usage shape | Ridgeline CS head reached 41% on the first pass | Trimmed to 30% by moving plan, dismiss, campaign, agent and timeline to body. After six items arrived in the apply pass it is 34% and Meridian's CS is at 25%; the overshoot is stated and justified, not re-rated |
| One record per object | This spec built an account record page at `/ollopa/accounts/:id`, a second record for an object that PLAN.md says is one object with a customer state | Closed: the company record renders the customer-state fields and sections when `Company.stage` is Current client or Churned and removes them otherwise; `/ollopa/accounts/:id` redirects there; Accounts stays a page with its own table, quick look and row actions, and the record template stays owned by [09](09-deal-record.md) |
| A score with its reasons | The four health drivers were a door on the table and the record, so the score and the reasons that sum to it sat on opposite sides of one | Closed: flat lines under the health field in the quick look, a section on the record, and a stated rule-5 exception in `accounts.ts` |
| Onboarding has an end | Nothing defined first value, so C2 could not be completed and no risk could fire for a stalled onboarding | Closed: `firstValue` and `goals[]` on the account, the Onboarding stalled risk type, and the shipped signal "No first-value milestone in 90 days" in Settings |
| A signal that reaches nobody | `AccountSignal` recorded what fired but not who it went to, when it was due, or what came of it | Closed: `routedTo`, `dueBy` and `outcome`, a "Signals and news · n" row door that shows them, and expansion routing that creates a typed deal and a task for its new owner |
| A play has a consequence | Log touch, Add risk and Add note were three separate controls and nothing said what a risk play would do | Closed: `X-play`, with what it will create stated before the button and agent-drafted content logged rather than queued |
| The hand-off says what it costs | Accept's effect was written as a result, after the fact, and the brief had five fields | Closed: the consequence sits on the button at both places it appears, including that the baseline is taken today and the AE is told; the brief has seven named sections, each showing who wrote it |
| Boundary honoured | Nothing said what happens to a support escalation, so a reader could assume a ticket integration was coming | Closed: one line stating that tickets are outside the boundary and an escalation is a risk of that type |
| The sidebar is declared | Nothing said that Fathom and Halyard leave Accounts out of the sidebar | Closed: one line in section 1, with the two-week exposure on the first closed-won deal and the single "keep it?" |
| Nothing hover-only | Row actions are hover-revealed in the template | They also show on focus and repeat in the menu; on touch the menu is always visible |
| Role gaps explain themselves | Fathom and Halyard lacked the hand-off strip silently | Removed with the reason recorded here; nothing is missing for those users, so the product has nothing to explain |
| No usage numbers or teaching text in the product | The Halyard empty state read like a lesson | Rewritten as a statement of fact |
