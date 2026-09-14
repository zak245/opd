# Sweep 15: Enterprise SaaS field studies and usage data, 2018–2026

*Gap closed: real usage data from B2B software since 2018 — feature-adoption distributions, settings usage, role and segment differences, longitudinal field studies, feature removal. Related older memos: [04-b2b-saas-practice-and-case-studies.md](04-b2b-saas-practice-and-case-studies.md) and [06-academic-literature.md](06-academic-literature.md) §4. Sweep conducted September 2026. Tier is named for every source.*

---

## 0. Headline

The knowledge base currently rests its entire empirical case for rule 1 ("hide the rare") on two numbers: Pendo's "6% of features generate 80% of clicks" and McGrenere & Moore's Word 97 study from 2000. This sweep fetched the primary Pendo documents and found that **the knowledge base has one of them wrong**, that **the two Pendo numbers it quotes are not the same measurement**, and that **the vendor benchmark literature since 2018 measures at least three different quantities under the name "feature adoption."**

Against that, the sweep found three genuinely new pieces of post-2018 field evidence that the knowledge base does not yet use: a three-year CSCW log study of one enterprise Slack deployment that quantifies how differently sub-populations inside a single tenant use the same features; a CHI 2025 controlled study that puts numbers on what happens when an AI layer hides the interface instead of disclosing it; and a 2026 Autodesk study that prices the failure mode rule 4 exists to prevent.

It found **no** post-2018 data on settings-change rates, and **no** methodologically described case study of removing a feature from a B2B SaaS product.

---

## 1. Feature-adoption distributions: what the vendor reports actually say

### 1.1 Pendo, *2019 Feature Adoption Report* (Tier 2 — industry research with published method)

Fetched as the original PDF (9 pages, February 5th 2019, Suja Thomas, Ph.D., lead data scientist).

**Setting.** "we analyzed feature usage across 615 Pendo subscriptions for customers who have used Pendo for more than a year," over "a three-month period." Verticals named: "banking/finance, HR technology, education, shipping and logistics, healthcare and e-commerce."

**Numbers, verbatim.** "80 percent of features in the average software product are rarely or never used." "we determined that an average of 12% of features generate 80% of average daily usage volume." The four-bucket chart reads: **Frequent 12%, Moderate 8%, Rare 24%, Never Used 56%** — where frequent features carry the top 80% of usage, moderate the next 15%, and rare plus never-used share the last 5%. "These percentages vary only slightly by size of company."

**Verdict: overturns a knowledge-base citation.** Memo 06 §4.3 currently says: "Pendo (2019 Feature Adoption Report; 180 M users, 35,000 applications) reported roughly 12% of features used often, 15% sometimes, 73% rarely or never." Both halves are wrong. The sample is **615 subscriptions**, not 180 million users or 35,000 applications. The distribution is **12 / 8 / 24 / 56**, not 12 / 15 / 73. The "15%" in the circulating version is a usage *share* (the next 15% of usage volume), not a share of features. Memo 06 should be corrected.

**The methodological caveat that matters most.** Pendo says outright: "(A feature in Pendo is delineated by a 'tag.' We presume that customers have tagged parts of their product that they expect to be used on a daily, weekly, or monthly basis.)" The denominator is therefore **a set of features a product manager chose to instrument because they expected them to be used** — already filtered toward the head of the distribution. This is not comparable to McGrenere & Moore's exhaustive inventory of 265 first-level Word 97 functions. The knowledge base treats the two as continuous evidence for the same claim; they are not. If anything, the tag-based denominator means the true tail is *longer* than 80%.

