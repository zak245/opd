// What a company row actually is: "this company, the 4 people we hold there, 2 in a sequence, last
// touched 3 days ago". Everything both tables and the record read is derived here, once, from the
// seed — never invented in a page, and never counted two different ways on two screens.
import { type Account, type AgentEvent, type Company, type Contact, type Deal, type Seed, type Task } from "../../data/seed"

export interface CompanyView {
  company: Company
  account: Account | null
  contacts: Contact[]
  inSequence: Contact[]
  deals: Deal[]
  openDeals: Deal[]
  tasks: Task[]
  openTasks: Task[]
  research: AgentEvent[]
  lastReply: string | null
  /** Company, contact, reply, deal and task dates: the newest thing that happened here. */
  lastActivity: string
}

export function viewOf(seed: Seed, company: Company): CompanyView {
  const contacts = seed.contacts.filter((c) => c.companyId === company.id)
  const ids = new Set(contacts.map((c) => c.id))
  const deals = seed.deals.filter((d) => d.companyId === company.id)
  const tasks = seed.tasks.filter((t) => ids.has(t.contactId) || t.company === company.name)
  const replies = seed.replies.filter((r) => ids.has(r.contactId) || r.company === company.name)
  const research = seed.agentEvents
    .filter((e) => (e.companyId === company.id || e.company === company.name) && e.kind === "researched")
    // Newest run first: `when` is the day it ran, `at` the clock time inside that day.
    .sort((a, b) => (`${a.when} ${a.at}` < `${b.when} ${b.at}` ? 1 : -1))
  const dates = [
    company.lastActivity,
    ...contacts.map((c) => c.lastActivity),
    ...replies.map((r) => r.received),
    ...deals.map((d) => d.lastActivity),
    ...tasks.filter((t) => t.doneAt).map((t) => t.doneAt as string),
  ].filter(Boolean).sort()
  return {
    company,
    account: seed.accounts.find((a) => a.companyId === company.id) ?? null,
    contacts,
    inSequence: contacts.filter((c) => c.inSequence),
    deals,
    openDeals: deals.filter((d) => d.stage !== "Closed won" && !d.archivedAt),
    tasks,
    openTasks: tasks.filter((t) => t.status === "Open"),
    research,
    lastReply: replies.map((r) => r.received).sort().pop() ?? null,
    lastActivity: dates[dates.length - 1] ?? company.lastActivity,
  }
}

/** Every company as a view, in the seed's order: the table's rows. */
export function viewsOf(seed: Seed): CompanyView[] {
  return seed.companies.map((c) => viewOf(seed, c))
}

/** A company is a customer when its stage says so; the record and the tables ask this one question. */
export function isCustomer(company: Company): boolean {
  return company.stage === "Current client" || company.stage === "Churned"
}

/** One activity line, whatever it started life as: the record's "All activity" door and its timeline. */
export interface ActivityLine { id: string; kind: string; at: string; who: string; text: string }

export function activityOf(seed: Seed, v: CompanyView): ActivityLine[] {
  const ids = new Set(v.contacts.map((c) => c.id))
  const out: ActivityLine[] = [
    ...seed.replies.filter((r) => ids.has(r.contactId)).map((r) => ({
      id: `reply-${r.id}`, kind: "Reply", at: r.received, who: r.contact, text: `${r.outcome} · ${r.snippet}`,
    })),
    ...seed.calls.filter((c) => ids.has(c.contactId)).map((c) => ({
      id: `call-${c.id}`, kind: "Call", at: c.startedAt.slice(0, 10), who: c.loggedBy, text: `${c.contact} · ${c.disposition}`,
    })),
    ...seed.meetings.filter((m) => ids.has(m.contactId)).map((m) => ({
      id: `meeting-${m.id}`, kind: "Meeting", at: m.at.slice(0, 10), who: m.host, text: `${m.contact} · ${m.state}`,
    })),
    ...v.tasks.filter((t) => t.doneAt).map((t) => ({
      id: `task-${t.id}`, kind: "Task", at: t.doneAt as string, who: t.owner, text: `${t.kind} · ${t.contact}`,
    })),
    ...seed.dealActivities.filter((a) => v.deals.some((d) => d.id === a.dealId)).map((a) => ({
      id: `deal-${a.id}`, kind: "Deal", at: a.at, who: a.by, text: a.summary,
    })),
    ...v.research.map((e) => ({
      id: `agent-${e.id}`, kind: "Agent", at: e.when, who: e.agent, text: e.summary,
    })),
  ]
  return out.sort((a, b) => (a.at < b.at ? 1 : -1))
}
