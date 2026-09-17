# 14. Settings

*Full page. Lesson 1. The whole settings inventory of ollopA on one page, laid out by the usage model for the signed-in role and business.*

## 1. Purpose

Settings is where a workspace is configured and where the money is. It holds every item in the inventory in PRODUCT.md (102 usage items in `src/ollopa/usage/settings.ts`, because the code counts security, mailbox and scoring sub-settings separately and because the decisions of 13, 14 and 15 September 2026 added the rest), grouped in **thirteen** areas: Workspace; **How your team works**; Team and access; Email sending; Prospecting rules; Pipeline and data; Sequences; **Signals, scoring and personas**; Agents and AI; Integrations; **API, webhooks, MCP and CLI**; Plan, billing and usage — with "You" first for every seat.

Two of the thirteen are new and both were created by the map rather than by this spec (IA-MAP 2.14). **Signals, scoring and personas** is the configuration behind agents that already score leads: five journeys walked to it and found nothing there. **API, webhooks, MCP and CLI** is the developer surfaces' home; the API keys and webhooks rows moved out of the Integrations door, because Settings → Integrations door → API keys → a drawer was three levels (rule 2). Spec 17 owns the four panels and the four surfaces behind that area; this page owns the rows.

Six things this page owns for the whole product, so that no other page invents its own: the **bounce guard** pair (warns at 4%, pauses at 6%); the **agent approval policy** and its second-approval threshold (default 1,000 recipients or 500 credits in one action), plus the rule that agents never overwrite a field a person set; the **declared sidebar** — the workspace profile and the seats, which live in "How your team works"; the **plan table** and the one sentence about exports it settles; the **scoring threshold, personas and signals** every other page filters by; and the **do-not-call clock**, which is a 31-day obligation and not a switch. Every other page reads these and shows the observed values beside them.

Who lives here:

| Role | How often | What they come for |
|---|---|---|
| RevOps admin (Meridian, Ridgeline) | Weekly | Users joining and leaving, mailbox health, CRM sync errors, agent limits, credit burn, the plan, upgrade requests from teammates |
| Agency ops lead (Halyard, admin role) | Daily | The same items, ten workspaces over, plus workspace name, timezone, currency and sending domains that are rare elsewhere |
| Founder (Fathom, admin role) | Weekly, credits daily | Mailboxes and warm-up, which agents are on, credit burn against a small balance, the price |
| Marketer (Meridian, Ridgeline) | Weekly | Signals, scoring and personas: the threshold, the models, the personas, the signals and their freshness. This is the marketer's only regular reason to be here, and it is the reason the area exists |
| SDR, AE, customer success | Monthly or less; SDRs weekly for mailboxes | Their own mailboxes, signature, tracking, credit usage, their own MCP and CLI connections; the sending domain row, read-only, when a sequence pauses |

The one thing nobody on this page may lose sight of: **what the workspace costs and what can spend or stop it on its own.** Price and renewal date, credit balance and burn rate, the credit spike threshold with today's multiple beside it, bounce guard status, the do-not-call clock, what agents may do without a human and that they never overwrite a person's field, agent credit caps, the second-approval threshold, the published API limits and cost table, the scoring threshold and the share above it, upgrade requests waiting from teammates, cancel plan and delete workspace are visible the moment the page opens, for anyone whose role has them, without a click.

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
| Account stages | `seed.ts` → `Company.stage` values: Cold, Active opportunity, Current client, Churned, Do not prospect. Five, owned here through `pipe.contact-stages`; Companies and Accounts read them and add none |
| Agent names | `seed.ts` → `AgentEvent.agent` (Research agent, Outreach agent, Scoring agent); which exist per business from `counts.agents` (Fathom and Halyard: Research and Outreach; Meridian and Ridgeline: all three) |
| Items waiting for approval | `seed.ts` → `agentEvents` where `needsApproval` |
| Sequences named in schedules and rulesets | `seed.ts` → `sequences` |
| Weekly use, level, critical flag per item | `usage/settings.ts` via `weeklyUse`, `levelOf` |

Derived on the page, not stored:

- Monthly price = seats × price per seat, shown as one total for the period and never as a breakdown. Three plans: Starter $49 a seat, Growth $79, Scale $129. Meridian is on **Scale**: 42 seats, $5,418 a month, billed annually ($65,016 a year), renews 15 Jan 2027. Fathom is on **Starter**: 3 seats, $147 a month, billed monthly, renews 2 Oct 2026. Halyard is on **Growth**: 25 seats, $1,975 a month, billed annually, renews 30 Nov 2026. Ridgeline is on **Growth**: 14 seats, $1,106 a month, billed annually, renews 8 Mar 2027. (`businesses.ts` currently has Meridian on Growth at $79 a seat; the plan decision of 13 September 2026 makes it Scale, so `plan.name` becomes "Scale" and `plan.pricePerSeat` 129 there.)
- Credit run-out date = today + balance ÷ burn per week. Meridian: about 14 Oct. Fathom: about 26 Sep, which is before the 2 Oct renewal, so it is shown as a warning. Halyard: about 30 Sep, the day the monthly credit cycle ends, also a warning. Ridgeline: about 22 Oct, fine.
- Credit cycle end = the renewal day of month, monthly, for every plan.

### 2.2 What must be added to the seed

One `settings` object per business in `src/ollopa/data/settings.ts`, deterministic, generated with the same `rng` seeds. Fields per area, then the values that differ by business.

| Area | Fields to add |
|---|---|
| Workspace | name, logo initials, timezone, currency, language |
| How your team works | `profile` (one of Founder-led outbound, Separated sales team, Agency, Product-led growth) with the three answers behind it (`firstJob`, `people`, `seats[]`) and who declared it and when; `leftOut[]` (page, why, `signals` count, `signalKind`); `exposure` (page, started, ends, state: showing, kept, dropped) |
| Team | users (name, title, role, profile, `grants: string[]`, team, territory, status, `availability: "available" \| { awayUntil }`, credit limit, credits used this month, last active, `reports?: string[]`), teams, permission profiles, security (MFA enforced, SSO provider, IP allowlist, password policy, session timeout) |
| Email sending | mailboxes (address, owner, provider, warm-up state and day, daily and hourly limit, sent today, deliverability, 7-day bounce rate, paused), domains (SPF, DKIM, DMARC, bounce rate, mailbox count), tracking subdomain, bounce guard (on, warning 4%, pause 6%, 7-day rate and volume, paused mailboxes), catch-all blocking, unsubscribe text and whether users may disable it, open and click tracking |
| Prospecting | GDPR regions, DNC countries, primary email type, duplicate handling with the observed duplication rate, in-progress limit, territories, `dnc: { synchronisedOn, nextDueOn, log: { at, by, what, count }[] }` (24 months kept), `removalList: { people, addedOn, reason }[]` |
| Pipeline and data | pipelines (stages from `DEAL_STAGES` with probability and forecast category), contact and account stages, custom fields per object, `requiredAtStage: Record<stage, field[]>`, `dealWarnings: { kind, threshold, observed }[]` (six), `forecastCategories: { name, definition }[]` (five), `goals: { period, userId?, teamId?, amount }[]`, `submissionWindow: { day, time, opensOn }`, `renewalReminders: [120, 90, 60, 30]`, deal currency and multi-currency, enrichment provider order |
| Signals, scoring and personas | `scoreModels: { name, inputs, weights, decay, published, publishedBy, version }[]`, `primaryScore: { threshold, shareAbove }`, `personas: { name, title, seniority, department, industry, size, geography, size_count }[]`, `signals: { name, definition, source, freshnessDays, tips }[]`, `expansionRouting: { toOwnerUnder: 15000, toAeAtOrOver: 25000 }`, `firstValueSignal: { noMilestoneDays: 90 }`, `retired: { signals, personas, models }` |
| API, webhooks, MCP and CLI | the objects spec 17 §2 lists: `apiKeys[]`, `endpointCosts[]`, `webhooks[]`, `webhookDeliveries[]`, `mcpTokens[]`, `cliDevices[]`, plus the constants for the per-workspace limits and the exit codes. Defined there, rendered here |
| Sequences | schedules, rulesets, priority |
| Agents and AI | company context, agents on or off, approval rules per agent (research, draft, add to sequence, send, spend), per-run and monthly caps per agent, `secondApproval { recipients: 1000, credits: 500 }`, own model key |
| Integrations | connected list (name, kind, status, last sync, error count), sync conditions, field mapping, error log, calendar, Slack, enrichment provider, API keys, webhooks |
| Plan | plan tier (Starter, Growth, Scale), invoices, tax ID, export status, `teamBudgets: { teamId, credits }[]`, `spikeAlert: { multiple: 3, todayMultiple }`, `creditsBySurface: Record<surface, number>` (app, automation, API, MCP, CLI, agents), `upgradeRequests[]` (who asked, which feature, which plan, monthly cost, where the request came from, reason, when) — the queue itself is the Requests page; this is what the strip line reads |

