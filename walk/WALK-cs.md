# Journey walk: customer success, C1–C6

*Walked 15 September 2026 against RULES.md, PLAN.md §2, IA-MAP.md parts 2, 3, 5 and 6, JOURNEYS.md, and specs 00, 03, 07, 09, 11, 12. Decisions are made, not asked. The three decisions the owner fixed before this walk are the frame: the **company record carries the customer state** (one object, one record, one quick look, two entry tables), **renewals and expansions are typed deals**, and **Accounts is a record page from the shared template with a flat quick look**. Every stop below was checked against those three first.*

**Headline.** No third level appears anywhere in the six walks, no decision-critical item sits behind a door on Accounts, and nothing is hover-only. All six journeys nevertheless fail, and they fail the same way: the customer-success area was specified before the map widened the boundary, so three of the nine new nodes the map handed to the specs (`X-play`, `X-meeting`, `R-brief`) have no spec home, the fifth Reports tab (`X-forecast`) was never written, the bell has no customer-success event kind, and spec 11 still builds a second record page for an object that has one. These are omissions, not disclosure violations — which is the good news, because omissions are cheap to close and a wrong structure is not.

**Totals.** 38 issues found (three further checks were run and passed, and are recorded as such). 35 changes proposed across 11 files. 6 of 6 journeys fail as specified; all 6 pass once the change list lands.

---

## The three decisions, checked first

| Decision | What the specs say now | Verdict |
|---|---|---|
| One object, one record | Spec 11 §1, §3, §6 build an account record page at `/ollopa/accounts/:id`; spec 09 §6.8's roster lists **Company** and **Account** as two separate fills of `RecordPage` with different headers, different sections and different doors | **Broken.** Two record pages for one object is the second version of the record the quick-look pattern forbids ("if removing it would lose a feature, it has become a second version of the record"). Fixed in change 1 |
| Renewals are typed deals | Spec 09 §6.3 puts **deal type** in the "All fields" door; `deal.ts` gives `field.deal-type` a weekly of 4 for CS | **Broken in practice.** A CSM whose entire book is typed deals reads the type on every visit. Rule 1. Fixed in change 12 |
| Accounts is a record page from the shared template with a flat quick look | Spec 11 §6 does this correctly, and the review table records the earlier fix (fifteen collapsing sections in the drawer became sections on the page) | **Sound.** The quick look is flat, read-only except the next step, same fields and order as the top of the record. It survives the walk unchanged except for the health drivers joining it (change 4) |

---

## C1 · Receive the closed-won handoff
*Meridian, monthly. Map walk: `G-bell` ─ND→ `R-deal` ─LK→ `R-brief` ─DR→ `D-deal-files` ─LK→ `R-company` ─PN→ `X-note` ─PN→ `X-book` ─DR→ `D-acct-health`*

### The stops

| Stop | Visible first, CS seat at Meridian | Doors, and what each holds | Container | Never lose sight of |
|---|---|---|---|---|
| `G-bell` | Four time sections, rows of text, an unread dot. Seven notification kinds exist; **none of them is this one** | None. A grouped row navigates, never expands | Right drawer, 360 px, its own channel | That something arrived that is now yours |
| `R-company` (proposed entry, see C1-2) | Name, domain, stage, owner; the customer-state field grid: health and band, renewal and days left, contract value, plan and seats, last touch, next step; then the hand-off section with from, sent, why they bought, what was promised, and **Accept** | Agent research · n runs; Signals and news · n; CRM sync · synced hh:mm; Parent and subsidiaries; All activity · n; Full history, custom fields and files | Page, deep-linkable; doors expand in place, enrichment in a drawer | Whether this hand-off is complete enough to accept |
| `R-brief` | The hand-off brief: goals in the customer's words, signer versus users, promises beyond the order form, risks, the deadline and why. The AE's own words marked apart from the generated summary | Sources and citations; History | Page (no quick look: a brief is opened, never scanned in a table) | Which lines are the AE's and which the agent wrote |
| `R-deal` (the won deal) | Header with the closed-won ribbon, amount, close date, owner; timeline; contacts; company | Files and the proposal · n; All activity · n; Full history and custom fields | Page; doors in the side panel, in place | The terms actually signed, not the terms discussed |
| `X-note` | The note body, who sees it, the records it attaches to | None | Panel on the record | That the question reaches the AE where the answer belongs, not by email |
| `X-book` | Attendee, the calendar link, the draft that carries it | None | Panel | That the kickoff exists before the momentum goes |

### Issues

- **C1-1 · Silent gap at the entry.** Spec 00 §3.4's notification table has seven kinds: reply, meeting booked, agent approvals, second approval, bounce guard, sync error, credits low. A hand-off arriving is not one of them, so the journey's trigger — "a deal is won and the handoff record appears" — reaches the CSM through nothing. Rule 4: if the user cannot find it, it does not exist.
- **C1-2 · The entry lands on the wrong node.** The map sends the bell to `R-deal`. The first decision is "is this complete enough to accept", and Accept lives on the account, with the customer state the CSM is taking ownership of. Rule 5: the decision and the thing it is about sit on the same screen.
- **C1-3 · A door attributed to the wrong parent.** The map walk reads `R-brief` ─DR→ `D-deal-files`. The files door hangs off `R-deal` (map 2.9), not off the brief. As written it is a navigation error; built as written it would be a door on the brief opening another record's content.
- **C1-4 · The door does not name the thing the journey needs.** Spec 09 §6.3 labels it "Files (2)". The journey's step is "confirm terms, seats and renewal date", which means the order form. The map already labels this node "Files and the proposal · n". Rule 4: the label names the contents.
- **C1-5 · Two of the journey's steps are outside the boundary and nothing says so.** "Skim the two most important recordings" depends on recording, which PRODUCT.md puts outside the line and map §6.3 resolved: no conversation node, a transcript is an integration input attached to `X-meeting`. The walk has no activity door and no meeting panel, so the step silently disappears.
- **C1-6 · "Set the health baseline" has no control and no statement.** Health is computed from stored drivers (spec 11 §2). There is nothing to press and nothing that says the baseline was taken.
- **C1-7 · Accept exists only on the hand-off strip on `P-accounts`.** The walk never visits `P-accounts`. Spec 11 §3's actions table puts Accept on the strip only, and its consequence is written as a result ("you become owner") rather than as a consequence line before the click.

