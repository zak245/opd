// The common version: settings as the category ships them.
//
// This is not a second implementation of the Settings page. It is the same rows, from the same
// `rowsFor(ctx)`, the same seed and the same seat, dealt out into the shell the category actually
// has — the one documented in `knowledge-base/sources/07-apollo-settings-map.md` (the memo) and
// described in spec 14 §5. Nothing here is invented: every page, every group, every tab and every
// misplacement below names the memo section that records it.
//
// It renders only while rule 1 is off (lesson steps 0 and 1). From step 2 the shell collapses into
// one page inside the product's own navigation and this file is not on screen.
//
// Tagging, so the lesson view can see things move (BUILD-WAVE3.md):
//   - every row carries `data-item` from `Row` in `rows.tsx`, the same id at every step;
//   - every page is a `data-container`, and so is every tab and the mailbox drawer;
//   - a page or tab that is not showing carries `data-open="false"`, which is how the delta knows a
//     thing is hidden — it never measures size.
import { useState, type ReactNode } from "react"
import { ChevronDown, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Row, type RowCtx, type SettingRow } from "./rows"
import { credits } from "./format"

/* ------------------------------------------------------------------------------- the shell map */

interface Tab { id: string; label: string; items?: string[]; note?: string }
interface ParodyPage {
  id: string
  label: string
  /** The grey group label it sits under, or null for the two ungrouped entries. */
  group: "personal" | "workspace" | null
  /** The collapsible ▾ group in the sidebar, if any (memo §6). */
  under?: string
  title?: string
  note?: string
  items?: string[]
  tabs?: Tab[]
}

