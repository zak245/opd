# Progressive Disclosure: UI Patterns and Techniques as Documented by Design Systems

Research date: 2026-09-12. All quotations below were fetched from the cited URL during this research session unless explicitly flagged as coming from a search snippet or a secondary source. Where a primary page could not be fetched (JS-rendered, 403, or redirected), that is stated so the reader can weigh the evidence.

---

## (A) Design-system definitions and rules

### Nielsen Norman Group (the canonical definition most systems cite)
URL: https://www.nngroup.com/articles/progressive-disclosure/

- Definition: progressive disclosure "defers advanced or rarely used features to a secondary screen, making applications easier to learn and less error-prone."
- Rule: "Initially, show users **only a few** of the most important options."
- Signalling rule: "the very fact that something appears on the initial display tells users that it's **important**."
- Splitting rule: include all frequently needed features in the initial display; decide the split through task analysis, field studies and usage statistics.
- Level rule: designs typically should not exceed two disclosure levels; if you need three or more, simplify the design instead.
- NN/g distinguishes **progressive disclosure** (hierarchical: core view -> secondary view -> back; most users never leave the initial display) from **staged disclosure** (linear sequence of steps, e.g. wizards, where users traverse the whole sequence).
- Benefits listed: learnability, efficiency, and error rate.

### SAP Fiori Design Guidelines
Attempted URL: https://experience.sap.com/fiori-design-web/progressive-disclosure/ (now 301-redirects to https://www.sap.com/design-system/). The current guideline that carries the PD rules is https://www.sap.com/design-system/fiori-design-web/v1-108/foundations/ai-and-joule-design/guidelines/explainable-ai (returned 403 to direct fetch; quotes below are from the search index of that page).
- "Progressive disclosure avoids overwhelming users with too much information at once."
- Rules: "Reveal information progressively, add value with each disclosure level, do not just repeat information from the previous level, and make sure that the information on each level is self-contained with all elements forming a natural flow."
- "The foundation for progressive disclosure is a solid information architecture, which allows you to apply the pattern at several levels."
- Fiori applies the principle in the Object Page (header facets -> sections -> subpages) and in "explanation levels" for AI explanations, so that "explanations don't clutter the existing UI, and users only need to concern themselves with details if they actually need them."

### Apple Human Interface Guidelines: Disclosure controls
URL: https://developer.apple.com/design/human-interface-guidelines/disclosure-controls (content fetched via the HIG JSON endpoint https://developer.apple.com/tutorials/data/design/human-interface-guidelines/disclosure-controls.json)
- "Disclosure controls reveal and hide information and functionality related to specific controls or views."
- Core rule: "Use a disclosure control to hide details until they're relevant. Place controls that people are most likely to use at the top of the disclosure hierarchy so they're always visible, with more advanced functionality hidden by default."
- Disclosure triangle: "points inward from the leading edge when its content is hidden and down when its content is visible." Example: "Keynote uses a disclosure triangle to show advanced options when exporting a presentation, and the Finder uses disclosure triangles to progressively reveal hierarchy."
- Labeling rule: "Provide a descriptive label when using a disclosure triangle. Make sure your labels indicate what is disclosed or hidden, like 'Advanced Options.'"
- Disclosure button: "points down when its content is hidden and up when its content is visible" (e.g., the macOS Save sheet). Rules: "Place a disclosure button near the content that it shows and hides" and "Use no more than one disclosure button in a single view. Multiple disclosure buttons add complexity and can be confusing."
- Platform: SwiftUI `DisclosureGroup` on iOS/iPadOS/visionOS; "Not supported in tvOS or watchOS."

### GitLab Pajamas
URL: https://design.gitlab.com/usability/progressive-disclosure
- Definition (paraphrased from page): an interaction pattern that defers less important information and features to secondary screens, initially showing only the most important content, using triggers to reveal hidden objects.
- Rules: display priority information prominently; "Distinguish primary from secondary actions" using research and usage data; "Create clear trigger actions" using established UI patterns like links or buttons; limit disclosure to two levels ("three or more suggests the feature needs redesign").
- Techniques explicitly listed: forms in modals/new pages to add items to tables; accordions; hamburger menus; "more actions" dropdowns; truncated content and previews; scrollable overflow; skeleton loaders for lazy loading; step-by-step flows.
- When not to use: "when critical information is hidden, as this may frustrate users who need immediate access to essential features."

### IBM Carbon Design System
URLs: https://carbondesignsystem.com/patterns/disclosures-pattern/ (source mdx fetched from GitHub), https://carbondesignsystem.com/components/accordion/usage/, https://carbondesignsystem.com/components/overflow-menu/usage/, https://carbondesignsystem.com/patterns/empty-states-pattern/
- Disclosures pattern: "Disclosures are moments that open up on a page and reveal additional information related to the source it is triggered from." A disclosure has "a trigger that the user interacts with by clicking or using their keyboard and the container that opens and discloses the content."
- Tooltip vs disclosure: "the content expanded by a disclosure may contain interactive elements" (tooltips must not). Toggletip is "triggered on click to disclose the information inside of a popover." "A popover component is used as the underlying layer of a disclosure."
- Do not use disclosures for critical information ("Use the modal component instead"), for popovers not initiated by the user, or for content requiring "a width larger than six columns."
- Accordion: "a vertically stacked list of headers that reveal or hide associated sections of content." "Accordions begin by default in the collapsed state." "The chevron points down to indicate collapsed and up to indicate expanded." "Content should not scroll inside of an individual panel." Don't use for large nested structures (use tree view) or "when users will likely read all content."
- Overflow menu: "Use the overflow menu component when additional options are available to the user but there is a space constraint." Destructive actions "separated by a divider and live below the primary set of actions."

