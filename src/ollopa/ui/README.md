# `src/ollopa/ui` — the shared primitives

Every ollopA page codes against these. They carry the rules so a page does not have to remember them:
a door that persists and prints, a panel that traps focus, a consequence written before the click, a
lock that sells instead of hiding, and one place to ask what sits at level one.

Nothing in here renders a usage number, a rule name or a word of teaching text. That is the product's
first non-negotiable.

```ts
import { Door, Panel, Actions, Confirm, QuickLook, ConsequenceLine, ApproveBar, Locked, gate,
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

## `Actions`

`{ items: Action[]; layout?: "row" | "stack" | "menu"; surface?: "page" | "pane" | "dialog" | "card"; menuLabel?: string }`

Every control on a surface, drawn by its kind. A page never picks a `Button` variant by hand: it says
what each control *is* and this decides how it looks, where it sits and whether it asks first. The
rules are DESIGN.md §1 and §2.

```ts
type Action = {
  label: string
  kind: "primary" | "secondary" | "destructive" | "link"
  onClick?: () => void
  href?: string            // a link renders a real <a>; with onClick too, the click stays the page's
  cost?: string            // "8 credits", "1 email" — the only thing that earns a line beside a control
  consequence?: string     // the rest of that line ("Charged once"), allowed only beside cost or irreversible
  irreversible?: { title: string; consequence: string; confirmLabel: string }
  disabledBecause?: string // object state the person can change; never a seat or a permission
  keys?: string            // the shortcut, printed on the control
  dataItem?: string        // and dataItemLabel: the usage-model id the lesson stage and the cue look for
  id?: string
  "aria-label"?: string
  attrs?: Record<string, string>   // anything else the control must carry: data-row-focus, data-print-hide
}
```

`attrs` is why a row's hover strip, its "…" menu and a bulk bar use `Actions` instead of drawing
their own buttons: whatever a row needs to be found again later goes on the control here.

```tsx
<Actions surface="card" layout="menu" menuLabel={person.name} items={rowActions} />
```

`layout="menu"` requires `menuLabel` — the name of the thing the menu acts on — because a screen
reader meeting twenty "More actions" buttons down one table learns nothing (RULES.md rule 4). The
trigger reads "Actions for Mateo Okonkwo". Without it you get "More actions" and a warning.
```

| Kind | Drawn as | Where it sits |
|---|---|---|
| primary | Filled | First. One per surface. |
| secondary | Outline | After the primary. |
| link | A real `<a>`, underlined on hover | After the acts. |
| destructive | Text in the destructive colour, low emphasis | Last, after a gap. |

What it enforces, with a development warning each time:

- **One primary per surface.** A second one is drawn as a secondary and the console says which.
- **Destructive is never filled** and never next to a benign control: it is separated by a rule.
- **Emphasis by fill, never size.** One size per surface; the kind cannot change it.
- **Full width only on a phone.** `layout="stack"` fills the width below `sm` and hugs its label above it.
- **A line beside a control only where the act spends or cannot be undone.** A `consequence` passed
  for a free, reversible act is dropped and named.
- **A pane carries at most three acts and nothing irreversible.** An irreversible item on a pane is
  not drawn at all, with a warning telling the builder to leave it on the record page.

```tsx
// the deal record's header: one act the page exists for, one more, and the end of the deal
<Actions surface="page" items={[
  { label: "Log activity", kind: "primary", onClick: logActivity, keys: "l" },
  { label: "Close won", kind: "secondary", onClick: closeWon,
    irreversible: { title: "Close this deal won?",
      consequence: "Stage becomes Closed won. HubSpot is updated. Cedar Systems hands off to customer success.",
      confirmLabel: "Close won" } },
  { label: "Mark lost and archive", kind: "destructive", onClick: markLost,
    irreversible: { title: "Archive this deal as lost?",
      consequence: "The deal leaves the board and the forecast. Its activities stay on the company.",
      confirmLabel: "Archive as lost" } },
]} />

// a pane: at most three comparable acts, so none of them is filled
<Actions surface="pane" layout="stack" items={[
  { label: "Add to a sequence", kind: "secondary", onClick: move, disabledBecause: dest ? undefined : "Choose a sequence above" },
  { label: "Reveal the phone", kind: "secondary", onClick: reveal, cost: "8 credits", consequence: "Charged once" },
  { label: "Create a call task", kind: "secondary", onClick: task },
]} />
```

