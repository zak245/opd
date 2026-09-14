# Progressive Disclosure in Complex B2B / Enterprise SaaS: Practice, Practitioners, and Case Studies

Research memo compiled 2026-09-12. All quotes below were fetched from the cited URLs during this session; quotes are verbatim unless marked as paraphrase. Where a fetch failed (403/404) the source is noted as "not fetched" and only the search-result snippet is used.

---

## 0. Working definitions used in this memo

Three things get called "progressive disclosure" (PD) in B2B SaaS practice and they should be kept apart:

1. **PD of features/complexity (interface layering)** — Nielsen's original sense: "Initially, show users only a few of the most important options. Offer a larger set of specialized options upon request." (Nielsen 2006, see 1.2). This is a static property of the UI: primary vs. secondary controls, "More options", contextual panels, command palettes.
2. **Staged disclosure (wizards)** — "presenting features in a linear sequence rather than hierarchical levels" (Nielsen 2006; Budiu 2017). Nielsen 2026 insists these are different patterns: "Stop at 2. (A fixed sequence of steps is a different pattern: staged disclosure, AKA the wizard.)"
3. **Progressive onboarding** — the PLG-vendor sense: disclosing product *education* (tooltips, checklists, "inboarding" nudges) over time and across sessions, driven by behavioral triggers and segments. DockYard's Luke Jones frames the contrast explicitly (see 2.7).

A fourth, transferable use appeared in 2025–2026: **PD as an architecture for AI agents** (Anthropic Agent Skills, see 8.1) where the "user" being spared cognitive load is the model's context window.

---

## 1. Nielsen Norman Group on complex / enterprise applications

### 1.1 Kate Kaplan — "8 Design Guidelines for Complex Applications"
- URL: https://www.nngroup.com/articles/complex-application-design/
- Author/date: Kate Kaplan, November 8, 2020
- Key quotes:
  - Complex apps are "often designed to accommodate a broad range of uses" and end up "very cluttered, on the other" hand.
  - "even users of complex applications tend to plateau at mediocre performance" and the "majority of users do not transition to true expert usage with the systems."
  - Guideline 6 is literally "Reduce clutter without reducing capability." The mechanism she names is "Staged disclosure, where options are shown to the user only when they are relevant to the task at hand," e.g. "displaying advanced parameters or settings only after a related field is checked."
  - Other guidelines: "Promote learning by doing," "Help users adopt more efficient methods," "Provide flexible and fluid pathways," "Ease transition between primary and secondary information," "Make important information visually salient."
- Notes: This is the most direct NN/g statement that PD in complex tools is about *clutter vs. capability*, not about removing capability. The "plateau at mediocre performance" finding is the same phenomenon Cooper calls "perpetual intermediates" (section 6) — the practical implication is that the disclosure layer must itself teach ("learning by doing," "help users adopt more efficient methods"), otherwise level-2 features are never found.

