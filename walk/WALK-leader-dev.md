# Walk: sales leader (L1–L3) and developer (D1–D4)

*Walked 15 September 2026 against RULES.md, PLAN.md §2, IA-MAP parts 1, 2, 3, 5 and 6, JOURNEYS.md, the specs' §3, §6 and §7, USAGE-MODEL.md and `src/ollopa/usage/`. Reality checked against `knowledge-base/sources/18-ae-and-sales-leader-notes.md` §4, §5 and §9 and `knowledge-base/sources/19-revops-and-developer-notes.md` §9–15. Nothing here was edited into a spec, a map node or a usage file; the change list at the end is the apply pass's input.*

**Seats.** The leader is an AE seat with direct reports, written `AE+` (IA-MAP 6.4j). The developer is the OPS seat. No sixth or seventh seat is created anywhere below.

**Result.** 54 issues, 69 changes. All seven journeys score **no**, and every one of them fails on a step the specs forgot rather than only on a rule violation. The two largest gaps were both named by the map and never written down: the Forecast tab with `X-forecast`, which L2 is entirely made of, and the `S-developer` settings area with the four screenless surfaces, which D1–D4 all start from. Nine rule violations sit underneath them: four rule-2 nestings in the walk rows themselves, three decision-critical facts reachable only by hovering or not at all, one label that promises the wrong thing, and one plan gate that three files describe three ways.

---

## L1 · Inspect the pipeline before the 1:1s

Meridian, weekly, AE+. Walk: `P-deals` ─DR→ `D-deals-view` ─DR→ `D-deals-filters` ─RC→ `Q-deal` ─QO→ `R-deal` ─DR→ `D-deal-activity` ─PN→ `X-note` ─LK→ `P-reports` ─DR→ `D-report-conv`.

### Stop 1 · `P-deals`

**Visible first.** The header (Deals, the pipeline name, scope Mine / My team / All, closing period, search, Board or Table, New deal); the forecast strip — Commit, Best case, Pipeline, Closed won, and Omitted only when its count is above zero; five stage columns each with count and sum; the Closed won rail; cards carrying deal name, company, amount, next step, close date, and object-state markers for overdue, stale, a failed CRM sync and a pending agent proposal.

**The doors.** Card door "Owner, activity and forecast", in place under the card. Column door "Weighted total and stale deals", in place under the header. The Closed won rail, which expands into a column. Filter door "Filters: owner, forecast category, stale, amount, company, created, archived and its reason, custom fields", in place under the header with "n filters on". View options, a popover. The card menu and the page menu. Nothing holds a menu.

**Never lose sight of.** Which of her reps' deals are being defended rather than worked — and, behind that, the consequence of every irreversible act on the board: closing pushes to Salesforce and hands the account to CS, archiving takes the deal out of the forecast, delete names what goes.

**Issues.**

1. **No AE+ anywhere in the spec.** Spec 08 §3.8 and §6 carry AE, CS and Admin columns only, so the one seat whose weekly job is reading other people's deals gets the AE layout: scope defaults to Mine, the owner sits inside the card door, and the owner filter sits inside the filter door. Every control the journey is made of is at level two. Rule 1 — this is measured frequency for a seat, not a skill split — and IA-MAP 6.4j, which says leader-only behaviour is AE behaviour conditioned on `reports > 0`. **Decision:** add an AE+ column to both tables; scope defaults to My team; owner is on the card at level one; the owner filter sits in the header beside scope. `deals.card.owner` and `deals.filter.owner` gain AE+ numbers of 60 and 55.

2. **The usage model cannot express AE+.** `model.ts` has five `Role` keys and `weeklyUse()` reads one of them. There is no way to write a number for an AE with reports, so change 1 has nothing to stand on. Rule 1's test is "can you say what share of users touch it weekly" — for this seat the answer is currently "there is no seat". **Decision:** add one optional key, `aePlus`, to `UsageItem.weekly` and to the override records, and a fourth argument `hasReports` to `weeklyUse()`. No new `Role`, no new entry in `SEATS`, no seat any business must declare. USAGE-MODEL.md states it once, next to "Per business".

3. **Coverage is missing, and it is the number the review is about.** The journey's third step is "check coverage against what is left to sell, early in the quarter". 19§4.5: *"Required Coverage = 1 ÷ Win Rate"* — 20% needs 5x — and *"The 3x benchmark is a starting point, not a standard"*, with the warning that coverage read in week 10 of 13 leaves no runway. The strip has four sums and no ratio, no target and no denominator. IA-MAP 6.3 made the goal an attribute in `S-pipeline` shown "on the Forecast tab and on `P-reports` tiles" — but not on `P-deals`, which is where L1 looks. Rule 1. **Decision:** the strip gains a fifth figure for AE+ only: "Coverage 3.1x · this team's 20% win rate needs 5.0x". Observed and required sit in one line, because they are a dependent pair (rule 5). Level one by usage, not by criticality: AE+ 70.

4. **"Two-way activity, not just rep activity" has no representation.** 18§5, Gong's published manager review, step 2: *"look for bidirectional communication, not just rep outreach"*. The card carries "Stale, 21 days"; last activity is inside the card door; neither distinguishes a rep sending five emails into silence from a live conversation. The leader would have to open every card. Rule 1, and rule 6 in its permitted form — this is object state, not inferred history. **Decision:** the stale marker becomes two facts on the card, "Last touch 3d · last reply 19d", and the filter door's "stale" filter becomes "No reply in n days". Spec 08 §3 "Card" and the filter list; `deals.card.stale` keeps its number and changes its label.

5. **Comments have no home — the silent gap that breaks the journey.** L1's objects include `comment`; 18§5 step 4 is *"tag reps with comments on accounts/activities rather than waiting for meetings"*; IA-MAP 6.4j names "comments on `R-deal`" as one of the three leader nodes. But `comment` is not among the 31 objects in JOURNEYS §1, no node in part 2 carries it, and the walk's stop, `X-note`, is "Write a note" over note, person, company and deal, with no addressee and no notification. The async half of the journey — the half 18§5 says replaces the meeting — cannot be performed. **Decision:** no new node and no new object. `X-note` gains a kind, note or comment; a comment names one teammate, lands in the deal's activity timeline like a note, and reaches that teammate through their Home and the daily digest. It is not added to the bell's three interrupting kinds, because it is not decision-critical. JOURNEYS §1 gains one line saying a comment is an attribute of a note; IA-MAP's `X-note` row gains the kind; spec 09 §3.2 gains the action.

6. **The walk nests a panel inside a door.** `D-deal-activity ─PN→ X-note` reads as a level-2 node inside a level-2 node, which convention 2 forbids. The map already knows the fix and writes it twice — `X-preview` is "`D-seq-step` → own channel", `X-agent-edit` is "`D-agent-item` → own channel" — and simply omits it here. Rule 2. **Decision:** annotate the L1 row so `X-note` is opened from the record's composer on its own channel, and add the same words to part 3's `R-deal` edge row.

### Stop 2 · `Q-deal`, the quick look

**Visible first.** The few fields a glance needs, in the same order as the top of the record, flat, with the table still in view. Stage is the one editable field.

**Issue.**

7. **The one editable field is the wrong one for this seat.** The quick look exists so a scanning person can record the one thing the scan produces. For an AE it is stage. For a leader scanning her team's board it is never stage — spec 08's own "Cannot move" state already refuses a non-owner, and 18§5 is explicit that the 1:1 is *"the difference between an interrogation and a strategy session"*, not an override. So the leader's quick look is read-only, and the one thing her scan produces — the comment — is unavailable until she opens the record. Rule 1, and the quick-look pattern's own test. **Decision:** the editable field follows ownership. Owner sees stage; a non-owner, AE+ included, sees the comment composer in the same slot. The drawer stays flat and removing it still loses only speed.

