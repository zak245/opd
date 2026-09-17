# Journey walk: the RevOps admin, O1 to O10

*Walked 15 September 2026 against RULES.md (eight rules, three named patterns, the nine-point score), PLAN.md section 2, IA-MAP.md parts 2, 3, 5 and 6, JOURNEYS.md, specs 00, 01, 13, 14, 15 and 16, USAGE-MODEL.md and `src/ollopa/usage/*.ts`. Reality check: `knowledge-base/sources/19-revops-and-developer-notes.md` sections 1 to 8. No questions; every issue carries a decision and the rule that made it.*

**Result: 57 issues, 49 changes. Seven of the ten journeys fail.** O1, O2, O4, O5, O6, O8, O9 and O10 fail; O3 and O7 pass with issues. The shape of the failure is consistent and is worth saying once at the top: **the map created nine nodes on 15 September that no spec owns.** `P-requests`, `R-request`, `X-credits`, `X-removal`, `X-viewas`, `X-user`, `X-key`, `X-mcpscope` and the whole `S-developer` area exist as rows in IA-MAP part 2 and as stops in six of these ten walks, and none of them has a features section, a usage row or a number. The admin is the seat that meets all nine. That is not a disclosure fault — nothing is buried — but it fails the third leg of the score: a step the specs forgot.

The second pattern: **memo 19 is about order and cadence, and the specs are about place.** Offboarding is an ordered sequence (19§1.8, 19§1.9) and spec 14 has a Deactivate row action. DNC is a 31-day clock (19§3.7) and spec 14 has a toggle. Error triage is "group, fix the biggest group, bulk-retry, confirm the count falls" (19§2.6) and spec 15 has a flat table with filters. Where the work is a sequence with a deadline, a row with a switch is not enough.

---

## O1 · Set the workspace up, and let it correct itself two weeks later

Fathom, once. Walk: `G-signin` ─WS→ `W-setup` ─WS→ `P-home` ─DR→ `D-home-setup` ─LK→ `W-connect` ─LK→ `S-you` ─LK→ `S-sending` ─PN→ `X-mailbox` ─LK→ `S-howteam` ─LK→ `S-team` ─PN→ `X-user`; later, the exposure.

### The stops

**`W-setup`.** Visible first: the workspace name, timezone and currency already filled in; three questions; the result block; one button. One door, "The other three profiles: Separated sales team, Agency, Product-led growth", expanded in place under the result block. Never lose sight of: what three seats cost on Starter (one total for the period, on the question that sets it), and the sentence that Settings changes all of this later. This stop is clean. Fifteen items, two decision-critical, one door, and spec 16 argues honestly that the head-body-tail band does not apply to a page used once. Nothing to fix here.

**`P-home`, first load.** Visible first: the health strip. For Fathom's founder the strip reads credits in warning plus the door "Setup steps remaining (2)", open by default the first time (spec 01 §3, states row). Doors: the setup door, Today, Replies, Approvals, Pipeline, Your week. Never lose sight of: the credit runway.

**`D-home-setup` → `W-connect`.** The door holds the steps not done, each a link into Settings or Connect, and spec 01 says it is "removed when done".

**`S-you` → `S-sending` → `X-mailbox`.** Personal settings, then the mailbox panel: warm-up, limits, signature, unlink. Flat drawer, one Save. Clean.

**`S-howteam` → `S-team` → `X-user`.** The declared sidebar, made visible and editable: profile, seats, pages left out with their signal counts, and any exposure running. Then the users table and the invite. Clean in shape.

**The exposure, two weeks later.** The Inbox appears at the end of its group on the next load of Home, stays fourteen days, then asks once. Spec 00 §3.2 and spec 16 §3 both specify it. Clean, and it is the one legitimate piece of movement in the product.

### Issues

**O1-1. Fathom's set-up list can never reach zero.** Spec 01 §5 (businesses): "'Setup steps remaining (2)' stays until the missing integrations are connected." Fathom has no CRM and never will — spec 15 §3.6 says so plainly: "Ollopa is the system of record here." So the founder carries a permanent outstanding-task counter on Home. That is precisely the Apollo failure spec 16 deleted ("the four progress rings and both completion percentages… removed"), rebuilt at two instead of twenty-four. Rule 4: a control that does not apply is removed, not left showing. **Decision:** "Ollopa is our CRM" is a declarable answer, not an absence. It is one choice on the Integrations empty state and on the setup door's CRM row; choosing it removes the CRM row from the setup list, sets the Integrations empty state to spec 15's honest sentence, and is reversible from the same place. The setup door disappears when the list empties, and at Fathom it empties.

**O1-2. The two empty-state sentences disagree.** Spec 14 §3.8 reads "No CRM connected · Connect one" — a nag. Spec 15 §3.6 reads "No CRM connected. Ollopa is holding your contacts, companies and deals. Connect one when you have one." — a state. Rule 4 (honest labels) and the product's own rule that a gap explains itself. **Decision:** spec 15's sentence wins everywhere, and after O1-1 it reads "Ollopa is your CRM. Connect Salesforce or HubSpot if that changes."

**O1-3. The map's door label has no count.** IA-MAP §2.2 lists `D-home-setup` as "Setup steps remaining". Spec 01 §6 has "Setup steps remaining (n of m)". The 14 September door-label decision requires the count in the label. **Decision:** the map takes the spec's label, and drops "of m" — "of m" is a completion percentage wearing a fraction. The label is "Not set up yet: mailbox, CRM, invites (3)", contents then count, like every other door.

**O1-4. Spec 16 and spec 00 disagree about what Founder-led leaves out, and gap 6.4a only half-resolved it.** The map decided the wider list wins — Inbox, Campaigns, Accounts, Reports — and said spec 16 is amended. It has not been. **Decision:** carried into the change list so the apply pass does it.

**O1-5. Product-led growth has two different definitions and no gap resolves them.** Spec 00 §3.2: "Sequences for the account executive." Spec 16 §3: "Sequences, Lists — admin only." Neither is wrong; they subtract for different seats. Rule 1 says the number decides. Ridgeline's shell numbers put Sequences at AE 10 and admin 5, Lists at admin 15 — all three under the twenty-point line. **Decision:** Product-led growth leaves out **Sequences for the account executive and the admin, and Lists for the admin**, which is the union of the two specs and is what the numbers say. Both specs state the same row.

### Score

**No.** No third level, nothing critical lost, but a step is missing: **declaring that Ollopa is the CRM**, without which a new Fathom workspace carries an unfinishable task list on Home forever.

---

## O2 · Provision a rep, and offboard one

Halyard, weekly. Walk: `P-settings` ─LK→ `S-team` ─PN→ `X-user` ─PN→ `X-viewas` ─LK→ `S-sending` ─PN→ `X-mailbox`; offboarding: `X-user` (reassign first) ─LK→ `R-integration` ─LK→ `S-plan`.

### The stops

**`S-team`.** Visible first for Halyard's ops lead: the users table at level one (30 weekly), with credit limit editable in the row, used this month, last active, status. One door: "Teams, permission profiles, MFA, single sign-on, IP allowlist, password policy, session timeout (7)". Never lose sight of: that a seat and a profile are two different grants, and that deactivating changes access today and the bill at renewal.

**`X-user`.** The map says a panel carrying seat, profile, team, territory and credit limit. Spec 14 says the opposite — §8 review: "A users page with a per-user drawer would be three from Settings… Credit limit and deactivate became row-level; the page has no drawer."

**`X-viewas`.** The map hangs it off `S-team` at level 2, and the walk opens it from inside `X-user`.

**`S-sending` → `X-mailbox`.** Link the new person's mailbox. Clean.

### Issues

**O2-1. `X-viewas` opens from inside `X-user`: a level-2 node inside a level-2 node.** IA-MAP convention 2 forbids it in one sentence, and the level check in part 4 claims the deepest path everywhere is 2. The O2 and O5 walks break it. **Decision:** View as is not a panel. It is a **mode on the page**: chosen from a users-table row action or from the `S-team` heading, it replaces the page with the teammate's own view under a persistent banner — "Viewing as Marcus Adeyemi (SDR, Northwind team) · Exit". You do not read a panel about what someone else sees; you see it. That removes the nesting, matches how the feature is actually used, and keeps the banner (safety state: you are acting as someone else) at level one. Both walks become `S-team ─PN→ X-user` and, separately, `S-team ─(mode)→ X-viewas`.

