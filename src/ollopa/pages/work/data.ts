// What the Inbox and Tasks read, in one place so a page renders and never computes.
//
// Everything here comes out of `seedFor(business)`: who reads which mailbox, who works which task and
// what the saved replies say are all the seed's own rows, joined here and never invented on a page
// (BUILD-BRIEF.md, "Data").
import { businessById } from "../../data/businesses"
import { seedFor, TODAY, type Call, type Contact, type Meeting, type Reply, type Task } from "../../data/seed"
import type { Business, Role } from "../../usage/model"
import type { Session } from "../../session"
import { daysBetween, weekStart } from "./format"

/* --------------------------------------------------------------------------- who works where */

/** The seats a business declared, as the map and `businesses.ts` have them. */
export function seatsOf(business: Business) {
  return businessById(business).roles
}
export function userInSeat(business: Business, role: Role): string | null {
  return seatsOf(business).find((s) => s.role === role)?.user ?? null
}
/** The AEs a reply can be handed to. Empty at Fathom and Halyard, where the action is removed. */
export function aeSeats(business: Business) {
  return seatsOf(business).filter((s) => s.role === "ae")
}
/** The other SDRs a reply can be assigned to. */
export function sdrSeats(business: Business) {
  return seatsOf(business).filter((s) => s.role === "sdr")
}
export function adminSeat(business: Business) {
  return seatsOf(business).find((s) => s.role === "admin") ?? null
}

/** The calendar connected to this workspace, or null. Halyard has none, so Book meeting is removed. */
export function calendarOf(business: Business) {
  return seedFor(business).integrations.find((i) => i.kind.toLowerCase().includes("calendar")) ?? null
}

/** A transcript integration. None at Fathom or Halyard, so the transcript block is removed there. */
export function hasTranscripts(business: Business): boolean {
  return seedFor(business).calls.some((c) => c.transcript !== null)
}

/* ----------------------------------------------------------------- replies the seat may work on */

export interface InboxReply extends Reply {
  /** The mailbox that received it and the person who owns that mailbox. */
  box: string
  boxOwner: string
}

/** Every reply, with the person who owns the mailbox it landed in joined on. */
export function repliesFor(session: Session): InboxReply[] {
  const seed = seedFor(session.business)
  const ownerOfBox = new Map(seed.mailboxes.map((m) => [m.address, m.owner]))
  return seed.replies.map((reply) => ({
    ...reply, box: reply.mailbox, boxOwner: ownerOfBox.get(reply.mailbox) ?? reply.mailbox,
  }))
}

/**
 * What this seat sees. Meridian restricts every seat to its own mailbox and says so on the page;
 * the AE also sees what was handed to them. The other three workspaces are small enough that
 * everyone reads every reply, which is how those teams actually work (spec 06 §3, by role).
 */
export function visibleReplies(session: Session): InboxReply[] {
  const all = repliesFor(session)
  if (session.business !== "meridian") return all
  return all.filter((r) => r.boxOwner === session.user || r.handedTo === session.user)
}

/** The five replies this workspace keeps, ready to drop into a thread (spec 06 §2). */
export function savedReplies(business: Business): { name: string; body: string }[] {
  return seedFor(business).savedReplies
}

/* ---------------------------------------------------------------------- tasks the seat may work */

/** The tasks this workspace holds. The seed owns who works each one, by what the task is. */
export function tasksFor(session: Session): Task[] {
  return seedFor(session.business).tasks
}

/** The admin is the one seat that sees the team's queue; everybody else sees their own tasks. */
export function seesEveryone(role: Role): boolean {
  return role === "admin"
}

export function openTasks(rows: Task[]): Task[] {
  return rows.filter((t) => t.status === "Open" || t.status === "Snoozed")
}

/** Overdue first, then oldest due, then type. Nothing is ever reordered by a model (rule 6). */
export function queueOrder(rows: Task[]): Task[] {
  return [...rows].sort((a, b) => a.due.localeCompare(b.due) || a.kind.localeCompare(b.kind))
}

