# Sweep: onboarding paths with published numbers, 2018–2026

Research memo compiled 2026-09-13 under `SWEEP-BRIEF.md`. Gap closed: experiments and case studies published since 2018 that report *numbers* for persona/role questions at sign-up, templates and presets at workspace set-up, deferred setup and gradual engagement, activation and time-to-value, checklists versus contextual guidance, and declared versus inferred segmentation.

Related older memo: `04-b2b-saas-practice-and-case-studies.md`, section 2 ("Product-led growth / onboarding vendors"), which collected vendor *guidance* on progressive onboarding but almost no measured results. This sweep supplies the measurements, and several of them cut against the guidance.

**Method and limits.** All sources below were fetched during this session unless marked "not fetched"; where a page returned 403 I say so and name the route used instead. The session exhausted its web-search budget partway through; the consequence is named in "Still unknown". Tiers are as the brief defines them: **T1** peer-reviewed, **T2** industry research with published numbers and a stated sample, **T3** practitioner essays and vendor claims without method.

---

## 1. The headline finding

The single most useful result found in this sweep is also the one that most complicates the knowledge base's current position.

**Airtable, reported 2023 (T2 — named practitioner, named company, stated experiment, full numbers member-gated but visible in the artifact preview).** Lauryn Motamedi, then Head of Product Growth at Airtable, published an experiment artifact on Reforge dated **19 January 2023** describing an onboarding change that asked new users their function and goal and then seeded the workspace with role-matched templates (project trackers for Product and Design) instead of a generic "Build Your First Airtable" flow. Fetched via the `r.jina.ai` text proxy after `reforge.com` returned 403 to a direct fetch.

The hypothesis, verbatim: "Providing personalized templates and examples in the new onboarding flow...will reduce time to value."

The result of iteration #1:

- **Onboarding completion rate: +15%**
- **Sharing and collaboration: −10%**

That is the whole point. Routing by declared persona made the first session easier to finish and made the product *less* of what Airtable actually is. The team re-cut the personalisation around multi-player and team use cases rather than around individual job titles, and iteration #2 reported **+15% completion and +10% activation** with the collaboration regression gone.

**Status: refines** two things the knowledge base already says. It refines `00-core-model.md` §7 and `RULES.md` rule 3 ("split by task frequency, not user skill"): the failure mode of persona routing is not only that intermediates refuse the identity, it is that a persona-shaped first session optimises a *single-player* metric and quietly suppresses the network behaviour the product depends on. And it refines memo 04 §2.2, where Appcues is quoted recommending "2–5 user paths" by "role or desired outcome" with no evidence attached: the one company case with a control group found that the obvious version of that advice cost something measurable.

It also supplies the first real example in this corpus of the brief's "what users declare versus what is inferred" question. What users declared (my role is Design) produced a worse product outcome than what the team inferred about the shape of the job (this is a multi-player workflow).

---

## 2. Peer-reviewed evidence (T1)

Academic work on *product* onboarding in the 2018–2026 window is thin, and almost none of it is in the CHI/CSCW venues the brief prefers. Two studies are directly relevant.

### 2.1 Kang & Cho, UIST '25 Adjunct — a persona question as a nudge

