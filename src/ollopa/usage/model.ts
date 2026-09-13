// The usage model: what a role at a business touches weekly, per item, per page.
// Method and rationale: USAGE-MODEL.md. Nothing from here is shown inside the product.

export type Role = "sdr" | "ae" | "marketer" | "cs" | "admin"
export type Business = "fathom" | "meridian" | "halyard" | "ridgeline"
export type Page =
  | "home" | "people" | "companies" | "lists" | "sequences" | "inbox" | "tasks"
  | "deals" | "deal" | "campaigns" | "accounts" | "reports" | "agents" | "settings" | "connect"

export const ROLES: Role[] = ["sdr", "ae", "marketer", "cs", "admin"]
export const ROLE_LABEL: Record<Role, string> = {
  sdr: "SDR",
  ae: "Account executive",
  marketer: "Marketer",
  cs: "Customer success",
  admin: "RevOps admin",
}

export interface UsageItem {
  id: string
  page: Page
  /** The area of the page the item belongs to, e.g. "Email sending". */
  area: string
  label: string
  /** Decision-critical: always level one, whatever the usage (rule 7). */
  critical?: boolean
  /** Baseline weekly use per role (share of active users in that role touching it in a typical week). Baseline describes Meridian. */
  weekly: Partial<Record<Role, number>>
  /** Per-business overrides where the business profile changes the number. */
  overrides?: Partial<Record<Business, Partial<Record<Role, number>>>>
  /** Reasoning when it is not obvious. */
  note?: string
}

export const LEVEL_ONE_THRESHOLD = 20

export function weeklyUse(item: UsageItem, business: Business, role: Role): number {
  const override = item.overrides?.[business]?.[role]
  if (override !== undefined) return override
  return item.weekly[role] ?? 0
}

export function levelOf(item: UsageItem, business: Business, role: Role): 1 | 2 {
  if (item.critical) return 1
  return weeklyUse(item, business, role) >= LEVEL_ONE_THRESHOLD ? 1 : 2
}

export type Band = "head" | "body" | "tail"

export function bandOf(weekly: number): Band {
  if (weekly >= LEVEL_ONE_THRESHOLD) return "head"
  if (weekly >= 5) return "body"
  return "tail"
}

/** The distribution of a page's items for one role at one business, to check against the shape in USAGE-MODEL.md. */
export function shape(items: UsageItem[], business: Business, role: Role) {
  const counts = { head: 0, body: 0, tail: 0 }
  for (const it of items) counts[bandOf(weeklyUse(it, business, role))]++
  const total = items.length || 1
  return {
    counts,
    share: { head: counts.head / total, body: counts.body / total, tail: counts.tail / total },
  }
}
