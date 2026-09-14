# 14. Settings

*Full page. Lesson 1. The whole settings inventory of Ollopa on one page, laid out by the usage model for the signed-in role and business.*

## 1. Purpose

Settings is where a workspace is configured and where the money is. It holds every one of the roughly 45 items in the inventory in PRODUCT.md (59 usage items in `src/ollopa/usage/settings.ts`, because the code counts security and mailbox sub-settings separately), grouped in nine areas: Workspace; Team and access; Email sending; Prospecting rules; Pipeline and data; Sequences; Agents and AI; Integrations; Plan, billing and usage.

Who lives here:

| Role | How often | What they come for |
|---|---|---|
| RevOps admin (Meridian, Ridgeline) | Weekly | Users joining and leaving, mailbox health, CRM sync errors, agent limits, credit burn, the plan |
| Agency ops lead (Halyard, admin role) | Daily | The same items, ten workspaces over, plus workspace name, timezone, currency and sending domains that are rare elsewhere |
| Founder (Fathom, admin role) | Weekly, credits daily | Mailboxes and warm-up, which agents are on, credit burn against a small balance, the price |
| SDR, AE, marketer, customer success | Monthly or less; SDRs weekly for mailboxes | Their own mailboxes, signature, tracking, credit usage; company context for the marketer |

The one thing nobody on this page may lose sight of: **what the workspace costs and what can spend or stop it on its own.** Price and renewal date, credit balance and burn rate, bounce guard status, what agents may do without a human, agent credit caps, cancel plan and delete workspace are visible the moment the page opens, for anyone whose role has them, without a click.

## 2. Data

### 2.1 What exists in the seed

| Field shown | Source |
|---|---|
| Business name, size, tagline | `businesses.ts` → `name`, `size`, `tagline` |
| Signed-in user, title, initials; the admin's name for role-gap sentences | `businesses.ts` → `roles[]` (`user`, `title`, `initials`) |
| Plan name, seats, price per seat, billing period, renewal date | `businesses.ts` → `plan` |
| Credit balance, monthly cap, burn per week | `businesses.ts` → `credits` |
| Counts: users, contacts, companies, sequences, open deals, campaigns, integrations, agents | `businesses.ts` → `counts` |
| Pipeline stages with probability | `seed.ts` → `DEAL_STAGES` and the probability map (Qualified 10, Discovery 25, Proposal 50, Negotiation 75, Closed won 100) |
| Contact stages | `seed.ts` → `STAGES` |
| Account stages | `seed.ts` → `Company.stage` values (Cold, Active opportunity, Current client, Churned) |
| Agent names | `seed.ts` → `AgentEvent.agent` (Research agent, Outreach agent, Scoring agent); which exist per business from `counts.agents` (Fathom and Halyard: Research and Outreach; Meridian and Ridgeline: all three) |
| Items waiting for approval | `seed.ts` → `agentEvents` where `needsApproval` |
| Sequences named in schedules and rulesets | `seed.ts` → `sequences` |
| Weekly use, level, critical flag per item | `usage/settings.ts` via `weeklyUse`, `levelOf` |

Derived on the page, not stored:

- Monthly price = seats × price per seat. Meridian: 42 × $79 = $3,318 a month, billed annually ($39,816 a year), renews 15 Jan 2027. Fathom: 3 × $49 = $147 a month, billed monthly, renews 2 Oct 2026. Halyard: 25 × $79 = $1,975 a month, billed annually, renews 30 Nov 2026. Ridgeline: 14 × $79 = $1,106 a month, billed annually, renews 8 Mar 2027.
- Credit run-out date = today + balance ÷ burn per week. Meridian: about 14 Oct. Fathom: about 26 Sep, which is before the 2 Oct renewal, so it is shown as a warning. Halyard: about 30 Sep, the day the monthly credit cycle ends, also a warning. Ridgeline: about 22 Oct, fine.
- Credit cycle end = the renewal day of month, monthly, for every plan.

### 2.2 What must be added to the seed

One `settings` object per business in `src/ollopa/data/settings.ts`, deterministic, generated with the same `rng` seeds. Fields per area, then the values that differ by business.

| Area | Fields to add |
|---|---|
| Workspace | name, logo initials, timezone, currency, language |
| Team | users (name, title, role, profile, status, credit limit, credits used this month, last active), teams, permission profiles, security (MFA enforced, SSO provider, IP allowlist, password policy, session timeout) |
| Email sending | mailboxes (address, owner, provider, warm-up state and day, daily and hourly limit, sent today, deliverability, 7-day bounce rate, paused), domains (SPF, DKIM, DMARC, bounce rate, mailbox count), tracking subdomain, bounce guard (on, warning 4%, pause 6%, 7-day rate and volume, paused mailboxes), catch-all blocking, unsubscribe text and whether users may disable it, open and click tracking |
| Prospecting | GDPR regions, DNC countries, primary email type, duplicate handling, in-progress limit, territories |
| Pipeline and data | pipelines (stages from `DEAL_STAGES` with probability and forecast category), contact and account stages, custom fields per object, deal currency and multi-currency, enrichment provider order |
| Sequences | schedules, rulesets, priority |
| Agents and AI | company context, agents on or off, approval rules per agent (research, draft, add to sequence, send, spend), per-run and monthly caps per agent, own model key |
| Integrations | connected list (name, kind, status, last sync, error count), sync conditions, field mapping, error log, calendar, Slack, enrichment provider, API keys, webhooks |
| Plan | invoices, tax ID, export status |

