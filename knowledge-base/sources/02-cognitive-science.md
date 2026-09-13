# The Cognitive Science and Psychological Basis for Progressive Disclosure

*Research memo: why progressive disclosure (PD) matters for complex, feature-rich B2B software. All quotes below were fetched from the cited sources on 2026-09-12; page-level PDFs (Scheibehenne et al. 2010, Chernev et al. 2015, Iyengar & Lepper 2000, Shneiderman 2003, Findlater & McGrenere 2004) were downloaded and text-extracted.*

---

## 0. The anchor definition

**Source:** Jakob Nielsen, "Progressive Disclosure," NN/g, 3 Dec 2006. https://www.nngroup.com/articles/progressive-disclosure/

Nielsen's definition: "initially, show users only a few of the most important options" and "Offer a larger set of specialized options upon request."

Key claims (verbatim):

> "Progressive disclosure thus improves 3 of usability's 5 components: learnability, efficiency of use, and error rate."

> "For novice users, this helps prioritize their attention so that they spend time only on features that are most likely to be useful to them."

> "For advanced users, the smaller initial display also saves them time because they avoid having to scan past a large list of features they rarely use."

> "people understand a system *better* when you help them prioritize features and spend more time on the most important ones."

Two non-negotiable requirements:

> "You must get the right split between initial and secondary features. You have to disclose everything that users frequently need up front."

> "It must be obvious how users progress from the primary to the secondary disclosure levels."

Nielsen also distinguishes **staged disclosure**: "Wizards are the classic example of staged disclosure" where "users step through a linear sequence of options, with a subset displayed at each step."