| | Meridian | Fathom | Halyard (current client workspace) | Ridgeline |
|---|---|---|---|---|
| Workspace | Meridian Software, Europe/Berlin, EUR | Fathom Labs, America/New_York, USD | Kestrel Health (client), Europe/London, GBP | Ridgeline, America/Los_Angeles, USD |
| Plan | Scale, 42 seats, $5,418 a month | Starter, 3 seats, $147 a month | Growth, 25 seats, $1,975 a month | Growth, 14 seats, $1,106 a month |
| How your team works | Separated sales team; five seats; nothing left out | Founder-led outbound; admin and SDR seats; Inbox and Campaigns left out, Inbox showing for two weeks on 7 replies | Agency; admin and SDR seats; Campaigns and Accounts left out, declared again per client workspace | Product-led growth; five seats; Sequences and Lists left out of the admin's sidebar |
| Team | 42 users (5 from `roles[]`, 37 generated); 4 teams; 5 profiles; MFA enforced; SSO Okta; 2 IP ranges | 3 users, all Admin; MFA optional; teams, permission profiles, SSO and the IP allowlist locked on Starter | 25 users, 6 with mailboxes here; 2 teams; 2 profiles; MFA enforced; SSO and IP allowlist locked on Growth | 14 users; 2 teams; 5 profiles; SSO and IP allowlist locked on Growth |
| Email | 34 mailboxes; 3 domains, all records green; bounce 1.9% of 14,200 in 7 days, none paused; users may not disable unsubscribe text | 3 mailboxes, one per user, which is Starter's limit; all warming; fathomlabs.com, DMARC missing; bounce 3.6% of 620, under the 4% warning; users may disable | 6 mailboxes on 2 client domains; bounce 4.4% of 9,800, over the 4% warning; 1 mailbox paused at 6.2%, over the 6% pause | 9 mailboxes; 1 domain; bounce 0.8% of 410; tracking off |
| Prospecting | EU and UK restricted; DNC US, UK, DE, FR; business email; prompt on duplicate; 5 per account; 3 territories | EU; DNC US; any email; auto-merge; 3 per account; territories locked on Starter | EU and UK; 4 per account; 2 client territories | EU; auto-merge; 2 per account; no territories set |
| Pipeline | 2 pipelines; 14 custom fields; EUR, multi-currency on; Northlight Data → Beacon Verify → ollopA | 1 pipeline; 3 fields; Northlight Data → ollopA | 1 pipeline; 6 fields | 2 pipelines; 9 fields; Northlight Data → Beacon Verify |
| Sequences | 3 schedules, 2 rulesets | 1 and 1 | 4 client-hour schedules, 2 rulesets | 1 and 1 |
| Agents | 3 on; research, scoring and drafts are logged not queued; add-to-sequence, send, spend over a cap and stage changes need the owner's approval; second approval over 1,000 recipients or 500 credits; caps Research 40/run and 300k a month, Outreach 10 and 60k, Scoring 2 and 40k; own model key available | 2 on (Starter's limit); same approvals; second approval over 400 recipients or 200 credits, lowered by the founder; Research 25 and 3,000, Outreach 5 and 800; own model key locked | 2 on; same approvals; threshold at the default; Research 30 and 80k, Outreach 8 and 20k; own model key locked | 3 on, Outreach off; same approvals; threshold at the default; Research 20 and 60k, Scoring 2 and 30k; own model key locked |
| Integrations | **Salesforce** production (3 errors, synced 4 min ago), two-way with custom objects; Google Workspace mail, Google Calendar, Slack, Northlight Data; 2 API keys; 1 webhook | Google Workspace mail, Google Calendar, Northlight Data; **no CRM** — ollopA is the CRM here; API keys and webhooks locked on Starter | Google Workspace mail; **one client CRM per workspace**, HubSpot in the current one (1 error); custom objects locked on Growth | **HubSpot** (0 errors), two-way; Google Calendar, Slack, Northlight Data; custom objects locked |
| Plan | 12 invoices; DE tax ID | 4 invoices | 12 invoices; GB tax ID | 6 invoices |

Per-user credits used this month are generated as shares of `monthlyCap − balance`, weighted to SDRs.

### 2.3 The three plans

ollopA gates features by plan, and this page owns the table. Every other spec renders its own row of it and adds nothing.

| | Starter | Growth | Scale |
|---|---|---|---|
| Price a seat, a month | $49 | $79 | $129 |
| Seats | 3 | unlimited | unlimited |
| Mailboxes per user | 1 | unlimited | unlimited |
| Teams, permission profiles, territories | no | yes | yes |
| Agents | 2 | 3 | all, plus your own model key |
| Reports | Activity only | all five, plus CSV export | all five, plus CSV export and the scheduled weekly email |
| CRM sync | one-way | two-way | two-way, plus custom objects |
| SSO, SCIM, IP allowlist, audit export | no | no | yes |
| API, webhooks, CLI | no | yes | yes |
| MCP | read only | read and write | read and write |
| Workflows | no | yes | yes |
| View as a teammate | no | yes | yes |
| On this plan | Fathom Labs | Halyard Agency, Ridgeline | Meridian Software |

Gating and permission hiding are opposites and must never be confused on this page. A role without permission gets the item hidden and a sentence naming who can grant it. A plan without a feature gets the item **shown where it always lives**, with a lock, the plan name, and a real control that opens one panel: what the feature does, which plan includes it, one total for the period, and one button. A person who cannot upgrade asks the admin from that same panel, and the request carries the feature, the cost and where it came from. Nothing moves when it unlocks, no feature is renamed into a "Premium" section, and the usage numbers in §4 still decide the level — a lock never promotes an item.

Two things are never gated. Safety and decision-critical items are on every plan: bounce guard, credit balance and burn, the credit spike threshold, price and renewal, cancel, delete, export, the agent approval rules and caps, the do-not-call clock, the published API limits and cost table, the scoring threshold, and the Forecast tab, because a submitted forecast is a commitment. And no gate appears after a person has produced work they cannot keep — the lock is at the entry point, which on this page means the row itself, never the Save button at the end of a form they have filled in. Two consequences of that rule are written down here because other specs render them: **"Save as a reusable ruleset · Growth"** is present, locked and priced at the top of a sequence's ruleset block from the moment that door opens, with the per-sequence settings saving normally underneath it; and **MCP read scope is on every plan**, with the lock on the two write tiers and restated by the endpoint at connection, never at the moment a write fails.

**One sentence about exports, for the whole product.** Exporting a table a seat can already read is on **every plan**. Exporting a **report** is **Growth**. **Scheduled delivery** — the weekly email — is **Scale**. Reports, Tasks and the CLI all render that sentence and none of them restates it differently. Three files previously disagreed, which produced a false paragraph about an agency printing a PDF it did not need to print.

**Preview, for the whole product.** Where a plan does not include a view, the view is shown with its **real shape and its real count and its values withheld**: "Pipeline · 84 deals · Growth". Never a screenshot, never a fake chart, never an empty state. A tab that is simply absent teaches nothing about what the plan buys, and discovery is the sale (gated-features pattern rule 8).

## 3. Features

### 3.1 Shape of the page

One page inside the main navigation. No separate settings shell, no settings sidebar. Three parts, top to bottom:

1. **Header row.** Title "Settings", the workspace name, and the settings search box (`Find a setting…`, shortcut `/`). To its right: "Expand all" / "Collapse all".
2. **The strip.** Decision-critical facts for this role, always visible, no door. See 3.3.
3. **Areas.** For the signed-in role, "You" first (personal settings), then the workspace areas in the fixed inventory order — Workspace, How your team works, Team and access, Email sending, Prospecting rules, Pipeline and data, Sequences, Signals scoring and personas, Agents and AI, Integrations, API webhooks MCP and CLI, Plan billing and usage — with **How your team works** second after Workspace, because it explains the shape of everything below it, and **Signals, scoring and personas** before Agents and AI, because it is what the agents read. On desktop a sticky in-page index on the left lists the areas as anchors; it is a table of contents, not navigation to other pages.

Each area has a heading, its level-one rows, and at most one door. The door is a button with a chevron, a content label and a count: `▸ Tracking subdomain, catch-all blocking, unsubscribe text, open and click tracking (4 settings)`. When every item in an area is level two, the door sits directly under the heading and carries the whole list. When nothing is behind the door, there is no door.

A setting row has the label on the left, the control or the current value on the right, and where the value has a consequence, one line of plain text under it ("Auto-pause stops every mailbox on the domain until you resume it").

### 3.2 Personal versus workspace

Every role gets "You": name, title, login email, password, multi-factor authentication for your own account. Then the personal items from the inventory: your mailboxes (with warm-up and limits), your signature, your open and click tracking, your unsubscribe text, your calendar, your credit usage against your limit, and what agents may do without your approval. An item is on the page for a role when the usage model has a number for that role; an item whose number is 0 at a business is removed there, because it could not work there at any price. Locked is the other case and looks different: Fathom's teams, permission profiles, single sign-on, IP allowlist, territories, API keys, webhooks and own model key all exist, all sit exactly where they sit at Meridian, and all carry a lock and a plan name.

Roles without workspace access see, after their own settings, one sentence: "Workspace settings (team, email domains, prospecting rules, pipeline, agents, integrations, plan and billing) are managed by Daniel Okafor, RevOps admin." The name comes from the business's admin seat. No greyed-out sections, no locked rows.

Where a personal value is set by the admin and not editable (Meridian SDRs cannot change their own daily limit), the row shows the value as text with "set by Daniel Okafor" and a link that opens the settings search on that admin item. It is never a disabled input.

### 3.3 The strip (decision-critical, rule 7)

For admins, one bar under the header with:

- **Plan and price.** "Growth · 42 seats · $3,318 a month, billed annually · renews 15 Jan 2027". Two links of equal weight next to it: **Change plan** and **Cancel plan**. Cancel opens a confirmation that states the end date and what happens to data; no reason picker, no "keep my plan" detour.
- **Credits.** "1.84M of 2.5M left this month · 410k a week · lasts to about 14 Oct". When the run-out date is before the cycle end, the text turns to warning colour and says "runs out before 15 Oct". Fathom reads "4,120 of 10,000 · 2,300 a week · runs out about 26 Sep, before renewal on 2 Oct". Beside it, "Where it went", which opens `X-credits` — one flat panel on its own channel, carrying three stacked ranked breakdowns: **by feature, by person, and by surface** (app, automation, API, MCP, CLI, agents), top five each with one "show the rest", every row a link to the job, the person or the key behind it. Not three tabs: tabs hide what has to be compared. The panel's footer names the route this page cannot give an agency: "Credits are per workspace. `ollopa credits --all-workspaces` reports across all ten." The shell's credits pill opens the same panel; the anchor into this area stays as a second route, because a deep link is a first-class route.
- **Bounce guard.** "On · 1.9% of 14,200 in 7 days · warns at 4%, pauses at 6% · nothing paused". Halyard reads "Warning · 4.4% of 9,800 · 1 mailbox paused".
- **Agents.** "3 on · send, add-to-sequence, stage changes and spend over a cap need the owner's approval · a second approval over 1,000 recipients or 500 credits · caps 300k / 60k / 40k a month · 4 waiting for approval → Agents".
- **Credit spike.** "Alert at 3× the usual daily burn · today 1.1× · nothing alerted." The same shape as bounce guard: a threshold that changes what the product does, with the observed value beside it.
- **Do-not-call.** "Synchronised 2 September · next due 3 October." Past 31 days it turns to warning and reads "overdue — calls made now are outside safe harbour". The FTC requires synchronisation at least every 31 days and a record of the process (19§3.7), so this is safety state, not a preference, and Home's health strip carries it the way it carries bounce guard.
- **Upgrade requests.** Present only when someone has asked: "2 upgrade requests · Priya Natarajan wants Territories (Growth, $237 a month for 3 seats) · Review". The approver is making a price decision, so the cost is on the line, not behind it. **Review opens the Requests page**, which owns the queue and both kinds of request: two queues for one decision is how an approval gets missed (IA-MAP 6.4c). The strip keeps the line, the count and the cost, which is what rule 7 asks of it.
- **Delete workspace** is not in the strip. It is at level one at the foot of the Plan area, with its consequence written out and "Export all data" beside it, and the index and the search jump straight to it. Nothing hides it; it is one scroll away, not one click away.

For SDRs, AEs, marketers and CS, the strip is shorter: your credit usage and limit, bounce guard status for your mailboxes, and what agents may do without your approval where the role has it. Price, cancel and delete are not shown to roles that cannot act on them; the workspace sentence in 3.2 names who can.

### 3.4 Actions

| Where | Action | Outcome |
|---|---|---|
| Any row | Change a value | Row marked changed; the Save bar appears (3.5) |
| Any locked row | Open the lock | A panel in place: what the feature does, which plan includes it, one total for the period, one button, and a **last line naming what is still possible without it** or saying plainly that there is nothing ("Without it: one mailbox per person, and you can rotate which one a sequence uses"). A door that opens onto a dead end is a door that lied. For an admin the button reads "Upgrade to Growth"; for anyone else, "Ask Daniel Okafor", which opens **one field — "What are you trying to do?" — prefilled with the origin in words** ("Trying to add a second mailbox on the Email sending page") and editable, then one button. The reason was displayed on the approver's screen and never collected anywhere; now it is. Escape closes it and nothing has changed |
| How your team works | Change the workspace profile | The three questions from the set-up page (spec 16) open in place with the current answers. Saving redraws the sidebar and says what moved: "Inbox and Campaigns are back in the sidebar for SDR seats" |
| How your team works | Change which seats exist | A checklist of the five seats; unchecking one says how many people hold it and what happens to them |
| How your team works | Add a left-out page back | "Add to sidebar" on the row; it goes to the end of its group and stays |
| How your team works | Answer a two-week exposure | "Inbox has been in your sidebar for 14 days. Keep it?" with Keep and Remove; the answer holds until a new signal |
| Plan | Review an upgrade request | Opens the **Requests** page, which owns the queue and the review. The strip and this row keep the line, the count and the cost |
| Plan | Team credit budget, credit spike alert | Inline. The spike alert reads "Alert at 3× · today 1.1× · nothing alerted" |
| Strip | Change plan | The plan page: seats stepper, plan cards, a price summary that stays on screen with "Due today"; returns here |
| Strip | Cancel plan | Dialog stating end date, seats and what is kept for 30 days; "Cancel plan" and "Keep plan" the same size |
| You | Change password, set up MFA | Inline forms in the row |
| Team | Invite people | Dialog: emails, permission profile, credit limit; the users table updates |
| Team | Open users table | `/settings/users`: name, title, profile, teams, territory, availability, credit limit editable in the row, used this month, last active, status; search and filters as in TablePage. Credit limit, availability and status are editable **in the row**, so a weekly user never opens anything. Row actions: **Open** (the `X-user` panel), **View as**, **Deactivate** |
| Team | `X-user`, one person | A panel on the users table page — which is level two there, because navigation costs no level (IA-MAP convention 1). It holds the fields that are set once: **seat**, then **permission profile**, then **additional grants** as named chips with an add control, then team and territory. Three lines of text sit between them and are not optional to read: "The seat decides which areas exist for this person. The profile decides what they may do inside them. A profile cannot grant an area the seat does not carry." Under the profile row: "This replaces anything set on this person directly." Under grants: "Grants add to the profile. Prefer a grant to a new profile." Profiles the admin does not hold are **absent** with one line naming who can assign them, never greyed |
| Team | Territory | One node, two openings: territories are **defined** in Prospecting rules and **assigned** from a row in `X-user`; both open the same panel. Defining it in one place and assigning it in another is not a duplicate, it is the same object reached from the two moments it is needed |
| Team | View as a teammate | A **mode on the page**, not a panel: from the users-table row action or the area heading, the page is replaced by that teammate's own view under a persistent banner — "Viewing as Marcus Adeyemi (SDR, Northwind team) · Exit". You do not read a panel about what somebody else sees; you see it. Growth, because Starter has no permission profiles to preview |
| Team | Deactivate | An **ordered flow** in `X-user`, four blocks on one panel, each with its count and its consequence in text, none of them optional to read. **1. Reassign** — "Reassign 412 records, 9 deals, 3 sequences and 21 open tasks to —", with "Paused and failed tasks do not move; they stay with this person and stop", and above 250 records the pass count. **2. Unlink 2 mailboxes**, with what happens to in-flight sequence steps. **3. Unmap from Salesforce** — "Until this is done, this person's activity keeps syncing to Salesforce." **4. Deactivate** — "Access ends now. The seat is free to reassign. **Your bill does not change until renewal on 15 January 2027**", with "Reduce seats at renewal" linking into Plan. Step 4 is not greyed and not offered: until 1 to 3 are done or skipped with a reason its button reads "Reassign first" and names what is outstanding |
| Team | Teams, permission profiles | Drawer: list on top, one flat form beneath, one Save |
| Email | Mailboxes table | Warm-up toggle and both limits editable in the row; "Edit" opens a flat drawer (signature, tracking subdomain, unlink with a forwarding choice); "Link a mailbox" starts the wizard |
| Email | Sending domains | "DNS records" opens a drawer with SPF, DKIM and DMARC values and copy buttons |
| Email | Bounce guard | Thresholds editable in the row for admins; current rate and paused mailboxes in the same row |
| Prospecting, Pipeline, Sequences | Lists (territories, pipelines, fields, schedules, rulesets) | Add, rename, reorder and delete in a drawer; delete says what depends on the item ("2 sequences use this schedule") |
| Prospecting | Do-not-call | The row carries the state, the next due date and the review log — who synchronised, when, the count, and an export, kept 24 months. "Synchronise now" runs it and writes a log row |
| Prospecting | Removal list | `X-removal`: review, export, and **delete everywhere**, whose consequence is at level one inside the panel — "Deletes 214 people here, unlinks them in Salesforce, removes them from 3 lists and 2 sequences, and stops 1 enrichment job from re-importing them. This cannot be undone." And four lines with counts and links that answer the monthly sweep in place rather than in four navigations: sequences 0, enrichment jobs 1, API keys with prospecting scope 2, agents 3 |
| Pipeline and data | Required to enter a stage | Set per stage in the field panel. The deal's stage stepper prints the gate **before** the click, naming the fields and who set them |
| Pipeline and data | Deal warnings | Six rows, each with its threshold and the observed workspace value beside it, as bounce guard does. The six, their names and their defaults are defined in [09 Deal record](09-deal-record.md) §2 and read here; this area owns only the thresholds |
| Pipeline and data | Forecast categories, targets, submission window | The five categories with the definition text Reports prints under each label; targets per period per user or team; the submission day, time and window. Renewal reminders — 120, 90, 60 and 30 days before a renewal date — sit in the same area, one row |
| Signals, scoring and personas | The primary score | The threshold, the share of people above it, and the models behind it. `X-score` opens a model: inputs, weights, decay, a **distribution preview** that prints the share above the threshold with its source beside it ("68% of people score above 62. Above 80% the threshold is not doing work — 17§4"), and Publish |
| Signals, scoring and personas | Publish a threshold | The consequence above the button: the old and new thresholds, how many are above each today, how many already routed are unaffected, and that it applies to new leads only. Grandfathering is a radio pair with a count on each option. Publishing writes "Threshold 62, published 15 Sep by Grace Mwangi" beside the Score filter on People, and fires the Slack event kind "scoring threshold published", off by default |
| Signals, scoring and personas | Personas, signals | `X-persona` (title, seniority, department, industry, size, geography) and `X-signal` (definition, source, freshness, talking tips). Each is its own channel, flat, the way `S-pipeline` already holds `X-field`. Expansion routing and the shipped "no first-value milestone in 90 days" signal are rows here, read by Accounts |
| API, webhooks, MCP and CLI | Keys, subscriptions, scopes, devices | Four panels — `X-key`, `X-hook`, `X-mcpscope`, `X-cliauth` — specified in spec 17. The published limits, the cost table, the 80% alert and the delivery contract are rows in the area, not inside the panels, because they inform a decision made before a key or a subscription exists |
| Agents | On or off, approvals, caps | Inline; enabling "send without approval" shows its consequence line before Save. One line sits at level one beside the approval rules and is not a setting: "Agents never overwrite a field a person set or confirmed; they propose instead." It is what makes the suggested / edited / validated chip on an agent-writable field mean anything |
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
| Empty | An area with nothing configured shows the honest sentence and the action: "No sending domains yet · Add a domain"; "No territories: everyone can prospect everywhere". At Fathom the CRM row is not empty and not a to-do: **"ollopA is your CRM. It is holding your contacts, companies and deals. Connect Salesforce or HubSpot if that changes."** "ollopA is our CRM" is a declarable answer on the CRM group in the connect wizard, it takes the CRM row out of Home's setup list, and it is reversible from the same place |
| Locked by plan | The row is where it always is, with its label, a lock and the plan name: "Territories · Growth". It is a real control; it opens the panel. Never greyed out, never moved, never removed, and never a lock on something that would not work here anyway |
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
| Strip | Price ($5,418 a month, Scale), credits, bounce guard, agents, cancel | Same; bounce guard in warning, 1 paused | Own credits (8,400 of 25,000), bounce guard status for own mailboxes, agent approvals | Renewal in 19 days; credits run out before it (warning); bounce guard under warning; agents; 2 upgrade requests |
| How your team works | Profile (Separated sales team), seats, nothing left out | Profile per client workspace at level one; seats; two pages left out with their signal counts | Absent; the sentence in 3.2 names the admin | Profile, seats, the two left-out pages, and the exposure now running on Inbox |
| Workspace | Door: all five | Name, timezone, currency at level one; door: logo, language | Absent | Door: all five |
| Team | Users at level one; door: teams, profiles, five security items | Same; SSO and IP allowlist locked (Scale) | Absent | Door only: users (3 of 3 seats, the Starter limit) and the security items; teams, profiles, SSO and IP allowlist locked with their plan names |
| Email | Mailboxes (warm-up and limits in the row), domains, bounce guard at level one; door: tracking subdomain, catch-all, unsubscribe pair, tracking | Same | Own mailboxes; limits read-only, "set by Daniel Okafor"; the **domain row and its panel read-only** with the admin named; door: signature, tracking, unsubscribe text | Mailboxes, warm-up, limits, bounce guard at level one; domains join the door |
| Prospecting | **Do-not-call at level one** (critical, with its clock); door: GDPR, primary email type, duplicate handling with the observed rate, in-progress limit, territories, removal list | Same | Door: primary email type, in-progress limit, read-only | Do-not-call at level one; door: the rest, with territories carrying a lock and "Growth" |
| Pipeline | Door: all five | Same | Door: enrichment order, read-only | Door: all five |
| Sequences | Door: schedules, rulesets | Same | Door: schedules, rulesets, priority | Same as Meridian |
| Signals, scoring | Door: the whole area (the admin sets it, the marketer reads it) | Same | Absent | Door: the whole area; no marketer seat here |
| Agents | On or off, approvals, caps, the no-overwrite line, second-approval threshold at level one; door: context, own key | Same; own key locked (Scale) | Approvals, the no-overwrite line and the threshold at level one, read-only; door: which agents are on | Same as Meridian; own key locked; the threshold lowered to 400 recipients |
| API, webhooks, MCP and CLI | Keys with their spend, the limits, the cost table, MCP scope, CLI devices at level one; door: the 80% alert, the contract | Same, plus CLI devices high: the loop is weekly | Only the personal rows — your MCP and CLI connections — then one sentence naming the admin | MCP read at level one and the two write tiers locked and priced; keys, webhooks and CLI locked in place with "Growth" |
| Integrations | Salesforce sync with error count at level one; door: four (field mapping, calendar, Slack, enrichment provider) | Client HubSpot at level one with its error count; door: four, custom objects locked | Door: calendar | "ollopA is your CRM" at level one; door: the rest. API keys and webhooks are no longer in this door: they moved to the developer area |
| Plan | Strip; Change and Cancel; Delete, Export and upgrade requests at level one; door: invoices, tax ID | Same | Own credits only | Same as Meridian; two upgrade requests waiting |

