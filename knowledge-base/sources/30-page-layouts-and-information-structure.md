# 30. Page layouts and information structure

*The reusable page shapes of a dense B2B application — what each archetype is for, what parts it is made of, which overlay to use when, how each behaves as the window narrows, and what the evidence says about alignment, whitespace, density and boxing. Companion to memo 29 (elevation and containment); the containment ordering, the nesting ceiling and the card-overuse argument are settled there and not repeated. This memo is about the arrangement of regions, not the drawing of their edges. No design proposed. Compiled 22 September 2026.*

**The problem.** A dense B2B product needs a small, named set of page shapes every screen is built from, so that learning one index page teaches all of them; and a rule for when a related object opens beside the page, over it, or instead of it.

**Tiers.** 1 = published method and sample, or normative specification. 2 = first-party documentation. 3 = practitioner.

**Fetch notes.** URLs fetched 22 Sep 2026. Material 3 was read as JSON from `m3.material.io/_dsm/content/m3/2026-09-16_06-10-03/{fileId}.json`; the canonical-layout definitions come from Google's Android developer docs, which serve HTML. Apple's HIG was read as JSON at `developer.apple.com/tutorials/data/design/human-interface-guidelines/{page}.json`; **there is no `inspectors` page** — the HIG uses the word only in prose. **Salesforce could not be read at all**: `help.salesforce.com` serves a JavaScript shell (including its legacy `HTViewHelpDoc` endpoint, and through Wayback), `developer.salesforce.com` returns 403 to a fetcher, and live SLDS 2 is a shell; Salesforce is quoted only from a Wayback snapshot of the old `lightningdesignsystem.com` (12 Jun 2018), which covers page-header anatomy but not the console. **Linear's docs are likewise a shell**, so Linear contributes nothing on layout. Polaris design pages are retired; quoted from Wayback 2025 plus live `shopify.dev`. ACM DL is behind a bot check, so Das, McEwan & Douglas (2008) is named but not quoted.

---

## Part A. The layout archetypes

**Material** insists everything is panes: "All content must be in a pane. A layout can contain 1–3 panes of various widths, which adapt dynamically to the breakpoint." It publishes three canonical layouts. *List-detail*: "The layout divides the app window into two side-by-side panes: one for the list, one for the detail." *Supporting pane*: "The primary display area occupies the majority of the app window (typically about two thirds)… The secondary display area is a pane that takes up the remainder." The line between them is the useful one: "Secondary pane content is meaningful only in relation to the primary content… The supplementary content in the detail pane of a list-detail layout… is meaningful even without the primary content." A detail pane is a thing; a supporting pane is an accessory. *Feed*: "arranges equivalent content elements in a configurable grid," claimed for "news and social media apps," not product UI.

**Apple** frames everything as the split view: "selecting an item in the view's primary pane displays the item's contents in the secondary pane. Similarly, a split view can display a tertiary pane if items in the secondary pane contain additional content." The inspector arrives as a fourth pane by example, not definition: Keynote "uses split view panes to present the slide navigator, the presenter notes, and the inspector pane in areas that surround the main slide canvas."

**Carbon** builds the frame rather than the page — a UI shell of "the header, the left panel, and the right panel" — with an ordering principle worth stealing: "For each UI shell component, left-to-right translates to product-to-global."

**Polaris/Shopify** publishes the shortest list, organised by job: **single-column** ("focus on a single, obvious task"), **two-column** ("helpful for visual editors or content-dense pages"), **settings** ("lets merchants quickly scan and find groups of settings that are related to each other"), and the **resource index**, for which "use a full-width page… when merchants are dealing with lists of data that have many columns." The index is specified: "based on a single column to create a clear top-to-bottom hierarchy of tasks and to provide horizontal space for resource data. At the top of the page, merchants find the page title and actions that affect the index as a whole. At the top of the index, merchants can use filters, sorting, and multi-select actions that affect the list below." Its table is defined by job: "to help merchants get an at-a-glance of the objects to perform actions or navigate to a full-page representation of it."

