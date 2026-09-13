# The rules of progressive disclosure

*This is the file everything else in OPD points at. Eight rules. Each has the evidence behind it and a one-line test you can run on any screen. The rules change only when someone brings evidence. Jakob Nielsen's definition is the reference: "Initially, show users only a few of the most important options. Offer a larger set of specialized options upon request."*

Full evidence with quotes and links: [knowledge-base/](knowledge-base/).

---

## 1. Hide the rare, never the necessary

Everything most users of this screen need most of the time is visible without a click. Decide by how often a task happens, measured, not by how important it felt in a meeting.

**Test:** For each visible item, can you say what share of users touch it weekly, and where that number comes from?

**Evidence:** Nielsen (2006): "You must disclose everything that users frequently need up front." Pendo (2024): 6% of features generate 80% of clicks in the average product. McGrenere and Moore (2000): Word users touched 27% of functions on average, but the range was 3% to 45%, so the head of the distribution is not the same for everyone. Microsoft's adaptive menus failed because "one person's ideal default 'short' menu was exactly the wrong thing for someone else" (Jensen Harris).

**Consequence:** A daily-use item parked behind a door is disclosure debt. It charges an interaction tax on every visit (Nielsen, 2026).

## 2. Stop at two levels

The screen, and one door. Never a door inside a door. Count per channel: a panel, a menu and a command palette can sit side by side, each two deep.

**Test:** From the page, can every item be reached with one click? On a phone too?

**Evidence:** Nielsen (2006): "Designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels." Landauer and Nachbar (1985): breadth beats depth in menus. GitLab Pajamas: three or more levels "suggests the feature needs redesign."

**Consequence:** A third level means the structure is wrong, not the widget.

## 3. Split by task frequency, not user skill

No Basic mode, Advanced mode or Expert mode. Most users are intermediates who stay intermediate. The expert is the same person on a rare errand.

**Test:** Is there any switch that asks the user to say how skilled they are?

**Evidence:** Cooper (1995): most users are "perpetual intermediates" who "generally stay there forever." Nielsen (2026): "Your expert is a regular user having a rare moment. He or she lives on the bench 80% of the time and visits the drawer for the occasional exotic task." Home Assistant (2026) deleted its Advanced and Expert labels because "they implicitly tell users that certain features are not for them."

**Exception with evidence:** A two-interface design the user fills in themselves, one click to switch, starting nearly empty, beat Microsoft's adaptive menus in a six-week field study; 13 of 20 preferred it (McGrenere, Baecker and Booth, 2002). It is the designer-chosen, audience-labelled mode that fails.

## 4. Make the door obvious and honest

The door is labelled by what is behind it, not by who it is for. It sits next to what it reveals, in the reading path, with a chevron and text. It always opens onto something; if it does not apply, it is removed, not disabled.

**Test:** Cover the label. Can you guess what is behind the door? Now read it. Does it say "Advanced", "More" or "Other"?

**Evidence:** Tognazzini: "If the user cannot find it, it does not exist." NN/g (2014): an unlabelled non-standard icon got 0% click-through. NN/g (2016): hidden navigation was used in 27% of desktop cases against 48–50% for visible, task success was more than 20 points lower, and users were at least 39% slower. Microsoft Windows UX Guide: "Progressive disclosure controls should always deliver on their promise. Remove (don't disable) progressive disclosure controls that don't apply in the current context."

**Consequence:** Never hover-only. No touch, no keyboard, and it fails WCAG 1.4.13.

## 5. Keep context across the boundary

Reveal next to the cause. Fields that depend on each other never sit on opposite sides of a door. The door remembers whether you left it open.

**Test:** Is there any pair of fields you edit together that a door separates? Close a door, leave, come back. Is it still closed?

