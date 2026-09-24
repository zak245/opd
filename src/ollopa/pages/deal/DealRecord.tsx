// The deal record: the AE's page, built on RecordPage (specs/09-deal-record.md §3 and §6).
//
// Four answers without a click: where is this deal, how much is it, when does it close, and what
// happens next. Everything else exists to make those four true. The timeline is the page, contacts and
// the company sit beside it, and the only doors are long content rarely needed alongside the rest.
//
// What goes where is asked of the usage model, never hard-coded: the qualification card is level one
// for the AE and a door for CS and the admin; custom fields sit in the header at Halyard and Ridgeline
// and behind a door at Meridian; history opens by default for the seat that audits. Same page, no mode.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Bell, Bot, CalendarClock, CheckSquare, ChevronRight, FileText, Mail, MessageSquare, MoreHorizontal, Phone, Settings2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { ruleOn, useLesson } from "@/learn/context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { href, navigate, useRoute } from "@/app/router"
import { back as goBack, follow, useTrail } from "../../chain"
import { openBeside } from "../../beside"
import { toast } from "../../templates/TablePage"
import { RecordPage, CardRow, type RecordCard, type RecordDoor, type RecordField } from "../../templates/RecordPage"
import { SectionFilter } from "../../layouts"
import { Actions } from "../../ui/Actions"
import { Chip } from "../../ui/Identity"
import { Container, Group } from "../../ui/Section"
import { Divider } from "../../ui/Divider"
import { inkOf } from "../../ui/Identity"
import { warningStatus } from "../deals/pipeline"
import type { QuickLookEditable, QuickLookField } from "../../templates/QuickLook"
import { ConsequenceLine } from "../../ui/ConsequenceLine"
import { Door, useDoorState } from "../../ui/Door"
import { Panel } from "../../ui/Panel"
import { EmptyState } from "../../ui/EmptyState"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import type { Session } from "../../session"
import {
  CREDITS, QUAL_ELEMENTS, STAGE_FORECAST, STAGE_PROBABILITY, TODAY, dealWarnings, seedFor,
  type Deal, type DealActivity, type DealStage, type ForecastCategory, type QualElementName,
} from "../../data/seed"
import { ago, day, dayGroup, daysBetween, money } from "./format"

/**
 * The setting this page's stage gate is set in, named row and all. Settings opens the door it is
 * behind, scrolls to it and lights it, so the person lands on the rule they were reading about
 * rather than at the top of a long page.
 */
const STAGE_GATE_SETTING = "/ollopa/settings/pipeline?row=pipe.required-at-stage"

/* ------------------------------------------------------------------------------- small pieces */

/**
 * The three states a generated value can be in, said in words the status registry knows: nobody has
 * looked at it yet, a person changed it, a person checked it. The colour comes from there, never
 * from here (DESIGN.md §5).
 */
const STATE_WORD: Record<string, string> = {
  suggested: "new",
  edited: "in progress",
  validated: "verified",
}

/** The ink a state word carries, for the lines on this page that are a state rather than a chip. */
const statusInk = (word: string) => inkOf(word)

/** Warnings carry raw numbers and dates; a date is read the way the rest of the page reads dates. */
function readable(v: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? day(v) : v
}

/** A custom field's value in words: a checkbox is Yes or No, never "true". */
function fieldValue(v: string | number | boolean | undefined): string {
  if (v === undefined || v === "") return "—"
  if (typeof v === "boolean") return v ? "Yes" : "No"
  return String(v)
}

/** The buyer's own words, with one pair of quotation marks however the source stored them. */
function quoted(text: string): string {
  return `“${text.replace(/^["“”']+|["“”']+$/g, "")}”`
}

/* The lesson view finds what moved by comparing the DOM before and after a step, so every thing on
   this page carries `data-item` with its usage-item id and keeps that id at every step, and every
   place a thing can live carries `data-container`. `Door` tags itself (BUILD-WAVE3.md). None of this
   renders anything: the product ships the same attributes. */

/** A thing: a field value, a card, a menu entry. The same id at step 0 and at the last step. */
function Thing({ id, label, className, children }: { id: string; label?: string; className?: string; children: ReactNode }) {
  return <span data-item={id} data-item-label={label} className={className}>{children}</span>
}

/** A thing that is also a place: a card that holds rows, a tab body that holds fields. */
function ThingPlace({ id, label, place, placeLabel, className, open, children }: {
  id: string; label?: string; place: string; placeLabel: string; className?: string; open?: boolean; children: ReactNode
}) {
  return (
    <div
      data-item={id} data-item-label={label}
      data-container={place} data-container-label={placeLabel}
      data-open={open === undefined ? undefined : open ? "true" : "false"}
      className={className}
    >
      {children}
    </div>
  )
}

/** A place only: the widget panel, the tab strip, the timeline. */
function Place({ id, label, className, open, children }: {
  id: string; label: string; className?: string; open?: boolean; children: ReactNode
}) {
  return (
    <div data-container={id} data-container-label={label} data-open={open === undefined ? undefined : open ? "true" : "false"} className={className}>
      {children}
    </div>
  )
}

/** Every field an agent can write carries one. A value with no chip was typed by a person. */
function StateChip({ state }: { state: string }) {
  return <Chip status={STATE_WORD[state] ?? state}>{state}</Chip>
}

const KIND_ICON: Record<DealActivity["kind"], typeof Mail> = {
  email: Mail, call: Phone, meeting: CalendarClock, note: MessageSquare, stage: Sparkles,
  field: FileText, task: CheckSquare, agent: Bot, file: FileText,
}

const FILTERS = [
  { key: "all", label: "All", kinds: null },
  { key: "email", label: "Emails", kinds: ["email"] },
  { key: "call", label: "Calls", kinds: ["call"] },
  { key: "meeting", label: "Meetings", kinds: ["meeting"] },
  { key: "note", label: "Notes", kinds: ["note"] },
  { key: "changes", label: "Changes", kinds: ["stage", "field", "task", "agent", "file"] },
] as const

/* --------------------------------------------------------------------------------- the composer */

/** Call, Email, Meeting, Note, Comment. A module-level component: a nested one remounts as you type. */
function Composer({ session, business, contacts, companyName, isOwner, owner, mates, onLog }: {
  session: Session
  business: string
  contacts: { contactId: string; name: string; role: string }[]
  companyName: string
  isOwner: boolean
  /** Who owns the deal: the person a comment is for, unless the writer picks someone else. */
  owner: string
  mates: { user: string; title: string }[]
  onLog: (kind: DealActivity["kind"], summary: string, detail?: string) => void
}) {
  const [tab, setTab] = useState<"call" | "email" | "meeting" | "note" | "comment">(isOwner ? "call" : "comment")
  const [body, setBody] = useState("")
  const [to, setTo] = useState(contacts[0]?.name ?? "")
  const [mate, setMate] = useState(mates.some((m) => m.user === owner) ? owner : mates[0]?.user ?? "")
  const mailbox = `${session.user.split(" ")[0].toLowerCase()}@${business === "meridian" ? "meridian.io" : "example.com"}`
  const tabs = [
    { key: "call", label: "Call" }, { key: "email", label: "Email" }, { key: "meeting", label: "Meeting" },
    { key: "note", label: "Note" }, { key: "comment", label: "Comment" },
  ] as const

  /* The shared half of every kind: the body and the one act. It is rendered inside whichever panel
     is showing, so each tab really does own a panel rather than pointing at one that is not there. */
  const shared = (
    <>
      <Textarea
        aria-label={`${tab} body`}
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={{
          call: "What was said, and what happens next",
          email: "Write to them, or use the draft beside this",
          meeting: "Who was there, and what was agreed",
          note: "Anything the next person reading this deal should know",
          comment: `Ask ${mate || "a teammate"} something. It reaches them on Home and in the daily digest.`,
        }[tab]}
      />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button size="sm" disabled={!body.trim()} onClick={() => {
          const summary = {
            call: `Call logged with ${to || companyName}`,
            email: `Email to ${to}`,
            meeting: `Meeting logged with ${to || companyName}`,
            note: "Note added",
            comment: `Note for ${mate}`,
          }[tab]
          onLog(tab === "comment" ? "note" : tab, summary, body)
          setBody("")
        }}>
          {tab === "email" ? `Send from ${mailbox}` : tab === "comment" ? `Comment for ${mate}` : `Log ${tab}`}
        </Button>
        {/* What it will do, before the click, never after. */}
        {/* Sending spends, so it earns its one line. Logging a call, a meeting, a note or a comment
            spends nothing and can be undone, so nothing is written under those (DESIGN.md §3). */}
        {tab === "email" && <ConsequenceLine sends={1} to={to || "a contact"} from={mailbox} credits={CREDITS.draft} />}
      </div>
    </>
  )

  return (
    // No box: this is drawn inside the timeline's container-low band, which is its boundary.
    <div className="p-0" data-composer>
      <Tabs value={tab} onValueChange={(v) => { if (v) setTab(v as typeof tab) }}>
        <TabsList aria-label="Log activity" className="w-fit">
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key}
              data-item={t.key === "email" ? "timeline.email" : t.key === "note" ? "timeline.note" : undefined}
              data-item-label={t.key === "email" ? "Email a contact" : t.key === "note" ? "Add a note" : undefined}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t.key} value={t.key}>
            {t.key === "email" && (
              <div className="grid gap-2 pb-2 sm:grid-cols-2">
                <label className="text-xs text-muted-foreground">
                  To
                  <Select value={to} onValueChange={setTo}>
                    <SelectTrigger className="mt-1 h-8" aria-label="Recipient"><SelectValue placeholder="A contact on this deal" /></SelectTrigger>
                    <SelectContent>{contacts.map((c) => <SelectItem key={c.contactId} value={c.name}>{c.name} · {c.role}</SelectItem>)}</SelectContent>
                  </Select>
                </label>
                {/* The agent's draft sits beside the human's and is marked as a draft. Sending is the approval. */}
                {/* Inside the composer's band already: a divider and a line of its own, not a second box. */}
                <Divider className="mt-2" />
          <div className="t-small pt-2">
                  <div className="font-medium">The agent's draft <span className="font-normal text-muted-foreground">· draft, not sent</span></div>
                  <p className="mt-1 text-muted-foreground">Thanks for the call — sending the security pack and the pricing we discussed. Shall I put 30 minutes in with your team next week?</p>
                  <Button size="sm" variant="ghost" className="mt-1 h-6 px-1 text-xs"
                    onClick={() => setBody("Thanks for the call — sending the security pack and the pricing we discussed. Shall I put 30 minutes in with your team next week?")}>
                    Use this draft
                  </Button>
                </div>
              </div>
            )}

            {t.key === "comment" && (
              <label className="block pb-2 text-xs text-muted-foreground">
                For
                <Select value={mate} onValueChange={setMate}>
                  <SelectTrigger className="mt-1 h-8 w-64" aria-label="Teammate"><SelectValue placeholder="A teammate" /></SelectTrigger>
                  <SelectContent>{mates.map((m) => <SelectItem key={m.user} value={m.user}>{m.user} · {m.title}</SelectItem>)}</SelectContent>
                </Select>
              </label>
            )}

            {shared}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

