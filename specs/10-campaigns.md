# Campaigns

*Page 10 of 14. A "real" page built from the table template, with a campaign detail page. Usage items: `src/ollopa/usage/campaigns.ts`.*

## 1. Purpose

Campaigns is where the marketer sends email to many people at once and watches what came back. Two objects live here. An **audience** is a set of people built from lists and segments, with the people who must not be mailed removed. A **campaign** sends to an audience. An **email campaign** sends once, now or at a scheduled time. A **lifecycle campaign** runs: a trigger (trial day 7, renewal in 60 days, seat usage over 80%) adds people and the campaign mails them while it runs.

Who lives here: the marketer, daily, for an hour or two. The RevOps admin, weekly, for sending policy, owners and anything paused. Nobody else has the page in their navigation. The one thing the marketer must never lose sight of: **what is about to go out, to how many people, and what it cost last time** (bounces and unsubscribes). Every other number is a result they can wait for.

## 2. Data

Nothing for this page exists in the seed yet. `businesses.ts` carries `counts.campaigns` (Meridian 12, Ridgeline 8, Fathom 0, Halyard 0). Two interfaces and two arrays must be added to `seed.ts`, generated with the same `rng`.

| Field | Shown where | Source |
|---|---|---|
| `Campaign.id, name, kind ("Email" \| "Lifecycle")` | List, detail header | New. Names from a fixed list: "Q4 launch announcement", "Webinar: pipeline hygiene", "Pricing update"; lifecycle: "Trial day 7 nudge", "Renewal 60 days out", "Seat limit reached" |
| `status` (Draft, Scheduled, Sending, Sent, Running, Paused, Archived) and `pausedBy` (user, bounce guard) | Status badge | New. Meridian: 2 drafts, 1 scheduled, 6 sent, 2 running, 1 paused by bounce guard. Ridgeline: 6 running, 1 paused, 1 draft |
| `subject, previewText, fromName, fromMailbox` | List second line, detail content | New; mailbox `marketing@<domain>` |
| `audienceId, audienceSize` | List, detail audience block | New; size copied at send time |
| `sendAt`; `trigger, delayDays, exitRule` (lifecycle) | Send and Trigger columns, detail | New, via `dateAhead` / `dateBack` |
| `sent, delivered, bounced, opened, clicked, replied, converted, unsubscribed` | Metric cells, detail funnel | New. Delivered 96–99.5%, opened 22–55%, clicked 2–9%, replied 0–3%, converted 0.5–6%, unsubscribed 0.1–0.8%; one Meridian campaign bounced 6.2% to show the auto-paused state |
| `goal` (Booked demo, Started trial, Renewed, Added seats) | Converted cell | New |
| `owner` | Owner column | `b.roles` users |
| `sendsByDay[]` (30 days, lifecycle), `variants[]` (0 or 2), `activity[]` | Detail doors | New; two Meridian campaigns have A/B variants |
| `Audience.id, name, type ("Static" \| "Segment"), size, lastRebuilt, sources[]` | Audiences view | New. Meridian 6, Ridgeline 5. Sources name Lists page lists ("Webinar attendees, August") or segment text ("Trial day 7–14") |
| `suppressed: {unsubscribed, bounced, inSequence}` | Audiences view, detail | New; `inSequence` counted from `seed.contacts` |
| `usedBy` | Audiences door | Derived from campaigns |
| Policy line: bounce guard state, bounce rate this week, daily cap and used | Above the table | Thresholds from the Settings spec (`mail.bounce-guard`); cap and used new (Meridian 10,000 / 3,400; Ridgeline 4,000 / 900) |

Fathom and Halyard get empty arrays. Recipients are sampled from `seed.contacts`.

## 3. Features

**Shown.** A view switch, "Campaigns 12 · Audiences 6", above one table. Level-one columns for the Meridian marketer: Campaign (name, kind, subject on a second line), Status, Audience (name and size), Delivery (sent, delivered %, bounced count, red above 4%), Opened %, Clicked %, Replied, Converted (count and goal), Unsubscribed, Send (scheduled, last or next send). Rates carry their count in muted text; nothing is hover-only. Above the table, one line: "Bounce guard on · 0.8% this week · 3,400 of 10,000 sends used today · mail.meridian.io healthy". Audiences view columns: Audience, Type, Size, Suppressed (three counts), Last rebuilt, Used by.