AEs see You, own mailboxes (level one at Meridian, door at Ridgeline), credits, availability, and a door with signature, tracking, pipeline stages and custom fields read-only, forecast categories and the submission window read-only, calendar, default currency. Marketers see You, company context at level one, **Signals, scoring and personas at level one — the threshold with the share above it, the models, the personas and the signals with their freshness** — credits, availability, and a door with tracking, custom fields, signature and the retired-definitions list. Customer success sees You, credits, availability, the renewal-reminder ladder and the expansion routing thresholds read-only, and a door with signature and calendar. Ridgeline's admin sees mailboxes, warm-up, limits and domains drop into the Email door; Users, CRM, agents and the strip stay, and "How your team works" shows Sequences and Lists as the two pages the Product-led growth profile leaves out of an admin's sidebar.

## 4. Usage items

Weekly use is the share of active users in a role at a business who touch the item in a typical week (USAGE-MODEL.md). Baseline is Meridian. "–" means the item is not on the page for that role. Overrides are per business; 0 removes the item at that business. Items marked critical are level one regardless of use, for the roles that have them.

| Id | Area | Item | Admin | SDR | AE | Mkt | CS | Overrides | Critical |
|---|---|---|---|---|---|---|---|---|---|
| me.notify-delivery | You | Where notifications go: digest or as they happen, Slack, push, mute, quiet hours | 4 | 6 | 4 | 3 | 3 | Fathom: admin 8, sdr 8; Halyard: admin 6, sdr 8 |  |
| me.mcp-token | You | Your MCP and CLI connections: client, authorised when, revoke | 4 | 4 | 2 | 2 | 2 | Fathom: admin 8, sdr 20; Halyard: admin 5, sdr 5; Ridgeline: admin 3, sdr 3 |  |
| ws.name | Workspace | Workspace name | 2 | – | – | – | – | Halyard: admin 40 |  |
| ws.logo | Workspace | Logo | 1 | – | – | – | – | Halyard: admin 15 |  |
| ws.timezone | Workspace | Timezone | 3 | – | – | – | – | Halyard: admin 35 |  |
| ws.currency | Workspace | Default currency | 2 | – | 1 | – | – | Halyard: admin 25 |  |
| ws.language | Workspace | Language | 1 | – | – | – | – |  |  |
| work.profile | How your team works | Workspace profile and the three answers behind it | 3 | – | – | – | – | Halyard: admin 25; Fathom: admin 2; Ridgeline: admin 2 |  |
| work.seats | How your team works | Which seats exist in this workspace | 8 | – | – | – | – | Halyard: admin 20; Fathom: admin 3; Ridgeline: admin 4 |  |
| work.left-out | How your team works | Pages the profile leaves out, with how many signals have arrived for each | 6 | – | – | – | – | Halyard: admin 12; Fathom: admin 10; Ridgeline: admin 4 |  |
| work.exposure | How your team works | Two-week exposure: which page is showing now, until when, and keep or drop it | 4 | – | – | – | – | Halyard: admin 6; Fathom: admin 9; Ridgeline: admin 3 |  |
| team.users | Team and access | Users | 45 | – | – | – | – | Halyard: admin 30; Fathom: admin 6 |  |
| team.teams | Team and access | Teams | 10 | – | – | – | – | Fathom: admin 1 |  |
| team.profiles | Team and access | Permission profiles | 8 | – | – | – | – | Fathom: admin 1 |  |
| team.grants | Team and access | Additional grants on top of the profile | 8 | – | – | – | – | Halyard: admin 12; Fathom: admin 2; Ridgeline: admin 5 |  |
| team.availability | Team and access | Available, or Away until a date | 12 | 8 | 8 | 6 | 6 | Halyard: admin 20, sdr 10; Fathom: admin 6, sdr 6; Ridgeline: admin 8, sdr 4, ae 6, marketer 5, cs 5 |  |
| team.viewas | Team and access | View as a teammate | 4 | – | – | – | – | Halyard: admin 20; Fathom: admin 1; Ridgeline: admin 4 |  |
| team.offboarding | Team and access | Deactivate: reassign, unlink mailboxes, unmap from the CRM, then deactivate | 8 | – | – | – | – | Halyard: admin 20; Fathom: admin 2; Ridgeline: admin 4 | yes |
| sec.mfa | Team and access | Multi-factor authentication | 3 | – | – | – | – |  |  |
| sec.sso | Team and access | Single sign-on | 2 | – | – | – | – | Fathom: admin 1 |  |
| sec.ip | Team and access | IP allowlist | 1 | – | – | – | – |  |  |
| sec.password | Team and access | Password policy | 1 | – | – | – | – |  |  |
| sec.session | Team and access | Session timeout | 1 | – | – | – | – |  |  |
| mail.mailboxes | Email sending | Mailboxes | 40 | 60 | 25 | – | – | Halyard: admin 70, sdr 65; Fathom: admin 50, sdr 60; Ridgeline: sdr 20, ae 10, admin 15 |  |
| mail.warmup | Email sending | Warm-up | 25 | 30 | – | – | – | Halyard: admin 55, sdr 40; Ridgeline: sdr 5, admin 5 |  |
| mail.limits | Email sending | Daily, hourly and minimum delay between sends | 30 | 20 | – | – | – | Halyard: admin 50, sdr 30; Ridgeline: sdr 4, admin 6 |  |
| mail.signature | Email sending | Email signature | 2 | 5 | 5 | 2 | 3 |  |  |
| mail.domains | Email sending | Sending domains | 20 | 8 | – | – | – | Halyard: admin 45, sdr 12; Fathom: admin 10, sdr 8; Ridgeline: admin 6, sdr 3 |  |
| mail.tracking-subdomain | Email sending | Tracking subdomain | 2 | – | – | – | – |  |  |
| mail.bounce-guard | Email sending | Bounce guard: warns at 4%, pauses at 6% | 35 | 15 | – | – | – |  | yes |
| mail.catch-all | Email sending | Block catch-all domains | 5 | – | – | – | – |  |  |
| mail.unsubscribe-text | Email sending | Unsubscribe text | 3 | 2 | – | – | – |  |  |
| mail.unsubscribe-permission | Email sending | Users may disable the unsubscribe text | 2 | – | – | – | – |  |  |
| mail.tracking | Email sending | Open and click tracking | 4 | 8 | 6 | 10 | – |  |  |
| pros.gdpr | Prospecting rules | GDPR restrictions by region | 4 | – | – | – | – |  |  |
| pros.removal-list | Prospecting rules | Removal list: review, export, and delete everywhere | 5 | – | – | – | – | Halyard: admin 3; Fathom: admin 1; Ridgeline: admin 2 |  |
| pros.dnc | Prospecting rules | Do-not-call screening: synchronised 2 September, next due 3 October | 3 | – | – | – | – | Halyard: admin 6; Fathom: admin 2; Ridgeline: admin 2 | yes |
| pros.primary-email | Prospecting rules | Primary email type | 2 | 3 | – | – | – |  |  |
| pros.duplicates | Prospecting rules | Duplicate handling, with the observed duplication rate beside the rule | 6 | – | – | – | – |  |  |
| pros.in-progress | Prospecting rules | In-progress limit per account | 8 | 6 | – | – | – |  |  |
| pros.territories | Prospecting rules | Territories | 12 | – | – | – | – | Fathom: admin 1; Halyard: admin 4 |  |
| pipe.stages | Pipeline and data | Pipelines and stages | 10 | – | 6 | – | – | Fathom: admin 12 |  |
| pipe.contact-stages | Pipeline and data | Contact and account stages | 6 | – | – | – | – |  |  |
| pipe.fields | Pipeline and data | Custom fields | 15 | – | 4 | 4 | – |  |  |
| pipe.currency | Pipeline and data | Deal currency | 2 | – | – | – | – |  |  |
| pipe.enrichment-order | Pipeline and data | Enrichment provider order | 12 | 4 | – | – | – | Ridgeline: admin 5 |  |
| pipe.required-at-stage | Pipeline and data | Required to enter a stage, per stage | 12 | – | 5 | – | – | Fathom: admin 6; Halyard: admin 5; Ridgeline: admin 8, ae 4 |  |
| pipe.deal-warnings | Pipeline and data | Deal warnings: the six defined in 09 §2, each with its threshold and the observed workspace value | 15 | – | 6 | – | – | Fathom: admin 8; Halyard: admin 6; Ridgeline: admin 10, ae 5 |  |
| pipe.forecast-categories | Pipeline and data | Forecast categories and what each one means | 10 | – | 4 | – | 3 | Fathom: admin 5; Halyard: admin 4; Ridgeline: admin 8, ae 4, cs 4 |  |
| pipe.goal | Pipeline and data | Targets per period, per user and per team | 12 | – | 4 | – | 3 | Fathom: admin 4; Halyard: admin 6; Ridgeline: admin 10, ae 4, cs 4 |  |
| pipe.submission-window | Pipeline and data | Forecast submission day, time and window | 4 | – | 3 | – | 2 | Fathom: admin 3; Halyard: admin 3; Ridgeline: admin 4, ae 3, cs 3 |  |
| pipe.renewal-reminders | Pipeline and data | Renewal reminders: 120, 90, 60 and 30 days before the renewal date | 4 | – | – | – | 8 | Fathom: admin 1; Halyard: admin 1; Ridgeline: admin 4, cs 15 |  |
| seq.schedules | Sequences | Sending schedules | 8 | 12 | – | – | – | Ridgeline: sdr 4, admin 2; Halyard: sdr 20, admin 15 |  |
| seq.rulesets | Sequences | Sequence rulesets | 6 | 4 | – | – | – | Ridgeline: admin 1 |  |
| seq.priority | Sequences | Sequence priority | – | 3 | – | – | – |  |  |
| ai.context | Agents and AI | Company context | 10 | – | – | 20 | – | Ridgeline: marketer 30; Fathom: admin 15 |  |
| ai.agents | Agents and AI | Agents on or off | 25 | 10 | – | – | – | Fathom: admin 40 |  |
| ai.approvals | Agents and AI | What agents may do without approval | 30 | 8 | – | – | – |  | yes |
| ai.credit-caps | Agents and AI | Agent credit caps | 35 | – | – | – | – |  | yes |
| ai.second-approval | Agents and AI | Second approval above 1,000 recipients or 500 credits in one action | 10 | 4 | – | – | – | Fathom: admin 4, sdr 2; Halyard: admin 12, sdr 6; Ridgeline: admin 5 | yes |
| ai.no-overwrite | Agents and AI | Agents never overwrite a field a person set or confirmed; they propose instead | 10 | 4 | 3 | 2 | 2 | Fathom: admin 12, sdr 4; Halyard: admin 10, sdr 4; Ridgeline: admin 8, marketer 4 | yes |
| ai.own-key | Agents and AI | Bring your own model key | 2 | – | – | – | – |  |  |
| score.primary | Signals, scoring and personas | The primary score, its threshold, and the share of people above it | 30 | – | – | 55 | – | Ridgeline: marketer 60, admin 25; Fathom: admin 8; Halyard: admin 6 | yes |
| score.models | Signals, scoring and personas | Score models and their inputs | 25 | – | – | 45 | – | Ridgeline: marketer 50, admin 22; Fathom: admin 6; Halyard: admin 5 |  |
| score.weights | Signals, scoring and personas | Weights and decay | 10 | – | – | 15 | – | Ridgeline: marketer 16, admin 8; Fathom: admin 4; Halyard: admin 4 |  |
| score.preview | Signals, scoring and personas | Distribution preview: the share above the threshold, with its source beside it | 12 | – | – | 18 | – | Ridgeline: marketer 18, admin 10; Fathom: admin 4; Halyard: admin 4 |  |
| score.publish | Signals, scoring and personas | Publish a threshold: the old and new values, how many are above each today, and what happens to people already routed | 10 | – | – | 12 | – | Ridgeline: marketer 12, admin 8; Fathom: admin 3; Halyard: admin 3 | yes |
| score.stamp | Signals, scoring and personas | Threshold n, published on a date by a person, shown beside the Score filter on People | 8 | – | – | 12 | – | Ridgeline: marketer 12, admin 6; Fathom: admin 2; Halyard: admin 2 |  |
| score.personas | Signals, scoring and personas | Personas with their sizes | 20 | – | – | 40 | – | Ridgeline: marketer 35, admin 16; Fathom: admin 5; Halyard: admin 4 |  |
| score.persona-def | Signals, scoring and personas | One persona: title, seniority, department, industry, size, geography | 8 | – | – | 15 | – | Ridgeline: marketer 14, admin 6; Fathom: admin 3; Halyard: admin 3 |  |
| score.signals | Signals, scoring and personas | Signals with their freshness | 25 | – | – | 45 | – | Ridgeline: marketer 60, admin 25; Fathom: admin 6; Halyard: admin 5 |  |
| score.signal-def | Signals, scoring and personas | One signal: definition, source, freshness, talking tips | 10 | – | – | 15 | – | Ridgeline: marketer 18, admin 8; Fathom: admin 4; Halyard: admin 3 |  |
| score.expansion-routing | Signals, scoring and personas | Expansion routing: under $15,000 to the account owner, $25,000 and above to the account executive of record | 12 | – | – | 8 | 10 | Ridgeline: cs 15, admin 10, marketer 6; Fathom: admin 2; Halyard: admin 2 | yes |
| score.first-value | Signals, scoring and personas | The shipped signal: no first-value milestone in 90 days | 4 | – | – | 4 | 12 | Ridgeline: cs 18, admin 4; Fathom: admin 2; Halyard: admin 2 |  |
| score.retired | Signals, scoring and personas | Retired signals, retired personas and archived models | 4 | – | – | 8 | – | Ridgeline: marketer 8, admin 4; Fathom: admin 2; Halyard: admin 2 |  |
| int.crm | Integrations | CRM sync | 40 | – | – | – | – | Fathom: admin 5; Halyard: admin 25 |  |
| int.field-mapping | Integrations | CRM field mapping | 15 | – | – | – | – | Fathom: admin 2 |  |
| int.error-log | Integrations | Sync error log | 30 | – | – | – | – | Fathom: admin 3 |  |
| int.calendar | Integrations | Calendar | 3 | 5 | 5 | – | 4 |  |  |
| int.slack | Integrations | Slack | 5 | – | – | – | – |  |  |
| int.enrichment | Integrations | Enrichment provider | 6 | – | – | – | – |  |  |
| dev.api-keys | API, webhooks, MCP and CLI | API keys: scope, last used, spend | 6 | – | – | – | – | Fathom: admin 1; Halyard: admin 8; Ridgeline: admin 4 |  |
| dev.webhooks | API, webhooks, MCP and CLI | Webhooks: events, delivery log, reconcile | 4 | – | – | – | – | Fathom: admin 1; Halyard: admin 3; Ridgeline: admin 12 |  |
| dev.mcp | API, webhooks, MCP and CLI | MCP connection and scope: read, safe writes, destructive writes | 12 | – | – | – | – | Fathom: admin 25; Halyard: admin 8; Ridgeline: admin 6 |  |
| dev.cli | API, webhooks, MCP and CLI | CLI device authorisations | 5 | – | – | – | – | Halyard: admin 20; Fathom: admin 8; Ridgeline: admin 2 |  |
| dev.limits | API, webhooks, MCP and CLI | Limits are per workspace, not per key: 200 a minute, 6,000 an hour, 50,000 a day | 5 | – | – | – | – | Fathom: admin 3; Halyard: admin 6; Ridgeline: admin 4 | yes |
| dev.cost-table | API, webhooks, MCP and CLI | Published cost per endpoint: typical and maximum, with the waterfall tail | 4 | – | – | – | – | Fathom: admin 12; Halyard: admin 10; Ridgeline: admin 3 | yes |
| dev.hook-contract | API, webhooks, MCP and CLI | The delivery contract: at-least-once, signed, attempt-numbered, retried for 24 hours, never silently disabled, and the reconciliation endpoint | 3 | – | – | – | – | Fathom: admin 1; Halyard: admin 2; Ridgeline: admin 12 | yes |
| dev.key-spend | API, webhooks, MCP and CLI | Spend per key, against the workspace balance | 15 | – | – | – | – | Fathom: admin 2; Halyard: admin 20; Ridgeline: admin 10 | yes |
| dev.alert-80 | API, webhooks, MCP and CLI | Alert the key's owner at 80% of the allocation | 3 | – | – | – | – | Fathom: admin 10; Halyard: admin 8; Ridgeline: admin 2 | yes |
| plan.seats | Plan, billing and usage | Plan and seats | 20 | – | – | – | – | Halyard: admin 30; Fathom: admin 15 |  |
| plan.price | Plan, billing and usage | Price and renewal date | 25 | – | – | – | – |  | yes |
| plan.credits | Plan, billing and usage | Credit balance and burn rate | 55 | 30 | 15 | 20 | 5 | Fathom: admin 60, sdr 40 | yes |
| plan.upgrade-requests | Plan, billing and usage | Upgrade requests from teammates | 6 | – | – | – | – | Fathom: admin 12; Halyard: admin 10; Ridgeline: admin 4 | yes |
| plan.credit-breakdown | Plan, billing and usage | Credit spend by feature, by person and by surface | 30 | 8 | – | – | – | Fathom: admin 45, sdr 12; Halyard: admin 40, sdr 10; Ridgeline: admin 20, sdr 4 |  |
| plan.team-budget | Plan, billing and usage | Team credit budget | 12 | – | – | – | – | Halyard: admin 20; Fathom: admin 15; Ridgeline: admin 6 |  |
| plan.spike-alert | Plan, billing and usage | Credit spike alert: warn at n times the usual daily burn | 10 | – | – | – | – | Fathom: admin 20; Halyard: admin 15; Ridgeline: admin 5 | yes |
| plan.invoices | Plan, billing and usage | Invoices | 8 | – | – | – | – |  |  |
| plan.tax-id | Plan, billing and usage | Tax ID | 1 | – | – | – | – |  |  |
| plan.cancel | Plan, billing and usage | Cancel plan | 1 | – | – | – | – |  | yes |
| plan.export | Plan, billing and usage | Export all data | 2 | – | – | – | – |  |  |
| plan.delete | Plan, billing and usage | Delete workspace | 0.5 | – | – | – | – |  | yes |

