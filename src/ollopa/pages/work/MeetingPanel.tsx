// X-meeting — the meeting: propose or book, attendees, status, prep, follow-up, the hand-off.
//
// Specified once in specs/06-inbox.md §3, "Book and run the meeting", and owned by the Inbox for the
// whole product: Tasks renders it from a meeting task row and the deal record from the meeting card,
// and all three open this component with the same blocks in the same order.
//
// It is flat — one level, no doors inside it — so it is level two wherever it opens. ollopA does not
// own the booking page; the calendar does. The boundary is the meeting object and its events.
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { follow } from "../../chain"
import { Panel } from "../../ui/Panel"
import { ConsequenceLine } from "../../ui/ConsequenceLine"
import { seedFor, QUAL_ELEMENTS, TODAY, type Meeting } from "../../data/seed"
import type { Session } from "../../session"
import { originHere } from "./acts"
import { day } from "./format"
import {
  aeSeats, briefById, calendarOf, contactIndex, dealFor, handoffRecord, hasTranscripts,
  mailboxOf, qualificationGaps,
} from "./data"

export type MeetingState = "proposed" | "booked" | "held" | "no-show" | "cancelled"

export interface MeetingPanelProps {
  session: Session
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId: string
  contactName: string
  company: string
  /** The meeting object, where one exists. Null means nothing has been proposed yet. */
  meeting: Meeting | null
  dealId?: string | null
  /** The sequence this person is in, named on the no-show control. */
  sequence?: string | null
  say: (message: string, undo?: () => void) => void
}

const OUTCOMES: { key: MeetingState; label: string }[] = [
  { key: "booked", label: "Booked" },
  { key: "held", label: "Held" },
  { key: "no-show", label: "No-show" },
  { key: "cancelled", label: "Cancelled" },
]

const HANDOFF_FIELDS = [
  { key: "problem", label: "The problem, in their words" },
  { key: "why", label: "Why now" },
  { key: "who", label: "Who is involved" },
  { key: "success", label: "What success looks like" },
] as const
type HandoffKey = (typeof HANDOFF_FIELDS)[number]["key"]

const DEAL_ROLES = ["Champion", "Economic buyer", "Technical", "User", "Blocker", "Other"] as const

/** Two or three times from the connected calendar, in the workspace's working hours. */
function offeredTimes(): { iso: string; label: string }[] {
  const base = Date.parse(TODAY + "T00:00:00Z")
  return [
    { at: 1, hour: "14:00" },
    { at: 2, hour: "10:30" },
    { at: 3, hour: "15:00" },
  ].map(({ at, hour }) => {
    const d = new Date(base + at * 86_400_000)
    const wd = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getUTCDay()]
    return { iso: d.toISOString().slice(0, 10), label: `${wd} ${hour}` }
  })
}

