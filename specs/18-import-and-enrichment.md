# Import and enrichment

*The eighteenth spec. One wizard page (`W-import`), one record (`R-job`), one panel (`X-enrich`), and the job-change sweep that turns a signal into a new prospect. Usage items: `src/ollopa/usage/enrichment.ts`. Nodes: IA-MAP 2.15. Reached from People, Companies and Lists, from ⌘K and by deep link; its header offers "Add to sidebar" like any page a profile leaves out.*

## 1. Purpose

Three jobs that are one job: **get rows in**, **buy the missing fields**, and **read what it cost and what it got**.

- **`W-import`**, the import wizard: a file arrives, its columns are matched to fields, duplicates and ownership are decided, the enrichment lineup is set, ten rows are run as a trial, and then the file runs.
- **`X-enrich`**, the reveal panel: a selection on People or Companies, a choice between two prices, and one line about who must not be called.
- **`R-job`**, the enrichment job: what ran, what matched, what it cost, what did not match, and what to drop.
- **Job changes**: a contact moved employer. Update the record or create a new one — and the answer depends on whether the new employer already belongs to somebody.

Who lives here: the **SDR** (revealing daily, importing every few weeks), the **RevOps admin** (the provider order, the job report when credits spike, the compliance question of what a run touched), and the **marketer** (importing an event list). No AE and no CS seat: neither imports a file or buys a phone number, so none of this is on their page at all.

How often: Halyard's ops lead runs this **weekly**, once per client workspace — which is why a saved column mapping, rare everywhere else, is the agency's most-used control on the page. Fathom's founders reveal **daily** and the credits are their own money. Meridian's SDRs import every few weeks and reveal as part of building a sequence. Ridgeline barely imports; what they do here is the monthly job-change sweep, which produces the best lead a product-led business gets.

The one thing they must never lose sight of: **what this run will cost, and what it will cost per useful result.** A total is not enough. One phone waterfall can reach 45+ credits, mobiles are charged even for numbers nobody may call, and nothing is refunded. So the page's centre is not a progress bar; it is a ten-row trial that prints the hit rate and the **cost per hit** before the button that spends the rest.

This page is a **page**, not a drawer. Specs 02, 03 and 04 called Import CSV a drawer; the map makes it a level-1 wizard, and the map wins on the existence and parent of a node. It is also right on the merits: five stages, a trial run, a spend and a resume is an independent task, and rule 5's container guidance gives an independent task a page.

## 2. Data

Sources are `src/ollopa/data/seed.ts`, `businesses.ts` and the `settings` object spec 14 §2.2 adds. The seed's fixed "today" is 13 September 2026.

| Field | Where shown | Source | To add to seed |
|---|---|---|---|
| File name, size, row count, uploaded by and when | Step 1, job header | none | `importDrafts[]`: `{ id, file, rows, uploadedBy, uploadedAt, step, answers }`. One at Halyard, mid-run, so resume has data |
| Column headers and the field each maps to | Step 1 | `Contact` and `Company` in `seed.ts`, plus custom fields from Settings `pipe.fields` | `importDrafts[].mapping: Record<header, field \| null>` and three preview rows |
| Saved mappings per client | Step 1 | none | `importMappings[]`: `{ name, workspace, mapping, lastUsedOn }`. Four at Halyard, one at Meridian, none elsewhere |
| Duplicate counts: matched, of which owned by someone else | Step 2 | `seed.contacts` (exists) | computed at render from the file against the seed; the counts are real, not written down |
| Owner, list, stage for new rows | Step 2 | `businesses.roles`, `seed.lists`, `STAGES` | nothing |
| Fields enrichment may fill | Step 3 | `Contact` fields | nothing |
| Provider lineup and the workspace default | Step 3 | Settings `pipe.enrichment-order` (exists: Northlight Data → Beacon Verify → ollopA) | nothing; the step names the setting and links to it |
| Stop rule and per-row ceiling | Step 3 | none | `settings.prospecting.waterfall: { stopAtFirstVerified: true, ceilingPerRow: 12 }` per business |
| Trial result: hit rate by field, credits, cost per hit, projected total | Step 4 | none | computed from `enrichmentRates` per business: `{ field, hitRate, typicalCost }` — email 0.72 at 2, mobile 0.41 at 9, title 0.88 at 1, company size 0.93 at 1 |
| Run progress, stopped at, resume token | Step 5 | none | `importDrafts[].progress: { done, total, credits, stoppedAt? }` |
| Job: source, fields, provider order, rows, matched, credits, cost per hit | `R-job` header | none | `enrichmentJobs[]`: `{ id, source: "import" \| "reveal" \| "api" \| "job-change" \| "form", sourceLabel, startedBy, startedAt, keyId?, fields[], providers[], rows, matched, credits, byField[], unmatchedIds[] }`. Meridian 6, Halyard 14, Fathom 9, Ridgeline 4 |
| What was charged and what was not | `R-job` | the credit rules, stated once here | `enrichmentJobs[].charging: { chargedRows, freeRows, note }` |
| Selection size, per-row estimate, total, balance after | `X-enrich` | `businesses.credits` (exists) | nothing; computed |
| Do-not-call flags in a selection | `X-enrich` | `Contact.doNotCall` (spec 02) | a count per seeded selection; 18 of 25 in the Fathom example |
| Restricted-by-region people | `X-enrich`, tables | Settings `pros.gdpr` | `Contact.restrictedBy?: string` — "EU region rule" |
| Job-change signal: what fired, when, from where, old and new employer | Job-change block | `Contact.signals` (spec 02) | `Contact.jobChange?: { firedOn, source, previousCompany, previousEmail, newCompanyId? }`. Ridgeline 14, Meridian 4, others 1 |

