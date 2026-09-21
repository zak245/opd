// `P-reports` — five fixed reports, not a report builder.
//
// The overview is the content. Shneiderman's "overview first, zoom and filter, then details on
// demand" is a disclosure sequence for data, and collapsing the overview to simplify removes the step
// that makes drill-down possible (00-core-model §4, §8.2). So the headline numbers are always on
// screen: what is disclosed is the record-level detail behind them, never the numbers themselves.
//
// One date range and one team filter apply to all five reports. Report tabs are page navigation, not
// doors — each has a URL and each is reachable from the overview strip — and levels are counted
// inside a report. What goes where is asked of the usage model for this seat at this business, never
// hard-coded: an item whose weekly number is zero is not part of this seat's job here and is removed,
// not greyed.
import { useEffect, useMemo, useState } from "react"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { href, navigate, useRoute } from "@/app/router"
import { businessById } from "../../data/businesses"
import { seedFor, TODAY, type Deal } from "../../data/seed"
import { Panel } from "../../ui/Panel"
import { Actions } from "../../ui/Actions"
import { Locked } from "../../ui/Locked"
import { gate } from "../../ui/gate"
import { useDisclosure } from "../../ui/useDisclosure"
import { toast } from "../../templates/TablePage"
import type { Session } from "../../session"
import { Chart } from "./Chart"
import { BreakdownTable, InlineDoor, InlineGate, TileRow, type Col } from "./pieces"
import { RecordsPanel, type RecordsRequest } from "./RecordsPanel"
import { ForecastPanel, ForecastTab, type Submission } from "./Forecast"
import { coverageFor } from "./coverage"
import {
  RANGE_PRESETS, activityReport, campaignsReport, forecastReport, peopleInScope, pipelineReport,
  previousOf, rangeFor, scopeChip, sequencesReport, sortByCategoryThenRisk, weeksOf,
  type ActivityRow, type CampaignRow, type PipelineRow, type RangeKey, type Scope, type SequenceRow, type Tile,
} from "./compute"
import { count as fmtCount, day, money, weekStart } from "./format"

/** The freshness line, per seed. A stale number acted on is a wrong decision. */
const DATA_AS_OF = "Data as of 13 Sep 2026, 08:00 · refreshes hourly"

type ReportKey = "activity" | "pipeline" | "sequences" | "campaigns" | "forecast"

const TABS: { key: ReportKey; label: string; item: string; key1to5: string }[] = [
  { key: "activity", label: "Activity", item: "rep.activity", key1to5: "1" },
  { key: "pipeline", label: "Pipeline", item: "rep.pipeline", key1to5: "2" },
  { key: "sequences", label: "Sequences", item: "rep.sequences", key1to5: "3" },
  { key: "campaigns", label: "Campaign results", item: "rep.campaigns", key1to5: "4" },
  { key: "forecast", label: "Forecast", item: "fc.tab", key1to5: "5" },
]

/** The submission window is Wednesday to Friday; outside it a seller comes here for the pipeline. */
function inSubmissionWindow(): boolean {
  const dow = new Date(TODAY + "T00:00:00Z").getUTCDay()
  return dow >= 3 && dow <= 5
}

interface View {
  report: ReportKey | null
  range: RangeKey
  from: string
  to: string
  team: string
  person: string
  compare: boolean
  breakdown: "stage" | "rep"
  chartView: "chart" | "table"
}

const DEFAULT_VIEW: Omit<View, "report"> = {
  range: "last-30", from: "", to: "", team: "all", person: "all",
  compare: false, breakdown: "stage", chartView: "chart",
}

function load(user: string): Partial<View> {
  try { return JSON.parse(localStorage.getItem(`ollopa.reports.view.${user}`) ?? "{}") as Partial<View> } catch { return {} }
}
function store(user: string, v: View) {
  try { localStorage.setItem(`ollopa.reports.view.${user}`, JSON.stringify(v)) } catch { /* private mode: this visit only */ }
}