**Confirmation.** `irreversible` routes the click through the shared `Confirm`: the consequence sits
above the affirmative and the affirmative carries the verb — "Archive as lost", never "OK". Confirm
on reversibility, not on danger: a reversible act, however large, acts at once. After it acts, say so
where it was caused — `recordEdit(kind, id, { note })` gives you "Done · … · Undo" on the row and in
the pane's footer, which is the backstop confirmation never replaces.

### The visual grammar (DESIGN.md §4)

`Actions` applies all of this by surface, so a page never sets a size, a variant, a colour or a place.

- **Size, one per surface.** Page header and dialog take the 36 px height; pane, card, row, bulk bar,
  queue footer and Save bar take 32 px. The extra-small size is for chips and pagers, never an act.
- **Hit region.** Under 640 px every act carries a 44 px hit region through `.ollopa-act`, which grows
  the area that answers a thumb without changing the height anything is drawn at.
- **Focus ring.** One ring, on every control, from `index.css`: 3 px of `--ring` with a 2 px offset.
  The token has a hue of its own because a grey one cannot reach 3:1 against both a white page and a
  near-black fill. `node scripts/ring-contrast.mjs` prints every ratio and exits non-zero below 3 —
  change the token and run it.
- **States.** Hover one step darker, pressed one step darker again, nothing moves. `loading: true`
  keeps the label, puts a spinner in the leading padding so the width does not change, and takes no
  second press. A disabled control never explains itself in a tooltip; `disabledBecause` draws the
  reason beside it, and passing a `title` with it is warned.
- **Icons.** No icon inside an act. Exactly three controls are icon-only — the "…" trigger, the pane's
  close, and its previous and next — and each carries an accessible name and a tooltip.
- **Placement.** The surface decides, and the map does not change by page or by seat: page header and
  card and row, acts at the trailing edge, primary leftmost; pane, a stack under the fields; dialog,
  the affirmative trailing; bulk bar, queue footer and Save bar, leading edge. A `layout` that
  contradicts its surface is warned and the map wins.
- **Colour.** Four meanings, one each: the neutral primary fill for the one primary act, the
  destructive hue for destructive acts and their confirmations, `text-success` for a "Done · Undo"
  line and never a button, warning for ribbons and the health strip. A `className` on `Actions` that
  paints, or a `class`/`style` smuggled through `attrs`, is warned.
- **Motion.** Colour moves over 100 ms on hover and press; the "Done · Undo" line fades in over
  150 ms (`.ollopa-done`). Nothing slides, scales or bounces, and all of it stops under
  `prefers-reduced-motion`.

**What it cannot enforce.** Whether a seat may act at all. A seat that cannot act gets *no control*
and one sentence naming who can (RULES.md rule 4), so the page leaves the item out of the list
rather than passing it here with `disabledBecause`.

## Visual identity (DESIGN.md §5)

Colour has five jobs here and nothing else may use colour. The tokens are in `src/index.css`, the
registry in `src/ollopa/identity.ts`, and the shell and these primitives apply them — so a page
never picks a hue.

1. **Structure.** Warm neutrals (a little chroma at hue 80), most of every screen: `--surface-page`,
   `--surface-raised`, `--surface-overlay`, `--foreground`, `--muted-foreground`, `--border`.
   Three depths, and in dark higher is lighter rather than shadowed. Utilities: `.surface-page`,
   `.surface-raised`, `.surface-overlay`.
2. **The accent.** One hue, indigo 264: `--brand` is the primary fill, `--brand-tint` the active
   sidebar item, `--brand-ink` links, `--ring` the focus ring, and `--info` the informational status.
   Nothing else is indigo.
