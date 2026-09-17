# The journey walk: the SDR seat, S2 to S13

*Walked 15 September 2026 against RULES.md (eight rules, three named patterns, the nine-point score), PLAN.md section 2 including the S1 decisions, IA-MAP.md parts 2, 3, 5 and 6, JOURNEYS.md, and sections 3, 6 and 7 of the specs each journey touches. Twelve journeys, stop by stop. Every issue is followed by the change that closes it and the rule that decides it. No open questions; the consolidated change list is at the end.*

## What the walk found, in one paragraph

Eleven of the twelve journeys break, and they break for one reason, not twelve. IA-MAP §6.5 says in writing that nine nodes created by the widened boundary must still be absorbed by the specs — `X-calllog`, `X-linkedin`, `X-meeting`, `R-form`, `R-brief`, `P-workflows`, `P-requests`, `S-scoring`, `S-developer`. Five of those nine are SDR nodes, and they carry the SDR's three largest activities: the call and its disposition (44 dials a day), the LinkedIn touch (a fifth of the activity budget), and the booked meeting with its handoff (the only seam between SDR and AE). Two more level-1 nodes the map created, `W-import`/`R-job` and `P-templates`/`R-template`, are in no spec either. Where a spec does exist the disclosure work is good: the pages score 16 to 17 of 18 on their own rubrics and almost every door is already labelled by its contents with a count. So this walk proposes few reversals and many additions: 51 changes across twelve spec files (one of them new), the map and the usage model. The four genuine rule violations found inside existing specs are one three-level path (the Inbox thread, §S11), two dependent pairs split by a door (§S4, §S8), and one door that does not deliver on its promise (the bounce-guard notification, §S13).

**Carried from S1.** Tasks opens in queue mode for the SDR and AE seats with the list as the door; the digest is off by default for SDR and AE; "Approve all" carries the total consequence in its label and requires each item to have been expanded or scrolled past once. S9 and S10 depend on the first of those and it is not yet in spec 07, so it appears in this change list too, marked *carried from S1 — apply once*.

**Judgement used throughout, as accepted on S1.** Density wins for all-day seats. Declared beats inferred. Exposure beats hints. Fewer, better-placed approvals beat more of them. Doors are labelled by content. The quick look is the top of the record cut short. The sidebar is declared.

---

## S2 · Research an account and write the plan

*Fathom Labs, weekly. Seat: founder on the OPS+SDR pair, Starter plan, no CRM. Map walk: `P-companies` → `Q-company` → `R-company` → `D-co-research` → `R-brief` → `R-company` → `D-co-signals` → `X-findpeople` → `X-listadd` → `X-note` → `X-task`.*

### The stops

| Stop | What is visible first, for this seat at this business | The doors, and what each holds | Container | The one thing that must stay in sight |
|---|---|---|---|---|
| `P-companies` | The company table: search, chips Stage, Industry, Employees, Signals; columns Company, Contacts held, Stage, Last activity, Industry, In a sequence; row actions Find people, Add to list, Research · 12 credits, Open; "Find companies" as the primary button. No Owner chip and no CRM items: Fathom has neither. | "Additional filters: owner, location, activity, signals, lists, fields (n on)"; "Columns: 7 of 20"; "Views"; the row menu "Actions for {company}"; the page menu "Import, export all, merge, alerts" | In place, popover, popover, menu, menu | The credit balance in the pill and the 12-credit price printed on Research. At Fathom this is the founders' own money. |
| `Q-company` | The quick look: name and domain, stage, owner, contacts held, contacts in a sequence, last activity, open deals. Flat, read-only except the stage badge. | none, by definition | Drawer beside the table | That removing this drawer would cost only speed — it holds no feature of its own. |
| `R-company` | Header (name, domain, stage, owner, last activity, industry, size, location, founded) and the sections: contacts at this company, open deals, recent activity, notes, open tasks. | Below the sections, in usage order: "All activity · 48", "Agent research · 3 runs, last 2 Sep, 12 credits a run", "Signals and news · 3", "Custom fields · 2", "Parent and subsidiaries", "Similar companies", "Files · 0", "Lists · 2". "Expand all" above the group. CRM sync removed here. | In place | Who wrote what. A page that mixes a founder's notes with an agent's claims has to say which is which. |
| `D-co-research` | The runs: date, what was asked, credits spent, and the latest brief in summary. | — | In place | The cost per run, in the label, before it is opened. |
| `R-brief` | **Nothing. No spec in the set defines a brief.** | — | — | — |
| `D-co-signals` | The named signals with their freshness and talking tips. | — | In place | How old the signal is; a signal three weeks old is a history report. |
| `X-findpeople` | Find people at this company: filters, a live count, Save and results, the cost line "1 credit per verified email". | — | Panel | The price, and that saving is free while revealing is not. |
| `X-listadd` | Pick a list or type a new one; the toast links to the list. | — | Panel | How many were added and to what. |
| `X-note` | The angle, written on the company. | — | Panel on any record | — |
| `X-task` | Contact, type, due, title, note, owner. | — | Panel | The due date; this is the commitment the research was for. |

### Issues

1. **A silent gap where the whole journey lands.** `R-brief` is a level-1 record in the map and appears in eight journeys, and no spec mentions it. The journey step is "read the agent brief **and its citations**", and 17§9 makes the distinction between "the agent ran" and "the agent was right" the trust problem of the whole product. Without the brief there is nowhere for a citation to live. *Rules 1 and 7: the evidence a decision rests on is decision-critical, and this is a weekly task for this seat.*
2. **Two specs disagree about this record.** Spec 09 §6.8 gives the Company row a tab, "People (48)", and a "Locations" door. Spec 03 §6 says this record uses no tab (its largest related list is 40 contacts in a section with "Show all 40") and removed Locations as a single field outside the boundary. A template that disagrees with the page spec will render the tab the page spec deleted. *The record pattern: at most one tab, and only for a related table big enough to be its own page.*
3. **The research door carries its cost but not its provenance.** The label says runs and credits; the content must say when, by which agent, on how many sources, and every claim must carry the source it came from. *Rule 7 corollary: disclosure that exceeds review capacity equals hiding — a brief nobody can check is a brief nobody does check.*
4. **"Pick the personas" has no control.** Personas are declared in `S-scoring`, and neither `X-findpeople` nor the People filter list offers one; the SDR re-types title and seniority rules every time. *Rule 6: declared, not re-invented; rule 1: weekly for this seat.*

### Decisions

- **C-01.** Spec 09 §6.8 gains a **Brief** row in the template table and one paragraph defining it: header (what it is about, which agent wrote it, when, credits, source count), main as sections (the angle, the evidence, the people to approach, what to say), side card for the company, one door "All sources · n". Every generated line carries its source link inline. The brief opens from the research door, from the meeting panel, from the deal and from Home. Rule 7.
- **C-02.** Spec 09 §6.8, Company row: doors become the eight spec 03 names; the tab and "Locations" are struck. Record pattern.
- **C-03.** Spec 03 §3, record doors: "Agent research" holds run rows and **"Open the brief"** on the latest. Rule 4 — the door delivers what its label promises.
- **C-04.** Spec 02 §3 Filters gains **Persona** (reads the definitions from Settings › Signals, scoring and personas) as a level-one chip for the SDR, and `X-findpeople` gains the same control at the top. Spec 03 §3 "Find people" carries it through. Rule 6.

### Reality check

16§18 and 16§2 describe research as a weekly account-level act, not a per-contact one, and the walk matches: company first, then people. What the spec simplified is the *output*: the journey's output is a brief somebody else can check, and the spec's output is a door with a count.

### Score

**No.** Two levels are held and nothing decision-critical is behind a door, but the specs forgot a step: **reading the agent's brief with its citations.**

---

## S3 · Build a target-account list

*Meridian, weekly; Halyard runs the same build ten times, once per client workspace. Map walk: `G-palette` → `P-companies` → `D-co-filters` → `X-findcos` → `P-lists` → `D-lists-filters` → `R-list` → `D-list-refresh` → `P-people` → `D-people-filters` → `D-people-views` → `X-listadd`.*

### The stops

| Stop | What is visible first | The doors, and what each holds | Container | The one thing that must stay in sight |
|---|---|---|---|---|
| `G-palette` | Every action and every page with its shortcut printed. | The staged refinement ("Add {name} to sequence…") replaces the input; Backspace returns. | Overlay | That the palette is a route, not the only route. |
| `P-companies` | As S2, with the Meridian seat's chips (Stage, Industry, Employees) and the Owner chip present. | As S2 | | The count against the filters, updating live. |
| `D-co-filters` | The level-two filters for the seat, in usage order, with the active count in the label. | — | Second row, in place | Which filters are on: an active level-two filter also shows as a chip. |
| `X-findcos` | The database: flat filters (industry, employees, location, revenue, funding, hiring, technology, keywords, intent), a live count, results with Save and Find people, the header line "saving is free · finding people costs 1 credit per verified email". | — | Drawer over the table | The price line, and the count before saving. |
| `P-lists` | Lists with kind and mode badges, records and "+n this week", feeds, owner, updated. | "Mode, source, archived ▾"; "Columns: visibility, source, created ▾"; row menu. | In place, in place, menu | Which lists feed something that sends. |
| `R-list` | Name, kind and mode badges, records, new this week, the feeds line, owner, last refreshed; filter chips for a segment; the members table. | "Refresh and alerts ▾" (segments), "History: 9 changes ▾", "Add people" as a drawer, member row menus. | In place, in place, drawer, menu | **How much work this list is** — the map says the list's level-one question is "how many touches is this", and nothing on the page answers it. |
| `P-people` | The SDR table as specced: chips Title, Email, Not in a sequence, Stage, Owner, Company; six columns; row buttons Sequence, List, Call. | "All filters (31)", "All views (12)", "Columns and density", row menu, selection menu. | Panel, popover, popover, menus | The price on every paid control and the count on every bulk button. |
| `X-listadd` | The picker with "New list"; the toast links to People filtered to the list. | — | Panel | How many were added, and how many were skipped and why. |

