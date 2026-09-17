# Inbox

*Replies from sequences, grouped by what the person meant. A "real" page: the table template plus a thread panel. Usage items: `src/ollopa/usage/inbox.ts`.*

## 1. Purpose

The Inbox is where a reply becomes a next step. Every email a sequence sends can come back with an answer, and the answer means one of five things: the person is interested, they have a question, not now, they are out of office, or they want to be left alone. The page sorts replies by that meaning and puts the right action on each row.

Who lives here: the SDR, all day; the AE, daily, for replies handed over and replies to their own sequences. Marketers and customer success do not have the area at all; the page tells them who does and who to ask.

The admin seat is not a third role here. The sidebar is declared, never inferred: it comes from the seat and from the workspace profile chosen at set-up (RULES.md, the declared sidebar). At Fathom Labs the profile is Founder-led outbound, so the Inbox is in the founder's sidebar and she works replies all day. At Meridian the profile is Separated sales team, so the Inbox is not in the admin's sidebar; the page still opens by deep link and by ⌘K, and its header offers "Add to sidebar", which adds it at the end of its group and keeps it there. And when a first reply arrives for someone whose profile left the Inbox out, the page appears in that sidebar for two weeks and then asks "keep it?" — the answer is final until a new signal, and there is never more than one such exposure in a period.

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

The calendar link for Book meeting comes from Settings › Integrations › Calendar (`int.calendar`). Meridian, Ridgeline and Fathom have a calendar connected; Halyard has none, so Book meeting is replaced there by the line in section 3 and the action carries no number at Halyard. Saved replies are five fixed texts per business. AEs for Hand to an AE are the `ae` seats in `businesses.ts`.

## 3. Features

### Shown

- Header: "Inbox", the line "Replies from your sequences, grouped by what the person meant", and the count "9 waiting · longest 3 d".
- Group tabs with counts. Which tabs are visible depends on the usage model (section 6); the rest sit in one dropdown tab labelled with their names and counts.
- The table: Waiting, From (name, then title and company), Meant (badge with text, never colour alone), Reply (first line), and, where usage puts it at level one, Sequence · step. Longest-waiting first.
- The Meant cell names its author in text: "Read as: Interested · by the reply agent · change". The classifier ran first and a person is reading its answer, so the answer says whose it is (rule 6: disclosure by object state, and the state includes who set it). "change" is the existing Change what they meant control; a correction is logged for the classifier exactly as a human correction always was. Where a person set the meaning the line reads "Read as: Interested · by you"; where nothing classified it, the line is removed, not left blank.
- The thread panel on the right, open by default, 420 px, resizable. The page is **master-detail**: the list stays in view and the thread is the *open half of the page*, not a disclosure, so `X-thread` is level one and its own doors — the filters, the agent draft, the composer — are the one level below it (IA-MAP 2.7). It is never drawn as a panel opened from inside another. Header: name, title, company, email with its status, sequence and step, owner mailbox, open deal, "Handed over by Marcus" when applicable. Body: the reply in full, the earlier messages, the composer.
- The composer: To and Subject prefilled, a text area, Insert a saved reply, Send, and a Send menu with Schedule. Beside it, where the drafting agent wrote one, the door "Agent draft · 142 words", which loads the draft into the composer marked "Agent draft, not sent". The recipient and the full text are on screen and Send is the approval, so the reply draft is approved here and does not also queue on Agents; the ledger still records it (spec 13). Nothing is ever sent by the agent from this page.

### Actions

Row actions appear on hover and on keyboard focus, and every one also lives in the row's "…" menu, so nothing is hover-only. The two visible actions depend on the group, because the group is the object's state (rule 6). The "…" menu has a fixed order inside each group.

