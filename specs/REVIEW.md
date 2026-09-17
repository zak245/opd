# Cross-page consistency review

*Reviewing editor's pass over the sixteen page specs (00–15), `RULES.md`, `PRODUCT.md`, `USAGE-MODEL.md` and `src/ollopa/usage/*.ts`. Nothing here rewrites a spec. Every item names the specs involved and one recommended resolution.*

---

## 1. Contradictions between specs

| # | Thing | Position A | Position B | Resolution |
|---|---|---|---|---|
| 1 | **Deal stages and "Closed lost"** | Seed has five (`DEAL_STAGES`: Qualified, Discovery, Proposal, Negotiation, Closed won). 14-Settings lists those five with probabilities, no Closed lost. 01-Home's pipeline door is a "five-column count grid" | 08-Deals and 09-Deal add `Closed lost` as a sixth stage (0%, Omitted) with `lostReason`. 12-Reports instead adds `outcome: open/won/lost` plus `lostReason` as deal fields, not a stage | Six stages, defined once in 09; `outcome` is derived from stage. Fix 12 and 14; Home's grid is four open stages plus two closed rails |
| 2 | **Account / company stages** | 03-Companies: Cold, Active opportunity, Current client, Churned **plus a new "Do not prospect"** | 14-Settings says account stages are the four `Company.stage` values; 11-Accounts uses Churned and never mentions Do not prospect | Five account stages, owned by 14-Settings (`pipe.contact-stages`); 03 and 11 read them |
| 3 | **Campaign entity** | 10-Campaigns: `kind: Email \| Lifecycle`, audienceId, trigger, eight delivery metrics | 12-Reports: `channel: email \| in-app \| webinar \| event`, `byAudience`, `dealsCreated`, `pipelineAmount`. 01-Home and 00-shell define two further, shorter shapes | 10 owns `Campaign`. Drop `channel`; Reports reads 10's fields and adds only `dealsCreated`/`pipelineAmount` |
| 4 | **Which CRM each business runs** | 14-Settings: Meridian HubSpot, Ridgeline Salesforce, Fathom and Halyard none | 15-Connect: Meridian Salesforce, Ridgeline HubSpot, **Fathom HubSpot**, Halyard HubSpot per client. 09-Deal and 03-Companies say Salesforce at Meridian, HubSpot at Ridgeline | Meridian Salesforce, Ridgeline HubSpot, Fathom none, Halyard one client CRM per workspace. Fix 14 §2.2 and 15 §2 |
| 5 | **Calendar connected** | 06-Inbox: "all four businesses have one connected", so Book meeting always works | 14-Settings gives a calendar only to Meridian and Ridgeline; 15-Connect gives Fathom one and Halyard none | Meridian, Ridgeline, Fathom yes; Halyard no. Inbox's "Connect a calendar to book from here" state is Halyard's |
| 6 | **Bounce guard thresholds** | 14-Settings and 05-Sequences: warns at 4%, pauses at 6% | 12-Reports seeds `bounceGuardThreshold` 3.5%; 00-shell writes "5.1% warning"; 10-Campaigns turns the bounce cell red "above 4%" | One pair, 4% and 6%, owned by `mail.bounce-guard`; every page prints the same two numbers |
| 7 | **Who may approve agent actions** | 13-Agents: the owner of the contact approves; an admin may approve on anyone's behalf, recorded as such | 01-Home shows SDR rows reading "Only Daniel Okafor (RevOps admin) can approve this". 10-Campaigns adds a second, different approval (sends over 5,000 need the admin) | One approval policy in Settings: the item's owner approves, the admin may approve for anyone. Home's "only the admin" row applies to workspace-level actions only; the campaign send threshold becomes a named Settings item |
| 8 | **Where auto-feed of a segment lives** | 04-Lists owns it: `detail.auto-feed`, decision-critical, "New matches added to Q4 enterprise outbound automatically · Turn off" | 10-Campaigns' Audience has type Segment and "Rebuild now" but no auto-feed control; 05-Sequences never mentions being fed by a list | Lists owns the feed and its off switch. Sequences and Campaigns show a read-only "Fed by {list}" line linking to Lists |
| 9 | **The reply drawer** | 01-Home: "Reply → Opens the reply drawer (a later case)" | 06-Inbox: the composer is inside the thread panel at level one; there is no drawer and no later case | No reply drawer. Home's Reply navigates to Inbox with that thread open |
| 10 | **Plan gating** | 02, 03, 10, 12 and 15 all list plan-gated filters, A/B tests and click metrics under *removed rather than hidden*; ollopA has no plan gates | 15-Connect §3.6 gives Fathom a Salesforce card reading "Not on the Starter plan" | No feature is plan-gated in ollopA. Fathom's card reads "No CRM connected" |
| 11 | **Nav roles per page vs. business** | 00-shell and `nav.ts` fix roles per page: Inbox = SDR, AE; Tasks = SDR, AE, CS; Sequences = SDR, AE, admin | 06-Inbox gives Fathom's admin the Inbox; 07-Tasks gives Fathom's and Halyard's admin tasks; 08-Deals calls Fathom's founder the AE | `NAV.roles` gains a per-business overlay (Fathom admin = SDR + admin). Until then those three specs are unbuildable |
| 12 | **What a role without the page sees** | 00-shell: a no-access page naming who has it; the palette returns one explanation row | 05-Sequences gives marketer and CS a **read-only page by link**; 07-Tasks gives the marketer an **empty state** with New task | One rule: no nav entry → no-access page. If read-only-by-link is wanted, it belongs in 00 and applies everywhere |
| 13 | **"More" as a door label** | 02-People, 04-Lists, 05-Sequences and 09-Deal all record renaming a "More" door by content | 03-Companies ships "More: import, export all, merge, alerts"; 11-Accounts ships "More columns / More filters / More actions" (while its own lesson says "no door called More"); 07 and 10 ship "More filters: …" | Ban bare "More …". Allow "More filters: owner, location, signals (n)" as content-labelled. Decide once, apply to 03, 07, 10, 11 |
| 14 | **The record template's shape** | 09-Deal defines `RecordPage` (page, header grid, side cards, in-place doors) and says the company page reuses it; 03-Companies specifies exactly that | 11-Accounts renders the same underlying company as a **drawer** with collapsible sections | Account detail is a `RecordPage` at `/accounts/:id`; the drawer becomes the phone presentation |
| 15 | **AEs and Lists** | 04-Lists and `nav.ts`: AEs have no Lists page | 02-People gives the AE "Add to list" and a Lists column | Keep the row action; the toast links to People filtered by list, not to Lists |
| 16 | **Where the Halyard client-workspace name renders** | 01-Home puts it in the page header; 13-Agents puts it in the briefing; 06 and 08 say "per workspace" without a label | 00-shell's top bar has no workspace name at all; the business name sits at the foot of the sidebar | Shell owns it: the workspace name goes in the top bar for every page at Halyard. Remove the per-page copies |