### Issues

1. **Two exclusions the journey names have no control.** "Exclude owned and in-sequence records" is step three of a weekly build, and `X-findcos` offers neither. Without them the rep pays credits to reveal people the workspace already owns. *Rule 1 (weekly for the seat) and rule 7 (it is a spend).*
2. **The list never says how much work it is.** "Check the count against a week of touches" has no surface. At 19 touches a day (17§1) a 1,240-person list is nine weeks of one rep's life, and that is the decision the whole journey turns on. *Rule 7: commitment is decision-critical; map §6.4b already declares this the list's level-one question.*
3. **The New list chooser does not say what each choice gives you.** "Static list · Segment from filters · Import CSV" — the difference between a frozen set and a live one, and the fact that only one of them can alert you, is exactly the journey's decision ("live filter or frozen"). *Rule 4: a door delivers on its promise.*
4. **One filter door in the product has no active count** — spec 04's "Mode, source, archived ▾" — while spec 02, 03 and 07 all print one. *Rule 4 and simple consistency.*

### Decisions

- **C-05.** Spec 03 §3, the Find companies drawer: two exclusions at level one, "Exclude companies I already own" and "Exclude companies with a contact in a sequence", both on by default for the SDR, each restating the count as it toggles. Rule 1.
- **C-06.** Spec 04 §3, the detail header: one line after the record count — "1,240 people · about 9 weeks of touches for one rep at 19 a day". The daily touch figure is a workspace number, not a per-user guess, and the line is text, never a tooltip. Rule 7.
- **C-07.** Spec 04 §3, the New list chooser: one sentence under each option — "Static list: the members are frozen at what you pick." / "Segment: keeps matching new records, can refresh on a schedule and email you." / "Import CSV: opens the import wizard." Rule 4.
- **C-08.** Spec 04 §3 and §6: the filters door label becomes "Mode, source, archived ▾ (1 on)". Rule 4.

### Reality check

17§1's target-account build and 16§2's search-and-filter tuning both put the filtering work before the list, and the walk matches. Halyard doing this ten times a week is the argument for the exclusions being level one rather than tucked away: what is rare elsewhere is routine at the agency.

### Score

**No.** The missing steps are **excluding owned and in-sequence records** and **checking the count against a week of touches**.

---

## S4 · Reveal emails and phones

*Fathom, daily. The credits are the founders' own money. Map walk: `P-people` → `Q-person` → back to `P-people` → `X-enrich` → `R-job` → `X-credits`.*

### The stops

| Stop | What is visible first | The doors | Container | The one thing that must stay in sight |
|---|---|---|---|---|
| `P-people` | The Fathom set: the SDR page plus Enrich · 2 credits, Research · 12 credits and Reveal phone · 8 credits at level one; no Owner chip; Signals and Phone columns. Selection bar with "Select all 312 matching" and "Limit per company" beside it; every bulk button repeating its count and price. | All filters (31); All views (12); Columns and density; row menu; selection menu. | Panel, popovers, menus | The price on the control and the balance after, in the same words every time. |
| `Q-person` | Name, title, company, owner, email and status, phone, stage, sequence and step, last contacted, do-not-contact state. | none | Drawer | The do-not-contact state, which decides whether a phone is worth buying at all. |
| `X-enrich` | **Not specified.** Spec 02 spends straight from the bulk bar, with an inline confirmation above 100 credits. There is no choice of what to reveal and no per-row estimate. | — | — | — |
| `R-job` | **Not specified.** Nowhere shows email status landing, the matched and unmatched counts, or which rows to drop. | — | — | — |
| `X-credits` | Spend by feature, by person and by surface (app, automation, API, MCP, CLI, agents). | — | Panel from the pill or the plan area | Burn rate against the cap and the date the balance runs out. |

### Issues

1. **A dependent pair split by a door.** The do-not-call flag lives in the filters panel ("excluded by default; the toggle says how many"); the spend happens on the selection bar. A mobile for a do-not-call number is charged and is not refunded (16 credit table), so the two things the rep must weigh together sit on opposite sides of a door. *Rule 5, and rule 7 for the non-refundable spend.*
2. **The journey's first decision has no control.** "Choose email, or email and phone" — phones cost four times an email — is step two, and spec 02 has two separate single-price actions and a bulk Enrich that refreshes everything. *Rule 1 (daily for this seat) and rule 7.*
3. **The enrichment job has no home.** "Watch email status land, check the flag, drop unusable rows" needs the job record the map calls `R-job`. Nothing in the specs renders one. *A step the specs forgot.*
4. **`X-credits` is named in the map by feature, person and surface; no spec writes the surface column.** The surfaces exist because of the widened boundary, and an agency with ten workspaces and a CLI is the reason the column matters. *Rule 7: price attribution is decision-critical for the person paying.*

### Decisions

- **C-09.** Spec 02 §3: "Reveal and enrich" opens the `X-enrich` panel from the selection bar (the single-row buttons keep their one-click behaviour and price). The panel holds, in this order: what to reveal (Verified email · Email and mobile), the per-row estimate and the total with the balance after, and one line that cannot be moved behind anything — "18 of the 25 carry a do-not-call flag. A mobile for those is charged and cannot be called. They are excluded; include them anyway." Rules 5 and 7.
- **C-10.** New spec **`specs/17-import-and-enrichment.md`** owns `W-import`, `R-job` and `X-enrich` (see C-13). `R-job` is a record from the shared template: header (source, fields, provider order, rows, matched, credits, cost per hit), main as sections (the report by field, the unmatched rows with "Drop these from the list"), one door "All rows · n". Rule 1.
- **C-11.** Spec 14 §6, plan and usage area: `X-credits` breaks spend down by feature, by person **and by surface** — app, automation, API, MCP, CLI, agents — with the burn rate and the run-out date at level one, never inside a door for billing. Rule 7 and map §4's fourth resolution.

### Reality check

16§3 and the credit table are unambiguous: mobiles are charged for do-not-call numbers and nothing is refunded. 17§1 puts revealing in the daily loop for a founder-led team. The spec is right that a price belongs on a control; it simplified by assuming one control, one price, when the real act is a choice between two prices on a selection that contains rows you must not buy.

### Score

**No.** Missing: **the reveal choice with its estimate and the do-not-call statement**, and **the job report**.

---

## S5 · Import a CSV and run the waterfall

*Halyard, weekly — client lists arrive constantly. Map walk: `P-lists` → `W-import` → map headers → duplicates and owner → fields and provider order → ten-row trial → run → `R-job` → `R-list`.*

### The stops

| Stop | What is visible first | The doors | Container | The one thing that must stay in sight |
|---|---|---|---|---|
| `P-lists` | The lists table for the ops lead: Export and Duplicate on the row, Import CSV as a header button, Owner filter on Team, Visibility on the row. | "Mode, source, archived ▾"; columns door; row menu. | In place, menus | Which client workspace this is. The shell's chip carries it. |
| `W-import` | **Contested and unspecified.** Specs 02, 03 and 04 call Import CSV a drawer. The map makes it a level-1 wizard page, "an independent, staged, resumable task". Nothing writes its steps. | — | — | — |
| `R-job` | **Not specified** (as S4). | — | — | — |
| `R-list` | The imported list with its members and the "+n this week" count. | As S3 | | What did not match, and whether it is worth keeping. |

### Issues

1. **A level-1 node with no spec and three specs contradicting the map.** The map wins on the existence and parent of a node; three page specs still describe a drawer. A drawer also cannot be what this is: five stages, a trial run, a spend, and a resume. *Rule 5's container guidance — a page for an independent task — and the map's precedence rule.*
2. **The trial is the price disclosure and it is unwritten.** The journey runs ten rows to read the hit rate and the cost per hit before spending on the rest; one phone waterfall can reach 45+ credits (19§9). *Rule 7.*
3. **The provider order is a workspace default and the run overrides it.** Where the default comes from (Settings › Pipeline and data, enrichment order) must be named in the step, or the same decision gets made twice with different answers. *Rule 6: declared, and rule 5: the value beside where it came from.*
4. **The duplicate policy has a consequence nobody states.** "Update existing" on a record another person owns overwrites their fields. *Rule 7.*

### Decisions

- **C-12.** Specs 02 §3, 03 §3 and 04 §3: "Import CSV" opens the import wizard page, not a drawer. The three page specs keep the entry point and lose the drawer body. Map precedence.
- **C-13.** New spec **`specs/17-import-and-enrichment.md`**, §3, the wizard, one step per screen, each step with at most one door and no door inside it:
  1. **File and columns.** Upload, header mapping with a preview of three rows, "Save this mapping for this client" at Halyard.
  2. **Duplicates and owner.** Update existing · Skip · Create anyway, each with its sentence ("Update existing changes fields on 41 records; 12 of them are owned by someone else, and their owner does not change"); owner and list for the new rows.
  3. **Fields and provider order.** Which fields to fill, the provider lineup with the workspace default named and where it is set, "stop at first verified" or "continue", and the per-row ceiling.
  4. **Ten-row trial.** Run ten, print hit rate by field, credits spent and **cost per hit**, and the projected total for the file, before the button that spends it.
  5. **Run.** Progress, a stop control, and the resume line — the wizard survives a closed tab and says so.
  The end of the wizard is `R-job`, never a toast.
