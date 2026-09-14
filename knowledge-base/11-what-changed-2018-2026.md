# What Changed, 2018–2026

*Eight research sweeps were run in September 2026 against the eight rules and the gated-features pattern, looking only at evidence published from 2018 onwards. This chapter says what that evidence did to each rule. The sweeps are memos [08](sources/08-sweep-adaptation-llm-era.md) to [15](sources/15-sweep-enterprise-field-studies.md).*

The short version. No rule was overturned. Two mechanisms named inside rules were: the tooltip as a teaching device, and the assumption that showing someone a decision is enough to make them review it. Several numbers we quoted were wrong and are corrected here and in the files. And the most useful new evidence is not about what to hide. It is about *when* to offer something, and about the difference between a thing being visible and a thing being reviewed.

---

## The verdict table

| Rule | Verdict | What moved it |
|---|---|---|
| 1. Hide the rare | Confirmed, numbers corrected | Pendo 2019 misquoted; 6.4% is a median, best-in-class 15.6% |
| 2. Stop at two levels | Confirmed, cost worse than clicks | An extra level makes users abandon navigation for search |
| 3. Split by frequency, not skill | Confirmed, one mode licensed | Density is a view setting, not a skill claim |
| 4. Obvious, honest door | Confirmed, two costs priced | A bad label costs 10.8 hours, not a click |
| 5. Keep context | Confirmed, extended to dense screens | Locality matters with or without a door |
| 6. Stable, user-controlled | Confirmed, justification re-based | Spatial adaptation loses at any accuracy |
| 7. Decision-critical stays visible | Confirmed, extended twice | Hiding a charge doubles acceptance with no complaints; disclosure beyond review capacity equals hiding |
| 8. Fade the scaffold | Refined hardest, one mechanism overturned | Tooltips do not teach; temporary full exposure does |

---

## Rule 1. Hide the rare, never the necessary

**Confirmed. The evidence behind it needed repair.**

Sweep 15 fetched the primary Pendo documents and found our citation wrong. The 2019 Feature Adoption Report studied **615 Pendo subscriptions** over three months, not 180 million users across 35,000 applications. Its distribution is **12% frequent, 8% moderate, 24% rare, 56% never used**, not 12/15/73; the "15%" we carried was a share of *usage volume*, not of features.

A caveat matters more than the numbers. Pendo says plainly that "a feature in Pendo is delineated by a 'tag'." The denominator is a set of things a product manager chose to instrument because they expected them to be used. McGrenere and Moore counted all 265 first-level functions in Word 97. Not the same measurement, and they should stop being presented as one line of evidence. If anything the tag-based denominator means the real tail is longer than 80%.

The 2024 figure is correct but incomplete. **6.4% is the median; best-in-class is 15.6%**, two and a half times wider. Pendo's own product sits at 20%, 17 of 85 features. A product at 15.6% is not doing worse disclosure than one at 6.4%; it may simply have fewer, better-chosen features. So 6% is the shape of a bloated product, not a target.

Three things changed the test under this rule.

**Route by the job, not the title.** Airtable's 2023 onboarding experiment asked new users their function and seeded role-matched templates. Iteration one: **+15% onboarding completion, −10% sharing and collaboration**. A persona-shaped first session optimised a single-player metric and suppressed the behaviour the product depends on. Re-cut around multi-player use cases, iteration two got **+15% completion with +10% activation**, regression gone. It is the only controlled template experiment in public, and it says the split at set-up follows the job to be done, not the job title.

**Navigation analytics under-report.** GitLab's diary studies found that for some users "many of their primary tasks don't require much navigation within GitLab because they use outside tools that link into GitLab." Slack notifications, bookmarks, browser history. "Nobody clicks it in the menu" is not evidence that nobody uses it.

**The weekly-use test needs a second question.** Khairat and colleagues eye-tracked 81 ICU providers across four medical centres (JAMIA 2026). Complex cases produced significantly more eye fixations and longer completion times but **fewer mouse clicks per minute**, with no change in screens viewed. The expensive part was reading and searching, not clicking, so a product that counts only clicks under-measures the cost of density and over-measures the cost of disclosure. Alongside "what share of users touch this weekly", ask **"what share of the people who touch it at all touch it daily"**. A command used by 4% of users on 100% of their days is a density item, not a door item, and aggregate frequency data will delete it.

---

## Rule 2. Stop at two levels

**Confirmed. The cost is not clicks.**

Baymard found that nesting product categories one level deeper does not merely slow people down; it makes them **abandon the navigation channel entirely** for search, moving traffic to an unmeasured route where success depends on the search engine rather than the information architecture. Thirty-three per cent of mobile sites make this mistake.

