# Apply pass, group D: IA-MAP.md, JOURNEYS.md, PLAN.md, PRODUCT.md

*Applied 15 September 2026 from the seven walk logs in `walk/`. Every change in any walk that targets one of these four files is below: applied, partly applied, or skipped with the reason. No spec and no usage file was touched.*

**Counts.** 62 walk rows applied, 1 partly applied, 1 declined in favour of a conflicting row, 4 rows added to PLAN.md §2 and one section of PRODUCT.md rewritten. The map went from 144 nodes to 147: three deleted, six added, five re-typed. No seat's deepest path changed; every row of the level check is still 2.

---

## 1. IA-MAP.md

### Part 1, the surfaces

| walk | what |
|---|---|
| revops 19 + cs 2 | The bell's interrupting kinds are now **three**: bounce guard tripped, a second approval over the threshold, credits low. A sync error is digestible at a frequency chosen on the integration, with its count still level one on Home's strip. **Partly applied** — see §5 |
| cs 3 | Slack carries six event kinds; **account signal** added with the account, what fired, the routed owner and the due date |
| leader-dev 52 | The digest carries a failing webhook subscription with its failure count and cause |
| agents 24 | ⌘K's third staged command is "Review n waiting · 4 emails · 8 credits", opening `X-agent-batch` focused. Stated once: no palette command ever approves |
| leader-dev 42, 43 | The API states two headers, `X-Credits-Remaining` beside `X-RateLimit-Remaining`, refuses at the cap rather than returning a partial result, and writes all three kinds of "cannot see it" in API shapes |
| leader-dev 57, 59 | MCP's batch boundary is the end of the client's turn — one card per turn, never one per call — and the server's tool list is exactly the seat's areas, with no profile filtering |
| leader-dev 63, 65 | The CLI requires the workspace name typed back for a destructive bulk write, and states all three "cannot see it" shapes, including exit 3 for a seat gap |

### Part 2, the node inventory

**Deleted (3).** `D-acct-health` (cs 5) — a score never sits across a door from its reasons, so the drivers are flat lines in `Q-company`, a section on `R-company` and a side card on a renewal-typed deal. `D-person-activity` (sdr C-41) — the contact record's activity is its main timeline with filter chips. `X-book` (sdr C-34) — merged into `X-meeting`, which now carries proposed → booked → held / no-show / cancelled.

**Added (6).** `D-thread-agent` (sdr C-31/C-32), `D-co-activity` and `D-co-history` (cs 11), `X-score`, `X-persona`, `X-signal` (marketer 21).

**Re-typed (5), each with the level check re-run.**

| node | was | is | walk |
|---|---|---|---|
| `X-thread` | panel, level 2 | **detail pane, level 1** — the open half of a master-detail page, not a disclosure | sdr C-31 |
| `X-reply` | panel on `X-thread` | **door** on `X-thread`'s composer, `R-person`, `R-deal` | sdr C-31, ae 40 |
| `X-viewas` | panel on `S-team`, level 2 | **page mode, level 1**, with a persistent "Viewing as … · Exit" banner | revops 7 |
| `X-agent-edit` | panel, own channel | **in-place edit state** that replaces `D-agent-item`'s read content | agents 7 |
| `Q-company` | quick look on `P-companies` | also the quick look on `P-accounts`, rendering the customer-state field set | cs 7 |

