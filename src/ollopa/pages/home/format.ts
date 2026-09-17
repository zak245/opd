// Dates, money and counts in the words Home uses. The seed's today is the product's today.
import { TODAY } from "../../data/seed"

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function addDays(iso: string, n: number): string {
  return new Date(Date.parse(iso.slice(0, 10)) + n * 86_400_000).toISOString().slice(0, 10)
}

export function daysBetween(from: string, to: string = TODAY): number {
  return Math.round((Date.parse(to.slice(0, 10)) - Date.parse(from.slice(0, 10))) / 86_400_000)
}

/** "13 Sep", and the year when it is not this one. */
export function day(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z")
  const sameYear = iso.slice(0, 4) === TODAY.slice(0, 4)
  return `${d.getUTCDate()} ${SHORT[d.getUTCMonth()]}${sameYear ? "" : " " + d.getUTCFullYear()}`
}

/** "25 September" — the long form the strip and the credit projection use. */
export function longDay(iso: string): string {
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z")
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}

/** The header's date: "Sunday 13 September". */
export function headerDate(iso: string = TODAY): string {
  const d = new Date(iso + "T00:00:00Z")
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}

/** "today", "yesterday", "3 days ago", "tomorrow", "in 5 days". */
export function when(iso: string | null | undefined): string {
  if (!iso) return "—"
  const n = daysBetween(iso)
  if (n === 0) return "today"
  if (n === 1) return "yesterday"
  if (n > 1) return `${n} days ago`
  if (n === -1) return "tomorrow"
  return `in ${-n} days`
}

/** "4 days overdue", for the red date above today's list. */
export function overdueBy(iso: string): string {
  const n = daysBetween(iso)
  return n === 1 ? "1 day overdue" : `${n} days overdue`
}

export function money(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
}

/** Large credit counts read as "1.8M" nowhere: the product prints the number people are billed for. */
export function count(n: number): string {
  return n.toLocaleString()
}

export function firstName(name: string): string {
  return name.split(" ")[0]
}

/** "1 email" / "3 emails", so a sentence never reads "1 emails". */
export function plural(n: number, one: string, many = one + "s"): string {
  return `${n.toLocaleString()} ${n === 1 ? one : many}`
}

/** The greeting the header opens with. The seed's today has no clock, so the workspace day starts here. */
export function greeting(): string {
  return "Good morning"
}
