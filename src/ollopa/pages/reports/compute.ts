// Every number on the page, computed at render from the seed's rows.
//
// The four reports and every drawer read the same functions, so a tile, a table cell and the drawer
// behind it can never disagree — which is what "metric availability varies by analytics surface"
// (spec 12 §5) looks like when they do not.
import {
  BOUNCE_GUARD, DEAL_STAGES, FORECAST_CATEGORIES, TODAY,
  type ActivityEvent, type Call, type Campaign, type Deal, type DealStage, type Seed, type Sequence, type User,
} from "../../data/seed"
import { addDays, daysBetween, monthStart, quarterName, quarterStart, rate, weekStart } from "./format"

/* ------------------------------------------------------------------------------------- the range */

export type RangeKey =
  | "this-week" | "last-7" | "last-30" | "this-month" | "last-month"
  | "this-quarter" | "last-quarter" | "last-90" | "this-year" | "custom"

export const RANGE_PRESETS: { key: RangeKey; label: string }[] = [
  { key: "this-week", label: "This week" },
  { key: "last-7", label: "Last 7 days" },
  { key: "last-30", label: "Last 30 days" },
  { key: "this-month", label: "This month" },
  { key: "last-month", label: "Last month" },
  { key: "this-quarter", label: "This quarter" },
  { key: "last-quarter", label: "Last quarter" },
  { key: "last-90", label: "Last 90 days" },
  { key: "this-year", label: "This year" },
]

export interface Range { key: RangeKey; from: string; to: string; label: string }

export function rangeFor(key: RangeKey, custom?: { from?: string; to?: string }): Range {
  const label = RANGE_PRESETS.find((p) => p.key === key)?.label ?? "Custom range"
  const t = TODAY
  switch (key) {
    case "this-week": return { key, from: weekStart(t), to: t, label }
    case "last-7": return { key, from: addDays(t, -6), to: t, label }
    case "last-30": return { key, from: addDays(t, -29), to: t, label }
    case "this-month": return { key, from: monthStart(t), to: t, label }
    case "last-month": {
      const firstOfThis = monthStart(t)
      const lastOfPrev = addDays(firstOfThis, -1)
      return { key, from: monthStart(lastOfPrev), to: lastOfPrev, label }
    }
    case "this-quarter": return { key, from: quarterStart(t), to: t, label }
    case "last-quarter": {
      const firstOfThis = quarterStart(t)
      const lastOfPrev = addDays(firstOfThis, -1)
      return { key, from: quarterStart(lastOfPrev), to: lastOfPrev, label }
    }
    case "last-90": return { key, from: addDays(t, -89), to: t, label }
    case "this-year": return { key, from: t.slice(0, 4) + "-01-01", to: t, label }
    case "custom": return { key, from: custom?.from ?? addDays(t, -29), to: custom?.to ?? t, label: "Custom range" }
  }
}

/** The same length of time immediately before the range, for "compare with previous period". */
export function previousOf(r: Range): Range {
  const span = daysBetween(r.from, r.to)
  const to = addDays(r.from, -1)
  return { key: r.key, from: addDays(to, -span), to, label: "previous period" }
}

/** Every Monday in the range, so a weekly series has a row for a week with nothing in it. */
export function weeksOf(r: Range): string[] {
  const out: string[] = []
  for (let w = weekStart(r.from); w <= r.to; w = addDays(w, 7)) out.push(w)
  return out.length > 0 ? out : [weekStart(r.to)]
}

const within = (d: string | null | undefined, r: Range) => Boolean(d) && d!.slice(0, 10) >= r.from && d!.slice(0, 10) <= r.to

/* ------------------------------------------------------------------------------------ the scope */

export interface Scope {
  range: Range
  /** A team name, or "all". */
  team: string
  /** A person's name, or "all". */
  person: string
}

/** The people the filters leave, by name. An empty team list means the workspace has no teams. */
export function peopleInScope(seed: Seed, scope: Scope): User[] {
  return seed.users.filter((u) => {
    if (scope.team !== "all" && u.team !== scope.team) return false
    if (scope.person !== "all" && u.name !== scope.person) return false
    return true
  })
}

