// The filter set: every filter People holds, flat, in one list (spec 02 §3, "Filters").
//
// One definition per filter carries its usage id, the group heading it sits under, the values a
// person picks from and what it means. The page asks the usage model which of them are chips in the
// bar and which sit in the panel; nothing here decides a level. A filter that cannot apply at this
// workspace is removed rather than disabled (rule 4): no "Synced to CRM" where there is no CRM, no
// custom fields where none are defined, no Persona or Score where neither is declared.
import { STAGES, type Seed } from "../../data/seed"
import {
  GROWTH_BANDS, SCORE_BANDS, SIZE_BANDS, TIME_IN_ROLE_BANDS, daysSince, foundedDecade, growthBand,
  scoreBand, signalFiredOn, sizeBand, timeInRole, type PersonRow,
} from "./person"

export type FilterGroup = "Person" | "Company" | "Reach" | "Ownership" | "History"
export const FILTER_GROUPS: FilterGroup[] = ["Person", "Company", "Reach", "Ownership", "History"]

export interface FilterContext {
  seed: Seed
  /** The signed-in person, so "Me" can be the first value on Owner. */
  user: string
  /** The workspace's CRM of record, or null where there is none. */
  crm: string | null
}

export interface FilterDef {
  /** The usage item id: the page asks this whether the filter is a chip or a panel row. */
  id: string
  label: string
  group: FilterGroup
  /** A long list is searched rather than printed: the panel shows a box, the chip a type-ahead. */
  typeAhead?: boolean
  /** One value at a time (a window of days is not an OR). */
  single?: boolean
  values: (ctx: FilterContext, rows: PersonRow[]) => string[]
  match: (p: PersonRow, chosen: string[], ctx: FilterContext) => boolean
  /** Removed where it cannot apply. */
  applies?: (ctx: FilterContext, rows: PersonRow[]) => boolean
}

const has = (chosen: string[], v: string) => chosen.includes(v)
const uniq = (xs: string[]) => Array.from(new Set(xs.filter(Boolean))).sort((a, b) => a.localeCompare(b))
const within = (iso: string | null | undefined, days: number) => daysSince(iso) <= days

const DAY_WINDOWS = ["In the last 7 days", "In the last 30 days", "In the last 90 days", "Over 90 days ago"]
const windowMatch = (iso: string | null | undefined, chosen: string[]) =>
  chosen.some((c) =>
    c === "In the last 7 days" ? within(iso, 7)
    : c === "In the last 30 days" ? within(iso, 30)
    : c === "In the last 90 days" ? within(iso, 90)
    : daysSince(iso) > 90)

/** The funding round on its own, from "Series A, 2025-04". */
const roundOf = (funding: string | null | undefined) => (funding ? funding.split(",")[0].trim() : "")