**Secondary claims in the same report (Tier 3 reliability inside a Tier 2 document — vendor measuring its own product's effect, no control group).** "after their first year of using Pendo to improve their products, our customers experienced a 50% increase in daily feature use. The percent of unused features, meanwhile, declined by nearly 25%." Do not cite as evidence for disclosure design.

### 1.2 Pendo, 2024 product benchmarks (Tier 2)

**Setting.** The interactive tool states: "we analyzed aggregated and anonymized product data from 6,800+ applications across 2,500 Pendo customers," reported at "low (25th percentile), median (50th), high (75th), and best-in-class (90th) performance." The accompanying blog post instead says "anonymized, aggregated data across 6,800 Pendo customers." The two do not agree; prefer the tool's wording. No date range is published.

**Numbers.** "6.4% of features are driving 80% of clicks." Best-in-class (top 10%) "15.6%" — "2.5x higher than average." By company size, "companies with fewer than 200 employees have the highest feature adoption rate at 7.4%." By industry, Manufacturing, Construction, Utilities and Consumer Goods highest; **Media lowest at 4.9%**. Mind the Product's write-up adds the inverse framing: "almost 94% of features are untouched and ignored."

**Verdict: confirms, then refines.** Core model §6.3 and rule 1 cite "6% of features generating 80% of clicks (Pendo 2024)." That figure is correct. What the knowledge base should add is the **spread**: 4.9% to 7.4% across segments, 6.4% to 15.6% from median to best-in-class. The head of the distribution is not a constant, and a product at 15.6% is not doing worse disclosure than one at 6.4% — it may simply have fewer, better-chosen features.

**Do not read 2019 → 2024 as a trend.** 12% (2019) and 6.4% (2024) are different metrics on different samples: *average daily usage volume* over 615 subscriptions versus *click volume* over 6,800+ applications. The apparent halving is not evidence that products got twice as bloated in five years.

### 1.3 Pendo's own product, n=1 (Tier 2)

Same author, same day as the 2019 report: "20% of them (17 out of 85 total features) generate 80% of all the average daily click volume."

**Verdict: confirms McGrenere & Moore, refines rule 1.** A single product with a modest 85-feature inventory sits at 20% — three times the cross-customer average. This is the same lesson as McGrenere & Moore's 3–45% per-user range, one level up: the head size varies enormously by product, so 6% is a median across heterogeneous products, not a law to design against. Rule 1's test ("can you say what share of users touch it weekly?") is right to demand a per-product number rather than an industry one.

### 1.4 Userpilot, *Product Metrics Benchmark Report* 2024/2025 (Tier 2)

**Setting.** "547 SaaS companies across 7 industries," using "first-party data from pulling anonymized user data directly from Userpilot's Analytics Dashboards." Per-metric sample sizes are published, which is unusual and welcome: core feature adoption n=181, activation n=62, onboarding checklist completion n=188, month-1 retention n=83, NPS n=229. Verticals: Martech, CRM & Sales, Fintech & Insurance, Healthcare, HR, Edtech, AI & ML, other business services.

**Numbers.** Core feature adoption: **24.5% mean, 16.5% median**, "top quartile above 45%." By industry: HR 31%, MarTech 27.9%, CRM & Sales 25.6%, AI & ML 24.8%, Healthcare 22.8%, FinTech & Insurance 22.6%. By growth model: sales-led 26.7%, product-led 24.3%. On size: "no statistically significant correlations between company size and core feature adoption rate." Activation 37.5% mean / 37.04% median. Onboarding checklist completion **19.2% mean / 10.1% median**. Month-1 retention 46.9% mean / 45.25% median.

**Two findings.**

First, **the mean/median gap is the finding**. 24.5 against 16.5 for feature adoption; 19.2 against 10.1 for checklist completion. Every headline "average" in this literature is a mean over a heavily right-skewed distribution, so the typical product is materially worse than the quoted average. Teams benchmarking themselves against 24.5% are comparing against a number that roughly two-thirds of products do not reach.

Second, **this is a different metric with a confusingly similar name**. Userpilot's "core feature adoption rate" is *the share of users who adopt the features the team designated as core*. Pendo's is *the share of features that carry 80% of clicks*. They point in opposite directions: Pendo's number falls when a product adds features; Userpilot's falls when users fail to reach the ones that matter. A third variant circulates via secondary aggregators ("ProductLed's 2023 Benchmark Report: core feature adoption rates of 70%+ among monthly active users"), which the sweep could not trace to a primary document. **Refines rule 1's test:** the test should require not just a number and a source but the *metric definition*, because the three in circulation are not interchangeable.

A caution about aggregators: `artisangrowthstrategies.com` reproduces Userpilot's figures (24.5%, median 16.5%, 181 companies, HR 31%) while attributing them to its own "Product Metrics Benchmark Report 2024." Cite Userpilot, not its copies.

### 1.5 Amplitude product benchmarks (Tier 2)

**Setting.** "Data from over 2,600 companies across industries, regions, and company sizes. Data spans the months between September 2023 to September 2024." Elsewhere: "2.6K Companies," "10.6K Digital products," "171B Monthly users," with "z-score-based local baseline methods to remove outliers."

**Numbers for enterprise B2B SaaS**, expressed as deltas from the all-company average: new-user growth rate +28%, **day-1 activation 35% lower**, **month-1 retention 26% lower**, daily-active-user growth +1%. Across B2B generally, three-month retention is "15.6% [for top products] while median B2B products retain 2.5%." "69% of products with strong early activation were also strong three-month retention performers."

**Verdict: confirms the population model.** Core model §7 argues that enterprise users are Cooper's perpetual intermediates who plateau. Amplitude's enterprise segment activating 35% worse and retaining 26% worse than the cross-industry average is consistent with that: enterprise tools land slowly, and the first layer has to carry a long onboarding tail. It also supports §8.1's precondition that the business metric be task completion rather than engagement — enterprise products are not winning on engagement metrics and should not be tuned for them.

Amplitude publishes no feature-level adoption metric, so it cannot be used for the split decision.

### 1.6 Mixpanel, 2026 B2B benchmarks (Tier 2, low usefulness)

"577 billion events across 3.8 billion devices." Regional engagement and retention only: APAC 407.4 actions per user (+70% YoY), APAC weekly retention 77.9% against North America's 44.6%. No company count, no percentiles, **no feature-level metric at all**. Noted so the knowledge base does not go looking again: Mixpanel's public benchmarks do not speak to disclosure.

---

## 2. The denominator problem: how many products compete for the user's memory

### 2.1 WalkMe, *State of Digital Adoption* 2024 and 2025 (Tier 2/3 — survey plus proprietary telemetry, method only partly described)

**2024 report.** "Surveys of 1,700 senior business leaders and 2,051 office and hybrid workers" across North America, Japan, APAC, UK & Ireland, France, DACH, Benelux and the Nordics. Headline: "Enterprise leaders believe their organization uses 21 applications, but on average, large organizations use 211 applications while smaller companies use 69." Also: "Employees spend as many as 353 hours, or 44 working days, a year compensating for technology issues."

**2025 report.** "3,700 senior executives and employees" plus proprietary data on "1.5 million users across 2,400 enterprise applications." Headline: "Executives believe an average of 37 applications are in use at their organizations, but WalkMe's data shows the average number is actually 625, a 17x discrepancy." Wasted time down to "36 working days a year"; "only 28% of employees feel adequately trained."

**Verdict: confirms rule 3, with a warning.** The same vendor's headline moved from 21-believed/211-actual to 37-believed/625-actual in one year, and wasted days fell from 44 to 36, with no stated panel continuity and no published definition of "application in use." Treat the direction, not the magnitude.

The direction matters for disclosure. If a knowledge worker's day spans dozens to hundreds of applications, then **no single B2B product gets enough repeat exposure for its users to become experts in it.** That is the strongest post-2018 support for Cooper's perpetual intermediates and for rule 3's ban on "expert mode": the expert your mode is designed for does not exist at the portfolio level, because attention is divided across hundreds of tools. It also raises the cost of rule 2 violations — a user who visits your settings page twice a year cannot be expected to remember a third level.

---

## 3. Within one tenant, different populations use different features

### 3.1 Wang et al., *Group Chat Ecology in Enterprise Instant Messaging*, PACM HCI 6, CSCW1, Article 94 (April 2022) (Tier 1 — peer-reviewed CSCW)

**Setting.** "a total of 4,300 group chat channels" created "by 8,000 employees in a R&D division in a big IT company," "spanning from Mar 2016 (Slack was first introduced) to Mar 2019" — three years. 100 channels randomly sampled and manually coded into 9 categories; 59 metrics extracted; a second dataset of 117 project teams, 54 cross-referenced.

**The number that matters for PD.** The same feature set is used at wildly different rates by different sub-populations of a single tenant. Per-channel means from the paper's Appendix table:

| Feature | IT Support (n=8) | Project (n=32) | Social (n=10) | Event (n=9) |
|---|---|---|---|---|
| Threaded messages | 185.8 | 15.3 | 152.5 | 1.4 |
| Messages with emoji | 102.4 | 12.0 | 284.7 | 1.8 |
| Pinned messages | 5.5 | 0.4 | 1.9 | 1.0 |
| Code messages | 81.8 | 6.6 | 1.4 | 0.2 |
| Git messages | 59.6 | 9.0 | 0.7 | 0.1 |
| File messages | 58.9 | 60.4 | 180.5 | 2.1 |
| Avg. turns per thread | 4.1 | 2.0 | 2.8 | 0.8 |

Verbatim: "the averaged number of turns in threaded messages (4.1) for this category [IT Support] is significantly higher than all the other categories."

**Verdict: confirms core model §8.3 item 1, and supplies its first post-2018 numbers.** The claim that "one product needs several level-1 surfaces, not one global disclosure policy" has until now been argued from practitioner sources (ParallelHQ, Salesforce, Stripe). This is field data: threads are a 186-per-channel staple for support work and a 1.4-per-channel curiosity for events; pinning is a support tool; code and git messages barely exist outside engineering contexts. A single "which features are core" decision taken at the product level would be wrong for most of these groups.

**A second, sharper reading.** The modal category is Project (32 of the 100 coded channels) — and Project channels are *near the bottom* on almost every feature metric: 15.3 threads, 12.0 emoji messages, 0.4 pinned messages, 355.9 total messages against IT Support's 4,537.4. **The most common use of the product is also the lightest use of the product.** That is precisely the shape progressive disclosure assumes, measured in the field rather than inferred.

**Limits.** Channel-level means, not per-user rates. One company, one R&D division, one three-year window. The "features" are communication acts (threads, reactions, pins, files) rather than UI controls behind doors, so the mapping to disclosure is by analogy. Cite it for heterogeneity, not for a split.

### 3.2 Drosos, Sarkar & Gordon, *"My toxic trait is thinking I'll remember this"*, Microsoft Research, arXiv:2404.07114 (April 2024) (Tier 1 — HCI preprint, qualitative)

**Setting.** Content analysis of "360 comments, from 90 video tutorials" for Microsoft Excel "published by 43 creators across YouTube, TikTok, and Instagram," plus contextual interviews with 8 high-reach creators. Output: a taxonomy of **13 gaps** — 5 creator-driven, 4 learner-driven, **4 app-driven**.

**The app-driven gaps are the enterprise finding.** Two of the four are *tenant variance*, not user error:

- Region and language. "Excel functions have different names in depending on the language setting, which can be an issue for multilingual learners who are watching a video in English but work in a different language." Argument separators differ by locale: "If it doesn't work for you, try [...] to use semicolons" (C82).
- Version and platform. "Excel has several supported endpoints including Web, iOS, Android, Windows, Mac, and multiple versions on each platform." Commenters report: "What version of Excel do we need to use this?" (C325); "I don't have that feature, my Excel is 2016" (C164).

**Verdict: refines rule 4 with a cost the knowledge base does not yet price.** Rule 4 says the door must be labelled by what is behind it and must "always deliver on its promise." In a multi-tenant enterprise product, *the thing behind the door differs by tenant* — by plan, by version, by locale, by admin configuration. Every screenshot, tour, help article and third-party tutorial is therefore wrong for some fraction of the customer base, and the user's conclusion is not "my tenant differs" but "the feature does not exist" — Tognazzini's failure, arriving through the back door. The practical consequence: version- and plan-conditional help, and never a disclosure label whose truth depends on the tenant.

---

## 4. What happens when an AI layer hides the interface

### 4.1 Khurana, Su, Wang & Chilana, *Do It For Me vs. Do It With Me*, CHI 2025 (Tier 1 — peer-reviewed CHI)

**Setting.** Within-subject controlled experiment, **N=20**, plus a Wizard-of-Oz usability study, N=10. Software: Google Sheets, Figma, Adobe Photoshop. Conditions: **AutoCopilot** (the AI performs the task) versus **GuidedCopilot** (step-by-step guidance with visual references to the real UI controls).

**Numbers.** Task completion — Sheets 88.5% (guided) vs 35% (auto); Figma 55% vs 20%; both p<0.0001. Task accuracy — Sheets 82% vs 12%; Figma 40% vs 5%. Trial and error — under 2 attempts per task guided, about 5 attempts with auto, and "75% of AutoCopilot attempts involved undoing incorrect automation." Perceived control — 18/20 in Sheets (χ²=24.3, p<0.0001), 16/20 in Figma (χ²=15.7, p=0.0035). Learning — 16/20 said GuidedCopilot improved learning potential; roughly half demonstrated transfer to later tasks.

**Verdict: confirms Findlater & McGrenere (2010) and extends it to the AI era.** Core model §7 already holds that "hidden features are not learned," resting on a 2010 IJHCS study of reduced-functionality menus. This is the 2025 replication in the form the AI era actually takes: an agent that completes the task *for* the user hides the interface more completely than any collapsed panel, and the cost is not only learning but correctness — 12% accuracy against 82% in Sheets. It also **refines rule 8**: the accelerator that does the work for you is not a scaffold that fades, it is a scaffold that never lets the user off it. A copilot that names and points at the real control is a disclosure mechanism; one that silently acts is a replacement for the interface.

This is the strongest single number the knowledge base can now cite for Nielsen's 2026 AI restatement, which is otherwise argued without evidence.

### 4.2 Drosos, Vermeulen, Fitzmaurice & Matejka, *Nanomentoring*, Autodesk Research, arXiv:2604.13621 (April 2026) (Tier 1 — HCI preprint)

**Setting.** 204 questions extracted from online forums for "two feature-rich applications (Autodesk Fusion 360 and Microsoft Word)"; roughly a quarter judged short enough to answer in under 60 seconds ("nanoquestions"); 28 experts recruited from those help forums answered 20 of them in text or audio.

**Numbers.** Average total answering time **57.0 seconds**: 33.6s reading the question (58.9%) and 23.4s answering (41.1%). "For more than half of the nanoquestions participants saw, they could give advice that they believed was helpful in under 60 seconds." The paper cites Hellman et al. for the baseline: "the median response time for open-source software forums was 10.83 hours."

**Verdict: prices the failure rule 4 exists to prevent.** When a user cannot find a control, the fallback channel costs a median of **10.83 hours of wall-clock waiting for an answer an expert can give in under a minute**. The knowledge base has the qualitative version of this (Tognazzini: "If the user cannot find it, it does not exist") and the click-through version (NN/g 2014: 0% on an unlabelled icon). This adds the time cost on the other side of the failure, from a 2026 study of two genuinely feature-rich professional tools. A badly labelled door does not cost a click; it costs most of a working day.

---

## 5. Longitudinal enterprise telemetry, 2026

### 5.1 *Adoption and Impact of Command-Line AI Coding Agents*, arXiv:2607.01418 (2026) (Tier 1 — preprint, enterprise telemetry)

**Setting.** "tens of thousands of engineers at Microsoft," four months, "January 5 through April 29, 2026," covering Claude Code and GitHub Copilot CLI. Retention operationalised as "activity on at least 5 of the 14 days beginning with their first use." The paper positions itself as "the first field study to use developer-level telemetry to analyze both the adoption of agentic command line tools and their effect on pull-request output," against prior work that "typically relies on surveys and interviews."

**Numbers.** Output: "+24.0% lift in PRs/engineer/day over the post-period [95% CI +14.5%, +33.7%]," with no statistically significant decay across the window. Dose-response by weekly usage intensity: 1 day/week +15.0%, ~3 days ~+30%, 5+ days +50.1%. Adoption: the strongest predictor was skip-level peer exposure — engineers whose skip-level peers largely used the tool had "+216% higher odds of trying it."

**Verdict: refines rule 6 and rule 3.** The paper's own summary: "what an engineer does (peer ties, prior tool use, PR cadence) explains who adopts and retains far better than who an engineer is." Inside a large, professionally homogeneous population in a single company, **role and demographics did not predict adoption; behaviour and social exposure did.** That is an argument against role-seeded defaults as the primary disclosure strategy (core model §7's concession that "role-seeded defaults exist for the third of users who will not customise" should be read as a fallback, not a design centre) and an argument for surfacing capability through in-context and social signals rather than through an audience label.

