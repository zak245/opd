# 27. Button anatomy, states and placement

*What eight design systems, WCAG 2.2 and the measurement literature say about how a button is built, how it behaves under the pointer, what its colours may mean, and where it sits. Companion to memo 26 (emphasis, destructive confirmation, helper text), not repeated here. No design proposed. Compiled 21 September 2026.*

**Tiers.** 1 = peer-reviewed or published method and sample. 2 = first-party documentation and W3C text. 3 = practitioner writing.

**Fetch notes.** URLs fetched 21 Sep 2026. `m3.material.io` is JavaScript-only and returns nothing **even through Wayback snapshots from July 2026**, so Material 3 is quoted from Google's Compose docs, the `material-web` token docs and the archived Material site (Dec 2018); **M3's own current specs are again not in evidence** (as in memo 26). Apple's HIG is client-rendered but serves its content as JSON at `developer.apple.com/tutorials/data/…`, which is what was read. Atlassian rendered fully this time, so its quotes are verbatim. ACM, Taylor & Francis and Sage return 403; unreachable abstracts are marked. GOV.UK's metrics come from its stylesheet, since it publishes none in prose.

---

## Part A. Anatomy

**Heights.** Only Carbon publishes a full scale — "seven button sizes: extra small, small, medium, large (productive), large (expressive), extra large, and 2XL" at 24, 32, 40, 48, 48, 64 and 80 px, its large (productive) being "the most common button size in software products." Apple gives heights only for visionOS: "Mini (28 pt), Small (32 pt), Regular (44 pt), Large (52 pt), Extra large (64 pt)." **Fluent 2 and Polaris publish no height or padding figures at all**; GOV.UK ships one button.

**Padding and radius.** Carbon: "A button cannot have label or any element within 16 pixels / 1 rem of its borders," and its fixed button is asymmetric — 16px left, 64px right — because "The button label determines the button's width." GOV.UK's stylesheet gives `padding: 8px 10px 7px` and `border-radius: 0`; Material 3's tokens default every variant's `container-shape` to `--md-sys-shape-corner-full`, a pill; Apple picks a shape per content type (circle, capsule, rounded rectangle).

**Touch and pointer targets.** Archived Material gives both numbers: "Touch targets should be at least 48 x 48 dp … about 9mm," and "Pointer targets should be at least 44 x 44 dp." Apple: "a button needs a hit region of at least 44x44 pt — in visionOS, 60x60 pt," and, uniquely, buttons whose "centers are always at least 60 pts apart." WCAG 2.2 sets a lower floor, SC 2.5.8 (AA): "at least 24 by 24 CSS pixels," with a spacing exception for undersized targets.

**Icon plus label.** Carbon: "Icons should always appear to the right of the label," at 16px, "used sparingly, as overuse can create visual noise." It lists eleven "universal actions" that may carry an icon, "to avoid the same icon being used for completely different actions," and requires all-or-nothing per group. Pajamas contradicts it on both side and principle: "Icons are always positioned to the left of text," and "Use either an icon or text in buttons, not both, as neither should require the other to be understood."

**When icon-only is allowed.** Carbon gates it and cites a study: "Icon only buttons should be used sparingly. 'For most situations, users learn correct interpretations better with text alone than with icons alone.' — Wiedenbeck, S (1999)." Permitted when the icon is "standardized and recognizable without label," or when space forces a toolbar; and unconditionally, "a tooltip is always required." Carbon alone bars "a danger button in an icon only form." Atlassian forbids custom icons in them, applying NN/g's "five-second rule." Pajamas adds a rule no one else has: "An icon-only button shouldn't be used to toggle between two states."

**Label grammar.** Verb first is unanimous — Carbon's "{verb} + {noun} content formula … except in the case of common actions like 'Done', 'Close', 'Cancel'." Sentence case is near-unanimous (Carbon, Pajamas, Atlassian — "Don't use title case capitalization or all caps" — Fluent, Polaris, GOV.UK), with one dissenter: Apple refuses to choose ("Title case is generally considered formal, while sentence case is more casual"). Fluent and Polaris require "no end punctuation," but Pajamas and Apple carve out the ellipsis for actions needing more input. **No system gives a length limit**; the nearest is Carbon's "We do not recommend truncating a button label" — wrap it instead. Carbon bars mixed sizes in a group; Apple gives the principle: "Use style — not size — to visually distinguish the preferred choice."

---

## Part B. The state set

**What is named.** No two lists match: Carbon names hover, focus, active, disabled and inline loading; Fluent adds rest and selected; Polaris exposes only `loading` and `disabled`. Apple issues the sole imperative on press: "Always include a press state for a custom button. Without a press state, a button can feel unresponsive."

