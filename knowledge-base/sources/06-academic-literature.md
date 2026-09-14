# Academic Literature Review: Progressive Disclosure, Layered and Adaptive Interfaces

**Scope and method.** This review covers peer-reviewed HCI literature (plus a small number of foundational practitioner sources, flagged as such) on progressive disclosure, multi-layer / level-structured interfaces, adaptive vs. adaptable personalization, software bloat and feature use, software learnability for feature-rich tools, domain-specific evaluations (privacy notices, explainable AI, clinical AI, visualization), and the theoretical models that explain why disclosure strategies work. Sources were retrieved on 2026-09-12 from the ACM Digital Library, Semantic Scholar API, USENIX, arXiv, and authors' institutional copies (UBC, Toronto DGP, UMD, Canterbury, Waterloo, Autodesk Research). Where full text was paywalled (ACM, Elsevier), the abstract and metadata from Semantic Scholar were used; those cases are noted. Quotations are verbatim from the fetched text unless marked as paraphrase.

Throughout, "complex B2B apps" means feature-rich, multi-role enterprise software (ERP, CRM, analytics, admin consoles, developer tools) where the same product must serve first-time users, intermittent users and daily experts.

---

## 1. Carroll and the minimalist / training-wheels tradition

### 1.1 Carroll, J. M., & Carrithers, C. (1984). Training wheels in a user interface. *Communications of the ACM*, 27(8), 800–806.

- DOI: https://doi.org/10.1145/358198.358218 (338 citations per Semantic Scholar)
- **Abstract (verbatim):** "New users of high-function application systems can become frustrated and confused by the errors they make in the early stages of learning. A training interface for a commercial word processor was designed to make typical and troublesome error states 'unreachable,' thus eliminating the sources of some new-user learning problems. Creating a training environment from the basic function of the system itself afforded substantially faster learning coupled with better learning achievement and better performance on a comprehension post-test. A control group spent almost a quarter of their time recovering from the error states that the training interface blocked off."
- **Main findings.** The training-wheels version of the IBM Displaywriter blocked advanced functions (the menu entries remained visible but produced a "not available on the training system" message). Learners got started faster, completed the core task faster, and scored better on a system-concepts post-test; the control group spent roughly 25% of its time in error recovery. Carroll and Rosson (1987, below) summarize the follow-up studies: "learners using the training wheels system got started faster, produced [more work] ... and performed better on a system concepts test."
- **Relevance to progressive disclosure in B2B apps.** This is the earliest controlled evidence that *hiding (not removing) advanced functionality for novices* improves both speed and conceptual learning. Two design details matter for enterprise products: (a) the blocked functions stayed visible so that the novice's mental map of the full system was preserved, and (b) the reduced system was carved out of the real product rather than being a separate tutorial. Both anticipate Shneiderman's "layer 1" and modern "simplified mode" toggles.

### 1.2 Carroll, J. M., & Rosson, M. B. (1987). Paradox of the active user. In J. M. Carroll (Ed.), *Interfacing Thought: Cognitive Aspects of Human-Computer Interaction* (pp. 80–111). MIT Press.

- Open copy: https://research.cs.vt.edu/ns/cs5724papers/4.mental.mental.carroll.paradox.pdf ; ACM record: https://dl.acm.org/doi/10.5555/28446.28451
- **Key quotes (verbatim):** "A motivational paradox arises in the 'production bias' people bring to the task of learning and using computing equipment. Their paramount goal is throughput. ... it reduces their motivation to spend any time just learning about the system, so that when situations appear that could be more effectively handled by new procedures, they are likely to stick with the procedures they already know, regardless of their efficacy." And: "A second, cognitive paradox devolves from the 'assimilation bias': people apply what they already know to interpret new situations." The authors add that users' "skill tends to asymptote at relative mediocrity" and note "pockets of expertise" in user populations: "instead of becoming generalized experts themselves, users learn a basic set of knowledge, presumably relying on local experts to help them out when special needs arise."
- **Main argument.** Poor learning and plateaued skill are not merely design defects but structural consequences of users' goal-driven behavior. Proposed responses include training wheels ("A training wheels interface displays all of the [functions] ... but blocks off" the advanced ones) and "designing around" the production bias by making learning a by-product of doing.
- **Relevance.** The paradox is the core justification for progressive disclosure over documentation: B2B users will not read the manual, so the interface itself must expose the next-most-useful function at the moment of need. It also warns that once a user is productive in a reduced layer they may never leave it, which is the "expertise plateau" problem taken up by Cockburn et al. (2014) below.

### 1.3 Carroll, J. M. (1990). *The Nurnberg Funnel: Designing Minimalist Instruction for Practical Computer Skill*. MIT Press.

- Publisher page: https://mitpress.mit.edu/9780262031639/the-nurnberg-funnel/ (fetch blocked; summarized from the 1987 chapter and Grossman et al. 2009, which cites it)
- **Principles (paraphrased from the minimalism literature):** let learners start on real tasks immediately; slash reading and system-focused explanation; support error recognition and recovery; exploit prior knowledge. The "funnel" of the title is the mythical device that pours knowledge into a passive learner, which Carroll rejects.
- **Relevance.** Minimalism supplies the *content* strategy that pairs with progressive disclosure's *interface* strategy: each newly revealed layer should be accompanied by task-oriented, error-tolerant guidance rather than reference documentation.

---

## 2. Shneiderman: multi-layer interfaces and details-on-demand

### 2.1 Shneiderman, B. (2003). Promoting universal usability with multi-layer interface design. *Proceedings of the 2003 ACM Conference on Universal Usability (CUU '03)*, 1–8.

- DOI: https://doi.org/10.1145/957205.957206 ; open PDF: https://www.cs.umd.edu/~ben/ACM-CUU2003.pdf (264 citations)
- **Abstract (verbatim):** "Increased interest in universal usability is causing some researchers to study advanced strategies for satisfying first-time as well as intermittent and expert users. This paper promotes the idea of multi-layer interface designs that enable first-time and novice users to begin with a limited set of features at layer 1. They can remain at layer 1, then move up to higher layers when needed or when they have time to learn further features. The arguments for and against multi-layer interfaces are presented with two example systems: a word processor with 8 layers and an interactive map with 3 layers. New research methods and directions are proposed."
- **Key content.** Shneiderman cites a study that "even for experienced users of common personal computers, approximately 45% of their time is wasted with frustrating experiences tied to confusing menus, indecipherable dialog boxes, and hard to find functions." The word-processor example: "Layer 1 (Getting started) permits safe exploration and therefore has [no error messages]"; "At layer 2 (Basic editing), users might get additional buttons for [fonts, ruler, status bar]"; "At layer 3 (Formatting), users might [get pull-down menus]"; layer 4 "Structures" (tables, borders, frames); layer 5 "Styles" with tutorials; higher layers add macros, collaboration and programming. The interactive-map (U.S. Census) example: "layer 1: map and table only; layer 2: map and table, plus dynamic query filters; layer 3: map and table, dynamic query filters, plus scatter[plot]." He also proposes a ski-slope metaphor of difficulty markings "from white for beginners to black for experts" and argues that "Even expert users might appreciate lower layers" for occasional simple tasks. He explicitly ties the idea to Carroll's training wheels and to McGrenere et al.'s two-interface field study (20 participants).
- **Arguments against (paraphrased from the paper).** Implementation cost, the difficulty of choosing layer boundaries, the risk that users will not know a higher layer exists, and the lack of good metrics for first-time-user success.
- **Relevance.** This is the canonical academic statement of layered progressive disclosure. For B2B tools the transferable ideas are: user-controlled (not automatic) layer switching; layers defined by task complexity rather than by feature category; and a brief, layer-specific training manual ("so that the training manual for layer 1 is brief and comprehensible even to anxious novices").

