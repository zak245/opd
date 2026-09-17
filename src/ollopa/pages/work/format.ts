// Dates, durations and clocks in the words the Inbox and Tasks use.
// The seed's today (2026-09-13) is the product's today, so every relative phrase is measured from it.
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

/** The Inbox's first column: "3 d · Sep 10". Today reads "today". */
export function waiting(iso: string): string {
  const n = daysBetween(iso)
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z")
  const stamp = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
  if (n <= 0) return `today · ${stamp}`
  return `${n} d · ${stamp}`
}

/** An Interested reply older than one business day is overdue, and it says so in text, not colour. */
export function overdueWait(iso: string, outcome: string): boolean {
  return (outcome === "Interested" || outcome === "Question") && daysBetween(iso) > 1
}

/** The Tasks Due cell: "Overdue 2 d", "Today", "Tomorrow", "Thu 17". */
export function dueLabel(iso: string): string {
  const n = daysBetween(iso)
  if (n > 0) return `Overdue ${n} d`
  if (n === 0) return "Today"
  if (n === -1) return "Tomorrow"
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z")
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()]
  return `${wd} ${d.getUTCDate()}`
}

export function isOverdue(iso: string): boolean { return daysBetween(iso) > 0 }
export function isToday(iso: string): boolean { return daysBetween(iso) === 0 }

/** "12:40 local" for a contact's own clock, from the contact's time zone. */
export function localTime(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false })
      .format(new Date(`${TODAY}T14:20:00Z`))
  } catch { return "—" }
}

export function duration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

/** The Monday of the week containing today: the window the LinkedIn invite cap is counted over. */
export function weekStart(): string {
  const d = new Date(TODAY + "T00:00:00Z")
  const back = (d.getUTCDay() + 6) % 7
  return new Date(d.getTime() - back * 86_400_000).toISOString().slice(0, 10)
}
