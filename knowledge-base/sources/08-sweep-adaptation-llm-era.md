# Sweep: Adaptation and personalisation in the LLM era, 2018–2026

**Gap closed.** The knowledge base's claims about adaptive interfaces rest almost entirely on four experiments from 2002 to 2010 (McGrenere, Baecker & Booth 2002; Findlater & McGrenere 2004; Gajos et al. 2008; Findlater et al. 2009). Rule 6 in `RULES.md` even says so out loud: the "roughly 70% accuracy" figure "comes from a 2008 study of desktop toolbars; it is the best number available, not a current one, and it has not been re-tested for AI-driven personalisation." This sweep looked for anything published from 2018 onwards that re-tests it.

**Method and honesty note.** Sources were retrieved on 2026-09-13 by web search and direct fetch. ACM DL, ScienceDirect, Wiley, ResearchGate and MDPI blocked fetching (HTTP 403) throughout; where a paper could only be reached through OpenAlex reconstructed abstracts or search-engine summaries, that is stated and the claim is ranked lower. Two papers were read in full from PDFs decompressed locally (Todi et al. 2021; Dillon et al. 2025); their numbers are the most reliable here. Tier labels: **T1** peer-reviewed (CHI, IUI, UIST, ACL, JSS, CGF), **T1-pre** arXiv preprint from those communities, **T2** industry research with published numbers, **T3** practitioner essay.

---

## 1. Headline answer

**The 70% figure has not been re-tested, and no newer number exists.** No study since 2018 systematically varies an adaptive interface's prediction accuracy and measures where adaptation overtakes a static layout. What the post-2018 record does contain is something arguably more useful: repeated demonstrations that *spatial* adaptation still loses to static layouts even when the underlying prediction is good, and a new body of work on AI *suggestions* where the governing number is no longer prediction accuracy but suggestion acceptance — which in the field runs around 30%, not 70%.

So Rule 6 survives, but its justification should shift. The reason not to reorder a menu by inferred history is not mainly "the model isn't accurate enough yet." It is that relocation itself costs more than the prediction can repay, and that finding has now been reproduced twice with modern methods.

---

## 2. Does "adaptation beats static above ~70% accuracy" still hold?

### 2.1 Todi, Bailly, Leiva & Oulasvirta (CHI 2021), *Adapting User Interfaces with Model-based Reinforcement Learning* — T1, full text read

The strongest post-2018 experiment on adaptive menus. The system plans sequences of adaptations with Monte-Carlo tree search over predictive HCI models, explicitly "avoiding unexpected changes that surprise the user or require relearning," yielding what the authors call "a conservative adaptation policy: It finds beneficial changes when there are such and avoids changes when there are none."

Design: 18 participants (aged 18–38, mean 27.2), within-subjects, three conditions (Static, Frequency, MCTS), 15-item linear menus, Zipfian selection frequencies, "18 participants × 3 conditions × 3 blocks × 2 menus × 20 selections = 6480 trials."

Results, verbatim: "Condition had a statistically significant effect on selection time F(2,17) = 5.47, p < 0.05, with grand means Static = 2283 ms, Frequency = 2298 ms, and MCTS = 2162 ms." Tukey HSD put MCTS significantly faster than both baselines, and "the difference between Static and Frequency was not statistically significant." Excluding the top three target items, "the difference in selection time between MCTS (mean = 2454 ms) and Frequency (mean = 2799 ms) is 344 ms (i.e. Frequency is about 15% slower)."

Qualitatively: "15 participants commented that they noticed changes in the Frequency condition, but only 2 participants noticed how these changes were occurring." One said reordering "prevented them from remembering item locations."

**Verdict: confirms and sharpens the knowledge base.** Classic frequency-based reordering — the Office 2000 pattern Rule 6 forbids — was *not* faster than static in 2021 either, and was 15% slower for anything outside the promoted head. The "7 of 20 did not notice the adaptation" result from McGrenere et al. 2002 now has a 2021 sibling: 15 of 18 noticed *that* it changed and only 2 understood *why*. The gain that did appear came from a policy that adapted rarely and adapted *grouping*, not position ranking — a 5.3% improvement over static (121 ms), far short of what the promise of personalisation implies.

