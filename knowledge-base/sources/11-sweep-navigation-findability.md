# Sweep: Navigation and Findability, 2018–2026

*Research sweep, compiled 2026-09-14. Gap assigned: navigation and findability evidence since 2018. Related older memo: [05-critiques-pitfalls-and-measurement.md](05-critiques-pitfalls-and-measurement.md), sections 1–3. Every source below was fetched during this pass unless the text says otherwise. Sources are tier-labelled: **T1** peer-reviewed, **T2** industry research with published numbers and a stated method, **T3** practitioner essay, vendor documentation or uncommissioned anecdote.*

**Method caveat, stated up front.** This pass exhausted its web-search budget partway through and the remaining work was done by fetching known URLs directly. Two consequences: the coverage of the academic literature (CHI/CSCW/UIST/IJHCS) on navigation findability since 2018 is thin, and several practitioner benchmarks that appeared only in search snippets could not be verified at source. Those are named and ranked down where they appear, and listed again under "Still unknown."

---

## 1. Has anyone re-run the 2016 hidden-navigation study? No.

The KB leans hard on Pernice & Budiu, "Hamburger Menus and Hidden Navigation Hurt UX Metrics" (NN/g, 2016): hidden desktop navigation used in 27% of cases vs 48–50% visible/combo, task success more than 20 points lower, desktop users at least 39% slower, perceived difficulty 2.6 vs 2.1. Core model §6.3 lists four of those numbers; RULES rule 4 cites three.

**Finding 1.1 — the study has not been replicated, and its companions are not new evidence. (T2)**

Two NN/g articles are widely cited as newer follow-ups: "Beyond the Hamburger: What Makes Navigation Discoverable on Desktops" and its mobile companion. Both are by Pernice & Budiu and both are dated **24 July 2016**. They are per-site breakdowns of the *same* 179-participant, 6-site study (7digital, BBC, Bloomberg Business, Business Insider UK, Supermarket HQ, Slate), not a re-test. The desktop piece shows the variation inside the headline number: Slate's navigation was used by "Only 17% of people ... as opposed to the 42% total average," Bloomberg 28%, BBC and 7digital "over 43%," with 33 seconds to navigation on Slate versus "the desktop average of 25 seconds." On mobile, "People used the navigation significantly more on SupermarketHQ (89% usage) than on Bloomberg (44% usage)."

*Status:* **confirms** the KB's citation and **refines** its precision. The "27% vs 48–50%" figures average over sites whose individual usage ranged from 17% to 89% — site design, not just the hidden/visible binary, moves the number by a factor of five.

**Finding 1.2 — NN/g's 2025 update changes the icon verdict, not the interaction-cost verdict. (T2, method partly unpublished)**

Kate Kaplan, "The Hamburger-Menu Icon Today: Is it Recognizable?" (NN/g, **13 June 2025**), reports research for the NN/g Press book *Digital Icons That Work*, in which "participants were shown dozens of hamburger icons in context and asked to predict their function." Sample size, population and protocol are **not published**, so it ranks below the 2016 study.

Participants "correctly identified the hamburger icon as the main menu or top-level site categories, especially when it appeared in expected locations and with standard styling (3 stacked lines of equal length)." Even a two-line variant and one with a superimposed arrowhead were read correctly top-left; position carried the recognition. On the limits, and on what has not changed:

> "because this study examined recognizability only, we can't speak to whether task time or success rates for tasks involving the hamburger menu have changed over the years."
> "Hiding navigation always introduces an interaction cost, because users must take an extra step to access key options, and important content remains out of sight."
> "If you don't need to hide navigation, don't."

*Status:* **refines** memo 05 §1.2 and RULES rule 4. The 2014 claim that icons are ambiguous no longer holds for the hamburger: a decade of exposure made this one icon legible. The 2016 usage and success penalties are **untouched**, because nobody has re-measured them. The KB should stop implying the hamburger's problem is recognition; its problem is the extra step and the loss of scope cues.

**Finding 1.3 — a new failure mode: hamburger interference. (T2, same unpublished method)**

