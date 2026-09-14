# Gaps We Accept

*Ten things this knowledge base asserts, or leans on, without evidence that meets its own standard. Each entry says what is missing, what we stand on instead, and the smallest study that would close it. Nothing here is a reason to stop shipping. It is a reason to keep the claim labelled, and to know which number would change a decision if someone measured it. Compiled 14 September 2026 from the "Still unknown" sections of sweeps [08](sources/08-sweep-adaptation-llm-era.md) to [15](sources/15-sweep-enterprise-field-studies.md).*

---

## 1. The 70% accuracy figure

**Missing.** No study between 2018 and 2026 varies an adaptive interface's prediction accuracy and measures where adaptation overtakes a static layout. The threshold in rule 6 is Gajos et al. (CHI 2008): eighteen years old, desktop toolbars, never tested against an LLM-driven predictor. The two modern experiments (Todi 2021, Gaspar-Figueiredo 2025) did not manipulate accuracy; they found spatial adaptation losing or tying regardless of it.

**We stand on.** Two independent findings that relocation costs more than prediction repays, which makes the threshold moot for anything that moves. It still matters for things that are added rather than moved.

**What would close it.** One within-subjects study crossing simulated accuracy (50 / 70 / 90%) against static, in-place highlight and relocation, measuring selection time and error rate. Roughly 40 participants, and technically possible since 2008.

## 2. Promotion triggers

**Missing.** Nobody has manipulated the trigger that moves a user from a reduced layer to the full one and measured who moves. User-initiated, usage-inferred, role-seeded and milestone-based promotion have never been arms of one experiment. Clark and Matthews (2005) is still the only paper, and it is old.

**We stand on.** Three indirect results: temporary full exposure moves shortcut use from 9.79% to 86.20% in one session and holds 73.09% after removal; signifiers and hints do nothing; removing the alternative path works completely and nobody goes back. Plus ScaffoldUI's warning that the cost of promotion is proportional to how different the two layers are.

**What would close it.** A four-arm field experiment in one product, 8–12 weeks, measuring who reaches layer 2 and stays. Nobody publishes layer-switching rates either, so one vendor releasing its "enable advanced view" and revert rates would be new evidence.

## 3. Visible-versus-hidden locks

**Missing.** The central claim of the gated-features pattern — that a locked feature stays visible where it would live — has no controlled test anywhere in the 2018–2026 literature. Not on conversion, satisfaction, complaint volume or time-to-discovery, and none in the opposite direction either.

**We stand on.** Vendor guidance (GitLab Pajamas, Stigg, Orb) and the argument that discovery is the sale. The one evidence-shaped counter-argument is the versioning-unfairness literature, which finds subtraction is judged unfair exactly when the degraded version closely resembles the full one — the condition a visible lock creates.

**What would close it.** An A/B test in one multi-tier SaaS product: locked-and-visible against absent, measured on upgrade rate *and* on 90-day retention among users who will never upgrade. The second metric is the one nobody has looked at.

## 4. Settings-usage benchmarks

**Missing.** No post-2018 figure of any tier. Pendo, Userpilot, Amplitude, Mixpanel and WalkMe publish no settings-page visit rate, no preference-change rate, no metric on configuration surfaces at all.

**We stand on.** Spool's "fewer than 5% ever changed a setting" (UIE, 2011), a fifteen-year-old anecdote about consumer Microsoft Word. It carries rule 6's consequence and rule 8's test, and the Apollo settings map in memo 07 sits on top of it. Firefox Proton shows the failure mode: a control was nearly deleted because engagement was *assumed* low, and the measurement bug was never run.

**What would close it.** Any product-analytics vendor publishing a settings-visit and preference-change distribution. Failing that, one B2B product publishing its own.

## 5. A re-test of the hidden-navigation study

**Missing.** Nobody has replicated Pernice and Budiu (2016). The 27%-versus-48–50% usage gap, the 20-point success penalty and the 39% time penalty are ten years old, were measured on six news and e-commerce websites with 179 participants, and average over sites whose individual usage ranged from 17% to 89%. The two articles usually cited as follow-ups are per-site breakdowns of the same study, and NN/g's 2025 icon work explicitly declines to speak to task time or success.

**We stand on.** The 2016 numbers plus consistent NN/g guidance through 2024 ("If you don't need to hide navigation, don't") and the left rail as the expected location for application navigation.

**What would close it.** The same protocol on B2B applications rather than websites, with hidden, visible and combo conditions. Combo scored best or equal-best in 2016 and has never been re-tested either.

## 6. Command-palette adoption

