# Sweep: plan gating and paywalls in software, 2018–2026

*Gap closed: evidence since 2018 on visible-but-locked versus hidden gated features, contextual versus upfront paywalls, previews, upgrade requests, freemium tier design, regulation, nagging, and seat- versus usage-based gating. Tests the "A named pattern: gated features" section of RULES.md and updates pattern 20 of `03-pattern-catalog.md` and section 5 of `05-critiques-pitfalls-and-measurement.md`.*

Tiers, named on every finding: **T1** peer-reviewed or regulator-published; **T2** industry research with published numbers and a stated sample; **T3** practitioner or vendor guidance with no sample.

---

## 0. The headline for the owner

There is still **no controlled experiment anywhere in the 2018–2026 literature comparing a visible-but-locked feature against the same feature hidden**. That is the central claim of the gated-features pattern in RULES.md, and it rests on vendor guidance. Pattern 20 was honest about this ("search synthesis suggests"); five more years of searching has not improved it.

What *has* hardened since 2018 is the other half: **hiding the price or the commitment behind a click is both effective and now illegal in several jurisdictions**. The ten gating rules are on firm ground where they concern honesty (4, 5, 6) and soft ground where they concern placement (1, 7, 8, 9, 10).

---

## 1. Hiding material information: the best-measured number in this sweep

**Finding 1. Hiding the recurring charge in small grey text doubled acceptance of a subscription offer: 14.8% → 30.1%.** (T1)

Luguri and Strahilevitz, "Shining a Light on Dark Patterns," *Journal of Legal Analysis* 13(1), 2021. Two census-weighted survey experiments with US adults, on a fictitious identity-theft-protection subscription: study 1, n = 1,963; study 2, n = 3,777, a 5×4 factorial crossing content with form manipulations. The hidden-information condition disclosed the automatic monthly charge only in "small gray font at the bottom of the page." Acceptance rose from 14.8% in the control condition to "30.1 percent of participants accepting" — a 102% increase. Study 1 is the more quoted result: control 11.3%, mild dark patterns "25.8 percent," aggressive "41.9 percent of the sample accepting the program" — a 371% increase.

This **confirms and sharpens** Nouwens et al. (CHI 2020), cited in rule 7 (+22–23 points of consent from moving reject to a second page), and Blake et al. (2021) (+21% spend when fees deferred). Nouwens measured a *position* change; this is a *salience* change on the same page, with a larger effect. Rule 7 now has three independent experiments behind it, and the newest shows the effect survives even when the information is technically present.

**Finding 2. Mild manipulation produced no measurable backlash; aggressive manipulation did.** (T1)

Same study. Mild conditions produced "no discernable emotional backlash"; aggressive conditions left participants "significantly more upset." The awkward part: "when dark patterns were effective at leading people to a certain answer, there is no affective backlash." This **refines** the ethical test in section 5.4 of `05-critiques-pitfalls-and-measurement.md`, which says to audit conversion lifts for clarity versus suppressed choice. It adds a reason that audit cannot use satisfaction data: the manipulations that work best go unnoticed and draw no complaints. Complaint volume is not a safety net — the aesthetic-usability trap of `00-core-model.md` §6.2 in a commercial register.

**Finding 3. FTC, on the same experiment: "More than twice as many consumers in the hidden information group accepted the free trial offer as compared to consumers in the control group."** (T1)

FTC Bureau of Consumer Protection staff report, *Bringing Dark Patterns to Light*, 14 September 2022, p. 11. The report also documents LendingClub: the company "used tooltip buttons consumers were unlikely to click on during the online application process, and buried mention of fees later" in an un-bolded itemization, "below the fold."

A tooltip is a disclosure control. This is a US federal regulator describing a tooltip as the mechanism of a deceptive act — the sharpest available statement of the boundary rule 7 draws.

**Finding 4. The symmetry test now has a regulator's wording.** (T1) Same report, p. 14: "negative option sellers should provide cancellation mechanisms that are at least as easy to use as the method the consumer used to buy the product or sign up for the service," through the same medium, and sellers "should not subject consumers to new offers ... that impose unreasonable delays." This **confirms** the symmetry test in section 5.4 with a citable source rather than a derivation.

---

## 2. How asymmetric real products actually are

**Finding 5. Subscribing took 3.5 clicks; cancelling took 4.9 clicks in Europe and 5.8–6.2 in the US.** (T1)

