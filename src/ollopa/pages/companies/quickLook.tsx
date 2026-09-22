// The company's first level: one ordered list of fields, read by three things.
//
// The record page's header, the quick-look drawer on the two tables, and the pane a company reads in
// beside another page are the same first level of the same object. They are built from `companyFields`
// below — one list, in the record's order — and every entry names the usage item that decides whether
// it is level one for the seat and the business that is signed in. Nothing here is a hard-coded set:
// `useDisclosure("companies")` answers, so a Ridgeline CS reads health, its drivers, the renewal and
// the next step where a Meridian SDR reads contacts and the two decision-critical fields, and the
// three surfaces cannot drift because there is one list and one question asked about it.
//
// Rule 7 shows through the usage model rather than around it: `rec.renewal` and `rec.risks` are
// marked critical in `usage/companies.ts`, so a commitment date and an open risk are level one for
// every seat whatever the weekly number says.
import type { ReactNode } from "react"
import { Chip } from "../../ui/Identity"
import type { QuickLookField } from "../../templates/QuickLook"
import { ago, day, daysLeft, delta, money, renewalText } from "./format"
import { isCustomer, type CompanyView } from "./data"

/**
 * The two state words this object carries, said in the vocabulary the status set already knows.
 * The chip shows the company's own word — "Watch", "Do not prospect" — and takes its colour from
 * the meaning underneath it, so no page picks a hue (DESIGN.md §5).
 */
const BAND_STATUS: Record<string, string> = {
  Healthy: "live",
  Watch: "none",
  "At risk": "at risk",
}

const STAGE_STATUS: Record<string, string> = {
  "Current client": "live",
  "Active opportunity": "in progress",
  Cold: "none",
  Churned: "churned",
  "Do not prospect": "do not contact",
}

/** The health band as a chip: the word the account uses, coloured by what that word means. */
export function bandChip(band: string): ReactNode {
  return <Chip status={BAND_STATUS[band] ?? "none"}>{band}</Chip>
}

/** The company's stage as a chip, the same everywhere the stage appears. */
export function stageChip(stage: string): ReactNode {
  return <Chip status={STAGE_STATUS[stage] ?? "none"}>{stage}</Chip>
}

/** The health number, its band and its 30-day move, in one line of words. */
export function healthLine(health: number, band: string, delta30: number): string {
  return `${health} · ${band} · ${delta(delta30)}`
}

export function riskLine(v: CompanyView): string {
  const open = (v.account?.risks ?? []).filter((r) => !r.resolved)
  if (open.length === 0) return "None"
  const newest = [...open].sort((a, b) => (a.opened < b.opened ? 1 : -1))[0]
  return `${open.length} open · newest ${newest.type}${newest.type === "Churn notice" ? " — they have given notice" : ""}`
}

/** One field of the company's first level, and the usage item that decides where it goes. */
export interface CompanyField {
  key: string
  /** The item in `usage/companies.ts` that says whether this seat reads this field in a week. */
  usage: string
  label: string
  value: ReactNode
  /** A dependent value that never leaves this field: "you" under the owner, the stage's warning. */
  under?: ReactNode
  tone?: "warning"
  span?: 2
  wide?: boolean
  /**
   * The record draws this one as the section directly under the score rather than as a header
   * field — a score and the numbers that sum to it never sit on opposite sides of anything
   * (rule 5) — while the drawer and the pane draw it flat, in this position.
   */
  asSection?: boolean
}

/**
 * Every first-level field a company can carry, in the record's order.
 *
 * The customer-state fields exist only when the object is in a customer state; which of the rest
 * are level one is not decided here — `companyFirstLevel` asks the usage model, and the record page
 * asks the same question and puts the answer's level-2 fields inside its All fields door.
 */
