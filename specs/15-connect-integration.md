# Connect an integration

*Page 14 of Ollopa. A full page and lesson 4: the setup wizard reached from Settings, and the integration's own page that the wizard leads to. Apollo's Salesforce and HubSpot setup is the "before".*

## 1. Purpose

The page connects an outside system to the workspace: a CRM (Salesforce or HubSpot), a calendar (Google or Microsoft 365), Slack, an enrichment provider, or a webhook. For a CRM it also decides what syncs, how fields map, and what Ollopa may write, delete or merge in the other system. Then it hands over to the integration's page in Settings, where the connection lives for the rest of its life: status, error log, mapping and rules, all editable in place.

Who lives here: the RevOps admin. At Meridian, Daniel Okafor connects something a few times a year and looks at the Salesforce page most weeks. At Fathom, Priya Natarajan connected HubSpot once. At Halyard, Ravi Sethi connects a client's CRM every time a client is onboarded, so the wizard is routine there, not rare. At Ridgeline, Grace Mwangi keeps four quiet integrations healthy. SDRs, AEs, marketers and customer success come only to connect their own calendar.

How often: the wizard once per integration; the integration page weekly for the admin at Meridian, Halyard and Ridgeline.

The one thing they must never lose sight of: what this connection will write into, delete from or merge in the other system, and that nothing syncs until they say so. A CRM is the system of record; a wrong push rule or a mirrored deletion is not undone by a click. So the consequence is stated in words wherever it can change, and sync starts only when the admin presses "Start syncing", never on a timer.

## 2. Data

| Field | Where shown | Source in seed |
|---|---|---|
| Kind (Salesforce, HubSpot, Google Calendar, Microsoft 365 Calendar, Slack, enrichment provider, webhook), connection name, environment (Salesforce: production or sandbox) | Step 1, step 2, headings, Settings row | `integrations[].kind`, `name`, `environment` (to add) |
| Sync user, token valid until | Step 2 result, Authorisation door | `integrations[].auth` (to add) |
| Objects and direction: contacts, companies, deals, activities; each both, pull, push, off; which activity types | Step 3, What syncs door | `integrations[].objects` (to add) |
| Ollopa fields and stages per object | Step 4 | `Contact`, `Company`, `Deal`, `STAGES`, `DEAL_STAGES` in `seed.ts`; custom fields from Settings `pipe.fields` |
| CRM fields per object with type, required flag, picklist values | Step 4 | `crmFields[]` (to add), one list per CRM kind |
| Field pairs with direction and write rule; stage pairs | Step 4, Field mapping door | `integrations[].mappings`, `stageMap` (to add) |
| Pull and push conditions, unverified-email push, source value, deletion behaviour, merge behaviour, matching key | Step 5, Sync rules door | `integrations[].rules` (to add) |
| Counts for the consequence statement (Ollopa and CRM records per object) | Step 6, Pull now / Push now confirmations | `businesses[].counts` (exists), `integrations[].remoteCounts` (to add) |
| Status (setting up, paused, syncing, needs attention), last sync, next sync, records today, errors today, paused by | Integration page, Settings row | `integrations[].status` and friends (to add) |
| Error rows: when, object, record, direction, message, suggested fix, attempts | Integration page | `integrationErrors[]` (to add) |
| Sync runs: started, object, direction, pulled, pushed, failed | Sync history door | `syncRuns[]` (to add) |
| Setup draft: step reached, answers, saved when | Settings row, Home to-do, wizard | `setupDrafts[]` (to add) |
| Calendar choices, Slack event-to-channel pairs, enrichment key and field list and order, webhook URL, secret, events, last test | The kind's own steps and page | `integrations[].calendars`, `channels`, `enrichment`, `webhook` (to add); order ties to `pipe.enrichment-order` |
| Names of the admins for the role-gap sentence | No-access state | `businesses[].roles` (exists) |

To add to the seed, generated deterministically like the rest of `seed.ts`: an `integrations` array per business. Fathom: HubSpot (connected by Priya Natarajan, syncing, no errors) and Google Calendar per user, two in total. Meridian: Salesforce production (Daniel Okafor, syncing, 3 errors today, 1,204 records today), Google Calendar, Slack, the enrichment provider "Northlight", a webhook "Warehouse export", five in total. Halyard: one HubSpot for the current client workspace, 1 error today. Ridgeline: HubSpot, Google Calendar, Slack, Northlight, four in total. Also `crmFields` for Salesforce (Contact, Account, Opportunity, Task) and HubSpot (Contact, Company, Deal, Engagement), about twenty each with a few required fields and one picklist; six to twelve `integrationErrors` at Meridian and Halyard (a picklist rejection, a missing required field, a read-only field, a duplicate email); thirty `syncRuns`; one `setupDrafts` row at Meridian (Microsoft 365 Calendar, step 2 of 3) so the resume path has data. The second enrichment provider is "Datakite".