`enrichmentJobs[]` is defined here and read by spec 14 (`X-credits`' feature and surface breakdowns link to a job), spec 17 (`X-key` links to the jobs a key ran) and spec 19 (a form's enrichment spend is a job). One entity, four readers.

## 3. Features

### 3.1 The import wizard, five steps

Route `import`, with the source object in the query (`?object=people`). One step per screen, each with at most one door and never a door inside one. Every step's heading reads "Step 3 of 5: Fields and providers", and a step list beside the form (above it on a phone) names each step and its state in text. Buttons are named for where they go — "Continue to the trial", "Back to duplicates" — never "Next". "Save and exit" is on every step, and a constant line under the heading reads **"Nothing is charged until you press Run."**

**Step 1 — File and columns.** Upload; the row count; the header row matched to fields, with **three rows previewed** under the mapping so a wrong guess is visible rather than discovered. Unmapped headers are listed with "Ignore" or "Create a custom field". At Halyard, one control above the mapping: "Use a saved mapping ▾ (4)", and after the mapping is edited, "Save this mapping for Kestrel Health". The door: "Formatting: encoding, delimiter, date format, phone country (4)" — the questions a file raises once and never again.

**Step 2 — Duplicates and owner.** Three options, each with its own sentence, computed against the file:

- *Update existing* — "Changes fields on 41 records. 12 of them are owned by someone else; their owner does not change."
- *Skip* — "Leaves 41 records as they are. 1,199 new rows are imported."
- *Create anyway* — "Creates 41 second records. Your duplicate rule says 'prompt', so this is the one place it is overridden."

Then owner, list and stage for the new rows. The duplicate rule the workspace declared is named with a link: "Workspace rule: prompt on duplicate · Settings › Prospecting rules."

**Step 3 — Fields and providers.** Which fields enrichment may fill, each with its typical cost beside it. The **provider lineup** in order, with the workspace default named and where it is set: "Workspace default: Northlight Data → Beacon Verify → ollopA · Settings › Pipeline and data › Enrichment provider order. Change it for this run only." Then two price controls at level one: **stop at the first verified result, or continue down the waterfall**, and **the most this run may spend on one row**. These two are not preferences; the first is the difference between 8 credits and 45 on a phone waterfall, and rule 7 puts a price control where the price is.

**Step 4 — The ten-row trial.** Run ten rows. Print, as a table: field, hit rate, credits spent, **cost per hit**. Then one line: "At this rate, 1,240 rows will cost about 4,900 credits — 2,660 of your balance after this run. Email lands on about 7 in 10; mobile on about 4 in 10." Then two buttons: "Run the other 1,230" and "Change the fields or the providers", which goes back to step 3 and returns. The trial's ten rows are charged, and the line says so.

**Step 5 — Run.** Progress by row and by credit; "Stop" (which keeps everything done so far and says so); and one line: "You can close this tab. The run continues and you will find it under Past imports." The wizard ends on the **job record**, never on a toast. A run that stops at the per-row ceiling or at the workspace cap says which, and offers "Raise the ceiling" or the credits panel.

**Exit and resume.** Every answer is saved as it is made. The entry points (People, Companies, Lists) show "Import · 3 of 5 steps done · Resume · Discard", as the connect wizard does. Discard asks once and says what is lost.

### 3.2 `X-enrich` — reveal and enrich a selection

Opened from the selection bar on People or Companies. The single-row buttons keep their one click and their price on the control; the panel is for a selection, and the accelerator is not taken away.

Flat panel, no doors, in this order:

1. **What to reveal.** Verified email · Email and mobile. Two radios, each with its own per-row estimate, because a mobile costs about four times an email and this is the journey's first decision.
2. **The estimate.** "25 people × about 11 credits = about 275 credits. Balance after: 3,845."
3. **The line that cannot be moved behind anything.** "18 of the 25 carry a do-not-call flag. A mobile for those is charged and cannot be called. They are excluded — include them anyway ☐."
4. **Restricted people.** "2 are restricted: EU region rule · Prospecting rules." They keep their rows and their place in the count; the action is replaced by the rule, never silently filtered.
5. **Which revealed fields become columns afterwards.**
6. The button, carrying the total: "Reveal 23 · about 253 credits".

