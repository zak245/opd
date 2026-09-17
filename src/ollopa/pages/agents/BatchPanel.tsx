// X-agent-batch: the batch, with the total consequence in the button's own label.
//
// A panel holds no doors, so every item here is flat and the whole draft is on the page. That is the
// point rather than a constraint: "Approve 6 · send 4 emails, add 2 to sequences · 8 credits" stays
// inactive until every item has been expanded or scrolled past once, because disclosure that exceeds
// review capacity is the same as hiding. Items whose mailbox is paused, and items over the second-
// approval threshold, stay behind and say so instead of going out with the rest.
import { useEffect, useRef } from "react"
import { Panel } from "../../ui/Panel"
import { ApproveBar } from "../../ui/ApproveBar"
import { ConsequenceLine } from "../../ui/ConsequenceLine"
import type { AgentEvent, Seed } from "../../data/seed"
import type { Session } from "../../session"
import { day } from "../deal/format"
import { consequenceFor, mailboxPaused, overSecondApproval, queueOwner } from "./model"

export interface BatchPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: AgentEvent[]
  seed: Seed
  session: Session
  currency: string
  admin: { user: string; title: string } | null
  drafts: Record<string, string>
  read: Set<string>
  onRead: (id: string) => void
  onApproveAll: (items: AgentEvent[]) => void
  onDeclineAll: (items: AgentEvent[]) => void
}

export function BatchPanel(p: BatchPanelProps) {
  const { seed, session, currency } = p
  // Held back, with the reason on the item: a paused mailbox, or a second approval still to come.
  const held = p.items.filter((e) => mailboxPaused(queueOwner(e), seed) || e.status === "waiting-second")
  const going = p.items.filter((e) => !held.includes(e))

  return (
    <Panel
      id="agent-batch"
      title={`Review ${p.items.length} waiting`}
      open={p.open}
      onOpenChange={p.onOpenChange}
      footer={
        <div className="w-full">
          <ApproveBar
            items={going.map((e) => ({ id: e.id, consequence: consequenceFor(e, seed, currency), expanded: p.read.has(e.id) }))}
            onApproveAll={() => { p.onApproveAll(going); p.onOpenChange(false) }}
            onDeclineAll={() => { p.onDeclineAll(going); p.onOpenChange(false) }}
          />
        </div>
      }
    >
      {held.length > 0 && (
        <p className="mb-3 rounded-md bg-muted px-2 py-1.5 text-xs">
          {held.length} {held.length === 1 ? "item stays" : "items stay"} behind: {held.map((e) => reasonHeld(e, seed, session)).join("; ")}.
        </p>
      )}
      <ul className="grid gap-4">
        {going.map((e) => (
          <Item key={e.id} e={e} seed={seed} session={session} currency={currency} draft={p.drafts[e.id] ?? ""} read={p.read.has(e.id)} onRead={() => p.onRead(e.id)} />
        ))}
        {held.map((e) => (
          <li key={e.id} className="rounded-lg border border-dashed p-3 text-sm">
            <p className="font-medium">{e.agent} · {e.summary}</p>
            <ConsequenceLine {...consequenceFor(e, seed, currency)} className="mt-1" />
            <p className="mt-1 text-xs text-muted-foreground">Stays in the queue: {reasonHeld(e, seed, session)}.</p>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function reasonHeld(e: AgentEvent, seed: Seed, session: Session): string {
  const paused = mailboxPaused(queueOwner(e), seed)
  if (paused) return `${e.contact ?? e.company} — ${paused.toLowerCase()}`
  if (overSecondApproval(e, seed)) return `“${e.summary}” — over ${seed.secondApproval.recipients.toLocaleString()} recipients, so an admin approves it`
  return `“${e.summary}” — waiting for a second approval`
}

function Item({ e, seed, session, currency, draft, read, onRead }: {
  e: AgentEvent; seed: Seed; session: Session; currency: string; draft: string; read: boolean; onRead: () => void
}) {
  const box = useRef<HTMLLIElement>(null)
  const mark = useRef(onRead)
  mark.current = onRead
  useEffect(() => {
    const el = box.current
    if (!el || read) return
    const io = new IntersectionObserver((rows) => { if (rows.some((r) => r.intersectionRatio > 0.5)) mark.current() }, { threshold: [0.5] })
    io.observe(el)
    return () => io.disconnect()
  }, [read])

  return (
    <li ref={box} className="rounded-lg border p-3 text-sm">
      <p className="font-medium">{e.surface === "mcp" || e.surface === "cli" ? e.actorUser : e.agent} · {e.summary}</p>
      <ConsequenceLine {...consequenceFor(e, seed, currency)} className="mt-1 text-[13px] text-foreground" />
      <p className="mt-1 text-xs text-muted-foreground">Waiting since {day(e.when)} {e.at} · {read ? "read" : "not read yet"}</p>
      {draft && <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-2 font-sans text-xs">{draft}</pre>}
    </li>
  )
}