### 2.2 Gaspar-Figueiredo, Vanderdonckt, Abrahão & Insfran (2025), *User experience with adaptive user interfaces: Comparing performance and preferences*, Journal of Systems and Software 231 — T1, abstract via OpenAlex only (ScienceDirect blocked)

Forty participants used adaptive and static menus with EEG recording; performance was menu-item selection time, alongside four EEG-derived measures (cognitive load, engagement, attraction, memorisation). The reconstructed abstract reports **no significant performance advantage or disadvantage for adaptive menus relative to static ones**. Its framing is the preference-versus-performance trade-off — the same trade-off Findlater & McGrenere reported in 2004.

**Verdict: confirms Findlater & McGrenere (2004), slightly softened.** 2004 found static *significantly faster* than adaptive; 2025 finds no significant difference either way. Twenty-one years of better modelling has moved spatial adaptation from "worse" to "no better." That is the honest state of the art, and it is not an argument for shipping it.

### 2.3 Gaspar-Figueiredo, Fernández-Diego, Abrahão & Insfran (2025), RL-based AUI framework with human feedback, arXiv:2504.20782 — T1-pre

33 participants, two domains (e-learning, trip planning), adaptive UIs with per-user RL agents shaped by explicit human feedback versus non-adaptive UIs. Verbatim: "The results suggest that incorporating human feedback into RL-driven adaptations significantly enhances UX." No effect sizes in the abstract; full text not retrieved.

**Verdict: refines Rule 6's exception clause.** The adaptation that won was the one the user could correct. This is the 2025 restatement of McGrenere et al. (2002): the user-shaped interface beats the system-shaped one.

### 2.4 What is genuinely missing

No 2018–2026 study manipulates prediction accuracy as an independent variable. Searches for experiments crossing accuracy levels (50/70/75/90%) against adaptive versus static layouts returned nothing in the HCI literature; the closest modern analogue is the AI-assisted-decision-making literature on reliance and trust calibration, which measures decision accuracy rather than interface adaptation. **The 70% number should continue to be cited as Gajos et al. 2008 and explicitly labelled un-replicated.** Anyone repeating it as though it were current is over-claiming.

---

## 3. Does spatial stability still matter?

Yes, and the evidence is now broader than menus.

- **Todi et al. 2021 (T1)** — quantified above: position-shuffling cost 344 ms (15%) on non-promoted items, and near-total opacity to users.
- **Kim, Chowdhury, Song & Suh, IUI 2026, "In-Situ Adaptive Interfaces for Online Browsing" (T1; ACM blocked, abstract via OpenAlex plus search summary).** ReLay adapts information hierarchy, information granularity and session-based ordering from inferred browsing intent, applying changes automatically with user override. Two-phase study, 10 participants: "participants welcomed adaptive changes when they demonstrated transparency, consistency, and reversibility," and — the sharpest line in this sweep — participants treated control "as calibration" rather than as error correction, "verifying system behavior before reliance."
- **Sahraoui, arXiv:2412.12389 (T1-pre).** Verbatim: "Adaptive user interfaces adapt their contents, presentation, or behavior mostly in a sudden, fluctuating, and abrupt way, which may cause negative effects on the end users, such as cognitive disruption. Instead, adaptivity should be regular, constant, and progressive." Evaluated with only ten practitioners; treat as a design position, not evidence.
- **Lee, Abbas, Lee, Kim & Chen, MAESTRO, UIST 2026 (T1-pre/T1).** A conversational agent that adapts the GUI beside the dialogue using "in-place operators (augment, sort, filter, and highlight) to the existing GUI according to preference strength." Controlled experiment, N=33, movie ticketing: bookings "left fewer hard preferences unmet" and users "made fewer selections that violated their stated preferences," but "task success rate and completion time did not differ significantly." Voice mode "increase[d] users' active engagement as well as their mental burden."
- **Generative UI regeneration (T3/T2).** NN/g's Moran & Gibbons (2024-03-22) state the risk plainly: "As Gen UI alters the interface based on your needs, you could be shown a different UI every time you use a website. This constant relearning of the interface might cause frustration." A 2026 MDPI systematic review of twenty studies (2021–2025) on generative no-code tools reports that identical prompts frequently produce substantially different interfaces across tools and across repeated runs of the same tool; the paper itself could not be fetched (403), so this is ranked low and flagged as second-hand.

