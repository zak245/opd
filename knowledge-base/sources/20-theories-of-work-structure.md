# 20. Theories of Work Structure

*Research memo for the chains-of-work research. Tests the working model H1–H5 in [CHAINS-BRIEF.md](CHAINS-BRIEF.md) against the theoretical and empirical literature on what work is, one level above screens. No design is proposed anywhere in this memo.*

---

## 0. Sources and tiers

Fetched 2026-09-17 and 2026-09-18; PDF text extracted locally, with letter-spacing and OCR line-break artefacts repaired and nothing else changed. URLs in §11.

**Peer-reviewed, read in full.** Beaudouin-Lafon (CHI 2000); John & Kieras (*TOCHI* 3(4), 287–319, 1996); Hutchins, Hollan & Norman (*HCI* 1, 1985); Hutchins (*Cognitive Science* 19(3), 1995) and Hollan, Hutchins & Kirsh (*TOCHI* 7(2), 2000), both as **author manuscripts** — wording the authors', pagination differing; Lawrance et al. (*IEEE TSE* 39(2), 2013); Piorkowski et al. (CHI 2013; FSE 2016); Jin, Niu & Wagner (VL/HCC 2017), used only for its exposition of Pirolli & Card's patch model; Bannon & Bødker (ECSCW 1997); Russell, Stefik, Pirolli & Card (long version of the INTERCHI '93 paper).

**Academic-press chapters, read in full.** Kuutti (ch. 2), Kaptelinin (chs. 3, 5), Nardi (ch. 4), Bødker (ch. 7) in Nardi (ed.), *Context and Consciousness*, MIT Press, 1996; Hutchins (ch. 14, 2006); Pirolli & Card (2005) — cognitive task analysis with **no controlled measurement and no stated N**.

**Quotes via a secondary source, ranked lower.** Raskin, *The Humane Interface* p. 42, via Wikipedia — **with a wording caveat: a search snippet rendered the same sentence with "possible" inserted, so check a physical p. 42 before quoting it elsewhere**; his table of contents was verified against publisher front matter. Green & Petre's cognitive dimensions via Wikipedia. Project Ernestine's figures via John & Kieras §3.3 (Bonnie John co-authored both).

**Not reached; no claims are made on their behalf.** Card, Moran & Newell 1983 — so **the unit-task construct is unverified here**, including the ~10-second boundary; the keystroke-level model (CACM 1980, 403) — **no prediction-accuracy figure appears**; Shneiderman 1983 — **no verbatim Shneiderman quote from a Shneiderman original appears anywhere in this memo**; Pirolli & Card 1999 (OpenAlex: `'oa_status': 'closed'`) and Pirolli 2007; Raskin's body text; Bederson 2004 in *Ubiquity* (403 at both ACM routes; the only reachable text was a 2003 draft headed "For review only – do not cite or distribute", used once and flagged); Collins 1995, OVID, Prater's OOUX; *Cognition in the Wild*; *Acting with Technology*; *Through the Interface*; and **Engeström in his own words** — all three targets paywalled or TLS-broken, so everything attributed to him comes via Kuutti (whose figure is credited to Engeström 1987) or Bødker.

Two negative findings: "unit task" appears **zero times** in the 33-page John & Kieras synthesis; and the brief named their *other* 1996 TOCHI article (pp. 320–351), which returned 403, so its companion was read and all quotes are labelled to pp. 287–319. Material already in [02-cognitive-science.md](02-cognitive-science.md) is not repeated.

---

## 1. Activity theory: the level of a move is not a property of the move

Kuutti: "activities consist of actions or chains of actions, which in turn consist of operations," and then the mechanism:

> "Initially each operation is a conscious action… but when the corresponding model is good enough and the action has been practiced long enough, the orientation phase will fade and the action will be collapsed into an operation, which is much more fluent… On the other hand, when conditions change, an operation can again 'unfold' and return to the level of conscious action."

Nardi: "**All levels can move both up and down**."

**Boundary crossing.** Bødker: "An artifact works well in our activity if it allows us to focus our attention on the real object and badly if it does not." Breakdowns "occur when work is interrupted by something; perhaps the tool behaves differently than was anticipated… In these situations the tool as such, or part of it, becomes the object of our actions." A focus shift is "more deliberate than those caused by breakdowns… Now the operations that she normally does become actions to her."

Her field study observed H1's cost directly: secretaries at the Danish National Labor Inspection Service using VIRK, a menu system over a central database, with "more than four hours of videotape" recorded and four episodes analysed in detail. On the report-generator episode, "she is rapidly moving between focuses on the report, the report generator, the field… and the written documentation," and "the handling aspects of VIRK cause the various breakdowns encountered here, and **it does not give any help for shifting the focus back to the real object of work**." Only two of those objects "have to do with contents or purpose of the activity."

Her diagnosis is not topology but whose objects the schema holds: "**The contents of the cases—the objects dealt with by inspectors and secretaries when handling a case—are almost absent in the system.**" A contradiction: "what is needed is an efficient means of registration and accounting, but on the other hand… a means for cooperation and coordination of the effort."

**Graded cost of a break.** Kaptelinin: "When operations are frustrated… people often do not even notice… When a goal is frustrated, it is necessary to realize what to do next and to set a new goal… But when a motive is frustrated, people are upset, and their behavior is most unpredictable."

**Mediation is never neutral.** Kuutti: "the object is seen and manipulated not 'as such' but within the limitations set by the instrument," so "other potential features of an object remain 'invisible' to the subject."

---

## 2. Instrumental interaction: the primary text does not support H4

The paper H4 names separates domain objects ("Users operate on domain objects by editing their attributes") from instruments ("a mediator or two-way transducer between the user and domain objects"). Then H1's grievance, twenty-six years early and better stated:

> "there are more objects of interest than meet the eye: in many applications users must manipulate secondary objects to achieve their tasks, such as style sheets in Microsoft Word, graphical layers in Adobe Photoshop… **Unfortunately, these are rarely implemented as first-class objects.** Thus, for example, Word's styles are editable only via transient dialog boxes that must be closed before returning to the text editing task."

The defect is not one-screen-per-object-type; it is that the objects the chain crosses were never given object status.

**Activation cost.** "Each type of activation has an associated cost: Spatial activation requires the instrument to be visible on the screen, taking up screen real-estate and requiring the user to point at it and potentially dividing the user's attention. Temporal activation requires an explicit action to trigger the activation, making it slower and less direct." In passing: "(This is traditionally called a mode)." The driver: "the activation costs become significant when the user must frequently change instruments" — switch frequency, not distance.

**The properties.** "The degree of indirection is a 2D measure of the spatial and temporal offsets generated by an instrument. The spatial offset is the distance on the screen between the logical part of the instrument and the object it operates on"; "The temporal offset is the time difference between the physical action on the instrument and the response of the object." Two further properties sit alongside it: degrees of **integration** and **compatibility**.

**What it says the model gets wrong.** Indirection is explicitly not a cost law: "**A large spatial offset is not necessarily undesirable. For example, placing a light switch far from the light bulb it controls makes it easier to turn on the light.**" Only the temporal half has a direction: "short temporal offsets are desirable because they exploit the human perception-action loop and give a sense of causality." The paper aims to be "comparative… (as opposed to prescriptive, deciding a priori what is good and what is bad)," contains **no empirical validation** — no participants, no timings — and says "further work is needed to develop the model in more detail and assess its limits."

---

## 3. GOMS: cost is a property of the critical path, not of the hop

**Two cases state H1 independently.** In aircraft troubleshooting, activities "had a larger scope spanning several components or locations on the aircraft," with "no support for such multiple-component input-output tests, and so the user had to traverse the component hierarchy of the simulated aircraft several times." In steel-plant scheduling, five levels deep: "Adding a new downtime requires first traversing the hierarchy… while modifying the location or downtime date requires deletion and reentry. A side effect is that there is no method to allow the user to create a new downtime entry by simply selecting and modifying an existing downtime." The analysed fix displayed all five levels at once and allowed create-from-context, and **measured**: "it predicted that the redesigned interface would require overall only half the execution time as the original." One industrial redesign, analytic prediction, no user trial.

**A number for modes.** Gong's CAD system had "time-consuming interaction with 'modal' dialogs, which are dialog boxes that have to be explicitly dismissed before the user can continue." Result: "about 46% faster to learn and about 40% faster to use… A subsequent empirical test confirmed these predictions."

**Project Ernestine.** NYNEX toll and assistance operators, 1988; "the average decrease of one second in work time per call would save an estimated $3 million per year." The new workstation cut indirection on every axis — keys "closer together," "recognizable icons instead of obscure alphanumeric codes," "a net decrease of about one keystroke per call" — against an expectation of "as much as four seconds faster per call." CPM-GOMS predicted "an average of 0.63 seconds slower"; observed, "0.65 seconds slower." Why:

> "The simple estimate… was based on the greater speed of the new features **considered in isolation**. But the execution time for the whole task depends on how all of the components of the interaction fit together, and this is captured by the critical path."

**A hop can cost nothing.** Practised users locate a fixed object while already pointing at it, so "this parallel execution can be approximated… by simply setting the time for the VISUALLY-LOCATE-OBJECT operator to zero."

**Exclusions, in its own words.** "GOMS has no direct way of representing the nature or difficulty of the problem solving required to discover appropriate operators, methods, or selection rules"; "the user must be well practiced and make no errors"; and it does not supply the goal list, "nor correct a misformulation of the user goals." Also excluded: layout quality, affect, and "the social or organizational impact of the system." The scale is measured: "the expert's task of laying out a printed circuit board with a CAD tool was about half problem solving to figure out what to do next and half execution of routine procedures." On interruption, the method "clearly fails to deal with the case in which the user must respond to simultaneous or mutually interrupting events."

**Kaptelinin's rebuttal** names GOMS: "the relations between actions and operations are dynamic… The GOMS model, however, deliberately avoids considering nonroutine processes… Third, and most important, activity theory puts goals and actions into the context of activities, while GOMS does not deal at all with the origins of goals."

---

## 4. Direct manipulation, critiqued from inside the tradition

Hutchins, Hollan & Norman thank "Ben Shneiderman for his helpful comments on an earlier draft."

> "We call one underlying aspect of directness distance to emphasize the fact that **directness is never a property of the interface alone, but involves a relationship between the task the user has in mind and the way that task can be accomplished via the interface**."

Two axes, not one. "Semantic distance concerns the relation of the meaning of an expression in the interface language to what the user wants to say… Can the user say what is wanted in a straightforward fashion, or must the user construct a complicated expression to do what appears in the user's thoughts as a conceptually simple piece of work?" Articulatory distance "reflects the relationship between the physical form of an expression in the interaction language and its meaning." And the gulf of evaluation costs effort even when the data is on screen: "The information needed for the evaluation is in the output, but it is not there in a form that directly fits the terms of the evaluation."

**Practice decouples felt cost from structural indirection.** The subsection is titled "Automated Behavior Does Not Reduce Semantic Distance": "To skilled users, the interface feels direct because the invocation of mediating structure has been automated… There are no conscious intervening stages."

**What it is worst at**, from §6:

> "a repetitive operation is probably best done via a script, that is, through a symbolic description of the tasks that are to be accomplished. Direct manipulation interfaces have difficulty handling variables, or distinguishing the depiction of an individual element from a representation of a set or class of elements. Direct manipulation interfaces have problems with accuracy, for the notion of mimetic action puts the responsibility on the user to control actions with precision."

> "It is important not to equate directness with ease of use. Indeed, if the interface is really invisible, then the difficulties within the task domain get transferred directly into difficulties for the user."

Also, on domain-shaping: "The price paid for these advantages is a loss of generality: Many things are unnatural or even impossible."

---

## 5. Distributed cognition: indirection deliberately increased to cut cost

Hutchins made "over 100 flights as an observer member of crew in the cockpits of commercial airliners," using an airline's MD-80 operations manual. Landing speeds are computed "about 25 to 30 minutes prior to landing" and marked with mechanical pointers on the airspeed dial. "The speed card booklet is a long-term memory in the cockpit system," and "selecting the correct weight can't help but select the correct speeds."

**The finding that damages H4 most.** The bug *increases* both offsets — the pilot acts on a plastic pointer tens of minutes before the moment it governs — and *reduces* cost:

> "Thus a memory and scale reading task is transformed into a judgment of spatial adjacency."

> "a properly set speed bug is much less likely than a pilot's memory to 'forget' its value. The robustness of the physical device as a representation permits the computation of speeds to be moved arbitrarily far in time from the moment of their use and is relatively insensitive to interruptions, distractions, and delays that may disrupt internal memories."

Against reading this as one person's convenience: "To call speed bugs a 'memory aide' for the pilots is to mistake the cognitive properties of the reorganized functional system for the cognitive properties of one of its human components." Other people are the mechanism, not overhead: "This is a surprisingly redundant system. Not only is there redundant representation in memory, there is also redundant processing and redundant checking."

**From the TOCHI paper.** "A cognitive process is delimited by the functional relationships among the elements that participate in it, rather than by the spatial co-location of the elements." A named cost the model lacks: "**it takes effort to maintain coordination**." H5's co-location clause is denied in principle: "many of the actions we perform on icons have no meaningful correlate when we consider their referent… when we move an image of a hard drive to a more convenient position on the screen where could we be moving the real hard drive to?" "Screen space often has no natural correlate in physical space." The residue is useful — "Files may be left near the trash can to remind us that we need to delete them" — and against fusing reason and act, people "shift back and forth between attending to the properties of the representation and the properties of the thing represented."

**Cost is relational.** On navigators choosing landmarks: "appropriateness of a chosen LOP is not a property of the LOP itself, it is a property of the relations of the LOP to the other chosen LOPs." Nardi cautions against pushing this framework too far: "an artifact cannot know anything," and a theory "that posits equivalence between human and machine damps out sources of systemic variation and contradiction."

---

## 6. Foraging: the measured part of this memo

Scent and rate-of-gain basics are in memo 02. Pirolli & Card 1999 is closed access; the patch machinery is quoted from a peer-reviewed paper rendering it: "A forager first needs to expend some between-patch time getting to the next food patch. Once in a patch, the forager needs within-patch time to forage food and also needs to decide when to stay or leave this patch for the next one." And:

> "Charnov's marginal value theorem was developed to predict that in order to achieve the maximum rate of foraging information, a forager should remain in a patch so long as the slope of g(tw) is greater than the average rate of gain, R, for the environment."

So leaving is what a rate-maximising forager *does* once local returns diminish; between-patch time is an input to the optimum, not waste.

Three developer studies measured the rest. **Lawrance et al. (TSE 2013)**, ten IBM professionals on two real bugs: a **topology** is "A directed graph with vertices representing elements of the source code… and with edges representing navigable links," a **link** costs "just one click," and programmers constantly restructure the workspace — "creating bookmarks, leaving scrollbars strategically placed, and keeping multiple tabs or windows open for fast switching… **In turn, these actions change the cost/benefit tradeoffs of different debugging strategies.** Recall that information foraging theory refers to such actions as enrichment." One hop was engineered to near-zero: Eclipse's mouse-over documentation, which participants "rarely even mentioned… but used… extensively in their actions."

**Piorkowski et al. (CHI 2013)**, nine professionals, two-hour sessions nobody completed: "**Participants spent 50% of their time foraging.** Of their foraging, **58% fell into distinct dietary patterns**—mostly in patterns not previously discussed in the literature." And the result that relocates H1's cost: "**we were surprised that only 24% of participants' foraging fell into that category** [between-patch]. **Participants spent considerably more time foraging within patches and performing enrichment.**" Strategy segments: within-patch 394, between-patch 232, **enrichment 366**, of 992.

**Piorkowski et al. (FSE 2016)**, ten Oracle professionals, 20 minutes on jEdit issue #3223 (98,652 non-comment lines), **179 navigations**, agreement 86%/81%. Prediction fails: "**over 50% of developers' navigation choices produced less value than they had predicted and nearly 40% cost more than they had predicted**" — 51% and 37% — so their model is `max(E(V)/E(C))`, not `max(V/C)`, and they name the open problem the **Value Estimation Problem**. The decomposition: "costs can be incurred **by navigating between patches (Cb), or by processing within the patch once there (Cw). Thus, C = Cb + Cw.**" Unexpected costs in **66 of 179 navigations (36.9%)** — within-patch complexity **24 (13.4%)**, surrounding context **46 (25.7%)** — so "**the dominant type of unexpected cost was between-patch, Cb.**" Named causes: "the prey was in pieces scattered among multiple patches," "the path to the prey was long with no end in sight," and "sometimes there simply was no available path to the prey." H1's phenomenon under its own measured name:

> "one topology was the code itself… Another topology, disjoint from the code topology, was the jEdit running instance… **participants sometimes formulated a foraging goal while in one topology, but had to fulfill the goal in another. What was missing was a way for participants to easily navigate between related patches from one topology to another.**"

The failure can run the other way: subjects "spent a **disproportionate amount of time in low-value patches**." **Pirolli & Card 2005** adds that "**Starting up on a new task (whether goal-initiated or data-driven) is usually quite costly**," that "Reasoning about evidence and hypotheses has an exponential cost structure," and that top-down and bottom-up processes are "invoked in an opportunistic mix." Fuller extracts from these four papers belong in memo 21 and are not reproduced here.

---

## 7. Modes, sensemaking, handoffs

**Raskin**, via a secondary source quoting p. 42, subject to the §0 caveat: "An human-machine interface is modal with respect to a given gesture when (1) the current state of the interface is not the user's locus of attention and (2) the interface will execute one among several different responses to the gesture, depending on the system's current state." Also "Modes are a significant source of errors, confusion, unnecessary restrictions, and complexity in interfaces," and **quasimodes** — "modes that are kept in place only through some constant action on the part of the user." Publisher front matter confirms the shape of his argument: a section on the "Singularity of the Locus of Attention," another on "**Resumption of Interrupted Work**," one on "Modes and Quasimodes," and a whole chapter of **quantification** — GOMS keystroke-level, an efficiency metric, Fitts and Hick. Raskin's own method for the cost of a move is keystroke timing, not a qualitative heuristic.

**Bederson 2004** could not be reached. One point from the 2003 draft is recorded, ranked lowest: its third flow characteristic, Maintain Control, argues that systems deciding for the user and modifying the interface on that basis risk making the user feel out of control, naming adaptive interfaces as the prime example.

**Sensemaking.** "Sensemaking is the process of iteratively constructing a representation that will support an analysis task." "Representation shifts during sensemaking are intended to reduce the cost of task operations… Ill-fitting or missing data are called residue." A shape the model lacks: "The encodons created by one learning loop can be the documents consumed by another." Costs: "requiring additional steps every time we cross media," and "Beyond information retrieval, there is still the 'other 90%' of the information work: organizing the information, breaking it apart and recombining it in new ways, and generally re-presenting it for some use." From three early-1990s field cases: "the major cost was the 7 weeks spent developing the detailed outline," which bought "the complete writing and editing of the 90 page final report in two weeks."

**Handoffs cost twice.** Bannon & Bødker: "it requires added work to place items in common, work that would not be required if it was not for the CIS" — "an effort both at the point of closure where an information item is packaged to be placed in common… and in receiving, opening and interpreting this information, placing, or re-placing it in a local context."

---

## 8. Testing the model

Evidence is quoted in §§1–7; this section gives the verdicts.

### H1. The work is a graph, the software is a tree — **holds, but the cost function and the cost location are both wrong**

Attested three times: FSE 2016's measured "disjoint topologies," where a goal formed in one navigable graph could only be satisfied in another with no link across; GOMS's five-level plant hierarchy, whose redesign was predicted to halve execution time; and Bødker's secretary on video. Between-patch cost was the dominant *unexpected* cost, 25.7% of 179 navigations against 13.4% for within-patch complexity.

Four corrections. *The cost is not located mainly at boundaries* — only 24% of measured foraging was between-patch, so the supportable claim is narrower: the *unbudgeted* cost concentrates at boundaries while the bulk of time does not. *The cost is not per-boundary* — a link can cost one click or effectively nothing (Eclipse's mouse-over docs), and CPM-GOMS charges only the critical path, so "a cost unrelated to the difficulty of the thought" is too strong. *The screen boundary is not the natural seam* — processes are bounded "by the functional relationships among the elements," not by co-location. *The deeper defect may be whose objects the schema holds* — VIRK's absent case contents are a contradiction between accounting and work, not a topology defect, and no graph is cost-free, since the object is only visible "within the limitations set by the instrument."

And crossing is sometimes profitable: Charnov's theorem sets a non-zero rate-maximising crossing rate, and subjects also failed by staying "a disproportionate amount of time in low-value patches."

### H2. The moves — **needs changing, and is missing the most-used family of real behaviour**

*The one empirically derived move set does not match H2's.* CHI 2013 built a taxonomy bottom-up from nine professionals and got twelve strategies in three families: within-patch, between-patch, and **enrichment** — 366 of 992 strategy segments. **All eleven of H2's moves operate on domain objects. None is "restructure the workspace so the next fifty moves are cheaper."** That is the clearest gap in the model.

*A named impossibility result.* Kuutti: "it is impossible to make a general classification of what an activity is, what an action is, and so forth because the definition is totally dependent on what the subject or object in a particular real situation is." The same software project is an activity to a team member and an action to their executive.

*Nor are the moves sense-stable.* Progress-reporting inside project management and inside competing for promotion are different moves "even if the action and its other ingredients are exactly the same."

*It mixes categories.* H2 spans operations on domain objects, activations of instruments, and operations on instruments; "configure a rule that governs many objects" operates on a reified command.

*Two of its moves are the two that visible-object surfaces are worst at* — **collect a set** and **configure a rule** — and the remedy the literature offers for both is symbolic description, not manipulation.

*Also missing:* recover from error; wait or be interrupted; search for, instantiate and shift a representation; handle residue; cross media; package and unpackage a handoff.

*And a warning about method.* Nardi: interviewing and teaching "bring operations to the subject's conscious awareness." A move list elicited by asking is biased toward what has already unfolded into a conscious action — the broken and the non-routine.

### H3. The chain shapes — **real and recurrent, but incomplete, skill-indexed, and not prospectively knowable**

Shapes do recur: 58% of measured foraging "fell into distinct dietary patterns," in eight of nine participants. Two cautions: **42% fitted no pattern**, and the patterns found were "mostly in patterns not previously discussed in the literature" — a direct warning that an armchair taxonomy will miss the real ones.

The shapes are unstable because "All levels can move both up and down": a lap for a novice is one hop for an expert. Ernestine suggests the layer may be wrong, since task time is set by the critical path, making a sequential shape taxonomy the wrong description of a parallel scheduling problem. Handoff should be two moves and a translation loss, not one edge.

Three shapes to add: **the enrichment detour** (leave the chain to restructure the workspace, return cheaper); **the nested loop** (one chain's output is another's corpus); **the loop that changes the object**, since contradictions are "sources of development" — nothing in H3 is "the work changed what the work is about." Inferring shape prospectively is unsupported: the process has "lots of back loops," and scent gains "were often serendipitous."

### H4. Indirection is the cost — **wrong as stated; at best a designer's heuristic, and demonstrably not a user's predictor**

1. **The source denies it for the spatial half** (the light-switch sentence), disclaims prescription, and contains no empirical validation at all.
2. **A documented case of the opposite sign.** The speed bug increases both offsets and lowers cost, and its temporal distance is deliberately maximised because the external medium is more reliable than memory.
3. **A clean empirical counterexample.** Ernestine cut indirection on every axis; work time rose 0.65 s per call against an expectation of up to 4 s faster.
4. **People cannot read the cost off the interface in advance** — the strongest new evidence. 51% of navigations produced less value than predicted and 37% cost more. A property meant to predict felt cost that the person cannot apply has failed at its job.
5. **H4 covers the wrong half of the older theory.** Distance between act and object is *articulatory* distance; *semantic* distance is the half Hutchins, Hollan and Norman treat as more consequential, and H4 omits it. H4's third clause, "the distance between the reason for the act and the act," is in no source read here.
6. **Cost is relational and heterogeneous**, and **practice erases the difference** where it is measurable.

Demote indirection to a heuristic. Better-attested candidates, in rough order of evidence: **between-patch cost Cb as a share of unexpected cost** (25.7% vs 13.4%, measured); **the critical path**; **activation cost × switch frequency**; **representational fit**; **coordination effort**; **transparency**, with Raskin's locus-of-attention condition as the mechanism. H4 also omits **modality competition**.

### H5. The properties of perfect — **two hold, five need changing, one is ill-posed, one is missing**

- **Working set stays visible, and no move destroys needed state — hold.** Supported by the steel-plant redesign, the cockpit speed card, and the exponential cost of holding evidence in the head.
- **A detour returns to the exact point — holds in spirit, needs restating.** Modelling a real expert needed "a relaxed goal-stack," and what must be restored is focus on the object of the activity, not a cursor position.
- **Reason and act on one surface — needs changing.** The verified defect is incrementality, not co-location; restate as *the result is visible before commitment*. Fusion is also unwanted: people deliberately "shift back and forth between attending to the properties of the representation and the properties of the thing represented."
- **Effects appear where the cause was — needs changing.** The temporal half holds; the spatial half is contradicted by the light-switch sentence and denied in principle ("Screen space often has no natural correlate in physical space"), and enforcing it would destroy the user's scratch channel.
- **No modes — misstates its own source.** Raskin's rule is relative to a *specific gesture* and conditional on the state not being the locus of attention; he advocates quasimodes, and Beaudouin-Lafon prices a mode as the cheaper arm of a trade-off. Defensible version: **no mode whose state sits outside the locus of attention.** Modes do carry a number: Gong's CAD redesign, confirmed at ~40% faster use and ~46% faster learning.
- **Cost proportional to cognitive weight — contradicted.** Cost tracks the critical path, habituation, and representation-building; and "if the interface is really invisible, then the difficulties within the task domain get transferred directly into difficulties for the user." Some cost is irreducible because other people exist.
- **The software knows which chain the person is in — ill-posed.** "the activity itself is the context," and "Context is not an outer container or shell inside of which people behave in certain ways." The motive is not observable at the interface, and 42% of measured foraging fitted no pattern. John & Kieras warn that anticipating user needs "is likely to result in active systems," the case their methods handle worst, and the core model already records that inference-driven relocation loses (§7.2). The survivable form is *the software lets the person declare which chain they are in.*
- **Missing property: the person can cheaply restructure the workspace.** Enrichment was the largest or second-largest measured family of professional behaviour.

**One caution about H5 as a whole.** Ernestine is the case where a design improving many local properties lost overall, because the estimate rested on "the greater speed of the new features considered in isolation." Any property list evaluated feature-locally will mislead.

---

## 9. Outside the model

Costs, moves and states found in the sources that the model has no word for.

1. **Enrichment** — restructuring the environment so later moves are cheaper. A major measured share of professional time; absent from H2.
2. **Action versus operation, and the collapse/unfold cycle.** The same move has two costs.
3. **Graded frustration** — a blocked operation, goal and motive behave differently.
4. **Expected versus actual cost** — the Value Estimation Problem.
5. **Cb and Cw as separate terms**, each separately measurable.
6. **Disjoint topologies** — goal formed in one navigable graph, satisfiable only in another.
7. **The critical path.** The model has no concurrency.
8. **Transparency, and the artefact becoming the object.**
9. **Semantic distance**, **representational fit**, **modality competition**.
10. **Coordination effort, priced at both ends of a handoff**, with translation loss.
11. **Activation cost (spatial versus temporal)**, **integration**, **compatibility**.
12. **Second-class objects**, and objects the schema omits because it encodes someone else's activity.
13. **Representation-building, representational shift, residue**; and setup cost as an *investment* the model cannot tell from a tax.
14. **Redundancy and division of labour as cognitive mechanisms**, not overhead.
15. **Contradictions as the engine**, and **history**.
16. **Opportunistic use of unspecified structure.** The salmon bug's width "is not actually spelled out in the specifications," yet pilots use it as a ten-knot ruler; tightening every move to its intended semantics removes that slack.
17. **Staying too long** — no word for a crossing that should have happened sooner.
18. **Six cognitive dimensions** (secondary source): **viscosity** — "How much effort is required to make a change?"; **hidden dependencies** — "Are dependencies between entities in the notation visible or hidden?", H3's ripple in its *invisible* form, the form that hurts; **premature commitment**; juxtaposability; progressive evaluation; abstraction gradient.
19. **Asymmetry between people and tools.** "an artifact cannot know anything."

---

## 10. Still unknown

**Retrievals outstanding, highest value first.** The keystroke-level model's prediction-accuracy figure (CACM 1980, 403). Card, Moran & Newell 1983 for the unit task and the ~10-second boundary; an Archive.org OCR was located (`psychologyofhuma00stua_djvu.txt`) but not retrieved. Shneiderman 1983. Pirolli & Card 1999, currently cited through a 2017 rendering. Raskin pp. 37–58, to settle the p. 42 wording and what he says about monotony and habituated actions — **no verbatim source was found for "habituated actions must not be interrupted" as stated**. Bederson's published text. Engeström in his own words. The Ernestine primary text, which holds the subject count and benchmark set behind the 0.63/0.65 figures. Collins 1995, OVID and OOUX, for H1's causal clause — which **remains an assertion**: nobody confirmed that screen-per-object-type came from the object-action tradition, and Beaudouin-Lafon's complaint was the opposite. Unverified leads: arXiv 2502.15095, 2005.13477, 2005.13950; Ko et al. 2006, quoted here only via FSE 2016.

**Open questions fetching alone will not answer.**

1. **Has degree of indirection ever been empirically validated?** Not in the 2000 paper. Whether the later line (AVI 2000; VIGO, CHI 2009; generative theories of interaction, TOCHI 2021; computational substrates) validated the three degrees or kept them analytic was not determined. If the answer is "never, in twenty-six years," H4 needs a different basis however appealing it is.
2. **Do the software-engineering foraging numbers transfer to B2B work?** Every number in §6 comes from professional programmers debugging code, in samples of nine and ten, on tasks nobody finished. Whether Cb 25.7% / Cw 13.4%, "50% of time foraging," and the 51%/37% prediction failures hold for an AP clerk or a support agent is unknown, and it is the single most valuable study this research could commission.
3. **Which replacement cost term actually predicts?** Cb share, critical path, activation cost × switch frequency, representational fit, coordination effort, transparency. None has been compared against the others on one task.
4. **What is the action/operation split in real B2B chains,** and how many steps get demoted per release? Nobody has measured it — and Nardi's warning says interviews cannot, because asking converts operations into actions.
5. **What is in the 42%?** The unpatterned remainder of measured foraging is where a shape taxonomy grows or fails. The domain audits (memos 22–25) are the place to find out.
6. **How much of B2B chain cost is representation-building or enrichment?** Large in the studies above, unmeasured for B2B software.
7. **Whose object does the schema encode?** Bødker's finding suggests this predicts chain damage better than topology does, and it is answerable by audit rather than experiment.

---

## 11. Bibliography

**Read in full, peer-reviewed.**

- Beaudouin-Lafon, M. (2000). "Instrumental Interaction." *CHI 2000*. https://www.lri.fr/~mbl/Stanford/CS477/papers/InstrumentalInteraction-CHI2000.pdf
- John, B. E. & Kieras, D. E. (1996). "Using GOMS for User Interface Design and Evaluation: Which Technique?" *TOCHI* 3(4), 287–319. https://people.eecs.berkeley.edu/~jfc/hcc/courseSP05/lecs/Cognitive%20Models/p287-john.pdf
- Hutchins, E. L., Hollan, J. D. & Norman, D. A. (1985). "Direct Manipulation Interfaces." *HCI* 1, 311–338. https://vis.csail.mit.edu/classes/6.859/readings/pdfs/Hutchins-DirectManipulationInterfaces.pdf
- Hutchins, E. (1995). "How a Cockpit Remembers Its Speeds." *Cognitive Science* 19(3), 265–288. Author manuscript: https://pages.ucsd.edu/~johnson/COGS102B/Hutchins95.pdf
- Hollan, J., Hutchins, E. & Kirsh, D. (2000). "Distributed Cognition." *TOCHI* 7(2), 174–196. Author final revision: https://hci.ucsd.edu/hollan/Pubs/tochi-revised.pdf
- Lawrance, J. et al. (2013). "How Programmers Debug, Revisited." *IEEE TSE* 39(2), 197–215. https://web.engr.oregonstate.edu/~burnett/Reprints/TSE-IFT-2013-asprinted.pdf
- Piorkowski, D. et al. (2013). "The Whats and Hows of Programmers' Foraging Diets." *CHI 2013*. https://ir.library.oregonstate.edu/downloads/v692t7380
- Piorkowski, D. et al. (2016). "Foraging and Navigations, Fundamentally." *FSE 2016*. https://web.engr.oregonstate.edu/~burnett/Reprints/fse16-valueAndCosts.pdf
- Jin, X., Niu, N. & Wagner, M. (2017). *IEEE VL/HCC 2017*. https://homepages.uc.edu/~niunn/papers/VLHCC17.pdf
- Bannon, L. & Bødker, S. (1997). "Constructing Common Information Spaces." *ECSCW 1997*. https://tidsskrift.dk/daimipb/article/download/6552/5671
- Russell, D. M., Stefik, M. J., Pirolli, P. & Card, S. K. (1993). "The Cost Structure of Sensemaking." *INTERCHI '93*; long version: https://www.markstefik.com/wp-content/uploads/2014/04/1993-Sensemaking-long-Stefik-Russell.pdf

**Read in full, academic-press chapters and conference papers.**

- Kuutti (ch. 2); Kaptelinin (chs. 3, 5); Nardi (ch. 4); Bødker (ch. 7) — in Nardi (ed.), *Context and Consciousness*, MIT Press, 1996. https://ics.uci.edu/~corps/phaseii/nardi-ch2.pdf (and ch3, ch4, ch5, ch7 at the same path)
- Hutchins, E. (2006). "The Distributed Cognition Perspective on Human Interaction," ch. 14. https://pages.ucsd.edu/~ehutchins/integratedCogSci/DCOG-Interaction.pdf
- Pirolli, P. & Card, S. (2005). "The Sensemaking Process and Leverage Points for Analyst Technology." No controlled measurement. https://andymatuschak.org/files/papers/

**Quoted via a secondary source.**

- Raskin, J. (2000). *The Humane Interface*. Addison-Wesley. p. 42 via https://en.wikipedia.org/wiki/Mode_(user_interface) — wording unverified. Contents: https://www.gbv.de/dms/tib-ub-hannover/662790855.pdf
- Green, T. R. G. & Petre, M. (1996). *JVLC* 7(2), 131–174, via https://en.wikipedia.org/wiki/Cognitive_dimensions_of_notations
- Gray, W. D., John, B. E. & Atwood, M. E. (1993). "Project Ernestine." *HCI* 8(3), 237–309. Figures via John & Kieras §3.3.
- Schmidt, K. & Bannon, L. (1992). *CSCW* 1(1–2), 7–40. Abstract only: https://dl.eusset.eu/items/758b32cf-a6bf-4afb-b6e9-31816274f751

**Not reached; no claims made on their behalf.** Card, Moran & Newell (1983; 1980 *CACM* 23(7)); John & Kieras (1996) *TOCHI* 3(4), 320–351; Shneiderman (1983) *IEEE Computer* 16(8); Pirolli & Card (1999) *Psychological Review* 106(4), closed access; Pirolli (2007); Bederson (2004) *Ubiquity* 5(27); Hutchins (1995) *Cognition in the Wild*; Kaptelinin & Nardi (2006); Bødker (1991); Engeström (1987; 2001); Collins (1995); Roberts et al. (1998); Prater, OOUX; Star & Strauss (1999); Ko et al. (2006); Beaudouin-Lafon & Mackay (2000); Klokmose & Beaudouin-Lafon (2009); Beaudouin-Lafon, Bødker & Mackay (2021).

**Cross-references.** [02-cognitive-science.md](02-cognitive-science.md); [00-core-model.md](../00-core-model.md) §§1–3 and §7.2.