## 3. Features

### 3.1 The wizard

Reached from Settings › Integrations › "Connect an integration", from that section's empty state, and from Home's admin to-do when a draft exists. Route `connect`; the sidebar keeps Settings highlighted.

**Step 1: Choose what to connect.** Seven cards in three groups: CRM (Salesforce, HubSpot), Calendar (Google, Microsoft 365), Team and data (Slack, enrichment provider, webhook). Each card says in one line what the connection does and whether one is already connected. One CRM per workspace: the other CRM card reads "Disconnect Salesforce first" and opens the Salesforce page. The card chosen decides the step list: six steps for a CRM, three for anything else.

**Step 2: Authorise.** HubSpot, Google, Microsoft 365, Slack: one button, "Sign in to HubSpot", opening the provider's consent screen. Salesforce: production or sandbox as two radios, then "Sign in to Salesforce as the sync user", with one line saying the sync user should be a shared account that stays active. No package to install, no separate setup app. Enrichment: key field and "Check the key". Webhook: URL, secret, "Send a test event", response shown in place. The result is text on the step: "Connected as ollopa-sync@meridian.com. Token valid until 12 Mar 2027."

**Step 3: Choose what syncs.** CRM: four rows (contacts, companies, deals, activities), four radios each (both ways, pull only, push only, off). Defaults: both for contacts and companies, pull for deals, push for activities. Each row has one plain-words line ("Ollopa will create and update Salesforce contacts and take updates back"). Activities have one door, "Which activities to push (emails, calls, tasks, meetings)", expanded in place. Calendar: which calendars, busy time only or event detail. Slack: five events (reply received, meeting booked, deal moved, agent needs approval, sync error), each with a channel. Enrichment: which fields it may fill and its place in the provider order, shown with the other providers. Webhook: which events.

**Step 4: Map fields.** CRM only. One tab per object chosen, labelled with a count ("Contacts · 14 mapped, 1 required unmapped"). Rows: Ollopa field, direction, CRM field, write rule (fill empty, overwrite). Standard fields are pre-mapped. CRM-required fields without a mapping are listed first with a text mark, not colour alone. "Add a field pair" adds a row. Deals also carry stage mapping in the same tab, one to one, with "Match stages by name". The write rule sits in the row of the pair it governs, never on another step. A search box filters both columns; a door "Show 42 unmapped Salesforce fields" holds the long tail.

**Step 5: Set sync rules.** CRM only. Four groups on one page. Pull: "Pull every record" or "Pull only records that match", the condition builder (field, operator, value) appearing under the second radio. Push: the same pair, plus "Push contacts whose email is unverified" (off by default) and the source value written to the CRM's source field (default "Ollopa"). Deletions and merges together: what happens in Ollopa when a CRM record is deleted (unlink, or delete), what happens in the CRM when an Ollopa record is deleted (nothing, or delete), and the same pair for merges; defaults are the non-destructive choices; each destructive choice has one consequence line beside it. Matching: which key says two records are the same person (email then CRM id, or CRM id only).

**Step 6: Review and start.** Every choice in six short blocks, each with a "Change" link that goes to the step and comes back. Then the consequence statement in text: "On the first sync Ollopa will pull about 21,300 contacts and 3,900 accounts from Salesforce and push about 2,140 contacts and 410 companies to Salesforce. Deletions in Salesforce will unlink records in Ollopa. Merges in Salesforce will be mirrored." Two buttons: "Start syncing" and "Save without syncing" (connected, paused).

**Done.** The integration page opens with a banner: "Salesforce (production) is syncing. First sync started 10:42, usually done within 30 minutes."

**Progress and buttons.** Every step's heading reads "Step 3 of 6: Choose what syncs". A step list beside the form (above it on a phone) shows each step's name and state in text: "Done: Salesforce (production)", "You are here", "Not started". Done steps are links. Step 2 must precede steps 3 to 5 because they need the CRM's fields; after that, any order. Buttons are named for where they go: "Continue to field mapping", "Back to what syncs", never "Next". "Save and exit" is on every step, and a constant line under the heading reads "Nothing syncs until you press Start syncing on the last step."

**Exit and resume.** Every change is saved as it is made. The Settings › Integrations row reads "Salesforce · setup, 3 of 6 steps done · Resume setup · Discard"; Home's admin to-do carries the same line. Drafts never expire on their own. "Discard" asks once, says what is lost, and revokes any token already granted.

