// The sidebar: declared, never inferred.
//
// Two human choices make it. The seat, declared when the person was invited, decides which areas
// they may open at all. The workspace profile, declared at set-up, may leave a page out. Nothing
// here reads usage, history or the clock. Order never changes by role, business or history.
import type { LucideIcon } from "lucide-react"
import { Home, Users, Building2, List, Send, FileText, Inbox, CheckSquare, Columns3, Megaphone, HeartHandshake, GitBranch, Ticket, BarChart3, Bot, Settings } from "lucide-react"
import type { Business, Page, Role } from "./usage/model"
import { leftOut } from "./map"
import type { Session } from "./session"

export interface NavItem {
  page: Page
  label: string
  icon: LucideIcon
  group: string
  /** The seats whose sidebar carries this page before the profile subtracts (spec 00 §3.2). */
  roles: Role[]
  /** `g` then this letter jumps here. Printed beside the row in ⌘K and in the shortcut sheet. */
  key: string
  /**
   * Held by the seat but in nobody's sidebar by default (spec 05 §3.9, Templates): reached from the
   * place that uses it, from ⌘K or by deep link, and its header offers "Add to sidebar".
   */
  optional?: boolean
}

/** Sidebar order: "top" (no label), the named groups, then "bottom" (after a divider, no label). */
export const GROUP_ORDER = ["top", "Prospect", "Engage", "Win", "bottom"]

const ALL: Role[] = ["sdr", "ae", "marketer", "cs", "admin"]

export const NAV: NavItem[] = [
  { page: "home", label: "Home", icon: Home, group: "top", roles: ALL, key: "h" },
  { page: "people", label: "People", icon: Users, group: "Prospect", roles: ["sdr", "ae", "marketer", "admin"], key: "p" },
  { page: "companies", label: "Companies", icon: Building2, group: "Prospect", roles: ["sdr", "ae", "cs", "admin"], key: "c" },
  { page: "lists", label: "Lists", icon: List, group: "Prospect", roles: ["sdr", "marketer", "admin"], key: "l" },
  { page: "sequences", label: "Sequences", icon: Send, group: "Engage", roles: ["sdr", "ae", "admin"], key: "s" },
  { page: "templates", label: "Templates", icon: FileText, group: "Engage", roles: ["sdr", "ae", "marketer", "admin"], key: "e", optional: true },
  { page: "inbox", label: "Inbox", icon: Inbox, group: "Engage", roles: ["sdr", "ae"], key: "i" },
  { page: "tasks", label: "Tasks", icon: CheckSquare, group: "Engage", roles: ["sdr", "ae", "cs"], key: "t" },
  { page: "deals", label: "Deals", icon: Columns3, group: "Win", roles: ["ae", "cs", "admin"], key: "d" },
  { page: "campaigns", label: "Campaigns", icon: Megaphone, group: "Win", roles: ["marketer", "admin"], key: "m" },
  { page: "accounts", label: "Accounts", icon: HeartHandshake, group: "Win", roles: ["ae", "cs", "admin"], key: "a" },
  { page: "workflows", label: "Workflows", icon: GitBranch, group: "Win", roles: ["marketer", "admin"], key: "w" },
  { page: "requests", label: "Requests", icon: Ticket, group: "Win", roles: ["admin"], key: "q" },
  { page: "reports", label: "Reports", icon: BarChart3, group: "bottom", roles: ["ae", "marketer", "cs", "admin"], key: "r" },
  { page: "agents", label: "Agents", icon: Bot, group: "bottom", roles: ["sdr", "ae", "marketer", "admin"], key: "g" },
  { page: "settings", label: "Settings", icon: Settings, group: "bottom", roles: ALL, key: "," },
]

/**
 * A seat may carry more than one role's areas. Fathom's founder seat and Halyard's ops-lead seat
 * are admin *plus* SDR, because both people do outbound, so Inbox and Tasks are theirs
 * (spec 00 §3.2, "the per-business seat overlay"). The overlay adds pages to the sidebar; the map's
 * seat column still decides what may be opened.
 */
export const SEAT_OVERLAY: Partial<Record<Business, Partial<Record<Role, Page[]>>>> = {
  fathom: { admin: ["inbox", "tasks"] },
  halyard: { admin: ["inbox", "tasks"] },
}

/** Tasks is not in the admin's thirteen (spec 00 §3.2), but an admin who opens it is not refused. */
export function seatCarries(page: Page, business: Business, role: Role): boolean {
  const item = NAV.find((n) => n.page === page)
  if (!item) return false
  if (item.roles.includes(role)) return true
  return (SEAT_OVERLAY[business]?.[role] ?? []).includes(page)
}

export interface SidebarEntry {
  item: NavItem
  /** How it got here: the seat and profile, a page the person added, or a two-week exposure. */
  source: "declared" | "added" | "exposed"
  /** Set on an exposure whose two weeks are up: the row under it asks "Keep it?". */
  asking?: boolean
  because?: string
}

/**
 * The sidebar for a session: the seat's pages in the fixed order, minus what the profile left out,
 * plus pages added by hand and any page on a two-week exposure, each at the end of its group.
 */
export function sidebarFor(session: Session, today: string): SidebarEntry[] {
  const declared = NAV.filter((n) => !n.optional && seatCarries(n.page, session.business, session.role))
    .filter((n) => !leftOut(n.page, session.profile, session.role))
    .map<SidebarEntry>((item) => ({ item, source: "declared" }))

  const extra: SidebarEntry[] = []
  for (const page of session.sidebarAdded) {
    if (declared.some((e) => e.item.page === page)) continue
    const item = NAV.find((n) => n.page === page)
    if (item && seatCarries(page, session.business, session.role)) extra.push({ item, source: "added" })
  }
  for (const e of session.exposures) {
    if (e.answer === "remove") continue
    if (declared.some((d) => d.item.page === e.page) || extra.some((d) => d.item.page === e.page)) continue
    const item = NAV.find((n) => n.page === e.page)
    if (item) extra.push({ item, source: "exposed", asking: today >= e.until && !e.answer, because: e.because })
  }

  // Added and exposed pages go to the end of their group, and stay there. Nothing else moves.
  const out: SidebarEntry[] = []
  for (const group of GROUP_ORDER) {
    out.push(...declared.filter((e) => e.item.group === group))
    out.push(...extra.filter((e) => e.item.group === group))
  }
  return out
}

/** Pages the seat holds that are not in the sidebar today: normal ⌘K results, marked "not in your sidebar". */
export function notInSidebar(session: Session, today: string): NavItem[] {
  const inSidebar = new Set(sidebarFor(session, today).map((e) => e.item.page))
  return NAV.filter((n) => seatCarries(n.page, session.business, session.role) && !inSidebar.has(n.page))
}

/** The four most used pages per seat, fixed, never by history (rule 6). Plus "All pages". */
export const BOTTOM_BAR: Record<Role, Page[]> = {
  sdr: ["home", "people", "inbox", "tasks"],
  ae: ["home", "deals", "inbox", "tasks"],
  marketer: ["home", "campaigns", "lists", "reports"],
  cs: ["home", "accounts", "tasks", "companies"],
  admin: ["home", "settings", "agents", "reports"],
}

export function navItem(page: Page): NavItem | undefined {
  return NAV.find((n) => n.page === page)
}

/** Kept for pages written against the old signature: the seat's pages, before the profile subtracts. */
export function navFor(role: Role): NavItem[] {
  return NAV.filter((n) => !n.optional && n.roles.includes(role))
}