Three-stacked-lines is now such a strong signal that *other* line-based icons in navigation positions get misread as menus: in Apple Notes a top-left list-view icon was one "users frequently interpreted ... as a navigation menu," and a YouTube mobile filter icon was read as "categories or favorites." **New**, and relevant to icon-only rails: an icon rail's top-left item now inherits a menu meaning whether you intended it or not.

**Finding 1.4 — NN/g's 2024 guidance did not soften. (T2)**

Page Laubheimer, "Menu-Design Checklist: 17 UX Guidelines" (NN/g, **7 June 2024**), guideline 1: "the hamburger menu (or any form of hiding the navigation categories under a single menu) is not appropriate for desktop websites and apps. Out of sight means out of mind." And: "Navigation serves roles beyond wayfinding; it helps users to understand the scope of your resources or content. If your navigation is hidden, users lose out on those context cues."

It also gives the expected location of primary navigation by product type — **"Websites: Header / Applications: Left side of the screen"** — and adds that "Failing to indicate the current location is probably the single most common mistake we see on website menus."

*Status:* **confirms** rules 1 and 4, and adds a B2B fact the KB lacked: the left rail is the *expected* location for application primary navigation, so hiding or moving it costs convention as well as visibility.

## 2. Combo navigation: still the best-supported middle position, still un-retested

The 2016 study's "combo" condition (some items visible, rest hidden) scored best or equal-best on every metric: 50% usage on desktop, 86% on mobile. No post-2018 experiment re-testing combo navigation was found.

The nearest new evidence is indirect but in the same direction. Baymard Institute, "Make Product Categories the Top-Level Navigation Items on Mobile Sites (33% Don't)," Edward Scott, **24 January 2023** (T2; large-scale moderated usability testing plus a benchmark of 180+ sites). The finding:

> "while seemingly only a minor increase in friction, testing revealed that nesting the main product categories in the mobile main nav can lead to users abandoning navigating the site via the main navigation (e.g., in favor of search)."
> "our e-commerce UX benchmark reveals that 33% of mobile sites fail to make the product categories the top-level items in the mobile main navigation."

Participants at Target, Walgreens, Sephora and Kohl's opened the menu, failed to find a browse entry point, and left for search or the homepage.

*Status:* **confirms** the combo principle and **extends** it one level down. The 2016 result was about hiding the menu; this is about hiding the menu's *contents* behind one more label, and the consequence is not slower navigation but **channel abandonment** — users switch to search, making success depend on the search engine rather than the IA. That mechanism matters for rule 2: a third level does not just cost clicks, it silently moves traffic to a different, unmeasured route.

---

## 3. Icon-only rails versus labelled sidebars

**Finding 3.1 — NN/g's position on icon-only application navigation. (T2)**

Page Laubheimer, "Left-Side Vertical Navigation on Desktop" (NN/g, **16 May 2021**). On icon-only navigation: "A word is worth a thousand pictures." Text labels "reduce ambiguity" and "increase the target size"; icon-only designs increase "interaction cost" and "cognitive load." He recommends vertical left navigation for "large organizations that may continually evolve their offerings or content, in areas such as B2B, enterprise, government, higher education, and healthcare," because "Adding additional categories to the vertical navigation doesn't require a major process of redesigning the navigation UI." The cost: "a lower content-to-chrome ratio than horizontal navigation."

*Status:* **confirms** RULES rule 4 and memo 05 §1.2, and supplies the B2B reason to prefer a labelled left rail over a top bar — it scales without redesign. **No controlled comparison of icon-only against labelled rails published 2018 or later was found.**

**Finding 3.2 — kebab and meatball icons are recognised but carry no scent. (T2, method partly unpublished)**

Kate Kaplan, "Designing Effective Contextual Menus: 10 Guidelines" (NN/g, **28 November 2025**), from the same *Digital Icons That Work* research:

> "both kebab (⋮) and meatball (⋯) icons were generally recognized to mean 'more options' or 'other actions' ... This was true across both mobile and desktop applications."
> "Despite this general understanding, users often had little idea what specific options were hidden behind the kebab and meatball icons because they have low information scent, even when recognizable."

