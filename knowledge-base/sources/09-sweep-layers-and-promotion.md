# Sweep: moving users from a reduced start to the full product, 2018–2026

**Gap closed.** Evidence since 2018 on multi-layer and reduced-functionality interfaces and what triggers promotion; in-product suggestions and their acceptance and dismissal rates; suggestion timing; notification fatigue and suppression; feature discovery and awareness mechanisms; and expertise plateaus since Cockburn, Gutwin, Scarr and Malacria (2014).

**Method.** Retrieved 13–14 September 2026 by search and direct fetch, with the OpenAlex and Crossref APIs for paywalled records and PDF extraction from open copies (HAL, arXiv, UBC eDAPT, Graphics Interface, PMC) and vendor reports. **Tier 1** is peer-reviewed; **Tier 2** industry research with a stated sample. Industry sources carry a sampling grade: **[A]** sample and method stated, **[B]** sample only, **[C]** single-customer case study, **[D]** no sample. Abstract-only fetches are marked. Pre-2018 sources are named as old.

**Headline.** Nothing overturns the base, but two claims need repair and the sweep supplies missing numbers. In-product suggestions are accepted at 27–43% at best and dismissed within four seconds at scale. Tooltips, the mechanism most products use to advertise the next layer, teach almost nothing. The intervention that reliably moves people up is *temporary full exposure*; the one that moves them up completely is removing the easy path.

---

## 1. Layered interfaces since 2018: thin, and one contested result

**Forsey et al. (2025). Designing for Learnability: Improvement Through Layered Interfaces. *Ergonomics in Design*, 33(3), 135–141.** Tier 1; abstract only (SAGE and the Open University repository both 403). They propose "a design pattern of Progressive Disclosure through Layered Interfaces to improve learnability (time taken to learn) by presenting users with a subset of functionality," and report that "An experimental study supported tentative conclusions. Interesting differences between experiment participants suggest a customised approach." **Confirms** Shneiderman (2003, old) weakly; the authors' own word is "tentative," and their conclusion restates McGrenere, Baecker and Booth (2002, old).

**Liu, Y., & Sra, M. (2025). Designing Scaffolded Interfaces … arXiv:2505.12101.** Tier 1 preprint, full text fetched. ScaffoldUI reorganises Blender by task workflow and concept with "progressive disclosure based on complexity." 32 beginners, 8 experts. On the harder task, 20.89 ± 2.09 min scaffolded vs 25.33 ± 2.88 min baseline (F(1,30) = 14.78, p < .001); lower task load (F(1,30) = 91.43, p < .001); better concept and tool learning (F(1,30) = 41.20, p < .001).

The behavioural result matters more: "When certain tools were not mentioned in the tutorials but shown in our interface, participants tended to explore them … Conversely, control group participants rarely explored beyond the tools in tutorials." That **refines** Findlater and McGrenere (2010, old), the base's single citation for the awareness cost of hiding: reduction organised by *task relevance* did not suppress exploration, while the full interface did. Reduction that organises may not be reduction that hides. One preprint, one application — a hypothesis, not a correction.