The dose-response curve is also a caution for rule 8: the benefit is concentrated in the heaviest users, exactly the population that accelerators serve. Note what the paper does *not* publish: the overall adoption rate of the eligible population.

---

## 6. Feature removal: the hole in the evidence

The sweep searched specifically for post-2018 case studies of removing features from B2B SaaS, with usage thresholds and outcomes. What exists is practitioner narrative.

- **Ant Murphy, "When Did You Last Remove a Feature?" (31 January 2025) (Tier 3).** Names real sunsets — Grammarly's desktop apps, Spotify Live (2023), Medium's Profiles and Themes, Airbnb pausing Experiences — but publishes no usage data behind any of them, and recycles the Standish "64%" figure and Pendo 2019 as its evidence base.
- **Figr, "Dead Features Talk" (Tier 3, no author, no date).** Claims a "fast growing SaaS company" found "50% of features had almost zero activity" and "30% were used by fewer than 5% of customers," with churn up 12%; and an analytics dashboard consuming "10% of engineering time" used by "3% of customers." No company, no method, no date, no source. **Do not cite.**

**Verdict: rule 8's removal clause is currently unevidenced post-2018.** The knowledge base's reconciliation in §7.1 — "tuck away what some users use, remove what almost nobody uses (below roughly 3–5% deviation from the default across all segments)" — rests on McGrenere & Moore (2000) for the preference data and on nothing at all for the threshold. The 3–5% figure should be labelled as a design convention, not a finding, until a first-party study exists.

