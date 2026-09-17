# Ollopa: the product behind every case

*Ollopa is the invented GTM platform that all OPD cases are built on. It exists so that every case has the same roles, the same customers and the same data, and so that progressive disclosure is tested where it is hardest: one product used in different ways by different kinds of businesses. Nothing here is a real company.*

## What Ollopa is

A go-to-market platform for B2B companies. Teams use it to find companies and people, reach out to them, run the pipeline from first reply to closed deal, and keep the account after the sale.

**Inside the boundary** (widened 15 September 2026, see PLAN.md): people and companies (a company carries its customer state), lists and segments, personas and ICP, signals and scoring, enrichment jobs and credits, sequences with templates and snippets, email threads, tasks, call logging with dispositions (no telephony), the meeting object and its events (no booking page), follow-up drafts and field proposals from conversations (no recording), LinkedIn tasks (no browser extension), pipeline and deals including typed renewals and expansions, campaigns, audiences and forms, workflows, basic reporting, integrations (CRM sync, calendar, email provider, enrichment, Slack) with webhooks, the API, MCP and a narrow CLI, agents and their runs, mailboxes and domains, fields and stages, the admin's intake requests, notes and briefs, workspace and plan.

**Outside the boundary:** telephony, booking pages, call recording, the browser extension, paid ads, website builder, support desk, billing of the customer's own customers. If a case needs one of these, the case is wrong.

The full object model and the 54 approved journeys are in [JOURNEYS.md](JOURNEYS.md). The structure — every page, record, wizard, drawer, panel and screenless surface, with its level, its seats and its profile — is in [IA-MAP.md](IA-MAP.md), which supersedes the fourteen-page table this file used to carry.

## The five seats

| Seat | How often in Ollopa | What they do there | First screen they need |
|---|---|---|---|
| **SDR** | All day | Builds lists, runs sequences, books meetings, works replies | Today's tasks and replies |
| **Account executive** | All day | Works deals through stages, logs calls, forecasts | Pipeline |
| **Marketer** | Daily, an hour or two | Builds audiences, runs campaigns, watches conversion | Campaigns |
| **Customer success** | Daily | Watches account health, renewals, expansion signals | Accounts |
| **RevOps admin** | Weekly or less | Sets up the workspace, data rules, integrations, permissions, plan and billing | Settings |

The admin is the only seat that sees the danger zone and the plan. The SDR and the AE are the density argument: they live in one screen all day, so doors cost them the most.

**Five seats, seven actors.** JOURNEYS.md walks a sales leader and a developer as well. Neither is a sixth seat (IA-MAP §6.4j):

- **AE+** is an account executive seat with direct reports (`reports > 0`). It adds no page: it changes defaults and adds level-one items on pages the AE already holds — the team roll-up first on the forecast, the coverage figure on the deals strip, the rep filter and owner column, comments on a rep's deal, the coaching note inside a logged call. **Meridian Software declares one: Priya Raman, sales manager, with Elena Vasquez reporting to her.** No other business declares one. The usage model carries an optional `aePlus` number on the items whose week differs.
- **The developer** of journeys D1–D4 is the RevOps admin seat. The live job postings title the role RevOps or GTM engineer, and giving it a seat of its own would give Ollopa a seat no business here declares.

## The four example customers

Every case shows its screen serving these four. The point is that the same screen has a different "most used" set for each, and the split must hold for all of them.

| Customer | Size | How they use Ollopa | What that does to the split |
|---|---|---|---|
| **Fathom Labs** | 12 people, seed stage | Two founders and one SDR do outbound. No marketer, no CS. Everyone is admin. | Settings and sequences are daily for everyone; pipeline is small; agents do research the team has no time for |
| **Meridian Software** | 300 people | Marketing feeds SDRs who feed AEs who hand to CS. One RevOps admin. Strict permissions. | Roles are separated; each role's first screen is different; admin items must be invisible to the rest |
| **Halyard Agency** | 25 people, ten client workspaces | Runs outbound for ten clients. Switches workspaces all day. Same tasks, ten times. | Workspace-level settings are daily, not rare; the "rare admin setting" for others is this customer's routine |
| **Ridgeline** | 80 people, product-led | Almost no outbound. Lives in product signals, expansion and renewals. Marketing runs lifecycle campaigns. | Sequences and lists, primary elsewhere, are secondary here; account health and signals are primary |

