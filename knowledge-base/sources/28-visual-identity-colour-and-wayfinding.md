# 28. Visual identity: colour and wayfinding

*What eight design systems and the perception, search and wayfinding literature say about colour systems, colour coding for recognition, knowing where you are, and layered versus flat surfaces. Companion to memo 26 (action hierarchy, consequence text) and memo 27 (button anatomy, states, placement); the colour-semantics material in 27 Part C and the Wiedenbeck and Skulmowski studies in 27 Part E are not repeated. No design proposed. Compiled 22 September 2026.*

**The problem under study.** A dense B2B application that is visually flat and monochrome, in which every page resembles every other, so people locate themselves by reading rather than by recognising.

**Tiers.** 1 = peer-reviewed, or published method and sample. 2 = first-party documentation and W3C normative text. 3 = practitioner writing.

**Fetch notes.** URLs fetched 21–22 Sep 2026. `m3.material.io` again returns nothing but a JavaScript shell — every page the same 61 KB, **and the Wayback snapshots are the same shell** — so for the third memo running Material 3 is quoted from Google's Android documentation, not its own specification. Apple's HIG was read as JSON at `developer.apple.com/tutorials/data/design/Human-Interface-Guidelines/…`. Shopify retired its Polaris design pages and Salesforce's live colour page is blank, so both are quoted from Wayback (27 Mar / 5 May 2025; 31 May 2024). Sage and ScienceDirect still return 403, but **Christ (1975), listed as unreachable in memo 27, was recovered in full from its OpenAlex abstract record**. Ware's *Information Visualization* is a book with no fetchable HTML; the "seven to twelve" figure usually credited to it is traced below to sources that can be read.

---

## Part A. What the colour systems actually are

### Hues and what they may mean

All eight separate a **neutral ramp** carrying surfaces and text from a small set of **meaningful hues**, and all restrict what the hues may say.

Carbon: "The neutral gray family is dominant in the default themes, making use of subtle shifts in value to organize content into distinct zones," while "The core blue family serves as the primary action color across all IBM products … Additional colors are used sparingly and purposefully." The palette is fixed in size — "twelve color grades—Black, White and ten values for each hue" — and applied only through role-named tokens in "ten main groups" (background, layer, field, border, text, link, icon, support, focus, skeleton): "Roles cannot be changed between themes."

Fluent 2 has "three color palettes: neutral, shared, and brand." Shared colours "allow for quick mental recognition of components and functions across products" and must be used "sparingly." Brand colour is explicitly a wayfinding device — "Apply brand colors to different areas of an interface not only to create visual prominence, but also to anchor people in a specific product experience" — with the counterweight "Avoid overusing brand colors or using them on large surfaces as they can dilute a hierarchy and make an experience difficult to navigate."

Atlassian is the only system with a formal slot for *meaningless* colour, and the closest existing practice to colour-per-object-type. Of its ten roles — neutral, brand, information, success, warning, danger, discovery, accent, inverse, input — **accent** is: "Use for colors that don't have any specific meaning tied to them. You should be able to exchange one accent color for another, and the experience would remain unchanged. Accent colors: gray, red, green, blue, yellow, orange, teal, purple, magenta, and lime." Its dedicated page gives the use case — "Use accent colors … in experiences where color helps categorize content" — the prohibition "Don't use accent tokens when the color has a specific meaning in our system," and two limits: "Avoid yellow … can appear more like brown," and "Don't mix accent backgrounds with different colored foreground elements."

Apple defines colour by purpose: "Each dynamic color is semantically defined by its purpose, rather than its appearance or color values," with "Avoid using the same color to mean different things." Its one sentence on colour-as-place: "Background color can establish a sense of place and help people recognize key content … rather than as a solely visual flourish."

