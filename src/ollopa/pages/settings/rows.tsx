// Every row on the Settings page, one per usage item in `usage/settings.ts`.
//
// A row says what it is on the left and what it currently does on the right, with one line of plain
// text under it where the value has a consequence. Nothing here decides a level: the page asks the
// usage model for that and puts the row on the surface or behind the area's one door.
//
// Three things a row may carry: a plan `feature`, which wraps its control in `Locked` where the
// workspace's plan does not include it; a `block`, for the two tables people edit in the row rather
// than in a drawer; and `readOnly`, for a value an admin set that this seat may read and not change.
import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { href } from "@/app/router"
import { gate, type Feature } from "../../ui/gate"
import { Locked } from "../../ui/Locked"
import { businessById, type BusinessDef } from "../../data/businesses"
import {
  ACCOUNT_STAGES, API_LIMITS, BOUNCE_GUARD, STAGES, seedFor,
  type ApiKey, type FieldDef, type Mailbox, type MailDomain, type McpToken, type Persona,
  type ScoreModel, type Seed, type SignalDef, type Territory, type User, type Webhook,
} from "../../data/seed"
import type { Business, Role } from "../../usage/model"
import type { Session } from "../../session"
import { settingsFor, type DerivedSettings } from "./derived"
import { credits, day, longDay, money, plural } from "./format"
import { Num, Pick, Text, Toggle, toast, useSettingsState } from "./state"

/* --------------------------------------------------------------------------------- the shapes */

export type PanelRequest =
  | { kind: "mailbox"; mailbox: Mailbox }
  | { kind: "domain"; domain: MailDomain }
  | { kind: "user"; user: User }
  | { kind: "removal" }
  | { kind: "key"; apiKey: ApiKey }
  | { kind: "hook"; hook: Webhook }
  | { kind: "mcp"; token: McpToken }
  | { kind: "cli" }
  | { kind: "score"; model: ScoreModel }
  | { kind: "persona"; persona: Persona }
  | { kind: "signal"; signal: SignalDef }
  | { kind: "territory"; territory: Territory }
  | { kind: "field"; field: FieldDef }
  | { kind: "list"; title: string; rows: { id: string; name: string; detail?: string }[]; dependsOn?: (id: string) => string }

export interface RowCtx {
  session: Session
  /** The person whose page this is: the signed-in one, or the teammate being viewed as. */
  user: string
  role: Role
  business: Business
  seed: Seed
  b: BusinessDef
  st: DerivedSettings
  admin: string
  isAdmin: boolean
  open: (p: PanelRequest) => void
  viewAs: (user: User) => void
  search: (query: string) => void
}

export interface SettingRow {
  id: string
  area: string
  /** The row's own label. The usage file's label is the inventory's sentence; this is the control's name. */
  label: string
  /** How the row is named inside the door's content list. */
  short: string
  value?: ReactNode
  note?: string
  feature?: Feature
  block?: ReactNode
  readOnly?: boolean
  keywords?: string[]
}

/* ------------------------------------------------------------------------------- small pieces */

/** A table people edit in the row. Ten rows, then "Show 10 more", as every table in the product does. */
function Rows<T>({ items, render, keyOf, empty }: { items: T[]; render: (t: T) => ReactNode; keyOf: (t: T) => string; empty: string }) {
  const [limit, setLimit] = useState(10)
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>
  return (
    <>
      <ul className="grid gap-1.5">
        {items.slice(0, limit).map((t) => <li key={keyOf(t)}>{render(t)}</li>)}
      </ul>
      {items.length > limit && (
        <Button size="sm" variant="outline" className="mt-2 h-7 px-2 text-xs" onClick={() => setLimit((l) => l + 10)}>
          Show 10 more ({items.length - limit} left)
        </Button>
      )}
    </>
  )
}

/** Row actions: visible on hover and on focus-within, and repeated in the row's "…" menu. */
function RowActions({ actions }: { actions: { label: string; onClick: () => void }[] }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {actions.map((a) => (
        <Button key={a.label} size="sm" variant="ghost"
          className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
          onClick={a.onClick}>{a.label}</Button>
      ))}
      <details className="relative">
        <summary className="cursor-pointer list-none rounded px-1.5 py-0.5 text-sm text-muted-foreground hover:bg-muted" aria-label="More actions">…</summary>
        <div className="absolute right-0 z-10 mt-1 w-44 rounded-md border bg-background p-1 shadow-md">
          {actions.map((a) => (
            <button key={a.label} className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-muted" onClick={a.onClick}>{a.label}</button>
          ))}
        </div>
      </details>
    </span>
  )
}

function Chip({ children, tone }: { children: ReactNode; tone?: "warning" | "error" | "good" }) {
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-xs",
      tone === "warning" && "border-amber-500 text-amber-700 dark:text-amber-400",
      tone === "error" && "border-destructive text-destructive",
      tone === "good" && "border-green-600 text-green-700 dark:text-green-400")}>{children}</span>
  )
}

/** A value this seat may read and not change: text with who set it, never a disabled input. */
function SetBy({ value, admin, item, search }: { value: ReactNode; admin: string; item: string; search: (q: string) => void }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2 text-sm">
      <span>{value}</span>
      <button className="text-xs text-muted-foreground underline underline-offset-4" onClick={() => search(item)}>
        set by {admin}
      </button>
    </span>
  )
}

function Availability({ id, user }: { id: string; user: User }) {
  const s = useSettingsState()
  const away = typeof user.availability !== "string"
  const value = s.valueOf(id, away ? `Away until ${day((user.availability as { awayUntil: string }).awayUntil)}` : "Available")
  return (
    <span className="flex items-center gap-2">
      <Switch checked={value === "Available"} aria-label={`${user.name} available`}
        onCheckedChange={(v) => s.set(id, `Availability (${user.name})`, v ? "Available" : "Away")} />
      <span className="text-xs text-muted-foreground">{value}</span>
    </span>
  )
}

/* ------------------------------------------------------------------------------------ the 102 */

/**
 * The personal profile block spec 14 §3.2 gives every seat: name, title, login email, password and
 * multi-factor authentication for your own account. It carries no usage number because it is not a
 * workspace setting — it is who you are — so it is always the first thing in "You".
 */
export function personalRows(ctx: RowCtx): SettingRow[] {
  const seat = ctx.b.roles.find((r) => r.user === ctx.user) ?? ctx.b.roles.find((r) => r.role === ctx.role) ?? ctx.b.roles[0]
  const email = `${ctx.user.split(" ")[0].toLowerCase()}@${ctx.b.name.toLowerCase().replace(/[^a-z]/g, "")}.com`
  return [
    {
      id: "me.profile", area: "You", label: "Name, title and login email", short: "Your name, title and login email",
      keywords: ["profile", "email", "name"],
      value: (
        <span className="flex flex-wrap items-center gap-2">
          <Text id="me.name" change="Your name" label="Your name" value={ctx.user} width="w-48" />
          <Text id="me.title" change="Your title" label="Your title" value={seat?.title ?? ""} width="w-48" />
          <span className="text-sm text-muted-foreground">{email}</span>
        </span>
      ),
    },
    {
      id: "me.password", area: "You", label: "Password", short: "Your password",
      value: <PasswordRow />,
    },
    {
      id: "me.mfa-own", area: "You", label: "Multi-factor authentication for your own account", short: "Your multi-factor authentication",
      keywords: ["MFA", "2FA", "two-factor"],
      value: <Toggle id="me.mfa-own" change="Your multi-factor authentication" label="Multi-factor authentication for your own account" on={ctx.st.security.mfaEnforced} onLabel="On, from an app" offLabel="Off" />,
      note: ctx.st.security.mfaEnforced ? "This workspace requires it, so it cannot be turned off here." : undefined,
    },
  ]
}

function PasswordRow() {
  const [open, setOpen] = useState(false)
  if (!open) return <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setOpen(true)}>Change password</Button>
  return (
    <span className="flex flex-wrap items-center gap-2">
      <Input className="h-8 w-44" type="password" aria-label="Current password" placeholder="Current" />
      <Input className="h-8 w-44" type="password" aria-label="New password" placeholder="New" />
      <Button size="sm" onClick={() => { setOpen(false); toast("Saved · Password") }}>Save</Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    </span>
  )
}

