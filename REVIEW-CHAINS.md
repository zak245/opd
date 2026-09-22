# Stage 3 review: the chains

Round 11 is the current review — the shadcn pass over every page. Rounds 10 through 1 are kept
below, in order.

---

# Round 11 — is this the library's look?

I read the rewritten `DESIGN.md` §4, then walked all 21 pages of the map as a seat that holds each,
at 1440 and 400, in light and dark: **84 screenshots** under `shots/chains/review11/light/` and
`…/dark/`, with the log in `…/logs/shadcn.txt`. A new probe, `scripts/review-shadcn.mjs`, reads back
per page: every box that carries a border, a radius or a shadow and is **not** a library
`data-slot` (A); the bands of chrome above the content and their heights (B); whether every table
and section sits in a `Card` and whether any `Card` nests (C); the type painted (D); which library
slots are in play (E); and the console (F).

**Consoles: silent.** Production and dev, all 84 page loads and all six chain runs — no warning, no
error, no failed request.

## The verdict first

**Mostly, yes — the frame is the library's; the contents are still ours.** The shell is shadcn's
`Sidebar` with its rail and toggle, the header is the library's pattern, the alert is a real
`Alert`, tables sit in `Card`s with the toolbar in `CardHeader` and the pager in `CardFooter`, the
filters are `Badge`s and `ToggleGroup`s, and the slot census shows it: Companies paints
`card`, `card-header`, `card-content`, `card-footer`, `table`, `table-row`, `badge`,
`sidebar-menu-button`, `select-trigger`. **Containment is clean everywhere**: every table on every
page is inside a `Card`, and there is **not one nested `Card`** in the product, at either width, in
either theme.

What has not moved is the layer below. **1,128 hand-drawn boxes** across the walk — the same six
idioms repeated — and they are the parts a person actually reads: the chips, the strips, the
dividers, the tinted blocks.

## Page by page

Counts are at 1440 light, with the off-screen skip link discounted. A = hand-drawn boxes.
B = bands of chrome above content / total height. ✓ passes, ! fails, ? see the note.

| Page (seat) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| Home (sdr) | **33** ! | **3 / 200 px** ! | ✓ 4 cards, 0 nested | ✓ | ! third band is a hand-drawn pill strip | ✓ |
| People (sdr) | 20 ! | 2 / 162 px ✓ | ✓ table in a card | ✓ | ? `th.border-l` and `td.border-l` added to the library's table | ✓ |
| Companies (sdr) | **52** ! | 2 / 163 px ✓ | ✓ | ✓ | ! `div.bg-muted.border-b` filter strip full-bleed inside the card | ✓ |
| Lists (sdr) | 28 ! | 2 / 169 px ✓ | ✓ | ✓ | ? `section.border-t.first:border-t-0` hand dividers | ✓ |
| Sequences (sdr) | 13 ! | 2 / 169 px ✓ | ✓ | ✓ | ✓ | ✓ |
| Sequence record (sdr) | **51** ! | 2 / 183 px ✓ | ✓ 5 cards, 0 nested | ✓ | ! `p.rounded-md` tinted status block where an `Alert` belongs | ✓ |
| Templates (sdr) | 19 ! | 2 / 169 px ✓ | ✓ | ✓ | ✓ | ✓ |
| Inbox (sdr) | 13 ! | 2 / 159 px ✓ | ✓ | ✓ | ✓ tabs inline, reading pane intact | ✓ |
| Tasks (sdr) | 9 ! | 2 / 159 px ✓ | ✓ | ✓ | ✓ | ✓ |
| Deals board (ae) | 29 ! | 2 / 159 px ✓ | ✓ | ✓ | ? cards-per-deal is the allowed case | ✓ |
| Deal record (ae) | 29 ! | 2 / 187 px ✓ | ✓ | ✓ | ✓ | ✓ |
| Contact record (sdr) | 7 ! | 2 / 187 px ✓ | ✓ | ✓ | ✓ | ✓ |
| Campaigns (marketer) | 11 ! | 1 / 72 px ✓ | ✓ | ✓ | ✓ | ✓ |
| Accounts (cs) | 25 ! | 1 / 76 px ✓ | ✓ | ✓ | ✓ | ✓ |
| Workflows (marketer) | 7 ! | 1 / 76 px ✓ | ✓ | ✓ | ✓ | ✓ |
| Requests (admin) | 24 ! | 2 / 198 px ? | ✓ | ✓ | ? the Alert is 90 px: two messages stacked | ✓ |
| Reports (admin) | 6 ! | 2 / 190 px ? | ✓ | ✓ | ✓ | ✓ |
| **Agents (admin)** | **105** ! | 2 / 190 px ? | ✓ | ✓ | ! three hand-drawn full-bleed bands inside one card | ✓ |
| Settings (admin) | **51** ! | 2 / ~180 px ✓ | ✓ | ✓ | ? hand dividers between every row | ✓ |
| Connect wizard (admin) | 14 ! | 2 ✓ | ✓ | ✓ | ✓ | ✓ |
| Workspace set-up (admin) | 16 ! | 1 ✓ (outside the shell) | ✓ | ✓ | ✓ | ✓ |

## A — what is still drawn by hand

Six idioms account for almost all of it:

1. **`span.rounded-md` — 128 instances.** Our `Chip` is a hand-rolled span with an inline tint,
   sitting next to real `Badge`s on the same screens (Home paints four `badge` slots and twelve
   `span.rounded-md`). Two chip systems, side by side, same job.
2. **`label|section|li.border-t.first:border-t-0` — 56 instances.** A hand-rolled divider idiom
   where the library ships `Separator`.
3. **`div.bg-muted.border-y` and `.border-b` — 32 instances.** Full-bleed toolbar and filter strips
   inside cards, with their own border and their own spacing.
4. **`button.rounded-md.border` and `button.rounded-full.border` — 24 instances.** Buttons that are
   not `Button`.
5. **`p.rounded-md` tinted blocks** — our `StatusLine`, where the library ships `Alert`.
6. **`th.border-l` / `td.border-l` — 14 instances.** Vertical rules added to the library's `Table`,
   which is overriding a component's internals, the one thing §4 forbids by name.

## B — the chrome above the content

Eighteen of twenty-one pages are two bands or fewer: the 56 px header plus a 63 px `Alert`,
159–190 px in total. Three pages are worth naming. **Home has three bands, 200 px** — header, Alert,
and then a hand-drawn strip of pills ("An agent paused outreach in 6 places", "Credits on track",
"Sending healthy · bounce 1.9%", a workspace-change line with its own Open and ×). That strip is
both the extra row and a hand-drawn box. **Requests and Reports** stay at two bands but their Alert
grows to 90 px because two messages stack inside it, putting content 190–198 px down. At 400 Home
reaches **223 px**, a quarter of the viewport, before a word of the page.

## C — containment

Clean, and this is the strongest part of the pass. Every table on every page is inside a `Card`
(zero outside, at both widths, in both themes). **Zero nested `Card`s** anywhere in the product.
The only "sections outside a card" my probe found are the contents of column and filter popovers,
which are `PopoverContent`, not page sections. The card-per-thing case is used where §4 allows it —
deal cards on the board, agent cards on Agents — and nowhere else.

## D — dark

Hierarchy holds. The library's own card, border and muted tokens carry it, and our six family inks
and five statuses read at their contrast floors in both themes (round 10's `contrast.mjs` run still
stands). Companies in dark is the clearest example: card, toolbar, table head, mono domains,
"Current client" green, "Cold" neutral, "Active opportunity" blue — all separable.
Type is five sizes and no more, on every page: 12 / 13 / 14 / 18 / 24.

## E — overflow, context loss, disruption

**Agents is the page to fix.** Its top card is one `Card` containing three hand-drawn full-bleed
bands: a summary sentence, a grey meter row, and an amber two-message block carrying four controls
("Resume", "Keep paused", "Credit caps", "Open bounce guard"), then a footer line about agent
settings. The amber block runs edge to edge with square corners inside a rounded card — the invented
look the owner rejected, surviving inside a library container. 105 hand-drawn boxes on one page.

After that: **Home's third band**, which pushes "Good morning, Marcus" to 200 px and repeats
information the Alert above it already carries; and the **filter strips** on Companies and Lists,
which put a grey full-bleed bar with its own border between a card's header and its table.

## F — console

Nothing, anywhere.

## The chains, re-run

| Chain | Chain card | Disclosure card |
|---|---|---|
| 1 · Sequence › person | **18**/18 | **17**/18 |
| 3 · Company › person | **18**/18 | **17**/18 |
| 7 · Inbox, Tasks, Home | **18**/18 | **17**/18 |

Nothing regressed through the re-theme: walkers read 1 of 34 and 1 of 24 and 1 of 4, the pane action
still lands on the row ("moved from Q4 enterprise outbound to Warm inbound follow-up"), arrival
still focuses the lit `h1`, the crumb still returns to the lit row, and both consoles are silent.
The one A-failure from round 9 is unchanged: at 400 the contact record's header collapses and
"Move sequence" and "Add a note" become two filled controls on one surface.

## The worst five

1. **Agents' top card** — three hand-drawn full-bleed bands inside one `Card`, square amber block in
   a rounded container, 105 hand-drawn boxes on the page.
2. **`Chip` is not `Badge`** — 128 hand-rolled `span.rounded-md`, next to real `Badge`s doing the
   same job on the same screens.
3. **Home's third band**, 200 px of chrome at 1440 and 223 px at 400, the extra row being a
   hand-drawn pill strip.
4. **Hand-drawn dividers and toolbar strips** — 56 `border-t` dividers where `Separator` exists, and
   32 `bg-muted` full-bleed strips inside card bodies.
5. **`border-l` added to the library's `Table`** — the one override §4 names and forbids.

---

# Round 10 — the short visual confirmation (superseded)

Home, the Deals board, Inbox, Reports, the connect wizard and Settings, in both themes, against my
own `npx vite preview --port 4180`. Screenshots in `shots/chains/review10/light/` and `…/dark/`.

`node scripts/contrast.mjs` — **passes, exit 0**: *"all pairs clear their floor and no two meanings
collapse."* The line that matters for round 9's second finding is in its ink table: **paused is no
longer the neutral family's colour.** It was `#504635` light / `#c5b9a5` dark, identical to neutral;
it is now `#42576e` / `#a0bedd`, a cool neutral of its own. The swap test bites where it did not.

## The five

| # | Finding | Status | What I saw |
|---|---|---|---|
| 1 | The Deals board has no page title | **Fixed** | `H2 24px "Deals · Mine · closing this quarter"`, ink `family:deals-ink`, glyph `lucide-columns3`, in both themes. The page announces itself before you read it. |
| 2 | Non-states painted as states | **Partly** | Two of three parts done. Reply outcomes are now bordered neutral chips — Inbox's "Interested" paints `border:n:border`, not a status. And paused has its own cool tint, so it no longer collapses into the neutral family. **But the Deals board's forecast categories are still statuses**: "Pipeline", "Best case", "Commit" and "Omitted" all paint `status:paused-tint` with `status:paused-ink`. A forecast category is not a state, and paused now says something specific — stopped on purpose — which is wrong for all four. |
| 3 | The Reports chart is four grey dashes | **Partly** | The lead series is now the indigo accent with round markers and a heavier width, and it separates cleanly from the rest in both themes. The legend distinguishes all four. **In the plot, Calls, Meetings and Tasks still overlap into one band** — at 442, 458 and 485 against 1,328 they sit within a few pixels, and a lightness ramp cannot separate three neutral lines at that spacing. `dark/reports-1440.png`. |
| 4 | Light had two surface levels; shadow on controls | **Fixed** | `--surface-page 0.960`, `--surface-raised 0.982`, `--surface-overlay 1.0` — three measured steps, with dark unchanged at 0.165 / 0.215 / 0.265. And shadow has left the controls: the whole Deals board paints **one** shadowed element, a `div`, where Home alone used to paint 29 across buttons and divs. |
| 5 | The connect wizard wore Home's glyph; nine type sizes | **Fixed** | The wizard's shell icon is now `lucide-plug`. And exactly five sizes are painted, on every one of the six pages: Home 12/13/14/18/24, Deals 12/13/14/24, Inbox 12/13/14/18/24, Reports 12/14/24, connect 12/13/14/18, Settings 12/13/14/18. No 10 px, no 11, no 16, no 20 — the strays round 9 counted are gone. |

## The swap test, on every chip on these six pages

77 chips on Home, 31 on the board, 24 on Inbox, 12 on Reports, 13 in the wizard; **none wordless**
in either theme. Grouped by what paints them:

- `status:info-tint` — only the lit sidebar item and the wizard's "You are here". Swap it for
  warning and the product would be shouting about where you are.
- `status:warning-tint` — only the NEEDS YOU NOW band.
- `status:danger-tint` — only "overdue", "Overdue (5)", "Overdue · 6d".
- `status:success-tint` — only "Done" on a finished wizard step.
- `family:work-tint` — only the task kinds, "LinkedIn", "Email", "Call". Swap it for deals ochre and
  a task would claim to be a deal.
- `border:n:border` — counts, filters, keycaps, "Interested", "1.84M credits · 410k/wk". Swap any of
  these for a status tint and the product would be asserting a state it does not have.

Every group survives the test except one: **`status:paused-tint` on "Pipeline", "Best case",
"Commit" and "Omitted"**. Swap those for the bordered neutral the Inbox now uses for its outcomes
and nothing reads wrong — which is the definition of a colour that means nothing.

## New this round

Nothing new. One thing carried: **Reports still has no page title.** Round 9's first finding named
the board and Reports; the board was fixed, Reports was not. Its name appears only in the 14 px
shell strip, and the largest heading on the page is an H3 at 14 px — the four 24 px items are the
stat-tile numbers. Of the three ways to know where you are, Reports has the sidebar and the strip.

## The owner's complaint

**Answered.** The product is not monochrome and the pages do not look alike. Six families carry
fixed glyphs and inks that hold in both themes and survive a colour-vision simulation; five statuses
each carry a word; three surface steps now exist in light as well as dark; the type scale is five
sizes and is used; and every page I walked except Reports opens with a titled heading in its family
colour. Home, the board and Inbox are recognisable at a glance and by different means — a card
stack, a kanban, a list with a reading pane. Two things keep it from being finished: the forecast
chips still borrow a status, and Reports still opens without a name on it.

---

# Round 9 — the visual pass (superseded)

I read `DESIGN.md` §5 and `src/ollopa/identity.ts`, then walked every page of the map as a seat that
holds it, at 1440 and 400, in light and dark: 76 screenshots under `shots/chains/review9/light/`
and `…/dark/`, plus the observation log in `…/logs/visual.txt`. On each page I read back the title's
ink and icon, the lit sidebar item, every colour actually painted (resolved against the token sheet,
so a hand-set hue shows up), every status chip and whether it carries a word, the three surface
levels, and the type sizes in play. Then I looked at the pictures.

`node scripts/contrast.mjs` — **passes, exit 0**: *"all pairs clear their floor and no two meanings
collapse"*. Worst text 5.29:1 against a 4.5 floor; worst non-text 3.39:1 against 3; faintest tint
0.065 apart against 0.015. Under simulated colour vision the closest pairs are deals/work at 0.094
and companies/engagement at 0.091 (floor 0.06), in both themes.

## Is the flatness fixed?

**Largely, yes.** The owner's complaint was that every page looked alike and people navigated by
reading. Put Home and the Deals board side by side now and they are not the same object: Home is
two columns of raised cards with olive work chips and terracotta agent chips; the board is four
ochre-titled columns of deal cards with amber and red warning chips and one indigo "New deal".
Inbox announces itself with a 24 px olive title and an olive inbox glyph before you read a word.
The three cues §5 promises are real and I verified each: the lit sidebar item carries the accent
tint **and** a leading bar; the page title carries its family icon in its family ink; the pane
carries a 3 px top bar in the object's hue with the matching glyph; and the trail crumb does carry
the family icon of the page you left (`lucide-send` in engagement magenta, coming back from a
contact to a sequence).

What is not fixed is the **top of the type scale**. Five sizes are declared and nine are in use, and
the biggest of them is missing from most pages: the Deals board has no page title at all, and
Reports none either. On those two the only "where am I" is the 14 px strip in the shell and the
sidebar. That is where the old flatness survives.

## Page by page, checks A to F

✓ passes · ! fails · ? passes but see the note. A: known without reading. B: registry icon and hue,
never reused. C: state is a chip or line with a word, no colour that means nothing. D: three surface
levels, dark keeps the hierarchy. E: type scale gives visible hierarchy. F: nothing lost legibility.

| Page (seat) | A | B | C | D | E | F | Note |
|---|---|---|---|---|---|---|---|
| Home (sdr) | ✓ | ✓ | ? | ? | ? | ? | Neutral LayoutDashboard + neutral ink; sidebar lit. Largest text 20 px, no 24. 26 elements at 10 px in the approvals column. |
| People (sdr) | ✓ | ✓ | ✓ | ? | ? | ✓ | Users glyph, teal ink, title "People · 800" at **18 px**, not 24. |
| Companies (sdr) | ✓ | ✓ | ✓ | ? | ? | ✓ | Building2 violet. 27 chips, none wordless: "Current client" success, "Cold" paused. |
| Lists (sdr) | ✓ | ✓ | ✓ | ? | ? | ✓ | Correctly wears People's Users/teal — a list holds people. |
| Sequences (sdr) | ✓ | ✓ | ✓ | ? | ? | ✓ | Send glyph, magenta, 14 chips, "Active" in success green. |
| Templates (sdr) | ! | ✓ | ✓ | ? | ? | ✓ | **Nothing lit in the sidebar** — Templates is not in this seat's profile, so one of the three cues is simply absent. |
| Inbox (sdr) | ✓ | ✓ | ! | ? | ✓ | ? | The best page in the build: 24 px olive title with its glyph. But "Interested", "Question" are painted `paused`. |
| Tasks (sdr) | ✓ | ✓ | ! | ? | ? | ✓ | A whole sentence inside a status chip: `paused:"personalised for this send"`. |
| Deals board (ae) | ! | ✓ | ! | ? | ! | ! | **No page title.** Largest heading 16 px. Forecast categories drawn as status chips. The collapsed "Closed won · 6 · €346k" column is set in rotated vertical type. |
| Deal record (ae) | ✓ | ✓ | ✓ | ? | ✓ | ✓ | Reaches 24 px; ochre Columns3; "validated" success, "suggested" info. |
| Campaigns (marketer) | ✓ | ✓ | ✓ | ? | ? | ✓ | Magenta Send; "Running" info, "Draft" warning, "Paused" paused — the five used as meant. |
| Accounts (cs) | ✓ | ✓ | ? | ? | ? | ✓ | Correctly wears Companies' Building2/violet. "Watch" painted paused. |
| Workflows (marketer) | ✓ | ✓ | ✓ | ? | ? | ✓ | Magenta Send; "On" in success green. |
| Requests (admin) | ✓ | ✓ | ✓ | ? | ? | ✓ | Bot terracotta; "Shipped" success, overdue counts danger. |
| Reports (admin) | ! | ✓ | ✓ | ? | ? | ! | Own LineChart glyph, neutral. **No page title**; the tab row is the top. The activity chart is four white-grey dashed lines — see F below. |
| Agents (admin) | ✓ | ✓ | ✓ | ? | ? | ✓ | Bot terracotta. |
| Settings (admin) | ✓ | ✓ | ✓ | ? | ? | ✓ | Own gear glyph; title 18 px. |
| Connect wizard (admin) | ! | ! | ✓ | ? | ? | ? | **Wears Home's LayoutDashboard.** Its own top heading is a 12 px uppercase H2, "STEPS · 5 OF 6 DONE". |
| Workspace set-up (admin) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Outside the shell by design; gear glyph, 24 px title, clean hierarchy. |

