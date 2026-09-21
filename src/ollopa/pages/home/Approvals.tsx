// Waiting for your approval: what an agent will do on your behalf, before it does it.
//
// Only irreversible or costly work is here — a send, a spend above a cap, a deal stage change. Research,
// scoring and drafts saved but not sent are logged in the week door instead, so the queue stays short
// enough to be read. Every row carries what it will do, to whom and what it costs, next to Approve and
// Decline. Rows arrive in the batch their run produced, and a batch is approved only once every item in
// it has been opened or scrolled past, with the number still unread printed beside the button.
import { useCallback, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { openBeside } from "../../beside"
import { follow } from "../../chain"
import { originHere } from "../work/register"
import { toast } from "../../templates/TablePage"
import { ApproveBar, ConsequenceLine, Door, Panel, consequenceText, useDoorState, type Disclosure } from "../../ui"
import type { AgentEvent } from "../../data/seed"
import type { Session } from "../../session"
import { onApprovalDecision } from "./acts"
import { consequenceOf, proposalOf, wordsOf, type Batch, type HomeData } from "./data"
import { count, plural, when } from "./format"
import { Nothing, Row, RowList, Section, UndoLine, useUndo } from "./rows"

type Decision = "approved" | "declined"

/** Marks an item read when it has been on screen once: the batch button waits for all of them. */
function useSeen(onSeen: (id: string) => void) {
  const latest = useRef(onSeen)
  latest.current = onSeen
  const observer = useRef<IntersectionObserver | null>(null)
  if (observer.current === null && typeof IntersectionObserver !== "undefined") {
    observer.current = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const id = (e.target as HTMLElement).dataset.itemId
        if (e.isIntersecting && id) latest.current(id)
      }),
      { threshold: 0.6 },
    )
  }
  useEffect(() => () => observer.current?.disconnect(), [])
  return useCallback((el: HTMLElement | null) => { if (el) observer.current?.observe(el) }, [])
}

/** The draft, its sources and the line naming what it was built from: the only thing behind a door. */
function ItemBody({ e, inPanel }: { e: AgentEvent; inPanel?: boolean }) {
  const words = wordsOf(e)
  return (
    <div className="w-full pt-1.5">
      <Door
        id={`home.agents.detail.${e.id}${inPanel ? ".panel" : ""}`}
        label={e.draft ? `Read the draft · ${words} words · ${e.inputs.length} inputs` : `What it read · ${e.sources.length} sources · ${e.inputs.length} inputs`}
      >
        <p className="pb-1 text-xs text-muted-foreground">
          Built from:{" "}
          {e.inputs.map((input, i) => (
            <span key={input.label}>
              {i > 0 && " · "}
              <a className="underline underline-offset-2" href={input.href}>{input.label}</a>
            </span>
          ))}
        </p>
        {e.draft
          ? <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-2 text-xs">{e.draft}</p>
          : <p className="text-xs text-muted-foreground">{e.detail}</p>}
        {e.sourceQuote && <p className="pt-1 text-xs text-muted-foreground">{e.sourceQuote}</p>}
      </Door>
    </div>
  )
}

interface RowProps {
  e: AgentEvent
  canApprove: boolean
  isAdmin: boolean
  mine: boolean
  adminName: string
  adminTitle: string
  seen: (el: HTMLElement | null) => void
  /** The proposals on screen, in the order they are on screen, for [ and ] in the pane. */
  ids: string[]
  onDecide: (e: AgentEvent, decision: Decision) => void
  onRead: (id: string) => void
}

function ApprovalRow({ e, canApprove, isAdmin, mine, adminName, adminTitle, seen, ids, onDecide, onRead }: RowProps) {
  const [, openDoor] = useDoorState(`home.agents.detail.${e.id}`)
  const second = e.needsSecondApproval
  const recipients = e.ifApproved?.recipients ?? 0
  // The row names an agent run: Enter reads the whole proposal beside Home, with Approve and
  // Decline in the pane and this row still on screen behind it.
  const beside = () => {
    onRead(e.id)
    openBeside({
      kind: "agent-run",
      id: e.id,
      list: { ids, index: Math.max(0, ids.indexOf(e.id)) },
      opener: document.querySelector<HTMLElement>(`[data-item="${e.id}"]`),
    })
  }
  return (
    <Row
      itemId={e.id}
      itemLabel={proposalOf(e)}
      seen={seen}
      keys={{
        a: () => { if (canApprove) onDecide(e, "approved") },
        x: () => { if (canApprove) onDecide(e, "declined") },
        e: () => { openDoor(true); onRead(e.id) },
      }}
      onEnter={beside}
      className="flex-col items-stretch"
    >
      <div className="flex w-full flex-wrap items-start gap-x-3 gap-y-1">
        <Badge variant="outline" className="shrink-0 font-normal">{e.agent.replace(" agent", "")}</Badge>
        <span className="min-w-[11rem] flex-1">
          <span className="font-medium">{proposalOf(e)}</span>
          <ConsequenceLine {...consequenceOf(e)} className="mt-0.5" />
          {second && (
            <span className="mt-0.5 block text-xs font-medium">
              {isAdmin
                ? `Over the workspace threshold: ${e.ownerId} is waiting on you · ${plural(recipients, "recipient")}`
                : `Waiting on ${adminName} (${adminTitle}) · ${plural(recipients, "recipient")}`}
            </span>
          )}
          {isAdmin && !mine && !second && <span className="mt-0.5 block text-xs text-muted-foreground">Owned by {e.ownerId}. You may approve for them.</span>}
        </span>
        {canApprove ? (
          <span className="ml-auto flex shrink-0 items-center gap-2">
            <Button size="sm" className="h-7" onClick={() => onDecide(e, "approved")}>Approve</Button>
            <Button size="sm" variant="outline" className="h-7" onClick={() => onDecide(e, "declined")}>Decline</Button>
          </span>
        ) : (
          <button
            type="button"
            className="shrink-0 text-xs text-muted-foreground underline underline-offset-4"
            onClick={() => follow("/ollopa/agents", originHere(e.id))}
          >
            See it on Agents
          </button>
        )}
      </div>
      <ItemBody e={e} />
    </Row>
  )
}