The do-not-call flag used to live in the filters panel and the spend on the selection bar. That is the two things a person weighs together sitting on opposite sides of a door — rule 5 — and the charge is not refunded, so rule 7 puts the sentence where the money is spent.

A reveal of more than a handful of rows creates a job record, so §3.3 is where the result is read.

### 3.3 `R-job` — the enrichment job

A record from the shared template (`RecordPage`): header, sections, one door.

**Header**, all level one: source ("Import: kestrel-q4.csv" · "Reveal from People" · "API key: Nightly enrichment" · "Job change sweep" · "Form: Request a demo"), who started it and when, the fields, the provider order as run, rows, matched, **credits**, and **cost per hit**. Cost per hit is in the header because it is the number the next run is designed from, and a reader should never have to compute it.

**Sections**, scrolling, no doors between them:

- **By field.** Field, attempted, matched, hit rate, credits, cost per hit, and which provider returned it. The row that cost the most sits where its number puts it, not first.
- **What was charged and what was not.** One short block, always present: "A row that returned nothing was not charged. A mobile that returned for a do-not-call number was charged and cannot be called. Nothing here is refunded." A fee statement, so it is on the record and not in a help article, whatever its usage number.
- **Unmatched rows**, with "Drop these 214 from the list" and what dropping does.
- **Run the unmatched rows again** with a different provider order, priced before the button.

**One door**: "All rows · 1,240" — long content nobody reads alongside the report.

**Four parents.** The wizard's end; the reveal panel; Settings › Prospecting rules (for the compliance sweep); `X-credits` (from a spend row); and `X-key` (the jobs a key ran). One record, reached from wherever the question was asked.

### 3.4 Job changes and re-prospecting

A job-change signal fires on a contact. The bell carries it as a **digestible** kind, grouped per signal per day ("3 contacts changed job · Ridgeline ICP"), and opens People filtered to that signal; spec 00 owns that row.

On the contact — in the row actions and on the record header while the signal is live — one control: **"Job change · confirm and update"**. It opens in place with two options, each with what it keeps:

- *Update this record* — "One timeline. The old employer stays in the history, and the old address is kept and marked bounced."
- *Create a new contact* — "The old record keeps its history and is linked to this one. You choose its stage."

Under both, one line about the new employer, because it decides whether this is a fresh prospect or somebody else's account: **"Northwind Analytics is already an account · owner Elena Vasquez · 2 open deals"**, or "Northwind Analytics is not in the workspace yet." That answer used to be two navigations away, on the far side of the moment the decision is made (rule 5).

Then the new address and its verification state with its price, and — for a sweep rather than one record — "Enrol the 9 movers in 'Welcome back'", with the net-new count and the cost. Merge existed in the product and its opposite did not; this is the opposite.

### 3.5 Actions and outcomes

| Action | Where | Outcome |
|---|---|---|
| Upload a file | Step 1 | Rows counted, headers matched, three rows previewed; a draft exists from this moment |
| Use or save a mapping | Step 1 | Applied at once; saving names the client workspace |
| Choose a duplicate policy | Step 2 | The three counts under the options recompute |
| Change the provider order for this run | Step 3 | One line: "For this run only. The workspace default is unchanged." |
| Run the trial | Step 4 | Ten rows charged; the table and the projection print; nothing else has been spent |
| Run | Step 5 | Progress; the job record when it ends or is stopped |
| Stop a run | Step 5 | Stops at the current row; what is done is kept; the job record says where it stopped |
| Resume | Entry points, Past imports | Opens at the first step not done, or continues the run |
| Reveal a selection | `X-enrich` | The rows update in place; a job record is written; the credits pill changes |
| Drop unmatched rows | `R-job` | "Removes 214 from 'Q4 enterprise outbound'. The records stay in the workspace." |
| Re-run the unmatched | `R-job` | Priced first, then a second job record linked to the first |
| Export the job report | `R-job` | CSV; exporting a table a seat can already read is on every plan |
| Confirm a job change | Contact | One record updated, or two records linked; the ledger records which and by whom |

**Bulk:** the selection bar is the bulk action; there is no bulk action on this page's own lists. **Sorting:** past imports and jobs newest first; the by-field table sorts by any column and defaults to the order the fields were requested in, not by cost, because the reader is checking a list they wrote.

### 3.6 States