---

## 7. Settings usage: nothing found

Rule 6 leans on Spool (UIE, 2011): "fewer than 5% of users ever changed a setting." The sweep looked for a post-2018 replacement and found none.

None of the benchmark sets examined — Pendo (2019, 2024), Userpilot (547 companies), Amplitude (2,600 companies), Mixpanel (577B events), WalkMe (1.5M users / 2,400 applications) — publishes a settings-page visit rate, a preference-change rate, or any metric on configuration surfaces at all. The available adjacent numbers are about privacy settings in consumer contexts (survey self-report, different population, different motivation) and are not transferable.

This is load-bearing. Memo 07 maps a real settings surface; rule 6's consequence ("customisation is not a fix for a bad default") and rule 8's test ("when did you last delete a setting?") both depend on a fifteen-year-old anecdote about Microsoft Word. See the questions in the reply.

---

## 8. Five warnings for anyone citing this literature

1. **Three metrics, one name.** Pendo measures *the share of features that carry 80% of clicks* (6.4%). Userpilot measures *the share of users who adopt designated core features* (24.5% mean, 16.5% median). A third variant, "70%+ of monthly active users," circulates via secondary aggregators and could not be traced to a primary document. Never quote one without its definition.
2. **The denominator is chosen by the vendor's customer.** Pendo: "A feature in Pendo is delineated by a 'tag.'" The 6.4% is computed over features a product manager already thought were worth instrumenting. McGrenere & Moore's 265 Word functions were an exhaustive inventory. These are not the same measurement, and the knowledge base should stop presenting them as a continuous line of evidence.
3. **Means over skewed distributions.** Userpilot publishes both: 24.5% mean against 16.5% median for feature adoption, 19.2% against 10.1% for checklist completion. Assume every unqualified "average" in this literature overstates the typical product.
4. **Self-selected samples.** Pendo, Userpilot, Amplitude, Mixpanel and WalkMe all measure only products whose teams bought a product-analytics or digital-adoption tool. That population already worries about adoption. The true tail across all B2B software is very likely longer.
5. **No peer review, no distributions, no replication.** Only the 2019 Pendo report publishes its full method, and it is seven years old. None of the vendor sets publish per-product distributions, confidence intervals, or raw data. Rank them below any peer-reviewed field study, however small.

