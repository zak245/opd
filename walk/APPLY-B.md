# Apply pass, group B

Files owned: `specs/06-inbox.md`, `07-tasks.md`, `08-deals-board.md`, `09-deal-record.md`, `10-campaigns.md`, `11-accounts.md`, and `src/ollopa/usage/{inbox,tasks,deals,deal,campaigns,accounts}.ts`. Nothing else was touched.

All seven walk logs were read. **106 changes applied, 4 resolved as merges or duplicates, 0 refused.** `npx tsc -b` exits 0; the duplicate-id check returns `[]`.

Item counts after the pass: inbox 63 (was 58), tasks 48 (34), deals 66 (62), deal 78 (68), campaigns 79 (69), accounts 77 (71). Every shape check in the six specs was recomputed from the real file with `shape()`, not estimated.

---

## Applied

### specs/06-inbox.md and usage/inbox.ts

| Walk | What |
|---|---|
| sdr C-32 | The Meant cell names its author in text — "Read as: Interested · by the reply agent · change" — and reads "by you" where a person set it, removed where nothing classified it. The agent-draft door sits beside the composer; the recipient and full text are on screen and Send is the approval |
| sdr C-35 | New §3 block, "Book and run the meeting": this spec owns `X-meeting` for the product (states proposed → booked → held/no-show/cancelled marked by a person, times or link, attendees with deal roles, prep brief with the qualification gap count, summary and action items with one "Create n tasks", follow-up draft, transcript where an integration supplied one, and the no-show sequence naming itself). Merged with cs 17 and ae 23, which asked for the same node from Tasks and the deal record |
| sdr C-36 | The handoff block: four fields in the buyer's words each carrying the agent's draft state, the binary checklist, "Create the deal and assign" naming owner and territory before the click, and the SDR's acceptance rate under it. The assignment half is removed where no AE seat exists |
| sdr C-50 | `inbox.agent-class`, `inbox.agent-draft` (critical), `inbox.meeting-panel`, `inbox.handoff-block` (critical), `inbox.acceptance-rate`, with per-business overrides and zero at Halyard for the meeting panel (no calendar) |
| — | §4 table, §6 level and door tables, decision-critical paragraph and §7 rewritten to match; §8 review row on the shape restated |

### specs/07-tasks.md and usage/tasks.ts

| Walk | What |
|---|---|
| sdr C-23 (the S1 decision) | The page opens in queue mode for SDR and AE and on the list for CS and admin. One labelled switch, "All tasks (24)" / "Work the queue (11)", in the same place in both directions; it **replaces the body rather than nesting**, so the list's doors stay level two. Applied once |
| sdr C-24 | `X-calllog` defined: purpose, the nine dispositions, a correctable duration timer, notes, and the always-visible line saying which two dispositions end the sequence. One node, four parents. The four outcome buttons stay as the queue's fast path |
| sdr C-25 | The phone with its do-not-call badge and the contact's local time move out of the row door onto the row, at every business |
| sdr C-26 | Queue header "Sort: due · call score", due the default, the agent's ranking applied only when chosen, the choice persists, with "how it was built" linking to the model |
| sdr C-28 | `X-linkedin`: the message text editable for this send, Copy, Open the profile, Mark complete under "Ollopa cannot see LinkedIn…" |
| sdr C-29 | "Invites this week: 38 of about 100", with "the cap is LinkedIn's, not Ollopa's" and "Snooze the rest to Monday" within ten of the cap |
| sdr C-46 | The nine call and LinkedIn usage items, plus `tasks.mode-switch`, `tasks.call-read`, `tasks.call-coaching-note`, `tasks.call-transcript` |
| cs 16 | `Meeting` added to `Task.kind`, in the Type filter, with the meeting panel as its row action |
| cs 17 | The meeting panel opens **from the row, never from inside the row door** — stated explicitly in the doors table and in the §8 review |
| leader-dev 32 | Two modes on the call panel, read and log; the transcript block removed where no integration supplied one, never disabled |
| leader-dev 33 | The coaching note inside the call, three fixed headings, timestamped, visible to the rep; agent suggestions carry suggested/edited/accepted and publish nothing until accepted; `ae_plus` numbers on reading a call and writing a note |
| agents 17 | The score chip in the Contact cell ("Fit 82 ▲ from 61"), text and arrow, the row never moving, the reason as the row door's first line in text |
| agents 18 | `tasks.row-score`, Ridgeline only, removed elsewhere |
| marketer 37 | Filter door renamed "Additional filters: source, status, sort (n)" |
| ae 39 | The meeting as a panel on the task row — merged into cs 17's fuller definition, with spec 06 owning the node |