Sheil, Acar, Schraffenberger, Gellert and Malone, CHI 2024. Five personas "successfully signed up for 67 subscriptions on 34 distinct news websites" across four countries, coded against 14 metrics. 63 of 67 could be cancelled online; four required a phone call or chatbot; Bloomberg's required "ten clicks." "Roughly 77.8% of the websites offered discounts" during US cancellation; 67.1% of European sites "requested reasons for leaving." Setting: news publishers, 2023, researcher personas rather than real users.

This **refines** the "roach motel" entry in section 5.2, which rested on Brignull's case list and a New York Times anecdote. The measured asymmetry is real but modest in the median case (1.4–2.7 extra clicks), with a long tail of severe cases. The typical offender is not a maze but a mild, deniable asymmetry plus a retention offer — so review should count clicks on both paths.

**Finding 6. Amazon's Prime cancellation was "a four-page, six-click, fifteen-option sequence"; enrolling took two clicks.** (T1)

FTC v. Amazon, settled September 2025 for $2.5bn. The FTC charged "manipulative, coercive, or deceptive" interface design: on desktop "a prominent button to join Prime, contrasted with a comparatively inconspicuous link to continue" without it; on mobile, disclosures "relegated to the bottom of the page and were viewable only by scrolling." The cancellation path was internally called the "Iliad Flow." Injunctive terms are in the table in section 8.

The largest price yet paid for the pattern rule 7 forbids; it **confirms** rule 7 at the level of enforcement rather than guidance. Note the *visual*-hierarchy finding: the decline option was not absent; it was a link next to a button.

---

## 3. Contextual versus upfront paywalls

This is where the sweep found the most numbers and the least agreement.

**Finding 7. Hard paywalls converted 12.11% of downloads to paid by day 35 versus 2.18% for freemium.** (T2)

RevenueCat, *State of Subscription Apps 2025*: 75,000 subscription apps, over $10bn tracked revenue. Also: year-one retention on monthly plans "a median of 12.8% versus 9.3%" in favour of hard paywalls; refund rates 5.8% versus 3.4%; "82% of trial starts occur the same day a user installs an app." The 2026 edition gives 10.7% versus 2.1%.

**This partly overturns gating rule 3** *as a universal claim*. In consumer subscription apps the upfront gate outconverts the contextual gate by roughly 5×, and 82% of trial starts happen on day zero, before any "moment of intent" could exist.

Three caveats stop this demolishing the rule. It compares *products*, not placements inside one product. The same report shows the cost — refunds 5.8% vs 3.4%, and far fewer users. And the segment is wrong for our purpose: RevenueCat's population is consumer apps optimising time-in-app, whereas `00-core-model.md` §8.1 scopes progressive disclosure to products whose metric is task completion. **Rule 3 should be scoped to multi-feature tools, not stated as universal.**

**Finding 8. The contradicting dataset.** (T2/T3) A 2026 analysis of the same numbers notes that Adapty's benchmark found soft paywalls outperforming hard ones, attributing the gap to different funnel measurement points. **The hard-versus-soft paywall literature is vendor benchmark data, and the vendors disagree.** No peer-reviewed randomised test of paywall placement was found.

**Finding 9. An honest paywall beat a fine-print paywall on conversion *and* complaints.** (T2)

Growth.Design's write-up of a Blinkist trial-paywall A/B test. Variant A: traditional paywall, hidden close button, asterisk with fine print, feature-focused copy. Variant B: transparency about trial terms and cancellation. B produced a 23% increase in trial signups, opt-in to push rising "from 6% to 74%," and a 55% decrease in customer complaints. Sample size and duration unpublished, so T2 at best.

The only result in the sweep where removing a hidden-catch pattern raised conversion. It **supports** gating rule 4 against the assumption that honesty costs conversion, but one unreplicated test with no published n cannot carry that load alone.

---

## 4. Freemium and tier design

**Finding 10. Extending a free trial from 3 to 7 days raised trial adoption 11.1% and delayed conversion 42.4%, with no significant effect on immediate conversion.** (T1)

