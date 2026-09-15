# Workspace set-up

*Page 15 of Ollopa, and the only one a person sees once. Three questions on one screen, asked before the workspace opens, producing the workspace profile that — with the seat — decides every sidebar and every level-one set. A lesson candidate (PLAN.md, 14 Sep 2026). Usage items: `src/ollopa/usage/setup.ts`. The "before" is Apollo's Get started checklist and its setup progress flyout.*

## 1. Purpose

Ollopa has to decide what each person sees first. It refuses to guess. Two things decide it, and a human declares both: the **seat**, declared when someone is invited, and the **workspace profile**, declared here. This page asks three questions about the shape of the work, names the profile the answers produce, shows what that profile puts in the sidebar, and opens the product.

Who lives here: the person who creates the workspace, which is always an admin seat. Nobody else sees it. At Meridian, Ridgeline and Fathom it happened once and the answers now live in Settings. At Halyard it happens again for every client workspace, which is why the agency is the only business where this page has weekly numbers at all.

The one thing they must never lose sight of: **what these three answers change, what the seats cost, and that Settings changes all of it later.** A page left out by a profile still opens, still has a link, and offers itself back; a seat that does not exist costs nothing and produces no screens. Both facts are on this page, in words, before the button.

Why three questions and not twenty-three: the biggest published lever on finishing a first session is deleting steps. Across 464 companies and 256 flows, completion by length runs **1–2 steps 73%, 3–5 steps 38%, 6–8 steps 25%, nine or more 8%** (Produktly, 2026). Wes Bush's triage is the operational form — for every step, **Eliminate, Delay or Mission-critical** (ProductLed, 21 Dec 2021). The workspace name and the timezone are eliminated as questions and shown as answers to correct. Mailboxes, domains, pipelines, custom fields and integrations are delayed to the page that needs them. Three things are mission-critical, because nothing downstream can be decided without them: what the work is, how many people do it, and which jobs exist.

## 2. Data

| Field | Where shown | Source | To add to seed |
|---|---|---|---|
| Workspace name | Field, prefilled | `businesses.ts` → `name` | nothing |
| Timezone, currency | Two fields, prefilled from the browser | Settings' Workspace area (spec 14 §2.2) | nothing |
| The three answers | The three questions | none | `settings.howYourTeamWorks`, already specified in spec 14 §2.2: `firstJob`, `people`, `seats[]`, `profile`, `declaredBy`, `declaredAt` |
| The four seats a person can declare | Question 3 | `ROLES` and `ROLE_LABEL` in `src/ollopa/usage/model.ts` | nothing. The declared list is what `SEATS` in `model.ts` holds, and `weeklyUse` returns 0 for a seat that is not in it |
| The profile name | The result block | Derived from the three answers by the table in §3 | nothing |
| The sidebar this produces, per seat | The result block | `NAV` in `src/ollopa/nav.ts` (page, group, roles), minus the pages the profile leaves out | nothing |
| Which pages each profile leaves out, and the signal that brings each back | The result block and Settings | none | `PROFILE_LEAVES_OUT`, the table in §3, as data rather than code so Settings and the exposure rule read the same rows |
| Plan, seat limit, price | The line under question 2 | `businesses.ts` → `plan`; the plan table in spec 14 §2.3 | nothing; spec 14 already sets Meridian to Scale |
| Answers saved as they are typed | Resume | none | `setupDraft`, one per workspace, the same shape as `setupDrafts` in spec 15 |
| The admin's name, for the no-access sentence | No-access state | `businesses.ts` → `roles[]` | nothing |

Nothing on this page is computed from behaviour, because there is no behaviour yet. That is the point of asking.

## 3. Features

### Layout

One route, `setup`. One screen. No steps, no progress bar, no rail. There is no sidebar yet, and the top bar carries only the workspace name and the person's own account menu.

Top to bottom: the workspace name, timezone and currency, each prefilled and editable; then the three questions; then the result block, which names the profile and shows what it does; then one button. The result block updates as the answers change, so the cause and the effect are on the same screen at the same time.