### specs/08-deals-board.md and usage/deals.ts

| Walk | What |
|---|---|
| ae 1 | `lastProspectActivityAt`, `contactCount`, `seniorSponsor` and a computed `warnings[]` added to §2, with the six warnings, their triggers and their defaults in a table that reads from spec 09 |
| ae 2 | The six warnings as text chips on the card, each printing its observed number against its threshold |
| ae 3 | Filter door relabelled "Filters: warnings, no next step, owner, …", warnings first; the unnamed "stale" filter deleted |
| ae 4 | "No next step (n)" and, where the seat has reports, "Comments waiting for you (n)" as counting chips at level one |
| ae 5 + leader-dev 12 | The card's door deleted. The card opens `Q-deal`, flat, in the record's order and labels, one editable field **by ownership**: stage for the owner, the comment composer for anyone else |
| ae 6 | Next step and its date together on the card, in the table column, in the quick look, and as one inline editor that saves both |
| ae 7 | Forecast category at level one on the card for the AE, matching the record |
| ae 8 | "Use this next step · Dismiss", applied with Undo and logged; Approve and Decline reserved for the irreversible |
| ae 9 | Delete leaves the card menu; it lives on the record where its consequence is visible without a click, and in the bulk bar |
| ae 10 + leader-dev 1 | An AE-with-reports column: scope defaults to My team, owner on the card, owner filter beside scope |
| ae 47, leader-dev 4 and 6 | `deals.card.warnings`, `deals.card.touch-reply`, `deals.filter.warnings`, `deals.filter.no-next-step`, `deals.filter.comments`, `deals.forecast.coverage`; `ae_plus` on `deals.card.owner` and `deals.filter.owner` |
| leader-dev 5 | Coverage in the strip for AE+: observed and required on one line |
| leader-dev 7 | "Last touch 3d · last reply 19d" replaces the bare stale line |
| ae 25 | The close-won consequence is read from spec 09 word for word; this spec no longer writes its own |

### specs/09-deal-record.md and usage/deal.ts

| Walk | What |
|---|---|
| ae 13 | `Deal.qualification` over the eight MEDDPICC elements with state, source, author and time, and `QualEvidence` with the quote and its conversation |
| ae 14 | The Qualification card above Contacts for the AE — "Qualification · 5 of 8 · 2 to validate", one row per element with its state chip, one line of provenance, Validate and Edit. A door for the Meridian admin and CS; removed at Halyard |
| ae 15 + agents 30 | The "Evidence and source quotes (n)" door, in place under the card, removed where no conversation input exists |
| ae 16 | Meridian's "Champion confirmed" checkbox deleted; the door's count becomes (5) |
| ae 17 | `Blocker` added to `DealContact.role` |
| ae 18, 19 | The stage gate printed on the step before the click, naming the missing elements and who set the rule; a "Blocked by stage requirements" state |
| ae 20 | The agent proposal is level one for every seat when one exists and removed when none does, marked ★ |
| ae 21 | The provenance rule stated in full in §6.6: state, author and source on every generated value; a human signature per brief section; nothing generated overwrites a validated value; **no auto-accept setting exists** |
| ae 22 | The composer's Email *is* the reply panel, the agent draft beside the human's, the send button carrying mailbox, credits and where replies land |
| ae 23 | The meeting card (attendees with roles, state, prep brief, qualification gaps; then summary, action items, follow-up) and the Brief as a record page |
| ae 24 | The follow-up panel lists action items with checkboxes and one "Create 4 tasks", offered when the panel closes |
| ae 25 | One close-won consequence sentence owned here, gated on the hand-off brief where a CS seat exists and the gate removed where none does |
| ae 26 + leader-dev 10 | `Note.to`, `Note.mentions` and an unanswered state; a Comment action landing on the timeline with "For Priya Raman", answered in place, reaching Home and the digest, never the bell |
| ae 27 | Door counts corrected: "Evidence · n", "Company signals and news (n)", "All fields (17)", "Sync history · last 10"; "Show full email" keeps none |
| ae 28 + agents 31 | Ten new usage items (qualification card, validate, evidence, gate, meeting card, brief, summary, follow-up, comment, account health); §4.1 recomputed |
| agents 20 | State chips on every agent-writable field, here and in spec 11 |
| agents 30 | The proposal card carries actor, old → new, the quote with speaker and date, the state chip, the full consequence including the amount Friday's forecast moves by, and "Open the full evidence"; Approve and Dismiss the same size; the card and the queue row are one object decided once |
| cs 9 | §6.8 Company and Account merged into one row, "Company (account when a customer)" |
| cs 10 | That row's doors rewritten (All activity · n; Agent research · n runs; Signals and news · n; CRM sync · synced hh:mm; Parent and subsidiaries; Full history, custom fields and files; Enrichment; one tab, People (n)); Locations and Similar companies removed |
| cs 12, 13 | Deal type as a chip beside the title for CS everywhere and the AE at Ridgeline; `field.deal-type` raised to cs 45, Ridgeline cs 70 / ae 30 |
| cs 14 | "Files (2)" → "Files and the proposal · 2" |
| cs 15 | An "Account health · why" side card on a renewal- or expansion-typed deal, removed on new business |
| cs 32 + sdr C-01 | One Brief row in §6.8, merged from both walks: header with author and assembled-on, sections as written, source records, "Sources and citations · n" and "History", generated lines marked apart, "Approved by {name}" or "Not yet approved", no quick look |
| leader-dev 13 | "Contacts · 5 · 2 have replied", each row carrying its last two-way contact |
| sdr C-17 | The Contact row loses its activity door: the activity is the page, and `X-calllog` opens from a call item |
| sdr C-37 | A new paragraph stating the prefill and the owner rule for a deal created from a reply, and the "Handed over by … · handoff brief" line in the header |

