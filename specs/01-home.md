# Home

*The landing page after sign-in. Full page. Usage items in `src/ollopa/usage/home.ts`.*

## 1. Purpose

Home is the first page every role sees after sign-in and the page the SDR and the AE return to all day. It answers one question: what needs me now? For the SDR, tasks due and replies to work. For the AE, deals that need a next step and deals closing soon. For the marketer, campaigns running. For customer success, renewals and accounts whose health dropped. For the RevOps admin, whether the workspace is healthy: sending, sync, credits.

The SDR and AE visit many times a day. The marketer and CS visit once a day. The admin visits a few times a week, and daily at Fathom and Halyard, where the admin also does outbound.

The one thing they must never lose sight of: what an agent is about to do on their behalf. An agent that will send an email or spend credits waits for a human on Home. That queue, and the safety state of sending, is visible without a click for every role that holds it.

Home is not a dashboard. No charts, no leaderboards, no layout editor. Role and business decide what it shows, through the usage model, at sign-in.

## 2. Data

### 2.1 Fields from the existing seed

| Section | Fields | Source in `seed.ts` / `businesses.ts` |
|---|---|---|
| Header | user, title, business name | `roles[]`, `name` |
| Tasks | kind, contact, company, due, sequence | `Task` |
| Replies | contact, company, sequence, outcome, received, snippet | `Reply` |
| Pipeline | name, company, amount, stage, closeDate, owner, nextStep | `Deal` |
| Agents | agent, when, summary, detail, needsApproval, kind, credits | `AgentEvent` |
| Sequences | name, active, replied, bounced, status, owner | `Sequence` |
| Accounts | name, stage = "Current client", owner, lastActivity | `Company` |
| Credits, plan, counts | balance, monthlyCap, burnPerWeek; seats, renews; campaigns, integrations | `credits`, `plan`, `counts` |

Derived on the page: overdue = due before 2026-09-13; hot replies = Interested or Question; open pipeline = not Closed won; closing = closeDate within 30 days; no next step = nextStep empty; cap date = balance ÷ (burnPerWeek ÷ 7) days from today.

### 2.2 Fields to add to the seed

Append new random draws after the existing ones so current rows do not change.

| Entity | New field | Type | For |
|---|---|---|---|
| `Task` | owner; status; snoozedUntil | user; "open" / "done" / "snoozed" / "skipped"; date or null | Your tasks only; Done, Snooze, Skip persist |
| `Reply` | handled | boolean | A worked reply leaves the queue |
| `Deal` | nextStep | nullable, about 20% null | Deals with no next step |
| `AgentEvent` | to; draft; sources; confidence; decision; approver | contact; string; string[]; "low" / "medium" / "high"; "approved" / "declined" / null; role | Row recipient, detail door, decisions, who may approve |
| `Company` | health, healthDelta7d, renewalDate, arr, expansionSignal | number, number, date, number, string or null (current clients) | Accounts section |
| new `Campaign` | id, name, status, audience, sent, opened, converted, updatedAt | as named | Meridian 12 rows, Ridgeline 8, none elsewhere |
| new `Audience` | id, name, size, sizeDelta | as named | Audiences door |
| new `WorkspaceHealth` per business | bounceRate, bounceGuard ("ok" / "warning" / "paused"), syncErrors, mailboxesNearLimit, invitesPending, setupRemaining[] | as named | Health strip |
| new `Activity` per user | sentThisWeek, callsThisWeek, meetingsBooked | numbers | Your week |

Seed values that light the states: Fathom's credits (4,120 balance, 2,300 a week, 10,000 cap) already project the cap reached in about twelve days, so Fathom's strip is in warning as the seed stands. Halyard gets bounceGuard "warning"; Meridian gets syncErrors 3; Ridgeline is clean.

## 3. Features

### 3.1 What is shown

A header and up to seven sections. Which appear, and in what order, is decided by role and business (section 4). An item with no number for a role is absent from that role's page, never greyed.

**Header.** "Good morning, Marcus", date, business name; at Halyard, the client workspace name. Credits pill, search and notifications stay in the app shell.

**Health strip.** One line above everything, for the roles that hold it: "Sending healthy · bounce 1.8% · sync clean · credits on track". An item in warning or paused state turns its words into a link to where it is fixed and the strip gets a border. Items: bounce guard state, outreach an agent paused, CRM sync errors, mailboxes near their daily limit, credit burn against the cap with the projected date, invitations not accepted, and the door "Setup steps remaining". The marketer and CS see the credits projection only.

