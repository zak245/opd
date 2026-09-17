# Workflows

*The nineteenth spec. One page (`P-workflows`), one record (`R-workflow`), one door (`D-wf-runs`). Usage items: `src/ollopa/usage/workflows.ts`. Nodes: IA-MAP 2.11. Seats OPS and marketer; Growth-gated, with the lock at the entry point.*

## 1. Purpose

A workflow is a **trigger**, an **enrolment filter**, a set of **rules**, and the **actions** those rules take. It is how an inbound lead reaches a rep, how a form submission becomes a task, and how a scored contact gets routed to the person who owns the account. Before this page existed, routing rules were invisible until they misfired, and the only evidence a rule had run was a lead sitting in somebody's queue.

Who lives here: the **marketer**, daily, because routing new MQLs against a clock and working inbound form submissions is the marketer's work (IA-MAP 6.4g); and the **RevOps admin**, who builds the rules and answers for them. Nobody else. An SDR receives what a workflow produced and never opens the rule; the Tasks page is where the work lands, and a marketer never goes there.

The one thing they must never lose sight of: **which rule is firing, on whom, and what it is about to cost.** Two numbers carry that: the SLA clock, because leads contacted in under five minutes close at 32% against 12% (Optifai, 939 B2B SaaS companies, CRM timestamps Q2 2025–Q1 2026, in `17-sales-org-workflow-inventory.md` §4), and the credit ceiling, because an automation that enriches on enrolment can spend the month while nobody is looking.

Three things this page owns and no other page redefines: the **SLA window and its clock**, the **routing exception queue** (what could not be routed and why), and the **credit ceiling per workflow** with its observed spend. Three things it does not own: the scores and personas a rule reads (Settings › Signals, scoring and personas), the territories a named-account override reads (Settings › Team and access), and the **intake request queue** — routing exceptions are about records and stay here, where the rule is one click away; requests are about the workspace and live on `P-requests` (IA-MAP 6.4c).

## 2. Data

Sources are `src/ollopa/data/seed.ts`, `businesses.ts` and the `settings` object spec 14 §2.2 adds. The seed's fixed "today" is 13 September 2026.

| Field | Where shown | Source | To add to seed |
|---|---|---|---|
| Workflow name, owner, status, created, last edited by | Table, record header | none | `workflows[]`: `{ id, name, owner, status: "on" \| "off", statusChangedBy, statusChangedOn, createdOn, editedBy, editedOn, folder? }`. Meridian 6, Ridgeline 5, Halyard 1, Fathom 0 |
| Trigger | Table, record | none | `workflows[].trigger`: one of form submitted, score crossed a threshold, contact saved or added to a list, email replied, meeting booked, deal created or updated, contact changed jobs, website visited, or a schedule |
| Enrolment filter and how many match now | Record | `seed.contacts`, `seed.companies` | `workflows[].enrolment`: the same filter grammar `P-people` uses; the count is computed at render |
| Rules and actions | Record | none | `workflows[].rules[]`: `{ condition, action, config }`. Actions: assign an owner, create a task, add to a sequence, add to a list, write a field, notify (Slack or email), enrich, wait, branch, exit |
| The routing rule's people | Rule row | `businesses.roles` and the users spec 14 §2.2 adds | `workflows[].routing`: `{ kind: "round-robin" \| "weighted" \| "territory", pool: userId[], weights?, skipAway: true }` |
| Availability | Rule row, Settings › Team and access | none | `settings.team.users[].availability`: `"available"`, or `{ awayUntil: date }`, set by the person or the admin. Two away at Meridian |
| Named-account override | Rule row | Settings `pros.territories` | nothing; the rule row names the territory rule, its owner and its account count |
| SLA window, running, breached, reassignment rule | Record | none | `workflows[].sla`: `{ windows: { hot: "2h", warm: "1 business day" }, reassignTo: "next in the pool", notifyFirst: true }`, plus computed `running` and `breachedToday`. Meridian: 2 hours hot, 41 enrolled today, 3 past the window |
| Credit ceiling and spend today | Table, record | `businesses.credits` | `workflows[].ceiling: { perDay, perRun, spentToday }`. Ridgeline's form workflow: 200 a day, 68 used |
| Enrolment limits | Record | none | `workflows[].limits: { perDay, reEnrol: boolean, maxPerPerson }` |
| Business hours | Record | Settings `ws.timezone` | `workflows[].hours: { from, to, days[], clockPauses: true }` |
| Suppression | Record | none | `workflows[].suppress`: lists and filters this workflow never touches |
| Run rows | `D-wf-runs` | none | `workflowRuns[]`: `{ workflowId, at, personId, outcome: "enrolled" \| "not-routed" \| "errored", ruleId?, reason?, createdTaskId?, assignedTo?, credits }`. 120 at Meridian including 7 not-routed; 90 at Ridgeline including 2 not-routed and 4 errored |
| The reason a record could not be routed | Exception row | none | `workflowRuns[].reason`: everyone in the pool is away · no owner on the matched account · the daily enrolment limit was reached · the credit ceiling was reached · the mailbox the action needs is paused · no rule matched |
| What changed in this workflow | Record | none | `workflowEdits[]`: `{ workflowId, at, by, what }` |