"Name, title, login email, password" and "Multi-factor authentication" are the personal profile block from 3.2; all 102 rows are `settings.ts` as it stands. "Plan and seats" and "Export all data" sit at level one for reasons other than use: the cancel path must be no longer than the subscribe path (rule 7), and export is the action delete depends on (rule 5).

Twenty-one items are marked critical, up from nine. The twelve added are all price, safety or consequence: the credit spike threshold, the credit breakdown by surface, the developer area's published limits, cost table, per-key spend, 80% alert and delivery contract, the do-not-call clock, the primary scoring threshold and its publish consequence, the expansion routing bands, the no-overwrite rule, and the ordered offboarding flow. Every one of them answers a question a person would otherwise ask after the money was spent or the record was changed.

Shape check, computed from `settings.ts` with `shape()`. The denominator is every item that exists for that role at that business — an item whose number is 0 or absent is removed there and is not on their page. A locked item is on the page, so it counts. The same rule is used in specs 12, 13, 15, 16, 17, 18 and 19.

| Pair | Items on their page | Head | Body | Tail | Verdict |
|---|---|---|---|---|---|
| Meridian admin | 101 | 19 (19%) | 44 (44%) | 38 (38%) | Head fits, one point under. Body nine points over and tail seven under, and the reason is the two new areas: scoring and the developer surfaces are both *monthly* work for a 300-person RevOps admin, which is the middle of the distribution by definition. Named rather than tuned away |
| Fathom admin | 101 | 12 (12%) | 35 (35%) | 54 (53%) | Head three points under, the rest fits. Starter locks eleven items, which are on the page and in the tail: a small company on a small plan carries the whole inventory and touches little of it |
| Halyard admin | 101 | 26 (26%) | 38 (38%) | 37 (37%) | Head one point over the band and tail eight under — the same stretch case as before and for the same reason. The agency is the customer whose rare settings are routine: the workspace profile, the client CRM, the sending domains and now the CLI loop are all declared again for every client |
| Ridgeline admin | 101 | 14 (14%) | 41 (41%) | 46 (46%) | Head under, body over, tail fits. Product-led: light sending, no territories, and a workspace whose developer surface is one webhook |
| Meridian SDR | 24 | 4 (17%) | 12 (50%) | 8 (33%) | Head fits; a personal page has a short tail because the workspace tail is not on it. The SDR seat gained two rows here: their own MCP and CLI connections, and the sending domain row read-only |
| **Meridian marketer** | 22 | 6 (27%) | 10 (45%) | 6 (27%) | Head two points over, body ten over. The marketer's Settings page is twenty-two rows and thirteen of them are the scoring area, which is this seat's weekly work: a short page where almost everything is used. The same shape spec 13 records for Ridgeline's marketer on Agents |
| Meridian CS | 13 | 0 | 5 (38%) | 8 (62%) | No head. A CSM comes here for their own signature, their credit usage, their availability and the renewal ladder, and otherwise does not come. Honest, not a gap: the three critical items they hold still render |

