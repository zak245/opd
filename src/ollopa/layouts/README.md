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

### `Toolbar`

Search, filters, views, columns — **in the card's header**. At most five controls sit in front; the
sixth and beyond go behind one `Collapsible` door, and **the door labels itself** from what is
inside it ("Filter by owner, created, source · 3"). A page never decides what to hide.

```tsx
<Toolbar
  count="9 of 800"
  controls={[
    { name: "Search", always: true, node: <Input … /> },
    { name: "Stage", node: <Select … /> },
    { name: "Owner", node: <Select … /> },
  ]} />
```

`always: true` keeps a control in front whatever the count. The search always is.

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

### `IndexPage`

```tsx
<IndexPage
  family="companies" title="Companies" count={3100}
  actions={[{ kind: "primary", label: "Find companies", onClick: find }]}
  controls={controls} shown="260 of 3,100"
  table={<Table>…</Table>}
  rows={rows.map(phoneRow)}
  pager={<Button variant="outline" size="sm" onClick={more}>Show 25 more</Button>}
  bulk={selected.length ? <BulkBar … /> : undefined} />
```

`table` is the desktop body and `rows` the same things as a divided list for 400. Pass both.

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
