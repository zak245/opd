# The rules of progressive disclosure

*This is the file everything else in OPD points at. Eight rules. Each has the evidence behind it and a one-line test you can run on any screen. The rules change only when someone brings evidence. Jakob Nielsen's definition is the reference: "Initially, show users only a few of the most important options. Offer a larger set of specialized options upon request."*

Full evidence with quotes and links: [knowledge-base/](knowledge-base/).

---

## 1. Hide the rare, never the necessary

Everything most users of this screen need most of the time is visible without a click. Decide by how often a task happens, measured, not by how important it felt in a meeting.

**Test:** For each visible item, can you say what share of users touch it weekly, and where that number comes from?

**Evidence:** Nielsen (2006): "You must disclose everything that users frequently need up front." Pendo (2024): 6.4% of features generate 80% of clicks — that is the **median**, and **best-in-class is 15.6%** *(corrected 14 Sep 2026: see sweep 15)*. So 6% is the shape of a bloated product, not a target. McGrenere and Moore (2000): Word users touched 27% of functions on average, but the range was 3% to 45%, so the head of the distribution is not the same for everyone. Microsoft's adaptive menus failed because "one person's ideal default 'short' menu was exactly the wrong thing for someone else" (Jensen Harris).

**Deciding the split at set-up:** route by the job to be done, not by the job title. Airtable's 2023 experiment seeded role-matched templates from a declared function and got +15% onboarding completion with **−10% sharing and collaboration**; re-cut around the shape of the work (multi-player use cases) it got +15% completion with +10% activation and no regression.

**Consequence:** A daily-use item parked behind a door is disclosure debt. It charges an interaction tax on every visit (Nielsen, 2026). And a low-reach, high-repetition item is a density item, not a door item, so ask what share of the people who touch it at all touch it *daily*.

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

**A density toggle is the one legitimate user-controlled mode.** It asks the user to declare nothing about their skill, changes nothing about what exists or where it lives, is one click, persists and is reversible — the profile of the design above. Salesforce ships Comfy and Compact; AWS Cloudscape mandates that comfortable is the default and that "users can always switch between comfortable and compact mode." Density is a legitimate axis for a mode; capability is not.

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

**Evidence:** Findlater and McGrenere (2004): static menus were significantly faster than adaptive ones; 55% preferred adaptable, 30% adaptive, 15% static. Jensen Harris on Office 2000: adaptive menus made scanning "take twice as long" and were turned off by default. Gajos et al. (2008): adaptive interfaces beat static ones only when prediction accuracy passed roughly 70%. That figure comes from a 2008 study of desktop toolbars; it is the best number available, not a current one, and it has not been re-tested for AI-driven personalisation.

*(Added 14 Sep 2026: see sweep 08.)* Two modern experiments say spatial adaptation loses **at any accuracy**, so the 70% caveat is no longer the main argument. Todi, Bailly, Leiva and Oulasvirta (CHI 2021, 18 participants, 6,480 trials): Static 2283 ms, Frequency 2298 ms, MCTS 2162 ms, with frequency reordering **15% slower** on items outside the promoted head; 15 of 18 noticed the change and two understood it. Gaspar-Figueiredo, Vanderdonckt, Abrahão and Insfran (*JSS* 2025, n=40, EEG): **no significant difference either way**. Relocation costs more than the prediction can repay.

Spool (2011): fewer than 5% of users ever changed a setting, so customisation is not a fix for a bad default. Treat that as a **2011 anecdote about consumer Word** — no post-2018 settings-usage benchmark of any tier exists — and note the boundary: it justifies deleting an unused *capability* setting, not a density control someone uses every second of every day.

**Consequence:** Contextual by object state is fine (a selected chart shows chart tools). If adaptation is used at all, it **adds in place** — highlight, sort, filter, a "Recent" section — and never reorders or removes. It is **offered at a task boundary, not mid-task**, and **reversible in one action**. Post-commit suggestions drew 52% engagement while identical content on a declined edit was dismissed 62% of the time (Kuo et al., 2026), and the acceptance conditions users name are transparency, consistency and reversibility (Kim et al., IUI 2026). Do not interrupt on inferred need: the best "is this user stuck" detector on real enterprise logs reaches 0.27 precision, so three in four interruptions would be wrong. Use a persistent list instead.

## 7. Decision-critical information is never behind a door

Price, fees, commitment, what a destructive action does, how data is used, safety state. All visible without a click. The path to cancel is no longer than the path to subscribe.

**Test:** Without clicking anything, can you find the price, the delete action and any pending approval?

