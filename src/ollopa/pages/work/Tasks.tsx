// P-tasks — calls, LinkedIn steps, emails and follow-ups that are due.
//
// One page, two bodies. The queue is the opening body for the SDR and the AE seats and the list is
// the opening body for customer success and the RevOps admin — the S1 walk decision of 15 September
// 2026 (PLAN.md): the two seats whose day is the queue should not have to press a button to start it,
// and the two seats who come here to look something up should not be put inside a queue they did not
// ask for. The switch between them is labelled by what it opens, sits in the header in both
// directions, and **replaces** the body rather than nesting inside it — so the list's filter door and
// row doors stay at level two and the queue's panels stay at level two.
//
// The one thing nobody may lose sight of: an overdue sequence task means a contact is stuck at that
// step and the sequence is waiting. The row says so and so does the header.
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { closeBeside, openBeside } from "../../beside"
import { Actions, type Action } from "../../ui/Actions"
import { clearEdit, recordEdit, useEdits } from "../../edits"
import { Door, DoorGroup, ExpandAll } from "../../ui/Door"
import { Panel } from "../../ui/Panel"
import { EmptyState } from "../../ui/EmptyState"
import { useDisclosure } from "../../ui/useDisclosure"
import { seedFor, TODAY, type Task } from "../../data/seed"
import type { Session } from "../../session"
import { day, dueLabel, isOverdue, isToday, localTime, tomorrow } from "./format"
import {
  adminSeat, contactIndex, queueOrder, scoreOrder, seatsOf, seesEveryone, tasksFor,
} from "./data"
import { useRenderCount } from "./acts"
import { Queue } from "./Queue"
import { CallLogPanel } from "./CallLog"
import { LinkedInPanel } from "./LinkedIn"
import { MeetingPanel } from "./MeetingPanel"
import { useUndo } from "./undo"

type Mode = "queue" | "list"
const KINDS: Task["kind"][] = ["Call", "LinkedIn", "Email", "Follow-up", "Meeting"]
const DUES = ["Overdue", "Today", "This week", "All open"] as const
const STATUSES: Task["status"][] = ["Open", "Snoozed", "Done", "Skipped"]

interface Change { status?: Task["status"]; due?: string; owner?: string; snoozedUntil?: string | null; gone?: boolean }

const store = (s: Session, k: string) => `ollopa.tasks.${s.business}.${s.role}.${k}`
function remember(s: Session, k: string, v: string) { try { localStorage.setItem(store(s, k), v) } catch { /* private mode */ } }
function recall(s: Session, k: string, fallback: string) { try { return localStorage.getItem(store(s, k)) ?? fallback } catch { return fallback } }

function nextMonday(): string {
  const d = new Date(TODAY + "T00:00:00Z")
  const ahead = (8 - d.getUTCDay()) % 7 || 7
  return new Date(d.getTime() + ahead * 86_400_000).toISOString().slice(0, 10)
}