/** "AE East · Elena Vasquez" — the chip that states what is applied. */
export function scopeChip(scope: Scope): string | null {
  const parts = [scope.team === "all" ? null : scope.team, scope.person === "all" ? null : scope.person].filter(Boolean)
  return parts.length ? parts.join(" · ") : null
}

/* -------------------------------------------------------------------------------- shared shapes */

export interface Tile {
  id: string
  label: string
  value: string
  /** The method or the definition, printed under the number rather than hidden in a glossary. */
  under?: string
  /** The count this tile's records drawer opens, when a zero is not a link. */
  records?: { kind: RecordKind; title: string; n: number }
  /** Text and an arrow, never colour alone. */
  delta?: { arrow: "↑" | "↓" | "→"; text: string }
  /** A number that is never gated, so it prints on a locked report too. */
  alwaysPrints?: boolean
  tone?: "warning"
}

export type RecordKind = "deals" | "people" | "calls" | "sequences" | "campaigns"

export interface Series { id: string; label: string; points: number[] }
export interface Trend {
  /** The Monday each bucket starts on, which is also how a date is bucketed. */
  weeks: string[]
  /**
   * What the axis prints. The first bucket is clipped to the range, so a range starting mid-week
   * says so on the tick rather than pretending to be a whole week.
   */
  labels: string[]
  series: Series[]
  unit: "count" | "money"
  summary: string
}

/** Tick labels for a set of week starts: the first one never claims days outside the range. */
export function labelsOf(weeks: string[], r: Range): string[] {
  return weeks.map((w, i) => (i === 0 && w < r.from ? r.from : w))
}

/* --------------------------------------------------------------------------- the Activity report */

export interface ActivityRow {
  user: string
  team: string
  emails: number
  calls: number
  meetings: number
  tasks: number
  overdue: number
  callsLogged: number
  coached: number
}

export interface ActivityReport {
  tiles: Tile[]
  trend: Trend
  rows: ActivityRow[]
  repsCoached: { done: number; of: number }
}

function countEvents(events: ActivityEvent[], kind: ActivityEvent["kind"]): number {
  return events.filter((e) => e.kind === kind).length
}

