// R-job: the enrichment job, and the record every spend on this page ends on.
//
// Cost per hit is in the header because it is the number the next run is designed from, and a reader
// should never have to compute it. The fee statement is a section, always present, whatever its usage
// number. One door, for the long list nobody reads alongside the report (spec 18 §3.3).
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { href, navigate } from "@/app/router"
import { toast } from "../../templates/TablePage"
import { RecordPage } from "../../templates/RecordPage"
import { businessById } from "../../data/businesses"
import { CREDITS, TODAY, seedFor, type EnrichmentJob } from "../../data/seed"
import type { Session } from "../../session"
import { day } from "../deal/format"
import { Confirm, Consequence, n, pct } from "./bits"
import { useDraft } from "./drafts"

const SOURCE_WORDS: Record<EnrichmentJob["source"], string> = {
  import: "Import", reveal: "Reveal from People", api: "API key", "job-change": "Job change sweep", form: "Form",
}

export function JobRecord({ session, id }: { session: Session; id?: string }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const [dropped, setDropped] = useState(false)
  const [confirm, setConfirm] = useState<null | { title: string; body: string; label: string; run: () => void }>(null)

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
        <h2 className="text-lg font-semibold">No enrichment jobs yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">A reveal or an import writes one, with what it cost and what it found.</p>
        <Button className="mt-5" onClick={() => navigate("/ollopa/import?step=1")}>Import and enrich a file</Button>
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
        ribbon={job.status === "paused" ? { tone: "warning", text: `Stopped at row ${n(local ? imported.done : job.matched)}. ${n(job.credits)} credits spent and kept. Resume runs the rest.`, action: <Button size="sm" onClick={() => navigate("/ollopa/import?step=5")}>Resume the run</Button> } : undefined}
        fields={[
          { key: "source", label: "Source", value: job.sourceLabel },
          { key: "by", label: "Started by", value: `${job.startedBy} · ${day(job.startedAt)}` },
          { key: "fields", label: "Fields", value: job.fields.join(", ") || "—" },
          { key: "providers", label: "Provider order as run", value: job.providers.join(" → ") },
          { key: "rows", label: "Rows", value: n(job.rows) },
          { key: "matched", label: "Matched", value: `${n(job.matched)} · ${pct(job.rows ? job.matched / job.rows : 0)}` },
          { key: "credits", label: "Credits", value: n(job.credits) },
          { key: "cph", label: "Cost per hit", value: hits ? `${n(costPerHit)} credits` : "—" },
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
                <div className="min-w-0 overflow-x-auto">
                  <table className="w-full min-w-[40rem] border-collapse text-sm">
                    <caption className="sr-only">Each field: attempted, matched, hit rate, credits and cost per hit, in the order the fields were requested.</caption>
                    <thead><tr className="border-b text-left text-xs text-muted-foreground">
                      <th scope="col" className="py-2 pr-3 font-medium">Field</th><th scope="col" className="py-2 pr-3 font-medium">Attempted</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Matched</th><th scope="col" className="py-2 pr-3 font-medium">Hit rate</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Credits</th><th scope="col" className="py-2 pr-3 font-medium">Cost per hit</th>
                      <th scope="col" className="py-2 font-medium">Returned by</th>
                    </tr></thead>
                    <tbody>
                      {job.byField.map((f, i) => (
                        <tr key={f.field} className="border-b">
                          <th scope="row" className="py-2 pr-3 text-left font-normal">{f.field}</th>
                          <td className="py-2 pr-3 tabular-nums">{n(job.rows)}</td>
                          <td className="py-2 pr-3 tabular-nums">{n(f.hit)}</td>
                          <td className="py-2 pr-3">{f.hit} of {n(job.rows)} · {pct(job.rows ? f.hit / job.rows : 0)}</td>
                          <td className="py-2 pr-3 tabular-nums">{n(f.hit * f.cost)}</td>
                          <td className="py-2 pr-3 tabular-nums">{f.cost}</td>
                          <td className="py-2">{job.providers[i % job.providers.length]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ),
            },
            {
              id: "charging",
              title: "What was charged and what was not",
              children: (
                <div className="grid gap-2 text-sm">
                  <p>{n(chargedRows)} rows were charged. {n(freeRows)} returned nothing and were free.</p>
                  <p className="text-muted-foreground">
                    {job.charging.note || "Only matched rows are charged. A mobile that returned for a do-not-call number was charged and cannot be called. Nothing here is refunded."}
                  </p>
                </div>
              ),
            },
            ...(unmatchedCount > 0
              ? [{
                  id: "unmatched",
                  title: "Unmatched rows",
                  count: unmatchedCount,
                  action: (
                    <Button size="sm" variant="outline" disabled={dropped} onClick={() => setConfirm({
                      title: `Drop these ${n(unmatchedCount)} from the list?`,
                      body: `Removes ${n(unmatchedCount)} from "${seed.lists[0]?.name ?? "the list"}". The records stay in the workspace, and nothing is refunded.`,
                      label: `Drop ${n(unmatchedCount)} from the list`,
                      run: () => { setDropped(true); toast(`Dropped ${n(unmatchedCount)} rows from ${seed.lists[0]?.name ?? "the list"}`) },
                    })}>
                      {dropped ? "Dropped" : `Drop these ${n(unmatchedCount)} from the list`}
                    </Button>
                  ),
                  children: (
                    <div className="grid gap-3">
                      <ul className="grid gap-1 text-sm">
                        {unmatched.slice(0, 6).map((c) => (
                          <li key={c.id} className="text-muted-foreground">{c.name} · {c.company} · nothing returned · 0 credits</li>
                        ))}
                        {unmatchedCount > unmatched.length && <li className="text-muted-foreground">and {n(unmatchedCount - unmatched.length)} more, in the door at the foot of this page</li>}
                      </ul>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setConfirm({
                          title: "Run the unmatched rows again?",
                          body: `${n(unmatchedCount)} rows, a different provider order: ${[...job.providers].reverse().join(" → ")}. About ${n(rerunCost)} credits, and only rows that return are charged.`,
                          label: `Run ${n(unmatchedCount)} again · about ${n(rerunCost)} credits`,
                          run: () => toast(`Started a second job on ${n(unmatchedCount)} rows · linked to this one`),
                        })}>
                          Run the unmatched rows again · about {n(rerunCost)} credits
                        </Button>
                        <span className="text-xs text-muted-foreground">With the order reversed: {[...job.providers].reverse().join(" → ")}.</span>
                      </div>
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
                            <div className="text-sm font-medium">{m.name} · {m.jobChange?.previousCompany} → {company?.name ?? "a company ollopA does not hold"}</div>
                            <p className="text-xs text-muted-foreground">Signal fired {day(m.jobChange?.firedOn ?? "")} from {m.jobChange?.source}.</p>
                            <p className="mt-1 text-sm">
                              {company && account
                                ? `${company.name} is already an account · owner ${account.owner} · ${open} open deal${open === 1 ? "" : "s"}`
                                : `${company?.name ?? "The new employer"} is not in the workspace yet.`}
                            </p>
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              <Button size="sm" variant="outline" className="h-auto justify-start whitespace-normal py-2 text-left" onClick={() => toast(`Updated ${m.name} · old employer kept in the history`)}>
                                <span>
                                  <span className="block font-medium">Update this record</span>
                                  <span className="block text-xs text-muted-foreground">One timeline. The old employer stays in the history, and {m.jobChange?.previousEmail} is kept and marked bounced.</span>
                                </span>
                              </Button>
                              <Button size="sm" variant="outline" className="h-auto justify-start whitespace-normal py-2 text-left" onClick={() => toast(`Created a new contact for ${m.name} · linked to the old record`)}>
                                <span>
                                  <span className="block font-medium">Create a new contact</span>
                                  <span className="block text-xs text-muted-foreground">The old record keeps its history and is linked to this one. You choose its stage.</span>
                                </span>
                              </Button>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              The new address is not known yet · verifying one costs {CREDITS.revealEmail} credit{CREDITS.revealEmail === 1 ? "" : "s"}.
                            </p>
                          </div>
                        )
                      })}
                      <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
                        <Button size="sm" onClick={() => setConfirm({
                          title: `Enrol the ${n(movers.length)} movers in "${sequence}"?`,
                          body: `${n(netNew)} of them work somewhere ollopA does not own yet. Verifying ${n(movers.length)} new addresses costs about ${n(movers.length * CREDITS.revealEmail)} credits, and the first step sends on the sequence's own schedule.`,
                          label: `Enrol ${n(movers.length)} · about ${n(movers.length * CREDITS.revealEmail)} credits`,
                          run: () => toast(`Enrolled ${n(movers.length)} movers in ${sequence}`),
                        })}>
                          Enrol the {n(movers.length)} movers in "{sequence}"
                        </Button>
                        <span className="text-xs text-muted-foreground">{n(netNew)} net new companies · about {n(movers.length * CREDITS.revealEmail)} credits.</span>
                      </div>
                    </div>
                  ),
                }]
              : []),
          ],
        }}
        side={[
          {
            id: "where-from",
            title: "Where this job came from",
            children: (
              <div className="grid gap-2 text-sm">
                <p>{SOURCE_WORDS[job.source]}{job.keyId ? ` · ${seed.apiKeys.find((k) => k.id === job.keyId)?.name ?? job.keyId}` : ""}</p>
                {job.keyId && <a className="text-xs underline" href={href("/ollopa/developer/api")}>The key that ran it</a>}
                <p className="text-xs text-muted-foreground">Balance now {n(seed.credits.balance)} · cap {n(seed.credits.monthlyCap)} a month at {b.name}.</p>
              </div>
            ),
          },
          {
            id: "fee",
            title: "The fee, in one line",
            children: <Consequence tone="plain">A row that returned nothing was not charged. A charge for a number that cannot be called is not refunded.</Consequence>,
          },
        ]}
        doors={[{
          id: `job.all-rows.${job.id}`,
          label: `All rows · ${n(job.rows)}`,
          count: job.rows,
          content: (
            <div className="min-w-0 overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse text-xs">
                <caption className="sr-only">Every row in the job, with what came back and what it cost.</caption>
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th scope="col" className="py-1 pr-3 font-medium">Row</th><th scope="col" className="py-1 pr-3 font-medium">Person</th>
                  <th scope="col" className="py-1 pr-3 font-medium">Returned</th><th scope="col" className="py-1 font-medium">Credits</th>
                </tr></thead>
                <tbody>
                  {seed.contacts.slice(0, Math.min(40, job.rows)).map((c, i) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-1 pr-3 tabular-nums">{i + 1}</td>
                      <td className="py-1 pr-3">{c.name} · {c.company}</td>
                      <td className="py-1 pr-3">{c.enrichedOn ? job.fields.join(", ") : "nothing"}</td>
                      <td className="py-1 tabular-nums">{c.enrichedOn ? costPerHit : 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {job.rows > 40 && <p className="pt-2 text-xs text-muted-foreground">The first 40 of {n(job.rows)}. Export the report for all of them.</p>}
            </div>
          ),
        }]}
      />
      <Confirm
        open={!!confirm}
        title={confirm?.title ?? ""}
        body={confirm?.body}
        confirmLabel={confirm?.label ?? "Run it"}
        onConfirm={() => { confirm?.run(); setConfirm(null) }}
        onCancel={() => setConfirm(null)}
      />
    </>
  )
}