| | Meridian | Fathom | Halyard (current client workspace) | Ridgeline |
|---|---|---|---|---|
| Workspace | Meridian Software, Europe/Berlin, EUR | Fathom Labs, America/New_York, USD | Kestrel Health (client), Europe/London, GBP | Ridgeline, America/Los_Angeles, USD |
| Team | 42 users (5 from `roles[]`, 37 generated); 4 teams; 5 profiles; MFA enforced; SSO Okta; 2 IP ranges | 3 users, all Admin; no teams, profiles or SSO; MFA optional | 25 users, 6 with mailboxes here; 2 teams; 2 profiles; MFA enforced; no SSO | 14 users; 2 teams; 5 profiles; SSO Google |
| Email | 34 mailboxes; 3 domains, all records green; bounce 1.9% of 14,200, none paused; users may not disable unsubscribe text | 3 mailboxes, all warming; fathomlabs.com, DMARC missing; bounce 3.6% of 620, near warning; users may disable | 6 mailboxes on 2 client domains; bounce 4.4% of 9,800, warning; 1 mailbox paused at 6.2% | 9 mailboxes; 1 domain; bounce 0.8% of 410; tracking off |
| Prospecting | EU and UK restricted; DNC US, UK, DE, FR; business email; prompt on duplicate; 5 per account; 3 territories | EU; DNC US; any email; auto-merge; 3 per account; no territories | EU and UK; 4 per account; 2 client territories | EU; auto-merge; 2 per account; no territories |
| Pipeline | 2 pipelines; 14 custom fields; EUR, multi-currency on; Northlight Data → Beacon Verify → Ollopa | 1 pipeline; 3 fields; Northlight Data → Ollopa | 1 pipeline; 6 fields | 2 pipelines; 9 fields; Northlight Data → Beacon Verify |
| Sequences | 3 schedules, 2 rulesets | 1 and 1 | 4 client-hour schedules, 2 rulesets | 1 and 1 |
| Agents | 3 on; research and draft free, add-to-sequence and send need approval; caps Research 40/run and 300k a month, Outreach 10 and 60k, Scoring 2 and 40k | 2 on; same approvals; Research 25 and 3,000, Outreach 5 and 800 | 2 on; Research 30 and 80k, Outreach 8 and 20k | Scoring and Research on, Outreach off; Research 20 and 60k, Scoring 2 and 30k |
| Integrations | HubSpot (3 errors, synced 4 min ago), Google Workspace mail, Google Calendar, Slack, Northlight Data; 2 API keys; 1 webhook | Google Workspace mail, Northlight Data; no CRM | Google Workspace mail; no CRM | Salesforce (0 errors), Google Calendar, Slack, Northlight Data |
| Plan | 12 invoices; DE tax ID | 4 invoices | 12 invoices; GB tax ID | 6 invoices |

Per-user credits used this month are generated as shares of `monthlyCap − balance`, weighted to SDRs.

## 3. Features

### 3.1 Shape of the page

One page inside the main navigation. No separate settings shell, no settings sidebar. Three parts, top to bottom:

1. **Header row.** Title "Settings", the workspace name, and the settings search box (`Find a setting…`, shortcut `/`). To its right: "Expand all" / "Collapse all".
2. **The strip.** Decision-critical facts for this role, always visible, no door. See 3.3.
3. **Areas.** For the signed-in role, "You" first (personal settings), then the workspace areas in the fixed inventory order. On desktop a sticky in-page index on the left lists the areas as anchors; it is a table of contents, not navigation to other pages.

Each area has a heading, its level-one rows, and at most one door. The door is a button with a chevron, a content label and a count: `▸ Tracking subdomain, catch-all blocking, unsubscribe text, open and click tracking (4 settings)`. When every item in an area is level two, the door sits directly under the heading and carries the whole list. When nothing is behind the door, there is no door.

A setting row has the label on the left, the control or the current value on the right, and where the value has a consequence, one line of plain text under it ("Auto-pause stops every mailbox on the domain until you resume it").

### 3.2 Personal versus workspace

Every role gets "You": name, title, login email, password, multi-factor authentication for your own account. Then the personal items from the inventory: your mailboxes (with warm-up and limits), your signature, your open and click tracking, your unsubscribe text, your calendar, your credit usage against your limit, and what agents may do without your approval. An item is on the page for a role when the usage model has a number for that role; an item whose number is 0 at a business is removed for that business (Fathom has no teams, no permission profiles, no SSO, no territories).

Roles without workspace access see, after their own settings, one sentence: "Workspace settings (team, email domains, prospecting rules, pipeline, agents, integrations, plan and billing) are managed by Daniel Okafor, RevOps admin." The name comes from the business's admin seat. No greyed-out sections, no locked rows.

Where a personal value is set by the admin and not editable (Meridian SDRs cannot change their own daily limit), the row shows the value as text with "set by Daniel Okafor" and a link that opens the settings search on that admin item. It is never a disabled input.

### 3.3 The strip (decision-critical, rule 7)

For admins, one bar under the header with:

- **Plan and price.** "Growth · 42 seats · $3,318 a month, billed annually · renews 15 Jan 2027". Two links of equal weight next to it: **Change plan** and **Cancel plan**. Cancel opens a confirmation that states the end date and what happens to data; no reason picker, no "keep my plan" detour.
- **Credits.** "1.84M of 2.5M left this month · 410k a week · lasts to about 14 Oct". When the run-out date is before the cycle end, the text turns to warning colour and says "runs out before 15 Oct". Fathom reads "4,120 of 10,000 · 2,300 a week · runs out about 26 Sep, before renewal on 2 Oct".
- **Bounce guard.** "On · 1.9% of 14,200 in 7 days · warns at 4%, pauses at 6% · nothing paused". Halyard reads "Warning · 4.4% of 9,800 · 1 mailbox paused".
- **Agents.** "3 on · send and add-to-sequence need approval · caps 300k / 60k / 40k a month · 4 waiting for approval → Agents".
- **Delete workspace** is not in the strip. It is at level one at the foot of the Plan area, with its consequence written out and "Export all data" beside it, and the index and the search jump straight to it. Nothing hides it; it is one scroll away, not one click away.

For SDRs, AEs, marketers and CS, the strip is shorter: your credit usage and limit, bounce guard status for your mailboxes, and what agents may do without your approval where the role has it. Price, cancel and delete are not shown to roles that cannot act on them; the workspace sentence in 3.2 names who can.

### 3.4 Actions

