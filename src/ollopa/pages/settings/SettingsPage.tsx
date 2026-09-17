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
import { ruleOn, useLesson } from "@/learn/context"
import { PARODY_IDS, ParodyShell } from "./parody"
import { gate } from "../../ui/gate"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { seedFor, type User } from "../../data/seed"
import { levelOf, weeklyUse, type Role, type UsageItem } from "../../usage/model"
import type { Session } from "../../session"
import { CreditsPanel } from "../../shell/Credits"
import { settingsFor } from "./derived"
import { credits, longDay, money, plural } from "./format"
import { Row, personalRows, rowsFor, type PanelRequest, type SettingRow } from "./rows"
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

/**
 * Settings the category has nowhere at all, so the common version cannot show them and they arrive
 * with the rule that creates them. Each is recorded as missing by the memo or by spec 14 §8, and
 * none of them is a problem this case invented.
 *
 * Rule 7: no delete control ("no self-serve control... an admin must contact Support", memo §1.3); no
 * upgrade-request queue; no credit-spike threshold; no second-approval threshold, which was a number
 * inside a send dialog; no published API limits, cost table, per-key spend or 80% alert; no written
 * webhook delivery contract.
 *
 * Rule 1: there is no agent settings page at all (memo §5, "Apollo does not ship a standalone AI SDR
 * agent settings page"), so which agents are on, the no-overwrite rule and the team credit budget
 * have no home; nor do the forecast target, the submission window, renewal reminders, expansion
 * routing or the first-value signal (spec 14 §8).
 *
 * Rule 5: the workspace profile, the seats, the pages the profile leaves out and the running
 * exposure. Before rule 5 the sidebar was simply the sidebar and none of these existed.
 */
const LATER = new Set([
  "plan.delete", "plan.upgrade-requests", "plan.spike-alert", "ai.second-approval",
  "dev.limits", "dev.cost-table", "dev.key-spend", "dev.alert-80", "dev.hook-contract",
  "ai.agents", "ai.no-overwrite", "ai.credit-caps", "plan.team-budget",
  "pipe.goal", "pipe.submission-window", "pipe.renewal-reminders",
  "score.expansion-routing", "score.first-value",
  "work.profile", "work.seats", "work.left-out", "work.exposure",
])

/* ----------------------------------------------------------------------------------- the strip */

function StripLine({ item, label, children, tone }: { item: string; label: string; children: ReactNode; tone?: "warning" | "error" }) {
  return (
    <div data-item={item} data-item-label={label} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-1">
      <span className="w-36 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn("min-w-0 flex-1 text-sm", tone === "warning" && "text-amber-700 dark:text-amber-400", tone === "error" && "text-destructive")}>
        {children}
      </span>
    </div>
  )
}

