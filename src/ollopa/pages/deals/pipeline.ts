// Reading the pipeline: scope, period, the column sums, the four forecast figures and the coverage pair.
//
// Nothing here renders. The board and the table both read it, so the two can never disagree about
// what "this quarter, my team, 74 deals" means, and a number printed twice is computed once.
import {
  QUAL_ELEMENTS, STAGE_FORECAST, STAGE_PROBABILITY, TODAY, dealWarnings,
  type Deal, type DealStage, type DealWarning, type ForecastCategory, type QualElement,
  type QualElementName, type Seed,
} from "../../data/seed"
import type { BusinessDef } from "../../data/businesses"
import { ago, day, money } from "../deal/format"

/** Five stages. There is no Closed lost: a lost deal is archived with a reason and leaves the board. */
export const OPEN_STAGES: DealStage[] = ["Qualified", "Discovery", "Proposal", "Negotiation"]
export const WON_STAGE: DealStage = "Closed won"
export const ALL_STAGES: DealStage[] = [...OPEN_STAGES, WON_STAGE]

export const LOST_REASONS = ["Price", "No decision", "Competitor", "Timing"]
export const FORECAST_CATEGORIES_UI: ForecastCategory[] = ["Pipeline", "Best case", "Commit", "Closed", "Omitted"]

/** The six warnings, in the order the record and Settings list them (spec 09 §2). */
export const WARNING_KINDS = ["No activity", "Ghosted", "Overdue", "Too few contacts", "No senior sponsor", "Stalled in stage"] as const
export type WarningKind = (typeof WARNING_KINDS)[number]

export const isOpen = (d: Deal) => d.stage !== WON_STAGE && !d.archivedAt
export const isLive = (d: Deal) => !d.archivedAt

/* ------------------------------------------------------------------------------ scope and period */

export type Scope = "mine" | "team" | "all"
export const SCOPE_LABEL: Record<Scope, string> = { mine: "Mine", team: "My team", all: "All" }

/**
 * The people a scope covers. An AE seat with direct reports is the manager of those reports
 * (IA-MAP 6.4j); any other seat's team is the team it sits on in the workspace.
 */
export function scopeNames(scope: Scope, user: string, seed: Seed, b: BusinessDef): string[] | null {
  if (scope === "all") return null
  if (scope === "mine") return [user]
  const seat = b.roles.find((r) => r.user === user)
  if (seat?.reports?.length) return [user, ...seat.reports]
  const team = seed.users.find((u) => u.name === user)?.team
  const mates = seed.users.filter((u) => u.team === team).map((u) => u.name)
  return mates.length ? Array.from(new Set([user, ...mates])) : [user]
}

export type PeriodKey = "any" | "month" | "quarter" | "next" | "overdue"
export interface Period { key: PeriodKey; label: string; words: string }

export const PERIODS: Period[] = [
  { key: "any", label: "Closing: any time", words: "at any time" },
  { key: "month", label: "Closing: this month", words: "this month" },
  { key: "quarter", label: "Closing: this quarter", words: "this quarter" },
  { key: "next", label: "Closing: next quarter", words: "next quarter" },
  { key: "overdue", label: "Closing: overdue", words: "already overdue" },
]

const pad = (n: number) => String(n).padStart(2, "0")
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate()

export function periodRange(key: PeriodKey, today = TODAY): { from: string; to: string } | null {
  const y = Number(today.slice(0, 4))
  const m = Number(today.slice(5, 7))
  const iso = (yy: number, mm: number, dd: number) => `${yy}-${pad(mm)}-${pad(dd)}`
  if (key === "month") return { from: iso(y, m, 1), to: iso(y, m, lastDay(y, m)) }
  if (key === "quarter") {
    const start = Math.floor((m - 1) / 3) * 3 + 1
    return { from: iso(y, start, 1), to: iso(y, start + 2, lastDay(y, start + 2)) }
  }
  if (key === "next") {
    const q = Math.floor((m - 1) / 3) + 1
    const yy = y + Math.floor(q / 4)
    const start = (q % 4) * 3 + 1
    return { from: iso(yy, start, 1), to: iso(yy, start + 2, lastDay(yy, start + 2)) }
  }
  return null
}

