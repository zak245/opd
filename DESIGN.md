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

## 4. The look comes from shadcn, as shipped

Decided by the owner on 23 September 2026 after three failed attempts to invent a surface and elevation system. The library already solves the visual problems: the sidebar, cards, tables in cards, sheets, dialogs, menus, their shadows, radii, spacing and type. We use those components as their documentation shows them and do not override their internals. Nothing in this repository defines its own surface levels, shadow scale, radius scale or spacing scale.

What we keep on top of the library, because it carries meaning rather than looks:

- The action kinds and their rules (sections 1 to 3), applied through `Actions`, which draws with shadcn's `Button` variants.
- The colour jobs of section 5: shadcn's own variables carry the neutrals and the accent; our additions are the six family colours, the five statuses and success, each with one meaning.
- Five type sizes as utilities, used for hierarchy; nothing else sets a size.
- Disclosure (`RULES.md`) and the chain mechanics (`BUILD-CHAINS.md`): the door, the pane, the trail, the edits store. They decide what is on a surface and how a person moves; the library decides what the surface looks like.

Containers are shadcn `Card`s, with the toolbar in the card header and the pager in the footer for a table, one card per section on a page like Home, a card per thing only where each thing is read on its own. The nav is the shadcn `Sidebar`. The pane, quick look, dialogs, sheets, popovers and menus are the library's, with the library's elevation.

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

**Type has five sizes and uses them.** Title 24, section and record title 18, body 14, label 13, small 12; one declared typeface (Inter, system fallback); tabular numbers in columns; hierarchy from size and weight, not from more space. Density unchanged.

**Icons are one set, one size per place.** Family icons are never reused. 16 px in rows and chips, 20 px in headers. Every icon has a label except the menu trigger, close, previous and next.

**Both themes derive from one set of role tokens.** A family and a status look like themselves in both; the person picks the theme.

**Order of application.** Tokens, the family registry and the shared pieces first; then Home, People with a pane open, and a deal record in both themes for the owner to see; then every page.

## 6. What is still open

Where the sources disagree and we have not needed to choose: dialog button order beyond the affirmative at the trailing edge; whether a low-severity destructive act (remove from a list) needs the destructive colour at all. Decided if and when a screen forces it.