| Where | Action | Outcome |
|---|---|---|
| Any row | Change a value | Row marked changed; the Save bar appears (3.5) |
| Strip | Change plan | The plan page: seats stepper, plan cards, a price summary that stays on screen with "Due today"; returns here |
| Strip | Cancel plan | Dialog stating end date, seats and what is kept for 30 days; "Cancel plan" and "Keep plan" the same size |
| You | Change password, set up MFA | Inline forms in the row |
| Team | Invite people | Dialog: emails, permission profile, credit limit; the users table updates |
| Team | Open users table | `/settings/users`: name, title, profile, teams, credit limit editable in the row, used this month, last active, status; row actions Edit profile and Deactivate; search and filters as in TablePage |
| Team | Teams, permission profiles | Drawer: list on top, one flat form beneath, one Save |
| Email | Mailboxes table | Warm-up toggle and both limits editable in the row; "Edit" opens a flat drawer (signature, tracking subdomain, unlink with a forwarding choice); "Link a mailbox" starts the wizard |
| Email | Sending domains | "DNS records" opens a drawer with SPF, DKIM and DMARC values and copy buttons |
| Email | Bounce guard | Thresholds editable in the row for admins; current rate and paused mailboxes in the same row |
| Prospecting, Pipeline, Sequences | Lists (territories, pipelines, fields, schedules, rulesets) | Add, rename, reorder and delete in a drawer; delete says what depends on the item ("2 sequences use this schedule") |
| Agents | On or off, approvals, caps | Inline; enabling "send without approval" shows its consequence line before Save |
| Integrations | CRM sync row | Status, last sync, error count; drawers for the error log (with retry), sync conditions and field mapping |
| Integrations | Connect an integration | The wizard page (spec 15) |
| Plan | Export all data | Progress in the row, then a download link and a mail |
| Plan | Delete workspace | Dialog: type the workspace name; lists what is deleted (18,400 contacts, 26 sequences, 42 users' data) and the 14-day grace; "Export first" link inside |

Every change confirms in a toast, with Undo where undo is possible.

### 3.5 One Save convention

Nothing on this page saves on its own. A change marks its row and raises one sticky bar at the bottom of the viewport: "3 unsaved changes: daily limit (Marcus Adeyemi), bounce guard auto-pause, timezone · Save · Discard". The bar lists what will be saved, so a change inside a door you have since closed is not forgotten. Drawers are forms with one Save at the foot; Escape asks before discarding a dirty drawer. Leaving the page with unsaved changes asks once. There are no per-card Save buttons and no page-level Save that competes with them.

### 3.6 Search

The settings search matches labels, area names and synonyms ("MFA", "two-factor", "2FA" all find multi-factor authentication) and shows results as `Area › Setting` with the current value. Choosing a result scrolls to the setting, opens its door if it is closed, moves focus to the control and highlights the row for two seconds. It never opens a different page unless the setting lives on one (Users table, plan page), and then it says so in the result. The same entries appear in the global ⌘K palette prefixed "Settings ›", each showing the `/` shortcut, so the palette teaches the page-level shortcut. For roles without an item, the search shows the sentence from 3.2 instead of an empty result.

### 3.7 Sorting, filters and columns

The mailboxes table and the users table have a search box and filters (mailboxes: owner, domain, warm-up state, paused; users: profile, team, status). Columns are fixed; there is no column picker. Rows sort by the column headers. The tables show 10 rows and a "Show 10 more" button, as in TablePage. No table needs horizontal scrolling at desktop width; the sent-versus-limit figure is one column, not a cell that must be found by zooming.

### 3.8 States

| State | What the page does |
|---|---|
| Empty | An area with nothing configured shows the honest sentence and the action: "No CRM connected · Connect one" (Fathom, Halyard); "No sending domains yet · Add a domain"; "No territories: everyone can prospect everywhere" |
| Loading | Skeleton rows for the strip and tables; the header and index render at once; never a spinner alone |
| Error | Row-level: "Couldn't refresh mailbox health; showing values from 2 minutes ago · Retry". The rest of the page works. A failed Save keeps the bar up with the error under it |
| No access | A role that opens Settings sees its own settings; workspace areas are absent and the sentence in 3.2 names the admin. A deep link to a workspace setting (`#mail.bounce-guard`) from a non-admin shows the personal page with a banner: "Bounce guard thresholds are set by Daniel Okafor, RevOps admin" |
| Unsaved | Sticky bar; leaving asks once |

### 3.9 Keyboard and shortcuts

- `/` focuses the settings search; arrow keys move through results; Enter jumps; Escape returns focus to where it was.
- Door headers are `button`s inside headings with `aria-expanded` and `aria-controls`; Enter and Space toggle; focus moves into the revealed region when it holds more than a screen.
- Tab order follows the reading order: strip, You, areas in inventory order.
- Tables: Tab reaches each row's controls; row actions are visible on focus as well as hover and are repeated in the row's "…" menu.
- Drawers trap focus, close on Escape, and return focus to the row that opened them.
- Expand all and Collapse all are buttons; print expands every door.

### 3.10 Accessibility

Every control has a visible label. Status colours (warning, paused) are paired with words. Door state is announced. Toasts use a polite live region; a failed Save uses an assertive one. Hit targets are at least 40 px. Nothing is hover-only. Reduced motion replaces the reveal animation with a crossfade.

### 3.11 Phone width

One column. The index becomes a "Jump to" select under the header. The strip stacks its four facts as lines. Tables become cards (mailbox: address, owner, warm-up, limits editable, sent today); the users table page remains a table inside its own horizontal-scroll container. Drawers become full-height sheets. The door depth is the same as on desktop: one door, never a second. The Save bar stays sticky.

### 3.12 By role and business

| | Meridian admin | Halyard admin | Meridian SDR | Fathom founder (admin) |
|---|---|---|---|---|
| Strip | Price, credits, bounce guard, agents, cancel | Same; bounce guard in warning, 1 paused | Own credits (8,400 of 25,000), bounce guard status for own mailboxes, agent approvals | Renewal in 19 days; credits run out before it (warning); bounce guard near warning; agents |
| Workspace | Door: all five | Name, timezone, currency at level one; door: logo, language | Absent | Door: all five |
| Team | Users at level one; door: teams, profiles, five security items | Same | Absent | Door only: users (3 of 3 seats) and four security items; teams, profiles, SSO removed |
| Email | Mailboxes (warm-up and limits in the row), domains, bounce guard at level one; door: tracking subdomain, catch-all, unsubscribe pair, tracking | Same | Own mailboxes; limits read-only, "set by Daniel Okafor"; door: signature, tracking, unsubscribe text | Mailboxes, warm-up, limits, bounce guard at level one; domains join the door |
| Prospecting | Door: all six | Same | Door: primary email type, in-progress limit, read-only | Door: five; territories removed |
| Pipeline | Door: all five | Same | Door: enrichment order, read-only | Door: all five |
| Sequences | Door: schedules, rulesets | Same | Door: schedules, rulesets, priority | Same as Meridian |
| Agents | On or off, approvals, caps at level one; door: context, own key | Same | Approvals at level one, read-only; door: which agents are on | Same as Meridian |
| Integrations | CRM sync with error count at level one; door: six | "No CRM connected · Connect one" at level one; door: six | Door: calendar | Door: all, CRM shown as "none" |
| Plan | Strip; Change and Cancel; Delete and Export at level one; door: invoices, tax ID | Same | Own credits only | Same as Meridian |

AEs see You, own mailboxes (level one at Meridian, door at Ridgeline), credits, and a door with signature, tracking, pipeline stages and custom fields read-only, calendar, default currency. Marketers see You, company context at level one, credits, and a door with tracking, custom fields, signature. Customer success sees You, credits, and a door with signature and calendar. Ridgeline's admin sees mailboxes, warm-up, limits and domains drop into the Email door; Users, CRM, agents and the strip stay.

## 4. Usage items

Weekly use is the share of active users in a role at a business who touch the item in a typical week (USAGE-MODEL.md). Baseline is Meridian. "–" means the item is not on the page for that role. Overrides are per business; 0 removes the item at that business. Items marked critical are level one regardless of use, for the roles that have them.

| Id | Area | Item | Admin | SDR | AE | Mkt | CS | Overrides | Critical |
|---|---|---|---|---|---|---|---|---|---|
| me.profile | You | Name, title, login email, password | 3 | 3 | 3 | 3 | 3 | | |
| me.mfa | You | Multi-factor authentication for your account | 1 | 1 | 1 | 1 | 1 | | |
| ws.name | Workspace | Workspace name | 2 | – | – | – | – | Halyard: admin 40 | |
| ws.logo | Workspace | Logo | 1 | – | – | – | – | Halyard: admin 15 | |
| ws.timezone | Workspace | Timezone | 3 | – | – | – | – | Halyard: admin 35 | |
| ws.currency | Workspace | Default currency | 2 | – | 1 | – | – | Halyard: admin 25 | |
| ws.language | Workspace | Language | 1 | – | – | – | – | | |
| team.users | Team and access | Users | 45 | – | – | – | – | Halyard: admin 30; Fathom: admin 6 | |
| team.teams | Team and access | Teams | 10 | – | – | – | – | Fathom: admin 0 | |
| team.profiles | Team and access | Permission profiles | 8 | – | – | – | – | Fathom: admin 0 | |
| sec.mfa | Team and access | Multi-factor authentication | 3 | – | – | – | – | | |
| sec.sso | Team and access | Single sign-on | 2 | – | – | – | – | Fathom: admin 0 | |
| sec.ip | Team and access | IP allowlist | 1 | – | – | – | – | | |
| sec.password | Team and access | Password policy | 1 | – | – | – | – | | |
| sec.session | Team and access | Session timeout | 1 | – | – | – | – | | |
| mail.mailboxes | Email sending | Mailboxes | 40 | 60 | 25 | – | – | Halyard: admin 70, sdr 65; Fathom: admin 50, sdr 60; Ridgeline: sdr 20, ae 10, admin 15 | |
| mail.warmup | Email sending | Warm-up | 25 | 30 | – | – | – | Halyard: admin 55, sdr 40; Ridgeline: sdr 5, admin 5 | |
| mail.limits | Email sending | Daily and hourly sending limits | 30 | 20 | – | – | – | Halyard: admin 50, sdr 30; Ridgeline: sdr 4, admin 6 | |
| mail.signature | Email sending | Email signature | 2 | 5 | 5 | 2 | 3 | | |
| mail.domains | Email sending | Sending domains | 20 | – | – | – | – | Halyard: admin 45; Fathom: admin 10; Ridgeline: admin 6 | |
| mail.tracking-subdomain | Email sending | Tracking subdomain | 2 | – | – | – | – | | |
| mail.bounce-guard | Email sending | Bounce guard | 35 | 15 | – | – | – | | yes |
| mail.catch-all | Email sending | Block catch-all domains | 5 | – | – | – | – | | |
| mail.unsubscribe-text | Email sending | Unsubscribe text | 3 | 2 | – | – | – | | |
| mail.unsubscribe-permission | Email sending | Users may disable the unsubscribe text | 2 | – | – | – | – | | |
| mail.tracking | Email sending | Open and click tracking | 4 | 8 | 6 | 10 | – | | |
| pros.gdpr | Prospecting rules | GDPR restrictions by region | 4 | – | – | – | – | | |
| pros.dnc | Prospecting rules | Do-not-call screening | 3 | – | – | – | – | | |
| pros.primary-email | Prospecting rules | Primary email type | 2 | 3 | – | – | – | | |
| pros.duplicates | Prospecting rules | Duplicate handling | 6 | – | – | – | – | | |
| pros.in-progress | Prospecting rules | In-progress limit per account | 8 | 6 | – | – | – | | |
| pros.territories | Prospecting rules | Territories | 12 | – | – | – | – | Fathom: admin 0; Halyard: admin 4 | |
| pipe.stages | Pipeline and data | Pipelines and stages | 10 | – | 6 | – | – | Fathom: admin 12 | |
| pipe.contact-stages | Pipeline and data | Contact and account stages | 6 | – | – | – | – | | |
| pipe.fields | Pipeline and data | Custom fields | 15 | – | 4 | 4 | – | | |
| pipe.currency | Pipeline and data | Deal currency | 2 | – | – | – | – | | |
| pipe.enrichment-order | Pipeline and data | Enrichment provider order | 12 | 4 | – | – | – | Ridgeline: admin 5 | |
| seq.schedules | Sequences | Sending schedules | 8 | 12 | – | – | – | Ridgeline: sdr 4, admin 2; Halyard: sdr 20, admin 15 | |
| seq.rulesets | Sequences | Sequence rulesets | 6 | 4 | – | – | – | Ridgeline: admin 1 | |
| seq.priority | Sequences | Sequence priority | – | 3 | – | – | – | | |
| ai.context | Agents and AI | Company context | 10 | – | – | 20 | – | Ridgeline: marketer 30; Fathom: admin 15 | |
| ai.agents | Agents and AI | Agents on or off | 25 | 10 | – | – | – | Fathom: admin 40 | |
| ai.approvals | Agents and AI | What agents may do without approval | 30 | 8 | – | – | – | | yes |
| ai.credit-caps | Agents and AI | Agent credit caps | 35 | – | – | – | – | | yes |
| ai.own-key | Agents and AI | Bring your own model key | 2 | – | – | – | – | | |
| int.crm | Integrations | CRM sync | 40 | – | – | – | – | Fathom: admin 5; Halyard: admin 25 | |
| int.field-mapping | Integrations | CRM field mapping | 15 | – | – | – | – | Fathom: admin 2 | |
| int.error-log | Integrations | Sync error log | 30 | – | – | – | – | Fathom: admin 3 | |
| int.calendar | Integrations | Calendar | 3 | 5 | 5 | – | 4 | | |
| int.slack | Integrations | Slack | 5 | – | – | – | – | | |
| int.enrichment | Integrations | Enrichment provider | 6 | – | – | – | – | | |
| int.api-keys | Integrations | API keys | 6 | – | – | – | – | | |
| int.webhooks | Integrations | Webhooks | 4 | – | – | – | – | | |
| plan.seats | Plan, billing and usage | Plan and seats | 20 | – | – | – | – | Halyard: admin 30; Fathom: admin 15 | |
| plan.price | Plan, billing and usage | Price and renewal date | 25 | – | – | – | – | | yes |
| plan.credits | Plan, billing and usage | Credit balance and burn rate | 55 | 30 | 15 | 20 | 5 | Fathom: admin 60, sdr 40 | yes |
| plan.invoices | Plan, billing and usage | Invoices | 8 | – | – | – | – | | |
| plan.tax-id | Plan, billing and usage | Tax ID | 1 | – | – | – | – | | |
| plan.cancel | Plan, billing and usage | Cancel plan | 1 | – | – | – | – | | yes |
| plan.export | Plan, billing and usage | Export all data | 2 | – | – | – | – | | |
| plan.delete | Plan, billing and usage | Delete workspace | 0.5 | – | – | – | – | | yes |

The two "You" rows are the personal profile block from 3.2; the other 59 rows are `settings.ts` as it stands. "Plan and seats" and "Export all data" sit at level one for reasons other than use: the cancel path must be no longer than the subscribe path (rule 7), and export is the action delete depends on (rule 5).

Shape check, over the items that exist for the role at the business:

| Pair | Items | Head | Body | Tail | Verdict |
|---|---|---|---|---|---|
| Meridian admin | 58 | 14 (24%) | 18 (31%) | 26 (45%) | Fits: head 15–25, body 25–35, tail 45–60 |
| Fathom admin | 54 | 9 (17%) | 18 (33%) | 27 (50%) | Fits |
| Halyard admin | 58 | 17 (29%) | 18 (31%) | 23 (40%) | Head four points over the band. Expected: the agency is the customer whose rare settings are routine. Kept, and named as the stretch case |
| Meridian SDR | 17 | 4 (24%) | 8 (47%) | 5 (29%) | Head fits; a personal page has a short tail because the workspace tail is not on it |
| Ridgeline admin | 58 | 10 (17%) | 20 (34%) | 28 (48%) | Fits |

Level one for Meridian admin, counting critical items: 16 of 58. For Halyard admin 19, Fathom admin 11, Meridian SDR 6 (three by use, three critical).

## 5. Before: the common version

The common version is a faithful parody of Apollo's settings as documented in `knowledge-base/sources/07-apollo-settings-map.md` (the memo), trimmed to Ollopa's boundary: no dialer, conversations, meetings or extension pages, because Ollopa does not have those products. Everything else is kept, including the mistakes. Every problem below names its section in the memo, which cites the Apollo knowledge-base article or review.

### 5.1 Layout

Clicking Settings leaves the app. The main navigation is replaced by a settings shell: a 300 px left sidebar with a "← Settings" back link, a search box, and two grey group labels, Personal settings and Workspace settings. The landing page is not a settings page; it is "Get started", an onboarding checklist with four progress rings ("Set up a team 3/5 complete") and accordions of tasks with "Learn more" links. Memo §1.1 and §6 ("there is no top-level settings dashboard; the default landing page is Get started or the last page visited").

The sidebar, top to bottom:

- Get started
- Personal settings: Profile · Mailboxes & domains · Notifications
- Workspace settings: Workspace overview · Email setup and health ▾ (Overview, Domains, Marketing domains, Mailboxes, Bounce logs, Sending policies) · Users and teams ▾ (Users, Teams, Permission profiles, Security) · Plan and billing ▾ (Plan overview, Manage subscription, Billing) · Credits and activity ▾ (Credit usage, Data requests, AI word usage, System activity log) · Integrations · AI context center · Rules of engagement ▾ (Prospecting config, Territories) · Team email & sequences ▾ (Sequences, Tracking subdomains) · Objects, fields, stages ▾ (Contact fields & stages, Account fields & stages, Deal fields & stages, Waterfall enrichment) · Removal requests
- Sticky footer: Add teammates

Memo §6, sidebar generation C. Admins also reach it from a bottom-left "Admin Settings ▸" flyout ("Team & Workspace setup 86% completed · Users and teams · System activity · Security · Plan overview · Integrations · All settings"), memo §1.0.

Sub-pages add horizontal tabs across the top (Profile: General / MFA / Custom fields / Email settings; Security: MFA / IP whitelisting / Password policy / Login controls / Single sign on; Sequences: Rulesets / Alerts / Priority / Schedules / Best times), and some add a third row inside a drawer (mailbox: Overview / Deliverability / Inbox placement / Forwarding). Primary buttons are bright yellow, top right. Memo §6.

### 5.2 The problems, each with its source

| # | Problem | Where in the parody | Source |
|---|---|---|---|
| 1 | Separate shell; the main nav disappears and the user must "go back" to the product | The whole area | Memo §6 "Settings replaces the main nav with its own left sidebar" |
| 2 | Landing on a checklist instead of settings | Get started | Memo §1.1, §6 |
| 3 | Five levels deep: Settings › Email setup and health › Mailboxes › Show filters › a mailbox › Overview tab › signature is six interactions | Mailbox signature | Memo §1.4 (Apollo KB, Configure Your Mailbox) |
| 4 | Permission profile editor: list → editor → two tabs → six accordions → per-feature expansion | Permission profiles | Memo §1.3 Users and teams ("click on a feature to expand it to view and apply more granular feature permissions") |
| 5 | Vague labels: Rules of engagement, Credits and activity, System activity, Email setup and health, Objects, fields, stages | Sidebar | Memo §6 inconsistencies; Capterra "Name of the features is a bit confusing to me" (memo §3) |
| 6 | Renamed pages: the same page called Mailboxes, Mailboxes & domains, Deliverability suite and Email setup and health; AI content center versus AI context center; Billing and credits versus Plan and billing | Sidebar and article paths | Memo §6 "Observed inconsistencies" |
| 7 | Duplicates: System activity is both a flyout item and a sub-item; personal Mailboxes redirects into the workspace page; the credit balance appears in the top-bar pill, the avatar menu, the Credit usage page and the extension | Several | Memo §1.2, §6 |
| 8 | "Advanced" doors: Advanced sync (deletion and merge sync), Advanced Intent Settings, extension › Advanced | CRM sync | Memo §1.4 |
| 9 | Split dependent settings: the unsubscribe text is per user under Profile › Email settings while the permission "User can disable opt-out message" is in Permission profiles; the per-user credit limit is on Users while usage is under Credits and activity; sending limits are in the mailbox drawer while "User can adjust their own email sending limits" is in Permission profiles; bounce guard thresholds are under Sending policies, bounce rate under Bounce logs, paused state in the mailbox drawer | Profile, Users, Permission profiles, Sending policies | Memo §1.2 Profile, §1.3 Users and teams, §1.3 Team email & sequences ("admins can force it via the permission"), §1.3 Email setup |
| 10 | Price below the fold, then behind a page: the plan's price appears only on the Manage Subscription checkout (D2); Plan overview lists what is included and usage, then "scroll to Cancel Plan (reason picker; Keep current plan; self-serve cancel isn't available for every team)" | Plan overview | Memo §1.3 Plan and billing |
| 11 | No delete: "no self-serve control. KB: to delete a workspace an admin must contact Support" | Absent | Memo §1.3 Delete account |
| 12 | Greyed-out tasks for non-admins with "Hey, it looks like you don't have the admin permissions to complete the tasks below", and the FAQ answer "If a setting is greyed out and you can't select it, your Apollo admin hasn't provided you access" | Get started, any workspace page opened by an SDR | Memo §1.1, §3 Permissions |
| 13 | Two Save conventions on adjacent pages: Prospecting config is a grid of cards each with its own Save; Profile has one global Save; AI context center has per-block Save then Save changes | Prospecting config, Profile, AI context center | Memo §6, §1.3 AI context center |
| 14 | A table so wide the vendor documents zooming out: "If you can't see the number of emails sent vs your limit, zoom out on your browser or try scrolling horizontally in the table" | Mailboxes table | Memo §3 (Apollo KB, Configure Email Sending Limits) |
| 15 | Credit surprise: the balance is a pill, the burn rate is a chart on a D3 tab under Credits and activity › Credit usage › Usage details | Credit usage | Memo §1.3 Credits and activity; reviews: "watch the credit system closely or you'll get surprised at the end of the month" (Reddit via Cleverly, secondary); "AI assistant ran operations quoting me a certain amount of credits, and then racked up a separate bill" (Trustpilot, Aug 2026); "accidentally paid for another month" (Trustpilot, Aug 2026) |
| 16 | Agent limits scattered: credit limits per workflow are set on the workflow, per-user limits on Users, "what the assistant may do" in permission profiles; there is no agent settings page | Absent as a place | Memo §1.3 Workflows, §5 "Apollo does not ship a standalone AI SDR agent settings page" |

