# Tasks

*A real page built from the table template. Calls, LinkedIn steps, emails and follow-ups that are due, from sequences and by hand. Done, snooze, skip. A "work the queue" mode that walks task by task.*

## 1. Purpose

Tasks is where an SDR spends the middle of every day. A sequence sends its automatic emails on its own; every call, LinkedIn step, manual email and follow-up lands here as a task with a due date. The page answers one question: what do I do next, and what is overdue?

| Role | How often | What they do here |
|---|---|---|
| SDR | All day | Work the queue: call, connect, write, mark done, snooze, skip |
| Account executive | Daily, briefly | Follow-ups on open deals; creates manual tasks after calls |
| Customer success | Weekly (daily at Ridgeline) | Renewal and expansion follow-ups |
| RevOps admin | Weekly | Sees the team's queue, reassigns when someone leaves; at Fathom and Halyard the admin seat works tasks as well |
| Marketer | Never | No access to the area; the page names who works tasks and who to ask |

Tasks is an area the seat carries: SDR, account executive, customer success and the RevOps admin have it, the marketer does not. Where it sits in the sidebar is a second question, answered by the workspace profile declared at set-up, never inferred from behaviour (RULES.md, the declared sidebar). Fathom's profile is Founder-led outbound and Halyard's is Agency, so Tasks is in the admin seat's sidebar at both and those admins work the queue like an SDR. Where a profile leaves Tasks out, the page still opens by deep link and ⌘K and its header offers "Add to sidebar"; and when a sequence first assigns a task to someone whose profile left it out, the page appears in their sidebar for two weeks and then asks "keep it?".

The page opens in **queue mode** for the SDR and the account executive, and on the list for customer success and the RevOps admin. That is the S1 walk decision of 15 September 2026: the two seats whose day is the queue should not have to press a button to start it, and the two seats who come here to look something up should not be put inside a queue they did not ask for. The switch between the two is labelled and sits in the header; it replaces the body rather than nesting inside it, so the list's doors stay at level two.

The one thing nobody may lose sight of: an overdue sequence task means a contact is stuck at that step. The sequence waits. The page says so on every such row and in the header.

## 2. Data

The seed has `Task { id, kind: Call | LinkedIn | Email | Follow-up, contact, company, due, sequence | null }`, 24 per business, all due within four days. **Add** `Meeting` to `kind`: a booked kickoff, a discovery call or a business review is a task that is due, it appears in the Type filter, and its row action opens the meeting panel. Additions are marked **add**.

| Field shown | Source |
|---|---|
| Due | `task.due`, shown relative ("Overdue 2d", "Today", "Thu 17"). **Change** the seed range to −4 to +6 days so overdue rows exist |
| Type | `task.kind` |
| Contact, title, company | `task.contact`, `task.company`, title from `Contact`. **Add** `task.contactId` so the row joins to the record instead of matching on name |
| What to do | **Add** `task.step: { n, of, title } \| null` ("Step 3 of 5 · call after two opened emails") and `task.title` for manual tasks |
| From | `task.sequence`; **add** `task.createdBy: "sequence" \| "manual" \| "agent"` and `task.creator` |
| Owner | **Add** `task.owner`, a user from `businesses.roles` |
| Status, outcome | **Add** `task.status: Open \| Snoozed \| Done \| Skipped`, `snoozedUntil`, `doneAt`, `outcome` (Connected, Voicemail, No answer, Wrong number) |
| The logged call | **Add** `Call { id, taskId, contactId, dealId?, purpose, disposition, startedAt, durationSec, notes, loggedBy, transcript? }`. `disposition` is one of Connected · Connected, not interested · Left voicemail · No answer · Busy · Gatekeeper · Wrong number · Bad number · Callback booked. A call is not a task: the task is the intention, the call is what happened, and a task can hold more than one |
| The coaching note | **Add** `CoachingNote { id, callId, author, at, wentWell, toChange, oneBehaviour, state: "suggested" \| "edited" \| "accepted" }`. Written on a call by a manager, visible to the rep |
| Do-not-call | `Contact.doNotCall: boolean` with `doNotCallSource` and `checkedOn`, read from the Prospecting rules in Settings. **Add** to the seed: two flagged contacts per business with a call task |
| The LinkedIn message | **Add** `task.message` for LinkedIn tasks, the text written once on the sequence step (spec 05) and rendered here, plus `task.messageEdited` when a person personalised this send |
| Invites this week | Derived: completed LinkedIn tasks of kind Invite for this person in the current week, against the cap of about 100 |
| Fit or intent score | `Contact.score` and `Contact.scorePrevious` with `scoredAt` and the reason lines, from Settings › Signals, scoring and personas. Present at Ridgeline, absent elsewhere; the chip is removed where the business does not score |
| The meeting | `Meeting { id, taskId, state, attendees[], prepBriefId?, followUpDraft?, transcript? }`, the object specified once in [06 Inbox](06-inbox.md) §3 and rendered here |
| Sequence waiting; header counts | Derived from open tasks and due dates |
| Step history; notes | **Add** `task.history: { step, kind, when, result }[]` and `task.notes: { who, when, text }[]` |
| Contact email, status, phone, local time | `Contact.email`, `emailStatus`, `phone`; **add** `Contact.tz` |

