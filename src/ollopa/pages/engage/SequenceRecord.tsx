// The sequence (`R-sequence`): who is in it and where they are, what each step is doing, and whether
// it is safe to keep sending.
//
// One page, stacked sections, anchors that scroll and hide nothing — no tabs, because steps, people
// and results are read against each other. The thing nobody may lose sight of is whether sending is
// on or stopped and why, so the status, the button that changes it, its consequence and the bounce
// guard's two thresholds are in the header without a click, in every state.
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { ArrowLeft, Clock, Linkedin, Mail, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { href, navigate } from "@/app/router"
import { openBeside } from "../../beside"
import { back, follow, routeKey, useTrail } from "../../chain"
import { Door, DoorGroup, ExpandAll, useDoorState } from "../../ui/Door"
import { Panel } from "../../ui/Panel"
import { StatusLine } from "../../ui/Identity"
import { Locked } from "../../ui/Locked"
import { EmptyState } from "../../ui/EmptyState"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById, PLANS } from "../../data/businesses"
import {
  BOUNCE_GUARD, seedFor, TODAY,
  type Contact, type Enrollment, type Sequence, type SequenceStep, type SequenceStepVariant,
} from "../../data/seed"
import type { Session } from "../../session"
import { engage, useEngage } from "./store"
import { AddToSequencePanel } from "./AddToSequence"
import { statusOf, totalPeople } from "./Sequences"
import { useEdits } from "../../edits"
import { Actions, type Action } from "../../ui/Actions"
import { RecordPage } from "../../templates/RecordPage"
import { Chip, FamilyIcon } from "../../ui/Identity"
import { type Col, BesideLink, CountButton, CountRate, DataTable, FollowLink, RowNote, ago, day, h1Of, n, rate, toast, undoable, useKeys, usePersisted, useTick } from "./shared"

const STEP_ICON = { Email: Mail, "Call task": Phone, "LinkedIn task": Linkedin, Wait: Clock }
const VARIABLES = ["{{first_name}}", "{{company}}", "{{title}}", "{{signal}}", "{{owner}}"]
/** An A/B test says how far it has got before it says anything about which variant is winning. */
const ENOUGH_TO_CALL = 200


/**
 * Development only, and never in a build a person sees: how many times this component has rendered.
 * It exists so "the origin page does not re-render when the pane opens" can be checked rather than
 * claimed — open a person beside this page and these two numbers must not move.
 */
function useRenderCount() {
  const count = useRef(0)
  count.current += 1
  return count.current
}

function RenderCount({ label, count }: { label: string; count: number }) {
  if (!import.meta.env.DEV) return null
  return (
    <span data-renders={label} className="shrink-0 rounded border px-1.5 py-0.5 font-mono t-small tabular-nums text-muted-foreground">
      {label} renders: {count}
    </span>
  )
}

/** The same move as the crumb when the person came from the Sequences table; a plain link otherwise. */
function BackToSequences() {
  const trail = useTrail()
  const at = trail.length - 1
  const returns = at >= 0 && routeKey(trail[at].route) === routeKey("/ollopa/sequences")
  const body = <><ArrowLeft className="size-3" aria-hidden="true" />Sequences</>
  const className = "inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
  return returns
    ? <button type="button" className={className} onClick={() => back(at)}>{body}</button>
    : <a href={href("/ollopa/sequences")} className={className}>{body}</a>
}