export const FILTERS: FilterDef[] = [
  /* ------------------------------------------------------------------------------------ Person */
  {
    id: "people.f.title", label: "Title", group: "Person", typeAhead: true,
    values: (_c, rows) => uniq(rows.map((p) => p.title)),
    match: (p, chosen) => chosen.some((c) => p.title.toLowerCase().includes(c.toLowerCase())),
  },
  {
    id: "people.f.persona", label: "Persona", group: "Person",
    applies: (c) => c.seed.personas.some((x) => !x.retired),
    values: (c) => c.seed.personas.filter((x) => !x.retired).map((x) => x.name),
    match: (p, chosen) => has(chosen, p.persona),
  },
  {
    id: "people.f.seniority", label: "Seniority", group: "Person",
    values: () => ["C-level", "VP", "Director", "Manager", "Individual"],
    match: (p, chosen) => has(chosen, p.seniority),
  },
  {
    id: "people.f.department", label: "Department", group: "Person",
    values: (_c, rows) => uniq(rows.map((p) => p.department)),
    match: (p, chosen) => has(chosen, p.department),
  },
  {
    id: "people.f.location", label: "Location", group: "Person",
    values: (_c, rows) => [...uniq(rows.map((p) => p.location.country)), ...uniq(rows.map((p) => p.location.city))],
    match: (p, chosen) => has(chosen, p.location.country) || has(chosen, p.location.city),
  },
  {
    id: "people.f.time-in-role", label: "Time in role", group: "Person",
    values: () => [...TIME_IN_ROLE_BANDS],
    match: (p, chosen) => has(chosen, timeInRole(p)),
  },
  {
    id: "people.f.languages", label: "Languages", group: "Person",
    values: (_c, rows) => uniq(rows.flatMap((p) => p.languages)),
    match: (p, chosen) => chosen.some((c) => p.languages.includes(c)),
  },
  {
    id: "people.f.timezone", label: "Time zone", group: "Person",
    values: (_c, rows) => uniq(rows.map((p) => p.tz)),
    match: (p, chosen) => has(chosen, p.tz),
  },

  /* ----------------------------------------------------------------------------------- Company */
  {
    id: "people.f.company", label: "Company", group: "Company", typeAhead: true,
    values: (_c, rows) => uniq(rows.map((p) => p.company)),
    match: (p, chosen) => chosen.some((c) => p.company.toLowerCase().includes(c.toLowerCase())),
  },
  {
    id: "people.f.company-size", label: "Company size", group: "Company",
    values: () => [...SIZE_BANDS],
    match: (p, chosen) => has(chosen, sizeBand(p.co?.employees)),
  },
  {
    id: "people.f.industry", label: "Industry", group: "Company",
    values: (_c, rows) => uniq(rows.map((p) => p.co?.industry ?? "")),
    match: (p, chosen) => has(chosen, p.co?.industry ?? ""),
  },
  {
    id: "people.f.technology", label: "Technology", group: "Company",
    values: (_c, rows) => uniq(rows.flatMap((p) => p.co?.technologies ?? [])),
    match: (p, chosen) => chosen.some((c) => p.co?.technologies.includes(c)),
  },
  {
    id: "people.f.keywords", label: "Keywords", group: "Company",
    values: (_c, rows) => uniq(rows.flatMap((p) => p.co?.keywords ?? [])),
    match: (p, chosen) => chosen.some((c) => p.co?.keywords.includes(c)),
  },
  {
    id: "people.f.signals", label: "Signals", group: "Company",
    values: (c) => [...c.seed.signals.filter((s) => !s.retired).map((s) => s.name), "In the last 7 days", "In the last 30 days", "In the last 90 days"],
    match: (p, chosen) => chosen.some((c) =>
      c.startsWith("In the last")
        ? within(signalFiredOn(p), Number(c.replace(/\D+/g, "")))
        : p.signals.some((s) => s.kind === c)),
  },
  {
    id: "people.f.funding", label: "Funding stage", group: "Company",
    values: (_c, rows) => uniq(rows.map((p) => roundOf(p.co?.funding))),
    match: (p, chosen) => has(chosen, roundOf(p.co?.funding)),
  },
  {
    id: "people.f.revenue", label: "Revenue", group: "Company",
    values: (_c, rows) => uniq(rows.map((p) => p.co?.revenue ?? "")),
    match: (p, chosen) => has(chosen, p.co?.revenue ?? ""),
  },
  {
    id: "people.f.founded", label: "Founded year", group: "Company",
    values: () => ["2020 or later", "2010–2019", "2000–2009", "Before 2000"],
    match: (p, chosen) => has(chosen, foundedDecade(p.co)),
  },
  {
    id: "people.f.headcount-growth", label: "Headcount growth", group: "Company",
    values: () => [...GROWTH_BANDS],
    match: (p, chosen) => has(chosen, growthBand(p.co?.headcountGrowth)),
  },

  /* ------------------------------------------------------------------------------------- Reach */
  {
    id: "people.f.score", label: "Score", group: "Reach",
    applies: (c) => c.seed.scoreModels.some((m) => !m.retired),
    values: (c) => {
      const model = c.seed.scoreModels.find((m) => m.primary) ?? c.seed.scoreModels[0]
      return [`Above the MQL threshold (${model.threshold})`, ...SCORE_BANDS]
    },
    match: (p, chosen, c) => {
      const model = c.seed.scoreModels.find((m) => m.primary) ?? c.seed.scoreModels[0]
      return chosen.some((v) => (v.startsWith("Above the MQL") ? p.score >= model.threshold : v === scoreBand(p.score)))
    },
  },
  {
    id: "people.f.email", label: "Email", group: "Reach",
    values: () => ["Verified", "Guessed", "Unverified", "Bounced"],
    match: (p, chosen) => has(chosen, p.emailStatus),
  },
  {
    id: "people.f.phone", label: "Has phone", group: "Reach",
    values: () => ["A phone number on file", "Already revealed", "No phone"],
    match: (p, chosen) => chosen.some((c) =>
      c === "A phone number on file" ? p.phone : c === "Already revealed" ? p.phoneRevealed : !p.phone),
  },
  {
    id: "people.f.not-in-sequence", label: "Not in a sequence", group: "Reach",
    values: () => ["Not in a sequence", "In a sequence"],
    match: (p, chosen) => chosen.some((c) => (c === "Not in a sequence" ? !p.inSequence : Boolean(p.inSequence))),
  },
  {
    id: "people.f.not-contacted", label: "Not contacted in the last", group: "Reach", single: true,
    values: () => ["7 days", "14 days", "30 days", "60 days", "90 days"],
    match: (p, chosen) => chosen.every((c) => daysSince(p.lastContacted) > Number(c.replace(/\D+/g, ""))),
  },
  {
    id: "people.f.email-replied", label: "Replied", group: "Reach",
    values: () => ["Has replied", "Has never replied"],
    match: (p, chosen) => chosen.some((c) => (c === "Has replied" ? p.replies > 0 : p.replies === 0)),
  },
  {
    id: "people.f.email-opened", label: "Opened or clicked", group: "Reach",
    values: () => ["Has opened or clicked", "Has never opened"],
    match: (p, chosen) => chosen.some((c) => (c === "Has opened or clicked" ? p.opens > 0 : p.opens === 0)),
  },
  {
    id: "people.f.email-bounced", label: "Email bounced", group: "Reach",
    values: () => ["Bounced"],
    match: (p) => p.emailStatus === "Bounced",
  },

  /* --------------------------------------------------------------------------------- Ownership */
  {
    id: "people.f.owner", label: "Owner", group: "Ownership",
    values: (c, rows) => ["Me", ...uniq(rows.map((p) => p.owner)).filter((o) => o !== c.user)],
    match: (p, chosen, c) => chosen.some((v) => (v === "Me" ? p.owner === c.user : p.owner === v)),
  },
  {
    id: "people.f.stage", label: "Stage", group: "Ownership",
    values: () => [...STAGES],
    match: (p, chosen) => has(chosen, p.stage),
  },
  {
    id: "people.f.list", label: "In list", group: "Ownership",
    applies: (c) => c.seed.lists.some((l) => l.kind === "people"),
    values: (c) => c.seed.lists.filter((l) => l.kind === "people" && !l.archived).map((l) => l.name),
    match: (p, chosen) => chosen.some((c) => p.lists.includes(c)),
  },
  {
    id: "people.f.synced-crm", label: "Synced to CRM", group: "Ownership",
    applies: (c) => Boolean(c.crm),
    values: (c) => [`In ${c.crm}`, `Not in ${c.crm} yet`],
    match: (p, chosen) => chosen.some((c) => (c.startsWith("In ") ? Boolean(p.crmId) : !p.crmId)),
  },
  {
    id: "people.f.source", label: "Source", group: "Ownership",
    values: () => ["Found", "Imported", "CRM", "Form", "Agent"],
    match: (p, chosen) => has(chosen, p.source),
  },
  {
    id: "people.f.custom", label: "Custom fields", group: "Ownership",
    applies: (_c, rows) => rows.some((p) => Object.keys(p.custom).length > 0),
    values: (_c, rows) => uniq(rows.flatMap((p) => Object.entries(p.custom).map(([k, v]) => `${k}: ${v}`))),
    match: (p, chosen) => chosen.some((c) => Object.entries(p.custom).some(([k, v]) => `${k}: ${v}` === c)),
  },

  /* ----------------------------------------------------------------------------------- History */
  {
    id: "people.f.last-activity", label: "Last activity", group: "History",
    values: () => DAY_WINDOWS,
    match: (p, chosen) => windowMatch(p.lastActivity, chosen),
  },
  {
    id: "people.f.created", label: "Created", group: "History",
    values: () => DAY_WINDOWS,
    match: (p, chosen) => windowMatch(p.addedOn, chosen),
  },
  {
    id: "people.f.job-change", label: "Changed job recently", group: "History",
    values: () => ["Changed job", "Has not changed job"],
    match: (p, chosen) => chosen.some((c) => (c === "Changed job" ? Boolean(p.jobChange) : !p.jobChange)),
  },
]

