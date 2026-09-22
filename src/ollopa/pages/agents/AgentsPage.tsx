// P-agents. What the agents did, what waits for a decision, and what all of it cost.
//
// Three things are never behind anything: the spend this week against the cap, every item waiting with
// what it will do and what it costs, and any agent that is paused or capped. Everything that does not
// need a decision — research, scores, saved drafts, routed records, the records a run passed over — is
// in the ledger below with an Undo on its row, because a queue that asks about the reversible spends
// the reviewer's attention on the things that do not need it.
//
// What sits where is asked of the usage model for this seat at this business (`useDisclosure("agents")`),
// never from a list written here.
import { useEffect, useMemo, useRef, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { href, navigate, useRoute } from "@/app/router"
import { useLesson } from "@/learn/context"
import { Actions } from "../../ui/Actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Container } from "../../ui/Section"
import { ApproveBar } from "../../ui/ApproveBar"
import { DoorGroup, useDoorState } from "../../ui/Door"
import { EmptyState } from "../../ui/EmptyState"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { TODAY, seedFor, type Agent, type AgentEvent } from "../../data/seed"
import { clientWorkspace } from "../../map"
import type { Session } from "../../session"
import { toast } from "../../templates/TablePage"
import { Briefing } from "./Briefing"
import { Ledger, NO_FILTERS, type Filters } from "./Ledger"
import { WaitingItem } from "./WaitingItem"
import { BatchPanel } from "./BatchPanel"
import { ParodyAsk, ParodyChat, ParodyCredits, ParodyNote, ParodyTopBar, ParodyWorkflow } from "./Parody"
import {
  adminOf, batchOf, byAgent, canPause as mayPause, consequenceFor, draftFor, exceptionsOf, lastSeen, mailboxPaused,
  markSeen, overSecondApproval, queuesFor, queueOwner, ruleFlags, runsOf, since, spendOf, trackRecord, watchOf,
  type LocalDecision,
} from "./model"

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function AgentsPage({ session }: { session: Session }) {
  // Null in the product, so every rule is on and the page renders its final form. On a lesson stage
  // it names the step, and the six rules this case applies arrive one at a time (spec 13 §7).
  const rules = ruleFlags(useLesson())
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const d = useDisclosure("agents")
  const route = useRoute()
  const admin = adminOf(session.business)
  const workspace = clientWorkspace(session.business, seed.workspace.name)
  const canPause = mayPause(session)

  const [local, setLocal] = useState<Record<string, LocalDecision>>({})
  const [undone, setUndone] = useState<Record<string, { by: string; at: string }>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [read, setRead] = useState<Set<string>>(() => new Set())
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [pausedHere, setPausedHere] = useState<Record<string, boolean>>({})
  const [resumed, setResumed] = useState<string[]>([])
  const [watching, setWatching] = useState(true)
  const [batchOpen, setBatchOpen] = useState(route.query.get("batch") === "1")
  const [result, setResult] = useState<string | null>(null)
  const [focus, setFocus] = useState<string | null>(null)
  const [announce, setAnnounce] = useState("")
  const [answered, setAnswered] = useState<Set<string>>(() => new Set())
  const [filters, setFilters] = useState<Filters>(() =>
    route.query.get("kind") ? { ...NO_FILTERS, kind: route.query.get("kind")! } : NO_FILTERS)
  const search = useRef<HTMLInputElement>(null)

  // "Since you last looked" is a sentence, not a reordering: nothing on the page moves because of it.
  const seen = useRef(lastSeen(session.user)).current
  useEffect(() => () => markSeen(session.user, `${TODAY} ${new Date().toTimeString().slice(0, 5)}`), [session.user])

  const { waiting: allWaiting, ledger: allLedger } = useMemo(() => queuesFor(session, seed), [session, seed])
  const waiting = allWaiting.filter((e) => !local[e.id])
  const snoozed = allWaiting.filter((e) => local[e.id]?.status === "snoozed")
  const queue = [...waiting.filter((e) => !snoozed.includes(e)), ...snoozed]

  const agents = seed.agents
  const agentsOn = agents.filter((a) => a.on && !pausedHere[a.id]).length
  const exceptions = exceptionsOf(seed, agents, pausedHere).filter((x) => !resumed.includes(x.id))
  const spend = spendOf(seed, session.business)
  const batch = batchOf(queue, seed, session)
  const watch = watchOf(seed)

  /* --------------------------------------------------------------------------- the ledger */

  const decidedHere = useMemo(
    () => seed.agentEvents.filter((e) => local[e.id]),
    [seed, local],
  )
  const ledgerAll = useMemo(() => {
    const ids = new Set(queue.map((e) => e.id))
    return [...allLedger, ...decidedHere.filter((e) => !allLedger.includes(e))]
      .filter((e) => !ids.has(e.id))
      .sort((a, c) => `${c.when} ${c.at}`.localeCompare(`${a.when} ${a.at}`))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLedger, decidedHere, queue.length])

  const ledger = useMemo(() => ledgerAll.filter((e) => matches(e, filters, seed, session)), [ledgerAll, filters, seed, session])

  /* ----------------------------------------------------------------------------- the acts */

  const now = () => new Date().toTimeString().slice(0, 5)

  const decide = (e: AgentEvent, status: LocalDecision["status"], extra: Partial<LocalDecision> = {}) => {
    const owner = queueOwner(e)
    setLocal((m) => ({ ...m, [e.id]: { status, by: session.user, at: now(), forOwner: owner === session.user ? undefined : owner, ...extra } }))
    setSelected((s) => { const next = new Set(s); next.delete(e.id); return next })
    // Keyboard: the decision moves the focus to the next item rather than leaving it on a gap.
    setFocus((f) => {
      if (f !== e.id) return f
      const rest = queue.filter((x) => x.id !== e.id)
      const at = queue.findIndex((x) => x.id === e.id)
      return rest[Math.min(rest.length - 1, at)]?.id ?? null
    })
    const word = status === "approved" ? "Approved" : status === "declined" ? "Declined" : status === "snoozed" ? "Snoozed" : "Handed over"
    setAnnounce(`${word}. ${Math.max(0, queue.length - 1)} waiting.`)
  }

  const approve = (e: AgentEvent, opts?: { edited?: boolean }) => {
    const owner = queueOwner(e)
    const c = e.ifApproved
    decide(e, "approved", { edited: opts?.edited })
    const forOther = owner !== session.user ? ` Recorded as approved by ${session.user} for ${owner}.` : ""
    if (e.status === "waiting-second") toast(`Second approval given.${forOther || " Sending now."}`)
    else if (c?.action === "send") toast(`Sent to ${e.contact} from ${seed.mailboxes.find((m) => m.owner === owner)?.address ?? c.mailbox}.${forOther}`)
    else if (c?.action === "enrol") toast(`Added ${(c.recipients ?? 0).toLocaleString()} people to ${c.sequence}. First step ${c.sendsAt}. ${c.credits} credits spent.${forOther}`)
    else if (c?.action === "stage") toast(`${seed.deals.find((x) => x.id === e.dealId)?.company ?? "The deal"} moved to ${c.stage}.${forOther}`)
    else toast(`Approved.${forOther}`)
  }

  const decline = (e: AgentEvent, note?: string) => {
    decide(e, "declined", { note })
    toast(note ? "Declined. Nothing was sent. The agent was told why." : "Declined. Nothing was sent.")
  }

  const approveAll = (items: AgentEvent[]) => {
    const held = items.filter((e) => mailboxPaused(queueOwner(e), seed) || overSecondApproval(e, seed))
    const sent = items.filter((e) => !held.includes(e))
    for (const e of sent) decide(e, "approved")
    const credits = sent.reduce((n, e) => n + (e.ifApproved?.credits ?? 0), 0)
    setResult(`${now()} · you approved ${sent.length}${held.length ? ` · ${held.length} held` : ""} · ${credits.toLocaleString()} credits`)
    setSelected(new Set())
  }

  const declineAll = (items: AgentEvent[]) => {
    for (const e of items) decide(e, "declined")
    setResult(`${now()} · you declined ${items.length} · nothing was sent`)
    setSelected(new Set())
  }

  const undo = (e: AgentEvent) => {
    setUndone((m) => ({ ...m, [e.id]: { by: session.user, at: now() } }))
    toast(
      e.kind === "researched" ? "Research dropped. Credits already spent are not refunded."
        : e.kind === "scored" ? "Score cleared. Credits already spent are not refunded."
          : "Draft deleted. Credits already spent are not refunded.",
    )
  }

  const pause = (a: Agent, paused: boolean) => {
    setPausedHere((m) => ({ ...m, [a.id]: paused }))
    toast(paused
      ? `${a.name} paused. Nothing more is drafted or sent until someone resumes it. Items already waiting stay waiting.`
      : `${a.name} resumed.`)
  }

  /* --------------------------------------------------------------------------- keyboard */

  const order = useMemo(() => [...queue.map((e) => e.id), ...ledger.map((e) => e.id)], [queue, ledger])
  const inQueue = (id: string) => queue.some((e) => e.id === id)
  const doorId = focus ? (inQueue(focus) ? `agents.item.${focus}` : `agents.steps.${focus}`) : "agents.none"
  const [doorOpen, setDoorOpen] = useDoorState(doorId)

  useEffect(() => {
    // Rule 8: the accelerators arrive with the last step. Before it, every item is still reachable
    // by Tab and every control still works; what is missing is the faster way past the scaffold.
    if (!rules.r8) return
    const onKey = (ev: KeyboardEvent) => {
      const el = ev.target as HTMLElement | null
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return
      if (ev.key === "Escape") { setFilters(NO_FILTERS); setSelected(new Set()); setFocus(null); (ev.target as HTMLElement)?.blur?.(); return }
      if (ev.key === "/") { ev.preventDefault(); search.current?.focus(); return }
      if (typing) return
      const at = focus ? order.indexOf(focus) : -1
      if (ev.key === "j") { ev.preventDefault(); setFocus(order[Math.min(order.length - 1, at + 1)] ?? order[0] ?? null); return }
      if (ev.key === "k") { ev.preventDefault(); setFocus(order[Math.max(0, at - 1)] ?? order[0] ?? null); return }
      if (!focus) return
      const item = queue.find((e) => e.id === focus)
      if (ev.key === "e") { ev.preventDefault(); setDoorOpen(!doorOpen); return }
      if (ev.key === "Enter") {
        const e = [...queue, ...ledger].find((x) => x.id === focus)
        if (e?.contactId) { ev.preventDefault(); navigate(`/ollopa/people/${e.contactId}`) }
        return
      }
      if (!item) return
      if (ev.key === "a") { ev.preventDefault(); approve(item); return }
      if (ev.key === "d") { ev.preventDefault(); decline(item); return }
      if (ev.key === "x") {
        ev.preventDefault()
        // Where selecting is on the page, `x` selects; where the batch lives in its panel, it opens it.
        if (d.atLevelOne("wait.bulk")) setSelected((s) => { const next = new Set(s); next.has(item.id) ? next.delete(item.id) : next.add(item.id); return next })
        else setBatchOpen(true)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  })

  // A copied link lands on the item with its door open, because a deep link never skips a level.
  const wanted = route.query.get("event")
  const [, openWanted] = useDoorState(wanted ? `agents.item.${wanted}` : "agents.none")
  useEffect(() => {
    if (!wanted) return
    setFocus(wanted)
    openWanted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted])

  /* ------------------------------------------------------------------------------ render */

  if (agents.length === 0 || agentsOn === 0) {
    return (
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <p className="t-body">No agents are on at {b.name}.</p>
        <div className="mt-4">
          <EmptyState
            title="Nothing has run"
            body={session.role === "admin"
              ? "Turn an agent on in Settings › Agents and AI, and what it does will be listed here with what it cost."
              : `${admin ? `${admin.user}, ${admin.title},` : "Your admin"} can turn agents on.`}
            action={session.role === "admin"
              ? <Actions surface="card" items={[{ kind: "link", label: "Agent settings", href: href("/ollopa/settings/agents") }]} />
              : undefined}
          />
        </div>
      </div>
    )
  }

  // Apollo asks before "a credit-consuming Apollo action, such as saving contacts or enriching
  // records" (KB 39359204112397), so at step 0 the reversible work asks too. Rule 7 cuts those out
  // of the queue and logs them with an Undo instead: what is left is only what cannot be taken back.
  const reversibleAsks = rules.r7 ? [] : ledgerAll.filter((e) => e.undoable && e.credits > 0 && !answered.has(e.id)).slice(0, 3)
  const askIds = new Set(reversibleAsks.map((e) => e.id))
  const chatRecent = ledgerAll.filter((e) => e.when === TODAY && !askIds.has(e.id))
  const chatOlder = ledgerAll.filter((e) => e.when !== TODAY && !askIds.has(e.id)).slice(0, 24)
  const runs = runsOf(seed.agentEvents.filter((e) => allLedger.includes(e) || queue.includes(e)))

  const bulkAtLevelOne = d.atLevelOne("wait.bulk")
  const chosen = queue.filter((e) => selected.has(e.id))
  const seenDate = seen.slice(0, 10)
  const sentence =
    `Since ${WEEKDAYS[new Date(seenDate + "T00:00:00Z").getUTCDay()]} ${seen.slice(11)}: ` +
    `${agentsOn} ${agentsOn === 1 ? "agent" : "agents"} ran ${since(seed.agentEvents, seen)} events. ` +
    `${queue.length} waiting for you. ${exceptions.length} ${exceptions.length === 1 ? "exception" : "exceptions"}.`

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Step 0 and step 1: Apollo's top bar, with the balance pill and the second "power-up" meter. */}
      {!rules.r1 && <ParodyTopBar spend={spend} showCredits={!rules.r7} showAssistant />}
      {!rules.r7 && <ParodyNote className="mb-3" />}

      {rules.r7 && <Briefing
        rules={rules}
        seed={seed} session={session} d={d} spend={spend} sentence={sentence} workspace={workspace}
        agents={agents} pausedHere={pausedHere} onPause={pause}
        trackOf={(a) => trackRecord(a.name, session, seed, local)}
        runsToday={(a) => new Set(seed.agentEvents.filter((e) => e.agent === a.name && e.when === TODAY).map((e) => e.batchKey)).size}
        watch={watch} watching={watching}
        onWatch={(on) => { setWatching(on); toast(on ? `Watching “${watch?.list}” again.` : `Stopped watching “${watch?.list}”. Nothing more is researched from it.`) }}
        canPause={canPause} admin={admin}
        filterAgent={filters.agent} onFilterAgent={(name) => setFilters({ ...filters, agent: name })}
        exceptions={exceptions} onResume={(id) => { setResumed((was) => [...was, id]); toast("Resumed.") }}
      />}

      {/* Waiting for you. Only the irreversible and the costly; everything else is in the ledger. */}
      {rules.r7 && <Container
        className="mt-8"
        component="list"
        padded={false}
        heading="Waiting for you"
        count={queue.length}
        actions={
          queue.length > 0 && !bulkAtLevelOne && rules.r8
            ? <Actions surface="card" items={[{ kind: "secondary", label: `Review all ${queue.length}`, onClick: () => setBatchOpen(true), dataItem: "wait.review-all", dataItemLabel: "Review all" }]} />
            : undefined
        }
        footer={bulkAtLevelOne && chosen.length > 0 ? (
          <ApproveBar
            items={chosen.map((e) => ({ id: e.id, consequence: consequenceFor(e, seed, b.currency), expanded: read.has(e.id) }))}
            onApproveAll={() => approveAll(chosen)}
            onDeclineAll={() => declineAll(chosen)}
          />
        ) : undefined}
      >
        <div className="px-4 pb-3">
        {batch && (
          <p data-item="wait.batch-line" data-item-label="What arrived in this batch, and what it costs together"
            className="t-small text-muted-foreground">
            {batch.count} arrived while the agents ran, {batch.at}. Together:{" "}
            {[batch.sends && `${batch.sends} ${batch.sends === 1 ? "email" : "emails"} from your mailbox`,
              batch.enrols && `${batch.enrols.toLocaleString()} people added to sequences`,
              batch.stages && `${batch.stages} ${batch.stages === 1 ? "deal" : "deals"} moved a stage`]
              .filter(Boolean).join(", ")}
            , {batch.credits.toLocaleString()} credits.{" "}
            {batch.skippedTotal > 0 && (
              <>
                <a data-item="wait.skipped" data-item-label="What the run passed over"
                  className="underline underline-offset-4" href={href("/ollopa/agents?kind=skipped")}
                  onClick={() => setFilters({ ...NO_FILTERS, kind: "skipped" })}>
                  {batch.skippedTotal} {batch.skippedTotal === 1 ? "record" : "records"} skipped
                </a>
                : {batch.skipped.map((s) => `${s.count} ${s.reason}`).join(", ")}.
              </>
            )}
          </p>
        )}

        {queue.length === 0 ? (
          <p className="t-body text-muted-foreground">Nothing waiting.</p>
        ) : (
          <>
            {bulkAtLevelOne && (
              <div className="t-small mt-3 flex items-center gap-2">
                <Checkbox
                  id="agents-select-all"
                  checked={chosen.length === queue.length && queue.length > 0}
                  onCheckedChange={(v) => setSelected(v === true ? new Set(queue.map((e) => e.id)) : new Set())}
                />
                <label htmlFor="agents-select-all">Select all {queue.length}</label>
              </div>
            )}
            <DoorGroup>
              <div aria-live="polite" className="sr-only">{announce || `${queue.length} waiting.`}</div>
              <div data-container="waiting" data-container-label="Waiting for you">
              {byAgent(queue).map((group) => (
                <div key={group.agent} className="mt-3">
                  <Separator />
                  <h3 className="t-small py-1.5 font-medium uppercase tracking-wider text-muted-foreground">
                    {group.agent} · {group.items.length}
                  </h3>
                  <Separator />
                  <ul className="divide-y">
                    {group.items.map((e) => (
                      <WaitingItem
                        key={e.id}
                        index={queue.indexOf(e)}
                        event={e}
                        seed={seed}
                        session={session}
                        currency={b.currency}
                        admin={admin}
                        rules={rules}
                        canApproveForOthers={session.role === "admin"}
                        selectable={bulkAtLevelOne}
                        selected={selected.has(e.id)}
                        onSelect={(on) => setSelected((s) => { const next = new Set(s); on ? next.add(e.id) : next.delete(e.id); return next })}
                        read={read.has(e.id)}
                        onRead={() => setRead((s) => (s.has(e.id) ? s : new Set(s).add(e.id)))}
                        draft={drafts[e.id] ?? draftFor(e)}
                        onDraft={(text) => setDrafts((m) => ({ ...m, [e.id]: text }))}
                        onApprove={(opts) => approve(e, opts)}
                        onDecline={(note) => decline(e, note)}
                        onSnooze={() => { decide(e, "snoozed"); toast("Snoozed until tomorrow 08:00. Nothing is sent meanwhile.") }}
                        onHand={(to) => { decide(e, "handed", { to }); toast(`Handed to ${to}. It left your queue and they were told.`) }}
                        focused={focus === e.id}
                      />
                    ))}
                  </ul>
                </div>
              ))}
              </div>
            </DoorGroup>

          </>
        )}
        </div>
      </Container>}

      {result && <Alert role="status" className="mt-6 py-2"><AlertDescription className="t-small">{result}</AlertDescription></Alert>}

      {/* Step 0 and step 1: the assistant's conversation, which is where Apollo keeps the record. */}
      {!rules.r1 && (
        <div className="mt-6">
          <ParodyChat
            seed={seed} session={session} recent={chatRecent} older={chatOlder} r7={rules.r7}
            onUndo={undo} undone={undone}
            asks={
              <>
                {!rules.r7 && queue.map((e) => (
                  <ParodyAsk key={e.id} e={e} seed={seed} itemId={`wait.item.${e.id}`} container={`item.${e.id}`}
                    onApprove={() => approve(e)} onDecline={() => decline(e)} />
                ))}
                {reversibleAsks.map((e) => (
                  <ParodyAsk key={e.id} e={e} seed={seed} itemId={`act.row.${e.id}`}
                    onApprove={() => { setAnswered((was) => new Set(was).add(e.id)); toast(`Done. ${e.credits} credits spent.`) }}
                    onDecline={() => { setAnswered((was) => new Set(was).add(e.id)); toast("Nothing was done.") }} />
                ))}
              </>
            }
          />
        </div>
      )}

      {/* Step 0 to step 2: the workflow that actually runs the agents, and its Enrollment tab. */}
      {!rules.r2 && (
        <ParodyWorkflow
          name={seed.workflows[0]?.name ?? "Inbound and outbound"}
          runs={runs} agents={agents} exceptions={exceptions} seed={seed}
          showFilters={!rules.r1} showSteps={!rules.r7} showFailures={!rules.r7} showSettingsLink={!rules.r7}
        />
      )}

      {/* Step 0 to step 2: the credits, four levels down in Settings, behind a permission. */}
      {!rules.r2 && <ParodyCredits spend={spend} runs={runs} showWeek={!rules.r7} />}

      {rules.r1 && <Ledger
        rules={rules}
        events={ledger}
        total={ledgerAll.length}
        seed={seed}
        session={session}
        d={d}
        filters={filters}
        onFilters={setFilters}
        local={local}
        undone={undone}
        onUndo={undo}
        searchRef={search}
        focusedId={focus}
      />}

      <BatchPanel
        open={batchOpen}
        onOpenChange={setBatchOpen}
        items={queue}
        seed={seed}
        session={session}
        currency={b.currency}
        admin={admin}
        drafts={Object.fromEntries(queue.map((e) => [e.id, drafts[e.id] ?? draftFor(e)]))}
        read={read}
        onRead={(id) => setRead((s) => (s.has(id) ? s : new Set(s).add(id)))}
        onApproveAll={approveAll}
        onDeclineAll={declineAll}
      />
    </div>
  )
}

/** Search matches summary, contact, company, sequence and step text. */
function matches(e: AgentEvent, f: Filters, seed: ReturnType<typeof seedFor>, session: Session): boolean {
  if (f.agent !== "all" && e.agent !== f.agent) return false
  if (f.who !== "all" && e.contact !== f.who && e.company !== f.who) return false
  if (f.kind !== "all" && e.kind !== f.kind) return false
  if (f.status !== "all" && e.status !== f.status) return false
  if (f.surface !== "all" && e.surface !== f.surface) return false
  if (f.person !== "all" && queueOwner(e) !== f.person) return false
  if (f.date !== "all") {
    const days = f.date === "today" ? 0 : f.date === "3d" ? 3 : 7
    const from = new Date(Date.parse(TODAY) - days * 86_400_000).toISOString().slice(0, 10)
    if (e.when < from) return false
  }
  if (f.q) {
    const hay = [e.summary, e.detail, e.contact, e.company, e.sequence, ...e.steps.map((s) => s.text)].join(" ").toLowerCase()
    if (!hay.includes(f.q.toLowerCase())) return false
  }
  return true
}
