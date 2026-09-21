# `src/ollopa/ui` — the shared primitives

Every ollopA page codes against these. They carry the rules so a page does not have to remember them:
a door that persists and prints, a panel that traps focus, a consequence written before the click, a
lock that sells instead of hiding, and one place to ask what sits at level one.

Nothing in here renders a usage number, a rule name or a word of teaching text. That is the product's
first non-negotiable.

```ts
import { Door, Panel, QuickLook, ConsequenceLine, ApproveBar, Locked, gate,
         HealthStrip, Announcement, SectionHeader, EmptyState, useDisclosure } from "@/ollopa/ui"
import { follow, back, clearTrail, useTrail } from "@/ollopa/chain"
import { openBeside, closeBeside, useBeside } from "@/ollopa/beside"
```

---

## `Door`

`{ id, label, count?, children, defaultOpen? }`

A collapsible in place: a chevron, the label, the count, `aria-expanded` and `aria-controls`, open state
remembered per user and per door id (`ollopa.door.<user>.<doorId>`). Closed content stays in the DOM with
`hidden="until-found"`, so find-in-page reaches it and opens the door. A door inside a door renders flat
with a warning in development, because the third level is the structure being wrong, not the widget.

Label it by what is behind it, with the count. Never "More", "Advanced" or "Other".

Printing expands every inline door in the group, in CSS as well as on `beforeprint`, so a printed record
carries what a closed door was holding.

```tsx
<Door id="deal.custom" label="Custom fields" count={5}>
  <dl>{/* the five fields */}</dl>
</Door>
```

`DoorGroup` wraps a page's doors so `ExpandAll` and printing can reach every one; `RecordPage` does this
for you. `useDoorState(id, defaultOpen?)` reads and writes one door from elsewhere on the page:

```tsx
const [, openEvidence] = useDoorState("deal.evidence")
<button onClick={() => openEvidence(true)}>Open the full evidence</button>
```

## `Panel`

`{ id, title, open, onOpenChange, side?: "right" | "bottom", children, footer? }`

A side sheet for a subtask that must keep the page in view. Focus moves in, is trapped, Escape closes and
focus returns. A panel may open a page; it never opens another panel, and it never contains a door.

```tsx
<Panel id="deal-lost" title="Mark lost and archive" open={open} onOpenChange={setOpen}
       footer={<Button disabled={!reason} onClick={archive}>Archive as lost</Button>}>
  <Select value={reason} onValueChange={setReason}>{/* Price · No decision · Competitor · Timing */}</Select>
  <p className="text-xs text-muted-foreground">{consequence}</p>
</Panel>
```

## `QuickLook` (`templates/QuickLook.tsx`)

`{ open, onOpenChange, title, fields: {label, value}[], editable?, onOpen }`

Level one of a record, opened from a table row with the table still in view: the top of the record page
cut short, same labels, same order, flat. One editable field at most — and which one may depend on who is
looking. `editable` also takes `options` (a picklist) and `multiline` (a composer), so the one field can be
a stage or a comment without becoming two controls.

```tsx
<QuickLook
  open={open} onOpenChange={setOpen} title={deal.name}
  fields={[
    { label: "Stage", value: deal.stage },
    { label: "Amount", value: money(deal.amount, deal.currency) },
    { label: "Close date", value: day(deal.closeDate) },
    { label: "Next step", value: `${deal.nextStep} · ${day(deal.nextStepDue)}` },
    { label: "Owner", value: deal.owner },
    { label: "Last activity", value: ago(deal.lastActivity) },
  ]}
  editable={isOwner
    ? { label: "Stage", value: deal.stage, options: stageNames, onChange: moveStage }
    : { label: `Comment for ${deal.owner}`, value: "", multiline: true, onChange: comment }}
  onOpen={() => navigate(`/ollopa/deals/${deal.id}`)}
/>
```

`TablePage` takes the same thing as a `quickLook` prop and opens it from a row click, from Enter on the
row, and from "Quick look" in the row's "…" menu:

```tsx
<TablePage<Deal> … quickLook={{
  title: (d) => d.name,
  fields: (d) => quickLookFields(d),
  editable: (d) => quickLookEditable(d, session),
  onOpen: (d) => navigate(`/ollopa/deals/${d.id}`),
}} />
```

## `ConsequenceLine`

`{ sends?, to?, from?, credits?, changes? }`

One sentence saying what a control will do: *"Sends 1 email to Nadia Berg from marcus@meridian.io · 4
credits"*. `consequenceText(props)` returns the same words as a string for a button label or an
`aria-label`, so the page and the button can never disagree.