Seed size becomes 40 tasks per business, two of them of kind Meeting. Halyard is heavy on Call and LinkedIn from ten client sequences; Ridgeline is mostly Follow-up and Email from "Renewal 60 days", "Expansion: new seats" or by hand; a third of Fathom's tasks are agent-created; Meridian is the baseline.

## 3. Features

**Shown.** Header "Tasks" with a counts line, "8 due today · 3 overdue · 13 later"; overdue is red above zero, and each count is a button that sets the Due filter.

**The two modes.** For the SDR and the AE the page opens in queue mode and the header carries the switch **"All tasks (24)"**, which replaces the queue body with the list. For customer success and the admin the page opens on the list and the header carries **"Work the queue (11)"**, which replaces the list with the queue. One switch, labelled by what it opens, in the same place in both directions; the choice persists per user per workspace, and the queue always restarts at the first open task because order is the point. Because the switch replaces the body rather than opening inside it, the list's filters and row doors stay at level two in either mode.

Columns on the list: Due, Type, Contact (title and company beneath), What to do, From, Owner (only when the owner filter is not Me), actions. Order: overdue first, then due date oldest first, then type.

- **Contact cell.** Name, title and company. For a call task, the **phone number with its do-not-call badge** and the contact's **local time**, both at level one, at every business: the number is what the task is for, calling a flagged person is a compliance consequence, and calling at the wrong hour wastes the attempt. Neither was ever worth a door.
- **The score chip**, where the business scores contacts: "Fit 82 ▲ from 61", text and an arrow, never colour alone. The row does not move when a score changes — nothing is reordered by a model — and the reason is the first line of the row door, in text, never a hover. Removed entirely where the business does not score.

**Row actions**, visible on hover and keyboard focus and all repeated in the "…" menu with their shortcuts:

| Action | Outcome |
|---|---|
| Done | Status Done. Call tasks first show four outcome buttons inline (Connected, Voicemail, No answer, Wrong number), which write a disposition and are the queue's fast path. A sequence task advances the contact. Toast with Undo, 8 seconds |
| Log the call (Call tasks) | Opens the call panel, below. The four outcome buttons stay; this is the full record |
| Open the LinkedIn step (LinkedIn tasks) | Opens the LinkedIn panel, below |
| Open the meeting (Meeting tasks) | Opens the meeting panel, below. It opens **from the row, never from inside the row door**: a panel inside a door would be a third level |
| Write (Email tasks, in place of Done) | Opens the queue drawer at this task with the compose; "Send and mark done". "Done, sent elsewhere" sits in the menu |
| Snooze | Due becomes tomorrow, status Snoozed, row leaves the open list. On sequence tasks the label reads "Snooze · the sequence waits" |
| Snooze until… (menu) | A date field replaces the Due cell; Enter confirms, Escape cancels |
| Skip · contact moves to next step (menu) | Status Skipped, sequence advances. Manual tasks show plain "Skip" |
| Add note, Edit, Open contact (menu) | Fields open inside the row door; Open contact goes to the contact page |
| Reassign (menu; admin, and everyone at Fathom) | Owner picker inline; the toast names the new owner |
| Delete (menu; manual tasks only; destructive, below a divider) | Removed, Undo in the toast |

**The call panel (`X-calllog`).** One node with four parents: a task row, the queue body, the contact record and the deal record. Flat: no doors inside it. It has **two modes, read and log** — the owner logs the call, and anyone who can see the record reads it, which is how a manager coaches without a second surface. The log mode holds:

- **Purpose**, chosen or typed, prefilled from the sequence step where there is one.
- **Disposition**: Connected · Connected, not interested · Left voicemail · No answer · Busy · Gatekeeper · Wrong number · Bad number · Callback booked.
- **Duration**, a timer that starts with the panel and can be corrected by hand.
- **Notes**, free text.

Above the disposition, always visible and never behind anything: *"Connected and Connected, not interested stop this sequence for Amara. The others let it continue."* The consequence sits with the control that causes it (rules 5 and 7).

Where an integration supplied a transcript, the transcript is a block in the panel. Where none did, the block is **removed, never disabled** (rule 4).

**The coaching note**, inside the call, not beside it. Three fixed headings — what went well, what to change, one behaviour for next week — with the author and a timestamp, visible to the rep. Where a drafting agent offers answers they sit in the same block with a state chip, suggested → edited → accepted, and **nothing is published to the rep until a person accepts it**. A saved note reaches the rep on Home and in the daily digest; it is not a bell kind, because feedback is not an interruption.