**Today.** Tasks due today for the signed-in user, oldest first; overdue tasks above with a count and a red date. Row: type badge, contact, company, source sequence, Done. Snooze and Skip in the row menu. Door: "Tomorrow and later (n)". Link: All tasks.

**Replies.** Interested and question replies not yet handled, newest first. Row: contact, company, outcome badge, first line of the reply, Reply, Book a meeting. Mark not interested and Unsubscribe in the menu. Door: "Not now and out-of-office replies (n)". Link: Inbox.

**Pipeline.** AE: "Your open deals" as a total and count, then "No next step (n)" and "Closing in 30 days (n)"; row: deal, amount, stage, close date, Open. Admin and CS: team total and count, and closing. Door: "By stage and forecast category". Link: Deals.

**Waiting for your approval.** Every agent event with needsApproval and no decision, oldest first. Row: agent, what it proposes ("Send a first email to Lena Costa at Bluefin Logistics"), credits it will spend, Approve, Decline, and a per-row door "What the agent found" (full draft, sources, confidence, in place). With two or more waiting, the header has "Approve all (n) · 48 credits" with a confirmation listing what will be sent. Door: "What agents did this week (n)". Link: Agents. Empty: "No agent actions waiting."

**Campaigns.** Marketer. Campaigns running with sent, opened and converted since yesterday. Door: "Audiences that changed (n)". Link: Campaigns.

**Accounts.** CS, and the Ridgeline AE. Three short lists: "Renewals in 60 days", "Health dropped this week", "Expansion signals". Row: account, owner, the number that matters, Open. Link: Accounts.

**Your week.** One line: "Sent 212 · Calls 38 · Meetings booked 6 · Sequences: 4 active, 31 replied, 2 bounced". Link: Reports.

### 3.2 Actions and outcomes

| Action | Where | Outcome |
|---|---|---|
| Done | Task row | Row leaves, count drops, toast with Undo |
| Snooze / Skip | Row menu; Skip below a divider | Moves to "Tomorrow and later" / sequence step skipped; toast with Undo |
| Reply | Reply row | Opens the reply drawer (a later case); handled on send |
| Book a meeting | Reply row | Meeting link sent; handled; toast |
| Mark not interested | Row menu | Stage set, removed from sequence; toast with Undo |
| Unsubscribe | Row menu, below a divider | Confirmation: "Lena Costa will never be emailed from this workspace again", then toast |
| Open | Deal, account row | Navigates to the record |
| Approve / Decline | Approval row | Agent proceeds and credits are spent, or agent stops; row moves to the week list; toast names the cost |
| Approve all | Section header | Confirmation lists each action and total credits, then as Approve |
| Expand all / Collapse all | Page header | Every door on the page |
| Retry | A failed section | Reloads that section only |

Every destructive or credit-spending action states its consequence before it runs (Unsubscribe, Skip, Approve all) or in its toast with Undo. Approve states cost on the row, before the click.

### 3.3 Filters, search, sorting, columns

None. Home is a queue, not a table. Order is fixed: overdue then due, oldest first; replies newest first; approvals oldest first; renewals soonest first. Filters and search live on Tasks, Inbox, Deals and Agents, one click away by the section link. Search across everything is ⌘K in the shell.

### 3.4 States

| State | Behaviour |
|---|---|
| Empty section | One sentence and a link: "Nothing due today. Tomorrow has 4." Empty sections shrink to one line and do not disappear, so the page keeps its shape. |
| Empty page (new workspace) | "Setup steps remaining (3)" open by default the first time; everything else shows its empty sentence. No tour. |
| Loading | Each section renders its header and three grey rows of fixed height and fills independently. The strip shows "Checking…", never green before data arrives. |
| Error | The failing section shows "Couldn't load tasks. Retry." Others work. The strip shows "Sending state unknown. Retry." in warning style. |
| No access | Every role has Home. A section the role does not hold is absent. An approval the role may not grant replaces Approve and Decline with "Only Daniel Okafor (RevOps admin) can approve this." |

### 3.5 Keyboard and shortcuts