It is one screen rather than three because the three questions are interdependent — how many people, and which jobs exist, are read and answered together — and Nielsen's own limit on staged disclosure is exactly that: a wizard is "problematic when the steps are interdependent". Splitting them would also put the answers on one screen and their consequence on another, which is rule 5.

### The three questions

1. **What are you here to do first?** One of: *Find and reach new companies* · *Work replies and book meetings* · *Grow existing accounts* · *Run campaigns.* The job, never the title. Airtable's 2023 experiment asked new users their function and seeded role-matched templates: **+15% onboarding completion and −10% sharing and collaboration**. Re-cut around the shape of the work rather than the job title, the same idea gave **+15% completion with +10% activation** and no regression. The question that survives is about the work.
2. **How many people will use it?** One of: *Just me* · *2 to 5* · *6 to 25* · *26 to 100* · *More than 100.* Under it, one line of price: "Starter includes 3 seats. $147 a month for 3. A fourth seat needs Growth: $316 a month for 4." One total for the period, never a per-seat breakdown, and stated here rather than after the names are typed.
3. **Which of these jobs exist here?** Any of: *Prospecting and outreach* · *Running deals to close* · *Campaigns and audiences* · *Keeping customers and renewals*; or the single answer *We all do everything*. Running the workspace is not offered because the person answering holds it. Each choice is a seat, and a seat that is not declared returns zero from the usage model, so no first screen is ever computed for a job nobody does here.

Question 3 sits directly under question 2 because the two are answered together.

### What the answers produce

| Seats declared besides admin | People | First job | Profile |
|---|---|---|---|
| Prospecting only, or "we all do everything" | 5 or fewer | any | **Founder-led outbound** |
| Prospecting only, or "we all do everything" | 6 or more | any | **Agency** |
| Deals, campaigns or customers as well | any | Find and reach new companies, or work replies and book meetings | **Separated sales team** |
| Deals, campaigns or customers as well | any | Grow existing accounts, or run campaigns | **Product-led growth** |

Four names, each describing a shape of work. None of them describes a level of skill, and none is offered as a mode the user switches between later: there is no Basic and no Advanced here, because most users are perpetual intermediates and an audience label tells people which features are not for them. The most-cited persona-routing case study in the field, Hotjar's, routed users into Beginner, Intermediate and Advanced checklists and reported 26%; that number compares people who answered the question against people who skipped it, not treatment against control, and it uses exactly the labels rule 3 forbids. It is a method warning, not evidence, and it is why these four names are about work.

The four demo workspaces land as: Fathom Labs, Founder-led outbound; Meridian Software, Separated sales team; Halyard Agency, Agency, declared again per client workspace; Ridgeline, Product-led growth.

### What each profile leaves out

The profile may take a page out of a seat's sidebar. It may never add one the seat does not have, and it never removes anything from the product.

| Profile | Pages left out | Of which seats | Grounds | The signal that brings it back |
|---|---|---|---|---|
| Founder-led outbound | Inbox, Campaigns | all | Two founders and one SDR: replies are few enough in the first weeks that Home carries them, and nobody is running campaigns yet | Inbox: the first reply. Campaigns: the first audience or campaign anyone creates |
| Separated sales team | none | — | Every seat exists and every page has a seat that lives in it | — |
| Agency | Campaigns, Accounts | all | The workspaces hold outbound run for clients; campaign and account work lives in the client's own systems | Campaigns: the first audience. Accounts: the first deal reaching Closed won |
| Product-led growth | Sequences, Lists | admin only | Two sequences, run by one SDR; the admin touches neither weekly (8% and 12% in `sequences.ts` and `lists.ts`) | Sequences: a sequence created or a step due for you. Lists: a list created |

Three things are true of every left-out page, and the result block says all three: it still opens, by ⌘K or by link; its header offers "Add to sidebar", and an added page goes to the end of its group and stays; and when a strong signal arrives it appears in the sidebar by itself for two weeks and then asks "Keep it?". One exposure per period, and the answer holds until a new signal. That last mechanism is the only thing in Ollopa that moves without a person asking, and it exists because hints do not teach and temporary exposure does: shortcut use across three ordered stages went **9.79% → 86.20% with everything exposed → 73.09% after the exposure was removed** (ExposeHK, IHM 2025), while 749 tooltip exposures produced two activations.

