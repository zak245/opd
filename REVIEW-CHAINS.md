# Stage 3 review: the chains

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

## How I scored

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

## Chain 1 — Sequence › enrolled person beside › next › previous › open the page › back

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

## Chain 2 — Campaign › audience beside › open the page › a person beside › back › back

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

## Chain 3 — Company › search a person inside it › open beside › act › next › back

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

## Chain 4 — Sequence › sending-rules link › Settings with the row lit › back to the sequence row

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

## Chain 5 — Settings › Change the answers › finish › back to the row with the notice

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

## Chain 6 — Deals board › quick look › open › back; deal › contact beside; deal › company beside

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

## Chain 7 — Inbox, Tasks, Home

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

## Chain 8 — Index laps: Sequences, People, Companies, Lists, Templates, Campaigns

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

## Chain 9 — Cross-cutting

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

# The defect list

## 1. A pane action changes nothing on the page behind it — the page then misreports state

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

## 2. Tasks: the pane and the page disagree about which task you are on

- **Chain:** 7. **Step:** Tasks › contact beside › "Mark complete".
- **What I saw:** the page advanced to "Step 2 of 3 · Send the follow-up" for Kai Kowalski, the row
  highlight moved to Kai Kowalski's row, and the pane carried on showing Ben Novak with
  "1 of 14" — a list that is now 13. `shots/chains/review/07-work/10-task-done-1440.png`.
- **What the brief requires:** chain card 8 and 6; and the pane's own rule that closing after an
  action puts focus on "the row that took its place".
- **Costs:** chain C8 (0) and C6 (1) on chain 7.
- **Owner:** `src/ollopa/pages/work/Tasks.tsx`, with `src/ollopa/beside.ts` (the store has no way to
  be told its target is gone).

## 3. Focus is dropped to the document body on every `follow`

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

## 4. Previous and next walk a page of the list, not the list, and say "10 of 10" for 24

- **Chain:** 3. **Step:** step 4, `]` pressed repeatedly.
- **What I saw:** from the first contact, twelve presses of `]` ended on "10 of 10" while the
  section heading two inches away read "Contacts at this company 24" and the pager read "1–10 of
  24". `shots/chains/review/03-company/90-walk-end-1440.png`.
- **What the brief requires:** chain card 5 — "next and previous when it was opened from a list"
  that "walk that list"; and card 8, never misreport state.
- **Costs:** chain C5 (1) and C8 on chain 3.
- **Owner:** `src/ollopa/pages/companies/CompanyContacts.tsx` (it hands `openBeside` the ids of the
  current page only).

## 5. The deals board's quick look cannot be opened from the keyboard

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

## 6. The pane does not take focus when it is opened from a menu

- **Chain:** 7. **Step:** Inbox › "…" › "Open contact".
- **What I saw:** the pane opened with Cyrus Rossi in it and focus stayed on the "More actions for
  Cyrus Rossi" button, at 1440 and at 400. The frame's `panel.current?.focus()` runs and then the
  dropdown restores focus to its trigger as it closes.
- **What the brief requires:** the pane spec — "Focus moves into the pane on open"; chain card 9.
- **Costs:** chain C9 on chain 7.
- **Owner:** `src/ollopa/ui/Beside.tsx`.

## 7. The same pane has next/previous down one route and not down the other

- **Chain:** 7. **Step:** thread › "Contact details" › "Open Cyrus Rossi beside this", then `]`.
- **What I saw:** nothing happened; the pane has no footer and no list. The identical pane opened
  from the row's "…" menu reads "1 of 4" and walks the four replies.
- **What the brief requires:** chain card 5.
- **Costs:** chain C5 (1) on chain 7.
- **Owner:** `src/ollopa/pages/work/Thread.tsx` (its `openBeside` passes no `list`).

## 8. The contact beside a reply is item 11 of an unlabelled 25-item menu

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

## 9. A `follow` into Settings without a `?row=` lands with nothing lit

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

## 10. A crumb that does not read the way the page did

- **Chain:** 8. **Step:** Templates › a template › the crumb.
- **What I saw:** the crumb reads "Templates and snippets"; the page I left had `h1` "Templates".
- **What the brief requires:** `Origin.title` is "the page's h1 at the time of leaving".
- **Costs:** chain C3 (1) on chain 8.
- **Owner:** `src/ollopa/pages/engage/Templates.tsx`.

---

# Not defects against the brief, but wrong for a real person

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

# What is genuinely good

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

# Scores at a glance

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