**O2-2. Spec 14 removed `X-user` for a level reason that the map's own convention says is wrong.** Settings → the users **table page** is navigation, and navigation costs no level (IA-MAP convention 1); a panel on that page is level 2 there, not level 3 from Settings. Spec 14's review miscounted. But spec 14 is right on the merits for the daily fields: credit limit and status belong in the row so a weekly user never opens anything. **Decision:** both. Credit limit, status and last active stay editable in the row; `X-user` exists on the users table page as the panel for the fields that are set once — seat, permission profile, team, territory — and for the ordered offboarding flow in O2-3. Spec 14 §8's "three from Settings" line is corrected to name the convention.

**O2-3. Offboarding is an ordered sequence in reality and a single row action in the spec.** Memo 19§1.8: freeze → transfer → deactivate, and "Freezing user accounts doesn't make their user licenses available"; mass transfer runs "up to 250 records at a time". Memo 19§1.9: ownership propagation moves **open** tasks only — "Failed or paused tasks will not change ownership" — and "Activities associated with locked users will still sync into the CRM as long as the user mapping is valid", fixed by unmapping them. The journey names the same order and says **reassign first**. Spec 14 §3.4 offers "row actions Edit profile and Deactivate" and nothing else. Rule 7: what a destructive action does is never behind a door, and here it is not even written. **Decision:** Deactivate opens an ordered flow in `X-user`, four blocks on one panel, each with its count and its consequence in text, none of them optional to read:
1. "Reassign 412 records, 9 deals, 3 sequences and 21 open tasks to — ". One line: "Paused and failed tasks do not move; they stay with this person and stop."  Above 250 records the flow states it runs in passes and shows the pass count.
2. "Unlink 2 mailboxes." One line: what happens to in-flight sequence steps.
3. "Unmap from Salesforce." One line: "Until this is done, this person's activity keeps syncing to Salesforce."
4. "Deactivate." One line: "Access ends now. The seat is free to reassign. **Your bill does not change until renewal on 15 January 2027.**"
Step 4 is disabled-by-absence until 1 to 3 are done or explicitly skipped with a reason — not greyed, but not offered: the button reads "Reassign first" and names what is outstanding.

**O2-4. The billing consequence of deactivation is stated nowhere, and it is a price fact.** Memo 19§1.8 and the Salesloft note in 19§1.10: "deactivating a user mid-term typically does not reduce the billed seat count until renewal." The journey ends "then separately reduce the subscription." Rule 7 covers price and commitment. **Decision:** the line in O2-3 step 4, plus a link "Reduce seats at renewal" into `S-plan`. Nothing is auto-reduced.

**O2-5. Seat and permission are one thing in the spec and two in reality.** Memo 19§1.7, verbatim: "Features that require seats won't be available until seats are assigned." The journey's second step is "confirm the seat carries the features, since a profile without a seat grants nothing." Spec 14 has permission profiles and no statement of the relationship. Silent gap. **Decision:** `X-user` shows seat and profile as two rows with one line between them: "The seat decides which areas exist for this person. The profile decides what they may do inside them. A profile cannot grant an area the seat does not carry." The same sentence is the one spec 00 §3.2 already uses for the sidebar, so there is one explanation, not two.

**O2-6. Two permission rules from the source are missing and both are consequences.** Memo 19§1.4: "Assigning a permission set will **override** an individual's permissions" and "Users with add and edit users permissions can only assign permission sets that include permissions that they themselves have." Rule 7. **Decision:** the first is a consequence line under the profile row in `X-user` ("This replaces anything set on this person directly"); the second governs the picker — profiles the admin does not hold are absent, not greyed, with one line naming why and who can (rule 4, remove don't disable; the product's gaps-explain-themselves rule).

**O2-7. No usage item exists for View as.** **Decision:** `team.viewas`, Team and access, admin 6, Halyard 20, Fathom 1, Ridgeline 4. Behind the Team door everywhere except Halyard, where 20 puts it at level one — which is right, because Halyard checks a new person's view every week.

### Score

**No.** Two missing steps, both named in the journey and both in the source: **reassignment before deactivation** (with the open-tasks-only and 250-a-pass facts), and **unmapping from the CRM**. Plus one level violation, now fixed.

---

## O3 · Connect the CRM and configure the sync

Meridian, once then monthly. Walk: `P-settings` ─LK→ `S-integrations` ─LK→ `W-connect` ─WS→ six steps ─LK→ `R-integration`.

### The stops

**`S-integrations`.** Visible first for Meridian's admin: the Salesforce row with its error count at level one (40 and 30 weekly). One door: "Field mapping, calendar, Slack, enrichment provider, API keys, webhooks (6)". Never lose sight of: whether the sync is running and how many records failed today.

**`W-connect`, steps 1 to 6.** One screen per step, the step list in text beside it, the constant line "Nothing syncs until you press Start syncing on the last step", buttons named for where they go. Doors: "Which activities to push (emails, calls, tasks, meetings)" under the Activities row on step 3; "Show 42 unmapped Salesforce fields" at the foot of each mapping tab on step 4; the condition builder under its radio on step 5 (object state, not a door). Never lose sight of: what the first sync will pull, push, delete and merge — stated as a count on step 6 before the button.

This is the best-specified surface in the group. Spec 15 removed the six-hour timer, moved the error fix out of hover, put the write rule in the row of the pair it governs, and put deletion, merge and matching in one group. The three issues below are omissions, not structural faults.

### Issues

**O3-1. The integration user's prerequisites are discovered by failing.** Memo 19§2.1: the sync user needs create/read/edit on Accounts, Contacts, Leads, Opportunities and User Roles and "**API Enabled** option enabled under System Permissions"; Salesforce Essentials "does not support REST API access, even with an add-on." Spec 15 step 2 offers the button and an "Authorisation failed" state that shows the provider's message afterwards. Nielsen's rule-7 list is "price, **requirements**, risks, privacy terms". **Decision:** step 2 states the requirement above the button, in four lines, before the consent screen: the five objects, API Enabled, that the user should be a shared account that stays active (already there), and that Essentials cannot connect. A requirement that decides whether the next twenty minutes are wasted is decision-critical.

**O3-2. Editing a mapping on the integration page can stop records syncing, and nothing says so.** Memo 19§2.4, verbatim: "Outreach does not recommend adding/removing advanced mappings to/from existing field mappings, as this could cause records of that object type to **stop syncing**." Spec 15 §3.2 makes Field mapping an editable door with a Save and a summary line about which records it applies to — which covers 19§2.3 but not this. Rule 7: what a destructive action does. **Decision:** removing or retyping an existing pair, as opposed to adding one, raises a consequence line at the pair, before Save: "Removing this pair can stop Contacts syncing until the next full pull. Run a full pull after saving?" with the full pull offered in the same place.

**O3-3. Pre-mapped standard fields are a system guess presented as a finished decision.** The journey's approval note: "Mapping suggestions are accepted individually; no sync starts until the admin confirms." Spec 15 §3.1 step 4: "Standard fields are pre-mapped." Rule 6 allows the system to propose; it does not allow the system to look as though a human decided. The map already carries the right vocabulary for this on `D-deal-evidence` — suggested, edited, validated, never silently overwritten. **Decision:** pre-mapped rows carry a **suggested** mark and a count in the tab label ("Contacts · 14 mapped, 9 suggested, 1 required unmapped"). Saving the step confirms all of them at once and says so; editing one moves it to **edited**. No per-row click is required — the review capacity corollary to rule 7 says a queue of 14 confirmations is a rubber stamp — but nothing is recorded as a human decision that a human did not make.

### Score

**Yes.** Two levels throughout, the consequence statement is on the last step before the button, the wizard resumes, and no step in the journey is missing a node. The three issues are content, not structure.

---

## O4 · Clear the sync errors, and the data rules that caused them

Meridian, weekly. Walk: `P-home` ─LK→ `R-integration` ─PN→ `X-errors` ─LK→ `R-company` ─DR→ `D-co-crm` ─LK→ `P-people` ─DR→ `D-people-columns` ─PN→ `X-enrich` ─LK→ `R-job` ─LK→ `P-reports` ─PN→ `X-export`.

### The stops