---

## 2. Shared things that must be defined once

| Shared thing | Used by | Recommended owner |
|---|---|---|
| **Credit price list** (`enrich 2, revealEmail 1, revealPhone 8, research 12, export 0`) | 02 (defines it), 03, 04, 09, 13, 01 | Move out of 02 into `src/ollopa/data/credits.ts`; every spec cites it. Values already agree — keep them |
| **Record template** (`RecordPage`, Field/Door/Card, the eight enforced rules) | 09 (defines), 03 company record, 11 account detail, 02 contact record, 14 user and mailbox detail | 09-Deal record |
| **Table template extensions** (sortable headers, columns popover, bulk bar, in-place filter row, skeleton loading, focus-visible row actions) | 02, 03, 04, 06, 07, 08, 10, 11, 12 — each specifies its own version | 02-People, as the full table lesson; others cite deltas only |
| **Seed additions** | all sixteen — see §6 | One consolidated seed spec; today 02, 03 and 09 each redefine `Company` and `Deal` fields |
| **Notification types and the interrupt/digest split** | 00 (defines six kinds), 01 (toasts), 13 (`set.notify`), 11 (hand-off), 14 (deleted the Notifications settings page) | 00-shell. **Open conflict:** 14 removed the settings page while 00's panel footer links to it |
| **⌘K palette scope** (nine result groups, action list, role gaps, shortcut hints) | 00 (defines); 02–15 each add "the palette lists every action with its shortcut" | 00-shell; page specs register actions, they do not restate the palette's rules |
| **Health strip / policy line / briefing** — all render bounce guard, credit burn, sync errors | 01-Home (health strip), 14-Settings (the strip), 10-Campaigns (policy line), 13-Agents (briefing), 00-shell (credits pill) | One `WorkspaceHealth` object, owned by 01-Home; the other three render subsets of it |
| **Approval policy** (what agents may do unattended, who approves, caps) | 14 (`ai.approvals`, `ai.credit-caps`), 13, 01, 08 (card approvals), 09 (proposal card), 10 (send approval) | 14-Settings; 13 displays and links |
| **Bounce guard** (thresholds, current rate, paused mailboxes) | 14, 05, 10, 12, 01, 00, 13 | 14-Settings (`mail.bounce-guard`) |
| **Business profiles** (which seats exist, CRM, calendar, campaigns) | every spec | `businesses.ts`; see §3, the model has no "this seat does not exist here" |

