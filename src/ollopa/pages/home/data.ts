// What Home reads. One place, so a section renders and never computes.
//
// Everything here comes from `seedFor(business)`; nothing is invented on the page. What is derived is
// derived once: overdue is a date against the seed's today, a hot reply is an outcome not yet handled,
// a pending approval is an agent event still waiting for a human, and the health strip is the workspace
// health object read against the bounce-guard pair and the credit cap.
import { businessById } from "../../data/businesses"
import {
  BOUNCE_GUARD, DEAL_STAGES, FORECAST_CATEGORIES, TODAY, dealWarnings, seedFor,
  type AgentEvent, type Company, type Deal, type Reply, type Sequence, type Task,
} from "../../data/seed"
import type { Session } from "../../session"
import type { ConsequenceProps } from "../../ui"
import { addDays, count, daysBetween, longDay, money, plural } from "./format"

export type SectionKey = "today" | "replies" | "pipeline" | "approvals" | "campaigns" | "accounts" | "week"

/** A batch of agent items that arrived together: one run, one task boundary, one heading. */
export interface Batch {
  key: string
  agent: string
  /** "Outreach agent finished 3 drafts at 09:12" — the sentence the section prints above the rows. */
  heading: string
  items: AgentEvent[]
}

export interface SetupRow {
  id: string
  /** The noun that goes in the door's label: mailbox, CRM, invites. */
  noun: string
  text: string
  href: string
  /** A row that can be answered rather than done ("Ollopa is our CRM"). */
  declare?: string
}

export function consequenceOf(e: AgentEvent): ConsequenceProps {
  const a = e.ifApproved
  if (!a) return { credits: e.credits }
  if (a.action === "send") return { sends: 1, to: e.to ?? e.contact ?? undefined, from: a.mailbox, credits: a.credits }
  if (a.action === "enrol") return { changes: `Adds ${count(a.recipients ?? 0)} people to “${a.sequence}”`, credits: a.credits }
  if (a.action === "stage") return { changes: `Moves ${e.company ?? "the deal"} to ${a.stage}`, credits: a.credits }
  return { changes: `Spends up to ${count(a.credits)} credits`, credits: a.credits }
}

/** What the agent proposes, in one sentence, on the row itself. */
export function proposalOf(e: AgentEvent): string {
  const a = e.ifApproved
  if (a?.action === "send" && e.contact) return `Send a first email to ${e.contact}${e.company ? ` at ${e.company}` : ""}`
  if (a?.action === "enrol") return `Add ${count(a.recipients ?? 0)} people to “${a.sequence}”`
  if (a?.action === "stage") return `Move ${e.company ?? "the deal"} to ${a.stage}`
  return e.summary
}

export function wordsOf(e: AgentEvent): number {
  return e.draft ? e.draft.trim().split(/\s+/).length : 0
}

function sortByDate<T extends { when: string; at: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => (a.when + a.at).localeCompare(b.when + b.at))
}