**`P-home` health strip.** Visible first: "sync 3 errors" as a link. Correct — safety state at level one, no click.

**`R-integration` → `X-errors`.** Visible first: the status strip, then the error table at level one because errors are above zero. Message and suggested fix printed in the row. Never lose sight of: how many failed and whether the count is falling.

**`P-people` → `X-enrich` → `R-job`.** The hygiene half: find the stale records, queue them, watch the job, read the credits.

**`P-reports` → `X-export`.** Record the numbers.

### Issues

**O4-1. The map says the errors are grouped by cause; the spec ships a flat table with filters.** IA-MAP §2.15 names the node "Sync errors grouped by cause · n". Spec 15 §3.2 specifies a flat table sorted by time with "Show filters (object, direction, date range)". The journey's first step is "Group errors by type — duplicates, permissions, picklists, mappings, bad values, validation failures; fix the biggest group; bulk-retry it; confirm the count falls." Memo 19§2.6 gives nine named types. A filter makes the admin construct the grouping by hand every week, which is rule 1 read backwards: the weekly task is behind an interaction and the rare one (finding a single record) is in front of it. **Decision:** `X-errors` opens grouped by cause, largest group first, each group a row with its count, its one-line cause and "Retry these n". A group expands in place to the records — that is the panel's one level, so nothing goes to three. The date and object filters stay as a control on the panel, not as the primary structure. The nine causes are the group names.

**O4-2. "Retry all" is a bulk action with no stated scope.** Memo 19§2.6: "it is possible to bulk resync 100 Salesforce errors at a time." Spec 15 already requires a count before Apply mapping, Pull now and Push now, and leaves Retry all out of that list. Rule 7 and the review-capacity corollary. **Decision:** every retry states its count and its batching: "Retry 340 duplicate errors · 100 at a time, about 4 passes." The count-falls confirmation is the group count after the run.

**O4-3. A sync error is an un-mutable interruption, ten times over at Halyard.** Spec 00 §3.4 classes sync error as **interrupting** — a `role="alert"` toast that stays until dismissed, a push, an email at once — and says "a person can mute a digestible kind, never an interrupting one, because those are safety state." Memo 19§2.6 says the notification frequency is configurable Instantly / Daily / Weekly and "**that setting is the review cadence**"; 19§2.5 adds that the underlying logs are "regenerated hourly" and "not generated in real time", so an instant alert is a fiction. Halyard's admin runs ten client workspaces. Rule 7's corollary: disclosure that exceeds review capacity is equivalent to hiding — the alert that arrives ten times a day is dismissed, and the one that mattered goes with it. **Decision:** sync errors move from **interrupting to digestible**, with a frequency choice on the integration (instantly, daily, weekly; default daily) that is explicitly the review cadence. Nothing is lost from rule 7: the count stays at level one on Home's health strip and on the Settings integration row, both without a click. Bounce guard tripped and credits low stay interrupting, because both mean something is sending or spending right now. Spec 00's classification table and the "never mute an interrupting kind" sentence are amended to name which three kinds are interrupting and why.

**O4-4. The five-field audit is the journey's second half and has no home.** Memo 19§3.6, verbatim: "check these five CRM fields first: **email, phone, job title, company name, and last enrichment date**. Flag records where more than two fields are missing or older than 12 months." The map routes the admin to `D-people-columns` ("Columns and density") and then `X-enrich`, which means rebuilding the filter every month. Rule 1: a monthly routine for the seat that owns data quality is not a thing to reconstruct. **Decision:** People ships a default saved view, "Needs enrichment · 2+ of 5 fields missing or older than 12 months", with its count in the view list, selectable in one click and feeding `X-enrich` and `W-import` directly. It is a shipped view, not an adaptive one — it is the same view for everyone, driven by object state, so rule 6 is untouched.

**O4-5. The journey's last step records three numbers against targets, and none of them exists.** Memo 19§3.6 gives the KPI table: duplication under 3%, field completeness over 85%, email bounce under 2%. Bounce already follows the PLAN.md pattern — one owned pair, every page shows the observed rate beside it. The other two have no observed rate anywhere. **Decision:** copy the bounce-guard pattern rather than build a dashboard. The duplicate-handling row in `S-prospecting` shows the observed duplication rate beside the rule that produces it; the completeness figure is the saved view's count over the table's count, shown on the view. No new page, no new tile, and each number sits beside the control that changes it (rule 5).

**O4-6. `D-people-columns` has no count.** 14 September door-label decision. **Decision:** "Columns and density · 12 of 31 columns".

**O4-7. The walk reads as a panel opened from inside a door.** `D-people-columns ─PN→ X-enrich` implies nesting that is not intended. The map already has the return marker `─RT→` (S4, S10). **Decision:** the walk reads `D-people-columns ─RT→ P-people ─PN→ X-enrich`. Notation only, but the level check in part 4 is only true if the walks are written so.

### Score

**No.** Two missing steps: **the grouped triage** the journey opens with, and **the five-field audit view** it closes with. Both are named in memo 19 and neither has a control.

---

## O5 · Set permissions and territories, and answer an upgrade request

Meridian, monthly. Walk: `P-settings` ─LK→ `S-team` ─PN→ `X-user` ─PN→ `X-viewas` ─XL→ `G-noaccess` ─PN→ `X-territory` ─LK→ `P-requests` ─RC→ `R-request`.

### The stops

**`S-team` → `X-user`.** As O2. **`X-viewas` → `G-noaccess`.** The admin confirms the gap explains itself: the no-access page names the seats that hold the area and the admin to ask (spec 00 §3.2). This is a good stop — the product checking its own promise — and it works.

**`X-territory`.** Filters and owners, Growth-gated, reached from `S-team` and `S-prospecting`.

**`P-requests` → `R-request`.** The queue. Nothing specifies it.

### Issues

**O5-1. The level violation from O2-1 recurs**, and the walk then opens `X-territory` from `G-noaccess`, which is not a route that exists. **Decision:** the O5 walk becomes `P-settings ─LK→ S-team ─PN→ X-user ─RT→ S-team ─(mode)→ X-viewas ─XL→ G-noaccess ─RT→ S-prospecting ─PN→ X-territory ─LK→ P-requests ─RC→ R-request`.

**O5-2. The journey's first instruction has no control.** "Prefer a small additive grant over a profile per person." Memo 19§1.2, verbatim: "Create permission sets to grant access for a specific job or task, regardless of the primary job function or title" and "If a permission isn't enabled in a profile but is enabled in a permission set, users with that profile and permission set have the permission." Spec 14 offers one row, "Permission profiles", and the only way to give one person one extra thing is a profile of their own — which is how a hundred-profile org happens (HubSpot caps it at 100, 19§1.4). **Decision:** `X-user` carries a **profile** row and an **additional grants** row underneath it, the second listing named grants as chips with an add control, and one line between them: "Grants add to the profile. Prefer a grant to a new profile." Two rows, both level one in the panel, adjacent, because they are read together (rule 5). No new page.

**O5-3. `X-territory` has two parents and one spec entry.** IA-MAP §2.14 gives it `S-team` and `S-prospecting`; spec 14 has `pros.territories` under Prospecting rules only. Territories are assigned per person (Team) and defined per filter (Prospecting), which is exactly the two-parents-one-node case the map already accepts for `X-calllog`. **Decision:** one node, two openings, stated in spec 14: the definition lives in Prospecting rules, the assignment is a row in `X-user`, and both open the same panel. The usage number stays where it is.

**O5-4. The upgrade request has two homes and no owner.** Spec 14 puts `plan.upgrade-requests` in the Plan area and in the admin strip, critical. The map puts upgrade requests in `P-requests` — "both intake requests and upgrade requests, one queue, two kinds" — and makes `X-upgrade`'s non-admin button write one. Two queues is a split, and a split queue is how an approval is missed. **Decision:** one queue, `P-requests`. The Settings strip keeps the **line, the count and the cost** and is a link into it — that satisfies rule 7 (visible without a click) without duplicating the decision surface. Spec 14 §3.4's "Plan · Review an upgrade request" action moves to the requests spec and Settings links out.

