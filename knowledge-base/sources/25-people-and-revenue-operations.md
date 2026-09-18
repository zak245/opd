# 25. People and revenue operations

*Domain audit of two B2B domains: recruiting and HR (Greenhouse, Lever, Workday, Ashby) and CRM (Salesforce, HubSpot, Dynamics 365, Pipedrive). Written to test the working model in [CHAINS-BRIEF.md](CHAINS-BRIEF.md), H1 to H5. No solutions proposed; where a source proposed a design, only what it measured is reported. Compiled 18 September 2026.*

**Tiers.** Tier 1 = peer-reviewed, or a survey/dataset with published sample and method. Tier 2 = first-party vendor documentation and release notes, dated. Tier 3 = practitioner accounts, customer-published training material, review aggregation, dated posts.

**Not fetched.** Salesforce IdeaExchange and Salesforce Help `articleView` pages render client-side and returned a CSS error, so the Pipeline Inspection release notes and the Einstein Activity Capture considerations page are cited through practitioner summaries at tier 3. HubSpot idea threads, Gartner Peer Insights and the ACM page for the 2025 *Information Processing and Management* fair-ranking study all returned 403 — so no peer-reviewed recruiter-interface study is quoted. Dynamics 365 and Pipedrive are under-evidenced here.

---

## Part A. Recruiting and HR

### A1. Objects and relations

Two incompatible object models sit inside this one domain, and the difference explains most of the measured cost difference between vendors.

**The ATS model (Greenhouse, Lever, Ashby).** Greenhouse's structured hiring guide (tier 2, updated 5 June 2024) names the objects: a **job**, on which "you define the role requirements, the attributes of successful candidates and the evaluation process"; an **interview plan** of **stages**; an **interview kit** where "you'll define attributes for a successful candidate and outline interview questions for each interviewer"; a **scorecard** carrying **attributes** and **ratings**. Around those: **candidate**, **application** (one candidate may have several), **interview**, **offer**, **approval**, **prospect**. Relations run candidate → applications → job → interview plan → stages → interviews → scorecards, and application → offer → approval flow. The centre of gravity is the candidate profile.

**The HRIS model (Workday).** Workday models the **business process**, not the candidate. Its administrator manual (tier 2) says the "Job Application business process is the framework for moving candidates dynamically through the recruiting process", running from **Review** to **Ready for Hire** through eight subprocesses each with its own security policy: "Review Candidate, Screen, Assess Candidate, Interview, Reference Check, Offer, Employment Agreement, Background Check, Ready for Hire." The navigable unit is not a screen per object but a **My Tasks item**: "When a recruiter moves the candidate to the Screen subprocess, Workday sends a My Tasks item to the person assigned to the defined role on that subprocess." Two constraints matter: "Candidates can have a job application in more than one recruiting stage at the same time", but "You can have only one offer or employment agreement in progress at a time."

Beneath both sits HR proper: **requisition**, **worker**, **position**, **compensation plan**, **onboarding task**. The join between recruiting and HR is the most expensive relation in the domain (chain 15).

### A2. The chains

Frequencies are derived, not measured; no vendor publishes screen-level telemetry (the gap memo 17 §11 records). Volume anchors are Ashby's two 2026 benchmark reports (tier 1): *Recruiting Operations* over "54M applications" and "93K jobs" (Jan 2021–Mar 2026), and *Recruiting Coordination* over "2.8M candidates" with at least one interview and "5.1M+ interview events" (Q1 2020–Q2 2024). Per-scheduler weekly volume: "25th percentile: 14 … 50th percentile: 21 … 75th percentile: 31 … 90th percentile: 47". Ownership: "Recruiters: 70% of schedules created", "Recruiting Coordinators: 26.1%", "Hiring Managers: 3.7%".

**1. Sweep the application pile.** Collect a set → read → compare to the bar → decide → mutate stage → repeat. **Lap.** 54M applications over 93K jobs is ~580 per job; a recruiter on five to eight open jobs decides on dozens a day, in sweeps ("Non-interviewed archived within 9 days: 58%"). Cut: Greenhouse's bulk review stops short of the lap — it "can only be performed on Candidates for a single job in a review stage type", and "You will still need to individually review, move, or reject each application" (tier 2, updated 2 March 2026). Bulk stage moves hit the same wall: "All candidates included in this bulk action must be on the same job." A lap across four jobs is run four times.