For staged disclosure the length effect is now measured. Produktly's 2026 benchmark (464 companies, 256 tours) reports completion by step count: **1–2 steps 73%, 3–5 steps 38%, 6–8 steps 25%, 9 or more 8%**. Their line is right: "Every extra step is a place to leave." The largest published lever on first-session completion is deleting steps, and it dwarfs every personalisation effect in the literature.

WalkMe's telemetry puts the average large enterprise at hundreds of applications in use, so someone who opens your settings page twice a year cannot be expected to remember a third level. No post-2018 study measures the cost of a second or third level in an enterprise product; rule 2 still rests on Nielsen (2006) and Landauer and Nachbar (1985).

---

## Rule 3. Split by task frequency, not user skill

**Confirmed, and one mode is now licensed.**

The most-cited persona-routing case study in the product-led-growth literature is Hotjar's, which routed users into Beginner, Intermediate and Advanced checklists and reported a 26% lift. That lift compares people who answered the question against people who skipped it, not treatment against control, and it uses exactly the audience labels this rule forbids. A method warning, not evidence.

Two new results support the rule from different directions. Microsoft's telemetry study of command-line coding agents across tens of thousands of engineers concluded that "what an engineer does (peer ties, prior tool use, PR cadence) explains who adopts and retains far better than who an engineer is"; skip-level peer exposure raised the odds of trying the tool by 216%. And 25 ICU physicians averaging 32.6 hours a week in the electronic health record asked for one thing: "if I were able to have my own flowsheet that I can customize." That is the 2002 McGrenere, Baecker and Booth result reproduced 23 years later in another profession.

**The exception now added is a density toggle.** Salesforce shipped Comfy and Compact in Winter '19; AWS Cloudscape mandates that comfortable is always the default and that "users can always switch between comfortable and compact mode." A density control asks the user to state nothing about their skill, changes nothing about what exists or where it lives, is one click, persists and is reversible — the profile of the two-interface design that beat adaptive menus. **Density is a legitimate axis for a user-controlled mode; capability is not.**

---

## Rule 4. Make the door obvious and honest

**Confirmed, and two costs are now priced.**

NN/g's 2025 icon research changes one thing. The hamburger is now reliably recognised, and so are the kebab and meatball. But recognition and scent are separable: "users often had little idea what specific options were hidden behind the kebab and meatball icons because they have low information scent, even when recognizable." Stop implying the problem with hidden navigation is recognition; it is the extra step and the loss of scope cues. NN/g's own caveat is that the study "examined recognizability only," so nobody re-measured task time or success. One new failure mode arrived with the recognition: three stacked lines is such a strong signal that other line-based icons in navigation positions get misread as menus, so an icon rail's top-left item inherits a menu meaning whether you intended it or not.

**What a bad label costs.** Autodesk Research pulled 204 questions from Fusion 360 and Word forums and had 28 experts answer them, averaging **57.0 seconds** each. The published baseline for median forum response time is **10.83 hours**. When a user cannot find a control, the fallback costs most of a working day of waiting for an answer an expert gives in under a minute.

**In a multi-tenant product, what is behind the door differs by tenant.** Microsoft Research's study of Excel tutorials found function names, separators and available features vary by locale, version and platform, so every screenshot and help article is wrong for some customers — whose conclusion is not "my tenant differs" but "the feature does not exist." Never write a label whose truth depends on the tenant.

**A door on a repeated path stops being seen.** Vance and colleagues (MIS Quarterly 2018) found adherence to repeated warnings fell sharply within three weeks, with activity in visual processing centres dropping alongside it; *polymorphic* warnings, whose appearance varied between showings, held adherence. Variation in the artefact, not more artefacts.

---

## Rule 5. Keep context across the boundary

**Confirmed, and it now applies to screens with no doors at all.**

The knowledge base had no operational definition of density. It has one from NN/g's content-dispersion study (four prototypes, 13 sessions): dispersed pages carried **fewer than 7 unique elements per screenful with 30% unused space**; condensed pages **8–14 elements with 17% unused space**. Dispersion produced "an increase in cognitive load and interaction cost, difficulty understanding content, and user frustration." Small, qualitative and about marketing pages, but the first measured answer to "how dense is dense."

The control-room study (Afzal et al. 2022, three operators on seven screens each) says the complementary thing: seven screens of everything still cost dearly, because the layout "was not optimal for many tasks" and forced long-distance visual transitions. "Reveal next to the cause" generalises to "put related things near each other," door or no door.

