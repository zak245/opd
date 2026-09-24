# 31. Filtering, applied filters and result counts

*How the products that do this best let a person narrow a list: how many filters sit in front, whether an idle filter shows a value, how "on" is told apart from "off" without reading, where applied filters live and how they are dropped, whether the count is always there and in what words, what a filter that empties the list says, what a phone does, and what the keyboard does. Companion to memo 30 (page layouts), which settles where the filter bar sits; this memo is about what is in it. Compiled 24 September 2026.*

**The problem.** ollopA's eleven index pages filtered eleven ways. The pattern in `layouts/filters.tsx` owned the row but handed the control itself back to the page (`node: ReactNode`), so People drew grey filled chips reading `Title`, Lists drew white outline selects reading `Kind: all`, Companies was the only page with an applied-filter row, and Sequences had a door holding one thing. This memo is the evidence for one pattern that draws its own controls.

**Tiers.** 1 = published method or measurement. 2 = first-party documentation. 3 = practitioner synthesis.

**Fetch notes.** URLs read 24 Sep 2026, HTML only. **Polaris's design pages are gone**: `polaris-react.shopify.com/components/selection-and-input/filters` 301s to `shopify.dev/docs/api/polaris`, so Polaris is quoted from its live Index-filters page and from two of its own GitHub threads, which are better evidence than the docs anyway because they record the reasoning. **Carbon's live filtering page truncates** in a fetcher; it was read from the Carbon website's own Vercel preview build, which serves the same text. **Linear's docs are a JavaScript shell** for the parts that matter — the filters page yields the shortcut and the URL behaviour and nothing about the control — so Linear's model is quoted only where the docs say it in words. **Material 3's chips guidance** is a shell; it is quoted through the Compose and Flutter API docs that implement the same spec. **Atlassian publishes no filter pattern** (`atlassian.design/patterns/filters` is 404); Atlassian appears only through Jira's own help. Airtable's help documents conditions but not the toolbar button, so Airtable's badge is described from the product, not quoted.

---

## Part A. How many filters sit in front

Nobody publishes a number. Two products publish a **rule**, and it is the same rule from both directions.

**Polaris** ships it as code. Its `Filters` component marks a filter `shortcut: true` to keep it on the bar, and PR #2856 ("[Filters] only show the 'More filters' button if necessary") states the problem in one line: *"The filters component always shows a 'More filters' button. If there's only one filter or we can fit all the filters in the container, the button feels unnecessary."* The rule it implements: show the button when no filter is a shortcut, when only some are, or when all are but they do not fit; **hide it when all of them are shortcuts and they fit**. The issue behind it, #2314, is blunter still — Lauren Mayers: *"in cases where there is only one filter, this panel becomes redundant and may be confusing"* — with the expected behaviour written as *"The 'More filters' panel is only shown when there are more filters than those already rendered on the page, or more than one filter."*

**Helios** (HashiCorp) sets the same threshold from the other end: when the parameters *"exceed available space,"* use a secondary button that opens a flyout of checkbox groups. Nothing about a count.

**Pencil & Paper**'s survey of enterprise filtering refuses a number and gives a heuristic instead — *"Know when to stop"*, match filter depth to data volume — plus *"Mirror all data points"*: if a property shows in the row, people expect to filter by it.

**Carbon** does not count either; it names the two shapes, *"a vertical list on the left side of the page or within a horizontal drawer at the top of the data set."*