**Where the wizard is not used.** Editing a mapping, changing a rule, re-authorising an expired token, pulling or pushing now, retrying an error, renaming or pausing: all on the integration page, in place. Nothing in daily work (adding people to a sequence, logging a call, moving a deal) is ever a wizard.

### 3.2 The integration page

Reached from a Settings › Integrations row and at the end of the wizard. Same route, with the integration id.

Level one: heading with name and kind; a status strip with status word, last sync, next sync, records synced today, errors today, and "Pause syncing" or "Resume syncing". When errors today is above zero, the error table sits under the strip: when, object, record (a link), direction, message, suggested fix, attempts, "Retry" per row, "Retry all", "Show filters" (object, direction, date range), "Export as CSV". Message and fix are printed in the row, never on hover. Then "Disconnect" with its consequence beside it in one line: "Stops syncing. Records already in Salesforce stay. Records pulled into Ollopa stay and lose their link."

Level two: five doors, expanded in place, each with a summary line that says what is inside before it opens.

| Door | Summary line (Meridian) | Inside |
|---|---|---|
| What syncs | Contacts both ways · Companies both ways · Deals pull only · Activities push | Step 3's table, editable, "Save" |
| Field mapping | 14 contact, 9 company, 6 deal fields · 1 required Salesforce field unmapped | Step 4's tabs, editable, "Save", "Apply mapping to existing records" |
| Sync rules | Pull: owner is in Ollopa · Push: stage Interested or later · Deletions unlink · Merges mirrored | Step 5's groups, editable, "Save" |
| Authorisation | Connected as ollopa-sync@meridian.com · valid until 12 Mar 2027 | "Re-authorise", "Change sync user", environment |
| Sync history | 30 runs · last failed run 4 days ago | Runs table, "Pull now", "Push now" |

"Apply mapping to existing records", "Pull now" and "Push now" show the count they will touch and ask once. A saved mapping change otherwise applies to records created or changed from now on, and the door says so: "Saved. Applies to new and changed records. Apply to existing records?"

### 3.3 Actions and outcomes

| Action | Outcome |
|---|---|
| Choose a card (step 1) | Step list for that kind; draft created |
| Sign in, check key, send test event (step 2) | Result in text; step marked done |
| Set direction, pairs, write rules, stages, conditions, deletion, merge, matching (steps 3 to 5) | Saved on change; later steps show only the chosen objects; consequence lines update |
| Change (step 6) | The step opens; "Back to review" returns |
| Start syncing / Save without syncing | Integration page, syncing or paused |
| Save and exit / Resume setup / Discard | Settings row shows the draft; Discard confirms, says what is lost, revokes the token |
| Pause / Resume | Status changes; next sync shown or cleared; "Paused by Daniel Okafor on 9 Sep" |
| Retry / Retry all | Row shows "Retrying…", then leaves the table or shows the new message |
| Edit a door and Save | Saved in place; summary line updates |
| Apply mapping to existing records, Pull now, Push now | Count shown, confirm, run appears in history |
| Re-authorise / Change sync user | Provider consent; result in text |
| Disconnect | Confirmation restating the consequence; back to Settings › Integrations |
| Save these choices as a setup template / Start from a saved template | Halyard's accelerator; a template holds steps 3 to 5 |

Bulk: "Retry all". Sorting: errors and runs by time, newest first, errors also by object.

### 3.4 States

| State | Shown |
|---|---|
| No integrations | Settings › Integrations shows the seven cards with their one-line descriptions |
| Loading | Step 2: "Waiting for Salesforce…" with cancel; step 4: table skeleton, "Loading Salesforce fields" |
| Authorisation failed | Provider's message in text, "Try again", "Use a different account"; step stays not done |
| Sync errors | Status "Needs attention"; error table at level one; Home to-do for the admin |
| Provider unreachable | Strip: "Salesforce did not answer at 10:42; retrying every 5 minutes" |
| Draft exists | Settings row and Home to-do say so; the wizard opens at the first step not done |
| Paused | Strip says who paused and when; Resume button |
| No access | "Only RevOps admins can connect a CRM, Slack, an enrichment provider or a webhook. Ask Daniel Okafor." Calendar cards remain for the user's own calendar; CRM rows are read-only with status, because a stale CRM matters to an SDR. Nothing is greyed out |

### 3.5 Keyboard, accessibility, phone

