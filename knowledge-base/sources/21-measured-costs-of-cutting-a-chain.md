# 21. Measured Costs of Cutting a Chain

*All sources fetched 17–18 September 2026. Where a paper could not be retrieved in full, the memo says so and ranks the claim lower. Studies already in [02 Cognitive science](02-cognitive-science.md) or [11 What changed, 2018–2026](../11-what-changed-2018-2026.md) are marked, and only what is new is reported. Tiers: 1 = peer-reviewed, 2 = industry research with published numbers, 3 = practitioner account.*

What does it cost, measured, when software makes a person leave the place they are working to reach the next step of one thought? The literature never says "chain." It measures the switch, the resumption, the limit on what crosses a boundary, split attention, delay, re-finding, multiple views, and whether motion between views preserves orientation.

One warning about arithmetic. **Nothing cited here measures a chain.** The unit is the trial, the task, the switch or the logged event. Multiplying a switch cost by a switch count is the obvious way to price a chain, and no source supports it. What the evidence does support: a boundary cost is not small, not constant, and is paid in memory, orientation and re-finding rather than in clicks.

---

## 1. The switch itself

**Rubinstein, Meyer and Evans (2001), tier 1**, *JEP: Human Perception and Performance* 27(4), 763–797; fetched in full from APA's journal-release copy. Four experiments, University of Michigan undergraduates (12, 36, 36, 24), alternating between classification rules for geometric objects or between arithmetic operations. Switching-time costs: **975 ms** (SE 71) for pattern classification, **653 ms** (SE 140) and **614 ms** (SE 237) for arithmetic, **1,096 ms** (SE 42) in Experiment 4.

Three features matter more than the size. Complexity multiplies the switch — rule complexity added a "mean difference = 823 ms, SE = 128 ms." A cue at the boundary buys much of it back: costs were "reliably lower" with task cues, "mean difference = 467 ms." And direction is asymmetric: "rule activation takes more time for switching from familiar to unfamiliar tasks than for switching in the opposite direction." (There is no "percentage of productive time" figure in it; the circulating "up to 40%" is APA press framing, unfetchable here.)

**Monsell (2003), tier 1, abstract only** (*Trends in Cognitive Sciences* 7(3); paywalled, abstract via Europe PMC): a switch cost "is **reduced, but not eliminated, by an opportunity for preparation**…" Pashler's review agrees: "advance reconfiguration is almost always incomplete." **Design buys back the preparable part of a switch and not the rest.**

**For one hop**, the floor is a task-set rebuild on arrival and again on return, scaling with how different the two screens' rules are, not how far apart they sit. **For one lap**, a stable screen is a repetitive-task block; alternating between two screens is the condition that produced 975 and 1,096 ms. **For one detour**, familiar-to-unfamiliar is both the expensive direction and the direction detours take.

---

## 2. Interruption and resumption

**Mark, Gonzalez and Harris (2005), tier 1**, CHI 2005 (full text 403; abstract verbatim via OpenAlex): "detailed observation of **24 information workers**… **57% of their working spheres are interrupted**… Though most interrupted work is resumed on the same day, **more than two intervening activities occur before it is**." Its unit — a *working sphere*, a bundle of related work with one purpose — is close to what this research calls a chain, and in the field a detour's return path has two or more other things in it. The familiar "23 minutes 15 seconds" belongs to a later Mark paper and is unverified here.

**Altmann and Trafton, tier 1.** The 2002 memory-for-goals model (*Cognitive Science* 26; abstract only, Wiley 403) analyses goals through "activation and associative priming," including "the priming constraint, which makes predictions about the role of cues in retrieving pending goals." The measurement is in the 2007 companion (*Psychonomic Bulletin & Review* 14(6); abstract via Europe PMC): "sampling over **13,000 interruptions**… Response times dropped in a smooth curvilinear pattern for the **first 10 responses (15 sec or so)** of postinterruption performance." That is the most precise available price of a resumption — a curve, not a pause. Monk, Trafton and Boehm-Davis (*JEP: Applied* 14(3), 2008) add that "longer and more demanding interruptions led to longer resumption times."

