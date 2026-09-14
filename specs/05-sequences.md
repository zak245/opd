# Sequences

*The sequences list, and the sequence page: steps, people, settings, results. A "real" page in this release, built on the table template and the record template. The builder (editing steps on a draft) is specified in full because it is a likely later lesson.*

## 1. Purpose

A sequence is a multi-step outreach plan: emails that send themselves, call and LinkedIn tasks that land in Tasks, and waits between them. People enter it from People, Lists, an agent proposal, or the sequence page. Replies land in Inbox.

The list answers one question: which of my sequences are running, and is any in trouble. The sequence page answers three: who is in it and where they are, what each step is doing, and whether it is safe to keep sending.

| Role | How often | What they do |
|---|---|---|
| SDR | All day at Meridian, Fathom and Halyard; weekly at Ridgeline | Watches counts and replies, adds people, pauses a person or the sequence, fixes not-sent people, edits copy about monthly |
| Account executive | Weekly | Puts deal contacts into a follow-up sequence; checks nobody is cold-emailed while a deal is open |
| RevOps admin | Weekly | Watches bounce guard, reassigns owners when people leave, checks mailboxes and schedules. At Fathom the admin is a founder doing outbound and the page is theirs |
| Marketer, customer success | Rarely, by link | Read results. CS at Ridgeline touches the renewal sequence. Neither has Sequences in the navigation |

The one thing nobody may lose sight of: **whether sending is on or stopped, and why.** A sequence can be paused by a person or by bounce guard. Both states, and what resuming will do, are visible without a click on every row and at the top of every sequence.

## 2. Data

### 2.1 What exists in the seed

`Sequence` in `src/ollopa/data/seed.ts`: `id`, `name`, `steps` (a count), `active`, `replied`, `bounced`, `owner`, `status` ("Active" | "Paused" | "Draft"). Twelve names, deterministic per business, capped at 12 rows; the list shows "12 shown of 26" at Meridian. `Contact.inSequence`, `Task.sequence`, `Reply.sequence` and the `AgentEvent` kinds `proposed`, `sent`, `paused` already point at sequences.

### 2.2 What must be added to the seed

| Addition | Fields | Used by |
|---|---|---|
| `SequenceStep` | `id`, `sequenceId`, `order`, `kind` ("Email" \| "Call task" \| "LinkedIn task" \| "Wait"), `on`, `subject`, `body`, `variants` (`{label, subject, body, sent, replied}`, one by default), `linkedinKind` ("Connect" \| "Message" \| "View profile"), `waitDays`, `businessDaysOnly`; stats `{sent, delivered, opened, replied, bounced, unsubscribed}` for Email, `{created, done, skipped, overdue}` for tasks, `{waitingNow}` for Wait | Steps and per-step results |
| `Enrollment` | `id`, `sequenceId`, `contactId`, `status` ("Active" \| "Paused" \| "Finished" \| "Replied" \| "Bounced" \| "Not sent"), `stepOrder`, `nextAt`, `addedAt`, `addedBy`, `mailbox`, `notSentReason` ("No email" \| "Unverified email" \| "Do not contact" \| "Already in another sequence" \| "Mailbox limit reached") | People; counts by status |
| `Sequence`, new fields | `paused`, `finished`, `notSent`, `sent`, `delivered`, `opened`, `interested`, `meetings`; `bounceRate7d`; `guardState` ("ok" \| "warning" \| "auto-paused"); `pausedBy` (a user, "Bounce guard", or null); `mailbox` or `mailboxRotation`; `dailyCap`; `schedule`; `ruleset`; `priority` ("Normal" \| "High" \| "Low"); `tracking`; `sharedWith`; `createdAt`, `updatedAt`, `archivedAt` | Header, settings strip, archive filter |
| `Schedule` (workspace) | `name`, `timezone` or "Contact's time zone", `days`, `hours`, `isDefault` | Picked on the page; defined in Settings > Sequences |
| `Ruleset` (workspace) | `name`, `stopOnReply`, `stopOnAccountReply`, `excludeStages`, `maxEmailsPerPersonPerDay`, `isDefault` | Picked on the page; its rules printed under the picker |
| `Mailbox` (per user) | `address`, `owner`, `dailyLimit`, `sentToday`, `warmup` | The mailbox field shows the limit next to the address (rule 5) |
| `SequenceChange` | `sequenceId`, `when`, `who`, `what` | Change history |
| Per-business names | Ridgeline's two sequences are "Renewal 60 days" and "Expansion: new seats" | Ridgeline has almost no cold outreach |

