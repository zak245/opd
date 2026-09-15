# Change log, group C

*Editor C. Specs 12 Reports, 13 Agents, 14 Settings, 15 Connect; usage files `reports.ts`, `agents.ts`, `settings.ts`, `connect.ts`; one new spec, 16 Workspace set-up, and one new usage file, `setup.ts`. `npx tsc -b` passes. One line per change, with the decision or finding that drove it.*

---

## 12 Reports (`specs/12-reports.md`)

| # | Change | Driven by |
|---|---|---|
| 1 | The fee statement "Exports and prints spend no credits" moved out of the Export menu onto the control bar, visible without a click, on every plan | RULES.md rule 7; REVIEW §4 ("point 1 scored 2 while the fee statement sits behind a door"); FTC 2022 dark-patterns report, which names a control-level disclosure as the mechanism of a deceptive act |
| 2 | New usage item `ctl.fee-line`, marked critical, in `reports.ts`; prose and code now both name four decision-critical items | REVIEW §3 ("names four in prose and marks three in `reports.ts`") |
| 3 | `outcome` (open/won/lost) deleted from the seed additions; won means the deal reached Closed won, lost means it was archived, using spec 09's `archivedOn` and `lostReason`; the Pipeline tiles say so | PLAN.md, 13 Sep 2026: five stages, no "Closed lost", no outcome flag |
| 4 | The Campaign entity is no longer redefined here: `channel` and `byAudience` deleted, spec 10's `Campaign` and `Audience` read as they stand, and only `dealsCreated` and `pipelineAmount` added | REVIEW §1.3 ("10 owns `Campaign`") |
| 5 | `bounceGuardThreshold` 3.5% deleted; the thresholds are Settings' single pair, warn 4% and pause 6%, with the observed 7-day rate per business from the Settings seed | PLAN.md, 14 Sep 2026, bounce guard; REVIEW §1.6 |
| 6 | Plan gating applied: Starter gets the Activity report, Growth all four, Scale adds CSV export and the scheduled weekly email. Locks sit on the tab and on the Export control, at the entry point; the forecast and the bounce rate print even on a locked report; a lock does not change an item's level | PLAN.md, 13 Sep 2026, plan gating; gated-features pattern rules 6, 7, 8, 9 |
| 7 | Overrides changed to match what each plan allows: Fathom pipeline 50→8, sequences 40→6, activity 40→55, steps 30→4, export 10→2; Halyard export 70→8 and print 30→65; Ridgeline marketer export 18→5; scheduled email locked | Same decision. The agency's weekly client report leaves as a PDF, and the gap is stated rather than hidden |
| 8 | New "Locked rather than removed" block, separating a thing that cannot exist here (no campaigns) from a thing this plan does not include | Gated-features pattern rule 1 |
| 9 | New "Locked report" state and a "What each plan includes" block in §3 | Same |
| 10 | Apollo problem 6 rewritten: the fault is not the gate but the gate told in documentation, with no way to see which reports your plan has and no admin named | Claims audit: Ollopa now gates too, so the criticism had to be made precise |
| 11 | Shape check recomputed from the code with one stated denominator (items that exist for that role at that business); a Fathom row added; the Halyard head stated at 40% and argued | REVIEW §3 ("Pick one rule" for the denominator) |
| 12 | Score line 1 rewritten; §7 gains a gated-features line; §8 gains five review rows | Follows from the above |

## 13 Agents (`specs/13-agents.md`)

