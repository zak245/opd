# 26. Action hierarchy and consequence text

*What seven design systems, NN/g and the measurement literature say about button hierarchy, destructive actions, and the text around controls. No design proposed here. Compiled 21 September 2026.*

**Tiers.** Tier 1 = peer-reviewed, or a study with published sample and method. Tier 2 = first-party design-system documentation. Tier 3 = practitioner writing, including NN/g articles that report no method.

**Not fetched.** `m3.material.io` is JavaScript-only and returns nothing to a fetch, including via Wayback, so Material is quoted from the archived Material Design site (9 Dec 2018) and Google's Compose docs; **Material 3's own wording on primary-button count is not in evidence**. Atlassian renders client-side and reached me via a summarising fetcher, so only sentences it returned in quotation marks are treated as verbatim, marked *(via fetcher)*. Akhawe & Felt (2013) is a PDF, cited by abstract. URLs fetched 21 Sep 2026.

---

## Part A. Action hierarchy

**How many primaries.** Six of seven say one. Carbon: "Each page should have only one primary button," excepting "the application header, modal dialog, or side panel." Fluent 2: "Only use one primary button in a layout." Atlassian *(via fetcher)*: "Only include one primary button or call to action (CTA) in a page or area," since multiple CTAs "compete for attention." Polaris: primary is "High emphasis button for the primary action on the page. Should be used sparingly." Material (2018 archive): "A layout should contain a single prominent button that makes it clear that other buttons have less importance."

Apple is looser: "Keep the number of prominent buttons to one or two per view." Pajamas rejects the per-screen frame: "a settings page may have multiple equally important contexts, each requiring its own primary button … contexts may be temporary, such as a modal." Carbon gets there by exception — over a page that already has one, "Temporarily, there may be two primary buttons" — and alone states the null case: a reading page should "use tertiary and ghost buttons."

**How the tiers are drawn.** Emphasis rides on fill and saturation, never size. Apple: "Use style — not size — to visually distinguish the preferred choice"; Carbon forbids mixing button sizes inside a group. The M3 ladder (Compose docs) ranks filled "High-emphasis … for primary actions" above outlined "Medium-emphasis … secondary actions like 'Cancel'" above text "Low-emphasis … navigational links." Carbon warns tier two is too heavy to default to: secondary buttons "are still tonally heavy" and must not be used "in isolation or for a positive/primary action." Fluent's flattening rule: "If there are more than two buttons with equal priority, all buttons should have neutral backgrounds."

**Where they sit.** Carbon: "on full-page designs, the primary button is on the left side of the page … Whereas in wizards … the primary action traditionally sits at the bottom right" — a rule it reversed after research. Pajamas splits identically: left for page content and forms, where "an F-pattern … is common for reading flow" and "page zoom" can push right-aligned buttons off screen; right for "constrained containers like modals and dialogs" and toolbars. Atlassian *(via fetcher)*: "the primary button placement should match the alignment of the button group." Pajamas on order: "Affirmative actions are positioned to the outer edge of a container." Apple, in alerts, puts the likely choice "on the trailing side in a row," Cancel leading. Nielsen (2008, tier 3, no study) recommends the opposite for web apps — OK first, because "Windows generally has many more users."

**Navigation versus action.** Unanimous, and a rule about the element, not the styling. Carbon: "Do not use buttons as navigational elements. Instead, use links when the desired action is to take the user to a new page." Fluent: "For navigating to another place, try a link instead." Atlassian *(via fetcher)*: "don't use a `<button>` in place of a link (`<a>`)." Pajamas adds that a link "can also be styled like a button when actions and destinations are present in the same set of controls." Material is the wrinkle: it puts navigational links at the bottom of the emphasis ladder, not outside it.

**Full width, and groups in panels and drawers.** Only Carbon has depth. Full-span is listed against "Dialogs, side panel, and small tiles"; "fluid buttons are never left-aligned … they're either right-aligned or span the full width of the container"; "Do not use a tertiary button in a fluid arrangement"; stacked in a panel, "the primary button is always on top." A full-width ghost button is "only recommended when the containers are smaller in size such as a side panel of 480px (medium) and below" — the sweep's only numeric threshold. Groups hold "two or three actions … Any more than three should be grouped meaningfully using menu buttons," with matching widths and never two high-emphasis buttons. Pajamas only notes that a block button "fill[s] the parent container."

---

## Part B. Destructive and irreversible actions

**How they are drawn.** Carbon offers three danger styles: "Destructive actions that are a required or primary step in a workflow should use the primary danger button style," but where the action is "just one of several … a lower emphasis style like the tertiary danger button or the ghost danger button may be more appropriate." And: "Do not use a danger button in an icon only form."