### specs/10-campaigns.md and usage/campaigns.ts

| Walk | What |
|---|---|
| marketer 1, 3, 7 | Total size, net size and six suppression counts at level one on the audience record, unsubscribed and bounced marked "always applied", every count a link into the records panel; the door holds the **rules**, not the counts; `aud.suppressed` relabelled and raised |
| marketer 4, 5 | Live or frozen with its cadence and what it feeds, beside the size, Freeze one click; `aud.mode` added, critical |
| marketer 9 | Notes is where the campaign brief lives; an audience shows "Built for: {campaign}" |
| marketer 12, 13, 14 | `X-qa`: eight checks, flat, failures in words with Fix links that navigate, the runner named and marked when it is the builder; a QA line above Schedule that never disables it and travels with an approval request; three usage items |
| marketer 15 | "Build an audience from: attended n · did not attend n · hand-raisers n" under Results |
| marketer 16 | "Hand to sales" writes to a named sales-owned list, states the consequence, and says the marketer never reaches the enrol panel |
| marketer 17 | The sender approves their own send; second approval above the workspace threshold; a lifecycle campaign measured on enrolment over the period |
| marketer 18 | Desktop and 400 px previews side by side, not a menu |
| marketer 19 | While Sending: sent-so-far against the total, the observed rate against both thresholds, Pause the same size as Schedule |
| marketer 38 | "Additional filters: owner, audience, date, goal (n)" |
| marketer 40, 41, 43, 44 | Forms as the third object: the view switch reads "Campaigns 12 · Audiences 6 · Forms 4", the `Form` seed shape, the `R-form` sections, the cap line at level one, submissions still accepted and routed at the cap with "Raise the cap" beside it, fields marked asked or enriched, a known field **removed rather than pre-filled invisibly**, the unrouted count never behind a door, and six usage items |
| marketer 51 | Archiving asks for one line and writes it to Notes and the report row; results kept |

### specs/11-accounts.md and usage/accounts.ts