**The LinkedIn panel (`X-linkedin`).** Opened from a LinkedIn task row and from the queue body. Flat. It holds the **message text**, written once on the sequence step and rendered here; editing it here changes this send only, and "Personalise for Amara" leaves the step's copy alone. Then **Copy message**, **Open the profile**, and **Mark complete** under one line:

> "Ollopa cannot see LinkedIn. Marking complete records that you sent it and advances the sequence."

Above them, in the panel and in the queue header: **"Invites this week: 38 of about 100"**, counted from completed LinkedIn invite tasks, with the line "the cap is LinkedIn's, not Ollopa's". Within ten of the cap a visible control appears, "Snooze the rest to Monday". A cap that is invisible until it is hit is a limit hidden from the person who will be punished by it (rule 7).

**The meeting panel (`X-meeting`).** Specified once in [06 Inbox](06-inbox.md) §3, "Book and run the meeting", and rendered here unchanged: state, times, attendees, the prep brief, the summary and action items with one "Create n tasks", the follow-up draft, the transcript where an integration supplied one, and the hand-off block where an AE seat exists. It opens from the meeting task row and from the queue body, never from inside the row door.

**Bulk.** Selecting rows swaps the toolbar for "3 selected · Done · Snooze · Skip · Reassign (admin) · Clear". It exists only while rows are selected.

**Page actions.** New task opens a drawer: Contact (search), Type, Due (Today, Tomorrow, a date), Title, Note, Owner (admin). Work the queue is in section 6. Export CSV and column visibility sit in a door "Table options: columns, export".

**Filters and search.** The shared table behaviours — sortable headers, the bulk bar, skeleton loading, row actions on focus as well as hover — are specified once in [02 People](02-people.md); this spec records only its deltas. Search matches contact, company, title and sequence. Filters: Type (Call, LinkedIn, Email, Follow-up, **Meeting**), Due (Overdue, Today, This week, All open), Source (each sequence, Manual, Agent), Owner (Me, each user, Everyone), Status (Open, Snoozed, Done, Skipped), Sort (Due, Type, Contact). Which sit at level one varies by role and business (section 6); the rest share one door labelled with its contents and the count of active ones, **"Additional filters: source, status, sort (n)"**. The word "More" says nothing about what is behind it and is not used anywhere in the product (PLAN.md, door labels, 14 September 2026).

**Row door.** A chevron with the text "History and contact" at the end of the What to do cell, expanding in place. Where the business scores contacts, its **first line is the reason for the score in words** — "Fit 82: enterprise SaaS, 400 seats, VP Engineering, opened 3 emails" — so the number on the row and the reason behind it are never more than one click apart and the reason is never a hover. Then: previous steps with dates and results, the contact's email and status, last activity, notes and the note field. The phone, its do-not-call badge and the local time have left the door for the row. Open state persists per task per user. "Expand all" and "Collapse all" sit above the column. Print expands every row.

**States.**

| State | Shown |
|---|---|
| No tasks, role gets tasks | "Nothing due. Tasks arrive from sequences you own and from deals and accounts assigned to you." plus New task |
| No access, marketer | The shell's no-access page: "Tasks is worked by SDRs, account executives, customer success and the RevOps admin. At Meridian Software that is Marcus Adeyemi, Elena Vasquez, Aisha Rahman and Daniel Okafor. Daniel Okafor can change who has access." No empty table and no New task button: the area is not the marketer's |
| Everything done | "Done for today. 4 due tomorrow." linking to Due: This week |
| Filter matches nothing | "Nothing matches. Clear the search or a filter." (template) |
| Loading; error | Five skeleton rows, counts "—"; "Tasks did not load." with Retry, filters kept |
| No team view (SDR, AE, CS) | Owner filter and Reassign absent. The description line reads "Your tasks. Daniel Okafor (RevOps admin) can see and reassign everyone's." |

**Keyboard.** `J`/`K` move row focus, `Enter` toggles the row door, `D` done, `S` snooze, `X` skip, `E` write, `L` log the call, `N` new task, `W` switches between the queue and the list in either direction, `/` search, `?` shortcut list, `Esc` closes. Letters are inert inside fields. The "…" menu opens on `Enter` and is arrow-navigable.

**Accessibility.** Row action buttons stay in the DOM and show on `:focus-within`. The row door is a `button` with `aria-expanded` and `aria-controls`. Inline fields and the queue dialog take focus and return it to the row. A live region announces "Marked done. 10 left." Reduced motion swaps slide for crossfade. The overdue red passes 4.5:1.

