# Journey walk: G1–G5, agents as the actor

*Walked 15 September 2026 against RULES.md, PLAN.md section 2 (the agent-approval decision, the S1 walk decisions, the map decisions), IA-MAP.md parts 2–6, JOURNEYS.md "Agents, as the actor", and `knowledge-base/sources/14-sweep-agent-disclosure.md`. Walked from the human's side: who sees what, where the approval lands, what the consequence line says, what is logged and what is queued.*

**Result: 29 issues, 31 changes. All five journeys score no as currently specced; every one is fixable by the changes below and none needs a new level.**

The spine holds. The approval policy — owner approves, admin may approve for anyone and is named, low-cost reversible work logged not queued, per-item only for irreversible or costly actions, a second admin approval above a Settings threshold, batches at a task boundary — is stated once in spec 14 and read the same way in specs 00, 01, 09, 10, 11 and 13. That is the hard part and it is done. What fails is at the edges: the standing cost of a logged agent, the inputs behind a draft, a ranking that would move rows, a palette command that approves without a consequence, and a stage change proposed without the sentence that says what it moves.

---

## G1 · The research agent works a list overnight

*Fathom, daily. Walk: `R-list` → `R-company` ─DR→ `D-co-research` ─LK→ `R-brief` ─HS→ `P-home` ─DR→ `D-home-agents` ─LK→ `P-agents` ─DR→ `D-agent-steps`.*

### The stops

**`R-list` — the watched list.** Fathom's founder opens a list the research agent feeds ("three built by the Research agent", spec 04 §2). Visible first: the members, the credits the *next* action will spend ("212 net-new emails = 212 credits · balance 1.84M"), "96 already in another sequence", and the auto-feed line "New matches added to Q4 enterprise outbound automatically · Turn off". Doors: "Refresh and alerts" (cadence, last refreshed, email alert), "History: 9 changes", the filters and columns doors, the row "…". Containers: all in place under the chips, except the row menu. The thing never to lose sight of: *a list is a group about to be acted on, and acting costs something* (spec 04 §1).

**`R-company` → `D-co-research`.** Visible first: the record's header and its scrolling sections. The door reads "Agent research · n runs, n credits a run" — count and price in the label, the model the other doors should copy. In place, on the record. Behind it: the runs and the brief link.

**`R-brief`.** A level-1 record, parent `R-company`. Nothing in `specs/` describes it. IA-MAP §6.5 already lists it as one of nine nodes the specs must absorb.

**`P-home` → `D-home-agents`.** Visible first for the Fathom founder: the health strip in warning ("Credits: at 2,300 a week the cap is reached on 25 September"), Today, Replies, Approvals, Pipeline, Your week. The research run is not in Approvals — correctly, it is logged. It is behind "What agents did this week (n)", in place at the bottom of the approvals section.

**`P-agents` → `D-agent-steps`.** Visible first: the briefing sentence with runs, waiting, paused and credits-this-week against the cap; the agent tiles with what each does and what it never does without a person; exceptions only when something is paused or capped; the queue; the ledger with a per-day digest and a credits column. The step log is one door per row: "3 steps · 12 credits ▾", holding "Read northwindanalytics.com (2 credits)" and the rest. Two levels, no more. The thing never to lose sight of: *what is waiting, what happens if I say yes, what it costs.*

### Issues

**G1-1 · The standing spend has no home, and no off switch on the object it applies to.** JOURNEYS names the person's decision as "is the standing spend worth it". The workspace cap and burn are visible (shell pill, Home strip, agents briefing), and every *one-off* action on a list prices itself. But a research agent watching a list is a recurring charge with no total anywhere and no "stop" on the list. Rule 7, and the study the rule cites: a recurring monthly charge shown only in small grey font took acceptance from 14.8% to 30.1% (Luguri and Strahilevitz). Spec 04's own principle already covers three standing consequences ("a segment that feeds a sequence keeps enrolling people after you leave"); this is the fourth and it is missing.

**G1-2 · "Skip anything under a compliance restriction and say so" lands nowhere.** Spec 13's `kind` enum is researched, drafted, scored, proposed, sent, paused, capped. There is no skipped event and no skip reason, so a record the agent declined to touch is invisible. For Fathom, where nobody else checks, that is the compliance story.

**G1-3 · `R-brief` has no spec.** A record a journey reaches with no section saying what it carries. Known gap (IA-MAP §6.5), still open. For an agent-written record the missing parts are exactly the ones that matter: the actor, when it ran, the sources, what it cost, and how to run it again with the price stated first.

**G1-4 · "Surface the three best accounts on Home" is a ranking, and the walk routes it into a door.** The map sends it to `D-home-agents`, a weekly summary. Two problems: the three accounts are not in it, and a ranking that reordered anything on Home would break rule 6. The result the founder pays for daily (`brief.digest` 75 at Fathom) sits behind a door with a weekly label.

**G1-5 · Map notation.** The G1 walk row writes `R-list` → `R-company` with no edge type. It is `RC`.

### Decisions

