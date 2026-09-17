# Apply pass, group C

Editor C. Owned: `specs/12-reports.md`, `13-agents.md`, `14-settings.md`, `15-connect-integration.md`, `16-workspace-setup.md`; the new `specs/17-developer-surfaces.md`, `18-import-and-enrichment.md`, `19-workflows.md`; `src/ollopa/usage/reports.ts`, `agents.ts`, `settings.ts`, `connect.ts`, `setup.ts`, `model.ts`, `index.ts`, and the three new usage files.

**Applied: 118. Skipped: 9** (each with a reason below). `npx tsc -b` passes; the duplicate-id check returns `[]`.

---

## 1. The usage model and the code

| Walk | File | What was applied |
|---|---|---|
| L-2, L-3 | `usage/model.ts`, `USAGE-MODEL.md` | `UsageRole = Role \| "ae_plus"` as a **seat modifier, not a seat**: `ROLE_LABEL` covers it, `USAGE_ROLES` exports it, `weekly` and `overrides` accept it, and `weeklyUse(item, business, role, hasReports)` / `levelOf` / `shape` take a fourth argument that falls back to the AE number. `ROLES` and `SEATS` are unchanged, because IA-MAP 6.4j says no business declares a sixth seat. One paragraph added to `USAGE-MODEL.md` |
| M-32, S-C13/C14, L-38 | `usage/model.ts` | `Page` gains `developer`, `enrichment`, `workflows` and `templates`. (`templates` is unused here; it is added so spec 05 §3.9's `P-templates` items have a page value without another editor touching this file) |
| M-32/33, S-C51, L-38 | `usage/index.ts` | `developer.ts`, `enrichment.ts`, `workflows.ts` imported and spread into `allItems` |
| A-45 | `data/businesses.ts` | `RoleSeat.reports?: string[]`, and Meridian declares a second AE seat: Priya Raman, "Sales manager", reporting Elena Vasquez. Ridgeline keeps one AE seat. Seat lookup still resolves the AE role to Elena, so nothing else changes |
| — | `pages/SignIn.tsx` | One-character consequence of the above: the seat list keyed on `r.role`, which is now duplicated across two AE seats, is keyed on `r.user`. Outside my file list, but it is a defect my data change introduced |

## 2. New usage files

| File | Items | Shape checked |
|---|---|---|
| `usage/developer.ts` | 49 | Meridian admin 14/31/55 (fits), Halyard admin 22/35/43 (fits), Fathom admin 24/14/61, Fathom SDR 45/20/35, Ridgeline admin 10/18/71, Meridian SDR 0/0/100 — the four deviations are named in spec 17 §4 (a locked plan puts whole areas in the tail; a workspace that uses one surface has three areas it never opens; an SDR's page is only the two personal rows) |
| `usage/enrichment.ts` | 38 | Halyard SDR 24/32/45 (fits exactly), Halyard admin 24/37/39, Meridian SDR 18/34/47 (fits), Fathom SDR 21/34/45 (fits), Fathom admin 21/37/42, Meridian admin 3/42/55 (no head, stated), Ridgeline SDR 13/16/71 (stated) |
| `usage/workflows.ts` | 38 | Meridian marketer 24/29/47 (fits), Meridian admin 18/34/47 (fits), Ridgeline marketer 18/29/53 (fits), Ridgeline admin 13/39/47, Fathom admin 0/3/97 and Halyard admin 0/3/97 — both 97%-tail rows are stated with their reasons (a correctly-placed lock, and a workspace that routes nothing) |

Numbers were rebalanced twice against `shape()` rather than asserted: the first drafts put two thirds of Workflows and 68% of Halyard's enrichment page in the head, and the tail items a real import wizard and a real workflow builder accumulate (formats, encoding, branch, wait, exit, business hours, suppression, run-history housekeeping) were added rather than the head being trimmed alone.

## 3. New specs

**`specs/17-developer-surfaces.md`** (L-24, L-38 to L-42, L-49, L-50, L-55 to L-58, L-63, L-64; S-C11 read; O6-4, O8-5). Eight sections. `S-developer` as the thirteenth settings area, the four panels (`X-key`, `X-hook`, `X-mcpscope`, `X-cliauth`), `X-approve-remote`, and the four surfaces. Carries what IA-MAP 6.5 asked for in words: the per-workspace limits above the key list, the published cost table with the 45+ tail, the 80% alert, two response headers (`X-Credits-Remaining` beside `X-RateLimit-Remaining`), the refusal at the cap, the six-line webhook delivery contract and the reconciliation endpoint, the three MCP scopes with the lock on the two write tiers, the exit codes 0–6 with the resume token on 6, the typed-back workspace name on a destructive bulk write, **the turn as the approval boundary** (one card per turn, never per call), and all three "cannot see it" shapes written out for the API, MCP and the CLI. Nineteen of its 49 items are decision-critical, which is the point of the file.

**`specs/18-import-and-enrichment.md`** (S-C09, C10, C13, C14, C16; O4's data-quality view; M5's credit-cap reasoning reused). Owns `W-import` (five steps, the ten-row trial with **cost per hit** and the projected total before the button), `X-enrich` (two prices, the estimate, and the do-not-call line inside the same group as the button), `R-job` (cost per hit in the header, by-field report, what was charged and what was not, unmatched rows, four parents) and the job-change sweep (update or create, each with what it keeps, plus whether the new employer is already somebody's account). Written as a **page**, not a drawer: specs 02, 03 and 04 called it a drawer and the map wins.

**`specs/19-workflows.md`** (M4-2 to M4-5, M4-7 partial, M5-2/M5-6 reasoning, O9's routing/exception split). Owns `P-workflows`, `R-workflow`, `D-wf-runs`. The SLA clock at level one (window per heat, running now, breached today with elapsed time in text, the reassignment rule in words), the routing rule printing **who is away and skipped**, the named-account override named and never opened by a marketer, the credit ceiling with what happens at it, and `D-wf-runs` as **one door with two named sections** — Enrolled (n) and Could not route (n), each exception carrying its reason and the rule one link away.

## 4. `specs/12-reports.md`

Applied: A-29 to A-35, A-48; C-33, C-34; M-23, M-46, M-47, M-48, M-49, M-50; L-14 to L-20, L-23, L-24, L-26, L-27, L-29, L-67, L-68.

- Five reports; the **Forecast** tab with the scope chip per seat, the five categories each printing its definition as text, the goal as denominator, the predicted number beside the submitted one with the deals driving the difference, the deadline, the submissions strip, and "No agent submits a forecast".
- `X-forecast`: flat, no doors, a row per category with roll-up / adjustment / last submitted together, the judgement note, the submission-changes history, Submit with its consequence and who receives it, and **last cycle's call beside what happened**. The adjustment never alters the roll-up.
- The CSM's reading: renewal-typed deals grouped Renewal base and Expansion upside with separate totals.
- **Weighted forecast → Weighted pipeline** on the Pipeline tile, so one word does not mean two things.
- **CSV export is Growth**, the scheduled weekly email is Scale. Halyard exports; the PDF-workaround paragraph and the false "honest consequence" paragraph are deleted.
- Campaign results gains Unsubscribed (critical) and Complaints as columns and tiles, sourced and influenced side by side each printing its convention, and a "Persona: n" door. The Won drawer and its export gain Score at first contact for the marketer and admin seats.
- Activity gains Calls logged and Calls with a coaching note (30 days) plus a "Reps coached this week" tile for AE+; the records drawer gains calls as a record kind; the Forecast tab's records sort by category then risk.
- Date range gains This month and Last month. Keys 1–5. AE+ gets a working team select with the person filter promoted.
- §4 rebuilt: 68 items with an AE+ column, eight pairs shape-checked. AE 22/32/46, marketer 24/27/49, CS 15/35/50, Meridian admin 21/41/38, Halyard admin 29/27/44, Fathom admin 17/31/53, **AE+ 35/25/40 kept and named as the stretch case** (all three of that seat's journeys land here).

## 5. `specs/13-agents.md`

Applied: G-3, G-9, G-10, G-12, G-13, G-14, G-21, G-22, G-24, G-25, G-26, G-27, G-28, G-29; S-C33; O10-5 (revops 39); L-60, L-61, L-62; M-8.

- `kind: "skipped"` with `skipReason`, at zero credits, counted on the batch line and filterable: eleven silently dropped records made "6 waiting" a count that lies.
- Door label "Read the draft · 142 words · **3 inputs**", with "Built from: …" as the first line inside, each a link to a page; a reply item shows the incoming message's first five lines above the draft with "Open the thread".
- Tiles gain the observed track record ("Last 30 days: 34 drafts · you sent 31, edited 12, declined 3"), the locked third agent in place with its plan name and monthly total, and "Scoring rules →".
- **Expiry**: from day 11 "Expires in 3 days · nothing will be sent"; at day 14 declined by the product with "Nothing was sent" in the ledger.
- **No palette command approves.** "Review 6 waiting · 4 emails · 8 credits" opens the batch panel. "Approve 6 · send 4 emails, add 2 to sequences · 8 credits" carries the consequence in its own label and is inactive until every item has been read once; the outcome is one result line at the top of the ledger's day group.
- The admin's copy on an over-threshold item gains provenance ("Marcus Adeyemi approved this at 09:14 from the CLI…").
- New §3 subsection, "The same item on a screenless surface", with the five rules `X-approve-remote` obeys; a **Surface** column and filter (door becomes "Date, outcome, kind, teammate, surface", promoted beside Agent at Fathom); the actor reads "Priya Natarajan · Claude (MCP)".
- Two new rows in "What waits": a bulk write from a surface is **one** item, and a routing threshold crossing is logged, not queued. One line: an Inbox reply draft is approved in the composer and never also queued here.
- **No confidence badge anywhere**, and the `confidence` field is removed from the door contents; the track record and the inputs replace it.
- §4: 51 items, twelve critical, six pairs shape-checked; Fathom admin at 30% named as the stretch case.

## 6. `specs/14-settings.md`

Applied: O1-partial/O2-1 to O2-7, O3 (none), O4-partial, O5-2 to O5-4, O6-2 to O6-6, O7-1, O8-1 to O8-4, O8-6, O10-1 to O10-4; A-36; C-25, C-26; M-20, M-22, M-26, M-27(settings half), M-28, M-34; G-19; L-21, L-22, L-36, L-37, L-69; S-C11, S-C40.

Thirteen areas, 102 items (from 66). New areas **Signals, scoring and personas** (13 items) and **API, webhooks, MCP and CLI** (9 items, with `int.api-keys` and `int.webhooks` **moved, not copied**). Also: `X-user` restored with seat / profile / **additional grants** / team / territory and the three explanatory lines; the **ordered offboarding flow** (reassign → unlink → unmap → deactivate, with the 250-a-pass and bill-until-renewal facts and step 4 reading "Reassign first"); **view-as as a page mode with a banner**, not a panel; availability (Away until); the do-not-call **31-day clock**, critical, out of the door, with its 24-month review log; the **removal list** restored as `X-removal` with delete-everywhere's full consequence and the four-line sweep; the duplication rate beside the duplicate rule; the restricted-person rule stated under `pros.gdpr`; `mail.limits` as daily, hourly and minimum delay; the SDR's read access to the domain row; required-at-stage, deal warnings, forecast categories, targets, the submission window and renewal reminders in Pipeline and data; `plan.credit-breakdown` (one flat panel, three stacked breakdowns including **by surface**), `plan.team-budget`, `plan.spike-alert` (critical); the plan table gaining API/webhooks/CLI, MCP, Workflows and View-as rows, the corrected Reports row, the **preview rule** and the **one owning sentence about exports**; the lock panel gaining a last line naming what is still possible and an origin-prefilled "What are you trying to do?"; the ruleset gate's position; the no-overwrite line in Agents and AI. The §8 "three from Settings" miscount is corrected to name IA-MAP convention 1.

§4 was regenerated from `settings.ts` so the spec cannot drift from the code; seven pairs shape-checked, and the body band being over at every admin seat is named rather than tuned ("monthly work is what the middle of the distribution is").

## 7. `specs/15-connect-integration.md`

Applied: O1 (change 1), O3 (changes 14–18), L-48, L-51.

"Ollopa is our CRM" as a declarable answer on the CRM group, which empties Home's set-up list at Fathom and is reversible; the Salesforce permission requirement **above** the sign-in button (including that Essentials cannot connect); pre-mapped rows marked **suggested** and counted in the tab label, confirmed by saving the step; errors **grouped by cause**, largest first, with "Retry these 340" and the nine named causes; every retry stating its count and batching, with the group count as the confirmation; the field-mapping removal consequence raised at the pair before Save with the full pull offered there; the hand-over named by kind (a webhook goes to the developer area); and one line saying approvals are not webhook events.

## 8. `specs/16-workspace-setup.md`

Applied: O1 (changes 5 and 6). Founder-led now leaves out **Inbox, Campaigns, Accounts and Reports**, each with its named signal — the wider of the two lists two specs carried. Product-led leaves out **Sequences for the AE and the admin** and **Lists for the admin only**; the marketer keeps Lists, because segments are that business's daily work and a profile may subtract from a seat's sidebar but never override what the seat is for. `setup.ts`'s `setup.left-out` label and note follow.

---

## Skipped, with reasons

1. **`specs/17-requests.md`** (O5-6, O9-2, O9-3, O9-7, O10-6, and revops changes 26, 36, 45–49). The RevOps walk proposes a new spec at number 17; my brief assigns 17 to the developer surfaces, 18 to import and enrichment and 19 to workflows, and does not assign a requests spec to any editor. **Not written.** What belongs to Settings *was* applied: the strip keeps the line, the count and the cost and links into the queue, and the review action moved out of Settings. `P-requests` and `R-request` are still unowned — see cross-group dependencies.
2. **Spec number conflicts in three walks.** The SDR walk calls the import spec `17-import-and-enrichment.md` and its usage file `import.ts`; the marketer walk calls the workflows spec `17-workflows.md`. Applied at the numbers and filenames my brief fixes: `18-import-and-enrichment.md` / `enrichment.ts`, `19-workflows.md` / `workflows.ts`. No content dropped.
3. **RevOps change 35** ("Reports: Activity only / all five / all five, plus CSV export and the scheduled weekly email"). Contradicts PLAN.md's plan table, which gives Growth "all plus CSV export". PLAN.md outranks a walk (order of authority 1 over 4), and three other walks agree with PLAN.md. Applied as **Growth: all five plus CSV export; Scale: plus the scheduled weekly email**.
4. **Leader-dev change 24** ("the Forecast tab on Starter locks submission and roll-up"). Partly applied. A submitted forecast is a commitment, which rule 7 names, and the gated-features pattern puts decision-critical items on every plan — so the **tab and the submission are on every plan** (CS change 33's reading, and RULES.md outranks a walk). Only the **team roll-up** is locked, because teams are a Growth feature and there is no team to roll up on Starter. Both walks are satisfied on the part each was right about.
5. **Leader-dev change 2's wording** ("no change to `SEATS`", plus an `aePlus` key in `weekly`). Applied in substance, implemented as a `UsageRole` union so the key is type-checked; `ROLE_LABEL` covers it, as my brief requires, and `SEATS` is untouched.
6. **Marketer change 21** (three new panels under `S-scoring` in IA-MAP 2.14) and **marketer changes 2, 6, 10, 29, 30, 42; CS 3, 5, 7, 11; SDR C-27, C-31, C-34, C-41 to C-45; revops 4, 7, 19, 22, 23, 27, 47; leader-dev 9, 11, 12, 25, 28, 31, 34, 43, 47, 52 to 54, 59, 65, 66**. All target `IA-MAP.md`, which I must not touch. The three panels are specified in spec 14 §3.4 so the map edit is transcription, not judgement.
7. **Marketer change 27's Slack half, change 39; revops 2, 19, 28, 48; leader-dev 35, 44, 45, 46, 52; SDR C-15, C-38, C-39; agents 5, 11, 15, 16, 17, 18; CS 1, 2, 35**. Target `specs/00`–`11`, `JOURNEYS.md` or their usage files. Not mine. The settings- and agents-side halves of the paired changes were applied (the scoring stamp, the locked third agent, the surface breakdown, the domain read access).
8. **Agents change 11** (remove `AgentEvent.confidence` from the seed, in spec 01). Spec 01 is not mine. The spec-13 half is applied: no confidence badge, and the field is out of every door's contents here. The seed field still needs deleting by the owner of spec 01.
9. **Revops change 48 and O9-5** (the one announcement mechanism, across Home, the shell and the requests spec). The **workflows** half is applied — a routing change other people feel writes one line into their Home strip and next digest, expiring after seven days or on first contact — because spec 19 is mine. Home's strip and the digest list belong to specs 01 and 00.

---

## Cross-group dependencies

1. **`P-requests` and `R-request` have no spec and no owner.** Three RevOps journeys (O5, O9, O10) end there, the Settings strip now links into it, spec 19 states that intake requests live there rather than on Workflows, and spec 14's "Review an upgrade request" action was moved out of Settings into it. Somebody must write it — as `specs/20-requests.md`, or by reassignment — carrying the decision owner, the two separately-dated approvals, the state machine, the "applies to" staged-rollout scope, the rollback path in words, the verify count, and both request kinds in one queue.
2. **IA-MAP nodes my specs now reference and the map must carry.** `S-scoring`'s three panels `X-score`, `X-persona`, `X-signal` (spec 14 §3.4); `X-credits` opened from the credits pill on its own channel with a **surface** breakdown (spec 14 §3.3); `X-key → R-job`, filtered to that key (specs 17 and 18); `X-viewas` as a **mode** rather than a panel (spec 14); `S-developer` seats reading "OPS; MCP scope row: all" (spec 17 §3.12); `X-forecast` and `X-report-records` as **siblings** on `P-reports` rather than parent and child (spec 12 §6.2); `D-wf-runs` holding two sections rather than two doors (spec 19 §3.3).
3. **Fields defined in my specs and read by other editors' pages.** `AgentEvent.surface` and `actorUser` (spec 17 §2 → spec 13's ledger, spec 14's `X-credits`, spec 01's Home); `enrichmentJobs[]` (spec 18 §2 → spec 14, 17 and 19); `settings.team.users[].availability` (spec 14 → spec 19's routing rules); `Deal.forecastCategory`, `goals[]`, `forecastSubmissions[]`, `Deal.scoreAtFirstContact` (spec 12 §2 → specs 08 and 09); `RoleSeat.reports` (`businesses.ts` → specs 08, 09 and 12's AE+ columns).
4. **One figure computed once.** Win rate and required coverage (1 ÷ win rate) is computed in spec 12 at the foot of the stage-to-stage conversion door; spec 08's Deals board strip must read it rather than recompute it (leader-dev changes 5, 6 and 16).
5. **Import CSV is a page now.** Specs 02, 03 and 04 must drop the drawer body and keep the entry point only (SDR C-12); spec 18 §1 states the container decision.
6. **Templates.** `Page` gains `"templates"` so spec 05 §3.9's `P-templates` items can be written without another editor editing `model.ts`. Nothing registers a `templates.ts` yet.
7. **`USAGE-MODEL.md`** gained one paragraph defining AE+ (leader-dev change 3). The file was assigned to nobody; flagged in case another editor also edited it.
8. **`pages/SignIn.tsx`** keyed its seat list on `r.role`, now duplicated by Meridian's second AE seat. Changed to `r.user`. Outside my file list, but the defect was mine.
