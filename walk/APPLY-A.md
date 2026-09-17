# Apply pass, editor A

Files owned: `specs/00-shell-signin-palette-notifications.md`, `01-home.md`, `02-people.md`, `03-companies.md`, `04-lists.md`, `05-sequences.md`, and `src/ollopa/usage/shell.ts`, `home.ts`, `people.ts`, `companies.ts`, `lists.ts`, `sequences.ts`. Nothing else was touched.

All seven walk logs were read. 56 changes applied, 4 skipped. `npx tsc -b` passes; the duplicate-id check returns `[]`; every shape check in the six specs was recomputed from the edited usage files rather than adjusted by hand.

---

## Applied

### From WALK-sdr

| Walk id | File | What |
|---|---|---|
| C-03 | `specs/03-companies.md` | The research door's first row is the latest run, carrying "Open the brief" and a provenance line in words (agent, date and time, sources, credits) |
| C-04 | `specs/02-people.md` | **Persona** added to the Person filter group and made a level-one chip for the SDR, reading Settings › Signals, scoring and personas, with the same control at the top of Find people |
| C-05 | `specs/03-companies.md` | Two exclusions at level one in the Find companies drawer, on by default for the SDR, each restating the count it removes |
| C-06 | `specs/04-lists.md` | The detail header prints what the count means as work: "1,240 people · about 9 weeks of touches for one rep at 19 a day", from the workspace's observed rate |
| C-07 | `specs/04-lists.md` | One sentence under each New list choice: frozen members; keeps matching, refreshes and can alert; opens the import wizard |
| C-08 | `specs/04-lists.md` | The filters door reads "Mode, source, archived ▾ (1 on)"; §6 doors table matched |
| C-09 | `specs/02-people.md` | The selection bar opens `X-enrich`: what to reveal with a price per option, the per-row estimate, total and balance after, and the do-not-call exclusion stated with its count and an override |
| C-12 | `specs/02`, `03`, `04` + `people.ts`, `companies.ts`, `lists.ts` | Import CSV opens the import wizard page (spec 17); the drawer body is struck from all three, and the three usage items say so |
| C-15 | `specs/00…` §3.4 | New digestible kind **Signal fired** (owner and subscribers; grouped per signal per day; opens People filtered to the signal) |
| C-16 | `specs/02-people.md` | **Job change · confirm and update** on the row and in the record header, each option with what it keeps, plus the line on the new employer |
| C-18 | `specs/05-sequences.md` §3.9 | New section owning `P-templates` and `R-template`: folders, owner, last used, used-by count; body with nested snippets named, "Used by 4 steps and 1 campaign" as a section, preview on a real contact, test send; seats SDR, AE, MK, OPS; no default sidebar slot |
| C-19 | `specs/05` §3.3 | **Use a template ▾**, inserting and closing like the variable menu, with Link and Copy each carrying its consequence, and a read-only line on a linked step |
| C-20 | `specs/05` §3.3 | Variant progress before any verdict ("A 96 of ~200 … not enough to call yet") and, past it, "Promote A · turns B off for everyone in this sequence"; an agent may propose, never promote |
| C-21 | `specs/05` §3.4 | Each mailbox's daily limit, sent today and sequences sharing it in the picker; the day-one volume under the skipped-people preview |
| C-22 | `specs/05` §3.4 | Rotation offered once: the panel names the sequence default and says a change applies to this batch only |
| C-30 | `specs/05` §3.3 | The LinkedIn step holds the **message text** with the variable menu, not a note the task will show |
| C-38 | `specs/00…` §3.4 | The bounce-guard row opens the paused sequence at its health line; a mailbox-level trip opens Settings; the row keeps both numbers |
| C-39 | `specs/01-home.md` | The bounce item links to the paused sequence, to Sequences filtered to Auto-paused, or to Settings, named as three cases |
| C-41 (spec half) | `specs/02-people.md` | The contact record's activity is the main timeline with filter chips (object state, no level); no "All activity" door; `X-calllog` opens from a call item |
| C-47 | `src/ollopa/usage/people.ts` | `people.enrich-panel`, `people.dnc-exclusion` (critical), `people.f.persona`, `people.job-change-update` |
| C-48 | `src/ollopa/usage/lists.ts` | `lists.touch-estimate` |
| C-49 | `src/ollopa/usage/sequences.ts` | `seq.use-template`, `seq.variant-progress`, `seq.promote-variant` (critical), `seq.mailbox-capacity` (critical), plus `seq.rotation-default` and `seq.steps.linkedin-message` that C-22 and C-30 require |