Every control is a native button, input, radio or link. Enter submits the step's primary button; Escape closes a confirmation and never leaves a step. The step list is a `nav` with a heading; focus moves to the `h1` on step change; progress is text, so a screen reader gets it first. Doors are buttons inside headings with `aria-expanded`. Cmd/Ctrl+S is "Save and exit" in the wizard and "Save" in an open door; Cmd/Ctrl+Shift+E expands all doors on the integration page; both are printed on the buttons. Required unmapped fields use text and colour. The condition builder announces added rows. Reduced motion crossfades doors; print expands them all.

Phone width: the step list collapses to "Step 3 of 6: Choose what syncs · Show steps", one tap. Step 3's radio rows become a select per object; step 4's table becomes a card per pair with the same four fields; the review blocks stack; the error table scrolls horizontally inside its own container. Nothing moves to a third level.

### 3.6 By role and business

| Role | Wizard | Integration page |
|---|---|---|
| RevOps admin | All seven kinds | Everything |
| SDR, AE, marketer, CS | Own calendar (two steps) | Own calendar's page; CRM rows read-only |

| Business | What changes |
|---|---|
| Fathom | The Salesforce card reads "Not on the Starter plan" with a link to Plan: shown, not hidden |
| Meridian | Baseline; five integrations, one draft, Salesforce has three errors today |
| Halyard | "Start from a saved template" is a button beside the cards, and "Save these choices as a template" is on the review step at level one; one HubSpot per workspace |
| Ridgeline | No Salesforce; Slack defaults have "deal moved" and "agent needs approval" on and "reply received" off, because there is little outbound |

## 4. Usage items

Weekly use is the share of active users in the role touching the item in a typical week. Baseline is Meridian; illustrative numbers fitted to the published shape (USAGE-MODEL.md). "Critical" items sit at level one whatever the number (rule 7).

| Id | Area | Item | SDR | AE | Mkt | CS | Admin | Fathom adm. | Halyard adm. | Ridgeline adm. | Critical |
|---|---|---|---|---|---|---|---|---|---|---|---|
| wiz.choose | Wizard | Choose what to connect | 4 | 5 | 1 | 4 | 5 | 5 | 25 | 3 | |
| wiz.authorise | Wizard | Authorise | 4 | 5 | 1 | 4 | 6 | 5 | 25 | 3 | |
| wiz.sandbox | Wizard | Salesforce: production or sandbox | | | | | 2 | 0 | 4 | 0 | |
| wiz.objects | Wizard | Choose what syncs | | | | | 5 | 5 | 25 | 3 | |
| wiz.mapping | Wizard | Map fields (pairs and write rule) | | | | | 5 | 5 | 22 | 3 | |
| wiz.stage-mapping | Wizard | Map stages | | | | | 3 | 2 | 12 | 2 | |
| wiz.pull-conditions | Wizard | Pull conditions | | | | | 3 | 2 | 15 | 2 | |
| wiz.push-conditions | Wizard | Push conditions, unverified emails, source | | | | | 3 | 2 | 15 | 2 | |
| wiz.deletion | Wizard | Deletion behaviour | | | | | 3 | 2 | 10 | 2 | yes |
| wiz.merge | Wizard | Merge behaviour | | | | | 3 | 2 | 10 | 2 | yes |
| wiz.matching-key | Wizard | Matching key for duplicates | | | | | 3 | 2 | 5 | 2 | |
| wiz.review | Wizard | Review, consequence statement, start | | | | | 5 | 5 | 25 | 3 | yes |
| wiz.save-exit | Wizard | Save and exit, resume, discard | | | | | 3 | 2 | 8 | 2 | |
| wiz.slack-channels | Wizard | Slack: events to channels | | | | | 3 | 2 | 3 | 4 | |
| wiz.calendar-pick | Wizard | Calendar: which calendars, busy only | 4 | 5 | 1 | 4 | 2 | 4 | 2 | 2 | |
| wiz.enrichment | Wizard | Enrichment: key, fields, order | | | | | 3 | 2 | 3 | 2 | |
| wiz.webhook | Wizard | Webhook: URL, secret, events, test | | | | | 2 | 4 | 3 | 2 | |
| wiz.template | Wizard | Setup template (save, start from) | | | | | 1 | 0 | 22 | 0 | |
| int.status | Integration page | Status, last and next sync, records and errors today | 3 | 3 | | 2 | 40 | 5 | 25 | 30 | yes |
| int.errors | Integration page | Error log, fix in the row | | | | | 30 | 3 | 25 | 25 | |
| int.retry | Integration page | Retry one or all | | | | | 20 | 2 | 18 | 15 | |
| int.pause | Integration page | Pause or resume | | | | | 5 | 1 | 4 | 3 | yes |
| int.edit-mapping | Integration page | Edit field mapping in place | | | | | 15 | 2 | 10 | 10 | |
| int.apply-mapping | Integration page | Apply mapping to existing records | | | | | 8 | 2 | 6 | 5 | |
| int.pull-push-now | Integration page | Pull now, push now | | | | | 20 | 3 | 12 | 12 | |
| int.edit-rules | Integration page | Edit sync rules in place | | | | | 6 | 2 | 6 | 4 | |
| int.reauthorise | Integration page | Re-authorise, change sync user | 2 | 2 | | 2 | 5 | 3 | 4 | 4 | |
| int.history | Integration page | Sync history | | | | | 20 | 3 | 8 | 12 | |
| int.disconnect | Integration page | Disconnect, with what happens | | | | | 1 | 1 | 4 | 1 | yes |