Pajamas adds a density rule nobody else has: "Too many danger actions in a single view can flip the intended hierarchy … it may be better to use the default variant." But: "Any final confirmation that is destructive must use the danger variant." Polaris gates on reversibility: "Use critical tone only for destructive actions that are difficult or impossible to undo." Apple forbids what Carbon permits: "Don't assign the primary role to a button that performs a destructive action, even if that action is the most likely choice. Because of its visual prominence, people sometimes choose a primary button without reading it first."

Fluent 2's React Button page lists five appearances — primary, secondary, outline, subtle, transparent — and **no** danger or destructive one: the largest gap in this sweep. On separation, Pajamas: "Don't group destructive buttons with confirmation buttons"; Laubheimer (NN/g 2021, tier 3): "Avoid placing highly consequential actions directly next to options that are benign."

**When to confirm, when to prefer undo.** Shneiderman's rule 6: "As much as possible, actions should be reversible. This feature relieves anxiety, since users know that errors can be undone." Nielsen's heuristic #3, via Rosala: users need "a clearly marked 'emergency exit' … Support undo and redo."

Nielsen (2018): "Use a confirmation dialog before committing to actions with serious consequences — such as destroying users' work or costing large amounts of money," but "Do not use confirmation dialogs for routine actions," because "If you cry wolf too many times, people will stop paying attention." Undo is the backstop, not the substitute: "provide undo, because some user errors will remain despite even the best of confirmation dialogs." Apple gates on reversibility: "Avoid displaying alerts for common, undoable actions, even when they're destructive … when people take an uncommon destructive action that they can't undo, it's important to display an alert."

Pajamas gives the only graduated ladder. High: "If a destructive action is difficult to undo or data will be lost permanently, strongly consider implementing a modal," and "Require input confirmation of the deleted object's name when the action removes additional resources within." Medium: "put the action within a dropdown requiring a minimum of two clicks." Low: "Consider adding no friction at all." It defends friction, which "can be useful to prevent a user from completing a destructive action when the consequences may be unknown."

**Measured evidence.** Akhawe & Felt (USENIX Security 2013, tier 1, *abstract only*) observed "over 25 million warning impressions"; dismissal ran from a tenth of Firefox malware warnings to 70.2% of Chrome SSL warnings, and warnings "can be effective in practice," varying by design. Kirwan et al. (*Frontiers in Psychology*, 7 Dec 2020, tier 1, n=22, fMRI) found "widespread linear decreases in activation with repeated exposures": habituation deepened across all six repetitions, and warnings habituated much like neutral images.

Cutting the other way, Chen et al. (arXiv 2602.18834, 21 Feb 2026, *preprint*) — the only study found measuring confirm-versus-no-confirm directly: "participants preferred Frictionless Mode and perceived better performance (N=109), objective performance was worse without confirmation … (Wave 2: win rate -11.8%, p=0.044; move quality -0.051, p=0.022)," while cancelled submissions suggested "confirmation can enable pre-submission self-correction (N=66, p=0.005)."

**Where the explanation belongs.** Inside the confirmation, preferably in the button labels. Nielsen: "Be specific and inform users about the consequence of their action," because asked "'Are you sure you want to do this?' without further details, the only sensible reaction is 'of course I want to do the thing I just told you to do,' and hit Yes." The remedy: "provide response options that summarize what will happen for each possible response."

Apple pushes consequence into the label: "A specific button title like 'Erase,' 'Convert,' 'Clear,' or 'Delete' helps people understand the action they're taking," and "Avoid explaining alert buttons." It reserves the destructive style for "a destructive action people didn't deliberately choose," and against habituation advises avoiding "making any button the default."

Pajamas' worked example is the fullest specimen: title "Confirm project deletion"; body listing what will be lost ("40 issues, 16 merge requests…") in "danger feedback design tokens"; a typed field, "Enter the following to confirm:"; the recovery window beneath it ("This project can be restored until 2025-11-28"); buttons "Yes, delete project" and "Cancel, keep project." At the trigger: "always indicate what is being destroyed … use Delete page instead of just Delete." Harley (2019) adds that Cancel must be distinguished from Close, since the ambiguous X loses work.

---

## Part C. Text under and around controls

**The reading research.** Nielsen (1997, tier 1 method, no n published): "79 percent of our test users always scanned any new page they came across; only 16 percent read word-by-word." The same piece reports a measured rewrite against a promotional control: concise text scored 58% better on usability, scannable layout 47%, objective language 27%, all three together 124%.