### From WALK-ae

| 11 | `specs/01-home.md` | "Needs attention (n)" is the first line of the Pipeline section, linking to Deals filtered to the warnings spec 08 owns |
| 12 | `specs/01-home.md` §4 + `home.ts` | `home.pipeline.warnings`: AE 70, admin 25, CS 10; Ridgeline AE 45; Fathom admin 40 |

### From WALK-marketer

| 11 | `specs/00…` §3.2 | Product-led growth row rewritten (merged with RevOps 6, below) |
| 24 | `specs/02-people.md` | **Score** (bands plus "Above the MQL threshold") in Reach and **Persona** in Person; the door becomes "All filters (33)"; a second seeded Meridian marketer view, "Above the MQL threshold" |
| 25 | `people.ts` | `people.f.score`, `people.col.score`; `people.f.persona` carries both walks' numbers in one item |
| 27 (spec 00 half) | `specs/00…` §3.4 | A "Slack and the digest" block naming the Slack event kinds, with "scoring threshold published" off by default |
| 27 (spec 02 half) | `specs/02-people.md` | "Threshold 62, published 12 Sep by Grace Mwangi" printed beside the Score chip |
| 39 | `specs/01-home.md` + `home.ts` | Two marketer lines in the Campaigns section (routing with the SLA window and the unrouted count; forms with the enrichment spend against the cap, critical), linking to the workflow and never to Tasks. `home.campaigns.routing`, `home.campaigns.forms` |
| 45 | `specs/02-people.md` | The form submission's answers are a note "Form: {name}, {date}" at level one while the stage is pre-first-touch, marking asked and enriched fields |
| 52 | `specs/00…` §3.2 | Marketer sidebar gains Workflows; `g w` added to the keyboard map |

### From WALK-cs

| 1 | `specs/00…` §3.4 | Two digestible kinds: **Hand-off received** and **Account signal**, with their grouping, row text and destinations |
| 3 (mirrored) | `specs/00…` §3.4 | The Slack list in the new block carries **account signal**, so the spec matches the map change CS 3 asks for |

### From WALK-revops

| 2 | `specs/01-home.md` | The CRM row leaves the setup list when "ollopA is our CRM" is declared, reversibly; the door is removed when the list empties; Fathom's §3.8 line rewritten |
| 4 (map, mirrored) | `specs/01-home.md` + `home.ts` | The setup door is "Not set up yet: mailbox, CRM, invites (3)" — contents then count, no fraction, no percentage |
| 6 | `specs/00…` §3.2 | Product-led growth leaves out Sequences for the account executive **and the admin**, and Lists for the admin; the marketer keeps Lists |
| 19 | `specs/00…` §3.4 + `shell.ts` | Sync error becomes **digestible** with a cadence choice on the integration; exactly three interrupting kinds — bounce guard tripped, second approval over the threshold, credits low; the mute sentence, the Toasts line, §6 and the `shell.toast` label all matched |
| 20 | `specs/02-people.md` + `people.ts` | A shipped saved view, "Needs enrichment", with its count and its feed into `X-enrich` and the import wizard (`people.views.needs-enrichment`) |
| 22 (map, mirrored) | `specs/02-people.md` | The columns door carries its count: "Columns and density · 6 of 25 ▾" |
| 28 | `specs/00…` §3.2 + `shell.ts` | The credits pill opens `X-credits` over the current page on its own channel, flat, with spend by feature, person and surface; the Settings anchor stays as a second route |
| 38 (sequences half) | `specs/05` §3.5 + `sequences.ts` | "Save as a reusable ruleset · Growth" sits at the top of the ruleset block from the moment the door opens, locked and priced; the per-sequence rules save normally underneath (`seq.settings.save-ruleset`) |
| 48 | `specs/00…` §3.4, `specs/01-home.md`, `home.ts` | One announcement mechanism: a workspace change other people feel writes one line into the affected people's Home health strip and next digest, expiring after seven days or on first contact (`home.health.announcement`) |
| "transcription, not judgement" note | `specs/00…` §3.2, §4, §6 + `shell.ts` | The admin sidebar now carries thirteen entries with Workflows and Requests in the map's order; `nav.workflows` and `nav.requests` added; `g q` added for Requests; the Founder-led and Agency profile rows updated; the shape check's "thirteen sidebar rows" becomes fifteen |

