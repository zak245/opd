// Settings: one page inside the main navigation, laid out by the usage model for the signed-in seat
// at the signed-in business. No settings shell, no settings sidebar, no landing checklist.
//
// Three parts, top to bottom (spec 14 §3.1): the header with the settings search, the strip of
// decision-critical facts that never sits behind anything, and the thirteen areas in the fixed
// inventory order, each with its level-one rows and at most one door named by its contents.
//
// What decides the layout is `useDisclosure("settings")` and nothing else. View as a teammate swaps
// the seat the levels are read for and says so in a banner that cannot be missed.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { href } from "@/app/router"
import { Door, DoorGroup, ExpandAll, useDoorState } from "../../ui/Door"
import { Locked } from "../../ui/Locked"
import { gate } from "../../ui/gate"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { seedFor, type User } from "../../data/seed"
import { levelOf, weeklyUse, type Role, type UsageItem } from "../../usage/model"
import type { Session } from "../../session"
import { CreditsPanel } from "../../shell/Credits"
import { settingsFor } from "./derived"
import { credits, longDay, money, plural } from "./format"
import { personalRows, rowsFor, type PanelRequest, type SettingRow } from "./rows"
import { SaveBar, SettingsState, toast, useSettingsState } from "./state"
import {
  CliPanel, DomainPanel, FieldPanel, HookPanel, KeyPanel, ListPanel, MailboxPanel, McpScopePanel,
  PersonaPanel, RemovalPanel, ScorePanel, SignalPanel, TerritoryPanel, UserPanel,
} from "./panels"

/** The inventory order. "How your team works" is second because it explains the shape of everything
 *  below it, and scoring comes before Agents because it is what the agents read. */
export const AREA_ORDER = [
  "You", "Workspace", "How your team works", "Team and access", "Email sending", "Prospecting rules",
  "Pipeline and data", "Sequences", "Signals, scoring and personas", "Agents and AI", "Integrations",
  "API, webhooks, MCP and CLI", "Plan, billing and usage",
] as const

/** The settings-area node ids, so a deep link lands on the area it names. */
export const AREA_BY_NODE: Record<string, string> = {
  "S-you": "You",
  "S-workspace": "Workspace",
  "S-howteam": "How your team works",
  "S-team": "Team and access",
  "S-sending": "Email sending",
  "S-prospecting": "Prospecting rules",
  "S-pipeline": "Pipeline and data",
  "S-sequences": "Sequences",
  "S-scoring": "Signals, scoring and personas",
  "S-agents": "Agents and AI",
  "S-integrations": "Integrations",
  "S-developer": "API, webhooks, MCP and CLI",
  "S-plan": "Plan, billing and usage",
}

const slug = (area: string) => area.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")

/* ----------------------------------------------------------------------------------- the strip */

function StripLine({ label, children, tone }: { label: string; children: ReactNode; tone?: "warning" | "error" }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-1">
      <span className="w-36 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn("min-w-0 flex-1 text-sm", tone === "warning" && "text-amber-700 dark:text-amber-400", tone === "error" && "text-destructive")}>
        {children}
      </span>
    </div>
  )
}

