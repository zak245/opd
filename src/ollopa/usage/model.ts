// The usage model: what a role at a business touches weekly, per item, per page.
// Method and rationale: USAGE-MODEL.md. Nothing from here is shown inside the product.

export type Role = "sdr" | "ae" | "marketer" | "cs" | "admin"
export type Business = "fathom" | "meridian" | "halyard" | "ridgeline"
export type Page =
  | "home" | "people" | "companies" | "lists" | "sequences" | "templates" | "inbox" | "tasks"
  | "deals" | "deal" | "campaigns" | "accounts" | "reports" | "agents" | "settings" | "connect"
  | "setup" | "developer" | "enrichment" | "workflows" | "requests"

export const ROLES: Role[] = ["sdr", "ae", "marketer", "cs", "admin"]

/**
 * An AE with direct reports: a seat modifier, not a seat.
 * PRODUCT.md declares five seats and IA-MAP 6.4j keeps it that way — the sales leader is an AE
 * seat with `reports > 0`, so no business declares a sixth seat and SEATS is unchanged. An item
 * carries an `ae_plus` number only where the leader's week genuinely differs from the AE's
 * (the team roll-up, the rep filter, coaching), and `weeklyUse` reads it when the signed-in AE
 * has reports. Everywhere else the AE number stands for both.
 */
export type UsageRole = Role | "ae_plus"
export const USAGE_ROLES: UsageRole[] = [...ROLES, "ae_plus"]

export const ROLE_LABEL: Record<UsageRole, string> = {
  sdr: "SDR",
  ae: "Account executive",
  marketer: "Marketer",
  cs: "Customer success",
  admin: "RevOps admin",
  ae_plus: "Account executive with reports",
}

export interface UsageItem {
  id: string
  page: Page
  /** The area of the page the item belongs to, e.g. "Email sending". */
  area: string
  label: string
  /** Decision-critical: always level one, whatever the usage (rule 7). */
  critical?: boolean
  /**
   * Baseline weekly use per role (share of active users in that role touching it in a typical week).
   * Baseline describes Meridian. An optional `ae_plus` number describes an AE who has direct reports.
   */
  weekly: Partial<Record<UsageRole, number>>
  /** Per-business overrides where the business profile changes the number. */
  overrides?: Partial<Record<Business, Partial<Record<UsageRole, number>>>>
  /** Reasoning when it is not obvious. */
  note?: string
}

export const LEVEL_ONE_THRESHOLD = 20

/** Which seats each business declared. A seat that does not exist gets no usage and no first screen. */
export const SEATS: Record<Business, Role[]> = {
  fathom: ["admin", "sdr"],
  meridian: ["sdr", "ae", "marketer", "cs", "admin"],
  halyard: ["sdr", "admin"],
  ridgeline: ["sdr", "ae", "marketer", "cs", "admin"],
}

/**
 * `hasReports` is true for an AE seat with direct reports. It never changes which seats exist:
 * the seat is still "ae", and an item with no `ae_plus` number returns the AE number.
 */
export function weeklyUse(item: UsageItem, business: Business, role: Role, hasReports = false): number {
  if (!SEATS[business].includes(role)) return 0
  const keys: UsageRole[] = hasReports && role === "ae" ? ["ae_plus", "ae"] : [role]
  for (const key of keys) {
    const override = item.overrides?.[business]?.[key]
    if (override !== undefined) return override
  }
  for (const key of keys) {
    const base = item.weekly[key]
    if (base !== undefined) return base
  }
  return 0
}

export function levelOf(item: UsageItem, business: Business, role: Role, hasReports = false): 1 | 2 {
  if (item.critical) return 1
  return weeklyUse(item, business, role, hasReports) >= LEVEL_ONE_THRESHOLD ? 1 : 2
}

export type Band = "head" | "body" | "tail"

export function bandOf(weekly: number): Band {
  if (weekly >= LEVEL_ONE_THRESHOLD) return "head"
  if (weekly >= 5) return "body"
  return "tail"
}

/** The distribution of a page's items for one role at one business, to check against the shape in USAGE-MODEL.md. */
export function shape(items: UsageItem[], business: Business, role: Role, hasReports = false) {
  const counts = { head: 0, body: 0, tail: 0 }
  for (const it of items) counts[bandOf(weeklyUse(it, business, role, hasReports))]++
  const total = items.length || 1
  return {
    counts,
    share: { head: counts.head / total, body: counts.body / total, tail: counts.tail / total },
  }
}