### Actions

| Action | Outcome |
|---|---|
| Answer any question | The result block renames the profile, redraws the sidebar preview and updates the left-out list. The answer is saved at once |
| Correct the name, timezone or currency | Saved at once; these are answers being confirmed, not questions being asked |
| Open "The other three profiles" | In place: each of the other three, what it would put in the sidebar, and what it would leave out. The one door on the page |
| Start | The workspace is created with the profile and the seats, and opens on the first screen the seat and profile name: Home for a founder, Home for an SDR, the pipeline for an AE |
| Invite the people you counted | A list of rows, one per person: email and seat. Sent when Start is pressed. Skipping it is normal; Settings invites later |
| Skip | Every page every seat can have, nothing left out, profile recorded as "not declared". Skipping gives more, never less |
| Leave | Everything typed is kept; the link returns to the same page with the same answers |

There is nothing to filter, sort or search on this page, and no bulk action. Saying so is part of the spec: a set-up screen that grows a search box has grown too large.

### States

| State | What shows |
|---|---|
| First run | The three questions, unanswered, with the result block reading "Answer the three questions and this will say what your team gets" |
| Partly answered | The result block names the closest profile so far and marks it "so far"; nothing is committed |
| Skipped | The workspace opens with every page for every seat, and Settings shows "Profile: not declared · Answer three questions" |
| Already set up | The page does not open; the link goes to Settings › How your team works, where the same three questions sit with their answers filled in |
| New client workspace (Halyard) | The page opens with the previous workspace's answers prefilled and a line naming it: "Same answers as Kestrel Health. Change anything that differs." The accelerator for the tenth set-up |
| Seat limit reached | Question 2's price line states the limit and the cost of passing it, before the invite rows. The lock is here, at the entry point, never after a list of colleagues has been typed |
| Loading | The questions render at once; the sidebar preview fills in when `NAV` is read. Nothing blocks answering |
| Error | "Couldn't save that answer. Retry." beside the answer; the rest of the page keeps working; Start is disabled with the reason in words beside it, never silently |
| No access | Anyone who is not the workspace's creator: "Your workspace is already set up. Priya Natarajan set it up on 2 April 2026. She can change how your team works in Settings." |

### Keyboard, accessibility, phone

Each question is a `fieldset` with a `legend`; the options are radios and checkboxes, so arrows and space work without any script. Tab order is name, locale, the three questions, the door, invites, Start. The result block is a live region set to polite, so a screen reader hears "Founder-led outbound. Inbox and Campaigns are not in the sidebar" when an answer changes; the change is announced once, not per keystroke. The door is a `button` in a heading with `aria-expanded`. Nothing is hover-only, nothing is colour-only, every target is at least 40 px. Reduced motion crossfades the result block instead of sliding it.

At phone width the questions stack, the option lists become full-width rows, and the sidebar preview becomes a list of page names rather than a drawn sidebar. The door still opens in place. There is no second level on any width.

### By role and by business

| | Who sees it | What differs |
|---|---|---|
| Admin | The person creating the workspace | Everything on this page |
| SDR, AE, marketer, CS | Never | The no-access sentence, naming who set the workspace up and where the answers live |
| Meridian | Once, in the past | Answers: find and reach new companies; more than 100; all four jobs. Separated sales team |
| Fathom | Once, in the past | Just me and two others; we all do everything. Founder-led outbound, and the Starter seat limit of three was stated on this page before anyone was invited |
| Halyard | Monthly | Every client workspace gets its own answers, prefilled from the last one. Agency each time |
| Ridgeline | Once, in the past | Grow existing accounts; 6 to 25; all four jobs. Product-led growth |

## 4. Usage items

