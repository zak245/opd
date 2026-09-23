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
- **Toolbar**: search, filters, views, columns, in the card's header. At most five controls before the rest go behind one door labelled by its contents.
- **Summary strip**: the numbers a page is judged by, one band, never boxes.
- **Sections**: one card per section, heading and count on the card, rows divided inside.
- **Side rail**: related things on a record, narrower than the main column.
- **Footer**: the pager, the bulk bar, the save bar.

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

A 4 px base with 8, 16 and 24 as the rhythm, as shadcn ships it. Content max width about 1300 px on structured pages, the board fluid, set by the template and never by a page. Indexes are one full-width column. Labels and values across a record sit on one shared column grid. Density is a user setting with two steps, never changed by width. No region of a page is empty at rest. A card is a section or a thing read on its own, and nothing else.

## 7. What the top of a record carries

Name with its family icon, subtitle, the acts on the same line; then the key fields the usage model puts at level one, in one strip; then sections in the usage order, doors inside them; the side rail for related things; at most one tab on the whole page.

## 8. How this connects to the other rules

Disclosure ([RULES.md](RULES.md)) decides what each part shows and what goes behind a door. The chain mechanics ([BUILD-CHAINS.md](BUILD-CHAINS.md)) decide how a person moves between pages and panes. The action rules and colour meanings ([DESIGN.md](DESIGN.md)) decide how controls and states look. This file decides where things sit and how the page behaves as it narrows. A template is a contract for all four at once.
