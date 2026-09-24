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
import { EmptyState } from "../../ui/EmptyState"
import { HealthStrip } from "../../ui/HealthStrip"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { BOUNCE_GUARD, seedFor, TODAY, type Sequence, type SequenceStep } from "../../data/seed"
import type { Session } from "../../session"
import { engage, useEngage } from "./store"
import { Actions } from "../../ui/Actions"
import { IndexPage, type IndexColumn } from "../../layouts"
import { Chip } from "../../ui/Identity"
import { RowMenuButton, RowOpen, day, focusSearch, h1Of, moveRow, n, rate, toast, useKeys, usePersisted } from "./shared"

/**
 * The words the status cell uses, and the bare state word behind each of them. Bounce guard is a
 * state of the sequence, not a separate screen.
 *
 * `word` is what `statusOf` in identity.ts reads to pick the colour, and `label` is what the person
 * sees — so "Paused by Marcus Adeyemi" is coloured as paused without the page naming a hue.
 */
export function statusOf(s: Sequence): { label: string; word: string } {
  if (s.archivedAt) return { label: "Archived", word: "archived" }
  if (s.guardState === "auto-paused") return { label: "Auto-paused by bounce guard", word: "auto-paused" }
  if (s.status === "Active") return { label: "Active", word: "active" }
  if (s.status === "Paused") return { label: s.pausedBy ? `Paused by ${s.pausedBy}` : "Paused", word: "paused" }
  return { label: "Draft", word: "draft" }
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

  // The name and the owner are the template's first cell; these are the facts beside them.
  const columns: IndexColumn<Sequence>[] = [
    {
      key: "status", header: "Status", priority: 1,
      cell: (s) => {
        const st = statusOf(s)
        return (
          <span className="min-w-0">
            <Chip status={st.word}>{st.label}</Chip>
            {s.guardState === "warning" && (
              <span className="t-small" style={{ color: "var(--warning-ink)" }}> Bounce {s.bounceRate7d}% · pauses at {BOUNCE_GUARD.pausePercent}%</span>
            )}
          </span>
        )
      },
    },
    {
      key: "people", header: "People", numeric: true, priority: 1, sort: (a, c) => a.active - c.active,
      cell: (s) => <span>{n(s.active)} <span className="t-small text-muted-foreground">of {n(totalPeople(s))}</span></span>,
    },
    {
      key: "replied", header: "Replied", numeric: true, priority: 2, sort: (a, c) => a.replied - c.replied,
      cell: (s) => <span>{n(s.replied)} <span className="t-small text-muted-foreground">· {rate(s.replied, s.sent)}</span></span>,
    },
    {
      key: "bounced", header: "Bounced", numeric: true, priority: 2, sort: (a, c) => a.bounceRate7d - c.bounceRate7d,
      cell: (s) => (
        <span style={s.bounceRate7d >= BOUNCE_GUARD.warnPercent ? { color: "var(--danger-ink)" } : undefined}>
          {n(s.bounced)} <span className="t-small">· {s.bounceRate7d}% over 7 days</span>
        </span>
      ),
    },
    { key: "steps", header: "Steps", numeric: true, priority: 3, sort: (a, c) => a.steps - c.steps, cell: (s) => s.steps },
    { key: "activity", header: "Last activity", numeric: true, priority: 2, sort: (a, c) => a.updatedAt.localeCompare(c.updatedAt), cell: (s) => day(s.updatedAt) },
    ...(cols.opened ? [{ key: "opened", header: "Opened", numeric: true, priority: 3, cell: (s: Sequence) => `${n(s.opened)} · ${rate(s.opened, s.delivered)}` } as IndexColumn<Sequence>] : []),
    ...(cols.interested ? [{ key: "interested", header: "Interested", numeric: true, priority: 3, cell: (s: Sequence) => n(s.interested) } as IndexColumn<Sequence>] : []),
    ...(cols.meetings ? [{ key: "meetings", header: "Meetings", numeric: true, priority: 3, cell: (s: Sequence) => n(s.meetings) } as IndexColumn<Sequence>] : []),
    ...(cols.created ? [{ key: "created", header: "Created", numeric: true, priority: 3, cell: (s: Sequence) => day(s.createdAt) } as IndexColumn<Sequence>] : []),
    ...(cols.mailbox ? [{ key: "mailbox", header: "Mailbox", priority: 3, cell: (s: Sequence) => (s.mailboxRotation.length ? `Rotates across ${s.mailboxRotation.length}` : s.mailbox) } as IndexColumn<Sequence>] : []),
    ...(cols.schedule ? [{ key: "schedule", header: "Schedule", priority: 3, cell: (s: Sequence) => s.schedule } as IndexColumn<Sequence>] : []),
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

  const rowActions = (s: Sequence) => [
    { label: s.guardState === "auto-paused" ? "Review and resume" : s.status === "Active" ? "Pause" : "Resume", onClick: () => pauseResume(s) },
    ...(duplicateIsVisible ? [{ label: "Duplicate", onClick: () => duplicate(s) }] : []),
    { label: "Open", onClick: () => open(s) },
  ]

  /** The one bar that replaces the pager while rows are selected. */
  const bulkBar = (
    <Actions
      surface="card"
      items={[
        { kind: "secondary", label: "Pause", onClick: () => { selected.forEach((id) => engage.patchSequence(session.business, id, { status: "Paused", pausedBy: session.user })); setSelected([]); toast(`Paused ${n(selected.length)} sequences. Everyone keeps their place.`) } },
        { kind: "secondary", label: "Resume", onClick: () => { selected.forEach((id) => engage.patchSequence(session.business, id, { status: "Active", pausedBy: null })); setSelected([]); toast(`Resumed ${n(selected.length)} sequences.`) } },
        {
          kind: "destructive",
          label: `Archive ${n(selected.length)}`,
          onClick: () => {
            const people = selected.reduce((sum, id) => sum + (sequences.find((s) => s.id === id)?.active ?? 0), 0)
            selected.forEach((id) => engage.patchSequence(session.business, id, { archivedAt: TODAY, status: "Paused" }))
            setSelected([])
            toast(`Archived ${n(selected.length)} sequences · ${n(people)} people marked finished`)
          },
          irreversible: {
            title: `Archive ${n(selected.length)} sequences?`,
            consequence: "Their people are marked finished and their scheduled emails are deleted. Replies and activity stay on the records.",
            confirmLabel: `Archive ${n(selected.length)}`,
          },
        },
      ]}
    />
  )

  /** The filtering pattern: the search, the two filters this seat sets, the columns in the door. */
  const filters = {
    search: { value: q, onChange: setQ, placeholder: "Search sequences by name or owner" },
    controls: [
      {
        name: "Status",
        value: status === "all" ? undefined : status,
        onClear: () => setStatus("all"),
        node: (
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-44" aria-label="Status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: all</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Paused">Paused</SelectItem>
              <SelectItem value="Auto-paused">Auto-paused</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      ...(showOwnerFilter ? [{
        name: "Owner",
        value: owner === "all" ? undefined : owner === "Mine" ? "mine" : owner,
        onClear: () => setOwner("all"),
        node: (
          <Select value={owner} onValueChange={setOwner}>
            <SelectTrigger className="h-8 w-48" aria-label="Owner"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Mine">Owner: mine</SelectItem>
              <SelectItem value="all">Owner: everyone</SelectItem>
              {b.roles.map((r) => <SelectItem key={r.user} value={r.user}>{r.user}</SelectItem>)}
            </SelectContent>
          </Select>
        ),
      }] : []),
    ],
    behind: [
      {
        name: "Columns", group: "columns" as const,
        node: (
          <div className="flex flex-wrap gap-4 text-sm">
            {([["opened", "Opened"], ["interested", "Interested"], ["meetings", "Meetings"], ["created", "Created"], ["mailbox", "Mailbox"], ["schedule", "Schedule"]] as const).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2">
                <Checkbox checked={cols[k]} onCheckedChange={(v) => setCols({ ...cols, [k]: v === true })} />
                {label}
              </label>
            ))}
          </div>
        ),
      },
    ],
    count: { shown: rows.length, total: b.counts.sequences, noun: "sequences" },
    onClearAll: () => { setQ(""); setStatus("all"); setOwner("all") },
    doorId: "sequences",
  }

  return (
    <IndexPage<Sequence>
      family="sequences"
      title="Sequences"
      count={b.counts.sequences}
      actions={[
        ...(duplicateIsVisible && rows[0] ? [{ kind: "secondary" as const, label: `Duplicate “${rows[0].name}”`, onClick: () => duplicate(rows[0]) }] : []),
        { kind: "primary" as const, label: "New sequence", onClick: create },
      ]}
      above={paused.length > 0 ? (
        <HealthStrip lines={paused.map((s) => ({
          kind: "error" as const,
          text: `${s.name} auto-paused by bounce guard · ${s.bounceRate7d}% over 7 days, pauses at ${BOUNCE_GUARD.pausePercent}%`,
          href: `#/ollopa/sequences/${s.id}`,
        }))} />
      ) : undefined}
      filters={filters}
      columns={columns}
      rows={rows}
      rowKey={(s) => s.id}
      nameHeader="Sequence"
      nameSort={(a, c) => a.name.localeCompare(c.name)}
      sort={sort}
      onSort={(k, dir) => setSort({ key: k, dir })}
      name={(s) => (
        <>
          <RowOpen to={`/ollopa/sequences/${s.id}`} onOpen={() => open(s)}>{s.name}</RowOpen>
          <span className="t-small text-muted-foreground">{s.owner}</span>
        </>
      )}
      // The one act this seat uses most, at rest on the row; the rest are in the "…".
      acts={(s) => (
        <Button size="sm" variant="ghost" className="h-7" onClick={() => pauseResume(s)}>
          {s.guardState === "auto-paused" ? "Review and resume" : s.status === "Active" ? "Pause" : "Resume"}
        </Button>
      )}
      menu={(s) => <RowMenuButton label={s.name} actions={rowActions(s)} items={menu(s)} />}
      rowProps={(s) => ({ "data-item": s.id, "data-item-label": s.name, "data-row-key": s.id })}
      bulk={{ selected, onChange: setSelected, bar: bulkBar }}
      empty={sequences.length === 0 ? (
        <EmptyState title="No sequences yet" body="Start one here, or ask the outreach agent to propose one." action={<Button size="sm" onClick={create}>New sequence</Button>} />
      ) : undefined}
    />
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