Rows are focusable list items. J and K or arrows move; D done; S snooze; R reply; B book; A approve; X decline; Enter opens; E toggles the row's door. Tab moves between sections and doors. Every shortcut appears in the row menu next to its item and in the ⌘K palette ("Approve all pending agent actions · A"). Escape closes a menu and returns focus.

### 3.6 Accessibility

Each section is a `<section>` with a heading; each door a `<button>` in the heading with `aria-expanded` and `aria-controls`, the count in its name. Collapsed content uses `hidden="until-found"`. Row actions are buttons, visible on focus as well as hover and repeated in the menu, so nothing is hover-only. Toasts go to a polite live region, strip changes to an assertive one. Reveals animate 150 to 240 ms with a reduced-motion crossfade; a door revealing more than five rows moves focus to the first. Warning states carry words and a border, never colour alone. AA contrast in both themes.

### 3.7 Phone width

One column, same order. The strip wraps to two lines. Each row shows one primary action (Done, Reply, Approve) and a "…" menu for the rest. Doors, counts and links are identical; nothing level one on desktop becomes level two on the phone. Targets 44 px. Section headers stick. Print expands every door.

### 3.8 Differences by role and business

| | SDR | AE | Marketer | CS | Admin |
|---|---|---|---|---|---|
| First section | Today | Pipeline | Campaigns | Accounts | Strip, then Approvals |
| Strip items | bounce, paused, mailboxes, credits | credits | credits | credits | all |
| Approvals | yes | yes | scoring and research agents | Ridgeline only | yes |
| Pipeline | no | yours + two lists | no | team total (Ridgeline) | team total, closing |
| Accounts | no | Ridgeline only | no | yes | no |
| Your week | yes | yes | no | no | no |

- **Fathom Labs.** The founder does two jobs, so the page stacks the SDR's sections above the admin's: strip, Today, Replies, Approvals, Pipeline, Your week. The strip is in warning from the seed: "Credits: at 2,300 a week the cap is reached on 25 September." "Setup steps remaining (2)" stays until the missing integrations are connected.
- **Meridian Software.** Baseline. Each role gets only its column. The SDR's row for an outreach approval it cannot grant names the admin.
- **Halyard Agency.** Every task row shows the sequence, because the name tells the specialist which client it is. Bounce guard, mailboxes near limit and paused outreach sit in the strip for the SDR as well as the admin. Pipeline is the team total only.
- **Ridgeline.** Tasks are inbound follow-ups; replies and sequences drop to the tail. The expansion AE gets Accounts with expansion signals above the pipeline lists. CS gets a team pipeline line. The marketer's Audiences door is level one and open.

## 4. Usage items

Weekly use is the share of active users in the role touching the item in a typical week (USAGE-MODEL.md). Baseline is Meridian. Level one at 20 and above, or decision-critical (*). A blank cell means the role does not hold the item. Numbers are illustrative, fitted to the Nielsen, Pendo and McGrenere and Moore shapes in RULES.md.