### 1.2 Jakob Nielsen — "Progressive Disclosure"
- URL: https://www.nngroup.com/articles/progressive-disclosure/
- Author/date: Jakob Nielsen, December 3, 2006
- Key quotes:
  - Definition: "Initially, show users only a few of the most important options. Offer a larger set of specialized options upon request."
  - Staged disclosure differs in "presenting features in a linear sequence rather than hierarchical levels," including "features that users access later in the task, even if equally important."
  - Designs exceeding two disclosure levels "typically have poor usability because users become disoriented navigating between levels."
  - Place the advanced-features button in a "clearly visible spot" with labeling that sets "clear expectations for what users will find."
  - Benefits: PD "improves learnability, efficiency, and error rates by helping novice users prioritize attention while allowing experienced users to avoid scanning unnecessary features." (paraphrase of the article's benefits section)
- Notes: The two constraints that matter most in enterprise tools are (a) the two-level limit and (b) that the split must be by *frequency of use*, not by imagined user skill. Enterprise products violate (a) constantly (Settings > Advanced > More > Developer).

### 1.3 Jakob Nielsen — "Progressive Disclosure: From Training Wheels to Week-Long AI Agents" (UX Tigers)
- URL: https://www.uxtigers.com/post/progressive-disclosure
- Author/date: Jakob Nielsen, July 9, 2026
- Key quotes:
  - On the 1984 IBM "training wheels" study (Carroll & Carrithers): "beginners on the training-wheels system learned the basic letter-typing task faster," and the control group "burned almost 1/4 of its time recovering from exactly the error states" that were blocked. Aphorism: "Errors you can't reach are errors you can't make."
  - "Stop at 2. (A fixed sequence of steps is a different pattern: staged disclosure, AKA the wizard.)"
  - Roughly "80% of tasks land on level 1, 20% on level 2" — a split "by frequency of use rather than user skill levels," explicitly invoking "perpetual intermediates."
  - AI answers: "Verdict first, in 1 short paragraph; reasoning, sources, and detail behind disclosure controls. Label partial or preliminary output as exactly that."
  - Long-running agents: "Make long-running agents disclose by exception. Interrupt only for decision-critical events, digest the milestones, report progress as conceptual breadcrumbs, and keep the full activity ledger 1 click away."
  - The "briefing test": "can a returning user absorb the status, the spend, and the pending decisions in 30 seconds?"
- Notes: This is Nielsen's own 2026 update, and it explicitly re-bases PD on frequency, not persona. It also gives the cleanest bridge from classic PD to agent UX (section 8).

### 1.4 Page Laubheimer — "Flexibility and Efficiency of Use" (Heuristic 7)
- URL: https://www.nngroup.com/articles/flexibility-efficiency-heuristic/
- Author/date: Page Laubheimer, November 22, 2020
- Key quotes:
  - "Accelerators are secondary ways of accomplishing the same task that function as faster (but typically less obvious) methods."
  - "The trick for designing a usable accelerator is making it discoverable but unobtrusive."
  - "Shortcuts—unseen by the novice user—speed up the interaction for the expert users."
  - "A novice user doesn't have to pay attention to the keyboard shortcut at all, but repeated exposure to it supports learning."
  - "Our systems should be flexible enough to allow users to complete a given task using a variety of methods."
- Notes: Accelerators are the *expert-side* half of PD: the novice path stays visible, the expert path is disclosed by repeated exposure (menus showing shortcut hints). This is exactly the Superhuman/Linear command-palette mechanism (section 3).

### 1.5 Amy Schade — "Customization vs. Personalization"
- URL: https://www.nngroup.com/articles/customization-personalization/
- Author/date: Amy Schade, July 10, 2016
- Key quotes:
  - "Personalization is done by the system being used." "Customization is done by the user."
  - "Customization imposes higher interaction cost: users must take the time to configure the site in a way that is optimal for them."
  - "Personalization and customization both have the ability to enhance a user's experience on a site, but they should not be used as a fix for a broken site."
- Notes: Relevant to role-based disclosure (section 6): permission-driven UI is *personalization* (system decides what to disclose based on role), whereas "customize your dashboard/nav" is customization, which enterprises love to ship instead of making good defaults. Schade's warning ("not a fix for a broken site") is the standard critique of "let the admin configure it."

### 1.6 Raluca Budiu — "Wizards: Definition and Design Recommendations"
- URL: https://www.nngroup.com/articles/wizards/
- Author/date: Raluca Budiu, June 25, 2017
- Key quotes:
  - "Because wizards split a complex process into multiple steps, often wizard pages are simpler — they contain fewer fields and overall less information."
  - "Use wizards for situations where the users are likely to be unfamiliar with the process — either because they don't have a lot of domain expertise or because they go through that process only rarely."
  - "Wizards can quickly become annoying and overly controlling if they have to be used over and over again or if users have a lot of knowledge of the domain and their mental model of the process is different than the mental model implemented by the app designer."
- Notes: In enterprise SaaS the wizard is the go-to for rare, high-stakes setup (SSO, billing, data-source connection) and a liability for daily tasks. Jira's next-gen project creation and Salesforce Setup flows are wizards; the daily issue-edit surface must not be.

### 1.7 Page Laubheimer — "Onboarding Tutorials vs. Contextual Help"
- URL: https://www.nngroup.com/articles/onboarding-tutorials/
- Author/date: Page Laubheimer, February 12, 2023
- Key quotes:
  - "Tutorials interrupt users, don't necessarily improve task performance, and are quickly forgotten."
  - "Users want to start using the product right away. They don't want to spend time studying how to use your app."
  - "Use progressive disclosure in the help content. Make the existence of the contextual help visible, but do not overwhelm the user with detail until they ask for it."
  - "Push revelations are well-named: they are typically pushy, devoid of context, and intrusive." "Pull revelations are help content triggered by some signal that the user would benefit from that information at that moment."
  - "This requires user research and task analysis to figure out how users actually interact with your product and what sorts of signals indicate that a user is in need of help."
- Notes: This is NN/g's position on *progressive onboarding* specifically: front-loaded tours fail; signal-triggered contextual help is the PD-compatible alternative. Vendors (section 2) cite this piece constantly.

### 1.8 Page Laubheimer — "Dashboards: Making Charts and Graphs Easier to Understand"
- URL: https://www.nngroup.com/articles/dashboards-preattentive/
- Author/date: Page Laubheimer, June 18, 2017
- Key quotes:
  - "Dashboards are collections of data visualizations, presented in a single-page view that imparts at-a-glance information on which users can act quickly."
  - "Their goal is not to facilitate exploration; instead, they provide information that can be consumed fast, with a minimum of interaction or cognitive processing."
- Notes: The article does not explicitly discuss drill-down as PD, but the "at-a-glance, then act" framing implies an overview-first layer with detail behind interaction — the dashboard is level 1, the report/query builder is level 2.

### 1.9 Not fetched
NN/g pages guessed at `/articles/enterprise-software-design/` and `/articles/expert-users/` returned 404. The "Contextual help" and "Accelerators" content is covered by 1.4 and 1.7.

---

## 2. Product-led growth / onboarding vendors

### 2.1 Userpilot — "Progressive Disclosure in SaaS" and "13 Progressive Disclosure Examples"
- URLs: https://userpilot.com/blog/progressive-disclosure/ ; https://userpilot.com/blog/progressive-disclosure-examples/
- Author/date: Kevin O'Sullivan, Head of Product Design, Userpilot; last updated August 10, 2026
- Key quotes:
  - "Progressive disclosure gradually exposes users to information over multiple screens."
  - "A 2026 study by Ariful Islam Anik and Andrea Bunt found that progressive disclosure enhanced perceived learning."
  - PD "prevents the overwhelm that drives early churn."
  - Asana: "A classic example of a signup flow that doubles as effective progressive disclosure, tailoring what users see in their first session by collecting role and goal information upfront."
  - Loom: "When you want to configure your video, Loom only exposes key settings (e.g., thumbnail and noise) by default."
  - ConvertKit: "Does this well in its signup flow by first asking where the user is joining from."
  - Userpilot's own builder: "Uses a secondary screen when you set up a checklist, allowing users to reveal screens by selecting different buttons, making configuration feel manageable rather than overwhelming."
- Metrics recommended: activation milestones, feature adoption rate, time-to-value, cohort retention, funnel drop-off, "goal completion dashboards (micro and macro goals)"; A/B tests and "friction logs."
- Notes: Note the conflation: Userpilot files persona-based signup branching, wizards, checklists, and Loom's "more settings" all under "progressive disclosure." Only the Loom example is PD-of-complexity in Nielsen's sense; the rest are progressive onboarding.

### 2.2 Appcues — "Onboarding UX: 10 patterns, best practices, and real examples"
- URL: https://www.appcues.com/blog/user-onboarding-ui-ux-patterns
- Author/date: Katryna Balboni, June 9, 2026
- Key quotes:
  - PD is "showing users only what they need at each stage, rather than everything at once."
  - Persona-based onboarding: "designing new users' onboarding experiences based on their role or desired outcome"; keep to 2–5 user paths.
  - "40-60% of users who sign up for a SaaS product will use it once and never return."
- Metrics: Activation rate ("percentage of users who complete the key value action"), time to first key action, checklist completion rate, drop-off point.
- Products cited: Slack, Typeform, Airtable, Mailchimp, Asana, Google Sheets.
- Notes: Appcues explicitly connects persona-based onboarding to PD "by showing users only what is relevant to their role or goal" — i.e., role is used as the disclosure key (see section 6).

### 2.3 Pendo — "Onboarding, Progressive Disclosure, Memory and Your Brain"
- URL: https://www.pendo.io/pendo-blog/onboarding-progressive-disclosure/
- Author/date: John Cutler, April 7, 2016
- Key quotes:
  - "Progressive disclosure defers advanced or rarely used features to a secondary screen, making applications easier to learn and less error-prone."
  - Humans retain "7 +/- 2 things at once, for up to 30 seconds"; "visual recall is much stronger"; users read about 20% of content.
  - Tips (paraphrase): analyze early usage patterns among retained users to identify core features; segment by "customer size, tenure, and role"; "introduce terminology progressively"; measure abandonment points.
- Notes: Pendo's white paper "Build an Onboarding Engine" (search snippet, not fetched) adds: "The key to a progressive disclosure approach to the onboarding experience is a clear understanding of what defines a minimum level of proficiency in the application," and describes showing "only … features related to that activity when a user first enters the application" (e.g., adding a vendor). That is the enterprise-specific move: disclosure keyed to a *job*, not a screen.

### 2.4 Pendo — "3 Tactics for Your Progressive Onboarding Plan"
- URL: https://www.pendo.io/pendo-blog/3-tactics-progressive-onboarding-plan/
- Author/date: Hillá Meller, April 16, 2017
- Key quotes:
  - "A tooltip is a good option. It's non-intrusive and the user can decide to either follow the tooltip's advice or ignore it."
  - "consider highlighting different features to users based on their demographics or how they got to your app."
  - "measuring how it affects usage is what you really should be measuring."
- Notes: Pure progressive onboarding (education over time); nothing about layering the UI itself.

### 2.5 Chameleon — "How to Reduce Time to Value in Onboarding in SaaS"
- URL: https://www.chameleon.io/blog/reduce-time-to-value-onboarding
- Author/date: Kirsty McConnell (date not shown)
- Key quotes:
  - "Time to value (TTV) is not just another SaaS acronym. It is the north star of great onboarding."
  - "Companies that cut their TTV in half often see a 25 percent higher retention rate." (unsourced vendor claim)
  - "Reveal complexity only when users are ready." "Do not show off everything on day one. Guide users through a clear, minimal 'first success' path."
  - "Focus on leading indicators such as activation and completion."
- Notes: Chameleon's other posts cite NN/g directly: "NN/G's research on progressive disclosure found that front-loaded onboarding tutorials did not improve task performance. Users want to do the thing, not be briefed about the thing" (search snippet).

### 2.6 ProductLed / Wes Bush — "Bowling Alley Framework"
- URL: https://productled.com/blog/user-onboarding-framework
- Author/date: Wes Bush, December 21, 2021
- Key quotes:
  - "Where great companies make the difference is in time-to-value – how long it takes a new user to experience value."
  - "Creating a Straight-Line Onboarding experience means boiling your onboarding process down to the absolute minimum number of required steps."
  - Three questions: Eliminate ("Think of all the form fields and confirmation emails in the world that we could just do away with"), Delay (add extras contextually later), Mission-Critical.
  - Product Bumpers: tours, checklists, empty states, tooltips. Conversational Bumpers: email/SMS triggered by behavioral signals.
- Notes: "Delay" is PD applied to *setup* rather than to the UI: defer non-critical configuration until it is contextually needed. This is the PLG answer to enterprise "configure everything before you start" onboarding.

### 2.7 DockYard — "Divebomb or the Dipping Toe: Onboarding vs. Progressive Disclosure"
- URL: https://dockyard.com/blog/2019/12/23/divebomb-or-the-dipping-toe-onboarding-vs-progressive-disclosure
- Author/date: Luke Jones, Product Designer, December 23, 2019
- Key quotes / findings:
  - Onboarding as commonly practiced: "a window pops up asking you to take a tour of the product" with "flashing orbs, glowing rectangles, big arrows."
  - PD alternative: reveal help "at the time when it was most appropriate" — in the case study, a multi-select hint appeared only after users repeated the single-item action several times.
  - Result (paraphrase): all participants in the PD group retained and used multi-select; the upfront-tour group ignored the instructions.
- Notes: Small-n practitioner study, but it is the clearest articulation of the *difference* between progressive onboarding (tour) and PD (behaviorally-triggered reveal of a hidden capability).

### 2.8 WalkMe / Whatfix / UserGuiding / Intercom / Reforge / Lenny / Growth.Design
- WalkMe glossary URL 404'd; Chameleon's "progressive-onboarding" URL 404'd. Searches for Reforge and Lenny's Newsletter returned no dedicated PD article; Growth.Design case studies were not surfaced by search. Third-party summaries (search snippets) of Slack's PLG say "Slack did not have a separate 'onboarding experience' - the product itself was the onboarding, with Slackbot, default channels, and progressive disclosure all part of the core product," and that "advanced capabilities like workflow builder, shared channels, and custom integrations [were] introduced gradually as users became more sophisticated." Treat as secondary.

---

## 3. Case studies — how specific complex B2B products layer complexity

### 3.1 Microsoft Office Ribbon (2007) — the canonical "menus were hiding 1,500 commands" story
- URL: https://learn.microsoft.com/archive/blogs/jensenh/the-story-of-the-ribbon (Jensen Harris, March 12, 2008; links to MIX08 video and slides)
- Verbatim from the post: "I talked a bit about the general design process we used to come up with the Office 2007 user interface, to iterate on it, and to evaluate it. As part of the discussion, I showed for the first time some of the early prototypes we worked on (and abandoned or refined) along the way." He points readers to "parts 2, 3, and 4 of the Why the UI? series" for the Word 1.0→2003 screenshots showing toolbar/menu growth.
- Comment thread (verbatim, illustrative of the perpetual-intermediate backlash): "After working with excel for more than 10 years you learn how to do things. And with the new UI I would have to spend at least 1-2 months to have the same productivity. And all the customizations - gone... Its not worth it, rolling back to 2003." And: "the difference from 03 to 07 is overwhelming at first but I would and will never go back."
- Notes: The Ribbon replaced nested menus (deep PD, >2 levels) with a results-oriented, *contextual* disclosure model: contextual tabs appear when an object is selected, galleries show results instead of dialogs, and the Quick Access Toolbar preserves user accelerators. Microsoft's own Win32 guidance (3.13) codifies "Showing contextual detail only in context" as a PD technique without explicit PD controls. The comment thread is a live specimen of the migration cost of changing a disclosure model for an installed base of intermediates.

### 3.2 Salesforce — Setup vs. Lightning App Builder; PD as a *performance* pattern
- URL: https://trailhead.salesforce.com/content/learn/modules/best-practices-in-lightning-web-components/use-progressive-disclosure-and-conditional-rendering (Salesforce Trailhead module)
- Verbatim:
  - "Progressive disclosure is an interaction design technique often used in human computer interaction to help maintain the focus of a user's attention by reducing clutter, confusion, and cognitive workload."
  - "Lazy instantiation (or lazy loading) means an object or component isn't created until first being used." "Conditional rendering means an object or component will only appear once a state or behavior is matched."
  - "Standard tabs components, which allow information to be hidden and only loaded when the user selects that tab." "Lightning Component Actions or Quick Actions, which allow components to be loaded only when the user clicks on a button."
  - Rationale: "Lightning components added to a page layout are instantiated when the page is loaded, contributing to the overall loading time of the page."
- Notes: Salesforce is unusual in framing PD for *admins building pages* (App Builder) as both a UX and a page-load-performance technique: tabs, quick actions and conditional visibility rules are the disclosure primitives an admin composes. The complexity burden is pushed to the admin persona (Setup is the "advanced mode" for the whole org), which is the multi-tenant, role-based pattern discussed in section 6.

### 3.3 Atlassian Jira — classic/company-managed vs. next-gen/team-managed
- URL: https://community.atlassian.com/t5/Team-managed-projects-articles/Everything-you-want-to-know-about-next-gen-projects-in-Jira/ba-p/894773 (Rayen Magpantay, Atlassian Team, September 18, 2018)
- Verbatim: In classic projects "the burden of configuration falls entirely on Jira admins, making it a complex and time-consuming process." "Any team member with the project's admin role will can modify the settings of their next-gen projects."
- Simplifications (paraphrase): schemes removed; project settings self-contained; drag-and-drop field/issue-type editing; workflow via board columns. Trade-offs: configuration "cannot be shared across projects (yet)"; fewer customization options.
- Third-party summaries (Stiltsoft, ALDEVA, Praecipio — search snippets): "Team-managed projects are faster to set-up than classic projects, allowing you to quickly toggle on features like sprints or reports"; "Classic projects are generally considered to be more mature and complex than next-gen projects, but along with this increased complexity comes far more options." Renamed in March 2021 to team-managed / company-managed. In Oct 2024 Atlassian announced merging Jira Software and Jira Work Management into one Jira (TechCrunch snippet).
- Notes: Jira is the clearest example of PD done at the *product-line* level rather than the screen level: a whole simplified variant ("next-gen") with feature toggles ("turn on sprints") was created because the flagship's admin surface could not be progressively disclosed in place. The 2021 rename dropped "next-gen/classic" (an audience label) for "team-managed/company-managed" (a functional label) — the same principle Home Assistant argues for in 5.2. Consistent with the createbytes review snippet: admin settings "remains the most complex area of Jira."

### 3.4 Linear — opinionated defaults + command palette + density
- URL: https://www.figma.com/blog/the-linear-method-opinionated-software/ (Alia Fite, Figma, May 29, 2024, interviewing Linear's Jori Lallo and Cristina Cordova)
- Verbatim:
  - "We design it so that there's one really good way of doing things" — Jori Lallo.
  - "Flexible software lets everyone invent their own workflows, which eventually creates chaos as teams scale" — Lallo.
  - "No one wants to waste time nitpicking the nuances of a process. We try to reduce the amount of fiddling around with processes and get you into building things" — Lallo.
  - "Shortcuts might be perceived as lower quality, but our version of that is more about decreasing scope" — Cristina Cordova; Linear "intentionally narrow[s] feature scope in less critical areas like settings."
  - "I would hate Linear to be in a position where we can never take something away or change certain things" — Lallo.
- Karri Saarinen (search snippets from First Round / Lenny's / Sequoia): "you should design something for someone" because "it's really hard to design something really good for everyone"; Linear likes to "provide this good default or good opinions" so users "as a team don't have to think about it."
- Third-party (search snippets): Linear "deliberately uses higher data density than most project management tools — showing more tasks per screen with less whitespace — because their core users are engineers who want to see their entire sprint at a glance"; ⌘K "opens a unified surface for navigation, action invocation, and search."
- Notes: Linear's approach to PD is mostly *refusal*: fewer options (no configurable workflow schemes), so there is less to disclose. What is disclosed (bulk actions, filters, keyboard shortcuts) sits behind the palette and shortcuts — accelerators in Laubheimer's sense. The Codexical piece (5.4) counts Linear among products where PD survived because the product "optimize[s] for task completion." Note: no Ryo Lu-authored piece on density surfaced in search; density claims about Linear are third-party.

### 3.5 Superhuman — command palette as a shortcut-teaching machine
- URL: https://blakecrosley.com/guides/design/superhuman (Blake Crosley, 2026)
- Verbatim: "Every time you use Cmd+K to find a command, you see its shortcut. After a few uses, muscle memory takes over and you stop using the palette for that action." "Onboarding is practice, not explanation." Results cited: shortcut usage +20%, feature adoption +67%, week-1 activation +17%. **Unsourced.** *(Corrected 14 Sep 2026: see sweep 13.)* The guide gives no study, sample or method for any of the three, and a check of Superhuman's own 2026 blog found every comparable figure it publishes ("4+ hours weekly", "cut processing time by 50-70%", "saves 20-40 minutes daily") also carries no source, one of them while being described as "documented". Do not repeat these as evidence. The defensible claim about keyboard-first products is that experienced practitioners choose them — preference, not measurement. The one measured result on shortcut teaching is KeyMap (CHI 2020): a spatial keyboard map held median 10 shortcuts at 24 hours against 5.5 for the previous best method, so a palette's inline list hint is the floor, not the ceiling.
- Superhuman help center (search snippet): "As you type the action you want, watch the letter that appears on the right — that's the shortcut. Learn it once, and next time you can hit it straight from the inbox."
- Iterators (snippet): Superhuman "reserved only the top 5% of tips (like keyboard shortcut mastery) for modal 'pauses'."
- Notes: This is Laubheimer's accelerator principle ("repeated exposure … supports learning") operationalized: the palette is level 1 (discoverable, searchable), the shortcut is level 2 (invisible, fast), and the palette itself is the disclosure control that graduates users. It is the one B2B pattern where PD is designed to make users *leave* the disclosed layer.

### 3.6 Notion — slash commands, "..." menus, and the AI page
- Sources: search snippets (blakecrosley.com/guides/design/notion; Notion help "Using slash commands"); Franklina Amoah's Medium piece "How Notion uses Progressive Disclosure on the Notion AI Page" returned 403 (not fetched).
- Snippet (Crosley): "Notion's slash command menu is progressive disclosure by design: type / to surface the command list, narrow it by typing more characters, and the feature set reveals itself proportionally to your specificity." "Slash commands reveal power features only when invoked; beginners see simplicity, experts find depth." Database view: "advanced options like layouts, filters, and sorting are hidden behind menus."
- Notes: Notion's slash menu is a *typed* disclosure control: the empty line is level 1, "/" opens level 2, and typing filters it. The cost is discoverability (Microsoft's "Users may assume that if they can't see something, it doesn't exist," 3.13), which Notion mitigates with the placeholder hint "Type '/' for commands." Nielsen's 2-level rule holds only because the menu is flat and searchable.

### 3.7 Figma — contextual property panel
- Sources: search snippets only (Lollypop guide describes a fictional HRMS, not Figma; Victor Onyedikachi's Medium piece not fetched). Snippet: "Figma's Properties panel is cited as an example of progressive disclosure, where it collapses advanced options." Figma help center documents that the right sidebar shows "layer properties" for the current selection.
- Notes: Figma's panel is PD by *selection context*: the panel content changes with the selected object type (the Ribbon's contextual-tab idea), and within sections, rarely-used properties (individual corner radii, blend modes, constraints) are behind expanders. Combined with right-click menus and ⌘/ quick actions, Figma exhibits three disclosure channels at once (contextual panel, contextual menu, command palette) — evidence that in complex creative tools "two levels" is enforced per-channel, not globally.

### 3.8 Stripe Dashboard — separating the developer surface
- URL: https://stripe.com/blog/developer-dashboard (Romain Huet, March 20, 2018)
- Verbatim: Stripe "added a new Developers section to the Dashboard that helps you build and manage your Stripe integration for improved efficiency" — "monitor API and webhook usage in real time, manage API upgrades, and access all our developer tools in one place."
- Notes: The pattern is *persona-scoped disclosure*: operational users (finance, support) see payments/customers; developers open a distinct Developers area (keys, webhooks, API versions, logs). Stripe's API-side PD (sensible defaults, optional parameters, "expand" for nested objects) is widely praised (illustration.app snippet: Stripe "reveals information gradually rather than overwhelming users with all fields at once"), but no first-party Stripe text using the phrase "progressive disclosure" was found.

### 3.9 Grafana — Builder vs. Code mode in the query editor
- URL: https://grafana.com/docs/grafana/latest/datasources/prometheus/query-editor/ (Grafana docs)
- Verbatim: Builder mode — "Visual interface for constructing queries without writing PromQL directly." Code mode — "Text editor with autocomplete for writing PromQL directly." "Grafana synchronizes both modes, allowing you to switch between them. Grafana also displays a warning message if it detects an issue with the query while switching modes." Builder has an "Explain" toggle that will "display a step-by-step explanation of all query components and operations." Query options (Legend, Min step, Format, Type, Exemplars) sit in a collapsible section in both modes, with defaults (Type "Both", Format "Time series", Legend "Auto").
- Notes: This is the best-documented "basic vs. advanced mode" in enterprise tooling, and it avoids the classic failure mode (5.x) in three ways: (1) both modes edit the *same* underlying artifact and are synchronized, so switching is not a one-way door; (2) the beginner mode includes an "Explain" affordance that teaches the expert representation; (3) the rarely-changed options are a separate collapsed level, not part of the mode. The same pattern is implemented for Loki, MySQL, PostgreSQL, MSSQL data sources.

### 3.10 Zapier — Advanced settings on a Zap
- Sources: Zapier help center and community (search snippets). "Advanced settings allows you to configure advanced settings like autoreplay override and polling interval." "By default, Zapier will automatically turn off any Zaps that encounter a high number of errors. You can select 'keep running if errors occur'…" Polling interval "is also hidden for a small number of triggers that manage their own checking schedule." Third-party (Automation Ace): "settings and features that most users never open."
- Notes: Textbook Nielsen level-2: a labelled "Advanced settings" section with safe defaults, and — matching Microsoft's guideline to "Remove (don't disable) progressive disclosure controls that don't apply in the current context" — the polling option is hidden entirely for instant triggers.