export function rowsFor(ctx: RowCtx): SettingRow[] {
  const { seed, b, st, admin, isAdmin, open, session } = ctx
  const ws = seed.workspace
  const guard = seed.bounceGuard
  const mine = seed.mailboxes.filter((m) => m.owner === ctx.user)
  const myCredits = seed.credits.byUser.find((u) => u.user === ctx.user)
  const stages = seed.pipelines[0]?.stages.map((s) => s.name) ?? []
  const agentsOn = seed.agents.filter((a) => a.on)
  const primary = seed.scoreModels.find((m) => m.primary) ?? seed.scoreModels[0]
  const personas = seed.personas.filter((p) => !p.retired)
  const signals = seed.signals.filter((s) => !s.retired)
  const retired = seed.personas.filter((p) => p.retired).length + seed.signals.filter((s) => s.retired).length + seed.scoreModels.filter((m) => m.retired).length
  const crm = seed.integrations.find((i) => /Salesforce|HubSpot/.test(i.kind))
  const myToken = seed.mcpTokens.find((t) => t.user === ctx.user) ?? seed.mcpTokens[0]
  const openUpgrades = seed.requests.filter((r) => r.kind === "upgrade" && r.state !== "declined" && r.state !== "verified")

  const rows: SettingRow[] = []
  const add = (r: SettingRow) => { rows.push(r); return r }

  /* ------------------------------------------------------------------------------------- You */

  add({
    id: "me.notify-delivery", area: "You", label: "Where notifications go", short: "Where notifications go",
    keywords: ["digest", "slack", "push", "mute", "quiet hours", "notifications"],
    value: (
      <span className="flex flex-wrap items-center gap-2">
        <Pick id="me.delivery" change="Notification delivery" label="Delivery" value={st.you.delivery} options={["A daily digest", "As they happen"]} width="w-44" />
        <Toggle id="me.slack" change="Slack notifications" label="Slack" on={st.you.slack} onLabel="Slack on" offLabel="Slack off" />
        <Toggle id="me.push" change="Push notifications" label="Push" on={st.you.push} onLabel="Push on" offLabel="Push off" />
        <Toggle id="me.mute" change="Mute" label="Mute everything" on={st.you.muted} onLabel="Muted" offLabel="Not muted" />
        <Text id="me.quiet" change="Quiet hours" label="Quiet hours" value={st.you.quietHours} width="w-40" />
      </span>
    ),
    note: "What you are told about stays on the thing that tells you: Agents, Inbox, the sync error log.",
  })

  add({
    id: "me.mcp-token", area: "You", label: "Your MCP and CLI connections", short: "Your MCP and CLI connections",
    keywords: ["claude", "cursor", "token", "terminal"],
    value: (
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-sm">
          {myToken ? `${myToken.client} · authorised ${day(myToken.authorisedOn)}` : "No client connected"}
          {seed.cliDevices.some((d) => d.user === ctx.user) ? ` · ${plural(seed.cliDevices.filter((d) => d.user === ctx.user).length, "CLI device")}` : ""}
        </span>
        {myToken && <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => open({ kind: "mcp", token: myToken })}>Scope</Button>}
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => open({ kind: "cli" })}>CLI devices</Button>
      </span>
    ),
  })

  /* ------------------------------------------------------------------------------- Workspace */

  add({ id: "ws.name", area: "Workspace", label: "Workspace name", short: "Name", value: <Text id="ws.name" change="Workspace name" label="Workspace name" value={ws.name} /> })
  add({ id: "ws.logo", area: "Workspace", label: "Logo", short: "Logo", value: (
    <span className="flex items-center gap-2">
      <span className="inline-flex size-8 items-center justify-center rounded bg-foreground text-xs font-medium text-background">{ws.logoInitials}</span>
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => toast("Choose an image for the workspace logo.")}>Replace</Button>
    </span>
  ) })
  add({ id: "ws.timezone", area: "Workspace", label: "Timezone", short: "Timezone",
    value: <Pick id="ws.timezone" change="Timezone" label="Timezone" value={ws.timezone} options={["Europe/Berlin", "Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Singapore"]} />,
    note: "Sending schedules and report periods are read in this timezone." })
  add({ id: "ws.currency", area: "Workspace", label: "Default currency", short: "Currency",
    value: <Pick id="ws.currency" change="Default currency" label="Default currency" value={ws.currency} options={["EUR", "USD", "GBP"]} width="w-28" /> })
  add({ id: "ws.language", area: "Workspace", label: "Language", short: "Language",
    value: <Pick id="ws.language" change="Language" label="Language" value={ws.language} options={["English", "Deutsch", "Français"]} width="w-36" /> })

  /* --------------------------------------------------------------- How your team works */

  add({
    id: "work.profile", area: "How your team works", label: "Workspace profile", short: "Workspace profile",
    keywords: ["sidebar", "set-up answers", "three questions"],
    value: (
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-sm">{ws.profile}</span>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { location.hash = "#/ollopa/setup" }}>Change the answers</Button>
      </span>
    ),
    note: `Declared by ${ws.declaredBy} on ${longDay(ws.declaredAt)}: "${ws.firstJob}", ${ws.people}, ${plural(ws.seats.length, "seat")}. Changing it redraws the sidebar and says what moved.`,
  })
  add({
    id: "work.seats", area: "How your team works", label: "Which seats exist here", short: "Seats",
    value: (
      <span className="flex flex-wrap items-center gap-1.5">
        {(["sdr", "ae", "marketer", "cs", "admin"] as Role[]).map((r) => {
          const on = ws.seats.includes(r)
          const held = seed.users.filter((u) => u.role === r).length
          const label = { sdr: "SDR", ae: "Account executive", marketer: "Marketer", cs: "Customer success", admin: "RevOps admin" }[r]
          return (
            <label key={r} className={cn("flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs", !on && "text-muted-foreground")}>
              <input type="checkbox" defaultChecked={on} aria-label={label}
                onChange={(e) => toast(e.target.checked ? `${label} added. Nobody holds it yet.` : `${label} removed. ${plural(held, "person", "people")} hold it and would lose those areas.`)} />
              {label} · {held}
            </label>
          )
        })}
      </span>
    ),
  })
  add({
    id: "work.left-out", area: "How your team works", label: "Pages this profile leaves out", short: "Pages left out",
    block: (
      <Rows
        items={ws.leftOut} keyOf={(l) => l.page} empty="Nothing is left out. Every seat sees every page it holds."
        render={(l) => (
          <span className="group flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded px-1 py-1 hover:bg-muted/50">
            <span className="w-28 shrink-0 text-sm capitalize">{l.page}</span>
            <span className="min-w-0 flex-1 text-xs text-muted-foreground">{l.why} · {plural(l.signals, "signal")} so far, counted on the {l.signalKind}</span>
            <RowActions actions={[{ label: "Add to sidebar", onClick: () => toast(`${l.page} is in the sidebar. It goes to the end of its group and stays.`) }]} />
          </span>
        )}
      />
    ),
  })
  add({
    id: "work.exposure", area: "How your team works", label: "Two-week exposure", short: "The exposure showing now",
    value: ws.exposure && ws.exposure.state === "showing" ? (
      <span className="flex flex-wrap items-center gap-2 text-sm">
        <span className="capitalize">{ws.exposure.page}</span> is in the sidebar until {longDay(ws.exposure.ends)}.
        <Button size="sm" className="h-7 px-2 text-xs" onClick={() => toast(`${ws.exposure!.page} kept. The answer holds until a new signal.`)}>Keep it</Button>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => toast(`${ws.exposure!.page} removed from the sidebar.`)}>Remove it</Button>
      </span>
    ) : <span className="text-sm text-muted-foreground">Nothing is showing temporarily.</span>,
    note: "One page at a time, for two weeks, and the answer is final until a new signal.",
  })

  /* ------------------------------------------------------------------------- Team and access */

  add({
    id: "team.users", area: "Team and access", label: "Users", short: "Users",
    keywords: ["people", "invite", "credit limit", "deactivate"],
    block: (
      <>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {seed.users.length} of {b.plan.seats} seats used. Credit limit, availability and status change in the row.
          </p>
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => toast("Invite by email, with a permission profile and a credit limit.")}>Invite people</Button>
        </div>
        <Rows
          items={seed.users} keyOf={(u) => u.id} empty="Nobody here yet."
          render={(u) => (
            <span className="group flex flex-wrap items-center gap-x-3 gap-y-1 rounded px-1 py-1 hover:bg-muted/50">
              <span className="w-44 shrink-0 text-sm">{u.name}</span>
              <span className="w-40 shrink-0 text-xs text-muted-foreground">{u.title} · {u.profile}</span>
              <span className="w-32 shrink-0 text-xs text-muted-foreground">{u.team}{u.territory ? ` · ${u.territory}` : ""}</span>
              <Availability id={`team.availability.${u.id}`} user={u} />
              <span className="flex shrink-0 items-center gap-1.5">
                <Num id={`team.limit.${u.id}`} change={`Credit limit (${u.name})`} label={`Credit limit for ${u.name}`} value={u.creditLimit ?? 0} width="w-20" />
                <span className="text-xs text-muted-foreground">used {credits(seed.credits.byUser.find((c) => c.user === u.name)?.used ?? 0)}</span>
              </span>
              <span className="flex-1" />
              <RowActions actions={[
                { label: "Open", onClick: () => open({ kind: "user", user: u }) },
                { label: "View as", onClick: () => ctx.viewAs(u) },
                { label: "Deactivate", onClick: () => open({ kind: "user", user: u }) },
              ]} />
            </span>
          )}
        />
      </>
    ),
  })
  add({
    id: "team.teams", area: "Team and access", label: "Teams", short: "Teams", feature: "teams",
    value: (
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
        onClick={() => open({ kind: "list", title: "Teams", rows: seed.teams.map((t) => ({ id: t.id, name: t.name, detail: `${t.lead} · ${plural(t.members, "person", "people")}` })), dependsOn: () => "People on this team move to no team." })}>
        {seed.teams.length === 0 ? "No teams" : plural(seed.teams.length, "team")}
      </Button>
    ),
  })
  add({
    id: "team.profiles", area: "Team and access", label: "Permission profiles", short: "Permission profiles", feature: "profiles",
    value: (
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
        onClick={() => open({ kind: "list", title: "Permission profiles", rows: seed.permissionProfiles.map((p) => ({ id: p.id, name: p.name, detail: `${plural(p.users, "person", "people")} · ${p.canSee.length} areas` })), dependsOn: (id) => `${seed.permissionProfiles.find((p) => p.id === id)?.users ?? 0} people would move to the default profile.` })}>
        {seed.permissionProfiles.length === 0 ? "No profiles" : plural(seed.permissionProfiles.length, "profile")}
      </Button>
    ),
  })
  add({
    id: "team.grants", area: "Team and access", label: "Additional grants", short: "Grants on top of the profile", feature: "profiles",
    value: <span className="text-sm">{plural(seed.users.filter((u) => u.grants.length > 0).length, "person has", "people have")} a grant on top of their profile</span>,
    note: "Grants add to the profile. Prefer a grant to a new profile.",
  })
  add({
    id: "team.availability", area: "Team and access", label: "Your availability", short: "Available, or away until a date",
    value: (
      <span className="flex items-center gap-2">
        <Pick id="team.availability.me" change="Your availability" label="Your availability" value="Available" options={["Available", "Away until a date"]} width="w-48" />
      </span>
    ),
    note: "Every routing rule reads this: a lead handed to somebody on holiday is the slow reply the rule exists to prevent.",
  })
  add({
    id: "team.viewas", area: "Team and access", label: "View as a teammate", short: "View as a teammate", feature: "view-as",
    value: (
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
        onClick={() => { const u = seed.users.find((x) => x.name !== ctx.user) ?? seed.users[0]; if (u) ctx.viewAs(u) }}>
        View as a teammate
      </Button>
    ),
    note: "The page is replaced by their view under a banner until you leave it.",
  })
  add({
    id: "team.offboarding", area: "Team and access", label: "Deactivate somebody", short: "Deactivate: reassign, unlink, unmap, deactivate",
    value: (
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
        onClick={() => { const u = seed.users.find((x) => x.name !== ctx.user) ?? seed.users[0]; if (u) open({ kind: "user", user: u }) }}>
        Start on a person
      </Button>
    ),
    note: `Four steps in order: reassign their work, unlink their mailboxes${b.crm ? `, unmap them from ${b.crm.split(" ")[0]}` : ""}, then deactivate. The bill does not change until renewal on ${longDay(b.plan.renews)}.`,
  })
  add({ id: "sec.mfa", area: "Team and access", label: "Multi-factor authentication", short: "Multi-factor authentication",
    keywords: ["MFA", "2FA", "two-factor"],
    value: <Toggle id="sec.mfa" change="Multi-factor authentication" label="Require MFA" on={st.security.mfaEnforced} onLabel="Required for everyone" offLabel="Each person chooses" /> })
  add({ id: "sec.sso", area: "Team and access", label: "Single sign-on", short: "Single sign-on", feature: "sso",
    keywords: ["SSO", "Okta", "SAML"],
    value: <span className="text-sm">{st.security.sso ? `${st.security.sso} · SAML` : "Not set up"}</span> })
  add({ id: "sec.ip", area: "Team and access", label: "IP allowlist", short: "IP allowlist", feature: "ip-allowlist",
    value: <span className="text-sm">{st.security.ipRanges.length ? st.security.ipRanges.join(", ") : "Any address"}</span>,
    note: st.security.ipRanges.length ? `${plural(seed.users.length, "person", "people")} sign in from outside these ranges would lose access.` : undefined })
  add({ id: "sec.password", area: "Team and access", label: "Password policy", short: "Password policy",
    value: <Pick id="sec.password" change="Password policy" label="Password policy" value={st.security.passwordPolicy} options={["8 characters", "12 characters, one number", "16 characters, one number, one symbol"]} /> })
  add({ id: "sec.session", area: "Team and access", label: "Session timeout", short: "Session timeout",
    value: <Pick id="sec.session" change="Session timeout" label="Session timeout" value={st.security.sessionTimeout} options={["No timeout", "30 minutes", "2 hours", "8 hours"]} width="w-40" /> })

  /* ---------------------------------------------------------------------------- Email sending */

  const mailboxes = isAdmin ? seed.mailboxes : mine
  add({
    id: "mail.mailboxes", area: "Email sending", label: isAdmin ? "Mailboxes" : "Your mailboxes", short: "Mailboxes",
    keywords: ["sending", "inbox", "warm-up", "limits"],
    block: (
      <>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5">
        <p className="text-xs text-muted-foreground">
          {plural(mailboxes.length, "mailbox", "mailboxes")} · warm-up and both limits change in the row.
        </p>
        <LinkMailbox business={ctx.business} />
      </div>
      <Rows
        items={mailboxes} keyOf={(m) => m.id} empty="No mailbox is linked. Link one to start sending."
        render={(m) => (
          <span className="group flex flex-wrap items-center gap-x-3 gap-y-1 rounded px-1 py-1 hover:bg-muted/50">
            <span className="w-56 shrink-0 text-sm">{m.address}</span>
            <span className="w-32 shrink-0 text-xs text-muted-foreground">{m.owner}</span>
            <span className="flex shrink-0 items-center gap-1.5 text-xs">
              <Switch checked={m.warmup.on} aria-label={`Warm-up for ${m.address}`} onCheckedChange={(v) => toast(v ? `Warm-up on for ${m.address}` : `Warm-up off for ${m.address}`)} />
              <span className="text-muted-foreground">{m.warmup.on ? `day ${m.warmup.day} of ${m.warmup.of}` : "warmed"}</span>
            </span>
            {isAdmin ? (
              <span className="flex shrink-0 items-center gap-1.5">
                <Num id={`mail.daily.${m.id}`} change={`Daily limit (${m.address})`} label={`Daily limit for ${m.address}`} value={m.dailyLimit} width="w-20" />
                <Num id={`mail.hourly.${m.id}`} change={`Hourly limit (${m.address})`} label={`Hourly limit for ${m.address}`} value={m.hourlyLimit} width="w-16" />
                <span className="text-xs text-muted-foreground">{m.sentToday} sent today</span>
              </span>
            ) : (
              <SetBy admin={admin} item="Daily, hourly and minimum delay between sends" search={ctx.search}
                value={`${m.dailyLimit} a day · ${m.hourlyLimit} an hour · ${m.sentToday} sent today`} />
            )}
            {m.paused && <Chip tone="error">Paused · {m.pausedReason}</Chip>}
            <span className="flex-1" />
            <RowActions actions={[{ label: "Edit", onClick: () => open({ kind: "mailbox", mailbox: m }) }]} />
          </span>
        )}
      />
      </>
    ),
  })
  add({ id: "mail.warmup", area: "Email sending", label: "Warm-up", short: "Warm-up",
    value: <span className="text-sm">{plural(mailboxes.filter((m) => m.warmup.on).length, "mailbox", "mailboxes")} warming, {mailboxes.filter((m) => !m.warmup.on).length} warmed</span>,
    note: "A warming mailbox sends a rising number a day and is not asked to carry a campaign." })
  add({ id: "mail.limits", area: "Email sending", label: "Daily, hourly and minimum delay between sends", short: "Sending limits",
    value: isAdmin ? (
      <span className="flex flex-wrap items-center gap-2">
        <Num id="mail.limit.daily" change="Daily limit" label="Daily limit" value={120} width="w-20" suffix="a day" />
        <Num id="mail.limit.hourly" change="Hourly limit" label="Hourly limit" value={20} width="w-16" suffix="an hour" />
        <Num id="mail.limit.delay" change="Minimum delay between sends" label="Minimum delay" value={90} width="w-16" suffix="seconds apart" />
      </span>
    ) : <SetBy admin={admin} item="Daily, hourly and minimum delay between sends" search={ctx.search} value="120 a day · 20 an hour · 90 seconds apart" />,
    readOnly: !isAdmin,
    note: isAdmin ? "Users may not change their own limits." : undefined })
  add({ id: "mail.signature", area: "Email sending", label: "Your email signature", short: "Signature",
    value: <Text id="mail.signature" change="Email signature" label="Email signature" value={`${ctx.user} · ${b.name}`} width="w-72" /> })
  add({
    id: "mail.domains", area: "Email sending", label: "Sending domains", short: "Sending domains",
    keywords: ["SPF", "DKIM", "DMARC"],
    block: (
      <Rows
        items={seed.domains} keyOf={(d) => d.id} empty="No sending domain yet · Add a domain"
        render={(d) => (
          <span className="group flex flex-wrap items-center gap-x-3 gap-y-1 rounded px-1 py-1 hover:bg-muted/50">
            <span className="w-52 shrink-0 text-sm">{d.domain}</span>
            <span className="flex shrink-0 gap-1.5">
              <Chip tone={d.spf ? "good" : "error"}>SPF {d.spf ? "set" : "missing"}</Chip>
              <Chip tone={d.dkim ? "good" : "error"}>DKIM {d.dkim ? "set" : "missing"}</Chip>
              <Chip tone={d.dmarc ? "good" : "error"}>DMARC {d.dmarc ? "set" : "missing"}</Chip>
            </span>
            <span className="text-xs text-muted-foreground">{d.bounceRate7d}% bounce · {plural(d.mailboxes, "mailbox", "mailboxes")}</span>
            <span className="flex-1" />
            <RowActions actions={[{ label: "DNS records", onClick: () => open({ kind: "domain", domain: d }) }]} />
          </span>
        )}
      />
    ),
    note: isAdmin ? undefined : `Sending domains are set by ${admin}. You can read them here.`,
    readOnly: !isAdmin,
  })
  add({ id: "mail.tracking-subdomain", area: "Email sending", label: "Tracking subdomain", short: "Tracking subdomain",
    value: <Text id="mail.tracking-subdomain" change="Tracking subdomain" label="Tracking subdomain" value={seed.domains[0]?.trackingSubdomain ?? "link.example.com"} width="w-64" /> })
  add({
    id: "mail.bounce-guard", area: "Email sending", label: "Bounce guard", short: "Bounce guard",
    keywords: ["auto-pause", "bounce rate", "paused"],
    value: (
      <span className="flex flex-wrap items-center gap-2">
        {isAdmin ? (
          <>
            <Num id="mail.guard.warn" change="Bounce guard warning threshold" label="Warn at" value={guard.warnPercent} width="w-16" suffix="% warns" />
            <Num id="mail.guard.pause" change="Bounce guard pause threshold" label="Pause at" value={guard.pausePercent} width="w-16" suffix="% pauses" />
          </>
        ) : <SetBy admin={admin} item="Bounce guard" search={ctx.search} value={`warns at ${guard.warnPercent}%, pauses at ${guard.pausePercent}%`} />}
        <Chip tone={guard.state === "paused" ? "error" : guard.state === "warning" ? "warning" : "good"}>
          {guard.observedPercent}% of {guard.volume7d.toLocaleString()} in 7 days
        </Chip>
        <span className="text-xs text-muted-foreground">
          {seed.mailboxes.filter((m) => m.paused).length === 0 ? "Nothing paused" : `${plural(seed.mailboxes.filter((m) => m.paused).length, "mailbox", "mailboxes")} paused`}
        </span>
      </span>
    ),
    note: "Auto-pause stops every mailbox on the domain until you resume it.",
  })
  add({ id: "mail.catch-all", area: "Email sending", label: "Block catch-all domains", short: "Catch-all blocking",
    value: <Toggle id="mail.catch-all" change="Catch-all blocking" label="Block catch-all domains" on={st.sending.catchAll} onLabel="Blocked" offLabel="Allowed" />,
    note: "A catch-all address accepts everything and tells you nothing, so a bounce arrives days later." })
  add({ id: "mail.unsubscribe-text", area: "Email sending", label: "Unsubscribe text", short: "Unsubscribe text",
    value: <Text id="mail.unsubscribe-text" change="Unsubscribe text" label="Unsubscribe text" value={st.sending.unsubscribeText} width="w-80" /> })
  add({ id: "mail.unsubscribe-permission", area: "Email sending", label: "Users may disable the unsubscribe text", short: "Users may disable it",
    value: <Toggle id="mail.unsubscribe-permission" change="Users may disable the unsubscribe text" label="Users may disable the unsubscribe text" on={st.sending.usersMayDisable} onLabel="They may" offLabel="They may not" />,
    note: "Read and set beside the text it governs." })
  add({ id: "mail.tracking", area: "Email sending", label: "Open and click tracking", short: "Open and click tracking",
    value: (
      <span className="flex items-center gap-3">
        <Toggle id="mail.tracking.opens" change="Open tracking" label="Open tracking" on={st.sending.opens} onLabel="Opens tracked" offLabel="Opens not tracked" />
        <Toggle id="mail.tracking.clicks" change="Click tracking" label="Click tracking" on={st.sending.clicks} onLabel="Clicks tracked" offLabel="Clicks not tracked" />
      </span>
    ) })

  /* ------------------------------------------------------------------------- Prospecting rules */

  const dnc = st.prospecting.dnc
  const dncDaysSince = Math.round((Date.parse("2026-09-13") - Date.parse(dnc.synchronisedOn)) / 86_400_000)
  const dncOverdue = dncDaysSince > 31

  add({
    id: "pros.dnc", area: "Prospecting rules", label: "Do-not-call screening", short: "Do-not-call screening",
    keywords: ["DNC", "national register", "safe harbour", "31 days"],
    value: (
      <span className="flex flex-wrap items-center gap-2">
        <span className={cn("text-sm", dncOverdue && "text-destructive")}>
          Synchronised {longDay(dnc.synchronisedOn)} · next due {longDay(dnc.nextDueOn)}
        </span>
        {dncOverdue && <Chip tone="error">Overdue — calls made now are outside safe harbour</Chip>}
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
          onClick={() => toast(`Synchronised ${seed.contacts.length.toLocaleString()} people against ${plural(st.prospecting.dncCountries.length, "register")}. Written to the log.`)}>
          Synchronise now
        </Button>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => open({ kind: "list", title: "Do-not-call review log", rows: dnc.log.map((l, i) => ({ id: String(i), name: `${longDay(l.at)} · ${l.by}`, detail: `${l.what} · ${l.count.toLocaleString()} people` })) })}>
          Review log
        </Button>
      </span>
    ),
    note: `Screened against ${st.prospecting.dncCountries.join(", ")}. The register has to be read again at least every 31 days, and the log is kept for 24 months.`,
  })
  add({ id: "pros.gdpr", area: "Prospecting rules", label: "GDPR restrictions by region", short: "GDPR by region",
    value: <Pick id="pros.gdpr" change="GDPR restrictions" label="GDPR restrictions" value={st.prospecting.gdprRegions} options={["EU restricted", "EU and UK restricted", "No regional restriction"]} width="w-56" />,
    note: "A restricted person stays in every table and every count; the action is replaced by the rule that restricts it." })
  add({ id: "pros.removal-list", area: "Prospecting rules", label: "Removal list", short: "Removal list",
    value: (
      <span className="flex items-center gap-2">
        <span className="text-sm">{plural(st.prospecting.removal.people, "person", "people")} · {st.prospecting.removal.addedThisMonth} added this month</span>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => open({ kind: "removal" })}>Review, export, delete everywhere</Button>
      </span>
    ) })
  add({ id: "pros.primary-email", area: "Prospecting rules", label: "Primary email type", short: "Primary email type",
    value: isAdmin
      ? <Pick id="pros.primary-email" change="Primary email type" label="Primary email type" value={st.prospecting.primaryEmail} options={["Business email", "Any email", "Personal email"]} />
      : <SetBy admin={admin} item="Primary email type" search={ctx.search} value={st.prospecting.primaryEmail} />,
    readOnly: !isAdmin })
  add({ id: "pros.duplicates", area: "Prospecting rules", label: "Duplicate handling", short: "Duplicate handling",
    value: (
      <span className="flex flex-wrap items-center gap-2">
        <Pick id="pros.duplicates" change="Duplicate handling" label="Duplicate handling" value={st.prospecting.duplicates} options={["Ask before merging", "Merge automatically", "Keep both"]} />
        <Chip tone={st.prospecting.duplicateRate > 3 ? "warning" : undefined}>{st.prospecting.duplicateRate}% of records are duplicates today</Chip>
      </span>
    ) })
  add({ id: "pros.in-progress", area: "Prospecting rules", label: "In-progress limit per account", short: "In-progress limit",
    value: isAdmin
      ? <Num id="pros.in-progress" change="In-progress limit per account" label="In-progress limit" value={st.prospecting.inProgressLimit} suffix="people at once" />
      : <SetBy admin={admin} item="In-progress limit per account" search={ctx.search} value={`${st.prospecting.inProgressLimit} people at once`} />,
    readOnly: !isAdmin })
  add({ id: "pros.territories", area: "Prospecting rules", label: "Territories", short: "Territories", feature: "territories",
    value: (
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
        onClick={() => seed.territories[0] ? open({ kind: "territory", territory: seed.territories[0] }) : toast("No territories: everyone can prospect everywhere.")}>
        {seed.territories.length === 0 ? "No territories: everyone can prospect everywhere" : plural(seed.territories.length, "territory", "territories")}
      </Button>
    ),
    note: "Defined here and assigned from a person's row in Team and access. One object, two openings." })

  /* ------------------------------------------------------------------------- Pipeline and data */

  add({ id: "pipe.stages", area: "Pipeline and data", label: "Pipelines and stages", short: "Pipelines and stages",
    value: (
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
        onClick={() => open({ kind: "list", title: "Pipelines and stages", rows: seed.pipelines.map((p) => ({ id: p.id, name: p.name, detail: p.stages.map((s) => `${s.name} ${s.probability}%`).join(" · ") })), dependsOn: () => "Deals on this pipeline move to the default one." })}>
        {plural(seed.pipelines.length, "pipeline")} · {stages.join(" → ")}
      </Button>
    ) })
  add({ id: "pipe.contact-stages", area: "Pipeline and data", label: "Contact and account stages", short: "Contact and account stages",
    value: <span className="text-sm">{STAGES.length} contact stages · {ACCOUNT_STAGES.length} account stages: {ACCOUNT_STAGES.join(", ")}</span> })
  add({ id: "pipe.fields", area: "Pipeline and data", label: "Custom fields", short: "Custom fields",
    block: (
      <Rows
        items={seed.fields} keyOf={(f) => f.id} empty="No custom fields yet."
        render={(f) => (
          <span className="group flex flex-wrap items-center gap-x-3 gap-y-1 rounded px-1 py-1 hover:bg-muted/50">
            <span className="w-44 shrink-0 text-sm">{f.label}</span>
            <span className="w-28 shrink-0 text-xs text-muted-foreground">{f.object === "person" ? "People" : f.object === "company" ? "Companies" : "Deals"}</span>
            <span className="w-24 shrink-0 text-xs text-muted-foreground">{f.kind}</span>
            <span className="text-xs text-muted-foreground">{f.requiredAtStage ? `required at ${f.requiredAtStage}` : "not required"}{f.crmField ? ` · ${f.crmField}` : ""}</span>
            <span className="flex-1" />
            <RowActions actions={[{ label: "Open", onClick: () => open({ kind: "field", field: f }) }]} />
          </span>
        )}
      />
    ) })
  add({ id: "pipe.currency", area: "Pipeline and data", label: "Deal currency", short: "Deal currency",
    value: (
      <span className="flex items-center gap-3">
        <Pick id="pipe.currency" change="Deal currency" label="Deal currency" value={ws.currency} options={["EUR", "USD", "GBP"]} width="w-28" />
        <Toggle id="pipe.multicurrency" change="Multi-currency" label="Multi-currency" on={st.pipeline.multiCurrency} onLabel="Multi-currency on" offLabel="One currency" />
      </span>
    ) })
  add({ id: "pipe.enrichment-order", area: "Pipeline and data", label: "Enrichment provider order", short: "Enrichment provider order",
    value: isAdmin
      ? <span className="text-sm">{ws.waterfall.order.join(" → ")} · stops at the first verified answer · ceiling {ws.waterfall.ceilingPerRow} credits a row</span>
      : <SetBy admin={admin} item="Enrichment provider order" search={ctx.search} value={ws.waterfall.order.join(" → ")} />,
    readOnly: !isAdmin,
    note: "The order decides what a row costs: the first provider that answers is the one you pay." })
  add({ id: "pipe.required-at-stage", area: "Pipeline and data", label: "Required to enter a stage", short: "Required to enter a stage",
    value: (
      <span className="text-sm">
        {stages.map((s) => {
          const req = seed.pipelines[0]?.stages.find((x) => x.name === s)?.requiredFields ?? []
          return req.length ? `${s}: ${req.join(", ")}` : null
        }).filter(Boolean).join(" · ") || "Nothing is required to move a deal"}
      </span>
    ),
    note: "The deal's stage stepper prints this before the click, naming the fields and who set them." })
  add({ id: "pipe.deal-warnings", area: "Pipeline and data", label: "Deal warnings", short: "Deal warnings",
    block: (
      <ul className="grid gap-1.5">
        {[
          { name: "No activity", threshold: `${seed.dealWarningThresholds.noActivityDays} days`, observed: `${seed.deals.filter((d) => !d.archivedAt).length} open deals checked` },
          { name: "Ghosted", threshold: `${seed.dealWarningThresholds.ghostedDays} days since they last did anything`, observed: `${seed.deals.filter((d) => d.lastProspectActivityAt && Date.parse("2026-09-13") - Date.parse(d.lastProspectActivityAt) > seed.dealWarningThresholds.ghostedDays * 86_400_000).length} today` },
          { name: "Too few contacts", threshold: `under ${seed.dealWarningThresholds.minContacts} contacts`, observed: `${seed.deals.filter((d) => d.contactCount < seed.dealWarningThresholds.minContacts).length} today` },
          { name: "Stalled in stage", threshold: `${seed.dealWarningThresholds.stalledDays} days`, observed: `${seed.deals.filter((d) => Date.parse("2026-09-13") - Date.parse(d.stageEnteredAt) > seed.dealWarningThresholds.stalledDays * 86_400_000).length} today` },
          { name: "Close date in the past", threshold: "the day after the close date", observed: `${seed.deals.filter((d) => d.closeDate < "2026-09-13" && !d.archivedAt).length} today` },
          { name: "No senior sponsor", threshold: "at Proposal and beyond", observed: `${seed.deals.filter((d) => !d.seniorSponsor && (d.stage === "Proposal" || d.stage === "Negotiation")).length} today` },
        ].map((w) => (
          <li key={w.name} className="flex flex-wrap items-baseline gap-x-3 text-sm">
            <span className="w-48 shrink-0">{w.name}</span>
            <span className="text-muted-foreground">warns at {w.threshold}</span>
            <span className="text-xs text-muted-foreground">· {w.observed}</span>
          </li>
        ))}
      </ul>
    ) })
  add({ id: "pipe.forecast-categories", area: "Pipeline and data", label: "Forecast categories", short: "Forecast categories",
    block: (
      <ul className="grid gap-1.5">
        {st.pipeline.forecastDefinitions.map((f) => (
          <li key={f.name} className="flex flex-wrap items-baseline gap-x-3 text-sm">
            <span className="w-28 shrink-0">{f.name}</span>
            <span className="text-muted-foreground">{f.definition}</span>
          </li>
        ))}
      </ul>
    ),
    note: "Reports prints these words under each label." })
  add({ id: "pipe.goal", area: "Pipeline and data", label: "Targets per period", short: "Targets",
    value: (
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
        onClick={() => open({ kind: "list", title: "Targets", rows: seed.goals.map((g) => ({ id: g.id, name: `${g.user ?? g.team} · ${g.period}`, detail: money(g.amount, ws.currency) })) })}>
        {plural(seed.goals.length, "target")} set for {seed.goals[0]?.period ?? "this period"}
      </Button>
    ) })
  add({ id: "pipe.submission-window", area: "Pipeline and data", label: "Forecast submission window", short: "Submission window",
    value: <span className="text-sm">Opens {st.pipeline.submissionWindow.opensOn}, due {st.pipeline.submissionWindow.day} at {st.pipeline.submissionWindow.time}</span>,
    readOnly: !isAdmin })
  add({ id: "pipe.renewal-reminders", area: "Pipeline and data", label: "Renewal reminders", short: "Renewal reminders",
    value: <span className="text-sm">{st.pipeline.renewalReminders.join(", ")} days before the renewal date</span>,
    note: "Each one creates a task for the account owner.",
    readOnly: !isAdmin })

  /* --------------------------------------------------------------------------------- Sequences */

  add({ id: "seq.schedules", area: "Sequences", label: "Sending schedules", short: "Sending schedules",
    value: (
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
        onClick={() => open({ kind: "list", title: "Sending schedules", rows: seed.schedules.map((s) => ({ id: s.id, name: s.name, detail: `${s.days.join(", ")} · ${s.hours} · ${s.timezone}` })), dependsOn: (id) => `${seed.sequences.filter((q) => q.schedule === seed.schedules.find((s) => s.id === id)?.name).length} sequences use this schedule.` })}>
        {plural(seed.schedules.length, "schedule")}
      </Button>
    ) })
  // Reusable rulesets are a Growth capability (spec 05 §3.5): the lock sits on the row, priced, and
  // the per-sequence rules underneath keep saving on every plan.
  const rulesetGate = gate("rulesets", ctx.business)
  const rulesetButton = (
    <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
      onClick={() => open({ kind: "list", title: "Sequence rulesets", rows: seed.rulesets.map((r) => ({ id: r.id, name: r.name, detail: `${r.stopOnReply ? "stops on reply" : "runs on"} · ${r.maxEmailsPerPersonPerDay} a person a day` })), dependsOn: (id) => `${seed.sequences.filter((q) => q.ruleset === seed.rulesets.find((r) => r.id === id)?.name).length} sequences use this ruleset.` })}>
      {plural(seed.rulesets.length, "ruleset")}
    </Button>
  )
  add({ id: "seq.rulesets", area: "Sequences", label: "Sequence rulesets", short: "Rulesets",
    value: rulesetGate.locked
      ? <Locked feature="Reusable rulesets" plan={rulesetGate.plan} pricePerMonth={rulesetGate.pricePerMonth} what={rulesetGate.what}>{rulesetButton}</Locked>
      : rulesetButton })
  add({ id: "seq.priority", area: "Sequences", label: "Sequence priority", short: "Sequence priority",
    value: <span className="text-sm">{seed.sequences.filter((s) => s.priority === "High").length} high, {seed.sequences.filter((s) => s.priority === "Normal").length} normal, {seed.sequences.filter((s) => s.priority === "Low").length} low</span>,
    note: "When a person is due a step in two sequences, the higher priority sends and the other waits." })

  /* --------------------------------------------------------- Signals, scoring and personas */

  add({
    id: "score.primary", area: "Signals, scoring and personas", label: "The primary score", short: "The primary score and its threshold",
    keywords: ["MQL", "threshold", "routing"],
    value: primary ? (
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-sm">{primary.name} · threshold {primary.threshold}</span>
        <Chip tone={primary.shareAbove > 80 ? "warning" : undefined}>{primary.shareAbove}% of people score above it</Chip>
        <span className="text-xs text-muted-foreground">published {day(primary.published)} by {primary.publishedBy}</span>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => open({ kind: "score", model: primary })}>Open</Button>
      </span>
    ) : <span className="text-sm text-muted-foreground">No score model yet.</span>,
    note: "A threshold that routes people to a rep decides whose week they land in.",
  })
  add({ id: "score.models", area: "Signals, scoring and personas", label: "Score models", short: "Score models",
    block: (
      <Rows
        items={seed.scoreModels.filter((m) => !m.retired)} keyOf={(m) => m.id} empty="No score models yet."
        render={(m) => (
          <span className="group flex flex-wrap items-center gap-x-3 gap-y-1 rounded px-1 py-1 hover:bg-muted/50">
            <span className="w-44 shrink-0 text-sm">{m.name}</span>
            <span className="w-24 shrink-0 text-xs text-muted-foreground">{m.kind}</span>
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{m.inputs.map((i) => i.name).join(", ")}</span>
            <RowActions actions={[{ label: "Open", onClick: () => open({ kind: "score", model: m }) }]} />
          </span>
        )}
      />
    ) })
  add({ id: "score.weights", area: "Signals, scoring and personas", label: "Weights and decay", short: "Weights and decay",
    value: primary ? <span className="text-sm">{primary.inputs.map((i) => `${i.name} ${i.weight}`).join(" · ")} · decays after {primary.decayDays} days</span> : <span className="text-sm text-muted-foreground">—</span> })
  add({ id: "score.preview", area: "Signals, scoring and personas", label: "Distribution preview", short: "Distribution preview",
    value: primary ? <span className="text-sm">{primary.shareAbove}% of people score above {primary.threshold}. Above 80% the threshold is not doing work.</span> : undefined })
  add({ id: "score.publish", area: "Signals, scoring and personas", label: "Publish a threshold", short: "Publish a threshold",
    value: primary ? (
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => open({ kind: "score", model: primary })}>Change and publish</Button>
    ) : undefined,
    note: "Publishing states the old and the new threshold, how many are above each today, and what happens to people already routed." })
  add({ id: "score.stamp", area: "Signals, scoring and personas", label: "What the Score filter says", short: "The published stamp",
    value: primary ? <span className="text-sm">Threshold {primary.threshold}, published {longDay(primary.published)} by {primary.publishedBy}</span> : undefined,
    note: "The same line sits beside the Score filter on People." })
  add({ id: "score.personas", area: "Signals, scoring and personas", label: "Personas", short: "Personas",
    block: (
      <Rows
        items={personas} keyOf={(p) => p.id} empty="No personas yet."
        render={(p) => (
          <span className="group flex flex-wrap items-center gap-x-3 gap-y-1 rounded px-1 py-1 hover:bg-muted/50">
            <span className="w-56 shrink-0 text-sm">{p.name}</span>
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{p.title} · {p.seniority} · {p.industry}</span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{p.sizeCount.toLocaleString()} people</span>
            <RowActions actions={[{ label: "Open", onClick: () => open({ kind: "persona", persona: p }) }]} />
          </span>
        )}
      />
    ) })
  add({ id: "score.persona-def", area: "Signals, scoring and personas", label: "One persona", short: "A persona's definition",
    value: personas[0] ? <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => open({ kind: "persona", persona: personas[0] })}>Title, seniority, department, industry, size, geography</Button> : undefined })
  add({ id: "score.signals", area: "Signals, scoring and personas", label: "Signals", short: "Signals and their freshness",
    block: (
      <Rows
        items={signals} keyOf={(s) => s.id} empty="No signals yet."
        render={(s) => (
          <span className="group flex flex-wrap items-center gap-x-3 gap-y-1 rounded px-1 py-1 hover:bg-muted/50">
            <span className="w-56 shrink-0 text-sm">{s.name}</span>
            <span className="w-28 shrink-0 text-xs text-muted-foreground">{s.source}</span>
            <span className="text-xs text-muted-foreground">counted under {s.freshnessDays} days old · {s.matches.toLocaleString()} matching</span>
            <span className="flex-1" />
            <RowActions actions={[{ label: "Open", onClick: () => open({ kind: "signal", signal: s }) }]} />
          </span>
        )}
      />
    ) })
  add({ id: "score.signal-def", area: "Signals, scoring and personas", label: "One signal", short: "A signal's definition",
    value: signals[0] ? <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => open({ kind: "signal", signal: signals[0] })}>Definition, source, freshness, talking tips</Button> : undefined })
  add({ id: "score.expansion-routing", area: "Signals, scoring and personas", label: "Expansion routing", short: "Expansion routing",
    value: isAdmin ? (
      <span className="flex flex-wrap items-center gap-2">
        <Num id="score.expansion.owner" change="Expansion routing: to the account owner under" label="To the account owner under" value={st.scoring.expansionRouting.toOwnerUnder} width="w-28" suffix="to the account owner" />
        <Num id="score.expansion.ae" change="Expansion routing: to the AE at or over" label="To the account executive at or over" value={st.scoring.expansionRouting.toAeAtOrOver} width="w-28" suffix="to the account executive of record" />
      </span>
    ) : <SetBy admin={admin} item="Expansion routing" search={ctx.search}
      value={`under ${money(st.scoring.expansionRouting.toOwnerUnder, ws.currency)} to the account owner, ${money(st.scoring.expansionRouting.toAeAtOrOver, ws.currency)} and above to the account executive of record`} />,
    readOnly: !isAdmin,
    note: "This decides whose number an expansion lands on." })
  add({ id: "score.first-value", area: "Signals, scoring and personas", label: "No first-value milestone in 90 days", short: "The first-value signal",
    value: <span className="text-sm">Raises Onboarding stalled on an account after {st.scoring.firstValue.noMilestoneDays} days with no first-value milestone</span>,
    readOnly: !isAdmin })
  add({ id: "score.retired", area: "Signals, scoring and personas", label: "Retired definitions", short: "Retired signals, personas and archived models",
    value: <span className="text-sm">{plural(retired, "retired definition")}, kept because last quarter's numbers were computed with them</span> })

  /* ---------------------------------------------------------------------------- Agents and AI */

  add({ id: "ai.context", area: "Agents and AI", label: "Company context", short: "Company context",
    value: <span className="text-sm text-muted-foreground">{st.agents.context}</span>,
    note: "Every agent reads this before it writes anything." })
  add({ id: "ai.agents", area: "Agents and AI", label: "Agents on or off", short: "Which agents are on",
    block: (
      <ul className="grid gap-1.5">
        {seed.agents.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="w-40 shrink-0 text-sm">{a.name}</span>
            {isAdmin
              ? <Toggle id={`ai.agent.${a.id}`} change={`${a.name} on or off`} label={a.name} on={a.on} />
              : <span className="text-sm text-muted-foreground">{a.on ? "On" : "Off"}</span>}
            {a.pausedReason && <span className="text-xs text-muted-foreground">{a.pausedReason}</span>}
          </li>
        ))}
      </ul>
    ) })
  add({
    id: "ai.approvals", area: "Agents and AI", label: "What agents may do without approval", short: "Approval rules",
    block: (
      <ul className="grid gap-1.5">
        {seed.agents.map((a) => (
          <li key={a.id} className="flex flex-wrap items-baseline gap-x-3 text-sm">
            <span className="w-40 shrink-0">{a.name}</span>
            <span className="text-muted-foreground">
              logged, not queued: {a.can.length} things · needs the owner's approval: {a.needsApprovalFor.join(", ").toLowerCase()}
            </span>
          </li>
        ))}
      </ul>
    ),
    note: "Turning off an approval means the agent sends or spends without a person seeing it first.",
  })
  add({
    id: "ai.credit-caps", area: "Agents and AI", label: "Agent credit caps", short: "Credit caps",
    block: (
      <ul className="grid gap-1.5">
        {seed.agents.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="w-40 shrink-0 text-sm">{a.name}</span>
            {isAdmin ? (
              <>
                <Num id={`ai.cap.run.${a.id}`} change={`Per-run cap (${a.name})`} label={`Per-run cap for ${a.name}`} value={a.capPerRun} width="w-20" suffix="a run" />
                <Num id={`ai.cap.month.${a.id}`} change={`Monthly cap (${a.name})`} label={`Monthly cap for ${a.name}`} value={a.capPerMonth} width="w-28" suffix="a month" />
              </>
            ) : <span className="text-sm text-muted-foreground">{a.capPerRun} a run · {credits(a.capPerMonth)} a month</span>}
            <span className="text-xs text-muted-foreground">{credits(a.spentThisWeek)} spent this week</span>
          </li>
        ))}
      </ul>
    ),
  })
  add({ id: "ai.second-approval", area: "Agents and AI", label: "Second approval", short: "Second-approval threshold",
    value: isAdmin ? (
      <span className="flex flex-wrap items-center gap-2">
        <Num id="ai.second.recipients" change="Second approval above n recipients" label="Recipients" value={seed.secondApproval.recipients} width="w-24" suffix="recipients" />
        <Num id="ai.second.credits" change="Second approval above n credits" label="Credits" value={seed.secondApproval.credits} width="w-20" suffix="credits in one action" />
      </span>
    ) : <SetBy admin={admin} item="Second approval" search={ctx.search} value={`over ${seed.secondApproval.recipients.toLocaleString()} recipients or ${seed.secondApproval.credits} credits in one action`} />,
    readOnly: !isAdmin,
    note: "Above either number the owner's approval is not enough and an admin has to approve it too." })
  add({ id: "ai.no-overwrite", area: "Agents and AI", label: "Agents never overwrite a field a person set", short: "The no-overwrite rule",
    value: <span className="text-sm">Agents never overwrite a field a person set or confirmed; they propose instead.</span>,
    note: "It is what the suggested, edited and validated marks on an agent-writable field mean." })
  add({ id: "ai.own-key", area: "Agents and AI", label: "Bring your own model key", short: "Your own model key", feature: "agents.own-model-key",
    value: <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => toast("Paste a provider key. Agent runs are billed to your provider instead of your credits.")}>
      {st.agents.ownKeySet ? "Key set" : "Add a key"}
    </Button> })

  /* ------------------------------------------------------------------------------ Integrations */

  add({
    id: "int.crm", area: "Integrations", label: b.crm ? "CRM sync" : "Your CRM", short: "CRM sync",
    value: crm ? (
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-sm">{crm.name}</span>
        <Chip tone={crm.errorsToday > 0 ? "error" : "good"}>{crm.errorsToday === 0 ? "No errors today" : `${crm.errorsToday} errors today`}</Chip>
        <span className="text-xs text-muted-foreground">synced {crm.lastSync} · {crm.objects.map((o) => `${o.object} ${o.direction}`).join(", ")}</span>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { location.hash = `#/ollopa/integrations/${crm.id}` }}>Open</Button>
        <CustomObjects business={ctx.business} />
      </span>
    ) : (
      <span className="text-sm">
        <strong>ollopA is your CRM.</strong> It is holding your contacts, companies and deals. Connect Salesforce or HubSpot if that changes.
        <Button size="sm" variant="outline" className="ml-2 h-7 px-2 text-xs" onClick={() => { location.hash = "#/ollopa/connect/salesforce" }}>Connect a CRM</Button>
      </span>
    ),
  })
  add({ id: "int.field-mapping", area: "Integrations", label: "CRM field mapping", short: "Field mapping",
    value: crm ? (
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-sm">{plural(crm.mappings.length, "field")} mapped</span>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => open({ kind: "list", title: "CRM field mapping", rows: crm.mappings.map((m, i) => ({ id: String(i), name: `${m.ollopa} → ${m.remote}`, detail: `${m.direction} · ${m.writeRule}` })) })}>Open the mapping</Button>
      </span>
    ) : <span className="text-sm text-muted-foreground">Nothing to map: no CRM is connected.</span> })
  add({ id: "int.error-log", area: "Integrations", label: "Sync error log", short: "Sync error log",
    value: (
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
        onClick={() => open({ kind: "list", title: "Sync errors grouped by cause", rows: seed.syncErrors.map((e) => ({ id: e.id, name: `${e.integration} · ${e.count} records`, detail: e.message })) })}>
        {seed.syncErrors.length === 0 ? "No errors" : `${seed.syncErrors.reduce((n, e) => n + e.count, 0)} records did not sync`}
      </Button>
    ) })
  add({ id: "int.calendar", area: "Integrations", label: "Calendar", short: "Calendar",
    value: <span className="text-sm">{seed.integrations.find((i) => /Calendar/.test(i.kind))?.calendars.join(", ") ?? "Not connected"}</span> })
  add({ id: "int.slack", area: "Integrations", label: "Slack", short: "Slack",
    value: (() => {
      const slack = seed.integrations.find((i) => i.kind === "Slack")
      return <span className="text-sm">{slack ? `${plural(slack.channels.length, "event")} posted to ${new Set(slack.channels.map((c) => c.channel)).size} channels` : "Not connected"}</span>
    })() })
  add({ id: "int.enrichment", area: "Integrations", label: "Enrichment provider", short: "Enrichment provider",
    value: <span className="text-sm">{ws.waterfall.order.join(" → ")}</span> })

  /* ------------------------------------------------------- API, webhooks, MCP and CLI */

  add({ id: "dev.limits", area: "API, webhooks, MCP and CLI", label: "Limits", short: "Published limits",
    value: <span className="text-sm">{API_LIMITS.perMinute} a minute · {API_LIMITS.perHour.toLocaleString()} an hour · {API_LIMITS.perDay.toLocaleString()} a day</span>,
    note: "Per workspace, not per key. A second key does not buy a second allowance." })
  add({ id: "dev.cost-table", area: "API, webhooks, MCP and CLI", label: "Cost per endpoint", short: "The cost table",
    block: (
      <ul className="grid gap-1">
        {seed.endpointCosts.map((e) => (
          <li key={e.endpoint} className="flex flex-wrap items-baseline gap-x-3 text-sm">
            <code className="w-64 shrink-0 text-xs">{e.endpoint}</code>
            <span className="text-muted-foreground">typical {e.typical}</span>
            <span className="text-muted-foreground">· maximum {e.maximum}</span>
          </li>
        ))}
      </ul>
    ),
    note: "The maximum, not the average: one waterfall tail can reach 45 credits on a single row." })
  add({ id: "dev.api-keys", area: "API, webhooks, MCP and CLI", label: "API keys", short: "API keys", feature: "api",
    block: (
      <Rows
        items={seed.apiKeys} keyOf={(k) => k.id} empty="No key yet."
        render={(k) => (
          <span className="group flex flex-wrap items-center gap-x-3 gap-y-1 rounded px-1 py-1 hover:bg-muted/50">
            <span className="w-44 shrink-0 text-sm">{k.name}</span>
            <span className="w-52 shrink-0 truncate text-xs text-muted-foreground">{k.scopes.join(", ")}</span>
            <span className="text-xs text-muted-foreground">last used {k.lastUsedAt ? day(k.lastUsedAt) : "never"}</span>
            <span className="text-xs tabular-nums text-muted-foreground">{credits(k.creditsThisCycle)} this cycle</span>
            <span className="flex-1" />
            <RowActions actions={[{ label: "Open", onClick: () => open({ kind: "key", apiKey: k }) }]} />
          </span>
        )}
      />
    ) })
  add({ id: "dev.key-spend", area: "API, webhooks, MCP and CLI", label: "Spend per key", short: "Spend per key",
    value: <span className="text-sm">
      {credits(seed.apiKeys.reduce((n, k) => n + k.creditsThisCycle, 0))} of {credits(seed.credits.monthlyCap)} this cycle, against the workspace balance
    </span>,
    note: "Keys spend the same balance the app does. There is no separate API allowance." })
  add({ id: "dev.alert-80", area: "API, webhooks, MCP and CLI", label: "Alert the key's owner at 80%", short: "The 80% alert",
    value: <Toggle id="dev.alert-80" change="80% alert" label="Alert at 80% of the allocation" on={true} onLabel="On" offLabel="Off" />,
    note: "Delivered as a digest line and a bell row under credits low. No new kind of notification." })
  add({ id: "dev.webhooks", area: "API, webhooks, MCP and CLI", label: "Webhooks", short: "Webhooks", feature: "webhooks",
    block: (
      <Rows
        items={seed.webhooks} keyOf={(w) => w.id} empty="No subscription yet."
        render={(w) => (
          <span className="group flex flex-wrap items-center gap-x-3 gap-y-1 rounded px-1 py-1 hover:bg-muted/50">
            <span className="min-w-0 flex-1 truncate text-sm">{w.url}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{w.events.join(", ")}</span>
            <Chip tone={w.state === "failing" ? "error" : w.state === "paused" ? "warning" : "good"}>{w.state}</Chip>
            <RowActions actions={[{ label: "Open", onClick: () => open({ kind: "hook", hook: w }) }]} />
          </span>
        )}
      />
    ) })
  add({ id: "dev.hook-contract", area: "API, webhooks, MCP and CLI", label: "The delivery contract", short: "The delivery contract",
    block: (
      <ul className="grid list-disc gap-0.5 pl-4 text-sm text-muted-foreground">
        <li>At least once: the same event can arrive twice, so handle it twice.</li>
        <li>Signed, so you can tell it came from us.</li>
        <li>Every attempt is numbered.</li>
        <li>Retried for 24 hours, with the gap widening each time.</li>
        <li>Never silently disabled: a failing subscription says so here.</li>
        <li>Anything you missed is readable from <code className="rounded bg-muted px-1">GET /v1/events?since=</code>.</li>
      </ul>
    ) })
  add({ id: "dev.mcp", area: "API, webhooks, MCP and CLI", label: "MCP connection and scope", short: "MCP scope",
    value: (
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-sm">{plural(seed.mcpTokens.length, "connection")} · read is on every plan</span>
        {myToken && <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => open({ kind: "mcp", token: myToken })}>Read, safe writes, destructive writes</Button>}
      </span>
    ),
    note: "The plan is stated by the endpoint at connection, never at the moment a write fails." })
  add({ id: "dev.cli", area: "API, webhooks, MCP and CLI", label: "CLI device authorisations", short: "CLI devices", feature: "api",
    value: (
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => open({ kind: "cli" })}>
        {seed.cliDevices.length === 0 ? "No device authorised" : plural(seed.cliDevices.length, "device")}
      </Button>
    ) })

  /* ------------------------------------------------------------------- Plan, billing and usage */

  add({ id: "plan.seats", area: "Plan, billing and usage", label: "Plan and seats", short: "Plan and seats",
    value: <span className="text-sm">{b.plan.name} · {b.plan.seats} seats · {seed.users.length} used</span> })
  add({ id: "plan.price", area: "Plan, billing and usage", label: "Price and renewal", short: "Price and renewal",
    value: (
      <span className="flex flex-wrap items-center gap-2 text-sm">
        <span>{money(ws.plan.monthlyTotal)} a month, billed {ws.plan.billing === "annual" ? "annually" : "monthly"} · renews {longDay(ws.plan.renews)}</span>
      </span>
    ) })
  add({ id: "plan.credits", area: "Plan, billing and usage", label: "Credit balance and burn rate", short: "Credits",
    value: <span className="text-sm">
      {credits(seed.credits.balance)} of {credits(seed.credits.monthlyCap)} left this month · {credits(seed.credits.burnPerWeek)} a week · lasts to about {longDay(seed.credits.runsOutOn)}
      {myCredits?.limit ? ` · your limit ${credits(myCredits.limit)}, used ${credits(myCredits.used)}` : ""}
    </span> })
  add({ id: "plan.upgrade-requests", area: "Plan, billing and usage", label: "Upgrade requests from teammates", short: "Upgrade requests",
    value: openUpgrades.length === 0
      ? <span className="text-sm text-muted-foreground">Nobody is waiting on an upgrade.</span>
      : (
        <span className="flex flex-wrap items-center gap-2 text-sm">
          <span>{plural(openUpgrades.length, "upgrade request")} · {openUpgrades[0].requester.user} wants {openUpgrades[0].upgrade!.feature} ({openUpgrades[0].upgrade!.plan}, {money(openUpgrades[0].upgrade!.monthlyTotal)} a month for {b.plan.seats} seats)</span>
          <a className="underline underline-offset-4" href={href("/ollopa/requests")}>Review</a>
        </span>
      ) })
  add({ id: "plan.credit-breakdown", area: "Plan, billing and usage", label: "Where the credits went", short: "Credit spend by feature, person and surface",
    value: <span className="text-sm text-muted-foreground">By feature, by person and by surface: app, automation, API, MCP, CLI, agents.</span> })
  add({ id: "plan.team-budget", area: "Plan, billing and usage", label: "Team credit budget", short: "Team credit budget",
    block: seed.credits.teamBudgets.length === 0
      ? <p className="text-sm text-muted-foreground">No teams, so no team budget.</p>
      : (
        <ul className="grid gap-1.5">
          {seed.credits.teamBudgets.map((t) => (
            <li key={t.team} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="w-56 shrink-0 text-sm">{t.team}</span>
              <Num id={`plan.budget.${t.team}`} change={`Team budget (${t.team})`} label={`Budget for ${t.team}`} value={t.credits} width="w-28" />
              <span className="text-xs text-muted-foreground">{credits(t.used)} used</span>
            </li>
          ))}
        </ul>
      ) })
  add({ id: "plan.spike-alert", area: "Plan, billing and usage", label: "Credit spike alert", short: "Credit spike alert",
    value: (
      <span className="flex flex-wrap items-center gap-2">
        <Num id="plan.spike" change="Credit spike alert" label="Alert at n times the usual daily burn" value={seed.credits.spikeAlert.multiple} width="w-16" suffix="× the usual daily burn" />
        <Chip tone={seed.credits.spikeAlert.todayMultiple >= seed.credits.spikeAlert.multiple ? "warning" : undefined}>
          today {seed.credits.spikeAlert.todayMultiple}× · {seed.credits.spikeAlert.todayMultiple >= seed.credits.spikeAlert.multiple ? "alerted" : "nothing alerted"}
        </Chip>
      </span>
    ) })
  add({ id: "plan.invoices", area: "Plan, billing and usage", label: "Invoices", short: "Invoices",
    value: (
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
        onClick={() => open({ kind: "list", title: "Invoices", rows: seed.invoices.map((i) => ({ id: i.id, name: `${i.number} · ${money(i.amount, i.currency)}`, detail: `${i.period} · ${i.status === "paid" ? `paid ${day(i.paidOn ?? "")}` : "due"}` })) })}>
        {plural(seed.invoices.length, "invoice")}
      </Button>
    ) })
  add({ id: "plan.tax-id", area: "Plan, billing and usage", label: "Tax ID", short: "Tax ID",
    value: <Text id="plan.tax-id" change="Tax ID" label="Tax ID" value={ws.taxId ?? ""} width="w-48" /> })
  add({ id: "plan.cancel", area: "Plan, billing and usage", label: "Cancel plan", short: "Cancel plan",
    value: <span className="text-sm text-muted-foreground">Cancel is beside Change plan at the top of this page.</span> })
  add({ id: "plan.export", area: "Plan, billing and usage", label: "Export all data", short: "Export all data",
    value: <ExportAll business={ctx.business} /> })
  add({ id: "plan.delete", area: "Plan, billing and usage", label: "Delete workspace", short: "Delete workspace",
    value: <DeleteWorkspace name={ws.name} seed={seed} />,
    note: `Deletes ${seed.contacts.length.toLocaleString()} contacts, ${plural(seed.sequences.length, "sequence")} and ${plural(seed.users.length, "person", "people")}'s data. Fourteen days to change your mind, then it is gone. Export first.` })

  return rows
}

