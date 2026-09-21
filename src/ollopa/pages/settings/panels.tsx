// The flat panels Settings opens: every one is level two of the row it opens from, and none of them
// opens another (IA-MAP convention 2). No tabs, no accordions, one Save at the foot.
//
// `X-user`, `X-removal`, `X-key` and `X-mcpscope` carry their whole consequence inside; the rest are
// field lists with the controls the row exists for.
import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { href } from "@/app/router"
import { Panel } from "../../ui/Panel"
import { Locked } from "../../ui/Locked"
import { gate } from "../../ui/gate"
import { businessById } from "../../data/businesses"
import { seedFor, type ApiKey, type FieldDef, type Mailbox, type MailDomain, type McpToken, type Persona, type ScoreModel, type SignalDef, type Territory, type User, type Webhook } from "../../data/seed"
import type { Session } from "../../session"
import { credits, day, longDay, plural } from "./format"
import { settingsFor } from "./derived"
import { jumpToSetting, leaveOnClick } from "./leave"
import { toast } from "./state"

/* ------------------------------------------------------------------------------ small pieces */

export function Fields({ rows }: { rows: { label: string; value: ReactNode; note?: string }[] }) {
  return (
    <dl className="grid gap-3">
      {rows.map((r) => (
        <div key={r.label} className="grid gap-1 border-b pb-3 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:items-baseline sm:gap-3">
          <dt className="text-sm text-muted-foreground">{r.label}</dt>
          <dd className="text-sm">
            {r.value}
            {r.note && <p className="mt-1 text-xs text-muted-foreground">{r.note}</p>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Copy({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded bg-muted px-1.5 py-0.5 text-xs">{value}</code>
      <Button size="sm" variant="outline" className="h-7 shrink-0 px-2 text-xs"
        onClick={() => { navigator.clipboard?.writeText(value); toast(`Copied · ${label}`) }}>Copy</Button>
    </span>
  )
}

export interface PanelShell { open: boolean; onOpenChange: (o: boolean) => void }

/* --------------------------------------------------------------------------------- X-mailbox */

export function MailboxPanel({ mailbox, session, ...p }: PanelShell & { mailbox: Mailbox | null; session: Session }) {
  const [signature, setSignature] = useState(mailbox?.signature ?? "")
  const [forwarding, setForwarding] = useState("Keep replies coming to this address for 30 days")
  if (!mailbox) return null
  return (
    <Panel id="x-mailbox" title={mailbox.address} {...p}
      footer={<Button onClick={() => { p.onOpenChange(false); toast(`Saved · ${mailbox.address}`) }}>Save</Button>}>
      <Fields rows={[
        { label: "Owner", value: mailbox.owner },
        { label: "Provider", value: mailbox.provider },
        { label: "Warm-up", value: mailbox.warmup.on ? `Day ${mailbox.warmup.day} of ${mailbox.warmup.of}` : "Finished" },
        { label: "Daily limit", value: `${mailbox.dailyLimit} · ${mailbox.sentToday} sent today` },
        { label: "Hourly limit", value: String(mailbox.hourlyLimit) },
        { label: "Deliverability", value: `${mailbox.deliverability} of 100 · bounce ${mailbox.bounceRate7d}% over 7 days` },
        { label: "Sequences", value: mailbox.sequences.length ? mailbox.sequences.join(", ") : "None" },
      ]} />
      <div className="mt-4 border-t pt-4">
        <Label htmlFor="mb-sig" className="text-xs">Signature</Label>
        <Textarea id="mb-sig" rows={3} className="mt-1" value={signature} onChange={(e) => setSignature(e.target.value)} />
      </div>
      <div className="mt-4 border-t pt-4">
        <p className="text-sm font-medium">Unlink this mailbox</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {plural(mailbox.sequences.length, "sequence")} send from it. In-flight steps stop at the next send and wait for another mailbox.
        </p>
        <Select value={forwarding} onValueChange={setForwarding}>
          <SelectTrigger className="mt-2 h-8" aria-label="What happens to replies"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Keep replies coming to this address for 30 days">Keep replies coming to this address for 30 days</SelectItem>
            <SelectItem value="Forward replies to the owner's other mailbox">Forward replies to the owner's other mailbox</SelectItem>
            <SelectItem value="Stop receiving replies now">Stop receiving replies now</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="mt-2"
          onClick={() => { p.onOpenChange(false); toast(`Unlinked ${mailbox.address}. ${forwarding}.`) }}>
          Unlink {mailbox.address}
        </Button>
      </div>
      {session.role !== "admin" && (
        <p className="mt-4 text-xs text-muted-foreground">
          The limits on this mailbox are set by {businessById(session.business).roles.find((r) => r.role === "admin")?.user}.
        </p>
      )}
    </Panel>
  )
}

/* ---------------------------------------------------------------------------------- X-domain */

export function DomainPanel({ domain, readOnly, admin, ...p }: PanelShell & { domain: MailDomain | null; readOnly: boolean; admin: string }) {
  if (!domain) return null
  const record = (ok: boolean) => (ok ? "Set" : "Missing")
  return (
    <Panel id="x-domain" title={domain.domain} {...p}>
      <Fields rows={[
        { label: "SPF", value: record(domain.spf), note: "v=spf1 include:mail.ollopa.com ~all" },
        { label: "DKIM", value: record(domain.dkim), note: "ollopa._domainkey — a TXT record with the public key" },
        { label: "DMARC", value: record(domain.dmarc), note: domain.dmarc ? "v=DMARC1; p=quarantine; rua=mailto:dmarc@" + domain.domain : "Not set. Mailboxes on this domain are more likely to land in spam." },
        { label: "Bounce rate", value: `${domain.bounceRate7d}% over 7 days` },
        { label: "Mailboxes", value: plural(domain.mailboxes, "mailbox", "mailboxes") },
        { label: "Tracking subdomain", value: domain.trackingSubdomain },
      ]} />
      <div className="mt-4 grid gap-2 border-t pt-4">
        <p className="text-sm font-medium">DNS records</p>
        <Copy label="SPF" value="v=spf1 include:mail.ollopa.com ~all" />
        <Copy label="DKIM" value={`ollopa._domainkey.${domain.domain}`} />
        <Copy label="DMARC" value={`v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain.domain}`} />
      </div>
      {readOnly && <p className="mt-4 text-xs text-muted-foreground">Sending domains are set by {admin}. You can read them here.</p>}
    </Panel>
  )
}

/* ------------------------------------------------------------------------------------ X-user */

const SEATS = ["SDR", "Account executive", "Marketer", "Customer success", "RevOps admin"]

export function UserPanel({ user, session, ...p }: PanelShell & { user: User | null; session: Session }) {
  const [step, setStep] = useState<"fields" | "offboard">("fields")
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [reassignTo, setReassignTo] = useState("")
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  if (!user) return null

  const crm = b.crm
  const records = 40 + user.name.length * 17
  const mailboxes = seed.mailboxes.filter((m) => m.owner === user.name)
  const deals = seed.deals.filter((d) => d.owner === user.name).length
  const sequences = seed.sequences.filter((s) => s.owner === user.name).length
  const openTasks = seed.tasks.filter((t) => t.owner === user.name && t.status === "Open").length
  const passes = Math.ceil(records / 250)
  const ready = done.reassign && done.mailboxes && (!crm || done.crm)

  const close = () => { p.onOpenChange(false); setStep("fields") }

  return (
    <Panel id="x-user" title={user.name} open={p.open} onOpenChange={(o) => { p.onOpenChange(o); if (!o) setStep("fields") }}
      footer={step === "fields"
        ? <div className="flex w-full items-center gap-2">
            <Button variant="outline" onClick={() => setStep("offboard")}>Deactivate</Button>
            <span className="flex-1" />
            <Button onClick={() => { close(); toast(`Saved · ${user.name}`) }}>Save</Button>
          </div>
        : <Button variant="outline" onClick={() => setStep("fields")}>Back to this person's settings</Button>}>
      {step === "fields" ? (
        <>
          <p className="text-sm">
            The seat decides which areas exist for this person. The profile decides what they may do inside them.
            A profile cannot grant an area the seat does not carry.
          </p>
          <div className="mt-4 grid gap-3 border-t pt-4">
            <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:items-center sm:gap-3">
              <Label htmlFor="u-seat" className="text-sm text-muted-foreground">Seat</Label>
              <Select defaultValue={user.title.includes("admin") ? "RevOps admin" : SEATS.find((s) => s.toLowerCase().startsWith(user.role)) ?? "SDR"}>
                <SelectTrigger id="u-seat" className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>{SEATS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-3">
              <Label htmlFor="u-profile" className="text-sm text-muted-foreground">Permission profile</Label>
              <div>
                <Select defaultValue={user.profile}>
                  <SelectTrigger id="u-profile" className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{seed.permissionProfiles.map((pr) => <SelectItem key={pr.id} value={pr.name}>{pr.name}</SelectItem>)}</SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">This replaces anything set on this person directly.</p>
              </div>
            </div>
            <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-3">
              <span className="text-sm text-muted-foreground">Additional grants</span>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {user.grants.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
                  {user.grants.map((g) => (
                    <span key={g} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
                      {g}
                      <button className="text-muted-foreground hover:text-foreground" aria-label={`Remove ${g}`} onClick={() => toast(`Removed · ${g}`)}>×</button>
                    </span>
                  ))}
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => toast("Pick a grant to add")}>Add a grant</Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Grants add to the profile. Prefer a grant to a new profile.</p>
              </div>
            </div>
            <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:items-center sm:gap-3">
              <Label htmlFor="u-team" className="text-sm text-muted-foreground">Team</Label>
              <Select defaultValue={user.team}>
                <SelectTrigger id="u-team" className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>{(seed.teams.length ? seed.teams.map((t) => t.name) : [user.team]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:items-center sm:gap-3">
              <span className="text-sm text-muted-foreground">Territory</span>
              <span className="text-sm">
                {user.territory ?? "None"}
                <Button variant="link" size="sm" className="h-auto px-1.5 text-xs" onClick={() => toast("Territories are defined in Prospecting rules and assigned here.")}>Change</Button>
              </span>
            </div>
          </div>
          <p className="mt-4 border-t pt-4 text-xs text-muted-foreground">
            Profiles you do not hold yourself are not listed. {b.roles.find((r) => r.role === "admin")?.user} can assign those.
          </p>
        </>
      ) : (
        <div className="grid gap-4">
          <p className="text-sm">Ending {user.name}'s access, in the order it has to happen.</p>

          <section className="border-t pt-3">
            <h4 className="text-sm font-medium">1. Reassign their work</h4>
            <p className="mt-1 text-sm">
              Reassign {records.toLocaleString()} records, {deals} deals, {sequences} sequences and {openTasks} open tasks to
            </p>
            <Select value={reassignTo} onValueChange={(v) => { setReassignTo(v); setDone((d) => ({ ...d, reassign: true })) }}>
              <SelectTrigger className="mt-1.5 h-8" aria-label="Reassign to"><SelectValue placeholder="Choose a person" /></SelectTrigger>
              <SelectContent>{seed.users.filter((u) => u.name !== user.name).slice(0, 12).map((u) => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
            </Select>
            <p className="mt-1.5 text-xs text-muted-foreground">Paused and failed tasks do not move; they stay with this person and stop.</p>
            {records > 250 && <p className="text-xs text-muted-foreground">{records.toLocaleString()} records move 250 at a time: {passes} passes.</p>}
          </section>

          <section className="border-t pt-3">
            <h4 className="text-sm font-medium">2. Unlink {plural(mailboxes.length, "mailbox", "mailboxes")}</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              In-flight sequence steps sending from {mailboxes.length === 1 ? "it" : "them"} stop at the next send and wait for another mailbox.
            </p>
            <Button size="sm" variant="outline" className="mt-1.5" disabled={done.mailboxes}
              onClick={() => { setDone((d) => ({ ...d, mailboxes: true })); toast(`Unlinked ${plural(mailboxes.length, "mailbox", "mailboxes")}`) }}>
              {done.mailboxes ? "Unlinked" : `Unlink ${plural(mailboxes.length, "mailbox", "mailboxes")}`}
            </Button>
          </section>

          {crm && (
            <section className="border-t pt-3">
              <h4 className="text-sm font-medium">3. Unmap from {crm.split(" ")[0]}</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Until this is done, this person's activity keeps syncing to {crm.split(" ")[0]}.
              </p>
              <Button size="sm" variant="outline" className="mt-1.5" disabled={done.crm}
                onClick={() => { setDone((d) => ({ ...d, crm: true })); toast(`Unmapped from ${crm.split(" ")[0]}`) }}>
                {done.crm ? "Unmapped" : `Unmap from ${crm.split(" ")[0]}`}
              </Button>
            </section>
          )}

          <section className="border-t pt-3">
            <h4 className="text-sm font-medium">{crm ? "4." : "3."} Deactivate</h4>
            <p className="mt-1 text-sm">
              Access ends now. The seat is free to reassign. <strong>Your bill does not change until renewal on {longDay(b.plan.renews)}.</strong>
            </p>
            <a className="text-xs underline underline-offset-4" href={href("/ollopa/settings/plan")}>Reduce seats at renewal</a>
            <div className="mt-2">
              <Button size="sm" variant={ready ? "destructive" : "outline"} onClick={() => {
                if (!ready) { toast(`Still outstanding: ${[!done.reassign && "reassign their work", !done.mailboxes && "unlink their mailboxes", crm && !done.crm && `unmap from ${crm.split(" ")[0]}`].filter(Boolean).join(", ")}`); return }
                close(); toast(`${user.name} deactivated. The seat is free.`)
              }}>
                {ready ? `Deactivate ${user.name}` : "Reassign first"}
              </Button>
              {!ready && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Outstanding: {[!done.reassign && "their work is not reassigned", !done.mailboxes && "their mailboxes are still linked", crm && !done.crm && `they are still mapped to ${crm.split(" ")[0]}`].filter(Boolean).join(", ")}.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </Panel>
  )
}

/* --------------------------------------------------------------------------------- X-removal */

export function RemovalPanel({ session, ...p }: PanelShell & { session: Session }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const removal = settingsFor(session.business).prospecting.removal
  const people = seed.contacts.filter((c) => c.doNotContact).slice(0, 8)
  return (
    <Panel id="x-removal" title="Removal list" {...p}
      footer={<Button variant="outline" onClick={() => toast("Exported the removal list as CSV.")}>Export as CSV</Button>}>
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
        <p className="text-sm font-medium">Delete everywhere</p>
        <p className="mt-1 text-sm">
          Deletes {removal.people} people here, unlinks them in {b.crm?.split(" ")[0] ?? "the CRM"}, removes them from {plural(removal.lists, "list")} and {plural(removal.sequences, "sequence")},
          and stops {plural(removal.jobs, "enrichment job")} from re-importing them. This cannot be undone.
        </p>
        <Button size="sm" variant="destructive" className="mt-2" onClick={() => { p.onOpenChange(false); toast(`Deleted ${removal.people} people everywhere.`) }}>
          Delete {removal.people} people everywhere
        </Button>
      </div>
      <dl className="mt-4 grid gap-2 border-t pt-4 text-sm">
        {([
          { label: "Sequences that still hold them", n: removal.sequences, to: "/ollopa/sequences" },
          { label: "Enrichment jobs that could re-import them", n: removal.jobs, row: "pipe.enrichment-order" },
          { label: "API keys with prospecting scope", n: removal.keys, row: "dev.api-keys" },
          { label: "Agents that read this list", n: removal.agents, to: "/ollopa/agents" },
        ] as { label: string; n: number; to?: string; row?: string }[]).map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd>
              {/* Another page: `follow`, and the trail comes back to the removal list's own row.
                  Another row on this same page: no move at all, just the row, lit where it stands. */}
              {row.to ? (
                <a className="tabular-nums underline underline-offset-4" href={href(row.to)}
                   onClick={leaveOnClick(row.to, "pros.removal-list")}>{row.n}</a>
              ) : (
                <button className="tabular-nums underline underline-offset-4"
                        onClick={() => { p.onOpenChange(false); jumpToSetting(row.row!) }}>{row.n}</button>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t pt-4">
        <p className="text-sm font-medium">{removal.people} people · {removal.addedThisMonth} added this month</p>
        <ul className="mt-2 grid gap-1 text-sm">
          {people.map((c) => (
            <li key={c.id} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate">{c.name} · {c.company}</span>
              <span className="shrink-0 text-xs text-muted-foreground">Asked to be removed</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------------------------------- X-key */

export function KeyPanel({ apiKey, session, ...p }: PanelShell & { apiKey: ApiKey | null; session: Session }) {
  const seed = seedFor(session.business)
  if (!apiKey) return null
  const jobs = seed.enrichmentJobs.filter((j) => j.keyId === apiKey.id)
  return (
    <Panel id="x-key" title={apiKey.name} {...p}
      footer={<div className="flex w-full gap-2">
        <Button variant="outline" onClick={() => toast(`Rotated · ${apiKey.name}. The old secret stops working in 24 hours.`)}>Rotate</Button>
        <Button variant="outline" className="text-destructive" onClick={() => { p.onOpenChange(false); toast(`Revoked · ${apiKey.name}. Calls with it fail now.`) }}>Revoke</Button>
      </div>}>
      <Fields rows={[
        { label: "Scopes", value: apiKey.scopes.join(", ") },
        { label: "Created", value: `${day(apiKey.createdOn)} by ${apiKey.createdBy}` },
        { label: "Last used", value: apiKey.lastUsedAt ? day(apiKey.lastUsedAt) : "Never used" },
        { label: "Expires", value: apiKey.expiresOn ? day(apiKey.expiresOn) : "Does not expire" },
        { label: "Spend this cycle", value: `${credits(apiKey.creditsThisCycle)} against the workspace balance` },
        { label: "Alert", value: `${apiKey.alertOwner} at ${apiKey.alertAt}% of the allocation`, note: "Delivered as a digest line and a bell row under credits low." },
      ]} />
      <div className="mt-4 border-t pt-4">
        <p className="text-sm font-medium">Enrichment jobs this key paid for</p>
        {jobs.length === 0
          ? <p className="mt-1 text-sm text-muted-foreground">None yet.</p>
          : <ul className="mt-1 grid gap-1 text-sm">
              {jobs.slice(0, 5).map((j) => (
                <li key={j.id} className="flex items-baseline justify-between gap-3">
                  <a className="min-w-0 truncate underline underline-offset-4" href={href(`/ollopa/enrichment/${j.id}`)}
                     onClick={leaveOnClick(`/ollopa/enrichment/${j.id}`, "dev.api-keys")}>{j.sourceLabel}</a>
                  <span className="shrink-0 tabular-nums text-muted-foreground">{credits(j.credits)}</span>
                </li>
              ))}
            </ul>}
      </div>
    </Panel>
  )
}

/* -------------------------------------------------------------------------------- X-mcpscope */

const TIERS: { id: McpToken["tier"]; label: string; what: string }[] = [
  { id: "read", label: "Read", what: "Read people, companies, lists, sequences and runs. On every plan." },
  { id: "write_safe", label: "Safe writes", what: "Create and update records, add notes and tasks. Nothing that sends or deletes." },
  { id: "write_destructive", label: "Destructive writes", what: "Enrol people, send, merge and delete. Every one of these still asks for approval in the client." },
]

const ACTIONS = ["Read a person", "Create a task", "Update a deal", "Enrol in a sequence", "Send an email", "Delete a record"]

export function McpScopePanel({ token, session, ...p }: PanelShell & { token: McpToken | null; session: Session }) {
  const write = gate("mcp.write", session.business)
  const [tier, setTier] = useState<McpToken["tier"]>(token?.tier ?? "read")
  if (!token) return null
  return (
    <Panel id="x-mcpscope" title={`MCP · ${token.client}`} {...p}
      footer={<div className="flex w-full items-center gap-2">
        <Button variant="outline" onClick={() => { p.onOpenChange(false); toast(`Revoked · ${token.client}`) }}>Revoke</Button>
        <span className="flex-1" />
        <Button onClick={() => { p.onOpenChange(false); toast(`Saved · MCP scope for ${token.client}`) }}>Save</Button>
      </div>}>
      <Fields rows={[
        { label: "Person", value: token.user },
        { label: "Client", value: token.client },
        { label: "Authorised", value: day(token.authorisedOn) },
        { label: "Last used", value: token.lastUsedAt ? day(token.lastUsedAt) : "Never used" },
      ]} />
      <div className="mt-4 grid gap-2 border-t pt-4">
        <p className="text-sm font-medium">Scope</p>
        {TIERS.map((t) => {
          const locked = t.id !== "read" && write.locked
          const row = (
            <label className={cn("flex cursor-pointer items-start gap-2 rounded-md border p-2", tier === t.id && !locked && "border-foreground")}>
              <input type="radio" name="mcp-tier" className="mt-1" checked={tier === t.id} disabled={locked}
                onChange={() => setTier(t.id)} />
              <span>
                <span className="block text-sm font-medium">{t.label}</span>
                <span className="block text-xs text-muted-foreground">{t.what}</span>
              </span>
            </label>
          )
          return (
            <div key={t.id}>
              {locked
                ? <Locked feature={`MCP ${t.label.toLowerCase()}`} plan={write.plan} pricePerMonth={write.pricePerMonth} what={write.what}>{row}</Locked>
                : row}
            </div>
          )
        })}
        <p className="text-xs text-muted-foreground">
          The plan is stated here, at connection, and never at the moment a write fails.
        </p>
      </div>
      <div className="mt-4 border-t pt-4">
        <p className="text-sm font-medium">Inside this scope, each action</p>
        <ul className="mt-2 grid gap-1.5">
          {ACTIONS.map((a, i) => (
            <li key={a} className="flex items-center justify-between gap-3">
              <span className="text-sm">{a}</span>
              <Select defaultValue={i < 2 ? "Allow" : i < 4 ? "Ask me first" : "Block"}>
                <SelectTrigger className="h-7 w-36 text-xs" aria-label={a}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Allow">Allow</SelectItem>
                  <SelectItem value="Ask me first">Ask me first</SelectItem>
                  <SelectItem value="Block">Block</SelectItem>
                </SelectContent>
              </Select>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------------------------------ X-hook */

export function HookPanel({ hook, session, ...p }: PanelShell & { hook: Webhook | null; session: Session }) {
  const seed = seedFor(session.business)
  if (!hook) return null
  const deliveries = seed.webhookDeliveries.filter((d) => d.webhookId === hook.id).slice(0, 6)
  return (
    <Panel id="x-hook" title={hook.url} {...p}
      footer={<Button variant="outline" onClick={() => toast("Reconciled. 0 events were missing.")}>Reconcile the last 24 hours</Button>}>
      <Fields rows={[
        { label: "Events", value: hook.events.join(", ") },
        { label: "State", value: hook.state === "failing" ? `Failing since ${day(hook.failingSince ?? "")}` : hook.state === "paused" ? "Paused" : "Delivering" },
        { label: "Secret set", value: day(hook.secretSetOn) },
        { label: "Last delivery", value: day(hook.lastDeliveryAt) },
      ]} />
      <div className="mt-4 border-t pt-4">
        <p className="text-sm font-medium">Delivery log</p>
        <ul className="mt-1 grid gap-1 text-sm">
          {deliveries.map((d) => (
            <li key={d.id} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate">{d.event} · attempt {d.attemptNumber}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{d.status === "delivered" ? "Delivered" : `Failed: ${d.cause}`}</span>
            </li>
          ))}
          {deliveries.length === 0 && <li className="text-muted-foreground">Nothing delivered yet.</li>}
        </ul>
      </div>
      <div className="mt-4 border-t pt-4">
        <p className="text-sm font-medium">Reconciliation endpoint</p>
        <Copy label="the reconciliation endpoint" value="GET /v1/events?since=<timestamp>" />
      </div>
    </Panel>
  )
}

/* --------------------------------------------------------------------------------- X-cliauth */

export function CliPanel({ session, ...p }: PanelShell & { session: Session }) {
  const seed = seedFor(session.business)
  return (
    <Panel id="x-cliauth" title="CLI devices" {...p}>
      {seed.cliDevices.length === 0
        ? <p className="text-sm text-muted-foreground">No device has been authorised. <code className="rounded bg-muted px-1">ollopa auth login</code> starts one.</p>
        : <ul className="grid gap-3">
            {seed.cliDevices.map((d) => (
              <li key={d.id} className="grid gap-0.5 border-b pb-3 last:border-b-0">
                <span className="text-sm font-medium">{d.label}</span>
                <span className="text-xs text-muted-foreground">{d.user} · {d.workspace} · authorised {day(d.authorisedOn)} · last used {d.lastUsedAt ? day(d.lastUsedAt) : "never"}</span>
                <Button size="sm" variant="outline" className="mt-1 w-fit" onClick={() => toast(`Revoked · ${d.label}`)}>Revoke</Button>
              </li>
            ))}
          </ul>}
      <p className="mt-4 border-t pt-4 text-xs text-muted-foreground">
        Every command takes a workspace and echoes its name in the confirmation. A destructive bulk write asks for the workspace name typed back.
      </p>
    </Panel>
  )
}

/* ----------------------------------------------------------------------------------- X-score */

export function ScorePanel({ model, session, ...p }: PanelShell & { model: ScoreModel | null; session: Session }) {
  const [threshold, setThreshold] = useState(model?.threshold ?? 62)
  const [grandfather, setGrandfather] = useState("Leave people already routed where they are")
  const seed = seedFor(session.business)
  if (!model) return null
  const above = seed.contacts.filter((c) => c.score >= threshold).length
  const wasAbove = seed.contacts.filter((c) => c.score >= model.threshold).length
  const share = Math.round((above / Math.max(1, seed.contacts.length)) * 100)
  return (
    <Panel id="x-score" title={model.name} {...p}
      footer={<Button onClick={() => { p.onOpenChange(false); toast(`Threshold ${threshold}, published ${longDay("2026-09-13")} by ${session.user}`) }}>Publish</Button>}>
      <Fields rows={[
        { label: "Kind", value: model.kind === "fit" ? "Fit" : model.kind === "engagement" ? "Engagement" : "Risk" },
        { label: "Version", value: `${model.version} · published ${day(model.published)} by ${model.publishedBy}` },
        { label: "Decay", value: `${model.decayDays} days inactive reduces the score; twice that halves it` },
      ]} />
      <div className="mt-4 border-t pt-4">
        <p className="text-sm font-medium">Inputs and weights</p>
        <ul className="mt-2 grid gap-1.5 text-sm">
          {model.inputs.map((i) => (
            <li key={i.name} className="flex items-baseline justify-between gap-3">
              <span>{i.name}</span>
              <span className="tabular-nums text-muted-foreground">{i.weight}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 border-t pt-4">
        <Label htmlFor="score-threshold" className="text-sm font-medium">Threshold</Label>
        <Input id="score-threshold" type="number" className="mt-1 h-8 w-24 tabular-nums" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
        <p className="mt-2 text-sm">
          {share}% of people score above {threshold}. Above 80% the threshold is not doing work.
        </p>
      </div>
      <div className="mt-4 border-t pt-4">
        <p className="text-sm font-medium">What publishing does</p>
        <p className="mt-1 text-sm">
          Threshold {model.threshold} becomes {threshold}. {wasAbove.toLocaleString()} people are above the old one today and {above.toLocaleString()} are above the new one.
          It applies to new leads only.
        </p>
        <div className="mt-2 grid gap-1.5">
          {[`Leave people already routed where they are (${wasAbove.toLocaleString()})`, `Re-route everyone against the new threshold (${above.toLocaleString()})`].map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm">
              <input type="radio" name="grandfather" checked={grandfather === o.replace(/ \(.*\)$/, "")} onChange={() => setGrandfather(o.replace(/ \(.*\)$/, ""))} />
              {o}
            </label>
          ))}
        </div>
      </div>
    </Panel>
  )
}

/* --------------------------------------------------------------------- X-persona and X-signal */

export function PersonaPanel({ persona, ...p }: PanelShell & { persona: Persona | null }) {
  if (!persona) return null
  return (
    <Panel id="x-persona" title={persona.name} {...p}
      footer={<Button onClick={() => { p.onOpenChange(false); toast(`Saved · ${persona.name}`) }}>Save</Button>}>
      <Fields rows={[
        { label: "Title", value: persona.title },
        { label: "Seniority", value: persona.seniority },
        { label: "Department", value: persona.department },
        { label: "Industry", value: persona.industry },
        { label: "Company size", value: persona.size },
        { label: "Geography", value: persona.geography },
        { label: "People matching", value: persona.sizeCount.toLocaleString() },
      ]} />
    </Panel>
  )
}

export function SignalPanel({ signal, ...p }: PanelShell & { signal: SignalDef | null }) {
  if (!signal) return null
  return (
    <Panel id="x-signal" title={signal.name} {...p}
      footer={<Button onClick={() => { p.onOpenChange(false); toast(`Saved · ${signal.name}`) }}>Save</Button>}>
      <Fields rows={[
        { label: "Definition", value: signal.definition },
        { label: "Source", value: signal.source },
        { label: "Freshness", value: `Counted while it is under ${signal.freshnessDays} days old` },
        { label: "Talking tips", value: signal.tips },
        { label: "Matching now", value: signal.matches.toLocaleString() },
      ]} />
    </Panel>
  )
}

/* ------------------------------------------------------------------- X-territory and X-field */

export function TerritoryPanel({ territory, ...p }: PanelShell & { territory: Territory | null }) {
  if (!territory) return null
  return (
    <Panel id="x-territory" title={territory.name} {...p}
      footer={<Button onClick={() => { p.onOpenChange(false); toast(`Saved · ${territory.name}`) }}>Save</Button>}>
      <Fields rows={[
        { label: "Rule", value: territory.rule },
        { label: "Owner", value: territory.owner },
        { label: "Accounts", value: territory.accounts.toLocaleString() },
      ]} />
      <p className="mt-4 text-xs text-muted-foreground">
        Territories are defined here and assigned from a person's row in Team and access. Both open this panel.
      </p>
    </Panel>
  )
}

export function FieldPanel({ field, stages, ...p }: PanelShell & { field: FieldDef | null; stages: string[] }) {
  if (!field) return null
  return (
    <Panel id="x-field" title={field.label} {...p}
      footer={<Button onClick={() => { p.onOpenChange(false); toast(`Saved · ${field.label}`) }}>Save</Button>}>
      <Fields rows={[
        { label: "On", value: field.object === "person" ? "People" : field.object === "company" ? "Companies" : "Deals" },
        { label: "Type", value: field.kind },
        { label: "Values", value: field.values.length ? field.values.join(", ") : "—" },
        { label: "Group", value: field.group },
        { label: "CRM field", value: field.crmField ?? "Not mapped" },
      ]} />
      <div className="mt-4 border-t pt-4">
        <Label htmlFor="req-at" className="text-sm font-medium">Required to enter a stage</Label>
        <Select defaultValue={field.requiredAtStage ?? "Not required"}>
          <SelectTrigger id="req-at" className="mt-1 h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Not required">Not required</SelectItem>
            {stages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className="mt-1 text-xs text-muted-foreground">
          The deal's stage stepper prints this gate before the click, naming the field and who set it.
        </p>
      </div>
    </Panel>
  )
}

/** One flat panel for the list editors: add, rename, reorder and delete, with what depends on each row. */
export function ListPanel({ title, rows, dependsOn, ...p }: PanelShell & {
  title: string
  rows: { id: string; name: string; detail?: string }[]
  dependsOn?: (id: string) => string
}) {
  const [adding, setAdding] = useState("")
  return (
    <Panel id={`x-list-${title}`} title={title} {...p}
      footer={<Button onClick={() => { p.onOpenChange(false); toast(`Saved · ${title}`) }}>Save</Button>}>
      <ul className="grid gap-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-baseline justify-between gap-3 border-b pb-2 last:border-b-0">
            <span className="min-w-0">
              <span className="block text-sm">{r.name}</span>
              {r.detail && <span className="block text-xs text-muted-foreground">{r.detail}</span>}
            </span>
            <Button size="sm" variant="ghost" className="h-7 shrink-0 px-2 text-xs text-destructive"
              onClick={() => toast(dependsOn ? `${r.name}: ${dependsOn(r.id)}` : `Deleted · ${r.name}`)}>Delete</Button>
          </li>
        ))}
        {rows.length === 0 && <li className="text-sm text-muted-foreground">Nothing here yet.</li>}
      </ul>
      <div className="mt-4 flex gap-2 border-t pt-4">
        <Input className="h-8" aria-label={`Add to ${title}`} placeholder="Name" value={adding} onChange={(e) => setAdding(e.target.value)} />
        <Button size="sm" variant="outline" disabled={!adding} onClick={() => { toast(`Added · ${adding}`); setAdding("") }}>Add</Button>
      </div>
    </Panel>
  )
}