### Microsoft Fluent 2
URLs: https://fluent2.microsoft.design/components/web/react/core/accordion/usage, https://fluent2.microsoft.design/layout
- "An accordion groups sections of related content that can be opened and closed." "Accordions decrease cognitive load by letting people choose which sections of content they see, like questions in an FAQ."
- Hard rule: "Never put information that's required for the current task inside an accordion." "Never put information in one accordion item that needs to be referenced in another accordion item."
- Icon: "The chevron icon signifies additional content and indicates an accordion item's interaction." "Be consistent with the icon placement within an experience."
- Content: "An accordion header should give an idea of the content in the accordion panel." "Keep headers brief." Sentence case, no trailing periods.
- Responsive layout page: re-architecting content for window size "is similar to following the practice of 'progressive disclosure' in your design but for different window sizes and orientation."

### Shopify Polaris
Polaris's foundations pages (polaris-react.shopify.com/foundations/information-architecture, /patterns/common-actions/best-practices) now 301 to shopify.dev; quotes below are from the search index of those pages plus Shopify's Partners article https://www.shopify.com/partners/blog/progressive-disclosure (fetched).
- IA foundation (search snippet): progressive disclosure gives merchants "all the information they need without overloading them with information or burdening them with excessive choice."
- Common actions (search snippet): "On desktop ... use progressive disclosure to expose actions in context when the merchant needs them. List item actions like edit, delete, copy, and remove should be shown on hover."
- Setting toggle (search snippet): if a setting "uses progressive disclosure, or has options that are not a simple 'On'/'Off', use a different UI element such as Checkbox or Radio button."
- Partners article: "Progressive disclosure is a concept of managing information that dictates that everything in a user interface should progress naturally, from simple to complex." Cautions: "Designs that go beyond two disclosure levels typically have low usability"; label controls with "clear expectations for what users will find."

### GOV.UK Design System
URLs: https://design-system.service.gov.uk/components/details/, https://design-system.service.gov.uk/components/accordion/, https://design-system.service.gov.uk/components/radios/, https://design-system.service.gov.uk/patterns/question-pages/, https://design-system.service.gov.uk/patterns/step-by-step-navigation/, https://www.gov.uk/service-manual/design/form-structure
- Details: "Use the details component to make a page easier to scan when it contains information that only some users will need." "Do not use the details component to hide information that the majority of your users will need." "Make the link text short and descriptive so users can quickly work out if they need to click on it." Research caveat: some users avoid clicking because they think it navigates away; voice-control users may struggle.
- Accordion: use only with evidence that users need to "see an overview of multiple, related sections," "choose to show and hide sections," or "look across information that might otherwise be on different pages." Do not use for content all users must see; do not nest accordions; do not use for a series of questions. Alternatives: simplify content, split into pages, headings plus anchor links.
- Radios, conditionally revealed questions: "Keep it simple. If the related question is complicated or has more than one part, show it on the next page." "Do not conditionally reveal questions to inline radios." "Conditionally reveal questions only." Known WCAG failure: "Users are not always notified when a conditionally revealed question is shown or hidden. This fails WCAG 2.2 success criterion 4.1.2 Name, role, value."
- One thing per page: "Asking just one question per question page helps users understand what you're asking them to do, and focus on the specific question and its answer." Service Manual benefits: users "understand what you're asking them to do," "recover easily from form errors," "use the service on a mobile device"; teams can "save a user's answers automatically as they go" and "handle branching questions and loops."
- Step by step navigation: for journeys that "have a specific start and end point" and "where it's helpful for the user to complete tasks in a specific order." Not for use "inside a transactional service." Research: "Users rarely use the step by step navigation header."

### US Web Design System (USWDS) Accordion
URL: https://designsystem.digital.gov/components/accordion/
- Use "If users will only need a few specific pieces of content within a page" or "If you have only a small space to display a lot of content."
- Consider something else "If users need to see most or all of the information on a page" or "If there is not enough content to warrant condensing. Accordions increase cognitive load and interaction cost because users have to make decisions about what headers to click on."
- "Make the entire header selectable." "Code header areas in the accordion as buttons." "Use meaningful expansion button labels. Aim for informative labels like 'Explore federal compliance checklists' rather than vague ones like 'Click here.'" Use `aria-controls` and unique ids.

### Material Design 3
Material pages are JS-rendered and could not be fetched directly; the following comes from the search index of https://m3.material.io/components/bottom-sheets/overview and https://m3.material.io/components/menus/guidelines.
- Bottom sheets: standard sheets "display supplementary content without blocking access to the screen's primary content"; modal sheets "appear in front of app content, disabling all other app functionality." Content "should be additional or secondary (not the app's main content)."
- Menus: "Menus display a list of choices on a temporary surface."

### Salesforce Lightning Design System / Salesforce platform
URLs: https://trailhead.salesforce.com/content/learn/modules/best-practices-in-lightning-web-components/use-progressive-disclosure-and-conditional-rendering (fetched), http://v1.lightningdesignsystem.com/components/expandable-section/ (fetched), lightning-accordion docs (search)
- Salesforce definition: progressive disclosure "maintains user focus by reducing clutter, confusion, and cognitive workload" by "presenting only the minimum data required for the task at hand." Implementation techniques: lazy instantiation (tabs load on selection, quick actions) and conditional rendering (`lwc:if`, dynamic component visibility).
- SLDS Expandable Section blueprint toggles `.slds-is-open` on `.slds-section`; the lightning-accordion "follows the WAI-ARIA Authoring Practices for the accordion pattern" and "sets aria-hidden to true if the section is collapsed."

### Adobe Spectrum
Spectrum's design pages are JS-rendered; from the React Spectrum / Spectrum Web Components docs (search index): "An accordion is a group of disclosures that can be expanded and collapsed"; "Each accordion item should have a clear, descriptive label that indicates what content will be revealed when expanded."

### Ant Design
URLs: https://ant.design/components/collapse, https://ant.design/components/drawer, https://ant.design/components/popover
- Collapse: "Can be used to group or hide complex regions to keep the page clean." "Accordion is a special kind of Collapse, which allows only one panel to be expanded at a time."
- Drawer: "When subtasks are too heavy for a Popover and we still want to keep the subtasks in the context of the main task, Drawer comes very handy."
- Popover: "Comparing with Tooltip, besides information Popover card can also provide action elements like links and buttons."