**Bailey and Konstan, tier 1, partial.** The 2006 *Computers in Human Behavior* paper is paywalled with its abstract elided by every aggregator tried, so **its percentage figures are unverified here**. Their 2001 INTERACT study (**50 subjects**), fetched via OpenAlex, found that "the degree of disruption **depends on the user's mental load at the point of interruption**." The cost of a boundary is not a property of the boundary; it is a property of where in the chain the person was standing. **Iqbal and Horvitz (2007)** is abstract-only here — it describes its logging method but gives no numbers, so its field figures are **not verified**.

**For one detour**: the sub-chain, plus about fifteen seconds of degraded performance on return, plus two or more intervening activities, rising with the parent chain's difficulty and the sub-chain's duration. The one intervention with measured support is a cue at the point of return — the priming constraint and Rubinstein's 467 ms cueing effect are the same finding from two directions.

---

## 3. What the chain can carry across a boundary

Cowan (2001) is already in the knowledge base. Two additions.

**Miller (1956), tier 1**, *Psychological Review* 63, fetched from psychclassics.yorku.ca. His caveats are stronger than his reputation: he closes on the number itself, "I suspect that it is only a pernicious, Pythagorean coincidence." What survives is chunking, not counting — "The span of immediate memory seems to be almost independent of the number of bits per chunk." **What crosses a boundary is chunks**, and a chunk is large only if the person already holds the schema — which is why an expert carries a whole invoice across a hop and a novice cannot carry three fields. **Cowan (2010), tier 1** narrows rather than widens his earlier estimate: "a central memory store limited to **3 to 5 meaningful items** in young adults."

**Plumlee and Ware (2006), tier 1**, *ACM TOCHI* 13(2) (paywalled; abstract verbatim via OpenAlex) is the only study found that measures a boundary's carrying capacity directly, with an eye tracker, comparing zooming against multiple windows on a multiscale pattern-matching task: "The results closely matched predictions in task performance times; however **error rates were much higher with zooming than with multiple windows**… The results suggest that **only a single graphical object was held in visual working memory**"

People hold one item and look again rather than memorise both; force a transition and they must hold more, and the errors appear. **Making a hop cheap in time does not make it cheap in memory.**

---

## 4. Split attention: two places, one thought

Sweller's cognitive load theory is already in the knowledge base as a general argument. The specific effect has a stronger measured basis than the theory around it.

**Chandler and Sweller (1991), tier 1**, *Cognition and Instruction* 8(4) (abstract verbatim via OpenAlex). Six experiments in electrical engineering and biology materials, one an industrial training setting over three months: "learners unnecessarily are required to mentally integrate disparate sources of mutually referring information such as separate text and diagrams… **Results favored integrated instructions throughout the 3-month study.**"

Two of the six qualify it in ways that matter more than the main effect. Experiment 2: integration was "**no better** than split-source information in areas in which it was **not essential** for sources of information to be integrated to be understood." Experiment 6: "the need for physical integration was restored if the material was organized in such a manner that **individual units could not be understood alone**."

**Separating two things costs in proportion to whether either can be understood alone.** Two objects that must be read together to make one decision are expensive to separate at any distance; two that are merely both relevant are not.

---

## 5. Latency: the wait inside the hop

**Nielsen, tier 3**, 1 January 1993: "**0.1 second** is about the limit for having the user feel that the system is reacting instantaneously"; "**1.0 second** is about the limit for the user's flow of thought to stay uninterrupted"; "**10 seconds** is about the limit for keeping the user's attention focused on the dialogue."

**Card, Robertson and Mackinlay, tier 1**, *CACM* 36(4), April 1993, is the primary statement of "three sorts of time constants… perceptual processing (0.1 second), immediate response (1 second), and unit task (10 seconds)." Two details vanish in secondary citation. The unit-task constant has a **stated band** — "about 10 seconds (say, **5 to 30 seconds**)." And the 1-second constant is about conversational turn-taking, not rendering, with orientation the reason for a one-second animation: "If the time were much shorter, then the user would lose object constancy and would have to reorient himself."