| Item | Area | SDR | AE | Mkt | CS | Admin | Overrides |
|---|---|---|---|---|---|---|---|
| Tasks due today | Today | 90 | 60 | 4 | 45 | 10 | Fathom admin 60; Ridgeline SDR 55, CS 50 |
| Overdue tasks | Today | 50 | 30 | | 20 | 4 | Fathom admin 35; Ridgeline SDR 25 |
| Snooze to tomorrow | Today | 18 | 12 | | 15 | 3 | Fathom admin 15 |
| Skip task | Today | 12 | 6 | | 5 | 2 | |
| Which sequence the task comes from | Today | 15 | 6 | | 2 | 2 | Halyard SDR 30 |
| Tomorrow and later (door) | Today | 22 | 10 | | 15 | 3 | Fathom admin 15 |
| Interested and question replies | Replies | 85 | 45 | 3 | 2 | 4 | Fathom admin 55; Ridgeline SDR 40, AE 25 |
| Book a meeting | Replies | 55 | 30 | | | 2 | Fathom admin 40; Ridgeline SDR 30, AE 20 |
| Mark not interested | Replies | 18 | 8 | | | 2 | Ridgeline SDR 6 |
| Unsubscribe | Replies | 8 | 3 | | | 1 | |
| Not now and out-of-office replies (door) | Replies | 15 | 6 | | | 2 | Ridgeline SDR 5 |
| Your open deals: total and count | Pipeline | 4 | 85 | | 6 | | Fathom admin 65, SDR 15; Ridgeline CS 10 |
| Team pipeline total | Pipeline | 6 | 30 | 10 | 15 | 30 | Fathom admin 40; Halyard admin 25, SDR 4; Ridgeline CS 30 |
| Deals with no next step | Pipeline | | 60 | | | 10 | Fathom admin 40 |
| Closing in the next 30 days | Pipeline | | 55 | | 10 | 25 | Fathom admin 40; Ridgeline CS 15 |
| Deals by stage and forecast category (door) | Pipeline | 2 | 15 | | 5 | 15 | |
| Waiting for your approval * | Agents | 55 | 25 | 15 | 5 | 45 | Fathom admin 70, SDR 60; Halyard admin 60, SDR 55; Ridgeline SDR 20, AE 20, CS 20, Mkt 25 |
| Credits each approval will spend * | Agents | 55 | 25 | 15 | 5 | 45 | as above |
| What the agent found (door) | Agents | 18 | 10 | 8 | 3 | 18 | Fathom admin 30, SDR 25 |
| What agents did this week (door) | Agents | 15 | 6 | 8 | 2 | 25 | Fathom admin 40; Halyard admin 35 |
| Outreach an agent paused * | Agents | 8 | 2 | | | 15 | Halyard admin 30, SDR 20; Ridgeline admin 3, SDR 2 |
| Bounce guard state * | Health | 12 | 3 | | | 35 | Halyard admin 60, SDR 30; Fathom admin 30; Ridgeline admin 8, SDR 3 |
| Mailboxes near their daily limit | Health | 15 | 4 | | | 15 | Halyard admin 45, SDR 40; Fathom admin 25; Ridgeline SDR 3, admin 5 |
| Your sequences: active, replied, bounced | Health | 45 | 10 | | | 8 | Halyard SDR 60, admin 30; Fathom admin 35; Ridgeline SDR 8, AE 3, admin 2 |
| CRM sync errors | Health | | 4 | | 4 | 30 | Fathom admin 3; Halyard admin 25 |
| Credit burn against the monthly cap * | Health | 30 | 15 | 20 | 5 | 55 | Fathom admin 60, SDR 40 |
| Invitations not yet accepted | Health | | | | | 15 | Fathom admin 3; Halyard admin 10 |
| Setup steps remaining (door) | Health | | | | | 10 | Fathom admin 30; Halyard admin 20 |
| Campaigns running | Campaigns | 3 | 3 | 85 | | 8 | Ridgeline Mkt 90, CS 10 |
| Results since yesterday | Campaigns | | | 70 | | 3 | Ridgeline Mkt 80 |
| Audiences that changed (door) | Campaigns | | | 18 | | 2 | Ridgeline Mkt 25 |
| Renewals in the next 60 days | Accounts | | 10 | | 80 | 8 | Ridgeline CS 90, AE 40, admin 15 |
| Accounts whose health dropped | Accounts | | 6 | | 75 | 4 | Ridgeline CS 85, AE 30 |
| Expansion signals | Accounts | | 15 | | 40 | 3 | Ridgeline CS 70, AE 60, Mkt 15 |
| Your week: sent, calls, meetings booked | Activity | 22 | 20 | 3 | 8 | 6 | Fathom admin 20; Ridgeline SDR 10, AE 8 |
| Team leaderboard (removed) | Activity | 4 | 4 | 1 | | 4 | |
| Email funnel (removed) | Activity | 5 | | 8 | | 4 | Ridgeline SDR 1, Mkt 4 |
| Edit layout, widgets, saved layouts (removed) | Layout | 2 | 2 | 3 | 2 | 3 | |

Decision-critical (*): the approval queue and the credits each approval spends (an agent about to send or spend is a pending approval); outreach paused by an agent and the bounce guard state (sending stopped without a human); credit burn against the cap (price).

Actions are folded into the row they belong to: "Tasks due today" carries Done, "Interested and question replies" carries Reply, "Waiting for your approval" carries Approve and Decline, deal and account rows carry Open. Only actions that are a separate choice (Snooze, Skip, Book, Mark not interested, Unsubscribe) are items of their own.

**Shape check** (38 items, computed from `home.ts` with `shape()` in `model.ts`):

