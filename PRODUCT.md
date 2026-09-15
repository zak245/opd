# Ollopa: the product behind every case

*Ollopa is the invented GTM platform that all OPD cases are built on. It exists so that every case has the same roles, the same customers and the same data, and so that progressive disclosure is tested where it is hardest: one product used in different ways by different kinds of businesses. Nothing here is a real company.*

## What Ollopa is

A go-to-market platform for B2B companies. Teams use it to find companies and people, reach out to them, run the pipeline from first reply to closed deal, and keep the account after the sale.

**Inside the boundary** (widened 15 September 2026, see PLAN.md): people and companies (a company carries its customer state), lists and segments, personas and ICP, signals and scoring, enrichment jobs and credits, sequences with templates and snippets, email threads, tasks, call logging with dispositions (no telephony), the meeting object and its events (no booking page), follow-up drafts and field proposals from conversations (no recording), LinkedIn tasks (no browser extension), pipeline and deals including typed renewals and expansions, campaigns, audiences and forms, workflows, basic reporting, integrations (CRM sync, calendar, email provider, enrichment, Slack) with webhooks, the API, MCP and a narrow CLI, agents and their runs, mailboxes and domains, fields and stages, the admin's intake requests, notes and briefs, workspace and plan.

**Outside the boundary:** telephony, booking pages, call recording, the browser extension, paid ads, website builder, support desk, billing of the customer's own customers. If a case needs one of these, the case is wrong.

The full object model and the 54 approved journeys are in [JOURNEYS.md](JOURNEYS.md). The page map below predates the widened boundary and is superseded by the information architecture map once that exists.

## The five roles

| Role | How often in Ollopa | What they do there | First screen they need |
|---|---|---|---|
| **SDR** | All day | Builds lists, runs sequences, books meetings, works replies | Today's tasks and replies |
| **Account executive** | All day | Works deals through stages, logs calls, forecasts | Pipeline |
| **Marketer** | Daily, an hour or two | Builds audiences, runs campaigns, watches conversion | Campaigns |
| **Customer success** | Daily | Watches account health, renewals, expansion signals | Accounts |
| **RevOps admin** | Weekly or less | Sets up the workspace, data rules, integrations, permissions, plan and billing | Settings |

The admin is the only role that sees the danger zone and the plan. The SDR and the AE are the density argument: they live in one screen all day, so doors cost them the most.

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

One demo workspace per example customer, but cases usually show Meridian Software because it has all five roles.

- Meridian Software: 42 users across the five roles, 18,400 contacts, 3,100 companies, 26 active sequences, 214 open deals across 5 stages, 12 campaigns, 5 integrations connected, 3 agents enabled.
- Fathom Labs: 3 users, 2,200 contacts, 4 sequences, 19 open deals, no campaigns, 2 integrations, 2 agents.
- Halyard Agency: 25 users, ten workspaces of 1,000 to 6,000 contacts each, 40 sequences in total, 1 integration per workspace.
- Ridgeline: 14 users, 9,800 contacts, 2 sequences, 61 open deals, 8 lifecycle campaigns, 4 integrations, 3 agents.

Names, companies and numbers in the seed data are invented. Usage percentages shown on screens are illustrative, fitted to published data, and each screen says where the shape comes from (see [RULES.md](RULES.md), "Where the numbers come from").

## The pages

Sign-in first: pick the business, pick the role, sign in. Then a left navigation with fourteen pages. "Full" pages have every control working. "Real" pages exist with seed data, navigation and the rules applied, with fewer interactions, built from two shared templates (table page, record page).

| Page | What it does | Who lives there | Depth |
|---|---|---|---|
| Home | Today's tasks, replies to work, pipeline at a glance, agent items waiting for approval | Everyone, by role | Full |
| People | The contacts table: search, filters, row actions, add to list or sequence | SDR, AE | Full (lesson 2) |
| Companies | The accounts table | SDR, CS | Real |
| Lists | Saved lists and segments | SDR, marketer | Real |
| Sequences | Sequences with stats; a sequence page with steps and settings | SDR | Real |
| Inbox | Replies from sequences, grouped by outcome | SDR, AE | Real |
| Tasks | Calls, LinkedIn steps, follow-ups due | SDR, AE | Real |
| Deals | Pipeline board by stage; the deal record | AE | Board real; record full (lesson 3) |
| Campaigns | Audiences and campaigns with results | Marketer | Real |
| Accounts | Customer health, renewals, expansion signals | CS | Real |
| Reports | Fixed reports: activity, pipeline, campaign results | Leaders, marketer | Real |
| Agents | What the agents did, what needs approval, the full log | SDR, admin | Full (lesson 5) |
| Settings | Everything in the settings inventory | Admin, finance | Full (lesson 1) |
| Connect an integration | The setup wizard, reached from Settings | Admin | Full (lesson 4) |

Deliberately absent, because they are outside the boundary: a dialer, meetings booking, ads, a website builder, a support desk. The app does not hint that they exist. A workspace switcher for the agency customer is a later case.

## Rules the product itself follows

- The product only ever shows the final, disclosed version of every page. The common version exists only inside a lesson's step 0.
- No usage figures, sources, labels or teaching text appear anywhere in the product. Those live in lessons and case files.
- When a role cannot see or do something, the page says so and names who can. Never a silent gap, never a greyed-out control.
- Business and role chosen at sign-in decide what each page shows first, through the usage model, not through modes or switches inside the product.

## The settings inventory

About 66 items in 10 areas (the full list lives in specs/14-settings.md and src/ollopa/usage/settings.ts). Marked items are decision-critical and are always visible (rule 7).

- **Workspace.** Name, logo, timezone, default currency, language.
- **Team and access.** Users (invite, deactivate, credit limit per user), teams, permission profiles, security (MFA, SSO, IP allowlist, password policy, session timeout).
- **Email sending.** Mailboxes (link, warm-up, daily and hourly limits, signature), sending domains (SPF, DKIM, DMARC), tracking subdomain, bounce guard thresholds and status (marked), catch-all blocking, unsubscribe text and whether users may disable it, open and click tracking.
- **Prospecting rules.** GDPR restrictions by region, do-not-call screening, primary email type, duplicate handling, in-progress limit per account, territories.
- **Pipeline and data.** Pipelines and stages with probability and forecast category, contact and account stages, custom fields per object, deal currency, enrichment provider order.
- **Sequences.** Sending schedules, rulesets, priority.
- **Agents and AI.** Company context, which agents are on, what each may do without approval (marked), per-run and monthly credit caps (marked), bring-your-own model key.
- **Integrations.** CRM sync (pull and push conditions, field mapping, error log), calendar, Slack, enrichment provider, API keys, webhooks.
- **Plan, billing and usage.** Plan and seats, price and renewal date (marked), credit balance and burn rate (marked), invoices, tax ID, cancel plan (marked), export all data, delete workspace (marked).

## What this decides for the first five cases

- **Settings** is a RevOps admin screen at Meridian, with the items finance and marketing touch weekly kept visible, and shown again through Halyard's eyes to prove the split survives.
- **Data table** is the SDR's contacts table: dense, few doors, row actions visible on focus as well as hover.
- **Record page** is the AE's deal page: what is needed to move the deal is on the page; history and enrichment sit behind doors.
- **Setup wizard** is the admin connecting an integration: done once, staged, exit and resume.
- **Agent activity log** is the SDR's view of the research and outreach agents: outcome and pending approvals at level one, the full ledger one click away, interruptions only by exception.
