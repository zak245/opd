// The node registry, derived from IA-MAP.md part 2.
//
// One table, read by four things that must never disagree: the sidebar (nav.ts), the ⌘K palette,
// deep links, and the no-access answer. It holds every node that is a destination — page, record,
// wizard, settings area, surface — plus the shell's own channels. Doors and page-level panels are
// not here: they belong to the page that owns them, and a door has no route.
//
// Columns are IA-MAP's: id, name, type, the Page it belongs to, seats, sidebar profiles, plan gate.
// Seat abbreviations there map to the five roles here: SDR → sdr, AE → ae, MK → marketer,
// CS → cs, OPS → admin.
import type { Business, Page, Role } from "./usage/model"
import type { Profile } from "./session"

export type NodeType = "page" | "record" | "wizard" | "settings area" | "surface" | "panel" | "page mode"

export interface MapNode {
  id: string
  name: string
  type: NodeType
  /** The usage-model page this node belongs to. Shell nodes are `home`, as `usage/shell.ts` has them. */
  page: Page
  /** Hash route without the leading "#". `:id` marks a record segment. Absent for nodes with no URL. */
  route?: string
  /** The seats that may open it. A seat outside this list gets `G-noaccess`, never a greyed control. */
  seats: Role[]
  /** The profiles whose default sidebar carries this node's entry point. Empty means it is not a sidebar entry. */
  profiles: Profile[]
  /** The plan on which it unlocks; null means every plan. */
  gate: "Growth" | "Scale" | null
  /** What a person searching for it might type instead (⌘K synonyms). */
  synonyms?: string[]
}

const ALL: Role[] = ["sdr", "ae", "marketer", "cs", "admin"]
const EVERY: Profile[] = ["founder-led", "separated", "agency", "product-led"]
const NONE: Profile[] = []

/**
 * What each profile takes out of a sidebar, with the seats it applies to and the signal that
 * brings it back (spec 16 §3, "What each profile leaves out"; PLAN.md "Founder-led omissions").
 * A profile may subtract from a seat's sidebar; it may never add a page the seat does not hold.
 */
export interface Omission { page: Page; seats?: Role[]; signal: string }

export const PROFILE_LEAVES_OUT: Record<Profile, Omission[]> = {
  "founder-led": [
    { page: "inbox", signal: "the first reply" },
    { page: "campaigns", signal: "the first audience or campaign anyone creates" },
    { page: "accounts", signal: "the first deal reaching Closed won" },
    { page: "reports", signal: "the first full week with more than ten sends" },
    { page: "workflows", signal: "the first workflow anybody creates" },
    { page: "requests", signal: "the second upgrade request in a week" },
  ],
  separated: [],
  agency: [
    { page: "campaigns", signal: "the first audience" },
    { page: "accounts", signal: "the first deal reaching Closed won" },
    { page: "workflows", signal: "the first workflow anybody creates" },
  ],
  "product-led": [
    { page: "sequences", seats: ["ae", "admin"], signal: "a sequence created, or a step due for you" },
    { page: "lists", seats: ["admin"], signal: "a list created" },
  ],
  "not-declared": [],
}

/** Does this profile leave the page out of this seat's sidebar? */
export function leftOut(page: Page, profile: Profile, role: Role): Omission | undefined {
  return PROFILE_LEAVES_OUT[profile].find((o) => o.page === page && (!o.seats || o.seats.includes(role)))
}

/** The profiles that keep a page for at least one seat — the map's sidebar column. */
function keeps(page: Page): Profile[] {
  return EVERY.filter((p) => !PROFILE_LEAVES_OUT[p].some((o) => o.page === page && !o.seats))
}