---

## Still unknown

- **Settings-change rates in B2B SaaS since 2018.** No published figure of any tier. Spool's "<5%" (2011) remains the only number, and it is an anecdote about a consumer-facing desktop application.
- **Feature removal outcomes.** No post-2018 study with a stated method reporting what happened to churn, support volume or task time after a B2B SaaS product removed a feature. The 3–5% removal threshold in core model §7.1 is a convention, not a finding.
- **Per-user feature-count distributions in modern B2B products.** Nothing post-2018 replicates McGrenere & Moore's "27% of functions used on average, range 3–45%" at the individual-user level. The vendor benchmarks all aggregate to the product or account level.
- **Role-based feature usage with published numbers.** The sweep found no source reporting feature-use rates broken out by job role inside a single multi-tenant product. The CSCW 2022 Slack study is the closest available proxy, and it segments by channel purpose, not by role.
- **Cross-tenant variance in the same product.** No published analysis of how differently two customers of the same multi-tenant SaaS product use its feature set — the "feature usage by segment" analysis named in the brief appears not to exist publicly.
- **Forrester and Gartner on feature usage.** No publicly quoted Forrester or Gartner figure on the share of enterprise software features actually used was found; their public 2024–2026 output on enterprise software is dominated by AI adoption forecasts.
- **A post-2018 replication of the disclosure-level penalty.** Nothing found since 2018 measures the cost of a second or third disclosure level in an enterprise product. Rule 2 still rests on Nielsen (2006) and Landauer & Nachbar (1985).
- **Longitudinal studies of a single enterprise tool's feature adoption over years.** The Slack study is three years but cross-sectional in its feature analysis; the Microsoft telemetry study is four months. Nothing tracks feature-level adoption in one product across years.