`workflowRuns[]` is defined here. `settings.team.users[].availability` is defined here and read by spec 14 (the users table and `X-user`); routing is not the only reader, but it is the reason the field exists.

## 3. Features

### 3.1 The page

Route `workflows`. A table, from `TablePage`. Columns: **Workflow · Trigger · Status · Enrolled (7 days) · Past the SLA window · Could not route · Credit ceiling and spend today · Owner · Last edited**. Level one above it: a search box, a folder chip, and a status chip ("On (5) · Off (1)"). Row actions: open, turn off, duplicate, archive. One door on the table: "Additional filters: trigger, owner, folder, archived (4)".

The three columns that make this a page rather than a list are **Past the SLA window**, **Could not route** and **Credit ceiling and spend today**. Each is a link to the row's record, already scrolled to the block it names. A count that leads nowhere is a decoration.

### 3.2 The record

`R-workflow`, from the record template. Header: name, trigger in words ("When a form is submitted on Request a demo"), status with who changed it and when, owner, and the credit ceiling with today's spend against it.

Sections, scrolling, in this order — which is the order the questions are asked in:

1. **The SLA.** The window per lead heat ("Hot: 2 hours · Warm: 1 business day"), **how many are running against the clock now**, **how many breached today**, and the reassignment rule in words: "Past 2 hours, reassign to the next rep in the pool and tell the first." Breached rows print elapsed time in text ("2h 14m over"), never colour alone. Business hours sit in this section, not elsewhere, because a two-hour clock running at 23:00 is a breach nobody could have prevented, and the two facts are read together.
2. **Trigger and enrolment.** The trigger; the enrolment filter with how many match now; whether a person can be enrolled twice and what happens if they are; the daily enrolment limit and what happens to the rest.
3. **Rules and actions.** One row per rule: the condition, then the action, in a sentence. A routing rule prints what it will actually do: **"Weighted round robin across 6 reps · 1 away until 18 Sep · skipped."** Who is on the receiving end of an automatic action is part of the action. A named-account override is **named and not opened**: "Named accounts route to their owner — 42 accounts, set by Daniel Okafor in Settings › Team and access › Territories." For a marketer that link opens the no-access page, which says the same thing; a seat gap is explained in place rather than routed through.
4. **The credit ceiling.** The ceiling for this workflow, what has been spent today, and what happens at it: **"At the ceiling, enrichment stops. People are still enrolled and still routed, marked 'not enriched — daily ceiling reached 14:20'. Raise the ceiling."** No silent spend and no silent loss.
5. **Suppression.** Who this workflow never touches.
6. **Test and turn on.** "Test on one record" runs the rules against a chosen person and prints what it *would* do, spending nothing and writing nothing. Then the switch, with its consequence: "Turns on now. 412 people match the filter today; the daily limit is 100, so the rest wait."

One door: **`D-wf-runs`**, "Run history and enrolment · 120".

### 3.3 `D-wf-runs` — run history and exceptions

One door, **two named sections inside it**, and the sections are not doors, so nothing here is three levels deep:

- **Enrolled (113).** Who, when, which rule matched, what it created, and who it went to. The task a run created is a link; opening it from the run row — not from inside a nested panel — is how a marketer confirms a lead reached a rep without opening the rep's queue, which is an area the marketer's seat does not hold.
- **Could not route (7).** One row per exception, each carrying **its reason** and a link to the rule that produced it. "Everyone in the pool is away until Monday · rule 2" · "No owner on Northwind Analytics · rule 4" · "Daily limit reached at 16:02 · enrolment limits". The reason is the content; a list of failures without reasons is a list of mysteries.

