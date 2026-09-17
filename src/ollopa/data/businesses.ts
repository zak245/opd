import type { Business, Role } from "../usage/model"

export interface RoleSeat {
  role: Role
  /** How the role is called at this business. */
  title: string
  /** The demo user you sign in as. */
  user: string
  initials: string
  /**
   * Direct reports, for an AE seat that manages other AEs — the sales leader.
   * Not a sixth seat: PRODUCT.md declares five and IA-MAP 6.4j keeps it that way, so a leader is an
   * AE seat with `reports` set, and every leader-only item is an AE item conditioned on this being
   * non-empty. The usage model reads it as the `ae_plus` modifier (`weeklyUse(item, business, role,
   * hasReports)` in usage/model.ts); `SEATS` is unchanged, because no business declares a new seat.
   */
  reports?: string[]
  /** This person's own credit ceiling for the month, where the workspace sets one. */
  creditLimit?: number
}

/** The workspace profile declared at set-up (PLAN.md, 14 Sep 2026). The sidebar is seat plus profile. */
export type Profile = "founder-led" | "separated" | "agency" | "product-led"

/** The plan table (PLAN.md and specs/14-settings.md §2.3). `gate(feature)` reads this and nothing else. */
export const PLANS = [
  { name: "Starter", pricePerSeat: 49, seats: "3", mailboxesPerUser: "1", teams: false, agents: 2, reports: "Activity only", crmSync: "one-way", sso: false, api: false, mcp: "read only", workflows: false, viewAs: false },
  { name: "Growth", pricePerSeat: 79, seats: "unlimited", mailboxesPerUser: "unlimited", teams: true, agents: 3, reports: "all five, plus CSV export", crmSync: "two-way", sso: false, api: true, mcp: "read and write", workflows: true, viewAs: true },
  { name: "Scale", pricePerSeat: 129, seats: "unlimited", mailboxesPerUser: "unlimited", teams: true, agents: 99, reports: "all five, plus CSV export and the scheduled weekly email", crmSync: "two-way, plus custom objects", sso: true, api: true, mcp: "read and write", workflows: true, viewAs: true },
] as const
export type PlanName = (typeof PLANS)[number]["name"]
export function planByName(name: string) { return PLANS.find((p) => p.name === name) ?? PLANS[0] }

export interface BusinessDef {
  id: Business
  name: string
  tagline: string
  size: string
  how: string
  roles: RoleSeat[]
  /** Declared at set-up, visible and editable in Settings under "How your team works". Never inferred. */
  profile: Profile
  /** The CRM of record (PLAN.md, 13 Sep 2026). Fathom has none: ollopA is their CRM. */
  crm: string | null
  timezone: string
  currency: string
  plan: { name: string; seats: number; pricePerSeat: number; renews: string; billing: "monthly" | "annual" }
  credits: { balance: number; monthlyCap: number; burnPerWeek: number }
  counts: { users: number; contacts: number; companies: number; sequences: number; openDeals: number; campaigns: number; integrations: number; agents: number }
}