3. **Six object families.** Each a fixed icon plus a fixed hue, always together:
   `--family-<id>` (a bar or a dot), `--family-<id>-tint` (a chip), `--family-<id>-ink` (icon and text).
4. **Five statuses.** `danger`, `warning`, `success`, `info`, `paused` — state only, never decoration
   and never a family, each with a tint and an ink, and always with a word beside it.
5. **Nothing else.**

```tsx
import { Chip, FamilyIcon, FamilyBar, familyOf, statusOf } from "@/ollopa/ui"

<FamilyIcon of="people" size="header" />          {/* a page id or a pane kind */}
<Chip family="deals">Deals</Chip>                  {/* a family chip: always carries its icon */}
<Chip status={enrolment.status} />                 {/* a status chip: always carries its word */}
<FamilyBar of={target.kind} className="h-[3px]" /> {/* the pane's top edge */}
```

`familyOf(pageOrKind)` takes a page id (`"sequences"`), a pane kind (`"person"`) or a family id and
returns `{ name, icon, fill, tint, ink }`. `statusOf(word)` maps the words the product already shows
— "Bounced", "Active", "Paused" — onto the five, so a page passes its word and never a colour.

**You know where you are three ways at once**: the page title carries its family icon and ink, the
active sidebar item is the accent tint with a leading bar, and a trail crumb carries the family icon
of the page it points back at. A pane adds a fourth: a thin bar in its object's hue and its icon
beside the name.

**Type has five sizes and no others**: `.t-title` 24/600, `.t-section` 18/600, `.t-body` 14/400,
`.t-label` 13/500, `.t-small` 12/400. Inter where it is installed, the system stack otherwise, and
nothing is fetched at runtime. Tabular numerals are on for the whole product.

**Every pair is measured.** `node scripts/contrast.mjs` reads `index.css` itself and fails below
4.5:1 for text or 3:1 for icons and control boundaries; it also simulates deuteranopia and
protanopia over the six family inks and the five status inks and fails if any two collapse. Change a
token, run it. `#/design` is the same set on a page.

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

**One thing is lit at a time.** The cue lasts three seconds, which is long enough to open a pane or
follow a link inside it, and two rows lit at once would say two different things are the one you came
back to. So a new cue, opening a pane, and following a link each put out whatever was lit before.
`lightUp(el)` and `clearHighlight()` in `chain.ts` are the only two ways the mark goes on and off.

Arriving anywhere by `follow` puts focus on that page's own `h1` and lights it for the same three
seconds a return gets, so the crumb back is one Shift+Tab away instead of a walk through the sidebar.

The shell does the rest: it draws the crumbs in the header (`Q4 enterprise outbound › Amara
Nakamura`, and at phone width only `‹ Q4 enterprise outbound`), and on arrival it takes the return
cue — scrolls the anchor into view if it drifted out, lights it for three seconds with
`.ollopa-returned`, and moves focus to it.

### Every row-to-record move goes through the trail

A row on an index that opens its record is a step in a chain, not a jump, so every one of them uses
`follow` with the row as the anchor — Sequences, Lists, Templates, Campaigns, Companies, People,
Deals. The shell then does both halves of the return for free:

- the crumb in the header comes back to the index with the row lit and focused;
- **`RecordPage`'s own back link** ("← Sequences") calls `back()` instead of navigating, whenever the
  last origin on the trail is that index. Reached any other way — a deep link, ⌘K, a link from
  somewhere else — it stays the ordinary link it has always been. A record page gets this by passing
  `back={{ label, href }}` as before; there is nothing to opt into.

```tsx
const open = (s: Sequence) =>
  follow(`/ollopa/sequences/${s.id}`, { route: "/ollopa/sequences", title: "Sequences", anchor: s.id })
```

`DataTable` already writes `data-row-key` on every row, so a table whose row key is the record id
needs no extra tagging; anywhere else, put `data-item` on the row and hand the same id to `follow`.

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
`]`) when `list` is set. Focus moves in on open and back to the opener on close — including when the
pane was opened from a "…" menu, which puts focus back on its own trigger as it closes, so the frame
takes focus once more after that has settled.

