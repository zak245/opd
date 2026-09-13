# Expert Voices: Who Said What

*A one-place reference to the people whose thinking defines progressive disclosure, with their core position and the quote to remember. Full context and URLs are in the [sources/](sources/) memos.*

---

## The canon

### Jakob Nielsen (Nielsen Norman Group; UX Tigers)
**Position:** Author of the canonical definition (2006) and its 2026 restatement. PD improves learnability, efficiency and error rate. Two requirements: the right split, and an obvious path between levels. Two levels maximum. Split by frequency of use, not user skill. Never hide decision-critical information.
**Quotes:**
- "Initially, show users only a few of the most important options. Offer a larger set of specialized options upon request." (2006)
- "You must disclose everything that users frequently need up front." (2006)
- "Progressive disclosure splits tasks by frequency, not people by skill." (2026)
- "Your expert is a regular user having a rare moment. He or she lives on the bench 80% of the time and visits the drawer for the occasional exotic task." (2026)
- "Stop at 2." "Each additional level multiplies clicks and halves discoverability." (2026)
- "Bury a daily-use feature and users pay an interaction tax on every visit." (2026, on disclosure debt)
- "Errors you can't reach are errors you can't make." (2026, on training wheels)
- For agents: "disclose by exception ... keep the full activity ledger 1 click away." The "briefing test": can a returning user absorb status, spend and pending decisions in 30 seconds?

### John M. Carroll (IBM Watson; Penn State) with Caroline Carrithers and Mary Beth Rosson
**Position:** Supplied the experimental origin. The "training wheels" word processor (Carroll & Carrithers, 1984) blocked advanced and error-prone functions for novices; they learned faster, scored better on comprehension, and the control group spent almost a quarter of its time recovering from errors the training version had walled off. With Rosson (1987), the "paradox of the active user": people never read the manual and start immediately, so the interface must make the first action safe. Carroll's minimalist instruction (*The Nurnberg Funnel*, 1990) is the pedagogical theory behind it.
**Note:** Secondary sources often misattribute training wheels to Carroll & Rosson. It was Carroll & Carrithers.

### Apple Human Interface Group (1992 Macintosh Human Interface Guidelines)
**Position:** Earliest formal design-guideline definition found. "Using Progressive Disclosure" section; the More Choices / Fewer Choices expanding dialog; "The 80 Percent Solution."
**Quotes:**
- "Progressive disclosure ... allows you to present the most common choices to users while initially hiding more complex choices or additional information."
- "If you find a need to initially 'hide' features, do it in a way that gives people information about where they can find more choices."
- "If you try to design for the 20 percent of your target audience who are power users, your design will not be usable by the majority of your users."

### Alan Cooper (About Face, 1995 onward)
**Position:** Supplied the population model. Most users are "perpetual intermediates"; design for them. "Excise" is work that does not advance the user's goal (each disclosure click is navigational excise). "Commensurate effort": users accept complexity when the payoff justifies it. "Inflect" the interface: most-used functions in the most immediate places.
**Quotes:**
- "Nobody wants to remain a beginner."
- "When people achieve an adequate level of experience and ability, they generally stay there forever."
- "A well-balanced user interface ... doesn't cater to the beginner or to the expert, but rather devotes the bulk of its efforts to satisfying the perpetual intermediate."

### Don Norman
**Position:** The philosophical justification. Complexity is not the enemy; confusion is. PD does not remove complexity (Tesler); it structures it. Nielsen's "obvious path" is a signifier problem in Norman's vocabulary: the "More options" button is the signifier for the hidden affordance.
**Quotes:**
- "Complexity is good. The world is complex and our tools must work in that world, so they must match it."
- "Confusion: This is the enemy."
- "Simplicity should never be the goal. Complex things will require complexity. It is the job of the designer to manage that complexity with skill and grace."
- "If the system lets you make the error, it is badly designed."

### Bruce Tognazzini
**Position:** The counterweight. "Progressive Revelation" is legitimate for flattening the learning curve, but necessary controls must stay visible. Hiding for showroom simplicity increases complexity.
**Quotes:**
- "If the user cannot find it, it does not exist."
- "Any attempt to hide complexity will serve to increase it."
- "Avoid the 'Illusion of Simplicity.'"
- Test for bad hiding: if users must search the web to find a basic control, the simplicity is an illusion.

### Ben Shneiderman
**Position:** Multi-layer interface design (2003): novices start at layer 1 and move up when ready; layer 1 "permits safe exploration and therefore has no error messages." Sceptical of machine-driven adaptation because users want "consistency, predictability, and control." The visual-information-seeking mantra (1996): "Overview first, zoom and filter, then details-on-demand."

