# Progressive Disclosure: The Core Model

*How the concept works in complex B2B SaaS applications. This chapter is the synthesized understanding; every claim traces back to a source memo in [sources/](sources/), which hold the verbatim quotes, URLs and dates.*

---

## 1. One-paragraph definition

Progressive disclosure (PD) is an interaction technique that shows users only the few options most tasks need, and reveals the rest on request, in a clearly labelled second level. Jakob Nielsen's canonical wording (NN/g, 2006): "Initially, show users only a few of the most important options. Offer a larger set of specialized options upon request." The deferred material always stays reachable. The goal is not to remove capability but to sequence it so that complexity never becomes confusion. Nielsen claims it improves three of the five usability components: learnability, efficiency of use, and error rate.

The idea is older than the name. IBM's "training wheels" experiment (Carroll & Carrithers, 1984) showed that walling off advanced functions made beginners learn faster and cut error-recovery time by about a quarter. Apple's 1992 Macintosh Human Interface Guidelines already had a section titled "Using Progressive Disclosure" with the More Choices / Fewer Choices dialog and an "80 Percent Solution" rule. Nielsen's 2006 article gave it the canonical definition and two requirements. Nielsen's 2026 essay restated it for AI agents.

---

## 2. The mechanism, stated precisely

PD has four moving parts. Every pattern in the catalog is a combination of these.

| Part | What it is | Design question |
|---|---|---|
| **The split** | Which content or controls sit at level 1 (always visible) versus level 2 (on request) | By what criterion, and validated how? |
| **The trigger** | The affordance that takes the user from level 1 to level 2 (chevron, "Show more", Cmd+K, right-click, a conditional answer) | Does it carry information scent? Is it visible, labelled, in the reading path? |
| **The container** | Where the disclosed content appears (inline expansion, popover, drawer, modal, new page, next wizard step) | Does it keep context, focus and reading order? |
| **The return** | How the user gets back, and whether state persists | Is it reversible, and does the interface remember the choice? |

Nielsen's two non-negotiable requirements map onto the first two parts:

1. **Correct split.** "You must disclose everything that users frequently need up front." Hiding a frequently needed feature is the cardinal failure. In 2026 he added: the split must come from frequency-of-use data (analytics, field studies, support logs), "not from whichever team shouted loudest at the roadmap meeting."
2. **Obvious progression.** "It must be obvious how users progress from the primary to the secondary disclosure levels." Simple mechanics plus labelling that "sets expectations for what users will find."

To these, the wider literature adds three hard limits:

3. **Two levels, at most.** "Designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels" (Nielsen). GitLab Pajamas and Shopify repeat the rule. Each additional level "multiplies clicks and halves discoverability."
4. **Never hide decision-critical information.** Price, fees, risks, requirements, consequences of an action, privacy terms: level 1 by definition (Nielsen 2026; Krug's goodwill rule; regulatory drip-pricing rules from the FTC and UK CMA).
5. **Split by task frequency, not user skill.** "Progressive disclosure splits tasks by frequency, not people by skill." The expert "is a regular user having a rare moment" (Nielsen 2026, building on Cooper's perpetual intermediates).

---

## 3. Three things that get called "progressive disclosure"

In B2B SaaS practice the term names three different practices. Most confusion in teams comes from conflating them.

| Sense | What is disclosed | Unit of time | Who uses the term this way |
|---|---|---|---|
| **A. Interface layering** (Nielsen's sense) | Controls and content within a screen: primary vs secondary | Within a single screen or task | NN/g, Apple HIG, Microsoft Win32 UX Guide, Primer, Polaris, SLDS, Carbon, Pajamas |
| **B. Progressive onboarding** | Product education: tooltips, checklists, hints, persona-branched first runs | Across sessions, days, weeks | Appcues, Pendo, Userpilot, Chameleon, ProductLed, Google PAIR ("inboarding") |
| **C. Architecture stance** | Configuration surface and API complexity: zero-config defaults with escape hatches | Across the lifetime of a customer's usage | Vercel/Next.js ("progressive disclosure of complexity"), SwiftUI, Swift, Linear's opinionated defaults |

A fourth, transferable use emerged in 2025–2026: **PD as an agent architecture** (Anthropic Agent Skills: always-loaded metadata, on-trigger instructions, on-demand resources), where the "user" being spared load is the model's context window. It reproduces Nielsen's three-tier structure exactly, including the requirement that the level-1 description say both what the thing does and when to use it.

**Rule for this knowledge base:** when someone says "progressive disclosure," ask which sense. Sense A is the technique with the strongest research base and the tightest rules. Sense B is measured by activation and time-to-value and is governed by NN/g's finding that "pull" contextual help beats "push" tours. Sense C is a product strategy that reduces how much there is to disclose in the first place.

---

## 4. Related-but-different patterns

| Term | What it is | How it differs from PD |
|---|---|---|
| **Staged disclosure** (wizard) | A linear, mandatory sequence of steps, subset shown at each step | Temporal and required; PD proper is hierarchical and optional. Nielsen keeps them separate. Wizards suit rare, unfamiliar processes (setup, SSO, billing) and become "annoying and overly controlling" for repeated tasks. |
| **Responsive disclosure** (Tidwell) | The system reveals the next controls as soon as the user's prior input makes them relevant (conditional fields) | System-initiated, driven by user input; a sub-type of PD. GOV.UK's conditional radios are the canonical example, with a documented WCAG 4.1.2 caveat. |
| **Responsive enabling** (Tidwell) | All controls shown; irrelevant ones disabled until relevant | Uses enabled state instead of visibility. Lets experts anticipate the next step, but disabled controls are nearly invisible to assistive tech. |
| **Progressive reduction** (LayerVault, 2013) | UI simplifies per user as they demonstrate proficiency, with "experience decay" restoring cues after disuse | Adaptation over calendar time per person; PD is a fixed layering every user can open at any time. |
| **Adaptive UI** (system-driven) | The system rearranges or hides items based on inferred behaviour (Office 2000 personalized menus) | Documented failure: unpredictable, breaks spatial memory, doubles scan time. Prefer stable, user-controlled (adaptable) disclosure. |
| **Progressive enhancement** | Web delivery strategy layering features by browser capability | Shares only the word "progressive." Unrelated. |
| **Overview first, zoom and filter, details on demand** (Shneiderman, 1996) | Visual-information-seeking mantra for data | A disclosure sequence for data exploration, but the overview is primary content. Do not collapse the overview to "simplify." |
| **Semantic zoom** | Two representations of the same data at different scales | Representation changes with scale; a disclosure of detail, not of controls. |

---

## 5. The taxonomy: four axes of disclosure

No single authoritative taxonomy exists; sources overlap. The axes that recur across all of them:

1. **Space (hierarchical).** Primary display, secondary display. The print dialog with an "Advanced" button. Nielsen's core case.
2. **Time (sequential).** Wizards, one-thing-per-page, onboarding over sessions, an agent's activity log. Nielsen 2026: for long-running agents, PD "rotates from space into time: what interrupts you now versus what waits for you."
3. **Condition/context (state-triggered).** Options appear when a related field is checked, when an object is selected (Office contextual tabs, Figma's property panel), when an error occurs, when a plan tier is reached. Deterministic and predictable when driven by object state; risky when driven by inferred user behaviour.
4. **User (role- or proficiency-based).** Admin versus end user, permission-gated actions, expert accelerators "unseen by the novice." Nielsen explicitly says PD is not this; in enterprise practice, permissions double as disclosure whether designers intend it or not.

Two further axes describe the *mechanics* rather than the *criterion*:

- **Trigger initiator:** user-initiated (chevron, "Show more", Cmd+K, right-click) versus system-initiated (conditional field, contextual toolbar, empty state, adaptive menu). User-initiated is safer; users prefer control (Findlater & McGrenere), and Shneiderman warns adaptive systems are "unpredictable and less transparent."
- **Container type:** in-flow (accordion, details, expandable row, conditional field), layered (popover, tooltip, menu, drawer), modal (dialog, sheet, wizard step). In-flow keeps reading order and is cheapest for accessibility; layered inherits WCAG 1.4.13; modal inherits focus-trap and focus-return obligations.

---

## 6. Why it works: the cognitive trade

PD is not one psychological principle. It is a negotiated settlement between two groups of principles that pull in opposite directions. Understanding both sides is what separates good PD from hiding things.

### 6.1 The case for hiding (what PD buys)

- **Cognitive load theory (Sweller).** Working memory is limited. PD attacks *extraneous* load: every rarely used control on screen must be perceived, classified as irrelevant and suppressed. Hiding it frees capacity for the intrinsic task and for building a mental model. PD does not reduce intrinsic complexity (see Tesler below); it reallocates load.
- **Hick's Law.** Decision time grows with the number of unfamiliar, unordered options. Caveat: the effect flattens for experts scanning a stable, well-ordered layout, and Landauer & Nachbar found breadth beats depth in menus. So Hick's Law argues for fewer *visible unfamiliar* options, not for deep hierarchies.
- **Choice overload.** Conditional, not universal. Meta-analyses (Scheibehenne 2010: mean effect near zero; Chernev 2015: significant once moderators are modelled) show overload bites for novices with uncertain preferences, under time pressure, with non-comparable options and no default. Experts with clear preferences benefit from *more* options. This maps onto segments in enterprise software: hide from onboarding and rare-task paths; expose more on the analyst's or admin's screen.
- **Paradox of the active user (Carroll & Rosson, 1987).** Users never read the manual and start immediately. PD is therefore the only way to *deliver* learning: the first layer must let them produce value on day one, and the disclosure path must teach the next layer in the flow of work.
- **Training wheels and scaffolding.** Constrained first layers produce faster learning and fewer error-recovery detours (Carroll & Carrithers 1984; Shneiderman's multi-layer interfaces 2003; Liu & Sra's ScaffoldUI 2025). Scaffolding theory (Wood, Bruner & Ross) adds the part designers forget: the scaffold must *fade*. A scaffold that never comes down is a tax on experts.
- **Minimalist design (Nielsen heuristic 8).** "Every extra unit of information in an interface competes with the relevant units of information and diminishes their relative visibility."
- **Satisficing.** Users pick the first reasonable option. If it takes effort to understand what's offered, "many of its visitors will never even realize what's available."

### 6.2 The cost of hiding (what PD spends)

- **Recognition over recall (Nielsen heuristic 6).** Every element moved behind a boundary is partly converted from recognition to recall: the user must remember it exists and where it lives. Heuristics 6 and 8 are in direct tension; PD is the settlement.
- **Information foraging and scent.** A disclosure trigger is a foraging decision. Its label is the *only* representation of what lies behind it. "Advanced," "More," or an unlabelled gear emit almost no scent; satisficing users conclude the feature does not exist. Tognazzini's line: "If the user cannot find it, it does not exist."
- **Interaction cost and Fitts's Law.** PD removes a scanning cost from every visit and adds pointing, clicking, waiting and attention-switch costs to the visits that need the hidden set. The trade is favourable only when (frequency × per-visit cost of the hidden set) is small.
- **Banner blindness and change blindness.** A trigger in the right rail or at the screen edge can be perceptually filtered out. Content that appears without animation or emphasis can be missed entirely.
- **Working memory across the boundary.** Cowan's 4±1 chunks: never separate mutually dependent information across a disclosure boundary (Fluent: "Never put information in one accordion item that needs to be referenced in another accordion item").
- **Tesler's Law.** Complexity is conserved. PD moves it later in time and behind an affordance; it must never move it into the user's head or into support tickets.
- **The aesthetic-usability effect.** A clean first layer scores well in preference tests and demos while masking that experts can no longer find what they need. Measure PD with task time, error rate and time-to-discovery, not satisfaction alone.

### 6.3 The quantitative record

| Finding | Number | Source |
|---|---|---|
| Hidden navigation usage vs visible (desktop) | 27% vs 48–50% | Pernice & Budiu, NN/g 2016 |
| Task success penalty for hidden navigation | >20 points lower | Same |
| Time penalty for hidden navigation (desktop) | ≥39% slower | Same |
| Click-through on unlabelled non-standard icon | 0% | Harley, NN/g 2014 |
| Users who ever changed any setting (Word) | <5% — a 2011 anecdote about consumer Word, not a benchmark; no post-2018 settings-usage figure of any tier exists | Spool, UIE 2011 *(corrected 14 Sep 2026: see sweep 15)* |
| Features generating 80% of clicks | **6.4% median, 15.6% best-in-class** (6,800+ apps, 2,500 customers) | Pendo 2024 *(corrected 14 Sep 2026: see sweep 15)* |
| Feature-use distribution (615 Pendo subscriptions, 3 months) | 12% frequent / 8% moderate / 24% rare / 56% never used | Pendo, 2019 Feature Adoption Report *(corrected 14 Sep 2026: see sweep 15)* |
| Elements per screenful: condensed vs dispersed layout | 8–14 vs <7; 17% vs 30% unused space | Flaherty, Neusesser & Chitale, NN/g 2023 (n=13) |
| Information-processing burden on a complex EHR case | more fixations and longer task time, **fewer clicks per minute**, screens viewed unchanged | Khairat et al., JAMIA 2026 (81 ICU providers, 4 centres) |
| Frequency reordering vs static menus | Static 2283 ms, Frequency 2298 ms, MCTS 2162 ms; 15% slower on non-promoted items | Todi et al., CHI 2021 (18 participants, 6,480 trials) |
| Adaptive vs static menus with EEG | no significant difference either way | Gaspar-Figueiredo et al., JSS 2025 (n=40) |
| Shortcut retention at 24 h: spatial keyboard map vs list | median 10 vs 5.5 commands | Lewis et al., KeyMap, CHI 2020 (n=98) |
| Shortcut activations from 749 tooltip exposures | 2 | Harrison, Malacria & Cockburn, IHM 2025 |
| Problematic agent action shown for approval vs actually stopped | 88.5% visible, 23.9% stopped | Chen et al., arXiv 2604.04918 (n=48) |
| Subscription acceptance when the recurring charge is in small grey text | 14.8% → 30.1%, with no measurable backlash | Luguri & Strahilevitz, *J. Legal Analysis* 2021 (n=1,963 / 3,777) |
| Tree-test task success, real-world distribution | median 62%, IQR 37–83% | Albert & Tullis, 98 studies, via NN/g 2024 |
| Training-wheels control group time lost to blocked error states | ~25% | Carroll & Carrithers 1984 |
| Mean effect size of choice overload | 0.02 (CI −0.09 to 0.12) | Scheibehenne et al. 2010 |
| Consent lift from moving "reject" to second page | +22–23 points | Nouwens et al., CHI 2020 |
| Extra spend when fees are deferred | +21% | Blake et al. 2021 via Brignull |
| Correlation between click count and task success | none (44 users, 620 tasks) | Porter, UIE 2003 |
| Static split menu vs adaptive menu | static significantly faster | Findlater & McGrenere, CHI 2004 |
| Preference: adaptable vs adaptive vs static menus | 55% / 30% / 15% | Same |
| Word 97 functions actually used per person (of 265) | 27% avg, range 3–45% | McGrenere & Moore, GI 2000 |
| Functions used regularly by >75% of users | 3.3% (12 of 265) | Same |
| Users wanting unused functions removed vs "tucked away" | 24.5% vs 45% | Same |
| Field study: preferred personal/full two-interface over Word's adaptive menus | 13 of 20 | McGrenere, Baecker & Booth, CHI 2002 |
| Users who did not notice the adaptive menus were adapting | 7 of 20 | Same |
| Adaptive toolbar utilisation at 50% vs 70% prediction accuracy | 70.6% vs 86.4% | Gajos et al., CHI 2008 |
| Unfamiliar tasks completed with layered contextual help vs online help | 7× | Grossman & Fitzmaurice, CHI 2010 |

**Two cautions on the Pendo figures.** A "feature" in Pendo is a customer-chosen tag — something a product manager instrumented because they expected it to be used — so it is **not comparable to McGrenere and Moore's exhaustive inventory of 265 Word 97 functions**, and the two must not be cited as one line of evidence. And 12% (2019, average daily usage volume) and 6.4% (2024, click volume) are different metrics on different samples; the gap between them is not a trend. See [11 What changed, 2018–2026](11-what-changed-2018-2026.md).

---

## 7. The population model: perpetual intermediates

Alan Cooper's "perpetual intermediates" (About Face, 1995) is the demographic argument underneath everything. Skill follows a bell curve: few beginners, few experts, most users in the middle, and "when people achieve an adequate level of experience and ability, they generally stay there forever." Nobody wants to remain a beginner; almost nobody becomes the settings-mastering power user that "expert mode" fantasies assume.

Consequences for PD in B2B:

- **Level 1 serves beginners briefly. Level 2 is where intermediates live for years.** Design the intermediate layer, not the minimal one, as the centre of gravity. NN/g's complex-application research confirms that "even users of complex applications tend to plateau at mediocre performance."
- **Basic/Advanced and Expert modes fail** because they force intermediates to choose an identity they do not have. Home Assistant's 2026 decision to delete "Advanced"/"Expert" labels ("they implicitly tell users that certain features are not for them") and Jira's 2021 rename from "next-gen/classic" to "team-managed/company-managed" both replace audience labels with content labels.
- **Experts are served by accelerators, not modes.** Keyboard shortcuts, command palettes and bulk actions are "unseen by the novice" (NN/g heuristic 7) and disclosed by repeated exposure. A command palette that shows each command's shortcut is the floor, not the ceiling: hover hints teach almost nothing (749 tooltip exposures produced two shortcut adoptions; Harrison, Malacria & Cockburn 2025), while temporary full exposure and spatial feedforward do (shortcut use 10% to 86% with 73% persisting; KeyMap doubled 24-hour retention). See [11-what-changed-2018-2026.md](11-what-changed-2018-2026.md).
- **The one two-interface design with field evidence is user-personalised, not audience-labelled.** McGrenere, Baecker and Booth (CHI 2002) gave 20 Word users a one-click toggle between a "Personal" interface they populated themselves (starting with six functions) and the full default; over six weeks it beat Word's adaptive menus on navigation, learnability, control and satisfaction, and 13 of 20 preferred it. The conditions that made it work are the opposite of a Basic/Advanced switch: the user chooses the contents, the toggle is one click, the reduced layer starts nearly empty, and role-seeded defaults exist for the third of users who will not customise.
- **Hidden features are not learned.** Findlater and McGrenere (2010) measured the cost: reduced-functionality interfaces improve core-task performance but lower awareness of unused features and their later use. Cockburn et al. (2014) call the result an expertise plateau: users "persistently fail to adopt faster methods." So the level-1 layer must contain cues toward level 2 (shortcut hints in menus, command search, contextual recommendations), or it becomes a permanent novice layer.

### 7.1 Hide or remove?

Two lines of evidence pull against each other and the resolution matters for settings sprawl. McGrenere and Moore (2000) found Word 97 users touched about 27% of functions, but only 24.5% wanted unused functions removed while 45% wanted them "tucked away," and 51% wanted to keep discovering new ones. Users like feature growth and hate interface growth. On the other side, Spool's experience rot and featurebloat.com's "the solution is removal" argue that deferral without deletion is how bloat accumulates. The reconciliation: **tuck away what some users use** (the long tail differs by person, so it must remain reachable), and **remove what almost nobody uses** (below roughly 3–5% deviation from the default across all segments). Both decisions require per-segment usage data.

*(Corrected 14 Sep 2026: see sweep 15.)* **The 3–5% threshold is a design convention, not a finding.** No post-2018 study with a stated method reports what happened to churn, support volume or task time after a B2B product removed a feature, so the number has nothing behind it. Add a second question before deleting anything: not only "what share of users touch it weekly" but **"what share of the people who touch it at all touch it daily"**. A command used by 4% of users on 100% of their days is a density item, and aggregate frequency data will delete it — which is what the Windows 11 context menu, Figma UI3 and Firefox compact-density reversals were about (sweep 13).

### 7.2 When system-driven adaptation is acceptable

The adaptive-menu failure (Office 2000) is not the whole story. Gajos et al. (CHI 2008) found accuracy, not predictability, drives whether users adopt adaptive suggestions: utilisation rose from 70.6% to 86.4% when prediction accuracy rose from 50% to 70%. Findlater et al. (CHI 2009) showed *ephemeral adaptation*, where predicted items appear at once and the rest fade in over about 500 ms, is faster than static menus at 79% accuracy and no slower at 50%, because it keeps every item in its usual place.

*(Corrected 14 Sep 2026: see sweep 08.)* **The 70% threshold has never been re-tested, and spatial adaptation now looks like a loser at any accuracy.** Todi, Bailly, Leiva and Oulasvirta (CHI 2021, 18 participants, 6,480 trials) found frequency reordering no faster than static (2298 ms vs 2283 ms) and **15% slower** on items outside the promoted head; 15 of 18 noticed the menus changing and two understood why. Gaspar-Figueiredo, Vanderdonckt, Abrahão and Insfran (*JSS* 2025, n=40, with EEG) found **no significant difference either way**. So the reason not to reorder is not that the model is not accurate enough yet: relocation costs more than the prediction can repay.

The rule that follows for AI-driven "smart" disclosure in enterprise tools: adaptation must be **in place** (highlight, sort, filter, augment — never relocate), **visibly signalled**, **reversible in one action**, and **offered at a task boundary**, not mid-task. Post-commit suggestions drew 52% engagement while identical content on a declined edit was dismissed 62% of the time (Kuo et al., 2026). Keep the Gajos figure for anything that is *added* rather than moved, and keep it labelled un-replicated. Otherwise use a static layer with user-controlled promotion and role defaults — which is what GitLab shipped in 2023, as pinning rather than inference.

---

## 8. Where PD earns its keep, and where it does not

### 8.1 Preconditions for PD to be the right tool

- Task frequency is **uneven**: a small head of tasks accounts for most usage (verify with analytics; Pendo's benchmark is far more skewed than 80/20).
- The user population is **heterogeneous** in role or expertise (most B2B SaaS).
- The task is **learn / configure / occasional** rather than monitor / operate all day.
- Hidden items are **independent** of visible ones (no cross-referencing needed).
- The business metric is **task completion**, not time-in-app. (Engagement-optimised consumer products invert PD; B2B tools that must help people "ship code, write documents, close bugs" keep it.)

### 8.2 When to prefer density and persistent visibility instead

- **Homogeneous expert populations doing the same task all day**: trading terminals, on-call SRE consoles, clinical dashboards, IDEs. Every disclosure click is repeated thousands of times; the "interaction tax" dwarfs the learnability benefit. Matt Ström-Awn's decomposition — PD trades *visual* density for *temporal* density — is the clearest framing of the trade. *(Corrected 14 Sep 2026: see sweep 13.)* **It is an essay and contains no measurements**: no density figures, no elements-per-screen count, no task performance. Keep the taxonomy; do not cite it as evidence. The measured support is elsewhere, and thinner than the position deserves: NN/g's 2023 content-dispersion study puts **condensed at 8–14 unique elements per screenful with 17% unused space against dispersed at under 7 with 30%**, and finds dispersion raises cognitive load and interaction cost (n=13, marketing pages); Khairat et al. (JAMIA 2026, 81 ICU providers) show the tax on a dense screen is paid in **fixations, not clicks** — clicks per minute *fell* as burden rose — so a team counting only clicks will under-price density and over-price disclosure; and four vendor reversals (Windows 11 context menu, Figma UI3, Office simplified ribbon, Firefox compact density) show what all-day experts reject. **No head-to-head experiment comparing a dense and a disclosed build of the same professional tool exists.** Density also has a locality condition: seven screens of everything still cost heavily when related things sit far apart (Afzal et al. 2022), so rule 5 applies to dense screens too.
- **Safety-critical or decision-critical state**: must be persistently visible and glanceable, neither buried nor modal.
- **Comparison tasks**: any pattern that shows A *or* B forces the user to hold one in working memory. Side-by-side wins.
- **Overview-first analytics**: the overview is the primary content; drill-down is details-on-demand, but collapsing the overview removes the step that makes drill-down possible.

### 8.3 The enterprise-specific model

Complex B2B applications have three features that change how PD applies:

1. **Multiple personas with different level-1 needs.** The admin who configures, the operator who enters data all day, the analyst who queries, the executive who wants 15 metrics at once. One product needs several level-1 surfaces, not one global disclosure policy. In practice this is delivered as role-scoped areas (Stripe's Developers section), admin-composed pages (Salesforce Lightning App Builder, where admins *compose* the disclosure for end users), or density toggles.
2. **Permissions double as disclosure.** What you cannot do, you do not see. Permission systems are built for security, not learnability, so users hit invisible walls. Prefer hide-with-explanation ("you don't have access; ask an admin") over silent absence, and never use disabled controls as the disclosure mechanism (nearly invisible to assistive tech).
3. **Sales-driven feature growth.** Enterprise deals add features "one yes at a time" (Spool's experience rot). PD becomes the coping mechanism: a settings page "is where features go to be forgotten." Nielsen's 2026 term is *disclosure debt*: a daily-use feature buried at level 2 charges an interaction tax on every visit; a never-used feature parked at level 2 is bloat that should be deleted, not hidden.

The healthy enterprise forms of PD are therefore **per-capability** (Zapier's "Advanced settings" section that disappears entirely when inapplicable; Jira's "toggle on sprints"), **synchronised dual representations** (Grafana's Builder/Code query modes editing the same artifact, with an "Explain" toggle that teaches the expert form), and **contextual by object state** (Office contextual tabs, Figma's selection-driven panel), not global basic/advanced switches.

---

## 9. The eight laws of progressive disclosure

A compressed statement of what the whole literature agrees on. Each is expanded in [08-principles-and-checklists.md](08-principles-and-checklists.md).

1. **Hide the rare, never the necessary.** Everything frequently needed is level 1. Verify "frequently" with per-segment usage data.
2. **Stop at two levels.** A third level means the information architecture is wrong, not the widget.
3. **Split by task frequency, not by user skill.** No Basic/Advanced modes; per-feature disclosure lets intermediates reach one advanced thing at a time.
4. **Make the door obvious and honest.** Trigger labelled by content ("Tax and withholding rules"), not audience ("Advanced"); chevron plus text; in the reading path; large enough to hit; and it must always deliver ("Remove, don't disable, disclosure controls that don't apply").
5. **Keep context across the boundary.** Reveal adjacent to the cause; expand in place where possible; never separate mutually dependent information; persist expand/collapse state.
6. **Prefer stable, user-controlled disclosure over inferred adaptation.** Context by object state is fine; reordering by usage history is not.
7. **Decision-critical information is never behind a door.** Price, fees, consequences, data use, safety state.
8. **Fade the scaffold; give experts accelerators.** Let users keep layers open, teach shortcuts through repeated exposure, and audit level 2 for features to promote or delete.

---

## 10. How to read the rest of this knowledge base

- **[01 Foundations and definitions](sources/01-foundations-and-definitions.md)**: the canonical texts with verbatim quotes (Nielsen 2006/2026, Apple 1992, Carroll, Cooper, Lidwell, Tognazzini, Norman, Raskin, Krug), definitional divergences, and the taxonomy survey.
- **[02 Cognitive science](sources/02-cognitive-science.md)**: the principles in section 6 with sources, quotes and the empirical studies.
- **[03 Pattern catalog](sources/03-pattern-catalog.md)**: 22 patterns with when/when-not rules and accessibility notes, plus 20 design systems' definitions and Tidwell's patterns.
- **[04 B2B SaaS practice and case studies](sources/04-b2b-saas-practice-and-case-studies.md)**: NN/g on complex apps, PLG-vendor onboarding practice, 16 product case studies, developer-tool "progressive disclosure of complexity," modes and bloat, role-based disclosure, density, and AI-era applications.
- **[05 Critiques, pitfalls and measurement](sources/05-critiques-pitfalls-and-measurement.md)**: discoverability cost, the 3-click myth, over-nesting, mode toggles, dark-pattern misuse, accessibility failures, side-effects, mobile, when not to use, validation methods, and organisational politics.
- **[06 Academic literature](sources/06-academic-literature.md)**: the peer-reviewed record (layered interfaces, adaptive/adaptable UIs, bloat studies, learnability, explainable-AI disclosure) with citations.
- **[08 Principles and checklists](08-principles-and-checklists.md)**: the operational layer: decision tree, per-pattern checklists, measurement plan, anti-patterns.
- **[11 What changed, 2018–2026](11-what-changed-2018-2026.md)**: what eight years of new evidence did to each of the eight laws and to the gated-features pattern, and which numbers here were wrong.
- **[12 Gaps we accept](12-gaps-we-accept.md)**: what remains unproven, and the study that would close each gap.
- **[09 Expert voices](09-expert-voices.md)**: who said what, in one place.
- **[10 Glossary](10-glossary.md)**: the vocabulary.
