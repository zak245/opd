// What the Agents page asks of the seed, and nothing else.
//
// Four questions, answered here so the components only render: whose item is this, what will it do if
// approved, what did it cost, and how long has it got. Nothing in this file renders a usage number, a
// rule name or a word of teaching text, and nothing here invents a row: every value is read from
// `seedFor(business)` or derived from it by a function you can read.
import { businessById } from "../../data/businesses"
import {
  CREDITS, STAGE_FORECAST, STAGE_PROBABILITY, TODAY, seedFor,
  type Agent, type AgentEvent, type Seed,
} from "../../data/seed"
import type { ConsequenceProps } from "../../ui/ConsequenceLine"
import { ruleOn, type Lesson } from "@/learn/context"
import type { Session } from "../../session"
import type { Business, Role } from "../../usage/model"
import { daysBetween } from "../deal/format"

/** An approval that is never decided is a decision nobody made, presented as a decision pending. */
export const EXPIRY_DAYS = 14
/** Three days of notice before the product declines it (spec 13 §3, "Expiry"). */
export const EXPIRY_NOTICE_DAYS = 3

export const AGENT_NAMES = ["Research agent", "Outreach agent", "Scoring agent"] as const
export type AgentName = (typeof AGENT_NAMES)[number]

export const SURFACE_LABEL: Record<AgentEvent["surface"], string> = {
  app: "App", automation: "Automation", api: "API", mcp: "MCP", cli: "CLI", agent: "Agent",
}

export const KIND_LABEL: Record<AgentEvent["kind"], string> = {
  researched: "Researched", drafted: "Drafted", scored: "Scored", proposed: "Proposed",
  sent: "Sent", paused: "Paused", capped: "Capped", skipped: "Skipped",
}

/** What a person did on this page in this session. The ledger reads it beside the seed's own record. */
export interface LocalDecision {
  status: "approved" | "declined" | "snoozed" | "handed"
  by: string
  at: string
  /** An admin deciding on somebody else's item: the ledger says so, always. */
  forOwner?: string
  edited?: boolean
  note?: string
  to?: string
  held?: string
}

/* ------------------------------------------------------------------ whose item is this */

/**
 * Who approves this item: the seat that owns the work it would do. The seed puts a send or an
 * enrolment on the seat that runs outbound, a stage change on the person who owns the deal, and a
 * request to spend over the cap on whoever owns the company (spec 13 §3, "By role").
 */
export function queueOwner(e: AgentEvent): string {
  return e.ownerId
}

/** The draft as it would go out, signed by the person whose mailbox is sending it. */
export function draftFor(e: AgentEvent): string {
  return e.draft ?? ""
}

/** The mailbox an item sends from: its owner's, which is what "from your mailbox" has to mean. */
export function mailboxFor(e: AgentEvent, seed: Seed): string {
  return e.ifApproved?.mailbox ?? seed.mailboxes.find((m) => m.owner === e.ownerId)?.address ?? "your mailbox"
}

/** True while the mailbox this item would send from is paused: it stays behind, and says why. */
export function mailboxPaused(owner: string, seed: Seed): string | null {
  const mb = seed.mailboxes.find((m) => m.owner === owner)
  return mb?.paused ? mb.pausedReason ?? "Paused by bounce guard" : null
}

/**
 * Whose activity this seat reads (spec 13 §3, "By role and by business").
 * At Fathom everyone sees everyone; an admin sees everyone anywhere; everyone else sees their own,
 * and the marketer also reads the research and scoring agents, which is where their work is.
 */
export function seesEveryone(role: Role, business: Business): boolean {
  return role === "admin" || business === "fathom"
}

export function inScope(e: AgentEvent, session: Session, seed: Seed): boolean {
  if (seesEveryone(session.role, session.business)) return true
  const owner = queueOwner(e)
  if (owner === session.user) return true
  if (session.role === "marketer") return e.agent !== "Outreach agent"
  if (session.role === "ae") {
    const deal = seed.deals.find((d) => d.id === e.dealId)
    return !!deal && deal.owner === session.user
  }
  return false
}

/** The teammate filter exists only for people who see other people's items. */
export function hasTeammateFilter(role: Role, business: Business): boolean {
  return seesEveryone(role, business)
}

/* -------------------------------------------------------------- what it will do, and when */

export function daysLeft(e: AgentEvent): number | null {
  return e.expiresOn ? -daysBetween(e.expiresOn) : null
}

export function expired(e: AgentEvent): boolean {
  const n = daysLeft(e)
  return n !== null && n <= 0
}

export function nearExpiry(e: AgentEvent): boolean {
  const n = daysLeft(e)
  return n !== null && n > 0 && n <= EXPIRY_NOTICE_DAYS
}

export function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
}