export function Approvals({ data, d, session, order }: { data: HomeData; d: Disclosure; session: Session; order: number }) {
  const [decided, setDecided] = useState<Record<string, Decision>>({})
  const [read, setRead] = useState<Record<string, true>>({})
  const [panel, setPanel] = useState<{ title: string; items: AgentEvent[] } | null>(null)
  const [note, setNote, clearNote] = useUndo()
  const seen = useSeen((id) => setRead((r) => (r[id] ? r : { ...r, [id]: true })))
  const isAdmin = session.role === "admin"
  const adminName = data.admin?.user ?? "the admin"
  const adminTitle = data.admin?.title ?? "RevOps admin"

  const waiting = data.approvals.waiting.filter((e) => !decided[e.id])
  const batches: Batch[] = data.approvals.batches
    .map((b) => ({ ...b, items: b.items.filter((e) => !decided[e.id]) }))
    .filter((b) => b.items.length > 0)

  const owned = data.approvals.ownedByMe
  const canApprove = (e: AgentEvent) => (e.needsSecondApproval ? isAdmin : owned.has(e.id) || isAdmin)
  const mine = (e: AgentEvent) => owned.has(e.id)

  function decide(items: AgentEvent[], decision: Decision) {
    const ids = items.map((e) => e.id)
    setDecided((m) => ({ ...m, ...Object.fromEntries(ids.map((id) => [id, decision])) }))
    const credits = items.reduce((n, e) => n + (e.ifApproved?.credits ?? e.credits), 0)
    const forSomeone = items.filter((e) => !mine(e)).map((e) => e.ownerId)
    const words = items.length === 1
      ? `${decision === "approved" ? "Approved" : "Declined"} · ${consequenceText(consequenceOf(items[0]))}`
      : `${decision === "approved" ? "Approved" : "Declined"} ${items.length} · ${count(credits)} credits`
    const line = forSomeone.length > 0 && isAdmin
      ? `${words} · approved by ${session.user} for ${[...new Set(forSomeone)].join(", ")}`
      : words
    toast(line)
    setNote({ text: line, undo: () => setDecided((m) => { const next = { ...m }; ids.forEach((id) => delete next[id]); return next }) })
    setPanel(null)
  }

  // Approve or Decline pressed inside the pane: the row decides here, keeps its undo line and
  // writes the same ledger sentence, so the pane and the page can never disagree.
  useEffect(() => onApprovalDecision((id, decision) => {
    const e = data.approvals.waiting.find((x) => x.id === id)
    if (e) decide([e], decision)
  }))

  const research = data.approvals.researchRun
  const showResearch = research && d.atLevelOne("home.agents.brief-digest")
  const logged = data.approvals.loggedThisWeek
  const decidedNow = data.approvals.waiting.filter((e) => decided[e.id])

  const totals = (items: AgentEvent[]) => {
    const sends = items.filter((e) => e.ifApproved?.action === "send").length
    const credits = items.reduce((n, e) => n + (e.ifApproved?.credits ?? e.credits), 0)
    return { sends, credits }
  }
  const reviewable = waiting.filter(canApprove)
  const review = totals(reviewable)

  return (
    <Section
      id="home-approvals"
      title="Waiting for your approval"
      count={waiting.length}
      order={order}
      link={{ label: "Agents", to: "/ollopa/agents" }}
    >
      <UndoLine note={note} onDone={clearNote} />

      {showResearch && (
        <p className="mb-2 rounded-md border px-3 py-2 text-sm">
          <span className="font-medium">Research agent</span>
          <span className="text-muted-foreground"> · {plural(data.approvals.researchCompanies, "company", "companies")} overnight</span>
          {data.approvals.strongest.length > 0 && (
            <>
              <span className="text-muted-foreground"> · {data.approvals.strongest.length} strongest: </span>
              {data.approvals.strongest.map((c, i) => (
                <span key={c.id} data-item={c.id} data-item-label={c.name}>
                  {i > 0 && ", "}
                  {/* The research agent named these companies: each one reads beside Home. */}
                  <button
                    type="button"
                    className="underline underline-offset-2"
                    onClick={(ev) => openBeside({
                      kind: "company",
                      id: c.id,
                      list: { ids: data.approvals.strongest.map((x) => x.id), index: i },
                      opener: ev.currentTarget,
                    })}
                  >
                    {c.name}
                  </button>
                </span>
              ))}
            </>
          )}
          <span className="text-muted-foreground"> · {count(data.approvals.researchCredits)} credits</span>
        </p>
      )}

      {reviewable.length >= 2 && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            onClick={() => setPanel({ title: "Everything waiting for you", items: reviewable })}
          >
            Review {reviewable.length} waiting · {review.sends ? `${plural(review.sends, "email")} · ` : ""}{count(review.credits)} credits
          </Button>
        </div>
      )}

      {waiting.length === 0 && <Nothing text="No agent actions waiting." link={{ label: "Agents", to: "/ollopa/agents" }} />}

      {batches.map((batch) => {
        const approvable = batch.items.filter(canApprove)
        const unread = approvable.filter((e) => !read[e.id]).length
        const t = totals(approvable)
        return (
          <div key={batch.key} className="pb-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pb-1">
              <p className="min-w-0 text-xs text-muted-foreground">{batch.heading}</p>
              {approvable.length >= 2 && (
                <span className="ml-auto flex flex-wrap items-center gap-2">
                  {unread > 0 && <span className="text-xs text-muted-foreground">{unread} of {approvable.length} not read yet</span>}
                  <Button
                    size="sm"
                    className="h-7"
                    disabled={unread > 0}
                    onClick={() => decide(approvable, "approved")}
                  >
                    Approve {approvable.length} · {t.sends ? `${plural(t.sends, "email")} · ` : ""}{count(t.credits)} credits
                  </Button>
                </span>
              )}
            </div>
            <RowList label={batch.heading}>
              {batch.items.map((e) => (
                <ApprovalRow
                  key={e.id}
                  e={e}
                  canApprove={canApprove(e)}
                  isAdmin={isAdmin}
                  mine={mine(e)}
                  adminName={adminName}
                  adminTitle={adminTitle}
                  seen={seen}
                  ids={batch.items.map((x) => x.id)}
                  onDecide={(item, decision) => decide([item], decision)}
                  onRead={(id) => setRead((r) => (r[id] ? r : { ...r, [id]: true }))}
                />
              ))}
            </RowList>
          </div>
        )
      })}

      <Door id="home.agents.week" label="What agents did this week" count={logged.length + decidedNow.length}>
        <ul className="divide-y">
          {decidedNow.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 py-1.5 text-xs">
              <span className="min-w-0 flex-1">{proposalOf(e)}</span>
              <span className="shrink-0 text-muted-foreground">
                {decided[e.id] === "approved" ? "Approved" : "Declined"} by {session.user}{mine(e) ? "" : ` for ${e.ownerId}`}
              </span>
            </li>
          ))}
          {logged.slice(0, 12).map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 py-1.5 text-xs">
              <span className="w-20 shrink-0 text-muted-foreground">{when(e.when)}</span>
              <span className="min-w-0 flex-1">{e.summary}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{e.credits ? `${count(e.credits)} credits` : "no credits"}</span>
              {e.decision && <span className="shrink-0 text-muted-foreground">{e.decision} by {e.decidedBy}{e.decidedAsAdmin ? " (for the owner)" : ""}</span>}
              {e.undoable && !e.decision && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 shrink-0 px-2 text-xs"
                  onClick={() => toast(`Undone · ${e.summary}`)}
                >
                  Undo
                </Button>
              )}
            </li>
          ))}
        </ul>
        <p className="pt-2 text-xs text-muted-foreground">
          <button type="button" className="underline underline-offset-4"
                  onClick={() => follow("/ollopa/agents", originHere("home-approvals"))}>
            The full ledger is on Agents
          </button>
        </p>
      </Door>

      <Panel
        id="X-agent-batch"
        title={panel?.title ?? ""}
        open={panel !== null}
        onOpenChange={(open) => !open && setPanel(null)}
        footer={panel && (
          <ApproveBar
            items={panel.items.map((e) => ({ id: e.id, consequence: consequenceOf(e), expanded: Boolean(read[e.id]) }))}
            onApproveAll={() => decide(panel.items, "approved")}
            onDeclineAll={() => decide(panel.items, "declined")}
          />
        )}
      >
        <ul className="divide-y">
          {panel?.items.map((e) => (
            <li key={e.id} data-item-id={e.id} ref={seen} className="py-3 first:pt-0">
              <p className="font-medium">{proposalOf(e)}</p>
              <ConsequenceLine {...consequenceOf(e)} className="mt-0.5" />
              <ItemBody e={e} inPanel />
            </li>
          ))}
        </ul>
      </Panel>
    </Section>
  )
}