Runs that **errored** (an action failed rather than a record failing to match) sit in the Enrolled section marked as errored with the failure in words, because the enrolment happened and only the action did not.

Filters inside the door: rule, rep, reason, date. "Export the run history" and a column chooser sit with them. The door is the level; the sections, the filters and the export are inside it.

### 3.4 Actions and outcomes

| Action | Where | Outcome |
|---|---|---|
| Create a workflow | Page | The record opens with the trigger unchosen and the status Off. Nothing runs until it is turned on |
| Turn on / turn off | Table row, record | Consequence stated before the click; the status row records who and when. Turning off says what it stops and what it does not: "Stops enrolling. The 14 people already running finish their steps." |
| Test on one record | Record | Prints what it would do, rule by rule. Spends nothing, writes nothing, sends nothing |
| Edit a rule | Record | Saved with one Save; the change is written to the workflow's history; if the change is one other people feel, it also writes one announcement line (below) |
| Raise the ceiling | Record, or the "not enriched" mark | Inline, with the new daily number and the current spend beside it |
| Open an exception's rule | `D-wf-runs` | Navigates to the rule row on the record, highlighted |
| Open the task a run created | `D-wf-runs` | Navigates to the task; Back returns with the door open |
| Re-run the exceptions | `D-wf-runs` | "Retry 7 · they are re-evaluated against the rules as they are now · about 0 credits" |
| Export the run history | `D-wf-runs` | CSV. Exporting a table a seat can already read is on every plan (spec 14's plan table owns that rule) |
| Duplicate | Table row | A copy, Off, with a line saying what the copy does not carry: the run history and the enrolments |
| Archive | Table row | "Stops enrolling for good. The run history is kept and the rule stays readable." One line asked and written to the record |

**The announcement.** A workflow change that other people feel — a routing rule, an owner pool, an SLA window — writes **one line** into the affected people's Home health strip and their next digest: what changed, who changed it, when, and a link. It expires after seven days or on first contact with the changed thing, whichever is sooner. It is not a tour, not a tooltip and not a modal; it is a fact in the place those people already read facts, which is what "in the flow of work" means and the only teaching mechanism the evidence supports.

### 3.5 Filters, search, sorting, columns

Search matches workflow name, trigger and rule text. Sort defaults to "Past the SLA window, then Could not route, then name", because that is the order the page is read in; every column sorts, and the choice persists. The column chooser is a popover labelled with its count. The one door is "Additional filters: trigger, owner, folder, archived (4)" — never "More".

### 3.6 States

| State | What the page shows |
|---|---|
| No workflows | "No workflows. A workflow routes what arrives — a form submission, a score crossing its threshold, a new contact — to a person, a list or a sequence." Then "Create a workflow" |
| Locked by plan (Starter) | The page opens with its **real shape and its real count**, values withheld: the table's columns, "6 workflows", and the plan name on each row. One panel: what workflows do, that they are on Growth, one total for the period, one button, and one line naming what is still possible without them ("Without it: assign an owner by hand from People, and route by saved view"). Never a screenshot, never a fake chart, never an empty state, and never a gate after a rule has been built |
| Off | The row and the record are fully readable; the status row names who turned it off and when. Nothing is greyed |
| Past the SLA window | The count is a number on the row and a block on the record; elapsed time in text; the reassignment rule printed above the list, so the reader knows what is about to happen without asking |
| At the credit ceiling | The ceiling row reads "200 a day · 200 used · reached 14:20". Enrolment and routing continue; enrichment does not; affected people and run rows are marked "not enriched — daily ceiling reached 14:20" with "Raise the ceiling" beside them |
| Nobody available | Exceptions read "Everyone in the pool is away until Monday", with the rule linked and the pool named. The lead is not silently assigned to somebody on holiday |
| Errored | In Enrolled, marked, with the failure in words: "Could not add to 'Q4 enterprise outbound': the mailbox is paused (bounce guard)" — and the bounce guard is a link |
| Loading | The table keeps its columns with placeholder bars; the SLA and ceiling numbers never render as 0 while loading |
| Error | "Couldn't refresh the run history; showing what was loaded at 09:12. Retry." The rules and the SLA block still render |
| No access (SDR, AE, CS) | "Workflows is used by marketers and RevOps admins here. The tasks workflows create arrive on your Tasks page. Daniel Okafor (RevOps admin) can add it to your permission profile." No greyed controls |

### 3.7 Keyboard, accessibility, phone

Table keyboard is `TablePage`'s: arrows move, Enter opens, `/` focuses search, Escape clears. On the record, `e` toggles the run-history door, and the two sections inside it are headings with their counts, reachable by heading navigation. Every door is a `button` with `aria-expanded` and a visible count.

Elapsed SLA time is text, never colour alone; "2h 14m over" reads correctly to a screen reader and to somebody who cannot tell red from grey. Status is a word, not a dot. The rule rows are a description list, condition then action, so the pairing survives without layout. The ceiling is announced as "200 of 200 credits used today" rather than as a bar.

At phone width the table becomes cards carrying name, status, past-the-window, could-not-route and ceiling; the record's sections stack; the run-history door opens in place with its two sections, and the filters inside it move into a sheet labelled "Filters: rule, rep, reason, date". Nothing that is level one on desktop becomes level two on a phone, and nothing reaches three.

### 3.8 By role and by business

| | Marketer | RevOps admin |
|---|---|---|
| Opens on | The table sorted by what is past the window | The same table |
| Reads daily | The SLA block, the exception count, the ceiling | The exception count and the ceiling |
| Edits | Rules, enrolment, actions, ceiling for workflows they own | Anything |
| Cannot | Open territories (the rule row names them instead) | — |

| Business | What changes |
|---|---|
| **Meridian Software** (Scale) | The routing workflow is the page. Forty-one MQLs a day against a two-hour window; the marketer's whole relationship with this page is the SLA block and the exception rows. Two reps away this week, and the rule row says so before anybody asks why the rotation skipped them |
| **Ridgeline** (Growth) | Inbound forms rather than MQL routing. The credit ceiling is the head here, because a form that enriches on submission is the one automation that can spend a month; "68 of 200 credits used today" and what happens at the ceiling are read every day |
| **Fathom Labs** (Starter) | No marketer seat, and the page is Growth. The founder meets it as a lock with the real shape, the real count and the price — and one line saying what she can do without it |
| **Halyard Agency** (Growth) | Routes nothing: outbound is run for clients and inbound belongs to the client's own systems. The page is in the sidebar for the OPS seat and almost never opened. That is data, not a gap |

## 4. Usage items

Share of active users in a role touching the item in a typical week (USAGE-MODEL.md). Baseline is Meridian. **DC** = decision-critical. Only the marketer and admin columns exist; no other seat has a number for any item, so the page is not on their sidebar and their no-access state names who uses it. The same table is `src/ollopa/usage/workflows.ts`.

| Item | Area | Mkt | Admin | Overrides (Fa, Ha, Ri) | DC |
|---|---|---|---|---|---|
| Workflows: name, trigger, status, enrolled, ceiling and spend | The workflow table | 55 | 35 | Ri 45/22; Fa –/3; Ha –/5 | |
| On or off, who turned it off and when | The workflow table | 25 | 20 | Ri 22/20; Fa –/3; Ha –/4 | ★ |
| On Starter: the real shape, the real count, the plan name, one total | The workflow table | 1 | 3 | Fa –/12; Ha –/3; Ri 1/3 | |
| Test this workflow on one record | The workflow table | 3 | 4 | Ri 4/4; Fa –/2; Ha –/2 | |
| What changed, who changed it, when | The workflow table | 4 | 4 | Ri 4/4 | |
| Who owns this workflow, and who is told when it errors | The workflow table | 3 | 4 | Ri 4/4 | |
| Folders and search | The workflow table | 4 | 4 | Ri 3/4 | |
| Duplicate, and what the copy does not carry | The workflow table | 3 | 3 | Ri 3/3 | |
| Archive: what stops, what is kept | The workflow table | 2 | 3 | Ri 2/3 | |
| The trigger | Trigger and enrolment | 4 | 4 | Ri 4/4 | |
| Enrolment filters, and how many match now | Trigger and enrolment | 4 | 4 | Ri 4/4 | |
| Enrolled twice: whether, and what happens | Trigger and enrolment | 4 | 4 | Ri 4/4 | |
| Enrolment limits, and what happens to the rest | Trigger and enrolment | 3 | 4 | Ri 4/4 | |
| The rule rows: this condition, then this action | Rules and actions | 10 | 10 | Ri 10/12 | |
| The routing rule in words, with who is away and skipped | Rules and actions | 25 | 15 | Ri 12/10 | ★ |
| The named-account override, named with its owner and count | Rules and actions | 10 | 8 | Ri 6/6 | |
| What the rule does | Rules and actions | 8 | 8 | Ri 10/10 | |
| A branch: two paths from one condition | Rules and actions | 3 | 4 | Ri 4/4 | |
| A wait step, and what happens to people already waiting | Rules and actions | 3 | 4 | Ri 4/4 | |
| Exit criteria | Rules and actions | 6 | 6 | Ri 5/6 | |
| Business hours, and what the clock does overnight | Rules and actions | 3 | 4 | Ri 4/4 | |
| People this workflow never touches | Rules and actions | 5 | 6 | Ri 4/6 | |
| A notify step: who is told, and where | Rules and actions | 3 | 4 | Ri 4/4 | |
| A change other people feel writes one line into their Home strip and digest | Rules and actions | 4 | 4 | Ri 4/4 | |
| The ceiling for this workflow, and today's spend against it | The credit ceiling | 25 | 25 | Ri 45/25; Fa –/3; Ha –/4 | ★ |
| At the ceiling: enrichment stops, routing continues, "Raise the ceiling" | The credit ceiling | 8 | 10 | Ri 28/18 | ★ |
| The response window per lead heat | The SLA | 20 | 15 | Ri 12/8 | ★ |
| How many are running against the clock now | The SLA | 50 | 25 | Ri 20/10 | ★ |
| Breached today, with the elapsed time in text | The SLA | 45 | 25 | Ri 18/10 | ★ |
| The reassignment rule in words | The SLA | 12 | 10 | Ri 4/5 | ★ |
| Run history and enrolment · n | Run history and exceptions | 30 | 25 | Ri 30/20 | |
| Enrolled (n): who, when, which rule, what it created | Run history and exceptions | 18 | 15 | Ri 16/12 | |
| Could not route (n): the reason, and the rule one link away | Run history and exceptions | 30 | 25 | Ri 32/20 | ★ |
| The task a run created, and the rep it went to | Run history and exceptions | 18 | 10 | Ri 14/10 | |
| Runs that errored: what failed, and why | Run history and exceptions | 12 | 15 | Ri 12/12 | |
| Filter the run history by rule, rep or reason | Run history and exceptions | 10 | 10 | Ri 10/8 | |
| Export the run history | Run history and exceptions | 3 | 4 | Ri 3/4 | |
| Columns in the run history | Run history and exceptions | 2 | 3 | Ri 2/2 | |

Nine of thirty-eight are decision-critical: the status, the four SLA numbers, the two ceiling items, the exception count and the routing rule's people. Seven of the nine are about somebody else's time or somebody else's money.

**Shape check**, computed from `workflows.ts` with `shape()`. The denominator is every item that exists for that role at that business.

| Pair | Items on their page | Head | Body | Tail | Verdict |
|---|---|---|---|---|---|
| Meridian marketer | 38 | 9 (24%) | 11 (29%) | 18 (47%) | Fits. The head is the table, the SLA and the exception queue: what is firing, on whom, and what it costs |
| Meridian admin | 38 | 7 (18%) | 13 (34%) | 18 (47%) | Fits |
| Ridgeline marketer | 38 | 7 (18%) | 11 (29%) | 20 (53%) | Fits. A different head from Meridian's on the same page: the ceiling and the exception queue, not the clock |
| Ridgeline admin | 38 | 5 (13%) | 15 (39%) | 18 (47%) | Head two points under, body four over. The admin builds rules here and reads them less often than the marketer does |
| Fathom admin | 38 | 0 | 1 (3%) | 37 (97%) | **The whole page is tail.** Starter does not include it, and no Fathom seat routes anything: the founder meets one row — the lock, at 12% — and never the rest. That is what a correctly-placed lock looks like in the numbers, and the gated-features pattern is explicit that a lock does not promote an item |
| Halyard admin | 38 | 0 | 1 (3%) | 37 (97%) | Same shape, different reason: Halyard is on Growth and has the page; it routes nothing, because inbound belongs to the client's own systems. Kept in the sidebar for the OPS seat and almost never opened |

## 5. Before: the common version

Apollo has Workflows, and it is one of the better-built parts of the product: the trigger list is long, the action list is long, and there are two real credit guardrails. What it does not have is a clock, an exception queue with reasons, or any statement of who is on the receiving end.

### 5.1 How it works

From `16-apollo-workflow-inventory.md` §17 (KB 4413804036109):

- **Build.** "Workflows > Create a workflow > Start from scratch > **date or schedule** … or **trigger event** (Contact updated, Contact changed jobs, Email replied/opened/clicked/bounced/not sent/unsubscribed, Meeting booked/cancelled/declined/rescheduled/no-show, Form submitted or abandoned, Contact or Company saved or added to a list, Call logged, Sequence finished or first step finished, Conversation recorded, Website visited, Account updated, Deal created or updated — **any one fires it**) > Edit filters for enrolment criteria > drag **Rules** (True-false, Multi-split, Traffic %, Delay, Exit) and **Actions** > Settings > Launch workflow."
- **Actions.** "**Integrations** (200+ apps via Pipedream), **Manage sequences**, **Manage lists**, **Manage deals**, **Enrich data** (emails, phones, job changes, with a waterfall toggle), **Assign manual tasks**, **Update contact or account**, **Send notifications** (Slack or email), **Send webhook**."
- **Limits.** "Settings > enrolment approval (auto, or Apollo creates review tasks) > **Limit records processed** (max people, companies and **credits per run**) > **Re-enrollment** … and a **total credit ceiling for the whole workflow**" — "these are the two credit guardrails Apollo gives you."
- **Runs.** "Workflow > Enrollment > limits, run history, completed and failed records (manual adds show who added them) > diagnose: **credit limit** (workflow's or owner's), missing contact owner, missing account owner, inactive mailbox > fix > **Retry failed records**." And the headline: "**credit-limit failures are the headline reason records fail**."
- **The trial.** "Launch > optionally run a **live trial** on N records with manual approve or reject" — and, verbatim: "**Trial Run is not a dry run — actions really execute, emails really send and credits really burn.** Only available for scheduled workflows."

### 5.2 What routing actually requires, which the product does not carry

From `17-sales-org-workflow-inventory.md` §4, "MQL → SDR routing", the whole documented flow: "Lead-to-account match → score gate … → weighted or capped round-robin, **minus reps on leave** → Slack notification → **SLA timer** → auto-reassign if untouched 'within a defined window (typically **2-4 hours** for high-intent leads)' → **named-account override** so enterprise ownership is not broken."

And the dataset that makes the clock the page's centre, same section: Optifai's 2026 study of **939 B2B SaaS companies using CRM timestamp data** (Q2 2025–Q1 2026) — average response **47 hours**; only **23% respond within 5 minutes**; **42% take over 24 hours**; and leads contacted in under five minutes close at **32% against 12%**.

### 5.3 Documented problems

| Problem | Where it shows | Source |
|---|---|---|
| No SLA clock anywhere | The routing flow needs a timer and an auto-reassign window; Workflows has a Delay rule and no clock | 17§4; 16§17 |
| No availability | "weighted or capped round-robin, **minus reps on leave**" — nothing in the product knows who is on leave | 17§4; spec 14's user fields are status, credit limit, credits used, last active |
| Failures are diagnosed, not queued | "Enrollment > … completed and **failed** records > diagnose" is a tab with categories, not an exception queue with the rule one link away | 16§17 |
| The most common failure is a budget failure and it is found after the fact | "**credit-limit failures are the headline reason records fail**" | 16§17 |
| A "trial" that is not a trial | "**Trial Run is not a dry run — actions really execute, emails really send and credits really burn**" | 16§17 |
| The trial is unavailable where it is most needed | "Only available for scheduled workflows" — so not for the triggered ones that route inbound | 16§17 |
| Any one of twenty triggers fires it | "**any one fires it**" makes the rule hard to reason about from the outside | 16§17 |
| Approval is a task nobody sees | "enrolment approval (auto, or Apollo creates **review tasks**)" puts an approval into a task queue with no consequence line | 16§17 |
| A webhook action and a notification action sit beside each other | A webhook cannot carry a decision, and nothing says so | 16§17; 19§10 |

### 5.4 What Apollo gets right, and Ollopa keeps

The two credit guardrails, kept and promoted: a per-run cap and a whole-workflow ceiling, with the observed spend beside them. The failure categories, kept as the exception reasons. "Retry failed records", kept, and given a price and a re-evaluation sentence. The long trigger list, trimmed to the ones a rule can be reasoned about from. And the enrolment approval idea, kept — but moved out of the task queue and given a consequence line, because approving an automation is a decision about other people's work.

## 6. After: the disclosed version

### 6.1 Level one and level two

| Role at business | Level one | Level two |
|---|---|---|
| Meridian marketer | The table with past-the-window, could-not-route and ceiling columns; the SLA block's four numbers; the routing rule with who is away; the ceiling and its behaviour; the exception count | "Run history and enrolment · 120" (holding Enrolled and Could not route as sections); "Additional filters (4)"; the column chooser |
| Meridian admin | The same, plus the rule rows and the edit history | The same |
| Ridgeline marketer | The table; the ceiling and its behaviour at the top of the record; the exception queue; the SLA block, shorter | The same |
| Fathom admin | One row: the page with its real shape, its count, the plan name and one total | The upgrade panel |
| Halyard admin | The table, with nothing in it | The same |

### 6.2 Every door

| Label as shown | Container | Why |
|---|---|---|
| "Run history and enrolment · 120" | Expand in place at the foot of the record | Long, and read after the rules rather than beside them. It holds two **sections**, not two doors |
| "Additional filters: trigger, owner, folder, archived (4)" | Expand in place, in the filter row | The filters under 20% for this seat and business |
| "Columns: 8 of 11" | Popover | Small and interactive |
| "Filters: rule, rep, reason, date" (phone) | Sheet | Same values as desktop |

No door holds an SLA number, a ceiling, a reason or a consequence. The exception rows sit one level down because there are 120 run rows and 7 of them matter — but the **count** is on the page, on the row, in the column, and the reason is the first thing inside.

### 6.3 Persistence

Sort, filters, columns and the run-history door's open state persist per user per workspace and sit in the URL, so a link to "this workflow's exceptions" reproduces the view. Which of the two sections was last open persists too. Nothing about the workflow itself is remembered per reader: the rules are the object's state.

### 6.4 Accelerators

`g w` opens Workflows (spec 00 adds it to the marketer's and admin's shortcuts). `e` toggles the run-history door. The three counts in the table are deep links straight to the block they name. "Retry 7" acts on a whole exception group. And "Test on one record" is the accelerator that matters most, because it is the only way to answer "what will this do" without doing it — which Apollo's trial, by its own documentation, cannot.

### 6.5 Decision-critical

Nine items (§4). The rule 7 test: without clicking anything, can the reader find what is running against a clock, what has breached, what could not be routed, what it is costing, and whether the rule is on? Yes — all five are columns on the table and blocks at the top of the record, on every plan that includes the page. The two that are about somebody else — who the routing sends to, and who is away — are printed in the rule row, because who is on the receiving end of an automatic action is part of the action.

### 6.6 Removed rather than hidden

A "live trial" that really sends. Approval as a task in somebody's queue. Traffic-percentage splits (an A/B test of a routing rule is an experiment on people's livelihoods, and the sequences page is where variants belong). The webhook action, which moved to the developer surfaces where the delivery contract lives. A separate exceptions page, which would put the rule and its failures on opposite sides of a navigation. And "any one fires it": a workflow has exactly one trigger, because a rule nobody can reason about is a rule nobody can fix.