| Group | Visible actions | Outcome |
|---|---|---|
| Interested | Reply · Book meeting | Reply focuses the composer, with the agent draft door beside it. Book meeting opens the meeting panel (below): offer times or send the calendar link; when the calendar reports a booking, the meeting's state becomes Booked and the contact stage becomes Meeting booked. |
| Question | Reply · Book meeting | As above. |
| Not now | Follow up on… · Done | Follow up on… opens a date picker with In 2 weeks, Next month, and the date parsed from the reply; creates a Follow-up task and moves the reply to Handled. |
| Out of office | Resume on {date} · Done | The sequence resumes on the parsed return date; the menu also offers Resume now. |
| Unsubscribe | Confirm unsubscribe · Not interested | Confirm adds the address to the do-not-contact list and ends every sequence. The confirmation reads: "Ollopa will not email amara.okonkwo@… again from any sequence. Undo is in the notification for 10 seconds." |

Menu actions, every group unless noted: Hand to an AE (SDR only, where an AE seat exists; pick the AE, add a note; the reply moves to the AE's Inbox with a task "Reply to Amara", and leaves the SDR's list), Mark done, Mark not interested (stage Not interested, sequence finished, reply handled), Create deal from this reply (opens the deal record prefilled), Open contact, Change what they meant (five options; the row moves group; the correction is logged for the classifier), Remove from sequence keeping history, Add a note, Forward thread, Open in Gmail or Outlook, Assign to another SDR, Add to list, Mark unread, Mark as spam or bot reply, Report a misread reply. Every action toasts its outcome with Undo.

Bulk: x or Select in the menu shows checkboxes and a bar with Mark done, Mark not interested, Hand to an AE, Confirm unsubscribes (only when every selected row is in Unsubscribe), Export CSV, and the count. Escape clears it.

Page actions: none. An inbox creates nothing; one-off email lives on the contact page. There is no reply drawer anywhere in the product: the composer is inside this page's thread panel, and Reply on a Home row opens this page with that thread selected.

### Book and run the meeting

This page owns the meeting panel (`X-meeting`) for the whole product. Tasks renders it from a meeting task row and the deal record renders it from the meeting card (specs 07 and 09); all three open the same panel with the same blocks in the same order. It is flat: one level, no doors inside it, so it is level two wherever it opens.

Ollopa does not own the booking page; the calendar does. The boundary is the meeting object and its events.

- **State.** Proposed → Booked → Held, No-show or Cancelled. The four outcome buttons are marked by a person, never inferred from a calendar's silence; the state and who set it, with the time, are printed above them.
- **Times.** Offer two or three times from the connected calendar, or send the calendar link. At Halyard, where no calendar is connected, both are replaced by "Connect a calendar to book from here", linking to Settings › Integrations; removed, not disabled.
- **Attendees.** Name, title and, once a deal exists, the role on the deal (Champion, Economic buyer, Technical, User, Blocker, Other). Added and removed by hand.
- **Before the call.** The prep brief as a link to the brief record, with the count of qualification elements still unanswered beside it ("Qualification · 3 to answer") where a deal exists, and "Write the handoff brief" where one does not.
- **After the call.** The summary, the action items with checkboxes and one "Create n tasks" button, and the follow-up draft. All three are agent-written where a conversation input exists, marked as drafts, logged and not queued; the person edits and sends. Where an integration supplied a transcript, the transcript is a block in the panel; where none did, the block is removed, not disabled.
- **No-show.** One control, "Start the reminder and reschedule sequence", which names the sequence and what it sends before the click: "Enrols Amara in 'Meeting no-show follow-up' · 3 emails over 8 days from marcus@meridian.software".

**The handoff block.** Where an AE seat exists, the panel carries the hand-off under the meeting. The four fields are in the buyer's words — the problem, why now, who is involved, what success looks like — and each carries the drafting agent's text marked "Agent draft" until the person edits it, at which point the state reads "edited". Under them, the business's binary qualification checklist. Then one control:

> **Create the deal and assign** — "Creates a deal at Qualified for Elena Vasquez — territory UK enterprise · change"

and under it, in text, the SDR's own record: "Your handoffs accepted this quarter: 88% (17 of 19)". That number is what the SDR is paid on, so it is never behind a door. Where no AE seat exists (Fathom, Halyard) the assignment half is removed and the control reads "Create the deal", keeping the owner as the person clicking.