| Role at business | Head | Body | Tail | Verdict |
|---|---|---|---|---|
| Meridian SDR | 10 (26%) | 13 (34%) | 15 (39%) | Fits; the densest role sits at the top of the band |
| Meridian admin | 8 (21%) | 12 (32%) | 18 (47%) | Fits |
| Ridgeline CS | 8 (21%) | 9 (24%) | 21 (55%) | Fits |
| Ridgeline SDR | 8 (21%) | 11 (29%) | 19 (50%) | Fits |
| Meridian marketer | 3 (8%) | 7 (18%) | 28 (74%) | Under: most of Home belongs to other roles, so the marketer's page is short |
| Fathom admin | 18 (47%) | 6 (16%) | 14 (37%) | Over: one person holds two jobs; each band fits on its own |
| Halyard SDR | 14 (37%) | 8 (21%) | 16 (42%) | Over by design: what is monthly elsewhere is daily at the agency |

## 5. Before: the common version

Modelled on Apollo's Home, from the knowledge base article "Home Overview" (updated 2 September 2026, fetched 13 September 2026 via the Zendesk API), the engineering post "Building Apollo's New Home" (17 December 2024), the 2025 release notes, and public reviews. Anything not confirmed first-party is marked unverified.

### 5.1 Layout and navigation

Apollo's Home is "a customizable workspace for reviewing your ongoing work, recommendations, and the performance insights that matter most to you". It is a canvas of widgets. The user gets a default layout, then can "Switch layouts and add, remove, or rearrange widgets". The engineering post describes a toolbar that toggles edit and view modes, a canvas with drag-and-drop, resize and remove, and a widget library; defaults are "pre-designed templates, based on Apollo's insights into what users find most valuable".

Sixteen widgets are documented: Recommendations, Tasks, Suggested leads, Recent replies, Pending deals, Email stats, Call stats, Emails sent, Quota attainment, Calls made, Sequence stats, Email funnel, and four leaderboards. Eleven are performance charts. Which are in the default layout is not stated: unverified.

Labels and paths from the article: Edit layout → Delete → "+" opens the widget library → drag onto the canvas → drag ⤡ to resize → Save changes → "apply the updates to the current layout or save a new layout". Recommendations: "View recommendation", then "Mark complete, Save for later, or Dismiss". Stats widgets: "Click ≡ to adjust the time range… Click ☲ to adjust the filters in a full report." Charts: "Click Create goal"; "Click ... to view the full report, clone it, or download the data via a CSV file."

Widgets appear and disappear on their own: "Some widgets only show information when you already use the related Apollo feature or have relevant data to display." New users get "personalized onboarding" on Home. An older version of the article described a Setup tab with "Next steps for you" and "Remove set up tab" (recorded in `knowledge-base/sources/07-apollo-settings-map.md`); those labels are not in the current article: unverified today. The main navigation around Home is in the settings map, §6.

### 5.2 Problems, each with a source

1. **Customisation is the disclosure strategy.** Apollo's answer to "what should be on Home for you" is Edit layout. Fewer than 5% of users ever change a setting (Spool, UIE 2011); RULES.md rule 6 calls "let admins customise it" an abdication of the default. The templates come from aggregate "insights into what users find most valuable" (engineering post), the mistake Microsoft's adaptive menus made: the aggregate head is nobody's head (Jensen Harris, rule 1).
2. **Widgets that hide themselves.** Sections appear when data exists and vanish when it does not; "Why don't I see a widget or specific data on home?" is a FAQ in the article. A user cannot tell whether a widget is off, empty or unavailable. Rule 4 removes doors that do not apply, but a section that applies and is empty must say so.
3. **Reports on the landing page.** Eleven of sixteen widgets are charts and leaderboards with their own ≡, ☲ and ... menus, each an unlabelled icon; NN/g (2014) measured 0% click-through on an unlabelled icon (rule 4). The article sends readers to "Use Analytics Reports" for detail, so the charts duplicate another page.
4. **Three interactions per widget setting.** Widget → ≡ → range, repeated per widget; widget → ... → full report → filters. Rule 2 stops at two. Reviews agree: "too many clicks to reach data many navigation buttons seems to be not in the logical place" (Trustpilot, 4 September 2026); "one click too many each time" (G2, via SyncGTM, secondary).
5. **Cost of an AI action is not on the recommendation.** Recommendations offer Mark complete, Save for later and Dismiss; whether one shows the credits it will spend is not stated: unverified. Users report the result: "Apollo AI assistant ran operations quoting me a certain amount of credits, and then racked up a separate bill" (Trustpilot, 18 August 2026); "watch the credit system closely or you'll get surprised at the end of the month" (Reddit, via Cleverly, secondary). Rule 7 puts price on the row.
6. **Safety state is elsewhere.** Bounce guard, paused sequences and sync errors live under Settings › Email setup and health and the integration error logs (settings map §1.3), not on Home. Apollo's 2025 release note admits the cost: "no more jumping between multiple settings pages". Rule 7 puts safety state where no click is needed.
7. **Onboarding pushed onto the work surface.** New users get onboarding on Home, and the older Setup tab had to be removed by hand. NN/g's finding (knowledge base checklists): pull help beats push tours; every hint must be dismissible.
8. **Density on the task grid.** "The grid for making calls and completing tasks is a bit messy. There's a lot of information there" (G2, via Warmly, secondary). "The interface can feel a bit overwhelming at first" (Capterra, 31 October 2025).