### 6.7 The nine-point score

| # | Question | Score | Line |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | Status, the four SLA numbers, the ceiling and its behaviour, the exception count and the routing rule's people: columns on the table and blocks at the top of the record |
| 2 | Every visible item backed by a sourced number | 2 | Thirty-eight items in `workflows.ts`; six pairs shape-checked with one stated denominator |
| 3 | No path exceeds two levels on any screen size | 2 | Page → record (navigation, no level) → one door; the two sections inside it are headings, not doors; the phone sheet is the same one level |
| 4 | Doors labelled by content, chevron and text | 2 | Every door names its contents and its count; "Additional filters", never "More" |
| 5 | Doors adjacent, keyboard and touch | 2 | The run door sits under the rules it reports on; `e` toggles it; counts are links with real targets |
| 6 | No dependent information split across a door | 2 | The window with the clock and the reassignment rule; the ceiling with what happens at it; business hours with the window they govern; the exception with its reason and its rule |
| 7 | State persists; expand all and print | 2 | Sort, filters, columns, door and section state per user and in the URL; print expands the run history |
| 8 | User action or object state, never inferred history | 2 | Everything that changes on this page changes because an object changed: a breach, a ceiling, an away date, a rule someone edited. Nothing reorders by what the reader did last week |
| 9 | Instrumented; promote, keep or delete review | 1 | Door opens, exception-row opens and the retry rate are counted per role and business, and the share of breaches that were read before they breached is counted beside them — a clock nobody looks at before it runs out is a clock that is not working. Review scheduled; one point withheld until it has run |