Zhang and Duan, *Frontiers in Psychology*, 18 June 2025. Randomised field experiment with a global SaaS image-editing platform: 680,588 new users, 190 countries, 2022–2024. Trial adoption +11.098%; immediate conversion not significant (0.241% vs 0.224%, p > 0.1); delayed conversion +42.36% (0.205% vs 0.144%); overall +20.92%. The authors describe an "offsetting mechanism between learning benefits and demand cannibalization."

The best-powered experiment in the sweep, and it is about *time*, not *space*. The lesson: **the conversion effect of a gate shows up late, not at the gate.** A team measuring a gating change on same-session conversion will systematically prefer the more aggressive gate, because its cost — abandonment, refunds, churn — falls outside the window. That extends section 10 of `05-critiques-pitfalls-and-measurement.md`.

**Finding 11. Reducing free features raises conversion and virality but reduces usage.** (T1, abstract only)

Runge, Wagner, Claussen and Klapper, "Freemium Pricing: Evidence from a Large-Scale Field Experiment," ~300,000 users, three freemium variants: "A reduction of free product features increases conversion as well as viral activity, but reduces usage." Managers were "overly optimistic about positive externalities" and gave away too much free. Full text not fetchable (SSRN 403); ranked lower.

**Finding 12. Benchmarks for calibrating "is this gate working."** (T2) A 2026 ChartMogul / Growth Unhinged / ProductLed dataset of ~200 B2B software products: median freemium-to-paid 8%, bottom quartile under 2.5%, top quartiles 10–15%. Reverse trials land at 4–6% "good" and 8–12% "great." Lenny Rachitsky, 1,000+ products: 6–8% self-serve, 10–15% sales-assisted. Vendor-compiled; order-of-magnitude only.

**Finding 13. Degrading a product to make a cheaper version is perceived as unfair.** (T1, not fetched)

Gershoff, Kivetz and Keinan (*JCR* 39(2), 2012 — **old**, context only) ran six studies finding that versioning by *subtraction* is seen as unfair and unethical and lowers purchase intent, strongest when the degraded version closely resembles the full one. The in-scope follow-on (*Technology in Society*, 2019) says that for digital goods "downsizing is the rule rather than the exception, with most versions of digital information created by subtracting value rather than by adding it," creating "a risk of the organization losing customers and revenue." ScienceDirect returned 403, so method and effect sizes are unverified; ranked low.

Rule 1 says a locked feature stays "visible where it would live, with a lock and the plan name." The versioning literature is the only evidence-shaped argument *against* it: making the subtraction visible is exactly the condition under which it is judged unfair. Nobody has tested the two against each other — the sweep's most important open question.

---

## 5. Visible-but-locked, previews, and where the gate sits

Everything here is T3: what the industry does, not evidence.

**Finding 14. Design-system guidance separates permission-hiding from plan-gating exactly the way RULES.md does.** (T3)

GitLab's Pajamas feature-management page: "A feature is hidden when the user shouldn't have access to it due to a lack of permissions." For tiers, "Tier badge should only be displayed if the active plan is lower than that of the feature." Against disabled controls: "Exposing a message to explain why a feature is not available is preferable to disabling the feature" — e.g. "Merge blocked: all required approvals must be given" rather than a dead button.

This **confirms** three existing claims: the permission/plan split in the gated-features preamble, gating rule 2, and the Helios guidance in pattern 20 about hiding permission-gated items with an explanation. A second independent design system raises pattern 20 from one source to two.

**Finding 15. The industry gates at the action, not the entry point.** (T3)

Vendor guidance (Stigg, Orb) converges on: return entitlement status in the initial load "so the UI can render locked states upfront"; mark gated features with a consistent badge — "The key is consistency: same component, same behavior, across the product"; and gate "at the action layer rather than the view layer," e.g. "Design tools like Canva gate at the export step, not the browse step."

**This contradicts gating rule 7** ("No gate mid-task; the lock sits on the entry point"). The industry deliberately lets the user invest effort first, because sunk effort converts. The knowledge base should not simply adopt that: letting a user build something and then charging for the exit is structurally the drip-pricing move section 1 is about. The answer is a refinement of rule 7, in section 10.

A review of twelve SaaS products (Canva, Grammarly, Todoist, Buffer, Trello, ChatGPT, Ahrefs, Beehiiv) adds three conventions: show usage against the limit continuously, not only at the wall; use one distinctive mark for premium so users know before clicking; and replace the generic upgrade modal with a real explanation. No measurements accompany these.