### Stop 3 · `R-deal` ─DR→ `D-deal-activity`

**Visible first.** Header with the stage stepper, probability and forecast category, amount, close date, next step with its date, owner and last activity; the activity timeline with its filter chips; a side panel of cards — next step, contacts, open tasks, company summary — then the doors.

**The doors.** Evidence and source quotes; All activity · n; Full history and custom fields; Files and the proposal · n. Containers: in place in the side panel.

**Never lose sight of.** What the last two-way contact was, and who at the account has actually engaged.

**Issue.**

8. **"See who is engaged by title" cannot be read.** 18§5 step 3 sends the leader to the contacts for *"multi-threading evidence"* and *"titles engaged"*. Spec 09's Contacts card orders by role then last touch and carries no engagement state and no count. Rule 1, and rule 5 for the count. **Decision:** the Contacts card heading carries the count and the engaged count — "Contacts · 5 · 2 have replied" — and each row carries last two-way contact. Spec 09 §3.1 and §3.2.

### Stop 4 · `P-reports` ─DR→ `D-report-conv`

**Visible first.** The overview strip on arrival, then the Pipeline report: control bar, tiles including the weighted forecast with its method under it, one chart, the by-stage table.

**Issues.**

9. **A leader cannot filter to one rep at level one.** The journey's last step is "filter to one rep and repeat". Spec 12 gives an AE a sentence where the team select was — "AE East (your team). Daniel Okafor can widen this" — and puts the person filter inside the team menu, at level two, at 15 weekly for an AE. For AE+ it is the weekly close of the whole journey. Rule 1. **Decision:** for AE+ the team select stays a working control fixed to her team, and the person filter is promoted beside it; `ctl.person` gains AE+ 55, `ctl.team` gains AE+ 40.

10. **Win rate and coverage sit on opposite sides of a door.** `D-report-conv` produces the win rate; the coverage multiple added in change 3 is `1 ÷ win rate`; they would live on two pages with no stated relationship, and two different numbers would be arguable. Rule 5. **Decision:** the conversion door's last line reads "Win rate 20% · needs 5.0x coverage", and the `P-deals` strip names the same figure with the same words, so there is one number with two homes rather than two numbers.

**Score: no.** Two steps the specs forgot: the comment, which is the journey's fourth step and has no object, node or control; and coverage, which is its third step and exists nowhere in the product. No third level once change 6 lands. Nothing decision-critical is behind a door.

---

## L2 · Roll up the forecast, run the call, answer for the month

Meridian, weekly and monthly, AE+. Walk: `P-reports` ─TB→ (Forecast) ─PN→ `X-forecast` ─PN→ `X-report-records` ─RC→ `R-deal` ─LK→ `P-reports` ─DR→ `D-report-columns`.

### Stop 1 · `P-reports`, Forecast tab

**Issue, and it is the whole journey.**

11. **The Forecast tab does not exist.** IA-MAP 2.12 gives `P-reports` five tabs and says plainly that Forecast "is where A5, L2 and C6 land". Spec 12 §3 lists four: Activity, Pipeline, Sequences, Campaign results. `reports.ts` has no forecast-tab item. `X-forecast` appears in no spec. So L2 cannot be walked at all, and neither can A5 or C6. The map wins over the spec by the reviewer's own rule. **Decision:** spec 12 §3 and §6 gain the Forecast tab; `reports.ts` gains a Forecast area. What it must carry, from 18§4, 19§4.4 and IA-MAP 6.4d:

    - **Level one.** The period and the submission deadline. The roll-up at the seat's position in the hierarchy — an AE sees her own deals, AE+ sees the team roll-up first and drills to a rep. One row per direct report: submitted or not, and when, because 19§4.4's whole claim is *"Compliance is visible in real time. No more chasing."* The four categories as columns (Commit, Best case, Pipeline, Omitted when above zero), matching the board's strip word for word. The goal as the denominator, which IA-MAP 6.3 already placed in `S-pipeline`. The predicted number beside the human number, with the deals driving the difference reachable from the difference itself.
    - **`X-forecast`,** a panel on the tab, level two: the number, a judgement note for the manager, and the submission-changes history. The adjustment records a judgement and does **not** alter the underlying roll-up — Salesforce's canonical definition, *"Adds detail without altering underlying gross rollup figures"*.
    - **The default sort is not size.** 18§5, Clari verbatim: *"revenue leaders don't have to sort the forecast by deal size, they can sort by committed deals and the CRM Score, focusing on opportunities in red."* The records behind a forecast number sort by category then risk, and the sort is stated on the drawer.
    - **No agent ever submits** (JOURNEYS L2). The predicted number is labelled a prediction with its inputs named, and Submit carries its consequence before the click: "Submits $1.42M for AE East, October, to Marcus Rivera. Your reps' submitted numbers are not changed." Rule 7, and the approval-consequence convention PLAN.md fixed on 14 September.

12. **The submission cascade has no configuration.** 19§4.4: *"Configure the deadline day, time, and submission window. Cascade through hierarchy levels"* — Rep Wednesday, manager Thursday, leader Friday. Nothing owns this. Rule 5 puts it beside the thing it governs. **Decision:** deadline day, time and window become rows in `S-pipeline`, beside the forecast categories and the goal that IA-MAP 6.3 already put there. One line in spec 14 §6.3's Pipeline door list; one item in `settings.ts`.

13. **A monthly journey with no month.** The journey's second half is monthly; 18§5 names the monthly business review as a standing meeting. Spec 12's range presets run This week, Last 7 days, Last 30 days, This quarter, Last quarter, Last 90 days, This year — no This month and no Last month. Rule 1: the cadence is in the source and the control is not in the product. **Decision:** add This month and Last month to the presets in spec 12 §3.

14. **On Starter the forecast number must still print.** The plan table gives Starter the Activity report only, so the Forecast tab is locked there. The weighted forecast is already marked `critical` in `reports.ts` and prints on a locked Pipeline tile. The same must hold here or the pattern has two answers. **Decision:** on Starter the Forecast tab shows the number and the goal and locks only the submission and the roll-up — gated-features pattern rule 6, safety and decision-critical items on every plan. (No business in PRODUCT.md is affected; it is a rule statement, not a screen.)

### Stop 2 · `X-forecast` → `X-report-records`

**Issue.**

15. **Two panels in series.** The walk reads `X-forecast ─PN→ X-report-records`, a level-2 panel opened from a level-2 panel. Rule 2, convention 2. **Decision:** they are siblings on the tab, not parent and child; the walk row states both as panels on `P-reports` (Forecast). Same fix as L1's change 6.

### Stop 3 · `R-deal` → back → `D-report-columns`

**Checked, no issue.** `D-report-columns` is the once-a-quarter build of the board Gong calls a configurable forecast board — columns of three types, submission, metric and target. `ctl.columns` runs 2 to 4 weekly across every seat, so it stays at level two. A quarterly job behind a labelled door with a count is the shape rule 1 asks for.

**Score: no.** The missing step is the Forecast tab and `X-forecast` in their entirety, plus the deadline configuration and the month presets. No rule is violated by what exists; what exists does not reach the end of the journey.

---

## L3 · Coach from the calls