**O5-5. `P-requests` is not in Fathom's sidebar and Fathom has the most requests.** IA-MAP §2.11 gives `P-requests` to SEP, AG and PLG, leaving out Founder-led. But `settings.ts` puts `plan.upgrade-requests` highest at Fathom (admin 12 against a 6 baseline) and spec 14 §3.12 shows Fathom with two waiting. Starter locks the most, so Starter generates the most asks. **Decision:** the profile rule stands — Founder-led leaves `P-requests` out — and the standard left-out-page answer does the work: the page opens from the strip line and from ⌘K, its header offers "Add to sidebar", and the named signal that triggers a two-week exposure is **the second upgrade request in a week**. No special case, and the declared-sidebar pattern is applied rather than bent.

**O5-6. `P-requests` and `R-request` have no spec, no features section and no usage numbers.** They are stops in O5, O9 and O10. **Decision:** a new spec, `specs/17-requests.md`, built from the record template, owning both kinds. Detailed in O9.

### Score

**No.** Missing step: **the additive grant**, which is the journey's stated first preference and the source's central practice; plus the queue the journey ends in has no specification.

---

## O6 · Manage credits: caps, burn and attribution

Halyard, weekly, across ten workspaces. Walk: credits pill ─PN→ `X-credits` ─LK→ `S-plan` ─LK→ `S-agents` ─LK→ `S-team` ─PN→ `X-user` ─LK→ `S-developer` ─PN→ `X-mcpscope` ─LK→ `R-job`.

### The stops

**The credits pill.** Visible on every page, in text, both numbers, never an icon. Correct and decision-critical.

**`X-credits`.** The map: "Credit breakdown by feature, person and surface", surfaces being app, automation, API, MCP, CLI and agents. No spec, no items.

**`S-plan`.** Price, renewal, seats, invoices, cancel, delete, export. Good.

**`S-agents`.** Agents on or off, what they may do without approval (critical), credit caps (critical), the second-approval threshold (critical). Good — three of the four are critical and at level one, which is right.

**`S-team` → `X-user`.** The per-person limit, editable in the users row.

**`S-developer` → `X-mcpscope`.** No spec, no items, no area in `settings.ts`.

**`R-job`.** The job that burned it.

### Issues

**O6-1. The credits pill and the map disagree about where the pill goes.** Spec 00 §3.2: the pill "links to Settings › Plan, billing and usage › Credit balance and burn rate". IA-MAP §1: it "links to the credit breakdown by feature, person and surface", i.e. `X-credits`, and the level check note 4 explains why — a credits door inside a billing door would be three, so the panel gets its own channel. The trigger for this journey is a burn spike; navigating away from the work to read it costs the work. **Decision:** the map wins. The pill opens `X-credits` over the current page, and the panel carries one link into `S-plan` for the things that change the plan. Spec 00 is amended.

**O6-2. `X-credits` has no content and no usage row.** It is the panel the whole journey hangs on. **Decision:** one new item, `plan.credit-breakdown`, "Credit spend by feature, person and surface", admin 30, Fathom 45, Halyard 40, Ridgeline 20, SDR 8. Its content is fixed by the journey and by memo 19§6.5: three tabs is wrong (tabs hide what must be compared) — it is one flat panel with three stacked breakdowns, **by feature, by person, by surface**, each a short ranked list with the top five and a "show the rest" that is the panel's one level. Surfaces are named exactly as the map names them: app, automation, API, MCP, CLI, agents. Each row links to the job, person or key behind it.

**O6-3. Three of the journey's controls do not exist, and all three shipped in the real product in 2026.** Memo 19§6.5, from the Clay changelog: "**Credit Budgets** — set and manage credit allocations to keep workspace spend under control" (Aug 2026); "**Credit Spike Alerts** — Catch unusual credit spend early with automatic alerts" (Aug 2026); "Credit Usage Dashboard: **MCP usage broken down by user**" (Jun 2026). The journey asks for a team budget, a spike alert and per-surface attribution. Spec 14 has a per-agent cap and a per-person limit and nothing else. **Decision:** two new items and one addition.
- `plan.team-budget`, "Team credit budget", admin 12, Halyard 20, Fathom 15, Ridgeline 6. Behind the Plan door except at Halyard.
- `plan.spike-alert`, "Credit spike alert: warn at n times the usual daily burn", admin 10, Fathom 20, Halyard 15, **critical**. It is the same object as bounce guard — a threshold that changes what the product does — and PLAN.md's bounce-guard decision puts that pair at level one with the observed value beside it. This one reads "Alert at 3× · today 1.1× · nothing alerted."
- The per-surface split is `plan.credit-breakdown` above, and MCP per user is one of its rows.

