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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { href, useRoute } from "@/app/router"
import { RETURN_HIGHLIGHT_MS } from "../../chain"
import { Door, DoorGroup, ExpandAll, useDoorState } from "../../ui/Door"
import { Actions } from "../../ui/Actions"
import { FamilyIcon } from "../../ui/Identity"
import { Fields, Section, SettingsPage as SettingsLayout, type Field } from "../../layouts"
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
import { JUMP_EVENT, leaveSettings } from "./leave"
import { useSidebarMove } from "../setup/moved"
import { credits, longDay, money, plural } from "./format"
import { RowList, personalRows, rowsFor, type PanelRequest, type SettingRow } from "./rows"
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
 * Settings is neutral, but two of its areas are about another family's objects, and the eye should
 * recognise them from the sidebar: the sequences area is Engagement, the agents area is Agents
 * (DESIGN.md §5). Every other area is the page's own neutral.
 */
const AREA_FAMILY: Record<string, string | undefined> = {
  "Sequences": "sequences",
  "Agents and AI": "agents",
}

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

/** A state word is a shadcn Badge; the variant is the library's, and the page invents no colour. */
const STATE_BADGE: Record<"active" | "warning" | "auto-paused" | "none", "secondary" | "outline" | "destructive"> = {
  active: "secondary",
  warning: "outline",
  "auto-paused": "destructive",
  none: "outline",
}