Contextual menus "were missed entirely" when the icon sat far from the content it affected, was too small, or was low contrast. Guideline 1: "Don't: Hide essential, high-frequency actions behind an extra tap or click ... Burying key actions frustrates users who perform the task frequently." The named bad example is an AT&T chat that put **End Chat** inside a kebab menu.

*Status:* **refines** memo 05 §1.2 and **confirms** rule 1 from a new direction. Recognition and scent are demonstrably separable: users know the door is a door and still cannot guess what is behind it. Pair the KB's "0% click-through on an unlabelled non-standard icon" with this: a *standard* overflow icon is recognised reliably and still yields near-zero prediction of its contents.

**Finding 3.3 — a documented B2B decision to abandon the icon-only rail. (T3, primary-source design artifact)**

GitLab issue #378544 (2022–2023) is the rationale for GitLab's 2023 sidebar. GitLab replaced its icon-only minimised rail with a **fully hidden** sidebar revealed by hover, because doing so "Reduces the dependency on iconography that we have with the current collapsed sidebar today, as once users expose the sidebar they will have the full version that includes labels." Their own listed concerns are the counter-argument: users "lose the affordance of their current context when the breadcrumbs are not in view," assigned items visible in the old rail "would require a hover in this new experience," and "For experienced users within GitLab, iconography may be sufficient and preferred."

Three implementation details are directly usable: auto-collapse below a 1200px viewport; "If a user has collapsed the sidebar, respect this preference across pages"; and a list of pages (Global Search, Profile, Help, Settings) kept **expanded by default regardless of the user's collapse preference** because "This exposes important information on these pages that a user may not know exists otherwise." The accessibility notes concede the overlay "will not show on `focus`, only `hover`," with mitigations that restate WCAG 1.4.13. Companion issue #389958 keeps open a return to a "minimized functional collapsed state."

*Status:* **confirms** RULES rules 4 and 5 with a real B2B artifact. Note the asymmetry GitLab chose: they override the user's own collapse preference on pages where hidden content would otherwise be undiscoverable — a defensible exception to rule 5 the KB does not currently allow for.

## 4. Sidebars that differ by role or workspace type

This is the thinnest area of the sweep. **No controlled study of role-differentiated navigation in enterprise software, published 2018 or later, was found.**

**Finding 4.1 — GitLab's persona-based navigation research. (T2 method, qualitative results)**

Ashley Knobloch, "How we overhauled GitLab navigation," GitLab blog, **15 August 2023**. Methods named: **diary studies** with persona cohorts; facilitated **card sorts**; rounds of comparative solution validation; an opt-in external toggle; a **month-long longitudinal study** with interviews at three checkpoints; and a **quarterly navigation survey** started Q1 2023 to baseline the old navigation before the Q2 switch. No participant counts, success rates or survey scores are published; results are reported as themes.

The load-bearing findings: "We have 16 personas to represent different types of users, all with unique goals and techniques to achieve those goals," and "users' work is quite scoped in GitLab, and they would like easier access to some of their core features without having to wade through all of the other features they don't use." Three themes drove the redesign: "minimize feeling overwhelmed (ability to customize left sidebar)," "orient users across the platform," and "pick up where you left off." Longitudinal participants "found the new navigation to be an improvement" and "most preferred its features," naming pinning and task-based categories that "felt more approachable, especially for newer users." Reported problems: "the inability to pin entire Projects, Groups, or specific pages" and "some users unpin items accidentally."

*Status:* **confirms** core model §8.3.1 (multiple personas, different level-1 needs) and **refines** RULES rule 6. GitLab's answer to per-role level-1 was **user-controlled pinning**, not system inference — the shape McGrenere, Baecker & Booth's 2002 two-interface result predicts — and the accidental-unpin complaint is the predictable failure of a user-controlled mechanism with a cheap destructive gesture.

**Finding 4.2 — role-scoped navigation as vendor practice, not evidence. (T3)**

Microsoft's Dynamics 365 Customer Service documentation maps security roles to three fixed personas — admin, supervisor, agent — and lets admins "Create and maintain targeted app experiences for service representatives and supervisors through app profiles, session templates, and notification templates," plus enable access to forms and dashboards per role. This is the Salesforce Lightning App Builder pattern the core model already names: the admin composes the disclosure for end users. Documentation, not measurement; it **confirms** core model §8.3.2 as current practice.