---

## 3. Usage model issues

**Duplicate item ids** (`itemById` returns the first match, so a lesson can cite the wrong item):

| Id | Files | Labels |
|---|---|---|
| `tasks.done` | `tasks.ts`, `deal.ts` | "Done" / "Mark a task done" |
| `camp.sort` | `campaigns.ts`, `reports.ts` | "Sort by column" / "Sort campaigns" |

The DEV-only warning in `index.ts` catches these but nothing fails. Namespace ids by page (`deal.task.done`, `rep.camp-sort`).

**Shell items are filed under `page: "home"`.** `home.ts` has 38 items, `shell.ts` 78, both keyed `home`, so `itemsFor("home")` returns 116 and the head share computes at 30–47% instead of the 21–26% that 01-Home reports. Both specs' own numbers are right against their own files; the code cannot reproduce either. Give the shell its own `Page` key.

**Head share above 25%.** Every page spec computes its own denominator differently — 00-shell excludes items the role lacks *and* the sidebar, 02 and 06 count every item, 11 counts every item. Pick one rule. Over-band pairs, and whether the spec justified them:

| Page, pair | Head | Justified? |
|---|---|---|
| 03 Companies, Meridian SDR 27% / Halyard SDR 35% | yes | density case named in PRODUCT.md |
| 07 Tasks, Meridian SDR 38% / Halyard SDR 44% / Meridian AE 29% | yes | operate-all-day argument; AE at 29% is asserted as "a touch above" without a reason |
| 09 Deal, Meridian AE 32% / CS 29% / Ridgeline CS 32% / Halyard admin 28% | yes | four separate reasons given |
| 10 Campaigns, marketer 33% at every business | yes | "first screen, items are daily" |
| 11 Accounts, Ridgeline CS 30% | yes | trimmed from 41% and stated |
| 12 Reports, Halyard admin 36–41% | yes | client-report case |
| 13 Agents, Fathom admin 28% | yes | |
| 14 Settings, Halyard admin 29% | yes | "the stretch case" |
| 01 Home, Fathom admin 47% / Halyard SDR 37% | yes | two jobs, one person |
| 05 Sequences, Fathom admin 26% / Halyard SDR 27% | yes | |
| 04 Lists, Halyard SDR 26% | partly | table says 25%; off by one item |

No page is over the band without an argument. The weakness is the inconsistent denominator.