/** The forecast a stage change moves the money into: the number people report upward. */
export interface StageForecast {
  company: string
  from: string
  to: string
  fromProbability: number
  toProbability: number
  fromCategory: string
  toCategory: string
  amount: string
}

export function stageForecast(e: AgentEvent, seed: Seed, currency: string): StageForecast | null {
  const deal = seed.deals.find((d) => d.id === e.dealId)
  const to = e.ifApproved?.stage
  if (!deal || !to) return null
  const target = to as keyof typeof STAGE_PROBABILITY
  return {
    company: deal.company,
    from: deal.stage, to,
    fromProbability: STAGE_PROBABILITY[deal.stage],
    toProbability: STAGE_PROBABILITY[target] ?? deal.probability,
    fromCategory: STAGE_FORECAST[deal.stage],
    toCategory: STAGE_FORECAST[target] ?? STAGE_FORECAST[deal.stage],
    amount: money(deal.amount, currency),
  }
}

/** One sentence in the product's words, beside Approve and never behind a door (rule 5). */
export function consequenceFor(e: AgentEvent, seed: Seed, currency: string): ConsequenceProps {
  const c = e.ifApproved
  if (!c) return {}
  const mailbox = mailboxFor(e, seed)
  switch (c.action) {
    case "send":
      return { sends: 1, to: e.contact ?? "the contact", from: mailbox, credits: c.credits, changes: "Replies land in your Inbox" }
    case "enrol":
      return {
        changes: `Adds ${(c.recipients ?? 1).toLocaleString()} people to “${c.sequence ?? "a sequence"}”. Step 1 sends ${c.sendsAt ?? "on the next working morning"} from ${mailbox}`,
        credits: c.credits,
      }
    case "stage": {
      const f = stageForecast(e, seed, currency)
      return f
        ? { changes: `Moves ${f.company} from ${f.from} to ${f.to}. ${f.amount} moves from ${f.fromCategory} to ${f.toCategory}`, credits: c.credits }
        : { changes: `Moves the deal to ${c.stage}`, credits: c.credits }
    }
    case "spend":
      return { changes: `Spends ${c.credits.toLocaleString()} credits above the agent's cap`, credits: c.credits }
  }
}

/** Over the Settings threshold, so the owner approves and then an admin does (spec 13 §1). */
export function overSecondApproval(e: AgentEvent, seed: Seed): boolean {
  const c = e.ifApproved
  if (!c) return false
  return (c.recipients ?? 0) > seed.secondApproval.recipients || c.credits > seed.secondApproval.credits
}

/* ------------------------------------------------------------------------- the two lists */

export interface Queues {
  /** Waiting for a decision, oldest first, grouped by the agent that produced it. */
  waiting: AgentEvent[]
  /** Everything else this seat may read, newest first. Waiting items are never repeated here. */
  ledger: AgentEvent[]
  /** Declined by the product at fourteen days: out of the queue, in the ledger, nothing sent. */
  expired: AgentEvent[]
}

export function queuesFor(session: Session, seed: Seed): Queues {
  const mine = seed.agentEvents.filter((e) => inScope(e, session, seed))
  const pending = mine.filter((e) => e.status === "waiting" || e.status === "waiting-second")
  const waiting = pending.filter((e) => !expired(e)).sort((a, b) => `${a.when} ${a.at}`.localeCompare(`${b.when} ${b.at}`))
  const gone = pending.filter(expired)
  const ledger = [...mine.filter((e) => !pending.includes(e)), ...gone]
    .sort((a, b) => `${b.when} ${b.at}`.localeCompare(`${a.when} ${a.at}`))
  return { waiting, ledger, expired: gone }
}

/** The queue, in the order it is read: by the agent that produced it, oldest first inside each. */
export function byAgent(events: AgentEvent[]): { agent: AgentName; items: AgentEvent[] }[] {
  return AGENT_NAMES
    .map((agent) => ({ agent, items: events.filter((e) => e.agent === agent) }))
    .filter((g) => g.items.length > 0)
}

/* --------------------------------------------------------------------------- the batch line */

export interface Batch {
  /** When the run that produced these items stopped: the task boundary the batch arrives at. */
  at: string
  count: number
  sends: number
  enrols: number
  stages: number
  credits: number
  skipped: { reason: string; count: number }[]
  skippedTotal: number
}