**Where they disagree:** Polaris's threshold is about the *door* (hide it when it would hold nothing worth holding); Helios's is about *space* (overflow when the row is full). **We take both, and add the missing half.** Space decides how many stay on the row (three at 1280, two at 1024, none on a phone — memo 30's widths). Polaris's rule decides the edge case: **a door never holds exactly one filter.** If exactly one would be left over, the row takes it and the row holds four. This is the direct answer to Sequences having a door with one thing in it.

---

## Part B. Does an idle filter show a value

This is where the sources disagree hardest, and the disagreement is really about **two different patterns**.

**The filter builder** — Linear, Attio, Notion, Airtable — has **no idle filters at all**. There is one "Filter" or "+ Add filter" control, and a filter appears in the bar only once it exists. Linear: *"Open the filter menu or type F shortcut to choose the criteria you want to apply… As filters are applied, the issue list updates to show only matching results."* Attio: *"click Filter at the top of your view, then click + Add condition."* Notion: *"Click + Add a filter in the filter panel"*, and *"The filter panel will appear below the toolbar, where you can see your active filters."* Airtable is the same: a Filter button, then Add condition. Google Drive's search chips are the consumer version — Drive *"suggests filter chips to narrow your search by Type, People, Date Modified"*, and a chip only exists once it carries a value: *"On the right of the chip, click Remove"*, and *"At the end of the chips, click Clear filters."*

**The faceted bar** — Jira's basic search, Polaris's shortcut filters, Carbon's filter panel — keeps named controls on screen whether or not they are set, so the *available* facets are visible without a click.

**The cost of each.** The builder's bar is quiet and always honest (everything you see is filtering), but the facets are invisible until you open the menu — NN/g's hidden-navigation finding (RULES.md rule 4: 27% use against 48–50%, task success more than 20 points lower) is the general form of that cost. The faceted bar shows the facets but has to say something when nothing is chosen, and that is exactly where ollopA fell apart: `Title` on People, `Kind: all` on Lists, `Stage: all` on Companies.

**Where we come down, and it is against first instinct.** The builder is what the products we admire most do, and the tidy answer is to copy Linear. We do not, for two reasons from our own rules. Rule 1 says show what this seat needs most of the time without a click, and the seat's two or three filters are touched every morning; a builder puts all of them one click away. Rule 4 says a door is labelled by what is behind it — a bare "+ Filter" is the "More" label rule 4 bans. So we keep the faceted bar **and fix the wording instead**: every filter reads `Name: value`, always, and when nothing is chosen the value is the word **`any`**. `Owner: any`, `Stage: any`, `Archived: no`. Never a bare name, and never `all` — "Stage: all" can be read as "match every stage".

Pencil & Paper supports the fixed version from the other side: filters should *"keep active filters visible in original menus"*, which only works if the control reads its own value.

---

## Part C. Telling "on" from "off" without reading

**Material 3** is the only system with a mechanical answer: a selected filter chip *"appends a leading checkmark icon to the starting edge of the chip label"* **and** changes its container colour. Two channels, never one.

**Helios** puts a `BadgeCount` inside the dropdown *"to show that values corresponding with a filter parameter have been applied."*

**Carbon** requires an indicator on the *closed* container: *"there should be an indicator visible on the closed filter state that informs the user that filters have been applied,"* and *"At a minimum, the indicator should include the number of filters applied and have the option to clear filters without re-opening the filter container."*

**Pencil & Paper** asks for three redundant signals at once: filters visible in their own menus, *"bold text or numeric markers like '(3)'"*, and a separate applied-filters summary.

**What we take.** An idle filter is the library's outline button. A filter that is on carries **the accent** — the one hue DESIGN §5 gives to "act here" and "you are here" — as tint, ink and border, and the value is written on the control as well, so colour never works alone. The door's trigger carries the accent when anything is on, and a badge that says how much: `2 of 26 on`, in the same "N of M" grammar as the result count, on every page. Carbon's rule is met (the closed door says how many are applied); Material's two-channel rule is met (colour plus the value in words); we do **not** add a checkmark, because the value text is a stronger second channel than a tick.

---

## Part D. Where applied filters live, and how one is dropped

Everyone agrees there is a list of them and a "Clear all". They disagree about **whether the list duplicates the controls**.

**Helios**: applied filters are a *required* "tag list" of dismissible tags, *"above the data set with a 16px gap"*, with a bulk *"Clear all"* as a small tertiary button.

**Carbon**: *"Each category should have a way to clear all applied filters at once without having to interact with each individual item,"* and *"if multiple categories have been applied to the same data set then there should also be a way to dismiss all filters across all categories at once."*

**Maersk** is the one source that answers the duplication question directly, and it cites research to do it: *"research shows, that it is best to show the applied filter by highlighting them both in their original placement, the filter options, as well as in a separate 'applied filters' section."* Placement: *"between the data set and the filter bar with a 16px gap."*

**Pencil & Paper** says the same in different words — three redundant signals — and adds the scope rule: *"'Clear All' should be possible at the individual filter level and at the global level."*

**Against them:** Linear, Attio, Notion and Drive have **no separate applied line at all**, because in a builder the bar already *is* the applied line. Drive: remove from the chip, or *"Clear filters"* at the end of the chips.

**Where we come down, and it is against first instinct.** ollopA's line listed only the filters hidden behind the door — a reasonable-sounding "don't repeat yourself" that turns out to be the worst of both: the line is not the whole cause, so it cannot be trusted, and which half it shows depends on the width. **Both, as Maersk says.** The control reads its value, and one line under the row lists **every** filter that is on, wherever its control sits, each dropped from its own chip with the "×" inside the chip (one control, one accessible name), with one `Clear all N filters` at the end. The **search box is on that line too**, as `Search: zzzz`, because a search narrows the list exactly as a filter does and a "Clear all 2" that counted it without showing it is a number nobody can account for.

---

## Part E. The result count

**Carbon, Polaris, Helios, Material** all publish filter components and **none of them makes the result count part of the pattern.** The strongest statements come from practitioner sources and from mobile research.

Smart Interface Design Patterns (Vitaly Friedman): put the count on the button — *"Update the count of products and show them on the button"* — and *"Never freeze the UI on a single input, and never make your customer wait."*

Filter-UX syntheses converge on *"Show [number] items"* as the wording for a deliberate apply action, and on per-value counts at the input — *"Red (12)", "Blue (7)"* — *"so users see where results exist before they commit and never hit a surprise 'no results' wall."*

NN/g on mobile faceted search: *"the total number of results is always visible, even if the user has scrolled down a long list of facets,"* and the point of keeping results behind the tray is that people *"see right away if they have applied the wrong filter."*

Accessibility: announce the count, not the list. *"The results summary uses `aria-live="polite"` and `aria-atomic="true"` to announce the entire summary on changes"*; and *"Do not use an aria-live region for the entire contents of results."*

**What we take.** The count is part of the pattern, at the trailing edge of the row, on every index, in one wording, **always the same even when nothing is filtering**: `9 of 640 companies`. Two sentences ("640 companies" / "9 of 640 companies") make the reader work out which one they are looking at before they can read the number. It is polite-live and atomic, and a screen reader hears the settled sentence once, not every animation frame. Per-value counts sit beside each value in the control, as the syntheses ask, wherever the page can afford to compute them.

---

## Part F. The filter that empties the list

**Helios**: for zero results, show the Application State component offering *"clear all or specific filters."*

**Maersk**: *"communicate the empty state to the user and highlight instructions to adjust the filters or provide a method to clear all filters."*

Nobody publishes a rule for naming **which** filter did it.

**What we take.** The empty state names the last filter switched on, in the same `Name: value` words, and offers to clear that one; plus "Clear the search" when there is a search; plus the one "Clear all". Naming the filter is ours, not a citation — it follows from BUILD-CHAINS (a person is watching a count change and needs to know what changed it) rather than from a source.

---

## Part G. The phone

**NN/g's tray** is the measured pattern: facets *"appear in a vertical panel overlaid on top of the results screen,"* results *"are always visible in the background, and can be seen to change as the user makes her facet selections,"* and the control is labelled in words — *"Filter"* or *"Refine"* — not with an icon.

**Smart Interface Design Patterns** adds: full-page overlay with accordions rather than a squeezed split, and a sticky Apply button carrying the count.

**Fluent** lets the search box collapse to a magnifier at small widths.

**Polaris** only warns: *"Consider small screen sizes when designing the interface for each filter and the total number filters to include."*

**Where we disagree with NN/g and say so.** NN/g's tray sits *over* the results. LAYOUTS §2 already decided the opposite — the door opens below the row and pushes the list down — and it keeps NN/g's actual finding (results visible while the facets are open) more completely than the tray does, because nothing is covered at all. We also do **not** collapse the search to an icon: at 400 the search takes the first row whole, the door and the count take the second, and the applied line follows. That is two things, not six, and the door is still labelled in words.

---

## Part H. The keyboard

The published material here is thin. **Linear** gives `F` for the filter menu and `Shift V` for display options. **Carbon** and **Helios** describe components, not keys. The accessibility checklists give the test rather than the design: *"WHEN I use the tab key to move focus to controls inside the filter I SEE focus is strongly visually indicated."*

**What we take**, from RULES.md rule 4 (a door works from the keyboard or it does not work) and from the library's own primitives: the door's trigger is a button with `aria-expanded`; Enter or Space opens it; focus moves into the panel; Esc closes it and focus returns to the trigger. Every filter is a popover trigger, so Esc closes it and focus returns there too; inside, the value list is a listbox walked with the arrow keys, Home and End, chosen with Enter. Chips on the applied line are buttons, so Enter drops one.

---

## Part I. Filters and "display options" are not the same thing

**Linear** is explicit, and it is the one place we knowingly go the other way: *"filters will refine the list to only issues with certain properties while display options show all issues in the list but hide or show data on the issue item or board card."* They get two separate triggers — a filter menu and a **Display options** button in the top right.

**Notion, Airtable and Attio** split them the same way (Filter, Sort, Group, Properties as separate toolbar buttons).

**We take one door, with three labelled groups inside it** — Filters, Saved views, Columns and density — because RULES.md rule 2 counts levels per channel and LAYOUTS §2 has already decided that an index has one door in one place. Two triggers is two doors, and the second one is what we spent this rebuild removing. The distinction Linear is right about is kept as the **group headings**, and as the badge: it counts filters only, because a columns control is not a thing that can be on.

---

## What this memo settles

1. Three named filters on the row at 1280, two at 1024, none at 400 — and **never exactly one filter left over**, because a door holding one filter is worse than no door (Polaris #2314, #2856).
2. Every filter reads `Name: value`, always, and the value when nothing is chosen is `any`. We keep the faceted bar rather than Linear's builder, and fix the wording (rule 1 and rule 4 over the tidier pattern).
3. On is the accent, off is the outline, and the value is always written as well (Material's two channels; DESIGN §5).
4. One door, one label, one badge: `N of M on`, counting every filter the page has (Carbon's "at a minimum, the number applied").
5. The count is part of the pattern, in one wording, always present, polite-live and atomic.
6. Applied filters live **both** in their control and on one line under the row, search included; one "×" per chip, one "Clear all" (Maersk's reading of the research, against our first instinct).
7. The empty state names the filter that emptied the list and offers to clear that one.
8. The door opens below the row, not over it, at every width — knowingly against NN/g's tray, for the same reason NN/g gives for the tray.

## Sources

- Shopify Polaris — [Index filters](https://polaris-react.shopify.com/components/selection-and-input/index-filters); [issue #2314, "Hide 'More filters' sheet if there is only one filter"](https://github.com/Shopify/polaris/issues/2314); [PR #2856, "only show the 'More filters' button if necessary"](https://github.com/Shopify/polaris/pull/2856). Tier 2.
- IBM Carbon — [Filtering pattern](https://carbondesignsystem.com/patterns/filtering/) (read from the website's Vercel preview build). Tier 2.
- HashiCorp Helios — [Filter patterns](https://helios.hashicorp.design/patterns/filter-patterns). Tier 2.
- Maersk Design System — [Filter patterns](https://designsystem.maersk.com/guidelines/search-filter-and-sort/filter-patterns/). Tier 2.
- Material Design 3 — [Chips guidelines](https://m3.material.io/components/chips/guidelines), read through [FilterChip (Compose)](https://composables.com/material3/filterchip) and [FilterChip (Flutter)](https://api.flutter.dev/flutter/material/FilterChip-class.html). Tier 2.
- Microsoft Fluent 2 — [Searchbox usage](https://fluent2.microsoft.design/components/web/react/core/searchbox/usage/). Tier 2.
- Linear — [Filters](https://linear.app/docs/filters); [Display options](https://linear.app/docs/display-options); [Custom views](https://linear.app/docs/custom-views). Tier 2.
- Attio — [Filter and sort views](https://attio.com/help/reference/managing-your-data/views/filter-and-sort-views). Tier 2.
- Notion — [Database views, filters, sorts and groups](https://www.notion.com/help/views-filters-and-sorts). Tier 2.
- Airtable — [Filtering records using conditions](https://support.airtable.com/docs/filtering-records-using-conditions). Tier 2.
- Atlassian — [Use basic search and filters in Jira](https://support.atlassian.com/jira-service-management-cloud/docs/use-basic-search-and-filters-to-quickly-find-requests-and-issues-in-jira/). Tier 2. (`atlassian.design/patterns/filters` is 404 — Atlassian publishes no filter pattern.)
- Google Drive — [Search for files in Google Drive](https://support.google.com/drive/answer/2375114?hl=en&co=GENIE.Platform%3DDesktop). Tier 2.
- Nielsen Norman Group — [Mobile faceted search with a tray](https://www.nngroup.com/articles/mobile-faceted-search/); [Ecommerce search UX report](https://www.nngroup.com/reports/ecommerce-ux-search-including-faceted-search/). Tier 1.
- Pencil & Paper — [Filter UX design patterns and best practices](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-filtering). Tier 3.
- Smart Interface Design Patterns — [Filtering UX](https://smart-interface-design-patterns.com/articles/filtering-ux/). Tier 3.
- Atomic Accessibility — [Filter testing checklist](https://www.atomica11y.com/accessible-web/filter/). Tier 3.