**Evidence:** Cowan (2001): working memory holds about four chunks. Microsoft Fluent 2: "Never put information in one accordion item that needs to be referenced in another accordion item." Microsoft Windows UX Guide: "If a user expands or collapses an item, make the state persist so it takes effect the next time the window is displayed." NN/g: users who must switch between tabs to compare pay a memory and interaction cost.

**Consequence:** Expand in place for short content, a drawer for a heavy subtask that must keep context, a page for an independent task. Provide expand-all and print behaviour for any set of doors.

## 6. Prefer stable, user-controlled disclosure over inferred adaptation

Doors open because the user opened them or because of the state of an object on screen, never because the system guessed from past behaviour. Nothing changes place on its own.

**Test:** Does any item move, appear or disappear based on what the user did last week?

**Evidence:** Findlater and McGrenere (2004): static menus were significantly faster than adaptive ones; 55% preferred adaptable, 30% adaptive, 15% static. Jensen Harris on Office 2000: adaptive menus made scanning "take twice as long" and were turned off by default. Gajos et al. (2008): adaptive interfaces beat static ones only when prediction accuracy passed roughly 70%. Spool (2011): fewer than 5% of users ever changed a setting, so customisation is not a fix for a bad default.

**Consequence:** Contextual by object state is fine (a selected chart shows chart tools). If adaptation is used at all, it adds a "Recent" section; it never reorders or removes.

## 7. Decision-critical information is never behind a door

Price, fees, commitment, what a destructive action does, how data is used, safety state. All visible without a click. The path to cancel is no longer than the path to subscribe.

**Test:** Without clicking anything, can you find the price, the delete action and any pending approval?

**Evidence:** Nielsen (2026): never hide "price, requirements, risks, privacy terms" behind the second level. Nouwens et al. (2020): moving the reject button off the first page raised consent by 22–23 points. Blake et al. (2021): deferring fees raised spending by 21%. The US FTC junk-fee rule (2025) and the UK CMA price-transparency guidance (2025) treat hidden mandatory information as an enforcement target.

**Consequence:** Any "conversion lift" from moving a control behind a door must be checked for whether it came from clarity or from suppressed choice.

## 8. Fade the scaffold; give experts accelerators

Doors are scaffolding for the many. People who live on a screen get a way past them: keep sections open by default, keyboard shortcuts, a command palette that shows each shortcut so they stop needing it. Twice a year, look at what nobody opens and delete it, and at what everybody opens and move it up.

**Test:** Can a daily user reach any item in this screen without touching a door? When did you last delete a setting?

**Evidence:** NN/g heuristic 7: shortcuts "unseen by the novice user" speed up experts. Findlater and McGrenere (2010): reduced interfaces improve core-task performance but lower awareness of unused features. Cockburn et al. (2014): users "persistently fail to adopt faster methods" unless the interface pulls them toward them. McGrenere and Moore (2000): users preferred unused functions "tucked away" (45%) over removed (24.5%), so tuck away what some use and delete only what almost nobody uses.

**Consequence:** The command palette that shows the shortcut every time is the purest form: a door designed to make the user stop needing it.

---

## The review score

Nine questions, scored 0, 1 or 2. A screen needs 16 of 18 to pass.

1. Everything decision-critical is visible without interaction.
2. Every visible item is backed by a usage number with a source.
3. No path exceeds two levels on any screen size.
4. Every door is labelled by content and paired with a chevron and text.
5. Every door sits next to what it reveals and works by keyboard and touch.
6. No mutually dependent information is split across a door.
7. Door state persists; expand-all and print behaviour exist where relevant.
8. Disclosure is driven by user action or object state, never inferred history.
9. Door usage is instrumented and there is a scheduled promote, keep or delete review.

---

## Where the numbers come from

OPD has no product analytics behind it. Every split in a case is an opinionated decision backed by published data: Nielsen's 80/20 shape, Pendo's feature-adoption benchmarks, McGrenere and Moore's Word study. Field-level percentages are illustrative, fitted to that published shape, and each screen names its source. They do not have to be real. They have to be right.