**Atlassian** names no archetypes; it names **widths**, which turns out to be the same thing (F2). **Salesforce** names them in its page-header variants — **Base**, **Object Home**, **Record Home**, **Record Home Vertical** — with "The page header is a masthead that contains the Title of the page, and supporting details." **Notion** treats layouts as views over one collection (Table, Board — "groups your items by property… you could use it as a Kanban board" — Timeline, Calendar, List, Gallery, Chart) and separates the layout from *how a row opens*, the most portable idea here (Part C).

**Wizards** only NN/g defines: "a step-by-step process that allows users to input information in a prescribed order and in which subsequent steps may depend on information entered in previous ones." Use them "for novice users or infrequent processes," show "a list or a diagram of the steps," "enforce a clear sequential order." The costs are the ones a daily user pays: "a higher interaction cost (more clicks) than other input patterns," and "not gracefully interruptible."

---

## Part B. Page parts, and what belongs in each

**Page header** — Salesforce's masthead: title, supporting details, actions only on large form factors. Polaris puts "actions that affect the index as a whole" here and nothing else. This is where BUILD-CHAINS's **trail** belongs: the crumb describes the page, not the data.

**Toolbar** — Carbon is the only system with a budget: "The table toolbar is reserved for global table actions such as table settings, complex filters, exporting, or editing table data… **Include up to five actions within the table toolbar.**" Its height is tied to row height.

**Filter bar** — Polaris places it inside the index, below the header; filters "affect the list below." Carbon adds the one real choice: **batch updates** ("The user selects multiple filters and then takes an additional action to apply the filters") versus **instant updates**. Neither measures which is better.

**Selection strip** — Carbon's batch action bar "appears at the top of the table" once a row is selected, replacing the toolbar: a mode that takes over a region rather than adding one.

**Side rail, panel, inspector** — Carbon's left panel is "used for a product's navigation"; the right carries "system-level actions or content." Fluent states the convention: "people generally expect navigation patterns on the left and notification patterns on the right." Apple caps the rail: "In general, show no more than two levels of hierarchy in a sidebar. When a data hierarchy is deeper than two levels, consider using a split view interface that includes a content list between the sidebar items and detail view" — RULES.md rule 2's ceiling, reached independently and for navigation. Apple also asks for user control ("let people customize the contents of a sidebar") and against a hidden default ("Avoid hiding the sidebar by default to ensure that it remains discoverable").

**Not at the bottom** — Apple, twice: "Avoid putting critical information or actions at the bottom of a sidebar. **People often relocate a window in a way that hides its bottom edge**," and "Avoid placing controls or critical information at the bottom of a window." Rule 7 as geometry rather than depth.

**Pager** — Carbon: "always placed at the bottom of the data table." No system gives the footer anything else.

---

## Part C. Overlays, and the rules for choosing

The decision is not which widget looks right but **whether the person needs the page behind it while they work**.

**Fluent** writes the tree into each component's first paragraph. Drawer: "Use drawers for supplemental info and simple actions related to the main content. For short information that's related to a specific part of the main layout, a drawer may be overwhelming. Try a tooltip or a popover instead. If you need people to confirm an action they're trying to take, use a dialog." Dialog: "Dialogs are often interruptions, so use them for important actions… If you need to give someone additional context that doesn't affect their current workflow, try a popover." Popover: "Content in popovers should never be essential for someone to complete a task."

Fluent's drawer splits in two, and the split is the argument: **inline** — "a passive surface that sits side-by-side with main page content. Use inline drawers when it's helpful to view and interact with main content and drawer content at the same time" — versus **overlay**, "modal by default… will gray out main page content and disable interaction with it," with the caution "They almost always block something."

Depth limits are stated three times: "Don't nest dialogs"; "Don't nest popovers" (Fluent); "Do not nest one disclosure within another disclosure" (Carbon). Carbon adds a concurrency limit nobody else does — "only one should open at a time" — a size limit ("Don't use if the popover needs to have a width larger than six columns"), rule 7 verbatim ("Do not hide important information inside of a disclosure that the user may need in order to complete a task"), and rule 6 ("Disclosures should never open automatically because this could be potentially intrusive").

