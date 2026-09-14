# Tasks

*A real page built from the table template. Calls, LinkedIn steps, emails and follow-ups that are due, from sequences and by hand. Done, snooze, skip. A "work the queue" mode that walks task by task.*

## 1. Purpose

Tasks is where an SDR spends the middle of every day. A sequence sends its automatic emails on its own; every call, LinkedIn step, manual email and follow-up lands here as a task with a due date. The page answers one question: what do I do next, and what is overdue?

| Role | How often | What they do here |
|---|---|---|
| SDR | All day | Work the queue: call, connect, write, mark done, snooze, skip |
| Account executive | Daily, briefly | Follow-ups on open deals; creates manual tasks after calls |
| Customer success | Weekly (daily at Ridgeline) | Renewal and expansion follow-ups |
| RevOps admin | Weekly | Sees the team's queue, reassigns when someone leaves; at Fathom and Halyard, works tasks too |
| Marketer | Almost never | Has no tasks; the page says why and who to ask |

The one thing nobody may lose sight of: an overdue sequence task means a contact is stuck at that step. The sequence waits. The page says so on every such row and in the header.

## 2. Data

The seed has `Task { id, kind: Call | LinkedIn | Email | Follow-up, contact, company, due, sequence | null }`, 24 per business, all due within four days. Additions are marked **add**.

| Field shown | Source |
|---|---|
| Due | `task.due`, shown relative ("Overdue 2d", "Today", "Thu 17"). **Change** the seed range to −4 to +6 days so overdue rows exist |
| Type | `task.kind` |
| Contact, title, company | `task.contact`, `task.company`, title from `Contact`. **Add** `task.contactId` so the row joins to the record instead of matching on name |
| What to do | **Add** `task.step: { n, of, title } \| null` ("Step 3 of 5 · call after two opened emails") and `task.title` for manual tasks |
| From | `task.sequence`; **add** `task.createdBy: "sequence" \| "manual" \| "agent"` and `task.creator` |
| Owner | **Add** `task.owner`, a user from `businesses.roles` |
| Status, outcome | **Add** `task.status: Open \| Snoozed \| Done \| Skipped`, `snoozedUntil`, `doneAt`, `outcome` (Connected, Voicemail, No answer, Wrong number) |
| Sequence waiting; header counts | Derived from open tasks and due dates |
| Step history; notes | **Add** `task.history: { step, kind, when, result }[]` and `task.notes: { who, when, text }[]` |
| Contact email, status, phone, local time | `Contact.email`, `emailStatus`, `phone`; **add** `Contact.tz` |

Seed size becomes 40 tasks per business. Halyard is heavy on Call and LinkedIn from ten client sequences; Ridgeline is mostly Follow-up and Email from "Renewal 60 days", "Expansion: new seats" or by hand; a third of Fathom's tasks are agent-created; Meridian is the baseline.

## 3. Features

**Shown.** Header "Tasks" with a counts line, "8 due today · 3 overdue · 13 later"; overdue is red above zero, and each count is a button that sets the Due filter. Primary button "Work the queue (11)", secondary "New task". Columns: Due, Type, Contact (title and company beneath), What to do, From, Owner (only when the owner filter is not Me), actions. Order: overdue first, then due date oldest first, then type. Contact local time sits under Due at Halyard and inside the row door elsewhere.

**Row actions**, visible on hover and keyboard focus and all repeated in the "…" menu with their shortcuts:

| Action | Outcome |
|---|---|
| Done | Status Done. Call tasks first show four outcome buttons inline (Connected, Voicemail, No answer, Wrong number). A sequence task advances the contact. Toast with Undo, 8 seconds |
| Write (Email tasks, in place of Done) | Opens the queue drawer at this task with the compose; "Send and mark done". "Done, sent elsewhere" sits in the menu |
| Snooze | Due becomes tomorrow, status Snoozed, row leaves the open list. On sequence tasks the label reads "Snooze · the sequence waits" |
| Snooze until… (menu) | A date field replaces the Due cell; Enter confirms, Escape cancels |
| Skip · contact moves to next step (menu) | Status Skipped, sequence advances. Manual tasks show plain "Skip" |
| Add note, Edit, Open contact (menu) | Fields open inside the row door; Open contact goes to the contact page |
| Reassign (menu; admin, and everyone at Fathom) | Owner picker inline; the toast names the new owner |
| Delete (menu; manual tasks only; destructive, below a divider) | Removed, Undo in the toast |