**Phone width.** Rows become cards: due and type, then contact, then what to do. Done and "…" are always visible. The row door still expands in place. Filters collapse into one door, "Filters: due, type, owner", with the active count. The queue is full screen with Done, Snooze and Skip fixed at the bottom, and the mode switch is the header's only other control. The call, LinkedIn and meeting panels become full-screen pages with a back arrow that returns to the same row. Nothing is deeper than on desktop.

**By role and business.** The split is in section 6. In short: the marketer gets the no-access page; admins open on Everyone when they have no open task of their own, otherwise on Me, decided by object state; at Fathom everyone has the Owner filter; Halyard puts local time under Due; Ridgeline keeps Skip in the menu because renewal sequences exist.

## 4. Usage items

Weekly use per role, share of active users touching the item, baseline Meridian, per USAGE-MODEL.md. Code: `src/ollopa/usage/tasks.ts`. The marketer has no access, so the seat carries no number at all; `weeklyUse` also returns zero for a seat a business has not declared (`SEATS` in `usage/model.ts`), so Fathom's and Halyard's absent seats never compute a first screen. Overrides: F Fathom, H Halyard, R Ridgeline.

Two marks changed in this pass. The task rows are the page's own content, head by usage at 95% for the SDR, so they are no longer marked decision-critical; rule 7 covers price, commitment, destructive consequences and safety state, not a page's body. The due-today and overdue counts keep the mark, and the argument is stated once here: an overdue sequence task means a contact is stuck at that step and the sequence is waiting, which is the safety state of this page. Delete a manual task gains the mark, because every other destructive action in the product carries it.

| Item | SDR | AE | CS | Adm | Overrides |
|---|---|---|---|---|---|
| Task rows: due, type, contact, what to do, from | 95 | 55 | 20 | 20 | F adm 90; H adm 45; R sdr 45, ae 40, cs 40, adm 10 |
| Due today and overdue counts **(critical)** | 95 | 50 | 20 | 25 | F adm 90; H adm 55; R sdr 45, ae 35, cs 40 |
| Owner column | 0 | 0 | 0 | 20 | F adm 60, sdr 30; H adm 50; R adm 8 |
| Fit or intent score with its previous value | 0 | 0 | 0 | 0 | R sdr 35, ae 15 (the only business that scores; removed elsewhere) |
| Phone with its do-not-call badge **(critical)** | 60 | 20 | 6 | 0 | F adm 55; H sdr 70; R sdr 12, ae 8 |
| Row door: step history and contact details | 55 | 25 | 12 | 5 | R sdr 25, cs 30 |
| Contact local time | 15 | 8 | 4 | 0 | H sdr 40; R sdr 3 |
| Done | 95 | 55 | 20 | 15 | F adm 85; H adm 30; R sdr 45, ae 40, cs 40, adm 6 |
| Call outcome on done | 50 | 20 | 6 | 5 | F adm 45; R sdr 12, ae 10, cs 10 |
| Snooze to tomorrow | 65 | 35 | 12 | 8 | F adm 60; H sdr 70; R sdr 25, ae 25, cs 25 |
| Snooze until a chosen date | 15 | 12 | 8 | 3 | R ae 15, cs 20 |
| Skip: the contact moves to the next step **(critical)** | 35 | 10 | 3 | 4 | F adm 30; R sdr 8 |
| Write the email | 70 | 25 | 12 | 5 | F adm 65; R sdr 30, ae 20, cs 30 |
| Open contact | 18 | 30 | 15 | 5 | R cs 30 |
| New task | 25 | 30 | 15 | 6 | F adm 30; R sdr 15, ae 35, cs 35 |
| Add a note to a task | 15 | 20 | 10 | 2 | R cs 25 |
| Change due date, type or title | 8 | 12 | 5 | 3 | |
| Reassign | 0 | 0 | 0 | 12 | F adm 8; H adm 35; R adm 4 |
| Delete a manual task **(critical)** | 4 | 5 | 2 | 3 | |
| Work the queue | 85 | 15 | 5 | 5 | F adm 75; H sdr 90; R sdr 30, ae 8, cs 10, adm 2 |
| Switch between the queue and "All tasks (n)" | 45 | 35 | 25 | 30 | F adm 50; H sdr 55, adm 45; R sdr 30, ae 30, cs 35, adm 15 |
| Sort the queue by call score | 20 | 5 | 0 | 0 | F adm 15; H sdr 25; R sdr 8 |
| Keyboard shortcuts in the queue | 30 | 5 | 1 | 1 | H sdr 50; R sdr 8 |
| Disposition, with what each one does to the sequence **(critical)** | 90 | 35 | 8 | 8 | F adm 80; H sdr 92; R sdr 12, ae 15, cs 10 |
| Call notes | 70 | 30 | 12 | 0 | F adm 65; H sdr 75; R sdr 12, ae 15, cs 15 |
| Call purpose | 55 | 20 | 0 | 0 | F adm 50; H sdr 60; R sdr 10, ae 10 |
| Duration timer, correctable | 40 | 15 | 0 | 0 | F adm 35; H sdr 45; R sdr 6, ae 8 |
| Read a logged call someone else made | 8 | 12 (AE+ 70) | 10 | 4 | F adm 15; H adm 25; R cs 15 |
| Coaching note: went well, to change, one behaviour | 12 | 4 (AE+ 60) | 0 | 2 | H adm 20, sdr 18; R sdr 4 |
| Transcript, where an integration supplied one | 6 | 10 (AE+ 35) | 6 | 0 | F 0; H sdr 0; R ae 12, cs 8 |
| The LinkedIn message, editable for this send | 55 | 8 | 0 | 0 | F adm 40; H sdr 60; R sdr 8 |
| Copy message and open the profile | 55 | 8 | 0 | 0 | F adm 40; H sdr 60; R sdr 8 |
| Invites this week, against about 100 **(critical)** | 25 | 3 | 0 | 0 | F adm 18; H sdr 40; R sdr 4 |
| Search | 15 | 10 | 6 | 15 | H sdr 18, adm 30 |
| Filter by type | 30 | 10 | 4 | 8 | H sdr 40; R sdr 8 |
| Filter by due | 25 | 15 | 8 | 15 | H adm 30 |
| Filter by source | 12 | 4 | 2 | 8 | H sdr 25; R sdr 2 |
| Filter by owner | 0 | 0 | 0 | 25 | F adm 50, sdr 20; H adm 55; R adm 10 |
| Filter by status | 10 | 8 | 4 | 15 | H adm 30 |
| Sort by due, type or contact | 6 | 4 | 2 | 5 | |
| Bulk done | 12 | 4 | 1 | 3 | H sdr 18 |
| Bulk snooze | 10 | 4 | 1 | 3 | H sdr 18 |
| Bulk skip | 6 | 2 | 0.5 | 3 | H sdr 12 |
| Bulk reassign | 0 | 0 | 0 | 5 | H adm 25 |
| Export CSV | 1 | 1 | 1 | 3 | H adm 10 |
| Show or hide columns | 3 | 2 | 1 | 2 | |
| Expand all row details | 5 | 3 | 2 | 2 | |
| Shortcut list | 4 | 2 | 1 | 1 | |