## 5. Command palettes as a navigation route

**Finding 5.1 — standard in developer-facing B2B tools; adoption rates unpublished. (T3, vendor documentation)**

- **GitLab** (docs, current): the palette is reached through the existing global search box, then a sigil selects a mode — `>` for "Create a new object or find a menu item," `@` users, `:` projects, `~` repository files. Free through Ultimate, on .com, Self-Managed and Dedicated. It is **on by default** and is an extension of search, not a separate surface.
- **GitHub** (docs, current): Ctrl/Cmd + K, with a project-scoped variant. Two facts matter. It is documented **under Accessibility**, and: *"The GitHub Command Palette is currently in public preview and is subject to change. The GitHub Command Palette is deactivated by default. You can enable the GitHub Command Palette with feature preview."*

*Status:* **refines** core model §7 and RULES rule 8, which present the command palette as *the* expert accelerator. GitHub's is still preview-grade and off by default years after launch, so it cannot be relied on as a findability route. GitLab shows the more defensible B2B architecture: fold the palette into the search field users already have, so it inherits search's discoverability instead of needing its own.

**Finding 5.2 — design principles, restated by two B2B vendors. (T3)**

Superhuman (Tim Boucher, **12 Oct 2021**) gives five principles: availability ("Make your command palette available everywhere"), centralization ("find every command in one place"), omnipotence, forgiving fuzzy matching, contextual relevance. The teaching mechanic the KB already cites is confirmed: users "instantly do any action — and also learn the shortcut for next time." **No adoption numbers.** Retool (Andrew Shen, **9 Dec 2022**) is motivated by scale — "over 100 components, each of which can contain upwards of 50 customizable properties" — and publishes **no usage data**.

**Finding 5.3 — the "<2% of Gmail users have ever used a keyboard shortcut" figure. (T3, unverified)**

Attributed to Superhuman's Rahul Vohra, sourced to a podcast clip that could not be fetched, with no published method. **Treat as anecdote.** It is directionally consistent with Spool's <5% settings figure the KB already carries, and should be used only as a second illustration of that point, never as an independent measurement.

## 6. Findability of what is not in the menu

**Finding 6.1 — a large share of B2B entry is external deep links, not navigation. (T2 method, qualitative result)**

The GitLab diary studies (source as 4.1) produced the most consequential finding of this sweep for the KB:

> "We learned that for some users, many of their primary tasks don't require much navigation within GitLab because they use outside tools that link into GitLab through notifications (e.g., Slack and email) or use direct links through other tools."

The same study catalogues the workarounds users invented in place of navigation: "creating browser bookmarks, typing in the URL to pull browser history, or keeping a bunch of browser tabs open."

*Status:* **new, and it qualifies rule 1.** The KB assumes the screen's navigation is the route to a feature and prices hiding accordingly. For a meaningful slice of B2B users the route is a Slack notification or a bookmarked URL, and the menu is scenery. Two implications: a feature can be heavily used and never appear in navigation analytics, so "nobody clicks it in the menu" is not evidence it is unused; and users who "often don't enter from the homepage" depend entirely on the current-location indicator to orient — which Baymard found **95% of sites omit**.

**Finding 6.2 — global and enterprise search adoption, where numbers exist. (T2, vendor-commissioned)**

Forrester Total Economic Impact of Glean, **September 2024**, commissioned by Glean. Composite organisation: 10,000 employees, $13bn revenue. Published figures: "93% of employees use Glean at full deployment," ramping from 80% in year 1; "The average user saves 60 hours annually utilizing Glean for search"; "20% reduction in support requests."

*Status:* **directional only.** A vendor-commissioned study on a modelled composite is the weakest form of T2. Defensible reading: when a company deploys a dedicated cross-app search tool and pushes it, adoption in the 80–93% range is claimed as achievable. It says nothing about what share of users invoke *in-product* global search in an ordinary B2B application.

**Finding 6.3 — the state of current-location signalling and menu execution. (T2)**