What Apollo gets right and Ollopa keeps: a credits pill in the top bar (settings map §6); "View all tasks" and "View all deals" links from each widget; Recent replies grouped by outcome.

## 6. After: the disclosed version

### 6.1 Layout

Desktop (1024 px and up): header, health strip across the full width, then two columns. Left: the role's work queue (Today and Replies for SDR and AE; Campaigns for the marketer; Accounts for CS). Right: Waiting for your approval first, then Pipeline (Accounts for the Ridgeline AE), then Your week. Admin: Approvals left, Pipeline right, the strip carries the rest. Positions are fixed per role; nothing moves with use. Phone: one column, strip, first section, approvals, the rest.

### 6.2 Level one and level two per role

| Role | Level one | Level two (doors) |
|---|---|---|
| SDR | Strip; overdue and due tasks with Done; hot replies with Reply and Book; approvals with cost; sequence line; your week | Tomorrow and later; other replies; agent detail; agent week; row menus |
| AE | Strip (credits); your deals, no next step, closing; due tasks; hot replies; approvals | By stage and forecast; tomorrow and later; other replies; agent detail; agent week |
| Marketer | Strip (credits); campaigns with results; approvals | Audiences that changed (open by default at Ridgeline); agent detail; agent week |
| CS | Strip (credits); renewals, health dropped, expansion; due tasks | Tomorrow and later; by stage (Ridgeline); agent detail |
| Admin | Strip (all); approvals; team pipeline and closing; agent week | Setup steps remaining; by stage and forecast; agent detail |

Across businesses, as in 3.8: Fathom stacks the SDR band above the admin band; Halyard lifts health items and the sequence name to level one for the SDR; Ridgeline puts Accounts first for the AE; Meridian is the baseline.

### 6.3 Every door

| Door label | Content | Container | Where |
|---|---|---|---|
| Tomorrow and later (n) | Tasks due in the next five days | In place | Bottom of Today |
| Not now and out-of-office replies (n) | Remaining replies with Mark not interested and Snooze | In place | Bottom of Replies |
| By stage and forecast category (n deals) | Five-column count grid and forecast totals | In place | Bottom of Pipeline |
| What the agent found | Full draft, sources, confidence | In place, inside the row, next to Approve | Each approval row |
| What agents did this week (n) | Researched, drafted, sent, scored, paused, credits used, decisions | In place | Bottom of Approvals |
| Audiences that changed (n) | Audience, size, change since yesterday | In place | Bottom of Campaigns |
| Setup steps remaining (n of m) | Steps not done, each a link into Settings or Connect; removed when done | In place | Health strip |
| Row menu (…) | Secondary actions with shortcuts; destructive below a divider | Menu | Every row |

Every door is a chevron plus text, in the reading path, directly under or inside what it reveals. No door contains a door. Section links (All tasks, Inbox, Deals, Agents, Campaigns, Accounts, Reports) are navigation, not doors.

### 6.4 Persistence

Door state is saved per user and door (`ollopa.home.doors`) and restored next visit. Expand all and Collapse all in the page header; print expands everything. Done, Snooze, Skip, handled replies and agent decisions persist for the session. Nothing reorders. The only things that appear by state are strip items and the overdue block, all driven by object state.

### 6.5 Accelerators