/* --------------------------------------------------------- the two controls a plan can lock here */

/** The lock is on adding a second mailbox, not on reading the table people check every morning. */
function LinkMailbox({ business }: { business: Business }) {
  const g = gate("mailboxes.extra", business)
  const button = <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Link a mailbox</Button>
  return g.locked
    ? <Locked feature="A second mailbox per person" plan={g.plan} pricePerMonth={g.pricePerMonth} what={g.what}>{button}</Locked>
    : <span onClick={() => toast("Link a mailbox: choose a provider and authorise it.")}>{button}</span>
}

/** Custom objects in the CRM sync: the row is the CRM's, the lock is on the one thing the plan buys. */
function CustomObjects({ business }: { business: Business }) {
  const g = gate("crm.custom-objects", business)
  const button = <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">Custom objects</Button>
  return g.locked
    ? <Locked feature="Custom objects in the CRM sync" plan={g.plan} pricePerMonth={g.pricePerMonth} what={g.what}>{button}</Locked>
    : <span onClick={() => toast("Custom objects sync alongside the standard ones.")}>{button}</span>
}

/* ------------------------------------------------------------------- the two end-of-page actions */

function ExportAll({ business }: { business: Business }) {
  const [state, setState] = useState<"idle" | "running" | "done">("idle")
  const rows = seedFor(business).contacts.length + seedFor(business).companies.length + seedFor(business).deals.length
  return (
    <span className="flex flex-wrap items-center gap-2 text-sm">
      {state === "idle" && (
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => {
          setState("running")
          window.setTimeout(() => { setState("done"); toast("Your export is ready. We have emailed the link too.") }, 900)
        }}>Export all data</Button>
      )}
      {state === "running" && <span className="text-muted-foreground">Packing {rows.toLocaleString()} records…</span>}
      {state === "done" && <a className="underline underline-offset-4" href="#" onClick={(e) => { e.preventDefault(); toast("Download started. The link is good for seven days.") }}>Download the export ({rows.toLocaleString()} records)</a>}
      <span className="text-xs text-muted-foreground">Every table this seat can read, as CSV. On every plan.</span>
    </span>
  )
}