1. **The standing watch becomes a level-one line on the list**, a sibling of the auto-feed line it copies: "Research agent researches new matches · about 12 credits each · about 336 credits a week · Turn off". Not behind "Refresh and alerts". Rule 7 — price, commitment and the path to cancel no longer than the path to subscribe. A usage item `list.agent-watch`, marked critical.
2. **`skipped` becomes an event kind** with a `skipReason` ("suppressed", "unsubscribed", "region restricted", "do not call"), logged with zero credits, filterable by kind, and counted on the batch line (see G4-2). Rule 7: what the agent refused to do is decision-critical at Fathom and at Halyard, where one workspace's restriction is another's default.
3. **`R-brief` is specced inside spec 03 (Companies)**, where `R-company` is its primary parent: header carries the actor and the run time, sources are listed with links, the credit cost of the run is on the record, and "Research again · 12 credits" prices itself before the click. Rule 7 and the "name the actor, every time" line spec 13 already applies to rows.
4. **The research result gets one level-one line, and moves nothing.** At the bottom of Home's approvals section, above the "What agents did this week (n)" door: "Research agent · 12 companies overnight · 3 strongest: Northwind Analytics, Bluefin Logistics, Calder Group · 24 credits", the three names as links. Shown only where a research agent ran since the last visit and only for roles at 20 or above on `brief.digest` (Fathom founder 75, Meridian SDR 65, Halyard SDR 70). Rule 1 for its presence; rule 6 for its form — adaptation adds in place and never reorders.
5. **Map fix:** `R-list ─RC→ R-company`.

### Score

**No.** No third level and the cost of *actions* is honest, but the person loses sight of the standing spend, and two steps the journey names — "skip and say so" and "surface the three best accounts" — have no home. Missing step: **the recurring agent charge on the object that carries it, with its off switch.**

---

## G2 · The drafting agent writes copy and replies

*Meridian, daily. Walk: `P-agents` ─DR→ `D-agent-item` ─PN→ `X-agent-edit` ─PN→ `X-agent-batch`; the same draft also ─LK→ `X-thread` ─PN→ `X-reply`.*

### The stops

**`P-agents`.** As G1. For Meridian's SDR the page *is* the queue (`wait.list` 70, `wait.consequence` 70). Visible first and without a click: each waiting item's actor, the summary with title and company, the consequence sentence ("Sends now from marcus@meridian.io. 0 credits. Replies land in your Inbox."), the credits right-aligned, Approve and Decline side by side and the same size, the age, and the batch line above the list ("6 arrived while the outreach agent ran, 09:02. Together: 4 emails from your mailbox, 2 people added to sequences, 8 credits."). Items over the threshold say "Needs Daniel Okafor too" *before* the decision.

**`D-agent-item`.** One door per item, in place, labelled by content and size: "Read the draft · 142 words". Behind it: the draft with its subject. Persists per item until decided. The consequence and the credits stay outside it — spec 13 §8 caught that and fixed it.

**`X-agent-edit`.** Spec 13 says the draft "opens in place, editable; the button under it reads 'Send edited draft' with the same consequence sentence". IA-MAP §2.13 says a panel, parent "`D-agent-item` → own channel", reached by `PN`.

**`X-agent-batch`.** "Approve n · decline n, with the total consequence". A panel on `P-agents` and `P-home`.

**`X-thread` → `X-reply`.** The same draft reached from Inbox, beside the message it answers.

### Issues

**G2-1 · A panel opened from inside a door is a third level.** Rule 2 counts per channel, and `X-agent-edit` is not one of the fourteen channels in IA-MAP part 4. The map's "own channel" note is an assertion with nothing behind it. Spec 13 is right and the map is wrong.

**G2-2 · The waiting item does not say what the draft was built from.** JOURNEYS G2: "mark clearly that it is generated and from which inputs". The inputs exist — spec 13 §2 item 6 puts "Used company context", "Used research from 12 Sep" in the step log — but the step log hangs off a *ledger* row, and "waiting items are not repeated in the ledger" (spec 13 §3). So before approving, the inputs are unreachable. The person's stated decision is "is the tone right for this account", which is a judgement about inputs.

**G2-3 · A reply draft is shown without the message it replies to.** JOURNEYS G2: "show the person the draft beside the original message". On `P-agents` the door holds only the draft; the incoming message is on another page. That is a mutually dependent pair split by a door, and worse, split by a page. Rule 5, and Fluent 2's line verbatim: never put information in one accordion item that needs to be referenced in another.

**G2-4 · A "confidence" badge, uncalibrated, sits behind Home's door.** Spec 01 §2.2 defines `AgentEvent.confidence` as low / medium / high and §6.3 puts it behind "What the agent found". Spec 13 has no confidence anywhere, so two specs disagree. And sweep 14 §7 settles the direction: a well-calibrated confidence score improved accuracy by 20 points, a miscalibrated one by 2, and high expressed confidence raises automation bias *even on wrong recommendations* (Fregosi et al., n=184). A model's self-report of its own confidence is uncalibrated by construction. It is worse than nothing on a queue whose measured failure is rubber-stamping.