export function activityReport(seed: Seed, scope: Scope, opts: { leader: boolean }): ActivityReport {
  const people = peopleInScope(seed, scope)
  const names = new Set(people.map((u) => u.name))
  const events = seed.activityEvents.filter((e) => names.has(e.user) && within(e.date, scope.range))
  const prev = previousOf(scope.range)
  const before = seed.activityEvents.filter((e) => names.has(e.user) && within(e.date, prev))

  const weeks = weeksOf(scope.range)
  const bucket = (kind: ActivityEvent["kind"]) =>
    weeks.map((w) => events.filter((e) => e.kind === kind && weekStart(e.date) === w).length)

  const thirtyDaysAgo = addDays(TODAY, -29)
  const callsOf = (name: string) => seed.calls.filter((c) => c.loggedBy === name && within(c.startedAt, scope.range))
  const coachedOf = (name: string) =>
    seed.calls.filter((c) => c.loggedBy === name && c.coachingNote !== null && c.startedAt.slice(0, 10) >= thirtyDaysAgo).length

  const rows: ActivityRow[] = people
    .map((u) => {
      const mine = events.filter((e) => e.user === u.name)
      return {
        user: u.name,
        team: u.team,
        emails: countEvents(mine, "email"),
        calls: countEvents(mine, "call"),
        meetings: countEvents(mine, "meeting"),
        tasks: countEvents(mine, "task"),
        overdue: seed.tasks.filter((t) => t.owner === u.name && t.status === "Open" && t.due < TODAY).length,
        callsLogged: callsOf(u.name).length,
        coached: coachedOf(u.name),
      }
    })
    .filter((row) => row.emails + row.calls + row.meetings + row.tasks + row.callsLogged > 0)

  const emails = countEvents(events, "email")
  const calls = countEvents(events, "call")
  const meetings = countEvents(events, "meeting")
  const tasks = countEvents(events, "task")

  const d = (now: number, then: number) => {
    const diff = now - then
    return diff === 0
      ? { arrow: "→" as const, text: "no change on the period before" }
      : { arrow: diff > 0 ? ("↑" as const) : ("↓" as const), text: `${Math.abs(diff).toLocaleString("en-US")} ${diff > 0 ? "more" : "fewer"} than the period before` }
  }

  const weekAgo = addDays(TODAY, -6)
  const coachedThisWeek = new Set(
    seed.calls.filter((c) => c.coachingNote !== null && c.startedAt.slice(0, 10) >= weekAgo).map((c) => c.loggedBy),
  )
  const repsCoached = { done: [...coachedThisWeek].filter((n) => names.has(n)).length, of: Math.max(rows.length, 1) }

  const tiles: Tile[] = [
    { id: "emails", label: "Emails sent", value: emails.toLocaleString("en-US"), delta: d(emails, countEvents(before, "email")), records: emails ? { kind: "people", title: `${emails.toLocaleString("en-US")} emails`, n: emails } : undefined },
    { id: "calls", label: "Calls made", value: calls.toLocaleString("en-US"), delta: d(calls, countEvents(before, "call")), records: calls ? { kind: "calls", title: `${calls.toLocaleString("en-US")} calls`, n: calls } : undefined },
    { id: "meetings", label: "Meetings booked", value: meetings.toLocaleString("en-US"), under: "A contact moved to Meeting booked", delta: d(meetings, countEvents(before, "meeting")), records: meetings ? { kind: "people", title: `${meetings} meetings booked`, n: meetings } : undefined },
    { id: "tasks", label: "Tasks done", value: tasks.toLocaleString("en-US"), delta: d(tasks, countEvents(before, "task")) },
  ]
  if (opts.leader) {
    tiles.push({ id: "reps-coached", label: "Reps coached this week", value: `${repsCoached.done} of ${repsCoached.of}`, under: "Calls of theirs you left a note on" })
  }

  const first = bucket("email")[0] ?? 0
  const last = bucket("email")[weeks.length - 1] ?? 0
  return {
    tiles,
    trend: {
      weeks,
      labels: labelsOf(weeks, scope.range),
      unit: "count",
      series: [
        { id: "emails", label: "Emails", points: bucket("email") },
        { id: "calls", label: "Calls", points: bucket("call") },
        { id: "meetings", label: "Meetings", points: bucket("meeting") },
        { id: "tasks", label: "Tasks", points: bucket("task") },
      ],
      summary: `Emails sent went from ${first.toLocaleString("en-US")} to ${last.toLocaleString("en-US")} a week across ${weeks.length} weeks; calls, meetings and tasks are plotted beside them.`,
    },
    rows,
    repsCoached,
  }
}

/* --------------------------------------------------------------------------- the Pipeline report */

export interface PipelineRow {
  key: string
  count: number
  amount: number
  avgAge: number
  /** The deals behind the row, for the drawer. */
  deals: Deal[]
}

export interface PipelineReport {
  tiles: Tile[]
  trend: Trend
  byStage: PipelineRow[]
  byRep: PipelineRow[]
  conversion: { from: DealStage; to: DealStage; entered: number; advanced: number; percent: number }[]
  lostReasons: { reason: string; count: number; amount: number }[]
  wonDeals: Deal[]
  openDeals: Deal[]
  createdDeals: Deal[]
  lostDeals: Deal[]
  weighted: number
  currency: string
}

const isOpen = (d: Deal) => d.stage !== "Closed won" && !d.archivedAt