function DeleteWorkspace({ name, seed }: { name: string; seed: Seed }) {
  const [typed, setTyped] = useState("")
  const [open, setOpen] = useState(false)
  if (!open) return <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-destructive" onClick={() => setOpen(true)}>Delete workspace</Button>
  return (
    <span className="grid gap-2">
      <span className="text-sm">
        Deletes {seed.contacts.length.toLocaleString()} contacts, {seed.companies.length.toLocaleString()} companies, {plural(seed.sequences.length, "sequence")} and {plural(seed.users.length, "person", "people")}'s data.
        Fourteen days to change your mind. <a className="underline underline-offset-4" href="#plan.export" onClick={(e) => { e.preventDefault(); document.getElementById("row-plan.export")?.scrollIntoView({ block: "center" }) }}>Export first</a>.
      </span>
      <span className="flex flex-wrap items-center gap-2">
        <Input className="h-8 w-64" aria-label={`Type ${name} to confirm`} placeholder={`Type ${name}`} value={typed} onChange={(e) => setTyped(e.target.value)} />
        <Button size="sm" variant="destructive" disabled={typed !== name} onClick={() => { setOpen(false); setTyped(""); toast(`${name} is scheduled for deletion. You have 14 days.`) }}>Delete workspace</Button>
        <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setTyped("") }}>Keep it</Button>
      </span>
    </span>
  )
}

