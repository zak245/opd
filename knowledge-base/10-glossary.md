# Glossary

Terms as used across this knowledge base. Where a term has competing definitions, the one adopted here is stated first.

**Accelerator.** A faster, less obvious way to do something the visible interface already allows (keyboard shortcut, command palette, bulk action). Nielsen's heuristic 7: "unseen by the novice user," they speed up experts. The expert-side half of progressive disclosure.

**Adaptable interface.** One the *user* configures (pinning, reordering, hiding). Preferred over adaptive in controlled studies; but fewer than 5% of users customise anything.

**Adaptive interface.** One the *system* reconfigures based on inferred usage (Office 2000 personalized menus). Documented to break spatial memory and double scan time. Distinguish from context-triggered disclosure driven by object state, which is deterministic.

**Aesthetic-usability effect.** Users rate attractive interfaces as more usable regardless of actual usability. A clean level 1 scores well in demos while hiding what experts need.

**Banner blindness.** Learned filtering of page regions that resemble advertising (right rails, edges). Disclosure triggers placed there go unseen.

**Change blindness.** Failure to notice a new element added to an otherwise unchanged display. Disclosed content that appears without emphasis or animation can be missed.

**Choice overload (paradox of choice).** The hypothesis that more options reduce motivation and satisfaction. Meta-analyses show a conditional effect: present for novices under uncertainty and time pressure; absent or reversed for experts with clear preferences.

**Cognitive load.** Mental resources required to operate a system. Intrinsic (inherent to the task), extraneous (caused by presentation), germane (spent building understanding). PD reduces extraneous load; it cannot reduce intrinsic load.

**Commensurate effort (Cooper).** Users accept effort proportional to the value of the result. A complex feature may deserve a complex interaction; a simple task must have a simple one.

**Command palette.** A keyboard-invoked search over commands (Cmd+K). A disclosure mechanism where the user's query, not a fixed hierarchy, selects what is revealed. Best when it shows each command's shortcut so users graduate out of it.

**Container.** Where disclosed content appears: in-flow (accordion, details, expandable row, conditional field), layered (popover, tooltip, menu, drawer) or modal (dialog, sheet, wizard step).

**Contextual disclosure.** Reveal driven by object state or selection: contextual tabs (Office), selection-driven property panels (Figma), row actions for the selected record. Predictable because the trigger is deterministic.

**Density (visual, information, design, temporal, value).** Ström-Awn's decomposition. PD reduces visual density at the cost of temporal density; for all-day expert users the net is negative.

**Details on demand.** The last step of Shneiderman's mantra ("overview first, zoom and filter, then details on demand"). Disclosure of data detail, with the overview as primary content.

**Disclosure debt (Nielsen, 2026).** A frequently used feature parked at level 2, charging an interaction tax on every visit. Detect by per-segment usage of level-2 items.

**Discoverability.** Whether users can find out what actions are possible and where. The cost side of PD. Tognazzini: "If the user cannot find it, it does not exist."

**Excise (Cooper).** Work the interface forces that does not advance the user's goal: navigational, modal, visual. Each disclosure click is navigational excise.

**Experience rot (Spool).** Degradation of a product's experience as features accumulate. PD is often the coping mechanism.

**Extras on Demand (Tidwell).** Show the most important content; hide the rest behind one clearly labelled control that the user chooses to open. The user-initiated hierarchical form of PD.

**Fading (scaffolding).** Withdrawing support as it becomes unnecessary. In PD: letting users keep sections open, teaching shortcuts, promoting or deleting level-2 items.

**Feature gating / entitlements.** Hiding or badging features by plan tier. Opposite policy from permission hiding: the goal is discovery and upsell, so gated features stay visible but unobtrusive.

**Fitts's Law.** Time to reach a target depends on distance and size. Disclosure triggers should be large, labelled, and close to what they reveal; in-place expansion has zero pointer travel.

**Flexibility-usability tradeoff (Lidwell).** As flexibility rises, usability falls. A Basic/Advanced toggle moves the tradeoff into the toggle instead of resolving it.

