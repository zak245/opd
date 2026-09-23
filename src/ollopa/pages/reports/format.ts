// Numbers and dates in the words Reports uses. One set of helpers, so the tiles, the chart, the
// tables and every drawer say the same thing about the same number.
import { TODAY } from "../../data/seed"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function day(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z")
  const sameYear = iso.slice(0, 4) === TODAY.slice(0, 4)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${sameYear ? "" : " " + d.getUTCFullYear()}`
}

/** "13 Sep" with no year, for a dense axis tick. */
export function shortDay(iso: string): string {
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z")
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}

export function money(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
}

const SYMBOL: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" }

/**
 * A summary figure: "€2.4m" rather than "€2,409,600" once it stops fitting. Full precision stays in
 * the report and its table. The spelling is the one the Deals board strip uses, so a sum reads the
 * same wherever the product prints one.
 */
export function moneyShort(amount: number, currency = "USD"): string {
  const sym = SYMBOL[currency] ?? `${currency} `
  const a = Math.abs(Math.round(amount))
  const body =
    a >= 1_000_000 ? `${(a / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1)}m`
      : a >= 1_000 ? `${Math.round(a / 1_000)}k`
        : `${a}`
  return `${amount < 0 ? "-" : ""}${sym}${body}`
}

export function count(n: number): string {
  return n.toLocaleString("en-US")
}

export function pct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`
}

/** A rate from two counts, with a zero denominator answering 0 rather than NaN. */
export function rate(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0
}

/** A signed delta in words, never colour alone: "↑ 370 more than the 30 days before". */
export function delta(now: number, before: number): { text: string; arrow: "↑" | "↓" | "→" } {
  const d = now - before
  if (d === 0) return { text: "no change", arrow: "→" }
  return { text: `${count(Math.abs(d))} ${d > 0 ? "more" : "fewer"}`, arrow: d > 0 ? "↑" : "↓" }
}

/* ------------------------------------------------------------------------------- calendar maths */

const DAY_MS = 86_400_000

export function iso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function addDays(from: string, n: number): string {
  return iso(new Date(Date.parse(from.slice(0, 10)) + n * DAY_MS))
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to.slice(0, 10)) - Date.parse(from.slice(0, 10))) / DAY_MS)
}

/** The Monday on or before a date. Weeks start on Monday everywhere on this page. */
export function weekStart(isoDate: string): string {
  const d = new Date(isoDate.slice(0, 10) + "T00:00:00Z")
  const shift = (d.getUTCDay() + 6) % 7
  return addDays(isoDate, -shift)
}

export function monthStart(isoDate: string): string {
  return isoDate.slice(0, 8) + "01"
}

export function quarterStart(isoDate: string): string {
  const m = Number(isoDate.slice(5, 7))
  const q = Math.floor((m - 1) / 3) * 3 + 1
  return `${isoDate.slice(0, 4)}-${String(q).padStart(2, "0")}-01`
}

/** "2026-Q4" from a date, for the forecast period. */
export function quarterName(isoDate: string): string {
  const m = Number(isoDate.slice(5, 7))
  return `${isoDate.slice(0, 4)}-Q${Math.floor((m - 1) / 3) + 1}`
}