function Strip({ session, role, user, onCredits }: { session: Session; role: Role; user: string; onCredits: () => void }) {
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const st = settingsFor(session.business)
  const ws = seed.workspace
  const isAdmin = role === "admin"
  const guard = seed.bounceGuard
  const c = seed.credits
  const mine = c.byUser.find((u) => u.user === user)
  const myMailboxes = seed.mailboxes.filter((m) => m.owner === user)
  const runsOutFirst = c.runsOutOn < c.cycleEnds
  const upgrades = seed.requests.filter((r) => r.kind === "upgrade" && r.state !== "declined" && r.state !== "verified")
  const waiting = seed.agentEvents.filter((e) => e.needsApproval && (e.status === "waiting" || e.status === "waiting-second")).length
  const dncOverdue = Math.round((Date.parse("2026-09-13") - Date.parse(st.prospecting.dnc.synchronisedOn)) / 86_400_000) > 31
  const spiked = c.spikeAlert.todayMultiple >= c.spikeAlert.multiple
  const paused = seed.mailboxes.filter((m) => m.paused).length

  const [cancelling, setCancelling] = useState(false)

  return (
    <section aria-label="What this workspace costs and what can spend or stop it" className="border-b bg-muted/30 px-4 py-3 sm:px-6">
      {isAdmin ? (
        <>
          <StripLine label="Plan and price">
            {b.plan.name} · {b.plan.seats} seats · {money(ws.plan.monthlyTotal)} a month, billed {ws.plan.billing === "annual" ? "annually" : "monthly"} · renews {longDay(ws.plan.renews)}
            <Button variant="link" size="sm" className="h-auto px-2 text-sm" onClick={() => toast("Change plan: seats, plan cards and the total, with Due today on screen.")}>Change plan</Button>
            <Button variant="link" size="sm" className="h-auto px-0 text-sm" onClick={() => setCancelling(true)}>Cancel plan</Button>
          </StripLine>
          {cancelling && (
            <div role="dialog" aria-label="Cancel plan" className="my-2 rounded-md border p-3">
              <p className="text-sm">
                Cancelling ends {b.name} on {longDay(ws.plan.renews)}. Sending stops that day. Your {seed.contacts.length.toLocaleString()} contacts,
                {" "}{plural(seed.sequences.length, "sequence")} and every report stay readable for 30 days, then they are deleted.
              </p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="destructive" onClick={() => { setCancelling(false); toast(`${b.name} ends on ${longDay(ws.plan.renews)}.`) }}>Cancel plan</Button>
                <Button size="sm" variant="outline" onClick={() => setCancelling(false)}>Keep plan</Button>
              </div>
            </div>
          )}
          <StripLine label="Credits" tone={runsOutFirst ? "warning" : undefined}>
            {credits(c.balance)} of {credits(c.monthlyCap)} left this month · {credits(c.burnPerWeek)} a week ·{" "}
            {runsOutFirst ? `runs out about ${longDay(c.runsOutOn)}, before the cycle ends on ${longDay(c.cycleEnds)}` : `lasts to about ${longDay(c.runsOutOn)}`}
            <Button variant="link" size="sm" className="h-auto px-2 text-sm" onClick={onCredits}>Where it went</Button>
          </StripLine>
          <StripLine label="Bounce guard" tone={guard.state === "paused" ? "error" : guard.state === "warning" ? "warning" : undefined}>
            {guard.state === "ok" ? "On" : guard.state === "warning" ? "Warning" : "Paused"} · {guard.observedPercent}% of {guard.volume7d.toLocaleString()} in 7 days ·
            {" "}warns at {guard.warnPercent}%, pauses at {guard.pausePercent}% · {paused === 0 ? "nothing paused" : `${plural(paused, "mailbox", "mailboxes")} paused`}
          </StripLine>
          <StripLine label="Agents">
            {plural(seed.agents.filter((a) => a.on).length, "agent")} on · send, add-to-sequence, stage changes and spend over a cap need the owner's approval ·
            {" "}a second approval over {seed.secondApproval.recipients.toLocaleString()} recipients or {seed.secondApproval.credits} credits ·
            {" "}caps {seed.agents.map((a) => credits(a.capPerMonth)).join(" / ")} a month
            {waiting > 0 && <> · <a className="underline underline-offset-4" href={href("/ollopa/agents")}>{waiting} waiting for approval</a></>}
          </StripLine>
          <StripLine label="Credit spike" tone={spiked ? "warning" : undefined}>
            Alert at {c.spikeAlert.multiple}× the usual daily burn · today {c.spikeAlert.todayMultiple}× · {spiked ? "alerted" : "nothing alerted"}
          </StripLine>
          <StripLine label="Do-not-call" tone={dncOverdue ? "error" : undefined}>
            Synchronised {longDay(st.prospecting.dnc.synchronisedOn)} · next due {longDay(st.prospecting.dnc.nextDueOn)}
            {dncOverdue && " · overdue — calls made now are outside safe harbour"}
          </StripLine>
          {upgrades.length > 0 && (
            <StripLine label="Upgrade requests">
              {plural(upgrades.length, "upgrade request")} · {upgrades[0].requester.user} wants {upgrades[0].upgrade!.feature} ({upgrades[0].upgrade!.plan}, {money(upgrades[0].upgrade!.monthlyTotal)} a month for {b.plan.seats} seats)
              {" "}<a className="underline underline-offset-4" href={href("/ollopa/requests")}>Review</a>
            </StripLine>
          )}
        </>
      ) : (
        <>
          <StripLine label="Your credits">
            {mine ? `${credits(mine.used)} used this month${mine.limit ? ` · your limit is ${credits(mine.limit)}` : ""}` : `${credits(c.balance)} left in the workspace`}
            <Button variant="link" size="sm" className="h-auto px-2 text-sm" onClick={onCredits}>Where it went</Button>
          </StripLine>
          <StripLine label="Bounce guard" tone={guard.state === "paused" ? "error" : guard.state === "warning" ? "warning" : undefined}>
            {guard.state === "ok" ? "On" : guard.state === "warning" ? "Warning" : "Paused"} · warns at {guard.warnPercent}%, pauses at {guard.pausePercent}% ·
            {" "}{myMailboxes.length === 0 ? "you have no mailbox here" : myMailboxes.some((m) => m.paused) ? "one of yours is paused" : `${plural(myMailboxes.length, "mailbox", "mailboxes")} of yours, none paused`}
          </StripLine>
          <StripLine label="Agents">
            Agents never overwrite a field you set or confirmed; they propose instead. Sending, enrolling and spending over a cap wait for your approval ·
            {" "}a second approval over {seed.secondApproval.recipients.toLocaleString()} recipients or {seed.secondApproval.credits} credits
          </StripLine>
        </>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------------------------ one row */

function Row({ row, admin, lit }: { row: SettingRow; admin: string; lit: boolean }) {
  const g = row.feature ? gate(row.feature) : null
  // The lock sits at the row, the entry point, and only once: either on the control, or beside the
  // heading of a block. Never on a Save button at the end of work somebody has already done.
  const locked = !!g?.locked
  const wrapped = locked && row.value
    ? <Locked feature={row.label} plan={g!.plan} pricePerMonth={g!.pricePerMonth} what={g!.what}>{row.value}</Locked>
    : row.value

  return (
    <div
      id={`row-${row.id}`}
      data-row={row.id}
      className={cn("border-t border-border/60 px-2 py-2.5 first:border-t-0", lit && "rounded-md bg-amber-100/70 dark:bg-amber-950/40")}
    >
      {row.block ? (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-1.5">
            <h4 className="text-sm font-medium">{row.label}</h4>
            <span className="flex items-center gap-3">
              {row.readOnly && <span className="text-xs text-muted-foreground">set by {admin}</span>}
              {locked && (
                <Locked feature={row.label} plan={g!.plan} pricePerMonth={g!.pricePerMonth} what={g!.what}>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs">{row.label} on {g!.plan}</Button>
                </Locked>
              )}
            </span>
          </div>
          {row.block}
          {row.note && <p className="pt-1.5 text-xs text-muted-foreground">{row.note}</p>}
        </>
      ) : (
        <div className="grid gap-1 sm:grid-cols-[minmax(11rem,16rem)_1fr] sm:items-baseline sm:gap-4">
          <div className="text-sm">{row.label}</div>
          <div className="min-w-0">
            {wrapped}
            {row.note && <p className="mt-1 text-xs text-muted-foreground">{row.note}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

/* ----------------------------------------------------------------------------------- one area */

function Area({ area, one, two, admin, register }: {
  area: string
  one: SettingRow[]
  two: SettingRow[]
  admin: string
  register: (area: string, open: (o: boolean) => void) => void
}) {
  const doorId = `settings.${slug(area)}`
  const [, setOpen] = useDoorState(doorId)
  const s = useSettingsState()
  useEffect(() => { register(area, setOpen) }, [area, register, setOpen])

  return (
    <section id={`area-${slug(area)}`} className="scroll-mt-4 border-b px-4 py-5 sm:px-6">
      <h3 className="pb-2 text-base font-semibold">{area}</h3>
      <div>
        {one.map((r) => <Row key={r.id} row={r} admin={admin} lit={s.lit === r.id} />)}
      </div>
      {two.length > 0 && (
        <div className={cn(one.length > 0 && "mt-2")}>
          <Door id={doorId} label={two.map((r) => r.short).join(", ")} count={two.length}>
            <div>{two.map((r) => <Row key={r.id} row={r} admin={admin} lit={s.lit === r.id} />)}</div>
          </Door>
        </div>
      )}
    </section>
  )
}

/* --------------------------------------------------------------------------------- the search */

interface Hit { id: string; area: string; label: string; value: string }

function SettingsSearch({ rows, onJump, inputRef }: {
  rows: { row: SettingRow; area: string }[]
  onJump: (id: string, area: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  const [q, setQ] = useState("")
  const [active, setActive] = useState(0)

  const hits: Hit[] = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return []
    return rows
      .filter(({ row, area }) =>
        row.label.toLowerCase().includes(needle) ||
        row.short.toLowerCase().includes(needle) ||
        area.toLowerCase().includes(needle) ||
        (row.keywords ?? []).some((k) => k.toLowerCase().includes(needle)))
      .slice(0, 8)
      .map(({ row, area }) => ({ id: row.id, area, label: row.label, value: row.short }))
  }, [q, rows])

  return (
    <div className="relative w-full sm:w-80">
      <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" aria-hidden="true" />
      <Input
        ref={inputRef}
        className="h-9 pl-8"
        placeholder="Find a setting…"
        aria-label="Find a setting"
        aria-expanded={hits.length > 0}
        value={q}
        onChange={(e) => { setQ(e.target.value); setActive(0) }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)) }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
          if (e.key === "Enter" && hits[active]) { e.preventDefault(); onJump(hits[active].id, hits[active].area); setQ("") }
          if (e.key === "Escape") { setQ(""); (e.target as HTMLInputElement).blur() }
        }}
      />
      <kbd className="pointer-events-none absolute right-2 top-2 rounded border px-1 font-mono text-[10px] text-muted-foreground">/</kbd>
      {hits.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border bg-background shadow-md" role="listbox">
          {hits.map((h, i) => (
            <li key={h.id}>
              <button
                role="option"
                aria-selected={i === active}
                className={cn("block w-full px-3 py-1.5 text-left text-sm", i === active && "bg-muted")}
                onMouseEnter={() => setActive(i)}
                onClick={() => { onJump(h.id, h.area); setQ("") }}
              >
                <span className="text-muted-foreground">{h.area} › </span>{h.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------------------ the page */

export function SettingsPage({ session, node }: { session: Session; node?: string }) {
  return (
    <SettingsState>
      <SettingsBody session={session} node={node} />
    </SettingsState>
  )
}

function SettingsBody({ session, node }: { session: Session; node?: string }) {
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const st = settingsFor(session.business)
  const state = useSettingsState()
  const d = useDisclosure("settings")
  const admin = b.roles.find((r) => r.role === "admin")?.user ?? "your admin"
  const adminTitle = b.roles.find((r) => r.role === "admin")?.title ?? "RevOps admin"

  const [viewing, setViewing] = useState<User | null>(null)
  const [panel, setPanel] = useState<PanelRequest | null>(null)
  const [creditsOpen, setCreditsOpen] = useState(false)
  const search = useRef<HTMLInputElement>(null)
  const openers = useRef<Record<string, (o: boolean) => void>>({})

  const effectiveUser = viewing ? viewing.name : session.user
  const role: Role = viewing ? viewing.role : session.role
  const hasReports = viewing ? viewing.reports.length > 0 : session.hasReports
  const isAdmin = role === "admin"

  const viewAs = useCallback((user: User) => {
    const g = gate("view-as", session.business)
    if (g.locked) { toast(`View as a teammate is on ${g.plan}. It is a row in Team and access with its price.`); return }
    setViewing(user)
  }, [session.business])

  const jump = useCallback((id: string, area: string) => {
    openers.current[area]?.(true)
    state.light(id)
    window.setTimeout(() => {
      const el = document.getElementById(`row-${id}`)
      el?.scrollIntoView({ block: "center", behavior: "smooth" })
      el?.querySelector<HTMLElement>("input, button, [role=combobox], a")?.focus()
    }, 60)
  }, [state])

  const ctx = useMemo(() => ({
    session, user: effectiveUser, role, business: session.business, seed, b, st, admin, isAdmin,
    open: (p: PanelRequest) => setPanel(p),
    viewAs,
    search: (query: string) => { search.current?.focus(); search.current!.value = query; toast(`Search: ${query}`) },
  }), [session, effectiveUser, role, seed, b, st, admin, isAdmin, viewAs])

  const rows = rowsFor(ctx)
  const personal = personalRows(ctx)
  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows])

  // The level comes from the usage model for the seat being read: the signed-in one, or the
  // teammate's while View as is on. Nothing here is a hard-coded list.
  const level = useCallback((item: UsageItem) => levelOf(item, session.business, role, hasReports), [session.business, role, hasReports])
  const weekly = useCallback((item: UsageItem) => weeklyUse(item, session.business, role, hasReports), [session.business, role, hasReports])

  const present = d.items.filter((i) => weekly(i) > 0 && byId.has(i.id))
  const areas = AREA_ORDER
    .map((area) => {
      const items = present.filter((i) => i.area === area)
      const one = items.filter((i) => level(i) === 1).map((i) => byId.get(i.id)!)
      return {
        area,
        one: area === "You" ? [...personal, ...one] : one,
        two: items.filter((i) => level(i) === 2).map((i) => byId.get(i.id)!),
      }
    })
    .filter((a) => a.one.length + a.two.length > 0)

  const searchable = areas.flatMap((a) => [...a.one, ...a.two].map((row) => ({ row, area: a.area })))

  // `/` focuses the settings search, from anywhere on the page that is not already a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); search.current?.focus() }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  // A deep link to an area opens on that area.
  useEffect(() => {
    const area = node ? AREA_BY_NODE[node] : undefined
    if (!area) return
    const el = document.getElementById(`area-${slug(area)}`)
    el?.scrollIntoView({ block: "start" })
  }, [node, areas.length])

  const register = useCallback((area: string, open: (o: boolean) => void) => { openers.current[area] = open }, [])

  // The page scrolls in the shell's main region, not in a box of its own: the strip is the first
  // thing you read and then it scrolls away, and a deep link to an area lands on the area.
  return (
    <div>
      {viewing && (
        <div role="status" className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b bg-foreground px-4 py-2 text-sm text-background sm:px-6">
          <span>
            Viewing as {viewing.name} ({viewing.title}{viewing.team ? `, ${viewing.team}` : ""}). This is their Settings page, not yours.
          </span>
          <Button size="sm" variant="secondary" className="h-7 px-2 text-xs" onClick={() => setViewing(null)}>Exit</Button>
        </div>
      )}

      <DoorGroup>
        <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-5 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold">Settings</h2>
            <p className="text-sm text-muted-foreground">{seed.workspace.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <SettingsSearch rows={searchable} onJump={jump} inputRef={search} />
            <ExpandAll />
          </div>
        </div>

        <div className="mt-3">
          <Strip session={session} role={role} user={effectiveUser} onCredits={() => setCreditsOpen(true)} />
        </div>

        <div>
          <div className="lg:flex lg:items-start">
            {/* The in-page index is a table of contents, not navigation to other pages. */}
            <nav aria-label="Areas" className="hidden shrink-0 lg:sticky lg:top-2 lg:block lg:w-56 lg:py-5 lg:pl-6">
              <ul className="grid gap-0.5">
                {areas.map((a) => (
                  <li key={a.area}>
                    <a className="block rounded px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground" href={`#area-${slug(a.area)}`}
                      onClick={(e) => { e.preventDefault(); document.getElementById(`area-${slug(a.area)}`)?.scrollIntoView({ block: "start", behavior: "smooth" }) }}>
                      {a.area}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="min-w-0 flex-1">
              <div className="px-4 pt-4 lg:hidden">
                <Select onValueChange={(v) => document.getElementById(`area-${v}`)?.scrollIntoView({ block: "start" })}>
                  <SelectTrigger className="h-9" aria-label="Jump to an area"><SelectValue placeholder="Jump to…" /></SelectTrigger>
                  <SelectContent>{areas.map((a) => <SelectItem key={a.area} value={slug(a.area)}>{a.area}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {areas.map((a) => <Area key={a.area} area={a.area} one={a.one} two={a.two} admin={admin} register={register} />)}

              {!isAdmin && (
                <p className="px-4 py-6 text-sm text-muted-foreground sm:px-6">
                  Workspace settings (team, email domains, prospecting rules, pipeline, agents, integrations, plan and billing) are managed by {admin}, {adminTitle}.
                </p>
              )}
            </div>
          </div>
        </div>
      </DoorGroup>

      <SaveBar />

      <CreditsPanel session={session} open={creditsOpen} onOpenChange={setCreditsOpen} />
      <MailboxPanel session={session} mailbox={panel?.kind === "mailbox" ? panel.mailbox : null} open={panel?.kind === "mailbox"} onOpenChange={() => setPanel(null)} />
      <DomainPanel domain={panel?.kind === "domain" ? panel.domain : null} readOnly={!isAdmin} admin={admin} open={panel?.kind === "domain"} onOpenChange={() => setPanel(null)} />
      <UserPanel session={session} user={panel?.kind === "user" ? panel.user : null} open={panel?.kind === "user"} onOpenChange={() => setPanel(null)} />
      <RemovalPanel session={session} open={panel?.kind === "removal"} onOpenChange={() => setPanel(null)} />
      <KeyPanel session={session} apiKey={panel?.kind === "key" ? panel.apiKey : null} open={panel?.kind === "key"} onOpenChange={() => setPanel(null)} />
      <HookPanel session={session} hook={panel?.kind === "hook" ? panel.hook : null} open={panel?.kind === "hook"} onOpenChange={() => setPanel(null)} />
      <McpScopePanel session={session} token={panel?.kind === "mcp" ? panel.token : null} open={panel?.kind === "mcp"} onOpenChange={() => setPanel(null)} />
      <CliPanel session={session} open={panel?.kind === "cli"} onOpenChange={() => setPanel(null)} />
      <ScorePanel session={session} model={panel?.kind === "score" ? panel.model : null} open={panel?.kind === "score"} onOpenChange={() => setPanel(null)} />
      <PersonaPanel persona={panel?.kind === "persona" ? panel.persona : null} open={panel?.kind === "persona"} onOpenChange={() => setPanel(null)} />
      <SignalPanel signal={panel?.kind === "signal" ? panel.signal : null} open={panel?.kind === "signal"} onOpenChange={() => setPanel(null)} />
      <TerritoryPanel territory={panel?.kind === "territory" ? panel.territory : null} open={panel?.kind === "territory"} onOpenChange={() => setPanel(null)} />
      <FieldPanel field={panel?.kind === "field" ? panel.field : null} stages={seed.pipelines[0]?.stages.map((s) => s.name) ?? []} open={panel?.kind === "field"} onOpenChange={() => setPanel(null)} />
      <ListPanel
        title={panel?.kind === "list" ? panel.title : ""}
        rows={panel?.kind === "list" ? panel.rows : []}
        dependsOn={panel?.kind === "list" ? panel.dependsOn : undefined}
        open={panel?.kind === "list"}
        onOpenChange={() => setPanel(null)}
      />
    </div>
  )
}
