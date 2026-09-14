# Agents

*Full page. Lesson 5: the agent activity log with pending approvals. Usage items: `src/ollopa/usage/agents.ts`. Rules: `RULES.md`. Evidence for the agent rules: `knowledge-base/sources/04-b2b-saas-practice-and-case-studies.md`, sections 1.3 and 8.*

## 1. Purpose

Three agents work in every Ollopa workspace. The research agent reads company sites, news and profiles before first contact. The outreach agent drafts emails, proposes adding people to sequences and sends the steps it is allowed to send. The scoring agent rates fit and intent. They run while nobody is looking. This page is where a person finds out what they did, decides what they may do next, and sees what it cost.

Who lives here: the SDR, several times a day, to approve or decline what the outreach agent proposes for their contacts. The RevOps admin, a few times a week, to read the ledger and the spend. The AE and the marketer come when something waits for them. Customer success has no Agents page in the navigation.

The one thing they must never lose sight of: **what is waiting for my decision, what will happen if I say yes, and what it costs.** An email sent by an agent cannot be unsent. Credits spent by an agent cannot be refunded. Both are decision-critical (rule 7).

The page must pass Nielsen's 30-second briefing test (2026): can a returning user absorb the status, the spend and the pending decisions in 30 seconds, without clicking?

Agent settings (which agents are on, what each may do without approval, credit caps, the model key) live in Settings under "Agents and AI", not here. This page links there and, for people who cannot change them, names who can.

## 2. Data

### What exists in the seed

`seed.agentEvents` (`src/ollopa/data/seed.ts`): 30 events per business over the last three days.

| Field | Shown as |
|---|---|
| `id` | Row key; target of "Copy a link to this event" |
| `agent` (Research, Outreach, Scoring) | Agent column and filter; the actor named on every row |
| `when` | Day header |
| `summary` | The one-line event: "Drafted a first email to Amara Okonkwo" |
| `detail` | First line of the step log |
| `needsApproval` | Puts the event in "Waiting for you" |
| `kind` (researched, drafted, scored, proposed, sent, paused) | Kind filter; icon on the row |
| `credits` | Credits column; summed into the day digest and the week figure |

`businesses.ts`: `counts.agents` (2 at Fathom and Halyard, 3 at Meridian and Ridgeline), `credits.balance`, `credits.monthlyCap`, `credits.burnPerWeek`, the role seats (names for "who can change this"). `seed.contacts`, `seed.companies`, `seed.sequences`: the names events refer to and the sequence a proposal targets.

### What must be added to the seed

1. **Agent definitions per business**, `seed.agents`: `{ id: "research" | "outreach" | "scoring", name, on, can: string[], needsApprovalFor: string[], capPerDay, capPerMonth, spentToday, spentThisWeek, pausedReason? }`. Fathom and Halyard have research and outreach only; a tile for an agent that does not exist is a door with nothing behind it (rule 4). `can` and `needsApprovalFor` are copied from Settings, so the tile can say what the agent does and what it never does without a person.
2. **Event status**, replacing the boolean: `status: "waiting" | "approved" | "declined" | "done" | "paused" | "snoozed"`, plus `decidedBy` and `decidedAt`. `needsApproval` stays as a derived getter so Home keeps working.
3. **Time of day**, `at: "HH:MM"`.
4. **Contact and company references**, `contactId`, `contact`, `company`.
5. **The consequence**, `ifApproved: { action: "send" | "enrol" | "enrich" | "score"; mailbox?; sequence?; sendsAt?; credits }`, rendered as one sentence under every waiting item.
6. **The step log**, `steps: { at; text; credits; source? }[]`, three to eight per event. Research: "Read northwindanalytics.com (2 credits)", "Read 2 news items (4 credits)", "Read 3 profiles (6 credits)", "Wrote 3 signals". Drafted: "Used company context", "Used research from 12 Sep", "Drafted 142 words", "Checked mailbox marcus@meridian.io: warm, 38 of 120 sent today". Scored: "Fit 84 from industry, size, stack", "Intent 61 from 2 signals", "Score 82".
7. **The draft body**, `draft?: string`, 120 to 160 words with a subject line, on drafted and proposed events.
8. **Volume**: 60 events per business, including batch runs (one event with a 25-company step list and 300 credits), so the week's total approaches the agent share of `credits.burnPerWeek`: 60% at Fathom, 35% at Meridian, 45% at Halyard, 30% at Ridgeline.
9. **One cap event** at Fathom on Friday, `kind: "capped"`: "Research agent stopped at its daily cap of 300 credits at 14:10".
10. **Notification preference** on the session, `notifyWhenWaiting: "off" | "email" | "slack"`, and `lastSeenAgents`, a timestamp set when the page unmounts, for "Since you last looked".

Derived on the page, never stored: credits today, credits this week, credits per day, runs per agent per day, the digest sentence.

## 3. Features

### Layout, top to bottom