**Finding 16. Blurred previews: no evidence found.** The search terms returned only vendor documentation for creator platforms and membership plugins. Gating rule 8 ("Preview where possible") is unevidenced in either direction.

---

## 6. Upgrade requests from users who cannot buy

**Finding 17. A shipped implementation carries five fields, not one.** (T3)

Figma's seat-upgrade request flow. Admins see "the name of the requester, requested seat type, and the cost of the seat change," and in the detail panel "where the user sent the request from, request reason, current seat, time of request, and the cost to add the new seat." Requests arrive in the admin dashboard, by email, in-app and via Slack, where admins can approve directly.

Gating rule 5 says the request must name the feature. Figma's shipped version also carries **origin** and **cost** — both decision-critical for the approver, who is the one making a price decision, so rule 7 of the main eight applies to *their* screen too.

**Finding 18. The buyer-user split is named but not measured.** (T3) Practitioner writing describes the structural problem — the daily user is not the approver — but no source reports approval rates, time-to-approval, or the value of an in-product request versus an out-of-band ask.

---

## 7. Nagging and "unlock" prompts

**Finding 19. Nagging appears in 55% of popular apps, and most users do not notice it.** (T1)

Di Geronimo et al., CHI 2020: 240 popular Google Play apps analysed in their first ten minutes of use, plus an online experiment with 589 users. "95% of the analyzed apps contain one or more forms of Dark Patterns," on average seven each. The CMA's reproduction of the distribution: false hierarchy 61%, pre-selected defaults 60%, "prompts and reminders (ie nagging – 55%)," roach motel 41%. Users "do not identify [these] practices when exposed to them, but were able to perform better in recognising them if they were informed what to look for."

This **confirms** finding 2 by a different method: users do not spontaneously recognise the pattern, so absence of complaints is not evidence of absence of harm. Together the two make "we A/B tested it and nobody complained" an inadmissible defence of a gating design.

**Finding 20. Repeated prompting after a choice has been made is now named in EU law.** (T1)

DSA Article 25(1): platforms "shall not design, organise or operate their online interfaces in a way that deceives or manipulates the recipients of their service or in a way that otherwise materially distorts or impairs the ability of the recipients of their service to make free and informed decisions." Article 25(3) lists practices guidelines may cover, including (b) "repeatedly requesting that the recipient of the service make a choice where that choice has already been made, especially by presenting pop-ups that interfere with the user experience" and (c) "making the procedure for terminating a service more difficult than subscribing to it."

Article 25(3)(b) is the nag screen in legislative language. Article 25(2) carves out practices already covered by the UCPD and GDPR, which — per the European Parliament's research service — "creates legal uncertainty." The nag screen is now a named risk in at least one legal instrument, even if which instrument applies to a given case is contested.

---

## 8. The regulatory map since 2018, in one place

All T1.

| Instrument | Date | What it does to feature gating, drip pricing or cancellation |
|---|---|---|
| FTC *Bringing Dark Patterns to Light* | 14 Sep 2022 | Names tooltips, below-the-fold placement and fine print as mechanisms of deception; restates ROSCA cancellation symmetry |
| FTC v. Epic Games | Dec 2022, finalised Mar 2023 | $245m for "counterintuitive, inconsistent, and confusing button configuration"; bars charging via dark patterns and locking accounts of users who dispute charges |
| EDPB Guidelines 03/2022 v2.0 | 14 Feb 2023 | Six categories, including "Overloading" — users "buried under large amounts of requests, information, options" |
| DSA Article 25 | 2023–24 | Prohibits interfaces that deceive, manipulate or distort free and informed decisions; 25(3)(b) nagging, 25(3)(c) cancel-harder-than-subscribe |
| DMA Article 13 | 2023 | Anti-circumvention rule against gatekeepers using design to influence user choices |
| AI Act Art. 5(1)(a)–(b) | 2024 | Prohibits subliminal, purposefully manipulative or deceptive techniques and exploitation of vulnerabilities |
| Consumer Rights Directive Art. 16(e) | 2023 | Explicit dark-pattern prohibition for distance financial-services contracts |
| FTC junk-fees rule | final Dec 2024, effective 12 May 2025 | Total price inclusive of mandatory fees whenever a price is offered, displayed or advertised |
| FTC Negative Option ("click to cancel") Rule | vacated 8 Jul 2025 (8th Cir.); new rulemaking 30 Jan 2026 | Required separate consent and simple click-to-cancel; vacated on procedure, not merits. ROSCA, state ARLs and FTC Section 5 still apply |
| FTC v. Amazon settlement | Sep 2025 | $2.5bn; mandates a clear and conspicuous decline button, point-of-enrolment disclosure of price and renewal terms, and a cancellation path free of "difficult, confusing, or time-consuming prompts" |
| CMA price-transparency guidance (DMCC) | 18 Nov 2025 | Full price upfront; mandatory service fees in the headline price; fines to 10% of global turnover |
| EU Digital Fairness Act | consultation Jul–Nov 2025; proposal Q3 2026 | Would consolidate dark-pattern, subscription-trap and pricing rules and close the DSA/UCPD/GDPR overlap |