**Row actions** depend on status (object state, rule 6), appear on hover and focus, and repeat in the "More actions" menu. Draft: Edit, Send test. Scheduled: Pause (holds the send, keeps the time), Send test. Sending or Running: Pause. Paused: Resume (if the kept time has passed, Resume asks for a new one). Sent: Duplicate. The menu adds Open, Duplicate, Compare with…, Export results, and below a divider Archive and, for drafts, Delete draft, whose confirmation reads "Deletes the draft and its test sends. Sent campaigns are archived, never deleted."

**Bulk.** Pause, Resume, Archive, Change owner (admin; the marketer sees "Change owner: Daniel Okafor can do this").

**Page actions.** "New campaign" (primary) asks Email or Lifecycle, then opens a draft detail page. "New audience" opens a draft: name, pick lists, add segment filters, with size and suppressed counts updating as you pick.

**Filters and search.** Search on name, subject and audience. Level-one filters: Status, Kind. A door "More filters: owner, audience, date, goal" ends the filter row. Sort by any header; it persists.

**Columns.** A door "Show 6 more columns" ends the header row: Owner, Trigger, Last send, From, Tags, Created. Choices persist per user. At Ridgeline, Trigger and Last send are default and Send is not, so the door reads "Show 5 more columns".

**Campaign detail** at `/ollopa/campaigns/<id>`, a page with a breadcrumb back. Header: name, kind, status with reason, owner, the row's actions in the same order. Body: Results (sent → delivered → opened → clicked → replied → converted, count and rate each; bounced and unsubscribed on the same line), Audience (name, size, three suppressed counts, "Open audience"), Content (subject, preview text, from, rendered preview), then Schedule (time, timezone, send speed) for email or Trigger (trigger, delay, exit rule) for lifecycle. Below, the doors listed in §6, one level deep; "Recipients" opens a drawer with a per-person table. Doors that do not apply are removed. At Ridgeline "Sends by day" is open by default, directly under Results.

**Send test** is a small dialog: recipient (yours, prefilled), variant if any, Send. The test carries a working "test unsubscribe" link that unsubscribes nobody. The toast names the mailbox.

