// The scene catalogue: every page of the map at rest, and every interaction state worth seeing.
//
// A scene is a place plus a seat plus a list of small actions. `scripts/see.mjs` runs it at each
// width and theme and writes one image per combination, so the product can be read as pictures
// rather than as code.
//
// Steps are named actions, written the way they read: `hover("…")`, `openPane(1)`, `press("]")`.
// Every step name is implemented once in see.mjs; nothing here knows how puppeteer works.

// ---------------------------------------------------------------------------- the step vocabulary

export const hover = (selector) => ({ do: "hover", selector })
export const focus = (selector) => ({ do: "focus", selector })
export const click = (selector) => ({ do: "click", selector })
/** Click the first visible control whose accessible text matches. Steadier than a CSS path. */
export const clickText = (text) => ({ do: "clickText", text })
export const press = (key) => ({ do: "press", key })
/** Open the beside pane from row n (1-based) through that row's "…" menu. */
export const openPane = (row) => ({ do: "openPane", row })
/** The pane's next-in-list step, which is also the `]` key. */
export const next = () => ({ do: "next" })
/** A step inside the pane: open its first door, so the pane shows a level deeper. */
export const inPaneStep = () => ({ do: "inPaneStep" })
/** The pane's middle state: the header control that widens it over the page and shows the next
 *  level of the record. The same control narrows it back. */
export const expandPane = () => ({ do: "expandPane" })
export const openMenu = (row) => ({ do: "openMenu", row })
export const openDialog = (label) => ({ do: "openDialog", label })
export const openDoor = (label) => ({ do: "openDoor", label })
export const expandAll = () => ({ do: "expandAll" })
export const openPalette = () => ({ do: "openPalette" })
export const openBell = () => ({ do: "openBell" })
export const quickLook = (row) => ({ do: "quickLook", row })
/** The Inbox split: drag its divider by px, negative for left. */
export const dragDivider = (px) => ({ do: "dragDivider", px })
/** Pick a card up on the board and hold it over another column, without dropping it. */
export const dragCard = (from, to) => ({ do: "dragCard", from, to })
export const scroll = (y) => ({ do: "scroll", y })
export const wait = (ms) => ({ do: "wait", ms })
/** Follow a row into its record, so the trail has a crumb. */
export const follow = (row) => ({ do: "follow", row })
/** Follow, then come back, so the return cue is lit on the row that was left. */
export const returnBack = () => ({ do: "returnBack" })
/** The phone's navigation sheet, opened from the header's sidebar trigger. */
export const openSheet = () => ({ do: "openSheet" })

// ---------------------------------------------------------------------------- widths and themes

const REST = { widths: [1440, 1024, 400], themes: ["light", "dark"] }
const ACT = { widths: [1440, 400], themes: ["light"] }
const PHONE = { widths: [400], themes: ["light"] }
const DESKTOP = { widths: [1440], themes: ["light"] }

const rest = (id, page, caption, route, seat, steps = []) =>
  ({ id, page, caption, route, seat, steps, ...REST })
const act = (id, page, caption, route, seat, steps) =>
  ({ id, page, caption, route, seat, steps, ...ACT })

// ---------------------------------------------------------------------------- the pages, at rest

const SETTINGS_AREAS = [
  ["you", "You"],
  ["workspace", "Workspace"],
  ["how-your-team-works", "How your team works"],
  ["team", "Team and access"],
  ["email-sending", "Email sending"],
  ["prospecting", "Prospecting rules"],
  ["pipeline", "Pipeline and data"],
  ["sequences", "Sequences"],
  ["scoring", "Signals, scoring and personas"],
  ["agents", "Agents and AI"],
  ["integrations", "Integrations"],
  ["developer", "API, webhooks, MCP and CLI"],
  ["plan", "Plan, billing and usage"],
]

