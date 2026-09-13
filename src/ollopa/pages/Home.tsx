import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { href } from "@/app/router"
import { seedFor } from "../data/seed"
import { businessById } from "../data/businesses"
import type { Session } from "../session"
import { toast } from "../templates/TablePage"

function money(n: number) { return "$" + n.toLocaleString() }

export function Home({ session }: { session: Session }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const seat = b.roles.find((r) => r.role === session.role)!
  const today = "2026-09-13"
  const tasks = seed.tasks.filter((t) => t.due <= today).slice(0, 5)
  const replies = seed.replies.filter((r) => r.outcome === "Interested" || r.outcome === "Question").slice(0, 5)
  const approvals = seed.agentEvents.filter((e) => e.needsApproval).slice(0, 5)
  const pipeline = seed.deals.filter((d) => d.stage !== "Closed won").reduce((s, d) => s + d.amount, 0)
  const mine = seed.deals.filter((d) => d.owner === seat.user && d.stage !== "Closed won")
  const role = session.role

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Good morning, {seat.user.split(" ")[0]}</h2>
        <p className="text-sm text-muted-foreground">Saturday 13 September · {b.name}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(role === "sdr" || role === "ae" || role === "cs") && (
          <Card>
            <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Due today</CardTitle><a className="text-sm text-muted-foreground underline-offset-4 hover:underline" href={href("/ollopa/tasks")}>All tasks</a></CardHeader>
            <CardContent className="grid gap-2">
              {tasks.length === 0 && <p className="text-sm text-muted-foreground">Nothing due. Tomorrow has {seed.tasks.filter((t) => t.due > today).length}.</p>}
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="w-20 justify-center">{t.kind}</Badge>
                  <span className="flex-1 truncate"><span className="font-medium">{t.contact}</span> <span className="text-muted-foreground">· {t.company}</span></span>
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => toast(`${t.kind} with ${t.contact} marked done.`)}>Done</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {(role === "sdr" || role === "ae") && (
          <Card>
            <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Replies to work</CardTitle><a className="text-sm text-muted-foreground underline-offset-4 hover:underline" href={href("/ollopa/inbox")}>Inbox</a></CardHeader>
            <CardContent className="grid gap-2">
              {replies.map((r) => (
                <div key={r.id} className="text-sm">
                  <div className="flex items-center gap-2"><span className="font-medium">{r.contact}</span><Badge variant="secondary">{r.outcome}</Badge></div>
                  <div className="truncate text-muted-foreground">{r.snippet}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {(role === "ae" || role === "admin" || role === "cs") && (
          <Card>
            <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Pipeline</CardTitle><a className="text-sm text-muted-foreground underline-offset-4 hover:underline" href={href("/ollopa/deals")}>Deals</a></CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">{money(pipeline)}</div>
              <p className="text-sm text-muted-foreground">{seed.deals.filter((d) => d.stage !== "Closed won").length} open deals{role === "ae" ? ` · ${mine.length} yours, ${money(mine.reduce((s, d) => s + d.amount, 0))}` : ""}</p>
              <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                {(["Qualified", "Discovery", "Proposal", "Negotiation"] as const).map((s) => (
                  <div key={s} className="rounded-md bg-muted p-2"><div className="text-muted-foreground">{s}</div><div className="font-medium tabular-nums">{seed.deals.filter((d) => d.stage === s).length}</div></div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {role === "marketer" && (
          <Card>
            <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Campaigns this week</CardTitle><a className="text-sm text-muted-foreground underline-offset-4 hover:underline" href={href("/ollopa/campaigns")}>Campaigns</a></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{b.counts.campaigns} campaigns running. Results update nightly.</CardContent>
          </Card>
        )}
        {role === "cs" && (
          <Card>
            <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Renewals in 60 days</CardTitle><a className="text-sm text-muted-foreground underline-offset-4 hover:underline" href={href("/ollopa/accounts")}>Accounts</a></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{seed.companies.filter((c) => c.stage === "Current client").length} client accounts. Health and renewal dates on the Accounts page.</CardContent>
          </Card>
        )}
        {role !== "cs" && (
          <Card>
            <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Agents waiting for you</CardTitle><a className="text-sm text-muted-foreground underline-offset-4 hover:underline" href={href("/ollopa/agents")}>Agents</a></CardHeader>
            <CardContent className="grid gap-2">
              {approvals.map((e) => (
                <div key={e.id} className="flex items-center gap-3 text-sm">
                  <span className="flex-1 truncate">{e.summary}</span>
                  <Button size="sm" variant="outline" className="h-7" onClick={() => toast("Approved.")}>Approve</Button>
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => toast("Declined.")}>Decline</Button>
                </div>
              ))}
              {approvals.length === 0 && <p className="text-sm text-muted-foreground">Nothing waiting.</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
