// `X-play`: run a risk or expansion play. Opened from an Accounts row and from the company record.
//
// Flat, no doors. Running a play creates tasks and a note and cannot be taken back, so what it will
// create is the consequence inside its own confirmation and the affirmative carries the verb
// (DESIGN.md §2) — not a paragraph above the button. Agent-drafted content is logged where the CSM
// can see it and marked as a draft; the click sends nothing.
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Actions } from "../../ui/Actions"
import { Panel } from "../../ui/Panel"
import { TODAY } from "../../data/seed"
import { day, money } from "./format"
import type { CompanyView } from "./data"

export interface PlayChoice {
  name: string
  /** Why this play is offered for this account, in the object's own words. */
  why: string
  kind: "risk" | "expansion"
  tasks: number
}

/** Chosen from the open risk's type and the newest signal's kind, never from what was run last week. */
export function playsFor(v: CompanyView): PlayChoice[] {
  const a = v.account
  if (!a) return []
  const out: PlayChoice[] = []
  for (const risk of a.risks.filter((r) => !r.resolved)) {
    out.push({ name: `${risk.type}, ${a.band} band`, why: risk.note, kind: "risk", tasks: risk.type === "Churn notice" ? 4 : 3 })
  }
  for (const s of a.signals.filter((x) => !x.dismissed).slice(0, 2)) {
    out.push({ name: s.kind, why: s.detail, kind: "expansion", tasks: 2 })
  }
  if (out.length === 0) out.push({ name: "Business review", why: `Last touch ${day(a.lastTouch)}.`, kind: "risk", tasks: 3 })
  return out
}

/** Settings › Signals, scoring and personas owns the bands; the panel reads them and says so. */
const ROUTING = { threshold: 25_000, slaHours: 48 }

export function PlayPanel({ open, onOpenChange, view, user, currency, onRun }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  view: CompanyView | null
  user: string
  currency: string
  onRun: (summary: string) => void
}) {
  const choices = useMemo(() => (view ? playsFor(view) : []), [view])
  const [name, setName] = useState("")
  const [owner, setOwner] = useState(user)
  const [recheck, setRecheck] = useState(() => new Date(Date.parse(TODAY) + 14 * 86_400_000).toISOString().slice(0, 10))
  const [note, setNote] = useState("")

  const play = choices.find((c) => c.name === name) ?? choices[0]
  const account = view?.account
  if (!view || !account || !play) return null

  const value = account.value
  const band = value >= ROUTING.threshold ? "the account executive of record" : "the account owner"
  const creates = `Creates ${play.tasks} task${play.tasks === 1 ? "" : "s"} for ${owner === user ? "you" : owner}, a note on ${account.name}, and emails nobody.`
  const routing = play.kind === "expansion"
    ? `An expansion worth ${money(value, currency)} routes to ${band}, due within ${ROUTING.slaHours} hours.`
    : null

  return (
    <Panel
      id="run-a-play"
      title={`Run a play on ${account.name}`}
      open={open}
      onOpenChange={onOpenChange}
      footer={
        <Actions
          surface="dialog"
          layout="stack"
          items={[{
            kind: "primary",
            label: `Run the play · ${play.tasks} tasks, 0 emails`,
            onClick: () => {
              onRun(`${play.name} · ${play.tasks} tasks for ${owner}, a note on ${account.name}, recheck ${day(recheck)}`)
              onOpenChange(false)
            },
            irreversible: {
              title: `Run ${play.name} on ${account.name}?`,
              consequence: `${creates}${routing ? ` ${routing}` : ""}`,
              confirmLabel: `Run the play · ${play.tasks} tasks, 0 emails`,
            },
          }]}
        />
      }
    >
      <div className="space-y-4 t-body">
        <div>
          <Label htmlFor="play-name" className="t-small">The play</Label>
          <Select value={play.name} onValueChange={setName}>
            <SelectTrigger id="play-name" className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{choices.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="play-owner" className="t-small">Owner</Label>
          <Input id="play-owner" className="mt-1" value={owner} onChange={(e) => setOwner(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="play-recheck" className="t-small">Recheck on</Label>
          <Input id="play-recheck" type="date" className="mt-1" value={recheck} onChange={(e) => setRecheck(e.target.value)} />
        </div>

        <div className="surface-raised rounded-md border p-2">
          <div className="t-label">The agent's draft note <span className="font-normal text-muted-foreground">· draft, logged, not sent</span></div>
          <p className="mt-1 t-small text-muted-foreground">
            {play.kind === "expansion"
              ? `${account.name} is at ${Math.round((account.seatsActive / account.seatsBought) * 100)}% seat utilisation. Suggest the next seat block at the ${account.plan} price before renewal on ${day(account.renewal)}.`
              : `${account.name} is in the ${account.band} band. Book a review with ${account.champion} and agree what changes before ${day(account.renewal)}.`}
          </p>
          <Actions
            className="mt-1"
            surface="card"
            items={[{
              kind: "secondary", label: "Use this draft",
              onClick: () => setNote(play.kind === "expansion"
                ? `Seat utilisation at ${Math.round((account.seatsActive / account.seatsBought) * 100)}%. Propose the next block before ${day(account.renewal)}.`
                : `${account.band} band. Review booked with ${account.champion}.`),
            }]}
          />
        </div>

        <div>
          <Label htmlFor="play-note" className="t-small">Your note on the account</Label>
          <Textarea id="play-note" rows={3} className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What you are doing and why" />
        </div>
      </div>
    </Panel>
  )
}