### Filters, search, sorting, columns

The shared table behaviours — sortable headers, the bulk bar, skeleton loading, row actions that appear on focus as well as hover — are specified once in [02 People](02-people.md), the full table lesson; this section records only what differs here. Search matches name, company and reply text. Filters: sequence, owner, mailbox, date received. Sorting by Waiting, From or Sequence by clicking the header, with the sort announced. Columns are fixed; there is no column chooser.

### States

- Empty, nothing ever received: "No replies yet. Replies to your 5 active sequences land here within about 30 minutes of reaching your mailbox." with a link to Sequences.
- Empty group: "Nobody is out of office." "Nothing waiting: every interested reply is handled."
- Empty search or filter: the template's "Nothing matches. Clear the search or a filter."
- Loading: six skeleton rows and a skeleton panel.
- Error: "Couldn't load replies from your mailbox. Last synced 09:40." with Retry and a link to Settings › Mailboxes.
- No access (marketer, customer success): "Inbox is where SDRs and AEs work replies. At Meridian Software that is Marcus Adeyemi and Elena Vasquez. Replies to lifecycle campaigns are on Campaigns." Names come from `businesses.ts`.
- Not in the sidebar (an admin whose workspace profile leaves the Inbox out): the page opens normally, and the header offers "Add to sidebar". This is not a no-access state and says nothing about permission.
- Own mailbox only, at Meridian: under the count, "You see replies to your mailbox. Daniel Okafor can widen this in Settings › Team and access."
- No calendar connected (Halyard): Book meeting is replaced by "Connect a calendar to book from here", linking to Settings › Integrations. The button is removed, not disabled.

### Keyboard

j and k move between rows, Enter opens the row in the panel and moves focus there, r replies, b books, d marks done, n marks not interested, h hands to an AE, u confirms an unsubscribe (with the same confirmation), x selects, Escape closes the panel or the selection, ? opens the shortcut sheet. Each "…" menu item shows its key. The command palette lists every action with its key.

### Accessibility

The table is a grid with row headers on From. Each row's badge has text. The panel is a `region` labelled "Thread with Amara Okonkwo"; opening it moves focus to its heading and Escape returns focus to the row. Row actions are reachable by Tab inside the row. Doors use `aria-expanded`. Toasts go to a polite live region. The waiting-time warning (an Interested reply older than one business day) is text, "3 d, overdue", not colour.

### Phone width

The list becomes two-line rows: name and Meant badge, then the first line, with Waiting on the right. Tabs scroll sideways. Tapping a row opens the thread as a full page with a back arrow that returns to the same row; the two visible actions sit in a bottom bar with the "…" menu. Everything reachable on desktop is reachable in the same number of steps.

### By role and by business

| | SDR | AE | Admin |
|---|---|---|---|
| Fathom | own and both founders' replies; no AE seat, so Hand to an AE is removed and Create deal takes its place at level one | no seat | the founder: the same page as the SDR, in her sidebar because the workspace profile is Founder-led outbound |
| Meridian | own mailbox only; Hand to an AE to Elena Vasquez | replies handed over plus replies to own sequences; Create deal and the earlier messages are at level one | the Separated sales team profile leaves the Inbox out of the sidebar; the page opens by link or ⌘K and offers "Add to sidebar" |
| Halyard | one client workspace at a time; Sequence · step column and the sequence filter at level one; saved replies at level one; no AE seat, so Hand to an AE is removed; no calendar is connected, so Book meeting is replaced by the connect line and Reply and Insert a saved reply take its place | no seat | the Agency profile leaves the Inbox out of the ops lead's sidebar; the page opens and offers "Add to sidebar" |
| Ridgeline | few replies, mostly Interested and Question; Not now still at level one | Create deal, Open contact and contact details at level one | the Separated sales team profile leaves it out of the sidebar, as at Meridian |

## 4. Usage items