The Interaction Design Foundation (https://ixdf.org/literature/topics/progressive-disclosure) frames PD as a technique that "defers advanced features and information to secondary UI components," and adds the risks: oversimplification producing "dumbed-down" interfaces; the discoverability problem "when advanced features become routine tasks"; and the difficulty of defining "essential" vs "advanced" for diverse populations. Verbatim benefits it lists: "Progressive disclosure declutters the UI to prevent confusion and cognitive overload." / "Designers limit the immediate set of actions available to cut the chance of mistakes."

Everything below is the cognitive-science scaffolding underneath these claims, plus the caveats that determine when PD backfires.

---

## 1. Cognitive Load Theory (Sweller)

**Definition.** Cognitive Load Theory (CLT), introduced by John Sweller ("Cognitive load during problem solving: Effects on learning," *Cognitive Science* 12(2), 1988, 257–285), holds that working memory is severely limited and that instructional (and by extension interface) design determines how much of that capacity is consumed by things that do not help the learner. Load is decomposed into three additive components.

**Sources.**
- Debue & van de Leemput, "What does germane load mean? An empirical contribution to the cognitive load theory," *Frontiers in Psychology*, 2014 (summarising Sweller 1988/1998/2010). https://pmc.ncbi.nlm.nih.gov/articles/PMC4181236/
- Kathryn Whitenton, "Minimize Cognitive Load to Maximize Usability," NN/g, 22 Dec 2013. https://www.nngroup.com/articles/minimize-cognitive-load/
- Laws of UX, "Cognitive Load." https://lawsofux.com/cognitive-load/

**Verbatim quotes.**

From Debue & van de Leemput (citing Sweller):
> "Intrinsic load (IL) is directly related to the learning material (or task) and defined by the number and interactivity of elements that have to be processed."

> "Extraneous Load (EL) refers to those mental resources devoted to elements that do not contribute to learning and schemata acquisition."

> "Germane load (GL) refers to the mental resources devoted to acquiring and automating schemata in long-term memory."

> "CLT assumes that working memory resources are limited and that processing and maintaining information uses a certain proportion of these resources."

From NN/g (Whitenton): cognitive load is "The amount of mental resources that is required to operate the system." Extraneous load is "Processing that takes up mental resources, but doesn't actually help users understand the content." Her three prescriptions:
> "Avoid visual clutter: redundant links, irrelevant images, and meaningless typography flourishes slow users down."

> "Build on existing mental models: People already have mental models about how websites work, based on their past experiences visiting other sites."

> "Offload tasks: Look for anything in your design that requires users to read text, remember information, or make a decision."

From Laws of UX: "Cognitive load theory was developed in the late 1980s by John Sweller out of a study of problem solving and was in many ways an expansion on the information processing theories of George Miller." And: "When the amount of information coming in exceeds the space we have available, we struggle mentally to keep up — tasks become more difficult, details are missed, and we begin to feel overwhelmed."

**Implication for PD in complex B2B apps.** The intrinsic load of, say, configuring a multi-entity consolidation rule in an ERP cannot be designed away (see Tesler's Law, §2). What PD does is attack *extraneous* load: every rarely-used control on screen is an element the user must perceive, classify as irrelevant, and suppress. Hiding those elements frees working-memory capacity for the intrinsic task and for *germane* processing (building a schema of how the product works). The corollary is that PD is not a licence to hide *frequently needed* elements — doing so converts a perception cost into a much larger recall-and-navigation cost (§7, §9). PD is a load-*reallocation* tool, and the split must be validated against frequency-of-use data, not aesthetics.

---

## 2. Hick's Law, Tesler's Law, Jakob's Law, Aesthetic-Usability Effect (Laws of UX)

### 2a. Hick's Law (Hick–Hyman)

**Definition** (Laws of UX, https://lawsofux.com/hicks-law/): "The time it takes to make a decision increases with the number and complexity of choices." Origin: "Hick's Law (or the Hick-Hyman Law) is named after a British and an American psychologist team of William Edmund Hick and Ray Hyman. In 1952, this pair set out to examine the relationship between the number of stimuli present and an individual's reaction time to any given stimulus." Formula (Wikipedia, https://en.wikipedia.org/wiki/Hick%27s_law): T = b · log₂(n + 1).

Laws of UX takeaways relevant to PD: "Minimize choices when response times are critical to decrease decision time"; "Break complex tasks into smaller steps in order to decrease cognitive load"; "Use progressive onboarding to minimize cognitive load for new users"; and the caution "Be careful not to simplify to the point of abstraction." Its Slack/TV example explicitly invokes PD: "By transferring complexity to the TV interface itself, information can be effectively organized and progressively disclosed within menus."

NN/g's framing (Katie Sherwin, "Hick's Law: Designing Long Menu Lists," 6 Jul 2018, https://www.nngroup.com/videos/hicks-law-long-menus/): "The more choices you present to your users, the longer it takes them to reach a decision." But designers can "combine Hick's Law with other design techniques" to make long menus usable.

**The caveats matter.** The logarithmic form holds only when the chooser can *subdivide* the set. Wikipedia summarises the Landauer & Nachbar (1985) result: when searching "a randomly ordered list," reaction time increases *linearly* with item count; conversely an alphabetical menu allows "a subdividing strategy that works in logarithmic time." Its editorial conclusion: "predictable structure enables the law; randomized options defeat it." Landauer & Nachbar also found "empirical support for their conclusion that breadth should be favored over depth in hierarchical menus" — a direct warning against deep PD hierarchies. Experts also behave differently: the Hick–Hyman slope flattens with practice and stimulus–response compatibility (Proctor & Schneider, "Hick's law for choice reaction time: A review," *QJEP* 2018 — abstract not retrievable, 403), which is why an expert scanning a familiar, well-ordered toolbar does not pay the "n options" penalty a novice does.

**Implication.** Hick's Law justifies reducing the *visible, unfamiliar, unordered* option set for novices and for infrequent tasks. It does *not* justify hiding options from experts who have learned a stable layout, and it argues *against* burying options in deep hierarchies (breadth beats depth). A well-ordered, consistently grouped 20-item ribbon can be faster than a 6-item menu whose items lead to sub-menus.

### 2b. Miller's Law (see §3 for the full treatment)

Laws of UX (https://lawsofux.com/millers-law/) defines it as "The average person can only keep 7 (plus or minus 2) items in their working memory," and its first takeaway is a caution: "Don't use the 'magical number seven' to justify unnecessary design limitations."

### 2c. Tesler's Law (Conservation of Complexity)

**Definition** (https://lawsofux.com/teslers-law/): "For any system there is a certain amount of complexity which cannot be reduced." Origin: Larry Tesler at Xerox PARC in the mid-1980s recognised that "the way users interact with applications was just as important as the application itself" and argued engineers should invest time simplifying applications rather than burdening millions of users. Counterpoint on the same page: Bruce Tognazzini observes that when applications simplify, users attempt more challenging tasks — complexity reduction is met by task escalation.

**Implication.** Tesler's Law is the honest frame for B2B: a payroll engine has irreducible complexity, and PD does not delete it — it *sequences* it. The design question is *who* absorbs each unit of complexity and *when*. PD moves complexity later in time and behind an explicit "more" affordance; it must never move it into the user's head (memory) or into support tickets. Tognazzini's caveat predicts that as the basic path gets easier, users will push into the advanced layer sooner — so the second layer must be designed with the same care as the first.

### 2d. Jakob's Law

**Definition** (https://lawsofux.com/jakobs-law/): "Users spend most of their time on other sites. This means that users prefer your site to work the same way as all the other sites they already know." Takeaway: "By leveraging existing mental models, we can create superior user experiences in which the users can focus on their tasks rather than on learning new models."

**Implication.** PD affordances themselves must be conventional: chevrons, "Advanced settings" links, "Show more," collapsible side panels, Office-style contextual tabs. An idiosyncratic disclosure mechanism spends the very cognitive budget it was meant to save. In B2B, users transfer expectations from the other enterprise tools they use daily (Salesforce, Jira, Excel), so PD patterns from those products carry pre-learned scent.

### 2e. Aesthetic-Usability Effect

**Definition** (https://lawsofux.com/aesthetic-usability-effect/): "Users often perceive aesthetically pleasing design as design that's more usable." Origin: Kurosu & Kashimura (Hitachi, 1995) tested 26 ATM layouts with 252 participants and found "a stronger correlation between the participants' ratings of aesthetic appeal and perceived ease of use than the correlation between their ratings of aesthetic appeal and actual ease of use." Takeaway: attractive design "can conceal functional issues and prevent discovery of problems during usability testing."

**Implication.** This is a double-edged finding for PD. A clean first layer will *score* well in preference tests and demos (which is why sales-driven B2B redesigns love it), while masking the fact that experts can no longer find what they need. Measure PD with task time, error rate, and time-to-feature-discovery, not with satisfaction ratings alone.

---

## 3. Miller's Law, working memory, and the 4±1 correction

**Definition.** Miller (1956) proposed that immediate memory span is about seven chunks. Nelson Cowan's 2001 reanalysis ("The magical number 4 in short-term memory: A reconsideration of mental storage capacity," *Behavioral and Brain Sciences* 24(1), 87–114, https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/magical-number-4-in-shortterm-memory-a-reconsideration-of-mental-storage-capacity/44023F1147D4A1D44BDC0AD226838496) revised this downward.

**Verbatim (Cowan abstract).**
> "Others have since suggested that there is a more precise capacity limit, but that it is only three to five chunks."

> "A single, central capacity limit averaging about four chunks is implicated."

The pure limit is observable only when "rehearsal and long-term memory cannot be used to combine stimulus items into chunks," or "when other steps are taken specifically to block the recoding of stimulus items into larger chunks."

**The misapplication critique.** Jakob Nielsen, "Short-Term Memory and Web Usability," NN/g, 6 Dec 2009 (https://www.nngroup.com/articles/short-term-memory-and-web-usability/):
> "It's a common misconception that limited short-term memory implies that menus should be similarly limited to 7 items."

> "It's fine to have longer menus (if needed), because users don't have to memorize the full list of menu items."

> "The entire idea of a menu is to rely on recognition rather than recall (one of the basic 10 heuristics for user interface design)."

Nielsen's real STM prescriptions: "Response times must be fast enough that users don't forget what they're in the middle of doing while waiting for the next page to load," and "Offer help and user assistance features in the context where users need them so they don't have to travel to a separate help section and memorize steps before returning to the problem at hand."

Laws of UX ("Working Memory," https://lawsofux.com/working-memory/): "Working memory is limited to 4-7 chunks of information at any given moment with each chunk fades after 20-30 seconds," and "Our brains are good at recognizing something we've seen before but not at keeping new information ready to be used."

**Implication.** Working-memory limits are a *real* argument for PD, but the argument is not "show at most 7 things." It is: (a) never require the user to *hold* more than ~4 items across a disclosure boundary — e.g., don't put the field a user must reference in a collapsed panel while they fill in a related field elsewhere; (b) a long but visible, well-grouped list is fine because it is recognised, not recalled; (c) PD that forces a page load, modal, or navigation between two mutually dependent pieces of information is exactly the case Cowan's four-chunk limit punishes. Persist critical context (selected record, filter state, totals) across every disclosure level.

---

## 4. Choice overload / paradox of choice — and its nuance

**Definition.** Choice overload (overchoice; Toffler 1970; Schwartz, *The Paradox of Choice*, 2004) is the hypothesis that larger option sets reduce the motivation to choose and satisfaction with the choice. Laws of UX (https://lawsofux.com/choice-overload/): "The tendency for people to get overwhelmed when they are presented with a large number of options, often used interchangeably with the term paradox of choice."

**The canonical study.** Iyengar & Lepper, "When Choice Is Demotivating: Can One Desire Too Much of a Good Thing?", *JPSP* 79(6), 2000. Text extracted from https://faculty.washington.edu/jdb/345/345%20Articles/Iyengar%20&%20Lepper%20(2000).pdf.

> "Of the 242 customers who passed the extensive-selection display of jams, 60% (145) actually stopped at the booth. In contrast, of the 260 customers who passed the limited-selection display of jams, only 40% (104) stopped."

> "Nearly 30% (31) of the consumers in the limited-choice condition subsequently purchased a jar of Wilkin & Sons jam; in contrast, only 3% (4) of the consumers in the extensive-choice condition did so."

> "participants actually reported greater subsequent satisfaction with their selections and wrote better essays when their original set of options had been limited."

Note the two-sided effect: 24 jams *attracted* more people (60% vs 40%) but *converted* far fewer (3% vs 30%). Breadth pulls; depth of choice paralyses.

**The meta-analytic correction.** Scheibehenne, Greifeneder & Todd, "Can There Ever Be Too Many Options? A Meta-Analytic Review of Choice Overload," *Journal of Consumer Research* 37(3), Oct 2010. Extracted from https://scheibehenne.com/ScheibehenneGreifenederTodd2010.pdf.

> "In a meta-analysis of 63 conditions from 50 published and unpublished experiments (N = 5,036), we found a mean effect size of virtually zero but considerable variance between studies."

> "The mean effect size of choice overload across all 63 data points according to equation 1 is D = 0.02 (95% confidence interval [CI95] −0.09 to 0.12)."

> "While further analyses indicated several potentially important preconditions for choice overload, no sufficient conditions could be identified."

Their moderators point straight at B2B contexts. Expertise reverses the effect: users with "prior preferences or expertise benefit from having more options to choose from (Chernev 2003b; Mogilner et al. 2008)"; the meta-regression coefficient for "Expertise or prior preferences" was −.50 (p = .013). Time pressure creates it: "Inbar et al. (2008) found that more options decreased satisfaction with the choice outcome and increased regret only when decision makers felt rushed because of experimentally induced time pressure." And a dominant option prevents it: "choice overload can occur only if there is no obviously dominant option in the choice set."

Chernev, Böckenholt & Goodman, "Choice overload: A conceptual review and meta-analysis," *Journal of Consumer Psychology* 25(2), 2015 (https://chernev.com/wp-content/uploads/2017/02/ChoiceOverload_JCP_2015.pdf) reanalysed 99 observations (N = 7,202) and concluded the opposite once moderators are modelled:

> "we identify four key factors — choice set complexity, decision task difficulty, preference uncertainty, and decision goal — that moderate the impact of assortment size on choice overload."

> "higher levels of decision task difficulty, greater choice set complexity, higher preference uncertainty, and a more prominent, effort-minimizing goal facilitate choice overload."

> "when moderating variables are taken into account the overall effect of assortment size on choice overload is significant — a finding counter to the data reported by prior meta-analytic research."

Chernev et al. also define overload in Simon's terms: choice overload is "a scenario in which the complexity of the decision problem faced by an individual exceeds the individual's cognitive resources (Simon, 1955; Toffler, 1970)."

**Implication.** The jam study is *not* a blanket mandate to hide options. Choice overload is conditional, and the conditions map cleanly onto user segments in enterprise software: it bites for **novices with uncertain preferences, under time pressure, choosing among non-alignable, hard-to-compare options with no default**. It does *not* bite — and may reverse — for **domain experts with clear preferences**. Therefore: (1) PD should hide options from the first-run, onboarding, and infrequent-task paths; (2) expert screens (the analyst's query builder, the admin's permission matrix) should expose more, not less, because those users are helped by breadth; (3) wherever a choice must be shown, supply a *dominant default* and make options comparable (alignable attributes), which removes overload even at large n. Laws of UX's "choice overload" takeaways say the same: prioritise displayed content and provide "upfront choice-narrowing tools such as search and filtering."

---

## 5. Attention, visual search, banner blindness, change blindness — the risks of hiding

PD relies on the user *noticing* the affordance to disclose more and *noticing* what appears when they do. Two well-documented attentional failures threaten both.

**Banner blindness.** Kara Pernice, "Banner Blindness Revisited: Users Dodge Ads on Mobile and Desktop," NN/g, 22 Apr 2018 (https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/): "Banner blindness describes people's tendency to ignore page elements that they perceive (correctly or incorrectly) to be ads."

> "Users have learned to ignore content that resembles ads, is close to ads, or appears in locations traditionally dedicated to ads."

> "Legitimate content elements that have certain ad-like characteristics are ignored, too."

> "When content resembles ads and appears in the right rail, users tend to ignore it."

Pernice also describes the "hot-potato effect": "Users gaze at an item in which they are not interested, then look away and avoid fixating on that area on that page, and sometimes on other pages on the website."

**Change blindness.** Kathryn Whitenton, "Change Blindness in UX: Definition," NN/g, 29 Mar 2015 (https://www.nngroup.com/articles/change-blindness/): the tendency to overlook alterations in a display, especially after a visual interruption.

> "Any time a new visual element is introduced to an existing display, it is at risk of being overlooked."

> "Error messages are commonly affected by change blindness" when "99% of the page looks exactly the same, with only the addition of a single new element."

> "People are less sensitive to small changes at the edges of their visual field."

> "If the system changes results instantly, people may not realize that the filter has been applied and that the results set is now smaller."

Remedies she lists: "appropriate visual emphasis" and "animated transitions to avoid instantaneous changes."

**Accordions and hidden content.** Hoa Loranger, "Accordions Are Not Always the Answer for Complex Content on Desktops," NN/g, 18 May 2014 (https://www.nngroup.com/articles/accordions-complex-content/):

> "Hiding content behind navigation diminishes people's awareness of it. An extra step is required to see the information."

> "When content is hidden, people might ignore information."

> "It is easier to scroll down the page than to decide which heading to click on. Every single decision adds cognitive load."

> "Accordions are helpful when the information is restricted to very small spaces, such as on mobile devices."

**Implication.** Three concrete risks for B2B PD. (1) The *disclosure trigger* (an "Advanced" link in a right rail, a small chevron at the screen edge) can fall into banner-blind or peripheral zones and never be seen — put triggers in the primary reading path and make them look like controls, not decoration. (2) *What appears* on disclosure (an inline section expanding below the fold, a validation message, a contextual tab appearing in the ribbon) is subject to change blindness — animate, highlight, or move focus. (3) On wide desktop screens, an accordion that forces "click one heading at a time" can cost more than a scrollable page; Loranger's rule is that "Readers treat clicks like currency." Reserve collapse-by-default for genuinely secondary content or for space-constrained layouts.

---

## 6. Learning and expertise: active-user paradox, perpetual intermediates, scaffolding, training wheels

### 6a. The paradox of the active user (Carroll & Rosson, 1987)

**Source.** Jakob Nielsen, "The Paradox of the Active User," NN/g, 4 Oct 1998 (https://www.nngroup.com/articles/paradox-of-the-active-user/), summarising Carroll & Rosson, "Paradox of the active user," in *Interfacing Thought: Cognitive Aspects of Human-Computer Interaction* (MIT Press, 1987). Also Laws of UX (https://lawsofux.com/paradox-of-the-active-user/) and Krystal Higgins, "Onboarding and the active user paradox," 25 Aug 2018 (https://www.kryshiggins.com/active-user-paradox/).

> "Users never read manuals but start using the software immediately."

> "They are motivated to get started and to get their immediate task done: they don't care about the system as such."

> "Users would save time in the long term by taking some initial time to optimize the system and learn more about it. But that's not how people behave in the real world."

> "We cannot allow engineers to build products for an idealized rational user when real humans are irrational: we must design for the way users actually behave."

Carroll & Rosson decomposed the paradox into a **production paradox** (users focused on producing output will not invest in learning) and an **assimilation paradox** (users interpret the new system through prior knowledge, which both helps and misleads). Higgins: "This paradox is the result of fundamental human behavior, and is not a design problem to be solved," and "We need to make guidance accessible throughout our product experience and design it to fit within the context of use." Kate Kaplan's NN/g piece on complex applications (below) restates it: "Users tend to start using things rather than taking time to understand them first."

**Implication.** Because users will not front-load learning, PD is the only way to *deliver* learning: the initial layer must let a user produce something of value on day one, and the disclosure path must teach the next layer in the flow of work (contextual help, tooltips, "you can also…" hints), not in a separate training module. This also explains why "assimilation" of one B2B tool into another's mental model (Jakob's Law) matters: users will map your PD structure onto whatever they already know.

### 6b. Training wheels (Carroll & Carrithers, 1984)

**Source.** Carroll & Carrithers, "Training wheels in a user interface," *Communications of the ACM* 27(8), Aug 1984, 800–806. Abstract via Penn State (https://pure.psu.edu/en/publications/training-wheels-in-a-user-interface/):

> "New users of high-function application systems can become frustrated and confused by the errors they make in the early stages of learning."

A training interface for a commercial word processor made "typical and troublesome error states" unreachable. Result: "substantially faster learning coupled with better learning achievement and better performance on a comprehension post-test," while the control group "spent almost a quarter of their time recovering from the error states that the training interface blocked off."

This is the empirical origin of PD-as-learning-aid. Shneiderman (2003) cites it directly: "The training wheels concept, which prevents user errors by limiting actions, produces faster learning and more satisfied users."

### 6c. Perpetual intermediates (Cooper)

**Source.** Alan Cooper, Robert Reimann, David Cronin, *About Face 3*, ch. 10 "Optimizing for Intermediates" (notes at https://www.gregbulla.com/TechStuff/Docs/NotesFromAboutFace3.htm).

> "Nobody wants to remain a beginner. Most beginners will either migrate into intermediates or will eventually stop using the product."

> "Most users are intermediates. We prefer the term perpetual intermediates since they seldom go on to become experts."

> "The experience level of people performing an activity tends, like most population distributions, to follow the classic statistical bell curve."

> "We need to spend more time making our products powerful and easy to use for perpetual intermediate users."

**Implication.** PD's first layer serves beginners for a *short* time; the second layer is where perpetual intermediates live for years. In B2B, this argues for a three-tier design: (1) a starter layer that is safe and productive, (2) a broad intermediate layer that exposes the full daily-use toolset with recognition-based UI, and (3) expert accelerators (keyboard shortcuts, bulk actions, scripting) that are "unseen by the novice" (NN/g heuristic 7). The intermediate layer should be the design's centre of gravity, not the minimal one.

### 6d. Scaffolding and the zone of proximal development

**Sources.** Vygotsky (1978); Wood, Bruner & Ross, "The role of tutoring in problem solving," *J. Child Psychology and Psychiatry* 17, 1976, 89–100 — quoted via SimplyPsychology (McLeod, updated 16 Oct 2025, https://www.simplypsychology.org/zone-of-proximal-development.html) and Fernández et al., "Re-conceptualizing 'Scaffolding' and the Zone of Proximal Development…," ERIC (https://files.eric.ed.gov/fulltext/EJ1100363.pdf).

Vygotsky's ZPD: "the distance between the actual developmental level as determined by independent problem solving and the level of potential development as determined through problem-solving under adult guidance, or in collaboration with more capable peers" (Vygotsky, 1978, p. 86).

Scaffolding "enables a child or novice to solve a task or achieve a goal that would be beyond his unassisted efforts" (Wood et al., 1976, p. 90) by "controlling those elements of the task that are initially beyond the learner's capability, thus permitting him to concentrate upon and complete only those elements that are within his range of competence." Fading: "Support is tapered off (i.e., withdrawn) as it becomes unnecessary, much as a scaffold is removed from a building during construction."

Wood, Bruner & Ross's six tutor functions (paraphrased in Fernández et al.): orient attention to the task; "reduce the number of steps that are required to solve a problem"; maintain goal-directed activity; "highlight critical features of the task"; "control the frustration of the child and the risk of failure"; provide "idealized models of required actions."

**Recent empirical test.** Liu & Sra, "Designing Scaffolded Interfaces for Enhanced Learning and Performance in Professional Software," arXiv 2505.12101, May 2025 (https://arxiv.org/abs/2505.12101), built ScaffoldUI in Blender and tested with 32 beginners and 8 experts. The interface presents task-relevant tools selectively, progressively discloses tool complexity, and organises tools around domain concepts. Findings: scaffolded interfaces "significantly reduce perceived task load caused by interface complexity," "support task performance through structured guidance," and "augment learning by clearly connecting concepts and tools within the taskflow context."

**Implication.** PD is scaffolding when its layers are *pedagogically sequenced* and *faded*. Three of Wood et al.'s functions are exactly what a first layer does: reduce steps, mark critical features, control frustration. The often-missed part is fading: a B2B product should notice when a user has mastered layer 1 (usage telemetry, explicit "show advanced by default" settings) and stop making them click through the scaffold. A scaffold that never comes down is a tax on experts.

### 6e. Flexibility and efficiency of use (NN/g heuristic 7)

**Source.** Page Laubheimer, "Flexibility and Efficiency of Use (Usability Heuristic #7)," NN/g, 22 Nov 2020 (https://www.nngroup.com/articles/flexibility-efficiency-heuristic/).

> "New users often require guidance when using a system and need clear and obvious options because they have not yet developed a mental model."

> "Shortcuts — unseen by the novice user — speed up the interaction for the expert users such that the system can cater to both inexperienced and experienced users."

> "Most users won't bother to customize the system."

Kate Kaplan, "10 Usability Heuristics Applied to Complex Applications," NN/g, 15 Aug 2021 (https://www.nngroup.com/articles/usability-heuristics-complex-applications/), defines a complex application as "Any application supporting the broad, unstructured goals or nonlinear workflows of highly trained users in specialized domains," and notes that "Staged disclosure can be used to defer those elements to a secondary level" when elements are rarely used; that "Accelerators help expert users push past this plateau by providing faster methods (i.e., shortcuts)"; and that "Every item in an interface competes for attention and strains users' cognition."

**Implication.** The "unseen by the novice" phrase is PD for experts: the expert's extra power is disclosed by knowledge (shortcuts, command palettes), not by screen space. And Laubheimer's "Most users won't bother to customize" is the empirical reason adaptable (user-configured) disclosure cannot be the *only* mechanism — see §10.

---

## 7. Recognition vs recall (Nielsen heuristic #6) — the discoverability cost

**Definition.** Nielsen's sixth heuristic ("10 Usability Heuristics for User Interface Design," NN/g, 24 Apr 1994, rev. 2024, https://www.nngroup.com/articles/ten-usability-heuristics/): "Minimize the user's memory load by making elements, actions, and options visible. The user should not have to remember information from one part of the interface to another." Tips: "Let people recognize information in the interface, rather than forcing them to remember ('recall') it." / "Offer help in context, instead of giving users a long tutorial to memorize."

Heuristic #8 is PD's counterweight on the same list: "Interfaces should not contain information that is irrelevant or rarely needed. Every extra unit of information in an interface competes with the relevant units of information and diminishes their relative visibility."

**Mechanism.** Raluca Budiu, "Memory Recognition and Recall in User Interfaces," NN/g, 15 Jan 2024 (https://www.nngroup.com/articles/recognition-and-recall/):

> "Recognition is easier than recall because it involves more cues: all those cues spread activation to related information in memory, raise the answer's activation, and make you more likely to pick it."

> "A menu system is the most classic example of a recognition-based user interface: the computer shows you the available commands, and you recognize the one you want."

> "Gestural interfaces also rely heavily on recall because they require users to remember the gestures that they can make in a given context."

The design prescription is "making information and interface functions visible and easily accessible."

**Implication.** Every feature moved behind a disclosure boundary is converted, at least partially, from recognition to recall: the user must *remember that it exists* and *remember where it lives*. Heuristics #6 and #8 are therefore in explicit tension, and PD is the negotiated settlement between them. The settlement is only acceptable if (a) the hidden item is genuinely rarely needed (heuristic 8), and (b) the disclosure trigger itself is a recognisable cue with strong scent (§8) — so the user recognises "there is more here" even if they cannot recall exactly what. In B2B, the failure mode is the feature nobody knows exists: Microsoft's Office research found precisely this (§10).

---

## 8. Decision fatigue, satisficing, and information foraging — PD labels must carry scent

### 8a. Satisficing (Simon)

**Source.** Kathryn Whitenton, "Satisficing: Quickly Meet Users' Main Needs," NN/g, 30 Mar 2014 (https://www.nngroup.com/articles/satisficing/). Simon's term for settling on a good-enough option. Definition: "Satisficing occurs when someone settles for something that they know may not be the best possible choice but meets their essential needs."

> "Most site visitors won't read all the content provided but settle for a 'good-enough' answer."

> "People take just enough time to identify at least one reasonable option, select it, and move on."

> "If it requires a lot of effort to understand a site's offerings, many of its visitors will never even realize what's available."

### 8b. Decision fatigue — treat with caution

The popular "decision fatigue" claim rests on Baumeister's ego-depletion model. The pre-registered multi-lab replication (Hagger et al., 2016; 23 laboratories, N = 2,141) found an effect near zero (d ≈ 0.04, not significant). A PMC commentary (https://pmc.ncbi.nlm.nih.gov/articles/PMC4971805/) states plainly: "The ego depletion effect has not been replicated by a recent project," while noting a possible conditional effect when participants reported high effort and criticising the e-crossing manipulation. **Implication:** do not justify PD with "decision fatigue" as a strong biological claim. Satisficing (well-supported) and interaction cost (§9) carry the argument without it.

### 8c. Information foraging and information scent (Pirolli & Card, 1999)

**Sources.** Pirolli & Card, "Information Foraging," *Psychological Review* 106(4), 1999, 643–675. NN/g: Raluca Budiu, "Information Foraging: A Theory of How People Navigate on the Web," 10 Nov 2019 (https://www.nngroup.com/articles/information-foraging/), and "Information Scent: How Users Decide Where to Go Next," 2 Feb 2020 (https://www.nngroup.com/articles/information-scent/).

Foraging: "when users have a certain information goal, they assess the information that they can extract from any candidate source of information relative to the cost involved in extracting that information." Users maximise "Rate of gain = Information value / Cost associated with obtaining that information."

Scent: "The information scent of a source of information (such as a webpage) relative to an information need represents the user's imperfect estimate of the value that the source will deliver to the user, derived from a representation of the source." And: "Each source of information thus emits a 'scent' — a signal that tells the forager how likely it is that it contains what she needs."

> "Link names should be clear and self-explanatory. If the link name is too obscure and vague, people might miss a good source of information."

> "Jargon, branded terms, or simply too sophisticated words may end up ignored and may not provide enough understandable cues for all your users."

> "Like in the story of the boy who cried 'wolf' too many times, next time when you will actually have relevant content, people will be less likely to click on it knowing that they've been burned in the past."

**Implication.** A disclosure trigger is a foraging decision point. The label ("Advanced," "More options," "Settings," an unlabelled gear) is the *only* representation the user has of what lies behind it. Generic labels emit almost no scent, so satisficing users will not click and will conclude the feature does not exist. Design rules that follow: name the trigger for what it contains ("Tax and withholding rules," not "Advanced"); show a preview or count ("3 more filters"); never cry wolf with triggers that reveal nothing useful; and keep the cost side of the ratio low (inline expansion, not a new page). This is the operational meaning of Nielsen's requirement that "It must be obvious how users progress from the primary to the secondary disclosure levels."

---

## 9. Fitts's Law and interaction cost — the price of the extra click

### 9a. Interaction cost

**Source.** Raluca Budiu, "Interaction Cost," NN/g, 31 Aug 2013 (rev. 2024) (https://www.nngroup.com/articles/interaction-cost-definition/).

> "Interaction cost is the sum of efforts — mental and physical — that users must deploy in interacting with a digital product in order to reach their goals."

Components listed: reading, scrolling, looking around, comprehending, clicking or touching, typing, page loads and waiting, attention switches, memory load.

> "Sometimes a new window may pop up on top of the existing one, and in that case, users must switch attention to the new window and perhaps also look back to the old one to integrate information in both windows."

> "In other situations, users may need to remember information on one page and apply it on a different one. All these actions require cognitive effort and make up the interaction cost."

> "When there are several ways to reach the same goal with similar benefits, users typically tend to pick actions that minimize the estimated interaction cost."

Loranger (§5) adds: "Accordions increase interaction cost. Readers treat clicks like currency: they don't mind spending it if the click is worthwhile and has value."

### 9b. Fitts's Law

**Source.** Raluca Budiu, "Fitts's Law and Its Applications in UX," NN/g, 31 Jul 2022 (https://www.nngroup.com/articles/fitts-law/). T = a + b × log₂(2D/w). "The movement time to a target depends on the size of the target and the distance to the target."

> "Make targets big. Fitts's law clearly says that people will be faster to click, tap, or hover on bigger targets."

> "The bigger the distance to the target, the longer it will take for the pointer to move to it."

> "Screen edges act as natural walls for the cursor — as soon as the pointer reaches an edge, it cannot move beyond it."

Budiu notes that any target "made up of both an icon and a label will be greater than just an icon," that "Mobile contextual menus should appear near the trigger point, not distant bottom sheets," and ranks menu geometry: linear < rectangular < pie.

**Implication.** PD is a trade: it *removes* a scanning/comprehension cost from every visit and *adds* a pointing + clicking + (possibly) waiting + attention-switch cost to the visits that need the hidden content. The trade is favourable only when frequency × per-visit cost of the hidden set is small. Fitts's Law tells you how to keep the added cost minimal: large, labelled triggers close to the related content; disclosure that expands *in place* (zero pointer travel, no attention switch) rather than opening a modal or route; and hover reveals that respect the "no invisible padding" rule. Budiu's "pick actions that minimize the estimated interaction cost" is also a warning: if the disclosed path looks expensive, users will satisfice with the visible, inferior path.

---

## 10. Empirical studies of progressive disclosure, layered interfaces, adaptive menus, and form disclosure

### 10a. Multi-layer interfaces (Shneiderman, 2003)

**Source.** Ben Shneiderman, "Promoting Universal Usability with Multi-Layer Interface Design," *ACM Conference on Universal Usability*, Nov 2003 (https://www.cs.umd.edu/~ben/ACM-CUU2003.pdf).

> "This paper promotes the idea of multi-layer interface designs that enable first-time and novice users to begin with a limited set of features at layer 1. They can remain at layer 1, then move up to higher layers when needed or when they have time to learn further features."

> "Separating out the layers could enable users to learn features in a meaningful sequence, while limiting complexity of menus and help screens. Users could gain confidence and master layer 1, then move on to higher layers when needed or when they had time to learn."

> "Layer 1 (Getting started) permits safe exploration and therefore has no error messages."

Example systems: an 8-layer word processor (Layer 1 "has typing and a few buttons"; Layer 3 "has pull-down menus with more features") and a 3-layer interactive census map ("layer 1: map and table only; layer 2: map and table, plus dynamic query filters; layer 3: … plus scatter plot") because some users "were overwhelmed by the rich set of features."

Shneiderman is candid about the objections: critics argue "additional complexity of switching layers can overwhelm users, especially novices," that "a linear sequence of features is difficult to identify," and "that mature users adopt strongly different subsets of features." He is sceptical of machine-driven adaptation: "machine initiated changes to user interface features seem to be" problematic given "user desires for consistency, predictability, and control." Conclusion: "Even expert users might appreciate lower layers since frequent operations might be accomplished with fewer steps."

### 10b. Static vs adaptive vs adaptable menus (Findlater & McGrenere, CHI 2004)

**Source.** Findlater & McGrenere, "A Comparison of Static, Adaptive, and Adaptable Menus," *CHI 2004* (https://www.cs.ubc.ca/labs/imager/tr/2004/findlater04menus/).

> "Software applications continue to grow in terms of the number of features they offer, making personalization increasingly important. Research has shown that most users prefer the control afforded by an adaptable approach to personalization rather than a system-controlled adaptive approach."

> "In a controlled lab study with 27 subjects we compared the measured and perceived efficiency of three menu conditions: static, adaptable and adaptive. Each was implemented as a split menu, in which the top four items remained static, were adaptable by the subject, or adapted according to the subject's frequently and recently used items."

> "The static menu was found to be significantly faster than the adaptive menu, and the adaptable menu was found to be significantly faster than the adaptive menu under certain conditions. The majority of users preferred the adaptable menu overall."

The search-result summary of the same paper adds that the adaptable menu was as slow as the adaptive one when it was the first condition experienced, because "Some subjects who experienced the adaptable first did not recognize the value of customization, thus made no changes." Findlater's later "Ephemeral adaptation" (CHI 2009, https://dl.acm.org/doi/10.1145/1518701.1518956; page not retrievable, 403) explored adaptive highlighting that fades rather than reordering.

### 10c. Microsoft Office 2007 Ribbon (Jensen Harris)

**Sources.** Jensen Harris, "Tipping the Scale (Why the UI, Part 5)," MSDN blog, 4 Apr 2006 (https://learn.microsoft.com/en-us/archive/blogs/jensenh/tipping-the-scale-why-the-ui-part-5); "The Biggest Loser," 17 Feb 2006 (https://learn.microsoft.com/en-us/archive/blogs/jensenh/the-biggest-loser); UX Week 2008 talk notes (https://www.jurecuhalev.com/blog/jensen-harris-the-story-of-the-ribbon-office-2007-uxweek08-notes/).

> "The problem is that Office has outgrown them. There's a point beyond which menus and toolbars cease to scale well. A flat menu with 8 well-organized commands on it works just great; a three-level hierarchical menu containing 35 loosely-related commands can be a bit of a disaster."

> "Keep in mind that every toolbar includes between 10 and 50 commands, often presented only as 16x16 unlabeled icons."

> "It's hard because virtually all of the features do get used and every feature is someone's favorite."

> "This is why concepts such as contextualization and galleries are so pivotal to the new UI — they help break the functionality of Office into more manageable pieces while maintaining the integration that makes the product powerful."

From the UX Week notes: Word toolbars grew from 2 (1989) to 8 (Word 6.0), 18 (Word 97), 23 (Word 2000); menu items from "50 … to 300 in the end"; "They added new features, but hardly anyone found them"; and the data behind the redesign: "Over 3 billion (anonymous) data sessions collected from Office users. Every month, tracked 150 million command button clicks in Word."

Harris's user-research anecdote in the comments of "The Biggest Loser": field users had Drawing/Picture/Reviewing toolbars open and "don't know how to put them away. We ask them 'why do you have this up' and they say 'oh, I don't know what that does.'"

The Ribbon is contextual PD at scale: contextual tabs surface picture/table/chart tools only when such an object is selected and "disappear when they're no longer relevant," and Harris measured that the richer UI used *fewer* vertical pixels (135) than Word 2003's default (140) because specialised toolbars no longer needed permanent space.

### 10d. Checkout form disclosure (Baymard)

**Source.** Edward Scott, "Checkout Optimization: Minimize Form Fields," Baymard Institute, 26 Jun 2024 (https://baymard.com/blog/checkout-flow-average-form-fields).

> "The number of form fields users must consider impacts overall usability far more than the number of steps."

> "Address Line 2 fields should be hidden behind a link" — 30% of test participants hesitated at the field, "while those needing it actively sought it out."

> "Coupon Code fields, like Address Line 2 fields, should be hidden behind a link."

> "By applying the same reasoning to additional, optional fields (e.g., Company Name, phone numbers, Fax) — hiding them behind links — you can present users with only fields they absolutely need."

Benchmarks: the average checkout has 11.3 fields across 5.1 steps; Baymard's testing suggests 8 fields suffice; 17–18% of shoppers have abandoned an order because checkout was too long or complicated.

### 10e. Accordions (NN/g), Scaffolded UI (Liu & Sra 2025)

Covered in §5 and §6d: Loranger's desktop accordion findings (interaction cost, reduced awareness) and Liu & Sra's Blender study (reduced perceived task load, improved performance and learning with 32 beginners / 8 experts).

**Implication across the empirical record.**
1. **Layering works for learning** (Carroll & Carrithers 1984; Shneiderman 2003; Liu & Sra 2025) when layers are stable, named, and user-controlled.
2. **System-driven adaptation is risky**: Findlater & McGrenere found static split menus beat adaptive ones on speed; Shneiderman flagged predictability. In B2B, where muscle memory drives throughput, prefer *stable* disclosure structures with optional user customisation, and note that most users will not customise — so defaults must be right.
3. **Context-triggered disclosure scales** (Office contextual tabs): reveal tools based on *object state* (a selected chart, a record in draft), which is deterministic and predictable, rather than on inferred *user* behaviour.
4. **Field-level disclosure measurably reduces friction** (Baymard): hide optional fields behind labelled links; the users who need them "actively sought it out."
5. **Section-level hiding on desktop has a cost** (Loranger): do not collapse content that most users must read anyway.

---

## Synthesis

Progressive disclosure is not one psychological principle but a negotiated settlement among several that pull in different directions. On one side, Sweller's cognitive load theory, Cowan's four-chunk working-memory limit, Hick's Law, Nielsen's heuristic #8 (minimalist design), satisficing, and the conditional evidence for choice overload all say: every rarely needed control on screen is a perception, classification, and decision cost paid on every visit, and for novices with uncertain preferences under time pressure those costs compound into confusion, error, and abandonment. Carroll's active-user paradox says users will not pay an up-front learning cost to avoid this, and Carroll & Carrithers' training-wheels experiment, Shneiderman's multi-layer designs, and Liu & Sra's ScaffoldUI show that a constrained first layer produces faster learning, fewer error-recovery detours, and lower perceived task load. Vygotsky and Wood, Bruner & Ross supply the pedagogical model: a scaffold that reduces steps, marks critical features, and controls frustration, then fades.

On the other side, Nielsen's heuristic #6 (recognition over recall), information-foraging theory, interaction cost, Fitts's Law, banner and change blindness, and Loranger's accordion findings all say: every element moved behind a disclosure boundary converts recognition into recall, adds pointer travel, clicks, and attention switches, risks never being seen, and relies entirely on the scent of its trigger label. Tesler's Law reminds us the complexity does not vanish; it is relocated. The Scheibehenne and Chernev meta-analyses add that choice overload is *conditional*: experts with clear preferences are helped, not hurt, by breadth, and Landauer & Nachbar found breadth beats depth in menus. Findlater & McGrenere found static menus beat adaptive ones on speed, and Microsoft's Office telemetry found that "virtually all of the features do get used" while "hardly anyone found" new ones.

For complex B2B software the practical resolution is: (1) Split by *frequency and role*, using usage data, and disclose everything frequently needed up front (Nielsen's first rule). (2) Design the intermediate layer, not the minimal one, as the centre of gravity, because Cooper's perpetual intermediates live there for years. (3) Prefer *stable, context-triggered* disclosure (contextual tabs, object-state panels, inline expansion) over behaviour-inferred adaptation, which damages predictability and muscle memory. (4) Make triggers large, labelled with specific scent, placed in the primary reading path, and expanding in place, so the added interaction cost stays near zero and banner/change blindness cannot swallow them. (5) Never separate mutually dependent information across a disclosure boundary — Cowan's four chunks will not survive the trip. (6) Fade the scaffold: give experts a way to keep layers open and provide accelerators unseen by novices. (7) Measure with task time, error rate, and time-to-discovery, because the aesthetic-usability effect guarantees a clean first layer will *feel* better in a demo even when it hides the tool an analyst needs. Progressive disclosure done this way reduces extraneous load without silently taxing recall, and it turns a feature-rich product into one that teaches itself in the flow of work.

---

## Bibliography

**Primary research**
- Carroll, J. M., & Carrithers, C. (1984). Training wheels in a user interface. *Communications of the ACM*, 27(8), 800–806. https://pure.psu.edu/en/publications/training-wheels-in-a-user-interface/
- Carroll, J. M., & Rosson, M. B. (1987). Paradox of the active user. In *Interfacing Thought: Cognitive Aspects of Human-Computer Interaction*. MIT Press. (Via Nielsen 1998; Laws of UX; Higgins 2018.)
- Chernev, A., Böckenholt, U., & Goodman, J. (2015). Choice overload: A conceptual review and meta-analysis. *Journal of Consumer Psychology*, 25(2), 333–358. https://chernev.com/wp-content/uploads/2017/02/ChoiceOverload_JCP_2015.pdf
- Cowan, N. (2001). The magical number 4 in short-term memory: A reconsideration of mental storage capacity. *Behavioral and Brain Sciences*, 24(1), 87–114. https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/magical-number-4-in-shortterm-memory-a-reconsideration-of-mental-storage-capacity/44023F1147D4A1D44BDC0AD226838496
- Debue, N., & van de Leemput, C. (2014). What does germane load mean? An empirical contribution to the cognitive load theory. *Frontiers in Psychology*. https://pmc.ncbi.nlm.nih.gov/articles/PMC4181236/
- Fernández, M., et al. Re-conceptualizing "Scaffolding" and the Zone of Proximal Development in the Context of Symmetrical Collaborative Learning. ERIC EJ1100363. https://files.eric.ed.gov/fulltext/EJ1100363.pdf
- Findlater, L., & McGrenere, J. (2004). A comparison of static, adaptive, and adaptable menus. *CHI 2004*. https://www.cs.ubc.ca/labs/imager/tr/2004/findlater04menus/
- Findlater, L., et al. (2009). Ephemeral adaptation. *CHI 2009*. https://dl.acm.org/doi/10.1145/1518701.1518956 (abstract page not retrievable)
- Hagger, M. S., et al. (2016). A multilab preregistered replication of the ego-depletion effect. *Perspectives on Psychological Science*. Discussed in commentary: https://pmc.ncbi.nlm.nih.gov/articles/PMC4971805/
- Iyengar, S. S., & Lepper, M. R. (2000). When choice is demotivating: Can one desire too much of a good thing? *Journal of Personality and Social Psychology*, 79(6), 995–1006. https://faculty.washington.edu/jdb/345/345%20Articles/Iyengar%20&%20Lepper%20(2000).pdf
- Kurosu, M., & Kashimura, K. (1995). Apparent usability vs. inherent usability. *CHI '95*. (Via Laws of UX.)
- Landauer, T. K., & Nachbar, D. W. (1985). Selection from alphabetic and numeric menu trees using a touch screen. *CHI '85*. (Via Wikipedia, Hick's law.)
- Liu, Y., & Sra, M. (2025). Designing Scaffolded Interfaces for Enhanced Learning and Performance in Professional Software. arXiv:2505.12101. https://arxiv.org/abs/2505.12101
- Pirolli, P., & Card, S. (1999). Information foraging. *Psychological Review*, 106(4), 643–675. (Via NN/g Budiu 2019, 2020.)
- Proctor, R. W., & Schneider, D. W. (2018). Hick's law for choice reaction time: A review. *QJEP*. https://journals.sagepub.com/doi/10.1080/17470218.2017.1322622 (not retrievable, 403)
- Scheibehenne, B., Greifeneder, R., & Todd, P. M. (2010). Can there ever be too many options? A meta-analytic review of choice overload. *Journal of Consumer Research*, 37(3), 409–425. https://scheibehenne.com/ScheibehenneGreifenederTodd2010.pdf
- Shneiderman, B. (2003). Promoting universal usability with multi-layer interface design. *ACM Conference on Universal Usability*. https://www.cs.umd.edu/~ben/ACM-CUU2003.pdf
- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science*, 12(2), 257–285. (Via Debue & van de Leemput; Laws of UX.)
- Vygotsky, L. S. (1978). *Mind in Society*. Harvard University Press. (Via SimplyPsychology.)
- Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. *Journal of Child Psychology and Psychiatry*, 17, 89–100. (Via SimplyPsychology; Fernández et al.)

**Nielsen Norman Group**
- Budiu, R. (2013, rev. 2024). Interaction Cost. https://www.nngroup.com/articles/interaction-cost-definition/
- Budiu, R. (2019). Information Foraging: A Theory of How People Navigate on the Web. https://www.nngroup.com/articles/information-foraging/
- Budiu, R. (2020). Information Scent: How Users Decide Where to Go Next. https://www.nngroup.com/articles/information-scent/
- Budiu, R. (2022). Fitts's Law and Its Applications in UX. https://www.nngroup.com/articles/fitts-law/
- Budiu, R. (2024). Memory Recognition and Recall in User Interfaces. https://www.nngroup.com/articles/recognition-and-recall/
- Kaplan, K. (2021). 10 Usability Heuristics Applied to Complex Applications. https://www.nngroup.com/articles/usability-heuristics-complex-applications/
- Laubheimer, P. (2020). Flexibility and Efficiency of Use (Usability Heuristic #7). https://www.nngroup.com/articles/flexibility-efficiency-heuristic/
- Loranger, H. (2014). Accordions Are Not Always the Answer for Complex Content on Desktops. https://www.nngroup.com/articles/accordions-complex-content/
- Nielsen, J. (1994, rev. 2024). 10 Usability Heuristics for User Interface Design. https://www.nngroup.com/articles/ten-usability-heuristics/
- Nielsen, J. (1995). Coping with Information Overload. https://www.nngroup.com/articles/coping-information-overload/
- Nielsen, J. (1998). The Paradox of the Active User. https://www.nngroup.com/articles/paradox-of-the-active-user/
- Nielsen, J. (2006). Progressive Disclosure. https://www.nngroup.com/articles/progressive-disclosure/
- Nielsen, J. (2009). Short-Term Memory and Web Usability. https://www.nngroup.com/articles/short-term-memory-and-web-usability/
- Pernice, K. (2018). Banner Blindness Revisited. https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/
- Sherwin, K. (2018). Hick's Law: Designing Long Menu Lists (video). https://www.nngroup.com/videos/hicks-law-long-menus/
- Whitenton, K. (2013). Minimize Cognitive Load to Maximize Usability. https://www.nngroup.com/articles/minimize-cognitive-load/
- Whitenton, K. (2014). Satisficing: Quickly Meet Users' Main Needs. https://www.nngroup.com/articles/satisficing/
- Whitenton, K. (2015). Change Blindness in UX. https://www.nngroup.com/articles/change-blindness/

**Laws of UX (Jon Yablonski)**
- Aesthetic-Usability Effect. https://lawsofux.com/aesthetic-usability-effect/
- Choice Overload. https://lawsofux.com/choice-overload/
- Cognitive Load. https://lawsofux.com/cognitive-load/
- Hick's Law. https://lawsofux.com/hicks-law/
- Jakob's Law. https://lawsofux.com/jakobs-law/
- Miller's Law. https://lawsofux.com/millers-law/
- Paradox of the Active User. https://lawsofux.com/paradox-of-the-active-user/
- Tesler's Law. https://lawsofux.com/teslers-law/
- Working Memory. https://lawsofux.com/working-memory/

**Practitioner and industry sources**
- Baymard Institute — Scott, E. (2024). Checkout Optimization: Minimize Form Fields. https://baymard.com/blog/checkout-flow-average-form-fields
- Cooper, A., Reimann, R., & Cronin, D. *About Face 3*, ch. 10 (notes). https://www.gregbulla.com/TechStuff/Docs/NotesFromAboutFace3.htm
- Harris, J. (2006). Tipping the Scale (Why the UI, Part 5). https://learn.microsoft.com/en-us/archive/blogs/jensenh/tipping-the-scale-why-the-ui-part-5
- Harris, J. (2006). The Biggest Loser. https://learn.microsoft.com/en-us/archive/blogs/jensenh/the-biggest-loser
- Harris, J. (2008). The Story of the Ribbon, UX Week 2008 (notes by J. Čuhalev). https://www.jurecuhalev.com/blog/jensen-harris-the-story-of-the-ribbon-office-2007-uxweek08-notes/
- Higgins, K. (2018). Onboarding and the active user paradox. https://www.kryshiggins.com/active-user-paradox/
- Interaction Design Foundation. Progressive Disclosure. https://ixdf.org/literature/topics/progressive-disclosure
- McLeod, S. (2025). Zone of Proximal Development. SimplyPsychology. https://www.simplypsychology.org/zone-of-proximal-development.html
- Smashing Magazine (2021). Smashing Newsletter #332 (complex UIs). https://www.smashingmagazine.com/the-smashing-newsletter/smashing-newsletter-issue-332/
- Wikipedia. Hick's law. https://en.wikipedia.org/wiki/Hick%27s_law