**Bulk.** Selecting rows swaps the toolbar for "3 selected · Done · Snooze · Skip · Reassign (admin) · Clear". It exists only while rows are selected.

**Page actions.** New task opens a drawer: Contact (search), Type, Due (Today, Tomorrow, a date), Title, Note, Owner (admin). Work the queue is in section 6. Export CSV and column visibility sit in a door "Table options: columns, export".

**Filters and search.** Search matches contact, company, title and sequence. Filters: Type, Due (Overdue, Today, This week, All open), Source (each sequence, Manual, Agent), Owner (Me, each user, Everyone), Status (Open, Snoozed, Done, Skipped), Sort (Due, Type, Contact). Which sit at level one varies by role and business (section 6); the rest share one door labelled with its contents, such as "More filters: source, status, sort".

**Row door.** A chevron with the text "History and contact" at the end of the What to do cell, expanding in place: previous steps with dates and results, the contact's email and status, phone, local time, last activity, notes and the note field. Open state persists per task per user. "Expand all" and "Collapse all" sit above the column. Print expands every row.

**States.**

| State | Shown |
|---|---|
| No tasks, role gets tasks | "Nothing due. Tasks arrive from sequences you own and from deals and accounts assigned to you." plus New task |
| No tasks, marketer | "No tasks are assigned to you. Tasks come from sequences and from deals and accounts you own. At Meridian sequences are owned by SDRs; if you should have tasks, ask Daniel Okafor, RevOps admin." Work the queue is absent, not disabled |
| Everything done | "Done for today. 4 due tomorrow." linking to Due: This week |
| Filter matches nothing | "Nothing matches. Clear the search or a filter." (template) |
| Loading; error | Five skeleton rows, counts "—"; "Tasks did not load." with Retry, filters kept |
| No team view (SDR, AE, CS) | Owner filter and Reassign absent. The description line reads "Your tasks. Daniel Okafor (RevOps admin) can see and reassign everyone's." |

**Keyboard.** `J`/`K` move row focus, `Enter` toggles the row door, `D` done, `S` snooze, `X` skip, `E` write, `N` new task, `W` work the queue, `/` search, `?` shortcut list, `Esc` closes. Letters are inert inside fields. The "…" menu opens on `Enter` and is arrow-navigable.

**Accessibility.** Row action buttons stay in the DOM and show on `:focus-within`. The row door is a `button` with `aria-expanded` and `aria-controls`. Inline fields and the queue dialog take focus and return it to the row. A live region announces "Marked done. 10 left." Reduced motion swaps slide for crossfade. The overdue red passes 4.5:1.

**Phone width.** Rows become cards: due and type, then contact, then what to do. Done and "…" are always visible. The row door still expands in place. Filters collapse into one door, "Filters: due, type, owner", with the active count. The queue is full screen with Done, Snooze and Skip fixed at the bottom. Nothing is deeper than on desktop.

**By role and business.** The split is in section 6. In short: the marketer sees the empty state; admins open on Everyone when they have no open task of their own, otherwise on Me, decided by object state; at Fathom everyone has the Owner filter; Halyard puts local time under Due; Ridgeline keeps Skip in the menu because renewal sequences exist.

## 4. Usage items

Weekly use per role, share of active users touching the item, baseline Meridian, per USAGE-MODEL.md. Code: `src/ollopa/usage/tasks.ts`. Marketer is 0 on every item except rows and counts (2) and New task (1): the page is the empty state for that role. Overrides: F Fathom, H Halyard, R Ridgeline.