Share of active users in the role touching the item in a typical week (USAGE-MODEL.md). Only the admin seat has numbers: the page runs once per workspace and only its creator sees it. Baseline is Meridian. **DC** = decision-critical, level one whatever the number. The same table is `src/ollopa/usage/setup.ts`.

| Item | Area | Admin | Overrides | Note |
|---|---|---|---|---|
| What are you here to do first | The three questions | 3 | Ha 25; Fa 2; Ri 2 | The job, not the title |
| How many people will use it | The three questions | 3 | Ha 25; Fa 2; Ri 2 | |
| Which seats exist here | The three questions | 3 | Ha 25; Fa 2; Ri 2 | Under question 2; the two are answered together |
| What these seats cost on this plan **DC** | The three questions | 3 | Ha 25; Fa 2; Ri 2 | One total for the period; the seat limit stated before the invites |
| The profile the answers produce | What the answers decide | 3 | Ha 25; Fa 2; Ri 2 | Named on the same screen as the answers |
| The sidebar this produces, per seat | What the answers decide | 3 | Ha 22; Fa 2; Ri 2 | The answer used visibly, not stored silently |
| Pages this profile leaves out, and the two ways back | What the answers decide | 2 | Ha 18; Fa 3; Ri 1 | |
| The other three profiles | What the answers decide | 2 | Ha 6; Fa 3; Ri 2 | The one door |
| What these answers change, and that Settings changes them **DC** | What the answers decide | 3 | Ha 25; Fa 2; Ri 2 | A commitment, and its reversal |
| Workspace name, shown for correction | The workspace itself | 3 | Ha 25; Fa 1; Ri 1 | Shown, not asked |
| Timezone and currency, guessed and shown | The workspace itself | 2 | Ha 12; Fa 1; Ri 1 | Shown, not asked |
| Start | Finishing | 3 | Ha 25; Fa 2; Ri 2 | |
| Invite the people you counted | Finishing | 2 | Ha 20; Fa 1; Ri 1 | Where the seat half of the sidebar is declared |
| Skip | Finishing | 1 | Ha 3; Fa 1; Ri 1 | Skipping gives more, never less |
| Leave and come back | Finishing | 1 | Ha 4; Fa 1; Ri 1 | Answers saved as made |

Decision-critical: the seat cost (price, rule 7) and the statement of what the answers change and where to change them (a commitment, and the reversibility that makes a product-chosen layout acceptable). Two of fifteen.

**Shape check**, computed from `setup.ts` with `shape()`. The denominator is every item that exists for that role at that business, the same rule as specs 12 to 15.

| Pair | Items | Head | Body | Tail | Verdict |
|---|---|---|---|---|---|
| Admin, Halyard | 15 | 10 (67%) | 3 (20%) | 2 (13%) | Far over the band |
| Admin, Meridian | 15 | 0 | 0 | 15 (100%) | Far under it |
| Admin, Fathom | 15 | 0 | 0 | 15 (100%) | Same |
| Admin, Ridgeline | 15 | 0 | 0 | 15 (100%) | Same |

**The band does not apply to this page, and saying so is more honest than fitting numbers to it.** The head-body-tail shape describes a page people return to, where some controls are daily and most are rare. This page is used in one sitting: whoever opens it touches nearly everything on it and then never comes back, so at Halyard, where that sitting happens monthly, every item is in the head, and at the other three, where it happened once, every item is in the tail. There is no distribution to find. Two other tests do the work the band would have done here. First, length: fifteen items, three of them questions, against the 73% / 38% / 25% / 8% completion decay by step count. Second, the level-one rule still bites on the only axis that matters — two items are decision-critical and are on screen whatever the numbers say, and one item, the other three profiles, is behind the page's single door.

## 5. Before: the common version

Apollo has no set-up page. It has a checklist that never ends, in three places at once, with two different percentages.