The `?` in column D is the same note on every page and the `?` in E is the same on most; both are
below rather than repeated nineteen times.

## What each check found

**A — where am I, without reading.** Seventeen of nineteen pages answer with at least two of the
three cues and most with three. Three pages are short: **Templates** has nothing lit because the
seat's profile leaves it out of the sidebar; the **Deals board** and **Reports** carry no title on
the page itself, only the 14 px shell strip, so the family ink has almost nothing to colour.

**B — the registry, never reused.** Every page's title glyph and ink matched `identity.ts` exactly:
Users teal for People and Lists, Building2 violet for Companies and Accounts, Columns3 ochre for
Deals, Send magenta for Sequences, Templates, Campaigns and Workflows, Inbox olive for Inbox and
Tasks, Bot terracotta for Requests and Agents, own glyphs for Home, Reports and Settings. No family
hue appeared on a page of another family except where that family's objects appear, which is what
§5 asks for. **One reuse:** `FAMILIES.neutral.icon` is `LayoutDashboard`, which is also
`PAGE_ICON.home`, so the connect wizard and any other neutral page without its own entry wears
**Home's** glyph.

**C — a word on every state, and no colour that means nothing.** Every chip on every page carries a
word: **zero wordless chips** across all nineteen pages in both themes. The failure is the other
way round. `statusOf()` sends any unrecognised word to `paused`, so things that are not states are
painted as one: the board's forecast categories ("Pipeline", "Best case", "Commit", "Omitted"), the
Inbox's reply outcomes ("Interested", "Question"), Accounts' "Watch", and on Tasks an entire
sentence, *"personalised for this send"*, inside a status chip. Apply the swap test and it fails
quietly: swap `paused` for the neutral family tint and nothing reads wrong, because
`scripts/contrast.mjs` prints them as the **same ink** — `#504635` light, `#c5b9a5` dark. A paused
chip on a non-state is decoration.

**D — three levels, and dark keeps them.** Dark is right: page `oklch(0.165)`, raised `0.215`,
overlay `0.265` — three distinct levels, higher is lighter, exactly as the rule says. **Light has
two**: `--surface-raised` and `--surface-overlay` are both `oklch(1 0.002 80)`, so a dialog is
separated from a card only by its shadow. And shadow is not confined to the overlay level: Home
alone paints 29 shadowed elements, on `button[data-slot="button"]` and on plain `div`s, where §5
says "shadow only on the overlay level".

**E — five sizes, used.** Declared: 24 / 18 / 14 / 13 / 12. Measured on screen: **10, 11, 12, 13,
14, 16, 18, 20 and 24** — nine. 24 px appears on three pages only (Inbox, the deal record, the
Reports stat tiles); People and Settings top out at 18; the Deals board's largest heading is 16.
10 px text is not rare — 26 elements on Home, 38 in the connect wizard — and it is below the
declared floor of 12. Where a 24 px titled heading exists the hierarchy is immediate; where it does
not, the page opens flat, which is the owner's original complaint surviving in the two places the
retheme did not reach.

**F — what lost legibility.** The **Reports activity chart** is the worst: four series drawn as
white and grey lines distinguished only by dash pattern, and in dark the three lower series overlap
into a single grey band at the foot of the plot. Nothing in the five status colours or six family
hues is used, on the one screen built for comparison. `dark/reports-1440.png`. After that: the 10 px
text noted above, and the board's rotated vertical type on a collapsed column.

## The chain cards, re-run

Chains 1, 3 and 7, both widths, both consoles silent on all six runs.

| Chain | Chain card | Disclosure card |
|---|---|---|
| 1 · Sequence › person | **18**/18 | **17**/18 |
| 3 · Company › person | **18**/18 | **17**/18 |
| 7 · Inbox, Tasks, Home | **18**/18 | **17**/18 |

Nothing regressed: walkers read 1 of 34 and 1 of 24, the pane action still lands on the row with its
Undo, arrival still focuses the lit `h1`, the crumb still returns to the lit row, and the render
counters still show the page not re-rendering.

Two of round 8's open items fixed themselves in this pass: **"Research" now carries
*"12 credits · Charged once"***, and the **Home task chip now has its separator** —
*"Send a connection request 4 days overdue"*.

One A-failure remains, at 400 only: the contact record's header collapses at phone width and
"Move sequence" and "Add a note" end up as two filled controls on one surface.

## The five worst

1. **The Deals board has no page title** — no 24 px heading, no family ink at the top, largest text
   16 px. The one page an AE lives on opens flat.
2. **Non-states painted as states.** Forecast categories, reply outcomes and one whole sentence sit
   in `paused` chips, and `paused` is the same ink as the neutral family, so the swap test fails.
3. **The Reports chart is four grey dashes**, unreadable in dark where three of them overlap.
4. **Light has two surface levels, not three**, and shadow is used at the raised level on buttons
   and divs rather than reserved for overlay.
5. **The connect wizard wears Home's glyph**, and its own first heading is 12 px uppercase.

Then: 10 px text below the declared floor, and Templates with nothing lit in the sidebar.

---

# Round 8 — the last confirmation (superseded)

Chains 7 and 8 only, at 1440 and at 400, by keyboard, against my own `npx vite preview --port 4180`,
with the dev server on 4181 for the console. Both killed after. 72 screenshots in
`shots/chains/review8/`. Both consoles silent on all four runs.

## Scores

| Chain | Chain card | Δ vs r7 | Disclosure card | Δ |
|---|---|---|---|---|
| 7 · Inbox, Tasks, Home | **18**/18 | **+1** | **17**/18 | — |
| 8 · Index laps | **18**/18 | — | **17**/18 | — |

Chain 7 gets C8 back: the row now follows the send. D9 remains the one residue on both.

## The four, one by one

**1. Sequences, Lists and Templates names are real links — fixed.** At 1440 and at 400 the first
row's name is an `<a href>`: `#/ollopa/sequences/seq-6`, `#/ollopa/lists/list-13`,
`#/ollopa/templates/tpl-7`. Visible anchors per index: 12, 13 and 18 at each width — half the
24/26/36 reported, because the table and the phone card list each hold a copy and only one is on
screen at a time. Every index lap still opens from the name, pushes a crumb and returns to the lit
row.

**2. "N credits · Charged once" under the button — half fixed.** **Enrich** has it: the contact
record shows `Enrich` with *"2 credits · Charged once"* 4px beneath it, 12px, muted.
**Research does not.** On the company record, at two seats and two companies, the control is
`Research · 12 credits` sitting in a plain row of buttons —
`<div data-print-hide><button>Research · 12 credits</button><button>Add to list</button>…</div>` —
with no line beside it and no text sibling at all. `90-credit-line-1440.png`.

*On the layout question:* the gap does not need widening. 4px between a small button and its own
12px muted line is what makes the line read as belonging to **that** control; open it up and it
starts to look like a heading for whatever comes next. What matters is the asymmetry, and it is
right here — the space under the line to the next control is larger than the space above it. I
would write that ratio down rather than the pixel: a line sits closer to its own control than to
anything else. The only place two lined controls stack is a pane, and this seat's pane has no cost
acts, so I could not see the pair fail; the rule above is what would keep it from failing.

**3. The email task has one filled control — fixed.** The queue's first task shows `["Done"]`;
pressing it moves to *"Step 2 of 3 · Send the follow-up"*, which now shows `["Send and mark done"]`
alone, at 1440 and at 400. `92-queue-email-1440.png`.

**4. A sent reply is handled through the shared store — fixed, all four parts.**

- *During the ten seconds*: the thread reads **Sending** with **Undo** on screen, the counts do not
  move (Interested 4, Handled 3) and the row is untouched — correct, the send has not gone.
  `93-send-sending-1440.png`.
- *After*: **Interested (4) → (3)**, **Handled (3) → (4)**, and Cyrus Rossi leaves the Interested
  list. `94-send-sent-1440.png`.
- *Under Handled*: the row is there and reads **"… Happy to take a look. · Sent · Reply"** — the
  row and the thread now say the same thing, which is the line chain 7 lost in round 7.
  `98-handled-list-1440.png`.
- *Undo within the window*: counts back to Interested (4) / Handled (3), and the row restored to
  *"3 d · Sep 10 overdue · Cyrus Rossi · Interested"*. `95-send-undone-1440.png`.

(The counts I watched moved Interested 4→3 rather than Question 2→1: I replied to the reply the
Inbox opens on, which is an Interested one. Same store, same mechanism.)

## Checks A and B on these surfaces

**A — no failures.** No surface on either chain carries two filled controls; no destructive control
is filled or out of order; every disabled control is disabled by object state the person can change
with the reason beside it (*"Choose a sequence above"*; the walker's "Previous" at item 1 with its
count); no control stands in for a seat or a state that cannot act; and the index names that were
buttons are now links.

**B — no failures.** Every sentence next to a control on these surfaces carries one of the three
reasons: *"2 credits · Charged once"* and *"1 email · to Cyrus Rossi from marcus@meridian.io"*
(reason 1), the ownership sentences (reason 2), *"One at a time. 13 more behind this one"*
(reason 3), and *"Done · … · Undo"* in §2's own form.

## Still open

Two, both small and neither about money or irreversibility:

1. **Research carries no "Charged once".** Its price is in its label, so nobody is surprised by the
   charge; what is missing is the half of §2's own example that says it is charged once.
2. **The Home task chip still runs together**: *"Send a connection request4 days overdue"*.

Everything on round 4's "wrong for a real person" list that was never assigned is unchanged.

---

# Round 7 — the short walk after the design fixes (superseded)

Chains 2, 3 and 7 only, at 1440 and at 400, by keyboard, against my own `npx vite preview --port
4180`, with the dev server on 4181 for the console. Both killed after. 57 screenshots in
`shots/chains/review7/`. Both consoles silent on all six runs.

One harness correction, not a product change: my auditor's card selector did not include
`[role="row"]`, which made the Inbox's one-filled-per-reply read as a pile of filled controls in
round 6. Fixed; that finding was mine, not the product's. My chain-2 opener was also stale — the
audience control was renamed from "Read the audience beside this" to the audience's own name — so
the first pass showed a broken chain 2 that is not broken.

## Scores

| Chain | Chain card | Δ vs r6 | Disclosure card | Δ |
|---|---|---|---|---|
| 2 · Campaign › audience › person | **18**/18 | **+1** | **17**/18 | — |
| 3 · Company › person | **18**/18 | — | **17**/18 | — |
| 7 · Inbox, Tasks, Home | **17**/18 | **−1** | **17**/18 | — |

Chain 2 gets its C8 back: the inert control that cost it is gone. Chain 7 loses C8 for a new
reason, below.

## The nine, one by one

| # | Fix | Status | What I saw |
|---|---|---|---|
| 1 | Delete audience gone when in use, with a sentence | **Fixed** | No control on any of the five Ridgeline audiences, and each carries its own sentence: *"Used by Onboarding week 1; delete that campaign first"*, *"Used by Trial day 7 nudge; …"*, *"Used by Feature limit hit; …"*, *"Used by Renewal 60 days out; …"*, *"Used by Seat limit reached; …"*. Reason 2 under the widened §3, and it names a different thing from the one on screen. |
| 1b | …and confirms when not in use | **Untestable** | Every audience in the seed is used by a campaign, so I could not reach the unblocked case. Not a finding; a gap in what I can walk. |
| 2 | Pause filled once | **Fixed** | One filled control on the campaign record: `["Pause"]`. |
| 3 | Index names and empty-state returns are links | **Partly** | Campaigns is now `<a href="#/ollopa/campaigns/camp-7">`. **Sequences and Lists are still `<button>` with no href** ("Security buyers, DACH", "Unsubscribed"). |
| 4 | The ownership sentence names the admin seat, never the owner twice | **Fixed** | *"Owned by Hana Kobayashi; only the owner or Revenue operations can change or remove it"* — the seat, not a second copy of the name. Where the owner **is** the admin it collapses correctly: *"Owned by Daniel Okafor; only the owner can change or remove it"*. |
| 5 | Research and Enrich carry "12 credits · Charged once" | **Partly** | Enrich does: `"Enrich"` with the line *"2 credits · Charged once"*. **Research does not**: the company header still reads `"Research · 12 credits"` with no line. |
| 6 | The Tasks queue has one filled control | **Partly** | The queue's first task has one (`["Done"]`). Press it and the queue moves to *"Step 2 of 3 · Send the follow-up"*, which has **two**: `["Send and mark done", "Done"]`. At 1440 and at 400. `93-queue-email-task-1440.png`. |
| 7 | Send acts at once, "Sending · Undo" for ten seconds, then "Sent" | **Partly** | The send half is exactly right: no confirmation, the thread reads *"Sending"* with an **Undo** on screen immediately, and eleven seconds later it reads *"Sent"* with the Undo gone. `90-send-sending-1440.png`, `91-send-sent-1440.png`. **Row and thread do not agree**: below. |
| 8 | Task destinations are real links | **Fixed** | *"Open the LinkedIn step"* is `<a href="#/ollopa/tasks?task=t-11">`. "Open the task beside" stays a button, correctly — it opens a pane, so it is an act, not a destination. |
| 9 | Two filled controls in a page body | **Fixed by the rule** | The contact record still has "Move sequence" in the header and "Add a note" in the body — which is now one filled per surface, because §1 counts a page body as a surface. It passes as written. |

## Checks A and B, on these three chains' surfaces