/* ------------------------------------------------------------------------------------- one row */

/**
 * One setting, wherever it is standing: on the page, behind a door, inside a parody tab. It carries
 * its usage item id as `data-item`, unchanged at every step, so the lesson view can see it move.
 *
 * `honest` is rule 4. When it is off, a control the plan does not include is greyed out with the
 * sentence the vendor's FAQ gives, which conflates "your plan does not include it" with "your admin
 * has not given you access". When it is on, the same control is a real button that opens a panel
 * naming the plan and the price.
 */
export function Row({ row, admin, honest = true }: { row: SettingRow; admin: string; honest?: boolean }) {
  const s = useSettingsState()
  const lit = s.lit === row.id
  const g = row.feature ? gate(row.feature) : null
  // The lock sits at the row, the entry point, and only once: either on the control, or beside the
  // heading of a block. Never on a Save button at the end of work somebody has already done.
  const locked = !!g?.locked
  const greyed = locked && !honest
  const wrapped = locked && row.value
    ? greyed
      ? <span className="pointer-events-none select-none opacity-50" aria-disabled="true">{row.value}</span>
      : <Locked feature={row.label} plan={g!.plan} pricePerMonth={g!.pricePerMonth} what={g!.what}>{row.value}</Locked>
    : row.value
  const note = greyed
    ? "If a setting is greyed out and you can't select it, your ollopA admin hasn't provided you access."
    : row.note

  return (
    <div
      id={`row-${row.id}`}
      data-row={row.id}
      data-item={row.id}
      data-item-label={row.label}
      className={cn("border-t border-border/60 px-2 py-2.5 first:border-t-0", lit && "rounded-md bg-amber-100/70 dark:bg-amber-950/40")}
    >
      {row.block ? (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-1.5">
            <h4 className="text-sm font-medium">{row.label}</h4>
            <span className="flex items-center gap-3">
              {row.readOnly && <span className="text-xs text-muted-foreground">set by {admin}</span>}
              {locked && (greyed ? (
                <Button size="sm" variant="outline" disabled className="h-7 px-2 text-xs">{row.label}</Button>
              ) : (
                <Locked feature={row.label} plan={g!.plan} pricePerMonth={g!.pricePerMonth} what={g!.what}>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs">{row.label} on {g!.plan}</Button>
                </Locked>
              ))}
            </span>
          </div>
          {row.block}
          {note && <p className="pt-1.5 text-xs text-muted-foreground">{note}</p>}
        </>
      ) : (
        <div className="grid gap-1 sm:grid-cols-[minmax(11rem,16rem)_1fr] sm:items-baseline sm:gap-4">
          <div className="text-sm">{row.label}</div>
          <div className="min-w-0">
            {wrapped}
            {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