**The one comparison anyone publishes** is NN/g's, on editing a record from a table. *Edit in place* "works only if the table is narrow." *Modal*: "the big downside… (and why we generally don't recommend modals for deep editing work) is that it will cover adjacent records… **We routinely observe in testing that users refer to existing data in other records while they edit a record** (as that helps them to recognize, rather than recall reasonable value ranges)." *Non-modal panel or separate window* "will cover some of the table, but still allow users access to the table data." *Row-as-accordion*: "**users don't tend to clean up after themselves**… users will have difficulty referring to records that are not in immediate proximity."

It is observational, not controlled — but it is the only published evidence, and it points one way: **the non-modal side pane is the default for record work from a list.** That is BUILD-CHAINS mechanic 1, "beside, not instead," and Material's list-detail, and Notion's side peek, from four directions. Notion supplies the vocabulary for making it a setting rather than an argument: "Side peek: Open pages on the right side of the database. The rest of the database view continues to be interactive on the left"; "Center peek: Open pages in a focused, center modal"; "Full page."

**Fluent caps what a drawer may carry** ("kept to two to three steps… For longer or more complex tasks and workflows, consider a more focused surface") and forbids the loop RULES.md forbids: "**Avoid putting actions in drawers that need confirmation frequently.**" Where a modal is right: "Alert dialogs are forceful interruptions. Use them only in cases of potential loss, like unsaved changes or confirming destructive actions," with at most three footer actions.

---

## Part D. Interaction patterns and their affordances

### D1. Resizable panes and the handle

Material names the component — "Drag handle: The component that resizes panes" — gives it two jobs ("Adjust the width of flexible panes," "Fully collapse and expand fixed panes to quickly switch between a single and two-pane layout") and a measured gap: "**Spacers measure 24dp wide**… **The handle's touch target slightly overlaps the panes.**"

Apple takes the opposite view: "Prefer the thin divider style. **The thin divider measures one point in width**, giving you maximum space for content while remaining easy for people to use." Its safeguard is a minimum, not a marking: "Set reasonable defaults for minimum and maximum pane sizes… **If a pane gets too small, the divider can seem to disappear**, becoming difficult to use." And because a one-point divider is not a signifier, Apple requires a second route: "Provide multiple ways to reveal hidden panes. For example, you might provide a toolbar button or a menu command — including a keyboard shortcut."

**VS Code** ships the same under its own name — "you can adjust the group sizes by grabbing and moving the sash between them" — and its centred layout leans entirely on invisible edges: "You can use the side borders to resize the view (hold down the Alt key to independently move the sides)."

**The keyboard contract exists and is unfinished.** W3C's Window Splitter defines the handle as `role="separator"` with `aria-valuenow`/`valuemin`/`valuemax`, arrow keys to move it, and "Enter: If the primary pane is not collapsed, collapses the pane." But the APG says of itself, "Work to develop an example window splitter widget is tracked by issue 130," and still carries an ARIA 1.1 review caveat. **The accessible resize handle is normatively specified and nowhere demonstrated.** NN/g covers the visual half: grab-handle icons "are not nearly as universal as designers may think and they are often a poor visual metaphor," and for resizing "is often pretty subtle: a single vertical line between columns."

### D2. Drag and drop on boards

NN/g's guidance is all feedback. Grabbed objects should "appear 'above' other items, such as a drop shadow," offset or angled; Trello is analysed as drop shadow plus rotation plus a magnetic drop zone, so "the user did not need to position the item precisely over the intended location." The trigger threshold is the measured detail: reshuffling on the **edge** of the dragged object "will make the interface feel 'twitchy'"; on the **cursor position**, "'mushy' and unresponsive"; "Triggering items to reshuffle when the **center** of the dragged object reaches the edge of the underlying object will make the interface feel natural and responsive." The animation should run "roughly 100 ms."

The cost is real — "it often results in errors — the user drops an item in the wrong spot, and has to start all over again" — and the mitigation is a second route, not a better drag: "alternative interactions can replace drag-and-drop completely."

### D3. Hover-revealed row actions

