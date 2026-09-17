# Closing the cross-group dependencies

*16 September 2026. The four apply logs (`APPLY-A`–`APPLY-D`) each ended with a list of things another editor had to land. This pass closes every one of them that is a text consistency matter between `specs/00`–`specs/19`, `IA-MAP.md` and `JOURNEYS.md`. Nothing under `src/`, and no line of `PLAN.md`, `PRODUCT.md` or `RULES.md`, was touched. Order of authority as the apply brief sets it: PLAN.md §2, then RULES.md, then IA-MAP part 6, then the walk's stated rule.*

**27 dependencies closed by an edit. 19 verified already closed. 5 left open, every one of them needing a file this editor does not own.**

---

## 1. Closed by an edit

### The map

| # | File and section | What now reads |
|---|---|---|
| 1 | `IA-MAP.md` part 1, *Notifications: Slack* | **Seven** event kinds, not six: reply received, meeting booked, deal moved, agent needs approval, sync error, account signal, **scoring threshold published**, the last one off by default because it fires for the workspace rather than for one person. Closes APPLY-A dependency 2 (marketer 27 and CS 3 each added "a sixth"; spec 00 §3.4 already named seven) |
| 2 | `IA-MAP.md` part 1, *Notifications: the email digest* | The digest gains the **coaching note** ("Feedback on your calls") and the **workspace-change announcement** with its seven-day expiry, so the map's eight lines are spec 00 §3.4's eight lines. Closes APPLY-A dependency 3 |
| 3 | `IA-MAP.md` §6.5, ownership table | `P-requests` and `R-request` are assigned to **spec 20, requests**, in place of "a fourth new spec, numbered after 19". Closes APPLY-C dependency 1 and APPLY-D dependency 1 |
| 4 | `IA-MAP.md` §6.5, ownership table | `X-meeting`'s owner reads "spec 06 §3, *Book and run the meeting*" — the section that exists — instead of "spec 06 §3.6" |
| 5 | `IA-MAP.md` §6.4a | **Workflows** is recorded as the sixth Founder-led omission and the Agency's third, taken from `P-workflows`'s own sidebar column in 2.11 (SEP, PLG) rather than argued as a profile question; Fathom is on Starter and the page is Growth-gated, Halyard's routing lives in the client's systems, and the signal is the first workflow anybody creates. PLAN.md's five-page decision is left standing as the resolution of the three written lists; the node table settles the sixth. Closes the gap APPLY-D dependency 7 and the instruction's item 5 opened between §6.4a and spec 00 §3.2 |
| 6 | `IA-MAP.md` §2.3 | `D-people-filters` reads "All filters (33)" and `D-people-columns` "Columns and density · 6 of 25 columns", matching spec 02 §3 and §6 after marketer 24 and revops 22 landed. The map's own preamble gives the specs the door labels and keeps the nodes, so the map followed |
| 7 | `IA-MAP.md` §2.5 | `D-lists-filters` carries its active count — "Mode, source, archived (n on)" — matching spec 04 §3 and §6 after SDR C-08 |

### The specs