**Verdict: confirms Findlater et al. (2009) and Rule 6's "nothing changes place on its own."** The 2026 state of the art has converged independently on the ephemeral-adaptation insight: MAESTRO's permitted operators are *highlight, sort, filter, augment in place*, not relocate; ReLay's acceptance conditions are transparency, consistency and reversibility. Nobody found a way to make relocation pay. The one refinement worth adding to the knowledge base: **reversibility has joined visibility as an acceptance condition.** The 2002–2009 literature asked whether users noticed adaptation; the 2026 literature finds users accept it when they can undo it and use the undo to calibrate trust.

---

## 4. Suggestions versus automatic changes: what users actually accept

This is where the post-2018 record is richest, and where it changes the shape of Rule 6's guidance.

### 4.1 Field acceptance of AI suggestions is about 30%, not 70%

**GitHub and Accenture (T2, fetched).** In the enterprise deployment study: "81.4% of developers installed the GitHub Copilot IDE extension on the same day"; "96% of those who installed the IDE extension started receiving and accepting suggestions on the same day"; "67% of respondents reported utilizing GitHub Copilot at least 5 days per week" (mean 3.4 days). Developers "accepted approximately 30% of GitHub Copilot's suggestions," retained "88% of GitHub Copilot-generated characters," and 90% "reported that they committed code suggested by GitHub Copilot." Reported alongside an 8.69% increase in pull requests per developer and a 15% increase in merge rate. GitHub's own figures elsewhere put acceptance at 28.9% in the first three months rising to 32.1% in the next three (search summary, not fetched).

**Comparison to the anchor:** Gajos et al. (2008) measured *utilisation of the adaptive region when it contained the right button* (70.6% at 50% accuracy, 86.4% at 70%). Copilot's ~30% is *acceptance of everything offered*, including offers made when nothing was wanted. The two numbers are not commensurable, and the knowledge base should not let them be compared directly. What is comparable is the direction of the design lesson: the modern systems that people keep using are the ones where ignoring a suggestion is free.

### 4.2 Lab and field studies of proactive assistance

**Pu, Lazaro, Arawjo, Xia, Xiao, Grossman & Chen, CHI 2025, "Assistance or Disruption?" (T1, full HTML fetched).** 18 CS students, within-subjects, three conditions (PromptOnly / CodeGhost proactive / Codellaborator proactive with visual presence). Across 398 proactivity instances: **53.3% effective engagement, 34.7% ignored, 12.1% disruptions.** Engagement varied sharply by trigger: multi-line code change 73.1%, user-written comment 69.2%, program execution 66.7%. Disruption ratings (1–7): PromptOnly 1.56, Codellaborator 3.78, CodeGhost 4.61 (χ²=22.1, p<0.001). Awareness of the AI's actions fell from 6.56 (PromptOnly) to 5.44 (visual presence) to 4.17 (no visual presence), p<0.001. Time to interpret a suggestion dropped from 34.5s to ~19s under proactivity, but task completion time did not differ. Half the participants (9) "shifted to observer/reviewer roles relying heavily on AI," and half raised concerns about "over-reliance, loss of ownership, and diminished code understanding."

**Kuo, Sergeyuk, Chen & Izadi, 2026, five-day field study of proactive AI in an IDE (T1-pre, HTML fetched).** 15 professional developers, 5 days in the wild, 5,732 interaction records across 229 interventions. Engagement by trigger: post-commit 52%; ambiguous prompt 46% engaged / 23% dismissed / 31% ignored; declined AI edit 31% engaged / 62% dismissed. Proactive suggestions were interpreted in 45.4s mean versus 101.4s for reactive ones (p=0.0016, r=0.533). SUS 72.8 (95% CI 64.1–81.5); 87% found it easy to use and 66% helpful, but **only 27% rated it reliable.** Participants "valued confirmation before running suggestions, rejecting automatic chat invocation as intrusive," and mid-task interventions felt disruptive while post-commit ones aligned with an evaluative mindset.

**Oh, Kim, Kim, Im & Lee, CHI 2024, "Better to Ask Than Assume" (T1, abstract via OpenAlex).** Wizard-of-Oz smart-home study of proactive voice assistants: soliciting explicit consent outperformed autonomous action on user satisfaction and sense of agency.