```tsx
<ConsequenceLine sends={1} to={contact.name} from={mailbox} credits={CREDITS.draft}
                 changes="Replies land in your Inbox" />
```

## `ApproveBar`

`{ items: { id, consequence, expanded }[], onApproveAll, onDeclineAll }`

The label is computed — "Approve 8 · send 8 emails · 32 credits" — and the button stays disabled until
every item has been expanded or scrolled past once.

```tsx
<ApproveBar
  items={pending.map((p) => ({ id: p.id, consequence: { sends: 1, to: p.contact, credits: p.credits }, expanded: read.has(p.id) }))}
  onApproveAll={approveAll}
  onDeclineAll={declineAll}
/>
```

## `Locked` and `gate`

`Locked { feature, plan, pricePerMonth, what, children }` · `gate(feature) → { locked, plan, pricePerMonth, what }`

`gate` reads one table — `PLANS` in `data/businesses.ts`, which is PLAN.md §2 column by column — for the
signed-in workspace (pass a business to ask about another). A feature is not a hard-coded plan name: it is
a predicate over that row, so changing the table changes every lock in the product. `pricePerMonth` is the whole monthly bill at that plan for this workspace's seats — the total
for the period, never a breakdown. `Locked` wraps the real control where it would live, adds a lock and
the plan name, and on click opens a panel with what the feature does, the plan, the total and one button.
A non-admin gets a reason field and sends the request to the admin with the feature, the cost and where it
came from. Never wrap a safety or decision-critical control.

```tsx
const csv = gate("reports.csv-export")
csv.locked
  ? <Locked feature="Export as CSV" plan={csv.plan} pricePerMonth={csv.pricePerMonth} what={csv.what}>
      <Button variant="outline">Export CSV</Button>
    </Locked>
  : <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
```

## `HealthStrip`

`{ lines: { kind: "error" | "warning" | "info", text, href }[] }`

One line across the top of a page with only what needs attention. Renders nothing when the list is empty.

```tsx
<HealthStrip lines={[
  { kind: "error", text: "3 sync errors on Salesforce", href: "#/ollopa/settings" },
  { kind: "warning", text: "Bounce rate 4.2% — warns at 4%", href: "#/ollopa/settings" },
]} />
```

## `Announcement`

`{ text, href? }` — the one-line workspace-change announcement shared by Home, the shell and Requests.

```tsx
<Announcement text="Daniel Okafor added a required field to Proposal." href="#/ollopa/settings" />
```

## `SectionHeader`

`{ title, count?, action? }` — the heading for a scrolling section or a side card. The count is part of
the label, because a person decides whether to read the section from it.

```tsx
<SectionHeader title="Contacts" count={5} action={<Button size="sm" variant="ghost">Add</Button>} />
```

## `EmptyState`

`{ title, body, action? }` — what a list says when it is empty: what it is, what to do, and the control
that does it. No tour, no dismissible tip.

```tsx
<EmptyState title="No contacts on this deal yet" body="Add the people you are talking to, and say what each of them is."
            action={<Button size="sm">Add a contact</Button>} />
```

## `useDisclosure(page)`

Returns `{ level(itemId): 1 | 2, weekly(itemId), items, atLevelOne(itemId), levelOne }` for the signed-in
seat at the signed-in business, from the usage model. A page decides what sits at level one from this and
never from a hard-coded list — which is what lets one page serve four businesses and five seats with no
mode switch.

```tsx
const d = useDisclosure("deal")
const qualificationIsACard = d.level("qual.card") === 1          // AE: a card. CS and admin: a door.
const customFieldsInHeader = d.level("fields.custom") === 1      // Halyard and Ridgeline: the header.
const historyOpensByDefault = d.level("history.changes") === 1   // the seat that audits.
```

## `useSession()`

Re-exported from `../session` (the shell builder owns it): `{ business, role, user, hasReports, profile,
sidebarAdded, exposures }`.

---

## Moving between objects: the trail and the pane

A page never sends a person to a related object with a bare `navigate()`. There are two moves and
only two: **`openBeside`** for a look, which keeps the page you are on, and **`follow`** for the
whole record, which remembers where you were. Both are in the two stores below; the shell draws
them. `navigate()` stays for the shell's own jumps — the sidebar, the bottom bar, the palette — and
each of those clears the trail, because a jump is not a step in a chain.

### `chain.ts` — the trail

```ts
interface Origin { route: string; title: string; anchor?: string }

useTrail(): Origin[]                      // the path, for the shell's crumbs
follow(to: string, origin: Origin): void  // leave for `to`, remembering where you were
back(index: number): void                 // return to trail[index], truncating after it
clearTrail(): void                        // the shell, on any move that starts fresh
takeReturnCue(route: string): string | undefined   // the anchor to light on arrival, once
```