**2. Screen one candidate, move forward or decline.** Read → verify → decide → mutate → communicate outward → handoff. **Hop ending in handoff.** Screen passthrough is "35%", so several to dozens a day. Cut: the Nebraska Workday recruiter job aid (tier 3, updated 12 July 2026) offers seven Move Forward destinations and six Decline dispositions, then "Click OK" — and repeats this rescue instruction five times in eighteen pages: "If you do not receive a decision task, you can access the move forward tasks by opening the candidate profile and clicking Actions in the blue menu. Then click Job Application, select the appropriate requisition, click OK." A workaround for a chain whose only entry point has gone missing. Review aggregation over 4,047 reviews (tier 3, rfp.wiki): "users complain about too many clicks, rigid workflows and repetitive form entry."

**3. Schedule a single-event interview.** Read candidate → traverse to plan → collect interviewers → compare calendars → create from context → communicate to candidate and panel → verify. **Fork plus chain over time.** Median "21 schedules per week" per scheduler — four a day, nine at the 90th percentile. Cut, measured as residual latency: "Auto-scheduled interviews: 3.7 hours median to confirm" versus "Manual scheduling: 5 hours median"; across providers, "4 days from the point an interview event is created … to getting that interview scheduled" in Ashby against "5.6 days to do the same in a legacy provider" (tier 1).

**4. Schedule a multi-event onsite loop.** Same moves across five to eight interviewers with ordering constraints. **Fork with nested detours** — an interviewer declines, a sub-chain must find a substitute and return to a half-built loop. A handful a week (onsite passthrough "24%"). Cut: the chain is handed to a different person because of its shape — "Multi-event interviews: Recruiters manage 21%, RCs 67%". Ashby (tier 3, 17 April 2024): "Interviewer declines often create extra work for recruiting coordinators after finding that one time that works for everyone on the hiring panel." Workday's path is a seven-step wizard preceded by a separate configuration task on the requisition (tier 3).

**5. Reschedule or cancel.** Read → unlink → re-collect availability → re-link → communicate. **Lap over one object.** GoodTime's 2026 report names "Cancellations/reschedules" a bottleneck for "32%" of teams (tier 3; no sample disclosed). Object cost, first-party: "each time you confirm a new schedule for an interview (whether by modification or rescheduling), ashby represents it as a new interview schedule version", so four reschedules produce "four distinct interview schedule versions" (tier 2). Cut, then fixed: Greenhouse's June 2026 notes add a "**Cancel interview** button … directly on the candidate profile", "removing the need to enter the reschedule flow just to cancel" — a vendor paying to delete a forced detour.

**6. Chase missing scorecards.** Read a set → compare submitted against expected → solicit → verify → repeat. **Lap crossing handoffs**, daily; the recruiter's standing background task. Size of the hole: "Average submission rates for scorecards were between 84 to 89%", Ashby users "90%" at "1.9 hours" median against legacy "84%" at "2.3 hours"; completion is size-dependent, "Small teams (<25 employees): 49%" versus "Large organizations (500+): 72%" (tier 1). Cut: Greenhouse's guidance offers only email — "Scorecard reminders are emails sent to interviewers … shown to drive completions in a big way" (tier 3). The chase leaves the product.

**7. Submit a scorecard as an interviewer.** Read the kit → read the résumé → mutate attributes → decide → communicate. **Hop with a chain over time**, one to four a day. Cut: the entry point lives outside the product — "you can access your assigned interview kit in your email invite or directly in Greenhouse Recruiting" — and afterwards "you can modify it in your Past Interviews. You can only update your scorecard on jobs that are currently open" (tier 2). Workday is worse: "Once you submit the Manager Interview Feedback task, all incomplete Give Interview Feedback tasks will disappear and will not be able to be submitted" (tier 3, Geisinger job aid). One person's move deletes other people's pending moves.

**8. Debrief and reconcile disagreement.** Collect the scorecards → compare → traverse to notes → decide. **Fork**, one per onsite. Why it is real work: "38% of scorecard pairs differ by at least one point". The base rate a decider should see and cannot: "Interviews conducted with one day of notice see a 68.2% passing scorecard rate while interviews conducted with seven days of notice see a 63.2% passing scorecard rate" (tier 1).

**9. Advance to offer and assemble it.** Traverse to requisition → read the approved band → read level → compare internal equity → create from context → mutate. **Fork across objects owned by other functions**; offer passthrough is "81%". Cut: Workday splits it into three consecutive inbox tasks — Move to Offer, a separate "Propose Compensation", then "Generate Offer Letter" as a manual mail-merge: "make updates where there is Red text … remove the line that says {select one}". Same page, pure indirection: "Do not change the Default Weekly Hours. Those should ALWAYS be 40. Workday calculates the FTE by dividing the Scheduled Weekly Hours by the Default Weekly Hours" (tier 3).

