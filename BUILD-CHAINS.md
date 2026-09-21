# Build: chains

The product scores 17 of 18 on the disclosure rules and breaks every short chain of work that crosses two objects. Open a contact from a sequence and the sequence is gone. Open an audience from a campaign and the campaign is gone. Follow a link into Settings and you cannot get back. Find a person at a company and you have to leave the company. Change the set-up answers and you fall out into onboarding with no sidebar. The cause is one thing: the product has exactly one way to move, replace the whole page, and nothing anywhere remembers where you came from.

This build adds the second axis. Read [knowledge-base/13-chains-of-work.md](knowledge-base/13-chains-of-work.md) section 6 before anything else: it is the list of properties this build exists to satisfy, and every one of them came from measured evidence. Then `BUILD-BRIEF.md` for conventions and `src/ollopa/ui/README.md` for the primitives.

## The three mechanics

**1. Beside, not instead.** A related object opened from a page opens in a pane beside the page. The page stays mounted and untouched: same scroll, same selection, same open doors, same half-typed text, and no re-render of the page's rows. The pane shows the object's first level (the same fields its record page starts with, in the same order) plus the actions the chain needs, and next and previous when it was opened from a list. Nothing inside the pane opens a further level. The pane has one way out to the full record, "Open the page", which pushes the trail.

**2. The trail.** When a person goes to a full page from somewhere, the product keeps the origin: the route, the page's title, and the anchor (the row, door or field they left). The trail shows in the shell header as the person's own path: `Q4 enterprise outbound › Amara Nakamura`. Clicking an earlier crumb returns there, with the page exactly as it was, scrolled to the anchor, the anchor lit for about three seconds and focused. The trail is built only from the person's own moves. The sidebar, the bottom bar, the palette and a deep link start with an empty trail. Nothing is inferred and nothing is remembered across a sign-out. Under the hood the origin pages stay mounted while the trail holds them, so return is instant and nothing re-renders.

**3. Related things live inside the object.** A company's people are found on the company page: a real list with search and filters, inside the company, whatever the count. The same for a sequence's enrolled people, a campaign's audience, a deal's contacts. Rows open beside. The only reason to leave is to act on the whole set at once, and that jump carries the filter and the trail.

## The API (owned by the core builder; everyone else codes against it)

```ts
// src/ollopa/chain.ts — the chain store. In memory plus sessionStorage, keyed by business and user.
export interface Origin {
  route: string           // "/ollopa/sequences/seq-3"
  title: string           // the page's h1 at the time of leaving
  anchor?: string         // a data-item id, a door id, or an element id to return to
}
export function useTrail(): Origin[]
/** Leave the current page for `to`, remembering where you were. The only way a page navigates to a related page. */
export function follow(to: string, origin: Origin): void
/** Return to trail[index], truncating the trail after it. Sets the return cue for that page. */
export function back(index: number): void
/** Called by the shell on sidebar, bottom bar, palette and deep-link navigation. */
export function clearTrail(): void
/** The anchor a page should scroll to and light on arrival, consumed once. */
export function takeReturnCue(route: string): string | undefined

// src/ollopa/beside.ts — the pane store.
export interface BesideTarget {
  kind: string            // "person" | "company" | "deal" | "sequence" | "audience" | "campaign" | "list" | "setting" | …
  id: string
  /** When opened from a list: the ids in the order shown, so next and previous walk that list. */
  list?: { ids: string[]; index: number }
  /** The element that opened it; focus returns there on close. */
  opener?: HTMLElement | null
}
export function openBeside(target: BesideTarget): void
export function closeBeside(): void
export function useBeside(): BesideTarget | null

// A page folder registers pane renderers next to its nodes, in register.tsx:
export const besides: Record<string, BesideComponent> = { person: PersonBeside }
export type BesideComponent = (props: { session: Session; id: string; target: BesideTarget }) => ReactNode
// Product.tsx collects them with the same glob as `nodes`.
```

The shell (`AppShell.tsx`) renders the trail in the header, hosts the pane, keeps trail pages mounted (hidden with `visibility:hidden` and `inert`, never `display:none`, so scroll positions survive), and applies the return cue: scroll the anchor into view if needed, add the highlight class for three seconds, move focus to it. `Product.tsx` renders the page stack: the current page plus every page on the trail, keyed by route, capped at five.

## The pane