General complaints that describe the result: "too many clicks to reach data many navigation buttons seems to be not in the logical place" (Trustpilot, Sep 2026); "the UI and UX is cluttered and frustrating" (Trustpilot, Aug 2026); "one click too many each time" (G2 via SyncGTM, secondary). Memo §3.

### 5.3 What the common version gets right

Kept in the disclosed version, because the memo records them as praise or as sound design (memo §4): a real search box at the top of settings; a "View as" preview of a permission profile; the IP allowlist warning "24 users in your team might lose access" before saving; bounce guard defaults shown inline with the toggle; the checkout's summary that stays on screen with "Due today". The G2 ease-of-admin score of 9.0 is reported by the memo as unverified and is not used as evidence here.

## 6. After: the disclosed version

### 6.1 Layout

Described in 3.1. One page in the main navigation, header with search, the strip, then You and the areas in fixed inventory order with a sticky index. The lesson's step 0 renders the parody; the product renders only this.

### 6.2 Level one and level two per role

| Role | Level one | Level two (behind one door per area) |
|---|---|---|
| Admin | Strip; You; Users row and table; mailboxes table with warm-up and limits; sending domains; bounce guard; agents on/off, approvals, caps; CRM sync with error count; Change plan and Cancel plan; Export and Delete | Workspace five; teams, profiles, security five; tracking subdomain, catch-all, unsubscribe pair, tracking; prospecting six; pipeline five; schedules and rulesets; company context and own key; field mapping, calendar, Slack, enrichment, API keys, webhooks; invoices and tax ID |
| SDR | Strip (own credits, bounce guard status, approvals); You; own mailboxes with warm-up and limits | Signature, tracking, unsubscribe text; primary email type, in-progress limit; enrichment order; schedules, rulesets, priority; agents on; calendar |
| AE | Strip (own credits); You; own mailboxes (Meridian) | Signature, tracking, pipeline stages, custom fields, calendar, default currency |
| Marketer | Strip (own credits); You; company context | Tracking, custom fields, signature |
| CS | Strip (own credits); You | Signature, calendar |

