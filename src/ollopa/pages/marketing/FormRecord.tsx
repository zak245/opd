// The form record (`R-form`): the page a visitor fills in, its submissions, what enrichment costs and
// where the answers go.
//
// Three things are level one and decision-critical: the enrichment cap with what today has used and
// how many matched; what happens at the cap — submissions are still accepted and still routed, marked
// "not enriched"; and the count of submissions that reached nobody. A form that starts refusing people
// because a credit budget ran out is a form that loses the pipeline it exists to collect.
import { Fragment, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { href, navigate, useRoute } from "@/app/router"
import { openBeside } from "../../beside"
import { follow, type Origin } from "../../chain"
import { useEdits } from "../../edits"
import { Actions } from "../../ui/Actions"
import { Chip, FamilyIcon } from "../../ui/Identity"
import { FAMILY, PERSON_FAMILY, RowGap, ink, inUsageOrder } from "./look"
import { Separator } from "@/components/ui/separator"
import { RowNote, useTick } from "../engage/shared"
import { ActedNote, undoable } from "./acted"
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
  const route = useRoute()
  const admin = b.roles.find((r) => r.role === "admin")?.user ?? "your admin"

  // What actions took on the people who filled this in, and on the workflow that routes them, from
  // the one store every page reads. Acting in a pane redraws the row it was caused on, here, at once.
  const personEdits = useEdits("person")
  const workflowEdits = useEdits("workflow")
  useTick(Object.values({ ...personEdits, ...workflowEdits }).some(undoable))

  const f = rows.forms.find((x) => x.id === id)
  const [newCap, setNewCap] = useState("")
  const [q, setQ] = useState("")

  if (!f) {
    return (
      <div className="p-10">
        <EmptyState title="That form is not here" body="It may have been deleted, or the link may be old." action={<Actions surface="card" items={[{ kind: "link", label: "Back to Campaigns", href: href("/ollopa/campaigns") }]} />} />
      </div>
    )
  }

  const patch = (p: Partial<Form>) => patchRow(session.business, "forms", f.id, p)
  const atCap = f.enrichUsedToday >= f.enrichCapDaily
  const enrichedFields = f.fields.filter((x) => x.kind === "enriched")
  const askedFields = f.fields.filter((x) => x.kind === "asked")
  const workflow = rows.workflows.find((w) => w.trigger.includes("form")) ?? rows.workflows[0]
  const fieldsAtLevelOne = d.level("form.fields") === 1

  /* ------------------------------------------------------------------- the two ways off this page */

  /** Where this page is and the row being left, for the crumb and for the return cue. */
  const from = (anchor?: string): Origin => ({ route: route.raw, title: `${f.name} · Campaigns`, anchor })

  /** The submissions, filtered by the search, in the order they are shown. */
  const needle = q.trim().toLowerCase()
  const submissions = needle
    ? f.submissions.filter((s) => `${s.name} ${s.email}`.toLowerCase().includes(needle))
    : f.submissions
  const submissionIds = submissions.map((s) => s.contactId)

  /** A person who filled this in, read beside the form; the form stays where it is. */
  const readPerson = (contactId: string, opener?: HTMLElement | null) => {
    const index = submissionIds.indexOf(contactId)
    openBeside({
      kind: "person", id: contactId,
      list: { ids: submissionIds, index: index < 0 ? 0 : index },
      opener: opener ?? (document.activeElement as HTMLElement | null),
    })
  }

  const fields: RecordField[] = [
    { key: "status", label: "Status", value: <Chip status={f.status}>{f.status}</Chip> },
    { key: "submissions", label: "Submissions, 7 days", value: <span className="tabular-nums">{num(f.submissions7d)}</span> },
    { key: "routes", label: "Routes to", value: f.routesTo },
    { key: "reports", label: "Reports to", value: f.reportsTo },
    { key: "last", label: "Last submission", value: day(f.lastSubmission) },
  ]

  const fieldList = (
    <div className="space-y-1">
      {f.fields.map((x, i) => (
        <Fragment key={x.label}>
          {i > 0 && <Separator />}
          <div className="flex items-baseline justify-between gap-3 py-1.5">
            <span className="t-body">{x.label}</span>
            <span className="t-small text-muted-foreground">{x.kind === "asked" ? "asked" : `enriched · ${x.credits} credit${x.credits === 1 ? "" : "s"}`}</span>
          </div>
        </Fragment>
      ))}
    </div>
  )

  const fieldsLabel = `Fields: ${askedFields.length} asked, ${enrichedFields.length} enriched`

  // Each section names the usage item it is about; the model ranks them (LAYOUTS.md §7).
  const parts: { item: string; section: RecordSection }[] = [
    { item: "form.cap", section: {
      id: "enrichment", title: "Enrichment on submission",
      children: (
        <div className="space-y-2">
          <p className="text-sm">
            <span className={cn("tabular-nums", atCap && "font-medium")} style={atCap ? ink("warning") : undefined}>
              Enrichment cap {num(f.enrichCapDaily)} credits a day · {num(f.enrichUsedToday)} used today
            </span>{" "}
            · <span className="tabular-nums">{num(f.matched)} of {num(f.submissions7d)} submissions matched</span>
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <Label htmlFor="new-cap" className="text-xs">Raise the cap to</Label>
              <Input id="new-cap" type="number" min={f.enrichCapDaily} className="mt-1 w-28" value={newCap} onChange={(e) => setNewCap(e.target.value)} placeholder={String(f.enrichCapDaily)} />
            </div>
            <Actions surface="card" items={[{
              kind: "secondary", label: "Raise the cap",
              onClick: () => {
                patch({ enrichCapDaily: Number(newCap) })
                toast(`Cap raised to ${num(Number(newCap))} credits a day · ${num(f.enrichUsedToday)} used today.`)
                setNewCap("")
              },
              disabledBecause: newCap && Number(newCap) > f.enrichCapDaily ? undefined : `A number above ${num(f.enrichCapDaily)}`,
            }]} />
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={f.enrichOnSubmit} aria-label="Enrich on submission" onCheckedChange={(v) => { patch({ enrichOnSubmit: v }); toast(v ? "Submissions are enriched as they arrive." : "Submissions are no longer enriched; they are still accepted and routed.") }} />
              Enrich as submissions arrive
            </label>
          </div>
        </div>
      ),
    } },
    { item: "form.routing", section: {
      id: "routing", title: "Routing",
      children: (
        <div className="space-y-2 text-sm">
          <p>Every submission goes to <strong>{f.routesTo}</strong>.</p>
          <p className="text-muted-foreground">
            The rule that decides:{" "}
            {workflow
              ? (
                <span data-item={workflow.id} data-item-label={workflow.name}>
                  <button type="button" className="underline" onClick={(ev) => openBeside({ kind: "workflow", id: workflow.id, opener: ev.currentTarget })}>{workflow.name}</button>
                  <ActedNote business={session.business} kind="workflow" id={workflow.id} edit={workflowEdits[workflow.id]} />
                </span>
              )
              : "no workflow yet"} — round-robin across the pool, skipping anyone away.
          </p>
          <p className={f.unrouted > 0 ? "t-body font-medium" : "t-body text-muted-foreground"} style={f.unrouted > 0 ? ink("danger") : undefined}>
            {f.unrouted > 0
              ? <>{num(f.unrouted)} submission{f.unrouted === 1 ? "" : "s"} could not be routed and reached nobody.</>
              : <>Every submission reached somebody.</>}
            {/* The run history is a level the pane must not open, so this leaves — and the form and
                the workflow row stay on the trail behind it. A destination, so a real link. */}
            {f.unrouted > 0 && workflow && (
              <> <a
                className="underline" href={href(`/ollopa/workflows/${workflow.id}?at=runs`)}
                onClick={(ev) => { if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); follow(`/ollopa/workflows/${workflow.id}?at=runs`, from(workflow.id)) } }}
              >See why</a></>
            )}
          </p>
        </div>
      ),
    } },
    { item: "form.row", section: {
      id: "reporting", title: "Reporting",
      children: (
        <p className="text-sm">
          <span id="form-reports">Submissions count towards <strong>{f.reportsTo}</strong>'s campaign results.</span>{" "}
          <a
            className="underline" href={href("/ollopa/reports")}
            onClick={(ev) => { if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); follow("/ollopa/reports", from("form-reports")) } }}
          >
            Open Reports
          </a>
        </p>
      ),
    } },
    ...(fieldsAtLevelOne ? [{ item: "form.fields", section: { id: "fields", title: fieldsLabel, children: fieldList } }] : []),
    { item: "form.submissions", section: {
      // Who filled it in lives inside the form, whatever the count, and a row opens that person
      // beside the form rather than replacing it.
      id: "submissions", title: "Submissions", count: f.submissions.length,
      // Search once the list is longer than a screenful of names; it lives in the container's
      // header, which is where a contained list keeps its toolbar (DESIGN.md §5, containment).
      action: f.submissions.length > 10
        ? <Input aria-label="Find a submission by name or address" placeholder="Find a submission" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-56 max-sm:w-28" />
        : undefined,
      children: f.submissions.length === 0
        ? <EmptyState title="No submissions yet" body="When somebody fills this in, the answers become a note on their contact record." />
        : (
          <div className="space-y-2">
            <ul className="t-body">
              {submissions.map((s, i) => {
                const contact = seed.contacts.find((c) => c.id === s.contactId)
                return (
                  <Fragment key={s.id}>
                  {i > 0 && <RowGap />}
                  <li data-item={s.contactId} data-item-label={s.name} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                    <span className="min-w-0">
                      <span className="inline-flex items-center gap-1.5">
                        <FamilyIcon of={PERSON_FAMILY} />
                        <button type="button" className="underline" onClick={(ev) => readPerson(s.contactId, ev.currentTarget)}>{s.name}</button>
                      </span>
                      <span className="t-small text-muted-foreground"> · {s.email} · {contact?.company}</span>
                      {/* What an action from the pane beside this list did to this person, in place. */}
                      {personEdits[s.contactId]?.note && <RowNote kind="person" id={s.contactId} note={String(personEdits[s.contactId].note)} at={personEdits[s.contactId].at} />}
                      <span className="t-small block text-muted-foreground">Form: {f.name}, {day(s.at.slice(0, 10))} — the answers are a note on the contact</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      {s.enriched
                        ? <Chip status="done">enriched</Chip>
                        : <Chip status="warning">not enriched · cap reached {s.at.slice(11, 16)}</Chip>}
                      {s.routedTo
                        ? <span className="t-small text-muted-foreground">{s.routedTo}</span>
                        : <Chip status="failed">could not be routed</Chip>}
                    </span>
                  </li>
                  </Fragment>
                )
              })}
              {submissions.length === 0 && <li className="py-4 text-muted-foreground">Nothing here matches “{q}”.</li>}
            </ul>
          </div>
        ),
    } },
  ]

  const doors: RecordDoor[] = fieldsAtLevelOne ? [] : [{ id: "form.fields", label: fieldsLabel, count: f.fields.length, content: fieldList }]

  return (
    <RecordPage
      family={FAMILY}
      back={{ label: "Campaigns", href: href("/ollopa/campaigns") }}
      title={{ value: f.name, onRename: (v) => { patch({ name: v }); toast("Saved · Form name") } }}
      chips={<Chip status={f.status}>{f.status}</Chip>}
      ribbon={atCap ? { tone: "warning", text: `At the cap: ${num(f.enrichUsedToday)} of ${num(f.enrichCapDaily)} credits used today. Submissions are still accepted and still routed, marked “not enriched”.` } : undefined}
      fields={fields}
      actions={{
        primary: [{ label: f.status === "Live" ? "Turn the form off" : "Turn the form on", onClick: () => { patch({ status: f.status === "Live" ? "Off" : "Live" }); toast(f.status === "Live" ? `${f.name} is off. Submissions stop; the ones you have are kept.` : `${f.name} is live. Submissions are accepted and routed to ${f.routesTo}.`) } }],
        secondary: [
          { label: "Copy the form link", onClick: () => toast(`Link to ${f.name} copied.`) },
          { label: "Export submissions", onClick: () => toast(`${f.name}: submissions exported as CSV.`) },
        ],
      }}
      main={{ kind: "sections", label: "Form", sections: inUsageOrder(d, parts) }}
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
