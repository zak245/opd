# 22. Clinical and support work

A domain audit of two kinds of all-day B2B work: clinicians in electronic health records (Epic, Cerner) and agents in support tools (Zendesk, Intercom, ServiceNow, Freshdesk). The question is what the work looks like one level above screens and what the software charges for it. No designs are proposed; where a source proposed one, only its measurements are reported.

## Method, and what could not be fetched

Everything below was fetched 17–18 September 2026 and quoted from the fetched page. Sources flagged `[summary]` in the bibliography could not be fetched (403s, cookie walls, paywalls, a Zendesk sign-in wall); their numbers come from a search summary of the abstract and rank lower. **Epic's own workflow documentation is not publicly fetchable** — `userweb.epic.com` returned a 302 to `signin.epic.com` — so every Epic-specific claim comes from peer-reviewed studies of Epic sites, not from Epic. No PDF was fetched. Tiers: **T1** peer-reviewed; **T2** industry research with published numbers; **T3** vendor help centres, dated forums, changelogs.

---

# Domain 1: Electronic health records

## Objects and relations

**Patient** (the root, and also a *context* rather than a mere object), **encounter**, **problem**, **order**, **result**, **medication**, **note**, **message / in-basket item**, **task**. Relations run one-to-many downward (patient → encounters → orders → results) and many-to-many sideways (problem ↔ order, result ↔ message, medication ↔ problem). The clinical thought — "this creatinine is up, she is on lisinopril, that was started in March, so hold it and recheck" — crosses four object types and two encounters in one sentence. Task is the weakest object: the evidence below shows it is often a sticky note.

## The chains

Shapes are from H3; frequencies carry their evidence.

**1. Chart biopsy before a patient.** *Read patient → traverse to problems → to recent encounters → to results → to medications → to last note → decide.* **Fork.** Roughly per patient: about 20 a day in ambulatory practice (Sinsky 2016, T1 via summary), plus repeated re-entry in the ED. Chart review is the largest slice of per-encounter EHR time: "16 minutes and 14 seconds" per encounter, with "chart review, documentation, and ordering functions accounting for most of the time (33, 24, and 17 percent, respectively)" across "about 100 million patient encounters" by "about 155,000 U.S. physicians from 417 health systems" in 2018 (Overhage and McCallie 2020, T1 via T2). The cut, verbatim: "Patient data is presented in disjoint areas of the chart and not synthesized or summarized for efficient consumption and information retrieval. This design flaw leads to more switching to perform a task" — 24 ED clinicians on Epic, February–June 2022 (Moy et al., JAMIA 2023, T1). In audit logs: "6.6±1.7 switches/chart" within one patient's chart per shift, from 2,068,605 events over 952 shifts by 63 ED physicians (Moy et al., ACI 2024, T1).

**2. Order from the reason you just found.** *Read result → decide → create order from context → mutate dose → verify → sign.* **Hop**, frequently with a **detour** into decision support. Ordering is 17% of that 16 minutes, so several times per patient. The sharpest number in the literature compares Cerner SurgiNet with Epic on one patient-order task — 18 cases, 11 nurses, four Mayo Clinic sites, 14 hours of video, 2020: at the worst site, "SurgiNet mouse clicks: Arizona 61.4" against "Epic mouse clicks: Arizona 6.75", and 198 seconds against 46.25, with a keystroke-level model attributing "almost 15 seconds to navigate and enable a single order" to navigation alone (T1). Same decision, tenfold difference in moves.

**3. Result review and follow-up.** *Receive notification → read result → traverse to patient → to the ordering context → decide → communicate outward → create a future task.* **Chain over time**, and the one the software most clearly cannot hold. Primary care physicians reported a "median number of alerts PCPs reported receiving each day was 63" (Singh et al. 2013; 2,590 PCPs, 51.8% response, data June–November 2010, T1). The cut, from a clinician: "Once I click on an alert, it goes away. I need a way to 'remind me' of things I need to follow-up on" — the system "lacked self-reminder functionality and did not allow providers to retrieve acknowledged notifications." Among 2,554 VA primary care practitioners, "70% used paper methods including 'paper lists (22%) and sticky notes (27%); printouts/faxes (14%)'" for follow-up tracking (Menon, Singh et al. 2016, T1). Consequence: "Almost a third (29.8%) reported having personally missed results that led to care delays" (T1).

