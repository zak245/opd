// W-import: one page imports a file and enriches it, because they are the same act.
//
// Five steps, one spend, and a trial before the spend. Every field carries its typical cost, the stop
// rule and the per-row ceiling are two controls at level one, and the ten-row trial prints the cost per
// hit — the number the next run is designed from. There is no control that skips the trial: an
// accelerator past a rule-7 item is a dark pattern with a keyboard shortcut (spec 18 §3.1, §6.4).
import { useEffect, useMemo, useRef, useState } from "react"
import { Actions, type Action } from "../../ui/Actions"
import { Input } from "@/components/ui/input"
import { navigate, useRoute, href } from "@/app/router"
import { toast } from "../../templates/TablePage"
import { Door } from "../../ui/Door"
import { businessById } from "../../data/businesses"
import { STAGES, seedFor } from "../../data/seed"
import type { Session } from "../../session"
import { day } from "../deal/format"
import { Check, Confirm, Consequence, Picker, Radio, Wizard, inTen, n, pct, type StepState } from "./bits"
import { useDraft } from "./drafts"

const STEPS = ["File and columns", "Duplicates and owner", "Fields and providers", "The ten-row trial", "Run"]

const OLLOPA_FIELDS = ["firstName", "lastName", "email", "title", "company", "phone", "linkedin", "city", "country", ""]
const FIELD_LABELS: Record<string, string> = {
  firstName: "First name", lastName: "Last name", email: "Email", title: "Job title",
  company: "Company", phone: "Phone", linkedin: "LinkedIn", city: "City", country: "Country", "": "Ignore this column",
}

interface ImportState {
  file: string
  rows: number
  uploadedBy: string
  uploadedAt: string
  headers: string[]
  mapping: Record<string, string>
  preview: Record<string, string>[]
  duplicates: "update" | "skip" | "create"
  owner: string
  list: string
  stage: string
  fields: string[]
  order: string[]
  stopAtFirstVerified: boolean
  ceilingPerRow: number
  includeDnc: boolean
  trialDone: boolean
  done: number
  credits: number
  stoppedAt: string | null
  stepsDone: number[]
}