### William Lidwell, Kritina Holden, Jill Butler (Universal Principles of Design)
**Position:** The broadest definition: "A strategy for managing information complexity in which only necessary or requested information is displayed at any given time." Spans interfaces, instruction and physical spaces (theme-park queues). Also the "flexibility-usability tradeoff": as flexibility rises, usability falls; a Basic/Advanced toggle moves the tradeoff into the toggle rather than resolving it.

### Steve Krug (Don't Make Me Think)
**Position:** Clicks are free when each is unambiguous; never hide what users want.
**Quotes:**
- "It doesn't matter how many times I have to click, as long as each click is a mindless, unambiguous choice."
- Never hide what users want, like support numbers or pricing.

### Jef Raskin (The Humane Interface)
**Position:** Modes cause errors; the locus of attention is singular. Disclosure must not change the meaning of habitual actions or pull attention off the task.
**Quote:** "Good interface design keeps the locus on the user's task, not on the interface itself."

### Jenifer Tidwell (Designing Interfaces)
**Position:** Named the sub-patterns. **Extras on Demand** (user-initiated hierarchical PD), **Responsive Disclosure** (system reveals the next controls after a step), **Responsive Enabling** (all shown, irrelevant disabled: "the user can't do things that would get him into trouble").

---

## The empiricists

### Jensen Harris (Microsoft Office)
**Position:** Documented both the failure of adaptive menus (Office 2000) and the Ribbon (Office 2007) as its replacement. The Ribbon replaced deep, hidden menus with visible, task-organised, contextual disclosure. Three billion usage sessions informed the split.
**Quotes:**
- "Adaptive Menus were not successful. In my opinion, they actually add complexity to the interface."
- "One person's ideal default 'short' menu was exactly the wrong thing for someone else."
- "Scanning menus took twice as long."
- "We just added more pockets."
- "Virtually all of the features do get used and every feature is someone's favorite."
- "They added new features, but hardly anyone found them."

### Jared Spool (UIE / Center Centre)
**Position:** Users do not go looking. Feature accumulation causes "experience rot." Deferring a step (registration) can be worth $300M.
**Quotes:**
- "Less than 5% of the users we surveyed had changed any settings at all."
- "Every feature that's squeezed in ... has been making your design less competitive."

### Kara Pernice and Raluca Budiu (NN/g)
**Position:** Hidden navigation measurably hurts: used in 27% of desktop cases vs 48–50% visible; task success more than 20 points lower; desktop users at least 39% slower. Budiu also authored NN/g's guidance on interaction cost, information scent, recognition vs recall, Fitts's law, wizards and mobile accordions.

### Joshua Porter and Page Laubheimer
**Position:** The 3-click rule is false. Porter's 44-user, 620-task study found no relationship between click count and success or satisfaction. Laubheimer (NN/g 2019): the rule "has not been supported by data in any published studies." What matters is information scent and confidence at each step. Laubheimer also authored NN/g's heuristic-7 guidance (accelerators "unseen by the novice") and the onboarding finding that push tours fail and pull contextual help works.

### Kate Kaplan (NN/g)
**Position:** Complex-application design. Guideline: "Reduce clutter without reducing capability." Users of complex apps "plateau at mediocre performance," so the disclosure layer must itself teach.

### Joanna McGrenere, Leah Findlater and colleagues (UBC, Toronto)
**Position:** The most sustained academic programme on disclosure in feature-rich software. Word 97 users touched about 27% of functions, yet preferred unused ones "tucked away" (45%) over removed (24.5%). A user-personalised two-interface design beat Word's adaptive menus in a six-week field study (13 of 20 preferred it; 7 of 20 never noticed the adaptive menus adapting). Static split menus beat adaptive on speed; 55% preferred adaptable, 30% adaptive, 15% static. Reduced interfaces lower awareness of unused features. Ephemeral adaptation (fade-in of non-predicted items) beats static menus at high accuracy without harming at low accuracy because it keeps spatial stability.

### Krzysztof Gajos and colleagues (Washington, Microsoft Research)
**Position:** For adaptive interfaces, accuracy matters more than predictability. Utilisation of an adaptive toolbar rose from 70.6% to 86.4% when prediction accuracy rose from 50% to 70%. Below roughly 70%, adaptive promotion is unlikely to beat a well-designed static layer.