Carbon splits hover in two and permits only one use. **Hover as a scanning aid is mandatory:** "The data table's row hover state should always be enabled as it can help the user visually scan the columns of data in a row **even if the row is not interactive**." **Hover as the only route to a control** is the failure — which Carbon commits anyway for sorting: "unsorted icons are only visible on hover."

NN/g names the cost: multiple single-record actions end up either "crowded, with no text labels," or "**hidden under a hover gesture or a generic Actions menu, and thus hard to discover (and potentially with low accessibility if a hover gesture is used)**." Fluent ships the same failure: a collapsed responsive drawer "can be invoked again on **hover or focus**" — hover and focus but not touch, which RULES.md rule 4 forbids. Nobody has measured the size of the effect.

### D4. Keyboard navigation of lists, tables and inline edits

W3C's Grid pattern is the specification to check against: arrow keys move one cell; "Page Down: Moves focus down an author-determined number of rows"; Home and End move within the row; "Control + Home: moves focus to the first cell in the first row"; Shift plus arrows extends selection. Wrapping belongs only to layout grids — "it would be **disorienting if used in a data grid**" — and controls inside cells cost a key: "If a cell contains an element like a listbox, then an extra key command to focus and activate the listbox is needed as well as a command for restoring the grid navigation functionality."

Notion supplies the pane-walking half — what BUILD-CHAINS's `[` and `]` are for: `ctrl+shift+K` "while in database peek view to go to the previous database page," `ctrl+shift+J` for the next.

On inline editing, NN/g's ranking above is the whole of it: editing in place "works only if the table is narrow," and the row must look visibly different in edit mode "to prevent accidental edits." Shopify keeps the table from becoming a wall of buttons: "Actions in tables should use secondary action styling, such as a text button, minor icon, or dropdown menu. **Avoid using primary style buttons in tables.**"

---

## Part E. Responsiveness of the archetypes

**Breakpoints.** Material: compact < 600dp, medium 600–840, expanded 840–1200, large 1200–1600, extra-large ≥ 1600 (compact covers "99.96% of phones in portrait"). Carbon: 320 / 672 / 1056 / 1312 / 1584 px. Atlassian: xxs 320–479, xs 480–767, s 768–1023, m 1024–1439, l 1440–1767, xl 1768+. Apple refuses numbers and uses two size classes per axis: "**Determine layout based on size classes, not device type or orientation.**" Atlassian adds the clarification that prevents a common bug: "Breakpoints are based on the viewport width, not the width of the main content area. **Showing or hiding the side navigation or a panel does not change which breakpoint the grid uses.**"

**A list-detail** becomes one pane below expanded: "Selection of a list item displays the detail in place of the list. Pressing back redisplays the list." State survives the transition — "if expanded narrows to medium/compact, detail remains visible with list hidden; if medium/compact widens to expanded, list and detail show together with selection indicated." Apple: "Prefer using a split view in a regular — not a compact — environment."

**A supporting pane** stacks or docks: "Compact-width displays: Supporting content placed below the main content or inside a bottom sheet accessible via menu or button." Medium splits 50/50; expanded runs roughly 70/30.

**A board:** no system says. Atlassian classifies kanban boards as the case for a fluid grid with no maximum; Notion lists Board as a view. Neither describes the phone.

**The sidebar.** Carbon: "As a header scales down to fit smaller screen sizes, header links and menus should collapse into a left-panel hamburger menu." Apple: "Consider automatically hiding and revealing a sidebar when its container window resizes" — but "Avoid hiding the sidebar by default."

**What must not change.** Apple states the invariant: "Keep functionality the same as size classes change… **you can change the amount of functionality that's visible onscreen as the amount of space changes**." Material's three adaptive strategies name the permitted moves — "show and hide, levitate, and reflow" — and its pane presentations the destinations: co-planar, floating (like a dialog), docked (like a bottom sheet).

---

## Part F. Alignment, spacing, whitespace, density

### F1. The unit

