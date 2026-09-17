// Dates, money and the words this page uses for them. The seed's today is the product's today.
import { TODAY } from "../../data/seed"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function day(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z")
  const sameYear = iso.slice(0, 4) === TODAY.slice(0, 4)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${sameYear ? "" : " " + d.getUTCFullYear()}`
}

export function daysBetween(from: string, to: string = TODAY): number {
  return Math.round((Date.parse(to.slice(0, 10)) - Date.parse(from.slice(0, 10))) / 86_400_000)
}

/** Days from today until a date; negative once it has passed. */
export function daysLeft(iso: string | null | undefined): number {
  return iso ? -daysBetween(iso) : 0
}

/** "3 days ago", "today", "in 5 days" — the same phrasing on the table, the drawer and the record. */
export function ago(iso: string | null | undefined): string {
  if (!iso) return "—"
  const n = daysBetween(iso)
  if (n === 0) return "today"
  if (n === 1) return "yesterday"
  if (n > 1) return `${n} days ago`
  if (n === -1) return "tomorrow"
  return `in ${-n} days`
}

export function money(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
}

/** "up 4 in 30 days" / "down 3 in 30 days" — a 30-day move, in words, never an arrow on its own. */
export function delta(n: number): string {
  if (n === 0) return "no change in 30 days"
  return `${n > 0 ? "up" : "down"} ${Math.abs(n)} in 30 days`
}

/** The renewal, read the way a CSM reads it: the date and how long is left. */
export function renewalText(iso: string | null | undefined): string {
  if (!iso) return "—"
  const n = daysLeft(iso)
  if (n < 0) return `${day(iso)} · lapsed ${-n} days ago`
  if (n === 0) return `${day(iso)} · today`
  return `${day(iso)} · ${n} days`
}
