// One item waiting for a decision.
//
// Everything a person needs to decide is on the item: who did it, what it will do, from which mailbox,
// what it costs, how long it has left, and whose item it is. The draft, the research or the evidence
// behind it is one door under it (rule 5: the consequence never sits behind the door it belongs to).
// "Edit then approve" replaces the door's read content in place — it is a state of the door, not a
// second channel, so the depth is still the door and nothing more (IA-MAP §6.5).
import { useEffect, useRef, useState } from "react"
import { Bot, Clock, MoreHorizontal, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { href } from "@/app/router"
import { ConsequenceLine, consequenceText } from "../../ui/ConsequenceLine"
import { Door, useDoorState } from "../../ui/Door"
import { TODAY, type AgentEvent, type Seed } from "../../data/seed"
import type { Session } from "../../session"
import { day } from "../deal/format"
import {
  EXPIRY_DAYS, consequenceFor, daysLeft, mailboxFor, mailboxPaused, nearExpiry, overSecondApproval,
  queueOwner, stageForecast, type RuleFlags,
} from "./model"

export interface WaitingItemProps {
  /** Which of the case's six rules have landed. Every flag is true in the product. */
  rules: RuleFlags
  event: AgentEvent
  seed: Seed
  session: Session
  currency: string
  admin: { user: string; title: string } | null
  /** The seat may act on somebody else's item, and the ledger says so when it does. */
  canApproveForOthers: boolean
  /** "Select several" is level one only where people clear items in bulk. */
  selectable: boolean
  selected: boolean
  onSelect: (on: boolean) => void
  read: boolean
  onRead: () => void
  draft: string
  onDraft: (text: string) => void
  onApprove: (opts?: { edited?: boolean }) => void
  onDecline: (note?: string) => void
  onSnooze: () => void
  onHand: (to: string) => void
  focused: boolean
  index: number
}

/** The label a door earns from what is behind it. Never "More", "Details" or "Preview". */
function doorLabel(e: AgentEvent, draft: string): string {
  const action = e.ifApproved?.action
  if (action === "stage") return `Why this stage · the quote, the deal today and the forecast`
  if (action === "enrol") return `The ${(e.ifApproved?.recipients ?? 0).toLocaleString()} people, the sequence and the mailbox`
  const words = draft.trim().split(/\s+/).filter(Boolean).length
  return `Read the draft · ${words} words · ${e.inputs.length} inputs`
}

export function WaitingItem(p: WaitingItemProps) {
  const { event: e, seed, session, currency, rules } = p
  const [editing, setEditing] = useState(false)
  const [asking, setAsking] = useState<null | "why" | "hand" | "snooze">(null)
  const [why, setWhy] = useState("")
  const [mate, setMate] = useState("")
  const [failure, setFailure] = useState<string | null>(null)
  const box = useRef<HTMLLIElement>(null)
  const [, openDoor] = useDoorState(`agents.item.${e.id}`)

  const owner = queueOwner(e)
  const mine = owner === session.user
  const mailbox = mailboxFor(e, seed)
  const paused = mailboxPaused(owner, seed)
  const consequence = consequenceFor(e, seed, currency)
  const hasConsequence = consequenceText(consequence) !== ""
  const second = overSecondApproval(e, seed)
  const left = daysLeft(e)
  const forecast = stageForecast(e, seed, currency)
  const remote = e.surface === "mcp" || e.surface === "cli"
  const teammates = seed.users.filter((u) => u.seat && u.name !== session.user).slice(0, 8)

  // Read once: the person opened it, or it went past their eyes. Both count, neither is assumed.
  const onRead = useRef(p.onRead)
  onRead.current = p.onRead
  useEffect(() => {
    const el = box.current
    if (!el || p.read) return
    const io = new IntersectionObserver((rows) => { if (rows.some((r) => r.intersectionRatio > 0.6)) onRead.current() }, { threshold: [0.6] })
    io.observe(el)
    return () => io.disconnect()
  }, [p.read])

  useEffect(() => { if (p.focused) box.current?.focus() }, [p.focused])

  const approve = (opts?: { edited?: boolean }) => {
    if (paused) { setFailure(`Nothing was sent. ${paused}`); return }
    setFailure(null)
    p.onApprove(opts)
  }

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label={`More actions for ${e.summary}`}>
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onSelect={() => approve()}>Approve<DropdownMenuShortcut>a</DropdownMenuShortcut></DropdownMenuItem>
        <DropdownMenuItem onSelect={() => p.onDecline()}>Decline<DropdownMenuShortcut>d</DropdownMenuShortcut></DropdownMenuItem>
        {e.ifApproved?.action === "send" && (
          <DropdownMenuItem onSelect={() => { openDoor(true); setEditing(true) }}>Edit then approve<DropdownMenuShortcut>e</DropdownMenuShortcut></DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => setAsking("why")}>Tell the agent why</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setAsking("snooze")}>Decide tomorrow</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setAsking("hand")}>Hand to a teammate</DropdownMenuItem>
        {e.contactId && <DropdownMenuItem asChild><a href={href(`/ollopa/people/${e.contactId}`)}>Open the contact<DropdownMenuShortcut>↵</DropdownMenuShortcut></a></DropdownMenuItem>}
        <DropdownMenuItem onSelect={() => { void navigator.clipboard?.writeText(`${location.origin}${location.pathname}#/ollopa/agents?event=${e.id}`); document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: "Link copied." })) }}>
          Copy a link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <li
      ref={box}
      tabIndex={-1}
      data-queue-item={p.index}
      data-item={`wait.item.${e.id}`}
      data-item-label={e.summary}
      data-container={`item.${e.id}`}
      data-container-label="the item"
      className={cn("rounded-lg border bg-card", p.focused && "ring-2 ring-ring")}
    >
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start sm:p-4">
        {p.selectable && (
          <Checkbox
            className="mt-1 shrink-0"
            checked={p.selected}
            onCheckedChange={(v) => p.onSelect(v === true)}
            aria-label={`Select: ${e.summary}`}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {/* Rule 4: every item starts with the name of the actor that produced it. */}
            {rules.r4 && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                {remote ? <Terminal className="size-3.5 text-muted-foreground" aria-hidden="true" /> : <Bot className="size-3.5 text-muted-foreground" aria-hidden="true" />}
                {remote ? e.actorUser : e.agent}
              </span>
            )}
            <span className="min-w-0 text-sm">
              {forecast ? `Proposes moving ${forecast.company} from ${forecast.from} to ${forecast.to}` : e.summary}
            </span>
          </div>

          {/* What happens if you say yes. Beside Approve, never behind the door (rule 5). */}
          {rules.r5 && hasConsequence && (
            <div data-item={`wait.consequence.${e.id}`} data-item-label="What happens if you approve">
              <ConsequenceLine {...consequence} className="mt-1.5 text-[13px] text-foreground" />
            </div>
          )}

          {forecast && (
            <p className="mt-1 text-xs text-muted-foreground">
              Today: {forecast.from} · {forecast.fromProbability}% · {forecast.fromCategory}. If approved: {forecast.to} · {forecast.toProbability}% · {forecast.toCategory}.
            </p>
          )}
          {forecast && e.sourceQuote && <p className="mt-1 text-xs italic text-muted-foreground">{e.sourceQuote}</p>}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="size-3" aria-hidden="true" />Waiting since {day(e.when)} {e.at}</span>
            {!mine && (
              <span>{owner}’s item.{p.canApproveForOthers ? ` You can approve for ${owner.split(" ")[0]}.` : ""}</span>
            )}
            {nearExpiry(e) && left !== null && (
              <span className="font-medium text-amber-700 dark:text-amber-400">Expires in {left} {left === 1 ? "day" : "days"} · nothing will be sent</span>
            )}
            {!nearExpiry(e) && left !== null && <span>Declined after {EXPIRY_DAYS} days if nobody decides</span>}
            {e.surface !== "app" && <span>{e.surface === "mcp" ? "Asked through an MCP client" : e.surface === "cli" ? "Asked from the terminal" : `From ${e.surface}`}</span>}
          </div>

          {second && (
            <p className="mt-2 rounded-md bg-muted px-2 py-1.5 text-xs">
              {e.status === "waiting-second" ? (
                <>
                  {owner} approved this at {e.at}. Waiting for {adminLine(p)} · {(e.ifApproved?.recipients ?? 0).toLocaleString()} recipients, over the {seed.secondApproval.recipients.toLocaleString()} in Settings. Nothing has been sent.
                </>
              ) : (
                <>
                  {(e.ifApproved?.recipients ?? 0).toLocaleString()} recipients. Over the {seed.secondApproval.recipients.toLocaleString()} in Settings, so {adminLine(p)} approves after you.
                </>
              )}
            </p>
          )}

          {paused && (
            <p className="mt-2 text-xs text-destructive">{mailbox} is paused. {paused}. Approving holds this item until it resumes.</p>
          )}
        </div>

        <div className="flex w-full shrink-0 items-center gap-1.5 sm:w-auto">
          {/* An approval already given is removed, never greyed: the line above says who it waits for. */}
          {(e.status !== "waiting-second" || p.canApproveForOthers) && (
            <Button data-item={`wait.approve.${e.id}`} data-item-label="Approve" size="sm" className="flex-1 sm:flex-none" onClick={() => approve()}>
              {e.status === "waiting-second" ? "Approve as the second" : "Approve"}
            </Button>
          )}
          <Button data-item={`wait.decline.${e.id}`} data-item-label="Decline" size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => p.onDecline()}>Decline</Button>
          {menu}
        </div>
      </div>

      {failure && <p role="status" className="px-4 pb-2 text-xs text-destructive">{failure}</p>}

      {asking === "why" && (
        <div className="border-t px-4 py-3">
          <label className="text-xs text-muted-foreground" htmlFor={`why-${e.id}`}>Tell the agent why. Declining sends this and nothing else happens.</label>
          <Textarea id={`why-${e.id}`} value={why} onChange={(ev) => setWhy(ev.target.value)} rows={2} className="mt-1" placeholder="Wrong person: she left in July." />
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={() => { p.onDecline(why); setAsking(null) }}>Decline and tell the agent</Button>
            <Button size="sm" variant="ghost" onClick={() => setAsking(null)}>Keep waiting</Button>
          </div>
        </div>
      )}

      {asking === "hand" && (
        <div className="border-t px-4 py-3">
          <label className="text-xs text-muted-foreground">Hand the decision to a teammate. It leaves your queue and they are told.</label>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Select value={mate} onValueChange={setMate}>
              <SelectTrigger className="h-8 w-56" aria-label="Teammate"><SelectValue placeholder="Choose a teammate" /></SelectTrigger>
              <SelectContent>{teammates.map((u) => <SelectItem key={u.id} value={u.name}>{u.name} · {u.title}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="sm" disabled={!mate} onClick={() => { p.onHand(mate); setAsking(null) }}>Hand it over</Button>
            <Button size="sm" variant="ghost" onClick={() => setAsking(null)}>Keep it</Button>
          </div>
        </div>
      )}

      {asking === "snooze" && (
        <div className="border-t px-4 py-3 text-xs">
          {sendsBeforeTomorrow(e) ? (
            <>
              <p>This sends before tomorrow 08:00, so deciding tomorrow declines it. Nothing would be sent.</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { p.onDecline("Not decided in time"); setAsking(null) }}>Decline it instead</Button>
                <Button size="sm" variant="ghost" onClick={() => setAsking(null)}>Keep waiting</Button>
              </div>
            </>
          ) : (
            <>
              <p>It moves to the bottom of the queue and comes back tomorrow at 08:00. Nothing is sent meanwhile.</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => { p.onSnooze(); setAsking(null) }}>Decide tomorrow</Button>
                <Button size="sm" variant="ghost" onClick={() => setAsking(null)}>Keep it here</Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Level two: what it was built from, and the thing itself. One door, never two. */}
      <div className="border-t px-1">
        <Door id={`agents.item.${e.id}`} label={rules.r4 ? doorLabel(e, p.draft) : "Preview"}>
          {!rules.r5 && hasConsequence && (
            <div data-item={`wait.consequence.${e.id}`} data-item-label="What happens if you approve">
              <ConsequenceLine {...consequence} className="mb-2 text-[13px] text-foreground" />
            </div>
          )}
          {editing ? (
            /* X-agent-edit: the read content is replaced, in place. */
            <div>
              <label className="text-xs text-muted-foreground" htmlFor={`draft-${e.id}`}>Edit the draft, then send it.</label>
              <Textarea id={`draft-${e.id}`} value={p.draft} onChange={(ev) => p.onDraft(ev.target.value)} rows={10} className="mt-1 font-mono text-xs" />
              <ConsequenceLine {...consequence} className="mt-2" />
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => { setEditing(false); approve({ edited: true }) }}>Send edited draft</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Back to the draft</Button>
              </div>
            </div>
          ) : e.ifApproved?.action === "stage" ? (
            <div className="grid gap-2">
              {e.sourceQuote && <p className="italic">{e.sourceQuote}</p>}
              {forecast && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  <dt className="text-muted-foreground">The deal today</dt><dd>{forecast.company} · {forecast.from} · {forecast.fromProbability}% · {forecast.fromCategory} · {forecast.amount}</dd>
                  <dt className="text-muted-foreground">If approved</dt><dd>{forecast.to} · {forecast.toProbability}% · {forecast.toCategory} · {forecast.amount} moves to {forecast.toCategory}</dd>
                </dl>
              )}
              <p className="text-muted-foreground">Built from: {e.inputs.map((i) => i.label).join(" · ")}</p>
              {e.dealId && <a className="underline underline-offset-4" href={href(`/ollopa/deals/${e.dealId}`)}>Open the deal</a>}
            </div>
          ) : e.ifApproved?.action === "enrol" ? (
            <div className="grid gap-2">
              <p>Built from: {e.inputs.map((i) => i.label).join(" · ")}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                <dt className="text-muted-foreground">People</dt><dd>{(e.ifApproved.recipients ?? 0).toLocaleString()} · <a className="underline underline-offset-4" href={href("/ollopa/people")}>see the records</a></dd>
                <dt className="text-muted-foreground">Sequence</dt><dd>{e.ifApproved.sequence}</dd>
                <dt className="text-muted-foreground">First step</dt><dd>{e.ifApproved.sendsAt} from {mailbox}</dd>
                <dt className="text-muted-foreground">Cost</dt><dd>{e.ifApproved.credits.toLocaleString()} credits</dd>
              </dl>
            </div>
          ) : (
            <div className="grid gap-2">
              <p className="text-muted-foreground">
                Built from: {e.inputs.map((i, n) => (
                  <span key={i.label}>{n > 0 && " · "}<a className="underline underline-offset-4" href={i.href}>{i.label}</a></span>
                ))}
              </p>
              <pre className="whitespace-pre-wrap font-sans text-[13px]">{p.draft}</pre>
              <div>
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit then approve</Button>
              </div>
            </div>
          )}
        </Door>
      </div>
    </li>
  )
}

function adminLine(p: WaitingItemProps): string {
  return p.admin ? `${p.admin.user}, ${p.admin.title}` : "an admin"
}

/** A proposal that sends before tomorrow morning cannot be snoozed; the item says so before you confirm. */
function sendsBeforeTomorrow(e: AgentEvent): boolean {
  if (e.ifApproved?.action === "send") return true
  const at = e.ifApproved?.sendsAt
  return !at || at.slice(0, 10) <= TODAY
}