### 3.11 Shopify admin / Polaris
- Source: Polaris fundamentals (redirected to shopify.dev; search snippets used). "Progressive disclosure is recommended as a way to break multi-part tasks down into digestible steps." Polaris IA guidance: show "content that summarizes benefits at a high level, with merchants having the option to access more detailed information through links." Polaris "patterns codify multi-component interactions such as progressive disclosure."
- Notes: Shopify treats PD as a *system-level pattern* documented for third-party app developers — an enterprise-platform move (like Salesforce) where PD rules are exported to an ecosystem.

### 3.12 GitHub — Primer's PD pattern
- URL: https://primer.style/product/ui-patterns/progressive-disclosure/
- Verbatim: "Progressive disclosures are a design pattern that hides and shows information based on user interaction. They should be used sparingly, only when it's necessary to truncate information." "refrain from creating interactions that drastically disorient the user's initial point of focus." "Pair progressive disclosure icons with descriptive text to provide context." Chevron: "Do not use this icon to trigger dropdown menus or navigation; the caret icon is the more suitable for this." Ellipsis "is different from the kebab icon, which is used for dropdown menus."
- Notes: GitHub's design system is notably restrictive ("sparingly"), and it separates *disclosure* (chevron/fold/ellipsis) from *menus* (caret/kebab) at the icon level — the distinction between "show more of this" and "show other actions" that PR pages and settings pages rely on.