**10. Request and drive offer approval.** Verify preconditions → communicate to approvers → wait → verify → decide. **Handoff chain over time with a quorum**; one per offer, but the checking is daily. Cost: bottom-quartile companies lose "Offer turnaround: +3.26 days (business), +4.71 days (tech)" (tier 1). Mechanics: Greenhouse lets approvals run "**all at once** or **in order**", where "each step must meet the approval requirements before it can progress", and lets you "choose how many approvals are needed" (tier 2). Lever: approved "by the minimum required number of preceding approvers" (tier 3, snippet). Cut: the denial branch — the one recruiters actually run — is undocumented in Greenhouse's offer-approval overview and its Approvals FAQ.

**11. Change an offer after approval.** Mutate → re-verify → re-solicit approval. This is where H3's detour breaks. Workday (tier 3): "Click the Move Forward bubble and then select 'Edit Offer' from dropdown list. … This starts the offer process over and will complete the Hire details, Compensation, and Offer Letter tasks again." Lever: "the revised offer requires re-approval." One field change replays a three-task, multi-person sub-chain. One in every few offers — the candidate negotiates.

**12. Extend the offer, track acceptance.** Communicate outward → wait → verify → mutate. **Chain over time with a ripple** the recruiter cannot see where they acted; continuous checking for days. Acceptance: "89% (business), 84% (tech)" (tier 1). Workday routes acceptance through the candidate's own portal and back as another task — "Once the candidate's offer tasks are complete, you'll receive a Make Offer Decision Task" — followed again by the rescue instruction for when it fails to arrive.

**13. Keep the hiring manager current.** Collect a set → read → compare to last week → solicit decisions. **Lap** for the manager, **handoff** for the recruiter; weekly per job, daily in aggregate. Cut, a caricature of split attention: "Hiring Managers cannot see attachments when applications are shared via the Manager Application Review only … you will need to use the Share Application function" (tier 3). The manager decides without the résumé; the recruiter runs a second chain to supply it. Meanwhile capacity falls: coordinators per organisation dropped from "~4 RCs per Org in Q1 2022" to "2 by the end of 2023", each supporting "~4 Recruiters" (tier 1).

**14. Open a requisition and get it approved.** Create from context → configure → handoff chain → verify. **Handoff chain**; quarterly per manager, weekly in aggregate for HR. Greenhouse ships one-stage and two-stage job approval flows as separate configurations (tier 2).

**15. Hand the hire to HR and onboarding.** Verify → compare across two systems → link (merge) → handoff. **Fork across systems** with a detour that can unwind the whole chain — the most expensive documented chain in the domain. "After you move a Candidate record to Background Check OR Offer, you MUST check for duplicates in both Workday and the Payroll and Financial Center (JDE JD Edwards E1 Oracle) PRIOR to moving to ready for hire." Without the identifier it detours into another role: "you will need to have an agency HR Partner do this step". Skip it and: "The candidate will have duplicate accounts, causing issues which require the process to be rescinded until the profiles are merged." The matching rules must be held in the head: "Workday doesn't match phone numbers if the formatting differs. Example: 555-1234 does not match with 5551234" (all tier 3, Nebraska guide).

**16. Re-find where a candidate is.** Read → traverse → verify. **Hop**, many times a day, whose entire content is re-establishing state the person had last week. Greenhouse's August 2026 notes record what it was papering over: "Recruiters can now see better errors when a stage transition fails on the candidate profile. Transitions previously failed silently, so errors went unnoticed" (tier 2). A verify move against a system that misreports has no success condition.

### A3. What the model cannot express here

**Quorum** — H2's "decide" is singular, but every approval and debrief here is N of M. **Restart** — H3's detour "returns to the exact point"; Edit Offer instead discards a completed multi-person sub-chain and replays it. **Destruction in someone else's workspace** — H5 protects "the chain", but the Workday feedback case destroys state *other people's* chains need. **Social latency** — the measured costs are hours and days of other people's response time, not screen distance.

---

## Part B. CRM

### B1. Objects and relations

The four products agree on the core: **lead** (pre-conversion), **contact**, **account** (Pipedrive: organisation), **opportunity** (HubSpot and Pipedrive: deal), **activity** (in Salesforce split into Task and Event with an Activity view over both), **task**, **campaign**, **forecast** (a roll-up with its own hierarchy and adjustments), plus **quote**, **product**, **price book**, **case**, **territory**. Salesforce AI Research's own benchmark environment puts the count at "25 interconnected Salesforce objects across integrated Service, Sales, and CPQ schemas" (tier 1, arXiv:2505.18878, 24 May 2025).