export function batchOf(waiting: AgentEvent[], seed: Seed, session: Session): Batch | null {
  if (waiting.length === 0) return null
  const skipped = seed.agentEvents.filter((e) => e.kind === "skipped" && inScope(e, session, seed))
  const reasons = new Map<string, number>()
  for (const s of skipped) reasons.set(s.skipReason ?? "not given", (reasons.get(s.skipReason ?? "not given") ?? 0) + 1)
  const act = (a: string) => waiting.filter((e) => e.ifApproved?.action === a).length
  return {
    at: waiting.reduce((latest, e) => (e.at > latest ? e.at : latest), waiting[0].at),
    count: waiting.length,
    sends: act("send"),
    enrols: waiting.filter((e) => e.ifApproved?.action === "enrol").reduce((n, e) => n + (e.ifApproved?.recipients ?? 0), 0),
    stages: act("stage"),
    credits: waiting.reduce((n, e) => n + (e.ifApproved?.credits ?? 0), 0),
    skipped: [...reasons].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
    skippedTotal: skipped.length,
  }
}

/* ------------------------------------------------------------------------------- the spend */

export interface Spend {
  today: number
  week: number
  /** The agents' own weekly allowance: the daily caps they are set, over a week. */
  weekCap: number
  /** The workspace's credit balance, which the agents draw from. */
  balance: number
  monthlyCap: number
}

export function spendOf(seed: Seed, business: Business): Spend {
  const agents = seed.agents
  return {
    today: agents.reduce((n, a) => n + a.spentToday, 0),
    week: agents.reduce((n, a) => n + a.spentThisWeek, 0),
    weekCap: agents.reduce((n, a) => n + a.capPerDay, 0) * 7,
    balance: businessById(business).credits.balance,
    monthlyCap: seed.credits.monthlyCap,
  }
}

