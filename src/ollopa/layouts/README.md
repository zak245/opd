# The layout system

Every page in the product is one of ten types, built from one set of parts. The contract is
[LAYOUTS.md](../../../LAYOUTS.md); this file is how to use it. **A page declares its type and fills
its parts. It never lays itself out, and it never sets a width.**

Everything here is composed from shadcn as shipped ([DESIGN.md](../../../DESIGN.md) §4). Nothing in
this folder declares a colour, a radius, a shadow or a spacing scale. The patterns site and the
agent plugin read this file, so every export is documented with its contract and one example.

```tsx
import { IndexPage, Section, Toolbar, SplitHandle } from "../../layouts"
```

---

## The parts

### `PageHeader`

The top line of a page: the family icon and title, the count, the one primary act, the "…" menu.
**Never filters** — those belong to the `Toolbar`, inside the card.

| Prop | Meaning |
|---|---|
| `family` | A page id or pane kind. Decides the icon and the title's ink (`identity.ts`). |
| `title` | The page's name. |
| `count` | How many things the page is about. Printed beside the title, never inside it. |
| `description` | One line under the title. |
| `actions` | `Action[]`, drawn through `Actions`, so the action grammar holds. |
| `more` | Acts behind the "…". |

```tsx
<PageHeader family="people" title="People" count={800}
  actions={[{ kind: "primary", label: "Add people", onClick: add }]}
  more={[{ kind: "secondary", label: "Import a CSV", onClick: importCsv }]} />
```

### `StatusRow`

One line of page state: badges, a notice. One line at every width — it scrolls sideways at 400
rather than wrapping, because a second row costs the page more than a scroll costs the reader.
The **workspace's** own health row is the shell's; this is for a page with state of its own.

### `Toolbar` and `FilterBar` — the filtering pattern

Search, filters, views, columns — **in the card's header**, and the same shape on every index
(LAYOUTS.md §2, "The filtering pattern"). `FilterBar` in `filters.tsx` is where it is built;
`Toolbar` is the name the pages import and is the same component under another word.

**A page declares data. The pattern draws every control.** There is no `node`, no `children` and no
`render` — a page that can draw the filter row can make its index look like a different product,
and four of them did. If a page needs something the five kinds cannot say, add a sixth kind here.

```
[ Search people ] [ Owner: me ▾ ] [ Stage: cold ▾ ] [ Title: any ▾ ]  [ › Filters and views  3 of 26 on ]   9 of 800 people
Filtered by [ Search: cedar ✕ ] [ Owner: me ✕ ] [ Stage: cold ✕ ] [ Score: 40 and above ✕ ]  Clear all 4 filters
└─ the door opens here, below the row, pushing the list down
```

| Prop | Meaning |
|---|---|
| `search` | `{ value, onChange, inputRef? }`. The box, its label and its placeholder are the pattern's: `Search ` plus the count's noun. A page never writes a placeholder. |
| `filters` | Every filter this page has, in the order this seat sets them. The bar keeps **three** on the row at 1280 and **two** at 1024, none on a phone, and never leaves exactly one behind. |
| `views` | `{ views, current, onOpen, onSave?, edited?, onRevert? }` — the door's second group. |
| `display` | `{ columns, onColumns, order?, density? }` — the door's third group. Not filters; never on the row. |
| `count` | `{ shown, total, noun }`. Always given: it is the count, the empty state's noun and the search placeholder at once. |
| `doorId` | The door's id, so it remembers whether it was left open (RULES.md rule 5). |

There is **no `onClearAll`**: the pattern derives it by clearing every filter it was given and the
search. A page cannot write a "Clear all" that forgets a filter someone added later.

#### The five kinds

Each one is `{ kind, name, … }`. `name` is one or two words and is what the control reads before
the colon; the pattern writes the rest.