/** The sidebar, top to bottom, as memo §6 lists it, trimmed to ollopA's boundary (spec 14 §5). */
const PAGES: ParodyPage[] = [
  { id: "get-started", label: "Get started", group: null },

  {
    id: "profile", label: "Profile", group: "personal",
    tabs: [
      { id: "general", label: "General", items: ["me.profile", "me.password"] },
      { id: "mfa", label: "Multi-factor authentication", items: ["me.mfa-own"] },
      { id: "custom-fields", label: "Custom fields", note: "Your custom user fields. Admins manage the field list under Users and teams › User fields." },
      { id: "email-settings", label: "Email settings", items: ["mail.unsubscribe-text", "mail.tracking"] },
    ],
  },
  {
    id: "personal-mailboxes", label: "Mailboxes & domains", group: "personal",
    note: "This is the same page as Email setup and health › Mailboxes, filtered to your own mailboxes. Memo §1.2: the personal entry redirects into the workspace page.",
  },
  { id: "notifications", label: "Notifications", group: "personal", items: ["me.notify-delivery"] },

  { id: "workspace-overview", label: "Workspace overview", group: "workspace", items: ["ws.name", "ws.logo", "ws.timezone", "ws.currency", "ws.language"] },

  { id: "email-overview", label: "Overview", group: "workspace", under: "Email setup and health", note: "Mailbox performance: emails sent successfully, open rate, reply activity, a deliverability chart and a Recommendations feed." },
  { id: "domains", label: "Domains", group: "workspace", under: "Email setup and health", items: ["mail.domains"] },
  { id: "marketing-domains", label: "Marketing domains", group: "workspace", under: "Email setup and health", note: "Domains used for marketing sends. Separate from the sending domains above." },
  { id: "mailboxes", label: "Mailboxes", group: "workspace", under: "Email setup and health", items: ["mail.mailboxes", "mail.warmup", "mail.limits"] },
  { id: "bounce-logs", label: "Bounce logs", group: "workspace", under: "Email setup and health", items: ["parody.bounce-rate"] },
  { id: "sending-policies", label: "Sending policies", group: "workspace", under: "Email setup and health", items: ["mail.bounce-guard", "mail.catch-all"] },

  { id: "users", label: "Users", group: "workspace", under: "Users and teams", items: ["team.users", "team.offboarding", "team.availability"] },
  { id: "teams", label: "Teams", group: "workspace", under: "Users and teams", items: ["team.teams"] },
  {
    id: "profiles", label: "Permission profiles", group: "workspace", under: "Users and teams",
    note: "Custom permission profiles are available on organization and custom plans.",
    items: ["team.profiles", "team.grants", "team.viewas", "mail.unsubscribe-permission", "ai.approvals"],
  },
  {
    id: "security", label: "Security", group: "workspace", under: "Users and teams",
    tabs: [
      { id: "mfa", label: "Multi-factor authentication", items: ["sec.mfa"] },
      { id: "ip", label: "IP whitelisting", items: ["sec.ip"] },
      { id: "password", label: "Password policy", items: ["sec.password"] },
      { id: "login", label: "Login controls", items: ["sec.session"] },
      { id: "sso", label: "Single sign on", items: ["sec.sso"] },
    ],
  },

  { id: "plan-overview", label: "Plan overview", group: "workspace", under: "Plan and billing", items: ["plan.seats", "plan.cancel", "parody.delete-support"] },
  { id: "manage-subscription", label: "Manage subscription", group: "workspace", under: "Plan and billing", items: ["plan.price"] },
  { id: "billing", label: "Billing", group: "workspace", under: "Plan and billing", items: ["plan.invoices", "plan.tax-id", "plan.export"] },

  {
    id: "credit-usage", label: "Credit usage", group: "workspace", under: "Credits and activity",
    tabs: [
      { id: "overview", label: "Overview", items: ["plan.credit-breakdown"] },
      { id: "usage-details", label: "Usage details", items: ["plan.credits"] },
      { id: "about", label: "About credits", note: "What a credit is and what each action costs, in prose." },
      { id: "ai-runs", label: "AI runs", note: "Credits spent by assistant runs." },
    ],
  },
  { id: "data-requests", label: "Data requests", group: "workspace", under: "Credits and activity", note: "Job-change request history and waterfall reports." },
  { id: "ai-words", label: "AI word usage", group: "workspace", under: "Credits and activity", note: "Words generated this cycle." },
  { id: "activity-log", label: "System activity log", group: "workspace", under: "Credits and activity", note: "Audit history. Also a top-level item in the Admin Settings flyout (memo §6, duplicate)." },

  {
    id: "integrations", label: "Integrations", group: "workspace",
    tabs: [
      { id: "marketplace", label: "All integrations", items: ["int.crm"] },
      { id: "crm", label: "Salesforce", items: ["int.field-mapping", "int.error-log"] },
      { id: "slack", label: "Slack", items: ["int.slack"] },
      { id: "calendar", label: "Calendar", items: ["int.calendar"] },
      { id: "enrichment", label: "Enrichment", items: ["int.enrichment"] },
      { id: "api", label: "ollopA API", items: ["dev.api-keys", "dev.webhooks", "dev.mcp", "dev.cli", "me.mcp-token"] },
      { id: "models", label: "AI models", items: ["ai.own-key"] },
    ],
  },
  { id: "ai-context", label: "AI context center", group: "workspace", items: ["ai.context"] },

  { id: "personas", label: "Personas", group: "workspace", under: "Ideal customer profile", items: ["score.personas", "score.persona-def"] },
  { id: "scoring", label: "Scoring", group: "workspace", under: "Ideal customer profile", items: ["score.primary", "score.models", "score.weights", "score.preview", "score.publish", "score.stamp", "score.retired"] },
  { id: "signals", label: "Signals", group: "workspace", under: "Ideal customer profile", items: ["score.signals", "score.signal-def"] },

  { id: "prospecting-config", label: "Prospecting config", group: "workspace", under: "Rules of engagement", items: ["pros.gdpr", "pros.dnc", "pros.primary-email", "pros.duplicates", "pros.in-progress"] },
  { id: "territories", label: "Territories", group: "workspace", under: "Rules of engagement", items: ["pros.territories"] },

  {
    id: "sequences", label: "Sequences", group: "workspace", under: "Team email & sequences",
    tabs: [
      { id: "rulesets", label: "Sequence rulesets", items: ["seq.rulesets"] },
      { id: "alerts", label: "Sequence alerts", note: "Who is told when a sequence stalls." },
      { id: "priority", label: "Priority settings", items: ["seq.priority"] },
      { id: "schedules", label: "Schedules", items: ["seq.schedules"] },
      { id: "best-times", label: "Best times", note: "Suggested send windows." },
    ],
  },
  { id: "tracking-subdomains", label: "Tracking subdomains", group: "workspace", under: "Team email & sequences", items: ["mail.tracking-subdomain"] },

  { id: "contact-fields", label: "Contact fields & stages", group: "workspace", under: "Objects, fields, stages", items: ["pipe.contact-stages", "pipe.fields"] },
  { id: "account-fields", label: "Account fields & stages", group: "workspace", under: "Objects, fields, stages", note: "Account fields and the five account stages. The stage list is the same one Contact fields & stages shows." },
  { id: "deal-fields", label: "Deal fields & stages", group: "workspace", under: "Objects, fields, stages", items: ["pipe.stages", "pipe.currency", "pipe.required-at-stage", "pipe.deal-warnings", "pipe.forecast-categories"] },
  { id: "waterfall", label: "Waterfall enrichment", group: "workspace", under: "Objects, fields, stages", items: ["pipe.enrichment-order"] },

  { id: "removal-requests", label: "Removal requests", group: "workspace", items: ["pros.removal-list"] },
]