| State | What shows |
|---|---|
| No file yet | The upload target, the accepted formats, and the two facts that decide the run: "Enrichment is charged when a source returns data. A row that returns nothing is free." |
| A draft exists | "Import · 3 of 5 steps done · Resume · Discard" at every entry point |
| Trial shows a poor hit rate | Nothing is blocked. The projection prints and one line reads: "Mobile lands on about 2 in 10 here. At 9 credits a hit that is about 45 credits per useful number." Judgement is the reader's |
| Over the per-row ceiling | The row stops at the ceiling, is marked, and the run continues; the job report counts them |
| At the workspace cap | The run stops, keeps what is done, and says: "Stopped at 14:20 — the monthly cap. Resets 2 Oct. Daniel Okafor can raise it." |
| Running with the tab closed | Past imports shows it; Home's health strip shows nothing, because a normal run is not an exception |
| Nothing matched | A real zero, shown as data: "0 of 240 matched. 0 credits. Nothing was charged." with the by-field table showing the attempts |
| Error mid-run | "Stopped at row 612 — Northlight Data did not answer. 611 rows kept, 1,840 credits spent. Resume" |
| No access (AE, CS) | "Importing and enriching is done by SDRs, marketers and RevOps admins here. Daniel Okafor (RevOps admin) can add it to your permission profile." No greyed controls |
| Restricted people in a selection | Their rows stay and count; the action reads "Restricted: EU region rule · Prospecting rules" |
| A person on the removal list | Not importable and not enrichable; the row says so and links to the removal list. The count is never silently shortened |

### 3.7 Keyboard, accessibility, phone

Native controls throughout. Enter submits the step's primary button; Escape closes a confirmation and never leaves a step. Focus moves to the `h1` on each step change, and the step state is text, so a screen reader hears progress first. The mapping table is a real table: each row is header → field, with the field select labelled by the header. The trial table has a caption naming the ten rows and the total. Hit rates are printed as both a fraction and a percentage, never as a bar alone. The do-not-call line is inside the same group as the button it governs, so it is read before the button is reached, and its checkbox has a visible label. Nothing is hover-only; every target is at least 40 px.

At phone width the step list collapses to "Step 3 of 5 · Show steps", the mapping table becomes one card per column, the trial table scrolls inside its own container, and `X-enrich` becomes a full-height sheet with the button pinned under the do-not-call line rather than above it. Nothing gains a level.

### 3.8 By role and by business

| | SDR | Marketer | RevOps admin |
|---|---|---|---|
| Wizard | Whole thing | Whole thing | Whole thing, plus the provider-order link into Settings |
| `X-enrich` | Daily | Occasional | Rarely; the admin sets the rules rather than spending against them |
| `R-job` | The job they started | Theirs | Every job in the workspace, and the route in from a key and from the credit breakdown |
| Job changes | Confirm and update | Read | Read; sets whether the signal exists at all |

| Business | What changes |
|---|---|
| **Fathom Labs** | Daily reveals on the founders' own money. The estimate, the balance after and the do-not-call line are read every single time; the per-row ceiling and the stop rule are set tight and checked. Imports happen but are small. The charging block is read more here than anywhere, because there is no finance department between the founder and the bill |
| **Meridian Software** | Baseline. The SDR imports an event list every few weeks and reveals while building sequences; the admin never imports and comes only for the job report when credits spike and for the compliance question of what a run touched |
| **Halyard Agency** | The page. A client list arrives weekly; the saved mapping, the file step, the trial and the run are the whole routine, ten workspaces over. Everything else on this page is tail for them, which is the correct shape: the agency does not reveal single rows, it runs files |
| **Ridgeline** | Almost no importing. The monthly job-change sweep is what they come for, and the "already an account, owner, open deals" line is the one that decides the month's best leads |

## 4. Usage items

Share of active users in a role touching the item in a typical week (USAGE-MODEL.md). Baseline is Meridian. **DC** = decision-critical, level one whatever the number. No AE or CS column: neither seat has a number for any item, so none of this is on their page. The same table is `src/ollopa/usage/enrichment.ts`.

