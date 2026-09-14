# Principles, Decision Framework and Checklists

*The operational layer. Use this when designing or reviewing a screen, a settings area, a wizard, an onboarding flow or an "Advanced" section in a complex B2B application. Rationale and sources are in [00-core-model.md](00-core-model.md) and the [sources/](sources/) memos.*

---

## 1. The eight laws, expanded

### Law 1: Hide the rare, never the necessary

- Everything most users need most of the time is level 1. Nielsen: "You must disclose everything that users frequently need up front."
- "Frequently" is measured, not guessed: per-segment weekly usage from analytics, field studies, support logs, a Top Tasks vote (McGovern).
- Microsoft's lesson from adaptive menus: the *aggregate* head of the usage distribution is not any *individual's* head. "One person's ideal default 'short' menu was exactly the wrong thing for someone else" (Jensen Harris). Segment by role and account before hiding.
- Any level-2 feature with more than roughly 20% weekly use in a segment is **disclosure debt** for that segment. Promote it.
- Corollary from Pendo's data: a level-1 surface sized to the empirical head is small. The risk is not that level 1 is too big; it is that the wrong things are on it. *(Corrected 14 Sep 2026: see sweep 15.)* **6.4% is the median and 15.6% is best-in-class**, so 6% describes a bloated product, not a target. Pendo "features" are customer-chosen tags, not comparable to McGrenere and Moore's exhaustive 265-function inventory.
- Ask a second question before dooring anything: not only *what share of users touch it weekly* but **what share of the people who touch it at all touch it daily**. A low-reach, high-repetition command is a density item, and aggregate frequency data will delete it (sweep 13). The tax on a dense screen is paid in fixations, not clicks (Khairat et al., JAMIA 2026).
- At set-up, route by the **job to be done, not the job title**: Airtable's role-matched templates bought +15% onboarding completion at −10% collaboration until they were re-cut around the shape of the work (sweep 10).

### Law 2: Stop at two levels

- Nielsen: designs "that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels." Pajamas: "three or more suggests the feature needs redesign."
- Count levels per channel, not globally. A complex tool can have a contextual panel, a contextual menu and a command palette side by side, each two levels deep, as Figma does.
- Watch for **disclosure drift across breakpoints**: a level-1 feature on desktop that becomes level 2 on tablet and level 3 on phone silently breaks the rule on the device where interaction cost is highest. Change layout, not availability.
- Nested accordions, accordion-inside-tab-inside-drawer, and Settings > Advanced > More > Developer are all violations.

### Law 3: Split by task frequency, not by user skill

