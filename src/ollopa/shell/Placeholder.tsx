// A page whose own builder has not landed yet still renders what the workspace holds: its name and
// its real counts from seed. No "coming soon", no empty shell — navigation stays whole and every
// number on it is the number the finished page will read.
import { businessById } from "../data/businesses"
import { seedFor } from "../data/seed"
import type { Page } from "../usage/model"
import type { Session } from "../session"
import { notificationsFor } from "./notifications"

export interface Count { label: string; value: string }

export function countsFor(page: Page, session: Session): Count[] {
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const n = (x: number) => x.toLocaleString()
  const money = (x: number) => "$" + x.toLocaleString()
  const mine = <T extends { owner: string }>(rows: T[]) => rows.filter((r) => r.owner === session.user).length

  switch (page) {
    case "deals": {
      const open = seed.deals.filter((d) => d.stage !== "Closed won")
      return [
        { label: "Open deals", value: n(b.counts.openDeals) },
        { label: "Open pipeline", value: money(open.reduce((s, d) => s + d.amount, 0)) },
        { label: "Yours", value: n(mine(open)) },
        { label: "Closed won", value: n(seed.deals.filter((d) => d.stage === "Closed won").length) },
      ]
    }
    case "accounts": {
      const customers = seed.companies.filter((c) => c.stage === "Current client")
      return [
        { label: "Customers", value: n(customers.length) },
        { label: "Yours", value: n(mine(customers)) },
        { label: "Renewals in the book", value: n(seed.deals.filter((d) => d.name.includes("Renewal")).length) },
      ]
    }
    case "campaigns":
      return [
        { label: "Campaigns", value: n(b.counts.campaigns) },
        { label: "Companies reachable", value: n(b.counts.companies) },
        { label: "Contacts reachable", value: n(b.counts.contacts) },
      ]
    case "reports":
      return [
        { label: "Deals in the pipeline", value: n(b.counts.openDeals) },
        { label: "Sequences reporting", value: n(b.counts.sequences) },
        { label: "Campaigns reporting", value: n(b.counts.campaigns) },
        { label: "People on the plan", value: n(b.counts.users) },
      ]
    case "agents": {
      const waiting = seed.agentEvents.filter((e) => e.needsApproval)
      return [
        { label: "Agents on", value: n(b.counts.agents) },
        { label: "Runs this week", value: n(seed.agentEvents.length) },
        { label: "Waiting for approval", value: n(waiting.length) },
        { label: "Credits spent by agents this week", value: n(seed.agentEvents.reduce((s, e) => s + e.credits, 0)) },
      ]
    }
    case "settings":
      return [
        { label: "Settings areas", value: "13" },
        { label: "Plan", value: `${b.plan.name}, renews ${b.plan.renews}` },
        { label: "People", value: n(b.counts.users) },
        { label: "Integrations", value: n(b.counts.integrations) },
      ]
    case "workflows":
      return [
        { label: "Workflows", value: "0" },
        { label: "Plan", value: `${b.plan.name}; Workflows is on Growth` },
      ]
    case "requests":
      return [
        { label: "Open requests", value: "0" },
        { label: "People who can ask", value: n(b.counts.users) },
      ]
    case "templates":
      return [
        { label: "Sequences using templates", value: n(b.counts.sequences) },
        { label: "Steps across them", value: n(seed.sequences.reduce((s, q) => s + q.steps, 0)) },
      ]
    case "enrichment":
      return [
        { label: "Contacts that could be enriched", value: n(seed.contacts.filter((c) => c.emailStatus !== "Verified").length) },
        { label: "Credits left", value: n(b.credits.balance) },
      ]
    case "developer":
      return [
        { label: "Plan", value: b.plan.name },
        { label: "Integrations connected", value: n(b.counts.integrations) },
      ]
    case "connect":
      return [
        { label: "Integrations connected", value: n(b.counts.integrations) },
        { label: "Sync errors", value: n(notificationsFor(session).filter((x) => x.kind === "sync-error").length) },
      ]
    case "people":
      return [{ label: "Contacts", value: n(b.counts.contacts) }, { label: "Yours", value: n(mine(seed.contacts)) }]
    case "companies":
      return [{ label: "Companies", value: n(b.counts.companies) }, { label: "Yours", value: n(mine(seed.companies)) }]
    case "lists":
      return [{ label: "Contacts to segment", value: n(b.counts.contacts) }]
    case "sequences":
      return [{ label: "Sequences", value: n(b.counts.sequences) }, { label: "People in a sequence", value: n(seed.contacts.filter((c) => c.inSequence).length) }]
    case "inbox":
      return [{ label: "Replies", value: n(seed.replies.length) }, { label: "Interested", value: n(seed.replies.filter((r) => r.outcome === "Interested").length) }]
    case "tasks":
      return [{ label: "Tasks", value: n(seed.tasks.length) }]
    default:
      return [
        { label: "Contacts", value: n(b.counts.contacts) },
        { label: "Companies", value: n(b.counts.companies) },
        { label: "Open deals", value: n(b.counts.openDeals) },
      ]
  }
}

export function Placeholder({ session, page, title }: { session: Session; page: Page; title: string }) {
  const counts = countsFor(page, session)
  const b = businessById(session.business)
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{b.name}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map((c) => (
          <div key={c.label} className="rounded-lg border p-4">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{c.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