Level one, counting critical items: Meridian admin 34 of 101, Halyard admin 40, Fathom admin 27, Ridgeline admin 29, Meridian SDR 8, Meridian marketer 9, Meridian CS 3.

## 5. Before: the common version

The common version is a faithful parody of Apollo's settings as documented in `knowledge-base/sources/07-apollo-settings-map.md` (the memo), trimmed to ollopA's boundary: no dialer, conversations, meetings or extension pages, because ollopA does not have those products. Everything else is kept, including the mistakes. Every problem below names its section in the memo, which cites the Apollo knowledge-base article or review.

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
| Admin | Strip, now with the credit spike threshold and the do-not-call clock; You; the workspace profile and seats; Users row and table; mailboxes table with warm-up and limits; sending domains; bounce guard; **do-not-call with its clock**; forecast categories, targets and the submission window; the primary scoring threshold with the share above it; agents on/off, approvals, caps, **the no-overwrite line**, second-approval threshold; CRM sync with error count; **API keys with their spend, the published limits, the cost table, MCP scope, CLI devices**; Change plan and Cancel plan; upgrade requests; Export and Delete | Workspace five; left-out pages and the running exposure; teams, profiles, grants, security five, view-as; tracking subdomain, catch-all, unsubscribe pair, tracking; the rest of prospecting including the removal list; the rest of pipeline; schedules and rulesets; the rest of scoring, and the retired-definitions list; company context and own key; field mapping, calendar, Slack, enrichment; the 80% alert and the delivery contract; invoices, tax ID, team budget |
| SDR | Strip (own credits, bounce guard status, what agents may do without your approval and that they never overwrite your fields, the second-approval threshold); You; own mailboxes with warm-up and limits; your own MCP and CLI connections (Fathom) | Signature, tracking, unsubscribe text; the sending domain row read-only with the admin named; primary email type, in-progress limit; enrichment order; schedules, rulesets, priority; agents on; calendar; availability |
| AE | Strip (own credits); You; own mailboxes (Meridian) | Signature, tracking, pipeline stages, custom fields, forecast categories and the submission window read-only, calendar, default currency, availability |
| Marketer | Strip (own credits); You; company context; **the primary score with its threshold and the share above it, the score models, the personas with their sizes, the signals with their freshness** | Weights and decay, the distribution preview, publish, the persona and signal panels, the retired list; tracking, custom fields, signature, availability |
| CS | Strip (own credits); You; the renewal-reminder ladder and the expansion routing bands, read-only | Signature, calendar, availability, the first-value signal |

How it changes across businesses: Halyard's admin gets workspace name, timezone, currency, the workspace profile, view-as and the CLI device list at level one, because a new client workspace is a monthly job and the ten-workspace loop is weekly; Fathom's admin loses Users, domains and CRM to doors, keeps teams, permission profiles, SSO, the IP allowlist, territories, API keys, webhooks, the CLI and the own model key on the page with locks rather than losing them, and gains **MCP read scope at level one**, because it is on every plan and the founder works from an AI client daily; Ridgeline's admin loses mailboxes, warm-up, limits and domains to the Email door and gains the webhook subscription and its delivery contract, because product-led sending is light and inbound is event-driven. The critical strip is the same for every admin.

### 6.3 Doors, labels and containers

