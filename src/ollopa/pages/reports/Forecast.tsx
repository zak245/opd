// The Forecast tab, and `X-forecast`.
//
// Forecast is the fifth tab and not a sixth page: three journeys submit a number — the AE, the AE
// with direct reports, and the CSM reading the renewal book — and one node serves all three at the
// seat's own position in the hierarchy. On this page **Forecast** means the number a person
// submitted; the Pipeline report's arithmetic is called Weighted pipeline, because one word may not
// mean two things on one page.
//
// Seven things here are decision-critical and are on every plan, whatever the usage number says: each
// category's definition printed as text under its label (never a tooltip), the predicted number beside
// the submitted one, the deadline, Submit as the one act the tab exists for, and
// last cycle's call beside what actually happened. Only the team roll-up carries a lock, because teams
// are a Growth feature and there is nothing to roll up without them.
import { useEffect, useState } from "react"
import { Actions } from "../../ui/Actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { navigate } from "@/app/router"
import { Panel } from "../../ui/Panel"
import { Locked } from "../../ui/Locked"
import { gate } from "../../ui/gate"
import { toast } from "../../templates/TablePage"
import { TODAY, type Deal } from "../../data/seed"
import type { Session } from "../../session"
import { COUNTED_CATEGORIES, riskWords, sortByCategoryThenRisk, type ForecastReport } from "./compute"
import { day, money } from "./format"

export interface Submission {
  period: string
  amount: number
  split: Record<string, number>
  note: string
  submittedAt: string
}

/* ------------------------------------------------------------------------------------ the tab */