**Attig, Rauh, Franke and Krems, tier 1**, reviewing latency guidelines, note that the early ones "were not based on systematic empirical investigations" and that "**Miller urged the need for empirical validation of his guidelines**" — validation never done. Miller (1968) could not be fetched.

**Google, tier 2 — the only true experiment in the set.** Brutlag, "Speed Matters for Google Web Search," 22–23 June 2009: server-side delay injected into live search traffic against a control group. "Increasing web search latency 100 to 400 ms reduces the daily number of searches per user by 0.2% to 0.6%." No measurable effect at 50 ms; −0.20% at 100 ms; −0.29% at 200 ms; −0.59% at 400 ms. Two findings nothing else here can match. The effect **grows with exposure** — "−0.74%" for the 400 ms delay in the second half of six weeks against "−0.44%" in the first — and it **outlives the cause**: daily searches were "still **−0.21%** relative to the control" averaged over the five weeks after the delay was removed.

**Akamai (2017) and Deloitte (2020), tier 2, correlational.** Akamai, from about **10 billion user visits** in one month of top-retailer data: "A 100-millisecond delay in website load time can hurt conversion rates by **7 percent**" and a two-second delay "increase bounce rates by **103 percent**." Deloitte Digital's *Milliseconds Make Millions* (**37 brands**, four weeks of hourly data, 20.5 million retail sessions) found a "0.1s change in load time" alongside conversions up "**8% for retail**… **10% for Travel**" — but its appendix disqualifies it as an experiment: "Fluctuations in speed all occurred naturally."

Two circulating numbers should be demoted. Mayer's "half a second delay caused a 20% drop in traffic" is a blogger's 2006 recap of a talk in which the delay was confounded with showing 10 results versus 30; Amazon's "100 ms = 1% of sales" does not appear in its source at all. And the "123% bounce increase from 1 s to 10 s" is Google's **January 2018** crawl model, not the 2017 SOASTA study (113%, 1 s to 7 s) — and SOASTA supplied Akamai's data too, so those are not independent.

**The hole.** Every quantified latency cost above is a consumer funnel where the user can leave. **No study was found measuring latency cost in enterprise or B2B software**, where the user is captive: the cost cannot appear as conversion, so it must appear as errors, abandoned chains or workarounds — unmeasured. What transfers is the mechanism: past ten seconds the person reorients on return, which converts a hop into a resumption.

---

## 6. Navigation and re-finding

The knowledge base already carries the hidden-navigation and adaptive-menu numbers. This section adds the measured value of a **stable location** and the cost of re-finding.

**Scarr, Cockburn, Gutwin and Bunt (2012), tier 1**, CHI 2012, fetched in full from the author's copy. Study 1, **12 participants** clicking on a *blank* Word ribbon from memory: clicks fell a median 92 pixels from the correct command, and "50% of commands… were known to within 100 pixels." Yet the average was **1.95 selections** to reach one. Conclusion: "users have a good memory for the spatial location of commands, but… their memory for the parent item containing commands is relatively weak."

This is the cleanest evidence in the literature that **the cost of a boundary is not distance but hierarchy**. Study 2, **18 knowledgeable participants**: "commandmap (1.57 s, s.d. 0.4), followed by ribbon (2.11 s, s.d. 0.8) and menu (2.40 s, s.d. 0.4)… faster than ribbon (by **25%**) and menu (by **34%**)," with "the error rate with CMs… **one-tenth** of the other interfaces" (0.6% against 5% and 9%). The diagnosis: "even when users know the ultimate location of their targets… they need to mechanically navigate the command hierarchy… Furthermore, **each hierarchical level constitutes an interaction mode**, introducing the risk of mode errors." Among novices, Study 3 found no penalty for the flat layout at all.

