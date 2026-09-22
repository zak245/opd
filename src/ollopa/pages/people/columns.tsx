// The columns People can show, in display order, with what each one sorts by (spec 02 §3, "Columns").
//
// The default set for a seat is not written down anywhere: it is the columns the usage model puts at
// level one for that seat at that business, in this order. That is why the SDR, the AE, the marketer
// and the admin open the same page and see different columns without a mode, and why Ridgeline's SDR
// gets Signals and Last activity without a line of business logic. A column a business cannot fill —
// a CRM record with no CRM, a custom field nobody defined — is removed, not shown empty.
import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { day, sizeBand, type PersonRow } from "./person"
import type { FilterContext } from "./filters"

export interface ColumnDef {
  /** The usage item id, which decides whether the column is in the seat's default set. */
  id: string
  key: string
  header: string
  cell: (p: PersonRow) => ReactNode
  /** What a click on the header sorts by. Name is always the second key. */
  sort: (p: PersonRow) => string | number
  className?: string
  /** How wide the cell may grow before it truncates, so a wide value cannot push the row off-screen. */
  width?: string
  applies?: (ctx: FilterContext) => boolean
}

const dash = <span className="text-muted-foreground">—</span>

/** The five statuses, from the one token set (DESIGN.md §5); the chip always carries the word. */
const PAUSED = "[background-color:var(--paused-tint)] [color:var(--paused-ink)]"
export const STAGE_TONE: Record<string, string> = {
  Cold: PAUSED,
  Approaching: "[background-color:var(--info-tint)] [color:var(--info-ink)]",
  Replied: "[background-color:var(--info-tint)] [color:var(--info-ink)]",
  Interested: "[background-color:var(--success-tint)] [color:var(--success-ink)]",
  "Meeting booked": "[background-color:var(--success-tint)] [color:var(--success-ink)]",
  "Not interested": PAUSED,
  Unresponsive: PAUSED,
}

const EMAIL_TONE: Record<string, string> = {
  Verified: "text-muted-foreground",
  Guessed: "text-amber-700 dark:text-amber-400",
  Unverified: "text-amber-700 dark:text-amber-400",
  Bounced: "text-destructive",
}

/**
 * Name carries the title under it at comfortable density; at compact the title moves into the row's
 * accessible name and its tooltip instead, so the row halves without losing the second line's job.
 */
export function nameColumn(compact: boolean): ColumnDef {
  return {
    id: "people.col.name", key: "name", header: "Name", width: "max-w-[14rem]",
    sort: (p) => p.name,
    cell: (p) => (
      <span className="block min-w-0">
        <span className="block truncate font-medium" title={compact ? p.title : undefined}>{p.name}</span>
        {!compact && <span className="block truncate text-xs text-muted-foreground">{p.title}</span>}
      </span>
    ),
  }
}