### Workday Canvas
URLs: https://canvas.workday.com/components/containers/expandable-container, https://canvas.workday.com/components/containers/side-panel (both 403 to direct fetch; from search index)
- "Expandable Container hides and shows information to create a focused experience for users." Chevron rule: on the left, Chevron Right = collapsed and Chevron Down = expanded; on the right, Chevron Down = collapsed and Chevron Up = expanded.
- Pill filters "add progressive disclosure to your filters by increasing learnability and reducing filter errors."

### ServiceNow Horizon
URLs: https://horizon.servicenow.com/workspace/components/now-accordion, .../now-collapse, .../now-display-value-block (403 to fetch; from search index)
- Accordion is "a collapsible control for presenting information in a limited amount of space"; "Use an accordion to organize content that's structured in sections or steps."
- Collapse is "a component behavior for use cases outside of accordion," e.g. "Show more" for truncated text. The display value block has an optional disclosure control that shows one row of label-value pairs collapsed and all pairs expanded.

### Oracle Redwood
URL: https://blogs.oracle.com/vbcs/post/drawer (403 to fetch; from search index): Redwood drawers let users "edit specific sections within a slide-out drawer, offering a more focused and streamlined editing experience ... reducing on-page clutter and preserving the overall page context."

### Zendesk Garden
URL: https://garden.zendesk.com/components/accordion
- "Accordions are headers that can be expanded to reveal content or collapsed to hide it." Use "To surface information through progressive disclosure." Not for processes: "To guide users through a process use a Stepper instead." Requires a `level` prop that sets `aria-level`.