**Cockburn, Gutwin and Alexander (2006), tier 1**, CHI 2006, fetched in full, isolates knowing-where from having-to-look by repeating each navigation task immediately. **N=13**: "'spatial' tasks (mean 5.7 seconds) being completed more quickly than 'visual' tasks (mean 9.0): F1,12=132.6, p<.01." **Knowing where a thing is is worth about a 37% time reduction on the same task.**

**Teevan, Adar, Jones and Potts (2007), tier 1**, SIGIR 2007, fetched in full, prices re-finding and its destruction. "A one-year Web query log of **114 anonymous users**" plus a survey of **119 volunteers** showed "as many as **40% of all queries are re-finding queries**." Moving the thing is expensive: time-to-click was **94 s mean / 6 s median when rank had not changed, against 192 s / 26 s when it had**, and "88% percent of the clicks… were repeat clicks if there was no change in rank, while only **53%**" when it changed.

**Katz and Byrne (2003), tier 1**, *ACM TOCHI* 10(3), fetched in full, prices scent. Study 2, **32 participants**, 16 purpose-built retail sites, 2×2 breadth × scent: "Given broad, high-scent menus, participants searched less than 10% of the time, but they searched almost **40%** of the time when faced with narrow, low-scent menus" — breadth mattering more than scent. Study 1 (20 participants, 20 real sites) adds a wrong-path rate: "the mean number of attempts per item being **1.75**."

---

## 7. Multiple coordinated views

**Baldonado, Woodruff and Kuchinsky (2000), tier 1, abstract only.** AVI 2000; no open copy found. Its "**eight guidelines**" — including the Rule of Parsimony, usually quoted as "use multiple views minimally" — **could not be fetched verbatim and are not quoted here**. The abstract says they come from "a workshop discussion… and our own design and implementation experience": the most-cited source on the cost of multiple views measured nothing.

**Ondov, Jardine, Elmqvist and Franconeri (2018), tier 1**, *IEEE TVCG* 25(1), retrieved in full. Four crowdsourced experiments, 50 participants each (**200 US adults**), five comparison layouts. On the hardest bar-chart task: "accuracy was low for stacked (**57%**), adjacent (**61%**), and mirrored (**64%**) arrangements… for animated arrangements, accuracy was **74.6%**." Splitting one comparison into juxtaposed panels cost thirteen to eighteen accuracy points against showing the change in one place — though the ranking reverses by chart type, and for correlation "there was no benefit of animation."

**Oh and colleagues (2022), tier 1**, arXiv 2204.09524, retrieved in full: between-subjects, **44 participants**, five analytic problems. Against the parsimony rule, "we discovered the positive correlation between the number of views and analytic results" — insights **r = 0.67, p < 0.001**, and task time per view r = −0.66. The counterweight, from Cockburn's 2009 review: some tasks are "faster without the overview due to cost of assimilating data."

For a **fork**, keeping B and C visible beats visiting them: the cost is not the second view but assimilating one the current move does not need.

---

## 8. Animated transitions and orientation

**Chang and Ungar (1993), tier 3 by evidence type.** UIST 1993, retrieved in full: **the paper contains no measurement**, but it gives the clearest account of why a hard cut costs something. Without animation "the eye is presented with the short-lived image of two objects… The solidity, and even the very identity of the object breaks down."

**Heer and Robertson (2007), tier 1**, *IEEE TVCG* 13(6), retrieved in full. **24 subjects**, aged 26 to 62, "from professions requiring the use of data graphics," across two experiments of 288 and 144 trials. "Animation improved graphical perception at both syntactic (object tracking) and semantic (change estimation) levels of analysis" (F(2,286) >= 22.03, p < 0.001). Where it failed: no significant benefit for stacked bars (p = 0.224), and "heavily staged animation resulted in increased error."