| Item | SDR | AE | CS | Adm | Overrides |
|---|---|---|---|---|---|
| Task rows: due, type, contact, what to do, from **(critical)** | 95 | 55 | 20 | 20 | F adm 90; H adm 45; R sdr 45, ae 40, cs 40, adm 10 |
| Due today and overdue counts **(critical)** | 95 | 50 | 20 | 25 | F adm 90; H adm 55; R sdr 45, ae 35, cs 40 |
| Owner column | 0 | 0 | 0 | 20 | F adm 60, sdr 30; H adm 50; R adm 8 |
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
| Delete a manual task | 4 | 5 | 2 | 3 | |
| Work the queue | 85 | 15 | 5 | 5 | F adm 75; H sdr 90; R sdr 30, ae 8, cs 10, adm 2 |
| Keyboard shortcuts in the queue | 30 | 5 | 1 | 1 | H sdr 50; R sdr 8 |
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

**Shape check**, 34 items, head 20 and above, body 5 to 20, tail under 5:

| Pair | Head | Body | Tail |
|---|---|---|---|
| Meridian, AE | 10 (29%) | 11 (32%) | 13 (38%) |
| Halyard, admin | 10 (29%) | 11 (32%) | 13 (38%) |
| Ridgeline, CS | 10 (29%) | 5 (15%) | 19 (56%) |
| Meridian, SDR | 13 (38%) | 13 (38%) | 8 (24%) |

Three pairs fit the published shape, with heads a touch above the band. The Meridian SDR head is 38% and Halyard's SDR reaches 44%. That is deliberate: Tasks is an operate-all-day screen for one role, the case where the knowledge base says density beats disclosure (00-core-model.md §8.2; PRODUCT.md: "they live in one screen all day, so doors cost them the most"). Every level-one decision in section 6 follows from this table through `levelOf`.

## 5. Before: the common version

Modelled on Apollo's Tasks page, from the knowledge base articles "Tasks Overview" (updated 31 Jul 2026), "Create a Task" (9 Sep 2026) and "Organize and Complete Tasks" (12 Sep 2026) and the six first-party screenshots inside them, fetched 13 Sep 2026 through the KB's Zendesk API.

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

**Layout.** One page from the table template. Header with counts, "Work the queue", "New task". One toolbar: search, the level-one filters for this role and business, one door for the rest, "Expand all", "Table options: columns, export". The table. No tab row, no left rail, no views, no group by.

**Level one and level two, per role at Meridian.** SDR: counts, rows, Done, Snooze, Write, Skip with its consequence, New task, Work the queue, shortcuts on labels, Type and Due filters and the row door at level one; Source, Status and Sort in "More filters", note, edit, delete, snooze until and open contact in "…", columns and export in "Table options". AE: counts, rows, Done, Snooze, Write, Skip, New task, Open contact and Add note at level one; the queue as a secondary button (15%), all filters in the door. CS: counts, rows, Done, Skip; everything else in doors, and the queue button appears once a task exists. Admin: counts, rows, Owner column and filter, Skip; Reassign and the Status and Due filters in doors; the page opens on Everyone. Marketer: the empty state naming Daniel Okafor, with New task as a plain button.

**Across the four businesses.** Fathom: the admin gets the SDR's level one plus Owner filter and column; a third of rows say "From: Research agent". Meridian: the baseline. Halyard: local time under Due, Source at level one, and for the admin Reassign, Bulk reassign and Status at level one; the page is per workspace, the switcher is a later case. Ridgeline: CS and AE get the AE's level one plus Snooze until a date; Type and Source go into the door for the SDR; the queue is a secondary button for everyone but the SDR.

**Doors.** All are level two, and nothing inside them opens further.

| Door | Label | Container |
|---|---|---|
| Row door | "History and contact", chevron and text | Expands in place |
| Row menu | "…", aria-label "More actions"; items carry shortcuts | Flat menu, no submenus |
| More filters | "More filters: source, status, sort" (contents vary by role) | Popover |
| Table options | "Table options: columns, export" | Popover |
| New task | "New task" | Drawer |
| Work the queue | "Work the queue (11)" | Drawer beside the table; full screen on phone |