- Width about 28 rem on desktop, pushed in from the right, the page shrinking to make room rather than being covered; full width on phone. Opens and closes in about 200 ms; honours `prefers-reduced-motion`.
- Header: the object's name, one line of context, close (Esc), and "Open the page" (pushes the trail with the pane's opener as anchor).
- Body: the first-level fields from the record's own definition, then the actions the chain needs as real buttons with consequence lines where the rules require them (rule 7), then, when `list` is set, previous and next (`[` and `]`, also buttons) that walk the list without closing.
- Focus moves into the pane on open and back to the opener on close. The page behind stays scrollable and clickable; clicking another row in the list swaps the pane content in place.
- A pane never contains a Door and never opens another pane: opening a related object from inside the pane swaps the pane content and shows a one-step back inside the pane header (`‹ Amara Nakamura`). At most one such step: past that, "Open the page".

## The two scorecards

Every reviewed chain is scored on both. A chain is done at 18 and 18, or at a documented residue no demo can fix (analytics behind point 9 of the disclosure score).

**Disclosure** (RULES.md, nine questions, 0 to 2): unchanged.

**Chain** (from 13-chains-of-work.md section 6; nine questions, 0 to 2):

1. The origin stays visible and unchanged while a related thing is read.
2. Returning lands on the exact thing you left, lit and focused, with scroll, selection, open doors and drafts intact.
3. The trail is built only from the person's own moves; sidebar, palette and deep link start empty; nothing is inferred.
4. Related things are found inside the object; leaving is only for acting on the whole set, and carries the filter and the trail.
5. The pane carries the actions the chain needs and next and previous when opened from a list; nothing in it opens a further level.
6. No move, timeout or step completion destroys state any participant's chain still needs; required destruction is announced before and resumable after.
7. The result is visible before commitment; consequence lines travel into the pane.
8. Every action shows its effect where it was caused, in place, at once; the software never misreports state.
9. The keyboard runs the whole lap: open, read, act, next, close, return; focus is never lost; the origin page does not re-render when the pane opens (checked, not assumed).

## The chains this build is judged on

1. Sequence › enrolled person › back. Meridian SDR. Then next and previous through the enrolled list.
2. Campaign › audience › back. Ridgeline marketer. Then audience › a person in it › back to the campaign.
3. Company › find a person at it › open beside › act › back. Meridian AE, a company with more than forty contacts.
4. A page › a setting it links to › back to the row. Meridian admin, from the sequence's sending rules to Email sending.
5. Settings › change the set-up answers › back to the row, with the sidebar redrawn and a line saying what moved. Meridian admin.

Plus the three deal chains that already exist (board › quick look, deal › contact, deal › company), which must not regress.

## Stages

**Stage 1, core.** One builder owns `src/app/router.ts`, `src/ollopa/chain.ts` (new), `src/ollopa/beside.ts` (new), `src/ollopa/ui/Beside.tsx` (new, the pane frame), `src/ollopa/Product.tsx`, `src/ollopa/shell/AppShell.tsx`, `src/ollopa/shell/Palette.tsx` (clear the trail on jump), `src/ollopa/nav.ts` if needed, and `src/ollopa/ui/README.md` (document the two stores and the pane). Delivers the mechanics with one working pane, `person`, registered in `src/ollopa/pages/people/register.tsx` (the only page file the core builder touches), and the sequence › person chain wired in `src/ollopa/pages/engage/SequenceRecord.tsx` as the proof. Screenshots of that chain at every step, at 1440 and 400. A dev-only render counter proving the sequence page did not re-render when the pane opened.

**Stage 2, adoption.** Five builders in parallel, each owning its folder: engage (enrolled list beside with next and previous; sequence rules link into Settings with `follow`), marketing (campaign › audience beside; audience › person beside; audience record registers `audience`), companies (contacts inside the company: full list, search, filters, rows beside; "Open in People" carries the filter; registers `company`), settings (`?row=` anchor: open the door, scroll, light the row; set-up runs inside the shell when reached by `follow`, and finishing returns with the moved-sidebar line; registers `setting` so a setting can open beside a page where it makes sense), deals (contacts and company beside; no regression). Every builder replaces every `navigate()` to a related object in its folder with `openBeside` or `follow`, and never a bare navigate.

**Stage 3, review and iterate.** A reviewer who built none of it walks the five chains and the three deal chains with the keyboard and with puppeteer, screenshots every step, scores both cards, and writes the defect list with the score line each defect costs. The owning builder fixes. The reviewer walks again. Repeat until both cards are full or the residue is documented. Nothing is called done by the person who built it.

## Rules for every builder

- Plain English in comments and reply. No hype.
- Never a bare `navigate()` to a related object from inside a page. `openBeside` for a look, `follow` for a page.
- Never a `display:none` on a trail page. Never `localStorage` for the trail.
- Nothing inferred: no recent lists, no suggested returns, no reordering by history.
- Motion only for cause and effect, short, and off under `prefers-reduced-motion`.
- `npx tsc -b` and `npx vite build` green before you report. Screenshots looked at, not just taken.
- Reply in 250 words: what is built, both self-scores with proof lines, deviations stated plainly, file paths.