function Strip({ session, role, user, onCredits, homeless }: { session: Session; role: Role; user: string; onCredits: () => void; homeless?: boolean }) {
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
    <section aria-label="What this workspace costs and what can spend or stop it" data-container="strip" data-container-label="the strip" className="border-b bg-muted/30 px-4 py-3 sm:px-6">
      {isAdmin ? (
        <>
          <StripLine item="plan.price" label="Plan and price">
            {b.plan.name} · {b.plan.seats} seats · {money(ws.plan.monthlyTotal)} a month, billed {ws.plan.billing === "annual" ? "annually" : "monthly"} · renews {longDay(ws.plan.renews)}
            <Button variant="link" size="sm" className="h-auto px-2 text-sm" onClick={() => toast("Change plan: seats, plan cards and the total, with Due today on screen.")}>Change plan</Button>
            <Button variant="link" size="sm" data-item="plan.cancel" data-item-label="Cancel plan" className="h-auto px-0 text-sm" onClick={() => setCancelling(true)}>Cancel plan</Button>
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
          <StripLine item="plan.credits" label="Credits" tone={runsOutFirst ? "warning" : undefined}>
            {credits(c.balance)} of {credits(c.monthlyCap)} left this month · {credits(c.burnPerWeek)} a week ·{" "}
            {runsOutFirst ? `runs out about ${longDay(c.runsOutOn)}, before the cycle ends on ${longDay(c.cycleEnds)}` : `lasts to about ${longDay(c.runsOutOn)}`}
            <Button variant="link" size="sm" className="h-auto px-2 text-sm" onClick={onCredits}>Where it went</Button>
          </StripLine>
          <StripLine item="mail.bounce-guard" label="Bounce guard" tone={guard.state === "paused" ? "error" : guard.state === "warning" ? "warning" : undefined}>
            {guard.state === "ok" ? "On" : guard.state === "warning" ? "Warning" : "Paused"} · {guard.observedPercent}% of {guard.volume7d.toLocaleString()} in 7 days ·
            {" "}warns at {guard.warnPercent}%, pauses at {guard.pausePercent}% · {paused === 0 ? "nothing paused" : `${plural(paused, "mailbox", "mailboxes")} paused`}
          </StripLine>
          <StripLine item="ai.approvals" label="Agents">
            {plural(seed.agents.filter((a) => a.on).length, "agent")} on · send, add-to-sequence, stage changes and spend over a cap need the owner's approval ·
            {" "}<span data-item="ai.second-approval" data-item-label="Second approval">a second approval over {seed.secondApproval.recipients.toLocaleString()} recipients or {seed.secondApproval.credits} credits</span> ·
            {" "}<span data-item="ai.credit-caps" data-item-label="Agent credit caps">caps {seed.agents.map((a) => credits(a.capPerMonth)).join(" / ")} a month</span>
            {waiting > 0 && <> · <a className="underline underline-offset-4" href={href("/ollopa/agents")}>{waiting} waiting for approval</a></>}
          </StripLine>
          <StripLine item="plan.spike-alert" label="Credit spike" tone={spiked ? "warning" : undefined}>
            Alert at {c.spikeAlert.multiple}× the usual daily burn · today {c.spikeAlert.todayMultiple}× · {spiked ? "alerted" : "nothing alerted"}
          </StripLine>
          <StripLine item="pros.dnc" label="Do-not-call" tone={dncOverdue ? "error" : undefined}>
            Synchronised {longDay(st.prospecting.dnc.synchronisedOn)} · next due {longDay(st.prospecting.dnc.nextDueOn)}
            {dncOverdue && " · overdue — calls made now are outside safe harbour"}
          </StripLine>
          {homeless && (
            <>
              {/* Decision-critical facts the category's settings have no page for at all: the memo
                  records no delete control ("no self-serve control"), no published API limits and no
                  written delivery contract. Rule 7 puts them on screen before rule 1 gives them an
                  area to live in, so at the next step they move from here into their own areas. */}
              <StripLine item="plan.delete" label="Delete workspace">
                Deletes {seed.contacts.length.toLocaleString()} contacts, {plural(seed.sequences.length, "sequence")} and every person's data.
                {" "}Fourteen days to change your mind, then it is gone. Export first.
              </StripLine>
              <StripLine item="dev.limits" label="API limits">
                200 a minute · 6,000 an hour · 50,000 a day, per workspace, not per key
                {" "}· <span data-item="dev.cost-table" data-item-label="Cost per endpoint">published cost per endpoint, typical and maximum</span>
                {" "}· <span data-item="dev.key-spend" data-item-label="Spend per key">spend per key against the same balance</span>
                {" "}· <span data-item="dev.alert-80" data-item-label="Alert the key's owner at 80%">the key's owner is told at 80%</span>
              </StripLine>
              <StripLine item="dev.hook-contract" label="Webhooks">
                At least once, signed, attempt-numbered, retried for 24 hours, never silently disabled, and anything missed is readable from the reconciliation endpoint
              </StripLine>
            </>
          )}
          {upgrades.length > 0 && (
            <StripLine item="plan.upgrade-requests" label="Upgrade requests">
              {plural(upgrades.length, "upgrade request")} · {upgrades[0].requester.user} wants {upgrades[0].upgrade!.feature} ({upgrades[0].upgrade!.plan}, {money(upgrades[0].upgrade!.monthlyTotal)} a month for {b.plan.seats} seats)
              {" "}<a className="underline underline-offset-4" href={href("/ollopa/requests")}>Review</a>
            </StripLine>
          )}
        </>
      ) : (
        <>
          <StripLine item="plan.credits" label="Your credits">
            {mine ? `${credits(mine.used)} used this month${mine.limit ? ` · your limit is ${credits(mine.limit)}` : ""}` : `${credits(c.balance)} left in the workspace`}
            <Button variant="link" size="sm" className="h-auto px-2 text-sm" onClick={onCredits}>Where it went</Button>
          </StripLine>
          <StripLine item="mail.bounce-guard" label="Bounce guard" tone={guard.state === "paused" ? "error" : guard.state === "warning" ? "warning" : undefined}>
            {guard.state === "ok" ? "On" : guard.state === "warning" ? "Warning" : "Paused"} · warns at {guard.warnPercent}%, pauses at {guard.pausePercent}% ·
            {" "}{myMailboxes.length === 0 ? "you have no mailbox here" : myMailboxes.some((m) => m.paused) ? "one of yours is paused" : `${plural(myMailboxes.length, "mailbox", "mailboxes")} of yours, none paused`}
          </StripLine>
          <StripLine item="ai.approvals" label="Agents">
            Agents never overwrite a field you set or confirmed; they propose instead. Sending, enrolling and spending over a cap wait for your approval ·
            {" "}a second approval over {seed.secondApproval.recipients.toLocaleString()} recipients or {seed.secondApproval.credits} credits
          </StripLine>
        </>
      )}
    </section>
  )
}