Baymard Institute, "Homepage & Navigation UX Best Practices," published **6 August 2024**, updated **30 September 2025**. Method: "16,000+ Homepage and Category Navigation UX elements manually reviewed and scored" across "180+ leading US and European ecommerce sites."

| Metric | Figure |
|---|---|
| Desktop sites whose homepage & category navigation is "mediocre" to "poor" | 58% |
| Mobile sites, same measure | 67% |
| Sites that don't highlight the user's current scope in main navigation | 95% |
| Sites lacking a hover delay for dropdown menus | 61% |
| Sites that don't divide categories into manageable chunks | 60% |
| Mobile sites not exposing top-level product categories | 33% |

*Status:* **confirms** memo 05 §1.3 (hover timing) with a prevalence number the KB lacked — 61% of large e-commerce sites still fail the hover-delay guideline NN/g published in 2015 — and quantifies the "where am I" failure at 95%. B2C e-commerce; transfer to B2B with that caveat.

## 7. Mega-menus

No new experimental evidence since 2018 was found; NN/g's mega-menu articles remain 2009–2010 (the USA.gov test is dated 2010, reviewed 2018). The current restatement sits inside the 2024 Menu-Design Checklist:

> Guideline 9: "If typical user journeys involve drilling down through several levels, mega menus can save users time by letting them skip a level (or two)."
> Guideline 4: "On large screens, don't cover the entire screen when megamenus (or submenus) are open ... Some users will experience temporary disorientation and mistakenly believe that they have accidentally navigated to a new page."

Baymard's 61% hover-delay failure and 60% "don't divide categories into manageable chunks" are the current prevalence data for mega-menu execution.

*Status:* **confirms** the KB's existing position. Worth noting for rule 2: a mega-menu is the standard way to *flatten* rather than deepen — it trades two disclosure levels for one dense visible surface, the same trade Landauer & Nachbar's breadth-beats-depth result recommends.

---

## 8. Mobile navigation, and what transfers to B2B

**Finding 8.1 — bottom navigation beats hidden navigation, but the good numbers are pre-2018. (T3)**

The two figures practitioners cite — Spotify's tab-bar switch producing "9% more" clicks overall and "30% more on actual menu items," and Zeebox's "55 percent average weekly frequency of use" — are both roughly 2014–2016 and **are old by this brief's rule**. Neither original was fetched.

The one in-window A/B test located is BodyGuardz (blog dated **13 December 2021**; four-week test, May–June 2021, mobile traffic split 50/50 between a top menu and a bottom navigation menu). Published result: "the results weren't as dramatic with increased engagement of 3.3%" to the Shopping Cart page. It claims "huge improvements in our click-through rate for our Search menu and Live Chat feature" **but publishes no numbers for them.**

*Status:* **confirms** direction, adds no reliable magnitude. The honest summary: the modern effect size of moving navigation from hidden to persistently visible on mobile is **not established by any post-2018 published test**.

**Finding 8.2 — B2B mobile navigation specifically. (no evidence)**

Nothing. Every mobile navigation benchmark located (Baymard, the A/B cases above) is consumer e-commerce. The KB's existing warning about *disclosure drift* across breakpoints (memo 05 §8, from NN/g's 2024 breakpoints article) remains the best available guidance and is unvalidated for B2B applications.

---

## 9. Tree testing and first-click benchmarks since 2018

**Finding 9.1 — the first real tree-testing benchmark distribution. (T2)**

Page Laubheimer, "Tree Testing Part 2: Interpreting the Results" (NN/g, **19 January 2024**), citing a review by Bill Albert and Tom Tullis of **98 tree-testing studies**:

> "the median success rate for tasks was 62%, with the interquartile range from 37% – 83%"

It publishes a rubric — **Poor <40%; Fair 41–60%; Good 61–80%; Very Good 80–90%; Excellent >90%** — and a sample-size guideline: "Typically, 50+ participants per tree are needed for a quantitative study to achieve reasonably narrow confidence intervals." No equivalent distribution for directness.

