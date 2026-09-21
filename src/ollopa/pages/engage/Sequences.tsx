// Sequences (`P-sequences`): which of my sequences are running, and is any in trouble.
//
// That is the only question the list answers, so sending state and bounce-guard state live inside the
// Status and Bounced cells rather than on a Health tab a click away: a sequence can be stopped by a
// person or by bounce guard, and both states, and what resuming will do, are readable at every width.
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { navigate } from "@/app/router"
import { follow } from "../../chain"
import { Door, DoorGroup } from "../../ui/Door"
import { EmptyState } from "../../ui/EmptyState"
import { HealthStrip } from "../../ui/HealthStrip"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { BOUNCE_GUARD, seedFor, TODAY, type Sequence, type SequenceStep } from "../../data/seed"
import type { Session } from "../../session"
import { engage, useEngage } from "./store"
import { type Col, DataTable, Pill, RowOpen, day, focusSearch, h1Of, moveRow, n, rate, toast, useKeys, usePersisted } from "./shared"

/** The words the status cell uses. Bounce guard is a state of the sequence, not a separate screen. */
export function statusOf(s: Sequence): { label: string; tone: "good" | "warning" | "error" | "muted" } {
  if (s.archivedAt) return { label: "Archived", tone: "muted" }
  if (s.guardState === "auto-paused") return { label: "Auto-paused by bounce guard", tone: "error" }
  if (s.status === "Active") return { label: "Active", tone: "good" }
  if (s.status === "Paused") return { label: s.pausedBy ? `Paused by ${s.pausedBy}` : "Paused", tone: "warning" }
  return { label: "Draft", tone: "muted" }
}

export const totalPeople = (s: Sequence) => s.active + s.paused + s.finished + s.replied + s.bounced + s.notSent