### Decisions

1. Add two digestible notification kinds to spec 00 §3.4 — **Hand-off received** and **Account signal** (C5 needs the second). Digestible, never interrupting: a hand-off waits, and the interrupting list is safety state only. The hand-off row opens the **company record at the hand-off section**, which is where Accept is.
2. Rewrite the C1 walk in map part 5 to enter on `R-company`, read the brief, step into the won deal for the proposal and the logged calls, and return. One record, one loop.
3. Rename `D-deal-files` in spec 09 §6.3 to "Files and the proposal · n" and re-parent it correctly in the map walk.
4. Re-scope the recordings step in JOURNEYS.md C1 the way map §6.2 re-scoped L3: the CSM reads the **logged calls** behind "All activity · n" on the deal, with the transcript attached where an integration supplied one. The call library is a recorded reduction, not an invention.
5. Accept moves onto the hand-off section of the record as well as the strip, and carries a consequence line before the button: "You become the owner. The account joins your book, the health baseline is taken today, and Marcus Adeyemi is told." That answers C1-6 in the same sentence — the baseline is an effect of accepting, stated, not a control.

### Score

**No.** Two steps the specs forgot: nothing tells the CSM a hand-off arrived, and nothing accepts it from the record the walk lands on. No third level, nothing decision-critical hidden.

---

## C2 · Run onboarding to first value
*Ridgeline, weekly. Map walk: `P-tasks` ─PN→ `X-meeting` ─LK→ `R-company` ─PN→ `X-note` ─PN→ `X-task` ─DR→ `D-acct-health`*

### The stops

| Stop | Visible first, CS seat at Ridgeline | Doors, and what each holds | Container | Never lose sight of |
|---|---|---|---|---|
| `P-tasks` | "8 due today · 3 overdue · 13 later" as buttons; the rows: due, type, contact, what to do, from; Done, Skip. The queue button appears once a task exists; list is the default for CS (S1 decision) | Row door "History and contact"; "More filters: source, status, sort"; "Table options: columns, export"; the row menu | Page; row door in place, filters in a popover | Which account is slipping, not which task is oldest |
| `X-meeting` | **Does not exist in any spec.** The map defines it: attendees, status (booked, held, no-show, cancelled), the prep brief, the follow-up draft | None planned | Panel from the task row | Whether first value was agreed in writing |
| `R-company` | The customer-state grid: health and band with its drivers, renewal, value, plan and seats, last touch, next step. At Ridgeline: usage over 90 days and the seat list directly under the grid | As C1 | Page | The binary exit criterion of the stage the account is in |
| `X-note` | Body, attachments, the records it lands on | None | Panel | That the recap fixes the definition of first value |
| `X-task` | Contact, type, due, title, note, owner | None | Panel | The next check-in has a date |

### Issues

- **C2-1 · `X-meeting` has no spec home.** Map §6.5 hands it to the specs as one of nine new nodes; specs 06, 07, 09 and 11 have `X-book` (spec 06: "Book meeting drafts a reply with the calendar link") but nothing that holds a meeting's status, prep or follow-up. C2's first two steps — hold the kickoff, send the recap — land on nothing.
- **C2-2 · The task row has no meeting type.** Spec 07 §2 seeds `Task.kind: Call | LinkedIn | Email | Follow-up`. A kickoff is none of those, so the journey's trigger ("the kickoff is booked") produces no row.
- **C2-3 · The first-value milestone has nowhere to live.** The journey's whole spine — "one binary exit criterion each", "confirm the milestone in production", "past 90 days without a first value milestone, treat the account as a churn-risk signal" — has no field on the account, no risk type and no signal definition. The account has `nextStep`, which is a sentence, not a milestone.
- **C2-4 · A door label the 14 September decision forbids.** Spec 07 §6 uses "More filters: source, status, sort". PLAN.md: never "More filters". Spec 03 already uses the correct form, "Additional filters: …". Rule 4.
- **C2-5 · A risk of nesting.** If `X-meeting` is opened from inside the row door ("History and contact"), that is a panel inside a door: three levels. The map already solved this shape twice (`X-calllog` in the queue, the write rule in the connect wizard).

### Decisions

6. Define `X-meeting` once, in spec 07 §3, as a panel opened from a **meeting task row, never from inside the row door**, and reused from `R-deal` and `R-company`. It holds attendees, status, the prep brief link, the follow-up draft and the transcript when an integration supplied one. The follow-up draft **is** C2's recap: agent-written, logged not queued, sent by the person's click — so no new node and no new approval.
7. Add `Meeting` to `Task.kind` in spec 07 §2 and to the Type filter.
8. Add to spec 11 §2: `Account.firstValue { definition, target, confirmedOn, confirmedBy }` and the risk type **Onboarding stalled**; add to `S-scoring` the shipped signal "No first-value milestone in 90 days", which raises that risk. The milestone is read on the record under the health drivers, and set from the meeting panel's follow-up. Signals and scoring are fully inside the boundary, so this costs no new object.
9. Rename spec 07 §6's filter door to "Additional filters: source, status, sort".

### Score

**No.** Missing step: there is nowhere to record that first value was reached, and no meeting panel to reach it from. No third level, nothing decision-critical hidden.

---

