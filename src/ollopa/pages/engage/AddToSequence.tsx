// Enrolling people in a sequence (`X-enrol`), from Lists, from a list record and from the sequence's
// own "Add people". One panel, three blocks, wherever the route came from, because the capacity
// picture is not something a person should meet on one route and not the other (spec 05 §3.4).
//
//   1. who is being added, and who is skipped, by reason — before anything is committed
//   2. the mailbox, with its capacity beside it, and the sequence's rotation default
//   3. the day-one volume, because "added" and "sent" are not the same number
//
// The credits line and the already-in-another-sequence count sit above all three and never move:
// they are the consequences of the click (rule 7). The button repeats the count.
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Panel } from "../../ui/Panel"
import { ConsequenceLine } from "../../ui/ConsequenceLine"
import { seedFor, TODAY, type Contact, type Enrollment, type Sequence } from "../../data/seed"
import type { Business } from "../../usage/model"
import { engage } from "./store"
import { alreadyInASequence, enrolCredits, splitForEnrol } from "./facts"
import { n, toast } from "./shared"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function nextWorkingDayAfterTomorrow(): string {
  const d = new Date(Date.parse(TODAY) + 2 * 86_400_000)
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1)
  return DAYS[d.getUTCDay()]
}

export interface AddToSequenceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: Business
  user: string
  /** Everyone the route picked: a list's members, a selection, or the people a search found. */
  people: Contact[]
  sequences: Sequence[]
  defaultSequenceId?: string
  /** Named on the panel so a person knows what they are acting on. */
  from: string
  /** The sequence is fixed when the panel opens from the sequence's own page. */
  lockSequence?: boolean
}

export function AddToSequencePanel(p: AddToSequenceProps) {
  const seed = seedFor(p.business)
  const [target, setTarget] = useState(p.defaultSequenceId ?? p.sequences[0]?.id ?? "")
  const seq = p.sequences.find((s) => s.id === target) ?? p.sequences[0]
  const [mailboxChoice, setMailboxChoice] = useState<string>("default")

  const split = useMemo(() => splitForEnrol(p.people, seq?.name), [p.people, seq])

  const byReason = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of split.skipped) m.set(s.why, (m.get(s.why) ?? 0) + 1)
    return [...m.entries()]
  }, [split.skipped])

  const credits = enrolCredits(split.adding)
  const doubled = alreadyInASequence(split.adding, seq?.name).length

  const rotation = seq?.mailboxRotation?.length ? seq.mailboxRotation : seq ? [seq.mailbox] : []
  const boxes = seed.mailboxes.filter((m) => rotation.includes(m.address))
  const roomToday = boxes.reduce((sum, m) => sum + Math.max(0, m.dailyLimit - m.sentToday), 0)
  const cap = Math.min(seq?.dailyCap ?? roomToday, roomToday || (seq?.dailyCap ?? 0))
  const dayOne = Math.min(split.adding.length, cap)

  const add = () => {
    if (!seq) return
    const rows: Enrollment[] = split.adding.map((c, i) => ({
      id: `enr-new-${seq.id}-${c.id}-${i}`, sequenceId: seq.id, contactId: c.id, status: "Active",
      stepOrder: 1, nextAt: TODAY, addedAt: TODAY, addedBy: p.user,
      mailbox: mailboxChoice === "default" ? seq.mailbox : mailboxChoice, notSentReason: null,
    }))
    engage.addEnrollments(p.business, rows)
    engage.patchSequence(p.business, seq.id, { active: seq.active + rows.length })
    engage.logChange(p.business, seq.id, p.user, `Added ${n(rows.length)} people from ${p.from}`)
    toast(`Added ${n(rows.length)} people to ${seq.name} · ${credits} credits`)
    p.onOpenChange(false)
  }

  return (
    <Panel
      id="enrol"
      title={`Add people to a sequence · from ${p.from}`}
      open={p.open}
      onOpenChange={p.onOpenChange}
      footer={
        <Button className="w-full" disabled={!seq || split.adding.length === 0} onClick={add}>
          Add {n(split.adding.length)} {split.adding.length === 1 ? "person" : "people"}
          {credits > 0 ? ` · ${n(credits)} credits` : ""}
        </Button>
      }
    >
      {/* The consequences of the click, above everything, whatever the panel is set to. */}
      <div className="rounded-md border p-3">
        <ConsequenceLine
          sends={split.adding.length}
          to={p.from}
          from={mailboxChoice === "default" ? seq?.mailbox : mailboxChoice}
          credits={credits}
          changes="Replies land in your Inbox"
        />
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">
          {n(credits)} net-new emails = {n(credits)} credits · balance {n(seed.credits.balance)}
        </p>
        {doubled > 0 && (
          <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400" role="status">
            {n(doubled)} already in another sequence. Adding them doubles their outreach.
          </p>
        )}
      </div>

      {!p.lockSequence && (
        <div className="mt-4">
          <Label htmlFor="enrol-seq" className="text-xs">Sequence</Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger id="enrol-seq" className="mt-1 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {p.sequences.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} · {s.status}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 1 — who is added, who is skipped, by reason */}
      <div className="mt-4 border-t pt-4">
        <p className="text-sm">
          {n(split.adding.length)} will be added
          {split.skipped.length > 0 && <> · {n(split.skipped.length)} skipped: {byReason.map(([why, count]) => `${n(count)} ${why}`).join(", ")}</>}
        </p>
        {split.skipped.length > 0 && (
          <ul className="mt-2 max-h-40 space-y-0.5 overflow-y-auto text-xs text-muted-foreground">
            {split.skipped.slice(0, 40).map((s) => <li key={s.contact.id}>{s.contact.name} · {s.why}</li>)}
          </ul>
        )}
      </div>

      {/* 2 — the mailbox, with its capacity beside it, and the sequence's own rotation default */}
      <div className="mt-4 border-t pt-4">
        <Label htmlFor="enrol-mailbox" className="text-xs">Send from</Label>
        <Select value={mailboxChoice} onValueChange={setMailboxChoice}>
          <SelectTrigger id="enrol-mailbox" className="mt-1 w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">
              {rotation.length > 1 ? `Sequence default: rotate across ${rotation.length} mailboxes` : `Sequence default: ${seq?.mailbox}`}
            </SelectItem>
            {seed.mailboxes.slice(0, 8).map((m) => (
              <SelectItem key={m.id} value={m.address}>
                {m.address} · daily limit {m.dailyLimit} · {m.sentToday} sent today
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
          {boxes.map((m) => (
            <li key={m.id}>
              {m.address} · daily limit {m.dailyLimit} · {m.sentToday} sent today · shared with {m.sequences.length} {m.sequences.length === 1 ? "sequence" : "sequences"}
            </li>
          ))}
        </ul>
        <p className="mt-1 text-xs text-muted-foreground">
          A change here applies to this batch only. The sequence keeps its own setting.
        </p>
      </div>

      {/* 3 — the day-one volume: added and sent are not the same number */}
      <div className="mt-4 border-t pt-4 text-sm">
        {n(split.adding.length)} added · {n(dayOne)} can send tomorrow from {boxes.length || 1} {boxes.length === 1 ? "mailbox" : "mailboxes"}
        {split.adding.length > dayOne && <> · the rest start {nextWorkingDayAfterTomorrow()}</>}
      </div>
    </Panel>
  )
}