| Item | Area | SDR | Mkt | Admin | Overrides (Fa, Ha, Ri) | DC |
|---|---|---|---|---|---|---|
| Reached from People, Companies, Lists, ⌘K; "Add to sidebar" | The import wizard | 8 | 5 | 4 | Ha 18/18; Fa 6/8; Ri 3/3/3 | |
| The file and its columns, three rows previewed | The import wizard | 20 | 8 | 5 | Ha 55/55; Fa 15/18; Ri 5/4/3 | |
| Save this mapping for this client | The import wizard | 3 | 2 | 2 | Ha 45/45; Fa 2/2; Ri 2/1/1 | |
| Duplicates: update, skip or create, each with its counts | The import wizard | 18 | 8 | 6 | Ha 30/30; Fa 12/15; Ri 4/3/3 | ★ |
| Owner and list for the new rows | The import wizard | 15 | 7 | 4 | Ha 25/25; Fa 10/12; Ri 4/3/2 | |
| Which fields enrichment may fill | The import wizard | 14 | 8 | 5 | Ha 15/15; Fa 12/15; Ri 4/4/3 | |
| The provider lineup, default named and linked | The import wizard | 8 | 4 | 12 | Ha 12/14; Fa 14/18; Ri 3/2/5 | |
| Stop at the first verified result, or continue | The import wizard | 8 | 3 | 6 | Ha 10/12; Fa 14/16; Ri 3/2/3 | ★ |
| The most this run may spend on one row | The import wizard | 8 | 3 | 6 | Ha 12/14; Fa 20/25; Ri 3/2/3 | ★ |
| The ten-row trial: hit rate, credits, cost per hit, projection | The import wizard | 20 | 8 | 6 | Ha 40/40; Fa 24/30; Ri 4/3/3 | ★ |
| Progress, stop, and the resume line | The import wizard | 16 | 6 | 4 | Ha 45/45; Fa 10/12; Ri 4/3/2 | |
| Encoding and delimiter | The import wizard | 4 | 2 | 2 | Ha 4/4; Fa 2/2; Ri 1/1/1 | |
| Date and number formats | The import wizard | 3 | 2 | 2 | Ha 3/3; Fa 1/2; Ri 1/1/1 | |
| Default country for phone numbers | The import wizard | 3 | 2 | 2 | Ha 4/4; Fa 2/2; Ri 1/1/1 | |
| Rows with no email: skip or import | The import wizard | 4 | 3 | 2 | Ha 4/4; Fa 3/3; Ri 1/1/1 | |
| Tell me when the run finishes | The import wizard | 4 | 2 | 2 | Ha 4/4; Fa 2/2; Ri 1/1/1 | |
| Repeat this import on a schedule | The import wizard | 2 | 2 | 3 | Ha 3/3; Fa 1/2; Ri 1/1/2 | |
| Past imports, and the job each produced | The import wizard | 4 | 3 | 5 | Ha 4/4; Fa 3/4; Ri 2/2/2 | |
| What to reveal: email, or email and mobile | Reveal and enrich | 35 | 10 | 4 | Fa 70/75; Ha 15/12; Ri 8/4/2 | ★ |
| Per-row estimate, total, balance after | Reveal and enrich | 35 | 10 | 4 | Fa 70/75; Ha 15/12; Ri 8/4/2 | ★ |
| The do-not-call line, and that they are excluded | Reveal and enrich | 30 | 6 | 4 | Fa 60/65; Ha 12/10; Ri 6/3/2 | ★ |
| The single-row reveal keeps its click and its price | Reveal and enrich | 45 | 8 | 4 | Fa 75/80; Ha 18/12; Ri 10/4/2 | |
| A restricted person keeps their row and the rule replaces the action | Reveal and enrich | 4 | 3 | 8 | Fa 3/4; Ha 4/6; Ri 4/3/5 | |
| Which revealed fields become columns | Reveal and enrich | 4 | 3 | 2 | Ha 4/4; Fa 4/4; Ri 2/2/1 | |
| Source, fields, providers, rows, matched, credits, cost per hit | The job report | 22 | 8 | 22 | Ha 45/45; Fa 28/35; Ri 5/4/5 | ★ |
| By field: what landed, what did not, from which provider | The job report | 14 | 7 | 14 | Ha 25/25; Fa 16/18; Ri 4/3/4 | |
| Unmatched rows, and "Drop these from the list" | The job report | 12 | 5 | 12 | Ha 30/30; Fa 15/18; Ri 4/3/4 | |
| Email verification status landing after the run | The job report | 12 | 4 | 8 | Ha 15/15; Fa 25/30; Ri 4/2/3 | |
| All rows · n | The job report | 6 | 3 | 6 | Ha 10/10; Fa 6/8; Ri 2/2/2 | |
| Reached from a key, from Prospecting rules, from the credit breakdown | The job report | 3 | 2 | 10 | Ha 4/14; Fa 4/8; Ri 2/2/5 | |
| Re-run the unmatched with a different order, priced first | The job report | 4 | 2 | 6 | Ha 10/10; Fa 6/8; Ri 2/1/2 | |
| Export the job report | The job report | 3 | 2 | 4 | Ha 4/4; Fa 2/3; Ri 1/1/2 | |
| What was charged and what was not | The job report | 4 | 2 | 6 | Ha 4/4; Fa 12/15; Ri 2/1/3 | ★ |
| The job-change signal: what fired, when, from where | Job changes | 5 | 4 | 3 | Ri 35/20/8; Fa 3/3; Ha 3/3 | |
| Update this record, or create a new contact | Job changes | 4 | 3 | 3 | Ri 30/12/6; Fa 3/3; Ha 3/2 | ★ |
| Whether the new employer is already an account, and whose | Job changes | 4 | 3 | 3 | Ri 30/12/6; Fa 3/3; Ha 3/2 | ★ |
| The old address and its bounce state | Job changes | 3 | 2 | 2 | Ri 25/8/5; Fa 2/2; Ha 2/2 | |
| Enrol the movers, with the net-new count and the cost | Job changes | 3 | 2 | 2 | Ri 20/8/4; Fa 2/2; Ha 2/2 | |

Eleven of thirty-eight are decision-critical, and nine of the eleven are about money: the price of a choice, the ceiling on a run, the cost per hit, what is charged and what is not. That is what this page is.

**Shape check**, computed from `enrichment.ts` with `shape()`. The denominator is every item that exists for that role at that business.