Row shortcuts (D, S, R, B, A, X, E, Enter, J and K), shown in every row menu. ⌘K commands for every section link and for "Approve all pending agent actions", each showing its key. Approve all with a cost total. Doors remember. The daily user reaches every level-one item without a door and every level-two item with one keystroke.

### 6.6 Decision-critical, always visible

The approval queue and the credits on each row. Outreach paused by an agent. Bounce guard state. Credit burn against the cap with the date it runs out. The consequence of Unsubscribe, Skip and Approve all, stated before the action runs. Decline is as short a path as Approve.

### 6.7 Removed, not hidden

Edit layout, widget library, resize, saved layouts and the layout switcher (under 5% for every role at every business). The four leaderboards (4% or under). Email funnel (8% at most; Reports has it). Emails sent, Calls made, Quota attainment charts and Create goal (Reports). Suggested leads (the research agent's proposal is an approval). The onboarding tab (setup steps are one door in the strip). Per-widget ≡ and ☲ menus.

### 6.8 The nine-point score

| # | Question | Score | Why |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | Approvals with cost, paused outreach, bounce state, cap projection; consequences stated before the action |
| 2 | Every visible item backed by a usage number with a source | 2 | Section 4, from `home.ts`, fitted to the shapes in USAGE-MODEL.md |
| 3 | No path over two levels on any screen size | 2 | Screen and one door; row menus one deep; identical on the phone |
| 4 | Every door labelled by content with chevron and text | 2 | Section 6.3; counts in labels; no "More", no "Advanced" |
| 5 | Every door next to what it reveals, keyboard and touch | 2 | In place under or inside its section; buttons with `aria-expanded`; 44 px targets |
| 6 | No dependent information split by a door | 2 | What, to whom and cost sit on the approval row with Approve; only the draft body is behind the door |
| 7 | Door state persists; expand all and print | 2 | Section 6.4 |
| 8 | Disclosure by user action or object state, never history | 2 | Strip and overdue by object state; no reordering; no layout memory |
| 9 | Door usage instrumented, scheduled review | 1 | Events specified (`home.door.open` with door, role, business; `home.action` with action id) and a semi-annual promote, keep or delete review named, but OPD has no analytics, so the numbers are fitted, not measured |

**17 of 18.**

## 7. The rules that mattered most

Home is not a lesson. Four rules did the work:

- **Rule 1.** The page is composed per role and business from weekly use, not from an aggregate default layout the user is expected to fix.
- **Rule 7.** An agent about to send or spend is a pending approval with its cost on the row; sending safety and credit burn are one line at the top.
- **Rule 6.** Nothing moves with use. Sections appear by object state and never by history; there is no layout editor.
- **Rule 8.** Charts, leaderboards and the widget library were deleted, not hidden; the daily user gets row shortcuts and Approve all.

## 8. Review

| Check | Result | Gap found and closed |
|---|---|---|
| All roles covered | Yes | The marketer had one line; Campaigns with results, the Audiences door and agent approvals were added |
| All four businesses covered | Yes | Halyard's SDR lacked the sequence name on tasks (override added); Ridgeline's AE had Pipeline first (Accounts now first) |
| Every field has a source | Yes | Campaigns, account health, workspace health, activity, task status, agent draft and decision were missing; 2.2 adds them |
| Every action has an outcome | Yes | 3.2, with Undo or a stated consequence |
| Empty, error, no-access states | Yes | 3.4. Empty sections first disappeared, the Apollo problem; they now shrink to one sentence |
| Keyboard | Yes | 3.5; every shortcut shown in the menu and the palette |
| Phone width | Yes | 3.7; one column, same levels |
| Decision-critical visible | Yes | 6.6; credits were behind the detail door in the first draft and moved to the row |
| Two levels maximum | Yes | 6.3; nothing nests |
| Doors labelled by content | Yes | Every label carries a noun and a count |
| Dependent fields together | Yes | Summary, recipient and cost on one row with Approve and Decline |
| State persists | Yes | 6.4 |
| Accelerators present | Yes | 6.5 |
| Usage shape checked | Yes | Seven pairs computed; four fit; three explained |
| Nothing hover-only | Yes | Row actions on focus and in the menu; doors are buttons |
| Role gaps explain themselves | Yes | Absent sections; an approval a role cannot grant names who can |
| No usage numbers or teaching text on the page | Yes | Numbers live in `home.ts` and here; the page shows counts of work only |
