// What fills the bell.
//
// The rows themselves are `seed.notifications`, deterministic per business. This file does the two
// things the shell owns: it routes each row to the seats it is for, and it holds the read, snooze and
// digest state. Two rules decide the rest (spec 00 §3.4):
//   1. Exactly three kinds interrupt — bounce guard tripped, a second approval over the threshold,
//      credits low — because each means something is sending or spending right now.
//   2. Everything else is digestible: the badge, the panel, and the daily digest. A sync error is
//      digestible; nothing is sending because of it, and the records are still there to fix.
// Rows are links. A grouped row opens its page filtered; it never expands inside the panel.
import type { Business, Role } from "../usage/model"
import { seedFor, type Notification } from "../data/seed"
import { seatCarries } from "../nav"
import type { Session } from "../session"

export const TODAY = "2026-09-13"

export type Kind = Notification["kind"]

export const KIND_LABEL: Record<Kind, string> = {
  reply: "Reply",
  meeting: "Meeting booked",
  approval: "Agent approval",
  "bounce-guard": "Bounce guard",
  "sync-error": "Sync error",
  "credits-low": "Credits low",
}

/**
 * The family a kind belongs to, as a page id `identity.ts` already knows.
 *
 * A row says what kind it is with the family's icon and hue, never with a shouted word
 * (DESIGN.md §5). `KIND_LABEL` is what that icon is called, for the person who cannot see it.
 */
export const KIND_FAMILY: Record<Kind, string> = {
  reply: "inbox",
  meeting: "inbox",
  approval: "agents",
  "bounce-guard": "sequences",
  "sync-error": "settings",
  "credits-low": "settings",
}

/**
 * One short line per reply row.
 *
 * The seed gives every reply the same snippet, so three replies in a row read as a broken panel.
 * A row's second line is one line, so it says the one thing this person asked and nothing else.
 */
const REPLY_LINES = [
  "Asks whether it works with HubSpot.",
  "Wants to keep their own field names.",
  "Asks what the sync overwrote last year.",
  "Wants a price for fifteen seats.",
  "Asks who else should join the call.",
  "Free on Thursday afternoon.",
  "Wants to see it on their own data.",
  "Asks how long the set-up takes.",
]

/** The reply line for a row, by its seed id, so the same row always reads the same way. */
function replyLine(id: string): string {
  const n = Number(id.replace(/\D/g, "")) || 1
  return REPLY_LINES[(n - 1) % REPLY_LINES.length]
}

export interface Note {
  id: string
  kind: Kind
  /** The date the row belongs to in the panel. A row about something in the future arrived today. */
  when: string
  /** The date printed on the row: a meeting's own date, which may be ahead of today. */
  on: string
  title: string
  detail?: string
  target: string
  unread: boolean
  interrupting: boolean
}

export function runwayWeeks(business: Business): number {
  const c = seedFor(business).credits
  return c.balance / (c.burnPerWeek || 1)
}

export function runsOutOn(business: Business): string {
  return seedFor(business).credits.runsOutOn
}

export function shortDate(iso: string): string {
  const d = new Date(iso.slice(0, 10) + "T00:00:00")
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]}`
}

function dayBefore(date: string, days: number) {
  const d = new Date(date + "T00:00:00")
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

/** Who a kind is for. A seat that does not work in the area never gets its rows. */
function isFor(kind: Kind, session: Session): boolean {
  const { business, role } = session
  const admin = role === "admin"
  switch (kind) {
    case "reply": return seatCarries("inbox", business, role)
    case "meeting": return seatCarries("inbox", business, role) || role === "cs"
    case "approval": return seatCarries("agents", business, role)
    case "bounce-guard": return admin || seatCarries("sequences", business, role)
    case "sync-error": return admin || business === "fathom"
    case "credits-low": return admin || business === "fathom"
  }
}

/**
 * Every row for one seat at one workspace, newest first.
 *
 * A second approval over the threshold is the admin's decision: the admin is interrupted, and the
 * person who asked for it gets the same row, digestible, with a line saying who it waits on
 * (spec 00 §3.4). That is the only place a kind changes class, and it changes by who is reading.
 */
export function notificationsFor(session: Session): Note[] {
  const seed = seedFor(session.business)
  const state = readState(session.business, session.role)
  const admin = seed.users.find((u) => u.role === "admin")
  return seed.notifications
    .filter((n) => isFor(n.kind, session))
    .map<Note>((n) => {
      const on = n.when.slice(0, 10)
      const waitsOnAdmin = n.interrupting && n.kind === "approval" && session.role !== "admin"
      const detail = n.kind === "reply" ? replyLine(n.id) : n.detail
      return {
        id: n.id,
        kind: n.kind,
        // A meeting row carries the meeting's date; it still arrived today.
        when: on > TODAY ? TODAY : on,
        on,
        title: n.title,
        detail: waitsOnAdmin ? `Waiting on ${admin?.name ?? "your admin"} · ${detail}` : detail,
        target: n.target.replace(/^#/, ""),
        unread: n.unread && !state.read.includes(n.id),
        interrupting: n.interrupting && !waitsOnAdmin,
      }
    })
    .sort((a, b) => (a.when < b.when ? 1 : a.when > b.when ? -1 : 0))
}

// ---- read, snooze: per person, per workspace ----

interface PanelState { read: string[]; snoozed: string[] }

const stateKey = (b: Business, r: Role) => `ollopa.notifications.${b}.${r}`

export function readState(business: Business, role: Role): PanelState {
  try {
    const raw = localStorage.getItem(stateKey(business, role))
    return raw ? (JSON.parse(raw) as PanelState) : { read: [], snoozed: [] }
  } catch {
    return { read: [], snoozed: [] }
  }
}

export function writeState(business: Business, role: Role, s: PanelState) {
  try { localStorage.setItem(stateKey(business, role), JSON.stringify(s)) } catch { /* ignore */ }
}

export interface Section { title: string; rows: Note[] }

/** Needs you now, Today, Yesterday, This week — in that order, empty sections omitted. */
export function sectioned(rows: Note[]): Section[] {
  const yesterday = dayBefore(TODAY, 1)
  const week = dayBefore(TODAY, 7)
  const rest = rows.filter((n) => !n.interrupting)
  const sections: Section[] = [
    { title: "Needs you now", rows: rows.filter((n) => n.interrupting) },
    { title: "Today", rows: rest.filter((n) => n.when >= TODAY) },
    { title: "Yesterday", rows: rest.filter((n) => n.when === yesterday) },
    { title: "This week", rows: rest.filter((n) => n.when < yesterday && n.when >= week) },
  ]
  return sections.filter((s) => s.rows.length > 0)
}

/** Older than seven days: kept for 30 days, shown on request. */
export function older(rows: Note[]): Note[] {
  const week = dayBefore(TODAY, 7)
  return rows.filter((n) => !n.interrupting && n.when < week)
}

/** The daily digest default: on for admin and customer success, off for SDR and AE (PLAN.md, S1). */
export const DIGEST_DEFAULT: Record<Role, boolean> = { admin: true, cs: true, sdr: false, ae: false, marketer: true }

const digestKey = (b: Business, r: Role) => `ollopa.digest.${b}.${r}`

export function digestOn(business: Business, role: Role): boolean {
  try {
    const raw = localStorage.getItem(digestKey(business, role))
    return raw === null ? DIGEST_DEFAULT[role] : raw === "true"
  } catch {
    return DIGEST_DEFAULT[role]
  }
}

export function setDigest(business: Business, role: Role, on: boolean) {
  try { localStorage.setItem(digestKey(business, role), String(on)) } catch { /* ignore */ }
}