Section 5 of the critiques memo cites only the FTC junk-fee rule and the CMA guidance. **This table adds eight instruments and one reversal.** The reversal matters: the US federal click-to-cancel rule is gone, but its standard survives in ROSCA enforcement, state law and the Amazon order. The design rule does not change; only the citation does.

**Finding 21. Partitioned pricing misled consumers more than drip pricing did.** (T1) CMA, *Evidence Review of Online Choice Architecture*, 14 April 2022, ¶6.52, reporting Robbert and Roth (2014): "Participants exposed to partitioned pricing underestimated the total price by approximately 11%, and those exposed to drip pricing underestimated the price by approximately 3.2%." Partitioned pricing shows every component but never the total. For an upgrade panel: **showing every component of the price is not the same as showing the price.** Gating rule 4 should require the total, per period, not a breakdown.

---

## 9. Seat-based versus usage-based gating

**Finding 22. Usage-based companies reported ~10 points higher net revenue retention than seat-based peers.** (T2, low confidence)

OpenView's *State of Usage-Based Pricing* series is the origin of nearly every number in circulation, and its URLs no longer resolve (OpenView wound down in 2024). Secondary reporting of the July–August 2022 private-company survey: usage-based 125% NRR versus 115% for subscription peers, 33.7% versus 23.2% growth. For public companies, usage-based pricing "grew revenue 38% faster" with "~25% higher net dollar retention." Adoption: ~45% of SaaS companies in 2021.

**Treat these as unverified:** primary sources gone, self-reported surveys, between-company comparison. What survives is the mechanism — usage-based revenue expands without an upsell conversation; seat-based does not.

**Why it belongs here.** Seat gating produces the request-to-admin flow of finding 17 and a binary locked/unlocked interface. Usage gating produces a *meter*, and a meter is decision-critical information that must be visible continuously — the one piece of practitioner guidance in finding 15 that follows from rule 7 rather than from conversion optimisation.

---

## 10. What the ten gating rules should become

Verdicts against the current text in RULES.md.

1. **"Visible where it would live, with a lock and the plan name."** *Unevidenced, and now contested.* No controlled test exists; the versioning-unfairness literature (finding 13) is the only evidence-shaped argument against it. Keep the rule, but mark it a design position rather than a finding, and record the counter-argument.
2. **"A real control, not a disabled one."** *Confirmed.* GitLab Pajamas independently: explanation beats disabling. Add the citation.
3. **"Explained at the moment of intent, never in a banner or a tour."** *Needs scoping.* RevenueCat's 75,000-app benchmark shows upfront gates outconverting contextual ones ~5× in consumer subscription apps, with 82% of trial starts on day zero. Scope the rule to multi-feature tools where task completion is the business metric (`00-core-model.md` §8.1), and say so.
4. **"The price is in the panel, before the button."** *Strongly confirmed, and should be strengthened.* Add: the **total** for the period, not a component breakdown (finding 21). This is the best-evidenced of the ten.
5. **"Someone who cannot upgrade can ask the admin from the same panel, with the feature named."** *Confirmed, and should be extended.* Figma's shipped flow carries requester, seat type, **cost**, origin and reason. The admin is making a price decision, so rule 7 of the main eight applies to the request itself: add cost and origin.
6. **"Safety and decision-critical items are on every plan."** *Confirmed by the whole regulatory section.* No change.
7. **"No gate mid-task; the lock sits on the entry point."** *Contradicted by practice; refine rather than reverse.* The industry gates at the action (Canva at export). Proposed wording: *the lock must be visible at the entry point, and no gate may appear after the user has produced work they cannot keep.* That preserves the anti-drip-pricing principle without banning a pattern the whole industry uses.
8. **"Preview where possible."** *Unevidenced in either direction.* Keep as a design position; delete any implication that it is backed by research.
9. **"Usage still decides the level; a lock does not promote an item."** *No evidence found.* Keep.
10. **"Nothing moves when unlocked."** *No direct evidence, but consistent with rule 6 of the main eight* (spatial stability; Findlater and McGrenere; Jensen Harris on Office 2000). Add that cross-reference — the closest thing to support the rule has.