Chain-bearing relations: lead → (on conversion) account + contact + opportunity; account → contacts, opportunities, cases, activities; opportunity → contact roles, activities, quotes, forecast category; campaign → members → leads/contacts → opportunities. Two product-specific rules are load-bearing. HubSpot (tier 2, updated 9 September 2026): "if an activity is first logged on a deal record, it will be automatically associated with the deal's primary company and the five most recent associated open deals", while activities from the mobile app or conversations inbox "will not be automatically associated with other associated records". Salesforce's Einstein Activity Capture by default stores captured email outside the standard object graph, so "Captured email data is not available in standard reports, dashboards, or list views" (tier 3).

### B2. The chains

Volume anchors. The Bridge Group's *2025 SDR Models, Motions & Metrics* (tier 1, 351 B2B companies): a median of **112 activities per day** — 44 phone, 41 email, 19 LinkedIn, 8 other — yielding **4.1 quality conversations per day** (via memo 17). Salesforce's *State of Sales, 7th Edition* (tier 1; "4,050 sales professionals surveyed in 22 countries", surveyed "from August through September, 2025") gives "60% Not selling 40% Selling"; the chart's per-slice values cannot be reliably mapped to their labels from a text extraction, so only the headline split is used. SPOTIO's *State of Field Sales 2026* (tier 1: "452 sales professionals … Of those, 388 respondents had field sales teams") adds the CRM-specific number: "71% of reps spend 5 or more hours per week on manual CRM data entry", of whom "24% spend 11 or more hours", while "Only 3% of teams have fully automated CRM entry". Background condition (Salesforce, first-party): "One platform 34%", and "42% of sales reps are overwhelmed by too many tools."