export function pipelineReport(seed: Seed, scope: Scope): PipelineReport {
  const people = peopleInScope(seed, scope)
  const names = new Set(people.map((u) => u.name))
  const mine = seed.deals.filter((d) => names.has(d.owner))
  const r = scope.range

  const createdDeals = mine.filter((d) => within(d.createdAt, r))
  const wonDeals = mine.filter((d) => d.stage === "Closed won" && !d.archivedAt && within(d.closeDate, r))
  const lostDeals = mine.filter((d) => within(d.archivedAt, r))
  const openDeals = mine.filter((d) => isOpen(d) && within(d.closeDate, r))
  const weighted = openDeals.reduce((s, d) => s + (d.amount * d.probability) / 100, 0)
  const currency = seed.workspace.currency ?? mine[0]?.currency ?? "USD"

  const weeks = weeksOf(r)
  const sumBy = (list: Deal[], dateOf: (d: Deal) => string) =>
    weeks.map((w) => list.filter((d) => weekStart(dateOf(d)) === w).reduce((s, d) => s + d.amount, 0))

  const sum = (list: Deal[]) => list.reduce((s, d) => s + d.amount, 0)
  const age = (list: Deal[]) => (list.length ? Math.round(list.reduce((s, d) => s + daysBetween(d.createdAt, TODAY), 0) / list.length) : 0)

  const byStage: PipelineRow[] = DEAL_STAGES.map((stageName) => {
    const list = mine.filter((d) => d.stage === stageName && (stageName === "Closed won" ? within(d.closeDate, r) && !d.archivedAt : isOpen(d) && within(d.closeDate, r)))
    return { key: stageName, count: list.length, amount: sum(list), avgAge: age(list), deals: list }
  })

  const byRep: PipelineRow[] = people
    .map((u) => {
      const list = openDeals.filter((d) => d.owner === u.name)
      return { key: u.name, count: list.length, amount: sum(list), avgAge: age(list), deals: list }
    })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.amount - a.amount)

  // Stage-to-stage conversion, from the stage history rows: of the deals that entered a stage, how
  // many ever entered the next one.
  const historyByDeal = new Map<string, Set<string>>()
  for (const h of seed.stageHistory) {
    const set = historyByDeal.get(h.dealId) ?? new Set<string>()
    set.add(h.stage)
    historyByDeal.set(h.dealId, set)
  }
  const conversion = DEAL_STAGES.slice(0, -1).map((from, i) => {
    const to = DEAL_STAGES[i + 1]
    let entered = 0
    let advanced = 0
    for (const d of mine) {
      const set = historyByDeal.get(d.id)
      if (!set?.has(from)) continue
      entered++
      if (set.has(to)) advanced++
    }
    return { from, to, entered, advanced, percent: rate(advanced, entered) }
  })

  const reasons = new Map<string, { count: number; amount: number }>()
  for (const d of lostDeals) {
    const key = d.lostReason ?? "Not given"
    const at = reasons.get(key) ?? { count: 0, amount: 0 }
    reasons.set(key, { count: at.count + 1, amount: at.amount + d.amount })
  }

  const tiles: Tile[] = [
    { id: "created", label: "Created", value: createdDeals.length.toLocaleString("en-US"), under: fmtMoney(sum(createdDeals), currency), records: createdDeals.length ? { kind: "deals", title: `${createdDeals.length} deals created`, n: createdDeals.length } : undefined },
    { id: "won", label: "Won", value: wonDeals.length.toLocaleString("en-US"), under: `Reached Closed won · ${fmtMoney(sum(wonDeals), currency)}`, records: wonDeals.length ? { kind: "deals", title: `${wonDeals.length} deals won`, n: wonDeals.length } : undefined },
    { id: "lost", label: "Lost", value: lostDeals.length.toLocaleString("en-US"), under: `Archived · ${fmtMoney(sum(lostDeals), currency)}`, records: lostDeals.length ? { kind: "deals", title: `${lostDeals.length} deals archived`, n: lostDeals.length } : undefined },
    { id: "open", label: "Open pipeline", value: fmtMoney(sum(openDeals), currency), under: `${openDeals.length} deals closing in this range`, records: openDeals.length ? { kind: "deals", title: `${openDeals.length} open deals`, n: openDeals.length } : undefined },
    { id: "weighted", label: "Weighted pipeline", value: fmtMoney(weighted, currency), under: "Amount × stage probability, open deals closing in this range", alwaysPrints: true },
  ]

  const createdSeries = sumBy(createdDeals, (d) => d.createdAt)
  const wonSeries = sumBy(wonDeals, (d) => d.closeDate)
  return {
    tiles,
    trend: {
      weeks,
      labels: labelsOf(weeks, r),
      unit: "money",
      series: [
        { id: "created", label: "Created", points: createdSeries },
        { id: "won", label: "Won", points: wonSeries },
      ],
      summary: `${fmtMoney(sum(createdDeals), currency)} of pipeline was created and ${fmtMoney(sum(wonDeals), currency)} was won across ${weeks.length} weeks.`,
    },
    byStage, byRep, conversion,
    lostReasons: [...reasons.entries()].map(([reason, v]) => ({ reason, ...v })).sort((a, b) => b.count - a.count),
    wonDeals, openDeals, createdDeals, lostDeals, weighted, currency,
  }
}