**Relabelled or re-scoped.** `D-home-setup` → "Not set up yet: mailbox, CRM, invites (3)" (revops 4). `D-people-columns` → "· 12 of 31 columns" (revops 22). `D-task-filters` → "Additional filters: source, status, sort (n)" (marketer 37, cs 18). `D-camp-filters` → "Additional filters: owner, audience, date, goal (n)" (marketer 38). `D-aud-suppress` → "Suppression rules … (4 applied)" (marketer 2). `D-deals-filters` gains "no next step" (ae 43). `Q-deal` → "one editable field, by ownership" (leader-dev 12). `X-note` → "Write a note or a comment", opened from a record's composer on its own channel (leader-dev 9, 11). `X-calllog` → "The call: purpose, disposition, duration, notes, transcript, coaching note", two modes, L3 added to its journeys (leader-dev 31, sdr C-41). `D-agent-filters` gains **surface**, and `P-agents` gains `surface` to its objects (leader-dev 60). `X-report-records` gains `call` and `R-audience` as a second parent (leader-dev 28, marketer 6). `X-domain` gains SDR (read) (sdr C-42). `S-developer` seats become "OPS; the MCP and CLI scope rows: all" (leader-dev 53). `P-lists` sidebar becomes "FO, SEP, AG; PLG for the MK seat only" (marketer 10). `P-tasks` and `X-queue` record queue mode as the SDR and AE default with a labelled in-place switch (sdr C-23/C-44, carried from S1). `M4` removed from `P-tasks`, `D-task-filters` and `X-territory` (marketer 30).

**Totals.** 147 nodes: 18 pages, 14 records, 3 quick looks, 3 wizards, 42 panels, 13 settings areas, 45 doors, 6 surfaces, plus the three state nodes. Counted from the tables, not asserted.

### Part 3, the edges

Added: `P-accounts` row → `Q-company` → `R-company` (cs 7); `P-home` health strip and the bell's bounce row → the paused `R-sequence` (sdr C-43); `S-scoring` → its three panels (marketer 21); `X-key` → `R-job` filtered to that key (leader-dev 47); `S-team` row action or heading → `X-viewas` as `TB` (revops 7); `X-thread` → `D-thread-agent`, `X-reply`, `X-meeting`, `X-enrol`. Changed: `P-tasks` row and header for `X-meeting` and queue mode; `R-deal` → `X-note` on its own channel and `X-reply`; `D-agent-item` → `X-agent-edit` in place; `R-company` doors gain the two new ones; `S-developer` states that the MCP lock sits on the write tiers. Removed: the `P-accounts` → `D-acct-health` edge and `X-book` everywhere. The two diagrams were corrected for the Inbox pane, the Accounts row door and the five Reports tabs.

### Part 4, the level check, re-run for every re-typed node

Every row was recomputed and the deltas are written into the map beneath the table. `X-thread` and `X-viewas` each move one node from level 2 to level 1 for the seats that hold them; three deletions and six additions do the rest. Marketer and OPS gain the three scoring panels; every seat gains the two company doors; SDR and AE gain `D-thread-agent`. **No row's deepest path changed and no row exceeds 2.**

Three rows were added to the per-channel table — master-detail page, page mode, agent item — and the "four nodes that wanted a third level" list is now six, with `X-agent-edit` and `X-viewas` as entries 5 and 6. The Tasks density paragraph now states that queue mode is a default state with a labelled switch, so the list's doors stay level two and the depth is unchanged.

### Part 5, the journey walks — 24 rows re-cut

S9, S10 (queue mode), S11 (`X-thread` level 1, `D-thread-agent`, the composer), S12 and A7 (`X-meeting`, and the brief returning to the deal before its door), M4 and M5 (the marketer never lands on Tasks), C1, C2, C3, C4, C6 (no health door; the accounts quick look), O2, O4, O5, O9 (`─RT→` return markers, `X-viewas` as a mode), L1 (quick-look comment, the note on its own channel), L2 (`X-forecast` and `X-report-records` as siblings), L3 (the timeline, the coaching note inside the call), D3 (the lock on the write tiers, before any work exists), D4 (`--workspace`, not the account menu), G1, G2, G3, G5 (edit in place, sibling doors, the accounts quick look, `X-score`). The section head now defines `─RT→` and records what was re-cut and why.

### Part 6, the gaps