*Status:* **overturns a target the KB set without evidence.** Memo 05 §10.6 step 2 says "target >70–80% success with high directness on primary tasks." Against a median of 62% and a lower quartile of 37%, that sits *above* the industry norm — fine as an aspiration, but it must be labelled as one. Replace the bare "70–80%" with the rubric plus the median, and say which is being used.

**Finding 9.2 — directness is defined but not benchmarked. (T3, vendor documentation)**

Optimal Workshop's guide defines success as "the average percentage of participants who landed on the correct destination across all tasks" and directness as "the average percentage of participants who selected a destination without backtracking," with the diagnostic: "If you have a high success score, but a low directness score, that may mean that participants knew what they were looking for but couldn't find it easily." Their target — "A healthy tree typically shows success rates of 80% or above" — is a vendor aspiration well above the 62% median. This **confirms** the KB's use of directness as Porter's confidence proxy (memo 05 §10.3) and flags that **no population benchmark for directness exists**.

**Finding 9.3 — first-click benchmarks still rest on a 2006 study. (T3 secondary summaries)**

The 87%-vs-46% figure traces to Bailey & Wolfson, 2006 — **old**, and the original was not retrieved. Practitioner guides (CleverX, Askable, Lyssna) publish thresholds — accuracy "80% or above is generally considered strong," 60–79% "moderate navigation issues," below 60% "a significant problem"; time-to-first-click "3 to 8 seconds" typical — but **none publishes a method or corpus**. Conventions, not measurements.

The one in-window, method-bearing result is already in the KB: Sauro et al. (MeasuringU, 2023) — static-prototype first clicks differ from live-site first clicks by about 6% on average, the largest gaps caused by "dynamic UI elements (hover menus, responsive design shifts)."

*Status:* **confirms** memo 05 §10.3 and sharpens it into a correction for the validation checklist: because the prototype-versus-live gap is largest exactly where disclosure lives, a first-click test on a static mock systematically *understates* the cost of hidden navigation.

**Finding 9.4 — method guidance for navigation comparisons in B2B. (T3, primary-source handbook)**

GitLab's UX research handbook, "Comparative testing for navigation," documents the method behind the 2023 redesign: within-subjects, "2-3 designs" maximum, "Recommended sample size: 5, because the goal is to obtain qualitative insights," capturing task completion, **UMUX-Lite** and severity-rated issues, warning that both quantitative measures "should be interpreted as directional only, given the small sample size." It **confirms** memo 05 §10.4 and supplies a protocol a B2B team can copy.

## 10. What this sweep changes in the knowledge base

| KB claim | Where | Verdict | New evidence |
|---|---|---|---|
| Hidden desktop nav used 27% vs 48–50% | §6.3, RULES 4 | **Confirmed, never replicated** | Per-site range 17–89%; no post-2018 re-test. |
| Unlabelled icons are ambiguous | Memo 05 §1.2 | **Refined** | Hamburger, kebab, meatball are now recognised (NN/g 2025) but still emit no scent about contents. |
| Never hide navigation on desktop | RULES 1, 4 | **Confirmed** | NN/g Menu-Design Checklist, Jun 2024. |
| Left rail is a layout choice | absent | **New** | Left side is the *expected* location of application primary nav (NN/g 2024) and the pattern that scales for B2B IA growth (2021). |
| A third level costs clicks | RULES 2 | **Refined** | Baymard 2023: it makes users **abandon navigation for search** — an unmeasured channel, not just a slower one. |
| Command palette is *the* expert accelerator | §7, RULES 8 | **Refined** | GitHub's is preview and off by default; GitLab's is folded into global search. Not a reliable route unless on by default. |
| Per-role level-1 surfaces | §8.3.1 | **Confirmed** | GitLab 2023 shipped it as user-controlled **pinning**, not inference. |
| Tree test target >70–80% | Memo 05 §10.6 | **Overturned as a pass mark** | Median of 98 studies is **62%**, IQR 37–83%. Use the rubric. |
| Analytics reveal what is used | RULES 1, §10.1 | **Qualified** | Much B2B task entry is external deep links, bookmarks and URL history — invisible to nav analytics. |
| Door state should persist | RULES 5 | **Refined** | GitLab overrides the collapse preference on pages holding otherwise-undiscoverable content. |

