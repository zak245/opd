// Requests: the admin's intake queue, and the one place both kinds of ask are decided.
//
// A change request asks for something the workspace does not do yet; an upgrade request asks for
// something the plan does not carry. They share a queue because both are somebody asking the admin to
// change what other people see, and two queues for one decision is how an approval gets missed.
//
// Three columns are why this is a page and not a list: Waiting is somebody else's week, Affects is how
// many people feel the change, and Cost is the monthly total on an upgrade row before it is opened.
// Where nothing in the workspace is locked, the upgrade kind cannot occur and the Cost column is
// removed rather than shown empty.
import { useMemo, useState, type ReactNode } from "react"
import { Actions } from "../../ui/Actions"
import { Chip } from "../../ui/Identity"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { LegacyIndexPage as IndexPage, SummaryStrip } from "../../layouts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { href, navigate } from "@/app/router"
import { DoorGroup } from "../../ui/Door"
import { EmptyState } from "../../ui/EmptyState"
import { businessById } from "../../data/businesses"
import { seedFor, type Request } from "../../data/seed"
import type { Session } from "../../session"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

/** One column of the queue. The template draws the card, the toolbar and the pager around it. */
interface Column { key: string; header: string; className?: string; cell: (r: Request) => ReactNode }
import { businessDaysBetween, day, money, plural } from "./format"
import { toast } from "./state"
import { useFitColumns } from "../../layouts/columns"
import { MetaLine } from "../../layouts/MetaLine"

export const STATE_LABEL: Record<Request["state"], string> = {
  captured: "Needs a decision",
  investigating: "Investigating",
  approved: "Approved",
  shipped: "Shipped",
  verified: "Verifying",
  declined: "Declined",
}

const CHIP_ORDER: Request["state"][] = ["captured", "investigating", "approved", "shipped", "verified", "declined"]

/**
 * The six states, said in the five the product has (DESIGN.md §5). The word on screen stays the
 * queue's own; `statusOf` reads the word below it and picks the one colour that state means, so a
 * request looks the same here, on its record and in a chip.
 */
export const STATE_STATUS: Record<Request["state"], string> = {
  captured: "waiting",
  investigating: "in progress",
  approved: "approved",
  shipped: "done",
  verified: "running",
  declined: "declined",
}

/** Waiting time, in words, against the two-business-day answer target. Never colour alone. */
export function waitingOf(r: Request, targetDays: number) {
  const days = businessDaysBetween(r.raisedOn)
  const past = days - targetDays
  const d = days === 1 ? "1 day" : `${days} days`
  return { days, past: past > 0 ? past : 0, text: past > 0 ? `${d} · ${past} past the target` : days === 0 ? "under a business day" : d }
}