**Bederson and Boltman (1999), tier 1**, InfoVis 1999, retrieved in full. **20 subjects** navigating a family tree, then reconstructing it from memory. Reconstruction errors **0.4 with animation against 1.8 without** unweighted, **0.4 against 3.35** weighted; reconstruction time 37.8 s against 50.9 s; navigation time unchanged (18.6 s against 18.9 s per question). "Animation improves users' ability to reconstruct the information space, with no penalty on task performance time." But there was no significant difference "in any of the other tasks or subjective satisfaction," and the benefit was partly order-dependent.

**Cockburn's review is the honest summary** (2009): "**While animation aids comprehension, there is no evidence that it also aids task performance time.**" The one time effect anyone found is Klein and Bederson's (CHI 2005, N=20): animated scrolling improved task time "by up to **5.3%**" and cut reading errors "by up to **54%**."

**Two negative results matter most.** Chevalier, Dragicevic and Franconeri (*IEEE TVCG* 2014; two experiments of 20 participants, 2,560 and 1,600 trials; retrieved in full) found that "introducing staggering has a **negligible, or even negative, impact** on multiple object tracking performance" — after deliberately selecting "the 0.01% most favorable cases." Their dissociation is the finding to carry: staggering "that is not beneficial for visual tracking, can **give the illusion of facilitating**." And Robertson and colleagues (InfoVis 2008, abstract via OpenAlex): "**Animation is the least effective form for analysis**; both static depictions of trends are significantly faster than animation." Dragicevic and colleagues (CHI 2011, abstract only) add only that "Slow-in/slow-out outperformed other techniques."

Motion between two states buys **orientation and object identity** — four to eight times fewer errors in reconstructing where things are — and does not buy speed. A hop softened by animation is still a hop: the animation protects the mental map of the space, not the working set.

---

## 9. 2018 to 2026: real products and enterprises

**Murty, Dadlani and Das (2022), tier 2** — the best enterprise number in existence. *Harvard Business Review*, 29 August 2022; HBR's page is paywalled, so figures were fetched from the licensed republication at physicianleaders.org. Method: "**20 teams, totaling 137 users, across three Fortune 500 companies** up to five weeks, for a data set of **3,200 days of work**." Findings: users "toggled between different apps and websites nearly **1,200 times each day**"; "the cost of a switch is little over **two seconds**"; people "spent just under **four hours a week** reorienting themselves after toggling"; "that adds up to five working weeks, or **9% of their annual time at work**."

Two further numbers describe the chain shapes directly: "To execute a single supply-chain transaction, each person involved switched about **350 times between 22 different applications**"; and "after **65% of switches**, users toggled to yet another app **less than 11 seconds later**." Two thirds of switches are the middle of a longer traversal, not an out-and-back. Note the weakness: two seconds is an estimate from log timings, not a measured resumption lag, and an order of magnitude below Altmann and Trafton's fifteen seconds.

**Microsoft (2025), tier 2.** "Breaking down the infinite workday," 17 June 2025: "Employees are interrupted every two minutes during core work hours—**275 times a day**." The data is "aggregated and anonymized Microsoft 365 productivity signals, ending February 15, 2025," for "**the top 20% of users by ping volume received**" — an upper-decile figure, not an average.

**Clinical work, tier 1, where switching is counted properly.** Moy, Cato, Kim, Withall and Rossetti (AMIA 2023) built the measure from event logs for "**63 full-time ED physicians**… (n=**2,068,605 events**)" matched to 952 shifts, finding "event-level (**185.8±75.3/hr**) and within-(**6.6±1.7/chart**) and between-patient chart (**27.5±23.6/hr**) switching per shift worked", framing it as this research does: "Workflow fragmentation, defined as task switching, may be one proxy to quantify… documentation burden."

**Knowledge and engineering work, tier 1.** Mark and colleagues (CSCW 2015; **32 employees** logged and experience-sampled for five days) supply the outcome measure this programme most needs: "the more total screen switches, the less productive people feel" at the day's end. Meyer and colleagues (*IEEE TSE* 2017) instrumented "**20 computers** of professional software developers from four companies for an average of **11 full work day** in situ" and found work "highly fragmented"; their 2019 survey of "**5,971 responses**" named "the importance of **agency**" as the dominant factor in a good workday.