- "Your expert is a regular user having a rare moment. He or she lives on the bench 80% of the time and visits the drawer for the occasional exotic task" (Nielsen 2026).
- Do not build Basic/Advanced or Expert modes. They assume a stable population of experts that Cooper's bell curve says barely exists, create mode errors ("I can't find it because I'm in the wrong mode"), and become support boilerplate ("Do you have Advanced mode enabled?").
- Do not label doors by audience. "Advanced settings" → "Additional settings" or, better, the content: "Network settings," "Retry and error handling." Audience labels "discourage exploration" (Home Assistant, 2026).
- Where two representations genuinely exist for two skill levels (visual query builder vs code), keep them **synchronised on the same artifact**, make switching a two-way door, and let the simpler mode teach the expert one (Grafana's Builder/Code with "Explain").
- The exception with field evidence is a **user-personalised** two-interface design (McGrenere et al., CHI 2002): the user fills the reduced layer, the toggle is one click, the reduced layer starts nearly empty, and role-seeded defaults cover the third of users who will not customise. It is the designer-chosen, audience-labelled mode that fails.
- **A density toggle is the one legitimate mode** *(added 14 Sep 2026: see sweep 13)*. It declares nothing about skill, changes nothing about what exists or where it lives, is one click, persists, and is reversible. Ship an admin default plus a per-user override, default to comfortable, and guarantee the switch (Salesforce Display Density; AWS Cloudscape: "Ensure users can always switch"). Density is a legitimate axis for a mode; capability is not.

### Law 4: Make the door obvious and honest

- Every trigger is a foraging decision; its label is the only scent the user has. Name it for what it reveals. Show a count or preview where possible ("3 more filters," "Show 12 hidden columns").
- Icon rules from the evidence: a chevron/caret is the safest disclosure icon; a plus performs no better than no icon; a right-facing arrow reads as navigation; always pair the icon with text (0% click-through on an unlabelled non-standard icon). Keep disclosure icons (chevron, fold, ellipsis for "more of this") distinct from menu icons (caret, kebab for "other actions"), as GitHub Primer does.
- Place the trigger in the primary reading path, adjacent to the content it controls, large enough to hit (Fitts). Right-rail and screen-edge triggers fall into banner-blind zones.
- A disclosure control "should always deliver on its promise." Remove, do not disable, triggers that do not apply in the current context (Microsoft Win32 UX Guide; Zapier hides polling settings for instant triggers).
- Never rely on hover as the sole trigger: no touch equivalent, no keyboard equivalent, WCAG 1.4.13 obligations, and a narrow timing window (0.3–0.5 s) between accidental activation and sluggishness.

### Law 5: Keep context across the boundary

- Reveal next to the cause. Expand in place where the content is short; use a drawer when the subtask is heavy but must stay in the context of the main task; use a page when it is an independent subtask.
- Never separate mutually dependent information. Fluent: "Never put information in one accordion item that needs to be referenced in another." Cowan's four chunks will not survive the trip.
- Persist expand/collapse state across visits ("If a user expands or collapses an item, make the state persist," Microsoft).
- Avoid disorienting the user's point of focus; animate reveals (150–240 ms) and offer a reduced-motion crossfade; move focus into large disclosed regions.
- Provide "Expand all / Collapse all" for any set of accordions, and print CSS that expands everything.

### Law 6: Prefer stable, user-controlled disclosure over inferred adaptation

- Users prefer control (Findlater & McGrenere, CHI 2004: static beat adaptive on speed; most preferred adaptable). Shneiderman: machine-initiated changes conflict with "user desires for consistency, predictability, and control."
- Context by **object state** (a selected chart shows chart tools; a draft record shows draft actions) is deterministic and predictable. Reordering by **usage history** destroys spatial memory and doubles scan time (Office 2000).
- If you must adapt, **add in place** (highlight, sort, filter, a "Recent" or "Suggested" section) rather than reorder or remove, and keep the canonical location stable. Ephemeral adaptation (predicted items appear first, the rest fade in) preserves spatial stability and is the one adaptive technique shown to beat static menus (Findlater et al., CHI 2009).
- AI-driven "smart" disclosure needs demonstrable prediction accuracy above roughly 70% before it beats a good static layer (Gajos et al., CHI 2008), and must be visibly signalled: a third of users in the Word field study never noticed the menus were adapting. *(Added 14 Sep 2026: see sweep 08.)* That threshold has **never been re-tested**, and it is no longer the main argument: **spatial adaptation loses at any accuracy.** Todi et al. (CHI 2021, 18 participants, 6,480 trials) found frequency reordering no faster than static and 15% slower on the tail; Gaspar-Figueiredo et al. (*JSS* 2025, n=40, EEG) found no significant difference either way.
- Two further conditions: adaptation is **offered at a task boundary**, not mid-task (52% engagement post-commit against 62% dismissal on a declined edit, Kuo et al. 2026), and **reversible in one action** (users treat the undo as calibration, Kim et al., IUI 2026). Do not interrupt on inferred need — the best "is this user stuck" detector on real enterprise logs reaches 0.27 precision. Use a persistent list.
- Expect fewer than 5% of users to customise anything. Customisation is not a fix for a bad default split. *(Corrected 14 Sep 2026: see sweep 15.)* Spool's figure is a 2011 anecdote about consumer Word and there is **no post-2018 settings-usage benchmark of any tier**. It justifies deleting an unused capability setting, not a density control, and only when the control was discoverable and the number was measured (Firefox Proton is the cautionary case).

### Law 7: Decision-critical information is never behind a door

- Price, mandatory fees, commitment length, consequences of a destructive action, data use, safety and compliance state: level 1 by definition.
- Symmetry test: the path to undo, cancel or reject must be no longer than the path to do, subscribe or accept.
- Any "conversion lift" from moving a control to a second level must be audited for whether it came from clarity or from suppressed choice (Nouwens et al.: +22–23 points consent from hiding "reject"; Luguri & Strahilevitz 2021: hiding a recurring charge in small grey text took acceptance from 14.8% to 30.1%). Regulators (FTC junk-fee rule 2025, UK CMA/DMCC guidance 2025, EU DPAs) treat this as enforcement territory.
- *(Added 14 Sep 2026: see sweeps 12 and 14.)* **Satisfaction and complaint data cannot perform that audit.** Mild manipulation produced "no discernable emotional backlash," and across 240 apps and 589 users people "do not identify these practices when exposed to them" (Di Geronimo et al., CHI 2020). "Nobody complained" is not evidence.
- **Disclosure that exceeds review capacity is equivalent to hiding.** Shown a problematic agent action and asked to approve it, users saw it 88.5% of the time and stopped it 23.9% (Chen et al., n=48) — rationalisation, not inattention. At scale, human review of pull requests fell from 89% to 68% under an AI-output mandate while silent approvals held near 50%. Budget the reviewer's capacity, not just the pixel. Where price is involved and cannot be known in advance (agent token spend varies up to 30× per run), show a running meter and a spend cap rather than a pre-action estimate.
- Show a **total per period, not a component breakdown**: partitioned pricing left consumers underestimating the total by about 11%, worse than drip pricing's 3.2% (CMA).

### Law 8: Fade the scaffold; give experts accelerators

- Scaffolding theory says support is withdrawn as it becomes unnecessary. Let users keep sections open by default, remember it, and offer "show all options" as a persistent preference.
- Experts get keyboard shortcuts, command palettes, bulk actions and scripting. *(Corrected 14 Sep 2026: see sweeps 09 and 13 — this replaces "disclosed by repeated exposure ... a palette that shows the shortcut every time".)* **Hover hints do not teach**: 749 tooltip exposures produced two shortcut activations, tooltips explain 1% of shortcut discovery in a survey of 853 people (against 28% for being shown over someone's shoulder), and the median in-product tip is opened once per 1,000 impressions. **Temporary full exposure does**: shortcut usage went 9.79% → 86.20% with everything exposed → 73.09% after removal (ExposeHK, IHM 2025). **Spatial feedforward roughly doubles retention**: a keyboard map held median 10 shortcuts at 24 hours against a list's 5.5 (KeyMap, CHI 2020, n=98). A palette is a list, so its inline hint is the floor, not the ceiling.
- **The only complete promotion trigger anyone has found is removing the old path.** Signifiers changed nothing even at 5,000 ms; 7 of 33 found a hidden widget while an easy alternative existed, everyone found it once the alternative was gone, and none went back (Mackamul et al., CHI 2025). Making errors cheap did not work either (Goguey et al. 2019).
- Audit level 2 semi-annually. For each item: promote (heavily used), keep tucked away (used by a meaningful minority; users prefer this to removal by 45% to 24.5%, McGrenere & Moore 2000), or delete (fewer than roughly 3–5% deviate from the default across all segments). *(Corrected 14 Sep 2026: see sweep 15.)* **The 3–5% threshold is a design convention with no evidence** — no post-2018 study reports what happened to churn, support volume or task time after a B2B product removed a feature. Check repetition before reach: experts reject the removal of items from paths their hands already know.
- Hidden features are not learned (Findlater & McGrenere 2010), and an AI that does the task hides the interface more completely than any panel: guided assistance beat automatic on completion 88.5% to 35% and on accuracy 82% to 12% (Khurana et al., CHI 2025). Add awareness mechanisms: command search, contextual recommendations (CommunityCommands produced 2.1× more useful suggestions than prior techniques), layered contextual help (ToolClips: 7× more unfamiliar tasks completed than online help), and a route to a human — an expert answers a short question in about 57 seconds where the forum median is 10.83 hours.

---

## 2. Decision framework

### 2.1 Should this element be disclosed at all?

```
Is it decision-critical (price, consequence, safety, data use)?
  yes → Level 1. Stop.
Is it needed by most users of this screen, most of the time (per segment)?
  yes → Level 1.
Is it needed by some users, some of the time?
  yes → Level 2 via a labelled trigger. Choose container (2.3).
Is it needed by almost nobody (<3–5% deviate from default)?
  yes → Candidate for deletion. Do not hide; remove or default.
Is it needed by a specific role only?
  yes → Scope by role (separate area or permission), with visible
        explanation when absent; do not use disabled state.
```

### 2.2 Which kind of disclosure?

| Situation | Pattern | Notes |
|---|---|---|
| Rarely used options on a task screen | "More options" section / details element | Label by content; expand in place; persist state |
| Options only meaningful after a prior answer | Conditional field (responsive disclosure) | Keep it to one simple follow-up; place directly after trigger; announce state |
| Tools only meaningful for a selected object | Contextual panel / contextual tab / contextual toolbar | Keep a stable route to the same commands (a menu) |
| Row-level secondary detail in a table | Expandable row or quick-view drawer | Not if detail is needed for every row (use columns) |
| Heavy subtask that must keep page context | Drawer / side panel | Modal drawer follows dialog focus rules |
| Independent subtask | Separate page | With breadcrumb/back |
| Rare, unfamiliar, multi-step process (setup, SSO, billing) | Wizard (staged disclosure) | Not for repeated daily tasks; show steps; allow exit and resume |
| Many commands, repeat use, speed matters | Command palette + shortcut hints | Keep a visible trigger; only after the plain path is strong |
| Long reference content, users need only parts | Accordion (mobile) / headings and anchors (desktop) | Desktop accordions cost more than scrolling when most content is needed |
| First use, empty data | Empty state with in-context guidance | Optional, dismissible; never a mandatory tour |
| Feature education over time | Contextual "pull" help triggered by behaviour | Not front-loaded tours |
| Actions user is not permitted to perform | Hide with explanation | Server-side enforcement regardless |
| Features on a higher plan tier | Visible but unobtrusive (badge, lock) with contextual upsell at moment of intent | Opposite policy from permission hiding; goal is discovery |

### 2.3 Container selection

- **Non-interactive supplementary text** → tooltip (hover and focus; WCAG 1.4.13).
- **Interactive supplementary content, small** → popover / toggletip (click-triggered).
- **Related content the user chooses to see, in flow** → accordion / details / expandable row.
- **Subtask in context of main task** → drawer.
- **Critical information or irreversible decision** → modal (not a disclosure).
- **Independent, substantial, or complex** → separate window or page (Microsoft's test).

---

## 3. Per-pattern checklists

### Accordion / details / expandable section
- [ ] Content is needed by only some users; users needing most content get an expanded page instead
- [ ] No nested accordions; no required task information inside
- [ ] Multiple panels can be open at once (no forced auto-collapse) unless the task is strictly one-at-a-time
- [ ] Entire header is the hit target; header is a `button` inside a heading; `aria-expanded` and `aria-controls` set
- [ ] Chevron plus descriptive label; consistent icon placement
- [ ] "Expand all / Collapse all" present; state persists; print CSS expands all
- [ ] Collapsed text is searchable (`hidden=until-found` or native `details`)
- [ ] Mobile: sticky headers, Back collapses rather than exits

### "Advanced" / "More options" section
- [ ] Label describes content, not audience
- [ ] Defaults inside are safe and correct (most users will never open it)
- [ ] Section is removed entirely when inapplicable in the current context
- [ ] No mutually dependent field is split between visible and hidden
- [ ] Usage instrumented: open rate, per segment; any item >20% weekly use is promoted

### Conditional field (responsive disclosure)
- [ ] One simple, related follow-up per trigger; complex follow-ups go to the next page
- [ ] Revealed field directly follows its trigger in DOM order
- [ ] Show/hide is announced (aria-expanded on the control or a live region); GOV.UK documents a 4.1.2 failure otherwise
- [ ] Not used with inline yes/no radios

### Contextual panel / toolbar / tab
- [ ] Triggered by object state, never by inferred user behaviour
- [ ] Same commands reachable from a stable location (menu, palette)
- [ ] Appearance is noticeable (animation or emphasis) to defeat change blindness
- [ ] Disappearance does not strand the user mid-action

### Wizard (staged disclosure)
- [ ] Process is rare or unfamiliar; not a daily task
- [ ] Steps are independent; no need to alternate between steps
- [ ] Progress shown in text, not only visual step dots; descriptive button labels, not "Next"
- [ ] Exit and resume supported; answers saved as you go
- [ ] Funnel instrumented: step abandonment and backtracking

### Overflow / contextual (right-click) menu
- [ ] All commands also reachable from visible UI; gesture-only menus are not the sole route
- [ ] Under 10–12 items, ordered by frequency, destructive actions below a divider
- [ ] Ellipsis or caret signals availability; no gear or hamburger for item-level actions
- [ ] Disable rather than hide irrelevant items *inside* a menu (so the menu is stable)
- [ ] `aria-haspopup`, `aria-expanded`, keyboard open and navigation

### Hover-revealed row actions
- [ ] Actions also appear on keyboard focus (`:focus-within`), remain in DOM, and have a persistent overflow-menu route
- [ ] On touch, always visible or behind an explicit menu

### Command palette
- [ ] Visible trigger (search box with the shortcut hint), not only the keystroke
- [ ] Each command shows its shortcut, and the product also teaches by temporary exposure or spatial feedforward, since hover hints alone do not teach (sweep 09, KeyMap 2020)
- [ ] Introduced only after the plain path is strong
- [ ] Combobox/listbox semantics; result counts announced

### Tooltip / popover
- [ ] Tooltip content is non-essential; task can be completed without it
- [ ] Triggers on focus as well as hover; dismissible with Escape; hoverable; persistent (WCAG 1.4.13)
- [ ] Interactive content uses a click-triggered popover, not a tooltip

### Role / permission-based visibility
- [ ] Hidden, not disabled, when the user lacks permission; explanation shown where the capability is obtainable
- [ ] Server-side enforcement independent of UI
- [ ] Admin-composed disclosure (page builders) shipped with good defaults; expect most admins not to customise

### Onboarding
- [ ] Pull (contextual, behaviour-triggered) over push (front-loaded tour)
- [ ] Every hint dismissible and recallable
- [ ] Setup steps triaged: Eliminate / Delay / Mission-critical; delayed steps surface contextually
- [ ] Measured by activation, time-to-first-key-action, time-to-value, feature adoption, drop-off

---

## 4. Measurement plan

### 4.1 Before build
1. **Card sort / Top Tasks vote** to propose the primary/secondary split. Expect a "long neck": a handful of tasks carry most votes.
2. **Tree test** the proposed hierarchy. *(Corrected 14 Sep 2026: see sweep 11.)* Benchmark, do not target: across **98 tree-testing studies the median task success is 62%, IQR 37–83%** (Albert & Tullis, via NN/g 2024), with the rubric Poor <40 / Fair 41–60 / Good 61–80 / Very Good 80–90 / Excellent >90 and 50+ participants per tree. The old ">70–80%" was set without evidence and sits above the industry norm; if you use it, label it an aspiration. Directness has no published benchmark — read it as a diagnostic.
3. **First-click test** the level-1 screen (right first click ≈ 87% success vs ≈ 46% wrong; Bailey & Wolfson 2006, old and not independently retrieved). Test on the live build where you can: static-prototype first clicks differ from live-site clicks by about 6%, and the largest gaps come from hover menus and responsive shifts — exactly where disclosure lives — so a mock systematically understates the cost of hiding.

### 4.2 After launch
4. Instrument every disclosure trigger: open rate, time-to-first-open, per segment.
5. Feature adoption per segment; flag level-2 items above ~20% weekly use as disclosure debt.
6. Wizard funnels: step abandonment and backtracking rate.
7. Behavioural signals for A/B variants: task completion (primary), dead clicks, rage clicks, scroll depth, quick-backs (secondary).
8. Quarterly SUS or UMUX-Lite plus task-success benchmark. SUS average is 68; use difficulty ratings alongside behaviour.
9. Accessibility audit of disclosure components each release.
10. **Extended learnability**, not only first-session success (Grossman, Fitzmaurice & Attar, CHI 2009): do users move from level 1 to level 2 over weeks? Track awareness (do they know a feature exists), locating (can they find it), and transitioning (do they adopt faster methods). A layered UI that scores well on day one and flat at week six has created an expertise plateau.

### 4.3 What not to measure with
- Click counts (no correlation with success or satisfaction; Porter 2003, Laubheimer 2019).
- Satisfaction ratings alone (aesthetic-usability effect masks lost findability).
- Time-in-app (rewards friction; B2B PD is justified by task completion).
- "Decision fatigue" as a biological claim (the ego-depletion effect failed pre-registered replication); use satisficing and interaction cost instead.

---

## 5. Anti-pattern catalogue

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Basic / Advanced / Expert mode toggle | Targets a population that barely exists; mode errors; support boilerplate | One interface, per-feature disclosure, accelerators for experts |
| Audience-labelled door ("Advanced") | Low scent; discourages exploration | Label by content |
| Hamburger / hidden nav on desktop | ~half the usage, >20 pt lower success, 39% slower | Visible or combo navigation |
| Unlabelled icon as trigger | Can hit 0% click-through | Icon plus text |
| Hover-only reveal | No touch, no keyboard, fails 1.4.13 | Click/focus trigger; persistent menu route |
| Adaptive menus that reorder | Destroys spatial memory; doubles scan time | Stable positions; add, don't reorder |
| Third disclosure level | Users get lost; discoverability halves per level | Fix the IA |
| Splitting dependent fields across a boundary | Exceeds working memory | Keep them together |
| Desktop accordion on must-read content | Higher interaction cost than scrolling; content missed | Expanded page with headings and anchors |
| Disabled disclosure control | "Disclosure controls should always deliver on their promise"; invisible to AT | Remove when inapplicable |
| Wizard for a daily task | "Annoying and overly controlling" | Single form or inline editing |
| Hiding price, fees or cancel | Dark pattern; regulatory exposure | Level 1; symmetric paths |
| "Let admins customise it" as a fix | <5% customise; abdication of the default | Get the default split right |
| Settings page as feature graveyard | Bloat hidden, not removed | Semi-annual audit; delete under ~3–5% use |
| Front-loaded product tour | Interrupts, forgotten, no task-performance gain | Contextual pull help |
| Collapsed content invisible to Ctrl+F and print | Users cannot find or print it | `hidden=until-found`, print CSS, expand-all |
| Same feature at level 1 on desktop, level 3 on phone | Breaks the two-level rule where cost is highest | Content parity; change layout not availability |

---

## 6. Review rubric for a screen

Score each 0–2. Under 12 of 18 means the disclosure design needs rework.

1. Everything decision-critical is visible without interaction.
2. Level-1 items are backed by per-segment usage data.
3. No path exceeds two disclosure levels on any breakpoint.
4. Every trigger is labelled by content and paired with a conventional icon.
5. Every trigger sits adjacent to what it reveals and is reachable by keyboard and touch.
6. No mutually dependent information is split across a boundary.
7. Expand/collapse state persists; expand-all and print behaviour exist where relevant.
8. Disclosure is driven by user action or object state, not by inferred usage history.
9. Level-2 usage is instrumented and there is a scheduled promote/keep/delete review.
