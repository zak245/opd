// Which family a thing belongs to, and what that family looks like.
//
// DESIGN.md §5. Six families, each a fixed icon plus a fixed hue, always together, the same
// everywhere the thing appears: the sidebar, a row, a chip, a pane's top bar, a crumb, an empty
// state. Settings, Reports and Home are neutral and lean on their icon alone.
//
// Colour never works alone here. A family always comes with its icon; a status always comes with
// its word. That is what makes the set survive a colour-vision deficiency, and
// `node scripts/contrast.mjs` proves the eleven inks stay distinct for a dichromat anyway.
//
// One registry, read by the shell, the pane frame and the primitives, so no page picks a hue.
import {
  Bot, Building2, Cable, Columns3, Inbox, LayoutDashboard, LineChart, Plug, Send,
  Settings as SettingsIcon, Terminal, Users, type LucideIcon,
} from "lucide-react"
import type { Page } from "./usage/model"

export type Family =
  | "people" | "companies" | "deals" | "engagement" | "work" | "agents" | "neutral"

export interface FamilyLook {
  id: Family
  /** What the person calls the family, for a label or an aria-label. */
  name: string
  icon: LucideIcon
  /** The CSS variables. A page uses these names, never a colour. */
  fill: string
  tint: string
  ink: string
}

const look = (id: Family, name: string, icon: LucideIcon): FamilyLook => ({
  id,
  name,
  icon,
  fill: `var(--family-${id})`,
  tint: `var(--family-${id}-tint)`,
  ink: `var(--family-${id}-ink)`,
})

export const FAMILIES: Record<Family, FamilyLook> = {
  people: look("people", "People", Users),
  companies: look("companies", "Companies", Building2),
  deals: look("deals", "Deals", Columns3),
  engagement: look("engagement", "Engagement", Send),
  work: look("work", "Work", Inbox),
  agents: look("agents", "Agents", Bot),
  neutral: look("neutral", "Workspace", LayoutDashboard),
}

/** Every page, by the family of the objects it holds. */
const BY_PAGE: Record<Page, Family> = {
  people: "people",
  lists: "people",
  enrichment: "people",
  companies: "companies",
  accounts: "companies",
  deals: "deals",
  deal: "deals",
  sequences: "engagement",
  templates: "engagement",
  campaigns: "engagement",
  workflows: "engagement",
  inbox: "work",
  tasks: "work",
  agents: "agents",
  requests: "agents",
  home: "neutral",
  reports: "neutral",
  settings: "neutral",
  connect: "neutral",
  setup: "neutral",
  developer: "neutral",
}

/** Every pane kind, by the family of the object it reads. */
const BY_KIND: Record<string, Family> = {
  person: "people",
  contact: "people",
  list: "people",
  company: "companies",
  account: "companies",
  deal: "deals",
  sequence: "engagement",
  template: "engagement",
  campaign: "engagement",
  audience: "engagement",
  form: "engagement",
  workflow: "engagement",
  reply: "work",
  task: "work",
  thread: "work",
  agent: "agents",
  "agent-run": "agents",
  approval: "agents",
  request: "agents",
  setting: "neutral",
}

/**
 * The family of a page or of a pane kind. One function, because the same object read as a page and
 * read beside one must look like the same thing.
 */
export function familyOf(pageOrKind: string | undefined | null): FamilyLook {
  if (!pageOrKind) return FAMILIES.neutral
  // A family id is also accepted, so the token sheet and a page can ask the same question.
  const id = (pageOrKind in FAMILIES ? (pageOrKind as Family) : undefined)
    ?? BY_PAGE[pageOrKind as Page] ?? BY_KIND[pageOrKind]
  return FAMILIES[id ?? "neutral"]
}

/** Pages that carry their own icon rather than a family's: they are neutral by design. */
export const PAGE_ICON: Partial<Record<Page, LucideIcon>> = {
  home: LayoutDashboard,
  reports: LineChart,
  settings: SettingsIcon,
  // Neutral pages with something of their own to say. Without these they would wear the neutral
  // family's glyph, which is Home's — and then two different places answer "where am I" the same way.
  connect: Plug,
  enrichment: Cable,
  developer: Terminal,
}

/** The icon a page shows in its title and its crumb: its own where it has one, else its family's. */
export function iconOf(pageOrKind: string | undefined | null): LucideIcon {
  return PAGE_ICON[pageOrKind as Page] ?? familyOf(pageOrKind).icon
}

/* ------------------------------------------------------------------------------------- statuses */

export type Status = "danger" | "warning" | "success" | "info" | "paused"

export interface StatusLook { id: Status; tint: string; ink: string }

export const STATUSES: Record<Status, StatusLook> = {
  danger: { id: "danger", tint: "var(--danger-tint)", ink: "var(--danger-ink)" },
  warning: { id: "warning", tint: "var(--warning-tint)", ink: "var(--warning-ink)" },
  success: { id: "success", tint: "var(--success-tint)", ink: "var(--success-ink)" },
  info: { id: "info", tint: "var(--info-tint)", ink: "var(--info-ink)" },
  paused: { id: "paused", tint: "var(--paused-tint)", ink: "var(--paused-ink)" },
}

/**
 * The words the product already uses for a *state*, mapped to the five.
 *
 * A word that is not here is not a state — a forecast category, a reply outcome, a persona, a whole
 * sentence — and it gets no status colour at all. Sending every unknown word to `paused` painted
 * categories as states and made the swap test pass on things that mean nothing, which is exactly
 * what §5 forbids. `Chip` draws those as neutral category chips instead: a border and a word.
 */
const WORDS: Record<string, Status> = {
  // stopped, blocked, failed, gone
  bounced: "danger", "not sent": "danger", failed: "danger", error: "danger", blocked: "danger",
  unsubscribed: "danger", "do not contact": "danger", lost: "danger", overdue: "danger",
  declined: "danger", "auto-paused": "danger", stuck: "danger", churned: "danger",
  // near a threshold, needs a look
  warning: "warning", "at risk": "warning", "needs attention": "warning", waiting: "warning",
  pending: "warning", "waiting for approval": "warning", draft: "warning", unverified: "warning",
  // it worked
  active: "success", sent: "success", verified: "success", won: "success", "closed won": "success",
  replied: "success", done: "success", approved: "success", connected: "success", live: "success",
  // it is happening, or it is simply a fact about now
  scheduled: "info", sending: "info", running: "info", new: "info", "in progress": "info",
  // A change of place, not an ending: a person the pane moved out of one sequence is in another.
  moved: "info", transferred: "info", reassigned: "info",
  // stopped on purpose, or finished and quiet
  paused: "paused", finished: "paused", archived: "paused", snoozed: "paused", skipped: "paused",
  off: "paused", inactive: "paused", none: "paused",
}

export function statusOf(word: string | undefined | null): Status | undefined {
  if (!word) return undefined
  return WORDS[word.trim().toLowerCase()]
}

/** Is this word one the product treats as a state at all? */
export function isStatusWord(word: string | undefined | null): boolean {
  return statusOf(word) !== undefined
}
