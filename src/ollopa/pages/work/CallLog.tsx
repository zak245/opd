// X-calllog — the call: purpose, disposition, duration, notes, the transcript, the coaching note.
//
// One node with four parents: a task row, the queue body, the contact record and the deal record.
// Flat: no doors inside it. Two modes, read and log — the owner logs the call, and anyone who can
// see the record reads it, which is how a manager coaches without a second surface.
//
// The line above the disposition is the point of the panel: the consequence sits with the control
// that causes it (rules 5 and 7). ollopA has no dialer — the rep dials however they dial and this
// records what happened.
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { follow } from "../../chain"
import { Panel } from "../../ui/Panel"
import { CALL_PURPOSES, DISPOSITIONS, seedFor, TODAY, type Call, type Disposition, type Task } from "../../data/seed"
import type { Session } from "../../session"
import { day, duration, localTime } from "./format"
import { originHere } from "./acts"
import { callsForTask, contactIndex, hasTranscripts } from "./data"

/** The two answers that end the sequence. Everything else lets it continue. */
export const STOPS_SEQUENCE: Disposition[] = ["Connected", "Connected, not interested"]

export interface CallLogProps {
  session: Session
  task: Task
  say: (message: string, undo?: () => void) => void
  /** Called when the call is saved, so the queue can advance and the list can mark the task done. */
  onLogged?: (disposition: Disposition) => void
  /** Running as the queue's body rather than inside a panel: no heading of its own. */
  asBody?: boolean
}

