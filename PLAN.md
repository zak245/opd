# OPD, Open Progressive Disclosure: project plan

*Written 13 September 2026, after the knowledge base was compiled and the evolution pattern was prototyped and validated. Plain language on purpose. This is the working plan; change it as you learn.*

---

## 1. What we are building

Three things, in one public repo, in this order.

1. **The rules.** One file. The eight laws of progressive disclosure, each with its evidence and a one-line test. Everything else points at this file. It changes only when someone brings evidence.
2. **The case library.** A fake but believable B2B product: a GTM platform used in different ways by different kinds of businesses (see the decisions table for its boundary, roles and example customers). The screens every B2B app ends up with, each shown as an evolution: the common version, then one rule applied per step, to the disclosed version. Built with shadcn.
3. **The agent.** A Claude Code plugin (with a plain rules file that also works in Codex) that reviews screens against the rules and prototypes new screens with a team's own design system. It is built from the case library and tested against it. It comes last.

What we are **not** building: another component library, a full design system, or MCP integrations before there are users.

---

## 2. Decisions already made

| Decision | Choice | Why |
|---|---|---|
| Public artifact | Case library, not tooling | Tooling is a team setup; the library is what teaches and spreads |
| Design system | shadcn first | 114k stars, fastest adoption ever recorded in State of React, and what Claude Code, Cursor, v0, Lovable and Bolt generate by default |
| Other systems | shadcn first. Material UI second, for two or three cases only. Anything after that is decided later | Proves the rules are about views, not buttons; also becomes the mapping examples the agent needs. Not every case |
| Fake product | A GTM (go-to-market) platform, used in different ways by different kinds of businesses. Boundary: contacts and companies, pipeline, outreach sequences, campaigns, basic reporting, integrations, agents. No ads, website builder or support desk. Roles: SDR, account executive, marketer, customer success, RevOps admin. Four example customers: a 12-person startup, a 300-person SaaS company, a GTM agency serving ten clients, a product-led company | A product used one way hides the hard part. PD must hold when one customer's rare setting is another's daily task |
| Framework | Vite with shadcn | Static case library published as a site; no server needed |
| First five screens | Settings, data table with row actions, record page, setup wizard, agent activity log with pending approvals | The screens every B2B product has, plus the one nobody has written rules for |
| Teaching device | The evolution stepper (see section 4) | Validated in the prototype |
| Quality method | Human walkthrough against the nine-point rubric, no automated tests | Cheap, fixed, and the rubric already exists in the knowledge base |
| Publish when | After five reviewed cases, not when finished | Public early beats public perfect |
| Name | OPD, Open Progressive Disclosure | |
| Home | Public repo on the author's personal GitHub | |
| Licence | MIT for code, Creative Commons for the writing | |
| Reviewer | The author, sole reviewer for now | |
| Usage numbers | Nielsen is the reference. Every split is an opinionated decision backed by published data (Nielsen's 80/20, Pendo's feature-adoption benchmarks, McGrenere and Moore's Word study). Field-level percentages are illustrative, fitted to the published shape, and labelled with their source on every screen. They do not have to be real; they have to be right. | No product analytics exist; being data-driven means following the published evidence, not inventing freely |
| Order of work | Define the product first (what it sells, who uses it, what they do daily); field-level decisions follow from that | The split depends on the roles and their daily tasks |
| What we deploy | Three surfaces from one static build: the product (ollopA, sign in as a business and role, explorable, no education, final version only), the lessons (same page in the middle, steps and score on the left, rule and evidence on the right, step 0 is the common version), and the library site (rules, cases, how to contribute, knowledge base rendered as pages) | One code path: the product renders a page at its final step; a lesson renders the same page at any step |
| The whole app first | The shell, sign-in and every page in IA-MAP.md are built before the first lesson is published. Simpler pages come from two shared templates (table page, record page); the five lesson pages are fully interactive | A one-page app is not believable; the cases are lessons about pages inside a complete product |
| Timeline | Five to six weeks to first publish, not three | Five interactive pages, the stepper, the lesson view and the site do not fit in three |
| Usage model | Written before any page. One file: every item on every page, weekly use per role, with per-business overrides, fitted to the published shape | Every page reads from it; without it each page invents its own numbers |
| Where numbers show | Usage figures and their sources appear only in lessons and case files, never in the product UI | The product has no labels or education |
| Role gaps explain themselves | When a role cannot see or do something, the product says so and names who can, instead of leaving a silent gap | Knowledge base guidance on permission-based disclosure |
| Deal stages | Five stages only: Qualified, Discovery, Proposal, Negotiation, Closed won. No "Closed lost" stage and no outcome flag; a lost deal is archived | Decided 13 Sep 2026; the deals board, deal record and Reports specs follow this |
| CRM per business | Meridian Software: Salesforce. Ridgeline: HubSpot. Fathom Labs: none, ollopA is their CRM. Halyard Agency: one client CRM per workspace | Decided 13 Sep 2026; the Settings and Connect specs follow this |
| Plan gating | ollopA gates features by plan (Starter, Growth, Scale) and gating follows a named pattern: gated features are visible where they would live with a lock and the plan name; a real control opens a panel with what it does, the plan, the monthly cost, one button; non-admins ask the admin from the same panel; never gate safety or decision-critical items; never gate mid-task; preview where possible; usage rules still decide level; nothing moves when unlocked. Fathom on Starter, Halyard and Ridgeline on Growth, Meridian on Scale. Plan table: seats 3 / unlimited / unlimited; mailboxes per user 1 / unlimited / unlimited; teams, profiles, territories no / yes / yes; agents 2 / 3 / all plus own model key; reports activity only / all plus CSV export / all plus CSV export and scheduled email; CRM sync one-way / two-way / two-way plus custom objects; SSO, SCIM, IP allowlist, audit export no / no / yes; API and webhooks no / yes / yes. Adds one settings item: upgrade requests from teammates | Decided 13 Sep 2026; gating is part of growth and sales, and the pattern must show how disclosure supports it |
| Navigation | Sidebar comes from the seat (declared at invite) plus a workspace profile (declared at set-up, visible and editable in Settings under "How your team works"). Never inferred. Four profiles: Founder-led outbound, Separated sales team, Agency, Product-led growth. Set-up asks about the job to be done, not the title | Decided 14 Sep 2026; Airtable 2023, Todi 2021, Gaspar-Figueiredo 2025, GitLab pinning |
| Three kinds of "cannot see it" | Object you do not own: readable, edit controls not shown. Area not in your role: no-access page naming who uses it and who to ask. Page left out by the workspace profile: it opens; the header offers "Add to sidebar"; added items go at the end of their group and stay | Decided 14 Sep 2026 |
| Teaching by exposure | When a strong signal arrives for a page the profile left out (for example the first reply for a founder without Inbox), the page appears in the sidebar for two weeks, then asks "keep it?". A person's answer is final until a new signal, and never more than one such exposure per period | Decided 14 Sep 2026; sweep 09: hints do not teach, temporary exposure does |
| Fifteenth page | Workspace set-up: three questions (what are you here to do first, how many people, which seats exist) producing the profile. Replaces Apollo's 24-task checklist. A lesson candidate | Decided 14 Sep 2026 |
| Agent approvals | The object's owner approves their agent's actions; the admin may approve for anyone. No per-item approval for low-cost reversible actions (research, scoring, drafts saved not sent): logged, not queued. Per-item approval only for irreversible or costly actions (sending email, spending above a credit cap, changing a deal stage). A second, admin approval above a threshold that is a setting, default 1,000 recipients or 500 credits in one action. Approvals presented in batches at task boundaries with the consequence stated on each item, never as interruptions mid-task | Decided 14 Sep 2026; sweep 14 (88.5% seen, 23.9% stopped), sweep 09 (task-boundary acceptance) |
| Bounce guard | One pair for the product: warn at 4%, pause at 6%, owned by Settings, adjustable by the admin. Every other page reads it and shows the observed rate beside it | Decided 14 Sep 2026 |
| Door labels | A door label names its contents. "Additional filters: owner, location, signals (3)" is the form; never "More", "More filters", "More actions", "Other" or "Advanced" | Decided 14 Sep 2026 |
| Records: drawer and page | Both, as two levels of one record. The quick-look drawer is level one: the few fields a glance needs, shown in place next to the table, flat (no doors or sections inside), read-only except the one field the glance exists for. The full page is level two: everything, from the shared record template, with related lists (people, deals, activity) as scrolling sections, doors only for long rarely-needed content (history, enrichment, custom fields, files), and at most one tab for a related table big enough to be its own page. Drawer and page show the same data with the same labels in the same order; the drawer is the top of the page cut short. Test: removing the drawer loses only speed. Drawer for scanning tasks (prospecting), page for dwelling tasks (research). Company, contact, deal and account all use the template | Decided 14 Sep 2026 |
| Seats per business | Each business declares which seats exist; the usage model returns zero for a seat a business does not have, so no first screen is ever computed for a role that is not there | Decided 14 Sep 2026 |
| Objects and journeys | The 31 objects and 54 journeys in JOURNEYS.md are the approved model, built from the Apollo workflow inventory (memo 16), the sales-org inventory (17) and the AE, leader, RevOps and developer notes (18, 19). Four modelling calls: company and account are one object with a customer state; renewals and expansions are typed deals; a call is not a task; the admin's intake request is an object | Decided 15 Sep 2026 |
| Boundary, widened | Inside: call logging with purpose, disposition, duration and notes (no telephony); the meeting object and its booked, held and no-show events (no booking page); the follow-up draft and extracted-field proposal from conversations (no recording); LinkedIn tasks with message text and manual completion (no browser extension); the API with defined reach, published limits and per-key spend; webhooks with a written delivery contract and a reconciliation endpoint; MCP as a first-class surface with read, safe-write and destructive-write scopes; a narrow CLI (auth, search, export, bulk update with resume, allocation check); forms as an object with enrichment on submission and a credit cap; "visited the site" as an inbound signal only; signals and scoring fully inside. Out: telephony, booking pages, recording, browser extension, ads, website builder, support desk, billing the customer's own customers | Decided 15 Sep 2026; 33% of Apollo's documented workflows crossed the old line |
| IA before UI | The order of work is: object model, then the map (every page, drawer, wizard, panel and surface as a node; every route as an edge, marked with level, seat and profile), then the journeys walked across the map, then specs reviewed in journey order | Decided 14 Sep 2026; disclosure levels are an IA decision |
| Map decisions | MCP read scope on every plan, write scopes from Growth up. The RevOps sidebar carries thirteen entries including Requests and Workflows. Coaching runs from logged calls plus a coaching note; no call library. The Founder-led outbound profile leaves Campaigns, Accounts, Reports and Requests out of the default sidebar; the two-week exposure brings any back on a signal. The Tasks page for high-volume SDR seats is accepted as the density case | Decided 15 Sep 2026, by recommendation with the owner's leave |
| Journey walk, S1 | Tasks opens in queue mode for SDR and AE seats, with the list as the door; list is the default for CS and admin. The daily digest is on by default for admin and CS, off for SDR and AE, changeable in "Where notifications go". "Approve all" stays, requires each item to have been expanded or scrolled past once, and carries the total consequence in its label ("Approve 8 · send 8 emails · 32 credits") | Decided 15 Sep 2026 |
| Journey walk, S2–G5 | The remaining fifty-three journeys were walked on 15 Sep and the map was re-cut from what they found. Tasks opens in queue mode for SDR and AE (S1, applied once). The Inbox is master-detail, so the thread is the open half of the page and not a disclosure; booking and the meeting are one node with states. The contact record's activity is its main timeline, the health score's drivers are a section and flat lines in the quick look, and both activity doors were deleted — a score never sits across a door from its reasons. View as is a mode of Team and access, and Edit-then-approve is an in-place state of the agent item's door; neither is a panel inside a panel. Reports has five tabs, Forecast is the fifth and spec 12 owns it, and no agent ever submits. The agent ledger gains a Surface column — App, Automation, API, MCP, CLI, Agent — and no ⌘K command approves anything. The marketer never lands on Tasks: routing is about records and ends on the workflow's run history. Three new spec files are added to the sixteen — 17 developer surfaces, 18 import and enrichment, 19 workflows — plus a fourth for Requests; none of them adds a node the map did not already hold. The map is now 147 nodes and no seat's deepest path is more than two | Decided 15 Sep 2026, by recommendation with the owner's leave; 213 changes across seven walk logs, applied in one pass |
| Interrupting notifications | Exactly three kinds interrupt: bounce guard tripped, a second approval over the threshold, credits low — each means something is sending or spending now. A sync error is digestible, at a frequency chosen on the integration, with its count still at level one on Home's health strip. Resolves the RevOps walk (three kinds, sync error demoted) against the CS walk (four kinds, second approval added): both are right about the second approval and the RevOps rule decides the rest | Decided 15 Sep 2026; rule 7's corollary — an interruption that is not about money or safety spends the queue's review capacity |
| Contact activity | The contact record's activity is the record's main timeline with its filter chips, and `X-calllog` opens from a call item in it. There is no activity door on a contact. Resolves the SDR walk (delete the door) against the leader walk (keep it and let the spec match the map): the SDR walk changes the map, so the spec follows the map rather than the other way round. The company record keeps its own activity door, because a company's timeline is several people's | Decided 15 Sep 2026; rule 1 — what the record exists to show is not a disclosure |
| Founder-led omissions | The Founder-led outbound profile leaves out six pages: Inbox, Campaigns, Accounts, Reports, Requests and Workflows, each with a named signal — first reply, first audience or campaign, first deal reaching Closed won, first full week over ten sends, second upgrade request in a week, first routing exception. Agency leaves out Workflows too. Resolves this table's own map-decisions row against IA-MAP §6.4a and spec 16 | Decided 15 Sep 2026; the declared sidebar, and teaching by exposure |
| Working mode | From 15 Sep 2026 the owner accepts recommendations by default; the walk and the build run on Opus agents with the rules as the judge, and the owner sees progress and results rather than per-item questions | Owner's instruction: go fast, accept all changes needed to build the final thing |
| Lesson contract | A lesson renders the real page component on a stage inside a `LessonProvider`; the page branches on `ruleOn(lesson, n)` and tags things with `data-item` and places with `data-container`, so the lesson view finds moves by comparing the DOM. A case folder is data (`case.ts`, `steps.ts`, `scores.ts`, README, screens); it holds no page code. Five cases in wave 3: Settings, People, Deal record, Connect, Agents, each with the step order its spec section 7 fixes | Decided 17 Sep 2026 by recommendation; one implementation per page, never a "bad" and a "good" one |
| Settings case | Step 0 is a faithful parody of Apollo's settings (separate settings shell, vague labels, five levels, renamed pages, duplicates, split dependent settings, price and cancel below the fold, no delete). Six steps: rules 7, 1, 2, 4, 5, 8. Rule 6 is a note, not a step | Every problem in step 0 is documented in the Apollo source memo |

---

## 3. The shape of a case

Every case folder has the same shape. This is what makes it a library and lets strangers add cases.

```
cases/<screen-name>/
  README.md        the task, the roles, the common mistake, the rules applied, the evidence
  case.ts          id, title, summary, the page node the stage renders, the seat, the spec
  steps.ts         the steps: rule, title, what moved, why, evidence quotes, doors to open
  scores.ts        the nine rubric scores per step
  screens/         screenshots of step 0 and the last step
```

The model is the page itself, in `src/ollopa/pages/<folder>/`: the same component the product routes to, reading `useLesson()` and rendering a layout per step from the same rows, seed and usage numbers. One model, rendered with N rules on, is step N. The two versions can never drift apart because there is only one. The contract between pages and the lesson view is `src/learn/context.ts` and `BUILD-WAVE3.md`.

---

## 4. The evolution stepper: the reusable pattern

Six parts, the same on every case. Only the screen model, the steps, and the scores change.

- **Rail.** The steps, one rule each. Done, current, to come. Click any to jump. Arrow keys work.
- **Stage.** The real screen, built with the real components, live at every step. Fields edit and save. Buttons do things. Doors open. The viewer must believe it is a product.
- **Delta.** Things that move slide to their new place and glow. Things that leave a place stay there as a ghost: the whole component, faded and hatched, with a caption underneath ("was here → now behind Localisation") and a "show me" button that opens the door and highlights the real one. A door that something left gets a tag ("↑ left: Growth plan"). Some steps open the doors the change happens in, so the change is visible.
- **Score.** The nine-point rubric, filled as each rule lands. The line that changed lights up.
- **Evidence.** Rule, what moved, why, and the study behind it. One level down, behind a toggle. The page follows its own rules: two levels, never three.
- **Controls.** Back, next, play, compare 0 ⇄ last, trace changes (ghosts stay until the next step; default on), slow motion.

Things learned building it that the real implementation must keep:

- Only real moves are marked: a change of container or a change of order. Things that shift down to make room are not moves. Marking them buried the signal in noise.
- Ghosts go **in the flow**, not as overlays. Overlays at old coordinates sit on top of the new layout and are unreadable.
- The ghost is a clone of the row captured before the change. No second version is ever drawn by hand.
- "Is it hidden" is answered by "is any ancestor door closed", not by measuring size. Browsers report stale sizes for content inside a closed disclosure.
- Timings for a first-time viewer: slides about a second, highlights about three seconds, ghosts until the next step. A slow-motion switch doubles everything.

Prototype: https://claude.ai/code/artifact/dcdaf339-dfb3-44a5-9b8b-f6a7d3096438 (plain HTML; the library version is rebuilt on shadcn).

---

## 5. Definition of done for a case

A case is done when a person who did not build it walks through this and it scores at least 16 of 18 on the rubric.

- Both the common and the disclosed version run and look real with the seed data.
- Every rule applied is cited by number, and every citation is true.
- Nothing decision-critical is hidden. The reviewer looks for the price, the destructive action, the pending approval without clicking.
- No path is more than two doors deep, on desktop or phone.
- Keyboard only, once through both versions. Screen reader, once through the disclosed version.
- Phone width, once.
- Screenshots of step 0 and the last step are in the folder.
- The evidence quotes exist in the knowledge base sources.

About thirty minutes per case. Nothing merges without it.

---

## 6. How we build fast without losing control

- **Week 1, by hand, slowly.** The rules file. The product definition file (name, boundary, five roles, four example customers, seed data). The case template. One complete case: settings, rebuilt on shadcn from the prototype. This case is the model everything else copies.
- **Week 2, in parallel.** Four more cases at once, by people or by agents in separate worktrees, each given the template, the rules file, the finished settings case, and one screen. Agents draft. Humans walk through. Expect to send half back once.
- **Week 3.** Publish. Then batches of three to five cases, because review is the bottleneck and review is what protects quality.

Parallel work is safe because the template, the rules file, and the company file are fixed before anyone starts. Builders fill a shape; they do not invent one.

---

## 7. Publishing

- GitHub, public, from week 3.
- A static site built from the case folders: the rules file is the front page, each case is a page, annotations behind a toggle.
- A "how to add a case" page that is the template plus the checklist.
- The published field guide and knowledge base link to the site as the evidence layer.
- One launch post: one screen, before and after, the rules that changed it. No manifesto.
- Measure one thing: do cases arrive from outside.

---

## 8. The agent (after five cases exist)

- **Week 4.** A skill, loaded in layers: short summary always; rules file when designing or reviewing; a single case only when an example of that screen type is needed. A review command that walks the rubric on a screen or a pull request, names violations by rule number, and proposes fixes. A hook that checks a disclosure pattern before an agent's edit lands.
- **Week 5.** A prototype command: give it a concept (task, roles, data, usage frequencies if known) and a design system; it produces a stepped case in the library's shape. Without usage data it states its assumptions and asks for confirmation. It self-scores with the rubric before handing over.
- **Mapping files.** One small file per design system mapping the building blocks (door, level, scope, agent status) to real components. shadcn from the library; Material UI and Ant from the rebuilt cases.
- **Test.** Give the agent step 0 of a library case, blind. Compare its result with the human one on the rubric. The library is the test set and grows with every case.
- **Later.** MCP into analytics (Pendo, Amplitude, Mixpanel) so the frequency question gets real answers; into Figma and GitHub so review happens where designers and engineers work.

---

## 9. Where the supporting material lives

- [README.md](README.md): index of the knowledge base.
- [knowledge-base/00-core-model.md](knowledge-base/00-core-model.md): the synthesized understanding and the eight laws.
- [knowledge-base/08-principles-and-checklists.md](knowledge-base/08-principles-and-checklists.md): the rubric, checklists, decision tree, anti-patterns. The rules file is cut from this.
- [knowledge-base/sources/](knowledge-base/sources/): the six research memos with verbatim quotes and URLs. The evidence quotes in every case must trace here.
- Field guide (one page): https://claude.ai/code/artifact/51ed555b-8f52-40e3-9e08-27c72fd75c09
