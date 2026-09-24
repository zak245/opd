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
- **Toolbar**: search, filters, views, columns, in the card's header. One row, one door, one count, one applied line — the filtering pattern below. Every control in it is drawn by the pattern; a page declares data only.
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
  meta line under the name; then the row's one visible act and the "…" at the trailing edge. Every
  row the same height.
- **A column that can be sorted says so on its own header.** The header is the button, the
  direction is shown on it, and the template does the sorting: no page draws a caret and no sort
  control goes in the filter door — clicking a header is the thing every person already knows.
- **One visible act per row**, the one this seat uses most, drawn at rest beside the "…". Never an
  act that appears only on hover, and never an act laid inline beside the name by hand.
- **Detail that belongs to one row** — a per-row door such as "Signals and news" — opens as a
  full-width sub-row under that row, never inside the name cell.
- **A click on the name opens the object beside the page, not the page.** The template intercepts
  it and hands the pane the rows in the order shown with this row's place among them, so `[` and
  `]` walk the list. The name keeps its real `href`, so ⌘-click, middle-click and copy-link still
  go to the page, and the page itself stays one deliberate step away, on the row's "…".
- **The board says it the same way.** `BoardPage` takes the same `beside`, with two differences it
  needs: the list is **the column the card sits in**, in that column's order, so stepping stays in
  the stage being scanned; and the template owns the drag guard — a pointer that travelled more
  than 4 px between going down and coming up ended a drag, and a drag is not a click. No card
  carries a copy of either.
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

Agreed with the owner on 24 September 2026 from [memo 31](knowledge-base/sources/31-filtering.md). Every index filters the same way, because filtering is disclosure and a person who cannot explain the count has been shown a number instead of a cause. Built once as `FilterBar` in `src/ollopa/layouts/filters.tsx`; a page fills it and decides nothing about it.

1. **The pattern draws every control; a page never does.** A page declares data — a filter's name, its kind, its options, its value and what changes it — and nothing else. The kinds are a single choice, a multiple choice, a range, a toggle and a piece of text, and all five wear the same outside: a button reading `Name: value` with the chevron straight after the text, opening its values under itself. A page that needs something these five cannot say gets a sixth kind here, agreed once. There is no way to hand the row a control: that one escape hatch is what made four indexes look like four products.
2. **One reading, everywhere.** `Name: value`, in every place a filter appears — on the row, inside the door, on the applied line, in the empty state — and **when nothing is chosen the value is the word `any`**. `Owner: any`, `Stage: any`, `Archived: no`. Never a bare name, never `all`, never the name said twice: a yes/no filter whose one value is its own name reads `on`.
3. **On is visible without reading.** An idle filter is the library's outline button. A filter that is on carries the accent — the one hue that means "act here" and "you are here" ([DESIGN.md](DESIGN.md) §5) — as tint, ink and border. Colour never works alone: the value is written on the control too. No new colour, ever.
4. **One row.** Search first, then the filters this page's seat sets most, then the door, then the result count at the trailing edge. **Three** named filters at 1280 and above, **two** at 1024, **none** on a phone, where the search takes the first row and the door and the count take the one under it. The search box is the pattern's: one placeholder rule, `Search` and the same noun the count uses ("Search people", "Search accounts"), so it never truncates mid-word at any width and never explains anything.
5. **One door, in the same place, called the same thing.** "Filters and views", everywhere, holding the filters the row had no room for, the saved views, and the columns and density, in three labelled groups. Its badge says how much of this page's filtering is on, in the same words on every page and in the same `N of M` grammar as the count: `2 of 26 on`. It counts filters only — the columns and the views are inside the door but are not things that can be on.
6. **The door earns its existence: it never holds exactly one filter.** If one filter would be left over, the row takes it and holds four. A door with one filter in it is worse than no door.
7. **Applied filters have one home, and it holds all of them.** Every filter that is on reads in its own control *and* on one line under the row, whatever width it is at and whichever side of the door its control sits on. The search is on that line too, as `Search: cedar`, because a search narrows the list exactly as a filter does. One "×", inside each chip, is how one is dropped; one `Clear all N filters` at the end of the line is how they all are. Never a free-standing "×" beside a chip, and never a page's own "Clear all".
8. **The door opens below the row and pushes the list down.** Never over the rows, never a dialog, never a sheet: the person opened it to watch the count change, so the list behind it stays readable. It opens and closes from the keyboard, focus goes into it and back to the trigger, Esc closes it, and it remembers whether it was left open. Each filter's values are a listbox walked with the arrow keys, Home and End, chosen with Enter, closed with Esc.
9. **The count is the feedback, and it is always the same sentence.** `9 of 640 companies` — filtered or not, so nobody has to work out which of two wordings they are reading. It says what it counts, it ticks rather than swapping, and a screen reader is given the settled sentence once. When a filter empties the list, the empty state names the filter that did it, in the same words, and offers to clear that one — plus the search, when there is one, plus the one "Clear all".
10. **It moves, or the person cannot see what their click did.** The rows settle, the count ticks, the applied line grows in, the door opens and closes. One duration and one curve for all of it, declared once as `MOTION` in `filters.tsx` — `--ollopa-door-ms` 180 ms, `--ollopa-settle-ms` 160 ms, `--ollopa-ease` `cubic-bezier(0.32, 0.72, 0, 1)` — and nothing moves under `prefers-reduced-motion: reduce`.

Two places this goes against what the products we admire do, and why. **Linear, Attio, Notion, Airtable and Google Drive have no idle filters at all** — one "+ Filter" button, and a filter exists only once it has a value. We keep named controls on the row because rule 1 says the two or three filters this seat touches every morning are visible without a click, and rule 4 says a door is labelled by its contents, which "+ Filter" is not. And **Linear splits filters from display options into two triggers**; we keep one door with three labelled groups, because rule 2 counts levels per channel and a second trigger is a second door.

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