function fmtMoney(n: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)
}

/* -------------------------------------------------------------------------- the Sequences report */

export interface SequenceRow {
  sequence: Sequence
  sent: number
  delivered: number
  opened: number
  replied: number
  bounced: number
  replyRate: number
  bounceRate: number
}

export interface SequencesReport { tiles: Tile[]; trend: Trend; rows: SequenceRow[] }

export function sequencesReport(seed: Seed, scope: Scope): SequencesReport {
  const people = peopleInScope(seed, scope)
  const names = new Set(people.map((u) => u.name))
  const list = seed.sequences.filter((s) => !s.archivedAt && (scope.team === "all" && scope.person === "all" ? true : names.has(s.owner)))

  const rows: SequenceRow[] = list.map((s) => ({
    sequence: s,
    sent: s.sent, delivered: s.delivered, opened: s.opened, replied: s.replied, bounced: s.bounced,
    replyRate: rate(s.replied, s.delivered), bounceRate: rate(s.bounced, s.sent),
  }))

  const sent = rows.reduce((a, b) => a + b.sent, 0)
  const delivered = rows.reduce((a, b) => a + b.delivered, 0)
  const replied = rows.reduce((a, b) => a + b.replied, 0)

  const guard = seed.bounceGuard
  const over = guard.observedPercent >= BOUNCE_GUARD.pausePercent ? "paused" : guard.observedPercent >= BOUNCE_GUARD.warnPercent ? "over threshold" : null

  // The weekly series is the sequence's own, week by week, so a point on the chart and the total
  // beside it are the same number counted once.
  const weeks = weeksOf(scope.range)
  const weekly = (week: string, of: "sent" | "replied") =>
    rows.reduce((n, row) => n + (row.sequence.series.find((x) => x.week === week)?.[of] ?? 0), 0)
  const sentSeries = weeks.map((w) => weekly(w, "sent"))
  const repliedSeries = weeks.map((w) => weekly(w, "replied"))

  const tiles: Tile[] = [
    { id: "sent", label: "Sent", value: sent.toLocaleString("en-US"), records: sent ? { kind: "sequences", title: `${rows.length} sequences`, n: rows.length } : undefined },
    { id: "delivered", label: "Delivered", value: delivered.toLocaleString("en-US"), under: `${rate(delivered, sent).toFixed(1)}% of sent` },
    { id: "reply-rate", label: "Reply rate", value: `${rate(replied, delivered).toFixed(1)}%`, under: `${replied.toLocaleString("en-US")} replies of ${delivered.toLocaleString("en-US")} delivered` },
    {
      id: "bounce", label: "Bounce rate", value: `${guard.observedPercent.toFixed(1)}%`,
      under: `${guard.volume7d.toLocaleString("en-US")} sent in 7 days · the guard warns at ${BOUNCE_GUARD.warnPercent}% and pauses at ${BOUNCE_GUARD.pausePercent}%${over ? ` · ${over}` : ""}`,
      alwaysPrints: true, tone: over ? "warning" : undefined,
    },
  ]

  return {
    tiles,
    trend: {
      weeks, labels: labelsOf(weeks, scope.range), unit: "count",
      series: [
        { id: "sent", label: "Sent", points: sentSeries },
        { id: "replied", label: "Replied", points: repliedSeries },
      ],
      summary: `${sent.toLocaleString("en-US")} emails were sent and ${replied.toLocaleString("en-US")} were replied to across ${weeks.length} weeks, a ${rate(replied, delivered).toFixed(1)}% reply rate.`,
    },
    rows: rows.sort((a, b) => b.replyRate - a.replyRate),
  }
}

/* --------------------------------------------------------------------- the Campaign results report */

export interface CampaignRow {
  campaign: Campaign
  audienceName: string
  unsubRate: number
  complaintRate: number
  openRate: number
}

export interface CampaignsReport { tiles: Tile[]; trend: Trend; rows: CampaignRow[]; currency: string }

/** Sourced and influenced, with the two conventions printed wherever the numbers are. */
export const SOURCED_WINDOW_DAYS = 90
export const SOURCED_CONVENTION = `Sourced · first touch within ${SOURCED_WINDOW_DAYS} days`
export const INFLUENCED_CONVENTION = "Influenced · any touch within the range"