| # | Change | Driven by |
|---|---|---|
| 1 | The approval decision applied in full and stated in §1: the object's owner approves, an admin may approve for anyone and is named in the ledger when they do | PLAN.md, 14 Sep 2026, agent approvals; REVIEW §1.7 |
| 2 | Low-cost reversible work (research, scoring, drafts saved not sent) is logged, never queued; per-item approval only for sending, spending over a cap, and moving a deal stage | Same |
| 3 | A second, admin approval above a threshold that is a Settings item, default 1,000 recipients or 500 credits in one action, with the item saying who it now waits for | Same; replaces the 5,000 hard-coded in spec 10 |
| 4 | Approvals arrive in one batch at a task boundary with the batch total stated, never mid-task | Same; Kuo et al., IUI 2026 (52% engagement at a boundary, 62% dismissal mid-task) |
| 5 | The rubber-stamping finding written into §1, the rules table, the score and lesson step 1: disclosure beyond review capacity equals hiding, so the queue is kept short on purpose | RULES.md rule 7 corollary; Chen et al., arXiv 2604.04918 (88.5% seen, 23.9% stopped); the 89%→68% review-rate field study |
| 6 | New section "What waits, and what does not", a five-row policy table | Same decision, made legible |
| 7 | New usage item `wait.second-approval` (critical) and `act.undo`; `wait.list` relabelled to name the batch; notes on `act.ledger` rewritten | The decision needs a control for "reversible", or the word is an assertion |
| 8 | Seed additions: `status` gains `waiting-second`; `decidedAsAdmin`, `ownerId`, `undoable`/`undoneAt`/`undoneBy` added; `ifApproved.action` narrowed to the four irreversible or costly actions | Same |
| 9 | Decision-critical count 7→8; shape check recomputed for six pairs on the stated denominator; the AE row replaces the three-role row | REVIEW §3 |
| 10 | Score point 9 now counts the decline rate per kind of item, because a queue nobody declines from is a queue nobody reads | Rubber-stamping finding |
| 11 | The "Agent settings" door label now lists the second-approval threshold | Consistency with 14 |

## 14 Settings (`specs/14-settings.md`)

| # | Change | Driven by |
|---|---|---|
| 1 | New area "How your team works", second after Workspace, holding the workspace profile and its three answers, which seats exist, the pages the profile leaves out with their signal counts, and the two-week exposure with its keep-or-drop question | PLAN.md, 14 Sep 2026, navigation, three kinds of "cannot see it", teaching by exposure |
| 2 | Four new usage items (`work.profile`, `work.seats`, `work.left-out`, `work.exposure`) | Same |
| 3 | New §2.3 with the Starter / Growth / Scale table, the prices, and which business is on which plan; the gating pattern stated, including that safety and decision-critical items are never gated and that no gate appears after work the user cannot keep | PLAN.md, 13 Sep 2026, plan gating |
| 4 | Meridian moved to Scale at $129 a seat: $5,418 a month, $65,016 a year. Prices shown as one total for the period, never a per-seat breakdown | Same; gated-features pattern rule 4 (CMA on partitioned pricing) |
| 5 | Fathom's teams, permission profiles, SSO, IP allowlist, territories, API keys, webhooks and own model key changed from removed (0) to locked (1) — visible where they live with a lock and the plan name; Ridgeline's "SSO Google" deleted, because SSO is Scale | Same; gated-features pattern rule 1. "0 means removed" is now stated in `settings.ts` |
| 6 | New item `plan.upgrade-requests`, marked critical, carrying requester, feature, plan, monthly cost, origin, reason and time; a line in the strip when any wait | Plan-gating decision ("adds one settings item"); pattern rule 5 (the approver is making a price decision) |
| 7 | New item `ai.second-approval`, marked critical: the threshold Agents and Campaigns read | PLAN.md agent approvals; REVIEW §1.7 |
| 8 | `mail.bounce-guard` relabelled "warns at 4%, pauses at 6%" and stated as the one pair for the product that every other page reads | PLAN.md bounce guard; REVIEW §1.6 and §2 |
| 9 | CRM per business fixed: Meridian Salesforce with custom objects, Ridgeline HubSpot, Fathom none (Ollopa is the CRM), Halyard one client CRM per workspace | PLAN.md, 13 Sep 2026, CRM per business; REVIEW §1.4 |
| 10 | Account stages stated as five, including "Do not prospect", owned here through `pipe.contact-stages` | REVIEW §1.2 |
| 11 | New item `me.notify-delivery`: digest or as-they-happen, Slack, push, mute and quiet hours in one row in "You", which is what the shell's notification panel links to; what you are notified about stays beside the thing that notifies | REVIEW §2 and §4, the open Notifications conflict (the page was deleted while 00-shell linked to it) |
| 12 | Item count 59 → 66; shape check recomputed for five pairs on the stated denominator; Halyard's head stated at 29% and kept as the named stretch case | REVIEW §3 |
| 13 | New states, actions and role rows for locked items, profile changes, seat changes, exposure answers and upgrade requests | Follows from 1, 3 and 6 |
| 14 | §6.7: the Get started checklist is no longer described as simply removed; it is replaced by spec 16 and by one row in "How your team works" | The fifteenth-page decision |
| 15 | Lesson steps 1, 4 and 5 rewritten to carry the total-price rule, the locked-versus-hidden distinction and the new area; no seventh step added | PLAN.md fixes six steps for this case (rules 7, 1, 2, 4, 5, 8) |
| 16 | Score lines 4, 6 and 8 rewritten; four review rows added | Follows |