**Schedule** is a dialog: date, time, timezone (workspace default or each recipient's local time), send speed, and a summary "Sends to 1,240 people from marketing@meridian.io on Tue 16 Sep, 09:00 CET" with the suppressed counts. Over 5,000 recipients at Meridian the button reads "Request approval" and the row shows "Awaiting approval: Daniel Okafor".

**States.** Empty (Fathom, Halyard): "No campaigns yet. A campaign sends one email to an audience built from your lists. Start with an audience, or create an email campaign." with both buttons; Halyard adds "This workspace has no marketing domain. Ravi Sethi can add one in Settings › Email sending." Loading: eight skeleton rows and a skeleton policy line. Error: "Results didn't load. Showing last night's snapshot." with Retry; actions stay enabled. No results: the template's "Nothing matches" row. No access (SDR, AE, CS): "Campaigns is for marketers and admins. At Meridian, Jonas Weber and Daniel Okafor can see it." A deleted audience shows "Audience removed; 1,240 people at send time".

**Keyboard.** Arrows move through rows; Enter opens; `p` pauses or resumes with the same confirmation as the click; `n` new; `/` search; `a` and `c` switch views; `t` sends a test from the detail; `?` lists shortcuts; Escape closes dialogs and drawers. Menu items show their shortcut.

**Accessibility.** Status is text plus colour. Doors are buttons with `aria-expanded`; hidden content uses `hidden="until-found"` so find-in-page works. The drawer traps and returns focus. Row action buttons stay in the DOM.

**Phone width.** Rows become cards: name, status, audience size, opened, clicked, converted, unsubscribed, and an always-visible "More actions" button. The filter row collapses into one door, "Filters and columns (2 active)". The detail stacks; the drawer becomes a sheet. Nothing on desktop is missing on the phone.

**By role and business.** The marketer sees every campaign and does everything except change owners and sending policy; the page names who can. The admin has Owner and the Owner filter at level one. Meridian: Send, Schedule and Send test at level one. Ridgeline: Trigger, Last send and Sends by day at level one; Schedule and Duplicate behind the row menu. Fathom and Halyard: the empty state, admin only.

## 4. Usage items

Numbers are the share of active users in the role touching the item weekly (USAGE-MODEL.md). Baseline is Meridian. Level one is 20 or above, or critical (★, rule 7). Fathom and Halyard have no campaigns and no marketer: every item is 0 for the SDR and 0–5 for the admin, so only critical items are level one there, over an empty table. SDR, AE and CS have no access. M = Meridian, R = Ridgeline.

| Item | Marketer M | Admin M | Marketer R |
|---|---|---|---|
| **List** | | | |
| Campaign name, kind and subject | 95 | 30 | 95 |
| Status ★ | 95 | 30 | 95 |
| Audience and size ★ | 80 | 15 | 80 |
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
| Delete draft | 3 | 1 | 3 |
| Bulk pause, archive, change owner | 3 | 6 | 3 |
| Export results | 4 | 5 | 4 |
| Approval before send | 10 | 12 | 3 |
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
| Suppressed counts ★ | 25 | 15 | 25 |
| New audience | 12 | 2 | 12 |
| Rebuild now | 12 | 2 | 12 |
| Campaigns using this audience | 15 | 4 | 15 |
| Upload a suppression list | 4 | 3 | 4 |
| Frequency cap per person | 4 | 5 | 4 |
| Delete audience | 2 | 1 | 2 |
| **Policy** | | | |
| Bounce guard state and rate ★ | 15 | 30 | 15 |
| Daily send cap and used | 12 | 15 | 12 |
| Marketing domain health | 4 | 20 | 4 |
| Consent rules by region | 3 | 4 | 3 |

**Shape check** (69 items, computed from the file with `shape()`):

| Pair | Head ≥20 | Body 5–20 | Tail <5 | Level one |
|---|---|---|---|---|
| Meridian, marketer | 23 (33%) | 19 (28%) | 27 (39%) | 25 |
| Meridian, admin | 13 (19%) | 24 (35%) | 32 (46%) | 17 |
| Ridgeline, marketer | 23 (33%) | 17 (25%) | 29 (42%) | 25 |
| Fathom or Halyard, admin | 0 | 1 | 68 | 8, all critical, over an empty table |

The admin fits the target shape. The marketer's head is above the 25% target because this is the role's first screen and the items are daily: the 25 level-one items spread over three surfaces (list, detail, audiences), nine or ten each. Hiding a daily item to fit a curve would break rule 1.

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

**Layout.** One page, one table, one view switch, a policy line above. Level one for the Meridian marketer is the ten columns and six actions in §3; the admin swaps Replied, Opened/Clicked and Send for Owner and the Owner filter. At Ridgeline the marketer gets Trigger and Last send in place of Send, and the detail opens "Sends by day". At Fathom and Halyard only the critical items remain: the policy line and the empty state.

**Doors and containers.**

| Door label | Where | Container | Notes |
|---|---|---|---|
| More filters: owner, audience, date, goal | End of filter row | In place | Removed under six rows |
| Show 6 more columns | End of header row | Popover | Count changes by business |
| More actions (⋯) | Each row | Menu | Visible actions plus the rare ones |
| Sends by day (30 days) | Detail | In place | Open by default at Ridgeline |
| Recipients (1,240) | Detail | Drawer | Per-person table; header stays in view |
| Links clicked (6) | Detail | In place | Removed when no links |
| Variants A and B | Detail | In place | Removed when none |
| Goal and attribution window | Detail | In place | |
| Delivery settings: tracking, reply-to, unsubscribe text, footer | Detail | In place | Unsubscribe text and its permission stay together (rule 5) |
| Resend to people who did not open | Detail | In place | Removed unless Sent |
| Activity (14), Notes | Detail | In place | |
| Campaigns using this audience (3) | Audience row | Expandable row | |
| Filters and columns (2 active) | Phone only | Sheet | One door replacing two |

Every door: chevron plus text, a count where there is one, next to what it reveals, keyboard and touch. Inapplicable doors are removed, never disabled.

**Persistence.** View, sort, columns, filters and every door's state persist per user and business. "Expand all" and "Collapse all" head the detail's doors; print expands everything.

**Accelerators.** The shortcuts in §3, shown in every menu. A "keep results doors open" preference. Duplicate keeps audience, content and schedule and resets results.

**Decision-critical, always visible.** Status with reason; audience name and size; sent, delivered, bounced; unsubscribed; suppressed counts; bounce guard state and daily cap; Pause beside Schedule with the same number of clicks; the schedule summary naming recipients, mailbox and time; what Delete draft does, on the item.

**Removed rather than hidden.** The Report tab. The second and third analytics surfaces (one metric set, defined once). "Include bots" (scanner opens always excluded; the funnel says "excludes 214 scanner opens"). Send test via templates. Per-user unsubscribe text (workspace text, read-only in Delivery settings with "Daniel Okafor can change it"). Plan gates on clicks and A/B. Folders. Auto-archive by inactivity (nothing moves on its own, rule 6). The device-timezone trap (the dialog names the timezone it will use).

**Score.**

1. Decision-critical visible without interaction: 2. Status, audience size, bounces, unsubscribes, policy line, pause.
2. Every visible item backed by a usage number with a source: 2. All 69 items in `campaigns.ts`.
3. No path over two levels on any screen size: 2. List → door; detail → door; the drawer holds no doors; phone merges two doors into one.
4. Doors labelled by content with chevron and text: 2. Counts on every door that has one.
5. Doors adjacent, keyboard and touch: 2. Column door in the header row, filter door in the filter row, detail doors under the block they extend.
6. No dependent information split: 2. Sent/delivered/bounced in one cell; size with suppressed; time with timezone and speed; unsubscribe text with its permission.
7. State persists; expand-all and print: 2.
8. Disclosure by user action or object state only: 2. Row actions by status; nothing reorders by history.
9. Door usage instrumented with a scheduled review: 1. The review is scheduled twice a year from the usage file; the demo has no instrumentation.

Total 17 of 18.

## 7. The rules that mattered most

- **Rule 7.** Bounce guard, audience size and unsubscribes moved from Settings and the Report tab to the row and the policy line; Pause got the same path as Schedule.
- **Rule 1.** Results moved from a tab to the row: 85–95% of marketers read them weekly; under 20% open recipients or links.
- **Rule 5.** Sent, delivered and bounced became one cell; size and suppressed one block; time, timezone and speed one dialog.
- **Rule 2.** Three analytics surfaces became one page and one door; the lifecycle campaign became one object instead of five.

## 8. Review

| Check | Result |
|---|---|
| All roles | Marketer and admin have the page; SDR, AE and CS get a no-access page naming who can (gap: the shell's text was generic; closed in §3) |
| All four businesses | Meridian and Ridgeline have data and different level-one sets; Fathom and Halyard the empty state (gap: Halyard has no marketing domain; closed by the empty state's second line) |
| Every field has a source | §2 |
| Every action has an outcome | §3; Resume on an expired schedule asks for a time (gap found and closed) |
| Empty, error, no-access | §3 |
| Keyboard | Rows, doors, dialogs; shortcuts shown in menus |
| Phone width | Cards, one merged door, sheet drawer; content parity |
| Decision-critical visible | Nine items in §6 |
| Two levels maximum | Counted per channel; the drawer holds no doors (gap: an early draft put "Links clicked" inside the drawer; moved to the page) |
| Doors labelled by content | Yes, with counts |
| Dependent fields together | Four pairs in §6 |
| State persists | Per user and business |
| Accelerators | Shortcuts, expand-all, keep-open preference, duplicate |
| Usage shape | Four pairs in §4; the marketer head is above target and the reason is stated |
| Nothing hover-only | Row actions also on focus and in the menu; counts printed |
| Role gaps explain themselves | Change owner, sending policy, unsubscribe text and the Halyard domain each name the person |
| No usage numbers or teaching text in the product | The page shows row and result counts only; numbers and sources stay in this file and the usage file |