---

## Bibliography

**Tier 1 — peer-reviewed and HCI preprints**

1. Wang, D., et al. "Group Chat Ecology in Enterprise Instant Messaging: How Employees Collaborate Through Multi-User Chat Channels on Slack." *Proceedings of the ACM on Human-Computer Interaction* 6, CSCW1, Article 94 (April 2022). Received January 2021; accepted November 2021. https://arxiv.org/abs/1906.01756 (v5 PDF: https://arxiv.org/pdf/1906.01756v5)
2. Khurana, A., Su, X., Wang, A. Y., & Chilana, P. K. "Do It For Me vs. Do It With Me: Investigating User Perceptions of Different Paradigms of Automation in Copilots for Feature-Rich Software." *CHI '25*. https://dl.acm.org/doi/10.1145/3706598.3713431 ; preprint https://arxiv.org/html/2504.15549
3. Drosos, I., Vermeulen, J., Fitzmaurice, G., & Matejka, J. "Nanomentoring: Investigating How Quickly People Can Help People Learn Feature-Rich Software." Autodesk Research, arXiv:2604.13621 (15 April 2026). https://arxiv.org/abs/2604.13621
4. Drosos, I., Sarkar, A., & Gordon, A. D. "'My toxic trait is thinking I'll remember this': gaps in the learner experience of video tutorials for feature-rich software." Microsoft Research, arXiv:2404.07114 (10 April 2024). https://arxiv.org/abs/2404.07114
5. "Adoption and Impact of Command-Line AI Coding Agents: A Study of Microsoft's Early 2026 Rollout of Claude Code and GitHub Copilot CLI." arXiv:2607.01418 (2026). https://arxiv.org/html/2607.01418v1