export function campaignsReport(seed: Seed, scope: Scope): CampaignsReport {
  const rows: CampaignRow[] = seed.campaigns.map((c) => ({
    campaign: c,
    audienceName: seed.audiences.find((a) => a.id === c.audienceId)?.name ?? "—",
    unsubRate: rate(c.unsubscribed, c.delivered),
    complaintRate: rate(c.complaints, c.delivered),
    openRate: rate(c.opened, c.delivered),
  }))

  const total = (f: (c: Campaign) => number) => rows.reduce((s, r) => s + f(r.campaign), 0)
  const sent = total((c) => c.sent)
  const delivered = total((c) => c.delivered)
  const opened = total((c) => c.opened)
  const replied = total((c) => c.replied)
  const unsub = total((c) => c.unsubscribed)
  const sourced = total((c) => c.pipelineAmount)
  const influenced = total((c) => c.pipelineInfluenced)
  const deals = total((c) => c.dealsCreated)
  const currency = seed.workspace.currency ?? "USD"

  const weeks = weeksOf(scope.range)
  const sentSeries = new Array(weeks.length).fill(0)
  const repliedSeries = new Array(weeks.length).fill(0)
  for (const c of seed.campaigns) {
    // A lifecycle campaign keeps a real day-by-day send log; a one-off email campaign has one send date.
    const days = c.sendsByDay.length ? c.sendsByDay : c.sendAt ? [{ day: c.sendAt, sent: c.sent }] : []
    for (const d of days) {
      const w = weeks.indexOf(weekStart(d.day))
      if (w < 0) continue
      sentSeries[w] += d.sent
      repliedSeries[w] += c.sent > 0 ? Math.round((d.sent / c.sent) * c.replied) : 0
    }
  }

  const tiles: Tile[] = [
    { id: "sent", label: "Sent", value: sent.toLocaleString("en-US"), records: rows.length ? { kind: "campaigns", title: `${rows.length} campaigns`, n: rows.length } : undefined },
    { id: "opened", label: "Opened", value: opened.toLocaleString("en-US"), under: `${rate(opened, delivered).toFixed(1)}% of delivered` },
    { id: "replied", label: "Replied", value: replied.toLocaleString("en-US"), under: `${rate(replied, delivered).toFixed(1)}% of delivered` },
    { id: "unsub", label: "Unsubscribed", value: `${unsub.toLocaleString("en-US")} · ${rate(unsub, delivered).toFixed(2)}%`, under: "Count and rate, of delivered", alwaysPrints: true },
    { id: "sourced", label: "Pipeline sourced", value: fmtMoney(sourced, currency), under: `${SOURCED_CONVENTION} · ${deals} deals` },
    { id: "influenced", label: "Pipeline influenced", value: fmtMoney(influenced, currency), under: INFLUENCED_CONVENTION },
  ]

  return {
    tiles,
    trend: {
      weeks, labels: labelsOf(weeks, scope.range), unit: "count",
      series: [
        { id: "sent", label: "Sent", points: sentSeries },
        { id: "replied", label: "Replied", points: repliedSeries },
      ],
      summary: `${sent.toLocaleString("en-US")} campaign emails were sent and ${replied.toLocaleString("en-US")} were replied to across ${weeks.length} weeks.`,
    },
    rows: rows.sort((a, b) => b.campaign.sent - a.campaign.sent),
    currency,
  }
}

/* --------------------------------------------------------------------------- the Forecast report */

/** The categories a submitted number counts. Commit and Closed; the rest are shown, not counted. */
export const COUNTED_CATEGORIES = ["Commit", "Closed"]

export interface ForecastCategoryRow { name: string; count: number; amount: number; definition: string; counted: boolean }

export interface ForecastReport {
  /** "2026-Q4" and "Q4". */
  period: string
  periodLabel: string
  scopeLabel: string
  deadline: string
  /** When the window opens and when the number is due, as Settings sets it. */
  submissionWindow: { opensOn: string; day: string; time: string }
  categories: ForecastCategoryRow[]
  /** The roll-up: what the categories that count add up to, before any adjustment. */
  rollUp: number
  goal: number | null
  goalSource: string
  attainmentPercent: number
  predicted: number | null
  drivers: Deal[]
  last: { period: string; amount: number; actual: number | null; submittedAt: string; split: Record<string, number> } | null
  strip: { user: string; amount: number | null; at: string | null }[]
  deals: Deal[]
  /** For an AE with direct reports: one row per rep, submitted or not. */
  repRows: { user: string; rollUp: number; submitted: number | null; at: string | null; deals: Deal[] }[]
  /** For a CSM: the renewal book, split and totalled separately. */
  split: { label: string; amount: number; count: number; deals: Deal[] }[] | null
  currency: string
}