| Area | Door label for Meridian's admin (content, with count) | Container |
|---|---|---|
| Workspace | Name, logo, timezone, currency and language (5); Halyard: Logo and language (2) | In place |
| How your team works | Pages left out and the exposure showing now (2); Halyard: nothing behind a door, all four rows are level one | In place; changing the profile opens the three questions in place |
| Team and access | Teams, permission profiles, MFA, single sign-on, IP allowlist, password policy, session timeout (7); Fathom: Users, MFA, IP allowlist, password policy, session timeout (5) | In place; teams and profiles open a drawer |
| Email sending | Tracking subdomain, catch-all blocking, unsubscribe text, open and click tracking (4); SDR: Signature, open and click tracking, unsubscribe text (3) | In place |
| Mailbox row, domain row | Edit (signature, tracking subdomain, unlink); DNS records | Drawer, flat |
| Prospecting rules | GDPR by region, primary email type, duplicate handling, in-progress limit, territories, removal list (6); do-not-call is out of the door and at level one, because it is critical | In place; territories and the removal list open drawers |
| Pipeline and data | Pipelines and stages, contact and account stages, custom fields, required-to-enter-a-stage, deal warnings, deal currency, enrichment provider order, renewal reminders (8); forecast categories, targets and the submission window are at level one for the admin | In place; lists and the field panel open drawers |
| Signals, scoring and personas | Retired signals, retired personas and archived models (3); for the admin, also weights and decay, the distribution preview, publish, and the persona and signal panels | In place; a model, a persona and a signal each open their own flat panel |
| API, webhooks, MCP and CLI | The 80% alert and the delivery contract's six lines (2) for the admin — everything else in the area is level one, because a limit and a price inform a decision made before a key exists | In place; keys, subscriptions, scopes and devices each open a flat panel (spec 17) |
| Sequences | Sending schedules, rulesets (2); SDR adds priority (3) | In place; lists open drawers |
| Agents and AI | Company context, bring your own model key (Scale) (2) | In place; context opens a drawer |
| Integrations | Field mapping, calendar, Slack, enrichment provider (4) — API keys and webhooks moved to the developer area | In place; mapping and error log open drawers; connect opens the wizard page |
| Plan, billing and usage | Invoices, tax ID, team credit budget (3); at Halyard the budget is level one | In place; "Where it went" opens `X-credits` on its own channel |
| Users table; Change plan; Review a request | Not doors: links | Page |
| "Viewing as Marcus Adeyemi (SDR, Northwind team) · Exit" | Not a door: a **mode** on the page, with a persistent banner | Page |

Every door: chevron on the left, text label, count, whole header clickable, `aria-expanded`. Drawers are flat: headings, no tabs, no accordions. Pages are independent tasks with a breadcrumb back to Settings.

### 6.4 Persistence

Door state is remembered per user per workspace (`ollopa.settings.doors.<business>.<role>` in the demo; server-side in a real product). Expand all and Collapse all set every door and are remembered too. Print expands everything. Drawers and dialogs do not persist. The search's jump opens a door and leaves it open.

### 6.5 Accelerators

`/` for search; ⌘K entries showing `/`; deep-link anchors per setting (`/ollopa/settings#mail.bounce-guard`), which the palette, toasts and the wizard use; Expand all remembered; row-level editing in tables so daily users of mailboxes and users never open a drawer; keyboard paths in 3.9. Door opens are counted per item and per segment, and the promote-keep-delete review runs twice a year against the usage model.

### 6.6 Decision-critical items

Twenty-one items (§4). Price and renewal; credit balance and burn with the run-out date; the credit spike threshold with today's multiple; the credit breakdown by feature, person and surface; bounce guard status with the current rate and both thresholds; the do-not-call clock with its next due date; agent approval rules; agent credit caps; the no-overwrite rule; the second-approval threshold; the published API limits and cost table; per-key spend and the 80% alert; the webhook delivery contract; the primary scoring threshold and what publishing a new one does; the expansion routing bands; the ordered offboarding flow; pending approvals count; upgrade requests with their cost; Cancel plan next to Change plan; Delete workspace with its consequence and Export beside it. All at level one; the first nine in the strip. None of them is ever gated: safety and decision-critical items are on every plan.

### 6.7 Removed rather than hidden

The Get started checklist and its four progress rings, the "Team & Workspace setup 86% completed" flyout and the "Onboarding hub" percentage: about two dozen tasks replaced by three questions asked once, on their own page, before the workspace opens (spec 16). Not moved behind a door here and not kept as a percentage anywhere. What survives of them is one row in "How your team works" that says which profile was declared and lets it be changed. (The removal list is **not** in this list any more: an earlier draft deleted it as "a line under GDPR restrictions", the map keeps `X-removal` as a node, the map wins on node existence, and the monthly compliance sweep cannot be walked without it. It is now a row behind the Prospecting door with its delete-everywhere consequence at level one inside the panel.) Then: Workspace overview; the Notifications page as a page — but not the preferences on it. What to be notified about stays on the thing that notifies (Agents, Inbox, the CRM error log); where notifications go — digest or as they happen, Slack, push, mute, quiet hours — is one row in "You", because those five are read and set together, and it is what the shell's notification panel links to; Marketing domains; Data requests; AI word usage; System activity log; Sequence alerts and Best times; the Admin Settings flyout; the extra copies of the credit balance (the header pill stays and links here); the cancel-reason picker and "Keep current plan"; "Advanced" blocks (deletion and merge sync are two labelled rows in the CRM drawer); custom user fields. Absent from the inventory and the product, not parked behind a door.

### 6.8 Score

| # | Question | Score | Line |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | Strip plus level-one delete, export and upgrade requests; cancel beside change plan; nothing decision-critical is ever behind a plan lock |
| 2 | Every visible item backed by a sourced number | 2 | Section 4, all 102 items from `settings.ts`, shape checked for seven pairs with one stated denominator, and every deviation named rather than tuned |
| 3 | No path exceeds two levels on any screen size | 2 | Page and one door; flat drawers and flat panels; sub-pages are independent screens with their own single door; view-as is a mode rather than a panel inside a panel; same on phone. The developer area's panels are level two on this page, not level three, because the row they open from is level one |
| 4 | Doors labelled by content, chevron and text | 2 | Every door lists its contents and count; no "More", "Other" or "Advanced". A locked row is a real control with its own label and plan name, never a disabled one and never a "Premium" section, and its panel's last line names what is still possible without the upgrade. A gated *view* shows its real shape and its real count with the values withheld |
| 5 | Doors adjacent to what they reveal, keyboard and touch | 2 | Door under its area heading; header is a button; 40 px targets |
| 6 | No dependent information split across a door | 2 | Unsubscribe pair, bounce guard triple, limits with their permission and now the minimum delay in the same row, delete with export, credit limit with usage, the five notification-delivery choices in one row, seat beside profile beside grants with the two sentences between them, the do-not-call date beside its clock, the scoring threshold beside the share above it, the published limits and the cost table above the key list they inform, and the delivery contract beside the subscriptions it governs |
| 7 | State persists; expand all and print | 2 | 6.4 |
| 8 | User action or object state, never inferred history | 2 | Layout from the usage model per segment; nothing reorders by the user's history; status rows change with object state only. The sidebar this page owns is declared, not inferred: a profile a human chose, plus a seat a human granted, both visible and editable here. The one thing that changes on a signal, the two-week exposure, adds a page temporarily, asks before keeping it, moves nothing else, and shows its own signal count on this page |
| 9 | Instrumented; promote, keep or delete review scheduled | 1 | Door opens are counted and the review is scheduled; the demo has no real analytics behind it, so the review runs on the illustrative model |

Total: 17 of 18.

## 7. Lesson steps

Step 0 is the common version in section 5. Six steps follow, one rule each, in the order PLAN.md fixes: 7, 1, 2, 4, 5, 8. Rule 6 and rule 3 are notes at the end, not steps. Every evidence line exists in the knowledge base.

### Step 1. Rule 7: decision-critical information is never behind a door

**What moves.** The strip appears at the top. Price and renewal date come up from the Manage Subscription checkout (second level), as one total for the period rather than a per-seat breakdown, because partitioned pricing left consumers underestimating the total by about 11%, worse than drip pricing's 3.2% (CMA). Credit balance and burn rate come up from Credits and activity › Credit usage › Usage details (third level) and gain a run-out date. Bounce guard status comes up from Sending policies, with the current rate from Bounce logs. Agent approval rules and credit caps, which had no home (per workflow, per user, per permission profile), get one at level one in Agents and AI. Cancel plan moves from below the fold on Plan overview to the strip beside Change plan, same size; the reason picker and "Keep current plan" go. Delete workspace is created at level one with its consequence; before, it was "contact support". Pending approvals get a count and a link, and so do upgrade requests from teammates, each carrying the feature, the plan and the monthly cost, because the person approving a request is making a price decision. The second-approval threshold, which had been a number hard-coded inside the campaign send dialog, becomes a row in Agents and AI. Ghosts stay on the parody's Plan overview and Credit usage pages until step 2.

**Evidence.** Nielsen (2026): never hide "price, requirements, risks, privacy terms" behind the second level. Nouwens et al. (2020): moving the reject button off the first page raised consent by 22 to 23 points. Blake et al. (2021): deferring fees raised spending by 21%. FTC junk-fee rule (2025), UK CMA guidance (2025). Memo §1.3: "scroll to Cancel Plan", "no self-serve control"; §3: "surprised at the end of the month".

### Step 2. Rule 1: hide the rare, never the necessary

**What moves.** The settings shell collapses into one page inside the main navigation; Get started and the Admin Settings flyout go. Every item at 20% weekly or more for the signed-in role and business comes up to level one: for Meridian's admin, Users (45), the mailboxes table (40) with warm-up (25) and limits (30) as columns, sending domains (20), agents on or off (25), CRM sync (40) with its error log (30), plan and seats (20). Everything under 20% goes behind one door per area. The lesson then switches to Halyard's admin, where workspace name (40), timezone (35) and currency (25) rise out of the Workspace door, and to Fathom's founder, where Users (6) and domains (10) sink into theirs and the credit line turns to warning. Same page, three heads.

**Evidence.** Nielsen (2006): "You must disclose everything that users frequently need up front." Pendo (2024): 6% of features generate 80% of clicks. McGrenere and Moore (2000): 27% of functions used on average, range 3% to 45%, so the head differs by segment. Jensen Harris: "one person's ideal default 'short' menu was exactly the wrong thing for someone else." Nielsen (2026): a daily item behind a door is disclosure debt. Memo §3: "too many clicks", "one click too many each time".

### Step 3. Rule 2: stop at two levels

**What moves.** The mailbox drawer's four tabs become one flat drawer, and the two things people open it for weekly, warm-up and limits, become editable columns; the six-interaction path to a signature becomes two. Security's five tabs become five rows inside the Team door. Sequences' five tabs become two rows. Users and teams stops being a group with sub-pages: Users is one table page, teams and profiles are rows with drawers. The permission profile editor's tabs and six accordions become one flat form with headings. Plan and billing, Credits and activity and Billing merge into one area. The deepest path is now page → door or page → drawer, on desktop and on phone.