export function SequencesPage({ session }: { session: Session }) {
  const d = useDisclosure("sequences")
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const { sequences } = useEngage(session.business)

  const key = (name: string) => `ollopa.sequences.${name}.${session.user}`
  const [q, setQ] = useState("")
  const [status, setStatus] = usePersisted(key("status"), "all")
  // Fathom has two people sending: an owner filter there would be a control that never changes anything.
  const showOwnerFilter = session.business !== "fathom"
  const [owner, setOwner] = usePersisted(key("owner"), "all")
  const [sort, setSort] = usePersisted<{ key: string; dir: "asc" | "desc" }>(key("sort"), { key: "activity", dir: "desc" })
  const [cols, setCols] = usePersisted(key("cols"), {
    opened: false, interested: false, meetings: false, created: false,
    mailbox: d.level("seq.settings.mailbox") === 1, schedule: false,
  })
  const [selected, setSelected] = useState<string[]>([])

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return sequences.filter((s) => {
      const st = statusOf(s)
      if (status === "Archived" ? !s.archivedAt : !!s.archivedAt) return false
      if (status !== "all" && status !== "Archived") {
        if (status === "Auto-paused" ? s.guardState !== "auto-paused" : s.status !== status) return false
      }
      if (needle && !`${s.name} ${s.owner} ${st.label}`.toLowerCase().includes(needle)) return false
      if (owner === "Mine" && s.owner !== session.user) return false
      if (owner !== "all" && owner !== "Mine" && s.owner !== owner) return false
      return true
    })
  }, [sequences, q, status, owner, session.user])

  const paused = sequences.filter((s) => s.guardState === "auto-paused" && !s.archivedAt)

  // A row opens its record along the trail, with the row as the anchor: the record's
  // "← Sequences" and the crumb both come back to this row, lit.
  const open = (s: Sequence) =>
    follow(`/ollopa/sequences/${s.id}`, { route: "/ollopa/sequences", title: h1Of("sequences"), anchor: s.id })

  const pauseResume = (s: Sequence) => {
    if (s.guardState === "auto-paused") { open(s); return }
    const next = s.status === "Active" ? "Paused" : "Active"
    engage.patchSequence(session.business, s.id, { status: next, pausedBy: next === "Paused" ? session.user : null, updatedAt: TODAY })
    engage.logChange(session.business, s.id, session.user, next === "Paused" ? "Paused the sequence" : "Resumed the sequence")
    toast(next === "Paused"
      ? `${s.name} paused. Emails and new tasks stop; everyone keeps their place.`
      : `${s.name} resumed. ${n(s.active)} people continue from their next step.`)
  }

  const duplicate = (s: Sequence) => {
    const draft = newDraft(session, sequences, `${s.name} (copy)`)
    const steps = seed.sequenceSteps.filter((x) => x.sequenceId === s.id)
      .map((x, i) => ({ ...x, id: `${draft.seq.id}-st${i + 1}`, sequenceId: draft.seq.id }))
    engage.addSequence(session.business, { ...draft.seq, steps: steps.length, schedule: s.schedule, ruleset: s.ruleset, dailyCap: s.dailyCap }, steps)
    toast(`Copied ${s.name}: steps and settings, nobody in it`)
    navigate(`/ollopa/sequences/${draft.seq.id}`)
  }

  const create = () => {
    const draft = newDraft(session, sequences, "Untitled sequence")
    engage.addSequence(session.business, draft.seq, draft.steps)
    navigate(`/ollopa/sequences/${draft.seq.id}`)
  }

  /* Visible row actions come from the usage numbers: Halyard builds the same sequence ten times, so
     Duplicate is a button there and a menu item everywhere else. */
  const duplicateIsVisible = d.weekly("seq.list.duplicate") >= 15

  const columns: Col<Sequence>[] = [
    {
      key: "name", header: "Sequence", primary: true, sort: (a, c) => a.name.localeCompare(c.name),
      cell: (s) => (
        <div className="min-w-0">
          <RowOpen onOpen={() => open(s)}>{s.name}</RowOpen>
          <div className="text-xs text-muted-foreground">{s.owner}</div>
        </div>
      ),
    },
    {
      key: "status", header: "Status", phone: true,
      cell: (s) => {
        const st = statusOf(s)
        return (
          <div className="min-w-0">
            <Pill tone={st.tone}>{st.label}</Pill>
            {s.guardState === "warning" && (
              <div className="text-xs text-amber-700 dark:text-amber-400">Bounce {s.bounceRate7d}% · pauses at {BOUNCE_GUARD.pausePercent}%</div>
            )}
          </div>
        )
      },
    },
    {
      key: "people", header: "People", className: "tabular-nums", phone: true, sort: (a, c) => a.active - c.active,
      cell: (s) => <div>{n(s.active)} <span className="text-xs text-muted-foreground">of {n(totalPeople(s))}</span></div>,
    },
    {
      key: "replied", header: "Replied", className: "tabular-nums", phone: true, sort: (a, c) => a.replied - c.replied,
      cell: (s) => <div>{n(s.replied)} <span className="text-xs text-muted-foreground">· {rate(s.replied, s.sent)}</span></div>,
    },
    {
      key: "bounced", header: "Bounced", className: "tabular-nums", sort: (a, c) => a.bounceRate7d - c.bounceRate7d,
      cell: (s) => (
        <div className={s.bounceRate7d >= BOUNCE_GUARD.warnPercent ? "text-destructive" : undefined}>
          {n(s.bounced)} <span className="text-xs">· {s.bounceRate7d}% over 7 days</span>
        </div>
      ),
    },
    { key: "steps", header: "Steps", className: "tabular-nums", sort: (a, c) => a.steps - c.steps, cell: (s) => s.steps },
    { key: "activity", header: "Last activity", className: "tabular-nums", sort: (a, c) => a.updatedAt.localeCompare(c.updatedAt), cell: (s) => day(s.updatedAt) },
    ...(cols.opened ? [{ key: "opened", header: "Opened", className: "tabular-nums", cell: (s: Sequence) => `${n(s.opened)} · ${rate(s.opened, s.delivered)}` } as Col<Sequence>] : []),
    ...(cols.interested ? [{ key: "interested", header: "Interested", className: "tabular-nums", cell: (s: Sequence) => n(s.interested) } as Col<Sequence>] : []),
    ...(cols.meetings ? [{ key: "meetings", header: "Meetings", className: "tabular-nums", cell: (s: Sequence) => n(s.meetings) } as Col<Sequence>] : []),
    ...(cols.created ? [{ key: "created", header: "Created", className: "tabular-nums", cell: (s: Sequence) => day(s.createdAt) } as Col<Sequence>] : []),
    ...(cols.mailbox ? [{ key: "mailbox", header: "Mailbox", cell: (s: Sequence) => (s.mailboxRotation.length ? `Rotates across ${s.mailboxRotation.length}` : s.mailbox) } as Col<Sequence>] : []),
    ...(cols.schedule ? [{ key: "schedule", header: "Schedule", cell: (s: Sequence) => s.schedule } as Col<Sequence>] : []),
  ]

  const menu = (s: Sequence) => [
    { label: "Open", onClick: () => open(s) },
    { label: "Duplicate", onClick: () => duplicate(s) },
    {
      label: `Archive · ${n(s.active + s.paused)} people`,
      destructive: true,
      onClick: () => {
        engage.patchSequence(session.business, s.id, { archivedAt: TODAY, status: "Paused" })
        engage.logChange(session.business, s.id, session.user, "Archived the sequence")
        toast(`${s.name} archived · ${n(s.active + s.paused)} people marked finished`)
      },
    },
    ...(s.status === "Draft" && totalPeople(s) === 0
      ? [{ label: "Delete draft · nothing has been sent from it", destructive: true, onClick: () => { engage.patchSequence(session.business, s.id, { archivedAt: TODAY }); toast(`${s.name} deleted`) } }]
      : []),
  ]

  useKeys(useMemo(() => [
    { keys: "/", label: "Search sequences", run: focusSearch },
    { keys: "n", label: "New sequence", run: create },
    { keys: "j", label: "Next sequence", run: () => moveRow(1) },
    { keys: "k", label: "Previous sequence", run: () => moveRow(-1) },
    { keys: "p", label: "Pause or resume the focused sequence", run: () => { const s = focusedRow(rows); if (s) pauseResume(s) } },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [rows]))

  return (
    <DoorGroup>
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-5 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold">Sequences</h2>
          </div>
          <div className="flex items-center gap-2">
            {duplicateIsVisible && rows[0] && <Button variant="outline" onClick={() => duplicate(rows[0])}>Duplicate “{rows[0].name}”</Button>}
            <Button onClick={create}>New sequence</Button>
          </div>
        </div>

        {paused.length > 0 && (
          <div className="px-4 pt-3 sm:px-6">
            <HealthStrip lines={paused.map((s) => ({
              kind: "error" as const,
              text: `${s.name} auto-paused by bounce guard · ${s.bounceRate7d}% over 7 days, pauses at ${BOUNCE_GUARD.pausePercent}%`,
              href: `#/ollopa/sequences/${s.id}`,
            }))} />
          </div>
        )}

        <div className="px-4 pt-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              data-page-search aria-label="Search sequences by name or owner" placeholder="Search sequences"
              value={q} onChange={(e) => setQ(e.target.value)} className="w-56"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44" aria-label="Status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: all</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Auto-paused">Auto-paused</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            {showOwnerFilter && (
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger className="w-48" aria-label="Owner"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mine">Owner: mine</SelectItem>
                  <SelectItem value="all">Owner: everyone</SelectItem>
                  {b.roles.map((r) => <SelectItem key={r.user} value={r.user}>{r.user}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
              {n(rows.length)} shown of {n(b.counts.sequences)}
            </span>
          </div>

          <div className="mt-2 rounded-lg border">
            <Door id="sequences.columns" label="Columns: opened, interested, meetings, created, mailbox, schedule">
              <div className="flex flex-wrap gap-4 py-1 text-sm">
                {([["opened", "Opened"], ["interested", "Interested"], ["meetings", "Meetings"], ["created", "Created"], ["mailbox", "Mailbox"], ["schedule", "Schedule"]] as const).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2">
                    <Checkbox checked={cols[k]} onCheckedChange={(v) => setCols({ ...cols, [k]: v === true })} />
                    {label}
                  </label>
                ))}
              </div>
            </Door>
          </div>
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-auto">
          <DataTable<Sequence>
            rows={rows}
            rowKey={(s) => s.id}
            columns={columns}
            sortKey={sort.key}
            sortDir={sort.dir}
            onSort={(k, dir) => setSort({ key: k, dir })}
            rowActions={[
              { label: (s) => (s.guardState === "auto-paused" ? "Review and resume" : s.status === "Active" ? "Pause" : "Resume"), onClick: pauseResume },
              ...(duplicateIsVisible ? [{ label: () => "Duplicate", onClick: duplicate }] : []),
              { label: () => "Open", onClick: open },
            ]}
            menu={menu}
            menuLabel={(s) => s.name}
            onOpen={open}
            selection={{
              selected, onChange: setSelected,
              bar: (ids) => (
                <>
                  <Button size="sm" variant="outline" onClick={() => { ids.forEach((id) => engage.patchSequence(session.business, id, { status: "Paused", pausedBy: session.user })); setSelected([]); toast(`Paused ${n(ids.length)} sequences. Everyone keeps their place.`) }}>Pause</Button>
                  <Button size="sm" variant="outline" onClick={() => { ids.forEach((id) => engage.patchSequence(session.business, id, { status: "Active", pausedBy: null })); setSelected([]); toast(`Resumed ${n(ids.length)} sequences.`) }}>Resume</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => {
                    const people = ids.reduce((sum, id) => sum + (sequences.find((s) => s.id === id)?.active ?? 0), 0)
                    ids.forEach((id) => engage.patchSequence(session.business, id, { archivedAt: TODAY, status: "Paused" }))
                    setSelected([])
                    toast(`Archived ${n(ids.length)} sequences · ${n(people)} people marked finished`)
                  }}>
                    Archive {n(ids.length)} · marks their people finished
                  </Button>
                </>
              ),
            }}
            empty={
              sequences.length === 0
                ? <EmptyState title="No sequences yet" body="Start one here, or ask the outreach agent to propose one." action={<Button size="sm" onClick={create}>New sequence</Button>} />
                : undefined
            }
          />
        </div>
      </div>
    </DoorGroup>
  )
}