Notes on the numbers: int.status, int.errors and int.edit-mapping match the Settings items int.crm (40), int.error-log (30) and int.field-mapping (15). Non-admins reach the wizard for their own calendar, hence the small SDR, AE and CS numbers on three items. Fathom's founder builds her own automations, hence webhook 4. Halyard connects a client's CRM most months, and wiz.template is the accelerator that makes the tenth connection cheap.

Shape check, 29 items:

| Pair | Head (20 and above) | Body (5 to 20) | Tail (under 5) | Verdict |
|---|---|---|---|---|
| Meridian, admin | 5 (17%): status, errors, retry, pull-push-now, history | 10 (34%) | 14 (48%) | Fits |
| Halyard, admin | 8 (28%): choose, authorise, objects, mapping, review, template, status, errors | 13 (45%) | 8 (28%) | Head slightly large, body heavy, tail light: the agency profile. The setup block moves up one band because it is routine there. The split still holds: same items, a different level one |
| Fathom, admin | 0; the critical items carry level one | 6 (21%) | 23 (79%) | A three-person team does not touch integrations weekly |
| Ridgeline, admin | 2 (7%): status, errors | 5 (17%) | 22 (76%) | Four quiet integrations |

Decision-critical: wiz.deletion, wiz.merge, wiz.review, int.status, int.pause, int.disconnect.

## 5. Before: the common version

Apollo's flow is the model. Sources are Apollo's knowledge base, fetched 13 Sep 2026, with each article's "updated" date.

**Entry and choice.** Settings › Integrations is a marketplace list with category chips. The Salesforce card has two buttons, "Connect" and "Connect to Sandbox" (Integrate Salesforce with Apollo, article 4414356051725, updated 28 Aug 2026). HubSpot first asks for "HubSpot CRM" (two-way sync) or "HubSpot Data Enrichment" (enrich only) (Integrate HubSpot with Apollo, article 4416619021837, updated 8 Sep 2026). The first decision is an environment or a product variant, not what the connection will do.

**Authorising Salesforce takes four contexts.** In Apollo: "Connect", then "Install Managed Package". On the AppExchange: "Get It Now", confirm, "Confirm and install", choose who it installs for, "Install", "Done". In Salesforce: App Launcher, the "Apollo Setup" app, "Get Started", create or pick an integration user, "Save and next", review permissions, copy the credentials somewhere safe, "Connect in Apollo". Back in Apollo: "Connect", "Yes, Continue", log in as the integration user (article 4414356051725). No step count, no progress text, no resume; the buttons are "Save and next" and "Done", which say nothing about where they lead.

**The six-hour window.** "After you enable the Salesforce integration on a paid Apollo plan, there's a 6-hour window to configure push and pull settings and map fields. During this time, you can't manually pull records. After 6 hours, Apollo automatically enables syncing." (Configure Salesforce Pull Settings, article 4414496822797, updated 6 Sep 2026; the HubSpot article states the same window.) The clock decides when sync starts. If the admin is pulled away, the defaults run, and "Push account" is enabled by default (Configure Salesforce Push Settings, article 4414469523981, updated 26 Aug 2026). The settings map lists this as the one integration item that is "intensive at setup (6-hour window!)" (07-apollo-settings-map.md, section 2).

**Configuration is tabs within tabs.** After connecting there is no wizard. The Salesforce page has tabs Contacts, Leads, Accounts, Deals, Activities; each has sub-tabs Sync and Field mapping; the page also has Authentication and Error logs (settings map, section 1.3: "Integrations (D1; per-integration pages D2; tabs D3; sub-tabs D4)"). Push-by-stage sits on the Sync sub-tab and the stage mapping it depends on sits on the other sub-tab. Deletion sync and merge sync are inside a block labelled "Advanced sync" (settings map, section 1.4); Activities has "Email advanced settings", "Tasks advanced settings" and "View advanced settings" for calls (article 4414469523981). Audience labels, hiding the two most consequential switches on the page.