**Evidence.** Nielsen (2006): "Designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels." Landauer and Nachbar (1985): breadth beats depth. GitLab Pajamas: three or more levels "suggests the feature needs redesign." Memo §1.4: the six-interaction signature path; §6: tabs inside groups inside drawers.

### Step 4. Rule 4: make the door obvious and honest

**What moves.** Plan locks stop being absences. In the parody, a feature the plan does not include is either missing from the sidebar or greyed out with "your Apollo admin hasn't provided you access", which conflates two different things; here a feature the role may not have is hidden with a sentence naming who can grant it, and a feature the plan does not include is shown where it lives with a lock, the plan name and a panel that states the cost and offers one button. Then labels are rewritten by content: Rules of engagement becomes Prospecting rules with a door reading "GDPR by region, do-not-call, primary email type, duplicate handling, in-progress limit, territories (6)"; Email setup and health, Mailboxes & domains and Deliverability suite become one name, Email sending; Credits and activity and System activity disappear into Plan, billing and usage; AI context center becomes the row Company context inside Agents and AI; Objects, fields, stages becomes Pipeline and data; "Advanced sync" becomes two rows, Deletion sync and Merge sync. Every door gains a chevron, its content list and a count. Doors that do not apply are removed, and doors that are merely unpaid-for are not: Fathom keeps teams, permission profiles, SSO, the IP allowlist and territories on the page with locks, and loses nothing. The greyed-out admin checklist and "your admin hasn't provided you access" become one sentence naming the admin.

**Evidence.** Tognazzini: "If the user cannot find it, it does not exist." NN/g (2014): an unlabelled non-standard icon got 0% click-through. NN/g (2016): hidden navigation used in 27% of desktop cases against 48 to 50% for visible, task success more than 20 points lower, users at least 39% slower. Microsoft Windows UX Guide: "Remove (don't disable) progressive disclosure controls that don't apply in the current context." Home Assistant (2026): audience labels "implicitly tell users that certain features are not for them." Memo §3: "Name of the features is a bit confusing"; §6: the renamed pages; §1.1 and §3: the greyed-out states.

### Step 5. Rule 5: keep context across the boundary

**What moves.** A new area, How your team works, gathers the four things that decide what everyone sees: the workspace profile with the three answers behind it, which seats exist, which pages the profile leaves out with the signal count for each, and any two-week exposure running now with its keep-or-drop question. Before, none of these existed and the sidebar was simply the sidebar. Then dependent pairs go into one row or one door. Unsubscribe text and "users may disable it" sit together in the Email door (they were Profile › Email settings and Permission profiles). Bounce guard thresholds, the current 7-day rate and the paused mailboxes are one row (they were Sending policies, Bounce logs and the mailbox drawer). Mailbox limits sit in the row, with the rule "users may adjust their own limits" above the table (it was in Permission profiles). The users table shows credit limit and credits used side by side (they were Users and Credit usage). Export all data moves beside Delete workspace, because delete's warning says export first. Door state now persists per user; Expand all, Collapse all and print-expands-all appear in the header.

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
| All four businesses covered | The plan table existed in PLAN.md and nowhere in the specs | §2.3 carries it; every business's tier, price and locks are stated; other specs render their own row |
| All four businesses covered | 14 and 15 disagreed about which CRM each business runs | Meridian Salesforce, Ridgeline HubSpot, Fathom none, Halyard one client CRM per workspace, in §2.2 |
| Every field has a source | The bounce guard, the approval policy and the sidebar were each defined in several specs | All three are owned here: one pair of thresholds, one approval policy with one threshold item, one profile-and-seats area |
| Decision-critical visible | The campaign send threshold was a constant inside another spec | `ai.second-approval`, a critical row at level one, read by Agents and Campaigns |
| All roles covered | Customer success had almost nothing and it looked like an oversight | Kept honest: You, own credits, a door with signature and calendar, the sentence naming the admin (3.12, 6.2) |
| All four businesses covered | Ridgeline's admin was missing from the role-business table | Added to 3.12 and 6.2; shape checked in 4 |
| Dependent fields together | The Notifications page was deleted while the shell still linked to it for digest, Slack, push, mute and quiet hours | One row, "Where notifications go", in You: the five delivery choices together, and the link target the shell needs. What to be notified about stays beside the thing that notifies |
| Every field has a source | Mailboxes, domains, users, thresholds, approvals, invoices are not in the seed | 2.2 lists a `settings` seed per business; price and run-out are derived, formulas given |
| Every action has an outcome | Export and delete had no end state | 3.4: progress then a link; a name-typing dialog with grace period and "Export first" |
| Empty, error and no-access states | No state for a non-admin following a deep link to a workspace setting | 3.8: personal page with a banner naming the admin |
| Keyboard | Search results had no keyboard path | 3.9: arrow keys, Enter, Escape returns focus |
| Phone width | The users table cannot become cards without losing the inline credit limit | 3.11: users stays a table in its own scroll container; mailboxes become cards with limits still editable |
| Decision-critical visible | Delete workspace at the foot of a long page is below the fold | Stated in 3.3: level one, no door; index and search reach it in one click; cancel is in the strip beside change plan |
| Two levels maximum | A users page with a per-user drawer was called "three from Settings" | **Miscounted.** Navigation costs no level (IA-MAP convention 1), so a panel on the users table page is level two *there*. `X-user` exists again, holding the fields set once — seat, profile, grants, team, territory — and the ordered offboarding flow; credit limit, availability and status stay editable in the row, which was the part the earlier reading got right |
| Two levels maximum | View as a teammate opened from inside `X-user`: a level-2 node inside a level-2 node | It is a **mode** on the page with a persistent banner, not a panel. You do not read a panel about what somebody else sees |
| All roles covered | The marketer had no regular reason to be on this page, and five journeys walked to a scoring area that did not exist | The thirteenth-but-one area, Signals, scoring and personas: the threshold with the share above it, the models, the personas and the signals, at level one for the marketer seat |
| Two levels maximum | API keys lived inside the Integrations door, so reaching one was Settings → door → row → drawer | The thirteenth area, API, webhooks, MCP and CLI, between Integrations and Plan. `int.api-keys` and `int.webhooks` were **moved, not copied** |
| Decision-critical visible | Do-not-call screening was a switch at 3% weekly behind a door | A 31-day clock: the label carries the synchronisation date and the next due date, the row warns past 31 days, it is marked critical so it leaves the door, the 24-month review log sits in the row, and Home's health strip carries it the way it carries bounce guard (19§3.7) |
| Decision-critical visible | The credit breakdown, a team budget and a spike alert were all absent, and all three shipped in the real category in 2026 | `plan.credit-breakdown` (one flat panel, three stacked breakdowns including **by surface**), `plan.team-budget`, and `plan.spike-alert`, which is the same object as bounce guard and is marked critical with the observed multiple beside the threshold |
| Decision-critical visible | The per-workspace API limits and the published cost tail were in nobody's product | Both are rows at level one in the developer area, above the key list, because they inform the decision to create a key at all (19§9) |
| Decision-critical visible | A webhook's delivery contract was written nowhere, and the industry's failure mode is silent data loss | Six lines at level one under the subscription list, plus the reconciliation endpoint, copyable (19§10) |
| Every action has an outcome | Deactivate was one row action for a four-step reality | An ordered flow with counts and consequences: reassign (open tasks only, 250 a pass), unlink mailboxes, unmap from the CRM, then deactivate — with the bill sentence, because the seat is not refunded until renewal (19§1.8, 19§1.9) |
| Role gaps explain themselves | The only way to give one person one extra permission was a profile of their own | An additional-grants row under the profile row, with "Grants add to the profile. Prefer a grant to a new profile." Profiles the admin does not hold are absent with a line naming who can assign them, never greyed |
| Role gaps explain themselves | A restricted person could vanish from a count with no explanation | Stated under `pros.gdpr` as the rule the rest of the product reads: the row stays, the count stays, and the action is replaced by the rule that restricts it |
| Every field has a source | The reason on an upgrade request was displayed to the approver and collected from nobody | "Ask {admin}" opens one field, "What are you trying to do?", prefilled with the origin in words and editable |
| Dependent fields together | The forecast categories, the goal and the submission deadline were named by Reports and owned by nothing | Three rows in Pipeline and data, beside the stages they describe, with the definition text Reports prints under each label |
| Dependent fields together | The minimum delay between sends was in a journey and in no spec | `mail.limits` is one row with three fields: daily, hourly and the minimum delay |
| Doors labelled by content | Two queues existed for one approval: the strip reviewed upgrade requests and so did the Requests page | The strip keeps the line, the count and the cost and links into the queue; the review lives in one place |
| Usage shape checked | Only five pairs, and two new areas changed every one of them | Seven pairs in §4, recomputed from the code, with the marketer's short dense page and the admin's fat middle both named. The body band is over at every admin seat, because monthly work is what the middle of the distribution is |
| Doors labelled by content | A one-item door would read as a label | 3.1: a door names its contents and count |
| Dependent fields together | Export was level two while delete was level one | Export moved beside delete (step 5); recorded as a rule-5 override in 4 |
| State persists | Not stated for Expand all | 6.4: remembered with the doors |
| Accelerators present | Only the search | 6.5: `/`, palette entries with the shortcut, anchors, row-level editing |
| Usage shape checked | Only the admin was checked | Five pairs in 4, including the SDR's personal page and Halyard's wide head, named as the stretch |
| Nothing hover-only | Row actions in tables | Visible on focus and repeated in the row menu, as TablePage does |
| Role gaps explain themselves | Read-only values for SDRs risked looking disabled | 3.2: text with "set by" and the admin's name, linked to the search |
| No usage numbers or teaching text in the product | The credit line could read like a lesson | It states balance, burn and date; no percentages of use, no rule names |
