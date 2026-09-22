# Design system rules

What a builder may not decide alone. Each rule names the evidence behind it ([memo 26](knowledge-base/sources/26-action-hierarchy-and-consequence-text.md) unless stated). Where the design systems disagree, the choice here is ours and is marked as such. The primitives in `src/ollopa/ui/` encode these rules so that a page cannot pick a variant by hand.

## 1. Actions

**Kinds.** Every control is one of four kinds, and the kind decides how it is drawn, never the builder:

| Kind | What it is | Drawn as |
|---|---|---|
| primary | The one act the surface exists for | Filled |
| secondary | Other acts the person came for | Outline |
| destructive | An act that cannot be undone, or removes something | Text in the destructive colour, low emphasis, last, separated |
| link | A destination, not a state change | A real link, underlined on hover, never a button |

**One primary per surface.** A surface is any bounded region that holds its own acts: a page header, a page section or body, a pane, a dialog, a card, a queue footer, a bulk bar. One filled control on it. Two comparable acts are both secondary. Three or more comparable acts all drop to low emphasis (a group or a menu). Emphasis comes from fill and colour, never from size or width. Full width only on a phone sheet. (Agreed across Material, Fluent, Polaris, Carbon, Pajamas, Atlassian; Apple allows two, we take one.)

**Destructive is never the primary**, except inside its own confirmation, where the affirmative button is the destructive act with the verb in its label ("Archive the deal", never "OK"). (Carbon and Pajamas require this; Apple forbids a destructive primary on the surface; we take both.)

**Order.** In a row, primary first, then secondary, then the destructive act after a gap. In a dialog the affirmative sits at the trailing edge. In a menu, groups are labelled, related objects first, destructive last.

**An act that is not available here shows no control.** Not a disabled button and never a live-looking button that does nothing: one sentence naming who or what makes it available ("Owned by Dev Dubois; only the owner or an admin can close it"; "Used by Onboarding week 1; delete that campaign first"). The sentence names a different person or thing from the one already on screen, or it names nothing. A control is disabled only for object state the person can change right here (nothing selected, a field empty), with the reason beside it. (RULES.md rule 4; Windows UX guide "remove, don't disable".)

**What a pane may carry.** At most three acts, the ones the chain runs most for that seat, gated by the usage model like the fields. Irreversible acts stay on the record page; the pane offers "Open the page" for them. Navigation in a pane is a link.

## 2. Confirmation, consequence and undo

