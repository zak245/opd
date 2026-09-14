# Disclosure in AI Features and Agents: What the Evaluations Say, 2018–2026

*Sweep memo. Gap closed: the knowledge base has guidance for AI features (memo 04 section 8) and one empirical thread (memo 06 section 6.1, Springer and Whittaker), but almost no measured results from the agent era. This memo collects what has been measured 2018–2026 on agent traces, approval gates, explanation depth, AI suggestions, confidence displays and cost readouts.*

*Method note. Fifteen sources were read in full (arXiv HTML or extracted PDF text); five were blocked (ACM DL 403 on three, ScienceDirect, Gartner) and are flagged and ranked lower. Tier is named for every source.*

---

## 1. The headline: exposure is designable, correction is not

**Chen et al., "Comparing Human Oversight Strategies for Computer-Use Agents," arXiv 2604.04918, April 2026. Tier 1 (HCI preprint, Notre Dame / Northeastern / JHU / Virginia Tech).** N=48 Prolific participants, within-subjects, four oversight strategies crossed with six web tasks (finance, travel, public benefits, food ordering, entertainment, reviews), ~45 minutes each. The four strategies map onto disclosure designs the knowledge base already argues about: **Action Confirmation** (approve every step — maximum disclosure, maximum interruption), **Risk-Gated** (agent runs, escalates only high-risk actions — Nielsen's "disclose by exception"), **Supervisory Co-Execution** (approve the plan, then a persistent workspace — level-1 summary, level-2 ledger) and **Structurally Enriched** (plan gating *and* step-level risk signalling, both levels always live). Results, with a planted problematic action in each task:

| Measure | Risk-Gated | Action Confirmation | Structurally Enriched | Supervisory Co-Execution |
|---|---|---|---|---|
| Problematic action became visible | 90.1% | 88.5% | 74.5% | 60.4% |
| User successfully intervened once visible | 26.4% | 23.9% | 14.6% | 9.2% |
| Problematic action ultimately succeeded | 66.3% | 67.3% | 63.6% | 54.8% |

Only the first row is statistically significant (χ²=16.93, p<.001). Verbatim: *"Oversight strategy more clearly shaped users' exposure to problematic actions than their ability to correct them once visible."*

Two numbers belong together. Step-by-step approval surfaced the bad action 88.5% of the time and stopped it 23.9% of the time: a **76% pass-through rate on things the user was explicitly shown and asked to approve.** That is the rubber-stamping figure, measured rather than asserted.

The mechanism is not inattention. Verbatim: *"Oversight breakdown often reflected rationalization rather than simple inattention: participants often noticed questionable actions, but treated them as routine, harmless, or not worth interrupting."*

Context mattered more than strategy. In higher-consequence tasks problematic actions were *more* visible (91.2% vs 65.8%, p=.001) yet *less* often stopped (12.8% vs 29.4%, p=.006) and succeeded far more often (79.5% vs 46.5%, p<.001): people under stakes looked harder and acted less. Subjective ratings flipped with stakes too (context × strategy interaction, b=−0.62, p=.006) — per-action confirmation was trusted most in low-consequence tasks, while the densest design was trusted and rated most usable in high-consequence ones (SUS 3.617 low-stakes, 4.038 high-stakes). No single disclosure depth won everywhere.

**Verdict.** This **refines** Nielsen's "disclose by exception … keep the full activity ledger 1 click away" (memo 04, section 8.3): Risk-Gated is the best of the four on visibility, tying full-step confirmation at a fraction of the interruption cost. But it **overturns** the assumption that visibility is the hard part. Making the user look is solved; making the user act is not. It also **refines** core-model section 8.2 ("safety-critical state must be persistently visible"): persistent visibility of an *action stream* does not produce intervention — framing a moment as a decision does.

---

## 2. Oversight at scale: three natural experiments in code review

The cleanest large-N evidence on rubber-stamping in 2026 comes from software engineering, where the approval queue is the pull request.

**He et al., "AI Writes Faster Than Humans Can Review: A Longitudinal Study of an Enterprise 2× Mandate," arXiv 2607.01904, July 2026. Tier 1 (CMU / Stanford).** 802 developers, 196,212 pull requests at a mid-sized B2B software company, January 2024 to April 2026, staggered difference-in-differences. After management mandated doubled AI-assisted output:

- *"The share of PRs receiving at least one human review fell 21 percentage points (89% to 68%)."*
- *"Substantive review (reviews with a human-written comment) fell from ~39% to ~21% of PRs."*
- *"Silent approvals held roughly flat (~50%)."*
- *"Automated review rose from ~19% to ~84% of PRs, overtaking human review."*
- Per-reviewer load roughly doubled (2.0×) as PR volume grew 3.1× against a reviewer pool that grew 1.5×.
- Merge rate stayed flat; revert rate declined slightly (−0.067 post-mandate, p<0.001).

The last line is awkward: by the outcome metrics nothing broke. Substantive review halved and quality indicators did not move. Either review was not doing much work, or the damage is not visible in reverts inside 16 months.

**Duma et al., "These Aren't the Reviews You're Looking For," arXiv 2605.02273, EASE '26. Tier 1.** 33,596 agent-authored PRs in repositories with ≥100 stars, 39,122 review comments. *"61.38% receive no recorded review activity."* Of those reviewed, 58.77% were reviewed **exclusively by other agents** and only 10.14% got human-only review; *"71.58% (28,004) [of comments] are authored by agents."* Where humans did comment, 28.37% of their comments were agent-steering rather than evaluation, against 1.63% on human-authored PRs.

**Peralta et al., "Why Are Agentic Pull Requests Merged or Rejected?", arXiv 2605.22534, MSR '26. Tier 1.** 11,048 closed agentic PRs, 717 manually inspected. Of 364 merged PRs, **79.1% were merged with no observable feedback loop**; of rejected ones, 33.1% *"lacked observable decision rationale."* Conclusion: *"PR outcomes alone are unreliable indicators of agent performance."*

**Verdict.** These three **confirm** the rubber-stamp hypothesis with field data: roughly 60% of agent output never reaches a human reviewer, and of what does, about half is approved silently. They also **overturn** a hopeful reading of rule 7 ("decision-critical information is never behind a door"). The information was not behind a door — it was in the diff, in the queue, on the screen. Volume, not depth, was the failure. **Disclosure that exceeds review capacity is functionally equivalent to hiding.**

Tier 2 support (vendor telemetry, method unpublished, via PR Lens): LinearB's 2026 benchmarks (8.1M PRs, 4,800+ organisations) report AI-generated PRs wait 4.6× longer for a reviewer; Faros AI reports PRs skipping review entirely rose 31.3% under high AI adoption.

---

## 3. Habituation is the mechanism, and it was measured before the agent era

**Vance, Jenkins, Anderson, Bjornn and Kirwan, "Tuning Out Security Warnings," MIS Quarterly 42(2), 2018. Tier 1 (full text could not be fetched; search summary and Semantic Scholar record only, so no verbatim figures and the claim is ranked accordingly).** fMRI, eye tracking and a three-week field experiment in which users met privacy-permission warnings while installing apps. Adherence *substantially decreased* over three weeks and neural activity in visual processing centres dropped sharply with repetition. Users given **polymorphic** warnings (appearance varied between showings) lost adherence far more slowly and were still adhering after three weeks.

This is the missing mechanism under section 1's 76% pass-through. An approval dialog is a warning; warnings habituate; habituation shows up in visual cortex, not just self-report. The design response with evidence behind it is **variation in the artefact**, not more artefacts.

Alert fatigue in security operations is the adjacent literature, with a 2025 ACM Computing Surveys review (DOI 10.1145/3723158, tier 1) that could not be fetched. The repeated numbers — 71% of SOC staff burnt out by alert volume, 62% of alerts entirely ignored, over half false positives — are vendor surveys (tier 2–3) with undisclosed sampling. Direction, not magnitude.

**Verdict.** New to the knowledge base. It **refines** rule 4 ("make the door obvious and honest"): a door that opens on every visit stops being seen. Any disclosure control on a repeated path needs either a frequency budget or deliberate variation.

---

## 4. Interruption by exception versus continuous updates

Three studies, three populations, one consistent answer: **interrupt at boundaries, not during work, and not continuously.**

**Kuo, Sergeyuk, Chen and Izadi, "Developer Interaction Patterns with Proactive AI: A Five-Day Field Study," IUI 2026 (arXiv 2601.10253). Tier 1.** 15 professional developers, 5 days in the wild, 229 AI interventions across 5,732 interaction points in a production IDE. Interventions at workflow boundaries (post-commit) got **52% engagement**; mid-task interventions (on a declined edit) were **dismissed 62% of the time**. And: *"Well-timed proactive suggestions required significantly less interpretation time than reactive suggestions (45.4s versus 101.4s, W = 109.00, r = 0.533, p = 0.0016)."*

**Pu et al., "Assistance or Disruption?", CHI 2025 (arXiv 2502.18658). Tier 1.** N=18, three Python tasks, three within-subject conditions: PromptOnly (on demand), CodeGhost (proactive, invisible agent), Codellaborator (proactive with visible presence and localised threads). Across 857 episodes, interpretation time was 34.5s / 19.8s / 18.7s respectively (F(2,856)=41.1, p<0.001); disruption ratings ran the other way (1.56 / 4.61 / 3.78, χ²=22.1, p<0.001). Of 398 proactive interventions, *"212 (53.3%) interactions leading to the user's effective engagement, 48 disruptions (12.1%), and 138 interactions (34.7%) where the user did not engage."* Trigger quality varied hugely — multi-line changes 73.1% effective, user comments 69.2%, program execution 66.7% — while code-block completion produced *"excessive responses with 50% being ignored."* Most disruption landed during implementation (32.7%), not debugging (7.27%).

**Springer and Whittaker, IUI 2019 / TiiS 2020** (memo 06 section 6.1) found the same for transparency: continuous word-level feedback while typing was *"distracting and undermines simple heuristics users form about system operation."*

**Verdict.** These **confirm** Springer and Whittaker with modern effect sizes and **refine** the guidance in memo 04: the variable is not frequency but **boundary alignment**. Same suggestion, same content, 52% engagement at a commit and 62% dismissal mid-edit. "Disclose by exception" should be restated as "disclose at a seam."

On-demand-only has its own cost: it roughly doubled interpretation time (34.5s vs ~19s; 101.4s vs 45.4s in the field study). Users who pull a disclosure pay to rebuild the context a well-timed push would have carried — a counterweight to rule 5, where the boundary that costs most is the temporal one.

---

## 5. Transparency depth: Springer and Whittaker, and everything after

**Muralidhar et al., "The Effect of Progressive Disclosure in the Transparency of Large Language Models," CHIRA 2024 / Springer CCIS 2025. Tier 1 (small venue).** N=30 plus 6 in prototype validation; a Figma prototype over Notion AI, ~110-minute interviews. Finding: *"users prefer on-demand explanations and value diverse explanation methods, especially when the explanations gradually give the users a better understanding of the AI system."* Also useful: technical metrics (word-pair cosine values) failed lay users **regardless of presentation** — turning tables into bar charts did not help. The problem was the content, not the chart.

Same lead author as the IJHCS 2025 clinical study in memo 06 section 6.2, which noted *"empirical evidence validating [progressive disclosure's] efficacy is still lacking."* Two studies, one research group: a thin evidence base for a named principle.

**"Exploring the Impact of Process Transparency on User Experience in AI Design Agents," CSCW 2025 Companion. Tier 1, ranked low.** Ten information components from an agent's execution, assembled into high, medium and low transparency conditions. Reported direction favours *"the value of higher process transparency."* The ACM page returned 403; N and effect sizes unavailable, 81% of participants had design backgrounds, and stimuli were pre-scripted videos rather than live agents.

**Buçinca, Malaya and Gajos, "To Trust or to Think," CSCW 2021 (N=199). Tier 1.** Not filed under progressive disclosure, but its **"on demand"** condition is exactly that: *"the AI suggestion was not shown to the users by default. Users could see the suggestion and the explanation … if they clicked on the 'See AI's suggestion' button."* It was grouped with two other cognitive forcing functions (decide first, then see the AI; wait 30 seconds) against two simple-XAI conditions. Where the simulated AI (75% accurate) was wrong:

- Carb-source detection: overreliance 0.64 (simple XAI) vs **0.48** (cognitive forcing), F(1,145.8)=9.24, p=.003, d=.36. Correct answers 0.08 vs **0.27**, F(1,197.4)=24.11, p≪.0001, d=.66.
- Overall task: correct 0.03 vs **0.09** (p=.003); overreliance 0.30 vs 0.26, not significant.
- The trade: *"people assigned the least favorable subjective ratings to the designs that reduced the overreliance the most."* Trust and preference were **negatively correlated** with performance on incorrect predictions. The interventions also benefited high Need-for-Cognition participants more; for low-NFC participants the distributions did not differ significantly.

**Vasconcelos et al., "Explanations Can Reduce Overreliance on AI Systems During Decision-Making," CSCW 2023, 5 studies, N=731. Tier 1.** Overreliance is a **strategic cost-benefit choice**, not a fixed bias. It rose with task difficulty (Study 1, N=340), and explanations reduced it only in the *hard* condition (Hard Pred − Hard XAI = 1.74, 95% CI [0.889, 2.76]), doing nothing in easy or medium. It rose with explanation difficulty: highlight explanations (easy to parse) beat written ones in medium and hard tasks (Studies 2 and 3, N=340 and N=286). Paying for accuracy reduced it (Study 4, N=114). Hard-to-parse written explanations performed no differently from prediction-only — not even working as a trust signal.

**Verdict.** These **confirm and sharpen** Springer and Whittaker (simplified first, detail on demand, especially on error) and add three things the knowledge base lacks:

1. Requiring a click before the AI's answer appears is a measurable intervention, not tidiness: 16 points of overreliance in the Buçinca grouping.
2. **Users dislike the disclosure designs that help them most** — the aesthetic-usability effect (core model 6.2) confirmed in an AI setting, with trust and preference *negatively* correlated with performance.
3. **A disclosure is worth opening only if it lowers verification cost below the cost of just trusting.** Vasconcelos gives the first formal account of when a level-2 explanation earns its click; a hard-to-parse explanation is, economically, no explanation.

---

## 6. Suggestion acceptance in productivity tools

Numbers, for calibration against "6% of features generate 80% of clicks" (Pendo, memo 00 section 6.3).

**GitHub and Accenture enterprise study, 2024. Tier 2 (vendor research, published method and N).** *"81.4% of developers installed the GitHub Copilot IDE extension on the same day"*; average one minute from first suggestion to first acceptance. Developers accepted approximately **30% of suggestions** and *"retained 88% of GitHub Copilot-generated characters in their editor."* Outcomes: 8.69% more pull requests, 15% higher merge rate, 84% more successful builds. Corroborating academic figures: 33% acceptance (Bakal et al.), 33% of suggestions and 20% of lines at ZoomInfo (400+ developers).

**AI code review comments.** CodeRabbit study (arXiv 2607.03316; 31,073 review-feedback pairs, 10,191 PRs): *"Developers accepted 36.4% of the comments, discussed 7.3%, and rejected 56.3%."* Comparative (arXiv 2603.15911; 278,790 reviews): *"developers adopt AI suggestions at 16.6% against 56.5% for human suggestions."* Twelve of thirteen review agents average below 60% actionable comments (arXiv 2604.03196). Tier 1 preprints, but reached via a practitioner aggregator rather than fetched directly — flagged.

**Microsoft 365 Copilot RCT, September 2024. Tier 2 (first-party telemetry, randomised).** 58 firms, 6,317 employees, licences randomly assigned and held at least six months: 31% less time reading email (50 min/week) at a consumer goods company, 23% (40 min/week) at a telecom, 41–58% more Word documents created. No acceptance-rate metric is published — the vendor with the best data on draft acceptance does not report it.

**Brynjolfsson, Li and Raymond, "Generative AI at Work," 2023/2025. Tier 1 (NBER/QJE).** ~5,000 customer-support agents, staged rollout: 13.8% more issues resolved per hour, concentrated among less-skilled workers, with a small quality decrease for the most skilled. Adherence to AI recommendations predicted gains and rose over time.

**METR, "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity," July 2025. Tier 2 (nonprofit research org, RCT, published method).** 16 experienced developers, 246 real issues, randomised per issue. *"When developers are allowed to use AI tools, they take 19% longer to complete issues."* They had forecast a 24% speedup and, afterwards, still reported a 20% speedup. METR has since marked the result historical.

**Verdict.** Acceptance clusters in a narrow band — roughly **30–36% for inline code and AI review comments, 16.6% against a human baseline in the same queue.** A usable planning number: two-thirds of what an AI feature offers will be declined, so the offer must be cheap to decline. The METR perception gap **refines** the core model's warning against measuring with satisfaction — self-report was wrong by 39 points in a randomised setting.

---

## 7. Confidence displays and trust calibration

**Fregosi, Vicente, Campagner and Cabitza, "Too Sure for Our Own Good," AAAI 2026. Tier 1.** N=184, within-subjects, logic puzzles with a decision-support system. Well-calibrated confidence scores improved decision accuracy by **+20%** (95% CI [0.18, 0.23]); miscalibrated ones by **+2%** (95% CI [−0.00, 0.04]). Perceived utility was higher when confidence was high (p<0.001) and well-calibrated (p=0.002). High expressed confidence increased automation bias **even on incorrect recommendations**, while miscalibration also produced conservatism bias, with users rejecting accurate suggestions.

**Li, Yang, Zhang, Liao, Song, Xu and Lee, "Understanding the Effects of Miscalibrated AI Confidence," arXiv 2402.07632. Tier 1 (two experiments).** Miscalibration *"impairs users' appropriate reliance and reduces AI-assisted decision-making efficacy, and AI miscalibration is difficult for users to detect."* Disclosing the calibration level *"helps users to detect AI miscalibration"* but *"decreases users' trust in uncalibrated AI, leading to high under-reliance"* and does not improve overall performance.

**Verdict.** This is the AI-era analogue of Gajos et al. (2008), which rule 6 uses for its ~70% accuracy threshold. The confidence literature **confirms the shape and adds a second threshold**: a confidence display is worth showing only if it is calibrated — uncalibrated it buys 2 points instead of 20 and inflates automation bias. It **refines** rule 7: "show the confidence" is the standard AI-UX reading of "decision-critical information is never behind a door," and it is wrong as stated. A badly calibrated number at level 1 is worse than no number, and disclosing the *meta*-level (how calibrated this system is) fixes detection without fixing decisions.

---

## 8. Cost and spend visibility for agent actions

**Bai, Huang, Wang, Sun, Mihalcea, Brynjolfsson, Pentland and Pei, "How Do AI Agents Spend Your Money?", arXiv 2604.22750, April 2026. Tier 1 (Michigan / Stanford / MIT).** Eight frontier LLMs on SWE-bench Verified.

- Agentic coding averages ~4.17M tokens per task against 1.19k for single-turn code reasoning and 3.39k for code chat — *"1000× more tokens."* Average task cost $1.857 vs $0.016 and $0.023.
- Input/output ratio 153.85 in agentic mode vs 0.16 and 1.33. **Cost is dominated by re-reading context, invisible in any UI that shows only what the agent wrote.**
- *"Runs on the same task can differ by up to 30× in total tokens,"* and higher spend does not buy accuracy — accuracy peaks at intermediate cost.
- Expert-rated task difficulty is a *"weak predictor of agent token consumption."* Models predicting their own cost before execution reach *"weak-to-moderate correlations, up to 0.39"* and *"systematically underestimate the actual token usage."*

**Gartner, June 2026. Tier 2 (analyst survey; press release 403, figures via Computer Weekly).** 23% of technology leaders report spending $200–$500 per developer per month on agent tokens and 6% report more than $2,000. Gartner's stated problem is transparency: providers *"lack transparency into how token consumption is calculated and billed."*

**Verdict.** New territory, landing on **rule 7**. Price is decision-critical and belongs at level 1, but the 30× variance and 0.39 self-prediction correlation mean an honest *pre-action* price is not currently possible for agent work; a running meter and a spend cap are. The 153.85 input/output ratio **overturns** the natural instinct: a cost readout attached to visible output misstates the bill by two orders of magnitude. And because human-perceived difficulty barely predicts cost, users cannot estimate what they are authorising — the same asymmetry the fee-deferral literature (Blake et al., +21% spend, memo 00) describes for checkout.

---

## 9. Audit and oversight interfaces

**Chan et al., "Visibility into AI Agents," FAccT 2024 (arXiv 2401.13138). Tier 1, conceptual — no empirical numbers.** Three mechanisms: agent identifiers, real-time monitoring, activity logs. On the trade-off, verbatim: *"More detailed logging is more useful, but may impose more significant costs on the deployer, require more resources and expertise for analysis, and pose more significant privacy concerns."*

**Green, "The Flaws of Policies Requiring Human Oversight of Government Algorithms," Computer Law and Security Review, 2022. Tier 1 (fetch failed; abstract only).** Surveys 41 oversight mandates: people cannot perform the oversight functions asked of them, and the mandates then legitimise deployment of faulty systems.

**Chen et al., "Dark Patterns Meet GUI Agents," CHI 2026 (arXiv 2509.10723). Tier 1.** N=22, within-subjects, 16 dark-pattern types, human-only versus supervising a GUI agent. Supervision *helped*: *"in 14 of 16 tasks, participants were less likely to fall for dark patterns when supervising the agent"* (bad defaults avoided 33.3% alone vs 80.0% supervising; trick questions 45.5% vs 81.8%). But it cost attention: eight of 22 *"described switching back and forth between panels, often missing actions due to rapid state changes"* and thirteen *"said they had to infer intent behind the agent's choices."*

**Wang, Zhu, Feng, Lu and Jia, "Agentic AI and Human-in-the-Loop Interventions," arXiv 2605.14830, May 2026. Tier 1 (field experiment).** Alibaba Taobao, August 2024, **647 customer-service workers randomised** (345 control, 302 treatment), 39,432 AI-eligible chats (5.8% of the sample). Treated workers supervised an agentic AI and intervened on escalation.

- Aggregate chat duration −3.2% (p<0.001), −16.8% in AI-eligible chats; retrial rates unchanged. Customer ratings on AI-eligible chats fell **0.412 points** (p<0.001) while AI-*ineligible* chats handled by the same treated workers rose 0.091 points (p<0.01) — a positive spillover from freed attention.
- Escalation mix: 44.1% algorithm-triggered technical, 8.6% algorithm-triggered emotional, 12.3% human-initiated, 35.0% none.
- Where the AI escalated on **emotion**, human takeover barely helped: duration +40.8%, retrials +6pp (p<0.01), ratings −0.928 (p<0.001). Where the **human** escalated early, damage was far smaller: +9.5%, −3.2pp, −0.524. Mechanism: in emotional escalations workers *"sent fewer messages, contributed a smaller share of total chat rounds, and showed less proactivity."*

**Verdict.** The Alibaba experiment is the strongest field evidence here, and it **refines** the exception-based model: *who* detects the exception matters more than whether an exception queue exists. Algorithm-triggered handoffs arrive too late and demotivate the human receiving them; human-initiated handoffs, made from continuous ambient visibility, cost a third as much. That argues for a **persistently glanceable state display plus a user-pullable takeover** over a purely push-based escalation queue — the same conclusion as section 1.

---

## What this sweep changes

- **Rule 7 gains a corollary.** Disclosure that exceeds review capacity is equivalent to hiding. Visible-but-unreviewable, not hidden-and-unfindable, is the dominant failure mode of agent UIs.
- **Rule 4 gains a frequency clause.** Habituation is measurable in three weeks and in visual cortex. A door on a repeated path needs variation or a budget.
- **"Disclose by exception" becomes "disclose at a seam."** 52% engagement vs 62% dismissal on identical content is a timing effect, not a volume effect.
- **Level-2 explanations need a cost test.** An explanation reduces overreliance only when it costs less to verify than to trust.
- **Preference data on AI disclosure is close to worthless** — Buçinca's negative trust-performance correlation, METR's 39-point perception gap.
- **Confidence displays need a calibration gate**, as rule 6 gives adaptation a ~70% accuracy gate. Uncalibrated +2%, calibrated +20%.

## Still unknown

1. **Whether anyone opens an agent activity log.** No study measured open rate, dwell time or depth on an agent trace or ledger UI; every study here scripted the exposure or inferred attention from outcomes.
2. **Approval-queue telemetry from a shipped product.** No published approval rate, time-to-decision or queue-abandonment number from a real agent product's confirmation dialog. The 23.9% intervention rate is a 48-person lab study with planted attacks.
3. **Cost-display effects.** Nothing measures whether a running token meter or a spend cap changes behaviour. The economics are documented; the interface is not.
4. **Progressive disclosure of explanations at scale.** The only work naming and testing the principle is Muralidhar's group (N=30 plus one clinical study); the CSCW 2025 process-transparency study could not be fetched.
5. **Long-run habituation to agent approval dialogs.** Vance's three-week curve is for phone security warnings in 2018.
6. **Sales and email-drafting acceptance rates.** Nothing published with a method; Microsoft has the data and publishes time-saved instead.
7. **Whether substantive review matters.** The 2× mandate study halved human review with no movement in merge or revert rates, and nobody has followed the defects far enough to say whether that is good news.

## Bibliography

**Tier 1 — peer reviewed or HCI/SE preprints**

1. Chen, C., et al. (2026). *Comparing Human Oversight Strategies for Computer-Use Agents.* arXiv:2604.04918. https://arxiv.org/html/2604.04918
2. He, H., Agarwal, S., Denisov-Blanch, Y., Azaletskiy, P., Koyejo, S., Vasilescu, B. (2026). *AI Writes Faster Than Humans Can Review: A Longitudinal Study of an Enterprise 2× Mandate.* arXiv:2607.01904. https://arxiv.org/html/2607.01904v1
3. Duma, K., et al. (2026). *These Aren't the Reviews You're Looking For.* EASE '26. arXiv:2605.02273. https://arxiv.org/html/2605.02273v1
4. Peralta, S. R. O., et al. (2026). *Why Are Agentic Pull Requests Merged or Rejected? An Empirical Study.* MSR '26. arXiv:2605.22534. https://arxiv.org/html/2605.22534v1
5. Wang, Y., et al. (2026). *Agentic AI and Human-in-the-Loop Interventions: Field Experimental Evidence from Alibaba's Customer Service Operations.* arXiv:2605.14830. https://arxiv.org/abs/2605.14830
6. Kuo, N., Sergeyuk, A., Chen, V., Izadi, M. (2026). *Developer Interaction Patterns with Proactive AI: A Five-Day Field Study.* IUI 2026. arXiv:2601.10253. https://arxiv.org/abs/2601.10253
7. Pu, K., et al. (2025). *Assistance or Disruption? … Proactive AI Programming Support.* CHI '25. arXiv:2502.18658. https://arxiv.org/html/2502.18658v1
8. Buçinca, Z., Malaya, M. B., Gajos, K. Z. (2021). *To Trust or to Think: Cognitive Forcing Functions Can Reduce Overreliance on AI in AI-assisted Decision-making.* PACM HCI 5, CSCW1, Article 188. https://doi.org/10.1145/3449287
9. Vasconcelos, H., et al. (2023). *Explanations Can Reduce Overreliance on AI Systems During Decision-Making.* PACM HCI 7, CSCW1, Article 129. https://doi.org/10.1145/3579605
10. Muralidhar, D., et al. (2025). *The Effect of Progressive Disclosure in the Transparency of Large Language Models.* CHIRA 2024, Springer CCIS. https://link.springer.com/chapter/10.1007/978-3-031-82633-7_17
11. Fregosi, C., Vicente, L., Campagner, A., Cabitza, F. (2026). *Too Sure for Our Own Good: A User Study on AI Confidence and Human Reliance.* AAAI 2026. https://ojs.aaai.org/index.php/AAAI/article/view/38798
12. Li, J., et al. (2024). *Understanding the Effects of Miscalibrated AI Confidence on User Trust, Reliance, and Decision Efficacy.* arXiv:2402.07632. https://arxiv.org/abs/2402.07632
13. Bai, L., et al. (2026). *How Do AI Agents Spend Your Money?* arXiv:2604.22750. https://arxiv.org/pdf/2604.22750
14. Chan, A., et al. (2024). *Visibility into AI Agents.* FAccT 2024. arXiv:2401.13138. https://arxiv.org/html/2401.13138v3
15. Chen, et al. (2026). *Dark Patterns Meet GUI Agents: LLM Agent Susceptibility to Manipulative Interfaces and the Role of Human Oversight.* CHI '26. arXiv:2509.10723. https://arxiv.org/html/2509.10723v1
16. Vance, A., et al. (2018). *Tuning Out Security Warnings.* MIS Quarterly 42(2), 355–380. https://doi.org/10.25300/MISQ/2018/14124 *(fetch failed; search-summary only)*
17. Luo, et al. (2025). *Exploring the Impact of Process Transparency on User Experience in AI Design Agents.* CSCW '25 Companion. https://doi.org/10.1145/3715070.3749256 *(403 on fetch; direction only)*
18. Green, B. (2022). *The Flaws of Policies Requiring Human Oversight of Government Algorithms.* Computer Law and Security Review 45. https://www.sciencedirect.com/science/article/pii/S0267364922000292 *(fetch failed)*
19. Springer, A., Whittaker, S. (2019/2020). IUI '19 and TiiS 10(4) — in memo 06 section 6.1. Muralidhar, D. (2025). IJHCS — in memo 06 section 6.2.
20. *Alert Fatigue in Security Operations Centres.* ACM Computing Surveys, 2025. https://dl.acm.org/doi/full/10.1145/3723158 *(403 on fetch)*
21. Brynjolfsson, E., Li, D., Raymond, L. *Generative AI at Work.* http://danielle.li/assets/docs/GenerativeAIatWork.pdf
22. Code-review acceptance preprints, via aggregator: arXiv:2607.03316 (CodeRabbit), arXiv:2603.15911 (278,790 reviews), arXiv:2604.03196 (13 review agents).

**Tier 2 — industry research with published numbers**

24. GitHub / Accenture (2024). *Research: Quantifying GitHub Copilot's impact in the enterprise with Accenture.* https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/
25. METR (2025). *Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity.* https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
26. Microsoft WorkLab (2024). *AI Data Drop: 3 Key Insights from Real-World Research on AI Usage.* https://www.microsoft.com/en-us/worklab/ai-data-drop-3-key-insights-from-real-world-research-on-ai-usage
27. Gartner (2026). *AI Coding Costs Will Surpass Average Developer's Salary by 2028.* Press release 403; figures via https://www.computerweekly.com/news/366645054/Gartner-AI-coding-agents-will-cost-more-than-real-developers
**Tier 3 — practitioner**

29. PR Lens. *Six in ten agent pull requests are never reviewed by a human.* https://prlens.dev/guides/agent-pull-requests-nobody-reviews (relays LinearB 2026 benchmarks, 8.1M PRs; Faros AI)
30. AgentPatterns.ai. *Agentic Review Comment Acceptance.* https://agentpatterns.ai/code-review/agentic-review-comment-acceptance/
31. NN/g (2026). *AI Agents as Users* (Gibbons and Moran, 10 April 2026). https://www.nngroup.com/articles/ai-agents-as-users/ — checked for agent-transparency guidance; contains none.