**The disagreement is 8 versus 4.** Carbon: "The basic unit of 2x Grid geometry is the **8-pixel square mini unit**… Margin and padding are always applied in fixed mini unit multiples." Fluent: "The base unit is **four pixels**" — then breaks its own rule, since "the values 2, 6, and 10 account for extra padding in the Fluent icons." Material: "Padding is measured in increments of **4dp**." Shopify: "The Shopify admin is built on a **4px spacing grid**." The "8-point grid" is Carbon's grid and Material's 2014 grid; the live consensus in dense product UI is a 4px ramp whose common multiple is 8. No study compares them.

### F2. Columns and maximum width

Carbon publishes 4 / 8 / 16 / 16 / 16 columns across its breakpoints and a 32px total gutter, with "For closely related content, consider a gutterless grid." Atlassian uses 12 columns above 1024px, 6 below, 2 on phones — and is the only system to tie **maximum width to archetype**:

| Grid type | Max width (margins included) | Use when | Examples |
|---|---|---|---|
| Fixed-wide (default) | **1296px** | "Content benefits from structure but doesn't need full width" | "Dashboards, directories, search results" |
| Fixed-narrow | **864px** | "Long-form reading is the primary activity" | "Blogs, articles, documentation" |
| Fluid | No maximum | "Content expands horizontally with no natural maximum width" | "Kanban boards, whiteboards" |

With the warning that names the cost of getting it wrong: "Don't use fluid grids for structured content with a natural width, such as dashboards or directories. **Elements lose their visual relationship at large viewports.**" Atlassian also scopes what the grid governs — "Small elements, like buttons and icons, do not need to align to this grid," and "Overlays… also sit outside the grid." Carbon gives the stretching rule: "If a user's goal is to see more items, scale column count by tiling fixed boxes. If a user wants to see more content within each item, scale boxes and use fixed column counts."

### F3. Alignment and scan time — the measured part

**Penzo (UXmatters, 2006)** eye-tracked four label layouts with expert and novice users. Left-aligned labels beside fields: "a medium saccade duration of **500ms**… is typical, which is quite long, showing that users were experiencing heavy cognitive loading." Right-aligning them "**reduced the overall number of fixations by nearly half**… Also, the form completion times were cut nearly in half," with saccades "only about **170ms** for expert users and **240ms** for novice users." Labels above fields: "shorter saccade times of just **50ms**." Bolding those labels cost 60% — "from 50ms without bold labels to **80ms** with bold labels — with no apparent advantage."

Caveats travel with these numbers: **no sample size is reported**, the stimuli are forms rather than records, and Penzo says the setup was artificial — "our ad-hoc test setup didn't resemble real-world conditions." The peer-reviewed replication (Das, McEwan & Douglas, NordiCHI 2008) was not readable for this memo. Apple states the mechanism without measuring it: "**People assume that aligned items are related to each other**, and conversely, they perceive indented items as subordinate to the item they follow."

### F4. Whitespace — the measured part

NN/g's **content dispersion** study (13 qualitative usability tests across dispersed and condensed versions of a homepage and a product page) defines the failure quantitatively: dispersed pages "typically had fewer than **7 unique content elements per screenful**, whereas condensed pages had a higher content density — around **8–14**," and dispersed examples "had a higher average (**30%**) of unused space, compared to **17%** for condensed pages."

The costs were "increased page length and interaction cost… increased cognitive load… difficulty building a conceptual model for the page… increased frustration… lower trustworthiness," and participants "had more difficulty finding information on the dispersed product page than on its condensed version." The pattern imported from mobile made it worse: "Accordions can contribute to content fragmentation and significantly increase the interaction cost of finding crucial information, **without the benefit they bring on mobile**." The recommendation most relevant to a record page is rule 5 restated as pixels: "**Keep critical, related content grouped together in the same viewport**… to reduce back-and-forth scrolling." The counterweight, from the same study: dispersion helped when "content is complex, allowing users to focus on understanding one piece at a time."

### F5. Density modes, row height, boxing

Carbon ships five row heights — extra small **24px**, small **32**, medium **40**, large **48**, extra large **64** — with one qualifier ("Extra large row heights are only recommended if your data is expected to have 2 lines of content in a single row") and one consistency rule ("Do use the same row height for the table and header rows").