Two refinements to door state. GitLab's 2023 navigation deliberately **overrides the user's own collapse preference** on Global Search, Profile, Help and Settings, because that "exposes important information on these pages that a user may not know exists otherwise" — a defensible exception the rules did not allow for. And pulling has a price: suggestions the user had to request took **101.4 seconds to interpret against 45.4 seconds** for well-timed pushed ones.

---

## Rule 6. Prefer stable, user-controlled disclosure over inferred adaptation

**Confirmed. The justification changes completely.**

The ~70% accuracy threshold has **not been re-tested**. Nothing since 2018 varies an adaptive interface's prediction accuracy and measures where adaptation overtakes a static layout. Gajos et al. (2008) stays, labelled un-replicated.

What replaced it is better. Two independent modern experiments found that **spatial adaptation loses at any accuracy**.

Todi, Bailly, Leiva and Oulasvirta (CHI 2021) ran 18 participants over 6,480 trials against a planner using Monte-Carlo tree search over predictive HCI models. Grand means: **Static 2283 ms, Frequency 2298 ms, MCTS 2162 ms**. Classic frequency reordering — the Office 2000 pattern — was not faster than static in 2021 either, and excluding the top three items it was **15% slower** (2799 ms against 2454 ms). Fifteen of 18 noticed the menus changing; **two** understood why. The only gain came from a policy that adapted rarely and changed *grouping*, not rank, for 121 ms.

Gaspar-Figueiredo, Vanderdonckt, Abrahão and Insfran (JSS 2025) put 40 participants on adaptive and static menus with EEG and found **no significant performance advantage or disadvantage**. In 2004 static was significantly faster; in 2025 it is a tie. Twenty-one years of better modelling moved spatial adaptation from "worse" to "no better." **The reason not to reorder is not that the model is not good enough yet. Relocation costs more than the prediction can repay.**

What survives is in-place adaptation and user control. MAESTRO (UIST 2026, N=33) permits augment, sort, filter and highlight *in place*, never relocate. ReLay (IUI 2026) found participants welcomed adaptive changes "when they demonstrated transparency, consistency, and reversibility," and used the controls "as calibration." GitLab's answer to per-role level-1 surfaces was **user-controlled pinning**, not inference. So reversibility joins visibility as an acceptance condition: **reversible in one action**.

The timing finding is the most useful thing in the sweep set. Suggestions delivered at a task boundary are accepted; identical content mid-task is dismissed. Post-commit interventions got **52% engagement** while interventions on a declined edit were **dismissed 62%** of the time (Kuo et al., 15 professional developers, five days, 229 interventions). Across 398 proactive interventions in a lab study: **53.3% effective engagement, 34.7% ignored, 12.1% disruptions**, with triggers ranging from 73.1% on a multi-line change to 50% ignored on code-block completion (Pu et al., CHI 2025).

Two numbers cap the ambition. A state-of-the-art "does this user need help now" detector on a month of real enterprise logs reached **precision 0.27** — three in four interruptions would be wrong. And adoption is accuracy multiplied by how slow the user's current path already is: across three experiments with 1,207 participants, desktop uptake never exceeded 0.9 suggestions per trial even at 0.9 accuracy. **A competent user on a fast path will ignore a correct suggestion.**

Finally, the settings figure. Spool's "fewer than 5% ever changed a setting" is a **2011 anecdote about consumer Microsoft Word**, and sweep 15 searched Pendo, Userpilot, Amplitude, Mixpanel and WalkMe for a post-2018 replacement and found **no settings-usage benchmark of any tier**. Firefox Proton shows why that matters: Mozilla proposed removing compact density because the setting "is currently fairly hard to discover, and we assume gets low engagement," filed two bugs to find out, and never ran the experiment. Low toggle usage justifies deleting a capability setting, not a density setting, and only when the control was discoverable and the number was measured.

---

## Rule 7. Decision-critical information is never behind a door

**Confirmed, and extended in two directions.**

Luguri and Strahilevitz (*Journal of Legal Analysis*, 2021) ran two census-weighted survey experiments on US adults, n = 1,963 and n = 3,777. Disclosing an automatic monthly charge only in "small gray font at the bottom of the page" took acceptance from **14.8% to 30.1%**. In the first study: control 11.3%, mild dark patterns 25.8%, aggressive 41.9%.

The second half of that paper changes practice. Mild manipulation produced **"no discernable emotional backlash."** Di Geronimo et al. (CHI 2020) found the same across 240 apps and 589 users: people "do not identify these practices when exposed to them." **Satisfaction and complaint data therefore cannot audit a conversion lift**, because the manipulations that work best go unnoticed and draw no complaints. "We A/B tested it and nobody complained" proves nothing.