| Pair | Items on their page | Head | Body | Tail | Verdict |
|---|---|---|---|---|---|
| Halyard SDR | 38 | 9 (24%) | 12 (32%) | 17 (45%) | Fits exactly. The resident seat: the file, the mapping, the trial, the run and the report |
| Halyard admin | 38 | 9 (24%) | 14 (37%) | 15 (39%) | Head fits; body two points over and tail six under. The ops lead holds both jobs at an agency, so the middle of this page is her week |
| Meridian SDR | 38 | 7 (18%) | 13 (34%) | 18 (47%) | Fits |
| Fathom SDR | 38 | 8 (21%) | 13 (34%) | 17 (45%) | Fits. The head is the reveal panel and its four price lines |
| Fathom admin | 38 | 8 (21%) | 14 (37%) | 16 (42%) | Fits, two points over on the body |
| Meridian admin | 38 | 1 (3%) | 16 (42%) | 21 (55%) | **No head.** The admin is a visitor: they set the provider order and read the job report when credits spike. Honest, not a gap — the eleven critical items still render, and the one head item is the job header, which is what they come for |
| Ridgeline SDR | 38 | 5 (13%) | 6 (16%) | 27 (71%) | Head and body under. Ridgeline uses one of the four areas — job changes — and the rest of the page is a tail they walk past monthly |

## 5. Before: the common version

Apollo's import and enrichment is the most credit-dense part of the product, and it is spread across four entry points, a settings page, an emailed file and a report that is one level under a tab. Every problem carries its source; nothing is asserted without one.

### 5.1 Where the work lives

1. **Import a CSV of contacts** (`16-apollo-workflow-inventory.md` §3, KB 4409161532045). "People > Import > CSV > map headers > stage, duplicate handling, owner, account auto-assign, CRM create/update > **Data enrichment: phones, emails, Multi-source (waterfall)** > review estimate > Import > check **Settings > Imports and exports**." Enrichment on import "charges, **paid plans only**". "Avoid >10,000 rows"; weekly rolling row caps by annual spend (≥$1k 100k rows, ≥$100k 10M rows).
2. **Import a CSV of accounts** (§3, KB 4409154067981): website inference has "a **~5% error rate**".
3. **Enrich a CSV** — a different surface from importing one (§4, KB 4409226361229). "Data enrichment > CSV > Import CSV > Edit settings to pick fields > upload > map columns > choose emails, mobiles or both > Confirm > **Apollo emails the file**." Limits: ".csv, ≤50 MB, ≤100,000 rows"; "Multi-source disabled above 50,000 rows"; "limits don't reset each cycle"; and "**deleting results does not refund**".
4. **The CSV enrichment report** (§4, KB 4410613330701): "Data enrichment > CSV > Progress, Total, Matched, Duplicates > Download or View report > Records Enriched, Completeness Score before/after, Matched vs Unmatched Fields, Emails and Phones enriched."
5. **The waterfall lineup** (§4, KB 34071121664781): "People > Configure Waterfall settings (or Settings > Waterfall enrichment) > Add sources > drag to order (**Apollo is always first**) > connect a validator > **stop on verified or on any** > Save & run." Per-action: "toggle Find data via Waterfall".
6. **Job-change enrichment** (§4, KB 5130064363661): "Settings > Prospecting config > toggle Job Change Alerts. Then People or Lists > Job Change filter > Enrich > Enrich job change > preview > waterfall toggle > **Update existing contact or Create new record** (assign the outdated record a stage) > Yes, Update." "Charges either way; waterfall **on by default**; never charged twice for data already bought."
7. **Waterfall reporting** (§4): "Analytics > Dashboards > Waterfall Enrichment Performance; and Settings > System activity > Data requests > Waterfall > open a run > credits, enriched, verified, unverified, unavailable." And the line that matters: reports show "**Apollo credits only**, not API-key source charges."

### 5.2 The credit model, which is the real "before"

All from `16-apollo-workflow-inventory.md` §"The credit model, once", quoted from Apollo's KB:

- "Verified email / net-new contact saved: **1 credit per contact**, however many addresses return."
- "Mobile or personal phone: Charged **even for DNC-listed numbers**. **No refunds.**"
- "Waterfall enrichment: Charged **only when a source returns data**; a run that finds nothing is free. A validator charges extra. Email and mobile use **separate balances**. API-key sources bill you directly."
- "Enrich a saved contact's email or phone: Charged **even if the value is identical**."
- "Assign an owner to an **unsaved** record: 1 credit per record."
- "AI research: **1 credit per record per column** (100 contacts × 3 columns = 300)."
- "Spend is attributed to a **Surface** — Web App, Automation, Extension, MCP, API, CLI, Uncategorized — but only from **1 Feb 2026**."

And from `19-revops-and-developer-notes.md` §9, the published API price for the same waterfall: "Phone waterfall enrichment typically uses **8–25 credits**, but some configurations may result in **45+ credits**."

### 5.3 Documented problems