**Labels carry credit spend and side effects.** Accounts pull has "Infer missing data from Salesforce accounts with no name or website", which costs CRM enrichment credits (article 4414496822797). Email push has "Push emails even if the sender or recipient doesn't exist", which the article warns can create unintended contacts (article 4414469523981). "Hide my contacts and leads pulled from Salesforce" hides records from the person who pulled them, a workaround for a table that cannot filter by source. Selective sync "is available on certain Apollo plans purchased after July 24, 2024" (article 4414496822797), so the door sometimes opens onto nothing.

**Mapping changes do not reach existing records.** "Field mapping changes only apply to records created or updated after saving"; existing records need "Push all" or "Pull all" (Configure HubSpot Data Mapping, article 4416676239117, updated 9 Sep 2026). Write rules are "Auto-fill" and "Overwrite"; stages "must map one-to-one", with "Auto-map all stages". The consequence of a change is not stated where the change is made.

**Duplicates are the admin's problem before connecting.** "Apollo mirrors the data in Salesforce. If Salesforce contains duplicate leads, contacts, or accounts, those same duplicates appear in Apollo"; "clean and deduplicate Salesforce before connecting the integration"; merges made in Apollo do not sync back (Avoid Duplicates with the Salesforce Integration, article 47407472057101, updated 26 Aug 2026). Nothing in the setup path says how many records the first sync will create. Third-party setup guides found in the same search (Octave, LeadHaste, AeroLeads, Sep 2026) all lead with duplicates; they are vendor blogs, so their figures are secondary and unverified.

**The error log hides the fix behind hover.** "Settings > Integrations > Salesforce > Error Logs" shows failures with "hover-over details" for the description, the full message and the suggested fix; "Show filters" finds errors by type or date; Apollo retries up to five times and the admin retries by "clicking the refresh icon" (Use the Salesforce Integration Error Log, article 7683909560845, updated 15 Jul 2026). The fix is what the admin came for, and it is hover-only behind an unlabelled icon.

**Slack and webhooks.** Slack is a single "Allow" (Integrate Slack with Apollo, article 22464817775117, updated 3 Sep 2026), which is right for Slack. Webhooks have no verified settings page; the settings map marks the third-party "Settings › Integrations › Webhooks" path as unverified.

**What users say.** "The UI can feel slightly cluttered, and initial setup takes some time to get right." (Sanket D., Capterra, 10 Apr 2026). "there is a slight learning curve to understand the dependencies" (Shane S., Capterra, 12 Jun 2025). Both from the settings map, section 3. No verbatim review about the six-hour window or the integration tabs was found; that complaint is unverified.

**The documented problems, by rule.** Four contexts, no progress, no resume (pattern 9). A timer instead of a decision (rules 6 and 7). Four levels for a sync setting (rule 2). "Advanced sync" and three "advanced settings" (rule 4). Push-by-stage and stage mapping on different sub-tabs (rule 5). Deletion and merge inside the "Advanced" block (rule 7). No count of what the first sync will do (rule 7). Error fix on hover (rule 4). A plan-gated door that opens onto nothing (rule 4).

## 6. After: the disclosed version

**Layout.** One route, two screens. The wizard: a step list (left, or stacked on a phone), one form per step with the heading "Step n of m: name", the constant line "Nothing syncs until you press Start syncing on the last step", and a footer with the descriptive primary button, the descriptive back link and "Save and exit". The integration page: heading, status strip, error table when errors exist, Disconnect with its consequence, then five doors.

**Level one and level two.**

| Who | Level one | Level two |
|---|---|---|
| Admin, wizard | The step's necessary fields, step list, consequence lines, Save and exit | Per step: "Which activities to push", "Show n unmapped CRM fields"; the condition builder appears from the radio (object state) |
| Admin, integration page | Status strip, error table when errors exist, Pause, Disconnect with consequence, five door labels with summaries | What syncs, Field mapping, Sync rules, Authorisation, Sync history |
| SDR, AE, marketer, CS | Calendar cards, own calendar status, read-only CRM status, the sentence naming who can connect more | Nothing else exists for them; nothing greyed out |

Across businesses: Fathom shows the Salesforce plan gap in text and no error table on HubSpot (no errors); Meridian's error table is at level one today because there are three errors; Halyard has the template button at level one on steps 1 and 6; Ridgeline has four quiet pages and different Slack defaults.