- **C-14.** Same spec: the page is reachable from People, Companies and Lists, appears in ⌘K, and carries "Add to sidebar" like any page a profile leaves out. Declared sidebar pattern.

### Reality check

16§3 and 16§4 give sixteen enrichment workflows and the waterfall shape; 19§9 gives the tail cost. Halyard doing this weekly per client is the argument for the saved mapping in step 1 — rare elsewhere, routine at an agency, which is rule 1 read per business rather than per product.

### Score

**No.** The whole journey after "a spreadsheet arrives" is unspecified: **the wizard, the trial and the job report**.

---

## S6 · Re-prospect the job changers

*Ridgeline, monthly. A former user at a new employer is the best lead there is. Map walk: `G-bell` → `P-people` → `D-people-filters` → `Q-person` → `R-person` → `D-person-history` → `D-person-enrich` → `X-enrich` → `R-company` → `D-co-hierarchy` → `X-enrol`.*

### The stops

| Stop | What is visible first | The doors | Container | The one thing that must stay in sight |
|---|---|---|---|---|
| `G-bell` | "Needs you now", then Today, Yesterday, This week; grouped rows navigate, never expand. | — | Drawer | **There is no notification kind for a signal.** The map's entry edge for this journey has nothing behind it. |
| `P-people` | The Ridgeline SDR set: Signals as chip, column and default view; Change stage as a row button; Add to sequence in the menu. | All filters (31) — "Changed job recently" lives here; views; columns; menus. | Panel, popovers, menus | Which signal fired, and how fresh it is. |
| `Q-person` | The glance fields, flat. | none | Drawer | The email status: the old address is what bounced. |
| `R-person` | Header (name, title, company, email with status, phone, stage, owner, in sequence), the activity timeline as the main column, side cards for company, open deals and tasks. | "Sequences (2)", "Custom fields", "Full history", "Enrichment data and sources", "Files", "All fields". | In place / drawer | Which employer this record is now about, and what happened at the old one. |
| `D-person-history` | Field changes with dates and authors. | — | In place | — |
| `D-person-enrich` | Where each field came from, which provider, when, at what cost. | — | In place | — |
| `X-enrich` | The new address, its verification state, the price. | — | Panel | The price and the balance. |
| `R-company` | The new employer, with its stage and owner. | "Parent and subsidiaries", the S2 set. | In place | **Whether we already own this account, and who owns it.** |
| `X-enrol` | The warm sequence, the mailbox, the skipped-people preview. | — | Panel | How many are net-new and what it costs. |

### Issues

1. **The trigger has no notification kind.** Spec 00 §3.4 lists seven kinds: reply, meeting booked, agent approvals, second approval, bounce guard, sync error, credits low. A signal firing is not among them, so the bell cannot start this journey — and Ridgeline is a business whose whole shape is signal-driven. *Rule 4: a route that does not exist cannot be found.*
2. **The journey's central decision has no control.** "Update in place or create a new record" appears nowhere. Merge exists; its opposite does not. Each choice has a consequence the person must see before choosing: updating keeps one timeline and loses the old employer's context, creating keeps both and splits the history. *Rule 7 and a step the specs forgot.*
3. **"Is the new company already an account" is two navigations away.** The answer decides whether this is a fresh prospect or somebody else's account, and the moment of decision is on the contact. *Rule 5: the fields you weigh together must not sit across a door or a page boundary.*
4. **A map-and-template conflict found here.** The map carries `D-person-activity`, "All activity · n", as a door on the contact record, while spec 09's template makes the contact's main column a timeline — which is level one. Both cannot be true, and the door version buries the SDR's most-read content. *Rule 1: a daily item behind a door is disclosure debt.*

### Decisions

- **C-15.** Spec 00 §3.4 gains a row: **Signal fired** — who: the owner of the record and anyone subscribed to the list or segment; class: digestible; grouped by signal per day; row text "3 contacts changed job · Ridgeline ICP"; opens People filtered to that signal. Rule 4.
- **C-16.** Spec 02 §3, row actions and record header: when a job-change signal is live on a contact, one control, **"Job change · confirm and update"**, opens in place with two options and their consequences written: "Update this record — one timeline; the old employer stays in history" and "Create a new contact — the old record keeps its history and is linked to the new one; you choose its stage". Under both, one line about the new employer: "Northwind Analytics is already an account · owner Elena Vasquez · 2 open deals" or "Not in the workspace yet". Rules 5 and 7.
- **C-17 / C-41.** Spec 09 §6.8's Contact row drops the activity door and IA-MAP §2.3 removes `D-person-activity`. The contact record's activity is the main timeline with its filter chips (object state, no level), and `X-calllog` opens from a call item on it. Rule 1.

### Reality check

16§4 and 17§8 both treat the mover as a monthly, signal-driven sweep rather than a daily one, which the walk matches. What the spec simplified is the record model: it assumed one person, one row, forever, and a job change is the one event that makes that false.

### Score

**No.** The missing step is **choosing between updating the record and creating a new one**, with what each keeps.

---

## S7 · Build a sequence, write it with AI, A/B a step

*Fathom, weekly — the founder writing it owns the message. Map walk: `P-sequences` → `R-sequence` → `D-seq-send` → `D-seq-step` → `P-templates` → `R-template` → `R-sequence` → `D-seq-step` → `X-preview` → `D-seq-results`.*

### The stops

| Stop | What is visible first | The doors | Container | The one thing that must stay in sight |
|---|---|---|---|---|
| `P-sequences` | One row per sequence with status, people, replied, bounced with its 7-day rate, steps, last activity; "New sequence" makes a draft and opens it, with no chooser. | Columns ⌄; row menu. | Popover, menu | The bounce rate beside the thresholds: it sits inside the Status and Bounced cells at every width. |
| `R-sequence` | Name, owner, status with its consequence line, the health line ("Bounce rate 2.1% over 7 days · warns at 4%, pauses at 6%"), the counts strip, the results strip, the read-only sending strip, Add people. | "Change sending settings ⌄", each step's "Open step ⌄", "Results by step and by audience ⌄", "Change history ⌄", the header menu "Duplicate, export, archive ⌄". | All in place except the menu | The health line and what pause or resume will do, in numbers. |
| `D-seq-send` | Mailbox and today's limit, emails per day from this sequence, schedule with its hours printed, ruleset with its rules printed, priority, tracking. | — | In place under the strip | That these five together decide whether an email goes out today. |
| `D-seq-step` | Subject, body, Insert variable ⌄ (inserts and closes), Draft with the outreach agent, Preview for…, Add variant, Save. | The variable menu, which is not a level. | In place, in the card | That an agent draft is marked "Agent draft, not sent" until a person saves it — logged, never queued. |
| `P-templates` / `R-template` | **Not specified.** The map made both level-1 pages, reached by ⌘K, deep link and a link from a step; §6.4h decided they get no default sidebar slot. No spec writes them. | — | — | — |
| `X-preview` | The step rendered on a real contact, with unresolved variables named. | — | Panel, its own channel | Which variables did not resolve. |
| `D-seq-results` | One row per step, then a table by title, company size and industry; export. | — | In place | Per-variant results, side by side. |

### Issues

1. **Two level-1 pages with no spec.** `P-templates` and `R-template` are needed by S7, S10 and M2. *A step the specs forgot.*
2. **"Link a template or clone it" is a journey decision with no control and a real consequence.** A linked step changes everywhere the template is used; a copy does not. *Rule 7 and rule 5.*
3. **The A/B test can be started and never finished.** Spec 05 stacks variants and prints a results line each, and there it stops. The journey ends with "wait for enough recipients, deactivate the loser", 16§8 puts the bar at roughly 200 recipients and 90% confidence, and PLAN says promoting a winner is the owner's click because it changes what everyone sends. Nothing shows progress towards the bar and nothing promotes. *Rule 7 (the consequence of promotion) and rule 1 (weekly for this seat).*
4. **Not an issue, recorded as correct:** the agent's draft is logged and not queued, which is exactly the PLAN approval rule — low-cost, reversible, saved-not-sent.

### Decisions

- **C-18.** Spec 05 gains **§3.9, Templates and snippets**: `P-templates` (folders, owner, last used, used-by count, search) and `R-template` (body, variables, nested snippets, "Used by 4 steps and 1 campaign" as a section, preview on a real contact, test send). Seats SDR, AE, MK and OPS — wider than the rest of this spec, because a marketer holds templates without holding Sequences. Reached by ⌘K, deep link and from a step or campaign; the header carries "Add to sidebar". Map §6.4h.
- **C-19.** Spec 05 §3.3, inside an open step: **"Use a template ▾"**, which inserts and closes like the variable menu, offering "Link — edits to the template change this step everywhere it is used (4 steps today)" and "Copy — this step keeps its own text". A linked step prints one read-only line naming the template and linking to it. Rules 5 and 7.
- **C-20.** Spec 05 §3.3, variants: each variant line carries recipients so far against the decision bar — "A 96 of ~200 · B 91 of ~200 · not enough to call yet" — and, once past it, **"Promote A · turns B off for everyone in this sequence"** with the consequence in the label. Promotion is the owner's click and is never automatic; an agent may propose and never promote. Rules 7 and 6.