/** The mailbox drawer: a row opens it, and it has four tabs of its own (memo §1.4). */
const DRAWER_TABS: Tab[] = [
  { id: "overview", label: "Overview", items: ["mail.signature"] },
  { id: "deliverability", label: "Deliverability", note: "Deliverability score and blocklist checks." },
  { id: "placement", label: "Inbox placement", note: "Run a placement test." },
  { id: "forwarding", label: "Forwarding email", note: "Where replies are forwarded." },
]

const GROUP_ORDER = ["Email setup and health", "Users and teams", "Plan and billing", "Credits and activity", "Ideal customer profile", "Rules of engagement", "Team email & sequences", "Objects, fields, stages"]

/* ------------------------------------------------------------------------------- small pieces */

function Ring({ label, done, of }: { label: string; done: number; of: number }) {
  const r = 18
  const c = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <svg viewBox="0 0 44 44" className="size-12" aria-hidden="true">
        <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
        <circle
          cx="22" cy="22" r={r} fill="none" strokeWidth="4" strokeLinecap="round"
          stroke="#eab308" strokeDasharray={`${(done / of) * c} ${c}`} transform="rotate(-90 22 22)"
        />
      </svg>
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[11px] text-muted-foreground">{done}/{of} complete</span>
    </div>
  )
}

