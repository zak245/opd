// The deals board: the pipeline by stage, and the table that is its alternative.
//
// Three facts are never behind anything: what a deal is worth, when it closes, and what has to
// happen next. The forecast strip, the column sums and the six warnings sit beside them because an
// AE reads all of it on a Monday morning. Everything else — the owner on the card, the weighted
// total, the filters that are not the warnings — is asked of the usage model for this seat at this
// business, so one page serves four businesses and four seats with no mode switch.
//
// There is no Closed lost column: a lost deal is archived with a reason and leaves the board and the
// forecast. Delete is not on the card; it is on the record, where its consequence is visible without
// a click, and in the bulk bar, where it names what goes.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { href, useRoute } from "@/app/router"
import { follow } from "../../chain"
import { openBeside } from "../../beside"
import { Actions } from "../../ui/Actions"
import { Chip } from "../../ui/Identity"
import { Container, Group } from "../../ui/Section"
import { FamilyIcon, inkOf } from "../../ui/Identity"
import { familyOf } from "../../identity"
import { useEdits } from "../../edits"
import { TablePage, toast } from "../../templates/TablePage"
import { QuickLook, type QuickLookEditable } from "../../templates/QuickLook"
import { Door, DoorGroup, ExpandAll, useDoorState } from "../../ui/Door"
import { Panel } from "../../ui/Panel"
import { EmptyState } from "../../ui/EmptyState"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import type { Session } from "../../session"
import { STAGE_FORECAST, STAGE_PROBABILITY, TODAY, seedFor, type Deal, type DealStage } from "../../data/seed"
import { ago, day, daysBetween, money } from "../deal/format"
import { DealCard, chipText, type CardFlags } from "./DealCard"
import { coverageFor } from "../reports/coverage"
import {
  ALL_STAGES, FORECAST_CATEGORIES_UI, LOST_REASONS, OPEN_STAGES, PERIODS, SCOPE_LABEL, WARNING_KINDS,
  WON_STAGE, dealGlanceFields, forecastFigures, goalFor, inPeriod, isOpen, lostConsequenceText, warningStatus,
  moneyShort, moneySpoken, newDeal, observedCoverage, scopeNames, sumOf, warningCounts, warningsOf,
  weightedOf, wonConsequenceText,
  type PeriodKey, type Scope, type WarningKind,
} from "./pipeline"

/** The ink a state word carries, asked of the registry so this page holds no hue (DESIGN.md §5). */
const statusInk = (word: string) => inkOf(word)

/* --------------------------------------------------------------------------------- page state */

interface Filters {
  warnings: WarningKind[]
  noNextStep: boolean
  comments: boolean
  owner: string
  forecast: string
  amountMin: string
  amountMax: string
  company: string
  created: "" | "30" | "quarter"
  archived: boolean
  lostReason: string
  custom: string
  customValue: string
}

const NO_FILTERS: Filters = {
  warnings: [], noNextStep: false, comments: false, owner: "", forecast: "", amountMin: "", amountMax: "",
  company: "", created: "", archived: false, lostReason: "", custom: "", customValue: "",
}

function filtersOn(f: Filters): number {
  return (
    f.warnings.length + (f.noNextStep ? 1 : 0) + (f.comments ? 1 : 0) + (f.owner ? 1 : 0) + (f.forecast ? 1 : 0) +
    (f.amountMin || f.amountMax ? 1 : 0) + (f.company ? 1 : 0) + (f.created ? 1 : 0) + (f.archived ? 1 : 0) +
    (f.lostReason ? 1 : 0) + (f.customValue ? 1 : 0)
  )
}