export const NODES: MapNode[] = [
  // 2.1 Shell and entry
  { id: "G-signin", name: "Sign in", type: "page", page: "home", route: "/ollopa/signin", seats: ALL, profiles: NONE, gate: null },
  { id: "W-setup", name: "Workspace set-up", type: "wizard", page: "setup", route: "/ollopa/setup", seats: ["admin"], profiles: NONE, gate: null, synonyms: ["how your team works", "profile", "three questions"] },
  { id: "G-palette", name: "Search or jump to", type: "panel", page: "home", seats: ALL, profiles: NONE, gate: null },
  { id: "G-bell", name: "Notifications", type: "panel", page: "home", seats: ALL, profiles: NONE, gate: null },
  { id: "G-account", name: "Account menu", type: "panel", page: "home", seats: ALL, profiles: NONE, gate: null },
  { id: "G-shortcuts", name: "Keyboard shortcuts", type: "panel", page: "home", seats: ALL, profiles: NONE, gate: null },
  { id: "G-noaccess", name: "Not part of your seat", type: "page", page: "home", seats: ALL, profiles: NONE, gate: null },
  { id: "X-upgrade", name: "Upgrade", type: "panel", page: "settings", seats: ALL, profiles: NONE, gate: null },
  { id: "X-credits", name: "Credit breakdown by feature, person and surface", type: "panel", page: "settings", seats: ALL, profiles: NONE, gate: null, synonyms: ["credits", "burn", "runway", "balance"] },
  { id: "X-viewas", name: "View as", type: "page mode", page: "settings", seats: ["admin"], profiles: NONE, gate: "Growth" },

  // 2.2 Home
  { id: "P-home", name: "Home", type: "page", page: "home", route: "/ollopa", seats: ALL, profiles: EVERY, gate: null },

  // 2.3 People
  { id: "P-people", name: "People", type: "page", page: "people", route: "/ollopa/people", seats: ["sdr", "ae", "marketer", "admin"], profiles: keeps("people"), gate: null, synonyms: ["contacts", "prospects", "leads"] },
  { id: "R-person", name: "Contact record", type: "record", page: "people", route: "/ollopa/people/:id", seats: ALL, profiles: NONE, gate: null },

  // 2.4 Companies and accounts
  { id: "P-companies", name: "Companies", type: "page", page: "companies", route: "/ollopa/companies", seats: ["sdr", "ae", "cs", "admin"], profiles: keeps("companies"), gate: null, synonyms: ["accounts list", "organisations"] },
  { id: "R-company", name: "Company record", type: "record", page: "companies", route: "/ollopa/companies/:id", seats: ALL, profiles: NONE, gate: null },
  { id: "P-accounts", name: "Accounts", type: "page", page: "accounts", route: "/ollopa/accounts", seats: ["ae", "cs", "admin"], profiles: keeps("accounts"), gate: null, synonyms: ["customers", "renewals", "health"] },

  // 2.5 Lists and segments
  { id: "P-lists", name: "Lists", type: "page", page: "lists", route: "/ollopa/lists", seats: ["sdr", "marketer", "admin"], profiles: keeps("lists"), gate: null, synonyms: ["segments"] },
  { id: "R-list", name: "List or segment", type: "record", page: "lists", route: "/ollopa/lists/:id", seats: ["sdr", "marketer", "admin"], profiles: NONE, gate: null },

  // 2.6 Sequences, steps and templates
  { id: "P-sequences", name: "Sequences", type: "page", page: "sequences", route: "/ollopa/sequences", seats: ["sdr", "ae", "admin"], profiles: keeps("sequences"), gate: null, synonyms: ["cadences", "outreach"] },
  { id: "R-sequence", name: "Sequence", type: "record", page: "sequences", route: "/ollopa/sequences/:id", seats: ["sdr", "ae", "admin"], profiles: NONE, gate: null },
  { id: "P-templates", name: "Templates and snippets", type: "page", page: "templates", route: "/ollopa/templates", seats: ["sdr", "ae", "marketer", "admin"], profiles: NONE, gate: null, synonyms: ["snippets", "email copy"] },
  { id: "R-template", name: "Template or snippet", type: "record", page: "templates", route: "/ollopa/templates/:id", seats: ["sdr", "ae", "marketer", "admin"], profiles: NONE, gate: null },

  // 2.7 Inbox, meetings, briefs
  { id: "P-inbox", name: "Inbox", type: "page", page: "inbox", route: "/ollopa/inbox", seats: ["sdr", "ae"], profiles: keeps("inbox"), gate: null, synonyms: ["replies", "threads"] },
  { id: "X-thread", name: "The thread", type: "record", page: "inbox", route: "/ollopa/inbox/:id", seats: ["sdr", "ae"], profiles: NONE, gate: null },
  { id: "R-brief", name: "Brief", type: "record", page: "home", route: "/ollopa/briefs/:id", seats: ALL, profiles: NONE, gate: null },

  // 2.8 Tasks, calls and LinkedIn
  { id: "P-tasks", name: "Tasks", type: "page", page: "tasks", route: "/ollopa/tasks", seats: ["sdr", "ae", "cs", "admin"], profiles: keeps("tasks"), gate: null, synonyms: ["queue", "to do", "calls"] },

  // 2.9 Deals
  { id: "P-deals", name: "Deals", type: "page", page: "deals", route: "/ollopa/deals", seats: ["ae", "cs", "admin"], profiles: keeps("deals"), gate: null, synonyms: ["pipeline", "board"] },
  { id: "R-deal", name: "Deal", type: "record", page: "deals", route: "/ollopa/deals/:id", seats: ALL, profiles: NONE, gate: null },

  // 2.10 Campaigns, audiences and forms
  { id: "P-campaigns", name: "Campaigns", type: "page", page: "campaigns", route: "/ollopa/campaigns", seats: ["marketer", "admin"], profiles: keeps("campaigns"), gate: null, synonyms: ["audiences", "forms", "sends"] },
  { id: "R-campaign", name: "Campaign", type: "record", page: "campaigns", route: "/ollopa/campaigns/:id", seats: ["marketer", "admin"], profiles: NONE, gate: null },
  { id: "R-audience", name: "Audience or segment", type: "record", page: "campaigns", route: "/ollopa/audiences/:id", seats: ["marketer", "admin"], profiles: NONE, gate: null },
  { id: "R-form", name: "Form", type: "record", page: "campaigns", route: "/ollopa/forms/:id", seats: ["marketer", "admin"], profiles: NONE, gate: null },

  // 2.11 Workflows and requests
  { id: "P-workflows", name: "Workflows", type: "page", page: "workflows", route: "/ollopa/workflows", seats: ["admin", "marketer"], profiles: keeps("workflows"), gate: "Growth", synonyms: ["routing", "rules", "automation"] },
  { id: "R-workflow", name: "Workflow", type: "record", page: "workflows", route: "/ollopa/workflows/:id", seats: ["admin", "marketer"], profiles: NONE, gate: "Growth" },
  { id: "P-requests", name: "Requests", type: "page", page: "requests", route: "/ollopa/requests", seats: ["admin"], profiles: keeps("requests"), gate: null, synonyms: ["intake", "upgrade requests", "asks"] },
  { id: "R-request", name: "Request", type: "record", page: "requests", route: "/ollopa/requests/:id", seats: ["admin"], profiles: NONE, gate: null },

  // 2.12 Reports
  { id: "P-reports", name: "Reports", type: "page", page: "reports", route: "/ollopa/reports", seats: ["ae", "marketer", "cs", "admin"], profiles: keeps("reports"), gate: null, synonyms: ["analytics", "forecast", "dashboards"] },

  // 2.13 Agents
  { id: "P-agents", name: "Agents", type: "page", page: "agents", route: "/ollopa/agents", seats: ["sdr", "ae", "marketer", "admin"], profiles: keeps("agents"), gate: null, synonyms: ["approvals", "runs", "ledger", "AI"] },

  // 2.14 Settings
  { id: "P-settings", name: "Settings", type: "page", page: "settings", route: "/ollopa/settings", seats: ALL, profiles: keeps("settings"), gate: null },
  { id: "S-you", name: "You", type: "settings area", page: "settings", route: "/ollopa/settings/you", seats: ALL, profiles: NONE, gate: null, synonyms: ["signature", "your mailbox", "notification delivery", "digest", "quiet hours"] },
  { id: "S-workspace", name: "Workspace", type: "settings area", page: "settings", route: "/ollopa/settings/workspace", seats: ["admin"], profiles: NONE, gate: null, synonyms: ["timezone", "currency", "workspace name"] },
  { id: "S-howteam", name: "How your team works", type: "settings area", page: "settings", route: "/ollopa/settings/how-your-team-works", seats: ["admin"], profiles: NONE, gate: null, synonyms: ["profile", "sidebar", "seats", "set-up answers"] },
  { id: "S-team", name: "Team and access", type: "settings area", page: "settings", route: "/ollopa/settings/team", seats: ["admin"], profiles: NONE, gate: "Growth", synonyms: ["users", "permissions", "profiles", "territories", "SSO"] },
  { id: "S-sending", name: "Email sending", type: "settings area", page: "settings", route: "/ollopa/settings/email-sending", seats: ["admin", "sdr"], profiles: NONE, gate: "Growth", synonyms: ["SPF", "DKIM", "DMARC", "bounce guard", "auto-pause", "mailboxes", "sending domains"] },
  { id: "S-prospecting", name: "Prospecting rules", type: "settings area", page: "settings", route: "/ollopa/settings/prospecting", seats: ["admin"], profiles: NONE, gate: "Growth", synonyms: ["GDPR", "do not contact", "duplicates", "removal list"] },
  { id: "S-pipeline", name: "Pipeline and data", type: "settings area", page: "settings", route: "/ollopa/settings/pipeline", seats: ["admin"], profiles: NONE, gate: null, synonyms: ["stages", "custom fields", "required at stage", "currency"] },
  { id: "S-sequences", name: "Sequences", type: "settings area", page: "settings", route: "/ollopa/settings/sequences", seats: ["admin", "sdr"], profiles: NONE, gate: "Growth", synonyms: ["schedules", "sending rules", "priority"] },
  { id: "S-scoring", name: "Signals, scoring and personas", type: "settings area", page: "settings", route: "/ollopa/settings/scoring", seats: ["admin", "marketer"], profiles: NONE, gate: null, synonyms: ["score model", "personas", "signals", "routing threshold"] },
  { id: "S-agents", name: "Agents and AI", type: "settings area", page: "settings", route: "/ollopa/settings/agents", seats: ["admin"], profiles: NONE, gate: null, synonyms: ["credit cap", "approval policy", "model key", "company context"] },
  { id: "S-integrations", name: "Integrations", type: "settings area", page: "settings", route: "/ollopa/settings/integrations", seats: ["admin"], profiles: NONE, gate: "Growth", synonyms: ["Salesforce", "HubSpot", "Slack", "sync error log"] },
  { id: "S-developer", name: "API, webhooks, MCP and CLI", type: "settings area", page: "settings", route: "/ollopa/settings/developer", seats: ["admin"], profiles: NONE, gate: "Growth", synonyms: ["API keys", "webhooks", "MCP", "CLI", "tokens"] },
  { id: "S-plan", name: "Plan, billing and usage", type: "settings area", page: "settings", route: "/ollopa/settings/plan", seats: ["admin"], profiles: NONE, gate: null, synonyms: ["price", "invoice", "renewal", "credit balance and burn rate", "runway", "cancel"] },

  // 2.15 Integrations, imports and jobs
  { id: "W-connect", name: "Connect an integration", type: "wizard", page: "connect", route: "/ollopa/connect/:id", seats: ALL, profiles: NONE, gate: null },
  { id: "R-integration", name: "Integration", type: "record", page: "connect", route: "/ollopa/integrations/:id", seats: ALL, profiles: NONE, gate: null },
  { id: "W-import", name: "Import and enrich", type: "wizard", page: "enrichment", route: "/ollopa/import", seats: ["sdr", "marketer", "admin"], profiles: NONE, gate: null, synonyms: ["CSV", "upload"] },
  { id: "R-job", name: "Enrichment job", type: "record", page: "enrichment", route: "/ollopa/enrichment/:id", seats: ["sdr", "marketer", "admin"], profiles: NONE, gate: null },

  // 2.16 Developer surfaces
  { id: "U-api", name: "The API", type: "surface", page: "developer", route: "/ollopa/developer/api", seats: ["admin"], profiles: NONE, gate: "Growth" },
  { id: "U-hooks", name: "Webhooks", type: "surface", page: "developer", route: "/ollopa/developer/webhooks", seats: ["admin"], profiles: NONE, gate: "Growth" },
  { id: "U-mcp", name: "MCP: read, safe writes, destructive writes", type: "surface", page: "developer", route: "/ollopa/developer/mcp", seats: ALL, profiles: NONE, gate: null },
  { id: "U-cli", name: "The CLI", type: "surface", page: "developer", route: "/ollopa/developer/cli", seats: ["admin", "sdr"], profiles: NONE, gate: "Growth" },

  // 2.17 Notification surfaces
  { id: "U-slack", name: "Slack messages", type: "surface", page: "settings", seats: ALL, profiles: NONE, gate: null },
  { id: "U-digest", name: "The daily email digest", type: "surface", page: "settings", seats: ALL, profiles: NONE, gate: null },
]