export function companyFields(v: CompanyView, currency: string, user?: string): CompanyField[] {
  const c = v.company
  const a = v.account
  const customer = isCustomer(c) && Boolean(a)

  const ownerField: CompanyField = {
    key: "owner", usage: "rec.header", label: "Owner", value: c.owner,
    under: user && c.owner === user ? "you" : undefined,
  }

  const customerFieldSet: CompanyField[] = customer && a ? [
    {
      key: "health", usage: "rec.health", label: "Health",
      value: (
        <span className="inline-flex flex-wrap items-baseline gap-1.5">
          <span className="t-section tabular-nums">{a.health}</span>
          {bandChip(a.band)}
          <span className="t-small text-muted-foreground">{delta(a.healthDelta30)}</span>
        </span>
      ),
    },
    {
      key: "health-drivers", usage: "rec.health-drivers", label: "What makes up the score", asSection: true, wide: true,
      value: (
        <ul className="space-y-0.5">
          {a.drivers.map((x) => (
            <li key={x.label} className="flex justify-between gap-3">
              <span className="min-w-0">{x.label}</span>
              <span className="shrink-0 tabular-nums">{x.points > 0 ? "+" : ""}{x.points}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "renewal", usage: "rec.renewal", label: "Renewal",
      // Inside thirty days the date is a state, and the template paints a toned field from the
      // warning token; nothing here picks a colour.
      tone: daysLeft(a.renewal) >= 0 && daysLeft(a.renewal) < 30 ? "warning" : undefined,
      value: renewalText(a.renewal),
    },
    {
      key: "value", usage: "rec.renewal", label: "Contract value",
      value: <span><span className="tabular-nums">{money(a.value, currency)}</span> a year <span className="t-small text-muted-foreground">· {a.billing} billing</span></span>,
    },
    {
      key: "risks", usage: "rec.risks", label: "Open risks",
      tone: a.risks.some((r) => r.type === "Churn notice" && !r.resolved) ? "warning" : undefined,
      value: riskLine(v),
    },
    { key: "last-touch", usage: "rec.touches", label: "Last touch", value: `${day(a.lastTouch)} · ${ago(a.lastTouch)}` },
    { key: "champion", usage: "rec.contacts", label: "Champion", value: a.champion },
    ownerField,
    {
      key: "next-step", usage: "rec.next-step", label: "Next step", span: 2,
      value: <span>{a.nextStep.text} <span className="t-small text-muted-foreground">· {day(a.nextStep.due)}</span></span>,
    },
  ] : []

  return [
    ...customerFieldSet,
    {
      key: "stage", usage: "rec.header", label: "Stage", value: stageChip(c.stage),
      under: c.stage === "Do not prospect" ? `Sequences are stopped for the ${v.inSequence.length} contacts here` : undefined,
    },
    ...(customer ? [] : [ownerField]),
    { key: "contacts", usage: "rec.contacts", label: "Contacts held", value: <span className="tabular-nums">{v.contacts.length}</span> },
    { key: "in-sequence", usage: "rec.in-sequence", label: "Contacts in a sequence", value: <span className="tabular-nums">{v.inSequence.length}</span> },
    { key: "last-activity", usage: "rec.header", label: "Last activity", value: <span>{day(v.lastActivity)} <span className="t-small text-muted-foreground">· {ago(v.lastActivity)}</span></span> },
    { key: "open-deals", usage: "rec.deals", label: "Open deals", value: <span className="tabular-nums">{v.openDeals.length}</span> },
    { key: "industry", usage: "rec.details", label: "Industry", value: c.industry },
    { key: "employees", usage: "rec.details", label: "Employees", value: c.employees.toLocaleString() },
    { key: "location", usage: "rec.details", label: "Location", value: `${c.location.city}, ${c.location.country}` },
    { key: "founded", usage: "rec.details", label: "Founded", value: c.founded },
    { key: "description", usage: "rec.details", label: "What they do", wide: true, value: c.description },
  ]
}

/**
 * The first level for the seat that is signed in: the same list, in the same order, with the items
 * this seat does not read in a typical week left out. The drawer and the pane render this; the
 * record page renders the whole list and puts the rest inside its All fields door, which is the
 * same answer drawn two ways.
 */
export function companyFirstLevel(v: CompanyView, currency: string, level: (item: string) => 1 | 2, user?: string): CompanyField[] {
  return companyFields(v, currency, user).filter((f) => level(f.usage) === 1)
}

/** The drawer's and the pane's shape: label and value, nothing else. */
export function quickLookFields(v: CompanyView, currency: string, level: (item: string) => 1 | 2): QuickLookField[] {
  return [
    { label: "Company", value: <span>{v.company.name} <span className="t-small font-mono text-muted-foreground">{v.company.domain}</span></span> },
    ...companyFirstLevel(v, currency, level).map((f) => ({ label: f.label, value: f.value })),
  ]
}