**Gradual engagement (Wroblewski).** Let users do something useful before requiring signup or setup. The onboarding form of "delay."

**Hick's Law.** Decision time rises with the number and complexity of unfamiliar, unordered choices. Flattens for experts scanning stable layouts; argues for breadth over depth.

**Hidden navigation.** Navigation behind an icon (hamburger). Measured penalty: about half the usage, >20 points lower success, 39% slower on desktop.

**Information scent (Pirolli & Card).** A user's estimate of the value behind a link or trigger, derived from its label and context. The only thing a disclosure trigger has going for it.

**Interaction cost (NN/g).** Sum of mental and physical effort to reach a goal: reading, scanning, deciding, clicking, waiting, attention switches, memory. The correct replacement for click counting.

**Interface layering.** Sense A of PD: primary versus secondary controls within a screen.

**Level 1 / level 2.** The initial display and the on-request display. Nielsen's limit is two.

**Multi-layer interface (Shneiderman).** A system with named layers of increasing capability that users move between when ready.

**Onboarding, progressive.** Sense B of PD: metering product education over sessions by behaviour and segment. Measured by activation, time-to-value, feature adoption, drop-off.

**One thing per page (GOV.UK).** The extreme of staged disclosure: one question per screen.

**Paradox of the active user (Carroll & Rosson).** Users start immediately rather than learn first, even when learning would save time. PD must deliver learning in the flow of work.

**Perpetual intermediate (Cooper).** The majority user who learns enough to work and stays there. The centre of gravity for design.

**Progressive disclosure of complexity.** Sense C of PD: an architecture stance (Vercel, SwiftUI, Swift) where the simplest use case needs the least code or configuration, and complexity appears only as the use case demands it.

**Progressive enhancement.** Web delivery strategy by browser capability. Unrelated despite the shared word.

**Progressive reduction (LayerVault).** Per-user UI simplification as proficiency is demonstrated, with "experience decay" restoring cues after disuse. Adaptation over calendar time, not fixed layering.

**Recognition vs recall.** Nielsen's heuristic 6. Menus rely on recognition; hidden features rely on recall. PD converts one into the other and must compensate with scent.

**Responsive disclosure (Tidwell).** System reveals the next controls immediately after the user's input makes them relevant (conditional fields).

**Responsive enabling (Tidwell).** All controls shown; irrelevant ones disabled until relevant. Lets experts anticipate; disabled controls are nearly invisible to assistive technology.

**Satisficing (Simon).** Choosing the first good-enough option. Users will not search behind low-scent triggers.

**Scaffolding (Wood, Bruner & Ross; Vygotsky).** Support that reduces steps, marks critical features and controls frustration, then fades. PD as a learning aid.

**Semantic zoom.** Two representations of the same data at different scales (group headers when zoomed out, items when zoomed in).

**Signifier (Norman).** The cue that communicates where and how to act. The "More options" button is the signifier for the hidden affordance.

**Split.** The decision about which items sit at level 1 and level 2. Must be by task frequency, validated with per-segment data.

**Staged disclosure (Nielsen).** Linear, mandatory sequence of steps with a subset shown at each (wizards). Distinct from hierarchical PD.

**Tesler's Law (conservation of complexity).** Some complexity cannot be removed, only moved. PD relocates complexity later and behind a door; it must not relocate it into the user's memory or into support.

**Top Tasks (McGovern).** Customer-voted ranking of tasks that yields a "long neck" and settles what is primary.

**Training wheels (Carroll & Carrithers, 1984).** A novice interface with advanced and error-prone functions blocked. Faster learning; a quarter less time lost to error recovery. The empirical origin of PD.

**Trigger.** The affordance that moves the user from level 1 to level 2. Must carry scent, be in the reading path, and always deliver.

**Working memory (Cowan's 4±1).** The number of chunks a user can hold. Never split mutually dependent information across a disclosure boundary.