/** A radiogroup with one tab stop and arrow keys between the options, as the pattern asks. */
function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { key: T; text: string }[]; onChange: (v: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-md border p-0.5">
      {options.map((o, i) => (
        <button
          key={o.key}
          role="radio"
          aria-checked={value === o.key}
          tabIndex={value === o.key ? 0 : -1}
          onClick={() => onChange(o.key)}
          onKeyDown={(e) => {
            const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
            if (!step) return
            e.preventDefault()
            e.stopPropagation()
            const next = options[(i + step + options.length) % options.length]
            onChange(next.key)
            const el = e.currentTarget.parentElement?.children[options.indexOf(next)]
            if (el instanceof HTMLElement) el.focus()
          }}
          className={cn("rounded px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            value === o.key ? "bg-foreground text-background" : "hover:bg-muted")}
        >
          {o.text}
        </button>
      ))}
    </div>
  )
}

/** One board is rendered, never two: a hidden copy would duplicate every card for the keyboard. */
function usePhone(): boolean {
  const [phone, setPhone] = useState(() => (typeof window === "undefined" ? false : !window.matchMedia("(min-width: 768px)").matches))
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const on = () => setPhone(!mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return phone
}

/** View, scope, period, filters, columns and density, per user per workspace (spec 08 §6). */
function usePersisted<T>(key: string, initial: T): [T, (next: T) => void] {
  const full = `ollopa.deals.${key}`
  const [value, setValue] = useState<T>(() => {
    try { const raw = localStorage.getItem(full); return raw === null ? initial : (JSON.parse(raw) as T) } catch { return initial }
  })
  return [value, (next: T) => { setValue(next); try { localStorage.setItem(full, JSON.stringify(next)) } catch { /* this visit only */ } }]
}

/* ------------------------------------------------------------------------------ table columns */

interface TableCol { key: string; header: string; cell: (d: Deal, ctx: { currency: string }) => ReactNode; on: boolean }

const TABLE_COLUMNS: TableCol[] = [
  { key: "deal", header: "Deal", on: true, cell: (d) => <span className="font-medium">{d.name}</span> },
  { key: "company", header: "Company", on: true, cell: (d) => d.company },
  // The table draws this one as a status chip (see `status` on the columns below); this is what a
  // CSV export and any other reader of the column gets.
  { key: "stage", header: "Stage", on: true, cell: (d) => <Chip status={d.stage} /> },
  { key: "amount", header: "Amount", on: true, cell: (d, c) => <span className="tabular-nums">{money(d.amount, d.currency || c.currency)}</span> },
  { key: "forecast", header: "Forecast", on: true, cell: (d) => d.forecast },
  { key: "close", header: "Close date", on: true, cell: (d) => <span className="tabular-nums">{day(d.closeDate)}</span> },
  { key: "next", header: "Next step and its date", on: true, cell: (d) => (d.nextStep ? `${d.nextStep} · ${day(d.nextStepDue)}` : <span style={{ color: statusInk("warning") }}>No next step</span>) },
  { key: "owner", header: "Owner", on: true, cell: (d) => d.owner },
  { key: "touch", header: "Last touch and last reply", on: true, cell: (d) => `${daysBetween(d.lastActivity)}d · ${d.lastProspectActivityAt ? `${daysBetween(d.lastProspectActivityAt)}d` : "never"}` },
  { key: "warnings", header: "Warnings", on: true, cell: () => null },
  { key: "days", header: "Days in stage", on: true, cell: (d) => <span className="tabular-nums">{daysBetween(d.stageEnteredAt)}</span> },
  { key: "probability", header: "Probability", on: false, cell: (d) => `${d.probability}%` },
  { key: "weighted", header: "Weighted amount", on: false, cell: (d, c) => <span className="tabular-nums">{money(Math.round((d.amount * d.probability) / 100), d.currency || c.currency)}</span> },
  { key: "pipeline", header: "Pipeline", on: false, cell: (d) => d.pipeline },
  { key: "created", header: "Created", on: false, cell: (d) => <span className="tabular-nums">{day(d.createdAt)}</span> },
  { key: "type", header: "Deal type", on: false, cell: (d) => d.dealType },
]
const DEFAULT_COLUMNS = TABLE_COLUMNS.filter((c) => c.on).map((c) => c.key)

type Order = "close" | "amount" | "days" | "company"
const ORDERS: { key: Order; label: string }[] = [
  { key: "close", label: "Close date, soonest first" },
  { key: "amount", label: "Amount, largest first" },
  { key: "days", label: "Days in stage, longest first" },
  { key: "company", label: "Company, A to Z" },
]

/* ------------------------------------------------------------------------------------ the page */

export function DealsBoard({ session, glanceAt }: { session: Session; glanceAt?: string }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const d = useDisclosure("deals")
  // What the deal record opens with for this seat. The drawer is the top of that record cut short,
  // so it asks the record's own page rather than carrying a list of fields someone typed here.
  const dealLevel = useDisclosure("deal")
  /** A zero means the item is not part of this seat's job here at all: removed, not shown empty. */
  const used = (id: string) => d.weekly(id) > 0
  const one = (id: string) => d.level(id) === 1

  const currency = seed.workspace.currency
  const owners = b.roles.map((r) => r.user)
  const crm = seed.integrations.find((i) => /crm|salesforce|hubspot/i.test(`${i.kind} ${i.name}`))
  const route = useRoute()
  // What an action in a pane did to a deal in this session. The cards and the table read it, so a
  // deal closed won in a pane beside some other page is in the Closed won rail the moment you look
  // at the board. The page's own edits win where both have touched the same field.
  const shared = useEdits("deal")

  /**
   * Leaving the board for a record, remembering the card. `anchor` is the deal's id, which the card
   * carries as `data-item`: clicking the crumb comes back to this board, mounted and untouched,
   * with that card scrolled into view, lit for three seconds and focused.
   */
  const leaveFor = (to: string, anchor: string) =>
    follow(to, { route: route.raw, title: "Deals", anchor })
  const pipelines = seed.pipelines
  const customDefs = seed.fields.filter((f) => f.object === "deal" && !f.retired)

  const scopeDefault: Scope = session.hasReports ? "team" : session.role === "ae" ? "mine" : "all"
  // The pipeline a workspace actually works in: the one holding the most open deals. A picker that
  // opens on an empty pipeline teaches a person the board is broken.
  const pipelineDefault = pipelines.length < 2
    ? pipelines[0]?.name ?? ""
    : [...pipelines].sort((x, y) => seed.deals.filter((k) => k.pipeline === y.name && isOpen(k)).length - seed.deals.filter((k) => k.pipeline === x.name && isOpen(k)).length)[0].name

  const [view, setView] = usePersisted<"board" | "table">(`${b.id}.${session.role}.view`, "board")
  const [scope, setScope] = usePersisted<Scope>(`${b.id}.${session.role}.scope`, scopeDefault)
  const [period, setPeriod] = usePersisted<PeriodKey>(`${b.id}.${session.role}.period`, "quarter")
  const [pipelineName, setPipelineName] = usePersisted(`${b.id}.${session.role}.pipeline`, pipelineDefault)
  const [density, setDensity] = usePersisted<"comfortable" | "compact">(`${b.id}.${session.role}.density`, "comfortable")
  const [order, setOrder] = usePersisted<Order>(`${b.id}.${session.role}.order`, "close")
  const [columns, setColumns] = usePersisted<string[]>(`${b.id}.${session.role}.columns`, DEFAULT_COLUMNS)
  const [filters, setFilters] = usePersisted<Filters>(`${b.id}.${session.role}.filters`, NO_FILTERS)
  const [railOpen, setRailOpen] = useDoorState("deals.closed-won")

  const [q, setQ] = useState("")
  const [edits, setEdits] = useState<Record<string, Partial<Deal>>>({})
  const [addedDeals, setAddedDeals] = useState<Deal[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [glance, setGlance] = useState<string | null>(glanceAt ?? null)
  const [carrying, setCarrying] = useState<string | null>(null)
  const [target, setTarget] = useState<DealStage | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [editingNext, setEditingNext] = useState<string | null>(null)
  const [refusal, setRefusal] = useState<{ id: string; text: string } | null>(null)
  const [phoneStage, setPhoneStage] = useState<DealStage>(OPEN_STAGES[0])
  const [say, setSay] = useState("")
  const phone = usePhone()

  const [newPanel, setNewPanel] = useState(false)
  const [logFor, setLogFor] = useState<string | null>(null)
  const [wonFor, setWonFor] = useState<string | null>(null)
  const [lostFor, setLostFor] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const undoRef = useRef<{ said: string; run: () => void } | null>(null)
  const search = useRef<HTMLInputElement>(null)

  /* ------------------------------------------------------------------- what is on the board */

  const all = useMemo(
    () => [...addedDeals, ...seed.deals].map((x) => (edits[x.id] || shared[x.id] ? { ...x, ...(shared[x.id] as Partial<Deal>), ...edits[x.id] } : x)),
    [seed.deals, addedDeals, edits, shared],
  )

  const names = scopeNames(scope, session.user, seed, b)
  const inScope = useMemo(
    () => all.filter((x) => (pipelines.length > 1 ? x.pipeline === pipelineName : true)).filter((x) => !names || names.includes(x.owner)),
    [all, names, pipelineName, pipelines.length],
  )

  /** Comments are notes addressed to one teammate; this chip counts the ones still unanswered. */
  const waiting = useMemo(() => {
    const ids = new Set(seed.notes.filter((n) => n.kind === "comment" && n.to === session.user && !n.answered && n.about.kind === "deal").map((n) => n.about.id))
    return ids
  }, [seed.notes, session.user])

  const period_ = PERIODS.find((p) => p.key === period) ?? PERIODS[2]

  const beforeChips = useMemo(
    () => inScope.filter((x) => (filters.archived ? Boolean(x.archivedAt) : !x.archivedAt))
      .filter((x) => inPeriod(x, period))
      .filter((x) => {
        const needle = q.trim().toLowerCase()
        if (!needle) return true
        return `${x.name} ${x.company} ${x.owner} ${x.nextStep ?? ""}`.toLowerCase().includes(needle)
      }),
    [inScope, period, q, filters.archived],
  )

  const facets = useMemo(() => warningCounts(beforeChips, seed), [beforeChips, seed])
  const noNextStepCount = beforeChips.filter((x) => !x.nextStep && isOpen(x)).length
  const commentsCount = beforeChips.filter((x) => waiting.has(x.id)).length

  const rows = useMemo(() => {
    const min = Number(filters.amountMin) || 0
    const max = Number(filters.amountMax) || Infinity
    const created = filters.created === "30" ? new Date(Date.parse(TODAY) - 30 * 86_400_000).toISOString().slice(0, 10) : filters.created === "quarter" ? `${TODAY.slice(0, 4)}-07-01` : ""
    return beforeChips.filter((x) => {
      if (filters.noNextStep && x.nextStep) return false
      if (filters.comments && !waiting.has(x.id)) return false
      if (filters.owner && x.owner !== filters.owner) return false
      if (filters.forecast && x.forecast !== filters.forecast) return false
      if (x.amount < min || x.amount > max) return false
      if (filters.company && !x.company.toLowerCase().includes(filters.company.toLowerCase())) return false
      if (created && x.createdAt < created) return false
      if (filters.lostReason && x.lostReason !== filters.lostReason) return false
      if (filters.customValue && String(x.custom[filters.custom] ?? "") !== filters.customValue) return false
      if (filters.warnings.length) {
        const kinds = warningsOf(x, seed).map((w) => w.kind)
        if (!filters.warnings.some((w) => kinds.includes(w))) return false
      }
      return true
    })
  }, [beforeChips, filters, seed, waiting])

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((x, y) =>
      order === "amount" ? y.amount - x.amount
      : order === "days" ? daysBetween(y.stageEnteredAt) - daysBetween(x.stageEnteredAt)
      : order === "company" ? x.company.localeCompare(y.company)
      : x.closeDate.localeCompare(y.closeDate))
    return copy
  }, [rows, order])

  const byStage = (s: DealStage) => sorted.filter((x) => x.stage === s)
  const wonRows = byStage(WON_STAGE)

  /* --------------------------------------------------------------------------- what the seat sees */

  const cardFlags: CardFlags = {
    // The owner is redundant for an AE working her own board and central for a manager and an admin.
    owner: one("deals.card.owner"),
    // Spec 08 §6: the forecast category is level one on the card for the AE and the admin, matching
    // the record, so one fact does not sit at two levels depending on the page you are on.
    forecast: (session.role === "ae" || session.role === "admin") && used("deals.card.forecast"),
    touch: one("deals.card.touch-reply"),
    daysInStage: one("deals.card.days-in-stage"),
    sync: used("deals.card.sync") && Boolean(crm),
    compact: density === "compact",
  }

  const canMove = (deal: Deal) => deal.owner === session.user || session.role === "admin"

  /* --------------------------------------------------------------------------------- the actions */

  const patch = (id: string, change: Partial<Deal>, said: string) => {
    const before = all.find((x) => x.id === id)
    if (!before) return
    const undo: Partial<Deal> = {}
    for (const k of Object.keys(change) as (keyof Deal)[]) (undo as Record<string, unknown>)[k] = before[k]
    setEdits((e) => ({ ...e, [id]: { ...e[id], ...change } }))
    undoRef.current = { said, run: () => setEdits((e) => ({ ...e, [id]: { ...e[id], ...undo } })) }
    toast(`${said} · Undo with Z`)
  }

  const move = (id: string, to: DealStage) => {
    const deal = all.find((x) => x.id === id)
    if (!deal) return
    if (!canMove(deal)) {
      setRefusal({ id, text: `Owned by ${deal.owner}. Only the owner or an admin can move it.` })
      setSay(`Move refused. ${deal.name} is owned by ${deal.owner}.`)
      toast(`Owned by ${deal.owner}. Only the owner or an admin can move it.`)
      return
    }
    if (to === WON_STAGE) { setWonFor(id); return }
    setRefusal(null)
    patch(id, { stage: to, probability: STAGE_PROBABILITY[to], forecast: STAGE_FORECAST[to], stageEnteredAt: TODAY }, `Moved to ${to}`)
    setSay(`${deal.name} moved to ${to}.`)
  }

  /** Spec 09 §3.2, written once in pipeline.ts, so the board, the record and the pane agree. */
  const wonConsequence = (deal: Deal) => wonConsequenceText(deal, seed, b)
  const lostConsequence = (deal: Deal) => lostConsequenceText(deal, seed, b)

  const undo = () => {
    const u = undoRef.current
    if (!u) return
    u.run()
    undoRef.current = null
    toast(`Undone · ${u.said}`)
  }

  // Printing expands every door (the group does that) and the Closed won rail with them, so a printed
  // board is the whole pipeline by stage rather than a rail with a number on it.
  useEffect(() => {
    const before = () => setRailOpen(true)
    window.addEventListener("beforeprint", before)
    return () => window.removeEventListener("beforeprint", before)
  })

  /* --------------------------------------------------------------------------------- keyboard */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === "Escape" && carrying) { setCarrying(null); setTarget(null); setSay("Move cancelled."); return }
      if (typing) return
      if (document.querySelector("[role=dialog]")) return
      const key = e.key.toLowerCase()

      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null
      const onACard = Boolean(active?.dataset.cardId) || active === document.body
      const cardEl = focusId ? (document.querySelector(`[data-card-id="${focusId}"]`) as HTMLElement | null) : null
      const focusCard = (el: Element | null | undefined) => { if (el instanceof HTMLElement) { el.focus(); setFocusId(el.dataset.cardId ?? null) } }

      if (key === "j" || key === "k") {
        if (!onACard) return
        e.preventDefault()
        const list = cardEl?.parentElement
        if (!list) { focusCard(document.querySelector("[data-card-id]")); return }
        focusCard(key === "j" ? cardEl?.nextElementSibling : cardEl?.previousElementSibling)
        return
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const step = e.key === "ArrowRight" ? 1 : -1
        if (carrying) {
          e.preventDefault()
          const open = [...OPEN_STAGES, WON_STAGE]
          const at = open.indexOf(target ?? OPEN_STAGES[0])
          const next = open[Math.min(Math.max(at + step, 0), open.length - 1)]
          setTarget(next)
          setSay(`Move to ${next}. Space to drop, Escape to cancel.`)
          return
        }
        if (!cardEl || !onACard) return
        e.preventDefault()
        const lists = Array.from(document.querySelectorAll("[data-stage-list]"))
        const at = lists.indexOf(cardEl.parentElement as Element)
        const to = lists[at + step]
        focusCard(to?.querySelector("[data-card-id]"))
        return
      }
      if (e.key === " ") {
        const on = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.cardId : undefined
        if (carrying && target) { e.preventDefault(); move(carrying, target); setCarrying(null); setTarget(null); return }
        if (on) { e.preventDefault(); pickUp(on); return }
        return
      }
      if (key === "n") { e.preventDefault(); setNewPanel(true); return }
      if (e.key === "/") { e.preventDefault(); search.current?.focus(); return }
      if (key === "b" && used("deals.view.toggle")) { setView("board"); return }
      if (key === "t" && used("deals.view.toggle")) { setView("table"); return }
      if (key === "z") { undo(); return }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const pickUp = (id: string) => {
    const deal = all.find((x) => x.id === id)
    if (!deal) return
    if (!canMove(deal)) { move(id, deal.stage); return }
    setCarrying(id)
    setTarget(deal.stage)
    setSay(`${deal.name} picked up, in ${deal.stage}. Left and right arrows choose a stage, Space drops it, Escape cancels.`)
  }

  /* ------------------------------------------------------------------------------ the quick look */

  const glanced = glance ? all.find((x) => x.id === glance) ?? null : null
  // The column the glanced card sits in, in the order it is on screen, so [ and ] walk it. Moving a
  // stage from the drawer moves the card, and the count follows it: that is the truth, not a glitch.
  const glanceColumn = glanced ? byStage(glanced.stage).map((x) => x.id) : []
  const glanceAtIndex = glanced ? glanceColumn.indexOf(glanced.id) : -1
  const glanceEditable: QuickLookEditable | undefined = glanced
    ? glanced.owner === session.user
      ? { label: "Stage", value: glanced.stage, options: ALL_STAGES, onChange: (v) => move(glanced.id, v as DealStage) }
      : {
          label: `Comment for ${glanced.owner}`, value: "", multiline: true,
          onChange: (v) => toast(`Comment for ${glanced.owner} on ${glanced.name}: “${v.slice(0, 40)}${v.length > 40 ? "…" : ""}”. It stays unanswered until they reply.`),
        }
    : undefined

  /* ------------------------------------------------------------------------------- the strip */

  const goal = goalFor(scope, names, seed, session.user)
  const observed = observedCoverage(rows, goal)
  // The win rate and the coverage it requires are computed once, by Reports, and printed here in the
  // Pipeline report's own words (spec 08 §3, spec 12 §2). This page never works the pair out again.
  const required = coverageFor(seed)
  const figures = forecastFigures(rows)

  const teamTotals = session.hasReports && scope === "team" && names
    ? names.map((n) => {
        const mine = rows.filter((x) => x.owner === n && isOpen(x))
        return { name: n, count: mine.length, amount: sumOf(mine) }
      })
    : []

  const strip = (
    <div className="space-y-1.5">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-8">
        {figures.map((f) => (
          <div key={f.key}>
            <dt className="t-label text-muted-foreground">{f.label}</dt>
            <dd className="t-body font-semibold tabular-nums">
              {moneyShort(f.amount, currency)} <span className="font-normal text-muted-foreground">· {f.count}</span>
            </dd>
          </div>
        ))}
        {/* Observed and required on one line: either number alone is unreadable (spec 08 §3). */}
        {one("deals.forecast.coverage") && observed.coverage !== null && required.required !== null && (
          <div className="col-span-2">
            <dt className="t-label text-muted-foreground">Coverage</dt>
            <dd className="t-body font-semibold tabular-nums">
              {observed.coverage.toFixed(1)}x{" "}
              <span className="font-normal text-muted-foreground">· this team’s {required.line.toLowerCase()}</span>
            </dd>
          </div>
        )}
      </dl>
      {teamTotals.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {teamTotals.map((t) => (
            <li key={t.name}>
              {t.name} <span className="tabular-nums text-foreground">{t.count} · {moneyShort(t.amount, currency)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  /* --------------------------------------------------------------------------------- the column */

  const renderCard = (deal: Deal) => (
    <DealCard
      key={deal.id}
      deal={deal}
      warnings={warningsOf(deal, seed)}
      flags={cardFlags}
      currency={currency}
      canEdit={canMove(deal)}
      owners={owners}
      stages={ALL_STAGES}
      selected={selected.includes(deal.id)}
      carrying={carrying === deal.id}
      refusal={refusal?.id === deal.id ? refusal.text : null}
      editingNextStep={editingNext === deal.id}
      onEditingNextStep={(open) => setEditingNext(open ? deal.id : null)}
      onSelect={(on) => setSelected((s) => (on ? [...s, deal.id] : s.filter((x) => x !== deal.id)))}
      onGlance={() => setGlance(deal.id)}
      onOpen={() => leaveFor(`/ollopa/deals/${deal.id}`, deal.id)}
      onMove={(s) => move(deal.id, s)}
      onPatch={(change, said) => patch(deal.id, change, said)}
      onCloseWon={() => setWonFor(deal.id)}
      onMarkLost={() => setLostFor(deal.id)}
      onReopen={() => patch(deal.id, { stage: "Negotiation", archivedAt: null, lostReason: null, forecast: "Commit", probability: STAGE_PROBABILITY.Negotiation }, `${deal.name} reopened in Negotiation`)}
      onLog={() => setLogFor(deal.id)}
      onOpenCompany={(opener) => openBeside({ kind: "company", id: deal.companyId, opener })}
      onUseProposal={() => patch(deal.id, { nextStep: deal.agentProposal, nextStepDue: shiftDays(7), agentProposal: null }, `Next step set from the proposal on ${deal.name}`)}
      onDismissProposal={() => patch(deal.id, { agentProposal: null }, `Proposal dismissed on ${deal.name}`)}
      onFocus={() => setFocusId(deal.id)}
    />
  )

  const column = (stage: DealStage, className?: string) => {
    const list = byStage(stage)
    const sum = sumOf(list)
    const stale = list.filter((x) => warningsOf(x, seed).some((w) => w.kind === "No activity" || w.kind === "Stalled in stage")).length
    const weightedInHeader = one("deals.column.weighted")
    const doorParts = [weightedInHeader ? null : "Weighted total", one("deals.column.stale-count") ? null : "stale deals"].filter(Boolean)
    const summary = weightedInHeader || one("deals.column.stale-count") || doorParts.length > 0
    return (
      // A stage is a container: its name and its total are the container's header, and the
      // weighted total and the stale count sit in the one container-low band a container may hold
      // rather than in a second box (DESIGN.md §5, containment).
      <Container
        key={stage}
        component="section"
        heading={stage}
        count={`${list.length} · ${moneyShort(sum, currency)}`}
        padded={false}
        className={cn("flex min-h-0 w-full shrink-0 flex-col md:w-[17rem]", target === stage && carrying && "ring-2 ring-ring", className)}
        bodyClassName="flex min-h-0 flex-1 flex-col"
      >
        {summary && (
          <Group className="space-y-0.5 border-y px-4 py-2">
            {weightedInHeader && <div className="t-small tabular-nums text-muted-foreground">Weighted {moneyShort(weightedOf(list), currency)}</div>}
            {one("deals.column.stale-count") && <div className="t-small tabular-nums text-muted-foreground">{stale} not moving</div>}
            {doorParts.length > 0 && (
              <Door id={`deals.column.${stage}`} label={doorParts.join(" and ").replace(/^s/, "S")}>
                <dl className="t-small space-y-1">
                  {!weightedInHeader && (
                    <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Weighted total</dt><dd className="tabular-nums">{moneyShort(weightedOf(list), currency)}</dd></div>
                  )}
                  {!one("deals.column.stale-count") && (
                    <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Not moving</dt><dd className="tabular-nums">{stale}</dd></div>
                  )}
                </dl>
              </Door>
            )}
          </Group>
        )}
        <ul
          data-stage-list
          data-stage={stage}
          aria-label={`${stage}, ${list.length} deals, ${moneySpoken(sum, currency)}`}
          className={cn("min-h-24 flex-1 space-y-2 overflow-y-auto p-2", carrying && "outline-dashed outline-1 outline-muted-foreground/40")}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move" }}
          onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) move(id, stage) }}
        >
          {list.map(renderCard)}
          {list.length === 0 && (
            <li className="t-small rounded-md border border-dashed px-2 py-6 text-center text-muted-foreground">
              0 · {moneyShort(0, currency)}
              <div>Drop a deal here</div>
            </li>
          )}
        </ul>
      </Container>
    )
  }

  /* ---------------------------------------------------------------------------------- the rail */

  const railSum = sumOf(wonRows)
  const rail = !used("deals.board.closed-won-rail") ? null : railOpen ? (
    <div className="flex min-h-0 flex-col">
      <button className="self-end px-2 py-1 text-xs text-muted-foreground underline underline-offset-4" aria-expanded={true} onClick={() => setRailOpen(false)}>
        Collapse Closed won
      </button>
      {column(WON_STAGE)}
    </div>
  ) : (
    <button
      className="bg-card flex w-12 shrink-0 items-center justify-center rounded-[var(--radius)] border py-3 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      aria-expanded={false}
      onClick={() => setRailOpen(true)}
    >
      {/* Won is the one thing on this board that has already gone right, so it carries the success
          ink — with the word, never the colour alone. */}
      <span className="t-small [writing-mode:vertical-rl] tabular-nums" style={{ color: statusInk("closed won") }}>
        Closed won · {wonRows.length} · {moneyShort(railSum, currency)}
      </span>
    </button>
  )

  /* --------------------------------------------------------------------------------- the header */

  const anyFilter = filtersOn(filters) > 0 || q.trim().length > 0
  const clearAll = () => { setFilters(NO_FILTERS); setQ("") }

  // The label is the chip: no two chips in one row say the same thing, so it is the stable identity
  // React needs when a row of them is built from a list.
  const chip = (label: string, on: boolean, onClick: () => void) => (
    <button
      key={label}
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn("rounded-full border px-2.5 py-1 text-xs whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        on ? "bg-foreground text-background" : "hover:bg-muted")}
    >
      {label}
    </button>
  )

  const toggleWarning = (k: WarningKind) =>
    setFilters({ ...filters, warnings: filters.warnings.includes(k) ? filters.warnings.filter((x) => x !== k) : [...filters.warnings, k] })

  const filterDoorLabel =
    "Filters: warnings, no next step, owner, forecast category, amount, company, created, archived and its reason, custom fields" +
    (filtersOn(filters) ? ` · ${filtersOn(filters)} filter${filtersOn(filters) === 1 ? "" : "s"} on` : "")

  /* ---------------------------------------------------------------------------------- the table */

  const visibleColumns = TABLE_COLUMNS.filter((c) => columns.includes(c.key))

  const table = (
    <TablePage<Deal>
      family="deals"
      title={`${SCOPE_LABEL[scope]} · closing ${period_.words}`}
      total={b.counts.openDeals}
      rows={sorted}
      rowKey={(r) => r.id}
      searchText={(r) => `${r.name} ${r.company} ${r.owner} ${r.nextStep ?? ""}`}
      primary={{ label: "New deal", onClick: () => setNewPanel(true) }}
      columns={visibleColumns.map((c) => ({
        key: c.key,
        header: c.header,
        // The stage is a state word, so the template draws it as a status chip from the one status
        // set rather than this page picking a colour (DESIGN.md §5).
        status: c.key === "stage" ? (r: Deal) => r.stage : undefined,
        cell: (r: Deal) =>
          c.key === "warnings"
            ? (warningsOf(r, seed).length === 0
                ? <span className="text-muted-foreground">—</span>
                : <span className="flex flex-wrap gap-1">
                    {warningsOf(r, seed).map((w) => <Chip key={w.kind} status={warningStatus(w.kind)}>{chipText(w)}</Chip>)}
                  </span>)
            : c.cell(r, { currency }),
      }))}
      moreActions={[
        { label: "Open the deal record", onClick: (r) => leaveFor(`/ollopa/deals/${r.id}`, r.id) },
        { label: "Log a call or note", onClick: (r) => setLogFor(r.id) },
        { label: "Close won…", onClick: (r) => setWonFor(r.id) },
        { label: "Mark lost and archive…", onClick: (r) => setLostFor(r.id) },
      ]}
      quickLook={{
        title: (r) => r.name,
        fields: (r) => dealGlanceFields(r, currency, dealLevel.atLevelOne),
        editable: (r) =>
          r.owner === session.user
            ? { label: "Stage", value: r.stage, options: ALL_STAGES, onChange: (v) => move(r.id, v as DealStage) }
            : { label: `Comment for ${r.owner}`, value: "", multiline: true, onChange: (v) => toast(`Comment for ${r.owner} on ${r.name}: “${v.slice(0, 40)}”.`) },
        onOpen: (r) => leaveFor(`/ollopa/deals/${r.id}`, r.id),
      }}
    />
  )

  /* --------------------------------------------------------------------------------- the render */

  const workspaceEmpty = seed.deals.length === 0

  return (
    <DoorGroup>
      <div className="flex h-full min-h-0 flex-col">
        <div aria-live="polite" className="sr-only">{say}</div>

        <div className="space-y-2 px-4 pt-4 sm:px-6">
          {/* The page says what it is before any filter does: the title, its family glyph and its
              family ink, at the top of the scale (DESIGN.md §5). Without it the board opened flat
              and the only "where am I" was the 14 px strip in the shell. */}
          <h2 className="t-title inline-flex items-center gap-2" style={{ color: familyOf("deals").ink }}>
            <FamilyIcon of="deals" size="header" />
            Deals
            <span className="t-body font-normal tabular-nums text-muted-foreground">
              {SCOPE_LABEL[scope]} · closing {period_.words}
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {pipelines.length > 1 && (
              <Select value={pipelineName} onValueChange={setPipelineName}>
                <SelectTrigger className="h-8 w-48" aria-label="Pipeline"><SelectValue /></SelectTrigger>
                <SelectContent>{pipelines.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            )}

            {used("deals.filter.scope") && (
              <Segmented label="Whose deals" value={scope} onChange={setScope}
                options={(["mine", "team", "all"] as Scope[]).map((k) => ({ key: k, text: SCOPE_LABEL[k] }))} />
            )}

            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodKey)}>
              <SelectTrigger className="h-8 w-48" aria-label="Closing period"><SelectValue /></SelectTrigger>
              <SelectContent>{PERIODS.map((p) => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}</SelectContent>
            </Select>

            {view === "board" && (
              <Input ref={search} aria-label="Search deals" placeholder="Search deals" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-44" />
            )}

            {/* The owner filter is the control a manager's one-to-ones run on, so it sits beside scope. */}
            {one("deals.filter.owner") && (
              <Select value={filters.owner || "all"} onValueChange={(v) => setFilters({ ...filters, owner: v === "all" ? "" : v })}>
                <SelectTrigger className="h-8 w-44" aria-label="Owner"><SelectValue placeholder="Owner: all" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Owner: all</SelectItem>
                  {(names ?? owners).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            {one("deals.filter.forecast") && (
              <Select value={filters.forecast || "all"} onValueChange={(v) => setFilters({ ...filters, forecast: v === "all" ? "" : v })}>
                <SelectTrigger className="h-8 w-44" aria-label="Forecast category"><SelectValue placeholder="Forecast: all" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Forecast: all</SelectItem>
                  {FORECAST_CATEGORIES_UI.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
              {used("deals.view.toggle") && (
                <Segmented label="Board or table" value={view} onChange={setView}
                  options={[{ key: "board" as const, text: "Board" }, { key: "table" as const, text: "Table" }]} />
              )}

              <ExpandAll />

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-auto max-w-full whitespace-normal py-1 text-left">View: table columns, card order, density, saved views</Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 space-y-3 text-sm">
                  <div>
                    <div className="pb-1 text-xs font-medium">Card and row order</div>
                    <Select value={order} onValueChange={(v) => setOrder(v as Order)}>
                      <SelectTrigger className="h-8" aria-label="Order"><SelectValue /></SelectTrigger>
                      <SelectContent>{ORDERS.map((o) => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="pb-1 text-xs font-medium">Card density</div>
                    <div role="radiogroup" aria-label="Card density" className="flex gap-1">
                      {(["comfortable", "compact"] as const).map((v) => (
                        <button key={v} role="radio" aria-checked={density === v} onClick={() => setDensity(v)}
                          className={cn("rounded-md border px-2 py-1 text-xs", density === v ? "bg-foreground text-background" : "hover:bg-muted")}>
                          {v === "comfortable" ? "Comfortable" : "Compact"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="pb-1 text-xs font-medium">Table columns, {columns.length} of {TABLE_COLUMNS.length}</div>
                    <ul className="max-h-40 space-y-1 overflow-y-auto">
                      {TABLE_COLUMNS.map((c) => (
                        <li key={c.key} className="flex items-center gap-2">
                          <Checkbox id={`col-${c.key}`} checked={columns.includes(c.key)}
                            onCheckedChange={(v) => setColumns(v ? [...columns, c.key] : columns.filter((k) => k !== c.key))} />
                          <label htmlFor={`col-${c.key}`} className="text-xs">{c.header}</label>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {used("deals.view.saved") && (
                    <div>
                      <div className="pb-1 text-xs font-medium">Saved views</div>
                      <ul className="space-y-1">
                        {seed.savedViews.filter((v) => v.object === "deal").map((v) => (
                          <li key={v.id}>
                            <button className="text-xs underline underline-offset-4"
                              onClick={() => { setScope("mine"); setPeriod("quarter"); toast(`${v.name} applied · Mine, closing this quarter`) }}>
                              {v.name}
                            </button>
                          </li>
                        ))}
                        {seed.savedViews.filter((v) => v.object === "deal").length === 0 && <li className="text-xs text-muted-foreground">Nothing saved yet.</li>}
                      </ul>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* The one act this page exists for, so the one filled control on it (DESIGN.md §1). */}
              {view === "board" && (
                <Actions surface="card" items={[{ label: "New deal", kind: "primary", onClick: () => setNewPanel(true) }]} />
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8" data-item="deals.more" data-item-label="Import, export, print and stages" aria-label="Import, export, print and stages"><MoreHorizontal className="size-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => exportCsv(sorted, visibleColumns, currency)}>Export this view as CSV</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setImportOpen(true)}>Import deals from CSV</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => window.print()}>Print the board</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Settings is a page, so this is a `follow`: the crumb comes back to this board
                      with the menu button lit, not to whatever the sidebar would have shown. */}
                  <DropdownMenuItem onSelect={() => leaveFor("/ollopa/settings/pipeline?row=pipe.stages", "deals.more")}>Edit stages in Settings</DropdownMenuItem>
                  {/* The shell owns the list and opens it on "?"; this is the same panel, not a copy. */}
                  <DropdownMenuItem onSelect={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "?", bubbles: true }))}>
                    Keyboard shortcuts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Two counting chips at level one: the number is read without opening anything. */}
          <div className="flex flex-wrap items-center gap-2">
            {one("deals.filter.no-next-step") && chip(`No next step (${noNextStepCount})`, filters.noNextStep, () => setFilters({ ...filters, noNextStep: !filters.noNextStep }))}
            {one("deals.filter.comments") && chip(`Comments waiting for you (${commentsCount})`, filters.comments, () => setFilters({ ...filters, comments: !filters.comments }))}
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
              {rows.filter(isOpen).length.toLocaleString()} open of {b.counts.openDeals.toLocaleString()} in this workspace
            </span>
          </div>

          <Door id="deals.filters" label={filterDoorLabel}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {used("deals.filter.warnings") && (
                <fieldset className="sm:col-span-2 lg:col-span-3">
                  <legend className="pb-1 text-xs font-medium">Warnings</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {WARNING_KINDS.map((k) => chip(`${k} (${facets[k]})`, filters.warnings.includes(k), () => toggleWarning(k)))}
                  </div>
                </fieldset>
              )}

              <div className="flex items-center gap-2">
                <Checkbox id="f-nostep" checked={filters.noNextStep} onCheckedChange={(v) => setFilters({ ...filters, noNextStep: Boolean(v) })} />
                <label htmlFor="f-nostep" className="text-xs">No next step ({noNextStepCount})</label>
              </div>

              {!one("deals.filter.owner") && (
                <label className="text-xs">Owner
                  <Select value={filters.owner || "all"} onValueChange={(v) => setFilters({ ...filters, owner: v === "all" ? "" : v })}>
                    <SelectTrigger className="mt-1 h-8" aria-label="Owner"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All owners</SelectItem>{owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </label>
              )}

              {!one("deals.filter.forecast") && (
                <label className="text-xs">Forecast category
                  <Select value={filters.forecast || "all"} onValueChange={(v) => setFilters({ ...filters, forecast: v === "all" ? "" : v })}>
                    <SelectTrigger className="mt-1 h-8" aria-label="Forecast category"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All categories</SelectItem>{FORECAST_CATEGORIES_UI.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </label>
              )}

              <div className="text-xs">
                Amount between
                <div className="mt-1 flex items-center gap-1">
                  <Input aria-label="Smallest amount" type="number" className="h-8" value={filters.amountMin} onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })} />
                  <span className="text-muted-foreground">and</span>
                  <Input aria-label="Largest amount" type="number" className="h-8" value={filters.amountMax} onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })} />
                </div>
              </div>

              <label className="text-xs">Company
                <Input aria-label="Company" className="mt-1 h-8" value={filters.company} onChange={(e) => setFilters({ ...filters, company: e.target.value })} />
              </label>

              <label className="text-xs">Created
                <Select value={filters.created || "any"} onValueChange={(v) => setFilters({ ...filters, created: v === "any" ? "" : (v as Filters["created"]) })}>
                  <SelectTrigger className="mt-1 h-8" aria-label="Created"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any time</SelectItem>
                    <SelectItem value="30">In the last 30 days</SelectItem>
                    <SelectItem value="quarter">This quarter</SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <div className="text-xs">
                <div className="flex items-center gap-2">
                  <Checkbox id="f-archived" checked={filters.archived} onCheckedChange={(v) => setFilters({ ...filters, archived: Boolean(v), lostReason: "" })} />
                  <label htmlFor="f-archived">Archived deals and the reason each was lost</label>
                </div>
                {filters.archived && (
                  <Select value={filters.lostReason || "all"} onValueChange={(v) => setFilters({ ...filters, lostReason: v === "all" ? "" : v })}>
                    <SelectTrigger className="mt-1 h-8" aria-label="Lost reason"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Every reason</SelectItem>{LOST_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>

              {used("deals.filter.custom") && customDefs.length > 0 && (
                <div className="text-xs">
                  Custom field
                  <div className="mt-1 flex gap-1">
                    <Select value={filters.custom || customDefs[0].label} onValueChange={(v) => setFilters({ ...filters, custom: v })}>
                      <SelectTrigger className="h-8" aria-label="Custom field"><SelectValue /></SelectTrigger>
                      <SelectContent>{customDefs.map((f) => <SelectItem key={f.id} value={f.label}>{f.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input aria-label="Custom field value" className="h-8" value={filters.customValue}
                      onChange={(e) => setFilters({ ...filters, customValue: e.target.value, custom: filters.custom || customDefs[0].label })} />
                  </div>
                </div>
              )}
            </div>
            {filtersOn(filters) > 0 && (
              <Button size="sm" variant="ghost" className="mt-2 h-7 px-2 text-xs" onClick={() => setFilters(NO_FILTERS)}>Clear {filtersOn(filters)} filter{filtersOn(filters) === 1 ? "" : "s"}</Button>
            )}
          </Door>
        </div>

        {/* The strip: four sums for the AE and the admin, a door for the seats that glance at it.
            One band across the top of the board, not four boxes: the sums are read together and a
            box each would say they are four separate things (DESIGN.md §5, containment). */}
        <Group as="div" className="mx-4 mb-3 rounded-[var(--radius)] border px-4 py-3 sm:mx-6">
          {one("deals.forecast.strip")
            ? strip
            : <Door id="deals.strip" label={`Forecast for ${period_.words}: commit, best case, pipeline, closed won`}>{strip}</Door>}
        </Group>

        {workspaceEmpty ? (
          <div className="px-4 pb-6 sm:px-6">
            <EmptyState
              title="No deals yet"
              body="A deal is an opportunity with an amount, a close date and a next step. Create one, or bring the pipeline you already have."
              action={
                <Actions surface="card" items={[
                  { label: "New deal", kind: "primary", onClick: () => setNewPanel(true) },
                  { label: "Import CSV", kind: "secondary", onClick: () => setImportOpen(true) },
                ]} />
              }
            />
          </div>
        ) : view === "table" ? (
          <div className="min-h-0 flex-1">{table}</div>
        ) : (
          <>
            {rows.length === 0 && anyFilter && (
              <div className="px-4 pb-3 sm:px-6">
                <div className="flex flex-wrap items-center gap-3 rounded-md border border-dashed px-3 py-2 text-sm">
                  <span>Nothing matches. Clear the search or the filters.</span>
                  <Button size="sm" variant="outline" className="h-7" onClick={clearAll}>Clear search and filters</Button>
                </div>
              </div>
            )}

            {/* Phone: one column with a row of stage chips, each carrying its count and sum. */}
            {phone ? (
            <div className="min-h-0 flex-1 px-4 pb-4">
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                {OPEN_STAGES.map((s) => (
                  <button key={s} aria-pressed={phoneStage === s} onClick={() => setPhoneStage(s)}
                    className={cn("shrink-0 rounded-full border px-2.5 py-1 text-xs", phoneStage === s ? "bg-foreground text-background" : "hover:bg-muted")}>
                    {s} · {byStage(s).length} · {moneyShort(sumOf(byStage(s)), currency)}
                  </button>
                ))}
                {used("deals.board.closed-won-rail") && (
                  <button aria-pressed={phoneStage === WON_STAGE} onClick={() => setPhoneStage(WON_STAGE)}
                    className={cn("shrink-0 rounded-full border px-2.5 py-1 text-xs", phoneStage === WON_STAGE ? "bg-foreground text-background" : "hover:bg-muted")}>
                    {WON_STAGE} · {wonRows.length} · {moneyShort(railSum, currency)}
                  </button>
                )}
              </div>
              {column(phoneStage, "h-full")}
            </div>
            ) : (
            <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto px-4 pb-4 sm:px-6">
              {OPEN_STAGES.map((s) => column(s))}
              {rail}
            </div>
            )}
          </>
        )}

        {/* Bulk: what applies to the selection, and delete naming what goes with it. */}
        {selected.length > 0 && (
          <div className="sticky bottom-0 z-20 flex flex-wrap items-center gap-2 border-t bg-card px-4 py-2 text-sm sm:px-6">
            <span className="font-medium tabular-nums">{selected.length} selected</span>
            <Select onValueChange={(v) => { selected.forEach((id) => patch(id, { owner: v }, `${selected.length} deals now belong to ${v}`)); setSelected([]) }}>
              <SelectTrigger className="h-8 w-40" aria-label="Change owner"><SelectValue placeholder="Change owner" /></SelectTrigger>
              <SelectContent>{owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select onValueChange={(v) => { selected.forEach((id) => move(id, v as DealStage)); setSelected([]) }}>
              <SelectTrigger className="h-8 w-36" aria-label="Move to a stage"><SelectValue placeholder="Move to" /></SelectTrigger>
              <SelectContent>{OPEN_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              Close date
              <Input type="date" className="h-8 w-36" aria-label="New close date"
                onChange={(e) => { const v = e.target.value; selected.forEach((id) => patch(id, { closeDate: v }, `${selected.length} close dates moved to ${day(v)}`)); }} />
            </label>
            {/* Two acts on the selection. Deleting cannot be undone, so it asks once, with what goes
                with the deals inside the question and the count on the button that does it. */}
            <Actions
              surface="card"
              items={[
                { label: "Export", kind: "secondary", onClick: () => exportCsv(sorted.filter((r) => selected.includes(r.id)), visibleColumns, currency) },
                {
                  label: "Delete", kind: "destructive",
                  onClick: () => { const n = selected.length; setSelected([]); toast(`${n} deals deleted. Undo is in the notification for 10 seconds.`) },
                  irreversible: {
                    title: `Delete ${selected.length} deal${selected.length === 1 ? "" : "s"}?`,
                    consequence: `Their activities, notes and files go with them. The companies and contacts stay, and the ${crm?.name ?? "CRM"} opportunit${selected.length === 1 ? "y is" : "ies are"} not deleted.`,
                    confirmLabel: `Delete ${selected.length} deal${selected.length === 1 ? "" : "s"}`,
                  },
                },
              ]}
            />
            <Button size="sm" variant="ghost" className="ml-auto h-8" onClick={() => setSelected([])}>Clear the selection</Button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------------- the quick look */}
      {glanced && (
        <QuickLook
          family="deals"
          open
          onOpenChange={(o) => { if (!o) setGlance(null) }}
          title={glanced.name}
          fields={dealGlanceFields(glanced, currency, dealLevel.atLevelOne)}
          editable={glanceEditable}
          list={glanceAtIndex < 0 ? undefined : {
            index: glanceAtIndex,
            total: glanceColumn.length,
            onStep: (by) => { const to = glanceColumn[glanceAtIndex + by]; if (to) setGlance(to) },
          }}
          // The card the drawer was opened from is the anchor, so the crumb comes back to the board
          // with that card lit and focused rather than to the top of the column. It is a link: the
          // record is a destination, not a change to this deal (DESIGN.md §1).
          openHref={href(`/ollopa/deals/${glanced.id}`)}
          onOpen={() => { const id = glanced.id; setGlance(null); leaveFor(`/ollopa/deals/${id}`, id) }}
        />
      )}

      {/* ----------------------------------------------------------------------------- the sheets */}
      <Sheets
        all={all}
        wonFor={wonFor} setWonFor={setWonFor}
        lostFor={lostFor} setLostFor={setLostFor}
        logFor={logFor} setLogFor={setLogFor}
        wonConsequence={wonConsequence}
        lostConsequence={lostConsequence}
        onWin={(id, text) => { patch(id, { stage: WON_STAGE, probability: 100, forecast: "Closed" }, `Closed won · ${text}`); setWonFor(null) }}
        onLose={(id, reason, text) => { patch(id, { archivedAt: TODAY, lostReason: reason }, `Archived as lost · ${reason} · ${text}`); setLostFor(null) }}
        onLog={(id, kind, body) => { const deal = all.find((x) => x.id === id); toast(`${kind} logged on ${deal?.name}: “${body.slice(0, 40)}${body.length > 40 ? "…" : ""}”`); setLogFor(null) }}
      />

      <Panel id="deals-new" title="New deal" open={newPanel} onOpenChange={setNewPanel}>
        <NewDealForm
          owners={owners}
          defaultOwner={session.user}
          pipelines={pipelines.map((p) => p.name)}
          companies={seed.companies.slice(0, 40)}
          currency={currency}
          onCreate={(deal) => {
            setAddedDeals((x) => [deal, ...x])
            setNewPanel(false)
            toast(`${deal.name} created in ${deal.stage}, closing ${day(deal.closeDate)}`)
          }}
        />
      </Panel>

      <Panel id="deals-import" title="Import deals from CSV" open={importOpen} onOpenChange={setImportOpen}
        footer={<Actions surface="dialog" layout="stack" items={[
          { label: "Start the import", kind: "primary", onClick: () => { setImportOpen(false); toast("Nothing was imported: this demo reads the seed, not your file.") } },
        ]} />}>
        <div className="space-y-3">
          <Input type="file" accept=".csv" aria-label="CSV file" />
          {/* Not a note about the control: the columns are what the person has to produce, and the
              file cannot be built without them. The rest of what used to sit here was education. */}
          <p className="text-xs text-muted-foreground">
            Columns: name, company, amount, close date, stage, owner, next step, next step date.
          </p>
        </div>
      </Panel>

    </DoorGroup>
  )
}

/* ------------------------------------------------------------------------------ small pieces */

function shiftDays(n: number): string {
  return new Date(Date.parse(TODAY) + n * 86_400_000).toISOString().slice(0, 10)
}

function exportCsv(rows: Deal[], columns: { key: string; header: string }[], currency: string) {
  const value = (d: Deal, key: string): string => ({
    deal: d.name, company: d.company, stage: d.stage, amount: String(d.amount), forecast: d.forecast,
    close: d.closeDate, next: d.nextStep ? `${d.nextStep} (${d.nextStepDue})` : "", owner: d.owner,
    touch: `${daysBetween(d.lastActivity)}d`, warnings: "", days: String(daysBetween(d.stageEnteredAt)),
    probability: String(d.probability), weighted: String(Math.round((d.amount * d.probability) / 100)),
    pipeline: d.pipeline, created: d.createdAt, type: d.dealType,
  }[key] ?? "")
  const csv = [
    columns.map((c) => c.header).join(","),
    ...rows.map((d) => columns.map((c) => `"${value(d, c.key).replace(/"/g, '""')}"`).join(",")),
  ].join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
  const a = document.createElement("a")
  a.href = url
  a.download = "deals.csv"
  a.click()
  URL.revokeObjectURL(url)
  toast(`${rows.length} deals exported as CSV, in ${currency}.`)
}

/** Close won, mark lost and log: each states what happens before the button that does it. */
function Sheets({ all, wonFor, setWonFor, lostFor, setLostFor, logFor, setLogFor, wonConsequence, lostConsequence, onWin, onLose, onLog }: {
  all: Deal[]
  wonFor: string | null; setWonFor: (v: string | null) => void
  lostFor: string | null; setLostFor: (v: string | null) => void
  logFor: string | null; setLogFor: (v: string | null) => void
  wonConsequence: (d: Deal) => string
  lostConsequence: (d: Deal) => string
  onWin: (id: string, name: string) => void
  onLose: (id: string, reason: string, name: string) => void
  onLog: (id: string, kind: string, body: string) => void
}) {
  const [reason, setReason] = useState("")
  const [kind, setKind] = useState("Call")
  const [body, setBody] = useState("")
  const won = all.find((x) => x.id === wonFor)
  const lost = all.find((x) => x.id === lostFor)
  const log = all.find((x) => x.id === logFor)

  return (
    <>
      <Panel id="deals-won" title={won ? `Close ${won.name} as won?` : "Close won"} open={Boolean(won)} onOpenChange={(o) => { if (!o) setWonFor(null) }}
        footer={won ? <Actions surface="dialog" layout="stack" items={[
          { label: "Close won", kind: "primary", onClick: () => onWin(won.id, won.name) },
        ]} /> : null}>
        {won && <p className="text-sm">{wonConsequence(won)}</p>}
      </Panel>

      <Panel id="deals-lost" title={lost ? `Mark ${lost.name} lost?` : "Mark lost"} open={Boolean(lost)} onOpenChange={(o) => { if (!o) { setLostFor(null); setReason("") } }}
        footer={lost ? <Actions surface="dialog" layout="stack" items={[{
          label: "Archive as lost", kind: "primary",
          onClick: () => { onLose(lost.id, reason, lost.name); setReason("") },
          disabledBecause: reason ? undefined : "Choose a reason above",
        }]} /> : null}>
        {lost && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="lost-reason" className="text-xs">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="lost-reason" className="mt-1"><SelectValue placeholder="Why it was lost" /></SelectTrigger>
                <SelectContent>{LOST_REASONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">{lostConsequence(lost)}</p>
          </div>
        )}
      </Panel>

      <Panel id="deals-log" title={log ? `Log on ${log.name}` : "Log"} open={Boolean(log)} onOpenChange={(o) => { if (!o) { setLogFor(null); setBody("") } }}
        footer={log ? <Actions surface="dialog" layout="stack" items={[{
          label: `Log ${kind.toLowerCase()}`, kind: "primary",
          onClick: () => { onLog(log.id, kind, body); setBody("") },
          disabledBecause: body.trim() ? undefined : "Say what happened above",
        }]} /> : null}>
        <div className="space-y-3">
          <div role="radiogroup" aria-label="What to log" className="flex gap-1">
            {["Call", "Note"].map((k) => (
              <button key={k} role="radio" aria-checked={kind === k} onClick={() => setKind(k)}
                className={cn("rounded-md border px-2.5 py-1 text-xs", kind === k ? "bg-foreground text-background" : "hover:bg-muted")}>{k}</button>
            ))}
          </div>
          <Textarea rows={4} aria-label="What happened" value={body} onChange={(e) => setBody(e.target.value)}
            placeholder="What was said, and what happens next" />
        </div>
      </Panel>
    </>
  )
}

function NewDealForm({ owners, defaultOwner, pipelines, companies, currency, onCreate }: {
  owners: string[]
  defaultOwner: string
  pipelines: string[]
  companies: { id: string; name: string }[]
  currency: string
  onCreate: (d: Deal) => void
}) {
  const [name, setName] = useState("")
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "")
  const [pipeline, setPipeline] = useState(pipelines[0] ?? "")
  const [stage, setStage] = useState<DealStage>("Qualified")
  const [amount, setAmount] = useState("")
  const [closeDate, setCloseDate] = useState(shiftDays(60))
  const [owner, setOwner] = useState(defaultOwner)
  const [nextStep, setNextStep] = useState("")
  const [due, setDue] = useState(shiftDays(7))
  const company = companies.find((c) => c.id === companyId)
  const ok = name.trim() && company && Number(amount) > 0

  return (
    <div className="space-y-3">
      <label className="block text-xs">Name
        <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Northwind · Platform" aria-label="Deal name" />
      </label>
      <label className="block text-xs">Company
        <Select value={companyId} onValueChange={setCompanyId}>
          <SelectTrigger className="mt-1" aria-label="Company"><SelectValue /></SelectTrigger>
          <SelectContent>{companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </label>
      {pipelines.length > 1 && (
        <label className="block text-xs">Pipeline
          <Select value={pipeline} onValueChange={setPipeline}>
            <SelectTrigger className="mt-1" aria-label="Pipeline"><SelectValue /></SelectTrigger>
            <SelectContent>{pipelines.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs">Stage
          <Select value={stage} onValueChange={(v) => setStage(v as DealStage)}>
            <SelectTrigger className="mt-1" aria-label="Stage"><SelectValue /></SelectTrigger>
            <SelectContent>{OPEN_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </label>
        <label className="block text-xs">Amount ({currency})
          <Input className="mt-1" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Amount" />
        </label>
        <label className="block text-xs">Close date
          <Input className="mt-1" type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} aria-label="Close date" />
        </label>
        <label className="block text-xs">Owner
          <Select value={owner} onValueChange={setOwner}>
            <SelectTrigger className="mt-1" aria-label="Owner"><SelectValue /></SelectTrigger>
            <SelectContent>{owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs">Next step
          <Input className="mt-1" value={nextStep} onChange={(e) => setNextStep(e.target.value)} aria-label="Next step" placeholder="Send the proposal" />
        </label>
        <label className="block text-xs">Due
          <Input className="mt-1" type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Next step date" />
        </label>
      </div>
      <Actions surface="dialog" layout="stack" items={[{
        label: "Create the deal", kind: "primary",
        disabledBecause: ok ? undefined : "A name, a company and an amount",
        onClick: () => company && onCreate(newDeal({
          id: `new-${Date.now()}`, name: name.trim(), company: company.name, companyId: company.id,
          amount: Number(amount), stage, closeDate, owner, pipeline, currency,
          nextStep: nextStep.trim() || null, nextStepDue: nextStep.trim() ? due : null,
        })),
      }]} />
    </div>
  )
}