export function columnsFor(ctx: FilterContext, compact: boolean): ColumnDef[] {
  const all: ColumnDef[] = [
    nameColumn(compact),
    { id: "people.col.company", key: "company", header: "Company", width: "max-w-[11rem] truncate", sort: (p) => p.company, cell: (p) => <span className="block truncate">{p.company}</span> },
    {
      id: "people.col.email", key: "email", header: "Email", sort: (p) => p.email, width: "max-w-[13rem]",
      cell: (p) => (
        <span className="block min-w-0 font-mono text-xs">
          <span className="block truncate">{p.email}</span>
          <span className={cn("block", EMAIL_TONE[p.emailStatus])}>{p.emailStatus}</span>
        </span>
      ),
    },
    { id: "people.col.stage", key: "stage", header: "Stage", sort: (p) => p.stage, cell: () => null },
    { id: "people.col.sequence", key: "sequence", header: "Sequence", width: "max-w-[10rem] truncate", sort: (p) => p.inSequence ?? "", cell: (p) => p.inSequence ?? dash },
    { id: "people.col.last-contacted", key: "lastContacted", header: "Last contacted", className: "tabular-nums", sort: (p) => p.lastContacted ?? "", cell: (p) => (p.lastContacted ? day(p.lastContacted) : dash) },
    { id: "people.col.last-activity", key: "lastActivity", header: "Last activity", className: "tabular-nums", sort: (p) => p.lastActivity, cell: (p) => day(p.lastActivity) },
    { id: "people.col.owner", key: "owner", header: "Owner", width: "max-w-[9rem] truncate", sort: (p) => p.owner, cell: (p) => <span className="block truncate">{p.owner}</span> },
    { id: "people.col.phone", key: "phone", header: "Phone", sort: (p) => (p.phoneRevealed ? 0 : p.phone ? 1 : 2), cell: () => null },
    {
      id: "people.col.signals", key: "signals", header: "Signals", sort: (p) => -p.signals.length, width: "max-w-[11rem]",
      cell: (p) => p.signals.length === 0 ? dash : (
        <span className="flex flex-wrap gap-1">{p.signals.map((s) => <Badge key={s.kind} variant="outline" title={`${s.kind} · ${s.detail}`} className="max-w-[9rem] font-normal"><span className="block w-full truncate">{s.kind}</span></Badge>)}</span>
      ),
    },
    { id: "people.col.score", key: "score", header: "Score", className: "tabular-nums", sort: (p) => -p.score, cell: (p) => p.score },
    { id: "people.col.location", key: "location", header: "Location", width: "max-w-[11rem] truncate", sort: (p) => p.location.city, cell: (p) => `${p.location.city}, ${p.location.country}` },
    { id: "people.col.lists", key: "lists", header: "Lists", width: "max-w-[12rem] truncate", sort: (p) => p.lists[0] ?? "", cell: (p) => (p.lists.length ? p.lists.join(", ") : dash) },
    { id: "people.col.seniority", key: "seniority", header: "Seniority", sort: (p) => p.seniority, cell: (p) => p.seniority },
    { id: "people.col.department", key: "department", header: "Department", sort: (p) => p.department, cell: (p) => p.department },
    { id: "people.col.company-size", key: "companySize", header: "Company size", sort: (p) => p.co?.employees ?? 0, cell: (p) => sizeBand(p.co?.employees) },
    { id: "people.col.industry", key: "industry", header: "Industry", sort: (p) => p.co?.industry ?? "", cell: (p) => p.co?.industry ?? dash },
    { id: "people.col.technologies", key: "technologies", header: "Technologies", width: "max-w-[12rem] truncate", sort: (p) => p.co?.technologies[0] ?? "", cell: (p) => (p.co?.technologies.length ? p.co.technologies.join(", ") : dash) },
    { id: "people.col.linkedin", key: "linkedin", header: "LinkedIn", sort: (p) => p.linkedin, cell: (p) => <a className="underline" href={`https://${p.linkedin}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Profile</a> },
    { id: "people.col.email-activity", key: "emailActivity", header: "Opens and replies", className: "tabular-nums", sort: (p) => -(p.opens + p.replies), cell: (p) => `${p.opens} · ${p.replies}` },
    { id: "people.col.job-change", key: "jobChange", header: "Job change", sort: (p) => (p.jobChange ? 0 : 1), cell: (p) => (p.jobChange ? `From ${p.jobChange.previousCompany}` : dash) },
    { id: "people.col.source", key: "source", header: "Source", sort: (p) => p.source, cell: (p) => p.source },
    { id: "people.col.created", key: "created", header: "Created", className: "tabular-nums", sort: (p) => p.addedOn, cell: (p) => day(p.addedOn) },
    {
      id: "people.col.crm", key: "crm", header: "CRM record", width: "max-w-[11rem] truncate", applies: (ctx) => Boolean(ctx.crm),
      sort: (p) => p.crmId ?? "", className: "font-mono text-xs",
      cell: (p) => (p.crmId ? `${p.crmId} · ${day(p.crmSyncedAt)}` : dash),
    },
    {
      id: "people.col.custom", key: "custom", header: "Custom fields", width: "max-w-[12rem] truncate",
      applies: (ctx) => ctx.seed.contacts.some((c) => Object.keys(c.custom).length > 0),
      sort: (p) => Object.values(p.custom)[0] ?? "",
      cell: (p) => (Object.keys(p.custom).length ? Object.entries(p.custom).map(([k, v]) => `${k}: ${v}`).join(" · ") : dash),
    },
    { id: "people.col.timezone", key: "timezone", header: "Time zone", sort: (p) => p.tz, cell: (p) => p.tz },
  ]
  return all.filter((c) => !c.applies || c.applies(ctx))
}