| # | File and section | What now reads |
|---|---|---|
| 8 | `specs/16` §3, profile table | **Founder-led outbound** leaves out Inbox, Campaigns, Accounts, Reports, **Workflows and Requests**, each with a named signal (first reply; first audience or campaign; first deal reaching Closed won; first full week over ten sends; first workflow created; second upgrade request in a week) |
| 9 | `specs/16` §3, profile table | **Agency** leaves out Campaigns, Accounts and **Workflows**, with the first workflow created as its signal |
| 10 | `specs/16` §3, the corrections paragraph | Now three corrections, not two, and the third states why Workflows and Requests were missing and which file settles each. Both lists match spec 00 §3.2 |
| 11 | `specs/16` §3 accessibility, §3 by-business (Fathom), §8 review | The live-region announcement, Fathom's set-up row and the review row all name the six-page list; Fathom's row adds that Workflows is locked at Starter as well as left out |
| 12 | `specs/02` §3.1, header | Import CSV opens the import wizard page at **[18 Import and enrichment]**, not "spec 17". Closes APPLY-A dependency 6 / APPLY-C dependency 5 / APPLY-D dependency 1 (four walks each proposed a `specs/17`) |
| 13 | `specs/03` §3, page actions | Same pointer corrected to **18**, and the paragraph cut back to the **entry point only**: the five steps, the ten-row credit trial and the job record are spec 18's, and this page holds "no drawer body, and no second copy of the flow" |
| 14 | `specs/03` §6.2, doors table | The Import CSV row points at **18** and says the entry point is all this page owns |
| 15 | `specs/04` §3, New list | Same pointer corrected to **18** |
| 16 | `specs/03` §3, *The record has two levels* | The quick look is stated as the **same `Q-company` Accounts opens from its own rows**, rendered there with the customer-state field set and the four health drivers as flat lines directly under health — so a score is never across a door from its reasons. Closes APPLY-B's `Q-company` gains `P-accounts` dependency on the spec side |
| 17 | `specs/03` §6, *The record page* | The header **switches on the customer state** (health and band, renewal and days left, contract value, open risks, last touch, next step when `Company.stage` is Current client or Churned) and `/ollopa/accounts/:id` redirects here. Closes APPLY-B's "spec 03 must render the customer-state field set" (cs 8) |
| 18 | `specs/03` §6, *The record page* | A **customer-state sections block** in order — health drivers, renewal terms, first value and goals, open risks, expansion signals, the hand-off brief, touches, usage over 90 days, seats and last sign-in — with the drivers as a section directly under the health field, pointing at spec 11 §3 for the description and spec 09 §6.8 for the definition |
| 19 | `specs/03` §6, *The record page*, and §6.2 *Record doors* | The **eight doors spec 09 §6.8 names**, replacing the old nine: All activity · 48, Agent research · 3 runs, Signals and news · 3, CRM sync · synced 09:10, Parent and subsidiaries, Full history / custom fields and files, Enrichment (a drawer), and the one tab "People (n)". Custom fields, history and files are one door, not three. **"Open the brief"** stays the research door's first row with its provenance line. Closes APPLY-B dependency on spec 03 (cs 10, cs 11, sdr C-03) |
| 20 | `specs/03` §6, *Removed, not hidden* | **Similar companies** joins Locations in the removed list, as a door onto a guess |
| 21 | `specs/01` §3, Pipeline | "Needs attention (n)" now links to the six warnings **defined once in 09 §2**, with thresholds set by the admin in Settings › Pipeline and data and the board rendered by 08; Home counts them and states nothing of its own. Closes APPLY-A dependency 10 and APPLY-B's "one fact, one owner" for the warnings |
| 22 | `specs/01` §4, usage table | The "Needs attention" row names 09 §2 as the definition and 08 as the renderer |
| 23 | `specs/01` §3, actions table | **Book a meeting** opens Inbox on that thread with the merged `X-meeting` panel (spec 06 §3, proposed → booked → held / no-show / cancelled); Home holds no booking form of its own. Closes the `X-book` deletion on the Home side |
| 24 | `specs/14` §3 (Pipeline and data) and §4 (`pipe.deal-warnings`) | Deal warnings are **defined in 09 §2 and read here**; this area owns only the thresholds and their observed values |
| 25 | `specs/08` §3, forecast strip | The coverage pair is **read, not recomputed**: win rate and required coverage are computed once in spec 12 at the foot of the stage-to-stage conversion door and this strip prints the same figure word for word. Closes APPLY-C dependency 4 |
| 26 | `specs/06` §3, *Shown* | The page is stated as **master-detail**: the list stays in view, the thread is the open half of the page and not a disclosure, so `X-thread` is level one and its filters, agent draft and composer are the one level below it (IA-MAP 2.7) — never drawn as a panel opened from inside another. Closes APPLY-D dependency 4 on the Inbox side |
| 27 | `specs/13` §3 (phone), §6 (level-two list, doors table, phone sheet) and §7 (lesson step 2) | The agent filter door carries **surface** in every label, matching `D-agent-filters` in IA-MAP 2.13 and spec 13's own §3 desktop label |

## 2. Verified already closed, no edit needed