### 3.13 Microsoft Windows UX Guide — "Progressive Disclosure Controls"
- URL: https://learn.microsoft.com/en-us/windows/win32/uxguide/ctrl-progressive-disclosure-controls (Windows 7-era guidance, updated 2020-10-20)
- Verbatim:
  - "Progressive disclosure promotes simplicity by focusing on the essential, yet revealing additional detail as needed."
  - Decision test: "Do users need to see the information in some but not all scenarios, or some but not all of the time?" and "Is the additional information advanced, substantial, complex, or related to an independent subtask? If so, consider displaying the information in a separate window."
  - Non-control PD: "Showing contextual detail only in context." "Reducing the weight of affordances for secondary UI." "Showing follow-up steps only after prerequisites are done."
  - Risks: "Lack of discoverability. Users may assume that if they can't see something, it doesn't exist." "Lack of stability. … If controls unexpectedly appear and disappear, the resulting UI can feel unstable."
  - "If a user expands or collapses an item, make the state persist so it takes effect the next time the window is displayed."
  - "Remove (don't disable) progressive disclosure controls that don't apply in the current context. Progressive disclosure controls should always deliver on their promise."
  - Labels: "More/Fewer options," "Show/Hide details," etc.
- Notes: Still the most operational PD spec in existence; most enterprise design systems (Polaris, Primer, SLDS) are derivatives.