**Doors.** Every door is a button with a chevron and a content label, in the reading path, next to what it reveals, keyboard and touch.

| Door | Container | Where | Persists |
|---|---|---|---|
| "Which activities to push (emails, calls, tasks, meetings)" | In place | Under the Activities row, step 3 | Per workspace and integration |
| "Show 42 unmapped Salesforce fields" | In place | Bottom of each mapping tab | Per tab |
| Condition builder | In place, directly after its radio | Step 5 | Rows kept if the radio is toggled during a session |
| "Show steps" (phone only) | In place | Under the heading | Per session |
| What syncs, Field mapping, Sync rules, Authorisation, Sync history, each with a summary line | In place | Integration page | Per user and integration |
| "Start from a saved template", "Save these choices as a template" | In place (level one at Halyard) | Steps 1 and 6 | Templates saved per workspace |

Modals exist only for confirmations: Discard setup, Disconnect, and the count before Apply mapping, Pull now and Push now. No drawers. Draft answers are saved on every change, server side.

**Accelerators.** Setup templates; "Match stages by name"; done steps as links; Cmd/Ctrl+S and Cmd/Ctrl+Shift+E printed on the buttons; "Retry all"; print expands every door.

**Decision-critical, always visible.** The consequence statement on review; the deletion and merge consequence lines on step 5; "Nothing syncs until you press Start syncing"; status and Pause; Disconnect with its consequence; the count before any bulk run; the plan gap on a card in text.