| Kind | Fields | Reads |
|---|---|---|
| `"one"` | `options`, `value`, `off?` (default `"all"`), `onChange(value)` | `Stage: cold` · `Stage: any` |
| `"many"` | `options`, `value: string[]`, `onChange(values)` | `Stage: Cold +2` · `Stage: any` |
| `"toggle"` | `value: boolean`, `onLabel?`, `offLabel?`, `onChange(on)` | `Archived: shown` · `Archived: hidden` |
| `"range"` | `options` in order, `from`, `to`, `onChange(from, to)` | `Amount: €10k to €50k` · `Amount: €10k and above` |
| `"text"` | `value`, `onChange(value)` | `Company: Cedar` · `Company: any` |

`options` are `{ value, label, count? }`. Give `count` and each value says how many rows it would
leave, which is what stops a person choosing a dead end; leave it out on a long list, where
counting two hundred values against eight hundred rows on every keystroke is a stall, not a help.
A list over twelve values gets a box to search it, or set `search: true` to force one.

**`off` is the value that means "not filtering"** — and it is the seat's own default, not
necessarily a blank. The Deals board opens on the busiest pipeline, so that pipeline is the
`Pipeline` filter's `off`: a control that says it is filtering when it sits at its own default
teaches the person nothing. The opposite is just as important: Deals opens on "mine", and `off` is
`all`, so `Whose deals: mine` correctly reads as a filter that is on.

#### How a page uses this

```tsx
export function ListsPage() {
  const [q, setQ] = useState("")
  const [kind, setKind] = usePersisted("lists.kind", "all")
  const [owner, setOwner] = usePersisted("lists.owner", "all")
  const [archived, setArchived] = usePersisted("lists.archived", false)
  const [cols, setCols] = usePersisted("lists.cols", { source: false, created: false })

  const rows = useMemo(() => all.filter(/* the page's own matching */), [all, q, kind, owner, archived])

  const filters: FilterBarProps = {
    search: { value: q, onChange: setQ },            // placeholder becomes "Search lists"
    filters: [
      { kind: "one", name: "Kind", value: kind, onChange: setKind,
        options: [{ value: "people", label: "People" }, { value: "companies", label: "Companies" }] },
      { kind: "one", name: "Owner", value: owner, onChange: setOwner,
        options: b.roles.map((r) => ({ value: r.user, label: r.user })) },
      { kind: "toggle", name: "Archived", value: archived, onChange: setArchived,
        onLabel: "shown", offLabel: "hidden" },
    ],
    display: {
      columns: [
        { id: "source", label: "Source", on: cols.source },
        { id: "created", label: "Created", on: cols.created },
      ],
      onColumns: (ids) => setCols({ source: ids.includes("source"), created: ids.includes("created") }),
    },
    count: { shown: rows.length, total: all.length, noun: "lists" },
    doorId: "lists",
  }

  return <IndexPage<List> family="lists" title="Lists" filters={filters} rows={rows} … />
}
```

That is the whole of it. The page never writes: the control, the word `any`, the chevron, the
applied line, a chip, an "×", a "Clear all", the door, the door's label, the door's badge, the
count's sentence, the search placeholder, the empty state, or a single class name.

Three rules a page keeps, and the bar keeps the rest:

1. **Order `filters` by what this seat sets most.** The bar decides how many fit; the page never does.
2. **The columns, the order and the density go in `display`; the saved views go in `views`.** They
   are not filters, they never take a place on the row, and they never count towards the badge.
3. **Pass the count in three parts.** It is the count, the noun in the empty state and the word in
   the search placeholder, all from one place.

### `ResultCount`, `AppliedLine`, `FilterControl`, `FilterEmpty`

The pieces `FilterBar` draws, exported because a page that is not an index may need one.

- `<ResultCount shown total noun />` — "9 of 640 companies", **in that one wording whether or not
  anything is filtering**, ticking over `MOTION.settleMs`, tabular so it never changes width. The
  settled sentence is what a screen reader is given, once, `aria-live="polite" aria-atomic`.
- `<FilterControl f={filter} />` — one filter, drawn the one way. The same component appears on the
  row and inside the door, so a filter never looks like two things.
- `<AppliedLine on search onClearSearch onClearAll />` — the line under the row. It grows in on the
  first filter and collapses on the last, and it lists **every** filter that is on plus the search.
  A chip's "×" is **inside** the chip: one control, one accessible name.