/* ----------------------------------------------------------------------------------- one area */

/**
 * The names the category gives these areas, used until rule 4 renames every one by its contents.
 * Each is in the memo's sidebar (§6) or its "observed inconsistencies" list.
 */
const VAGUE_AREA: Record<string, string> = {
  "Team and access": "Users and teams",
  "Email sending": "Email setup and health",
  "Prospecting rules": "Rules of engagement",
  "Pipeline and data": "Objects, fields, stages",
  "Sequences": "Team email & sequences",
  "Signals, scoring and personas": "Ideal customer profile",
  "Agents and AI": "AI context center",
  "API, webhooks, MCP and CLI": "Integrations · developer",
  "Plan, billing and usage": "Credits and activity",
}

/**
 * The sub-pages the category puts inside these areas as a second row of horizontal tabs. They are
 * the third level rule 2 forbids, so from step 3 they are gone and the rows sit in the area.
 * Memo §6: "Sub-pages often add a second navigation level as horizontal tabs across the top".
 */
const TAB_GROUPS: Record<string, { id: string; label: string; items: string[] }[]> = {
  "Team and access": [
    { id: "users", label: "Users", items: ["team.users", "team.offboarding", "team.availability"] },
    { id: "teams", label: "Teams", items: ["team.teams"] },
    { id: "profiles", label: "Permission profiles", items: ["team.profiles", "team.grants", "team.viewas", "mail.unsubscribe-permission"] },
    { id: "security", label: "Security", items: ["sec.mfa", "sec.ip", "sec.password", "sec.session", "sec.sso"] },
  ],
  "Email sending": [
    { id: "overview", label: "Overview", items: ["mail.tracking", "mail.signature"] },
    { id: "domains", label: "Domains", items: ["mail.domains"] },
    { id: "mailboxes", label: "Mailboxes", items: ["mail.mailboxes", "mail.warmup", "mail.limits", "mail.tracking-subdomain"] },
    { id: "policies", label: "Sending policies", items: ["mail.bounce-guard", "mail.catch-all", "mail.unsubscribe-text"] },
  ],
  "Sequences": [
    { id: "rulesets", label: "Sequence rulesets", items: ["seq.rulesets"] },
    { id: "priority", label: "Priority settings", items: ["seq.priority"] },
    { id: "schedules", label: "Schedules", items: ["seq.schedules"] },
  ],
  "Pipeline and data": [
    { id: "contact", label: "Contact fields & stages", items: ["pipe.contact-stages", "pipe.fields"] },
    { id: "deal", label: "Deal fields & stages", items: ["pipe.stages", "pipe.currency", "pipe.required-at-stage", "pipe.deal-warnings", "pipe.forecast-categories", "pipe.goal", "pipe.submission-window", "pipe.renewal-reminders"] },
    { id: "waterfall", label: "Waterfall enrichment", items: ["pipe.enrichment-order"] },
  ],
  "Plan, billing and usage": [
    { id: "plan", label: "Plan overview", items: ["plan.seats", "plan.cancel", "plan.upgrade-requests", "plan.delete"] },
    { id: "credits", label: "Credit usage", items: ["plan.credits", "plan.credit-breakdown", "plan.spike-alert", "plan.team-budget"] },
    { id: "billing", label: "Billing", items: ["plan.invoices", "plan.tax-id", "plan.export", "plan.price"] },
  ],
}