**G2-5 · Nothing says what happens to an item nobody decides.** JOURNEYS G2 cites a 14-day approval expiry from source 17§9. Spec 13 has "Decide tomorrow" but no expiry and no stale state, so a queue can silently hold a send for a month and then send it. Rule 4: a control must deliver on its promise.

**G2-6 · Two agent doors on Home hold overlapping content with different labels.** `D-home-item` "What the agent found" (draft, sources, confidence) and `D-agent-item` "Read the draft · 142 words". Same object, same level, two labels, one of which says nothing about size or content. Rule 4: the label is the only scent.

### Decisions

1. **`X-agent-edit` stops being a panel.** IA-MAP §2.13 changes its type to "in-place edit state of `D-agent-item`", level 2, and the G2 and G5 walk rows change `─PN→ X-agent-edit` to `(edit in place)`. The id stays because journeys reference it. Rule 2 (never a door inside a door) and rule 5 (the consequence sentence stays beside the thing being edited).
2. **The item door carries its inputs.** Label becomes "Read the draft · 142 words · 3 inputs"; the first line inside is "Built from: company context · research 12 Sep · template 'Founder intro'", each a link to a page. A line, not a second door. Rule 5.
3. **A reply-kind item quotes what it answers.** Inside the same door, above the draft: the incoming message's first five lines with sender and time, then "Open the thread" as a link. Rule 5.
4. **Bare confidence is removed from the product; an observed track record replaces it, on the tile.** `AgentEvent.confidence` goes. The agent tile on `P-agents` gains one line: "Last 30 days: 34 drafts · you sent 31, edited 12, declined 3." It is a measured frequency of this agent's work as judged by this person, not a model's self-estimate, which is what "calibrated" means in sweep 14 §7; and putting it on the tile rather than on every row keeps it out of the queue's per-item attention budget (rule 7's corollary). Home's door content drops "confidence" with it.
5. **A waiting item expires at 14 days.** From day 11 the item reads "Expires in 3 days · nothing will be sent"; at 14 days it is declined and the ledger row reads "Expired unapproved 28 Sep. Nothing was sent." Rule 7 (the consequence stated before it happens) and rule 4. A usage item `wait.expiry`, marked critical.
6. **Home's door takes the Agents page's label**: "Read the draft · 142 words · 3 inputs", with the same contents. One object, one label, everywhere. Rule 4.

### Score

**No.** No third level once `X-agent-edit` is fixed, and the consequence line is the best in the product. But the person decides "is the tone right" without the inputs and, on a reply, without the message. Missing step: **what the draft was built from, and what happens to an item nobody decides.**

---

## G3 · The scoring agent re-ranks the day

*Ridgeline, daily. Walk: `P-agents` ─DR→ `D-agent-filters` ─DR→ `D-agent-steps` ─LK→ `P-tasks`; the reasons read ─LK→ `P-accounts` ─DR→ `D-acct-health`; recalibration ─LK→ `S-scoring`.*

### The stops

**`P-agents` → `D-agent-filters`.** "Date, outcome, kind, teammate ▾", in place in the filter row, holding the filters under 20% for this role at this business; any at 20% or above is promoted out and the label is rewritten to list what is still inside. It never says "More". Persists per user per workspace.

**`D-agent-steps`.** "Score 82 · how it was built" on the item, "3 steps · 12 credits ▾" on the ledger row, holding "Fit 84 from industry, size, stack", "Intent 61 from 2 signals", "Score 82".

**`P-tasks`.** Visible first for Ridgeline's SDR: "8 due today · 3 overdue · 13 later", "Work the queue (11)", and the columns Due, Type, Contact, What to do, From, Owner. Order fixed: overdue first, then due date oldest first, then type. Spec 07 §6 deleted Apollo's "Recommended ✦AI" tab on rule 6 and deleted its hover-only reason on rule 4.

**`P-accounts` → `D-acct-health`.** Strong. Health as a number with its band as text, never colour alone, an arrow for the 30-day change, drivers stored so they sum to the score, a user-chosen sort, and "Health score model" linking to Settings with the link saying what changes there. Scoring is logged, not queued, and the spec says so.

**`S-scoring`.** Signals, scoring and personas, a settings area at level 1, seats OPS and MK.

### Issues

**G3-1 · The journey re-ranks and the rules forbid it.** JOURNEYS G3: "re-rank the task queue and account list". Rule 6: "Nothing changes place on its own", and its consequence clause — adaptation "adds in place … and never reorders or removes". Todi et al. (CHI 2021, 6,480 trials) put frequency reordering 15% slower on items outside the promoted head; Gaspar-Figueiredo et al. (JSS 2025, n=40, EEG) found no difference either way. Spatial adaptation loses at any accuracy. Spec 07 already decided this for Tasks and spec 13's own score line 8 says "no reordering by predicted importance". The journey is the only thing still claiming it.

**G3-2 · The score has nowhere to land on a task row.** Having removed the ranking, spec 07 did not put the score anywhere: it is not a column, not in the row door, not in the queue console. So at Ridgeline, where "product signals change the ranking hourly", the SDR working tasks never sees a score at all.