How it changes across businesses: Halyard's admin gets workspace name, timezone and currency at level one; Fathom's admin loses Users, domains and CRM to doors and loses teams, profiles, SSO and territories altogether; Ridgeline's admin loses mailboxes, warm-up, limits and domains to the Email door and gains nothing, because product-led sending is light. The critical strip is the same for every admin.

### 6.3 Doors, labels and containers

| Area | Door label for Meridian's admin (content, with count) | Container |
|---|---|---|
| Workspace | Name, logo, timezone, currency and language (5); Halyard: Logo and language (2) | In place |
| Team and access | Teams, permission profiles, MFA, single sign-on, IP allowlist, password policy, session timeout (7); Fathom: Users, MFA, IP allowlist, password policy, session timeout (5) | In place; teams and profiles open a drawer |
| Email sending | Tracking subdomain, catch-all blocking, unsubscribe text, open and click tracking (4); SDR: Signature, open and click tracking, unsubscribe text (3) | In place |
| Mailbox row, domain row | Edit (signature, tracking subdomain, unlink); DNS records | Drawer, flat |
| Prospecting rules | GDPR by region, do-not-call, primary email type, duplicate handling, in-progress limit, territories (6) | In place; territories open a drawer |
| Pipeline and data | Pipelines and stages, contact and account stages, custom fields, deal currency, enrichment provider order (5) | In place; lists open drawers |
| Sequences | Sending schedules, rulesets (2); SDR adds priority (3) | In place; lists open drawers |
| Agents and AI | Company context, bring your own model key (2) | In place; context opens a drawer |
| Integrations | Field mapping, calendar, Slack, enrichment provider, API keys, webhooks (6) | In place; mapping and error log open drawers; connect opens the wizard page |
| Plan, billing and usage | Invoices and tax ID (2) | In place |
| Users table; Change plan | Not doors: links | Page |