Polaris dissents, toward monochrome: "Each usage of color within the Shopify admin is purposefully tied to a specific meaning … Using color as decoration is exclusive to illustration," and, as stated strategy, "The Shopify admin interface adopts a black and white color scheme, intentionally creating a neutral backdrop. By employing this monochromatic design, elements that incorporate color gain heightened visual impact and prominence." That is the strongest argument in the eight *for* the flat monochrome the brief treats as a defect: the flatness is what buys the colour its meaning.

Material 3 generates colour rather than choosing it: "The foundation of a color scheme is the set of five key colors. Each of these colors relate to a tonal palette of 13 tones." Dynamic colour means "an algorithm derives custom colors from a user's wallpaper" — a system in which hue carries no fixed meaning at all.

Salesforce is the one system whose colour work is explicitly about recognising *objects*. Its ambition — "Ideally, users can understand meaning just by glancing at a UI object" — sits beside its limit: "a screen with too many competing colors creates visual noise." The palette is generated in HCL, "defined by how humans perceive color." On object icons: "Each object icon is made up of a white glyph on a squircle … Object icons use a specific, limited color palette," and "Don't use non-white icon glyphs in object icons."

"Specific, limited" can be measured. Counting icon background colours in the shipped `@salesforce-ux/design-system` v2.264.1 stylesheet (fetched 22 Sep 2026): **203 standard object icon classes draw on 21 distinct background colours**, the commonest used 38 times; 47 action icons draw on 9. Custom object icons behave oppositely — 113 classes across 101 colours, almost one apiece. The nearest thing to colour-per-object-type therefore **over-subscribes** its colours about ten to one for the objects it ships and names. Colour narrows the field; the glyph identifies the object.

Linear publishes no design system but does publish its reasoning: its 2024 redesign moved theme generation to LCH so that "instead of having to define 98 specific variables for each theme, we defined three: base color, accent color, and contrast," and drained hue out of the chrome by "limiting how much chrome (blue in our case) was used." **Notion and Attio publish no fetchable design documentation.**

### Surfaces and elevation

Four mechanisms, and no agreement on which one groups content.

Carbon uses **value steps**: "There are four layers within a theme: base layer, layer 01, layer 02, and layer 03 … In the light themes, layers alternate between White and Gray 10 with each added layer. In the dark themes, layers become one step lighter," with "Avoid use of midtones." A layer-aware component lets one control serve every level: contextual tokens are "aware of what layer it is placed on," nestable "up to three level."

Atlassian uses **named elevations with paired shadows** — "four basic elevation levels: Sunken, Default, Raised, Overlay," plus an overflow shadow — and in dark mode surfaces take over from shadows: "the higher the elevation, the lighter the surface looks." Material 3 uses **tint**: "Material 3 represents elevation mainly using tonal color overlays … increasing tonal elevation uses a more prominent tone," the overlay colour coming "from the primary color slot." Fluent uses **shadows only**, generated: "shadow 2 has 2 pixel blur and shadow 64 has 64 pixel blur," six types across a low and a high ramp. Apple uses **material**: "By allowing color to pass through from background to foreground, a material establishes visual hierarchy to help people more easily retain a sense of place"; iOS separately ships three plain greys, "Primary for the overall view; Secondary for grouping content … within the overall view; Tertiary for grouping content … within secondary elements."

### One palette, two themes

Carbon: "Color token names and roles are the same across themes, only the assigned value will change," and "You cannot implement light or dark mode without using color tokens everywhere in your product." Atlassian publishes an actual derivation rule: "We currently have 10 swatches set up in each palette. If the swatches are divided in half, each half becomes a mirror. For instance, if a button color is 700 in light theme, it will be 400 in dark theme," caveated as not covering every case. Apple warns against literal inversion — "these colors aren't necessarily inversions of their light counterparts" — and raises the bar: "For custom foreground and background colors, strive for a contrast ratio of 7:1." Apple forbids an in-app switch ("Avoid offering an app-specific appearance setting"); Carbon calls one "highly encouraged." Carbon alone documents **inline theming** — the shell or a side panel run in a contrasting theme to make "a high contrast moment that can add emphasis and focus to a work flow," gated by "Only use inline theming for major shifts in color."