- **6.2** gains a fifth step that lands on no node (revops 47): no sandbox and no change set; the answer is `R-request`'s "applies to" scope, applied first and widened from the same row, with the verify count as the evidence. L3 is renumbered to sixth.
- **6.4a** now resolves three sources instead of two: the Founder-led profile leaves out **Inbox, Campaigns, Accounts, Reports, Requests**, each with a named signal, Requests on the second upgrade request in a week (revops 27).
- **6.4c** records the marketer-never-lands-on-Tasks consequence in one place.
- **6.4j** records that Meridian now declares a sales-manager AE+ seat (ae 44, ae 45), so `reports > 0` is live rather than hypothetical.
- **6.5** is rewritten as an ownership table: every one of the nine boundary nodes, plus templates, the scoring panels and the forms record, now names the spec that writes it, and the three new specs are numbered **17 developer surfaces, 18 import and enrichment, 19 workflows**, with a fourth for Requests after them. Four things the specs must read rather than restate are listed: the fifth Reports tab, the ledger's Surface column, the three interrupting kinds, and the fact that `X-thread`, `X-viewas` and `X-agent-edit` are states and may never be drawn as nested panels.

---

## 2. JOURNEYS.md — the contradictions the walks found

| walk | journey | what |
|---|---|---|
| leader-dev 44 | **D1** | "Approval: None" contradicted the map's `X-approve-remote`. Now: no per-item approval and the credit cap is the gate, **except** a single call above the second-approval threshold, which returns a pending-approval object with the consequence line, the cost and the approver, and appears in the app's queue |
| (map §6.4f, leader-dev 54) | **D3** | The journey implied the gate lands at the write. Now the scope step states that read is on every plan and the two write tiers carry the lock, the plan name and the monthly total **at the point of choosing**, never at the moment a write fails; the approval line states the turn boundary |
| cs 35 | **C1** | "skim the two most important recordings" → read the logged calls on the deal and the transcript where an integration supplied one. `conversation` leaves C1's object list and `call` replaces it |
| (map §6.2) | **L3** | Re-scoped to what ollopA owns, with a **Recorded reduction** line naming what is lost: listening, moment comments, the scorecard object, the call library. The boundary tag reads `[BOUNDARY: conversations, re-scoped]` |
| agents 16 | **G3** | "re-rank the task queue and account list" → write the new score to the record and the task and show the change in place; nothing moves |
| leader-dev 8 | **§1 objects** | A paragraph under the objects table: a **comment** is an attribute of a note — a note addressed to one teammate, reaching them on Home and in the digest, never through the bell — not a thirty-second object |

---

## 3. PLAN.md §2 — four rows added

1. **Journey walk, S2–G5**, dated 15 Sep 2026, in the decided voice: the queue-mode carry-over, the master-detail Inbox and the merged meeting, the two deleted activity doors and the deleted health door, View as and Edit-then-approve as states rather than nested panels, five Reports tabs with spec 12 owning Forecast and no agent submitting, the ledger's Surface column, no ⌘K command approving, the marketer never landing on Tasks, and the three new specs plus a fourth — none of which adds a node the map did not already hold.
2. **Interrupting notifications** — resolves revops 19 against cs 2.
3. **Contact activity** — resolves sdr C-41 against leader-dev 30.
4. **Founder-led omissions** — resolves PLAN's own map-decisions row against IA-MAP §6.4a and spec 16.

---

## 4. PRODUCT.md

- The **fourteen-page table is gone**. "The pages" is now a pointer to IA-MAP.md part 2 with the map's counts, a table of the **eighteen page-type nodes** the map holds with the seats that hold each, the three wizards that behave as pages, the four screenless surfaces plus Slack and the digest, and the unchanged absent list.
- The header sentence that said the page map "is superseded by the information architecture map once that exists" now points at the map as the live file.
- "The five roles" is **"The five seats"**, and gains the two non-seats: **AE+**, the AE with direct reports, with what it changes and Meridian's declared one (Priya Raman, Elena Vasquez reporting); and the developer as the RevOps admin seat.
- The settings inventory said "about 66 items in 10 areas" and listed nine. It now says thirteen areas and lists all thirteen: **You**, **How your team works**, **Signals, scoring and personas** and **API, webhooks, MCP and CLI** added, with keys and webhooks moved out of Integrations.
- Seed data wording moved from "roles" to "seats" and Meridian's users line names the manager seat.

