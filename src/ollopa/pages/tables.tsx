// The pages built from the table template: People, Companies, Sequences, Tasks, Inbox, Lists.
import { ListPlus, Send, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TablePage, toast } from "../templates/TablePage"
import { seedFor, type Contact, type Company, type Sequence, type Task, type Reply } from "../data/seed"
import { businessById } from "../data/businesses"
import type { Session } from "../session"
import { navigate } from "@/app/router"

const stageTone: Record<string, string> = {
  Cold: "bg-muted text-muted-foreground",
  Approaching: "bg-muted text-muted-foreground",
  Replied: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  Interested: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200",
  "Meeting booked": "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200",
  "Not interested": "bg-muted text-muted-foreground",
  Unresponsive: "bg-muted text-muted-foreground",
}

function Stage({ s }: { s: string }) {
  return <Badge variant="secondary" className={stageTone[s] ?? ""}>{s}</Badge>
}

export function People({ session }: { session: Session }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  return (
    <TablePage<Contact>
      title="People"
      description="Contacts you can reach, with who owns them and where they are."
      total={b.counts.contacts}
      rows={seed.contacts}
      rowKey={(r) => r.id}
      searchText={(r) => `${r.name} ${r.title} ${r.company} ${r.email}`}
      primary={{ label: "Add people", onClick: () => toast("Add people: search or import. Not built in this demo.") }}
      filters={[
        { key: "stage", label: "Stage", options: ["Cold", "Approaching", "Replied", "Interested", "Meeting booked", "Not interested", "Unresponsive"], get: (r) => r.stage },
        { key: "email", label: "Email status", options: ["Verified", "Guessed", "Unverified", "Bounced"], get: (r) => r.emailStatus },
        { key: "owner", label: "Owner", options: b.roles.map((s) => s.user), get: (r) => r.owner },
      ]}
      columns={[
        { key: "name", header: "Name", cell: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.title}</div></div> },
        { key: "company", header: "Company", cell: (r) => r.company },
        { key: "email", header: "Email", cell: (r) => <div className="font-mono text-xs"><div>{r.email}</div><div className={r.emailStatus === "Bounced" ? "text-destructive" : "text-muted-foreground"}>{r.emailStatus}</div></div> },
        { key: "stage", header: "Stage", cell: (r) => <Stage s={r.stage} /> },
        { key: "seq", header: "Sequence", cell: (r) => r.inSequence ?? <span className="text-muted-foreground">—</span> },
        { key: "last", header: "Last activity", className: "tabular-nums", cell: (r) => r.lastActivity },
        { key: "owner", header: "Owner", cell: (r) => r.owner },
      ]}
      rowActions={[
        { label: "Sequence", icon: Send, onClick: (r) => toast(`${r.name} added to a sequence.`) },
        { label: "List", icon: ListPlus, onClick: (r) => toast(`${r.name} added to a list.`) },
        { label: "Call", icon: Phone, onClick: (r) => toast(`Call task created for ${r.name}.`) },
      ]}
      moreActions={[
        { label: "View", onClick: (r) => toast(`Contact page for ${r.name}: a later case.`) },
        { label: "Edit", onClick: (r) => toast(`Edit ${r.name}.`) },
        { label: "Enrich", onClick: (r) => toast(`Enrichment requested for ${r.name}. 2 credits.`) },
        { label: "Remove", destructive: true, onClick: (r) => toast(`${r.name} removed. Undo is in the notification.`) },
      ]}
    />
  )
}