| Walk | What |
|---|---|
| cs 8 (**the key decision**) | The account record page is gone. The company record renders the customer-state fields and sections when `Company.stage` is Current client or Churned; `/ollopa/accounts/:id` redirects there; Accounts stays a page with its own table, columns, quick look and row actions. §1, §3, the doors table, keyboard, phone width and the review were all rewritten, and the record template stays owned by spec 09 |
| cs 4, 6 | The four health drivers as flat lines under health in the quick look; `work.health-drivers` note extended to state the rule-5 exception in the walk's words |
| cs 19 | "Additional filters: risk type, plan, churned accounts (3)", and the sentence defending "More" deleted |
| cs 20 | `X-play`: the play, what it will create before the button, the owner, the routing band and SLA, the recheck date; agent content logged not queued |
| cs 21 | A "Signals and news · n" row door with what fired, when, from where, the routed owner and the due date |
| cs 22 | Default sort is health (lowest) at Ridgeline, renewal (soonest) elsewhere |
| cs 23 | `firstValue` and `goals[]`; the Onboarding stalled risk type; `AccountSignal` gains `routedTo`, `dueBy`, `outcome` |
| cs 24 | The renewal ladder: reminder tasks at 120, 90, 60 and 30 days from the Settings value, landing on Tasks, with the line that CS does not hold Workflows |
| cs 27 | The drivers section names the admin who owns the weights and carries "This flag was wrong", which writes a request |
| cs 28 | Fathom and Halyard leave Accounts out of the sidebar; ⌘K, deep link, "Add to sidebar", and the two-week exposure on the first closed-won deal |
| cs 29 | Accept carries its consequence **before** the button, in both places, including that the baseline is taken today and the AE is told |
| cs 30 | Support tickets are outside the boundary; an escalation is a risk of that type; nothing hints at an integration |
| cs 31 | The expansion route creates a typed expansion deal and a task for its new owner with the brief attached; `Handoff` is the closed-won seam only |
| ae 37 | `Handoff` gains `signer`, `users[]`, `risks`, `dissenters`, `deadline`, `deadlineWhy`, with the seven sections named |
| ae 38 | Accept's effect stated in full: the account's owner becomes the CSM, the deal keeps its AE for reporting, and the CSM sees who wrote which section |
| agents 20 | State chips on agent-writable fields |
| — | Six new usage items (`work.play`, `work.signals-door`, `work.first-value`, `work.goals`, `work.flag-wrong`, `renew.ladder`) and a recomputed six-pair shape check |

---

## Resolved as merges or duplicates, not applied twice

| Walk row | Why |
|---|---|
| sdr C-02 (spec 09 §6.8, Company row doors) | Superseded by cs 10, which is the later and better-formed version: it keeps the People tab that the record pattern and PLAN.md's "at most one tab" allow, drops Similar companies (already removed by spec 11) as well as Locations, and gives every door a count. C-02's "no tab" would have pushed a 48-row related table into a scrolling section. |
| leader-dev 7, the filter half ("stale" → "No reply in n days") | Subsumed by ae 3: Ghosted **is** "no reply in n days" and is one of the six named warnings, so a separate filter would have been the same cut under a second name. The card half of the row — "Last touch 3d · last reply 19d" — was applied in full. |
| cs 18 (Tasks filter door) | Same change as marketer 37, which additionally carries the active count. Applied once, in marketer 37's form. |
| ae 39 (`X-meeting` on the task row) | Same node as cs 17 and sdr C-35. Applied once: spec 06 §3 owns `X-meeting`, spec 07 renders it from a meeting task row and the queue body, spec 09 renders it from the meeting card. IA-MAP §6.5's assignment (C-45) decides the owner. |

Nothing was refused for contradicting a PLAN.md decision.

---

## Where a number was stated rather than fitted

Four pages now sit above the 15–25% head band for their resident role, and in each case the spec says so with its cause instead of re-rating a daily item downwards:

- **Tasks**, Meridian SDR 48% and Halyard SDR 52% (from 38% and 44%). Fourteen items arrived; twelve are the SDR's daily work. This is PLAN.md's accepted density case, and point 2 of the score stays a 1.
- **Deal record**, Meridian AE 38% (from 32%). Halyard's admin, with eleven of the same items removed, reads 24% from the same table — which is the argument that the model is describing jobs rather than flattering one.
- **Campaigns**, Meridian marketer 37% and Ridgeline marketer 42% (both from 33%). Forms baselines at Meridian were deliberately set at about half the Ridgeline numbers, because Meridian has four forms and Ridgeline's pipeline starts at one.
- **Inbox**, Meridian SDR 30% and Fathom founder 27% (from 24% and 22%), after the meeting and the hand-off arrived on a page the SDR already worked all day.

