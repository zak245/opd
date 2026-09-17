// The seven steps of the Agents lesson: the common version, then one rule each, in the order
// specs/13-agents.md §7 gives them. Rules 3 and 6 are notes on the last step, because the common
// version does not break them in a way that moves anything.
//
// Every quote below is in `knowledge-base/` or `knowledge-base/sources/`, word for word, and each
// names the file it came from.
import type { LessonStep } from "@/learn/context"

export const steps: LessonStep[] = [
  {
    rule: null,
    chrome: "product",
    title: "Five surfaces, one job",
    moved:
      "Nothing has moved yet. This is the work spread across the places Apollo built it: an AI Assistant chat with an unlabelled “⌄” for previous chats, a workflow’s Enrollment tab holding the runs and their failure reasons, agent steps on a tab nobody opens, and the credits four levels down in Settings › Credits and activity › Credit usage › AI runs, behind an admin permission. The confirmations sit inside the conversation, at the moment the assistant asks, and scroll away with it. A second “power-up” meter counts credits the first one does not.",
    why:
      "It is not a bad team. Each AI feature shipped where it was built, and nothing was ever moved, so the person deciding and the number that decides it ended up on different screens.",
    evidence: [
      { quote: "messages are free; credits only on credit-consuming actions", source: "knowledge-base/sources/16-apollo-workflow-inventory.md" },
      { quote: "Requires the permission \"Can access the credit usage page…\".", source: "knowledge-base/sources/07-apollo-settings-map.md" },
      { quote: "Apollo AI assistant ran operations quoting me a certain amount of credits, and then racked up a separate bill", source: "knowledge-base/sources/07-apollo-settings-map.md" },
      { quote: "watch the credit system closely or you'll get surprised at the end of the month", source: "knowledge-base/sources/07-apollo-settings-map.md" },
    ],
  },
  {
    rule: 7,
    chrome: "product",
    title: "The decision and its cost, on the same screen",
    moved:
      "The confirmations leave the conversation and become “Waiting for you” at the top, each one now saying what it will do if approved — mailbox, time, credits — with Approve and Decline side by side. Credits this week against the cap come up from four levels down in Settings into the briefing, and the workspace balance comes off the top bar to sit beside them; the separate “power-up” meter goes, because a second meter is how the bill surprises you. “Credit limit” and “inactive mailbox” stop being failure reasons on a run and become exception lines with a Resume. The agent tiles come off the workflow’s Steps tab, each with a Pause. And the queue is cut down: research, scoring and saved drafts stop asking and are logged with an Undo, so what is left is only what cannot be taken back. An item over the Settings threshold loses its Approve button altogether and says who it is now waiting for, so nobody reads silence as sent. The batch line says what the whole run will do, once, when the run ended.",
    why:
      "An email an agent sends cannot be unsent and a credit it spends cannot be refunded, so the person deciding must see the consequence and the spend where they decide. But showing everything is its own way of hiding: a reviewer with forty items approves the bad one along with the rest.",
    evidence: [
      { quote: "never hide decision-critical information (price, requirements, risks, privacy terms) behind the second level.", source: "knowledge-base/sources/01-foundations-and-definitions.md" },
      { quote: "participants often noticed questionable actions, but treated them as routine, harmless, or not worth interrupting.", source: "knowledge-base/sources/14-sweep-agent-disclosure.md" },
      { quote: "Disclosure that exceeds review capacity is equivalent to hiding.", source: "knowledge-base/08-principles-and-checklists.md" },
      { quote: "Post-commit suggestions drew 52% engagement while identical content on a declined edit was dismissed 62% of the time", source: "knowledge-base/00-core-model.md" },
      { quote: "Apollo AI assistant ran operations quoting me a certain amount of credits, and then racked up a separate bill", source: "knowledge-base/sources/07-apollo-settings-map.md" },
    ],
  },
  {
    rule: 1,
    chrome: "product",
    title: "The ledger is the page, not the transcript",
    moved:
      "The chat transcript is removed and every line in it becomes a row of the activity ledger, at level one, because 35% of SDRs and 50% of admins at Meridian read it weekly. One event’s steps and sources are not read weekly (15% and 18%), so they go behind one door per row. The date, outcome, kind, teammate and surface filters (4% to 15% here) go behind one door named for what is inside it; the agent and contact filters and the search stay out, and the teammate filter is removed altogether for a seat that only sees its own items. Any filter at 20% or more for the signed-in seat comes back out — the teammate filter does exactly that for Halyard’s admin, at 30%.",
    why:
      "Level one is decided by measured weekly use for this seat at this business, not by what felt important in a meeting. The ledger is read often; one event’s step log is not.",
    evidence: [
      { quote: "You must disclose everything that users frequently need up front.", source: "knowledge-base/09-expert-voices.md" },
      { quote: "disclose by exception ... keep the full activity ledger 1 click away.", source: "knowledge-base/09-expert-voices.md" },
      { quote: "Pendo's data: 6% of features generate 80% of clicks.", source: "knowledge-base/09-expert-voices.md" },
    ],
    openDoors: ["agents.filters"],
  },
  {
    rule: 2,
    chrome: "product",
    title: "Nothing is more than one door away",
    moved:
      "Settings › Credits and activity › Credit usage › AI runs was four levels; it is now the Credits column on the ledger and a per-day digest line with the day’s total. Chat › ⌄ › previous chat › scroll was four levels; it is now a ledger row and its step log. The workflow’s Enrollment tab folds in: a run is a set of events with a batch step list, so the second record of the same work is gone rather than kept in parallel. On the phone the filters go into one sheet and the step log still opens in place, so nothing gets deeper where clicks cost most.",
    why:
      "A third level means the structure is wrong, not the widget. From this page every item is one click away, on a desktop and on a phone.",
    evidence: [
      { quote: "designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels.", source: "knowledge-base/sources/05-critiques-pitfalls-and-measurement.md" },
      { quote: "selection time per level grows only logarithmically with items per level, so broader, shallower hierarchies are usually faster when items are well ordered.", source: "knowledge-base/sources/06-academic-literature.md" },
      { quote: "three or more suggests the feature needs redesign.", source: "knowledge-base/08-principles-and-checklists.md" },
    ],
  },
  {
    rule: 4,
    chrome: "product",
    title: "Every door says what is behind it, and every row says who did it",
    moved:
      "The chevron that meant “previous chats” is gone and the doors that replaced it carry their contents in their labels: “Step log · 3 steps · 12 credits”, “Read the draft · 142 words · 3 inputs”. “Preview” and “Details” are not labels. Every ledger row and every waiting item now starts with the name of the actor that produced it, and the Actor column joins the table. The scoring rules link moves off the page footer and onto the Scoring agent’s own tile, where for a seat that cannot change them it is replaced by the admin’s name rather than left as a dead link. Approve and Decline are removed on a decided item, never greyed.",
    why:
      "The label is the only scent a door gives off, and a control that cannot deliver on its promise should be taken away rather than disabled. Naming the actor is what lets a person trust the row.",
    evidence: [
      { quote: "Obscure icon = wasted feature.", source: "knowledge-base/sources/05-critiques-pitfalls-and-measurement.md" },
      { quote: "Remove (don't disable) progressive disclosure controls that don't apply in the current context. Progressive disclosure controls should always deliver on their promise.", source: "knowledge-base/sources/04-b2b-saas-practice-and-case-studies.md" },
      { quote: "Name the actor, every time.", source: "knowledge-base/sources/04-b2b-saas-practice-and-case-studies.md" },
    ],
  },
  {
    rule: 5,
    chrome: "product",
    title: "What you read together is never split by a door",
    moved:
      "The consequence sentence and the credits come out of the draft door and sit on the item, beside Approve, because nobody should have to open a door to find out what the button does and close it again to press it. Credits per step sit beside each step and the row total sits on the row. Resume moves onto the exception line it belongs to instead of a shared row under the block. Expand all and Collapse all arrive, printing expands every door and puts it back, and door state, filter values and column choices persist for this person in this workspace.",
    why:
      "Working memory holds about four chunks, so a trip through a door to fetch a number loses the thing the number was for. A door also has to remember whether it was left open.",
    evidence: [
      { quote: "Cowan's 4±1 chunks: never separate mutually dependent information across a disclosure boundary", source: "knowledge-base/00-core-model.md" },
      { quote: "Never put information in one accordion item that needs to be referenced in another accordion item", source: "knowledge-base/sources/03-pattern-catalog.md" },
      { quote: "If a user expands or collapses an item, make the state persist so it takes effect the next time the window is displayed.", source: "knowledge-base/sources/04-b2b-saas-practice-and-case-studies.md" },
    ],
  },
  {
    rule: 8,
    chrome: "product",
    title: "A way past the scaffold, for the person who lives here",
    moved:
      "The keyboard comes on: j and k walk the queue and the ledger, a approves, d declines, e opens the item’s door, x picks it up for the batch, / jumps to the search, Escape clears. The same keys are printed in the “…” menus, so the shortcut is learned where the slow path is used. “Review all 6” appears beside the queue and opens the batch with the whole consequence in the button’s own label. Each agent tile becomes a one-click filter for the ledger under it. Door opens and filter use are counted per role and per business and reviewed each March and September: promote, keep, or delete “Show or hide columns” and “Print” if they stay under 3%.",
    why:
      "Doors are scaffolding for the many; the person who lives on this screen needs a way past them that teaches itself. What nobody opens is deleted rather than kept behind a door for ever.",
    evidence: [
      { quote: "unseen by the novice user", source: "knowledge-base/10-glossary.md" },
      { quote: "persistently fail to adopt faster methods", source: "knowledge-base/00-core-model.md" },
      { quote: "preferred unused ones \"tucked away\" (45%) over removed (24.5%)", source: "knowledge-base/09-expert-voices.md" },
    ],
  },
]