const PAGES = [
  rest("home", "Home", "Home at rest", "/ollopa", "meridian:sdr"),
  rest("people", "People", "People at rest", "/ollopa/people", "meridian:sdr"),
  rest("person", "People", "A contact record", "/ollopa/people/c-13", "meridian:sdr"),
  rest("companies", "Companies", "Companies at rest", "/ollopa/companies", "meridian:sdr"),
  rest("company", "Companies", "A company record", "/ollopa/companies/co-1", "meridian:sdr"),
  rest("lists", "Lists", "Lists at rest", "/ollopa/lists", "meridian:sdr"),
  rest("sequences", "Sequences", "Sequences at rest", "/ollopa/sequences", "meridian:sdr"),
  rest("sequence", "Sequences", "A sequence record", "/ollopa/sequences/seq-1", "meridian:sdr"),
  rest("templates", "Templates", "Templates at rest", "/ollopa/templates", "meridian:sdr"),
  rest("inbox", "Inbox", "Inbox at rest, reading pane open", "/ollopa/inbox", "meridian:sdr"),
  rest("tasks-queue", "Tasks", "Tasks, the queue body", "/ollopa/tasks", "meridian:sdr"),
  rest("tasks-list", "Tasks", "Tasks, the list body", "/ollopa/tasks", "meridian:sdr", [press("w"), wait(400)]),
  rest("deals-board", "Deals", "The deals board", "/ollopa/deals", "meridian:ae"),
  rest("deals-table", "Deals", "The deals table", "/ollopa/deals", "meridian:ae", [clickText("Table"), wait(500)]),
  rest("deal", "Deals", "A deal record", "/ollopa/deals/d-118", "meridian:ae"),
  rest("campaigns", "Campaigns", "Campaigns at rest", "/ollopa/campaigns", "meridian:marketer"),
  rest("campaign", "Campaigns", "A campaign record", "/ollopa/campaigns/camp-4", "meridian:marketer"),
  rest("accounts", "Accounts", "Accounts at rest", "/ollopa/accounts", "meridian:cs"),
  rest("audience", "Campaigns", "An audience record", "/ollopa/audiences/aud-1", "meridian:marketer"),
  rest("form", "Campaigns", "A form record", "/ollopa/forms/form-1", "meridian:marketer"),
  rest("workflows", "Workflows", "Workflows at rest", "/ollopa/workflows", "meridian:marketer"),
  rest("workflow", "Workflows", "A workflow record", "/ollopa/workflows/wf-1", "meridian:marketer"),
  rest("requests", "Requests", "Requests at rest", "/ollopa/requests", "meridian:admin"),
  rest("reports", "Reports", "Reports at rest", "/ollopa/reports", "meridian:admin"),
  rest("agents", "Agents", "Agents at rest", "/ollopa/agents", "meridian:admin"),
  rest("settings", "Settings", "Settings at rest", "/ollopa/settings", "meridian:admin"),
  ...SETTINGS_AREAS.map(([slug, name]) =>
    rest(`settings-${slug}`, "Settings", `Settings · ${name}`, `/ollopa/settings/${slug}`, "meridian:admin")),
  rest("connect-1", "Connect wizard", "Connect an integration, step 1", "/ollopa/connect/salesforce?step=1", "meridian:admin"),
  // The wizard's step is in the address, so the last step is a place, not four clicks.
  rest("connect-5", "Connect wizard", "Connect an integration, the last step", "/ollopa/connect/salesforce?step=5", "meridian:admin"),
  rest("import", "Import wizard", "Import and enrich", "/ollopa/import", "meridian:sdr"),
  rest("integration", "Integrations", "A connected integration", "/ollopa/integrations/int-1", "meridian:admin"),
  rest("job", "Integrations", "An enrichment job report", "/ollopa/enrichment/local-import", "meridian:sdr"),
  rest("developer", "Developer", "The developer page", "/ollopa/developer/api", "meridian:admin"),
  rest("setup", "Set-up", "Workspace set-up", "/ollopa/setup", "meridian:admin"),
  rest("signin", "Sign in", "The sign-in page", "/ollopa/signin", "meridian:admin"),
]

// ---------------------------------------------------------------------------- the interactions