**Critical marks that `RULES.md` would not call decision-critical.** Rule 7's list is price, fees, commitment, what a destructive action does, how data is used, safety state. These stretch it, and all are already head items, so the mark buys nothing: `tasks.rows` and `tasks.summary` (the page's own content at 95%), `camp.list.status` (95%), `camp.list.audience` (80%), `ho.waiting` (a queue, not an approval). `data.asof` (Reports freshness) is a defensible extension but should be argued once in RULES.md, not per page.

**Destructive actions *not* marked critical, where a sibling spec marks its twin.** `lists.row.delete` (3%), `deals.action.delete` (2%) and `close.delete` (1%) are critical; but 03's "Remove from workspace, with what it stops" (3%), 11's "Mark churned" (3%) and "Remove account" (1%), 05's "Archive a sequence" (deletes scheduled emails) and 07's "Delete a manual task" are not — so they compute to level two. Mark every destructive action critical, or none.

12-Reports names four decision-critical items in prose (forecast, bounce rate, data as of, the export "no credits" line) and marks three in `reports.ts`.

**Missing per-business overrides.** `weeklyUse` falls back to the baseline whenever a business override does not name the role, and there is no way to say a seat does not exist. PRODUCT.md gives Fathom two seats (admin, SDR) and Halyard two (admin, SDR):

| Phantom seat | Items with a number | Items that compute to level one |
|---|---|---|
| Fathom marketer | 394 | 82 (23 of them on Campaigns, a page that has no campaigns there) |
| Fathom CS | 428 | 85 |
| Halyard AE | 698 | 158 |
| Halyard marketer | 394 | 82 |
| Halyard CS | 428 | 85 |

`campaigns.ts` and `settings.ts` both carry a header comment saying "only sdr and admin exist" at Fathom and Halyard, and both then override only `sdr` and `admin`. Add `seats: Role[]` to `businesses.ts` and have `weeklyUse` return 0 for a seat the business does not have. Ridgeline is fine — all five seats exist.

Thin override coverage where the profile clearly bites: `settings.ts` has Ridgeline overrides on 8 of 59 items and Halyard on 13, though PRODUCT.md says Halyard's workspace settings are daily; `deal.ts` has Ridgeline overrides on 14 of 68; `people.ts` has 56 of 113 items with no override at all.

---

## 4. Rule violations and generous scores

| Spec | Problem | The line |
|---|---|---|
| **05-Sequences** | Scores **18 of 18** with point 9 = 2, on the same evidence for which thirteen other specs score 1 | "9. Door opens are logged; the semi-annual promote-keep-delete review reads the data file. **2** … 18 of 18 as specified" |
| **11-Accounts** | Point 4 scored 2 while three of its five doors are named "More" — rule 4's test is literally "Does it say 'Advanced', 'More' or 'Other'?" | Doors table: "More columns (n)", "More filters (3)", "More actions"; lesson §7: "no door called More" |
| **11-Accounts** | Rule 2: the account drawer holds fifteen collapsible sections, i.e. page → drawer → section. The spec declares the problem away | "Drawer sections risked becoming doors inside a door → Sections are headings with collapse state, not doors" |
| **03-Companies** | Point 4 scored 2 with a page menu labelled by nothing | "More: import, export all, merge, alerts" |
| **10-Campaigns** | Point 4 scored 2 with an unlabelled row menu | "More actions (⋯) — Each row — Visible actions plus the rare ones" |
| **12-Reports** | Point 1 scored 2 while the fee statement sits behind a door; rule 7 puts fees on screen | "Fee line behind the Export door → Kept there and justified: the decision is made in that menu" |
| **14-Settings** | Point 6 scored 2, but the spec deletes the Notifications page while 00-shell's panel links to it for digest, Slack, push, mute and quiet hours — the preference is now split from nothing, or from everything | 6.7: "the Notifications page (preferences live on Agents and Inbox)" vs 00 §3.4: "'Notification delivery', which opens Settings at your user's row" |
| **15-Connect** | Rule 4 and the product's own "no plan gates": a card that opens onto a paywall | "Fathom — The Salesforce card reads 'Not on the Starter plan'" |
| **07-Tasks** | Point 2 scored 2 with a head at 38–44%; defensible, but the same argument is scored 2 where 02 and 03 score themselves down for less | "The Meridian SDR head is 38% and Halyard's SDR reaches 44%. That is deliberate" |