---

## 5. Partly applied, and one conflict

**Partly applied — cs 2 (the bell's interrupting kinds).** The CS walk asked for **four** interrupting kinds: the spec's existing three plus the over-threshold second approval. The RevOps walk (19) asked for exactly **three**, demoting sync error to digestible, on the rule that an interruption means something is sending or spending *now*. Both agree the second approval interrupts. The RevOps rule is the stronger of the two and it is the one rule 7's corollary supports, so the map now reads: bounce guard tripped, a second approval over the threshold, credits low — three, with sync error digestible at a chosen frequency and its count still level one on Home's strip. CS's substance is in; its count is not. PLAN.md carries the decision so spec 00 has one place to read it from.

**Declined — leader-dev 30**, which asked that a contact's "All activity · n" remain a door and spec 02 be matched to IA-MAP 2.3. It is a spec row, but it is premised on a map row that sdr C-41 deletes. C-41 argues rule 1 — what a contact record exists to show is not a disclosure — and it changes the map, which by the map's own precedence rule the spec then follows. `D-person-activity` is deleted; the **company** record keeps its activity door (cs 11), because a company's timeline is several people's. Recorded in PLAN.md §2 so the spec editors have the ruling rather than the argument.

**Left alone — PLAN.md "The whole app first"**, which still reads "all fourteen pages". It is a build-scope decision of 13 September and the brief limited me to adding rows, not rewriting existing ones; the new Journey-walk row supersedes it on the count the way later rows in that table already supersede earlier ones.

---

## 6. Cross-group dependencies

1. **Four walks each proposed a file called `specs/17-*`** — developer surfaces (leader-dev 38), import and enrichment (sdr C-10/C-13/C-14), workflows (marketer 31) and requests (revops 45). IA-MAP §6.5 now assigns **17 = developer surfaces, 18 = import and enrichment, 19 = workflows**, and Requests takes the next number after 19. Spec editors must rename accordingly; four files called 17 would otherwise collide.
2. **Six new nodes need a spec to render them**: `D-thread-agent` (spec 06), `D-co-activity` and `D-co-history` (spec 03, and the shared record template in spec 09), `X-score`, `X-persona`, `X-signal` (spec 14 under `S-scoring`).
3. **Three deleted nodes must stop appearing in specs**: `X-book` (06, 07, 09, 11), `D-acct-health` (11, 09, 12, 13), `D-person-activity` (02, 09, 12).
4. **Three re-typed nodes may not be drawn as nested panels**: `X-thread` is the open half of `P-inbox` (spec 06), `X-viewas` is a mode of `S-team` (spec 14), `X-agent-edit` replaces the read content of `D-agent-item` (spec 13).
5. **The AE+ seat is now live.** Editor C needs `Role.reports?: string[]` and Priya Raman on Meridian in `src/ollopa/data/businesses.ts` (ae 45), and an optional `aePlus` key in `UsageItem.weekly`, in override records and in `weeklyUse()` in `src/ollopa/usage/model.ts` (leader-dev 2). `USAGE-MODEL.md` needs the paragraph from leader-dev 3. PRODUCT.md and IA-MAP §6.4j already assert the seat, so a usage file without `aePlus` leaves the map ahead of the model.
6. **`Page` union**: `workflows` must be added in `src/ollopa/usage/model.ts` and `workflows.ts` registered in `index.ts` (marketer 32) — the map has held `P-workflows` since 15 September.
7. **One fact, one owner.** Three facts the map now states once and the specs must read rather than restate: the interrupting kinds are three; CSV export is Growth and the scheduled weekly email is Scale (ae 34, marketer 46, leader-dev 67 all say so — one owning sentence, please); the Founder-led profile leaves out five pages with five named signals, which spec 16 and spec 00 §3.2 must both carry.
8. **The RevOps sidebar is thirteen entries** and spec 00 §3.2 still lists eleven with no Workflows and no Requests rows; the RevOps walk flagged it as transcription rather than judgement, and it is not a map change.