Material's density guidance elaborates RULES.md rule 3's density exception. "The default target size should be at least **48x48 CSS pixels**." "Users can change density as long as the density controls are accessible." "Higher density is typically applied by decreasing the top and bottom padding or overall height by **4dp**." "To ensure that density settings can be easily reverted, targets in settings interactions must follow defaults." Two carve-outs: "Don't increase density in UIs that involve focused tasks, such as selecting from a menu," and "Don't increase the density in components that alert the user of changes, such as snackbars or dialogs." Plus the spatial-stability clause: "**Density shouldn't automatically change across window-size classes or device orientation without users changing it.**" Shopify adds: "Avoid changing information density within a single page."

On boxing, memo 29 settles the argument; two layout-level statements are new and opposed. Carbon: "**Avoid placing data tables inside data tables or smaller containers** where the information can feel cramped." Shopify: "The majority of your app's content should live in a container, such as a card," and "Avoid placing paragraphs of text directly on the background."

---

## Part G. Information structure inside a record page

**What the top carries.** Salesforce's masthead — title, supporting details, actions on large form factors. Polaris's header — actions affecting the whole object. NN/g gives the row-level rule and the failure mode: too little detail "will make them pogo stick" (navigate into each detail page for information that should have been in the list); too much and "users must scan through a long list of product attributes." Its instruction — "Treat each list entry as if it were a small webpage" — and its demand for "consistent styling across list entries to support comparison" are the row-level statement of BUILD-CHAINS's rule that the quick look shows the same fields in the same order as the top of the record.

**Sectioning versus tabs.** NN/g gives five conditions and a record page fails most: "when there are few content groupings… **The fewer tabs, the better**"; "Ensure that the content within nondefault tabs is **supplemental rather than critical**"; and "when users don't need to simultaneously see information presented under different tabs. Otherwise… a tab-based design **taxes users' short-term memory, increases cognitive load and interaction cost, and lowers usability compared to a design that puts everything on one big page**."

NN/g also separates the two kinds constantly confused: **in-page tabs** ("not for navigation but enable users to alter the content displayed in the panel"; narrow scope, related; "Remaining in the current view") from **navigation tabs** ("enable users to navigate to different pages"; broad scope, unrelated; "Slight loading delay"). A record page's related lists are the second kind wearing the first kind's clothes — which is why Salesforce needed console sub-tabs and Apple a third split-view pane.

On the alternative, NN/g says "On desktop, tabs may be preferable as accordions can make the page seem too empty when closed." Against that sit the dispersion finding that desktop accordions fragment content without the mobile payoff, and the table finding that people leave accordions open. The three reconcile only if "sections" means plain headings rather than collapsed accordions — which NN/g never says outright.

**Summary-first.** Nobody names a summary strip as a component. The nearest first-party statements are Apple's ordering rule ("place the most important items near the top and leading side of the window"), Polaris's index header, and Salesforce's masthead. The pattern is universal in practice and unspecified in every system read here.

---

## Part H. Synthesis

### The archetypes, one line each

1. **Index (list) page** — one full-width column: page header with object-level actions, filter/sort/select bar, rows of one object type, pager. For finding and acting on many.
2. **Record (detail) page** — one object from a shared template: masthead, key fields, related lists as scrolling sections. For dwelling on one.
3. **Master–detail** — index and record side by side; selection on the left updates the right; the detail is meaningful on its own.
4. **Supporting pane** — a narrower accessory pane (~30%) whose content is meaningless without the main pane. An inspector is this.
5. **Board** — a fluid, horizontally-expanding grouping of cards by one property, moved by drag and drop. The only archetype with no maximum width.
6. **Dashboard / home** — a feed-shaped grid of heterogeneous summary tiles, each a door to an index or record.
7. **Wizard / stepper** — a prescribed sequence of forms where later steps depend on earlier answers; for rare or unfamiliar processes.
8. **Settings** — grouped, scannable, independently-committed panels of configuration.
9. **Queue / inbox** — a master–detail whose list is ordered by work remaining rather than by object, walked with next and previous.
10. **Form** — one committed set of fields; labels above the field, or right-aligned beside it.

