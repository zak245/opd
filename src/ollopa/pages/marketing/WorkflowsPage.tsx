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
import { IndexPage, LegacyIndexPage, type IndexColumn } from "../../layouts"
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
      <LegacyIndexPage
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

  const columns: IndexColumn<Workflow>[] = [
    { key: "status", header: "Status", priority: 1, cell: (w) => (
      <Chip status={w.status === "on" ? "active" : "off"}>{w.status === "on" ? "On" : "Off"}</Chip>
    ) },
    { key: "enrolled", header: "Enrolled 7d", priority: 2, numeric: true, cell: (w) => num(stats.get(w.id)?.enrolled ?? 0) },
    { key: "breached", header: "Past the SLA", priority: 1, cell: (w) => {
      const n = stats.get(w.id)?.breached ?? 0
      if (!w.sla) return <span className="text-muted-foreground">No clock</span>
      return n === 0
        ? <span className="tabular-nums text-muted-foreground">0</span>
        : <a className="font-medium tabular-nums underline" style={ink("danger")} href={href(`/ollopa/workflows/${w.id}?at=sla`)} onClick={(ev) => { ev.stopPropagation(); if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); open(`/ollopa/workflows/${w.id}?at=sla`, w.id) } }}>{num(n)} past {w.sla.windows.hot}</a>
    } },
    { key: "notRouted", header: "Not routed", priority: 1, cell: (w) => {
      const n = stats.get(w.id)?.notRouted ?? 0
      return n === 0
        ? <span className="tabular-nums text-muted-foreground">0</span>
        : <a className="font-medium tabular-nums underline" style={ink("danger")} href={href(`/ollopa/workflows/${w.id}?at=runs`)} onClick={(ev) => { ev.stopPropagation(); if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); open(`/ollopa/workflows/${w.id}?at=runs`, w.id) } }}>{num(n)}</a>
    } },
    { key: "ceiling", header: "Ceiling today", priority: 2, cell: (w) => (
      <a
        href={href(`/ollopa/workflows/${w.id}?at=ceiling`)}
        className={cn("tabular-nums underline", w.ceiling.spentToday >= w.ceiling.perDay && "font-medium")}
        style={w.ceiling.spentToday >= w.ceiling.perDay ? ink("warning") : undefined}
        onClick={(ev) => { ev.stopPropagation(); if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); open(`/ollopa/workflows/${w.id}?at=ceiling`, w.id) } }}
      >
        {num(w.ceiling.spentToday)} of {num(w.ceiling.perDay)}
      </a>
    ) },
    { key: "owner", header: "Owner", priority: 2, cell: (w) => w.owner },
  ]

  /* -------------------------------------------------------------------------------- the render */

  /** A named filter that says what it is set to, so the count can always be accounted for. */
  const pick = (name: string, value: string, set: (v: string) => void, options: { value: string; label: string }[]) => ({
    name,
    value: value === "all" ? undefined : value,
    onClear: () => set("all"),
    node: (
      <Select value={value} onValueChange={set}>
        <SelectTrigger className="w-44" aria-label={name}><SelectValue placeholder={name} /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    ),
  })

  const rowMenu = (w: Workflow) => [
    { label: w.status === "on" ? "Turn off" : "Turn on", kind: "secondary" as const, onClick: () => {
      const runs = runsOf(seed.workflowRuns, w.id)
      patchRow(session.business, "workflows", w.id, { status: w.status === "on" ? "off" : "on", statusChangedBy: session.user, statusChangedOn: TODAY })
      toast(w.status === "on"
        ? `${w.name} stops enrolling. The ${num(breachedRows(w, runs).length + (w.sla?.running ?? 0))} people already running finish their steps.`
        : `${w.name} is on. It enrols up to ${num(w.limits.perDay)} people a day; the rest wait.`)
    } },
    { label: "Open the page", kind: "secondary" as const, onClick: () => open(`/ollopa/workflows/${w.id}`, w.id) },
    { label: "Test on one record", kind: "secondary" as const, onClick: () => open(`/ollopa/workflows/${w.id}?open=test`, w.id) },
    { label: "Duplicate", kind: "secondary" as const, onClick: () => {
      const copy: Workflow = { ...w, id: `${w.id}-copy-${Date.now().toString(36)}`, name: `${w.name} (copy)`, status: "off", statusChangedBy: session.user, statusChangedOn: TODAY, ceiling: { ...w.ceiling, spentToday: 0 }, sla: w.sla ? { ...w.sla, running: 0, breachedToday: 0 } : null }
      addRow(session.business, "workflows", copy)
      toast(`${copy.name} created, off. The copy does not carry the run history or the enrolments.`)
    } },
    { label: "Archive", kind: "destructive" as const, onClick: () => toast(`${w.name} archived. It stops enrolling for good; the run history is kept and the rule stays readable.`) },
  ]

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

  return (
    <IndexPage
      family={FAMILY}
      title="Workflows"
      count={rows.workflows.length}
      description="Which rule is firing, on whom, and what it is about to cost."
      actions={[{ kind: "primary", label: "Create a workflow", onClick: create }]}
      filters={rows.workflows.length === 0 ? undefined : {
        search: { value: q, onChange: setQ, placeholder: "Search workflows, triggers and rules" },
        controls: [
          pick("Status", status, setStatus, [
            { value: "all", label: `On (${on}) · Off (${off})` },
            { value: "On", label: `On (${on})` },
            { value: "Off", label: `Off (${off})` },
          ]),
          pick("Trigger", trigger, setTrigger, [{ value: "all", label: "Trigger: all" },
            ...[...new Set(rows.workflows.map((w) => w.trigger))].map((o) => ({ value: o, label: o }))]),
          pick("Owner", owner, setOwner, [{ value: "all", label: "Owner: all" },
            ...[...new Set(rows.workflows.map((w) => w.owner))].map((o) => ({ value: o, label: o }))]),
        ],
        behind: [
          { ...pick("Folder", folder, setFolder, [{ value: "all", label: "Folder: all" },
            ...[...new Set(rows.workflows.map((w) => w.folder ?? "No folder"))].map((o) => ({ value: o, label: o }))]), group: "filters" as const },
          { ...pick("Archived", archived, setArchived, [{ value: "all", label: "Archived: not archived" },
            { value: "Archived only", label: "Archived only" }, { value: "Not archived", label: "Not archived" }]), group: "filters" as const },
        ],
        count: { shown: filtered.length, total: rows.workflows.length, noun: "workflows" },
        onClearAll: () => { setQ(""); setStatus("all"); setTrigger("all"); setOwner("all"); setFolder("all"); setArchived("all") },
        doorId: "workflows.filters",
      }}
      beside={(w) => ({ kind: "workflow", id: w.id })}
      columns={columns}
      rows={filtered}
      rowKey={(w) => w.id}
      rowProps={(w) => ({ "data-item": w.id, "data-item-label": w.name })}
      name={(w) => (
        <>
          <a href={href(`/ollopa/workflows/${w.id}`)} className="min-w-0 truncate font-medium hover:underline">{w.name}</a>
          <span className="t-small shrink-0 text-muted-foreground">When {w.trigger}{w.folder ? ` · ${w.folder}` : ""}</span>
          <ActedNote business={session.business} kind="workflow" id={w.id} edit={workflowEdits[w.id]} />
        </>
      )}
      menu={(w) => <Actions surface="row" layout="menu" menuLabel={w.name} items={rowMenu(w)} />}
      empty={
        <EmptyState
          title="No workflows"
          body="A workflow routes what arrives — a form submission, a score crossing its threshold, a new contact — to a person, a list or a sequence."
          action={<Actions surface="card" items={[{ kind: "primary", label: "Create a workflow", onClick: create }]} />}
        />
      }
    />
  )
}
