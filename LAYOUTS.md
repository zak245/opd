# Page layouts

Agreed with the owner on 23 September 2026 from [memo 30](knowledge-base/sources/30-page-layouts-and-information-structure.md). Every page in the product is one of ten layout types, built from one set of parts, with one overlay rule, visible affordances for every interaction, and the same behaviour at three widths. The types are code: `src/ollopa/layouts/` holds one template per type and one component per part, built on shadcn as shipped ([DESIGN.md](DESIGN.md) section 4). A page declares its type and fills its parts; it does not lay itself out. Anything reusable here is meant to be exposed beyond this product: the patterns site and the agent plugin read this file and these components.

## 1. The types, and which page is which

| Type | What it is for | Pages |
|---|---|---|
| Index | Find and act on many things of one kind | People, Companies, Accounts, Lists, Sequences, Templates, Campaigns, Workflows, Requests, Deals table |
| Record | Dwell on one thing | person, company, deal, sequence, list, template, campaign, audience, form, workflow, integration, job, request |
| Master-detail | A list and the open item side by side; the item is meaningful on its own | Inbox |
| Supporting pane | A narrower pane that only makes sense with the page behind it | the beside pane (which is also the quick look) |
| Board | Cards grouped by one property, moved by drag | Deals board |
| Home | Summary tiles, each a door to an index or a record | Home |
| Wizard | Rare, ordered steps where later depends on earlier | connect, import, set-up |
| Settings | Grouped panels, each saved on its own | Settings |
| Queue | A master-detail ordered by work left, walked with next and previous | Tasks queue, the agents' waiting list |
| Form | One committed set of fields | the edit sheets |

## 2. The parts of a page, and what each may hold

- **Page header**: the family icon and title, the count, the one primary act, the "…" menu. Never filters.
- **Status row**: the health badges and the announcement, one line, scrolling on a phone.
- **Alert**: only what needs a decision.
- **Toolbar**: search, filters, views, columns, in the card's header. One row, one door, one count — the filtering pattern below.
- **Summary strip**: the numbers a page is judged by, one band, never boxes.
- **Sections**: one card per section, heading and count on the card, rows divided inside.
- **Side rail**: related things on a record, narrower than the main column.
- **Footer**: the pager, the bulk bar, the save bar.

### The index, in full

Every index is the same page with different rows. A page passes data, columns and acts; it cannot
pass a class, a width or an order.

- **Page header**: family icon, title, count, an optional one-line subtitle, one primary act, the
  "…". Never a filter.
- **One card holds the index.** Nothing about the index sits outside it.
- **The card header is the toolbar**, and the toolbar is the filtering pattern below. There is
  never a second door and never a filter bar on the page.
- **The card body is the table**: a checkbox column when and only when the page has bulk acts; the
  name as a link with its chips inline; then the columns by priority, folding into the one-line
  meta line under the name; then the "…" at the trailing edge. Every row the same height.
- **The card footer** is the pager, replaced by the bulk bar while rows are selected.
- One named **slot** carries what this shape has no room for — a view switch, a set of object tabs,
  an "Expand all" — in the same place on every page that needs one.
- **No page and no part writes `rounded-*`, `shadow-*` or a colour.** The theme decides all three:
  corners are square, the card is paper lifted off the ground by the library's own shadow, and an
  overlay sits above the card. There are no other levels.

### The section card, in full

- Padding is the library's, as shipped. No page sets one.
- A card is a heading with its count on the header line, at most one act or a "…" at the trailing
  edge, and a body of either rows or fields, divided by the library's rule.
- A **field** is a label and a value. A value may join **at most three** short facts with "·". Four
  or more facts are four or more labelled fields on the shared column grid. No paragraph of prose
  in a card body: facts become labelled values, and what is left is education and goes.
- **No page and no part writes `rounded-*`, `shadow-*` or a colour.** The theme decides all three.

### The filtering pattern

Every index filters the same way, because filtering is disclosure and a person who cannot explain the count has been shown a number instead of a cause. Built once as `FilterBar` in `src/ollopa/layouts/filters.tsx`; a page fills it and decides nothing about it.