**Shape check**, 48 items, head 20 and above, body 5 to 20, tail under 5:

| Pair | Head | Body | Tail |
|---|---|---|---|
| Meridian, AE | 15 (31%) | 17 (35%) | 16 (33%) |
| Halyard, admin | 13 (27%) | 12 (25%) | 23 (48%) |
| Ridgeline, CS | 11 (23%) | 10 (21%) | 27 (56%) |
| Meridian, SDR | 23 (48%) | 16 (33%) | 9 (19%) |
| Halyard, SDR | 25 (52%) | 13 (27%) | 10 (21%) |

Ridgeline's CS is now inside the band at 23%; the other four are not. The Meridian SDR reaches 48% and Halyard's 52%, and the page grew by fourteen items in this pass — the call with its disposition, purpose, duration and notes, the coaching note and the transcript, the LinkedIn message with its copy control and the invite counter, the do-not-call badge, the score chip, the mode switch and the score sort. Twelve of the fourteen are the SDR's daily work, so they land in the head and the head widens.

Two things follow, and both are stated rather than hidden.

First, this is the density case PLAN.md accepts: Tasks for a high-volume SDR seat is an operate-all-day screen for one role, and an all-day screen is where density beats disclosure (PRODUCT.md: "they live in one screen all day, so doors cost them the most"). It is an argument, not a measurement. There is no head-to-head test of density against disclosure on a professional tool with its own all-day users ([11 What changed](../knowledge-base/11-what-changed-2018-2026.md), "What nobody re-ran"), so point 2 of the score stays a 1, not a 2.

Second, the page did not get deeper when it got denser. None of the fourteen items sits behind a new door: the call, the LinkedIn step and the meeting are each one flat panel opened from a row or from the queue body, and the phone and its flag moved **out** of the row door onto the row. The honest summary is that this is a wide page with two levels, not a deep one.

Every level-one decision in section 6 follows from this table through `levelOf`.

## 5. Before: the common version

Modelled on Apollo's Tasks page, from the knowledge base articles "Tasks Overview" (updated 31 Jul 2026), "Create a Task" (9 Sep 2026) and "Organize and Complete Tasks" (12 Sep 2026) and the screenshots inside them, read 13 Sep 2026. Those three article titles and their dates are the whole source for this section; the screenshots are not separately linkable, so every layout detail below that is not a direct quotation is a description of them and cannot be checked against a URL.

**Where it is.** Main nav, group "Tools & automations", item "Tasks" (knowledge-base/sources/07-apollo-settings-map.md §6). Home has a Tasks widget with "View all tasks" ("Home Overview").