## C3 · Watch health and run a risk play
*Ridgeline, daily. Map walk: `P-accounts` ─DR→ `D-acct-health` ─RC→ `R-company` ─DR→ `D-co-signals` ─PN→ `X-play` ─PN→ `X-note` ─PN→ `X-task`*

### The stops

| Stop | Visible first, CS seat at Ridgeline | Doors, and what each holds | Container | Never lose sight of |
|---|---|---|---|---|
| `P-accounts` | Renewals due in 30/60/90 with count and renewing value; value at risk; the table: name, health with band and trend, renewal and days left, contract value, open risks with the newest type, seats bought and active, usage 30 days, expansion signals, last touch, next step. Search, health band select, owner select, sort. Default sort **renewal** — the journey's first step is "sort by health" | "More filters: risk type, plan, churned accounts (3)"; "Columns: … (7)"; the row's named action menu | Page; filters in place, columns in a popover | Which accounts are renewing soon and are not healthy |
| Quick look | Health with band and 30-day change, renewal and days left, contract value, open risks, last touch, champion, owner, next step. Flat, read-only except next step. **The drivers that make the score are not in it** | None, by definition | Drawer beside the table, focus-trapped, Esc returns | Why the number moved |
| `R-company` | The customer-state grid and sections: health drivers, renewal terms, risks, expansion signals, hand-off, touches and timeline, usage over 90 days, seats and last sign-in, contacts, deals, notes | Agent research; Signals and news · n; CRM sync; Parent and subsidiaries; All activity · n; Full history, custom fields and files | Page | Real risk or a noisy input |
| `X-play` | **Does not exist in any spec.** The map defines it: task, note, person, signal | — | Panel | What the play will create before it creates it |
| `X-note`, `X-task` | As C2 | None | Panels | The recheck date |

### Issues

- **C3-1 · `X-play` has no spec home.** The journey's central verb — "run the matching play" — lands on nothing. Spec 11 §3 offers Log touch, Add risk and Add note; three separate clicks and no statement of what a play does.
- **C3-2 · `D-acct-health` is specified nowhere, and should not exist.** The map has it as a door on `P-accounts` and `R-company`; neither spec defines it. But spec 11 §7 already states the rule: "a score always travels with its reasons". Rule 5 forbids the number and its drivers sitting on opposite sides of a door. As a door it is also a second level-two channel hanging off the same row as the quick look, duplicating it.
- **C3-3 · The quick look shows a score with no reasons.** This is the same violation seen from the other side: a CSM scanning fifty renewals reads the health number in the drawer and must leave the table to learn why it moved.
- **C3-4 · Accounts has no quick-look node in the map.** Map 2.4 gives `Q-company` the single parent `P-companies`, and the edge table sends `P-accounts` rows straight to `R-company`. Spec 11 has a quick look on Accounts, and C3 is the scanning task the pattern exists for.
- **C3-5 · The signals door is missing from the table.** Map 2.4 gives `D-co-signals` the parents `R-company` and `P-accounts` row; spec 11 has expansion signals as a column and a record section but no row door, so C3's "read what moved and which input caused it" has no in-place route.
- **C3-6 · Default sort fights the journey.** Spec 11 §3: "Sort by renewal (soonest, the default)". C3 at Ridgeline is daily and starts by sorting on health. Ridgeline CS reads `acct.health` at 90 and `acct.usage` at 85.
- **C3-7 · A silent gap at "tune the input".** The last step is "tune the input if the flag was wrong". `S-scoring` is an OPS and MK area; the CS seat does not hold it. Nothing on the page says so or says who does.
- **C3-8 · "Check tickets" is outside the boundary.** No support desk. Nothing states the reduction.
- **C3-9 · The same forbidden label as C2-4**, in spec 11 §3 and §6: "More filters: risk type, plan, churned accounts (3)". Spec 11 §6 even defends it — "where the word 'More' survives it is followed by the contents" — which is not what the 14 September decision says.

### Decisions

10. **Delete `D-acct-health` as a node.** The drivers are a **section** directly under the health field on the record, **flat lines** in the quick look, and a **card** on a renewal deal (see C6). Rule 5 decides it, and spec 11 §7 had already committed to it in prose. Mark `work.health-drivers` in `accounts.ts` as a stated rule-5 exception so its 18% at Meridian does not push it behind a door.
11. Add `X-play`, "Run a play", to spec 11 §3, opened from the row's action menu and from the record. It holds: the play chosen from the risk tier or signal kind; **what it will create, stated before the button** — "Creates 3 tasks for you, a note on the account, and emails nobody"; the owner; for expansion, the routing band and its SLA; and the recheck date. Where an agent drafted the content, the draft is logged, not queued; sending is the person's click.
12. Give `Q-company` a second parent, `P-accounts`, in map 2.4 and add the edge row. One quick look, two entry tables, the customer-state field set when the company is a customer — the same rule the record follows.
13. Add "Signals and news · n" as a row door on Accounts, opening in place under the row.
14. Default sort at Ridgeline becomes health (lowest); renewal stays the default everywhere else.
15. The health-drivers section ends with the line "Inputs and weights are set in Settings › Signals, scoring and personas by Daniel Okafor (RevOps admin)", and "this flag was wrong" writes an `R-request` carrying the account, the input and the reason. That is the intake object doing the job it was created for, and it is the only honest route for a seat that does not hold `S-scoring`.
16. Spec 11 §3 states the reduction: support tickets are outside the boundary; an escalation is a risk of type Escalation with what the CSM typed. Nothing hints at a ticket integration.
17. Rename the filters door to "Additional filters: risk type, plan, churned accounts (3)" and delete the sentence defending "More".

### Score

**No.** Missing step: "run the matching play" has no control. Also the score and its reasons are split. No third level.

---