/** Credits for one day, for the ledger's day digest. */
export function digestOf(events: AgentEvent[]): { kinds: string; credits: number; count: number } {
  const counts = new Map<AgentEvent["kind"], number>()
  for (const e of events) counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1)
  const kinds = [...counts]
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${n} ${KIND_LABEL[k].toLowerCase()}`)
    .join(", ")
  return { kinds, credits: events.reduce((n, e) => n + e.credits, 0), count: events.length }
}

/* --------------------------------------------------------------- what this agent did for you */

/**
 * The observed track record: what this agent has actually done for this person. It is the only honest
 * answer to "can I trust it", and it is why there is no confidence badge anywhere on this page.
 */
export interface TrackRecord { proposed: number; approved: number; declined: number; waiting: number }

export function trackRecord(agent: string, session: Session, seed: Seed, local: Record<string, LocalDecision>): TrackRecord {
  const mine = seed.agentEvents.filter(
    (e) => e.agent === agent && queueOwner(e) === session.user && e.ifApproved,
  )
  const decided = (e: AgentEvent, want: "approved" | "declined") =>
    (local[e.id]?.status ?? e.status) === want
  return {
    proposed: mine.length,
    approved: mine.filter((e) => decided(e, "approved")).length,
    declined: mine.filter((e) => decided(e, "declined")).length,
    waiting: mine.filter((e) => !local[e.id] && (e.status === "waiting" || e.status === "waiting-second")).length,
  }
}

/* ------------------------------------------------------------------------------ exceptions */

export interface Exception {
  id: string
  /** The reason, the number that tripped it, and the threshold, in one sentence. */
  text: string
  /** What can be done about it here, and where the threshold itself lives. */
  resume?: boolean
  href?: string
  hrefLabel?: string
}

export function exceptionsOf(seed: Seed, agents: Agent[], pausedHere: Record<string, boolean>): Exception[] {
  const out: Exception[] = []

  for (const a of agents) {
    if (pausedHere[a.id]) {
      out.push({ id: `paused-here-${a.id}`, text: `${a.name} paused. Nothing more is drafted or sent until someone resumes it. Items already waiting stay waiting.`, resume: true })
    } else if (!a.on && a.pausedReason) {
      out.push({ id: `off-${a.id}`, text: `${a.name} is off. ${a.pausedReason}.`, href: "/ollopa/settings/agents", hrefLabel: "Agent settings" })
    }
  }

  for (const e of seed.agentEvents.filter((x) => x.kind === "capped")) {
    out.push({ id: `cap-${e.id}`, text: `${e.summary}. Work that spends credits waits for the cap to reset at 00:00.`, href: "/ollopa/settings/agents", hrefLabel: "Credit caps" })
  }

  for (const m of seed.mailboxes.filter((x) => x.paused)) {
    out.push({
      id: `mailbox-${m.id}`,
      text: `${m.address} is paused. ${m.pausedReason ?? "Paused by bounce guard"}. Bounce guard warns at ${seed.bounceGuard.warnPercent}% and pauses at ${seed.bounceGuard.pausePercent}%.`,
      resume: true, href: "/ollopa/settings/email-sending", hrefLabel: "Open bounce guard",
    })
  }

  const companyPauses = seed.agentEvents.filter((x) => x.kind === "paused")
  if (companyPauses.length > 0) {
    out.push({
      id: "company-pauses",
      text: `Outreach paused to ${companyPauses.length} ${companyPauses.length === 1 ? "company" : "companies"}: bounce rate 5.1%, over the ${seed.bounceGuard.warnPercent}% warning and under the ${seed.bounceGuard.pausePercent}% pause threshold.`,
      resume: true, href: "/ollopa/settings/email-sending", hrefLabel: "Open bounce guard",
    })
  }

  return out
}

/* ------------------------------------------------- the research agent's running list watch */

/**
 * The research agent reads a saved list and keeps going. It is low-cost and reversible, so nothing
 * here is ever queued — but it spends, so its running total and the switch that stops it are on the
 * tile, at level one, for anyone allowed to stop it (rule 7: a kill switch is safety state).
 */
export interface Watch { list: string; done: number; credits: number }

export function watchOf(seed: Seed): Watch | null {
  const runs = seed.agentEvents.filter((e) => e.agent === "Research agent" && e.trigger === "A list was saved")
  const list = seed.lists[0]
  if (runs.length === 0 || !list) return null
  return { list: list.name, done: runs.length, credits: runs.reduce((n, e) => n + e.credits, 0) }
}

/* --------------------------------------------------------------------- who changes settings */

export function adminOf(business: Business): { user: string; title: string } | null {
  const seat = businessById(business).roles.find((r) => r.role === "admin")
  return seat ? { user: seat.user, title: seat.title } : null
}

export function canPause(session: Session): boolean {
  // Admins everywhere; at Fathom everyone is an admin, which is how that workspace is declared.
  return session.role === "admin" || session.business === "fathom"
}

/** "Since you last looked": the person chooses the moment, and nothing on the page moves because of it. */
const SEEN = (user: string) => `ollopa.agents.lastSeen.${user}`

export function lastSeen(user: string): string {
  try {
    const raw = localStorage.getItem(SEEN(user))
    if (raw) return raw
  } catch { /* private mode: this visit only */ }
  return `${new Date(Date.parse(TODAY) - 86_400_000).toISOString().slice(0, 10)} 17:20`
}

export function markSeen(user: string, at: string) {
  try { localStorage.setItem(SEEN(user), at) } catch { /* private mode: this visit only */ }
}

export function since(events: AgentEvent[], seen: string): number {
  return events.filter((e) => `${e.when} ${e.at}` > seen).length
}

export const DRAFT_CREDITS = CREDITS.draft

/* ------------------------------------------------------------------ the lesson's six rules */

/**
 * The six rules this page's case turns on, in the order the lesson applies them (spec 13 §7):
 * 7, 1, 2, 4, 5, 8. Rules 3 and 6 are notes on the last step, so the page never branches on them —
 * a branch on `ruleOn(lesson, 3)` would be false at the last step and the product would not match.
 * In the product `lesson` is null and every flag is true: one component, one model, a layout per step.
 */
export interface RuleFlags { r1: boolean; r2: boolean; r4: boolean; r5: boolean; r7: boolean; r8: boolean }

export function ruleFlags(lesson: Lesson | null): RuleFlags {
  return {
    r1: ruleOn(lesson, 1), r2: ruleOn(lesson, 2), r4: ruleOn(lesson, 4),
    r5: ruleOn(lesson, 5), r7: ruleOn(lesson, 7), r8: ruleOn(lesson, 8),
  }
}

/** The runs behind the ledger: one row per batch the agents ran, which is what Apollo's Enrollment tab shows. */
export interface Run { key: string; when: string; at: string; label: string; completed: number; failed: number; reason: string | null; credits: number }

export function runsOf(events: AgentEvent[]): Run[] {
  const byKey = new Map<string, AgentEvent[]>()
  for (const e of events) byKey.set(e.batchKey, [...(byKey.get(e.batchKey) ?? []), e])
  return [...byKey]
    .map(([key, items]) => {
      const failed = items.filter((e) => e.kind === "skipped" || e.kind === "capped" || e.kind === "paused")
      const first = items.reduce((a, b) => (`${a.when} ${a.at}` < `${b.when} ${b.at}` ? a : b))
      return {
        key, when: first.when, at: first.at,
        label: key.slice(11).replace(/^-/, "") || "run",
        completed: items.length - failed.length,
        failed: failed.length,
        reason: failed[0]
          ? failed[0].kind === "capped" ? "credit limit"
            : failed[0].kind === "paused" ? "inactive mailbox"
              : failed[0].skipReason ?? "missing owner"
          : null,
        credits: items.reduce((n, e) => n + e.credits, 0),
      }
    })
    .sort((a, b) => `${b.when} ${b.at}`.localeCompare(`${a.when} ${a.at}`))
    .slice(0, 6)
}