export function Companies({ session }: { session: Session }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  return (
    <TablePage<Company>
      title="Companies"
      description="Accounts and the contacts you hold at each."
      total={b.counts.companies}
      rows={seed.companies}
      rowKey={(r) => r.id}
      searchText={(r) => `${r.name} ${r.industry} ${r.domain}`}
      filters={[
        { key: "stage", label: "Stage", options: ["Cold", "Active opportunity", "Current client", "Churned"], get: (r) => r.stage },
        { key: "industry", label: "Industry", options: ["Software", "Logistics", "Healthcare", "Fintech", "Energy", "Manufacturing", "Media", "Retail", "Insurance", "Legal"], get: (r) => r.industry },
      ]}
      columns={[
        { key: "name", header: "Company", cell: (r) => <div><div className="font-medium">{r.name}</div><div className="font-mono text-xs text-muted-foreground">{r.domain}</div></div> },
        { key: "industry", header: "Industry", cell: (r) => r.industry },
        { key: "employees", header: "Employees", className: "tabular-nums", cell: (r) => r.employees.toLocaleString() },
        { key: "contacts", header: "Contacts", className: "tabular-nums", cell: (r) => r.contacts },
        { key: "stage", header: "Stage", cell: (r) => <Stage s={r.stage} /> },
        { key: "last", header: "Last activity", className: "tabular-nums", cell: (r) => r.lastActivity },
        { key: "owner", header: "Owner", cell: (r) => r.owner },
      ]}
      rowActions={[{ label: "Find people", icon: ListPlus, onClick: (r) => toast(`Searching people at ${r.name}.`) }]}
      moreActions={[{ label: "View", onClick: (r) => toast(`Company page for ${r.name}: a later case.`) }, { label: "Edit", onClick: (r) => toast(`Edit ${r.name}.`) }]}
    />
  )
}

export function Sequences({ session }: { session: Session }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  return (
    <TablePage<Sequence>
      title="Sequences"
      description="Multi-step outreach. Replies land in Inbox; calls and LinkedIn steps land in Tasks."
      total={b.counts.sequences}
      rows={seed.sequences}
      rowKey={(r) => r.id}
      searchText={(r) => `${r.name} ${r.owner}`}
      primary={{ label: "New sequence", onClick: () => toast("The sequence builder is a later case.") }}
      filters={[{ key: "status", label: "Status", options: ["Active", "Paused", "Draft"], get: (r) => r.status }]}
      columns={[
        { key: "name", header: "Sequence", cell: (r) => <span className="font-medium">{r.name}</span> },
        { key: "status", header: "Status", cell: (r) => <Badge variant={r.status === "Active" ? "default" : "secondary"}>{r.status}</Badge> },
        { key: "steps", header: "Steps", className: "tabular-nums", cell: (r) => r.steps },
        { key: "active", header: "Active", className: "tabular-nums", cell: (r) => r.active.toLocaleString() },
        { key: "replied", header: "Replied", className: "tabular-nums", cell: (r) => r.replied },
        { key: "bounced", header: "Bounced", className: "tabular-nums", cell: (r) => <span className={r.bounced > 8 ? "text-destructive" : undefined}>{r.bounced}</span> },
        { key: "owner", header: "Owner", cell: (r) => r.owner },
      ]}
      rowActions={[{ label: (r) => (r.status === "Active" ? "Pause" : "Resume"), icon: Send, onClick: (r) => toast(`${r.name} ${r.status === "Active" ? "paused" : "resumed"}.`) }]}
      moreActions={[{ label: "Open", onClick: (r) => toast(`${r.name}: the sequence page is a later case.`) }, { label: "Duplicate", onClick: (r) => toast(`${r.name} duplicated.`) }, { label: "Archive", destructive: true, onClick: (r) => toast(`${r.name} archived.`) }]}
    />
  )
}

export function Tasks({ session }: { session: Session }) {
  const seed = seedFor(session.business)
  return (
    <TablePage<Task>
      title="Tasks"
      description="Calls, LinkedIn steps and follow-ups due, oldest first."
      rows={[...seed.tasks].sort((a, b) => a.due.localeCompare(b.due))}
      rowKey={(r) => r.id}
      searchText={(r) => `${r.kind} ${r.contact} ${r.company}`}
      filters={[{ key: "kind", label: "Type", options: ["Call", "LinkedIn", "Email", "Follow-up"], get: (r) => r.kind }]}
      columns={[
        { key: "due", header: "Due", className: "tabular-nums", cell: (r) => r.due },
        { key: "kind", header: "Type", cell: (r) => <Badge variant="outline">{r.kind}</Badge> },
        { key: "contact", header: "Contact", cell: (r) => <div><div className="font-medium">{r.contact}</div><div className="text-xs text-muted-foreground">{r.company}</div></div> },
        { key: "seq", header: "From sequence", cell: (r) => r.sequence ?? <span className="text-muted-foreground">Manual</span> },
      ]}
      rowActions={[{ label: "Done", onClick: (r) => toast(`${r.kind} with ${r.contact} marked done.`) }, { label: "Snooze", onClick: (r) => toast(`Snoozed to tomorrow.`) }]}
      moreActions={[{ label: "Open contact", onClick: (r) => toast(`Contact page for ${r.contact}: a later case.`) }, { label: "Skip", destructive: true, onClick: (r) => toast(`Skipped.`) }]}
    />
  )
}