**Focus.** GOV.UK is the most specified and justifies it by criterion: focus states "use a combination of yellow and black, along with a thick bottom border, to make sure they meet … success criterion 1.4.11 Non-text contrast, level AA on any background colour used on GOV.UK." Its stylesheet adds `outline: 3px solid rgba(0,0,0,0)`, a transparent outline that appears in Windows High Contrast mode. Carbon specifies a `$focus` border plus `$focus-inset` with `box-shadow: inset 1px`, identical across all seven variants.

**Contrast requirements cited.** WCAG 1.4.11 (AA): components need "a contrast ratio of at least 3:1 against adjacent color(s)." WCAG 2.4.13 Focus Appearance (AAA) quantifies the ring: at least "the area of a 2 CSS pixel thick perimeter of the unfocused component," with "a contrast ratio of at least 3:1 between the same pixels in the focused and unfocused states." Fluent alone has a per-element button rule: "button text must pass 4.5:1 and icons must pass 3:1 … in all interactive states … there's no contrast requirement for the button stroke"; and "Disabled buttons aren't interactive and don't need to pass color contrast."

**Pressed.** GOV.UK's active state is `top: 2px`, dropping the button onto its own shadow. Archived Material: "On press, elevated buttons lift up and the container displays touch feedback."

**Loading.** Carbon: "The button would be disabled when inline loading is in progress." Pajamas keeps it reachable — "remains focusable … `aria-disabled` … set to `true`, and the `disabled` attribute is unset" — and ties it to safety: "A destructive action should hold its loading state until the request resolves, which also stops a second click." Polaris inverts Carbon: "use loading over disabled." GOV.UK solves it without a state, and is the only system citing field evidence: "the GOV.UK Notify team discovered that a number of users were receiving invitations twice, because the person sending them was double clicking the 'send' button."

**Disabled.** Atlassian: "Avoid disabling buttons, especially in forms … They also aren't reachable in the tab order," plus "Never put tooltips on disabled buttons." Fluent instructs the opposite: "For disabled buttons, show a tooltip that states what is unavailable and why."

---

## Part C. Colour semantics

Fluent names the category: semantic colours "should always convey important information," built "on real world associations, like red for danger," with a paired don't — "Use semantic colors for important messages / Don't use them for decoration." GOV.UK publishes single-purpose functional colours — focus `#ffdd00` ("Only use this colour to indicate which element is focused on"), error `#ca3535`, success `#0f7a52` — and forbids reuse twice over: "Do not copy the specific hexadecimal (hex) colour values," and "Only use the variables in the context they're designed for." Polaris gates its `critical` tone on reversibility: "Use critical tone only for destructive actions that are difficult or impossible to undo."

**Danger, warning, success.** All eight have red. **None has an amber warning button**: GOV.UK's `--warning` modifier is red (`#ca3535`, the same hex as its error colour) and covers "actions with serious destructive consequences" — what others call danger or critical. There is no third severity tier anywhere. Success is the live disagreement: only Pajamas ships a positive variant ("Confirm: Indicate a positive or negative non-destructive action"). GOV.UK documents no success button, yet its default button's background is `#0f7a52` — byte-identical to the `success` functional colour published on the same site. The system that most strictly forbids reusing functional colours ships its primary action in its success green — an observation about the artefacts, not a claim GOV.UK makes.

**Tonal middles.** Material 3 is richest: "Filled tonal — Background color varies to match the surface. Also for primary or significant actions … suit functions such as 'add to cart' and 'Sign in'." Fluent's middles are subtractive: outline, subtle, transparent.

**Never colour alone.** GOV.UK: "Do not only rely on the red colour of a warning button … not all users will be able to see the colour."

---

## Part D. Placement

**Page header.** Carbon reasons from hierarchy: "It is challenging to use a primary button in the header of a page because the content beneath the header is probably going to have a primary action … it is advised to use a tertiary button for page headers." Polaris structures it instead, with a `primary-action` slot, a cap of "no more than one primary action and 3 secondary actions per page," and — squarely against Carbon's form and wizard patterns — "Don't include any actions at the bottom of the page."

**Card and dialog.** Carbon's card action is a ghost button that "touches at least two edges of the container." Dialogs are right-aligned or full-span, unanimously; Atlassian's reason: "Right aligning buttons is best for experiences with less copy, so users end scanning on the most important action (following a Z-pattern)."

**Side panel and drawer.** Only Carbon has depth, all of it numeric or directional: stacked, "the primary button is always on top"; and a full-width ghost button is "only recommended … such as a side panel of 480px (medium) and below."

