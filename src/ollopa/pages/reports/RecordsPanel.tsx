// `X-report-records` — the records behind this number.
//
// It opens from any count, its title names the number it opened from, it shows that row week by week
// first and then the records themselves, and closing it returns focus to the cell that opened it. It
// is a sibling of `X-forecast` on the page, never a child of it: one panel at a time.
import { Button } from "@/components/ui/button"
import { Panel } from "../../ui/Panel"
import { toast } from "../../templates/TablePage"
import { navigate } from "@/app/router"
import { shortDay } from "./format"

export interface RecordRowData { id: string; route?: string; values: (string | number)[] }

export interface RecordsRequest {
  title: string
  /** Why these rows are in this order, when it is not the obvious one. */
  subtitle?: string
  headers: { header: string; align?: "right" }[]
  rows: RecordRowData[]
  /** The count week by week: the first section, above the rows. */
  weekly: { week: string; n: number }[]
  /** What one row opens, in words: "Open deal". */
  openLabel: string
  /** Locked on Starter; the count still prints, because the numbers are never gated. */
  exportLocked: boolean
  exportPlan: string
}

export function RecordsPanel({ request, onOpenChange }: { request: RecordsRequest | null; onOpenChange: (open: boolean) => void }) {
  if (!request) return null
  const max = Math.max(1, ...request.weekly.map((w) => w.n))
  return (
    <Panel id="report-records" title={request.title} open onOpenChange={onOpenChange}>
      {request.subtitle && <p className="pb-3 text-xs text-muted-foreground">{request.subtitle}</p>}

      <section>
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Week by week</h3>
        <ul className="mt-2 space-y-1">
          {request.weekly.map((w) => (
            <li key={w.week} className="flex items-center gap-2 text-xs">
              <span className="w-14 shrink-0 text-muted-foreground">{shortDay(w.week)}</span>
              {/* A bar and the number: the bar is the shape, the number is the value. */}
              <span aria-hidden="true" className="h-1.5 rounded-full bg-foreground/70" style={{ width: `${Math.round((w.n / max) * 70)}%` }} />
              <span className="tabular-nums">{w.n.toLocaleString("en-US")}</span>
            </li>
          ))}
          {request.weekly.length === 0 && <li className="text-xs text-muted-foreground">No weeks in this range.</li>}
        </ul>
      </section>

      <section className="mt-5 border-t pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            The records ({request.rows.length.toLocaleString("en-US")})
          </h3>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => toast(
              request.exportLocked
                ? `Exporting a report is on ${request.exportPlan}. Printing this panel costs nothing and is on every plan.`
                : `Exported ${request.rows.length} rows as CSV. The header row names the range and the filters.`,
            )}
          >
            {request.exportLocked ? `Export these ${request.rows.length} rows · ${request.exportPlan}` : `Export these ${request.rows.length} rows`}
          </Button>
        </div>

        {/* The panel is narrow, so the columns wrap rather than scroll sideways: every column the
            spec names stays on screen. */}
        <div className="mt-2">
          <table className="w-full table-fixed text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                {request.headers.map((h) => (
                  <th key={h.header} scope="col" className={`px-2 py-1 font-medium ${h.align === "right" ? "text-right" : "text-left"}`}>{h.header}</th>
                ))}
                <th scope="col" className="w-14 px-2 py-1 text-right font-medium"><span className="sr-only">{request.openLabel}</span></th>
              </tr>
            </thead>
            <tbody>
              {request.rows.slice(0, 60).map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  {row.values.map((v, i) => (
                    <td key={i} className={`px-2 py-1 align-top ${request.headers[i]?.align === "right" ? "text-right tabular-nums" : ""}`}>{v}</td>
                  ))}
                  <td className="w-14 px-2 py-1 text-right align-top">
                    {row.route
                      ? <button type="button" className="underline" onClick={() => navigate(row.route!)}>Open</button>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {request.rows.length > 60 && (
            <p className="pt-2 text-xs text-muted-foreground">Showing the first 60 of {request.rows.length.toLocaleString("en-US")}. The export carries all of them.</p>
          )}
          {request.rows.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">Nothing in this range.</p>}
        </div>
      </section>
    </Panel>
  )
}