export type Active = Record<string, string[]>

/** The filters this workspace holds at all. The rest are removed, never greyed. */
export function filtersFor(ctx: FilterContext, rows: PersonRow[]): FilterDef[] {
  return FILTERS.filter((f) => !f.applies || f.applies(ctx, rows))
}

export function searchMatch(p: PersonRow, needle: string): boolean {
  if (!needle) return true
  const n = needle.trim().toLowerCase()
  return `${p.name} ${p.title} ${p.company} ${p.email}`.toLowerCase().includes(n)
}

/**
 * Apply search and every active filter, AND across filters and OR within one, skipping the one
 * filter named. Skipping is what makes a value count honest: "Verified (212)" is the number of rows
 * clicking it now would give, with every *other* active filter still applied.
 */
export function applyFilters(
  rows: PersonRow[], active: Active, search: string, ctx: FilterContext,
  opts: { except?: string; includeDoNotContact?: boolean } = {},
): PersonRow[] {
  const defs = filtersFor(ctx, rows)
  return rows.filter((p) => {
    if (!opts.includeDoNotContact && p.doNotContact) return false
    if (!searchMatch(p, search)) return false
    for (const f of defs) {
      if (f.id === opts.except) continue
      const chosen = active[f.id]
      if (!chosen || chosen.length === 0) continue
      if (!f.match(p, chosen, ctx)) return false
    }
    return true
  })
}

/** How the chip reads once a value is chosen: "Title: VP Sales, CRO". */
export function chipLabel(f: FilterDef, chosen: string[]): string {
  if (!chosen || chosen.length === 0) return f.label
  const values = `${chosen.slice(0, 2).join(", ")}${chosen.length > 2 ? ` +${chosen.length - 2}` : ""}`
  // A yes/no filter's one value is its own name — "Not in a sequence: Not in a sequence" says it
  // twice and costs a phone a whole row for nothing.
  return chosen.length === 1 && chosen[0] === f.label ? f.label : `${f.label}: ${values}`
}