**4. In-basket triage.** *Read message → traverse to patient → to the object it concerns → decide → mutate or communicate → next.* **Lap.** Physicians at one multispecialty group received "243 weekly in-basket messages" on average — about 49 a weekday — of which "almost half (114)" were generated by the EHR itself, 53 from colleagues, 30 from patients; the in-basket "takes up about 23% of the workday." The cost is attrition, not time: above-average system-generated volume carried "40 percent higher probability of burnout and 38 percent higher probability of intending to reduce clinical work time" (Tai-Seale et al. 2019, T1).

**5. Refill a medication.** *Read message → traverse to medication → to the relevant lab → to last visit → decide → create order.* **Fork** with a **detour** when the lab is stale. "Time on prescriptions" is one of seven core EHR log measures because it is a standing burden (Sinsky, Rule et al., JAMIA 2020, T1).

**6. Write the note.** *Collect a set from results, orders, problems and prior notes → mutate → verify → sign.* **Fork** collapsing into one object; 24% of per-encounter time. The strongest single quote for H1: clinicians said "overdocumentation was partly the result of their attempts to synthesize relevant encounter-related information recorded in disparate EHR regions in a centralized location" (Moy 2023, T1). The note becomes a workaround for a graph the interface will not show at once.

**7. Medication reconciliation.** *Compare home meds with active orders → link or unlink → mutate → verify.* **Compare**, which needs two objects side by side. Nursing time-and-motion work describes "numerous additional steps to document medication-specific information such as site, action, and route" through checkboxes and pull-down menus (T2 via summary).

**8. Handle an interruptive alert mid-order.** *Create order → blocked → read alert → decide → override or change → return.* The purest **detour** in either domain. Overrides are studied at scale: one analysis covered "2,706,395 alerts and 993 doctors"; another examined "1,152 physicians exposed to a specific clinical support alert to estimate the extent to which physicians' habit strength impacted their propensity toward alert dismissal" (both T1). When a detour is forced often enough, people learn to dismiss it unread.

**9. Work a patient list, and 10, interleave chains under interruption.** A **lap** across the root object — "between-patient chart switching: 27.5±23.6 switches/hr" per ED shift (Moy 2024, T1) — which under interruption becomes chain A on patient 1, interrupted, chain B on patient 2, resume A. Interruptions "occurred nearly every 10 minutes for attending physicians" in an adult ED, and "multitasking creates higher memory load, which contributes to medical error" (Laxmisan et al. 2007, T1). Also: "interruptions drive additional switching in the EHR because they need to be processed and actioned for clinical care (eg, phone calls)" (Moy 2023, T1).

**11. Patient context as a mode.** *Switch patient → place order*, with the failure being the wrong patient. Measured by Wrong-Patient Retract-and-Reorder: an order "retracted (cancelled) by the same clinician within 10 minutes, and then reordered by the same clinician for a different patient within the next 10 minutes." In a randomised trial of 3,356 providers placing "12,140,298 orders in 4,486,631 order sessions for 543,490 patients", restricting to one open record versus up to four gave "no significant differences in wrong-patient order sessions"; the only significant difference was effort — "median daily number of keystrokes per provider (2,784 restricted versus 2,959 unrestricted, P < .0005)" (Adelman et al., JAMA 2019, trial 2014–2018, T1). Also a frequency datum: 4.49 million order sessions across 3,356 providers is roughly 1,340 ordering chains per clinician over the trial.

**12–13. Handoff at shift change, and pending a consult to verify later.** **Handoff**, the second combined with a **chain over time**. "Observed gaps in communication resulted from poor information flow complicated by inherent multitasking, shift changes, and other activities such as documentation time and utilization of computer resources" (Laxmisan 2007, T1). The paper-workaround data above shows the verify step has no home in the software.

