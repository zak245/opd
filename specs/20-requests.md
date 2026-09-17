# Requests

*The twentieth spec. One page (`P-requests`), one record (`R-request`). Usage items: `src/ollopa/usage/requests.ts`. Nodes: IA-MAP 2.11. Seat OPS only; on every plan, because this is where an upgrade is asked for. Written because the journey walk of 15 September found three RevOps journeys (O5, O9, O10) ending on a page no spec owned (walk/APPLY-C, "changes skipped" item 1 and cross-group dependency 1).*

## 1. Purpose

A request is somebody asking the admin to change what other people see. It is an object: **requester, what they want to be able to do, the reason, the affected setup** (a field, a stage, a workflow, a permission, a plan feature), **the decision owner, the evidence, the state, the decision date and the implementation evidence.** The page is the queue those requests wait in, and the record is one request from the ask to the verified change.

Two kinds, one queue. A **change request** asks for something the workspace does not do yet. An **upgrade request** asks for something the plan does not carry. They share a queue because both are somebody asking the admin to change what other people see, and because two queues for one decision is how an approval gets missed (IA-MAP 6.4c; revops walk O5-4). Routing exceptions are not a third kind: they are about **records**, so they stay on Workflows where the rule that produced them is one click away (spec 19 §1). Requests are about the **workspace**.