Two more additions. The FTC's 2022 dark-patterns report names a **tooltip** as the mechanism of a deceptive act in the LendingClub matter — a disclosure control used as a hiding place. And the CMA reports that partitioned pricing led consumers to underestimate the total by about **11%**, worse than drip pricing's 3.2%. Showing every component of a price is not showing the price. An upgrade panel shows **the total for the period, never a breakdown**.

**The new corollary comes from the agent sweep, and it is the most important finding in this chapter.**

Chen et al. (arXiv 2604.04918, N=48, four oversight strategies across six web tasks with a planted problematic action) measured what happens when you show someone a decision and ask them to approve it. Step-by-step confirmation made the problematic action visible **88.5%** of the time and the user stopped it **23.9%** of the time: a **76% pass-through rate on things the user was explicitly shown and asked to approve.** Risk-gated escalation did slightly better on both (90.1% and 26.4%) at a fraction of the interruption cost. "Oversight strategy more clearly shaped users' exposure to problematic actions than their ability to correct them once visible." The mechanism is not inattention: "participants often noticed questionable actions, but treated them as routine, harmless, or not worth interrupting." Under higher stakes people looked harder and acted less — visibility rose to 91.2% while intervention fell to 12.8%.

Three field studies say the same at scale. After a mandate to double AI-assisted output at one B2B company (802 developers, 196,212 pull requests), human review of pull requests fell from **89% to 68%**, substantive review from about 39% to 21%, and silent approvals held flat near 50%. Across 33,596 agent-authored pull requests, **61.38% received no recorded review activity**. Of 364 merged agentic pull requests inspected by hand, **79.1% had no observable feedback loop**.

None of that was behind a door. It was in the diff, in the queue, on the screen. Volume, not depth, was the failure. So rule 7 gains a corollary: **disclosure that exceeds review capacity is functionally equivalent to hiding.** Visible-but-unreviewable is the dominant failure mode of any approval queue, activity log or agent trace.

One consequence for agent pricing: cost is dominated by re-reading context rather than visible output, runs on the same task differ by up to 30×, and models predicting their own spend underestimate it. Price is decision-critical, but an honest *pre-action* price is not possible for agent work today. A running meter and a spend cap are.

---

## Rule 8. Fade the scaffold; give experts accelerators

**Refined hardest. One named mechanism is overturned.**

The knowledge base said the purest form of this rule was "a command palette that shows each shortcut every time." Three 2025 studies say the hint is not what teaches.

- In a controlled text-formatting task, **749 tooltip exposures produced two shortcut activations**; "tooltips may be ineffective for discovering and learning new keyboard shortcuts, as users tend to ignore them" (Harrison, Malacria & Cockburn, IHM 2025).
- In a survey of **853 people**, tooltips explain **1%** of shortcut discovery and only 6% discovered the method themselves, while **28% credited a face-to-face social interaction** (Bailly et al., IHM 2025).
- Across 464 companies, the median in-product tip was opened **once per 1,000 impressions**: "Tooltips are ambient reference, not a delivery channel" (Produktly 2026).

Budget hover hints at approximately zero.

**What teaches is temporary full exposure.** In the same IHM 2025 study, shortcut usage across three ordered stages was **9.79%, then 86.20% with every shortcut exposed, then 73.09% after the exposure was removed**. A tenth to six-sevenths in one session, three-quarters of it surviving removal.

**And spatial feedforward roughly doubles retention.** KeyMap (CHI 2020, 98 participants) showed commands on a picture of the keyboard rather than a list: one more shortcut remembered immediately, and **4.5 more after 24 hours** — median 10 against 5.5. Incidental learning of unpractised commands occurred for 14 participants against 6. A list is what a palette is, and it was the weaker condition. **The palette's inline hint is the floor, not the ceiling.**

The uncomfortable finding sits alongside. Adding visual signifiers to animated transitions had **no effect** on discovery, and still none when transitions were slowed to 5,000 ms to guarantee they were noticed. Only 7 of 33 participants discovered a hidden widget while an easy alternative existed; when the task removed the alternative everyone found it, and **none went back** (Mackamul et al., CHI 2025). The one complete promotion trigger anybody has found is removing the old route, not advertising the new one. Making errors cheap did not work either: an intermediate confirm-and-correct mode took 30% of selections and produced "no evidence of greater switch to memory-based interaction" (Goguey et al. 2019).

An agent that does the work hides the interface more completely than any collapsed panel: guided assistance beat automatic on completion **88.5% against 35%** and on accuracy **82% against 12%** in Google Sheets, with 75% of automatic attempts involving undoing incorrect automation (Khurana et al., CHI 2025).