export function Tasks({ session }: { session: Session }) {
  const renders = useRenderCount()
  const d = useDisclosure("tasks")
  const seed = seedFor(session.business)
  const contactOf = contactIndex(session.business)
  const admin = adminSeat(session.business)
  // Whether this business scores contacts at all is the usage model's answer, not a hard-coded list:
  // `tasks.row-score` carries a number only at Ridgeline, so the chip and the score sort exist only
  // there and are removed — not greyed — everywhere else (spec 07 §3, rule 4).
  const scores = d.weekly("tasks.row-score") > 0
  const teamView = seesEveryone(session.role)
  const { say, bar } = useUndo()

  const base = useMemo(() => tasksFor(session), [session])
  const [changes, setChanges] = useState<Record<string, Change>>({})
  // Done, Snooze and Skip are written to the shared store (src/ollopa/edits.ts), whoever pressed
  // them: this page, the queue's footer, or a task pane open beside another page. One source, so a
  // row and a pane can never say different things about the same task. Reading it re-renders these
  // rows only when a task actually changes — never when a pane merely opens.
  const acted = useEdits("task")
  const all: Task[] = useMemo(
    () => base.map((t) => {
      const c = changes[t.id]
      const a = acted[t.id] as { done?: boolean; snoozed?: boolean; skipped?: boolean; until?: string } | undefined
      if (!c && !a) return t
      const status: Task["status"] =
        a?.done ? "Done" : a?.skipped ? "Skipped" : a?.snoozed ? "Snoozed" : c?.status ?? t.status
      const until = a?.snoozed ? a.until ?? tomorrow() : undefined
      return {
        ...t,
        status,
        due: until ?? c?.due ?? t.due,
        owner: c?.owner ?? t.owner,
        snoozedUntil: until ?? (c?.snoozedUntil !== undefined ? c.snoozedUntil : t.snoozedUntil),
      }
    }).filter((t) => !changes[t.id]?.gone),
    [base, changes, acted],
  )

  // The admin opens on Everyone when they have no open task of their own — object state, not history.
  const myOpen = all.filter((t) => t.owner === session.user && t.status === "Open").length
  const [owner, setOwner] = useState<string>(() => (teamView && myOpen === 0 ? "Everyone" : session.user))
  const [mode, setMode] = useState<Mode>(() => recall(session, "mode", session.role === "sdr" || session.role === "ae" ? "queue" : "list") as Mode)
  const [sort, setSort] = useState<"due" | "score">(() => (recall(session, "sort", "due") as "due" | "score"))
  const [q, setQ] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>(() => ({ due: recall(session, "due", "All open") }))
  const [selection, setSelection] = useState<string[]>([])
  const [calling, setCalling] = useState<Task | null>(null)
  const [linking, setLinking] = useState<Task | null>(null)
  const [meeting, setMeeting] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  /** Done on a call task first shows the four outcome buttons inline, which write the disposition. */
  const [outcoming, setOutcoming] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { remember(session, "mode", mode) }, [session, mode])
  useEffect(() => { remember(session, "sort", sort) }, [session, sort])
  useEffect(() => { remember(session, "due", filters.due ?? "All open") }, [session, filters.due])

  const mine = useMemo(() => (teamView && owner === "Everyone" ? all : all.filter((t) => t.owner === (teamView ? owner : session.user))), [all, owner, teamView, session.user])
  const openRows = mine.filter((t) => t.status === "Open" || t.status === "Snoozed")

  const counts = {
    today: openRows.filter((t) => isToday(t.due)).length,
    overdue: openRows.filter((t) => isOverdue(t.due)).length,
    later: openRows.filter((t) => !isToday(t.due) && !isOverdue(t.due)).length,
    tomorrow: openRows.filter((t) => t.due === tomorrow()).length,
  }

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const status = filters.status && filters.status !== "all" ? filters.status : null
    const pool = status ? mine.filter((t) => t.status === status) : openRows
    const list = pool
      .filter((t) => !needle || `${t.contact} ${t.company} ${contactOf(t.contactId)?.title ?? ""} ${t.sequence ?? ""}`.toLowerCase().includes(needle))
      .filter((t) => !filters.type || filters.type === "all" || t.kind === filters.type)
      .filter((t) => !filters.source || filters.source === "all" || (filters.source === "Manual" ? t.createdBy === "manual" : filters.source === "Agent" ? t.createdBy === "agent" : t.sequence === filters.source))
      .filter((t) => {
        const due = filters.due ?? "All open"
        if (due === "Overdue") return isOverdue(t.due)
        if (due === "Today") return isToday(t.due)
        if (due === "This week") return !isOverdue(t.due)
        return true
      })
    if (filters.sort === "Type") return [...list].sort((a, b) => a.kind.localeCompare(b.kind))
    if (filters.sort === "Contact") return [...list].sort((a, b) => a.contact.localeCompare(b.contact))
    return queueOrder(list)
  }, [mine, openRows, q, filters, contactOf])

  const queueRows = sort === "score" && scores ? scoreOrder(rows, contactOf) : rows

  /* ------------------------------------------------------------------------------- the actions */

  const apply = useCallback((id: string, next: Change, message: string) => {
    setChanges((c) => {
      const before = c[id]
      window.setTimeout(() => say(message, () => setChanges((cc) => ({ ...cc, [id]: before ?? {} }))), 0)
      return { ...c, [id]: { ...(c[id] ?? {}), ...next } }
    })
  }, [say])

  /** The list as it is on screen, in the order it is on screen: what the pane's walker counts. */
  const onScreen = mode === "queue" ? queueRows : rows

  /**
   * Take a task off the list, and take the pane with it.
   *
   * The frame marks the row a pane is reading with `.ollopa-beside-open` on the page itself, so
   * this can ask whether a pane is open without subscribing to the pane store — which would
   * re-render this page every time one opened. When the pane is reading the contact or the deal of
   * the task that just left, it moves to the one that took its place and its walker counts the list
   * as it is now; when nothing is left, it closes.
   */
  const leaves = useCallback((gone: Task, note: string) => {
    const open = document.querySelector<HTMLElement>('[data-page-active="true"] .ollopa-beside-open')
    const reading = open?.dataset.item
    say(note, () => clearEdit("task", gone.id))
    if (!reading) return
    const kind = reading === gone.contactId ? "person" : reading === gone.dealId ? "deal" : null
    if (!kind) return
    const rest = onScreen.filter((x) => x.id !== gone.id)
    const ids = kind === "person" ? rest.map((x) => x.contactId) : rest.filter((x) => x.dealId).map((x) => x.dealId!)
    if (ids.length === 0) { closeBeside(); return }
    const index = Math.min(Math.max(0, onScreen.findIndex((x) => x.id === gone.id)), ids.length - 1)
    openBeside({ kind, id: ids[index], list: { ids, index }, opener: open })
  }, [onScreen, say])

  const done = useCallback((t: Task, outcome?: string) => {
    const stops = outcome === "Connected"
    const note = `${t.kind} with ${t.contact} marked done${outcome ? `: ${outcome}` : ""}.${t.sequence ? (stops ? ` “${t.sequence}” stops for ${t.contact.split(" ")[0]}.` : " The contact moves to the next step.") : ""}`
    recordEdit("task", t.id, { done: true, note })
    leaves(t, note)
  }, [leaves])
  const snooze = useCallback((t: Task, until = tomorrow()) => {
    const note = `${t.contact}'s ${t.kind.toLowerCase()} snoozed to ${day(until)}.${t.sequence ? " The sequence waits." : ""}`
    recordEdit("task", t.id, { snoozed: true, until, note })
    leaves(t, note)
  }, [leaves])
  const skip = useCallback((t: Task) => {
    const note = `${t.kind} with ${t.contact} skipped.${t.sequence ? ` ${t.contact.split(" ")[0]} moves to the next step of “${t.sequence}”.` : ""}`
    recordEdit("task", t.id, { skipped: true, note })
    leaves(t, note)
  }, [leaves])
  const reassign = useCallback((t: Task, to: string) => apply(t.id, { owner: to }, `${t.contact}'s ${t.kind.toLowerCase()} reassigned to ${to}.`), [apply])
  const remove = useCallback((t: Task) => apply(t.id, { gone: true }, `Task “${t.title}” deleted.`), [apply])

  /**
   * The contact or the deal a task points at, read beside the page. The list is the one on screen in
   * the order it is on screen, so ] walks the queue rather than jumping somewhere else, and the page
   * behind — the queue's note, the row's open door, the search — is untouched.
   */
  const openContact = useCallback((t: Task, opener?: HTMLElement | null) => {
    const ids = onScreen.map((x) => x.contactId)
    openBeside({
      kind: "person",
      id: t.contactId,
      list: { ids, index: Math.max(0, onScreen.findIndex((x) => x.id === t.id)) },
      opener: opener ?? document.querySelector<HTMLElement>(`[data-task-row="${t.id}"] [data-row-focus]`),
    })
  }, [onScreen])

  /** The task itself, beside the list it is in, with the list under the pane's walker. */
  const openTask = useCallback((t: Task, opener?: HTMLElement | null) => {
    const ids = onScreen.map((x) => x.id)
    openBeside({
      kind: "task",
      id: t.id,
      list: { ids, index: Math.max(0, ids.indexOf(t.id)) },
      opener: opener ?? document.querySelector<HTMLElement>(`[data-task-row="${t.id}"] [data-row-focus]`),
    })
  }, [onScreen])

  const openDeal = useCallback((t: Task, opener?: HTMLElement | null) => {
    if (!t.dealId) return
    const ids = onScreen.filter((x) => x.dealId).map((x) => x.dealId!)
    openBeside({
      kind: "deal",
      id: t.dealId,
      list: { ids, index: Math.max(0, ids.indexOf(t.dealId)) },
      opener: opener ?? (document.activeElement as HTMLElement | null),
    })
  }, [onScreen])

  const openPanel = useCallback((t: Task) => {
    if (t.kind === "Call") setCalling(t)
    else if (t.kind === "LinkedIn") setLinking(t)
    else if (t.kind === "Meeting") setMeeting(t)
    else setMode("queue")
  }, [])

  /* -------------------------------------------------------------------------------- keyboard */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (!el || el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const key = e.key.toLowerCase()
      if (key === "w") { e.preventDefault(); setMode((m) => (m === "queue" ? "list" : "queue")); return }
      if (key === "n") { e.preventDefault(); setNewTask(true); return }
      if (key === "/") { e.preventDefault(); setMode("list"); window.setTimeout(() => searchRef.current?.focus(), 0); return }
      if (mode !== "list") return
      const focused = document.activeElement?.closest("[data-task-row]") as HTMLElement | null
      const id = focused?.getAttribute("data-task-row")
      const t = rows.find((x) => x.id === id)
      if (key === "j" || key === "k") {
        e.preventDefault()
        const i = rows.findIndex((x) => x.id === id)
        const next = rows[Math.max(0, Math.min(rows.length - 1, i + (key === "j" ? 1 : -1)))] ?? rows[0]
        if (next) document.querySelector<HTMLElement>(`[data-task-row="${next.id}"] [data-row-focus]`)?.focus()
        return
      }
      if (!t) return
      if (key === "d") { e.preventDefault(); done(t) }
      if (key === "s") { e.preventDefault(); snooze(t) }
      if (key === "x") { e.preventDefault(); skip(t) }
      if (key === "e" && (t.kind === "Email" || t.kind === "Follow-up")) { e.preventDefault(); setMode("queue") }
      if (key === "l" && t.kind === "Call") { e.preventDefault(); setCalling(t) }
      if (key === "o") { e.preventDefault(); openTask(t) }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [mode, rows, done, snooze, skip, openTask])

  /* ------------------------------------------------------------------- what sits at level one */

  const filterDefs = [
    { key: "type", label: "Type", item: "tasks.filter-type", options: KINDS as unknown as string[] },
    { key: "due", label: "Due", item: "tasks.filter-due", options: [...DUES] as string[] },
    { key: "source", label: "Source", item: "tasks.filter-source", options: ["Manual", "Agent", ...new Set(base.map((t) => t.sequence).filter((s): s is string => !!s))] },
    { key: "status", label: "Status", item: "tasks.filter-status", options: STATUSES as unknown as string[] },
    { key: "sort", label: "Sort", item: "tasks.sort", options: ["Due", "Type", "Contact"] },
  ]
  const shown = filterDefs.filter((f) => d.level(f.item) === 1)
  const behind = filterDefs.filter((f) => d.level(f.item) !== 1)
  const activeBehind = behind.filter((f) => filters[f.key] && filters[f.key] !== "all").length
  const showOwnerColumn = teamView && d.level("tasks.owner-column") === 1 && owner === "Everyone"
  const showPhone = d.level("tasks.dnc-badge") === 1
  const showLocalTime = d.level("tasks.local-time") === 1

  function FilterSelect({ f }: { f: (typeof filterDefs)[number] }) {
    return (
      <Select value={filters[f.key] ?? (f.key === "due" ? "All open" : "all")} onValueChange={(v) => setFilters((a) => ({ ...a, [f.key]: v }))}>
        <SelectTrigger className="h-8 w-40 text-xs" aria-label={f.label}><SelectValue placeholder={f.label} /></SelectTrigger>
        <SelectContent>
          {f.key !== "due" && <SelectItem value="all">{f.label}: all</SelectItem>}
          {f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    )
  }

  /* ------------------------------------------------------------------------------------ a row */

  function Row({ t }: { t: Task }) {
    const c = contactOf(t.contactId)
    const overdue = isOverdue(t.due)
    const waiting = !!t.sequence && overdue
    const selected = selection.includes(t.id)
    const primary =
      t.kind === "Call" ? { label: "Log the call", run: () => setCalling(t) }
        : t.kind === "LinkedIn" ? { label: "Open the LinkedIn step", run: () => setLinking(t) }
          : t.kind === "Meeting" ? { label: "Open the meeting", run: () => setMeeting(t) }
            : { label: "Write", run: () => setMode("queue") }

    return (
      <div role="listitem" data-task-row={t.id} data-item={t.id} data-item-label={`${t.kind} · ${t.contact}`} className="group border-b px-3 py-2 sm:px-4">
        <div className="flex flex-wrap items-start gap-x-3 gap-y-1 md:flex-nowrap">
          <span className="pt-1">
            <Checkbox aria-label={`Select the ${t.kind.toLowerCase()} for ${t.contact}`} checked={selected} onCheckedChange={(v) => setSelection((s) => (v === true ? [...s, t.id] : s.filter((x) => x !== t.id)))} />
          </span>

          <span className={cn("w-24 shrink-0 pt-0.5 text-sm tabular-nums", overdue ? "font-medium text-destructive" : "text-muted-foreground")}>
            {dueLabel(t.due)}
            {showLocalTime && c?.tz && <span className="block text-xs font-normal text-muted-foreground">{localTime(c.tz)} local</span>}
          </span>

          <span className="w-24 shrink-0 pt-0.5"><Badge variant="outline" className="text-xs">{t.kind}</Badge></span>

          <span className="min-w-[12rem] flex-1 basis-48">
            <button
              type="button"
              data-row-focus
              data-item={t.contactId}
              data-item-label={t.contact}
              className="font-medium underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
              onClick={(e) => openContact(t, e.currentTarget)}
            >
              {t.contact}
            </button>
            <span className="block truncate text-xs text-muted-foreground">{c?.title} · {t.company}</span>
            {showPhone && t.kind === "Call" && (
              <span className="flex flex-wrap items-center gap-x-2 pt-0.5 text-xs">
                <span className="font-mono">{c?.phoneNumber ?? "No number"}</span>
                {c?.doNotCall && <span className="rounded border border-destructive px-1 text-destructive">Do not call · {c.doNotCallSource}</span>}
              </span>
            )}
            {scores && c && (
              <span className="block pt-0.5 text-xs">Fit {c.score} {c.score >= c.scorePrevious ? "▲" : "▼"} from {c.scorePrevious}</span>
            )}
          </span>

          <span className="min-w-[12rem] flex-1 basis-48">
            <span className="block text-sm">{t.step ? `Step ${t.step.n} of ${t.step.of} · ${t.step.title}` : t.title}</span>
            {waiting && <span className="block text-xs text-destructive">The sequence waits at this step.</span>}
          </span>

          <span className="w-36 shrink-0 truncate text-xs text-muted-foreground">
            {t.createdBy === "sequence" ? t.sequence : t.createdBy === "agent" ? t.creator : "By hand"}
          </span>

          {showOwnerColumn && <span className="w-32 shrink-0 truncate text-xs text-muted-foreground">{t.owner}</span>}

          <span className="flex w-full min-w-0 flex-wrap items-center gap-1 md:w-auto md:shrink-0 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            {/* Done is the act a task exists for, so it is the row's one filled control; the rest
                are the other acts the person came for, and deleting sits in the menu at the end.
                Four comparable call outcomes are all outlines, none of them filled. */}
            {t.kind === "Call" && outcoming === t.id ? (
              <Actions
                surface="card"
                items={["Connected", "Voicemail", "No answer", "Wrong number"].map((o) => ({
                  kind: "secondary" as const, label: o, onClick: () => { setOutcoming(null); done(t, o) },
                }))}
              />
            ) : (
              <Actions
                surface="card"
                items={[
                  { kind: "primary", label: "Done", keys: "d", onClick: () => (t.kind === "Call" ? setOutcoming(t.id) : done(t)) },
                  { kind: "secondary", label: "Open the task beside", keys: "o", onClick: () => openTask(t) },
                  { kind: "secondary", label: primary.label, onClick: primary.run },
                  { kind: "secondary", label: "Snooze", keys: "s", onClick: () => snooze(t) },
                ]}
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="ghost" aria-label={`The task and the contact beside, snooze until, note, edit${teamView ? ", reassign" : ""}, delete — for ${t.contact}`}><MoreHorizontal className="size-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => done(t)}>Done<span className="ml-auto pl-4 font-mono text-[10px] text-muted-foreground">d</span></DropdownMenuItem>
                <DropdownMenuItem onSelect={primary.run}>{primary.label}<span className="ml-auto pl-4 font-mono text-[10px] text-muted-foreground">{t.kind === "Call" ? "l" : t.kind === "Email" ? "e" : ""}</span></DropdownMenuItem>
                <DropdownMenuItem onSelect={() => snooze(t)}>Snooze to tomorrow<span className="ml-auto pl-4 font-mono text-[10px] text-muted-foreground">s</span></DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setEditing(t.id)}>Snooze until…</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => skip(t)}>Skip<span className="ml-auto pl-4 font-mono text-[10px] text-muted-foreground">x</span></DropdownMenuItem>
                <DropdownMenuItem onSelect={() => say(`Note added to ${t.contact}'s task.`)}>Add note</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setEditing(t.id)}>Edit the due date</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => openTask(t)}>Open the task beside the list<span className="ml-auto pl-4 font-mono text-[10px] text-muted-foreground">o</span></DropdownMenuItem>
                <DropdownMenuItem onSelect={() => openContact(t)}>Open {t.contact} beside the list</DropdownMenuItem>
                {teamView && seatsOf(session.business).filter((s) => s.user !== t.owner && s.role !== "marketer").map((s) => (
                  <DropdownMenuItem key={s.user} onSelect={() => reassign(t, s.user)}>Reassign to {s.user}</DropdownMenuItem>
                ))}
                {t.createdBy === "manual" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onSelect={() => remove(t)}>Delete this task</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        </div>

        {editing === t.id && (
          <form
            className="flex flex-wrap items-center gap-2 pt-2"
            onSubmit={(e) => { e.preventDefault(); const v = new FormData(e.currentTarget).get("until") as string; if (v) snooze(t, v); setEditing(null) }}
            onKeyDown={(e) => { if (e.key === "Escape") setEditing(null) }}
          >
            <label className="text-xs text-muted-foreground">Until<Input name="until" type="date" defaultValue={tomorrow()} className="ml-2 inline-block h-8 w-40" autoFocus /></label>
            <Button size="sm" type="submit" variant="outline">Set the date</Button>
            <Button size="sm" type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </form>
        )}

        <div className="pt-1">
          <Door id={`tasks.row.${t.id}`} label="History and contact" defaultOpen={false}>
            {scores && contactOf(t.contactId) && (
              <p className="pb-1 text-sm">
                Fit {contactOf(t.contactId)!.score}: {contactOf(t.contactId)!.scoreReasons.join(", ")}
              </p>
            )}
            <ul className="text-sm">
              {t.history.map((h, k) => (
                <li key={k} className="flex flex-wrap gap-x-3 py-0.5">
                  <span className="tabular-nums text-muted-foreground">{day(h.when)}</span>
                  <span>Step {h.step} · {h.kind}</span>
                  <span className="text-muted-foreground">{h.result}</span>
                </li>
              ))}
              {t.history.length === 0 && <li className="text-muted-foreground">No steps have run yet.</li>}
            </ul>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 pt-2 text-sm">
              <dt className="text-muted-foreground">Email</dt><dd className="font-mono text-xs">{c?.email} · {c?.emailStatus}</dd>
              <dt className="text-muted-foreground">Last activity</dt><dd>{day(c?.lastActivity)}</dd>
              <dt className="text-muted-foreground">Owner</dt><dd>{t.owner}</dd>
            </dl>
            {t.notes.length > 0 && (
              <ul className="pt-2 text-sm">
                {t.notes.map((n, k) => <li key={k}><span className="text-muted-foreground">{day(n.when)} · {n.who}: </span>{n.text}</li>)}
              </ul>
            )}
          </Door>
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------------------------------ the page */

  const switchLabel = mode === "queue" ? `All tasks (${rows.length})` : `Work the queue (${queueRows.length})`

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-4 pt-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              Tasks
              {import.meta.env.DEV && (
                <span data-renders="tasks" className="ml-2 rounded border px-1.5 py-0.5 font-mono text-[10px] font-normal tabular-nums text-muted-foreground">
                  tasks renders: {renders}
                </span>
              )}
            </h2>
            <p className="text-sm tabular-nums">
              <button className="underline underline-offset-4" onClick={() => { setMode("list"); setFilters((f) => ({ ...f, due: "Today" })) }}>{counts.today} due today</button>
              {" · "}
              <button className={cn("underline underline-offset-4", counts.overdue > 0 && "font-medium text-destructive")} onClick={() => { setMode("list"); setFilters((f) => ({ ...f, due: "Overdue" })) }}>{counts.overdue} overdue</button>
              {" · "}
              <button className="underline underline-offset-4" onClick={() => { setMode("list"); setFilters((f) => ({ ...f, due: "All open" })) }}>{counts.later} later</button>
            </p>
            {!teamView && admin && (
              <p className="pt-0.5 text-xs text-muted-foreground">Your tasks. {admin.user} ({admin.title}) can see and reassign everyone's.</p>
            )}
            {counts.overdue > 0 && (
              <p className="pt-0.5 text-xs text-destructive">{counts.overdue} sequence {counts.overdue === 1 ? "contact is" : "contacts are"} stuck waiting at a step.</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* The page's own two controls: making a task is the act this page exists for, and the
                switch is the other thing the person came for. */}
            <Actions
              surface="page"
              items={([
                { kind: "primary", label: "New task", keys: "n", onClick: () => setNewTask(true) },
                { kind: "secondary", label: switchLabel, keys: "w", onClick: () => setMode(mode === "queue" ? "list" : "queue") },
              ]) as Action[]}
            />
          </div>
        </div>
      </div>

      {mode === "queue" ? (
        <div className="flex min-h-0 flex-1 flex-col pt-3">
          <Queue
            session={session}
            tasks={queueRows}
            sort={sort}
            onSort={(s) => setSort(s)}
            scores={scores}
            dueTomorrow={counts.tomorrow}
            onDone={done}
            onSnooze={(t) => snooze(t)}
            onSkip={skip}
            onOpenContact={openContact}
            onOpenDeal={openDeal}
            onSeeList={() => setMode("list")}
            onSnoozeRest={() => {
              const rest = rows.filter((t) => t.kind === "LinkedIn")
              rest.forEach((t) => recordEdit("task", t.id, { snoozed: true, until: nextMonday() }))
              say(`${rest.length} LinkedIn ${rest.length === 1 ? "task" : "tasks"} snoozed to Monday.`,
                () => rest.forEach((t) => clearEdit("task", t.id)))
            }}
            say={say}
          />
        </div>
      ) : (
        <DoorGroup>
          <div className="shrink-0 px-4 py-2 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <Input ref={searchRef} aria-label="Search contact, company, title or sequence" placeholder="Search tasks" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-56" />
              {shown.map((f) => <FilterSelect key={f.key} f={f} />)}
              {teamView && d.level("tasks.filter-owner") === 1 && (
                <Select value={owner} onValueChange={setOwner}>
                  <SelectTrigger className="h-8 w-44 text-xs" aria-label="Owner"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Everyone">Everyone</SelectItem>
                    {seatsOf(session.business).filter((s) => s.role !== "marketer").map((s) => (
                      <SelectItem key={s.user} value={s.user}>{s.user === session.user ? `${s.user} (me)` : s.user}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <ExpandAll />
              <span className="ml-auto text-xs tabular-nums text-muted-foreground">{rows.length} shown</span>
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              {behind.length > 0 && (
                <div className="min-w-64 flex-1">
                  <Door id="tasks.filters" label={`Additional filters: ${behind.map((f) => f.label.toLowerCase()).join(", ")}`} count={activeBehind || undefined}>
                    <div className="flex flex-wrap items-center gap-2">
                      {behind.map((f) => <FilterSelect key={f.key} f={f} />)}
                      {teamView && d.level("tasks.filter-owner") !== 1 && (
                        <Select value={owner} onValueChange={setOwner}>
                          <SelectTrigger className="h-8 w-44 text-xs" aria-label="Owner"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Everyone">Everyone</SelectItem>
                            {seatsOf(session.business).filter((x) => x.role !== "marketer").map((x) => (
                              <SelectItem key={x.user} value={x.user}>{x.user === session.user ? `${x.user} (me)` : x.user}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </Door>
                </div>
              )}
              <div className="min-w-64 flex-1">
                <Door id="tasks.options" label="Table options: columns, export">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={showOwnerColumn} disabled={!teamView} onCheckedChange={() => setOwner((o) => (o === "Everyone" ? session.user : "Everyone"))} />
                      Owner column
                    </label>
                    <Actions surface="card" items={[{ kind: "secondary", label: "Export CSV", onClick: () => say(`${rows.length} tasks exported as CSV.`) }]} />
                  </div>
                </Door>
              </div>
            </div>
          </div>

          {selection.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-y bg-muted/50 px-4 py-2 text-sm sm:px-6">
              <span className="tabular-nums">{selection.length} selected</span>
              <Actions
                surface="card"
                items={([
                  { kind: "secondary", label: "Done", onClick: () => { selection.forEach((id) => { const t = all.find((x) => x.id === id); if (t) done(t) }); setSelection([]) } },
                  { kind: "secondary", label: "Snooze", onClick: () => { selection.forEach((id) => { const t = all.find((x) => x.id === id); if (t) snooze(t) }); setSelection([]) } },
                  { kind: "secondary", label: "Skip", onClick: () => { selection.forEach((id) => { const t = all.find((x) => x.id === id); if (t) skip(t) }); setSelection([]) } },
                ]) as Action[]}
              />
              {teamView && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7">Reassign</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {seatsOf(session.business).filter((s) => s.role !== "marketer").map((s) => (
                      <DropdownMenuItem key={s.user} onSelect={() => { selection.forEach((id) => { const t = all.find((x) => x.id === id); if (t) reassign(t, s.user) }); setSelection([]) }}>{s.user}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button size="sm" variant="ghost" className="h-7" onClick={() => setSelection([])}>Clear</Button>
            </div>
          )}

          <div role="list" aria-label="Tasks" className="min-h-0 flex-1 overflow-y-auto border-t">
            {rows.length === 0 ? (
              <div className="p-6">
                {q || Object.values(filters).some((v) => v && v !== "all" && v !== "All open")
                  ? <EmptyState title="Nothing matches." body="Clear the search or a filter." action={<Button size="sm" variant="outline" onClick={() => { setQ(""); setFilters({ due: "All open" }) }}>Clear</Button>} />
                  : openRows.length === 0
                    ? <EmptyState title="Done for today." body={`${counts.tomorrow} due tomorrow.`} action={<Button size="sm" variant="outline" onClick={() => setFilters({ due: "This week" })}>See this week</Button>} />
                    : <EmptyState title="Nothing due." body="Tasks arrive from sequences you own and from deals and accounts assigned to you." action={<Actions surface="card" items={[{ kind: "secondary", label: "New task", onClick: () => setNewTask(true) }]} />} />}
              </div>
            ) : rows.map((t) => <Row key={t.id} t={t} />)}
          </div>
        </DoorGroup>
      )}

      {/* -------------------------------------------------------------------------- the panels */}
      {calling && <CallLogPanel session={session} task={calling} say={say} open onOpenChange={(o) => { if (!o) setCalling(null) }} onLogged={() => { done(calling); setCalling(null) }} />}
      {linking && <LinkedInPanel session={session} task={linking} say={say} open onOpenChange={(o) => { if (!o) setLinking(null) }} onComplete={() => { done(linking); setLinking(null) }} />}
      {meeting && (
        <MeetingPanel
          session={session} open onOpenChange={(o) => { if (!o) setMeeting(null) }}
          contactId={meeting.contactId} contactName={meeting.contact} company={meeting.company}
          meeting={seed.meetings.find((m) => m.taskId === meeting.id) ?? null}
          dealId={meeting.dealId} sequence={meeting.sequence} say={say}
        />
      )}

      <Panel
        id="x-task" title="New task" open={newTask} onOpenChange={setNewTask}
        footer={<Actions surface="dialog" items={[{ kind: "primary", label: "Create the task", onClick: () => { setNewTask(false); say("Task created, due today.") } }]} />}
      >
        <div className="space-y-3">
          <label className="block text-xs text-muted-foreground">Contact<Input className="mt-1 h-8" placeholder="Search people" aria-label="Contact" /></label>
          <label className="block text-xs text-muted-foreground">
            Type
            <Select defaultValue="Call">
              <SelectTrigger className="mt-1 h-8" aria-label="Type"><SelectValue /></SelectTrigger>
              <SelectContent>{KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="block text-xs text-muted-foreground">Due<Input className="mt-1 h-8" type="date" defaultValue={TODAY} aria-label="Due date" /></label>
          <label className="block text-xs text-muted-foreground">Title<Input className="mt-1 h-8" aria-label="Title" /></label>
          <label className="block text-xs text-muted-foreground">Note<Textarea className="mt-1" rows={3} aria-label="Note" /></label>
          {teamView && (
            <label className="block text-xs text-muted-foreground">
              Owner
              <Select defaultValue={session.user}>
                <SelectTrigger className="mt-1 h-8" aria-label="Owner"><SelectValue /></SelectTrigger>
                <SelectContent>{seatsOf(session.business).filter((s) => s.role !== "marketer").map((s) => <SelectItem key={s.user} value={s.user}>{s.user}</SelectItem>)}</SelectContent>
              </Select>
            </label>
          )}
        </div>
      </Panel>

      {bar}
    </div>
  )
}