Every door: chevron on the left, text label, count, whole header clickable, `aria-expanded`. Drawers are flat: headings, no tabs, no accordions. Pages are independent tasks with a breadcrumb back to Settings.

### 6.4 Persistence

Door state is remembered per user per workspace (`ollopa.settings.doors.<business>.<role>` in the demo; server-side in a real product). Expand all and Collapse all set every door and are remembered too. Print expands everything. Drawers and dialogs do not persist. The search's jump opens a door and leaves it open.

### 6.5 Accelerators

`/` for search; ⌘K entries showing `/`; deep-link anchors per setting (`/ollopa/settings#mail.bounce-guard`), which the palette, toasts and the wizard use; Expand all remembered; row-level editing in tables so daily users of mailboxes and users never open a drawer; keyboard paths in 3.9. Door opens are counted per item and per segment, and the promote-keep-delete review runs twice a year against the usage model.

### 6.6 Decision-critical items

Price and renewal, credit balance and burn with run-out date, bounce guard status with the current rate, agent approval rules, agent credit caps, pending approvals count, Cancel plan next to Change plan, Delete workspace with its consequence and Export beside it. All at level one; the first seven in the strip.

### 6.7 Removed rather than hidden

Get started checklist and onboarding progress; Workspace overview; the Notifications page (preferences live on Agents and Inbox, next to what they notify about); Marketing domains; Data requests; AI word usage; System activity log; Removal requests as a page (a line under GDPR restrictions); Sequence alerts and Best times; the Admin Settings flyout; the extra copies of the credit balance (the header pill stays and links here); the cancel-reason picker and "Keep current plan"; "Advanced" blocks (deletion and merge sync are two labelled rows in the CRM drawer); custom user fields. Absent from the inventory and the product, not parked behind a door.