**17 of 18.**

## 7. Lesson steps

Not a lesson. The four rules that mattered most:

- **Rule 1, read per business.** The same page has two different heads: at Meridian it is the clock, at Ridgeline it is the credit ceiling. Neither is a mode and nobody chose it; the numbers put each one there.
- **Rule 7, applied to somebody else's time.** An automatic action has a receiving end. "Weighted round robin across 6 reps · 1 away until 18 Sep · skipped" is a consequence line, and it is the difference between a rotation and a lead sitting in a holiday inbox for a week.
- **Rule 4, applied to a failure.** A door that says "Run history · 120" and a section inside it that says "Could not route (7)" with the reason on every row is the honest version of a Failed tab. The count travels up to the table, where the decision to look is made.
- **The gated-features pattern, rule 8 and rule 7.** On Starter the page shows its real shape and its real count with the values withheld, and the lock is at the entry point — never after somebody has built a rule they cannot keep.

## 8. Review

| Check | Gap found | Closed by |
|---|---|---|
| All roles covered | The map gives the page to OPS and MK, and the first draft described only OPS | §3.8: the marketer's day is the SLA and the exceptions; the admin's is the rules |
| All four businesses covered | Halyard and Fathom looked like omissions | Both are stated: Fathom meets a lock, Halyard has the page and routes nothing. Two 97%-tail rows, explained rather than smoothed |
| Every field has a source | Workflows, runs, exceptions, SLA, ceilings and availability were in no seed | §2 lists them with types; `availability` is defined here and read by spec 14 |
| Every action has an outcome | Turn off, archive, duplicate and retry had none | §3.4, each with what stops and what is kept |
| Empty, error, no-access | The Starter state was an empty page | Preview: the real shape, the real count, the plan name, one total, and what is still possible without it |
| Keyboard | The SLA breach used colour | Elapsed time in text; status as a word; rules as a description list |
| Phone width | The run door's filters had nowhere to go | A sheet with the same values; the two sections still expand in place |
| Decision-critical visible | The ceiling was inside the run-history door in the first draft | Its own section at the top of the record, and a column on the table |
| Two levels maximum | Enrolled and Could not route were drafted as two doors inside one door | They are sections inside the one door; the door is the level |
| Doors labelled by content | "More filters" | "Additional filters: trigger, owner, folder, archived (4)" |
| Dependent fields together | Business hours were in Settings and the window was here | Both in the SLA section, because a clock and the hours it runs in are one fact |
| State persists | A link to the exceptions reopened the record closed | Door and section state in the URL and per user |
| Accelerators present | None | `g w`, `e`, the three deep-linked counts, "Retry 7", and a test that really is a test |
| Usage shape checked | The first numbers put two thirds of the page in the head | Rewritten against what is watched daily versus what is built once; the branch, wait, exit, hours, suppression and housekeeping controls are the tail a real builder accumulates |
| Nothing hover-only | Rule conditions were truncated with a tooltip | They wrap; a long condition takes two lines |
| Role gaps explain themselves | A marketer clicking the territory link hit a bare no-access page | The rule row states the override, its owner and its count, so the answer is in place and the link is never the only route to it |
| No usage numbers or teaching text | The ceiling block read like advice | It states what happens at the ceiling and offers the control. No recommendation, no "tip" |