**Work the queue.** The drawer takes the current list in its current order. Header: "Task 3 of 11 · Call · Amara Okonkwo, Northwind Analytics", previous and next. Body: what to do, the step history, the contact essentials with local time, notes and a note field; for Email tasks, the compose with "Send and mark done". Footer: Done (with outcome buttons for calls), "Snooze · the sequence waits", "Skip · contact moves to next step". Each advances to the next task. At the end: "Done for today. 4 due tomorrow." The outcome is a row of buttons, snooze options are buttons, the contact panel is already open, so the drawer has no inner door. The table stays visible with the current row highlighted.

**Persistence.** Filters, sort, the Owner choice, each row door and "Expand all" persist per user per workspace. The queue always starts at the first open task, because order is the point. Undo toasts last 8 seconds.

**Accelerators.** The queue, letter shortcuts printed beside every label, `?` for the list, bulk actions on selection, "Expand all". A daily user reaches every level-one action without a door and every level-two action with one keystroke.

**Decision-critical, always visible.** The overdue count and "sequence waiting" on the row; the consequence written on Skip and on Snooze for sequence tasks; Delete only where it applies, below a divider, with Undo.

**Removed rather than hidden.** Priority (a task is due or it is not); starring; the Recommended ranking; saved views; group by; multi-level sort; the 30 firmographic filters and the deprecated one; the type tabs and Views menu (one Type filter remains); "Archive" (Skip for sequence tasks, Delete for manual ones); auto-skip (an overdue task stays overdue and says so); plan-gated task types; "Start call session" (no dialer in Ollopa: a call task shows the number and takes the outcome).

**Score.**

1. Decision-critical visible: overdue counts, sequence waiting, Skip and Snooze consequences, Delete with Undo. 2.
2. Every visible item backed by a number: section 4, density case explained. 2.
3. Two levels on every screen size; inline fields inside doors are not doors; the phone collapses layout, not availability. 2.
4. Doors labelled by content with chevron and text; "…" is the one conventional ellipsis, labelled for assistive tech. 2.
5. Doors adjacent, all buttons, keyboard and touch; actions show on focus and are always visible on the phone. 2.
6. Dependent information together: due, what to do and sequence waiting on one row; consequence on the control; contact and step history in one door. 2.
7. State persists; expand all and print exist. 2.
8. Disclosure by user action or object state only; no ranking by history. 2.
9. Door open rates are logged and a twice-yearly review is scheduled, but none has happened. 1.

Total 17 of 18.

## 7. Lesson steps

Not a lesson. The rules that mattered most:

- **Rule 1.** Due, what to do and the sequence state are needed on every visit; they are columns, not drawer content.
- **Rule 4.** "Archive" became "Skip · contact moves to next step"; every door label says what is behind it.
- **Rule 6.** A stable order, overdue first then oldest due, replaced an AI "Recommended" ranking explained only on hover.
- **Rule 8.** The queue, shortcuts printed on labels and bulk actions let the SDR live here without doors; 30 filters nobody uses on a task page were deleted, not tucked away.

## 8. Review

| Check | Result |
|---|---|
| All roles covered | Gap: the marketer had no page; closed with the empty state naming the admin |
| All four businesses covered | Gap: Halyard's local time and Source filter were level two by the baseline; closed with overrides |
| Every field has a source | Nine seed additions. Gap: contacts matched by name; closed with `contactId` |
| Every action has an outcome | Section 3, including undo and sequence effects |
| Empty, error, no-access states | Six states; no-access names who can |
| Keyboard | Full set, printed on labels, inert in fields |
| Phone width | Cards, visible actions, one filters door, full-screen queue, same depth |
| Decision-critical visible | Overdue, sequence waiting, Skip and Snooze consequences, Delete |
| Two levels maximum | Gap: a Snooze submenu would have been a third level; closed with an inline date field |
| Doors labelled by content | All six, named by contents |
| Dependent fields together | Due, what to do, sequence state and consequence on one row |
| State persists | Filters, sort, owner, row doors, expand all |
| Accelerators present | Queue, shortcuts, bulk, expand all |
| Usage shape checked | Four pairs; SDR density case stated |
| Nothing hover-only | Actions on focus and in the menu; always visible on the phone |
| Role gaps explain themselves | Marketer empty state; SDR description line naming the admin |
| No usage numbers or teaching text | Task counts only; numbers live in `tasks.ts` and here |