## C4 · Business review and the renewal from T-120
*Ridgeline, monthly. Map walk: `P-accounts` ─RC→ `R-company` ─DR→ `D-acct-health` ─DR→ `D-co-hierarchy` ─LK→ `R-brief` ─PN→ `X-meeting` ─PN→ `X-task` ─LK→ `R-deal` ─LK→ `P-reports` ─PN→ `X-forecast`*

### The stops

| Stop | Visible first | Doors, and what each holds | Container | Never lose sight of |
|---|---|---|---|---|
| `P-accounts` → `R-company` | As C3. Then the record: health with drivers, renewal terms (date, value, billing, notice period, auto-renew, forecast, Create renewal deal), usage over 90 days, seats | Parent and subsidiaries — the group the customer belongs to, which decides whose review this is | Page; doors in place | The renewal date and the notice period |
| `R-brief` | **No spec home.** The review: summary, KPIs, ROI against the goals agreed at kickoff, risks, actions | Sources and citations | Page | Which claims are the CSM's and which the agent assembled |
| `X-meeting` | See C2-1 | — | Panel | Actions captured with owners and dates |
| `R-deal` (the renewal) | Header, stage, amount, close date, next step, owner. **Deal type is behind the All fields door** | Files and the proposal; All activity; Full history and custom fields | Page | That this is a renewal, not a new deal |
| `P-reports` → Forecast | **The Forecast tab does not exist.** Four tabs: Activity, Pipeline, Sequences, Campaign results | — | Page, tabs are state | The number being committed upward |

### Issues