### 2.2 Shneiderman, B. (1996). The eyes have it: A task by data type taxonomy for information visualizations. *Proceedings of the IEEE Symposium on Visual Languages*, 336–343.

- DOI: https://doi.org/10.1109/VL.1996.545307 ; PDF: https://hci.stanford.edu/courses/cs448b/papers/shneiderman96eyes.pdf (6,278 citations)
- **Abstract (verbatim):** "A useful starting point for designing advanced graphical user interfaces is the Visual Information-Seeking Mantra: Overview first, zoom and filter, then details-on-demand. But this is only a starting point in trying to understand the rich and varied set of information visualizations that have been proposed in recent years. This paper offers a task by data type taxonomy with seven data types (1-, 2-, 3-dimensional data, temporal and multi-dimensional data, and tree and network data) and seven tasks (overview, zoom, filter, details-on-demand, relate, history, and extract)."
- **Relevance.** "Details-on-demand" is progressive disclosure applied to data rather than to commands. Analytics dashboards, admin tables and monitoring consoles in B2B products are direct applications: show aggregates, let users filter, and reveal record-level detail only on selection. Cockburn, Karlson & Bederson (2009, section 6.4) review the empirical evidence for the overview+detail family.

### 2.3 Shneiderman, B., et al. *Designing the User Interface* (multiple editions, Pearson).

- ACM record for the 3rd edition: https://dl.acm.org/citation.cfm?id=523237
- The textbook's treatment of "level-structured" or "layered" interaction for novice, intermittent and expert users (and its Eight Golden Rules, including "cater to universal usability" and "reduce short-term memory load") popularized the vocabulary later formalized in the 2003 CUU paper. Not fetched directly; included for completeness.

---

## 3. Adaptive vs. adaptable interfaces and the "bloat" studies

### 3.1 McGrenere, J., & Moore, G. (2000). Are we all in the same "bloat"? *Proceedings of Graphics Interface 2000*, 187–196.

- Open PDF: https://www.graphicsinterface.org/wp-content/uploads/gi2000-25.pdf (111 citations)
- **Abstract (excerpt, verbatim):** "'Bloat' ... is seldom clearly defined and is often a catch-all phrase to suggest that software is filled with unnecessary features. However, to date there are no studies that explore how users actually experience complex functionality-filled software applications ... we carried out a study to gain a better understanding of the experiences of 53 members of the general population who use a popular word processor, Microsoft Word, Office 97. As a result we are able to further specify the term 'bloat', distinguishing an objective and subjective dimension."
- **Main findings (numbers).** The authors counted "265 first-level functions" in Word 97's menus and toolbars. "Of the 265 first-level functions, 15.8% (42) were not used at all and only 21.5% (57) were used by more than half of the participants. There were only 3.3% (12) functions that were used regularly by more than three quarters of the participants." "On average the participants used 27% of the functions, and were familiar with 51%. There was greater variation in the number of functions with which participants were familiar (range from 9% to 92%) than the functions actually used (range from 3% to 45%)." For dialog-box functions, participants "were familiar with on average 28% ... and used 13%." On preferences: "Only 24.5% wanted to have unused functions removed entirely but 45% preferred to have unused functions tucked away. The fact that 51% wanted the ability to discover new functions as they use the application points to one underlying reason for users not wanting unused functions removed."
- **Relevance.** This is the best-documented feature-use distribution in the HCI literature and the empirical basis for progressive disclosure over feature removal: users use roughly a quarter of the functions, but their subsets differ, and a plurality want unused functions *hidden, not deleted*, because they expect to grow into them. For B2B products this argues for personalizable reduced views plus a discoverable path to the full feature set.

### 3.2 McGrenere, J., Baecker, R. M., & Booth, K. S. (2002). An evaluation of a multiple interface design solution for bloated software. *Proceedings of CHI 2002*, 164–170.

- DOI: https://doi.org/10.1145/503376.503406 ; author PDF: https://www.dgp.toronto.edu/~joanna/papers/JMcGrenere_CHI_2002.pdf (222 citations). Extended as McGrenere, Baecker & Booth (2007), *ACM TOCHI* 14(1), "A field evaluation of an adaptable two-interface design for feature-rich software."
- **Abstract (verbatim):** "This study examines a novel interface design for heavily-featured productivity software. The design includes two interfaces between which the user can easily toggle: (1) an interface personalized by the user containing desired features only, and (2) the default interface with all the standard features. This design was prototyped as a front-end to a commercial word processor and evaluated in a comprehensive field study. The study tested the effects of different interface designs on users' satisfaction and their perceived ability to navigate, control, and learn the software. There were two conditions: a commercial word processor with adaptive menus and our two-interface prototype with adaptable menus for the same word processor. Results showed that participants were better able to navigate through the menus and toolbars and were better able to learn with our prototype. There were also significant differences in satisfaction and control with our design."
- **Study design and numbers.** 20 participants, each "involved for approximately 6 weeks," used "MSWord Personal" (a front-end to Word 2000 whose Personal Interface "contained only 6 functions" at the start) for four weeks after a baseline period with Word 2000's adaptive "expandable" menus. Participants were split into "feature-shy" and "feature-keen" personality types. Results: "14 out of 19 participants spent 50% or more of their word processing time in their Personal Interface" and "these same participants added all frequently-used functions"; of functions used on 25–50% of word-processing days, participants "added 90% of these functions." Perceived navigation improved significantly (Q1 vs Q6, F(1,18) = 5.7, p < .05; Q6 vs Q7, F(1,18) = 8.02, p < .05); learnability improved (F(1,18) = 4.13, p < .06); feature-shy users perceived a significant increase in control (F(1,9) = 11.17, p < .01). In the final ranking, "13 participants preferred Personal to either form of [Word] 2000." Critically for adaptive designs: "Seven of the 20 participants had to be informed that the short menus were in fact adapting to their personal usage ... 6 of the 7 participants who were unaware of the adapting short menus were feature-shy participants. This is an indicator that lack of knowledge that adaptation is taking place contributes to overall dissatisfaction with an adaptive application." The 7 users who did not prefer Personal "expressed frustration with the time required to personalize and so they gave up on the personalizing process."
- **Relevance.** The two-interface toggle is the closest academic analogue to "simple / advanced mode" in enterprise software, and it was validated in the field rather than the lab. Lessons: begin with a nearly empty personal layer; make the toggle one click; make adaptation *visible* (silent adaptation confused a third of users); and expect a subgroup to abandon customization if the effort is high, which motivates pre-built role defaults (see Findlater, McGrenere & Modjeska 2008, CHI, "Evaluation of a role-based approach for customizing a complex development environment," DOI 10.1145/1357054.1357251).

### 3.3 Findlater, L., & McGrenere, J. (2004). A comparison of static, adaptive, and adaptable menus. *Proceedings of CHI 2004*, 89–96.

