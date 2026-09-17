// The four facts a list will not let anyone lose sight of, and where each one comes from.
//
// A list is a group that is about to be acted on, and acting costs something: credits for the net-new
// emails, a second sequence for the people already in one, a standing feed that keeps enrolling after
// you leave, and an agent that keeps spending every week. None of these is invented here; each is
// derived from the seed and named in the comment above it.
import { CREDITS, seedFor, type Contact, type List } from "../../data/seed"
import type { Business } from "../../usage/model"

/**
 * Who an enrolment would really add, and who it would skip and why. One function, so the credits line
 * on the list and the preview inside the panel can never disagree about the same click.
 *
 * Spec 05 §3.4 skips unverified emails; spec 04 §2 charges a credit for a guessed one. Both hold here:
 * unverified and bounced addresses are skipped, and each guessed address that is added costs a credit.
 */
export function splitForEnrol(members: Contact[], targetSequence?: string) {
  const skipped: { contact: Contact; why: string }[] = []
  const adding: Contact[] = []
  for (const c of members) {
    if (c.doNotContact) skipped.push({ contact: c, why: "do not contact" })
    else if (!c.email) skipped.push({ contact: c, why: "no email" })
    else if (c.emailStatus === "Bounced") skipped.push({ contact: c, why: "bounced email" })
    else if (targetSequence && c.inSequence === targetSequence) skipped.push({ contact: c, why: "already in this sequence" })
    else if (c.emailStatus === "Unverified") skipped.push({ contact: c, why: "unverified email" })
    else adding.push(c)
  }
  return { adding, skipped }
}

/** Enrolling spends one credit per net-new (guessed) email among the people it would actually add. */
export function enrolCredits(members: Contact[]): number {
  return members.filter((c) => c.emailStatus === "Guessed").length
}

export function enrichCredits(count: number): number {
  return count * CREDITS.enrich
}

/** Double outreach: already in a sequence, and not the one being enrolled into. */
export function alreadyInASequence(members: Contact[], target?: string): Contact[] {
  return members.filter((c) => c.inSequence && c.inSequence !== target)
}

/**
 * The workspace's own observed touch rate: emails sent plus calls made, per prospecting person, per
 * working day, from `seed.activity` — not a constant, which is why the line says whose rate it is.
 */
export function touchesPerDay(business: Business): number {
  const seed = seedFor(business)
  const users = seed.users.filter((u) => u.role === "sdr" || u.role === "ae")
  const rows = seed.activity.filter((a) => users.some((u) => u.name === a.user))
  if (rows.length === 0) return 20
  const perWeek = rows.reduce((sum, a) => sum + a.sentThisWeek + a.callsThisWeek, 0) / rows.length
  return Math.max(1, Math.round(perWeek / 5))
}

/** "1,240 people · about 5 weeks of touches for one rep at 54 a day". A count worked as a calendar. */
export function touchEstimate(count: number, business: Business): string {
  const perDay = touchesPerDay(business)
  const weeks = count / (perDay * 5)
  const said = weeks < 1 ? "under a week" : weeks < 1.5 ? "about a week" : `about ${Math.round(weeks)} weeks`
  return `${said} of touches for one rep at ${perDay} a day`
}

export interface AgentWatch { agent: string; creditsEach: number; perWeek: number }

/**
 * A standing agent watch on a list, and what it spends every week.
 *
 * Derived, not seeded: the seed has no `list.agentWatch`, so a list counts as watched when the
 * research agent is on and the list was built by an agent or is an agent shortlist, and the weekly
 * cost is this week's new matches at the research rate. The data owner has the field in the reply;
 * when it lands, this function reads it instead.
 */
export function agentWatch(list: List, business: Business): AgentWatch | null {
  const seed = seedFor(business)
  const research = seed.agents.find((a) => a.id === "research")
  if (!research?.on) return null
  const watched = list.source === "agent" || /^agent /i.test(list.name)
  if (!watched) return null
  return {
    agent: research.name,
    creditsEach: CREDITS.research,
    perWeek: Math.max(CREDITS.research, list.newThisWeek * CREDITS.research),
  }
}

/** Members of a list, as the rows they are: contacts for a people list, companies for a company one. */
export function membersOf(list: List, business: Business) {
  const seed = seedFor(business)
  return list.kind === "people"
    ? seed.contacts.filter((c) => list.memberIds.includes(c.id))
    : []
}

export function companyMembersOf(list: List, business: Business) {
  const seed = seedFor(business)
  return list.kind === "companies" ? seed.companies.filter((c) => list.memberIds.includes(c.id)) : []
}