1. **Briefing.** One sentence: "Since Thursday 17:20: 3 agents ran 41 events. 6 waiting for you. 1 paused. 214 credits this week of 1,000." The credit figure is a small bar against the agent cap, with the workspace balance in grey after it. Under the sentence, one tile per agent: name, on or off, runs today, credits today, one line on what it does, one line on what it never does without a person, and "Pause" for anyone allowed to pause. At Halyard the briefing starts with the client workspace name.
2. **Exceptions.** Present only while something is paused or capped: the reason, the number that tripped it, the threshold, and "Resume", "Keep paused", "Open bounce guard" (a link into Settings). When nothing is paused the section does not exist.
3. **Waiting for you.** The approval queue, oldest first. Each item: the agent, the summary, the consequence sentence, the credits, Approve, Decline, and one door labelled by what it holds ("Read the draft · 142 words", "Research · 3 signals · 4 sources", "Score 82 · how it was built"). Nothing waiting: one line, "Nothing waiting."
4. **Activity.** The ledger: search, filters, then every event newest first, grouped by day with a digest line per day ("Fri 12 Sep · 11 events · 3 researched, 2 drafted, 5 scored, 1 sent · 62 credits"). Columns: When, Agent, What happened, Contact or company, Outcome, Credits. Every row has a step-log door.

### The waiting item

Actor ("Outreach agent", never a bare "AI"). Summary with the contact's title and company. Consequence if approved: "Sends now from marcus@meridian.io. 0 credits. Replies land in your Inbox." or "Adds Amara Okonkwo to 'Q4 enterprise outbound'. Step 1 sends Mon 15 Sep 09:00 from your mailbox. Enriches first: 4 credits." Under Decline, as help text: "Nothing is sent. The agent is told." Age: "Waiting since Fri 14:02". Credits, right-aligned, in the same column as the ledger.

### Actions

Always visible on a waiting item: Approve, Decline, the content door. In the "…" menu, in this order: Approve, Decline, Edit then approve, Tell the agent why, Decide tomorrow, Hand to a teammate, Open the contact, Copy a link. Nothing is reachable only one way.

| Action | Outcome |
|---|---|
| Approve | Item slides out; toast says what happened: "Sent to Amara Okonkwo from marcus@meridian.io." or "Added to Q4 enterprise outbound. First step Monday 09:00. 4 credits spent." Ledger row gains "Approved by Marcus Adeyemi 09:14". On failure (mailbox paused, cap reached) nothing moves and the reason appears in red under the buttons. |
| Decline | Item leaves; toast "Declined. Nothing was sent." Ledger row reads "Declined by Marcus Adeyemi 09:15". |
| Edit then approve | The draft opens in place, editable; the button under it reads "Send edited draft" with the same consequence sentence. |
| Tell the agent why | A short text field; sending it declines the item and adds the note to the step log. |
| Decide tomorrow | Moves the item to the bottom, badge "Snoozed until tomorrow 08:00". A proposal whose send time is earlier than tomorrow is declined instead, and the item says so before you confirm. |
| Hand to a teammate | Person picker; the item leaves your queue; the teammate is notified; the ledger records the handover. |
| Select several | Checkbox per item and "Select all 6"; the bar reads "Approve 6 · Decline 6" with the total consequence: "Sends 4 emails from your mailbox, adds 2 people to sequences, 8 credits." Items whose mailbox is paused stay behind and say why. |

Ledger rows: the step-log door; in "…": Open the contact, Run again with a note (the toast quotes the cost first: "Re-research Northwind Analytics: about 12 credits. Run"), Flag a wrong result (marks the row and tells the agent; undoes nothing), Copy a link.

Page: Expand all steps / Collapse all above the ledger; in "…" next to the Activity heading: Export CSV (admin and marketer), Show or hide columns, Print (print CSS expands every step). "Agent settings" links to Settings › Agents and AI; for a role that cannot change them the line reads "Agent settings are changed by Daniel Okafor, RevOps admin."

Agent tiles: click filters the ledger by that agent (object state, not a door). "Pause" confirms in place: "Pause the outreach agent? Nothing more is drafted or sent until someone resumes it. Items already waiting stay waiting." Resume sits in the same place while paused.

### Filters and search