### Atlassian Design System and Intuit
- Atlassian: no dedicated progressive-disclosure guideline page was found; the relevant components are Inline Edit ("displays a custom input component that switches between reading and editing on the same page", https://atlassian.design/components/inline-edit), Dropdown Menu ("displays a list of actions or options"), Table Tree, and the legacy AUI Expander ("show users one or more small snippets of a larger body of text to keep the user interface lightweight and scannable").
- Intuit: no public guideline page on progressive disclosure was found for the Intuit/QuickBooks design system; searches only surfaced general descriptions of TurboTax's "progressive" interview-style UI.

### HashiCorp Helios (permissions and hide/disable)
URL: https://helios.hashicorp.design/patterns/disabled-patterns
- "We recommend avoiding use of disabled elements. Disabled elements cannot be navigated to or interacted with, making them inaccessible to users who rely on assistive technology."
- "When a user does not have permissions, hide the related actions, navigation items, and views."
- "In a form, always enable the submit button."

---

## (B) Pattern catalog

Each entry: what it is; when to use; when not to use; accessibility; sources.

### 1. Accordion
- What: vertically stacked headers that each toggle a content panel (WAI-ARIA APG: "a vertically stacked set of interactive headings").
- Use when: users need "only a few specific pieces of content" (USWDS); content forms an overview of related sections (GOV.UK); space is constrained, especially mobile (Carbon, NN/g: "on mobile, accordions are one of the most useful design elements").
- Don't use when: users need most or all of the content (USWDS, NN/g: "Better to show all page content at once when the use case supports it"); required task information would be hidden (Fluent: "Never put information that's required for the current task inside an accordion"); content must be compared across panels (Fluent); large nested hierarchies (Carbon: use tree view); series of questions or nested accordions (GOV.UK); processes (Garden: use a stepper).
- Rules: collapsed by default (Carbon, Fluent); prefer allowing multiple panels open (NN/g, Carbon); entire header is the hit target (USWDS); provide "Show all sections" (GOV.UK); consider sticky headers and treat Back as collapse on mobile (NN/g).
- Accessibility (APG): header contains a `button` inside a `heading` with `aria-level`; `aria-expanded` true/false; `aria-controls` to panel; Enter/Space toggle; all headers in Tab order; optional `region` role with `aria-labelledby`. GOV.UK research: screen-reader/voice users navigating by element lists may not recognise headings as buttons.
- Sources: APG accordion, USWDS, Carbon, Fluent 2, GOV.UK accordion, NN/g accordions-complex-content, NN/g mobile-accordions, Garden, Ant Design.

### 2. Tabs
- What: "a set of layered sections of content, known as tab panels, that display one panel of content at a time" (APG).
- Use when: content has few, clearly distinct groupings with short labels and no need for cross-comparison; high-use content first and selected by default (NN/g).
- Don't use when: users must compare across sections, labels are long, tabs overflow into carousels, or users must switch repeatedly (NN/g). NN/g: "All tabs should all look and work the same"; don't mix navigation tabs with in-page tabs.
- Accessibility (APG): `tablist`/`tab`/`tabpanel`; `aria-selected`; arrow keys move between tabs; automatic activation is recommended "if content preloads without latency," otherwise manual activation with Enter/Space. Salesforce notes tabs are a natural place for lazy instantiation.
- Sources: APG tabs, NN/g tabs-used-right, Salesforce Trailhead.

### 3. "Show more" / "Advanced options" toggles and the details element
- What: a single disclosure button that expands a region (APG disclosure: "a widget that enables content to be either collapsed (hidden) or expanded (visible)"). The HTML `<details>/<summary>` is the native form; Apple's disclosure triangle/button and GOV.UK Details are design-system instances.
- Use when: information "only some users will need" (GOV.UK); advanced/rarely used settings (Apple: "Advanced Options"; Shopify: "Advanced settings"); truncated text (Horizon Collapse, Pajamas "truncated content and previews").
- Don't use when: the majority of users need it (GOV.UK); more than one disclosure button per view (Apple); the hidden region contains a multi-part question (GOV.UK radios).
- Labeling: "Make sure your labels indicate what is disclosed or hidden" (Apple); "short and descriptive" link text (GOV.UK).
- Accessibility: APG disclosure requires `role=button` with `aria-expanded` and optional `aria-controls`. Native `<details>` caveats (Scott O'Hara): the summary role is announced inconsistently ("Disclosure Triangle," "Button," "Summary," or nothing); "the announcement of the default triangle direction is the only way state is communicated" in some pairings, so don't remove the marker without another state cue; adding `role=button` breaks Safari state; use native details when find-in-page auto-reveal is desirable, custom ARIA when consistent behavior matters (navigation, modals).
- Sources: APG disclosure, Apple HIG, GOV.UK details, Scott O'Hara details/summary, Horizon collapse.

### 4. Expandable table rows and master-detail
- What: a table row acts as summary; a disclosure control reveals detail inline (line items, logs) without leaving the table. Alternatives are opening a modal or a side "quick view."
- Use when: rows have secondary detail that some users need and the table must stay scannable; hierarchical data users drill into.
- Don't use when: detail is needed for every row (show columns instead) or detail is a full editing task (use drawer/page: Ant Design's "subtasks too heavy for a Popover").
- Accessibility: the expand control is a button with `aria-expanded`; Salesforce warns that collapsed sections with `aria-hidden` are removed from AT entirely; keep expanded content in DOM order after its row.
- Sources: search synthesis (Setproduct, AG Grid master/detail, Material React Table), Ant Design drawer, Salesforce accordion docs.

### 5. Drawers, side panels, slide-overs, sheets
- What: a panel that slides in from an edge, keeping page context. Material distinguishes standard (non-modal, no scrim) from modal sheets (scrim, blocks app).
- Use when: "subtasks are too heavy for a Popover and we still want to keep the subtasks in the context of the main task" (Ant); editing a section "while preserving the overall page context" (Redwood); supplementary content that "should be additional or secondary" (Material).
- Don't use when: the content is the primary content of the screen (Material); the task needs a full page or comparison with content the panel covers.
- Accessibility: modal drawers follow the APG modal dialog rules (focus in, focus trap, Escape, focus return); non-modal panels must remain reachable in Tab order and be announced as regions.
- Sources: Ant drawer, Material bottom sheets, Oracle Redwood drawer post, Workday Canvas side panel, APG dialog.

### 6. Modals and dialogs
- What: NN/g: a modal "moves the system into a special mode requiring user interaction" and "disables the main content until the user explicitly interacts with the modal dialog"; nonmodal dialogs let work continue.
- Use when: critical errors/irreversible actions, information required to continue a user-initiated process, breaking a complex task into steps, preventing high-stakes mistakes. "No one likes to be interrupted, but if you must, make sure it's worth the cost" (NN/g). Carbon: use a modal, not a disclosure, for critical information.
- Don't use when: nonessential information, marketing, decisions requiring outside information, high-stakes flows like checkout (NN/g); Pajamas warns against hiding critical information behind triggers.
- Accessibility (APG): `role=dialog`, `aria-modal=true`, `aria-labelledby`; "When a dialog opens, focus moves to an element inside the dialog"; "Tab and Shift + Tab do not move focus outside the dialog"; Escape closes; "When a dialog closes, focus returns to the element that invoked the dialog."
- Sources: NN/g modal-nonmodal, APG dialog-modal, Carbon disclosures.

### 7. Popovers, tooltips, toggletips and hover reveals
- What: tooltip = brief, non-interactive text on hover/focus (NN/g); popover/toggletip = click-triggered container that "may contain interactive elements" (Carbon); Ant: Popover "can also provide action elements like links and buttons."
- Use when: explaining unlabeled icons or unfamiliar fields; "supplementary information users don't need to complete tasks" (NN/g).
- Don't use when: the information is essential ("Users shouldn't need to find a tooltip in order to complete their task," NN/g); on touch ("not normally available on touchscreens"); for content wider than six columns or not user-initiated (Carbon).
- Accessibility: WCAG 1.4.13 requires hover/focus content be dismissible ("without moving pointer hover or keyboard focus," e.g. Escape), hoverable ("the pointer can be moved over the additional content without the additional content disappearing"), and persistent ("remains visible until the hover or focus trigger is removed"). Tooltips must trigger on keyboard focus as well as hover (NN/g).
- Sources: NN/g tooltip-guidelines, WCAG 1.4.13 Understanding, Carbon disclosures, Ant popover.

### 8. Contextual (right-click) menus, overflow ("kebab"/"meatball") menus, menu buttons
- What: NN/g: "a type of menu that appears on demand and contains a small set of relevant actions related to a control, an area of the interface, a piece of data." Overflow menu: "when additional options are available to the user but there is a space constraint" (Carbon). Menu button: "often styled as a typical push button with a downward pointing arrow or triangle" (APG).
- Rules: keep to focused, related actions; "all contextual menu commands are also available in main navigation"; under 10-12 items; order by frequency; "Disable rather than hide irrelevant options" inside a menu; signal availability with an ellipsis or arrow; avoid gear/hamburger icons for item-level menus (NN/g). Carbon: destructive actions below a divider. Gesture-only menus (swipe, long press) have poor discoverability; "the actions available through the gesture should also be present in the visible UI" (NN/g).
- Don't use when: a primary action would be buried; note that hiding also hides information scent about what the product can do.
- Accessibility (APG menu button): `role=button` with `aria-haspopup="menu"` and `aria-expanded`; Enter/Space open and focus first item; Down/Up Arrow optional; container `role=menu`.
- Sources: NN/g contextual-menus, Carbon overflow-menu, APG menu-button, Material menus (search).

### 9. Wizards, multi-step forms, steppers and "one thing per page"
- What: NN/g: "a step-by-step process that allows users to input information in a prescribed order and in which subsequent steps may depend on information entered in previous ones." NN/g classifies this as staged disclosure, not progressive disclosure proper. GOV.UK's "one thing per page" is the extreme form: one question per screen.
- Use when: "novice users or infrequent processes (e.g., configuration or setup)" (NN/g); branching questions and loops; mobile use; error recovery (GOV.UK Service Manual).
- Don't use when: the task is repeated frequently, requires comparing across steps, or expert users need control (NN/g); GOV.UK: merge pages only when "User research will tell you," e.g. internal users who "repeat and switch between tasks quickly."
- Rules: show a diagram of steps and the current one; enforce order; descriptive button labels rather than "Next"; allow exit and resume; steps "self-sufficient" (NN/g). GOV.UK: set the `<label>` or `<legend>` as the page heading.
- Accessibility: each step is a page or a region with a heading; progress must be conveyed in text, not just visual step indicators; focus management on step change.
- Sources: NN/g wizards, GOV.UK question pages, Service Manual form structure, GOV.UK step by step, Garden stepper note.

### 10. Conditional form fields (responsive disclosure in forms)
- What: a field appears only after a triggering answer (GOV.UK radios "conditionally revealing a related question").
- Use when: one simple, related follow-up question is only relevant for one option.
- Don't use when: the follow-up is "complicated or has more than one part"; with inline yes/no radios; to reveal anything that is not a question (GOV.UK).
- Accessibility: GOV.UK acknowledges the show/hide is not always announced and "fails WCAG 2.2 success criterion 4.1.2." Mitigations: keep it simple, place revealed field directly after its trigger in DOM order, consider `aria-expanded` on the control or a live-region announcement.
- Sources: GOV.UK radios, Tidwell (responsive disclosure, section C).

### 11. Inline / progressive editing
- What: "a custom input component that switches between reading and editing on the same page" (Atlassian Inline Edit). Editing chrome (inputs, save/cancel) is disclosed only when the user commits to editing.
- Use when: small, independent field edits in dense pages (tickets, records); Redwood's drawer editing is the heavier sibling for whole sections.
- Don't use when: fields depend on each other or need validation as a set; use a form, drawer, or modal.
- Accessibility: the read-mode element must be a focusable button that announces it is editable; focus moves into the input on activate and back on save/cancel; announce success.
- Sources: Atlassian inline edit, Oracle Redwood drawer.

### 12. Command palettes (Cmd+K) and search-driven discovery
- What: "a reliable way to find and run commands, destinations, and recent items from a single keyboard-first surface" (uxpatterns.dev). A disclosure mechanism where the user's query, not a fixed hierarchy, selects what is revealed.
- Use when: many commands, repeat use, power users; "Use when repeat use and speed matter more than exhaustive discovery" (search synthesis).
- Don't use when: "the product surface is still small"; "Do not introduce hidden power-user behavior before the plain path is already strong" (uxpatterns.dev). Keep a visible trigger (a Cmd+K chip in the search bar) because the shortcut alone is undiscoverable.
- Accessibility: fully keyboard operable; visible focus at high zoom; combobox/listbox semantics; announce result counts; reduced-motion tested.
- Sources: uxpatterns.dev command palette, Mobbin glossary and Medium (search).

### 13. Collapsible sidebars and hidden navigation (hamburger)
- What: primary navigation hidden behind an icon or collapsed rail.
- Evidence: NN/g found "discoverability was significantly lower when the navigation was hidden"; desktop users were "at least 39% slower" and mobile users "15% slower" with hidden navigation; hidden navigation "provides a worse user experience than visible or partially visible navigation does, in both mobile phones and desktop."
- Use when: mobile viewport truly lacks room; prefer partially visible ("combo") navigation.
- Don't use when: desktop has space; when key destinations must be discoverable.
- Accessibility: APG "disclosure navigation menu" example (button with `aria-expanded` controlling a list) rather than `role=menu`; keyboard reachable toggle.
- Sources: NN/g hamburger-menus, APG disclosure examples, Pajamas (hamburger listed as PD).

### 14. Nested settings and "Advanced" sections
- What: second-level screens for rarely used options (NN/g's core example; Apple's Keynote export "Advanced Options"; Shopify's "Advanced settings" for experienced users).
- Rules: at most two levels (NN/g, Pajamas, Shopify); decide the split from usage data, not assumptions ("you are not the user", Shopify); Polaris: a setting that "uses progressive disclosure" should not be a simple toggle.
- Accessibility: same as disclosure or page navigation; keep a visible breadcrumb/back path.

### 15. Lazy loading, infinite scroll, "Load more"
- What: content revealed as the user scrolls. Pajamas lists "skeleton loaders during lazy loading" and "scrollable overflow" as PD techniques, and Shopify lists "lazy loading" as one; NN/g treats infinite scroll as a browsing pattern rather than a disclosure pattern.
- Use when: "users will want to scroll through homogeneous items with no particular task or goal in mind" (NN/g).
- Don't use when: users need to refind items, compare, reach the footer, or rely on assistive technology; "Infinite scrolling can make it impossible to access the footer"; creates an "illusion of completeness" (NN/g). Prefer a Load More button.
- Accessibility: keyboard and screen-reader users lose landmarks; announce loaded batches; provide pagination alternatives.
- Sources: NN/g infinite-scrolling-tips, Pajamas, Shopify partners.

### 16. Hover-revealed actions in tables and lists
- What: row actions (edit, delete, copy) shown only on pointer hover (Polaris: "List item actions like edit, delete, copy, and remove should be shown on hover" on desktop). Designing Web Interfaces (Scott and Neil) catalogs this as "Hover-Reveal Tools" versus "Always-Visible Tools" and "Toggle-Reveal Tools."
- Problems: "many people don't use a mouse ... a keyboard alone, touchscreen, or assistive devices that don't support hover interactions" (BOIA). WCAG 2.1.1 requires all functionality to be keyboard operable; touchscreens have no hover state; hover-only actions also reduce discoverability.
- Rules: "Any hover actions work the same when the element receives keyboard focus"; style `:focus`/`:focus-within` like `:hover`; keep the actions in DOM at all times (visually hidden, not `display:none`) or provide a persistent overflow menu; on touch, always show or use an explicit menu.
- Sources: BOIA hover actions, WCAG 1.4.13, Polaris common actions (search), O'Reilly Designing Web Interfaces ch.4 (search).

### 17. Ellipsis "More options" and contextual toolbars
- Ellipsis: a horizontal or vertical ellipsis signals a menu of additional actions (NN/g recommends ellipsis or arrow as the signifier; avoid gear/hamburger for local actions).
- Contextual toolbars (Google Docs selection toolbar, Figma property panel, Office contextual tabs): tools appear only for the selected object. Office 2007's contextual tabs "allowed for context-specific tools to be woven into the interface when working with a specific object ... and disappear when they're no longer relevant" (search summary of Jensen Harris). Unity's Contextual Tooling guideline: "Most features need specific context, like a particular selection, tool, or view mode, to be useful. If a feature ignores this context, it will show up even when it can't be used, making it seem broken."
- Risks: mode confusion and "where did the tool go" when selection changes; ensure the same commands are reachable from a stable menu (NN/g contextual menu rule).
- Sources: NN/g contextual-menus, Unity contextual tooling, Jensen Harris pages (search), O'Reilly Designing Web Interfaces.

### 18. Semantic zoom / zoomable UI
- What: Microsoft: "Semantic zoom lets the user switch between two different views of the same content so that they can quickly navigate through a large set of grouped data." Zoomed-out shows group headers; zoomed-in shows items. Unlike optical zoom, representation changes with scale.
- Use when: "a grouped data set that's large enough that it can't all be shown on one or two pages."
- Rules: keep layout and panning direction consistent across levels; "limit the number of pages/screens to three in the zoomed-out mode"; "Avoid using semantic zoom to change the scope of the content."
- Accessibility: provide a button to switch views (Microsoft shows one by default) rather than pinch only.
- Sources: Microsoft Learn semantic zoom.

### 19. Empty states as disclosure
- What: Carbon: "Empty states are moments in an app where there is no data to display to the user." First-use empty states disclose what the space will contain and how to populate it.
- Use: in-line documentation, optional onboarding steps, and starter content ("Good software allows people to try something unfamiliar, back out, and try something else, all without stress"). Titles as positive statements ("Start by adding data assets").
- Don't: make onboarding mandatory; Carbon says onboarding flows "remain optional and should pair with basic empty states."
- Sources: Carbon empty states pattern.

### 20. Feature gating, entitlements, role- and permission-based UI
- Permissions: Helios: "When a user does not have permissions, hide the related actions, navigation items, and views," and avoid disabled elements because "disabled elements (including their text) are almost entirely ignored" by screen readers; when access is discoverable/obtainable, hide with an explanation. Enforcement must still happen server-side (search synthesis).
- Feature gating (commercial): search synthesis suggests keeping gated features "visible but not obstructive" with lock icons or "Pro" badges and a contextual paywall at "the moment of intent"; this is the opposite policy from permission hiding because the goal is upsell, not simplification.
- Accessibility: hidden-by-permission must be truly absent from the DOM or `hidden`; lock badges need text alternatives.
- Sources: Helios show/hide/disable, Superwall and related (search), NN/g contextual menus (disable within menus).

### 21. Adaptive vs adaptable interfaces; progressive reduction
- Definitions (Oppermann, via search): "adaptable" = user manually adjusts; "adaptive" = system adapts automatically. Shneiderman's caution: adaptive systems are "unpredictable and less transparent."
- Evidence: Findlater and McGrenere (CHI 2004) found a static split menu faster than an adaptive one, the adaptable menu about as fast as static, and "most users prefer the control afforded by an adaptable approach."
- Progressive reduction (LayerVault, Allan Grinshtein): "Usability is a moving target. A user's understanding of your application improves over time and your application's interface should adapt to your user." The Signposting button started as "a large icon with a label," then "we remove the label," then "de-emphasize the button altogether." Counterweight: "Experience Decay": "your proficiency in a product will decay over time without usage" so "your UI regresses back to level 1." A List Apart's write-up records the critique that inconsistent application would make pages "progressively dimmer."
- Rule of thumb: prefer adaptable (user-controlled) disclosure; use adaptive reduction only with decay and an escape hatch.
- Sources: LayerVault post, A List Apart, Findlater and McGrenere, Wikipedia/IntechOpen (search).

### 22. Progressive onboarding vs progressive disclosure of features
- Onboarding patterns (Appcues): tooltips ("In-app messages that pop up when someone hovers over, stops at, or clicks a specific element"), hotspots ("Small pulsating dots that draw attention"), checklists ("A visual depiction of tasks"), product tours (3-5 steps).
- NN/g finding: tutorials are "push revelations" that "reveal new information out of context"; they "interrupt users ... don't tend to be memorable, and ... don't result in better task performance." Prefer "pull" contextual help; "Make it easy to dismiss (and recall) the help content."
- Distinction: onboarding discloses *instruction* over time; feature disclosure discloses *capability* on demand. Both should be dismissible and never block the plain path.
- Sources: NN/g onboarding-tutorials, Appcues, Userpilot (search), Carbon empty states.

---

## (C) Jenifer Tidwell, Designing Interfaces (O'Reilly)

The pattern pages at designinginterfaces.com could not be fetched (TLS error on the http-only site; archive.org is blocked for this tool; the O'Reilly chapter returned 403). Quotations below are the ones that could be verified through secondary sources; everything else is a paraphrase of the pattern structure as reproduced by those sources.

- **Progressive Disclosure** (in Tidwell's taxonomy this is closely related to Responsive Disclosure; secondary sources credit *Designing Interfaces* (2005/2010) with establishing PD "as an essential pattern for managing interface complexity through staged revelation").
- **Responsive Disclosure**: start with a very minimal UI and reveal more as the user completes steps. PeakXD summarises: "Responsive disclosure, a form of progressive disclosure, starts with a very simple UI, then gradually takes a user through a step-by-step process, disclosing further elements as the user progresses through the steps." Search snippet of Tidwell's page: "starting with a very minimal user interface (UI) where users see more of the interface as they complete steps ... showing all alternatives simultaneously from the beginning can cause users to lose focus." Use when: a branching, unfamiliar task can live on one page or dialog. How: reveal the next controls immediately after the step that makes them relevant; keep the whole thing in one place.
- **Responsive Enabling**: all controls are shown but only the currently relevant ones are enabled. Tidwell (quoted by IxDF): "...the user can't do things that would get him into trouble, as the UI has 'locked out' those actions by disabling them. Unnecessary error messages are thus avoided." IxDF adds that, unlike progressive disclosure, "all the options are presented at once," so experienced users can anticipate the next step. Trade-off: disabled controls are invisible to many assistive technologies (Helios), so enabling must be paired with an explanation of why.
- **Extras on Demand**: show the most important content up front and hide the rest behind a single, clearly labelled control; the user chooses when to see the "extras" (the classic "More options" / "Advanced" expander). The search index describes it as "one of the organization patterns" in the book's content-organization chapter. This is the same mechanism Apple names the disclosure triangle and GOV.UK names Details.
- How the four relate: Extras on Demand = user-initiated hierarchical PD (NN/g's core sense); Responsive Disclosure = system-initiated PD driven by the user's previous input (GOV.UK conditional questions, Salesforce conditional rendering); Responsive Enabling = the same trigger logic expressed through enabled state instead of visibility; NN/g's "staged disclosure" (wizards) is the sequential cousin.

---

## (D) Synthesis

Across some twenty design systems, the definitions converge on Nielsen's: show the few things most people need, and put the rest one click away, at most two levels deep (NN/g, Pajamas, Shopify all state the two-level ceiling). What differs is the *trigger* and the *container*, and the catalog above is best read along those two axes.

Triggers are either user-initiated (a chevron, an ellipsis, a "Show more" link, Cmd+K, a right-click) or system-initiated (a conditional field, a contextual toolbar, an empty state, an adaptive menu). User-initiated disclosure is the safest: Findlater and McGrenere found users prefer control, Shneiderman warns adaptive systems are unpredictable, and even LayerVault's progressive reduction needed "experience decay" to stay honest. When the system does the disclosing, the rules are that the reveal must be adjacent to its cause (Apple, GOV.UK, Tidwell), that the same command must remain reachable somewhere stable (NN/g contextual menus, Unity), and that state changes must be announced (GOV.UK's admitted 4.1.2 failure is the cautionary tale).

Containers range from in-flow (accordion, details, expandable row, conditional field) through layered (popover, tooltip, menu, drawer) to modal (dialog, modal sheet, wizard step). In-flow containers keep reading order intact and are cheapest for accessibility; layered containers inherit WCAG 1.4.13's dismissible/hoverable/persistent requirements; modal containers inherit the APG focus-trap and focus-return contract. Carbon's disclosures pattern draws the boundary cleanly: tooltip for non-interactive text, popover/toggletip for interactive content, modal for anything critical.

Two recurring "when not to use" rules cut across every pattern. First, never hide what most users need (GOV.UK details, USWDS, Fluent, Pajamas); hiding is a statement of low importance, and NN/g's finding that hidden navigation slows desktop users by 39% shows the cost. Second, do not stack disclosures: no nested accordions (GOV.UK), no more than one disclosure button per view (Apple), no third level (NN/g).

Mobile inverts some judgements. Accordions are "debatable" on desktop but among "the most useful design elements" on mobile (NN/g); hover-reveals and tooltips do not exist on touch (NN/g, BOIA), so Polaris's hover actions must become visible actions or menus; bottom sheets replace popovers; one-thing-per-page exists partly because it "helps users use the service on a mobile device."

Finally, the trigger itself must carry information scent. The evidence favours a caret/chevron (NN/g found it "the safest icon choice"; plus performed no better than no icon; a right-facing arrow reads as navigation), a label that names what will be revealed ("Advanced Options," "Explore federal compliance checklists") rather than "Click here," and consistent icon placement (Fluent, Canvas). Motion should be productive rather than expressive, in the 150-240 ms band Carbon assigns to expansion, with a reduced-motion crossfade alternative.

---

## (E) Bibliography

Design systems
- NN/g, Progressive Disclosure: https://www.nngroup.com/articles/progressive-disclosure/
- Apple HIG, Disclosure controls: https://developer.apple.com/design/human-interface-guidelines/disclosure-controls
- SAP Fiori, Explainable AI (progressive disclosure principles): https://www.sap.com/design-system/fiori-design-web/v1-108/foundations/ai-and-joule-design/guidelines/explainable-ai (legacy: https://experience.sap.com/fiori-design-web/progressive-disclosure/)
- GitLab Pajamas, Progressive disclosure: https://design.gitlab.com/usability/progressive-disclosure
- IBM Carbon, Disclosures pattern: https://carbondesignsystem.com/patterns/disclosures-pattern/
- IBM Carbon, Accordion usage: https://carbondesignsystem.com/components/accordion/usage/
- IBM Carbon, Overflow menu: https://carbondesignsystem.com/components/overflow-menu/usage/
- IBM Carbon, Empty states: https://carbondesignsystem.com/patterns/empty-states-pattern/
- IBM Carbon, Motion: https://carbondesignsystem.com/elements/motion/overview/
- Microsoft Fluent 2, Accordion usage: https://fluent2.microsoft.design/components/web/react/core/accordion/usage
- Microsoft Fluent 2, Layout: https://fluent2.microsoft.design/layout
- Shopify Partners, Progressive Disclosure: https://www.shopify.com/partners/blog/progressive-disclosure
- Polaris, Information architecture (archived): https://polaris-react.shopify.com/foundations/information-architecture
- Polaris, Common actions best practices (archived): https://polaris-react.shopify.com/patterns/common-actions/best-practices
- GOV.UK Design System, Details: https://design-system.service.gov.uk/components/details/
- GOV.UK Design System, Accordion: https://design-system.service.gov.uk/components/accordion/
- GOV.UK Design System, Radios (conditional reveal): https://design-system.service.gov.uk/components/radios/
- GOV.UK Design System, Question pages: https://design-system.service.gov.uk/patterns/question-pages/
- GOV.UK Design System, Step by step navigation: https://design-system.service.gov.uk/patterns/step-by-step-navigation/
- GOV.UK Service Manual, Form structure: https://www.gov.uk/service-manual/design/form-structure
- USWDS, Accordion: https://designsystem.digital.gov/components/accordion/
- Material Design 3, Bottom sheets: https://m3.material.io/components/bottom-sheets/overview
- Material Design 3, Menus: https://m3.material.io/components/menus/guidelines
- Salesforce Trailhead, Use Progressive Disclosure and Conditional Rendering: https://trailhead.salesforce.com/content/learn/modules/best-practices-in-lightning-web-components/use-progressive-disclosure-and-conditional-rendering
- SLDS, Expandable section: http://v1.lightningdesignsystem.com/components/expandable-section/
- Salesforce lightning-accordion: https://developer.salesforce.com/docs/component-library/bundle/lightning-accordion/documentation
- Adobe React Spectrum, Accordion: https://react-spectrum.adobe.com/Accordion
- Ant Design, Collapse: https://ant.design/components/collapse
- Ant Design, Drawer: https://ant.design/components/drawer
- Ant Design, Popover: https://ant.design/components/popover
- Workday Canvas, Expandable Container: https://canvas.workday.com/components/containers/expandable-container
- Workday Canvas, Side Panel: https://canvas.workday.com/components/containers/side-panel
- ServiceNow Horizon, Accordion: https://horizon.servicenow.com/workspace/components/now-accordion
- ServiceNow Horizon, Collapse: https://horizon.servicenow.com/workspace/components/now-collapse
- Oracle Redwood drawers (VBCS blog): https://blogs.oracle.com/vbcs/post/drawer
- Zendesk Garden, Accordion: https://garden.zendesk.com/components/accordion
- Atlassian Design System, Inline edit: https://atlassian.design/components/inline-edit
- Atlassian Design System, Dropdown menu: https://atlassian.design/components/dropdown-menu/usage
- Atlassian AUI Expander: https://aui.atlassian.com/aui/7.9/docs/expander.html
- HashiCorp Helios, Show, hide, and disable: https://helios.hashicorp.design/patterns/disabled-patterns
- Unity Foundations, Contextual Tooling: https://www.foundations.unity.com/patterns/contextual-tooling
- Microsoft Learn, Semantic zoom: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/semantic-zoom

Accessibility
- WAI-ARIA APG, Accordion: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
- WAI-ARIA APG, Disclosure: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- WAI-ARIA APG, Tabs: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- WAI-ARIA APG, Menu button: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
- WAI-ARIA APG, Dialog (modal): https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- WCAG 2.2 Understanding 1.4.13 Content on Hover or Focus: https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html
- BOIA, Hover Actions and Accessibility: https://www.boia.org/blog/hover-actions-and-accessibility-addressing-a-common-wcag-violation
- Scott O'Hara, details/summary: https://www.scottohara.me/blog/2022/09/12/details-summary.html

Research and pattern literature
- NN/g, Accordions on Desktop: https://www.nngroup.com/articles/accordions-complex-content/
- NN/g, Accordions on Mobile: https://www.nngroup.com/articles/mobile-accordions/
- NN/g, Accordion Icons: https://www.nngroup.com/articles/accordion-icons/
- NN/g, Tooltip Guidelines: https://www.nngroup.com/articles/tooltip-guidelines/
- NN/g, Modal and Nonmodal Dialogs: https://www.nngroup.com/articles/modal-nonmodal-dialog/
- NN/g, Wizards: https://www.nngroup.com/articles/wizards/
- NN/g, Tabs, Used Right: https://www.nngroup.com/articles/tabs-used-right/
- NN/g, Contextual Menus: https://www.nngroup.com/articles/contextual-menus/
- NN/g, Hamburger Menus and Hidden Navigation: https://www.nngroup.com/articles/hamburger-menus/
- NN/g, Infinite Scrolling: https://www.nngroup.com/articles/infinite-scrolling-tips/
- NN/g, Onboarding Tutorials vs. Contextual Help: https://www.nngroup.com/articles/onboarding-tutorials/
- NN/g, Information Scent: https://www.nngroup.com/articles/information-scent/
- Tidwell, Designing Interfaces, Responsive Disclosure (site could not be fetched): http://www.designinginterfaces.com/firstedition/index.php?page=Responsive_Disclosure
- IxDF, Responsive Enabling: https://ixdf.org/literature/topics/responsive-enabling and https://ixdf.org/literature/article/how-to-use-responsive-enabling-to-simplify-tasks
- IxDF, Progressive Disclosure: https://ixdf.org/literature/topics/progressive-disclosure
- PeakXD, Responsive disclosure, forms and Frodo Baggins: https://peakxd.com.au/articles/responsive-disclosure-forms-_and_-frodo-baggins/
- Scott and Neil, Designing Web Interfaces ch.4 Contextual Tools: https://www.oreilly.com/library/view/designing-web-interfaces/9780596155353/ch04.html
- LayerVault, Progressive Reduction: https://layervault.tumblr.com/post/42361566927/progressive-reduction
- A List Apart, Progressive Reduction: https://alistapart.com/blog/post/progressive-reductionmodify-your-ui-over-time/
- Findlater and McGrenere, A Comparison of Static, Adaptive, and Adaptable Menus (CHI 2004): https://www.cs.ubc.ca/labs/imager/tr/2004/findlater04menus/
- Jensen Harris, Designing the Ribbon: https://jensenharris.com/home/ribbon
- uxpatterns.dev, Command Palette: https://uxpatterns.dev/patterns/advanced/command-palette
- Appcues, Onboarding UX patterns: https://www.appcues.com/blog/user-onboarding-ui-ux-patterns
- Wikipedia, Adaptive user interface: https://en.wikipedia.org/wiki/Adaptive_user_interface