**Tier 2 — industry research with published numbers**

6. Thomas, S. *2019 Feature Adoption Report.* Pendo, 5 February 2019. PDF fetched and quoted in full: https://go.pendo.io/rs/185-LQW-370/images/2019%20Feature%20Adoption%20Report%20Digital.pdf ; landing page https://www.pendo.io/resources/the-2019-feature-adoption-report/
7. Thomas, S. "How Are Our Product Features Doing?" Pendo blog, 5 February 2019. https://www.pendo.io/pendo-blog/how-are-our-product-features-doing/
8. Pendo. "2024 software benchmarks: Insights for data-driven development." https://www.pendo.io/pendo-blog/product-benchmarks/
9. Pendo. "Product Benchmarks" interactive tool (6,800+ applications, 2,500 customers; 25th/50th/75th/90th percentiles). https://www.pendo.io/product-benchmarks/
10. Pendo. "Why feature adoption may be your biggest weakness—or strength." https://www.pendo.io/pendo-blog/feature-adoption-benchmarking/
11. Mind the Product. "Users engage with only 6% of product features: Product benchmark findings." https://www.mindtheproduct.com/users-engage-with-6-of-product-features-product-benchmark-findings/
12. Userpilot. "SaaS Product Metrics Benchmark Report" (547 companies; per-metric sample sizes). https://userpilot.com/saas-product-metrics/ and https://userpilot.com/blog/product-metrics-benchmark-report/
13. Amplitude. "Product Benchmarks for Enterprise Technology B2B SaaS Companies" (2,600+ companies, Sep 2023–Sep 2024). https://amplitude.com/benchmarks/technology-b2b-saas/enterprise
14. Amplitude. "The Product Benchmarks Every B2B Technology Company Should Know." https://amplitude.com/blog/b2b-technology-product-benchmarks
15. Mixpanel. "2026 B2B benchmarks: Depth, durability, and the new performance gap." https://mixpanel.com/blog/b2b-benchmarks-2026/
16. WalkMe. "Enterprises losing more than $1M a week through inefficient technology use" (*State of Digital Adoption* 2024; 4,000+ respondents). https://www.globenewswire.com/news-release/2024/02/07/2825397/0/en/Enterprises-losing-more-than-1M-a-week-through-inefficient-technology-use-WalkMe-report-reveals
17. WalkMe. "Enterprises wasted $104M on underused tech in 2024…" (*State of Digital Adoption* 2025; 3,700 respondents plus 1.5M users across 2,400 applications). https://www.walkme.com/news-releases/enterprises-wasted-104m-on-underused-tech-in-2024-while-75-of-workers-struggle-to-harness-ai-efficiencies-new-walkme-research-finds/