**Alves, Duarte, Montague & Guerreiro, 2026, arXiv:2603.19196 (T1-pre, fetched).** 12 interviews with vignette probes on UI personalisation: "people can independently identify personalization opportunities but prefer system support through visual personalization suggestions." Interaction data helped users "weigh benefits against effort" and increased "the transparency of system suggestions."

**Liu, Karoui, Draxler, Kreuter & Chiossi, 2026, arXiv:2602.00880 (T1-pre, fetched).** N=32 within-subjects; a system that used electrodermal activity and mouse movement to time LLM help. "Aligned-adaptive assistance improved response accuracy by 21%, reduced false negative rates from 50.9% to 22.9%, and improved perceived efficiency, dependability, and benevolence," compared with misaligned and random timing. This is the one modern result that behaves like an accuracy effect: holding the *content* of help constant and varying only whether its *timing* matched the user's state produced a 21-point accuracy swing.

**Fink, Newman & Haran, Computers in Human Behavior 156 (2024), "Let me decide" (T1, abstract via OpenAlex; full text blocked).** Distinguishes perceived loss of autonomy from perceived loss of personal control, and finds autonomy salience depends on task type: autonomy loss bites on "meaning-oriented tasks (e.g., shopping)", control loss on "utility-oriented tasks (e.g., driving)". Search summaries attribute to this line of work the finding that offering multiple recommendations rather than one raises acceptance; that specific number could not be verified.

**Verdict: refines the knowledge base materially.** The old rule was "adaptation must be visible, spatially stable and above ~70% accuracy." The 2024–2026 evidence supports a sharper formulation: **the interface may propose; only the user disposes; and the proposal must arrive at a task boundary.** Every study above found the same trigger pattern — post-commit, after a program run, after a written comment, at a decision point — and the same failure mode: mid-task interruption. Rule 6's "if adaptation is used at all, it adds a 'Recent' section; it never reorders or removes" is compatible with all of this, and can now be extended: *a suggestion shown at a task boundary, dismissable at zero cost, is the only adaptive pattern with positive field evidence since 2018.*

---

## 5. The new adoption ceiling: what field data says about AI features

**Dillon, Jaffe, Immorlica & Stanton (NBER WP 33795, May 2025), "Shifting Work Patterns with Generative AI" (T2/T1-pre, full PDF read).** Verbatim: "We present evidence from a field experiment across 66 firms and 7,137 knowledge workers. Workers were randomly selected to access a generative AI tool integrated into applications they already used at work for email, meetings, and writing. In the second half of the 6-month experiment, the 80% of treated workers who used this tool spent two fewer hours on email each week."

The adoption numbers matter more here than the productivity ones: "The median treated worker used Copilot in 39% of the weeks they had access to it during the study (33% of the weeks in months 4-6)... 5% of treated workers used Copilot every week, while 20% never used it at all... overall usage peaked at 55% of treated workers in the first weeks of the study."

**Verdict: confirms the population model in core-model §7 with new evidence.** The knowledge base already carries Spool's "<5% of users ever changed a setting" and Pendo's "6% of features generate 80% of clicks." Add this: in a randomised enterprise deployment, after six months, one in five never touched the AI feature at all and only one in twenty used it every week. Long-tail usage distributions did not change because the feature became intelligent. Any personalisation strategy that depends on most users engaging with an AI surface is betting against this number.

---

## 6. Generative UI: what the evidence supports, and what it does not

**Leviathan et al. (Google Research), arXiv:2604.09577, "Generative UI: LLMs are Effective UI Generators" (T1-pre, fetched).** 92 prompts sampled from LMArena, two raters each on a three-point preference scale, plus 20 information-seeking prompts. Generated interfaces were preferred over markdown output in **82.8%** of cases and **90.5%** on the information-seeking set, but lost to expert-crafted human interfaces (35.3% preference; ELO 1736.2 versus 1800.3), rated "at least comparable in 50% of cases". Model capability dominates feasibility: generation error rate 0% with the frontier model versus 29% with a small fast one.

**Chen, Zhang, Zhang, Shao & Yang, ACL 2026 Findings, "Generative Interfaces for Language Models" (T1, abstract fetched).** Generative interfaces beat conversational ones with "up to a 72% improvement in human preference" on multi-turn, information-dense and exploratory tasks.