export function inPeriod(d: Deal, key: PeriodKey, today = TODAY): boolean {
  if (key === "any") return true
  if (key === "overdue") return d.closeDate < today && isOpen(d)
  const r = periodRange(key, today)!
  return d.closeDate >= r.from && d.closeDate <= r.to
}

/* ------------------------------------------------------------------------------------ the sums */

export const sumOf = (rows: Deal[]) => rows.reduce((n, d) => n + d.amount, 0)
export const weightedOf = (rows: Deal[]) => rows.reduce((n, d) => n + Math.round((d.amount * d.probability) / 100), 0)

const SYMBOL: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" }

/** "€480k" — a column header and a strip tile carry a sum, not a ledger entry. */
export function moneyShort(n: number, currency: string): string {
  const sym = SYMBOL[currency] ?? `${currency} `
  const a = Math.abs(Math.round(n))
  const body =
    a >= 1_000_000 ? `${(a / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1)}m`
    : a >= 1_000 ? `${Math.round(a / 1_000)}k`
    : `${a}`
  return `${n < 0 ? "-" : ""}${sym}${body}`
}

/** What a screen reader hears on a column: "Proposal, 12 deals, 480,000 euros". */
const CURRENCY_WORD: Record<string, string> = { USD: "dollars", EUR: "euros", GBP: "pounds" }
export function moneySpoken(n: number, currency: string): string {
  return `${Math.round(n).toLocaleString("en-US")} ${CURRENCY_WORD[currency] ?? currency}`
}

/* -------------------------------------------------------------------------------- the warnings */

export function warningsOf(d: Deal, seed: Seed): DealWarning[] {
  return dealWarnings(d, TODAY, seed.dealWarningThresholds)
}

/** How many deals in view each of the six fires on: the count the filter door carries per warning. */
export function warningCounts(rows: Deal[], seed: Seed): Record<WarningKind, number> {
  const out = Object.fromEntries(WARNING_KINDS.map((k) => [k, 0])) as Record<WarningKind, number>
  for (const d of rows) for (const w of warningsOf(d, seed)) out[w.kind as WarningKind] = (out[w.kind as WarningKind] ?? 0) + 1
  return out
}

/* ------------------------------------------------------------------------------- the forecast */

export interface Figure { key: string; label: string; count: number; amount: number }

/**
 * Commit, Best case (commit plus best case), Pipeline (all open) and Closed won for the scope and
 * period in view. Omitted is appended only when its count is above zero — object state, not a
 * setting (rule 6).
 */
export function forecastFigures(rows: Deal[]): Figure[] {
  const live = rows.filter(isLive)
  const of = (key: string, label: string, ds: Deal[]): Figure => ({ key, label, count: ds.length, amount: sumOf(ds) })
  const omitted = live.filter((d) => d.forecast === "Omitted")
  return [
    of("commit", "Commit", live.filter((d) => d.forecast === "Commit")),
    of("best", "Best case", live.filter((d) => d.forecast === "Commit" || d.forecast === "Best case")),
    of("pipeline", "Pipeline", live.filter(isOpen)),
    of("won", "Closed won", live.filter((d) => d.stage === WON_STAGE)),
    ...(omitted.length ? [of("omitted", "Omitted", omitted)] : []),
  ]
}

/* -------------------------------------------------------------------------------- the coverage */

/**
 * Observed coverage: the open pipeline in view over the goal for this scope.
 *
 * The other half of the pair — the win rate and the coverage it requires — is not computed here.
 * Spec 12 owns that figure, and `pages/reports/coverage.ts` exports it, so the strip reads
 * `coverageFor(seed).line` and prints the Pipeline report's words unchanged. The two can then never
 * disagree about what coverage is enough. Neither number is ever printed without the other.
 */
export function observedCoverage(inView: Deal[], goal: number): { coverage: number | null; openPipeline: number; goal: number } {
  const openPipeline = sumOf(inView.filter(isOpen))
  return { coverage: goal > 0 ? openPipeline / goal : null, openPipeline, goal }
}

/** The number the coverage is measured against: the team's goal for a team scope, else the people's. */
export function goalFor(scope: Scope, names: string[] | null, seed: Seed, user: string): number {
  if (scope === "team") {
    const team = seed.users.find((u) => u.name === user)?.team
    const teamGoal = seed.goals.find((g) => g.team && g.team === team)
    if (teamGoal) return teamGoal.amount
  }
  const people = names ?? seed.users.filter((u) => u.role === "ae").map((u) => u.name)
  return seed.goals.filter((g) => g.user && people.includes(g.user)).reduce((n, g) => n + g.amount, 0)
}