**For one lap**, the enterprise figure is 1,200 switches a day and 9% of the year reorienting. **For one chain**, the supply-chain case — 350 switches across 22 systems for one transaction — is the only published measurement of a whole chain's boundary count, and it is one case inside a tier-2 article.

---

## Testing the working model

### H1. The work is a graph, the software is a tree — holds; one clause needs changing

The consequence is measured even where the claim is not: 350 switches across 22 applications for one transaction is a chain crossing twenty-two trees, and Moy's 27.5 between-patient chart switches an hour is the same thing inside one product.

The clause to change is "every hop across a screen boundary charges a cost **unrelated to the difficulty of the thought**." The evidence says the opposite: Rubinstein's switch cost rose 823 ms with rule complexity, Bailey and Konstan found disruption "depends on the user's mental load at the point of interruption," and Monk and colleagues found resumption time rising with an interruption's duration and demand. Boundary cost is **multiplicative on cognitive weight** — a worse problem than the model states, and a more precise one: **the hardest thoughts pay the largest boundary tax.**

### H2. The moves — holds as a vocabulary, untested, two moves priced

No source enumerates moves this way, so the taxonomy is untested. **Compare** is the best-measured move: Plumlee and Ware show it is limited by what survives between glances, Ondov and colleagues that splitting it across panels costs thirteen to eighteen accuracy points, Oh and colleagues that more simultaneous views produce more insights. **Traverse a relation** is measured only indirectly, as switch cost and resumption lag. The other nine have no cost literature under any name.

### H3. The chain shapes — holds; the lap and detour have numbers, three shapes have none

The hop prices as a switch cost plus a resumption. The lap prices from the enterprise telemetry and from CommandMaps, whose expert-only advantage (25% and 34% faster, one-tenth the errors) is lap-specific. The detour prices from Monk and colleagues as a function of duration and demand, and from Mark's "more than two intervening activities."

One correction from the field: the model calls the hop "A to B and back," but "after 65% of switches, users toggled to yet another app less than 11 seconds later." The dominant real pattern is **a run of boundaries in a row** — a traversal, or a relay.

### H4. Indirection is the cost — holds in spirit, with the terms re-weighted

**Spatial distance is the weakest of Beaudouin-Lafon's three terms.** Scarr's blank-ribbon study is decisive: people knew where commands were to within 92 pixels and still needed 1.95 selections to get there. The cost was the hierarchy and the mode, not the distance. **Temporal distance matters at thresholds, not linearly**: nothing measurable at 50 ms, a growing effect from 100 ms, breaks at 1 s and 10 s, and the 10 s constant really a 5-to-30 s band. **The distance between reason and act is by far the heaviest term**, and split attention gives it an operational form: integration matters precisely when "individual units could not be understood alone."

So H4 restated: indirection is the cost; its dominant component is **whether the thing acted on and the reason for the act must be understood together**, and its second is **how many modes stand between the person and a location they already know**.

### H5. The properties of perfect — two supported, one gains support, two need changing

Supported: *the working set stays visible for the chain* — people prefer to look again rather than remember, and errors appear when they cannot. *A detour returns to the exact point* — the priming constraint and the cueing effect both price a cue at the point of return. *No modes* gains direct support it did not have: "each hierarchical level constitutes an interaction mode, introducing the risk of mode errors," at ten times the error rate of the flat layout.

Needs changing: *effects appear where the cause was*, read as an argument for animated feedback, meets "no evidence that it also aids task performance time," "animation is the least effective form for analysis," and Chevalier's illusion of facilitating — so keep it for orientation (0.4 against 1.8 reconstruction errors) and not for speed. And *cost proportional to cognitive weight* is real but inverted: cost rises with cognitive weight because boundaries punish hard thoughts hardest.

Unmeasurable as stated: *the software knows which chain the person is in*. Nothing here measures a system that knows an intent, and memo 11 already records the best real-log "does this user need help now" detector at precision 0.27.

