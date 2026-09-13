# Progressive Disclosure: Foundations and Canonical Definitions

Research notes compiled 2026-09-12. Every source below was fetched and read during this session; quotations marked with quotation marks are verbatim from the fetched page (or from the locally extracted PDF text). Where a page could only be reached through a secondary summary, that is stated explicitly. Paraphrase is labeled as such.

---

## 1. Jakob Nielsen / Nielsen Norman Group

### 1.1 "Progressive Disclosure" (nngroup.com)

- URL: https://www.nngroup.com/articles/progressive-disclosure/
- Author: Jakob Nielsen
- Date: December 3, 2006 (page shows "last updated July 15, 2022")

**Framing: the two conflicting requirements.** Nielsen opens by naming the tension PD is meant to resolve. Users want "power, features, and enough options to handle all of their special needs", and at the same time "Users want simplicity". Progressive disclosure is "one of the best ways to satisfy both of these conflicting requirements."

**Core definition (mechanism).** "Initially, show users only a few of the most important options. Offer a larger set of specialized options upon request." In the summary line the technique is described as one that "defers advanced or rarely used features to a secondary screen, making applications easier to learn and less error-prone." (That summary sentence is the one most often re-quoted by IxDF, Frank Spillers, UXPin and Wikipedia.)

**Primary vs secondary features.** The split is between the "few of the most important options" on the initial display and "a larger set of specialized options" on request. The consequence: "most users can proceed with their tasks without worrying about this added complexity" and "most users get what they need on the initial display." The frequency framing is explicit: the secondary display holds "rarely used settings, such as scaling and printing the pages in reverse sequence."