- `<FilterEmpty noun filters search onClearSearch onClearAll />` — what a filtered index says when
  nothing is left. It names the last filter switched on and offers to clear that one.

`readFilter(f)` gives `{ name, value, on }` — the one reading rule — and `clearFilter(f)` puts one
filter back to `any`. `filtersOn(filters)` is the ones that are on, and `filterSignature(props)` is
what `useSettle` watches.

### The motion tokens: `MOTION`, `motionVars`, `useSettle`

Motion had no tokens, so a door opened in 180 ms on one page and 300 ms on another. There are now
two durations and one curve, in `filters.tsx`, and **everything that moves uses them**:

| Token | CSS custom property | Value | Used for |
|---|---|---|---|
| `MOTION.doorMs` | `--ollopa-door-ms` | 180 ms | a door, a panel or a pane opening or closing |
| `MOTION.settleMs` | `--ollopa-settle-ms` | 160 ms | rows settling, the count ticking, a line growing in |
| `MOTION.ease` | `--ollopa-ease` | `cubic-bezier(0.32, 0.72, 0, 1)` | all of it |

Spread `motionVars` on any root to read them from CSS. Everything stops under
`prefers-reduced-motion: reduce`: the transitions carry `motion-reduce:transition-none`, and
`useReducedMotion()` is there for the movement JavaScript drives.

`useSettle(signature)` is the rows' half. `IndexPage` already spreads it over its table, keyed on
`filterSignature(filters)`; a page that draws its own list does the same. When the signature
changes the new set arrives faded and two pixels high and settles into place. Out is instant; a dip
in both directions is a flicker, not a settle.

```tsx
const settle = useSettle(filterSignature(filters))
<div {...settle}>{rows}</div>
```

### `SummaryStrip`

The numbers a page is judged by: **one band of text, never a row of boxes.** Each figure is a
label, a value and an optional note, and may link to where the number comes from.

```tsx
<SummaryStrip figures={[
  { label: "Commit", value: "€401k", note: "5 deals", href: "#/ollopa/deals?forecast=commit" },
]} />
```

### `Section`

One card per section: the heading and count on the card, the rows divided inside it. This is the
only container a page builds with. `padded={false}` turns the body padding off where the body is a
table or a divided list. `Rows` divides children with the library's own rule.

```tsx
<Section heading="Today" count={6} actions={<Button variant="ghost" size="sm">All tasks</Button>} padded={false}>
  <Rows>{tasks.map((t) => <TaskRow key={t.id} task={t} />)}</Rows>
</Section>
```

`Container` is the same component under its older name, kept because 27 files adopted it.
`Group` is a band inside a section with **no tint and no border**.

### `RowsTable`

A table where there is room and a **divided list below `md`**. LAYOUTS.md §5 says a table becomes a
divided list at 400 and is never clipped; this is the part that keeps that promise for tables
*inside* records, not only on index pages. One set of column definitions draws both shapes.

| Column field | Meaning |
|---|---|
| `key`, `header`, `cell` | As on any table. |
| `lead` | This column is the row's own name; it heads the stacked form. Defaults to the first. |
| `phone: false` | Leave this column out of the stacked form, where it repeats the lead. |
| `className` | Applied to the head and the cell. |

```tsx
<RowsTable
  rows={steps}
  rowKey={(s) => s.id}
  columns={[
    { key: "step", header: "Step", lead: true, cell: (s) => s.name },
    { key: "sent", header: "Sent", cell: (s) => s.sent },
    { key: "opened", header: "Opened", cell: (s) => `${s.opened} · ${rate(s)}` },
  ]}
  empty="No steps have sent yet." />
```

Use it for every table inside a record. An index page gets the same behaviour from `IndexPage`'s
`table` and `rows` pair.

### What a page needs decided: `declareAlerts`

A page says what needs deciding; the shell folds it into the **one** Alert it already draws, after
the workspace's own items (LAYOUTS.md §2).

