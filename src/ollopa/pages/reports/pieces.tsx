// The pieces every report is built from: the tile row, the breakdown table, and the in-place gate
// the Export panel uses for a line this plan does not include.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { ChevronRight, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Actions } from "../../ui/Actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDoorState } from "../../ui/Door"
import { Section, SummaryStrip } from "../../layouts"
import { money as usd, type Plan } from "../../ui/gate"
import { toast } from "../../templates/TablePage"
import type { Tile } from "./compute"

/* ----------------------------------------------------------------------------------- the tiles */

/**
 * The numbers this report is judged by. LAYOUTS.md §2: one band of text, never a row of boxes, and
 * one to a page — so this is the page's `SummaryStrip`, and each figure is still the door into the
 * records behind it. What the number means and how it moved sit beside it as the figure's note.
 */
export function TileRow({ tiles, onRecords }: { tiles: Tile[]; onRecords?: (t: Tile) => void }) {
  return (
    <SummaryStrip figures={tiles.map((t) => ({
      label: t.label,
      value: t.records && onRecords ? (
        <button
          type="button"
          aria-label={`${t.value} ${t.label.toLowerCase()} — open the records behind this number`}
          onClick={() => onRecords(t)}
          className="inline-flex items-baseline gap-1 rounded underline decoration-dotted underline-offset-4 hover:decoration-solid focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {t.value}
          <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
        </button>
      ) : t.value,
      note: t.under || t.delta ? (
        <>
          {t.under}
          {t.under && t.delta && " · "}
          {t.delta && <><span aria-hidden="true">{t.delta.arrow} </span>{t.delta.text}</>}
        </>
      ) : undefined,
    }))} />
  )
}

/* ------------------------------------------------------------------------- the breakdown table */

export interface Col<T> {
  key: string
  header: string
  align?: "right"
  cell: (row: T) => ReactNode
  /** What the column sorts on. A column with no sort key is not sortable. */
  sort?: (row: T) => number | string
  /** Never hidden by the column picker, and sticky at phone width. */
  fixed?: boolean
}

export interface BreakdownProps<T> {
  caption: string
  rows: T[]
  rowKey: (row: T) => string
  columns: Col<T>[]
  /** Persists sort and chosen columns per user and per report. */
  storageKey: string
  /**
   * Doors inside the row, expanding in place under it: short content compared against sibling rows.
   * Two doors side by side are two cuts of the same row read together — an audience and its personas —
   * never one inside the other.
   */
  expand?: (row: T) => { id: string; label: string; count?: number; content: ReactNode }[]
  empty?: ReactNode
  /** Above the table, beside the column picker. */
  aside?: ReactNode
  /** "Expand all steps" / "Collapse all", which printing also uses. */
  expandSignal?: { n: number; open: boolean } | null
}

function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback } catch { return fallback }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode: this visit only */ }
}

