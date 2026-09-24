// The ⌘K palette: the accelerator, never the only path to anything.
//
// It reaches every node in `map.ts` the seat holds, plus records by name from seed. Every row prints
// its path, so a person learns where the thing lives; every page row prints its `g` shortcut, so a
// daily user stops needing the palette for the pages they visit most. A page the profile left out is
// a normal result marked "not in your sidebar". A page the seat does not hold is one unselectable
// row naming the seats that use it and the admin to ask — hidden with an explanation, never silently.
// Nothing here approves anything: the approvals row opens the queue, where the consequence line is.
import { useEffect, useMemo, useRef, useState } from "react"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"
import { navigate, openInNewTab } from "@/app/router"
import { clearTrail } from "../chain"
import { businessById } from "../data/businesses"
import { seedFor } from "../data/seed"
import { NODES, routeTo, seatsSentence, SETTING_SYNONYMS, type MapNode } from "../map"
import { NAV, navItem, notInSidebar, seatCarries, sidebarFor } from "../nav"
import { itemsFor, weeklyUse } from "../usage"
import type { Business, Role } from "../usage/model"
import type { Session } from "../session"
import { TODAY } from "./notifications"

export interface Row {
  id: string
  group: string
  label: string
  /** The muted line under or beside the label: where this thing lives. */
  path: string
  target?: string
  shortcut?: string
  note?: string
  /** An explanation row: shown, never selectable. */
  explanation?: boolean
  run?: () => void
}

const GROUPS = ["Recent", "Pages", "Settings", "People", "Companies", "Deals", "Sequences", "Lists", "Campaigns", "Actions"]

const recentKey = (b: Business, r: Role) => `ollopa.recent.${b}.${r}`

export function recentRows(business: Business, role: Role): Row[] {
  try {
    const raw = localStorage.getItem(recentKey(business, role))
    return raw ? (JSON.parse(raw) as Row[]).slice(0, 8) : []
  } catch {
    return []
  }
}

/** Recent is the one adaptive element in the product: it adds a section and nothing else moves. */
export function remember(business: Business, role: Role, row: Row) {
  if (!row.target) return
  const rows = recentRows(business, role).filter((r) => r.target !== row.target)
  try {
    localStorage.setItem(recentKey(business, role), JSON.stringify([{ ...row, group: "Recent" }, ...rows].slice(0, 8)))
  } catch { /* ignore */ }
}

function money(n: number) { return "$" + n.toLocaleString() }

/** seed gains lists and campaigns from the data builder; the palette reads them when they land. */
function optional<T>(seed: object, key: string): T[] {
  const value = (seed as Record<string, unknown>)[key]
  return Array.isArray(value) ? (value as T[]) : []
}

function pageRows(session: Session): Row[] {
  const sidebar = sidebarFor(session, TODAY)
  const outside = notInSidebar(session, TODAY)
  const rows: Row[] = []
  for (const entry of sidebar) {
    rows.push({
      id: `page-${entry.item.page}`,
      group: "Pages",
      label: entry.item.label,
      path: entry.item.group === "top" || entry.item.group === "bottom" ? "Sidebar" : `Sidebar › ${entry.item.group}`,
      target: `/ollopa/${entry.item.page === "home" ? "" : entry.item.page}`.replace(/\/$/, ""),
      shortcut: `g ${entry.item.key}`,
    })
  }
  for (const item of outside) {
    rows.push({
      id: `page-${item.page}`,
      group: "Pages",
      label: item.label,
      path: item.group === "top" || item.group === "bottom" ? "Sidebar" : `Sidebar › ${item.group}`,
      target: `/ollopa/${item.page}`,
      shortcut: `g ${item.key}`,
      note: "not in your sidebar",
    })
  }
  return rows
}

/**
 * Settings results are the areas and the settings themselves, each with the path it lives at, so the
 * palette teaches where a thing is rather than replacing the walk to it. A setting the seat never
 * touches is not a result; a decision-critical one always is.
 */
function settingsRows(session: Session): Row[] {
  const areas = NODES.filter((n) => n.type === "settings area" && n.seats.includes(session.role))
  const rows: Row[] = areas.map((n) => ({
    id: n.id,
    group: "Settings",
    label: n.name,
    path: `Settings › ${n.name}`,
    target: routeTo(n),
  }))
  for (const item of itemsFor("settings")) {
    const area = areas.find((n) => n.name === item.area)
    if (!area) continue
    if (!item.critical && weeklyUse(item, session.business, session.role, session.hasReports) === 0) continue
    rows.push({
      id: item.id,
      group: "Settings",
      label: item.label,
      path: `Settings › ${item.area}`,
      target: routeTo(area),
    })
  }
  return rows
}