**Evidence:** Nielsen (2026): never hide "price, requirements, risks, privacy terms" behind the second level. Nouwens et al. (2020): moving the reject button off the first page raised consent by 22–23 points. Blake et al. (2021): deferring fees raised spending by 21%. Luguri and Strahilevitz (*Journal of Legal Analysis*, 2021; n=1,963 and n=3,777): disclosing a recurring monthly charge only in "small gray font at the bottom of the page" took acceptance from **14.8% to 30.1%**. The US FTC junk-fee rule (2025) and the UK CMA price-transparency guidance (2025) treat hidden mandatory information as an enforcement target; the FTC's 2022 dark-patterns report names a **tooltip** as the mechanism of a deceptive act.

**Consequence:** Any "conversion lift" from moving a control behind a door must be checked for whether it came from clarity or from suppressed choice — and **satisfaction and complaint data cannot do that check**. In the same study, mild manipulation produced "no discernable emotional backlash," and across 240 apps and 589 users people "do not identify these practices when exposed to them" (Di Geronimo et al., CHI 2020). "We tested it and nobody complained" is not a defence.

**Corollary: disclosure that exceeds review capacity is equivalent to hiding.** *(Added 14 Sep 2026: see sweep 14.)* Shown a problematic agent action and asked to approve it step by step, users saw it **88.5%** of the time and stopped it **23.9%** — a 76% pass-through on things they were explicitly shown (Chen et al., arXiv 2604.04918, n=48). Not inattention: "participants often noticed questionable actions, but treated them as routine." At scale, after an AI-output mandate at one company (802 developers, 196,212 pull requests) human review fell from 89% to 68% while silent approvals stayed near 50%. None of it was behind a door. Budget the reviewer's capacity, not just the pixel.

## 8. Fade the scaffold; give experts accelerators

Doors are scaffolding for the many. People who live on a screen get a way past them: keep sections open by default, keyboard shortcuts, a command palette. Twice a year, look at what nobody opens and delete it, and at what everybody opens and move it up.

**Test:** Can a daily user reach any item in this screen without touching a door? When did you last delete a setting?

**Evidence:** NN/g heuristic 7: shortcuts "unseen by the novice user" speed up experts. Findlater and McGrenere (2010): reduced interfaces improve core-task performance but lower awareness of unused features. Cockburn et al. (2014): users "persistently fail to adopt faster methods" unless the interface pulls them toward them. McGrenere and Moore (2000): users preferred unused functions "tucked away" (45%) over removed (24.5%), so tuck away what some use and delete only what almost nobody uses.

**How the teaching actually works** *(corrected 14 Sep 2026: see sweeps 09 and 13; this replaces "a palette that shows each shortcut every time")*:

- **Hover hints do not teach.** 749 tooltip exposures produced **two** shortcut activations (Harrison, Malacria and Cockburn, IHM 2025); tooltips account for **1%** of shortcut discovery in a survey of 853 people, against 28% for someone showing you over their shoulder (Bailly et al., IHM 2025); and the median in-product tip is opened **once per 1,000 impressions** across 464 companies (Produktly 2026). Budget hints at zero.
- **Temporary full exposure does.** Shortcut usage across three ordered stages went **9.79% → 86.20% with every shortcut exposed → 73.09% after the exposure was removed** (ExposeHK, IHM 2025).
- **Spatial feedforward roughly doubles retention.** Showing commands on a picture of the keyboard rather than in a list held a median of **10 shortcuts at 24 hours against 5.5** (KeyMap, CHI 2020, n=98), with incidental learning for 14 participants against 6. A palette is a list, so its inline hint is the floor, not the ceiling.
- **The only complete promotion trigger anyone has found is removing the old path.** Signifiers on animated transitions changed nothing even at 5,000 ms; 7 of 33 found a hidden widget while an easy alternative existed; when it was removed everyone found it and **none went back** (Mackamul et al., CHI 2025).

**Consequence:** Teach with exposure and spatial feedforward, retire the old route where you can, and treat the palette hint as a floor. The "delete below 3–5%" threshold is a **design convention with no evidence** behind it; no post-2018 study reports what happened after a B2B product removed a feature.

---

## A named pattern: gated features

Permission hiding and plan gating are opposites. A role without permission gets the thing hidden and an explanation of who can grant it. A plan without a feature gets the thing shown, because discovery is the sale.