Sixty-three items in eight areas. Baseline numbers describe Meridian; overrides follow the business profiles in USAGE-MODEL.md. Decision-critical items are marked * and are level one whatever their number. Overrides are written business: role number.

| Item | Area | SDR | AE | Overrides |
|---|---|---|---|---|
| Interested | Groups | 95 | 60 | fathom: sdr 90, admin 80; ridgeline: sdr 60, ae 40 |
| Question | Groups | 80 | 40 | fathom: admin 70; ridgeline: sdr 50, ae 25 |
| Not now | Groups | 35 | 10 | fathom: admin 30; ridgeline: sdr 20, ae 6 |
| Out of office | Groups | 12 | 3 | fathom: admin 10; halyard: sdr 15; ridgeline: sdr 4, ae 1 |
| Unsubscribe * | Groups | 25 | 4 | fathom: admin 25; halyard: sdr 40; ridgeline: sdr 10, ae 2 |
| Handled | Groups | 12 | 8 | fathom: admin 12; halyard: sdr 15 |
| Reply row | List | 95 | 60 | fathom: admin 85; ridgeline: sdr 60, ae 40 |
| "Read as … · by the reply agent · change" | List | 70 | 40 | fathom: admin 65; halyard: sdr 75; ridgeline: sdr 45, ae 30 |
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
| Book meeting | Row actions | 60 | 40 | fathom: admin 55; halyard: 0 (no calendar; the action is removed); ridgeline: sdr 35, ae 30 |
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
| Agent draft door * | Thread | 55 | 30 | fathom: admin 50; halyard: sdr 60; ridgeline: sdr 30, ae 20 |
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
| Meeting panel | Meeting and handoff | 45 | 35 | cs 20 (opened from Tasks and the deal record); fathom: admin 40; halyard: sdr 0 (no calendar); ridgeline: sdr 25, ae 30, cs 25 |
| Handoff block * | Meeting and handoff | 40 | 10 | fathom: sdr 20, admin 20; halyard: sdr 12; ridgeline: sdr 20, ae 8 |
| Handoffs accepted this quarter | Meeting and handoff | 20 | 4 | fathom: 0; halyard: 0; ridgeline: sdr 12 |
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
| Meridian, SDR | 19 (30%) | 15 (24%) | 29 (46%) |
| Meridian, AE | 14 (22%) | 19 (30%) | 30 (48%) |
| Halyard, SDR | 16 (25%) | 17 (27%) | 30 (48%) |
| Ridgeline, AE | 14 (22%) | 15 (24%) | 34 (54%) |
| Fathom, admin | 17 (27%) | 15 (24%) | 31 (49%) |

Three pairs fit the published shape. Two are over the head band and are stated rather than fitted: **Meridian's SDR at 30%** and **Fathom's founder at 27%**, both five to ten points over the 15–25% target. The cause is the same at both and is not a number chosen too generously: this page absorbed the meeting and the hand-off, which are the SDR's daily work and which previously lived in no spec at all. The classification line, the agent draft, the meeting panel, the hand-off block and the acceptance rate are five head items added at once to a page whose SDR already worked it all day. Bending any of them under 20 to hit the band would be the lie the shape check exists to catch: an SDR at Meridian hands a meeting over most days and is paid on whether it is accepted.

The same judgement was made for the Tasks page, which PLAN.md accepts as the density case, and for Halyard's Settings head at 29%. It is recorded here so it is visible, not hidden: the head is wide because the seat is a single-screen seat, and the fix if it ever grows further is to remove items, not to re-rate them.

Halyard's SDR sits at the top of the band for the agency reason: the sequence names the client, so the sequence column, the sequence filter and the saved replies are daily there. Book meeting and the meeting panel, level one everywhere else, are zero at Halyard because no calendar is connected, so both are removed rather than shown dead.

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
- Reviews: "too many clicks to reach data, many navigation buttons seems to be not in the logical place" (Hassnaa, Trustpilot, 4 Sep 2026); "one click too many each time" (G2 reviewer via SyncGTM, secondary); "The grid for making calls and completing tasks is a bit messy" (G2 via Warmly, secondary). (A fourth complaint about inbox syncing appeared only in a search summary with no reachable review behind it, so it is not used here.)