const WHERE: Record<string, string> = {
  "W-setup": "Settings › How your team works",
  "W-import": "People, Companies or Lists › Import and enrich",
  "W-connect": "Settings › Integrations",
  "P-templates": "Sequences › Templates and snippets",
}

/** Destinations that are not sidebar entries: reached by link, by ⌘K or by deep link. */
function otherNodeRows(session: Session): Row[] {
  return NODES.filter(
    (n) => (n.type === "wizard" || n.type === "surface" || (n.type === "page" && !navItem(n.page))) && n.route && n.seats.includes(session.role),
  ).map((n) => ({
    id: n.id,
    group: "Pages",
    label: n.name,
    path: WHERE[n.id] ?? "Settings › API, webhooks, MCP and CLI",
    target: routeTo(n, "salesforce"),
  }))
}

function matches(row: Row, q: string, node?: MapNode) {
  const synonyms = [...(node?.synonyms ?? []), ...(SETTING_SYNONYMS[row.label] ?? [])]
  return `${row.label} ${row.path} ${synonyms.join(" ")}`.toLowerCase().includes(q)
}

function seatGapRow(q: string, session: Session): Row | null {
  const b = businessById(session.business)
  const admin = b.roles.find((r) => r.role === "admin")
  const hit = NAV.find((n) => n.label.toLowerCase().startsWith(q) && !seatCarries(n.page, session.business, session.role))
  if (!hit) return null
  return {
    id: `gap-${hit.page}`,
    group: "Pages",
    label: hit.label,
    path: `${hit.label} is used by ${seatsSentence(hit.page)}. Ask ${admin ? `${admin.user} (${admin.title})` : "your admin"}.`,
    explanation: true,
  }
}

function actionRows(session: Session, close: () => void): Row[] {
  const toast = (text: string) => document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: text }))
  const rows: Row[] = []
  const add = (id: string, label: string, path: string, run: () => void) => rows.push({ id, group: "Actions", label, path, run })
  if (seatCarries("lists", session.business, session.role)) add("a-list", "New list", "Lists", () => { close(); navigate("/ollopa/lists"); toast("New list: name it on Lists.") })
  if (session.role === "sdr" || session.role === "admin") add("a-seq", "New sequence", "Sequences", () => { close(); navigate("/ollopa/sequences"); toast("New sequence: name it on Sequences.") })
  if (session.role === "ae" || session.role === "admin") add("a-deal", "New deal", "Deals", () => { close(); navigate("/ollopa/deals"); toast("New deal: fill it in on Deals.") })
  if (seatCarries("tasks", session.business, session.role)) add("a-task", "New task", "Tasks", () => { close(); navigate("/ollopa/tasks"); toast("New task: fill it in on Tasks.") })
  if (seatCarries("agents", session.business, session.role)) add("a-appr", "Agent items waiting for approval", "Agents, filtered to pending", () => { close(); navigate("/ollopa/agents?filter=pending") })
  add("a-bell", "Open notifications", "Notifications", () => { close(); document.dispatchEvent(new CustomEvent("ollopa:bell")) })
  add("a-theme", "Change theme", "Account menu", () => { close(); toast("Theme is in the account menu: light, dark or system.") })
  add("a-switch", "Switch account", "Account menu", () => { close(); document.dispatchEvent(new CustomEvent("ollopa:switch")) })
  add("a-signout", "Sign out", "Account menu", () => { close(); document.dispatchEvent(new CustomEvent("ollopa:signout")) })
  return rows
}

interface Stage { kind: "sequence" | "list"; name: string }