/** New sequence: a draft with the default schedule, ruleset and this person's mailbox. No chooser. */
export function newDraft(session: Session, existing: Sequence[], name: string): { seq: Sequence; steps: SequenceStep[] } {
  const seed = seedFor(session.business)
  const id = `seq-new-${existing.length + 1}-${Date.now().toString(36)}`
  const mine = seed.mailboxes.find((m) => m.owner === session.user) ?? seed.mailboxes[0]
  const schedule = seed.schedules.find((s) => s.isDefault) ?? seed.schedules[0]
  const ruleset = seed.rulesets.find((r) => r.isDefault) ?? seed.rulesets[0]
  const seq: Sequence = {
    id, name, steps: 1, series: [], active: 0, replied: 0, bounced: 0, owner: session.user, status: "Draft",
    paused: 0, finished: 0, notSent: 0, sent: 0, delivered: 0, opened: 0, interested: 0, meetings: 0,
    bounceRate7d: 0, guardState: "ok", pausedBy: null,
    mailbox: mine?.address ?? "", mailboxRotation: [], dailyCap: 100,
    schedule: schedule?.name ?? "Business hours, contact's time zone",
    ruleset: ruleset?.name ?? "Default outbound",
    priority: "Normal", tracking: { opens: true, clicks: true }, sharedWith: "Me",
    createdAt: TODAY, updatedAt: TODAY, archivedAt: null,
  }
  const steps: SequenceStep[] = [{
    id: `${id}-st1`, sequenceId: id, order: 1, kind: "Email", on: 1,
    subject: "", body: "", templateId: null,
    variants: [{ label: "A", subject: "", body: "", sent: 0, replied: 0 }],
    linkedinKind: null, waitDays: 0, businessDaysOnly: true,
    stats: { sent: 0, delivered: 0, opened: 0, replied: 0, bounced: 0, unsubscribed: 0, created: 0, done: 0, skipped: 0, overdue: 0, waitingNow: 0 },
  }]
  return { seq, steps }
}

function focusedRow(rows: Sequence[]): Sequence | null {
  const el = document.activeElement?.closest?.("tr[data-row-key]") as HTMLElement | null
  const id = el?.dataset.rowKey
  return rows.find((s) => s.id === id) ?? null
}
