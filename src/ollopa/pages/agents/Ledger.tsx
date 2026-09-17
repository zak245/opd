// The ledger: every event, newest first, one click from the page it is on.
//
// It holds everything that does not need a decision — research, scores, saved drafts, routed records,
// and the records a run passed over — each with what it cost and, where it was never queued, an Undo,
// because "reversible, so we did not ask you" is a claim that needs a control behind it.
import { useEffect, useMemo, useRef, useState } from "react"
import { MoreHorizontal, Printer, Search, SlidersHorizontal, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { href } from "@/app/router"
import { Door, DoorGroup, ExpandAll } from "../../ui/Door"
import { Panel } from "../../ui/Panel"
import { EmptyState } from "../../ui/EmptyState"
import { SectionHeader } from "../../ui/SectionHeader"
import type { Disclosure } from "../../ui/useDisclosure"
import { SURFACES, type AgentEvent, type Seed } from "../../data/seed"
import type { Session } from "../../session"
import { day, dayGroup } from "../deal/format"
import {
  AGENT_NAMES, KIND_LABEL, SURFACE_LABEL, type LocalDecision, type RuleFlags, adminOf, digestOf, expired,
  hasTeammateFilter, queueOwner,
} from "./model"

const KINDS: AgentEvent["kind"][] = ["researched", "drafted", "scored", "proposed", "sent", "paused", "capped", "skipped"]
const STATUSES: AgentEvent["status"][] = ["waiting", "waiting-second", "approved", "declined", "done", "paused", "snoozed"]

export interface Filters {
  q: string
  agent: string
  who: string
  date: string
  status: string
  kind: string
  person: string
  surface: string
}

export const NO_FILTERS: Filters = { q: "", agent: "all", who: "all", date: "all", status: "all", kind: "all", person: "all", surface: "all" }

export function activeCount(f: Filters): number {
  return (Object.keys(NO_FILTERS) as (keyof Filters)[]).filter((k) => f[k] !== NO_FILTERS[k]).length
}

/** The outcome in one word, because waiting, paused and declined must never be only a colour. */
function outcomeOf(e: AgentEvent, local?: LocalDecision): string {
  if (local) {
    if (local.status === "approved") return local.edited ? "Approved, edited" : "Approved"
    if (local.status === "declined") return "Declined"
    if (local.status === "handed") return `Handed to ${local.to}`
    return "Snoozed"
  }
  if (expired(e) && (e.status === "waiting" || e.status === "waiting-second")) return "Expired unapproved"
  if (e.kind === "skipped") return "Skipped"
  if (e.status === "approved") return "Approved"
  if (e.status === "declined") return "Declined"
  if (e.status === "paused") return "Paused"
  if (e.status === "waiting-second") return "Waiting for a second approval"
  if (e.status === "waiting") return "Waiting"
  return "Done"
}

export interface LedgerProps {
  /** Which of the case's six rules have landed. Every flag is true in the product. */
  rules: RuleFlags
  events: AgentEvent[]
  /** Every event this seat may read, for the "38 of 60" count. */
  total: number
  seed: Seed
  session: Session
  d: Disclosure
  filters: Filters
  onFilters: (f: Filters) => void
  local: Record<string, LocalDecision>
  undone: Record<string, { by: string; at: string }>
  onUndo: (e: AgentEvent) => void
  searchRef: React.RefObject<HTMLInputElement | null>
  focusedId: string | null
}

export function Ledger(p: LedgerProps) {
  const { seed, session, d, filters: f, rules } = p
  const [sheet, setSheet] = useState(false)
  const [hidden, setHidden] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(`ollopa.agents.columns.${session.user}`) ?? "[]") as string[] } catch { return [] }
  })
  useEffect(() => {
    try { localStorage.setItem(`ollopa.agents.columns.${session.user}`, JSON.stringify(hidden)) } catch { /* private mode */ }
  }, [hidden, session.user])

  const admin = adminOf(session.business)
  const teammates = hasTeammateFilter(session.role, session.business)
  const people = useMemo(() => [...new Set(seed.agentEvents.map((e) => queueOwner(e)))].sort(), [seed, session.business])
  const whoOptions = useMemo(
    () => [...new Set(p.events.concat(seed.agentEvents).map((e) => e.contact ?? e.company).filter(Boolean) as string[])].sort().slice(0, 60),
    [p.events, seed],
  )

  // Promoted out of the door at 20% or more for this seat at this business; the label says what is left.
  const promoted = {
    kind: d.atLevelOne("act.filter-kind"),
    status: d.atLevelOne("act.filter-status"),
    date: d.atLevelOne("act.filter-date"),
    person: teammates && d.atLevelOne("act.filter-person"),
    surface: d.atLevelOne("act.surface"),
  }
  const inDoor = [
    !promoted.date && "date", !promoted.status && "outcome", !promoted.kind && "kind",
    teammates && !promoted.person && "teammate", !promoted.surface && "surface",
  ].filter(Boolean) as string[]

  const set = (patch: Partial<Filters>) => p.onFilters({ ...f, ...patch })

  const chips = (Object.keys(NO_FILTERS) as (keyof Filters)[])
    .filter((k) => k !== "q" && f[k] !== NO_FILTERS[k])
    .map((k) => ({ k, label: `${k === "who" ? "Contact or company" : k === "person" ? "Teammate" : k[0].toUpperCase() + k.slice(1)}: ${f[k]}` }))

  const days = useMemo(() => {
    const groups = new Map<string, AgentEvent[]>()
    for (const e of p.events) groups.set(e.when, [...(groups.get(e.when) ?? []), e])
    return [...groups].sort((a, b) => b[0].localeCompare(a[0]))
  }, [p.events])

  const filterControls = (
    <>
      <Select value={f.agent} onValueChange={(v) => set({ agent: v })}>
        <SelectTrigger data-item="act.filter-agent" data-item-label="Filter by agent" className="h-8 w-40" aria-label="Agent"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Every agent</SelectItem>
          {AGENT_NAMES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={f.who} onValueChange={(v) => set({ who: v })}>
        <SelectTrigger data-item="act.filter-contact" data-item-label="Filter by contact or company" className="h-8 w-48" aria-label="Contact or company"><SelectValue /></SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectItem value="all">Any contact or company</SelectItem>
          {whoOptions.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
        </SelectContent>
      </Select>
      {promoted.surface && <SurfaceFilter value={f.surface} onChange={(v) => set({ surface: v })} />}
      {promoted.person && teammates && <PersonFilter value={f.person} people={people} onChange={(v) => set({ person: v })} />}
      {promoted.kind && <KindFilter value={f.kind} onChange={(v) => set({ kind: v })} />}
      {promoted.status && <StatusFilter value={f.status} onChange={(v) => set({ status: v })} />}
      {promoted.date && <DateFilter value={f.date} onChange={(v) => set({ date: v })} />}
    </>
  )

  const doorControls = (
    <div className="flex flex-wrap gap-2 py-1">
      {!promoted.date && <DateFilter value={f.date} onChange={(v) => set({ date: v })} />}
      {!promoted.status && <StatusFilter value={f.status} onChange={(v) => set({ status: v })} />}
      {!promoted.kind && <KindFilter value={f.kind} onChange={(v) => set({ kind: v })} />}
      {teammates && !promoted.person && <PersonFilter value={f.person} people={people} onChange={(v) => set({ person: v })} />}
      {!promoted.surface && <SurfaceFilter value={f.surface} onChange={(v) => set({ surface: v })} />}
    </div>
  )

  const showContact = !hidden.includes("contact")
  const showOutcome = !hidden.includes("outcome")
  const showSurface = d.atLevelOne("act.surface") || f.surface !== "all"

  return (
    <DoorGroup>
    <section aria-labelledby="agents-activity" data-container="ledger" data-container-label="the activity ledger" className="mt-8">
      <div className="flex flex-wrap items-center gap-2">
        <SectionHeader
          title={teammates ? "Activity" : "Your contacts’ activity"}
          count={p.events.length}
          className="pb-0"
        />
        <div className="ml-auto flex items-center gap-1">
          {rules.r5 && <span data-item="act.expand-all" data-item-label="Expand all steps or collapse all"><ExpandAll /></span>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label="More actions for the activity list">
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {(session.role === "admin" || session.role === "marketer") && (
                <DropdownMenuItem onSelect={() => toastCsv(p.events.length)}>Export CSV</DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => window.print()}>Print<DropdownMenuShortcut><Printer className="size-3.5" /></DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Show or hide columns</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={showContact} onCheckedChange={(v) => setHidden((h) => (v ? h.filter((x) => x !== "contact") : [...h, "contact"]))}>Contact or company</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showOutcome} onCheckedChange={(v) => setHidden((h) => (v ? h.filter((x) => x !== "outcome") : [...h, "outcome"]))}>Outcome</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <h2 id="agents-activity" className="sr-only">Activity</h2>

      {!teammates && admin && (
        <p className="text-xs text-muted-foreground">Everyone’s activity is visible to {admin.user}, {admin.title}.</p>
      )}

      {/* Search and the filters. One door, labelled by what is still inside it. */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            ref={p.searchRef}
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Search the activity"
            aria-label="Search the activity"
            data-item="act.search" data-item-label="Search the ledger"
            className="h-8 w-56 pl-7"
          />
        </div>
        <div className="hidden flex-wrap items-center gap-2 sm:flex">{filterControls}</div>
        <Button variant="outline" size="sm" className="h-8 sm:hidden" onClick={() => setSheet(true)}>
          <SlidersHorizontal className="size-3.5" aria-hidden="true" />
          Filters{activeCount(f) > 0 ? ` · ${activeCount(f)}` : ""}
        </Button>
      </div>

      {inDoor.length > 0 && (
        <div className="mt-2 hidden rounded-md border sm:block">
          <Door id="agents.filters" label={`${inDoor[0][0].toUpperCase() + inDoor[0].slice(1)}${inDoor.length > 1 ? ", " + inDoor.slice(1).join(", ") : ""}`}>
            {doorControls}
          </Door>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="tabular-nums">{p.events.length} of {p.total} events</span>
        {chips.map((c) => (
          <Badge key={c.k} variant="secondary" className="gap-1 font-normal">
            {c.label}
            <button className="underline underline-offset-2" onClick={() => set({ [c.k]: NO_FILTERS[c.k] } as Partial<Filters>)}>Clear</button>
          </Badge>
        ))}
        {f.q && (
          <Badge variant="secondary" className="gap-1 font-normal">
            Search: {f.q}
            <button className="underline underline-offset-2" onClick={() => set({ q: "" })}>Clear</button>
          </Badge>
        )}
      </div>

      {/* The columns, at the widths that fit. Below `sm` every row is two lines and the header goes. */}
      <div className="mt-3 hidden grid-cols-[6.5rem_9rem_minmax(0,1fr)_10rem_9rem_5rem_4.5rem] gap-3 border-b px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:grid"
        style={{ gridTemplateColumns: columnTemplate(showContact, showOutcome, showSurface, rules.r4, rules.r2) }}>
        <span>When</span>
        {rules.r4 && <span data-item="act.actor" data-item-label="Actor">Actor</span>}
        <span>What happened</span>
        {showContact && <span>Contact or company</span>}
        {showOutcome && <span>Outcome</span>}
        {showSurface && <span>Surface</span>}
        {rules.r2 && <span data-item="act.credits-per-event" data-item-label="Credits per event" className="text-right">Credits</span>}
      </div>

      <div>
        {days.length === 0 && (
          <div className="mt-4">
            <EmptyState
              title="Nothing matches"
              body="Clear the search or a filter to see the rest of the activity."
              action={<Button size="sm" variant="outline" onClick={() => p.onFilters(NO_FILTERS)}>Clear every filter</Button>}
            />
          </div>
        )}
        {days.map(([when, events]) => {
          const digest = digestOf(events)
          return (
            <div key={when}>
              <h3 {...(rules.r2 ? { "data-item": `act.day-digest.${when}`, "data-item-label": `Digest for ${dayGroup(when)}` } : {})}
                className="sticky top-0 z-[1] flex flex-wrap items-baseline gap-x-2 border-b bg-background/95 py-1.5 text-xs backdrop-blur">
                <span className="font-semibold">{dayGroup(when)}</span>
                {rules.r2 && <span className="text-muted-foreground">
                  {digest.count} {digest.count === 1 ? "event" : "events"} · {digest.kinds} · <span className="tabular-nums">{digest.credits.toLocaleString()}</span> {digest.credits === 1 ? "credit" : "credits"}
                </span>}
              </h3>
              <ul className="divide-y">
                {events.map((e) => (
                  <Row
                    key={e.id}
                    rules={rules}
                    e={e}
                    seed={seed}
                    session={session}
                    local={p.local[e.id]}
                    undone={p.undone[e.id]}
                    onUndo={() => p.onUndo(e)}
                    showContact={showContact}
                    showOutcome={showOutcome}
                    showSurface={showSurface}
                    focused={p.focusedId === e.id}
                  />
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <Panel id="agents-filter-sheet" title="Filters: agent, contact, date, outcome, kind, teammate, surface" side="bottom" open={sheet} onOpenChange={setSheet}
        footer={<div className="flex w-full gap-2"><Button variant="outline" className="flex-1" onClick={() => p.onFilters(NO_FILTERS)}>Clear every filter</Button><Button className="flex-1" onClick={() => setSheet(false)}>Show {p.events.length} events</Button></div>}>
        <div className="grid gap-3">
          {filterControls}
          {doorControls}
        </div>
      </Panel>
    </section>
    </DoorGroup>
  )
}

function columnTemplate(contact: boolean, outcome: boolean, surface: boolean, actor = true, credits = true): string {
  return ["6.5rem", actor && "9.5rem", "minmax(0,1fr)", contact && "10rem", outcome && "9.5rem", surface && "5.5rem", credits && "4.5rem"].filter(Boolean).join(" ")
}

function Row({ rules, e, seed, session, local, undone, onUndo, showContact, showOutcome, showSurface, focused }: {
  rules: RuleFlags; e: AgentEvent; seed: Seed; session: Session; local?: LocalDecision; undone?: { by: string; at: string }
  onUndo: () => void; showContact: boolean; showOutcome: boolean; showSurface: boolean; focused: boolean
}) {
  const row = useRef<HTMLLIElement>(null)
  useEffect(() => { if (focused) row.current?.focus() }, [focused])
  const outcome = undone ? `Undone by ${undone.by} ${undone.at}` : outcomeOf(e, local)
  const decidedBy = local
    ? `${local.status === "approved" ? "Approved" : local.status === "declined" ? "Declined" : "Moved"} by ${local.by}${local.forOwner ? ` for ${local.forOwner}` : ""} ${local.at}`
    : e.decidedBy
      ? `${e.decision === "approved" ? "Approved" : "Declined"} by ${e.decidedBy}${e.decidedAsAdmin ? ` for ${queueOwner(e)}` : ""} ${day(e.decidedAt ?? e.when)}`
      : null

  return (
    <li ref={row} tabIndex={-1} data-ledger-item={e.id}
      data-item={`act.row.${e.id}`} data-item-label={e.summary}
      className={cn("py-1.5 outline-none", focused && "ring-2 ring-ring")}>
      <div
        className="grid grid-cols-1 gap-x-3 px-2 text-sm sm:grid"
        style={{ gridTemplateColumns: undefined }}
      >
        <div className="hidden sm:grid sm:gap-3" style={{ gridTemplateColumns: columnTemplate(showContact, showOutcome, showSurface, rules.r4, rules.r2) }}>
          <span className="tabular-nums text-muted-foreground">{e.at}</span>
          {rules.r4 && <span className="truncate">{e.surface === "mcp" || e.surface === "cli" ? e.actorUser : e.agent}</span>}
          <span className="min-w-0">
            {e.summary}
            {e.kind === "skipped" && e.skipReason && <span className="text-muted-foreground"> · {e.skipReason}</span>}
          </span>
          {showContact && (
            <span className="truncate text-muted-foreground">
              {e.contactId ? <a className="hover:underline" href={href(`/ollopa/people/${e.contactId}`)}>{e.contact ?? e.company}</a> : e.contact ?? e.company ?? "—"}
            </span>
          )}
          {showOutcome && <span className="truncate text-muted-foreground">{outcome}</span>}
          {showSurface && <span className="text-muted-foreground">{SURFACE_LABEL[e.surface]}</span>}
          {rules.r2 && <span className="text-right tabular-nums">{e.credits.toLocaleString()}<span className="sr-only"> credits</span></span>}
        </div>

        {/* Phone: two lines, the same words, nothing moved to a third level. */}
        <div className="sm:hidden">
          <div className="flex items-baseline gap-2">
            <span className="min-w-0 flex-1">{e.summary}</span>
            <span className="shrink-0 tabular-nums">{e.credits.toLocaleString()}<span className="sr-only"> credits</span></span>
          </div>
          <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
            <span className="tabular-nums">{e.at}</span>
            <span>{e.surface === "mcp" || e.surface === "cli" ? e.actorUser : e.agent}</span>
            {e.contact && <span className="truncate">{e.contact}</span>}
            <span>{outcome}</span>
            <span>{SURFACE_LABEL[e.surface]}</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-1 px-2">
        <div className="min-w-0 flex-1">
          <Door id={`agents.steps.${e.id}`}
            label={rules.r4 ? `Step log · ${e.steps.length} ${e.steps.length === 1 ? "step" : "steps"} · ${e.steps.reduce((n, s) => n + s.credits, 0)} credits` : "Details"}>
            <ol className="grid gap-1">
              {e.steps.map((s, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="tabular-nums text-muted-foreground">{s.at}</span>
                  <span className="min-w-0 flex-1">
                    {s.source ? <a className="underline underline-offset-4" href={s.source}>{s.text}</a> : s.text}
                  </span>
                  {rules.r5 && <span className="tabular-nums text-muted-foreground">{s.credits} credits</span>}
                </li>
              ))}
              {decidedBy && <li className="pt-1 text-muted-foreground">{decidedBy}</li>}
              {undone && <li className="pt-1 text-muted-foreground">Undone by {undone.by} {undone.at}. Nothing was refunded.</li>}
            </ol>
          </Door>
        </div>
        {e.undoable && !undone && (
          <Button variant="ghost" size="sm" className="mt-1 h-7 shrink-0 px-2 text-xs" onClick={onUndo}>
            <Undo2 className="size-3.5" aria-hidden="true" />Undo
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="mt-1 size-7 shrink-0" aria-label={`More actions for ${e.summary}`}>
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            {e.contactId && <DropdownMenuItem asChild><a href={href(`/ollopa/people/${e.contactId}`)}>Open the contact</a></DropdownMenuItem>}
            <DropdownMenuItem onSelect={() => document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: `Re-running ${e.agent.toLowerCase()} on ${e.company ?? e.contact}: about 12 credits.` }))}>
              Run again with a note
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: "Flagged. The agent was told. Nothing was undone." }))}>
              Flag a wrong result
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { void navigator.clipboard?.writeText(`${location.origin}${location.pathname}#/ollopa/agents?event=${e.id}`); document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: "Link copied." })) }}>
              Copy a link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}

function toastCsv(n: number) {
  document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: `Exported ${n.toLocaleString()} events as CSV, with the filters you are looking at.` }))
}

function KindFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger data-item="act.filter-kind" data-item-label="Filter by kind of event" className="h-8 w-40" aria-label="Kind"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Every kind</SelectItem>
        {KINDS.map((k) => <SelectItem key={k} value={k}>{KIND_LABEL[k]}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

function StatusFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger data-item="act.filter-status" data-item-label="Filter by outcome" className="h-8 w-44" aria-label="Outcome"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Every outcome</SelectItem>
        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "waiting-second" ? "Waiting for a second approval" : s[0].toUpperCase() + s.slice(1)}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

function DateFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger data-item="act.filter-date" data-item-label="Date range" className="h-8 w-36" aria-label="Date range"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Every day</SelectItem>
        <SelectItem value="today">Today</SelectItem>
        <SelectItem value="3d">Last three days</SelectItem>
        <SelectItem value="7d">Last seven days</SelectItem>
      </SelectContent>
    </Select>
  )
}

function SurfaceFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger data-item="act.surface" data-item-label="Which surface a run came from" className="h-8 w-36" aria-label="Surface"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Every surface</SelectItem>
        {SURFACES.map((s) => <SelectItem key={s} value={s}>{SURFACE_LABEL[s]}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

function PersonFilter({ value, people, onChange }: { value: string; people: string[]; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger data-item="act.filter-person" data-item-label="Filter by teammate" className="h-8 w-44" aria-label="Teammate"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Everyone</SelectItem>
        {people.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