Meridian, weekly, AE+. Walk: `P-reports` ─TB→ (Activity) ─PN→ `X-report-records` ─RC→ `R-person` ─DR→ `D-person-activity` ─PN→ `X-calllog` ─PN→ `X-note`.

IA-MAP 6.2 already re-scoped this journey to what Ollopa owns and recorded the loss of the call library and the clip as a known reduction. That decision stands and is not revisited. What follows is what the re-scoping did not finish.

### Stop 1 · `P-reports`, Activity tab

**Visible first.** Tiles: Emails sent, Calls made, Meetings booked, Tasks done. One row per rep with the four counts and tasks overdue.

**Issue.**

16. **The number that starts the journey is not there.** Step one is "see who has had feedback and who has not". 18§9 gives the published manager set verbatim: *"Calls listened"*, *"Calls with feedback"*, *"Calls with scorecards"*, with a monthly digest of manager coaching sent to managers-of-managers. The Activity report counts rep output and says nothing about coaching coverage. 17§3 is why it matters: 26% of reps get weekly coaching, 40% cite the manager's lack of time, and 46% say they *"rarely get feedback"*. Rule 1. **Decision:** for AE+ the rep table gains two columns, "Calls logged" and "Calls with a coaching note (30 days)", and the tile row gains "Reps coached this week · 3 of 8". `reports.ts` gains `act.coached` and `act.calls-with-note`, AE+ 60 and 45.

### Stop 2 · `X-report-records`

**Issue.**

17. **The drawer cannot list calls.** `X-report-records` carries deal, person, campaign and sequence. The coaching cell's records are calls. Rule 4 — a door must deliver what its label promises. **Decision:** add `call` to `X-report-records`'s objects in IA-MAP 2.12 and to the drawer's record kinds in spec 12 §3.

### Stop 3 · `R-person` ─DR→ `D-person-activity`

**Issue.**

18. **Spec and map disagree about the container.** IA-MAP 2.3 makes `D-person-activity` a door, "All activity · n". Spec 02 §3 says the record's related lists, activity among them, are scrolling sections. The map wins. **Decision:** reconcile in spec 02 §3 and in the shared record template spec 09 owns: the recent activity is a section, and "All activity · n" is the door onto the full list — which is what the label already says.

### Stop 4 · `X-calllog`

**Visible first.** Purpose, disposition, duration, notes, and the transcript when an integration supplied one.

**Issues.**

19. **The node is write-only by its label.** "Log the call: purpose, disposition, duration, notes" describes the rep's act. L3 is someone else reading a call they did not make. Rule 4: the label is the only scent the node has. **Decision:** rename to "The call: purpose, disposition, duration, notes, transcript" and state the two modes — the owner logs, anyone who can see the record reads. IA-MAP 2.8 and spec 07 §3.

20. **The coaching note has no home, and the walk splits the pair.** IA-MAP 6.2 decided "the scorecard becomes a coaching note with fixed headings, an attribute of the call, not a new object or node" — and then the walk routes `X-calllog ─PN→ X-note`, which is a panel inside a panel (rule 2) and separates the feedback from the call it is about (rule 5). `X-note`'s objects do not include call, so the route does not even exist. **Decision:** the coaching note is a block inside `X-calllog` with fixed headings — what went well, what to change, one behaviour for next week — timestamped and visible to the rep. The trailing `─PN→ X-note` is deleted from the L3 row. Gong's suggested answers survive as an agent proposal inside that block with a visible state, suggested / edited / accepted, never published until the human accepts, which is what JOURNEYS L3's approval line already requires.

21. **"Send it while the call is fresh" reaches nobody.** 18§9, Gong: *"Give feedback as soon as possible after the call happens"*, and score *"as soon as possible"*. A saved note that sits in a panel is not feedback. Rule 7 read the right way round: only safety interrupts, so this must arrive without interrupting. **Decision:** a saved coaching note appears on the rep's Home in a "Feedback on your calls" row and as a line in the daily digest. It is not added to the bell's three interrupting kinds.

22. **A transcript door that sometimes opens onto nothing.** The transcript is an integration input (IA-MAP 6.3). Where no integration supplies one it must be removed, not disabled — Microsoft's Windows UX Guide, *"Remove (don't disable) progressive disclosure controls that don't apply"*, rule 4. **Decision:** state it in the node and in spec 07 §3.

**Score: no.** Two missing steps: the coaching-coverage number that triggers the journey, and the coaching note the map decided on and no spec wrote. One rule-2 violation and one rule-5 violation in the walk row itself, both fixed by change 20.

---

## D1 · Create a key and run a nightly enrichment job

Meridian, once then daily unattended, OPS. Walk: `P-settings` ─LK→ `S-developer` ─PN→ `X-key` ─LK→ `U-api` ─AI→ `X-approve-remote` ─LK→ `X-credits` ─LK→ `R-job`.

### Stop 1 · `P-settings` → `S-developer`

**Issue, and it is the spine of all four developer journeys.**

23. **`S-developer` does not exist in spec 14.** The spec has twelve areas and parks "API keys" and "webhooks" as two of the six items inside the **Integrations** door, with `int.api-keys` at 6 weekly and `int.webhooks` at 4 in `settings.ts`. MCP and the CLI are absent from the spec and from the usage file entirely. Today's path is Settings → Integrations door → API keys → a drawer, which is three levels (rule 2), and the thirteenth area IA-MAP 2.14 created — "API, webhooks, MCP and CLI" — is unwritten. IA-MAP 6.5 named this as one of the nine nodes the specs must absorb. **Decision:** spec 14 §3.1, §6.2 and §6.3 and `settings.ts` gain `S-developer`. `int.api-keys` and `int.webhooks` move out of Integrations and become `dev.api-keys` and `dev.webhooks`; new items `dev.mcp-scope`, `dev.cli-auth`, `dev.limits`, `dev.key-spend`, `dev.cost-table`, `dev.hook-contract`.

24. **The four screenless surfaces have no spec file.** `U-api`, `U-hooks`, `U-mcp` and `U-cli` are level-1 nodes in IA-MAP 2.16 and appear in no spec. The change list below has nowhere to land without one, and IA-MAP 6.5 asked for exactly this: the approval batch, the consequence line and the credit cap "written as text before any screen for them is designed". **Decision:** one new spec, `specs/17-developer-surfaces.md`, in the same eight-section shape as the other sixteen, covering `S-developer`, `X-key`, `X-hook`, `X-mcpscope`, `X-cliauth`, `X-approve-remote` and the four surfaces. No node is invented; every one already exists in the map.

### Stop 2 · `X-key`

**Visible first.** The key list with scope, last used and spend per key; create, rotate, revoke.

**Issues.**

25. **Per-workspace limits are not stated where keys are made.** 19§9, Apollo verbatim: *"Every limit is: **Per team, not per API key or per user**"* — so minting keys buys nothing. IA-MAP part 1 says the same. If it is not said at the point a key is created, a developer under pressure mints three. Rule 7 (a published limit is a commitment) and rule 5 (it sits with the thing it limits). **Decision:** one line at level one in the area above the key list: "Limits are per workspace, not per key. 200 a minute · 6,000 an hour · 50,000 a day."