### Type scales

Carbon derives its scale from a formula (`Xn = Xn-1 + {INT[(n-2)/4] + 1} * 2`) and splits it in two: "The productive type set uses a base type size of 14px, while the expressive type set uses a base type size of 16px," because product pages have "a higher density of information housed inside containers." Atlassian ships seven heading sizes (12–32 px, all Bold) and three body sizes, ruling "Use heading styles, rather than bold or a change of font size." Fluent's web ramp has 16 styles, 10/14 to 68/92. Material 3 has 15 and concedes "Your product will likely not need all 15 default styles." Apple defines styles, not sizes — "the text styles form a typographic hierarchy you can use to express the different levels of importance in your content" — with "Minimize the number of typefaces you use" and "In general, avoid light font weights."

---

## Part B. Colour coding for recognition and search

**The ceiling.** "About seven" traces to Miller (1956): "I would propose to call this limit the *span of absolute judgment*, and I maintain that for unidimensional judgments this span is usually somewhere in the neighborhood of seven"; across his stimulus variables "the mean is 2.6 bits … this mean corresponds to about 6.5 categories." **Ware's book, the usual citation for "seven to twelve", has no fetchable HTML edition and is not quoted here.**

**What sets the ceiling.** Healey (1996), n=38, aimed at "maximizing the total number of colours available for use, while still allowing an observer to rapidly and accurately search a display for any one of the given colours," and found "we need to consider three separate effects during colour selection: colour distance, linear separation, and colour category." Hue count alone is not the variable. His survey explains why colour buys anything: "tasks that can be performed on large multi-element displays in less than 200 to 250 milliseconds (msec) are considered preattentive," a unique property letting a target "pop out."

**The oldest and most cautious result.** Christ (1975): "Forty-two studies published between 1952 and 1973 were located … Quantitative analyses of these results indicated that color may be a very effective performance factor under some conditions, but that it can be detrimental under others." Colour coding is conditional, not free.

**The closest measured analogue to a flat monochrome console.** Van Laar & Deshe (*Human Factors*, 2007), n=24, repeated measures across four display formats and two task types: "Overall, the visual layers coding method produced significantly faster reaction times than did the maximally discriminable and the monochrome methods for both the search and compare tasks. No significant difference in errors was observed … Significantly less perceived workload was experienced with the visual layers coding method." Superior, they add, "when the method supports the user's task." Note that *maximally discriminable* colour — the naive one-bright-hue-per-category — lost to a layered scheme as well as beating monochrome.

**Meaning beats arbitrariness.** Lin, Fortuna, Kulkarni, Stone & Heer (2013): "A controlled study shows that expert-chosen semantically-resonant colors improve speed on chart reading tasks compared to a standard palette." Schloss et al. (2018) show the inference is set-relative, not item-by-item: people "discarded objects in bins that optimized the color-object associations of the entire set," sometimes choosing a bin "whose colors were weakly associated with the object."

**Colour may not be the only channel.** WCAG 2.2 SC 1.4.1 (A): "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element." SC 1.4.3 (AA): "at least 4.5:1" for text, 3:1 large. SC 1.4.11 (AA): "at least 3:1 against adjacent color(s)" for "Visual information required to identify user interface components and states." Atlassian cites both by number; Apple, Fluent and Polaris restate them in prose ("Don't use color alone to convey meaning"). Prevalence: NEI says "About 1 in 12 men have color vision deficiency"; Colour Blind Awareness, "1 in 12 men (8%) and 1 in 200 women … about 300 million people" worldwide. In a male-skewed B2B user base, 8% is the planning number.

**What is missing.** No study was found measuring **icon plus colour against icon alone or colour alone** in a product interface; the nearest is Wiedenbeck (1999) on icons versus labels, covered in memo 27. Nothing was found measuring colour-coded object categories in a business application.

---

## Part C. Knowing where you are without reading