Nielsen (2008), reporting Weinreich et al. — 25 instrumented users, 45,237 cleaned page views — models page time as "about 25 seconds, plus an additional 4.4 seconds per 100 words." Hence "users have time to read at most 28% of the words during an average visit; 20% is more likely"; "Users read half the information only on those pages with 111 words or less"; and of added copy, "customers will read 18%." **Text you add is read at roughly one-fifth** — the empirical floor under every "keep it short" rule the systems assert.

Nielsen (2006, eyetracking, "232 users looked at thousands of Web pages") described the F: a horizontal sweep "across the upper part of the content area," a shorter second sweep, then a vertical scan of the left edge. Hence "The first two paragraphs must state the most important information" and "Start subheads, paragraphs, and bullet points with information-carrying words." Pernice's 2017 revision names five rivals — layer-cake, spotted, marking, bypassing, commitment — and calls the F a failure mode: "users may skip important content simply because it appears on the right side of the page."

**What the systems say.** Carbon is most specific: helper text "assists the user in correctly completing a field … often used to explain the correct data format," and "appears persistently underneath the field, except when an error or warning message replaces it." Placeholder "should not be used as a replacement for a persistent label nor should it contain crucial information," and "can be harmful." Atlassian *(via fetcher)*: helper text clarifies "the input and helps people fill in the field"; and, rather than disable a control, "describe what needs to be done with clear instructions and validation and error messages." Pajamas agrees: "Avoid a disabled button."

**No system found gives a word or character limit for helper text.** The nearest is Apple on alert body copy: "Include informative text only if it adds value … keep it as short as possible." On labels they converge: Carbon prescribes "the {verb} + {noun} content formula … except in the case of common actions like 'Done', 'Close', 'Cancel', 'Add', or 'Delete'"; Fluent, "Be brief, usually a single verb is best."

**Measured effect of text near a control.** One study only: Wroblewski with Etre (2009; 22 users; six form variations; control validated on submit). The best inline version gave a "22% increase in success rates," a "22% decrease in errors made," a "31% increase in satisfaction rating," a "42% decrease in completion times" and a "47% decrease in the number of eye fixations." Timing mattered more: validating *after* the user left a field performed best; feedback *while* typing was slower, as users paused to watch the message; *before and while* performed worst. The rule: "Use inline validation when answers aren't obvious." Nothing equivalent has been measured for text under a *button*.

---

## Part D. Summary

### What the sources agree on

1. One high-emphasis action per surface (Apple: one or two); primaries compete for attention.
2. Emphasis comes from fill and saturation, never size; three or more comparable actions all drop to low emphasis.
3. A destination is a link, a state change is a button — a rule about the element, not the styling.
4. The affirmative action sits at the container's outer edge; alignment follows the container — left for page content and forms, right for modals, wizards and toolbars.
5. Confirmation is gated on reversibility, not destructiveness; Apple's case is *not* confirming a deleted email.
6. Routine confirmations destroy their own power ("cry wolf"; the habituation literature).
7. Undo is the backstop, not the substitute — required *in addition to* the best confirmation.
8. Consequences belong in the confirmation, preferably in the button labels: name the outcome ("Delete page"), never "OK."
9. Destructive and benign controls are separated by space and redundant visual signals.
10. Added prose is read at roughly one-fifth; 79% of users scan rather than read.
11. Helper text is persistent and sits below the control; placeholder text is no substitute and is called harmful.

### Where they disagree

- **Scope of "one primary."** Carbon counts per screen with named exceptions; Pajamas counts per *context*, allowing several per page; Apple allows two per view.
- **Dialog button order.** Carbon, Pajamas and Apple put the affirmative on the trailing edge; Nielsen (2008) recommends OK *first* for web apps. Windows and Apple conventions are opposite.
- **Whether a destructive action may be the primary.** Apple forbids it; Carbon ships a "primary danger" style and Pajamas mandates the danger variant on any final destructive confirmation.
- **Whether destructive always needs a danger style.** Pajamas exempts low-severity actions; Polaris gates critical tone on irreversibility; Carbon offers no exemption.
- **Whether friction is a cost or a benefit.** The systems and NN/g treat confirmation as a tax; Pajamas frames it as a feature; Chen et al. measured people doing worse without it while preferring its removal.
- **Whether "destructive" is an available emphasis at all.** Fluent 2 documents none, against six that do.
- **The F-pattern.** Pajamas cites it to justify left-aligned buttons; NN/g's own 2017 revision demotes it to one of six patterns and calls it a failure mode.

