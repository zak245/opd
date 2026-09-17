# Campaigns

*Page 10 of 14. A "real" page built from the table template, with a campaign detail page. Usage items: `src/ollopa/usage/campaigns.ts`.*

## 1. Purpose

Campaigns is where the marketer sends email to many people at once, collects the people who put their hand up, and watches what came back. Three objects live here. A **form** is a page a visitor fills in; its submissions are enriched, within a daily credit cap, and routed.  An **audience** is a set of people built from lists and segments, with the people who must not be mailed removed. A campaign sends to an audience. An **email campaign** sends once, now or at a scheduled time. A **lifecycle campaign** runs: a trigger (trial day 7, renewal in 60 days, seat usage over 80%) adds people and the campaign mails them while it runs, and it is measured on enrolment over the period rather than on one send.

Who lives here: the marketer, daily, for an hour or two. The RevOps admin, weekly, for sending policy, owners and anything paused. Nobody else has the page in their navigation. The one thing the marketer must never lose sight of: **what is about to go out, to how many people, and what it cost last time** (bounces and unsubscribes). Every other number is a result they can wait for.

## 2. Data

Nothing for this page exists in the seed yet. `businesses.ts` carries `counts.campaigns` (Meridian 12, Ridgeline 8, Fathom 0, Halyard 0). Two interfaces and two arrays must be added to `seed.ts`, generated with the same `rng`.

**The `Campaign` entity is defined here and nowhere else.** Home, the shell's search and Reports read these fields; no other spec redefines the shape. In full:

```
Campaign { id, name, kind: "Email" | "Lifecycle", status, pausedBy, subject, previewText,
           fromName, fromMailbox, audienceId, audienceSize, sendAt, trigger, delayDays, exitRule,
           sent, delivered, bounced, opened, clicked, replied, converted, unsubscribed,
           goal, owner, sendsByDay[], variants[], activity[] }
```

There is no `channel` field: `kind` says whether the campaign sends once or runs on a trigger, and ollopA's campaigns are email. Reports adds exactly two derived fields of its own, `dealsCreated` and `pipelineAmount`, and reads the rest from here.

| Field | Shown where | Source |
|---|---|---|
| `Campaign.id, name, kind ("Email" \| "Lifecycle")` | List, detail header | New. Names from a fixed list: "Q4 launch announcement", "Webinar: pipeline hygiene", "Pricing update"; lifecycle: "Trial day 7 nudge", "Renewal 60 days out", "Seat limit reached" |
| `status` (Draft, Scheduled, Sending, Sent, Running, Paused, Archived) and `pausedBy` (user, bounce guard) | Status badge | New. Meridian: 2 drafts, 1 scheduled, 6 sent, 2 running, 1 paused by bounce guard. Ridgeline: 6 running, 1 paused, 1 draft |
| `subject, previewText, fromName, fromMailbox` | List second line, detail content | New; mailbox `marketing@<domain>` |
| `audienceId, audienceSize` | List, detail audience block | New; size copied at send time |
| `sendAt`; `trigger, delayDays, exitRule` (lifecycle) | Send and Trigger columns, detail | New, via `dateAhead` / `dateBack` |
| `sent, delivered, bounced, opened, clicked, replied, converted, unsubscribed` | Metric cells, detail funnel | New. Delivered 96–99.5%, opened 22–55%, clicked 2–9%, replied 0–3%, converted 0.5–6%, unsubscribed 0.1–0.8%; one Meridian campaign bounced 6.2%, above the 6% pause threshold, so it shows the paused-by-guard state |
| `goal` (Booked demo, Started trial, Renewed, Added seats) | Converted cell | New |
| `owner` | Owner column | `b.roles` users |
| `sendsByDay[]` (30 days, lifecycle), `variants[]` (0 or 2), `activity[]` | Detail doors | New; two Meridian campaigns have A/B variants |
| `Audience.id, name, type ("Static" \| "Segment"), size, lastRebuilt, sources[]` | Audiences view | New. Meridian 6, Ridgeline 5. Sources name Lists page lists ("Webinar attendees, August") or segment text ("Trial day 7–14"). A list that feeds itself is owned by Lists: the audience shows a read-only line, "Fed by Q4 enterprise outbound · new matches added automatically", linking to that list, and the switch that turns the feed off lives there ([04 Lists](04-lists.md)) |
| `suppressed: {unsubscribed, bounced, customers, openDeals, closedLost, inSequence}` | Audiences view, detail | New. Six counts, not three. **Unsubscribed and bounced are always applied** and are marked so; **customers, open deals, closed-lost and in-sequence are the four the marketer chooses**, and each shows whether it is on. `inSequence` and `openDeals` are counted from `seed.contacts` and `seed.deals` |
| `Audience.mode: "live" \| "frozen"`, `refreshAt`, `frozenAt`, `feeds` | Audiences view, detail | New. A live audience keeps matching and keeps adding people to the campaign it feeds. Meridian: 4 live, 2 frozen. Ridgeline: all 5 live |
| `Form { id, name, status, fields[], enrichOnSubmit, enrichCapDaily, enrichUsedToday, matched, submissions7d, routesTo, reportsTo, lastSubmission, unrouted }` | Forms view, form record | New. Meridian 4 forms, Ridgeline 6, Fathom and Halyard none. A field is marked `asked` or `enriched` with its credit cost |
| `usedBy` | Audiences door | Derived from campaigns |
| Policy line: bounce guard thresholds, the observed bounce rate, daily cap and used | Above the table | The thresholds are one pair for the whole product, owned by Settings (`mail.bounce-guard`): warn at 4%, pause at 6%, adjustable by the admin. This page reads them and prints the observed rate beside them; it never carries a number of its own. Cap and used are new (Meridian 10,000 / 3,400; Ridgeline 4,000 / 900) |