---

## 11. Still unknown

1. **Any post-2018 replication of the hidden/visible/combo navigation experiment.** The KB's most-cited numbers are ten years old and were measured on news and e-commerce websites, not applications.
2. **Command palette adoption rates.** No vendor publishes what share of active users invoke ⌘K in a period, how that varies by tenure or role, or what share of navigation events it accounts for.
3. **In-product global search usage rates in B2B SaaS.** The Glean/Forrester figures describe a dedicated cross-app search product on a modelled composite organisation, not an application's own search box.
4. **Icon-only rail versus labelled sidebar, measured.** No controlled comparison since 2018. GitLab's beta metrics for its collapsed state (issue #378544 lists "Add metrics to capture usage of the product with the collapsed state" as an unchecked task) were never published.
5. **Role-differentiated navigation, measured.** No study comparing one global IA against role-scoped IAs on findability or task time in enterprise software.
6. **Mobile navigation in B2B applications.** Every benchmark found is consumer e-commerce; disclosure drift across breakpoints in B2B remains an unvalidated hypothesis.
7. **Mega-menu experiments since 2018.** The evidence base is still 2009–2010.
8. **Directness benchmarks for tree testing.** Defined everywhere, benchmarked nowhere.
9. **First-click benchmarks with a published corpus.** The 87/46 figure is 2006 and its source report was not retrievable; the 80%/60%/3–8s thresholds circulating in practitioner guides have no stated method.
10. **Peer-reviewed HCI work (CHI/CSCW/UIST/IJHCS) on navigation findability, 2018–2026.** This pass ran out of search budget before covering it and found none by direct fetching. A coverage gap in the sweep, not a demonstrated absence in the literature; it should be re-run.

## Bibliography

**Tier 2 — industry research with published numbers and a stated method**

1. Pernice, K. & Budiu, R. "Hamburger Menus and Hidden Navigation Hurt UX Metrics." NN/g, 26 Jun 2016 (already in the KB). https://www.nngroup.com/articles/hamburger-menus/
2. Pernice, K. & Budiu, R. "Beyond the Hamburger: What Makes Navigation Discoverable on Desktops." NN/g, 24 Jul 2016. https://www.nngroup.com/articles/find-navigation-desktop-not-hamburger/
3. Pernice, K. & Budiu, R. "Beyond the Hamburger: What Makes Navigation Discoverable on Mobile." NN/g, 24 Jul 2016. https://www.nngroup.com/articles/find-navigation-mobile-even-hamburger/
4. Kaplan, K. "The Hamburger-Menu Icon Today: Is it Recognizable?" NN/g, 13 Jun 2025. https://www.nngroup.com/articles/hamburger-menu-icon-recognizability/
5. Kaplan, K. "Designing Effective Contextual Menus: 10 Guidelines." NN/g, 28 Nov 2025. https://www.nngroup.com/articles/contextual-menus-guidelines/
6. Kaplan, K. "Icon IQ: Test Your Digital Icon Knowledge with a Quiz." NN/g, 6 Sep 2024 (context for the *Digital Icons That Work* research; no numbers). https://www.nngroup.com/articles/digital-icons-ux-quiz/
7. Laubheimer, P. "Menu-Design Checklist: 17 UX Guidelines." NN/g, 7 Jun 2024. https://www.nngroup.com/articles/menu-design/
8. Laubheimer, P. "Left-Side Vertical Navigation on Desktop." NN/g, 16 May 2021. https://www.nngroup.com/articles/vertical-nav/
9. Laubheimer, P. "3 Common IA Mistakes (that Are All Due to Low Information Scent)." NN/g, 16 Apr 2023. https://www.nngroup.com/articles/3-ia-mistakes/
10. Laubheimer, P. "Tree Testing Part 2: Interpreting the Results." NN/g, 19 Jan 2024 (citing Albert & Tullis, 98 studies). https://www.nngroup.com/articles/interpreting-tree-test-results/
11. Laubheimer, P. "Tree Testing: Evaluate Menu Labels and Categories." NN/g, 6 Aug 2023 (rev. 2026). https://www.nngroup.com/articles/tree-testing/
12. Tankala, S. "Card Sorting vs. Tree Testing." NN/g, 23 Feb 2024. https://www.nngroup.com/articles/card-sorting-tree-testing-differences/
13. Baymard Institute. "Homepage & Navigation UX Best Practices." 6 Aug 2024, upd. 30 Sep 2025. https://baymard.com/blog/ecommerce-navigation-best-practice
14. Scott, E. "Make Product Categories the Top-Level Navigation Items on Mobile Sites (33% Don't)." Baymard, 24 Jan 2023. https://baymard.com/blog/main-navigation-product-categories
15. Knobloch, A. "How we overhauled GitLab navigation." GitLab, 15 Aug 2023. https://about.gitlab.com/blog/navigation-research-blog-post/
16. Forrester Consulting. "The Total Economic Impact™ Of Glean." Commissioned by Glean, Sep 2024. *Vendor-commissioned; composite organisation.* https://tei.forrester.com/go/Glean/workAIplatform/
17. Sauro, J. et al. "Do Click Tests Predict Live Site Clicks?" MeasuringU, 21 Mar 2023 (already in the KB). https://measuringu.com/do-click-tests-predict-live-site-clicks/