**The heuristic.** Nielsen's first: "The design should always keep users informed about what is going on, through appropriate feedback within a reasonable amount of time." NN/g's chosen illustration is a wayfinding one: "You Are Here indicators on mall maps show people where they currently are, to help them understand where to go next."

**The architecture literature.** Lynch's five elements — "paths, edges, districts, nodes, and landmarks" — and his "concept of imageability or legibility of the physical form" are quoted **via** a peer-reviewed secondary source (*Environment and Planning B* 26, 1999), the book not being fetchable. The measured building study closest to "every page looks alike" is Başkaya, Wilson & Özcan (2004), comparing "One setting with a symmetrical layout and regularly organized, monotonous units on different floors and another setting with an asymmetrical layout": "Most of the participants of the asymmetrical setting could complete a sketch map with a minimum of errors. In the symmetrical setting, however, some participants drew incomplete sketch maps," emphasising "the importance of landmarks and spatial differentiation in the acquisition of environmental knowledge." Dogu & Erkip (2000) found in a mall that "people did not find the signage system sufficient," behaviour being governed by "building configuration, visual accessibility, circulation systems, and signage" — signage last. Vinson (CHI '99) carried the idea into synthetic space with guidelines focused "on the design and placement of landmarks."

**The breadcrumb evidence, thinner than its reputation.** Rogers & Chaparro (*Usability News* 5.2, 2003) built a four-level site with 21 tasks "structured so that efficiency was optimized through the use of the breadcrumb trail," n=45 across three variants. "Of the participants that were exposed to a site with a breadcrumb trail (n=30), 40% used the breadcrumb five or more times … However, this accounted for only 6% of the navigation overall." Breadcrumb users "used the Back button less (M = 20.00 …) than the non-breadcrumb users (M = 45.00 …), t(28) = 3.95, p = <.01," but there were "no significant differences … for total pages visited, embedded link clicks, navigation bar clicks, or time to complete the tasks." Position mattered: of 199 breadcrumb clicks, "82% (163) were in the site with the breadcrumb positioned under the page title," χ²(1, N=30) = 4.82, p = .03. The orientation finding: participants on a breadcrumb site "were more likely to choose a hierarchical model than those that used the non-breadcrumb site, χ²(2, N = 45) = 8.08, p = .02." The earlier study (Lida, Hull & Pilcher, n=72, on live sites) "found limited use of breadcrumb trails as a navigational tool and no differences in site efficiency." Breadcrumbs measurably changed people's **mental model of the structure** while failing to change their **speed** — the only controlled orientation result in this sweep.

**The catalogue of location signals.** Whitenton (NN/g) lists logo and branding; "Navigation change: A link or graphic element … becomes more visually prominent when the user selects that topic. Often this prominence is achieved through highlighted coloring or offsetting the element in space, or both (for better accessibility)"; headings; window title; URL; breadcrumbs; contextual cues; steps. On per-section colour: "Color-coding (where the predominant color changes depending on the section of the site) is usually found in websites with sharply distinct types of content." The framing sentence is the useful one: "web location indicators may be a combination of color coding, lighting, signs, arrows, paths, and names of landmarks." **No measured study of per-section colour in a site or admin console was found.** NN/g's breadcrumb rules (Laubheimer) are tier 3 but specific: breadcrumbs "Should Not Replace the Global Navigation Bar", "Should Display the Current Location in the Site's Hierarchical Structure, Not the Session History", and the current page "Should Not Be a Link."

---

## Part D. Depth, hierarchy and density