Halyard is the case that breaks lazy splits. A setting that is "rare" for three customers is daily for the agency. That is why level-one decisions are per role and per segment, and why doors are never labelled by audience.

## Seed data

One demo workspace per example customer, but cases usually show Meridian Software because it has all five seats.

- Meridian Software: 42 users across the five seats, including one sales-manager seat (AE with reports), 18,400 contacts, 3,100 companies, 26 active sequences, 214 open deals across 5 stages, 12 campaigns, 5 integrations connected, 3 agents enabled.
- Fathom Labs: 3 users, 2,200 contacts, 4 sequences, 19 open deals, no campaigns, 2 integrations, 2 agents.
- Halyard Agency: 25 users, ten workspaces of 1,000 to 6,000 contacts each, 40 sequences in total, 1 integration per workspace.
- Ridgeline: 14 users, 9,800 contacts, 2 sequences, 61 open deals, 8 lifecycle campaigns, 4 integrations, 3 agents.

Names, companies and numbers in the seed data are invented. Usage percentages shown on screens are illustrative, fitted to published data, and each screen says where the shape comes from (see [RULES.md](RULES.md), "Where the numbers come from").

## The pages

The page list lives in [IA-MAP.md](IA-MAP.md) part 2 and nowhere else. The map holds 147 nodes — 18 pages, 14 records, 3 quick looks, 3 wizards, 42 panels, 13 settings areas, 45 doors and 6 screenless surfaces, plus three states that cost no level of their own — and it is the file that decides what exists, what reaches what and how deep any route runs. This section lists only the eighteen pages, so that a reader of this file knows the shape of the app; every column that matters (objects, parent, level, seats, workspace profile, plan gate, journeys) is in the map.

Sign-in first: pick the business, pick the person, sign in. A new workspace runs set-up once before the sidebar exists. The sidebar is then built from the seat plus the workspace profile, so no person sees all eighteen.

| Page | What it does | Seats that hold it |
|---|---|---|
| Sign in | Pick the business and the person; no gating here | all |
| Home | Today's tasks, replies, pipeline, agent items waiting, the health strip; sections chosen by seat | all |
| People | The contacts table: filters, views, quick look, find people, reveal and enrich | SDR, AE, MK, OPS |
| Companies | The companies table, its quick look and find companies | SDR, AE, CS, OPS |
| Accounts | The customer-state view of the same companies: health, renewals, expansion signals, plays | AE, CS, OPS |
| Lists | Saved lists and filter-backed segments | SDR, MK, OPS |
| Sequences | Sequences with their health, steps, sending settings and results | SDR, AE, OPS |
| Templates and snippets | Reusable copy, in nobody's sidebar by default: reached by ⌘K, deep link, or a link from a step or a campaign | SDR, AE, MK, OPS |
| Inbox | Replies by outcome, master-detail: the list stays in view and the thread is the open half of the page | SDR, AE |
| Tasks | Calls, LinkedIn steps, follow-ups and meetings due; opens in queue mode for SDR and AE | SDR, AE, CS, OPS |
| Deals | The pipeline board or table, scoped to the seat's own book | AE, CS, OPS |
| Campaigns · Audiences · Forms | Three views on one table: the send, the audience it goes to, and the inbound form that builds one | MK, OPS |
| Workflows | Trigger, rules, actions, credit ceiling and run history, with the routing exceptions beside the rule that made them | OPS, MK |
| Requests | One queue, two kinds: what a teammate asked the admin to change, and what a teammate asked to unlock | OPS |
| Reports | Five tabs on one page: Activity, Pipeline, Sequences, Campaign results, Forecast | AE, MK, CS, OPS |
| Agents | What the agents did, what waits for approval, and the full ledger with its Surface column | SDR, AE, MK, OPS |
| Settings | Thirteen areas on one page — no settings shell, no settings sidebar | all, area by area |
| Not part of your seat | The no-access page: what this area is for, which seats use it, and the admin to ask | all |