**Cao, Jiang & Xia, CHI 2025, "Generative and Malleable User Interfaces" (T1; arXiv abstract fetched, study details via search summary).** 8 participants; users "develop highly personalized and dynamic information spaces" and can modify generated UIs by natural language and direct manipulation.

**Peng, Das, Bigham & Wu, arXiv:2604.09876, "Efficient Personalization of Generative User Interfaces" (T1-pre, fetched).** 20 professional designers made pairwise judgements over 600 generated UIs: "substantial disagreement across designers (average kappa = 0.25)," with designers interpreting principles such as hierarchy differently despite shared vocabulary. A learned per-person preference model then beat direct prompting for 12 new designers.

**Verdict: too early to change any rule, and the evidence has a known bias.** Every generative-UI result above is a *preference* judgement — often by raters who never had to do the task twice. Core model §6.2 already names this failure mode: "The aesthetic-usability effect... A clean first layer scores well in preference tests and demos while masking that experts can no longer find what they need. Measure PD with task time, error rate and time-to-discovery, not satisfaction alone." Note that the only generative-UI study that measured task time (MAESTRO, §3) found no difference, and the only one that measured it against human experts found the generated version losing. The κ=0.25 result is the strongest practical caution: if professional designers agree only weakly on what a good generated interface looks like, a single generated layout cannot be right for everyone, and a *stable* one at least becomes learnable.

---

## 7. Trust, predictability and control with LLM-based interfaces

- **Reliability perception lags usability.** Kuo et al. 2026: 87% found the proactive assistant easy to use, 66% helpful, **27% reliable.** Ease of use is not trust.
- **Awareness is the cost of proactivity.** Pu et al., CHI 2025: self-reported awareness of what the AI had done fell from 6.56/7 (user-initiated) to 4.17/7 (silent proactive), recovering to 5.44 when a visual presence indicator showed where the AI was working. This is the 2025 restatement of McGrenere et al. (2002)'s seven users who never noticed the menus adapting — and it shows the fix is a visible locus of activity.
- **Control is used for calibration, not correction.** Kim et al., IUI 2026 (§3).
- **Personalisation preferences are heterogeneous.** Bo, Xu, Chatterjee, Passarella-Ward, Kulshrestha & Shin, arXiv:2505.04260 (T1-pre): within-subjects study, N=14, of three steering interfaces varying on agency (user-led vs system-driven) and fluidity (static vs adaptive). Steering aligned better with preferences than prompting alone, but users held "diverse values regarding control, persistence, and transparency in LLM personalization" — no single design satisfied everyone. Compare Findlater & McGrenere (2004): 55% adaptable, 30% adaptive, 15% static. The split has not gone away.
- **Agents fail on mental models before they fail on capability.** Shome, Krishnan & Das, arXiv:2509.14528 (T1-pre): review of 102 commercial AI agents plus usability testing with 31 participants on two popular agents; failures were "agent capabilities that were misaligned with user mental models" and agents "lacking the meta-cognitive abilities necessary for effective collaboration."
- **Adaptive features are often simply not noticed.** Jamali, Dascalu, Harris & Wu, *Frontiers in Computer Science* (2025), 23 participants across Khan Academy, Coursera and Codecademy: "participants found the specific AI-driven adaptive features on all platforms to be subtle and minimally impactful, with core platform interactivity being a more dominant factor," rating adaptive helpfulness at a neutral ~3.5/5 on all three platforms.

---

## 8. What should change in the knowledge base

1. **Rule 6 stands.** No post-2018 evidence supports reordering or relocating controls by inferred history. Two independent 2021 and 2025 experiments found spatial adaptation no faster than static, and frequency reordering 15% slower on the tail.
2. **Re-base the justification.** Cite Todi et al. (2021) and Gaspar-Figueiredo et al. (2025) alongside Findlater & McGrenere (2004). Keep the Gajos 70% figure but keep the disclaimer: it is still un-replicated in 2026.
3. **Add reversibility to the acceptance conditions.** Current text says adaptation must be "spatially stable, visibly signalled, and demonstrably above roughly 70% accuracy." Make it: spatially stable, visibly signalled, *reversible in one action*, and offered at a task boundary.
4. **Add the new numbers to core-model §6.3:** Copilot field acceptance ~30%; proactive-suggestion engagement 53.3% lab / 52% post-commit field, with 34.7% ignored and 12.1% disruptive; median Copilot use 39% of weeks with 20% never using it; Todi's 2283/2298/2162 ms and the 15% tail penalty; generative UI preferred over markdown 82.8% but losing to human experts 35.3%; designer agreement on generated UI quality κ=0.25.
5. **Rule 8 gains an AI-era instance.** "Fade the scaffold" now covers AI suggestions: acceptance is highest at task boundaries (post-commit 52%, multi-line change 73.1%) and lowest mid-task, so a suggestion surface should be a boundary event, not an ambient one.