1. **One row.** Search first, then the filters this page's seat sets most, as named controls that carry their own value ("Owner: me", "Stage: cold"), at most three. Then the door. Then the result count at the trailing edge. One row at 1440; one row at 1024, where it keeps two named filters instead of three. On a phone the search takes the row and the door and the count take the one under it — two things, and no filters on either.
2. **One door, in the same place, called the same thing.** "Filters and views", everywhere, holding every other filter, the columns, the density and the saved views in three labelled groups. Its badge says what it holds and how many are on: `26 · 3 on`.
3. **Nothing that is on is hidden.** A filter that is on reads in its own control when it is one of the three, and on one line under the row when it is not, as a chip a click drops. One "Clear all" at the end of that line, with the number it clears. Never a free-standing "×" beside a chip.
4. **The door opens below the row and pushes the list down.** Never over the rows, never a dialog, never a sheet: the person opened it to watch the count change, so the list behind it stays readable. It opens and closes from the keyboard, focus goes into it and back to the trigger, Esc closes it, and it remembers whether it was left open.
5. **The count is the feedback.** "9 of 800 people" — it says what it counts and it ticks rather than swapping. When a filter empties the list, the empty state names the filter that did it and offers to clear that one.
6. **It moves, or the person cannot see what their click did.** The rows settle, the count ticks, the applied line grows in, the door opens and closes. One duration and one curve for all of it, declared once as `MOTION` in `filters.tsx` — `--ollopa-door-ms` 180 ms, `--ollopa-settle-ms` 160 ms, `--ollopa-ease` `cubic-bezier(0.32, 0.72, 0, 1)` — and nothing moves under `prefers-reduced-motion: reduce`.

## 3. Overlays, and the rule for choosing

The page behind is needed and worked on → the beside pane. Needed for reference only → a popover or a non-modal panel. Must be blocked → a dialog, and only for an irreversible act. Small and nonessential → a popover. Editing a set of fields → a sheet. Never one overlay over another; one open at a time. Nothing decision-critical lives only in an overlay. The quick look is the beside pane, not a second mechanism.

## 4. Interactions, each with a visible affordance

- A resizable split shows a handle: a visible grip on the divider, a resize cursor on hover, keyboard resizing with the arrow keys, double-click to reset. Built once as `SplitHandle` on shadcn's resizable panels.
- Drag on the board shows a grip on hover and has a keyboard move as the other route.
- Row actions: the primary act and the "…" always visible; hover reveals nothing that has no other route.
- Inline edit: a pencil on focus, Enter to edit, Esc to cancel.
- Keyboard on every list: j and k, Enter, o, [ and ], x, Esc, the same everywhere.

## 5. Three widths, same functionality

- **1440**: up to three panes (sidebar, page, beside pane or side rail).
- **1024**: two; the side rail stacks under the main column; the pane covers rather than pushes.
- **400**: one; the sidebar is a sheet; master-detail and queue collapse to one pane and keep the selection; the board shows one stage at a time with a stage switcher; an index shows rows as a divided list, never a clipped table; the pane is full width with its origin line; the bottom bar carries the seat's four pages. Nothing is removed at any width, only how much is visible at once.

## 6. Spacing and alignment

A 4 px base with 8, 16 and 24 as the rhythm, as shadcn ships it. Card padding is the library's own
and a page never sets one. Labels and values across a record sit on one shared column grid, and a
value that would carry four facts becomes four fields on that grid instead. Content max width about 1300 px on structured pages, the board fluid, set by the template and never by a page. Indexes are one full-width column. Labels and values across a record sit on one shared column grid. Density is a user setting with two steps, never changed by width. No region of a page is empty at rest. A card is a section or a thing read on its own, and nothing else.

## 7. What the top of a record carries

Name with its family icon, subtitle, the acts on the same line; then the key fields the usage model puts at level one, in one strip; then sections in the usage order, doors inside them; the side rail for related things; at most one tab on the whole page.

## 8. How this connects to the other rules

Disclosure ([RULES.md](RULES.md)) decides what each part shows and what goes behind a door. The chain mechanics ([BUILD-CHAINS.md](BUILD-CHAINS.md)) decide how a person moves between pages and panes. The action rules and colour meanings ([DESIGN.md](DESIGN.md)) decide how controls and states look. This file decides where things sit and how the page behaves as it narrows. A template is a contract for all four at once.
