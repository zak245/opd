// What a row on People is, and the few shapes every part of the page agrees on.
//
// One contact joined to its company, and the bands the filters group those rows into. Every value
// comes from the seed's own fields; the bands are named here once so a filter, a column and the
// record can never put the same person in two different groups.
import { TODAY, type Company, type Contact, type Seed } from "../../data/seed"

export interface PersonRow extends Contact {
  /** The company this person works at, joined by id. Absent only if the seed ever loses one. */
  co: Company | undefined
}

export function rowsFor(seed: Seed): PersonRow[] {
  const byId = new Map(seed.companies.map((c) => [c.id, c]))
  return seed.contacts.map((c) => ({ ...c, co: byId.get(c.companyId) }))
}

/* ------------------------------------------------------------------- dates, in the page's words */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function day(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z")
  const sameYear = iso.slice(0, 4) === TODAY.slice(0, 4)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${sameYear ? "" : " " + d.getUTCFullYear()}`
}

export function daysSince(iso: string | null | undefined): number {
  if (!iso) return Number.POSITIVE_INFINITY
  return Math.round((Date.parse(TODAY) - Date.parse(iso.slice(0, 10))) / 86_400_000)
}

export function ago(iso: string | null | undefined): string {
  if (!iso) return "Never"
  const n = daysSince(iso)
  if (n === 0) return "today"
  if (n === 1) return "yesterday"
  return `${n} days ago`
}

/* ---------------------------------------------------------------- bands and derived attributes */

export const SIZE_BANDS = ["1–10", "11–50", "51–200", "201–1,000", "1,000+"] as const
export function sizeBand(employees: number | undefined): string {
  if (employees === undefined) return "Unknown"
  if (employees <= 10) return "1–10"
  if (employees <= 50) return "11–50"
  if (employees <= 200) return "51–200"
  if (employees <= 1_000) return "201–1,000"
  return "1,000+"
}

export const SCORE_BANDS = ["80–100", "60–79", "40–59", "20–39", "0–19"] as const
export function scoreBand(score: number): string {
  if (score >= 80) return "80–100"
  if (score >= 60) return "60–79"
  if (score >= 40) return "40–59"
  if (score >= 20) return "20–39"
  return "0–19"
}

export const GROWTH_BANDS = ["Shrinking", "Flat", "Growing 1–20%", "Growing over 20%"] as const
export function growthBand(growth: number | undefined): string {
  if (growth === undefined) return "Flat"
  if (growth < 0) return "Shrinking"
  if (growth === 0) return "Flat"
  return growth <= 20 ? "Growing 1–20%" : "Growing over 20%"
}

export const TIME_IN_ROLE_BANDS = ["Under 6 months", "6–12 months", "1–2 years", "Over 2 years"] as const
/** How long this person has been in the job, from the day they started it. */
export function timeInRole(c: Contact): string {
  const d = daysSince(c.roleStartedOn)
  if (d < 180) return "Under 6 months"
  if (d < 365) return "6–12 months"
  if (d < 730) return "1–2 years"
  return "Over 2 years"
}

/** The day this person's most recent signal fired, or nothing where none has. */
export function signalFiredOn(c: Contact): string | null {
  return c.signals.reduce<string | null>((newest, s) => (newest === null || s.on > newest ? s.on : newest), null)
}

export function revenueBand(co: Company | undefined): string {
  return co?.revenue ?? "Unknown"
}

export function foundedDecade(co: Company | undefined): string {
  if (!co) return "Unknown"
  if (co.founded >= 2020) return "2020 or later"
  if (co.founded >= 2010) return "2010–2019"
  if (co.founded >= 2000) return "2000–2009"
  return "Before 2000"
}

/* --------------------------------------------------------------------------- the glance's fields */

/**
 * The record's first level, in the record's order, and the one place the three surfaces that show
 * it agree: the top of the contact record, the quick look beside the table, and the pane a contact
 * reads in when another page opens them beside itself.
 *
 * Which of these a seat actually gets is not written here. Each field names the usage item it
 * answers to, and the caller hands in `useDisclosure("people").level`: the seat's own weekly
 * numbers decide, so a Ridgeline marketer reading a contact sees the score and a Meridian SDR sees
 * the sequence, from one list and with no mode switch. The four with `item: null` are not gated —
 * who they are, where they work, how to reach them and whether they may be contacted at all are
 * decision-critical (rule 7), and they are the only thing a seat the People model carries no
 * numbers for (customer success) would otherwise be left with nothing of.
 */
export interface Glance { label: string; value: string }

interface GlanceDef {
  label: string
  /** The usage item this field answers to, or null when it is never gated. */
  item: string | null
  value: (p: PersonRow, seed: Seed) => string
}

const GLANCE: GlanceDef[] = [
  { label: "Title", item: null, value: (p) => p.title },
  { label: "Company", item: null, value: (p) => p.company },
  { label: "Owner", item: "people.col.owner", value: (p) => p.owner },
  { label: "Email", item: null, value: (p) => `${p.email} · ${p.emailStatus}` },
  {
    label: "Phone",
    item: "people.col.phone",
    value: (p) => (p.phoneRevealed && p.phoneNumber ? p.phoneNumber : p.phone ? "Not revealed" : "No phone on file"),
  },
  { label: "Stage", item: "people.col.stage", value: (p) => p.stage },
  {
    label: "Sequence",
    item: "people.col.sequence",
    value: (p, seed) => {
      const enrolment = seed.enrollments.find((e) => e.contactId === p.id && e.status === "Active")
      const steps = seed.sequences.find((s) => s.name === p.inSequence)?.steps
      return p.inSequence
        ? `${p.inSequence}${enrolment ? ` · step ${enrolment.stepOrder}${steps ? ` of ${steps}` : ""}` : ""}`
        : "Not in a sequence"
    },
  },
  {
    label: "Last contacted",
    item: "people.col.last-contacted",
    value: (p) => (p.lastContacted ? `${day(p.lastContacted)} · ${ago(p.lastContacted)}` : "Never contacted"),
  },
  {
    label: "Last activity",
    item: "people.col.last-activity",
    value: (p) => (p.lastActivity ? `${day(p.lastActivity)} · ${ago(p.lastActivity)}` : "Nothing yet"),
  },
  { label: "Score", item: "people.col.score", value: (p) => `${p.score} · stamped ${day(p.scoredAt)}` },
  {
    label: "Signals",
    item: "people.col.signals",
    value: (p) => (p.signals.length === 0 ? "None" : p.signals.map((s) => `${s.kind} · ${day(s.on)}`).join(" · ")),
  },
  {
    label: "Do not contact",
    item: null,
    value: (p) =>
      p.doNotContact
        ? "Yes — outreach is blocked"
        : p.doNotCall
          ? `Do not call · ${p.doNotCallSource ?? "on file"}`
          : "No",
  },
]

/** What `level` is when nobody hands one in: every field, the way the list reads on its own. */
const ALL_AT_LEVEL_ONE = () => 1 as const

/**
 * The first level and what this seat does not read weekly, split in the record's order. The record
 * puts `first` in its field grid and `rest` behind its history door, so demoting a field moves it
 * rather than losing it.
 */
export function glanceSplit(
  p: PersonRow,
  seed: Seed,
  level: (itemId: string) => 1 | 2 = ALL_AT_LEVEL_ONE,
): { first: Glance[]; rest: Glance[] } {
  const first: Glance[] = []
  const rest: Glance[] = []
  for (const def of GLANCE) {
    const where = def.item === null || level(def.item) === 1 ? first : rest
    where.push({ label: def.label, value: def.value(p, seed) })
  }
  return { first, rest }
}

/**
 * The quick look is the top of the record cut short: the same fields, the same order, the same
 * labels (RULES.md, the quick look and the record). The drawer beside the table, the record's
 * header and the pane beside another page are all built from this one call, so the three can never
 * drift apart.
 */
export function glanceFields(
  p: PersonRow,
  seed: Seed,
  level: (itemId: string) => 1 | 2 = ALL_AT_LEVEL_ONE,
): Glance[] {
  return glanceSplit(p, seed, level).first
}