Search matches summary, contact, company, sequence and step text. Filters, left to right: Agent; Contact or company (a combobox over the seed); then one door, "Date, outcome, kind, teammate ▾", holding the filters under 20% for the signed-in role and business. Any of them at 20% or more is promoted out of the door and shown beside Agent (teammate for Halyard's admin). The door's label always lists what is still inside it; it never says "More". Set filters show as chips with "Clear"; the count reads "38 of 60 events".

The teammate filter exists only for people who see other people's items (admins; everyone at Fathom). Everyone else sees a heading, "Your contacts' activity", with the line "Everyone's activity is visible to Daniel Okafor".

### Sorting and columns

Newest first, always; day groups cannot be reordered. Waiting items are not repeated in the ledger. "Show or hide columns" lets Contact and Outcome be hidden, remembered per user.

### States

| State | What shows |
|---|---|
| No agents on | Briefing: "No agents are on at Meridian Software." Queue and ledger replaced by "Turn an agent on in Settings › Agents and AI" (link) or, for non-admins, "Daniel Okafor, RevOps admin, can turn agents on." |
| Nothing waiting | "Nothing waiting." |
| No events in range | "Nothing matches. Clear the search or a filter." |
| Loading | Skeleton bars for the briefing numbers and three rows; credit numbers never render as 0 while loading. |
| Ledger fails to load | Briefing and queue render from cache; the ledger shows "Couldn't load activity. Showing what was loaded at 09:12. Retry." |
| Approve or decline fails | Item stays; reason in red under the buttons; nothing else moves. |
| Cap reached | Exception line; waiting items that spend credits show "Will wait for the cap to reset at 00:00" beside their credits; Approve queues instead of sending. |
| No access (CS, or a profile without agents) | Title and one paragraph: "Agents isn't part of the Customer success role at Meridian Software. Daniel Okafor, RevOps admin, can add it to your permission profile." No greyed controls. |

### Keyboard, accessibility, phone

`j`/`k` move through the queue then the ledger; `a` approves, `d` declines, `e` toggles the row's door, `x` selects, `Enter` opens the contact, `/` focuses search, `Escape` clears. `⌘K` lists "Approve all drafts to verified emails", "Show only the research agent", "Expand all steps", "Go to agent settings", each with its shortcut; the "…" menus show shortcuts too. Every door is a `button` inside a heading with `aria-expanded` and `aria-controls`; the queue is a list with `aria-live="polite"` ("Approved. 5 waiting."); exception lines are `role="status"`; actor names are text; credits carry a visually hidden "credits"; waiting, paused and declined each have a word, not only a colour; focus moves into a door opened by keyboard and returns on close.

Phone: the briefing stacks and the tiles scroll horizontally; queue items are cards with full-width Approve and Decline; the ledger is a list with sticky day headers, two lines per row, the step log still in place; filters move into a sheet labelled "Filters: agent, contact, date, outcome, kind" opened from "Filters · 2". Nothing that is level one on desktop becomes level three on a phone.

### By role and by business

| | SDR | AE | Marketer | Admin |
|---|---|---|---|---|
| Queue | Items on contacts they own | Items on contacts of their open deals | Proposals to add people to campaigns; scoring on their audiences | Everyone's, labelled "waiting for Marcus Adeyemi"; may approve on their behalf, recorded as such |
| Ledger default | Their contacts | Their deals' contacts | Scoring and research agents | Everyone |
| Teammate filter | Absent, with the line naming who sees all | Absent | Absent | Present |
| Pause | Only where the profile allows (Fathom) | No | No | Yes |
| Agent settings | "Changed by <admin>" | Same | Same | Link |

| Business | What changes |
|---|---|
| Fathom Labs | Two tiles. Everyone sees everyone. Credits today and the per-day digest are level one for the founder. The cap event is a weekly sight. |
| Meridian Software | Three tiles. The SDR's page is the queue; the admin's is the ledger and the spend. The SDR's ledger says "Your contacts' activity" and names Daniel Okafor. |
| Halyard Agency | Two tiles under the client workspace name. The specialist has "Select all" and the bulk bar at level one; the ops lead has the teammate filter at level one and reads the per-day credits for every client. |
| Ridgeline | Three tiles, the outreach one reading "on · 0 sent this week"; the queue is usually one line. The marketer has the Agent filter at level one and watches scoring runs feeding lifecycle campaigns. |

## 4. Usage items

Share of active users in the role touching the item in a typical week, per `USAGE-MODEL.md`. Baseline is Meridian. Customer success is 0 everywhere and not listed. Critical items are level one regardless of number (rule 7). Generated from `src/ollopa/usage/agents.ts`.

| Item | Area | SDR | AE | Mkt | Admin | Overrides (business: role number) | Critical |
|---|---|---|---|---|---|---|---|
| `brief.digest` Since you last looked: runs, waiting, exceptions | Briefing | 65 | 20 | 15 | 45 | Fathom: sdr 75, admin 70; Halyard: sdr 70, admin 60; Ridgeline: sdr 30, ae 10, marketer 25, admin 35 |  |
| `brief.status` Agent tiles: on or off, runs today, what each may do | Briefing | 18 | 6 | 10 | 40 | Fathom: sdr 18, admin 18; Halyard: sdr 12, admin 65; Ridgeline: marketer 20, admin 40 |  |
| `brief.credits-week` Credits spent this week against the agent cap | Briefing | 25 | 5 | 10 | 60 | Fathom: sdr 60, admin 75; Halyard: sdr 40, admin 70; Ridgeline: sdr 10, marketer 20, admin 45 | yes |
| `brief.credits-today` Credits spent today | Briefing | 12 | 2 | 4 | 18 | Fathom: sdr 15, admin 65; Halyard: sdr 12, admin 60; Ridgeline: sdr 4, marketer 5, admin 15 |  |
| `brief.workspace` Which client workspace this page shows | Briefing | 0 | 0 | 0 | 0 | Halyard: sdr 70, admin 75 |  |
| `exc.paused` Outreach paused and why (bounce guard) | Exceptions | 15 | 3 | 2 | 25 | Fathom: sdr 12, admin 15; Halyard: sdr 15, admin 50; Ridgeline: sdr 3, admin 8 | yes |
| `exc.cap-reached` An agent stopped at its credit cap | Exceptions | 3 | 1 | 2 | 4 | Fathom: sdr 8, admin 15; Halyard: sdr 8, admin 12 | yes |
| `exc.resume` Resume or keep paused | Exceptions | 4 | 0 | 0 | 15 | Fathom: sdr 4, admin 8; Halyard: sdr 4, admin 15 |  |
| `wait.list` Items waiting for approval | Waiting for you | 70 | 22 | 8 | 25 | Fathom: sdr 80, admin 80; Halyard: sdr 80, admin 18; Ridgeline: sdr 30, ae 12, marketer 22, admin 18 | yes |
| `wait.consequence` What happens if approved: email from which mailbox, when, credits | Waiting for you | 70 | 22 | 8 | 25 | Fathom: sdr 80, admin 80; Halyard: sdr 80, admin 18; Ridgeline: sdr 30, ae 12, marketer 22, admin 18 | yes |
| `wait.approve` Approve | Waiting for you | 70 | 20 | 6 | 18 | Fathom: sdr 75, admin 75; Halyard: sdr 80, admin 4; Ridgeline: sdr 28, ae 10, marketer 20, admin 10 |  |
| `wait.decline` Decline | Waiting for you | 45 | 12 | 4 | 15 | Fathom: sdr 50, admin 40; Halyard: sdr 55, admin 4; Ridgeline: sdr 20, ae 6, marketer 6, admin 8 |  |
| `wait.read-draft` Read the draft or the research before deciding | Waiting for you | 55 | 18 | 5 | 12 | Fathom: sdr 65, admin 60; Halyard: sdr 60, admin 4; Ridgeline: sdr 25, ae 10, marketer 8, admin 8 |  |
| `wait.edit-draft` Edit the draft, then approve | Waiting for you | 22 | 8 | 0 | 3 | Fathom: sdr 15, admin 15; Halyard: sdr 12; Ridgeline: sdr 10, ae 4 |  |
| `wait.bulk` Select several and approve or decline together | Waiting for you | 12 | 2 | 0 | 10 | Fathom: sdr 4, admin 8; Halyard: sdr 45, admin 15; Ridgeline: sdr 3, admin 3 |  |
| `wait.decline-reason` Tell the agent why you declined | Waiting for you | 8 | 2 | 0 | 3 | Fathom: sdr 4; Halyard: sdr 15 |  |
| `wait.snooze` Decide tomorrow | Waiting for you | 4 | 2 | 0 | 2 | — |  |
| `wait.reassign` Hand the decision to a teammate | Waiting for you | 2 | 1 | 0 | 4 | Fathom: sdr 1, admin 1; Halyard: sdr 2, admin 4 |  |
| `act.ledger` Every event, newest first | Activity | 35 | 10 | 12 | 50 | Fathom: sdr 45, admin 45; Halyard: sdr 25, admin 60; Ridgeline: sdr 15, marketer 25, admin 40 |  |
| `act.day-digest` Per-day digest line with credits for the day | Activity | 12 | 3 | 6 | 45 | Fathom: sdr 15, admin 60; Halyard: sdr 10, admin 60; Ridgeline: marketer 6, admin 30 |  |
| `act.credits-per-event` Credits per event | Activity | 20 | 3 | 5 | 40 | Fathom: sdr 45, admin 60; Halyard: sdr 15, admin 55; Ridgeline: sdr 6, marketer 8, admin 25 | yes |
| `act.steps` Step-by-step log for one event: sources, timings, credits per step | Activity | 15 | 4 | 6 | 18 | Fathom: sdr 18, admin 18; Halyard: admin 15; Ridgeline: marketer 10 |  |
| `act.open-contact` Open the contact or company | Activity | 18 | 15 | 3 | 4 | Halyard: sdr 8; Ridgeline: sdr 10, ae 10, marketer 5 |  |
| `act.filter-agent` Filter by agent | Activity | 12 | 3 | 12 | 15 | Fathom: sdr 4, admin 6; Halyard: sdr 4, admin 18; Ridgeline: marketer 22, admin 25 |  |
| `act.filter-kind` Filter by kind of event | Activity | 4 | 2 | 4 | 4 | Halyard: admin 4; Ridgeline: marketer 5 |  |
| `act.filter-contact` Filter by contact or company | Activity | 15 | 12 | 2 | 4 | Halyard: sdr 12 |  |
| `act.filter-status` Filter by outcome: waiting, approved, declined, done, paused | Activity | 4 | 1 | 1 | 12 | Fathom: admin 4; Halyard: sdr 4, admin 15 |  |
| `act.filter-date` Date range | Activity | 4 | 1 | 4 | 15 | Fathom: admin 12; Halyard: admin 15; Ridgeline: marketer 6 |  |
| `act.filter-person` Filter by teammate | Activity | 0 | 0 | 0 | 15 | Fathom: sdr 4, admin 6; Halyard: admin 30 |  |
| `act.search` Search the ledger | Activity | 10 | 4 | 4 | 4 | Halyard: sdr 4, admin 4; Ridgeline: marketer 5 |  |
| `act.retry` Run again with a note | Activity | 3 | 1 | 2 | 4 | — |  |
| `act.flag` Flag a wrong result | Activity | 3 | 1 | 1 | 3 | — |  |
| `act.copy-link` Copy a link to this event | Activity | 1 | 1 | 1 | 2 | — |  |
| `act.export` Export the ledger as CSV | Activity | 0 | 0 | 2 | 4 | Halyard: admin 6 |  |
| `act.expand-all` Expand all steps or collapse all | Activity | 2 | 0 | 0 | 4 | — |  |
| `act.print` Print the ledger | Activity | 0 | 0 | 0 | 1 | — |  |
| `act.columns` Show or hide columns | Activity | 1 | 0 | 0 | 2 | — |  |
| `set.link` Agent settings in Settings, or who can change them | Agent settings | 4 | 1 | 3 | 15 | Fathom: sdr 12, admin 15; Halyard: admin 15; Ridgeline: marketer 6 |  |
| `set.pause-agent` Pause this agent now | Agent settings | 2 | 0 | 0 | 4 | Fathom: sdr 4, admin 4; Halyard: admin 4 | yes |
| `set.notify` Tell me when something waits (Slack or email) | Agent settings | 3 | 2 | 2 | 3 | — |  |

Decision-critical, always level one: credits this week against the cap, outreach paused, cap reached, the waiting items, what happens if approved, credits per event, pause this agent. Seven of forty.

### Shape check

Computed with `shape()` from `model.ts`. Band targets: head 15 to 25%, body 25 to 35%, tail 45 to 60%.

| Pair | Head | Body | Tail | Note |
|---|---|---|---|---|
| Meridian, SDR | 10 (25%) | 11 (28%) | 19 (48%) | Fits. The head is the queue and its actions. |
| Meridian, admin | 9 (23%) | 12 (30%) | 19 (48%) | Fits. The head is the briefing, the spend and the ledger. |
| Halyard, admin | 10 (25%) | 11 (28%) | 19 (48%) | Fits. Workspace name and teammate filter in the head; approvals not. |
| Ridgeline, marketer | 8 (20%) | 11 (28%) | 21 (53%) | Fits. Agent filter in the head; the queue at its floor. |
| Fathom, admin | 11 (28%) | 11 (28%) | 18 (45%) | Just above the band: the founder is also the SDR and watches spend daily. Kept. |
| Meridian AE and marketer; Ridgeline AE | 0 to 4 | 8 to 12 | 28 to 29 | No head. These roles come for one waiting item and leave; the seven critical items still render. Honest, not a gap. |

## 5. Before: the common version

Apollo has no page called Agents. What this page does is spread across five surfaces, each with its own idea of what an "action" is. The common version is that spread. Every problem carries its source; where none was found it says unverified.

### Where the work lives in Apollo

1. **AI Assistant.** A top-bar button, or "click AI Assistant from the nav to open the full-screen experience" (Apollo KB, "AI Assistant Overview", article 39359204112397, updated 7 Sep 2026). A chat that finds prospects, builds lists, enriches, creates sequences, builds workflows, edits the context center and reviews credit usage. "Sending a message to the AI assistant doesn't automatically use Apollo credits"; credits go when it performs "a credit-consuming Apollo action, such as saving contacts or enriching records", and "the assistant asks you to confirm before performing an action that uses credits." Paid plans: "unlimited chats and messages"; Free: five chats of ten messages. Past work: "To view previous chats, click ⌄ beside your current chat title" (KB, "Find Prospects with the AI Assistant", article 43512338043789, updated 26 Aug 2026). Neither article describes an activity log, a queue of pending confirmations, or a view of what the assistant did while you were away.
2. **Workflows.** Main nav. Steps are rules, actions and two agents, "Research with AI" and "Qualify records". Runs show on the workflow's **Enrollment** tab: limits, run history, records completed or failed, and failure reasons "credit limit, missing owner, inactive mailbox" (KB, "Create a Workflow", article 4413804036109, updated 11 Sep 2026). Notifications exist only if the builder added a "Send notifications" step.
3. **AI Research.** "Each AI research run costs one credit. Apollo counts one AI research run for each record and each column you enrich." Free previews on a few records (KB, "AI Research Overview", article 29193277882125, updated 10 Sep 2026). Results are columns on the People and Companies tables. No run log described.
4. **AI Projects.** `app.apollo.io/#/projects`, "currently in beta and is only available to select people"; "your assets on the left, and your project context in the middle" (KB, article 39411962173965, updated 8 Jul 2026). No activity history; no credit figures.
5. **Credit usage.** Settings › Credits and activity › Credit usage, inside a separate settings shell, gated by "Can access the credit usage page and check how much credit other users used". Tabs: Overview, Usage details, About credits, **AI runs** ("each run's team member, credit usage, run usage, and AI run name", filtered by date and user). Usage details columns: Date, Feature, Action, Description, Credits, Data requested, Surface, User (KB, "Review Credit Usage in Apollo", article 9527776320781, updated 1 Sep 2026).

Apollo's AI overview lists twelve AI features and gives one instruction on control: "Review AI-generated messages before sending them for accuracy" (KB, "Apollo AI Overview", article 37242880230541, updated 10 Sep 2026). The 2026 release notes add Assistant Memory, a unified Slack app, an AI Research free trial inside the Assistant, and MCP "sender mailbox guardrails" and "one-off email capability" (KB, "Release Notes 2026", article 43226752968077, updated 10 Sep 2026). Apollo ships no standalone "AI SDR" settings page; third parties call it "AI-assisted" rather than autonomous (`07-apollo-settings-map.md`, citing 11x and SalesHandy), while Apollo's marketing pits it against AI SDR products ("Apollo vs Jeeva AI: AI SDR Platform Showdown", apollo.io/insights, 2026). Salesforge's 2026 review reports the assistant is "introductory free" on every paid tier (secondary).

### Step 0 of the lesson

A chat panel with "Previous chats ⌄"; a "Runs" tab that is a workflow enrollment table (Completed / Failed, reason); credits nowhere on the page, only under Settings › Credits and activity › Credit usage › AI runs, admin permission required; approvals inside the chat at the moment the assistant asks, gone once the chat scrolls or closes; per-step detail nowhere; sends by workflow with no queue and no per-send consequence line; "power-up" credits on a separate meter.

### Documented problems

| Problem | Where it shows | Source |
|---|---|---|
| Spend is a surprise | Confirmation in chat; the bill elsewhere | "Apollo AI assistant ran operations quoting me a certain amount of credits, and then racked up a separate bill for some special 'power up' credits without warning or approval." Paige Robillard, Trustpilot, 18 Aug 2026. |
| Credits are hard to predict | Credit usage three levels deep, behind a permission | "difficult to predict exactly how many credits they will burn through during a high-volume sprint." Warmly's G2 summary (secondary). "watch the credit system closely or you'll get surprised at the end of the month." Reddit via Cleverly (secondary). |
| Wrong work done before anyone looks | No review point between request and run | "The AI helper on my first run couldn't even understand a simple ICP and pulled leads for the wrong thing altogether." Damien Voss, Trustpilot, 19 Aug 2026. |
| No single record of what the agent did | Chat history, Enrollment tab, AI runs tab and Usage details each hold a slice; none holds steps and sources | KB articles 39359204112397, 4413804036109, 9527776320781. |
| Approvals are not a queue | "The assistant asks you to confirm" inside the conversation | KB article 39359204112397. |
| Depth | Settings › Credits and activity › Credit usage › AI runs: four levels. Chat › ⌄ › previous chat › scroll: four | `07-apollo-settings-map.md` §1.0, §6. |
| Unlabelled door | "click ⌄ beside your current chat title" | KB article 43512338043789. NN/g (2014): unlabelled non-standard icon, 0% click-through. |
| Capability oversold, then metered | "first fully agentic GTM operating system" in marketing; "introductory free" on paid tiers | Salesforge (secondary). PAIR: products "set users up for disappointment by promising that 'AI magic' will help." |
| Can a workflow run be paused; do AI drafts need approval before a workflow sends | Not documented | Unverified. |

## 6. After: the disclosed version

### The agent rules and where each lands

Nielsen (UX Tigers, 9 Jul 2026): "Make long-running agents disclose by exception. Interrupt only for decision-critical events, digest the milestones, report progress as conceptual breadcrumbs, and keep the full activity ledger 1 click away."

| Rule | Where it is |
|---|---|
| Disclose by exception (Nielsen) | The Exceptions section exists only while something is paused or capped. No modal, bell or email for a routine run. |
| Interrupt only for decision-critical events (Nielsen) | Sends and credit spends are the only things that wait for a person, in a queue, not a pop-up. |
| Digest the milestones (Nielsen) | The briefing sentence and the per-day digest line. |
| Progress as conceptual breadcrumbs (Nielsen) | The event summary ("Researched Northwind: 3 signals found"), not a spinner. |
| Full ledger one click away (Nielsen) | The ledger is on the page; any event's step log is one click, in place. |
| Say what it can and can't do up front (Google PAIR; Microsoft HAX Guideline 1) | Two lines on each tile, what it does and what it never does without a person, copied from Settings so they are always true. |
| Level-one metadata says what and when; detail on request (Anthropic Agent Skills) | Tile line and event summary are the metadata; steps and sources load on request. |
| Name the actor, every time (Shape of AI) | Every row and item begins with the agent's name. |

### Level one and level two

**Level one, every role:** the briefing sentence; credits this week against the cap; exception lines when any exist; waiting items with consequence, credits, Approve and Decline; the ledger with day digests and the credits column; Pause for anyone allowed; the settings link or the line naming who can change settings.

**Also level one by role and business** (20% or more in the usage model):

| Role, business | Added |
|---|---|
| SDR, Meridian | Read the draft, Edit then approve, the ledger, credits per event |
| Admin, Meridian | Agent tiles, per-day digest, ledger |
| SDR, Fathom | As Meridian's SDR |
| Admin, Fathom | Credits today, per-day digest, ledger, credits per event; tiles sit under the sentence at body weight |
| SDR, Halyard | Workspace name, Select all and the bulk bar, Read the draft |
| Admin, Halyard | Workspace name, tiles, credits today, per-day digest, teammate filter beside Agent |
| Marketer, Ridgeline | Tiles, Agent filter, the queue |
| Admin, Ridgeline | Tiles, per-day digest, Agent filter |

**Level two, every case:** the step log per event; the draft or research behind each waiting item; the "Date, outcome, kind, teammate" filter door; the "…" menus; the phone filter sheet.

### Every door

| Label | Container | Behind it | Persists |
|---|---|---|---|
| "Read the draft · 142 words" / "Research · 3 signals · 4 sources" / "Score 82 · how it was built" | In place, under the item | The draft with subject, editable via Edit then approve; or the signals with sources; or fit and intent parts | Per item until decided |
| "3 steps · 12 credits ▾" | In place, under the row | Time, text, source link and credits per step; the decision line if a person acted | Per event, per user; Expand all remembered |
| "Date, outcome, kind, teammate ▾" | In place, in the filter row | The filters under 20% for this role; promoted ones are absent | Open state and values per user per workspace |
| "…" on a waiting item | Menu | Approve, Decline, Edit then approve, Tell the agent why, Decide tomorrow, Hand to a teammate, Open the contact, Copy a link | n/a |
| "…" on a ledger row | Menu | Open the contact, Run again with a note, Flag a wrong result, Copy a link | n/a |
| "…" by the Activity heading | Menu | Export CSV, Show or hide columns, Print | Column choice per user |
| "Filters · 2" (phone) | Sheet | Agent, contact, date, outcome, kind, teammate | Values, as desktop |
| "Agent settings" | Page (Settings › Agents and AI) | Agents on or off, approval policy, caps, model key | n/a |
| "Open bounce guard" | Page (Settings › Email sending) | The threshold that paused the mailbox | n/a |

No door contains a door. Source and contact links inside the step log go to pages, not further disclosure.

### Accelerators

`j`/`k`/`a`/`d`/`e`/`x` and `/`; the palette with shortcuts shown; "Expand all steps" remembered per user; bulk select with the total consequence in the bar; the tile as a one-click filter; shortcuts printed in every "…" menu so the SDR who clears forty items a day stops opening them.

### Decision-critical

Seven items (section 4). The rule 7 test: without clicking, on any role and business, the reviewer finds the credit spend this week, every pending approval with what it will do and cost, and any paused or capped agent. Decline and Approve are one button each, side by side, the same size. Pausing an agent is one click for anyone allowed; turning one on is a link and a toggle in Settings, so stopping is never longer than starting.

### Removed, not hidden

The chat panel: agents are given work from the pages where the work is, and this page reports. The Runs table of workflow enrollments: a run is a set of ledger events. "Power-up" credits: one unit, one cap, one number. The Scoring tile at Fathom and Halyard. The teammate filter for roles that see only their own items. A separate "AI runs" tab in Settings: the ledger is the record; Settings keeps the caps.

### The nine-point score

| # | Question | Score | Line |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | Spend, every waiting item with consequence and credits, paused and capped state, Pause: level one on every width. |
| 2 | Every visible item backed by a sourced number | 2 | Forty items in `agents.ts`; four pairs checked in section 4. |
| 3 | No third level on any screen size | 2 | Deepest path: page › step log, or page › filter sheet. |
| 4 | Doors labelled by content, chevron and text | 2 | "Read the draft · 142 words", "3 steps · 12 credits", "Date, outcome, kind, teammate". No "More", "Details" or "Advanced". |
| 5 | Doors adjacent, keyboard and touch | 2 | Every door sits under what it expands; `button` in a heading; `e` toggles; full-width targets on phone. |
| 6 | No dependent information split by a door | 2 | Consequence and credits beside Approve, never behind the draft door; credits per step beside each step. |
| 7 | State persists; expand-all and print | 2 | Door state per event and user; filters per workspace; Expand all remembered; print CSS expands all. |
| 8 | User action or object state, never inferred history | 2 | Queue oldest first; exceptions driven by agent state; no reordering by predicted importance; "Since you last looked" adds a sentence and moves nothing. |
| 9 | Instrumented; promote, keep or delete review | 1 | Door opens and filter use counted per role and business; review scheduled with the Settings review each March and September. One point withheld until the first review has run. |

Total: 17 of 18.

## 7. Lesson steps

Step 0 is the common version. Each step applies one rule. Rules 3 and 6 are notes on the last step, because the common version does not break them in a way that moves anything.

| Step | Rule | What moves | Why | Evidence |
|---|---|---|---|---|
| 0 | | The common version: a chat with "Previous chats ⌄", a Runs table, approvals inside the chat, credits under Settings › Credits and activity › Credit usage › AI runs behind a permission, "power-up" credits on a separate meter, no step log. | What happens when each AI feature ships where it was built and nothing is ever moved. | Section 5. |
| 1 | 7. Decision-critical is never behind a door | Pending confirmations leave the chat and become "Waiting for you" at the top, each with what will happen if approved (mailbox, time, credits) and Approve and Decline side by side. Credits this week against the cap move from four levels down in Settings to the briefing. "Paused" and "cap reached" become exception lines. "Pause" appears on each tile. | An email an agent sends cannot be unsent and a credit it spends cannot be refunded; the person deciding must see the consequence and the spend where they decide. Decline is as short a path as Approve. | Nielsen (2026): never hide "price, requirements, risks" behind the second level. Robillard (Trustpilot, 18 Aug 2026): "racked up a separate bill ... without warning or approval." Nouwens et al. (2020): moving reject off the first page raised consent 22 to 23 points. |
| 2 | 1. Hide the rare, never the necessary | The chat transcript is removed. The event list becomes the ledger at level one for every role (35% of SDRs and 50% of admins weekly at Meridian). Steps, sources and per-step credits go behind one door per row (15% and 18%). Date, outcome, kind and teammate filters go behind one door named for them (4 to 15%); any at 20% or more for the signed-in role and business comes back out (teammate for Halyard's admin, 30%). | Level one is decided by measured weekly use per role and business, not by what felt important. The ledger is used often; one event's steps are not. | Nielsen (2006): "disclose everything that users frequently need up front." Nielsen (2026): "keep the full activity ledger 1 click away." Pendo (2024): 6% of features draw 80% of clicks. USAGE-MODEL.md. |
| 3 | 2. Stop at two levels | Settings › Credits and activity › Credit usage › AI runs (four levels) becomes the credits column and the per-day digest here. Chat › ⌄ › previous chat › scroll becomes a ledger row and its step log. The Runs table folds into the ledger: a run is a set of events with a batch step list. On the phone, filters go into one sheet and the step log still opens in place, so nothing gets deeper where clicks cost most. | A third level means the structure is wrong. Every item is reachable in one click from the page, on desktop and phone. | Nielsen (2006): designs beyond two levels "typically have low usability." Landauer and Nachbar (1985): breadth beats depth. `08-principles-and-checklists.md`: disclosure drift across breakpoints. |
| 4 | 4. Make the door obvious and honest | "⌄" beside the chat title becomes "3 steps · 12 credits ▾". "Preview" becomes "Read the draft · 142 words". Every row and item starts with the agent's name. The Scoring tile disappears at Fathom and Halyard rather than sitting greyed. Approve and Decline are removed, not disabled, on decided items. Each tile says what the agent does and what it never does without a person. | The label is the only scent. A door must say what is behind it and always open onto something; a control that cannot apply is removed. Naming the actor is what lets a person trust the row. | NN/g (2014): unlabelled icon, 0% click-through. Windows UX Guide: "Remove (don't disable) progressive disclosure controls that don't apply." Shape of AI: "Name the actor, every time." HAX Guideline 1; PAIR Mental Models. |
| 5 | 5. Keep context across the boundary | The consequence sentence and credits sit beside Approve, on the item, never inside the draft door. Credits per step sit beside each step; the row total sits on the row. The draft expands under its own item, not in a modal. "Resume" sits on the exception line. Door state, filter values and column choices persist per user and workspace; Expand all and print CSS exist. | Fields read together must not be split by a door; working memory holds about four chunks and the trip loses them. A door remembers whether it was left open. | Cowan (2001). Microsoft Fluent 2: "Never put information in one accordion item that needs to be referenced in another." Windows UX Guide: make expand state persist. |
| 6 | 8. Fade the scaffold; give experts accelerators | `j`/`k`/`a`/`d`/`e`/`x` and `/`; shortcuts printed in the "…" menus; the palette lists "Approve all drafts to verified emails" with its keys; bulk select with the total consequence in the bar; the tile as a one-click filter; Expand all remembered. Door opens and filter use are counted per role and business and reviewed each March and September: promote, keep, or delete "Show or hide columns" and "Print" if they stay under 3%. | Doors are scaffolding for the many; the person who lives here needs a way past them that teaches itself. What nobody opens is deleted, not kept behind a door forever. | NN/g heuristic 7. Cockburn et al. (2014): users "persistently fail to adopt faster methods" unless pulled. McGrenere and Moore (2000): tuck away what some use; delete what almost nobody uses. |

Notes on step 6. **Rule 3:** no "Simple" or "Advanced" agent view and no "Autopilot" switch; what an agent may do without a person is set per action in Settings, and everyone sees the same items ordered by frequency for their role. **Rule 6:** the queue is oldest first and the ledger newest first, always; nothing is reordered by predicted importance or past behaviour.

## 8. Review

| Check | Gap found | Closed by |
|---|---|---|
| All roles covered | CS had no line; AE and marketer had no default scope | The "By role" table; the no-access paragraph naming the admin |
| All four businesses covered | Halyard's workspace name and Fathom's missing scoring agent were implicit | `brief.workspace` as an item removed where it does not apply; the Scoring tile removed at Fathom and Halyard |
| Every field has a source | Consequence, steps, draft, status, time and contact reference are not in the seed | Section 2 lists ten additions with types and examples |
| Every action has an outcome | Snooze on a proposal with an earlier send time; bulk approve with a paused mailbox | Snooze declines and says so first; bulk approve leaves paused-mailbox items behind with the reason |
| Empty, error, no-access | Cap reached was not a state | Items that spend credits queue behind the cap and say so |
| Keyboard | Bulk select had no key | `x` selects; `Escape` clears |
| Phone width | Six columns and three filters do not fit | Two-line rows, sticky day headers, one filter sheet; level count unchanged |
| Decision-critical visible | Pause was a settings item | `set.pause-agent` marked critical and put on the tile |
| Two levels maximum | The step log links to sources | Links go to pages; no door inside the log |
| Doors labelled by content | The filter door needed a stable label as items move out | The label lists what is still inside; never "More" |
| Dependent fields together | The draft door could swallow the consequence | Consequence and credits on the item, outside the door |
| State persists | Expand all as a page action would reset | Remembered per user; print CSS expands all |
| Accelerators present | None | Keys, palette, bulk, tile-as-filter |
| Usage shape checked | Fathom admin first landed at 42% head, Halyard SDR at 43% | Overrides tempered to what each person does daily; Fathom admin at 28% explained |
| Nothing hover-only | TablePage row actions fade in on hover | Approve, Decline and the door are always visible; "…" holds the rest |
| Role gaps explain themselves | Non-admins had no teammate filter and no settings link | A line names who sees everyone and who changes settings |
| No usage numbers or teaching text in the product | The tile lines could read as help text | They are the agent's own permissions from Settings: product data, not teaching |