/** A value that opens with its state word, so the colour never has to be read on its own (DESIGN §5). */
function Stated({ state, word, children }: {
  state: "active" | "warning" | "auto-paused" | "none"
  word: string
  children: ReactNode
}) {
  return (
    <>
      <Badge variant={STATE_BADGE[state]} className="mr-1.5 align-middle">{word}</Badge>
      {children}
    </>
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

  // One fact to a field, at most three joined with "·" in a value, and no prose in the body
  // (LAYOUTS.md §2). Every field keeps the usage-model id the search jump, the `?row=` arrival and
  // the trail read, so splitting a wall of clauses into fields costs none of them.
  const fields: Field[] = isAdmin
    ? [
      { id: "plan", label: "Plan", value: `${b.plan.name} · ${b.plan.seats} seats`, "data-item": "plan.price", "data-item-label": "Plan and price" },
      { id: "price", label: "Price", value: `${money(ws.plan.monthlyTotal)} a month`, note: ws.plan.billing === "annual" ? "Billed annually" : "Billed monthly" },
      { id: "renews", label: "Renews", value: longDay(ws.plan.renews) },
      {
        id: "credits", label: "Credits",
        value: (
          <Stated state={runsOutFirst ? "warning" : "active"} word={runsOutFirst ? "Runs out early" : "Healthy"}>
            {credits(c.balance)} of {credits(c.monthlyCap)} left this month
          </Stated>
        ),
        note: runsOutFirst
          ? `${credits(c.burnPerWeek)} a week · runs out about ${longDay(c.runsOutOn)}, before the cycle ends ${longDay(c.cycleEnds)}`
          : `${credits(c.burnPerWeek)} a week · lasts to about ${longDay(c.runsOutOn)}`,
        action: <Actions surface="card" items={[{ label: "Where it went", kind: "secondary", onClick: onCredits }]} />,
        "data-item": "plan.credits", "data-item-label": "Credits",
      },
      {
        id: "guard", label: "Bounce guard",
        value: (
          <Stated
            state={guard.state === "paused" ? "auto-paused" : guard.state === "warning" ? "warning" : "active"}
            word={guard.state === "paused" ? "Paused" : guard.state === "warning" ? "Warning" : "On"}
          >
            {guard.observedPercent}% of {guard.volume7d.toLocaleString()} in 7 days
          </Stated>
        ),
        note: `Warns at ${guard.warnPercent}% · pauses at ${guard.pausePercent}% · ${paused === 0 ? "nothing paused" : `${plural(paused, "mailbox", "mailboxes")} paused`}`,
        "data-item": "mail.bounce-guard", "data-item-label": "Bounce guard",
      },
      {
        id: "agents", label: "Agents", value: `${plural(seed.agents.filter((a) => a.on).length, "agent")} on`,
        action: waiting > 0
          ? (
            <Actions surface="card" items={[{
              label: `${waiting} waiting for approval`, kind: "link", href: href("/ollopa/agents"),
              onClick: () => leaveSettings("/ollopa/agents", "ai.approvals"),
            }]} />
          )
          : undefined,
        "data-item": "ai.approvals", "data-item-label": "Agents",
      },
      { id: "owner-approves", label: "The owner approves", value: "Send · add to a sequence · change a stage", note: "And any spend over a cap" },
      {
        id: "second", label: "A second approval",
        value: `Over ${seed.secondApproval.recipients.toLocaleString()} recipients · over ${seed.secondApproval.credits} credits`,
        "data-item": "ai.second-approval", "data-item-label": "Second approval",
      },
      {
        id: "caps", label: "Agent credit caps", value: `${seed.agents.map((a) => credits(a.capPerMonth)).join(" / ")} a month`,
        "data-item": "ai.credit-caps", "data-item-label": "Agent credit caps",
      },
      {
        id: "spike", label: "Credit spike",
        value: (
          <Stated state={spiked ? "auto-paused" : "none"} word={spiked ? "Alerted" : "Quiet"}>
            {c.spikeAlert.multiple}× the usual daily burn · today {c.spikeAlert.todayMultiple}×
          </Stated>
        ),
        "data-item": "plan.spike-alert", "data-item-label": "Credit spike",
      },
      {
        id: "dnc", label: "Do-not-call",
        value: (
          <Stated state={dncOverdue ? "auto-paused" : "active"} word={dncOverdue ? "Overdue" : "Current"}>
            Synchronised {longDay(st.prospecting.dnc.synchronisedOn)} · next due {longDay(st.prospecting.dnc.nextDueOn)}
          </Stated>
        ),
        "data-item": "pros.dnc", "data-item-label": "Do-not-call",
      },
      // Decision-critical facts the category's settings have no page for at all, on screen here
      // until rule 1 gives each an area of its own.
      ...(homeless ? [
        {
          id: "delete", label: "Delete workspace",
          value: `${seed.contacts.length.toLocaleString()} contacts · ${plural(seed.sequences.length, "sequence")} · every person's data`,
          note: "14 days to change your mind",
          "data-item": "plan.delete", "data-item-label": "Delete workspace",
        },
        {
          id: "limits", label: "API limits", value: "200 a minute · 6,000 an hour · 50,000 a day",
          note: "Per workspace, not per key",
          "data-item": "dev.limits", "data-item-label": "API limits",
        },
        { id: "cost-table", label: "Cost per endpoint", value: "Published · typical and maximum", "data-item": "dev.cost-table", "data-item-label": "Cost per endpoint" },
        { id: "key-spend", label: "Spend per key", value: "Against the same balance", "data-item": "dev.key-spend", "data-item-label": "Spend per key" },
        { id: "alert-80", label: "The key's owner is told", value: "At 80% of the balance", "data-item": "dev.alert-80", "data-item-label": "Alert the key's owner at 80%" },
        {
          id: "hooks", label: "Webhooks", value: "At least once · signed · attempt-numbered",
          note: "Retried for 24 hours · never silently disabled",
          "data-item": "dev.hook-contract", "data-item-label": "Webhooks",
        },
        { id: "missed", label: "Missed events", value: "Readable from the reconciliation endpoint" },
      ] as Field[] : []),
      ...(upgrades.length > 0 ? [{
        id: "upgrades", label: "Upgrade requests",
        value: `${plural(upgrades.length, "request")} · ${upgrades[0].requester.user} wants ${upgrades[0].upgrade!.feature}`,
        note: `${upgrades[0].upgrade!.plan} · ${money(upgrades[0].upgrade!.monthlyTotal)} a month for ${b.plan.seats} seats`,
        action: (
          <Actions surface="card" items={[{
            label: "Review", kind: "link", href: href("/ollopa/requests"),
            onClick: () => leaveSettings("/ollopa/requests", "plan.upgrade-requests"),
          }]} />
        ),
        "data-item": "plan.upgrade-requests", "data-item-label": "Upgrade requests",
      }] as Field[] : []),
    ]
    : [
      {
        id: "credits", label: "Your credits",
        value: mine ? `${credits(mine.used)} used this month` : `${credits(c.balance)} left in the workspace`,
        note: mine && mine.limit ? `Your limit is ${credits(mine.limit)}` : undefined,
        action: <Actions surface="card" items={[{ label: "Where it went", kind: "secondary", onClick: onCredits }]} />,
        "data-item": "plan.credits", "data-item-label": "Your credits",
      },
      {
        id: "guard", label: "Bounce guard",
        value: (
          <Stated
            state={guard.state === "paused" ? "auto-paused" : guard.state === "warning" ? "warning" : "active"}
            word={guard.state === "paused" ? "Paused" : guard.state === "warning" ? "Warning" : "On"}
          >
            Warns at {guard.warnPercent}% · pauses at {guard.pausePercent}%
          </Stated>
        ),
        note: myMailboxes.length === 0
          ? "You have no mailbox here"
          : myMailboxes.some((m) => m.paused) ? "One of yours is paused" : `${plural(myMailboxes.length, "mailbox", "mailboxes")} of yours, none paused`,
        "data-item": "mail.bounce-guard", "data-item-label": "Bounce guard",
      },
      {
        id: "agents", label: "Agents wait for you", value: "Send · enrol · spend over a cap",
        "data-item": "ai.approvals", "data-item-label": "Agents",
      },
      {
        id: "second", label: "A second approval",
        value: `Over ${seed.secondApproval.recipients.toLocaleString()} recipients · over ${seed.secondApproval.credits} credits`,
      },
    ]

  return (
    // The page's one band of decision-critical facts: a heading, one "…" at the trailing edge, and
    // a body of fields. It is not the layouts' `SummaryStrip`: that part takes figures with no room
    // for the `data-item` anchor the search jump, the `?row=` arrival and the trail all read, and it
    // collapses to one sideways-scrolling line at 400, which would put most of these facts out of
    // sight — the one thing rule 7 forbids.
    <Section
      heading="Plan, spend and limits"
      count={fields.length}
      data-container="strip"
      data-container-label="the strip"
      actions={isAdmin ? (
        <Actions surface="card" layout="menu" menuLabel="the plan" items={[
          { label: "Change plan", kind: "secondary",
            onClick: () => toast("Change plan: seats, plan cards and the total, with Due today on screen.") },
          { label: "Cancel plan", kind: "destructive",
            onClick: () => toast(`${b.name} ends on ${longDay(ws.plan.renews)}.`),
            irreversible: {
              title: `Cancel ${b.name}?`,
              consequence: `${b.name} ends on ${longDay(ws.plan.renews)} and sending stops that day. Your ${seed.contacts.length.toLocaleString()} contacts, ${plural(seed.sequences.length, "sequence")} and every report stay readable for 30 days, then they are deleted.`,
              confirmLabel: "Cancel plan",
            } },
        ]} />
      ) : undefined}
    >
      <Fields fields={fields} />
    </Section>
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
                className={cn("t-body -mb-px border-b-2 px-3 py-1.5", active === g.id ? "border-foreground font-medium" : "border-transparent text-muted-foreground")}
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
              <RowList rows={g.rows} admin={admin} honest={honest} />
            </div>
          ))}
        </>
      )}
      {rest.length > 0 && <div><RowList rows={rest} admin={admin} honest={honest} /></div>}
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
    <Section
      as="section"
      id={`area-${slug(area)}`}
      className="scroll-mt-4"
      padded={false}
      bodyClassName="@container px-3 pb-2.5 sm:px-4"
      heading={<>
        {AREA_FAMILY[area] && <FamilyIcon of={AREA_FAMILY[area]} />}
        {honest ? area : VAGUE_AREA[area] ?? area}
      </>}
    >
      <div data-container={`area.${slug(area)}`} data-container-label={area}>
        {tabbed
          ? <AreaTabs area={area} rows={one} admin={admin} honest={honest} />
          : <RowList rows={one} admin={admin} honest={honest} />}
      </div>
      {two.length > 0 && (
        <div className={cn(one.length > 0 && "mt-2")}>
          <Door
            id={doorId}
            label={honest ? two.map((r) => r.short).join(", ") : "Advanced"}
            count={honest ? two.length : undefined}
          >
            <div><RowList rows={two} admin={admin} honest={honest} /></div>
          </Door>
        </div>
      )}
    </Section>
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
      {accelerators && <Kbd className="pointer-events-none absolute right-2 top-2">/</Kbd>}
      {hits.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-lg" role="listbox">
          {hits.map((h, i) => (
            <li key={h.id}>
              <button
                role="option"
                aria-selected={i === active}
                className={cn("t-body block w-full px-3 py-1.5 text-left", i === active && "bg-muted")}
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

  const route = useRoute()
  // What the set-up answers moved, when this page is what sent the person to change them.
  const moved = useSidebarMove()

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

  /**
   * Land on one row: open the door it is behind, bring it into view, light it and put the keyboard
   * on its control. The settings search has always done this. Arriving from another page does the
   * same thing and adds the shell's own return cue, so a row reached by following a link from a
   * sequence looks exactly like a row reached by clicking a crumb — one cue, learned once.
   */
  const jump = useCallback((id: string, area: string, returning = false) => {
    openers.current[area]?.(true)
    // One cue at a time: arriving from elsewhere uses the shell's return cue, and the search's own
    // light is for a jump that never left the page.
    if (!returning) state.light(id)
    window.setTimeout(() => {
      // Only this page's copy of the row: a setting open in a pane beside another page carries the
      // same `data-row`, and is not the thing being returned to.
      const root = document.querySelector<HTMLElement>('[data-page-active="true"]') ?? document.body
      const el = root.querySelector<HTMLElement>(`[data-row="${CSS.escape(id)}"]`)
      if (!el) return
      el.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      })
      if (returning) {
        el.classList.remove("ollopa-returned")
        void el.offsetWidth
        el.classList.add("ollopa-returned")
        window.setTimeout(() => el.classList.remove("ollopa-returned"), RETURN_HIGHLIGHT_MS)
      }
      el.querySelector<HTMLElement>("input, button, [role=combobox], a")?.focus()
    }, 60)
  }, [state])

  const ctx = useMemo(() => ({
    session, user: effectiveUser, role, business: session.business, seed, b, st, admin, isAdmin, moved,
    open: (p: PanelRequest) => setPanel(p),
    viewAs,
    search: (query: string) => { search.current?.focus(); search.current!.value = query; toast(`Search: ${query}`) },
  }), [session, effectiveUser, role, seed, b, st, admin, isAdmin, viewAs, moved])

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

  // Where each row is standing right now, so an arrival knows which door to open. Rebuilt on every
  // render and read through a ref, because the levels move as the seat and View as change.
  const whereIs = useRef(new Map<string, { area: string; behindDoor: boolean }>())
  whereIs.current = new Map<string, { area: string; behindDoor: boolean }>(
    areas.flatMap((a) => [
      ...a.one.map((r): [string, { area: string; behindDoor: boolean }] => [r.id, { area: a.area, behindDoor: false }]),
      ...a.two.map((r): [string, { area: string; behindDoor: boolean }] => [r.id, { area: a.area, behindDoor: true }]),
    ]),
  )

  /**
   * `?row=<usage item id>` — a page that linked here naming the setting it linked to. The row is the
   * thing the person asked for, so the page opens the door it is behind, scrolls it into view, lights
   * it with the shell's own return cue and puts the keyboard on its control. Once per arrival: the
   * route and the row together are the arrival, and re-renders do not repeat it.
   */
  const arrived = useRef<string | null>(null)
  useEffect(() => {
    const row = route.query.get("row")
    if (!row) { arrived.current = null; return }
    const key = `${route.raw}|${row}`
    if (arrived.current === key) return
    const at = whereIs.current.get(row)
    if (!at) return                       // not a row this seat holds: the area deep link still lands
    arrived.current = key
    jump(row, at.behindDoor ? at.area : "", true)
  }, [route.raw, route.query, areas.length, jump])

  // A panel on this page naming another row on this page: the row, lit where it stands, no move.
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      const at = whereIs.current.get(id)
      if (at) jump(id, at.behindDoor ? at.area : "", true)
    }
    document.addEventListener(JUMP_EVENT, on)
    return () => document.removeEventListener(JUMP_EVENT, on)
  }, [jump])

  // A deep link to an area opens on that area — unless it named a row, which is more exact.
  useEffect(() => {
    const area = node ? AREA_BY_NODE[node] : undefined
    if (!area || route.query.get("row")) return
    const el = document.getElementById(`area-${slug(area)}`)
    el?.scrollIntoView({ block: "start" })
  }, [node, areas.length, route.query])

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
        <div role="status" className="t-body sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b bg-foreground px-4 py-2 text-background sm:px-6">
          <span>
            Viewing as {viewing.name} ({viewing.title}{viewing.team ? `, ${viewing.team}` : ""}). This is their Settings page, not yours.
          </span>
          <Actions surface="card" items={[{ label: "Stop viewing as them", kind: "secondary", onClick: () => setViewing(null) }]} />
        </div>
      )}

      <DoorGroup>
        {/* The Settings type: the index beside the panels above `lg` and above them below it, the
            strip as the page's one band, the save bar in the template's footer (LAYOUTS.md §1). */}
        <SettingsLayout
          family="settings"
          title="Settings"
          description={seed.workspace.name}
          actions={[]}
          areas={areas.map((a) => ({ id: slug(a.area), name: areaLabel(a.area) }))}
          onGo={(id) => document.getElementById(`area-${id}`)?.scrollIntoView({ block: "start", behavior: "smooth" })}
          save={<SaveBar />}
          above={
            <>
              <div className="flex flex-wrap items-center gap-2">
                <SettingsSearch rows={searchable} onJump={jump} inputRef={search} accelerators={accelerators} />
                {together && <ExpandAll />}
              </div>
              {stripEl}
            </>
          }
        >
          {areas.map((a) => (
            <Area key={a.area} area={a.area} one={a.one} two={a.two} admin={admin} register={register} flat={twoLevels} honest={honest} />
          ))}
          {!isAdmin && (
            <p className="t-body text-muted-foreground">
              Workspace settings (team, email domains, prospecting rules, pipeline, agents, integrations, plan and billing) are managed by {admin}, {adminTitle}.
            </p>
          )}
        </SettingsLayout>
      </DoorGroup>

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