/**
 * What a person types instead of the label, for the settings items ⌘K must find (spec 00 §3.3).
 * These belong on the usage items as `synonyms`; `usage/` is not this builder's file, so they sit
 * here, keyed by the item label, until that field lands.
 */
export const SETTING_SYNONYMS: Record<string, string[]> = {
  "Sending domains": ["SPF", "DKIM", "DMARC"],
  "Bounce guard: warns at 4%, pauses at 6%": ["auto-pause", "bounce rate", "paused"],
  "Credit balance and burn rate": ["runway", "credits", "burn"],
}

export function nodeById(id: string): MapNode | undefined {
  return NODES.find((n) => n.id === id)
}

/** The node that owns a page's own route, e.g. `people` → `P-people`. */
export function nodeForPage(page: Page): MapNode | undefined {
  return NODES.find((n) => n.page === page && n.type !== "record" && n.route === `/ollopa/${page === "home" ? "" : page}`.replace(/\/$/, ""))
    ?? NODES.find((n) => n.page === page && (n.type === "page" || n.type === "wizard"))
}

export function seatHolds(node: MapNode, role: Role): boolean {
  return node.seats.includes(role)
}

/** Which seats hold a page, in plain words, for the no-access sentence and the palette's gap row. */
export function seatsHolding(page: Page): Role[] {
  const node = nodeForPage(page)
  return node ? node.seats : []
}

