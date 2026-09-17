// Dates, money and counts in the words Settings and Requests use. The seed's today is the product's today.
import { TODAY } from "../../data/seed"

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const SHORT = MONTHS.map((m) => m.slice(0, 3))

/** "2 September" — the way the do-not-call clock and the plan renewal are written. */
export function longDay(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z")
  const sameYear = iso.slice(0, 4) === TODAY.slice(0, 4)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${sameYear ? "" : " " + d.getUTCFullYear()}`
}

/** "2 Sep" — inside a table cell. */
export function day(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z")
  const sameYear = iso.slice(0, 4) === TODAY.slice(0, 4)
  return `${d.getUTCDate()} ${SHORT[d.getUTCMonth()]}${sameYear ? "" : " " + d.getUTCFullYear()}`
}

export function daysBetween(from: string, to: string = TODAY): number {
  return Math.round((Date.parse(to.slice(0, 10)) - Date.parse(from.slice(0, 10))) / 86_400_000)
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Business days between two dates, which is what the answer target is written in. */
export function businessDaysBetween(from: string, to: string = TODAY): number {
  let n = 0
  const a = new Date(from.slice(0, 10) + "T00:00:00Z")
  const b = new Date(to.slice(0, 10) + "T00:00:00Z")
  while (a < b) {
    a.setUTCDate(a.getUTCDate() + 1)
    const wd = a.getUTCDay()
    if (wd !== 0 && wd !== 6) n++
  }
  return n
}

export function money(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
}

/** 1.84M, 410k, 620 — the credit shorthand the shell's pill already uses. */
export function credits(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "") + "k"
  return String(n)
}

export function plural(n: number, one: string, many = one + "s"): string {
  return `${n.toLocaleString()} ${n === 1 ? one : many}`
}