/* ------------------------------------------------------------------------------- a new deal */

/** Everything a deal needs that the New deal drawer does not ask for. Typed, never invented inline. */
export function newDeal(input: {
  id: string; name: string; company: string; companyId: string; amount: number; stage: DealStage
  closeDate: string; owner: string; pipeline: string; nextStep: string | null; nextStepDue: string | null
  currency: string
}): Deal {
  const qualification = Object.fromEntries(
    QUAL_ELEMENTS.map((e) => [e, { value: "", state: "suggested", source: "Not answered yet", updatedBy: input.owner, at: TODAY } as QualElement]),
  ) as Record<QualElementName, QualElement>
  return {
    ...input,
    probability: STAGE_PROBABILITY[input.stage],
    forecast: STAGE_FORECAST[input.stage],
    lastActivity: TODAY,
    dealType: "New",
    createdAt: TODAY, stageEnteredAt: TODAY, archivedAt: null, lostReason: null,
    syncState: null, crmId: null, crmSyncedAt: null, crmError: null,
    agentProposal: null, lastProspectActivityAt: null,
    contactCount: 0, seniorSponsor: false,
    source: "Typed on the board", campaign: null, competitor: null,
    contractTerm: "12 months", paymentTerms: "Net 30", discount: 0, proposalLink: null, esign: "not sent",
    splitOwners: [], tags: [], priority: "Normal", lineItems: [], custom: {},
    qualification,
    scoreAtFirstContact: { score: 0, modelVersion: "Fit score v3", stampedOn: TODAY },
  }
}

/* ----------------------------------------------------------- level one, and what closing it does */

/**
 * The deal's first level: the six fields the record opens with, in the record's order and with the
 * record's labels (spec 09 §6.8). The quick look, the table's quick look and the deal pane all read
 * this one list, so a deal read in three places is read the same way.
 */
export function dealGlanceFields(deal: Deal, currency: string): { label: string; value: string }[] {
  return [
    { label: "Stage", value: deal.stage },
    { label: "Amount", value: money(deal.amount, deal.currency || currency) },
    { label: "Close date", value: day(deal.closeDate) },
    { label: "Next step", value: deal.nextStep ? `${deal.nextStep} · ${day(deal.nextStepDue)}` : "No next step" },
    { label: "Owner", value: deal.owner },
    { label: "Last activity", value: `${day(deal.lastActivity)} · ${ago(deal.lastActivity)}` },
  ]
}

/**
 * What closing the deal won will do, word for word (spec 09 §3.2). The board, the record and the
 * pane all print this, so the sentence a person reads before the click never depends on where they
 * were standing. `openTasks` is the count where the caller knows it; the board does not.
 */
export function wonConsequenceText(deal: Deal, seed: Seed, b: BusinessDef, openTasks?: number): string {
  const crm = crmOf(seed)
  const csSeat = b.roles.find((r) => r.role === "cs")
  return [
    "Stage becomes Closed won.",
    "Forecast category becomes Closed.",
    openTasks === undefined ? null : `${openTasks} open task${openTasks === 1 ? "" : "s"} close.`,
    crm ? `${crm.name} is updated.` : null,
    csSeat ? `${deal.company} moves to customer success, and the hand-off arrives in ${csSeat.user}'s queue.` : null,
  ].filter(Boolean).join(" ")
}

/** The same for marking it lost: what leaves, what closes and what stays. */
export function lostConsequenceText(deal: Deal, seed: Seed, _b: BusinessDef, openTasks?: number): string {
  const crm = crmOf(seed)
  const tasks = openTasks === undefined ? "" : ` its ${openTasks} open task${openTasks === 1 ? "" : "s"} close,`
  return `Archived as lost. The deal leaves the board and the forecast,${tasks} it stays on ${deal.company} and in Reports, and the ${crm?.name ?? "CRM"} opportunity is not deleted.`
}

function crmOf(seed: Seed) {
  return seed.integrations.find((i) => /crm|salesforce|hubspot/i.test(`${i.kind} ${i.name}`))
}