export function RequestsPage({ session }: { session: Session }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const target = seed.workspace.answerTarget.businessDays
  const all = seed.requests
  const hasUpgrades = all.some((r) => r.kind === "upgrade")

  const [chip, setChip] = useState<Request["state"] | "all">("all")
  const [requester, setRequester] = useState("all")
  const [owner, setOwner] = useState("all")
  const [touches, setTouches] = useState("all")
  const [kind, setKind] = useState("all")
  const [archived, setArchived] = useState("Open requests")
  const [investigated, setInvestigated] = useState<string[]>([])
  const [q, setQ] = useState("")
  const [limit, setLimit] = useState(15)

  const open = all.filter((r) => r.state !== "declined")
  const sorted = useMemo(() => {
    return [...all].sort((x, y) => {
      const px = waitingOf(x, target).past > 0 ? 0 : 1
      const py = waitingOf(y, target).past > 0 ? 0 : 1
      if (px !== py) return px - py
      return x.raisedOn.localeCompare(y.raisedOn)
    })
  }, [all, target])

  const rows = sorted.filter((r) => {
    if (chip !== "all" && r.state !== chip) return false
    if (requester !== "all" && r.requester.user !== requester) return false
    if (owner !== "all" && r.decisionOwner !== owner) return false
    if (touches !== "all" && !r.touches.some((t) => t.kind === touches)) return false
    if (kind !== "all" && r.kind !== kind) return false
    if (archived === "Open requests" && r.state === "declined") return false
    return true
  })

  const past = open.filter((r) => waitingOf(r, target).past > 0)
  const oldest = open.length ? open.reduce((a, r) => (r.raisedOn < a.raisedOn ? r : a)) : null
  const captured = all.filter((r) => r.state === "captured" && !investigated.includes(r.id))

  // The order the queue is read in: what was asked, how long it has waited, where it stands. The
  // three that decide are first, so the ones that overflow at a narrow width are the descriptive
  // ones and never the state.
  // Fold whatever does not fit the box the table is in (LAYOUTS.md §5, §6).
  const columns: Column[] = [
    {
      key: "outcome", header: "Request",
      cell: (r) => <a className="block max-w-[20rem] truncate underline-offset-4 hover:underline" title={r.outcome} href={href(`/ollopa/requests/${r.id}`)}>{r.outcome}</a>,
    },
    {
      key: "waiting", header: "Waiting",
      cell: (r) => {
        const w = waitingOf(r, target)
        return w.past > 0
          ? <Chip status="overdue">{w.text}</Chip>
          : <span className="whitespace-nowrap tabular-nums">{w.text}</span>
      },
    },
    { key: "state", header: "State", cell: (r) => <Chip status={STATE_STATUS[r.state]}>{STATE_LABEL[r.state]}</Chip> },
    { key: "owner", header: "Decides", cell: (r) => <span className="whitespace-nowrap">{r.decisionOwner}</span> },
    { key: "affects", header: "Affects", cell: (r) => <span className="tabular-nums">{r.affected.count}</span>, className: "text-right" },
    ...(hasUpgrades ? [{
      key: "cost", header: "Cost",
      cell: (r: Request) => (r.upgrade ? <span className="whitespace-nowrap tabular-nums">{money(r.upgrade.monthlyTotal)} a month</span> : <span className="text-muted-foreground">—</span>),
      className: "text-right",
    }] : []),
    { key: "kind", header: "Kind", cell: (r) => (r.kind === "upgrade" ? "Locked feature" : "Workspace change"), className: "whitespace-nowrap" },
    { key: "asked", header: "Asked by", cell: (r) => <span className="whitespace-nowrap">{r.requester.user}</span> },
    {
      key: "touches", header: "What it touches", className: "max-w-[12rem]",
      cell: (r) => (
        <span className="block truncate">
          {r.touches[0]?.name}{r.touches.length > 1 && <span className="text-muted-foreground"> +{r.touches.length - 1}</span>}
        </span>
      ),
    },
  ]
  // Fold whatever does not fit the box the table is in (LAYOUTS.md §5, §6).
  const fit = useFitColumns(columns)

  if (all.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="No requests"
          body="When somebody meets a locked feature, an area their seat does not hold, or a field that is not there, their ask arrives here with what they were trying to do."
        />
      </div>
    )
  }

  const search = q.trim().toLowerCase()
  const shown = rows.filter((r) => !search
    || `${r.outcome} ${r.requester.user} ${r.reasonText} ${r.touches.map((t) => t.name).join(" ")}`.toLowerCase().includes(search))
  const page = shown.slice(0, limit)

  const rowMenu = (r: Request) => [
    { label: "Open", kind: "secondary" as const, onClick: () => navigate(`/ollopa/requests/${r.id}`) },
    { label: r.state === "captured" ? "Approve to investigate" : "Hand over", kind: "secondary" as const,
      onClick: () => toast(r.state === "captured"
        ? `Approved to investigate. Nothing changes for anybody yet. ${r.requester.user} is told where they asked.`
        : `Hand ${r.outcome} to somebody else, with one line saying why. The waiting clock does not restart.`) },
    { label: "Decline with a reason", kind: "secondary" as const, onClick: () => toast(`Declining needs a reason. ${r.requester.user} reads it where they asked.`) },
    { label: "Merge with another request", kind: "secondary" as const, onClick: () => toast("Both requesters are kept and both are told. The older raised date wins.") },
    { label: "Archive", kind: "destructive" as const, onClick: () => toast(`${r.outcome} archived. The record, the reason and the history stay readable, and declined requests are kept for a year.`) },
  ]

  const pick = (label: string, value: string, set: (v: string) => void, options: { value: string; label: string }[]) => ({
    name: label,
    node: (
      <Select value={value} onValueChange={set}>
        <SelectTrigger className="w-48" aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    ),
  })

  return (
    <DoorGroup>
      {/* The Index type: the queue's toolbar and count in the card's header, the table above 640
          and the same requests as a divided list at 400, the pager in the card's footer. */}
      <IndexPage
        family="requests"
        title="Requests"
        count={all.length}
        description={`Sorted by what is past the ${target}-business-day answer target, then by how long it has waited.`}
        actions={[
          ...(captured.length > 0 ? [{
            label: `Approve ${captured.length} to investigate`, kind: "secondary" as const,
            onClick: () => { setInvestigated((v) => [...v, ...captured.map((r) => r.id)]); toast(`${captured.length} approved to investigate. Nothing changes for anybody yet.`) },
          }] : []),
          { label: "Export the queue", kind: "secondary" as const, onClick: () => toast(`Exported ${shown.length} requests as CSV.`) },
        ]}
        above={
          <>
            <SummaryStrip figures={[
              { label: "Waiting", value: open.length, note: "nothing here closes on its own" },
              { label: `Past ${target} business days`, value: past.length === 0 ? "None" : <Chip status="overdue">{past.length}</Chip> },
              ...(oldest ? [{ label: "Oldest", value: `${businessDaysBetween(oldest.raisedOn)} days`, note: oldest.requester.user }] : []),
            ]} />
            <ToggleGroup
              type="single" variant="outline" size="sm" aria-label="Filter by state"
              value={chip} onValueChange={(v) => setChip((v || "all") as typeof chip)} className="flex-wrap"
            >
              <ToggleGroupItem value="all">Everything ({all.length})</ToggleGroupItem>
              {CHIP_ORDER.map((st) => {
                const n = all.filter((r) => r.state === st).length
                if (n === 0) return null
                return <ToggleGroupItem key={st} value={st}>{STATE_LABEL[st]} ({n})</ToggleGroupItem>
              })}
            </ToggleGroup>
          </>
        }
        controls={[
          { name: "Search", always: true, node: (
            <Input aria-label="Search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
          ) },
          pick("Requester", requester, setRequester, [{ value: "all", label: "Requester: anyone" },
            ...[...new Set(all.map((r) => r.requester.user))].map((u) => ({ value: u, label: u }))]),
          pick("Decision owner", owner, setOwner, [{ value: "all", label: "Decision owner: anyone" },
            ...[...new Set(all.map((r) => r.decisionOwner))].map((u) => ({ value: u, label: u }))]),
          pick("What it touches", touches, setTouches, [{ value: "all", label: "Touches: anything" },
            ...[...new Set(all.flatMap((r) => r.touches.map((t) => t.kind)))].map((k) => ({ value: k, label: k }))]),
          pick("Kind", kind, setKind, [{ value: "all", label: "Kind: both" },
            { value: "change", label: "Workspace change" }, { value: "upgrade", label: "Locked feature" }]),
          pick("Archived", archived, setArchived, [{ value: "Open requests", label: "Open requests" },
            { value: "Everything, including declined", label: "Everything, including declined" }]),
        ]}
        shown={`${shown.length} shown of ${all.length}`}
        tableRef={fit.ref}
        table={
          <Table>
            <TableHeader>
              <TableRow>
                {fit.shown.map((c) => <TableHead key={c.key} className={c.className}>{c.header}</TableHead>)}
                <TableHead className="w-10"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {page.map((r) => (
                <TableRow key={r.id} data-item={r.id} data-item-label={r.outcome}>
                  {fit.shown.map((c, i) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.cell(r)}
                      {/* What did not fit reads here, under the row's own name. */}
                      {i === 0 && fit.folded.length > 0 && (
                        <MetaLine values={fit.folded.map((f) => ({ key: f.key, label: f.header, value: f.cell(r) }))} />
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right"><Actions surface="row" layout="menu" items={rowMenu(r)} /></TableCell>
                </TableRow>
              ))}
              {page.length === 0 && (
                <TableRow><TableCell colSpan={fit.shown.length + 1} className="t-body py-10 text-center text-muted-foreground">Nothing matches. Clear the search or a filter.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        }
        rows={page.map((r) => {
          const w = waitingOf(r, target)
          return (
            <div key={r.id} data-item={r.id} data-item-label={r.outcome} className="px-4 py-3">
              <a className="t-label underline-offset-4 hover:underline" href={href(`/ollopa/requests/${r.id}`)}>{r.outcome}</a>
              <p className="t-small mt-1 text-muted-foreground">
                {r.requester.user} · {r.kind === "upgrade" ? "a locked feature" : "a workspace change"}
              </p>
              <p className="t-body mt-1">{w.past > 0 ? <Chip status="overdue">{w.text}</Chip> : w.text}</p>
              <p className="t-body">
                {plural(r.affected.count, "person", "people")} feel it
                {r.upgrade && <> · {money(r.upgrade.monthlyTotal)} a month</>}
              </p>
              <p className="t-small mt-1 flex items-center gap-1.5 text-muted-foreground">
                <Chip status={STATE_STATUS[r.state]}>{STATE_LABEL[r.state]}</Chip>
                {r.decisionOwner} decides
              </p>
            </div>
          )
        })}
        pager={shown.length > limit ? (
          <Button variant="outline" size="sm" onClick={() => setLimit((l) => l + 15)}>
            Show {Math.min(15, shown.length - limit)} more
          </Button>
        ) : undefined}
      >
        <p className="t-small px-1 text-muted-foreground">
          {b.name} · a request is raised where the problem was met, never here.{" "}
          {hasUpgrades ? "An upgrade row carries its monthly total before it is opened." : `Nothing is locked on ${b.plan.name}, so the upgrade kind cannot occur here and its column is removed.`}
        </p>
      </IndexPage>
    </DoorGroup>
  )
}