export function MeetingPanel(p: MeetingPanelProps) {
  const seed = seedFor(p.session.business)
  const contact = contactIndex(p.session.business)(p.contactId)
  const calendar = calendarOf(p.session.business)
  const aes = aeSeats(p.session.business)
  const deal = dealFor(p.session.business, p.dealId ?? p.meeting?.dealId ?? null)
  const brief = briefById(p.session.business, p.meeting?.prepBriefId ?? null)
  const record = handoffRecord(p.session)
  const times = useMemo(offeredTimes, [])

  const [state, setState] = useState<MeetingState>((p.meeting?.state as MeetingState) ?? "proposed")
  const [setBy, setSetBy] = useState<string | null>(p.meeting ? p.meeting.host : null)
  const [at, setAt] = useState<string | null>(p.meeting?.at ?? null)
  const [attendees, setAttendees] = useState<{ name: string; title: string; role: string }[]>(() =>
    (p.meeting?.attendees ?? [p.contactName]).map((name) => {
      const c = seed.contacts.find((x) => x.name === name)
      const on = deal ? seed.dealContacts.find((d) => d.dealId === deal.id && d.name === name) : undefined
      return { name, title: c?.title ?? "—", role: on?.role ?? "Other" }
    }),
  )
  const [adding, setAdding] = useState("")
  const [summary, setSummary] = useState(p.meeting?.summary ?? "")
  const [items, setItems] = useState<{ text: string; done: boolean }[]>(() => (p.meeting?.actionItems ?? []).map((text) => ({ text, done: false })))
  const [followUp, setFollowUp] = useState(p.meeting?.followUpDraft ?? "")
  const [followUpEdited, setFollowUpEdited] = useState(false)
  const [handoff, setHandoff] = useState<Record<HandoffKey, string>>({
    problem: "“We lose a day a week keeping the pipeline honest, and the board does not trust the forecast.”",
    why: "“Our renewal is in March and the CRO wants the number to mean something before then.”",
    who: `${p.contactName} runs the evaluation; their operations lead signs; security can block it.`,
    success: "“One number the manager can edit and the board believes, inside a quarter.”",
  })
  const [edited, setEdited] = useState<Record<HandoffKey, boolean>>({ problem: false, why: false, who: false, success: false })
  const [checks, setChecks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(QUAL_ELEMENTS.map((e) => [e, deal ? Boolean(deal.qualification[e]?.value) : false])),
  )
  const [assignTo, setAssignTo] = useState(aes[0]?.user ?? p.session.user)

  const mailbox = mailboxOf(p.session)
  const stamp = `${day(TODAY)} 14:20`

  function mark(next: MeetingState) {
    const before = { state, by: setBy }
    setState(next)
    setSetBy(p.session.user)
    p.say(`Meeting with ${p.contactName} marked ${OUTCOMES.find((o) => o.key === next)?.label.toLowerCase()}.`, () => {
      setState(before.state)
      setSetBy(before.by)
    })
  }

  return (
    <Panel
      id="x-meeting"
      title={`Meeting with ${p.contactName} · ${p.company}`}
      open={p.open}
      onOpenChange={p.onOpenChange}
    >
      <div className="space-y-5">
        {/* ---------------------------------------------------------------- state and its author */}
        <section>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Where it stands</h3>
          <p className="pt-1">
            <span className="font-medium capitalize">{state === "no-show" ? "No-show" : state}</span>
            {setBy ? <span className="text-muted-foreground"> · set by {setBy} · {stamp}</span> : <span className="text-muted-foreground"> · nobody has marked this yet</span>}
            {at && <span className="text-muted-foreground"> · {day(at.slice(0, 10))} {at.slice(11, 16)}</span>}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {OUTCOMES.map((o) => (
              <Button key={o.key} size="sm" variant={state === o.key ? "default" : "outline"} onClick={() => mark(o.key)}>{o.label}</Button>
            ))}
          </div>
          <p className="pt-1.5 text-xs text-muted-foreground">A person marks the outcome. ollopA never reads it from the calendar's silence.</p>
        </section>

        {/* -------------------------------------------------------------------------- the times */}
        <section>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Times</h3>
          {calendar ? (
            <>
              <div className="flex flex-wrap gap-2 pt-2">
                {times.map((t) => (
                  <Button key={t.iso} size="sm" variant="outline" onClick={() => {
                    setAt(`${t.iso} ${t.label.split(" ")[1]}`)
                    setState("booked")
                    setSetBy(p.session.user)
                    p.say(`${t.label} offered to ${p.contactName} from ${mailbox}.`)
                  }}>{t.label}</Button>
                ))}
              </div>
              <Button size="sm" variant="ghost" className="mt-2 px-2 text-xs" onClick={() => p.say(`Your calendar link sent to ${p.contactName} from ${mailbox}. The booking happens in ${calendar.name}.`)}>
                Send the calendar link instead
              </Button>
              <p className="pt-1 text-xs text-muted-foreground">Times come from {calendar.name}. The booking page is the calendar's, not ollopA's.</p>
            </>
          ) : (
            <p className="pt-1 text-sm">
              <button type="button" className="underline underline-offset-4"
                      onClick={() => follow("/ollopa/settings/integrations", originHere(p.contactId))}>
                Connect a calendar to book from here
              </button>
            </p>
          )}
        </section>

        {/* ---------------------------------------------------------------------- the attendees */}
        <section>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Attendees</h3>
          <ul className="divide-y pt-1">
            {attendees.map((a) => (
              <li key={a.name} className="flex flex-wrap items-center gap-2 py-1.5">
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{a.name}</span>
                  <span className="text-muted-foreground"> · {a.title}</span>
                </span>
                {deal && (
                  <Select value={a.role} onValueChange={(v) => setAttendees((list) => list.map((x) => (x.name === a.name ? { ...x, role: v } : x)))}>
                    <SelectTrigger className="h-7 w-40 text-xs" aria-label={`Role on the deal for ${a.name}`}><SelectValue /></SelectTrigger>
                    <SelectContent>{DEAL_ROLES.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                  </Select>
                )}
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => {
                  const before = attendees
                  setAttendees((list) => list.filter((x) => x.name !== a.name))
                  p.say(`${a.name} removed from the meeting.`, () => setAttendees(before))
                }}>Remove</Button>
              </li>
            ))}
          </ul>
          <form className="flex gap-2 pt-2" onSubmit={(e) => {
            e.preventDefault()
            const name = adding.trim()
            if (!name) return
            const c = seed.contacts.find((x) => x.name.toLowerCase() === name.toLowerCase())
            setAttendees((list) => [...list, { name: c?.name ?? name, title: c?.title ?? "—", role: "Other" }])
            setAdding("")
            p.say(`${c?.name ?? name} added to the meeting.`)
          }}>
            <Input aria-label="Add an attendee" placeholder="Add someone by name" value={adding} onChange={(e) => setAdding(e.target.value)} className="h-8" />
            <Button size="sm" type="submit" variant="outline">Add</Button>
          </form>
        </section>

        {/* ------------------------------------------------------------------- before the call */}
        <section>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Before the call</h3>
          {brief ? (
            <p className="pt-1">
              <button type="button" className="underline underline-offset-4"
                      onClick={() => follow(`/ollopa/briefs/${brief.id}`, originHere(p.contactId))}>
                The prep brief
              </button>
              {deal && <span className="text-muted-foreground"> · Qualification · {qualificationGaps(p.session.business, deal.id)} to answer</span>}
            </p>
          ) : (
            <Button size="sm" variant="outline" className="mt-1" onClick={() => p.say(`Hand-off brief started for ${p.contactName}.`)}>Write the handoff brief</Button>
          )}
        </section>

        {/* -------------------------------------------------------------------- after the call */}
        {(state === "held" || summary) && (
          <section className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">After the call</h3>
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="mtg-summary">Summary <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[11px] font-normal">Agent draft</Badge></label>
              <Textarea id="mtg-summary" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} className="mt-1" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Action items</div>
              <ul className="pt-1">
                {items.map((it, i) => (
                  <li key={it.text} className="flex items-start gap-2 py-0.5">
                    <Checkbox id={`ai-${i}`} checked={it.done} onCheckedChange={(v) => setItems((l) => l.map((x, k) => (k === i ? { ...x, done: v === true } : x)))} />
                    <label htmlFor={`ai-${i}`} className="text-sm">{it.text}</label>
                  </li>
                ))}
              </ul>
              {items.length > 0 && (
                <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                  const n = items.filter((i) => !i.done).length
                  p.say(`${n} ${n === 1 ? "task" : "tasks"} created for ${p.contactName}, due this week.`)
                }}>
                  Create {items.filter((i) => !i.done).length} tasks
                </Button>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="mtg-follow">
                Follow-up email <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[11px] font-normal">{followUpEdited ? "edited" : "Agent draft"}</Badge>
              </label>
              <Textarea id="mtg-follow" rows={3} value={followUp} onChange={(e) => { setFollowUp(e.target.value); setFollowUpEdited(true) }} className="mt-1" />
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button size="sm" disabled={!followUp.trim()} onClick={() => p.say(`Follow-up sent to ${p.contactName} from ${mailbox}.`)}>Send the follow-up</Button>
                <ConsequenceLine sends={1} to={p.contactName} from={mailbox} />
              </div>
            </div>
            {hasTranscripts(p.session.business) && (
              <div>
                <div className="text-xs text-muted-foreground">Transcript · from {seed.integrations[0]?.name ?? "the connected recorder"}</div>
                <p className="mt-1 rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground">
                  “…the part that hurts is the Thursday rebuild. My manager spends half a day on it and I still get asked
                  why the number moved.” — {p.contactName}, {day(TODAY)}
                </p>
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------------------------------------------- no-show */}
        {state === "no-show" && (
          <section>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">They did not come</h3>
            <Button size="sm" variant="outline" className="mt-1" onClick={() => p.say(`${p.contactName} enrolled in “Meeting no-show follow-up”.`)}>
              Start the reminder and reschedule sequence
            </Button>
            <p className="pt-1 text-xs text-muted-foreground">
              Enrols {p.contactName} in “Meeting no-show follow-up” · 3 emails over 8 days from {mailbox}.
            </p>
          </section>
        )}

        {/* ------------------------------------------------------------------ the handoff block */}
        <section className="rounded-lg border p-3">
          <h3 className="text-sm font-medium">{aes.length ? "Hand this over" : "Turn this into a deal"}</h3>
          <div className="space-y-3 pt-2">
            {HANDOFF_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-muted-foreground" htmlFor={`ho-${f.key}`}>
                  {f.label}{" "}
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[11px] font-normal">{edited[f.key] ? "edited" : "Agent draft"}</Badge>
                </label>
                <Textarea
                  id={`ho-${f.key}`}
                  rows={2}
                  value={handoff[f.key]}
                  onChange={(e) => { setHandoff((h) => ({ ...h, [f.key]: e.target.value })); setEdited((s) => ({ ...s, [f.key]: true })) }}
                  className="mt-1"
                />
              </div>
            ))}
            <div>
              <div className="text-xs text-muted-foreground">Qualification</div>
              <ul className="grid gap-0.5 pt-1 sm:grid-cols-2">
                {QUAL_ELEMENTS.map((e) => (
                  <li key={e} className="flex items-center gap-2">
                    <Checkbox id={`q-${e}`} checked={!!checks[e]} onCheckedChange={(v) => setChecks((c) => ({ ...c, [e]: v === true }))} />
                    <label htmlFor={`q-${e}`} className="text-sm">{e}</label>
                  </li>
                ))}
              </ul>
            </div>
            {aes.length > 0 && (
              <label className="block text-xs text-muted-foreground">
                Assign to
                <Select value={assignTo} onValueChange={setAssignTo}>
                  <SelectTrigger className="mt-1 h-8 w-full sm:w-64" aria-label="The account executive who takes it"><SelectValue /></SelectTrigger>
                  <SelectContent>{aes.map((a) => <SelectItem key={a.user} value={a.user}>{a.user} · {a.title}</SelectItem>)}</SelectContent>
                </Select>
              </label>
            )}
            <div>
              <Button size="sm" onClick={() => {
                p.say(`Deal created at Qualified for ${aes.length ? assignTo : p.session.user}.`)
                p.onOpenChange(false)
                // The deal is a page, and the panel just closed: the trail keeps the reply or the
                // task this was booked from, so the crumb comes back to that row.
                follow(`/ollopa/deals/${deal?.id ?? seed.deals[0].id}`, originHere(p.contactId))
              }}>
                {aes.length ? "Create the deal and assign" : "Create the deal"}
              </Button>
              <p className="pt-1 text-xs text-muted-foreground">
                {aes.length
                  ? `Creates a deal at Qualified for ${assignTo} — territory ${seed.territories[0]?.name ?? "unassigned"} · change`
                  : `Creates a deal at Qualified, owned by you.`}
              </p>
            </div>
            {/* What the SDR is paid on. Never behind a door. */}
            {p.session.role === "sdr" && aes.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Your handoffs accepted this quarter: {record.percent}% ({record.accepted} of {record.total})
              </p>
            )}
          </div>
        </section>
      </div>
    </Panel>
  )
}