**Confirm on reversibility, not on danger.** An act gets a confirmation only if it cannot be undone (a send, a payment, a delete that leaves nothing to restore, a merge). A reversible act, however large, acts at once and offers undo. Routine confirmations teach people to click through them. (NN/g; Apple's own example is not confirming a deleted email; Chen et al. 2026 measured worse performance without confirmation on irreversible acts, so the gate stays where it belongs.)

**A delay can make an irreversible act reversible, and then it needs no confirmation.** A send that leaves ten seconds to undo before it goes is a reversible act: it acts at once, shows "Sent · Undo" where it was caused, and asks nothing first. This is the pattern for the acts a lap repeats all day (send a reply, complete a task), where a confirmation would cry wolf. An act with no such delay (a payment, a merge, a delete with nothing to restore) still confirms. (Chosen here; NN/g on routine confirmations.)

**Undo is in addition to confirmation, never instead.** Every act that can be undone shows "Done · what happened · Undo" where it was caused, for ten seconds, through the shared edits store. (Shneiderman's easy reversal; memo 21 on cost that lands where caused.)

**Where the consequence goes.** Beside the button: one line, at most about twelve words, only when the act spends something (credits, sends) or cannot be undone. Everything else the act ripples into goes inside the confirmation, above the affirmative button, and into that button's label. Nothing goes under a reversible, free act. (Nielsen 4.4 seconds per hundred words; added prose is read at about a fifth.)

Examples:

- Right: `Reveal the phone · 8 credits` with the line "Charged once".
- Right: `Close won` on the page, opening a confirmation that reads "Stage becomes Closed won. HubSpot is updated. Cedar Systems hands off to customer success." with the affirmative `Close won`.
- Wrong: `Close won` in a pane with three sentences under it and no confirmation.
- Wrong: `Draft an email` with "Sends 1 email to Mateo from marcus@meridian.io. Replies land in your Inbox" under it. Drafting sends nothing; the line belongs on Send.

## 3. Text around controls

**Three reasons a sentence may exist next to a control, and no fourth:**

1. The act spends or cannot be undone (one line, section 2).
2. The act is not available here, and the sentence names who or what makes it available.
3. A count on screen would otherwise mislead ("One at a time. 13 more behind this one").

Everything else is education, and education lives on the library site, never in the product. A label carries a count, not a sentence. A field shows a value, not a note about the value. A door is labelled by what is behind it. Helper text, when one of the three reasons allows it, is persistent and below the control; placeholder text is never used to explain. (Design-system agreement; Nielsen on reading.)

**The test.** Cover every sentence on the surface with your hand. If the person can still do the task, delete the sentence.

## 4. The visual grammar of controls

The same act must look the same and sit in the same place everywhere, because the measured memory people have for controls is memory for position and for colour meaning, not for shape (memo 21: locations known to within 92 px; a known location worth about a 37% time saving; [memo 27](knowledge-base/sources/27-button-anatomy-states-and-placement.md) for the anatomy and state rules). Values are for our tokens in `src/index.css` and `src/components/ui/button.tsx`; the `Actions` primitive applies them by surface so a page never sets a size or a variant.

**Size, one per surface.** Page header and dialog: the default height (36 px). Pane, card, row, bulk bar, queue footer: the small height (32 px). The extra-small size is for chips and pagers, never for an act. Emphasis never comes from size. On a phone every act has a hit region of at least 44 px whatever its drawn height (Apple 44 pt, Material 48 dp; WCAG 2.5.8 sets a floor of 24 px, which is too small for a lap).

**Shape.** Two radii and no others: 8 px on controls (buttons, inputs, chips), 10 px on containers (cards, panes, dialogs). No pills. The label sets the width; a label is never truncated. Full width only on a phone sheet (section 1).

**Labels.** Verb first, sentence case, no end punctuation, the object named when it is not obvious: "Add to list", "Mark won", "Set the next step". The same verb for the same act on every surface. A count travels in the label ("Approve 6 · 156 credits"); a sentence never does.

**Icons.** No icon inside an act's button; the label is the icon. Icon-only controls are allowed for exactly three things, the "…" menu trigger, close, and the pane's previous and next, and each carries an accessible name and a tooltip. (Chosen: Pajamas forbids icon plus label; Carbon puts icons right; we avoid the question.)

**States, and how each looks.** Rest: as the kind draws it. Hover: the fill or outline one step darker, nothing moves. Focus-visible: a 3 px ring that reaches 3:1 against both themes (WCAG 1.4.11), so the ring token gets a hue of its own rather than the grey it has today. Pressed: one step darker again, no scale. Loading: the label stays, a spinner joins it at the leading edge, the width does not change, and the control accepts no second press. Disabled: only for object state the person can change here, with the reason beside it, never a tooltip on a disabled control (chosen against Fluent, with Atlassian).

**Colour has one meaning each.** The primary fill is neutral (near-black on light, near-white on dark) and belongs to the one primary act. The destructive hue belongs to destructive acts and their confirmations and to nothing else. Success is a text colour for "Done · Undo" feedback and is never a button (chosen: only Pajamas ships a success button). Warning belongs to ribbons and the health strip. No other element may borrow any of the four.

**Placement, one place per surface type.** Page header: the acts row sits at the right of the title, primary first (leftmost in the row), then secondaries, then the destructive act in the "…" menu. Pane: a stack under the fields, primary first, destructive absent by rule. Card and row: the acts at the trailing edge of the card or row, primary first. Dialog: the affirmative at the trailing edge, Cancel before it. Bulk bar and queue footer: primary first at the leading edge. Form and settings panel: the Save bar at the bottom, Save at the leading edge (GOV.UK and Polaris left-align full-page forms). This map does not change by page or by seat; it is what the eye learns.

**Motion.** Hover and press change colour in about 100 ms. "Done · Undo" fades in over 150 ms where the act was caused. Nothing slides, scales or bounces on a control, and all of it stops under `prefers-reduced-motion`.

## 5. Visual identity: colour, place, depth and type

Agreed with the owner on 22 September 2026 from [memo 28](knowledge-base/sources/28-visual-identity-colour-and-wayfinding.md). The product was monochrome and two type sizes; every page looked alike and people navigated by reading. These rules give the eye something to recognise. Tokens live in `src/index.css`; the family registry in `src/ollopa/identity.ts`; the shell and the primitives apply them, so a page never picks a hue.

**Colour has five jobs and nothing else may use colour.**

1. *Structure.* Backgrounds, borders, body text: neutral, slightly warm, never pure grey. Most of every screen, on purpose.
2. *The accent.* One hue, indigo, for "act here" and "you are here": the primary fill, the active sidebar item, links, the focus ring, informational status. Nothing else is indigo.
3. *Object families.* Six, each a fixed icon plus a fixed hue, always together, the same everywhere the thing appears (sidebar, row, chip, pane top bar, crumb, empty state). Used small: an icon, a thin bar, a tinted chip. Never a large fill.

   | Family | Holds | Icon | Hue (oklch) |
   |---|---|---|---|
   | People | person, list | Users | 200 teal |
   | Companies | company, account | Building2 | 295 violet |
   | Deals | deal | Columns3 | 55 ochre |
   | Engagement | sequence, template, campaign, audience, form, workflow | Send | 335 magenta |
   | Work | reply, task | Inbox | 120 olive |
   | Agents | agent, agent run, approval | Bot | 15 terracotta, low chroma |

   Settings, Reports and Home are neutral with their own icon.
4. *Status.* Five, used only for state and never for decoration or for a family: danger (27, red), warning (75, amber), success (150, green), info (the accent), paused (neutral). A status is always a chip or a line with a word.
5. *Nothing else.* Every colour passes the swap test: swap two and something must read wrong.

**Colour never works alone.** A family always has its icon; a status always has its word. Text 4.5:1, icons and borders 3:1, checked with a colour-vision simulation before shipping.

**You know where you are three ways at once.** The page title carries its family icon and hue. The active sidebar item is filled with the accent tint and a leading bar. The trail crumb carries the family icon of the page you left. A pane carries its object's icon and a thin top bar in its family hue.

**Depth has three levels.** The page; raised (cards, panes, the row you are on); overlay (dialogs, menus). Group with space first, then a border, then a tint; shadow only on the overlay level. In dark, higher is lighter.

**Type has five sizes and uses them.** Title 24, section and record title 18, body 14, label 13, small 12; one declared typeface (Inter, system fallback); tabular numbers in columns; hierarchy from size and weight, not from more space. Density unchanged.

**Icons are one set, one size per place.** Family icons are never reused. 16 px in rows and chips, 20 px in headers. Every icon has a label except the menu trigger, close, previous and next.

**Both themes derive from one set of role tokens.** A family and a status look like themselves in both; the person picks the theme.

**Order of application.** Tokens, the family registry and the shared pieces first; then Home, People with a pane open, and a deal record in both themes for the owner to see; then every page.

## 6. What is still open

Where the sources disagree and we have not needed to choose: dialog button order beyond the affirmative at the trailing edge; whether a low-severity destructive act (remove from a list) needs the destructive colour at all. Decided if and when a screen forces it.