function CoachingNote({ session, call }: { session: Session; call: Call | null }) {
  const note = call?.coachingNote ?? null
  const isManager = session.hasReports || session.role === "admin"
  const [state, setState] = useState(note?.state ?? "suggested")
  const [fields, setFields] = useState({
    wentWell: note?.wentWell ?? "",
    toChange: note?.toChange ?? "",
    oneBehaviour: note?.oneBehaviour ?? "",
  })

  // Nothing reaches the rep until a person accepts it, so an unaccepted draft is not rendered for them.
  if (!isManager && (!note || state !== "accepted")) return null

  return (
    <section className="rounded-md border p-3">
      <h4 className="flex flex-wrap items-center gap-2 text-sm font-medium">
        Coaching note
        {note && <Badge variant="secondary" className="px-1.5 py-0 text-[11px] font-normal">{state}</Badge>}
        {note && <span className="text-xs font-normal text-muted-foreground">{note.author} · {day(note.at)}</span>}
      </h4>
      <div className="space-y-2 pt-2">
        {([
          ["wentWell", "What went well"],
          ["toChange", "What to change"],
          ["oneBehaviour", "One behaviour for next week"],
        ] as const).map(([key, label]) => (
          <div key={key}>
            <label className="text-xs text-muted-foreground" htmlFor={`coach-${key}`}>{label}</label>
            {isManager ? (
              <Textarea
                id={`coach-${key}`} rows={2} className="mt-1" value={fields[key]}
                onChange={(e) => { setFields((f) => ({ ...f, [key]: e.target.value })); setState("edited") }}
              />
            ) : (
              <p className="pt-0.5 text-sm">{fields[key] || "—"}</p>
            )}
          </div>
        ))}
        {isManager && (
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" disabled={state === "accepted"} onClick={() => setState("accepted")}>
              Accept and send to the rep
            </Button>
            <span className="text-xs text-muted-foreground">
              {state === "accepted" ? "The rep sees this on Home and in the daily digest." : "Nothing reaches the rep until you accept it."}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

export function CallLogBody({ session, task, say, onLogged, asBody }: CallLogProps) {
  const seed = seedFor(session.business)
  const contact = contactIndex(session.business)(task.contactId)
  // A call belongs to a task that has been worked. An open task has not been dialled yet, so the
  // panel opens in log mode with an empty form rather than replaying somebody else's call.
  const earlier = task.status === "Done" ? callsForTask(session.business, task.id) : []
  const existing = earlier[0] ?? null
  const mine = !existing || existing.loggedBy === session.user
  const first = task.contact.split(" ")[0]

  const [purpose, setPurpose] = useState<string>(existing?.purpose ?? (task.step ? "Follow-up" : "Cold call"))
  const [disposition, setDisposition] = useState<Disposition | "">(existing?.disposition ?? "")
  const [notes, setNotes] = useState(existing?.notes ?? "")
  const [seconds, setSeconds] = useState(existing?.durationSec ?? 0)
  const [running, setRunning] = useState(!existing)
  const [manual, setManual] = useState(false)
  const tick = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!running || manual) return
    tick.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(tick.current)
  }, [running, manual])

  const stops = disposition !== "" && STOPS_SEQUENCE.includes(disposition)

  if (!mine) {
    // Read mode: the same record, without the controls that would change somebody else's call.
    return (
      <div className="space-y-4">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Logged by</dt><dd>{existing.loggedBy} · {day(existing.startedAt.slice(0, 10))}</dd>
          <dt className="text-muted-foreground">Purpose</dt><dd>{existing.purpose}</dd>
          <dt className="text-muted-foreground">Disposition</dt><dd>{existing.disposition}</dd>
          <dt className="text-muted-foreground">Duration</dt><dd className="tabular-nums">{duration(existing.durationSec)}</dd>
        </dl>
        <div>
          <div className="text-xs text-muted-foreground">Notes</div>
          <p className="pt-0.5 text-sm">{existing.notes}</p>
        </div>
        {existing.transcript && (
          <div>
            <div className="text-xs text-muted-foreground">Transcript · from {seed.integrations[0]?.name ?? "the connected recorder"}</div>
            <p className="mt-1 whitespace-pre-line rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground">{existing.transcript}</p>
          </div>
        )}
        <CoachingNote session={session} call={existing} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* The number and its screening state: calling a flagged person is a compliance consequence.
          The queue already carries the contact above this block, so it is not repeated there. */}
      <div className={asBody ? "hidden" : "rounded-md border p-3"}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-medium">{task.contact}</span>
          <span className="text-sm text-muted-foreground">{contact?.title} · {task.company}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-sm">
          <span className="font-mono">{contact?.phoneNumber ?? "No number on file"}</span>
          {contact?.doNotCall && (
            <span className="rounded border border-destructive px-1.5 py-0.5 text-xs text-destructive">
              Do not call · {contact.doNotCallSource} · checked {day(contact.dncCheckedOn)}
            </span>
          )}
          {contact?.tz && <span className="text-muted-foreground">{localTime(contact.tz)} their time</span>}
        </div>
      </div>

      <label className="block text-xs text-muted-foreground">
        Purpose
        <Select value={purpose} onValueChange={setPurpose}>
          <SelectTrigger className="mt-1 h-8 w-full sm:w-64" aria-label="Why you are calling"><SelectValue /></SelectTrigger>
          <SelectContent>{CALL_PURPOSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        {task.step && <span className="mt-1 block text-xs text-muted-foreground">From the sequence: step {task.step.n} of {task.step.of} · {task.step.title}</span>}
      </label>

      <div>
        {/* Never behind anything: what each answer does to the sequence, above the control. */}
        <p className="text-xs text-muted-foreground">
          Connected and Connected, not interested stop this sequence for {first}. The others let it continue.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1.5" role="group" aria-label="Disposition">
          {DISPOSITIONS.map((d) => (
            <Button key={d} size="sm" variant={disposition === d ? "default" : "outline"} className="h-7 text-xs" onClick={() => setDisposition(d)}>
              {d}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-muted-foreground">
          Duration
          <Input
            className="mt-1 h-8 w-28 tabular-nums"
            aria-label="Call duration in seconds"
            value={manual ? String(seconds) : duration(seconds)}
            onFocus={() => { setManual(true); setRunning(false) }}
            onChange={(e) => setSeconds(Number(e.target.value.replace(/\D/g, "")) || 0)}
          />
        </label>
        {!manual && (
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => setRunning((v) => !v)}>
            {running ? "Pause the timer" : "Start the timer"}
          </Button>
        )}
      </div>

      <label className="block text-xs text-muted-foreground">
        Notes
        <Textarea className="mt-1" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What was said, and what happens next" />
      </label>

      {hasTranscripts(session.business) && (
        <div>
          <div className="text-xs text-muted-foreground">Transcript · from {seed.integrations[0]?.name ?? "the connected recorder"}</div>
          <p className="mt-1 rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground">
            The transcript attaches here when the recorder finishes. Nothing is written to the contact from it without you.
          </p>
        </div>
      )}

      <CoachingNote session={session} call={existing} />

      <div className="flex flex-wrap items-center gap-3 border-t pt-3">
        <Button size="sm" disabled={disposition === ""} onClick={() => {
          if (disposition === "") return
          say(
            `Call logged with ${task.contact}: ${disposition}. ${stops ? `The sequence stops for ${first}.` : "The sequence continues."}`,
          )
          onLogged?.(disposition)
        }}>
          Save the call
        </Button>
        {disposition !== "" && (
          <span className="text-xs text-muted-foreground">
            {stops ? `Ends “${task.sequence ?? "the sequence"}” for ${first}` : `${first} stays in “${task.sequence ?? "the sequence"}”`} · logs the call on {task.contact}
          </span>
        )}
        {/* A panel may open a page; it never opens a pane beside itself. The trail keeps this
            call and the row it was logged from, so the crumb comes back to both. */}
        <button
          type="button"
          className="ml-auto text-xs underline underline-offset-4"
          onClick={() => follow(`/ollopa/people/${task.contactId}`, originHere(task.contactId))}
        >
          Open contact
        </button>
      </div>
      <p className="text-xs text-muted-foreground">ollopA does not dial. You dial, and this is where what happened is kept — {day(TODAY)}.</p>
    </div>
  )
}

export function CallLogPanel(p: CallLogProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { open, onOpenChange, ...rest } = p
  return (
    <Panel id="x-calllog" title={`Call with ${p.task.contact} · ${p.task.company}`} open={open} onOpenChange={onOpenChange}>
      <CallLogBody {...rest} />
    </Panel>
  )
}
