# 13. Chains of work: the problem one level above screens

*What B2B work looks like as chains of moves across related objects, what it costs when software cuts those chains, and what "perfect" would have to mean. This is the synthesis of six research memos ([20](sources/20-theories-of-work-structure.md) to [25](sources/25-people-and-revenue-operations.md)), about 150 sources across eight domains: electronic health records, customer support, accounts payable, procurement, issue tracking, incident response, recruiting, and CRM. It describes the problem. It proposes nothing. ollopA, the example product in this repository, was not used as evidence and is not mentioned again.*

*Method: a draft model with five hypotheses (H1 to H5, in [CHAINS-BRIEF.md](sources/CHAINS-BRIEF.md)) was given to six agents with the instruction to test it, not to confirm it. Every memo ends with verdicts and a section on what the model has no words for. This document keeps what survived, restates what needed changing, drops what was wrong, and adds what the evidence found that the draft could not express. Where a number appears, its setting is in the memo cited.*

---

## 1. What the draft got wrong

The draft is the starting point of this research, and the evidence rejected more of it than it kept. Stating the reversals first, because they are the finding.

1. **Boundary cost is not "unrelated to the difficulty of the thought". It multiplies it.** A switch cost rose 823 ms with rule complexity; disruption "depends on the user's mental load at the point of interruption"; resumption time rises with the interruption's demand (memo 21). The hardest thoughts pay the largest boundary tax. That is worse than the draft said, and more precise.
2. **Indirection is not a cost law.** Its own source denies the spatial half ("placing a light switch far from the light bulb it controls makes it easier to turn on the light"), contains no empirical validation, and a redesign that cut indirection on every axis made the task 0.65 seconds slower per call (Project Ernestine). People also cannot read the cost off the interface: half of measured navigations produced less value than predicted and a third cost more (memo 20). Indirection survives as a heuristic for a person's own moves, not as the cost.
3. **Most time is not spent at boundaries.** Only 24% of measured foraging was between patches. What concentrates at boundaries is the *unbudgeted* cost: 25.7% of unexpected cost against 13.4% within a patch (memo 20). The draft located the cost at every hop; the evidence locates the surprise there.
4. **The moves missed the largest family of real behaviour.** The one bottom-up taxonomy of professional work found three families: within-patch, between-patch, and *enrichment*, restructuring the workspace so later moves are cheaper. Enrichment was 366 of 992 measured strategy segments. None of the draft's eleven moves does that (memo 20).
5. **The hop is rarely A to B and back.** After 65% of application switches, the next switch came within eleven seconds. The dominant real shape is a run of boundaries in a row (memo 21).
6. **The detour was three shapes, not one.** What the domain audits found was not only a sub-chain that returns, but a completed sub-chain replayed because one attribute changed (Workday's Edit Offer "starts the offer process over"), and a chain unwound backwards across other people's completed moves (rescind) (memo 25).
7. **"No modes" misstates its source.** Raskin's rule is relative to a specific gesture and conditional on the state not being the person's locus of attention; he advocates quasimodes. A randomised trial of 3,356 clinicians that removed a mode (one open record instead of four) found no fewer wrong-patient orders and more keystrokes (memos 20, 22). The accounting period is a mode enforced by law (memo 23).
8. **"The software knows which chain you are in" is ill-posed, and the one product that does it is the worst-reviewed.** Workday's navigable unit is a step of a business process; it knows the chain, and it measures worse than object trees, because chain position becomes a transient artefact that can be lost, with a documented rescue path for when the task fails to arrive (memo 25). "The activity itself is the context" (memo 20); the survivable form is that the person declares the chain.
9. **Cost is not only a person's cost.** The expensive chains in finance and recruiting are cross-person, and their cost is hours and days of other people's latency, against which a click is noise: 22 days to clear a price block, 8.2 days to approve an invoice, 3.7 against 5 hours to confirm an interview (memos 23, 25). The draft priced screens; the work is priced in people.
10. **Some cuts are required.** Segregation of duties, the accounting period, second approval over a threshold: a chain that could be one person's is deliberately cut for control (memo 23). The draft treated every cut as a defect.
11. **Indirection predicts effort, not error.** The same Adelman trial: less indirection, more keystrokes, same error rate (memo 22).
12. **Animation buys orientation, never speed.** Reconstruction errors 0.4 against 1.8 with and without animated transitions; "no evidence that it also aids task performance time"; and staggered motion "can give the illusion of facilitating" while performing worse (memo 21). The draft's "effects appear where the cause was" holds for causality in time and fails as an argument for motion.

What survived intact: the work is a graph and the software is a tree (with amendments); the working set of a chain must stay visible for the chain; a cue at the point of return is worth a measurable amount; and a lap's cost is per lap times laps.

---

## 2. The mismatch, restated

**The work is a graph.** Every domain audited has a small set of object types with dense many-to-many relations, and the person's thought crosses them in one sentence. "This creatinine is up, she is on lisinopril, that was started in March, so hold it and recheck" crosses four object types and two encounters (memo 22). The three-way match reconciles n receipts and m invoices against one purchase-order line, within a tolerance held on a different screen (memo 23). An alert has a causing deploy and a look-alike incident from last month, and no product stores either edge; both are re-derived by eye every time (memo 24). Salesforce's own benchmark schema is "25 interconnected objects" (memo 25).

**The software is a tree of something, and not only of object types.** The audits found trees of object types (the ATS, the CRM, the issue tracker), of document types (four SAP transactions for one question, "is my order confirmed"), of processes (Workday's inbox tasks), of periods (a closed month makes a mutation illegal), of permissions (a Coupa user loses sight of a transaction the moment their step completes), of organisations (three separate buyer questions answered "contact your customer"), and of vendors (alert to deploy, incident to follow-up to issue to pull request, each edge spanning products and existing only as an integration administered in advance) (memos 23, 24, 25). The general statement: **the cost comes from any tree whose nodes are not the person's chain.** A process tree fails in its own way, by making chain position a losable object.

**The deeper defect may be whose objects the schema holds.** Bødker's secretaries used a system in which "the contents of the cases, the objects dealt with by inspectors and secretaries when handling a case, are almost absent"; the schema encoded accounting, not work. Beaudouin-Lafon's complaint was that the objects a chain crosses "are rarely implemented as first-class objects": Word's styles editable only "via transient dialog boxes that must be closed before returning" (memo 20). In the audits: the week-over-week pipeline change a manager works from exists in no CRM as a thing to hold; the relation between an issue and its code is a string typed into a branch name; a ticket's escalation is a relation plus a state, not an object (memos 24, 25). A graph the software does not model cannot be traversed, only re-derived.

**The measured shape of the mismatch.** Emergency physicians switch EHR screens 185.8 times an hour; the single commonest transition, "Storyboard viewed" to "ED Workup Activity viewed", is 12.9% of all two million event pairs: one in eight transitions is a bounce between the object you read and the object you act on (memo 22). Enterprise workers toggled between applications nearly 1,200 times a day and spent just under four hours a week reorienting; one supply-chain transaction took 350 switches across 22 applications (memo 21). Developers stay 0.3 to 2 minutes in one activity, keep 12 windows open, and call 1.8 of them relevant (memo 24). Clinicians switch tasks 1.4 times a minute, measured three ways (memo 22).

**Crossing is sometimes right.** Charnov's marginal value theorem gives a rate-maximising forager a non-zero crossing rate; subjects also failed by staying "a disproportionate amount of time in low-value patches" (memo 20). A hop can cost nothing once practised: an object located while already pointing at it is "set to zero" in the model, and mouse-over documentation was used "extensively" and "rarely even mentioned" (memo 20). The mismatch is real, and it is not the sum of the hops.

---

## 3. The moves

The eleven moves of the draft (read, traverse, compare, link or unlink, mutate, create from context, collect a set, communicate outward, verify, decide, configure a rule) were sufficient to write every chain in eight domains, and an independent action taxonomy from 40 enterprise tasks maps onto them: selection 23%, navigation 16.1%, typing 11.1% (memo 25). They are the core vocabulary. Three things about them are now known.

**The level of a move is not a property of the move.** Activity theory's central mechanism: a conscious action, practised, collapses into an unconscious operation, and "when conditions change, an operation can again unfold and return to the level of conscious action". The same move has two costs, and which one applies depends on the person and the moment, not on the screen (memo 20). This is why "a lap for a novice is one hop for an expert", and why no fixed cost can be attached to a move. It is also a warning about method: asking people about their moves "brings operations to the subject's conscious awareness", so an interview elicits the broken and the non-routine and misses the fluent (memo 20).

**Several moves need splitting**, because the two halves cost differently:

- *Communicate outward* splits into telling a known person now, and writing a record for an unknown future reader (the timeline, the postmortem, the stand-up note), paid for by whoever is deepest in the work (memo 24).
- *Mutate* splits into the reversible edit and the irreversible one: a lead conversion that "silently drops" unmapped fields and leaves the lead "read-only" (memo 25); a merged ticket that "cannot be un-merged" (memo 22); a payment that leaves the building (memo 23).
- *Link* implies symmetry it does not have: merge destroys and recovery creates a different object (memo 22); linking a follow-up into a tracker transfers the right to edit it, "the tracker owns its title, description, status, owner, and labels" (memo 24).
- *Collect a set* and *act on a set in one act* are different moves, and the second has documented ceilings everywhere: 100 tickets, 1,000 issues, one job at a time, one workflow at a time, 50 items per field from a backlog (memos 22, 24, 25).
- *Compare* cannot express the three-way match. The real move is *reconcile n sets against a tolerance*, set-valued, partial, with a configured rule deciding what counts as agreement (memo 23).
- *Verify* assumes the system answers honestly. "Transitions previously failed silently, so errors went unnoticed"; a Jira smart commit blocked by a required field "will silently fail"; a GitHub closing keyword on a non-default branch is "ignored, no links are created" (memos 24, 25). A verify against a system that misreports has no success condition.

**Moves the draft had no word for**, each found in more than one domain:

- **Enrichment.** Restructuring the workspace so the next fifty moves are cheaper: bookmarks, tabs held open, "scrollbars strategically placed", a pinned view. The largest or second-largest measured family of professional behaviour (memo 20). Its cost is invisible to any measurement made inside the product: 25% of information workers had crashed a browser maintaining their tabs (memo 21).
- **Synthesise.** Writing the working set into an artefact so that it stays visible: clinicians "synthesize relevant encounter-related information recorded in disparate EHR regions in a centralized location" and over-document as a result; incident commanders keep "a living incident document" in Google Docs by doctrine (memos 22, 24). Distinct from collecting a set because the artefact outlives the chain and pollutes the record.
- **Wait, or park.** Twenty-two days for a block to clear; 44 days between invoice receipt and payment in 77% of cases; a review queue that holds a pull request for 4 to 20 hours. SAP gives parking three transaction codes; Linear's snooze returns an issue "when there's new activity on that issue"; nothing else in eight domains holds a parked chain as a first-class thing (memos 23, 24).
- **Solicit, or chase.** Repeated outward communication that transfers no work, reaches no customer, and changes no object: chasing approvers, scorecards, close dates, confirmations. "The commonest cross-person chain in both domains", and it leaves the product: "scorecard reminders are emails" (memos 23, 25).
- **Release against a rule.** Clearing a payment block, overriding an alert, exempting one object from the rule that governs many, and recording why. The draft has configure-a-rule and nothing for its opposite (memos 22, 23).
- **Quorum-decide.** N of M approvers, "all at once or in order"; the chain includes tracking who has not acted (memo 25).
- **Situate against a base rate.** "38% of scorecard pairs differ by at least one point"; deciders ask "how does this compare to normal", and no move places an object against a distribution (memo 25).
- **Infer a relation.** Alert to causing change, this incident to that one, issue to code: relations stored nowhere and recomputed by eye. The draft assumed a relation exists to traverse (memo 24).
- **Recover.** The moves that repair a destructive act: a follow-up ticket from a merged one, a reorder on the correct patient within ten minutes, measured as a standard safety metric (memo 22).
- **Apportion and delegate.** Coding one invoice across many GL lines; handing a sub-chain to a bystander so the responder is not evicted (memos 23, 24).
- **Shield.** Bystanders gathering data "as a means of reducing context switching" for the responders: work whose product is another person's uncut chain (memo 24).

The taxonomy is open. Kuutti's impossibility result stands: "it is impossible to make a general classification of what an activity is, what an action is", because the level depends on the subject and the situation (memo 20). The list above is a vocabulary for describing chains, not a closed set.

---

## 4. The shapes

Shapes recur and are worth naming: 58% of measured foraging "fell into distinct dietary patterns", in eight of nine participants. Two cautions travel with that number. **42% fitted no pattern**, and the patterns found were "mostly in patterns not previously discussed in the literature", a direct warning that a taxonomy written at a desk misses the real ones (memo 20). And shapes are indexed to skill: a lap for a novice collapses into a hop for an expert.

**The shapes that held, restated.**

- **The traversal.** The draft's hop, A to B and back, is the minority. The field pattern is a run of boundaries: 65% of switches are followed by another within eleven seconds; a supply-chain transaction crosses 22 applications (memo 21). The clinical bounce (12.9% of transitions) is the pure hop; most real hops are the middle of a run.
- **The lap.** The same short chain over many objects: in-basket triage (49 messages a weekday), the application sweep (about 580 applications per job), the task queue (112 activities a day median), the open-order lap, backlog grooming, working a view (memos 22, 23, 24, 25). Its cost is per lap times laps, and its documented cut is a bulk tool that stops short: "You will still need to individually review, move, or reject each application"; "Close tab returns you to the view list; Next ticket in view opens the next ticket" (memos 22, 25).
- **The fork.** Gather from B and C, act on A: the chart biopsy before a patient, the three-way match, opening a ticket and orienting, prep for a call with five traversals, alert to first hypothesis (memos 22, 23, 24, 25). The reasons live on B and C, the act is on A, and the audits' vendor features (context panels, side panels, Pipeline Inspection, Bill Capture's split view) exist to pull B and C to A. Splitting a comparison across panels cost 13 to 18 accuracy points; keeping views visible beat visiting them (memo 21).
- **The detour, split in three.** *Detour and return*: a precondition blocks the chain and a sub-chain returns (an interruptive alert mid-order, an article lookup mid-reply). *Rewind*: a completed multi-person sub-chain replayed because one attribute changed ("this starts the offer process over"; a PO change resets approval, repeated 2.1 times per case where it occurs). *Rescind*: a chain unwound backwards across other people's completed moves, with silent side effects (memos 22, 23, 25). "A detour returns to the exact point" had no supporting evidence in any domain; what the literature prices is a cue at the point of return, not restoration of position (memos 21, 24).
- **The ripple, with direction and invertibility.** One move changes other objects. Solving a problem ticket solves its incidents; reopening it does not reopen them: forward-only. A merge moves the issue's status by a magic word; the link "can't be removed" (memos 22, 24). The invisible ripple is the one that hurts, and the cognitive-dimensions literature already named it: hidden dependencies (memo 20).
- **The chain over time**, and its evil twin **the stall**. A chain suspended for hours or days, resumed on arrival of something. The stall is a chain over time whose resume trigger is another person's silence: nothing arrives, and the person must notice an absence. 49% of AP leaders name approval latency their top problem; a notification that told reviewers a chain was open cut pull-request resolution time by 60% in a randomised trial (memos 23, 24). The software represents events, not absences.
- **The handoff**, priced twice. "It requires added work to place items in common", at packaging and again at receipt, with translation loss (memo 20). Shift handoff runs on a spoken protocol because the tools do not carry the state; child tickets inherit once and never again (memos 22, 24). Two variants: the **relay**, a handoff that must come back to the exact point weeks later (the price-variance query); and the **shape-driven handoff**, where a chain passes to a different role purely because of its width (multi-event scheduling: recruiters 21%, coordinators 67%) (memos 23, 25).

**The shapes the draft lacked**, each corroborated in at least two domains.

- **The braid.** Several chains in flight, none blocked, advancing in short slices: 1.4 switches a minute with "over one-fifth of task time spent on multitasking", multitasked tasks *shorter* (20.7 against 30.1 seconds) because people compress the move to fit the gap; developers at 0.3 to 2 minutes per activity; a working sphere interrupted and resumed with "more than two intervening activities" between (memos 21, 22, 24). Not interruption, which blocks, and not a lap, which repeats.
- **The queue.** A machine-generated, shared set the person did not make: the exception list, the triage inbox, the alert stream, the awaiting-acknowledgement list. Its failures are contention, re-triage, and false positives with no exit ("if an invoice is listed as a duplicate and it is not, there is no easy way to get it processed anyways") (memos 23, 24).
- **The sweep.** One act intended for a whole set, distinct from a fast lap by intent, and everywhere capped (memo 24).
- **The pre-hypothesis scan.** "Sweeping looks across the environment looking for cues": a shape with no target object at all, the first minutes of an incident and the first pass over a queue (memo 24). Read, traverse and compare presuppose a target; this precedes one.
- **The enrichment detour.** Leaving the chain to restructure the workspace and returning cheaper (memo 20).
- **The nested loop.** One chain's output is another's corpus: "the encodons created by one learning loop can be the documents consumed by another" (memo 20); the postmortem's follow-ups become the backlog's issues (memo 24).
- **The loop that changes the object.** Contradictions in the activity are "sources of development"; nothing in the draft is "the work changed what the work is about" (memo 20).

**One correction about the layer.** Task time is set by the critical path, not by the sum of moves: a redesign faster on every feature "considered in isolation" was slower overall (memo 20). A sequential shape taxonomy describes a parallel scheduling problem. The shapes are a vocabulary for what a person is trying to do; they are not a cost model.

---

## 5. What the cost is

The draft said indirection. The evidence gives an ordered list of better-attested terms, and none has been compared against the others on one task.

1. **Whether the reason and the act must be understood together.** Split attention costs "in proportion to whether either can be understood alone": integration was no better than separation "in areas in which it was not essential", and the effect returned "if the material was organized in such a manner that individual units could not be understood alone" (memo 21). Two objects that must be read together to make one decision are expensive to separate at any distance; two that are merely both relevant are not. This is the heaviest term, and the operational form of "reason and act on one surface".
2. **How many modes stand between the person and a place they already know.** People knew where commands were to within 92 pixels and still needed 1.95 selections; a flat layout was 25 to 34% faster and made one-tenth the errors, because "each hierarchical level constitutes an interaction mode" (memo 21). Distance was not the cost; hierarchy was.
3. **Cognitive weight at the boundary.** Multiplicative, as stated in section 1. Preparation "reduces, but does not eliminate" a switch cost; design buys back the preparable part and not the rest (memo 21).
4. **Other people's latency, and how many of them the chain waits on.** Hours and days, an order of magnitude above anything a screen can charge (memos 23, 25). The draft's temporal distance was 100 ms to 10 s; the audits' is 22 days, and at that scale the cost is not slowness but the destruction of the working set and a full reconstruction on return.
5. **Authority and organisational distance.** The person can see the object and may not act on it: blocking reasons gated by authorisation objects, segregation of duties, a closed period, a tracker that owns the exported follow-up, half a procurement chain inside another company reachable only by "ask your customer" (memos 23, 24). The obstacle is permission, and the cost is a handoff, not a hop.
6. **The critical path.** What the whole task waits on, not the sum of its hops (memo 20).
7. **Chain length itself.** Humans scored 61.2% on enterprise tasks of 41 to 75 steps that they could see in full, against 97.9% on simple interactions; agents drop from 58% single-turn to 35% multi-turn (memo 25). Long chains fail even without boundaries.
8. **Switch frequency times activation cost.** "The activation costs become significant when the user must frequently change instruments" (memo 20).
9. **Trust in the instrument.** Practitioners under pressure abandon dashboards for the shell because the applications are "indirect or even opaque", and re-verify what the dashboard already said (memo 24). Distance does not explain that; credibility does.
10. **Pressure as a multiplier**, and **agency**: whether the person initiated the crossing. Control over the day was the dominant factor in a good workday across 5,971 developers (memos 21, 24).

**Where temporal distance does bite**: at thresholds, not linearly. Nothing measurable at 50 ms; a growing effect from 100 ms; flow breaks near 1 s; attention breaks near 10 s (a band of 5 to 30 s); and the only true experiment found that the penalty for 400 ms nearly doubled over six weeks and persisted for five weeks after the delay was removed, a learned aversion to the path that outlives the fix (memo 21). No latency study exists for captive users, where the cost cannot appear as abandonment and must appear as errors and workarounds.

**Where spatial distance does not bite**: the light switch; the cockpit speed bug, which increases both offsets and lowers cost because "a properly set speed bug is much less likely than a pilot's memory to forget its value"; and the cheapest hop in the foraging studies, which cost nothing (memo 20).

**Three things about cost that no cost term captures.** People cannot predict it: 51% of navigations produced less value than expected, 37% cost more (memo 20). Preference and performance come apart: participants rated easiest the condition they performed worst in; developers slowed 19% by a tool believed it had sped them up 20% (memos 21, 24). And the cost migrates out of view: into tabs, sticky notes (27% of clinicians track results on them), spreadsheets, Google Docs, and chat, where no measurement made inside the product can see it (memos 21, 22, 23, 24).

---

## 6. What perfect would have to mean

The draft's eight properties, each marked by what the evidence did to it, plus the properties the evidence added. These are descriptions of a state, not designs.

**Held.**

- **The working set of a chain stays visible for the chain.** People hold one graphical object across a transition and look again rather than remember; force more across and errors appear. A central store of "3 to 5 meaningful items", and chunks cross a boundary only if the person already holds the schema, which is why an expert carries an invoice across a hop and a novice cannot carry three fields (memo 21). Corroborated by the steel-plant redesign predicted to halve execution time by showing all five levels at once, by the cockpit that computes speeds 25 minutes early and pins them where they will be read, and by every vendor feature that pulls a neighbour to the point of action (memos 20, 22, 25). Where the software does not keep it, people manufacture one and pay twice: the note, the sticky, the tab, the doc.
- **A cue at the point of return is worth a measurable amount.** The priming constraint and a 467 ms cueing effect are the same finding from two directions; response times recover over "the first 10 responses (15 sec or so)" after an interruption (memo 21). Restated from the draft: what must be restored is focus on the object of the activity, not a cursor position; a real expert needed "a relaxed goal-stack" (memo 20).

**Restated.**

- **Nothing destroys state that any participant's chain still needs, and destruction by design is legible and resumable.** Three amendments in one. Not only a *move* destroys: the most-complained-of destroyer in clinical work is the inactivity timeout, and a Coupa user's access vanishes when their step completes (memos 22, 23). Not only *my* chain: "all incomplete Give Interview Feedback tasks will disappear and will not be able to be submitted" when one person submits (memo 25). And some destruction is required: changing a purchase order *must* invalidate its approval; the property asks that this be visible before the act and resumable after it, not absent (memo 23).
- **No completed sub-chain is replayed because a later attribute changed.** The rewind, named in section 4, as a property (memo 25).
- **The result is visible before commitment.** This replaces "reason and act on one surface". The verified defect in the direct-manipulation literature is incrementality, not co-location; and fusion is unwanted, because people deliberately "shift back and forth between attending to the properties of the representation and the properties of the thing represented" (memo 20). The split-attention finding gives the boundary: co-presence is required exactly where neither thing can be understood alone (memo 21).
- **Cause and effect are close in time; in space, only where it helps orientation.** The temporal half holds: "short temporal offsets are desirable because they exploit the human perception-action loop and give a sense of causality" (memo 20). The spatial half is denied in principle ("screen space often has no natural correlate in physical space") and enforcing it would destroy the person's scratch channel, the file "left near the trash can" (memo 20). Motion between states buys orientation and object identity, four to eight times fewer reconstruction errors, and buys no speed (memo 21).
- **No mode whose state sits outside the locus of attention.** Raskin's own condition. A mode can be the cheaper arm of a trade-off; each hierarchy level is a mode and carries ten times the error rate; the period is a mode enforced by law, and the testable form is that a person sees which mode they are in before acting, not after (memos 20, 21, 23).
- **The boundary tax must not multiply the hard thoughts.** This replaces "cost proportional to cognitive weight", which the evidence inverted. The chain's cost tracks the critical path, habituation, and representation-building; some cost is irreducible because other people exist; and "if the interface is really invisible, then the difficulties within the task domain get transferred directly into difficulties for the user" (memo 20).
- **The person declares which chain they are in.** This replaces "the software knows". Context "is not an outer container"; the motive is not observable at the interface; 42% of measured foraging fitted no pattern; and the product that knows the chain makes its position a losable object (memos 20, 25). The measured endorsement of the intent behind the draft: across 13,383 engineers, the *number* of intact focus sessions predicted felt flow and the total hours did not (memo 24). Intact chains matter; inferring them does not work.

**Added.**

- **The person can cheaply restructure the workspace.** Enrichment is a first-class family of behaviour and the model must have room for it (memo 20).
- **The software does not misreport state.** Silent failure defeats verification, the move every other move rests on (memos 24, 25).
- **The cost of a move lands where it is caused.** A wrong price on a PO line becomes a blocked invoice in someone else's queue three weeks later, and nothing shows the buyer the downstream cost of the change they just made (memo 23).
- **Absence is a state.** Silence, an unarrived confirmation, a pending approver who has not acted: the stall needs to be visible as a thing, since the software otherwise represents only events (memos 23, 25).
- **Required cuts are explicit.** Segregation of duties, quorum, the second approval: a cut for control is legitimate and must be shown as one, distinct from a cut that is merely the schema's shape (memo 23).

**One caution about the whole list.** Project Ernestine is the case where a design that improved many local properties lost overall, because the estimate rested on "the greater speed of the new features considered in isolation" (memo 20). Any property list evaluated feature by feature will mislead. The unit of evaluation is the chain, on its critical path, with the people in it.

---

## 7. What the model still cannot say

The families of things every memo found and the vocabulary above still does not hold. They are listed because they are where the next version of the model grows or fails.

- **Root context as scope.** A patient is not an object you read; it is the scope in which every later act means something, so switching patients reinterprets everything rather than traversing a relation (memo 22). Neither object nor mode.
- **The chain relocated out of the software.** Paper lists, sticky notes, printouts, spreadsheets, Google Docs, chat: a chain moved to a substrate with no relations at all because it supports one move the software lacks, usually reminding or holding (memos 22, 23, 24).
- **Metered and capped neighbourhoods.** Merge suggestions "with a usage allowance that resets monthly"; ten recent incidents from seven days; "the five most recent associated open deals"; the first 100 commits. Traversal is not possible or impossible but *partial*, truncated by plan or policy, and a fork may be silently incomplete (memos 22, 24, 25).
- **The configurer and the runner are different people with opposed incentives.** Millions of interruptive alerts configured once by someone who never runs the chain, with habituated dismissal the measured outcome; a support agent who notices the pattern but lacks the permission to encode the macro (memo 22).
- **Completion metrics that reward the wrong move.** Marking a side conversation done "doesn't fulfill First time reply" metrics, so people act to satisfy the metric (memo 22).
- **Occasional participants.** 557 users touched 179,429 purchase items, about one each per working day; most people in an approval chain do not know the software and one has to "memorise the series of tabs and drop down cells" (memo 23). The model assumed a practitioner.
- **The object as a version stack**, **aging as an attribute**, **the period as a container**, **tolerances**, **the counterparty at another tempo**, **batch atomicity and partial failure**, **a status taxonomy standing in for state** (each a waiting room with its own exit) (memos 23, 25).
- **Several people in one chain at once, mostly re-reading.** 76.6% of window switches go to an already-open window; all the shapes are single-person (memo 24).
- **Holding a chain open while waiting.** The cost of keeping an intention alive across a review queue, distinct from resumption (memo 24).
- **The missing entry point.** Where the chain position is a task in an inbox, an unarrived task leaves the chain with no door (memo 25).
- **Cross-system identity without a key.** "Workday doesn't match phone numbers if the formatting differs" (memo 25).
- **Redundancy and division of labour as cognitive mechanisms**, not overhead; and "it takes effort to maintain coordination" (memo 20).
- **Contradictions as the engine of change**, and **history**: the work changes what the work is about (memo 20).
- **Opportunistic use of unspecified structure.** The salmon bug's width "is not actually spelled out in the specifications", yet pilots use it as a ten-knot ruler; tightening every move to its intended semantics removes that slack (memo 20).

---

## 8. What is unknown, and what would settle it

- **No study measures a chain.** Every unit in the literature is a trial, a task, a switch or a logged event. Nobody has run one chain through two products and priced the difference. This is the single most valuable study the field lacks (memo 21).
- **Whether the foraging numbers transfer.** Every number in section 1's third and fourth items comes from professional programmers debugging code, in samples of nine and ten, on tasks nobody finished. Whether an AP clerk or a support agent forages the same way is unknown (memo 20).
- **Which cost term predicts.** The ten in section 5 have never been compared on one task (memo 20).
- **No screen telemetry outside clinical work.** Zendesk, Salesforce, Greenhouse, Jira and SAP hold the event streams that produced the EHR numbers and publish none of them; support, recruiting, AP and issue tracking have no click-burden literature at all (memos 22, 23, 24, 25).
- **No latency study for captive users** (memo 21).
- **The action/operation split in real B2B chains**, unmeasurable by interview (memo 20).
- **What is in the 42%** of unpatterned foraging, which is where a shape taxonomy grows or fails (memo 20).
- **Whether the clinical switch rate is reducible**: 1.4 a minute has been measured three ways and never manipulated (memo 22).
- **The cost of returning to the wrong point**, and of a boundary priced by the relation traversed rather than the task switched (memo 21).

---

## 9. How this sits beside progressive disclosure

Progressive disclosure, as [RULES.md](../RULES.md) states it, decides what a surface shows and what it defers. It judges a screen at a moment. This document is about the person moving through objects and time, and the two are different axes: a surface can pass every disclosure rule and still cut every chain that crosses it, and a product can keep every chain intact and still bury the price. They meet at two seams already in the rules. Rule 5, keep context across the boundary, is a chain property stated for one boundary; the split-attention finding gives it a test (co-presence exactly where neither thing can be understood alone). Rule 7, decision-critical information is never behind a door, is the chain property "the result is visible before commitment" stated for price and risk. Rule 6, no inferred adaptation, is confirmed from this side by the product that infers the chain and measures worst. And rule 1, hide the rare, has a chain-shaped limit the rules do not yet state: a rare thing that a frequent chain needs mid-run is not rare to that chain.

Nothing here says what to build. It says what a screen is being asked to hold, by whom, for how long, and what it costs when it does not.

---

## Sources

The six memos, each with its own bibliography and its own "Still unknown":

- [20. Theories of work structure](sources/20-theories-of-work-structure.md)
- [21. Measured costs of cutting a chain](sources/21-measured-costs-of-cutting-a-chain.md)
- [22. Clinical and support work](sources/22-clinical-and-support-work.md)
- [23. Finance and procurement](sources/23-finance-and-procurement.md)
- [24. Engineering and operations](sources/24-engineering-and-operations.md)
- [25. People and revenue operations](sources/25-people-and-revenue-operations.md)

The brief they were written against: [CHAINS-BRIEF.md](sources/CHAINS-BRIEF.md), which holds the draft model (H1 to H5) as it stood before the evidence.