---

## 5. Decisions only the product owner can make

1. **Six deal stages or five plus an outcome flag?** Recommend six, with Closed lost at 0% / Omitted, defined in 09 and read by 08, 12 and 14.
2. **Which CRM at which business?** Recommend Meridian Salesforce, Ridgeline HubSpot, Fathom none, Halyard one client CRM per workspace; amend 14 and 15.
3. **Is any feature plan-gated?** Recommend no — parodying Apollo's gates is the point; delete the Fathom Salesforce paywall card.
4. **Does navigation vary by business, or only by role?** Recommend a per-business overlay on `nav.ts` so Fathom's founder gets Inbox and Tasks; otherwise cut those passages from 06, 07 and 08.
5. **Does a role without a page get a no-access page, or a read-only view?** Recommend no-access everywhere; 05's read-only sequences and 07's marketer empty state come out.
6. **Who approves an agent action, and what triggers a second approval?** Recommend: the owner approves, the admin may approve for anyone; add one Settings item for the campaign recipient threshold rather than hard-coding 5,000 in 10.
7. **One bounce guard pair for the whole product?** Recommend warn 4% / pause 6%, owned by Settings; 12's 3.5% and 00's 5.1% become the observed rates they were meant to be.
8. **Is "More filters: owner, location, signals (n)" an acceptable door label?** Recommend yes for a label that lists its contents, no for bare "More"/"More actions"; then 03, 07, 10 and 11 need one rename each.
9. **Is an account a record page or a drawer?** Recommend a `RecordPage`, so 09's template holds for contact, company, account and deal; 11 keeps the drawer only at phone width.
10. **Does the usage model need to know which seats exist per business?** Recommend yes — `seats: Role[]` in `businesses.ts` and a zero return in `weeklyUse`; without it five phantom seats each get a full level-one page.

---

## 6. Seed data additions, consolidated