**G3-3 · The source's reason is hover-only.** 16§15: "To see why a task was recommended, hover over Recommendation". Spec 07 §5 already names this as a rule 4 and WCAG 1.4.13 failure. The journey still inherits it through its source row.

**G3-4 · "Write nothing to a field a human validated" has no control behind it.** IA-MAP §6.3 names the state — suggested, edited, validated, "never silently overwritten" — but no spec carries it: not spec 09's fields, not spec 11's, and not spec 14's approval rules, where the policy is supposed to live once and be read everywhere.

**G3-5 · A crossed routing threshold has no place to appear.** JOURNEYS G3: "flag anything crossing a routing threshold". Spec 13's Exceptions section exists only while something is paused or capped, and the item is not an approval. So the flag falls between the two.

**G3-6 · No route from the Agents page to scoring settings.** The person's stated decision is "recalibrate if the reasons look wrong", formed while reading "Score 82 · how it was built". The page's only settings link goes to Agents and AI. Rule 4: the control belongs where the intent forms, and rule 8's consequence — offer the route or the intent dies. Accounts already does this right with "Health score model".

### Decisions

1. **G3 never reorders, and JOURNEYS says so.** The step text changes from "re-rank the task queue and account list" to "write the new score to the record and the task and show the change in place; nothing moves". Rule 6.
2. **The score arrives as a chip on the task row, with its previous value.** In the Contact cell of `P-tasks`: "Fit 82 ▲ from 61", text and arrow, never colour alone, present only where the business uses scoring. The row does not move, and the reason is the row door's first line, in text — never a hover. Rule 6 for the stability, rule 4 for the text. Usage item `row.score`, Ridgeline SDR 35, others 0.
3. **The validated state becomes a visible chip on any agent-writable field**, on `R-deal` and on the account record: suggested / edited / validated. An agent proposes against a validated field and never writes it. The policy line goes in spec 14's Agents and AI at level one, beside the other approval rules: "Agents never overwrite a field a person set or confirmed; they propose instead." Rule 7 (safety state visible) and the one-policy rule spec 14 already owns.
4. **A crossed routing threshold is a ledger event, not an exception and not an approval.** Row text: "Scoring agent: Northwind Analytics crossed the 75 routing threshold · routed to Marcus Adeyemi · 0 credits". Logged, undoable, filterable. It is object state, not a decision — the "logged, not queued" policy read straight.
5. **The scoring tile links to its rules.** "Scoring rules →" on the tile, to Settings › Signals, scoring and personas; for a seat that cannot change them, the line names the admin, as the page already does for agent settings. Rule 4 and the role-gap rule in PLAN.md.
6. **Map fix:** the G3 walk row reads as a chain of two doors. It should read `P-agents ─DR→ D-agent-filters`, back to the page, `─DR→ D-agent-steps` — siblings, not nesting.

### Score

**No.** No third level and the Accounts leg is the best-built part of this group. But the journey as written breaks rule 6, and the SDR who works tasks all day at Ridgeline never sees the score at all. Missing step: **the score's arrival on the task row, in place, with its previous value and a reason in text.**

---

## G4 · The sending agent runs an outbound push

*Meridian, weekly. Walk: `P-agents` ─PN→ `X-agent-batch` (count, recipients, mailboxes, credits) → over the threshold ─LK→ the admin's `P-agents`; run from a client ─AI→ `X-approve-remote`; a campaign send ─PN→ `X-schedule`.*

### The stops

**`P-agents` → `X-agent-batch`.** Checkbox per item, "Select all 6", and a bar reading "Approve 6 · Decline 6" with the total consequence beneath: "Sends 4 emails from your mailbox, adds 2 people to sequences, 8 credits." Items whose mailbox is paused stay behind and say why; items over the threshold go to the admin rather than out.

**The admin's `P-agents`.** The admin's queue holds everyone's items plus every item over the second-approval threshold, whoever owns it. The requester's copy stays on screen as `waiting-second` and names who it waits for, "so nobody thinks it has been sent" — a good detail.

**`X-approve-remote`.** "The approval card, in the client or the terminal", parent `U-mcp` / `U-cli` / `U-api`. No spec section anywhere.

**`X-schedule`.** Solid. "Sends to 1,240 people from marketing@meridian.io on Tue 16 Sep, 09:00 CET" with the suppressed counts; above the threshold the button reads "Request approval", the dialog states what the approver will see, and the row shows "Awaiting approval: Daniel Okafor". The threshold is read from Settings, never written here.

### Issues

**G4-1 · ⌘K approves a batch with no consequence and no expansion.** Three files disagree. Spec 00 §3.3 lists the palette action as "Agent items waiting for approval (Agents filtered to pending)" — correct. Spec 01 §3.5 lists "Approve all pending agent actions · A". IA-MAP §1 lists "Approve all pending agent actions" as one of the palette's three staged commands. Spec 13 lists "Approve all drafts to verified emails". Two of those four execute an approval from a dialog that shows no recipients, no credits and no consequence line, in one keystroke, from any page. That breaks rule 7 head-on and it breaks the S1 decision by name — "Approve all … requires each item to have been expanded or scrolled past once, and carries the total consequence in its label".