/** Seats as people call them, in the plural. */
export const SEAT_PLURAL: Record<Role, string> = {
  sdr: "SDRs",
  ae: "Account executives",
  marketer: "Marketers",
  cs: "Customer success managers",
  admin: "RevOps admins",
}

/** "SDRs, Account executives and RevOps admins" — the half-sentence both gap answers share. */
export function seatsSentence(page: Page): string {
  const names = seatsHolding(page).map((r) => SEAT_PLURAL[r])
  if (names.length === 0) return "other seats"
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
}

export interface Match { node: MapNode; id?: string }

/**
 * Deep links are a first-class route (IA-MAP part 1): `#/ollopa/<page>` for a page,
 * `#/ollopa/<page>/<id>` for a record. A path that matches nothing is not a 404 in this demo —
 * Product renders Home — but every node above has a stable URL and every record segment resolves.
 */
export function matchRoute(path: string[]): Match | null {
  const parts = path[0] === "ollopa" ? path.slice(1) : path
  const url = "/ollopa/" + parts.join("/")
  const exact = NODES.find((n) => n.route === url || (parts.length === 0 && n.route === "/ollopa"))
  if (exact) return { node: exact }
  if (parts.length >= 2) {
    const head = "/ollopa/" + parts.slice(0, -1).join("/")
    const record = NODES.find((n) => n.route === head + "/:id")
    if (record) return { node: record, id: parts[parts.length - 1] }
  }
  return null
}

/** The URL of a node, with a record id where it takes one. */
export function routeTo(node: MapNode, id?: string): string {
  if (!node.route) return "/ollopa"
  return node.route.includes("/:id") ? node.route.replace("/:id", id ? `/${id}` : "") : node.route
}

/** Plan order, for the gate check. PLAN.md: Fathom Starter, Halyard and Ridgeline Growth, Meridian Scale. */
const PLAN_RANK: Record<string, number> = { Starter: 0, Growth: 1, Scale: 2 }

export function gateLocked(node: MapNode, planName: string): boolean {
  if (!node.gate) return false
  return (PLAN_RANK[planName] ?? 0) < PLAN_RANK[node.gate]
}

/**
 * The client workspace an agency seat is acting in, named in the top bar on every page. The shell
 * owns this chip and no page redraws it: at Halyard you must never lose sight of whose workspace
 * you are about to act in.
 */
export function clientWorkspace(business: Business, workspaceName: string): string | null {
  return business === "halyard" ? workspaceName.replace(/\s*\(client\)$/, "") : null
}