| Entity | New fields | Specs that need them |
|---|---|---|
| `Contact` | `lastContacted`, `phoneNumber`, `phoneRevealed`, `location {city,country}`, `tz`, `seniority`, `department`, `lists[]`, `source`, `created`, `linkedin`, `jobChange`, `opens`, `replies`, `crmId`, `crmSyncedAt`, `customFields`, `doNotContact` | 02, 04, 07, 09 |
| `Company` | `signals[]`, `revenue`, `location`, `founded`, `description`, `source`, `addedOn`, `enrichedOn`, `parent`, `lists[]`, `notes[]`, `crm {synced,lastError}`, `customFields`, stage value `Do not prospect`; `contacts` becomes derived; health fields (`health`, `healthDelta7d`, `renewalDate`, `arr`, `expansionSignal`) | 01, 03, 09, 11 |
| `Deal` | `Closed lost` stage + `lostReason`, `forecast`, `pipeline`, `currency`, `nextStepDue`, `createdAt`, `stageEnteredAt`, `stageHistory[]`, `syncState`/`crmId`/`crmSyncedAt`/`crmError`, `agentProposal`, `custom{}`, the All-fields tail (`dealType, source, campaign, competitor, contractTerm, paymentTerms, discount, proposalLink, esign, splitOwners, tags, priority, lineItems`), `outcome`, `closedDate` | 01, 08, 09, 12 |
| `DealContact`, `DealActivity`, `DealFile` | new types (role; kind/at/by/summary/detail/meta; name/size/uploadedBy/at) | 09 |
| `Task` | `owner`, `status`, `snoozedUntil`, `doneAt`, `outcome`, `contactId`, `dealId`, `step {n,of,title}`, `title`, `createdBy`, `creator`, `history[]`, `notes[]`; due range −4…+6 days; 40 rows per business | 01, 07, 09 |
| `Reply` | `handled`/`status`, `contactId`, `mailbox`, `step`, `body`, `messages[]`, `handedTo`, `followUpOn`, `returnsOn`, `dealId` | 01, 06 |
| `Sequence` | `paused`, `finished`, `notSent`, `sent`, `delivered`, `opened`, `interested`, `meetings`, `bounceRate7d`, `guardState`, `pausedBy`, `mailbox`/`mailboxRotation`, `dailyCap`, `schedule`, `ruleset`, `priority`, `tracking`, `sharedWith`, `createdAt`, `updatedAt`, `archivedAt`, `stepStats[]` | 05, 12 |
| `SequenceStep`, `Enrollment`, `SequenceChange` | new types (see 05 §2.2) | 05 |
| `Schedule`, `Ruleset`, `Mailbox` | workspace and per-user tables | 05, 14 |
| `AgentEvent` | `to`, `draft`, `sources`, `confidence`, `decision`/`status`, `decidedBy`, `decidedAt`, `approver`, `at`, `contactId`, `contact`, `company`, `dealId`, `ifApproved{}`, `steps[]`, kind `capped`; 60 events per business | 01, 03, 09, 13 |
| new `Agent` | `id, name, on, can[], needsApprovalFor[], capPerDay, capPerMonth, spentToday, spentThisWeek, pausedReason` | 13, 14 |
| new `List` | `id, name, kind, mode, memberIds, newThisWeek, feeds[], filters[], owner, visibility, source, createdAt, updated, lastRefreshed, alert, history[], archived` | 00, 02, 03, 04 |
| new `Campaign` | `id, name, kind, status, pausedBy, subject, previewText, fromName, fromMailbox, audienceId, audienceSize, sendAt, trigger, delayDays, exitRule, sent, delivered, bounced, opened, clicked, replied, converted, unsubscribed, goal, owner, sendsByDay[], variants[], activity[]`, plus `dealsCreated`, `pipelineAmount` for Reports | 00, 01, 10, 12 |
| new `Audience` | `id, name, type, size, sizeDelta, lastRebuilt, sources[], suppressed{unsubscribed,bounced,inSequence}, usedBy` | 01, 10 |
| new `Account`, `AccountRisk`, `AccountSignal`, `Handoff` | full field lists in 11 §2 | 01, 11 |
| new `Integration` + `crmFields`, `integrationErrors`, `syncRuns`, `setupDrafts` | `kind, name, environment, auth, objects, mappings, stageMap, rules, status, lastSync, nextSync, recordsToday, errorsToday, pausedBy, remoteCounts, calendars, channels, enrichment, webhook` | 03, 09, 14, 15 |
| new `settings` per business | the nine areas in 14 §2.2 (mailboxes, domains, bounce guard, users, profiles, security, pipelines, custom fields, schedules, rulesets, agent caps, invoices, tax id) | 05, 10, 13, 14, 15 |
| new `users[]` per business | name, role, team, permission profile, status, `creditLimit`, credits used, last active — up to `counts.users` | 02, 12, 14, 00 |
| new `WorkspaceHealth` | `bounceRate, bounceGuard, syncErrors, mailboxesNearLimit, invitesPending, setupRemaining[]` | 01, 10, 13, 14 |
| new `Activity` / `activityEvents` | per-user weekly `sentThisWeek, callsThisWeek, meetingsBooked`; 13 weeks of `{kind,user,contact,company,date}` | 01, 12 |
| new `notifications`, `syncErrors` | ~40 rows over seven days: `{id, kind, when, title, detail, target, unread, groupKey, interrupting}`; sync errors Meridian 3, Halyard 6, Ridgeline 1, Fathom 0 | 00, 01 |
| `businesses.ts` | `seats: Role[]`, `credits` unchanged, `bounceGuard {warn, pause}`, per-seat `creditLimit` | 00, 12, 14, and the usage model |
| localStorage keys | Ten different key shapes are specified (`ollopa.home.doors`, `ollopa.companies.<b>.<u>`, `ollopa.inbox.{b}.{r}`, `ollopa.deal.doors.<role>`, …). Settle one scheme | 00–15 |

*About 3,300 words.*