**G4-2 · The batch line says what will be sent and never what was excluded.** JOURNEYS G4: "check compliance restrictions and suppressions … report what went and what was rejected". The person's stated decision is "is the volume safe for the mailboxes". Spec 13's batch line has the sends; the skipped records are nowhere (see G1-2). `X-schedule` gets this right — it prints the suppressed counts in the summary — so the queue is the outlier.

**G4-3 · "Approve all" labels do not carry the S1 form.** S1 fixed the shape: "Approve 8 · send 8 emails · 32 credits". Spec 13's bar reads "Approve 6 · Decline 6" with the consequence on a second line; spec 01's header reads "Approve all (n) · 48 credits" with the actions only inside a confirmation. Neither carries the expanded-or-scrolled precondition.

**G4-4 · The admin's second-approval item does not say who asked, or from where.** The admin is making the same price decision the gated-features pattern point 5 governs — requester, cost, origin, reason, time — and the surface matters here because the same item can arrive from MCP, the CLI or the API, where nobody watched it being made. Spec 13's item copy has the consequence and the cost but not the provenance.

**G4-5 · A bulk approve reports per item and not as a batch.** Six toasts, or one toast naming one send. JOURNEYS G4: "report what went and what was rejected". Nothing states the outcome of the decision that was actually taken.

**G4-6 · The remote approval card is unwritten.** IA-MAP §1 describes it well — a card the model cannot summarise away, carrying actor, consequence, recipients or record, credit cost and the second-approval line — and §6.5 records that the four screenless surfaces "need the approval batch, the consequence line and the credit cap written as text before any screen for them is designed". No spec section owns it, so the one place with no screen has the least-specified consequence line.

### Decisions

1. **No palette command ever approves.** "Approve all pending agent actions" becomes "Review 6 waiting · 4 emails · 8 credits", which opens `X-agent-batch` focused; spec 13's "Approve all drafts to verified emails" becomes "Review drafts to verified emails (4)" and opens the batch filtered. Spec 00's wording is the correct one and the other three files are amended to it. Rule 7 and the S1 decision.
2. **The batch line gains its exclusions.** "6 arrived while the outreach agent ran, 09:02. Together: 4 emails from your mailbox, 2 people added to sequences, 8 credits. 11 records skipped: 7 suppressed, 3 unsubscribed, 1 region restricted" — the count linking to the ledger filtered to `skipped`. Rule 7 and rule 1.
3. **Both Approve-all labels take the S1 form** — "Approve 6 · send 4 emails, add 2 to sequences · 8 credits" — and both carry the precondition: Approve all is inactive until every item in the batch has been expanded or scrolled past once, with the reason stated beside it ("2 items not yet read"). It is the one place in the product where a control is inactive rather than removed, because it is not a capability gate but an unmet condition, and the condition is named. Rule 7's corollary, and S1.
4. **The admin's item carries its provenance**: "Marcus Adeyemi approved this at 09:14 from the CLI. 1,240 recipients, over the 1,000 in Settings. 32 credits." Plus the requester's reason where one was written. Rule 7 and the gated-features pattern point 5.
5. **A batch decision reports as a batch.** After a bulk approve, a result line at the top of the ledger's day group: "09:14 · you approved 6 · 4 sent, 2 held (mailbox paused) · 8 credits", and the held items stay in the queue with their reason. Rule 4 — the control delivers on its promise — and rule 7.
6. **The remote approval card is written in spec 13 §3**, as a subsection "The same item on a screenless surface", because the approval policy is spec 13's and one owner keeps one consequence line. It states: the card carries the actor, the consequence sentence, the recipients or the record, the credit cost and the second-approval line; it is not summarisable and not collapsible; the same item appears in the app queue and is decided once in either place; the ledger row marks the surface and names the user. Spec 14 keeps only the scope switches. Closes the IA-MAP §6.5 obligation for `X-approve-remote`.

### Score

**No.** No third level and the threshold machinery is right. But two of the four palette entries approve a batch with no consequence line, which is the exact failure rule 7 and S1 both legislate against, and the person judging "is the volume safe" is never told what the agent skipped. Missing step: **what was excluded, and what the batch actually did after the click.**

---

## G5 · The agent proposes a change to a deal

*Meridian, weekly. Walk: `P-agents` ─DR→ `D-agent-item` ─PN→ `X-agent-edit` ─LK→ `R-deal` ─DR→ `D-deal-evidence` ─DR→ `D-deal-history`.*

### The stops

**`P-agents` → `D-agent-item`.** The stage proposal in the queue. Correctly queued — "Moves a deal to another stage → Waits for the owner of the deal → Changes a number people report upward" (spec 13 §3) — and `ifApproved.action: "stage"` exists in the seed.

**`R-deal`.** Visible first: the stage stepper with probability and forecast category under it, amount, close date, next step with date, owner, last activity; Log activity, Mark won, Mark lost and archive, Delete deal with "removes 14 activities" beside it. The timeline is the page. The side panel holds cards — Next step, Contacts, Open tasks, Company summary — then doors: Custom fields (6), History (12 changes), Files (2), Company signals and news, All fields, Sync history. A pending agent proposal is a card above the contacts while it exists, driven by object state, never by a bell (spec 09 step 6). The thing never to lose sight of: what closing, losing or deleting this deal does, and what approving the agent will do.