### 6.8 Score

| # | Question | Score | Line |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | Strip plus level-one delete and export; cancel beside change plan |
| 2 | Every visible item backed by a sourced number | 2 | Section 4, from `settings.ts`, shape checked for five pairs |
| 3 | No path exceeds two levels on any screen size | 2 | Page and one door; flat drawers; sub-pages are independent screens with their own single door; same on phone |
| 4 | Doors labelled by content, chevron and text | 2 | Every door lists its contents and count; no "More", "Other" or "Advanced" |
| 5 | Doors adjacent to what they reveal, keyboard and touch | 2 | Door under its area heading; header is a button; 40 px targets |
| 6 | No dependent information split across a door | 2 | Unsubscribe pair, bounce guard triple, limits with their permission, delete with export, credit limit with usage |
| 7 | State persists; expand all and print | 2 | 6.4 |
| 8 | User action or object state, never inferred history | 2 | Layout from the usage model per segment; nothing reorders by the user's history; status rows change with object state only |
| 9 | Instrumented; promote, keep or delete review scheduled | 1 | Door opens are counted and the review is scheduled; the demo has no real analytics behind it, so the review runs on the illustrative model |

Total: 17 of 18.

## 7. Lesson steps

Step 0 is the common version in section 5. Six steps follow, one rule each, in the order PLAN.md fixes: 7, 1, 2, 4, 5, 8. Rule 6 and rule 3 are notes at the end, not steps. Every evidence line exists in the knowledge base.

### Step 1. Rule 7: decision-critical information is never behind a door

**What moves.** The strip appears at the top. Price and renewal date come up from the Manage Subscription checkout (second level). Credit balance and burn rate come up from Credits and activity › Credit usage › Usage details (third level) and gain a run-out date. Bounce guard status comes up from Sending policies, with the current rate from Bounce logs. Agent approval rules and credit caps, which had no home (per workflow, per user, per permission profile), get one at level one in Agents and AI. Cancel plan moves from below the fold on Plan overview to the strip beside Change plan, same size; the reason picker and "Keep current plan" go. Delete workspace is created at level one with its consequence; before, it was "contact support". Pending approvals get a count and a link. Ghosts stay on the parody's Plan overview and Credit usage pages until step 2.

**Evidence.** Nielsen (2026): never hide "price, requirements, risks, privacy terms" behind the second level. Nouwens et al. (2020): moving the reject button off the first page raised consent by 22 to 23 points. Blake et al. (2021): deferring fees raised spending by 21%. FTC junk-fee rule (2025), UK CMA guidance (2025). Memo §1.3: "scroll to Cancel Plan", "no self-serve control"; §3: "surprised at the end of the month".

### Step 2. Rule 1: hide the rare, never the necessary

**What moves.** The settings shell collapses into one page inside the main navigation; Get started and the Admin Settings flyout go. Every item at 20% weekly or more for the signed-in role and business comes up to level one: for Meridian's admin, Users (45), the mailboxes table (40) with warm-up (25) and limits (30) as columns, sending domains (20), agents on or off (25), CRM sync (40) with its error log (30), plan and seats (20). Everything under 20% goes behind one door per area. The lesson then switches to Halyard's admin, where workspace name (40), timezone (35) and currency (25) rise out of the Workspace door, and to Fathom's founder, where Users (6) and domains (10) sink into theirs and the credit line turns to warning. Same page, three heads.

**Evidence.** Nielsen (2006): "You must disclose everything that users frequently need up front." Pendo (2024): 6% of features generate 80% of clicks. McGrenere and Moore (2000): 27% of functions used on average, range 3% to 45%, so the head differs by segment. Jensen Harris: "one person's ideal default 'short' menu was exactly the wrong thing for someone else." Nielsen (2026): a daily item behind a door is disclosure debt. Memo §3: "too many clicks", "one click too many each time".

### Step 3. Rule 2: stop at two levels

**What moves.** The mailbox drawer's four tabs become one flat drawer, and the two things people open it for weekly, warm-up and limits, become editable columns; the six-interaction path to a signature becomes two. Security's five tabs become five rows inside the Team door. Sequences' five tabs become two rows. Users and teams stops being a group with sub-pages: Users is one table page, teams and profiles are rows with drawers. The permission profile editor's tabs and six accordions become one flat form with headings. Plan and billing, Credits and activity and Billing merge into one area. The deepest path is now page → door or page → drawer, on desktop and on phone.

**Evidence.** Nielsen (2006): "Designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels." Landauer and Nachbar (1985): breadth beats depth. GitLab Pajamas: three or more levels "suggests the feature needs redesign." Memo §1.4: the six-interaction signature path; §6: tabs inside groups inside drawers.

### Step 4. Rule 4: make the door obvious and honest

