// What a gated control asks: does this workspace have the feature, and what would it cost?
//
// The plan table is `PLANS` in `data/businesses.ts` — PLAN.md §2 "Plan gating", column by column — and
// this file reads that and nothing else. Plans are named by tier, never by audience. Nothing here gates
// a safety or decision-critical item; that is the caller's rule, and it is in RULES.md.
import type { Business } from "../usage/model"
import { PLANS, businessById, type PlanName } from "../data/businesses"

export type Plan = PlanName
export type PlanRow = (typeof PLANS)[number]

/** Every feature the plan table draws a line under, with what it does in the panel's words. */
export type Feature =
  | "seats.unlimited" | "mailboxes.extra" | "teams" | "profiles" | "territories"
  | "agents.third" | "agents.own-model-key"
  | "reports.all" | "reports.csv-export" | "reports.scheduled-email"
  | "crm.two-way" | "crm.custom-objects"
  | "sso" | "scim" | "ip-allowlist" | "audit-export"
  | "api" | "webhooks" | "mcp.write" | "workflows" | "rulesets" | "view-as"

export const FEATURES: Record<Feature, { has: (row: PlanRow) => boolean; what: string }> = {
  "seats.unlimited": { has: (r) => r.seats === "unlimited", what: "Invite as many people as you need. Starter stops at three seats." },
  "mailboxes.extra": { has: (r) => r.mailboxesPerUser === "unlimited", what: "Connect more than one mailbox per person and send from any of them." },
  teams: { has: (r) => r.teams, what: "Group people into teams, and report on a team rather than a person." },
  profiles: { has: (r) => r.teams, what: "Permission profiles: decide what each seat can see and change." },
  territories: { has: (r) => r.teams, what: "Territories: route a company to the account executive who owns its patch." },
  "agents.third": { has: (r) => r.agents >= 3, what: "Run a third agent alongside research and outreach." },
  "agents.own-model-key": { has: (r) => r.agents > 3, what: "Run the agents on your own model key, billed to your provider." },
  "reports.all": { has: (r) => r.reports !== "Activity only", what: "All five reports, not activity alone: pipeline, sequences, campaigns and the forecast." },
  "reports.csv-export": { has: (r) => /CSV/.test(r.reports), what: "Export any report as CSV, with the filters you are looking at." },
  "reports.scheduled-email": { has: (r) => /scheduled/.test(r.reports), what: "Send a report to a group on a schedule, every week or every morning." },
  "crm.two-way": { has: (r) => /two-way/.test(r.crmSync), what: "Write back to your CRM as well as reading from it." },
  "crm.custom-objects": { has: (r) => /custom objects/.test(r.crmSync), what: "Sync your CRM's custom objects, not only the standard ones." },
  sso: { has: (r) => r.sso, what: "Single sign-on with your identity provider." },
  scim: { has: (r) => r.sso, what: "Create and remove people automatically from your identity provider." },
  "ip-allowlist": { has: (r) => r.sso, what: "Allow sign-in from your own network ranges only." },
  "audit-export": { has: (r) => r.sso, what: "Export the audit log, with every action and who took it." },
  api: { has: (r) => r.api, what: "The REST API, with published limits and a spend cap for each key." },
  webhooks: { has: (r) => r.api, what: "Webhooks with a written delivery contract and a reconciliation endpoint." },
  "mcp.write": { has: (r) => /write/.test(r.mcp), what: "MCP write scopes. Reading is on every plan." },
  rulesets: { has: (r) => r.teams, what: "Reusable rulesets: save a sequence's rules once and apply them to any sequence." },
  workflows: { has: (r) => r.workflows, what: "Workflows: route a record, assign an owner, start a sequence when something happens." },
  "view-as": { has: (r) => r.viewAs, what: "See the product as one of your teammates sees it, to check access before you grant it." },
}

export interface GateResult {
  locked: boolean
  /** The plan that unlocks it. */
  plan: Plan
  /** The total for the period at that plan, for this workspace's seats — never a breakdown. */
  pricePerMonth: number
  what: string
}

function signedInBusiness(): Business {
  try {
    const raw = localStorage.getItem("ollopa.session")
    const parsed = raw ? (JSON.parse(raw) as { business?: Business }) : null
    if (parsed?.business) return parsed.business
  } catch { /* private mode: fall through to the demo default */ }
  return "meridian"
}

/**
 * `gate("reports.csv-export")` asks about the signed-in workspace; pass a business to ask about another.
 *
 * The price is the whole monthly bill at the plan that unlocks the feature, for the seats this workspace
 * has, because a partitioned price leaves people underestimating the total by about 11%.
 */
export function gate(feature: Feature, business: Business = signedInBusiness()): GateResult {
  const b = businessById(business)
  const def = FEATURES[feature]
  const need = PLANS.find((p) => def.has(p)) ?? PLANS[PLANS.length - 1]
  const mine = PLANS.findIndex((p) => p.name === b.plan.name)
  const theirs = PLANS.findIndex((p) => p.name === need.name)
  return {
    locked: mine < theirs,
    plan: need.name,
    pricePerMonth: b.plan.seats * need.pricePerSeat,
    what: def.what,
  }
}

export const PLAN_ORDER: Plan[] = PLANS.map((p) => p.name)

export function money(n: number): string {
  return "$" + n.toLocaleString("en-US")
}