The delete clause: the **"3–5% removal threshold" has no evidence behind it**, and no post-2018 case study of removing a B2B feature with a stated method exists. What experts reject is narrower than hiding — removing items from paths their hands already know. Windows 11's context menu, Figma's UI3 and Firefox's compact density were all partly reversed on that complaint, and Figma described its fix as "to preserve muscle memory for power users."

---

## The gated-features pattern

**No controlled experiment anywhere in 2018–2026 compares a visible-but-locked feature against the same feature hidden** — not on conversion, satisfaction, complaint volume or time-to-discovery. Pattern rules 1 and 8 (keep the lock where the feature would live; preview where possible) are now marked as design positions, not findings. The only evidence-shaped argument against rule 1 is the versioning-unfairness literature, which finds subtraction is judged unfair precisely when the degraded version closely resembles the full one.

What changed:

- **Rule 3 is scoped.** RevenueCat's 75,000-app benchmark shows hard paywalls converting **12.11% by day 35 against 2.18%** for freemium, with 82% of trial starts on install day. But that is consumer apps optimising time-in-app, the vendors disagree with each other, and the cost shows in refunds (5.8% against 3.4%). Scope the rule to multi-feature tools where task completion is the business metric.
- **Rule 4 is strengthened.** Show **the total for the period, never a component breakdown.**
- **Rule 5 is extended.** Figma's shipped seat-request flow carries requester, seat type, **cost**, **request origin**, reason and time. The approver is making a price decision, so rule 7 applies to their screen too.
- **Rule 7 is refined, not reversed.** Industry gates at the action, not the view — Canva at export, not at browse — because sunk effort converts. Adopting that wholesale would be drip pricing. New wording: **the lock is visible at the entry point, and no gate appears after the user has produced work they cannot keep.**
- **Deferral pays.** Zhang and Duan's randomised field experiment (**680,588 new users, 190 countries, two years**) lengthened a free trial from three days to seven: trial adoption **+11.1%**, immediate conversion unchanged, **delayed conversion +42.4%, overall +20.9%**. The conversion effect of a gate shows up late, not at the gate. A team measuring a gating change on same-session conversion will prefer the more aggressive gate, because its cost falls outside the window.

---

## Numbers this knowledge base got wrong

| What we said | What is true |
|---|---|
| Pendo 2019: 180M users / 35,000 apps, 12/15/73 | 615 subscriptions, three months; 12/8/24/56 |
| Pendo features ≈ McGrenere's 265 Word functions | Pendo features are customer-chosen tags; not comparable |
| 6% of features carry 80% of clicks | 6.4% is the median; best-in-class 15.6% |
| Tree test: target 70–80% success | Real-world median 62%, IQR 37–83% (Albert & Tullis, 98 studies). A benchmark, not a pass mark |
| Ström-Awn (2024) as density evidence | An essay with no measurements. Taxonomy kept, evidence status corrected |
| Superhuman +20% / +67% / +17% | Unsourced in the guide that carries them |
| Delete below 3–5% usage | A design convention with no evidence |
| Spool: under 5% ever changed a setting | A 2011 anecdote about consumer Word |
| Appcues: 40–60% sign up and never return | Median day-1 activation is ~5%; over 98% inactive at two weeks (Amplitude, 2,600 companies) |

**Folklore not to re-import.** "Under 2% of Gmail users have ever used a keyboard shortcut" is an unfetched podcast anecdote; the "46%/32% opt-out by message frequency" pair is non-monotonic and incoherent; and two circulating tooltip-dismissal statistics attributed to NN/g and to an "Amplitude 2024 Product Analytics Report" match nothing either organisation published.

---

## What nobody re-ran

Four absences shape how much confidence any of this deserves. The full register is [12 Gaps we accept](12-gaps-we-accept.md).

**Nobody re-ran the 2016 hidden-navigation study.** Our most-cited navigation numbers — 27% against 48–50% usage, over 20 points of task success, at least 39% slower — are ten years old, were measured on news and e-commerce websites rather than applications, and average over sites whose individual usage ranged from 17% to 89%. The two articles usually cited as follow-ups are per-site breakdowns of the same 179-participant study.

**There is no visible-versus-hidden lock experiment**, in either direction. **There is no settings-usage benchmark**, so rule 6's consequence and rule 8's test rest on a fifteen-year-old anecdote. And **there is no head-to-head test of density against disclosure** on the same professional tool with its own all-day users. The dense-UI revival of 2022–2026 is a real shift in practitioner opinion that has produced zero measurements.