**1. Work the task queue.** Collect a set → read → decide → act → mutate → next. **Lap**, the dominant chain in the domain, continuous, backing the 112/day median. Cut: HubSpot has a standing idea titled "Log activity without completing task", where users report tasks disappearing when a call is logged and ask developers to "remove all the clicks" (tier 3, second-hand; thread 403'd).

**2. Dial, disposition, log.** Read → communicate outward → mutate → create from context (the next task). **Hop inside the lap**; 44 dials/day median, 56 phone-first (tier 1). Cut: HubSpot's own docs (tier 2, updated 7 August 2026) enumerate the per-call form — date, time, "Call outcome", "Call direction", "Call type", and "Contacts called" ("search and **select** existing contacts you called"). Six fields plus an association search, forty-four times a day.

**3. Log the meeting or email against the right objects.** Create → link → link again. **Hop with a fan-out**, every touch; "the largest single slice of non-selling time" (memo 17). Cut: HubSpot's auto-association caps at "the five most recent associated open deals" — a numeric boundary the rep must know — and mobile-logged activity drops association entirely. On Salesforce, default EAC removes captured email from reports and list views.

**4. Triage an inbound reply.** Read → traverse to the account → compare to history → decide → mutate → create from context → communicate. **Fork**; several sweeps a day against ~41 emails sent per SDR per day.

**5. Advance a deal stage, update next step and close date.** Mutate three attributes → ripple into the forecast. **Hop whose ripple lands where the rep cannot see it**; several a day for an AE with twenty live deals. Cut, then partly fixed: Salesforce added inline opportunity editing to Pipeline Inspection in Spring '22 and extended it two releases later (tier 3, Salesforce Ben, 22 March 2024, updated 18 May 2026). What the fix was worth: "Unlike list views, you can even inline edit without first needing to filter the list to a single record type" — the list-view path required narrowing the set before you could act. Salesforce's answer to stale next steps is an indicator that "shows when the last update to the Next Step field was more than 7 days ago" — a verify move promoted into the surface where the manager acts.

**6. Prep for a call.** Read account → traverse to contacts → to past activities → to open cases → to the last quote → collect. **Fork with five traversals**, before every meeting. Cut: Pipeline Inspection exists because the gather was expensive — "a consolidated view of pipeline metrics, opportunities, week-to-week changes, AI-driven insights, and activity information" (tier 2), against a before-state the practitioner guide calls "building numerous reports, switching tools, or analyzing deals".

**7. Qualify and convert a lead.** Read → verify → decide → mutate (convert) → link. **Hop with irreversible state destruction**, continuous where inbound exists. Cut (tier 3): "If you don't map a custom Lead field, Salesforce doesn't copy its value to a custom field on the Account, Contact, or Opportunity during conversion"; type mismatches and length overruns "silently drop" or "clip" data; and afterwards "the Lead becomes a read-only record, you can't update that data after conversion". One move that loses state and makes the loss unreachable.

**8. Route a lead; handle the routing exception.** Configure a rule governing many objects → verify → mutate an owner → handoff. **Handoff**, plus a rule-configuration move categorically unlike the rest. Automation continuous, exceptions daily (memo 17, rank 20).

**9. Pipeline review with a manager.** Collect a set → compare week over week → traverse into each deal → solicit an update → decide. A **lap run by two people at once**, one of whom owns none of the objects; weekly per rep, so daily for a manager of six. Cut: the standing practitioner account (tier 3, no published sample found) is that the review runs on an export, because the comparison the manager wants — this week against last, across reps, with commentary — is not an object in the system. Pipeline Inspection is the vendor's answer, and its headline feature is week-over-week change.

**10. Submit or adjust a forecast.** Read a roll-up → compare to quota → mutate an adjustment → communicate → verify. **Chain over time with a ripple up a hierarchy**; weekly per rep and manager (memo 17, rank 18). Under-evidenced: no first-party documentation obtained on what an adjustment does to a subordinate's view.

**11. Build a quote, get pricing approval.** Create from context → configure → handoff chain → verify. **Handoff chain**, weekly per AE. Salesforce lists "Creating quotes" as one of seven workweek slices and finds, first-party, that "a lack of visibility into usage makes it harder to create quotes, delaying the renewal process."

**12. Reassign accounts, territory or owner in bulk.** Collect a set → mutate → ripple into forecasts, dashboards, routing rules. **Ripple at scale**; quarterly, exceptions weekly (memo 17, rank 25).

**13. Dedupe and repair records.** Compare two objects → decide → link/unlink → mutate. **Fork ending in a merge**; weekly for ops, continuous at volume. Scale, first-party: Salesforce names "manual errors and duplicate data" the leading data concerns, and "46% of sales pros with agents say data quality issues hurt their sales."

**14. Trace campaign to revenue.** Traverse campaign → members → leads → converted contacts → opportunities → compare. A **long traversal with no single surface**; weekly to monthly for marketing ops. Memo 17 §11 records that sourced-versus-influenced pipeline "has no primary source with published numbers" — the chain runs constantly on a convention.

**15. Hand a closed-won deal to customer success.** Verify → collect a set → communicate → **handoff** across a system boundary; per closed-won (memo 17, rank 23).

**16. Answer a one-off question by building a list or report.** Collect a set → configure → read → compare. A collect that becomes a saved object nobody maintains; the search/filter variant runs many times daily (memo 17, rank 7).

Two measured findings bound chain length. UiPath's UI-CUBE (tier 1/2, arXiv, 21 November 2025) built 40 enterprise tasks including "Salesforce (CRM): 8 tasks covering Lead management, activity tracking, bulk operations" and "Workday (HR Management): 8 tasks" — both of this memo's domains — and reports complex enterprise tasks "averaged approximately 41-75 steps for completion", an action mix where "selection … 23%, followed by navigation (16.1%) and typing (11.1%)", and *human* performance that "achieved only 61.2% accuracy despite 97.9% success on simple UI interactions". Navigation is a sixth of all actions, and humans fail two in five complex multi-object tasks. CRMArena-Pro finds the same shape for agents: "58% single-turn success rate … with significant performance drops in multi-turn settings to 35%" — the drop is between one move and a chain of moves.

### B3. What the model cannot express here

**Capped links** — "the five most recent associated open deals" is a link move with a numeric cutoff the person must carry. **Irreversible mutation** — lead conversion destroys state and closes the door; H5 does not distinguish recoverable from unrecoverable loss. **The comparison that is not an object** — week-over-week pipeline change is the manager's working set and exists in no product as a thing to hold. **The nag** — a pipeline review is mostly soliciting other people's mutations, and H2 has no move for that.

---

## Outside the model

1. **Social latency dominates.** Every measured cost of the expensive chains in Part A is somebody else's response time: 3.7 versus 5 hours to confirm an interview; "Interviews start a median 6 days after availability is requested"; offer turnaround +3.26 to +4.71 days. H4 names temporal distance as a property of the instrument; here it is a property of the other humans, and an order of magnitude larger.
2. **Quorum.** "Choose how many approvals are needed" (Greenhouse); "the minimum required number of preceding approvers" (Lever). Decisions are N of M, and the chain includes tracking who has not acted.
3. **The rewind.** Not a detour: Edit Offer "starts the offer process over". A completed multi-person sub-chain discarded and replayed because one attribute changed.
4. **The rescind.** A chain unwound backwards across other people's completed moves, with silent side effects: "rescinded until the profiles are merged", and "If you cancel or rescind the business process, Workday does not send the delayed notifications."
5. **Destruction of another person's pending move.** "all incomplete Give Interview Feedback tasks will disappear and will not be able to be submitted."
6. **Solicit.** Chasing scorecards, close dates, approvals. No work transfers (not a handoff), nothing reaches a customer (not communicate-outward), no object changes. The commonest cross-person chain in both domains.
7. **Situating against a base rate.** "38% of scorecard pairs differ by at least one point"; 68.2% versus 63.2% pass by notice. Deciders implicitly ask "how does this compare to normal", and the model has no move for placing an object against a distribution.
8. **The object as a version stack.** Four reschedules produce "four distinct interview schedule versions" — the thing acted on is a history, not a state.
9. **Parking.** "The assessment stage can be helpful to use a holding space, or tracking other tasks/stages not built into the system."
10. **The missing entry point.** In Workday the chain position *is* a task in an inbox, and when the task does not arrive the chain has no door.
11. **Silent misreporting.** "Transitions previously failed silently, so errors went unnoticed." H2's verify assumes the system answers honestly.
12. **Cross-system identity without a key.** The Workday/JD Edwards duplicate check, where "Workday doesn't match phone numbers if the formatting differs."

---

## Testing the model

**H1. The work is a graph, the software is a tree. Holds, needs widening.** The graph claim is uncontested: 25 interlinked Salesforce objects (tier 1), and a recruiting schema in which candidate, application, job, stage, interview, scorecard, offer, approval, requisition and worker all connect. The tree claim needs a second failure mode. Greenhouse, Lever, Ashby, HubSpot and Pipedrive are trees of *screens per object*, and the costs look as H1 predicts — bulk review that cannot cross jobs; a hiring manager who cannot see the résumé on the application in front of them. Workday is a tree of *processes*, whose navigable unit is one step of one subprocess. That is nominally closer to H5's ideal — the software does know which chain you are in — and it measures worse: "too many clicks, rigid workflows and repetitive form entry" across 4,047 aggregated reviews, plus a rescue path documented five times for when the task is absent. Revision: the cost comes not from object trees specifically but from **any tree whose nodes are not the person's chain**, and a process tree fails in a new way, by making chain position a transient artefact that can be lost.

**H2. The moves. Holds as a core; incomplete at the edges.** All eleven appear repeatedly and were sufficient to write thirty-two chains. UI-CUBE's independent action taxonomy overlaps it: selection 23%, navigation 16.1%, typing 11.1% map onto collect, traverse and mutate. Three additions are needed, each evidenced above: **solicit**, **quorum-decide**, and **situate against a base rate**. One existing move needs splitting: "mutate an attribute" covers both an inline close-date edit and a lead conversion that irreversibly destroys unmapped data.

**H3. The chain shapes. Holds; the detour is the weak one.** Hop, lap, fork, ripple, chain-over-time and handoff all fit. The lap earns its place: the dominant chain in each domain is a lap (application sweep; task queue) and the dominant documented cut is a bulk tool that stops short of completing it ("You will still need to individually review, move, or reject each application"). But the **detour** as defined — a precondition blocks the chain and a sub-chain returns to the exact point — does not describe what was found. The observed failure is being forced to **replay** a sub-chain that had already completed (Edit Offer), or having the chain **unwound** (rescind). Detour should split into detour-and-return, rewind and rescind. Add the **shape-driven handoff**: multi-event scheduling passes from recruiters (21%) to coordinators (67%) purely because of its fork width — a handoff caused by shape, not role.

**H4. Indirection is the cost. Needs changing.** For a person's own moves, indirection predicts well: navigation is 16.1% of all actions in enterprise tasks; Salesforce's shipped value was letting the edit happen where the reason for it was visible (inline, rather than after filtering a list view); Greenhouse's was a cancel button on the profile instead of a reschedule flow. But it does not predict the cost of the chains that matter most. The expensive chains in Part A are cross-person, and their cost is hours and days of other people's latency, against which a click is noise. H4 should be narrowed to "indirection predicts the cost of a person's own moves", joined by a second predictor for cross-person chains: **the number of other people the chain waits on, and their response latency**. Two caveats against over-crediting H4: Workday minimises one kind of indirection (the task comes to you, pre-scoped) and is the worst-reviewed product in the set; and humans scored "only 61.2% accuracy" on complex tasks they could see in full, which suggests chain length itself, not only distance, is a cost.

**H5. The properties of perfect. Mostly holds; three changes.** Supported directly: effects appearing where the cause was (Greenhouse shipped stage-transition errors onto the profile, and an email to organisers when a candidate declines); the working set staying visible (Ashby shipped availability notes "visible wherever you schedule" and attachments inline "without leaving the candidate profile"); reason and act on one surface (the Next Step staleness indicator). Changes: (a) "no move destroys state the chain still needs" must become "**no move destroys state any participant's chain still needs**", on the evidence of the vanishing feedback tasks; (b) "a detour returns to the exact point" must be joined by "**no completed sub-chain is replayed because a later attribute changed**"; (c) a property is missing — **the software must not misreport state**, since silent transition failure defeats verification, the move all others rest on. And "the software knows which chain the person is in" needs a rider: Workday knows, and it is not enough, because knowing the chain while making its position a losable object is worse than not knowing.

---

## Still unknown

- **No screen-level telemetry, anywhere.** No vendor in either domain publishes which screens are opened, how often, or in what order. Every per-day figure above is derived from activity or volume benchmarks.
- **No peer-reviewed study of recruiter or rep interface work.** There appears to be no CSCW/CHI equivalent of the JAMIA click-burden literature for ATS or CRM work. The largest evidence gap here.
- **GoodTime's "38% of their time scheduling interviews"** is the most-quoted number in recruiting operations, and the blog excerpt discloses no sample, demographics or field dates; the attribution to 500+ US TA leaders at 1,000+ employee companies in November 2025 comes from secondary sources I could not confirm.
- **Salesforce release notes and IdeaExchange are not machine-readable** without a rendering browser, so vote counts and dates on CRM feature requests — the best proxy for which cuts users care about — are absent.
- **Dynamics 365 and Pipedrive.** Only comparative review aggregation was obtained: no documentation, changelog or dated complaint.
- **Forecast adjustment mechanics.** No first-party documentation on what a manager's adjustment does to a rep's view; no sampled study of forecast-submission time.
- **Onboarding proper.** Chain 15 covers the recruiting-to-HRIS handoff, but not what follows — provisioning, task lists, day-one readiness.
- **Interviewer load and reschedule rate.** No benchmark for interviews per interviewer per week (which would fix the estimate for chain 7), or for reschedule rate despite reschedules being a documented version-generating lap.

---

## Bibliography

**Tier 1**

- Ashby, *Recruiting Coordination*, 2026 Talent Trends Report (2.8M candidates, 5.1M+ interview events, Q1 2020–Q2 2024) — https://www.ashbyhq.com/talent-trends-report/reports/recruiting-coordination
- Ashby, *Recruiting Operations Benchmarks*, 2026 Talent Trends Report (54M applications, 93K jobs, Jan 2021–Mar 2026) — https://www.ashbyhq.com/talent-trends-report/reports/recruiting-operations-benchmarks-talent-trends
- Salesforce, *State of Sales, 7th Edition* (4,050 professionals, 22 countries, Aug–Sep 2025; read as a local text extraction) — https://www.salesforce.com/en-us/wp-content/uploads/sites/4/documents/reports/sales/salesforce-state-of-sales-report-2026.pdf
- SPOTIO, *The State of Field Sales 2026* (452 respondents, 388 with field sales teams, 14 industries) — https://spotio.com/blog/state-of-field-sales-2026/
- The Bridge Group, *SDR Models, Motions & Metrics: 2025* (351 B2B companies) — https://www.bridgegroupinc.com/research/2025-sdr-models-metrics-report-the-bridge-group
- Huang, Prabhakar, Thorat et al., *CRMArena-Pro*, arXiv:2505.18878, 24 May 2025 — https://arxiv.org/html/2505.18878v1
- Cristescu, Park, Nguyen, Talmacel, Ilie, Adam (UiPath), *UI-CUBE*, arXiv, 21 November 2025 — https://arxiv.org/html/2511.17131v1

**Tier 2**

- Greenhouse, Structured hiring guide (5 June 2024) — https://support.greenhouse.io/hc/en-us/articles/360039539772-Structured-hiring-guide
- Greenhouse, Offer approval overview (2 March 2026) — https://support.greenhouse.io/hc/en-us/articles/360035625832-Offer-approval-overview
- Greenhouse, Request approval for a new offer (2 March 2026) — https://support.greenhouse.io/hc/en-us/articles/201165300-Request-approval-for-a-new-offer
- Greenhouse, Configure approvals (2 March 2026) — https://support.greenhouse.io/hc/en-us/articles/360062257351-Configure-approvals
- Greenhouse, Approvals FAQ (19 October 2023) — https://support.greenhouse.io/hc/en-us/articles/18222984976795-Approvals-FAQ
- Greenhouse, Review applications in bulk (2 March 2026) — https://support.greenhouse.io/hc/en-us/articles/115003558531-Review-applications-in-bulk
- Greenhouse, Move candidates to another stage in bulk (2 March 2026) — https://support.greenhouse.io/hc/en-us/articles/360028064592-Move-candidates-to-another-stage-in-bulk
- Greenhouse, Interviewer guide: how to use interview kits — https://support.greenhouse.io/hc/en-us/articles/115002226826-Interviewer-guide-How-to-use-interview-kits
- Greenhouse, Release Notes: June 2026 — https://support.greenhouse.io/hc/en-us/articles/52020874441883-Release-Notes-June-2026
- Greenhouse, Release Notes: August 2026 — https://support.greenhouse.io/hc/en-us/articles/54903667366299-Release-Notes-August-2026
- Workday, *The Job Application Business Process* — https://doc.workday.com/workday-education/en-us/course-manuals/recruiting-for-administrators/the-job-application-business-process.html
- Workday, *Recruiting Subprocesses* — https://doc.workday.com/workday-education/en-us/course-manuals/recruiting-for-administrators/recruiting-subprocesses.html
- Ashby, Advanced scheduling metrics — https://docs.ashbyhq.com/advanced-scheduling-metrics
- Ashby, Product update: save attachments from email — https://www.ashbyhq.com/product-updates/save-attachments-from-email
- Ashby, Product update: optional candidate availability notes — https://www.ashbyhq.com/product-updates/optional-candidate-availability-note
- HubSpot, Associate activities with records (9 September 2026) — https://knowledge.hubspot.com/records/associate-activities-with-records
- HubSpot, Manually log a call, email, or meeting on a record (7 August 2026) — https://knowledge.hubspot.com/articles/kcs_article/contacts/manually-log-a-call-email-or-meeting-on-a-record
- Salesforce, Pipeline Inspection — https://help.salesforce.com/s/articleView?id=sf.pipeline_inspection.htm

**Tier 3**

- State of Nebraska DAS Personnel, *Workday User Guides — Recruiter: Screen and Move Candidate(s)*, 18 pp., updated 12 July 2026 — https://das.nebraska.gov/personnel/docs/NE_DAS_Personnel_Workday_User_Guides-Recruiter_Screen_Move_Candidates.pdf
- Geisinger Workday Training, *Recruiting: Moving a Candidate through a Requisition* — https://workdaytraining.geisinger.org/PDFContent/J116_MoveCandidateThroughReq.pdf
- rfp.wiki, Workday Recruiting admin load and sentiment (aggregating 4,047 reviews across G2, Capterra, Software Advice, Trustpilot, Gartner Peer Insights) — https://www.rfp.wiki/enterprise-software-enterprise-application-software-eas-enterprise-service-management-esm/talent-acquisition-suites/workday-recruiting
- GoodTime, 2026 hiring statistics (excerpt from the *2026 Hiring Insights Report*, 2 February 2026; no sample disclosed) — https://goodtime.io/blog/talent-operations/hiring-statistics/
- Greenhouse, Tips for improving interview scorecard submission rate — https://www.greenhouse.com/guidance/tips-for-improving-interview-scorecard-submission-rate
- Ashby, Scheduling 2.0 (17 April 2024) — https://www.ashbyhq.com/blog/product/ashby-scheduling-2-0
- Lever, Building requisition approval workflows (did not render; quoted via search snippet) — https://help.lever.co/hc/en-us/articles/20087301188765-Building-requisition-approval-workflows
- Lever, Revising offers (HTTP 403; quoted via search snippet) — https://lever-old.zendesk.com/hc/en-us/articles/4409924103437-Revising-offers
- Christine Marshall, *Ultimate Guide to Salesforce Pipeline Inspection*, Salesforce Ben, 22 March 2024, updated 18 May 2026 — https://www.salesforceben.com/ultimate-guide-to-salesforce-pipeline-inspection/
- Revenue Grid, *Einstein Activity Capture: How It Works + Limitations (2026)* — https://revenuegrid.com/blog/einstein-activity-capture-2026/
- Xappex, *Salesforce Lead Conversion Mapping: How to Avoid Data Loss* — https://www.xappex.com/blog/salesforce-lead-conversion-mapping/
- Gartner Peer Insights, Dynamics 365 Sales vs Pipedrive (2026; HTTP 403, via search snippet) — https://www.gartner.com/reviews/market/sales-force-automation-platforms/compare/product/microsoft-dynamics-365-sales-vs-pipedrive
- HubSpot Ideas, "Log activity without completing task" (HTTP 403; second-hand via search snippet) — https://community.hubspot.com/t5/HubSpot-Ideas/Log-activity-without-completing-task/idi-p/349636

**Internal**

- [17. What a B2B sales organisation actually does, day to day (2025–2026)](17-sales-org-workflow-inventory.md) — one input for the CRM half: activity-volume medians, workflow ranking, and the sourcing gaps in its §11.