| Dependency | Where it already reads correctly |
|---|---|
| `X-book`, `D-acct-health` and `D-person-activity` appear in no spec | Checked across `specs/00`–`19`: none of the three ids occurs. The only occurrences anywhere are IA-MAP's own deletion records (parts 2, 4, 5) |
| The meeting replaces booking in substance | `specs/06` §3 *Book and run the meeting* owns `X-meeting` with its five states; `07` §3 renders it from a meeting task row (never from inside the row door); `09` §6.8 renders it from the meeting card. No spec holds a second booking panel |
| Drivers are flat lines and a section, not a door | `specs/11` §3 (quick look, and the record's health-drivers section with its "This flag was wrong" control); `09` §6.8's Company row; and now `03` §3 and §6 |
| The contact timeline is the record | `specs/02` §3 states it in full and names the absent door; `09` §6.8's Contact row repeats it; `12` §3 drills from a call row straight into the call |
| `X-viewas` is a page mode with a banner | `specs/14` §3 Team and access, §6 doors table, §8 review |
| `X-agent-edit` is an in-place edit state | `specs/13` §3 actions and §6 doors table: the draft opens in place inside `D-agent-item`'s content |
| `X-reply` is a door with `R-deal` as a parent | `specs/09` §3 actions ("the composer's Email **is** the reply panel"); `06` §3 asserts the same from the thread side |
| `Q-company` has `P-accounts` as a second parent | `specs/11` §3, and IA-MAP 2.4's parent cell; now also `03` §3 |
| `Q-deal` has one editable field by ownership | `specs/08` §3 and §6; `09` §6.8's Deal row and the quick-look paragraph |
| Three interrupting kinds | IA-MAP part 1 *the bell*; spec 00 §3.2 (Toasts), §3.4 and §6 all name the same three |
| Thirteen RevOps sidebar entries | `specs/00` §3.2 seat table (Home, People, Companies, Lists, Sequences, Deals, Campaigns, Accounts, Workflows, Requests, Reports, Agents, Settings); the shape check's fifteen navigation rows is the union across seats and is consistent |
| `P-templates` and `R-template` owned by spec 05 | IA-MAP §6.5; `specs/05` §3.9 |
| Specs 17, 18, 19 numbered as the map assigns | IA-MAP §6.5; every remaining "spec 17" reference in `13`, `14`, `15` and `18` means developer surfaces, which is correct |
| CSV export on Growth, scheduled email on Scale | Owned in one sentence by `specs/14` §3 (plan table and the export sentence); rendered by `12` §3 and §6, `07` §3 (a table export, every plan) and `17` §3 (the CLI) |
| A reply draft approved in the Inbox composer does not also queue | `specs/13` §3 states it; `06` §3 asserts it from the other side |
| Spec 05's LinkedIn step carries the message text spec 07 renders | `specs/05` §3.3 ("the message text itself", with the variable menu); `07` §2 and §3 render it and say it is written once on the step |
| A form submission's answers are a level-one note pre-first-touch | `specs/02` §3; `10` §3 writes the note |
| APPLY-B's map list | `D-deals-filters` wording, `X-report-records` with `R-audience` as a second parent, `D-task-filters` and `D-camp-filters` relabelled "Additional filters: … (n)", and S9 and S10 walked in queue mode are all already in IA-MAP 2.9, 2.12, 2.8, 2.10 and part 5 |
| `JOURNEYS.md` | Consistent with all of the above: C1 reads the logged calls and the transcript where an integration supplied one, L3 carries its recorded-reduction line, G3 writes the score in place, D1 and D3 carry the remote-approval and scope-gate wording, and §1 carries the comment-is-an-attribute paragraph. No node ids, spec numbers, Slack kinds or digest lines appear in it, so nothing there needed changing |

## 3. Left open, and what each needs

1. **`specs/20-requests.md` itself.** IA-MAP §6.5 now names spec 20 as the owner of `P-requests` and `R-request`, and `specs/11` §3, `14` §3 and `19` §1 all link into the queue. The file is being written by another editor; nothing more can be done from here.
2. **`src/ollopa/usage/companies.ts` has not caught up with spec 03's record doors.** The file still carries `rec.lookalikes` ("Similar companies", weekly 4/2/1/1 and a Fathom override) for a door this spec now removes, and `rec.fields`, `rec.files` and `rec.lists` as three items behind one door. It also carries no customer-state items at all — no health, no drivers, no renewal — although the record now renders them, and no enrichment item. Spec 03 §4's usage table and its four-pair shape check are transcribed from that file and were left exactly as the file stands, so §4 and §6 describe slightly different door sets until the usage file is edited. `src/` is outside this editor's file list.
3. **No node in IA-MAP 2.4 holds the company record's Enrichment drawer.** Spec 09 §6.8 has named it since the apply pass (cs 10) and spec 03 now renders it, but the map holds only `D-person-enrich` on `R-person`. Adding `D-co-enrich` is a node change, not a text consistency matter: it moves part 2's totals off 147 and needs the part 4 level check re-run per seat. Flagged rather than done.
4. **PLAN.md's "Founder-led omissions" row lists five pages and does not name Workflows.** IA-MAP §6.4a now records Workflows as a sixth omission that the node table settles rather than the profile decision, and says so explicitly so the two files do not read as contradicting each other. Making PLAN.md's row say six is the owner's call; PLAN.md is not editable from here.
5. **PLAN.md's "The whole app first" row still reads "all fourteen pages".** Editor D flagged it and left it; it is still open, and still not this editor's file.

## 4. One thing worth stating

Every edit above moved words, not structure. No node was added or deleted, no level changed, no usage number was touched, and no shape check was recomputed — because every one of these dependencies was two files saying different things about a decision that had already been made. Where two of the files this editor owns disagreed, the tie was broken by the order the apply brief sets: PLAN.md's decisions first (the three interrupting kinds, the contact timeline, the Founder-led list), then RULES.md (rule 5 for the health drivers, rule 7 for the coverage pair and the credit trial, "one fact, one owner" for the warnings and the win rate), then IA-MAP part 6. The one place the map yielded to a spec is door **labels** and their counts, which the map's own preamble hands to the specs; the one place a spec yielded to the map is the **existence and parent** of a node, which is the map's.