**The checklist.** Settings' landing page is not a settings page: it is **Get started**, titled "Configure your workspace to boost team performance", with four progress rings — *Set up a team*, *Build pipeline*, *Enrich data*, *Win deals*, each "x/y complete" — over four accordion sections of tasks with "Learn more" links. The sections hold four, nine, two and eight tasks by my count of the memo, about two dozen in all; the ring totals themselves are not published, so the exact number is **unverified**. The tasks include connecting a CRM, inviting teammates, creating dashboards and reports, prospecting settings (GDPR, job-change alerts, primary email type, duplicate handling), personas, core messaging strategy, signals and scores and website visitors and buying intent, the Dialer, enrichment sync settings, the Recorder, recording consent, the scheduler, custom contact and account fields, and deal stages and fields. Source: `knowledge-base/sources/07-apollo-settings-map.md` §1.1, citing [Admin Settings Overview](https://knowledge.apollo.io/hc/en-us/articles/31518179257613-Admin-Settings-Overview), screenshot i3.

**The same thing in three places.** The bottom-left **Admin Settings** flyout opens with *Team & Workspace setup* and a progress bar reading "86% Completed" (memo §1.0 and §6). The avatar menu carries *Onboarding hub* with "24% Completed" (memo §1.0). Home carries a *Setup / Recommendations* tab, "Next steps for you", with a "Remove set up tab" control once it is done ([Home Overview](https://knowledge.apollo.io/hc/en-us/articles/14845941738637-Home-Overview); [Welcome to Apollo](https://knowledge.apollo.io/hc/en-us/articles/4409127280781-Welcome-to-Apollo)). Two different completion percentages are visible in the same session, and the memo does not say whether they measure the same tasks; whether they can ever agree is **unverified**.

**Greyed out for the people who cannot act.** The first section is greyed out for non-admins with the banner "Hey, it looks like you don't have the admin permissions to complete the tasks below", and the FAQ answer for any greyed control is "If a setting is greyed out and you can't select it, your Apollo admin hasn't provided you access" — which admin, it does not say (memo §1.1, §3).

**No question is asked about the work.** Nothing in the flow asks what this team does, how many people will use it, or which jobs exist; the tasks are the same two dozen for a three-person startup and a three-hundred-person company. Whether Apollo branches its first run on any declared answer is **unverified**: nothing in the knowledge base describes one.

**The documented problems, by rule.**

| # | Problem | Rule | Source |
|---|---|---|---|
| 1 | The first screen of Settings is an onboarding checklist, not settings | 1 | Memo §1.1, §6: "there is no top-level settings dashboard; the default landing page is Get started or the last page visited" |
| 2 | About two dozen tasks in four accordions, each with "Learn more" leading out of the flow | 2 | Memo §1.1. Produktly 2026: completion falls 73% → 38% → 25% → 8% as steps go 1–2 → 3–5 → 6–8 → 9+ |
| 3 | Setup progress in three places with two percentages | 4, 5 | Memo §1.0, §1.1, §6 |
| 4 | Vague group labels on the tasks: "Build pipeline", "Enrich data", "Win deals" | 4 | Memo §1.1; Capterra: "Name of the features is a bit confusing to me" (memo §3) |
| 5 | Greyed-out tasks and an unnamed admin | 4, and the product's own rule that a gap explains itself | Memo §1.1, §3; Windows UX Guide: "Remove (don't disable)" |
| 6 | A completion percentage as the goal, with no statement of what completing anything changes | 7 | Memo §1.0 |
| 7 | Nothing declared, so nothing can be left out later: every page is in everyone's nav from day one | 1, 6 | Memo §6 sidebar description |

**What the common version gets right, and Ollopa keeps.** A named place for set-up rather than a tour that floats over the product. A visible list of what is not done, rather than a nag. And a real search box in Settings, so anything skipped can be found later (memo §4).

**Why a checklist is the wrong shape at all.** Median onboarding-checklist completion is **10.1%** across 188 companies, mean 19.2% (Userpilot, 2025) — for nine users in ten, permanent furniture. The vendor case studies that claim otherwise compare users who engaged with the checklist against users who did not, which confounds motivation with treatment. And the population baseline is unforgiving: median day-1 activation is about **5%**, with over 98% inactive at two weeks (Amplitude, 2,600 companies). A first session has one thing to spend, and twenty-three tasks spend it.

## 6. After: the disclosed version

**Layout.** One screen, described in §3: name and locale prefilled, three questions, the result block, one button. No rings, no percentage, no tour.

**Level one and level two.**

| Who | Level one | Level two |
|---|---|---|
| The admin creating the workspace | Name, timezone, currency; all three questions; the seat price; the profile, the sidebar it produces and the pages it leaves out; what the answers change and where to change them; invites; Start and Skip | One door: the other three profiles and what each would give |
| Everyone else | The sentence naming who set the workspace up and where the answers live | Nothing; there is nothing here for them |

**The one door.**

| Label | Container | Behind it | Persists |
|---|---|---|---|
| "The other three profiles: Separated sales team, Agency, Product-led growth" | Expand in place, under the result block | Each one's sidebar and left-out list, laid out the same way as the chosen one | Within the session; there is no later session for this page |

The label names its contents and changes as the chosen profile changes, so it never lists the profile the person already has. No door contains a door.

**Persistence.** Every answer is saved as it is made, server-side, in `setupDraft`; leaving and returning restores the page exactly. After Start, the answers move into Settings › How your team works and this page stops opening. Expand-all and print do not apply to a fifteen-item screen with one door, and nothing pretends otherwise.

**Accelerators.** Halyard's tenth set-up starts with the previous workspace's answers prefilled and the workspace it copied named. Skip is a full accelerator, not a trap: it gives every page to every seat. And the whole page is one screen, which is the accelerator that matters — there is no next, no back and no step to abandon.

**Decision-critical, always visible.** The seat cost, as one total for the period, on the question that decides it. The statement of what the answers change and that Settings changes them again. Neither is ever behind the door, and neither depends on the plan.

**Removed rather than hidden.** The four progress rings and both completion percentages. The "Onboarding hub" in the avatar menu and the "Setup / Recommendations" tab on Home. The twenty-odd tasks: some eliminated (the workspace name and timezone are shown as answers, not asked), most delayed to the page that needs them — mailboxes to Email sending when the first sequence is built, CRM mapping to the connect wizard, pipelines and custom fields to Settings, personas and scoring to Agents. Nothing was moved behind a door on this page; the page has one door and three questions.

**What replaced them.** One row in Settings › How your team works that says which profile was declared, by whom and when; the seats; the pages left out with their signal counts; and any two-week exposure running now. A person who wants to know what state their set-up is in reads facts, not a percentage.

### The nine-point score

| # | Question | Score | Line |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | The seat cost is on the question that decides it, as one total; what the answers change and how to change them is beside the button. Neither is behind the door |
| 2 | Every visible item backed by a sourced number | 1 | Every item has a number in `setup.ts` fitted to the published shape, but the shape cannot be checked here: a page used in one sitting has no distribution, and three of the four pairs are 100% tail. The number does not earn the second point, and the honest substitute — count the steps — is reported in §4 |
| 3 | No path exceeds two levels on any screen size | 2 | Screen, then one in-place door. The phone changes layout, not depth |
| 4 | Doors labelled by content, chevron and text | 2 | "The other three profiles: Separated sales team, Agency, Product-led growth", with the list in the label and never the profile already chosen |
| 5 | Doors adjacent, keyboard and touch | 2 | The door sits under the result block it compares against; a `button` in a heading, full-width on a phone |
| 6 | No dependent information split across a door | 2 | The three answers, the profile they produce and the sidebar it draws are on one screen. Seat count and seat list are adjacent. The price sits on the question that sets it |
| 7 | State persists; expand-all and print where relevant | 2 | Answers saved as typed and restored on return. Expand-all and print are not relevant to one door on a one-visit page, and the spec says so rather than inventing them |
| 8 | User action or object state, never inferred history | 2 | Nothing here is inferred; there is no history yet, and the profile is declared. The one thing that later moves on its own, the two-week exposure, is described here, asks before it keeps anything, and shows its own signal count in Settings |
| 9 | Instrumented; promote, keep or delete review scheduled | 1 | The funnel to instrument is named — answer rate per question, skip rate, profile distribution, how many profiles are changed in Settings within 30 days, and how many left-out pages are added back — and the review runs with Settings' each March and September. One point withheld until it has run once |

**16 of 18.** The two withheld points are the two this page cannot yet earn: a usage distribution it does not have, and a review that has not run.

## 7. Lesson steps

Step 0 is the common version in §5. Five steps follow, one rule each.

| Step | Rule | What moves | Why | Evidence |
|---|---|---|---|---|
| 0 | | Settings opens on Get started: four progress rings, four accordions, about two dozen tasks with "Learn more" links, the first section greyed out for non-admins. The same progress appears as "86% Completed" in the admin flyout, "24% Completed" in the avatar menu and a Setup tab on Home. | What happens when every team adds its own first-run task to one list and nobody ever removes one. | Memo §1.0, §1.1, §6; Admin Settings Overview i3; Home Overview. |
| 1 | 1. Hide the rare, never the necessary | The list is triaged rather than shortened. Eliminated: workspace name and timezone, which the product already knows and now shows for correction. Delayed: mailboxes, domains, pipelines, custom fields, personas, scoring, CRM mapping — each moved to the page that needs it, to be met in context. Mission-critical: three questions, because the sidebar cannot be decided without them. | Deleting steps is the largest published lever on finishing a first session, and it dwarfs every personalisation effect in the literature. | Produktly 2026 (464 companies, 256 flows): 1–2 steps 73%, 3–5 38%, 6–8 25%, 9+ 8%. ProductLed (Bush, 2021): Eliminate / Delay / Mission-critical. Userpilot (188 companies): checklist completion median 10.1%. Amplitude (2,600 companies): median day-1 activation about 5%, over 98% inactive at two weeks. |
| 2 | 2. Stop at two levels | Four accordions of tasks, each with links out to articles, become one screen with one door. The three places that showed setup progress become one row in Settings. | A first-run flow that is four levels deep and three places wide is where a first session ends. Staged disclosure is for rare, unfamiliar, *independent* steps; these three are interdependent, and Nielsen's own boundary excludes them. | Nielsen 2006: designs beyond two levels "typically have low usability", and staged disclosure is "problematic when the steps are interdependent". Budiu 2017: wizards become "annoying and overly controlling if they have to be used over and over again" — which is Halyard's tenth client. |
| 3 | 7. Decision-critical is never behind a door | The seat count question gains a price line: the plan's seat limit and one total for the period, before any colleague is named. The result block gains a plain statement of what the answers change and that Settings changes them again. | Seats are billed, so the seat question is a price question, and a limit discovered after a list of names has been typed is a gate after work the user cannot keep. | RULES.md rule 7; gated-features pattern rules 4 and 7. CMA: partitioned pricing left consumers underestimating totals by about 11%, worse than drip pricing's 3.2%. Luguri and Strahilevitz 2021: disclosing a recurring charge only in small grey type took acceptance from 14.8% to 30.1%. |
| 4 | 4. Make the door obvious and honest | "86% Completed" and four rings named "Build pipeline", "Enrich data", "Win deals" become a named profile and a drawn sidebar: this is what you get, this is what is left out, this is how to get it back. The greyed-out section and "your Apollo admin hasn't provided you access" become one sentence naming the person. The one remaining door is labelled with the three profiles inside it. | A percentage is a label that tells you nothing about what is behind it, and a greyed control is a door that does not open. Asking a question and visibly doing nothing with the answer spends trust. | NN/g 2014: unlabelled non-standard icon, 0% click-through. Windows UX Guide: "Remove (don't disable)". Growth.Design on Blinkist: "If you give your users the impression that you'll customize an experience based on their inputs, not delivering on that expectation can quickly backfire." |
| 5 | 6. Stable, user-controlled disclosure over inferred adaptation | The sidebar stops being everything-for-everyone and starts being seat plus declared profile — and stops there. Nothing rearranges itself from usage. The single exception is named on this page: a page the profile left out returns for two weeks when a strong signal arrives, then asks to stay. | Spatial adaptation does not pay for itself at any prediction accuracy, so a product that wants the right first screen has to ask rather than guess. What it may do is add, temporarily, in place, reversibly, and at a moment the person chooses. | Todi et al. (CHI 2021, 18 participants, 6,480 trials): Static 2283 ms, Frequency 2298 ms, MCTS 2162 ms, frequency reordering 15% slower outside the promoted head; 15 of 18 noticed, 2 understood. Gaspar-Figueiredo et al. (*JSS* 2025, n=40, EEG): no significant difference either way. ExposeHK (IHM 2025): 9.79% → 86.20% → 73.09%. Kuo et al. (IUI 2026): 52% engagement at a task boundary against 62% dismissal mid-task. GitLab 2023: user-controlled pinning rather than inference. |

Two notes that are not steps. **Rule 3:** the four profiles are named for shapes of work, never for levels of skill, and the page offers no Basic, Advanced or Expert path; the one persona-routing case study everyone cites used those labels and was not a controlled test. **Rule 8:** the accelerator here is prefilled answers for the tenth workspace and a Skip that gives more rather than less; there is no scaffold to fade, because the page is seen once.

**Validating the structure this page produces.** The sidebar that comes out of these three questions is an information architecture and should be tree-tested before it ships, against the real-world distribution rather than a target: across 98 tree-testing studies the median task success is **62%**, interquartile range 37–83% (Albert & Tullis, via NN/g 2024), with the rubric Poor <40 / Fair 41–60 / Good 61–80 / Very Good 80–90 / Excellent >90. The older ">70–80% success" figure was set without evidence and sits above the industry norm; if it is used at all it is an aspiration and must be labelled as one.

## 8. Review

| Check | Gap found | How it was closed |
|---|---|---|
| All roles covered | Only an admin ever sees this page, which looked like an omission for the other four seats | Stated, with a no-access sentence naming the person who set the workspace up and the Settings area holding the answers |
| All four businesses covered | Three of the four run this page once, so a business table would have been three identical rows | §3 gives each business its actual answers and resulting profile, and Halyard gets the prefilled-from-last-workspace path |
| Every field has a source | The profile, the left-out list and the signal counts existed nowhere | §2 maps every field to `businesses.ts`, `nav.ts`, `model.ts` or the `howYourTeamWorks` seed defined in spec 14 §2.2; `PROFILE_LEAVES_OUT` is added here as data |
| Every action has an outcome | Skip and Leave had none | Skip gives every page to every seat and records "not declared"; Leave keeps every answer |
| Empty, error, no-access states | No state for a workspace already set up, or for a failed save | Both in §3: the link redirects to Settings; a failed save states the reason and disables Start with the reason beside it |
| Keyboard | A custom option list would have needed script | Radios and checkboxes in fieldsets; arrows and space work with none |
| Phone width | The drawn sidebar preview does not fit | It becomes a list of page names; depth unchanged |
| Decision-critical visible | The seat limit could have appeared after the invite list | Moved onto question 2 as a price line, at the entry point |
| Two levels maximum | Comparing profiles risked a second door inside the first | The other three profiles are one flat list in one door |
| Doors labelled by content | "See more options" in the draft | "The other three profiles: Separated sales team, Agency, Product-led growth" |
| Dependent fields together | Seat count and seat list were two screens in the draft | One screen, adjacent, with the result under both |
| State persists | A half-answered page was lost on reload | `setupDraft` saves each answer as it is made |
| Accelerators present | Nothing for Halyard's tenth workspace | Prefilled answers with the source workspace named |
| Usage shape checked | The band does not fit and fitting it would have meant inventing numbers | Reported as it computes, with the deviation argued and two substitute tests named |
| Nothing hover-only | The sidebar preview used tooltips to explain each page in the draft | Every page name carries its one-line description in the list |
| Role gaps explain themselves | A left-out page would have looked like a missing feature | Named on this page with the two ways back, and again in Settings with its signal count |
| No usage numbers or teaching text in the product | The result block risked reading as a tutorial | It states facts about this workspace — the profile, the sidebar, what is left out, what it costs — and names no rule and no percentage |