**14. Pajama-time catch-up.** A **lap** over everything left undone, once a day. Family physicians spent "355 minutes (5.9 hours) of an 11.4-hour workday in the EHR per weekday per 1.0 clinical full-time equivalent: 269 minutes (4.5 hours) during clinic hours and 86 minutes (1.4 hours) after clinic hours" — 142 physicians, Epic event logs, three years, southern Wisconsin (Arndt et al. 2017, T1). Sinsky's 57 physicians over 430 hours: 27.0% of the office day in direct face time versus 49.2% on "EHR and desk work", plus "1–2 additional hours on the electronic health record at night" (T1 via summary).

**15. Losing the chain to a timeout.** Not a chain but its destruction: "their EHR session automatically times out and closes due to inactivity; any unsaved information entered in the chart is not automatically saved" (Moy 2023, T1).

**The aggregate.** The rate of crossing object boundaries has been measured three ways and lands in the same place. Time-motion across 47 clinicians (34 advanced practice providers, 13 nurses) in acute care, ICU, ambulatory and ED: "clinicians on average exhibited 1.4±0.6 switches per minute", with "eighty-four (19.6%) of the 429 task-switch types… accounted for 80.1% of all switches" (T1, via summary). Time-motion across 15 ED clinicians, 58.7 hours, 5,061 tasks: "1.4 ± 0.9 task switches/min, which increased by one-third when multitasking", 44.7% of hours on clinical-information-system tasks, multitasked tasks *shorter* than non-multitasked ("20.7 s vs. 30.1 s") (Moy et al. 2021, T1). Audit logs across 63 ED physicians: "185.8±75.3 per hr" event switches, the commonest pair "Storyboard viewed" to "ED Workup Activity viewed" at "12.9% of all EHR event-switch pairs" (2024, T1) — the clearest empirical statement of H1 available.

The famous number — roughly 4,000 mouse clicks in a 10-hour ED shift, 43% of time on data entry (95% CI 39–47%) against 28% in direct patient contact (Hill, Sears and Melanson 2013; the brief cites *Annals*, the paper is in the *American Journal of Emergency Medicine*) — is weaker than it looks: its own popular commentary calls it "a big extrapolation, with unwieldy error bars" (T3). The click figure is extrapolated; the switch rates are not.

---

# Domain 2: Customer support

## Objects and relations