**What moves.** Labels are rewritten by content: Rules of engagement becomes Prospecting rules with a door reading "GDPR by region, do-not-call, primary email type, duplicate handling, in-progress limit, territories (6)"; Email setup and health, Mailboxes & domains and Deliverability suite become one name, Email sending; Credits and activity and System activity disappear into Plan, billing and usage; AI context center becomes the row Company context inside Agents and AI; Objects, fields, stages becomes Pipeline and data; "Advanced sync" becomes two rows, Deletion sync and Merge sync. Every door gains a chevron, its content list and a count. Doors that do not apply are removed: Fathom loses teams, permission profiles, SSO and territories, and its Team door shrinks to what is left. The greyed-out admin checklist and "your admin hasn't provided you access" become one sentence naming the admin.

**Evidence.** Tognazzini: "If the user cannot find it, it does not exist." NN/g (2014): an unlabelled non-standard icon got 0% click-through. NN/g (2016): hidden navigation used in 27% of desktop cases against 48 to 50% for visible, task success more than 20 points lower, users at least 39% slower. Microsoft Windows UX Guide: "Remove (don't disable) progressive disclosure controls that don't apply in the current context." Home Assistant (2026): audience labels "implicitly tell users that certain features are not for them." Memo §3: "Name of the features is a bit confusing"; §6: the renamed pages; §1.1 and §3: the greyed-out states.

### Step 5. Rule 5: keep context across the boundary

**What moves.** Dependent pairs go into one row or one door. Unsubscribe text and "users may disable it" sit together in the Email door (they were Profile › Email settings and Permission profiles). Bounce guard thresholds, the current 7-day rate and the paused mailboxes are one row (they were Sending policies, Bounce logs and the mailbox drawer). Mailbox limits sit in the row, with the rule "users may adjust their own limits" above the table (it was in Permission profiles). The users table shows credit limit and credits used side by side (they were Users and Credit usage). Export all data moves beside Delete workspace, because delete's warning says export first. Door state now persists per user; Expand all, Collapse all and print-expands-all appear in the header.

**Evidence.** Cowan (2001): working memory holds about four chunks. Microsoft Fluent 2: "Never put information in one accordion item that needs to be referenced in another accordion item." Microsoft Windows UX Guide: "If a user expands or collapses an item, make the state persist so it takes effect the next time the window is displayed." NN/g: switching between tabs to compare costs memory and interaction. Memo §1.2, §1.3: where each half of the four pairs lived.

### Step 6. Rule 8: fade the scaffold; give experts accelerators

**What moves.** The search box, kept from the parody, now jumps to a setting instead of a page: it opens the door, focuses the control and highlights the row. `/` focuses it; the ⌘K palette lists every setting under "Settings ›" with `/` beside each, so the palette teaches the shortcut. Every setting gets a deep-link anchor. Expand all is remembered. Row-level editing in the mailboxes and users tables lets daily users bypass drawers. The lesson shows the promote-keep-delete audit as a table: promoted (warm-up and limits into columns), tucked away (invoices, API keys, IP allowlist), deleted (the list in 6.7), with the sub-5% rule for deletion.

**Evidence.** NN/g heuristic 7: accelerators "unseen by the novice user" speed up the expert. Findlater and McGrenere (2010): reduced interfaces improve core-task performance but lower awareness of unused features, so the palette shows what exists. Cockburn et al. (2014): users "persistently fail to adopt faster methods" unless the interface pulls them. McGrenere and Moore (2000): 45% preferred unused functions "tucked away" against 24.5% removed. Memo §4: the search box as praise.

### Notes that are not steps

**Rule 6.** Nothing on this page moves because of what a user did last week. The layout is fixed per role and business by the usage model, a segment-level decision made in the spec, not an inference about the individual. The only things that change on their own are status values driven by object state: bounce rate, paused mailboxes, sync errors, credits. Evidence: Findlater and McGrenere (2004), static menus significantly faster than adaptive; Jensen Harris on Office 2000 menus that made scanning "take twice as long".

**Rule 3.** The parody has no Basic or Expert mode and neither does the product, so there is nothing to move. Its "Advanced" doors were audience labels, and step 4 renamed them by content. Evidence: Cooper (1995) on perpetual intermediates; Nielsen (2026): the expert "is a regular user having a rare moment."

## 8. Review

| Check | Gap found | How it was closed |
|---|---|---|
| All roles covered | Customer success had almost nothing and it looked like an oversight | Kept honest: You, own credits, a door with signature and calendar, the sentence naming the admin (3.12, 6.2) |
| All four businesses covered | Ridgeline's admin was missing from the role-business table | Added to 3.12 and 6.2; shape checked in 4 |
| Every field has a source | Mailboxes, domains, users, thresholds, approvals, invoices are not in the seed | 2.2 lists a `settings` seed per business; price and run-out are derived, formulas given |
| Every action has an outcome | Export and delete had no end state | 3.4: progress then a link; a name-typing dialog with grace period and "Export first" |
| Empty, error and no-access states | No state for a non-admin following a deep link to a workspace setting | 3.8: personal page with a banner naming the admin |
| Keyboard | Search results had no keyboard path | 3.9: arrow keys, Enter, Escape returns focus |
| Phone width | The users table cannot become cards without losing the inline credit limit | 3.11: users stays a table in its own scroll container; mailboxes become cards with limits still editable |
| Decision-critical visible | Delete workspace at the foot of a long page is below the fold | Stated in 3.3: level one, no door; index and search reach it in one click; cancel is in the strip beside change plan |
| Two levels maximum | A users page with a per-user drawer would be three from Settings | Credit limit and deactivate became row-level; the page has no drawer |
| Doors labelled by content | A one-item door would read as a label | 3.1: a door names its contents and count |
| Dependent fields together | Export was level two while delete was level one | Export moved beside delete (step 5); recorded as a rule-5 override in 4 |
| State persists | Not stated for Expand all | 6.4: remembered with the doors |
| Accelerators present | Only the search | 6.5: `/`, palette entries with the shortcut, anchors, row-level editing |
| Usage shape checked | Only the admin was checked | Five pairs in 4, including the SDR's personal page and Halyard's wide head, named as the stretch |
| Nothing hover-only | Row actions in tables | Visible on focus and repeated in the row menu, as TablePage does |
| Role gaps explain themselves | Read-only values for SDRs risked looking disabled | 3.2: text with "set by" and the admin's name, linked to the search |
| No usage numbers or teaching text in the product | The credit line could read like a lesson | It states balance, burn and date; no percentages of use, no rule names |
