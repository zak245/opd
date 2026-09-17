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
import { Bot, CalendarClock, CheckSquare, FileText, Mail, MessageSquare, Phone, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { href, navigate } from "@/app/router"
import { toast } from "../../templates/TablePage"
import { RecordPage, CardRow, type RecordCard, type RecordDoor, type RecordField } from "../../templates/RecordPage"
import { QuickLook, type QuickLookEditable, type QuickLookField } from "../../templates/QuickLook"
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

/* ------------------------------------------------------------------------------- small pieces */

const STATE_TONE: Record<string, string> = {
  suggested: "bg-muted text-muted-foreground",
  edited: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  validated: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200",
}

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

/** Every field an agent can write carries one. A value with no chip was typed by a person. */
function StateChip({ state }: { state: string }) {
  return <Badge variant="secondary" className={cn("px-1.5 py-0 text-[11px] font-normal", STATE_TONE[state])}>{state}</Badge>
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

  return (
    <div className="rounded-lg border p-3" data-composer>
      <div role="tablist" aria-label="Log activity" className="flex flex-wrap gap-1 pb-2">
        {tabs.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={cn("rounded-md px-2.5 py-1 text-xs", tab === t.key ? "bg-foreground text-background" : "hover:bg-muted")}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "email" && (
        <div className="grid gap-2 pb-2 sm:grid-cols-2">
          <label className="text-xs text-muted-foreground">
            To
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger className="mt-1 h-8" aria-label="Recipient"><SelectValue placeholder="A contact on this deal" /></SelectTrigger>
              <SelectContent>{contacts.map((c) => <SelectItem key={c.contactId} value={c.name}>{c.name} · {c.role}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          {/* The agent's draft sits beside the human's and is marked as a draft. Sending is the approval. */}
          <div className="rounded-md border bg-muted/40 p-2 text-xs">
            <div className="font-medium">The agent's draft <span className="font-normal text-muted-foreground">· draft, not sent</span></div>
            <p className="mt-1 text-muted-foreground">Thanks for the call — sending the security pack and the pricing we discussed. Shall I put 30 minutes in with your team next week?</p>
            <Button size="sm" variant="ghost" className="mt-1 h-6 px-1 text-xs"
              onClick={() => setBody("Thanks for the call — sending the security pack and the pricing we discussed. Shall I put 30 minutes in with your team next week?")}>
              Use this draft
            </Button>
          </div>
        </div>
      )}

      {tab === "comment" && (
        <label className="block pb-2 text-xs text-muted-foreground">
          For
          <Select value={mate} onValueChange={setMate}>
            <SelectTrigger className="mt-1 h-8 w-64" aria-label="Teammate"><SelectValue placeholder="A teammate" /></SelectTrigger>
            <SelectContent>{mates.map((m) => <SelectItem key={m.user} value={m.user}>{m.user} · {m.title}</SelectItem>)}</SelectContent>
          </Select>
        </label>
      )}

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
        {tab === "email" && <ConsequenceLine sends={1} to={to || "a contact"} from={mailbox} credits={CREDITS.draft} changes="Replies land in your Inbox" />}
        {tab === "comment" && <p className="text-xs text-muted-foreground">Lands on the timeline carrying “For {mate}”, and stays marked unanswered until they reply on it. It is not a notification.</p>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------ the page */

export function DealRecord({ session, dealId }: { session: Session; dealId?: string }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const disclosure = useDisclosure("deal")

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
  const [glance, setGlance] = useState<{ name: string; fields: QuickLookField[]; id: string } | null>(null)
  const [extra, setExtra] = useState<DealActivity[]>([])
  const composer = useRef<HTMLDivElement>(null)
  const [, setEvidenceDoor] = useDoorState("deal.evidence")

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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.metaKey || e.ctrlKey || t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return
      if (e.key.toLowerCase() === "g") { setChord(true); return }
      if (chord && e.key.toLowerCase() === "h") { setChord(false); setHistoryDoor(true); return }
      setChord(false)
      if (e.key === "Escape" && !document.querySelector("[role=dialog]")) navigate("/ollopa/deals")
      const forward = e.key === "]"
      const back = e.key === "["
      if (forward || back) {
        const list = seedFor(session.business).deals
        const at = list.findIndex((d) => d.id === (dealId ?? list[0]?.id))
        const to = forward ? Math.min(at + 1, list.length - 1) : Math.max(at - 1, 0)
        const next = list[to]
        if (next) navigate(`/ollopa/deals/${next.id}`)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [chord, dealId, session.business, setHistoryDoor])

  if (!deal) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h2 className="text-lg font-semibold">This deal was deleted or moved.</h2>
        <p className="mt-2"><a className="text-sm underline" href={href("/ollopa/deals")}>Back to Deals</a></p>
      </div>
    )
  }

  /* ------------------------------------------------------------------ what this deal is made of */

  const isOwner = deal.owner === session.user
  const canEdit = isOwner || session.role === "admin"
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
    `${openTasks.length} open task${openTasks.length === 1 ? "" : "s"} close.`,
    crm ? `${crm.name} is updated.` : null,
    csSeat ? `${deal.company} moves to customer success, and the hand-off arrives in ${csSeat.user}'s queue.` : null,
  ].filter(Boolean).join(" ")

  const lostConsequence = `Archived as lost. The deal leaves the board and the forecast, its ${openTasks.length} open task${openTasks.length === 1 ? "" : "s"} close, and it stays on ${deal.company} and in Reports.`

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
    <div className="space-y-2">
      {/* A radiogroup: one tab stop, arrow keys between the steps, and the gate spoken on the step. */}
      <div role="radiogroup" aria-label="Stage" className="flex flex-wrap gap-1">
        {stages.map((s) => {
          const index = stages.findIndex((x) => x.name === stage)
          const at = stages.findIndex((x) => x.name === s.name)
          const missing = missingFor(s.name)
          return (
            <button
              key={s.name}
              role="radio"
              aria-checked={s.name === stage}
              aria-describedby={missing.length ? "stage-gate" : undefined}
              tabIndex={s.name === stage ? 0 : -1}
              onKeyDown={(e) => {
                const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
                if (!step) return
                e.preventDefault()
                const to = stages[(at + step + stages.length) % stages.length]
                const el = e.currentTarget.parentElement?.children[stages.indexOf(to)] as HTMLButtonElement | undefined
                el?.focus()
                if (canEdit && missingFor(to.name).length === 0) moveStage(to.name)
              }}
              disabled={!canEdit}
              onClick={() => (missing.length ? toast(`${s.name} needs ${missing.join(" and ")}.`) : moveStage(s.name))}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                at <= index ? "bg-foreground text-background" : "bg-background hover:bg-muted",
                missing.length > 0 && "border-amber-400 dark:border-amber-700",
              )}
            >
              {s.name}
            </button>
          )
        })}
      </div>
      {/* The gate is on the step before the click, not after it: a rule met only afterwards is hidden. */}
      {stages.filter((s) => missingFor(s.name).length > 0).slice(0, 1).map((s) => (
        <p key={s.name} id="stage-gate" className="text-xs text-amber-700 dark:text-amber-400">
          {s.name} needs {missingFor(s.name).join(" and ")}. Set by {admin?.user ?? "your admin"} in{" "}
          <a className="underline" href={href("/ollopa/settings")}>Settings › Pipeline and data</a>.
        </p>
      ))}
    </div>
  )

  /* -------------------------------------------------------------------------------- the fields */

  const fields: RecordField[] = [
    {
      key: "stage", label: "Stage", wide: true, editor: "stepper", value: stepper,
      // Probability and forecast never leave the stage: they change together and are read together.
      under: (
        <span className="flex flex-wrap items-center gap-x-3">
          <span>Probability <span className="tabular-nums text-foreground">{probability}%</span></span>
          <span>
            Forecast category{" "}
            {canEdit ? (
              <Select value={forecast} onValueChange={(v) => { setForecast(v as ForecastCategory); log("field", `Forecast category · ${forecast} → ${v}`) }}>
                <SelectTrigger className="ml-1 inline-flex h-6 w-auto gap-1 border-none px-1 py-0 text-xs shadow-none" aria-label="Forecast category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Pipeline", "Best case", "Commit", "Closed", "Omitted"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : <span className="text-foreground">{forecast}</span>}
          </span>
        </span>
      ),
    },
    {
      key: "amount", label: "Amount", editor: "money",
      value: <span className="tabular-nums">{money(amount, deal.currency)}</span>,
      edit: canEdit ? { value: String(amount), onSave: (v) => { setAmount(Number(v) || 0); log("field", `Amount · ${money(amount, deal.currency)} → ${money(Number(v) || 0, deal.currency)}`) } } : undefined,
      under: b.id === "meridian" ? <>Currency {deal.currency}</> : undefined,
    },
    {
      key: "close", label: "Close date", editor: "date",
      value: <span className="tabular-nums">{day(closeDate)}</span>,
      under: <>{closeDate < TODAY ? "passed" : `in ${daysBetween(TODAY, closeDate)} days`}</>,
      edit: canEdit ? { value: closeDate, onSave: (v) => { setCloseDate(v); log("field", `Close date · ${day(closeDate)} → ${day(v)}`) } } : undefined,
    },
    {
      key: "next-step", label: "Next step", span: 2, editor: "text",
      tone: nextStep ? undefined : "warning",
      // The next step and its date are one line. A deal with no next step is not being worked.
      value: nextStep
        ? <span>{nextStep} <span className="text-muted-foreground">· {nextStepDue ? `${day(nextStepDue)} (${ago(nextStepDue)})` : "no date"}</span></span>
        : <span>No next step</span>,
      edit: canEdit ? { value: nextStep, onSave: (v) => { setNextStep(v); log("field", `Next step · ${v || "cleared"}`) } } : undefined,
      under: canEdit && nextStep ? (
        <label className="inline-flex items-center gap-2">
          Due
          <Input type="date" aria-label="Next step date" value={nextStepDue} className="h-6 w-36 px-1 py-0 text-xs"
            onChange={(e) => { setNextStepDue(e.target.value); log("field", `Next step date · ${day(e.target.value)}`) }} />
        </label>
      ) : undefined,
    },
    { key: "owner", label: "Owner", editor: "user", value: deal.owner, under: isOwner ? "you" : undefined },
    { key: "last-activity", label: "Last activity", value: <span>{day(deal.lastActivity)} <span className="text-muted-foreground">· {ago(deal.lastActivity)}</span></span> },
    ...(seed.pipelines.length > 1 ? [{ key: "pipeline", label: "Pipeline", value: deal.pipeline } as RecordField] : []),

    // The warning chips: each prints its observed number against the workspace's threshold.
    ...(warnings.length
      ? [{
          key: "warnings", label: "Warnings", wide: true,
          value: (
            <div className="flex flex-wrap gap-1.5">
              {warnings.map((w) => (
                <span key={w.kind} className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
                  {w.kind} · {readable(w.observed)} against {readable(w.threshold)}
                </span>
              ))}
            </div>
          ),
        } as RecordField]
      : []),

    // Custom fields sit in the header where the seat works in them, and behind a door where it does not.
    ...(customInHeader
      ? customDefs.map((f) => ({ key: f.id, label: f.label, value: fieldValue(deal.custom[f.label]), group: f.group } as RecordField))
      : []),

    // Level two: the tail every deal record accumulates. The template puts these in the All fields door.
    ...([
      ...(showType ? [] : [{ key: "type", label: "Deal type", value: deal.dealType }]),
      { key: "created", label: "Created", value: `${day(deal.createdAt)} · ${daysBetween(deal.createdAt)} days old` },
      { key: "source", label: "Lead source", value: deal.source },
      { key: "campaign", label: "Campaign", value: deal.campaign ?? "—" },
      { key: "competitor", label: "Competitor", value: deal.competitor ?? "—" },
      { key: "term", label: "Contract term", value: deal.contractTerm },
      { key: "payment", label: "Payment terms", value: deal.paymentTerms },
      { key: "discount", label: "Discount", value: `${deal.discount}%` },
      { key: "proposal", label: "Proposal link", value: deal.proposalLink ?? "—" },
      { key: "esign", label: "Signature status", value: deal.esign },
      { key: "split", label: "Split owners", value: deal.splitOwners.join(", ") || "—" },
      { key: "tags", label: "Tags", value: deal.tags.join(", ") || "—" },
      { key: "priority", label: "Priority", value: deal.priority },
      { key: "weighted", label: "Weighted amount", value: money(Math.round(amount * probability) / 100, deal.currency) },
      { key: "line-items", label: "Line items", value: deal.lineItems.map((l) => `${l.name} × ${l.qty}`).join(", ") || "—" },
      ...(hasCrm ? [{ key: "crm-id", label: "CRM record id", value: deal.crmId ?? "—" }] : []),
      ...(customInHeader ? [] : []),
    ].map((f) => ({ ...f, level: 2 }) as RecordField)),
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
    <div className="space-y-4">
      {groups.map((g) => (
        <section key={g.day}>
          <h3 className="sticky top-0 z-10 bg-background py-1 text-xs font-medium text-muted-foreground">{g.day}</h3>
          <div className="space-y-2">
            {g.items.map((a) => {
              const Icon = KIND_ICON[a.kind]
              return (
                <article key={a.id} className="flex gap-2.5 rounded-md border p-2.5">
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
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )

  /* ----------------------------------------------------------------------------- the side cards */

  const cards: RecordCard[] = []

  // The agent proposal, while one exists: object state, never a list that lingers.
  if (proposal && proposalOpen) {
    const q = evidence[0]
    cards.push({
      id: "proposal", title: "Agent proposal", tone: "attention",
      children: (
        <div className="space-y-2 text-sm">
          <div className="text-xs text-muted-foreground">{proposal.agent} · {day(proposal.at)}</div>
          <div className="font-medium">Stage · {stage} → {stages[Math.min(stages.findIndex((s) => s.name === stage) + 1, stages.length - 1)]?.name}</div>
          {q && <blockquote className="border-l-2 pl-2 text-xs text-muted-foreground">{quoted(q.quote)} — {q.sourceKind}, {day(q.at)}</blockquote>}
          <StateChip state="suggested" />
          <p className="text-xs">
            {`Stage becomes ${stages[Math.min(stages.findIndex((s) => s.name === stage) + 1, stages.length - 1)]?.name}. `}
            {`Probability ${probability}% → ${STAGE_PROBABILITY[stages[Math.min(stages.findIndex((s) => s.name === stage) + 1, stages.length - 1)]?.name ?? stage]}%, `}
            {`forecast category ${forecast} → ${STAGE_FORECAST[stages[Math.min(stages.findIndex((s) => s.name === stage) + 1, stages.length - 1)]?.name ?? stage]}. `}
            {crm ? `${crm.name} is updated. ` : ""}{proposal.credits} credits.
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => { moveStage(stages[Math.min(stages.findIndex((s) => s.name === stage) + 1, stages.length - 1)].name); setProposalOpen(false) }}>Approve</Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => { setProposalOpen(false); toast("Proposal dismissed. It leaves the agent queue too.") }}>Dismiss</Button>
          </div>
          <p className="text-xs">
            <button type="button" className="underline" onClick={() => setEvidenceDoor(true)}>Open the full evidence</button>
          </p>
        </div>
      ),
    })
  }

  // Qualification: the AE's weekly work. A human validates; the model proposes; the quote sits beside it.
  const qualCard = (
    <div className="space-y-1">
      {QUAL_ELEMENTS.map((element) => {
        const v = qual?.[element]
        const quote = evidence.find((e) => e.element === element)
        return (
          <div key={element} className="border-t py-2 first:border-t-0">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-xs font-medium">{element}</span>
              <span className="min-w-0 flex-1 text-sm">{v?.value || <span className="text-muted-foreground">Not answered yet</span>}</span>
              {v?.value && <StateChip state={v.state} />}
            </div>
            {v?.value && (
              <p className="text-xs text-muted-foreground">
                {v.state === "validated" ? `Validated by ${v.updatedBy}` : v.state === "edited" ? `Edited by ${v.updatedBy}` : v.source} · {day(v.at)}
              </p>
            )}
            {/* The words the buyer used, beside the value: a model's answer is checkable only with the quote. */}
            {quote && <blockquote className="mt-1 border-l-2 pl-2 text-xs text-muted-foreground">{quoted(quote.quote)}</blockquote>}
            {v?.value && v.state !== "validated" && canEdit && (
              <div className="flex gap-1 pt-1">
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => {
                  setQual((prev) => prev && ({ ...prev, [element]: { ...prev[element], state: "validated", updatedBy: session.user, at: TODAY } }))
                  toast(`${element} validated. Nothing generated overwrites it now.`)
                }}>Validate</Button>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => {
                  const next = window.prompt(`${element}`, v.value)
                  if (next === null) return
                  setQual((prev) => prev && ({ ...prev, [element]: { ...prev[element], value: next, state: "edited", updatedBy: session.user, at: TODAY } }))
                }}>Edit</Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  if (qualIsCard && used("qual.card")) {
    cards.push({
      id: "qualification",
      title: "Qualification",
      subtitle: `${answered} of 8 answered · ${toValidate} to validate`,
      children: answered === 0
        ? <EmptyState title="Nothing answered yet" body="The prep brief lists what the next call should establish." />
        : qualCard,
    })
  }

  if (meeting && used("meeting.card")) {
    const gaps = 8 - answered
    cards.push({
      id: "meeting", title: "The meeting",
      children: (
        <div className="space-y-2 text-sm">
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
            <div className="rounded-md border p-2">
              <div className="text-xs font-medium">Action items</div>
              <ul className="list-disc pl-4 text-xs text-muted-foreground">{meeting.actionItems.map((i) => <li key={i}>{i}</li>)}</ul>
              <Button size="sm" className="mt-2 h-7 text-xs" onClick={() => toast(`${meeting.actionItems.length} tasks created.`)}>
                Create {meeting.actionItems.length} tasks
              </Button>
            </div>
          )}
        </div>
      ),
    })
  }

  // "Contacts · 5 · 2 have replied": five names where one has answered is not five relationships.
  cards.push({
    id: "contacts", title: "Contacts", count: contacts.length,
    subtitle: `${contacts.filter((c) => c.engaged).length} have replied`,
    action: canEdit ? <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast("Search people at this company, then set a role.")}>Add</Button> : undefined,
    children: contacts.length === 0
      ? <EmptyState title="No contacts on this deal yet" body="Add the people you are talking to, and say what each of them is." />
      : (
        <div>
          {contacts.map((c) => {
            const person = seed.contacts.find((p) => p.id === c.contactId)
            return (
              <CardRow
                key={c.contactId}
                title={<button className="text-left hover:underline" onClick={(e) => { e.currentTarget.focus(); setGlance({
                  id: c.contactId, name: c.name,
                  // Same labels, same order as the top of the contact record (spec 09 §6.8).
                  fields: [
                    { label: "Name", value: c.name },
                    { label: "Title", value: c.title },
                    { label: "Company", value: deal.company },
                    { label: "Email", value: person ? <span className="font-mono text-xs">{person.email} · {person.emailStatus}</span> : "—" },
                    { label: "Phone", value: person?.phone ? "On file" : "—" },
                    { label: "Role on this deal", value: c.role },
                  ],
                }) }}>{c.name}</button>}
                meta={<>{c.title} · {c.role} · {c.engaged ? "has replied" : "never replied"}</>}
                actions={canEdit ? [
                  { label: "Email", onClick: () => toast(`Email ${c.name} from the composer.`) },
                  { label: "Set role", onClick: () => toast(`Role for ${c.name}: Champion, Economic buyer, Technical, User, Blocker, Other.`) },
                  { label: "Remove from deal", destructive: true, onClick: () => toast(`${c.name} removed from the deal. The contact record stays.`) },
                ] : undefined}
              />
            )
          })}
        </div>
      ),
  })

  cards.push({
    id: "tasks", title: "Open tasks", count: openTasks.length,
    action: canEdit ? <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast(`Task created on ${deal.name}, assigned to ${deal.owner}.`)}>Create</Button> : undefined,
    children: openTasks.length === 0
      ? <EmptyState title="No open tasks" body="Create one and it appears on the Tasks page too." />
      : <div>{openTasks.slice(0, 5).map((t) => (
          <CardRow key={t.id} title={`${t.kind}: ${t.contact}`} meta={`due ${day(t.due)}`}
            actions={[{ label: "Mark done", onClick: () => toast(`${t.kind} for ${t.contact} done.`) }]} />
        ))}</div>,
  })

  cards.push({
    id: "company", title: "Company",
    action: <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => navigate(`/ollopa/companies/${company?.id ?? ""}`)}>Open</Button>,
    children: (
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Industry</dt><dd>{company?.industry ?? "—"}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Employees</dt><dd className="tabular-nums">{company?.employees?.toLocaleString() ?? "—"}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Stage</dt><dd>{company?.stage ?? "—"}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Owner</dt><dd>{company?.owner ?? "—"}</dd></div>
        {relatedIsCard && (
          <div className="border-t pt-1">
            <dt className="text-muted-foreground">Other deals here</dt>
            {otherDeals.map((d) => (
              <dd key={d.id}><a className="hover:underline" href={href(`/ollopa/deals/${d.id}`)}>{d.name} · {money(d.amount, d.currency)} · {d.stage}</a></dd>
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
        <div className="space-y-1 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tabular-nums">{account.health}</span>
            <Badge variant="secondary">{account.band}</Badge>
            <a className="ml-auto text-xs underline" href={href(`/ollopa/accounts/${account.id}`)}>Open the account</a>
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
      children: <div>{account.signals.slice(0, 4).map((s) => <CardRow key={s.id} title={s.kind} meta={`${s.detail} · ${day(s.fired)}`} />)}</div>,
    })
  }

  /* --------------------------------------------------------------------------------- the doors */

  const doors: RecordDoor[] = []

  if (used("qual.evidence")) doors.push({
    id: "deal.evidence", label: "Evidence and source quotes", count: evidence.length,
    content: evidence.length === 0
      ? <p className="text-muted-foreground">No conversation has been recorded against this deal yet.</p>
      : <ul className="space-y-2">{evidence.map((e) => (
          <li key={e.id}><div className="text-xs font-medium">{e.element}</div><blockquote className="border-l-2 pl-2 text-xs text-muted-foreground">{quoted(e.quote)}</blockquote><div className="text-[11px] text-muted-foreground">{e.sourceKind} · {day(e.at)}</div></li>
        ))}</ul>,
  })

  if (!qualIsCard && answered > 0 && used("qual.card")) {
    doors.push({ id: "deal.qualification", label: "Qualification", count: 8, content: qualCard })
  }

  if (!customInHeader && customDefs.length > 0) {
    doors.push({
      id: "deal.custom", label: "Custom fields", count: customDefs.length,
      content: (
        <dl className="grid grid-cols-[10rem_1fr] gap-x-4 gap-y-1.5">
          {customDefs.map((f) => (
            <div key={f.id} className="contents">
              <dt className="text-xs text-muted-foreground">{f.label}</dt>
              <dd>{fieldValue(deal.custom[f.label])}</dd>
            </div>
          ))}
        </dl>
      ),
    })
  }

  doors.push({
    id: "deal.history", label: "History", count: history.length, openByDefault: historyOpen,
    content: history.length === 0
      ? <p className="text-muted-foreground">No stage changes yet.</p>
      : <ul className="space-y-1">{history.map((h) => <li key={h.stage + h.enteredOn} className="flex justify-between gap-2"><span>{h.stage}</span><span className="tabular-nums text-muted-foreground">{day(h.enteredOn)}</span></li>)}</ul>,
  })

  doors.push({
    id: "deal.files", label: "Files and the proposal", count: files.length,
    content: files.length === 0
      ? <EmptyState title="No files yet" body="Drop the proposal or the security pack here and it stays with the deal." />
      : <ul className="space-y-1">{files.map((f) => <li key={f.id} className="flex justify-between gap-2"><span>{f.name}</span><span className="text-xs text-muted-foreground">{Math.round(f.size / 1024)} KB · {f.uploadedBy}</span></li>)}</ul>,
  })

  if (!signalsIsCard) {
    doors.push({
      id: "deal.signals", label: "Signals and news", count: account?.signals.length || undefined, container: "drawer",
      content: (
        <div className="space-y-3">
          <Button size="sm" onClick={() => toast(`Enriching ${deal.company}. ${CREDITS.enrich} credits.`)}>Enrich · {CREDITS.enrich} credits</Button>
          {(account?.signals ?? []).length === 0
            ? <p className="text-muted-foreground">Nothing has fired for {deal.company} yet.</p>
            : <ul className="space-y-2">{(account?.signals ?? []).map((s) => (
                <li key={s.id}><div className="font-medium">{s.kind}</div><div className="text-xs text-muted-foreground">{s.detail} · {s.source} · {day(s.fired)}</div></li>
              ))}</ul>}
        </div>
      ),
    })
  }

  if (hasCrm) {
    const runs = seed.syncRuns.slice(0, 10)
    doors.push({
      id: "deal.sync", label: `Sync history · last ${Math.min(runs.length, 10)}`,
      content: (
        <ul className="space-y-1 text-xs">
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

  /* ------------------------------------------------------------------------------------- render */

  return (
    <>
      <RecordPage
        back={{ label: "Deals", href: href("/ollopa/deals") }}
        title={{ value: name, onRename: canEdit ? (v) => { setName(v); log("field", `Name · ${v}`) } : undefined }}
        subtitle={company ? { label: deal.company, href: href(`/ollopa/companies/${company.id}`) } : undefined}
        chips={
          <span className="flex flex-wrap items-center gap-2">
            {showType && <Badge variant="secondary">{deal.dealType}</Badge>}
            {!isOwner && <span className="text-xs text-muted-foreground">{deal.owner} owns this deal — you can read it and comment</span>}
            {handoff && (
              <span className="text-xs text-muted-foreground">
                Handed over by {handoff.author} · <a className="underline" href="#handoff" onClick={(e) => { e.preventDefault(); toast(handoff.body) }}>handoff brief</a>
              </span>
            )}
          </span>
        }
        ribbon={ribbon}
        fields={fields}
        actions={{
          primary: canEdit ? [
            { label: "Log activity", onClick: () => composer.current?.querySelector("textarea")?.focus(), shortcut: "C" },
            { label: "Mark won", onClick: () => { moveStage("Closed won"); toast("Deal won.") }, confirm: wonConsequence, shortcut: "W" },
          ] : [],
          secondary: canEdit ? [
            { label: "Mark lost and archive", onClick: () => setLostPanel(true), shortcut: "Shift+W" },
          ] : [],
          destructive: canEdit ? {
            label: "Delete deal",
            consequence: `Removes this deal and its ${activities.length} activities. Contacts, the company and files stay on ${deal.company}.`,
            onConfirm: () => { toast("Deal deleted. Undo is in the notification for 10 seconds."); navigate("/ollopa/deals") },
          } : undefined,
        }}
        main={{
          kind: "timeline",
          composer: (
            <div ref={composer}>
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
          ),
          filters: FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} aria-pressed={filter === f.key}
              className={cn("rounded-full border px-2.5 py-0.5 text-xs", filter === f.key ? "bg-foreground text-background" : "hover:bg-muted")}>
              {f.label}
            </button>
          )),
          pinned: pinned ? (
            <article className="mb-3 rounded-md border border-dashed p-2.5">
              <div className="text-xs font-medium text-muted-foreground">Pinned note</div>
              <p className="text-sm">{pinned.body}</p>
              <div className="text-xs text-muted-foreground">{pinned.author} · {day(pinned.at)}</div>
            </article>
          ) : undefined,
          items: timelineItems,
          footer: filtered.length > shown ? (
            <div className="flex justify-center pt-3">
              <Button variant="outline" size="sm" onClick={() => setShown((n) => n + 12)}>Load older</Button>
            </div>
          ) : undefined,
        }}
        side={cards}
        doors={doors}
        quickLook={{ fields: quickLookFields, editable: quickLookEditable }}
        shortcuts={[
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
        footer={
          <Button className="w-full" disabled={!lostReason} onClick={() => { setLost(true); setLostPanel(false); toast(lostConsequence) }}>
            Archive as lost
          </Button>
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

      {/* The contact quick look from a related row: the top of the contact record, cut short and flat. */}
      {glance && (
        <QuickLook
          open
          onOpenChange={(o) => { if (!o) setGlance(null) }}
          title={glance.name}
          fields={glance.fields}
          onOpen={() => { const id = glance.id; setGlance(null); navigate(`/ollopa/people/${id}`) }}
        />
      )}
    </>
  )
}