### 3.14 AWS Console vs. Vercel
- Sources: search snippets only (Medium/Kuberns/Business Compass). "AWS is described as 'infinitely complex' with over 200 services"; Graphite's team "spending approximately nine hours configuring AWS infrastructure for their Next.js application compared to minutes on Vercel"; "Vercel's simplicity is a fixed property … while AWS's complexity is front-loaded during initial setup but decreases as you build infrastructure-as-code templates."
- Notes: No source analyzes the AWS console through a PD lens; the comparison is used in the developer-tools discourse (section 4) as the negative example of complexity that is not progressively disclosed — everything is level 1.

### 3.15 Bloomberg Terminal (density, not disclosure)
- URL: https://uxmag.com/articles/the-impossible-bloomberg-makeover (Dominique Leca, March 24, 2010)
- Verbatim: "The pain inflicted by blatant UI flaws such as black background color and yellow and orange text is strangely transformed into the rewarding experience of feeling and looking like a hard-core professional." "We have to be religiously consistent." "The more painful the UI is, the most satisfied these users are." Leca calls it a "lock-in effect reinforced by the powerful conservative tendencies of the financial ecosystem and its permanent need to fake complexity."
- Notes: See section 7 — Bloomberg is the standard counterexample to PD: an expert tool that discloses *nothing* progressively and is loved for it.

### 3.16 Products with no first-party PD analysis found
HubSpot, Slack admin, Datadog, Airtable interface designer, Webflow, Google Workspace admin, Segment, Amplitude/Mixpanel, Retool: searches returned only generic listicles. Orbix (snippet) claims "Mixpanel uses progressive disclosure as a dashboard design pattern." Treat as unverified.

---

## 4. "Progressive disclosure of complexity" in developer tools and language/API design

### 4.1 Guillermo Rauch / Vercel / Next.js
- URL: https://refactoring.fm/p/the-vercel-journey-with-guillermo (Luca Rossi interviewing Guillermo Rauch, May 16, 2025; full interview paywalled)
- Publicly visible: the article names "progressive disclosure of complexity" as Rauch's core design principle for Vercel — Next.js is accessible to beginners "starting with minimal code" while "remaining powerful enough for enterprise-level websites."
- Search snippets (Medium, ConTejas, DEVCLASS): "'Progressive disclosure of complexity' is one of Vercel's core design principles"; "simple enough for a beginner to use in minutes, but powerful enough to scale to some of the internet's most sophisticated applications"; "allowing you to start with a single line of code and end up powering a global platform"; reiterated in the Next.js Conf 2024 keynote on "reducing the initial complexity that developers face and eliminating unnecessary configuration."
- Notes: In DX the phrase means: zero-config default that works, with escape hatches (next.config, middleware, custom server) reached only when needed. It is the same 80/20 frequency split Nielsen describes, applied to configuration surface area.

### 4.2 Apple / SwiftUI — "The craft of SwiftUI API design: Progressive disclosure" (WWDC22)
- URL: https://developer.apple.com/videos/play/wwdc2022/10059/
- Verbatim (transcript):
  - "Progressive disclosure, then, is designing APIs so that the complexity of the call site grows with the complexity of the use case."
  - "An ideal API is both simple and approachable but also be able to accommodate powerful use cases."
  - "First, it minimizes the time to the the first build and run … It also lowers the learning curve of your code, preventing APIs from getting bogged down by concepts that aren't relevant in all use cases. Finally, it creates a tight feedback loop."
  - "We start by considering common use cases... We also strive to provide intelligent defaults, so those common cases can specify only what they need to. Next, we aim to optimize the call site, ensuring every character of your call site has a purpose. And finally, we design our APIs so they compose pieces rather than enumerating possibilities."
  - "Compose, don't enumerate."