### The rules the sources agree on

1. **Everything is panes** — one to three, adapting by breakpoint (Material, Apple, Carbon, Fluent).
2. **Choose the overlay by whether the page behind is needed.** Needed and interactive → inline pane or non-modal panel. Needed for reference → non-modal overlay. Must be blocked → modal dialog. Nonessential and small → popover.
3. **The non-modal side pane is the default for opening a record from a list** (NN/g, Material, Notion, Fluent).
4. **Never nest overlays**, and only one open at a time (Fluent ×2, Carbon).
5. **Nothing decision-critical in an overlay, at the bottom of a sidebar, or at the bottom of a window** (Carbon, Apple ×2).
6. **Two levels of hierarchy in a sidebar; deeper means a third pane** (Apple).
7. **Breakpoints follow the viewport, not the content area** (Atlassian).
8. **Functionality does not change with width; only how much of it is visible** (Apple, Material) — and a list-detail collapsing to one pane keeps its selection (Material).
9. **Max width is chosen by archetype** — structured ≈1300px, long-form ≈860px, board fluid (Atlassian).
10. **Alignment is a grouping signal, and misalignment is measured in saccades** — 500 / 170–240 / 50ms (Penzo; Apple states the mechanism).
11. **Whitespace past a threshold is a cost** — below ~7 content elements per screenful and above ~30% unused space, finding gets harder (NN/g).
12. **Density is a user-owned control with a floor** — 48×48 target, reversible, never changed automatically by width (Material), never varied within a page (Shopify).
13. **Hover may aid scanning; it may not be the only route to a control** (Carbon, NN/g).
14. **Tabs only when the two sides are never needed together, and never for critical content** (NN/g).
15. **Row actions are secondary in style; the toolbar holds at most five** (Shopify, Carbon).

### Disagreements

- **The base unit.** 8px (Carbon) versus 4px (Fluent, Material, Shopify). The "8-point grid" is no longer what most systems ship.
- **Whether the pane divider should be visible.** Material gives it a 24dp spacer and a handle with an overlapping touch target; Apple prefers a 1pt divider plus a toolbar button. Opposite answers to one discoverability problem.
- **Where the record opens.** Notion makes side/center/full a per-view user setting; Salesforce opens sub-tabs; Material and NN/g default to a pane. Nobody argues their choice against the others.
- **How many columns a page has.** Polaris: one, full-width for indexes. Atlassian: 12. Carbon: 16.
- **Sections versus tabs on a record.** NN/g prefers tabs to accordions in one article and condemns desktop accordions and warns off tabs for comparison work in two others.
- **Whether tables belong in containers.** Carbon forbids a table inside a smaller container; Shopify puts nearly everything in a card.
- **Fluent against itself.** It warns against breaking conventions, then specifies a collapsed responsive drawer re-invoked "on hover or focus" — a hover-only route.

### Still unknown

- **No controlled comparison of overlay types for record work.** NN/g's ranking is observational — "we routinely observe in testing" — with no sample, times or error rates. The central layout decision in a B2B app rests on it.
- **No measurement of hover-revealed versus always-visible row actions.** Everyone says hover-only is bad; nobody reports what it costs.
- **No published breakpoint behaviour for a board.** What a kanban board becomes at 400px is undocumented in every system read here.
- **No reference implementation of the keyboard splitter.** W3C specifies the contract and tracks the missing example as issue 130.
- **No sample size behind the alignment numbers.** Penzo reports neither n nor variance; the peer-reviewed replication could not be read.
- **No evidence either way on density modes in B2B.** Material specifies the mechanics in detail and cites no study.
- **No specification anywhere for a summary strip.** Universal in practice, absent from all eight systems.
- **Whether the ~7-element and 30%-whitespace thresholds transfer.** NN/g measured consumer marketing pages with 13 participants; nobody has run the equivalent on a dense internal tool whose baseline density is higher and whose users are daily.
- **Whether a per-view "how rows open" setting helps or fragments.** Notion ships it; nobody has tested whether it costs the consistency that makes a template worth having.