26. **The published cost tail is missing.** 19§9: enrichment 1–9 credits per person, *"+8 credits if mobile phone is returned"*, and the budget killer verbatim — *"Phone waterfall enrichment typically uses 8–25 credits, but some configurations may result in 45+."* IA-MAP part 1 requires the tail to be published. An average hides a 45x outcome, which is the partitioned-pricing error rule 7 cites (about 11% underestimation, worse than drip pricing's 3.2%). **Decision:** a cost table at level one in the area — per endpoint, typical and maximum — never behind the key panel, because the decision it informs is made before the key exists.

27. **The 80% alert is promised and unwritten.** IA-MAP part 1: "an 80% alert to the key's owner". No spec carries it. 19§9's pattern G is the published model — check limits before each run, read the limit header, alert at 80%. **Decision:** a row in the area, "Alert the key's owner at 80% of the allocation", on by default; the alert is a digest line plus a bell row under the existing "credits low" kind, which spec 00 §3.4 already defines. No new notification kind.

### Stop 3 · `U-api`

The brief's four tests, in the response rather than on a screen.

**Issues.**

28. **A rate limit is not a budget.** IA-MAP part 1 promises "remaining requests in a response header". A nightly job that stops when it runs out of requests still burns credits until it does; the thing that can bankrupt the month is credits, not calls. Rule 7 — the credit cap is decision-critical and it must be in the response, not in a dashboard the script never opens. **Decision:** two headers, `X-Credits-Remaining` beside `X-RateLimit-Remaining`, on every credit-consuming response; at the cap, a refusal naming the cap, the reset time and the approver, never a partial result.

29. **The three kinds of "cannot see it" are written for MCP and not for the API.** IA-MAP part 1 spells all three out under **MCP, three scopes** and leaves the API paragraph silent. Silence is what makes an integrator guess, and the declared-sidebar pattern says there is no fourth answer. **Decision:** the API states all three in the same shapes — an object the key's owner does not own returns its readable fields plus an `owner` line; an area the key's seat does not hold returns a refusal naming the seats that hold it and the admin to ask; profile omission does not exist for a key, and the documentation says so in one line rather than leaving it to inference.

30. **JOURNEYS and IA-MAP disagree about D1's approval.** JOURNEYS D1 says *"Approval: None; the credit cap is the gate"*; IA-MAP's D1 row routes through `X-approve-remote` "(over the threshold)". Both cannot be true, and a nightly bulk enrichment crossing 500 credits in one action does cross the threshold PLAN.md set. **Decision:** the map is right and the journey line is loose. JOURNEYS D1's approval line becomes: no per-item approval, the credit cap is the gate, and a single call above the second-approval threshold returns the pending-approval object with the consequence line, the credit cost and the approver's name, the same item appearing in the app's queue.

### Stop 4 · `X-credits`

**Issues.**

31. **The credits pill does not open the panel.** Spec 00 §3 makes the pill a link to "Settings › Plan, billing and usage › Credit balance and burn rate". IA-MAP part 4 is explicit that `X-credits` is a panel opened from the pill or the strip, "on its own channel", carrying spend by feature, person **and surface** — app, automation, API, MCP, CLI, agents. Without the surface axis a developer cannot answer "what did my key spend", which is D1's last decision. The map wins. **Decision:** the pill opens the `X-credits` panel as its own channel, like the bell; the panel carries three breakdowns, feature, person and surface; the settings anchor stays as a second route, because a deep link is a first-class route.

32. **The run-out date is hover-only.** The pill prints balance and burn; "About n weeks at this rate" and the run-out date live in a tooltip. Credit burn is decision-critical in USAGE-MODEL.md's own list, the digest is required by IA-MAP part 1 to carry the run-out date when it falls inside the billing period, and the FTC's 2022 dark-patterns report names a tooltip as the mechanism of a deceptive act — quoted in rule 7. **Decision:** when the run-out falls inside the billing period the pill prints it: "4.1k credits · 2.3k/wk · out 26 Sep". Above that it stays two numbers. Same rule as the digest, stated once.

### Stop 5 · `R-job`

33. **No route from a key to the jobs it ran.** `R-job`'s parents are `W-import`'s end, `S-prospecting` and `X-credits`. A job started by an API key is reachable from none of them. Rule 4: the key panel promises spend and cannot show what caused it. **Decision:** add `X-key` → `R-job`, filtered to that key, to IA-MAP part 3's edges.

**Score: no.** Missing steps: the `S-developer` area, the per-workspace limit statement, the published cost tail, the 80% alert, and the credit header beside the rate-limit header.

---

## D2 · React to events with a webhook

Ridgeline, once then event-driven, OPS. Walk: `P-settings` ─LK→ `S-integrations` ─LK→ `W-connect` ─WS→ (webhook: URL, secret, test event) ─LK→ `S-developer` ─PN→ `X-hook` ─LK→ `U-hooks`.

### Stops 1–2 · `S-integrations` → `W-connect`

**Visible first.** Seven cards in three groups; the webhook card carries its lock at Fathom with the plan name and the monthly total, on the card, before anything is built. Step 2 takes URL, secret and a test event with the response shown in place. Step 3 chooses events.

This is the one part of the developer group the specs already get right: the lock is at the entry point, never after a mapping has been built, which is gated-features pattern rule 7 exactly.

**Issue.**

34. **Two homes for one object.** Spec 15 hands every connection over to "the integration's page in Settings", while IA-MAP puts the webhook subscription's life in `S-developer` via `X-hook`. Rule 5 — one object, one container. **Decision:** the wizard keeps creating it, and the hand-over sentence names the destination by kind: a CRM, a calendar, Slack or an enrichment provider hands over to `R-integration`; a webhook hands over to `S-developer` › `X-hook`.

### Stop 3 · `X-hook`

**Issues.**

35. **The delivery contract is decision-critical and it is written nowhere.** IA-MAP part 1 states it — at-least-once, signed, attempt-numbered, retried for 24 hours, never silently disabled, plus a reconciliation endpoint — and no spec carries a word of it. 19§10 is why it matters: Outreach *"does not retry webhook deliveries upon receiving any of the Status Codes including `500`"* with a five-second timeout, so *"a 500 from your handler = permanent data loss"*; Salesloft retries three times fifteen seconds apart, a 45-second window that *"will not survive a deploy or cold start"*; Calendly *"the webhook is disabled if another message was not delivered successfully and the hook needs to be recreated"*. A developer who cannot read the contract builds the wrong handler, and finds out by losing data. Rule 7: what a thing does to your data is never behind a door. **Decision:** the contract is six lines at level one in the area under the subscription list — not a documentation link — and rule 5 keeps it beside the subscriptions it governs.

36. **The subscription's own state is not visible.** IA-MAP part 1 is explicit: "The subscription's own state is visible, not only the receiver's uptime", and Calendly's behaviour is the reason — a day-long outage silently kills it. **Decision:** the subscription row shows delivering / failing since / paused by you, and a failing subscription uses the same grouped-by-cause treatment `X-errors` already gives sync errors. One pattern, two places; nothing new invented.

37. **Nothing stops an integrator wiring an auto-approver.** IA-MAP part 1: "Approvals do not travel by webhook — a webhook fires on what *happened*, never on what needs deciding — because a surface with no reply path cannot carry a decision." Spec 15's Slack list includes "agent needs approval", correctly, because Slack carries a link. The webhook event list must exclude approval events and say so, or the boundary is discovered by building against it. Rule 7's corollary — disclosure that exceeds review capacity is equivalent to hiding, and an auto-approver has zero review capacity. **Decision:** one line on step 3's webhook event list stating that approvals are not webhook events and where they do arrive.

### Stop 4 · `U-hooks`

38. **The reconciliation endpoint is named nowhere.** D2's step is "reconcile nightly against the records themselves, since delivery is neither guaranteed nor ordered", and 19§9 pattern D makes the nightly cursor walk *"mandatory"*. **Decision:** the endpoint is printed in the area and in `X-hook`, copyable, beside the contract it completes.

39. **A failing subscription reaches nobody who is not in the app.** IA-MAP's node table lists `U-digest` against D2 and the digest's contents in part 1 do not include webhooks. **Decision:** add the failing subscription, with its failure count and cause, to the daily digest's list in IA-MAP part 1 and in spec 00 §3.4. It is not one of the three interrupting bell kinds; a webhook that fails for an hour is not a safety state.

**Score: no.** Missing step: the delivery contract and the subscription's own state. Everything else in D2 is walkable today once `S-developer` exists.

---

## D3 · Work the GTM data from an AI client

Fathom, daily, Starter, OPS (the founder holds OPS and SDR). Walk: `P-settings` ─LK→ `S-developer` ─PN→ `X-mcpscope` ─LK→ `U-mcp` ─AI→ `X-approve-remote`; a write on Starter ─PN→ `X-upgrade`; the run lands ─LK→ `P-agents` ─DR→ `D-agent-steps`.

### Stop 1 · `S-developer` at Fathom

**Visible first.** MCP read scope, available on Starter. Safe writes and destructive writes where they always sit, with a lock and "Growth" and one total for the period. IA-MAP 6.4f is right about this and right for the right reason: gating read scope would hide the product from the client the founders already work in, and that is the discovery the pattern exists to protect.

**Issue.**

40. **The map contradicts its own seat column.** `S-developer`'s seats read OPS; `X-mcpscope`'s seats read all, with parents `S-developer` and `S-you`. Both cannot hold. A personal MCP scope is a personal item, like a mailbox. **Decision:** `S-developer`'s seats cell reads "OPS; MCP scope row: all", and the workspace rows — keys, webhooks, CLI authorisations — stay OPS. The route from `S-you` is already in the map and is the one every non-admin uses.

### Stop 2 · `X-mcpscope`

**Visible first.** The three tiers — read, safe writes, destructive writes — and inside the chosen tier, each action as allowed, approval-required or blocked. Close's published `Close-Scope` header is the model 19§11 calls the cleanest safety design in GTM MCP, and the map adopts it.

**Issues.**

41. **The map gates at the write and forbids gating at the write, in the same file.** The D3 walk row says "a write on Starter ─PN→ `X-upgrade`". IA-MAP 6.4f says "the lock is stated by the endpoint at connection time, not at the moment a write fails — no gate after work the user cannot keep". Gated-features pattern rule 7 says the same. **Decision:** the walk row is wrong. The lock lives on the two write tiers inside `X-mcpscope`, and `X-upgrade` opens from the locked tier, before any work exists; the endpoint restates it at connection. Amend the D3 row.

42. **A client with no visible ceiling.** The journey requires the token to carry "their permissions, credit limit and compliance restrictions". `X-user` carries a per-user credit limit at Meridian and Ridgeline only; at Fathom no seat has one, so the client inherits the workspace cap and nothing says so. This is the credit complaint the product was built to answer — *"watch the credit system closely or you'll get surprised at the end of the month"*, quoted in spec 00. Rule 7. **Decision:** the scope panel prints whichever ceiling applies: "Your limit: none · Workspace cap 10,000 a month, 4.1k left".

43. **Model training is a data-use statement and it is unstated.** 19§11 lists Apollo's MCP prerequisites verbatim, including *"model training turned off in your AI account or client settings"*. Rule 7 names "how data is used" explicitly. **Decision:** the scope panel states the workspace's position on model training at connection time, not in a policy page.

### Stop 3 · `U-mcp`, in the client

The brief's four tests, with no screen to draw them on.

**Issues.**

44. **"Batched at a task boundary" has no meaning in a client turn — the hardest case, and the map stops one step short.** In the app the boundary is "when the agent stops". A model may take twenty tool calls in one turn, and a card per call is precisely the step-by-step queue rule 7's corollary measures: a problematic action was seen 88.5% of the time and stopped 23.9% of the time (Chen et al., n=48), a 76% pass-through on things people were shown. **Decision:** the boundary is the end of the client's turn. Every approval-required action taken in one turn arrives as **one card at the end of it**, carrying the total — "3 actions · 2 emails, 1 enrolment · 12 credits" — and each item's own line with its consequence and its recipient. Never one card per call. This is `X-agent-batch`'s rule re-expressed for a surface with no screen, which is what IA-MAP 6.5 asked the specs to do.

45. **Nothing says what happens at the cap.** IA-MAP part 1 describes the approval card and is silent on the credit ceiling. A partial result is what a model will summarise as success. **Decision:** every credit-consuming tool result states remaining credits; at the cap the call returns a refusal naming the cap, the reset and the approver, never a partial write. 19§11's Zapier line — *"Each successful call uses two tasks from your Zapier plan, and failed calls do not count"* — is the published shape of honest per-call metering.

46. **The third "cannot see it" is true and unsaid.** IA-MAP part 1 says profile omission "is not a concept here at all, because MCP has no sidebar". Correct — and a model given no answer invents one. **Decision:** the server's tool list is exactly the seat's areas, with no profile filtering, and the connection document says so in one line. The other two shapes are already right and stay.

### Stop 4 · `P-agents` ─DR→ `D-agent-steps`

**Visible first.** The briefing, the exceptions section when something is paused, the approval queue with its batch line and per-item consequences, the ledger.

Spec 13 is the strongest spec in this group: the queue holds only irreversible or costly actions, the batch line states the total, over-threshold items say "Needs Daniel Okafor too" **before** the decision, and "Select all" carries the total consequence. None of that needs changing.

**Issues.**

47. **The ledger has no surface.** Columns are When, Agent, What happened, Contact or company, Outcome, Credits. IA-MAP requires "the same run lands in the ledger with the surface marked 'MCP' and the user named", and `X-credits` breaks down by surface. Without it a founder cannot separate what her client did from what the app did — which is the whole of D3's last step. Rule 1 at Fathom, where this is daily. **Decision:** add a Surface column (App, Automation, API, MCP, CLI, Agent) and extend `D-agent-filters`' label to "Date, outcome, kind, teammate, surface". At Fathom the surface filter is promoted out of the door beside Agent; elsewhere it stays inside it, by usage, not by a mode.

48. **The actor line has no shape for a remote run.** Spec 13 insists the actor is named — "Outreach agent", never a bare "AI". An MCP run's actor is a person acting through a client. **Decision:** the actor reads "Priya Natarajan · Claude (MCP)", the human first, because the authorisation is the human's and the ledger is what the compliance answer is read from.

**Score: no.** Missing steps: the turn-boundary batch rule, the credit-cap refusal, and the ledger's surface column. One internal contradiction about when the write gate fires, resolved against the walk row.

---

## D4 · Script a bulk change or export

Halyard, weekly, Growth, OPS (the ops lead holds OPS and SDR). Walk: `P-settings` ─LK→ `S-developer` ─PN→ `X-cliauth` ─LK→ `U-cli` ─AI→ `X-approve-remote` ─LK→ `G-account` ─LK→ `P-tasks` ─DR→ `D-task-options`.

### Stops 1–2 · `S-developer` → `X-cliauth`

**Visible first.** Device authorisations with their workspace, last used and revoke; browser auth, and device flow where there is no browser — Clay's `clay login --device`, 19§12. Checked; no issue beyond the missing area itself (change 23).

### Stop 3 · `U-cli`

The brief's four tests, in the terminal.

**Issues.**

49. **The wrong workspace is the only failure mode that matters here, and the confirmation does not guard it.** IA-MAP part 1 says the workspace is echoed in every confirmation. Ten workspaces, one loop, weekly: echoing is not enough for a destructive bulk write. Spec 14 already has the right pattern — Delete workspace asks for the workspace name typed back. Rule 7. **Decision:** a destructive bulk write requires the workspace name typed back in the confirmation; a non-destructive one echoes it. One pattern, two places.

50. **A script cannot branch on prose.** 19§15.5, Clay: the CLI *"signals rate limiting via exit code 4 with `retryAfter|limit|remaining|reset` in `details`"*. Ollopa's CLI publishes no exit codes, so every failure is a string a script must match. Rule 7 — the states a caller must handle are the equivalent of safety state on a screen. **Decision:** publish the exit codes in the area beside the CLI authorisations: 0 ok · 1 error · 2 usage · 3 permission · 4 rate limited · 5 over the credit cap · 6 awaiting approval, with the resume token printed on 6.

51. **Two of the three "cannot see it" shapes are missing from the terminal.** IA-MAP part 1 writes only the locked capability — "prints the plan name and the monthly total, not a 403". **Decision:** the same three shapes as MCP: a record you do not own exports with its readable fields and an `owner` column; an area your seat does not hold exits 3 with the seats named and the admin named; profile omission does not apply and `--help` says so.

52. **An over-threshold bulk write has no owner in the app's queue.** IA-MAP routes `X-approve-remote ─XL→ P-agents`, and spec 13's queue is scoped by the owner of the object — but a bulk update of 4,000 records has no single owner, and 4,000 queue items is rule 7's corollary written as a screen. **Decision:** spec 13's "What waits" table gains a fifth row: a bulk write from a surface is **one** item, owned by the person who ran the command, carrying the count, the total consequence and the total credits, with the records reachable from the count. Nothing is queued per record.

### Stop 4 · `G-account`

53. **Wrong node.** The walk routes a ten-iteration loop through the app's account menu. IA-MAP part 1 says every CLI command takes a workspace, and 6.4i says the CLI *is* the cross-workspace answer, "which is why it came inside the boundary". **Decision:** replace `G-account` in the D4 row with `U-cli --workspace`; the loop stays in the terminal.

### Stop 5 · `P-tasks` ─DR→ `D-task-options`

**Issue, and it reaches back into L2 and L3.**

54. **Three different answers to "get the data out", and one of them contradicts PLAN.md.** The Tasks table export is ungated. The CLI export is Growth. The Reports CSV export is Scale according to spec 12 §3 and `ctl.export-csv`'s note — but PLAN.md's plan table gives Growth "all plus CSV export" and reserves the scheduled email for Scale, and IA-MAP part 3's edge row agrees: "CSV at Growth, scheduled email at Scale". The spec is wrong against both. The consequence is visible in the spec's own honest paragraph, which says Halyard's ops lead cannot export and prints instead — on Growth she can, which is the whole of D4's first step. And where a gate and a scriptable route disagree, the gate is routed around in one line of shell, which is the measurement trap the gating pattern warns about: the effect of a gate shows up late, not at the gate. **Decision, two parts.** (a) Report CSV export is **Growth**; the scheduled weekly email is **Scale**. Fix spec 12 §3 Actions, §3 "What each plan includes", §6.2's Halyard row and §3's locked-report state, and `ctl.export-csv`'s note. (b) State the rule once, in spec 14's plan table, so one file owns it: **exporting a table a seat can already read is on every plan; exporting a report is Growth; scheduled delivery is Scale.** Reports, Tasks and the CLI render it.

**Score: no.** Missing steps: the exit codes, the workspace confirmation, and two of the three "cannot see it" shapes. One wrong node in the walk and one plan-gate contradiction that spans three files.

---

## What held up

Worth recording, because the walk is not only a defect list.

- **Spec 13, Agents.** The queue holds only irreversible or costly actions; research, scoring and saved drafts are logged and never queued; the batch line states the total consequence; over-threshold items name the second approver before the decision, not after it; "Select all" carries the total. That is rule 7's corollary applied correctly, and it is the pattern the four screenless surfaces copy rather than reinvent.
- **Spec 15, Connect.** The webhook lock sits on the card in step 1, before anything is built — gated-features pattern rule 7, and the only place in the group where the gate is already in the right place.
- **Spec 12's fee line.** "Exports and prints spend no credits" was moved out of the Export menu and onto the control bar, with the reasoning written down. That is the FTC tooltip finding applied to the product's own copy, and it is the model for changes 26 and 32.
- **IA-MAP 6.2 and 6.4f.** The L3 re-scoping records what was lost instead of inventing a conversation record Ollopa does not own; the MCP read scope on every plan protects discovery where the founders already work. Both are right and neither is revisited above.

---

## Change list

One row per change. File, where in it, what it says now, what it should say, the rule that decides it.

| # | File | Location | Current | New | Rule |
|---|---|---|---|---|---|
| 1 | `specs/08-deals-board.md` | §3.8 and §6 role tables | AE, CS, Admin columns only | Add an AE+ column: scope defaults to My team; owner on the card at level one; owner filter in the header beside scope | 1; IA-MAP 6.4j |
| 2 | `src/ollopa/usage/model.ts` | `UsageItem.weekly`, `overrides`, `weeklyUse()` | Five `Role` keys; no way to write a number for an AE with reports | Optional `aePlus` key in `weekly` and in override records; `weeklyUse(item, business, role, hasReports)` returns it when present. No new `Role`, no change to `SEATS` | 1 |
| 3 | `USAGE-MODEL.md` | after "Per business" | Silent on the leader | One paragraph: AE+ is an AE seat with direct reports; items carry an `aePlus` number where the leader's week differs; no business declares a sixth seat | 1; IA-MAP 6.4j |
| 4 | `src/ollopa/usage/deals.ts` | `deals.card.owner`, `deals.filter.owner` | AE 15 / 4 | Add `aePlus` 60 and 55 | 1 |
| 5 | `specs/08-deals-board.md` | §3 "Forecast strip"; §6 level-one table | Commit, Best case, Pipeline, Closed won, Omitted | Add for AE+ a fifth figure: "Coverage 3.1x · this team's 20% win rate needs 5.0x", observed and required on one line | 1, 5; 19§4.5 |
| 6 | `src/ollopa/usage/deals.ts` | new item `deals.forecast.coverage` | absent | Coverage against required, `aePlus` 70, note citing 19§4.5 required coverage = 1 ÷ win rate | 1 |
| 7 | `specs/08-deals-board.md` | §3 "Card"; filter list in §3 and §6 | "Stale, 21 days"; filter "stale" | Card shows "Last touch 3d · last reply 19d"; the filter becomes "No reply in n days" | 1, 6; 18§5 |
| 8 | `JOURNEYS.md` | §1 objects table, note under it | `comment` appears in L1 and L3 and in no object row | One line: a comment is an attribute of a note — a note addressed to one teammate — not a thirty-second object | 4 |
| 9 | `IA-MAP.md` | 2.3, `X-note` row | "Write a note"; objects note, person, company, deal | "Write a note or a comment"; a comment names one teammate and notifies through Home and the digest, never the bell | 4, 7 |
| 10 | `specs/09-deal-record.md` | §3.2 actions | No comment action | Add "Comment to a teammate": lands in the timeline like a note, reaches the teammate on Home and in the daily digest; not a bell kind | 1, 7; 18§5 |
| 11 | `IA-MAP.md` | part 5, L1 row; part 3, `R-deal` edge row | `D-deal-activity ─PN→ X-note` | `X-note` opened from the record's composer, "→ own channel", as `X-preview` and `X-agent-edit` already are | 2 |
| 12 | `IA-MAP.md` | 2.9, `Q-deal` row | "Deal quick look (stage editable)" | "Deal quick look (one editable field, by ownership)": stage for the owner, the comment composer for a non-owner | 1; quick-look pattern |
| 13 | `specs/09-deal-record.md` | §3.1 side panel, §3.2 | Contacts card ordered by role then last touch | Heading "Contacts · 5 · 2 have replied"; each row carries last two-way contact | 1, 5; 18§5 |
| 14 | `src/ollopa/usage/reports.ts` | `ctl.person`, `ctl.team` | AE 15 and 10 | Add `aePlus` 55 and 40 | 1 |
| 15 | `specs/12-reports.md` | §3 "Restricted scope" state; §6 level-one table | An AE gets a sentence where the team select was | For AE+ the team select is a working control fixed to her team, with the person filter promoted beside it | 1 |
| 16 | `specs/12-reports.md` | §3 Pipeline row; §6 door table | "Stage-to-stage conversion" expands in place | Its last line reads "Win rate 20% · needs 5.0x coverage", the same figure the `P-deals` strip names | 5 |
| 17 | `specs/12-reports.md` | §3 Layout, tab list, report table; §6 level-one table | Four tabs: Activity, Pipeline, Sequences, Campaign results | Five tabs. Forecast carries: period and deadline; the roll-up at the seat's position, team first for AE+; one row per report with submitted-or-not and when; the four categories as columns; the goal as denominator; the prediction beside the human number with the deals driving the difference | 1, 7; IA-MAP 2.12, 6.4d |
| 18 | `specs/12-reports.md` | §3 Actions | No forecast submission | `X-forecast`: the number, a judgement note, submission-changes history, Submit. The adjustment does not alter the underlying roll-up. Submit states its consequence before the click and names who receives it. No agent ever submits | 7; 18§4 |
| 19 | `specs/12-reports.md` | §3 "The records drawer" | No sort stated | On the Forecast tab the records sort by forecast category then risk, not amount, and the drawer says so | 1; 18§5 Clari |
| 20 | `src/ollopa/usage/reports.ts` | new area "Forecast" | absent | `fc.rollup`, `fc.submitted`, `fc.submit`, `fc.goal`, `fc.prediction`, `fc.adjust-note`, with `aePlus` numbers and AE, CS and admin baselines | 1 |
| 21 | `specs/14-settings.md` | §6.3 Pipeline door list; §3.4 | Pipelines and stages, contact and account stages, custom fields, deal currency, enrichment provider order (5) | Add forecast categories, the goal per period per user or team, and the submission deadline day, time and window (8) | 5; 19§4.4, IA-MAP 6.3 |
| 22 | `src/ollopa/usage/settings.ts` | Pipeline and data area | No forecast rows | Add `pipe.forecast-categories`, `pipe.goal`, `pipe.submission-window` | 1 |
| 23 | `specs/12-reports.md` | §3 Actions, date range | This week, Last 7, Last 30, This quarter, Last quarter, Last 90, This year | Add This month and Last month | 1 |
| 24 | `specs/12-reports.md` | §3 "Locked report" state | Pipeline and Sequences tabs locked on Starter | The Forecast tab on Starter shows the number and the goal and locks only submission and roll-up | gated-features 6 |
| 25 | `IA-MAP.md` | part 5, L2 row | `X-forecast ─PN→ X-report-records` | Both are panels on `P-reports` (Forecast), siblings, not parent and child | 2 |
| 26 | `src/ollopa/usage/reports.ts` | Activity area | Sort reps, weekly trend, meetings booked | Add `act.coached` (`aePlus` 60) and `act.calls-with-note` (`aePlus` 45), citing 18§9's calls listened / with feedback / with scorecards | 1 |
| 27 | `specs/12-reports.md` | §3 report table, Activity row | Four counts and tasks overdue per rep | For AE+ add columns "Calls logged" and "Calls with a coaching note (30 days)", and a tile "Reps coached this week · 3 of 8" | 1; 18§9, 17§3 |
| 28 | `IA-MAP.md` | 2.12, `X-report-records` row | objects deal, person, campaign, sequence | Add `call` | 4 |
| 29 | `specs/12-reports.md` | §3 "The records drawer" | Records are deals, sequences, campaigns | Add calls as a record kind | 4 |
| 30 | `specs/02-people.md` | §3 record row; shared template in `specs/09` | Activity is a scrolling section | Recent activity is a section; "All activity · n" is the door onto the full list | 2; IA-MAP 2.3 |
| 31 | `IA-MAP.md` | 2.8, `X-calllog` row | "Log the call: purpose, disposition, duration, notes" | "The call: purpose, disposition, duration, notes, transcript" — the owner logs, anyone who can see the record reads | 4 |
| 32 | `specs/07-tasks.md` | §3 call panel | Logging only | Two modes, read and log; the transcript block is removed where no integration supplied one, never disabled | 4 |
| 33 | `specs/07-tasks.md` | §3 call panel | No coaching note | A coaching-note block inside the call with fixed headings — what went well, what to change, one behaviour for next week — timestamped, visible to the rep. Suggested answers are an agent proposal inside it with state suggested / edited / accepted, never published until accepted | 5, 7; IA-MAP 6.2 |
| 34 | `IA-MAP.md` | part 5, L3 row | ends `X-calllog ─PN→ X-note` | Delete the trailing `─PN→ X-note`; the coaching note is inside `X-calllog` | 2, 5 |
| 35 | `specs/01-home.md` and `specs/00-...` §3.4 | Home sections; digest list | No feedback row | A saved coaching note appears on the rep's Home as "Feedback on your calls" and as a digest line; not a bell interrupting kind | 7; 18§9 |
| 36 | `specs/14-settings.md` | §3.1 area order, §6.2, §6.3 | Twelve areas; API keys and webhooks inside the Integrations door | Thirteenth area, "API, webhooks, MCP and CLI", between Integrations and Plan. Level one: keys with per-key spend, the per-workspace limit line, the published cost table, the 80% alert row, webhook subscriptions with the delivery contract, MCP scope, CLI device authorisations and exit codes | 1, 2; IA-MAP 2.14, 6.5 |
| 37 | `src/ollopa/usage/settings.ts` | `int.api-keys`, `int.webhooks` | Inside Integrations, 6 and 4 | Move to area "API, webhooks, MCP and CLI" as `dev.api-keys`, `dev.webhooks`; add `dev.mcp-scope`, `dev.cli-auth`, `dev.limits` (critical), `dev.key-spend`, `dev.cost-table` (critical), `dev.hook-contract` (critical) | 1, 7 |
| 38 | `specs/17-developer-surfaces.md` | new file | Does not exist | One spec in the standard eight-section shape covering `S-developer`, `X-key`, `X-hook`, `X-mcpscope`, `X-cliauth`, `X-approve-remote`, `U-api`, `U-hooks`, `U-mcp`, `U-cli`. No new node; every one is already in IA-MAP 2.16 | IA-MAP 6.5 |
| 39 | `specs/17-developer-surfaces.md` | API key area | — | "Limits are per workspace, not per key. 200 a minute · 6,000 an hour · 50,000 a day", at level one above the key list | 5, 7; 19§9 |
| 40 | `specs/17-developer-surfaces.md` | API key area | — | A published cost table at level one: per endpoint, typical and maximum, stating the waterfall tail (phone 8–25, up to 45+) | 7; 19§9 |
| 41 | `specs/17-developer-surfaces.md` | API key area | — | "Alert the key's owner at 80% of the allocation", on by default; delivered as a digest line and a bell row under the existing credits-low kind | 7; IA-MAP part 1 |
| 42 | `specs/17-developer-surfaces.md` and `IA-MAP.md` part 1, **The API** | "remaining requests in a response header" | Rate limit only | Two headers: `X-Credits-Remaining` beside `X-RateLimit-Remaining` on every credit-consuming response; at the cap, a refusal naming the cap, the reset and the approver, never a partial result | 7 |
| 43 | `IA-MAP.md` | part 1, **The API** | Three kinds of "cannot see it" written for MCP only | State all three for the API in the same shapes, including the explicit line that profile omission does not exist for a key | declared-sidebar pattern |
| 44 | `JOURNEYS.md` | D1 approval line | "Approval: None; the credit cap is the gate" | No per-item approval; the credit cap is the gate; a single call above the second-approval threshold returns the pending-approval object with consequence, cost and approver, and the same item appears in the app's queue | 7; IA-MAP part 5 D1 |
| 45 | `specs/00-shell-signin-palette-notifications.md` | §3 credits pill | Links to Settings › Plan › Credit balance and burn rate | Opens the `X-credits` panel on its own channel, like the bell; the panel carries spend by feature, person and surface. The settings anchor stays as a second route | 2, 7; IA-MAP part 4 |
| 46 | `specs/00-shell-signin-palette-notifications.md` | §3 credits pill text and tooltip | Run-out date and runway only in the tooltip | When the run-out falls inside the billing period the pill prints it: "4.1k credits · 2.3k/wk · out 26 Sep" | 4, 7 |
| 47 | `IA-MAP.md` | part 3 edges | `R-job` reached from `W-import`, `S-prospecting`, `X-credits` | Add `X-key` → `R-job`, filtered to that key's jobs | 4 |
| 48 | `specs/15-connect-integration.md` | §1 and the hand-over sentence | "hands over to the integration's page in Settings" | Name the destination by kind: CRM, calendar, Slack and enrichment hand over to `R-integration`; a webhook hands over to Settings › API, webhooks, MCP and CLI › the subscription | 5 |
| 49 | `specs/17-developer-surfaces.md` | webhook area | — | The delivery contract as six lines at level one under the subscription list: at-least-once, signed, attempt-numbered, retried for 24 hours, never silently disabled, reconciliation endpoint named and copyable | 5, 7; 19§10 |
| 50 | `specs/17-developer-surfaces.md` | webhook subscription row | — | The subscription's own state: delivering / failing since / paused by you; failures grouped by cause with the same treatment `X-errors` gives sync errors | 1, 7; IA-MAP part 1 |
| 51 | `specs/15-connect-integration.md` | §3 step 3, webhook event list | Events listed | One line: approvals are not webhook events, and where they do arrive — a surface with no reply path cannot carry a decision | 7 corollary |
| 52 | `IA-MAP.md` part 1 **email digest**; `specs/00-...` §3.4 | Overdue tasks, replies, agent batch, paused sequence, credit run-out | | Add a failing webhook subscription with its failure count and cause | 7 |
| 53 | `IA-MAP.md` | 2.14, `S-developer` seats cell | "OPS" | "OPS; MCP scope row: all" — workspace rows stay OPS, the MCP scope is a personal item reachable from `S-you` | 4 |
| 54 | `IA-MAP.md` | part 5, D3 row | "a write on Starter ─PN→ `X-upgrade`" | The lock sits on the two write tiers inside `X-mcpscope` and is restated by the endpoint at connection; `X-upgrade` opens from the locked tier, before any work exists | gated-features 7; IA-MAP 6.4f |
| 55 | `specs/17-developer-surfaces.md` | MCP scope panel | — | Prints the ceiling that applies: "Your limit: none · Workspace cap 10,000 a month, 4.1k left" | 7 |
| 56 | `specs/17-developer-surfaces.md` | MCP scope panel | — | States the workspace's position on model training at connection time | 7 |
| 57 | `specs/17-developer-surfaces.md` and `IA-MAP.md` part 1 **MCP** | "the approval batch has to arrive in the client" | Boundary undefined for a client turn | The boundary is the end of the client's turn: every approval-required action from one turn arrives as one card with the total ("3 actions · 2 emails, 1 enrolment · 12 credits") and each item's own consequence line. Never one card per call | 7 corollary |
| 58 | `specs/17-developer-surfaces.md` | MCP | — | Every credit-consuming tool result states remaining credits; at the cap, a refusal naming the cap, the reset and the approver, never a partial write | 7 |
| 59 | `IA-MAP.md` | part 1, **MCP** | "a page the profile left out is not a concept here" | Add that the server's tool list is exactly the seat's areas, with no profile filtering, and that the connection document says so | declared-sidebar pattern |
| 60 | `specs/13-agents.md` | §3 Activity columns; filter door label | When, Agent, What happened, Contact or company, Outcome, Credits; "Date, outcome, kind, teammate" | Add a Surface column (App, Automation, API, MCP, CLI, Agent); the door becomes "Date, outcome, kind, teammate, surface"; at Fathom the surface filter is promoted beside Agent | 1, 4; IA-MAP part 1 |
| 61 | `specs/13-agents.md` | §3 "The waiting item", actor | "Outreach agent", never a bare AI | A remote run's actor reads "Priya Natarajan · Claude (MCP)", the human first | 4, 7 |
| 62 | `specs/13-agents.md` | §3 "What waits, and what does not" table | Four rows | Fifth row: a bulk write from a surface is one item, owned by whoever ran the command, carrying the count, the total consequence and the total credits, records reachable from the count. Never one item per record | 7 corollary |
| 63 | `specs/17-developer-surfaces.md` and `IA-MAP.md` part 1 **CLI** | "the workspace name is echoed in every confirmation" | Echo only | A destructive bulk write requires the workspace name typed back, as Delete workspace already does; a non-destructive one echoes it | 7 |
| 64 | `specs/17-developer-surfaces.md` | CLI area | — | Published exit codes: 0 ok · 1 error · 2 usage · 3 permission · 4 rate limited · 5 over the credit cap · 6 awaiting approval, with the resume token printed on 6 | 7; 19§15.5 |
| 65 | `IA-MAP.md` | part 1, **The CLI** | Locked capability only | State all three "cannot see it" shapes: an unowned record exports its readable fields with an `owner` column; an area the seat does not hold exits 3 naming the seats and the admin; profile omission does not apply and `--help` says so | declared-sidebar pattern |
| 66 | `IA-MAP.md` | part 5, D4 row | `─LK→ G-account (switch workspace, repeat)` | `U-cli --workspace`; the loop stays in the terminal | IA-MAP 6.4i |
| 67 | `specs/12-reports.md` | §3 Export action, §3 "What each plan includes", §3 Locked report, §6.2 Halyard row | CSV export locked below Scale | CSV export is Growth; the scheduled weekly email is Scale. Halyard, on Growth, exports; the "prints instead" paragraph goes | PLAN.md plan table; IA-MAP part 3 |
| 68 | `src/ollopa/usage/reports.ts` | `ctl.export-csv` note | "Scale only… Halyard would use it weekly and cannot" | Growth and above; Halyard's weekly export is real. Raise `halyard.admin` from 8 to 45 | 1 |
| 69 | `specs/14-settings.md` | §2 plan table row for exports | Reports row only | One owning sentence: exporting a table a seat can already read is on every plan; exporting a report is Growth; scheduled delivery is Scale. Reports, Tasks and the CLI render it | gated-features 9 |