function Accordion({ title, tasks, greyed }: { title: string; tasks: string[]; greyed?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t first:border-t-0">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-1 py-2.5 text-left text-sm font-medium">
        <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-90")} aria-hidden="true" />
        {title}
      </button>
      {open && (
        <div className="px-1 pb-3">
          {greyed && (
            <p className="mb-2 rounded border border-amber-300 bg-amber-50 px-2 py-1.5 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              Hey, it looks like you don't have the admin permissions to complete the tasks below.
            </p>
          )}
          <ul className={cn("grid gap-1.5 text-sm", greyed && "opacity-50")}>
            {tasks.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="size-4 shrink-0 rounded-full border" aria-hidden="true" />
                <span className="min-w-0 flex-1">{t}</span>
                <a className="shrink-0 text-xs text-muted-foreground underline underline-offset-2" href="#learn-more" onClick={(e) => e.preventDefault()}>Learn more</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function GetStarted({ workspace }: { workspace: string }) {
  return (
    <div data-item="parody.get-started" data-item-label="The Get started checklist">
      <h3 className="text-lg font-semibold">Configure your workspace to boost team performance</h3>
      <p className="pt-1 text-sm text-muted-foreground">{workspace}</p>
      <div className="mt-4 flex flex-wrap gap-6 rounded-md border p-4">
        <Ring label="Set up a team" done={3} of={5} />
        <Ring label="Build pipeline" done={4} of={9} />
        <Ring label="Enrich data" done={1} of={2} />
        <Ring label="Win deals" done={2} of={8} />
      </div>
      <div className="mt-4 rounded-md border px-3">
        <Accordion title="Set your team up for success" greyed tasks={[
          "Connect your CRM and manage your integrations",
          "Invite new teammates and assign permissions",
          "Create dashboards and reports",
          "Set permissions and default settings",
        ]} />
        <Accordion title="Help your team build pipeline" tasks={[
          "Prospecting settings: GDPR, job-change alerts, primary email type, duplicate handling",
          "Create your personas",
          "Write your core messaging strategy",
          "Set up signals, scores and buying intent",
        ]} />
        <Accordion title="Enrich your data to keep it fresh" tasks={["Enrichment sync settings", "Job change alerts"]} />
        <Accordion title="Coach your team to win more deals" tasks={["Recording consent", "Scheduler", "Custom contact and account fields", "Deal stages and fields"]} />
      </div>
    </div>
  )
}

/** A parody-only line: something the category shows in a place of its own. It has an id so that the
 *  lesson view can leave a ghost where it stood when the disclosed page stops showing it. */
function Line({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div data-item={id} data-item-label={label} className="border-t border-border/60 px-2 py-2.5 first:border-t-0">
      <div className="grid gap-1 sm:grid-cols-[minmax(11rem,16rem)_1fr] sm:items-baseline sm:gap-4">
        <div className="text-sm">{label}</div>
        <div className="min-w-0 text-sm">{children}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------ the body */

function Body({ ids, byId, extras, admin }: {
  ids: string[]
  byId: Map<string, SettingRow>
  extras: Record<string, ReactNode>
  admin: string
}) {
  const drawn = ids.map((id) => {
    if (extras[id]) return <div key={id}>{extras[id]}</div>
    const row = byId.get(id)
    return row ? <Row key={id} row={row} admin={admin} honest={false} /> : null
  }).filter(Boolean)
  if (drawn.length === 0) return null
  return <div>{drawn}</div>
}

function Tabs({ page, byId, extras, admin }: {
  page: ParodyPage
  byId: Map<string, SettingRow>
  extras: Record<string, ReactNode>
  admin: string
}) {
  const [active, setActive] = useState(page.tabs![0].id)
  return (
    <>
      <div role="tablist" aria-label={`${page.label} tabs`} className="mb-3 flex flex-wrap gap-1 border-b">
        {page.tabs!.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={cn("-mb-px border-b-2 px-3 py-2 text-sm", active === t.id ? "border-foreground font-medium" : "border-transparent text-muted-foreground")}
          >
            {t.label}
          </button>
        ))}
      </div>
      {page.tabs!.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          data-container={`parody.${page.id}.${t.id}`}
          data-container-label={`${page.label} › ${t.label}`}
          data-open={active === t.id ? "true" : "false"}
          hidden={active !== t.id}
        >
          {t.note && <p className="px-2 pb-2 text-sm text-muted-foreground">{t.note}</p>}
          <Body ids={t.items ?? []} byId={byId} extras={extras} admin={admin} />
        </div>
      ))}
    </>
  )
}

/** The mailbox drawer, three interactions in and four tabs deep: memo §1.4 counts six to a signature. */
function MailboxDrawer({ byId, admin }: { byId: Map<string, SettingRow>; admin: string }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState("overview")
  return (
    <div className="mt-3 rounded-md border">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium">
        <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-90")} aria-hidden="true" />
        Open a mailbox
      </button>
      <div
        data-container="parody.mailbox-drawer"
        data-container-label="the mailbox drawer"
        data-open={open ? "true" : "false"}
        hidden={!open}
        className="border-t px-3 py-2"
      >
        <div role="tablist" aria-label="Mailbox tabs" className="mb-2 flex flex-wrap gap-1 border-b">
          {DRAWER_TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={cn("-mb-px border-b-2 px-2 py-1.5 text-xs", tab === t.id ? "border-foreground font-medium" : "border-transparent text-muted-foreground")}>
              {t.label}
            </button>
          ))}
        </div>
        {DRAWER_TABS.map((t) => (
          <div key={t.id} role="tabpanel"
            data-container={`parody.mailbox-drawer.${t.id}`}
            data-container-label={`the mailbox drawer › ${t.label}`}
            data-open={tab === t.id ? "true" : "false"}
            hidden={tab !== t.id}
          >
            {t.note && <p className="px-2 py-2 text-sm text-muted-foreground">{t.note}</p>}
            <Body ids={t.items ?? []} byId={byId} extras={{}} admin={admin} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------------------- the shell */

export function ParodyShell({ ctx, rows, present, strip }: {
  ctx: RowCtx
  /** Every row the page can draw, keyed below by its usage item id. */
  rows: SettingRow[]
  /** The ids this seat has any use for: the same filter the disclosed page applies. */
  present: Set<string>
  /** The strip, once rule 7 is on. Rendered above the shell, because it belongs to no page. */
  strip?: ReactNode
}) {
  const [page, setPage] = useState("get-started")
  const [groups, setGroups] = useState<Record<string, boolean>>({ "Email setup and health": true, "Users and teams": true })
  const byId = new Map(rows.map((r) => [r.id, r]))
  const seed = ctx.seed

  const extras: Record<string, ReactNode> = {
    "parody.bounce-rate": (
      <Line id="parody.bounce-rate" label="7-day bounce rate">
        {seed.bounceGuard.observedPercent}% of {seed.bounceGuard.volume7d.toLocaleString()} sent.
        {" "}The thresholds that act on this number are on Sending policies; which mailboxes were paused is in the mailbox drawer.
      </Line>
    ),
    "parody.delete-support": (
      <Line id="parody.delete-support" label="Delete account">
        There is no self-serve control. To delete a workspace, an admin must contact Support.
      </Line>
    ),
  }

  const inPage = (p: ParodyPage): string[] => {
    const ids = [...(p.items ?? []), ...(p.tabs ?? []).flatMap((t) => t.items ?? [])]
    return ids.filter((id) => extras[id] || (byId.has(id) && present.has(id)))
  }

  const nav = PAGES.filter((p) => p.group !== null || p.id === "get-started")
  const current = PAGES.find((p) => p.id === page) ?? PAGES[0]

  const entry = (p: ParodyPage, depth = 0) => (
    <li key={p.id}>
      <button
        type="button"
        data-item={`parody.nav.${p.id}`}
        data-item-label={`${p.label} in the settings sidebar`}
        onClick={() => setPage(p.id)}
        aria-current={current.id === p.id ? "page" : undefined}
        className={cn(
          "block w-full truncate rounded px-2 py-1.5 text-left text-[13px]",
          depth > 0 && "pl-6",
          current.id === p.id ? "bg-foreground text-background" : "hover:bg-muted",
        )}
      >
        {p.label}
      </button>
    </li>
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* The chrome above Settings: a search-or-ask bar, the credit pill that also lives on three
          other surfaces (memo §1.2 and §6), a bell and the avatar. */}
      <div className="flex shrink-0 items-center gap-3 border-b px-4 py-2">
        <div className="min-w-0 flex-1 truncate rounded border px-2 py-1 text-xs text-muted-foreground">Search or ask a question in ollopA ⌘K</div>
        <span data-item="parody.credit-pill" data-item-label="The credit balance pill" className="shrink-0 rounded-full border px-2 py-0.5 text-xs tabular-nums">
          {credits(seed.credits.balance)} credits
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">🔔</span>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs">{ctx.user.split(" ").map((w) => w[0]).join("")}</span>
      </div>

      {strip}

      <div className="flex min-h-0 flex-1">
        {/* The settings sidebar, 300 px, which replaces the product's own navigation (memo §6). */}
        <nav aria-label="Settings" className="hidden w-[300px] shrink-0 flex-col border-r md:flex">
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <button type="button" data-item="parody.nav.back" data-item-label="← Settings, the way back to the product" className="mb-2 block px-2 py-1 text-sm text-muted-foreground">← Settings</button>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" aria-hidden="true" />
              <Input data-item="parody.search" data-item-label="Search settings" className="h-9 pl-8" placeholder="Search settings" aria-label="Search settings" />
            </div>
            <ul className="grid gap-0.5">{nav.filter((p) => p.group === null).map((p) => entry(p))}</ul>

            <p className="px-2 pb-1 pt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Personal settings</p>
            <ul className="grid gap-0.5">{PAGES.filter((p) => p.group === "personal").map((p) => entry(p))}</ul>

            <p className="px-2 pb-1 pt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Workspace settings</p>
            <ul className="grid gap-0.5">
              {PAGES.filter((p) => p.group === "workspace" && !p.under && GROUP_ORDER.every((g) => g !== p.id)).slice(0, 1).map((p) => entry(p))}
              {GROUP_ORDER.map((g) => (
                <li key={g}>
                  <button
                    type="button"
                    data-item={`parody.nav.group.${g}`}
                    data-item-label={`${g}, a group in the settings sidebar`}
                    aria-expanded={!!groups[g]}
                    onClick={() => setGroups((s) => ({ ...s, [g]: !s[g] }))}
                    className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-[13px] hover:bg-muted"
                  >
                    {groups[g] ? <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" /> : <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
                    <span className="min-w-0 truncate">{g}</span>
                  </button>
                  {groups[g] && <ul className="grid gap-0.5">{PAGES.filter((p) => p.under === g).map((p) => entry(p, 1))}</ul>}
                </li>
              ))}
              {PAGES.filter((p) => p.group === "workspace" && !p.under && p.id !== "workspace-overview").map((p) => entry(p))}
            </ul>

            <p data-item="parody.flyout" data-item-label="The Admin Settings flyout" className="mt-4 rounded border px-2 py-1.5 text-[11px] text-muted-foreground">
              Admin Settings ▸ · Team &amp; Workspace setup 86% completed · Users and teams · System activity · Security · Plan overview · Integrations · All settings
            </p>
          </div>
          <div className="shrink-0 border-t p-3">
            <Button className="w-full bg-[#facc15] text-black hover:bg-[#eab308]" size="sm">Add teammates</Button>
          </div>
        </nav>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          {/* At phone width the 300-pixel sidebar cannot be shown, so the same list is a select. */}
          <div className="border-b px-4 py-2 md:hidden">
            <label className="sr-only" htmlFor="parody-page">Settings page</label>
            <select
              id="parody-page"
              className="h-9 w-full rounded-md border bg-background px-2 text-sm"
              value={current.id}
              onChange={(e) => setPage(e.target.value)}
            >
              {PAGES.map((p) => (
                <option key={p.id} value={p.id}>{p.under ? `${p.under} › ${p.label}` : p.label}</option>
              ))}
            </select>
          </div>
          {PAGES.map((p) => {
            const active = p.id === current.id
            const ids = inPage(p)
            return (
              <section
                key={p.id}
                data-container={`parody.${p.id}`}
                data-container-label={p.group === null ? p.label : p.under ? `${p.under} › ${p.label}` : p.label}
                data-open={active ? "true" : "false"}
                hidden={!active}
                className="px-5 py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3">
                  <div>
                    <h2 className="text-base font-semibold">{p.title ?? p.label}</h2>
                    {p.under && <p className="pt-0.5 text-xs text-muted-foreground">Settings › {p.under} › {p.label}</p>}
                  </div>
                  {p.id !== "get-started" && <Button size="sm" className="bg-[#facc15] text-black hover:bg-[#eab308]">Save</Button>}
                </div>

                {p.id === "get-started" && <GetStarted workspace={seed.workspace.name} />}
                {p.note && <p className="pb-3 text-sm text-muted-foreground">{p.note}</p>}
                {p.tabs ? <Tabs page={p} byId={byId} extras={extras} admin={ctx.admin} /> : <Body ids={ids} byId={byId} extras={extras} admin={ctx.admin} />}
                {p.id === "mailboxes" && <MailboxDrawer byId={byId} admin={ctx.admin} />}
                {p.id === "prospecting-config" && (
                  <p className="pt-3 text-xs text-muted-foreground">Each card on this page has its own Save. Profile has one Save for the whole page. The AI context center saves per block and then again at the foot.</p>
                )}
                {p.id === "mailboxes" && (
                  <p className="pt-3 text-xs text-muted-foreground">If you can't see the number of emails sent vs your limit, zoom out on your browser or try scrolling horizontally in the table.</p>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Every id the parody shell has a home for. The page uses it to check nothing is silently dropped. */
export const PARODY_IDS: string[] = PAGES.flatMap((p) => [
  ...(p.items ?? []),
  ...(p.tabs ?? []).flatMap((t) => t.items ?? []),
]).concat(DRAWER_TABS.flatMap((t) => t.items ?? []))
