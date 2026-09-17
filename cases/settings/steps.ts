// The seven steps of the Settings case: the common version, then six rules in the order spec 14 §7
// fixes — 7, 1, 2, 4, 5, 8. Rules 6 and 3 are notes at the end of the README, not steps.
//
// Every quote below is in `knowledge-base/` or `knowledge-base/sources/`; the `source` names the
// file it is in. Every problem the common version shows is documented in
// `knowledge-base/sources/07-apollo-settings-map.md`, cited in the README's step table.
import type { LessonStep } from "@/learn/context"

export const steps: LessonStep[] = [
  {
    rule: null,
    chrome: "own",
    title: "The common version",
    moved:
      "Settings is not a page in this product; it is a product of its own. Clicking it replaces the main navigation with a 300-pixel settings sidebar, and the page you land on is not a setting but a checklist with four progress rings. The hundred settings are dealt into fourteen pages under eight collapsible groups named Rules of engagement, Credits and activity, Objects, fields, stages. Sub-pages add a row of tabs, and a mailbox adds four more tabs inside a drawer, so a signature is six interactions from the front door. The price is only on the Manage subscription checkout, Cancel plan is below the fold on Plan overview, and there is no delete: the help centre says to contact Support.",
    why:
      "Nobody designed this. Every request was added where it fit and nothing was ever moved, so the structure records the order the features arrived in rather than the order anyone needs them.",
    evidence: [
      { quote: "Data is fine.. but UX is very bad.. heavy loading pages to many windows with slow loading, too many clicks to reach data many navigation buttons seems to be not in the logical place", source: "sources/07-apollo-settings-map.md" },
      { quote: "Name of the features is a bit confusing to me.", source: "sources/07-apollo-settings-map.md" },
      { quote: "watch the credit system closely or you'll get surprised at the end of the month", source: "sources/07-apollo-settings-map.md" },
      { quote: "no self-serve control. KB: to delete a workspace an admin must contact Support/privacy@apollo.io", source: "sources/07-apollo-settings-map.md" },
    ],
  },

  {
    rule: 7,
    chrome: "own",
    title: "Decision-critical information is never behind a door",
    moved:
      "A strip appears above everything, and the facts that decide money and safety climb into it. The price and the renewal date come up from the Manage subscription checkout, as one total for the period rather than a per-seat breakdown. The credit balance and burn rate come up from Credit usage › Usage details, two tabs down, and gain a run-out date. Bounce guard's thresholds come up from Sending policies with the current rate that was on Bounce logs. Cancel plan leaves the foot of Plan overview and sits beside Change plan, the same size, with no reason picker. Delete workspace, the second-approval threshold, the credit-spike threshold, the upgrade requests waiting from teammates, the published API limits and the webhook delivery contract did not exist anywhere and are created here.",
    why:
      "Price, commitment, what a destructive action does and what can spend money on its own are the things a person came to check; a second level is where a product puts what it would rather you did not weigh.",
    evidence: [
      { quote: "price, requirements, risks, privacy terms", source: "sources/01-foundations-and-definitions.md" },
      { quote: "Consent lift from moving \"reject\" to second page | +22–23 points | Nouwens et al., CHI 2020", source: "00-core-model.md" },
      { quote: "small gray font at the bottom of the page", source: "11-what-changed-2018-2026.md" },
      { quote: "scroll to Cancel Plan (reason picker; \"Keep current plan\"; self-serve cancel \"isn't available for every team\")", source: "sources/07-apollo-settings-map.md" },
      { quote: "Apollo AI assistant ran operations quoting me a certain amount of credits, and then racked up a separate bill", source: "sources/07-apollo-settings-map.md" },
    ],
    openDoors: [],
  },

  {
    rule: 1,
    chrome: "product",
    title: "Hide the rare, never the necessary",
    moved:
      "The settings shell collapses into one page inside the product's own navigation. Get started, the Admin Settings flyout, the sidebar and its eight groups are gone. Every item this seat touches in twenty per cent of weeks or more is now on the surface — Users at forty-five, the mailboxes table at forty with warm-up and limits, sending domains, CRM sync and its error log, plan and seats — and everything under twenty sits behind exactly one door per area. The level is read from the usage model for this seat at this workspace, not from a hand-written list, so the same page has a different head for the agency's admin and the founder.",
    why:
      "A daily item parked behind a door charges an interaction tax on every visit, and a rare one on the surface costs everyone the time to scan past it.",
    evidence: [
      { quote: "You must disclose everything that users frequently need up front.", source: "00-core-model.md" },
      { quote: "6.4% is the median; best-in-class is 15.6%", source: "11-what-changed-2018-2026.md" },
      { quote: "Word 97 users touched about 27% of functions, yet preferred unused ones \"tucked away\" (45%) over removed (24.5%).", source: "09-expert-voices.md" },
      { quote: "one person's ideal default \"short\" menu was exactly the wrong thing for someone else", source: "sources/05-critiques-pitfalls-and-measurement.md" },
      { quote: "navigating between campaigns, contacts, and analytics feels like one click too many each time", source: "sources/07-apollo-settings-map.md" },
    ],
    openDoors: ["settings.team-and-access", "settings.email-sending", "settings.plan-billing-and-usage"],
  },

  {
    rule: 2,
    chrome: "product",
    title: "Stop at two levels",
    moved:
      "The rows of tabs inside the areas go. Security's five tabs — MFA, IP whitelisting, password policy, login controls, single sign-on — become five rows in Team and access. The Users, Teams and Permission profiles sub-pages become rows with a flat drawer each. Email setup's Overview, Domains, Mailboxes and Sending policies tabs become one list, and the mailbox drawer's four tabs become one flat drawer, so the six-interaction path to a signature becomes two. Sequences' five tabs become rows, and Plan overview, Manage subscription, Billing and Credit usage merge into one area. The deepest path is now the page and one door, on the desktop and on the phone.",
    why:
      "Past two levels people stop knowing where they are, and a third level is a sign the structure is wrong rather than the widget.",
    evidence: [
      { quote: "Designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels.", source: "00-core-model.md" },
      { quote: "Landauer & Nachbar found breadth beats depth in menus", source: "00-core-model.md" },
      { quote: "suggests the feature needs redesign", source: "08-principles-and-checklists.md" },
      { quote: "deepest common path: Settings › Email setup and health › Mailboxes › Show filters › mailbox › Overview › signature = 6 interactions", source: "sources/07-apollo-settings-map.md" },
    ],
    openDoors: ["settings.team-and-access", "settings.email-sending"],
  },

  {
    rule: 4,
    chrome: "product",
    title: "Make the door obvious and honest",
    moved:
      "Every area is renamed by what is in it and every door lists its contents with a count. Rules of engagement becomes Prospecting rules; Email setup and health, Mailboxes & domains and Deliverability suite become one name, Email sending; Credits and activity and System activity disappear into Plan, billing and usage; AI context center becomes a row, Company context, inside Agents and AI; Objects, fields, stages becomes Pipeline and data. The door that read \"Advanced\" now reads the names of the seven things behind it. And a feature the plan does not include stops being a greyed control with \"your admin hasn't provided you access\": it is a real button that opens a panel naming the plan, what the feature does and the monthly total.",
    why:
      "A door you cannot guess the contents of is a door nobody opens, and a greyed control tells a person they are not allowed something when the truth is that nobody has paid for it.",
    evidence: [
      { quote: "If the user cannot find it, it does not exist.", source: "00-core-model.md" },
      { quote: "Unlabelled icon as trigger | Can hit 0% click-through | Icon plus text", source: "08-principles-and-checklists.md" },
      { quote: "used in 27% of desktop cases vs 48–50% visible; task success more than 20 points lower; desktop users at least 39% slower", source: "09-expert-voices.md" },
      { quote: "Remove (don't disable) progressive disclosure controls that don't apply in the current context.", source: "sources/04-b2b-saas-practice-and-case-studies.md" },
      { quote: "they implicitly tell users that certain features are not for them", source: "00-core-model.md" },
      { quote: "If a setting is greyed out and you can't select it, your Apollo admin hasn't provided you access.", source: "sources/07-apollo-settings-map.md" },
    ],
    openDoors: ["settings.prospecting-rules", "settings.pipeline-and-data"],
  },

  {
    rule: 5,
    chrome: "product",
    title: "Keep context across the boundary",
    moved:
      "A new area, How your team works, gathers the four things that decide what everyone sees: the declared workspace profile with the three answers behind it, which seats exist, which pages the profile leaves out with the signal count for each, and the two-week exposure running now with its keep-or-drop question. None of these existed before; the sidebar was simply the sidebar. Then the pairs come together: the unsubscribe text, which lived under the person's own profile, and the permission to disable it, which lived in Permission profiles, are now one after the other in Email sending. Every door remembers whether it was left open, and Expand all appears in the header and is remembered too; printing expands everything.",
    why:
      "Two fields you can only judge together must not sit on opposite sides of a boundary, because working memory holds about four chunks and crossing the door spends them.",
    evidence: [
      { quote: "four chunks", source: "08-principles-and-checklists.md" },
      { quote: "Never put information in one accordion item that needs to be referenced in another accordion item.", source: "00-core-model.md" },
      { quote: "make the state persist", source: "08-principles-and-checklists.md" },
      { quote: "Unsubscribe/opt-out text is per-user (Profile › Email settings), but admins can force it via the permission \"User can disable opt-out message\".", source: "sources/07-apollo-settings-map.md" },
    ],
    openDoors: ["settings.email-sending", "settings.how-your-team-works"],
  },

  {
    rule: 8,
    chrome: "product",
    title: "Fade the scaffold; give experts accelerators",
    moved:
      "The search box, the one thing the common version got right, stops finding pages and starts finding settings: it opens the door the setting is behind, scrolls to the row, focuses the control and lights it for two seconds. A slash focuses the box and the box shows the slash, so the shortcut is on screen rather than in a tooltip. Every setting gains a deep-link anchor the palette, the toasts and the connect wizard use. Warm-up and sending limits are editable in the table rows, so the people who check them every morning never open a drawer at all. And the promote-keep-delete audit is in the README: what was promoted, what was tucked away and the two dozen things that were deleted rather than hidden.",
    why:
      "Doors are scaffolding for the many; the people who live on this screen need a way past them, and the only teaching that works is exposure, not hints.",
    evidence: [
      { quote: "unseen by the novice user", source: "10-glossary.md" },
      { quote: "shortcut usage went 9.79% → 86.20% with everything exposed → 73.09% after removal (ExposeHK, IHM 2025)", source: "08-principles-and-checklists.md" },
      { quote: "a keyboard map held median 10 shortcuts at 24 hours against a list's 5.5 (KeyMap, CHI 2020, n=98)", source: "08-principles-and-checklists.md" },
      { quote: "persistently fail to adopt faster methods", source: "00-core-model.md" },
      { quote: "a **Search settings** box at the top of the sidebar", source: "sources/07-apollo-settings-map.md" },
    ],
    openDoors: [],
  },
]