**The measured cost of flatness.** NN/g ran a between-subjects eyetracking experiment, 71 participants, nine pages in strong- and weak-signifier versions differing only in signifier strength: "On average participants spent 22% more time (i.e., slower task performance) looking at the pages with weak signifiers … people had 25% more fixations on the pages with weak signifiers. (Both findings were significant by a paired t-test with sites as the random factor, p < 0.05.)" and "The weak-signifier versions of the pages resulted in a broader distribution of fixations across the page … We never saw the reverse pattern." The scope condition matters most here: "the potential negative consequences of weak signifiers are diminished when the site has a low information density, traditional or consistent layout, and places important interactive elements where they stand out … A site with a substantial amount of potentially overwhelming content … should proceed with caution when adopting an ultraflat design." Moran's follow-up describes the residue: "Users are forced to explore pages to determine what's clickable … to hover the mouse over elements hoping for dynamic clickability signifiers, or click experimentally."

**Borders versus tints versus shadows.** Atlassian alone ranks them for grouping: raised elevation is not a grouping tool — "don't use to group content when a border or white space would suffice" — while sunken is: "Use this token as a backdrop to group content or elements together (such as a kanban board) on the default surface." For flat cards it prescribes a border, not a shadow. Carbon does all grouping with value steps and no shadows at all. Polaris warns on both quantity and reliance: "Too many elements pulling attention can disorient merchants," and "Don't rely solely on depth to create focus. Not all merchants perceive depth in the same way."

**Density.** Material's archived density guidance is the only published numeric guidance found: default 48 dp row height against high density 32 dp; text fields 56 dp against 44 dp; a list-plus-action example at 40/36 dp against 32/24 dp. Its principles are framed for exactly this class of product — "List, tables, and long forms are components that benefit from increased density" — with two exclusions: "Don't apply density to components that involve focused tasks, such as interacting with a dropdown menu or picker," and "Don't apply density to components that alert the user of changes … Applying high density to alerts reduces their ability to command attention." Carbon reaches the same place through type, reserving its 14 px productive set for dense product pages.

---

## Part E. Summary

### What the sources agree on

1. Neutrals carry the structure; saturated colour is rationed — Carbon's greys "organize content into distinct zones," Salesforce's warning that "too many competing colors creates visual noise."
2. A hue's meaning is assigned once and not reused: "Avoid using the same color to mean different things."
3. There is a formal slot for colour that means nothing in particular, and it is small — Atlassian's ten accents, with the swap test.
4. Categorical colour has a low ceiling ("the neighborhood of seven"); the usable maximum depends on colour distance, linear separation and colour category together, not on hue count.
5. Colour alone never carries information (WCAG 1.4.1, restated by five systems); ~8% of men have a colour vision deficiency.
6. Contrast floors are identical everywhere: 4.5:1 for text under 24 px, 3:1 for large text and for component and state information.
7. Colour is applied through role-named tokens, never hex values; light and dark derive from the same token names.
8. Shadows fail in dark mode, so every system using them also shifts surface value; elevation is rationed like colour.
9. Grouping uses the cheapest sufficient device — whitespace or a border before a tint, a tint before a shadow.
10. Type scales are published at 15–16 steps and expected to be used at five or six.
11. Flat, weak-signifier interfaces cost measured time and fixations (+22%, +25%, n=71), worst where information density is high.
12. Location is signalled redundantly — active navigation state, heading, page title, URL, breadcrumb, optionally section colour — never by one channel.
13. Dense layout is legitimate and has published numbers for lists, tables and forms, but must be withheld from focused-task and alert components.

### Where they disagree

- **Whether monochrome is the problem or the point.** Polaris designs a black-and-white admin deliberately, "so elements that incorporate color gain heightened visual impact"; Fluent uses brand colour to "anchor people in a specific product experience."
- **What expresses depth.** Carbon: value steps only, midtones banned. Fluent: shadows only. Material 3: a primary-derived tonal tint. Atlassian: surface plus paired shadow. Apple: translucent material.
- **Whether elevation may group.** Atlassian says sunken groups and raised does not; Material's tonal elevation is exactly a grouping device.
- **Whether hue may be meaningless.** Atlassian ships ten accents for categorisation; Polaris declares decoration "exclusive to illustration"; Fluent has no accent role at all.
- **Whether users choose the theme.** Apple: "Avoid offering an app-specific appearance setting." Carbon: a mode control is "highly encouraged."
- **Whether hue can be stable at all.** Material 3's dynamic colour derives the scheme from the user's wallpaper; every other system fixes it.
- **Whether a maximally distinct palette is the goal.** Salesforce and Healey pursue maximum discriminability; Van Laar & Deshe measured maximally discriminable colour losing to a layered scheme.
- **Where the breadcrumb goes.** NN/g places it "just below the global navigation"; the only controlled study found 82% of clicks in the variant placed *under the page title*.
- **Dark-mode contrast target.** Apple asks 7:1 for custom colours in small text; everyone else stops at WCAG AA 4.5:1.