export function ForecastTab({ session, report, drillTo, onDrill, onSubmitPanel, onRecords, mine }: {
  session: Session
  report: ForecastReport
  drillTo: string | null
  onDrill: (user: string | null) => void
  onSubmitPanel: () => void
  onRecords: (what: "drivers" | "all") => void
  /** What this person has submitted in this session, if anything. It never alters the roll-up. */
  mine: Submission | null
}) {
  const cur = report.currency
  const teams = gate("teams")
  const submitted = mine?.amount ?? null
  const difference = submitted !== null && report.predicted !== null ? submitted - report.predicted : null
  const isLeader = session.hasReports
  const showStrip = isLeader || session.role === "admin"

  return (
    <div className="space-y-4">
      {/* 1. The period, the deadline and the scope chip. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-medium">{report.periodLabel}</span>
        <span className="text-muted-foreground">· {report.deadline}</span>
        <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{report.scopeLabel}</span>
        {drillTo && (
          <Actions surface="card" items={[{ kind: "link", label: "Back to the team", href: "#/ollopa/reports?report=forecast", onClick: () => onDrill(null) }]} />
        )}
      </div>

      {/* 2. The five categories, each with its definition printed under its label. */}
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {report.categories.map((c) => (
          <li key={c.name} className={cn("rounded-lg border p-3", c.counted && "border-foreground/30")}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium">{c.name}</span>
              <span className="text-xs tabular-nums text-muted-foreground">{c.count}</span>
            </div>
            <div className="mt-0.5 text-lg font-semibold">{money(c.amount, cur)}</div>
            <p className="mt-1 text-xs text-muted-foreground">{c.definition}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Your number counts {COUNTED_CATEGORIES.join(" and ")}. Best case and Pipeline are shown beside it and not counted; Omitted is left out.
      </p>

      {/* 3. The goal for the period, as the denominator. */}
      <div className="rounded-lg border p-3">
        <div className="text-xs text-muted-foreground">Against the goal for {report.periodLabel}</div>
        {report.goal === null ? (
          <p className="mt-1 text-sm">
            No goal is set for this period. It is set in <a className="underline" href="#/ollopa/settings/pipeline">Settings › Pipeline and data</a>.
          </p>
        ) : (
          <>
            <div className="mt-0.5 text-xl font-semibold">
              {money(report.rollUp, cur)} of {money(report.goal, cur)} · {Math.round(report.attainmentPercent)}%
            </div>
            <div aria-hidden="true" className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-foreground" style={{ width: `${Math.min(100, Math.round(report.attainmentPercent))}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Goal set for {report.goalSource}.</p>
          </>
        )}
      </div>

      {/* 4. The predicted number beside the submitted one. Beside, never instead. */}
      <div className="rounded-lg border p-3">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <div>
            <div className="text-xs text-muted-foreground">You</div>
            <div className="text-xl font-semibold">{submitted === null ? "Not submitted" : money(submitted, cur)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Predicted</div>
            <div className="text-xl font-semibold">{report.predicted === null ? "—" : money(report.predicted, cur)}</div>
          </div>
          {report.drivers.length > 0 && (
            <button
              type="button"
              onClick={() => onRecords("drivers")}
              className="rounded text-sm underline decoration-dotted underline-offset-4 hover:decoration-solid focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {report.drivers.length} deals move the difference
              {difference !== null && <span className="text-muted-foreground"> · {difference >= 0 ? "+" : "−"}{money(Math.abs(difference), cur)}</span>}
            </button>
          )}
        </div>
      </div>

      {/* 5. Last submission, with the date and the delta since. */}
      {report.last && (
        <p className="text-sm">
          <span className="text-muted-foreground">Last submission: </span>
          {money(report.last.amount, cur)} on {day(report.last.submittedAt)}
          {report.last.actual !== null && (
            <span className="text-muted-foreground">
              {" "}· it closed at {money(report.last.actual, cur)} ({report.last.actual >= report.last.amount ? "+" : "−"}{money(Math.abs(report.last.actual - report.last.amount), cur)})
            </span>
          )}
        </p>
      )}

      {/* The team roll-up. The tab is never locked; this one control is, because teams are Growth. */}
      {isLeader && !drillTo && report.repRows.length > 0 && (
        teams.locked ? (
          <Locked feature="The team roll-up" plan={teams.plan} pricePerMonth={teams.pricePerMonth} what="Roll a forecast up from the people who report to you, and drill from the team number into one person's deals.">
            <Actions surface="card" items={[{ kind: "secondary", label: "Open the team roll-up" }]} />
          </Locked>
        ) : (
          <section className="rounded-lg border">
            <h3 className="border-b px-3 py-2 text-sm font-medium">The team roll-up <span className="font-normal tabular-nums text-muted-foreground">({report.repRows.length})</span></h3>
            <table className="w-full text-sm">
              <caption className="sr-only">One row per rep: their roll-up, what they submitted, and when.</caption>
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th scope="col" className="px-3 py-1.5 text-left font-medium">Rep</th>
                  <th scope="col" className="px-3 py-1.5 text-right font-medium">Roll-up</th>
                  <th scope="col" className="px-3 py-1.5 text-right font-medium">Submitted</th>
                  <th scope="col" className="px-3 py-1.5 text-left font-medium">When</th>
                  <th scope="col" className="px-3 py-1.5 text-right font-medium"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody>
                {report.repRows.map((r) => (
                  <tr key={r.user} className="border-b last:border-b-0">
                    <th scope="row" className="px-3 py-1.5 text-left font-normal">{r.user}</th>
                    <td className="px-3 py-1.5 text-right tabular-nums">{money(r.rollUp, cur)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{r.submitted === null ? "not submitted" : money(r.submitted, cur)}</td>
                    <td className="px-3 py-1.5 text-left text-muted-foreground">{r.at ? day(r.at) : `deadline is ${report.submissionWindow.day} ${report.submissionWindow.time}`}</td>
                    <td className="px-3 py-1.5 text-right">
                      <button type="button" className="text-xs underline" onClick={() => onDrill(r.user)}>Their deals</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )
      )}

      {/* The CSM's reading of the same tab: two groups, two totals. */}
      {report.split && (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {report.split.map((g) => (
            <li key={g.label} className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">{g.label}</div>
              <div className="mt-0.5 text-xl font-semibold">{money(g.amount, cur)}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{g.count} deals</p>
            </li>
          ))}
        </ul>
      )}

      {/* 6. The submissions strip for this period. */}
      {showStrip && report.strip.length > 0 && (
        <section className="rounded-lg border p-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Submitted for {report.periodLabel}</h3>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {report.strip.map((s) => (
              <li key={s.user}>
                {s.user} — {s.at ? `${money(s.amount ?? 0, cur)} on ${day(s.at)}` : <span className="text-muted-foreground">not submitted</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 7. The deals, and the button. */}
      <ForecastDeals deals={report.deals} currency={cur} onRecords={() => onRecords("all")} />

      <Actions surface="page" items={[{ kind: "primary", label: "Submit your forecast", onClick: onSubmitPanel }]} />
    </div>
  )
}

function ForecastDeals({ deals, currency, onRecords }: { deals: Deal[]; currency: string; onRecords: () => void }) {
  const sorted = sortByCategoryThenRisk(deals).slice(0, 12)
  return (
    <section className="rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <h3 className="text-sm font-medium">Every deal in the period <span className="font-normal tabular-nums text-muted-foreground">({deals.length})</span></h3>
        <button type="button" className="text-xs underline" onClick={onRecords} data-print-hide>All {deals.length} records</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <caption className="sr-only">Sorted by forecast category and then by risk, not by amount.</caption>
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              {["Company", "Amount", "Close date", "Category", "Next step", "Owner", "Risk"].map((h, i) => (
                <th key={h} scope="col" className={cn("whitespace-nowrap px-3 py-1.5 font-medium", i === 1 ? "text-right" : "text-left", i === 0 && "sticky left-0 z-10 bg-background")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.id} className="border-b last:border-b-0">
                <th scope="row" className="sticky left-0 z-10 whitespace-nowrap bg-background px-3 py-1.5 text-left font-normal">
                  <button type="button" className="underline" onClick={() => navigate(`/ollopa/deals/${d.id}`)}>{d.company}</button>
                </th>
                <td className="whitespace-nowrap px-3 py-1.5 text-right tabular-nums">{money(d.amount, d.currency || currency)}</td>
                <td className="whitespace-nowrap px-3 py-1.5">{day(d.closeDate)}</td>
                <td className="whitespace-nowrap px-3 py-1.5">{d.forecast}</td>
                <td className="whitespace-nowrap px-3 py-1.5">{d.nextStep ?? <span className="text-muted-foreground">none</span>}</td>
                <td className="whitespace-nowrap px-3 py-1.5">{d.owner}</td>
                <td className="whitespace-nowrap px-3 py-1.5 text-muted-foreground">{riskWords(d)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {deals.length > sorted.length && (
        <p className="border-t px-3 py-1.5 text-xs text-muted-foreground">Showing {sorted.length} of {deals.length}, by category then risk.</p>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------------------ `X-forecast` */

export function ForecastPanel({ open, onOpenChange, report, session, mine, onSubmit }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  report: ForecastReport
  session: Session
  mine: Submission | null
  onSubmit: (s: Submission) => void
}) {
  const cur = report.currency
  const [adjust, setAdjust] = useState<Record<string, number>>({})
  const [note, setNote] = useState("")

  // Opening the panel reads the roll-up as it stands now; the adjustment is the person's, and it
  // never alters the roll-up underneath it.
  useEffect(() => {
    if (!open) return
    setAdjust(Object.fromEntries(report.categories.map((c) => [c.name, mine?.split[c.name] ?? c.amount])))
    setNote(mine?.note ?? "")
  }, [open, report, mine])

  // "Last submitted" is what this person last put their name to: this period's submission if there
  // is one, otherwise the most recent kept one — and the column says which period it came from, so
  // two different periods are never silently compared.
  const lastSplit: Record<string, number> | null = mine?.split ?? report.last?.split ?? null
  const lastPeriod = mine ? report.periodLabel : report.last?.period.split("-")[1] ?? null
  const total = report.categories.filter((c) => c.counted).reduce((s, c) => s + (adjust[c.name] ?? c.amount), 0)
  const receivers = report.strip.map((s) => s.user).filter((u) => u !== session.user)
  const audience = receivers.length === 0 ? "Your manager and the RevOps admin see it"
    : receivers.length <= 2 ? `${receivers.join(" and ")} see it`
      : `${receivers.slice(0, 2).join(", ")} and ${receivers.length - 2} others see it`

  // Only a submission for this period can have changed since: last quarter's number is a different
  // question, and it is answered by "Last cycle" at the top of the panel.
  const changes: string[] = mine
    ? report.categories
        .filter((c) => typeof mine.split[c.name] === "number" && mine.split[c.name] !== (adjust[c.name] ?? c.amount))
        .map((c) => `${c.name}: ${money(mine.split[c.name], cur)} → ${money(adjust[c.name] ?? c.amount, cur)}, by you`)
    : []

  return (
    <Panel
      id="forecast"
      title="Submit your forecast"
      open={open}
      onOpenChange={onOpenChange}
      footer={
        <Actions surface="dialog" layout="stack" className="w-full" items={[{
          kind: "primary",
          label: `Submit ${money(total, cur)} for ${report.periodLabel}`,
          onClick: () => {
            onSubmit({ period: report.period, amount: total, split: { ...adjust }, note, submittedAt: `${TODAY} 16:00` })
            onOpenChange(false)
            toast(`Submitted ${money(total, cur)} for ${report.periodLabel}. ${audience}.`)
          },
        }]} />
      }
    >
      {/* A forecast with no memory teaches nobody anything, so the panel opens with the last call. */}
      {report.last && (
        <section className="rounded-md border p-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last cycle</h3>
          <p className="mt-1">
            You called {money(report.last.amount, cur)} for {report.last.period.split("-")[1]}.
            {report.last.actual !== null
              ? ` It closed at ${money(report.last.actual, cur)}.`
              : " It has not closed yet."}
          </p>
        </section>
      )}

      {report.repRows.length > 0 && (
        <section className="mt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">The team roll-up</h3>
          <ul className="mt-1 space-y-0.5 text-xs">
            {report.repRows.map((r) => (
              <li key={r.user} className="flex justify-between gap-2">
                <span>{r.user}</span>
                <span className="tabular-nums text-muted-foreground">{money(r.rollUp, cur)}{r.submitted === null ? " · not submitted" : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The roll-up, the adjustment and the last submitted value in one row, read together. */}
      <section className="mt-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">By category</h3>
        <table className="mt-2 w-full text-xs">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th scope="col" className="py-1 text-left font-medium">Category</th>
              <th scope="col" className="py-1 text-right font-medium">Roll-up</th>
              <th scope="col" className="py-1 text-right font-medium">Your number</th>
              <th scope="col" className="py-1 pl-2 text-right font-medium">Last submitted{lastPeriod ? ` (${lastPeriod})` : ""}</th>
            </tr>
          </thead>
          <tbody>
            {report.categories.map((c) => (
              <tr key={c.name} className="border-b last:border-b-0 align-top">
                <th scope="row" className="py-2 text-left font-normal">
                  <span className="block">{c.name}</span>
                  {!c.counted && <span className="block text-[11px] text-muted-foreground">not counted</span>}
                </th>
                <td className="py-2 text-right tabular-nums text-muted-foreground">{money(c.amount, cur)}</td>
                <td className="py-2 text-right">
                  <Input
                    type="number"
                    aria-label={`Your number for ${c.name}`}
                    className="ml-auto h-7 w-28 px-1.5 text-right text-xs tabular-nums"
                    value={adjust[c.name] ?? c.amount}
                    onChange={(e) => setAdjust((a) => ({ ...a, [c.name]: Number(e.target.value) || 0 }))}
                  />
                </td>
                <td className="py-2 pl-2 text-right tabular-nums text-muted-foreground">
                  {typeof lastSplit?.[c.name] === "number" ? money(lastSplit[c.name], cur) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-4">
        <Label htmlFor="forecast-note" className="text-xs">Your judgement — why the number is what it is</Label>
        <Textarea id="forecast-note" rows={3} className="mt-1" value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Two deals slipped a week; the rest is unchanged." />
      </section>

      <section className="mt-4 border-t pt-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">What changed since last time</h3>
        {changes.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {mine ? "Nothing has changed since you submitted." : "Nothing yet — this is your first submission for this period."}
          </p>
        ) : (
          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">{changes.map((c) => <li key={c}>{c}</li>)}</ul>
        )}
      </section>

    </Panel>
  )
}
