// The eight steps of the connect lesson: the common version, then the seven rules spec 15 §7 applies
// in the order 2, 4, 5, 7, 1, 6, 8.
//
// Every quote below is in `knowledge-base/` or `knowledge-base/sources/`; the `source` names the file
// it is in. Nothing in step 0 is invented: it is spec 15 §5, built from Apollo's own knowledge base.
import type { LessonStep } from "../../src/learn/context"

export const steps: LessonStep[] = [
  {
    rule: null,
    title: "The common version",
    chrome: "own",
    moved: "Nothing has moved yet. This is a marketplace list where the first decision is production or sandbox, an authorisation that runs across four systems with no step count and no way to resume, a six-hour timer that will switch syncing on whichever way the settings happen to be set, and a settings page four levels deep: page, then an object tab, then a Sync sub-tab, then an \"Advanced sync\" block holding deletion sync and merge sync. The error log is another tab, and the fix for each error is on hover. One door — selective sync — opens onto the sentence that it is not on your plan.",
    why: "Nobody designed this. Each sync setting was added where it fitted, the timer replaced a decision nobody wanted to force, and \"Advanced\" is where a switch goes when no one can name its audience.",
    evidence: [
      { quote: "Integrations (D1; per-integration pages D2; tabs D3; sub-tabs D4)", source: "knowledge-base/sources/07-apollo-settings-map.md" },
      { quote: "Salesforce/HubSpot push › \"Advanced sync\" block (deletion sync, merge sync).", source: "knowledge-base/sources/07-apollo-settings-map.md" },
      { quote: "6-hour configuration window before auto-sync starts.", source: "knowledge-base/sources/07-apollo-settings-map.md" },
      { quote: "hover for the description, full error and suggested fix", source: "knowledge-base/sources/16-apollo-workflow-inventory.md" },
      { quote: "Selective sync needs \"certain plans purchased after **24 July 2024**\".", source: "knowledge-base/sources/16-apollo-workflow-inventory.md" },
    ],
    openDoors: [],
  },
  {
    rule: 2,
    title: "Stop at two levels",
    chrome: "product",
    moved: "The four levels collapse. The marketplace card becomes step 1, authorising becomes step 2, and what used to be the Sync sub-tab of the Contacts tab becomes steps 3, 4 and 5 of one flat page: what syncs, the field pairs, the sync rules. Stage mapping leaves the Field mapping sub-tab and the activity settings leave the Activities tab. Deletion sync and merge sync are still behind a door, but that door now sits on the page it belongs to rather than inside a sub-tab inside a tab. The error log leaves the tab strip for a section of its own.",
    why: "A fourth level is where an admin gets lost; it is a structural problem, not a widget problem.",
    evidence: [
      { quote: "Designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels", source: "knowledge-base/00-core-model.md" },
      { quote: "three or more suggests the feature needs redesign", source: "knowledge-base/sources/03-pattern-catalog.md" },
      { quote: "Integrations (D1; per-integration pages D2; tabs D3; sub-tabs D4)", source: "knowledge-base/sources/07-apollo-settings-map.md" },
    ],
    openDoors: ["connect.advanced"],
  },
  {
    rule: 4,
    title: "Make the door obvious and honest",
    chrome: "product",
    moved: "\"Advanced sync\" becomes \"Deletions and merges\", so deletion sync and merge sync move into a door named for what is behind it. \"Next\" and \"Done\" become one button that says where it goes, and \"Step 3 of 6\" is written in text on every step. The suggested fix leaves the hover card and sits in the error row. The plan-gated door goes: on this workspace's plan selective sync is simply a control, and where it is not included the lock goes on the card at the entry point with the plan and the total, never behind a door that opens onto a refusal.",
    why: "A label is the only scent a door has, and a door must always open onto something.",
    evidence: [
      { quote: "Remove (don't disable) progressive disclosure controls that don't apply in the current context. Progressive disclosure controls should always deliver on their promise.", source: "knowledge-base/sources/04-b2b-saas-practice-and-case-studies.md" },
      { quote: "0% click-through on an unlabelled non-standard icon", source: "knowledge-base/sources/11-sweep-navigation-findability.md" },
      { quote: "Where \"Advanced\"/\"More\" nesting shows up", source: "knowledge-base/sources/07-apollo-settings-map.md" },
    ],
    openDoors: ["connect.deletions"],
  },
  {
    rule: 5,
    title: "Keep context across the boundary",
    chrome: "product",
    moved: "The write rule leaves its own \"Data writing rules\" block and moves into the row of the field pair it governs, so the pair and its rule are read together. The matching key leaves the Accounts tab and joins deletion and merge in one group: the three questions that decide what a duplicate does. The stage map gains the line that ties it to push-by-stage on the rules step. And the page starts saving every answer as it is made, with Save and exit and a draft that resumes.",
    why: "Fields edited together must be seen together, and a wizard that forgets what you typed splits context across time as well as space.",
    evidence: [
      { quote: "Never put information in one accordion item that needs to be referenced in another accordion item", source: "knowledge-base/00-core-model.md" },
      { quote: "A single, central capacity limit averaging about four chunks is implicated.", source: "knowledge-base/sources/02-cognitive-science.md" },
      { quote: "Apollo mirrors your CRM: it **never** auto-merges or auto-deletes duplicates, so you clean the CRM **before** connecting.", source: "knowledge-base/sources/16-apollo-workflow-inventory.md" },
    ],
    openDoors: ["connect.deletions"],
  },
  {
    rule: 7,
    title: "Decision-critical information is never behind a door",
    chrome: "product",
    moved: "The six-hour timer goes. Nothing syncs until someone presses a button, and that button is on the last step. Deletion, merge and matching come out of the door onto the open page, each with a line saying what it destroys. The review step gains the sentence that was never anywhere: how many records the first sync will pull, how many it will push, what a deletion will do and what a merge will do. And what the sync user must be able to do in Salesforce moves above the sign-in button, because a requirement discovered after the consent screen is discovered too late.",
    why: "What a connection will do to the system of record is the one thing the admin must never lose sight of.",
    evidence: [
      { quote: "never hide decision-critical information (price, requirements, risks, privacy terms) behind the second level", source: "knowledge-base/sources/01-foundations-and-definitions.md" },
      { quote: "Apollo mirrors your CRM: it **never** auto-merges or auto-deletes duplicates, so you clean the CRM **before** connecting.", source: "knowledge-base/sources/16-apollo-workflow-inventory.md" },
      { quote: "Intensive at setup (6-hour window!), then on field changes; error logs weekly", source: "knowledge-base/sources/07-apollo-settings-map.md" },
    ],
    openDoors: [],
  },
  {
    rule: 1,
    title: "Hide the rare, never the necessary",
    chrome: "product",
    moved: "Now the split is decided by how often this seat touches each thing, not by how important it sounded. The error log leaves the wizard entirely: errors, retry, status and history are the integration page's level one at 30, 20, 40 and 20 weekly for Meridian's admin, and they are nothing to do with a first connection. Inside the wizard, the activity types and the tail of unmapped Salesforce fields go behind two doors, because almost nobody touches them on a first connection.",
    why: "Level one is decided by weekly use per role and per business, measured, not by what felt important in a meeting.",
    evidence: [
      { quote: "You must disclose everything that users frequently need up front.", source: "knowledge-base/00-core-model.md" },
      { quote: "Intensive at setup (6-hour window!), then on field changes; error logs weekly", source: "knowledge-base/sources/07-apollo-settings-map.md" },
      { quote: "preferred to have unused functions tucked away.", source: "knowledge-base/sources/06-academic-literature.md" },
    ],
    openDoors: ["connect.activities.salesforce", "connect.unmapped.salesforce.Contacts"],
  },
  {
    rule: 6,
    title: "Prefer stable, user-controlled disclosure",
    chrome: "product",
    moved: "Nothing appears because the system guessed. The pull-condition builder appears because the radio beside it was chosen, not because a condition was filled in for the admin. The block that said fourteen fields had been mapped for you is replaced by a count that declares its own state — mapped, suggested, required unmapped — and saving the step is what turns a suggestion into a decision. The step list is derived from the kind chosen, six steps for a CRM and three otherwise, so the shape of the page follows an object on screen rather than a clock or last week.",
    why: "Object state is predictable; a timer and an inferred history are not.",
    evidence: [
      { quote: "The static menu was found to be significantly faster than the adaptive menu", source: "knowledge-base/sources/06-academic-literature.md" },
      { quote: "Static 2283 ms, Frequency 2298 ms, MCTS 2162 ms", source: "knowledge-base/00-core-model.md" },
      { quote: "6-hour configuration window before auto-sync starts.", source: "knowledge-base/sources/07-apollo-settings-map.md" },
    ],
    openDoors: [],
  },
  {
    rule: 8,
    title: "Fade the scaffold; give experts accelerators",
    chrome: "product",
    moved: "The page becomes the wizard as it ships: one step at a time, with the five steps already answered leaving the page for the step list, where each is a link carrying its own answer — \"Done: Salesforce (production)\", \"Done: 41 pairs\". The review and the first-sync sentence stay on the page, because that is the step the admin is on. Save and exit prints its shortcut, and the doors take one. The wizard is never the way to edit a mapping, retry an error or re-authorise; those are on the integration page, in place.",
    why: "The wizard is scaffolding for the first connection; the tenth connection and every later edit need a way past it.",
    evidence: [
      { quote: "annoying and overly controlling", source: "knowledge-base/00-core-model.md" },
      { quote: "accelerators \"unseen by the novice\"", source: "knowledge-base/09-expert-voices.md" },
      { quote: "persistently fail to adopt faster methods", source: "knowledge-base/00-core-model.md" },
    ],
    openDoors: [],
  },
]