export const businesses: BusinessDef[] = [
  {
    id: "fathom",
    name: "Fathom Labs",
    tagline: "Seed-stage, founder-led outbound",
    size: "12 people",
    how: "Two founders and one SDR do all the outbound. Everyone is an admin. Nobody has time, so agents do the research.",
    roles: [
      { role: "admin", title: "Founder", user: "Priya Natarajan", initials: "PN" },
      { role: "sdr", title: "SDR", user: "Theo Lindqvist", initials: "TL" },
    ],
    profile: "founder-led", crm: null, timezone: "America/New_York", currency: "USD",
    plan: { name: "Starter", seats: 3, pricePerSeat: 49, renews: "2026-10-02", billing: "monthly" },
    credits: { balance: 4_120, monthlyCap: 10_000, burnPerWeek: 2_300 },
    counts: { users: 3, contacts: 2_200, companies: 640, sequences: 4, openDeals: 19, campaigns: 0, integrations: 2, agents: 2 },
  },
  {
    id: "meridian",
    name: "Meridian Software",
    tagline: "Mid-size SaaS with separated roles",
    size: "300 people",
    how: "Marketing feeds SDRs, SDRs feed AEs, AEs hand to customer success. One of the AE seats manages the others. One RevOps admin. Strict permissions.",
    roles: [
      { role: "sdr", title: "SDR", user: "Marcus Adeyemi", initials: "MA", creditLimit: 5_000 },
      { role: "ae", title: "Account executive", user: "Elena Vasquez", initials: "EV", creditLimit: 5_000 },
      { role: "ae", title: "Sales manager", user: "Priya Raman", initials: "PR", reports: ["Elena Vasquez"], creditLimit: 5_000 },
      { role: "marketer", title: "Demand generation manager", user: "Jonas Weber", initials: "JW" },
      { role: "cs", title: "Customer success manager", user: "Aisha Rahman", initials: "AR" },
      { role: "admin", title: "RevOps admin", user: "Daniel Okafor", initials: "DO" },
    ],
    profile: "separated", crm: "Salesforce", timezone: "Europe/Berlin", currency: "EUR",
    plan: { name: "Scale", seats: 42, pricePerSeat: 129, renews: "2027-01-15", billing: "annual" },
    credits: { balance: 1_840_000, monthlyCap: 2_500_000, burnPerWeek: 410_000 },
    counts: { users: 42, contacts: 18_400, companies: 3_100, sequences: 26, openDeals: 214, campaigns: 12, integrations: 5, agents: 3 },
  },
  {
    id: "halyard",
    name: "Halyard Agency",
    tagline: "Outbound agency running ten client workspaces",
    size: "25 people",
    how: "Runs outbound for ten clients. Switches workspaces all day. The same tasks, ten times over.",
    roles: [
      { role: "sdr", title: "Outbound specialist", user: "Sofia Marchetti", initials: "SM" },
      { role: "admin", title: "Agency ops lead", user: "Ravi Sethi", initials: "RS" },
    ],
    profile: "agency", crm: "HubSpot (one client CRM per workspace)", timezone: "Europe/London", currency: "GBP",
    plan: { name: "Growth", seats: 25, pricePerSeat: 79, renews: "2026-11-30", billing: "annual" },
    credits: { balance: 620_000, monthlyCap: 1_200_000, burnPerWeek: 260_000 },
    counts: { users: 25, contacts: 31_000, companies: 5_400, sequences: 40, openDeals: 88, campaigns: 0, integrations: 10, agents: 2 },
  },
  {
    id: "ridgeline",
    name: "Ridgeline",
    tagline: "Product-led, little outbound",
    size: "80 people",
    how: "Almost no cold outreach. Lives in product signals, expansion and renewals. Marketing runs lifecycle campaigns.",
    roles: [
      { role: "sdr", title: "Inbound SDR", user: "Hana Kobayashi", initials: "HK", creditLimit: 3_000 },
      { role: "ae", title: "Expansion AE", user: "Liam O'Connell", initials: "LO", creditLimit: 3_000 },
      { role: "marketer", title: "Lifecycle marketer", user: "Camille Dubois", initials: "CD" },
      { role: "cs", title: "Customer success lead", user: "Noah Bergström", initials: "NB" },
      { role: "admin", title: "Revenue operations", user: "Grace Mwangi", initials: "GM" },
    ],
    profile: "product-led", crm: "HubSpot", timezone: "America/Los_Angeles", currency: "USD",
    plan: { name: "Growth", seats: 14, pricePerSeat: 79, renews: "2027-03-08", billing: "annual" },
    credits: { balance: 210_000, monthlyCap: 400_000, burnPerWeek: 38_000 },
    counts: { users: 14, contacts: 9_800, companies: 1_900, sequences: 2, openDeals: 61, campaigns: 8, integrations: 4, agents: 3 },
  },
]

export function businessById(id: Business): BusinessDef {
  return businesses.find((b) => b.id === id)!
}