## 15 Connect an integration (`specs/15-connect-integration.md`)

| # | Change | Driven by |
|---|---|---|
| 1 | The Fathom Salesforce paywall card deleted. Fathom has no CRM by choice, not by price; both CRM cards are ordinary unconnected cards and every plan syncs | PLAN.md CRM per business; REVIEW §1.10 and §4 |
| 2 | Seed integrations corrected: Fathom calendar and enrichment only, Meridian Salesforce production, Halyard one client CRM per client workspace and no calendar, Ridgeline HubSpot | Same; also closes REVIEW §1.5 on calendars from this side |
| 3 | Gated pattern rule 7 applied wherever a plan limit appears: the webhook lock on the card at step 1; one-way versus two-way sync named on the CRM card and on step 3's radio; custom objects locked in step 3's object list, never after a mapping is built | Plan-gating decision; gated-features pattern rule 7 |
| 4 | New usage item `wiz.custom-objects` (Scale, removed at Fathom); `wiz.webhook` Fathom 4→1 with its note rewritten | Same |
| 5 | New "Locked by plan" state, and a locked-control row in the doors table | Same |
| 6 | "Removed rather than hidden" now says selective sync is on every plan here, because a door that sometimes opens onto nothing is a door that lies | Rule 4 |
| 7 | Lesson step 2 reworded: the plan-gated door becomes either an ungated control or a lock at the entry point that opens onto a real panel | Same |
| 8 | Shape check recomputed (30 items) on the stated denominator | REVIEW §3 |
| 9 | Two review rows replaced or added, covering the deleted paywall card and the CRM disagreement between 14 and 15 | REVIEW §1.4 and §1.10 |

## 16 Workspace set-up (`specs/16-workspace-setup.md`, new)