### Still unknown

- Whether colour-per-object-type helps in a business application. Salesforce's 203 object icons across 21 colours is an existence proof of a convention, not evidence that it works, and Salesforce publishes no study.
- Whether icon plus colour beats icon alone or colour alone anywhere in a product UI.
- Whether per-section colour in a large site or admin console changes orientation, error rate or time. NN/g describes the pattern; nobody measured it.
- What the distinguishable-category ceiling is *for small UI elements* — a chip or a 16 px glyph — rather than for data-visualisation marks; Miller and Healey both measured larger, isolated stimuli.
- Whether a persistent page identity reduces the "which page am I on" error directly; the nearest evidence is Rogers & Chaparro's mental-model result and Başkaya et al.'s sketch maps, neither measured in a working tool.
- How much of the +22% flat-design penalty survives for trained users in an all-day tool; the study used one-shot findability tasks on unfamiliar pages.
- Material 3's own current specification, for the third memo running.

---

## Bibliography

**Tier 1 — peer-reviewed, or published method and sample**

- Aiello, L. M. et al. (1999), "A Methodology for The Image of the City," *Environment and Planning B* 26 — https://doi.org/10.1068/b260133 (*abstract only; source of the Lynch quotation*)
- Başkaya, A., Wilson, C. & Özcan, Y. Z. (2004), "Wayfinding in an Unfamiliar Environment," *Environment and Behavior* — https://doi.org/10.1177/0013916504265445 (*abstract only*)
- Christ, R. E. (1975), "Review and Analysis of Color Coding Research for Visual Displays," *Human Factors* 17(6), 542–570 — https://doi.org/10.1177/001872087501700602 (*Sage 403; abstract via OpenAlex, 22 Sep 2026*)
- Dogu, U. & Erkip, F. (2000), "Spatial Factors Affecting Wayfinding and Orientation," *Environment and Behavior* — https://doi.org/10.1177/00139160021972775 (*abstract only*)
- Healey, C. G. (1996), "Choosing Effective Colours for Data Visualization," *Proc. IEEE Visualization '96*, n=38 — https://www.cs.ubc.ca/labs/imager/tr/1996/healey1996b/ (*abstract via OpenAlex*)
- Healey, C. G. & Enns, J. T. (2011), "Attention and Visual Memory in Visualization and Computer Graphics," *IEEE TVCG* — https://doi.org/10.1109/tvcg.2011.127 (*abstract only*)
- Healey, C. G., "Perception in Visualization" — https://www.csc2.ncsu.edu/faculty/healey/PP/ (fetched 22 Sep 2026)
- Lida, B., Hull, S. & Pilcher, K. (2003), "Breadcrumb Navigation: An Exploratory Study of Usage," *Usability News* 5.1, n=72 — Wayback 18 Mar 2008, http://psychology.wichita.edu/surl/usabilitynews/51/breadcrumb.htm
- Lin, S., Fortuna, J., Kulkarni, C., Stone, M. & Heer, J. (2013), "Selecting Semantically-Resonant Colors for Data Visualization," *Computer Graphics Forum* — https://doi.org/10.1111/cgf.12127 (*abstract only*)
- Miller, G. A. (1956), "The Magical Number Seven, Plus or Minus Two" — https://psychclassics.yorku.ca/Miller/ (fetched 22 Sep 2026)
- Pernice, K. (2017), "Flat UI Elements Attract Less Attention and Cause Uncertainty," NN/g, eyetracking, n=71 — https://www.nngroup.com/articles/flat-ui-less-attention-cause-uncertainty/
- Rogers, B. L. & Chaparro, B. (2003), "Breadcrumb Navigation: Further Investigation of Usage," *Usability News* 5.2, n=45 — Wayback 4 Sep 2017, http://psychology.wichita.edu/surl/usabilitynews/52/breadcrumb.htm
- Schloss, K. B. et al. (2018), "Color inference in visual communication: the meaning of colors in recycling," *Cognitive Research* — https://doi.org/10.1186/s41235-018-0090-y
- Van Laar, D. & Deshe, O. (2007), "Color Coding of Control Room Displays: The Psychocartography of Visual Layering Effects," *Human Factors*, n=24 — https://doi.org/10.1518/001872007x200111 (*abstract only*)
- Vinson, N. G. (1999), "Design guidelines for landmarks to support navigation in virtual environments," CHI '99 — https://doi.org/10.1145/302979.303062 (*abstract only*)