**Removed rather than hidden.** The six-hour timer (replaced by "Start syncing" and "Save without syncing"). The managed package and separate setup app (one sign-in as the sync user). "HubSpot CRM" versus "HubSpot Data Enrichment" (enrichment providers are their own card). "Hide my contacts pulled from the CRM" (People and Companies filter by source). "Infer missing data" (enrichment is the provider's job, under the credit caps in Settings). "Push emails even if the sender or recipient doesn't exist". "Advanced sync" and the three "advanced settings" (their contents are named). The plan gate on pull conditions.

**The nine-point score.**

| # | Question | Score | Line |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | Consequence statement, deletion and merge lines, status, Pause, Disconnect, bulk counts, all in text at level one |
| 2 | Every visible item backed by a sourced number | 2 | Section 4; critical items marked; baseline Meridian with overrides |
| 3 | No path exceeds two levels on any screen size | 2 | Page plus one in-place door; the phone changes layout, not availability |
| 4 | Every door labelled by content, chevron and text | 2 | Summaries carry counts; no "Advanced", "More" or "Next" anywhere |
| 5 | Every door adjacent, keyboard and touch | 2 | Buttons in headings, next to what they reveal |
| 6 | No dependent information split across a door | 2 | Pair and write rule in one row; push-by-stage and stage mapping in one tab; deletion, merge and matching in one group |
| 7 | Door state persists; expand-all and print exist | 2 | Per-user door state, Cmd/Ctrl+Shift+E, print expands |
| 8 | Disclosure by user action or object state | 2 | Step list from the kind chosen, builder from the radio, error table from the error count; no timer, no history |
| 9 | Instrumented; promote, keep or delete review scheduled | 1 | Wizard funnel (step abandonment, backtracking) and door open rates are specified; the semi-annual review is a process the demo cannot show |

Total: 17 of 18.

## 7. Lesson steps

Lesson 4. Step 0 is the common version from section 5. Each later step applies one rule.

| Step | Rule | What moves | Why, in one sentence | Evidence |
|---|---|---|---|---|
| 0 | | Marketplace list, four-context authorisation, six-hour timer, page › object tab › Sync sub-tab › "Advanced sync" block, error log with hover detail | What happens when each sync setting is added where it fits and nothing is ever moved | Apollo articles 4414356051725, 4414496822797, 4414469523981, 4416606988941, 7683909560845; settings map 1.3 and 1.4 |
| 1 | 2. Stop at two levels | Page › tab › sub-tab › block becomes one page per step with at most one in-place door; the integration page becomes status plus five doors | A fourth level is where admins get lost; it is not a widget problem | Nielsen 2006: beyond two levels "typically have low usability"; Pajamas: three or more "suggests the feature needs redesign"; settings map 1.3 shows D4 |
| 2 | 4. Make the door obvious and honest | "Advanced sync" becomes "Deletions and merges"; "Next", "Save and next", "Done" become "Continue to field mapping" and "Start syncing"; "Step 3 of 6" appears in text; the error fix moves from hover into the row; the plan-gated door is removed | A label is the only scent a door has, and a door must always open onto something | NN/g wizards (pattern 9): descriptive labels, progress in text; Windows UX Guide: "Remove (don't disable)"; NN/g 2014: 0% click-through on an unlabelled icon; WCAG 1.4.13 |
| 3 | 5. Keep context across the boundary | Push-by-stage and stage mapping share a tab; the write rule sits in the pair's row; deletion, merge and matching share one group; answers save on every change and the draft resumes from Settings and Home | Fields edited together must be seen together, and a wizard that forgets what you typed splits context across time | Fluent 2: "Never put information in one accordion item that needs to be referenced in another"; Cowan 2001; NN/g wizards: exit and resume; Nielsen 2006: staged disclosure is "problematic when the steps are interdependent" |
| 4 | 7. Decision-critical is never behind a door | The timer becomes "Start syncing"; the review step states what the first sync will pull, push, delete and merge; deletion and merge leave the "Advanced" block for the open page with a consequence line each; Disconnect shows what happens beside the button; Pause is on the strip | What a connection will do to the system of record is the one thing the admin must never lose sight of | Nielsen 2026: never hide "risks"; RULES.md rule 7: "what a destructive action does… safety state"; Apollo 47407472057101 on mirrored duplicates and merges |
| 5 | 1. Hide the rare, never the necessary | On the integration page, status, errors, retry, pull now and history are level one (40, 30, 20, 20, 20 for Meridian's admin); what syncs, mapping, rules and authorisation are doors; in the wizard, activity types and the unmapped-fields tail go behind doors | Level one is decided by weekly use per role and business, not by what felt important | USAGE-MODEL.md; settings.ts int.crm 40, int.error-log 30, int.field-mapping 15; Pendo 2024; McGrenere and Moore 2000 |
| 6 | 6. Stable, user-controlled disclosure | The step list follows the kind chosen (six steps for a CRM, three otherwise); the builder appears from the radio; the error table appears when errors exist; nothing starts, moves or appears because of a clock or past behaviour | Object state is predictable; timers and inferred history are not | Findlater and McGrenere 2004; Shneiderman on machine-initiated change; the Apollo window decides for the admin (article 4414496822797) |
| 7 | 8. Fade the scaffold; give experts accelerators | Halyard's admin gets templates at level one; done steps become links; mapping is re-run from the integration page without the wizard; shortcuts are printed on buttons; the wizard is never used for editing, retrying, re-authorising or any daily task | The wizard is scaffolding for the first connection; the tenth connection and every later edit need a way past it | Budiu 2017: wizards "become annoying and overly controlling if they have to be used over and over again"; NN/g heuristic 7; Cockburn et al. 2014 |

Rule 3 runs through step 7: one wizard serves Fathom's first connection and Halyard's tenth; the difference is accelerators, not an expert mode.

## 8. Review

| Check | Gap found | Closed by |
|---|---|---|
| All roles covered | No path for non-admins | Calendar-only wizard; read-only CRM status; the sentence naming who can connect more |
| All four businesses | Ridgeline's Slack defaults were the outbound ones | Defaults differ by business through the usage model, not a switch |
| Every field has a source | `remoteCounts`, `crmFields`, drafts and errors were missing from the seed | Listed in section 2 with sizes per business |
| Every action has an outcome | "Discard" and "Save without syncing" had none | Both in the actions table; Discard revokes the token |
| Empty, error, no-access states | Provider-unreachable was missing | Added with the retry cadence in text |
| Keyboard | No expand-all on the integration page | Cmd/Ctrl+Shift+E, printed on the button |
| Phone width | Step 3's radio rows did not fit | A select per object; nothing moves to a third level |
| Decision-critical visible | Deletion and merge were on step 5 only | Restated in the review statement and the Sync rules summary |
| Two levels maximum | Mapping tabs plus a door plus the builder could read as three | Tabs are level-one layout; the builder is object state; counted per channel, nothing exceeds two |
| Doors labelled by content | "More settings" on activities | Renamed by content |
| Dependent fields together | Matching key was on step 3 | Moved beside deletion and merge |
| State persists | Drafts expired after 30 days | Never on their own; Discard is explicit |
| Accelerators present | Only for Halyard | Done steps as links, printed shortcuts, Retry all, Match stages by name, for everyone |
| Usage shape checked | Only Meridian | Halyard, Fathom and Ridgeline added with a verdict each |
| Nothing hover-only | Error fix inherited from the model | Printed in the row |
| Role gaps explain themselves | Salesforce card at Fathom hidden by plan | Shown with the gap in text and a link to Plan |
| No usage numbers or teaching text in the product | "Nothing syncs until…" reads as teaching | Kept: it is a statement of state and decision-critical, not instruction |