**Ticket / conversation** (the unit of work: requester, assignee, status, type, public and internal comments, tags, fields, SLA, relations to other tickets), **requester**, **organisation / account**, **agent**, **article**, **macro**, **view** (a saved query, and the agent's actual home), **trigger / automation / SLA policy**, and **escalation** — not one object but a relation plus a state. Relations that matter: ticket → requester → organisation → that requester's other tickets (the fork every agent runs); ticket ↔ ticket; ticket → article; ticket → child ticket in another queue. ServiceNow widens it: incident → caller → assets and configuration items → related incidents → problem → change request.

## The chains

Frequency evidence here is weak: the best figure found was a third-party aggregation of Zendesk benchmark data — roughly "103 tickets per agent per month… approximately 5 tickets per agent per day", phone teams at "10 to 15 tickets per day" (T3 aggregator, not vendor-published). Frequencies are order-of-magnitude only.

**1. Open a ticket and orient.** *Read ticket → traverse to requester → to their other tickets → to the organisation → read the last public reply → decide.* **Fork**, once per ticket. The cut is structural: Zendesk's context panel holds exactly these neighbours but shows them one at a time — agents "click an icon to switch between views", and it "can display knowledge base articles, related tickets, approval requests, tasks, installed apps… and details of related object records" (T3). The fork is supported as a sequence of hops inside a sidebar, not as one view.

**2. Reply with a macro.** *Decide → apply macro (several mutations plus text) → communicate outward.* **Hop**, and the closest thing either domain has to a chain compressed into one act. Intercom describes macros as grouping "common message content and actions — like tagging, assigning, snoozing, or closing", invoked by "clicking the macros icon, typing `\`, or typing `#` followed by a word from the macro name". Documented limits: on mobile "actions won't execute, only content inserts"; with two macros, "conflicting actions (like assignments to different teams) result in the most recent action being rejected and highlighted in red" (T3). Macros are the industry's own answer to the cost of a multi-move chain, which makes their limits informative.

**3. Find the article and quote it.** *Read ticket → search knowledge → read article → collect → communicate outward.* A **detour** that must return to a half-written reply; held in Zendesk's context panel and ServiceNow's Agent Assist tab (T3).

**4. Detect and merge a duplicate.** *Read ticket → search the requester's others → compare → link (merge).* **Fork** ending in a destructive link. The cut is irreversibility: "No, it is not possible to un-merge tickets"; the merged ticket "enters a closed status that cannot be changed and becomes non-editable"; recovery is to "create a follow-up ticket from the closed ticket that was merged by mistake. Then remove any unwanted CC's and ticket fields pulled over from the merge" (T3). The re-finding cost is a live request — "Show requester's open tickets in the new ticket merge modal" (Zendesk community, T3), agents asking for the neighbour object at the moment of the act. Zendesk's merge suggestions exist to "reduce duplicate work, keep related ticket information in one place, and manage ticket relationships with similar tickets at a glance", and are metered: "with a usage allowance that resets monthly" (T3).

**5. Link an incident to a problem.** *Read ticket → recognise the pattern → search for an existing problem ticket → link → mutate type.* **Fork**, run repeatedly during an outage. The cut is discovery: the vendor's guide has admins build a view and a trigger, then requires agents to "link any related tickets as incidents" by hand — it "relies on agent discretion to connect related incidents rather than providing an automated discovery mechanism" (T3).

**6. Solve a problem and ripple it to every incident.** **Ripple**, the best-documented working one in either domain: "Save work by solving only the problem ticket. It automatically solves all the linked incident tickets", with the caution "Refrain from solving any of the incident tickets directly. Solving an incident ticket still leaves the other tickets unsolved." Its limits are where the ripple stops: reopening the problem leaves the incidents alone ("the incident tickets aren't updated. They stay solved"), and comments land only on "unsolved linked incident tickets" (T3). The ripple runs forward once and never back.

**7. Escalate to another team.** *Read ticket → create child ticket from context → communicate inward → wait → resume.* **Handoff** plus **chain over time**. Zendesk's side-conversation child tickets are built for it: they "inherit replies from the originating side conversation", and admins may copy "tags, followers, ticket form with field values, and requester information" at creation. The cut is that the link is one-way and one-time: "Child tickets don't inherit other forms of ticket data from the parent ticket. For example, if the status of the parent ticket changes, the status of the child ticket doesn't automatically change." Also: "marking the side conversation as Done in the parent ticket doesn't fulfill First time reply and Next time reply metrics" on applied SLAs (T3). Freshdesk's parent-child equivalent lets agents "divide a ticket into smaller sub-tickets, that can be worked on in parallel by different agents", but "tickets can be associated via trackers or the parent-child method, but not both" (T3 via summary).

**8. Snooze and come back.** **Chain over time**, natively supported by ticket status and macro-driven snoozing (T3) — the only chain shape in either domain that both vendors hold properly.

**9. Work a view top to bottom.** *Open view → open ticket → short chain → submit → next.* **Lap.** The vendor's accommodation is itself the evidence that the default breaks it: beside Submit, "'Close tab' returns you to the view list", "'Next ticket in view' opens the next ticket in the view", "'Stay on ticket' keeps the ticket open" (T3). The working set is capacity-capped: "up to 100 active standard and shared team views and up to 10 personal views", or for some Enterprise roles "a smaller set of 12 shared and 8 personal views."

**10. Bulk-act on a view.** *Collect a set → mutate all → communicate outward.* A **lap** compressed into one act, and the documented limits mark where the compression fails: "The maximum number of tickets you can update at one time is 100 tickets"; "if the timestamps differ, meaning that the ticket was modified after the bulk action began, the system skips that ticket, returns an error for that update, and continues processing the remaining tickets"; "You cannot bulk update closed tickets"; the bulk editor "doesn't support CC, followers, or @mentions"; and macro attachments "will not be included in the bulk update" (T3).

**11–13. Three short chains.** *Triage against an SLA*: **verify** then **hop**, over internal SLAs and OLA policies riding on child-ticket side conversations — where the metric gap in chain 7 bites. *Reassign or route*: a **hop**, available as a direct action and as a macro action. *Recover from a destructive act*: create a follow-up ticket from a closed one and strip the inherited CCs and fields — a **detour** with no return point, since the original is unreachable (all T3).

**14. Turn a recurring case into a rule.** *Notice a repeated chain → configure a macro, trigger or automation → it governs many objects thereafter.* H2's configure move, gated by permission — "Can use personal macros" or "Can manage shared macros" — so the person who notices the pattern is often not the one who can encode it (T3).

**15–16. ServiceNow's wider fork, before and after.** *Read incident → traverse to caller → to caller's assets → to recent incidents → to origin record → decide.* ServiceNow's contextual side panel exists for this fork and says so: it gives "quick access to relevant data" and saves agents from "navigating away from the workspace", across cards for Active Calls, SLAs, Caller Information, Origin Record and Assigned To, plus "Recent interactions — up to 10 from the last 7 days", "Recent incidents — up to 10 from the last 7 days" and "Caller assets" (Zurich docs, T3). The neighbourhood is capped, not complete. Before the panel, a practitioner article dated 15 December 2020 records that agents "had to leave their active incident form entirely to search for and review other related incidents belonging to the same caller, disrupting their workflow", with the fix being "a modal with a predefined list of records" behind a custom UI Action button (T3). Related documented defects: related-incident record numbers "are clickable but are not navigating anywhere", and "Collapsed sections such as Notes and Related Records of incident form in Agent Workspace expands on page reload" (T3).

**17. The tab-level cut.** Zendesk redesigned Agent Workspace ticket tabs after agents reported "clicking the wrong tab, repetitive clicking through multiple tabs to find the right one, and entering responses in the wrong tab"; the fix was to show "the ticket subject in the title and the ticket ID in the subtitles" rather than the requester name (Zendesk help, 2023, T3-minus). The dated community thread under the launch is the raw material: "To flip between Public and Internal comment now takes two clicks, before it was one" (13 May 2022), and a company that "reverted after one day due to missing recipient/CC visibility", reporting that the "input field positioning automatically scrolls agents to bottom, losing context of earlier messages" (25 May 2022) (T3).

On aggregate app-switching the only published number found was partial and not relied on (Salesforce *State of Service*, T2). **Support has no equivalent of the clinical audit-log literature**, the biggest evidence gap in this memo.

---

# Outside the model

**1. Context as a mode at the root of the graph.** A patient is not an object you read; it is the scope in which everything else means something, so switching patients reinterprets every later act rather than traversing a relation. "Root context" needs a name distinct from both object and mode.

**2. The working set as a written artefact.** Clinicians "synthesize relevant encounter-related information recorded in disparate EHR regions in a centralized location" — they type the graph into the note because the note is the only place it stays visible, polluting the record as a side effect; agents paste prior-ticket history into internal notes for the same reason. The model says the working set should stay visible, and has no account of people manufacturing one.

**3. The chain relocated out of the software.** 27% sticky notes, 22% paper lists, 14% printouts: a chain moved to a substrate with no relations at all, because it supports one move the software lacks — reminding. An indirection model measured inside the software cannot see it.

**4. Interleaving, distinct from interruption.** The model has the detour (blocked) and the chain over time (later), but no word for three chains in flight, none blocked, advancing in 20-second slices — what 1.4 switches a minute with "over one-fifth of CIS-related task time spent on multitasking" describes. Its signature: multitasked tasks get *shorter* (20.7 s vs 30.1 s), so people compress the move to fit the gap.

**5. Metered chains, and capped neighbourhoods.** Merge suggestions come "with a usage allowance that resets monthly": nothing in H4 anticipates indirection depending on the plan. Likewise ten recent incidents from seven days, five active calls, 100 shared views — the neighbour set is truncated by policy, so a fork may be silently incomplete, where the model treats traversal as possible or not, never partial.

**6. The one-way ripple, and the destructive link.** Solving a problem solves its incidents; reopening it does not reopen them. A non-invertible ripple is a distinct failure from an invisible one, and H3 names only the latter. Merge likewise cannot be undone: H2's "link or unlink" implies symmetry, but here linking destroys and recovery creates a different object.

**7. Completion metrics that reward the wrong move.** Marking a side conversation Done "doesn't fulfill First time reply and Next time reply metrics", so people act to satisfy the metric rather than the intent.

**8. Alerts as a population-level detour policy.** Millions of interruptive alerts configured once by someone who never runs the chain, with habituated dismissal the measured outcome. H2 has the configure move but no account of configurer and runner being different people with opposed incentives.

**9. Involuntary state loss.** H5 says no *move* should destroy state the chain needs; the most-complained-of destroyer in the clinical data is inactivity, which is not a move.

---

# Testing the model

**H1. The work is a graph, the software is a tree. Holds, strongly, and now has a number.** The commonest EHR screen transition for ED physicians is "Storyboard viewed" to "ED Workup Activity viewed" at "12.9% of all EHR event-switch pairs" across 2,068,605 events: one in eight of all transitions is a single bounce between the object you read and the object you act on. With "6.6±1.7 switches/chart" within a patient and "27.5±23.6 switches/hr" between patients, the day is measurably a sequence of two-screen round trips. Support agrees through vendor behaviour rather than measurement: Zendesk's context panel, ServiceNow's side panel and the merge-suggestion panel all exist to pull a neighbour object to the point of action, and ServiceNow says so — it saves agents from "navigating away from the workspace." The Mayo comparison (61.4 clicks versus 6.75 for the same order) shows the cost is a property of the software's shape, not the thought: the decision was identical in both arms.

**H2. The moves. Holds, with two additions.** Every chain above decomposes into the listed moves. Add **synthesise** — collecting from several objects into a new artefact to keep the set visible, distinct from "collect a set" because the artefact is written into the record and outlives the chain. Add **recover** — the moves that repair a destructive act (a follow-up ticket from a merged one; a reorder on the correct patient within ten minutes), which is the vendor's documented procedure in support and a standard safety metric in clinical work.

**H3. The chain shapes. Mostly hold; the ripple and the lap need refining; one shape is missing.** All seven appear, most strongly the hop (Storyboard↔Workup at 12.9%), the lap (Zendesk's three-way post-submit choice exists because the lap breaks by default), the fork (chart biopsy; caller-context panels), the detour (interruptive alerts; article lookup mid-reply), the chain over time (result follow-up, where 70% of practitioners use paper) and the handoff (child tickets; shift change). The ripple needs direction and invertibility as properties: problem-to-incident is forward-only and not reversible. The lap must admit interleaving. The missing shape is the **braid**: several chains in flight, none blocked, advancing in short slices, measured at 1.4 switches per minute with durations that shrink under load.

**H4. Indirection is the cost. Holds for effort; does not hold for error.** For effort the evidence is direct: a keystroke-level model attributed "almost 15 seconds to navigate and enable a single order" to navigation alone, and the click difference between two systems on the same task was roughly tenfold. Temporal indirection predicts the follow-up failures — the notification vanishes when clicked, the result arrives days later, "29.8% reported having personally missed results that led to care delays." But for *error*, Adelman is a counterexample: reducing the distance between person and object (one record open rather than four) did not reduce wrong-patient orders while it increased keystrokes. H4 should be scoped to effort and resumption cost, not correctness.

**H5. The properties of perfect. Holds as a description of what is missing; two properties need rewording.** Each has a matching documented failure: cost proportional to cognitive weight (61.4 clicks for one order); working set visible (data in "disjoint areas of the chart"); reason and act on one surface (the caller-history modal built to avoid leaving the form); no move destroys needed state (merge is irreversible; the composer "automatically scrolls agents to bottom, losing context of earlier messages"); effects appear where the cause was (reopening a problem leaves its incidents solved); a detour returns to the exact point (timeout discards the unsaved note); the software knows which chain you are in (tabs labelled by requester, redesigned after agents reported "entering responses in the wrong tab"). Two rewordings. **"No modes" is not supported by the evidence**: the one randomised test of removing a mode found no safety benefit and a small effort penalty, so the property should be that the mode is visible and cheap to change, not absent. And **"no move destroys state the chain still needs" should read "nothing destroys state"**: the most-complained-about destroyer in the clinical data is inactivity.

---

# Still unknown

1. **No audit-log literature exists for support work.** Zendesk, Intercom and ServiceNow hold the event streams that produced the clinical numbers and publish none of them. Every support cost here is a vendor's statement of a limit or a dated complaint. The "dozen tabs per issue" claim could not be traced to a primary source, and no vendor-published tickets-per-agent-per-day figure was fetchable, so support frequencies are order-of-magnitude only.
2. **Whether the clinical switch rate is reducible.** 1.4 switches a minute has been measured three ways and never manipulated: no study compares a fragmented against a consolidated interface on switch rate with the same clinicians and cases.
3. **Resumption cost inside these products.** The literature counts switches, not the time to get back to where you were — what H4 is really about. Multitasked tasks being *shorter* hints that people truncate rather than resume, but nothing measures what was dropped.
4. **Epic's and Cerner's own workflow documentation.** Behind login, so vendor intent here is inferred from measurement.
5. **Hill et al.'s 4,000 clicks.** Abstract only, and its own commentary calls it "a big extrapolation, with unwieldy error bars." The most-cited number here is its least reliable.
6. **Whether macros displace or compress chains**, and **the configurer/runner split**. Nothing measures how much of an agent's day runs through macros, what happens to chains that do not fit one, or the cost of the person running a chain being unable to change the rule that governs it.

---

# Bibliography

All fetched or summarised 17–18 September 2026. "[summary]" means the page itself could not be fetched (paywall, 403 or cookie wall) and the numbers come from a search-result summary of the abstract; those claims are ranked lower in the text.

**Tier 1 — peer-reviewed**

- Hill, Sears, Melanson, "4000 Clicks," *Am J Emerg Med* 2013. https://www.sciencedirect.com/science/article/abs/pii/S0735675713004051 [summary]
- Sinsky et al., "Allocation of Physician Time in Ambulatory Practice," 2016. https://www.acpjournals.org/doi/10.7326/M16-0961 [summary]
- Arndt et al., "Tethered to the EHR," 2017. https://www.annfammed.org/content/15/5/419.short
- Overhage, McCallie, "Physician Time Spent Using the EHR During Outpatient Encounters," 2020. https://www.acpjournals.org/doi/10.7326/M18-3684 [summary; figures via https://medicalxpress.com/news/2020-01-physicians-minutes-electronic-health.html]
- Tai-Seale et al., "Physicians' Well-Being Linked To In-Basket Messages Generated By Algorithms," 2019. https://www.healthaffairs.org/doi/10.1377/hlthaff.2018.05509 [summary]
- Singh et al., "Information Overload and Missed Test Results in EHR-based Settings," 2013. https://pmc.ncbi.nlm.nih.gov/articles/PMC3822526/
- Menon, Murphy, Singh et al., "Workarounds and Test Results Follow-up in EHR-Based Primary Care," 2016. https://pmc.ncbi.nlm.nih.gov/articles/PMC4941859/
- Singh et al., "Notification of Abnormal Lab Test Results in an EMR," 2010. https://pubmed.ncbi.nlm.nih.gov/20193832/ [summary]
- Adelman et al., "Effect of Restriction of the Number of Concurrently Open Records… on Wrong-Patient Order Errors," *JAMA* 2019; numbers from the AHRQ project page. https://digital.ahrq.gov/ahrq-funded-projects/assess-risk-wrong-patient-errors-emr-allows-multiple-records-open
- Moy et al., "Understanding the perceived role of EHRs and workflow fragmentation on clinician documentation burden in emergency departments," *JAMIA* 2023. https://pmc.ncbi.nlm.nih.gov/articles/PMC10114050/
- Moy et al., "Characterizing Multitasking and Workflow Fragmentation in EHRs among ED Clinicians," 2021. https://pubmed.ncbi.nlm.nih.gov/34706395/ [summary]
- Moy et al., "Time-motion examination of EHR utilization and clinician workflows indicate frequent task switching and documentation burden," 2021. https://pubmed.ncbi.nlm.nih.gov/33936464/ [summary]
- Moy et al., "A Computational Framework to Evaluate ED Clinician Task Switching in the EHR Using Event Logs," 2024. https://pmc.ncbi.nlm.nih.gov/articles/PMC10785917/
- "We're Lost, But We are Making Good Time: Navigating Complex Pathways in a Patient-Order Management Task," 2020. https://pmc.ncbi.nlm.nih.gov/articles/PMC8075447/
- Laxmisan et al., "The multitasking clinician," 2007. https://pubmed.ncbi.nlm.nih.gov/17059892/ [summary]
- Sinsky, Rule et al., "Metrics for assessing physician activity using EHR log data," 2020. https://academic.oup.com/jamia/article/27/4/639/5728718 [summary]
- "Assessment of EHR Use Between US and Non-US Health Systems," 2021. https://pubmed.ncbi.nlm.nih.gov/33315048/ [summary]
- "Temporal Change in Alert Override Rate with a Minimally Interruptive CDS." https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7761179/ [summary]
- "Habit and Automaticity in Medical Alert Override: Cohort Study." https://www.sciencedirect.com/org/science/article/pii/S1438887122001546 [summary]
- "A Time and Motion Analysis of Nursing Workload and EHR Use in the ED," 2021. https://www.jenonline.org/article/S0099-1767(21)00074-X/abstract [summary]

**Tier 2 — industry research with published numbers**

- Salesforce, *State of Service*. https://www.salesforce.com/service/state-of-service-report/ [summary; partial, not relied on]
- Zendesk, *CX Trends*. https://cxtrends.zendesk.com/ ["dozen tabs per issue" not traceable to the report]

**Tier 3 — vendor help centres, dated community forums, changelogs**

- Zendesk help, all fetched: problem and incident tickets https://support.zendesk.com/hc/en-us/articles/4408835103898-Working-with-problem-and-incident-tickets · tracking them https://support.zendesk.com/hc/en-us/articles/4408829669274-Workflow-How-to-track-problem-and-incident-tickets · side conversation child tickets https://support.zendesk.com/hc/en-us/articles/4408836521498-Using-side-conversation-child-tickets · accessing views https://support.zendesk.com/hc/en-us/articles/4408829483930-Accessing-your-views-of-tickets · un-merging https://support.zendesk.com/hc/en-us/articles/4408821057306-Can-I-un-merge-tickets · merge suggestions https://support.zendesk.com/hc/en-us/articles/6885971957914-Merging-related-tickets-based-on-suggestions · bulk management https://support.zendesk.com/hc/en-us/articles/4408886890906-Managing-tickets-in-bulk · context panel https://support.zendesk.com/hc/en-us/articles/4408836526362-Using-the-context-panel
- Zendesk, "Announcing improved Agent Workspace ticket tabs," 2023. https://support.zendesk.com/hc/en-us/articles/5439612833562-Announcing-improved-Agent-Workspace-ticket-tabs [sign-in wall; summary only, T3-minus]
- Zendesk Community, "Initial feedback on the Agent Workspace" (comments 13 and 25 May 2022). https://community.zendesk.com/ideas/initial-feedback-on-the-agent-workspace-3999
- Zendesk Community, "Show requester's open tickets in the new ticket merge modal." https://community.zendesk.com/ideas/feature-request-show-requester-s-open-tickets-in-the-new-ticket-merge-modal-22435 [title only]
- Intercom, "Using macros in the Inbox." https://www.intercom.com/help/en/articles/6584504-using-macros-in-the-inbox
- ServiceNow, contextual side panel for incidents (Zurich). https://www.servicenow.com/docs/bundle/zurich-it-service-management/page/product/service-operations-workspace/concept/view-inc-record-info-contextual-sidepanel.html
- ServiceNow Community, "Display related Incidents in a Workspace Modal," 15 December 2020. https://www.servicenow.com/community/servicenow-ai-platform-articles/display-related-incidents-in-a-workspace-modal/ta-p/2314695
- ServiceNow support KB0855212, collapsed Related Records re-expanding on reload. https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0855212 [summary]
- Freshdesk parent-child ticketing. https://support.freshdesk.com/support/solutions/articles/226308 · https://www.freshworks.com/freshdesk/ticketing/parent-child/ [summaries]
- "The Cost of a Click," *Emergency Physicians Monthly*. https://epmonthly.com/article/the-cost-of-a-click/
- Epic UserWeb. https://userweb.epic.com/ — HTTP 302 to signin.epic.com, 18 September 2026; Epic's own workflow documentation is not publicly fetchable.