---

## Still unknown

- **No modern accuracy threshold.** Nothing since 2018 crosses prediction accuracy with adaptive-versus-static layout. The 70% number is 18 years old and has never been tested on an LLM-driven predictor.
- **No longitudinal generative-UI study.** Every generative-UI evaluation found is single-session and preference-based. Nobody has measured whether a user who gets a differently-generated interface on visit 2 and visit 10 gets slower, or whether learning ever occurs.
- **No B2B field study of AI-arranged navigation.** The field studies found are coding assistants and Office copilots. No published field data on AI-reordered navigation, AI-composed dashboards or AI-recommended settings in enterprise admin surfaces.
- **No modern successor to CommunityCommands.** No post-2018 evaluation of LLM-based *feature or command recommendation* against the awareness cost Findlater & McGrenere (2010) documented.
- **No replication of ephemeral adaptation.** The 500 ms gradual-onset technique has not been re-tested since 2009, nor tried with LLM predictions, despite 2026 systems converging on the same principle by other means.
- **Acceptance versus utilisation remains unmeasured on the same task.** Nobody has measured Gajos-style utilisation (use of the adaptive region when it holds the right item) and Copilot-style acceptance in one study, so the two bodies of numbers cannot yet be reconciled.
- **Blocked sources.** The full texts of Gaspar-Figueiredo et al. (JSS 2025), Kim et al. (IUI 2026), Yanez et al. (*Computer Graphics Forum* 2025, user-adaptive visualisations survey), Fink et al. (CHB 2024) and the MDPI generative-consistency review could not be fetched; their claims here rest on abstracts and should be verified with library access.

---

## Bibliography

Alves, S., Duarte, C., Montague, K., & Guerreiro, T. (2026). Exploring the role of interaction data to empower end-user decision-making in UI personalization. arXiv:2603.19196. https://arxiv.org/abs/2603.19196

Bo, J. Y., Xu, T., Chatterjee, I., Passarella-Ward, K., Kulshrestha, A., & Shin, D. (2025/2026). Steerable chatbots: Exploring personalization control interfaces via LLM activation steering. arXiv:2505.04260. https://arxiv.org/abs/2505.04260

Cao, Y., Jiang, P., & Xia, H. (2025). Generative and malleable user interfaces with generative and evolving task-driven data model. *CHI 2025*. https://doi.org/10.1145/3706598.3713285 ; preprint https://arxiv.org/abs/2503.04084

Chen, J., Zhang, Y., Zhang, Y., Shao, Y., & Yang, D. (2025/2026). Generative interfaces for language models. *Findings of ACL 2026*. arXiv:2508.19227. https://arxiv.org/abs/2508.19227

Chen, V., Zhu, A., Zhao, S., Mozannar, H., Sontag, D., & Talwalkar, A. (2025). Need help? Designing proactive AI assistants for programming. *CHI 2025*. https://doi.org/10.1145/3706598.3714002 ; preprint https://arxiv.org/abs/2410.04596

Dillon, E. W., Jaffe, S., Immorlica, N., & Stanton, C. T. (2025). Shifting work patterns with generative AI. NBER Working Paper 33795. https://www.nber.org/system/files/working_papers/w33795/w33795.pdf

Fink, L., Newman, L., & Haran, U. (2024). Let me decide: Increasing user autonomy increases recommendation acceptance. *Computers in Human Behavior, 156*. https://www.sciencedirect.com/science/article/abs/pii/S0747563224001122

Gaspar-Figueiredo, D., Abrahão, S., Insfrán, E., & Vanderdonckt, J. (2023). Measuring user experience of adaptive user interfaces using EEG: A replication study. *EASE 2023*. arXiv:2306.03525. https://arxiv.org/abs/2306.03525