/** A row of tabs inside an area: a level the disclosed page does not have. */
function AreaTabs({ area, rows, admin, honest }: { area: string; rows: SettingRow[]; admin: string; honest: boolean }) {
  const groups = TAB_GROUPS[area]
  const named = new Set(groups.flatMap((g) => g.items))
  const shown = groups.map((g) => ({ ...g, rows: rows.filter((r) => g.items.includes(r.id)) })).filter((g) => g.rows.length > 0)
  const rest = rows.filter((r) => !named.has(r.id))
  const [active, setActive] = useState(shown[0]?.id ?? "")

  return (
    <>
      {shown.length > 0 && (
        <>
          <div role="tablist" aria-label={`${area} pages`} className="mb-2 flex flex-wrap gap-1 border-b">
            {shown.map((g) => (
              <button
                key={g.id}
                role="tab"
                aria-selected={active === g.id}
                onClick={() => setActive(g.id)}
                className={cn("-mb-px border-b-2 px-3 py-1.5 text-sm", active === g.id ? "border-foreground font-medium" : "border-transparent text-muted-foreground")}
              >
                {g.label}
              </button>
            ))}
          </div>
          {shown.map((g) => (
            <div
              key={g.id}
              role="tabpanel"
              data-container={`tab.${slug(area)}.${g.id}`}
              data-container-label={`${area} › ${g.label}`}
              data-open={active === g.id ? "true" : "false"}
              hidden={active !== g.id}
            >
              {g.rows.map((r) => <Row key={r.id} row={r} admin={admin} honest={honest} />)}
            </div>
          ))}
        </>
      )}
      {rest.length > 0 && <div>{rest.map((r) => <Row key={r.id} row={r} admin={admin} honest={honest} />)}</div>}
    </>
  )
}

function Area({ area, one, two, admin, register, flat, honest }: {
  area: string
  one: SettingRow[]
  two: SettingRow[]
  admin: string
  register: (area: string, open: (o: boolean) => void) => void
  /** Rule 2: no second row of tabs inside the area. */
  flat: boolean
  /** Rule 4: the area is named by its contents and the door lists what is behind it. */
  honest: boolean
}) {
  const doorId = `settings.${slug(area)}`
  const [, setOpen] = useDoorState(doorId)
  useEffect(() => { register(area, setOpen) }, [area, register, setOpen])
  const tabbed = !flat && !!TAB_GROUPS[area] && one.length > 0

  return (
    <section id={`area-${slug(area)}`} className="scroll-mt-4 border-b px-4 py-5 sm:px-6">
      <h3 className="pb-2 text-base font-semibold">{honest ? area : VAGUE_AREA[area] ?? area}</h3>
      <div data-container={`area.${slug(area)}`} data-container-label={area}>
        {tabbed
          ? <AreaTabs area={area} rows={one} admin={admin} honest={honest} />
          : one.map((r) => <Row key={r.id} row={r} admin={admin} honest={honest} />)}
      </div>
      {two.length > 0 && (
        <div className={cn(one.length > 0 && "mt-2")}>
          <Door
            id={doorId}
            label={honest ? two.map((r) => r.short).join(", ") : "Advanced"}
            count={honest ? two.length : undefined}
          >
            <div>{two.map((r) => <Row key={r.id} row={r} admin={admin} honest={honest} />)}</div>
          </Door>
        </div>
      )}
    </section>
  )
}

/* --------------------------------------------------------------------------------- the search */

interface Hit { id: string; area: string; label: string; value: string }