export function ReportsPage({ session, entry }: { session: Session; entry?: ReportKey }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const d = useDisclosure("reports")
  const route = useRoute()
  const used = (id: string) => d.weekly(id) > 0
  const one = (id: string) => d.level(id) === 1

  const admin = b.roles.find((r) => r.role === "admin")
  const adminName = admin?.user ?? "your admin"
  const isAdmin = session.role === "admin"
  const myReports = b.roles.find((r) => r.user === session.user)?.reports ?? []
  const myTeam = seed.users.find((u) => u.name === session.user)?.team ?? null
  const leader = session.hasReports && myReports.length > 0

  /* --------------------------------------------------------------------- what this seat may open */

  const tabs = TABS.filter((t) => {
    if (!used(t.item)) return false
    if (t.key === "campaigns" && seed.campaigns.length === 0) return false
    if (t.key === "sequences" && seed.sequences.length === 0) return false
    return true
  })

  // Starter includes the Activity report only. The Forecast tab is never locked as a tab, because a
  // submitted forecast is a commitment and decision-critical items are on every plan.
  const all = gate("reports.all")
  const csv = gate("reports.csv-export")
  const weekly = gate("reports.scheduled-email")
  const lockedTab = (key: ReportKey) => all.locked && key !== "activity" && key !== "forecast"

  const defaultReport: ReportKey = useMemo(() => {
    const ranked = [...tabs].sort((x, y) => d.weekly(y.item) - d.weekly(x.item))
    const top = ranked[0]?.key ?? "activity"
    if (top === "forecast" && !leader && !inSubmissionWindow()) return ranked[1]?.key ?? top
    return top
  }, [tabs, d, leader])

  /* ----------------------------------------------------------------- the view: URL, then storage */

  const [view, setView] = useState<View>(() => ({ ...DEFAULT_VIEW, ...load(session.user), report: entry ?? null }))

  // A copied link reproduces the view, so the URL wins wherever it says something; what it does not
  // say comes from what this person last left here.
  const q = route.query
  const urlReport = q.get("report") as ReportKey | null
  const report: ReportKey = tabs.some((t) => t.key === urlReport)
    ? urlReport!
    : view.report && tabs.some((t) => t.key === view.report) ? view.report : defaultReport
  const rangeKey = (q.get("range") as RangeKey | null) ?? view.range
  const from = q.get("from") ?? view.from
  const to = q.get("to") ?? view.to
  // A leader's scope is her own team — it is the whole reason she is on this page — and a scoped AE
  // is fixed to theirs, so neither select starts at "everyone".
  const storedTeam = q.get("team") ?? view.team
  const scopedToOwnTeam = session.role === "ae" && myTeam !== null && myTeam !== "—"
  const team = storedTeam === "all" && scopedToOwnTeam ? myTeam! : storedTeam
  const person = q.get("person") ?? view.person
  const compare = q.get("compare") === "1" || (q.get("compare") === null && view.compare)

  /** One writer for the whole view: state, this person's memory, and the URL, in that order. */
  const update = (patch: Partial<View>) => {
    const next: View = { ...view, range: rangeKey, from, to, team, person, compare, ...patch, report: patch.report ?? report }
    setView(next)
    store(session.user, next)
    const p = new URLSearchParams()
    p.set("report", next.report!)
    p.set("range", next.range)
    if (next.range === "custom") { p.set("from", next.from); p.set("to", next.to) }
    if (next.team !== "all") p.set("team", next.team)
    if (next.person !== "all") p.set("person", next.person)
    if (next.compare) p.set("compare", "1")
    navigate(`/ollopa/reports?${p.toString()}`)
  }

  const setReport = (key: ReportKey) => update({ report: key })

  const range = rangeFor(rangeKey, from && to ? { from, to } : undefined)
  const scope: Scope = { range, team, person }
  const previous = previousOf(range)

  /* --------------------------------------------------------------------------- the five reports */

  const activity = useMemo(() => activityReport(seed, scope, { leader }), [seed, scope.range.from, scope.range.to, team, person, leader]) // eslint-disable-line react-hooks/exhaustive-deps
  const pipeline = useMemo(() => pipelineReport(seed, scope), [seed, scope.range.from, scope.range.to, team, person]) // eslint-disable-line react-hooks/exhaustive-deps
  const sequences = useMemo(() => sequencesReport(seed, scope), [seed, scope.range.from, scope.range.to, team, person]) // eslint-disable-line react-hooks/exhaustive-deps
  const campaigns = useMemo(() => campaignsReport(seed, scope), [seed, scope.range.from, scope.range.to, team, person]) // eslint-disable-line react-hooks/exhaustive-deps

  const [drillTo, setDrillTo] = useState<string | null>(null)
  const forecast = useMemo(
    () => forecastReport(seed, { user: session.user, role: session.role, hasReports: session.hasReports, reports: myReports, team: myTeam, drillTo }),
    [seed, session.user, session.role, session.hasReports, myReports, myTeam, drillTo],
  )
  const coverage = useMemo(() => coverageFor(seed, { from: range.from, to: range.to }), [seed, range.from, range.to])

  const comparePrev = useMemo(() => {
    if (!compare) return null
    const prevScope: Scope = { ...scope, range: previous }
    switch (report) {
      case "activity": return activityReport(seed, prevScope, { leader }).trend
      case "pipeline": return pipelineReport(seed, prevScope).trend
      case "sequences": return sequencesReport(seed, prevScope).trend
      case "campaigns": return campaignsReport(seed, prevScope).trend
      default: return null
    }
  }, [compare, report, seed, previous.from, previous.to, team, person, leader]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------------------------------------------------------------------------- the panels */

  const [records, setRecords] = useState<RecordsRequest | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [forecastOpen, setForecastOpen] = useState(false)
  const [mine, setMine] = useState<Submission | null>(null)
  const [stepsSignal, setStepsSignal] = useState<{ n: number; open: boolean } | null>(null)

  /** Only one panel at a time: opening one closes the other two. */
  const openRecords = (r: RecordsRequest) => { setExportOpen(false); setForecastOpen(false); setRecords(r) }
  const openForecast = () => { setRecords(null); setExportOpen(false); setForecastOpen(true) }
  const openExport = () => { setRecords(null); setForecastOpen(false); setExportOpen(true) }

  const weeklyOf = (dates: string[]) =>
    weeksOf(range).map((w) => ({ week: w, n: dates.filter((x) => weekStart(x) === w).length }))

  const dealRows = (deals: Deal[], withScore: boolean) => ({
    headers: [
      { header: "Deal" }, { header: "Company" }, { header: "Amount", align: "right" as const },
      { header: "Owner" }, { header: "Close date" }, ...(withScore ? [{ header: "Score at first contact", align: "right" as const }] : []),
    ],
    rows: deals.slice(0, 200).map((x) => ({
      id: x.id,
      route: `/ollopa/deals/${x.id}`,
      values: [
        x.name, x.company, money(x.amount, x.currency), x.owner, day(x.closeDate),
        ...(withScore ? [`${x.scoreAtFirstContact.score} · ${x.scoreAtFirstContact.modelVersion}, ${day(x.scoreAtFirstContact.stampedOn)}`] : []),
      ] as (string | number)[],
    })),
  })

  const openDealRecords = (title: string, deals: Deal[], dates: string[], subtitle?: string) => {
    const withScore = used("pipe.score-first") && (session.role === "marketer" || session.role === "admin")
    const { headers, rows } = dealRows(deals, withScore)
    openRecords({ title, subtitle, headers, rows, weekly: weeklyOf(dates), openLabel: "Open deal", exportLocked: csv.locked, exportPlan: csv.plan })
  }

  const openCallRecords = (title: string, who?: string) => {
    const calls = seed.calls.filter((c) => {
      if (who && c.loggedBy !== who) return false
      const on = c.startedAt.slice(0, 10)
      return on >= range.from && on <= range.to && peopleInScope(seed, scope).some((u) => u.name === c.loggedBy)
    })
    openRecords({
      title,
      subtitle: "Calls, with the purpose, the outcome and whether a coaching note is on it.",
      headers: [{ header: "Contact" }, { header: "Company" }, { header: "Purpose" }, { header: "Outcome" }, { header: "Length", align: "right" }, { header: "Coaching note" }],
      rows: calls.map((c) => ({
        id: c.id,
        route: `/ollopa/people/${c.contactId}`,
        values: [c.contact, c.company, c.purpose, c.disposition, `${Math.round(c.durationSec / 60)} min`, c.coachingNote ? "yes" : "no"],
      })),
      weekly: weeklyOf(calls.map((c) => c.startedAt.slice(0, 10))),
      openLabel: "Open the call",
      exportLocked: csv.locked, exportPlan: csv.plan,
    })
  }

  const openPersonRecords = (title: string, kind: "email" | "meeting") => {
    const names = new Set(peopleInScope(seed, scope).map((u) => u.name))
    const events = seed.activityEvents.filter((e) => e.kind === kind && names.has(e.user) && e.date >= range.from && e.date <= range.to)
    openRecords({
      title,
      headers: [{ header: "Person" }, { header: "Company" }, { header: "Rep" }, { header: "Date" }],
      rows: events.slice(0, 200).map((e) => {
        const c = seed.contacts.find((x) => x.id === e.contactId)
        return { id: e.id, route: c ? `/ollopa/people/${c.id}` : undefined, values: [c?.name ?? "—", e.company, e.user, day(e.date)] }
      }),
      weekly: weeklyOf(events.map((e) => e.date)),
      openLabel: "Open contact",
      exportLocked: csv.locked, exportPlan: csv.plan,
    })
  }

  /* ------------------------------------------------------------------------------- accelerators */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return
      const n = Number(e.key)
      if (n >= 1 && n <= 5) {
        const tab = TABS[n - 1]
        if (tab && tabs.some((x) => x.key === tab.key) && !lockedTab(tab.key)) setReport(tab.key)
        return
      }
      const k = e.key.toLowerCase()
      if (k === "e") { openExport(); return }
      if (k === "p") { window.print(); return }
      if (k === "d") { (document.querySelector("[data-reports-range]") as HTMLButtonElement | null)?.click(); return }
      if (k === "t") { (document.querySelector("[data-reports-team]") as HTMLButtonElement | null)?.click(); return }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  /* -------------------------------------------------------------------------------- the filters */

  const teamsExist = seed.teams.length > 0 && used("ctl.team")
  const scopedAe = session.role === "ae" && !leader && teamsExist
  const teamMenu = teamsExist && !scopedAe
  const teamOptions = leader && myTeam ? seed.teams.filter((t) => t.name === myTeam) : seed.teams
  const peopleOptions = seed.users.filter((u) => (team === "all" ? true : u.team === team))
  /**
   * Person depends on team, so it lives inside the team menu — unless this seat uses it every week,
   * or there is no team menu for it to live in. A leader looks at one rep most weeks, which is why
   * hers sits on the bar beside the team select.
   */
  const personUsed = used("ctl.person")
  const personStandalone = personUsed && (one("ctl.person") || !teamMenu)

  const chip = scopeChip(scope)

  /** The reports this seat reads most weeks, plus the one open now, in the tabs' own order. */
  const strip = tabs.filter((t) => one(t.item) || t.key === report)

  const tilesFor = (key: ReportKey): Tile[] =>
    key === "activity" ? activity.tiles
      : key === "pipeline" ? pipeline.tiles
        : key === "sequences" ? sequences.tiles
          : key === "campaigns" ? campaigns.tiles
            : forecast.categories.filter((c) => c.counted || c.name === "Best case").map((c) => ({ id: c.name, label: c.name, value: money(c.amount, forecast.currency), under: `${c.count} deals` }))

  /* ------------------------------------------------------------------------------------ render */

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4 px-6 py-5">

        {/* The control bar. The fee statement sits on it beside Export, not inside the menu that
            confirms the decision: a charge disclosed only in the control that confirms it is the
            FTC's named mechanism, and a fee is decision-critical whether or not you have decided. */}
        <div className="space-y-3">
          <div role="tablist" aria-label="Reports" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {tabs.map((t) => {
              const locked = lockedTab(t.key)
              const button = (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={report === t.key}
                  aria-keyshortcuts={t.key1to5}
                  onClick={() => setReport(t.key)}
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    report === t.key ? "bg-foreground text-background" : "hover:bg-muted",
                  )}
                >
                  {t.label}
                </button>
              )
              return locked ? (
                <Locked key={t.key} feature={`The ${t.label} report`} plan={all.plan} pricePerMonth={all.pricePerMonth} what={all.what}>
                  {button}
                </Locked>
              ) : button
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Range, with compare and the custom range inside it: compare depends on the range. */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8" data-reports-range aria-keyshortcuts="d">
                  Date range: {range.key === "custom" ? `${day(range.from)} – ${day(range.to)}` : range.label}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72">
                <ul className="grid">
                  {RANGE_PRESETS.map((p) => (
                    <li key={p.key}>
                      <button
                        type="button"
                        onClick={() => { update({ range: p.key }); }}
                        className={cn("w-full rounded px-2 py-1 text-left text-sm hover:bg-muted", rangeKey === p.key && "font-medium")}
                      >
                        {p.label}{rangeKey === p.key && <span aria-hidden="true"> ✓</span>}
                      </button>
                    </li>
                  ))}
                </ul>
                {used("ctl.custom-range") && (
                  <div className="mt-2 border-t pt-2">
                    <div className="text-xs text-muted-foreground">Custom range</div>
                    <div className="mt-1 flex items-center gap-2">
                      <Input type="date" aria-label="From" className="h-8" value={from || range.from} onChange={(e) => update({ range: "custom", from: e.target.value, to: to || range.to })} />
                      <Input type="date" aria-label="To" className="h-8" value={to || range.to} onChange={(e) => update({ range: "custom", from: from || range.from, to: e.target.value })} />
                    </div>
                  </div>
                )}
                {!one("ctl.compare") && (
                  <div className="mt-2 flex items-center gap-2 border-t pt-2">
                    <Checkbox id="compare-in-menu" checked={compare} onCheckedChange={(v) => update({ compare: Boolean(v) })} />
                    <Label htmlFor="compare-in-menu" className="text-sm">Compare with the previous period</Label>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* Team, with that team's people beneath it: person depends on team. */}
            {teamMenu && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8" data-reports-team aria-keyshortcuts="t">
                    Team: {team === "all" ? "everyone" : team}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64">
                  <ul className="grid">
                    {!leader && (
                      <li><button type="button" className="w-full rounded px-2 py-1 text-left text-sm hover:bg-muted" onClick={() => update({ team: "all", person: "all" })}>Everyone</button></li>
                    )}
                    {teamOptions.map((t) => (
                      <li key={t.id}>
                        <button type="button" className={cn("w-full rounded px-2 py-1 text-left text-sm hover:bg-muted", team === t.name && "font-medium")} onClick={() => update({ team: t.name, person: "all" })}>
                          {t.name} <span className="text-muted-foreground">· {t.members}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {personUsed && !personStandalone && (
                    <div className="mt-2 border-t pt-2">
                      <div className="text-xs text-muted-foreground">Person</div>
                      <ul className="mt-1 max-h-48 overflow-y-auto">
                        <li><button type="button" className="w-full rounded px-2 py-1 text-left text-sm hover:bg-muted" onClick={() => update({ person: "all" })}>Everyone on this team</button></li>
                        {peopleOptions.map((u) => (
                          <li key={u.id}>
                            <button type="button" className={cn("w-full rounded px-2 py-1 text-left text-sm hover:bg-muted", person === u.name && "font-medium")} onClick={() => update({ person: u.name })}>
                              {u.name} <span className="text-muted-foreground">· {u.title}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}

            {/* A scoped AE gets a sentence naming the admin, never a disabled control. */}
            {scopedAe && (
              <span className="text-xs text-muted-foreground">
                {myTeam ?? "Your team"} (your team). {adminName} can widen this.
              </span>
            )}

            {/* Its own control on the bar for a seat that looks at one person most weeks, and for a
                workspace with no teams, where there is no menu for it to live inside. */}
            {personStandalone && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8" data-reports-person>
                    Person: {person === "all" ? (teamMenu ? "everyone on the team" : "everyone") : person}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64">
                  <ul className="max-h-64 overflow-y-auto">
                    <li><button type="button" className="w-full rounded px-2 py-1 text-left text-sm hover:bg-muted" onClick={() => update({ person: "all" })}>{teamMenu ? "Everyone on this team" : "Everyone"}</button></li>
                    {peopleOptions.map((u) => (
                      <li key={u.id}>
                        <button type="button" className={cn("w-full rounded px-2 py-1 text-left text-sm hover:bg-muted", person === u.name && "font-medium")} onClick={() => update({ person: u.name })}>
                          {u.name} <span className="text-muted-foreground">· {u.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            )}

            {one("ctl.compare") && (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={compare} onCheckedChange={(v) => update({ compare: Boolean(v) })} aria-label="Compare with the previous period" />
                Compare with the previous period
              </label>
            )}

            {/* Two comparable acts, neither of which spends or changes anything: both outlined,
                and neither carries a line (DESIGN.md §1 and §3). */}
            <Actions surface="card" items={[
              { kind: "secondary", label: "Export", onClick: openExport, keys: "e" },
              { kind: "secondary", label: "Print", onClick: () => { window.print(); toast("Sent to the printer with every door open and the filters as a caption.") }, keys: "p" },
            ]} />
            <span className="ml-auto text-xs text-muted-foreground">{DATA_AS_OF}</span>
          </div>

          {chip && <p className="text-xs text-muted-foreground">Applied: {chip} · {range.label}</p>}
        </div>

        {/* The overview strip: the tile row of every report this seat reads weekly, plus the one open
            now. The overview is the content, so it is never behind a tab or a Run button — what is
            disclosed is the record-level detail behind the numbers, never the numbers. */}
        {one("rep.overview") && strip.length > 1 && (
          <section className="rounded-lg border" data-print-hide>
            <h2 className="border-b px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Overview</h2>
            <ul>
              {strip.map((t) => {
                const locked = lockedTab(t.key)
                return (
                  <li key={t.key} className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b px-3 py-2 last:border-b-0">
                    <span className="w-36 shrink-0 text-sm font-medium">
                      {t.label}
                      {locked && <span className="ml-1 text-xs font-normal text-muted-foreground">· {all.plan}</span>}
                    </span>
                    {tilesFor(t.key).slice(0, 5).map((tile) => (
                      <span key={tile.id} className="text-xs text-muted-foreground">
                        {tile.label} <span className="font-medium tabular-nums text-foreground">{locked && !tile.alwaysPrints ? "—" : tile.value}</span>
                      </span>
                    ))}
                    <span className="ml-auto">
                      {report === t.key
                        ? <span className="text-xs text-muted-foreground">open</span>
                        : <button type="button" className="text-xs underline" onClick={() => setReport(t.key)}>Open the {t.label} report</button>}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* The report. */}
        {lockedTab(report) ? (
          <LockedReport
            label={tabs.find((t) => t.key === report)?.label ?? ""}
            tiles={tilesFor(report)}
            rows={report === "pipeline" ? pipeline.byStage.length : report === "sequences" ? sequences.rows.length : campaigns.rows.length}
            plan={all.plan}
            price={all.pricePerMonth}
            what={all.what}
          />
        ) : report === "activity" ? (
          <ActivityBody
            activity={activity}
            compare={comparePrev}
            view={view.chartView}
            onView={(v) => update({ chartView: v })}
            leader={leader}
            onEmails={(row) => openPersonRecords(`${fmtCount(row.emails)} emails, ${row.user}, ${range.label.toLowerCase()}`, "email")}
            onCalls={(row) => openCallRecords(`${fmtCount(row.calls)} calls, ${row.user}, ${range.label.toLowerCase()}`, row.user)}
            onTile={(t) => {
              if (t.id === "emails") openPersonRecords(`${t.value} emails${chip ? `, ${chip}` : ""}, ${range.label.toLowerCase()}`, "email")
              else if (t.id === "calls") openCallRecords(`${t.value} calls${chip ? `, ${chip}` : ""}, ${range.label.toLowerCase()}`)
              else if (t.id === "meetings") openPersonRecords(`${t.value} meetings booked${chip ? `, ${chip}` : ""}, ${range.label.toLowerCase()}`, "meeting")
            }}
          />
        ) : report === "pipeline" ? (
          <PipelineBody
            pipeline={pipeline}
            coverage={coverage}
            compare={comparePrev}
            chartView={view.chartView}
            onChartView={(v) => update({ chartView: v })}
            breakdown={one("pipe.breakdown") ? view.breakdown : "stage"}
            showSwitch={one("pipe.breakdown")}
            onBreakdown={(v) => update({ breakdown: v })}
            showCoverage={used("pipe.coverage")}
            onTile={(t) => {
              const map: Record<string, { deals: Deal[]; dates: string[] }> = {
                created: { deals: pipeline.createdDeals, dates: pipeline.createdDeals.map((x) => x.createdAt) },
                won: { deals: pipeline.wonDeals, dates: pipeline.wonDeals.map((x) => x.closeDate) },
                lost: { deals: pipeline.lostDeals, dates: pipeline.lostDeals.map((x) => x.archivedAt!) },
                open: { deals: pipeline.openDeals, dates: pipeline.openDeals.map((x) => x.closeDate) },
              }
              const hit = map[t.id]
              if (hit) openDealRecords(`${t.records?.title ?? t.label}${chip ? `, ${chip}` : ""}, ${range.label.toLowerCase()}`, hit.deals, hit.dates)
            }}
            onRow={(row) => openDealRecords(`${row.count} deals, ${row.key}, ${range.label.toLowerCase()}`, row.deals, row.deals.map((x) => x.closeDate))}
          />
        ) : report === "sequences" ? (
          <SequencesBody
            sequences={sequences}
            seed={seed}
            compare={comparePrev}
            chartView={view.chartView}
            onChartView={(v) => update({ chartView: v })}
            signal={stepsSignal}
            onSignal={setStepsSignal}
          />
        ) : report === "campaigns" ? (
          <CampaignsBody
            campaigns={campaigns}
            seed={seed}
            compare={comparePrev}
            chartView={view.chartView}
            onChartView={(v) => update({ chartView: v })}
            onDeals={(row) => {
              const deals = seed.deals.filter((x) => x.campaign === row.campaign.name).slice(0, row.campaign.dealsCreated)
              openDealRecords(`${row.campaign.dealsCreated} deals, ${row.campaign.name}, ${range.label.toLowerCase()}`, deals, deals.map((x) => x.createdAt))
            }}
          />
        ) : (
          <ForecastTab
            session={session}
            report={forecast}
            drillTo={drillTo}
            onDrill={setDrillTo}
            onSubmitPanel={openForecast}
            mine={mine}
            onRecords={(what) => {
              const deals = what === "drivers" ? forecast.drivers : sortByCategoryThenRisk(forecast.deals)
              openDealRecords(
                what === "drivers" ? `${forecast.drivers.length} deals move the difference` : `${forecast.deals.length} deals, ${forecast.periodLabel}`,
                deals, deals.map((x) => x.closeDate),
                "Sorted by forecast category, then by risk — not by amount.",
              )
            }}
          />
        )}
      </div>

      {/* Three panels, siblings on the page; one is open at a time. */}
      <RecordsPanel request={records} onOpenChange={(o) => { if (!o) setRecords(null) }} />

      <ForecastPanel
        open={forecastOpen}
        onOpenChange={setForecastOpen}
        report={forecast}
        session={session}
        mine={mine}
        onSubmit={setMine}
      />

      {/* The one act this panel exists for is the table as CSV; the rest are the other acts the
          person came for. An export spends nothing and can be repeated, so not one of them carries
          a sentence — the plan lines that remain are the gate's, where a seat cannot act. */}
      <Panel id="export" title="Export" open={exportOpen} onOpenChange={setExportOpen}>
        <div className="grid gap-3">
          {csv.locked
            ? <InlineGate feature={`This table (${rowsInView(report, { activity, pipeline, sequences, campaigns, forecast })} rows) as CSV`} plan={csv.plan} pricePerMonth={csv.pricePerMonth} what={csv.what} seats={b.plan.seats} isAdmin={isAdmin} admin={adminName} />
            : <Actions surface="dialog" layout="stack" items={[{
                kind: "primary",
                label: `This table (${rowsInView(report, { activity, pipeline, sequences, campaigns, forecast })} rows)`,
                onClick: () => toast(`Downloaded ${rowsInView(report, { activity, pipeline, sequences, campaigns, forecast })} rows as CSV, with these filters.`),
              }]} />}
          {csv.locked
            ? <InlineGate feature="The records behind this table as CSV" plan={csv.plan} pricePerMonth={csv.pricePerMonth} what={csv.what} seats={b.plan.seats} isAdmin={isAdmin} admin={adminName} />
            : <Actions surface="dialog" layout="stack" items={[{
                kind: "secondary", label: "Records behind this table",
                onClick: () => toast("Downloaded the records behind this table as CSV."),
              }]} />}
          <Actions surface="dialog" layout="stack" items={[{
            kind: "secondary", label: "Copy link with these filters",
            onClick: () => {
              const p = new URLSearchParams({ report, range: rangeKey, team, person, compare: compare ? "1" : "0" })
              const link = `${location.origin}${location.pathname}#/ollopa/reports?${p.toString()}`
              navigator.clipboard?.writeText(link).catch(() => { /* clipboard blocked: the link is in the toast */ })
              toast(`Copied: ${link}`)
            },
          }]} />
          {weekly.locked
            ? <InlineGate feature="Email me this report every Monday" plan={weekly.plan} pricePerMonth={weekly.pricePerMonth} what={weekly.what} seats={b.plan.seats} isAdmin={isAdmin} admin={adminName} />
            : <Actions surface="dialog" layout="stack" items={[{
                kind: "secondary", label: "Email me this report every Monday",
                onClick: () => toast("Scheduled. This report reaches you every Monday at 08:00 with these filters."),
              }]} />}
        </div>
      </Panel>
    </div>
  )
}

function rowsInView(report: ReportKey, r: {
  activity: ReturnType<typeof activityReport>
  pipeline: ReturnType<typeof pipelineReport>
  sequences: ReturnType<typeof sequencesReport>
  campaigns: ReturnType<typeof campaignsReport>
  forecast: ReturnType<typeof forecastReport>
}): number {
  switch (report) {
    case "activity": return r.activity.rows.length
    case "pipeline": return r.pipeline.byStage.length
    case "sequences": return r.sequences.rows.length
    case "campaigns": return r.campaigns.rows.length
    case "forecast": return r.forecast.deals.length
  }
}

/* --------------------------------------------------------------------------- a report this plan
   does not include. Its shape still shows — the tile labels, the chart frame, the row count — and
   the numbers that are never gated print in full. Nothing is greyed out and nothing has moved. */

function LockedReport({ label, tiles, rows, plan, price, what }: { label: string; tiles: Tile[]; rows: number; plan: "Starter" | "Growth" | "Scale"; price: number; what: string }) {
  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t) => (
          <li key={t.id} className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">{t.label}</div>
            {t.alwaysPrints ? (
              <>
                <div className="mt-0.5 text-xl font-semibold">{t.value}</div>
                {t.under && <p className="mt-0.5 text-xs text-muted-foreground">{t.under}</p>}
              </>
            ) : (
              <div className="mt-2 h-4 w-20 rounded bg-muted" aria-label="Included on the plan below" />
            )}
          </li>
        ))}
      </ul>
      <div className="flex h-40 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        The weekly trend for {label}
      </div>
      <div className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">{rows} rows in the breakdown table</div>
      <div className="flex items-center gap-3">
        <Locked feature={`The ${label} report`} plan={plan} pricePerMonth={price} what={what}>
          <Actions surface="card" items={[{ kind: "primary", label: `Open the ${label} report` }]} />
        </Locked>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------ Activity report */

function ActivityBody({ activity, compare, view, onView, leader, onEmails, onCalls, onTile }: {
  activity: ReturnType<typeof activityReport>
  compare: ReturnType<typeof activityReport>["trend"] | null
  view: "chart" | "table"
  onView: (v: "chart" | "table") => void
  leader: boolean
  onEmails: (row: ActivityRow) => void
  onCalls: (row: ActivityRow) => void
  onTile: (t: Tile) => void
}) {
  const link = (n: number, go: () => void) =>
    n === 0 ? <span className="text-muted-foreground">0</span> : <button type="button" className="underline decoration-dotted underline-offset-4 hover:decoration-solid" onClick={go}>{fmtCount(n)}</button>

  const columns: Col<ActivityRow>[] = [
    { key: "rep", header: "Rep", fixed: true, cell: (r) => r.user, sort: (r) => r.user },
    { key: "emails", header: "Emails", align: "right", cell: (r) => link(r.emails, () => onEmails(r)), sort: (r) => r.emails },
    { key: "calls", header: "Calls", align: "right", cell: (r) => link(r.calls, () => onCalls(r)), sort: (r) => r.calls },
    { key: "meetings", header: "Meetings booked", align: "right", cell: (r) => fmtCount(r.meetings), sort: (r) => r.meetings },
    { key: "tasks", header: "Tasks done", align: "right", cell: (r) => fmtCount(r.tasks), sort: (r) => r.tasks },
    { key: "overdue", header: "Tasks overdue", align: "right", cell: (r) => fmtCount(r.overdue), sort: (r) => r.overdue },
    ...(leader ? [
      { key: "logged", header: "Calls logged", align: "right" as const, cell: (r: ActivityRow) => link(r.callsLogged, () => onCalls(r)), sort: (r: ActivityRow) => r.callsLogged },
      { key: "coached", header: "Calls with a coaching note (30 days)", align: "right" as const, cell: (r: ActivityRow) => fmtCount(r.coached), sort: (r: ActivityRow) => r.coached },
    ] : []),
  ]

  return (
    <div className="space-y-4">
      <TileRow tiles={activity.tiles} onRecords={onTile} />
      <Chart trend={activity.trend} compare={compare} format={(n) => fmtCount(Math.round(n))} view={view} onViewChange={onView} describedById="activity-trend-summary" />
      <BreakdownTable caption="By rep" rows={activity.rows} rowKey={(r) => r.user} columns={columns} storageKey="activity" />
      <Definitions
        lines={[
          ["Emails sent", "One row per email an ollopA mailbox sent, campaigns included."],
          ["Calls made", "One row per dial logged, connected or not."],
          ["Meetings booked", "A contact moved to the stage Meeting booked. ollopA has no booking tool."],
          ["Tasks done", "A task closed in the range, whoever created it."],
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------------------ Pipeline report */

function PipelineBody({ pipeline, coverage, compare, chartView, onChartView, breakdown, showSwitch, onBreakdown, showCoverage, onTile, onRow }: {
  pipeline: ReturnType<typeof pipelineReport>
  coverage: ReturnType<typeof coverageFor>
  compare: ReturnType<typeof pipelineReport>["trend"] | null
  chartView: "chart" | "table"
  onChartView: (v: "chart" | "table") => void
  breakdown: "stage" | "rep"
  showSwitch: boolean
  onBreakdown: (v: "stage" | "rep") => void
  showCoverage: boolean
  onTile: (t: Tile) => void
  onRow: (row: PipelineRow) => void
}) {
  const cur = pipeline.currency
  const rows = breakdown === "stage" ? pipeline.byStage : pipeline.byRep
  const columns: Col<PipelineRow>[] = [
    { key: "key", header: breakdown === "stage" ? "Stage" : "Rep", fixed: true, cell: (r) => r.key, sort: (r) => r.key },
    {
      key: "count", header: "Deals", align: "right", sort: (r) => r.count,
      cell: (r) => r.count === 0
        ? <span className="text-muted-foreground">0</span>
        : <button type="button" className="underline decoration-dotted underline-offset-4 hover:decoration-solid" onClick={() => onRow(r)}>{r.count}</button>,
    },
    { key: "amount", header: "Amount", align: "right", cell: (r) => money(r.amount, cur), sort: (r) => r.amount },
    { key: "age", header: "Average age", align: "right", cell: (r) => `${r.avgAge} days`, sort: (r) => r.avgAge },
  ]

  return (
    <div className="space-y-4">
      <TileRow tiles={pipeline.tiles} onRecords={onTile} />

      {/* Lost, and the reasons it was lost, on one side of the door: the reasons depend on the count. */}
      <InlineDoor id="reports.lost-reasons" label="Lost reasons" count={pipeline.lostReasons.length}>
        {pipeline.lostReasons.length === 0 ? (
          <p className="text-muted-foreground">Nothing was archived in this range.</p>
        ) : (
          <ul className="space-y-1">
            {pipeline.lostReasons.map((l) => (
              <li key={l.reason} className="flex justify-between gap-3">
                <span>{l.reason}</span>
                <span className="tabular-nums text-muted-foreground">{l.count} · {money(l.amount, cur)}</span>
              </li>
            ))}
          </ul>
        )}
      </InlineDoor>

      <Chart trend={pipeline.trend} compare={compare} format={(n) => money(Math.round(n), cur)} view={chartView} onViewChange={onChartView} describedById="pipeline-trend-summary" />

      <BreakdownTable
        caption={breakdown === "stage" ? "By stage" : "By rep"}
        rows={rows}
        rowKey={(r) => r.key}
        columns={columns}
        storageKey={`pipeline-${breakdown}`}
        aside={showSwitch ? (
          <div role="group" aria-label="Break the pipeline down by stage or by rep" className="flex gap-1">
            {(["stage", "rep"] as const).map((v) => (
              <button key={v} type="button" aria-pressed={breakdown === v} onClick={() => onBreakdown(v)}
                className={cn("rounded-md px-2 py-0.5 text-xs", breakdown === v ? "bg-foreground text-background" : "hover:bg-muted")}>
                By {v}
              </button>
            ))}
          </div>
        ) : undefined}
      />

      {/* The conversion door sits under the table it depends on, and its last line is the coverage
          figure the Deals board strip prints — computed once, in `coverage.ts`, and read by both. */}
      <InlineDoor id="reports.conversion" label="Stage-to-stage conversion" count={pipeline.conversion.length}>
        <ul className="space-y-1">
          {pipeline.conversion.map((c) => (
            <li key={`${c.from}-${c.to}`} className="flex justify-between gap-3">
              <span>{c.from} → {c.to}</span>
              <span className="tabular-nums text-muted-foreground">{c.advanced} of {c.entered} · {Math.round(c.percent)}%</span>
            </li>
          ))}
        </ul>
        {showCoverage && (
          <p className="mt-2 border-t pt-2 font-medium">
            {coverage.line}
            <span className="block font-normal text-muted-foreground">
              {coverage.won} won and {coverage.lost} archived in this range. Required coverage is one divided by the win rate.
            </span>
          </p>
        )}
      </InlineDoor>

      <Definitions
        lines={[
          ["Won", "The deal reached the stage Closed won. There is no Closed lost stage."],
          ["Lost", "The deal was archived, with a reason. Archived is what lost means here."],
          ["Weighted pipeline", "Amount × stage probability, for open deals closing inside the range."],
          ["Average age", "Days since the deal was created, averaged over the rows in the group."],
        ]}
      />
    </div>
  )
}

/* ----------------------------------------------------------------------------- Sequences report */

function SequencesBody({ sequences, seed, compare, chartView, onChartView, signal, onSignal }: {
  sequences: ReturnType<typeof sequencesReport>
  seed: ReturnType<typeof seedFor>
  compare: ReturnType<typeof sequencesReport>["trend"] | null
  chartView: "chart" | "table"
  onChartView: (v: "chart" | "table") => void
  signal: { n: number; open: boolean } | null
  onSignal: (s: { n: number; open: boolean }) => void
}) {
  const columns: Col<SequenceRow>[] = [
    {
      key: "name", header: "Sequence", fixed: true, sort: (r) => r.sequence.name,
      cell: (r) => <button type="button" className="underline" onClick={() => navigate(`/ollopa/sequences/${r.sequence.id}`)}>{r.sequence.name}</button>,
    },
    { key: "sent", header: "Sent", align: "right", cell: (r) => fmtCount(r.sent), sort: (r) => r.sent },
    { key: "delivered", header: "Delivered", align: "right", cell: (r) => fmtCount(r.delivered), sort: (r) => r.delivered },
    { key: "opened", header: "Opened", align: "right", cell: (r) => fmtCount(r.opened), sort: (r) => r.opened },
    { key: "replied", header: "Replied", align: "right", cell: (r) => fmtCount(r.replied), sort: (r) => r.replied },
    { key: "reply-rate", header: "Reply rate", align: "right", cell: (r) => `${r.replyRate.toFixed(1)}%`, sort: (r) => r.replyRate },
    { key: "bounced", header: "Bounced", align: "right", cell: (r) => fmtCount(r.bounced), sort: (r) => r.bounced },
    { key: "bounce-rate", header: "Bounce rate", align: "right", cell: (r) => `${r.bounceRate.toFixed(1)}%`, sort: (r) => r.bounceRate },
    { key: "status", header: "Status", cell: (r) => r.sequence.status, sort: (r) => r.sequence.status },
  ]

  return (
    <div className="space-y-4">
      <TileRow tiles={sequences.tiles} />
      <Chart trend={sequences.trend} compare={compare} format={(n) => fmtCount(Math.round(n))} view={chartView} onViewChange={onChartView} describedById="sequences-trend-summary" />
      <BreakdownTable
        caption="By sequence"
        rows={sequences.rows}
        rowKey={(r) => r.sequence.id}
        columns={columns}
        storageKey="sequences"
        aside={
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onSignal({ n: (signal?.n ?? 0) + 1, open: !signal?.open })}>
            {signal?.open ? "Collapse all" : "Expand all steps"}
          </Button>
        }
        expandSignal={signal}
        expand={(r) => {
          const steps = seed.sequenceSteps.filter((s) => s.sequenceId === r.sequence.id)
          return [{
            id: `reports.seq-steps.${r.sequence.id}`,
            label: "Steps",
            count: steps.length,
            content: (
              <table className="w-full max-w-xl text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    {["Step", "Kind", "Sent", "Opened", "Replied", "Bounced"].map((h, i) => (
                      <th key={h} scope="col" className={cn("px-2 py-1 font-medium", i > 1 ? "text-right" : "text-left")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {steps.map((s) => (
                    <tr key={s.id} className="border-b last:border-b-0">
                      <td className="px-2 py-1">{s.order}</td>
                      <td className="px-2 py-1">{s.kind}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{fmtCount(s.stats.sent)}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{fmtCount(s.stats.opened)}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{fmtCount(s.stats.replied)}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{fmtCount(s.stats.bounced)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ),
          }]
        }}
      />
      <Definitions
        lines={[
          ["Reply rate", "Replies ÷ delivered, not ÷ sent."],
          ["Bounce rate", "Bounces ÷ sent over seven days. The guard warns at 4% and pauses at 6%."],
          ["Weekly trend", "Each sequence's totals across the weeks of the range."],
        ]}
      />
    </div>
  )
}

/* ---------------------------------------------------------------------- Campaign results report */

function CampaignsBody({ campaigns, seed, compare, chartView, onChartView, onDeals }: {
  campaigns: ReturnType<typeof campaignsReport>
  seed: ReturnType<typeof seedFor>
  compare: ReturnType<typeof campaignsReport>["trend"] | null
  chartView: "chart" | "table"
  onChartView: (v: "chart" | "table") => void
  onDeals: (row: CampaignRow) => void
}) {
  const cur = campaigns.currency
  const columns: Col<CampaignRow>[] = [
    {
      key: "name", header: "Campaign", fixed: true, sort: (r) => r.campaign.name,
      cell: (r) => <button type="button" className="underline" onClick={() => navigate(`/ollopa/campaigns/${r.campaign.id}`)}>{r.campaign.name}</button>,
    },
    { key: "kind", header: "Kind", cell: (r) => r.campaign.kind, sort: (r) => r.campaign.kind },
    { key: "audience", header: "Audience", cell: (r) => r.audienceName, sort: (r) => r.audienceName },
    { key: "sent", header: "Sent", align: "right", cell: (r) => fmtCount(r.campaign.sent), sort: (r) => r.campaign.sent },
    { key: "opened", header: "Opened", align: "right", cell: (r) => fmtCount(r.campaign.opened), sort: (r) => r.campaign.opened },
    { key: "replied", header: "Replied", align: "right", cell: (r) => fmtCount(r.campaign.replied), sort: (r) => r.campaign.replied },
    { key: "unsub", header: "Unsubscribed", align: "right", cell: (r) => `${fmtCount(r.campaign.unsubscribed)} · ${r.unsubRate.toFixed(2)}%`, sort: (r) => r.unsubRate },
    { key: "complaints", header: "Complaints", align: "right", cell: (r) => `${fmtCount(r.campaign.complaints)} · ${r.complaintRate.toFixed(2)}%`, sort: (r) => r.complaintRate },
    {
      key: "deals", header: "Deals", align: "right", sort: (r) => r.campaign.dealsCreated,
      cell: (r) => r.campaign.dealsCreated === 0
        ? <span className="text-muted-foreground">0</span>
        : <button type="button" className="underline decoration-dotted underline-offset-4 hover:decoration-solid" onClick={() => onDeals(r)}>{r.campaign.dealsCreated}</button>,
    },
    { key: "sourced", header: "Sourced", align: "right", cell: (r) => money(r.campaign.pipelineAmount, cur), sort: (r) => r.campaign.pipelineAmount },
    { key: "influenced", header: "Influenced", align: "right", cell: (r) => money(r.campaign.pipelineInfluenced, cur), sort: (r) => r.campaign.pipelineInfluenced },
    { key: "status", header: "Status", cell: (r) => r.campaign.status, sort: (r) => r.campaign.status },
  ]

  return (
    <div className="space-y-4">
      <TileRow tiles={campaigns.tiles} />
      <Chart trend={campaigns.trend} compare={compare} format={(n) => fmtCount(Math.round(n))} view={chartView} onViewChange={onChartView} describedById="campaigns-trend-summary" />
      <BreakdownTable
        caption="By campaign"
        rows={campaigns.rows}
        rowKey={(r) => r.campaign.id}
        columns={columns}
        storageKey="campaigns"
        expand={(r) => {
          const audience = seed.audiences.find((a) => a.id === r.campaign.audienceId)
          const personas = seed.personas.filter((p) => !p.retired)
          return [
            {
              id: `reports.aud.${r.campaign.id}`,
              label: "Audience",
              count: audience?.sources.length ?? 0,
              content: audience ? (
                <dl className="grid max-w-md grid-cols-[10rem_1fr] gap-x-4 gap-y-1 text-xs">
                  <dt className="text-muted-foreground">Audience</dt><dd>{audience.name} · {audience.type}</dd>
                  <dt className="text-muted-foreground">Size</dt><dd className="tabular-nums">{fmtCount(audience.size)}</dd>
                  <dt className="text-muted-foreground">Built from</dt><dd>{audience.sources.join(", ") || "—"}</dd>
                  <dt className="text-muted-foreground">Suppressed</dt>
                  <dd className="tabular-nums">{fmtCount(audience.suppressed.unsubscribed)} unsubscribed · {fmtCount(audience.suppressed.bounced)} bounced</dd>
                </dl>
              ) : <p className="text-xs text-muted-foreground">This campaign has no audience attached.</p>,
            },
            {
              id: `reports.persona.${r.campaign.id}`,
              label: "Persona",
              count: personas.length,
              content: personas.length === 0
                ? <p className="text-xs text-muted-foreground">No personas are defined in Settings › Signals, scoring and personas.</p>
                : (
                  <ul className="max-w-md space-y-0.5 text-xs">
                    {personas.map((p) => (
                      <li key={p.id} className="flex justify-between gap-3">
                        <span>{p.name} <span className="text-muted-foreground">· {p.title}</span></span>
                        <span className="tabular-nums text-muted-foreground">{fmtCount(p.sizeCount)}</span>
                      </li>
                    ))}
                  </ul>
                ),
            },
          ]
        }}
      />
      <Definitions
        lines={[
          ["Unsubscribed", "Count and rate, of delivered. It prints on every plan, like the bounce rate."],
          ["Complaints", "Spam complaints, count and rate of delivered."],
          ["Sourced", "First touch within 90 days of the deal being created."],
          ["Influenced", "Any touch inside the range, whether or not it was the first."],
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------- how these numbers are counted, and its toggles */

function Definitions({ lines }: { lines: [string, string][] }) {
  return (
    <InlineDoor id="reports.definitions" label="How these numbers are counted" count={lines.length}>
      <dl className="grid max-w-2xl grid-cols-[10rem_1fr] gap-x-4 gap-y-1.5 text-xs">
        {lines.map(([term, body]) => (
          <div key={term} className="contents">
            <dt className="text-muted-foreground">{term}</dt>
            <dd>{body}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 border-t pt-2">
        <p className="text-xs text-muted-foreground">What changes them</p>
        <ul className="mt-1 grid gap-1.5 text-xs">
          {[
            ["Include bot opens", "Opens a mail scanner made, rather than a person."],
            ["Show archived sequences", "Sequences someone archived stay out unless you ask for them."],
            ["Exclude internal contacts", "Anyone at your own domain."],
            ["Unweighted pipeline", "Amounts without the stage probability."],
          ].map(([label, why]) => (
            <li key={label} className="flex items-start gap-2">
              <Checkbox id={`count-${label}`} onCheckedChange={(v) => toast(`${label}: ${v ? "on" : "off"}. The numbers above recount.`)} />
              <label htmlFor={`count-${label}`}>{label} <span className="text-muted-foreground">— {why}</span></label>
            </li>
          ))}
        </ul>
      </div>
    </InlineDoor>
  )
}