```tsx
useDeclareAlerts(exceptions.map((e) => ({
  id: e.id, text: e.text, danger: true,
  acts: [{ label: "Resume", onClick: () => resume(e) }],
})))
```

`declareAlerts(items)` returns its own cleanup; `useDeclareAlerts(items)` clears on unmount.

**How the Alert collapses.** Four things that need deciding is four lines of chrome, and chrome is
not the page. So:

| | Shown |
|---|---|
| The most urgent | in full, with its acts |
| The rest | one line each — truncated, never wrapped — up to four lines at a desktop, one on a phone |
| Beyond that | `"3 more · Show"`, a door inside the Alert that expands in place |

Chrome stays under about 200 px at 400 with four items. The order is the urgency order: the
workspace's own items first, then the page's, in the order the page declared them.

### Column priorities: `useColumnFit`

An index is one full-width column (§6) and nothing is removed as the page narrows (§5) — so a table
never scrolls sideways inside its card. Each column declares how hard it fights for its place:

| `priority` | Drawn from |
|---|---|
| `1` | every width — the row's name and the one or two facts it is read for |
| `2` | 1280 px |
| `3` | 1536 px |
| unset | treated as `2` |

```tsx
const { shown, folded } = useColumnFit(columns, (c) => c.priority)
```

What leaves the table is **not removed**: `folded` is rendered under the row's name as a meta line
(`label value · label value`), which is where the 400 divided list already puts it, and the column
picker still lists every column. Applied on People, Companies, Accounts and the Deals table.

### `SectionFilter`

The filter on a section **inside a record** — a contact's activity, a deal's timeline. An inline
`TabsList` above `md`; below it, one `Select` naming the filter that is on, because six words in a
350 px card clip at "Meetin…" and §5 says a thing is never clipped, only shaped differently.

```tsx
<SectionFilter label="Activity filters" options={FILTERS} value={filter} onChange={setFilter} />
```

Each option is `{ key, label, count? }`; a count is printed beside the label in both shapes.

### A record's section header (`RecordSection`)

`templates/RecordPage`'s sections take three optional slots beside the heading, laid out the way the
index `Toolbar` lays out its controls:

| Slot | What it holds | Where it sits |
|---|---|---|
| `search` | The section's own search. | **Always in front**, at every width. |
| `action` | The section's controls — a `SectionFilter`, a button. | Beside the heading above `md`; under it below, and inside the "…" on a phone when there is also a `menu`. |
| `menu` | `{ label, onClick, destructive? }[]` — acts that belong to the section, not to a row. | Behind one "…" at the heading's end. |

The heading itself wraps inside its own column, so a long title and its count never spill into the
action column.

```tsx
{ id: "person.activity", title: "Activity", count: 3,
  search: <Input aria-label="Search this activity" className="h-8 w-40" />,
  action: <SectionFilter label="Activity filters" options={FILTERS} value={f} onChange={setF} />,
  menu: [{ label: "Export as CSV", onClick: exportCsv }],
  children: … }
```

### `SideRail`

Related things on a record: narrower than the main column at 1440, stacked under it at 1024 and
below. The rail never carries the record's own decisions.

### `PageFooter`

The pager, the bulk bar, the save bar. Sticks to the bottom of the page's own scroller, so what it
says about a selection stays true while the list is scrolled.

---

## The interactions with an affordance of their own

### `Split` and `SplitHandle`

A two-pane split whose divider is **visible at rest**, has the resize cursor, resizes with the left
and right arrows, jumps with Home and End, resets on double-click or Enter, and **remembers its
size per person**. Built on shadcn's resizable panels. Both panes stay mounted, so a selection
survives the split being dragged shut.

```tsx
<Split id="inbox" list={<ReplyList />} detail={<Thread />} defaultSize={38} minSize={22} maxSize={62} />
```

### `DragGrip`

A visible grip on a draggable card, at rest on a pointer and stronger on hover and focus, **plus a
"Move to" menu** so the drag is never the only route. Put it first in the card's header.

```tsx
<DragGrip label={deal.name} places={otherStages} onMove={(id) => moveTo(deal, id)} />
```

---

## The templates