| Problem | Where it shows | Source |
|---|---|---|
| Two doors to one job | Importing a CSV enriches; enriching a CSV is a different surface with different limits and emails you the file | 16§3 and 16§4 |
| The estimate is a total, never a rate | "review the estimate > Import". No hit rate, no cost per hit, no trial | 16§3, 16§4 |
| A price that can vary five-fold, published only in the API docs | "8–25… may result in 45+ credits" | 19§9 |
| Charged for what cannot be used | Mobiles "charged **even for DNC-listed numbers**. **No refunds**" | 16, credit model |
| Charged for no change | "Charged even if the value is identical" | 16, credit model |
| Two balances, one number | "Email and mobile use **separate balances**" | 16, credit model |
| A report that does not report all the spend | "reports show **Apollo credits only**, not API-key source charges" | 16§4 |
| The result arrives by email | "Confirm > **Apollo emails the file**" | 16§4 |
| Limits that are not per cycle and are discovered late | "≤100,000 rows"; "Multi-source disabled above 50,000 rows"; "limits don't reset each cycle"; "Avoid >10,000 rows" | 16§3, 16§4 |
| Deleting does not undo the charge | "deleting results does **not** refund" | 16§4 |
| A settings toggle gates a whole workflow | Job Change Alerts is off until someone finds Prospecting config | 16§4 |
| Attribution arrived late and has an "Uncategorized" bucket | Surface attribution "only from 1 Feb 2026" | 16, credit model |

### 5.4 What Apollo gets right, and ollopA keeps

The estimate before the confirm ("estimates shown before you confirm", 16§4). "Charged only when a source returns data" — an honest rule, kept and printed. The stop-on-verified switch, kept and promoted to a price control. "Never charged twice for data already bought", kept. The enrichment report's matched-versus-unmatched split, kept and given a cost-per-hit column. And the update-or-create choice on a job change, which is the right pair of options; what is added is what each one keeps and who owns the new employer.

## 6. After: the disclosed version

### 6.1 Level one and level two

| Where | Level one | Level two |
|---|---|---|
| Step 1 | The file, the row count, the mapping, three preview rows, the saved mapping at Halyard | "Formatting: encoding, delimiter, date format, phone country (4)" |
| Step 2 | Three options, each with its computed sentence; owner, list, stage; the workspace rule named | none |
| Step 3 | Fields with their typical costs; the provider order with the default named; the stop rule; the per-row ceiling | "Per-provider settings (3)" where a provider has any |
| Step 4 | The trial table, the projection, the balance after | none |
| Step 5 | Progress by row and credit, Stop, the resume line | none |
| `X-enrich` | All six blocks in §3.2 | none. It is flat by design |
| `R-job` | The header's eight facts; by field; charging; unmatched; re-run | "All rows · n" |
| Job change | The two options with what each keeps; the new employer's ownership; the price | none |

The only doors on the page are the formatting questions, the per-provider settings and "All rows". Everything that decides a spend is at level one, on every business and for every seat that has the page.

### 6.2 Every door

| Label as shown | Container | Why |
|---|---|---|
| "Formatting: encoding, delimiter, date format, phone country (4)" | Expand in place, step 1 | Asked once per odd file; read beside the mapping it fixes |
| "Per-provider settings (3)" | Expand in place, step 3 | Depends on the lineup above it |
| "All rows · 1,240" | Expand in place at the foot of the job | Long, rarely needed beside the report |
| "Past imports (14)" | Page section at the entry point | A list, not a door on the wizard |

No door holds a price, a count that a decision depends on, or a consequence. Cover every label and you can still run the page correctly.

### 6.3 Persistence

Every wizard answer is saved as it is made, and a draft survives a closed tab, a sign-out and a week. The saved mapping persists per workspace, by name. The two doors' open state persists per user. `X-enrich`'s reveal choice persists per user per business, because a person who buys mobiles buys mobiles — but the estimate and the do-not-call line are recomputed every single time and are never remembered as "already read".

### 6.4 Accelerators

The saved mapping, which turns a five-step wizard into two steps for the agency. "Run the other 1,230" directly from the trial. Resume from a token rather than restarting. `⌘K` → "Import a CSV", from anywhere. Deep links to a job. And the one this page must not give: there is **no** "skip the trial and just run it" control, because the trial is the price disclosure, and an accelerator past a rule-7 item is a dark pattern with a keyboard shortcut.

### 6.5 Decision-critical

Eleven items (§4). The rule 7 test: without clicking anything, on any step, can the reader find what this will cost, what it costs per useful result, what is charged that cannot be used, and what stops it? Yes: the fields carry their typical costs, the trial prints the rate and the projection, the do-not-call line is inside the group with the button, and the ceiling and the stop rule are two controls at level one.

### 6.6 Removed rather than hidden

A second surface for "enrich a CSV" separate from "import a CSV" — one page does both, because they are the same act. The emailed result file: the run ends on a record with a URL. A separate waterfall settings page: the lineup is a workspace default in Settings and a per-run control here, named in both places. Two balances: one credit, one cap, one number. The "Uncategorized" surface: every job records the surface that started it. And the silent filter: a restricted or removed person is never subtracted from a count without a sentence.

