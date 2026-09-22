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
import { Fragment, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Actions } from "../../ui/Actions"
import { Chip } from "../../ui/Identity"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Container } from "../../ui/Section"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { href, navigate } from "@/app/router"
import { Door, DoorGroup } from "../../ui/Door"
import { EmptyState } from "../../ui/EmptyState"
import { businessById } from "../../data/businesses"
import { seedFor, type Request } from "../../data/seed"
import type { Session } from "../../session"
import { TablePage, type Column } from "../../templates/TablePage"
import { businessDaysBetween, day, money, plural } from "./format"
import { toast } from "./state"

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

  const columns: Column<Request>[] = [
    {
      key: "outcome", header: "Request",
      cell: (r) => <a className="block max-w-[20rem] truncate underline-offset-4 hover:underline" title={r.outcome} href={href(`/ollopa/requests/${r.id}`)}>{r.outcome}</a>,
    },
    { key: "kind", header: "Kind", cell: (r) => (r.kind === "upgrade" ? "Locked feature" : "Workspace change"), className: "whitespace-nowrap" },
    { key: "asked", header: "Asked by", cell: (r) => <span className="whitespace-nowrap">{r.requester.user}</span> },
    {
      key: "waiting", header: "Waiting",
      cell: (r) => {
        const w = waitingOf(r, target)
        return w.past > 0
          ? <Chip status="overdue">{w.text}</Chip>
          : <span className="whitespace-nowrap tabular-nums">{w.text}</span>
      },
    },
    {
      key: "touches", header: "What it touches", className: "max-w-[12rem]",
      cell: (r) => (
        <span className="block truncate">
          {r.touches[0]?.name}{r.touches.length > 1 && <span className="text-muted-foreground"> +{r.touches.length - 1}</span>}
        </span>
      ),
    },
    { key: "affects", header: "Affects", cell: (r) => <span className="tabular-nums">{r.affected.count}</span>, className: "text-right" },
    ...(hasUpgrades ? [{
      key: "cost", header: "Cost",
      cell: (r: Request) => (r.upgrade ? <span className="whitespace-nowrap tabular-nums">{money(r.upgrade.monthlyTotal)} a month</span> : <span className="text-muted-foreground">—</span>),
      className: "text-right",
    }] : []),
    { key: "owner", header: "Decides", cell: (r) => <span className="whitespace-nowrap">{r.decisionOwner}</span> },
    { key: "state", header: "State", cell: (r) => <Chip status={STATE_STATUS[r.state]}>{STATE_LABEL[r.state]}</Chip> },
  ]

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

  return (
    <div className="block sm:flex sm:h-full sm:flex-col">
      <DoorGroup>
        <div className="shrink-0 px-4 pt-5 sm:px-6">
          <Card><CardContent className="py-3">
          <p className="t-body">
            <strong className="font-semibold">{plural(open.length, "waiting", "waiting")}</strong>
            {" · "}
            {past.length === 0
              ? <span>none past {target} business days</span>
              : <Chip status="overdue">{past.length} past {target} business days</Chip>}
            {oldest && <> · oldest {businessDaysBetween(oldest.raisedOn)} days ({oldest.requester.user})</>}
          </p>
          <p className="t-small mt-0.5 text-muted-foreground">Nothing here closes on its own.</p>
          </CardContent></Card>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              aria-label="Filter by state"
              value={chip}
              onValueChange={(v) => setChip((v || "all") as typeof chip)}
              className="flex-wrap"
            >
              <ToggleGroupItem value="all">Everything ({all.length})</ToggleGroupItem>
              {CHIP_ORDER.map((s) => {
                const n = all.filter((r) => r.state === s).length
                if (n === 0) return null
                return <ToggleGroupItem key={s} value={s}>{STATE_LABEL[s]} ({n})</ToggleGroupItem>
              })}
            </ToggleGroup>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {captured.length > 0 && (
              <Actions surface="card" items={[{
                label: `Approve ${captured.length} to investigate`, kind: "secondary",
                onClick: () => { setInvestigated((v) => [...v, ...captured.map((r) => r.id)]); toast(`${captured.length} approved to investigate. Nothing changes for anybody yet.`) },
              }]} />
            )}
            <span className="flex-1" />
            <Actions surface="card" items={[{ label: "Export the queue", kind: "secondary", onClick: () => toast(`Exported ${rows.length} requests as CSV.`) }]} />
          </div>

          <div className="mt-2">
            <Door id="requests.filters" label="Additional filters: requester, decision owner, what it touches, kind, archived" count={5}>
              <div className="flex flex-wrap gap-2 py-1">
                <Select value={requester} onValueChange={setRequester}>
                  <SelectTrigger className="h-8 w-48" aria-label="Requester"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Requester: anyone</SelectItem>
                    {[...new Set(all.map((r) => r.requester.user))].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={owner} onValueChange={setOwner}>
                  <SelectTrigger className="h-8 w-48" aria-label="Decision owner"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Decision owner: anyone</SelectItem>
                    {[...new Set(all.map((r) => r.decisionOwner))].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={touches} onValueChange={setTouches}>
                  <SelectTrigger className="h-8 w-48" aria-label="What it touches"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Touches: anything</SelectItem>
                    {[...new Set(all.flatMap((r) => r.touches.map((t) => t.kind)))].map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={kind} onValueChange={setKind}>
                  <SelectTrigger className="h-8 w-44" aria-label="Kind"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Kind: both</SelectItem>
                    <SelectItem value="change">Workspace change</SelectItem>
                    <SelectItem value="upgrade">Locked feature</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={archived} onValueChange={setArchived}>
                  <SelectTrigger className="h-8 w-52" aria-label="Archived"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open requests">Open requests</SelectItem>
                    <SelectItem value="Everything, including declined">Everything, including declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Door>
          </div>
        </div>

        {/* At phone width the table becomes cards carrying the outcome, the waiting time, the
            affected count, the cost where there is one, and the state. Nothing changes level. */}
        <div className="px-4 pb-6 pt-4 sm:hidden">
        <Container component="list" heading="The queue" count={`${rows.length} shown of ${all.length}`} padded={false} bodyClassName="px-0">
        <ul>
          {rows.map((r, i) => {
            const w = waitingOf(r, target)
            return (
              <Fragment key={r.id}>
              {i > 0 && <Separator />}
              <li className="px-4 py-3">
                <a className="text-sm font-medium underline-offset-4 hover:underline" href={href(`/ollopa/requests/${r.id}`)}>{r.outcome}</a>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.requester.user} · {r.kind === "upgrade" ? "a locked feature" : "a workspace change"}
                </p>
                <p className="t-body mt-1">{w.past > 0 ? <Chip status="overdue">{w.text}</Chip> : w.text}</p>
                <p className="text-sm">
                  {plural(r.affected.count, "person", "people")} feel it
                  {r.upgrade && <> · {money(r.upgrade.monthlyTotal)} a month</>}
                </p>
                <p className="t-small mt-1 flex items-center gap-1.5 text-muted-foreground">
                  <Chip status={STATE_STATUS[r.state]}>{STATE_LABEL[r.state]}</Chip>
                  {r.decisionOwner} decides
                </p>
              </li>
              </Fragment>
            )
          })}
        </ul>
        </Container>
        </div>

        <div className="hidden min-h-0 flex-1 sm:block">
          <TablePage<Request>
            family="requests"
            title="The queue"
            description={`Sorted by what is past the ${target}-business-day answer target, then by how long it has waited.`}
            rows={rows}
            total={all.length}
            rowKey={(r) => r.id}
            columns={columns}
            searchText={(r) => `${r.outcome} ${r.requester.user} ${r.reasonText} ${r.touches.map((t) => t.name).join(" ")}`}
            rowActions={[
              { label: "Open", onClick: (r) => navigate(`/ollopa/requests/${r.id}`) },
              { label: (r) => (r.state === "captured" ? "Approve to investigate" : "Hand over"), onClick: (r) => toast(r.state === "captured" ? `Approved to investigate. Nothing changes for anybody yet. ${r.requester.user} is told where they asked.` : `Hand ${r.outcome} to somebody else, with one line saying why. The waiting clock does not restart.`) },
            ]}
            moreActions={[
              { label: "Decline with a reason", onClick: (r) => toast(`Declining needs a reason. ${r.requester.user} reads it where they asked.`) },
              { label: "Merge with another request", onClick: () => toast("Both requesters are kept and both are told. The older raised date wins.") },
              { label: "Archive", onClick: (r) => toast(`${r.outcome} archived. The record, the reason and the history stay readable, and declined requests are kept for a year.`) },
            ]}
            pageSize={15}
          />
        </div>
      </DoorGroup>
      <Separator />
      <p className="t-small shrink-0 px-4 py-2 text-muted-foreground sm:px-6">
        {b.name} · a request is raised where the problem was met, never here.{" "}
        {hasUpgrades ? "An upgrade row carries its monthly total before it is opened." : `Nothing is locked on ${b.plan.name}, so the upgrade kind cannot occur here and its column is removed.`}
      </p>
    </div>
  )
}

export { day }