Fathom and Halyard get empty arrays. Recipients are sampled from `seed.contacts`.

## 3. Features

**Shown.** A view switch, "Campaigns 12 · Audiences 6 · Forms 4", above one table. Level-one columns for the Meridian marketer: Campaign (name, kind, subject on a second line), Status, Audience (name and size), Delivery (sent, delivered %, bounced count and rate, marked when it passes the workspace's warn threshold), Opened %, Clicked %, Replied, Converted (count and goal), Unsubscribed, Send (scheduled, last or next send). Rates carry their count in muted text; nothing is hover-only. Above the table, one line: "Bounce guard: warn 4%, pause 6% · observed 0.8% this week · 3,400 of 10,000 sends used today · mail.meridian.io healthy". The two thresholds are the workspace's, set in Settings; the 0.8% is what actually happened. Audiences view columns: Audience, Type, Mode, Size, Net size, Suppressed (six counts), Last rebuilt, Used by. Forms view columns: Form, Status, Submissions 7 days, Enrichment spend against the cap, Routes to, Reports to, Last submission.

**Row actions** depend on status (object state, rule 6), appear on hover and focus, and repeat in the row menu, which is named for what it holds: "Open, duplicate, compare, export results, archive, delete draft". Draft: Edit, Send test. Scheduled: Pause (holds the send, keeps the time), Send test. Sending or Running: Pause. Paused: Resume (if the kept time has passed, Resume asks for a new one). Sent: Duplicate. The menu adds Open, Duplicate, Compare with…, Export results, and below a divider Archive and, for drafts, Delete draft, whose confirmation reads "Deletes the draft and its test sends. Sent campaigns are archived, never deleted." **Archiving asks for one line** and writes it to the campaign's Notes and to its row in Reports: "Retired 14 Sep 2026 by Jonas Weber — audience overlapped with the trial nudge." Results are kept. Twice a year somebody asks why a campaign stopped, and a date with no reason cannot answer (rule 8).

**Bulk.** Pause, Resume, Archive, Change owner (admin; the marketer sees "Change owner: Daniel Okafor can do this"). The shared table behaviours — sortable headers, the columns popover, the bulk bar, skeleton loading, row actions on focus — are specified once in [02 People](02-people.md); this spec records only its deltas.

**Page actions.** "New campaign" (primary) asks Email or Lifecycle, then opens a draft detail page. "New audience" opens a draft: name, pick lists, add segment filters, mode (live with a cadence, or frozen), with size, net size and the six suppressed counts updating as you pick. "New form" opens a form draft.

**Hand to sales**, on an audience. It writes the people to a named sales-owned list and states the consequence **before** the click: "Adds 42 people to 'Marketing-qualified, September', owned by Marcus Adeyemi. Nothing is sent. Marcus decides what happens next." The marketer never reaches the sequence enrolment panel — that is the SDR's seat, and the line says so rather than leaving a dead control (rule 4, seat gaps explain themselves).

**Filters and search.** Search on name, subject and audience. Level-one filters: Status, Kind. A door named for its contents, "Additional filters: owner, audience, date, goal (n)", ends the filter row and carries the count of active ones. "More" names nothing and is not used anywhere in the product (PLAN.md, door labels, 14 September 2026). Sort by any header; it persists.

**Columns.** A door at the end of the header row, named for what it holds: "Columns: owner, trigger, last send, from, tags, created (6)". Choices persist per user. At Ridgeline, Trigger and Last send are default and Send is not, so the door reads "Columns: owner, from, tags, created, send (5)".

**Campaign detail** at `/ollopa/campaigns/<id>`, a page with a breadcrumb back. Header: name, kind, status with reason, owner, the row's actions in the same order. Body: Results (sent → delivered → opened → clicked → replied → converted, count and rate each; bounced and unsubscribed on the same line), then, for an event or link-goal campaign, one level-one line under Results — **"Build an audience from: attended 212 · did not attend 84 · hand-raisers 31"**, each one click to a pre-filled audience, because the reason to read the result is to act on it. Audience (name, **mode and refresh cadence with Freeze**, total size, net size, the **six suppressed counts** with the two always-applied ones marked, every count a link into the records panel, "Open audience"), Content (subject, preview text, from, and **the desktop and 400 px previews side by side**, not one behind a menu — a marketer compares them, and a comparison across a menu is the split rule 5 forbids), then Schedule (time, timezone, send speed) for email or Trigger (trigger, delay, exit rule, and the line "Measured on enrolment over the period") for lifecycle.

The **QA line** sits directly above the Schedule button, never disabled and never blocking: **"QA: 2 checks failed — merge fields, plain-text version. Run 14:02 by Jonas Weber, who built this campaign"**, or **"QA not run"**. It travels with a request for approval, so the approver sees it too. A send is the sender's decision; the page's job is to make sure nobody makes it blind.

**While Sending**, the row and the detail do not show the same columns as a finished send. They show **sent-so-far against the total**, the **observed bounce rate against both thresholds** (warn 4%, pause 6%), and **Pause the same size as Schedule**. A send in flight is the one moment the page has a safety state, and the columns of a completed send hide it. Below, the doors listed in §6, one level deep; "Recipients" opens a drawer with a per-person table. Doors that do not apply are removed. At Ridgeline "Sends by day" is open by default, directly under Results.

**Send test** is a small dialog: recipient (yours, prefilled), variant if any, Send. The test carries a working "test unsubscribe" link that unsubscribes nobody. The toast names the mailbox.

**Schedule** is a dialog: date, time, timezone (workspace default or each recipient's local time), send speed, and a summary "Sends to 1,240 people from marketing@meridian.io on Tue 16 Sep, 09:00 CET" with the suppressed counts. **The sender approves their own send.** There is no queue for ordinary work: a marketer schedules their own campaign, and the QA line and the suppression counts are what makes that safe. Above the workspace's second-approval threshold — a Settings item, default 1,000 recipients or 500 credits in one action — the button reads "Request approval", the dialog states what the approver will see, and the row shows "Awaiting approval: Daniel Okafor". The threshold is read from Settings, never written here, and the number in the dialog is the workspace's current one.

**The audience record.** Level one, above everything else: **total size, net size after suppressions, and the six counts on one line** — "1,412 total · 1,240 after suppressions · unsubscribed 84 and bounced 21, always applied · customers 42 · open deals 18 · closed-lost 7 · in sequence 0, off". Every one of those numbers is a link that opens the records panel, titled by the number, so "42 customers" can be read as forty-two names in one click. The door beside them, "Suppression rules: customers, open deals, closed-lost, in sequence (4 applied)", holds the rules and the uploaded suppression list — the rules, not the counts. A count behind a door is a count nobody checks before a send.

Beside the size, the audience's mode, in words: **"Mode: live · refreshes daily 06:00 · new matches are added to Q4 launch announcement · Freeze"**, or **"Frozen at 1,240 on 12 Sep"**. Off is one click. A live audience that keeps mailing new people is a commitment the marketer made once and must be able to see every time (rule 7), and which campaign the new matches land in belongs beside the cadence that finds them (rule 5).

An audience also carries "Built for: Q4 launch announcement" as a link where one campaign owns it; the campaign's brief lives in that campaign's Notes, which is what Notes is for.

**Pre-send QA (`X-qa`).** A flat panel on the campaign record — no doors inside it — holding eight checks, each pass, fail or not run:

1. Every merge field resolves for every recipient. 2. Every link works and is tracked. 3. The unsubscribe link is present and points at the workspace footer. 4. The plain-text version exists. 5. The from mailbox is warmed and under its daily cap. 6. The subject renders under 60 characters on a phone. 7. The audience's suppressions are applied and its mode is what the sender expects. 8. No recipient has had another campaign in the frequency-cap window.

Each failure is stated **in words** — "3 of 1,240 recipients have no first name; they will read 'Hi ,'" — with a **Fix** link that navigates to the thing that is wrong. Nothing is a red dot. The panel's last line names **who ran the checks and when**, and says so when the runner is the person who built the campaign: "Run 14:02 by Jonas Weber, who built this campaign."

**Forms (`R-form`).** A form is a record from the shared template. Its sections:

- **Fields.** Each one marked **asked** or **enriched (2 credits)**. A field already known for a returning visitor is **removed from the form, not pre-filled invisibly**, and the form tells the visitor in one line: "We already have your company and role." Silently posting data the visitor did not see is not disclosure.
- **Enrichment**, level one and decision-critical: **"Enrichment cap 400 credits a day · 312 used today · 46 of 61 submissions matched"**. At the cap, enrichment stops and **submissions are still accepted and still routed**, marked "not enriched — daily cap reached 15:40" on the person and on the run row, with **"Raise the cap"** beside it. A form that starts refusing people because a credit budget ran out is a form that loses the pipeline it exists to collect.
- **Routing**, with the rule that decides and the count that **could not be routed**, never behind a door.
- **Reporting**: which campaign or report the submissions count towards.
- The submission's answers become a note on the contact titled "Form: Demo request, 14 Sep", shown at level one while the contact is pre-first-touch, not behind the history door.

**States.** Empty (Fathom, Halyard): "No campaigns yet. A campaign sends one email to an audience built from your lists. Start with an audience, or create an email campaign." with both buttons; Halyard adds "This workspace has no marketing domain. Ravi Sethi can add one in Settings › Email sending." Loading: eight skeleton rows and a skeleton policy line. Error: "Results didn't load. Showing last night's snapshot." with Retry; actions stay enabled. No results: the template's "Nothing matches" row. No access (SDR, AE, CS): "Campaigns is for marketers and admins. At Meridian, Jonas Weber and Daniel Okafor can see it." A deleted audience shows "Audience removed; 1,240 people at send time".

**Keyboard.** Arrows move through rows; Enter opens; `p` pauses or resumes with the same confirmation as the click; `n` new; `/` search; `a` and `c` switch views; `t` sends a test from the detail; `?` lists shortcuts; Escape closes dialogs and drawers. Menu items show their shortcut.

**Accessibility.** Status is text plus colour. Doors are buttons with `aria-expanded`; hidden content uses `hidden="until-found"` so find-in-page works. The drawer traps and returns focus. Row action buttons stay in the DOM.

**Phone width.** Rows become cards: name, status, audience size, opened, clicked, converted, unsubscribed, and an always-visible action button carrying the same named list as on desktop ("Open, duplicate, compare, export results, archive, delete draft"). The filter row collapses into one door, "Filters and columns (2 active)". The detail stacks; the drawer becomes a sheet. Nothing on desktop is missing on the phone.

**By role and business.** The marketer sees every campaign and does everything except change owners and sending policy; the page names who can. The admin has Owner and the Owner filter at level one. Meridian: Send, Schedule and Send test at level one. Ridgeline: Trigger, Last send and Sends by day at level one; Schedule and Duplicate behind the row menu. Fathom and Halyard: the empty state, admin only.

## 4. Usage items

Numbers are the share of active users in the role touching the item weekly (USAGE-MODEL.md). Baseline is Meridian. Level one is 20 or above, or critical (★, rule 7). Fathom and Halyard have no campaigns and no marketer seat: `weeklyUse` returns zero for a seat a business has not declared (`SEATS` in `usage/model.ts`), so no first screen is ever computed for a marketer there, and the admin's numbers are 0–5. Seven critical items stay level one over the empty table. SDR, AE and CS have no access. M = Meridian, R = Ridgeline.

Two marks changed in this pass, to keep rule 7 to what it covers — price, fees, commitment, destructive consequences, how data is used, safety state. Status and Audience are no longer marked critical: they are head items for the marketer anyway (95 and 80), and the obligation they were carrying belongs to the send dialog and the audience block, which name the recipients, the mailbox, the time and the suppressions before anything goes out. Delete draft gains the mark, because every other destructive action in the product carries it.

| Item | Marketer M | Admin M | Marketer R |
|---|---|---|---|
| **List** | | | |
| Campaign name, kind and subject | 95 | 30 | 95 |
| Status | 95 | 30 | 95 |
| Audience and size | 80 | 15 | 80 |
| Sent, delivered, bounced ★ | 85 | 25 | 85 |
| Opened and clicked | 85 | 10 | 85 |
| Replied | 35 | 5 | 25 |
| Converted with goal | 75 | 20 | 90 |
| Unsubscribed ★ | 45 | 20 | 45 |
| Scheduled or next send | 60 | 10 | 30 |
| Lifecycle trigger | 15 | 4 | 80 |
| Last send | 15 | 6 | 35 |
| Owner | 12 | 25 | 12 |
| From name and mailbox | 4 | 10 | 4 |
| Tags | 3 | 2 | 3 |
| A/B variant marker | 4 | 0 | 3 |
| Created and last edited | 3 | 3 | 3 |
| **Views** | | | |
| Campaigns / Audiences view | 40 | 10 | 40 |
| Search | 40 | 20 | 40 |
| Status filter | 45 | 20 | 45 |
| Kind filter | 12 | 5 | 3 |
| Owner filter | 4 | 22 | 4 |
| Date range | 4 | 8 | 4 |
| Audience filter | 3 | 0 | 3 |
| Sort by column | 18 | 8 | 18 |
| Choose columns | 3 | 3 | 3 |
| Compare two campaigns | 4 | 0 | 4 |
| **Actions** | | | |
| Open campaign | 90 | 30 | 90 |
| New campaign | 25 | 4 | 12 |
| Edit draft | 45 | 4 | 25 |
| Send test | 30 | 3 | 15 |
| Schedule send | 30 | 3 | 8 |
| Pause or resume ★ | 12 | 8 | 12 |
| Duplicate | 15 | 2 | 6 |
| Archive | 4 | 4 | 4 |
| Delete draft ★ | 3 | 1 | 3 |
| Bulk pause, archive, change owner | 3 | 6 | 3 |
| Export results | 4 | 5 | 4 |
| Second approval above the Settings threshold | 10 | 12 | 3 |
| **Detail** | | | |
| Results funnel | 90 | 25 | 90 |
| Audience, size, suppressed ★ | 60 | 15 | 60 |
| Subject, preview, from, body | 70 | 8 | 70 |
| Schedule, timezone, speed | 25 | 6 | 15 |
| Trigger, delay, exit rule | 15 | 4 | 70 |
| Sends by day | 15 | 4 | 55 |
| Recipients | 18 | 5 | 18 |
| Links clicked | 15 | 2 | 15 |
| A/B variant results | 4 | 0 | 3 |
| Goal and attribution window | 12 | 4 | 12 |
| Activity log | 4 | 10 | 4 |
| Tracking, reply-to, unsubscribe text, footer | 4 | 4 | 4 |
| Resend to non-openers | 4 | 0 | 4 |
| Send in recipient's timezone | 3 | 0 | 3 |
| Inbox placement test | 3 | 4 | 3 |
| Plain-text version | 3 | 0 | 3 |
| Notes | 2 | 2 | 2 |
| Push results to CRM | 4 | 6 | 4 |
| **Audiences** | | | |
| Audience name, type, size, rebuilt | 50 | 10 | 50 |
| Source lists and segment filters | 15 | 4 | 15 |
| Suppressed: six counts, two always applied, four chosen ★ | 45 | 15 | 55 |
| Live or frozen, the refresh cadence, and what it feeds ★ | 45 | 8 | 60 |
| New audience | 12 | 2 | 12 |
| Rebuild now | 12 | 2 | 12 |
| Campaigns using this audience | 15 | 4 | 15 |
| Upload a suppression list | 4 | 3 | 4 |
| Frequency cap per person | 4 | 5 | 4 |
| Delete audience | 2 | 1 | 2 |
| **QA** | | | |
| Run the eight pre-send checks | 55 | 8 | 60 |
| The failures in words, each with a Fix link ★ | 35 | 6 | 40 |
| Who ran the checks and when | 30 | 10 | 30 |
| **Forms** | | | |
| Form row: status, submissions, spend, routes to, reports to | 25 | 10 | 85 |
| Submissions in the last 7 days | 25 | 10 | 90 |
| Enrichment cap, used today, and how many matched ★ | 18 | 12 | 75 |
| Submissions that could not be routed ★ | 15 | 10 | 45 |
| Where submissions go, and the rule that decides | 12 | 12 | 50 |
| Field editor: each field marked asked or enriched (n credits) | 10 | 4 | 35 |
| **Policy** | | | |
| Bounce guard thresholds (warn 4%, pause 6%) with the observed rate ★ | 15 | 30 | 15 |
| Daily send cap and used | 12 | 15 | 12 |
| Marketing domain health | 4 | 20 | 4 |
| Consent rules by region | 3 | 4 | 3 |

**Shape check** (79 items, computed from the file with `shape()`):

| Pair | Head ≥20 | Body 5–20 | Tail <5 | Level one |
|---|---|---|---|---|
| Meridian, marketer | 29 (37%) | 23 (29%) | 27 (34%) | 33 |
| Meridian, admin | 13 (16%) | 33 (42%) | 33 (42%) | 20 |
| Ridgeline, marketer | 33 (42%) | 17 (22%) | 29 (37%) | 36 |
| Fathom or Halyard, admin | 0 | 1 | 78 | 11, all critical, over an empty table |

The admin fits the target shape, and moves further into it as the page grows: the QA panel, the audience mode and the forms are the marketer's work, not hers.

The marketer's head is above the 25% target and moved further above it in this pass, from 33% to 37% at Meridian and from 33% to 42% at Ridgeline. The cause is one thing: the page gained the pre-send QA panel, the live-or-frozen mode and the forms object — three pieces of the marketer's daily work that previously existed in no spec. Ridgeline is the extreme because it is a product-led business, where the form is where the pipeline starts and the form row is read every day; Meridian's marketer has four forms and checks them weekly, so every Forms baseline there is about half the Ridgeline number.

This is stated, not fitted. Hiding a daily item to make a curve look right is exactly the failure rule 1 describes, and the page did not get deeper as it got wider: the QA panel is flat, the six suppression counts came **out** of a door onto the audience record, and the previews came out of a menu onto the page. The one honest concession is that Ridgeline's marketer now has a very wide first screen, and the twice-yearly review named in §6 is where items get deleted rather than re-rated.

The eleven that stay level one on Fathom's and Halyard's empty tables are the delivery cell, unsubscribes, pause or resume, delete draft, the audience block, the six suppressed counts, the audience mode, the QA failures, the enrichment cap, the unrouted count and the bounce guard line.

## 5. Before: the common version

**Apollo has no campaigns product.** Its knowledge base uses "campaign" to mean a sequence: "Sequences are outreach campaigns that sales teams use to reach out to contacts over a planned period of time" ([Sequences Overview](https://knowledge.apollo.io/hc/en-us/articles/4409237165837), 13 Sep 2026). "Marketing" appears in three places: a **Marketing domains** sub-page under Settings › Email setup and health (KB screenshot; contents unverified, `07-apollo-settings-map.md` §1.3); the SendGrid and Mailgun integrations, for teams that "already actively use SendGrid for transactional or marketing emails" ([Configure SendGrid](https://knowledge.apollo.io/hc/en-us/articles/4414449230093), 8 Jul 2026); and a Workflows action, "Create Email Marketing Campaign", that hands the job to Mailchimp, Brevo and thirty other tools ([Workflow Integrations](https://knowledge.apollo.io/hc/en-us/articles/46233304897933), 13 Aug 2026). A "marketing sequence" type could not be found: unverified. So the common version is Apollo's sequence page and Workflows where they apply, and HubSpot Marketing Email where Apollo has nothing.

**Layout and depth.** Main nav › Sequences: a table with folders, tags and "Show filters". Open a sequence: tabs Contacts, Report, Diagnostics, Activity, Settings. Results are on the Report tab, one level down, and only after sends: "Apollo doesn't generate a report for inactive sequences with no email deliveries". Counts are hover-only: "Hover over the percentage to see the total number of opens" ([Report on Sequences](https://knowledge.apollo.io/hc/en-us/articles/9386141889549), 10 Sep 2026). Team numbers live on another page, Emails › Analytics, and "Metric availability varies by analytics surface … may show different metric sets" ([Email Analytics](https://knowledge.apollo.io/hc/en-us/articles/4425592135821), 21 Jul 2026). A G2 reviewer via SyncGTM: "navigating between campaigns, contacts, and analytics feels like one click too many each time" (secondary).

**Audience.** None. People are added per sequence from search, list, CSV or workflow, choosing a mailbox each time: "Sequences don't have a single mailbox setting" ([Add Contacts](https://knowledge.apollo.io/hc/en-us/articles/4409396985741), 4 Sep 2026). Suppression is a warning at enrolment, per batch.

**Send test.** Four steps in another area: "Save your sequence email as an email template. Go to Emails > Templates. Select the template you just created. Click Send test email to me" ([Create a Sequence](https://knowledge.apollo.io/hc/en-us/articles/4409231193101), 1 Sep 2026). And "Unsubscribe links don't work in test emails" ([Unsubscribe Link](https://knowledge.apollo.io/hc/en-us/articles/4409140379661), 28 Aug 2026).

**Schedule.** On the enrolment dialog ("Click Schedule to add the contacts at a specific date and time", Add Contacts). A workflow's start time "is based on your device's timezone and not the timezone of the people or companies" ([Create a Workflow](https://knowledge.apollo.io/hc/en-us/articles/4413804036109), 11 Sep 2026).

**Pause.** Per contact: sequence › Contacts › check rows › "Pause Sequence" ([Manage Contacts](https://knowledge.apollo.io/hc/en-us/articles/46681725112589), 18 Aug 2026). A whole-sequence pause exists; its path is undocumented: unverified.

**Lifecycle.** The renewal use case needs five objects in four areas: a sequence, a list, a CRM custom field, an Apollo custom field mapped to it, and a workflow with a true/false branch, then a Settings tab for re-enrolment ([Renewal Notifications](https://knowledge.apollo.io/hc/en-us/articles/14062758984717), 30 Jul 2026). Workflows "are private by default". A G2 reviewer via Warmly: "it takes a very technical person to put together your sequencing, workflows" (secondary).

**Labels and gating.** "Click Show Advanced Settings to choose a sequence ruleset" (Create a Sequence): an audience label. Unsubscribe text is per user under Settings › Profile › Email settings, paid plans only; links "expire 47 days after you send the email" (Unsubscribe Link). A/B tests are plan-gated ([A/B Test](https://knowledge.apollo.io/hc/en-us/articles/4410749683597), 18 Aug 2026). "Click metrics are available on some Apollo plans" and Apollo "doesn't identify which link was clicked" (Email Analytics). Bot opens need an "Include bots" toggle per report. Inactive sequences auto-archive after six months, found again only via Show filters › Status › Archived ([Archive a Sequence](https://knowledge.apollo.io/hc/en-us/articles/4412852701197), 18 Aug 2026).

**HubSpot, where Apollo has nothing.** Marketing › Email has Manage, Analyze and Health tabs and Drafts, Scheduled, Sent status tabs; each email's results are five more tabs ([Analyze](https://knowledge.hubspot.com/marketing-email/analyze-your-marketing-email-campaign-performance)). The editor is five icons; "Send test email" sits inside a "Preview and test" dropdown; unengaged contacts are suppressed by default, "recipients who haven't opened your last 11 marketing emails" ([Create and send](https://knowledge.hubspot.com/marketing-email/create-and-send-marketing-emails), 14 Jul 2026). Stopping is asymmetric: a processing email is cancelled from Actions › "Cancel processing" on its performance page, a scheduled one by opening the editor's Schedule tab and choosing "Send now"; "Once an email is finished processing and has been sent, it can no longer be canceled" ([Cancel](https://knowledge.hubspot.com/marketing-email/can-i-cancel-a-sent-or-scheduled-email-send-in-hubspot), 20 Apr 2026). Community threads report users unable to find the cancel control ([HubSpot Community](https://community.hubspot.com/t5/Email-Marketing-Tool/Cancel-scheduled-e-mail/m-p/425185)).

**The problems, in one list.** Results one level down, split across three surfaces with different metrics. Counts on hover. No audience object. Send test four steps away and untestable for unsubscribe. Pause per contact; cancel path unlike the send path. Lifecycle needs five objects. An audience-labelled door. Safety state in Settings, not where sends happen. Plan gates on clicks and A/B.

## 6. After: the disclosed version

**Layout.** One page, one table, one view switch across three objects (Campaigns · Audiences · Forms), a policy line above. Level one for the Meridian marketer is the ten columns and six actions in §3; the admin swaps Replied, Opened/Clicked and Send for Owner and the Owner filter. At Ridgeline the marketer gets Trigger and Last send in place of Send, and the detail opens "Sends by day". At Fathom and Halyard only the critical items remain: the policy line and the empty state.

**Doors and containers.**

| Door label | Where | Container | Notes |
|---|---|---|---|
| Additional filters: owner, audience, date, goal (n) | End of filter row | In place | Removed under six rows; carries the count of active filters |
| Columns: owner, trigger, last send, from, tags, created (6) | End of header row | Popover | Contents and count change by business |
| Open, duplicate, compare, export results, archive, delete draft | Each row, on a "…" button whose accessible name is that list | Menu | The visible actions for the row's status plus the rare ones. No door in this product is called "More actions" |
| Sends by day (30 days) | Detail | In place | Open by default at Ridgeline |
| Recipients (1,240) | Detail | Drawer | Per-person table; header stays in view |
| Links clicked (6) | Detail | In place | Removed when no links |
| Variants A and B | Detail | In place | Removed when none |
| Goal and attribution window | Detail | In place | |
| Delivery settings: tracking, reply-to, unsubscribe text, footer | Detail | In place | Unsubscribe text and its permission stay together (rule 5) |
| Resend to people who did not open | Detail | In place | Removed unless Sent |
| Activity (14), Notes | Detail | In place | |
| Suppression rules: customers, open deals, closed-lost, in sequence (4 applied) | Audience record | In place | Holds the **rules** and the uploaded suppression list. The six **counts** are level one on the record, not in here |
| Campaigns using this audience (3) | Audience row | Expandable row | |
| Pre-send checks (8) | Campaign record | Panel, flat, no doors inside | Opened by "Run the checks"; its one-line result stays at level one above Schedule |
| Fields (7): 5 asked, 2 enriched | Form record | In place | The credit cost per enriched field is on its row |
| Filters and columns (2 active) | Phone only | Sheet | One door replacing two |

Every door: chevron plus text, a count where there is one, next to what it reveals, keyboard and touch. Inapplicable doors are removed, never disabled.

**Persistence.** View, sort, columns, filters and every door's state persist per user and business. "Expand all" and "Collapse all" head the detail's doors; print expands everything.

**Accelerators.** The shortcuts in §3, shown in every menu. A "keep results doors open" preference. Duplicate keeps audience, content and schedule and resets results.

**Decision-critical, always visible.** Sent, delivered and bounced with the observed rate beside the workspace's two thresholds (warn 4%, pause 6%, owned by Settings); unsubscribed; the six suppression counts on the audience record, with the two always-applied ones marked; whether the audience is live, how often it refreshes and which campaign it feeds; the QA line above Schedule; while a campaign is Sending, sent-so-far against the total with Pause the same size as Schedule; a form's enrichment cap, what is used today and how many submissions matched; the count of submissions that reached nobody; the daily cap and what is used; Pause beside Schedule with the same number of clicks; the schedule summary naming recipients, mailbox, time and who must approve when the send is above the threshold; what Delete draft does, on the item. Status and audience size are on the row too, as head items rather than as rule 7 obligations.

**Removed rather than hidden.** The Report tab. The second and third analytics surfaces (one metric set, defined once). "Include bots" (scanner opens always excluded; the funnel says "excludes 214 scanner opens"). Send test via templates. Per-user unsubscribe text (workspace text, read-only in Delivery settings with "Daniel Okafor can change it"). Folders. Auto-archive by inactivity (nothing moves on its own, rule 6). The device-timezone trap (the dialog names the timezone it will use). Apollo gates click metrics and A/B tests by plan; ollopA's plan table gates seats, mailboxes, teams and permission profiles, agents, reports, CRM sync, SSO and the API, and campaign results are on every plan — so those two gates are removed rather than reproduced. HubSpot's "Preview and test" dropdown: the desktop and phone previews sit side by side instead. Invisible pre-fill on a form: a field already known is removed and the visitor is told.

**Score.**

1. Decision-critical visible without interaction: 2. Status, audience size, bounces, unsubscribes, policy line, pause.
2. Every visible item backed by a usage number with a source: 2. All 79 items in `campaigns.ts`. The marketer's head is above the target band and rose in this pass; §4 states it with its cause rather than re-rating a daily item downwards.
3. No path over two levels on any screen size: 2. List → door; detail → door; the QA panel and the records panel hold no doors; the phone merges two doors into one. Three things moved up a level in this pass — the suppression counts, the phone preview and the QA result — and none moved down.
4. Doors labelled by content with chevron and text: 2. Every door names its contents and carries a count where there is one; the row menu's accessible name lists what is in it, so nothing in this page is called "More actions".
5. Doors adjacent, keyboard and touch: 2. Column door in the header row, filter door in the filter row, detail doors under the block they extend.
6. No dependent information split: 2. Sent/delivered/bounced in one cell; size with suppressed; time with timezone and speed; unsubscribe text with its permission.
7. State persists; expand-all and print: 2.
8. Disclosure by user action or object state only: 2. Row actions by status; nothing reorders by history.
9. Door usage instrumented with a scheduled review: 1. The review is scheduled twice a year from the usage file; the demo has no instrumentation.

Total 17 of 18.

## 7. The rules that mattered most

- **Rule 7.** The bounce guard's two thresholds and the observed rate, audience size and unsubscribes moved from Settings and the Report tab to the row and the policy line; Pause got the same path as Schedule. The second approval on a large send is one setting, read here and shown with the consequence, instead of a number invented on this page.
- **Rule 1.** Results moved from a tab to the row: 85–95% of marketers read them weekly; under 20% open recipients or links.
- **Rule 5.** Sent, delivered and bounced became one cell; size and suppressed one block; time, timezone and speed one dialog.
- **Rule 2.** Three analytics surfaces became one page and one door; the lifecycle campaign became one object instead of five.
- **Rule 4.** "More filters" became "Additional filters: owner, audience, date, goal (n)", the suppression door became "Suppression rules … (4 applied)", and a QA failure is a sentence with a link that navigates rather than a coloured dot.

## 8. Review

| Check | Result |
|---|---|
| All roles | Marketer and admin have the page; SDR, AE and CS get a no-access page naming who can (gap: the shell's text was generic; closed in §3) |
| All four businesses | Meridian and Ridgeline have data and different level-one sets; Fathom and Halyard the empty state (gap: Halyard has no marketing domain; closed by the empty state's second line) |
| Every field has a source | §2 |
| Every action has an outcome | §3; Resume on an expired schedule asks for a time (gap found and closed) |
| One approval policy | Gap: the page hard-coded a second approval above 5,000 recipients. Closed: the threshold is a Settings item (default 1,000 recipients or 500 credits in one action); the sender approves ordinary sends; the dialog states what the approver will see |
| One bounce guard pair | Gap: the page marked a bounce cell red "above 4%" without naming the pause threshold or where the numbers come from. Closed: warn 4% and pause 6%, owned by Settings, printed with the observed rate |
| One Campaign entity | Gap: Reports and Home carried different shapes. Closed: the entity is defined in §2 and read elsewhere; Reports adds only `dealsCreated` and `pipelineAmount` |
| Empty, error, no-access | §3 |
| Keyboard | Rows, doors, dialogs; shortcuts shown in menus |
| Phone width | Cards, one merged door, sheet drawer; content parity |
| Decision-critical visible | Nine items in §6 |
| Two levels maximum | Counted per channel; the drawer holds no doors (gap: an early draft put "Links clicked" inside the drawer; moved to the page) |
| Doors labelled by content | Yes, with counts |
| Dependent fields together | Four pairs in §6 |
| State persists | Per user and business |
| Accelerators | Shortcuts, expand-all, keep-open preference, duplicate |
| Usage shape | Four pairs recomputed in §4 after ten items arrived; the marketer's head rose to 37% at Meridian and 42% at Ridgeline, stated with its cause and not fitted |
| Suppressions | Gap: the audience showed three counts and said nothing about which rules were on or whether they were optional. Closed: six counts at level one, the two always-applied ones marked, the rules behind a door named "(4 applied)", and every count a link into the records panel |
| Live audiences | Gap: nothing said whether an audience kept adding people to a running campaign. Closed: the mode, the cadence and the campaign it feeds sit together at level one with Freeze beside them |
| Pre-send QA | Gap: no QA existed anywhere in the specs; a marketer could schedule to 1,240 people with broken merge fields. Closed: `X-qa`, eight checks, failures in words with Fix links, the runner named, and a line above Schedule that never disables it |
| Forms | Gap: forms are inside the boundary as of 15 Sep 2026 and belonged to no spec. Closed: a third object on this page, with the enrichment cap, what is used, what matched and what could not be routed all at level one, and submissions still accepted at the cap |
| Sending state | Gap: a campaign in flight showed a finished send's columns. Closed: sent-so-far against the total, the observed bounce rate against both thresholds, and Pause the same size as Schedule |
| Nothing hover-only | Row actions also on focus and in the menu; counts printed |
| Role gaps explain themselves | Change owner, sending policy, unsubscribe text and the Halyard domain each name the person |
| No usage numbers or teaching text in the product | The page shows row and result counts only; numbers and sources stay in this file and the usage file |