**`D-deal-evidence`.** "Evidence and source quotes · n", in IA-MAP §2.9, journeys A3 and G5, seats AE and OPS, "evidence door only where a conversation input exists". Not in spec 09's door table.

**`D-deal-history`.** "Full history and custom fields" in the map; "History (12 changes)" in the spec, holding stage and field changes with who and when. Sibling of the evidence door, not nested.

### Issues

**G5-1 · The evidence door is in the map and not in the spec.** Spec 09 §6.3 lists eight doors; `D-deal-evidence` is not one. The map wins and the spec is amended (IA-MAP preamble).

**G5-2 · The proposal card proposes without its evidence.** Spec 09's card reads "Research agent proposes next step: 'Send security questionnaire' · Approve · Dismiss". JOURNEYS G5: "propose the change with the quote it came from", and the person's stated decision is "does the evidence support the stage it implies". The quote is a door away at best and absent at worst. A proposal and the quote it rests on are a mutually dependent pair split by a door — rule 5 — and on a stage change the evidence is decision-critical, so rule 7 as well.

**G5-3 · The card never shows the current value.** JOURNEYS G5: "compare with the current value and whether a human validated it". "Proposes next step" does not say what the next step is now. For a stage change, old and new are the whole decision.

**G5-4 · No consequence sentence for a stage change.** Spec 09 §6.6 promises "what approving an agent proposal will do (send an email, spend credits, move the stage)". "Move the stage" is a restatement, not a consequence. The journey's own note says it "moves a forecast people are paid on" — that is what the sentence has to say. Every other queued action in the product has a real consequence line; this one, the one PLAN.md calls irreversible-class, does not.

**G5-5 · The same approval exists in two places and nothing says it is one item.** Spec 13 queues stage changes; spec 09 puts a card on the deal. Neither says they are one object decided once, so a reviewer can meet it twice and count it twice, which is exactly the capacity problem rule 7's corollary is about.

**G5-6 · `X-agent-edit` again.** Same third-level problem as G2-1; "Edit then approve" on a field proposal means correcting the value before accepting it, and that must happen with the consequence sentence in view.

### Decisions

1. **Spec 09 gains the door**: "Evidence and source quotes · 3", in place in the side panel, holding each extracted value with its source quote, the conversation it came from, the date, and the state chip. Removed where no conversation input exists (rule 4). A usage item in `deal.ts`, AE 12 at Meridian.
2. **The proposal card carries the quote, at level one.** The card reads: actor; old → new ("Stage · Discovery → Proposal"); the quote in one line with speaker and date ("'We'll have the security review done by the 17th and then it's paperwork.' — Amara Okonkwo, call 12 Sep"); the state chip; then the consequence sentence; then Approve and Dismiss the same size. "Open the full evidence" links to the door. Rule 5 and rule 7.
3. **The consequence sentence is written**: "Stage becomes Proposal. Probability 25% → 50%, forecast category Pipeline → Best case. The forecast you submit on Friday moves by $24,000. Salesforce is updated. 0 credits." Rule 7 — the one thing the person is being asked to authorise is the one thing the card did not say.
4. **The state chip ships** — suggested / edited / validated — on the card, in the evidence door and on the field itself; an agent proposes against a validated field and never writes it. Same change as G3-3, one line in spec 14 and the chip in specs 09 and 11.
5. **One item, two surfaces, decided once.** Stated in both specs: the deal card and the Agents queue row are the same object; deciding in either removes it from both and writes one ledger row. Rule 7's corollary — two copies of one approval double the reviewer's load and buy nothing.
6. **`X-agent-edit` as in G2-1**, with the field editor opening in place on the card and the consequence sentence rewriting itself as the value changes.

### Score

**No.** No third level and the card is correctly driven by object state rather than a notification. But the person is asked to approve a change to a forecast without the quote, without the current value and without being told what moves. Missing step: **the consequence sentence for a stage change, and the quote beside the proposal.**

---

## What held, across all five

Worth recording, because the change list below is all failures and the group is not.

- **The queue is short on purpose, and every spec says why.** Research, scoring and saved drafts are logged with a real Undo — spec 13 §8 caught that "reversible" was a claim with no control behind it and shipped `undoable`, `undoneAt`, `undoneBy`. That is rule 7's corollary applied correctly.
- **One approval policy, one owner.** Specs 00, 01, 09, 10, 11 and 13 all read it from spec 14, and spec 10 explicitly gave up a hard-coded 5,000-recipient threshold to do it.
- **The consequence line exists and names the mailbox, the time and the price**, and Decline sits beside Approve at the same size with its own help text ("Nothing is sent. The agent is told").
- **Batches at a task boundary, never mid-task**, everywhere, with the Kuo figures cited and "Since you last looked" as the boundary the person chooses.
- **`waiting-second` stays on screen** so nobody believes a held send went out.
- **Decline rate is instrumented** (spec 13 score line 9) "because a queue nobody ever declines from is a queue nobody reads". That is the only measurement in the product aimed at rubber-stamping, and it is the right one.