The same paper names the failure mode the base has lacked words for: "users can get stuck in the beginner mode if the two modes are too different … context switching from novice to professional requires users to relearn workflows because the interfaces differ. Such discontinuity can void some of the initial learning done in the simplified application." **The cost of promotion is proportional to the distance between the layers** — which is the argument for carving layer 1 out of the real product (Carroll's training wheels, 1984, old) rather than shipping a separate lite edition.

**Contested.** **Anik, A. I., & Bunt, A. (2026). Designing Effective Training Dataset Explanations … *IUI '26*.** Tier 1, N = 32: "Progressive Disclosure did not effectively mitigate cognitive load … effective transparency does not come from minimizing detail, but from embracing it, as participants consistently valued clarity and completeness over brevity, even at the cost of higher cognitive load." That runs against Springer and Whittaker (2019/2020), whose "initially simplified feedback" principle memo 06 cites. Both concern explanation rather than command sets, but the disagreement is direct and should be recorded, not smoothed over.

**No post-2018 controlled evaluation of classic multi-layer interfaces was found, and none that manipulates the promotion trigger.** Clark and Matthews (2005, old) is still the only paper on the question.

---

## 2. What actually triggers promotion

### 2.1 Temporary full exposure works immediately and partly persists

**Harrison, J., Malacria, S., & Cockburn, A. (2025). Further testing the performance of ExposeHK in CommandMaps-like interfaces and a semi-realistic task. *IHM '25*.** Tier 1, full text fetched and verified.

Experiment 2, N = 12, a text-formatting task in a real editor across three ordered stages — before ExposeHK, with it, and after it was removed. Keyboard-shortcut usage by stage: **"9.79% (s.d. 19.67), 86.20% (s.d. 12.87) and 73.09% (s.d. 21.15) for the EHK_pre, EHK and EHK_post stages, respectively."** Exposing every shortcut took usage from a tenth to six-sevenths of selections, and three-quarters of that survived removal within the session. Experiment 1 (N = 18) found the exposed method 26% faster (1.87 s vs 2.52 s, F(1,17) = 44.98, p < .001) and preferred 17 to 1, at a higher error rate (2.8% vs 0.3%).

### 2.2 Tooltips do not move anyone

From the same study, the pre-exposure stage: **"the total number of tooltip exposures across all participants was 749 (mean 62.42, s.d. 14.74), with only two keyboard shortcuts being activated after a tooltip exposure."** The authors conclude that "tooltips may be ineffective for discovering and learning new keyboard shortcuts, as users tend to ignore them."

**Bailly, Avellino, Brulé & Malacria (2025). The Role of Social Interactions in the Interaction Discovery of Keyboard Shortcuts. *IHM '25*.** Tier 1, full text fetched and verified. Retrospective survey, **N = 853**; 306 (36%) said how they learned shortcuts exist.

- **Only 54 (6%) discovered the method by themselves.** "our results show that users rarely learn the existence of the keyboard shortcut method by themselves (only 6% in our survey)."
- **238 (28% of all respondents) credited a face-to-face social interaction**, 209 (24%) having been shown over the shoulder.
- **Computer-assisted discovery totalled 29 respondents (3%)**: menus 14 (2%), **tooltips 7 (1%)**, tips 2 (<1%).
- Only 13 respondents (1.5%) discovered shortcuts at work with colleagues; 79% discovered them between ages 6 and 14.

Together these two 2025 papers put a number on the passive signpost. **Roughly 1% of an 853-person sample ever learned an expert method from a tooltip, and in a controlled task 749 tooltip exposures produced two adoptions.** Cost any promotion strategy resting on hover hints at approximately zero.

### 2.3 Signifiers fail; forced encounter succeeds completely

**Mackamul, Chevalier, Casiez & Malacria (2025). Does Adding Visual Signifiers in Animated Transitions Improve Interaction Discoverability? *CHI '25*.** Tier 1, full text fetched. Study 1 N = 33, Study 2 N = 22.

Adding visual signifiers to animated transitions had no effect on discovery (χ²(2) = 1.06, p = 0.59), and still none when transitions were slowed to **5000 ms** to guarantee they were noticed. Only 7 of 33 participants discovered the hidden widget while an alternative path existed; when the task removed the alternative, everyone found it, and **"of the participants who did discover the Swhidget in Task 5, none returned to using the popup."** The authors call this "a disconnect between noticeability and discoverability."

The sharpest promotion finding in the sweep, and an uncomfortable one: **the reliable trigger is removing the old path, not advertising the new one.** Where paths cannot be removed, the honourable version is temporary exposure (2.1) and a default that changes once, not a hint that repeats.

### 2.4 An intermediate layer speeds the exit but does not create experts

**Goguey, Malacria, Cockburn & Gutwin (2019). Reducing error aversion to support novice-to-expert transitions with FastTap. *IHM '19*** (Best Paper). Tier 1. N = 36, 10 blocks × 24 trials, with intermediate modes letting users cheaply confirm and correct a recalled command.

Intermediate modes accounted for **30% of all selections**, and novice-mode use fell across blocks 1→10 from **94% to 34%** (and to 31% and 21% in the other conditions; block effect F(1,33) = 94.47, p < .0001), with the **technique effect not significant** (F(2,33) = 1.01, p = .37). Errors dropped only when errors were expensive. But: "while it validates the design of our intermediate modes, we found no evidence of greater switch to memory-based interaction, suggesting that **reducing the error rate is not sufficient to promote expert use of techniques**." The most plausible mechanical explanation for the expertise plateau — people stay in the safe mode because the fast mode is risky — was tested directly and did not hold.

---

## 3. Acceptance and dismissal of in-product suggestions

| Mechanism | Acceptance | Sample | Source |
|---|---|---|---|
| Inline code suggestion (Copilot) | **27%** overall | 2,631 survey responses matched to IDE telemetry | Ziegler et al., MAPS '22 (Tier 1) |
| System suggestion with the user's own data | **43%** (9 of 21) | 4-week field study | Janzen & McGrenere, CHI '22 (Tier 1) |
| Modal in-app message: CTA clicked | **40%**; **37.5% dismissed** | 550M+ interactions | Chameleon 2025 [B] |
| In-app guide engagement, 90th percentile | **60.2%** | 6,800+ apps, 2,500 customers | Pendo [A] |
| Onboarding checklist completion | **19.2% mean / 10.1% median** | 188 companies | Userpilot [A] |

**Ziegler et al. (2022), *MAPS '22*.** Tier 1. Overall acceptance **27%**, and the time-of-day split is the finding for this memo: **21.2% during core working hours (7am–4pm) against 23% evenings and nights and 23.5% at weekends.** Suggestions are accepted *least* when the user is most engaged in work — the opposite of what "moment of need" targeting assumes. The authors also found that "the rate with which shown suggestions are accepted … drives developers' perception of productivity."

**Janzen & McGrenere (2022), *CHI '22*.** Tier 1, full text fetched. 21 participants, four weeks, rule-triggered suggestions shown against a visualisation of their own notification data. **9 of 21 (43%) applied a suggestion**; all 21 did something. The stated-versus-revealed gap is explicit: "The rate of acceptance of our suggestions was lower in this study than in the pre-study survey where, for example, 75% of participants wanted to silence non-work notifications during working hours." **Halve stated interest to predict real acceptance.** And 12 of 21 acted on their own initiative instead: a declined suggestion that prompts reflection is not a failed one.

**Dismissal, at scale. Chameleon 2025** [B], "550+ million user interactions": **37.5% average modal dismiss rate**, of which **"38% of users close them in under 4 seconds, giving you almost no time to make an impression."** The 2024 edition [A] is better documented — "data from Jan 1st, 2023 to Dec 31st, 2023 using Mixpanel," ~300 million interactions, outliers excluded — and reports **33.5% average tour completion**, rising to **64% when the user launched the tour themselves**.

**The one case with a control group. Litmus, via Appcues** [C]: "of the users who saw the tooltip, 62% became active users of the feature—compared to only 2% in the control group." No sample size is published, so it carries one line and no more: a contextual announcement *can* move adoption by an order of magnitude.

---

## 4. Timing: pull beats push, and the system cannot tell when you are stuck

**Laubheimer, P. (2023). Onboarding Tutorials vs. Contextual Help. NN/g.** Tier 2, no sample. A *push revelation* is delivered when the system chooses, a *pull revelation* when the user acts. "Push revelations reveal new information out of context, without any specific indication that the user would benefit from the information *at that moment*." "Tutorials interrupt users, don't necessarily improve task performance, and are quickly forgotten."

The industry telemetry agrees, across four Chameleon editions and three independent A/B tests:

- **Modal completion by trigger** (2025): custom and hover-based 51%, click-based 47%, **immediate on-page-load 39%** — the scheduled one is last.
- **Launcher-driven versus not** (2025): tours **67% vs 31%**, surveys 54% vs 15%; self-served tours had "2x the completion rate of 'one-size-fits-all' tours." Embedded experiences are "up to 1.5x more likely" to be acted on than pop-ups.
- Head-to-head pattern tests agree: Hotjar's hotspot beat its tooltip (8.16% vs 6.5%, "+26% uplift"), Zywave's persistent pin beat its slideout (88% vs 49%) [both C, no sample].

**How long is the moment? Kiani et al. (2019), *CHI '19*.** Tier 1, full text fetched. 26 newcomers to Fusion 360, second-by-second coding: "On average, participants took about 3 minutes to initiate their first help-seeking activity," and "many of the non-technical newcomers (40%) gave up after their first unsuccessful attempt of using a help resource." **The window is minutes, and one miss costs 40% of the non-technical audience.**

**Can the system detect it? Nambhi et al. (2019), arXiv:1906.08973.** Tier 1, full text fetched. One month of logs from a web analytics product, ~350,000 command sequences from "several tens of thousands of users." Next-command recommendation reached Top-1 **0.620** and Top-5 **0.897**; proactive help prediction ("does this user need help now?") reached precision **0.27 ± 0.06**, recall **0.40 ± 0.05**, AU-ROC **0.83 ± 0.13**.

At 0.27 precision, **roughly three in four interruptions would be wrong.** Against the ~70% threshold the base cites from Gajos et al. (2008, old), a state-of-the-art "you look stuck" detector on real enterprise logs is nowhere close. Top-5 accuracy of 90% is enough to populate a persistent "Suggested" list; it is not enough to interrupt.

**The successor to Gajos on adoption thresholds. Roy, Casiez & Vogel (2025), *ACM TOCHI*** (three experiments, **1,207 participants**), extending Roy, Berlioux, Casiez & Vogel, *CHI '21* (N = 36). Tier 1. Suggestion adoption is accuracy **multiplied by how good the user's existing path already is**: uptake rose from under 0.5 to over 3.3 suggestions per trial on phone and tablet as accuracy went from 0.1 to 0.9, but **on desktop it never exceeded 0.9 per trial even at 0.9 accuracy** (device × accuracy interaction F(4,66) = 24.4, p < .0001). The conclusion: "suggestions are used less as typing efficiency increases, and only improve speed when highly accurate … While increasing accuracy may lead to higher satisfaction, it is unlikely to significantly boost performance on its own."

This **refines** the base's rule 6 materially. Accuracy is necessary but not sufficient: **a competent user on a fast path will ignore a correct suggestion.** The population that adopts suggestions is the one whose current path is slow.

---

## 5. Notification fatigue, snooze and suppression

### 5.1 The dose-response curve

**Masud, Cimino & Colicchio (2026), *AMIA Annual Symposium Proceedings*.** Tier 1. 1,799 prescribers, **196,225 alerts**, one year. Overall override **93.5%**; by burden, **92.6%** below one alert per day, **94.5%** at 1–5 per day, **98.6%** above 5 per day. Override rises monotonically with frequency and is already above 92% at less than one prompt a day. There is no frequency at which prompts are reliably read.

### 5.2 Modal versus inline, and habituation

**Cha et al. (2020), *Medicina*, 56(12), 662.** Tier 1. 993 doctors, **2,706,395 alerts**, 18 months. The system "does not generate modals, 'pop-ups' but show messages as in-line information"; "The overall override rate was 61.9%," against "previous reports of 49% to 94%." Override then rose — a significant increasing trend from month 12, and "The mean difference in the alert overrides between the first 12 months (before) and the last 6 months (after) was 4.9%."

**Non-modal prompting roughly halves the ignore rate**, and the same prompts decay by about five points a year. *Tension to record:* **Reeder et al. (CHI '18)**, sampling over 6,000 Chrome and Firefox users in the field, "do not find a single dominant failure in modern warning design—like habituation—that prevents effective decisions." Treat decay as a budgeting assumption, not a law.

### 5.3 Users want suppression, not snooze

**Li et al. (2022), *ACM TOCHI*, 29(5).** Tier 1, abstract only. One-week experience sampling, N = 35: "users prefer mitigating undesired interruptions by suppressing alerts over deferring them and referred to notification content factors more frequently than contextual factors." A model personalised from observed actions "achieved a performance gain of 39% than a generic model … similar to the 42% performance gain using labels solicited from the user."

The industry telemetry prices snooze: Chameleon 2024 [A] logged **2.4 million snoozed tours** and found "you can get **3%** of your tour 'exiters' to return and complete the tour"; the 2025 edition reports **12%** of snoozed modals completed on retry. **Snooze recovers single digits to low double digits.** Build "don't show me this kind again" instead.

### 5.4 Frequency: the curve is peak-shaped, not a cap

**Braze (2020). Send frequency.** Tier 2 [A]: "This analysis spans approximately 151 billion users and 534 billion messages sent over the past 2 years … from 674 companies across 20 different industries," with the optimum defined as the volume maximising attributed app opens. The optimum is **1–4 pushes per month overall**, ranging from 1 per month in travel, restaurants, finance and health to 14–16 in entertainment — a sixteen-fold spread. **Airship (2025)** [A], "more than 9 billion app users across thousands of apps," reports sends per user rising year on year while open rates stayed flat (Android median 3.4% both years; iOS 3.1%) — the most defensible fatigue signal in the vendor data.

**Absence worth reporting:** no vendor publishes a measured effect of frequency caps, quiet hours or intelligent throttling on opt-out or engagement, and nobody publishes opt-out rate against *observed* send frequency with a stated sample. The widely recirculated "46% opt out at 2–5 messages a week, 32% at 6–10" pair is non-monotonic and therefore incoherent as behaviour; it should not be cited.

---

## 6. How much of the product users ever reach

- **Pendo (2019 Feature Adoption Report)** [A], "feature usage across 615 Pendo subscriptions for customers who have used Pendo for more than a year": "80 percent of features in the average software product are rarely or never used."
- **Pendo benchmarks (2024)** [A], 6,800+ applications across 2,500 customers: median feature adoption **6.4%**, best-in-class **15.6%** ("Percentage of features that generate 80% of click volume"). This **refines** rule 1 and section 6.3, which quote "6% of features generate 80% of clicks" without saying that is the *median* and the top decile is 2.5× wider. Pendo's 2020 graduation gap [B]: "Best-in-class organizations see usage concentrated across **28%** of their product feature set, whereas average products see usage concentrated in just **11%**."
- **Amplitude, *Product Benchmark Report* (2025)** [A] — 2,600+ companies, 10.6K products, 171B monthly users, Sept 2023 to Sept 2024, outliers removed by z-score: day-1 activation ~21% top decile vs ~5% median; **"For half of all products, >98% of new users aren't active two weeks after their first action."** Promotion machinery aimed at week four is aimed at nobody.
- **Step count, replicated across four Chameleon editions:** 3-step tours completed at **72%** against 16% for 7-step (2022, 58M tours); below 50% after five steps (2020); 21.6% at five steps (2024). *Observational* — shorter tours may cover simpler jobs — and no source in the corpus runs a controlled A/B of staged versus all-at-once onboarding.
- **Exploration is expensive.** Mahmud et al. (*CHI '20*, 30 first-time OneNote users): the median share of selections that merely repeated an already-failed selection was 55.5% for older adults, 47.5% for children, 43.9% for adults — **confirming** Carroll and Carrithers (1984, old) in a modern application.
- **Social beats systemic.** Giannisakis et al. (*GI '22*, N = 18) found the preferred awareness concept was the lowest-involvement one, showing *where in the interface* a colleague's command lived; comparison-based concepts risked users feeling "micromanaged." Drosos et al. (arXiv:2604.13621, 28 experts) found experts could helpfully answer more than half of short forum questions in under 60 seconds. Given Bailly's 28%-social versus 1%-tooltip split, routing a human competes with inferring a suggestion.
- **Command recommenders regressed.** Aggarwal et al. (*RecSys '20*, 0.719 accuracy on 55K sessions) and Nambhi et al. (0.620 Top-1) are **offline only** — no deployment, no acceptance rate — a step back from CommunityCommands (2009, old). Gašparič and Ricci (*IEEE Access* 2020, abstract only) ran the one long-term IDE study: "To improve recommendation acceptance rate, researchers should also focus on context-aware algorithms and tailor command recommendation timing."

---

## 7. Expertise plateaus since Cockburn et al. (2014)

- **Bailly, Khamassi & Girard (2022), *ACM TOCHI*.** Tier 1, abstract plus reported model comparison. Fitting 42 users × 720 commands, the best model, *Transition* (BIC 336.5), beats Rescorla-Wagner (400.7), Choice Kernel (361.2) and RWCK (345.4), and needs five mechanisms — "implicit and explicit learning, decay, planning and perseveration." **Perseveration is a first-class parameter of the best-fitting model**: the plateau as arithmetic rather than complaint, **confirming** Carroll and Rosson's production bias (1987, old).
- **Lewis, d'Eon, Cockburn & Vogel (2020). KeyMap. *CHI '20*.** Tier 1, abstract. Showing commands on a picture of the keyboard rather than in a list: "KeyMap users remembered 1 more shortcut than ExposeHK immediately after training, and this advantage increased to **4.5 more shortcuts** when tested again after 24 hours," plus incidental learning of unpractised shortcuts. The advantage *grew* overnight.
- **Lam, Gutwin, Klarkowski & Cockburn (2021), *CHI '21*.** Tier 1, abstract. Injected interpretation errors produced "worse memory retention, higher completion times, higher occurrences of user error … and greater perceived effort." An unreliable accelerator damages the learning of the thing it accelerates.
- **Khurana, Su, Wang & Chilana (2025), *CHI '25*.** Tier 1, N = 20 plus 10. "GuidedCopilot outperformed AutoCopilot in user control, software utility, and learnability … while AutoCopilot saved time for simpler visual tasks" — the layering question restated for AI assistants, and the semi-reduced guided path wins on learnability.
- **Khurana, Subramonyam & Chilana (2024), *IUI '24*.** Tier 1, N = 16. A domain-tuned assistant raised expert-rated assistance accuracy from 37.5% to 64.4% (PowerPoint) and 45% to 65.7% (Excel), yet **task completion moved 35%→45% and 40%→55%, neither significant**. Better answers did not become better outcomes.
- **A null at scale. Tankelevitch et al. (2026), *CHI '26*.** Tier 1. Preregistered field experiment in a global technology company: **361 employees, 7,196 meetings, two weeks**, prompts delivered in the primary collaboration platform. "the intervention impact on meeting effectiveness was not statistically significant," with the warning that "post-meeting surveys unintentionally function[ed] as an intervention." The best-powered in-situ nudge experiment in the sweep is a null.

---

## 8. What this changes in the knowledge base

| Existing claim | Rests on | 2018–2026 evidence | Verdict |
|---|---|---|---|
| Hidden features are not learned | Findlater & McGrenere 2010 | ScaffoldUI beginners explored beyond their task; full-interface controls did not | **Refines**: penalty may attach to hiding by expertise, not organising by task |
| Adaptation needs ~70% accuracy | Gajos et al. 2008 | Help detection precision 0.27 on real logs; adoption = accuracy × slowness of the user's existing path (n = 1,207) | **Confirms** the floor; **refines** it — accuracy alone is not enough |
| Command recommendation answers the awareness cost | Matejka et al. 2009 (field, 2.1×) | Two post-2018 recommenders, offline only, no acceptance rate | **Refines**: better models, worse evidence |
| Users fail to adopt faster methods | Cockburn et al. 2014 | Goguey 2019: removing error risk gave "no evidence of greater switch"; Bailly 2022 needs perseveration as a term | **Confirms** and deepens |
| Shortcut hints teach shortcuts | NN/g heuristic 7 | KeyMap +4.5 shortcuts at 24 h; but 749 tooltip exposures → 2 adoptions, and tooltips explain 1% of discovery (N = 853) | **Refines sharply**: exposure teaches, hover tooltips do not |
| 6% of features generate 80% of clicks | Pendo 2024 | 6.4% is the *median*; 15.6% best-in-class; usage spread 11% vs 28% of the feature set | **Refines**: name the tier |
| Prompts should be rare and dismissible | General guidance | Override 92.6→94.5→98.6% with frequency; non-modal 61.9% vs 49–94%; +4.9 points over 18 months; optimum peak-shaped, varying ~16× by vertical | **Refines** with a dose-response curve, a decay rate and a frequency shape |
| Prefer user-controlled disclosure | McGrenere 2002 | Launcher-driven tours 67% vs 31%; self-served 2×; embedded 1.5× pop-up; suppression preferred to deferral | **Confirms** across 550M+ interactions |
| Progressive disclosure of explanations helps | Springer & Whittaker 2019/2020 | Anik & Bunt 2026 (N = 32): PD "did not effectively mitigate cognitive load" | **Contested** — record both |

**Three things the base does not carry at all.** (1) **The promotion window is days**: for the median product, >98% of new users are inactive two weeks after their first action. (2) **Real acceptance is roughly half of stated interest** (75% survey yes → 43% applied), with a 27% ceiling in the best-instrumented case. (3) **The only complete promotion trigger found is removing the alternative** — 7 of 33 discovered a feature while an easy path existed; all did when it was gone, and none went back.

### Draft rule language

- **Open the path to the second layer in the first session.** Measure promotion at day 1 and day 7.
- **Do not rely on tooltips to advertise the next layer.** Budget them at roughly zero (749 → 2; 1% of 853).
- **Prefer temporary full exposure to permanent hints** (9.79% → 86.20% → 73.09% in one session), and **where a path can be retired, retire it** — nobody forced onto the better path went back.
- **Do not interrupt on inferred need below ~70% precision.** Current best on enterprise logs is 27%; use a persistent list instead.
- **Expect a competent user on a fast path to ignore a correct suggestion.** Target the slow path, not everyone.
- **Offer "don't show me this kind again," not "snooze."** Snooze recovers 3–12%.
- **Prefer inline and user-launched to modal and on-load** (67% vs 31%; 51% vs 39%; 61.9% vs 49–94%), and **budget prompts for decay and a peak-shaped frequency optimum** — about five points more ignoring per year, and an optimum varying roughly sixteenfold by context.

---

## 9. Still unknown

- **What triggers promotion.** No 2018–2026 study manipulates the trigger (user-initiated vs usage-inferred vs role-seeded vs milestone) and measures who moves up. Clark & Matthews (2005, old) remains the only paper.
- **Layer-switching rates in real products.** Nobody publishes what share of users ever enable an advanced mode or revert. The closest is Feefo's "30% user opt-in rate for the redesign" via Appcues [C] — one customer, no sample, no revert figure.
- **Measured effects of frequency caps, quiet hours, snooze or throttling.** Every vendor sells them; none publishes an effect. A reportable absence, not a search failure.
- **Whether accepted suggestions produce lasting adoption.** Every acceptance figure is a point-in-time act.
- **A controlled A/B of staged versus all-at-once onboarding.** The step-count curves are observational in all four Chameleon editions.
- **Habituation to in-product hints.** The ~5-points-per-18-months figure is clinical; Reeder et al. (2018) found no dominant habituation effect in browser warnings, and the peer-reviewed snooze/deferral work is all mobile.
- **Conversational and agentic products.** Still no study of progressive disclosure of *capabilities* in chat or agent interfaces.
- **Texts that could not be fetched:** Forsey et al. 2025 full text (SAGE and ORO, 403); Bailly et al. 2022, Li et al. 2022, Lewis et al. 2020, Lam et al. 2021 full texts; Gašparič & Ricci 2020 (*IEEE Access*) and Vella & Porter 2022 (*ECCE*), both of which likely hold acceptance-rate and task-resumption numbers; Amplitude's benchmark widget percentiles and Pendo's 25th/50th/75th percentiles (JavaScript-rendered). Claims from these are marked abstract-only above.
- **Numbers deliberately excluded as unsound:** the "46% / 32% opt-out by frequency" pair (non-monotonic), "120% higher retention with one push" (self-selection), Userpilot's per-industry cuts (medians above means on bounded metrics), and every single-customer "3×" lift. Two widely circulated figures attributed to NN/g (tooltips "dismissed 82% of the time within 1.2 seconds") and to an "Amplitude 2024 Product Analytics Report" (1,247 B2B applications, "76.3% of static tooltips dismissed within 3 seconds") appear only on a low-tier blog that could not be fetched, match nothing in either organisation's published work, and should be treated as fabricated.

---

## Bibliography

Aggarwal, S., Garg, R., Sancheti, A., Guda, B. P. R., & Burhanuddin, I. A. (2020). Goal-driven command recommendations for analysts. *RecSys '20*. https://doi.org/10.1145/3383313.3412255

Airship. (2025). *2025 Push Notification Benchmarks*. https://growth.airship.com/rs/313-QPJ-195/images/Airship-2025-Push-Notification-Benchmarks-EN.pdf

Amplitude. (2025). *Product Benchmark Report*. https://info.amplitude.com/rs/138-CDN-550/images/the-product-benchmark-report.pdf

Anik, A. I., & Bunt, A. (2026). Designing effective training dataset explanations: The impact of information depth and progressive disclosure. *IUI '26*. https://doi.org/10.1145/3742413.3789087

Appcues. (n.d.). How Hotjar A/B tested subtle in-app callouts. https://www.appcues.com/customer-stories/how-hotjar-a-b-tested-subtle-in-app-callouts-to-drive-greater-feature-adoption · How Litmus increased feature adoption by 2100%. https://www.appcues.com/customer-stories/how-litmus-used-appcues-to-increase-feature-adoption-by-2100 · How Feefo opted 30% of users into a new UI. https://www.appcues.com/customer-stories/how-feefo-quickly-opted-30-of-users-into-a-new-ui-redesign

Bailly, G., Avellino, I., Brulé, E., & Malacria, S. (2025). The role of social interactions in the interaction discovery of keyboard shortcuts. *IHM '25*. https://doi.org/10.1145/3765712.3765714 · https://hal.science/hal-05294608

Bailly, G., Khamassi, M., & Girard, B. (2022). Computational model of the transition from novice to expert interaction techniques. *ACM TOCHI*. https://doi.org/10.1145/3505557

Braze. (2020). Send frequency: What "just right" looks like, vertical by vertical. https://www.braze.com/resources/articles/send-frequency-what-just-right-looks-like-vertical-by-vertical

Cha, W. C., Jung, W., Yu, J., Yoo, J., & Choi, J. (2020). Temporal change in alert override rate with a minimally interruptive clinical decision support. *Medicina*, 56(12), 662. https://pmc.ncbi.nlm.nih.gov/articles/PMC7761179/

Chameleon. (2022–2025). *Benchmark Report*. https://www.chameleon.io/benchmark-report · /benchmark-report-24 · /benchmark-report-2023 · /benchmark-report-2022

Drosos, I., Vermeulen, J., Fitzmaurice, G., & Matejka, J. (2026). Nanomentoring. arXiv:2604.13621. https://arxiv.org/abs/2604.13621

Forsey, H., Leahy, D., Fields, B., Minocha, S., Attfield, S., & Snell, T. (2025). Designing for learnability: Improvement through layered interfaces. *Ergonomics in Design*, 33(3), 135–141. https://doi.org/10.1177/10648046241273291

Gašparič, M., & Ricci, F. (2020). IDE interaction support with command recommender systems. *IEEE Access*, 8, 19256–19270. https://doi.org/10.1109/ACCESS.2020.2967840

Giannisakis, E., Alvina, J., Bunt, A., Chilana, P. K., & McGrenere, J. (2022). Promoting feature awareness by leveraging collaborators' usage habits in collaborative editors. *GI '22*. https://doi.org/10.20380/GI2022.07

Goguey, A., Malacria, S., Cockburn, A., & Gutwin, C. (2019). Reducing error aversion to support novice-to-expert transitions with FastTap. *IHM '19*. https://doi.org/10.1145/3366550.3372247 · https://hal.science/hal-02381584

Harrison, J., Malacria, S., & Cockburn, A. (2025). Further testing the performance of ExposeHK in CommandMaps-like interfaces and a semi-realistic task. *IHM '25*. https://doi.org/10.1145/3765712.3765715 · https://hal.science/hal-05294658

Janzen, I., & McGrenere, J. (2022). Reflective spring cleaning. *CHI '22*. https://www.cs.ubc.ca/labs/edapt/papers/janzen2022.pdf

Khurana, A., Su, X., Wang, A., & Chilana, P. (2025). Do it for me vs. do it with me. *CHI '25*. https://doi.org/10.1145/3706598.3713431 · https://arxiv.org/abs/2504.15549

Khurana, A., Subramonyam, H., & Chilana, P. (2024). Why and when LLM-based assistants can go wrong. *IUI '24*, 288–303. https://doi.org/10.1145/3640543.3645200

Kiani, K., Cui, G., Bunt, A., McGrenere, J., & Chilana, P. K. (2019). Beyond "one-size-fits-all". *CHI '19*. https://doi.org/10.1145/3290605.3300570

Lam, K. C., Gutwin, C., Klarkowski, M., & Cockburn, A. (2021). The effects of system interpretation errors on learning new input mechanisms. *CHI '21*. https://doi.org/10.1145/3411764.3445366

Laubheimer, P. (2023). Onboarding tutorials vs. contextual help. Nielsen Norman Group. https://www.nngroup.com/articles/onboarding-tutorials/

Lewis, B., d'Eon, G., Cockburn, A., & Vogel, D. (2020). KeyMap. *CHI '20*. https://doi.org/10.1145/3313831.3376483

Li, T., Haines, J. K., Flores Ruiz De Eguino, M., Hong, J. I., & Nichols, J. (2022). Alert now or never. *ACM TOCHI*, 29(5). https://doi.org/10.1145/3478868

Liu, Y., & Sra, M. (2025). Designing scaffolded interfaces for enhanced learning and performance in professional software. arXiv:2505.12101. https://arxiv.org/abs/2505.12101

Mackamul, E., Chevalier, F., Casiez, G., & Malacria, S. (2025). Does adding visual signifiers in animated transitions improve interaction discoverability? *CHI '25*. https://doi.org/10.1145/3706598.3713914 · https://hal.science/hal-05004363

Mahmud, S., Alvina, J., Chilana, P. K., Bunt, A., & McGrenere, J. (2020). Learning through exploration. *CHI '20*. https://doi.org/10.1145/3313831.3376414

Masud, J. H. B., Cimino, J. J., & Colicchio, T. K. (2026). In pursuit of the alert fatigue. *AMIA Annual Symposium Proceedings*, 2025, 844–853. https://pmc.ncbi.nlm.nih.gov/articles/PMC12919540/

Nambhi, A. M., Reddy, B. P., Agarwal, A. P., Verma, G., Singh, H., & Burhanuddin, I. A. (2019). Stuck? No worries! arXiv:1906.08973. https://arxiv.org/abs/1906.08973

Pendo. (2019). *Feature Adoption Report*. https://www.pendo.io/resources/the-2019-feature-adoption-report/ · (2020). *The Path to Product Adoption*. https://www.pendo.io/resources/the-path-to-product-adoption/ · (2024). Product benchmarks. https://www.pendo.io/product-benchmarks/

Reeder, R. W., Felt, A. P., Consolvo, S., Malkin, N., Thompson, C., & Egelman, S. (2018). An experience sampling study of user reactions to browser warnings in the field. *CHI '18*. https://doi.org/10.1145/3173574.3174086

Roy, Q., Berlioux, S., Casiez, G., & Vogel, D. (2021). Typing efficiency and suggestion accuracy influence the benefits and adoption of word suggestions. *CHI '21*. https://doi.org/10.1145/3411764.3445725 · https://hal.science/hal-03172202

Roy, Q., Casiez, G., & Vogel, D. (2025). Are word suggestions beneficial? *ACM TOCHI*. https://doi.org/10.1145/3772716

Tankelevitch, L., Scott, A. E., Challakere, N., Panda, P., & Rintel, S. (2026). Nudging attention to workplace meeting goals. *CHI '26*. https://doi.org/10.1145/3772318.3791199 · https://arxiv.org/abs/2602.16939

Userpilot. (2025). *SaaS product metrics benchmark report*. https://userpilot.com/saas-product-metrics/

Vella, V., & Porter, C. (2022). Wait a second! Assessing the impact of different desktop push notification types on software developers. *ECCE '22*. https://doi.org/10.1145/3552327.3552328

Ziegler, A., Kalliamvakou, E., Li, X. A., Rice, A., Rifkin, D., Simister, S., Sittampalam, G., & Aftandilian, E. (2022). Productivity assessment of neural code completion. *MAPS '22*. https://doi.org/10.1145/3520312.3534864 · https://arxiv.org/abs/2205.06537