Deals board moved from 21–24% to 26–29% on five of seven pairs, stated the same way. Accounts' Meridian CS reached the top of the band at 25%; Ridgeline CS is at 34%.

In every case the page got **wider, not deeper**: the card door on the board was deleted, the suppression counts came out of a door onto the audience record, the previews came out of a menu, the phone and its do-not-call flag came out of the row door, and the health drivers came out of a door onto the quick look.

---

## Cross-group dependencies

Things my files now reference that another editor must land.

**IA-MAP.md** (map owner)

- `D-deals-filters` must read "Warnings, no next step, owner, stage, close date, forecast category" (ae 43). Spec 08's door now says exactly this.
- `X-reply` parents must gain `R-deal` (ae 40): spec 09's composer Email is that panel.
- `Q-deal` must read "one editable field, by ownership" (leader-dev 12): spec 08 now specifies stage for the owner, the comment composer for a non-owner.
- `D-acct-health` must be **deleted** (cs 5): spec 11 now has the drivers as flat lines in the quick look and a section on the record, and the four walks C3, C4, C6 and G3 need rewriting.
- `Q-company` must gain `P-accounts` as a parent, with the edge `P-accounts` row ─RC→ `Q-company` ─QO→ `R-company` (cs 7). Spec 11's quick look is now the company record's quick look.
- `R-company` must gain `D-co-activity` and `D-co-history` (cs 11); spec 09 §6.8 names them.
- `X-meeting` (merged from `X-book`, sdr C-34) is owned by spec 06 and rendered by 07 and 09; `X-calllog` and `X-linkedin` by spec 07 (sdr C-45). `D-person-activity` is removed (C-41), which spec 09's Contact row now assumes.
- `D-task-filters` and `D-camp-filters` must be relabelled "Additional filters: … (n)" (marketer 37, 38).
- `X-report-records` must gain `R-audience` as a second parent (marketer 6): every count on an audience now opens it.
- S9 and S10's walks change shape because Tasks opens in queue mode (sdr C-27, C-44).

**specs/03-companies.md** — the company record must render the customer-state field set and sections (cs 8) and carry the eight doors named in spec 09 §6.8 (cs 10, cs 11), plus "Open the brief" on the latest research run (sdr C-03). Spec 11 now sends every row there and builds no record of its own.

**specs/14-settings.md** — five things my specs read and do not own: required-fields-to-enter-a-stage, the six deal warnings with their thresholds and observed values, and targets per period (ae 36); renewal reminders at 120/90/60/30 (cs 25); expansion routing bands and the "no first-value milestone in 90 days" signal (cs 26); the `S-scoring` area the score chip and the persona filter read from (marketer 20–22); the agent line "Agents never overwrite a field a person set or confirmed" (agents 19), which spec 09 §6.6 now states in full.

**src/ollopa/data/businesses.ts** — Meridian needs the AE seat with `reports: ["Elena Vasquez"]` and `Role` needs `reports?: string[]` (ae 45). Spec 08's AE+ column and the `ae_plus` numbers in `deals.ts`, `deal.ts` and `tasks.ts` describe a seat that no business currently declares.

**src/ollopa/usage/model.ts** — already carries `ae_plus`, `UsageRole` and the four-argument `weeklyUse`; I used the key as `ae_plus`, not `aePlus`, matching what is in the file.

**specs/12-reports.md** — owns Forecast, `X-forecast` and the goal denominator (ae 29–35, cs 33–34, leader-dev 17–20). Spec 09's proposal card cites "the forecast you submit on Friday", and spec 08's coverage figure shares the win rate with the Pipeline tab (leader-dev 16).

**specs/05-sequences.md** — the LinkedIn step editor must carry the message text with the variable menu (sdr C-30); spec 07 renders that text and says it is written once on the step.

**specs/13-agents.md** — must state that a reply draft shown in the Inbox composer is approved there and does not also appear in the Agents queue (sdr C-33). Spec 06 now asserts it from this side.

**specs/02-people.md** — the form submission's answers as a note at level one while the contact is pre-first-touch (marketer 45); spec 10's Forms block writes that note.

**specs/01-home.md** — "Needs attention (n)" linking to Deals filtered to warnings (ae 11) depends on the warnings this pass added to spec 09 §2 and spec 08 §3.
