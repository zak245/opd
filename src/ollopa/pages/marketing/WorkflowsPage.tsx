// Workflows (`P-workflows`): the trigger-rule-action chains that route what arrives.
//
// Three columns make this a page rather than a list — past the SLA window, could not route, and the
// credit ceiling with today's spend — and each of them is a link into the record, already at the block
// it names, because a count that leads nowhere is a decoration. The page is on Growth, and the lock
// sits at the entry point with the table's real shape and its real count behind it, never after
// somebody has built a rule they cannot keep.
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { href, useRoute } from "@/app/router"
import { follow, type Origin } from "../../chain"
import { useEdits } from "../../edits"
import { Actions } from "../../ui/Actions"
import { LegacyIndexPage as IndexPage, type ToolbarControl } from "../../layouts"
import { Chip, FamilyIcon } from "../../ui/Identity"
import { familyOf } from "../../identity"
import { FAMILY, ink } from "./look"
import { TableCard, useTick } from "../engage/shared"
import { ActedNote, undoable } from "./acted"
import { toast } from "../../templates/TablePage"
import { Door } from "../../ui/Door"
import { EmptyState } from "../../ui/EmptyState"
import { Locked } from "../../ui/Locked"
import { gate } from "../../ui/gate"
import { businessById } from "../../data/businesses"
import { TODAY, seedFor, type Workflow } from "../../data/seed"
import type { Session } from "../../session"
import { useGrid, type GridColumn } from "./grid"
import { breachedRows, enrolled7d, notRoutedRuns, runsOf } from "./derive"
import { ago, day, num } from "./format"
import { patchRow, addRow, useMarketing } from "./store"

const COLUMN_NAMES = ["Workflow", "Trigger", "Status", "Enrolled, 7 days", "Past the SLA window", "Could not route", "Credit ceiling and spend today", "Owner", "Last edited"]