Six ways a request arrives, and every one of them is a place in the product rather than a message: the **ask-the-admin panel of a locked feature** (`X-upgrade`'s "Ask Daniel Okafor"), the **no-access page** for an area a seat does not hold, a **report** somebody cannot build, a **permission** somebody needs, a **field or stage** change, and a **routing change**. The product captures the origin; the person corrects it if it is wrong.

Who lives here: the **RevOps admin**, and nobody else. The requester never opens this page — their seat does not hold the area — so the answer travels back to them instead: to the lock they met, to one line on Home, and to one line in their next digest. The queue is read as a **batch**, at a boundary the admin chose, and nothing in it interrupts: requests are not one of the three interrupting notification kinds (spec 00 §3.4), because nothing in this queue is sending or spending right now. What arrives on its own is one digest line with the count and the oldest waiting time.

The one thing they must never lose sight of: **who is waiting, for how long, and what will change for other people if this is approved.** Two numbers carry that — the **waiting time against a two-business-day answer target**, and the **count of people who will feel the change**. The answer target is the intake SLA the field publishes: a deal desk's own targets are "same or next business day" for a standard ask and 2–3 business days for a complex multi-approver one, with DealHub tiering it 24h / 48h / 72h (`18-ae-and-sales-leader-notes.md`, deal desk). Two business days is a promise about an **answer** — approve to investigate, approve to implement, or decline — never about a shipped change.

Three things this page owns and no other page redefines: the **two approvals** as two separately-dated actions, the **"applies to" rollout scope** that stands in for a sandbox Ollopa does not have (IA-MAP 6.2), and the **verify count** that reads whether the change was used. Two things it does not own: the settings it changes (each is a link into Settings, where the field, stage, profile or plan row actually lives) and the announcement itself, which is one mechanism for the whole product (spec 00 §3.4, rendered on Home's health strip by spec 01 and written by spec 19 for routing changes).

## 2. Data

Sources are `src/ollopa/data/seed.ts`, `businesses.ts` and the `settings` object spec 14 §2.2 adds. The seed's fixed "today" is 13 September 2026.

| Field | Where shown | Source | To add to seed |
|---|---|---|---|
| Kind | Table, record header | none | `requests[]`: `{ id, kind: "change" \| "upgrade" }`. Meridian 9 open, all change; Halyard 14 across ten client workspaces (11 change, 3 upgrade); Ridgeline 4 (3 change, 1 upgrade); Fathom 2, both upgrade |
| The requested outcome | Table, record title | none | `requests[].outcome`: one sentence in the requester's words. "See which deals lost a required field at Proposal" |
| The reason | Record | none | `requests[].reason`: `"new information" \| "an approved decision" \| "a defect in the current result"`, plus `reasonText` |
| Requester, seat, when | Table, record | `businesses.roles` and the users spec 14 §2.2 adds | `requests[].requester: { user, seat, at }` |
| Origin | Record | none | `requests[].origin`: `"locked control" \| "no-access page" \| "report" \| "permission" \| "field or stage" \| "routing"`, plus `originLabel` in words ("Trying to add a second mailbox on the Email sending page") |
| What the requester attached | Record | `seed` records, `reports` | `requests[].evidence[]`: `{ kind: "record" \| "view" \| "report", id, label }` |
| Decision owner | Table, record | users | `requests[].decisionOwner: userId` |
| State | Table, record | none | `requests[].state`: `"captured" \| "investigating" \| "approved" \| "shipped" \| "verified" \| "declined"` |
| Waiting time, and whether it is past the target | Table, record header | computed | `requests[].raisedOn`, plus the workspace target `settings.requests.answerTarget: { businessDays: 2 }`. Meridian: 3 of 9 past it, the oldest 6 days |
| The two approvals | Record | none | `requests[].approvals: { investigate?: { by, on }, implement?: { by, on } }` — two objects, never one flag |
| Declined | Record | none | `requests[].declined?: { by, on, reason }`; the reason is required |
| The impact estimate | Record | none | `requests[].estimate`: written only once the state has passed captured |
| The approved baseline | Record | none | `requests[].baseline`: what the setup did before this request |
| What it touches | Table, record | Settings items, `workflows[]`, `settings.pipeline.fields` | `requests[].touches[]`: `{ kind: "field" \| "stage" \| "workflow" \| "profile" \| "report" \| "plan feature", id, name }` — each renders as a link to the thing itself |
| Who will feel it | Table, record | users, teams, territories | `requests[].affected: { count, how }`; `how` is the sentence that produced the count ("everyone on a seat that edits deals: 34") |
| Applies to | Record | teams, territories | `requests[].scope`: `{ kind: "team" \| "territory" \| "everyone", name? }`, widened in place, with `scopeHistory[]` |
| The rollback path | Record | none | `requests[].rollback`: words, not a button. "Remove the field; values are kept 30 days" |
| Shipped | Record | none | `requests[].shippedOn`, `shippedBy` |
| The announcement that was written | Record | spec 00 §3.4 | `requests[].announcement?: { text, writtenOn, expiresOn }` — the same line Home's health strip and the digest render |
| Verified | Record | computed | `requests[].verify: { used, of, since }`. "19 of 34 have used it since 4 September" |
| The discussion | Door | none | `requests[].notes[]`: `{ by, at, text }`; a note addressed to one teammate is `X-note` with a recipient, as everywhere else |
| Implementation evidence and the test result | Door | none | `requests[].test?: { what, on, by, result }` |
| Full history | Door | none | `requests[].history[]`: `{ at, by, what }` |
| Related request | Door | none | `requests[].relatedTo?: requestId` |
| The upgrade kind's extra fields | Table, record | `businesses.plan`, spec 14's plan table | `requests[].upgrade?: { feature, plan, monthlyTotal, newTotalForPeriod, alternative, alsoAskedBy: userId[] }`. Fathom: Theo Lindqvist, a second mailbox; Theo Lindqvist, Territories (Growth, $237 a month for 3 seats). Only one seat at Fathom can raise one, because the other is the admin |
| Retention | Door | none | `settings.requests.retention: { declinedDays: 365 }` |

`requests[]` and `settings.requests` are defined here. `requests[].announcement` is written by this spec and rendered by specs 00 and 01; `requests[].touches[]` points at rows spec 14 and spec 19 own, and points at them rather than copying them.

## 3. Features

### 3.1 The page

Route `requests`. A table, from `TablePage`. Columns: **Request** (the requested outcome, one line) · **Kind** · **Asked by** · **Waiting** · **What it touches** · **Affects** · **Cost** · **Decision owner** · **State**.

Level one above the table: a search box, the **state chips with their counts** ("Needs a decision (4) · Investigating (2) · Approved (1) · Shipped (1) · Verifying (1)"), and one line that is the whole page in a sentence: **"9 waiting · 3 past two business days · oldest 6 days (Jonas Weber)"**. Default sort: past the answer target first, then oldest. One door on the table: "Additional filters: requester, decision owner, what it touches, kind, archived (5)".

Three columns are the reason this is a page rather than a list. **Waiting** is somebody else's week, in days, in text. **Affects** is how many people will feel the change. **Cost** is the monthly total on an upgrade row, before it is opened, because approving an upgrade is a price decision and rule 7 applies to the approver's screen. Where nothing in the workspace is locked the Cost column is **removed, not shown empty** (rule 4) — at Meridian, on Scale, the upgrade kind cannot occur at all.

**The queue is the batch.** There is no queue mode and no "next request" console: the page is one sitting, and the admin chooses when to sit. Bulk actions follow from that: **"Approve 4 to investigate"** is offered, with the line "nothing changes for anybody yet", and **there is no bulk approve to implement** — each of those is read on its own record. Rule 7's corollary is the reason: shown a problematic action and asked to approve it step by step, people saw it 88.5% of the time and stopped it 23.9% (Chen et al., n=48), so a batch button over changes other people feel would be a pass-through machine.

Rows open the record. There is no quick look, because this is a dwelling task: a person opens a request to decide it, not to scan past it (RULES.md, the quick look and the record; the map gives `P-requests` no `Q-` node).

### 3.2 The record

`R-request`, from the record template. Header: the requested outcome as the title, the kind, who asked and when, the state as a word, the decision owner, and the waiting time against the target ("4 days waiting · 2 past the target").

Sections, scrolling, in the order the questions are asked:

1. **The ask.** The requested outcome; the reason as one of the three named reasons with a line of text; the origin in words with a link back to it; what the requester attached. The **impact estimate** sits at the foot of this section and is **empty until the state passes captured**, because 19§8.2 says to capture the request before estimating it and an estimate field open at capture time invites the admin to argue with the ask before reading it.
2. **The decision.** The decision owner, named. Then the two approvals as **two rows with their own dates and their own people**: "Approve to investigate — Daniel Okafor, 5 September" and "Approve to implement — Priya Raman, 9 September". Decline sits beside them, the same size, and its reason is required.
3. **What it changes.** What it touches, each a link to the field, stage, workflow, profile, report or plan row itself. Who will feel it, with the count and the sentence that produced the count. **Applies to** — one team, one territory, or everyone — with "Widen" in the same row. The **rollback path in words**. The approved baseline underneath, because what it did before and what it will do next are read together (rule 5).
4. **Rollout and verification.** When it shipped and who shipped it; the announcement line exactly as the affected people read it; and the verify count: "19 of 34 have used the required field since 4 September". One number, a behaviour count, not a completion tick.
5. **For an upgrade request, section 3 and 4 are replaced by one section**: the feature, the plan that carries it, the monthly total, **the new total for the period stated before the button**, the line naming what is still possible without it, and who else has asked for the same lock. Nothing else about an upgrade is deferred: the approver is making a price decision on the whole workspace.

Three doors, siblings, never one inside another: **"The discussion · 6 notes"**, **"Implementation evidence and the test result"**, **"Full history · 14 changes"**.

### 3.3 The two approvals, and what each one says

19§8.2, verbatim: "**Separate approval to investigate from approval to implement.**" They are separated here because they are two different promises, and the labels say so.

- **"Approve to investigate"** carries **no consequence line**, and says that plainly: "Nothing changes for anybody yet. This says the question is worth the admin's time." It batches, it is reversible by declining afterwards, and it moves the state to investigating.
- **"Approve to implement"** carries its consequence in the label and again in the confirmation: **"Approve · adds a required field at Proposal · 34 people see a new required field · applies to the Northwind team first · rollback: remove the field, values kept 30 days."** It is never bulk, never keyboard-only, and never available before the affected count and the rollback path have been written — the button reads "Write the rollback path first" until they are, and names what is missing (the same shape spec 14's ordered offboarding uses).

A change that other people feel writes **one announcement line** on approval to implement: what changed, who changed it, when, and a link to the changed thing, into the affected people's Home health strip and their next digest, expiring after seven days or on first contact with the changed thing. It is the product's one announcement mechanism (spec 00 §3.4) and this page does not invent a second. It is not a tour, not a tooltip and not a modal; 19§8.4's warning is the reason it exists at all — "**The sandbox rehearses the system; nothing rehearses the reps.**"

### 3.4 Actions and outcomes

| Action | Where | Outcome |
|---|---|---|
| Raise a request | Any locked control, the no-access page, a report, a permission, a field or stage, a routing rule | One field — "What are you trying to do?" — prefilled with the origin in words and editable, then one button (spec 14 §3.4). The request appears here with the origin, the feature and the cost already on it |
| Open | Table row | The record; Back returns with the sort, the filters and any open door intact |
| Approve to investigate | Row, record, bulk | State becomes investigating; the line "nothing changes for anybody yet" is in the confirmation; the requester is told where they asked |
| Approve to implement | Record only | The consequence in the label and the confirmation; the change is applied at its scope; the announcement line is written; the state becomes shipped and the verify count starts |
| Decline | Row, record | A reason is required. The requester reads it where they asked: at the lock, on Home, in the next digest. For an upgrade, the lock stays exactly where it was and nothing moves (gated-features pattern rule 10) |
| Hand the decision over | Row, record | The decision owner changes with one line saying why; the waiting clock does not restart, because the requester's week does not restart |
| Widen the scope | Record | From the same row: one team → one territory → everyone, each widening recorded with its date. This is Ollopa's answer to "build and test somewhere safe": staged rollout, stated on the row, with the loss of a sandbox recorded rather than hidden |
| Ship it | Record | Marked shipped with who and when, and a link to the thing that changed. Ollopa does not make the change for you: the link opens `X-field`, `R-workflow` or `X-user`, where the change is actually made |
| Verify | Record | Reads the count of affected people who have used the changed thing since it shipped. No target and no green tick: the number is the evidence |
| Reopen | Record | For a verified request whose change did not hold; the history keeps both passes |
| Merge two requests | Row | Both requesters are kept and both are told; the older raised date wins, because the queue owes an answer from the first ask |
| Copy out | Record | The request's fields and its link as text, for a company that runs intake in its own tracker. Ollopa does not pretend to be that tracker |
| Archive | Row | For a declined or superseded request: "It stops appearing in the queue. The record, the reason and the history stay readable, and declined requests are kept for a year" |
| Export the queue | Page | CSV. Exporting a table a seat can already read is on every plan (spec 14 owns that sentence) |

**Nothing closes itself.** A request nobody answers stays in the queue and keeps counting, and the empty state of the "past the target" group says so: "Nothing here closes on its own." An auto-closed request is an unanswered request that has been hidden.

### 3.5 Filters, search, sorting, columns

Search matches the outcome, the requester, the reason text and the name of anything it touches. Sort defaults to past the target, then oldest, and the choice persists per person. Saved views — "Mine to decide", "Past the target", "Waiting on somebody else" — are filters with names, in the URL, not a second page. The column chooser is a popover labelled with its count ("Columns: 9 of 14"). The one door is "Additional filters: requester, decision owner, what it touches, kind, archived (5)" — never "More".

### 3.6 States

| State | What the page shows |
|---|---|
| Empty | "No requests. When somebody meets a locked feature, an area their seat does not hold, or a field that is not there, their ask arrives here with what they were trying to do." Nothing to create: a request is raised where the problem was met, never here |
| Nothing past the target | The line reads "4 waiting · none past two business days · oldest 1 day" |
| Past the target | The count is in the line above the table and the days are in text on the row ("6 days · 4 past the target"), never colour alone, and the group sorts first |
| Needs a rollback path | The record shows the section with the field empty and the implement button reading "Write the rollback path first · affected count and rollback are missing". Not greyed, not hidden: named |
| Declined | The record stays readable with the reason, who declined and when, at the top. A declined request is evidence, not a deletion |
| Shipped, not verified | "Shipped 4 September · 19 of 34 have used it since" and, past 30 days with nothing read, "Nothing has used this since it shipped" — stated, not interpreted |
| The profile left this page out (Fathom) | The page opens normally from the Settings plan strip line, from ⌘K or from a deep link, and its header offers **"Add to sidebar"**. The second upgrade request in a week puts it in the sidebar for two weeks and then asks "Keep it?" once (IA-MAP 6.4a) |
| No access (SDR, AE, marketer, CS) | "Requests is used by the RevOps admin here. Anything you have asked for comes back to you where you asked it — on the locked control, on Home, and in your next digest. Daniel Okafor (RevOps admin) decides these." No greyed controls, and no read-only copy of the queue |
| Loading | The table keeps its columns with placeholder bars; the waiting days and the affected count never render as 0 while loading |
| Error | "Couldn't refresh the queue; showing what was loaded at 09:12. Retry." The counts that were loaded still render, marked with their time |

There is no plan-locked state. This page is on **every plan**, because it is where an upgrade is asked for and gating the ask would gate the sale — and because a declined permission is a decision-critical answer somebody is owed on Starter as much as on Scale.

### 3.7 Keyboard, accessibility, phone

Table keyboard is `TablePage`'s: arrows move, Enter opens, `/` focuses search, Escape clears. `g q` opens Requests (spec 00 §3.2 already prints it). On the record, `e` toggles the discussion door; the three doors are `button`s with `aria-expanded` and a visible count. **No shortcut approves anything**, for the same reason no palette command does (spec 00 §3.3): approving without the consequence line in front of you is the 76% pass-through rule 7's corollary warns about.

Waiting time, the affected count and the state are words and numbers, never colour alone: "6 days · past the target" reads correctly to a screen reader and to somebody who cannot tell amber from grey. The two approvals are a description list — action, then who and when — so the pairing survives without layout. The verify count is announced as "19 of 34 people have used it since 4 September", not as a bar.

At phone width the table becomes cards carrying the outcome, the waiting time, the affected count, the cost where there is one, and the state; the record's sections stack; the three doors open in place; the filters move into a sheet labelled "Filters: requester, decision owner, what it touches, kind, archived". Nothing that is level one on desktop becomes level two on a phone, and nothing reaches three.

### 3.8 By role and by business

Only the admin seat has this page. The other four seats meet it exactly twice: when they raise something, and when the answer comes back to them.

| | RevOps admin |
|---|---|
| Opens on | The queue sorted by what is past the answer target |
| Reads weekly | The waiting line, the state chips, the affected counts, the cost on any upgrade row |
| Decides | Both approvals, the decline, the scope, the rollback path |
| Does not own | The settings the change touches (each is a link) or the announcement's shape (spec 00) |

| Business | What changes |
|---|---|
| **Meridian Software** (Scale, separated) | The intake process is the page. Nine open, four teams asking at once, three past two business days. Nothing is locked on Scale, so **the upgrade kind cannot occur and its five rows and the Cost column are removed** — the queue has one kind here. The head is the queue, the ask and the state; the rollback path and the verify count are monthly work |
| **Halyard Agency** (Growth, agency) | Fourteen open across ten client workspaces, so the same queue is daily rather than monthly and the head is the widest of the four: the asks are small and repeat — one client's new starter, one client's report column — which is why the **estimate, the announcement and the verify count sit lower here than at Meridian** while the queue, the ask and both approvals sit higher. The workspace name is in the top bar on every row |
| **Ridgeline** (Growth, product-led) | Four open. Lifecycle fields and one Scale-only lock. The queue is read weekly and decided monthly, so the head is the queue and the ask and little else |
| **Fathom Labs** (Starter, founder-led) | The page is not in the sidebar and does not need to be. Everyone except the SDR is an admin, so **only one seat can raise a request**, and the two waiting are both his: a second mailbox, and Territories at $237 a month for 3 seats. The founder meets this page as an upgrade queue with a price on it, from the Settings plan strip line. No head at all in the numbers, and that is the correct shape for a workspace with no intake process |

## 4. Usage items

Share of active users in a role touching the item in a typical week (USAGE-MODEL.md). Baseline is Meridian. **DC** = decision-critical. Only the admin column exists: no other seat has a number for any item, which is why the page is on no other sidebar and its no-access state names who decides. "–" means the item does not exist at that business. The same table is `src/ollopa/usage/requests.ts`.

| Item | Area | Admin | Overrides (Fa, Ha, Ri) | DC |
|---|---|---|---|---|
| Requests: outcome, kind, who asked, days waiting, who decides, state | The queue | 50 | 10 / 55 / 32 | |
| How long each has waited, oldest first, against the two-day target | The queue | 42 | 9 / 50 / 30 | ★ |
| State chips with counts | The queue | 28 | 6 / 34 / 22 | |
| The whole queue read in one sitting, at a boundary the admin chose | The queue | 22 | 5 / 30 / 20 | |
| Which kind: a workspace change, or a locked feature | The queue | 18 | 9 / 24 / 14 | |
| The monthly total on an upgrade row, before it is opened | The queue | – | 11 / 16 / 9 | ★ |
| How many people will feel the change, on the row | The queue | 14 | 3 / 8 / 11 | ★ |
| Search and sort; the sort persists | The queue | 8 | 3 / 12 / 7 | |
| Saved views: mine to decide, past the target, waiting on somebody else | The queue | 4 | 1 / 8 / 3 | |
| Additional filters (5) | The queue | 4 | 2 / 6 / 3 | |
| Columns: 9 of 14 | The queue | 3 | 1 / 4 / 2 | |
| Export the queue | The queue | 2 | 1 / 4 / 2 | |
| What the person should be able to do afterwards, in their words | The ask | 38 | 9 / 46 / 28 | |
| Who asked, which seat, and when | The ask | 32 | 9 / 40 / 24 | |
| The reason: new information, an approved decision, or a defect | The ask | 18 | 7 / 20 / 14 | |
| Where it came from, in words | The ask | 16 | 10 / 18 / 12 | |
| What the requester attached | The ask | 4 | 2 / 4 / 3 | |
| The impact estimate, written after capture and never before | The ask | 8 | 2 / 4 / 5 | |
| Two people asked for the same thing: merged, both names kept | The ask | 3 | 1 / 6 / 2 | |
| The shape of the ask: which questions a requester answers | The ask | 3 | 1 / 3 / 2 | |
| The state: captured, investigating, approved, shipped, verified | The decision | 30 | 7 / 38 / 22 | ★ |
| The decision owner, named by the decision they own | The decision | 24 | 5 / 24 / 18 | |
| The answer this queue owes: two business days, and what is past it | The decision | 22 | 5 / 28 / 20 | ★ |
| Approve to investigate: what it does not change | The decision | 14 | 4 / 20 / 10 | |
| Approve to implement: the consequence in the label and confirmation | The decision | 14 | 4 / 20 / 10 | ★ |
| The two approvals as two separately-dated actions | The decision | 10 | 3 / 12 / 7 | ★ |
| Decline with a reason, read where the person asked | The decision | 12 | 6 / 16 / 8 | ★ |
| Several approved to investigate at once; never to implement | The decision | 4 | 1 / 8 / 3 | |
| Hand the decision to the person who owns it | The decision | 4 | 1 / 4 / 3 | |
| Who a kind of request goes to when nobody is named | The decision | 3 | 1 / 4 / 2 | |
| What happens to a request nobody answers: nothing closes itself | The decision | 3 | 1 / 3 / 2 | |
| What it touches, each a link to the thing itself | What it changes | 16 | 4 / 10 / 12 | |
| Who will see the change, named, counted, and how it was counted | What it changes | 12 | 3 / 6 / 8 | ★ |
| Applies to: one team, one territory, everyone — widened from the row | What it changes | 10 | 2 / 4 / 7 | ★ |
| The rollback path in words, and what happens to values entered | What it changes | 10 | 2 / 5 / 7 | ★ |
| The approved baseline: what the setup did before | What it changes | 4 | 2 / 3 / 4 | |
| What Ollopa does instead of a sandbox, stated on the row | What it changes | 3 | 1 / 3 / 3 | |
| Shipping writes one line into the affected people's Home strip and digest | Rollout and verification | 9 | 2 / 4 / 5 | |
| Verified: how many of the affected have used it since it shipped | Rollout and verification | 10 | 2 / 4 / 7 | |
| Shipped but not verified, with how long since | Rollout and verification | 4 | 1 / 3 / 4 | |
| Reopen a verified request when the change did not hold | Rollout and verification | 3 | 1 / 2 / 2 | |
| What the requester is told, and where | Rollout and verification | 4 | 2 / 6 / 3 | |
| The feature, the plan, and what they were trying to do at the lock | The upgrade kind | – | 14 / 16 / 9 | ★ |
| The new total for the period, stated before the button | The upgrade kind | – | 12 / 14 / 8 | ★ |
| How many have asked for the same locked feature, and when | The upgrade kind | – | 10 / 6 / 4 | |
| What is still possible without the upgrade | The upgrade kind | – | 8 / 4 / 3 | |
| A declined upgrade: the lock stays, the reason reaches the person | The upgrade kind | – | 6 / 4 / 2 | |
| The discussion · n notes | Evidence and discussion | 9 | 2 / 10 / 6 | |
| Implementation evidence and the test result | Evidence and discussion | 8 | 2 / 4 / 4 | |
| What was tested, on what, by whom, and the result | Evidence and discussion | 4 | 1 / 3 / 3 | |
| Full history: what changed, who changed it, when | Evidence and discussion | 4 | 1 / 4 / 2 | |
| Link a request to the one it came out of | Evidence and discussion | 3 | 1 / 3 / 2 | |
| Copy a request out to the company's own tracker | Evidence and discussion | 3 | 2 / 4 / 2 | |
| How long declined and archived requests are kept | Evidence and discussion | 2 | 1 / 3 / 2 | |
| Archive a declined or superseded request | Evidence and discussion | 3 | 1 / 4 / 2 | |

Fifty-five items. **Thirteen are decision-critical**: the waiting time, the cost on the row, the affected count, the state, the answer target, approve-to-implement, the two dated approvals, the decline, who will see the change, the scope, the rollback path, and the upgrade's feature and new total. Eleven of the thirteen are about somebody else's week or somebody else's money, which is what this page is for.

**Shape check**, computed from `requests.ts` with `shape()`. The denominator is every item that exists for that role at that business, so Meridian's is 49: the six upgrade-kind rows cannot occur on Scale and are removed rather than counted as unused.

| Pair | Items on their page | Head | Body | Tail | Verdict |
|---|---|---|---|---|---|
| Meridian admin | 49 | 9 (18%) | 18 (37%) | 22 (45%) | Fits, with the body two points over. The head is the queue, the waiting line, the state and the ask |
| Halyard admin | 55 | 13 (24%) | 18 (33%) | 24 (44%) | Fits. The widest head of the four, because ten client workspaces make a monthly queue a daily one |
| Ridgeline admin | 55 | 8 (15%) | 21 (38%) | 26 (47%) | Head at the floor, body three points over. Read weekly, decided monthly |
| Fathom admin | 55 | 0 | 19 (35%) | 36 (65%) | **No head.** Starter, no intake process, and the page is not in the sidebar: the founder meets it as two priced upgrade asks from her own SDR, reached from the Settings strip line. A workspace where everyone is an admin has nobody to ask, and the numbers say so rather than smoothing it |

The body runs two to three points over at every business and that is named rather than tuned, for the same reason spec 14 names it: **monthly work is what the middle of the distribution is**, and this page's items are one object's fields rather than a product's settings, so nearly all of them are read on every request that ships. The tail was lengthened with the controls a real intake queue accumulates — saved views, the default owner per kind, the shape of the ask, retention, copy-out, the related-request link, reopen — rather than by trimming the head alone.

## 5. Before: the common version

**Apollo has no intake object at all.** Not a buried one, not a badly-labelled one: there is no request, no queue, no state and no decision owner anywhere in the product. This is the one "before" in the library that is an absence rather than a layout, and it has to be written honestly, because the disclosure lesson here is that a queue with no home is not a queue that is hidden — it is a queue that cannot be counted.

### 5.1 What Apollo has instead

- **The fourteen pages** the product is built from (`16-apollo-workflow-inventory.md` §23) are Home, People, Companies, Lists, Sequences, Inbox, Tasks, Deals, Campaigns, Accounts, Reports, Agents, Settings, Connect an integration. None of them is a request queue, and none of the 234 documented workflows in that memo is "answer a teammate's request".
- **The knowledge base itself** has no intake category. All 286 English articles as of 14 September 2026 split: Engage 77 · Search and Prospect 71 · Integrations 43 · Settings and Billing 29 · Get Started 24 · Enrich 14 · Conversations 11 · Deals 8 · Workflows 7 · Home 2 (16, Sources).
- **Two things in Apollo are called "requests" and neither is this one.** **Data requests** is job-change request history and waterfall reports, under Credits and activity (`07-apollo-settings-map.md`; KB 4738396786701). **Removal requests** is a rolling 30-day list of saved contacts who asked Apollo to delete them, with Export CSV, added April 2026 (07; KB 19331318468621). One is a lookup log; the other is a compliance list. A third, "request a domain change", is in License settings (07) and is an ask to Apollo, not to your admin.
- **Meetings › intake forms** (16, KB 17919970244109) is a prospect-facing set of qualifying questions asked before routing an inbound lead. It is the word "intake" pointing the other way: at the customer's customer, not at the customer's own team.
- **The nearest internal approval** is a workflow's enrolment approval: "enrolment approval (auto, or Apollo creates **review tasks**)" (16§17). An approval that lands in a task queue with no consequence line beside it.
- **A teammate-to-admin upgrade request is not documented anywhere** in the 286 articles, in any of the three settings-sidebar generations (07), or in the 2024, 2025 and 2026 release notes. Absence of an article is not proof of absence of a control, so this is marked **(unverified)** — but there is nothing to model a "before" on, and the admin-side plan controls that *are* documented (Plan overview, License settings, invite link, default permission profile) contain no queue.

So the before is **no queue**: the request arrives as a Slack message or an email, and the product it is about never learns that it exists.

### 5.2 The documented consequence

| Problem | What the evidence says | Source |
|---|---|---|
| The queue exists; it is just not in the product | A RevOps team spends **11 hours a week** on manual CRM work, of which **ad-hoc report building 2.1** and **permission changes 1.8** — 3.9 hours a week of pure intake (Clientell, Q1 2026, 37 mid-market RevOps teams, 200–2,000 employees) | 19§4.1 |
| It cannot be batched where it lives | "These tasks are **unbatchable**" — "data cleanup is continuous, **report requests arrive daily**, and permission changes happen immediately upon hiring" | 19§4.1 |
| So it arrives as interruption | "**We're constantly getting pulled in a million different directions in RevOps across multiple functions**" | 19§7 |
| The duty is in the job description and not in the product | "**Be the front door for new requests** by gathering requirements, scoping complexity, and routing work to the right owner" (JD-2); "Manage GTM systems **request intake queue: triage, scope, estimate**" (JD-3); "Manage **intake of cases** from the GTM organization following **Rules of Engagement** policies" (JD-4) — three of six live 2025–26 postings | 19 JD-2, JD-3, JD-4 |
| Nobody writes down what the person should be able to do afterwards | "**Capture the request before estimating it.** Requested outcome. Explain what someone should be able to do after the change" | 19§8.2 |
| Nobody owns the decision | "**Identify stakeholders by the decision they own**" | 19§8.2 |
| One approval does the work of two | "**Separate approval to investigate from approval to implement**" | 19§8.2 |
| The nine-field audit record has nowhere to live | "A practical record includes the request, reason, affected HubSpot setup, approved baseline, impact estimate, decision owner, decision date, implementation evidence and final test result" | 19§8.2 |
| Nothing tells the people the change happens to | "**The sandbox rehearses the system; nothing rehearses the reps**"; "Deliver the new process to reps in the flow of work from day one" | 19§8.4 |
| Adoption gets measured as attendance | "**Attendance tells you who joined the training. It does not tell you who can complete the work when the instructor leaves**" | 19§8.4 |
| The rollback path is a duty with no field | "Follow release discipline: sandbox-first changes, tested deployments, **documented rollback paths**" | 19 JD-3 |
| And the approval that does exist has no consequence line | Workflow enrolment approval becomes a review task | 16§17 |

The decision this spec answers is the one JOURNEYS.md already recorded as a modelling call: "**The request is an object, because the admin's inbox is the product's real queue.** … A product with nowhere to put the request pushes it into Slack, where it cannot be counted" (JOURNEYS.md §2, decision 4).

### 5.3 What the field gets right, and Ollopa keeps

Nothing is copied from Apollo, because there is nothing there. What is copied is the practice the research documents:

- **"Intake through one door"**, and **"Decide within the SLA"** — two of the deal desk's eight published steps, with the published targets: standard "same or next business day", complex multi-approver "2–3 business days with active shepherding", DealHub tiering 24h / 48h / 72h (18, deal desk). Ollopa's answer target is two business days to an answer.
- **The two approvals**, and the nine-field record, from 19§8.2, kept whole rather than sampled.
- **"Deploy in smaller, safer batches rather than all at once"** (19§8.3), kept as the "applies to" scope — because the sandbox the same section describes is a second copy of the workspace and Ollopa does not have one. The loss is recorded rather than invented (IA-MAP 6.2).
- **"Measure adherence as the success metric"** (19§8.4), kept as the verify count.

## 6. After: the disclosed version

### 6.1 Level one and level two

| Role at business | Level one | Level two |
|---|---|---|
| Meridian admin | The queue with waiting, affects, touches, owner and state; the "9 waiting · 3 past two business days" line; the state chips; the ask with its reason and origin; both approvals with their dates; who will see it and the count; the scope; the rollback path | "The discussion · 6 notes"; "Implementation evidence and the test result"; "Full history · 14"; "Additional filters (5)"; the column chooser |
| Halyard admin | The same, plus the Cost column, and both approvals read daily | The same |
| Ridgeline admin | The queue, the waiting line, the state, the ask; the decision-critical rows | The same |
| Fathom admin | The queue reached from the Settings strip line, with two rows: the feature, the plan, the monthly total, the new total for the period, and what is still possible without it | The same, plus "Add to sidebar" in the header |
| Every other seat | The no-access page naming the admin, and the answer to their own ask where they made it | None |

### 6.2 Every door

| Label as shown | Container | Why |
|---|---|---|
| "The discussion · 6 notes" | Expand in place at the foot of the record | Long, chronological, and read after the decision rather than beside it |
| "Implementation evidence and the test result" | Expand in place | Written once, read when somebody asks how it was tested |
| "Full history · 14 changes" | Expand in place | The record template's own door for long rarely-needed content |
| "Additional filters: requester, decision owner, what it touches, kind, archived (5)" | Expand in place, in the filter row | The filters under 20% for this seat at every business |
| "Columns: 9 of 14" | Popover | Small and interactive |
| "Filters: requester, decision owner, what it touches, kind, archived" (phone) | Sheet | The same values as desktop |

No door holds a waiting time, a cost, an affected count, an approval, a rollback path or a reason. The three record doors are siblings and none contains another, so no path on this page reaches three.

### 6.3 Persistence

Sort, filters, saved view, columns and the open state of each of the three doors persist per user per workspace and sit in the URL, so a link to "this request's implementation evidence" reproduces the view with that door open. Which state chip was last selected persists. Nothing about the request itself is remembered per reader: the state is the object's.

### 6.4 Accelerators

`g q` opens Requests. `e` toggles the discussion. The three counts in the header line are links into the groups they name. "Approve 4 to investigate" acts on a whole group. The **origin link** is the accelerator that matters most: from the request, one click lands on the exact control the person could not use, which is how an admin answers a request without asking what it was about. And every request's "what it touches" row opens the setting itself, so the queue is a set of deep links into the work rather than a description of it.

### 6.5 Decision-critical

Thirteen items (§4). The rule 7 test: without clicking anything, can the reader find who is waiting, how long, what a decision will change for other people, how many people that is, what it will cost, and how to undo it? Yes — the waiting line and the state chips are above the table, waiting, affects and cost are columns, and the affected count, the scope, the rollback path and both approvals are blocks at the top of the record. The **decline** is the same size as the approve, because the path to refuse is no longer than the path to agree.

### 6.6 Removed rather than hidden

A **priority field** (the waiting time and the affected count already rank the queue, and a priority picker is where a requester's urgency and an admin's judgement argue in a column that means neither). A **percentage or progress ring** on the state. A **bulk approve to implement**. **Auto-close** for unanswered requests. A **second upgrade-requests queue** in Settings — the Plan strip keeps the line, the count and the cost and links here (spec 14 §3.3). A **requester-facing portal**: the answer goes back where the ask was made. A **sandbox, a change set and a diff**, recorded as a known reduction with staged rollout in their place (IA-MAP 6.2). And **routing exceptions**, which are about records and stay on Workflows where the rule is one click away (IA-MAP 6.4c).

### 6.7 The nine-point score

| # | Question | Score | Line |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | Waiting, affects and cost are columns; the answer-target line is above the table; the affected count, the scope, the rollback path, the two dated approvals and the decline are at the top of the record, on every plan |
| 2 | Every visible item backed by a sourced number | 2 | Fifty-five items in `requests.ts`; four pairs shape-checked with a stated denominator, and the one pair with no head explained rather than smoothed |
| 3 | No path exceeds two levels on any screen size | 2 | Page → record (navigation, no level) → one of three sibling doors; the phone sheet is the same one level |
| 4 | Doors labelled by content, chevron and text | 2 | Every door names its contents and its count; the Cost column and the upgrade rows are removed where the kind cannot occur, never shown empty |
| 5 | Doors adjacent, keyboard and touch | 2 | Each door sits under the section it reports on; `e` toggles the discussion; every count is a link with a real target; no shortcut approves |
| 6 | No dependent information split across a door | 2 | The consequence with the approval; the count with the sentence that produced it; the baseline with what replaces it; the rollback with the change; the scope with the affected count |
| 7 | State persists; expand all and print | 2 | Sort, view, columns and all three door states per user and in the URL; print expands the discussion and the evidence, because a request is an audit record |
| 8 | User action or object state, never inferred history | 2 | The queue's order comes from the raised date and the answer target, not from what the admin opened last week. Nothing moves when a request ages: it sorts by a fact |
| 9 | Instrumented; promote, keep or delete review | 1 | Door opens, decline rate, the share of requests answered inside two business days, and the share of shipped changes whose verify count stays at zero are counted per business. Review scheduled; one point withheld until it has run |

**17 of 18.**

## 7. Lesson steps

Not a lesson. The four rules that mattered most:

- **Rule 1, applied to an absence.** The most-used queue in the admin's week was measured at 3.9 hours (19§4.1) and had no page at all. Hiding is not the only failure: a thing with no home is hidden everywhere at once, and it cannot be counted, promoted or deleted.
- **Rule 7, applied to somebody else's week and somebody else's money.** Waiting time, the affected count and the monthly total are columns, not fields inside a record. The approver of an upgrade is making a price decision; the approver of a required field is spending 34 people's attention. Both totals are on the row.
- **Rule 7's corollary, applied to a queue.** Approval to investigate batches because it changes nothing; approval to implement never does, because 88.5% seen and 23.9% stopped is what a batch button over other people's work produces. Separating the two approvals — which 19§8.2 asks for on process grounds — turns out to be the disclosure answer too.
- **Rule 4 and rule 8 together.** Where the upgrade kind cannot occur, its rows and its column are removed, not greyed and not shown empty — and the one business with no intake process at all has no head on this page. A page is allowed to be almost entirely tail for one customer; what is not allowed is pretending otherwise.

## 8. Review

| Check | Gap found | Closed by |
|---|---|---|
| All roles covered | Only the admin holds the page, and the first draft left the other four seats with nothing | §3.6's no-access state and §3.8: the requester meets this object twice, at the ask and at the answer, and the answer travels to them |
| All four businesses covered | Meridian has no upgrade requests and Fathom has almost nothing else | Both stated: the upgrade rows and the Cost column are removed at Meridian; Fathom's row is a no-head page reached from the Settings strip line |
| Every field has a source | `requests[]`, the answer target and the verify count were in no seed | §2 lists them with types; `requests[].announcement` is written here and rendered by specs 00 and 01 |
| Every action has an outcome | Approve, decline, widen, ship, verify, merge and archive had none | §3.4, each with what changes and what is kept |
| Empty, error, no-access | The empty state offered "Create a request", which nobody would ever use | Requests are raised where the problem was met; the empty state says so and offers nothing |
| Keyboard | An early draft gave approve a shortcut | No shortcut approves anything, for the reason no palette command does |
| Phone width | The three doors were drafted as a tab strip | Cards and stacked sections; the doors expand in place; filters in a sheet |
| Decision-critical visible | The rollback path and the affected count were inside the implementation-evidence door | Both are in "What it changes" at the top of the record, and the affected count is a column |
| Two levels maximum | The discussion was drafted inside the history door | Three sibling doors, none inside another |
| Doors labelled by content | "Details" | "The discussion · 6 notes", "Implementation evidence and the test result", "Full history · 14 changes" |
| Dependent fields together | The consequence lived in the confirmation only, and the baseline sat in a door away from what replaced it | The consequence is in the label and the confirmation; baseline and change are one section |
| State persists | A link to a request's evidence opened the record with every door closed | Door state per user and in the URL |
| Accelerators present | None | `g q`, `e`, the three deep-linked counts, "Approve n to investigate", and the origin link |
| Usage shape checked | The first numbers put twenty-three of fifty-five items in Meridian's head | Rewritten against what is read on every visit versus what is read on every shipped request; the tail was lengthened with the controls a real intake queue accumulates rather than by trimming the head alone. The body's two-to-three-point overshoot is named |
| Nothing hover-only | The affected count was a tooltip on the Affects column | A number in the column and a sentence on the record saying how it was counted |
| Role gaps explain themselves | A non-admin following a deep link hit a bare no-access page | The no-access page names the admin who decides and says where the answer to their own ask will appear |
| No usage numbers or teaching text | The answer-target line read like a target being set | It states the promise and what is past it. No advice, no tip, no score |