Three of those pages are not reached from the sidebar at all — Templates, the no-access page and Sign in — and the map also holds three wizards that behave as pages because each is an independent, staged, resumable task: **Workspace set-up**, **Connect an integration** and **Import and enrich**.

**Four surfaces have no screen we control**, and they carry the hardest version of every rule in this product, because the approval batch, the consequence line, the credit cap and the three kinds of "cannot see it" have to be written as text rather than drawn: **the API**, **webhooks**, **MCP** (read on every plan, writes from Growth) and **a narrow CLI**. Slack and the daily email digest are two more, and both are deep links with a summary, never a control.

Deliberately absent, because they are outside the boundary: a dialer, a booking page, call recording, a browser extension, ads, a website builder, a support desk. The app does not hint that they exist. The agency's ten workspaces are switched in the account menu, and looped over in the CLI.

## Rules the product itself follows

- The product only ever shows the final, disclosed version of every page. The common version exists only inside a lesson's step 0.
- No usage figures, sources, labels or teaching text appear anywhere in the product. Those live in lessons and case files.
- When a role cannot see or do something, the page says so and names who can. Never a silent gap, never a greyed-out control.
- Business and role chosen at sign-in decide what each page shows first, through the usage model, not through modes or switches inside the product.

## The settings inventory

Thirteen areas on one page — no settings shell and no settings sidebar (the full list lives in specs/14-settings.md and src/ollopa/usage/settings.ts; the areas and their panels are nodes in [IA-MAP.md](IA-MAP.md) §2.14). Marked items are decision-critical and are always visible (rule 7).

- **You.** Your details, your mailbox, your credit limit and use, where your notifications go, your agent defaults, your MCP and CLI connections.
- **How your team works.** The workspace profile, what it leaves out of the sidebar, and the signal that brings each left-out page back.

- **Workspace.** Name, logo, timezone, default currency, language.
- **Team and access.** Users (invite, deactivate, credit limit per user), teams, permission profiles, security (MFA, SSO, IP allowlist, password policy, session timeout).
- **Email sending.** Mailboxes (link, warm-up, daily and hourly limits, signature), sending domains (SPF, DKIM, DMARC), tracking subdomain, bounce guard thresholds and status (marked), catch-all blocking, unsubscribe text and whether users may disable it, open and click tracking.
- **Prospecting rules.** GDPR restrictions by region, do-not-call screening, primary email type, duplicate handling, in-progress limit per account, territories.
- **Pipeline and data.** Pipelines and stages with probability and forecast category, contact and account stages, custom fields per object, deal currency, enrichment provider order.
- **Sequences.** Sending schedules, rulesets, priority.
- **Signals, scoring and personas.** The primary score with its threshold and the share above it, score models and their inputs, personas and their sizes, signals and their freshness, expansion routing bands. One door for what is retired.
- **Agents and AI.** Company context, which agents are on, what each may do without approval (marked), per-run and monthly credit caps (marked), bring-your-own model key.
- **Integrations.** CRM sync (pull and push conditions, field mapping, error log), calendar, Slack, enrichment provider.
- **API, webhooks, MCP and CLI.** Keys with their scope and their own spend, the per-workspace limits and the published cost table, webhook subscriptions with the delivery contract and their own state, MCP scope tiers, CLI device authorisations and exit codes.
- **Plan, billing and usage.** Plan and seats, price and renewal date (marked), credit balance and burn rate (marked), invoices, tax ID, cancel plan (marked), export all data, delete workspace (marked).

## What this decides for the first five cases

- **Settings** is a RevOps admin screen at Meridian, with the items finance and marketing touch weekly kept visible, and shown again through Halyard's eyes to prove the split survives.
- **Data table** is the SDR's contacts table: dense, few doors, row actions visible on focus as well as hover.
- **Record page** is the AE's deal page: what is needed to move the deal is on the page; history and enrichment sit behind doors.
- **Setup wizard** is the admin connecting an integration: done once, staged, exit and resume.
- **Agent activity log** is the SDR's view of the research and outreach agents: outcome and pending approvals at level one, the full ledger one click away, interruptions only by exception.