export function InboxPage({ session }: { session: Session }) {
  const seed = seedFor(session.business)
  return (
    <TablePage<Reply>
      title="Inbox"
      description="Replies from sequences, grouped by what the person meant."
      rows={[...seed.replies].sort((a, b) => b.received.localeCompare(a.received))}
      rowKey={(r) => r.id}
      searchText={(r) => `${r.contact} ${r.company} ${r.snippet}`}
      filters={[{ key: "outcome", label: "Outcome", options: ["Interested", "Not now", "Question", "Out of office", "Unsubscribe"], get: (r) => r.outcome }]}
      columns={[
        { key: "received", header: "Received", className: "tabular-nums", cell: (r) => r.received },
        { key: "contact", header: "From", cell: (r) => <div><div className="font-medium">{r.contact}</div><div className="text-xs text-muted-foreground">{r.company}</div></div> },
        { key: "outcome", header: "Outcome", cell: (r) => <Stage s={r.outcome === "Interested" ? "Interested" : r.outcome === "Question" ? "Replied" : "Cold"} /> },
        { key: "snippet", header: "Reply", cell: (r) => <span className="text-muted-foreground">{r.snippet}</span> },
        { key: "seq", header: "Sequence", cell: (r) => r.sequence },
      ]}
      rowActions={[{ label: "Reply", onClick: (r) => toast(`Replying to ${r.contact}.`) }, { label: "Book meeting", onClick: (r) => toast(`Meeting link sent to ${r.contact}.`) }]}
      moreActions={[{ label: "Mark not interested", onClick: (r) => toast(`${r.contact} marked not interested and removed from the sequence.`) }, { label: "Unsubscribe", destructive: true, onClick: (r) => toast(`${r.contact} unsubscribed.`) }]}
    />
  )
}

export function Lists({ session }: { session: Session }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const lists = [
    { id: "l1", name: "Q4 enterprise targets", type: "People", count: 1_240, owner: b.roles[0].user, updated: "2026-09-11" },
    { id: "l2", name: "Fintech CROs, EMEA", type: "People", count: 388, owner: b.roles[b.roles.length - 1].user, updated: "2026-09-09" },
    { id: "l3", name: "Series A, last 90 days", type: "Companies", count: 212, owner: b.roles[0].user, updated: "2026-09-08" },
    { id: "l4", name: "Webinar attendees, August", type: "People", count: 96, owner: b.roles[0].user, updated: "2026-08-30" },
    { id: "l5", name: "Churn risks", type: "Companies", count: seed.companies.filter((c) => c.stage === "Churned").length + 14, owner: b.roles[b.roles.length - 1].user, updated: "2026-09-12" },
  ]
  return (
    <TablePage
      title="Lists"
      description="Saved lists and segments. A list can feed a sequence or a campaign."
      rows={lists}
      rowKey={(r) => r.id}
      searchText={(r) => r.name}
      primary={{ label: "New list", onClick: () => toast("New list: choose people or companies, then filters.") }}
      columns={[
        { key: "name", header: "List", cell: (r) => <span className="font-medium">{r.name}</span> },
        { key: "type", header: "Type", cell: (r) => <Badge variant="outline">{r.type}</Badge> },
        { key: "count", header: "Records", className: "tabular-nums", cell: (r) => r.count.toLocaleString() },
        { key: "owner", header: "Owner", cell: (r) => r.owner },
        { key: "updated", header: "Updated", className: "tabular-nums", cell: (r) => r.updated },
      ]}
      rowActions={[{ label: "Add to sequence", icon: Send, onClick: (r) => toast(`${r.name}: choose a sequence.`) }]}
      moreActions={[{ label: "Open", onClick: () => navigate("/ollopa/people") }, { label: "Export CSV", onClick: (r) => toast(`${r.name} exported.`) }, { label: "Delete", destructive: true, onClick: (r) => toast(`${r.name} deleted.`) }]}
    />
  )
}
