import type { LucideIcon } from "lucide-react"
import { Home, Users, Building2, List, Send, Inbox, CheckSquare, Columns3, Megaphone, HeartHandshake, BarChart3, Bot, Settings } from "lucide-react"
import type { Page, Role } from "./usage/model"

export interface NavItem { page: Page; label: string; icon: LucideIcon; group: string; roles: Role[] }

const ALL: Role[] = ["sdr", "ae", "marketer", "cs", "admin"]

/** Sidebar order: "top" (no label), the named groups, then "bottom" (no label). */
export const GROUP_ORDER = ["top", "Prospect", "Engage", "Win", "bottom"]

export const NAV: NavItem[] = [
  { page: "home", label: "Home", icon: Home, group: "top", roles: ALL },
  { page: "people", label: "People", icon: Users, group: "Prospect", roles: ["sdr", "ae", "marketer", "admin"] },
  { page: "companies", label: "Companies", icon: Building2, group: "Prospect", roles: ["sdr", "ae", "cs", "admin"] },
  { page: "lists", label: "Lists", icon: List, group: "Prospect", roles: ["sdr", "marketer", "admin"] },
  { page: "sequences", label: "Sequences", icon: Send, group: "Engage", roles: ["sdr", "ae", "admin"] },
  { page: "inbox", label: "Inbox", icon: Inbox, group: "Engage", roles: ["sdr", "ae"] },
  { page: "tasks", label: "Tasks", icon: CheckSquare, group: "Engage", roles: ["sdr", "ae", "cs"] },
  { page: "deals", label: "Deals", icon: Columns3, group: "Win", roles: ["ae", "cs", "admin"] },
  { page: "campaigns", label: "Campaigns", icon: Megaphone, group: "Win", roles: ["marketer", "admin"] },
  { page: "accounts", label: "Accounts", icon: HeartHandshake, group: "Win", roles: ["cs", "ae", "admin"] },
  { page: "reports", label: "Reports", icon: BarChart3, group: "bottom", roles: ["ae", "marketer", "cs", "admin"] },
  { page: "agents", label: "Agents", icon: Bot, group: "bottom", roles: ["sdr", "ae", "marketer", "admin"] },
  { page: "settings", label: "Settings", icon: Settings, group: "bottom", roles: ALL },
]

export function navFor(role: Role): NavItem[] {
  return NAV.filter((n) => n.roles.includes(role))
}

export function navItem(page: Page): NavItem | undefined {
  return NAV.find((n) => n.page === page)
}