- Notes: The best formal statement of PD as an API principle. Its four moves (common cases first, intelligent defaults, optimize the call site, compose don't enumerate) map directly onto UI: primary actions first, safe defaults, minimal visible chrome, and composable controls instead of mode switches.

### 4.3 Daniel Jalkut — "Progressive Disclosure in Swift"
- URL: https://bitsplitting.org/2017/01/18/progressive-disclosure-in-swift/ (January 18, 2017)
- Verbatim: Chris Lattner on ATP ep. 205: "The complexity in the language needs to be progressively disclosed." Jalkut's ladder: drag-to-Trash (beginner) → Cmd-Delete (intermediate) → Option-key menu variants (advanced) → Terminal (power user); macOS "spans the spectrum from simplicity to complexity."
- Notes: Jalkut explicitly imports the GUI concept into language design and back — a useful reminder that a "Terminal" (raw code mode) coexisting with a GUI is itself PD, not a contradiction of it (compare Grafana's Code mode, Notion's slash menu, Datadog's raw query).

### 4.4 Rust / Deno
Not separately fetched; the Swift and Next.js sources establish the DX usage. (HN thread on Swift's claim exists: news.ycombinator.com/item?id=13205008.)

---

## 5. "Simple defaults, advanced options": modes, toggles, bloat

### 5.1 Nielsen's rules applied to "Advanced" buttons
From 1.2/1.3: two levels max; label "clearly visible" with "clear expectations"; split by frequency ("80% of tasks land on level 1, 20% on level 2"), not by user type.

### 5.2 Home Assistant / Open Home Foundation — "Remove 'Advanced' and 'Expert' terminology"
- URL: https://github.com/OpenHomeFoundation/roadmap/issues/56 (frenck, March 11, 2026)
- Verbatim: "These labels create a psychological barrier: they implicitly tell users that certain features are not for them unless they meet some undefined skill threshold." "Labelling something 'advanced' or 'expert' does two things that hurt us: It discourages exploration." Principle: describe functionality, not audience — "Advanced settings" → "Additional settings"/"More options"; collapsed sections labelled by content ("Network settings") rather than audience. Community forums show "Do you have Advanced mode enabled?" as boilerplate troubleshooting.
- Notes: The strongest practitioner argument in this corpus against audience-labelled modes. It coincides with Nielsen's frequency-not-skill rule and Jira's 2021 rename away from "next-gen/classic."

### 5.3 Cooper — perpetual intermediates and the case against expert mode
- URLs: https://flylib.com/books/en/2.153.1.25/1/ (About Face 2.0, ch. 3); https://blog.codinghorror.com/defending-perpetual-intermediacy/ (Jeff Atwood, October 5, 2004)
- Verbatim (Cooper): "Most users are neither beginners nor experts; instead, they are intermediates." "Nobody wants to remain a beginner." "A well-balanced user interface … doesn't cater to the beginner or to the expert, but rather devotes the bulk of its efforts to satisfying the perpetual intermediate." Ski-resort analogy: "The beginner must find it easy to matriculate into the world of intermediacy, and the expert must not find his vertical runs obstructed by aids for bewildered perpetual intermediates." "When people achieve an adequate level of experience and ability, they generally stay there forever."
- Atwood: "I think intermediate users are the only users that matter."
- Notes: The implication for basic/advanced toggles: a global mode forces intermediates to choose an identity they do not have. Per-feature disclosure (Zapier, Grafana) lets them stay intermediate while reaching one advanced thing at a time.

### 5.4 Codexical — "Progressive Disclosure Is Gone. Engagement Metrics Killed It."
- URL: https://www.codexical.com/posts/2026-04-29-progressive-disclosure-abandoned (April 29, 2026)
- Verbatim: "The optimization target changes from 'task completion' to 'time spent in app.' On the second metric, progressive disclosure is a liability." TikTok is "the complete architectural inversion of progressive disclosure," relying on "habituation instead of guidance." Enterprise counter-case: Figma, Notion, Linear kept PD because they "optimize for task completion" — users must "ship code, write documents, close bugs."
- Notes: Useful framing for B2B: PD survives where the business metric is task completion/retention, not attention. This also explains why PLG vendors measure PD by activation and TTV rather than session time.

### 5.5 featurebloat.com — PD as the way bloat hides
- URL: https://featurebloat.com/for-designers (Digital Signet, updated June 15, 2026)
- Verbatim: "Progressive disclosure is used to make a feature 'less obtrusive' rather than to remove it." For features used by <3% of users, "hiding it behind progressive disclosure is not a solution. The solution is removal." Advice: audit settings where "fewer than 5% deviate from defaults" and remove the option; "mock without the feature first"; semi-annual screen audits.
- Notes: Pairs with Spool's experience rot (6.1) and Linear's scope-reduction: PD is a *deferral* mechanism, and deferral without eventual deletion is how "settings bloat" accumulates.

### 5.6 ParallelHQ — "Enterprise SaaS UX: Reducing Complexity at Scale"
- URL: https://www.parallelhq.com/blog/enterprise-saas-ux (Robin Dhanwani, July 21, 2026)
- Verbatim: "The best enterprise software hides its complexity until the user actually needs it." "Progressive disclosure means you only show the user the information they need at this exact moment." "A system administrator needs a completely different interface than a daily data entry clerk." Executives "want 15 metrics visible simultaneously, but daily operators need simple task lists." Recommends "data density toggles" (spacious vs. compact). Claims "68% of corporate buyers regret their enterprise software purchases due to low user adoption" and "$1200 per employee annually … on basic software training" (unsourced).
- Notes: A vendor/agency piece, but it states the enterprise-specific version of the problem well: the buyer persona and the user persona want different level-1 surfaces.

### 5.7 Jira's "toggle features" as the healthy form of a mode
From 3.3: next-gen projects let teams "quickly toggle on features like sprints or reports." This is per-capability disclosure inside a simplified product, not a global expert switch.

---

## 6. Role-based / persona-based disclosure; Jared Spool

### 6.1 Jared Spool — "Experience Rot"
- URL: https://articles.centercentre.com/experience_rot/ (Jared M. Spool, August 9, 2018; also jmspool.medium.com, 403 on fetch)
- Verbatim: "Every feature that's squeezed in, in the name of giving your design a competitive edge, has been making your design less competitive." "As you add features, you're adding complexity to the design, and decreasing the quality of the experience." (Paraphrase of advice) reject most proposed additions; experiment widely knowing most ideas warrant rejection; act early because "Preventing rot from inception proves far easier than remedying established dysfunction."
- Notes: Spool's rot is the enterprise-sales dynamic (feature checklists win RFPs) that PD is usually asked to paper over.

### 6.2 Jared Spool — "The $300 Million Button"
- URL: https://articles.centercentre.com/three_hund_million_button/ (January 14, 2009)
- Verbatim: "I'm not here to enter into a relationship. I just want to buy something." Replacement copy: "You do not need to create an account to make purchases on our site. Simply click Continue to proceed to checkout." Result: purchases up 45%, "$300 million" additional annual revenue.
- Notes: Not enterprise, but the canonical example of *deferring* a step (registration) — Bush's "Delay" — and it is the number PLG vendors quote when arguing for delaying setup.

### 6.3 Spool on the "dilemma of the intermediate user"
No standalone Spool article under that title surfaced; the intermediate-user argument in this corpus is Cooper's (5.3) and Nielsen's "perpetual intermediates" reference (1.3).

### 6.4 Role-based disclosure in practice
- Appcues (2.2): persona-based onboarding "based on their role or desired outcome," 2–5 paths.
- Pendo (2.3): segment by "customer size, tenure, and role."
- ParallelHQ (5.6): admin vs. data-entry clerk need "a completely different interface."
- Salesforce (3.2): the admin composes disclosure (tabs, quick actions, visibility rules) for end users; Setup is the org-wide advanced layer.
- Jira (3.3): who may configure is itself the disclosure boundary ("Any team member with the project's admin role…").
- Stripe (3.8): a dedicated Developers section.
- Schade (1.5): role-driven disclosure is *personalization* (system-driven), and "should not be used as a fix for a broken site."
- Notes: The enterprise pattern is that permissions double as disclosure: what you cannot do, you do not see. The trap is that permission systems are designed for security, not learnability, so users hit invisible walls (Microsoft's "if they can't see something, it doesn't exist").

---

## 7. Density vs. whitespace in expert tools, and how PD interacts

### 7.1 Matt Ström-Awn — "UI Density"
- URL: https://mattstromawn.com/writing/ui-density/
- Verbatim: Tufte: "Every bit of ink on a graphic requires reason. And nearly always that reason should be that the ink presents new information." Definitions: visual density (elements per space), information density (Tufte's data-ink ratio), design density ("how we intentionally use gestalt principles to communicate meaning"), temporal density (what users accomplish per unit time). "UI density is the value a user gets from the interface divided by the time and space the interface occupies." Bloomberg: "scrolling sparklines...tables with dozens of rows and columns...scrolling headlines," and users "navigate between dozens of charts and graphs in milliseconds." "some whitespace has meaning almost as salient as the darker pixels of graphic elements."
- Notes: The key reconciliation: PD trades *visual* density for *temporal* density (a click to reveal costs time). For experts who already know where things are, hiding reduces value density; for intermediates it raises it. That is why the same product needs density toggles (ParallelHQ) or accelerator layers rather than a single disclosure setting.

### 7.2 Bloomberg Terminal (see 3.15) and other density sources
- Lollypop trading-app guide (snippet): Bloomberg users "expect maximum data density, sacrificing whitespace to display complex option chains and multiple data feeds on a single screen"; "an expert system, not a consumer application."
- Philip Homnack (snippet): "The people who actually do stuff with software often prefer seeing more, not less."
- Envy Labs / MyDesigner (snippets): "Enterprise power users tolerate higher density than occasional users"; "Dense Interfaces Are Back … in 2026."
- Notes: The density debate is the boundary condition of PD: for a homogeneous expert population doing the same task all day (traders, SREs on-call), disclosure is a tax and density wins. PD earns its keep where the population is heterogeneous (most B2B SaaS) or task frequency is uneven.

---

## 8. AI-era (2023–2026): PD in copilots, agents, and agent architecture

### 8.1 Anthropic — Agent Skills (docs + engineering blog)
- URLs: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview ; https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills (Barry Zhang, Keith Lazuka, Mahesh Murag, October 16, 2025)
- Verbatim (docs): "This filesystem-based architecture enables progressive disclosure: Claude loads information in stages as needed, rather than consuming context upfront." Level 1 metadata "always loaded" (~100 tokens per Skill); Level 2 SKILL.md "loaded when triggered" (<5k tokens); Level 3+ resources "loaded as needed," "None until accessed." "Progressive disclosure ensures only relevant content occupies the context window at any given time." "you can install many Skills without context penalty: until a Skill is triggered, only its name and description occupy context."
- Verbatim (engineering blog): "Progressive disclosure is the core design principle that makes Agent Skills flexible and scalable." "Like a well-organized manual that starts with a table of contents, then specific chapters, and finally a detailed appendix, skills let Claude load information only as needed." "Building a skill for an agent is like putting together an onboarding guide for a new hire."
- Notes: A precise transfer of Nielsen's structure (a short, always-visible level 1; a requested level 2; deeper resources on demand) with the "user" replaced by the model's attention budget. It even reproduces the discoverability constraint: the level-1 description "must say both what the Skill does and when to use it" — Nielsen's "labeling that sets clear expectations."

### 8.2 SwirlAI — "Agent Skills: Progressive Disclosure as a System Design Pattern"
- URL: https://www.newsletter.swirlai.com/p/agent-skills-progressive-disclosure (Aurimas Griciūnas, March 11, 2026)
- Verbatim: "show only what is needed for the immediate task and defer everything else." "The context window is the agent's cognitive space. Overloading it degrades performance." "design patterns built for human cognition transfer well to agents"; PD was "formalized by the Nielsen Norman Group for user interface design."
- Search-snippet corroboration (MindStudio, Ardalis): "agents lose IQ points when their context window is stuffed with irrelevant data (context rot)." (Ardalis page returned 403.)

### 8.3 Nielsen on AI answers and long-running agents
See 1.3: verdict-first with detail behind disclosure; "disclose by exception"; "keep the full activity ledger 1 click away"; the 30-second "briefing test."

### 8.4 Google PAIR — People + AI Guidebook (Mental Models chapter)
- URL: https://pair.withgoogle.com/chapter/mental-models/
- Verbatim: "Be up-front about what your product can and can't do the first time the user interacts with it." "If they're interested in understanding the underlying technology of your product, you can always provide more detail with tooltips and progressive disclosure." "Only introduce new features when needed. As users explore the product, use relevant and actionable 'inboarding' messages." "Try to avoid introducing new features when users are busy doing something unrelated." "Many products set users up for disappointment by promising that 'AI magic' will help them accomplish their tasks."
- Notes: PAIR's "inboarding" is progressive onboarding for AI capabilities, with the added constraint of calibrating expectations about limits.

### 8.5 Microsoft HAX Toolkit — Guideline 1 "Make clear what the system can do"
- URL: https://www.microsoft.com/en-us/haxtoolkit/guideline/make-clear-what-the-system-can-do/
- Verbatim: "Help the user understand what the AI system is capable of doing." "Unclear user expectations about the set of supported tasks or domains can lead to disappointment, product abandonment, and even harms." Patterns: introductory blurb, explanation patterns, expose system controls, demonstrate possible inputs, show a set of outputs.
- Notes: HAX pulls the other way from PD: it wants capability boundaries *up front*. In B2B copilots (Microsoft 365 Copilot, Agentforce) this resolves as: disclose capabilities and limits early (HAX), disclose reasoning/sources/controls on demand (Nielsen, PAIR).

### 8.6 Shape of AI — "Disclosure" pattern; Intercom Fin's AI label
- URLs: https://www.shapeof.ai/patterns/disclosure ; https://www.intercom.com/help/en/articles/11712008-ai-agent-disclosure
- Verbatim (Shape of AI): "Disclosure patterns label AI interactions and content so users can distinguish them." "AI has a trust problem." "Name the actor, every time." "Label the action, not just the feature" (e.g. "Summarized with AI"). "Allow opt out." Intercom's Fin "Explicitly labels the messages sent by the AI."
- Verbatim (Intercom): the "Show AI Agent label in Messenger" toggle "is on by default for all customers using Fin AI Agent in the Messenger up until the 10 July 2025" and "off by default for all other customers"; email footer "This answer was composed by [AI Agent name], [Workspace name]'s AI Agent," "on by default."
- Notes: Important disambiguation — in AI UX "disclosure" often means *AI-identity disclosure* (transparency), not progressive disclosure. Intercom's default flip in July 2025 shows even transparency disclosure being treated as a configurable, role-gated (admin) setting.

### 8.7 aiuxdesign.guide — "Progressive Disclosure in AI"
- URL: https://www.aiuxdesign.guide/patterns/progressive-disclosure
- Verbatim: "Gradually reveal information, options, or AI features to reduce cognitive load and simplify complex tasks." "Hide the rare, never the necessary." "Make the door obvious." Cap at two layers; "Data-Driven Defaults" (hide by usage, "not aesthetic preferences for whitespace"); disclosures should appear "right where and when the user needs it, next to the thing it expands, not in a distant settings menu." Examples: ChatGPT (advanced settings in a menu), Loom (AI transcription behind "more options"). Claims ChatGPT, Claude, Notion, Linear implement the pattern (no specifics given).
- Notes: A 2025–26 restatement of Nielsen's rules for AI features; the "data-driven defaults" clause is the direct answer to the whitespace-vs-density debate (7.x).

### 8.8 Notion AI, Salesforce Einstein/Agentforce, Microsoft Copilot, GitHub Copilot
Searches returned vendor comparisons but no first-party UX write-ups using "progressive disclosure." The Notion AI Medium teardown (Amoah) was 403 on fetch. Observationally (not sourced here): Notion exposes AI via the same "/" and "space" entry points as blocks; GitHub Copilot exposes completions inline first and chat/agent modes behind a panel; Copilot and Agentforce ship "agent builder" surfaces to admins while end users see a single chat entry point — i.e., the same admin-vs-user split as classic enterprise disclosure.

---

## Synthesis (≈550 words)

Across roughly forty sources, "progressive disclosure" in complex B2B software resolves into three different practices that are routinely conflated, and the conflation is itself the main finding.

**First, PD as interface layering** (Nielsen 2006/2026, Kaplan 2020, Microsoft's Win32 guide, Primer, Polaris, SLDS). The stable rules have not changed in twenty years: two levels, split by frequency of use rather than by imagined user skill, a visible and honestly labelled door, persistent expand state, and never a disabled disclosure control. Nielsen's 2026 restatement ("80% of tasks land on level 1, 20% on level 2 … perpetual intermediates") and Home Assistant's 2026 campaign to delete "Advanced"/"Expert" labels converge on the same point: audience-labelled modes fail because most users are Cooper's intermediates and will not self-identify as experts. The healthy enterprise forms are per-capability disclosure (Zapier's Advanced settings hidden when inapplicable; Jira's "toggle on sprints") and synchronized dual representations (Grafana Builder/Code with "Explain"), not global basic/advanced switches.

**Second, progressive onboarding** (Appcues, Pendo, Userpilot, Chameleon, ProductLed, PAIR's "inboarding"). Here PD means metering *education* — checklists, tooltips, behaviorally-triggered hints, persona-branched first runs — and the metrics are activation rate, time-to-value, time to first key action, feature adoption, and drop-off. NN/g's Laubheimer supplies the theoretical backing (pull revelations over push tours), DockYard's small study supplies the empirical anecdote, and Wes Bush's "Eliminate / Delay / Mission-critical" is the operational version. Vendors habitually file signup branching and wizards under "progressive disclosure," which muddies the term; the useful distinction is that onboarding discloses *knowledge* over sessions, while layering discloses *controls* within a screen.

**Third, PD as a product-architecture stance**, most explicit in developer tools: Vercel's "progressive disclosure of complexity," SwiftUI's "complexity of the call site grows with the complexity of the use case," Lattner's "complexity in the language needs to be progressively disclosed." Linear applies the same stance to a SaaS product by refusing configurability ("one really good way of doing things") so there is less to disclose, and Jira applied it at the product-line level by shipping a simplified variant when its admin surface could not be layered in place.

Two tensions recur. **Density versus disclosure**: Ström-Awn's decomposition shows PD buys visual simplicity at the cost of temporal density, which is why homogeneous expert populations (Bloomberg, on-call SREs) reject it and heterogeneous B2B populations need density toggles and accelerator layers (command palettes that teach shortcuts, per Laubheimer and Superhuman) rather than a single disclosure policy. **Hiding versus removing**: Spool's experience rot and featurebloat.com's "the solution is removal" warn that PD is a deferral mechanism; enterprise sales incentives make it the default way to *keep* low-use features, so "settings bloat" is often PD used defensively. Codexical adds the business-model angle: PD persists in B2B because the metric is task completion, not attention.

In the AI era the concept has transferred almost unchanged. Anthropic's Agent Skills reproduce Nielsen's structure (always-visible metadata, on-trigger instructions, on-demand resources) with the model's context window as the "user," and Nielsen's 2026 guidance for agents ("disclose by exception … full activity ledger 1 click away," the 30-second briefing test) is classic overview-then-detail. The one genuine new tension is that HAX and PAIR demand capability *limits* be disclosed up front, while everything else — reasoning, sources, controls — stays behind the door; and "disclosure" in AI UX often means identity transparency (Shape of AI, Intercom's AI-agent label), which is a different concept altogether.

Practical takeaway for an enterprise product: pick frequency-based level-1/level-2 per screen; make every level-2 door labelled by content; use accelerators, not modes, for experts; treat role/permission as personalization with a visible "you don't have access" rather than silent absence; measure with activation and TTV, but also audit level-2 usage semi-annually and delete what nobody opens.

---

## Bibliography

1. Kaplan, K. "8 Design Guidelines for Complex Applications." NN/g, 2020-11-08. https://www.nngroup.com/articles/complex-application-design/
2. Nielsen, J. "Progressive Disclosure." NN/g, 2006-12-03. https://www.nngroup.com/articles/progressive-disclosure/
3. Nielsen, J. "Progressive Disclosure: From Training Wheels to Week-Long AI Agents." UX Tigers, 2026-07-09. https://www.uxtigers.com/post/progressive-disclosure
4. Laubheimer, P. "Flexibility and Efficiency of Use (Usability Heuristic #7)." NN/g, 2020-11-22. https://www.nngroup.com/articles/flexibility-efficiency-heuristic/
5. Schade, A. "Customization vs. Personalization in the User Experience." NN/g, 2016-07-10. https://www.nngroup.com/articles/customization-personalization/
6. Budiu, R. "Wizards: Definition and Design Recommendations." NN/g, 2017-06-25. https://www.nngroup.com/articles/wizards/
7. Laubheimer, P. "Onboarding Tutorials vs. Contextual Help." NN/g, 2023-02-12. https://www.nngroup.com/articles/onboarding-tutorials/
8. Laubheimer, P. "Dashboards: Making Charts and Graphs Easier to Understand." NN/g, 2017-06-18. https://www.nngroup.com/articles/dashboards-preattentive/
9. O'Sullivan, K. "Progressive Disclosure in SaaS." Userpilot, upd. 2026-08-10. https://userpilot.com/blog/progressive-disclosure/
10. O'Sullivan, K. "13 Progressive Disclosure Examples and Best Practices for SaaS." Userpilot, upd. 2026-08-10. https://userpilot.com/blog/progressive-disclosure-examples/
11. Balboni, K. "Onboarding UX: 10 patterns, best practices, and real examples." Appcues, 2026-06-09. https://www.appcues.com/blog/user-onboarding-ui-ux-patterns
12. Cutler, J. "Onboarding, Progressive Disclosure, Memory and Your Brain." Pendo, 2016-04-07. https://www.pendo.io/pendo-blog/onboarding-progressive-disclosure/
13. Meller, H. "3 Tactics for Your Progressive Onboarding Plan." Pendo, 2017-04-16. https://www.pendo.io/pendo-blog/3-tactics-progressive-onboarding-plan/
14. Pendo. "Build an Onboarding Engine" (white paper; snippet only). https://www.pendo.io/resources/build-an-onboarding-engine-for-product-and-customer-success/
15. McConnell, K. "How to Reduce Time to Value in Onboarding in SaaS." Chameleon. https://www.chameleon.io/blog/reduce-time-to-value-onboarding
16. Bush, W. "Turn Your Product Into a Growth Engine With This User Onboarding Framework." ProductLed, 2021-12-21. https://productled.com/blog/user-onboarding-framework
17. Jones, L. "Divebomb or the Dipping Toe: Onboarding vs. Progressive Disclosure." DockYard, 2019-12-23. https://dockyard.com/blog/2019/12/23/divebomb-or-the-dipping-toe-onboarding-vs-progressive-disclosure
18. Harris, J. "The Story of the Ribbon." MSDN blog archive, 2008-03-12. https://learn.microsoft.com/archive/blogs/jensenh/the-story-of-the-ribbon
19. Microsoft. "Progressive Disclosure Controls." Windows UX Guide, upd. 2020-10-20. https://learn.microsoft.com/en-us/windows/win32/uxguide/ctrl-progressive-disclosure-controls
20. Salesforce Trailhead. "Use Progressive Disclosure and Conditional Rendering." https://trailhead.salesforce.com/content/learn/modules/best-practices-in-lightning-web-components/use-progressive-disclosure-and-conditional-rendering
21. Magpantay, R. "Everything you want to know about next-gen projects in Jira Cloud." Atlassian Community, 2018-09-18. https://community.atlassian.com/t5/Team-managed-projects-articles/Everything-you-want-to-know-about-next-gen-projects-in-Jira/ba-p/894773
22. Fite, A. "The Linear Method: Opinionated Software." Figma Blog, 2024-05-29. https://www.figma.com/blog/the-linear-method-opinionated-software/
23. Crosley, B. "Superhuman: Speed as the Product." https://blakecrosley.com/guides/design/superhuman
24. Huet, R. "New developer tools in the Dashboard." Stripe Blog, 2018-03-20. https://stripe.com/blog/developer-dashboard
25. Grafana Labs. "Prometheus query editor." https://grafana.com/docs/grafana/latest/datasources/prometheus/query-editor/
26. GitHub Primer. "Progressive disclosure." https://primer.style/product/ui-patterns/progressive-disclosure/
27. Shopify Polaris. "Fundamentals" / "Information architecture" (snippets). https://polaris-react.shopify.com/foundations/information-architecture
28. Zapier Help. "Control when your Zap runs" (snippets). https://help.zapier.com/hc/en-us/articles/8495924437005-Control-when-your-Zap-runs
29. Leca, D. "The Impossible Bloomberg Makeover." UX Magazine, 2010-03-24. https://uxmag.com/articles/the-impossible-bloomberg-makeover
30. Ström-Awn, M. "UI Density." https://mattstromawn.com/writing/ui-density/
31. Rossi, L. "The Vercel Journey — with Guillermo Rauch." Refactoring, 2025-05-16. https://refactoring.fm/p/the-vercel-journey-with-guillermo
32. Apple. "The craft of SwiftUI API design: Progressive disclosure." WWDC22 session 10059. https://developer.apple.com/videos/play/wwdc2022/10059/
33. Jalkut, D. "Progressive Disclosure In Swift." Bitsplitting, 2017-01-18. https://bitsplitting.org/2017/01/18/progressive-disclosure-in-swift/
34. frenck. "Remove 'Advanced' and 'Expert' terminology from Home Assistant." Open Home Foundation roadmap issue #56, 2026-03-11. https://github.com/OpenHomeFoundation/roadmap/issues/56
35. Cooper, A. About Face 2.0, ch. 3 "Beginners, Experts, and Intermediates" (excerpt). https://flylib.com/books/en/2.153.1.25/1/
36. Atwood, J. "Defending Perpetual Intermediacy." Coding Horror, 2004-10-05. https://blog.codinghorror.com/defending-perpetual-intermediacy/
37. Codexical. "Progressive Disclosure Is Gone. Engagement Metrics Killed It." 2026-04-29. https://www.codexical.com/posts/2026-04-29-progressive-disclosure-abandoned
38. Digital Signet. "Feature Bloat for Designers: Progressive Disclosure." upd. 2026-06-15. https://featurebloat.com/for-designers
39. Dhanwani, R. "Enterprise SaaS UX: Reducing Complexity at Scale." ParallelHQ, 2026-07-21. https://www.parallelhq.com/blog/enterprise-saas-ux
40. Spool, J. "Experience Rot." Center Centre, 2018-08-09. https://articles.centercentre.com/experience_rot/
41. Spool, J. "The $300 Million Button." Center Centre, 2009-01-14. https://articles.centercentre.com/three_hund_million_button/
42. Anthropic. "Agent Skills — Overview." Claude Platform docs. https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
43. Zhang, B., Lazuka, K., Murag, M. "Equipping agents for the real world with Agent Skills." Anthropic Engineering, 2025-10-16. https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
44. Griciūnas, A. "Agent Skills: Progressive Disclosure as a System Design Pattern." SwirlAI, 2026-03-11. https://www.newsletter.swirlai.com/p/agent-skills-progressive-disclosure
45. Google PAIR. "People + AI Guidebook: Mental Models." https://pair.withgoogle.com/chapter/mental-models/
46. Microsoft. "HAX Toolkit — Guideline 1: Make clear what the system can do." https://www.microsoft.com/en-us/haxtoolkit/guideline/make-clear-what-the-system-can-do/
47. Shape of AI. "Disclosure." https://www.shapeof.ai/patterns/disclosure
48. Intercom Help. "AI Agent Disclosure." https://www.intercom.com/help/en/articles/11712008-ai-agent-disclosure
49. AI UX Design Guide. "Progressive Disclosure in AI." https://www.aiuxdesign.guide/patterns/progressive-disclosure
50. Notion guides (snippets): Crosley, B. "Notion: The Block-Based Revolution." https://blakecrosley.com/guides/design/notion ; Notion Help "Using slash commands." https://www.notion.com/help/guides/using-slash-commands

Not fetched (403/404/paywall): jmspool.medium.com "Experience Rot"; Medium/Stiltsoft "Jira Cloud: Classic vs. Next-gen"; Medium/Amoah "How Notion uses Progressive Disclosure on the Notion AI Page"; Medium/Wallas "Designing for Data Density"; ardalis.com "Optimizing AI Agents with Progressive Disclosure"; WalkMe glossary; Chameleon "progressive-onboarding"; NN/g enterprise/expert-user guesses.