**Missing.** No vendor publishes what share of active users invoke ⌘K in a period, how it varies by tenure or role, or what share of navigation events it carries. Superhuman and Retool published design principles and no usage data. GitHub's palette is still preview-grade and off by default; GitLab's is folded into the existing search box.

**We stand on.** The rule-8 claim that the palette is the expert accelerator, which the navigation sweep downgraded: a surface off by default cannot be a reliable findability route.

**What would close it.** One product publishing weekly palette-invoking users as a share of weekly actives, split by tenure. Equally absent: in-product global search usage rates in B2B SaaS.

## 7. Dense versus disclosed, controlled

**Missing.** Nothing between 2018 and 2026 compares a dense build and a progressively-disclosed build of the same professional tool, with its own all-day users, on task time and errors — not for trading terminals, clinical systems, IDEs, sales tools or enterprise data tables. Nor does anyone publish a density-toggle adoption rate: Salesforce, AWS, Google, Atlassian, GitHub and Mozilla all ship one and none has released the number.

**We stand on.** NN/g's content-dispersion study (13 sessions, marketing pages), Khairat's fixation data (81 ICU providers, varying case complexity rather than interface density), four documented vendor reversals, and near-unanimous practitioner opinion since 2022 that has produced zero measurements.

**What would close it.** Two builds of one real tool, its own users, a fortnight each, measuring task time, errors and fixations. Or, far cheaper, any vendor publishing what fraction of its users switch density.

## 8. Whether anyone opens an agent trace

**Missing.** No study measures open rate, dwell time or depth on an agent activity log. Every oversight study scripted the exposure or inferred attention from outcomes. There is no approval-queue telemetry from a shipped product either — no approval rate, time-to-decision or queue-abandonment figure — and the 23.9% intervention number is a 48-person lab study with planted attacks. Nothing measures whether a token meter or a spend cap changes behaviour: the economics are documented, the interface is not.

**We stand on.** The rubber-stamping results, which say disclosure beyond review capacity is equivalent to hiding, but not how much of a trace anyone reads.

**What would close it.** Instrumentation on any shipped agent product: trace open rate, scroll depth, time-to-approve, and the share of approvals under one second.

## 9. Email and draft acceptance rates

**Missing.** Nothing published with a stated method on acceptance of AI-drafted email, sales messages or documents. Microsoft has randomised-trial data across 58 firms and 6,317 employees and reports time saved instead.

**We stand on.** Acceptance from adjacent surfaces: roughly 30% for inline code suggestions, 36.4% for AI code-review comments, 16.6% against a 56.5% human baseline in the same queue. The planning assumption that two-thirds of what an AI feature offers will be declined rests entirely on code.

**What would close it.** One vendor publishing accept, edit and discard rates for AI-drafted text, with a denominator.

## 10. The paywalled papers

Claims in the sweeps that rest on abstracts or search summaries because the full text could not be fetched. Verify with library access before quoting any of them as a measurement.

- **Load-bearing.** Gaspar-Figueiredo et al., *JSS* 231 (2025), the EEG adaptive-menu result now cited in rule 6; Lewis et al., *CHI 2020* (KeyMap), which carries rule 8's retention number; Vance et al., *MIS Quarterly* 42(2) (2018), the habituation curve behind rule 4's frequency clause.
- **Likely to add numbers.** Gašparič & Ricci, *IEEE Access* (2020) and Vella & Porter, *ECCE 2022*, both probable sources of acceptance rates; Forsey et al., *Ergonomics in Design* 33(3) (2025), the only post-2018 layered-interface experiment; Runge et al.'s freemium field experiment (SSRN); *Technology in Society* (2019) on versioning by subtraction.
- **Context.** Kim et al., *IUI 2026*; Yanez et al., *CGF* (2025); Bailly, Khamassi & Girard, *TOCHI* (2022); Lam et al., *CHI 2021*; Li et al., *TOCHI* 29(5) (2022); Green, *CLSR* 45 (2022); the *ACM Computing Surveys* alert-fatigue review (2025); the CSCW 2025 process-transparency study.
- **Quarantined.** Murty et al., *Harvard Business Review* (2022) on application toggling. The "1,200+ daily app toggles" figure must not enter this knowledge base until someone reads the original.
- **Published but unretrieved.** Pendo's 25th, 50th and 75th percentiles and Amplitude's full benchmark widget, both JavaScript-rendered.

---

**Also open, with less at stake:** B2B feature-removal outcomes (the reason the 3–5% threshold is labelled a convention); role-differentiated navigation against one global IA; per-user feature-count distributions replicating McGrenere and Moore; cross-tenant variance in one product; staged versus all-at-once onboarding; declared versus inferred segmentation in one test; mega-menu experiments since 2010; directness and first-click benchmarks with a published corpus.