/* ------------------------------------------------------------------------------------ the page */

export function DealRecord({ session, dealId }: { session: Session; dealId?: string }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const disclosure = useDisclosure("deal")

  /* On a lesson stage this names the step; in the product it is null and every rule is on, so the
     branches below collapse to the page wave 2 shipped. One component, one model, a layout per step. */
  const lesson = useLesson()
  const r1 = ruleOn(lesson, 1)   // hide the rare, never the necessary
  const r2 = ruleOn(lesson, 2)   // stop at two levels
  const r3 = ruleOn(lesson, 3)   // split by task frequency, not user skill
  const r4 = ruleOn(lesson, 4)   // make the door obvious and honest
  const r5 = ruleOn(lesson, 5)   // keep context across the boundary
  const r6 = ruleOn(lesson, 6)   // stable, user-controlled disclosure
  const r7 = ruleOn(lesson, 7)   // decision-critical information is never behind a door
  const r8 = ruleOn(lesson, 8)   // fade the scaffold; give experts accelerators

  // The deal the route names; failing that, the first one this seat owns, so a bare link still lands.
  const deal = useMemo(
    () => seed.deals.find((d) => d.id === dealId) ?? seed.deals.find((d) => d.owner === session.user) ?? seed.deals[0],
    [seed, dealId, session.user],
  )

  /* Everything a person changes on this page is local to the demo; the seed stays the source. */
  const [stage, setStage] = useState<DealStage>(deal?.stage ?? "Qualified")
  const [forecast, setForecast] = useState<ForecastCategory>(deal?.forecast ?? "Pipeline")
  const [probability, setProbability] = useState(deal?.probability ?? 10)
  const [nextStep, setNextStep] = useState(deal?.nextStep ?? "")
  const [nextStepDue, setNextStepDue] = useState(deal?.nextStepDue ?? "")
  const [amount, setAmount] = useState(deal?.amount ?? 0)
  const [closeDate, setCloseDate] = useState(deal?.closeDate ?? TODAY)
  const [name, setName] = useState(deal?.name ?? "")
  const [qual, setQual] = useState(deal?.qualification)
  const [filter, setFilter] = useState<string>(() => {
    try { return localStorage.getItem(`ollopa.deal.filter.${session.user}`) ?? "all" } catch { return "all" }
  })
  const [shown, setShown] = useState(12)
  const [lost, setLost] = useState(false)
  const [lostPanel, setLostPanel] = useState(false)
  const [lostReason, setLostReason] = useState("")
  const [proposalOpen, setProposalOpen] = useState(true)
  const [extra, setExtra] = useState<DealActivity[]>([])
  const composer = useRef<HTMLDivElement>(null)
  const [, setEvidenceDoor] = useDoorState("deal.evidence")

  /* State the common version needs and the disclosed version does not: which tab is showing, whether
     the "…" menu, the gear and the bell are open, and which field group inside All Fields is open. */
  const [parodyTab, setParodyTab] = useState<"activities" | "files" | "notes" | "all" | "enrich">("activities")
  const [parodyMenu, setParodyMenu] = useState(false)
  const [gearOpen, setGearOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [group, setGroup] = useState<string | null>(null)
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([])
  const [hoverEdit, setHoverEdit] = useState<string | null>(null)

  useEffect(() => {
    if (!deal) return
    setStage(deal.stage); setForecast(deal.forecast); setProbability(deal.probability)
    setNextStep(deal.nextStep ?? ""); setNextStepDue(deal.nextStepDue ?? "")
    setAmount(deal.amount); setCloseDate(deal.closeDate); setName(deal.name); setQual(deal.qualification)
  }, [deal])

  useEffect(() => {
    try { localStorage.setItem(`ollopa.deal.filter.${session.user}`, filter) } catch { /* this visit only */ }
  }, [filter, session.user])

  // The accelerators that are not single keys: G then H for history, [ and ] to walk the board, Esc back.
  const [chord, setChord] = useState(false)
  const [, setHistoryDoor] = useDoorState("deal.history")
  // The trail as it stands, read through a ref so Escape uses the latest one without the handler
  // being torn down and rebuilt on every crumb.
  const route = useRoute()
  const trail = useTrail()
  const trailRef = useRef(trail)
  trailRef.current = trail
  useEffect(() => {
    if (!r8) return
    const onKey = (e: KeyboardEvent) => {
      // The pane took this key first and said so. It owns Escape and [ and ] while it is open, so
      // pressing ] with a contact beside the record walks the contacts and does not also move the
      // page out from under them.
      if (e.defaultPrevented) return
      const t = e.target as HTMLElement | null
      if (e.metaKey || e.ctrlKey || t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return
      if (e.key.toLowerCase() === "g") { setChord(true); return }
      if (chord && e.key.toLowerCase() === "h") { setChord(false); setHistoryDoor(true); return }
      setChord(false)
      if (e.key === "Escape" && !document.querySelector("[role=dialog]")) {
        // Escape goes back the way the person came when they came through a chain, landing on the
        // card or row they left; from a deep link there is no path, so it goes to the board.
        const path = trailRef.current
        if (path.length > 0) goBack(path.length - 1)
        else navigate("/ollopa/deals")
      }
      const forward = e.key === "]"
      const previous = e.key === "["
      if (forward || previous) {
        // The next deal opens beside this one rather than replacing it: the record keeps its scroll,
        // its open doors and its half-written note, and [ and ] carry on walking inside the pane.
        const list = seedFor(session.business).deals
        const ids = list.map((d) => d.id)
        const at = ids.indexOf(dealId ?? ids[0])
        const to = forward ? at + 1 : at - 1
        if (to < 0 || to >= ids.length) return
        openBeside({ kind: "deal", id: ids[to], list: { ids, index: to }, opener: document.activeElement as HTMLElement | null })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [chord, dealId, session.business, setHistoryDoor, r8])

  if (!deal) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h2 className="t-section">This deal was deleted or moved.</h2>
        <p className="mt-2"><a className="text-sm underline" href={href("/ollopa/deals")}>Back to Deals</a></p>
      </div>
    )
  }

  /* ------------------------------------------------------------------ what this deal is made of */

  const isOwner = deal.owner === session.user
  const canEdit = isOwner || session.role === "admin"
  // Where this page is and what its h1 says, for the origins it hands to `follow`. The title is the
  // heading as it reads right now, renames included, so a crumb never shows a name the page dropped.
  const pageTitle = `${name} · Deals`
  const company = seed.companies.find((c) => c.id === deal.companyId || c.name === deal.company)
  const account = seed.accounts.find((a) => a.companyId === (company?.id ?? "") )
  const contacts = seed.dealContacts.filter((c) => c.dealId === deal.id)
  const activities = [...seed.dealActivities.filter((a) => a.dealId === deal.id), ...extra]
    .sort((x, y) => (x.at < y.at ? 1 : -1))
  const files = seed.dealFiles.filter((f) => f.dealId === deal.id)
  const evidence = seed.qualEvidence.filter((e) => e.dealId === deal.id)
  const tasks = seed.tasks.filter((t) => t.dealId === deal.id)
  const meeting = seed.meetings.filter((m) => m.dealId === deal.id).sort((x, y) => (x.at < y.at ? 1 : -1))[0]
  const history = seed.stageHistory.filter((h) => h.dealId === deal.id)
  const notes = seed.notes.filter((n) => n.about.kind === "deal" && n.about.id === deal.id)
  const handoff = notes.find((n) => n.briefKind === "handoff")
  const pinned = notes.find((n) => n.kind === "note" && n.visibility === "everyone")
  const proposal = seed.agentEvents.find((e) => e.dealId === deal.id && e.needsApproval && e.status === "waiting")
  const otherDeals = seed.deals.filter((d) => d.companyId === deal.companyId && d.id !== deal.id)
  const pipeline = seed.pipelines.find((p) => p.name === deal.pipeline) ?? seed.pipelines[0]
  const stages = pipeline?.stages ?? []
  // The custom fields this business actually keeps on a deal, in the order Settings defines them.
  const customDefs = seed.fields.filter((f) => f.object === "deal" && !f.retired && f.label in deal.custom)
  const admin = b.roles.find((r) => r.role === "admin")
  const csSeat = b.roles.find((r) => r.role === "cs")
  const warnings = dealWarnings({ ...deal, stage, closeDate, lastActivity: deal.lastActivity }, TODAY, seed.dealWarningThresholds)
  const crm = seed.integrations.find((i) => /crm|salesforce|hubspot/i.test(`${i.kind} ${i.name}`))

  /* Level one or level two comes from the usage model for this seat at this business — never a list.
     A zero there does not mean level two, it means the item is not part of this seat's job at this
     business at all: the control is removed rather than shown empty or greyed (rule 4). */
  const used = (id: string) => disclosure.weekly(id) > 0
  const qualIsCard = disclosure.level("qual.card") === 1
  const signalsIsCard = disclosure.level("company.signals") === 1
  const customInHeader = disclosure.level("fields.custom") === 1 && customDefs.length > 0
  const relatedIsCard = disclosure.level("company.related-deals") === 1 && otherDeals.length > 0
  const historyOpen = disclosure.level("history.changes") === 1
  const showType = disclosure.level("field.deal-type") === 1
  const hasCrm = Boolean(crm && deal.crmId)

  const validated = QUAL_ELEMENTS.filter((e) => qual?.[e]?.state === "validated").length
  const answered = QUAL_ELEMENTS.filter((e) => qual?.[e]?.value).length
  const toValidate = answered - validated
  const openTasks = tasks.filter((t) => t.status === "Open")

  /* ------------------------------------------------------------------------------- the actions */

  const log = (kind: DealActivity["kind"], summary: string, detail?: string) => {
    setExtra((x) => [...x, { id: `local-${x.length + 1}`, dealId: deal.id, kind, at: TODAY, by: session.user, summary, detail }])
    toast(`${summary} · logged`)
  }

  const moveStage = (to: DealStage) => {
    if (!canEdit) return
    const from = stage
    setStage(to)
    setProbability(STAGE_PROBABILITY[to])
    setForecast(STAGE_FORECAST[to])
    log("stage", `Stage · ${from} → ${to}`, `Probability ${STAGE_PROBABILITY[from]}% → ${STAGE_PROBABILITY[to]}%, forecast category ${STAGE_FORECAST[from]} → ${STAGE_FORECAST[to]}.`)
  }

  /** Owned here, word for word, and read by the deals board so the two can never disagree. */
  const wonConsequence = [
    "Stage becomes Closed won.",
    "Forecast category becomes Closed.",
    // A count earns its place only where it would otherwise mislead (DESIGN.md §3): "0 open tasks
    // close" tells a person nothing they did not already see.
    openTasks.length > 0 ? `${openTasks.length} open task${openTasks.length === 1 ? "" : "s"} close.` : null,
    crm ? `${crm.name} is updated.` : null,
    csSeat ? `${deal.company} moves to customer success, and the hand-off arrives in ${csSeat.user}'s queue.` : null,
  ].filter(Boolean).join(" ")

  const lostConsequence = `Archived as lost. The deal leaves the board and the forecast${openTasks.length > 0 ? `, its ${openTasks.length} open task${openTasks.length === 1 ? "" : "s"} close` : ""}, and it stays on ${deal.company} and in Reports.`

  /* --------------------------------------------------------------------------------- the stage */

  const missingFor = (stageName: DealStage): string[] => {
    const req = stages.find((s) => s.name === stageName)?.requiredFields ?? []
    return req.filter((f) => {
      const element = QUAL_ELEMENTS.find((e) => e.toLowerCase() === f.toLowerCase())
      if (element) return qual?.[element]?.state !== "validated"
      if (f.toLowerCase().includes("amount")) return !amount
      if (f.toLowerCase().includes("close")) return !closeDate
      return false
    })
  }

  const stepper = (
    <Place id="field.stage" label="the stage" className="space-y-2">
      {/* A radiogroup: one tab stop, arrow keys between the steps, and the gate spoken on the step. */}
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={2}
        aria-label="Stage"
        className="max-w-full flex-wrap"
        value={stage}
        onValueChange={(v) => {
          if (!v || v === stage) return
          const missing = missingFor(v as DealStage)
          if (missing.length) { toast(`${v} needs ${missing.join(" and ")}.`); return }
          moveStage(v as DealStage)
        }}
      >
        {stages.map((s) => {
          const at = stages.findIndex((x) => x.name === s.name)
          const missing = missingFor(s.name)
          return (
            <ToggleGroupItem
              key={s.name}
              value={s.name}
              aria-describedby={missing.length && r7 ? "stage-gate" : undefined}
              data-item={s.name === stage ? "deal.stage" : undefined}
              data-item-label={s.name === stage ? "Stage" : undefined}
              disabled={!canEdit}
              onKeyDown={(e) => {
                const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
                if (!step) return
                const to = stages[(at + step + stages.length) % stages.length]
                if (canEdit && missingFor(to.name).length === 0) moveStage(to.name)
              }}
            >
              {s.name}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
      {/* The gate is on the step before the click, not after it: a rule met only afterwards is hidden. */}
      {r7 && stages.filter((s) => missingFor(s.name).length > 0).slice(0, 1).map((s) => (
        <p key={s.name} id="stage-gate" className="t-small" style={{ color: statusInk("warning") }}>
          <Thing id="qual.gate" label="The stage gate">
            {s.name} needs {missingFor(s.name).join(" and ")}. Set by {admin?.user ?? "your admin"} in{" "}
            {/* A step in the chain, not a jump: Settings opens with this deal remembered, and the
                crumb comes back to the gate sentence, lit. */}
            <a className="underline" href={href(STAGE_GATE_SETTING)}
               onClick={(e) => { e.preventDefault(); follow(STAGE_GATE_SETTING, { route: route.raw, title: pageTitle, anchor: "stage-gate" }) }}>
              Settings › Pipeline and data
            </a>.
          </Thing>
        </p>
      ))}
    </Place>
  )

  /* Where probability and forecast category live before rule 5 puts them under the stage: a row in
     All fields saying where they are set, which is what the common version leaves you with. */
  const stageSemantics = (
    <span className="text-muted-foreground">
      <Thing id="deal.probability" label="Probability">Probability</Thing> and{" "}
      <Thing id="deal.forecast" label="Forecast category">forecast category</Thing> are set per stage in
      Settings › Objects, fields, stages › Deal fields &amp; stages › Pipelines.
    </span>
  )

  /* -------------------------------------------------------------------------------- the fields */

  /* Rule 4 is what turns editing into a real control. Before it, a field is edited by hovering it and
     clicking the word that appears — no keyboard, no touch, and the affordance is invisible until the
     pointer is already on it. The template's in-place editor is handed over only once rule 4 is on. */
  const editable = (_id: string, value: string, onSave: (v: string) => void) =>
    r4 && canEdit ? { value, onSave } : undefined

  const withHover = (node: ReactNode, run: () => void, id?: string) =>
    r4 || !canEdit ? node : (
      <span className="group/hover inline-flex items-center gap-1" onMouseDown={run}>
        {node}
        <span aria-hidden="true" data-item={id} data-item-label="Edit, on hover"
          className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover/hover:opacity-100">Edit</span>
      </span>
    )

  const ask = (label: string, current: string, onSave: (v: string) => void) => () => {
    const next = window.prompt(label, current)
    if (next !== null) onSave(next)
  }

  /* The tail, as rows. It is the same list wherever it is shown: the All Fields tab in the common
     version, the All fields door once there is one. */
  const tail: { key: string; label: string; value: ReactNode; group?: string }[] = [
    ...(showType ? [] : [{ key: "type", label: "Deal type", value: <Thing id="field.deal-type" label="Deal type">{deal.dealType}</Thing> }]),
    { key: "created", label: "Created", value: <Thing id="deal.created" label="Created">{day(deal.createdAt)} · {daysBetween(deal.createdAt)} days old</Thing> },
    { key: "source", label: "Lead source", value: <Thing id="field.source" label="Lead source">{deal.source}</Thing> },
    { key: "campaign", label: "Campaign", value: <Thing id="field.campaign" label="Campaign">{deal.campaign ?? "—"}</Thing> },
    { key: "competitor", label: "Competitor", value: <Thing id="field.competitor" label="Competitor">{deal.competitor ?? "—"}</Thing> },
    { key: "term", label: "Contract term", value: <Thing id="field.contract-term" label="Contract term">{deal.contractTerm}</Thing> },
    { key: "payment", label: "Payment terms", value: <Thing id="field.payment-terms" label="Payment terms">{deal.paymentTerms}</Thing> },
    { key: "discount", label: "Discount", value: <Thing id="field.discount" label="Discount">{deal.discount}%</Thing> },
    { key: "proposal", label: "Proposal link", value: <Thing id="field.proposal-link" label="Proposal link">{deal.proposalLink ?? "—"}</Thing> },
    { key: "esign", label: "Signature status", value: <Thing id="field.esign" label="Signature status">{deal.esign}</Thing> },
    { key: "split", label: "Split owners", value: <Thing id="field.split" label="Split owners">{deal.splitOwners.join(", ") || "—"}</Thing> },
    { key: "tags", label: "Tags", value: <Thing id="field.tags" label="Tags">{deal.tags.join(", ") || "—"}</Thing> },
    { key: "priority", label: "Priority", value: <Thing id="field.priority" label="Priority">{deal.priority}</Thing> },
    { key: "weighted", label: "Weighted amount", value: <Thing id="field.weighted" label="Weighted amount">{money(Math.round(amount * probability) / 100, deal.currency)}</Thing> },
    { key: "line-items", label: "Line items", value: <Thing id="field.line-items" label="Line items">{deal.lineItems.map((l) => `${l.name} × ${l.qty}`).join(", ") || "—"}</Thing> },
    ...(hasCrm ? [{ key: "crm-id", label: "CRM record id", value: <Thing id="field.crm-id" label="CRM record id">{deal.crmId ?? "—"}</Thing> }] : []),
    // Before rule 5 this row is all the page says about probability and forecast category.
    ...(r1 && !r5 ? [{ key: "stage-semantics", label: "Stage semantics", value: stageSemantics }] : []),
  ]

  const fields: RecordField[] = [
    {
      key: "stage", label: "Stage", wide: true, editor: "stepper", value: stepper,
      // Probability and forecast never leave the stage: they change together and are read together.
      under: !r5 ? undefined : (
        <span className="flex flex-wrap items-center gap-x-3">
          <Thing id="deal.probability" label="Probability">Probability <span className="tabular-nums text-foreground">{probability}%</span></Thing>
          <Thing id="deal.forecast" label="Forecast category">
            Forecast category{" "}
            {canEdit ? (
              <Select value={forecast} onValueChange={(v) => { setForecast(v as ForecastCategory); log("field", `Forecast category · ${forecast} → ${v}`) }}>
                <SelectTrigger className="ml-1 inline-flex h-6 w-auto gap-1 border-none px-1 py-0 text-xs" aria-label="Forecast category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Pipeline", "Best case", "Commit", "Closed", "Omitted"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : <span className="text-foreground">{forecast}</span>}
          </Thing>
        </span>
      ),
    },
    {
      key: "amount", label: "Amount", editor: "money",
      value: withHover(
        <Thing id="deal.amount" label="Amount" className="tabular-nums">{money(amount, deal.currency)}</Thing>,
        ask("Amount", String(amount), (v) => setAmount(Number(v) || 0)),
        "edit.hover",
      ),
      edit: editable("deal.amount", String(amount), (v) => { setAmount(Number(v) || 0); log("field", `Amount · ${money(amount, deal.currency)} → ${money(Number(v) || 0, deal.currency)}`) }),
      under: b.id === "meridian" ? <Thing id="deal.currency" label="Currency">Currency {deal.currency}</Thing> : undefined,
    },
    {
      key: "close", label: "Close date", editor: "date",
      value: withHover(
        <Thing id="deal.close-date" label="Close date" className="tabular-nums">{day(closeDate)}</Thing>,
        ask("Close date (YYYY-MM-DD)", closeDate, setCloseDate),
      ),
      under: <>{closeDate < TODAY ? "passed" : `in ${daysBetween(TODAY, closeDate)} days`}</>,
      edit: editable("deal.close-date", closeDate, (v) => { setCloseDate(v); log("field", `Close date · ${day(closeDate)} → ${day(v)}`) }),
    },
    {
      key: "next-step", label: "Next step", span: 2, editor: "text",
      tone: nextStep ? undefined : "warning",
      // The next step and its date are one line. A deal with no next step is not being worked.
      value: (
        <Place id="field.next-step" label="the next step" className="contents">
          <Thing id="deal.next-step" label="Next step">
            {nextStep
              ? <>{nextStep}{r5 && <Thing id="deal.next-step-date" label="Next step date" className="text-muted-foreground"> · {nextStepDue ? `${day(nextStepDue)} (${ago(nextStepDue)})` : "no date"}</Thing>}</>
              : <>No next step</>}
          </Thing>
        </Place>
      ),
      edit: editable("deal.next-step", nextStep, (v) => { setNextStep(v); log("field", `Next step · ${v || "cleared"}`) }),
      under: r5 && canEdit && nextStep ? (
        <label className="inline-flex items-center gap-2">
          Due
          <Input type="date" aria-label="Next step date" value={nextStepDue} className="h-6 w-36 px-1 py-0 text-xs"
            onChange={(e) => { setNextStepDue(e.target.value); log("field", `Next step date · ${day(e.target.value)}`) }} />
        </label>
      ) : undefined,
    },
    // Before rule 5 the next step's date is a field of its own, two cells away from the step it dates.
    ...(!r5 && nextStep
      ? [{
          key: "next-step-due", label: "Next step due",
          value: <Thing id="deal.next-step-date" label="Next step date" className="tabular-nums">{nextStepDue ? day(nextStepDue) : "—"}</Thing>,
        } as RecordField]
      : []),
    { key: "owner", label: "Owner", editor: "user", value: <Thing id="deal.owner" label="Owner">{deal.owner}</Thing>, under: isOwner ? "you" : undefined },
    { key: "last-activity", label: "Last activity", value: <Thing id="deal.last-activity" label="Last activity">{day(deal.lastActivity)} <span className="text-muted-foreground">· {ago(deal.lastActivity)}</span></Thing> },
    ...(seed.pipelines.length > 1 ? [{ key: "pipeline", label: "Pipeline", value: <Thing id="deal.pipeline" label="Pipeline">{deal.pipeline}</Thing> } as RecordField] : []),

    // The warning chips: each prints its observed number against the workspace's threshold.
    ...(warnings.length
      ? [{
          key: "warnings", label: "Warnings", wide: true,
          value: (
            <div data-item="deal.warnings" data-item-label="Warning chips" className="flex flex-wrap gap-1.5">
              {warnings.map((w) => (
                <Chip key={w.kind} status={warningStatus(w.kind)}>
                  {w.kind} · {readable(w.observed)} against {readable(w.threshold)}
                </Chip>
              ))}
            </div>
          ),
        } as RecordField]
      : []),

    // Custom fields sit in the header where the seat works in them, and behind a door where it does not.
    ...(customInHeader
      ? customDefs.map((f) => ({ key: f.id, label: f.label, group: f.group, value: <Thing id={`custom.${f.id}`} label={f.label}>{fieldValue(deal.custom[f.label])}</Thing> } as RecordField))
      : []),

    // Level two: the tail every deal record accumulates. The template puts these in the All fields door.
    // Until rule 2 lands it is not a door at all: it is the All Fields tab, rendered in the main column.
    ...(r2 ? tail.map((f) => ({ ...f, level: 2 }) as RecordField) : []),
  ]

  /* -------------------------------------------------------------------------------- the timeline */

  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0]
  const filtered = activities.filter((a) => !active.kinds || (active.kinds as readonly string[]).includes(a.kind))
  const groups: { day: string; items: DealActivity[] }[] = []
  for (const a of filtered.slice(0, shown)) {
    const g = dayGroup(a.at)
    const last = groups[groups.length - 1]
    if (last && last.day === g) last.items.push(a)
    else groups.push({ day: g, items: [a] })
  }

  const timelineItems = filtered.length === 0 ? (
    <EmptyState title="No activity yet" body="Log the first call or note and it will appear here, newest first." />
  ) : (
    <ThingPlace id="timeline.list" label="The activity timeline" place="timeline" placeLabel="the timeline" className="space-y-4">
      {groups.map((g) => (
        <section key={g.day}>
          {/* The day is a word with the library's rule under it, not a heading over a stack of boxes. */}
          <h3 className="bg-card t-small sticky top-0 z-10 py-1 font-medium text-muted-foreground">{g.day}</h3>
          <Divider />
          <div>
            {g.items.map((a, i) => {
              const Icon = KIND_ICON[a.kind]
              return (
                // One event is a row in the timeline's card, separated from the next by the
                // library's rule. A box each would make every event its own group.
                <div key={a.id}>
                {i > 0 && <Divider />}
                <article className="flex gap-2.5 py-2.5">
                  <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{a.summary}</div>
                    <div className="text-xs text-muted-foreground">{a.by} · {day(a.at)}</div>
                    {a.detail && a.kind === "email" && (
                      <>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.detail}</p>
                        <Door id={`deal.email.${a.id}`} label="Show full email">
                          <p className="whitespace-pre-wrap">{a.detail}</p>
                        </Door>
                      </>
                    )}
                    {a.detail && a.kind !== "email" && <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>}
                  </div>
                </article>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </ThingPlace>
  )

  /* ----------------------------------------------------------------------------- the side cards */

  const cards: RecordCard[] = []

  // The agent proposal, while one exists: object state, never a list that lingers.
  if (proposal && proposalOpen && r6) {
    const q = evidence[0]
    cards.push({
      id: "proposal", title: "Agent proposal", tone: "attention",
      children: (
        <ThingPlace id="agent.proposal" label="The agent proposal" place="card.proposal" placeLabel="the Agent proposal card" className="space-y-2 text-sm">
          <div className="text-xs text-muted-foreground">{proposal.agent} · {day(proposal.when)} {proposal.at}</div>
          <div className="font-medium">Stage · {stage} → {stages[Math.min(stages.findIndex((s) => s.name === stage) + 1, stages.length - 1)]?.name}</div>
          {q && (
            <blockquote className="flex gap-2 text-xs text-muted-foreground">
              <Divider orientation="vertical" className="h-auto self-stretch" />
              <span>{quoted(q.quote)} — {q.sourceKind}, {day(q.at)}</span>
            </blockquote>
          )}
          <StateChip state="suggested" />
          {r7 && <p className="text-xs">
            {`Stage becomes ${stages[Math.min(stages.findIndex((s) => s.name === stage) + 1, stages.length - 1)]?.name}. `}
            {`Probability ${probability}% → ${STAGE_PROBABILITY[stages[Math.min(stages.findIndex((s) => s.name === stage) + 1, stages.length - 1)]?.name ?? stage]}%, `}
            {`forecast category ${forecast} → ${STAGE_FORECAST[stages[Math.min(stages.findIndex((s) => s.name === stage) + 1, stages.length - 1)]?.name ?? stage]}. `}
            {crm ? `${crm.name} is updated. ` : ""}{proposal.credits} credits.
          </p>}
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => { moveStage(stages[Math.min(stages.findIndex((s) => s.name === stage) + 1, stages.length - 1)].name); setProposalOpen(false) }}>Approve</Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => { setProposalOpen(false); toast("Proposal dismissed. It leaves the agent queue too.") }}>Dismiss</Button>
          </div>
          <p className="text-xs">
            <button type="button" className="underline" onClick={() => setEvidenceDoor(true)}>Open the full evidence</button>
          </p>
        </ThingPlace>
      ),
    })
  }

  // Qualification: the AE's weekly work. A human validates; the model proposes; the quote sits beside it.
  const qualCard = (
    <ThingPlace id="qual.card" label="Qualification" place="card.qual" placeLabel="the Qualification card">
      {/* Label above value, divided by the library's rule. `Fields` puts the label in a column of
          its own, which needs the main column's width; this card lives in the narrow side rail. */}
      <dl className="w-full min-w-0 [&>*+*]:border-t [&>*+*]:border-border">
        {QUAL_ELEMENTS.map((element) => {
          const v = qual?.[element]
          const quote = evidence.find((e) => e.element === element)
          return (
            <div key={element} className="min-w-0 py-2">
              <dt className="t-label text-muted-foreground">{element}</dt>
              <dd className="t-body min-w-0 break-words">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="min-w-0">{v?.value || <span className="text-muted-foreground">Not answered yet</span>}</span>
                  {v?.value && <StateChip state={v.state} />}
                </span>
                {v?.value && (
                  /* Two facts, so one value line. `MetaLine` is a table row's part: its clamp makes
                     it as wide as its longest run, and the side rail has no width to spare. */
                  <div className="t-small break-words text-muted-foreground">
                    <span className="opacity-70">
                      {v.state === "validated" ? "Validated by " : v.state === "edited" ? "Edited by " : "Source "}
                    </span>
                    {v.state === "validated" || v.state === "edited" ? v.updatedBy : v.source}
                    <span aria-hidden="true" className="px-1.5 opacity-50">·</span>
                    {day(v.at)}
                  </div>
                )}
                {/* The words the buyer used: a model's answer is checkable only with the quote. */}
                {quote && (
                  <blockquote className="t-small mt-1 flex gap-2 text-muted-foreground">
                    <Divider orientation="vertical" className="h-auto self-stretch" />
                    {quoted(quote.quote)}
                  </blockquote>
                )}
                {v?.value && v.state !== "validated" && canEdit && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    <Button size="sm" variant="outline" onClick={() => {
                      setQual((prev) => prev && ({ ...prev, [element]: { ...prev[element], state: "validated", updatedBy: session.user, at: TODAY } }))
                      toast(`${element} validated. Nothing generated overwrites it now.`)
                    }}>Validate</Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      const next = window.prompt(`${element}`, v.value)
                      if (next === null) return
                      setQual((prev) => prev && ({ ...prev, [element]: { ...prev[element], value: next, state: "edited", updatedBy: session.user, at: TODAY } }))
                    }}>Edit</Button>
                  </div>
                )}
              </dd>
            </div>
          )
        })}
      </dl>
    </ThingPlace>
  )

  if (qualIsCard && used("qual.card") && r1) {
    cards.push({
      id: "qualification",
      title: "Qualification",
      subtitle: `${answered} of 8 answered · ${toValidate} to validate`,
      children: answered === 0
        ? <EmptyState title="Nothing answered yet" body="The prep brief lists what the next call should establish." />
        : qualCard,
    })
  }

  if (meeting && used("meeting.card") && r1) {
    const gaps = 8 - answered
    cards.push({
      id: "meeting", title: "The meeting",
      children: (
        <ThingPlace id="meeting.card" label="The meeting" place="card.meeting" placeLabel="the meeting card" className="space-y-2 text-sm">
          <div>{day(meeting.at)} · {meeting.state}</div>
          <ul className="text-xs text-muted-foreground">
            {meeting.attendees.slice(0, 4).map((a) => {
              const role = contacts.find((c) => c.name === a)?.role
              return <li key={a}>{a}{role ? ` · ${role}` : ""}</li>
            })}
          </ul>
          {meeting.summary
            ? <p className="text-xs">{meeting.summary}</p>
            : <p className="text-xs text-muted-foreground">{gaps} qualification element{gaps === 1 ? "" : "s"} still unanswered.</p>}
          <Button size="sm" variant="outline" onClick={() => toast("The prep brief opens as its own record.")}>Open the prep brief</Button>
          {meeting.actionItems.length > 0 && (
            <div className="border p-2">
              <div className="text-xs font-medium">Action items</div>
              <ul className="list-disc pl-4 text-xs text-muted-foreground">{meeting.actionItems.map((i) => <li key={i}>{i}</li>)}</ul>
              <Button size="sm" className="mt-2 h-7 text-xs" onClick={() => toast(`${meeting.actionItems.length} tasks created.`)}>
                Create {meeting.actionItems.length} tasks
              </Button>
            </div>
          )}
        </ThingPlace>
      ),
    })
  }

  // "Contacts · 5 · 2 have replied": five names where one has answered is not five relationships.
  if (r1) cards.push({
    id: "contacts", title: "Contacts", count: contacts.length,
    subtitle: `${contacts.filter((c) => c.engaged).length} have replied`,
    action: canEdit ? <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast("Search people at this company, then set a role.")}>Add</Button> : undefined,
    children: contacts.length === 0
      ? <EmptyState title="No contacts on this deal yet" body="Add the people you are talking to, and say what each of them is." />
      : (
        <ThingPlace id="contacts.list" label="Contacts on the deal" place="card.contacts" placeLabel="the Contacts card">
          {contacts.map((c, index) => (
            /* A contact opens beside the record: the deal stays where it is, with its scroll, its
               open doors and anything half-written in the composer, and [ and ] walk the rest of
               the contacts on this deal without closing. Escape brings focus back to this name. */
            <CardRow
              key={c.contactId}
              title={
                <button
                  data-item={c.contactId}
                  data-item-label={c.name}
                  className="text-left hover:underline"
                  onClick={(e) => openBeside({
                    kind: "person",
                    id: c.contactId,
                    list: { ids: contacts.map((x) => x.contactId), index },
                    opener: e.currentTarget,
                  })}
                >
                  {c.name}
                </button>
              }
              meta={<>{c.title} · {c.role} · {c.engaged ? "has replied" : "never replied"}</>}
              actions={canEdit ? [
                { label: "Email", onClick: () => toast(`Email ${c.name} from the composer.`) },
                { label: "Set role", onClick: () => toast(`Role for ${c.name}: Champion, Economic buyer, Technical, User, Blocker, Other.`) },
                { label: "Remove from deal", destructive: true, onClick: () => toast(`${c.name} removed from the deal. The contact record stays.`) },
              ] : undefined}
            />
          ))}
        </ThingPlace>
      ),
  })

  if (r1) cards.push({
    id: "tasks", title: "Open tasks", count: openTasks.length,
    action: canEdit ? <Button size="sm" variant="ghost" className="h-7 text-xs" data-item="tasks.create" data-item-label="Create a task" onClick={() => toast(`Task created on ${deal.name}, assigned to ${deal.owner}.`)}>Create</Button> : undefined,
    children: openTasks.length === 0
      ? <EmptyState title="No open tasks" body="Create one and it appears on the Tasks page too." />
      : <ThingPlace id="tasks.list" label="Open tasks" place="card.tasks" placeLabel="the Open tasks card">{openTasks.slice(0, 5).map((t) => (
          <CardRow key={t.id} title={`${t.kind}: ${t.contact}`} meta={`due ${day(t.due)}`}
            actions={[{ label: "Mark done", onClick: () => toast(`${t.kind} for ${t.contact} done.`) }]} />
        ))}</ThingPlace>,
  })

  if (r1) cards.push({
    id: "company", title: "Company",
    // The company opens beside the deal, not instead of it: the account is read with the deal still
    // on screen, and "Open the page" in the pane is the one way on to the whole company record.
    action: <Button size="sm" variant="ghost" className="h-7 text-xs" data-item="company.open" data-item-label="Open the company"
                    onClick={(e) => openBeside({ kind: "company", id: company?.id ?? "", opener: e.currentTarget })}>Open</Button>,
    children: (
      <dl data-item="company.card" data-item-label="Company summary" className="space-y-1 text-sm">
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Industry</dt><dd>{company?.industry ?? "—"}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Employees</dt><dd className="tabular-nums">{company?.employees?.toLocaleString() ?? "—"}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Stage</dt><dd>{company?.stage ?? "—"}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Owner</dt><dd>{company?.owner ?? "—"}</dd></div>
        {relatedIsCard && (
          <div data-item="company.related-deals" data-item-label="Other deals at this company" className="border-t pt-1">
            <dt className="text-muted-foreground">Other deals here</dt>
            {otherDeals.map((d) => (
              <dd key={d.id}>
                {/* Still a real link, for a new tab and for copying, but a plain click is a step in
                    a chain: it remembers this deal and this row, so the crumb comes back lit. */}
                <a className="hover:underline" data-item={d.id} data-item-label={d.name} href={href(`/ollopa/deals/${d.id}`)}
                   onClick={(e) => { e.preventDefault(); follow(`/ollopa/deals/${d.id}`, { route: route.raw, title: pageTitle, anchor: d.id }) }}>
                  {d.name} · {money(d.amount, d.currency)} · {d.stage}
                </a>
              </dd>
            ))}
          </div>
        )}
      </dl>
    ),
  })

  // Account health lives on a typed deal only: a new-business deal has no account behind it.
  if (account && deal.dealType !== "New" && used("company.account-health")) {
    cards.push({
      id: "health", title: "Account health · why",
      children: (
        <div data-item="company.account-health" data-item-label="Account health" className="space-y-1 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="t-section tabular-nums">{account.health}</span>
            {/* The band is a state, so it is a chip with its word and the registry's ink. */}
            <Chip status={account.band} />
            {/* One object: the account and the company are the same record, and it opens beside the
                deal so the health number and the deal stay on screen together. */}
            <button type="button" className="ml-auto text-xs underline" data-item="company.account-open" data-item-label="Open the account"
                    onClick={(e) => openBeside({ kind: "company", id: company?.id ?? account.companyId, opener: e.currentTarget })}>
              Open the account
            </button>
          </div>
          {/* The band, the number and the drivers that sum to it never sit across a door from each other. */}
          <ul className="text-xs text-muted-foreground">
            {account.drivers.map((d) => <li key={d.label} className="flex justify-between gap-2"><span>{d.label}</span><span className="tabular-nums">{d.points > 0 ? "+" : ""}{d.points}</span></li>)}
          </ul>
        </div>
      ),
    })
  }

  if (signalsIsCard && account) {
    cards.push({
      id: "signals", title: "Signals", count: account.signals.length,
      children: <div data-item="company.signals" data-item-label="Signals and news">{account.signals.slice(0, 4).map((s) => <CardRow key={s.id} title={s.kind} meta={`${s.detail} · ${day(s.fired)}`} />)}</div>,
    })
  }

  /* --------------------------------------------------------------------------------- the doors */

  /* Two pieces both the common version and the disclosed one render, so there is one of each.
     Rule 7 is what puts the price on the button: before it, running enrichment spends credits and
     the page does not say how many (spec 09 §5.2, the surprise-spend row). */
  const customFieldRows = customDefs.map((f) => (
    <div key={f.id} className="contents">
      <dt className="text-xs text-muted-foreground">{f.label}</dt>
      <dd><Thing id={`custom.${f.id}`} label={f.label}>{fieldValue(deal.custom[f.label])}</Thing></dd>
    </div>
  ))

  const enrichButton = (
    <Button size="sm" data-item="enrich.run" data-item-label="Enrich" onClick={() => toast(`Enriching ${deal.company}. ${CREDITS.enrich} credits.`)}>
      {r7 ? `Enrich · ${CREDITS.enrich} credits` : "Enrich"}
    </Button>
  )

  const doors: RecordDoor[] = []

  /* Rule 4 is what makes a door labelled by what is behind it and counted. Before it, a door carries
     the name of the tab or widget it came from and says nothing about how much is inside. */
  const doorLabel = (before: string, after: string) => (r4 ? after : before)
  const doorCount = (n: number | undefined) => (r4 ? n : undefined)

  if (used("qual.evidence") && r2) doors.push({
    id: "deal.evidence", label: doorLabel("Evidence", "Evidence and source quotes"), count: doorCount(evidence.length),
    content: evidence.length === 0
      ? <p className="text-muted-foreground">No conversation has been recorded against this deal yet.</p>
      : <ul data-item="qual.evidence" data-item-label="Evidence and source quotes" className="space-y-2">{evidence.map((e) => (
          <li key={e.id}><div className="text-xs font-medium">{e.element}</div><blockquote className="flex gap-2 text-xs text-muted-foreground"><Divider orientation="vertical" className="h-auto self-stretch" />{quoted(e.quote)}</blockquote><div className="t-small text-muted-foreground">{e.sourceKind} · {day(e.at)}</div></li>
        ))}</ul>,
  })

  if (!qualIsCard && answered > 0 && used("qual.card") && r2) {
    doors.push({ id: "deal.qualification", label: "Qualification", count: 8, content: qualCard })
  }

  if (!customInHeader && customDefs.length > 0 && r2) {
    doors.push({
      id: "deal.custom", label: doorLabel("Record details", "Custom fields"), count: doorCount(customDefs.length),
      content: (
        <dl className="grid grid-cols-[10rem_1fr] gap-x-4 gap-y-1.5">
          {customFieldRows}
        </dl>
      ),
    })
  }

  if (r2) doors.push({
    id: "deal.history", label: doorLabel("Change log", "History"), count: doorCount(history.length), openByDefault: historyOpen,
    content: history.length === 0
      ? <p className="text-muted-foreground">No stage changes yet.</p>
      : <ul data-item="history.changes" data-item-label="History of stage and field changes" className="space-y-1">{history.map((h) => <li key={h.stage + h.enteredOn} className="flex justify-between gap-2"><span>{h.stage}</span><span className="tabular-nums text-muted-foreground">{day(h.enteredOn)}</span></li>)}</ul>,
  })

  if (r2) doors.push({
    id: "deal.files", label: doorLabel("Files", "Files and the proposal"), count: doorCount(files.length),
    content: files.length === 0
      ? <EmptyState title="No files yet" body="Drop the proposal or the security pack here and it stays with the deal." />
      : <ul data-item="files.list" data-item-label="Files" className="space-y-1">{files.map((f) => <li key={f.id} className="flex justify-between gap-2"><span>{f.name}</span><span className="text-xs text-muted-foreground">{Math.round(f.size / 1024)} KB · {f.uploadedBy}</span></li>)}</ul>,
  })

  if (!signalsIsCard && r2) {
    doors.push({
      // Rule 5: signals and enrichment need room but must keep the deal in view, so this one is a drawer.
      id: "deal.signals", label: doorLabel("Enrichment", "Signals and news"), count: doorCount(account?.signals.length || undefined), container: r5 ? "drawer" : "inline",
      content: (
        <Place id="deal.signals.body" label={r5 ? "the Signals drawer" : "Signals and news"}>
          <div data-item="company.signals" data-item-label="Signals and news" className="space-y-3">
            {enrichButton}
            {(account?.signals ?? []).length === 0
              ? <p className="text-muted-foreground">Nothing has fired for {deal.company} yet.</p>
              : <ul className="space-y-2">{(account?.signals ?? []).map((s) => (
                  <li key={s.id}><div className="font-medium">{s.kind}</div><div className="text-xs text-muted-foreground">{s.detail} · {s.source} · {day(s.fired)}</div></li>
                ))}</ul>}
          </div>
        </Place>
      ),
    })
  }

  if (hasCrm && r2) {
    const runs = seed.syncRuns.slice(0, 10)
    doors.push({
      id: "deal.sync", label: r4 ? `Sync history · last ${Math.min(runs.length, 10)}` : "Sync",
      content: (
        <ul data-item="sync.history" data-item-label="Sync history" className="space-y-1 text-xs">
          <li className="pb-1">{crm?.name} record <span className="font-mono">{deal.crmId}</span> · synced {deal.crmSyncedAt ? day(deal.crmSyncedAt) : "never"}</li>
          {runs.map((s) => <li key={s.id} className="flex justify-between gap-2 text-muted-foreground"><span>{s.object} · {s.direction} · {s.pulled + s.pushed} records{s.failed ? `, ${s.failed} failed` : ""}</span><span className="tabular-nums">{day(s.started)}</span></li>)}
        </ul>
      ),
    })
  }

  /* --------------------------------------------------------------------------- the quick look */

  const quickLookFields: QuickLookField[] = [
    { label: "Stage", value: stage },
    { label: "Amount", value: money(amount, deal.currency) },
    { label: "Close date", value: day(closeDate) },
    { label: "Next step", value: nextStep ? `${nextStep} · ${nextStepDue ? day(nextStepDue) : "no date"}` : "No next step" },
    { label: "Owner", value: deal.owner },
    { label: "Last activity", value: `${day(deal.lastActivity)} · ${ago(deal.lastActivity)}` },
  ]
  // The owner moves the deal; anyone else came to say something to the owner. One editable field either way.
  const quickLookEditable: QuickLookEditable = isOwner
    ? { label: "Stage", value: stage, options: stages.map((s) => s.name), onChange: (v) => moveStage(v as DealStage) }
    : { label: `Comment for ${deal.owner}`, value: "", multiline: true, onChange: (v) => log("note", `Note for ${deal.owner}`, v) }

  /* -------------------------------------------------------------------------------- the ribbon */

  const ribbon =
    lost ? { tone: "warning" as const, text: `Archived as lost on ${day(TODAY)} · ${lostReason}`, action: <Button size="sm" variant="outline" onClick={() => setLost(false)}>Reopen</Button> }
    : stage === "Closed won" ? { tone: "good" as const, text: `Won on ${day(deal.lastActivity)}`, action: <Button size="sm" variant="outline" onClick={() => moveStage("Negotiation")}>Reopen</Button> }
    : deal.syncState === "error" ? { tone: "error" as const, text: `Not synced to ${crm?.name ?? "the CRM"} since ${day(deal.crmSyncedAt)}: ${deal.crmError}`, action: <a className="text-sm underline" href="#sync">Sync history ›</a> }
    : undefined

  /* ------------------------------------------------- the controls the rules take away, one by one */

  const composerBlock = (
    <div ref={composer} data-item="timeline.composer" data-item-label="The composer">
      <Composer
        session={session}
        business={b.id}
        contacts={contacts.map((c) => ({ contactId: c.contactId, name: c.name, role: c.role }))}
        companyName={deal.company}
        isOwner={isOwner}
        owner={deal.owner}
        mates={b.roles.filter((s2) => s2.user !== session.user).map((s2) => ({ user: s2.user, title: s2.title }))}
        onLog={log}
      />
    </div>
  )

  // The section filter from the layout system: a tab strip where there is room, one Select below
  // `md`, where six words in a 350 px card used to clip at "Meetin…" (LAYOUTS.md §5).
  const filterChips = (
    <div data-item="timeline.filter" data-item-label="Timeline filters">
      <SectionFilter
        label="Timeline filters"
        options={FILTERS.map((f) => ({ key: f.key, label: f.label }))}
        value={active.key}
        onChange={setFilter}
      />
    </div>
  )

  /** The strip and the list it filters: one filter, one list, and the list says what is on. */
  const timeline = (listClass: string, bodyClass: string) => (
    <>
      <div className={listClass}>{filterChips}</div>
      <div className={bodyClass}>
        {pinnedNote}
        {timelineItems}
        {loadOlder}
      </div>
    </>
  )

  const pinnedNote = pinned ? (
    <Group as="article" data-item="timeline.pin" data-item-label="Pinned note" className="mb-3">
      <div className="t-small font-medium text-muted-foreground">Pinned note</div>
      <p className="t-body">{pinned.body}</p>
      <div className="t-small text-muted-foreground">{pinned.author} · {day(pinned.at)}</div>
      <Divider className="mt-2" />
    </Group>
  ) : undefined

  const loadOlder = filtered.length > shown ? (
    <div className="flex justify-center pt-3">
      <Button variant="outline" size="sm" onClick={() => setShown((n) => n + 12)}>Load older</Button>
    </div>
  ) : undefined

  /* The bodies of the tab strip. A body that is not showing keeps its contents in the DOM and says so
     with data-open="false", which is how the lesson knows a thing is out of sight without measuring it.
     Inside All Fields the fields are grouped, and a group is a third level: All Fields › group › field. */
  const tabStrip: [string, string][] = r1
    ? [["files", "Files"], ["notes", "Notes"], ["all", "All Fields"], ["enrich", "Enrichment"]]
    : [["activities", "Activities"], ["files", "Files"], ["notes", "Notes"], ["all", "All Fields"], ["enrich", "Enrichment"]]
  const showingTab = tabStrip.some(([k]) => k === parodyTab) ? parodyTab : tabStrip[0][0]

  const tabBody = (key: string, place: string, label: string, body: ReactNode) => (
    tabStrip.every(([k]) => k !== key) ? null : (
      <Place key={key} id={place} label={label} open={showingTab === key} className={showingTab === key ? undefined : "hidden"}>{body}</Place>
    )
  )

  const tabBodies = (
    <>
      {tabBody("activities", "tab.activities", "the Activities tab", timeline("", ""))}
      {tabBody("files", "tab.files", "the Files tab",
        files.length === 0
          ? <p className="text-muted-foreground">No files yet.</p>
          : <ul data-item="files.list" data-item-label="Files" className="space-y-1">
              {files.map((f) => <li key={f.id} className="flex justify-between gap-2"><span>{f.name}</span><span className="text-xs text-muted-foreground">{Math.round(f.size / 1024)} KB · {f.uploadedBy}</span></li>)}
            </ul>)}
      {tabBody("notes", "tab.notes", "the Notes tab",
        <ul data-item="timeline.note-list" data-item-label="Notes" className="space-y-2">
          {activities.filter((a) => a.kind === "note").map((a) => (
            <li key={a.id}><div>{a.summary}</div><div className="text-xs text-muted-foreground">{a.by} · {day(a.at)}</div></li>
          ))}
          {notes.map((n) => (
            <li key={n.id}><div>{n.body}</div><div className="text-xs text-muted-foreground">{n.author} · {day(n.at)}</div></li>
          ))}
        </ul>)}
      {tabBody("all", "tab.all-fields", "the All Fields tab",
        <div className="space-y-1">
          {/* A field group is a door inside a tab: the third level rule 2 removes. */}
          {["Commercial", "Legal", "Everything else"].map((g) => {
            const rows = g === "Everything else"
              ? tail.map((f) => ({ key: f.key, label: f.label, value: f.value }))
              : customDefs.filter((f) => f.group === g).map((f) => ({
                  key: f.id, label: f.label,
                  value: <Thing id={`custom.${f.id}`} label={f.label}>{fieldValue(deal.custom[f.label])}</Thing>,
                }))
            if (rows.length === 0) return null
            const open = group === g
            return (
              <section key={g}>
                <h4 className="m-0">
                  <button type="button" aria-expanded={open} onClick={() => setGroup(open ? null : g)}
                    className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-xs font-medium hover:bg-muted">
                    <ChevronRight aria-hidden="true" className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-90")} />
                    {g}
                  </button>
                </h4>
                <Place id={`group.${g.toLowerCase().split(" ")[0]}`} label={`the ${g} field group`} open={open}
                  className={cn("grid grid-cols-[10rem_1fr] gap-x-4 gap-y-1 pl-6", !open && "hidden")}>
                  {rows.map((f) => (
                    <div key={f.key} className="contents">
                      <dt className="text-xs text-muted-foreground">{f.label}</dt>
                      <dd className="text-sm">{f.value}</dd>
                    </div>
                  ))}
                  {g === "Legal" && !r1 && (
                    <div className="contents">
                      <dt className="text-xs text-muted-foreground">Champion confirmed</dt>
                      <dd className="text-sm">
                        <Thing id="qual.card" label="Champion confirmed">
                          <input type="checkbox" readOnly checked className="align-middle" /> <span className="align-middle">Yes</span>
                        </Thing>
                      </dd>
                    </div>
                  )}
                </Place>
              </section>
            )
          })}
        </div>)}
      {tabBody("enrich", "tab.enrich", "the Enrichment tab",
        <div data-item="company.signals" data-item-label="Signals and news" className="space-y-3">
          {enrichButton}
          {(account?.signals ?? []).length === 0
            ? <p className="text-muted-foreground">Nothing has fired for {deal.company} yet.</p>
            : <ul className="space-y-2">{(account?.signals ?? []).map((sg) => (
                <li key={sg.id}><div className="font-medium">{sg.kind}</div><div className="text-xs text-muted-foreground">{sg.detail} · {sg.source} · {day(sg.fired)}</div></li>
              ))}</ul>}
        </div>)}
    </>
  )

  /* The gear that lets each person hide widgets: a per-user layout, which is the design problem handed
     back to the user. Rule 3 deletes it (spec 09 §5.2, the gear row; the argument is rule 6 itself). */
  const gear = r3 ? null : (
    <span className="relative">
      <Button size="icon" variant="ghost" className="size-7" aria-label="Customize widget visibility"
        data-item="layout.gear" data-item-label="Customize widget visibility" onClick={() => setGearOpen((o) => !o)}>
        <Settings2 className="size-4" />
      </Button>
      {gearOpen && (
        <span className="absolute left-0 top-8 z-30 w-56 rounded-md border bg-popover p-2 text-xs shadow-lg">
          <span className="block pb-1 font-medium">Show widgets</span>
          {["general", "details", "account", "contacts", "tasks", "notes"].map((w) => (
            <label key={w} className="flex items-center gap-2 py-0.5 capitalize">
              <input type="checkbox" checked={!hiddenWidgets.includes(w)}
                onChange={() => setHiddenWidgets((h) => (h.includes(w) ? h.filter((x) => x !== w) : [...h, w]))} />
              {w}
            </label>
          ))}
        </span>
      )}
    </span>
  )

  /* Before rule 6 a waiting proposal is an item in the bell, seen if you happen to open it. Rule 6
     makes it a card that is there because the object has a proposal, and gone when it is decided. */
  const bell = r6 || !proposal ? null : (
    <span className="relative">
      <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" aria-expanded={bellOpen} onClick={() => setBellOpen((o) => !o)}>
        <Bell className="size-3.5" /> 1
      </Button>
      <Place id="bell" label="the notification bell" open={bellOpen}
        className={cn("absolute right-0 top-8 z-30 w-72 rounded-md border bg-background p-2 text-xs shadow-sm", !bellOpen && "hidden")}>
        <ThingPlace id="agent.proposal" label="The agent proposal" place="bell.item" placeLabel="the notification bell">
          <span className="block font-medium">{proposal.agent}</span>
          <span className="block text-muted-foreground">{proposal.summary}</span>
        </ThingPlace>
      </Place>
    </span>
  )

  /* Rule 7 takes Delete out of here and puts it in the actions row with what it removes beside it. */
  const overflow = r7 ? null : (
    <span className="relative">
      <Button size="icon" variant="ghost" className="size-7" aria-label="More actions" aria-expanded={parodyMenu} onClick={() => setParodyMenu((o) => !o)}>
        <MoreHorizontal className="size-4" />
      </Button>
      <Place id="parody.menu" label={"the \u201c\u2026\u201d menu"} open={parodyMenu}
        className={cn("absolute right-0 top-8 z-30 w-48 rounded-md border bg-background p-1 text-xs shadow-sm", !parodyMenu && "hidden")}>
        <button type="button" data-item="close.delete" data-item-label="Delete deal"
          className="block w-full rounded px-2 py-1 text-left text-destructive hover:bg-muted"
          onClick={() => { setParodyMenu(false); toast("Delete this deal?") }}>
          Delete deal
        </button>
      </Place>
    </span>
  )

  /* What is left of the tab strip between rule 1 and rule 2: the Activities tab has dissolved into the
     page, and Files, Notes, All Fields and Enrichment are still tabs beside the record. */
  const residualTabs = r2 ? null : (
    <section className="mt-6 rounded-lg border">
      <Place id="parody.tabs" label="the tab strip" className="flex flex-wrap gap-1 border-b p-1">
        {tabStrip.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setParodyTab(k as typeof parodyTab)}
            className={cn("rounded-md px-2.5 py-1 text-xs", showingTab === k ? "bg-foreground text-background" : "hover:bg-muted")}>
            {l}
          </button>
        ))}
      </Place>
      <div className="p-3 text-sm">{tabBodies}</div>
    </section>
  )

  /* ------------------------------------------------ the common version, before any rule is applied */

  /* Modelled on Apollo's deal profile page, with the contact and account profile pages where the deal
     article is thin (spec 09 §5, from Apollo's knowledge base as fetched on 13 September 2026): a left
     panel of stacked widgets — "general info, account, contacts, tasks, notes" — a right strip of tabs,
     "See all fields", a gear to hide widgets, hover-to-edit, Delete inside a "…" menu, custom fields on
     an All Fields tab, and probability and forecast category three levels away in Settings.
     Same seed, same rows, same numbers as every later step. Nothing here is invented. */
  if (!r1) {
    const widget = (key: string, title: string, body: ReactNode, action?: ReactNode) =>
      hiddenWidgets.includes(key) ? null : (
        <section className="rounded-lg border bg-card p-3">
          <div className="flex items-baseline gap-2 pb-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h3>
            {action && <span className="ml-auto">{action}</span>}
          </div>
          <Place id={`widget.${key}`} label={`the ${title} widget`}>{body}</Place>
        </section>
      )

    const row = (label: string, value: ReactNode, run?: () => void) => (
      <div className="flex items-baseline justify-between gap-3 border-t py-1 first:border-t-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="min-w-0 text-right text-sm">{run ? withHover(value, run) : value}</span>
      </div>
    )

    return (
      <div className="min-h-full bg-muted/30">
        <header className="border-b bg-card px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Win deals › <a className="hover:underline" href={href("/ollopa/deals")}>Deals</a> › {deal.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="t-section">{deal.name}</h2>
            {gear}
            <Place id="parody.actions" label="the actions row" className="ml-auto flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" data-item="timeline.email" data-item-label="Email all contacts"
                onClick={() => toast(`Email all ${contacts.length} contacts on this deal.`)}>Email all contacts</Button>
              <Button size="sm" variant="outline" data-item="tasks.create" data-item-label="Create task"
                onClick={() => toast(`Task created on ${deal.name}.`)}>Create task</Button>
              <Button size="sm" variant="outline" data-item="timeline.note" data-item-label="Create note"
                onClick={() => toast("Note created. Associate note to records.")}>Create note</Button>
              {bell}
              {overflow}
            </Place>
          </div>
        </header>

        <div className="grid gap-4 p-4 lg:grid-cols-[23rem_minmax(0,1fr)] lg:items-start">
          <Place id="parody.panel" label="the left widget panel" className="space-y-3">
            {widget("general", "General deal information", (
              <div>
                {row("Deal name", name, ask("Deal name", name, setName))}
                {row("Pipeline", <Thing id="deal.pipeline" label="Pipeline">{deal.pipeline}</Thing>)}
                {row("Stage", <Thing id="deal.stage" label="Stage">{stage}</Thing>, ask("Stage", stage, (v) => { if ((stages as { name: string }[]).some((x) => x.name === v)) moveStage(v as DealStage) }))}
                {row("Amount", <Thing id="deal.amount" label="Amount" className="tabular-nums">{money(amount, deal.currency)}</Thing>, ask("Amount", String(amount), (v) => setAmount(Number(v) || 0)))}
                {row("Currency", <Thing id="deal.currency" label="Currency">{deal.currency}</Thing>)}
                {row("Close date", <Thing id="deal.close-date" label="Close date" className="tabular-nums">{day(closeDate)}</Thing>, ask("Close date (YYYY-MM-DD)", closeDate, setCloseDate))}
                {row("Owner", <Thing id="deal.owner" label="Owner">{deal.owner}</Thing>)}
                {row("Next step", <Thing id="deal.next-step" label="Next step">{nextStep || "—"}</Thing>, ask("Next step", nextStep, setNextStep))}
                {row("Next step date", <Thing id="deal.next-step-date" label="Next step date">{nextStepDue ? day(nextStepDue) : "—"}</Thing>)}
                {row("Last activity", <Thing id="deal.last-activity" label="Last activity">{day(deal.lastActivity)}</Thing>)}
                <p className="border-t pt-2 text-xs">{stageSemantics}</p>
              </div>
            ))}

            {widget("details", "Record details", (
              <div>
                {customDefs.slice(0, 2).map((f) => (
                  <div key={f.id} className="flex items-baseline justify-between gap-3 border-t py-1 first:border-t-0">
                    <span className="text-xs text-muted-foreground">{f.label}</span>
                    <span className="text-sm">{fieldValue(deal.custom[f.label])}</span>
                  </div>
                ))}
                <button type="button" data-item="fields.all" data-item-label="See all fields"
                  className="mt-2 text-xs underline" onClick={() => { setParodyTab("all"); setGroup("Commercial") }}>
                  See all fields
                </button>
              </div>
            ))}

            {widget("account", "Account", (
              <dl data-item="company.card" data-item-label="Company summary" className="space-y-1 text-sm">
                <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Industry</dt><dd>{company?.industry ?? "—"}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Employees</dt><dd className="tabular-nums">{company?.employees?.toLocaleString() ?? "—"}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Owner</dt><dd>{company?.owner ?? "—"}</dd></div>
              </dl>
            ))}

            {widget("contacts", "Contacts", (
              <ul data-item="contacts.list" data-item-label="Contacts on the deal" className="space-y-1 text-sm">
                {contacts.map((c) => <li key={c.contactId}>{c.name} <span className="text-xs text-muted-foreground">· {c.title}</span></li>)}
                {contacts.length === 0 && <li className="text-muted-foreground">No contacts.</li>}
              </ul>
            ))}

            {widget("tasks", "Tasks", (
              <ul data-item="tasks.list" data-item-label="Open tasks" className="space-y-1 text-sm">
                {openTasks.map((t) => <li key={t.id}>{t.kind}: {t.contact} <span className="text-xs text-muted-foreground">· due {day(t.due)}</span></li>)}
                {openTasks.length === 0 && <li className="text-muted-foreground">No open tasks.</li>}
              </ul>
            ))}

            {/* Notes are a left widget and a right tab: two doors onto the same content (§5.2). */}
            {widget("notes", "Notes", (
              pinned
                ? <article data-item="timeline.pin" data-item-label="Pinned note" className="text-sm">
                    <p>{pinned.body}</p>
                    <p className="text-xs text-muted-foreground">{pinned.author} · {day(pinned.at)}</p>
                  </article>
                : <p className="text-sm text-muted-foreground">No notes.</p>
            ))}
          </Place>

          <section className="rounded-lg border bg-card">
            <Place id="parody.tabs" label="the tab strip" className="flex flex-wrap gap-1 border-b p-1">
              {tabStrip.map(([k, l]) => (
                <button key={k} type="button" onClick={() => setParodyTab(k as typeof parodyTab)}
                  className={cn("rounded-md px-3 py-1.5 text-xs", showingTab === k ? "bg-foreground text-background" : "hover:bg-muted")}>
                  {l}
                </button>
              ))}
            </Place>
            <div className="p-3">{tabBodies}</div>
          </section>
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------------------------------------- render */

  return (
    <>
      <RecordPage
        back={{ label: "Deals", href: href("/ollopa/deals") }}
        family="deals"
        title={{ value: name, onRename: canEdit ? (v) => { setName(v); log("field", `Name · ${v}`) } : undefined }}
        subtitle={company ? {
          label: deal.company,
          href: href(`/ollopa/companies/${company.id}`),
          onOpen: (opener) => openBeside({ kind: "company", id: company.id, opener }),
        } : undefined}
        chips={
          <span className="flex flex-wrap items-center gap-2">
            {gear}{bell}{overflow}
            {showType && <Badge variant="secondary">{deal.dealType}</Badge>}
            {handoff && (
              <span className="text-xs text-muted-foreground">
                Handed over by {handoff.author} · <a className="underline" href="#handoff" onClick={(e) => { e.preventDefault(); toast(handoff.body) }}>handoff brief</a>
              </span>
            )}
          </span>
        }
        ribbon={ribbon}
        fields={fields}
        actions={{ primary: [], secondary: [] }}
        /* The header, by kind (DESIGN.md §1). Logging is the one act this page exists for, so it is
           the only filled control. Winning, losing and deleting cannot be undone, so each asks once,
           with what it will do inside the question and the verb on the button that does it — and
           nothing is written on the page beside them. A seat that cannot act gets no control and one
           sentence naming who can. */
        headerActions={canEdit ? (
          <Actions
            surface="page"
            items={[
              { label: "Log activity", kind: "primary", keys: "C", onClick: () => composer.current?.querySelector("textarea")?.focus() },
              {
                label: "Mark won", kind: "secondary", keys: "W",
                onClick: () => { moveStage("Closed won"); toast("Deal won.") },
                irreversible: { title: `Close ${deal.name} as won?`, consequence: wonConsequence, confirmLabel: "Mark won" },
              },
              // The reason is required and a confirmation cannot collect one, so the panel that asks
              // for it is this act's confirmation: it carries the same sentence above the same verb.
              { label: "Mark lost and archive", kind: "secondary", keys: "Shift+W", onClick: () => setLostPanel(true) },
              ...(r7 ? [{
                label: "Delete deal", kind: "destructive" as const,
                onClick: () => { toast("Deal deleted. Undo is in the notification for 10 seconds."); navigate("/ollopa/deals") },
                irreversible: {
                  title: `Delete ${deal.name}?`,
                  consequence: `Removes this deal and its ${activities.length} activities. Contacts, the company and files stay on ${deal.company}.`,
                  confirmLabel: "Delete the deal",
                },
              }] : []),
            ]}
          />
        ) : (
          <span className="text-xs text-muted-foreground">
            Owned by {deal.owner}; only the owner or an admin can act on this deal.
          </span>
        )}
        /* The timeline is one container: the composer is the container-low band at its top, the
           events are rows with dividers between them, and the whole thing is a single enclosure
           rather than a box per event (DESIGN.md §5, containment). It is handed over whole so the
           band sits inside the container rather than beside it. */
        main={{
          kind: "timeline",
          items: (
            <Container component="section" heading="Activity" count={filtered.length} padded={false}>
              <Group className="px-4 pb-3">{composerBlock}</Group>
              <Divider />
              {timeline("px-4 pt-3 pb-1", "px-4 pb-3")}
              {residualTabs && <div className="px-4 pb-3">{residualTabs}</div>}
            </Container>
          ),
        }}
        side={cards}
        doors={doors}
        quickLook={{ fields: quickLookFields, editable: quickLookEditable }}
        shortcuts={!r8 ? undefined : [
          { keys: "S", label: "Move stage", run: () => (document.querySelector("[role=radiogroup] button") as HTMLButtonElement | null)?.focus() },
          { keys: "C", label: "Log a call", run: () => composer.current?.querySelector("textarea")?.focus() },
          { keys: "E", label: "Write an email", run: () => (composer.current?.querySelectorAll("[role=tab]")[1] as HTMLButtonElement | null)?.click() },
          { keys: "M", label: "Log a meeting", run: () => (composer.current?.querySelectorAll("[role=tab]")[2] as HTMLButtonElement | null)?.click() },
          { keys: "N", label: "Add a note", run: () => (composer.current?.querySelectorAll("[role=tab]")[3] as HTMLButtonElement | null)?.click() },
          { keys: "T", label: "Create a task", run: () => toast(`Task created on ${deal.name}, assigned to ${deal.owner}.`) },
          { keys: "W", label: "Mark won", run: () => toast(wonConsequence) },
          { keys: "Shift+W", label: "Mark lost and archive", run: () => setLostPanel(true) },
        ]}
      />

      {/* A reason is required, and the consequence is written before it is confirmed. */}
      <Panel id="deal-lost" title="Mark lost and archive" open={lostPanel} onOpenChange={setLostPanel}
        /* This panel is the act's confirmation: the reason it needs, the sentence saying what
           archiving does, and the verb on the button that does it (DESIGN.md §2). */
        footer={
          <Actions surface="dialog" layout="stack" items={[{
            label: "Archive as lost", kind: "primary",
            onClick: () => { setLost(true); setLostPanel(false); toast(lostConsequence) },
            disabledBecause: lostReason ? undefined : "Choose a reason above",
          }]} />
        }
      >
        <div className="space-y-3">
          <div>
            <Label htmlFor="lost-reason" className="text-xs">Reason</Label>
            <Select value={lostReason} onValueChange={setLostReason}>
              <SelectTrigger id="lost-reason" className="mt-1"><SelectValue placeholder="Why it was lost" /></SelectTrigger>
              <SelectContent>{["Price", "No decision", "Competitor", "Timing"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">{lostConsequence}</p>
        </div>
      </Panel>

    </>
  )
}