Gaspar-Figueiredo, D., Fernández-Diego, M., Abrahão, S., & Insfran, E. (2025). Integrating human feedback into a reinforcement learning-based framework for adaptive user interfaces. arXiv:2504.20782. https://arxiv.org/abs/2504.20782

Gaspar-Figueiredo, D., Vanderdonckt, J., Abrahão, S., & Insfran, E. (2025). User experience with adaptive user interfaces: Comparing performance and preferences. *Journal of Systems and Software, 231*. https://www.sciencedirect.com/science/article/pii/S0164121225002675

GitHub & Accenture (2024). Research: Quantifying GitHub Copilot's impact in the enterprise with Accenture. https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/

Jamali, H., Dascalu, S. M., Harris, F. C., & Wu, R. (2025). AI-powered adaptive learning interfaces: A user experience study in education platforms. *Frontiers in Computer Science*. https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2025.1672081/full

Kim, E., Chowdhury, S. S., Song, H., & Suh, B. (2026). In-situ adaptive interfaces for online browsing: Design dimensions for intent-responsive automation and user control. *IUI 2026*. https://doi.org/10.1145/3742413.3789092

Kuo, N., Sergeyuk, A., Chen, V., & Izadi, M. (2026). Developer interaction patterns with proactive AI: A five-day field study. arXiv:2601.10253. https://arxiv.org/abs/2601.10253

Lee, S., Abbas, A., Lee, S. W., Kim, Y.-H., & Chen, Y. (2026). MAESTRO: Adapting GUIs and guiding navigation with user preferences in conversational agents with GUIs. *UIST 2026*. arXiv:2604.06134. https://arxiv.org/abs/2604.06134

Leviathan, Y., Valevski, D., Kalman, M., Lumen, D., Segalis, E., Molad, E., Pasternak, S., Natchu, V., Nygaard, V., Venkatachary, S., Manyika, J., & Matias, Y. (2026). Generative UI: LLMs are effective UI generators. arXiv:2604.09577. https://arxiv.org/abs/2604.09577

Liu, A., Karoui, Y., Draxler, F., Kreuter, F., & Chiossi, F. (2026). Sensing what surveys miss: Understanding and personalizing proactive LLM support by user modeling. arXiv:2602.00880. https://arxiv.org/abs/2602.00880

Moran, K., & Gibbons, S. (2024, March 22). Generative UI and outcome-oriented design. Nielsen Norman Group. https://www.nngroup.com/articles/generative-ui/

Oh, J., Kim, W.-S., Kim, S., Im, H., & Lee, S. (2024). Better to ask than assume: Proactive voice assistants' communication strategies that respect user agency in a smart home environment. *CHI 2024*. https://doi.org/10.1145/3613904.3642193

Peng, Y.-H., Das, S., Bigham, J. P., & Wu, J. (2026). Efficient personalization of generative user interfaces. arXiv:2604.09876. https://arxiv.org/abs/2604.09876

Pu, K., Lazaro, D., Arawjo, I., Xia, H., Xiao, Z., Grossman, T., & Chen, Y. (2025). Assistance or disruption? Exploring and evaluating the design and trade-offs of proactive AI programming support. *CHI 2025*. https://doi.org/10.1145/3706598.3713357 ; preprint https://arxiv.org/abs/2502.18658

Sahraoui, A. E. A. (2024). A model-based approach to assess regular, constant, and progressive user interface adaptivity. arXiv:2412.12389. https://arxiv.org/abs/2412.12389

Shome, P., Krishnan, S., & Das, S. (2025/2026). Why Johnny can't use agents: Industry aspirations vs. user realities with AI agents. arXiv:2509.14528. https://arxiv.org/abs/2509.14528

Todi, K., Bailly, G., Leiva, L. A., & Oulasvirta, A. (2021). Adapting user interfaces with model-based reinforcement learning. *CHI 2021*. https://doi.org/10.1145/3411764.3445497 ; preprint https://arxiv.org/abs/2103.06807

Yanez, F., et al. (2025). The state of the art in user-adaptive visualizations. *Computer Graphics Forum*. https://onlinelibrary.wiley.com/doi/10.1111/cgf.15271 (not fetched; listed for follow-up)
