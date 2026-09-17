// People, eight steps, rules 1 to 8 in order (specs/02-people.md §7).
//
// Step 0 is the common version: Apollo's People page as its own knowledge base describes it, drawn
// from this workspace's rows and this workspace's usage numbers. Every quote below is in
// `knowledge-base/` or `knowledge-base/sources/`; nothing is quoted from memory.
import type { LessonStep } from "@/learn/context"

export const steps: LessonStep[] = [
  {
    rule: null,
    chrome: "product",
    title: "The common version",
    moved:
      "Every filter is in a left sidebar behind “Show Filters”, split into Most Popular Filters and a second button called More Filters, and each filter is a collapsible group with its value picker inside it — the sidebar, the group, the picker. Tabs sit above the results: Total, Net New, Saved. A strip of eleven actions is always there, whether anything is selected or not, and none of its buttons says how many people it will touch. Two icons a letter apart say “Add to list” and “Add to lists”, and the second one adds the whole company. The phone button says “Access mobile” and the price appears at step 8 of a dialog.",
    why:
      "Nobody designed this. Every request landed where it fitted, nothing was ever moved, and the result is a screen where the eight filters the SDR uses every week are two clicks and a scroll away, inside a list of thirty-five.",
    evidence: [
      { quote: "It has a bit of a learning curve at the start, especially with advanced filters.", source: "knowledge-base/sources/07-apollo-settings-map.md" },
      { quote: "too many clicks to reach data many navigation buttons seems to be not in the logical place", source: "knowledge-base/sources/07-apollo-settings-map.md" },
      { quote: "The interface can feel a bit overwhelming at first, and I accidentally spent a bunch of time individually selecting people only to click on the wrong 'add to list' icon that just added the entire company to my list.", source: "knowledge-base/sources/07-apollo-settings-map.md" },
      { quote: "I feel that Apollo charges credits when it is not necessary. It's called nickel and diming.", source: "knowledge-base/sources/07-apollo-settings-map.md" },
    ],
    openDoors: ["people.parody.sidebar"],
  },

  {
    rule: 1,
    chrome: "product",
    title: "Ask what this seat touches in a week",
    moved:
      "Eight filters carry the SDR's week and come out of the sidebar as chips in the bar: Title, Persona, Company, Score, Email, Not in a sequence, Owner and Stage. The other twenty-seven stay where they were. The table drops from the eleven columns that served everybody to the seven this seat reads, and the eleven bulk actions become the two the SDR runs weekly, with the rest behind one control. Four of the eleven were never this product's actions at all and simply go.",
    why:
      "The split comes from the usage model — the share of SDRs at this workspace who touch each item in a typical week — and not from how important anything felt when it was built.",
    evidence: [
      { quote: "You must disclose everything that users frequently need up front.", source: "knowledge-base/09-expert-voices.md" },
      { quote: "6.4% is the median and 15.6% is best-in-class", source: "knowledge-base/08-principles-and-checklists.md" },
      { quote: "a level-1 surface sized to the empirical head is small. The risk is not that level 1 is too big; it is that the wrong things are on it.", source: "knowledge-base/08-principles-and-checklists.md" },
    ],
    openDoors: ["people.parody.more"],
  },

  {
    rule: 2,
    chrome: "product",
    title: "Stop at two levels",
    moved:
      "The sidebar of collapsible groups becomes one panel of flat fields: every filter is visible in it and every value is one click away, so nothing is three deep any more. The Total, Net New and Saved tabs go; they were a level above a level, and two of the three held nothing the SDR came for. A chip opens its picker in place. The record keeps its own two levels: the table opens a quick look, the table opens a record page, and the drawer holds no doors.",
    why:
      "A sidebar, a group inside it and a picker inside that is three levels, and three is where people lose the thread of where they are.",
    evidence: [
      { quote: "designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels", source: "knowledge-base/sources/05-critiques-pitfalls-and-measurement.md" },
      { quote: "selection time per level grows only logarithmically with items per level, so broader, shallower hierarchies are usually faster when items are well ordered", source: "knowledge-base/sources/06-academic-literature.md" },
    ],
    openDoors: ["people.filters.panel"],
  },

  {
    rule: 3,
    chrome: "product",
    title: "Name the content, not the audience",
    moved:
      "“Most Popular Filters”, “More Filters” and the word “advanced” are deleted from the panel. The headings now name what is under them: Person, Company, Reach, Ownership, History. What sits in the bar is still decided per seat and per business by the numbers, so the marketer's bar and the SDR's bar differ and neither is labelled for its audience. One mode arrives: Comfortable and Compact.",
    why:
      "A popularity ranking of the whole workspace is the wrong ranking for anybody in it, and a label that says “advanced” tells a person the thing behind it is not for them.",
    evidence: [
      { quote: "These labels create a psychological barrier: they implicitly tell users that certain features are not for them unless they meet some undefined skill threshold.", source: "knowledge-base/sources/04-b2b-saas-practice-and-case-studies.md" },
      { quote: "Progressive disclosure splits tasks by frequency, not people by skill.", source: "knowledge-base/00-core-model.md" },
      { quote: "Ensure users can always switch between comfortable and compact mode.", source: "knowledge-base/sources/13-sweep-density-all-day-users.md" },
      { quote: "+15% onboarding completion, −10% sharing and collaboration", source: "knowledge-base/11-what-changed-2018-2026.md" },
    ],
    openDoors: ["people.filters.panel"],
  },

  {
    rule: 4,
    chrome: "product",
    title: "One door, labelled by what is behind it",
    moved:
      "The second add-to-list icon goes; one control is left and it says what it adds. Every remaining door takes its content and its count into its label: “All filters (35)”, “All views (6)”, “Columns and density · 8 of 26”, “Edit or export selected”, and the row menu is named for the person it acts on. “Add column” and the gear beside it — which mixed picking a column with creating a field and running an AI agent — become the one columns door. Doors that cannot apply are removed rather than greyed: no CRM items where there is no CRM.",
    why:
      "A person should be able to cover the label, guess what is behind the door, read it, and find they were right; an icon on its own tells them nothing.",
    evidence: [
      { quote: "The interface can feel a bit overwhelming at first, and I accidentally spent a bunch of time individually selecting people only to click on the wrong 'add to list' icon that just added the entire company to my list.", source: "knowledge-base/sources/07-apollo-settings-map.md" },
      { quote: "Obscure icon = wasted feature.", source: "knowledge-base/sources/05-critiques-pitfalls-and-measurement.md" },
      { quote: "Remove, do not disable, triggers that do not apply in the current context", source: "knowledge-base/08-principles-and-checklists.md" },
    ],
  },

  {
    rule: 5,
    chrome: "product",
    title: "Keep what depends on what together",
    moved:
      "“Select all matching” leaves the strip above the results and joins the count it changes, and the limit per company sits beside it and restates the result in words: “Select 306 people, up to 3 per company”. A filter that is doing something from inside the panel now shows as a chip in the bar beside the rows it is changing. The default view is set on the page instead of in Settings › Users and teams. The panel gains a pin, and remembers it.",
    why:
      "Two controls that change each other's meaning cannot sit on opposite sides of a door; four chunks of working memory will not survive the trip.",
    evidence: [
      { quote: "Never put information in one accordion item that needs to be referenced in another accordion item.", source: "knowledge-base/00-core-model.md" },
      { quote: "If a user expands or collapses an item, make the state persist so it takes effect the next time the window is displayed.", source: "knowledge-base/sources/04-b2b-saas-practice-and-case-studies.md" },
      { quote: "Cowan's 4±1 chunks: never separate mutually dependent information across a disclosure boundary", source: "knowledge-base/00-core-model.md" },
    ],
  },

  {
    rule: 6,
    chrome: "product",
    title: "It appears because you selected something",
    moved:
      "The strip of actions that was always above the results — acting on a selection that might not exist — becomes a bar that appears because rows are ticked and goes when they are not. That is object state, the one thing that is allowed to move a control. Nothing else on this page reorders itself: a new column goes to the end, the chips stay where the seat's numbers put them, and a view changes only when somebody saves it.",
    why:
      "Doors open because a person opened them or because of the state of an object on screen, never because the system guessed from what happened last week.",
    evidence: [
      { quote: "As a result, scanning menus took twice as long.", source: "knowledge-base/sources/05-critiques-pitfalls-and-measurement.md" },
      { quote: "In 2004 static was significantly faster; in 2025 it is a tie.", source: "knowledge-base/11-what-changed-2018-2026.md" },
      { quote: "Relocation costs more than the prediction can repay.", source: "knowledge-base/11-what-changed-2018-2026.md" },
    ],
  },

  {
    rule: 7,
    chrome: "product",
    title: "The price goes on the button",
    moved:
      "“Access mobile” becomes “Reveal · 8 credits”. The bulk buttons read “Enrich 3 · 6 credits” and “Export 3 · no credits”, and the eight-step dialog that used to hold the estimate is gone. Every message that follows a spend says what it cost and what is left. The stage change that takes somebody out of a sequence says so on the item before it is chosen, and the do-not-contact exclusion is stated on the panel with its count instead of being applied silently.",
    why:
      "Price, risk and what a destructive action does are decision-critical, and a cost a person meets after the click is a cost they were not offered the chance to refuse.",
    evidence: [
      { quote: "never hide decision-critical information (price, requirements, risks, privacy terms) behind the second level.", source: "knowledge-base/sources/01-foundations-and-definitions.md" },
      { quote: "users who weren't shown the ticket fees upfront spent about 21% more money and were 14.1% more likely to complete a purchase.", source: "knowledge-base/sources/05-critiques-pitfalls-and-measurement.md" },
      { quote: "Unclear pricing, forced waterfall verification, slow email access, and excessive credit consumption.", source: "knowledge-base/sources/07-apollo-settings-map.md" },
      { quote: "I feel that Apollo charges credits when it is not necessary. It's called nickel and diming.", source: "knowledge-base/sources/07-apollo-settings-map.md" },
    ],
  },

  {
    rule: 8,
    chrome: "product",
    title: "A way past the scaffolding",
    moved:
      "Every item in the row menu prints the key that does it; the views list prints the number key that opens each view; the search box shows its slash. Arrow keys walk the rows, Enter opens the quick look, o opens the record, and the three keys that spend money ask once, in place, with the price in the question. Anything undoable offers an undo for ten seconds and answers ⌘Z. Languages and Founded year, which nobody here opens, are written down for the next delete review.",
    why:
      "Doors are scaffolding for the many; somebody who lives on this screen all day needs a way past them, and hover hints do not teach — exposure does.",
    evidence: [
      { quote: "unseen by the novice user", source: "knowledge-base/10-glossary.md" },
      { quote: "there is a tendency for users to persistently fail to adopt faster methods for completing their work", source: "knowledge-base/sources/06-academic-literature.md" },
      { quote: "keep tucked away (used by a meaningful minority; users prefer this to removal by 45% to 24.5%, McGrenere & Moore 2000)", source: "knowledge-base/08-principles-and-checklists.md" },
      { quote: "shortcut usage across three ordered stages was 9.79%, then 86.20% with every shortcut exposed, then 73.09% after the exposure was removed", source: "knowledge-base/11-what-changed-2018-2026.md" },
    ],
  },
]
