// Dates, clocks and numbers in the words the marketing pages use. The seed's today is the product's
// today, so nothing here reads the machine clock and no screenshot drifts.
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

/** "3 days ago", "today", "in 5 days" — the same phrasing on every marketing screen. */
export function ago(iso: string | null | undefined): string {
  if (!iso) return "—"
  const n = daysBetween(iso)
  if (n === 0) return "today"
  if (n === 1) return "yesterday"
  if (n > 1) return `${n} days ago`
  if (n === -1) return "tomorrow"
  return `in ${-n} days`
}

export const num = (n: number) => n.toLocaleString("en-US")

/** A rate with its count beside it is one fact; the count is never hover-only (rule 4). */
export function pct(part: number, whole: number, digits = 1): string {
  if (!whole) return "—"
  return `${((part / whole) * 100).toFixed(digits)}%`
}

export const ratio = (part: number, whole: number) => (whole ? (part / whole) * 100 : 0)

/** Run rows are stored "2026-09-10 14:02". */
export const dateOf = (at: string) => at.slice(0, 10)
export const clockOf = (at: string) => (at.length > 10 ? at.slice(11, 16) : "—")

const minutes = (clock: string) => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3, 5))

/** Minutes past the window, against the workspace's own close of business. */
export function minutesOver(startClock: string, nowClock: string, windowHours: number): number {
  return minutes(nowClock) - minutes(startClock) - windowHours * 60
}

/** How far past a window a lead is, in text — never colour alone (rule 4, WCAG 1.4.1). */
export function overBy(startClock: string, nowClock: string, windowHours: number): string {
  const over = minutesOver(startClock, nowClock, windowHours)
  if (over <= 0) return "inside the window"
  const h = Math.floor(over / 60)
  const m = over % 60
  return `${h > 0 ? `${h}h ` : ""}${m}m over`
}

/** "2h" and "1 business day" as the seed writes them; the number of hours the clock allows. */
export function windowHours(window: string): number {
  const m = /^(\d+)h$/.exec(window)
  if (m) return Number(m[1])
  return 8 // one business day, from the workspace's 08:00–18:00
}
