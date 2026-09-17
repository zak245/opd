// The form record (`R-form`): the page a visitor fills in, its submissions, what enrichment costs and
// where the answers go.
//
// Three things are level one and decision-critical: the enrichment cap with what today has used and
// how many matched; what happens at the cap — submissions are still accepted and still routed, marked
// "not enriched"; and the count of submissions that reached nobody. A form that starts refusing people
// because a credit budget ran out is a form that loses the pipeline it exists to collect.
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { href, navigate } from "@/app/router"
import { toast } from "../../templates/TablePage"
import { RecordPage, type RecordDoor, type RecordField, type RecordSection } from "../../templates/RecordPage"
import { EmptyState } from "../../ui/EmptyState"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { seedFor, type Form } from "../../data/seed"
import type { Session } from "../../session"
import { day, num } from "./format"
import { patchRow, useMarketing } from "./store"

export function FormRecord({ session, id }: { session: Session; id?: string }) {
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const rows = useMarketing(session.business)
  const d = useDisclosure("campaigns")
  const admin = b.roles.find((r) => r.role === "admin")?.user ?? "your admin"

  const f = rows.forms.find((x) => x.id === id)
  const [newCap, setNewCap] = useState("")

  if (!f) {
    return (
      <div className="p-10">
        <EmptyState title="That form is not here" body="It may have been deleted, or the link may be old." action={<Button size="sm" onClick={() => navigate("/ollopa/campaigns")}>Back to Campaigns</Button>} />
      </div>
    )
  }

  const patch = (p: Partial<Form>) => patchRow(session.business, "forms", f.id, p)
  const atCap = f.enrichUsedToday >= f.enrichCapDaily
  const enrichedFields = f.fields.filter((x) => x.kind === "enriched")
  const askedFields = f.fields.filter((x) => x.kind === "asked")
  const workflow = rows.workflows.find((w) => w.trigger.includes("form")) ?? rows.workflows[0]
  const fieldsAtLevelOne = d.level("form.fields") === 1

  const fields: RecordField[] = [
    { key: "status", label: "Status", value: <Badge variant="secondary">{f.status}</Badge> },
    { key: "submissions", label: "Submissions, 7 days", value: <span className="tabular-nums">{num(f.submissions7d)}</span> },
    { key: "routes", label: "Routes to", value: f.routesTo },
    { key: "reports", label: "Reports to", value: f.reportsTo },
    { key: "last", label: "Last submission", value: day(f.lastSubmission) },
  ]

  const fieldList = (
    <div className="space-y-1">
      {f.fields.map((x) => (
        <div key={x.label} className="flex items-baseline justify-between gap-3 border-t py-1.5 first:border-t-0">
          <span className="text-sm">{x.label}</span>
          <span className="text-xs text-muted-foreground">{x.kind === "asked" ? "asked" : `enriched · ${x.credits} credit${x.credits === 1 ? "" : "s"}`}</span>
        </div>
      ))}
      <p className="pt-2 text-xs text-muted-foreground">
        A field already known for a returning visitor is removed from the form, not pre-filled invisibly, and the form says so in one line: “We already have your company and role.”
      </p>
    </div>
  )

  const fieldsLabel = `Fields: ${askedFields.length} asked, ${enrichedFields.length} enriched`

  const sections: RecordSection[] = [
    {
      id: "enrichment", title: "Enrichment on submission",
      children: (
        <div className="space-y-2">
          <p className="text-sm">
            <span className={cn("tabular-nums", atCap && "font-medium text-amber-700 dark:text-amber-400")}>
              Enrichment cap {num(f.enrichCapDaily)} credits a day · {num(f.enrichUsedToday)} used today
            </span>{" "}
            · <span className="tabular-nums">{num(f.matched)} of {num(f.submissions7d)} submissions matched</span>
          </p>
          <p className="text-sm text-muted-foreground">
            At the cap, enrichment stops. Submissions are still accepted and still routed, marked “not enriched — daily cap reached” on the person and on the row.
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <Label htmlFor="new-cap" className="text-xs">Raise the cap to</Label>
              <Input id="new-cap" type="number" min={f.enrichCapDaily} className="mt-1 w-28" value={newCap} onChange={(e) => setNewCap(e.target.value)} placeholder={String(f.enrichCapDaily)} />
            </div>
            <Button size="sm" disabled={!newCap || Number(newCap) <= f.enrichCapDaily} onClick={() => {
              patch({ enrichCapDaily: Number(newCap) })
              toast(`Cap raised to ${num(Number(newCap))} credits a day · ${num(f.enrichUsedToday)} used today.`)
              setNewCap("")
            }}>Raise the cap</Button>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={f.enrichOnSubmit} aria-label="Enrich on submission" onCheckedChange={(v) => { patch({ enrichOnSubmit: v }); toast(v ? "Submissions are enriched as they arrive." : "Submissions are no longer enriched; they are still accepted and routed.") }} />
              Enrich as submissions arrive
            </label>
          </div>
        </div>
      ),
    },
    {
      id: "routing", title: "Routing",
      children: (
        <div className="space-y-2 text-sm">
          <p>Every submission goes to <strong>{f.routesTo}</strong>.</p>
          <p className="text-muted-foreground">
            The rule that decides: {workflow ? <a className="underline" href={href(`/ollopa/workflows/${workflow.id}`)}>{workflow.name}</a> : "no workflow yet"} — round-robin across the pool, skipping anyone away.
          </p>
          <p className={f.unrouted > 0 ? "font-medium text-amber-700 dark:text-amber-400" : "text-muted-foreground"}>
            {f.unrouted > 0
              ? <>{num(f.unrouted)} submission{f.unrouted === 1 ? "" : "s"} could not be routed and reached nobody.</>
              : <>Every submission reached somebody.</>}
            {f.unrouted > 0 && workflow && <> <a className="underline" href={href(`/ollopa/workflows/${workflow.id}?at=runs`)}>See why</a></>}
          </p>
        </div>
      ),
    },
    {
      id: "reporting", title: "Reporting",
      children: (
        <p className="text-sm">
          Submissions count towards <strong>{f.reportsTo}</strong>'s campaign results, and appear on the campaign report.{" "}
          <a className="underline" href={href("/ollopa/reports")}>Open Reports</a>
        </p>
      ),
    },
    ...(fieldsAtLevelOne ? [{ id: "fields", title: fieldsLabel, children: fieldList }] : []),
    {
      id: "submissions", title: "Submissions", count: f.submissions.length,
      children: f.submissions.length === 0
        ? <EmptyState title="No submissions yet" body="When somebody fills this in, the answers become a note on their contact record." />
        : (
          <ul className="text-sm">
            {f.submissions.map((s) => {
              const contact = seed.contacts.find((c) => c.id === s.contactId)
              return (
                <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-2 border-t py-2 first:border-t-0">
                  <span className="min-w-0">
                    <a className="underline" href={href(`/ollopa/people/${s.contactId}`)}>{s.name}</a>
                    <span className="text-xs text-muted-foreground"> · {s.email} · {contact?.company}</span>
                    <span className="block text-xs text-muted-foreground">Form: {f.name}, {day(s.at.slice(0, 10))} — the answers are a note on the contact</span>
                  </span>
                  <span className="text-xs">
                    {s.enriched
                      ? <span className="text-muted-foreground">enriched</span>
                      : <span className="text-amber-700 dark:text-amber-400">not enriched — daily cap reached {s.at.slice(11, 16)}</span>}
                    {" · "}
                    {s.routedTo ?? <span className="text-amber-700 dark:text-amber-400">could not be routed</span>}
                  </span>
                </li>
              )
            })}
          </ul>
        ),
    },
  ]

  const doors: RecordDoor[] = fieldsAtLevelOne ? [] : [{ id: "form.fields", label: fieldsLabel, count: f.fields.length, content: fieldList }]

  return (
    <RecordPage
      back={{ label: "Campaigns", href: href("/ollopa/campaigns") }}
      title={{ value: f.name, onRename: (v) => { patch({ name: v }); toast("Saved · Form name") } }}
      chips={<Badge variant="secondary">{f.status}</Badge>}
      ribbon={atCap ? { tone: "warning", text: `At the cap: ${num(f.enrichUsedToday)} of ${num(f.enrichCapDaily)} credits used today. Submissions are still accepted and still routed, marked “not enriched”.` } : undefined}
      fields={fields}
      actions={{
        primary: [{ label: f.status === "Live" ? "Turn the form off" : "Turn the form on", onClick: () => { patch({ status: f.status === "Live" ? "Off" : "Live" }); toast(f.status === "Live" ? `${f.name} is off. Submissions stop; the ones you have are kept.` : `${f.name} is live. Submissions are accepted and routed to ${f.routesTo}.`) }, confirm: f.status === "Live" ? "Stops accepting submissions. The submissions you already have are kept." : `Starts accepting submissions and routing them to ${f.routesTo}.` }],
        secondary: [
          { label: "Copy the form link", onClick: () => toast(`Link to ${f.name} copied.`) },
          { label: "Export submissions", onClick: () => toast(`${f.name}: submissions exported as CSV.`) },
        ],
      }}
      main={{ kind: "sections", label: "Form", sections }}
      side={[{
        id: "spend", title: "Enrichment spend",
        children: (
          <ul className="space-y-1 text-sm">
            <li className="tabular-nums">{num(f.enrichUsedToday)} of {num(f.enrichCapDaily)} credits today</li>
            <li className="tabular-nums">{num(f.matched)} of {num(f.submissions7d)} matched</li>
            <li className="text-xs text-muted-foreground">{num(enrichedFields.reduce((n, x) => n + x.credits, 0))} credits a submission: {enrichedFields.map((x) => x.label.toLowerCase()).join(", ")}</li>
            <li className="text-xs text-muted-foreground">{admin} sets the workspace credit cap in Settings.</li>
          </ul>
        ),
      }]}
      doors={doors}
    />
  )
}