**Kept from Apollo.** The classifier, with the figures Apollo publishes for it — about 90% accuracy overall, out-of-office precision above 99%, willing-to-meet recall above 90% ([Email Reply Classification Done Right](https://www.apollo.io/tech-blog/email-reply-classification-done-right), 23 Aug 2024; Apollo's own numbers, not independently checked). Auto-pause and auto-resume on a detected return date. A reply finishes the sequence by default.

**Before score:** 1. Decision-critical: unsubscribe requests are a filter value, 0. 2. Usage numbers: none published, 0. 3. Two levels: page → Show filters → Sentiment → value, and page → thread → icon → composer, 0. 4. Doors labelled: "Show filters" and "…" say nothing about content, 1. 5. Adjacent and keyboard: Mark Interested is on a different message, 0. 6. Dependent information: outcome marking on Sequences, the reply on Emails, 0. 7. Persistence: filters reset on return (unverified), 1. 8. Object state: filters appear from detected data the user has not seen, 1. 9. Instrumented: unknown, 1. Total 4 of 18.

## 6. After: the disclosed version

**Layout.** Header with the waiting count. Group tabs. Search and a filter door. The table on the left, the thread panel on the right, open by default. Nothing else.

**Level one and level two, by role and business.** Level one is what the usage model puts at 20% or more, plus the two starred items.

| | Level one | Level two, by door |
|---|---|---|
| Meridian SDR | Interested, Question, Not now, Unsubscribe tabs; the row; search; the "Read as … · by the reply agent · change" line; Reply, Book meeting, Hand to an AE, Mark done, Mark not interested, Follow up on, Confirm unsubscribe; the panel with the composer; the meeting panel with its handoff block and the acceptance rate | Tab "Out of office (2) · Handled (6)"; door "Filter by sequence, owner, mailbox, date"; row "…"; panel "Earlier messages (3)"; "Insert a saved reply"; Send menu with Schedule; "Contact details" |
| Meridian AE | Interested, Question, Unsubscribe tabs; the row; the "Read as …" line; Reply, Book meeting, Mark done, Confirm unsubscribe, Create deal, Open contact; the panel with earlier messages and contact details open; the meeting panel, without the handoff block | Tab "Not now (1) · Out of office (0) · Handled (4)"; door "Search and filter by sequence, owner, date"; row "…" |
| Fathom SDR and founder (admin seat) | As Meridian SDR, minus Hand to an AE, plus Create deal | Same doors; CRM sync line removed |
| Halyard SDR | As Meridian SDR, minus Hand to an AE and minus Book meeting, plus the Sequence · step column, the Sequence filter beside search, and Insert a saved reply as a visible button | Door "Filter by owner, mailbox, date"; the rest as Meridian |
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
| "Agent draft · 142 words" | the drafting agent's reply, loaded into the composer marked "Agent draft, not sent" | expands in place beside the composer | open or closed, per user |
| "Insert a saved reply" | five saved texts | menu on the composer | none |
| Send ▾ | Schedule for later, Include signature, Cc and Bcc, Attach | menu on the Send button | none |
| Select (x) | bulk bar | contextual bar, driven by selection state | cleared on Escape |
| "Book meeting" | the meeting panel: state, times, attendees, prep brief, summary and action items, follow-up draft, the handoff block | panel on its own channel, flat, no doors inside | the panel's scroll position only; state lives on the meeting |

Two levels, counted per channel: the page and one door. The panel is part of level one, so its doors are second level. On the phone the panel is a page, and its doors stay one deep.

**Persistence.** Group, filters, panel state and width, door states, in `localStorage` under `ollopa.inbox.{business}.{role}`. Expand all and collapse all sit at the top of the panel; print expands everything.

**Accelerators.** Shortcuts on every menu item; the palette; the panel kept open; saved replies; Book meeting as one click where a calendar is connected. A daily SDR reaches every level-one action without a door. The shortcut printed beside a menu item is a floor, not a teacher: 749 tooltip exposures produced two shortcut activations, while showing every shortcut for a while took usage from 9.79% to 86.20% and left it at 73.09% after the exposure ended (Harrison, Malacria and Cockburn, IHM 2025, in [11 What changed](../knowledge-base/11-what-changed-2018-2026.md)). The product's teaching device is the two-week sidebar exposure in section 1, not a hint.

**Decision-critical, always visible.** The Unsubscribe tab count. Confirm unsubscribe with its consequence written on the confirmation. Hand to an AE names the person receiving it. Mark not interested says it ends the sequence. The agent draft is marked as a draft and its recipient and full text are on screen before Send, because sending is the approval. "Create the deal and assign" names the owner and the territory before the click. The no-show sequence names itself and what it sends. Undo in every toast, one click, the same length as doing.

**Removed rather than hidden.** Drafts, scheduled and bounced emails (they belong to Sequences and Tasks). A Sentiment filter (the groups replace it). Mark interested (corrections go through Change what they meant). Unmark as reply. Email from a different user in bulk. Column chooser, density toggle and saved views: the page has five fixed columns, so none of the three earns a place and none carries a number in `inbox.ts`. Open and click popovers: replies are the signal, as Apollo's own KB says.

**After score.** 1. Unsubscribe count and consequence text visible without a click: 2. 2. Every level-one item has a number in `inbox.ts` with USAGE-MODEL.md as source: 2. 3. Page and one door on every width: 2. 4. Every door named by its content with a chevron: 2. 5. Doors sit beside what they reveal and open by keyboard and touch: 2. 6. The reply, its outcome and its actions are on one row and one panel; nothing dependent is split: 2. 7. Group, filters, panel, door state persist; expand all and print exist: 2. 8. Doors open by user action or by the reply's group; nothing moves from history: 2. 9. Door opens are counted in the usage log and the promote, keep or delete review is every six months; in the demo the counter lives in memory only: 1. Total 17 of 18.

## 7. Lesson steps

The Inbox is a real page, not a lesson. The rules that mattered most:

- Rule 1: group by meaning, because the meaning decides the action, and put the four groups people touch weekly on the tab row.
- Rule 4: remove Hand to an AE where there is no AE, and remove the CRM line where there is no CRM; never grey them out.
- Rule 5: the reply, its outcome and its actions on one row and one panel; the marking never lives on a different page.
- Rule 7: the count of people who asked to stop is never behind a door, the unsubscribe confirmation says what it does, and an agent-written reply is approved by the person who can see the recipient and the whole text, never by a count in a queue.
- Rule 6: the classification line names its author, so the state on screen explains itself instead of a person guessing whether a human or the classifier decided.

## 8. Review

| Check | Gap found | Closed by |
|---|---|---|
| All roles | An earlier draft granted the Inbox to Fathom's admin by role | Rewritten: SDR and AE have the area; the admin seat gets the page from the workspace profile, and where the profile leaves it out the page opens and offers "Add to sidebar" |
| Calendar | The spec claimed all four businesses had a calendar connected | Corrected: Meridian, Ridgeline and Fathom yes, Halyard no; Book meeting is removed at Halyard and its usage number there is zero |
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
| Usage shape | Fathom admin had no body; Halyard's SDR sat one item over the head band. After the meeting panel and the hand-off arrived, Meridian's SDR reached 30% head and Fathom's founder 27% | Overrides adjusted; five pairs recomputed in section 4 from `inbox.ts`. Three fit; the two over the band are stated with their cause and not fitted, because the items causing it are the SDR's daily work |
| Nothing hover-only | Row actions on hover | Also on focus and in "…"; Apollo's status hover becomes text |
| Role gaps explain themselves | Meridian SDR sees only own mailbox | One line names the admin who can widen it |
| No usage numbers or teaching text | None | Numbers live in `inbox.ts` and this file only |