`origin.title` is the page's h1 as it read at the moment of leaving, and `origin.anchor` is the
thing you left: a `data-item` id, a `data-row-key`, a door id or an element id. Tag the row with
`data-item` and hand the same id to `follow`, and returning lands on it:

```tsx
<div data-item={contact.id} data-item-label={contact.name}>…</div>

follow(`/ollopa/people/${contact.id}`, {
  route: `/ollopa/sequences/${seq.id}`,
  title: `${seq.name} · Sequences`,
  anchor: contact.id,
})
```

The store lives in memory and in `sessionStorage`, keyed by workspace and person (never
`localStorage`, and never across a sign-out). The trail holds four origins, so the page stack —
the current page plus every page the trail is holding, in `Product.tsx` — is never more than five
mounted pages. A trail page keeps its DOM, hidden with `visibility: hidden` and `inert`, never
`display: none`: that is what keeps its scroll position, its open doors, its selection and its
half-typed text alive while you are away. Each mounted page owns its own scroller.

Nothing is inferred. The trail grows only from `follow` and shrinks only from `back`; a deep link,
a pasted URL, the browser's back button, the sidebar, the bottom bar and the palette all start with
an empty one.

The shell does the rest: it draws the crumbs in the header (`Q4 enterprise outbound › Amara
Nakamura`, and at phone width only `‹ Q4 enterprise outbound`), and on arrival it takes the return
cue — scrolls the anchor into view if it drifted out, lights it for three seconds with
`.ollopa-returned`, and moves focus to it.

### `beside.ts` and `Beside.tsx` — the pane

```ts
interface BesideTarget {
  kind: string                              // "person" | "company" | "deal" | "audience" | …
  id: string
  list?: { ids: string[]; index: number }   // the ids in the order shown, for [ and ]
  opener?: HTMLElement | null               // focus goes back here on close
}

openBeside(target): void · closeBeside(): void · useBeside(): BesideTarget | null
openBesideNested(target) · besideBack() · besideStep(+1 | -1)   // one step in, and back out
```

A row opens beside the page it is on. The page stays mounted, scrollable and clickable, and — this
is the property the mechanic rests on — **it does not re-render**: the pane has its own store, and
nothing about it reaches the page. The sequence record carries a dev-only render counter so this is
checked rather than assumed.

```tsx
openBeside({
  kind: "person",
  id: e.contactId,
  list: { ids, index },                   // `ids` in the order the rows are on screen
  opener: ev.currentTarget,
})
```

The frame gives you 28 rem pushed in from the right with the page shrinking to make room (the whole
width on a phone), about 200 ms and nothing under `prefers-reduced-motion`, a header with the name,
one line of context, close (Escape) and "Open the page", the body, and previous and next (`[` and
`]`) when `list` is set. Focus moves in on open and back to the opener on close. The row the pane is
reading is marked on the page itself with `.ollopa-beside-open`.

A pane never contains a `Door` and never opens a second pane. Opening a related object from inside
it (`openBesideNested`) swaps the content and leaves one `‹ back` in the header; past that one step,
the way on is "Open the page".

### Registering a pane

The folder that owns the object registers the renderer next to its `nodes`, in `register.tsx`.
`Product.tsx` collects `besides` with the same glob it uses for `nodes`, so nothing else changes:

```tsx
const PersonBeside: BesideComponent = ({ session, id }) => {
  const p = rowsFor(seedFor(session.business)).find((r) => r.id === id)
  return <>{/* glanceFields, then the actions the chain needs */}</>
}

/** The frame's header, and where "Open the page" goes. */
PersonBeside.head = ({ session, id }) => ({ name, context: `${title} · ${company}`, route })

export const besides: Record<string, BesideComponent> = { person: PersonBeside }
```

The body is the record's **first level** — the same fields, the same order, the same labels the
record page opens with, which for a contact means `glanceFields` — plus the actions the chain needs,
each a real button with its consequence line where the rules require one (rule 7). Nothing in the
body opens a further level.


---

### Templates built on these

- `templates/RecordPage.tsx` — the record: header, field grid, timeline or sections, side cards, doors,
  at most one tab, the brief block, Expand all and print. Rules it enforces are listed at the top of the
  file and in `specs/09-deal-record.md` §6.8.
- `templates/QuickLook.tsx` — the drawer above.
- `templates/TablePage.tsx` — the table, which opens the drawer.
