// The one chart on a report: a weekly trend, and its table twin.
//
// It is skipped in the tab order (spec 12 §3) and carries a written summary instead, so nothing here
// is reachable only by pointing at it: every value is in the table the toggle above opens, and the
// legend names every series so identity is never colour alone.
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { Trend } from "./compute"
import { shortDay } from "./format"
import "./chart.css"

const SLOT = ["var(--viz-1)", "var(--viz-2)", "var(--viz-3)", "var(--viz-4)"]

/** The chart draws in real pixels, so a label is the same size at 400 wide as at 1440. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(640)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setW(Math.max(260, Math.round(entry.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

/** Clean axis ticks: 0, 500, 1,000 rather than 0, 437, 874 — and always one above the tallest mark. */
function ticksFor(max: number): number[] {
  if (max <= 0) return [0, 1]
  const raw = max / 4
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10
  const top = Math.ceil(max / step) * step
  const out: number[] = []
  for (let v = 0; v <= top + step * 0.001; v += step) out.push(v)
  return out.length > 1 ? out : [0, step]
}

export interface ChartProps {
  trend: Trend
  /** The same weeks, one period earlier. Drawn as a dashed line and named in the legend. */
  compare?: Trend | null
  format: (n: number) => string
  /** Persisted per report by the page; "table" is also the relief for the two light hues under 3:1. */
  view: "chart" | "table"
  onViewChange: (v: "chart" | "table") => void
  describedById: string
}

export function Chart({ trend, compare, format, view, onViewChange, describedById }: ChartProps) {
  const [box, width] = useWidth()
  const [at, setAt] = useState<number | null>(null)

  const series = trend.series.slice(0, SLOT.length)
  const weeks = trend.weeks
  const labels = trend.labels ?? trend.weeks
  const all = [...series.flatMap((s) => s.points), ...(compare?.series.flatMap((s) => s.points) ?? [])]
  const max = Math.max(1, ...all)
  const ticks = ticksFor(max)
  const top = ticks[ticks.length - 1]

  const padLeft = 56
  const padRight = 16
  const padTop = 12
  const plotH = 148
  const axisH = 22
  const height = padTop + plotH + axisH
  const plotW = Math.max(60, width - padLeft - padRight)
  const x = (i: number) => padLeft + (weeks.length === 1 ? plotW / 2 : (i / (weeks.length - 1)) * plotW)
  const y = (v: number) => padTop + plotH - (v / top) * plotH

  const path = (points: number[]) => points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(" ")

  // One tick every n weeks, so labels never collide at phone width.
  const every = Math.max(1, Math.ceil((weeks.length * 46) / plotW))

  return (
    <section className="ollopa-viz rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {series.map((s, i) => (
            <li key={s.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span aria-hidden="true" className="inline-block h-0.5 w-4 rounded-full" style={{ background: SLOT[i] }} />
              {s.label}
            </li>
          ))}
          {compare && (
            <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span aria-hidden="true" className="inline-block h-0 w-4 border-t-2 border-dashed border-muted-foreground" />
              Previous period
            </li>
          )}
        </ul>
        <div role="group" aria-label="Trend as a chart or a table" className="flex gap-1" data-print-hide>
          {(["chart", "table"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => onViewChange(v)}
              className={cn(
                "rounded-md px-2 py-0.5 text-xs capitalize focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                view === v ? "bg-foreground text-background" : "hover:bg-muted",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">{trend.summary}</caption>
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th scope="col" className="px-3 py-1.5 text-left font-medium">Week of</th>
                {series.map((s) => <th key={s.id} scope="col" className="px-3 py-1.5 text-right font-medium">{s.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {weeks.map((w, i) => (
                <tr key={w} className="border-b last:border-b-0">
                  <th scope="row" className="px-3 py-1 text-left font-normal">{shortDay(labels[i] ?? w)}</th>
                  {series.map((s) => <td key={s.id} className="px-3 py-1 text-right tabular-nums">{format(s.points[i] ?? 0)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={box} className="relative px-3 py-2">
          <svg
            role="img"
            aria-label={trend.summary}
            aria-describedby={describedById}
            width={width}
            height={height}
            className="max-w-full overflow-visible"
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const i = Math.round(((e.clientX - rect.left - padLeft) / plotW) * (weeks.length - 1))
              setAt(i >= 0 && i < weeks.length ? i : null)
            }}
            onPointerLeave={() => setAt(null)}
          >
            {/* Hairline grid, solid, one step off the surface. */}
            {ticks.map((t) => (
              <g key={t}>
                <line x1={padLeft} x2={padLeft + plotW} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" strokeWidth={1} />
                <text x={padLeft - 8} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">{format(t)}</text>
              </g>
            ))}
            <line x1={padLeft} x2={padLeft + plotW} y1={y(0)} y2={y(0)} stroke="var(--viz-axis)" strokeWidth={1} />

            {weeks.map((w, i) => (i % every === 0 ? (
              <text key={w} x={x(i)} y={padTop + plotH + 15} textAnchor="middle" className="fill-muted-foreground text-[10px]">{shortDay(labels[i] ?? w)}</text>
            ) : null))}

            {compare?.series.slice(0, SLOT.length).map((s, i) => (
              <path key={`c-${s.id}`} d={path(s.points)} fill="none" stroke={SLOT[i]} strokeWidth={2} strokeDasharray="4 4" strokeLinejoin="round" strokeLinecap="round" opacity={0.55} />
            ))}

            {series.map((s, i) => (
              <path key={s.id} d={path(s.points)} fill="none" stroke={SLOT[i]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            ))}

            {/* End markers, with a 2px ring in the surface colour so crossings stay legible. */}
            {series.map((s, i) => (
              <circle key={`e-${s.id}`} cx={x(weeks.length - 1)} cy={y(s.points[weeks.length - 1] ?? 0)} r={4}
                fill={SLOT[i]} stroke="var(--viz-surface)" strokeWidth={2} />
            ))}

            {at !== null && (
              <g>
                <line x1={x(at)} x2={x(at)} y1={padTop} y2={padTop + plotH} stroke="var(--viz-axis)" strokeWidth={1} />
                {series.map((s, i) => (
                  <circle key={`h-${s.id}`} cx={x(at)} cy={y(s.points[at] ?? 0)} r={4} fill={SLOT[i]} stroke="var(--viz-surface)" strokeWidth={2} />
                ))}
              </g>
            )}
          </svg>

          {at !== null && (
            <div
              className="pointer-events-none absolute top-3 rounded-md border bg-background px-2 py-1.5 text-xs shadow-sm"
              style={{ left: Math.min(Math.max(x(at) - 60, 8), Math.max(8, width - 140)) }}
            >
              <div className="font-medium">Week of {shortDay(weeks[at])}</div>
              <ul className="mt-0.5">
                {series.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="inline-block size-2 rounded-full" style={{ background: SLOT[i] }} />
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="ml-auto tabular-nums">{format(s.points[at] ?? 0)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p id={describedById} className="border-t px-3 py-1.5 text-xs text-muted-foreground">{trend.summary}</p>
    </section>
  )
}