Its one gap: Home is where the SDR actually decides, and Home's score line 9 counts door opens and actions but not decline or expand rate. That is change 31.

---

## Change list

| # | File | Location | Current | New | Rule |
|---|---|---|---|---|---|
| 1 | `specs/04-lists.md` | §3.1 Shown, detail; §6 Decision-critical | The auto-feed line "New matches added to Q4 enterprise outbound automatically · Turn off" is level one; no agent line exists | Add a sibling level-one line where an agent watches the list: "Research agent researches new matches · about 12 credits each · about 336 credits a week · Turn off". Add it to the Decision-critical list in §6 | 7 |
| 2 | `src/ollopa/usage/lists.ts` | new item | — | `list.agent-watch` "Standing agent watch and its weekly credit cost", critical, Fathom sdr 55 / admin 60, Meridian sdr 20, Halyard sdr 25 / admin 30, Ridgeline mk 15 | 7, 1 |
| 3 | `specs/13-agents.md` | §2 "What must be added to the seed", item 2 and the `kind` list in §2 | `kind` is researched, drafted, scored, proposed, sent, paused, capped | Add `skipped` with `skipReason: "suppressed" \| "unsubscribed" \| "region restricted" \| "do not call"`, zero credits, filterable by kind | 7 |
| 4 | `specs/03-companies.md` | new section for `R-brief` | No section; IA-MAP §6.5 lists `R-brief` as a node the specs must absorb | The brief record: actor and run time in the header, sources listed with links, the run's credit cost on the record, "Research again · 12 credits" pricing itself before the click, no doors | 7, 4 |
| 5 | `specs/01-home.md` | §3.1 "Waiting for your approval", above the "What agents did this week (n)" door | The research run appears only inside the weekly door | Add one level-one line, shown only when a research agent ran since the last visit and only for roles at 20+ on `brief.digest`: "Research agent · 12 companies overnight · 3 strongest: Northwind Analytics, Bluefin Logistics, Calder Group · 24 credits", names as links. Nothing reorders | 1, 6 |
| 6 | `IA-MAP.md` | §5, G1 row | `R-list` → `R-company` | `R-list ─RC→ R-company` | — |
| 7 | `IA-MAP.md` | §2.13, `X-agent-edit` row | type `panel`, parent "`D-agent-item` → own channel" | type `in-place edit state`, parent `D-agent-item`, level 2; not a separate channel | 2, 5 |
| 8 | `IA-MAP.md` | §5, G2 and G5 rows | `─PN→ X-agent-edit` | `(edit in place)` | 2 |
| 9 | `specs/13-agents.md` | §3 "Every door" and §6 door table, first row | "Read the draft · 142 words" | "Read the draft · 142 words · 3 inputs"; first line inside the door is "Built from: company context · research 12 Sep · template 'Founder intro'", each a link to a page, not a second door | 5 |
| 10 | `specs/13-agents.md` | §3 "The waiting item" | A reply draft shows only the draft | For reply-kind items the door shows the incoming message's first five lines with sender and time above the draft, then "Open the thread" as a link | 5 |
| 11 | `specs/01-home.md` | §2.2 `AgentEvent` field list; §3.1; §6.3 | `confidence: "low" / "medium" / "high"`; door content "Full draft, sources, confidence" | Remove `confidence`. Door content becomes "Full draft, sources, what it was built from" | 7 |
| 12 | `specs/13-agents.md` | §3 Layout, item 1 (the agent tiles) | Tile: name, on/off, runs today, credits today, what it does, what it never does, Pause | Add one line: "Last 30 days: 34 drafts · you sent 31, edited 12, declined 3" — the observed track record, per signed-in person | 7 |
| 13 | `specs/13-agents.md` | §3 States table; §3 "The waiting item" | No stale or expiring state | From day 11 the item reads "Expires in 3 days · nothing will be sent"; at day 14 it is declined and the ledger row reads "Expired unapproved 28 Sep. Nothing was sent." | 7, 4 |
| 14 | `src/ollopa/usage/agents.ts` | new item | — | `wait.expiry` "An item nearing its 14-day expiry", critical, sdr 8 / ae 4 / mkt 2 / admin 6; Halyard sdr 12 | 7 |
| 15 | `specs/01-home.md` | §6.3 door table, "What the agent found" | "What the agent found" | "Read the draft · 142 words · 3 inputs", same contents as spec 13's item door | 4 |
| 16 | `JOURNEYS.md` | G3 Steps | "re-rank the task queue and account list" | "write the new score to the record and the task and show the change in place; nothing moves" | 6 |
| 17 | `specs/07-tasks.md` | §3 Shown, Contact cell; §3 row door | No score anywhere on the page | A chip in the Contact cell where the business uses scoring: "Fit 82 ▲ from 61", text and arrow, never colour alone; the row does not move; the reason is the row door's first line, in text, never a hover | 6, 4 |
| 18 | `src/ollopa/usage/tasks.ts` | new item | — | `row.score` "Fit or intent score with its previous value", Ridgeline sdr 35 / ae 15, all others 0 | 1 |
| 19 | `specs/14-settings.md` | §3 Agents and AI, the approval rules at level one | Approval rules list send, add-to-sequence, spend over a cap, stage change | Add one line: "Agents never overwrite a field a person set or confirmed; they propose instead." | 7 |
| 20 | `specs/09-deal-record.md` and `specs/11-accounts.md` | field grid and record sections | Fields carry no provenance | A state chip on any agent-writable field: suggested / edited / validated | 7 |
| 21 | `specs/13-agents.md` | §3 "What waits, and what does not" table | No row for a routing threshold | Add a logged row: "Scoring agent: Northwind Analytics crossed the 75 routing threshold · routed to Marcus Adeyemi · 0 credits" — logged, undoable, filterable; not an exception and not an approval | 6 |
| 22 | `specs/13-agents.md` | §3 Layout, the scoring tile | Only "Agent settings" links to Settings › Agents and AI | The scoring tile carries "Scoring rules →" to Settings › Signals, scoring and personas; for seats that cannot change them, the line names the admin | 4 |
| 23 | `IA-MAP.md` | §5, G3 row | `P-agents ─DR→ D-agent-filters ─DR→ D-agent-steps` reads as nesting | `P-agents ─DR→ D-agent-filters`, back to the page, `─DR→ D-agent-steps` — siblings | 2 |
| 24 | `specs/01-home.md` §3.5, `IA-MAP.md` §1 (⌘K), `specs/13-agents.md` §3 Keyboard | the palette command | "Approve all pending agent actions · A"; "Approve all drafts to verified emails" | "Review 6 waiting · 4 emails · 8 credits", opening `X-agent-batch` focused; and "Review drafts to verified emails (4)", opening the batch filtered. No palette command ever approves | 7, S1 |
| 25 | `specs/13-agents.md` | §3 "Waiting for you", the batch line | "6 arrived while the outreach agent ran, 09:02. Together: 4 emails from your mailbox, 2 people added to sequences, 8 credits." | Append: "11 records skipped: 7 suppressed, 3 unsubscribed, 1 region restricted", the count linking to the ledger filtered to `skipped` | 7, 1 |
| 26 | `specs/13-agents.md` §3 Actions ("Select several"); `specs/01-home.md` §3.2 ("Approve all") | the bulk bar and header button | "Approve 6 · Decline 6" with the consequence on a second line; "Approve all (n) · 48 credits" | Both: "Approve 6 · send 4 emails, add 2 to sequences · 8 credits". Inactive until every item in the batch has been expanded or scrolled past once, with the reason beside it ("2 items not yet read") | 7, S1 |
| 27 | `specs/13-agents.md` | §3 "The waiting item", the over-threshold copy | "1,240 recipients. Over the 1,000 in Settings, so Daniel Okafor approves after you." | The admin's copy adds provenance: "Marcus Adeyemi approved this at 09:14 from the CLI. 1,240 recipients, over the 1,000 in Settings. 32 credits." plus the requester's reason where written | 7 |
| 28 | `specs/13-agents.md` | §3 Actions, "Select several" outcome | Per-item toasts | A result line at the top of the ledger's day group: "09:14 · you approved 6 · 4 sent, 2 held (mailbox paused) · 8 credits"; held items stay in the queue with their reason | 4, 7 |
| 29 | `specs/13-agents.md` | §3, new subsection "The same item on a screenless surface" | Absent; IA-MAP §6.5 records the obligation | The `X-approve-remote` card: actor, consequence sentence, recipients or record, credit cost, second-approval line; not summarisable, not collapsible; the same item is in the app queue and is decided once in either place; the ledger marks the surface and names the user | 7 |
| 30 | `specs/09-deal-record.md` | §3.1 side panel, §6.3 door table, §6.6, §3.2 | Proposal card: "Research agent proposes next step: 'Send security questionnaire' · Approve · Dismiss"; eight doors, no evidence door | Add the door "Evidence and source quotes · 3", in place in the side panel, removed where no conversation input exists. The card carries: actor; old → new ("Stage · Discovery → Proposal"); the quote with speaker and date; the state chip; the consequence sentence "Stage becomes Proposal. Probability 25% → 50%, forecast category Pipeline → Best case. The forecast you submit on Friday moves by $24,000. Salesforce is updated. 0 credits."; Approve and Dismiss the same size; "Open the full evidence" as a link. State in §3.2 that the card and the Agents queue row are one object decided once, writing one ledger row | 7, 5, 4 |
| 31 | `src/ollopa/usage/deal.ts`; `specs/01-home.md` §6.8 q9 | new item; the instrumentation line | No evidence-door item; Home counts `home.door.open` and `home.action` only | `deal.evidence` "Evidence and source quotes", Meridian AE 12, admin 8, Fathom admin 15, Ridgeline AE 10. Home also counts decline rate and expand rate per role and business on approval rows, as spec 13 does | 1; score q9 |