- DOI: https://doi.org/10.1145/985692.985704 ; PDF: https://www.cs.ubc.ca/labs/imager/tr/2004/findlater04menus/findlater04menus.pdf (332 citations)
- **Abstract (verbatim):** "Software applications continue to grow in terms of the number of features they offer, making personalization increasingly important. Research has shown that most users prefer the control afforded by an adaptable approach to personalization rather than a system-controlled adaptive approach. No study, however, has compared the efficiency of the two approaches. In a controlled lab study with 27 subjects we compared the measured and perceived efficiency of three menu conditions: static, adaptable and adaptive. Each was implemented as a split menu, in which the top four items remained static, were adaptable by the subject, or adapted according to the subject's frequently and recently used items. The static menu was found to be significantly faster than the adaptive menu, and the adaptable menu was found to be significantly faster than the adaptive menu under certain conditions. The majority of users preferred the adaptable menu overall. Implications for interface design are discussed."
- **Numbers.** The optimal static split menu "was indeed 20% faster" than the non-customized menu (equivalent to standard Word menus). Preference: "the adaptable menu was preferred by the majority of subjects (55%), the adaptive menu did have support (30%). By contrast, only 15% of subjects wanted the static menu, even though it was the optimal split menu." The authors compare this with McGrenere et al.'s field study where "65% of subjects preferred adaptable, 15% preferred adaptive, and 20% requested static menus." The adaptable menu matched static performance only when users had prior experience of the task; when adaptable was the first condition it was as slow as adaptive, leading to the conclusion that "easy to use mechanisms are not sufficient. For effective customization, we may also need to guide users by providing examples."
- **Relevance.** Directly informs how B2B products should expose "favorites," pinned actions or personalized navigation: user-controlled promotion beats system-controlled reordering on both speed and preference, but only if the product seeds sensible defaults and shows users how to customize.

### 3.4 Gajos, K. Z., Everitt, K., Tan, D. S., Czerwinski, M., & Weld, D. S. (2008). Predictability and accuracy in adaptive user interfaces. *Proceedings of CHI 2008*, 1271–1274.

- DOI: https://doi.org/10.1145/1357054.1357252 ; PDF: http://aiweb.cs.washington.edu/ai/puirg/papers/kgajos-chi08-predictability.pdf (158 citations)
- **Abstract (verbatim):** "While proponents of adaptive user interfaces tout potential performance gains, critics argue that adaptation's unpredictability may disorient users, causing more harm than good. We present a study that examines the relative effects of predictability and accuracy on the usability of adaptive UIs. Our results show that increasing predictability and accuracy led to strongly improved satisfaction. Increasing accuracy also resulted in improved performance and higher utilization of the adaptive interface. Contrary to our expectations, improvement in accuracy had a stronger effect on performance, utilization and some satisfaction ratings than the improvement in predictability."
- **Numbers.** 23 participants (aged 21–44), 2x2 design (accuracy 50% vs 70%; predictable most-recently-used vs. opaque algorithm). "At the 50% accuracy level the adaptive toolbar was used 70.6% of the time when it contained the correct button, compared with 86.4% at the 70% accuracy level." Increased accuracy improved task completion (F(1,18) = 62.0, p < .001) and median time to reach adaptive-toolbar buttons "from 1.86s to 1.70s." "No significant effects were observed for the algorithm's predictability" on performance, though predictability strongly increased satisfaction.
- **Related:** Gajos, Weld & Wobbrock (2010), "Automatically generating personalized user interfaces with Supple," *Artificial Intelligence* 174(12–13), DOI 10.1016/j.artint.2010.05.005 (335 citations), which treats UI generation as optimization over user abilities and preferences.
- **Relevance.** For AI-driven "smart" disclosure in enterprise tools (recommended next actions, adaptive ribbons), accuracy is the gating variable: a 20-point accuracy gain moved utilization by 16 points. Below roughly 70% accuracy, adaptive promotion of features is unlikely to beat a well-designed static layer.

### 3.5 Findlater, L., Moffatt, K., McGrenere, J., & Dawson, J. (2009). Ephemeral adaptation: The use of gradual onset to improve menu selection performance. *Proceedings of CHI 2009*, 1655–1664.

- DOI: https://doi.org/10.1145/1518701.1518956 ; PDF: https://www.cs.ubc.ca/~joanna/papers/CHI2009_Findlater.pdf (135 citations)
- **Abstract (verbatim):** "We introduce ephemeral adaptation, a new adaptive GUI technique that improves performance by reducing visual search time while maintaining spatial consistency. Ephemeral adaptive interfaces employ gradual onset to draw the user's attention to predicted items: adaptively predicted items appear abruptly when the menu is opened, but non-predicted items fade in gradually. To demonstrate the benefit of ephemeral adaptation we conducted two experiments with a total of 48 users to show: (1) that ephemeral adaptive menus are faster than static menus when accuracy is high, and are not significantly slower when it is low and (2) that ephemeral adaptive menus are also faster than adaptive highlighting."
- **Numbers.** Benefits appeared at 79% prediction accuracy and did not become costs at 50%; the chosen onset delay was 500 ms. The paper also summarizes why spatial adaptation usually fails: "spatially adaptive interfaces are not often faster than their static counterparts because the user needs to constantly adapt to the altered layout, wiping out any potential gains."
- **Relevance.** Ephemeral adaptation is a *temporal* form of progressive disclosure: everything is available, but predicted items are revealed first. It keeps spatial stability, which is the property enterprise users most value in dense UIs, while still guiding attention.

### 3.6 Findlater, L., & McGrenere, J. (2010). Beyond performance: Feature awareness in personalized interfaces. *International Journal of Human-Computer Studies*, 68(3), 121–137.