Seeded schedules: "Business hours, contact's time zone" (default), "UK hours", "US Pacific hours"; Halyard adds one per client time zone. Seeded rulesets: "Default outbound" (stops on reply; skips Replied, Interested, Not interested; one email per person per day) and "Customer-safe" (also skips Current client and Active opportunity; Ridgeline uses it on both sequences). Everything on both pages comes from these tables.

## 3. Features

### 3.1 The list

**Shown.** One row per sequence: Sequence (name, owner underneath), Status (Active, Paused, Draft, Archived; paused by bounce guard reads "Auto-paused"), People (active, "of 412"), Replied (count and rate), Bounced (count and 7-day rate, red at or above the warning threshold), Steps, Last activity. Bounce guard state sits inside the Status and Bounced cells, so it is visible at every width.

**Row actions.** Visible on hover and on keyboard focus, and repeated in the row "…" menu so nothing is hover-only: Pause or Resume (label follows state; on an auto-paused sequence it reads "Review and resume" and opens the page at the health line), Open. In the menu: Duplicate, Archive, Delete draft (drafts with nobody in them only).

**Bulk.** Checkbox per row; a bar with Pause, Resume, Archive and the count selected. Archive confirms with totals across the selection.

**Page action.** New sequence creates a draft called "Untitled sequence" with the default schedule, ruleset and the user's own mailbox, and opens it. No creation modal, no template chooser; Duplicate covers "start from one that works". At Halyard, Duplicate is a visible row button too.

**Filters, search, sorting, columns.** Search by name and owner. Status filter (Active, Paused, Draft, Archived; archived rows hidden unless chosen). Owner filter with a "Mine" chip first; removed at Fathom, where two people send. Every column sorts; default Last activity, newest first. "Columns ⌄" adds Opened, Interested, Meetings, Created, Mailbox, Schedule; the choice persists per user.

**States.** Empty: "No sequences yet. New sequence, or ask the outreach agent to propose one." with both buttons. Empty after filter: the template's "Nothing matches" line. Loading: skeleton rows. Error: "Could not load sequences. Retry." Marketer and CS have no navigation entry; arriving by link, the list is read-only with one line under the title: "You can read sequences. Only owners and RevOps admins change them."

### 3.2 The sequence page

Reached from the list, a contact's "In sequence" link, a reply in Inbox, or an agent event. One page, stacked sections, a sticky row of anchors under the header (Steps · People · Results · Settings · History). Anchors scroll; they hide nothing.

**Header, all level one.**

- Name (click to rename, if allowed), owner, "Shared with workspace" or "Only you".
- Status and the one button that changes it: **Pause** / **Resume**, with a consequence line under it: "Pause stops emails and new tasks. Everyone keeps their place." / "Resume continues from each person's next step. 41 emails go out in the next sending window."
- Health line: "Bounce rate 2.1% over 7 days · Bounce guard warns at 4%, pauses at 6%." Warning state turns amber and adds "Remove bounced people or fix emails before it pauses." Auto-paused turns red, the badge reads "Auto-paused by bounce guard 3 h ago", and Resume becomes "Review and resume", which requires one of: remove bounced people, retry not-sent people, or tick "I have fixed the data". The thresholds link to "Bounce guard thresholds (Settings)" and the link says "RevOps admins change them".
- Counts strip: Active, Paused, Finished, Replied, Bounced, Not sent. Each is a number and a button that filters People.
- Results strip: Sent, Delivered, Opened, Replied, Interested, Meetings. Count and rate side by side in every cell.
- Settings strip, read-only: "Sends from marcus@meridian.io (42 of 100 today) · Business hours, contact's time zone · Default outbound rules · Normal priority". Its door is **Change sending settings ⌄** (3.5).
- Actions: **Add people**, and a menu named **Duplicate, export, archive ⌄** with those three items and, for empty drafts, Delete draft. At Halyard, Duplicate is its own button.

**Role gap.** If the user cannot edit, the header says "Owned by Marcus Adeyemi. Only the owner and RevOps admins change steps and settings; you can add people and pause them." Edit controls are absent, not greyed.

### 3.3 Steps

A vertical list of numbered cards. Each shows without a click: kind and icon, title (email subject; "Call task"; "LinkedIn: connection request"; "Wait 3 business days"), on or off, and one results line (Email: sent 812 · delivered 96% · opened 44% · replied 6.9% · bounced 1.2%. Task: 210 created · 184 done · 12 skipped · 3 overdue. Wait: 38 waiting now). A/B steps show one results line per variant.