| # | Change | Driven by |
|---|---|---|
| 1 | New spec, BRIEF.md's eight sections: three questions on one screen (what are you here to do first, how many people, which seats exist), producing one of four named profiles, which with the seat decides the sidebar and the level-one sets | PLAN.md, 14 Sep 2026, fifteenth page and navigation |
| 2 | A deterministic rule table from the three answers to the four profiles, and a table of what each profile leaves out, grounded in the usage files rather than asserted | Same |
| 3 | Declared, visible and editable later in Settings under "How your team works"; a left-out page still opens, offers "Add to sidebar", and returns for two weeks on a strong signal | Same, plus the three-kinds-of-cannot-see-it and teaching-by-exposure decisions |
| 4 | One screen rather than a wizard, because the three questions are interdependent and step count is the dominant variable | Nielsen on staged disclosure; Produktly 2026 step-count decay |
| 5 | "Before": Apollo's Get started checklist, the four progress rings, the "86% Completed" flyout, the "24% Completed" onboarding hub and Home's setup tab, cited to `07-apollo-settings-map.md` §1.0, §1.1 and §6 and to the Home Overview article | RECONCILE-BRIEF claims audit |
| 6 | "After": staged disclosure done right (one screen, one door, answers saved as typed, prefilled for the tenth workspace) and ProductLed's Eliminate / Delay / Mission-critical triage of the two dozen tasks | Same |
| 7 | New usage file `src/ollopa/usage/setup.ts`, 15 items, admin seat only, two marked decision-critical (seat cost; what the answers change and where to change them) | USAGE-MODEL.md |
| 8 | `| "setup"` added to the `Page` union in `model.ts` — the only edit made to that file — and `setupItems` registered in `index.ts` | Required by the new file |
| 9 | Self-score 16 of 18, with point 2 scored 1 because a one-sitting page has no usage distribution to check, and point 9 scored 1 because the review has not run | Honest scoring; REVIEW §4 on generous scores |

---

## Claims removed, corrected or marked unverified

| Claim | Where it was | What was done |
|---|---|---|
| `bounceGuardThreshold` 3.5% as a per-business threshold | 12 §2 | Removed. It was never a threshold; the thresholds are 4% and 6%, and 3.5% resembled an observed rate |
| Campaign `channel` (email, in-app, webinar, event) and `byAudience` | 12 §2, §3 | Removed. Spec 10's `Campaign` has neither, and nothing in the seed or the knowledge base supports them |
| Deal `outcome` (open, won, lost) and a "Closed lost" stage | 12 §2 | Removed; five stages only |
| "Report exports spend no credits" as a line inside the Export menu | 12 §3, §6, §8 | Kept as a claim, moved out of the door. The old justification ("the decision is made in that menu") was deleted as wrong |
| "Fathom — The Salesforce card reads 'Not on the Starter plan'" | 15 §3.6, §6, §8 | Removed. Fathom has no CRM at any price, and no source supports a Salesforce paywall there |
| "Fathom's founder builds her own automations, hence webhook 4" | 15 §4, `connect.ts` | Corrected. Webhooks start at Growth, so the number is 1 and the note says what she actually did |
| Ridgeline "SSO Google" | 14 §2.2 | Removed. SSO is Scale; Ridgeline is on Growth |
| Meridian "Growth · 42 seats · $3,318 a month" | 14 §2.1, §3.3 | Corrected to Scale, $5,418 a month, with the `businesses.ts` change named in the spec rather than made in the data file |
| Apollo's checklist as "24 tasks" | 16 §5 | Counted rather than repeated: four sections holding 4, 9, 2 and 8 tasks, 23 by my count of memo §1.1, with a note that the ring totals are **unverified** |
| Whether Apollo's two completion percentages ("86%" and "24%") measure the same tasks | 16 §5 | Marked **unverified**; both figures are quoted from the memo and nothing says how they relate |
| Whether Apollo branches its first run on any declared answer | 16 §5 | Marked **unverified**; nothing in the knowledge base describes one |
| Hotjar's "26% more likely to install" as evidence for persona routing | 16 §3, §7 | Used only as a method warning, with the confound and the forbidden Beginner/Intermediate/Advanced labels stated |

## For the owner

- `PRODUCT.md` still says the settings inventory is "about 45 items in 9 areas". It is now ten areas, and `settings.ts` holds 66 items. `PRODUCT.md` is outside this group, so it was not edited.
- `src/ollopa/data/businesses.ts` still has Meridian on Growth at $79 a seat. Spec 14 §2.1 names the change (Scale, $129); the data file is outside this group.
- `src/ollopa/nav.ts` has no entry for the set-up page, which is right — it is not in the sidebar — but the router will need the `setup` route.
