// The eight steps of lesson 3, from specs/09-deal-record.md §7, rules 1 to 8 in order.
//
// Step 0 is the common version described in §5: modelled on Apollo's deal profile page, with the
// contact and account profile pages where the deal article is thin. Every quote below is in
// knowledge-base/ or knowledge-base/sources/; nothing in step 0 is invented.
import type { LessonStep } from "@/learn/context"

export const steps: LessonStep[] = [
  {
    rule: null,
    chrome: "own",
    title: "The common version",
    moved:
      "A deal profile in two halves. On the left a stack of widgets: general deal information, Record details with See all fields, Account, Contacts, Tasks and Notes. On the right a strip of tabs: Activities, Files, Notes, All Fields and Enrichment. A gear lets each person hide widgets. A field is edited by hovering it until the word Edit appears. Delete deal sits inside a “…” menu. The custom fields the team asked for are on the All Fields tab, inside a field group. Probability and forecast category are not on the page at all: they are set per stage in Settings, three levels away.",
    why:
      "Nobody designed this. Every request landed where it fit — a widget for one, a tab for the next — and nothing was ever moved. The timeline sits on a tab beside the fields it explains, and Notes exists twice.",
    evidence: [
      {
        quote: "general info, account, contacts, tasks, notes, activities (calls, emails, meetings)",
        source: "knowledge-base/sources/16-apollo-workflow-inventory.md §14, Deals",
      },
      {
        quote: "widgets (Contact info, Record details, Tasks, Account, Deals, Notes) > click a field or See all fields > tabs Prospect, Activities, Sequences, Conversations, Enrichment, All Fields, Files",
        source: "knowledge-base/sources/16-apollo-workflow-inventory.md §10, the contact record",
      },
      {
        quote: "Create stage: name, deal type, probability, forecast category",
        source: "knowledge-base/sources/07-apollo-settings-map.md §Deal fields & stages",
      },
      {
        quote: "Data is fine.. but UX is very bad.. heavy loading pages to many windows with slow loading, too many clicks to reach data many navigation buttons seems to be not in the logical place",
        source: "knowledge-base/sources/07-apollo-settings-map.md, Hassnaa, Trustpilot, 4 Sep 2026",
      },
    ],
  },

  {
    rule: 1,
    chrome: "product",
    title: "Hide the rare, never the necessary",
    moved:
      "Stage, amount, close date, the next step and last activity leave the General deal information widget and become a header grid on the page itself. The Activities tab dissolves: the timeline is now the page, with its composer above it. Contacts and Tasks leave the widget panel and sit beside the timeline as cards, and the Champion confirmed checkbox buried in the All Fields tab becomes the Qualification card, eight elements with their values, their state and the words the buyer used. Files, Notes, All Fields and Enrichment are still tabs.",
    why:
      "The usage table for this seat decides what is level one: stage 95, the next step 85, close date 75, amount 70, contacts 70, qualification 65. Everything an AE touches most weeks is now visible without a click.",
    evidence: [
      {
        quote: "You must disclose everything that users frequently need up front.",
        source: "knowledge-base/09-expert-voices.md, Nielsen (2006)",
      },
      {
        quote: "Everything most users need most of the time is level 1.",
        source: "knowledge-base/08-principles-and-checklists.md",
      },
      {
        quote: "name, group, max characters or picklist, global or private, optional CRM mapping and read-only",
        source: "knowledge-base/sources/16-apollo-workflow-inventory.md §14, Deals",
      },
    ],
    openDoors: [],
  },

  {
    rule: 2,
    chrome: "product",
    title: "Stop at two levels",
    moved:
      "The tab strip is deleted. Files becomes a door, Enrichment becomes a door, All Fields becomes a door, and the Notes tab becomes the Notes chip on the timeline filter. Inside All Fields the field groups were a third level — All Fields, then Commercial, then the field — so the groups become headings inside one door and the field is one click from the page. History, sync history and the evidence quotes take their place in the same column of doors.",
    why:
      "Every item on this record is now either on the page or behind exactly one door. There is no path of three.",
    evidence: [
      {
        quote: "designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels.",
        source: "knowledge-base/sources/05-critiques-pitfalls-and-measurement.md, Nielsen (2006)",
      },
      {
        quote: "Classic depth-versus-breadth result: selection time per level grows only logarithmically with items per level, so broader, shallower hierarchies are usually faster when items are well ordered.",
        source: "knowledge-base/sources/06-academic-literature.md, Landauer & Nachbar (1985)",
      },
      {
        quote: "A third level means the information architecture is wrong, not the widget.",
        source: "knowledge-base/00-core-model.md",
      },
    ],
    openDoors: ["deal.custom", "deal.files", "all-fields"],
  },

  {
    rule: 3,
    chrome: "product",
    title: "Split by task frequency, not user skill",
    moved:
      "The gear goes, and with it the idea that each person repairs the layout for themselves. Nothing else on screen changes. What differs between the admin and the AE is now which items are level one, decided by one table in src/ollopa/usage/deal.ts per seat and per business, not by forty-two private configurations.",
    why:
      "A per-user layout hands the design problem back to the user. The often-quoted line here — Spool's fewer than 5% ever changed a setting — is a 2011 anecdote about consumer Word with no post-2018 replacement, so it is not the argument: the argument is rule 6 itself, that a default nobody chose is not fixed by a control nobody finds.",
    evidence: [
      {
        quote: "These labels create a psychological barrier: they implicitly tell users that certain features are not for them unless they meet some undefined skill threshold.",
        source: "knowledge-base/sources/04-b2b-saas-practice-and-case-studies.md, Home Assistant (2026)",
      },
      {
        quote: "Static split menus beat adaptive on speed; 55% preferred adaptable, 30% adaptive, 15% static.",
        source: "knowledge-base/09-expert-voices.md, Findlater & McGrenere",
      },
      {
        quote: "Spool's figure is a 2011 anecdote about consumer Word and there is no post-2018 settings-usage benchmark of any tier.",
        source: "knowledge-base/08-principles-and-checklists.md",
      },
    ],
    openDoors: [],
  },

  {
    rule: 4,
    chrome: "product",
    title: "Make the door obvious and honest",
    moved:
      "Seven door labels change. Record details becomes Custom fields (5). Files becomes Files and the proposal (3). Change log becomes History (2). Enrichment becomes Signals and news. Evidence becomes Evidence and source quotes (4). Sync becomes Sync history · last 10. All Fields keeps its name and loses its capital. And hover-to-edit is replaced: a field is a real control now, clicked or reached with Tab and opened with Enter, with the pencil showing on focus as well as on hover.",
    why:
      "A label says what is behind it and how much of it there is, so nobody opens a door to find out. An affordance that appears only under a pointer does not exist for a keyboard or a touch screen.",
    evidence: [
      {
        quote: "Unlabelled icon as trigger | Can hit 0% click-through | Icon plus text",
        source: "knowledge-base/08-principles-and-checklists.md, NN/g (2014)",
      },
      {
        quote: "Remove (don't disable) progressive disclosure controls that don't apply in the current context. Progressive disclosure controls should always deliver on their promise.",
        source: "knowledge-base/sources/04-b2b-saas-practice-and-case-studies.md, Microsoft Windows UX Guide",
      },
      {
        quote: "a label that appears only on hover is itself a progressive-disclosure failure, because the disclosure trigger has no scent.",
        source: "knowledge-base/sources/05-critiques-pitfalls-and-measurement.md",
      },
    ],
    openDoors: ["deal.custom", "deal.files", "deal.history", "deal.evidence"],
  },

  {
    rule: 5,
    chrome: "product",
    title: "Keep context across the boundary",
    moved:
      "Probability and forecast category leave the All fields door — where the page had only been able to say that Settings owns them — and sit directly under the stage stepper, changing with it. The next step's date joins the next step on one line instead of being a cell of its own two columns away. Signals and news becomes a drawer, because enrichment needs room but must keep the deal in view, while every other door still expands in place. Doors remember whether you left them open, per person, across deals.",
    why:
      "Three values that are set together and read together must not be split by a boundary: about four chunks is all that survives the trip.",
    evidence: [
      {
        quote: "Never put information in one accordion item that needs to be referenced in another accordion item.",
        source: "knowledge-base/sources/03-pattern-catalog.md, Microsoft Fluent 2",
      },
      {
        quote: "A single, central capacity limit averaging about four chunks is implicated.",
        source: "knowledge-base/sources/02-cognitive-science.md, Cowan (2001)",
      },
      {
        quote: "If a user expands or collapses an item, make the state persist so it takes effect the next time the window is displayed.",
        source: "knowledge-base/sources/04-b2b-saas-practice-and-case-studies.md, Microsoft Windows UX Guide",
      },
    ],
    openDoors: ["all-fields"],
  },

  {
    rule: 6,
    chrome: "product",
    title: "Prefer stable, user-controlled disclosure over inferred adaptation",
    moved:
      "The research agent's proposal leaves the notification bell and becomes a card at the top of the side panel. It is there because this deal has a proposal waiting, and it leaves when the proposal is approved or dismissed — object state, not a queue that lingers and not a guess from last week's behaviour. Nothing else on the page reorders itself, for anyone, ever.",
    why:
      "A decision waiting for a person is not something to be discovered by opening a bell. And spatial adaptation loses at any accuracy, so moving things by predicted usefulness is not a trade worth making.",
    evidence: [
      {
        quote: "scanning adaptive menus requires two passes: scan the short menu, press the chevron, then back to the top to scan the long menu... As a result, scanning menus took twice as long.",
        source: "knowledge-base/sources/05-critiques-pitfalls-and-measurement.md, Jensen Harris on Office 2000",
      },
      {
        quote: "Static 2283 ms, Frequency 2298 ms, MCTS 2162 ms",
        source: "knowledge-base/11-what-changed-2018-2026.md, Todi et al. (CHI 2021)",
      },
      {
        quote: "Fifteen of 18 noticed the menus changing; two understood why",
        source: "knowledge-base/11-what-changed-2018-2026.md, Todi et al. (CHI 2021)",
      },
    ],
    openDoors: [],
  },

  {
    rule: 7,
    chrome: "product",
    title: "Decision-critical information is never behind a door",
    moved:
      "Delete deal leaves the “…” menu for the actions row, with “Removes this deal and its 4 activities” printed beside it. Mark won and Mark lost now write what they will do before they are confirmed. Enrich carries its price. The stage gate moves onto the step itself — Proposal needs Economic buyer, set by Daniel Okafor in Settings › Pipeline and data — so a requirement is read before the click, not after it. And the agent proposal card gains its consequence in full: the stage it moves, the probability and forecast that move with it, the CRM it updates and the credits it costs.",
    why:
      "Price, consequence and what a destructive action destroys are what a person decides on. A rule met only after the click is a rule behind a door.",
    evidence: [
      {
        quote: "never hide decision-critical information (price, requirements, risks, privacy terms) behind the second level.",
        source: "knowledge-base/sources/01-foundations-and-definitions.md, Nielsen",
      },
      {
        quote: "Nouwens et al. measured a 22–23 point swing in consent from moving one button to a second level",
        source: "knowledge-base/sources/05-critiques-pitfalls-and-measurement.md",
      },
      {
        quote: "watch the credit system closely or you'll get surprised at the end of the month",
        source: "knowledge-base/sources/07-apollo-settings-map.md, Reddit via Cleverly (secondary)",
      },
    ],
    openDoors: [],
  },

  {
    rule: 8,
    chrome: "product",
    title: "Fade the scaffold; give experts accelerators",
    moved:
      "Nothing moves for a first-time reader. For the person who lives here, S moves the stage, C logs a call, E writes an email, M a meeting, N a note, T a task, W marks won and Shift+W marks lost; G then H opens History, [ and ] walk the board in order and Esc goes back to it. Every one of them is listed in ⌘K, and the doors that were opened stay open on the next deal.",
    why:
      "Doors are scaffolding for the many. The resident needs a way past them, and the palette that lists every shortcut is the floor of teaching, not the ceiling — hover hints teach nothing at all.",
    evidence: [
      {
        quote: "unseen by the novice user",
        source: "knowledge-base/10-glossary.md, NN/g heuristic 7",
      },
      {
        quote: "there is a tendency for users to persistently fail to adopt faster methods for completing their work.",
        source: "knowledge-base/sources/06-academic-literature.md, Cockburn et al. (2014)",
      },
      {
        quote: "Word 97 users touched about 27% of functions, yet preferred unused ones \"tucked away\" (45%) over removed (24.5%).",
        source: "knowledge-base/09-expert-voices.md, McGrenere & Moore (2000)",
      },
      {
        quote: "9.79% (s.d. 19.67), 86.20% (s.d. 12.87) and 73.09% (s.d. 21.15) for the EHK_pre, EHK and EHK_post stages, respectively.",
        source: "knowledge-base/sources/09-sweep-layers-and-promotion.md, ExposeHK (IHM 2025)",
      },
    ],
    openDoors: [],
  },
]