**List row and bulk-action bar.** Carbon demotes the table action — "Use a ghost button instead if there is another button on the page that requires primary styling" — and extends its same-width rule "for both the toolbar and the batch actions toolbar as well." Pajamas demotes repeated row actions the same way, to stop many danger buttons "overwhelming and distracting."

**Form.** Left, with one holdout. GOV.UK: "Align the primary action button to the left edge of your form." Pajamas explains why: "Left alignment is a benefit for accessibility … including reading flow, focus order, and page zoom where right-aligned buttons may be initially off screen." Fluent is the holdout, with one rule for every surface: "Always give the primary button action prominent placement, either on top of or to the left of other actions."

**Consistency.** Polaris: "Position consistently: Place buttons in consistent locations throughout the interface to create predictable interaction patterns." **None of the eight cites a study for any placement rule.**

---

## Part E. What has actually been measured

**Spatial stability.** Scarr, Cockburn, Gutwin & Bunt (CHI 2012, tier 1, best paper) is the load-bearing citation: "hierarchical organisations are known to slow down expert users … Results show that for novice users, there is no significant performance difference between CommandMaps and traditional interfaces – but for experienced users, CommandMaps are significantly faster than both menus and the Ribbon." The claim is narrower than its usual citation: spatial stability buys **expert** speed and costs novices nothing. It measures no error rates, and concerns command *location*, not button *styling*.