export function WorkflowsPage({ session }: { session: Session }) {
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const rows = useMarketing(session.business)
  const lock = gate("workflows", session.business)
  const admin = b.roles.find((r) => r.role === "admin")?.user ?? "your admin"
  const route = useRoute()
  // What a pane's actions did to these workflows this session, from the one store every page reads.
  const workflowEdits = useEdits("workflow")
  useTick(Object.values(workflowEdits).some(undoable))

  /**
   * The one way off this page. Opening a row is a step in a chain, not a jump: the trail keeps
   * "Workflows" and the row that was left, so the crumb back lands on it, lit and focused.
   */
  const from = (anchor?: string): Origin => ({ route: route.raw, title: "Workflows", anchor })
  const open = (to: string, anchor: string) => follow(to, from(anchor))

  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [trigger, setTrigger] = useState("all")
  const [owner, setOwner] = useState("all")
  const [folder, setFolder] = useState("all")
  const [archived, setArchived] = useState("all")

  const on = rows.workflows.filter((w) => w.status === "on").length
  const off = rows.workflows.length - on

  const stats = useMemo(() => {
    const map = new Map<string, { enrolled: number; breached: number; notRouted: number }>()
    for (const w of rows.workflows) {
      const runs = runsOf(seed.workflowRuns, w.id)
      map.set(w.id, { enrolled: enrolled7d(runs), breached: w.sla?.breachedToday ?? 0, notRouted: notRoutedRuns(runs).length })
    }
    return map
  }, [rows.workflows, seed.workflowRuns])

  const filtered = rows.workflows.filter((w) => {
    const needle = q.trim().toLowerCase()
    if (needle && !`${w.name} ${w.trigger} ${w.rules.map((r) => `${r.condition} ${r.action}`).join(" ")}`.toLowerCase().includes(needle)) return false
    if (status !== "all" && w.status !== (status === "On" ? "on" : "off")) return false
    if (trigger !== "all" && w.trigger !== trigger) return false
    if (owner !== "all" && w.owner !== owner) return false
    if (folder !== "all" && (w.folder ?? "No folder") !== folder) return false
    return true
  })

  /* --------------------------------------------------------------- the Starter state: a real lock */

  if (lock.locked) {
    return (
      <IndexPage
        family={FAMILY}
        title="Workflows"
        count={rows.workflows.length}
        description="Route what arrives — a form submission, a score crossing its threshold, a new contact — to a person, a list or a sequence."
        above={
          <div className="flex flex-wrap items-center gap-3">
            <Locked feature="Workflows" plan={lock.plan} pricePerMonth={lock.pricePerMonth} what={lock.what}>
              <Actions surface="page" items={[{ kind: "primary", label: "Create a workflow" }]} />
            </Locked>
            <span className="t-body text-muted-foreground">
              Without it: assign an owner by hand from People, and route by saved view.
            </span>
          </div>
        }
        /* The real shape and the real count, values withheld — never a screenshot and never a chart. */
        table={
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>{COLUMN_NAMES.map((c) => <TableHead key={c} className="t-label">{c}</TableHead>)}</TableRow></TableHeader>
              <TableBody>
                {rows.workflows.length === 0 ? (
                  <TableRow><TableCell colSpan={COLUMN_NAMES.length} className="t-body py-10 text-center text-muted-foreground">No workflows yet. The first one anybody creates puts this page in the sidebar.</TableCell></TableRow>
                ) : rows.workflows.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.name}</TableCell>
                    {COLUMN_NAMES.slice(1, -1).map((c) => <TableCell key={c} className="text-muted-foreground">—</TableCell>)}
                    <TableCell><Badge variant="secondary">{lock.plan}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        }
        rows={
          <>
            {rows.workflows.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-2 px-4 py-3">
                <span className="t-body min-w-0 truncate font-medium">{w.name}</span>
                <Badge variant="secondary">{lock.plan}</Badge>
              </div>
            ))}
            {rows.workflows.length === 0 && (
              <p className="t-body px-4 py-8 text-center text-muted-foreground">No workflows yet. The first one anybody creates puts this page in the sidebar.</p>
            )}
          </>
        }
      />
    )
  }

  /* -------------------------------------------------------------------------------- the columns */

  const columns: GridColumn<Workflow>[] = [
    // The name is the control, as it is on People: one thing to tab to, one thing to press.
    { key: "name", header: "Workflow", sortBy: (w) => w.name, className: "min-w-[10rem] whitespace-normal", cell: (w) => (
      <div className="min-w-0">
        <a href={href(`/ollopa/workflows/${w.id}`)} className="font-medium hover:underline" onClick={(ev) => { ev.stopPropagation(); if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); open(`/ollopa/workflows/${w.id}`, w.id) } }}>{w.name}</a>
        {w.folder && <div className="text-xs text-muted-foreground">{w.folder}</div>}
        <ActedNote business={session.business} kind="workflow" id={w.id} edit={workflowEdits[w.id]} />
      </div>
    ) },
    { key: "trigger", header: "Trigger", sortBy: (w) => w.trigger, className: "min-w-[9rem] whitespace-normal", cell: (w) => <span className="text-sm">When {w.trigger}</span> },
    { key: "status", header: "Status", sortBy: (w) => w.status, className: "min-w-[7rem] whitespace-normal", cell: (w) => (
      <div className="min-w-0">
        <Chip status={w.status === "on" ? "active" : "off"}>{w.status === "on" ? "On" : "Off"}</Chip>
        <div className="t-small text-muted-foreground">{w.statusChangedBy}, {ago(w.statusChangedOn)}</div>
      </div>
    ) },
    { key: "enrolled", header: "Enrolled, 7 days", sortBy: (w) => stats.get(w.id)?.enrolled ?? 0, className: "tabular-nums", cell: (w) => num(stats.get(w.id)?.enrolled ?? 0) },
    { key: "breached", header: "Past the SLA window", sortBy: (w) => stats.get(w.id)?.breached ?? 0, className: "min-w-[8rem] whitespace-normal", cell: (w) => {
      const n = stats.get(w.id)?.breached ?? 0
      if (!w.sla) return <span className="text-muted-foreground">No clock on this one</span>
      return n === 0
        ? <span className="tabular-nums text-muted-foreground">0</span>
        : <a className="font-medium tabular-nums underline" style={ink("danger")} href={href(`/ollopa/workflows/${w.id}?at=sla`)} onClick={(ev) => { ev.stopPropagation(); if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); open(`/ollopa/workflows/${w.id}?at=sla`, w.id) } }}>{num(n)} past {w.sla.windows.hot}</a>
    } },
    { key: "notRouted", header: "Could not route", sortBy: (w) => stats.get(w.id)?.notRouted ?? 0, cell: (w) => {
      const n = stats.get(w.id)?.notRouted ?? 0
      return n === 0
        ? <span className="tabular-nums text-muted-foreground">0</span>
        : <a className="font-medium tabular-nums underline" style={ink("danger")} href={href(`/ollopa/workflows/${w.id}?at=runs`)} onClick={(ev) => { ev.stopPropagation(); if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); open(`/ollopa/workflows/${w.id}?at=runs`, w.id) } }}>{num(n)}</a>
    } },
    { key: "ceiling", header: "Credit ceiling and spend today", sortBy: (w) => w.ceiling.spentToday, className: "min-w-[9rem]", cell: (w) => (
      <a
        href={href(`/ollopa/workflows/${w.id}?at=ceiling`)}
        className={cn("tabular-nums underline", w.ceiling.spentToday >= w.ceiling.perDay && "font-medium")}
        style={w.ceiling.spentToday >= w.ceiling.perDay ? ink("warning") : undefined}
        onClick={(ev) => { ev.stopPropagation(); if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); open(`/ollopa/workflows/${w.id}?at=ceiling`, w.id) } }}
      >
        {num(w.ceiling.spentToday)} of {num(w.ceiling.perDay)} a day
      </a>
    ) },
    { key: "owner", header: "Owner", sortBy: (w) => w.owner, cell: (w) => w.owner },
    { key: "edited", header: "Last edited", sortBy: (w) => w.editedOn, cell: (w) => <span className="text-xs">{w.editedBy}<br />{day(w.editedOn)}</span> },
  ]

  const secondary = [
    { key: "trigger", label: "Trigger", value: trigger, set: setTrigger, options: [...new Set(rows.workflows.map((w) => w.trigger))] },
    { key: "owner", label: "Owner", value: owner, set: setOwner, options: [...new Set(rows.workflows.map((w) => w.owner))] },
    { key: "folder", label: "Folder", value: folder, set: setFolder, options: [...new Set(rows.workflows.map((w) => w.folder ?? "No folder"))] },
    { key: "archived", label: "Archived", value: archived, set: setArchived, options: ["Archived only", "Not archived"] },
  ]
  const activeBehind = secondary.filter((f) => f.value !== "all").length

  const create = () => {
    const w: Workflow = {
      id: `wf-new-${Date.now().toString(36)}`, name: "Untitled workflow", owner: session.user, status: "off",
      statusChangedBy: session.user, statusChangedOn: TODAY, createdOn: TODAY, editedBy: session.user, editedOn: TODAY, folder: null,
      trigger: "a form is submitted", enrolment: [],
      rules: [{ id: "new-r1", condition: "Always", action: "create a task", config: "Call task, due in 2 hours" }],
      routing: null, sla: null,
      ceiling: { perDay: 200, perRun: 25, spentToday: 0 },
      limits: { perDay: 100, reEnrol: false, maxPerPerson: 1 },
      hours: { from: "08:00", to: "18:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], clockPauses: true },
      suppress: ["Do not contact", "Unsubscribed"],
    }
    addRow(session.business, "workflows", w)
    toast("Workflow created, off. Nothing runs until you turn it on.")
    open(`/ollopa/workflows/${w.id}`, w.id)
  }

  /* -------------------------------------------------------------------------------- the bodies */

  // One grid, two bodies: the table for the desktop and the same rows as a divided list for 400.
  // The page sets no width and draws no phone branch of its own (LAYOUTS.md §5).
  const grid = useGrid<Workflow>({
    id: "workflows",
    rows: filtered,
    rowKey: (w) => w.id,
    columns,
    // The order the page is read in: what has breached, then what could not be routed, then name.
    defaultSort: { key: "breached", dir: "desc" },
    actions: (w) => [{
      label: w.status === "on" ? "Turn off" : "Turn on",
      onClick: () => {
        const runs = runsOf(seed.workflowRuns, w.id)
        patchRow(session.business, "workflows", w.id, { status: w.status === "on" ? "off" : "on", statusChangedBy: session.user, statusChangedOn: TODAY })
        toast(w.status === "on"
          ? `${w.name} stops enrolling. The ${num(breachedRows(w, runs).length + (w.sla?.running ?? 0))} people already running finish their steps.`
          : `${w.name} is on. It enrols up to ${num(w.limits.perDay)} people a day; the rest wait.`)
      },
    }],
    menu: (w) => [
      { label: "Open", onClick: () => open(`/ollopa/workflows/${w.id}`, w.id) },
      { label: "Test on one record", onClick: () => open(`/ollopa/workflows/${w.id}?open=test`, w.id) },
      { label: "Duplicate", onClick: () => {
        const copy: Workflow = { ...w, id: `${w.id}-copy-${Date.now().toString(36)}`, name: `${w.name} (copy)`, status: "off", statusChangedBy: session.user, statusChangedOn: TODAY, ceiling: { ...w.ceiling, spentToday: 0 }, sla: w.sla ? { ...w.sla, running: 0, breachedToday: 0 } : null }
        addRow(session.business, "workflows", copy)
        toast(`${copy.name} created, off. The copy does not carry the run history or the enrolments.`)
      } },
      { label: "Archive", destructive: true, separatorBefore: true, onClick: () => toast(`${w.name} archived. It stops enrolling for good; the run history is kept and the rule stays readable.`) },
    ],
    menuName: "Open, test on one record, duplicate, archive",
    onOpen: (w) => open(`/ollopa/workflows/${w.id}`, w.id),
    rowLabel: (w) => w.name,
    cardTitle: (w) => <span className="font-medium">{w.name}</span>,
    empty: (
      <EmptyState
        title="No workflows"
        body="A workflow routes what arrives — a form submission, a score crossing its threshold, a new contact — to a person, a list or a sequence."
        action={<Actions surface="card" items={[{ kind: "primary", label: "Create a workflow", onClick: create }]} />}
      />
    ),
  })

  /* ------------------------------------------------------------------------------- the toolbar */

  // The template keeps five in front and puts the rest behind one door it labels itself.
  const controls: ToolbarControl[] = [
    {
      name: "Search",
      always: true,
      node: <Input aria-label="Search workflows, triggers and rules" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-56" />,
    },
    {
      name: "Status",
      node: (
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="t-small h-8 w-40" aria-label="Status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">On ({on}) · Off ({off})</SelectItem>
            <SelectItem value="On">On ({on})</SelectItem>
            <SelectItem value="Off">Off ({off})</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      name: "Folder",
      node: (
        <Select value={folder} onValueChange={setFolder}>
          <SelectTrigger className="t-small h-8 w-40" aria-label="Folder"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Folder: all</SelectItem>
            {[...new Set(rows.workflows.map((w) => w.folder ?? "No folder"))].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      ),
    },
    ...secondary.map((f) => ({
      name: f.label,
      node: (
        <Select value={f.value} onValueChange={f.set}>
          <SelectTrigger className="t-small h-8 w-44" aria-label={f.label}><SelectValue placeholder={f.label} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{f.label}: all</SelectItem>
            {f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      ),
    })),
  ]

  /* -------------------------------------------------------------------------------- the render */

  return (
    <IndexPage
      family={FAMILY}
      title="Workflows"
      count={rows.workflows.length}
      description="Which rule is firing, on whom, and what it is about to cost."
      actions={[{ kind: "primary", label: "Create a workflow", onClick: create }]}
      controls={rows.workflows.length === 0 ? undefined : controls}
      shown={filtered.length === rows.workflows.length ? num(rows.workflows.length) : `${num(filtered.length)} shown of ${num(rows.workflows.length)}`}
      table={grid.table}
      rows={grid.rows}
    >
      {session.role !== "admin" && (
        <p className="t-small text-muted-foreground">
          Territories and permission profiles are the admin's: {admin} sets them in Settings › Team and access.
        </p>
      )}
    </IndexPage>
  )
}
