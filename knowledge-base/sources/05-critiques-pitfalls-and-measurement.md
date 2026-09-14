# Progressive Disclosure: Critiques, Pitfalls, Failure Modes, and Measurement

*Research memo, compiled 2026-09-12. Scope: complex B2B software. All quotations were fetched from the cited sources during this research pass; where a page could not be retrieved (noted inline), the finding is taken from a secondary summary and flagged as such.*

---

## 0. Framing: what the canonical source itself warns about

Before cataloguing the critiques it is worth noting that the foundational NN/g article already contains most of the failure modes in embryo.

**Source:** Jakob Nielsen, "Progressive Disclosure," Nielsen Norman Group, 3 Dec 2006. https://www.nngroup.com/articles/progressive-disclosure/

Nielsen's two load-bearing conditions are (a) the primary/secondary split must be right, and (b) there must be at most two levels:

> "designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels."

He instructs designers to "disclose everything that users frequently need up front, so that they have to progress to the secondary display only on rare occasions," and warns that staged disclosure (wizards) becomes "problematic when the steps are interdependent and users must alternate between them."

In his 2026 revisit (Jakob Nielsen, "Progressive Disclosure: From Training Wheels to Week-Long AI Agents," UX Tigers, 9 Jul 2026, https://www.uxtigers.com/post/progressive-disclosure) he names the central failure explicitly as "disclosure debt":

> "Bury a daily-use feature and users pay an interaction tax on every visit."

and restates the numeric rules of thumb: roughly 80% of tasks should be servable at level 1, a hard maximum of two levels, and advanced options reachable in one click. Every critique below is essentially a way of violating one of those constraints, or of applying the pattern where its preconditions do not hold.

---

## 1. Discoverability cost: "out of sight, out of mind"

### 1.1 Hidden navigation (hamburger menus)

**Source:** Kara Pernice & Raluca Budiu, "Hamburger Menus and Hidden Navigation Hurt UX Metrics," NN/g, 26 Jun 2016. https://www.nngroup.com/articles/hamburger-menus/

This is the most-cited quantitative evidence that hiding things reduces their use. The study compared hidden, visible and "combo" (some visible, rest hidden) navigation on desktop and mobile:

- **Usage.** On desktop, hidden menus were used in only **27%** of cases vs. **48%** (visible) and **50%** (combo). On mobile, hidden navigation was used in **57%** of cases vs. **86%** for combo.
- **Task success.** "visible or combo navigation made people more likely to complete the task successfully," with success rates **more than 20% higher** than hidden navigation on both platforms.
- **Time.** Desktop users were **at least 39% slower** with hidden navigation; mobile users **15% slower**. Hidden navigation took 5–7 seconds longer to reach on desktop and about 2 seconds longer on mobile.
- **Perceived difficulty (1–7 scale).** Hidden 2.6, combo 2.3, visible 2.1: a **21%** increase in perceived difficulty for hidden vs. visible.

The authors attribute the penalty to five causes: low salience of small icons, no information scent about what the menu contains, extra interaction work, inconsistent implementation, and unfamiliarity on desktop. Recommendation: on desktop, "Do not use hidden navigation (such as hamburger icons)"; on mobile, show up to four links visibly and hide the rest.

**Relevance to B2B.** A collapsed left rail, a "More..." overflow, or a kebab menu in a SaaS admin console is the same pattern. Any feature whose *only* route is a hidden container inherits a usage penalty of roughly this order.

### 1.2 Icons without labels ("mystery meat")

**Source:** Aurora Harley, "Icon Usability," NN/g, 27 Jul 2014. https://www.nngroup.com/articles/icon-usability/

> "Text labels must be present alongside an icon to clarify its meaning in that particular context."
> "Icon labels should be visible at all times, without any interaction from the user."
> "Outside of these examples [home, print, search], most icons continue to be ambiguous to users due to their association with different meanings across various interfaces."

The article reports a **0% click-through** on a non-standard clock icon used for navigation history, summarised as "Obscure icon = wasted feature." Note the second quote: a label that appears only on hover is itself a progressive-disclosure failure, because the disclosure trigger has no scent.

### 1.3 Hover-only reveals

**Source:** Aurora Harley, "Timing Guidelines for Exposing Hidden Content," NN/g, 11 Jan 2015. https://www.nngroup.com/articles/timing-exposing-content/

Hover disclosure has a narrow timing window: "display visual feedback within 0.1 seconds," then "Wait 0.3–0.5 seconds" before exposing content, and keep it visible "until the cursor has left the triggering target area or the exposed content for longer than 0.5 seconds." Too fast and "Revealing hidden content too quickly on mouseover can result in accidental activations"; too slow and "revealing content too slowly makes the system appear sluggish." Hover is also unavailable on touch, and the "diagonal problem" in mega-menus causes unintended switches. Section 6 covers the accessibility side.

### 1.4 Why users rarely go looking

**Source:** Jared Spool, "Do users change their settings?," UIE Brainsparks, 14 Sep 2011. https://archive.uie.com/brainsparks/2011/09/14/do-users-change-their-settings/

Spool's Microsoft Word settings-file study is the strongest evidence that content parked behind a "Settings" or "Advanced" door is effectively invisible:

> "Less than 5% of the users we surveyed had changed any settings at all."
> "95% of the users were running with autosave turned off ... They assumed Microsoft had delivered it turned off for a reason, therefore who were they to set it otherwise."
> "If you're a programmer or designer, then you're not like most people. Just because you change your settings in apps you use doesn't mean that your users will."

**Mitigation (Section 1).**
- Treat every hidden container as carrying a usage penalty on the order of 20–50%; only hide what you can afford to have used that much less.
- Prefer "combo" disclosure: expose the top 3–4 items and hide the tail, rather than hiding everything.
- Always give the disclosure trigger visible scent (a text label, a count badge, or a preview of what's inside).
- Never rely on hover as the sole trigger; use click/tap plus keyboard.
- Get defaults right, because most users will never open the drawer to change them.

---

## 2. The "3-click rule" myth and what actually matters

**Source:** Joshua Porter, "Testing the Three-Click Rule," UIE / Center Centre, 16 Apr 2003. https://articles.centercentre.com/three_click_rule/

Porter analysed **44 users, 620 tasks and more than 8,000 clicks**:

> "Our analysis showed that there wasn't any more likelihood of a user quitting after three clicks than after 12 clicks."
> "When we compared the successful tasks to the unsuccessful ones, we found no differences in the distributions of tasks lengths."
> "The satisfaction of users doesn't depend on the number of clicks."
> "the number of clicks isn't what is important to users, but whether or not they're successful at finding what they're seeking."

**Source:** Page Laubheimer, "The 3-Click Rule for Navigation Is False," NN/g, 11 Aug 2019. https://www.nngroup.com/articles/3-click-rule/

> "The big problem with the 3-click rule is that it has **not** been supported by data in any published studies to date."

Laubheimer identifies the harm of applying the rule anyway: flattened hierarchies with "excessive top-level categories," and overloaded pages that force users to "assess" long option lists. What matters instead is information scent ("names with strong information scent"), wayfinding, and the recognition that "not all clicks are equal: some result in long wait times ... and others are instantaneous."

**Source:** Raluca Budiu, "Interaction Cost," NN/g, 31 Aug 2013 (reviewed 14 Oct 2024). https://www.nngroup.com/articles/interaction-cost-definition/

Interaction cost is "the sum of efforts — mental and physical — that users must deploy in interacting with a digital product in order to reach their goals." Its components are reading, scrolling, looking around, comprehending, clicking/touching, typing, page loads and waiting, attention switches, and memory load. The key implication for disclosure design: a click that resolves uncertainty may be cheaper than a screen that forces reading and comprehension of 40 options; conversely, a disclosure the user must *remember* exists ("Remember that swiping to the right exposes more content") adds memory load that a visible control does not.

**Implication for PD.** Both the pro-PD and anti-PD camps misuse click counts. The right question is not "how many clicks to reach the feature?" but "does the user have enough scent and confidence at each step, and is total interaction cost (including scanning and memory) lower than the alternative?"

**Mitigation (Section 2).**
- Replace click-count budgets with scent audits: can a user predict what is behind each disclosure trigger without opening it?
- Measure confidence and directness (tree testing, Section 10) rather than depth.
- Account for full interaction cost: an extra click that replaces a 40-item scan is a win; an extra click to reach a daily-use item is a tax.

---

## 3. Over-nesting, accordion overuse, and settings sprawl

### 3.1 Accordions on desktop

**Source:** Huei-Hsin Wang, "Accordions on Desktop: When and How to Use Them," NN/g, 30 Jul 2023. https://www.nngroup.com/articles/accordions-on-desktop/

> "Each step involved in expanding the accordion—scrolling the page, scanning the headings, deciding which one to expand, targeting the click, and waiting for the content to appear—incurs a certain interaction cost."
> "Valuable content that is hidden under an accordion may be missed altogether."

Additional failure modes listed: auto-collapsing accordions "restricting users' ability to combine information from multiple accordions at the same time"; printing requires manual expansion of every panel unless an "Expand all" exists; and fragmented access makes it hard to "connect related information from different sections on the page." Avoid accordions when the audience needs most of the content, when the page is short (accordions "make pages appear empty"), for "deep hierarchical structures with multiple levels," and for continuous reading.

**Source:** Hoa Loranger, "Accordions Are Not Always the Answer for Complex Content on Desktops," NN/g, 18 May 2014. https://www.nngroup.com/articles/accordions-complex-content/

> "Forcing people to click on headings one at a time to display full content can be cumbersome."
> "Hiding content behind navigation diminishes people's awareness of it."
> "Reluctance to scroll is a behavior of the past."

Loranger's eyetracking data shows users put roughly 80% of attention above the fold and 20% below, but "People will see the bottom if you give them good reason to go there." Her rule: use accordions when users need only select pieces, avoid them when users need most or all of the content.

### 3.2 A/B evidence: opened vs. closed accordions

**Source:** RicketyRoo, "We Tested an Accordion UX Change—Here's What Worked," case study, change deployed 24 Sep 2024. https://ricketyroo.com/blog/case-studies/accordion-test-results/

Opening the most-clicked section by default versus all-closed:

| Metric | Closed | Opened |
|---|---|---|
| Scroll depth | 52.59% | 60.33% (+14.71% relative) |
| Dead clicks | 9.26% | 6.97% |
| Quick-backs | 15.79% | 13.22% |
| CTA clicks ("Request quote") | baseline | +66.7% |
| Time on page | 2.0 min | 1.6 min |

A single-site before/after, not a randomised test, so treat as directional. But the direction is consistent with the NN/g findings: "dead clicks" fell because users stopped clicking non-functional headings, and scroll depth rose because users could see there was content worth scrolling to.

### 3.3 Tabs used wrongly

**Source:** Evan Sunwall, "Tabs, Used Right," NN/g, 2 Aug 2024 (reviewed 2 Sep 2026). https://www.nngroup.com/articles/tabs-used-right/

Tabs are appropriate only "When users don't need to simultaneously see information presented under different tabs." Otherwise users must "repeatedly switch between tabs to compare or reference information," which "taxes users' short-term memory, increases cognitive load and interaction cost." Overflowing tab bars become carousels with reduced discoverability, and "Mixing in-page and navigation tabs within one tab control will disorient users."

### 3.4 Settings sprawl and interface bloat

The Jensen Harris account (Section 4) is the canonical case of an interface that had run out of room. The general dynamic is captured in the interface-bloat literature (Wikipedia, "Interface bloat," https://en.wikipedia.org/wiki/Interface_bloat): bloat arises from "pressure to include numerous options to cater to a broader audience"; in B2B SaaS, "catering to each loud customer can pack the interface with seldom-used controls" (Webapper, "SaaS Feature Sprawl," https://www.webapper.com/saas-feature-sprawl-product-bloat/). Progressive disclosure is frequently used as the *coping mechanism* for this — a settings page is where features go to be forgotten — which Harris's own metaphor skewers: "when I was told to clean my room as a kid and I just hid everything under the bed."

**Mitigation (Section 3).**
- Hard cap at two disclosure levels (Nielsen); if a third is needed, the IA is wrong, not the widget.
- Provide "Expand all / Collapse all" and persist open/closed state across visits.
- Never auto-collapse siblings when the task involves comparison.
- Use tabs only for mutually exclusive, non-comparative content; use a single scrolling page for content that is read end-to-end.
- Treat a growing Settings page as a symptom; run a periodic "settings audit" against usage analytics (Section 10) and delete or default what is not used.

---

## 4. Basic/Advanced toggles, expert modes, customization, and adaptive menus

### 4.1 The flexibility–usability tradeoff

**Source:** William Lidwell, Kritina Holden, Jill Butler, *Universal Principles of Design* (Rockport, 2003/2010), "Flexibility-Usability Tradeoff," via O'Reilly chapter page and Wikipedia. https://www.oreilly.com/library/view/universal-principles-of/9781592535873/xhtml/ch45.html ; https://en.wikipedia.org/wiki/Flexibility%E2%80%93usability_tradeoff

"As the flexibility of a system increases, the usability of the system decreases ... Flexible designs are, by definition, more complex than inflexible designs, and as a result are generally more difficult to use." The guidance on when to accept the tradeoff: "If user needs are well understood, designers should bias toward simple less-flexible systems. Otherwise, designers should create flexible designs that support multiple future applications." A Basic/Advanced toggle is an attempt to have both, and the tradeoff does not go away — it moves into the toggle.

### 4.2 Perpetual intermediates: why "expert mode" targets almost nobody

**Source:** Jeff Atwood, "Defending Perpetual Intermediacy," Coding Horror, 5 Oct 2004, quoting Alan Cooper, *The Inmates Are Running the Asylum*. https://blog.codinghorror.com/defending-perpetual-intermediacy/

Cooper: "When people achieve an adequate level of experience and ability, they generally stay there forever." Atwood: "I think intermediate users are the only users that matter"; catering to the small beginner and expert groups "consumes too much time and ultimately makes your application worse at the expense of your core user base."

**Source:** Nielsen, UX Tigers 2026 (cited above).

> "Your expert is a regular user having a rare moment. He or she lives on the bench 80% of the time and visits the drawer for the occasional exotic task."

This is the sharpest formulation of the critique: PD should split *tasks* by frequency, not *people* by skill. A mode toggle assumes a stable population of experts who want everything at once; in practice the same person is an "expert" for ten minutes a month. Mode toggles also create the classic mode errors — the user who cannot find a feature because they are in the wrong mode and have forgotten there is a mode.

### 4.3 Customization: users won't do the work

**Source:** Amy Schade, "Customalization vs. Personalization in the User Experience," NN/g, 10 Jul 2016. https://www.nngroup.com/articles/customization-personalization/

> "Most users are not interested in doing the work required to tweak the user interface to match preferences."
> Customization "imposes higher interaction cost: users must take the time to configure the site."
> "Many users don't know what they actually need."
> Both approaches "should not be used as a fix for a broken site."

Combined with Spool's <5% figure, "let users customize what is primary" is not a mitigation for a bad primary/secondary split; it is an abdication.

### 4.4 Adaptive (personalized) menus: Microsoft's documented failure

**Source:** Jensen Harris, "Combating the Perception of Bloat (Why the UI, Part 3)," Microsoft Office UI blog, 31 Mar 2006. https://learn.microsoft.com/en-us/archive/blogs/jensenh/combating-the-perception-of-bloat-why-the-ui-part-3

Office 2000 introduced "Adaptive Menus" (later "Personalized Menus"): short menus showing popular items, expanding after a delay or a chevron, with items promoted and demoted by usage. Harris's verdict, verbatim:

> "Adaptive Menus were not successful. In my opinion, they actually add complexity to the interface."
> "There was no way to get the default 'short' menu right. Although conventional wisdom holds that 'everyone only uses the same few features in Office,' the reality is that people use an amazingly wide range of functionality. So, one person's ideal default 'short' menu was exactly the wrong thing for someone else."
> "scanning adaptive menus requires two passes: scan the short menu, press the chevron, then back to the top to scan the long menu. Because the secondary menu items could appear between short menu items, the appearance of the long menu caused your scan to reset. As a result, scanning menus took twice as long."
> "Auto-customization, unless it does a perfect job, is usually worse than no customization at all ... What people experienced is a sense randomness and unpredictability: one time, a menu item would be in a certain place, and then two days later it wasn't there anymore."
> "The result: most customers, especially those in corporate environments, turn both of these features off."
> "In the end analysis, we didn't end up making the suitcase any bigger or the zipper any easier to close--we just added more pockets."

**Source:** Jensen Harris, "The End of Personalized Menus," 20 Jan 2006. https://learn.microsoft.com/en-us/archive/blogs/jensenh/the-end-of-personalized-menus — Microsoft "officially flipped the switch to turn off Personalized Menus by default," calling it "an experiment whose time has passed." A commenter's support-desk anecdote captures the operational cost: "'It's the 7th item from the top of the menu.' 'I only have 6 items in that menu...'"

**Lessons.** (1) Frequency-based hiding assumes a shared frequency distribution that does not exist across a large user base; (2) disclosure that changes location destroys spatial memory; (3) a two-stage scan can cost more than a single long scan; (4) the eventual fix (the Ribbon) was *more* visible UI, organised by task, not more hiding.

**Mitigation (Section 4).**
- Do not build Basic/Advanced modes; build one interface with stable secondary disclosure.
- Keep disclosed items in a fixed position; if usage-adaptive, add (e.g., "Recent") rather than reorder or remove.
- Validate the "everyone uses the same few features" assumption per segment with analytics before hiding (Section 10).
- If customization is offered, make the default excellent; expect <5% to touch it.

---

## 5. PD misused to hide bloat or as a dark pattern

### 5.1 Drip pricing and hidden costs

**Source:** Harry Brignull, "Hidden Costs," Deceptive.Design (est. 2010). https://www.deceptive.design/types/hidden-costs

> "Hidden costs involve obscuring or omitting additional fees, charges, or costs until the user is well into the purchasing or sign-up process."

The page cites Blake et al. (2021), "Price Salience and Product Choice," a StubHub field experiment: "users who weren't shown the ticket fees upfront spent about 21% more money and were 14.1% more likely to complete a purchase." That is the commercial incentive for disclosure abuse in one sentence.

**Source:** FTC press release, "Federal Trade Commission Announces Bipartisan Rule Banning Junk Ticket and Hotel Fees," 17 Dec 2024; final rule effective 12 May 2025 (Federal Register, 10 Jan 2025, https://www.federalregister.gov/documents/2025/01/10/2024-30293/trade-regulation-rule-on-unfair-or-deceptive-fees). https://www.ftc.gov/news-events/news/press-releases/2024/12/federal-trade-commission-announces-bipartisan-rule-banning-junk-ticket-hotel-fees

The rule requires businesses to "clearly and conspicuously disclose the true total price inclusive of all mandatory fees whenever they offer, display, or advertise any price," targets "bait-and-switch pricing tactics, such as drip pricing," and the FTC estimates it will "save consumers up to 53 million hours per year of wasted time spent searching for the total price."

**Source:** Reed Smith, "Full price, no surprises: CMA's final price transparency guidance arrives," 18 Dec 2025 (on the UK CMA guidance of 18 Nov 2025 under the DMCC Act 2024). https://www.reedsmith.com/articles/full-price-no-surprises-cma-s-final-price-transparency-guidance-arrives/

"The full price must be provided upfront"; "service fees must always be included in the headline price from the outset"; optional charges "must be disclosed but do not need to be in the total price." Penalties run to "fines of up to 10% of global turnover for the most serious breaches," and the CMA has "opened investigations into eight companies" and sent advisory letters to about 100 more.

### 5.2 Roach motel / hard to cancel

**Source:** Harry Brignull, "Hard to Cancel (aka Roach Motel)," Deceptive.Design. https://www.deceptive.design/types/hard-to-cancel

> "Hard to cancel (aka 'Roach Motel') is a deceptive pattern where it is easy to sign up for a service or subscription, but very difficult to cancel it."

Documented cases include the New York Times (sign-up in seconds, cancellation requiring roughly 8 minutes with an agent), Adobe, Audible, Uber One and others; the page lists ROSCA, GDPR and the UK Consumer Rights Act as applicable law, and enforcement fines including €150m (Google) and €8m (Apple) by the French DPA. Asymmetric disclosure — one click to subscribe, five nested screens to cancel — is progressive disclosure inverted into a weapon.

### 5.3 Consent banners: hiding the "reject" option

**Source:** Midas Nouwens, Ilaria Liccardi, Michael Veale, David Karger, Lalana Kagal, "Dark Patterns after the GDPR: Scraping Consent Pop-ups and Demonstrating their Influence," CHI 2020 (arXiv 8 Jan 2020). https://arxiv.org/abs/2001.02479

> "only 11.8% meet the minimal requirements that we set based on European law"
> "removing the opt-out button from the first page increases consent by 22--23 percentage points"
> "providing more granular controls on the first page decreases consent by 8--20 percentage points"

This is a controlled measurement of how much a *single level* of disclosure shifts a decision. It is also a reminder that any design team that has measured "lift" from moving a control to a second level has, in effect, measured how many users it stopped from making a choice.

### 5.4 The ethical test

Nielsen's 2026 revision makes the boundary explicit: decision-critical information must never be hidden, and he calls out drip pricing by name. The COGA guidance (Section 6) states the user need in first person: information "I need to know and important information stands out, or is the first thing I read and does not get lost in the noise of less important information."

**Mitigation (Section 5).**
- Rule: anything the user needs to make a decision (price, fees, commitment, data use, consequences of an action) is level-1 content by definition.
- Symmetry test: the path to undo/cancel/reject must be no longer than the path to do/subscribe/accept.
- Audit "conversion lifts" from disclosure changes for whether they came from clarity or from suppressed choice.
- Track regulatory exposure: FTC (US), CMA/DMCC (UK), GDPR/ePrivacy (EU) all now treat hidden mandatory information as an enforcement target.

---

## 6. Accessibility failures

### 6.1 Hover- and focus-triggered content

**Source:** W3C, "Understanding Success Criterion 1.4.13: Content on Hover or Focus," WCAG 2.1. https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html

Where hover or focus reveals content, it must be **dismissible** ("without moving pointer hover or keyboard focus"), **hoverable** ("the pointer can be moved over that content without it disappearing"), and **persistent** ("remains visible until the hover or focus trigger is removed, the user dismisses it, or its information is no longer valid"). Rationale: "Particularly for screen magnification users, the portion of the page visible in the viewport can be significantly reduced," so a tooltip that vanishes when the magnified viewport moves is unusable; users with "large pointers" may have the pointer itself obscure the disclosed content.

### 6.2 State and keyboard: the disclosure pattern

**Source:** W3C WAI-ARIA Authoring Practices Guide, "Disclosure (Show/Hide) Pattern." https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/

> "A disclosure is a widget that enables content to be either collapsed (hidden) or expanded (visible)."
> "The element that shows and hides the content has role button."
> "When the content is visible, the element with role `button` has aria-expanded set to `true`. When the content area is hidden, it is set to `false`."
> Keyboard: "Enter: activates the disclosure control and toggles the visibility"; "Space: activates the disclosure control and toggles the visibility."

Common failures against this pattern (mapping to WCAG 4.1.2 Name, Role, Value and 2.1.1 Keyboard): a `<div>` with a click handler (no role, not focusable); missing or static `aria-expanded` so screen-reader users cannot tell whether a section is open; disclosed content inserted far from the trigger in DOM order so focus and reading order diverge; and hover-only triggers with no keyboard equivalent at all.

### 6.3 Cognitive accessibility

**Source:** W3C WAI, "Making Content Usable for People with Cognitive and Learning Disabilities," W3C Group Note, 29 Apr 2021. https://www.w3.org/TR/coga-usable/

Objective 2, "Help Users Find What They Need," includes the patterns "Make it Easy to Find the Most Important Tasks and Features of the Site" and "Make it easy to find the most important actions and information on the page." The stated user need: "reach important information and the controls I need without scrolling or carrying out other actions. They are not hidden or off screen." Objective 1 includes "Make the Relationship Clear Between Controls and the Content They Affect," which is precisely what a badly placed disclosure trigger violates.

**Mitigation (Section 6).**
- Implement disclosure with a real `<button>` (or `<details>/<summary>`), `aria-expanded`, and `aria-controls`; test with keyboard only and with a screen reader.
- Ensure disclosed content is adjacent in DOM order and, for large reveals, move focus into it.
- Never rely on hover; where tooltips exist, satisfy 1.4.13's three conditions.
- For COGA: keep primary tasks and safety-relevant information visible; do not hide error explanations or consequences behind a "more info" toggle.

---

## 7. Find-in-page, SEO, printing, and performance side-effects

**Source:** Joey Arhar, "Make collapsed content searchable with hidden=until-found," Chrome Developers, updated 28 Apr 2022. https://developer.chrome.com/docs/css-ui/hidden-until-found

Standard collapsed content (`display:none`) is invisible to browser find-in-page and cannot be the target of a scroll-to-text fragment. The `hidden=until-found` attribute "applies the `content-visibility:hidden` CSS property instead of the `display:none` property that the regular hidden attribute applies," so Ctrl+F and text-fragment links (including from Google Search) can reveal the section automatically (Chrome 102+, via the `beforematch` event). The article's caveat: content "should remain revealable without find-in-page" for browsers without support.

The NN/g accordion articles (Section 3) cover the printing side-effect: without "Expand all" or print-specific CSS, users must open every panel manually before printing, and collapsed panels are simply absent from the printout.

**Mitigation (Section 7).**
- Use `hidden=until-found` (with feature detection) or `<details>` for collapsed content that carries searchable text.
- Provide `@media print { ... }` rules that expand all disclosures, plus a visible "Expand all."
- Do not lazy-render disclosed content in ways that make it unreachable to search engines or in-app search indexes; in B2B documentation portals, verify that the site search indexes collapsed sections.

---

## 8. Mobile pitfalls: over-collapse and breakpoints

**Source:** Raluca Budiu, "Accordions on Mobile," NN/g, 31 May 2015. https://www.nngroup.com/articles/mobile-accordions/

Budiu is pro-accordion on mobile ("one of the most useful design elements," letting users "get the big picture before focusing on details") while noting "the use of accordions on desktop is debatable." Pitfalls: when an expanded accordion scrolls to the top, users "may believe they've navigated to a new page" and expect Back to close it; "The content under an accordion can be really long," forcing extensive scrolling to find the close control; and labels like "Collapse" confuse non-UX users. Remedies: sticky headers, jump-link behaviour, and Back that collapses rather than exits.

**Source:** Kelley Gordon, "Breakpoints in Responsive Design," NN/g, 5 Apr 2024. https://www.nngroup.com/articles/breakpoints-in-responsive-design/

Describes standard breakpoint behaviour: "the left navigation may collapse under a hamburger icon when transitioning from a medium to small or extra-small breakpoint," and in the Airbnb example "the map was hidden behind a button." The article presents these as normal adaptations; read together with the hamburger study (Section 1), each such collapse should be treated as a measured usage penalty, not a free layout choice. The B2B-specific risk is *disclosure drift*: a feature that is level-1 on desktop becomes level-2 on tablet and level-3 on phone, silently breaching Nielsen's two-level rule on the device where interaction cost is already highest.

**Mitigation (Section 8).**
- Map disclosure depth per breakpoint; anything that becomes level-3 on phone needs a different treatment (bottom bar, sticky action, or a dedicated screen).
- Keep the same *set* of features across breakpoints (content parity); change layout, not availability.
- Follow Budiu's mobile accordion fixes: sticky headers, Back collapses, jump links.

---

## 9. When NOT to use progressive disclosure

### 9.1 Overview-first tasks and data exploration

**Source:** Ben Shneiderman, "The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations," Proc. IEEE Symposium on Visual Languages, 1996, pp. 336–343 (mantra text via InfoVis Wiki; the UMD PDF returned 403 during this pass). https://infovis-wiki.net/wiki/Visual_Information-Seeking_Mantra

> "Overview first, zoom and filter, then details-on-demand."

The mantra is itself a disclosure sequence, but the first word is the point: for analytic tasks the *overview* is primary content, and the user must see the whole dataset before deciding what to drill into. Collapsing the overview to "simplify" a dashboard removes the step that makes the other steps possible. Details-on-demand is a good model for data drill-downs; it is a poor model for removing controls.

### 9.2 Expert, dense, high-tempo tools

**Source:** Matt Ström-Awn, "UI Density." https://mattstromawn.com/writing/ui-density/

Ström-Awn distinguishes visual density, information density (Tufte's data-ink ratio), design density, and **value density** — "The value a user gets from the interface divided by the time and space the interface occupies" — and adds temporal density: how quickly the user can get to what they need. The Bloomberg Terminal is his exemplar because it "loads data almost instantaneously," which is described as its "real superpower." For a trader, clinician, controller, or developer who lives in the tool eight hours a day, every disclosure click is repeated thousands of times; the "interaction tax" Nielsen describes is paid at a rate that dwarfs the learnability benefit. The same logic applies to IDEs, where the design-system trend is toward showing more (inline hints, gutters, lenses) rather than less.

### 9.3 Safety-critical and clinical contexts

**Source:** "Use, Perceived Usability, and Barriers to Implementation of a Patient Safety Dashboard Integrated within a Vendor EHR," PMC6962088 (2019), and "From Data to Decision: Design and Evaluation of a Patient Safety Dashboard," PMC13097191. https://pmc.ncbi.nlm.nih.gov/articles/PMC6962088/

Patient-safety dashboards are built explicitly to bring scattered risk indicators (code status, VTE prophylaxis, opioid management, etc.) to a single glance with traffic-light coding, because information distributed across nested EHR screens was being missed. The clinical decision support literature also documents override rates "above 90%" for alerts, which shows the opposite failure (interruptive over-disclosure). The lesson for both extremes: safety-relevant state must be persistently visible and glanceable; neither buried nor modal.

### 9.4 Comparison tasks

Covered by NN/g's tabs and accordion guidance (Section 3): whenever the task is "compare A to B," any pattern that shows A *or* B forces the user to hold one in working memory. Side-by-side, fully expanded views win.

### 9.5 Intermediates, not experts, are the audience

Cooper/Atwood (Section 4) close the loop: expert-centric tools deserve "entirely separate design approaches rather than compromising mainstream applications." If your B2B product genuinely serves full-time specialists, design a dense, stable, keyboard-first interface for them; do not bolt an "expert mode" onto a consumer-style disclosure hierarchy.

**Mitigation (Section 9).**
- Classify each screen by task type: learn/configure (PD appropriate), monitor/operate (persistent visibility), analyse/compare (overview first, side-by-side).
- For daily-use professional tools, optimise value density and temporal density; expose, don't hide.
- Never disclose safety or decision-critical state on demand; surface it by default.

---

## 10. Measurement and validation

### 10.1 Verifying the 80/20 assumption with analytics

**Source:** Pendo, "Why feature adoption may be your biggest weakness—or strength," 1 Jul 2024; and Pendo, "Pendo Data Suggests $29.5 Billion in Global Cloud R&D Investment Squandered When Software Features Go Unused," 5 Feb 2019 (2019 Feature Adoption Report, 615 subscriptions). https://www.pendo.io/pendo-blog/feature-adoption-benchmarking/ ; https://www.pendo.io/pendo-blog/pendo-data-suggests-29-5-billion-global-cloud-rd-investment-squandered-software-features-go-unused/

> "6% of product features are generating 80% of clicks for the average product."
> "almost 94% of features are untouched and ignored."
> Top-decile products concentrate usage across 15.6% of features, "2.5x higher than average."
> Public cloud software companies "collectively invested up to $29.5 billion in R&D costs associated with these unadopted or underutilized features."

Two cautions. First, the benchmark is far more skewed than "80/20": a level-1 surface sized to the empirical head of the distribution is small. Second, the Harris finding warns that the *aggregate* head is not the same as any *individual's* head — segment by role and account before deciding what to hide. Practical test: for each candidate secondary feature, compute the share of active users (per segment) who use it weekly; if it clears a threshold you choose (e.g., 20% weekly), it is primary for that segment.

### 10.2 Funnel drop-off in wizards

Staged disclosure (wizards) should be instrumented as an event funnel (Pendo Funnels & Journeys, Amplitude funnels). The metrics that matter: step-level abandonment, backtracking rate between steps (Nielsen's "interdependent steps" warning becomes visible as step 3 -> step 2 traffic), and time per step. A high backtrack rate is the signature of information split across steps that users need together.

### 10.3 Findability of the IA: tree testing and first-click

**Source:** Page Laubheimer, "Tree Testing: Fast, Iterative Evaluation of Menu Labels and Categories," NN/g, 6 Aug 2023 (reviewed 19 Aug 2026). https://www.nngroup.com/articles/tree-testing/

Tree testing is "an evaluation of a hierarchical category structure, or tree, by having users find the locations in the tree where specific resources or features can be found." It yields findability (success), **directness** (did the user go straight there or click around first — the confidence proxy Porter argued for), and time. Card sorting is generative (which items belong together); tree testing is evaluative (can people find item X in the proposed structure). Use card sorting to propose a primary/secondary split and tree testing to validate it before build.

**Source:** Bob Bailey & Cari Wolfson first-click studies (2006–2009), as summarised by Lyssna and UXtweak; and Sauro, Schiavone, Du & Lewis, "Do Click Tests Predict Live Site Clicks?," MeasuringU, 21 Mar 2023. https://www.lyssna.com/en/guides/first-click-testing/ ; https://measuringu.com/do-click-tests-predict-live-site-clicks/

When users get the first click right, roughly **87%** complete the task, versus about **46%** when the first click is wrong (secondary summary; original Bailey/Wolfson report not fetched). MeasuringU found first clicks on static prototypes differ from live-site first clicks by only "about 6%" on average across hotspot regions, with the largest gaps caused by "dynamic UI elements (hover menus, responsive design shifts)" — which is to say, by disclosure that the static prototype did not show.

### 10.4 Task metrics and standardised questionnaires

**Source:** Jeff Sauro / MeasuringU, "Measuring Usability: From the SUS to the UMUX-Lite." https://measuringu.com/umux-lite/

SUS averages **68** across Sauro and Lewis's database of 500+ studies; UMUX-Lite (two items) predicts SUS closely and is cheap enough to run per release. For PD decisions, pair a questionnaire with the behavioural measures: task success, time on task, and a self-reported difficulty rating (the NN/g hamburger study used a 1–7 difficulty scale and detected a 21% difference).

### 10.5 A/B testing disclosure variants

Test open-by-default vs. closed, visible vs. hidden navigation, and single-page vs. wizard, with primary metrics of task completion and secondary metrics of dead clicks, rage clicks, scroll depth and quick-backs (Hotjar/Microsoft Clarity-style behavioural signals; the RicketyRoo case in Section 3 used exactly these). Prototype-level tests (Maze, Lyssna, UserZoom) can run tree and first-click studies before code exists.

### 10.6 A validation checklist for any disclosure decision

1. Card sort or top-tasks survey to propose the split.
2. Tree test the proposed IA. *(Corrected 14 Sep 2026: see sweep 11.)* Benchmark against the real-world distribution, not against a target: Albert and Tullis' review of **98 tree-testing studies** gives a **median task success of 62%, interquartile range 37–83%**, with the rubric Poor <40 / Fair 41–60 / Good 61–80 / Very Good 80–90 / Excellent >90, and 50+ participants per tree for narrow confidence intervals (via NN/g, 2024). The old "70–80%" figure was set without evidence and sits above the industry norm; it is an aspiration, and must be labelled as one if it is used. Directness is defined everywhere and benchmarked nowhere, so read it as a diagnostic — high success with low directness means people knew what they wanted and could not find it easily.
3. First-click test the level-1 screen.
4. Instrument every disclosure trigger (open rate, time-to-first-open, per-segment).
5. Post-launch: feature-adoption per segment; flag any level-2 feature with >20% weekly use as "disclosure debt."
6. Wizard funnels: step abandonment and backtracking.
7. Quarterly SUS/UMUX-Lite plus task-success benchmarking.
8. Accessibility audit of the disclosure components (Section 6).

---

## 11. Organizational and political pitfalls

### 11.1 Top Tasks: the evidence that organisations promote the wrong things

**Source:** Gerry McGovern, "Top Tasks Management," gerrymcgovern.com, 21 Apr 2015; and "What Really Matters: Focusing on Top Tasks," A List Apart. https://gerrymcgovern.com/top-tasks/ ; https://alistapart.com/article/what-really-matters-focusing-on-top-tasks/

McGovern's method: gather every candidate task across the organisation, shortlist collaboratively, survey representative customers to vote, and rank. The recurring shape of results is a "long neck": at Cisco, **three tasks captured 25% of votes**, six tasks 25–50%, and **44 tasks together only 25%**; the top task ("Download software") received as many votes as the bottom 23 combined. His diagnosis of why organisations expose the tail:

> "Often, the more important the task is to the customer, the less content is being produced for it; the less important the task is to the customer, the more content is being produced."
> "tiny tasks are full of organizational ego."
> "Tiny tasks are a nightmare for web teams... many a web professional has found themselves nibbled to death."

The value of Top Tasks for PD is that it converts "which features are primary?" from a negotiation into a measured league table with a customer vote behind it — which is what a designer needs when a VP demands that their feature be on the home screen.

### 11.2 Sales-driven exposure and "one yes at a time"

Harris's Office history is also an organisational story: the team was forbidden to change the top-level menu structure (unchanged since 1989) because "an unchanged UI meant virtually no retraining costs," so every new feature had to be squeezed into existing containers — the origin of adaptive menus. In B2B, the analogous constraint is the enterprise customer who paid for a feature and expects to see it. The feature-sprawl literature summarises the dynamic: "No one decides to build a bloated product—you get there one 'yes' at a time" (Webapper, cited above).

### 11.3 Prioritisation frameworks for the split

**Source:** Sean McBride, "RICE: Simple prioritization for product managers," Intercom. https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/

RICE scores initiatives as (Reach x Impact x Confidence) / Effort. For disclosure decisions, Reach is the useful term: it forces a number on "how many users will encounter this per period," which is the same quantity the 80/20 test needs. Combined with Kano classification (must-be vs. attractive vs. indifferent) and jobs-to-be-done interviews, it gives a defensible, non-political basis for what is level 1. But note the limitation that McBride's own framing implies: RICE was built to compare ideas against "a single conversion goal," so it should complement, not replace, Top Tasks and usage analytics.

**Mitigation (Section 11).**
- Run a Top Tasks vote annually; publish the league table internally and tie level-1 real estate to it.
- Require a Reach number (measured, not estimated) for any request to promote a feature to level 1.
- Give stakeholders an alternative to "primary or nothing": contextual entry points, onboarding, in-app announcements — visibility without permanent screen cost.
- Track and report "disclosure debt" (Section 10.6) so demotion of unused features is a routine metric-driven act, not a political one.

---

## Synthesis

Progressive disclosure is not wrong; it is conditional, and most failures come from ignoring the conditions Nielsen set in 2006 and reiterated in 2026: get the primary/secondary split right, stop at two levels, and make the path between levels obvious. The research assembled here quantifies what happens when those conditions are violated. Hiding navigation cuts its use by roughly half on desktop and lowers task success by more than 20 points (Pernice & Budiu). Unlabelled icons can drop to zero click-through (Harley). Fewer than 5% of users ever open a settings screen (Spool). Roughly 6% of features receive 80% of clicks (Pendo), which means the head of the distribution is small enough to show — but Microsoft's adaptive-menu experiment shows that the aggregate head is not any individual's head, and that hiding based on averaged frequency produces an interface that is "exactly the wrong thing for someone else" (Harris).

Three critiques deserve particular weight in complex B2B software. First, **the click-count framing is a trap in both directions**: Porter and Laubheimer show that clicks do not predict abandonment or satisfaction, so neither "too many clicks" nor "we saved a click" is evidence. What predicts success is information scent at each step and the user's confidence, which tree testing and first-click testing measure directly. Second, **task frequency, not user skill, is the right axis**. Basic/Advanced modes, expert modes, and user customization all assume a stable population of experts who will do configuration work; Cooper's perpetual intermediates and Nielsen's "expert is a regular user having a rare moment" both argue that population barely exists. Third, **the same mechanism that reduces cognitive load can suppress choice**. Nouwens et al. measured a 22–23 point swing in consent from moving one button to a second level; Blake et al. measured 21% more spend from deferring fees. Regulators (FTC, CMA, EU DPAs) now treat that as an enforcement target, so any "conversion lift" from deeper disclosure needs an ethical audit before it is celebrated.

The accessibility and technical side-effects are less dramatic but more certain: hover-only reveals fail WCAG 1.4.13, unlabelled toggles fail 4.1.2, `display:none` content is invisible to Ctrl+F and print, and COGA guidance asks that important information "not get lost in the noise." All are cheaply fixable with a real button, `aria-expanded`, `hidden=until-found`, and print CSS.

Finally, the strongest antidote to political misuse is measurement that stakeholders cannot argue with. McGovern's Top Tasks vote and Pendo-style per-segment feature adoption convert "whose feature is primary?" into a league table, tree testing validates the resulting hierarchy before build, and a standing "disclosure debt" report makes demoting unused features routine. Where the product is a full-time professional tool — trading, clinical, operations, IDEs — the honest conclusion is that value density and temporal density matter more than learnability, and progressive disclosure should give way to dense, stable, keyboard-first design.

---

## Bibliography

1. Nielsen, J. "Progressive Disclosure." NN/g, 3 Dec 2006. https://www.nngroup.com/articles/progressive-disclosure/
2. Nielsen, J. "Progressive Disclosure: From Training Wheels to Week-Long AI Agents." UX Tigers, 9 Jul 2026. https://www.uxtigers.com/post/progressive-disclosure
3. Pernice, K. & Budiu, R. "Hamburger Menus and Hidden Navigation Hurt UX Metrics." NN/g, 26 Jun 2016. https://www.nngroup.com/articles/hamburger-menus/
4. Harley, A. "Icon Usability." NN/g, 27 Jul 2014. https://www.nngroup.com/articles/icon-usability/
5. Harley, A. "Timing Guidelines for Exposing Hidden Content." NN/g, 11 Jan 2015. https://www.nngroup.com/articles/timing-exposing-content/
6. Spool, J. "Do users change their settings?" UIE Brainsparks, 14 Sep 2011. https://archive.uie.com/brainsparks/2011/09/14/do-users-change-their-settings/
7. Porter, J. "Testing the Three-Click Rule." UIE / Center Centre, 16 Apr 2003. https://articles.centercentre.com/three_click_rule/
8. Laubheimer, P. "The 3-Click Rule for Navigation Is False." NN/g, 11 Aug 2019. https://www.nngroup.com/articles/3-click-rule/
9. Budiu, R. "Interaction Cost." NN/g, 31 Aug 2013 (rev. 2024). https://www.nngroup.com/articles/interaction-cost-definition/
10. Wang, H.-H. "Accordions on Desktop: When and How to Use Them." NN/g, 30 Jul 2023. https://www.nngroup.com/articles/accordions-on-desktop/
11. Loranger, H. "Accordions Are Not Always the Answer for Complex Content on Desktops." NN/g, 18 May 2014. https://www.nngroup.com/articles/accordions-complex-content/
12. Sunwall, E. "Tabs, Used Right." NN/g, 2 Aug 2024 (rev. 2026). https://www.nngroup.com/articles/tabs-used-right/
13. RicketyRoo. "We Tested an Accordion UX Change—Here's What Worked." 2024. https://ricketyroo.com/blog/case-studies/accordion-test-results/
14. Lidwell, W., Holden, K., Butler, J. *Universal Principles of Design*, "Flexibility-Usability Tradeoff." Rockport, 2003/2010. https://www.oreilly.com/library/view/universal-principles-of/9781592535873/xhtml/ch45.html ; https://en.wikipedia.org/wiki/Flexibility%E2%80%93usability_tradeoff
15. Atwood, J. "Defending Perpetual Intermediacy." Coding Horror, 5 Oct 2004 (quoting Cooper). https://blog.codinghorror.com/defending-perpetual-intermediacy/
16. Schade, A. "Customization vs. Personalization in the User Experience." NN/g, 10 Jul 2016. https://www.nngroup.com/articles/customization-personalization/
17. Harris, J. "Combating the Perception of Bloat (Why the UI, Part 3)." Microsoft, 31 Mar 2006. https://learn.microsoft.com/en-us/archive/blogs/jensenh/combating-the-perception-of-bloat-why-the-ui-part-3
18. Harris, J. "The End of Personalized Menus." Microsoft, 20 Jan 2006. https://learn.microsoft.com/en-us/archive/blogs/jensenh/the-end-of-personalized-menus
19. Brignull, H. "Hidden Costs." Deceptive.Design. https://www.deceptive.design/types/hidden-costs
20. Brignull, H. "Hard to Cancel (aka Roach Motel)." Deceptive.Design. https://www.deceptive.design/types/hard-to-cancel
21. FTC. "Federal Trade Commission Announces Bipartisan Rule Banning Junk Ticket and Hotel Fees." 17 Dec 2024. https://www.ftc.gov/news-events/news/press-releases/2024/12/federal-trade-commission-announces-bipartisan-rule-banning-junk-ticket-hotel-fees ; Federal Register, 10 Jan 2025. https://www.federalregister.gov/documents/2025/01/10/2024-30293/trade-regulation-rule-on-unfair-or-deceptive-fees
22. Gates, T. & Lysik, A. "Full price, no surprises: CMA's final price transparency guidance arrives." Reed Smith, 18 Dec 2025. https://www.reedsmith.com/articles/full-price-no-surprises-cma-s-final-price-transparency-guidance-arrives/
23. Nouwens, M., Liccardi, I., Veale, M., Karger, D., Kagal, L. "Dark Patterns after the GDPR." CHI 2020 / arXiv 2001.02479. https://arxiv.org/abs/2001.02479
24. W3C. "Understanding SC 1.4.13: Content on Hover or Focus." WCAG 2.1. https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html
25. W3C WAI. "Disclosure (Show/Hide) Pattern." ARIA Authoring Practices Guide. https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
26. W3C WAI. "Making Content Usable for People with Cognitive and Learning Disabilities." Group Note, 29 Apr 2021. https://www.w3.org/TR/coga-usable/
27. Arhar, J. "Make collapsed content searchable with hidden=until-found." Chrome Developers, 28 Apr 2022. https://developer.chrome.com/docs/css-ui/hidden-until-found
28. Budiu, R. "Accordions on Mobile." NN/g, 31 May 2015. https://www.nngroup.com/articles/mobile-accordions/
29. Gordon, K. "Breakpoints in Responsive Design." NN/g, 5 Apr 2024. https://www.nngroup.com/articles/breakpoints-in-responsive-design/
30. Shneiderman, B. "The Eyes Have It." Proc. IEEE Symp. Visual Languages, 1996 (via InfoVis Wiki). https://infovis-wiki.net/wiki/Visual_Information-Seeking_Mantra
31. Ström-Awn, M. "UI Density." https://mattstromawn.com/writing/ui-density/
32. "Use, Perceived Usability, and Barriers to Implementation of a Patient Safety Dashboard Integrated within a Vendor EHR." PMC6962088. https://pmc.ncbi.nlm.nih.gov/articles/PMC6962088/
33. Pendo. "Why feature adoption may be your biggest weakness—or strength." 1 Jul 2024. https://www.pendo.io/pendo-blog/feature-adoption-benchmarking/
34. Pendo. "Pendo Data Suggests $29.5 Billion in Global Cloud R&D Investment Squandered..." 5 Feb 2019. https://www.pendo.io/pendo-blog/pendo-data-suggests-29-5-billion-global-cloud-rd-investment-squandered-software-features-go-unused/
35. Laubheimer, P. "Tree Testing." NN/g, 6 Aug 2023 (rev. 2026). https://www.nngroup.com/articles/tree-testing/
36. Lyssna. "First Click Testing Guide" (summarising Bailey & Wolfson). https://www.lyssna.com/en/guides/first-click-testing/
37. Sauro, J., Schiavone, W., Du, D., Lewis, J. "Do Click Tests Predict Live Site Clicks?" MeasuringU, 21 Mar 2023. https://measuringu.com/do-click-tests-predict-live-site-clicks/
38. Sauro, J. "Measuring Usability: From the SUS to the UMUX-Lite." MeasuringU. https://measuringu.com/umux-lite/
39. McGovern, G. "Top Tasks Management." 21 Apr 2015. https://gerrymcgovern.com/top-tasks/
40. McGovern, G. "What Really Matters: Focusing on Top Tasks." A List Apart. https://alistapart.com/article/what-really-matters-focusing-on-top-tasks/
41. McBride, S. "RICE: Simple prioritization for product managers." Intercom. https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/
42. Webapper. "SaaS Feature Sprawl." https://www.webapper.com/saas-feature-sprawl-product-bloat/ ; Wikipedia, "Interface bloat." https://en.wikipedia.org/wiki/Interface_bloat

*Not retrieved (403/404 during this pass, findings taken from secondary summaries): Shneiderman 1996 PDF at cs.umd.edu; ACM full-text of Nouwens et al. (arXiv version used instead); NN/g first-click-testing article (Lyssna and MeasuringU used instead).*