**Positional constancy.** Somberg (CHI '87) compared alphabetic, probability-ordered, random and positionally constant menu arrangements. **Its abstract could not be fetched** (ACM 403 on every route), so it is cited by title and venue only; verify the direction of its result before leaning on it.

**Icons versus labels.** The only measured study surfaced by any of the eight systems is the one Carbon quotes — Wiedenbeck (1999): "For most situations, users learn correct interpretations better with text alone than with icons alone." NN/g's icon work is tier 3 with no numbers: Harley (2014) — "text labels are necessary to communicate the meaning and reduce ambiguity" — and Kaplan (2024), which says only that "recognition of these simple shapes varied greatly." **Nothing found measures icon-only against labelled buttons in a product UI.**

**Colour coding.** Christ (*Human Factors*, 1975) reviewed 42 studies from 1952–1973; **its abstract could not be fetched**, and it concerns displays, not controls. The nearest fetchable measured study is Skulmowski (2021, n=82), on colour-code *consistency between encounters* in learning material: "learning with color-coded visualizations and being tested without color cues leads to the worst results." **No study was found measuring colour coding of controls.**

**Feedback on press.** Nielsen supplies the only number in use: 0.1 second is "the limit for having the user feel that the system is reacting instantaneously." The systems assert the requirement without measuring it. **No study was found comparing press animation with none.**

---

## Part F. Summary

### What the sources agree on

1. Hit region beats visual box: 44–48 px/pt is the systems' floor, WCAG's AA floor 24×24 CSS px; the difference is padding.
2. The label sets the width; padding is generous and may be asymmetric.
3. Sentence case, verb first, noun if it adds clarity, no end punctuation.
4. Never truncate a label; wrap it. No system publishes a length limit.
5. One size per group; emphasis is style, never size.
6. Icons in a group are all-or-nothing, from a defined set.
7. Icon-only always requires a tooltip or accessible name.
8. Focus must be visible on any background; 3:1 (WCAG 1.4.11) is the floor.
9. Disabled is a last resort: prefer validation, error text, or a loading state that explains itself.
10. Loading prevents double submission — real enough that GOV.UK shipped a flag for it.
11. Semantic colours are single-purpose and may not be reused decoratively.
12. Colour is never the only channel.
13. Dialogs and constrained containers right-align; full-page forms and content left-align (Fluent excepted).
14. Placement should be consistent across a product — asserted by all, evidenced by none.


### Where they disagree

- **Icon side.** Carbon: right of the label. Pajamas, Polaris, Material: left.
- **Icon plus label at all.** Pajamas discourages the combination outright; four others permit it conditionally.
- **Tooltips on disabled buttons.** Fluent requires one; Atlassian says "Never."
- **Whether loading implies disabled.** Carbon disables; Pajamas keeps focus with `aria-disabled`; Polaris prefers loading.
- **Capitalisation.** Six mandate sentence case; Apple leaves it to the app.
- **Ellipsis.** Pajamas and Apple require it for actions needing more input; Fluent and Polaris ban end punctuation outright.
- **Corner radius.** GOV.UK square; Material 3 a full pill by token default; Apple a shape per content type.
- **Actions at the bottom of a page.** Polaris forbids them; three others put form and wizard actions there.
- **One alignment rule or several.** Fluent has one; the other six split by container.
- **A success-coloured button.** Only Pajamas ships one; GOV.UK ships none yet colours its default button in its own success green.
- **Who owns the page header's primary.** Carbon demotes it to tertiary; Polaris models a dedicated primary slot there.

### Still unknown

- Whether any anatomy number matters: nobody cites a study for 16px padding, a 40px height, a pill versus a square, or a 2px versus 3px focus ring.
- Whether icon-only buttons with tooltips cost anything measurable against labelled ones; Wiedenbeck (1999) is the only cited study and is pre-touch.
- Whether consistent placement reduces errors: the spatial-memory literature measures expert *speed*, not error rate, and not for page chrome.
- Whether press animation changes anything; the 0.1s threshold is about latency, not visible movement.
- Whether colour-coding controls (danger red, confirm green) improves or harms action selection.
- Material 3's own current specification, again: its site defeats fetching, so every M3 figure here is second-hand.

---

## Bibliography

**Tier 1 — peer-reviewed, or published method and sample**

- Christ, R. E. (1975), "Review and Analysis of Color Coding Research for Visual Displays," *Human Factors* 17(6), 542–570 — https://journals.sagepub.com/doi/abs/10.1177/001872087501700602 (*403*)
- Scarr, Cockburn, Gutwin & Bunt (2012), "Improving command selection with CommandMaps," CHI '12 — abstract read at https://hci.cs.umanitoba.ca/Publications/details/improving-command-selection-with-commandmaps (ACM record 403)
- Scarr, Cockburn & Gutwin (2013), *Supporting and Exploiting Spatial Memory in User Interfaces*, Foundations and Trends in HCI — https://dl.acm.org/doi/abs/10.1561/1100000046 (*403*)
- Skulmowski, A. (2021), "When color coding backfires," *Education and Information Technologies*, n=82 — https://pmc.ncbi.nlm.nih.gov/articles/PMC8576459/
- Somberg, B. L. (1987), "A comparison of rule-based and positionally constant arrangements of computer menu items," CHI '87, 255–260 — https://dl.acm.org/doi/10.1145/29933.275639 (*abstract not fetchable*)
- Wiedenbeck, S. (1999), "The use of icons and labels in an end-user application program," *Behaviour & Information Technology* 18(2), 68–82 — https://www.tandfonline.com/doi/abs/10.1080/014492999119129 (*abstract not fetchable; quoted via Carbon*)

**Tier 2 — first-party documentation and W3C normative text (fetched 21 Sep 2026)**

- Apple HIG, "Buttons" · "Color" · "Writing" — https://developer.apple.com/design/human-interface-guidelines/buttons (read as JSON; Buttons change log dated 16 Dec 2025)
- Atlassian, "Button" · "Icon button" · "Focus ring" — https://atlassian.design/components/button/usage (and /icon-button/usage, /focus-ring/usage)
- Google, Material Design "Buttons" · "Accessibility" (Wayback, Dec 2018) — https://web.archive.org/web/20181209153816/https://material.io/design/components/buttons.html (and /usability/accessibility.html)
- Google, "Button" (Compose, Material 3) — https://developer.android.com/develop/ui/compose/components/button ; `material-web` shape tokens on GitHub
- Google, Material Design 3 "Buttons" — https://m3.material.io/components/buttons/guidelines · /specs (*not fetchable, including via Wayback*)
- GOV.UK Design System, "Button" (Frontend v6.4.0, Jul 2026) · "Understanding focus state styles" · "Colour" — https://design-system.service.gov.uk/components/button/ · /get-started/focus-states/ · /styles/colour/ ; metrics from its stylesheet `main-474eaefb…css`
- IBM Carbon, "Button" usage/style/accessibility tabs (updated 9 Sep 2026) — https://carbondesignsystem.com/components/button/usage/
- Microsoft Fluent 2, "React Button" · "Color" · "Accessibility" — https://fluent2.microsoft.design/components/web/react/core/button/usage
- GitLab Pajamas, "Button" — https://design.gitlab.com/components/button/
- Shopify Polaris, "Button" · "Page" (App Home web components v1.0) — https://shopify.dev/docs/api/app-home/polaris-web-components/actions/button
- W3C, *Understanding WCAG 2.2*: SC 1.4.11, SC 2.4.13, SC 2.5.8 — https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html

**Tier 3 — practitioner**

- Harley, A. (2014), "Icon Usability," NN/g, 27 Jul 2014 — https://www.nngroup.com/articles/icon-usability/
- Kaplan, K. (2024), "Icon Usability: When and How to Evaluate Digital Icons," NN/g, 4 Oct 2024 — https://www.nngroup.com/articles/how-to-test-digital-icons/
- Nielsen, J. (1993), "Response Times: The 3 Important Limits," NN/g — https://www.nngroup.com/articles/response-times-3-important-limits/
