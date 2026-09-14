# Inbox

*Replies from sequences, grouped by what the person meant. A "real" page: the table template plus a thread panel. Usage items: `src/ollopa/usage/inbox.ts`.*

## 1. Purpose

The Inbox is where a reply becomes a next step. Every email a sequence sends can come back with an answer, and the answer means one of five things: the person is interested, they have a question, not now, they are out of office, or they want to be left alone. The page sorts replies by that meaning and puts the right action on each row.

Who lives here: the SDR, all day; the AE, daily, for replies handed over and replies to their own sequences. At Fathom Labs the founder does outbound, so the admin role has the Inbox there too. Marketers, customer success and the RevOps admin elsewhere do not see it; the page tells them who does.

The one thing they must never lose sight of: an interested person who is waiting. Reply speed is the whole game. The page opens on Interested, longest-waiting first, and the waiting time is the first column.

## 2. Data

Every row is a `Reply` from `src/ollopa/data/seed.ts`. Fields shown and their source:

| Shown | Field | Source |
|---|---|---|
| Waiting | `received`, shown as "3 d · Sep 10" against today (2026-09-13) | seed, exists |
| From | `contact`, `company`; title and email joined from `contacts` | seed, exists (join by `contactId`, to add) |
| Meant | `outcome`: Interested, Question, Not now, Out of office, Unsubscribe | seed, exists |
| Reply | `snippet` in the row; full `body` in the panel | seed, `snippet` exists; `body` to add |
| Sequence · step | `sequence`; `step` "2 of 5" | seed, `sequence` exists; `step` to add |
| Owner | the user whose mailbox received it | to add as `mailbox` |
| Thread | the steps we sent before the reply | to add as `messages[]` |
| Status | open or handled; who it was handed to; follow-up date; return date | to add |

To add to the seed, deterministic per business:

- `contactId`, `mailbox` (from the SDR and AE seats; at Fathom also the admin), `step` (1 to the sequence's `steps`).
- `body` (three to six sentences per outcome) and `messages[]`: one entry per step sent before the reply, `{ from: "us", sent, subject, body }`, then the reply as `{ from: "them" }`.
- `status: "open" | "handled"`, `handedTo?`, `followUpOn?` (Not now; "January" parses to 2027-01-05), `returnsOn?` (Out of office; "until the 21st" parses to 2026-09-21), `dealId?`.
- Reply volume: Fathom 10, Meridian 18, Halyard 18, Ridgeline 6. Ridgeline's replies come from "Warm inbound follow-up" and "Trial activation nudge", mostly Interested or Question, almost never Out of office or Unsubscribe.
- Six handled replies per business, so Handled is not empty.

The calendar link for Book meeting comes from Settings › Integrations › Calendar (`int.calendar`); all four businesses have one connected. Saved replies are five fixed texts per business. AEs for Hand to an AE are the `ae` seats in `businesses.ts`.

## 3. Features

### Shown

- Header: "Inbox", the line "Replies from your sequences, grouped by what the person meant", and the count "9 waiting · longest 3 d".
- Group tabs with counts. Which tabs are visible depends on the usage model (section 6); the rest sit in one dropdown tab labelled with their names and counts.
- The table: Waiting, From (name, then title and company), Meant (badge with text, never colour alone), Reply (first line), and, where usage puts it at level one, Sequence · step. Longest-waiting first.
- The thread panel on the right, open by default, 420 px, resizable. Header: name, title, company, email with its status, sequence and step, owner mailbox, open deal, "Handed over by Marcus" when applicable. Body: the reply in full, the earlier messages, the composer.
- The composer: To and Subject prefilled, a text area, Insert a saved reply, Send, and a Send menu with Schedule.

### Actions

Row actions appear on hover and on keyboard focus, and every one also lives in the row's "…" menu, so nothing is hover-only. The two visible actions depend on the group, because the group is the object's state (rule 6). The "…" menu has a fixed order inside each group.

| Group | Visible actions | Outcome |
|---|---|---|
| Interested | Reply · Book meeting | Reply focuses the composer. Book meeting drafts a reply with the calendar link; when the calendar reports a booking, the contact stage becomes Meeting booked. |
| Question | Reply · Book meeting | As above. |
| Not now | Follow up on… · Done | Follow up on… opens a date picker with In 2 weeks, Next month, and the date parsed from the reply; creates a Follow-up task and moves the reply to Handled. |
| Out of office | Resume on {date} · Done | The sequence resumes on the parsed return date; the menu also offers Resume now. |
| Unsubscribe | Confirm unsubscribe · Not interested | Confirm adds the address to the do-not-contact list and ends every sequence. The confirmation reads: "Ollopa will not email amara.okonkwo@… again from any sequence. Undo is in the notification for 10 seconds." |

Menu actions, every group unless noted: Hand to an AE (SDR only, where an AE seat exists; pick the AE, add a note; the reply moves to the AE's Inbox with a task "Reply to Amara", and leaves the SDR's list), Mark done, Mark not interested (stage Not interested, sequence finished, reply handled), Create deal from this reply (opens the deal record prefilled), Open contact, Change what they meant (five options; the row moves group; the correction is logged for the classifier), Remove from sequence keeping history, Add a note, Forward thread, Open in Gmail or Outlook, Assign to another SDR, Add to list, Mark unread, Mark as spam or bot reply, Report a misread reply. Every action toasts its outcome with Undo.

Bulk: x or Select in the menu shows checkboxes and a bar with Mark done, Mark not interested, Hand to an AE, Confirm unsubscribes (only when every selected row is in Unsubscribe), Export CSV, and the count. Escape clears it.

Page actions: none. An inbox creates nothing; one-off email lives on the contact page.

### Filters, search, sorting, columns

Search matches name, company and reply text. Filters: sequence, owner, mailbox, date received. Sorting by Waiting, From or Sequence by clicking the header, with the sort announced. Columns are fixed; there is no column chooser.

### States

- Empty, nothing ever received: "No replies yet. Replies to your 5 active sequences land here within about 30 minutes of reaching your mailbox." with a link to Sequences.
- Empty group: "Nobody is out of office." "Nothing waiting: every interested reply is handled."
- Empty search or filter: the template's "Nothing matches. Clear the search or a filter."
- Loading: six skeleton rows and a skeleton panel.
- Error: "Couldn't load replies from your mailbox. Last synced 09:40." with Retry and a link to Settings › Mailboxes.
- No access (marketer, customer success, admin outside Fathom): "Inbox is where SDRs and AEs work replies. At Meridian Software that is Marcus Adeyemi and Elena Vasquez. Replies to lifecycle campaigns are on Campaigns." Names come from `businesses.ts`.
- Own mailbox only, at Meridian: under the count, "You see replies to your mailbox. Daniel Okafor can widen this in Settings › Team and access."
- No calendar connected: Book meeting is replaced by "Connect a calendar to book from here", linking to Settings.

### Keyboard

j and k move between rows, Enter opens the row in the panel and moves focus there, r replies, b books, d marks done, n marks not interested, h hands to an AE, u confirms an unsubscribe (with the same confirmation), x selects, Escape closes the panel or the selection, ? opens the shortcut sheet. Each "…" menu item shows its key. The command palette lists every action with its key.

### Accessibility

The table is a grid with row headers on From. Each row's badge has text. The panel is a `region` labelled "Thread with Amara Okonkwo"; opening it moves focus to its heading and Escape returns focus to the row. Row actions are reachable by Tab inside the row. Doors use `aria-expanded`. Toasts go to a polite live region. The waiting-time warning (an Interested reply older than one business day) is text, "3 d, overdue", not colour.

### Phone width

The list becomes two-line rows: name and Meant badge, then the first line, with Waiting on the right. Tabs scroll sideways. Tapping a row opens the thread as a full page with a back arrow that returns to the same row; the two visible actions sit in a bottom bar with the "…" menu. Everything reachable on desktop is reachable in the same number of steps.

### By role and by business

| | SDR | AE | Admin |
|---|---|---|---|
| Fathom | own and both founders' replies; no AE seat, so Hand to an AE is removed and Create deal takes its place at level one | no seat | the founder: same page as the SDR |
| Meridian | own mailbox only; Hand to an AE to Elena Vasquez | replies handed over plus replies to own sequences; Create deal and the earlier messages are at level one | no access |
| Halyard | one client workspace at a time; Sequence · step column and the sequence filter at level one; saved replies at level one; no AE seat, so Hand to an AE is removed and hand-off is Book meeting on the client's calendar | no seat | no access |
| Ridgeline | few replies, mostly Interested and Question; Not now still at level one | Create deal, Open contact and contact details at level one | no access |

## 4. Usage items

Fifty-eight items in seven areas. Baseline numbers describe Meridian; overrides follow the business profiles in USAGE-MODEL.md. Decision-critical items are marked * and are level one whatever their number. Overrides are written business: role number.

| Item | Area | SDR | AE | Overrides |
|---|---|---|---|---|
| Interested | Groups | 95 | 60 | fathom: sdr 90, admin 80; ridgeline: sdr 60, ae 40 |
| Question | Groups | 80 | 40 | fathom: admin 70; ridgeline: sdr 50, ae 25 |
| Not now | Groups | 35 | 10 | fathom: admin 30; ridgeline: sdr 20, ae 6 |
| Out of office | Groups | 12 | 3 | fathom: admin 10; halyard: sdr 15; ridgeline: sdr 4, ae 1 |
| Unsubscribe * | Groups | 25 | 4 | fathom: admin 25; halyard: sdr 40; ridgeline: sdr 10, ae 2 |
| Handled | Groups | 12 | 8 | fathom: admin 12; halyard: sdr 15 |
| Reply row | List | 95 | 60 | fathom: admin 85; ridgeline: sdr 60, ae 40 |
| Sequence and step column | List | 18 | 8 | fathom: sdr 15, admin 15; halyard: sdr 60; ridgeline: sdr 5, ae 2 |
| Owner column | List | 4 | 12 | fathom: sdr 4, admin 4 |
| Sort by column | List | 3 | 3 | |
| Show more rows | List | 4 | 4 | fathom: admin 4; halyard: sdr 8 |
| Search | Filters | 20 | 10 | fathom: admin 15; halyard: sdr 18 |
| Filter by sequence | Filters | 12 | 5 | fathom: admin 8; halyard: sdr 30; ridgeline: sdr 4, ae 1 |
| Filter by owner | Filters | 3 | 10 | fathom: sdr 4, admin 4 |
| Filter by date | Filters | 3 | 3 | halyard: sdr 4 |
| Filter by mailbox | Filters | 4 | 2 | fathom: admin 3 |
| Reply in place | Row actions | 85 | 50 | fathom: admin 75; ridgeline: sdr 50, ae 35 |
| Book meeting | Row actions | 60 | 40 | fathom: admin 55; ridgeline: sdr 35, ae 30 |
| Hand to an AE | Row actions | 45 | 0 | fathom: 0; halyard: 0; ridgeline: sdr 25 |
| Mark done | Row actions | 40 | 25 | fathom: admin 40; halyard: sdr 55; ridgeline: sdr 30, ae 20 |
| Mark not interested | Row actions | 30 | 15 | fathom: admin 30; halyard: sdr 40; ridgeline: sdr 12, ae 6 |
| Follow up on a date | Row actions | 30 | 10 | fathom: admin 25; ridgeline: sdr 15, ae 6 |
| Resume sequence | Row actions | 10 | 2 | fathom: admin 4; halyard: sdr 15; ridgeline: sdr 3, ae 0 |
| Confirm unsubscribe * | Row actions | 20 | 3 | fathom: admin 20; halyard: sdr 35; ridgeline: sdr 8, ae 1 |
| Create deal | Row actions | 4 | 35 | fathom: sdr 20, admin 35; ridgeline: ae 45 |
| Open contact | Row actions | 15 | 25 | fathom: admin 15; ridgeline: ae 30 |
| Change what they meant | Row actions | 12 | 5 | fathom: admin 10 |
| Remove from sequence | Row actions | 4 | 2 | fathom: admin 3 |
| Add a note | Row actions | 4 | 15 | fathom: admin 4 |
| Forward thread | Row actions | 3 | 6 | fathom: admin 3 |
| Open in Gmail or Outlook | Row actions | 5 | 8 | fathom: admin 4 |
| Assign to another SDR | Row actions | 4 | 1 | fathom: admin 2; halyard: sdr 12 |
| Add to list | Row actions | 3 | 1 | |
| Mark unread | Row actions | 4 | 3 | fathom: admin 4 |
| Mark as spam or bot | Row actions | 2 | 1 | |
| Report a misread reply | Row actions | 2 | 1 | |
| Thread panel | Thread | 90 | 55 | fathom: admin 80; ridgeline: sdr 55, ae 35 |
| Earlier messages | Thread | 18 | 30 | fathom: admin 15; ridgeline: sdr 10, ae 30 |
| Insert a saved reply | Thread | 18 | 6 | fathom: admin 18; halyard: sdr 35; ridgeline: sdr 6, ae 2 |
| Contact details | Thread | 12 | 25 | fathom: admin 12; ridgeline: ae 30 |
| Schedule send | Thread | 4 | 5 | fathom: admin 4 |
| Cc and Bcc | Thread | 3 | 8 | fathom: admin 3 |
| Attach a file | Thread | 2 | 4 | |
| Opens, clicks, earlier replies | Thread | 4 | 3 | fathom: admin 3 |
| CRM sync status | Thread | 1 | 3 | fathom: 0 (no CRM; line removed) |
| Delivery diagnostics | Thread | 2 | 1 | |
| Translate | Thread | 1 | 1 | |
| Print thread | Thread | 1 | 1 | |
| Include signature | Thread | 2 | 2 | |
| Select rows | Bulk | 15 | 3 | fathom: admin 15; halyard: sdr 18 |
| Mark selected done | Bulk | 12 | 2 | fathom: admin 12; halyard: sdr 18 |
| Mark selected not interested | Bulk | 4 | 2 | fathom: admin 4; halyard: sdr 12 |
| Hand selected to an AE | Bulk | 3 | 0 | fathom: 0; halyard: 0 |
| Confirm selected unsubscribes | Bulk | 6 | 1 | fathom: admin 6; halyard: sdr 15 |
| Export CSV | Bulk | 2 | 1 | halyard: sdr 4 |
| Row shortcuts | Keyboard | 15 | 6 | fathom: admin 15; ridgeline: sdr 4, ae 2 |
| Shortcut sheet | Keyboard | 4 | 3 | fathom: admin 4 |
| Command palette | Keyboard | 4 | 5 | fathom: admin 5 |

Shape check, computed with `shape()` from `model.ts` (target: head 15–25%, body 25–35%, tail 45–60%):

| Pair | Head | Body | Tail |
|---|---|---|---|
| Meridian, SDR | 14 (24%) | 15 (26%) | 29 (50%) |
| Meridian, AE | 11 (19%) | 18 (31%) | 29 (50%) |
| Halyard, SDR | 15 (26%) | 16 (28%) | 27 (47%) |
| Ridgeline, AE | 11 (19%) | 14 (24%) | 33 (57%) |
| Fathom, admin | 13 (22%) | 15 (26%) | 30 (52%) |

Halyard's SDR sits one item over the head band. That is the agency profile: the sequence names the client, so the sequence column and filter and the saved replies are daily. It is kept, and it is the reason Halyard's level one differs from Meridian's.

## 5. Before: the common version

Modelled on Apollo's **Emails** hub. Sources: [View and Respond to Emails](https://knowledge.apollo.io/hc/en-us/articles/30919852777229-View-and-Respond-to-Emails) (updated 28 Jul 2026), [Email Tracking Overview](https://knowledge.apollo.io/hc/en-us/articles/34263074322701-Email-Tracking-Overview) (26 Aug 2026), [Sequences Overview](https://knowledge.apollo.io/hc/en-us/articles/4409237165837-Sequences-Overview) (13 Sep 2026), [Manage Contacts in a Sequence](https://knowledge.apollo.io/hc/en-us/articles/46681725112589-Manage-Contacts-in-a-Sequence) (18 Aug 2026), [Home Overview](https://knowledge.apollo.io/hc/en-us/articles/14845941738637-Home-Overview) (2 Sep 2026), Apollo's engineering post [Email Reply Classification Done Right](https://www.apollo.io/tech-blog/email-reply-classification-done-right) (23 Aug 2024).

**Layout.** One left-nav item, "Emails". A flat list of every email "across contacts and sequences from you and your team": drafted, scheduled, delivered, bounced, not sent, replied. Replies are one status among many. There is no reply-first view; the KB's own table lists five places to work email (contact profile, sequence, task, Emails, the Chrome extension) and calls Emails "best for a holistic overview".

**Navigation depth.** Filters hide behind "Show filters". Nine of them: Status, From user, Sentiment, From email, Sequences, Contact lists, Date range, Not sent reason, Email opened. Sentiment (the classifier's output: willing to meet, follow-up question, out of office, unsubscribed, and others) is a filter value, not a grouping, so reaching the interested replies is: Show filters, Sentiment, pick a value. Three steps to the page's main task.

**Replying.** Click the email to open the thread, click the ⤺ icon, compose, then "Reply now" or "Schedule". Page, thread, icon, composer: the reply box is not on the page.

**Marking the outcome.** The "…" menu has up to eleven items, mixing draft actions (Edit, Delete, Schedule, Skip email and continue sequence, Retry) with reply actions (Mark Interested, Reply to thread, Unmark as reply, Show diagnostics, CRM sync history). To mark a received reply as interested, the KB says: "open the original sent email." The action lives on the message you sent, not the one you got. Not interested, unsubscribed and meeting booked are not here at all: they are reasons in "Mark as Finished" on the sequence's contact list, another page.

**Bulk.** Reschedule, Email from different user, Delete, Skip, Retry undelivered, Export. No bulk mark interested, no bulk unsubscribe.

**Hidden and hover-only.** "Hover over an email status to view more insights." Out-of-office filters "only appear as options on your sequence if Apollo has detected an out-of-office reply": a control appears from data the user has not seen.

**Documented problems.**

- Replies are late: "Replies can take 15-30 minutes to sync and appear in Apollo, even if the reply already appears in your mailbox." (Email Tracking Overview.)
- An out-of-office message "doesn't count as replied", and the Status filter is "Not to be confused with email status for contacts". (View and Respond; Sequences Overview.)
- Seeing the team's replies needs a permission profile change: "you need the email visibility permission can see emails from all users… An Apollo admin at your organization can help." (View and Respond.)
- Reviews: "too many clicks to reach data, many navigation buttons seems to be not in the logical place" (Hassnaa, Trustpilot, 4 Sep 2026); "one click too many each time" (G2 reviewer via SyncGTM, secondary); "The grid for making calls and completing tasks is a bit messy" (G2 via Warmly, secondary). A Capterra reviewer saying "the inbox doesn't always sync well" surfaced only in a search summary: unverified.

**Kept from Apollo.** The classifier: 90% accuracy, out-of-office precision above 99%, willing-to-meet recall above 90% (tech blog). Auto-pause and auto-resume on a detected return date. A reply finishes the sequence by default.

**Before score:** 1. Decision-critical: unsubscribe requests are a filter value, 0. 2. Usage numbers: none published, 0. 3. Two levels: page → Show filters → Sentiment → value, and page → thread → icon → composer, 0. 4. Doors labelled: "Show filters" and "…" say nothing about content, 1. 5. Adjacent and keyboard: Mark Interested is on a different message, 0. 6. Dependent information: outcome marking on Sequences, the reply on Emails, 0. 7. Persistence: filters reset on return (unverified), 1. 8. Object state: filters appear from detected data the user has not seen, 1. 9. Instrumented: unknown, 1. Total 4 of 18.

## 6. After: the disclosed version

**Layout.** Header with the waiting count. Group tabs. Search and a filter door. The table on the left, the thread panel on the right, open by default. Nothing else.

**Level one and level two, by role and business.** Level one is what the usage model puts at 20% or more, plus the two starred items.

| | Level one | Level two, by door |
|---|---|---|
| Meridian SDR | Interested, Question, Not now, Unsubscribe tabs; the row; search; Reply, Book meeting, Hand to an AE, Mark done, Mark not interested, Follow up on, Confirm unsubscribe; the panel with the composer | Tab "Out of office (2) · Handled (6)"; door "Filter by sequence, owner, mailbox, date"; row "…"; panel "Earlier messages (3)"; "Insert a saved reply"; Send menu with Schedule; "Contact details" |
| Meridian AE | Interested, Question, Unsubscribe tabs; the row; Reply, Book meeting, Mark done, Confirm unsubscribe, Create deal, Open contact; the panel with earlier messages and contact details open | Tab "Not now (1) · Out of office (0) · Handled (4)"; door "Search and filter by sequence, owner, date"; row "…" |
| Fathom SDR and admin | As Meridian SDR, minus Hand to an AE, plus Create deal | Same doors; CRM sync line removed |
| Halyard SDR | As Meridian SDR, minus Hand to an AE, plus the Sequence · step column, the Sequence filter beside search, and Insert a saved reply as a visible button | Door "Filter by owner, mailbox, date"; the rest as Meridian |
| Ridgeline SDR | As Meridian SDR | Same doors |
| Ridgeline AE | As Meridian AE | Same doors |

**Every door.** Labelled by content, with a chevron and text, next to what it reveals.

| Door | Content | Container | Persists |
|---|---|---|---|
| "Out of office (2) · Handled (6)" tab | the level-two groups | dropdown tab, in the tab row | last chosen group, per user and workspace |
| "Filter by sequence, owner, mailbox, date" | the level-two filters; the search box too for the AE | popover beside search; chips show active filters | active filters, per user and workspace |
| Row "…" | the menu actions, fixed order per group, shortcut beside each | menu | none needed |
| "Earlier messages (3)" | the steps we sent, full text | expands in place in the panel | open or closed, per user |
| "Contact details" | title, email status, phone, open deal, owner | expands in place | open or closed, per user |
| "Insert a saved reply" | five saved texts | menu on the composer | none |
| Send ▾ | Schedule for later, Include signature, Cc and Bcc, Attach | menu on the Send button | none |
| Select (x) | bulk bar | contextual bar, driven by selection state | cleared on Escape |

Two levels, counted per channel: the page and one door. The panel is part of level one, so its doors are second level. On the phone the panel is a page, and its doors stay one deep.

**Persistence.** Group, filters, panel state and width, door states, in `localStorage` under `ollopa.inbox.{business}.{role}`. Expand all and collapse all sit at the top of the panel; print expands everything.

**Accelerators.** Shortcuts on every menu item; the palette; the panel kept open; saved replies; Book meeting as one click. A daily SDR reaches every level-one action without a door.

**Decision-critical, always visible.** The Unsubscribe tab count. Confirm unsubscribe with its consequence written on the confirmation. Hand to an AE names the person receiving it. Mark not interested says it ends the sequence. Undo in every toast, one click, the same length as doing.

**Removed rather than hidden.** Drafts, scheduled and bounced emails (they belong to Sequences and Tasks). A Sentiment filter (the groups replace it). Mark interested (corrections go through Change what they meant). Unmark as reply. Email from a different user in bulk. Column chooser, density toggle, saved views: under 3% in every segment. Open and click popovers: replies are the signal, as Apollo's own KB says.

**After score.** 1. Unsubscribe count and consequence text visible without a click: 2. 2. Every level-one item has a number in `inbox.ts` with USAGE-MODEL.md as source: 2. 3. Page and one door on every width: 2. 4. Every door named by its content with a chevron: 2. 5. Doors sit beside what they reveal and open by keyboard and touch: 2. 6. The reply, its outcome and its actions are on one row and one panel; nothing dependent is split: 2. 7. Group, filters, panel, door state persist; expand all and print exist: 2. 8. Doors open by user action or by the reply's group; nothing moves from history: 2. 9. Door opens are counted in the usage log and the promote, keep or delete review is every six months; in the demo the counter lives in memory only: 1. Total 17 of 18.

## 7. Lesson steps

The Inbox is a real page, not a lesson. The rules that mattered most:

- Rule 1: group by meaning, because the meaning decides the action, and put the four groups people touch weekly on the tab row.
- Rule 4: remove Hand to an AE where there is no AE, and remove the CRM line where there is no CRM; never grey them out.
- Rule 5: the reply, its outcome and its actions on one row and one panel; the marking never lives on a different page.
- Rule 7: the count of people who asked to stop is never behind a door, and the unsubscribe confirmation says what it does.

## 8. Review

| Check | Gap found | Closed by |
|---|---|---|
| All roles | The nav gives Inbox to SDR and AE only; Fathom's admin does outbound | Fathom's admin gets the page with its own numbers; other admins get the no-access state naming who has it |
| All four businesses | Halyard and Fathom have no AE seat | Hand to an AE removed there; Create deal and Book meeting take its place |
| Every field has a source | Thread, step, owner, status did not exist | Section 2 lists the seed additions |
| Every action has an outcome | Book meeting risked being a booking page, outside the boundary | It sends the calendar's link; the booking lives in the calendar |
| Empty, error, no-access | Empty group and missing calendar were missing | Added |
| Keyboard | Bulk selection had no key | x selects, Escape clears |
| Phone width | The panel would have been a third level under the list | The panel becomes a page; doors stay one deep |
| Decision-critical visible | Unsubscribe would be level two for the AE at 4% | Marked critical; always a visible tab |
| Two levels maximum | Earlier messages inside a drawer is a door in a door | The panel is level one; no drawer |
| Doors labelled by content | "More groups", "More filters" | Renamed to what they hold, with counts |
| Dependent fields together | Outcome marking and the reply | Same row, same panel |
| State persists | Panel width and door state | Per user and workspace |
| Accelerators | Shortcuts existed but were not shown | Beside each menu item and in the palette |
| Usage shape | Fathom admin had no body; Halyard SDR too small a tail | Overrides adjusted; five pairs in section 4 |
| Nothing hover-only | Row actions on hover | Also on focus and in "…"; Apollo's status hover becomes text |
| Role gaps explain themselves | Meridian SDR sees only own mailbox | One line names the admin who can widen it |
| No usage numbers or teaching text | None | Numbers live in `inbox.ts` and this file only |