**A — one failure.** The Tasks queue's email task carries two filled controls, "Send and mark done"
and "Done", on one surface (item 6 above). Everything else passes: no destructive control is
filled anywhere on these chains, no destructive control is out of order, every disabled control is
disabled by object state the person can change with the reason beside it ("Choose a sequence
above"; the walker's "Previous" at item 1 with its count), and no control stands in for a seat or a
state that cannot act — the audience record and the deal pane both now show a sentence and no
button.

**B — no failures.** Every sentence next to a control on these surfaces carries one of the three
reasons: *"Used by Onboarding week 1; delete that campaign first"* and the two ownership sentences
(reason 2), *"2 credits · Charged once"* and *"1 email · to Cyrus Rossi from marcus@meridian.io"*
(reason 1), *"Done · call task due today · owned by Elena Vasquez"* beside Undo (§2's own form),
and the queue's *"One at a time. 13 more behind this one"* (reason 3).

One text defect survives, not a B failure: on Home the task title and its chip still run together
with no separator — *"Send a connection request4 days overdue"* reads as
**"Send a connection request4 days overdue"**.

## The one line lost

**Chain 7, C8 → 1. The reply row does not follow the send.** I typed a reply, pressed Send, and
watched the thread go *Sending · Undo* → *Sent*. The reply row beside it was byte-identical before
the send, during it and eleven seconds after: *"3 d · Sep 10 overdue · Cyrus Rossi · Interested"*.
The filter counts did not move either — Interested (4), Handled (3) — so the list still presents a
reply I have just answered as overdue and waiting. The thread and the row disagree, which is the
half of item 7 the fix did not reach, and it is the "never misreports state" line.
`92-send-row-after-1440.png`.

## Still open

The row after a send (above), Sequences and Lists names still drawn as buttons, "Research" without
its "Charged once", the queue's email task with two filled controls, and the Home chip separator.
Everything from round 4's "wrong for a real person" list is unchanged.

---

# Round 6 — the design-system pass (superseded)

A different kind of round. I read `DESIGN.md` and memo 26, then walked all nine chain sets again at
1440 and at 400, by keyboard, against my own `npx vite preview --port 4180`, with the dev server on
4181 for the console. Both killed after. 168 screenshots in `shots/chains/review6/`.

Two new checks, applied to every surface the chains pass through, and recorded surface by surface:

- **A** — at most one filled control per surface; destructive drawn last, as text, confirmed with
  the verb in the affirmative; destinations rendered as links; no disabled control standing in for
  a seat that cannot act.
- **B** — every sentence next to a control carries one of the three reasons in §3 (spends or
  irreversible, seat cannot act, a count would mislead).

I added a DOM auditor to `scripts/review-chains.mjs` that reads the four surfaces `DESIGN.md` §1
names, classifies each control by its rendered variant rather than by what the source claims, and
collects every piece of text adjacent to a control so I can judge the sentences myself. It runs at
every step of every chain; the per-surface sweep below is a second pass over the same surfaces so
the table is readable.

## Scores

| Chain | Chain card | Δ vs r5/r4 | Disclosure card | Δ |
|---|---|---|---|---|
| 1 · Sequence › person | **18**/18 | — | **17**/18 | — |
| 2 · Campaign › audience › person | **17**/18 | **−1** | **17**/18 | — |
| 3 · Company › person | **18**/18 | — | **17**/18 | — |
| 4 · Sequence › setting | **18**/18 | — | **17**/18 | — |
| 5 · Settings › set-up | **18**/18 | — | **17**/18 | — |
| 6 · Deals | **18**/18 | — | **17**/18 | — |
| 7 · Inbox, Tasks, Home | **18**/18 | — | **17**/18 | — |
| 8 · Index laps | **18**/18 | — | **17**/18 | — |
| 9 · Cross-cutting | **18**/18 | — | **17**/18 | — |

Nothing regressed on the chain mechanics: every trail, return cue, walker, pane focus, render
counter and console check from rounds 4 and 5 still passes, at both widths, and both consoles are
silent on all eighteen runs. The one line lost is chain 2's C8, for a control that does nothing and
says nothing — below.

## Surfaces against checks A and B

Read at 1440; the 400 pass found the same set, plus the page-body doublings that phone width makes
obvious. ✓ = passes, ! = fails, ? = passes as written but see the note.

| Surface | A | B | What I saw |
|---|---|---|---|
| Sequence record, page header | ✓ | ✓ | One filled ("Add people"), "Pause" outline, three links. One sentence: *"· RevOps admins change them"* — reason 2. |
| Sequence record, enrolled card | ✓ | ✓ | No filled control; the name is a button, the row menu is a menu. |
| Person pane (from a sequence, a company, an audience, a task, a reply) | ✓ | ✓ | No filled control at all; acts are outline; "Open the page" is a link. Two disabled: "Move to a sequence" with *"Choose a sequence above"* and "Previous" at item 1 with its count — both object state the person can change, which §1 allows, with the reason beside. |
| Contact record, page header | ✓ | ? | One filled ("Move sequence"), one destructive last. The body carries a second filled ("Add a note"), which §1 does not reach. |
| Campaign record, page header | ✓ | ✓ | One filled ("Pause"). |
| Campaign record, body | ! | ✓ | A second filled **"Pause"** in the Trigger section — the same act, drawn as a primary twice on one page. |
| Audience record, page header | ! | ! | One filled ("Rebuild now") and one destructive ("Delete audience") — but the destructive is **inert** and carries a fourth-reason sentence. Both below. |
| Company record, page header | ✓ | ✓ | One filled ("Research · 12 credits"). Sentence: *"Marcus Adeyemi owns this company — you can read it"* — reason 2. |
| Settings, email sending | ✓ | ✓ | No filled control on the header; the bounce-guard row is fields. |
| Workspace set-up | ✓ | ✓ | One filled ("Start"). |
| Deals board, page header / card | ✓ | ✓ | No filled control in the header; no filled control on a card; "New deal" is the body's one. Card sentences are values ("Security review call · 25 Sep"), not prose. |
| Deal record, page header | ✓ | ? | One filled ("Log activity"), one destructive last. "Log call" is a second filled in the body. |
| Deal quick look (dialog) | ✓ | ✓ | One filled ("Open"); Stage is the one editable field; walker below. |
| Delete-deal confirmation (dialog) | ✓ | ✓ | **The model answer.** Title *"Delete Gatehouse Systems · Platform?"*, consequence above — *"Removes this deal and its 4 activities. Contacts, the company and files stay on Gatehouse Systems."* — affirmative **"Delete the deal"** in the destructive variant, Cancel ghost. |
| Inbox, reply card | ✓ | ✓ | One filled per card ("Reply"); the row menu is a labelled menu, destructive last. |
| Inbox, composer | ✓ | ✓ | One filled ("Send") with its line *"1 email · to Cyrus Rossi from marcus@meridian.io"* — reason 1, correct. See §2 below for what it is missing. |
| Deal pane (from a reply) | ✓ | ✓ | No control at all for a seat that may not act, one sentence instead: *"Owned by Dev Dubois; only the owner or an admin can close or archive it."* Reason 2, exactly as §1 asks. |
| Tasks, queue | ! | ✓ | **Three filled on one surface**: "New task", "Mark complete", "Done". Sentence *"One at a time. 13 more behind this one · next: Kai Kowalski"* — reason 3. |
| Tasks, list card | ✓ | ? | One filled per card ("Done"); "Open the LinkedIn step" is a **button where a destination belongs**. |
| Home, task and reply cards | ✓ | ✓ | No filled control on a card. |
| Index laps (six) | ✓ | ✓ | No filled control on any row; one filled in each page body ("New sequence", "Add people", "Find companies", …). |
| Add-people dialog | ✓ | ✓ | Consequence above the affirmative — *"Sends 153 emails to People and Lists from marcus@meridian.io"* — affirmative **"Add 153 people"**, the verb and the count in the label. |

## Check A — seven findings, three against the rule as written

1. **Tasks, queue mode: three filled controls on one surface** — "New task", "Mark complete",
   "Done". In queue mode there is no card element: the whole page is the one task, so all three sit
   on the same surface. Against §1 whichever way you cut it.
2. **Campaign record: the same act filled twice** — "Pause" in the page header and "Pause" again in
   the Trigger section. `shots/chains/review6/91-campaign-two-pause-1440.png`.
3. **Audience record: "Delete audience" is inert.** It is drawn as a destructive control, it is
   **not disabled**, and clicking it does nothing at all: same route, same heading, no dialog, no
   live region, silence. §1 says a control that does not apply is removed, not disabled — this one
   is neither. It is also the one thing this round that costs a score: chain 2 **C8** drops to 1,
   because a live-looking control that does nothing and says nothing misreports what it will do.
   `shots/chains/review6/90-audience-delete-1440.png`.
4. **"Open the LinkedIn step"** on a Tasks card is a button where §1 requires a link.
5. **"Back to the list"** is a button where §1 requires a link.
6. **Contact record: two filled** — "Move sequence" in the header, "Add a note" in the body.
7. **Deal record: two filled** — "Log activity" in the header, "Log call" in the body.

Findings 1, 2, 6 and 7 all live in a **page body**, and §1 names four surfaces — page header, pane,
dialog, card — so the rule as written does not reach them. That is the gap this pass found in the
rule rather than in the product: the body of a record page is where most of its acts live, and
nothing governs it. At 400 it is worse, because the body *is* the page. I would add "a page
section" to §1's list of surfaces rather than leave four filled controls legal on one screen.

**Everything else A asks for passes**: no destructive control was filled anywhere; every
destructive control I found sat last; every disabled control I found was disabled by object state
the person can change, with the reason beside it; and no disabled control stood in for a seat that
cannot act — the deal pane proves the opposite, replacing both buttons with one sentence.

## Check B — two failures

Every other sentence I found next to a control carried one of the three reasons: costs and sends
(reason 1), ownership (reason 2), the queue count (reason 3). The two that do not:

1. **Audience record, beside "Delete audience":** *"Onboarding week 1 uses this audience, so it
   cannot be deleted while that campaign exists."* This is a fourth reason — object state that
   blocks the act, which §3 does not list and which the person cannot change from here. The
   sentence exists because the control does; remove the control and the sentence goes with it.
2. **Contact record, Rosa Okonkwo:** *"Daniel Okafor owns this contact; only they or Daniel Okafor
   can change or remove it."* Reason 2 in intent, broken in execution: it names the same person as
   the owner and as the escalation, so it tells the reader nothing about who to ask.

Two smaller text problems, not B failures: on Home the task title and its chip run together with no
separator — *"Send a connection request4 days overdue"* — and the bounce-guard sentence begins with
a stray separator, *"· RevOps admins change them"*.

## The opposite failure — what the cut took

I looked for an irreversible or costly act that lost its line or its confirmation.

- **The Inbox composer's "Send" has its line but no confirmation.** The line is right —
  *"1 email · to Cyrus Rossi from marcus@meridian.io"* — and after the send a live region says
  *"Reply sent to Cyrus Rossi from marcus@meridian.io."* with no Undo, correctly, because a send
  cannot be undone. But §2 names a send as its first example of an act that gets a confirmation,
  and this one commits on one click. `shots/chains/review6/93-inbox-send-1440.png`. It costs no
  card line — the result *is* visible before the commitment, so C7 and D1 hold — but it is a §2
  failure and the highest-consequence one in the product.
- **"Research · 12 credits" on the company page header lost its "Charged once".** The cost is in
  the label, which §2's own example endorses, but the clarifying half of that example is gone from
  the page. The pane still carries it. Minor.
- **Nothing else was lost.** "Delete deal", "Add people" and the quick look all still confirm with
  the consequence above and the verb in the affirmative, and every credit act still names its price
  in its label.

I also noticed the set-up page no longer invites anyone: there is no invite section and no mention
of one, so "Start" sends nothing and correctly carries no line. Chain 5 still runs end to end. I
record it because it is a change, not because it is a defect.

## Still wrong for a real person

Unchanged from round 4, minus nothing: the bounce-guard threshold still saves in silence, "Done" on
a task still offers no Undo, "People (34)" still does not move when someone leaves the sequence,
`]` still walks the pane away from the open thread, the sequence picker is still eleven options with
no search, and the toast still overlaps the table and the pane.

## Verdict

Seven A findings and two B failures, and the design pass has plainly done most of its work: no
destructive control is filled anywhere, panes carry no filled control at all, the seat that cannot
act gets a sentence instead of a dead button, and the delete confirmation is a model of §2. The
three things I would fix are the inert "Delete audience", the missing confirmation on Send, and the
duplicated name in the ownership sentence — and then I would widen §1, because four of my seven A
findings are legal under a rule that does not name the surface they live on.

---

# Round 5 — the short walk, chains 6 and 7 (superseded)

Chains 6 and 7 only, at 1440 and at 400, by keyboard, against my own `npx vite preview --port 4180`
(killed after). 46 screenshots in `shots/chains/review5/`, logs beside them. Both consoles silent
on both chains at both widths.

## Scores

| Chain | Chain card | Δ vs r4 | Disclosure card | Δ |
|---|---|---|---|---|
| 6 · Deals | **18**/18 | — | **17**/18 | — |
| 7 · Inbox, Tasks, Home | **18**/18 | **+1** | **17**/18 | — |

D9 (no analytics) is still the one residue, so 17 is a full disclosure card. **Both chains are now
full.**

## The two round-4 items

**D-R4-1, the Tasks row is not marked — fixed.** The list rows now carry the task
(`data-item="t-11"` on a `role="listitem"`) with the contact moved onto its own control
(`data-item="c-752"` on a `<button>`). Opening the **task** pane marks exactly one row; opening the
**person** pane from the contact control on the same row marks the same one row. True at 1440 and
at 400: `document.querySelectorAll(".ollopa-beside-open").length === 1` in all four cases, and the
marked element is the task row itself ("Overdue 4 d · LinkedIn · Ben Novak · SDR Manager · Nettle
Labs…"). The queue-mode Tasks page marks its row too. `07-work/90-tasks-row-marked-1440.png`.
Chain 7 C1 returns to 2.

**D-R4-2, two disabled buttons in the deal pane — fixed.** The Meridian SDR's deal pane, opened
from a reply, now carries its six fields and then one sentence: *"Owned by Dev Dubois; only the
owner or an admin can close or archive it."* No action buttons at all. The only `disabled` control
left in the pane is the walker's "Previous" at item 1 of 2, which is correct and is the same on
every pane in the product. Same on the Ridgeline SDR. And it is genuinely conditional, not blanket:
walking the AE's deal pane with `]` to **Pebble Group · Pilot**, a deal that seat owns, brings back
live "Close won" and "Mark lost and archive". Removed, not disabled — rule 4 as written.
`07-work/91-deal-pane-sdr-1440.png`.

## Everything else on these two chains still holds

Chain 6: Enter on a focused card opens the quick look without changing the hash, the drawer walks
its column ("Previous [ · 1 of 2 · Next ]"), the crumb returns with the card lit and focused,
arrival on the deal record lands on the lit `H1 "Gatehouse Systems"`, Esc returns focus to the
opener, the company pane keeps the board in place.

Chain 7: the contact pane walks "1 of 4" from the Inbox row menu; the task pane walks its list and
"Done" takes it 14 → 13 with the pane and the page moving together; Home › a reply arrives lit and
the crumb comes back to the lit item.

## Nothing new

No new defect on either chain. The list from round 4 of things that are not defects but are still
wrong for a real person is unchanged, and still led by the silent save on the bounce-guard
threshold and the missing Undo on a completed task.

---


# Round 4 — the walk after the third fixes

I built none of this. I re-walked every chain in `BUILD-CHAINS.md` at 1440 and at 400, by keyboard
wherever the brief asks for the keyboard, with my own driver (`scripts/review-chains.mjs`) against
my own `npx vite preview --port 4180`, then ran every chain again against `npx vite --port 4181`
with a console listener attached. Both servers were killed afterwards.

170 screenshots are in `shots/chains/review4/`, logs in `shots/chains/review4/logs/`. Earlier
rounds keep their folders (`review3/`, `review2/`, `review/`).

One harness change: the favicon filter is **gone**. Rounds 1–3 filtered `/favicon.ico` out of the
console because neither server had one; a favicon now ships as an inline SVG data URI in
`index.html`, so the browser never asks for the file and a 404 would once again be a real finding.
None appeared.

---

## Scores at a glance

| Chain | Chain card | Δ vs r3 | Disclosure card | Δ vs r3 |
|---|---|---|---|---|
| 1 · Sequence › person | **18**/18 | — | **17**/18 | — |
| 2 · Campaign › audience › person | **18**/18 | — | **17**/18 | — |
| 3 · Company › person | **18**/18 | — | **17**/18 | — |
| 4 · Sequence › setting | **18**/18 | — | **17**/18 | — |
| 5 · Settings › set-up | **18**/18 | — | **17**/18 | — |
| 6 · Deals | **18**/18 | — | **17**/18 | — |
| 7 · Inbox, Tasks, Home | **17**/18 | +1 | **17**/18 | +1 |
| 8 · Index laps | **18**/18 | — | **17**/18 | — |
| 9 · Cross-cutting | **18**/18 | — | **17**/18 | — |

D9 — instrumented door usage and a scheduled promote/keep/delete review — is 1 on every chain and
is the residue `BUILD-CHAINS.md` allows: there is no analytics behind this product and no demo can
make one. **17 is a full disclosure card here.** Eight chains are at 18 and 17. Chain 7 is one line
short, on something introduced by this round's own fix.

---

## The three things this round asked me to confirm

### 1. The SDR's deal pane, opened from a reply — **confirmed**

Meridian SDR, Inbox row menu › "Open Zephyr Holdings · Platform beside the thread". The pane body
now reads **Stage · Proposal, Amount · €12,000, Close date · 24 Sep, Next step · Intro to the CFO ·
22 Sep, Owner · Dev Dubois, Last activity · 13 Sep · today** — six fields where round 3 found zero.
Confirmed on the second deal in the walker and on a second workspace (Ridgeline SDR, "Thistle
Group · Expansion": the same six). The AE, on the same pane, gets Forecast category where the SDR
gets Owner, so the level one is still seat-shaped rather than flattened to one list.
`07-work/90-deal-pane-sdr-1440.png`.

The other half of that round-3 entry is **not** fixed: the pane's two actions, "Close won" and
"Mark lost and archive", are still rendered for a seat that owns neither, each explained ("Owned by
Dev Dubois; only the owner or an admin can close it") and each with `disabled === true`. RULES
rule 4 says a control that does not apply is *removed, not disabled*, and the gated-features
pattern says "a real control, not a disabled one". It costs no line on either scorecard — the
constraint is visible, so D1 holds, and the chain does not need an action here — but it is against
the rules' own text and it should go.

### 2. The task pane, both routes, two seats — **confirmed, with one gap**

| Route | Meridian SDR | Meridian AE |
|---|---|---|
| **Home**, the task name | "Send a connection request" / "LinkedIn · Ben Novak · Nettle Labs", 8 fields, actions Done · Snooze to tomorrow · "Ben Novak ›", walker **1 of 6** | "Call after two opened emails" / "Call · Gael Fischer · Northwind Analytics", same 8 fields, walker **1 of 2** |
| **Tasks list**, "Open the task beside" on every row | 14 rows carry the control; the pane opens with focus inside it, walker **1 of 14** | 5 rows; walker **1 of 5** |
| **Tasks list**, `o` on a focused row | opens the same pane | opens the same pane |

The one in-pane step works and comes back: "Ben Novak ›" swaps the pane to the contact with
"‹ Send a connection request" in the header, offers nothing deeper, and `‹ back` returns to the
task. The action lands: "Done" took the list 14 rows → 13, advanced the pane to "Step 2 of 3 ·
Send the follow-up", moved the walker to 1 of 13, and kept focus in the pane.
`07-work/94-task-pane-tasks-1440.png`, `95-task-done-1440.png`.

`o` is correctly suppressed while typing: with focus in "Search contact, company, title or
sequence" I typed `o` and got the letter in the field and no pane.

**The gap:** on the Tasks list the pane does not mark the row it is reading.
`document.querySelectorAll(".ollopa-beside-open").length` is **0** there and **1** on the company
page doing the same thing. The rows carry `data-item="c-752"` (the contact) while the pane's target
is the task, so the frame finds nothing to mark. On a fourteen-row list with a pane open, nothing
on the page says which row you are in. This is the one line chain 7 loses.

### 3. A silent console — **confirmed, both builds**

Every chain, both widths, production build: *nothing — no warning, no error, no failed request*.
Every chain, once at 1440, dev build on 4181: the same. All four round-3 classes are gone —

- the nested `<button>` (`document.querySelectorAll("button button").length` is now **0** on the
  sequence record, Lists and Templates, at 400 and at 1440; the row's checkbox is a sibling of the
  name, not its parent);
- the duplicate `ae` key on the set-up page, where Meridian's Account executive and Sales manager
  seats used to collide;
- `DealsBoard`'s missing keys;
- Home's `key`-in-a-spread on Today, Replies, Approvals and Week.

And no 404: the favicon ships inline, so the request is never made.

---

## D2 — two seats per pane

Same object, two seats, field list read off the screen.

| Pane | Seat A | Seat B | Differ where the model says? |
|---|---|---|---|
| **person** (Petra Okonkwo, `/ollopa/companies/co-1`) | meridian sdr: Title, Company, Email, Stage, Sequence, Last contacted, **Score**, Do not contact | meridian ae: Title, Company, **Owner**, Email, **Phone**, Stage, Last contacted, **Last activity**, Do not contact | Yes |
| **company** (Gatehouse Systems, from `/ollopa/deals/d-118`) | meridian ae: Company, Stage, Owner, **Contacts held**, Last activity, **Open deals** | meridian admin: Company, Stage, Owner, Last activity | Yes |
| **audience** (Enterprise prospects EMEA) | ridgeline marketer: Type, Total size, After suppressions, Last rebuilt | ridgeline admin: After suppressions | Yes |
| **deal** (from a reply) | meridian sdr: Stage, Amount, Close date, Next step, **Owner**, Last activity | meridian ae: Stage, **Forecast category**, Amount, Close date, Next step, Last activity | Yes |
| **quick look** (deal card) | meridian ae: Forecast category, Amount, Close date, Next step, Last activity (Stage is the editable control) | meridian admin: Stage, Forecast category, Amount, Close date, Next step, **Owner**, Last activity | Yes |
| **task** (new this round) | meridian sdr: Due, Type, Contact, Phone, Company, Step, From, Last activity | meridian ae: **identical** | **Yes — correctly identical.** `usage/tasks.ts` splits these two seats only on items that are below level one for both (`tasks.local-time` 15/8, `tasks.owner-column` admin-only, `tasks.row-score` Ridgeline-only). So I checked the seats the model *does* split: the **Ridgeline SDR** gets **Fit** in the list, and the **Meridian admin** gets **Owner** in place of Last activity. Both appeared. |

Six of six panes read the model, and the one that looks flat is flat because the model says so —
which I only believed after finding the two seats where it is not. No "pane does not declare its
level one" warning fired on any chain.

---

## Chain 1 — Sequence › enrolled person beside › next › previous › act › open the page › back

Meridian SDR. `shots/chains/review4/01-sequence/`. **Chain: 18/18. Disclosure: 17/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | The table stayed on screen, 34 rows, Mateo Okonkwo's row carrying `.ollopa-beside-open`. |
| C2 | 2 | The crumb landed back at scroll 855 with the row lit and focused, still showing the move. |
| C3 | 2 | Trail empty until "Open the page", then `Q4 enterprise outbound ›`, then empty. |
| C4 | 2 | "People (34)", a search box, six status filters, rows open beside. |
| C5 | 2 | Picker, three actions, "Previous [ · 1 of 34 · Next ]"; `]` to Orla Ivanova, `[` back. Zero `data-door`. |
| C6 | 2 | Undo on the row and in the pane, and pressing it restores both. |
| C7 | 2 | A consequence under every action; the picker restates the state. |
| C8 | 2 | The row went to "moved from Q4 enterprise outbound to Warm inbound follow-up · step 1 · Undo" with Status "Moved to Warm inbound follow-up"; the pane agreed. |
| C9 | 2 | 8 tabs to the row, Enter, `]`, `[`, the picker, "Open the page" 1 Shift+Tab away, arrival on the lit `H1 "Mateo Okonkwo"`, crumb 1 Shift+Tab from there. `page renders: 2` throughout; only `rows renders` moved. |

Disclosure D1–D8 all 2 (D2 on the two-seat evidence above), D9 1.

---

## Chain 2 — Campaign › audience beside › the page › a person beside › back › back

Ridgeline marketer. **Chain: 18/18. Disclosure: 17/18.**

Campaign held at scroll 136 with the audience link marked (C1); both returns lit and focused —
Amara Okonkwo then the audience link (C2); trail `Onboarding week 1 › Enterprise prospects, EMEA ›`
with three mounted pages and none `display:none` (C3); 40 recipients inside the audience (C4);
"1 of 40" and no walker on the single-link audience pane, correctly (C5); scrolls survived both
ways (C6); "Runs the rules again now; the total and the 5,759 after suppressions may both change"
(C7); the action writes to the recipients row — "added to Trial day 14, no invite sent · Undo" —
(C8); arrival on the lit `H1` both times, crumb 1 Shift+Tab away at both widths (C9).

---

## Chain 3 — Company › search a person inside it › beside › act › next › back

Meridian AE, Northwind Analytics, 24 contacts. **Chain: 18/18. Disclosure: 17/18.**

Still the strongest chain. "Contacts at this company 24" with a search box, three filters and
"Open in People to act on all 24 at once; it carries Northwind Analytics as the filter" (C4); the
walker reads "1 of 24" and `]` walks the whole set with the table paging under it (C5); the row
went from "in Churned re-engagement" to "in Q4 enterprise outbound … Undo" (C8); 4 tabs from the
search box to the row and arrival on the lit `H1 "Rosa Okonkwo"` (C9). C1, C2, C3, C6, C7 as
before.

---

## Chain 4 — Sequence › sending-rules link › Settings with the row lit › back to the row

Meridian admin. **Chain: 18/18. Disclosure: 17/18.**

The sequence stays mounted and inert and comes back untouched (C1); the crumb returns with
"Bounce guard thresholds (Settings)" lit and focused (C2); `?row=mail.bounce-guard` lands with the
row lit and focus **in** the "% warns" field (C9); "warns at 4% · pauses at 6% · 1.9% of 14,200 in
7 days · Nothing paused · Auto-pause stops every mailbox on the domain until you resume it" is all
on the face of the page before any edit (C7); pressing Up takes the threshold 4 → 5 in place with
the observed-rate line correctly unchanged (C8).

---

## Chain 5 — Settings › Change the answers › finish › back to the row with the notice

Meridian admin. **Chain: 18/18. Disclosure: 17/18.**

The set-up runs inside the shell with focus on the lit `H1 "Workspace set-up"` (C1, C9);
"Save the answers" returns to Settings with the Workspace profile row lit and "Change the answers"
focused (C2); the notice reads **"Saved. Product-led growth: Lists and Sequences left your
sidebar."** with the sidebar redrawn to match (C8); "Starter includes 3 seats at $147 a month. 150
seats need Growth: $11850 a month for 150" and "Sent when you press Start" are on the face of the
questions before the commit (C7). The duplicate-key error that used to fire here is gone.

---

## Chain 6 — Deals board › quick look › open › back; deal › contact; deal › company

Meridian AE. **Chain: 18/18. Disclosure: 17/18.**

Enter on a focused card opens the quick look without changing the hash, and the drawer walks its
column — "Previous [ · 1 of 2 · Next ]" — with no door inside it (C5, C9); the card's accessible
name teaches the keys ("Enter for the quick look, O for the record, M for the menu"); the crumb
returns with the card lit and focused (C2); changing Stage moves the card into the Discovery column
and its header to "4 · €245k" (C8); Esc returns focus to the opener; the company and contact panes
both keep the origin in place (C1, C4).

---

## Chain 7 — Inbox, Tasks, Home

Meridian SDR. **Chain: 17/18. Disclosure: 17/18.**

| # | Score | What I saw |
|---|---|---|
| **C1** | **1** | The Inbox and Home keep their origin marked. **The Tasks list does not**: with the pane open on "Send a connection request" and fourteen rows on screen, `.ollopa-beside-open` matched nothing, where the same test on the company page matches one. The origin is visible but silent about which row you are in. |
| C2 | 2 | Home › a reply › the crumb: out to `/ollopa/inbox/r-6` with `lit: Sami Novak`, back to Home with the item lit and focused. |
| C3 | 2 | `Home ›` out, empty back. |
| C4 | 2 | The row menu is labelled by its contents and opens with "The people and deals behind this reply"; the task is now reachable from the Home task name, from every Tasks row and from `o`. |
| **C5** | **2** *(was 1)* | The deal pane carries its six fields; the contact pane walks "1 of 4"; the task pane walks its whole list and takes one step in to the contact with a `‹ back` and nothing deeper. |
| C6 | 2 | "Mark complete" and the task pane's "Done" both keep the pane with the page. |
| **C7** | **2** *(was 1)* | The deal's stage, amount and close date are on the pane before the SDR answers the reply. |
| C8 | 2 | "Done" took the list 14 → 13, the pane to the next task, the walker to 1 of 13. |
| C9 | 2 | The pane takes focus from the row menu, from the Tasks row control and from `o`; `o` does not fire while typing; Esc returns to the row. |

Disclosure **D1 back to 2** — the deal's amount and stage are visible without leaving the pane.

---

## Chain 8 — Index laps: Sequences, People, Companies, Lists, Templates, Campaigns

**Chain: 18/18. Disclosure: 17/18.**

Six for six at 1440 from the row's own name control, and five walked by hand at 400 (my automated
row-finder still does not match the phone card layout — my instrument, not the product). Every lap
pushed a crumb, every crumb came back with the row lit and focused, every arrival landed on the lit
`h1`, and the card lists no longer nest a button inside a button.

---

## Chain 9 — Cross-cutting

**Chain: 18/18. Disclosure: 17/18.** Everything held at both widths:

- Trail empty after a sidebar click, a ⌘K palette jump, a deep link and a sign-out;
  `ollopa.chain.meridian.Marcus Adeyemi` present before and gone after; nothing in `localStorage`.
- "Closing the loop HALF-TYPED" survived a follow and a return, **and the step door was still
  open**.
- `page renders: 2` before the pane, with it open, and after the return; only `rows renders` moves,
  and only on an action.
- `prefers-reduced-motion`: the pane's computed `transition-property` is `none`.
- Esc closes and focus returns to the opener.
- Zero `data-door` in any pane, on any chain, at either width.
- Nothing past two levels; from a nested pane the only ways on are `‹ back` and "Open the page".
- One highlight at a time.

The pane still holds one `role="combobox"` that opens a listbox in a portal. Not a `Door`; RULES
rule 2 counts a menu as its own channel.

---

# The round-3 items, one by one

| # | Item | Status | What I saw |
|---|---|---|---|
| 1 | The deal pane is empty for the SDR seat | **Partly fixed** | Six fields now, on two workspaces and every deal in the walker, still seat-shaped. The two disabled actions the entry also named are still there. |
| 2 | The `task` pane is registered and unreachable | **Fixed** | Reachable from the Home task name and from every row of the Tasks list, by click and by `o`, on both seats, with the contact as its one in-pane step. |
| 3 | A `<button>` inside a `<button>` on four routes | **Fixed** | `button button` matches **0** elements on the sequence record, Lists and Templates, at 400 and 1440; the checkbox is a sibling of the name. No hydration error in the dev console. |
| 4 | Duplicate `ae` key on the set-up page | **Fixed** | Silent. |
| 5 | Missing keys in `DealsBoard` | **Fixed** | Silent. |
| 6 | `key` spread into JSX on Home | **Fixed** | Silent. |
| 7 | The `favicon.ico` 404 | **Fixed** | An inline SVG data URI in `index.html`; the request is never made. |

---

# New this round

**D-R4-1. The Tasks list does not mark the row the pane is reading.** Chain 7, the Tasks list route.
`.ollopa-beside-open` matches zero elements there and one on every other surface I tested. The rows
carry `data-item` of the *contact* (`c-752`) while the pane's target is the *task*, so the frame has
nothing to find. With fourteen rows and a pane open, the page does not say which row you are in —
which is the whole job of that mark, and the thing `src/ollopa/ui/README.md` promises ("The row the
pane is reading is marked on the page itself with `.ollopa-beside-open`"). Costs chain 7 C1.
Owner: `src/ollopa/pages/work/Tasks.tsx` — tag the row with the task id as well.

**D-R4-2. Disabled actions in the deal pane** (carried from round 3, half-fixed, restated because
it was assigned and not done). Costs no score line; against rule 4's text.

Nothing else regressed: all nine cross-cutting checks, all six index laps and every earlier fix
still pass.

---

# Still wrong for a real person

1. **Nothing confirms a setting was saved.** Pressing Up on "Warn at" takes 4 to 5 and the page is
   silent — no live region, no "saved", no note to the sequence that linked here. The one control
   that can pause every mailbox on a domain changes without a word.
2. **"Done" on a task offers no Undo**, where moving a person between sequences offers one on the
   row and in the pane. The task leaves the list and there is no way back from the screen.
3. **The sequence's "People (34)" does not move** when someone is moved out of it.
4. **`]` walks the pane away from the thread** the Inbox is showing, leaving two unrelated replies
   side by side.
5. **The sequence picker is an 11-item list with no search.** Fine at eleven, not at sixty.
6. **The toast overlaps the table and the pane** on a 900-high window.
7. **On a phone the pane covers the page.** It names its origin ("From Q4 enterprise outbound · row
   Mateo Okonkwo"), which the brief licenses, but the origin is named rather than seen.

---

# What I would tell the coordinator

Every round-3 item is fixed except half of one: the SDR's deal pane has its fields back, and the
two actions that seat cannot use are still sitting in it, disabled, which is the thing rule 4
names in so many words.

Eight chains are at 18 and a full 17. Chain 7 lost a line to this round's own new pane: the Tasks
list is the one surface where the pane does not mark the row it is reading. That is one `data-item`.

Nothing else is outstanding on either card. Both consoles are silent, on both builds, on all nine
chains — the first round that has been true.

---

---

# Round 3 — the walk after the second fixes (superseded by round 4 above)

I built none of this. I re-walked every chain in `BUILD-CHAINS.md` at 1440 and at 400, by keyboard
wherever the brief asks for the keyboard, with my own driver (`scripts/review-chains.mjs`) against
my own `npx vite preview --port 4180`. I then ran every chain a second time against
`npx vite --port 4181` with a console listener attached, because this round asked for it. Both
servers were killed afterwards.

172 screenshots are in `shots/chains/review3/`, with the observation logs in
`shots/chains/review3/logs/`. Rounds 2 and 1 keep their own folders (`review2/`, `review/`).

Three changes to the harness, all because my round-2 numbers would have been wrong against this
build: every browser now records console warnings, page errors and 4xx responses (the missing
`favicon.ico` is filtered — neither server has one and it says nothing about the product); the
index row-finder now looks for the name cell by cell from the left instead of assuming the second
column, which is what made me wrongly report Templates and Campaigns as unfixed on my first pass
this round; and the `actInPane` helper copes with panes whose action needs no picker.

---

## Scores at a glance

| Chain | Chain card | Δ vs r2 | Disclosure card | Δ vs r2 |
|---|---|---|---|---|
| 1 · Sequence › person | **18**/18 | — | **17**/18 | +1 |
| 2 · Campaign › audience › person | **18**/18 | +1 | **17**/18 | +1 |
| 3 · Company › person | **18**/18 | — | **17**/18 | +1 |
| 4 · Sequence › setting | **18**/18 | — | **17**/18 | +1 |
| 5 · Settings › set-up | **18**/18 | — | **17**/18 | +1 |
| 6 · Deals | **18**/18 | +1 | **17**/18 | +1 |
| 7 · Inbox, Tasks, Home | **16**/18 | −2 | **16**/18 | — |
| 8 · Index laps | **18**/18 | — | **17**/18 | +1 |
| 9 · Cross-cutting | **18**/18 | — | **17**/18 | +1 |

The disclosure ceiling moved. D2 was pinned at 1 for two rounds because the pane hard-coded
`glanceFields`; it now reads the usage model and I can show it does (below), so D2 is 2. D9 —
instrumented door usage and a scheduled promote/keep/delete review — is still 1 and still the
residue `BUILD-CHAINS.md` allows: there is no analytics behind this product. **17 is now a full
disclosure card here**, and eight of the nine chains reach it.

Chain 7 went backwards. One thing caused it, and it is below.

---

## D2 — two seats per pane

For each pane I could reach, I opened the **same object** under two seats and read the field list
off the screen.

| Pane | Seat A | Seat B | Differ? |
|---|---|---|---|
| **person** (`/ollopa/companies/co-1`, Petra Okonkwo) | meridian sdr: Title, Company, Email, Stage, Sequence, Last contacted, **Score**, Do not contact | meridian ae: Title, Company, **Owner**, Email, **Phone**, Stage, Last contacted, **Last activity**, Do not contact | **Yes** — and correctly: the SDR gets the score they prospect from, the AE gets the phone and the owner. The SDR also gets one action the AE does not, "Add to Replied, no meeting yet". |
| **company** (`/ollopa/deals/d-118`, Gatehouse Systems) | meridian ae: Company, Stage, Owner, **Contacts held**, Last activity, **Open deals** | meridian admin: Company, Stage, Owner, Last activity | **Yes** — the AE gets the two numbers they sell from. |
| **audience** (`/ollopa/campaigns/camp-4`, Enterprise prospects EMEA) | ridgeline marketer: Type, Total size, After suppressions, Last rebuilt | ridgeline admin: After suppressions | **Yes**, though the admin's single field is thin. |
| **deal** (Inbox row menu, Zephyr Holdings · Platform) | meridian sdr: **no fields at all** | meridian ae: Stage, Forecast category, Amount, Close date, Next step, Last activity | **Yes — and this is the round-3 defect.** See below. |
| **quick look** (deal card) | meridian ae: Forecast category, Amount, Close date, Next step, Last activity (Stage is the one editable control) | meridian admin: Stage, Forecast category, Amount, Close date, Next step, **Owner**, Last activity | **Yes.** |
| **task** | — | — | **Could not check.** `task` is registered in `work/register.tsx` but nothing on Tasks, Home or the Inbox opened it for me; every route I tried opened the `person` pane instead. |

So: where the model says the seats differ, the panes differ, on five of the six kinds I could
reach. The product's own check agrees — **no "pane does not declare its level one" warning fired
once across all nine chains on the dev build.**

---

## The dev-build console

Every chain, once, at 1440, against `npx vite --port 4181`. **Four distinct problems, none of them
new to this round, none visible in the production build, all real.**

1. **A `<button>` inside a `<button>`.** *"In HTML, `<button>` cannot be a descendant of `<button>`.
   This will cause a hydration error."* and *"`<button>` cannot contain a nested `<button>`."*
   Fired on chains 1, 4, 8 and 9, pointing at `data-page="/ollopa/sequences/…"`,
   `data-page="/ollopa/lists"` and `/ollopa/templates`. It is the row's select control: the phone
   card list renders `<button role="checkbox" aria-label="Select …">` wrapping the name button.
   Invalid HTML, an announced hydration risk, and a real keyboard and screen-reader problem — a
   button inside a button has no defined activation. Owner: the shared row/card list in
   `src/ollopa/pages/engage/shared.tsx` and whatever renders the index card rows.
2. **Duplicate React keys on the set-up page** (chain 5, ×3): *"Encountered two children with the
   same key, `ae`."* Meridian has two seats whose `role` is `ae` — "Account executive" and "Sales
   manager" — and the seat list keys by role. React may duplicate or drop one of them. Owner:
   `src/ollopa/pages/setup/WorkspaceSetup.tsx`.
3. **Missing keys in `DealsBoard`** (chain 6, ×2): *"Each child in a list should have a unique
   'key' prop. Check the render method of `DealsBoard`."*
4. **`key` spread into JSX on Home** (chain 7, ×2 each for Today, Replies, Approvals and Week):
   *"A props object containing a 'key' prop is being spread into JSX … React keys must be passed
   directly."* Owner: `src/ollopa/pages/home/register.tsx`.

Nothing else: no page errors, no failed requests, no 4xx apart from the favicon. The production
build's console is silent on every chain, at both widths.

---

## Chain 1 — Sequence › enrolled person beside › next › previous › act › open the page › back

Meridian SDR. Shots: `shots/chains/review3/01-sequence/`. **Chain: 18/18. Disclosure: 17/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | The sequence table stayed on screen, 34 rows, same sort, Mateo Okonkwo's row marked. |
| C2 | 2 | The crumb landed back at scroll 855, the row lit and focused, still carrying the move I had made. |
| C3 | 2 | Trail empty until "Open the page", then `Q4 enterprise outbound ›`, then empty. |
| C4 | 2 | "People (34)" inside the sequence, search box, six status filters, rows open beside. |
| C5 | 2 | Actions, a picker and "Previous [ · 1 of 34 · Next ]"; `]` and `[` walked. Zero `data-door` in the pane. |
| C6 | 2 | Undo on the row and in the pane; pressing it put both back. |
| C7 | 2 | A consequence under every action, and the picker restates the state: "Choose where Mateo Okonkwo goes; they are in Warm inbound follow-up now". |
| C8 | 2 | The row went to "moved from Q4 enterprise outbound to Warm inbound follow-up · step 1 · Undo", Status "Moved to Warm inbound follow-up"; the pane's Sequence field agreed. |
| C9 | 2 | Whole lap on the keyboard; arrival on the lit `H1 "Mateo Okonkwo"` with the crumb 1 Shift+Tab away. Counters: `page renders: 2` before the pane, `2` with it open, `2` after the action — only `rows renders` moved, 2 → 6 → 10. |

Disclosure D2 is now 2: the pane's eight fields for the SDR include **Score**, which the AE's list
does not, and the AE's includes Phone and Owner, which the SDR's does not — the level one is the
model's, per seat, not a fixed list.

---

## Chain 2 — Campaign › audience beside › the page › a person beside › back › back

Ridgeline marketer. Shots: `shots/chains/review3/02-campaign/`. **Chain: 18/18. Disclosure: 17/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | Campaign held at scroll 136 with the audience link marked. |
| C2 | 2 | Both returns lit and focused, audience then campaign. |
| C3 | 2 | `Onboarding week 1 › Enterprise prospects, EMEA ›`, three mounted pages, none `display:none`. |
| C4 | 2 | 40 recipients inside the audience record. |
| C5 | 2 | "1 of 40" on the person pane; no walker on the audience pane, correctly. |
| C6 | 2 | Scrolls survived both ways. |
| C7 | 2 | "Runs the rules again now; the total and the 5,759 after suppressions may both change". |
| **C8** | **2** *(was 1)* | **The one hole from round 2 is closed.** "Add to Trial day 14, no invite sent" from the person pane now writes to the recipients row: it went from "Amara Okonkwo Head of Growth · Umber Studios" to "Amara Okonkwo **added to Trial day 14, no invite sent · Undo** Head of Growth · Umber Studios". `02-campaign/90-acted-1440.png`. |
| C9 | 2 | Arrival on the lit `H1` both times; crumb 1 Shift+Tab away at both widths. |

D2: marketer four fields, admin one — the audience pane is seat-shaped.

---

## Chain 3 — Company › search a person inside it › beside › act › next › back

Meridian AE, Northwind Analytics, 24 contacts. **Chain: 18/18. Disclosure: 17/18.**

Unchanged from round 2 and still the strongest chain: "Contacts at this company 24" with search,
three filters and the "Open in People to act on all 24 at once; it carries Northwind Analytics as
the filter" escape (C4); the walker reads "1 of 24" and thirty presses of `]` reach "24 of 24" with
the table paging itself to 21–24 underneath (C5); the action lands on the row, "in Churned
re-engagement" → "in Q4 enterprise outbound … Undo" (C8); 4 tabs from the search box to the row and
arrival on the lit `H1 "Rosa Okonkwo"` (C9). C1, C2, C3, C6, C7 all as round 2. D2 is 2 on the
evidence in the table above.

---

## Chain 4 — Sequence › sending-rules link › Settings with the row lit › back to the row

Meridian admin. **Chain: 18/18. Disclosure: 17/18.**

All nine as round 2: the sequence stays mounted; the crumb returns with the link lit and focused;
`?row=mail.bounce-guard` lands with the row lit and focus **in** the "% warns" field; the
decision-critical numbers ("warns at 4% · pauses at 6% · 1.9% of 14,200 in 7 days · Nothing
paused · Auto-pause stops every mailbox on the domain until you resume it") are all on the face of
the page. C8 stays 2 — pressing Up took the threshold 4 → 5 in place, with the observed-rate line
correctly unchanged and no misreport — but see the real-user list: nothing says it was saved.

---

## Chain 5 — Settings › Change the answers › finish › back to the row with the notice

Meridian admin. **Chain: 18/18. Disclosure: 17/18.**

All nine as round 2. The set-up runs inside the shell with focus on the lit `H1 "Workspace
set-up"`; "Save the answers" returns to Settings with the Workspace profile row lit and
"Change the answers" focused; the notice reads **"Saved. Product-led growth: Lists and Sequences
left your sidebar."** and the sidebar has redrawn to match; the price is on the face of the
questions before the commit. The duplicate-key React error on this page is in the console list
above — it costs no card line, because both `ae` seats do render, but it is a bug.

---

## Chain 6 — Deals board › quick look › open › back; deal › contact; deal › company

Meridian AE. Shots: `shots/chains/review3/06-deals/`. **Chain: 18/18. Disclosure: 17/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | Company beside the board, contact beside the record; the origin stayed put. |
| C2 | 2 | Crumb back with the card lit and focused, both widths. |
| C3 | 2 | `Deals ›` then empty. |
| C4 | 2 | Contacts on the record; the company beside from card and record. |
| **C5** | **2** *(was 1)* | **The quick look walks its column.** Its footer now reads "Previous [ · 1 of 2 · Next ]" and the drawer still holds only the glance — no door in it. `06-deals/03-quick-look-1440.png`. |
| C6 | 2 | Nothing destroyed. |
| C7 | 2 | "Stops sequences for the 3 contacts here; the 4 people stay on People". |
| C8 | 2 | Changing Stage in the quick look moved the card into the Discovery column and its header to "4 · €245k". |
| C9 | 2 | Enter opens the drawer without changing the hash; the card's name teaches the rest ("Enter for the quick look, O for the record, M for the menu"); Esc returns focus to the opener. |

D2: the AE's quick look and the admin's differ (the admin sees Stage and Owner as read fields; the
AE's Stage is the one editable control).

---

## Chain 7 — Inbox, Tasks, Home

Meridian SDR. Shots: `shots/chains/review3/07-work/`. **Chain: 16/18. Disclosure: 16/18.**
Round 2's biggest gain is this round's only loss, and the cause is one pane.

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | The reply list and the thread stay on screen behind the pane. |
| C2 | 2 | Home › a reply › crumb: back on Home with the item lit and focused. |
| C3 | 2 | `Home ›` out, empty back. |
| C4 | 2 | The row menu is still labelled by what is behind it and still opens with "The people and deals behind this reply". |
| **C5** | **1** *(was 2)* | The contact pane is right — "1 of 4", walks on `]`, one nested step to the deal with "‹ back", nothing deeper. **The deal pane it steps into carries no fields at all for this seat.** For the Meridian SDR it is a name, a context line, "Open the page", and two actions they are told they cannot perform: "Close won — Owned by Dev Dubois; only the owner or an admin can close it" and "Mark lost and archive — …only the owner or an admin can archive it". Nothing else. `07-work/90-deal-pane-sdr-1440.png`. |
| C6 | 2 | "Mark complete" no longer strands the pane. |
| **C7** | **1** *(was 2)* | The consequence lines that are there are correct. But for the SDR the deal's **stage, amount and close date are not on the pane at all**, and those are what a person decides a reply from. The result is not visible before the commitment the chain exists to make. |
| C8 | 2 | After "Mark complete" the page, the row mark and the pane all move to Kai Kowalski and the walker goes 14 → 13. `07-work/10-task-done-1440.png`. |
| C9 | 2 | The pane takes focus when it opens from the row menu, at both widths; Esc returns to the row. |

Disclosure: **D1 = 1** for the same reason — price-and-commitment-shaped information (the deal's
amount and stage) is not visible without leaving the pane for the page. Every other line is 2
except D9.

---

## Chain 8 — Index laps: Sequences, People, Companies, Lists, Templates, Campaigns

**Chain: 18/18. Disclosure: 17/18.**

Six for six at 1440 and five walked by hand at 400 (my automated row-finder still does not match
the phone card layout; that is my instrument, not the product). Every lap pushed a crumb, every
crumb came back with the row lit and focused, every arrival landed on the lit `h1`.

**C9 is 2 now**: Templates and Campaigns have a real name control at 1440 — "Event follow-up" and
"Case study: Kestrel Health" are buttons in the row's first cell. All six indexes now open from the
name. (My first pass this round reported them unfixed; that was my selector assuming the name sits
in the second column, which is true only of the tables that carry a select checkbox. Corrected.)

---

## Chain 9 — Cross-cutting

**Chain: 18/18. Disclosure: 17/18.** Everything held, at both widths:

- Trail empty after a sidebar click, a ⌘K palette jump, a deep link and a sign-out;
  `ollopa.chain.meridian.Marcus Adeyemi` present before the sign-out and gone after; nothing in
  `localStorage`; signing back in gives an empty trail.
- The half-typed subject survived a follow and a return — "Closing the loop HALF-TYPED" — **and the
  step door was still open**.
- The page behind does not re-render when the pane opens: `page renders: 2` before, during and
  after; only `rows renders` moves, and only on an action.
- `prefers-reduced-motion`: the pane's computed `transition-property` is `none`.
- Esc closes and focus returns to the opener.
- No `data-door` in any pane, on any chain, at either width.
- Nothing opens past two levels; from the nested deal pane the only ways on are `‹ back` and
  "Open the page".
- **One highlight at a time** (round 2's N1): opening a second pane inside the old three-second
  return window now leaves `document.querySelectorAll(".ollopa-returned").length === 0`. Fixed.

The pane still contains one `role="combobox"` ("Choose a sequence") that opens a listbox in a
portal. It is not a `Door` — the pane's `data-door` count is still zero — and RULES rule 2 counts a
menu as its own channel, so it stays inside the rule.

---

## The round-2 items, one by one

| # | Item | Status | What I saw |
|---|---|---|---|
| 1 | Marketing rows do not show pane actions | **Fixed** | The recipients row now reads "Amara Okonkwo **added to Trial day 14, no invite sent · Undo**". The edits store reaches every folder now; I acted from a pane on engage, companies, marketing, deals and work and the row changed every time. |
| 2 | Focus and highlight on arrival at the Inbox thread and Home's reply | **Fixed** | Home › a reply lands on `/ollopa/inbox/r-6` with `lit: Sami Novak`. Every followed page in all nine chains now arrives with something lit. |
| 3 | The Tasks queue does not say what is behind the current task | **Fixed** | The page now reads "Task 1 of 14 · LinkedIn · Ben Novak, Nettle Labs · **One at a time. 13 more behind this one · next: Kai Kowalski · Send the follow-up** · See the list". The pane's count and the screen now say the same thing. |
| 4 | The deals quick look cannot walk its column | **Fixed** | "Previous [ · 1 of 2 · Next ]" in the drawer's footer. |
| 5 | Templates and Campaigns names are not controls at 1440 | **Fixed** | Both open from the name; both crumbs come back to the lit row. |
| 6 | Two rows lit at once (round-2 N1) | **Fixed** | Zero `.ollopa-returned` elements when the second pane opens. |
| 7 | Every pane's fields come from the usage model per seat | **Fixed, with one consequence** | Five of the six reachable panes differ by seat in the right direction, and the dev-only warning never fired. The sixth — the deal pane — differs by seat all the way down to nothing, which is the new defect below. |
| — | Nothing confirms a setting was saved | **Not fixed** | Pressing Up on "Warn at" takes 4 to 5 and the page is silent: no live region, no "saved", no note to the sequence that sent me here. |
| — | "People (34)" does not move when someone leaves the sequence | **Not fixed** | Still 34 after the move. Defensible while the Undo window is open; nothing says so. |
| — | Walking the pane away from the open thread | **Not fixed** | `]` moves the pane to the next reply while the reading pane keeps the first. Both are labelled, so nothing lies. |
| — | The sequence picker has no search | **Not fixed** | Still 11 options, no search box in the listbox. |

---

## New this round

## D-R3-1. The deal pane is empty for the seat that uses it most

- **Chain:** 7. **Step:** Inbox row menu › "Open Zephyr Holdings · Platform beside the thread", and
  the same pane reached as the one in-pane step from the contact.
- **What I saw:** for the Meridian SDR the pane body has **zero fields**. Name, context,
  "Open the page", then "Close won" and "Mark lost and archive", each with a line saying the seat
  may not do it. I confirmed it on every deal in the walker (`]` to "Nettle Works · Platform":
  still zero) and on a second workspace (Ridgeline SDR, "Thistle Group · Expansion": zero). The
  Meridian AE, on the same pane, gets Stage, Forecast category, Amount, Close date, Next step and
  Last activity.
- **What the brief requires:** *"The pane shows the object's first level (the same fields its record
  page starts with, in the same order) plus the actions the chain needs"*; chain card 5 and 7; and
  RULES rule 4, *"It always opens onto something; if it does not apply, it is removed, not
  disabled."*
- **Costs:** chain 7 C5 (2→1), C7 (2→1) and disclosure D1 (2→1).
- **Owner:** `src/ollopa/pages/deals/register.tsx` (the `deal` pane's declared level one) and the
  `deals`/`deal` entries in `src/ollopa/usage/`. Either the SDR's level one for a deal is genuinely
  empty in the model — in which case the model is wrong, because an SDR reading a reply needs the
  stage and the amount to answer it — or the pane is reading the wrong seat's row.
- **Note:** the two actions are the other half of it. A pane whose only controls are two things the
  reader is told they cannot do is a dead end; the rule says remove them, not explain them.

## D-R3-2. Four classes of React error in the dev build

Listed in full under "The dev-build console" above. The one I would fix first is the nested
`<button>`, because it is invalid HTML on four routes, React says it will cause a hydration error,
and a button inside a button is genuinely broken for the keyboard. The duplicate `ae` key on the
set-up page is second, because two real seats collide on it. None of these is visible in the
production build, which is exactly why they survived three rounds.

---

## Still wrong for a real person

1. **Nothing confirms a setting was saved.** The one control in the product that can pause every
   mailbox on a domain changes in silence.
2. **The sequence's "People (34)" does not move** when someone is moved out of it.
3. **`]` walks the pane away from the thread** the Inbox is showing, leaving two unrelated replies
   side by side.
4. **The sequence picker is an 11-item list with no search.** Fine at eleven, not at sixty.
5. **The toast overlaps the table and the pane** on a 900-high window
   (`01-sequence/05-acted-1440.png`).
6. **The `task` pane is registered and unreachable.** `work/register.tsx` exports it; nothing on
   Tasks, Home or the Inbox opened it for me. Either it is dead code or a route is missing.
7. **On a phone the pane still covers the page.** It names its origin now ("From Inbox · row Cyrus
   Rossi"), which the brief licenses, but the origin is named rather than seen.

---

## What I would tell the coordinator

Every round-2 item is fixed. The disclosure card moved from 16 to 17 everywhere because the panes
now read the usage model and demonstrably differ by seat — which is the change I most wanted and
the hardest one to fake, since the product's own warning would have caught a pane that skipped it,
and it never fired.

The same change is what broke chain 7. Making the pane seat-shaped let one seat's level one come
out empty, and it did so on the pane an SDR opens to decide how to answer a reply. That is one
entry in the usage model, and it is the last thing between this and nine full cards.

---

---

# Round 2 — the walk after the first fixes (superseded)

I built none of this. I re-walked every chain in `BUILD-CHAINS.md` at 1440 and at 400, by keyboard
wherever the brief asks for the keyboard, with my own driver (`scripts/review-chains.mjs`, updated
for round 2) against my own `npx vite preview --port 4180`; the render counters were read from the
dev build on 4181, where `import.meta.env.DEV` is true. Both servers were killed afterwards.

186 screenshots are in `shots/chains/review2/`, one per step, with the raw observation logs — the
trail, the pane, what had focus, what was lit, which pages were mounted, at what scroll — in
`shots/chains/review2/logs/`. Round 1's 180 screenshots stay where they were, in
`shots/chains/review/`, so the round-1 proof lines below still point at something.

Two changes to the harness, because round 1's numbers would have been wrong against the fixed
build: the crumb is now counted from wherever the page *actually* puts focus on arrival (backwards
first, since the header sits above the content) instead of from a re-seeded top of document; and a
shared `actInPane` helper does the pane's real action — pick a destination, press the button, read
the row before and after — so "the effect shows where it was caused" is measured the same way on
every chain.

**Disclosure ceiling, unchanged and restated:** D2 scores 1 everywhere (the pane's fields come from
a fixed `glanceFields` list, not from `useDisclosure`, so no usage number sits behind the pane's
choice of level one) and D9 scores 1 everywhere (no analytics; the residue `BUILD-CHAINS.md`
already allows). 16 is therefore a full disclosure card in this build, and every chain now reaches
it — the two lines round 1 docked, D4 on chain 7 and D5 on chain 6, are both back to 2.

---

### Scores at a glance

| Chain | Chain card | Δ | Disclosure card | Δ |
|---|---|---|---|---|
| 1 · Sequence › person | **18**/18 | +3 | **16**/18 | — |
| 2 · Campaign › audience › person | **17**/18 | +1 | **16**/18 | — |
| 3 · Company › person | **18**/18 | +4 | **16**/18 | — |
| 4 · Sequence › setting | **18**/18 | +1 | **16**/18 | — |
| 5 · Settings › set-up | **18**/18 | +1 | **16**/18 | — |
| 6 · Deals | **17**/18 | +2 | **16**/18 | +1 |
| 7 · Inbox, Tasks, Home | **18**/18 | +6 | **16**/18 | +1 |
| 8 · Index laps | **18**/18 | +2 | **16**/18 | — |
| 9 · Cross-cutting | **18**/18 | +1 | **16**/18 | — |

Two chains are short of a full chain card: chain 2 on C8 and chain 6 on C5. Both are named below.

---

### Chain 1 — Sequence › enrolled person beside › next › previous › act › open the page › back

Meridian SDR, `/ollopa/sequences/seq-1`. Shots: `shots/chains/review2/01-sequence/`.
**Chain: 18/18. Disclosure: 16/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | With Mateo Okonkwo beside it the sequence table was still on screen, same 34 rows, same sort, his row marked. `01-sequence/02-pane-1440.png`. |
| C2 | 2 | The crumb landed back at scroll 855, row lit, focus on the name button — and the row still carried the move I had made from the pane. `01-sequence/07-back-1440.png`. |
| C3 | 2 | Trail empty on arrival, empty through the pane and the walker, `Q4 enterprise outbound ›` only after "Open the page". |
| C4 | 2 | "People (34)" inside the sequence, with a search box and six status filters; rows open beside. |
| C5 | 2 | Actions, a destination picker, and "Previous [ · 1 of 34 · Next ]"; `]` went to Orla Ivanova, `[` came back. No `data-door` in the pane. |
| C6 | 2 | The move is reversible from both sides: "Undo" sits on the row and in the pane, and pressing it put the row back to *Active · 1. Email* and the pane's Sequence field back to "Q4 enterprise outbound · step 1 of 3". `01-sequence/92-undo-1440.png`. |
| C7 | 2 | Every action has its consequence under it, and the picker restates the current state: "Choose where Mateo Okonkwo goes; they are in Warm inbound follow-up now". |
| **C8** | **2** *(was 0)* | The action lands on the row. Before: *Active · 1. Email*. After: the row reads "moved from Q4 enterprise outbound to Warm inbound follow-up · step 1 · Undo" and its Status cell reads "Moved to Warm inbound follow-up", while the pane's Sequence field reads "Warm inbound follow-up · step 1 of 5". Page and pane agree. `01-sequence/05-acted-1440.png`. |
| **C9** | **2** *(was 1)* | The whole lap on the keyboard: 8 tabs to the row, Enter, `]`, `[`, the picker, "Open the page" 1 Shift+Tab from where the action left focus — and arrival puts focus on the lit `H1 "Mateo Okonkwo"`, with the crumb 1 Shift+Tab away. The counters: `page renders: 2` before the pane, `2` with it open, `2` after the action; only `rows renders` moved, 2 → 6. Opening still does not re-render; acting re-renders only the rows. |

At 400 the same lap runs, the pane is full width and names where it came from ("From Q4 enterprise
outbound · row Mateo Okonkwo"), and the crumb is 1 Shift+Tab from the h1.
`01-sequence/02-pane-400.png`, `07-back-400.png`.

---

### Chain 2 — Campaign › audience beside › the page › a person beside › back › back

Ridgeline marketer. Shots: `shots/chains/review2/02-campaign/`.
**Chain: 17/18. Disclosure: 16/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | The campaign stayed on screen at scroll 136 with the audience link marked while the audience was read beside it. |
| C2 | 2 | Both returns lit and focused: the audience crumb to Amara Okonkwo, the campaign crumb to the audience link. |
| C3 | 2 | `Onboarding week 1 › Enterprise prospects, EMEA ›`, three pages mounted, none `display:none`, then empty again. |
| C4 | 2 | The recipients are a 40-row table inside the audience record. |
| C5 | 2 | The person pane walks "1 of 40"; the audience pane has no walker, correctly, having been opened from a single link. |
| C6 | 2 | Scrolls survived both ways (campaign 136, audience 362). |
| C7 | 2 | "Runs the rules again now; the total and the 5,759 after suppressions may both change" / "Holds Enterprise prospects, EMEA at 6,122". |
| **C8** | **1** *(was 1)* | **The one place the round-1 fix did not reach.** I pressed "Add to Renewal 60 days" from the person pane on the audience record. The pane said "Done · added to Renewal 60 days · step 1 · Undo" and the toast announced it — and the recipients row behind was byte-for-byte unchanged: "Amara Okonkwo Head of Growth · Umber Studios", no added line, no undo, nothing. The sequence and company tables both grew one; this one did not. `02-campaign/90-acted-1440.png`. |
| **C9** | **2** *(was 1)* | Arrival focus on the lit `H1`, both times; the audience crumb 1 Shift+Tab away at 1440 and at 400. |

---

### Chain 3 — Company › search a person inside it › beside › act › next › back

Meridian AE, Northwind Analytics (`co-1`), 24 contacts. Shots: `shots/chains/review2/03-company/`.
**Chain: 18/18. Disclosure: 16/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | Company page held at scroll 3192 with Petra Okonkwo's row marked. |
| C2 | 2 | Crumb back at scroll 2824, Rosa Okonkwo's row lit and focused. |
| C3 | 2 | Trail empty → `Northwind Analytics ›` → empty. |
| C4 | 2 | Unchanged and still the model answer: heading "Contacts at this company 24", a search box, three filters, paging, and "Open in People to act on all 24 at once; it carries Northwind Analytics as the filter." |
| **C5** | **2** *(was 1)* | The walker now reads "1 of 24", not "1 of 10". I pressed `]` thirty times: it ended on "24 of 24" (Zev Novak) and the table behind had paged itself to "21–24 of 24" to keep the marked row on screen. `03-company/90-walk-end-1440.png`. |
| C6 | 2 | Nothing destroyed; the move carries an Undo. |
| C7 | 2 | Consequence lines and "Reveal the phone · 8 credits" unchanged. |
| **C8** | **2** *(was 0)* | The row went from "CMO · Cold · in Churned re-engagement · yesterday" to "CMO · Cold · in **Q4 enterprise outbound** · yesterday — moved from Churned re-engagement to Q4 enterprise outbound · step 1 · Undo". |
| **C9** | **2** *(was 1)* | 4 tabs from the search box to the row, the rest of the lap on the keyboard, arrival focus on the lit `H1 "Rosa Okonkwo"`. |

**Would the list hold at 200?** Now yes. The walker takes the whole filtered set and pages the table
under it, so a person can open contact 1 and press `]` to contact 200 without closing the pane, and
the "Open in People … carries the filter" escape is still there for acting on the set at once.

---

### Chain 4 — Sequence › sending-rules link › Settings with the row lit › back to the row

Meridian admin. Shots: `shots/chains/review2/04-setting/`.
**Chain: 18/18. Disclosure: 16/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | The sequence stayed mounted and inert while I was in Settings and came back untouched. |
| C2 | 2 | Crumb back to the sequence with "Bounce guard thresholds (Settings)" lit and focused. |
| C3 | 2 | `Q4 enterprise outbound › Email sending`. |
| C4 | 2 | The link sits in the sequence's own sending settings and carries `?row=mail.bounce-guard`. |
| C5 | 2 | Nothing opened a further level. |
| C6 | 2 | Nothing destroyed either way. |
| C7 | 2 | "warns at 4% · pauses at 6% · 1.9% of 14,200 in 7 days · Nothing paused · Auto-pause stops every mailbox on the domain until you resume it" — all before any edit. |
| **C8** | **2** *(was 1, untested)* | I tested it this round: pressing Up on "Warn at" took it 4 → 5 immediately, in the field, on the lit row, with the observed-rate line beside it unchanged (correctly — the observed rate did not change). No misreport. See the real-user list for what is missing around it. |
| C9 | 2 | 29 tabs at 1440 / 14 at 400 to the link, Enter, and focus lands **in the "% warns" field** on the lit row. `04-setting/02-settings-1440.png`. |

---

### Chain 5 — Settings › Change the answers › finish › back to the row with the notice

Meridian admin. Shots: `shots/chains/review2/05-setup/`.
**Chain: 18/18. Disclosure: 16/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | The set-up runs inside the shell, sidebar and header intact, crumb `Settings › Workspace set-up`. |
| C2 | 2 | "Save the answers" returns to Settings with the Workspace profile row lit and focus on "Change the answers". |
| C3 | 2 | `Settings ›` in, empty out. |
| C4 | 2 | The answers live under "How your team works"; leaving carries the trail. |
| C5 | 2 | No pane, nothing deeper. |
| C6 | 2 | "Answers are saved as you make them. Leaving and coming back returns this page exactly as it is." |
| C7 | 2 | "Starter includes 3 seats at $147 a month. 150 seats need Growth: $11850 a month for 150", and "Sent when you press Start" over the invites — total for the period, before the commit. |
| C8 | 2 | "Saved. Product-led growth: **Lists and Sequences left your sidebar.**" — announced live and lit in place, with the sidebar redrawn to match. |
| **C9** | **2** *(was 1)* | Arriving in the set-up now puts focus on the lit `H1 "Workspace set-up"`, at both widths, so the keyboard carries on from the questions rather than from the top of the document. |

---

### Chain 6 — Deals board › quick look › open › back; deal › contact; deal › company

Meridian AE. Shots: `shots/chains/review2/06-deals/`.
**Chain: 17/18. Disclosure: 16/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | Company beside the board and contact beside the record; the origin stayed put both times. |
| C2 | 2 | The crumb returns to the board with the card lit and focused, at both widths. |
| C3 | 2 | `Deals ›` after the quick look's "Open", empty after the crumb. |
| C4 | 2 | Contacts are a section on the record; the company opens beside from both the card and the record. |
| **C5** | **1** *(was 1)* | The contact and company panes are right and open nothing deeper. **The quick look still has no previous or next** — its only controls are the Stage picklist, "Open" and "Close", so scanning a column still costs a close and a reopen per card. `06-deals/92-quicklook-keyboard-1440.png`. |
| C6 | 2 | Nothing destroyed. |
| C7 | 2 | "Stops sequences for the 3 contacts here; the 4 people stay on People". |
| **C8** | **2** *(was 1, untested)* | Tested this round: changing Stage to Discovery in the quick look moved the card out of Qualified and into the Discovery column, whose header went to "4 · €245k", with the board still under the drawer. `06-deals/93-stage-moved-1440.png`. |
| **C9** | **2** *(was 1)* | **The quick look now opens from the keyboard.** With the card focused, Enter opens the drawer and the hash does not change; the card's own label teaches the rest — "Gatehouse Systems · Platform, €5k, Qualified. Enter for the quick look, O for the record, M for the menu." Esc returns focus to the opener; arrival on the record focuses the lit `H1`. |

Disclosure D5 returns to 2: level one of the deal record now works by keyboard.

---

### Chain 7 — Inbox, Tasks, Home

Meridian SDR. Shots: `shots/chains/review2/07-work/` and `shots/chains/review2/07-work-thread/`.
**Chain: 18/18. Disclosure: 16/18.** Round 1's worst chain is now the biggest move, +6.

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | The reply list and the open thread both stay on screen behind the pane. |
| C2 | 2 | Home › a reply › crumb: back on Home with the Sami Novak item lit and focused. `07-work/13-home-back-1440.png`. |
| C3 | 2 | `Home ›` out, empty back. |
| **C4** | **2** *(was 1)* | The row menu is labelled by what is behind it — "Cyrus Rossi: the contact and the deal, reply, route, read as, record" — and its first group, under the heading "The people and deals behind this reply", is "Open Cyrus Rossi beside the thread" and "Open Zephyr Holdings · Platform beside the thread". 21 items, down from 25, with the two duplicates gone. `07-work/02-inbox-menu-1440.png`. |
| **C5** | **2** *(was 1)* | Both routes to the contact pane now carry the list: from the row menu and from the thread's "Open Cyrus Rossi beside this", both read "1 of 4" and both walk on `]`. The one in-pane step works and comes back: the deal opens with "‹ Kai Andersen" in the header and, on `‹ back`, the contact pane returns with its walker intact at "2 of 4". The deal pane itself walks the deals behind the reply, "1 of 2". `07-work-thread/04-deal-nested-1440.png`, `05-back-in-pane-1440.png`. |
| **C6** | **2** *(was 1)* | "Mark complete" no longer strands the pane. |
| C7 | 2 | Consequence lines throughout, including "Owned by Dev Dubois; only the owner or an admin can close it" in the nested deal. |
| **C8** | **2** *(was 0)* | The clearest fix in the round. After "Mark complete" the page shows Kai Kowalski, the row mark is on Kai Kowalski, **and the pane reads Kai Kowalski**, with the walker at "1 of 13" on a list that is now 13. `07-work/10-task-done-1440.png`. |
| **C9** | **2** *(was 1)* | The pane takes focus when it opens from the row menu — the log reads `[inside the pane]` at 1440 and at 400, where round 1 left focus on the trigger. Esc returns to the row. |

---

### Chain 8 — Index laps: Sequences, People, Companies, Lists, Templates, Campaigns

Meridian SDR, except Campaigns (not in that seat) as the Ridgeline marketer.
Shots: `shots/chains/review2/08-indexes/`. **Chain: 18/18. Disclosure: 16/18.**

Six for six at 1440 and five checked by hand at 400 (my automated row-finder does not match the
phone card layout; I walked those by hand rather than report an instrument failure as a defect).
Every lap pushed a crumb and every crumb came back with the row lit and focused.

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | The index stays mounted, `visibility:hidden` and `inert`, at its own scroll. |
| C2 | 2 | Sequences → seq-6, People → c-763, Companies → co-3, Lists → list-13, Templates → tpl-7, Campaigns → camp-7; all six lit and focused on the way back. |
| **C3** | **2** *(was 1)* | The Templates crumb now reads "Templates", matching the `h1` I left. All six crumbs read the way their page did. |
| C4–C8 | 2 | No pane on these laps, nothing acted on, nothing deeper. |
| **C9** | **2** *(was 1)* | Sequences and Lists have a real name button at 1440 now, so there is something to Tab to; Templates and Campaigns still open by the row (see the real-user list). At 400 all five laps open from the name and land on the lit `H1`. |

---

### Chain 9 — Cross-cutting

Shots: `shots/chains/review2/09-cross/`. **Chain: 18/18. Disclosure: 16/18.**

Everything held, at both widths:

- Trail empty after a sidebar click, after a ⌘K palette jump, after a deep link, and after sign-out
  (`ollopa.chain.meridian.Marcus Adeyemi` present before, gone after; nothing in `localStorage`;
  signing back in gives an empty trail).
- The half-typed subject survived: I opened the step door, typed until it read "Closing the loop
  HALF-TYPED", followed a contact, came back on the crumb — same text, **and the step door still
  open**.
- The page behind does not re-render when the pane opens: `page renders: 2` before, during and
  after, with `rows renders` moving only when I acted.
- `prefers-reduced-motion`: the pane's computed `transition-property` is `none`.
- Esc closes and focus goes back to the opener.
- No `data-door` in any pane, on any chain, at either width.
- Nothing opens past two levels: from the nested deal pane the only ways on are `‹ back` and
  "Open the page".

One thing to note rather than score: the pane now contains a `role="combobox"` ("Choose a
sequence") that opens a listbox of 11 sequences in a portal outside the pane. It is not a `Door` —
the pane still has zero — and RULES rule 2 counts a menu as its own channel, so I judge it inside
the rule. `01-sequence/91-picker-1440.png`.

---

## The fifteen items, one by one

### The ten defects

**1. A pane action changes nothing on the page behind it — PARTLY FIXED.**
Fixed on the sequence (the row gains "moved from … to … · step 1 · Undo" and its Status cell
changes), on the company (the row's sequence changes in place), and on the deals board (the card
moves column). **Not fixed on the audience record**: "Add to Renewal 60 days" from the person pane
leaves the recipients row byte-for-byte identical while the pane says "Done · added to Renewal 60
days · step 1". The shared edits store reaches engage, companies, people, deals and work; marketing
is the folder it did not reach. Still costs chain 2 C8. Owner: `src/ollopa/pages/marketing/`.

**2. Tasks: the pane and the page disagree — FIXED.**
"Mark complete" now moves the page, the row mark and the pane together, and the walker goes 14 → 13.

**3. Focus dropped to the document body on every `follow` — FIXED.**
Every arrival I watched — contact record, audience record, person record, deal record, Settings,
the set-up, all six index records, at both widths — lands with focus on the page's `h1`, lit, with
the crumb one Shift+Tab away. The one exception is under new defects below.

**4. Previous and next walked a page, not the list — FIXED.**
"1 of 24" on a 24-row list; thirty presses of `]` reach "24 of 24" and the table pages itself to
21–24 underneath.

**5. The deals board quick look was mouse-only — FIXED.**
Enter on a focused card opens the drawer without changing the hash, and the card's accessible name
now teaches all three keys.

**6. The pane did not take focus when opened from a menu — FIXED.**
Focus is inside the pane at both widths.

**7. The thread's contact pane carried no list — FIXED.**
"1 of 4" from both routes, and `besideBack` restores the walker.

**8. The Inbox row's unlabelled 25-item menu — FIXED.**
Labelled by its contents, grouped under real headings, contact and deal first, duplicates gone,
21 items.

**9. A `follow` into Settings with no `?row=` — FIXED.**
The deal record's link is now `/ollopa/settings/pipeline?row=pipe.required-at-stage` and lands with
"Required to enter a stage" lit. I found no other bare settings link on Tasks or the Inbox.

**10. A crumb that did not read the way the page did — FIXED.**
Templates now reads "Templates", at both widths.

### The eight "wrong for a real person" items

*(Round 1 listed eight, not five; all eight are accounted for.)*

**1. On a phone the origin is not visible — PARTLY FIXED.** The pane still covers the page at 400,
which the brief licenses. What is new is that the pane now says where it came from in its first
line — "From Q4 enterprise outbound · row Mateo Okonkwo", "From Inbox · row Cyrus Rossi", "From
Deals" — so the origin is at least *named* when it cannot be seen.

**2. The pane pushed the row's own actions off screen — PARTLY FIXED.** Each row now keeps a "…"
menu pinned at the right edge of the shrunken table, so the row's actions stay reachable while the
pane is open. The Added and Last activity columns still disappear.

**3. "Move to …" guessed the destination — FIXED.** It is now a two-part control: "Choose a
sequence" then "Move to the chosen sequence", with the current state restated ("Choose where Mateo
Okonkwo goes; they are in Warm inbound follow-up now") and an Undo on both the row and the pane.

**4. Index row names that are not links — PARTLY FIXED.** Sequences and Lists have a name button at
1440 now. **Templates and Campaigns still do not**: at 1440 the name is plain text and the row
itself is the target. The product still teaches two rules for the same gesture.

**5. The AE's company record labelled Accounts and Companies at once — FIXED.** The back link now
reads "Companies" and matches the `h1`.

**6. Tasks says "1 of 14" with one task on screen — NOT FIXED.** The page still shows a single task
while the pane counts the queue. The number is true of the queue and false of the screen.

**7. The quick look has no way to the next card — NOT FIXED.** Still Stage, Open, Close.

**8. "Open the deal" on a reply with no deal — FIXED.** The menu item now reads "Create a deal from
this reply" when there is no deal, instead of leaving for an unrelated one.

---

## New defects the fixes introduced

**N1. Two rows lit at once, briefly.** At 400 on the deal record: I opened a contact beside,
pressed Esc, then opened the company beside within the three-second return highlight. The pane read
"Gatehouse Systems" while "Luca Yilmaz" was still lit on the page. The close-focus fix leaves its
highlight running and opening a second pane does not clear it, so for up to three seconds the page
marks one row while the pane reads another. Small, and self-clearing — but it is the same class of
thing as defect 2. Owner: `src/ollopa/ui/Beside.tsx`.

**N2. The arrival fix does not reach the Inbox thread route.** Home › a reply › the reply page
(`/ollopa/inbox/r-6`) lands with focus on an `H2` and **nothing lit**, where every other followed
page lands on a lit `h1`. The crumb and the return both work; it is the arrival cue that is
missing, and it is the SDR's most-used follow. Owner: `src/ollopa/pages/work/`.

Nothing else regressed: I re-ran all nine cross-cutting checks and all six index laps, and every
round-1 pass still passes.

---

## Still wrong for a real person, after round 2

1. **The Tasks queue still shows one task and counts fourteen** (real-user item 6, unfixed).
2. **The quick look still cannot walk a column** (real-user item 7, unfixed).
3. **Templates and Campaigns rows still have no name control at 1440** (real-user item 4, half
   done).
4. **Nothing confirms the setting was saved.** Pressing Up on "Warn at" takes 4 to 5 and that is
   all: no "saved", no live-region announcement, no note that the sequence which sent me here is
   affected. Every other change in the product says something; this one, which pauses mailboxes,
   says nothing.
5. **The sequence's "People (34)" heading does not move when someone leaves it.** The row says
   "Moved to Warm inbound follow-up" and offers Undo, so the heading arguably should not change
   until the undo window closes — but nothing says that, and the count is the number a person
   reads first.
6. **Walking the pane away from the open thread.** On the Inbox, `]` moves the pane to the next
   reply while the reading pane keeps showing the first one. Both are labelled, so nothing lies,
   but the screen then shows two different replies side by side with no relation between them.
7. **The sequence picker is an 11-item list with no search.** Fine at eleven; a workspace with
   sixty sequences would be scrolling a menu inside a pane.
8. **The toast overlaps the table and the pane.** On a 900-high window the "moved from … to …"
   toast sits over the bottom rows and over the pane's walker. `01-sequence/05-acted-1440.png`.

---

## What I would tell the coordinator

Eight of the ten defects are fixed outright, one is fixed everywhere but one folder, and one — the
focus fix — is fixed everywhere but one route. Five of the eight real-user items are fixed, three
partly or not at all, and two small new things appeared, both in the class of "the page and the
pane briefly disagree".

Seven of the nine chains are at 18 and 18-minus-the-documented-residue. The two that are not are
named, narrow, and in one folder each.

---

---

# Round 1 — the first walk (superseded)

I built none of this. I read `BUILD-CHAINS.md`, `RULES.md`, `knowledge-base/13-chains-of-work.md`
section 6 and `src/ollopa/ui/README.md`, then wrote my own driver — `scripts/review-chains.mjs` —
rather than running the builders' `walk-*.mjs`, and walked every chain in the brief at 1440 and at
400, by keyboard wherever the brief asks for the keyboard. The app was the production build served
by `npx vite preview --port 4180`; the render counters were read from the dev build on port 4181,
because they only exist under `import.meta.env.DEV`.

180 screenshots are under `shots/chains/review/`, one per step, named in the order they happened.
The raw observation logs — the trail, the pane, what had focus, what was lit, which pages were
mounted and at what scroll — are in `shots/chains/review/logs/`.

Every proof line below is something I watched happen in the browser. Where I did not test a thing,
I say so and score it down rather than guess.

---

### How I scored

**Disclosure** is the nine-question score at the end of `RULES.md`. Two of its lines are the same
everywhere in this build and I will not repeat the argument nine times:

- **D2 (every visible item is backed by a usage number with a source): 1 everywhere.** The record
  pages read their level one from `useDisclosure`, but the pane does not: `PersonBeside` and the
  rest hand the frame a fixed `glanceFields` list. That keeps the pane, the quick look and the top
  of the record page identical, which is what the brief asks for, but nothing behind the pane's
  field choice is a usage number.
- **D9 (door usage instrumented, scheduled promote/keep/delete review): 1 everywhere.** This is the
  residue `BUILD-CHAINS.md` §"The two scorecards" already allows for. There is no analytics behind
  this product and a demo cannot make one.

So 16 is a full disclosure card in this build. I say where a chain drops below it.

**Chain** is the nine-question score from 13-chains-of-work §6, as `BUILD-CHAINS.md` restates it.

---

### Chain 1 — Sequence › enrolled person beside › next › previous › open the page › back

Meridian SDR, `/ollopa/sequences/seq-1`. Shots: `shots/chains/review/01-sequence/`.

**Chain: 15/18. Disclosure: 16/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | With Mateo Okonkwo open beside it the sequence table was still on screen, same 34 rows, same sort, and his row carried the `.ollopa-beside-open` highlight. `01-sequence/02-pane-1440.png`. |
| C2 | 2 | The crumb put me back at scroll 855, exactly where I left (log: `mounted /ollopa/sequences/seq-1*@855`), with the Mateo Okonkwo row lit blue and focus on the name button. `01-sequence/06-back-1440.png`. |
| C3 | 2 | The trail was empty on arrival and stayed empty through the pane, `]` and `[`; it only read `Q4 enterprise outbound ›` after "Open the page". |
| C4 | 2 | The enrolled people are a real list inside the sequence — "People (34)", a "Find a person in this sequence" box and six status filters — and the rows open beside. |
| C5 | 2 | The pane carried Move / Draft an email / Call and a footer reading "Previous [ · 1 of 34 · Next ]". `]` went to Orla Ivanova (2 of 34), `[` came back. No door inside it, nothing offered a further level. |
| C6 | 2 | Nothing was destroyed. Half-typed text in the step-1 subject and an open step door both survived the trip to the contact record and back (chain 9, below). |
| C7 | 2 | Every pane button has its consequence underneath: "Takes Mateo Okonkwo out of Q4 enterprise outbound and starts them at step 1 of Warm inbound follow-up", "Sends 1 email … · 4 credits". |
| **C8** | **0** | I pressed "Move to Warm inbound follow-up". The toast said it happened and the button relabelled itself. **The row behind did not change**: it still read *Active · 1. Email · Q4 enterprise outbound*, and the heading still said "People (34)". `01-sequence/90-pane-action-1440.png`. |
| **C9** | **1** | The lap runs on the keyboard — 8 tabs from the search box to the row, Enter, `]`, `[`, 2 tabs to "Open the page" — and the page did not re-render (counters `page renders: 2 / rows renders: 2` before, during and after). **But the moment "Open the page" fired, focus went to `<body>`**, and getting to the crumb cost 12 more tabs through the whole sidebar. |

Disclosure: D1 2 (credits and consequences are on the face of the pane), D3 2 (page → pane is one
level and the pane opens nothing), D4 2 ("Open step", "Signature, Tracking subdomain, Catch-all
blocking … (6)"), D5 2, D6 2, D7 2 (the step door was still open after the round trip), D8 2.

At 400 everything above held: the pane takes the full width, the trail collapses to one step, and
the crumb is one tab away. `01-sequence/02-pane-400.png`, `01-sequence/06-back-400.png`.

---

### Chain 2 — Campaign › audience beside › open the page › a person beside › back › back

Ridgeline marketer, `/ollopa/campaigns/camp-4`. Shots: `shots/chains/review/02-campaign/`.

**Chain: 16/18. Disclosure: 16/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | "Read the audience beside this" opened Enterprise prospects, EMEA beside the campaign; the campaign stayed on screen at scroll 136 and the audience link was marked. `02-campaign/02-audience-beside-1440.png`. |
| C2 | 2 | Two returns, both clean: the audience crumb landed with Amara Okonkwo lit and focused, then the campaign crumb landed with the audience link lit and focused. `06-back-audience-1440.png`, `07-back-campaign-1440.png`. |
| C3 | 2 | The trail grew to `Onboarding week 1 › Enterprise prospects, EMEA ›` and shrank back to empty, only from my own moves. Three pages were mounted at the deepest point and none was `display:none`. |
| C4 | 2 | The audience's recipients are a table inside the audience record, 40 rows, each opening beside. |
| C5 | 2 | The person pane read "1 of 40" and walked. The audience pane has no previous/next, which is right — it was opened from a single link, not a list. Neither pane offered a further level. |
| C6 | 2 | Nothing lost. The campaign's scroll (136) and the audience's scroll (362) were both still there on the way back. |
| C7 | 2 | The audience pane's actions carry consequences: "Runs the rules again now; the total and the 5,759 after suppressions may both change" / "Holds Enterprise prospects, EMEA at 6,122; no new match is added to Onboarding week 1 again". |
| C8 | 1 | I did not act from either pane on this chain, so I cannot score it 2. It is the same frame and the same renderers that failed C8 in chains 1 and 3, so I am not willing to score it 2 on trust either. |
| C9 | 1 | The whole lap ran on the keyboard and the crumbs were reachable (12 tabs at 1440, 1 at 400), but focus was dropped to `<body>` on both follows. |

---

### Chain 3 — Company › search a person inside it › open beside › act › next › back

Meridian AE, Northwind Analytics (`co-1`), the largest account in the seed at 24 contacts.
Shots: `shots/chains/review/03-company/`.

**Chain: 14/18. Disclosure: 16/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | Petra Okonkwo open beside; the company page still there at scroll 3192, her row marked. `03-company/03-beside-1440.png`. |
| C2 | 2 | The crumb landed back at scroll 2824 with the Rosa Okonkwo row lit and focused. `07-back-1440.png`. |
| C3 | 2 | Trail empty until "Open the page", then `Northwind Analytics ›`, then empty again. |
| C4 | 2 | This is the best-executed part of the build. The contacts are a real list inside the company — heading "Contacts at this company 24", a "Find a person at Northwind Analytics" box, three filters (Stage, In a sequence, Title), paging "1–10 of 24" — and the page says in words: *"Reading and acting on one person happens here. Open in People to act on all 24 at once; it carries Northwind Analytics as the filter."* That is exactly the property. |
| **C5** | **1** | Actions and walking are there, and nothing opens deeper. **But `]` stops at the page boundary**: I pressed it twelve times from the first contact and landed on "10 of 10" with 14 contacts never reached. `03-company/90-walk-end-1440.png`. At 200 contacts you would walk ten and stop. |
| C6 | 2 | Nothing destroyed across the lap. |
| C7 | 2 | "Move to Q4 enterprise outbound" carried its consequence line; "Reveal the phone · 8 credits" carried its price. |
| **C8** | **0** | Two failures at once. The action did not change the row behind — it still read "CMO · Cold · in Churned re-engagement" afterwards. And the pane's counter says "1 of 10" on a list the page itself calls 24, which is the software misreporting the size of the set the person is in. |
| **C9** | **1** | Keyboard reached the row in 4 tabs from the search box and the rest of the lap ran, and the page did not re-render. Focus was dropped to `<body>` on "Open the page". |

**Would the list hold at 200?** The shape would: search, three filters, a page size of ten and an
explicit "Open in People to act on all 200 at once" escape. The walking would not. With 200
contacts a person opening the first one and pressing `]` would be told they are "1 of 10", would
reach 10, and would have to close the pane, page the table, and start again — twenty times. The
walker has to take the whole filtered set, or say plainly that it is walking a page.

---

### Chain 4 — Sequence › sending-rules link › Settings with the row lit › back to the sequence row

Meridian admin. Shots: `shots/chains/review/04-setting/`.

**Chain: 17/18. Disclosure: 16/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | No pane here by design; the sequence stayed mounted and inert while I was in Settings and came back untouched. |
| C2 | 2 | The crumb returned to the sequence with the "Bounce guard thresholds (Settings)" link itself lit and focused. `04-setting/03-back-1440.png`. |
| C3 | 2 | The trail read `Q4 enterprise outbound › Email sending` — the origin's own name, not an inferred path. |
| C4 | 2 | The link is where the rule it governs is, inside the sequence's sending settings, and it carries `?row=mail.bounce-guard`. |
| C5 | 2 | Nothing opened a further level. |
| C6 | 2 | The sequence's state survived; nothing was announced as destroyed because nothing was. |
| C7 | 2 | The bounce-guard row shows "warns at 4% · pauses at 6% · 1.9% of 14,200 in 7 days · Nothing paused · Auto-pause stops every mailbox on the domain until you resume it" before any edit. |
| C8 | 1 | I read the setting; I did not change it, so I cannot score this from observation. |
| C9 | 2 | **The only chain where the keyboard lap is whole.** 29 tabs at 1440 / 14 at 400 to the link, Enter, and focus landed *in the "% warns" field* on the lit row — not on `<body>`. `04-setting/02-settings-1440.png`. The crumb came back and put focus on the link. |

---

### Chain 5 — Settings › Change the answers › finish › back to the row with the notice

Meridian admin. Shots: `shots/chains/review/05-setup/`.

**Chain: 17/18. Disclosure: 16/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | The set-up ran **inside the shell**, sidebar and header intact, crumb `Settings › Workspace set-up`. This is the chain the brief opened by calling broken, and it is fixed. `05-setup/03-setup-1440.png`. |
| C2 | 2 | "Save the answers" returned to `/ollopa/settings` with the Workspace profile row lit and focus on "Change the answers". |
| C3 | 2 | Trail `Settings ›` while inside, empty on return. |
| C4 | 2 | The answers live in Settings under "How your team works"; leaving for the set-up carries the trail. |
| C5 | 2 | No pane; nothing deeper. |
| C6 | 2 | The page says it and means it: "Answers are saved as you make them. Leaving and coming back returns this page exactly as it is." |
| C7 | 2 | Before the commit: "Starter includes 3 seats at $147 a month. 150 seats need Growth: $11850 a month for 150", and "Sent when you press Start" over the invites. Rule 7 satisfied, total for the period, no breakdown. |
| C8 | 2 | The notice names what moved, in place, and is announced live: **"Saved. Product-led growth: Lists and Sequences left your sidebar."** The sidebar had redrawn to match. `05-setup/98-moved-notice-1440.png`. |
| C9 | 1 | I drove this one by click. Focus after "Change the answers" went to `<body>`, so a keyboard user tabs in from the top of the document. |

---

### Chain 6 — Deals board › quick look › open › back; deal › contact beside; deal › company beside

Meridian AE. Shots: `shots/chains/review/06-deals/`.

**Chain: 15/18. Disclosure: 15/18.**

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | Company beside the board, and contact beside the deal record: in both the origin stayed put. `06-deals/06-board-company-1440.png`, `07-deal-contact-1440.png`. |
| C2 | 2 | The crumb returned to the board with the Gatehouse Systems card lit and focused, at both widths. `06-deals/05-back-board-1440.png`. |
| C3 | 2 | `Deals ›` after the quick look's "Open", empty again after the crumb. |
| C4 | 2 | Contacts are a section on the deal record; the company is a control on the card and on the record, both opening beside. |
| C5 | 1 | The contact and company panes are right. The quick look has no previous/next, so a person glancing down a column has to close and reopen for every card. |
| C6 | 2 | Nothing destroyed. |
| C7 | 2 | The company pane: "Stops sequences for the 3 contacts here; the 4 people stay on People". |
| C8 | 1 | I did not move a stage from the quick look, so I cannot score this from observation. |
| **C9** | **1** | Esc returned focus to the opener both times, and the crumb lap ran. **But the quick look cannot be opened from the keyboard at all**: with the card focused, Enter goes straight to the deal record (log: `Enter → hash=#/ollopa/deals/d-118 drawer=false`). The drawer appears only on a mouse click of the card body. `06-deals/03-quick-look-1440.png` is a mouse click. |

Disclosure drops one line here: **D5 = 1** — rule 5's test is "works by keyboard and touch", and
level one of the deal record does not.

---

### Chain 7 — Inbox, Tasks, Home

Meridian SDR. Shots: `shots/chains/review/07-work/` and `shots/chains/review/07-work-thread/`.

**Chain: 12/18. Disclosure: 15/18.** The worst chain in the build.

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | The Inbox list and the open thread both stayed on screen behind the pane. `07-work-thread/03-contact-beside-1440.png`. |
| C2 | 2 | Home › a reply › the crumb: back on Home with the Sami Novak item lit and focused. `07-work/13-home-back-1440.png`. |
| C3 | 2 | `Home ›` on the way out, empty on the way back. |
| **C4** | **1** | The related object is inside the object, but hidden. On an Inbox row the contact is **item 11 of a 25-item "…" menu**, behind an unlabelled three-dot icon. In the thread it is behind a "Contact details" door, as "Open Cyrus Rossi beside this". Neither is findable by someone who does not already know. |
| **C5** | **1** | The in-pane step is genuinely good: contact → the deal, with "‹ Cyrus Rossi" in the header, and the deal pane offers nothing deeper — only ‹ back and "Open the page". `07-work-thread/04-deal-nested-1440.png`. But the pane opened from the thread carries **no list**, so `[` and `]` do nothing; the same pane opened from the row menu says "1 of 4" and walks. Two routes to one pane, two behaviours. |
| **C6** | **1** | On Tasks, "Mark complete" moved the page on to the next task while the pane stayed on the finished one. The chain the person was in was cut by their own step completion, with nothing announced. |
| C7 | 2 | Consequence lines throughout, including in the nested deal pane ("Owned by Dev Dubois; only the owner or an admin can close it"). |
| **C8** | **0** | The clearest misreport in the build. After "Mark complete": the page shows "Step 2 of 3 · Send the follow-up" for **Kai Kowalski**, the `.ollopa-beside-open` highlight has moved to **Kai Kowalski's** row, and the pane still reads **Ben Novak** with the walker still saying "1 of 14" on a list that is now 13. `07-work/10-task-done-1440.png`. |
| **C9** | **1** | `[`, `]` and Esc work from the page. But when the contact pane is opened from the Inbox row menu, **focus never enters the pane** — it stays on the "More actions for Cyrus Rossi" button (observed at 1440 and at 400). And focus is dropped to `<body>` on every follow. |

Disclosure drops one line: **D4 = 1** — the Inbox row's door is an unlabelled three-dot icon
holding 25 items, including "Open the deal" twice and "Mark done" twice. Rule 4's test ("cover the
label, can you guess what is behind it?") fails, and NN/g's 0% click-through on an unlabelled
non-standard icon is the evidence the rule cites.

---

### Chain 8 — Index laps: Sequences, People, Companies, Lists, Templates, Campaigns

Meridian SDR, except Campaigns, which is not in that seat and opens a no-access page — that lap was
run as the Ridgeline marketer. Shots: `shots/chains/review/08-indexes/`.

**Chain: 16/18. Disclosure: 16/18.**

All six laps work at 1440 and all six work at 400. Every one pushed a crumb, and every crumb came
back with the row lit and focused:

- Sequences → `seq-6` → back, "Security buyers, DACH" lit, focus on the `TR`.
- People → `c-763` → back, "Mateo Novak VP Sales" lit.
- Companies → `co-3` → back, "Kestrel Health" lit, focus on the name button.
- Lists → `list-13` → back, "Unsubscribed" lit.
- Templates → `tpl-7` → back, "Event follow-up" lit.
- Campaigns → `camp-7` → back, "Case study: Kestrel Health" lit.

| # | Score | What I saw |
|---|---|---|
| C1 | 2 | The index stayed mounted, hidden with `visibility:hidden` and `inert`, never `display:none`, at its own scroll. |
| C2 | 2 | Six for six, lit and focused, at both widths. |
| **C3** | **1** | The Templates crumb reads **"Templates and snippets"** while the page's `h1` read "Templates". `origin.title` is meant to be "the page's h1 as it read at the moment of leaving"; here it is something else. |
| C4 | 2 | — |
| C5 | 2 | No pane on these laps; nothing deeper. |
| C6 | 2 | — |
| C7 | 2 | — |
| C8 | 2 | Nothing acted on. |
| **C9** | **1** | The row is focusable and Enter opens it, so the lap runs. But on Sequences, Lists and Templates at 1440 **the name is plain text** — no link, no button — so there is nothing that looks like the way in, and the only labelled control in the row is "Open" parked in the last cell next to "Pause". And the crumb still costs a tab walk from the top after each follow. |

---

### Chain 9 — Cross-cutting

Shots: `shots/chains/review/09-cross/`.

**Chain: 17/18. Disclosure: 16/18.** Everything the brief asks for here is true.

- **Trail empty after a sidebar click.** Trail was `Q4 enterprise outbound ›`; clicked Companies in
  the sidebar; trail empty, one page mounted. `09-cross/02-a-after-sidebar-1440.png`.
- **Trail empty after a palette jump.** ⌘K → "Companies" → Enter; trail empty.
  `03-b-palette-1440.png`, `04-b-after-palette-1440.png`.
- **Trail empty after a deep link.** `/ollopa/people/c-13` loaded cold; trail empty.
- **Trail empty after sign-out.** `sessionStorage` held
  `ollopa.chain.meridian.Marcus Adeyemi=[…]` before; after sign-out the key was gone, and signing
  back in gave an empty trail. Nothing in `localStorage`.
- **A half-typed value survives follow and back.** I opened the step-1 door, typed into the subject
  so it read "Closing the loop HALF-TYPED", followed a contact to their record, came back on the
  crumb — the field still read "Closing the loop HALF-TYPED" **and the step door was still open**.
  `09-cross/01-e-half-typed-1440.png`, `05-e-back-1440.png`.
- **The page behind does not re-render.** On the dev build: `page renders: 2 · rows renders: 2`
  before the pane, the same with the pane open, and the same again after the return.
  `09-cross/02-f-counters-1440.png`.
- **`prefers-reduced-motion` disables the pane's transition.** With the feature emulated,
  `matchMedia` reported true and the pane's computed `transition-property` was `none`.
- **Esc closes the pane and focus returns to the opener.** Focus was inside the pane; after Esc it
  was on the "Mateo Okonkwo" button that opened it. `09-cross/03-g-esc-1440.png`.
- **The pane never contains a Door.** Zero elements matching `[data-door]` or `[aria-expanded]` in
  every pane I opened, on every chain.
- **Nothing opens past two levels.** From the nested deal pane the only ways on are "‹ Cyrus Rossi"
  and "Open the page".

C9 is 1, for the one thing that is wrong everywhere: focus after a `follow`.

---

## The defect list

### 1. A pane action changes nothing on the page behind it — the page then misreports state

- **Chain:** 1 and 3 (and by construction every pane with an action).
- **Step:** chain 1 step 2→3, "Move to Warm inbound follow-up"; chain 3 step 3, "Move to Q4
  enterprise outbound".
- **What I saw:** the toast said "Mateo Okonkwo moved from Q4 enterprise outbound to Warm inbound",
  the pane's button relabelled itself — and the enrolled row behind still read *Active · 1. Email*
  under the heading "People (34)". On the company, Petra Okonkwo's row still read "in Churned
  re-engagement". Once the toast fades, the screen says the opposite of what just happened.
  `shots/chains/review/01-sequence/90-pane-action-1440.png`.
- **What the brief requires:** chain card 8 — "Every action shows its effect where it was caused,
  in place, at once; the software never misreports state."
- **Costs:** chain C8 (0 on chains 1 and 3).
- **Owner:** the mechanic, not one page: `src/ollopa/ui/Beside.tsx` and `src/ollopa/beside.ts` bought
  "the page does not re-render" by giving the pane its own store with no channel back, and
  `src/ollopa/pages/engage/SequenceRecord.tsx` and
  `src/ollopa/pages/companies/CompanyContacts.tsx` act through it. The two properties are not
  actually in conflict — *opening* must not re-render; *acting* must.

### 2. Tasks: the pane and the page disagree about which task you are on

- **Chain:** 7. **Step:** Tasks › contact beside › "Mark complete".
- **What I saw:** the page advanced to "Step 2 of 3 · Send the follow-up" for Kai Kowalski, the row
  highlight moved to Kai Kowalski's row, and the pane carried on showing Ben Novak with
  "1 of 14" — a list that is now 13. `shots/chains/review/07-work/10-task-done-1440.png`.
- **What the brief requires:** chain card 8 and 6; and the pane's own rule that closing after an
  action puts focus on "the row that took its place".
- **Costs:** chain C8 (0) and C6 (1) on chain 7.
- **Owner:** `src/ollopa/pages/work/Tasks.tsx`, with `src/ollopa/beside.ts` (the store has no way to
  be told its target is gone).

### 3. Focus is dropped to the document body on every `follow`

- **Chain:** 1, 2, 3, 5, 6, 7, 8 — every chain except 4.
- **Step:** every "Open the page", every index row, every `FollowLink`.
- **What I saw:** immediately after the route changed, `document.activeElement` was `<body>`. From
  there, reaching the crumb cost 12 tabs on the contact record and 20 on the person record at 1440;
  the tab walk goes through the entire sidebar first. Chain 4 is the exception because the `?row=`
  cue moves focus into the setting on arrival.
- **What the brief requires:** chain card 9 — "the keyboard runs the whole lap … focus is never
  lost."
- **Costs:** chain C9 (1) on chains 1, 2, 3, 5, 6, 7, 8.
- **Owner:** `src/ollopa/shell/AppShell.tsx` — the return cue already knows how to move focus on
  `back()`; arrival by `follow()` has no equivalent.

### 4. Previous and next walk a page of the list, not the list, and say "10 of 10" for 24

- **Chain:** 3. **Step:** step 4, `]` pressed repeatedly.
- **What I saw:** from the first contact, twelve presses of `]` ended on "10 of 10" while the
  section heading two inches away read "Contacts at this company 24" and the pager read "1–10 of
  24". `shots/chains/review/03-company/90-walk-end-1440.png`.
- **What the brief requires:** chain card 5 — "next and previous when it was opened from a list"
  that "walk that list"; and card 8, never misreport state.
- **Costs:** chain C5 (1) and C8 on chain 3.
- **Owner:** `src/ollopa/pages/companies/CompanyContacts.tsx` (it hands `openBeside` the ids of the
  current page only).

### 5. The deals board's quick look cannot be opened from the keyboard

- **Chain:** 6. **Step:** step 2.
- **What I saw:** with the card focused, Enter navigated straight to `/ollopa/deals/d-118`; no
  drawer. The drawer opens only on a mouse click of the card body. The card's own key handler maps
  Enter to "open the record", `m` to the menu and `e` to the next step — there is no key for the
  glance.
- **What the brief requires:** chain card 9 (the keyboard runs the lap) and disclosure rule 5
  ("works by keyboard and touch"); the quick look is level one of the record in RULES.md's named
  pattern.
- **Costs:** chain C9 (1) and disclosure D5 (1) on chain 6.
- **Owner:** `src/ollopa/pages/deals/DealCard.tsx`.

### 6. The pane does not take focus when it is opened from a menu

- **Chain:** 7. **Step:** Inbox › "…" › "Open contact".
- **What I saw:** the pane opened with Cyrus Rossi in it and focus stayed on the "More actions for
  Cyrus Rossi" button, at 1440 and at 400. The frame's `panel.current?.focus()` runs and then the
  dropdown restores focus to its trigger as it closes.
- **What the brief requires:** the pane spec — "Focus moves into the pane on open"; chain card 9.
- **Costs:** chain C9 on chain 7.
- **Owner:** `src/ollopa/ui/Beside.tsx`.

### 7. The same pane has next/previous down one route and not down the other

- **Chain:** 7. **Step:** thread › "Contact details" › "Open Cyrus Rossi beside this", then `]`.
- **What I saw:** nothing happened; the pane has no footer and no list. The identical pane opened
  from the row's "…" menu reads "1 of 4" and walks the four replies.
- **What the brief requires:** chain card 5.
- **Costs:** chain C5 (1) on chain 7.
- **Owner:** `src/ollopa/pages/work/Thread.tsx` (its `openBeside` passes no `list`).

### 8. The contact beside a reply is item 11 of an unlabelled 25-item menu

- **Chain:** 7. **Step:** Inbox row.
- **What I saw:** the full menu, in order: Reply · Book meeting · Hand to an AE · Open the deal ·
  Mark done · Hand to Elena Vasquez · Hand to Priya Raman · **Mark done** · Mark not interested ·
  **Open the deal** · Open contact · four "Change what they meant" · Remove from sequence · Add a
  note · Forward thread · Open in Gmail · Add to list · Mark unread · Select · Mark as spam ·
  Report a misread reply. Two items appear twice.
- **What the brief requires:** mechanic 3 — related things are *found* inside the object;
  disclosure rule 4 — the door is labelled by what is behind it, never an unlabelled icon.
- **Costs:** chain C4 (1) and disclosure D4 (1) on chain 7.
- **Owner:** `src/ollopa/pages/work/Inbox.tsx`.

### 9. A `follow` into Settings without a `?row=` lands with nothing lit

- **Chain:** 6 (also the Queue's "how it was built" link and the Inbox's integrations links).
- **Step:** deal record › "Settings › Pipeline and data".
- **What I saw:** the trail was correct (`Gatehouse Systems ›`) but Settings opened at the top of
  the page with nothing lit and nothing focused — the person has to find the pipeline rules
  themselves. Chain 4's link, which carries `?row=mail.bounce-guard`, lands on the lit row.
  `shots/chains/review/06-deals/91-deal-settings-link-1440.png`.
- **What the brief requires:** stage 2's settings contract — the `?row=` anchor opens the door,
  scrolls and lights the row; chain card 2, applied to arrival.
- **Costs:** chain C2 on chain 6's side trip (I have not docked chain 6 twice for it; it is the
  same class of miss as the others and should be fixed with them).
- **Owner:** `src/ollopa/pages/deal/DealRecord.tsx` and the other callers, not the settings folder —
  the anchors exist, the callers do not pass them.

### 10. A crumb that does not read the way the page did

- **Chain:** 8. **Step:** Templates › a template › the crumb.
- **What I saw:** the crumb reads "Templates and snippets"; the page I left had `h1` "Templates".
- **What the brief requires:** `Origin.title` is "the page's h1 at the time of leaving".
- **Costs:** chain C3 (1) on chain 8.
- **Owner:** `src/ollopa/pages/engage/Templates.tsx`.

---

## Not defects against the brief, but wrong for a real person

1. **On a phone the origin is not visible at all.** The brief says full width on a phone and the
   build does that, so this is not a defect — but it means the first property of the whole
   mechanic ("the origin stays visible while a related thing is read") is simply unavailable to a
   phone user. What survives is that the page is *unchanged*, which is less than the brief's own
   claim. `shots/chains/review/01-sequence/02-pane-400.png`.

2. **Opening the pane pushes the row's own actions off the screen.** At 1440 the sequence table
   loses its Added, Last activity, Pause and Retry columns while the pane is open. You open the
   pane to decide something about that row, and the controls for that row leave.
   `shots/chains/review/01-sequence/02-pane-1440.png` against `01-sequence-1440.png`.

3. **The pane's "Move to …" button picks the destination for you, and changes its mind.** Before I
   clicked it read "Move to Q4 enterprise outbound"; after, the same button read "Move to Warm
   inbound follow-up". There is no picker and no undo in the pane. A real SDR clicking twice would
   move someone twice, through two different sequences, and the page behind would show neither.

4. **On Sequences, Lists and Templates the row name is not a link.** At 1440 it is plain text; the
   row is clickable and focusable but nothing says so, and the only labelled way in is an "Open"
   button sitting beside "Pause" in the last cell. On People, Companies and Campaigns the name *is*
   a control. The product teaches two different rules for the same gesture.

5. **The Meridian AE's company record is labelled three ways at once.** The `h1` reads "Kestrel
   Health · Companies", the back link above it reads "Accounts", and the sidebar carries both
   Companies and Accounts. I could not tell which of the two I was in.

6. **The Tasks page shows one task while the pane counts fourteen.** "1 of 14" is true of the
   queue and false of the screen, which has exactly one task on it.

7. **The quick look on the deals board has no way to the next card.** Every glance costs a close
   and a reopen, which is the scanning task the drawer exists for.

8. **The Inbox menu offers "Open the deal" on replies with no deal.** I did not reach that state in
   the seed, so I am not filing it as a defect, but the menu lists the item twice and the
   no-deal branch in `Inbox.tsx` leaves for `seed.deals[0]` — an unrelated deal — rather than for a
   new one.

---

## What is genuinely good

I want this on the record because most of the mechanic works and the defects above are narrow.

- The trail is honest. It is built only from moves the person made, it dies on sidebar, palette,
  deep link and sign-out, it lives in `sessionStorage` and never in `localStorage`, and it survives
  nothing it should not.
- The return cue is the best part of the build. Six index laps, four chain returns and two
  two-deep returns all landed on the exact row, lit for three seconds, with focus on it, at the
  scroll I left.
- The no-re-render claim is true and checked, not assumed: the counters do not move.
- A half-typed subject and an open door survive a round trip through another record. That is the
  property the whole brief was written for and it works.
- Consequence lines travel into the pane, every time, on every kind of object.
- The company's contact list is the model answer for "related things live inside the object",
  including the sentence that tells you when to leave and what leaving carries.
- The set-up chain, which the brief opened by calling the worst of the five, now runs inside the
  shell and comes back saying "Lists and Sequences left your sidebar".

---

## Scores at a glance

| Chain | Chain card | Disclosure card |
|---|---|---|
| 1 · Sequence › person | **15**/18 | **16**/18 |
| 2 · Campaign › audience › person | **16**/18 | **16**/18 |
| 3 · Company › person | **14**/18 | **16**/18 |
| 4 · Sequence › setting | **17**/18 | **16**/18 |
| 5 · Settings › set-up | **17**/18 | **16**/18 |
| 6 · Deals | **15**/18 | **15**/18 |
| 7 · Inbox, Tasks, Home | **12**/18 | **15**/18 |
| 8 · Index laps | **16**/18 | **16**/18 |
| 9 · Cross-cutting | **17**/18 | **16**/18 |

Nothing is at 18 and 18. The disclosure ceiling in this build is 16 (D2 and D9, both stated at the
top and both arguable as residue); the chain card has real work left on six of the nine.

---

*Reviewer's harness: `scripts/review-chains.mjs`. Logs: `shots/chains/review/logs/`.
Screenshots: `shots/chains/review/`, 180 files, 1440 and 400.*