Of the main eight rules, only **rule 7** needs a change, and it is an addition, not a correction: its evidence grows from Nouwens and Blake to include Luguri and Strahilevitz, the FTC's tooltip finding, the Amazon order and the CMA's partitioned-pricing number. Its consequence line should gain a sentence: satisfaction and complaint data cannot check whether a lift came from clarity or suppressed choice, because the manipulations that work best go unnoticed (findings 2 and 19).

---

## Still unknown

- **Visible-locked versus hidden, head to head.** No experiment, anywhere, 2018–2026: not conversion, satisfaction, complaint volume or time-to-discovery.
- **Whether a lock harms the non-buyer.** The versioning-unfairness literature predicts it might; nobody has measured a permanently visible lock's effect on retention among users who will never upgrade.
- **Blurred or shaped previews.** Zero measurements found for gating rule 8.
- **Upgrade-request outcomes.** No published approval rate, time-to-approval, or comparison between an in-product request and an out-of-band ask.
- **Nag frequency.** Di Geronimo shows nagging is common; no study relates prompt frequency to churn, conversion or annoyance in a subscription product.
- **Gate placement within a task.** No test of entry-point versus action-point gating — exactly the disagreement between gating rule 7 and industry practice.
- **B2B-specific paywall evidence.** Every quantified paywall finding here comes from consumer apps or news publishers. No CHI/CSCW-quality study of enterprise plan gating exists.
- **Whether the "Premium section" anti-pattern is actually worse.** Gating rule 1 forbids moving locked features to a separate section; nothing tests it.

Not fetched, so ranked lower: SSRN (Runge et al., 403), ScienceDirect (*Technology in Society* 2019; *IJIM* 2024, both 403), Taylor & Francis (*Int. J. Advertising* 2023, 403), ACM DL (the arXiv version of the CHI 2024 roach-motel paper was used), and the OpenView primaries (site retired). The session's search budget ran out before the Adapty and Superwall placement benchmarks could be retrieved.

---

## Bibliography

**Peer-reviewed and regulator-published (T1)**