**Open step ⌄** expands the card in place. Email: subject, body, **Insert variable ⌄** (first name, company, title, signal, owner; inserts and closes), **Draft with the outreach agent** (writes into the body, marked "Agent draft, not sent" until saved; the event is logged on Agents), **Preview for…** (a person from the sequence), **Add variant** (stacks B under A, each with its own fields; variants are stacked, never tabbed), Save, Cancel. Call and LinkedIn tasks: a note the task will show, the LinkedIn action kind, "due within" days. Wait: days, "business days only".

Card actions, text buttons on focus and hover and in the card "…" menu: Move up, Move down (or drag by the handle), Turn off / Turn on, Change type, Delete. Delete states its consequence: "14 people are waiting at this step. They move to step 4."

Above the list: **Add a step** (inline picker of the four kinds; appended, or inserted after the focused card), **Expand all steps** / **Collapse all steps**. Under a draft: **Activate**, with "3 of 4 steps are on. Step 2 is off and will be skipped." Activation is refused with a reason if no step is on or the mailbox is not linked. A step that is off stays in the list, greyed, labelled Off. Nothing is skipped silently.

In a draft the first step opens expanded; otherwise cards start as the user left them (state persists per sequence).

### 3.4 People

A table of everyone in the sequence: Name and title, Company, Status (with the not-sent reason in the same cell: "Not sent · unverified email"), Step (number and title), Next (date and time of the next send or task, "Waiting for reply", or "Paused by Elena, resumes 21 Sep"), Added (date, by whom), Last activity, Mailbox (off by default; on at Halyard).

Search by name and company. Status filter, also driven from the counts strip. Sort by any column; default Next, soonest first.

Row actions, on focus and hover and in the "…" menu: Pause / Resume (Pause asks for an optional resume date in place), Open reply (only when a reply exists; goes to Inbox), Retry (only for Not sent; opens the email field in place, verifies, retries). In the menu: Mark finished, Move to step…, Remove. Remove and Mark finished state their outcome: "Removes Ana from this sequence and deletes her 2 scheduled emails. Her replies and activity stay on her record." Bulk bar: Pause, Resume, Mark finished, Remove, Export CSV.