- Jinwoo Kang and Daegon Cho, "Digital Nudging in Mobile App Onboarding: Field Evidence on User Engagement," *Adjunct Proceedings of the 38th Annual ACM Symposium on User Interface Software and Technology* (UIST Adjunct '25), September 2025. DOI 10.1145/3746058.3758409.
- **Not fetched.** The ACM DL PDF and landing page both returned 403, as did ResearchGate. What follows is from search-result abstract text and is ranked accordingly.

Design: a large-scale field experiment over several months. The treatment group was shown a prompt on the **final onboarding screen asking them to select a usage type**; the control group moved straight past it. Reported outcome: the treatment group "exhibited significantly higher activity levels and more frequent visits immediately after sign-up and throughout the observation period," with the largest effect on day one and an effect that "gradually diminished but remained significant." The authors frame it as "a low-cost, sense-of-agency-preserving intervention."

No effect sizes, sample size or confidence intervals could be obtained without the PDF, so this is a **directional** result only.

**Status: confirms, weakly**, memo 04 §2.1's claim that Asana-style "collecting role and goal information upfront" tailors the first session usefully — and it adds the mechanism the vendors never name. The paper's own framing is that the *act of choosing* is the active ingredient (agency, commitment), not the tailoring that follows. That is a different causal story from "we showed you relevant features," and it is compatible with the Airtable result: the question helps, the persona-shaped content that follows may not.

### 2.2 Zhang & Duan 2025 — deferral at scale

- Ling Zhang and Jiang Duan, "Longer or shorter? A large-scale randomized field experiment on the impact of free trial duration on sustainable user conversion in the Freemium model," *Frontiers in Psychology*, 2025. Fetched from PMC.
- Design: randomised controlled trial, 3-day trial (control) versus 7-day trial (treatment). **680,588 new users across 190 countries, 18 July 2022 – 15 July 2024** (two-year observation).

Results:

| Outcome | Effect of the longer (deferring) condition |
|---|---|
| Free-trial adoption | **+11.098%** |
| Immediate conversion | no significant effect (0.241% vs 0.224%) |
| Delayed conversion | **+42.36%** |
| Overall conversion over two years | **+20.92%** |

This is not an onboarding-path experiment, but it is the largest clean randomised test found in the window on the question underneath Wes Bush's "Delay" move (memo 04 §2.6): does pushing the commitment step later cost you the commitment? Answer, in this setting: no — it costs nothing immediately and pays substantially later, and the payoff is invisible if you only measure the first session.

**Status: confirms** memo 04 §2.6 and §6.2 (Spool's $300 Million Button, 2009, which the knowledge base correctly flags as old and non-enterprise) with a modern, large-N, randomised result. It also carries a measurement warning that applies to everything else in this memo: the immediate metric moved not at all while the two-year metric moved 21%.

---

## 3. Benchmark reports with stated samples (T2)

Four vendors published onboarding benchmarks in this window with a real denominator. Together they give the first defensible picture of what "normal" looks like.

### 3.1 Amplitude, 2025 Product Benchmark Report

- Methodology, verbatim: "Over 2,600 companies across industries, regions, and company sizes"; "Data spans the months between September 2023 to September 2024"; customers who opted out were excluded. Read via two Amplitude blog posts (Michele Morales, 30 September 2025 and 9 November 2025) because the report itself sits behind a form.

Numbers:

- **Day-1 activation: ~21% at the 90th percentile, ~5% at the median** — "4x higher day-one activation than the median."
- Day-7 activation ~12% at the 90th percentile; day-14 ~9%.
- Enterprise products specifically: **12.4% day-7 retention top-decile versus 2.1% median**, "nearly a sixfold difference."
- Three-month retention: **18.5% at the 90th percentile versus 3.8% at the median.**
- "In just 14 days, as many as 91% of your new users may drop off."
- "More than 98% of users churn within two weeks if they haven't experienced value."
- **"69% of products with strong early activation were also strong three-month retention performers."**

**Status: overturns** the figure memo 04 §2.2 quotes from Appcues — "40-60% of users who sign up for a SaaS product will use it once and never return." On Amplitude's 2,600-company panel the median product loses far more than that: ~95% of new users are gone by day 1 and ~91% within 14 days. The Appcues number is not a benchmark, it is a rounded slogan with no sample behind it. The knowledge base should stop citing it.

The 69% correlation is the load-bearing one for the brief's "activation and time-to-value effects" question: early activation and three-month retention travel together across 2,600 products. It is a correlation, not a causal claim, and Amplitude does not present it as one.

### 3.2 Pendo, Product Benchmarks

- Methodology, verbatim: "aggregated and anonymized product data from 6,800+ applications across 2,500 Pendo customers." Percentiles are defined (25th low, 50th median, 75th high, 90th best-in-class) but only best-in-class values are exposed on the public page; medians are not printed.
- Best-in-class values: **guide engagement rate 60.2%**, **time to value 0.2 days**, **feature adoption rate 15.6%**.
- Definitions, verbatim: feature adoption is "Percentage of features that generate 80% of click volume"; time to value is "The time it takes for new users to experience their first moment of value"; guide engagement is "The percentage of users who interact with in-app guides and walkthroughs."

**Status: refines** the knowledge base's most-quoted statistic. `RULES.md` rule 1 and `00-core-model.md` §6.3 both cite "Pendo (2024): 6% of features generate 80% of clicks in the average product." Pendo's current benchmark page shows that the same metric reaches **15.6% in best-in-class products**. So 6% is the *average* concentration, not a law of software; the best products are roughly two and a half times less concentrated. That matters for rule 1's test ("what share of users touch it weekly"): the 6% figure describes a product with a large dead tail, and citing it as the target shape rewards exactly the bloat rule 8 tells you to delete.

### 3.3 Userpilot, SaaS Product Metrics Benchmark Report (2025 edition)

- Methodology, verbatim: "We've collected first-party data from pulling anonymized user data directly from Userpilot's Analytics Dashboards," 547 companies overall, with per-metric samples stated. Industries: AI & ML, Healthcare, CRM & Sales, HR, MarTech, FinTech & Insurance, EdTech. No study period given.

| Metric | Average | Median | n |
|---|---|---|---|
| Activation rate | 37.5% | 37.04% | 62 B2B SaaS |
| Time to value | 1 day 12 hrs | 1 day 1 hr 54 min | 62 |
| **Onboarding checklist completion** | **19.2%** | **10.1%** | **188** |
| Core feature adoption | 24.5% | 16.5% | 181 |
| Month-1 retention | 46.9% | 45.25% | 83 |

The 2024 edition of the checklist study (188 companies, 7 industries) added breakdowns: **27.1%, 20% and 15% completion for companies at $1–5M, $5–10M and $10–50M gross revenue** respectively, and **FinTech highest at 24.5%, MarTech lowest at 12.5%**. (The Medium mirror returned 403; these figures come from search-result extracts of that post and are ranked lower.)

By industry, activation ranged from **54.8% (AI/ML) to 5% (FinTech)**; product-led companies averaged 34.6% against sales-led 41.6%.

Note the tension between Userpilot's activation median (37%) and Amplitude's day-1 activation median (~5%). They are not measuring the same thing: Userpilot's "activation" is a customer-defined milestone reached at any point, Amplitude's is a return-and-act event on a specific day. Most of the T3 literature quotes them interchangeably.

### 3.4 Produktly, SaaS Onboarding & In-App Engagement Benchmarks 2026

The best-designed of the four, and the only one that publishes its own causal caveat.

- Methodology, verbatim: "Anonymized, aggregated usage data from the Produktly platform, January 1 to June 30, 2026. In that window, 464 companies produced tracked widget events, totaling 15.8 million tracked in-app interactions (step-by-step tour progress events excluded from that count). Produktly's own account is excluded from every number." Tour benchmarks required at least 100 distinct users starting tours per company and at least 50 started users per tour; the tour analysis covers 88 companies and 256 tours. Published 12 August 2026, updated 2 September 2026.

Findings:

- Median tour completion **29%** per company (25th percentile 15%, 75th 55%); across 256 individual tours, median **26%**.
- **Completion by step count: 1–2 steps 73%, 3–5 steps 38%, 6–8 steps 25%, 9+ steps 8%.** Their summary: "Every extra step is a place to leave."
- **Completion by start type: user-initiated 69%, mixed 32%, auto-started 23%.**
- Tooltips / smart tips: "The median tip was opened once per 1,000 impressions (0.1%)." The 75th percentile tip reached 1%, the 90th 7.3%. Their conclusion, verbatim: **"Tooltips are ambient reference, not a delivery channel."**
- NPS surveys convert 4.3% of impressions into a response; announcements collect 43% of total impressions within 48 hours.

Crucially, on the pull-versus-push gap they write, verbatim: "Users who choose to open a tour have already told you they are interested. Auto-started tours reach everyone, including users who never asked for a tour."

**Status: confirms, with numbers**, two existing claims. It confirms `RULES.md` rule 2 and Budiu's wizard guidance (memo 04 §1.6) in the staged-disclosure domain: completion decays from 73% to 8% between a two-step and a nine-step sequence, which is the same "stop early" shape Nielsen argues for hierarchical disclosure, measured on 256 real flows. And it confirms Laubheimer's push-versus-pull distinction (memo 04 §1.7, "Push revelations are well-named: they are typically pushy, devoid of context, and intrusive") with a 3x completion gap — while being honest that the gap is contaminated by self-selection, which Laubheimer's piece never had to address because it had no numbers at all.

It **refines** rule 6 ("prefer stable, user-controlled disclosure over inferred adaptation"). The 69/23 split is the strongest modern support for user-initiated over system-initiated disclosure, but it is not causal evidence, and the memo should not be used to claim it is.

---

## 4. Company experiments with published numbers (T2/T3)

### 4.1 Duolingo — deferring sign-up (origin pre-2018; flagged as old)

First Round Review, "The Tenets of A/B Testing from Duolingo's Master Growth Hacker," published 17 July 2017, **updated 23 November 2024**. Gina Gotthilf, then VP Growth.

Verbatim: "We found that by allowing users to experience Duolingo *without* signing up — do a lesson, see the set of skills that you can run through — we could increase those sign-up metrics significantly." And: "Simply moving the sign-up screen back a few steps led to about a 20% increase in DAUs."

The refinement is the interesting part for this sweep. The original screen had "a big red button at the bottom of the screen that said 'Discard my progress' — basically meaning 'Don't sign up.'" Replacing it with a quiet "Later" produced the pattern they now run: "We have three of those soft walls now. Finally, there's a hard wall, after several lessons, that basically says if you want to move forward, you have to sign up. Here's what's key: without those soft walls priming a sign-up as they're ignored, those hard walls perform significantly worse." The cumulative refinement is reported as an **8.2% increase in DAUs** roughly three years after the original test.

**Dating caution:** the core delayed-sign-up result predates the 2018 cutoff. It is included because the article was updated in 2024 and because the soft-wall/hard-wall sequencing is the part practitioners actually copy, but it should be cited as an old result.

**Status: confirms** memo 04 §2.6 (Bush's "Delay") and §6.2 (Spool). The addition to the knowledge base is the *sequence*: repeated ignorable asks before an unavoidable one outperform a single unavoidable one. That is deferral with a ramp, not deferral alone.

### 4.2 Hotjar — the persona question, and why the number is weaker than it looks

Appcues customer story, "How Hotjar increased installations by 26% with a personalized approach to onboarding" (no date on the page).

The design: one question — **"Have you used Hotjar before?"** — routed users into one of three checklists, Beginner / Intermediate / Advanced. The first step was identical in all three ("Install Hotjar on your site"); later steps varied by declared familiarity.

The result, verbatim: users were **"26% more likely to complete the crucial first step of installing Hotjar."** But the claim as written is *"users who completed the question were"* 26% more likely. That is a comparison between people who answered a question and people who skipped it, not between a treatment and a control arm. Anyone motivated enough to answer an onboarding question is more motivated to install a tracking script. The page states no method, no sample and no date.

There is a second problem, specific to this knowledge base. Hotjar's three paths are labelled **Beginner / Intermediate / Advanced** — an audience label, and exactly the construct `RULES.md` rule 3 forbids, backed by Home Assistant's 2026 removal of "Advanced" and "Expert" terminology (memo 04 §5.2). So the most-cited persona-routing case study in the PLG literature is (a) not an A/B test and (b) built on the labelling scheme the rest of the corpus rejects.

**Status: does not support** the vendor claim it is used to support. It should be cited in the knowledge base as a **method warning**, not as evidence for persona routing.

### 4.3 AdRoll, Sked Social, Wrike, Trainual — the same problem, repeatedly

- **AdRoll** (Appcues customer story, undated): interactive "strategy quizzes" collecting goals and tech stack, then personalised recommendations — **"35 percent increase in feature usage"** after users completed one quiz. Same completer-versus-non-completer structure. No sample, no control.
- **Sked Social** (via Userpilot, 17 August 2026): a four-task checklist with a progress bar and one pre-checked item (endowed progress) reported **"3x higher conversion rate for checklist completers vs. non-completers."** Stated explicitly as a completer comparison — which is to say, not a result about checklists at all.
- **Trainual** (Navattic customer case study): interactive demo versus product-tour video on a landing page — **"+450% lift in free trial signups," "+100% increase in users reaching activated trial status" at seven days, "+175% lift in users converting to paid."** Presented as an A/B test, but it is a vendor case study about its own product and no baseline is given. **Wrike** (search extract only, primary source not fetched) reports a 65% onboarding-conversion lift from the same swap.

**Status:** the pattern is the finding. Across the PLG case-study genre, almost every published "personalisation lifted activation by X%" number compares users who engaged with the personalisation against users who did not. That confounds motivation with treatment, always in the direction that flatters the vendor.

### 4.4 The unsourced-statistic genre

UserGuiding's "100+ User Onboarding Statistics" page carries claims including "Personalized first-run experiences boost retention by 35%," "Personalized onboarding increases user retention by 40% vs. generic flows," "Users who complete an onboarding checklist are 3x more likely to become paying customers," and "Users who receive timely tooltips have 30% higher retention." **None of them carries a citation.** Appcues' own checklist post attributes a "20% or more" activation lift to Kissmetrics, a source that has not published since the mid-2010s. Chameleon's "cut TTV in half, see 25 percent higher retention" was already flagged as unsourced in memo 04 §2.5 and remains so.

Treat these as folklore. They are named here so nobody re-imports them later believing they were checked.

### 4.5 Growth.Design — the declared-versus-delivered constraint

Two teardowns in the window bear directly on the brief's last question, though neither publishes A/B numbers (T3, qualitative).

- **Blinkist** ("One Simple Psychology Framework To Improve Your Onboarding"): verbatim — **"Asking questions creates expectations. If you give your users the impression that you'll customize an experience based on their inputs, not delivering on that expectation can quickly backfire."** The case argues that poorly-executed personalisation is worse than none.
- **Grammarly** ("How to Craft Onboarding Surveys Users Love: 5 Do's and Don'ts"): the five rules are start with simple questions; state how the question benefits the user; ask about goals early; use earlier answers to shape later questions; and avoid onboarding gaps caused by team gaps (Conway's Law). One number is cited: a **10%+ upgrade-rate increase** from a paywall that connected the user's stated goal to the plan recommendation.

**Status: refines** the Kang & Cho result and the Airtable result into a single rule. Asking the question is cheap and appears to help (Kang & Cho, agency). Acting on the answer is where the risk sits: act narrowly on a declared role and you can suppress the behaviour that actually drives the product (Airtable, −10% collaboration); ask and then visibly do nothing with the answer and you spend trust (Blinkist). The safe form is the one Grammarly models — the answer is used immediately and visibly, in a way the user can see was caused by their answer.

---

## 5. Templates and presets at workspace set-up

This is the thinnest area of the sweep and the honest answer is that almost nobody has published a controlled number.

What exists:

- **Airtable** (§1): role-matched templates, +15% completion / −10% collaboration, then +15% / +10% after re-cutting around team use cases. The only controlled template experiment found.
- **Notion and Airtable flows described but not measured** (customerfitted.com, T3, undated): Notion branches on personal versus team at sign-up — "If you decide to use Notion for yourself, you end up on a workspace that has pages for personal use: reading list, movie list, recipes, travel plan"; the team branch asks company name, company size and which team you are in. Airtable's four questions include database familiarity, seat count and intended use. Descriptive only.
- **Jira team-managed projects**: no Atlassian-published activation or template-adoption numbers were found. Memo 04 §3.3 already carries the qualitative story; nothing measured has been added since.
- **HubSpot, Slack, Linear**: no first-party onboarding experiment numbers found. The only HubSpot A/B result surfaced was unrelated to onboarding (email versus in-app review requests, ~25% versus 10.3% response, via Taplytics).

**Status:** memo 04 §3.16's list of "products with no first-party PD analysis found" extends to onboarding experiments. Template seeding is universal in PLG products and essentially unmeasured in public.

---

## 6. Checklists versus contextual guidance

Putting the T2 numbers side by side:

| Pattern | Measured engagement | Source, sample |
|---|---|---|
| Onboarding checklist completion | 19.2% mean / 10.1% median | Userpilot, 188 companies |
| In-app guide engagement, best-in-class | 60.2% | Pendo, 6,800+ apps |
| Product tour completion, per company | 29% median | Produktly, 88 companies |
| Tour completion, user-initiated | 69% median | Produktly |
| Tour completion, auto-started | 23% median | Produktly |
| Tooltip open rate, median | 0.1% (1 per 1,000 impressions) | Produktly, 464 companies |

Three things follow.

**Checklists are not well completed.** A median of 10.1% of users finishing the checklist means the checklist is, for nine users in ten, a piece of permanent visual furniture. Any claim that "checklists lift activation 20%" needs to explain how, given that shape.

**Tooltips are not a delivery channel.** Produktly's 0.1% median open rate is the hardest number in this sweep against the tooltip-first approach Pendo recommended in 2017 (memo 04 §2.4: "A tooltip is a good option. It's non-intrusive and the user can decide to either follow the tooltip's advice or ignore it"). Users do exactly that: they ignore it, 999 times in 1,000. **Status: overturns** the practical usefulness of that recommendation, while confirming its premise — the tooltip is indeed non-intrusive, to the point of invisibility.

**Length is the dominant variable, not format.** The 73% → 38% → 25% → 8% decay by step count dwarfs every personalisation effect in this memo. The largest published lever on first-session completion is deleting steps.

**Status: confirms** Laubheimer's NN/g 2023 position (memo 04 §1.7) — "Tutorials interrupt users, don't necessarily improve task performance, and are quickly forgotten" — and gives it, for the first time in this corpus, a benchmark denominator.

---

## 7. What changes in the knowledge base

| Existing claim | Where | This sweep says |
|---|---|---|
| "40-60% of users who sign up will use it once and never return" (Appcues) | 04 §2.2 | **Overturn.** Median day-1 activation is ~5% and ~91% drop off within 14 days (Amplitude, 2,600 companies). Drop the Appcues figure. |
| "6% of features generate 80% of clicks" (Pendo 2024) | RULES rule 1; 00 §6.3 | **Refine.** 6% is the average; best-in-class is 15.6%. Cite it as the shape of a bloated product, not the target. |
| Persona/role routing at sign-up is good practice, 2–5 paths (Appcues) | 04 §2.2, §6.4 | **Refine.** Airtable's controlled test: +15% completion, −10% collaboration. Persona routing optimises single-player metrics and can suppress network behaviour. |
| Tooltips are a good, non-intrusive option (Pendo 2017) | 04 §2.4 | **Overturn in practice.** Median tooltip open rate 0.1% across 464 companies. |
| Push versus pull revelations (Laubheimer 2023) | 04 §1.7 | **Confirm, quantified.** 69% versus 23% completion, user-initiated versus auto-started, with an explicit self-selection caveat from the publisher. |
| "Delay" non-critical setup (Bush 2021); $300M Button (Spool 2009, old) | 04 §2.6, §6.2 | **Confirm.** Duolingo ~20% DAU (old, 2017) plus the soft-wall ramp; Zhang & Duan 2025 RCT, n=680,588, +20.92% two-year conversion from a longer, later commitment. |
| Two-level / short-wizard rule (Nielsen 2006; Budiu 2017) | RULES rule 2; 04 §1.6 | **Confirm, quantified** for staged disclosure: 73% completion at 1–2 steps, 8% at 9+, across 256 tours. |
| Basic/Intermediate/Advanced labels fail (Home Assistant 2026) | RULES rule 3; 04 §5.2 | **Confirm, by counter-example.** The most-cited persona case (Hotjar) uses exactly those labels and reports a completer-versus-non-completer comparison, not a test. |

---

## Still unknown

1. **Template and preset seeding, controlled.** One experiment (Airtable) exists in public. No numbers were found for Notion, Jira team-managed templates, Linear, Slack, HubSpot onboarding questions, or Monday/ClickUp template galleries.
2. **Effect sizes for Kang & Cho.** The only peer-reviewed field experiment squarely on the persona question at sign-up could not be fetched (403 at ACM DL and ResearchGate). Sample size, duration and effect magnitudes are unknown to this memo. Obtaining the PDF would materially raise the confidence of §2.1.
3. **Declared versus inferred segmentation, tested head to head.** No study was found that runs declared role against behaviourally-inferred segment as two arms of the same experiment. Airtable is the closest, and it is a before/after iteration, not a simultaneous comparison.
4. **Checklist versus contextual guidance as arms of one test.** Every number in §6 comes from a different panel measuring a different pattern. No source runs both against the same population.
5. **Whether persona questions help through tailoring or through agency.** Kang & Cho's framing ("sense-of-agency-preserving") implies the choosing does the work; every vendor assumes the tailoring does. A question-with-no-tailoring arm would settle it and nobody has run one publicly.
6. **Long-run cost of deferred setup in B2B.** Zhang & Duan's setting is consumer freemium. No equivalent exists for enterprise workspace configuration, where deferred setup may simply relocate the work to an admin later.
7. **Median values from Pendo.** Only the 90th percentile is public; the median and quartiles are named in the methodology but not printed.
8. **Reforge's wider artifact library.** Only one relevant artifact surfaced through the proxy; the library is member-gated and a systematic sweep of it was not possible. The same applies to the full Amplitude and Userpilot reports, which sit behind forms.
9. **Search coverage.** This session's web-search budget was exhausted before queries on Notion, Slack, Linear, Asana and Monday onboarding experiments could be run. Those five are the highest-value remaining targets.

---

## Bibliography

**Peer-reviewed (T1)**

- Kang, J. and Cho, D. "Digital Nudging in Mobile App Onboarding: Field Evidence on User Engagement." UIST Adjunct '25, Sept 2025. https://dl.acm.org/doi/10.1145/3746058.3758409 — *403, not fetched; abstract via search extract.*
- Zhang, L. and Duan, J. "Longer or shorter? A large-scale randomized field experiment on the impact of free trial duration on sustainable user conversion in the Freemium model." *Frontiers in Psychology*, 2025. https://pmc.ncbi.nlm.nih.gov/articles/PMC12217587/ — *fetched.*

**Industry research with stated samples (T2)**

- Amplitude, 2025 Product Benchmark Report, via Morales, M. "The 7% Retention Rule Explained," 30 Sept 2025, https://amplitude.com/blog/7-percent-retention-rule — *fetched*; and "Time to Value: The Key to Driving User Retention," 9 Nov 2025, https://amplitude.com/blog/time-to-value-drives-user-retention — *fetched*; and "The Product Benchmarks Every B2B Technology Company Should Know," https://amplitude.com/blog/b2b-technology-product-benchmarks — *fetched.*
- Pendo, Product Benchmarks, https://www.pendo.io/product-benchmarks/ — *fetched.*
- Userpilot, SaaS Product Metrics Benchmark Report, https://userpilot.com/saas-product-metrics/ — *fetched*; "Customer Onboarding Checklist Completion Rate: 2025 Benchmark Report," https://userpilot.com/blog/onboarding-checklist-completion-rate-benchmarks/ — *fetched, numbers absent from page*; 2024 edition Medium mirror, https://userpilot.medium.com/customer-onboarding-checklist-completion-rate-2024-benchmark-report-8ebabebefb1f — *403, search extract only.*
- Produktly, "SaaS Onboarding & In-App Engagement Benchmarks 2026," 12 Aug 2026, https://produktly.com/research/saas-onboarding-benchmarks-2026 — *fetched twice, direct and via proxy.*
- Motamedi (Isford), L. "Onboarding experiment result for personalization at Airtable," Reforge artifact, 19 Jan 2023, https://www.reforge.com/artifacts/onboarding-experiment-result-personalization-airtable — *403 direct; fetched via r.jina.ai proxy; full iteration-2 detail member-gated.*
- First Round Review, "The Tenets of A/B Testing from Duolingo's Master Growth Hacker," 17 July 2017, updated 23 Nov 2024, https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker/ — *fetched. Core result predates 2018.*

**Practitioner and vendor (T3)**

- Appcues, "How Hotjar increased installations by 26% with a personalized approach to onboarding," https://www.appcues.com/customer-stories/how-hotjar-increased-installations-by-26-with-a-personalized-approach-to-onboarding — *fetched, undated, no method.*
- Appcues, Casey, A. "The onboarding checklist every team needs," 24 Apr 2026, https://www.appcues.com/blog/customer-onboarding-checklist — *fetched.*
- Appcues, Detrik, S. "Growth Experiments: A Complete Guide to Testing Your Way to Better Activation," 8 May 2026, https://www.appcues.com/blog/20-growth-experiments-to-improve-your-activation-rate — *fetched; experiment list, no results.*
- Appcues, "How Personalization Impacts Key Customer Outcomes," https://www.appcues.com/blog/benefits-of-personalization — *fetched; AdRoll 35%, Hotjar 26%, both uncontrolled.*
- Growth.Design, "One Simple Psychology Framework To Improve Your Onboarding" (Blinkist), https://growth.design/case-studies/blinkist-user-onboarding — *fetched.*
- Growth.Design, "How to Craft Onboarding Surveys Users Love: 5 Do's and Don'ts" (Grammarly), https://growth.design/case-studies/grammarly-onboarding-survey — *fetched.*
- Userpilot, "User Activation for SaaS in 2026," 17 Aug 2026, https://userpilot.com/blog/user-activation-for-saas/ — *fetched; Sked Social, ClearCalcs.*
- Navattic, "A/B Testing Examples from Top B2B SaaS Companies," https://www.navattic.com/blog/saas-ab-testing-examples — *fetched; Trainual, MonitorQA, HubSpot.*
- Flowjam, "SaaS Onboarding 2026," https://www.flowjam.com/blog/saas-onboarding-best-practices-2025-guide-checklist — *fetched; third-hand citation of Userpilot tour data.*
- UserGuiding, "100+ User Onboarding Statistics You Need to Know in 2026," https://userguiding.com/blog/user-onboarding-statistics — *fetched; every relevant statistic uncited.*
- Customer Fitted, "The Best Way To Personalize SaaS Onboarding (w/ Notion And Airtable Case Studies)," https://www.customerfitted.com/personalization-onboarding-case-study — *fetched; descriptive, undated.*
- Statsig, "Onboarding for Growth using A/B Tests for B2B SaaS," https://www.statsig.com/blog/onboarding-for-growth-with-a-b-tests — *fetched; no results reported.*
- Dopt, "Deep dive into how Airtable built their new onboarding," https://blog.dopt.com/airtable-onboarding-deep-dive — *redirects to a 404 on airtable.com; not fetched.*