**Tier 3 — practitioner, cited only as examples of unsourced claims**

18. Murphy, A. "When Did You Last Remove a Feature?" 31 January 2025. https://www.antmurphy.me/newsletter/why-you-should-remove-features
19. Figr. "Dead Features Talk: Killing Unused Features." No author, no date. https://figr.design/blog/dead-features-talk
20. Artisan Strategies. "Feature Adoption Metrics & Benchmarks 2026." Reproduces Userpilot's figures without attribution. https://www.artisangrowthstrategies.com/blog/feature-adoption-metrics-top-benchmarks-2025

**Could not be fetched**

- Wulf, V., et al. "Making Sense of Enterprise Apps in Everyday Work Practices." *CSCW* journal (2019), https://doi.org/10.1007/s10606-019-09363-y — Springer paywall redirect. Claims about it are excluded from this memo.
- Yang, L., et al. "The effects of remote work on collaboration among information workers." *Nature Human Behaviour* (2022), 61,182 Microsoft employees — paywall redirect; not used.
- Reforge, "Upsides to Unshipping: The Art of Removing Features and Products" — HTTP 403; not used.

*Note on method: this sweep's web-search budget was exhausted partway through. Later findings were obtained by direct fetch of URLs surfaced in earlier searches, and PDFs were parsed locally where the fetch tool returned binary content. The "Still unknown" list should therefore be read as "not found within this sweep," not as "does not exist."*
