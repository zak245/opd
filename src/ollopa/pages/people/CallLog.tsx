// X-calllog, opened from a call item in the contact record's timeline (IA-MAP part 3, `R-person`).
//
// One node with two parents: the console's body inside the task queue, and a panel in its own right
// when it is reached from a task row or a record. Reached from the timeline it opens in read mode —
// anyone who can see the record may read the call — and the person who logged it may still correct
// it. A sales leader (an AE seat with direct reports) writes the coaching note inside the call, which
// is where the call is, rather than somewhere the call has to be found again.
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Panel } from "../../ui/Panel"
import { toast } from "../../templates/TablePage"
import type { Call, Seed } from "../../data/seed"
import type { Session } from "../../session"
import { day } from "./person"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

function minutes(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${String(s).padStart(2, "0")}s`
}

export function CallLog({ call, seed, session, onOpenChange }: {
  call: Call | null
  seed: Seed
  session: Session
  onOpenChange: (open: boolean) => void
}) {
  const [note, setNote] = useState("")
  const [written, setWritten] = useState<string | null>(null)
  if (!call) return null

  const mine = call.loggedBy === session.user
  const canCoach = session.role === "ae" && session.hasReports
  const existing = call.coachingNote ?? seed.coachingNotes.find((n) => n.callId === call.id) ?? null
  const task = seed.tasks.find((t) => t.id === call.taskId)

  return (
    <Panel id="x-calllog" title={`Call with ${call.contact}`} open={Boolean(call)} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-1.5">
          <dt className="text-xs text-muted-foreground">Purpose</dt><dd>{call.purpose}</dd>
          <dt className="text-xs text-muted-foreground">Disposition</dt><dd>{call.disposition}</dd>
          <dt className="text-xs text-muted-foreground">Duration</dt><dd className="tabular-nums">{minutes(call.durationSec)}</dd>
          <dt className="text-xs text-muted-foreground">When</dt><dd>{day(call.startedAt)} · {call.startedAt.slice(11, 16)}</dd>
          <dt className="text-xs text-muted-foreground">Logged by</dt><dd>{call.loggedBy}{mine ? " (you)" : ""}</dd>
          {task && <><dt className="text-xs text-muted-foreground">From task</dt><dd>{task.title}</dd></>}
          <dt className="text-xs text-muted-foreground">Sequence</dt>
          <dd>{call.advancedSequence ? "Advanced to the next step" : "Did not advance the sequence"}</dd>
        </dl>

        <section>
          <h4 className="pb-1 text-xs font-medium text-muted-foreground">Notes</h4>
          <p className="whitespace-pre-line">{call.notes || "Nothing was written down."}</p>
        </section>

        {/* A transcript where an integration supplied one, and nothing pretending to be one where it did not. */}
        <section>
          <h4 className="pb-1 text-xs font-medium text-muted-foreground">Transcript</h4>
          {call.transcript ? (
            <Card className="py-3"><CardContent className="px-3"><p className="whitespace-pre-line text-muted-foreground">{call.transcript}</p></CardContent></Card>
          ) : (
            <p className="text-muted-foreground">No recording integration supplied a transcript for this call.</p>
          )}
        </section>

        <Separator />
        <section>
          <h4 className="pb-1 text-xs font-medium text-muted-foreground">Coaching note</h4>
          {existing && !written ? (
            <div className="space-y-1">
              <p><span className="text-muted-foreground">Went well: </span>{existing.wentWell}</p>
              <p><span className="text-muted-foreground">To change: </span>{existing.toChange}</p>
              <p><span className="text-muted-foreground">One behaviour: </span>{existing.oneBehaviour}</p>
              <p className="text-xs text-muted-foreground">{existing.author} · {day(existing.at)}</p>
            </div>
          ) : written ? (
            <p>{written} <span className="text-xs text-muted-foreground">· {session.user} · {day(call.startedAt)}</span></p>
          ) : canCoach ? (
            <div className="space-y-2">
              <Textarea
                aria-label="Coaching note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What went well, what to change, and the one behaviour for the next call"
              />
              <Button
                size="sm"
                disabled={!note.trim()}
                onClick={() => { setWritten(note.trim()); setNote(""); toast(`Coaching note saved on the call with ${call.contact}.`) }}
              >
                Save the coaching note
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Coaching notes are written by the person's sales manager. Nobody has written one on this call.
            </p>
          )}
        </section>
      </div>
    </Panel>
  )
}