### Tovi Grossman, George Fitzmaurice, Ben Lafreniere (Autodesk Research)
**Position:** Learnability of feature-rich software must be measured as *extended* learnability (do users progress?), with issues classified as understanding, locating, awareness and transitioning. Layered contextual help (ToolClips) let users complete seven times as many unfamiliar tasks as online help; community command recommendation addresses the awareness cost of hiding; task-centric interfaces scaffold a subset of tools around the stated goal.

### Andy Cockburn and colleagues (Canterbury)
**Position:** The expertise plateau. "Many expert interface components are seldom used" because users fail to make intermodal transitions to faster methods. Disclosure design must include cues that pull novices toward expert methods. His predictive menu model (2007) quantifies the disclosure trade: hiding removes visual-search and decision time for the many but adds a navigation operator for every hidden item that is needed.

### Aaron Springer and Steve Whittaker (UC Santa Cruz)
**Position:** The only body of work that both names and empirically tests "progressive disclosure" as a principle, in AI transparency. Users expected full, incremental transparency to help and then retracted that judgement after experience: fine-grained feedback was distracting and revealed errors that undermined trust. Their principles: simplified feedback first, detail on demand, richer explanation when expectations are violated.

### Benjamin Scheibehenne, Alexander Chernev and colleagues
**Position:** Choice overload is conditional, not universal. Mean effect near zero across 50 experiments (2010); significant only when moderators are modelled (2015): decision difficulty, set complexity, preference uncertainty, effort-minimising goals. Experts with clear preferences benefit from more options.

### Gerry McGovern (Top Tasks)
**Position:** Organisations produce the most content for the least important tasks. A customer-voted task ranking produces a "long neck" that settles what goes at level 1.
**Quotes:**
- "Tiny tasks are full of organizational ego."
- "The more important the task is to the customer, the less content is being produced for it."

### Matt Ström-Awn (UI Density)
**Position:** Density has several kinds: visual, information, design, temporal, and value ("the value a user gets from the interface divided by the time and space the interface occupies"). PD trades visual density for temporal density, which is why homogeneous expert populations reject it.

---

## The practitioners and product thinkers

### Guillermo Rauch (Vercel / Next.js)
**Position:** "Progressive disclosure of complexity" as a core product principle: start with a single line of code, scale to a global platform; zero-config defaults with escape hatches.

### Apple SwiftUI team (WWDC 2022) and Chris Lattner (Swift)
**Position:** PD as an API principle. "Designing APIs so that the complexity of the call site grows with the complexity of the use case." Four moves: common cases first, intelligent defaults, optimise the call site, "compose, don't enumerate." Lattner: "The complexity in the language needs to be progressively disclosed."

### Karri Saarinen, Jori Lallo, Cristina Cordova (Linear)
**Position:** PD by refusal. "There's one really good way of doing things." Fewer options means less to disclose; what remains is disclosed through the command palette and shortcuts.

### Franck Nijhof / Home Assistant (Open Home Foundation, 2026)
**Position:** Delete "Advanced" and "Expert" labels. "These labels create a psychological barrier: they implicitly tell users that certain features are not for them." Describe functionality, not audience.

### Luke Wroblewski
**Position:** "Gradual engagement": let users do something useful before asking them to sign up; defer setup until it is contextually needed.

### Wes Bush (ProductLed)
**Position:** Straight-line onboarding: for every step, Eliminate, Delay, or Mission-critical. "Delay" is PD applied to setup.

### PLG vendors (Appcues, Pendo, Userpilot, Chameleon)
**Position:** "Progressive onboarding": meter education over sessions by behaviour and segment; measure activation, time-to-value, feature adoption, drop-off. Pendo's data: 6% of features generate 80% of clicks. Note that vendor writing routinely files wizards and signup branching under "progressive disclosure."

### Harry Brignull (Deceptive.Design)
**Position:** The dark side. Hidden costs, drip pricing and "roach motel" cancellation are disclosure inverted into a weapon; now enforced against by the FTC and UK CMA.

### Anthropic (Agent Skills, 2025)
**Position:** "Progressive disclosure is the core design principle that makes Agent Skills flexible and scalable." Metadata always loaded; instructions loaded when triggered; resources loaded as needed. "Like a well-organized manual that starts with a table of contents, then specific chapters, and finally a detailed appendix."

### Google PAIR and Microsoft HAX
**Position:** For AI features, disclose capability *limits* up front (HAX Guideline 1: "Make clear what the system can do"), and disclose reasoning, sources and controls on demand (PAIR: "you can always provide more detail with tooltips and progressive disclosure"; "only introduce new features when needed").