function SettingsSearch({ rows, onJump, inputRef, accelerators = true }: {
  rows: { row: SettingRow; area: string }[]
  onJump: (id: string, area: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  /** Rule 8. Off: the box finds an area and scrolls to its heading, and there is no `/` to learn. */
  accelerators?: boolean
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
    <div data-item="settings.search" data-item-label="The settings search" className="relative w-full sm:w-80">
      <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" aria-hidden="true" />
      <Input
        ref={inputRef}
        className={cn("h-9 pl-8", !accelerators && "pr-2")}
        placeholder={accelerators ? "Find a setting…" : "Search settings"}
        aria-label={accelerators ? "Find a setting" : "Search settings"}
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
      {accelerators && <kbd className="pointer-events-none absolute right-2 top-2 rounded border px-1 font-mono text-[10px] text-muted-foreground">/</kbd>}
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
  // In the product `useLesson()` is null and `ruleOn` answers true for every rule: what follows is
  // the page as it ships. On a lesson stage each flag is the one rule that step turned on.
  const lesson = useLesson()
  const rare = ruleOn(lesson, 1)          // one page in the main navigation, levels from the usage model
  const twoLevels = ruleOn(lesson, 2)     // no second row of tabs inside an area
  const honest = ruleOn(lesson, 4)        // areas and doors named by their contents; a lock is a real control
  const together = ruleOn(lesson, 5)      // How your team works, and the pairs in one place
  const critical = ruleOn(lesson, 7)      // the strip
  const accelerators = ruleOn(lesson, 8)  // the search jumps to a setting, and `/` is taught
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

  // Rule 5 creates the four rows of "How your team works" and brings the unsubscribe pair together.
  // Until it lands, the pair sits where the category puts it: the text under the person's own
  // profile, the permission to disable it under Permission profiles (memo §1.2, §1.3).
  const SPLIT_AREA: Record<string, string> = { "mail.unsubscribe-text": "You", "mail.unsubscribe-permission": "Team and access" }
  const areaOf = (i: UsageItem) => (together ? i.area : SPLIT_AREA[i.id] ?? i.area)

  const present = d.items.filter((i) => weekly(i) > 0 && byId.has(i.id) && (together || i.area !== "How your team works"))
  const areas = AREA_ORDER
    .map((area) => {
      const items = present.filter((i) => areaOf(i) === area)
      const one = items.filter((i) => level(i) === 1).map((i) => byId.get(i.id)!)
      return {
        area,
        one: area === "You" ? [...personal, ...one] : one,
        two: items.filter((i) => level(i) === 2).map((i) => byId.get(i.id)!),
      }
    })
    .filter((a) => a.one.length + a.two.length > 0)

  const searchable = areas.flatMap((a) => [...a.one, ...a.two].map((row) => ({ row, area: a.area })))
  // Until rule 4 the index reads the same vague names the area headings do: the two never disagree.
  const areaLabel = (area: string) => (honest ? area : VAGUE_AREA[area] ?? area)

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

  const stripEl = critical
    ? <Strip session={session} role={role} user={effectiveUser} onCredits={() => setCreditsOpen(true)} homeless={!rare} />
    : null

  // Rule 1 off: the settings shell. The same rows, the same seat, dealt into the pages, groups,
  // tabs and drawers the category ships (spec 14 §5, the memo). Nothing is drawn a second time.
  if (!rare) {
    if (import.meta.env.DEV) {
      const homed = new Set(PARODY_IDS)
      const lost = present.map((i) => i.id).filter((id) => !homed.has(id) && !LATER.has(id))
      if (lost.length) console.warn("[settings] no parody home and not declared later:", lost)
    }
    return (
      <>
        <ParodyShell
          ctx={ctx}
          rows={[...rows, ...personal]}
          present={new Set(present.map((i) => i.id).concat(personal.map((r) => r.id)))}
          strip={stripEl}
        />
        <SaveBar />
        <CreditsPanel session={session} open={creditsOpen} onOpenChange={setCreditsOpen} />
      </>
    )
  }

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
            <SettingsSearch rows={searchable} onJump={jump} inputRef={search} accelerators={accelerators} />
            {together && <ExpandAll />}
          </div>
        </div>

        {stripEl && <div className="mt-3">{stripEl}</div>}

        <div>
          <div className="lg:flex lg:items-start">
            {/* The in-page index is a table of contents, not navigation to other pages. */}
            <nav aria-label="Areas" className="hidden shrink-0 lg:sticky lg:top-2 lg:block lg:w-56 lg:py-5 lg:pl-6">
              <ul className="grid gap-0.5">
                {areas.map((a) => (
                  <li key={a.area}>
                    <a className="block rounded px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground" href={`#area-${slug(a.area)}`}
                      onClick={(e) => { e.preventDefault(); document.getElementById(`area-${slug(a.area)}`)?.scrollIntoView({ block: "start", behavior: "smooth" }) }}>
                      {areaLabel(a.area)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="min-w-0 flex-1">
              <div className="px-4 pt-4 lg:hidden">
                <Select onValueChange={(v) => document.getElementById(`area-${v}`)?.scrollIntoView({ block: "start" })}>
                  <SelectTrigger className="h-9" aria-label="Jump to an area"><SelectValue placeholder="Jump to…" /></SelectTrigger>
                  <SelectContent>{areas.map((a) => <SelectItem key={a.area} value={slug(a.area)}>{areaLabel(a.area)}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {areas.map((a) => (
                <Area key={a.area} area={a.area} one={a.one} two={a.two} admin={admin} register={register} flat={twoLevels} honest={honest} />
              ))}

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