### Still unknown

- Whether persistent helper text *under a button* changes task success, error rate or hesitation; the only measured text-near-control evidence concerns form fields (Wroblewski, n=22).
- Confirm-dialog habituation in a productivity application; the evidence is all from security warnings, where false alarms are commoner.
- Typed-name confirmation against a plain confirm button — near-universal in practice, unmeasured; likewise undo-with-toast against confirm-then-act, since Chen et al. compares confirmation against *nothing*.
- Any published length limit for helper text, from a system or a study; and Material 3's current wording, since its site cannot be fetched without a browser.
- Evidence for "one primary per screen" itself: none of the seven systems cites a study for it.

---

## Bibliography

**Tier 1 — peer-reviewed, or published method and sample**

- Akhawe & Felt (2013), "Alice in Warningland," USENIX Security 13 — https://www.usenix.org/conference/usenixsecurity13/technical-sessions/presentation/akhawe (*abstract only*)
- Chen et al. (2026), "When Friction Helps," arXiv:2602.18834, 21 Feb 2026 — https://arxiv.org/abs/2602.18834 (*preprint*)
- Kirwan et al. (2020), *Frontiers in Psychology*, 7 Dec 2020, n=22, fMRI — https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2020.528079/full
- Nielsen (1997), "How Users Read on the Web," 30 Sep 1997 — https://www.nngroup.com/articles/how-users-read-on-the-web/
- Nielsen (2006), "F-Shaped Pattern For Reading Web Content," 16 Apr 2006 — https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/
- Nielsen (2008), "How Little Do Users Read?", 5 May 2008, after Weinreich et al. — https://www.nngroup.com/articles/how-little-do-users-read/
- Shneiderman et al. (2016), *Designing the User Interface*, 6th ed. — https://www.cs.umd.edu/users/ben/goldenrules.html
- Wroblewski with Etre (2009), "Inline Validation in Web Forms," *A List Apart*, 1 Sep 2009, n=22 — https://alistapart.com/article/inline-validation-in-web-forms/

**Tier 2 — first-party design-system documentation (fetched 21 Sep 2026)**

- Apple HIG, "Buttons" · "Alerts" — https://developer.apple.com/design/human-interface-guidelines/buttons · https://developer.apple.com/design/human-interface-guidelines/alerts
- Atlassian, "Button" · "Form" (*client-rendered; via fetcher*) — https://atlassian.design/components/button/usage · https://atlassian.design/components/form/usage
- Google, Material Design "Buttons," Wayback snapshot 9 Dec 2018 — https://web.archive.org/web/20181209153816/https://material.io/design/components/buttons.html
- Google, "Button" (Compose, Material 3) — https://developer.android.com/develop/ui/compose/components/button
- Google, Material Design 3 "Buttons" — https://m3.material.io/components/buttons/guidelines (*not fetchable*)
- IBM Carbon, "Button" · "Text input" — https://carbondesignsystem.com/components/button/usage/ · https://carbondesignsystem.com/components/text-input/usage/
- Microsoft Fluent 2, "React Button" — https://fluent2.microsoft.design/components/web/react/core/button/usage
- GitLab Pajamas, "Button" · "Destructive actions" (updated 13 Jul 2026) — https://design.gitlab.com/components/button/ · https://design.gitlab.com/patterns/destructive-actions/
- Shopify Polaris, "Button" — https://shopify.dev/docs/api/app-home/polaris-web-components/actions/button

**Tier 3 — practitioner**

- Harley (2019), "Cancel vs Close," NN/g, 1 Sep 2019 — https://www.nngroup.com/articles/cancel-vs-close/
- Laubheimer (2015), "Preventing User Errors," NN/g, 7 Sep 2015 — https://www.nngroup.com/articles/user-mistakes/
- Laubheimer (2021), "Dangerous UX: Consequential Options Close to Benign Options," NN/g, 14 Feb 2021 — https://www.nngroup.com/articles/proximity-consequential-options/
- Nielsen (2008), "OK-Cancel or Cancel-OK?", NN/g, 26 May 2008 — https://www.nngroup.com/articles/ok-cancel-or-cancel-ok/
- Nielsen (2018), "Confirmation Dialogs Can Prevent User Errors," NN/g, 18 Feb 2018 — https://www.nngroup.com/articles/confirmation-dialog/
- Pernice (2017), "F-Shaped Pattern of Reading on the Web," NN/g, 12 Nov 2017 — https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- Rosala (2020), "User Control and Freedom," NN/g, 29 Nov 2020 — https://www.nngroup.com/articles/user-control-and-freedom/
