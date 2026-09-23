// R-job: the enrichment job, and the record every spend on this page ends on.
//
// Cost per hit is in the header because it is the number the next run is designed from, and a reader
// should never have to compute it. The fee statement is a section, always present, whatever its usage
// number. One door, for the long list nobody reads alongside the report (spec 18 §3.3).
import { useState } from "react"
import { Actions } from "../../ui/Actions"
import { href, navigate } from "@/app/router"
import { toast } from "../../templates/TablePage"
import { RecordPage } from "../../templates/RecordPage"
import { RowsTable } from "../../layouts"
import { businessById } from "../../data/businesses"
import { CREDITS, TODAY, seedFor, type EnrichmentJob } from "../../data/seed"
import type { Session } from "../../session"
import { day } from "../deal/format"
import { n, pct } from "./bits"
import { useDraft } from "./drafts"

const SOURCE_WORDS: Record<EnrichmentJob["source"], string> = {
  import: "Import", reveal: "Reveal from People", api: "API key", "job-change": "Job change sweep", form: "Form",
}

export function JobRecord({ session, id }: { session: Session; id?: string }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const [dropped, setDropped] = useState(false)

  // The run this tab just finished is read from the import draft, so the wizard ends on a record and
  // not on a toast, even before the job list has caught up.
  const [imported] = useDraft(`ollopa.import.${session.business}`, { file: "", rows: 0, credits: 0, done: 0, fields: [] as string[], order: [] as string[], owner: session.user })
  const rates = seed.enrichmentRates

  const local: EnrichmentJob | null = id === "local-import" && imported.file
    ? {
        id: "local-import", source: "import", sourceLabel: `Import: ${imported.file}`,
        startedBy: imported.owner, startedAt: TODAY,
        keyId: null, fields: imported.fields, providers: imported.order,
        rows: imported.rows, matched: rates.filter((r) => imported.fields.includes(r.field)).length
          ? Math.round(imported.done * Math.max(...rates.filter((r) => imported.fields.includes(r.field)).map((r) => r.hitRate)))
          : 0,
        credits: imported.credits,
        byField: rates.filter((r) => imported.fields.includes(r.field)).map((r) => ({ field: r.field, hit: Math.round(imported.done * r.hitRate), cost: r.typicalCost })),
        unmatchedIds: [], charging: { chargedRows: 0, freeRows: 0, note: "" }, status: imported.done >= imported.rows ? "done" : "paused",
      }
    : null

  const job = local ?? seed.enrichmentJobs.find((j) => j.id === id) ?? seed.enrichmentJobs[0]

  if (!job) {
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <h2 className="t-section">No enrichment jobs yet</h2>
        <p className="mt-2 t-body text-muted-foreground">A reveal or an import writes one, with what it cost and what it found.</p>
        <Actions className="mt-5 justify-center" surface="page" items={[{ kind: "primary", label: "Import and enrich a file", onClick: () => navigate("/ollopa/import?step=1") }]} />
      </div>
    )
  }

  const hits = job.byField.reduce((s, f) => s + f.hit, 0)
  const costPerHit = hits ? Math.round(job.credits / hits) : 0
  const chargedRows = job.charging.chargedRows || job.matched
  const freeRows = job.charging.freeRows || Math.max(0, job.rows - job.matched)
  const unmatched = seed.contacts.filter((c) => job.unmatchedIds.includes(c.id))
  const unmatchedCount = Math.max(unmatched.length, job.rows - job.matched)
  const rerunCost = job.byField.reduce((s, f) => s + Math.round((job.rows - job.matched) * 0.3) * f.cost, 0)

  // The movers this sweep found: object state on the contact, not a stored list (spec 18 §3.4).
  const movers = job.source === "job-change" ? seed.contacts.filter((c) => c.jobChange) : []
  const sequence = seed.sequences[0]?.name ?? "a sequence"
  const netNew = movers.filter((m) => !seed.accounts.some((a) => a.companyId === m.jobChange?.newCompanyId)).length

  return (
    <>
      <RecordPage
        back={{ label: "People", href: href("/ollopa/people") }}
        title={{ value: job.sourceLabel }}
        subtitle={{ label: `${SOURCE_WORDS[job.source]} · ${job.status}`, href: href("/ollopa/import?step=1") }}
        ribbon={job.status === "paused" ? { tone: "warning", text: `Stopped at row ${n(local ? imported.done : job.matched)}. ${n(job.credits)} credits spent and kept. Resume runs the rest.`, action: <Actions surface="card" items={[{ kind: "secondary", label: "Resume the run", onClick: () => navigate("/ollopa/import?step=5") }]} /> } : undefined}
        fields={[
          { key: "source", label: "Source", value: job.sourceLabel },
          { key: "by", label: "Started by", value: `${job.startedBy} · ${day(job.startedAt)}` },
          { key: "fields", label: "Fields", value: job.fields.join(", ") || "—" },
          { key: "providers", label: "Provider order as run", value: job.providers.join(" → ") },
          { key: "rows", label: "Rows", value: n(job.rows) },
          { key: "matched", label: "Matched", value: `${n(job.matched)} · ${pct(job.rows ? job.matched / job.rows : 0)}` },
          { key: "credits", label: "Credits", value: n(job.credits) },
          { key: "cph", label: "Cost per hit", value: hits ? `${n(costPerHit)} credits` : "—" },
          { key: "charged", label: "Charged", value: `${n(chargedRows)} rows · ${n(freeRows)} free` },
        ]}
        actions={{
          primary: [{ label: "Export the job report", onClick: () => toast(`Exported ${job.byField.length} field rows and ${n(job.rows)} row records as CSV`) }],
          secondary: [{ label: "Open the credit breakdown", onClick: () => navigate("/ollopa/settings/plan") }],
        }}
        main={{
          kind: "sections",
          label: "The report",
          sections: [
            {
              id: "by-field",
              title: "By field",
              count: job.byField.length,
              children: (
                /* A table inside a record is a divided list at 400 (LAYOUTS.md §5). */
                <RowsTable
                  rows={job.byField.map((f, i) => ({ ...f, provider: job.providers[i % job.providers.length] }))}
                  rowKey={(f) => f.field}
                  columns={[
                    { key: "field", header: "Field", lead: true, cell: (f) => f.field },
                    { key: "attempted", header: "Attempted", cell: () => n(job.rows) },
                    { key: "matched", header: "Matched", cell: (f) => n(f.hit) },
                    { key: "rate", header: "Hit rate", cell: (f) => `${f.hit} of ${n(job.rows)} · ${pct(job.rows ? f.hit / job.rows : 0)}` },
                    { key: "credits", header: "Credits", cell: (f) => n(f.hit * f.cost) },
                    { key: "cph", header: "Cost per hit", cell: (f) => f.cost },
                    { key: "provider", header: "Returned by", cell: (f) => f.provider },
                  ]}
                  empty="No field was asked for."
                />
              ),
            },
            ...(unmatchedCount > 0
              ? [{
                  id: "unmatched",
                  title: "Unmatched rows",
                  count: unmatchedCount,
                  children: (
                    <div className="grid gap-3">
                      <ul className="grid gap-1 t-body">
                        {unmatched.slice(0, 6).map((c) => (
                          <li key={c.id} className="text-muted-foreground">{c.name} · {c.company} · nothing returned · 0 credits</li>
                        ))}
                        {unmatchedCount > unmatched.length && <li className="text-muted-foreground">and {n(unmatchedCount - unmatched.length)} more, in the door at the foot of this page</li>}
                      </ul>
                      {/* Both acts of this section, in the body: the long destructive label ran past
                          the card's edge at 400 while it sat on the heading line. `Actions` puts the
                          destructive one last, after the gap (DESIGN.md §1). */}
                      <Actions className="justify-start" surface="card" items={[
                        {
                          kind: "secondary", label: "Run the unmatched rows again",
                          cost: `about ${n(rerunCost)} credits`,
                          consequence: "Only rows that return are charged",
                          onClick: () => toast(`Started a second job on ${n(unmatchedCount)} rows · linked to this one`),
                          irreversible: {
                            title: "Run the unmatched rows again?",
                            consequence: `${n(unmatchedCount)} rows, a different provider order: ${[...job.providers].reverse().join(" → ")}. About ${n(rerunCost)} credits, and only rows that return are charged.`,
                            confirmLabel: `Run ${n(unmatchedCount)} again · about ${n(rerunCost)} credits`,
                          },
                        },
                        {
                          kind: "destructive",
                          label: dropped ? "Dropped" : `Drop these ${n(unmatchedCount)} from the list`,
                          onClick: () => { setDropped(true); toast(`Dropped ${n(unmatchedCount)} rows from ${seed.lists[0]?.name ?? "the list"}`) },
                          disabledBecause: dropped ? "Already dropped" : undefined,
                          irreversible: {
                            title: `Drop these ${n(unmatchedCount)} from the list?`,
                            consequence: `Removes ${n(unmatchedCount)} from "${seed.lists[0]?.name ?? "the list"}". The records stay in the workspace, and nothing is refunded.`,
                            confirmLabel: `Drop ${n(unmatchedCount)} from the list`,
                          },
                        },
                      ]} />
                    </div>
                  ),
                }]
              : []),
            ...(movers.length
              ? [{
                  id: "movers",
                  title: "The people who moved",
                  count: movers.length,
                  children: (
                    <div className="grid gap-3">
                      {movers.slice(0, 6).map((m) => {
                        const company = seed.companies.find((c) => c.id === m.jobChange?.newCompanyId)
                        const account = seed.accounts.find((a) => a.companyId === m.jobChange?.newCompanyId)
                        const open = seed.deals.filter((d) => d.companyId === m.jobChange?.newCompanyId && d.stage !== "Closed won").length
                        return (
                          <div key={m.id} className="rounded-lg border p-3">
                            <div className="t-body font-medium">{m.name} · {m.jobChange?.previousCompany} → {company?.name ?? "a company ollopA does not hold"}</div>
                            <p className="t-small text-muted-foreground">Signal fired {day(m.jobChange?.firedOn ?? "")} from {m.jobChange?.source}.</p>
                            <p className="mt-1 t-body">
                              {company && account
                                ? `${company.name} is already an account · owner ${account.owner} · ${open} open deal${open === 1 ? "" : "s"}`
                                : `${company?.name ?? "The new employer"} is not in the workspace yet.`}
                            </p>
                            {/* Two comparable acts, so neither is filled, and neither spends: the
                                lines that explained them are gone (DESIGN.md §1 and §3). */}
                            <Actions className="mt-2" surface="card" items={[
                              { kind: "secondary", label: "Update this record", onClick: () => toast(`Updated ${m.name} · old employer kept in the history`) },
                              { kind: "secondary", label: "Create a new contact", onClick: () => toast(`Created a new contact for ${m.name} · linked to the old record`) },
                            ]} />
                            <p className="mt-2 t-small text-muted-foreground">
                              The new address is not known yet · verifying one costs {CREDITS.revealEmail} credit{CREDITS.revealEmail === 1 ? "" : "s"}.
                            </p>
                          </div>
                        )
                      })}
                      <div className="rounded-lg border p-3">
                        <Actions surface="card" items={[{
                          kind: "secondary", label: `Enrol the ${n(movers.length)} movers in "${sequence}"`,
                          cost: `about ${n(movers.length * CREDITS.revealEmail)} credits`,
                          onClick: () => toast(`Enrolled ${n(movers.length)} movers in ${sequence}`),
                          irreversible: {
                            title: `Enrol the ${n(movers.length)} movers in "${sequence}"?`,
                            consequence: `${n(netNew)} of them work somewhere ollopA does not own yet. Verifying ${n(movers.length)} new addresses costs about ${n(movers.length * CREDITS.revealEmail)} credits, and the first step sends on the sequence's own schedule.`,
                            confirmLabel: `Enrol ${n(movers.length)} · about ${n(movers.length * CREDITS.revealEmail)} credits`,
                          },
                        }]} />
                      </div>
                    </div>
                  ),
                }]
              : []),
          ],
        }}
        side={[
          {
            id: "credits", title: "Credits",
            children: (
              <dl className="grid grid-cols-[minmax(6rem,auto)_minmax(0,1fr)] gap-x-3 gap-y-1 t-body">
                <dt className="text-muted-foreground">Balance now</dt><dd className="tabular-nums">{n(seed.credits.balance)}</dd>
                <dt className="text-muted-foreground">Cap a month</dt><dd className="tabular-nums">{n(seed.credits.monthlyCap)}</dd>
                {job.keyId && (
                  <>
                    <dt className="text-muted-foreground">Ran by</dt>
                    <dd><a className="underline" href={href("/ollopa/developer/api")}>{seed.apiKeys.find((k) => k.id === job.keyId)?.name ?? job.keyId}</a></dd>
                  </>
                )}
              </dl>
            ),
          },
        ]}
        doors={[{
          id: `job.all-rows.${job.id}`,
          label: `All rows · ${n(job.rows)}`,
          count: job.rows,
          content: (
            <div className="min-w-0">
              <RowsTable
                rows={seed.contacts.slice(0, Math.min(40, job.rows)).map((c, i) => ({ ...c, no: i + 1 }))}
                rowKey={(c) => c.id}
                columns={[
                  { key: "person", header: "Person", lead: true, cell: (c) => `${c.name} · ${c.company}` },
                  { key: "row", header: "Row", cell: (c) => c.no },
                  { key: "returned", header: "Returned", cell: (c) => (c.enrichedOn ? job.fields.join(", ") : "nothing") },
                  { key: "credits", header: "Credits", cell: (c) => (c.enrichedOn ? costPerHit : 0) },
                ]}
                empty="No row ran."
              />
              {job.rows > 40 && <p className="px-4 pt-2 t-small text-muted-foreground">The first 40 of {n(job.rows)}. Export the report for all of them.</p>}
            </div>
          ),
        }]}
      />
    </>
  )
}