---

## Outside the model

1. **The cost that grows with exposure.** Google's penalty for 400 ms nearly doubled over six weeks and persisted at −0.21% for five weeks after the delay was removed. That is a per-traversal charge plus a **learned aversion to the path** which outlasts the fix, and no chain shape captures a person quietly abandoning a route.
2. **Preference and performance come apart.** Chevalier's participants rated as easiest the condition they performed worst in. The model has no term for a cut chain that feels fine.
3. **The workaround as the real cost.** Chang and colleagues (CHI 2021; ten information workers, 103 surveyed) found tabs held open under "competing pressures," and about 25% of participants had crashed a browser or machine maintaining them. The cost has migrated into a tool the vendor does not ship and cannot see.
4. **The unused return affordance.** Alexander and Cockburn (Graphics Interface 2008; 14 users instrumented for 120 days) found recent-document lists accounted for **7.1%** of reopenings in Word and **0.26%** in Reader, while about half of all documents opened were reopenings. Software provides a way back; people navigate instead.
5. **Agency.** Meyer's 5,971 Microsoft developers named control over the day — "whether it goes as planned or is disrupted by external factors" — as the dominant factor in a good workday. Who initiated the crossing may matter as much as what it cost.

---

## Still unknown

- **No study measures a chain.** The unit everywhere is a trial, task, switch or event; nobody has run one chain through two products and priced the difference.
- **No latency study exists for captive users.** Every quantified latency cost is a consumer funnel with a bounce option.
- **No enterprise navigation study was found for 2018–2026** outside clinical work: no click-count or task-time evidence for admin consoles, CRMs or IDEs.
- **Unverified here, because they could not be fetched:** Bailey and Konstan's 2006 percentages, Iqbal and Horvitz's field figures, Baldonado's eight guidelines, Schroeder and Cenkci's split-attention effect size, Ehret's location-learning curve, and Miller's 1968 thresholds.
- **The ripple, the chain over time and the handoff have no cost literature** at all.
- **Nobody has measured the cost of returning to the wrong point** — a detour that returns to the screen but not the spot — or priced a boundary as a function of the relation traversed rather than the task switched.

---

## Bibliography

**Tier 1 — peer-reviewed** (abstract-only or unfetched marked)