### Reality check

16§8 and 16§9 put sequence building and A/B at a weekly cadence for the person who owns the message, and at Fathom that is a founder, which is why the agent-draft button sits first in an open step there. The spec's simplification is stopping at "add a variant": in the source, the test is only worth anything at the moment somebody kills the loser.

### Score

**No.** Missing: **the template pages** and **the promote-the-winner control with its threshold**.

---

## S8 · Enrol contacts and pick the mailbox

*Halyard, daily — many mailboxes per client, rotated. Map walk: `P-lists` → `R-list` → `X-enrol` → `R-sequence` → `D-seq-send`.*

### The stops

| Stop | What is visible first | The doors | Container | The one thing that must stay in sight |
|---|---|---|---|---|
| `P-lists` | The agency set: Export and Duplicate on the row, Import in the header, Owner on Team. | As S3 | | Which client workspace this is. |
| `R-list` | Members, the feed line, "Add to sequence" with credits and "n already in another sequence". | Refresh and alerts; History; member menus. | In place, menu | "212 net-new emails = 212 credits · balance 1.84M" and the double-enrolment count, before the click. |
| `X-enrol` | Sequence picker, mailbox choice, the skipped-people preview by reason ("212 will be added · 9 skipped: 4 already in a sequence, 3 unverified emails, 2 do not contact"). | — | Panel / drawer over the page | **What goes out tomorrow morning, against what the mailboxes can send.** Nothing shows it. |
| `R-sequence` | The sending strip: "Sends from marcus@… (42 of 100 today) · Business hours · Default outbound rules · Normal priority". | Change sending settings ⌄ | Read-only strip, then the door | Today's sent against the limit. |
| `D-seq-send` | Mailbox with its daily limit and how many other sequences share it; emails per day from this sequence; schedule; ruleset; priority; tracking. | — | In place | That the cap and the limit are two different numbers. |

### Issues

1. **A dependent pair split by a door — the headline issue of this journey.** The enrolment panel is where the rep chooses how many people to add and from which mailboxes; the daily limit, today's sent and the number of sequences already sharing that mailbox are behind "Change sending settings". The journey's own step list says "check remaining daily capacity" and "confirm day-one volume against the limit", and neither number is in the room when the decision is made. *Rule 5, and rule 7 for the commitment being made.*
2. **Rotation can be chosen in two places.** The sequence's settings door sets "Rotate across", and the Halyard enrolment drawer also offers rotation. Two controls for one decision, with no statement of which wins. *Rule 5 and rule 4.*
3. **Not an issue, recorded as correct:** the skipped-people preview by reason, before anything commits, is the strongest single piece of disclosure in the SDR set, and the agent path's admin approval above 1,000 recipients is stated in the agents spec as "N people from M mailboxes".

### Decisions

- **C-21.** Spec 05 §3.4, the Add people drawer, and the same panel reached from `R-list`: beside the mailbox picker, one block that cannot be moved behind anything — each chosen mailbox with "daily limit 100 · 42 sent today · shared with 3 sequences", and under the preview line, the resulting **day-one volume**: "212 added · 116 can send tomorrow from 2 mailboxes · the rest start Wednesday". Rule 5.
- **C-22.** Same section: the sequence's rotation setting is the default and the panel names it — "Sequence default: rotate across 3 mailboxes · change for this batch" — with a one-line statement that a change here applies to this batch only. Rule 4.

### Reality check

17§1's 41 emails a day per rep implies several mailboxes per rep, and 16§10 is the source of the capacity arithmetic. The spec is accurate about what exists and wrong about where it sits: it put the five sending decisions together in one panel (good, rule 5) and then left the enrolment decision outside that panel looking at none of them.

### Score

**No.** The missing step is **confirming day-one volume against the mailboxes' remaining capacity**.

---

## S9 · Work a call block and disposition every call

*Meridian, daily — the org's highest-volume work, 44 dials a day at the median. `[BOUNDARY: dialer]` — ollopA logs the call, it does not place it. Map walk as written: `P-tasks` → `D-task-filters` → `D-task-row` → `X-queue` → `X-calllog` → repeat → `X-note`.*

### The stops, as the S1 decision leaves them

S1 decided that Tasks opens in **queue mode** for the SDR and AE seats, with the list as the door. The map's S9 row still walks the list first and opens the queue at the end, so the walk is rewritten below as well as the spec.

| Stop | What is visible first | The doors | Container | The one thing that must stay in sight |
|---|---|---|---|---|
| `P-tasks`, queue mode | The counts line ("8 due today · 3 overdue · 13 later", overdue red, each count a filter button), then the first task: "Task 3 of 11 · Call · Amara Okonkwo, Northwind Analytics", what to do, the step history, the contact essentials, notes and the note field. Footer: Done with its four outcomes, "Snooze · the sequence waits", "Skip · contact moves to next step". | **"All tasks (24)"** — the list, as a labelled in-place switch that replaces the queue rather than opening inside it, which is why the list's own filter doors stay level two. | In place | The overdue count, and that an overdue sequence task means a contact is stuck and the sequence is waiting. |
| the list, when switched to | The table: Due, Type, Contact, What to do, From, actions. | "More filters: source, status, sort"; "Table options: columns, export"; the row door "History and contact"; the row menu. | Popovers, in place, menu | Same counts line, which does not move when the mode does. |
| `D-task-filters` | Source, status and sort for this seat, with the active count in the label. | — | Popover | — |
| `D-task-row` | Previous steps with dates and results, the contact's email and status, phone, local time, last activity, notes. | — | In place | **The phone, and the do-not-call state beside it.** Today the row door carries "the contact's email and status, phone, local time"; it does not carry the flag. |
| `X-calllog` | **Not specified.** Spec 07 offers four outcome buttons — Connected, Voicemail, No answer, Wrong number — and nothing else. The journey needs purpose, disposition, duration and notes, and 16§11 makes the disposition the thing that decides whether the contact advances. | — | — | — |
| `X-note` | The note, written on the person. | — | Panel | — |

### Issues