**O6-4. `S-developer` is a settings area in the map with no items anywhere.** IA-MAP §2.14 lists thirteen settings areas; `settings.ts` has eleven and no developer area. `int.api-keys` (6) and `int.webhooks` (4) currently live under Integrations. O6 and O8 both walk `S-developer`. **Decision:** create the area and move two items into it, so nothing is invented that the journeys do not need:
- `dev.api-keys`, "API keys: scope, last used, spend", admin 6, Fathom 1 (moved from Integrations, gaining the three attributes the map's `X-key` names). Growth.
- `dev.webhooks`, "Webhooks: events, delivery log, reconcile", admin 4, Fathom 1 (moved). Growth.
- `dev.mcp`, "MCP connection and scope: read, safe writes, destructive writes", admin 12, **Fathom 25**, Halyard 8, Ridgeline 6. Read on every plan, writes Growth — gap 6.4f already decided that and nothing carries it.
- `dev.cli`, "CLI device authorisations", admin 5, Halyard 20, Fathom 8.
- One personal row in **You**, `me.mcp-token`, "Your MCP and CLI connections", admin 6, SDR 5, Fathom sdr 20 — because `X-mcpscope` and `X-cliauth` both hang off `S-you` as well as `S-developer` in the map, and a personal token is a personal setting.
The area sits after Integrations and before Plan. Its door label is its contents and count, like every other area.

**O6-5. The plan table does not mention MCP or the CLI, and it is the table every spec renders.** Spec 14 §2.3 has "API and webhooks: no / yes / yes". Gap 6.4f decided MCP read is on every plan. **Decision:** the row becomes "API, webhooks, CLI: no / yes / yes" and a new row, "MCP: read only / read and write / read and write", so Fathom's founder can see at a glance that the thing she uses daily is included.

**O6-6. The plan table says Reports "all four" and Reports has five tabs.** IA-MAP §2.12: Activity, Pipeline, Sequences, Campaign results, Forecast. **Decision:** "Activity only / all five / all five, plus CSV export and the scheduled weekly email."

**O6-7. The agency reviews ten workspaces and the walk reviews one.** Gap 6.4i decided there is no cross-workspace roll-up and the CLI is the answer. That decision stands, but nothing on `X-credits` says so, so the ops lead's tenth visit looks like a product that forgot about them. **Decision:** the panel's footer carries one line naming the route — "Credits are per workspace. `ollopa credits --all-workspaces` reports across all ten." Naming an accelerator where the scaffold runs out is rule 8; it is a statement of fact, not a hint.

### Score

**No.** Three missing steps, all in the journey's own text and all in memo 19§6.5: **the team budget, the spike alert, and per-surface attribution**. Plus the settings area the walk passes through does not exist in the usage model.

---

## O7 · Set the sending rules once, for everyone

Halyard, weekly per client. Walk: `P-settings` ─LK→ `S-workspace` ─LK→ `S-sending` ─PN→ `X-domain` ─PN→ `X-mailbox` ─LK→ `S-sequences`.

### The stops

**`S-workspace`.** For Halyard's admin: name, timezone and currency at level one (40, 35, 25 weekly — a new client workspace is a monthly job and the numbers say so), with a door for logo and language. Correct application of rule 1 across businesses: the same page, a different head.

**`S-sending`.** Visible first: mailboxes with warm-up and limits editable in the row (70, 55, 50), sending domains (45), bounce guard as one row carrying both thresholds, the observed rate and the paused count. One door: "Tracking subdomain, catch-all blocking, unsubscribe text, open and click tracking (4)". Never lose sight of: the bounce rate against the pair that pauses sending. This is the cleanest rule-5 and rule-7 work in the group — the threshold, the observed value and the consequence are one row, and the unsubscribe text sits beside the permission to disable it.

**`X-domain` / `X-mailbox`.** Flat drawers, SPF/DKIM/DMARC with copy buttons, warm-up, limits, signature, unlink.

**`S-sequences`.** Schedules, rulesets, priority.

### Issues

**O7-1. The minimum delay between sends is in the journey and in no spec.** The journey: "per-mailbox daily and hourly limits **and the minimum delay**". Spec 14 has `mail.limits` covering daily and hourly. The delay is the third number in the same decision and separating it would split a dependent set. **Decision:** `mail.limits` becomes "Daily, hourly and minimum delay between sends", one row, one label, three fields. No new item; the label and the row change.

**O7-2. Nothing tells the reps.** The journey's last step is "tell the reps". Memo 19§8.4 makes this the central warning, verbatim: "The sandbox rehearses the system; nothing rehearses the reps", with the corollary "Deliver the new process to reps in the flow of work from day one." O9 has the same step. Ollopa has no mechanism at all. **Decision:** one mechanism, shared with O9 and specified there — a workspace change that other people feel writes one line into those people's Home health strip and their digest, naming the change, who made it and when. Recorded here as the same change; O7 is not failed on it because the numbers this journey sets are already readable where they bite: PLAN.md's bounce-guard decision puts the observed rate beside the threshold on every page that sends, so a rep whose sequence pauses reads why on the sequence.

**O7-3. Halyard's admin head is 29%, four points over the band.** Spec 14 §4 already computes this and names it as the stretch case. It is the right call and it is the same judgement the owner accepted on S1 for the SDR's Tasks page: density wins for all-day seats, and Settings is 95% weekly for Halyard's ops lead. No change. Recorded so the next reviewer does not re-open it.

### Score

**Yes.** Two levels, every threshold at level one with its observed value, every dependent pair adjacent, and the journey reaches the end. The one missing mechanism is carried by O9.

---

## O8 · Keep the workspace compliant

Meridian, monthly. Walk: `P-settings` ─LK→ `S-prospecting` ─PN→ `X-removal` ─LK→ `P-people` ─DR→ `D-people-filters` ─LK→ `S-developer` ─PN→ `X-key` ─LK→ `S-agents`.

### The stops

**`S-prospecting`.** Visible first for Meridian's admin: nothing. Every one of the six items is under twenty, so the area is a heading and one door — "GDPR by region, do-not-call, primary email type, duplicate handling, in-progress limit, territories (6)". Never lose sight of: whether the do-not-call list is current, because a stale one makes every call this month unlawful.

**`X-removal`.** The map has it: "Removal list: review, export, delete everywhere", touching person, list, enrichment job, integration, key and agent. Spec 14 §6.7 deleted it: "Removal requests as a page (a line under GDPR restrictions)" is in the removed-rather-than-hidden list.

**`P-people` → `D-people-filters`** and **`S-developer` → `X-key`** and **`S-agents`**: the journey's confirmation sweep — nothing on the removal list feeds a sequence, an enrichment run, a key or an agent.

### Issues

**O8-1. The do-not-call list is a 31-day clock presented as a switch.** Memo 19§3.7, verbatim from the FTC: "you must synchronize your lists with an updated version of the registry **at least every 31 days**", and safe harbour requires the seller "accesses the national registry no more than 31 days before calling any consumer, **and maintains records documenting this process**", with 24-month recordkeeping. Spec 14 has `pros.dnc`, "Do-not-call screening", weekly 3, behind the Prospecting door, no date, no state, not critical. Rule 7 names safety state explicitly, and a screening list 32 days old is not a preference. **Decision:** `pros.dnc` becomes **critical** and its label carries the state: "Do-not-call screening · synchronised 2 September · next due 3 October". Critical means level one whatever the number, so it leaves the door and sits under the heading, with a warning state past 31 days and the same treatment on Home's health strip that bounce guard gets. The row also carries the review log — who synchronised, when, and the export — because the regulation requires the record and 19§3.7 says so.

**O8-2. `X-removal` exists in the map and was deleted by spec 14.** The map wins on node existence by its own rule, and the journey cannot be walked without it: "review and export the rolling removal list; delete matching records here, in the CRM and from any job that would re-import them." **Decision:** one new item, `pros.removal-list`, "Removal list: review, export, and delete everywhere", admin 5, Meridian 5, Halyard 3, Fathom 1, Ridgeline 2. Behind the Prospecting door; not critical, because the list itself is a record rather than a live threshold — but the **delete-everywhere** action inside it carries its consequence at level one in the panel: "Deletes 214 people here, unlinks them in Salesforce, removes them from 3 lists and 2 sequences, and stops 1 enrichment job from re-importing them. This cannot be undone." Spec 14 §6.7's removal line comes out of the removed list.

**O8-3. The confirmation sweep is four separate visits and should be one answer.** The journey: "confirm nothing on it feeds a sequence, an enrichment run, a key or an agent." Walking to People, to `X-key` and to `S-agents` to check three things about one list is rule 5 read backwards — the dependent facts are on the far side of three navigations. **Decision:** `X-removal` answers it in place, as four lines with counts and links: sequences 0, enrichment jobs 1 (link), API keys with prospecting scope 2 (link), agents 3 (link). The admin still goes to each to act; they do not go to each to find out.

**O8-4. GDPR restrictions are silent where they bite.** The journey's approval note: "Agents inherit the restrictions and may never act on a restricted record; **the restriction is stated on the item, not silently filtered**." Nothing in any spec says this. A silently shortened count is the worst version of a gap that does not explain itself, and it is the product's own declared rule. **Decision:** a restricted person appears in tables and records with the action replaced by one line — "Restricted: EU region rule · Prospecting rules" — never removed from the count and never a blank. Agents log the same line as a skipped step in `D-agent-steps`. Stated in spec 14 under `pros.gdpr` as the rule the other specs read.

**O8-5. `X-key` has no scope, no spend and no last-used.** The map names all three; `int.api-keys` is a bare row. O8 needs scope (does this key reach restricted records) and O6 needs spend. **Decision:** covered by `dev.api-keys` in O6-4; recorded here as the second journey that needs it.

**O8-6. "Record the review" has no artefact.** The journey's last step, and 19§3.7 requires it for safe harbour. **Decision:** the review log in O8-1, one table inside `X-removal` and the DNC row: date, who, what was synchronised or deleted, count, export link. 24-month retention stated.

### Score

**No.** Three missing steps: **the removal list** the journey reviews, **the currency of the do-not-call list** it must prove, and **the record of the review** the regulation requires.

---

## O9 · Take in a change request, make the change, check it landed

Meridian, monthly, four teams asking at once. Walk: `P-requests` ─RC→ `R-request` ─LK→ `S-pipeline` ─PN→ `X-field` ─LK→ `P-workflows` ─RC→ `R-workflow` ─DR→ `D-wf-runs` ─PN→ `X-task` ─LK→ `R-request`.

### The stops

**`P-requests` → `R-request`.** Nothing. There is no spec. IA-MAP §2.11 gives `R-request` the objects request, field, stage, workflow, profile and user, and that is the whole of what exists.

**`S-pipeline` → `X-field`.** "Field or stage: type, values, required-at-stage, CRM mapping." Specified in spec 14 as a drawer off the Pipeline door; the mapping half is real. Good.

**`P-workflows` → `R-workflow` → `D-wf-runs`.** Growth-gated, out of this group's specs but in the walk.

**`X-task`, then back to `R-request`.** The follow-up and the close.

### Issues

**O9-1. `D-wf-runs ─PN→ X-task` is a panel opened from inside a door.** Convention 2 again. **Decision:** the run rows in `D-wf-runs` are links, as the map already requires of grouped rows elsewhere ("a grouped row navigates to its page filtered rather than expanding"); `X-task` opens from the run's own row on `R-workflow`, not from inside the door. The walk reads `D-wf-runs ─RT→ R-workflow ─PN→ X-task`.

**O9-2. The request record is missing every field that makes it an intake process.** Memo 19§8.2 gives the artefact verbatim: "the request, reason, affected setup, approved baseline, impact estimate, **decision owner**, decision date, implementation evidence and final test result", with two named practices — "**Capture the request before estimating it**" and "**Separate approval to investigate from approval to implement**" — and "Identify stakeholders by the decision they own." The journey repeats all of it. The map's field list has none of it. **Decision:** `specs/17-requests.md`, one new spec, built from the record template. `R-request` at level one carries: what the person wants to be able to do afterwards; the reason; who asked and when; the decision owner; the state (captured → investigating → approved → shipped → verified); the two approvals as two separate, separately-dated actions; what it touches (fields, stages, workflows, profiles, and the people who will see the change, with a count); and the rollback path in words. Doors: the discussion, and the implementation evidence with the test result. Two levels, one tab at most.

**O9-3. Two approvals, and neither has a consequence line.** PLAN.md's approval decision — approvals at task boundaries with the consequence stated on each item — was written for agents and applies here verbatim: the admin approving a change is making a decision about what other people see. **Decision:** "Approve to implement" carries its consequence in the label and the confirmation: "Approve · adds a required field at Proposal · 34 people see a new required field · rollback: remove the field, values kept 30 days." "Approve to investigate" carries no consequence because it changes nothing, and saying so is the point of separating them.

**O9-4. "Build and test somewhere safe" has no node and cannot have one.** Memo 19§8.3 is about sandboxes; Ollopa has none and a sandbox is a product, not a screen. This is the same shape as the four boundary decisions already recorded in IA-MAP part 5. **Decision:** recorded as a fifth boundary decision, with the substitute named rather than left blank: Ollopa's answer is **staged rollout**, not a sandbox. `R-request` carries an "applies to" scope — one team, one territory, or everyone — and the change is applied at that scope first and widened from the same row. Memo 19§8.3's own deploy guidance says the same thing: "deploy in smaller, safer batches rather than all at once." The map records the loss (no sandbox, no change set, no diff) as a known reduction, like the call library.

**O9-5. "Tell the affected people in the flow of their work" has no mechanism.** Memo 19§8.4: "The sandbox rehearses the system; nothing rehearses the reps"; "Deliver the new process to reps in the flow of work from day one"; "**Measure adherence as the success metric.**" Also O7's last step. **Decision:** one mechanism for the product. A workspace change that other people feel — a required field, a stage, a sending limit, a bounce threshold, a routing rule — writes one line into the affected people's Home health strip and their next digest: what changed, who changed it, when, and a link to the thing. It is not a tour, not a tooltip and not a modal; it is a fact in the place they already read facts, which is what "in the flow of work" means and what sweep 09 says actually teaches. It expires after seven days or on first contact with the changed thing, whichever is sooner.

**O9-6. "Watch whether they do it differently" has no reading.** 19§8.4: "**Attendance tells you who joined the training. It does not tell you who can complete the work when the instructor leaves**", and the adoption target found in the research is a behaviour count, not a completion tick. **Decision:** `R-request`'s verify state shows one number against the change: how many of the affected people have used the changed thing since it shipped, as a count over the affected count. That is the implementation evidence and the final test result 19§8.2 asks for, and it is the only honest close for the state machine. No new page.

**O9-7. Routing exceptions and intake requests are correctly separated and it is not written down anywhere the specs can read.** Gap 6.4c decided it; no spec carries it. **Decision:** spec 17 states it in one line — exceptions are about records and stay on Workflows where the rule is one click away; requests are about the workspace.

### Score

**No.** The journey has no spec at all. Named missing steps: **the decision owner, the two separate approvals, the rollback path, the staged rollout, the announcement, and the adoption reading** — six of the journey's nine steps.

---

## O10 · Meet a locked feature in the middle of the work

Fathom, monthly; on Starter, felt constantly. Walk: any locked control ─PN→ `X-upgrade` → admin: ─LK→ `S-plan`; non-admin: creates `R-request`, visible in `P-requests`.

### Against the gated-features pattern, rule by rule

| # | Pattern rule | Verdict |
|---|---|---|
| 1 | Visible where it would live, lock and plan name, never moved, never removed | **Pass.** Spec 14 §3.8 and §6.2 keep Fathom's teams, profiles, SSO, IP allowlist, territories, API keys, webhooks and own model key exactly where Meridian has them. Spec 15 §3.4 does the same on cards and radios. |
| 2 | A real control, not a disabled one | **Pass.** Both specs say it opens a panel; both say never greyed. |
| 3 | Explained at the moment of intent, never a banner or a tour | **Pass.** |
| 4 | Price in the panel before the button, total for the period, never a breakdown | **Pass.** Spec 14 §3.4 and §2.3, spec 15 §3.4 and §6 all say "one total for the period, one button". |
| 5 | Ask the admin from the same panel, with feature, **cost**, origin — and reason and time on the approver's screen | **Fail.** See O10-2. |
| 6 | Safety and decision-critical on every plan | **Pass.** Spec 14 §2.3 lists them by name. |
| 7 | Lock at the entry point; no gate after work the user cannot keep | **Fail.** See O10-1. |
| 8 | Preview where possible: a gated report shows its shape and row count | **Fail.** See O10-3. |
| 9 | Usage still decides the level; a lock does not promote | **Pass.** Spec 14 §2.3 says it, and the shape check counts locked items in the tail. |
| 10 | Nothing moves when unlocked | **Pass.** |

### Issues

**O10-1. The sequence ruleset is gated at Save, after the work.** The journey names the pattern to copy from its own source: 16§8, "saving reusable rulesets is gated while configuring one sequence is not". So an SDR on Starter opens `D-seq-send`, sets what finishes, pauses and excludes a contact — real work — and meets the lock on "Save as a reusable ruleset". That is a gate after work the user cannot keep, which pattern rule 7 calls drip pricing, and neither spec 14 nor the map says where the lock sits. **Decision:** the lock is visible from the moment `D-seq-send` opens: the "Save as a reusable ruleset · Growth" control is present, locked and priced at the top of the ruleset block, before any field in it is touched, and the per-sequence settings save normally underneath it. The user knows at the entry point that the reusable version costs money and that this sequence's settings do not. Stated in spec 14 under `seq.rulesets` as the rule the sequences spec reads, since spec 14 owns the plan table.

**O10-2. The ask-the-admin panel collects no reason, and the approver's screen promises one.** Spec 14 §3.4 (ask side): "which sends the feature, the cost and where the request came from." Spec 14 §3.4 (review side): "The request with requester, feature, plan, monthly cost, origin, **reason** and time." The reason is displayed and never collected. Pattern rule 5 requires the approver to have what a price decision needs. **Decision:** the upgrade panel's "Ask Daniel Okafor" opens one field — "What are you trying to do?" — prefilled with the origin in words ("Trying to add a second mailbox on the Email sending page") and editable, then one button. One field, not a form; the origin does most of the work and the person corrects it if it is wrong.

**O10-3. Nothing previews.** Pattern rule 8, and the plain case is Fathom's Reports: on Starter only the Activity tab exists, and the other four tabs are simply not there. A tab that is absent teaches nothing about what the plan buys; a tab that shows its shape and its row count is the discovery the pattern exists to protect. **Decision:** spec 14 §2.3 states the preview rule for the whole product, so every spec renders it the same way: a gated view is shown with its real shape and its real count and its values withheld — "Pipeline · 84 deals · Growth" — never a screenshot, never a fake chart, never an empty state. The CRM two-way radio and custom objects rows already do the equivalent by sitting in the list with their plan names.

**O10-4. "The work continues by another route either way" is in the journey and on no panel.** Three of the journey's decisions are "upgrade, ask, or route around", and the panel currently offers two. **Decision:** the upgrade panel's last line names what is still possible without the upgrade, in one sentence, or says plainly that there is none: "Without it: one mailbox per person, and you can rotate which one a sequence uses." That is rule 4's honesty test applied to a lock — a door that opens onto a dead end is a door that lied.

**O10-5. The agent count is plan-gated and the agents spec does not carry the gate.** PLAN.md and spec 14 §2.3: agents 2 / 3 / all plus own model key. Spec 13 mentions the lock nowhere. Fathom runs two and Fathom's admin touches "Agents on or off" at 40 weekly, the highest in the product — so this is the lock this business meets most. **Decision:** the third agent is listed in `S-agents` and on the Agents page, in its place in the list, with a lock, "Growth" and the monthly total, and its description intact so the person knows what they are not getting. Nothing is hidden and nothing is moved when it unlocks.

**O10-6. `X-upgrade`'s non-admin branch writes an `R-request` into a page with no spec.** Same as O5-6 and O9-2. **Decision:** spec 17 owns both kinds; the upgrade kind carries requester, feature, plan, monthly total, origin, reason and time — Figma's six plus the feature — and its approve action states the new total for the period before the button, because approving it is a price decision (rule 7 on the approver's screen).

### Score

**No.** The pattern holds on seven of ten rules. Missing: **the reason on the ask**, and a **lock at the entry point for the sequence ruleset** rather than at its Save.

---

## Consolidated change list

Forty-nine changes, numbered straight through. "File" names what the apply pass edits; the map's own rule (a spec and the map disagree about a node's existence or parent, the map wins) is assumed throughout.

| # | File | Location | Current | New | Rule |
|---|---|---|---|---|---|
| 1 | specs/15-connect-integration.md | §3.1 step 1; §3.4 empty state | Fathom's CRM cards are ordinary unconnected cards | Adds "Ollopa is our CRM" as a declarable answer on the CRM group; declaring it removes the CRM row from the Home setup list and is reversible from the same place | 4 |
| 2 | specs/01-home.md | §3 health strip; §5 Fathom | "Setup steps remaining (2)" stays until the missing integrations are connected | The CRM row leaves the list when "Ollopa is our CRM" is declared; the door is removed when the list empties, and at Fathom it empties | 4 |
| 3 | specs/14-settings.md | §3.8 Empty | "No CRM connected · Connect one" | "Ollopa is your CRM. It is holding your contacts, companies and deals. Connect Salesforce or HubSpot if that changes." | 4 |
| 4 | IA-MAP.md | §2.2 `D-home-setup` | "Setup steps remaining (n)" | "Not set up yet: mailbox, CRM, invites (3)" — contents then count, no fraction, no percentage | 4 |
| 5 | specs/16-workspace-setup.md | §3 "What each profile leaves out", Founder-led row | Inbox, Campaigns | Inbox, Campaigns, Accounts, Reports, with the signal for each: first reply, first audience or campaign, first deal reaching Closed won, first full week over ten sends | gap 6.4a |
| 6 | specs/16-workspace-setup.md and specs/00-shell…md | §3 profile table (16); §3.2 profile table (00) | 16: "Sequences, Lists — admin only". 00: "Sequences for the account executive" | Product-led growth leaves out **Sequences for the account executive and the admin, and Lists for the admin** (Ridgeline: AE 10, admin 5, admin 15 — all under the line) | 1 |
| 7 | IA-MAP.md | §2.1 `X-viewas`; §5 walks O2, O5 | A level-2 panel opened from `X-user` | A **mode** on the page, entered from a users-table row action or the `S-team` heading, with a persistent "Viewing as … · Exit" banner; never a panel inside a panel | 2, convention 2 |
| 8 | specs/14-settings.md | §8 review, "Two levels maximum" row | "A users page with a per-user drawer would be three from Settings" | Corrected: navigation costs no level (IA-MAP convention 1), so a panel on the users table page is level 2 there. `X-user` exists; credit limit, status and last active stay in the row | 2 |
| 9 | specs/14-settings.md | §3.4 Team actions | Row actions Edit profile and Deactivate | `X-user` panel: seat, permission profile, additional grants, team, territory; and Deactivate opens the ordered offboarding flow in change 10 | 5 |
| 10 | specs/14-settings.md | §3.4 Team actions | Deactivate is a single row action | Four ordered blocks with counts and consequence lines: reassign (open tasks only; paused and failed stay; 250 a pass) → unlink mailboxes → unmap from the CRM ("until this is done, this person's activity keeps syncing") → deactivate ("access ends now, the seat is free, your bill does not change until renewal on 15 Jan 2027"). Step 4 reads "Reassign first" and names what is outstanding until 1–3 are done or skipped with a reason | 7 |
| 11 | specs/14-settings.md | §3.4, new lines in `X-user` | Nothing | "The seat decides which areas exist for this person. The profile decides what they may do inside them. A profile cannot grant an area the seat does not carry." | 4 |
| 12 | specs/14-settings.md | §3.4, profile row in `X-user` | Nothing | Consequence line: "This replaces anything set on this person directly." Profiles the admin does not hold are absent with one line naming who can assign them, never greyed | 7, 4 |
| 13 | src/ollopa/usage/settings.ts and spec 14 §4 | Team and access | — | New `team.viewas`, "View as a teammate": admin 6; Halyard 20; Fathom 1; Ridgeline 4. Growth | 1 |
| 14 | specs/15-connect-integration.md | §3.1 step 2 | One button plus the shared-account line | Adds the requirement above the button: create/read/edit on Accounts, Contacts, Leads, Opportunities and User Roles; API Enabled under System Permissions; Essentials cannot connect | 7 |
| 15 | specs/15-connect-integration.md | §3.2, Field mapping door | Editable in place with a Save and an applies-to line | Removing or retyping an existing pair raises a consequence line at the pair before Save: "Removing this pair can stop Contacts syncing until the next full pull. Run a full pull after saving?" with the pull offered there | 7 |
| 16 | specs/15-connect-integration.md | §3.1 step 4 | "Standard fields are pre-mapped" | Pre-mapped rows are marked **suggested** and counted in the tab label ("Contacts · 14 mapped, 9 suggested, 1 required unmapped"); saving the step confirms all and says so; editing one marks it **edited** | 6 |
| 17 | specs/15-connect-integration.md | §3.2, error table | Flat table, newest first, "Show filters" | Grouped by cause, largest group first, the nine named causes, each row a count, a one-line cause and "Retry these n"; a group expands in place to its records; date and object filters remain as a control | 1 |
| 18 | specs/15-connect-integration.md | §3.3 actions | "Retry / Retry all" | Every retry states count and batching: "Retry 340 duplicate errors · 100 at a time, about 4 passes", and the group count after the run is the confirmation | 7 |
| 19 | specs/00-shell…md | §3.4 notification table and the mute sentence | Sync error is interrupting; "a person can mute a digestible kind, never an interrupting one" | Sync error becomes **digestible**, with a frequency choice on the integration (instantly / daily / weekly, default daily) named as the review cadence. Interrupting is exactly three kinds — bounce guard tripped, over-threshold second approval, credits low — because each means something is sending or spending now. The count stays at level one on Home's strip and the Settings row | 7 corollary |
| 20 | specs/02-people.md | §3, views | No data-quality view | Ships a default saved view, "Needs enrichment · 2+ of 5 fields missing or older than 12 months" (email, phone, job title, company name, last enrichment date), with its count, feeding `X-enrich` and `W-import` | 1 |
| 21 | specs/14-settings.md | §3.4, Prospecting | Duplicate handling is a bare row | The row shows the observed duplication rate beside the rule ("3.1% · target under 3%"), as bounce guard does | 5 |
| 22 | IA-MAP.md | §2.3 `D-people-columns` | "Columns and density" | "Columns and density · 12 of 31 columns" | 4 |
| 23 | IA-MAP.md | §5, walks O2, O4, O5, O9 | Chains that read as panel-inside-door | Use the existing `─RT→` return marker so every walk returns to its page before opening the next level-2 node | 2 |
| 24 | specs/14-settings.md | §3.4 / §6.3, `X-user` | Profile only | Two adjacent rows: **profile**, then **additional grants** as named chips with an add control, and one line: "Grants add to the profile. Prefer a grant to a new profile." | 5, 1 |
| 25 | specs/14-settings.md | §4, `pros.territories` | Prospecting rules only | One node, two openings: defined in Prospecting rules, assigned from a row in `X-user`; both open `X-territory`. Number unchanged | 5 |
| 26 | specs/14-settings.md | §3.3 strip; §3.4 Plan actions | The strip carries upgrade requests and Plan reviews them | One queue, `P-requests`. The strip keeps the line, the count and the cost and links into it; the review action moves to spec 17 | 5 |
| 27 | IA-MAP.md | §2.11 `P-requests`, sidebar column | SEP, AG, PLG | Unchanged, plus the named signal for the Founder-led exposure: **the second upgrade request in a week**; entry meanwhile is the Settings strip line, ⌘K, and "Add to sidebar" | declared sidebar |
| 28 | specs/00-shell…md | §3.2 credits pill | Links to Settings › Plan › Credit balance and burn rate | Opens `X-credits` over the current page; the panel carries one link into `S-plan` | 2, 5 |
| 29 | src/ollopa/usage/settings.ts and spec 14 §4 | Plan, billing and usage | — | New `plan.credit-breakdown`, "Credit spend by feature, person and surface": admin 30; Fathom 45; Halyard 40; Ridgeline 20; SDR 8. One flat panel, three stacked ranked breakdowns (feature, person, surface: app, automation, API, MCP, CLI, agents), top five each with one "show the rest", every row a link to the job, person or key | 1, 5 |
| 30 | src/ollopa/usage/settings.ts and spec 14 §4 | Plan, billing and usage | — | New `plan.team-budget`, "Team credit budget": admin 12; Halyard 20; Fathom 15; Ridgeline 6. Behind the Plan door except at Halyard | 1 |
| 31 | src/ollopa/usage/settings.ts and spec 14 §4 | Plan, billing and usage | — | New `plan.spike-alert`, "Credit spike alert: warn at n× the usual daily burn", **critical**: admin 10; Fathom 20; Halyard 15. Shows the threshold and today's multiple in the row, as bounce guard does | 7 |
| 32 | src/ollopa/usage/settings.ts, spec 14 §3.1/§4/§6.3, IA-MAP §2.14 | New area, after Integrations | `S-developer` has no items; API keys and webhooks sit under Integrations | New area **API, webhooks, MCP and CLI** with four rows — `dev.api-keys` "API keys: scope, last used, spend" (admin 6, Fathom 1, Growth); `dev.webhooks` "Webhooks: events, delivery log, reconcile" (admin 4, Fathom 1, Growth); `dev.mcp` "MCP connection and scope: read, safe writes, destructive writes" (admin 12, Fathom 25, Halyard 8, Ridgeline 6; read all plans, writes Growth); `dev.cli` "CLI device authorisations" (admin 5, Halyard 20, Fathom 8). `int.api-keys` and `int.webhooks` are moved, not copied | 1, gap 6.4f |
| 33 | src/ollopa/usage/settings.ts and spec 14 §4 | You | — | New `me.mcp-token`, "Your MCP and CLI connections": admin 6; SDR 5; Fathom SDR 20. The personal half of `X-mcpscope` and `X-cliauth` | 1 |
| 34 | specs/14-settings.md | §2.3 plan table | "API and webhooks: no / yes / yes" | "API, webhooks, CLI: no / yes / yes", plus a new row "MCP: read only / read and write / read and write" | gap 6.4f |
| 35 | specs/14-settings.md | §2.3 plan table | "Reports: Activity only / all four / …" | "Activity only / all five / all five, plus CSV export and the scheduled weekly email" | accuracy |
| 36 | specs/14-settings.md | §2.3, after the two never-gated paragraphs | Nothing about preview | Adds the preview rule for the whole product: a gated view is shown with its real shape and its real count, values withheld ("Pipeline · 84 deals · Growth"); never a screenshot, never a fake chart, never an empty state | gated features 8 |
| 37 | specs/14-settings.md | §3.4, the lock panel | Feature, plan, one total, one button; "Ask {admin}" sends feature, cost and origin | The panel's last line names what is still possible without it, or says there is nothing; "Ask {admin}" opens one field, "What are you trying to do?", prefilled with the origin in words and editable, then one button | gated features 5, rule 4 |
| 38 | specs/14-settings.md and specs/05-sequences.md | §4 `seq.rulesets`; the sending-settings door | The gate's position is unstated | "Save as a reusable ruleset · Growth" is present, locked and priced at the top of the ruleset block from the moment `D-seq-send` opens; the per-sequence settings save normally underneath it | gated features 7 |
| 39 | specs/13-agents.md | §3, the agent list | No plan gate | The third agent sits in its place in the list with a lock, "Growth", the monthly total and its description intact; nothing moves when it unlocks | gated features 1, 10 |
| 40 | specs/14-settings.md and src/ollopa/usage/settings.ts | §4 `pros.dnc` | "Do-not-call screening", admin 3, behind the Prospecting door, not critical | **Critical**, label carrying state: "Do-not-call screening · synchronised 2 September · next due 3 October", warning past 31 days, on Home's health strip like bounce guard, with the 24-month review log in the row | 7 |
| 41 | specs/14-settings.md and src/ollopa/usage/settings.ts | §4 Prospecting rules; §6.7 removed list | `X-removal` deleted by §6.7 | New `pros.removal-list`, "Removal list: review, export, and delete everywhere": admin 5; Halyard 3; Fathom 1; Ridgeline 2. Behind the Prospecting door. Its delete action carries the full consequence at level one in the panel, with counts for records, CRM links, lists, sequences and jobs, and "This cannot be undone". Removed from §6.7 | 7, map wins |
| 42 | specs/14-settings.md | §3.4, inside `X-removal` | Nothing | Four lines with counts and links answering the journey's sweep in place: sequences, enrichment jobs, API keys with prospecting scope, agents | 5 |
| 43 | specs/14-settings.md | §4 `pros.gdpr`; read by the record and table specs | Nothing | A restricted person stays in tables and counts with the action replaced by one line — "Restricted: EU region rule · Prospecting rules" — never removed, never blank; agents log the same line as a skipped step in `D-agent-steps` | 4 |
| 44 | specs/14-settings.md | §4 `mail.limits` | "Daily and hourly sending limits" | "Daily, hourly and minimum delay between sends" — one row, three fields | 5 |
| 45 | **specs/17-requests.md (new)** | whole file | Does not exist | Owns `P-requests` and `R-request`, both kinds in one queue. Level one on the record: the requested outcome, the reason, requester and time, the decision owner, the state (captured → investigating → approved → shipped → verified), the two approvals as separately-dated actions, what it touches with the count of people who will see it, the "applies to" rollout scope, and the rollback path in words. Doors: discussion; implementation evidence and test result. The upgrade kind carries requester, feature, plan, monthly total, origin, reason and time, and its approve states the new total before the button. One line stating that routing exceptions stay on Workflows | 2, 7, 5 |
| 46 | specs/17-requests.md | approve actions | — | "Approve to implement" carries its consequence in the label and the confirmation ("Approve · adds a required field at Proposal · 34 people see a new required field · rollback: remove the field, values kept 30 days"). "Approve to investigate" carries none, and says so | 7 |
| 47 | IA-MAP.md | §6.2, after the four boundary decisions | Four steps land on no node | A fifth, with its substitute named: no sandbox and no change set. Ollopa's answer is staged rollout — `R-request` carries an "applies to" scope (one team, one territory, everyone) applied first and widened from the same row. The loss is recorded as a known reduction | boundary |
| 48 | specs/01-home.md, specs/00-shell…md, specs/17-requests.md | Home health strip; digest; the request record | Nothing | One announcement mechanism for the product: a workspace change other people feel (required field, stage, sending limit, bounce threshold, routing rule) writes one line into the affected people's Home health strip and next digest — what changed, who, when, a link. Expires after seven days or on first contact with the changed thing. Not a tour, not a tooltip, not a modal | 8, 6 |
| 49 | specs/17-requests.md | verify state | Nothing | One number against the change: how many of the affected people have used the changed thing since it shipped, over the affected count. That is the implementation evidence and the final test result | 9 |

*(Rows 45 to 49 are one new file and its four required contents. Rows 26, 27 and 36 also land partly in that file; the apply pass should write spec 17 once, from all six.)*

---

## What this walk did not change, and why

- **Halyard's Settings head at 29%, four points over the band.** The same judgement as the S1 Tasks decision: density wins for an all-day seat, and Settings is a 95%-weekly page for Halyard's ops lead. Spec 14 §4 already names it as the stretch case. Left alone.
- **`X-viewas` gated at Growth.** It looked like a gate on a safety check, but Starter has no permission profiles to preview: the gated capability and the tool that verifies it are gated together, so there is no door onto nothing. Left alone.
- **The thirteen-entry admin sidebar.** Gap 6.4g's reasoning holds — routing rules invisible until they misfire and an intake queue in Slack at 2.1 hours a week (19§4.1) are both worse. But spec 00 §3.2's admin sidebar still lists eleven entries and its §4 sidebar usage table has no Workflows and no Requests rows. That is a straightforward omission the apply pass should close alongside change 27; it is recorded here rather than as a numbered change because it is transcription, not judgement.
- **`S-scoring`**, the thirteenth settings area, is likewise itemless in `settings.ts`. No RevOps journey walks it — M3, M4, C3, C5 and G3 do — so it belongs to the marketer walk and is named here only so it is not lost twice.