### From WALK-leader-dev

| 35 | `specs/01-home.md` + `specs/00…` §3.4 + `home.ts` | A saved coaching note appears on the rep's Home as "Feedback on your calls" and as a digest line, never a bell kind (`home.activity.coaching`) |
| 45 | `specs/00…` §3.2 | Same change as RevOps 28; applied once |
| 46 | `specs/00…` §3.2 + `shell.ts` | The pill prints the run-out date when it falls inside the billing period: "4.1k credits · 2.3k/wk · out 26 Sep" |
| 52 | `specs/00…` §3.4 | The digest gains a failing webhook subscription with its failure count and cause |

### From WALK-agents

| 1 | `specs/04-lists.md` §3 and §6 | The standing agent watch as a sibling level-one line with its weekly credit cost and its own off switch, and in the decision-critical list |
| 2 | `lists.ts` | `lists.agent-watch` (critical) |
| 4 | `specs/03-companies.md` | "Agent research, and the brief it produces": actor and run time, sources with links, the run's credit cost on the record, "Research again · 12 credits", no doors (see the skipped note on ownership) |
| 5 | `specs/01-home.md` + `home.ts` | One level-one line above the weekly door when a research agent ran overnight, for seats at 20 or above (`home.agents.brief-digest`); nothing reorders |
| 11 | `specs/01-home.md` §2.2, §3.1, §6.3 | `confidence` removed from `AgentEvent` and replaced by `inputs`; the door content becomes the draft, its sources and what it was built from |
| 15 | `specs/01-home.md` §6.3 + `home.ts` | The door is "Read the draft · 142 words · 3 inputs", the same label and contents as spec 13's item door |
| 24 | `specs/01-home.md` §3.5, §6.5 | The palette command reads "Review 6 waiting · 4 emails · 8 credits" and opens the batch focused; no palette command approves |
| 26 | `specs/01-home.md` §3.1, §3.2 | The batch button carries its whole consequence ("Approve 6 · send 4 emails, add 2 to sequences · 8 credits") and is inactive until every item has been expanded or scrolled past once, with the reason beside it |
| 31 (Home half) | `specs/01-home.md` §6.8 q9 | Home also counts decline rate and expand rate per role and business on approval rows |

---

## Skipped, with the reason