1. Visible where it would live, with a lock and the plan name. Never moved to a "Premium" section, never removed. **A design position, not a finding** — no experiment has compared a visible lock against the same feature hidden, in either direction, and the versioning-unfairness literature is the one evidence-shaped argument against it.
2. A real control, not a disabled one. It opens a panel: what the feature does, which plan includes it, the monthly cost, one button. (GitLab Pajamas, independently: "Exposing a message to explain why a feature is not available is preferable to disabling the feature.")
3. Explained at the moment of intent, never in a banner or a tour. **Scoped to multi-feature tools where task completion is the business metric.** In consumer subscription apps the opposite holds: hard paywalls converted 12.11% by day 35 against 2.18% for freemium across 75,000 apps, with 82% of trial starts on install day.
4. The price is in the panel, before the button (rule 7 applies to upgrades): **the total for the period, never a breakdown.** Partitioned pricing left consumers underestimating the total by about 11%, worse than drip pricing's 3.2%.
5. Someone who cannot upgrade can ask the admin from the same panel, with the feature named, **the cost, and where the request came from.** The approver is making a price decision, so rule 7 applies to their screen too (Figma's shipped flow carries requester, seat type, cost, origin, reason and time).
6. Safety and decision-critical items are on every plan.
7. **The lock is visible at the entry point, and no gate appears after the user has produced work they cannot keep.** The industry gates at the action rather than the view because sunk effort converts; charging for the exit from work the user has already done is drip pricing.
8. Preview where possible: a gated report shows its shape and its row count. **A design position** — no measurement exists in either direction.
9. Usage still decides the level; a lock does not promote an item.
10. Nothing moves when unlocked (rule 6 of the main eight: spatial stability).

Plans are named by tier, never by audience. And note the measurement trap: the conversion effect of a gate shows up late, not at the gate. Lengthening a free trial from three to seven days moved immediate conversion not at all but delayed conversion **+42.4%** and overall conversion **+20.9%** (Zhang and Duan, 680,588 users, 190 countries, two years). A team judging a gating change on same-session conversion will always prefer the more aggressive gate.

*(Rules 1, 3, 4, 5, 7 and 8 updated 14 Sep 2026: see sweep 12.)*

## A named pattern: the declared sidebar

How a person ends up with the right first screen, without the product guessing.

- **Declared, never inferred.** The sidebar comes from two things a human chose: the seat, declared when the person was invited, and the workspace profile, declared at set-up from three questions about the job to be done, not the title. Both are visible and editable in Settings under "How your team works". Nothing rearranges itself from usage data.
- **The sidebar is a shortcut, never the only route.** Every page stays reachable by ⌘K, by deep link, and from the places its content surfaces (Home, the bell). A page left out by the profile still opens; its header offers "Add to sidebar". Added items go at the end of their group and stay.
- **Three kinds of "cannot see it", never confused.** An object you do not own is readable with edit controls absent. An area outside your role shows a no-access page naming who uses it and who to ask. A page left out by the profile opens and offers the sidebar.
- **Teaching by exposure, not hints.** When a strong signal arrives for a page the profile left out (the first reply for a founder without Inbox), the page appears in the sidebar for two weeks, then asks "keep it?". The answer is final until a new signal, and there is never more than one exposure per period. Hints and tooltips do not teach; temporary exposure does.

Evidence: Office 2000's inferred menus and their two 2021 and 2025 re-tests (spatial adaptation loses at any accuracy); Findlater and McGrenere on user control; GitLab's user-controlled pinning; Airtable's job-to-be-done routing; sweep 09 on exposure versus hints; sweep 11 on deep links as a main route into B2B products.

## A named pattern: the quick look and the record

A record can be disclosed in two levels, and often should be.

- **The quick look** is level one. A flat drawer opened from a table row, keeping the table in view. It shows the few fields a glance needs, in the same order and with the same labels as the top of the full record. Nothing collapses inside it; it is read-only except for the one field the glance exists for (a deal's stage on the board). It serves scanning tasks, where a person moves through many rows and needs a glance at each.
- **The record page** is level two. Everything about the object, from one shared template: header, key fields, related lists as scrolling sections (people at a company, deals, activity), and doors only for long content rarely needed alongside the rest (full history, enrichment data, custom fields, files). At most one tab, for a related table big enough to be a page of its own, with a count in its label; sections otherwise, because tabs hide what a person may need to see side by side. It serves dwelling tasks, where a person has chosen the object and is working on it.
- **The test.** Remove the drawer and you lose only speed. If removing it would lose a feature, it has become a second version of the record, and that is against the rules. Table to drawer is one level, table to page is one level, page to a door or a tab is a second; nothing reaches three because the drawer has no doors and a tab has none.

Evidence: Nielsen's split applied to an object; Shneiderman's overview, zoom, details on demand; NN/g on master-detail and on tabs (only when the two are never needed together); sweep 11 on deep links, which a page can carry and a drawer cannot.

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

What eight years of new evidence did to these rules is in [11 What changed, 2018–2026](knowledge-base/11-what-changed-2018-2026.md). What they still rest on without proof is in [12 Gaps we accept](knowledge-base/12-gaps-we-accept.md).