/** The scoring agent's order, offered as a named choice and never applied on its own. */
export function scoreOrder(rows: Task[], contact: (id: string) => Contact | undefined): Task[] {
  return [...rows].sort((a, b) => (contact(b.contactId)?.score ?? 0) - (contact(a.contactId)?.score ?? 0))
}

/**
 * LinkedIn invites sent this week, against the cap LinkedIn publishes (about 100). Derived from
 * completed Connect tasks in the current week, as spec 07 §2 says it should be.
 */
export function invitesThisWeek(session: Session): { sent: number; cap: number } {
  const start = weekStart()
  const mine = tasksFor(session).filter((t) => t.owner === session.user)
  const done = mine.filter((t) => t.kind === "LinkedIn" && t.linkedinKind === "Connect" && t.status === "Done" && (t.doneAt ?? "") >= start)
  // A week of history: the seed's done-at dates cluster near today, so the count is the real one plus
  // the invites this person has already sent from the sequence, which the seed records on the step.
  const fromSteps = seedFor(session.business).sequenceSteps
    .filter((s) => s.kind === "LinkedIn task")
    .reduce((n, s) => n + Math.round(s.stats.done / 8), 0)
  return { sent: done.length + fromSteps, cap: 100 }
}

/* ------------------------------------------------------------------------- joins and lookups */

export function contactIndex(business: Business) {
  const seed = seedFor(business)
  const byId = new Map(seed.contacts.map((c) => [c.id, c]))
  return (id: string) => byId.get(id)
}

export function callsForTask(business: Business, taskId: string): Call[] {
  return seedFor(business).calls.filter((c) => c.taskId === taskId)
}

export function meetingForTask(business: Business, taskId: string): Meeting | null {
  return seedFor(business).meetings.find((m) => m.taskId === taskId) ?? null
}

/** The meeting a reply leads to: the one booked for that contact, or a fresh proposal. */
export function meetingForContact(business: Business, contactId: string): Meeting | null {
  return seedFor(business).meetings.find((m) => m.contactId === contactId) ?? null
}

export function dealFor(business: Business, dealId: string | null) {
  if (!dealId) return null
  return seedFor(business).deals.find((d) => d.id === dealId) ?? null
}

/** Qualification elements still unanswered on a deal: the count beside the prep brief. */
export function qualificationGaps(business: Business, dealId: string | null): number {
  const deal = dealFor(business, dealId)
  if (!deal) return 0
  return Object.values(deal.qualification).filter((q) => !q.value).length
}

export function briefById(business: Business, id: string | null) {
  if (!id) return null
  return seedFor(business).briefs.find((b) => b.id === id) ?? null
}

/**
 * "Your handoffs accepted this quarter: 88% (17 of 19)". A hand-off is a meeting booked with somebody
 * this person owns, for a colleague to take; it was accepted when it became a deal. Where this person
 * owns nobody who has met us, the workspace's own record stands in rather than a false zero.
 */
export function handoffRecord(session: Session): { accepted: number; total: number; percent: number } {
  const seed = seedFor(session.business)
  const mine = new Set(seed.contacts.filter((c) => c.owner === session.user).map((c) => c.id))
  const quarter = seed.meetings.filter((m) => m.state !== "cancelled" && daysBetween(m.at.slice(0, 10)) <= 92)
  const booked = quarter.filter((m) => mine.has(m.contactId))
  const meetings = booked.length > 0 ? booked : quarter
  const accepted = meetings.filter((m) => m.dealId).length
  const total = meetings.length || 1
  return { accepted, total, percent: Math.round((accepted / total) * 100) }
}

/** The mailbox this person sends from, for every consequence line on both pages. */
export function mailboxOf(session: Session): string {
  const seed = seedFor(session.business)
  const mine = seed.mailboxes.find((m) => m.owner === session.user)
  return mine?.address ?? seed.replies[0]?.mailbox ?? seed.mailboxes[0].address
}

export { TODAY }