export function SequenceRecord({ session, id }: { session: Session; id?: string }) {
  const renders = useRenderCount()
  const d = useDisclosure("sequences")
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const data = useEngage(session.business)
  const seq = data.sequences.find((s) => s.id === id) ?? data.sequences[0]

  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(seq?.name ?? "")
  const [peopleFilter, setPeopleFilter] = useState<string>("all")
  const [addingPeople, setAddingPeople] = useState(false)
  const [adding, setAdding] = useState(false)
  const [fixed, setFixed] = useState(false)
  const [live, setLive] = useState<string | null>(null)
  // The record owns the people search, so the section's card header can carry it.
  const [peopleQ, setPeopleQ] = useState("")
  const [, openSettings] = useDoorState("seq.settings")

  const say = (msg: string) => { setLive(msg); toast(msg) }

  useKeys(useMemo(() => [
    { keys: "a", label: "Add a step", run: () => setAdding(true) },
    { keys: "s", label: "Change sending settings", run: () => openSettings(true) },
    { keys: "E", label: "Expand every step", run: () => document.querySelector<HTMLButtonElement>("[data-expand-steps] button")?.click() },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []))

  if (!seq) {
    return <div className="p-10"><EmptyState title="That sequence is gone" body="It may have been archived." action={<Button size="sm" onClick={() => navigate("/ollopa/sequences")}>Back to Sequences</Button>} /></div>
  }

  const steps = data.stepsOf(seq.id)
  const enrollments = data.enrollmentsOf(seq.id)
  const changes = data.changesOf(seq.id)
  // The same predicate the people table filters with, so the section's count and its rows agree.
  const peopleCount = (() => {
    const needle = peopleQ.trim().toLowerCase()
    const byId = new Map(seed.contacts.map((c) => [c.id, c]))
    return enrollments.filter((e) => {
      const c = byId.get(e.contactId)
      if (peopleFilter !== "all" && e.status !== peopleFilter) return false
      if (needle && !`${c?.name ?? ""} ${c?.company ?? ""}`.toLowerCase().includes(needle)) return false
      return true
    }).length
  })()
  const st = statusOf(seq)
  const canEdit = seq.owner === session.user || session.role === "admin"
  const feeder = data.lists.find((l) => l.feeds.some((f) => f.name === seq.name))
  const total = totalPeople(seq)

  const counts = [
    { key: "Active", label: "Active", value: seq.active },
    { key: "Paused", label: "Paused", value: seq.paused },
    { key: "Finished", label: "Finished", value: seq.finished },
    { key: "Replied", label: "Replied", value: seq.replied },
    { key: "Bounced", label: "Bounced", value: seq.bounced, tone: "warning" as const },
    { key: "Not sent", label: "Not sent", value: seq.notSent, tone: "error" as const },
  ]

  const pauseResume = () => {
    const next = seq.status === "Active" ? "Paused" : "Active"
    engage.patchSequence(session.business, seq.id, {
      status: next, pausedBy: next === "Paused" ? session.user : null,
      guardState: next === "Active" && seq.guardState === "auto-paused" ? "warning" : seq.guardState,
      updatedAt: TODAY,
    })
    engage.logChange(session.business, seq.id, session.user, next === "Paused" ? "Paused the sequence" : "Resumed the sequence")
    say(next === "Paused"
      ? `${seq.name} paused. Emails and new tasks stop. Everyone keeps their place.`
      : `${seq.name} resumed. ${n(seq.active)} people continue from their next step.`)
  }

  const resumeBlocked = seq.guardState === "auto-paused" && !fixed
  const consequence = seq.status === "Active"
    ? "Pause stops emails and new tasks. Everyone keeps their place."
    : `Resume continues from each person's next step. ${n(Math.min(seq.active, seq.dailyCap))} emails go out in the next sending window.`

  const stepsOn = steps.filter((s) => s.on > 0).length
  const offStep = steps.find((s) => s.on === 0)

  return (
    <DoorGroup>
    <RecordPage
      family="sequences"
      back={{ label: "Sequences", href: href("/ollopa/sequences") }}
      title={{
        value: seq.name,
        onRename: canEdit ? (v: string) => {
          engage.patchSequence(session.business, seq.id, { name: v })
          engage.logChange(session.business, seq.id, session.user, `Renamed the sequence to ${v}`)
          say(`Renamed to ${v}`)
        } : undefined,
      }}
      chips={<>
        <Chip status={st.word}>{st.label}</Chip>
        <RenderCount label="page" count={renders} />
      </>}
      fields={[
        {
          key: "guard", label: "Sending", wide: true,
          // The health line: the rate, both thresholds, and what to do before it pauses.
          value: (
    <StatusLine
      className="mt-3"
      status={seq.guardState === "auto-paused" ? "Auto-paused" : seq.guardState === "warning" ? "Warning" : "None"}
      word={seq.guardState === "auto-paused" ? "Auto-paused" : seq.guardState === "warning" ? "Close to the limit" : "Sending"}
    >
      Bounce rate {seq.bounceRate7d}% over 7 days · Bounce guard warns at {BOUNCE_GUARD.warnPercent}%, pauses at {BOUNCE_GUARD.pausePercent}%.
      {seq.guardState === "auto-paused" && (
        <>
          <span className="mt-2 flex flex-wrap items-center gap-2">
            <Actions
              surface="card"
              items={[
                { kind: "secondary", label: `Remove ${n(seq.bounced)} bounced people`, onClick: () => { setFixed(true); say(`Removed ${n(seq.bounced)} bounced people from ${seq.name}`) } },
                { kind: "secondary", label: `Retry ${n(seq.notSent)} not-sent people`, onClick: () => { setFixed(true); setPeopleFilter("Not sent"); say(`Retrying ${n(seq.notSent)} not-sent people`) } },
              ]}
            />
            <label className="flex items-center gap-2 text-xs">
              <Checkbox checked={fixed} onCheckedChange={(v) => setFixed(v === true)} />
              I have fixed the data
            </label>
          </span>
        </>
      )}
      {" "}
      <FollowLink
        className="underline"
        to="/ollopa/settings/email-sending?row=mail.bounce-guard"
        route={`/ollopa/sequences/${seq.id}`} title={h1Of("sequences", seq.name)} anchor="seq.link.bounce-guard"
      >Bounce guard thresholds (Settings)</FollowLink>
      {session.role !== "admin" && <span className="t-small"> · RevOps admins change them</span>}
    </StatusLine>
          ),
        },
        {
          key: "counts", label: "People", wide: true,
          value: (
    <div className="mt-3 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {counts.map((c) => (
        <CountButton
          key={c.key} label={c.label} count={c.value} tone={c.tone} className="shrink-0"
          active={peopleFilter === c.key}
          onClick={() => { setPeopleFilter(peopleFilter === c.key ? "all" : c.key); document.getElementById("seq-people")?.scrollIntoView({ behavior: "smooth", block: "start" }) }}
        />
      ))}
    </div>
          ),
        },
        {
          key: "results", label: "Results", wide: true,
          value: (
    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 xl:grid-cols-6">
      <CountRate label="Sent" count={seq.sent} />
      <CountRate label="Delivered" count={seq.delivered} of={seq.sent || 1} />
      <CountRate label="Opened" count={seq.opened} of={seq.delivered || 1} />
      <CountRate label="Replied" count={seq.replied} of={seq.delivered || 1} />
      <CountRate label="Interested" count={seq.interested} of={seq.delivered || 1} />
      <CountRate label="Meetings" count={seq.meetings} of={seq.delivered || 1} />
    </div>
          ),
        },
        {
          key: "sends", label: "Sends", wide: true,
          value: (<>
    <p className="t-body mt-3 text-muted-foreground">
      Sends from {seq.mailboxRotation.length ? `${seq.mailboxRotation.length} mailboxes in rotation` : seq.mailbox}
      {mailboxToday(session, seq)} · {seq.schedule} · {seq.ruleset} rules · {seq.priority} priority
    </p>
    {feeder && (
      <p className="mt-2 text-sm">
        Fed by <BesideLink className="underline" kind="list" id={feeder.id}>{feeder.name}</BesideLink>
        {feeder.feeds.some((f) => f.auto && f.name === seq.name) && " · new matches added automatically"}
      </p>
    )}
          </>),
        },
        ...(canEdit ? [] : [{
          key: "owner", label: "Owner", wide: true,
          value: `Owned by ${seq.owner}; only the owner and RevOps admins change the steps and the settings.`,
        }]),
      ]}
      actions={{ primary: [], secondary: [] }}
      headerActions={
      <div className="flex flex-wrap items-center gap-2" data-print-hide>
        <Actions
          surface="page"
          items={[
            { kind: "primary", label: "Add people", onClick: () => setAddingPeople(true) },
            {
              kind: "secondary",
              label: seq.guardState === "auto-paused" ? "Review and resume" : seq.status === "Active" ? "Pause" : "Resume",
              onClick: pauseResume,
              disabledBecause: resumeBlocked ? "Remove the bounced people or fix the data first" : undefined,
            },
          ]}
        />
        {canEdit && (
          <Actions
            surface="page"
            layout="menu"
            items={[
              { kind: "secondary", label: "Duplicate", onClick: () => say(`Copied ${seq.name}: steps and settings, nobody in it`) },
              { kind: "secondary", label: "Export people (CSV)", onClick: () => say(`Exported ${n(enrollments.length)} people from ${seq.name}`) },
              ...(seq.archivedAt ? [] : [{
                kind: "destructive" as const,
                label: "Archive",
                onClick: () => {
                  engage.patchSequence(session.business, seq.id, { archivedAt: TODAY, status: "Paused" })
                  engage.logChange(session.business, seq.id, session.user, "Archived the sequence")
                  say(`${seq.name} archived`)
                },
                irreversible: {
                  title: `Archive ${seq.name}?`,
                  consequence: `${n(seq.active + seq.paused)} people are marked finished and their scheduled emails are deleted. Their replies and activity stay on their records.`,
                  confirmLabel: "Archive the sequence",
                },
              }]),
              ...(seq.status === "Draft" && total === 0 ? [{
                kind: "destructive" as const,
                label: "Delete draft",
                onClick: () => { engage.patchSequence(session.business, seq.id, { archivedAt: TODAY }); navigate("/ollopa/sequences") },
                irreversible: {
                  title: `Delete ${seq.name}?`,
                  consequence: "The draft and its steps go. Nothing has been sent from it, so nobody is affected.",
                  confirmLabel: "Delete the draft",
                },
              }] : []),
            ] as Action[]}
          />
        )}
      </div>
      }
      main={{
        kind: "sections",
        sections: [
          {
            id: "seq-steps",
            title: "Steps",
            count: steps.length,
            action: canEdit ? <Actions surface="card" items={[{ kind: "secondary", label: "Add a step", onClick: () => setAdding((v) => !v), keys: "a" }]} /> : undefined,
            children: (<>
          {adding && canEdit && (
            <div className="mx-4 mb-3 flex flex-wrap gap-2">
              {(["Email", "Call task", "LinkedIn task", "Wait"] as const).map((kind) => (
                <Button
                  key={kind} size="sm" variant="outline"
                  onClick={() => {
                    const order = steps.length + 1
                    engage.addStep(session.business, {
                      id: `${seq.id}-st-new-${order}-${Date.now().toString(36)}`, sequenceId: seq.id, order,
                      kind, on: 1, subject: "", body: "", templateId: null,
                      variants: [{ label: "A", subject: "", body: "", sent: 0, replied: 0 }],
                      linkedinKind: kind === "LinkedIn task" ? "Message" : null,
                      waitDays: kind === "Wait" ? 3 : 0, businessDaysOnly: true,
                      stats: { sent: 0, delivered: 0, opened: 0, replied: 0, bounced: 0, unsubscribed: 0, created: 0, done: 0, skipped: 0, overdue: 0, waitingNow: 0 },
                    })
                    engage.patchSequence(session.business, seq.id, { steps: steps.length + 1 })
                    engage.logChange(session.business, seq.id, session.user, `Added step ${order}: ${kind}`)
                    setAdding(false)
                    say(`Step ${order} added: ${kind}`)
                  }}
                >{kind}</Button>
              ))}
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          )}

          {/* The steps have their own expand-all, because "every step" is the set a person means. */}
          <DoorGroup>
            <div className="flex justify-end px-4" data-expand-steps data-print-hide>
              <ExpandAll />
            </div>
            <ol>
              {steps.map((step, i) => (
                <li key={step.id} className="[&:not(:first-child)]:border-0">
                  <Separator />
                  <StepCard
                    session={session} seq={seq} step={step} steps={steps} index={i}
                    enrollments={enrollments} canEdit={canEdit} onSaid={say}
                  />
                </li>
              ))}
            </ol>
          </DoorGroup>

          {steps.length === 0 && <div className="px-4 pb-3"><EmptyState title="No steps yet" body="Add an email, a call, a LinkedIn task or a wait." /></div>}

          {seq.status === "Draft" && (
            <><Separator className="mt-3" /><div className="flex flex-wrap items-center gap-3 p-3">
              <Button
                size="sm"
                disabled={stepsOn === 0 || !seq.mailbox}
                onClick={() => {
                  engage.patchSequence(session.business, seq.id, { status: "Active" })
                  engage.logChange(session.business, seq.id, session.user, "Activated the sequence")
                  say(`${seq.name} is active. ${n(stepsOn)} steps are on.`)
                }}
              >Activate</Button>
              <span className="t-small text-muted-foreground">
                {stepsOn === 0
                  ? "No step is on, so nothing would send. Turn one on first."
                  : !seq.mailbox
                    ? "No mailbox is linked to this sequence. Link one in the sending settings."
                    : `${n(stepsOn)} of ${n(steps.length)} steps are on.${offStep ? ` Step ${offStep.order} is off and will be skipped.` : ""}`}
              </span>
            </div></>
          )}
            </>),
          },
          {
            id: "seq-people",
            title: "People",
            count: peopleCount,
            action: (
              <>
                <Input aria-label="Find a person in this sequence" placeholder="Find a person" value={peopleQ} onChange={(e) => setPeopleQ(e.target.value)} className="h-9 w-48" />
                <Select value={peopleFilter} onValueChange={setPeopleFilter}>
                  <SelectTrigger className="h-9 w-40" aria-label="Status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Status: all</SelectItem>
                    {["Active", "Paused", "Finished", "Replied", "Bounced", "Not sent"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Actions surface="card" items={[{ kind: "secondary", label: "Add people", onClick: () => setAddingPeople(true) }]} />
              </>
            ),
            children: (
              <SequencePeople
                session={session} seq={seq} steps={steps} enrollments={enrollments}
                filter={peopleFilter} q={peopleQ} onAdd={() => setAddingPeople(true)} onSaid={say}
                pageRenders={renders}
              />
            ),
          },
        ],
      }}
      side={[]}
      doors={[
        { id: "seq.results", label: "Results by step and by audience", openByDefault: d.level("seq.results.by-step") === 1, content: (
<Door id="seq.results" label="Results by step and by audience" defaultOpen={d.level("seq.results.by-step") === 1}>
        <div className="overflow-x-auto">
          <table className="w-full divide-y text-xs">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-1 pr-3 font-normal">Step</th>
                {["Sent", "Delivered", "Opened", "Replied", "Interested", "Bounced", "Unsubscribed"].map((h) => <th key={h} className="py-1 pr-3 font-normal">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {steps.filter((s) => s.kind === "Email").map((s) => (
                <tr key={s.id}>
                  <td className="py-1 pr-3">{s.order}. {s.subject || "Untitled email"}</td>
                  <td className="py-1 pr-3 tabular-nums">{n(s.stats.sent)}</td>
                  <td className="py-1 pr-3 tabular-nums">{n(s.stats.delivered)} · {rate(s.stats.delivered, s.stats.sent)}</td>
                  <td className="py-1 pr-3 tabular-nums">{n(s.stats.opened)} · {rate(s.stats.opened, s.stats.delivered)}</td>
                  <td className="py-1 pr-3 tabular-nums">{n(s.stats.replied)} · {rate(s.stats.replied, s.stats.delivered)}</td>
                  <td className="py-1 pr-3 tabular-nums">{n(Math.round(s.stats.replied * 0.4))}</td>
                  <td className="py-1 pr-3 tabular-nums">{n(s.stats.bounced)} · {rate(s.stats.bounced, s.stats.sent)}</td>
                  <td className="py-1 pr-3 tabular-nums">{n(s.stats.unsubscribed)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="pt-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">By audience</h4>
          <table className="w-full divide-y text-xs">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-1 pr-3 font-normal">Group</th><th className="py-1 pr-3 font-normal">People</th><th className="py-1 pr-3 font-normal">Replied</th>
              </tr>
            </thead>
            <tbody>
              {audienceRows(session, enrollments).map((row) => (
                <tr key={row.label}>
                  <td className="py-1 pr-3">{row.label}</td>
                  <td className="py-1 pr-3 tabular-nums">{n(row.people)}</td>
                  <td className="py-1 pr-3 tabular-nums">{n(row.replied)} · {rate(row.replied, row.people)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => say(`Exported the results of ${seq.name}`)}>Export CSV</Button>
      </Door>
        ) },
        { id: "seq.settings", label: canEdit ? "Change sending settings" : "Sending settings", content: (
    <div className="mt-2 mb-3">
      <SendingSettings session={session} seq={seq} canEdit={canEdit} onSaid={say} />
    </div>
        ) },
        { id: "seq.history", label: "Change history", count: changes.length, openByDefault: d.level("seq.history") === 1, content: (
<Door id="seq.history" label="Change history" count={changes.length} defaultOpen={d.level("seq.history") === 1}>
        <ul className="space-y-1 py-1">
          {changes.map((c) => (
            <li key={c.id} className="grid grid-cols-[6rem_9rem_1fr] gap-2 text-xs">
              <span className="tabular-nums text-muted-foreground">{day(c.when)}</span>
              <span className="text-muted-foreground">{c.who}</span>
              <span>{c.what}</span>
            </li>
          ))}
        </ul>
      </Door>
        ) },
      ]}
    />
        {addingPeople && (
          <AddToSequencePanel
            open
            onOpenChange={setAddingPeople}
            business={session.business}
            user={session.user}
            people={seed.contacts.filter((c) => !enrollments.some((e) => e.contactId === c.id)).slice(0, 240)}
            sequences={[seq]}
            defaultSequenceId={seq.id}
            from="People and Lists"
            lockSequence
          />
        )}
    <p className="sr-only" role="status" aria-live="polite">{live}</p>
    </DoorGroup>
  )
}

/** "marcus@meridian.io (42 of 100 today)": the capacity beside the name, because that is the choice. */
function mailboxToday(session: Session, seq: Sequence): string {
  const box = seedFor(session.business).mailboxes.find((m) => m.address === seq.mailbox)
  return box ? ` (${n(box.sentToday)} of ${n(box.dailyLimit)} today)` : ""
}

/* --------------------------------------------------------------------------------- the steps */

function StepCard({ session, seq, step, steps, index, enrollments, canEdit, onSaid }: {
  session: Session
  seq: Sequence
  step: SequenceStep
  steps: SequenceStep[]
  index: number
  enrollments: Enrollment[]
  canEdit: boolean
  onSaid: (msg: string) => void
}) {
  const Icon = STEP_ICON[step.kind]
  const waiting = enrollments.filter((e) => e.stepOrder === step.order && e.status === "Active").length
  const [subject, setSubject] = useState(step.subject)
  const [body, setBody] = useState(step.variants[0]?.body ?? step.body)
  const [previewing, setPreviewing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const title = step.kind === "Email" ? (step.subject || "Untitled email")
    : step.kind === "Call task" ? "Call task"
      : step.kind === "LinkedIn task" ? `LinkedIn: ${(step.linkedinKind ?? "Message").toLowerCase() === "connect" ? "connection request" : (step.linkedinKind ?? "Message").toLowerCase()}`
        : `Wait ${step.waitDays} ${step.businessDaysOnly ? "business days" : "days"}`

  const results = step.kind === "Email"
    ? `sent ${n(step.stats.sent)} · delivered ${rate(step.stats.delivered, step.stats.sent)} · opened ${rate(step.stats.opened, step.stats.delivered)} · replied ${rate(step.stats.replied, step.stats.delivered)} · bounced ${rate(step.stats.bounced, step.stats.sent)}`
    : step.kind === "Wait" ? `${n(step.stats.waitingNow)} waiting now`
      : `${n(step.stats.created)} created · ${n(step.stats.done)} done · ${n(step.stats.skipped)} skipped · ${n(step.stats.overdue)} overdue`

  const insert = (token: string) => {
    const el = bodyRef.current
    const at = el?.selectionStart ?? body.length
    const next = body.slice(0, at) + token + body.slice(at)
    setBody(next)
    el?.focus()
  }

  const save = () => {
    engage.patchStep(session.business, step.id, {
      subject, body,
      variants: step.variants.map((v, i) => (i === 0 ? { ...v, subject, body } : v)),
    })
    engage.logChange(session.business, seq.id, session.user, `Edited step ${step.order}`)
    onSaid(`Step ${step.order} saved`)
  }

  const move = (delta: number) => {
    const order = steps.map((s) => s.id)
    const to = index + delta
    if (to < 0 || to >= order.length) return
    const next = [...order]
    ;[next[index], next[to]] = [next[to], next[index]]
    engage.setStepOrder(session.business, seq.id, next)
    onSaid(`Step moved to position ${to + 1}`)
  }

  const ab = step.variants.length > 1
  const readOnly = !canEdit

  return (
    <div className={cn(step.on === 0 && "opacity-70")}>
      <div className="flex flex-wrap items-start gap-2 px-3 pt-3">
        {/* The step number is the library's outline badge, not a span drawn to look like one. */}
        <Badge variant="outline" className="size-6 shrink-0 justify-center rounded-full p-0 tabular-nums">{step.order}</Badge>
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="t-body font-medium">{title}</span>
            <Badge variant="outline" className="px-1.5 py-0 t-small font-normal">{step.kind}</Badge>
            {step.on === 0 && <Chip status="Off · skipped" />}
          </div>
          {!ab && <p className="t-small tabular-nums text-muted-foreground">{results}</p>}
          {ab && (
            <>
              <Badge variant="secondary" className="mt-1 font-normal">{decisionBar(step.variants)}</Badge>
              {step.variants.map((v) => (
                <p key={v.label} className="t-small tabular-nums text-muted-foreground">
                  {v.label}: sent {n(v.sent)} · replied {n(v.replied)} · {rate(v.replied, v.sent)}
                </p>
              ))}
              {canEdit && enoughToCall(step.variants) && (
                <Button
                  size="sm" variant="outline" className="mt-1 h-7 text-xs"
                  onClick={() => {
                    const winner = [...step.variants].sort((a, b) => b.replied / (b.sent || 1) - a.replied / (a.sent || 1))[0]
                    const loser = step.variants.find((v) => v.label !== winner.label)
                    engage.patchStep(session.business, step.id, { variants: [winner] })
                    engage.logChange(session.business, seq.id, session.user, `Promoted variant ${winner.label} on step ${step.order}`)
                    onSaid(`Variant ${winner.label} promoted · ${loser?.label} is off for everyone in this sequence`)
                  }}
                >
                  Promote {[...step.variants].sort((a, b) => b.replied / (b.sent || 1) - a.replied / (a.sent || 1))[0].label} · turns{" "}
                  {[...step.variants].sort((a, b) => b.replied / (b.sent || 1) - a.replied / (a.sent || 1))[1]?.label} off for everyone in this sequence
                </Button>
              )}
            </>
          )}
        </div>
        {canEdit && (
          <div className="flex shrink-0 flex-wrap items-center gap-1" data-print-hide>
            <Button size="sm" variant="ghost" className="hidden h-7 px-2 text-xs sm:inline-flex" onClick={() => move(-1)}>Move up</Button>
            <Button size="sm" variant="ghost" className="hidden h-7 px-2 text-xs sm:inline-flex" onClick={() => move(1)}>Move down</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" aria-label={`Actions for step ${step.order}`}>…</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-w-[20rem]">
                <DropdownMenuItem onSelect={() => move(-1)}>Move up</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => move(1)}>Move down</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  engage.patchStep(session.business, step.id, { on: step.on === 0 ? 1 : 0 })
                  onSaid(step.on === 0 ? `Step ${step.order} is on` : `Step ${step.order} is off and will be skipped`)
                }}>{step.on === 0 ? "Turn on" : "Turn off · it stays in the list, greyed"}</DropdownMenuItem>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Change type</DropdownMenuLabel>
                {(["Email", "Call task", "LinkedIn task", "Wait"] as const).filter((k) => k !== step.kind).map((k) => (
                  <DropdownMenuItem key={k} onSelect={() => { engage.patchStep(session.business, step.id, { kind: k }); onSaid(`Step ${step.order} is now a ${k.toLowerCase()}`) }}>{k}</DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="whitespace-normal text-destructive" onSelect={() => setConfirmDelete(true)}>
                  Delete step{waiting > 0 ? ` · ${n(waiting)} people waiting here move to step ${Math.min(step.order + 1, steps.length)}` : " · nobody is waiting here"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {confirmDelete && (
        <Alert variant="destructive" className="mx-3 mt-2 flex flex-wrap items-center gap-2">
          <AlertDescription className="basis-full">
            {waiting > 0 ? `${n(waiting)} people are waiting at this step. They move to step ${Math.min(step.order + 1, steps.length)}.` : "Nobody is waiting at this step."}
          </AlertDescription>
          <Button size="sm" variant="destructive" onClick={() => {
            engage.removeStep(session.business, step.id)
            engage.patchSequence(session.business, seq.id, { steps: Math.max(0, steps.length - 1) })
            engage.logChange(session.business, seq.id, session.user, `Deleted step ${step.order}`)
            onSaid(`Step ${step.order} deleted`)
          }}>Delete step</Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Keep it</Button>
        </Alert>
      )}

      <Door id={`seq.step.${step.id}`} label="Open step" defaultOpen={seq.status === "Draft" && index === 0}>
        {readOnly ? (
          /* A reader gets the copy, in the same order, with no edit control anywhere near it. */
          <div className="space-y-2 py-1">
            {step.kind === "Wait" ? (
              <p className="text-sm">Waits {step.waitDays} {step.businessDaysOnly ? "business days" : "days"} · {n(step.stats.waitingNow)} people are waiting here now.</p>
            ) : (
              <>
                {step.kind === "Email" && <p className="t-body font-medium">{step.subject || "No subject"}</p>}
                {step.kind === "LinkedIn task" && <p className="t-small text-muted-foreground">LinkedIn {(step.linkedinKind ?? "Message").toLowerCase()}</p>}
                <p className="whitespace-pre-wrap text-sm">{step.variants[0]?.body || step.body || "No copy yet."}</p>
              </>
            )}
            <p className="t-small text-muted-foreground">{seq.owner} and RevOps admins change this step.</p>
          </div>
        ) : step.kind === "Wait" ? (
          <div className="flex flex-wrap items-end gap-3 py-1">
            <div>
              <Label htmlFor={`wait-${step.id}`} className="t-label">Wait</Label>
              <Input
                id={`wait-${step.id}`} type="number" min={1} className="mt-1 h-8 w-24" defaultValue={step.waitDays}
               
                onBlur={(e) => { engage.patchStep(session.business, step.id, { waitDays: Number(e.target.value) }); onSaid(`Step ${step.order} waits ${e.target.value} days`) }}
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <Checkbox
                checked={step.businessDaysOnly}
                onCheckedChange={(v) => engage.patchStep(session.business, step.id, { businessDaysOnly: v === true })}
              />
              Business days only
            </label>
            <p className="t-small pb-2 text-muted-foreground">{n(step.stats.waitingNow)} people are waiting here now.</p>
          </div>
        ) : step.kind === "Call task" ? (
          <div className="space-y-2 py-1">
            <Label htmlFor={`call-${step.id}`} className="t-label">What the call is for</Label>
            <Textarea
              id={`call-${step.id}`} rows={3} defaultValue={step.body || "Ask what they tried first, and whether routing is owned by them."}
              onBlur={(e) => engage.patchStep(session.business, step.id, { body: e.target.value })}
            />
            <div className="flex items-end gap-2">
              <div>
                <Label htmlFor={`due-${step.id}`} className="t-label">Due within</Label>
                <Input id={`due-${step.id}`} type="number" min={1} className="mt-1 h-8 w-24" defaultValue={2} />
              </div>
              <span className="t-small pb-2 text-muted-foreground">days</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-1">
            {step.kind === "Email" && (
              <>
                <Label htmlFor={`subj-${step.id}`} className="t-label">Subject</Label>
                <Input id={`subj-${step.id}`} value={subject} onChange={(e) => setSubject(e.target.value)} />
              </>
            )}
            {step.kind === "LinkedIn task" && (
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <Label htmlFor={`li-${step.id}`} className="t-label">LinkedIn action</Label>
                  <Select
                    value={step.linkedinKind ?? "Message"}
                    onValueChange={(v) => engage.patchStep(session.business, step.id, { linkedinKind: v as SequenceStep["linkedinKind"] })}
                  >
                    <SelectTrigger id={`li-${step.id}`} className="mt-1 w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Connect">Connection request</SelectItem>
                      <SelectItem value="Message">Message</SelectItem>
                      <SelectItem value="View profile">View profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`lidue-${step.id}`} className="t-label">Due within</Label>
                  <Input id={`lidue-${step.id}`} type="number" min={1} className="mt-1 h-8 w-24" defaultValue={2} />
                </div>
              </div>
            )}

            <Label htmlFor={`body-${step.id}`} className="t-label">
              {step.kind === "LinkedIn task" ? "The message the task will show" : "Body"}
            </Label>
            <Textarea id={`body-${step.id}`} ref={bodyRef} rows={6} value={body} onChange={(e) => setBody(e.target.value)} />

            {step.templateId && (
              <p className="t-small text-muted-foreground">
                Linked to template{" "}
                <BesideLink className="underline" kind="template" id={step.templateId}>{templateName(session, step.templateId)}</BesideLink>
                {" · "}{n(templateUses(session, step.templateId))} steps use it ·{" "}
                <button type="button" className="underline" onClick={() => { engage.patchStep(session.business, step.id, { templateId: null }); onSaid("Unlinked. This step keeps its own text.") }}>Unlink</button>
              </p>
            )}

            {canEdit && (
              <div className="flex flex-wrap items-center gap-2" data-print-hide>
                {session.business === "fathom" && (
                  <Button size="sm" variant="outline" onClick={() => { setBody(agentDraft(step)); onSaid("Agent draft written into the body. It is not sent until you save it.") }}>Draft with the outreach agent</Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="sm" variant="outline">Insert variable</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {VARIABLES.map((v) => <DropdownMenuItem key={v} onSelect={() => insert(v)}>{v}</DropdownMenuItem>)}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="sm" variant="outline">Use a template</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-80 max-w-[22rem] overflow-y-auto">
                    {seedFor(session.business).templates.map((t) => (
                      <div key={t.id}>
                        <DropdownMenuLabel className="text-xs font-normal">{t.name} · {t.folder} · used {ago(t.updatedAt)}</DropdownMenuLabel>
                        <DropdownMenuItem className="whitespace-normal" onSelect={() => { setSubject(t.subject); setBody(t.body); engage.patchStep(session.business, step.id, { templateId: t.id }); onSaid(`Linked to ${t.name}. Edits change every step that uses it.`) }}>
                          Link — edits change this step everywhere it is used ({n(t.usedBy.length)} steps today)
                        </DropdownMenuItem>
                        <DropdownMenuItem className="whitespace-normal" onSelect={() => { setSubject(t.subject); setBody(t.body); engage.patchStep(session.business, step.id, { templateId: null }); onSaid(`Copied ${t.name}. This step keeps its own text.`) }}>
                          Copy — this step keeps its own text
                        </DropdownMenuItem>
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {session.business !== "fathom" && (
                  <Button size="sm" variant="outline" onClick={() => { setBody(agentDraft(step)); onSaid("Agent draft written into the body. It is not sent until you save it.") }}>Draft with the outreach agent</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setPreviewing(true)}>Preview for…</Button>
                <Button
                  size="sm" variant="outline"
                  onClick={() => {
                    engage.patchStep(session.business, step.id, {
                      variants: [...step.variants, { label: String.fromCharCode(65 + step.variants.length), subject, body, sent: 0, replied: 0 }],
                    })
                    onSaid(`Variant ${String.fromCharCode(65 + step.variants.length)} added, stacked under ${step.variants[step.variants.length - 1].label}`)
                  }}
                >Add variant</Button>
                <Actions
                  surface="card"
                  items={[
                    { kind: "primary", label: "Save", onClick: save },
                    { kind: "secondary", label: "Cancel", onClick: () => { setSubject(step.subject); setBody(step.variants[0]?.body ?? step.body) } },
                  ]}
                />
              </div>
            )}

            {step.variants.slice(1).map((v, i) => (
              <Fragment key={v.label}>
              {i > 0 && <Separator />}
              <div className="py-2">
                <p className="t-label">Variant {v.label}</p>
                <Input aria-label={`Variant ${v.label} subject`} className="mt-1 h-8" defaultValue={v.subject}
                  onBlur={(e) => engage.patchStep(session.business, step.id, { variants: step.variants.map((x, j) => (j === i + 1 ? { ...x, subject: e.target.value } : x)) })} />
                <Textarea aria-label={`Variant ${v.label} body`} className="mt-1" rows={4} defaultValue={v.body}
                  onBlur={(e) => engage.patchStep(session.business, step.id, { variants: step.variants.map((x, j) => (j === i + 1 ? { ...x, body: e.target.value } : x)) })} />
              </div>
              </Fragment>
            ))}
          </div>
        )}
      </Door>

      <Panel id={`preview-${step.id}`} title={`Preview step ${step.order}`} open={previewing} onOpenChange={setPreviewing}>
        <PreviewBody session={session} subject={subject} body={body} />
      </Panel>
    </div>
  )
}

function decisionBar(variants: SequenceStepVariant[]): string {
  const parts = variants.map((v) => `${v.label} ${n(v.sent)} of ~${ENOUGH_TO_CALL}`)
  if (!enoughToCall(variants)) return `${parts.join(" · ")} · not enough to call yet`
  const sorted = [...variants].sort((a, b) => b.replied / (b.sent || 1) - a.replied / (a.sent || 1))
  return `${parts.join(" · ")} · ${sorted[0].label} replies at ${rate(sorted[0].replied, sorted[0].sent)} against ${rate(sorted[1].replied, sorted[1].sent)}`
}
const enoughToCall = (variants: SequenceStepVariant[]) => variants.every((v) => v.sent >= ENOUGH_TO_CALL)

function agentDraft(step: SequenceStep): string {
  return `Hi {{first_name}},\n\n{{company}} is hiring across revenue operations, which usually means routing is about to break. We fixed that for three teams your size last quarter.\n\nWorth twenty minutes on Thursday?\n\n— Agent draft, not sent until you save it.${step.subject ? "" : ""}`
}

function templateName(session: Session, id: string): string {
  return seedFor(session.business).templates.find((t) => t.id === id)?.name ?? "a template"
}
function templateUses(session: Session, id: string): number {
  return seedFor(session.business).templates.find((t) => t.id === id)?.usedBy.length ?? 0
}

/** `X-preview`: the copy rendered against a real person, with the variables that have no value named. */
function PreviewBody({ session, subject, body }: { session: Session; subject: string; body: string }) {
  const seed = seedFor(session.business)
  const [who, setWho] = useState(seed.contacts[0]?.id ?? "")
  const person = seed.contacts.find((c) => c.id === who) ?? seed.contacts[0]
  const values: Record<string, string> = {
    "{{first_name}}": person?.name.split(" ")[0] ?? "",
    "{{company}}": person?.company ?? "",
    "{{title}}": person?.title ?? "",
    "{{signal}}": person?.signals[0]?.kind ?? "",
    "{{owner}}": person?.owner ?? "",
  }
  const render = (text: string) => text.replace(/\{\{[a-z_]+\}\}/g, (m) => values[m] || m)
  const unfilled = [...new Set([...subject.matchAll(/\{\{[a-z_]+\}\}/g), ...body.matchAll(/\{\{[a-z_]+\}\}/g)].map((m) => m[0]))].filter((v) => !values[v])

  return (
    <>
      <Label htmlFor="preview-who" className="t-label">Preview for</Label>
      <Select value={who} onValueChange={setWho}>
        <SelectTrigger id="preview-who" className="mt-1 w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          {seed.contacts.slice(0, 40).map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · {c.company}</SelectItem>)}
        </SelectContent>
      </Select>
      {unfilled.length > 0 && (
        <p className="t-body mt-3" style={{ color: "var(--warning-ink)" }}>
          {n(unfilled.length)} {unfilled.length === 1 ? "variable has" : "variables have"} no value for {person?.name}: {unfilled.join(", ")}
        </p>
      )}
      <div className="mt-3">
        <p className="t-body font-medium">{render(subject) || "No subject"}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm">{render(body)}</p>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------- the sequence's own settings */

function SendingSettings({ session, seq, canEdit, onSaid }: {
  session: Session; seq: Sequence; canEdit: boolean; onSaid: (msg: string) => void
}) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const [draft, setDraft] = useState({
    mailbox: seq.mailbox, rotation: seq.mailboxRotation, dailyCap: seq.dailyCap,
    schedule: seq.schedule, ruleset: seq.ruleset, priority: seq.priority, tracking: seq.tracking,
  })
  useEffect(() => setDraft({
    mailbox: seq.mailbox, rotation: seq.mailboxRotation, dailyCap: seq.dailyCap,
    schedule: seq.schedule, ruleset: seq.ruleset, priority: seq.priority, tracking: seq.tracking,
  }), [seq])

  const box = seed.mailboxes.find((m) => m.address === draft.mailbox)
  const schedule = seed.schedules.find((s) => s.name === draft.schedule)
  const ruleset = seed.rulesets.find((r) => r.name === draft.ruleset)
  const growth = PLANS.find((p) => p.name === "Growth")!
  const savedRulesetsLocked = b.plan.name === "Starter"

  const save = () => {
    engage.patchSequence(session.business, seq.id, { ...draft, updatedAt: TODAY })
    engage.logChange(session.business, seq.id, session.user, `Changed sending settings: ${draft.schedule}, ${draft.ruleset}, ${draft.priority} priority`)
    onSaid("Saved · sending settings")
  }

  // A person who may not edit this sequence reads the same five things in the same order, as values.
  // Controls are absent, never greyed: a disabled control teaches nothing and invites a wasted click.
  if (!canEdit) {
    return (
      <div id="seq-settings">
        <Door id="seq.settings" label="Sending settings">
          <dl className="grid gap-x-6 gap-y-2 py-1 sm:grid-cols-2">
            <div><dt className="t-small text-muted-foreground">Sending mailbox</dt>
              <dd className="t-body">{seq.mailbox}{box ? ` · daily limit ${n(box.dailyLimit)}, ${n(box.sentToday)} sent today` : ""}</dd></div>
            <div><dt className="t-small text-muted-foreground">Emails per day from this sequence</dt>
              <dd className="text-sm tabular-nums">{seq.dailyCap === 0 ? "No cap" : n(seq.dailyCap)}</dd></div>
            <div><dt className="t-small text-muted-foreground">Sending schedule</dt>
              <dd className="t-body">{seq.schedule}{schedule ? ` · ${schedule.days.join(", ")} · ${schedule.hours}` : ""}</dd></div>
            <div><dt className="t-small text-muted-foreground">Ruleset</dt>
              <dd className="t-body">{seq.ruleset}{ruleset ? ` · stops on reply · skips ${ruleset.excludeStages.join(", ")}` : ""}</dd></div>
            <div><dt className="t-small text-muted-foreground">Priority among sequences</dt><dd className="t-body">{seq.priority}</dd></div>
            <div><dt className="t-small text-muted-foreground">Open and click tracking</dt>
              <dd className="t-body">{seq.tracking.opens ? "Opens on" : "Opens off"} · {seq.tracking.clicks ? "clicks on" : "clicks off"}</dd></div>
          </dl>
          <p className="t-small pt-2 text-muted-foreground">{seq.owner} and RevOps admins change these.</p>
        </Door>
      </div>
    )
  }

  return (
    <div id="seq-settings">
      <Door id="seq.settings" label="Change sending settings">
        <div className="grid gap-4 py-1 sm:grid-cols-2">
          <div>
            <Label htmlFor="set-mailbox" className="t-label">Sending mailbox</Label>
            <Select value={draft.mailbox} onValueChange={(v) => setDraft({ ...draft, mailbox: v })}>
              <SelectTrigger id="set-mailbox" className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {seed.mailboxes.slice(0, 10).map((m) => <SelectItem key={m.id} value={m.address}>{m.address}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="t-small mt-1 text-muted-foreground">
              {box ? `Daily limit ${n(box.dailyLimit)}, ${n(box.sentToday)} sent today, ${n(Math.max(0, box.sequences.length - 1))} other sequences share this mailbox.` : "No mailbox linked yet."}
              {" "}<FollowLink
                className="underline"
                to="/ollopa/settings/email-sending?row=mail.mailboxes"
                route={`/ollopa/sequences/${seq.id}`} title={h1Of("sequences", seq.name)} anchor="seq.link.mailboxes"
              >Mailboxes and limits (Settings)</FollowLink>
            </p>
          </div>

          <div>
            <Label htmlFor="set-cap" className="t-label">Emails per day from this sequence</Label>
            <Input
              id="set-cap" type="number" min={0} className="mt-1 h-9" value={draft.dailyCap}
              onChange={(e) => setDraft({ ...draft, dailyCap: Number(e.target.value) })}
            />
            <p className="t-small mt-1 text-muted-foreground">
{n(box?.dailyLimit ?? 0)} a day from this mailbox, shared
            </p>
          </div>

          <div>
            <Label htmlFor="set-schedule" className="t-label">Sending schedule</Label>
            <Select value={draft.schedule} onValueChange={(v) => setDraft({ ...draft, schedule: v })}>
              <SelectTrigger id="set-schedule" className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{seed.schedules.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
            <p className="t-small mt-1 text-muted-foreground">
              {schedule ? `${schedule.days.join(", ")} · ${schedule.hours} · ${schedule.timezone}` : ""}
              {session.role === "admin"
                ? <> · <FollowLink
                    className="underline"
                    to="/ollopa/settings/sequences?row=seq.schedules"
                    route={`/ollopa/sequences/${seq.id}`} title={h1Of("sequences", seq.name)} anchor="seq.link.schedules"
                  >New schedule (Settings)</FollowLink></>
                : " · RevOps admins add schedules."}
            </p>
          </div>

          <div>
            {/* The gate sits at the entry to the capability, before any work is done, priced in full. */}
            {savedRulesetsLocked ? (
              <Locked feature="Save as a reusable ruleset" plan="Growth" pricePerMonth={b.plan.seats * growth.pricePerSeat}
                what="Save this sequence's rules as a named ruleset every sequence can pick. The rules below save on every plan.">
                <Button size="sm" variant="outline">Save as a reusable ruleset</Button>
              </Locked>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onSaid("Saved as a reusable ruleset")}>Save as a reusable ruleset</Button>
            )}
            <Label htmlFor="set-ruleset" className="t-label mt-2 block">Ruleset</Label>
            <Select value={draft.ruleset} onValueChange={(v) => setDraft({ ...draft, ruleset: v })}>
              <SelectTrigger id="set-ruleset" className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{seed.rulesets.map((r) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
            <p className="t-small mt-1 text-muted-foreground">
              {ruleset ? `${ruleset.stopOnReply ? "Stops on reply" : "Keeps sending after a reply"} · Skips ${ruleset.excludeStages.join(", ")} · ${ruleset.maxEmailsPerPersonPerDay} email per person per day` : ""}
              {session.role === "admin"
                ? <> · <FollowLink
                    className="underline"
                    to="/ollopa/settings/sequences?row=seq.rulesets"
                    route={`/ollopa/sequences/${seq.id}`} title={h1Of("sequences", seq.name)} anchor="seq.link.rulesets"
                  >Sending rules for every sequence (Settings)</FollowLink></>
                : " · RevOps admins change the shared rulesets."}
            </p>
          </div>

          <div>
            <Label htmlFor="set-priority" className="t-label">Priority among sequences</Label>
            <Select value={draft.priority} onValueChange={(v) => setDraft({ ...draft, priority: v as Sequence["priority"] })}>
              <SelectTrigger id="set-priority" className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <span className="text-xs">Open and click tracking</span>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <Checkbox checked={draft.tracking.opens} onCheckedChange={(v) => setDraft({ ...draft, tracking: { ...draft.tracking, opens: v === true } })} />
                Opens
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={draft.tracking.clicks} onCheckedChange={(v) => setDraft({ ...draft, tracking: { ...draft.tracking, clicks: v === true } })} />
                Clicks
              </label>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-2 pt-2" data-print-hide>
            <Actions
              surface="card"
              items={[
                { kind: "primary", label: "Save", onClick: save },
                { kind: "secondary", label: "Cancel", onClick: () => setDraft({ mailbox: seq.mailbox, rotation: seq.mailboxRotation, dailyCap: seq.dailyCap, schedule: seq.schedule, ruleset: seq.ruleset, priority: seq.priority, tracking: seq.tracking }) },
              ]}
            />
          </div>
        )}
      </Door>
    </div>
  )
}

/* -------------------------------------------------------------------------------- the people */

function SequencePeople({ session, seq, steps, enrollments, filter, q, onSaid, onAdd, pageRenders }: {
  session: Session
  seq: Sequence
  steps: SequenceStep[]
  enrollments: Enrollment[]
  filter: string
  onAdd: () => void
  onSaid: (msg: string) => void
  /** The record owns the search box; this is what it holds. */
  q: string
  /** Development only: the page's render count, shown here where the rows are, for the same check. */
  pageRenders: number
}) {
  const d = useDisclosure("sequences")
  const rowRenders = useRenderCount()
  const seed = seedFor(session.business)
  // What actions took on these people this session — the pane's "Move to …" among them. Opening a
  // pane writes nothing here, so it still does not re-render the page; acting writes one record and
  // the row it was caused on redraws at once (chain rule 8).
  const personEdits = useEdits("person")
  // Keep the ten-second Undo honest while one is on screen.
  useTick(Object.values(personEdits).some(undoable))
  const [selected, setSelected] = useState<string[]>([])
  const [sort, setSort] = usePersisted<{ key: string; dir: "asc" | "desc" }>(`ollopa.seq.people.sort.${session.user}`, { key: "next", dir: "asc" })
  const showMailbox = d.level("seq.settings.mailbox") === 1

  const byId = useMemo(() => new Map(seed.contacts.map((c) => [c.id, c])), [seed])
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return enrollments.filter((e) => {
      const c = byId.get(e.contactId)
      if (filter !== "all" && e.status !== filter) return false
      if (needle && !`${c?.name ?? ""} ${c?.company ?? ""}`.toLowerCase().includes(needle)) return false
      return true
    })
  }, [enrollments, filter, q, byId])

  const stepTitle = (order: number) => steps.find((s) => s.order === order)?.kind ?? "—"

  /**
   * Where an action this session put this person, when it took them out of this sequence: the name
   * of the sequence they are in now, "" when an action took them out of every one, and null when
   * nothing moved them. The row stops claiming a step and a send date the moment that happens.
   */
  const movedOut = (contactId: string): string | null => {
    const next = personEdits[contactId]?.sequence
    if (next === undefined || next === seq.name) return null
    return String(next)
  }

  const columns: Col<Enrollment>[] = [
    {
      key: "name", header: "Name", primary: true,
      sort: (a, b) => (byId.get(a.contactId)?.name ?? "").localeCompare(byId.get(b.contactId)?.name ?? ""),
      cell: (e) => {
        const c = byId.get(e.contactId)
        const edit = personEdits[e.contactId]
        return (
          <div className="min-w-0" data-item={e.contactId} data-item-label={c?.name ?? e.contactId}>
            <span className="flex min-w-0 items-center gap-1.5">
            <FamilyIcon of="person" />
            <button
              type="button"
              className="font-medium hover:underline"
              onClick={(ev) => { ev.stopPropagation(); openPerson(e, ev.currentTarget) }}
            >
              {c?.name ?? e.contactId}
            </button>
            </span>
            <div className="t-small text-muted-foreground">{c?.title}</div>
            {edit?.note && <RowNote kind="person" id={e.contactId} note={String(edit.note)} at={edit.at} />}
          </div>
        )
      },
    },
    { key: "company", header: "Company", phone: true, cell: (e) => byId.get(e.contactId)?.company ?? "—" },
    {
      key: "status", header: "Status", phone: true,
      cell: (e) => {
        const moved = movedOut(e.contactId)
        if (moved !== null) return <Chip status="finished">{moved ? `Moved to ${moved}` : "Taken out of every sequence"}</Chip>
        return (
          <div className="min-w-0">
            <Chip status={e.status} />
            {e.notSentReason && <div className="t-small text-muted-foreground">Not sent · {e.notSentReason.toLowerCase()}</div>}
          </div>
        )
      },
    },
    { key: "step", header: "Step", className: "tabular-nums", sort: (a, b) => a.stepOrder - b.stepOrder, cell: (e) => movedOut(e.contactId) !== null ? "—" : `${e.stepOrder}. ${stepTitle(e.stepOrder)}` },
    {
      key: "next", header: "Next", className: "tabular-nums", sort: (a, b) => (a.nextAt ?? "9").localeCompare(b.nextAt ?? "9"),
      cell: (e) => movedOut(e.contactId) !== null ? "—"
        : e.nextAt ? day(e.nextAt) : e.status === "Replied" ? "Waiting for reply" : e.status === "Paused" ? `Paused by ${seq.owner}` : "—",
    },
    { key: "added", header: "Added", className: "tabular-nums", sort: (a, b) => a.addedAt.localeCompare(b.addedAt), cell: (e) => <div><div>{day(e.addedAt)}</div><div className="t-small text-muted-foreground">by {e.addedBy}</div></div> },
    { key: "activity", header: "Last activity", className: "tabular-nums", cell: (e) => ago(byId.get(e.contactId)?.lastActivity) },
    ...(showMailbox ? [{ key: "mailbox", header: "Mailbox", cell: (e: Enrollment) => e.mailbox } as Col<Enrollment>] : []),
  ]


  // The order on screen, not the order in the data: next and previous in the pane walk what the
  // person is looking at. `DataTable` sorts with the same comparator, so sorting here first and
  // handing the result over leaves every row exactly where it was.
  const shown = useMemo(() => {
    const by = columns.find((c) => c.key === sort.key)?.sort
    if (!by) return rows
    const out = [...rows].sort(by)
    return sort.dir === "desc" ? out.reverse() : out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort.key, sort.dir])

  const ids = shown.map((e) => e.contactId)

  /** A row opens beside the sequence: the sequence stays where it is, and does not re-render. */
  const openPerson = (e: Enrollment, opener?: HTMLElement | null) => {
    const index = ids.indexOf(e.contactId)
    openBeside({
      kind: "person",
      id: e.contactId,
      list: { ids, index: index < 0 ? 0 : index },
      opener: opener ?? (document.activeElement as HTMLElement | null),
    })
  }

  /** The full record, with this sequence and this row kept on the trail. */
  const openPersonPage = (e: Enrollment) => {
    follow(`/ollopa/people/${e.contactId}`, {
      route: `/ollopa/sequences/${seq.id}`,
      title: h1Of("sequences", seq.name),
      anchor: e.contactId,
    })
  }

  const nameOf = (e: Enrollment) => byId.get(e.contactId)?.name ?? e.contactId

  const rowRendersShown = rowRenders

  return (
    <>
      <RenderCount label="rows" count={rowRendersShown} />
      <DataTable<Enrollment>
        rows={shown}
        rowKey={(e) => e.id}
        columns={columns}
        sortKey={sort.key}
        sortDir={sort.dir}
        onSort={(k, dir) => setSort({ key: k, dir })}
        rowActions={[
          {
            label: (e) => (e.status === "Paused" ? "Resume" : "Pause"),
            onClick: (e) => {
              const next = e.status === "Paused" ? "Active" : "Paused"
              engage.patchEnrollment(session.business, e.id, { status: next })
              onSaid(`${nameOf(e)} ${next === "Paused" ? "paused" : "resumed"} in ${seq.name}`)
            },
          },
          ...(rows.some((e) => e.status === "Not sent")
            ? [{ label: () => "Retry", onClick: (e: Enrollment) => { engage.patchEnrollment(session.business, e.id, { status: "Active", notSentReason: null }); onSaid(`${nameOf(e)} verified and retried`) } }]
            : []),
        ]}
        menu={(e) => [
          { label: "Open the person beside this", onClick: () => openPerson(e) },
          { label: "Open the person's page", onClick: () => openPersonPage(e) },
          ...(e.status === "Replied"
            ? [{ label: "Open the reply in Inbox", onClick: () => follow("/ollopa/inbox", { route: `/ollopa/sequences/${seq.id}`, title: h1Of("sequences", seq.name), anchor: e.contactId }) }]
            : []),
          { label: "Mark finished", onClick: () => { engage.patchEnrollment(session.business, e.id, { status: "Finished", nextAt: null }); onSaid(`${nameOf(e)} marked finished`) } },
          ...steps.slice(0, 6).map((s) => ({ label: `Move to step ${s.order}: ${s.kind}`, onClick: () => { engage.patchEnrollment(session.business, e.id, { stepOrder: s.order }); onSaid(`${nameOf(e)} moved to step ${s.order}`) } })),
          {
            label: "Remove from this sequence",
            destructive: true,
            onClick: () => { engage.removeEnrollment(session.business, e.id); onSaid(`${nameOf(e)} removed from ${seq.name}`) },
          },
        ]}
        menuLabel={nameOf}
        onOpen={(e) => openPerson(e)}
        selection={{
          selected, onChange: setSelected,
          bar: (ids) => (
            <>
              <Actions
                surface="card"
                items={[
                  { kind: "secondary", label: "Pause", onClick: () => { ids.forEach((i) => engage.patchEnrollment(session.business, i, { status: "Paused" })); setSelected([]); onSaid(`Paused ${n(ids.length)} people`) } },
                  { kind: "secondary", label: "Resume", onClick: () => { ids.forEach((i) => engage.patchEnrollment(session.business, i, { status: "Active" })); setSelected([]); onSaid(`Resumed ${n(ids.length)} people`) } },
                  { kind: "secondary", label: "Mark finished", onClick: () => { ids.forEach((i) => engage.patchEnrollment(session.business, i, { status: "Finished", nextAt: null })); setSelected([]); onSaid(`${n(ids.length)} marked finished`) } },
                  { kind: "secondary", label: "Export CSV", onClick: () => onSaid(`Exported ${n(ids.length)} people`) },
                  {
                    kind: "destructive",
                    label: `Remove ${n(ids.length)}`,
                    onClick: () => { ids.forEach((i) => engage.removeEnrollment(session.business, i)); setSelected([]); onSaid(`Removed ${n(ids.length)} people`) },
                    irreversible: {
                      title: `Remove ${n(ids.length)} people from ${seq.name}?`,
                      consequence: "Their scheduled emails are deleted. Their replies and activity stay on their records.",
                      confirmLabel: `Remove ${n(ids.length)}`,
                    },
                  },
                ]}
              />
            </>
          ),
        }}
        empty={<EmptyState title="Nobody in this sequence yet" body="Add people, or add them from People and Lists." action={<Button size="sm" onClick={onAdd}>Add people</Button>} />}
      />
    </>
  )
}

/** The by-audience half of the results door, grouped the way the spec groups it. */
function audienceRows(session: Session, enrollments: Enrollment[]) {
  const seed = seedFor(session.business)
  const byId = new Map(seed.contacts.map((c) => [c.id, c]))
  const group = (label: (c: Contact) => string) => {
    const m = new Map<string, { people: number; replied: number }>()
    for (const e of enrollments) {
      const c = byId.get(e.contactId)
      if (!c) continue
      const k = label(c)
      const at = m.get(k) ?? { people: 0, replied: 0 }
      at.people++
      if (e.status === "Replied") at.replied++
      m.set(k, at)
    }
    return [...m.entries()].map(([label, v]) => ({ label, ...v }))
  }
  return [
    ...group((c) => `Seniority: ${c.seniority}`),
    ...group((c) => {
      const co = seed.companies.find((x) => x.id === c.companyId)
      const size = co ? (co.employees < 200 ? "under 200" : co.employees < 1000 ? "200 to 1,000" : "over 1,000") : "unknown"
      return `Company size: ${size}`
    }),
  ].slice(0, 12)
}