**Add people** opens a drawer over the page: search contacts, pick a list, or paste emails; choose the mailbox (the sequence's by default; rotation at Halyard). A preview line reads "212 will be added · 9 skipped: 4 already in a sequence, 3 unverified emails, 2 do not contact", with the nine listed by reason, before anything is committed.

Empty: "Nobody in this sequence yet. Add people, or add from People and Lists." Loading and error follow the list.

### 3.5 Settings of this sequence

One door in the header, **Change sending settings ⌄**, expanding in place under the strip. The fields sit together because they depend on each other:

- **Sending mailbox**: one of the user's linked mailboxes, or "Rotate across" with checkboxes. Under it: "Daily limit 100, 42 sent today, 3 other sequences share this mailbox", and a link "Mailboxes and limits (Settings)".
- **Emails per day from this sequence**: a number, default "no cap", with the mailbox limit it shares printed under it.
- **Sending schedule**: a select of workspace schedules; the chosen one's days and hours printed under it. "New schedule (Settings)" for admins; for others, "RevOps admins add schedules."
- **Ruleset**: a select; the chosen rules printed under it ("Stops on reply · Skips Replied, Interested, Not interested · 1 email per person per day").
- **Priority**: Normal, High, Low; "When a mailbox hits its limit, High sends first."
- **Open and click tracking**: on or off; "Workspace default: on".

Save and Cancel at the bottom. Saving writes to change history. The door remembers whether it was left open. Editing a schedule or a ruleset itself is a separate task on Settings; this page picks and shows.

### 3.6 Results and history

**Results by step and by audience ⌄**, in place below People: one row per step (sent, delivered, opened, replied, interested, bounced, unsubscribed), then a table by title, company size and industry; Export CSV. **Change history ⌄**, in place at the bottom: date, who, what ("Paused by bounce guard: 6.4% bounce rate", "Elena changed schedule to UK hours").

### 3.7 Keyboard, accessibility, phone

List: `/` search, `n` new, `j` `k` move, `Enter` open, `p` pause or resume, `x` select. Page: `a` add step, `e` open or close the focused step, `E` expand all, `s` sending settings, `p` pause or resume, `⌘S` save the open step, `Esc` cancel. Every menu item shows its shortcut; `⌘K` lists every action with its shortcut. Step headers are `button`s with `aria-expanded`; collapsed bodies use `hidden="until-found"` so Ctrl+F finds copy. Status and health are text plus colour, never colour alone. Counts cells announce "Active, 212, filter people". Consequence lines are tied to their buttons with `aria-describedby`. Drawers trap and return focus. Row actions stay in the DOM. Print expands every step and door.

Phone: the list keeps Sequence, Status with health, People and Replied; the other columns sit in the row's expand-in-place detail, one tap. The page stacks; the anchors row scrolls sideways; strips wrap; cards keep their results line; the Add people drawer goes full screen. Nothing is unavailable or deeper on the phone.

### 3.8 By role and by business

| | SDR | AE | Admin | Marketer, CS |
|---|---|---|---|---|
| See the list and pages | Yes | Yes | Yes | By link, read-only |
| Create; edit steps and settings | Own, and shared "can edit" | Own | All | No; the page names who can |
| Pause, resume, archive | Own | Own | All | No |
| Add people; pause a person | Any sequence they can see | Yes | Yes | CS at Ridgeline, where the owner shares "can add" |
| Change owner, sharing | No | No | Yes; removed at Fathom | No |
| Bounce guard thresholds | Named link to Settings | Same | Edits in Settings | Same |

Fathom removes the owner filter, the owner field and sharing, and "Draft with the outreach agent" is the first button in an open email step. Halyard promotes Duplicate to a button on rows and in the header, turns the Mailbox column on in People, and opens the sending-settings door with mailbox and daily cap first. Ridgeline shows its two sequences with the "Customer-safe" ruleset and, under the list title, "Ridgeline runs lifecycle outreach; cold outbound is off by workspace rule." Meridian is the baseline.

## 4. Usage items

Weekly use is the share of active users in the role who touch the item in a typical week; the baseline is Meridian (USAGE-MODEL.md). Override cells: F Fathom, H Halyard, R Ridgeline; s SDR, e AE, m marketer, c CS, a admin. Marketer and CS arrive by link, so their numbers are small everywhere. Critical items are level one whatever their use. The data and its notes are in `src/ollopa/usage/sequences.ts`.

| Item | SDR | AE | Mkt | CS | Admin | Overrides |
|---|---|---|---|---|---|---|
| **List** | | | | | | |
| Sequence list with status and counts | 90 | 30 | 8 | 4 | 25 | F s95 a85 · H s95 a70 · R s30 e15 m5 c12 a8 |
| Open a sequence | 90 | 25 | 6 | 4 | 22 | F s95 a85 · H s95 a70 · R s28 e14 m4 c12 a8 |
| Bounce guard state per sequence **(critical)** | 15 | 3 | – | – | 30 | F s15 a25 · H s30 a50 · R s3 a5 |
| Pause or resume from the list | 25 | 5 | – | – | 10 | F s15 a18 · H s18 a18 · R s5 e3 c3 a3 |
| Search sequences | 10 | 6 | – | – | 6 | F s2 a2 · H s4 a4 · R s2 e2 a2 |
| Filter by status | 10 | 4 | – | – | 6 | F s2 a2 · H s4 a4 · R s2 a2 |
| Filter by owner (Mine) | 15 | 6 | – | – | 10 | F s0 a0 · H s4 a6 · R s3 a3 |
| Sort by a column | 4 | 2 | – | – | 3 | F s1 a1 · H s3 a4 |
| Choose columns | 3 | – | – | – | 3 | – |
| New sequence | 8 | 3 | – | – | 3 | F s10 a12 · H s12 a15 · R s2 e2 c2 a1 |
| Duplicate a sequence | 4 | 1 | – | – | 3 | F s4 a5 · H s20 a25 · R s1 a1 |
| Archive a sequence | 3 | 1 | – | – | 4 | F s2 a3 · H s4 a6 · R a1 |
| Select several: pause, resume, archive | 3 | – | – | – | 3 | F s1 a2 · H s3 a8 |
| Show archived sequences | 2 | – | – | – | 3 | H a4 |
| **Sequence header** | | | | | | |
| People by status (active, paused, finished, replied, bounced, not sent) | 85 | 25 | 6 | 4 | 22 | F s90 a80 · H s90 a65 · R s28 e14 m4 c12 a8 |
| Results strip (sent, delivered, opened, replied, interested, meetings) | 25 | 10 | 8 | 3 | 20 | F s30 a35 · H s40 a45 · R s8 e6 m5 c6 a6 |
| Bounce rate and bounce guard state **(critical)** | 20 | 4 | – | – | 35 | F s20 a30 · H s30 a50 · R s3 a5 |
| Pause or resume the sequence | 30 | 6 | – | – | 10 | F s20 a20 · H s30 a25 · R s6 e3 c4 a3 |
| Rename | 4 | – | – | – | 2 | H s6 a8 |
| Change owner | 1 | – | – | – | 4 | F a0 · H a6 |
| Who can see and edit | 4 | 2 | – | – | 4 | F s0 a0 · H a4 |
| Duplicate (from the page) | 3 | 1 | – | – | 3 | H s12 a15 · R s1 a1 |
| Archive (from the page) | 3 | – | – | – | 4 | H s4 a6 · R a1 |
| Delete draft | 2 | – | – | – | 1 | H s2 a3 |
| **Steps** | | | | | | |
| Steps with per-step results | 80 | 20 | 6 | 3 | 20 | F s85 a80 · H s85 a60 · R s22 e10 m4 c10 a6 |
| Open a step to read or edit it | 40 | 8 | – | – | 8 | F s45 a40 · H s50 a30 · R s10 e4 c6 a3 |
| Edit email subject and body | 12 | 3 | – | – | 3 | F s20 a22 · H s20 a12 · R s5 e2 c4 a1 |
| Insert a variable (first name, company, signal) | 6 | – | – | – | 2 | F s12 a12 · H s10 a5 · R s2 c2 |
| Preview a step for one person | 8 | – | – | – | 2 | F s12 a12 · H s10 a5 · R s3 c3 |
| Ask the outreach agent to draft the step | 10 | – | – | – | 2 | F s30 a30 · H s10 a5 · R s3 c2 |
| A/B variants on an email step | 4 | – | – | – | 2 | F s3 a4 · H s5 a4 · R s1 |
| Add a step | 8 | 2 | – | – | 3 | F s10 a12 · H s12 a12 · R s2 c2 a1 |
| Change a wait | 5 | – | – | – | 2 | F s8 a8 · H s8 a5 · R s2 c2 |
| Reorder steps | 3 | – | – | – | 1 | F s4 a4 · H s4 a3 |
| Delete a step | 3 | – | – | – | 1 | F s4 a4 · H s4 a3 |
| Change a step's type | 2 | – | – | – | 1 | H s2 |
| Who is at this step now | 6 | 2 | – | – | 2 | F s8 a8 · H s8 a4 · R s2 c2 |
| Turn a step off without deleting it | 3 | – | – | – | 1 | H s4 a3 |
| Activate a draft | 6 | 2 | – | – | 2 | F s10 a12 · H s12 a15 · R s2 c2 a1 |
| Expand or collapse all steps | 4 | – | – | – | 2 | F s6 a6 · H s6 a4 |
| **People** | | | | | | |
| People in the sequence with status and step | 75 | 25 | 4 | 4 | 15 | F s80 a75 · H s85 a55 · R s25 e14 c12 a5 |
| Filter people by status | 35 | 8 | – | – | 8 | F s30 a25 · H s40 a25 · R s10 e4 c5 a2 |
| Find a person in the sequence | 10 | 6 | – | – | 3 | F s8 a8 · H s10 a4 · R s4 e3 c3 |
| Add people | 50 | 15 | – | 3 | 6 | F s60 a55 · H s65 a35 · R s20 e12 c10 a3 |
| Open the reply in Inbox | 30 | 12 | – | – | 3 | F s35 a30 · H s40 a12 · R s12 e8 c4 |
| Pause one person | 12 | 6 | – | – | 2 | F s12 a10 · H s15 a6 · R s5 e4 c4 |
| Remove one person | 6 | 3 | – | – | 2 | H s8 a4 · R s3 e2 c3 |
| Mark one person finished | 5 | 3 | – | – | 1 | H s6 a3 · R s2 c2 |
| Fix the email and retry a not-sent person | 8 | – | – | – | 5 | F s8 a10 · H s10 a8 · R s3 |
| Move a person to another step | 3 | – | – | – | 1 | H s3 |
| Select several people: pause, resume, finish, remove | 4 | 2 | – | – | 3 | F s5 a6 · H s6 a6 · R s2 c2 |
| Export people (CSV) | 2 | – | 3 | – | 3 | H a4 |
| **Settings** | | | | | | |
| Sending mailbox and today's limit | 5 | 2 | – | – | 6 | F s8 a10 · H s20 a22 · R s2 c2 a2 |
| Sending schedule | 4 | 1 | – | – | 5 | F s4 a5 · H s10 a10 · R s2 c2 a2 |
| Ruleset | 3 | – | – | – | 5 | F s3 a4 · H s5 a6 · R c2 a1 |
| Priority among sequences | 3 | – | – | – | 2 | H s4 a4 |
| Emails per day from this sequence | 3 | – | – | – | 4 | F s4 a5 · H s8 a10 |
| Open and click tracking for this sequence | 2 | – | 3 | – | 2 | – |
| **Results** | | | | | | |
| Results by step and by audience | 10 | 3 | 8 | 2 | 10 | F s10 a15 · H s15 a25 · R s4 m6 c4 a3 |
| **History** | | | | | | |
| Change history (edits, pauses, bounce guard events) | 3 | – | – | – | 10 | F a3 · H s4 a15 |

**Shape check** (60 items; head 20 and above, body 5 to 20, tail under 5; target about 15–25 / 25–35 / 45–60):

| Role at business | Head | Body | Tail | Level one |
|---|---|---|---|---|
| SDR at Meridian | 13 (22%) | 20 (33%) | 27 (45%) | List, open, pause/resume, counts, results strip, pause/resume on the page, steps, open step, people, status filter, add people, open reply; plus the two critical health items |
| Admin at Fathom | 15 (25%) | 18 (30%) | 27 (45%) | The SDR's set less two, plus edit email and agent draft |
| Admin at Halyard | 15 (25%) | 24 (40%) | 21 (35%) | Adds duplicate, sending mailbox, results by step; the fat body is the agency's "same tasks ten times" |
| Admin at Meridian | 7 (12%) | 15 (25%) | 38 (63%) | List, open, counts, results strip, steps, the health items |
| SDR at Ridgeline | 6 (10%) | 8 (13%) | 46 (77%) | List, open, counts, steps, people, add people |

Halyard's SDR head is 16 items (27%), a little over the band; the data file says why. Ridgeline's CS and AE have no head item, which is right: they are not this page's users, and the two critical items stay level one for them.

## 5. Before: the common version

Modelled on Apollo's Sequences. Sources: the Apollo Knowledge Base fetched on 13 September 2026 and `knowledge-base/sources/07-apollo-settings-map.md` ("settings memo"). What no first-party source confirms is marked unverified.

**Layout.** The list has a search box, "Show filters" (folders, status including archived), checkboxes for bulk archive, and a row "…" with Archive ([Archive a Sequence](https://knowledge.apollo.io/hc/en-us/articles/4412852701197); [Folders](https://knowledge.apollo.io/hc/en-us/articles/25616859537165)). List columns: unverified. Team-wide numbers are on a separate Analytics tab ([Report on Sequences](https://knowledge.apollo.io/hc/en-us/articles/9386141889549)). The sequence page is tabbed: steps, Contacts, Report, Settings, Share, and a Health tab that exists only while bounce guard is on ([Create a Sequence](https://knowledge.apollo.io/hc/en-us/articles/4409231193101); [Manage Contacts in Sequences](https://knowledge.apollo.io/hc/en-us/articles/46681725112589); [Manage Mailboxes and Domains](https://knowledge.apollo.io/hc/en-us/articles/39530186410125)).

**Creating.** "Create Sequence" opens a chooser with four tabs: AI-assisted, Template, Clone, From scratch. From scratch asks for a name and a schedule; the ruleset sits behind **Show Advanced Settings** (Create a Sequence). Rulesets "appear in the advanced settings whenever you create or edit a sequence" ([Manage Sequence Rulesets](https://knowledge.apollo.io/hc/en-us/articles/4409396858509)). The builder was redesigned in August 2025 for "a modern design, quicker navigation between steps, and seamless setup for A/B tests" ([Release Notes 2025](https://knowledge.apollo.io/hc/en-us/articles/34072157047309)).

**Steps.** Eight kinds: Automatic email, Manual email, Phone call, Action items, four LinkedIn tasks. The gap between steps is edited through the step's "…" then Edit; a step is added through "More" then "Add a step"; each step is toggled on, then the sequence activated; "If every variant under a step is turned off, Apollo skips the step" (Create a Sequence). A/B is "Add test" on email steps only, plan-gated ([Use an A/B Test](https://knowledge.apollo.io/hc/en-us/articles/4410749683597)).

**Settings.** The Settings tab holds name, folder, tags, owner, schedule and ruleset. The mailbox is not on the sequence: "When you add contacts to a sequence, you choose an email address to use for sending sequence emails" (Create a Sequence). Schedules and rulesets are defined at Settings › Team email & sequences › Sequences, on their own tabs three levels into the settings shell, and applied back on the sequence ([Configure a Sequence Sending Schedule](https://knowledge.apollo.io/hc/en-us/articles/4409477927309)). Priority is team-wide, a "Priority settings" tab with three modes and an allocation percentage per mailbox (settings memo §1.3). Sending limits sit on the mailbox in a drawer four levels deep (settings memo §1.4), and the KB says of the "Sent vs Limit" column: "zoom out on your browser or try scrolling horizontally" ([Configure Email Sending Limits](https://knowledge.apollo.io/hc/en-us/articles/4409233349005)).

**Stats and contacts.** Per-sequence "Scheduled, Delivered, Open, Click, Reply, Interested, Opt out" are percentages "with hover-accessible raw counts" (Report on Sequences). Contact statuses: Active, Paused, Finished, Bounced, Not sent, plus "Not Sent – Blocked Location, Failed, Unknown"; bulk Pause, Resume, Mark as Finished, Remove; removed contacts vanish from the tab (Manage Contacts in Sequences).

**Stopping.** "Deactivating the sequence clears pending scheduled emails and tasks." "Archiving the sequence marks all contacts as finished and permanently deletes their scheduled emails" (Create a Sequence). Whether the dialogs say so: unverified.

| Problem | Rule | Source |
|---|---|---|
| Raw counts only on hover | 4, 7 | Report on Sequences |
| Ruleset behind "Show Advanced Settings"; step added under "More" | 4 | Create a Sequence; Manage Sequence Rulesets |
| Mailbox chosen at enrolment, limit in a settings drawer, no per-sequence cap: the numbers that decide whether an email goes out today are on three screens | 5 | Create a Sequence; Configure Email Sending Limits; settings memo §1.4 |
| Schedule defined three levels into Settings, applied on a tab in the sequence | 2, 5 | Configure a Sequence Sending Schedule |
| Steps, contacts, report and settings on separate tabs | 5 | Create a Sequence |
| A step with all variants off is skipped silently | 7 | Create a Sequence |
| Bounce state on a Health tab, a click away, present only when bounce guard is on | 7 | Manage Mailboxes and Domains |
| Four-tab chooser before an empty sequence | 8 | Create a Sequence |
| Sends ordered "based on prospect score rather than first-in-first-out", with no control on the page | 6 | Release Notes 2025, January |
| "it takes a very technical person to put together your sequencing" | 1 | G2 reviewer via Warmly (secondary) |
| "navigating between campaigns, contacts, and analytics feels like one click too many each time" | 2 | G2 reviewer via SyncGTM (secondary) |
| "Name of the features is a bit confusing to me" | 4 | Capterra reviewer, settings memo §3 |

## 6. After: the disclosed version

**Layout.** List: one table, filters in the toolbar, health inside the status cell. Page: header, Steps, People, then the Results and History doors, stacked, with anchors. No tabs anywhere.

| Role (Meridian) | Level one | Level two |
|---|---|---|
| SDR | List, open, pause/resume, health, counts, results strip, settings strip (values), steps with results, open step, people, status filter, add people, open reply | Change sending settings; results by step; history; columns; the header menu; row and card "…" menus |
| AE | List, open, health, counts, steps, people | The rest; edit controls absent on others' sequences, with the explanation line |
| Admin | List, open, health, counts, results strip, steps | The rest; owner and sharing sit in the header menu |
| Marketer, CS | Read-only list and page by link | Results by step |

Fathom: the SDR set for both people; owner filter, owner field and sharing removed; the agent draft button first in an open email step. Halyard: Duplicate a button on rows and in the header; Mailbox column on; mailbox and daily cap first in the settings door; Results by step open by default for the ops lead. Ridgeline: two sequences, the cold-outbound line, "Customer-safe" in the strip; level two is not removed for a light user, only left closed.

| Door (label) | Content | Container | Persists |
|---|---|---|---|
| Change sending settings ⌄ | Mailbox and today's limit, emails per day, schedule with hours, ruleset with rules, priority, tracking | In place under the strip | Per sequence |
| Open step ⌄ (each card) | Subject, body, variables, agent draft, preview, variants; task note; wait days | In place, in the card | Per step; drafts open step 1 |
| Add people | Search, lists, paste; mailbox; skipped-people preview | Drawer | n/a |
| Results by step and by audience ⌄ | Two tables, export | In place | Yes |
| Change history ⌄ | Dated log | In place | Yes |
| Columns ⌄ | Column checkboxes | Popover | Per user |
| Duplicate, export, archive ⌄ | Three actions; Delete draft when it applies | Menu | n/a |
| Row and card "…" | The visible actions plus the rare ones | Menu | n/a |
| Insert variable ⌄ | The variable list; inserts and closes | Menu inside an open step, not a level | n/a |

No door sits inside a door. Expand all / collapse all cover steps; print expands everything.

**Accelerators.** The shortcuts in 3.7, shown in every menu and the palette. Doors remember their state. New sequence skips any chooser. Duplicate copies steps and settings, never people, and lands on the draft with step 1 open.

**Decision-critical, always visible.** Sending state and who or what paused it. Bounce rate and both thresholds. What Pause, Resume, Archive, Remove and Delete step will do, next to the button or in the dialog with real counts. Today's sent-versus-limit in the strip. Skipped people, by reason, before adding.

**Removed, not hidden.** The four-way creation chooser and templates. Folders and tags (owner filter and search cover finding). Manual email and Action item as step kinds (an email is sent by Ollopa or it is a task; an action item is a Call task with a note). The Health tab (one line in the header). Team-wide "priority by interested rate" and prospect-score send ordering: priority is a per-sequence choice, people go in the order they were added, and the scoring agent may propose but never reorders.

**Score.**

1. Decision-critical visible: sending state, health, consequences, limits, skipped people at level one. **2**
2. Every visible item has a usage number: section 4 and the data file. **2**
3. Two levels on every size; the phone keeps the same doors. **2**
4. Doors labelled by content with chevron and text; menus named by their items or "…" with a text label. **2**
5. Doors adjacent and reachable by keyboard and touch: settings under the strip, editor in the card, results under People. **2**
6. Dependent fields together: mailbox, limit, cap, schedule hours and ruleset rules in one panel; consequence beside the button. **2**
7. State persists per user and per sequence; expand all and print exist. **2**
8. Disclosure by user action or object state (drafts open step 1; auto-paused changes the Resume button); no usage-history reordering. **2**
9. Door opens are logged; the semi-annual promote-keep-delete review reads the data file. **2**

18 of 18 as specified; the reviewer scores the build.

## 7. Lesson steps

A "real" page in this release. If the builder becomes a lesson, the steps, one rule each: rule 7 (bring pause state, bounce thresholds and the archive consequence up from tabs and dialogs), rule 5 (mailbox, limit, cap, schedule and ruleset in one panel beside their values; steps beside the people stuck at them), rule 4 (rename "Show Advanced Settings" and "More" by content; replace hover-only counts with count-and-rate cells), rule 2 (fold the tabs and the Settings round trip into one page with anchors), rule 8 (delete the creation chooser; add shortcuts and expand all).

The rules that mattered most:

- **Rule 7.** Sending state, bounce guard and every destructive consequence are readable without a click.
- **Rule 5.** The five things that decide whether an email goes out today sit in one panel, and each step shows its own results.
- **Rule 4.** No "Advanced", no "More"; counts are never hover-only.
- **Rule 1.** The SDR's daily set (counts, steps, people, add, replies) is the page; building is a door.

## 8. Review

| Check | Result |
|---|---|
| All roles covered | Yes; marketer and CS as by-link readers, since the navigation hides the page from them |
| All four businesses covered | Yes; Fathom removes owner and sharing, Halyard promotes duplicate and mailbox, Ridgeline renames its two sequences and shows the customer-safe rule |
| Every field has a source | Yes; 2.2 lists every addition. Gap found: schedules, rulesets and mailboxes were not in the seed; added as workspace tables |
| Every action has an outcome | Yes; pause, resume, archive, remove, delete step, activate and add people each state it with counts |
| Empty, error, no-access states | Yes, for the list, the page, steps and people |
| Keyboard | 3.7; every shortcut shown in a menu or the palette |
| Phone width | 3.7; same doors, none deeper |
| Decision-critical visible | Two critical items in the data plus the consequence lines |
| Two levels maximum | Yes; the variable menu inside an open step was the risk, closed by making it insert-and-close |
| Doors labelled by content | Yes; the header menu was "More" in the first draft, renamed by its items |
| Dependent fields together | Yes; mailbox limit and sequence cap were in Settings in the first draft, now printed under the mailbox field |
| State persists | Per user and per sequence |
| Accelerators present | Shortcuts, palette, expand all, no chooser |
| Usage shape checked | Five pairs in section 4; Halyard SDR at 27% head is noted |
| Nothing hover-only | Row and card actions on focus and in menus; counts are text |
| Role gaps explain themselves | The header line names the owner and the admin; controls absent, never disabled |
| No usage numbers or teaching text in the product | None; they live in this spec and the data file |
