// One item waiting for a decision.
//
// Everything a person needs to decide is on the item: who did it, what it will do, from which mailbox,
// what it costs, how long it has left, and whose item it is. The draft, the research or the evidence
// behind it is one door under it (rule 5: the consequence never sits behind the door it belongs to).
// "Edit then approve" replaces the door's read content in place — it is a state of the door, not a
// second channel, so the depth is still the door and nothing more (IA-MAP §6.5).
import { useEffect, useRef, useState } from "react"
import { Clock, MoreHorizontal, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { href } from "@/app/router"
import { Actions, type Action } from "../../ui/Actions"
import { Chip, FamilyIcon } from "../../ui/Identity"
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
        {/* Deciding tomorrow is reversible and free, so it acts at once. It asks first only where
            waiting would decline it, which cannot be undone (DESIGN.md §2). */}
        <DropdownMenuItem onSelect={() => { if (sendsBeforeTomorrow(e)) setAsking("snooze"); else { p.onSnooze(); setAsking(null) } }}>Decide tomorrow</DropdownMenuItem>
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
      className={cn("surface-raised rounded-lg border", p.focused && "ring-2 ring-ring")}
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
              <>
                <span className="t-label inline-flex items-center gap-1.5">
                  {remote ? <Terminal className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : <FamilyIcon of="agents" />}
                  {remote ? e.actorUser : e.agent}
                </span>
                {/* The state, with its word: never a colour on its own (DESIGN.md §5). */}
                <Chip status="waiting">Waiting</Chip>
              </>
            )}
            <span className="t-body min-w-0">
              {forecast ? `Proposes moving ${forecast.company} from ${forecast.from} to ${forecast.to}` : e.summary}
            </span>
          </div>

          {/* What happens if you say yes. Beside Approve, never behind the door (rule 5). */}
          {rules.r5 && hasConsequence && (
            <div data-item={`wait.consequence.${e.id}`} data-item-label="What happens if you approve">
              <ConsequenceLine {...consequence} className="t-label mt-1.5 font-normal text-foreground" />
            </div>
          )}

          {forecast && (
            <p className="t-small mt-1 text-muted-foreground">
              Today: {forecast.from} · {forecast.fromProbability}% · {forecast.fromCategory}. If approved: {forecast.to} · {forecast.toProbability}% · {forecast.toCategory}.
            </p>
          )}
          {forecast && e.sourceQuote && <p className="t-small mt-1 italic text-muted-foreground">{e.sourceQuote}</p>}

          <div className="t-small mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="size-3" aria-hidden="true" />Waiting since {day(e.when)} {e.at}</span>
            {!mine && (
              <span>{owner}’s item.{p.canApproveForOthers ? ` You can approve for ${owner.split(" ")[0]}.` : ""}</span>
            )}
            {nearExpiry(e) && left !== null && (
              <span className="font-medium" style={{ color: "var(--warning-ink)" }}>Expires in {left} {left === 1 ? "day" : "days"} · nothing will be sent</span>
            )}
            {!nearExpiry(e) && left !== null && <span>Declined after {EXPIRY_DAYS} days if nobody decides</span>}
            {e.surface !== "app" && <span>{e.surface === "mcp" ? "Asked through an MCP client" : e.surface === "cli" ? "Asked from the terminal" : `From ${e.surface}`}</span>}
          </div>

          {second && (
            <p className="t-small mt-2 rounded-md bg-muted px-2 py-1.5">
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
            <p className="t-small mt-2" style={{ color: "var(--danger-ink)" }}>{mailbox} is paused. {paused}. Approving holds this item until it resumes.</p>
          )}
        </div>

        {/* The one act this item exists for is filled; declining is the other act the person came
            for, so it is outlined. A seat that may not give the second approval is not shown a grey
            Approve: the item is left out of the list and the line above names who it waits for. */}
        <div className="flex w-full shrink-0 items-center gap-1.5 sm:w-auto">
          <Actions surface="card" items={decisionActions(p, approve)} />
          {menu}
        </div>
      </div>

      {failure && <p role="status" className="t-small px-4 pb-2" style={{ color: "var(--danger-ink)" }}>{failure}</p>}

      {asking === "why" && (
        <div className="border-t px-4 py-3">
          <label className="t-small text-muted-foreground" htmlFor={`why-${e.id}`}>Tell the agent why</label>
          <Textarea id={`why-${e.id}`} value={why} onChange={(ev) => setWhy(ev.target.value)} rows={2} className="mt-1" placeholder="Wrong person: she left in July." />
          <Actions className="mt-2" surface="card" items={[
            { kind: "primary", label: "Decline and tell the agent", onClick: () => { p.onDecline(why); setAsking(null) } },
            { kind: "secondary", label: "Keep waiting", onClick: () => setAsking(null) },
          ]} />
        </div>
      )}

      {asking === "hand" && (
        <div className="border-t px-4 py-3">
          <label className="t-small text-muted-foreground">Hand the decision to a teammate</label>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Select value={mate} onValueChange={setMate}>
              <SelectTrigger className="h-8 w-56" aria-label="Teammate"><SelectValue placeholder="Choose a teammate" /></SelectTrigger>
              <SelectContent>{teammates.map((u) => <SelectItem key={u.id} value={u.name}>{u.name} · {u.title}</SelectItem>)}</SelectContent>
            </Select>
            {/* Disabled only for state this person can change — nobody chosen — with the reason beside it. */}
            <Actions surface="card" items={[
              { kind: "primary", label: "Hand it over", onClick: () => { p.onHand(mate); setAsking(null) }, disabledBecause: mate ? undefined : "Choose a teammate first" },
              { kind: "secondary", label: "Keep it", onClick: () => setAsking(null) },
            ]} />
          </div>
        </div>
      )}

      {/* Only the case that cannot be undone asks: waiting on this one declines it. The benign case
          acts from the menu at once, so there is no panel and no sentence to read (DESIGN.md §2). */}
      {asking === "snooze" && (
        <div className="t-small border-t px-4 py-3">
          <p>This sends before tomorrow 08:00, so deciding tomorrow declines it.</p>
          <Actions className="mt-2" surface="card" items={[
            { kind: "primary", label: "Decline it instead", onClick: () => { p.onDecline("Not decided in time"); setAsking(null) } },
            { kind: "secondary", label: "Keep waiting", onClick: () => setAsking(null) },
          ]} />
        </div>
      )}

      {/* Level two: what it was built from, and the thing itself. One door, never two. */}
      <div className="border-t px-1">
        <Door id={`agents.item.${e.id}`} label={rules.r4 ? doorLabel(e, p.draft) : "Preview"}>
          {!rules.r5 && hasConsequence && (
            <div data-item={`wait.consequence.${e.id}`} data-item-label="What happens if you approve">
              <ConsequenceLine {...consequence} className="t-label mb-2 font-normal text-foreground" />
            </div>
          )}
          {editing ? (
            /* X-agent-edit: the read content is replaced, in place. */
            <div>
              <label className="t-small text-muted-foreground" htmlFor={`draft-${e.id}`}>Edit the draft</label>
              <Textarea id={`draft-${e.id}`} value={p.draft} onChange={(ev) => p.onDraft(ev.target.value)} rows={10} className="mt-1 font-mono t-small" />
              <ConsequenceLine {...consequence} className="mt-2" />
              <Actions className="mt-2" surface="card" items={[
                { kind: "primary", label: "Send edited draft", onClick: () => { setEditing(false); approve({ edited: true }) } },
                { kind: "secondary", label: "Back to the draft", onClick: () => setEditing(false) },
              ]} />
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
              <pre className="t-label whitespace-pre-wrap font-sans font-normal">{p.draft}</pre>
              <Actions surface="card" items={[{ kind: "secondary", label: "Edit then approve", onClick: () => setEditing(true) }]} />
            </div>
          )}
        </Door>
      </div>
    </li>
  )
}

/** Approve is the one act the item exists for; Decline is the other act the person came for. */
function decisionActions(p: WaitingItemProps, approve: () => void): Action[] {
  const e = p.event
  const items: Action[] = []
  if (e.status !== "waiting-second" || p.canApproveForOthers) {
    items.push({
      kind: "primary",
      label: e.status === "waiting-second" ? "Approve as the second" : "Approve",
      onClick: approve,
      dataItem: `wait.approve.${e.id}`,
      dataItemLabel: "Approve",
    })
  }
  items.push({
    kind: "secondary",
    label: "Decline",
    onClick: () => p.onDecline(),
    dataItem: `wait.decline.${e.id}`,
    dataItemLabel: "Decline",
  })
  return items
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