- DOI: https://doi.org/10.1016/j.ijhcs.2009.10.002 (85 citations; abstract page paywalled; findings from the ACM record and secondary summaries)
- **Main finding (paraphrase from secondary sources):** reduced-functionality (layered) and adaptive interfaces improved core-task performance but significantly reduced users' *awareness* of features they had not used, and lowered later use of those features on new tasks; the authors frame this as a performance-versus-awareness trade-off.
- **Relevance.** The direct academic evidence for the main *cost* of progressive disclosure: what is hidden is not learned. B2B products that hide features must add awareness mechanisms (what's-new surfacing, contextual hints, command search) to avoid locking users into a permanent novice layer.

### 3.7 Leung, R., Findlater, L., McGrenere, J., Graf, P., & Yang, J. (2010). Multi-layered interfaces to improve older adults' initial learnability of mobile applications. *ACM Transactions on Accessible Computing*, 3(1), Article 1.

- DOI: https://doi.org/10.1145/1838562.1838563 (91 citations)
- **Study (paraphrased from abstract):** a controlled experiment with 16 older (65–81) and 16 younger (21–36) participants using either a 2-layer or a non-layered address-book application on a commercial smartphone. The multi-layer interface "allows novice users to start with a reduced-functionality interface layer that only allows them to perform basic tasks, before progressing to a more complex interface layer when they are comfortable." The multi-layer design benefited older participants more than younger ones on learning and task time.
- **Relevance.** Shows that Shneiderman's multi-layer proposal survives controlled evaluation, and that benefits are concentrated in the population with the least prior experience, which in B2B corresponds to occasional or newly onboarded users.

---

## 4. Software bloat, creeping featurism and feature-use distributions

### 4.1 Kaufman, L., & Weed, B. (1998). Too much of a good thing? Identifying and resolving bloat in the user interface: A CHI 98 workshop. *ACM SIGCHI Bulletin*, 30(4), 46–47.

- DOI: https://doi.org/10.1145/310307.310370 ; open mirror: https://homepages.cwi.nl/~steven/sigchi/bulletin/1998.4/kaufman.html
- **Key quotes (verbatim from the workshop report):** "Feature richness turns into bloat when there are more features than you want to use." "Users like feature growth but hate UI growth because it means problems of discoverability, learning, and command confusion" (Sean Draine, Microsoft). Joanna McGrenere's position statement called for "a good match between the set of skills needed to operate the system and the set of skills the user brings." Proposed remedies included simplified initial interfaces for novices with optional advanced features, task-based modes, and user customization.
- **Relevance.** Documents the industry origin (Microsoft Office team) of the adaptive "personalized menus" experiment that McGrenere et al. later evaluated, and frames the central trade-off: feature growth is wanted, interface growth is not.

### 4.2 Norman, D. A. (1988). *The Psychology of Everyday Things* (reissued as *The Design of Everyday Things*). Basic Books.

- Norman defines creeping featurism as "the tendency to add to the number of features that a device can do, often extending the number beyond all reason" (Chapter 6). His prescribed antidotes are modularization and, in later editions, hiding complexity behind good conceptual models. Cited by both Findlater & McGrenere (2004) and McGrenere et al. (2002) as the origin of the term. Not a peer-reviewed source but foundational.

### 4.3 Feature-use distribution data (non-academic, for triangulation)

- The Standish Group (Johnson, XP 2002 keynote) reported that in four internal enterprise applications 7% of features were used "always," 13% "often," 16% "occasionally," 19% "rarely," 45% "never." This is widely repeated but rests on a small, unpublished sample (see Mountain Goat Software's critique, https://www.mountaingoatsoftware.com/blog/are-64-of-features-really-rarely-or-never-used).
- Pendo (2019 Feature Adoption Report) analysed "feature usage across 615 Pendo subscriptions for customers who have used Pendo for more than a year" over three months, and reported **12% frequent / 8% moderate / 24% rare / 56% never used**. *(Corrected 14 Sep 2026: see sweep 15. The previous version of this line — "180 M users, 35,000 applications... 12% often, 15% sometimes, 73% rarely or never" — was wrong in both sample and distribution; the "15%" was a share of usage volume, not of features. Note also that a Pendo "feature" is a customer-chosen tag, so this is not comparable to McGrenere & Moore's exhaustive 265-function inventory.)*
- The peer-reviewed anchor remains McGrenere & Moore (2000): 27% of functions used on average, with per-user ranges of 3–45%, and only 3.3% of functions used regularly by more than three-quarters of users.
- **Relevance.** Together these justify a default layer sized around the small "core" set (in Word 97, 12 of 265 first-level functions) while keeping the long tail reachable, since the tail differs by user.

---

## 5. Layered interfaces, novice-to-expert transitions and learnability of feature-rich software

### 5.1 Clark, B., & Matthews, J. (2005). Deciding layers: Adaptive composition of layers in a multi-layer user interface. *Proceedings of HCI International 2005*, Vol. 7.

- ResearchGate record: https://www.researchgate.net/publication/228573999 (full text not accessible)
- **Content (paraphrased from indexed summaries):** explores mechanisms for deciding *when* to add layers to a user's interface, including inferring experience from prior use of similar applications and explicit signals such as alternative application launch modes. A companion CHI 2004 extended abstract, "A solution to interface evolution issues: the multi-layer interface," frames layers as a way to ship new features without disrupting existing users.
- **Relevance.** Raises the operational question B2B teams face after adopting layers: what triggers promotion? The options are user-initiated, usage-inferred, or role-based (cf. Findlater, McGrenere & Modjeska 2008).

### 5.2 Grossman, T., Fitzmaurice, G., & Attar, R. (2009). A survey of software learnability: Metrics, methodologies and guidelines. *Proceedings of CHI 2009*, 649–658.

- DOI: https://doi.org/10.1145/1518701.1518803 ; PDF: https://www.tovigrossman.com/papers/2009%20chi%20learnability.pdf (323 citations)
- **Abstract (verbatim):** "It is well-accepted that learnability is an important aspect of usability, yet there is little agreement as to how learnability should be defined, measured, and evaluated. In this paper, we present a survey of the previous definitions, metrics, and evaluation methodologies which have been used for software learnability. Our survey of evaluation methodologies leads us to a new question-suggestion protocol, which, in a user study, was shown to expose a significantly higher number of learnability issues in comparison to a more traditional think-aloud protocol. Based on the issues identified in our study, we present a classification system of learnability issues, and demonstrate how these categories can lead to guidelines for addressing the associated challenges."
- **Key content.** Distinguishes "Initial Learnability: Initial performance with the system" from "Extended Learnability: Change in performance over [time]"; cites Lazar et al. that "users lose up to 40% of their time due to 'frustrating experiences' with computers, with one of the most common causes ... being missing, hard to find, and unusable features." The issue taxonomy covers understanding (what a tool does), locating (where it is), awareness (that it exists), and transitioning (to more efficient methods), each mapped to design guidelines.
- **Relevance.** Provides the evaluation framework for progressive disclosure in enterprise software. A layered UI should be assessed on *extended* learnability (do users move up?) and specifically on awareness and transition issues, not just first-session task success.

### 5.3 Grossman, T., & Fitzmaurice, G. (2010). ToolClips: An investigation of contextual video assistance for functionality understanding. *Proceedings of CHI 2010*, 1515–1524.

- DOI: https://doi.org/10.1145/1753326.1753552 ; PDF: https://www.tovigrossman.com/papers/chi2010toolclips.pdf (155 citations)
- **Findings (paraphrased from abstract):** ToolClips extend tooltips with on-demand text and short video; in the second study users "successfully completed 7 times as many unfamiliar tasks" compared with a professional online help system.
- **Relevance.** A concrete example of *disclosure of help* rather than of features: assistance is layered (tooltip, then text, then video) at the point of need, consistent with the production bias.

### 5.4 Matejka, J., Li, W., Grossman, T., & Fitzmaurice, G. (2009). CommunityCommands: Command recommendations for software applications. *Proceedings of UIST 2009*, 193–202.

- DOI: https://doi.org/10.1145/1622176.1622214 ; PDF: https://www.tovigrossman.com/papers/uist2009communitycommands.pdf (151 citations); journal version Li et al. (2011), *ACM TOCHI* 18(2), DOI 10.1145/1970378.1970380
- **Finding.** Item-based collaborative filtering over AutoCAD command logs "generates 2.1 times as many good suggestions as existing techniques," and the AAAI 2014 deployment paper reports field results from thousands of users.
- **Relevance.** Addresses the awareness cost of hiding features (Findlater & McGrenere 2010) by recommending the next command from community usage, which is a scalable way to promote users out of a reduced layer.

### 5.5 Lafreniere, B., Grossman, T., & Fitzmaurice, G. (2013). Community enhanced tutorials: Improving tutorials with multiple demonstrations. *Proceedings of CHI 2013*, 1779–1788.

- DOI: https://doi.org/10.1145/2470654.2466235 (101 citations)
- **Content (paraphrased from abstract):** FollowUs embeds a fully featured application inside a web tutorial and captures every user's demonstration of each step, so later learners can pick from a library of community demonstrations filtered by similarity or by tool used.
- **Relevance.** Illustrates task-level scaffolding for creative/professional tools, a complement to feature-level layering.

### 5.6 Lafreniere, B., Bunt, A., & Terry, M. (2014). Task-centric interfaces for feature-rich software. *Proceedings of OzCHI 2014*, 49–58.

- DOI: https://doi.org/10.1145/2686612.2686620 ; PDF: https://www.benlafreniere.ca/assets/papers/Lafreniere_OzCHI_14_-_Task-Centric_Interfaces.pdf
- **Abstract (excerpt, verbatim):** "Feature-rich software can be difficult to learn and use, and current approaches to organizing functionality do little to help users with performing unfamiliar tasks. ... we developed and studied Workflows, a prototype task-centric interface design. Our findings suggest that task-centric interfaces scaffold and guide the user's exploration of a subset of application functionality, and thereby help them to avoid common difficulties and inefficiencies caused by self-directed exploration of the full interface. We also found evidence that task-centric interfaces enable a different kind of application learning, in which users associate tasks with relevant keywords as opposed to low-level commands and procedures."
- **Study.** 16 participants, two sessions separated by a median of 21 days, GIMP-based prototype versus web search; the task-centric condition produced "faster task completion times and reduced cognitive load."
- **Relevance.** Task-centric disclosure (reveal the subset of tools needed for the stated goal) is an alternative to expertise-level layering and maps well to enterprise "guided flows" and command palettes.

### 5.7 Cockburn, A., Gutwin, C., Scarr, J., & Malacria, S. (2014). Supporting novice to expert transitions in user interfaces. *ACM Computing Surveys*, 47(2), Article 31, 1–36.

- DOI: https://doi.org/10.1145/2659796 (148 citations; abstract from ACM record)
- **Abstract (excerpt, paraphrased closely):** interface guidelines encourage high-performance mechanisms for experts, yet "many expert interface components are seldom used and ... there is a tendency for users to persistently fail to adopt faster methods for completing their work." The survey organizes research around four domains: *intramodal* improvement (practice with one method), *intermodal* improvement (switching to a method with a higher ceiling), *vocabulary extension* (learning more of the command set), and *task mapping*. It also introduces a set of design guidelines for promoting transitions.
- **Relevance.** The most complete theoretical account of the "expertise plateau" that progressive disclosure can create. Disclosure design must include intermodal cues (keyboard shortcuts shown in menus, marking-menu style rehearsal) so that novices are pulled toward expert methods rather than parked in the beginner layer.

### 5.8 Liu, Y., & Sra, M. (2025). Designing scaffolded interfaces for enhanced learning and performance in professional software. arXiv:2505.12101.

- URL: https://arxiv.org/abs/2505.12101
- **Abstract (excerpt, verbatim):** "Professional software offers immense power but also presents significant learning challenges. Its complex interfaces, as well as insufficient built-in structured guidance and unfamiliar terminology, often make newcomers struggle with task completion." ScaffoldUI simplifies Blender through "task-relevant tool presentation, progressive complexity disclosure, and domain-concept-based organization."
- **Numbers.** 32 beginners and 8 experts; the scaffolded interface reduced perceived cognitive load, improved task completion and strengthened learning by linking concepts and tools within workflow contexts (quantitative effect sizes are in the preprint, not in the abstract).
- **Relevance.** Recent evidence that explicit "progressive complexity disclosure" remains effective in 2025-era professional tools, and that it pairs naturally with LLM-generated task scaffolds (see also TaskLens, arXiv:2511.23379).

---

## 6. Progressive disclosure in specific domains

### 6.1 Springer, A., & Whittaker, S. (2019). Progressive disclosure: Empirically motivated approaches to designing effective transparency. *Proceedings of IUI 2019*, 107–120. And: Springer, A., & Whittaker, S. (2020). Progressive disclosure: When, why, and how do users want algorithmic transparency information? *ACM Transactions on Interactive Intelligent Systems*, 10(4), Article 29.

- IUI: DOI https://doi.org/10.1145/3301275.3302322 ; arXiv preprint https://arxiv.org/abs/1811.02164 (115 citations). TiiS: DOI https://doi.org/10.1145/3374218 (106 citations; ACM full text blocked, abstract via Semantic Scholar).
- **TiiS abstract (verbatim):** "It is essential that users understand how algorithmic decisions are made, as we increasingly delegate important decisions to intelligent systems. Prior work has often taken a techno-centric approach, focusing on new computational techniques to support transparency. In contrast, this article employs empirical methods to better understand user reactions to transparent systems to motivate user-centric designs for transparent systems. We assess user reactions to transparency feedback in four studies of an emotional analytics system. In Study 1, users anticipated that a transparent system would perform better but unexpectedly retracted this evaluation after experience with the system. Study 2 offers an explanation for this paradox by showing that the benefits of transparency are context dependent. On the one hand, transparency can help users form a model of the underlying algorithm's operation. On the other hand, positive accuracy perceptions may be undermined when transparency reveals algorithmic errors. Study 3 explored real-time reactions to transparency. Results confirmed Study 2, in showing that users are both more likely to consult transparency information and to experience greater system insights when formulating a model of system operation. Study 4 used qualitative methods to explore real-time user reactions to motivate transparency design principles. Results again suggest that users may benefit from initially simplified feedback that hides potential system errors and assists users in building working heuristics about system operation. We use these findings to motivate new progressive disclosure principles for transparency in intelligent systems and discuss theoretical implications."
- **IUI abstract (excerpt, verbatim):** "In Study 1, users anticipated that the more transparent incremental system would perform better, but retracted this evaluation after experience with the system. Qualitative data suggest this may arise because incremental feedback is distracting and undermines simple heuristics users form about system operation."
- **Study design.** Participants wrote at least 100 words about a recent emotional experience; one group received real-time word-level affect feedback as they typed (incremental transparency), the other only global feedback after finishing.
- **Design principles (as stated by the authors).** Transparency should be progressively disclosed: start with simplified, high-level feedback; provide detailed explanations on demand and especially when the user's expectations are violated; because "users are both more likely to consult transparency information ... when formulating a model of system operation," front-load access early and when errors occur, and avoid continuous fine-grained feedback that "is distracting."
- **Relevance.** This is the only body of work that both names and empirically tests "progressive disclosure" as a principle. For B2B AI features (forecasts, anomaly flags, copilots) it prescribes a summary-first explanation with drill-down, and warns that full transparency by default can *lower* perceived accuracy and trust.

### 6.2 Muralidhar, D. (2025). Operationalizing selective transparency using progressive disclosure in artificial intelligence clinical diagnosis systems. *International Journal of Human-Computer Studies* (2025).

- DOI landing page: https://www.sciencedirect.com/science/article/abs/pii/S107158192500148X ; SSRN preprint id 5062641 (both fetches blocked; details from indexed abstract)
- **Content (paraphrased).** Notes that "empirical evidence validating [progressive disclosure's] efficacy is still lacking, especially in the context of text-based generative AI applications." Builds a clinical-diagnosis LLM tool with a Regular Mode using "selective transparency" that surfaces explanations mainly at "conversation breakdowns" (ambiguity or uncertainty) and a Transparent Mode with exhaustive disclosure for auditing users. The user study reports that the stepwise, interactive explanation design helped users follow the AI's reasoning and reduced cognitive overload.
- **Relevance.** Extends Springer & Whittaker to generative AI and to a safety-critical B2B domain; the two-mode design mirrors McGrenere's Personal/Full toggle applied to explanations rather than commands.

### 6.3 Schaub, F., Balebako, R., Durity, A. L., & Cranor, L. F. (2015). A design space for effective privacy notices. *Proceedings of SOUPS 2015*, 1–17.

- PDF: https://www.usenix.org/system/files/conference/soups2015/soups15-paper-schaub.pdf
- **Abstract (excerpt, verbatim):** "Notifying users about a system's data practices is supposed to enable users to make informed privacy decisions. Yet, current notice and choice mechanisms, such as privacy policies, are often ineffective because they are neither usable nor useful, and are therefore ignored by users. ... we map out the design space for privacy notices by identifying relevant dimensions."
- **Key content.** The design space has four dimensions: timing (at setup, just in time, context-dependent, periodic, persistent, on demand), channel, modality and control. Section 3.5, "Layered and Contextualized Notices," argues that "layered notices constitute a set of complementary privacy notices" and that "A multi-layered notice concept combines notices shown at" different times and levels of detail; the Microsoft Kinect is given as an example of multi-layered design. The authors observe that "Timing has been shown to have a significant impact" on notice effectiveness.
- **Relevance.** Provides a validated vocabulary (timing x detail) for disclosing settings, consent and policy in enterprise admin consoles: a short primary notice, a fuller secondary layer, and just-in-time notices at the moment a data practice becomes relevant.

### 6.4 Cockburn, A., Karlson, A., & Bederson, B. B. (2009). A review of overview+detail, zooming, and focus+context interfaces. *ACM Computing Surveys*, 41(1), Article 2.

- DOI: https://doi.org/10.1145/1456650.1456652 (776 citations; abstract page not retrievable, content known from the ACM record)
- **Content (paraphrased).** Surveys the empirical literature on the three main ways of showing detail within context (spatially separated overview+detail, temporally separated zooming, and focus+context distortions) plus cue-based techniques, and concludes that no single approach dominates; the cost of visual/temporal separation must be traded against the cost of distortion.
- **Relevance.** Gives the evidence base for "details-on-demand" patterns (master-detail layouts, expandable rows, drill-downs) that dominate B2B data screens.

### 6.5 Practitioner sources with empirical claims (not peer reviewed)

- **Nielsen, J. (2006). Progressive Disclosure.** https://www.nngroup.com/articles/progressive-disclosure/ Definition: progressive disclosure "defers advanced or rarely used features to a secondary screen, making applications easier to learn and less error-prone." Nielsen lists two benefits (novices focus on the most useful features; experts scan a smaller initial display) and contrasts *staged* disclosure (linear wizard steps), which "is problematic when the steps are interdependent."
- **Wroblewski, L. (2008). Sign Up Forms Must Die (A List Apart) and "gradual engagement."** https://www.lukew.com/ff/entry.asp?1219= Defines gradual engagement as "the process of moving a user through an application or service – actually engaging with it, and seeing it's benefits" before requiring registration; reports that Twitter's redesigned gradual-engagement sign-up "increased conversions by 29%, despite adding an additional screen."
- **Baymard Institute checkout research.** https://baymard.com/blog/checkout-flow-average-form-fields Reports the average checkout has 11.3 form elements against an optimum of 7–8, that 18% of U.S. shoppers abandoned an order because checkout was "too long or complicated," and recommends conditional (progressively disclosed) fields.
- **Relevance.** These supply the vocabulary and conversion metrics product teams use; the academic papers above supply the causal evidence.

### 6.6 Conversational agents

No peer-reviewed study was found that evaluates progressive disclosure of *capabilities* in chatbots under that name; the closest literature concerns self-disclosure by agents (e.g., Proc. ACM HCI 2024, DOI 10.1145/3653691) and the Muralidhar (2025) clinical LLM study, which is the best current evidence for stepwise explanation in dialog systems. This is a gap worth noting.

---

## 7. Surveys, taxonomies and adjacent concepts

- **Complexity-management taxonomy (composite).** Across the sources above, the strategies for managing interface complexity fall into: (1) *reduction* (feature removal; rejected by users in McGrenere & Moore 2000), (2) *layering by expertise* (Carroll 1984; Shneiderman 2003; Leung 2010), (3) *personalization* (adaptable, McGrenere 2002; adaptive, Gajos 2008; ephemeral, Findlater 2009), (4) *task-centric reorganization* (Lafreniere 2014; Liu & Sra 2025), (5) *details-on-demand for data* (Shneiderman 1996; Cockburn 2009), (6) *layered and just-in-time information* (Schaub 2015; Springer & Whittaker 2020), and (7) *scaffolding and gradual engagement* (Wroblewski; ToolClips).
- **Scaffolding in UI.** The term is borrowed from educational psychology (Wood, Bruner & Ross 1976) and appears explicitly in Lafreniere et al. (2014) ("task-centric interfaces scaffold and guide") and Liu & Sra (2025). Scaffolds are meant to fade, which is the property most often missing in enterprise "simple modes."
- **Graceful degradation / progressive enhancement** are web-engineering terms about capability, not expertise, and are not covered by HCI evaluations of disclosure; they are omitted.

---

## 8. Theoretical models

### 8.1 Menu cost models: Hick-Hyman, Fitts, KLM/GOMS

- **Cockburn, A., Gutwin, C., & Greenberg, S. (2007). A predictive model of menu performance. *Proceedings of CHI 2007*, 627–636.** DOI https://doi.org/10.1145/1240624.1240723 ; PDF https://www.csse.canterbury.ac.nz/andrew.cockburn/papers/paper191-cockburn.pdf (287 citations). Abstract (verbatim): "Menus are a primary control in current interfaces, but there has been relatively little theoretical work to model their performance. We propose a model of menu performance that goes beyond previous work by incorporating components for Fitts' Law pointing time, visual search time when novice, Hick-Hyman Law decision time when expert, and for the transition from novice to expert behaviour. The model is able to predict performance for many different menu designs, including adaptive split menus, items with different frequencies and sizes, and multi-level menus. We tested the model by comparing predictions for four menu designs (traditional menus, recency and frequency based split menus, and an adaptive 'morphing' design) with empirical measures. The empirical data matched the predictions extremely well."
- **Landauer, T. K., & Nachbar, D. W. (1985). Selection from alphabetic and numeric menu trees using a touch screen: breadth, depth, and width. *Proceedings of CHI 1985*, 73–78.** DOI https://doi.org/10.1145/317456.317470 (203 citations). Classic depth-versus-breadth result: selection time per level grows only logarithmically with items per level, so broader, shallower hierarchies are usually faster when items are well ordered.
- **Card, Moran & Newell (1983), *The Psychology of Human-Computer Interaction*** (GOMS/KLM) supplies the operator-level accounting these models extend.
- **Relevance.** These models quantify the trade-off at the heart of progressive disclosure: hiding N items removes visual-search and Hick-Hyman decision cost for novices (linear and logarithmic in N respectively) but adds a navigation operator (a click plus pointing time) whenever the hidden item is needed. The model predicts that disclosure pays off only when the hidden items' selection frequency is low, which is exactly the long tail documented by McGrenere & Moore.

### 8.2 Pirolli, P., & Card, S. K. (1999). Information foraging. *Psychological Review*, 106(4), 643–675.

- DOI: https://doi.org/10.1037/0033-295X.106.4.643
- **Core claim (paraphrased from abstract):** people adapt their information-seeking strategies, and the structure of their environment, to maximize the rate of gaining valuable information; "information scent" (proximal cues such as labels and snippets) guides decisions about which "patch" to explore.
- **Relevance.** Each disclosure boundary (an "Advanced" section, a "More" menu, a collapsed row) is a patch boundary; users cross it only if the scent of the label is strong enough. This explains why generic labels such as "Options" or "More" fail and why Springer & Whittaker found users consult explanations chiefly when building a model or encountering surprise.

### 8.3 Hollender, N., Hofmann, C., Deneke, M., & Schmitz, B. (2010). Integrating cognitive load theory and concepts of human–computer interaction. *Computers in Human Behavior*, 26(6), 1278–1288.

- DOI: https://doi.org/10.1016/j.chb.2010.05.031 (328 citations; abstract paywalled)
- **Content (paraphrased from indexed abstract):** reviews how cognitive load theory's intrinsic, extraneous and germane load have been applied in HCI and e-learning, finding that extraneous-load reduction is well adopted whereas "the concept of germane cognitive load has attracted less attention."
- **Relevance.** Progressive disclosure is fundamentally an extraneous-load reduction technique; Hollender et al. remind designers that reducing load is not the same as supporting schema construction (germane load), which is why hidden features must still be discoverable and explained.

### 8.4 Rasmussen, J. (1983). Skills, rules, and knowledge; signals, signs, and symbols, and other distinctions in human performance models. *IEEE Transactions on Systems, Man, and Cybernetics*, SMC-13(3), 257–266.

- DOI: https://doi.org/10.1109/TSMC.1983.6313160 (3,650 citations)
- **Model.** Three levels of behavior: skill-based (automatic sensorimotor), rule-based (stored if-then procedures), knowledge-based (deliberate problem solving), each cued by different information types (signals, signs, symbols).
- **Relevance.** Layers can be aligned to Rasmussen's levels: the beginner layer should present *symbols* (labels, explanations) supporting knowledge-based behavior, while expert layers should optimize for *signals* (spatially stable, terse controls, shortcuts) supporting skill-based behavior. This also explains why spatial reorganization by adaptive menus hurts experts (Findlater 2009).

### 8.5 Dreyfus, S. E., & Dreyfus, H. L. (1980). A five-stage model of the mental activities involved in directed skill acquisition. Operations Research Center, UC Berkeley (report ORC-80-2, for USAF Office of Scientific Research).

- Open copy: https://apps.dtic.mil/sti/tr/pdf/ADA084551.pdf
- **Model.** Novice, advanced beginner, competent, proficient, expert; as skill grows, reliance on context-free rules gives way to situational, intuitive perception.
- **Relevance.** Offers a principled rationale for the *number* and *character* of layers: Shneiderman's eight layers are finer than the Dreyfus stages, and the stages suggest that the transition most worth supporting in B2B products is from advanced beginner to competent, where users begin to choose goals and need visibility of the wider feature set (Findlater & McGrenere's awareness problem).

---

## Synthesis

The academic record on progressive disclosure is older, deeper and more cautionary than the practitioner literature suggests. Three findings are robust across four decades of studies.

First, *hiding beats removing*. Carroll and Carrithers (1984) showed that blocking advanced functions cut novices' error-recovery time (about a quarter of the control group's time) and improved conceptual learning. McGrenere and Moore (2000) showed that Word 97 users touched only about 27% of 265 functions (range 3–45%), yet only 24.5% wanted unused functions removed while 45% wanted them "tucked away," and 51% wanted to keep discovering functions. Kaufman and Weed's CHI 98 workshop captured the same asymmetry: users "like feature growth but hate UI growth." For B2B products the design implication is a small, safe default layer with a visible route to everything else.

Second, *who controls the disclosure matters more than the disclosure itself*. The Toronto/UBC program (McGrenere, Baecker & Booth 2002; Findlater & McGrenere 2004) found that a user-personalized two-interface design beat Microsoft's automatically adapting menus on perceived navigation, learnability, control and satisfaction, with 13 of 20 field participants preferring it and 55% of lab participants preferring adaptable over adaptive (30%) or static (15%). Automatic adaptation succeeded only when accuracy was high: Gajos et al. (2008) found accuracy, not predictability, drove performance and utilization (70.6% to 86.4% utilization when accuracy rose from 50% to 70%), and Findlater et al. (2009) found ephemeral adaptation helped at 79% accuracy without harming at 50%. Seven of twenty users in the 2002 field study did not even realize the adaptive menus were adapting, and most of those were the "feature-shy" users adaptation was meant to help. The lesson for enterprise teams considering AI-driven "smart" disclosure is that it must be visible, spatially stable and demonstrably accurate, or it should be replaced by user-controlled and role-based defaults.

Third, *progressive disclosure has a measurable cost: awareness and expertise plateaus*. Findlater and McGrenere (2010) documented that reduced-functionality interfaces lower awareness of unused features; Carroll and Rosson (1987) explained why productive users stop learning; and Cockburn et al. (2014) catalogued how "many expert interface components are seldom used" because users fail to make intermodal transitions. The menu models of Cockburn, Gutwin and Greenberg (2007) make the trade-off quantitative: disclosure removes search and decision time for the many but adds navigation cost for every hidden item that is actually needed. Countermeasures with evidence behind them include command recommendation (CommunityCommands, 2.1x better suggestions), contextual layered help (ToolClips, 7x more unfamiliar tasks completed), task-centric scaffolds (Lafreniere et al. 2014; Liu & Sra 2025), and explicit expert-path cues in the novice layer.

Domain studies converge on the same shape. Springer and Whittaker (2019, 2020) found that full, incremental transparency in an AI system was expected to help but actually undermined users' heuristics and perceived accuracy, and derived progressive-disclosure principles: simplified feedback first, detail on demand, and richer explanation when expectations are violated. Muralidhar (2025) operationalized this as a two-mode clinical LLM tool. Schaub et al. (2015) formalized layered and just-in-time privacy notices along a timing-by-detail design space. Shneiderman's mantra (1996) and Cockburn, Karlson and Bederson's review (2009) do the same for data.

The theoretical models explain the pattern. Information foraging says users cross a disclosure boundary only when its label carries scent; cognitive load theory says disclosure reduces extraneous load but not germane load; Rasmussen and Dreyfus say novices need symbols and rules while experts need stable signals, so the two layers should differ in kind, not just in size. Gaps remain: there is no controlled study of progressive disclosure of *capabilities* in conversational agents, few longitudinal B2B field studies since 2007, and little work on what should trigger layer promotion (Clark & Matthews 2005 is the only paper found). For complex B2B applications, the evidence supports a layered, user-controlled, role-seeded design with strong scent on every boundary, explicit awareness mechanisms, and an explanation strategy that starts simple and deepens on demand.

---

## Bibliography

Card, S. K., Moran, T. P., & Newell, A. (1983). *The psychology of human-computer interaction*. Lawrence Erlbaum.

Carroll, J. M. (1990). *The Nurnberg Funnel: Designing minimalist instruction for practical computer skill*. MIT Press.

Carroll, J. M., & Carrithers, C. (1984). Training wheels in a user interface. *Communications of the ACM, 27*(8), 800–806. https://doi.org/10.1145/358198.358218

Carroll, J. M., & Rosson, M. B. (1987). Paradox of the active user. In J. M. Carroll (Ed.), *Interfacing thought: Cognitive aspects of human-computer interaction* (pp. 80–111). MIT Press. https://research.cs.vt.edu/ns/cs5724papers/4.mental.mental.carroll.paradox.pdf

Clark, B., & Matthews, J. (2005). Deciding layers: Adaptive composition of layers in a multi-layer user interface. *Proceedings of HCI International 2005*, Vol. 7. https://www.researchgate.net/publication/228573999

Cockburn, A., Gutwin, C., & Greenberg, S. (2007). A predictive model of menu performance. *Proceedings of CHI 2007*, 627–636. https://doi.org/10.1145/1240624.1240723

Cockburn, A., Gutwin, C., Scarr, J., & Malacria, S. (2014). Supporting novice to expert transitions in user interfaces. *ACM Computing Surveys, 47*(2), Article 31. https://doi.org/10.1145/2659796

Cockburn, A., Karlson, A., & Bederson, B. B. (2009). A review of overview+detail, zooming, and focus+context interfaces. *ACM Computing Surveys, 41*(1), Article 2. https://doi.org/10.1145/1456650.1456652

Dreyfus, S. E., & Dreyfus, H. L. (1980). *A five-stage model of the mental activities involved in directed skill acquisition* (Report ORC-80-2). UC Berkeley Operations Research Center. https://apps.dtic.mil/sti/tr/pdf/ADA084551.pdf

Findlater, L., & McGrenere, J. (2004). A comparison of static, adaptive, and adaptable menus. *Proceedings of CHI 2004*, 89–96. https://doi.org/10.1145/985692.985704

Findlater, L., & McGrenere, J. (2010). Beyond performance: Feature awareness in personalized interfaces. *International Journal of Human-Computer Studies, 68*(3), 121–137. https://doi.org/10.1016/j.ijhcs.2009.10.002

Findlater, L., McGrenere, J., & Modjeska, D. (2008). Evaluation of a role-based approach for customizing a complex development environment. *Proceedings of CHI 2008*, 1267–1270. https://doi.org/10.1145/1357054.1357251

Findlater, L., Moffatt, K., McGrenere, J., & Dawson, J. (2009). Ephemeral adaptation: The use of gradual onset to improve menu selection performance. *Proceedings of CHI 2009*, 1655–1664. https://doi.org/10.1145/1518701.1518956

Gajos, K. Z., Everitt, K., Tan, D. S., Czerwinski, M., & Weld, D. S. (2008). Predictability and accuracy in adaptive user interfaces. *Proceedings of CHI 2008*, 1271–1274. https://doi.org/10.1145/1357054.1357252

Gajos, K. Z., Weld, D. S., & Wobbrock, J. O. (2010). Automatically generating personalized user interfaces with Supple. *Artificial Intelligence, 174*(12–13), 910–950. https://doi.org/10.1016/j.artint.2010.05.005

Grossman, T., & Fitzmaurice, G. (2010). ToolClips: An investigation of contextual video assistance for functionality understanding. *Proceedings of CHI 2010*, 1515–1524. https://doi.org/10.1145/1753326.1753552

Grossman, T., Fitzmaurice, G., & Attar, R. (2009). A survey of software learnability: Metrics, methodologies and guidelines. *Proceedings of CHI 2009*, 649–658. https://doi.org/10.1145/1518701.1518803

Hollender, N., Hofmann, C., Deneke, M., & Schmitz, B. (2010). Integrating cognitive load theory and concepts of human–computer interaction. *Computers in Human Behavior, 26*(6), 1278–1288. https://doi.org/10.1016/j.chb.2010.05.031

Kaufman, L., & Weed, B. (1998). Too much of a good thing? Identifying and resolving bloat in the user interface: A CHI 98 workshop. *ACM SIGCHI Bulletin, 30*(4), 46–47. https://doi.org/10.1145/310307.310370

Lafreniere, B., Bunt, A., & Terry, M. (2014). Task-centric interfaces for feature-rich software. *Proceedings of OzCHI 2014*, 49–58. https://doi.org/10.1145/2686612.2686620

Lafreniere, B., Grossman, T., & Fitzmaurice, G. (2013). Community enhanced tutorials: Improving tutorials with multiple demonstrations. *Proceedings of CHI 2013*, 1779–1788. https://doi.org/10.1145/2470654.2466235

Landauer, T. K., & Nachbar, D. W. (1985). Selection from alphabetic and numeric menu trees using a touch screen: Breadth, depth, and width. *Proceedings of CHI 1985*, 73–78. https://doi.org/10.1145/317456.317470

Leung, R., Findlater, L., McGrenere, J., Graf, P., & Yang, J. (2010). Multi-layered interfaces to improve older adults' initial learnability of mobile applications. *ACM Transactions on Accessible Computing, 3*(1), Article 1. https://doi.org/10.1145/1838562.1838563

Li, W., Matejka, J., Grossman, T., Konstan, J. A., & Fitzmaurice, G. (2011). Design and evaluation of a command recommendation system for software applications. *ACM Transactions on Computer-Human Interaction, 18*(2), Article 6. https://doi.org/10.1145/1970378.1970380

Liu, Y., & Sra, M. (2025). Designing scaffolded interfaces for enhanced learning and performance in professional software. *arXiv:2505.12101*. https://arxiv.org/abs/2505.12101

Matejka, J., Li, W., Grossman, T., & Fitzmaurice, G. (2009). CommunityCommands: Command recommendations for software applications. *Proceedings of UIST 2009*, 193–202. https://doi.org/10.1145/1622176.1622214

McGrenere, J., & Moore, G. (2000). Are we all in the same "bloat"? *Proceedings of Graphics Interface 2000*, 187–196. https://www.graphicsinterface.org/wp-content/uploads/gi2000-25.pdf

McGrenere, J., Baecker, R. M., & Booth, K. S. (2002). An evaluation of a multiple interface design solution for bloated software. *Proceedings of CHI 2002*, 164–170. https://doi.org/10.1145/503376.503406

McGrenere, J., Baecker, R. M., & Booth, K. S. (2007). A field evaluation of an adaptable two-interface design for feature-rich software. *ACM Transactions on Computer-Human Interaction, 14*(1), Article 3.

Muralidhar, D. (2025). Operationalizing selective transparency using progressive disclosure in artificial intelligence clinical diagnosis systems. *International Journal of Human-Computer Studies*. https://www.sciencedirect.com/science/article/abs/pii/S107158192500148X

Nielsen, J. (2006, December 3). Progressive disclosure. Nielsen Norman Group. https://www.nngroup.com/articles/progressive-disclosure/

Norman, D. A. (1988). *The psychology of everyday things*. Basic Books.

Pirolli, P., & Card, S. K. (1999). Information foraging. *Psychological Review, 106*(4), 643–675. https://doi.org/10.1037/0033-295X.106.4.643

Rasmussen, J. (1983). Skills, rules, and knowledge; signals, signs, and symbols, and other distinctions in human performance models. *IEEE Transactions on Systems, Man, and Cybernetics, SMC-13*(3), 257–266. https://doi.org/10.1109/TSMC.1983.6313160

Schaub, F., Balebako, R., Durity, A. L., & Cranor, L. F. (2015). A design space for effective privacy notices. *Proceedings of SOUPS 2015*, 1–17. https://www.usenix.org/system/files/conference/soups2015/soups15-paper-schaub.pdf

Shneiderman, B. (1996). The eyes have it: A task by data type taxonomy for information visualizations. *Proceedings of the IEEE Symposium on Visual Languages*, 336–343. https://doi.org/10.1109/VL.1996.545307

Shneiderman, B. (2003). Promoting universal usability with multi-layer interface design. *Proceedings of the 2003 ACM Conference on Universal Usability*, 1–8. https://doi.org/10.1145/957205.957206

Springer, A., & Whittaker, S. (2019). Progressive disclosure: Empirically motivated approaches to designing effective transparency. *Proceedings of IUI 2019*, 107–120. https://doi.org/10.1145/3301275.3302322

Springer, A., & Whittaker, S. (2020). Progressive disclosure: When, why, and how do users want algorithmic transparency information? *ACM Transactions on Interactive Intelligent Systems, 10*(4), Article 29. https://doi.org/10.1145/3374218

Wroblewski, L. (2008). Sign up forms must die. *A List Apart*. https://alistapart.com/article/signupforms/