1. **WALK-leader-dev 30** (`specs/02-people.md`: "Recent activity is a section; 'All activity · n' is the door onto the full list"). Conflicts with **SDR C-41**, which removes the activity door from the contact record. C-41 was applied. Reason: PLAN.md's records decision (14 Sep) puts related lists as scrolling sections and doors only for "long rarely-needed content"; a contact's activity is what the record was opened to read, so a door there is disclosure debt (rule 1), while the timeline's filter chips are object state and cost no level (rule 6). Leader-dev's rule-2 argument does not apply, because a scrolling section is not a second level. Note that the same walks agree in the *other* direction for companies (CS 11 adds `D-co-activity` to `R-company`), and spec 03 keeps its "All activity · 48" door untouched.
2. **WALK-cs 2** (keep the spec's four interrupting kinds, correct the map to four). Conflicts with **RevOps 19**, which was applied: a sync error interrupts nobody, nothing is sending because of it, and the failure count is already level one in two places. The substance of CS 2 — that the spec and IA-MAP part 1 must agree — is satisfied, but they now agree on *three*, and the three are not the map's current three (see dependency 1).
3. **WALK-marketer 11, the "Lists for the account executive" half.** The account executive's seat carries no Lists entry at all (spec 00 §3.2 sidebar table), so there is nothing for a profile to leave out. Only "Lists for the admin" was applied, which is what RevOps 6 measured (Ridgeline admin 15, under the line).
4. **WALK-agents 4 as a full record section in `specs/03-companies.md`.** IA-MAP §6.5 and SDR C-45 assign `R-brief` to spec 09 §6.8, and CS 32 writes the template there. Spec 03 now carries the entry point, the provenance line, and the four things the companies page owns (actor and run time, sources with links, the run cost on the record, "Research again · 12 credits", no doors), and says explicitly that the template is spec 09's. Applying the change in full would have produced a second brief record.

---

## Cross-group dependencies

1. **IA-MAP part 1, the bell.** It reads "three interrupting kinds only — bounce guard tripped, sync error, credits low". The three are now **bounce guard tripped, a second approval over the threshold, credits low**; sync error is digestible with a cadence set on the integration. Spec 00 §3.2, §3.4, §4 and §6 are all written that way.
2. **IA-MAP part 1, Slack.** Two walks each added "a sixth kind" — marketer 27 (scoring threshold published, off by default) and CS 3 (account signal). Both are applied, so spec 00 now names **seven**. The map's list must match.
3. **IA-MAP part 1, the digest.** Spec 00 §3.4 now lists a failing webhook subscription (leader-dev 52), a coaching note (leader-dev 35) and the workspace-change announcement (RevOps 48) alongside the existing lines.
4. **IA-MAP §2.2 `D-home-setup`.** Spec 01 and `home.ts` render "Not set up yet: mailbox, CRM, invites (3)" and the declared-away CRM row; RevOps 4 makes the same change on the map.
5. **Spec 09 §6.8 must define the brief record template** (header, sections, source door, per-section authorship). `specs/03-companies.md` links to it by name and defines only the companies-side contents.
6. **Spec 17 (import and enrichment) must exist.** People, Companies and Lists all now state that Import CSV opens the import wizard page and ends on the job record, and `specs/02` specifies `X-enrich` while the job record belongs to spec 17.
7. **`P-templates` and `R-template` are now owned by spec 05 §3.9**, with six items in `sequences.ts` under area "Templates". IA-MAP §6.5 should record spec 05 as their owner. No `Page` union value is needed: the items carry `page: "sequences"`.
8. **Spec 14 must ship `S-scoring`** (Settings › Signals, scoring and personas). Spec 02's Persona and Score filters read their definitions from it and print the published threshold beside the Score chip.
9. **Spec 07 owns `X-calllog` and spec 06 owns `X-meeting`.** Spec 02's record timeline opens `X-calllog` from a call item, in read and log modes, with the transcript block removed where no integration supplied one.
10. **Spec 08 owns the six deal warnings and their thresholds.** Home's "Needs attention (n)" links to Deals filtered to them, and `home.pipeline.warnings` cites spec 08 in its note.
11. **Spec 10 and spec 17 own routing and forms.** Home's two marketer lines link into the workflow and the form record, never to Tasks.
12. **Spec 16 (workspace set-up)** should match spec 00's profile table: Founder-led now also leaves out Workflows and Requests, and Agency leaves out Workflows, per IA-MAP §2.7 and §2.11 sidebar columns.
13. **`seq.rulesets` already exists in `settings.ts`** (spec 14, RevOps 38's other half). The sequences-side item is `seq.settings.save-ruleset`, so the duplicate-id check stays clean.

## Numbers that moved

Every shape check was recomputed with `weeklyUse()` and `bandOf()`, not estimated. Item counts: `shell.ts` 80 → 85, `home.ts` 39 → 45, `people.ts` 114 → 121, `companies.ts` 78 → 82, `lists.ts` 51 → 53, `sequences.ts` 60 → 73. The prose under each table was rewritten where the new figure changed the reading — Meridian's SDR now sits at 27% on the shell without navigation, Meridian's admin one point over the band on Home, and Halyard's sequences head at 34%, which templates and mailbox capacity explain.