/** The first and last day of a forecast period, from "2026-Q4". */
export function periodWindow(period: string): { from: string; to: string } {
  const [year, q] = period.split("-Q")
  const quarter = Number(q) || 4
  const startMonth = (quarter - 1) * 3 + 1
  const from = `${year}-${String(startMonth).padStart(2, "0")}-01`
  const nextYear = quarter === 4 ? Number(year) + 1 : Number(year)
  const nextMonth = quarter === 4 ? 1 : startMonth + 3
  return { from, to: addDays(`${nextYear}-${String(nextMonth).padStart(2, "0")}-01`, -1) }
}

/**
 * The deals this seat forecasts on, at its own position in the hierarchy and inside the period.
 * A forecast is for one period, so a deal closing outside it is not in the number, whatever its
 * category says.
 */
function forecastDeals(seed: Seed, who: string[], isCs: boolean, window: { from: string; to: string }): Deal[] {
  const names = new Set(who)
  return seed.deals.filter((d) => {
    if (!names.has(d.owner)) return false
    if (d.archivedAt) return false
    if (d.closeDate < window.from || d.closeDate > window.to) return false
    if (isCs) return d.dealType === "Renewal" || d.dealType === "Expansion"
    return true
  })
}

export function forecastReport(
  seed: Seed,
  opts: { user: string; role: string; hasReports: boolean; reports: string[]; team: string | null; drillTo: string | null },
): ForecastReport {
  const isCs = opts.role === "cs"
  const isLeader = opts.hasReports && opts.reports.length > 0
  const teamMembers = opts.team ? seed.users.filter((u) => u.team === opts.team).map((u) => u.name) : []

  const who = opts.drillTo
    ? [opts.drillTo]
    // The admin carries no book of their own and reads the workspace's, which is the number the
    // leadership meeting asks them for.
    : opts.role === "admin"
      ? seed.users.map((u) => u.name)
      : isLeader
        ? [opts.user, ...opts.reports, ...teamMembers.filter((n) => n !== opts.user)]
        : [opts.user]

  // The period is the one the goals name — Settings sets a goal per period, and that is the period
  // being forecast. Failing a goal, the quarter today sits in.
  const period = seed.goals[0]?.period ?? quarterName(TODAY)
  const periodLabel = period.split("-")[1] ?? period
  const window = periodWindow(period)

  const deals = forecastDeals(seed, who, isCs, window)
  const currency = seed.workspace.currency ?? deals[0]?.currency ?? "USD"

  const categories: ForecastCategoryRow[] = FORECAST_CATEGORIES.map((name) => {
    const list = deals.filter((d) => d.forecast === name)
    return {
      name,
      count: list.length,
      amount: list.reduce((s, d) => s + d.amount, 0),
      definition: seed.settings.pipeline.forecastDefinitions.find((f) => f.name === name)?.definition ?? "",
      counted: COUNTED_CATEGORIES.includes(name),
    }
  })
  const rollUp = categories.filter((c) => c.counted).reduce((s, c) => s + c.amount, 0)

  const personGoal = seed.goals.find((g) => g.period === period && g.user === (opts.drillTo ?? opts.user))
  const teamGoal = opts.team ? seed.goals.find((g) => g.period === period && g.team === opts.team) : undefined
  const chosen = opts.drillTo ? personGoal : isLeader ? (teamGoal ?? personGoal) : personGoal
  const goal = chosen?.amount ?? null
  const goalSource = chosen?.team ? `${chosen.team}, this period` : chosen?.user ? `${chosen.user}, this period` : "not set"

  const prediction = seed.forecastPredictions.find((p) => p.user === (opts.drillTo ?? opts.user) && p.period === period)
  const drivers = (prediction?.drivers ?? []).map((id) => seed.deals.find((d) => d.id === id)).filter((d): d is Deal => Boolean(d))

  const mySubs = seed.forecastSubmissions
    .filter((s) => s.user === (opts.drillTo ?? opts.user))
    .sort((a, b) => (a.period < b.period ? 1 : -1))
  const last = mySubs[0]
    ? { period: mySubs[0].period, amount: mySubs[0].amount, actual: mySubs[0].actual, submittedAt: mySubs[0].submittedAt, split: mySubs[0].split }
    : null

  const stripPeople = isLeader || opts.role === "admin" ? (teamMembers.length ? teamMembers : who) : who
  const strip = stripPeople.map((name) => {
    const sub = seed.forecastSubmissions.find((s) => s.user === name && s.period === period)
    return { user: name, amount: sub?.amount ?? null, at: sub?.submittedAt ?? null }
  })

  const repRows = isLeader && !opts.drillTo
    ? [opts.user, ...opts.reports].map((name) => {
        const theirs = forecastDeals(seed, [name], isCs, window)
        const sub = seed.forecastSubmissions.find((s) => s.user === name && s.period === period)
        return {
          user: name,
          rollUp: theirs.filter((d) => COUNTED_CATEGORIES.includes(d.forecast)).reduce((s, d) => s + d.amount, 0),
          submitted: sub?.amount ?? null,
          at: sub?.submittedAt ?? null,
          deals: theirs,
        }
      })
    : []

  const split = isCs
    ? [
        { label: "Renewal base", deals: deals.filter((d) => d.dealType === "Renewal") },
        { label: "Expansion upside", deals: deals.filter((d) => d.dealType === "Expansion") },
      ].map((g) => ({ label: g.label, count: g.deals.length, amount: g.deals.reduce((s, d) => s + d.amount, 0), deals: g.deals }))
    : null

  const scopeLabel = opts.drillTo
    ? `Scope: ${opts.drillTo}`
    : isCs
      ? "Scope: your renewal book"
      : isLeader && opts.team
        ? `Scope: ${opts.team} (${Math.max(teamMembers.length, opts.reports.length + 1)} reps)`
        : "Scope: your deals"

  const submissionWindow = seed.settings.pipeline.submissionWindow
  return {
    period, periodLabel, scopeLabel, submissionWindow,
    deadline: `submit by ${submissionWindow.day} ${submissionWindow.time}`,
    categories, rollUp, goal, goalSource,
    attainmentPercent: goal ? (rollUp / goal) * 100 : 0,
    predicted: prediction?.amount ?? null,
    drivers,
    last, strip, deals, repRows, split, currency,
  }
}

