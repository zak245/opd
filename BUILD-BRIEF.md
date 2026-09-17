# Build brief

How ollopA is built, so that many builders working in parallel produce one product. Every builder reads this first, then the spec for their node(s), then the map rows for those nodes.

## Sources of truth, in order

1. `IA-MAP.md`: what exists, its level, its seats, its profile, its plan gate, and how it is reached. Node ids are the vocabulary.
2. The spec for the node (`specs/NN-*.md`), sections 3 (features), 6 (after) and 7.
3. `RULES.md` and `PLAN.md` section 2 when a spec is silent or wrong.
4. The usage model (`src/ollopa/usage/`) for what is level one versus level two for the signed-in seat at the signed-in business.

## Non-negotiables in the product

- The product shows only the final, disclosed version. No teaching text, no usage numbers, no rule names, no "lesson" anything in the product UI.
- Two levels per channel. A door never contains a door. A panel never opens a panel; it may open a page.
- Every door is labelled by its contents with a count: "Additional filters: owner, location, signals (3)". Never "More", "Advanced", "Other".
- Door open state persists per user and per door id (`localStorage` key `ollopa.door.<user>.<doorId>`).
- Decision-critical items are always visible: price and renewal, credit balance and burn, bounce guard state, agent approval limits and caps, cancel, delete, pending approvals with their consequence.
- Nothing hover-only. Row actions show on hover and on focus-within and also live in the row's "…" menu.
- Three kinds of "cannot see it" (RULES.md, the declared sidebar): object not owned is readable with edit controls absent; area outside the seat shows `NoAccess` naming who uses it and who to ask; page left out by the profile opens and its header offers `AddToSidebar`.
- Gated features (RULES.md pattern): visible where they would live, a real control, a panel with what it does, the plan, the total per period, one button; non-admins ask the admin from the same panel with a reason field; never gate safety or decision-critical items; the lock sits at the entry point.
- Approvals: owner approves own, admin may approve for anyone; batches at task boundaries; every item carries its consequence line ("Sends 1 email to Nadia Berg from marcus@ · 4 credits"); "Approve all" carries the total in its label and requires each item expanded or scrolled past once; reversible low-cost work is logged with Undo, never queued.
- Plain English in every label and message. Active voice. A control says what happens.

## Code layout

```
src/ollopa/
  usage/            the usage model (done; do not edit numbers without a spec change)
  data/             businesses.ts, seed.ts  (owner: data builder)
  session.ts        session store            (owner: shell builder)
  nav.ts, map.ts    sidebar + node registry  (owner: shell builder)
  shell/            AppShell, bell, credits, palette, no-access, add-to-sidebar (owner: shell builder)
  ui/               shared primitives        (owner: primitives builder)
  templates/        TablePage (done), RecordPage, QuickLook (owner: primitives builder)
  pages/<node>/     one folder per page node, files owned by that page's builder
  Product.tsx       routes node ids to page components (owner: shell builder)
```

## Shared primitives (in `src/ollopa/ui/`), the API every page codes against

- `Door` `{ id: string; label: string; count?: number; children; defaultOpen?; }` collapsible in place; chevron + text; `aria-expanded`; persists by id; renders nothing nested-openable inside.
- `Panel` `{ id; title; open; onOpenChange; side?: "right"|"bottom"; children; footer? }` a side sheet for a subtask that keeps page context; focus trap; Escape closes; never contains a `Door`.
- `QuickLook` `{ open; onOpenChange; title; fields: {label, value}[]; editable?: {label, value, onChange}; onOpen: () => void }` flat drawer from a table row: same labels and order as the top of the record; one editable field at most; "Open" goes to the record.
- `ConsequenceLine` `{ sends?: number; to?: string; from?: string; credits?: number; changes?: string }` renders one sentence.
- `ApproveBar` `{ items: {id, consequence: ConsequenceProps, expanded: boolean}[]; onApproveAll; onDeclineAll }` label computed: "Approve 8 · send 8 emails · 32 credits"; disabled until every item was expanded or scrolled past.
- `Locked` `{ feature: string; plan: "Growth"|"Scale"; pricePerMonth: number; what: string; children }` wraps the control where it would live; click opens the gating panel; `askAdmin(reason)` for non-admins.
- `HealthStrip` `{ lines: {kind, text, href}[] }` one-line strip; only lines that need attention.
- `Announcement` `{ text; href? }` the one-line workspace-change announcement shared by Home, the shell and Requests.
- `SectionHeader` `{ title; count?; action? }`.
- `EmptyState` `{ title; body; action? }` plain, no onboarding tour.
- `useDisclosure(page)` returns `{ level(itemId): 1|2; weekly(itemId): number; items: UsageItem[] }` for the current session (business, role, hasReports). Pages decide what sits at level one from it, never from hard-coded lists.
- `useSession()` returns `{ business, role, user, hasReports, profile, sidebarAdded: Page[], exposures: {page, until}[] }`.
- `gate(feature)` returns `{ locked: boolean; plan; pricePerMonth }` from the plan table in PLAN.md.

## Routing

Hash routes, one per map node that is a page, record or wizard: `#/ollopa/<page>` for pages, `#/ollopa/<page>/<id>` for records, `#/ollopa/setup` for workspace set-up, `#/ollopa/connect/<integration>` for the wizard, `#/ollopa/import` for the import wizard. `map.ts` exports the registry `{ nodeId, route, page: Page, seats, profiles }` derived from IA-MAP part 2, so ⌘K, deep links and the no-access logic all read one table.

## Data

`seed.ts` is deterministic per business. Builders never invent data inline; they read seed and, where a spec needs a new entity or field, they add it to seed (the data builder owns seed; page builders send additions as a list in their reply and stub locally until landed).

## Quality bar for a builder

- `npx tsc -b` and `npx vite build` pass.
- One screenshot per page state via `node scripts/shot.mjs "<route>" <out.png> <business>:<role>` at 1440 and at 400 wide; the builder looks at both and fixes what is wrong before reporting.
- The nine-point review score from RULES.md, self-scored in the reply, with the line that proves each point.
- Keyboard-only pass once through the page.
- No `TODO` left in shipped files; unfinished parts are stated in the reply, not hidden in code.