### 6.7 The nine-point score

| # | Question | Score | Line |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | Per-field costs, the stop rule, the per-row ceiling, the trial's cost per hit, the do-not-call line, the charging block: all level one, all before the spend |
| 2 | Every visible item backed by a sourced number | 2 | Thirty-eight items in `enrichment.ts`; seven pairs shape-checked with one stated denominator |
| 3 | No path exceeds two levels on any screen size | 2 | Step → one door; record → "All rows"; panel → nothing. Same on a phone |
| 4 | Doors labelled by content, chevron and text | 2 | Three doors, each naming its contents and its count |
| 5 | Doors adjacent, keyboard and touch | 2 | Formatting under the mapping; per-provider under the lineup; "All rows" at the foot of the report |
| 6 | No dependent information split across a door | 2 | The do-not-call flag now sits with the spend, which is the violation this spec was written to fix; the provider order sits with its stop rule; the hit rate sits with its cost |
| 7 | State persists; expand-all and print | 2 | Drafts, mappings, door state; print expands the job report and every group |
| 8 | User action or object state, never inferred history | 2 | The job-change block appears because a signal is live on the record, which is object state; nothing reorders by what the person did last week; the remembered reveal choice changes no layout and no price |
| 9 | Instrumented; promote, keep or delete review | 1 | Trial completions against runs, door opens, and the do-not-call override rate are counted per role and business — an override rate that climbs is the number that says the line has stopped being read. Review scheduled; one point withheld until it has run |

**17 of 18.**

## 7. Lesson steps

Not a lesson. The four rules that mattered most:

- **Rule 7, and the difference between a total and a rate.** An estimate answers "what will this cost"; a trial answers "what will this cost me per useful result", which is the question actually being asked. A product that can vary five-fold on one field and shows only a total has disclosed a number and hidden the decision.
- **Rule 5, at the most expensive boundary in the product.** The do-not-call flag was in a filter panel and the money was on a selection bar. They are one decision.
- **Rule 4, on a count.** A restricted or removed person keeps their row and their place in the count with the rule in place of the action. A silently shortened count is the worst kind of gap that does not explain itself: nobody can even ask about it.
- **Container, from rule 5.** Five stages, a spend and a resume is an independent task, so it is a page — reachable by ⌘K and by deep link, with "Add to sidebar" in its header, and no profile gives it a sidebar slot by default.

## 8. Review

| Check | Gap found | Closed by |
|---|---|---|
| All roles covered | The first draft was written for the SDR alone | The marketer's event-list import and the admin's provider order, job report and compliance route are in §3.8 and in every override |
| All four businesses covered | Ridgeline had no reason to open the page | The job-change area, which is Ridgeline's whole use of it, with the overrides to match |
| Every field has a source | Drafts, mappings, jobs, rates, charging, job-change fields were in no seed | §2 lists them with types, and `enrichmentJobs[]` is defined here for specs 14, 17 and 19 to read |
| Every action has an outcome | "Drop these from the list" and "Stop" had none | §3.5, each with what is kept and what is not |
| Empty, error, no-access | "Nothing matched" looked like an error | A real zero, shown as data, with the attempts and "0 credits. Nothing was charged." |
| Keyboard | The mapping table's selects had no accessible name | Each is labelled by its column header; the trial table has a caption |
| Phone width | The do-not-call line ended up under the button | On a phone the panel pins the button below the line, so the sentence is passed through, not scrolled past |
| Decision-critical visible | The trial was optional in the first draft and the projection was inside it | The trial is a step, the projection prints on the step, and there is no control that skips it |
| Two levels maximum | Per-provider settings were a drawer inside step 3's door | One door per step, expanded in place; nothing nests |
| Doors labelled by content | "Advanced options" on step 1 | "Formatting: encoding, delimiter, date format, phone country (4)" |
| Dependent fields together | The stop rule was in Settings and the ceiling was on the run | Both on step 3, with the workspace default named and linked |
| State persists | A closed tab lost a run | Every answer saved as made; the run continues; "Past imports" is the way back |
| Accelerators present | The agency retyped a mapping weekly | Saved mappings per client, "Run the other 1,230", resume, ⌘K, deep links — and no accelerator past the trial |
| Usage shape checked | Halyard sat at 68% head and Meridian's admin had no tail | Numbers rewritten against what each seat actually does; the format questions and the run's housekeeping are the tail a real import page has. Meridian admin's missing head is stated rather than invented |
| Nothing hover-only | Hit rates were bars with tooltips | A fraction and a percentage, in text |
| Role gaps explain themselves | AE and CS hit a blank page | A no-access state naming the seats that hold it and the admin |
| No usage numbers or teaching text | The trial step read like a tutorial | It reads as a result: field, rate, credits, cost per hit, projection. No advice, and the judgement is left to the reader |