/** On Forecast the records sort by category first and then by risk, never by amount. */
const CATEGORY_ORDER = [...FORECAST_CATEGORIES].reverse()
export function sortByCategoryThenRisk(deals: Deal[]): Deal[] {
  const risk = (d: Deal) => {
    let n = 0
    if (!d.nextStep) n += 2
    if (d.closeDate < TODAY) n += 2
    if (daysBetween(d.lastActivity, TODAY) >= 14) n += 1
    if (!d.seniorSponsor) n += 1
    return n
  }
  return [...deals].sort((a, b) => {
    const c = CATEGORY_ORDER.indexOf(a.forecast) - CATEGORY_ORDER.indexOf(b.forecast)
    return c !== 0 ? c : risk(b) - risk(a)
  })
}

export function riskWords(d: Deal): string {
  const out: string[] = []
  if (!d.nextStep) out.push("no next step")
  if (d.closeDate < TODAY) out.push("close date passed")
  if (daysBetween(d.lastActivity, TODAY) >= 14) out.push(`quiet ${daysBetween(d.lastActivity, TODAY)} days`)
  if (!d.seniorSponsor) out.push("no senior sponsor")
  return out.length ? out.join(" · ") : "nothing flagged"
}

/* ---------------------------------------------------------------------------- the records drawer */

export interface RecordRow { id: string; cells: string[]; href?: string }

/** The calls a person or a team logged in the range, for the drawer's call rows. */
export function callsInScope(seed: Seed, scope: Scope): Call[] {
  const names = new Set(peopleInScope(seed, scope).map((u) => u.name))
  return seed.calls.filter((c) => names.has(c.loggedBy) && within(c.startedAt, scope.range))
}