On a phone the pane covers the page, so its header carries one line of what it is covering —
"From Q4 enterprise outbound · row Mateo Okonkwo" — and closing is a return: the row is scrolled back
into view and lit, not merely focused. At desktop widths the row never left the screen, so it is
marked rather than flashed. The row the pane is
reading is marked on the page itself with `.ollopa-beside-open`.

### An action in the pane lands on the row behind it

Opening a pane must not re-render the page; **acting in one must**. The two are not in conflict, and
`src/ollopa/edits.ts` is how they are both kept: the pane writes one small record, and only the rows
that read that kind of object re-render.

```tsx
// in the pane body, when the action is taken
recordEdit("person", p.id, { inSequence: "Warm inbound follow-up", note: `Moved to Warm inbound follow-up` })

// in the row behind, on the page
const edits = useEdits("person")                 // every person changed this session
const changed = edits[p.id]
<td>{changed?.inSequence ?? p.inSequence}</td>
{changed?.note && <span className="text-xs text-muted-foreground">{changed.note}</span>}
```

`recordEdit(kind, id, patch)` merges into what is already known and stamps `at`. `useEdits(kind)`
gives a list every record of that kind and re-renders it when one changes; `useEdit(kind, id)` follows
one object; `editOf(kind, id)` reads one without subscribing. `clearEdit(kind, id)` is undo — the row
and the pane both stop saying it in the same commit. The store is this session only, per seat:
signing out, switching account or changing seat wipes it, the way the trail goes.

**The pane's footer says it too.** Whenever the record carries a `note`, the frame draws
"Done · what happened · Undo" above previous and next, with Undo calling `clearEdit`. A body whose
undo has to do more than drop that record replaces the line with `useBesideDone({ note, onUndo })`.

Closing the pane widens the page again, and the frame holds the row that opened it at the same place
on screen while that happens. If an action in the pane removed that row — a task marked done, a reply
handled — focus does not fall to the top of the page on close: it goes to the row that took its
place in the list, lit the same way a return is.

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

### What a pane's fields are

The body is the record's **first level** — the same fields, in the record's order, with the record's
labels — plus the actions the chain needs, each a real button with its consequence line where the
rules require one (rule 7). Nothing in the body opens a further level.

"First level" means exactly what it means on the record page: the items the usage model puts at
level one **for this seat at this business**, from `useDisclosure(page)`. It is never a hand-written
list. A fixed list shows an SDR at Meridian and a founder at Fathom the same seven fields when the
record pages behind them do not, and then the pane is a third version of the object rather than the
top of the record cut short.

Build them with `usePaneFields`, which every pane shares:

```tsx
import { usePaneFields } from "@/ollopa/ui/Beside"

const fields = usePaneFields("people", [
  { item: "person.title",    label: "Title",    value: p.title },
  { item: "person.company",  label: "Company",  value: p.company },
  { item: "person.owner",    label: "Owner",    value: p.owner },
  { item: "person.sequence", label: "Sequence", value: sequenceLine(p) },
])
```

`item` is the usage-model item id for that field on the record's page. The hook drops everything at
level two and returns the rest in the order you gave, which is the record's order. It also tells the
frame which page's usage model you read: a pane body that draws fields without saying gets one
warning per kind in development, because nothing behind its field choice is a usage number.

A body whose fields do not fit that shape — groups, a mix of fields and cards — asks `useDisclosure`
itself and says so with one line, which quiets the warning and makes the same promise:

```tsx
const d = useDisclosure("people")
declarePaneFields("people")
```

Decision-critical fields are level one whatever the numbers say (rule 7), so they arrive in the pane
without a special case.


---

### Templates built on these

- `templates/RecordPage.tsx` — the record: header, field grid, timeline or sections, side cards, doors,
  at most one tab, the brief block, Expand all and print. Rules it enforces are listed at the top of the
  file and in `specs/09-deal-record.md` §6.8.
- `templates/QuickLook.tsx` — the drawer above.
- `templates/TablePage.tsx` — the table, which opens the drawer.