**Usability payoff.** "Progressive disclosure thus improves 3 of usability's 5 components: learnability, efficiency of use, and error rate." (Nielsen's five components, from his 1993 book Usability Engineering, are learnability, efficiency, memorability, errors, and satisfaction.)

**The two requirements for good progressive disclosure.**
1. Correct split. "You must disclose everything that users frequently need up front" — designers must "get the right split between initial and secondary features". Hiding a frequently needed feature is the cardinal failure mode.
2. Clear mechanics and labeling. "It must be obvious how users progress" from the primary to the secondary display: "simple mechanics" plus "labeling" that sets "expectations for what users will find when they progress to the next level."

**Classic example.** "The print dialog box is the classic example of progressive disclosure." The user first sees "a small set of choices", with "buttons for advanced options" that open "secondary dialogs" for rarely used settings. The article also allows "multiple levels of progressive disclosure", though it treats one secondary level as normal.

**Staged disclosure (the contrast).** "Staged disclosure is a variant in which users step through a linear sequence of options". "Wizards are the classic example of staged disclosure". Nielsen sets the two side by side:
- "Hierarchical: users start at the initial display and, if necessary, move to the secondary display" — this is progressive disclosure; moving to the secondary level is optional ("usually not" mandatory).
- "Linear: users progress through the task one step at a time" — this is staged disclosure; the steps are required.

The article's closing note: both patterns "are more than 30 years old and have proven themselves useful in countless applications, and even some websites."

**Notes.** The 2006 article does not use the literal phrase "80/20"; the frequency-based percentages appear in Nielsen's 2026 essay (section 1.4) and in Apple's 1992 guidelines (section 2.4). What the 2006 article does say is that the split must be by frequency of need, not by user type.

### 1.2 "Progressive Disclosure" (NN/g video)

- URL: https://www.nngroup.com/videos/progressive-disclosure/
- Presenter: Raluca Budiu; published 2022-07-15 (5 minutes)
- Description: "To reduce complexity in a user interface, employ progressive disclosure to defer secondary options to a subsidiary screen." The video restates the 2006 position: defer advanced or rarely used features to secondary screens, so the application is easier to learn and produces fewer errors.

### 1.3 "Accordions on Desktop: When and How to Use" (NN/g)

- URL: https://www.nngroup.com/articles/accordions-on-desktop/
- Author: Huei-Hsin Wang; July 30, 2023
- Definition: "An accordion is a header that can be clicked to reveal or hide content associated with it."
- Accordions are explicitly classed as PD: "the heading provides a concise overview of the topic. The panel is hidden by default, offering supplementary details to those who are interested."
- When they help: users need only some sections and will skip most; content is long and the viewport small; sections are independent.
- When they hurt: interaction cost accumulates ("scrolling, scanning, deciding, clicking, waiting"); "Valuable content that is hidden under an accordion may be missed altogether"; printing requires expanding everything; and "When audiences require most or all page content, displaying everything simultaneously is preferable to forcing excessive clicking."
- Note: this is NN/g's clearest statement of the cost side of PD — hidden content has a discoverability price, and PD is wrong when most users need most of the content.

### 1.4 Jakob Nielsen, "Progressive Disclosure: From Training Wheels to Week-Long AI Agents"

- URLs: https://jakobnielsenphd.substack.com/p/progressive-disclosure and https://www.uxtigers.com/post/progressive-disclosure
- Author: Jakob Nielsen; July 9, 2026

This is Nielsen's most recent and most historically explicit treatment.

- Definition: "Progressive disclosure is an interaction technique that initially shows the user only the most important options and reveals the specialized ones only when he or she asks for them, on a secondary display." Restated as: reveal "the few features that serve most tasks on the first screen and defer the rest to a clearly labeled second level."
- Historical origin: "The classic evidence arrived in 1984, when John M. Carroll and Caroline Carrithers of IBM's Watson Research Center published the 'Training Wheels' study." Results: "Beginners on the training-wheels system learned the basic letter-typing task faster and scored better on a comprehension test afterward." "The control group, meanwhile, burned almost 1/4 of its time recovering from exactly the error states the training interface had walled off." Nielsen's summary maxim: "Errors you can't reach are errors you can't make."
- Institutionalization: "In 1992, Apple's Macintosh Human Interface Guidelines devoted a section to 'Using Progressive Disclosure,'" (confirmed directly from the PDF; see section 2.4).
- Frequency, not skill: "Cooper nailed this in About Face (1995) with his term 'perpetual intermediates': most users learn enough to get their work done, then stop, and almost nobody becomes the settings-mastering power user that 'expert mode' fantasies assume." Therefore "progressive disclosure splits tasks by frequency, not people by skill."
- The 80/20 statement: "Your expert is a regular user having a rare moment. He or she lives on the bench 80% of the time and visits the drawer for the occasional exotic task." And, as a design target, roughly "80% of tasks land on level 1, 20% on level 2," which argues for one cohesive design rather than separate "lite" and "pro" versions.
- The two requirements, restated in 2026 terms:
  1. "The split must come from frequency-of-use data (analytics, field studies, support logs), not from whichever team shouted loudest at the roadmap meeting."
  2. "2 levels serve almost every design... Stop at 2." Because "Each additional level multiplies clicks and halves discoverability." He adds: "(A fixed sequence of steps is a different pattern: staged disclosure, AKA the wizard.)"
  Plus a hard rule: never hide decision-critical information (price, requirements, risks, privacy terms) behind the second level.
- Extension to AI agents: for long-running agents "progressive disclosure rotates from space into time: what interrupts you now versus what waits for you." "Level 1 is the outcome plus any decision-critical action awaiting approval: spending money, emailing a human, deleting files. Level 2 is the full step-by-step trace." "The activity log is the Advanced Settings drawer of agentic AI." Test: "can a returning user absorb the status, the spend, and the pending decisions in 30 seconds?"

### 1.5 "Paradox of the Active User" (NN/g)

- URL: https://www.nngroup.com/articles/paradox-of-the-active-user/
- Author: Jakob Nielsen; October 4, 1998
- The paradox: "Users never read manuals but start using the software immediately. They are motivated to get started and to get their immediate task done." Users would save time by learning first, but never do.
- Attribution: introduced by John M. Carroll and Mary Beth Rosson (then IBM, later Penn State) from studies at the IBM User Interface Institute in the early 1980s.
- Design implication: "we cannot allow engineers to build products for an idealized rational user when real humans are irrational: we must design for the way users actually behave."
- Note: this is the behavioral premise under PD. Because users will not study a full feature set before acting, the interface must make the first action safe and obvious, and hold the rest in reserve.

### 1.6 "10 Usability Heuristics Applied to Complex Applications" (NN/g)

- URL: https://www.nngroup.com/articles/usability-heuristics-complex-applications/
- Author: Kate Kaplan; August 15, 2021
- Complex application defined as "Any application supporting the broad, unstructured goals or nonlinear workflows of highly trained users in specialized domains."
- Under Flexibility and Efficiency of Use: "Shortcuts — hidden from novice users — may speed up the interaction for the expert users." Accelerators are "UI features that speed up an interaction or process."
- Under Aesthetic and Minimalist Design: "Every extra unit of information in an interface competes with the relevant units of information." Rarely used elements can be deferred: "Staged disclosure can be used to defer those elements to a secondary level" (the example given is advanced settings that appear only after a related field is checked in a dynamic form). Note: Kaplan uses "staged disclosure" here for something Nielsen's 2006 taxonomy would call hierarchical or conditional PD; NN/g's own terminology is not perfectly consistent across authors.

---

## 2. Historical Origin: Carroll, Rosson, IBM, Training Wheels, Minimalism

### 2.1 Carroll & Carrithers (1984), "Training wheels in a user interface"

- Communications of the ACM 27(8), August 1984; DOI https://doi.org/10.1145/358198.358218 (ACM and ResearchGate pages returned 403; metadata confirmed through https://api.semanticscholar.org/graph/v1/paper/DOI:10.1145/358198.358218 — title, authors John Millar Carroll and C. Carrithers, year 1984, venue CACM, 338 citations). Companion paper: Carroll & Carrithers, "Blocking Learner Error States in a Training-Wheels System," Human Factors 26(4), 1984, https://journals.sagepub.com/doi/10.1177/001872088402600402.
- Authorship correction: the 1984 Training Wheels papers are by Carroll and Caroline Carrithers, not Carroll and Rosson. Rosson was Carroll's IBM collaborator on the "paradox of the active user" (1987) and on minimalist instruction, and later co-authored with him; secondary sources (IxDF glossary, Spillers) conflate the two. Nielsen 2026 gets it right: "John M. Carroll and Caroline Carrithers of IBM's Watson Research Center". The search results also record that Clayton Lewis suggested the name "training wheels."
- What the system did (from Nielsen 2026 and the IxDF glossary): a modified IBM Displaywriter word processor that blocked advanced and error-prone functions for novices, returning a feedback message instead of changing state. Beginners learned the basic task faster, scored better on a comprehension test, and the control group spent almost a quarter of its time recovering from the very error states the training-wheels version had blocked.

### 2.2 IxDF Glossary, "Training Wheels Interface"

- URL: https://ixdf.org/literature/book/the-glossary-of-human-computer-interaction/training-wheels-interface (IxDF; published July 5, 2015)
- Definition: "A training wheels interface or application is a program/device/system that disables or hides advanced features so novices can learn the system faster in a protected environment where experimentation is safe and encouraged."
- Origin: the term "most likely derives from Carroll and Carrithers (1984) who designed a training wheels interface for a commercial word processor." Purpose: "to save users from the frustration and confusion caused by the errors they make in the early stages of learning." Result: "the ideal environment for building a coherent mental model of the system, resulting in better performance and learnability of the advanced functions after the initial 'training wheels phase'."

### 2.3 Carroll, minimalist instruction and The Nurnberg Funnel (1990)

- Book: John M. Carroll, The Nurnberg Funnel: Designing Minimalist Instruction for Practical Computer Skill, MIT Press, 1990 (https://www.amazon.com/Nurnberg-Funnel-Instruction-Communication-Information/dp/0262031639; ResearchGate summaries at https://www.researchgate.net/publication/3229757_John_Carroll's_The_Nurnberg_Funnel_and_Minimalist_Documentation).
- Core idea (paraphrase from search summaries): minimalist instruction "severely reduces explicit instruction and allows users to learn through a predominantly exploratory process"; "the learner, not the system, determines the model and methods of instruction"; learning happens through error recognition and recovery, not drill. The "Nurnberg Funnel" is the mythical device that pours knowledge into a learner's head — the approach Carroll rejects.
- Relationship to PD: training wheels is the interface-side expression of minimalism (reduce what is exposed, let the learner act, keep errors recoverable). PD in Nielsen's sense keeps the "reduce what is exposed" part but drops the temporary/learner-only framing: the hidden level stays available at all times, for everyone.

### 2.4 Apple, Macintosh Human Interface Guidelines (1992) — primary source, extracted from the PDF

- URL: https://vintageapple.org/inside_r/pdf/Human_Interface_Guidelines_1992.pdf (also https://archive.org/details/macintoshhumanin0000unse). Text extracted locally with pypdf; page numbers are the printed ones.
- Chapter 1, "WYSIWYG" principle (p. 8): "Don't hide features in your application by using abstract commands. People should be able to see what they need when they need it." ... "People should be able to find all the available features in your application. If you find a need to initially 'hide' features, do it in a way that gives people information about where they can find more choices. A stepped interface, by revealing relevant information to users in steps, shows the choice most users want most of the time while providing a way for the user to get more choices."
- Chapter 3, "The 80 Percent Solution" (p. 35): "The 80 percent solution means that your design meets the needs of at least 80 percent of your users. If you try to design for the 20 percent of your target audience who are power users, your design will not be usable by the majority of your users."
- Chapter 3, "Using Progressive Disclosure" (p. 35): "Progressive disclosure is one way to reduce the complexity of your designs. It allows you to present the most common choices to users while initially hiding more complex choices or additional information. Progressive disclosure helps you develop your interface so that it is easy for novice users to learn and includes the features and power that advanced users desire."
- p. 36: "For dialog boxes, you can implement progressive disclosure and thus reduce the complexity of your design by presenting only the most common options in the dialog box that appears initially on the screen." "The most standard method of letting users see more choices is including a button named More Choices in the lower-left corner of the dialog box. When the user clicks the button, the dialog box expands to display more information and the button name changes to Fewer Choices. This method is very clear and predictable. People know how to use buttons, and the labels let people know right away that they have access to more information if they don't see what they're looking for."
- Notes: this 1992 text already contains both of Nielsen's 2006 requirements (show "the choice most users want most of the time"; give "information about where they can find more choices") and the 80/20 framing, and it treats PD as a "stepped interface". It is the earliest formal design-guideline definition found in this research.

### 2.5 Wikipedia's earlier attribution: Kristina Hooper Woolsey (1985)

- URL: https://en.wikipedia.org/wiki/Progressive_disclosure
- Wikipedia credits Kristina Hooper Woolsey of Apple's Human Interface Group, writing in Norman & Draper (eds.), User Centered System Design (1986): "In the design of interfaces one must also consider carefully how one selectively informs a user about a particular system, providing well-chosen bits and pieces that can constitute a general understanding of a system."
- Note: this is a statement of the idea of selective, staged informing rather than a named pattern; the Wikipedia article does not mention Carroll, IBM, or training wheels at all.

---

## 3. Alan Cooper et al., About Face

- Sources reached: flylib chapter excerpt of About Face 2.0, Chapter 3 "Beginners, Experts, and Intermediates" (https://flylib.com/books/en/2.153.1.25/1/); Greg Bulla's notes on About Face 3 (https://www.gregbulla.com/TechStuff/Docs/NotesFromAboutFace3.htm); a chapter-by-chapter summary of the 4th edition (https://howtoes.blog/2025/06/11/about-face-complete-book-summary-all-key-ideas/); Nielsen 2026 (section 1.4). Google Books search-inside and Internet Archive were not retrievable, so quotations from the summaries are secondary and marked as such.

**Perpetual intermediates (verbatim from the About Face 2.0 chapter).** The authors reject "improving intermediates" and prefer "perpetual intermediates". Skill follows "the classic statistical bell curve": "if we graph number of people against skill level, a relatively small number of beginners are on the left side, a few experts are on the right, and the majority—intermediate users—are in the center." "AXIOM: Nobody wants to remain a beginner." "A well-balanced user interface takes the same approach. It doesn't cater to the beginner or to the expert, but rather devotes the bulk of its efforts to satisfying the perpetual intermediate." From About Face 3 notes: "We need to spend more time making our products powerful and easy to use for perpetual intermediate users. We must accommodate beginners and experts, too, but not to the discomfort of the largest segment of users." "Designers should optimize their products for intermediates."

**Excise (secondary summary of the 4th ed., ch. 12 "Reducing Work and Eliminating Excise").** "Excise is any work the user is forced to do that does not directly contribute to achieving their goals." Types listed: navigational excise ("The effort required to move around an interface—between windows, panes, pages, or tools"), skeuomorphic excise, modal excise ("The excise of being stopped by a dialog box"), and stylistic excise ("The visual work required to decode an overly stylized or cluttered interface"). Search summaries of the 3rd edition describe excise as effort "required by the tool or by external factors", divided into GUI excise, visual excise and pure excise.

**Commensurate effort (secondary summary, ch. 10).** "People will willingly work harder for something that is more valuable to them. A complex feature is acceptable if it delivers a powerful result." Search summaries phrase the principle as "Users make commensurate effort if the rewards justify it" and "a simple task must have a simple interaction."

**Inflecting the interface (secondary summary, ch. 10).** "Place the most frequently used functions in the most immediate locations" while pushing less-used functions deeper. This is the closest About Face comes to PD by name; the flylib and Bulla texts contain no literal "progressive disclosure" phrase.

**Notes.** Cooper supplies the population argument for PD (the bell curve of intermediates) and its cost accounting: every click into a secondary level is navigational excise, acceptable only where the payoff is commensurate. Nielsen 2026 treats perpetual intermediates as the reason to split by task frequency rather than user skill — the "expert" is the same intermediate on a rare errand.

---

## 4. Interaction Design Foundation (IxDF)

### 4.1 Topic page, "What is Progressive Disclosure?"

- URL: https://ixdf.org/literature/topics/progressive-disclosure (IxDF; "updated 2026")
- Definition: "a user experience (UX) technique that defers advanced features and information to secondary user interface (UI) components."
- "Progressive disclosure aims to show users what they need when they need it. Designers use UI patterns like modal windows and accordions to hide advanced features and information."
- Benefits listed: new users succeed immediately; supports varying experience levels; makes infrequent tasks less noticeable; keeps the UI uncluttered; reduces cognitive overload; limits immediate actions to reduce mistakes.
- Drawbacks listed: hard to define essential vs advanced content for broad audiences; "advanced" features that become everyday tasks frustrate frequent users; oversimplification; discoverability problems; multiple layers cause confusion.
- Patterns listed: modals, accordions, tabs, scrolling, carousels, collapsible menus, sidebars, tooltips, popovers, toggles.

### 4.2 Glossary of HCI entry, "Progressive Disclosure"

- URL: https://ixdf.org/literature/book/the-glossary-of-human-computer-interaction/progressive-disclosure
- Author: Frank Spillers (his own version: https://frankspillers.com/progressive-disclosure-the-best-interaction-design-technique/, dated 2004)
- Definition: "Progressive disclosure is an interaction design technique that sequences information and actions across several screens in order to reduce feelings of overwhelm for the user." Goal: make "more information available within reach, but don't overwhelm the user with all the features and possibilities." Quotes Nielsen 2006's "defers advanced or rarely used features to a secondary screen, making applications easier to learn and less error-prone."
- History: attributes the technique to John M. Carroll and Mary Rosson's early-1980s IBM lab work, which "found that hiding advanced functionality early on led to an increased success of its use later on", called "training wheels" (see authorship correction in 2.1).
- Limitation: cites Carroll and Rosson (1997) that "no empirical evidence exists regarding the effectiveness of progressive disclosure" beyond single applications and interface styles, and notes web hypertext is hard for PD because navigation is non-linear and audiences unpredictable.
- Examples: multi-page articles with "Next Page"; "Learn more" links; advanced search; expandable account overviews; wizards.
- Note: Spillers' definition is the sequential/temporal reading ("sequences ... across several screens"), noticeably different from Nielsen's hierarchical primary/secondary reading. Spillers also folds wizards into PD, which Nielsen separates as staged disclosure.

---

## 5. Lidwell, Holden & Butler, Universal Principles of Design

- Entry "Progressive Disclosure", pp. 154–155 of the 2003 edition (p. 188 in the revised 125-principle edition; O'Reilly chapter page https://www.oreilly.com/library/view/universal-principles-of/9781592535873/xhtml/ch88.html was 403; text read via https://pdfcoffee.com/william-lidwell-kritina-holden-jill-butler-universal-principles-of-design-rockport-publishers-pdf-free.html).
- Definition line: "A strategy for managing information complexity in which only necessary or requested information is displayed at any given time."
- Body (paraphrase from the fetched entry): progressive disclosure separates information into layers and presents only what is necessary, to prevent information overload; it is used in computer interfaces, instructional materials and physical spaces. Software hides infrequently used controls behind buttons such as "More"; theme parks segment long queues with walls and screens so visitors never see the whole line. Information disclosed as the user needs it is processed better and reduces errors and frustration.
- See also: Chunking, Errors, Layering, Performance Load.
- Related: Volz, Higdon & Lidwell, "Progressive Disclosure" in The Elements of Education for Teachers (Routledge 2019), defines it as "separating options and information into multiple layers, and then presenting those layers on a need-to-know basis" and links it to the spiral curriculum.
- Note: Lidwell's is the broadest definition — not a UI pattern but a general information-management strategy spanning interfaces, instruction and architecture; the theme-park example is the one Wikipedia inherited.

---

## 6. Bruce Tognazzini, "First Principles of Interaction Design (Revised & Expanded)"

- URL: https://asktog.com/atc/principles-of-interaction-design/ ; revision of March 5, 2014
- Discoverability: "Any attempt to hide complexity will serve to increase it." "If the user cannot find it, it does not exist." "Controls and other objects necessary for the successful use of software should be visibly accessible at all times." Tog's complaint is against hiding for showroom appeal: Apple "starting copying Microsoft by adding invisible controls from scroll bars to buttons everywhere. The situation on the Mac got so bad that, by the early 2010s, the only way a user could discover how to use many of the most fundamental features of the computer was to use Google to search for help."
- Simplicity: "Avoid the 'Illusion of Simplicity'" and "Use Progressive Revelation to flatten the learning curve" — hiding advanced pathways while users learn is different from burying necessary controls; reveal capabilities when users need them and have enough knowledge to use them.
- Explorable Interfaces: "Give users well-marked roads and landmarks, then let them shift into four-wheel drive." "Make Actions reversible." Early-stage users need directive interfaces; habitual users need flexibility; stable landmarks give a sense of "home".
- Visible Navigation: "Make navigation visible."
- Learnability: frequency of use decides the priority between learnability and usability — single-use apps favor learnability, habitual-use apps favor efficiency.
- Note: Tog is the counterweight. His "Progressive Revelation" is PD, but bounded by the discoverability rule: anything necessary must stay visible; only the advanced pathway may be deferred. He also offers a test for the bad kind of hiding — if users must search the web to find a basic control, the "simplicity" is an illusion.

---

## 7. Don Norman

### 7.1 Living with Complexity (MIT Press, 2010) and "Complexity is Good, Simplicity Overrated"

- URLs: https://jnd.org/complexity-is-good-simplicity-overrated-misc-magazine/ (Misc Magazine, January 27, 2013); https://www.goodreads.com/work/quotes/13144201-living-with-complexity; https://mitpress.mit.edu/9780262528948/living-with-complexity/
- "Complexity is good. The world is complex and our tools must work in that world, so they must match it."
- "Confusion: This is the enemy. We do not wish to be confused, befuddled, and frustrated by our tools."
- "The argument against complexity is due to the common misunderstanding that complexity leads to confusion. No, it doesn't have to." "This is the role of good design: to make complex things simple to understand, easy to use, and delightful."
- "Simplicity should never be the goal. Complex things will require complexity. It is the job of the designer to manage that complexity with skill and grace."
- "The mark of the great designer is the ability to provide the complexity that people need in a manner that is understandable and elegant."
- From the book (Goodreads quotes): "Modern technology can be complex, but complexity by itself is neither good nor bad: it is confusion that is bad." "Forget the complaints against complexity; instead, complain about confusion." "Simplification is as much in the mind as it is in the device." "We must design for the way people behave, not for how we would wish them to behave." The book also invokes Tesler's law of conservation of complexity — hiding complexity from users moves it into the system; it does not remove it.
- Note: Norman gives PD its philosophical justification. PD does not reduce complexity (Tesler); it sequences and structures it so that it does not become confusion.

### 7.2 The Design of Everyday Things (revised 2013)

- URLs: https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded-edition/ (table of contents); definitions read from summaries at https://readingraphics.com/book-summary-the-design-of-everyday-things/ and https://figr.design/blog/the-design-of-everyday-things (paraphrases, not verbatim book text).
- Verbatim Norman lines quoted in the summaries: "Our technologies may change, but the fundamental principles of interaction are permanent." "We have to accept human behavior the way it is, not the way we would wish it to be." "If the system lets you make the error, it is badly designed."
- Concepts (paraphrase): discoverability — can the user figure out what actions are possible and where; understanding — what does it mean, how is it used; affordances — the possible actions an object offers; signifiers — the cues that communicate where and how to act; constraints (physical, cultural, semantic, logical); mappings; feedback; conceptual model; gulf of execution — the gap between intention and what the system lets you do; gulf of evaluation — the gap between the system's state and the user's ability to interpret it; the seven stages of action.
- Note: Nielsen's second requirement ("it must be obvious how users progress" with clear labeling) is a signifier requirement in Norman's vocabulary — a "More options" button is the signifier for the affordance of the hidden level. Poorly labeled PD widens both gulfs: users cannot tell that more exists (execution) or what they will find (evaluation). "If the system lets you make the error, it is badly designed" is the same argument as Training Wheels.

---

## 8. Jef Raskin and Steve Krug

### 8.1 Raskin, The Humane Interface (Addison-Wesley, 2000)

- URL: https://raskincenter.org/jef/humane-interface/ (summary maintained by the Raskin Center)
- "A mode is a state of an interface in which the same user action produces different results." "Modes are harmful because they create errors."
- On habituation: "When we learn to type, we begin by consciously selecting each key. With practice, the action becomes habitual." "Good interfaces leverage automaticity by maintaining consistency."
- "Humans can consciously attend to one thing at a time." "Good interface design keeps the locus on the user's task, not on the interface itself."
- "Good interface design is not visible. The best interfaces do not call attention to themselves."
- Relevance to PD: Raskin does not discuss PD by name in the sources reached. His concepts constrain it: an expandable dialog whose button toggles between "More Choices" and "Fewer Choices" is a mild mode; a secondary level should not change the meaning of habitual actions, and disclosure should not pull the locus of attention away from the task. His single-locus-of-attention argument supports showing less at once.

### 8.2 Krug, Don't Make Me Think (2000; Revisited, 2014)

- URLs: https://howtoes.blog/2025/06/07/dont-make-me-think-a-book-summary/ ; https://www.sitepoint.com/review-dont-make-me-think/ (search summary)
- Krug's laws: "Don't make me think!"; "It doesn't matter how many times I have to click, as long as each click is a mindless, unambiguous choice."; "Get rid of half the words on each page, then get rid of half of what's left."
- Behavior: users satisfice — choose "the first reasonable option"; they muddle through, "making up our own stories"; they scan rather than read.
- On hiding: the summary records Krug's rule to "Never hide what users want, like support numbers or pricing", because concealment erodes goodwill; and to cut visual noise, "happy talk" and instructions.
- Relevance: Krug's second law is the operational license for PD — extra clicks are free when each is unambiguous — and his goodwill rule is its limit, matching Nielsen's "never hide decision-critical information."

---

## 9. Encyclopedic definitions and neighboring terms

- Wikipedia (https://en.wikipedia.org/wiki/Progressive_disclosure): "an interaction design pattern used to make applications easier to learn and less error-prone" by deferring advanced features and revealing information as it becomes relevant to the task. Examples: macOS print dialog "Show Details"; theme-park queues. Attributes the idea to Woolsey (1985). Does not distinguish PD from staged disclosure, progressive reduction, or progressive enhancement.
- The Decision Lab (https://thedecisionlab.com/reference-guide/design/progressive-disclosure): PD reveals content only when users request it, decreasing cognitive overload; attributes to Nielsen with the paraphrase "show people the basics first, and once they understand that, allow them to get to the expert features."
- UXPin (https://www.uxpin.com/studio/blog/what-is-progressive-disclosure/): "a user interface design technique that reduces cognitive load by gradually revealing more complex information or features as a user progresses through a product." Claims Nielsen "introduced this concept in 1995" (unsupported; Apple's 1992 guidelines already use the term, and Nielsen's article is 2006).
- LogRocket, Eric Chung, March 21, 2025 (https://blog.logrocket.com/ux-design/progressive-disclosure-ux-types-use-cases/): "a UX design technique that reduces users' cognitive load by gradually revealing information as needed."
- Progressive reduction — A List Apart, Jeffrey Zeldman, August 1, 2013 (https://alistapart.com/blog/post/progressive-reductionmodify-your-ui-over-time/), reporting LayerVault's idea: "Usability is a moving target. A user's understanding of your application improves over time and your application's interface should adapt to your user." The UI simplifies (labels drop to icons) as a user demonstrates proficiency, with "experience decay" restoring cues after disuse. This is adaptation over calendar time per user, whereas PD is a fixed layering that every user can open at any time.
- Progressive enhancement (https://en.wikipedia.org/wiki/Progressive_enhancement): a web development strategy that delivers core content to every browser and layers enhancements for more capable clients. Shares only the word "progressive"; it is about device capability, not user attention.
- Staged disclosure: Nielsen's term for the linear, mandatory-step variant (wizards). Kaplan (NN/g 2021) uses it loosely for conditional reveal in forms; LogRocket lists it as one PD type.

---

## 10. Taxonomies of progressive disclosure types

No single authoritative taxonomy exists; the sources offer overlapping schemes.

1. Nielsen 2006 (the canonical two-way split): hierarchical (progressive disclosure proper: initial display plus optional secondary display) vs linear (staged disclosure: mandatory sequence, e.g., wizards). Nielsen 2026 adds the temporal rotation for agents: "what interrupts you now versus what waits for you."
2. Apple HIG 1992: the "stepped interface" (More Choices / Fewer Choices expanding dialog) plus preferences as a separate complexity-management tool.
3. Lidwell 2003: layering as a general strategy across interfaces, instruction and physical space.
4. Spillers/IxDF glossary: sequencing "across several screens" (temporal), with wizards and multi-page articles included.
5. LogRocket 2025 (four types): conditional disclosure ("Reveals additional options when specific conditions are met"), contextual disclosure ("Displays only the most relevant details at a time, revealing more as needed"), progressive enabling ("Disables certain elements until the user completes a required selection"), staged disclosure ("Breaks down complex processes into simpler sequential steps").
6. UXPin (three categories): step-by-step, conditional ("Advanced settings" toggle), contextual.
7. NN/g Kaplan 2021: implicit role/expertise-based split — shortcuts "hidden from novice users" that serve experts, and staged disclosure for rarely used elements in complex applications.

A working synthesis of the axes used across these sources: space (hierarchical layering: primary vs secondary display), time (sequencing: wizards, onboarding, agent activity logs), condition/context (reveal depends on prior input or state), and user (role- or proficiency-based; this last one is what progressive reduction and expert shortcuts do, and what Nielsen explicitly says PD is not).

---

## Synthesis

The definitions converge on one mechanism and diverge on three questions: what is being split, along which axis, and whether the split is permanent.

The mechanism is stable from 1992 to 2026. Apple's guidelines say "present the most common choices to users while initially hiding more complex choices"; Nielsen says "show users only a few of the most important options. Offer a larger set of specialized options upon request"; Lidwell says "only necessary or requested information is displayed at any given time"; IxDF says PD "defers advanced features and information to secondary user interface components." All agree that the deferred material remains reachable, and all give the same rationale: fewer visible options mean faster learning, fewer errors and less clutter, without losing power.

The first divergence is the unit of the split. Nielsen is precise: the split is between frequently and rarely needed tasks, and he warns twice — in 2006 and again in 2026 — that it is not a split between novices and experts, because Cooper's perpetual intermediates are the same people in both situations. Apple's 1992 text, by contrast, pairs "easy for novice users to learn" with "the features and power that advanced users desire", a user-type framing that survives in IxDF's benefit list and in Kaplan's expert shortcuts. Training Wheels itself was a novice-only, temporary intervention — which is why Nielsen treats it as evidence for PD rather than as PD. Progressive reduction takes the user-type axis to its extreme by changing the interface per person over time.

The second divergence is spatial versus temporal. Nielsen's PD is hierarchical and spatial: two levels, the second optional. Staged disclosure is temporal and mandatory. Spillers and several popular taxonomies fold wizards and step-by-step onboarding into PD, and Nielsen's 2026 essay itself admits a temporal form for long-running agents. The safest reading is that "progressive disclosure" names the family, and Nielsen's hierarchical/linear distinction is the one worth preserving inside it.

The third is scope. Lidwell's definition covers theme-park queues and lesson plans; Nielsen's covers dialog boxes. The broad definition explains why the idea keeps reappearing under other names (spiral curriculum, minimalist instruction).

Two constraints recur across every critical source. Tognazzini: "If the user cannot find it, it does not exist" — necessary controls must stay visible, and hiding for the sake of apparent simplicity increases complexity. Nielsen, Krug and NN/g's accordion research: never hide what people need often or what they need to decide; each extra level "halves discoverability." Norman supplies the frame that reconciles PD with these limits: complexity is not the enemy, confusion is, and PD is one of the designer's tools for keeping the two apart — it sequences complexity rather than removing it.

Historically, the chain is: Carroll and Carrithers (1984) provide the experimental evidence that walling off advanced functions helps learners; Woolsey (1985) and Apple (1992) turn selective disclosure into a named guideline with the More/Fewer Choices dialog; Cooper (1995) supplies the population model; Nielsen (2006) writes the canonical definition, the two requirements, and the staged-disclosure contrast; Lidwell (2003) generalizes it beyond software; Nielsen (2026) extends it to AI agents and makes the 80/20 frequency rule explicit.

---

## Bibliography

1. Nielsen, J. "Progressive Disclosure." NN/g, 2006-12-03 (updated 2022). https://www.nngroup.com/articles/progressive-disclosure/
2. Budiu, R. "Progressive Disclosure" (video). NN/g, 2022-07-15. https://www.nngroup.com/videos/progressive-disclosure/
3. Wang, H.-H. "Accordions on Desktop: When and How to Use." NN/g, 2023-07-30. https://www.nngroup.com/articles/accordions-on-desktop/
4. Nielsen, J. "Progressive Disclosure: From Training Wheels to Week-Long AI Agents." 2026-07-09. https://jakobnielsenphd.substack.com/p/progressive-disclosure ; https://www.uxtigers.com/post/progressive-disclosure
5. Nielsen, J. "Paradox of the Active User." NN/g, 1998-10-04. https://www.nngroup.com/articles/paradox-of-the-active-user/
6. Kaplan, K. "10 Usability Heuristics Applied to Complex Applications." NN/g, 2021-08-15. https://www.nngroup.com/articles/usability-heuristics-complex-applications/
7. Carroll, J. M. & Carrithers, C. "Training wheels in a user interface." CACM 27(8), 1984. https://doi.org/10.1145/358198.358218 ; metadata via https://api.semanticscholar.org/graph/v1/paper/DOI:10.1145/358198.358218
8. Carroll, J. M. & Carrithers, C. "Blocking Learner Error States in a Training-Wheels System." Human Factors 26(4), 1984. https://journals.sagepub.com/doi/10.1177/001872088402600402
9. IxDF. "Training Wheels Interface." Glossary of HCI, 2015. https://ixdf.org/literature/book/the-glossary-of-human-computer-interaction/training-wheels-interface
10. Carroll, J. M. The Nurnberg Funnel. MIT Press, 1990. https://www.amazon.com/Nurnberg-Funnel-Instruction-Communication-Information/dp/0262031639
11. Apple Computer. Macintosh Human Interface Guidelines. Addison-Wesley, 1992, pp. 8, 35–37. https://vintageapple.org/inside_r/pdf/Human_Interface_Guidelines_1992.pdf
12. Wikipedia. "Progressive disclosure." https://en.wikipedia.org/wiki/Progressive_disclosure
13. Cooper, A. et al. About Face 2.0, ch. 3 excerpt. https://flylib.com/books/en/2.153.1.25/1/
14. Bulla, G. "Notes from About Face 3." https://www.gregbulla.com/TechStuff/Docs/NotesFromAboutFace3.htm
15. "About Face – Complete Book Summary." howtoes.blog, 2025-06-11. https://howtoes.blog/2025/06/11/about-face-complete-book-summary-all-key-ideas/
16. IxDF. "What is Progressive Disclosure?" https://ixdf.org/literature/topics/progressive-disclosure
17. Spillers, F. "Progressive Disclosure." IxDF Glossary of HCI. https://ixdf.org/literature/book/the-glossary-of-human-computer-interaction/progressive-disclosure ; https://frankspillers.com/progressive-disclosure-the-best-interaction-design-technique/
18. Lidwell, W., Holden, K. & Butler, J. Universal Principles of Design, Rockport, 2003/2010. https://www.oreilly.com/library/view/universal-principles-of/9781592535873/xhtml/ch88.html ; text via https://pdfcoffee.com/william-lidwell-kritina-holden-jill-butler-universal-principles-of-design-rockport-publishers-pdf-free.html
19. Volz, A., Higdon, J. & Lidwell, W. "Progressive Disclosure." The Elements of Education for Teachers, Routledge, 2019. https://www.taylorfrancis.com/chapters/mono/10.4324/9781315101002-36/progressive-disclosure-austin-volz-julia-higdon-william-lidwell
20. Tognazzini, B. "First Principles of Interaction Design (Revised & Expanded)." 2014-03-05. https://asktog.com/atc/principles-of-interaction-design/
21. Norman, D. "Complexity is Good, Simplicity Overrated." Misc Magazine, 2013-01-27. https://jnd.org/complexity-is-good-simplicity-overrated-misc-magazine/
22. Norman, D. Living with Complexity. MIT Press, 2010. https://mitpress.mit.edu/9780262528948/living-with-complexity/ ; quotes: https://www.goodreads.com/work/quotes/13144201-living-with-complexity
23. Norman, D. The Design of Everyday Things, rev. ed. 2013. https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded-edition/ ; summaries: https://readingraphics.com/book-summary-the-design-of-everyday-things/ ; https://figr.design/blog/the-design-of-everyday-things
24. Raskin, J. The Humane Interface. Addison-Wesley, 2000. Summary: https://raskincenter.org/jef/humane-interface/
25. Krug, S. Don't Make Me Think, Revisited. New Riders, 2014. Summaries: https://howtoes.blog/2025/06/07/dont-make-me-think-a-book-summary/ ; https://www.sitepoint.com/review-dont-make-me-think/
26. Chung, E. "Progressive disclosure in UX design: Types and use cases." LogRocket, 2025-03-21. https://blog.logrocket.com/ux-design/progressive-disclosure-ux-types-use-cases/
27. UXPin. "What Is Progressive Disclosure in UX?" https://www.uxpin.com/studio/blog/what-is-progressive-disclosure/
28. The Decision Lab. "Progressive Disclosure." https://thedecisionlab.com/reference-guide/design/progressive-disclosure
29. Zeldman, J. "Progressive Reduction: Modify Your UI Over Time." A List Apart, 2013-08-01. https://alistapart.com/blog/post/progressive-reductionmodify-your-ui-over-time/
30. Wikipedia. "Progressive enhancement." https://en.wikipedia.org/wiki/Progressive_enhancement