- Alexander & Cockburn (2008) — https://www.csse.canterbury.ac.nz/~andy/papers/p123-alexander.pdf
- Altmann & Trafton (2002) — https://doi.org/10.1016/s0364-0213(01)00058-1 (abstract only) · (2007) — https://doi.org/10.3758/bf03193094 (abstract only)
- Attig, Rauh, Franke & Krems — https://nickarner.com/cited_papers/System_Latency_Guidelines_Then_and_Now_is_Zero_Latency_Really_Considered_Necessary.pdf
- Bailey & Konstan (2000) — https://doi.org/10.1109/icsmc.2000.885940 · (2001) INTERACT (abstract only) · (2006) — https://doi.org/10.1016/j.chb.2005.12.009 (not fetched)
- Baldonado, Woodruff & Kuchinsky (2000) — https://doi.org/10.1145/345513.345271 (abstract only)
- Bederson & Boltman (1999) — https://www.cs.umd.edu/projects/hcil/jazz/learn/papers/CS-TR-3964.pdf
- Card, Robertson & Mackinlay (1991/1993) — https://aspoerri.comminfo.rutgers.edu/Teaching/InfoVisResources/papers/InfoVisualizer.pdf
- Chandler & Sweller (1991) — https://doi.org/10.1207/s1532690xci0804_2
- Chang & Ungar (1993) — https://faculty.washington.edu/aragon/classes/hcde411/w13/readings/Chang_AnimationInUI_UIST93.pdf
- Chang et al. (2021) — https://doi.org/10.1145/3411764.3445585 (abstract only)
- Chevalier, Dragicevic & Franconeri (2014) — http://www.cs.toronto.edu/~fchevali/fannydotnet/resources_pub/pdf/notsostaggering-infovis14.pdf
- Cockburn, Gutwin & Alexander (2006) — https://www.csse.canterbury.ac.nz/~andy/papers/chi-sft.pdf
- Cockburn, Karlson & Bederson (2009) — https://www.csse.canterbury.ac.nz/andrew.cockburn/papers/fc.pdf
- Cowan (2010) — https://doi.org/10.1177/0963721409359277
- Dragicevic et al. (2011) — https://doi.org/10.1145/1978942.1979233 (abstract only)
- Heer & Robertson (2007) — https://idl.cs.washington.edu/files/2007-AnimatedTransitions-InfoVis.pdf
- Iqbal & Horvitz (2007) — https://doi.org/10.1145/1240624.1240730 (abstract only)
- Katz & Byrne (2003) — http://chil.rice.edu/research/pdf/KatzByrne03.pdf
- Klein & Bederson (2005) — http://www.cs.umd.edu/~bederson/images/pubs_pdfs/p1965-klein.pdf
- Mark, Gonzalez & Harris (2005) — https://doi.org/10.1145/1054972.1055017 (abstract only) · Mark et al. (2015) — https://doi.org/10.1145/2675133.2675221
- Meyer et al. (2017) — https://doi.org/10.1109/tse.2017.2656886 · (2019) — https://doi.org/10.1109/tse.2019.2904957
- Miller (1956) — https://psychclassics.yorku.ca/Miller/
- Monk, Trafton & Boehm-Davis (2008) — https://doi.org/10.1037/a0014402
- Monsell (2003) — https://doi.org/10.1016/s1364-6613(03)00028-7 (abstract only) · Pashler (2000) (abstract only)
- Moy et al. (2023), AMIA Annual Symposium Proceedings
- Oh et al. (2022) — https://arxiv.org/pdf/2204.09524
- Ondov, Jardine, Elmqvist & Franconeri (2018) — https://www.cs.au.dk/~elm/pdf/face2face.pdf
- Plumlee & Ware (2006) — https://doi.org/10.1145/1165734.1165736 (abstract only)
- Robertson et al. (2008) — https://doi.org/10.1109/tvcg.2008.125 (abstract only)
- Rubinstein, Meyer & Evans (2001) — https://www.apa.org/pubs/journals/releases/xhp274763.pdf
- Scarr, Cockburn, Gutwin & Bunt (2012) — https://www.csse.canterbury.ac.nz/~andy/papers/commandMap-finalCamera.pdf
- Schroeder & Cenkci (2018) — https://doi.org/10.1007/s10648-018-9435-9 (not fetched)
- Teevan, Adar, Jones & Potts (2007) — https://www.cond.org/sigir07.pdf

**Tier 2 — industry research**

- Akamai (2017) — https://www.prnewswire.com/news-releases/akamai-online-retail-performance-report-milliseconds-are-critical-300441498.html
- Brutlag (2009) — https://research.google/blog/speed-matters/ · https://services.google.com/fh/files/blogs/google_delayexp.pdf
- Deloitte Digital & Fifty-Five (2020) — https://web.dev/case-studies/milliseconds-make-millions
- Google (2018) — https://business.google.com/ca-en/think/marketing-strategies/mobile-page-speed-new-industry-benchmarks/
- Microsoft WorkLab (2025) — https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday
- Murty, Dadlani & Das (2022), *HBR* — https://hbr.org/2022/08/how-much-time-and-energy-do-we-waste-toggling-between-applications (paywalled; figures from https://www.physicianleaders.org/articles/how-much-time-and-energy-do-we-waste-toggling-between-applications)

**Tier 3 — practitioner**

- Carnegie Mellon University (2021) — https://www.cmu.edu/news/stories/archives/2021/may/overcoming-tab-overload.html
- Linden (2006) — http://glinden.blogspot.com/2006/11/marissa-mayer-at-web-20.html
- Nielsen (1993) — https://www.nngroup.com/articles/response-times-3-important-limits/