**Tier 2 — first-party documentation and W3C normative text (fetched 21–22 Sep 2026)**

- Apple HIG, "Color" · "Materials" · "Dark Mode" · "Typography" — https://developer.apple.com/design/human-interface-guidelines/color (read as JSON)
- Atlassian, "Color" · "Accents" · "Color palette" · "Elevation" · "Typography" — https://atlassian.design/foundations/color · /color/accents · /color/color-palette · /elevation · /typography
- Colour Blind Awareness, "What is colour blindness?" — https://www.colourblindawareness.org/colour-blindness/
- Google, Material Design 3 on Android — https://developer.android.com/develop/ui/compose/designsystems/material3 · /material2-material3
- Google, Material Design "Applying density" — Wayback 8 Jun 2019, https://material.io/design/layout/applying-density.html
- Google, Material Design 3 — https://m3.material.io/styles/color/roles · /styles/elevation/overview (*not fetchable, including via Wayback*)
- IBM Carbon, "Color: Overview" · "Color: Usage" · "Typography: Overview" · "Typography: Type sets" (updated 9 Sep 2026) — https://carbondesignsystem.com/elements/color/overview/
- Linear, "How we redesigned the Linear UI (part II)," 28 Mar 2024 — https://linear.app/blog/how-we-redesigned-the-linear-ui
- Microsoft Fluent 2, "Color" · "Elevation" · "Typography" — https://fluent2.microsoft.design/color · /elevation · /typography
- National Eye Institute, "Color Blindness" — https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness
- Salesforce Lightning Design System, "Color Overview" · "Iconography" — Wayback 31 May 2024, https://www.lightningdesignsystem.com/guidelines/color/overview/ · /guidelines/iconography/ ; colour counts from the `@salesforce-ux/design-system` v2.264.1 stylesheet
- Shopify Polaris, "Color" · "Depth" — Wayback 27 Mar 2025 and 5 May 2025, https://polaris.shopify.com/design/colors · /design/depth
- W3C, *Understanding WCAG 2.2*: SC 1.4.1, SC 1.4.3, SC 1.4.11 — https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html

**Tier 3 — practitioner**

- Laubheimer, P. (2018, reviewed 1 Sep 2026), "Breadcrumbs: 11 Design Guidelines for Desktop and Mobile," NN/g — https://www.nngroup.com/articles/breadcrumbs/
- Moran, K. (2019), "Long-Term Exposure to Flat Design," NN/g — https://www.nngroup.com/articles/flat-design-long-exposure/
- Nielsen, J. (1994, updated), "10 Usability Heuristics for User Interface Design," NN/g — https://www.nngroup.com/articles/ten-usability-heuristics/
- Whitenton, K., "You Are Here: Location Signaling," NN/g — https://www.nngroup.com/articles/navigation-you-are-here/