**Tier 3 — practitioner essays, vendor documentation, primary-source design artifacts**

18. GitLab issue #378544, "[MVC] – Collapsed state for navigation redesign." https://gitlab.com/gitlab-org/gitlab/-/issues/378544
19. GitLab issue #389958, "Minimized functional collapsed state for navigation redesign." https://gitlab.com/gitlab-org/gitlab/-/issues/389958
20. GitLab Handbook. "Comparative testing for navigation." https://handbook.gitlab.com/handbook/product/ux/ux-research/comparative-testing-for-navigation/
21. GitLab Docs. "Command palette." https://docs.gitlab.com/user/search/command_palette/
22. GitHub Docs. "GitHub Command Palette." https://docs.github.com/en/get-started/accessibility/github-command-palette
23. Boucher, T. "How to build a remarkable command palette." Superhuman, 12 Oct 2021. https://blog.superhuman.com/how-to-build-a-remarkable-command-palette/
24. Shen, A. "Designing Retool's Command Palette." Retool, 9 Dec 2022. https://retool.com/blog/designing-the-command-palette
25. Microsoft Learn. "Manage personas and custom security roles in Customer Service." https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/role-persona-mapping
26. BodyGuardz. "Our A/B Testing Offers Evidence that Bottom Mobile Navigation Menus are the Future." 13 Dec 2021. https://www.bodyguardz.com/blogs/news/bottom-navigation-menu-smartphone-hand-pain-study
27. Optimal Workshop. "Tree Testing 101: Results overview." https://www.optimalworkshop.com/101-guides/tree-testing-101/results-overview
28. Optimal Workshop. "Search versus navigation: What's more important in 2020?" 14 Nov 2019. *Recycles Nielsen 1997, Katz & Byrne 2003, McGovern and a Kissmetrics survey; no post-2018 measurement.* https://www.optimalworkshop.com/blog/search-versus-navigation-whats-more-important-in-2020

**Older sources, named as old**

29. Bailey, B. & Wolfson, C. First-click studies, 2006 (87% vs 46%). Original not retrieved; cited via practitioner summaries.
30. Nielsen, J. "Usability Testing of USA.gov Mega-Menus." NN/g, 16 Nov 2010 (rev. 2018). https://www.nngroup.com/articles/usability-testing-usa-gov-mega-menus/
31. Spotify tab-bar A/B result (9% / 30%) and Zeebox tab-bar result (55% weekly frequency), c. 2014–2016. Originals not retrieved.

*Not retrieved this pass: about.gitlab.com via the dated blog URL (HTTP 403; the undated URL served the same article); DuckDuckGo, Bing and Mojeek (blocked, after the WebSearch budget was exhausted); the Bailey & Wolfson 2006 report; the podcast clip carrying the "<2% of Gmail users" claim; the Albert & Tullis review in the original (used via NN/g's citation).*