Each sets the content width for its type and its behaviour at 1440, 1024 and 400. **A page passes
no width.** Structured pages are about 1300 px; the board is fluid; a wizard step reads at 860 px.

| Template | For | Three-width behaviour |
|---|---|---|
| `IndexPage` | Find and act on many things of one kind | Table above 640; a **divided row list** at 400, never a clipped table |
| `RecordPage` (`templates/RecordPage`) | Dwell on one thing | Side rail beside at 1440, stacked under at 1024 |
| `MasterDetail` | A list and the open item, side by side | Two panes with the handle; one pane at 400, **selection kept** |
| `QueuePage` | A master-detail ordered by work left | As above, plus previous and next from the template |
| `BoardPage` | Cards grouped by one property | Fluid, no maximum; **one stage at a time at 400** with a switcher |
| `HomePage` | Summary tiles, each a door | One column at 400, two above `lg` |
| `WizardPage` | Rare, ordered steps | Step list beside at `lg`, above it below |
| `SettingsPage` | Grouped panels, each saved on its own | Area index beside at `lg`, above it below |
| `FormSheet` | One committed set of fields | A sheet — **the only thing a sheet is still for** |

### `Fields` — a card body of facts

**How a page uses this.** Hand it labelled values. A value may join at most three short facts with
"·"; a fourth fact is a fourth field. The grid, the dividers and the padding are the part's.

```tsx
<Section heading="Plan and price">
  <Fields fields={[
    { label: "Plan", value: "Scale · 42 seats" },
    { label: "Price", value: "$5,418 a month", note: "billed annually" },
    { label: "Renews", value: "15 January 2027", action: <Button size="sm" variant="outline">Change plan</Button> },
  ]} />
</Section>
```

`Rows` is the same idea for a body of rows: it divides its children with the library's rule.
Neither takes a padding, and `Section` no longer accepts one.

**The theme decides the look.** No page and no part writes `rounded-*`, `shadow-*` or a colour.

### `IndexPage` — the one index

**How a page uses this.** It passes data, columns and acts. It cannot pass a class, a width or an
order; the filter row is declared as data and drawn by the pattern (see `FilterBar` above).

```tsx
<IndexPage
  family="lists" title="Lists" count={lists.length}
  actions={[{ kind: "primary", label: "New list", onClick: create }]}
  filters={filters}
  columns={[
    { key: "records", header: "Records", priority: 1, numeric: true, cell: (l) => n(l.count) },
    { key: "owner", header: "Owner", priority: 3, cell: (l) => l.owner },
  ]}
  rows={rows} rowKey={(l) => l.id}
  name={(l) => <><a href={href(`/ollopa/lists/${l.id}`)}>{l.name}</a><Chip status={l.kind} /></>}
  menu={(l) => <Actions layout="menu" menuLabel={l.name} items={acts(l)} />}
  bulk={{ selected, onChange: setSelected, bar: <BulkBar … /> }}
  pager={<Button variant="outline" size="sm" onClick={more}>Show 25 more</Button>}
  slot={<ViewSwitch />} />
```

`columns` carry the sorting: give a column a `sort` comparator (and the name column a `nameSort`)
and pass `sort`/`onSort`, and the header becomes a button showing the direction. Sorting never goes
in the filter door. `acts` is the row's one visible act, drawn at rest before the `menu`; `subRow`
returns content while the page has that row open and the template draws it as a full-width row
under it. `BoardPage` takes the same `filters` declaration, so a board's row is an index's row.

**The theme decides the look.** No page and no part writes `rounded-*`, `shadow-*` or a colour:
corners are square, a card is paper lifted off the page ground by the library's own shadow, and an
overlay sits above the card. There are no levels beyond those two.

`slot` is the one named place for what the shape has no room for — a board/table switch, object
tabs, an "Expand all" — and it sits in the same place on every page that uses it.

`LegacyIndexPage` is the older shape (a page composes its own `table`), kept only while the
remaining pages move across.

### `IndexPage` (the older shape)