export function ImportWizard({ session }: { session: Session }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const route = useRoute()
  const saved = seed.importDrafts[0]
  const rates = seed.enrichmentRates

  const start: ImportState = useMemo(() => ({
    file: saved?.file ?? "",
    rows: saved?.rows ?? 0,
    uploadedBy: saved?.uploadedBy ?? session.user,
    uploadedAt: saved?.uploadedAt ?? "",
    headers: saved ? Object.keys(saved.mapping) : [],
    mapping: saved ? Object.fromEntries(Object.entries(saved.mapping).map(([k, v]) => [k, v ?? ""])) : {},
    preview: saved?.preview ?? [],
    duplicates: "update",
    owner: saved?.answers.owner ?? session.user,
    list: saved?.answers.list ?? seed.lists[0]?.name ?? "",
    stage: saved?.answers.stage ?? STAGES[0],
    fields: rates.map((r) => r.field),
    order: seed.workspace.waterfall.order,
    stopAtFirstVerified: seed.workspace.waterfall.stopAtFirstVerified,
    ceilingPerRow: seed.workspace.waterfall.ceilingPerRow,
    includeDnc: false,
    trialDone: (saved?.step ?? 0) >= 4,
    done: saved?.progress.done ?? 0,
    credits: saved?.progress.credits ?? 0,
    stoppedAt: saved?.progress.stoppedAt ?? null,
    stepsDone: saved ? Array.from({ length: Math.max(0, saved.step - 1) }, (_, i) => i + 1) : [],
  }), [saved, session.user, seed, rates])

  const [draft, save, drop] = useDraft<ImportState>(`ollopa.import.${session.business}`, start)
  const [discarding, setDiscarding] = useState(false)
  const [running, setRunning] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const asked = Number(route.query.get("step"))
  const firstNotDone = Math.min(5, (STEPS.findIndex((_, i) => !draft.stepsDone.includes(i + 1)) + 1) || 5)
  const current = Math.min(Math.max(asked || firstNotDone, 1), 5)
  const go = (step: number) => navigate(`/ollopa/import?step=${step}`)
  const markDone = (step: number) => save({ stepsDone: [...new Set([...draft.stepsDone, step])] })

  /* The file's overlap with the workspace, computed at render rather than written down: the rows that
     name a company ollopA already holds are the rows a duplicate policy decides about. */
  const client = draft.file.split(/[-_.]/)[0]
  const matchedContacts = seed.contacts.filter((c) => c.company.toLowerCase().replace(/\s/g, "").startsWith(client.toLowerCase().slice(0, 6)))
  const matched = matchedContacts.length
  const othersOwn = matchedContacts.filter((c) => c.owner !== session.user).length
  const dnc = matchedContacts.filter((c) => c.doNotCall).length
  const restricted = matchedContacts.filter((c) => c.restrictedBy).length
  const newRows = Math.max(0, draft.rows - matched)

  const chosen = rates.filter((r) => draft.fields.includes(r.field))
  const trialRows = 10
  const trial = chosen.map((r) => {
    const hits = Math.round(trialRows * r.hitRate)
    return { field: r.field, hits, rate: r.hitRate, credits: hits * r.typicalCost, cost: r.typicalCost }
  })
  const trialCredits = trial.reduce((s, t) => s + t.credits, 0)
  const projected = chosen.reduce((s, r) => s + Math.round(draft.rows * r.hitRate) * r.typicalCost, 0)
  const remaining = Math.max(0, draft.rows - trialRows)
  const balanceAfter = seed.credits.balance - projected

  const readFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? "")
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
      const headers = (lines[0] ?? "").split(",").map((h) => h.trim())
      const rows = lines.slice(1).map((l) => l.split(",").map((c) => c.trim()))
      const preview = rows.slice(0, 3).map((cells) => Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""])))
      save({
        file: file.name, rows: rows.length, uploadedBy: session.user, uploadedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        headers, preview,
        mapping: Object.fromEntries(headers.map((h) => [h, OLLOPA_FIELDS.find((f) => f && FIELD_LABELS[f].toLowerCase() === h.toLowerCase()) ?? ""])),
        stepsDone: [1],
      })
      toast(`${file.name} read · ${n(rows.length)} rows, ${headers.length} columns`)
    }
    reader.readAsText(file)
  }

  useEffect(() => () => window.clearInterval(timer.current), [])

  const startRun = () => {
    setRunning(true)
    save({ stoppedAt: null })
    timer.current = window.setInterval(() => {
      const next = Math.min(draft.rows, (draft.done || 0) + Math.ceil(draft.rows / 20))
      const spent = Math.round(projected * (next / Math.max(1, draft.rows)))
      save({ done: next, credits: spent })
      if (next >= draft.rows) {
        window.clearInterval(timer.current)
        setRunning(false)
        save({ stepsDone: [1, 2, 3, 4, 5] })
      }
    }, 500)
  }

  const stopRun = () => {
    window.clearInterval(timer.current)
    setRunning(false)
    save({ stoppedAt: new Date().toISOString().slice(11, 16) })
    toast(`Stopped at row ${n(draft.done)} · ${n(draft.credits)} credits spent and kept`)
  }

  const steps: StepState[] = STEPS.map((name, i) => ({
    n: i + 1,
    name,
    summary: [
      draft.file ? `${draft.file} · ${n(draft.rows)} rows` : "",
      `${draft.duplicates === "update" ? "Update existing" : draft.duplicates === "skip" ? "Skip duplicates" : "Create anyway"} · owner ${draft.owner}`,
      `${draft.fields.length} fields · ${draft.order.join(" → ")}`,
      draft.trialDone ? `${n(trialCredits)} credits on 10 rows` : "",
      draft.done ? `${n(draft.done)} of ${n(draft.rows)} rows` : "",
    ][i] || undefined,
    done: draft.stepsDone.includes(i + 1),
    blocked: i + 1 > 1 && !draft.file ? "Upload a file first" : undefined,
  }))

  /* The do-not-call line sits beside the spend, because the flag and the money are one decision (rule
     5) and the charge is not refunded (rule 7). The share is this workspace's own, and the sentence
     says so rather than presenting a projection as a count. */
  const dncRate = seed.contacts.length ? seed.contacts.filter((c) => c.doNotCall).length / seed.contacts.length : 0
  const dncRows = Math.round(draft.rows * dncRate)
  const mobileCost = rates.find((r) => r.field === "Mobile")?.typicalCost ?? 9
  const dncLine = draft.fields.includes("Mobile") ? (
    <div className="grid gap-1 rounded-md border border-[color:var(--warning)] p-3 ">
      <Consequence>
        About {n(dncRows)} of the {n(draft.rows)} rows will be numbers you cannot call: {pct(dncRate)} of the people in this workspace carry a do-not-call flag{matched > 0 ? `, and ${n(dnc)} of the ${n(matched)} rows ollopA already holds carry one today` : ""}. A mobile for those is charged and cannot be called, and it is not refunded.
      </Consequence>
      <Check
        checked={draft.includeDnc}
        onChange={() => save({ includeDnc: !draft.includeDnc })}
        label={`They are excluded — include them anyway (about ${n(dncRows)} rows, about ${n(dncRows * mobileCost)} credits)`}
      />
    </div>
  ) : null

  /** One primary per step — the step's own way on — and a line beside it only where it spends. */
  const stepActions = (): Action[] => {
    const acts: Action[] = []
    switch (current) {
      case 1: acts.push({ kind: "primary", label: "Continue to duplicates", onClick: () => { markDone(1); go(2) }, disabledBecause: draft.file ? undefined : "Choose a CSV file above" }); break
      case 2: acts.push({ kind: "primary", label: "Continue to fields and providers", onClick: () => { markDone(2); go(3) } }); break
      case 3: acts.push({ kind: "primary", label: "Continue to the trial", onClick: () => { markDone(3); go(4) } }); break
      case 4: acts.push(draft.trialDone
        ? { kind: "primary", label: `Run the other ${n(remaining)}`, onClick: () => { markDone(4); go(5) } }
        : {
          kind: "primary", label: "Run the ten-row trial", cost: `about ${n(trialCredits)} credits`,
          onClick: () => { save({ trialDone: true, credits: trialCredits, done: trialRows }); toast(`Trial done · ${n(trialCredits)} credits on 10 rows`) },
        }); break
      default: acts.push(running
        ? { kind: "secondary", label: "Stop the run", onClick: stopRun }
        : draft.done >= draft.rows && draft.rows > 0
          ? { kind: "primary", label: "Open the job report", onClick: () => navigate("/ollopa/enrichment/local-import") }
          : draft.done > trialRows
            ? { kind: "primary", label: `Continue from row ${n(draft.done)}`, onClick: startRun, cost: `about ${n(projected - trialCredits)} credits` }
            : { kind: "primary", label: `Run the other ${n(remaining)} rows`, onClick: startRun, cost: `about ${n(projected - trialCredits)} credits` })
    }
    if (current > 1) acts.push({ kind: "link", label: `Back to ${STEPS[current - 2].toLowerCase()}`, href: `#/ollopa/import?step=${current - 1}`, onClick: () => go(current - 1) })
    if (current === 4 && draft.trialDone) acts.push({ kind: "link", label: "Change the fields or the providers", href: "#/ollopa/import?step=3", onClick: () => go(3) })
    if (draft.file) acts.push({ kind: "destructive", label: "Discard this import", onClick: () => setDiscarding(true) })
    return acts
  }

  return (
    <>
      <Wizard
        steps={steps}
        current={current}
        go={go}
        constantLine="The ten rows of the trial are charged."
        onSaveAndExit={() => { toast(`Saved · Import ${draft.stepsDone.length} of 5 steps done`); navigate("/ollopa/people") }}
        footer={<Actions surface="page" items={stepActions()} />}
      >
        {/* ------------------------------------------------------------------ step 1 */}
        {current === 1 && (
          <>
            {!draft.file && (
              <section className="rounded-lg border p-4">
                <h3 className="t-body font-medium">Choose a CSV file</h3>
                <p className="mt-1 t-body text-muted-foreground">
                  Enrichment is charged when a source returns data. A row that returns nothing is free.
                </p>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="mt-3 block t-body"
                  aria-label="Choose a CSV file"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f) }}
                />
                <p className="mt-2 t-small text-muted-foreground">CSV, comma separated, with a header row. Your balance is {n(seed.credits.balance)} credits.</p>
              </section>
            )}

            {draft.file && (
              <>
                <section className="rounded-lg border p-3 t-body">
                  <div className="font-medium">{draft.file}</div>
                  <div className="t-small text-muted-foreground">
                    {n(draft.rows)} rows · {draft.headers.length} columns · uploaded by {draft.uploadedBy}{draft.uploadedAt ? ` on ${day(draft.uploadedAt)}` : ""}
                  </div>
                </section>

                {seed.importMappings.length > 0 && (
                  <section className="flex flex-wrap items-end gap-3">
                    <Picker
                      label={`Use a saved mapping (${seed.importMappings.length})`}
                      value=""
                      options={["", ...seed.importMappings.map((m) => `${m.name} · ${m.workspace}`)]}
                      onChange={(v) => {
                        const m = seed.importMappings.find((x) => `${x.name} · ${x.workspace}` === v)
                        if (!m) return
                        save({ mapping: { ...draft.mapping, ...Object.fromEntries(Object.entries(m.mapping).map(([k, val]) => [k, val ?? ""])) } })
                        toast(`Applied the saved mapping · ${m.name}`)
                      }}
                    />
                    <Actions surface="card" items={[{ kind: "secondary", label: "Save this mapping", onClick: () => toast(`Saved this mapping for ${seed.importMappings[0].workspace}`) }]} />
                  </section>
                )}

                <section>
                  <h3 className="t-body font-medium">Each column, and the field it becomes</h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {draft.headers.map((h) => (
                      <Picker
                        key={h}
                        label={h}
                        value={FIELD_LABELS[draft.mapping[h] ?? ""] ?? "Ignore this column"}
                        options={OLLOPA_FIELDS.map((f) => FIELD_LABELS[f])}
                        onChange={(label) => save({ mapping: { ...draft.mapping, [h]: OLLOPA_FIELDS.find((f) => FIELD_LABELS[f] === label) ?? "" } })}
                      />
                    ))}
                  </div>
                  {draft.preview.length > 0 && (
                    <>
                    <p className="mt-3 t-small text-muted-foreground">The first {draft.preview.length} rows, as the mapping above reads them.</p>
                    <div className="mt-1 min-w-0 overflow-x-auto">
                      <table className="w-full min-w-[34rem] border-collapse t-small">
                        <caption className="sr-only">The first {draft.preview.length} rows of the file, as the mapping above reads them.</caption>
                        <thead><tr className="border-b text-left text-muted-foreground">
                          {draft.headers.map((h) => <th scope="col" key={h} className="py-1 pr-3 font-medium">{h} → {FIELD_LABELS[draft.mapping[h] ?? ""]}</th>)}
                        </tr></thead>
                        <tbody>
                          {draft.preview.map((row, i) => (
                            <tr key={i} className="border-b">{draft.headers.map((h) => <td key={h} className="py-1 pr-3">{row[h] ?? ""}</td>)}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </>
                  )}
                </section>

                <Door id={`import.formatting.${session.business}`} label="Formatting: encoding, delimiter, date format, phone country" count={4}>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Picker label="Encoding" value="UTF-8" options={["UTF-8", "Windows-1252", "ISO-8859-1"]} onChange={() => toast("Saved · encoding")} />
                    <Picker label="Delimiter" value="Comma" options={["Comma", "Semicolon", "Tab"]} onChange={() => toast("Saved · delimiter")} />
                    <Picker label="Date format" value="Day first (31/12/2026)" options={["Day first (31/12/2026)", "Month first (12/31/2026)", "ISO (2026-12-31)"]} onChange={() => toast("Saved · date format")} />
                    <Picker label="Phone country" value={b.name.includes("Halyard") ? "United Kingdom (+44)" : "United States (+1)"} options={["United States (+1)", "United Kingdom (+44)", "Germany (+49)"]} onChange={() => toast("Saved · phone country")} />
                  </div>
                </Door>
              </>
            )}
          </>
        )}

        {/* ------------------------------------------------------------------ step 2 */}
        {current === 2 && (
          <>
            <fieldset>
              <legend className="t-body font-medium">{n(matched)} of the {n(draft.rows)} rows are already in ollopA</legend>
              <div className="mt-2 grid gap-2">
                <Radio name="dup" checked={draft.duplicates === "update"} onChange={() => save({ duplicates: "update" })}
                  label="Update existing"
                  hint={`Changes fields on ${n(matched)} records. ${n(othersOwn)} of them are owned by someone else; their owner does not change.`} />
                <Radio name="dup" checked={draft.duplicates === "skip"} onChange={() => save({ duplicates: "skip" })}
                  label="Skip"
                  hint={`Leaves ${n(matched)} records as they are. ${n(newRows)} new rows are imported.`} />
                <Radio name="dup" checked={draft.duplicates === "create"} onChange={() => save({ duplicates: "create" })}
                  label="Create anyway"
                  hint={`Creates ${n(matched)} second records. Your duplicate rule says "prompt", so this is the one place it is overridden.`} />
              </div>
              <p className="mt-2 t-small text-muted-foreground">
                Workspace rule: prompt on duplicate · <a className="underline" href={href("/ollopa/settings/prospecting")}>Settings › Prospecting rules</a>
              </p>
            </fieldset>

            <fieldset>
              <legend className="t-body font-medium">What the new rows get</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <Picker label="Owner" value={draft.owner} options={b.roles.map((r) => r.user)} onChange={(v) => save({ owner: v })} />
                <Picker label="List" value={draft.list} options={seed.lists.map((l) => l.name)} onChange={(v) => save({ list: v })} />
                <Picker label="Stage" value={draft.stage} options={[...STAGES]} onChange={(v) => save({ stage: v })} />
              </div>
            </fieldset>

            {restricted > 0 && (
              <p className="t-body">
                {n(restricted)} of the matched people are restricted: EU region rule · <a className="underline" href={href("/ollopa/settings/prospecting")}>Prospecting rules</a>. They keep their rows and their place in the count; the rule replaces the action.
              </p>
            )}
          </>
        )}

        {/* ------------------------------------------------------------------ step 3 */}
        {current === 3 && (
          <>
            <fieldset>
              <legend className="t-body font-medium">Which fields enrichment may fill</legend>
              <div className="mt-2 grid gap-1 sm:grid-cols-2">
                {rates.map((r) => (
                  <Check
                    key={r.field}
                    checked={draft.fields.includes(r.field)}
                    onChange={() => save({ fields: draft.fields.includes(r.field) ? draft.fields.filter((f) => f !== r.field) : [...draft.fields, r.field] })}
                    label={`${r.field} · about ${r.typicalCost} credits a hit`}
                    hint={`Lands on ${inTen(r.hitRate)} rows here (${pct(r.hitRate)}).`}
                  />
                ))}
              </div>
            </fieldset>

            <section>
              <h3 className="t-body font-medium">The provider lineup, in order</h3>
              <p className="mt-1 t-body">{draft.order.join(" → ")}</p>
              <p className="mt-1 t-small text-muted-foreground">
                Workspace default: {seed.workspace.waterfall.order.join(" → ")} · <a className="underline" href={href("/ollopa/settings/pipeline")}>Settings › Pipeline and data › Enrichment provider order</a>. Change it for this run only.
              </p>
              <Actions className="mt-2" surface="card" items={draft.order.map((p, i) => ({
                kind: "secondary" as const,
                label: `Move ${p} up`,
                onClick: () => { const next = [...draft.order]; const [x] = next.splice(i, 1); next.splice(i - 1, 0, x); save({ order: next }); toast("For this run only. The workspace default is unchanged.") },
                disabledBecause: i === 0 ? "Already first" : undefined,
              }))} />
            </section>

            <fieldset>
              <legend className="t-body font-medium">What this run may spend</legend>
              <div className="mt-2 grid gap-2">
                <Radio name="stop" checked={draft.stopAtFirstVerified} onChange={() => save({ stopAtFirstVerified: true })}
                  label="Stop at the first verified result" hint="One source answers and the row is done." />
                <Radio name="stop" checked={!draft.stopAtFirstVerified} onChange={() => save({ stopAtFirstVerified: false })}
                  label="Continue down the waterfall" hint="Every provider is asked. On a phone waterfall that is the difference between 8 credits and 45." />
                <label className="block max-w-xs t-body">
                  <span className="t-small text-muted-foreground">The most this run may spend on one row</span>
                  <Input className="mt-1" type="number" min={1} value={draft.ceilingPerRow} onChange={(e) => save({ ceilingPerRow: Number(e.target.value) || 1 })} />
                </label>
              </div>
            </fieldset>

            <Door id={`import.providers.${session.business}`} label="Per-provider settings" count={draft.order.length}>
              <ul className="grid gap-1 t-body">
                {draft.order.map((p) => (
                  <li key={p} className="text-muted-foreground">{p} · uses the workspace key · retries once · skips rows already verified in the last 90 days</li>
                ))}
              </ul>
            </Door>
          </>
        )}

        {/* ------------------------------------------------------------------ step 4 */}
        {current === 4 && (
          <>
            {!draft.trialDone ? (
              <p className="t-body">
                Ten rows are run and charged, and the table prints what they cost per useful result. The other {n(remaining)} rows are not touched until you say so.
              </p>
            ) : (
              <>
                <p className="t-small text-muted-foreground">Ten rows, charged: {n(trialCredits)} credits.</p>
                <div className="min-w-0 overflow-x-auto">
                  <table className="w-full min-w-[34rem] border-collapse t-body">
                    <caption className="sr-only">The ten rows of the trial: the hit rate, the credits spent and the cost per hit for each field.</caption>
                    <thead><tr className="border-b text-left t-small text-muted-foreground">
                      <th scope="col" className="py-2 pr-3 font-medium">Field</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Hit rate</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Credits spent</th>
                      <th scope="col" className="py-2 font-medium">Cost per hit</th>
                    </tr></thead>
                    <tbody>
                      {trial.map((t) => (
                        <tr key={t.field} className="border-b">
                          <th scope="row" className="py-2 pr-3 text-left font-normal">{t.field}</th>
                          <td className="py-2 pr-3">{t.hits} of 10 · {pct(t.rate)}</td>
                          <td className="py-2 pr-3 tabular-nums">{n(t.credits)}</td>
                          <td className="py-2 tabular-nums">{t.hits ? n(Math.round(t.credits / t.hits)) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <section className="grid gap-2 rounded-lg border bg-muted/40 p-4">
                  <p className="t-body">
                    At this rate, {n(draft.rows)} rows will cost about {n(projected)} credits — {n(balanceAfter)} of your balance after this run.
                    {chosen.map((r) => ` ${r.field} lands on ${inTen(r.hitRate)}.`).join("")}
                  </p>
                  {balanceAfter < 0 && (
                    <Consequence>
                      That is {n(-balanceAfter)} more than the balance. The run stops at the cap, keeps what is done and says where it stopped.
                    </Consequence>
                  )}
                  {dncLine}
                  <p className="t-small text-muted-foreground">
                    A row that returns nothing is not charged. A mobile that returns for a do-not-call number is charged and cannot be called. Nothing here is refunded.
                  </p>
                </section>
              </>
            )}
          </>
        )}

        {/* ------------------------------------------------------------------ step 5 */}
        {current === 5 && (
          <section className="grid gap-3">
            <div role="status" aria-live="polite" className="rounded-lg border p-4">
              <p className="t-body font-medium">
                {n(draft.done)} of {n(draft.rows)} rows · {n(draft.credits)} credits spent
              </p>
              <p className="mt-1 t-body text-muted-foreground">
                {running ? "Running." : draft.stoppedAt ? `Stopped at ${draft.stoppedAt}. What is done is kept.` : draft.done >= draft.rows && draft.rows > 0 ? "Finished." : "Not started."}
                {" "}You can close this tab. The run continues and you will find it under Past imports.
              </p>
              <p className="mt-2 t-small text-muted-foreground">
                A row that hits the {draft.ceilingPerRow}-credit ceiling stops there, is marked, and the run carries on; the job report counts them.
                At the monthly cap the run stops and says so: {n(seed.credits.monthlyCap)} a month, resets {day(seed.credits.cycleEnds)}.
              </p>
            </div>
          </section>
        )}
      </Wizard>

      <Confirm
        open={discarding}
        title="Discard this import?"
        body={
          <>
            <p>{draft.file} goes, with the column mapping, the duplicate choice and the provider order on it.</p>
            <p className="mt-2">{draft.credits > 0 ? `${n(draft.credits)} credits already spent are not refunded, and the ${n(draft.done)} rows already enriched stay in ollopA.` : "Nothing has been charged yet."}</p>
          </>
        }
        confirmLabel="Discard the import"
        onConfirm={() => { drop(); setDiscarding(false); toast("Import discarded"); navigate("/ollopa/people") }}
        onCancel={() => setDiscarding(false)}
      />
    </>
  )
}