1. Luguri, J. & Strahilevitz, L. "Shining a Light on Dark Patterns." *Journal of Legal Analysis* 13(1), 2021. https://academic.oup.com/jla/article/13/1/43/6180579
2. Sheil, A. et al. "Staying at the Roach Motel: Cross-Country Analysis of Manipulative Subscription and Cancellation Flows." CHI 2024. https://arxiv.org/html/2309.17145
3. Di Geronimo, L. et al. "UI Dark Patterns and Where to Find Them." CHI 2020. https://dl.acm.org/doi/10.1145/3313831.3376600
4. Mathur, A. et al. "Dark Patterns at Scale: Findings from a Crawl of 11K Shopping Websites." CSCW 2019. https://arxiv.org/abs/1907.07032
5. Zhang, L. & Duan, J. "Longer or shorter? ... free trial duration ... in the Freemium model." *Frontiers in Psychology*, 18 Jun 2025. https://pmc.ncbi.nlm.nih.gov/articles/PMC12217587/
6. Zhang, G. X. et al. "First Contact with Dark Patterns ... Chinese and Japanese Free-to-Play Mobile Games." *PACM HCI*, 2025. https://arxiv.org/html/2511.17512v1
7. Runge, J. et al. "Freemium Pricing: Evidence from a Large-scale Field Experiment." *Academy of Management Proceedings*, 2017. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2888471 (not fetched)
8. "Versioning products and services by downsizing digital components." *Technology in Society*, 2019. https://www.sciencedirect.com/science/article/abs/pii/S0160791X19300119 (not fetched)
9. Gershoff, A., Kivetz, R. & Keinan, A. "Consumer Response to Versioning." *JCR* 39(2), 2012 — **old, context only**. https://academic.oup.com/jcr/article-abstract/39/2/382/1798114
10. FTC. *Bringing Dark Patterns to Light*, 14 Sep 2022. https://www.ftc.gov/system/files/ftc_gov/pdf/P214800+Dark+Patterns+Report+9.14.2022+-+FINAL.pdf
11. CMA. *Evidence Review of Online Choice Architecture*, 14 Apr 2022. https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1069423/OCA_Evidence_Review_Paper_14.4.22.pdf
12. EDPB. *Guidelines 03/2022 on deceptive design patterns in social media platform interfaces*, v2.0, 14 Feb 2023. https://www.edpb.europa.eu/system/files/documents/2023-02/edpb_03-2022_guidelines_on_deceptive_design_patterns_in_social_media_platform_interfaces_v2_en_0.pdf
13. Regulation (EU) 2022/2065 (DSA), Article 25. https://www.eu-digital-services-act.com/Digital_Services_Act_Article_25.html
14. EPRS. "Regulating dark patterns in the EU: Towards digital fairness," PE 767.191, Jan 2025. https://www.europarl.europa.eu/RegData/etudes/ATAG/2025/767191/EPRS_ATA(2025)767191_EN.pdf
15. FTC. Epic Games $245m settlement, Dec 2022; order finalised Mar 2023. https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-finalizes-order-requiring-fortnite-maker-epic-games-pay-245-million-tricking-users-making
16. National Law Review. "FTC's Landmark $2.5 Billion Amazon Settlement," Oct 2025. https://natlawreview.com/article/ftcs-landmark-25-billion-amazon-settlement-highlights-ongoing-focus-dark-patterns
17. Cooley. "Click to Cancel Just Got Cancelled: Eighth Circuit Vacates ... FTC's Negative Option Rule," 11 Jul 2025. https://www.cooley.com/news/insight/2025/2025-07-11-click-to-cancel-just-got-cancelled-eighth-circuit-vacates-entirety-of-ftcs-negative-option-rule
18. Gibson Dunn. "FTC Restarts Negative Option Rulemaking After Eighth Circuit Vacatur," 2026. https://www.gibsondunn.com/ftc-restarts-negative-option-rulemaking-after-eighth-circuit-vacatur-enforcement-under-rosca-continues/
19. European Parliament Legislative Train. "Digital Fairness Act." https://www.europarl.europa.eu/legislative-train/theme-protecting-our-democracy-upholding-our-values/file-digital-fairness-act

**Industry research with published samples (T2)**

20. RevenueCat. *State of Subscription Apps 2025* (75,000 apps). https://www.revenuecat.com/state-of-subscription-apps-2025
21. RevenueCat. *State of Subscription Apps 2026*. https://www.revenuecat.com/state-of-subscription-apps
22. Growth.Design. "How Blinkist Increased Trial Conversions by 23%." https://growth.design/case-studies/trial-paywall-challenge
23. Userpilot, "Why Freemium-to-Premium Conversions Are Flopping" (compiling ChartMogul/ProductLed 2026, Rachitsky, Poyar). https://userpilot.com/blog/freemium-to-premium/
24. The Founders Report, "Usage-Based vs. Per-Seat Pricing" (reporting OpenView 2021–2023 surveys; primaries no longer available). https://www.thefoundersreport.com/usage-based-vs-per-seat-pricing-the-retention-numbers-that-should-decide-it
25. neoads. "2.1% vs 10.7%: the paywall data that changes the strategy" (RevenueCat 2026; notes Adapty's contradicting benchmark). https://neoads.substack.com/p/hard-paywalls-convert-less-but-earn

**Practitioner and vendor guidance (T3)**

26. GitLab Pajamas. "Feature management." https://design.gitlab.com/usability/feature-management
27. Figma Help. "Approve or decline seat upgrade requests." https://help.figma.com/hc/en-us/articles/1500003870721-Approve-or-decline-seat-upgrade-requests
28. Stigg. "Feature Gating & 8 Ways to Implement It." https://www.stigg.io/blog-posts/feature-gating
29. Orb. "What is feature gating?" https://www.withorb.com/blog/feature-gating
30. de Becker, A. "A study in feature gating" (12 SaaS products). https://alexdebecker.substack.com/p/a-study-in-feature-gating