const ACTS = [
  act("act-row-hover", "People", "A row under the pointer", "/ollopa/people", "meridian:sdr", [
    hover('[data-page-active="true"] tbody tr, [data-page-active="true"] [data-item]'), wait(250),
  ]),
  act("act-row-focus", "People", "A row with the focus ring", "/ollopa/people", "meridian:sdr", [
    focus('[data-page-active="true"] tbody tr, [data-page-active="true"] [data-item]'), wait(250),
  ]),
  act("act-pane-open", "People", "The beside pane, open on a row", "/ollopa/people", "meridian:sdr", [
    openPane(1), wait(700),
  ]),
  act("act-pane-next", "People", "The pane, stepped to the next in the list", "/ollopa/people", "meridian:sdr", [
    openPane(1), wait(600), next(), wait(600),
  ]),
  act("act-pane-step", "People", "A level deeper inside the pane", "/ollopa/people", "meridian:sdr", [
    openPane(1), wait(600), inPaneStep(), wait(500),
  ]),
  // The pane's middle state: widened over the page, the list still behind it, the next level of the
  // record in it. At 400 it is the same width as the glance and the control changes the level only.
  act("act-pane-expanded", "People", "The pane, widened over the page", "/ollopa/people", "meridian:sdr", [
    openPane(1), wait(600), expandPane(), wait(600),
  ]),
  act("act-quick-look-expanded", "People", "The quick look, widened over the table", "/ollopa/people", "meridian:sdr", [
    quickLook(1), wait(600), expandPane(), wait(600),
  ]),
  act("act-row-menu", "People", "A row's menu, open", "/ollopa/people", "meridian:sdr", [
    openMenu(1), wait(400),
  ]),
  // The destructive act lives in the header's "…" now (DESIGN.md §1), so the menu opens first.
  act("act-dialog", "Deals", "An irreversible act asking first", "/ollopa/deals/d-118", "meridian:ae", [
    clickText("More acts"), wait(400), openDialog("Delete deal"), wait(600),
  ]),
  act("act-door", "Settings", "A door, open", "/ollopa/settings", "meridian:admin", [
    openDoor(), wait(500),
  ]),
  act("act-expand-all", "Home", "Home with every door open", "/ollopa", "meridian:sdr", [
    wait(600), expandAll(), wait(700),
  ]),
  act("act-palette", "Home", "The command palette", "/ollopa", "meridian:sdr", [
    openPalette(), wait(500),
  ]),
  act("act-bell", "Home", "The notification channel", "/ollopa", "meridian:sdr", [
    openBell(), wait(600),
  ]),
  act("act-quick-look", "People", "The quick look over the table", "/ollopa/people", "meridian:sdr", [
    quickLook(1), wait(600),
  ]),
  // At 400 the inbox is one pane and there is no divider to drag, so these two run wide only.
  { id: "act-divider-left", page: "Inbox", caption: "The inbox split, dragged 200 px left",
    route: "/ollopa/inbox", seat: "meridian:sdr", steps: [dragDivider(-200), wait(400)],
    widths: [1440, 1024], themes: ["light"] },
  { id: "act-divider-right", page: "Inbox", caption: "The inbox split, dragged 200 px right",
    route: "/ollopa/inbox", seat: "meridian:sdr", steps: [dragDivider(200), wait(400)],
    widths: [1440, 1024], themes: ["light"] },
  act("act-card-drag", "Deals", "A deal card mid-drag", "/ollopa/deals", "meridian:ae", [
    wait(800), dragCard(1, 2), wait(400),
  ]),
  act("act-trail", "People", "The trail, after following a row", "/ollopa/people", "meridian:sdr", [
    follow(1), wait(800),
  ]),
  act("act-return-cue", "People", "The return cue, lit on the row that was left", "/ollopa/people", "meridian:sdr", [
    follow(1), wait(800), returnBack(), wait(500),
  ]),
  { id: "act-phone-sheet", page: "Shell", caption: "The phone's navigation sheet", route: "/ollopa",
    seat: "meridian:sdr", steps: [openSheet(), wait(600)], ...PHONE },
  { id: "act-phone-bar", page: "Deals", caption: "The record's phone action bar", route: "/ollopa/deals/d-118",
    seat: "meridian:ae", steps: [wait(400)], ...PHONE },
  { id: "act-sidebar-collapsed", page: "Shell", caption: "The sidebar collapsed to its rail", route: "/ollopa",
    seat: "meridian:sdr", steps: [clickText("Toggle Sidebar"), wait(500)], ...DESKTOP },
]

export const SCENES = [...PAGES, ...ACTS]
export default SCENES