- **C4-1 · The goals agreed at kickoff have no field.** "ROI against the goals agreed at kickoff" is the review's spine. The hand-off brief carries "goals in the customer's words" as prose in a brief; the account has nowhere to hold them, so every review re-reads a brief from month one.
- **C4-2 · The T-120/90/60/30 ladder has no mechanism.** Four dated moves, and nothing generates them. `P-workflows` could, but it is an OPS and MK page gated at Growth, so a CS seat can neither see nor own it — a silent gap if the ladder is built there.
- **C4-3 · `R-brief` has no spec home.** One of the nine nodes map §6.5 handed to the specs. C1, C4 and C5 all need it.
- **C4-4 · No Forecast tab.** Spec 12 §1 and §3 define four fixed reports; the map defines five, with the renewal book as the Forecast tab filtered to renewal-typed deals. The journey's last step has nowhere to go.
- **C4-5 · Deal type behind a door.** Spec 09 §6.3 lists deal type inside "All fields"; `deal.ts` gives `field.deal-type` cs 4. For a CSM whose entire book is renewals and expansions this is read on every visit. Rule 1.
- **C4-6 · Two doors in sequence, checked.** `D-acct-health` then `D-co-hierarchy` on one page is two level-two doors side by side, not nested. Legal — and after decision 10 the first is a section, so only one door remains.
- **C4-7 · The price boundary is stated in the journey but nowhere in the product.** "Price is never agent-decided" (C4's approval line) and "CS owns health and ROI, sales owns contract and pricing" (17§5). Nothing on the record or the brief says which claims the agent assembled and which the CSM must approve.

### Decisions

18. Add `Account.goals[] { text, agreedOn, source }` to spec 11 §2, seeded from the hand-off brief and editable on the record in the customer-state grid, shown as the denominator of the review. Rule 5: the outcome and the thing it is measured against never sit apart.
19. The ladder is **renewal reminder tasks**, not a workflow: one setting in `S-pipeline`, "Renewal reminders: 120, 90, 60 and 30 days before the renewal date", which creates a task for the account owner at each mark. Tasks are a CS-held object; workflows are not. Stated in spec 11 §3 so the CSM knows where the rows come from.
20. Add a **Brief** row to spec 09 §6.8's roster: header — about, author (person or agent), assembled on, the records it covers; main — sections as written; side — source records; doors — "Sources and citations · n" and "History"; quick look — none, because a brief is opened, never scanned in a table. Generated lines are marked apart from written ones, and a brief that makes a commercial claim carries "Approved by {name}" or "Not yet approved" at the top. That is C1's and C4's approval line, made visible.
21. Add the **Forecast** tab to spec 12 (change 24 below).
22. Deal type becomes a chip beside the deal title for the CS seat everywhere and for the AE at Ridgeline; `field.deal-type` rises to cs 45, and cs 70 / ae 30 at Ridgeline. Nothing else moves (a level change is a usage decision, not a layout rearrangement).

### Score

**No.** Two missing steps: the goals agreed at kickoff have no field, and there is no Forecast tab to submit into. No third level.

---

## C5 · Act on an expansion signal and route it
*Ridgeline, weekly. Map walk: `U-slack` ─ND→ `P-accounts` ─DR→ `D-co-signals` ─RC→ `R-company` ─PN→ `X-play` ─LK→ `R-brief` ─PN→ `X-task` ─LK→ `R-deal`*

### The stops

| Stop | Visible first | Doors, and what each holds | Container | Never lose sight of |
|---|---|---|---|---|
| `U-slack` | A summary and a deep link, never a control. **Five event kinds: reply received, meeting booked, deal moved, agent needs approval, sync error.** An expansion signal is none of them | None; a Slack message holds no control | Message | That the signal has a clock on it |
| `P-accounts` | As C3, with expansion signals a level-one column at Ridgeline (cs 70) | The signals row door (change 13) | Page | Whether the signal is real |
| `R-company` | Customer state, the signals section with what fired, when and from where | As C1 | Page | Relationship quality before the pitch |
| `X-play` | See C3-1 | — | Panel | Who runs the conversation, and by when |
| `R-brief` | The one-page brief: what fired, who to talk to, their priorities, the timing | Sources and citations | Page | Timing |
| `X-task` → `R-deal` | Task with owner and due date; the expansion deal, typed | — | Panel, then page | That it is an expansion, not a renewal |

### Issues

- **C5-1 · The entry event does not exist.** Slack carries five kinds and none is an account signal, so the journey's trigger never arrives. Same root as C1-1.
- **C5-2 · Routing has no control and no statement.** "Route by size band, small to CS and larger to an AE" (under $15K CS, $25K+ AE-led) is a rule with a number in it, and the number is nowhere — not in `S-scoring`, not on Accounts, not in the play.
- **C5-3 · The SLA is not tracked.** "Track whether the conversation happened inside the SLA" (champion move → 5 business days; new-user adoption → 48 hours). Nothing carries a due date derived from the signal kind.
- **C5-4 · The outcome is not recorded, so the threshold cannot be tuned.** `AccountSignal` in spec 11 §2 has `{ id, kind, fired, source, detail, dismissed }` — dismissed is not an outcome.
- **C5-5 · A second hand-off object is about to be invented.** "Hand over" reads like the AE→CS hand-off, which spec 11 models as `Handoff`. It is not the same seam, and reusing it would put a closed-won checklist on an expansion.
- **C5-6 · Approval check, passed.** Detection, drafting and routing proposals are logged, not queued; creating the expansion deal is a person's click. Spec 11's `work.agent` card sits on the record and waits for the next visit — a task boundary, not an interruption. No change.

### Decisions

23. Add **Account signal** as the sixth Slack event kind and as a digestible bell kind (with change 1): "Seats at 94% at Northwind Analytics — expansion signal, routed to you, due Thu". The row opens Accounts filtered to that account; the message holds no control, as every Slack message in this product holds none.
24. The routing bands live in `S-scoring` as named thresholds ("Expansion routing: under $15,000 to the account owner, $25,000 and above to the account executive of record") and are **named in `X-play` at the moment of routing**, with the owner and the due date the SLA produces. Declared, not inferred; the CSM sees the rule that moved the work.
25. `AccountSignal` gains `{ routedTo, dueBy, outcome }` where outcome is one of acted, no conversation, not real; the signal row on the record shows "Routed to Elena Vasquez · due Thu" as object state. The outcome feeds `S-scoring`'s distribution preview, which is how the threshold gets tuned.
26. Spec 11 §3 states that the expansion route creates a **typed expansion deal and a task for its new owner, with the brief attached** — and that the `Handoff` object is the closed-won seam only. Written down so nobody builds a second one.

### Score

**No.** Two missing steps: the signal never arrives, and there is no control that routes it. No third level.

---

## C6 · Forecast the renewal book
*Ridgeline, monthly. Map walk: `P-reports` ─TB→ (Forecast, renewals) ─PN→ `X-report-records` ─RC→ `R-deal` ─DR→ `D-acct-health` ─LK→ `P-reports` ─PN→ `X-forecast`*

### The stops

| Stop | Visible first | Doors, and what each holds | Container | Never lose sight of |
|---|---|---|---|---|
| `P-reports` | Control bar: report tabs, date range, team, person, compare, Export, Print, "Exports and prints spend no credits", "Data as of 13 Sep, 08:00". Overview strip, tile row, one chart, one breakdown table. **Four tabs. No Forecast** | "Columns: 7 of 10"; "Stage-to-stage conversion"; "Lost reasons: 5" | Page; tabs are state, not a door | The number about to be committed upward |
| Forecast tab (proposed) | Every renewal in the period; base and expansion totalled apart; the predicted number beside the CSM's with the deals driving the difference; last cycle's call beside what happened | — | Tab | What health justifies a commit |
| `X-report-records` | "14 renewals, your book, this quarter": the week-by-week line, then the records with Open per row | None | Panel over the table | That the number has records under it |
| `R-deal` | Header, stage, amount, close date, next step. **Type behind a door** (C4-5). **No account health anywhere on a renewal deal** | Files and the proposal; All activity; Full history | Page | The health of the account behind the renewal |
| `X-forecast` | **Does not exist.** The map defines it: deal, report, goal, note, user hierarchy | — | Panel | That submitting is a commitment, and a person makes it |

### Issues

- **C6-1 · The Forecast tab does not exist.** Spec 12 §1, §3 and §6 are built on four reports; the map's 2.12 defines five and says explicitly that the renewal book is the Forecast tab filtered to renewal-typed deals, not a sixth report. A5, L2 and C6 all land there. This is the single largest omission in the group.
- **C6-2 · `X-forecast` does not exist,** so "submit" has no control, and `reports.ts` carries no items for it.
- **C6-3 · Last cycle's call is not stored.** "Compare last cycle's calls against what happened" is the journey's last step and there is no record of a previous submission.
- **C6-4 · Base and upside are not separable.** "Keep expansion upside apart from the base" needs the deal type as a grouping, which is behind a door (C4-5).
- **C6-5 · A renewal deal shows no account health.** C6's walk opens the deal and asks for health. Spec 09 has no health card, and after decision 10 there is no health door to open either.
- **C6-6 · Keyboard drift.** Spec 12 §3 binds keys 1–4 to the reports.
- **C6-7 · Gating question, answered.** Spec 12 gates the Pipeline, Sequences and Campaign tabs above Starter. A submitted forecast is a commitment reported upward — decision-critical — and the gated-features pattern (rule 6) puts safety and decision-critical items on every plan.

### Decisions

27. Add the **Forecast** tab to spec 12 §1, §3 and §6 as the fifth report. Scope is the seat's position, not a different screen: an AE sees their own deals, an AE with reports sees the team roll-up first and drills to a rep, a CSM sees **renewal-typed deals for their book**, with a scope chip stating what is applied. For the CS seat it groups by deal type — **Renewal base** and **Expansion upside** — with separate totals.
28. Add `X-forecast`, "Submit your forecast": the deals in the period, the category per deal, the CSM's number, the **predicted number beside it with the deals driving the difference**, a judgement note, and one Submit. No agent ever submits. Each submission is kept — period, number, split, note, submitted at — and the panel opens with **last cycle's call beside what actually happened**, which closes C6-3.
29. Put an **Account health · why** card on the deal record's side panel when the deal type is renewal or expansion, showing band, number and the driver lines; removed, not disabled, on a new-business deal. Object state, and rule 5 again.
30. Keys become 1–5; the Forecast tab is on every plan for the seats that hold it, stated in spec 12's plan block.

### Score

**No.** Three missing steps: no Forecast tab, no submit control, no record of last cycle's call. No third level once the tab exists, because a tab holds no doors.

---

## What held up

Worth recording, because the walk is not only a fault list.

- **No third level anywhere in six journeys**, including the two shapes that look like one: a row door then a row click (C3, C5) is a door and then navigation, and the quick look is flat by construction.
- **Nothing decision-critical is behind a door on Accounts.** Renewal date and days left, contract value, open risks with the churn notice written out, value at risk and hand-offs waiting are all level one at every business, including Halyard where they read zero. Mark churned and Remove account carry their consequence on the confirm step with undo in the notification.
- **Nothing is hover-only.** Row actions appear on focus as well as hover and repeat in a menu named for its contents.
- **No audience labels, no skill modes,** and no "Advanced" anywhere in the CS path.
- **Approvals are placed correctly.** The agent's proposed next step is a card that waits for the next visit to the record — a task boundary — and research and scoring are logged rather than queued, so the CS queue stays short on purpose.
- **The quick-look test passes.** Remove the Accounts drawer and a CSM loses speed across fifty renewals and no feature, because everything is on the record.

## What did not, in one line

The customer-success surface was specified against the fourteen-page table and never re-walked after the boundary widened on 15 September. Accounts still builds its own record, Reports still has four tabs, and three of the nine nodes the map handed to the specs — the play, the meeting, the brief — were never written down.

---

## Change list

*One apply pass makes these. Nothing here was applied by this walk.*

| # | File | Location | Current | New | Rule |
|---|---|---|---|---|---|
| 1 | `specs/00-shell-signin-palette-notifications.md` | §3.4, the notification kinds table | Seven kinds; none for customer success | Add two digestible kinds. **Hand-off received** — who: the receiving CSM; grouped: none; row: "Hand-off from Marcus Adeyemi: Northwind Analytics, closed won 12 Sep"; opens: the company record at the hand-off section. **Account signal** — who: the account owner (CS, AE); grouped: per account per day; row: "Seats at 94% at Northwind Analytics — expansion signal, routed to you, due Thu" or "Health dropped to Watch at Vantive: usage −38%"; opens: Accounts filtered to that account. Both digestible, never interrupting | 4 (a trigger that reaches nobody does not exist); 7 (the interrupting list stays safety state only, so the queue keeps its review capacity) |
| 2 | `specs/00-shell-signin-palette-notifications.md` | §3.4, the same table | "Over the threshold: second approval" is listed as interrupting while IA-MAP part 1 says the bell carries "three interrupting kinds only" | Keep the spec's four interrupting kinds and correct IA-MAP part 1 to read four, naming the second-approval row | 7 (a second approval is a price decision and waits for nobody) |
| 3 | `IA-MAP.md` | Part 1, "Notifications: Slack", the five event kinds | reply received, meeting booked, deal moved, agent needs approval, sync error | Six: add **account signal** (health band change or expansion signal on an account you own), carrying the account, what fired, the routed owner and the due date, then a link. The message holds no control | 4; 7 |
| 4 | `specs/11-accounts.md` | §3 "Shown", the quick look; §6 doors table, the "Open (row, Enter)" row | Quick look holds health with band and 30-day change, renewal, value, risks, last touch, champion, owner, next step | Add the **health drivers** as flat lines under the health field: the four stored numbers that sum to the score. Still flat, still read-only except next step | 5 (a score and its reasons never sit across a door); 1 |
| 5 | `IA-MAP.md` | 2.4, the node table; part 3 edge table; part 5 walks C3, C4, C6 and G3 | `D-acct-health` "How this health score was built", a door on `P-accounts` and `R-company` | **Delete the node.** The drivers are a section on the record, flat lines in the quick look, and a card on a renewal or expansion deal. Rewrite the four walks accordingly | 5; spec 11 §7 already states "a score always travels with its reasons" |
| 6 | `src/ollopa/usage/accounts.ts` | `work.health-drivers` | `weekly: { cs: 18, ae: 5, admin: 8 }`, note "Never a number without its reasons" | Same numbers, note extended: "Level one at every business as a stated rule-5 exception: the drivers sum to the score and never sit across a door from it. 18% describes how often a Meridian CSM *reads* them, not where they live" | 5; the usage model's critical-item override |
| 7 | `IA-MAP.md` | 2.4, `Q-company`; part 3, "Entry edges" | `Q-company` parent `P-companies`; `P-accounts` row ─RC→ `R-company` directly | `Q-company` parents become `P-companies` **and** `P-accounts`; add the edge "`P-accounts` row ─RC→ `Q-company` ─QO→ `R-company`", rendering the customer-state field set when the company is a customer | the quick-look-and-record pattern (one object, one quick look); 1 (C3 is a scanning task) |
| 8 | `specs/11-accounts.md` | §1 ¶4; §3 "Shown", the account record bullet; §6 doors table, the "Open the account record" row; §3 Actions and Keyboard (`o`) | An account record page at `/ollopa/accounts/:id` built from `RecordPage` | **One record.** The company record at `/ollopa/companies/:id` renders the customer-state grid and sections (health and drivers, renewal terms, risks, expansion signals, hand-off, touches, usage over 90 days, seats, goals, first value) when `Company.stage` is Current client or Churned, and they are removed otherwise. `/ollopa/accounts/:id` redirects there. Accounts stays a page: the customer-state table, its columns, its quick look and its row actions | PLAN.md 15 Sep (company and account are one object with a customer state); the quick-look pattern's test (a second record is a second version of the record) |
| 9 | `specs/09-deal-record.md` | §6.8, "How the other pages fill it" | Two rows, **Company** and **Account**, with different headers, sections and doors | One row, **Company (account when a customer)**: header fields switch on the customer state; sections gain the customer-state block when it applies; doors are the same set either way | same as 8 |
| 10 | `specs/09-deal-record.md` | §6.8, the Company row's doors | "Custom fields, Locations, History, Enrichment (drawer), Files, All fields; one tab, People (48)" | "All activity · n; Agent research · n runs; Signals and news · n; CRM sync · synced hh:mm; Parent and subsidiaries; Full history, custom fields and files; Enrichment (drawer); one tab, People (n)". Locations and Similar companies are removed — neither is a node and spec 11 already removed Similar companies | 4 (a door names its contents); IA-MAP 2.4 |
| 11 | `IA-MAP.md` | 2.4, `R-company` doors | Four doors: research, signals, CRM, hierarchy | Add `D-co-activity` "All activity · n" and `D-co-history` "Full history, custom fields and files", which spec 03 already defines and C1 and C3 use | the map's own rule that a spec's door must exist as a node |
| 12 | `specs/09-deal-record.md` | §3.1 header; §6.2 role table; §6.3, the "All fields" door contents | Deal type is inside "All fields" | Deal type is a chip beside the deal title for the CS seat at every business and for the AE at Ridgeline; removed from the All fields list for those seats | 1 (a CSM's whole book is typed deals) |
| 13 | `src/ollopa/usage/deal.ts` | `field.deal-type` | `weekly: { ae: 4, cs: 4, admin: 6 }, overrides: { ridgeline: { cs: 8 } }` | `weekly: { ae: 4, cs: 45, admin: 6 }, overrides: { ridgeline: { cs: 70, ae: 30 } }`, note: "Renewals and expansions are typed deals, so the type is the first thing a CSM reads on the record" | 1; PLAN.md 15 Sep |
| 14 | `specs/09-deal-record.md` | §6.3, the Files door | "Files (2)" | "Files and the proposal · 2" | 4; IA-MAP 2.9 |
| 15 | `specs/09-deal-record.md` | §3.1 side panel; §6.2 role table | No account health on a deal | On a renewal- or expansion-typed deal, a side card **Account health · why**: band, number and the driver lines, with a link to the account. Removed, not disabled, on a new-business deal | 5; 6 (object state, never inferred history) |
| 16 | `specs/07-tasks.md` | §2 seed; §3 Filters | `Task.kind: Call | LinkedIn | Email | Follow-up` | Add **Meeting**; it appears in the Type filter and carries the meeting panel as its row action | 1 (C2's trigger is a booked kickoff) |
| 17 | `specs/07-tasks.md` | §3, new block after "Row door"; §6 doors table | No meeting panel anywhere in the specs | Define **`X-meeting`**, "The meeting", opened from a meeting task row — **never from inside the row door** — and reused from `R-deal` and `R-company`. Holds attendees, status (booked, held, no-show, cancelled), the prep brief link, the follow-up draft, and the transcript when an integration supplied one. The follow-up draft is agent-written, logged not queued, and sent by the person's click | 2 (a panel inside a door is three levels; the map solved the same shape for `X-calllog`); IA-MAP §6.5 |
| 18 | `specs/07-tasks.md` | §3 Filters; §6 doors table | "More filters: source, status, sort" | "Additional filters: source, status, sort" | 4; PLAN.md 14 Sep, door labels |
| 19 | `specs/11-accounts.md` | §3 Filters; §6 doors table; §6 ¶"Doors" closing sentence | "More filters: risk type, plan, churned accounts (3)", plus the sentence defending the word "More" | "Additional filters: risk type, plan, churned accounts (3)"; delete the defending sentence | 4; PLAN.md 14 Sep |
| 20 | `specs/11-accounts.md` | §3 Actions; §6 doors table | Log touch, Add risk, Add note as three separate controls; no play | Add **`X-play`**, "Run a play", from the row menu and the record. Holds: the play chosen from the risk tier or signal kind; **what it will create, before the button** ("Creates 3 tasks for you, a note on the account, and emails nobody"); the owner; for expansion, the routing band and its SLA; the recheck date. Agent-drafted content is logged, not queued | 7 (the consequence before the action); 1 (C3 is daily at Ridgeline) |
| 21 | `specs/11-accounts.md` | §3 Filters, row doors | Expansion signals are a column and a record section only | Add the row door **"Signals and news · n"**, opening in place under the row, with what fired, when, from where, and the routed owner and due date | 4; 1; IA-MAP 2.4 (`D-co-signals` already lists `P-accounts` row as a parent) |
| 22 | `specs/11-accounts.md` | §3 "Filters, search, sorting"; §3 "By role and business" | "Sort by renewal (soonest, the default)" for every business | Default sort is **health (lowest)** at Ridgeline and renewal (soonest) elsewhere | 1 (Ridgeline CS reads health at 90 and usage at 85) |
| 23 | `specs/11-accounts.md` | §2 "To add to the seed" | `Account { … }` as listed; `AccountRisk` types; `AccountSignal { id, kind, fired, source, detail, dismissed }` | Add `firstValue { definition, target, confirmedOn, confirmedBy }` and `goals[] { text, agreedOn, source }` to `Account`; add **Onboarding stalled** to the risk types; `AccountSignal` gains `{ routedTo, dueBy, outcome }` where outcome is acted, no conversation or not real | 1 (C2 and C4 cannot be completed without them); 5 (a result and what it is measured against sit together) |
| 24 | `specs/11-accounts.md` | §3 "Shown" and Actions | Nothing creates the renewal ladder | One line: renewal reminder tasks are created for the account owner at 120, 90, 60 and 30 days before the renewal date, from the setting in Settings › Pipeline and data, and land on Tasks | 1; the declared-sidebar principle that a CS seat is never served by a page it does not hold (`P-workflows` is OPS and MK, Growth-gated) |
| 25 | `specs/14-settings.md` | `S-pipeline`, beside the forecast categories | No renewal reminders | Add "Renewal reminders: 120, 90, 60 and 30 days before the renewal date", admin-set, one row | 6 (stable, declared, user-controlled) |
| 26 | `specs/14-settings.md` | `S-scoring` | No expansion routing thresholds; no first-value signal | Add "Expansion routing: under $15,000 to the account owner, $25,000 and above to the account executive of record", and the shipped signal "No first-value milestone in 90 days", which raises the Onboarding stalled risk | 6 (declared over inferred); 1 |
| 27 | `specs/11-accounts.md` | §3, the health drivers block on the record | No line about where the inputs come from | End the section with "Inputs and weights are set in Settings › Signals, scoring and personas by Daniel Okafor (RevOps admin)", and a control "This flag was wrong", which writes a request carrying the account, the input and the reason, visible on Requests | the three kinds of "cannot see it" (a role gap explains itself and names who can); 4 |
| 28 | `specs/11-accounts.md` | §3 States, and §1 | Halyard and Fathom behaviour described, but nothing says Accounts is not in their sidebar | One line: at Fathom (Founder-led outbound) and Halyard (Agency) the workspace profile leaves Accounts out of the sidebar; the page opens by ⌘K or deep link and its header offers "Add to sidebar", and the first deal reaching Closed won brings it back for two weeks and then asks once | the declared sidebar; PLAN.md 14 Sep |
| 29 | `specs/11-accounts.md` | §3 Actions, the hand-off rows | Accept lives on the hand-off strip; its effect is written as a result | Accept also sits on the record's hand-off section, and carries its consequence **before** the button: "You become the owner. The account joins your book, the health baseline is taken today, and Marcus Adeyemi is told." Add the same consequence to the strip | 7 (consequence before the click, and the baseline is stated rather than silently taken) |
| 30 | `specs/11-accounts.md` | §3 "Shown", §6 | No statement about support tickets | One line in §3: support tickets are outside the boundary; an escalation is a risk of type Escalation carrying what the CSM wrote. Nothing hints at a ticket integration | the boundary decision of 15 Sep; 4 (never promise what is not there) |
| 31 | `specs/11-accounts.md` | §3 Actions | "Change owner" and the hand-off are the only routing | One line: the expansion route creates a **typed expansion deal and a task for its new owner, with the brief attached**; the `Handoff` object is the closed-won seam only | PLAN.md 15 Sep (renewals and expansions are typed deals); 4 |
| 32 | `specs/09-deal-record.md` | §6.8, "How the other pages fill it" | No Brief row | Add **Brief**: header — about, author (person or agent), assembled on, the records it covers; main — sections as written; side — source records; doors — "Sources and citations · n" and "History"; quick look — none, a brief is opened rather than scanned. Generated lines are marked apart from written ones, and a brief carrying a commercial claim shows "Approved by {name}" or "Not yet approved" at the top | IA-MAP §6.5 (`R-brief` is one of the nine new nodes); 7 (who stands behind a claim is decision-critical); C1's and C4's approval lines |
| 33 | `specs/12-reports.md` | §1, §3 layout and table, §3 keyboard, §6 role table, §3 plan block | Four fixed reports; keys 1–4; plan block covers four | Five. Add the **Forecast** tab: every deal in the period with its category, the weighted and committed numbers, and the scope chip. Scope follows the seat — an AE sees their own deals, an AE with reports sees the team roll-up first and drills to a rep, a **CSM sees renewal-typed deals for their book, grouped Renewal base and Expansion upside with separate totals**. Keys become 1–5. The Forecast tab is on **every plan** for the seats that hold it | 7 (a submitted forecast is a commitment reported upward, and the gated-features pattern keeps decision-critical items on every plan); IA-MAP 2.12 and §6.4d |
| 34 | `specs/12-reports.md` + `src/ollopa/usage/reports.ts` | §3 Actions and a new block; new usage items | No submit control, no stored submission | Add **`X-forecast`**, "Submit your forecast": the deals in the period, the category per deal, the person's number, the **predicted number beside it with the deals driving the difference**, a judgement note, one Submit. No agent ever submits. Each submission is kept (period, number, split, note, submitted at) and the panel opens with **last cycle's call beside what happened**. New items: `fc.tab` (ae 45, cs 40 at Ridgeline), `fc.submit` critical, `fc.predicted`, `fc.last-cycle`, `fc.split` | 7; 6 (a prediction sits beside the human's number and never replaces it); IA-MAP §6.4d |

| 35 | `JOURNEYS.md` | C1, the Steps line | "skim the two most important recordings" | "read the logged calls on the deal — purpose, disposition, duration, notes — and the transcript where an integration supplied one". A recorded reduction, stated, the same way map §6.2 re-scoped L3 | the 15 Sep boundary (no recording); IA-MAP §6.3 |

*Files touched by the apply pass: `IA-MAP.md`, `JOURNEYS.md` (C1's recordings step only), `specs/00-shell-signin-palette-notifications.md`, `specs/07-tasks.md`, `specs/09-deal-record.md`, `specs/11-accounts.md`, `specs/12-reports.md`, `specs/14-settings.md`, `src/ollopa/usage/accounts.ts`, `src/ollopa/usage/deal.ts`, `src/ollopa/usage/reports.ts`.*