```tsx
<IndexPage
  family="companies" title="Companies" count={3100}
  actions={[{ kind: "primary", label: "Find companies", onClick: find }]}
  filters={filters}
  table={<Table>…</Table>}
  rows={rows.map(phoneRow)}
  pager={<Button variant="outline" size="sm" onClick={more}>Show 25 more</Button>}
  bulk={selected.length ? <BulkBar … /> : undefined} />
```

`table` is the desktop body and `rows` the same things as a divided list for 400. Pass both. It
also takes a `toolbar` node, and **only the lesson stages may use it**: a lesson exists to show the
version we are criticising and has to be allowed to draw it. No product page passes one.

### `MasterDetail` and `QueuePage`

```tsx
<MasterDetail
  id="inbox" family="inbox" title="Inbox" count={9}
  list={<ReplyList />} detail={<Thread />}
  selected={!!open} onBack={() => setOpen(null)} backLabel="Back to the replies" />
```

`QueuePage` adds `position`, `onPrevious`, `onNext`, `hasPrevious`, `hasNext`; the walk is drawn by
the template, so every queue in the product is walked the same way.

### `BoardPage`

```tsx
<BoardPage family="deals" title="Deals" stages={stages.map((s) => ({
  id: s.id, name: s.name, note: `${s.count} · ${money(s.total)}`, cards: <>{s.deals.map(card)}</>,
}))} />
```

### `HomeGrid`, and the `data-wide` tile

`HomePage` lays its tiles out with `HomeGrid`, which flows them **by height, not by count**: above
`lg` the tiles are a two-column masonry flow, so a tall tile on the right no longer leaves the lower
left empty (§6, nothing empty at rest). A tile that must span both columns says so itself:

```tsx
<Section heading="Pipeline" data-wide>…</Section>
```

`data-wide` is the only thing a page passes; the grid does the rest.

### `HomePage`, `WizardPage`, `SettingsPage`, `FormSheet`

```tsx
<HomePage family="home" title={greeting} description={dateLine} figures={figures}>
  <Section heading="Today" count={6}>…</Section>
  <Section heading="Waiting for your approval" count={7}>…</Section>
</HomePage>

<WizardPage family="settings" title="Connect Salesforce" steps={steps} current={step}
  onGo={go} footer={<Actions … />}>{body}</WizardPage>

<SettingsPage family="settings" title="Settings" areas={areas} current={area} onGo={go}
  save={<Actions … />}>{panels}</SettingsPage>

<FormSheet open={open} onOpenChange={setOpen} title="Edit the next step"
  save={<Actions … />}>{fields}</FormSheet>
```

---

## Overlays: which one, and when

From [LAYOUTS.md](../../../LAYOUTS.md) §3, in order — the first that is true wins:

1. The page behind is **needed and worked on** → the **beside pane** (`openBeside`).
2. Needed **for reference only** → a popover, or a non-modal `Panel`.
3. Must be **blocked**, and only for an irreversible act → a `Dialog`, through `Actions`.
4. Small and nonessential → a `Popover`.
5. **Editing a set of fields** → a `FormSheet`.

Never one overlay over another; one open at a time. Nothing decision-critical lives only in an
overlay. **The quick look is the beside pane** — `QuickLook` keeps its old props but renders
through `Beside`; there is no modal quick look.

---

## Migrating a page

1. Pick the type from the table in LAYOUTS.md §1 and import its template.
2. Delete every width the page sets itself: `max-w-*`, `mx-auto`, and its own page grid.
3. Move the page's title, count, primary act and "…" into the template's `PageHeader` props, and
   **take the filters out of the header** — they are `controls` on the `Toolbar`.
4. Turn each section into a `Section`, with its rows inside a `Rows`.
5. Give an index a `rows` renderer for 400. If a table is the only body, it will be clipped.
6. Delete any phone-only branch the template already owns: the collapse to one pane, the stage
   switcher, the sheet for navigation.
7. Keep every `data-item`, `data-container`, `aria-*` and keyboard handler exactly as it is — the
   walk scripts in `scripts/` read them, and `npm run see` shoots them.
8. Run `npm run see -- <your scene prefix>` and look at the images.