export function homeData(session: Session) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const user = session.user
  const seat = b.roles.find((role) => role.user === user) ?? b.roles.find((role) => role.role === session.role)!
  const admin = b.roles.find((role) => role.role === "admin")
  const reports = seat.reports ?? []
  const team = [user, ...reports]

  /* ------------------------------------------------------------------------------------- today */

  const mineTasks = seed.tasks.filter((t) => t.owner === user)
  const openTasks = mineTasks.filter((t) => t.status === "Open")
  const byDue = (a: Task, z: Task) => a.due.localeCompare(z.due)
  const overdue = openTasks.filter((t) => t.due < TODAY).sort(byDue)
  const dueToday = openTasks.filter((t) => t.due === TODAY).sort(byDue)
  const later = openTasks.filter((t) => t.due > TODAY && t.due <= addDays(TODAY, 5)).sort(byDue)

  /* ----------------------------------------------------------------------------------- replies */

  const ownerOf = new Map(seed.contacts.map((c) => [c.id, c.owner]))
  const mineReplies = seed.replies.filter((r) => !r.handled && ownerOf.get(r.contactId) === user)
  const anyReplies = seed.replies.filter((r) => !r.handled)
  const replyPool = mineReplies.length > 0 ? mineReplies : session.role === "admin" ? anyReplies : mineReplies
  const newest = (a: Reply, z: Reply) => z.received.localeCompare(a.received)
  const hotReplies = replyPool.filter((r) => r.outcome === "Interested" || r.outcome === "Question").sort(newest)
  const otherReplies = replyPool.filter((r) => r.outcome === "Not now" || r.outcome === "Out of office").sort(newest)
  const hasCalendar = seed.integrations.some((i) => i.kind.includes("Calendar") && i.status !== "not connected")

  /* ---------------------------------------------------------------------------------- pipeline */

  const openDeals = seed.deals.filter((d) => d.stage !== "Closed won" && !d.archivedAt)
  const myDeals = openDeals.filter((d) => d.owner === user)
  const teamDeals = openDeals.filter((d) => team.includes(d.owner))
  const sum = (rows: Deal[]) => rows.reduce((n, d) => n + d.amount, 0)
  const scope = session.role === "ae" && myDeals.length > 0 ? myDeals : openDeals
  const closing = scope
    .filter((d) => d.closeDate >= TODAY && d.closeDate <= addDays(TODAY, 30))
    .sort((a, z) => a.closeDate.localeCompare(z.closeDate))
  const noNextStep = scope.filter((d) => !d.nextStep)
  const needsAttention = scope.filter((d) => dealWarnings(d).length > 0)
  const byStage = DEAL_STAGES.map((stage) => {
    const rows = seed.deals.filter((d) => d.stage === stage && !d.archivedAt)
    return { label: stage, count: rows.length, total: sum(rows) }
  })
  const byForecast = FORECAST_CATEGORIES.map((category) => {
    const rows = openDeals.filter((d) => d.forecast === category)
    return { label: category, count: rows.length, total: sum(rows) }
  })

  /* --------------------------------------------------------------------------------- approvals */

  const waitingAll = seed.agentEvents.filter((e) => e.needsApproval && (e.status === "waiting" || e.status === "waiting-second"))
  // You approve for the objects you own: the contact the agent wrote to, the sequence it proposes
  // enrolling into, or the deal it proposes moving. The admin sees everyone's and approves for them.
  const owns = (e: AgentEvent) =>
    e.ownerId === user
    || (e.sequence !== null && seed.sequences.find((s) => s.name === e.sequence)?.owner === user)
    || (e.dealId !== null && seed.deals.find((x) => x.id === e.dealId)?.owner === user)
  const waiting = sortByDate(session.role === "admin" ? waitingAll : waitingAll.filter(owns))
  // A batch is one run: the task boundary the rows arrived at, which the seed carries as `batchKey`.
  const batches: Batch[] = []
  for (const item of waiting) {
    const key = item.batchKey
    const found = batches.find((x) => x.key === key)
    if (found) found.items.push(item)
    else batches.push({ key, agent: item.agent, heading: "", items: [item] })
  }
  for (const batch of batches) {
    const first = batch.items[0]
    const kinds = new Set(batch.items.map((i) => i.ifApproved?.action ?? "spend"))
    const noun = kinds.size > 1 ? "items" : first.ifApproved?.action === "enrol" ? "proposals" : first.ifApproved?.action === "stage" ? "stage changes" : "drafts"
    batch.heading = `${batch.agent} finished ${batch.items.length} ${batch.items.length === 1 ? noun.replace(/s$/, "") : noun} at ${first.at}`
  }

  /** Logged work: cheap and reversible, so it is written down rather than queued (rule 7's corollary). */
  const week = sortByDate(seed.agentEvents.filter((e) => daysBetween(e.when) <= 7)).reverse()
  const loggedThisWeek = week.filter((e) => !e.needsApproval || e.decision !== null)
  const pausedByAgent = seed.agentEvents.filter((e) => e.kind === "paused" || e.kind === "capped")

  /** The overnight research run: logged work, one line, never an approval. */
  const research = seed.agentEvents
    .filter((e) => e.agent === "Research agent" && e.kind === "researched" && daysBetween(e.when) <= 1)
    .sort((a, z) => z.credits - a.credits)
  const researchRun = research[0] ?? null
  const strongest = researchRun
    ? seed.companies
      .filter((c) => research.some((e) => e.companyId === c.id))
      .sort((a, z) => (z.fitScore ?? 0) - (a.fitScore ?? 0))
      .slice(0, 3)
    : []
  const researchCredits = research.reduce((n, e) => n + e.credits, 0)
  const researchCompanies = new Set(research.map((e) => e.companyId)).size

  /* --------------------------------------------------------------------------------- campaigns */

  const running = seed.campaigns.filter((c) => c.status === "Running" || c.status === "Sending")
  const audiences = seed.audiences.filter((a) => a.mode === "live")
  const routingFlow = seed.workflows.find((w) => w.sla) ?? seed.workflows[0] ?? null
  const runsToday = seed.workflowRuns.filter((r) => r.at.slice(0, 10) >= addDays(TODAY, -1))
  const routing = routingFlow
    ? {
      workflowId: routingFlow.id,
      leads: runsToday.length,
      breached: routingFlow.sla?.breachedToday ?? 0,
      unrouted: runsToday.filter((r) => r.outcome === "not-routed").length,
    }
    : null
  const liveForms = seed.forms.filter((f) => f.status === "Live")
  const forms = liveForms.length
    ? {
      submissions: liveForms.reduce((n, f) => n + Math.round(f.submissions7d / 7), 0),
      unrouted: liveForms.reduce((n, f) => n + f.unrouted, 0),
      used: liveForms.reduce((n, f) => n + f.enrichUsedToday, 0),
      cap: liveForms.reduce((n, f) => n + f.enrichCapDaily, 0),
      formId: liveForms[0].id,
    }
    : null

  /* ---------------------------------------------------------------------------------- accounts */

  const clients = seed.companies.filter((c) => c.stage === "Current client")
  const mineFirst = (rows: Company[]) => {
    const mine = rows.filter((c) => c.owner === user)
    return mine.length >= 3 ? mine : rows
  }
  const renewals = mineFirst(clients.filter((c) => c.renewalDate && daysBetween(TODAY, c.renewalDate) <= 60 && c.renewalDate >= TODAY))
    .sort((a, z) => (a.renewalDate ?? "").localeCompare(z.renewalDate ?? ""))
  const healthDropped = mineFirst(clients.filter((c) => c.healthDelta7d <= -3)).sort((a, z) => a.healthDelta7d - z.healthDelta7d)
  const expansion = mineFirst(clients.filter((c) => c.expansionSignal)).sort((a, z) => (z.arr ?? 0) - (a.arr ?? 0))

  /* -------------------------------------------------------------------------------- your week */

  const activity = seed.activity.find((a) => a.user === user) ?? { user, sentThisWeek: 0, callsThisWeek: 0, meetingsBooked: 0, tasksDone: 0 }
  const mySequences = seed.sequences.filter((s: Sequence) => s.owner === user && s.status !== "Draft")
  const sequenceLine = mySequences.length
    ? `Sequences: ${mySequences.filter((s) => s.status === "Active").length} active, ${count(mySequences.reduce((n, s) => n + s.replied, 0))} replied, ${count(mySequences.reduce((n, s) => n + s.bounced, 0))} bounced`
    : null
  // A note about your call, written by someone else: your own notes are not feedback on you.
  const coaching = seed.calls.filter((c) => c.coachingNote && c.loggedBy === user && c.coachingNote.author !== user && daysBetween(c.startedAt) <= 7)
  const coachedByMe = seed.calls.filter((c) => c.coachingNote?.author === user && daysBetween(c.startedAt) <= 7)
  const repsCoached = new Set(coachedByMe.map((c) => c.loggedBy).filter((who) => reports.includes(who))).size

  /* ----------------------------------------------------------------------------- health strip */

  const health = seed.workspaceHealth
  const credits = seed.credits
  const daysOfCredit = daysBetween(TODAY, credits.runsOutOn)
  const pausedSequences = seed.sequences.filter((s) => s.guardState === "auto-paused" || (s.status === "Paused" && s.pausedBy === "Bounce guard"))
  const bounceHref = pausedSequences.length === 1
    ? `/ollopa/sequences/${pausedSequences[0].id}`
    : pausedSequences.length > 1
      ? "/ollopa/sequences?guard=auto-paused"
      : "/ollopa/settings/email-sending"
  const crmName = seed.workspace.crm?.split(" ")[0] ?? "The CRM"

  /* ---------------------------------------------------------- the workspace change, and set-up */

  const announced = seed.requests
    .map((r) => ({ request: r, a: r.announcement }))
    .filter((x) => x.a && x.a.expiresOn >= TODAY)
    .sort((a, z) => (z.a!.writtenOn).localeCompare(a.a!.writtenOn))[0] ?? null
  const announcement = announced
    ? {
      text: `${announced.a!.text} Changed by ${announced.request.shippedBy ?? announced.request.decisionOwner}, ${daysBetween(announced.a!.writtenOn) === 0 ? "today" : `${daysBetween(announced.a!.writtenOn)} days ago`}.`,
      href: `#/ollopa/requests/${announced.request.id}`,
    }
    : null

  const setupRows: SetupRow[] = [
    ...seed.workspace.setupRemaining.map((text, i) => ({
      id: `ws-${i}`,
      noun: /crm/i.test(text) ? "CRM" : /invit/i.test(text) ? "invites" : "mailbox",
      text,
      href: /crm/i.test(text) ? "/ollopa/settings/integrations" : "/ollopa/settings/email-sending",
    })),
    ...(seed.workspace.crm === null
      ? []
      : seed.integrations.some((i) => i.kind === seed.workspace.crm?.split(" ")[0])
        ? []
        : [{ id: "crm", noun: "CRM", text: `Connect ${crmName}`, href: "/ollopa/settings/integrations", declare: "Ollopa is our CRM" }]),
    ...(health.invitesPending > 0
      ? [{ id: "invites", noun: "invites", text: `${plural(health.invitesPending, "invitation")} not accepted`, href: "/ollopa/settings/team" }]
      : []),
  ]

  return {
    seed, business: b, seat, admin, reports, team, user, currency: b.currency,
    tasks: { overdue, dueToday, later, all: mineTasks.length },
    replies: { hot: hotReplies, other: otherReplies, hasCalendar },
    pipeline: {
      mine: myDeals, team: teamDeals, open: openDeals, scope,
      mineTotal: sum(myDeals), teamTotal: sum(teamDeals), openTotal: sum(openDeals),
      closing, noNextStep, needsAttention, byStage, byForecast,
    },
    approvals: {
      waiting, batches, loggedThisWeek, pausedByAgent, researchRun, strongest, researchCredits, researchCompanies,
      /** The waiting items whose object this person owns, and may therefore decide. */
      ownedByMe: new Set(waitingAll.filter(owns).map((e) => e.id)),
    },
    campaigns: { running, audiences, routing, forms },
    accounts: { renewals, healthDropped, expansion, clients },
    week: { activity, sequenceLine, coaching, coachedByMe, repsCoached, reports },
    health: {
      ...health, credits, daysOfCredit, bounceHref, crmName,
      guard: BOUNCE_GUARD,
      runsOutOn: longDay(credits.runsOutOn),
      pausedOutreach: pausedByAgent.length,
      pausedSequences,
    },
    announcement,
    setupRows,
    money: (n: number) => money(n, b.currency),
  }
}

export type HomeData = ReturnType<typeof homeData>