1. **The largest single activity in the product has no screen.** `X-calllog` is one of the nine nodes §6.5 names. Four outcome buttons are not a disposition set, there is no purpose, no duration and no notes field in the log, and nothing states which outcomes stop the sequence. *A step the specs forgot, plus rule 7 for the consequence.*
2. **Safety state is missing at the exact moment it matters.** A rep about to dial must see the do-not-call flag and the contact's local time before the phone rings. Local time is in the row door (and in the Due cell at Halyard); the flag is not there at all. *Rule 7.*
3. **Spec 07 still opens on the list.** Carried from S1 and not yet applied. *Rule 1: for the seat that lives here all day, the list is the door and the work is the page.*
4. **"Sorted by score" is in the journey and nowhere in the spec.** Spec 07 deleted Apollo's "Recommended ✦AI" ranking, correctly, because it reordered silently and explained itself on hover. But the journey's sort is not that: the score is a declared, published object with its inputs visible (`S-scoring`, `D-acct-health`'s sibling), and the person chooses it. *Rule 6: adaptation may add in place and must be user-chosen, never the silent default.*
5. **Not an issue, recorded as correct:** no agent dials, the queue order is agent-ranked and logged, and the queue is the rule-8 exposure device for this page — every action in front of the person who works here all day.

### Decisions

- **C-23 (carried from S1 — apply once).** Spec 07 §3 and §6: the page opens in queue mode for SDR and AE; the header carries "All tasks (24)" as the labelled switch to the list; CS and admin open on the list with "Work the queue (n)" as the primary button. Because the switch replaces the queue in place rather than nesting inside it, the list's filter and options doors remain level two. Rules 1 and 2.
- **C-24.** Spec 07 §3 gains **"Log the call"** (`X-calllog`): purpose (a short select — first touch, follow-up, no-show chase, referral), **disposition** (Connected · Connected, not interested · Left voicemail · No answer · Busy · Gatekeeper · Wrong number · Bad number · Callback booked), duration (a timer that runs and can be corrected), notes. One line under the disposition, always visible: "Connected and Connected, not interested stop this sequence for Amara. The others let it continue." Opens from a call task row, is the body of the queue when the queue is open, and opens from a contact or deal record — one node, several parents, never nested. The four outcome buttons stay in the queue footer as the fast path and write a disposition; the full log opens for duration and notes. Rules 5 and 7.
- **C-25.** Spec 07 §3: the call task row and the queue body show the phone with its **do-not-call badge** and the contact's local time, at level one, for every business. Rule 7.
- **C-26.** Spec 07 §3, the queue header: "Sort: due · call score", with the line "Ranked by the scoring agent · how it was built" linking to the score. Due is the default and the score is never applied without the person choosing it; the choice persists. Rule 6.
- **C-27.** IA-MAP §5, the S9 row, rewritten: `P-tasks` (queue mode) ─(body)→ `X-calllog` ─(repeat)→ `X-calllog` ─PN→ `X-note`; the list switch and `D-task-filters` appear only when the rep goes looking for a subset.

### Reality check

17§1 (44 dials a day, 56 for phone-first orgs), 16§11 (the disposition decides advancement) and 16§23B ("an SDR with call tasks and no way to complete them is a dead end") all describe the same loop, and the specs implement everything around it except the completion. This is the single largest hole in the SDR set.

### Score

**No.** The missing step is **logging the call: purpose, disposition, duration, notes**, and with it the statement of which disposition stops the sequence.

---

## S10 · Complete a LinkedIn task

*Meridian, daily — 19 touches a day, roughly a fifth of the activity budget, capped near 100 invites a week. `[BOUNDARY: extension]` — the send happens outside ollopA and ollopA never claims it happened. Map walk: `P-tasks` → `D-task-row` → `X-linkedin` → (outside) → `X-linkedin` (mark complete) → `P-tasks`.*

### The stops

| Stop | What is visible first | The doors | Container | The one thing that must stay in sight |
|---|---|---|---|---|
| `P-tasks`, queue mode | As S9: the counts line and the current task, here a LinkedIn step. | "All tasks (24)". | In place | The weekly invite count against the cap — the thing that decides whether this task can be done today at all. |
| `D-task-row` | Step history and contact details. | — | In place | — |
| `X-linkedin` | **Not specified.** Spec 07 knows LinkedIn as a task kind and nothing more: there is no message text, no copy control, and no invite counter anywhere in the product. | — | — | — |
| back in `P-tasks` | The next task. | | | That completion was a human claim, not an observation. |

### Issues

1. **The message the step holds has nowhere to be read.** Sequence steps store the LinkedIn action kind and a note (spec 05 §3.3), and the task that step creates shows "What to do" as a line of text. The journey's first step is "read the message the step holds, copy it". *A step the specs forgot.*
2. **The weekly cap is invisible.** Roughly 100 invites a week is a hard external limit; exceeding it costs the account. The journey's second decision is "does the invite cap force a wait". *Rule 7: a limit that binds is decision-critical, and the same rule already makes ollopA print "over your limit" on credit controls.*
3. **Honesty about what the product can see.** 16§16 records that Apollo never auto-completes a LinkedIn task and has no connection-status column. ollopA must say so rather than imply a status it cannot know. *Rule 4: the door is honest about what is behind it.*

### Decisions

- **C-28.** Spec 07 §3 gains **"LinkedIn step"** (`X-linkedin`): the message text as written on the step (editable for this send, with "Personalise for Amara" leaving the step's copy alone), **Copy message**, **Open the profile** (an outward link), and **Mark complete**, under which one line reads: "ollopA cannot see LinkedIn. Marking complete records that you sent it and advances the sequence." Opens from a LinkedIn task row and is the body of the queue for a LinkedIn task. Rules 4 and 7.
- **C-29.** Same panel and the queue header: **"Invites this week: 38 of about 100"**, counted from LinkedIn tasks marked complete, with the line "the cap is LinkedIn's, not ollopA's" and, when the count is within ten of the cap, "Snooze the rest to Monday" as a visible control. Rule 7.
- **C-30.** Spec 05 §3.3, the LinkedIn step editor: the note field becomes the **message text**, with the variable menu available, so that the text the task shows is written once in the step and not re-typed per contact. Rule 5.

### Reality check

17§1's 19 touches a day and ~100 invites a week, and 16§16's absence of a connection-status column, are the whole evidence base, and both point the same way: the feature is the text, the copy and the honest manual completion. Nothing here needs an extension, which is why the boundary decision was to bring it in.

### Score

**No.** Missing: **the message, the copy control and the weekly invite counter**.

---

## S11 · Triage the reply inbox

*Meridian, daily, several sweeps — separated roles mean a reply often belongs to somebody else. Map walk as written: `P-inbox` → `D-inbox-filters` → `X-thread` → `D-agent-item` → `X-reply` → `X-book` → `R-person` → `X-enrol`.*

### The stops

| Stop | What is visible first | The doors | Container | The one thing that must stay in sight |
|---|---|---|---|---|
| `P-inbox` | "9 waiting · longest 3 d"; the group tabs with counts (Interested, Question, Not now, Unsubscribe); the table (Waiting, From, Meant, Reply) longest-waiting first; the thread panel on the right, open by default. | The dropdown tab "Out of office (2) · Handled (6)"; "Filter by sequence, owner, mailbox, date"; the row menu. | Tab, popover, menu | The Unsubscribe count. It is a tab, always visible, never a door. |
| `X-thread`, the panel | Name, title, company, email with status, sequence and step, mailbox, open deal, "Handed over by Marcus" when it applies; the reply in full; the composer with To and Subject prefilled. | "Earlier messages (3)", "Contact details", "Insert a saved reply", the Send menu. | In place, in the panel | Who the reply belongs to, and what the classification implies for the action. |
| `D-agent-item` | **Wrong node, and a third level.** The map sends the reader from the thread panel into the Agents page's item door and then into a reply panel. Spec 06 says, correctly, that there is no reply drawer anywhere in the product and the panel is part of level one. | — | — | — |
| the agent's work | **Not specified.** The journey and PLAN both say the agent pre-classifies and drafts per class — classification logged, sending per item with the recipient and the text shown. Spec 06 never mentions the agent. | — | — | — |
| `X-book` | Book meeting drafts a reply carrying the calendar link. | — | In the panel | See S12: the meeting object itself has no home. |
| `R-person`, `X-enrol` | The record, then the enrolment panel with its skipped-people preview. | As S6, S8 | | — |

### Issues

1. **A three-level path in the map.** `P-inbox` → `X-thread` (panel, level 2 as the map types it) → `D-agent-item` (door) → `X-reply` (panel) is four deep as written and three at best. Spec 06 already resolves it — master-detail, the panel is the page's detail half — but the map still types `X-thread` as a level-2 panel with `X-reply` hanging off it. *Rule 2, and the map's own convention 2: no level-2 node contains another level-2 node.*
2. **The agent is missing from the page where it does its most useful work.** Classification decides the action (17§1: "action mapping matters far more than a massive list of labels"), so an agent classification that the person cannot see, check or correct is an inferred change of state dressed as a fact. Spec 06 has "Change what they meant", which logs corrections for the classifier — that is the right half. The missing half is saying that a machine made the call. *Rule 6 (declared, not inferred) and rule 7 (the draft that will be sent is what the person is approving).*
3. **Where the draft is approved.** PLAN's rule is per-item approval for sends, with recipient and text shown. In the Inbox, the right place for that approval is the composer — the person reads the draft in the panel and Send is the approval — not a second queue on the Agents page for the same object. Two queues for one decision would double the review load, and rule 7's corollary says review capacity is the budget.

### Decisions

- **C-31.** IA-MAP §2.7: `X-thread` becomes **level 1** — the detail half of a master-detail page, open by default, not a disclosure — and `X-reply` is re-typed as a level-2 door on `P-inbox` (the composer in that panel) and on `R-person`, with `X-thread` removed as its parent. The S11 row is rewritten: `P-inbox` ─DR→ `D-inbox-filters` ─RC→ (thread panel) ─DR→ `D-thread-agent` ─(composer)→ send ─PN→ `X-meeting` ─LK→ `R-person` ─PN→ `X-enrol`. Rule 2.
- **C-32.** Spec 06 §3 gains the agent, in two visible pieces. On the row and at the top of the panel: **"Read as: Interested · by the reply agent · change"** — text, never colour alone, and the correction is the existing "Change what they meant", which is logged. Beside the composer: the door **"Agent draft · 142 words"**, which loads the draft into the composer when opened, marked "Agent draft, not sent". Sending is the approval, per item, with the recipient and the full text on screen; nothing about a reply is queued twice. Rules 6 and 7.
- **C-33.** Spec 13 §3, "What waits, and what does not": one line stating that a reply draft shown in the Inbox composer is approved there and does not also appear in the Agents queue; the ledger still records it. Rule 7 corollary — budget the reviewer.

### Reality check

16§10 and 17§10 #6 describe several sweeps a day with the classification driving the action, which the page implements well. The one thing the spec simplified is authorship: it wrote the page as if a human classified every reply, and the product ships an agent that does it first.

### Score

**No.** The missing step is **seeing, checking and correcting the agent's classification and draft in the thread**; and the map's walk runs three levels deep.

---

## S12 · Book the meeting, chase the no-show, hand it over

*Meridian, daily. `[BOUNDARY: meetings]` — no booking page; the meeting object and its booked, held and no-show events are inside. This is the only place the SDR-to-AE seam exists. Map walk: `X-thread` → `X-book` → `X-meeting` → `R-brief` → `R-deal` → `X-task` → `X-enrol`.*

### The stops

| Stop | What is visible first | The doors | Container | The one thing that must stay in sight |
|---|---|---|---|---|
| the thread panel | The positive reply, the contact, the sequence, the open deal if any. | As S11 | In the page | Who this becomes, once it is booked. |
| `X-book` | Offer times, or send the calendar link. Spec 06 has this much: "Book meeting drafts a reply with the calendar link; when the calendar reports a booking, the contact stage becomes Meeting booked." At Halyard the control is replaced by "Connect a calendar to book from here" — removed, not disabled, which is right. | — | In the panel | That ollopA does not own the booking page; the calendar does. |
| `X-meeting` | **Not specified.** No attendees, no status (booked, held, no-show, cancelled), no prep brief, no follow-up. | — | — | — |
| the handoff fields | **Not specified.** "The problem in the buyer's words, why now, who is involved, what success looks like" exists in no spec. | — | — | — |
| `R-brief` | **Not specified** (as S2). | — | — | — |
| `R-deal` | The deal record: stage stepper, amount, close date, next step, owner, timeline, contacts, tasks. Created "from this reply, prefilled" per spec 06. | Custom fields, History, Files, Signals, All fields, Sync history. | In place / drawer | Which AE owns it, and on what basis. |
| `X-task`, `X-enrol` | The task panel and the no-show sequence. | — | Panels | Whether the no-show chase is running. |

### Issues

1. **A level-3 path if `X-book` and `X-meeting` stay two nested panels.** The thread panel is level one after C-31; a booking panel on it is level two; a meeting panel opened from the booking panel is level three. *Rule 2.*
2. **Four objects with no screen: the meeting, its held/no-show state, the handoff brief and the assignment rule.** 17§1 puts no-shows at 20–35%, which makes the chase a weekly-at-least routine, and the meeting-booked event is a sequence finish condition, a stage trigger and a workflow trigger (16§12, 16§17). *A step the specs forgot, four times over.*
3. **The measure the SDR is paid on is invisible.** 18§8a: qualification is binary, rejection above 15% means the standards are misaligned, and SDR pay depends on acceptance. The person filling the handoff has no idea where they stand. *Rule 7: commitment and consequence.*
4. **Who the deal goes to.** "Assign the AE by territory" needs the territory match shown and overridable with a reason; otherwise the routing rule is invisible until it misfires, which is exactly the argument the map used to keep Workflows visible (§6.4g).
5. **Creating the deal is the SDR's act and it is irreversible in practice** — the AE is measured on it. PLAN already says an agent-proposed stage change is per-item; the same logic applies here: the brief may be agent-drafted and logged, the deal creation is a person's click.

### Decisions

- **C-34.** IA-MAP §2.7: `X-book` is merged into **`X-meeting`** as its create state — one node with states (proposed → booked → held / no-show / cancelled), parents `P-inbox` (the thread panel), `P-tasks`, `R-deal` and `R-company`. A form that follows a chosen action is the action's form, not a level. The S12, A2, C1, C2 and C4 rows are updated to name `X-meeting` alone. Rule 2.
- **C-35.** Spec 06 gains **§3.6, "Book and run the meeting"**, owning `X-meeting` for the whole product; specs 07 and 09 render it and add nothing of their own, exactly as `WorkspaceHealth` is owned by spec 01 and rendered elsewhere. The panel holds: times or the calendar link; attendees with their titles; **status** (Booked · Held · No-show · Cancelled) as visible buttons, since a person marks it and ollopA does not watch the room; the prep brief with "Write the handoff brief"; the follow-up draft after the meeting; and, on a no-show, **"Start the reminder and reschedule sequence"** naming the sequence and what it sends. Rule 7.
- **C-36.** Same section, the handoff block, at level one inside the panel: the four fields in the buyer's words (the problem, why now, who is involved, what success looks like), each with the agent's draft marked as a draft; the **binary qualification checklist** the business declares; and the button **"Create the deal and assign"** whose label states the consequence: "Creates a deal at Qualified for Elena Vasquez — territory UK enterprise · change". Under it, one line: "Your handoffs accepted this quarter: 88% (17 of 19)". Rules 7 and 5.
- **C-37.** Spec 09 §3.2: "Create deal from a reply or a meeting" states its prefill and its owner rule, and the deal's header shows "Handed over by Marcus Adeyemi · handoff brief" as a link. Rule 5.

### Reality check

16§12, 17§1 and 18§8a agree on the shape: book, chase (20–35% no-show), qualify against binary criteria, hand over, and get accepted or rejected. The specs implemented the first half of the first step. The frequency is right in the journey — daily — and nothing in the sources suggests this is a rare errand for anyone.

### Score

**No.** Missing: **the meeting object and its held/no-show state, the handoff brief, the acceptance measure and the territory assignment**.

---

## S13 · Rescue a sequence the bounce guard paused

*Fathom, monthly — one bad domain is the whole pipeline. The founder holds both the OPS and SDR seats. Map walk: `P-home` → `S-you` → `S-sending` → `X-domain` → `X-mailbox` → `P-sequences` → `R-sequence` → `D-seq-send` → `D-seq-results` → `X-enrich`.*

### The stops

| Stop | What is visible first | The doors | Container | The one thing that must stay in sight |
|---|---|---|---|---|
| `G-bell` / `P-home` | The bell row is interrupting: "Bounce guard paused Q4 enterprise outbound: 6.2%, pauses at 6%". On Home, the health strip: "Sending healthy · bounce 1.8% · sync clean · credits on track", with an item in warning or paused state turning into a link and the strip gaining a border. | "Setup steps remaining"; "Tomorrow and later (n)"; the agent doors. | In place | The observed rate beside both thresholds — never one without the other. |
| `S-sending` | The mailbox table with warm-up, daily and hourly limits, sent today, deliverability and the 7-day bounce rate per mailbox; the sending domains with SPF, DKIM and DMARC; the bounce guard row: "Warning · 4.4% of 9,800 · 1 mailbox paused · warns at 4%, pauses at 6%". | One door per area, holding the tracking subdomain, catch-all, the unsubscribe pair and tracking. | In place | Which mailbox or domain is producing the rate. |
| `X-domain` | SPF, DKIM, DMARC and the domain's bounce rate. | — | Panel | Fathom is missing DMARC in the seed — the answer is on this screen. |
| `X-mailbox` | Warm-up state and day, limits, signature, unlink. | — | Panel | The daily limit that the rescue will lower. |
| `R-sequence` | Status "Auto-paused by bounce guard 3 h ago" in red; the health line with both thresholds and a link that says RevOps admins change them; the counts strip with Bounced and Not sent as filter buttons; "Review and resume" requiring one of: remove bounced people, retry not-sent people, or "I have fixed the data". | Change sending settings ⌄; Results by step ⌄; Change history ⌄, which records "Paused by bounce guard: 6.4%". | In place | What resuming will send: "Resume continues from each person's next step. 41 emails go out in the next sending window." |
| `D-seq-send` | The five sending decisions together, including "Emails per day from this sequence", which is where volume is lowered. | — | In place | Today's sent against the mailbox limit. |
| `D-seq-results` | Results by step and by audience, to watch for a day. | — | In place | — |
| `X-enrich` | Re-verification of the addresses, priced. | — | Panel | The price. |

### Issues

1. **The notification does not open the thing that stopped.** Spec 00 §3.4 sends the bounce-guard row to Settings › Email sending › Bounce guard "with the sequence named". What stopped is a sequence, what the person must decide is whether to resume it, and the sequence page already holds the rate, both thresholds, the cause in its history and the three resume conditions. *Rule 4: the door delivers on its promise; rule 5: the cause and the fix together.*
2. **The same holds on Home.** The strip's bounce item links "to where it is fixed"; for the owner of a paused sequence, that is the sequence.
3. **The SDR seat's access to the domain row is undefined.** The map gives `S-sending` to OPS and SDR but `X-domain` to OPS alone. At Fathom the founder is both, so this journey passes; at Meridian an SDR chasing the same rate hits nothing. Authentication state is safety state. *Rule 7, and the three kinds of "cannot see it": an object you do not own is readable with the edit controls absent, not hidden.*
4. **Not an issue, recorded as correct and as the best-scoring stop in the set:** the health line prints the observed rate beside both thresholds on the sequence, the list row, Home and Settings, from one owner (`mail.bounce-guard`), and "Review and resume" refuses to be a one-click resume. That is rule 7 done properly.

### Decisions

- **C-38.** Spec 00 §3.4, the bounce-guard row: it opens **the paused sequence at its health line**; when the trip is at mailbox level with no single sequence, it opens Settings › Email sending. The row text keeps both numbers. Rule 4.
- **C-39.** Spec 01 §3, the health strip: the bounce item links to the paused sequence when exactly one is paused, to Sequences filtered to Auto-paused when several are, and to Settings otherwise. IA-MAP §3 gains the edge `P-home` §Health strip → `R-sequence` (auto-paused). Rule 5.
- **C-40.** IA-MAP §2.14 and spec 14 §6: `X-domain` is readable by the SDR seat — SPF, DKIM, DMARC and the domain bounce rate visible, editing absent, with the line "Daniel Okafor (RevOps admin) changes these". Seats column becomes "OPS, SDR (read)". Rule 7.

### Reality check

16§8 (4% warn, 6% pause), 16§10 (investigate above 5%) and 17§8 (about fifteen minutes per client per week on deliverability) match the journey's monthly-at-Fathom, weekly-at-an-agency cadence. Nothing here was simplified away; only the route in is longer than it should be.

### Score

**Yes.** The founder reaches the end: the rate is read beside its thresholds, the cause is found on the mailbox and domain rows, the data is cleaned and re-verified, volume is lowered in the sending door, the sequence is resumed under the three conditions, and the results door is where the next day is watched. Two levels throughout, and nothing decision-critical behind a door. The route from the alert to the sequence is two stops longer than it needs to be, which C-38 and C-39 close.

---

## Scores at a glance

| Journey | Two levels held | Critical thing kept in sight | A step the specs forgot | Score |
|---|---|---|---|---|
| S2 Research an account | Yes | Yes (credit price, research cost) | The brief and its citations | **No** |
| S3 Build a target list | Yes | No — the list never says how many touches it is | Exclusions for owned and in-sequence records | **No** |
| S4 Reveal emails and phones | Yes | No — the do-not-call flag is across a door from the spend | The reveal choice with its estimate; the job report | **No** |
| S5 Import and run the waterfall | Untestable — the node is unwritten | No | The whole wizard, the ten-row trial, the job report | **No** |
| S6 Re-prospect job changers | Yes | No — "is this already our account" is two pages away | Update in place or create a new record; the signal notification | **No** |
| S7 Build a sequence and A/B | Yes | Yes | The template pages; promoting the winner | **No** |
| S8 Enrol and pick the mailbox | Yes | No — capacity sits behind the sending door | Day-one volume against remaining capacity | **No** |
| S9 Work a call block | Yes | No — no do-not-call state before the dial | Logging the call: purpose, disposition, duration, notes | **No** |
| S10 Complete a LinkedIn task | Yes | No — the weekly invite cap is invisible | The message, the copy control, the counter | **No** |
| S11 Triage the reply inbox | **No — the map's path runs three deep** | Yes (the unsubscribe count is a tab) | The agent's classification and draft | **No** |
| S12 Book, chase, hand over | **No — nested panels would be three deep** | No — the acceptance rate the SDR is paid on is invisible | The meeting object, held/no-show, the handoff brief, assignment | **No** |
| S13 Rescue a paused sequence | Yes | Yes (rate beside both thresholds, everywhere) | None | **Yes** |

Eleven of twelve fail, and nine of the eleven fail on absent nodes rather than bad disclosure. The disclosure work inside the written specs is sound: of the 51 changes below, four fix a rule violation (one three-level path, two split dependent pairs, one dishonest destination) and the rest write down work that was never specified or correct a conflict between two files.

---

## The change list

*One apply pass makes these edits. Nothing in this walk was applied here.*

### Specs, and the two map rows the specs depend on

| # | File | Location | Current | New | Rule |
|---|---|---|---|---|---|
| C-01 | specs/09-deal-record.md | §6.8, the template table and one new paragraph | No brief anywhere in the spec set | A **Brief** row: header (subject, which agent, when, credits, source count), main as sections (the angle, the evidence, the people, what to say), side card for the company, one door "All sources · n"; every generated line carries its source link; opens from the research door, the meeting panel, the deal and Home | 7 |
| C-02 | specs/09-deal-record.md | §6.8, the Company row | Doors "Custom fields, Locations, History, Enrichment, Files, All fields" plus a tab "People (48)" | The eight doors spec 03 §6 names (All activity, Agent research, Signals and news, CRM sync, Parent and subsidiaries, Similar companies, Custom fields, Files, Lists); no tab; Locations struck | Record pattern |
| C-03 | specs/03-companies.md | §3, record doors | "Agent research · n runs, n credits a run" holds run rows | Adds "Open the brief" on the latest run and the provenance line (agent, date, sources) | 4 |
| C-04 | specs/02-people.md | §3 Filters; `X-findpeople` | 31 filters, no persona | **Persona** as a level-one chip for the SDR, reading the definitions from Settings › Signals, scoring and personas, and the same control at the top of Find people | 6 |
| C-05 | specs/03-companies.md | §3, the Find companies drawer | Flat database filters, count, cost line | Adds two exclusions at level one, on by default for the SDR: "Exclude companies I already own", "Exclude companies with a contact in a sequence", each restating the count | 1 |
| C-06 | specs/04-lists.md | §3, the detail header | Records count and "+n this week" | Adds "1,240 people · about 9 weeks of touches for one rep at 19 a day", as text, from the workspace touch rate | 7 |
| C-07 | specs/04-lists.md | §3, the New list chooser | "Static list · Segment from filters · Import CSV" | One sentence under each: frozen members; keeps matching, refreshes and can alert; opens the import wizard | 4 |
| C-08 | specs/04-lists.md | §3 and §6, the filters door | "Mode, source, archived ▾" | "Mode, source, archived ▾ (1 on)" — the active count, as every other filter door in the product | 4 |
| C-09 | specs/02-people.md | §3, Row actions and Bulk | Bulk Enrich spends from the bar with an inline confirm above 100 credits | The selection bar opens `X-enrich`: what to reveal (Verified email · Email and mobile), the per-row estimate, the total and balance after, and the line "18 of 25 carry a do-not-call flag; a mobile for those is charged and cannot be called — excluded; include them anyway" | 5, 7 |
| C-10 | **new** specs/17-import-and-enrichment.md | §3, `R-job` | No enrichment-job record exists | A record from the template: header (source, fields, provider order, rows, matched, credits, cost per hit), sections (report by field, unmatched rows with "Drop these from the list"), one door "All rows · n" | 1 |
| C-11 | specs/14-settings.md | §6, plan and usage | Credit balance and burn at level one | `X-credits` breaks spend down by feature, by person **and by surface** (app, automation, API, MCP, CLI, agents); burn and run-out date stay level one, never inside the billing door | 7 |
| C-12 | specs/02-people.md, 03-companies.md, 04-lists.md | §3, the Import CSV entry | Import CSV opens a drawer | Import CSV opens the import wizard page; the drawer body is struck from all three | Map precedence |
| C-13 | **new** specs/17-import-and-enrichment.md | §3, `W-import` | Nothing | Five steps, one door each at most: file and columns (saved mapping per client); duplicates and owner, each option with its sentence; fields and provider order, naming the workspace default and where it is set; **ten-row trial** printing hit rate, credits and cost per hit with the projected total; run with progress, stop and resume. Ends on `R-job`, never a toast | 5, 7 |
| C-14 | **new** specs/17-import-and-enrichment.md | §1 and §3 | — | Reachable from People, Companies and Lists, in ⌘K, deep-linkable, header offers "Add to sidebar" | Declared sidebar |
| C-15 | specs/00-shell-signin-palette-notifications.md | §3.4, the kinds table | Seven kinds; no signal | Adds **Signal fired**: owner and subscribers; digestible; grouped by signal per day; "3 contacts changed job · Ridgeline ICP"; opens People filtered to that signal | 4 |
| C-16 | specs/02-people.md | §3, row actions and the record header | No job-change control | **"Job change · confirm and update"** when the signal is live: "Update this record" and "Create a new contact", each with what it keeps, plus one line on the new employer ("already an account · owner Elena Vasquez · 2 open deals" or "not in the workspace yet") | 5, 7 |
| C-17 | specs/09-deal-record.md | §6.8, the Contact row | Activity door alongside the timeline | The contact's activity is the main timeline with its filter chips; no activity door. `X-calllog` opens from a call item | 1 |
| C-18 | specs/05-sequences.md | new §3.9 | No templates spec | `P-templates` (folders, owner, last used, used-by count, search) and `R-template` (body, variables, nested snippets, "Used by 4 steps and 1 campaign" as a section, preview on a real contact, test send); seats SDR, AE, MK, OPS; ⌘K, deep link, link from a step or campaign; "Add to sidebar"; no default sidebar slot | Map §6.4h |
| C-19 | specs/05-sequences.md | §3.3, inside an open step | Body text only | **"Use a template ▾"**, inserting and closing like the variable menu: "Link — edits change this step everywhere it is used (4 steps today)" or "Copy — this step keeps its own text"; a linked step prints a read-only line naming the template | 5, 7 |
| C-20 | specs/05-sequences.md | §3.3, variants | One results line per variant | Adds progress to the decision bar ("A 96 of ~200 · B 91 of ~200 · not enough to call yet") and, past it, **"Promote A · turns B off for everyone in this sequence"**; the owner clicks, an agent may propose and never promote | 6, 7 |
| C-21 | specs/05-sequences.md | §3.4, the Add people drawer (and the same panel from a list) | Mailbox picker and the skipped-people preview | Adds, beside the picker, each mailbox's "daily limit 100 · 42 sent today · shared with 3 sequences", and under the preview the **day-one volume**: "212 added · 116 can send tomorrow from 2 mailboxes · the rest start Wednesday" | 5 |
| C-22 | specs/05-sequences.md | §3.4, the same drawer | Rotation offered in two places | The sequence setting is the default and the panel names it — "Sequence default: rotate across 3 mailboxes · change for this batch" — with one line saying a change here applies to this batch only | 4, 5 |
| C-23 | specs/07-tasks.md | §3 Shown and §6 Layout | The page opens on the list; "Work the queue (11)" is the primary button | SDR and AE open in **queue mode**; the header carries "All tasks (24)" as the labelled in-place switch to the list; CS and admin open on the list with "Work the queue (n)". The switch replaces rather than nests, so the list's doors stay level two. *Carried from S1 — apply once* | 1, 2 |
| C-24 | specs/07-tasks.md | §3, new subsection | Four outcome buttons on Done | **"Log the call"** (`X-calllog`): purpose; disposition (Connected · Connected, not interested · Left voicemail · No answer · Busy · Gatekeeper · Wrong number · Bad number · Callback booked); duration timer, correctable; notes. Always-visible line: "Connected and Connected, not interested stop this sequence for Amara. The others let it continue." One node, parents: task row, queue body, contact and deal records. The four buttons stay as the queue's fast path and write a disposition | 5, 7 |
| C-25 | specs/07-tasks.md | §3, call task row and queue body | Phone in the row door; local time in the door (Due cell at Halyard) | Phone with its **do-not-call badge** and the contact's local time at level one for every business | 7 |
| C-26 | specs/07-tasks.md | §3, queue header | Fixed order: overdue, then due date, then type | Adds "Sort: due · call score" with "Ranked by the scoring agent · how it was built"; due stays the default, the score is never applied unless chosen, and the choice persists | 6 |
| C-27 | IA-MAP.md | §5, the S9 row | `P-tasks` ─DR→ `D-task-filters` ─DR→ `D-task-row` ─PN→ `X-queue` ─(body)→ `X-calllog` | `P-tasks` (queue mode) ─(body)→ `X-calllog` ─(repeat)→ `X-calllog` ─PN→ `X-note`; the list switch and the filters door appear only when a subset is wanted | 1, 2 |
| C-28 | specs/07-tasks.md | §3, new subsection | LinkedIn is a task kind and nothing more | **"LinkedIn step"** (`X-linkedin`): the message text (editable for this send; "Personalise for Amara" leaves the step's copy alone), Copy message, Open the profile, Mark complete under the line "ollopA cannot see LinkedIn. Marking complete records that you sent it and advances the sequence." | 4, 7 |
| C-29 | specs/07-tasks.md | §3, the LinkedIn panel and the queue header | No counter anywhere | **"Invites this week: 38 of about 100"**, counted from completed LinkedIn tasks, with "the cap is LinkedIn's, not ollopA's"; within ten of the cap, "Snooze the rest to Monday" as a visible control | 7 |
| C-30 | specs/05-sequences.md | §3.3, the LinkedIn step editor | "A note the task will show" | The **message text** with the variable menu, so the task shows copy written once on the step | 5 |
| C-31 | IA-MAP.md | §2.7 and §5 (S11) | `X-thread` is a level-2 panel; `X-reply` hangs off it; S11 goes thread → `D-agent-item` → `X-reply` | `X-thread` becomes **level 1** (the detail half of a master-detail page); `X-reply` is a level-2 door on `P-inbox` and `R-person`; S11 becomes `P-inbox` ─DR→ `D-inbox-filters` ─RC→ (thread) ─DR→ `D-thread-agent` ─(composer)→ send ─PN→ `X-meeting` ─LK→ `R-person` ─PN→ `X-enrol` | 2 |
| C-32 | specs/06-inbox.md | §3 Actions and §6 doors | The agent is absent from the page | On the row and at the top of the panel: "Read as: Interested · by the reply agent · change" as text, the correction logged through the existing control. Beside the composer: the door **"Agent draft · 142 words"**, loading the draft marked "Agent draft, not sent". Sending is the approval, per item, recipient and text on screen | 6, 7 |
| C-33 | specs/13-agents.md | §3, "What waits, and what does not" | Silent on replies shown in the Inbox | One line: a reply draft shown in the Inbox composer is approved there and does not also appear in the Agents queue; the ledger still records it | 7 corollary |
| C-34 | IA-MAP.md | §2.7 and §5 (S12, A2, C1, C2, C4) | `X-book` and `X-meeting` as two panels | Merged into **`X-meeting`** with states (proposed → booked → held / no-show / cancelled); parents `P-inbox`, `P-tasks`, `R-deal`, `R-company`; the walks name `X-meeting` alone | 2 |
| C-35 | specs/06-inbox.md | new §3.6 | Book meeting drafts a reply with the calendar link, and stops | **"Book and run the meeting"** owns `X-meeting` for the product (07 and 09 render it): times or link; attendees; **status buttons** Booked · Held · No-show · Cancelled, marked by a person; the prep brief with "Write the handoff brief"; the follow-up draft; on a no-show, "Start the reminder and reschedule sequence", naming the sequence and what it sends | 7 |
| C-36 | specs/06-inbox.md | §3.6, the handoff block | Nothing | The four fields in the buyer's words, each with the agent's draft marked as a draft; the business's binary qualification checklist; **"Create the deal and assign"** labelled "Creates a deal at Qualified for Elena Vasquez — territory UK enterprise · change"; under it "Your handoffs accepted this quarter: 88% (17 of 19)" | 5, 7 |
| C-37 | specs/09-deal-record.md | §3.2 and the header | "Create deal from this reply (opens the deal record prefilled)" | States the prefill and the owner rule, and the deal header shows "Handed over by Marcus Adeyemi · handoff brief" as a link | 5 |
| C-38 | specs/00-shell-signin-palette-notifications.md | §3.4, the bounce-guard row | Opens Settings › Email sending › Bounce guard, sequence named | Opens the **paused sequence at its health line**; a mailbox-level trip with no single sequence still opens Settings; the row text keeps both numbers | 4 |
| C-39 | specs/01-home.md | §3, the health strip | The bounce item links "to where it is fixed" | Links to the paused sequence when one is paused, to Sequences filtered to Auto-paused when several are, to Settings otherwise | 5 |
| C-40 | specs/14-settings.md | §6, Email sending | The domain row is admin-only | The SDR seat reads the domain row and `X-domain` — SPF, DKIM, DMARC, bounce rate visible, editing absent, with "Daniel Okafor (RevOps admin) changes these" | 7 |

### The map

| # | File | Location | Current | New | Rule |
|---|---|---|---|---|---|
| C-41 | IA-MAP.md | §2.3 | `D-person-activity` "All activity · n" as a door on `R-person` | Removed; the contact record's activity is the main timeline with filter chips (object state, no level); `X-calllog` opens from a call item. The journeys column on `X-calllog` gains L3 | 1 |
| C-42 | IA-MAP.md | §2.14 | `X-domain` seats: OPS | Seats: OPS, SDR (read) | 7 |
| C-43 | IA-MAP.md | §3, entry edges | The Home health strip reaches `X-errors`, `S-sending`, `X-credits`, `W-connect` | Adds `P-home` §Health strip → `R-sequence` (auto-paused), and `G-bell` bounce row → `R-sequence` | 4, 5 |
| C-44 | IA-MAP.md | §4, the level check, and §5 (S10) | `P-tasks` counted from the list; S10 walks `P-tasks` ─DR→ `D-task-row` ─PN→ `X-linkedin` | The queue is the SDR and AE default and the list is a switch, not a nested door, so the density note stands and the depth does not change; S10 becomes `P-tasks` (queue mode) ─(body)→ `X-linkedin` ─(outside)→ ─RT→ `X-linkedin` (mark complete) ─(next)→ `X-linkedin` | 2 |
| C-45 | IA-MAP.md | §6.5 | Nine nodes handed to the specs, unassigned | Records the owner of each SDR node decided here: `X-calllog` and `X-linkedin` → spec 07; `X-meeting` → spec 06 §3.6, rendered by 07 and 09; `R-brief` → spec 09 §6.8; `W-import`, `R-job`, `X-enrich` → new spec 17; `P-templates`, `R-template` → spec 05 §3.9 | Map §6.5 |

### The usage model

| # | File | Location | Current | New | Rule |
|---|---|---|---|---|---|
| C-46 | src/ollopa/usage/tasks.ts | Actions area | `tasks.outcome` "Call outcome on done" only | Adds `tasks.call-disposition` (critical; sdr 90, ae 35, cs 8, admin 8; F admin 80, R sdr 12), `tasks.call-purpose` (sdr 55, ae 20), `tasks.call-duration` (sdr 40, ae 15), `tasks.call-notes` (sdr 70, ae 30, cs 12), `tasks.dnc-badge` (critical; sdr 60, ae 20, cs 6), `tasks.linkedin-message` (sdr 55; H sdr 60, R sdr 8), `tasks.linkedin-copy` (sdr 55), `tasks.invite-counter` (critical; sdr 25; H sdr 40), `tasks.queue-sort-score` (sdr 20, ae 5). The comment block and the §4 shape check are recomputed; the SDR density argument stands and point 2 stays a 1 | 1, 7 |
| C-47 | src/ollopa/usage/people.ts | Actions and Filters | No enrich panel, persona or job-change items | Adds `people.enrich-panel` (sdr 45, ae 15, mk 10, admin 10; F admin 80), `people.dnc-exclusion` (critical; sdr 30; F admin 60), `people.persona-filter` (sdr 30, mk 35, ae 10), `people.job-change-update` (sdr 12; R sdr 30) | 1, 7 |
| C-48 | src/ollopa/usage/lists.ts | Detail header | No touches line | Adds `lists.touch-estimate` (sdr 40, mk 15, admin 10; H sdr 55) | 7 |
| C-49 | src/ollopa/usage/sequences.ts | Steps, People | No template, promotion or capacity items | Adds `seq.use-template` (sdr 30, ae 10, admin 15; F sdr 45), `seq.variant-progress` (sdr 20; F sdr 35), `seq.promote-variant` (critical; sdr 12), `seq.mailbox-capacity` (critical; sdr 55, admin 30; H sdr 85) | 5, 7 |
| C-50 | src/ollopa/usage/inbox.ts | Rows and panel | No agent items | Adds `inbox.agent-class` (sdr 70, ae 40), `inbox.agent-draft` (critical; sdr 55, ae 30), `inbox.meeting-panel` (sdr 45, ae 35, cs 20), `inbox.handoff-block` (critical; sdr 40), `inbox.acceptance-rate` (sdr 20) | 6, 7 |
| C-51 | **new** src/ollopa/usage/import.ts, registered in index.ts | — | No file | Items for the wizard (file and mapping, duplicate policy, provider order, ten-row trial with cost per hit as critical, run and resume), `R-job` (matched, credits, cost per hit, unmatched rows) and `X-enrich`, with Halyard overrides at roughly double the Meridian numbers, per business practice | 1, 7 |

---

## Notes for the apply pass

1. **C-23 is the S1 decision.** If the S1 change list already carries it, apply it once and drop the duplicate.
2. **C-31 and C-34 touch walks outside this group** (A2, C1, C2, C4, G2, L3). They change node typing and parentage, not the work those journeys do; the AE and CS walks should be re-read against the amended map rather than re-decided.
3. **One new spec file and one new usage file** are proposed: `specs/17-import-and-enrichment.md` and `src/ollopa/usage/import.ts`. Everything else is an edit to a file that exists.
4. **Nothing in this walk adds a level.** Three changes remove one (C-31, C-34, C-41); the rest add items at level one or write down a level-2 node that already existed in the map.