export function Palette({ session, open, onOpenChange }: { session: Session; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [q, setQ] = useState("")
  const [index, setIndex] = useState(0)
  const [stage, setStage] = useState<Stage | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const seed = seedFor(session.business)

  useEffect(() => {
    if (open) {
      returnTo.current = document.activeElement as HTMLElement
      setQ(""); setIndex(0); setStage(null)
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const close = () => { onOpenChange(false); returnTo.current?.focus() }

  const rows = useMemo<Row[]>(() => {
    if (!open) return []
    const needle = q.trim().toLowerCase()

    if (stage) {
      const source = stage.kind === "sequence" ? seed.sequences.map((s) => ({ id: s.id, name: s.name, note: s.status })) : optional<{ id: string; name: string }>(seed, "lists")
      return source
        .filter((s) => s.name.toLowerCase().includes(needle))
        .slice(0, 8)
        .map((s) => ({
          id: `stage-${s.id}`,
          group: stage.kind === "sequence" ? "Sequences" : "Lists",
          label: s.name,
          path: `Add ${stage.name} to ${stage.kind === "sequence" ? "this sequence" : "this list"}`,
          run: () => {
            close()
            document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: `${stage.name} added to ${s.name}.` }))
          },
        }))
    }

    const pages = [...pageRows(session), ...otherNodeRows(session)]
    const settings = settingsRows(session)
    const actions = actionRows(session, close)

    // Nothing typed: Recent, then this seat's sidebar in sidebar order, then the actions. Everything
    // else in the map is one keystroke away and does not belong in a list nobody asked for.
    if (!needle) {
      return [...recentRows(session.business, session.role), ...pageRows(session).filter((r) => !r.note), ...actions]
    }

    const nodeOf = (id: string) => NODES.find((n) => n.id === id)
    const out: Row[] = []
    const gap = seatGapRow(needle, session)

    out.push(...pages.filter((r) => matches(r, needle)).slice(0, 5))
    if (gap) out.push(gap)
    out.push(...settings.filter((r) => matches(r, needle, nodeOf(r.id))).slice(0, 5))

    if (seatCarries("people", session.business, session.role)) {
      const people = seed.contacts.filter((c) => `${c.name} ${c.title} ${c.company}`.toLowerCase().includes(needle))
      out.push(...people.slice(0, 5).map<Row>((c) => ({
        id: c.id, group: "People", label: c.name, path: `People › ${c.name} · ${c.title}, ${c.company}`, target: `/ollopa/people/${c.id}`,
      })))
      if (people.length > 5) out.push({ id: "more-people", group: "People", label: `Show all ${people.length} in People`, path: "People, search prefilled", target: `/ollopa/people?q=${encodeURIComponent(q.trim())}` })
    }
    if (seatCarries("companies", session.business, session.role)) {
      const cos = seed.companies.filter((c) => `${c.name} ${c.domain} ${c.industry}`.toLowerCase().includes(needle))
      out.push(...cos.slice(0, 5).map<Row>((c) => ({
        id: c.id, group: "Companies", label: c.name, path: `Companies › ${c.domain} · ${c.stage}`, target: `/ollopa/companies/${c.id}`,
      })))
      if (cos.length > 5) out.push({ id: "more-cos", group: "Companies", label: `Show all ${cos.length} in Companies`, path: "Companies, search prefilled", target: `/ollopa/companies?q=${encodeURIComponent(q.trim())}` })
    }
    if (seatCarries("deals", session.business, session.role)) {
      const deals = seed.deals.filter((d) => `${d.name} ${d.company} ${d.stage}`.toLowerCase().includes(needle))
      out.push(...deals.slice(0, 5).map<Row>((d) => ({
        id: d.id, group: "Deals", label: d.name, path: `Deals › ${d.company} · ${d.stage} · ${money(d.amount)} · ${d.owner}`, target: `/ollopa/deals/${d.id}`,
      })))
    }
    if (seatCarries("sequences", session.business, session.role)) {
      const seqs = seed.sequences.filter((s) => s.name.toLowerCase().includes(needle))
      out.push(...seqs.slice(0, 5).map<Row>((s) => ({
        id: s.id, group: "Sequences", label: s.name, path: `Sequences › ${s.status} · ${s.active} active`, target: `/ollopa/sequences/${s.id}`,
      })))
    }
    if (seatCarries("lists", session.business, session.role)) {
      const lists = optional<{ id: string; name: string; type?: string; records?: number }>(seed, "lists").filter((l) => l.name.toLowerCase().includes(needle))
      out.push(...lists.slice(0, 5).map<Row>((l) => ({
        id: l.id, group: "Lists", label: l.name, path: `Lists › ${l.type ?? "List"}${l.records ? ` · ${l.records} records` : ""}`, target: `/ollopa/lists/${l.id}`,
      })))
    }
    if (seatCarries("campaigns", session.business, session.role)) {
      const camps = optional<{ id: string; name: string; status?: string }>(seed, "campaigns").filter((c) => c.name.toLowerCase().includes(needle))
      out.push(...camps.slice(0, 5).map<Row>((c) => ({
        id: c.id, group: "Campaigns", label: c.name, path: `Campaigns › ${c.status ?? "Draft"}`, target: `/ollopa/campaigns/${c.id}`,
      })))
    }
    out.push(...actions.filter((r) => matches(r, needle)).slice(0, 5))

    // A highlighted contact brings its two record-scoped commands, staged inside this same dialog.
    const person = out.find((r) => r.group === "People" && !r.label.startsWith("Show all"))
    if (person) {
      if (seatCarries("sequences", session.business, session.role)) {
        out.push({ id: "stage-seq", group: "Actions", label: `Add ${person.label} to sequence…`, path: "One more choice, in this dialog", run: () => { setStage({ kind: "sequence", name: person.label }); setQ(""); setIndex(0) } })
      }
      if (seatCarries("lists", session.business, session.role)) {
        out.push({ id: "stage-list", group: "Actions", label: `Add ${person.label} to list…`, path: "One more choice, in this dialog", run: () => { setStage({ kind: "list", name: person.label }); setQ(""); setIndex(0) } })
      }
    }
    return out
  }, [open, q, stage, session, seed])

  const selectable = rows.filter((r) => !r.explanation)
  const groups = GROUPS.filter((g) => rows.some((r) => r.group === g))

  useEffect(() => { setIndex(0) }, [q])

  if (!open) return null

  const choose = (row: Row) => {
    if (row.explanation) return
    // The palette is a jump, not a step in a chain: whatever path you were on, it ends here.
    clearTrail()
    if (row.run) { row.run(); return }
    if (row.target) {
      remember(session.business, session.role, row)
      close()
      navigate(row.target)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); close() }
    else if (e.key === "ArrowDown") { e.preventDefault(); setIndex((i) => Math.min(i + 1, selectable.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)) }
    else if (e.key === "Enter") {
      e.preventDefault()
      const row = selectable[index]
      if (!row) return
      if ((e.metaKey || e.ctrlKey) && row.target) { openInNewTab(row.target); return }
      choose(row)
    }
    else if (e.key === "Backspace" && q === "" && stage) { e.preventDefault(); setStage(null) }
  }

  let cursor = -1
  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <div className=" absolute inset-0" onClick={close} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Search or jump to" className={cn("absolute left-1/2 top-4 w-[min(40rem,calc(100vw-1rem))] -translate-x-1/2 overflow-hidden ", "bg-popover", "max-sm:inset-0 max-sm:top-0 max-sm:w-full max-sm:translate-x-0")}>
        <div className="flex items-center gap-2 px-3">
          {stage && <span className="shrink-0 rounded bg-muted px-2 py-1 text-xs">Add {stage.name} to {stage.kind}</span>}
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={selectable[index] ? `palette-${selectable[index].id}` : undefined}
            aria-autocomplete="list"
            aria-label={stage ? `Add ${stage.name} to ${stage.kind}, type to filter` : "Search or jump to"}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={stage ? "type to filter" : "Search or jump to…"}
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="sr-only" role="status" aria-live="polite">{selectable.length} results in {groups.length} groups</div>
        <ul id="palette-list" role="listbox" aria-label="Results" className="max-h-[60vh] overflow-y-auto py-1 max-sm:max-h-[calc(100vh-3.5rem)]">
          {groups.map((g) => (
            <li key={g} role="presentation">
              <div className="px-3 pb-1 pt-2 t-small font-medium uppercase tracking-wider text-muted-foreground">{g}</div>
              <ul role="presentation">
                {rows.filter((r) => r.group === g).map((r) => {
                  if (!r.explanation) cursor++
                  const active = !r.explanation && cursor === index
                  return (
                    <li
                      key={r.id}
                      id={`palette-${r.id}`}
                      role="option"
                      aria-selected={active}
                      aria-disabled={r.explanation || undefined}
                      onMouseDown={(e) => { e.preventDefault(); choose(r) }}
                      className={cn(
                        "flex cursor-pointer items-baseline gap-3 px-3 py-1.5 text-sm",
                        active && "bg-muted",
                        r.explanation && "cursor-default flex-wrap text-muted-foreground",
                      )}
                    >
                      <span className={cn(!r.explanation && "truncate font-medium")}>{r.label}</span>
                      {r.note && <Kbd className="shrink-0">{r.note}</Kbd>}
                      <span className={cn("min-w-0 flex-1 text-xs text-muted-foreground", !r.explanation && "truncate")}>{r.path}</span>
                      {r.shortcut && <Kbd className="shrink-0">{r.shortcut}</Kbd>}
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
          {selectable.length === 0 && <li className="px-3 py-6 text-sm text-muted-foreground">Nothing matches that. Every page is also in the sidebar.</li>}
        </ul>
      </div>
    </div>
  )
}