export function BreakdownTable<T>({ caption, rows, rowKey, columns, storageKey, expand, empty, aside, expandSignal }: BreakdownProps<T>) {
  const sortKey = `ollopa.reports.sort.${storageKey}`
  const colsKey = `ollopa.reports.columns.${storageKey}`
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(() => read(sortKey, null))
  const [hidden, setHidden] = useState<string[]>(() => read(colsKey, []))

  const shown = columns.filter((c) => c.fixed || !hidden.includes(c.key))
  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sort) return rows
    return [...rows].sort((a, b) => {
      const x = col.sort!(a), y = col.sort!(b)
      return (x < y ? -1 : x > y ? 1 : 0) * sort.dir
    })
  }, [rows, sort, columns])

  const toggleSort = (key: string) => {
    const next = sort?.key === key ? { key, dir: (sort.dir === 1 ? -1 : 1) as 1 | -1 } : { key, dir: -1 as const }
    setSort(next)
    write(sortKey, next)
  }

  return (
    <Section
      padded={false}
      heading={caption}
      count={rows.length}
      actions={<div className="flex items-center gap-2" data-print-hide>
          {aside}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 t-small">Columns: {shown.length} of {columns.length}</Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
              <ul className="grid gap-2">
                {columns.map((c) => (
                  <li key={c.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`${storageKey}-${c.key}`}
                      checked={c.fixed || !hidden.includes(c.key)}
                      disabled={c.fixed}
                      onCheckedChange={(v) => {
                        const next = v ? hidden.filter((h) => h !== c.key) : [...hidden, c.key]
                        setHidden(next)
                        write(colsKey, next)
                      }}
                    />
                    <label htmlFor={`${storageKey}-${c.key}`} className="t-body">{c.header}</label>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </div>}
    >
      {rows.length === 0 ? (
        <div className="border-t px-3 py-8 text-center t-body text-muted-foreground">{empty ?? "Nothing in this range."}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-max t-body">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="border-b">
                {shown.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={cn(
                      "whitespace-nowrap px-3 py-1.5 t-small font-medium text-muted-foreground",
                      c.align === "right" ? "text-right" : "text-left",
                      c.fixed && "sticky left-0 z-10 bg-background",
                    )}
                  >
                    {c.sort ? (
                      <button type="button" onClick={() => toggleSort(c.key)}
                        aria-sort={sort?.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                        className="rounded hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                        {c.header}{sort?.key === c.key && <span aria-hidden="true"> {sort.dir === 1 ? "↑" : "↓"}</span>}
                      </button>
                    ) : c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <Row key={rowKey(row)} row={row} columns={shown} expand={expand} span={shown.length} signal={expandSignal ?? null} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  )
}

function Row<T>({ row, columns, expand, span, signal }: {
  row: T; columns: Col<T>[]; expand?: BreakdownProps<T>["expand"]; span: number
  signal: { n: number; open: boolean } | null
}) {
  const doors = expand?.(row) ?? []
  return (
    <>
      <tr className="border-b last:border-b-0">
        {columns.map((c) => (
          <td key={c.key} className={cn("whitespace-nowrap px-3 py-1.5", c.align === "right" ? "text-right tabular-nums" : "", c.fixed && "sticky left-0 z-10 bg-background")}>
            {c.cell(row)}
          </td>
        ))}
      </tr>
      {doors.length > 0 && (
        <tr className="border-b last:border-b-0">
          <td colSpan={span} className="px-3 pb-2">
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {doors.map((d) => <RowDoor key={d.id} door={d} signal={signal} />)}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function RowDoor({ door, signal }: { door: { id: string; label: string; count?: number; content: ReactNode }; signal: { n: number; open: boolean } | null }) {
  const [open, setOpen] = useDoorState(door.id, false)
  const seen = useRef(signal?.n ?? 0)
  useEffect(() => {
    if (!signal || signal.n === seen.current) return
    seen.current = signal.n
    setOpen(signal.open)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal])
  return (
    <div className="min-w-0 basis-full sm:basis-auto">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded t-small text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ChevronRight aria-hidden="true" className={cn("size-3.5 transition-transform", open && "rotate-90")} />
        {door.label}{door.count !== undefined && `: ${door.count}`}
      </button>
      {open && <div className="pt-2">{door.content}</div>}
    </div>
  )
}

/* ---------------------------------------------------------------- a door that expands in place */

export function InlineDoor({ id, label, count, children, defaultOpen = false }: { id: string; label: string; count?: number; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useDoorState(id, defaultOpen)
  return (
    <Section
      padded={false}
      heading={
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-2 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ChevronRight aria-hidden="true" className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} />
          <span>{label}{count !== undefined ? ":" : ""}</span>
          {count !== undefined && <span className="t-label font-normal tabular-nums text-muted-foreground">{` ${count}`}</span>}
        </button>
      }
    >
      {open && <div className="px-4 t-body">{children}</div>}
    </Section>
  )
}

/* ------------------------------------------------------------------------ a line the plan gates */

/**
 * The gated-features pattern, rendered in place rather than behind another panel: what it does, the
 * plan, one total for the period — never a per-seat breakdown — and one button. Someone who cannot
 * buy asks the named admin from here, with a reason. Used inside the Export panel, where the `Locked`
 * primitive cannot go, because a panel never opens a panel.
 */
export function InlineGate({ feature, plan, pricePerMonth, what, seats, isAdmin, admin }: {
  feature: string
  plan: Plan
  pricePerMonth: number
  what: string
  seats: number
  isAdmin: boolean
  admin: string
}) {
  const [reason, setReason] = useState("")
  const [asked, setAsked] = useState(false)
  return (
    <div className="rounded-md border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="t-body font-medium">{feature}</span>
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 t-small text-muted-foreground">
          <Lock className="size-3" aria-hidden="true" />{plan}
        </span>
      </div>
      <p className="mt-1 t-small text-muted-foreground">{what}</p>
      <p className="mt-1 t-small tabular-nums text-muted-foreground">{usd(pricePerMonth)} a month for your {seats} seats</p>
      {!isAdmin && (
        <div className="mt-2">
          <Label htmlFor={`why-${feature}`} className="t-small">Why you need it — {admin} sees this with the cost</Label>
          <Textarea id={`why-${feature}`} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1" placeholder="What you are trying to do" />
        </div>
      )}
      <Actions className="mt-2" surface="card" items={[{
        kind: "primary",
        label: isAdmin ? `Upgrade to ${plan} · ${usd(pricePerMonth)} a month` : asked ? "Asked" : `Ask ${admin} to upgrade`,
        disabledBecause: asked ? "Already asked" : undefined,
        onClick: () => {
          if (isAdmin) { toast(`Upgrade to ${plan}: ${usd(pricePerMonth)} a month for ${seats} seats.`); return }
          setAsked(true)
          document.dispatchEvent(new CustomEvent("ollopa:upgrade-request", { detail: { feature, plan, pricePerMonth, reason } }))
          toast(`Asked ${admin} for ${feature} · ${plan} · ${usd(pricePerMonth)} a month`)
        },
      }]} />
    </div>
  )
}