---

## Bibliography

**Tier 1 — specification and published method (fetched 22 Sep 2026)** — Penzo, M. (2006), "Label Placement in Forms," *UXmatters*, uxmatters.com/mt/archives/2006/07/label-placement-in-forms.php (*eye-tracking, expert and novice users; **no sample size reported***) · Das, S., McEwan, T. & Douglas, D. (2008), "Using eye-tracking to evaluate label alignment in online forms," *NordiCHI '08*, doi 10.1145/1463160.1463217 (***not readable — ACM DL bot challenge; named, not quoted***) · Nielsen Norman Group, "The Negative Impact of Mobile-First Web Design on Desktop," nngroup.com/articles/content-dispersion/, with "Content Dispersion: Study Methodology," /articles/content-dispersion-methodology/ (*13 qualitative usability tests, 4 prototypes*) · W3C WAI, ARIA Authoring Practices Guide, "Grid Pattern," w3.org/WAI/ARIA/apg/patterns/grid/, and "Window Splitter Pattern," /patterns/windowsplitter/ (*ARIA 1.1 review caveat; example tracked as issue 130*)

**Tier 2 — first-party documentation (22 Sep 2026)** — Android Developers, "Canonical layouts" and "Window size classes," developer.android.com/develop/ui/compose/layouts/adaptive/canonical-layouts · **Material Design 3**, "Layout overview," "Spacing," "Density," as JSON from `m3.material.io/_dsm/content/m3/2026-09-16_06-10-03/{fileId}.json`; public URL m3.material.io/foundations/layout (*HTML serves a JavaScript shell*) · Apple, Human Interface Guidelines, "Split views," "Sidebars," "Layout," developer.apple.com/design/human-interface-guidelines/split-views (*read as JSON; **no `inspectors` page exists***) · Microsoft Fluent 2, "Layout," "React Drawer / Dialog / Popover usage," fluent2.microsoft.design/layout · IBM Carbon, "2x Grid: Overview," "Data table: Usage" and "Style," "UI shell header: Usage," "Disclosures pattern," "Filtering pattern," carbondesignsystem.com/elements/2x-grid/overview/ · Atlassian Design System, "Grid," atlassian.design/foundations/grid · Shopify, "Layout" (app design guidelines), shopify.dev/docs/apps/design-guidelines/layout; Polaris, "Resource index layout" and "Index table," Wayback 2025, polaris.shopify.com/patterns/resource-index-layout · Salesforce Lightning Design System, "Page Headers," Wayback 12 Jun 2018, lightningdesignsystem.com/components/page-headers/ (***live SLDS 2, help.salesforce.com and developer.salesforce.com all unreadable to a fetcher***) · Notion, "Database views, filters, sorts & groups" and "Keyboard shortcuts," notion.com/help/views-filters-and-sorts · Visual Studio Code, "User interface" and "Custom Layout," code.visualstudio.com/docs/getstarted/userinterface · Linear, "Linear Method," linear.app/method/introduction (***linear.app/docs is a JavaScript shell; no layout documentation obtained***)

**Tier 3 — practitioner** — Nielsen Norman Group: "Data Tables: Four Major User Tasks," nngroup.com/articles/data-tables/ · "Tabs, Used Right," /articles/tabs-used-right/ · "Modal & Nonmodal Dialogs," /articles/modal-nonmodal-dialog/ · "Wizards: Definition and Design Recommendations," /articles/wizards/ · "Drag-and-Drop: How to Design for Ease of Use," /articles/drag-drop/ · "The Anatomy of a List Entry," /articles/list-entries/ · "Designing Effective Contextual Menus: 10 Guidelines," /articles/contextual-menus-guidelines/

*Carried forward from memo 29, not re-argued: the containment ordering (whitespace → divider → tone → shadow); the three-level nesting ceiling; Baymard on dashboard-card consistency and over-encapsulation; Cowan's group size of four; the Atlassian/Carbon disagreement about the page canvas.*