**Layout.** Title "Tasks"; top right a yellow "Create task" and, in one screenshot, "Start call session". A tab row: "All tasks 62 · Call tasks 23 · Email tasks 17 · LinkedIn tasks 22 · Overdue tasks · Recommended ✦AI · All your tasks ▾" (a Views menu). A toolbar: "Show Filters 1", "Search tasks", "Save as new view", "Sort 1 ▾", "View options" (a right drawer: Layout, Group By, Fields 7, Filters). A left rail of 38 filter accordions, from "Task Status" to "Funding", "Retail locations" and "Job postings", plus "Playbook: This filter has been deprecated". Columns: Task (checkbox, type icon, title, a bulb badge with a number, sometimes a moon icon), Associated with (name, title, a red "!" on some rows), Company, Source ("Created by Tina B", "Workflow", a sequence name or "-"), Actions (icon-only: envelope, tick, phone, play, archive). Pagination "1 - 50 of 62". Selecting a row swaps the toolbar for "Clear 1 selected · Call · Mark as complete · Set due date · Reassign · Set priority · Export · Archive". Clicking a task opens a wide drawer: title, "Medium", "Jan 23", assignee; "Mark as complete · Archive · Task actions ▾ · ☆"; "Task 5 of 20" with arrows; a composer on the left and the contact record on the right.

**Documented problems.**

1. The grid is busy. "The grid for making calls and completing tasks is a bit messy. There's a lot of information there" (G2 reviewer quoted by Warmly's review; secondary). A bulb badge, a moon icon, a red "!" and five unlabelled icons per row; what the moon and the "!" mean is not in the articles (unverified).
2. Due date and priority are not visible columns in any of the six screenshots, although the default sort is "Due date" and priority is a filter and a bulk action; both show only in the drawer header. Whether they sit among the "7 fields" off to the right is unverified. Rules 1 and 7: the field the sort is by, and the state that says a contact is stuck, are hidden.
3. Delete is archive is skip. "How do I delete a task? To delete or skip a task, you need to archive it" and "Apollo may label the same skip action Archive task or Skip task, depending on the task view" (Tasks Overview). Rule 4: the label does not say what happens to the contact.
4. "Recommended" is an AI ordering: "To see why a task was recommended, hover over Recommendation" (Organize and Complete Tasks). Hover-only, so no keyboard or touch route (rule 4, WCAG 1.4.13), and an inferred ranking rather than a stable order (rule 6). The tab appears only "after you have more than 30 assigned tasks".
5. Three routes to the same subset: the type tabs, the Views menu, and the Task type filter with eleven values including "Workflow - Pending Approvals" and four "LI:" variants.
6. Three levels are routine: Tasks › Show filters › Task type › value; Tasks › View options › Fields › toggle; Tasks › drawer › Task actions › Reassign (rule 2). Call tasks triggered by email opens are set up in Settings › Team email & sequences › Sequences › Sequence rulesets, four deep ("Create a Task").
7. Thirty-eight filters, most firmographic, on a page about today's work, one deprecated yet still listed. Rule 8: nothing gets deleted.
8. Labels drift: "All tasks" versus "All your tasks"; "Show Filters", "Filters" and "Hide Filters" for one button. Multi-level sort shipped in 2026 ("Release Notes 2026") while a due-date column still is not shown.
9. Plan gating: "free plans don't include dialer or call tasks" (Organize and Complete Tasks): a task type that does not deliver.
10. A stuck contact is invisible on the row: "Apollo auto-skips it after a configured auto-skip window" (Tasks Overview), configured elsewhere.
11. No snooze; rescheduling is "Set due date" with a date picker. A quick "tomorrow" is unverified.

Kept because it is good: "Task 5 of 20" with arrows in the drawer, bulk actions only on selection, a Source column.

## 6. After: the disclosed version

**Layout.** One page, two bodies. The header carries the counts, the mode switch — "All tasks (24)" in queue mode, "Work the queue (11)" on the list — and "New task". The queue body is the default for the SDR and AE seats; the list body is the default for customer success and the admin. On the list: one toolbar with search, the level-one filters for this role and business, one door for the rest, "Expand all" and "Table options: columns, export", then the table. No tab row, no left rail, no views, no group by.

The switch is a switch, not a door: it replaces the body in place and carries the count of what it opens, so a person always knows what is on the other side of it and never lands inside something they did not choose. Because it replaces rather than nests, the list's filter door and row doors are still level two and the queue's panels are still level two.

**Level one and level two, per role at Meridian.** SDR: the queue as the opening body, counts, rows, the phone with its do-not-call badge and the contact's local time, Done, Snooze, Write, Skip with its consequence, New task, the mode switch, shortcuts on labels, Type and Due filters and the row door at level one; Source, Status and Sort in "Additional filters", note, edit, delete, snooze until and open contact in "…", columns and export in "Table options". The call panel, the LinkedIn panel and the meeting panel are level two, opened from a row or rendered as the queue's body. AE: the queue as the opening body, counts, rows, Done, Snooze, Write, Skip, New task, Open contact and Add note at level one; all filters in the door. An AE with reports also reads logged calls and writes coaching notes, both inside the call panel. CS: the list as the opening body, counts, rows, Done, Skip, the mode switch; everything else in doors. Admin: the list, counts, rows, Owner column and filter, Skip, the mode switch; Reassign and the Status and Due filters in doors; the page opens on Everyone. Marketer: the no-access page naming the four seats that work tasks and the admin who can change access.

**Across the four businesses.** Fathom: the founder's admin seat gets the SDR's level one plus Owner filter and column, and opens on the list, because the seat is admin even where the day looks like an SDR's; a third of rows say "From: Research agent"; there is no call transcript, so that block is removed. Meridian: the baseline. Halyard: local time and the do-not-call badge are the busiest items on the page, Source is at level one, the LinkedIn message and the invite counter are daily, and for the admin Reassign, Bulk reassign and Status are at level one; no transcript integration exists, so that block is removed; the page is per workspace and the switcher is a later case. Ridgeline: CS and AE get the AE's level one plus Snooze until a date; Type and Source go into the door for the SDR; the score chip exists only here, and only here does a score reason appear at the top of the row door.

**Doors.** All are level two, and nothing inside them opens further.

| Door | Label | Container |
|---|---|---|
| Row door | "History and contact", chevron and text | Expands in place |
| Row menu | "…", named for what it holds: "Snooze until, note, edit, open contact, reassign, delete"; items carry shortcuts | Flat menu, no submenus |
| Filters | "Additional filters: source, status, sort (n)" — the label lists its contents and the count of active ones (contents vary by role) | Popover |
| Table options | "Table options: columns, export" | Popover |
| New task | "New task" | Drawer |
| The call | "Log the call" from a row; the queue's body when the task is a call | Panel on its own channel, flat: purpose, disposition with its consequence line, duration, notes, the coaching note, the transcript where one exists |
| The LinkedIn step | "Open the LinkedIn step" from a row; the queue's body when the task is a LinkedIn step | Panel on its own channel, flat: the message, Copy, Open the profile, Mark complete, the invite counter |
| The meeting | "Open the meeting" from a row, never from inside the row door | Panel on its own channel, flat; specified in [06 Inbox](06-inbox.md) §3 |

The mode switch is **not** in this table, because it is not a door. It replaces the page's body with the other body and says which one it opens. The queue's body renders the call and LinkedIn panels directly, so working a call block is page → panel → next panel, never page → door → panel.

**Work the queue.** The queue is a body, not a drawer, and it is where the SDR and AE land. It takes the current list in its current order. Header: "Task 3 of 11 · Call · Amara Okonkwo, Northwind Analytics", previous and next. Body: what to do, the step history, the contact essentials with local time, notes and a note field; for Email tasks, the compose with "Send and mark done". Footer: Done (with outcome buttons for calls), "Snooze · the sequence waits", "Skip · contact moves to next step". Each advances to the next task. At the end: "Done for today. 4 due tomorrow." The outcome is a row of buttons, snooze options are buttons, the contact panel is already open, so the queue has no inner door.

The queue header carries two things beyond the position: **"Sort: due · call score"**, and, where the LinkedIn cap applies, the invite counter. Due is the default and stays the default; the score ordering is the scoring agent's, is never applied unless a person chooses it, and carries the line "Ranked by the scoring agent · how it was built" linking to the model in Settings. The choice persists. Nothing is ever reordered on its own (rule 6).

**Persistence.** Filters, sort, the Owner choice, each row door and "Expand all" persist per user per workspace. The queue always starts at the first open task, because order is the point. Undo toasts last 8 seconds.

**Accelerators.** The queue, letter shortcuts printed beside every label, `?` for the list, bulk actions on selection, "Expand all". A daily user reaches every level-one action without a door and every level-two action with one keystroke.

**Decision-critical, always visible.** The overdue count and "sequence waiting" on the row; the consequence written on Skip and on Snooze for sequence tasks; Delete only where it applies, below a divider, with Undo; the do-not-call badge on the number it applies to; the line above the disposition saying which two answers end the sequence; the weekly invite count against LinkedIn's cap; and the line above Mark complete saying that Ollopa cannot see LinkedIn.

**Removed rather than hidden.** Priority (a task is due or it is not); starring; the Recommended ranking; saved views; group by; multi-level sort; the 30 firmographic filters and the deprecated one; the type tabs and Views menu (one Type filter remains); "Archive" (Skip for sequence tasks, Delete for manual ones); auto-skip (an overdue task stays overdue and says so); "Start call session" (no dialer in Ollopa: a call task shows the number, and the call panel takes what happened). A call library is removed too: coaching runs from the logged call and the coaching note inside it, which is the map decision of 15 September, so there is no second place where calls live. Apollo gates call tasks by plan; Ollopa's plan table gates seats, mailboxes, teams and profiles, agents, reports, CRM sync, SSO and the API, and never the day's work, so every task type is on every plan.

**Score.**

1. Decision-critical visible: overdue counts, sequence waiting, Skip and Snooze consequences, Delete with Undo. 2.
2. Every visible item backed by a number: yes, section 4 — but four of the five role-business pairs are above the head band and one reaches 44%, on an argument rather than a measurement. 1.
3. Two levels on every screen size. The mode switch replaces the body rather than nesting, the call, LinkedIn and meeting panels open from a row or are the queue's body and hold no doors, and the phone collapses layout, not availability. 2.
4. Doors labelled by content with chevron and text; "…" is the one conventional ellipsis, labelled for assistive tech. 2.
5. Doors adjacent, all buttons, keyboard and touch; actions show on focus and are always visible on the phone. 2.
6. Dependent information together: due, what to do and sequence waiting on one row; consequence on the control; contact and step history in one door. 2.
7. State persists; expand all and print exist. 2.
8. Disclosure by user action or object state only; no ranking by history. 2.
9. Door open rates are logged and a twice-yearly review is scheduled, but none has happened. 1.

Total 16 of 18.

## 7. Lesson steps

Not a lesson. The rules that mattered most:

- **Rule 1.** Due, what to do and the sequence state are needed on every visit; they are columns, not drawer content.
- **Rule 4.** "Archive" became "Skip · contact moves to next step"; every door label says what is behind it.
- **Rule 6.** A stable order, overdue first then oldest due, replaced an AI "Recommended" ranking explained only on hover. The scoring agent may now offer an order, but only as a named choice a person makes and keeps; a new score changes the chip on the row and never the row's place.
- **Rule 8.** The queue, shortcuts printed on labels and bulk actions let the SDR live here without doors; 30 filters nobody uses on a task page were deleted, not tucked away. The printed shortcut is a floor: hints do not teach (749 tooltip exposures produced two shortcut activations, IHM 2025), while a period of full exposure does (9.79% to 86.20%, holding at 73.09% afterwards). The queue is that exposure here — it puts every action in front of the person who works the page all day.

## 8. Review

| Check | Result |
|---|---|
| All roles covered | Gap: the marketer had an empty table with a New task button, which reads as access. Closed: the marketer has no access to the area and gets the shell's no-access page naming the four seats that work tasks. Gap: an AE with direct reports had no week of her own here; closed with `ae_plus` numbers on reading a logged call, the coaching note and the transcript |
| Sidebar, not role | Gap: the spec gave Fathom's and Halyard's admins tasks by role. Closed: the seat carries the area, the declared workspace profile decides the sidebar, and a page left out still opens and offers "Add to sidebar" |
| All four businesses covered | Gap: Halyard's local time and Source filter were level two by the baseline; closed with overrides |
| Every field has a source | Nine seed additions. Gap: contacts matched by name; closed with `contactId` |
| Every action has an outcome | Section 3, including undo and sequence effects |
| Empty, error, no-access states | Six states; no-access names who can |
| Keyboard | Full set, printed on labels, inert in fields |
| Phone width | Cards, visible actions, one filters door, full-screen queue, same depth |
| Decision-critical visible | Overdue, sequence waiting, Skip and Snooze consequences, Delete. Gap: a call could be placed to a do-not-call contact with the flag inside the row door, and the weekly LinkedIn invite cap was invisible until it was hit; both closed at level one |
| Two levels maximum | Gap: a Snooze submenu would have been a third level; closed with an inline date field. Gap: the meeting, call and LinkedIn panels were nearly opened from inside the row door, which is three levels; closed by opening all three from the row itself and from the queue body, and by making the queue a replaced body rather than a nested drawer |
| Doors labelled by content | All nine, named by contents. Gap: the filter door read "More filters", which names nothing; closed as "Additional filters: source, status, sort (n)" |
| Dependent fields together | Due, what to do, sequence state and consequence on one row |
| State persists | Filters, sort, owner, row doors, expand all |
| Accelerators present | Queue, shortcuts, bulk, expand all |
| Usage shape checked | Five pairs recomputed from `tasks.ts` after fourteen items arrived; Ridgeline's CS is inside the band, the other four are not, and the SDR density case is stated with the reason rather than fitted |
| Nothing hover-only | Actions on focus and in the menu; always visible on the phone |
| Role gaps explain themselves | Marketer no-access page naming the seats and the admin; SDR description line naming the admin who can widen the view |
| No usage numbers or teaching text | Task counts only; numbers live in `tasks.ts` and here |
