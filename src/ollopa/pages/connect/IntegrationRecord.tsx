// R-integration: where a connection lives for the rest of its life.
//
// Status, errors and the destructive controls are on the surface; what syncs, the mapping, the rules,
// the authorisation and the history are five doors, each with a summary line that says what is inside
// before it opens. Everything the wizard asked can be changed here, in place — the wizard is for the
// first connection and nothing else (spec 15 §3.2).
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { href, navigate, useRoute } from "@/app/router"
import { toast } from "../../templates/TablePage"
import type { RecordDoor } from "../../templates/RecordPage"
import { Door, DoorGroup } from "../../ui/Door"
import { businessById } from "../../data/businesses"
import { TODAY, seedFor, type Integration, type IntegrationError } from "../../data/seed"
import type { Session } from "../../session"
import { ago, day } from "../deal/format"
import { Confirm, ExpandDoors, Picker, n } from "./bits"
import { useDraft } from "./drafts"
import { MapStep, RulesStep, SyncStep } from "./ConnectWizard"
import { KINDS, crmFieldsFor, draftKey, startingDraft, type ConnectDraft, type ObjectName } from "./connectData"

/** The rows the error table is read as: one per cause, largest first (spec 15 §3.2). */
interface ErrorGroup { cause: string; fix: string; rows: IntegrationError[] }

function groupByCause(rows: IntegrationError[]): ErrorGroup[] {
  const map = new Map<string, ErrorGroup>()
  for (const row of rows) {
    const held = map.get(row.groupKey)
    if (held) held.rows.push(row)
    else map.set(row.groupKey, { cause: row.message, fix: row.fix, rows: [row] })
  }
  return [...map.values()].sort((a, b) => b.rows.length - a.rows.length)
}

const WINDOWS = ["Last 7 days", "Today", "Every error held"]

export function IntegrationRecord({ session, id }: { session: Session; id?: string }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const route = useRoute()
  const justStarted = route.query.get("started")

  const live: Integration | undefined = seed.integrations.find((i) => i.id === id)
  const slug = live ? (KINDS.find((k) => k.kind === live.kind)?.slug ?? live.kind.toLowerCase()) : (id ?? "").replace(/^draft-/, "")
  const start = useMemo(() => startingDraft(session.business, slug, session.user), [session.business, session.user, slug])
  const [draft, save] = useDraft<ConnectDraft>(draftKey(session.business, slug), start)
  const [local, saveLocal] = useDraft(`ollopa.integration.${session.business}.${id}`, {
    paused: live?.status === "paused",
    pausedBy: live?.pausedBy ?? "",
    pausedOn: "",
    retried: [] as string[],
  })

  const kind = live?.kind ?? draft.kind
  const isCrm = KINDS.find((k) => k.kind === kind)?.crm ?? false
  // Spec 15 §3.6: a non-admin seat reads a workspace integration's page but changes nothing on it.
  const readOnly = session.role !== "admin" && KINDS.find((k) => k.kind === kind)?.group !== "Calendar"
  const admin = b.roles.find((r) => r.role === "admin")
  const [windowPick, setWindowPick] = useState(WINDOWS[0])
  const [objectPick, setObjectPick] = useState("Every object")
  const [retrying, setRetrying] = useState<string[]>([])
  const [disconnecting, setDisconnecting] = useState(false)
  const [confirm, setConfirm] = useState<null | { title: string; body: string; label: string; run: () => void }>(null)

  if (!live && draft.seededFrom === "nothing" && !draft.started) {
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <a href={href("/ollopa/settings/integrations")} className="text-sm text-muted-foreground hover:underline">Settings › Integrations</a>
        <h2 className="mt-6 text-lg font-semibold">This integration is not connected</h2>
        <p className="mt-2 text-sm text-muted-foreground">Nothing has been set up under this address. Connect one and it gets its own page here.</p>
        <Button className="mt-5" onClick={() => navigate("/ollopa/connect/new?step=1")}>Connect an integration</Button>
      </div>
    )
  }

  const allErrors = seed.integrationErrors.filter((e) => e.integrationId === id && !local.retried.includes(e.id))
  const windowed = allErrors.filter((e) => (windowPick === "Today" ? e.at.slice(0, 10) === TODAY : true))
  const filtered = windowed.filter((e) => objectPick === "Every object" || e.object === objectPick)
  const groups = groupByCause(filtered)
  const objectNames = ["Every object", ...new Set(allErrors.map((e) => e.object))]

  const runs = seed.syncRuns.filter((r) => r.integrationId === id)
  const lastFailed = runs.filter((r) => r.failed > 0).sort((a, b) => (a.started < b.started ? 1 : -1))[0]

  const paused = local.paused
  const status = paused ? "Paused" : allErrors.length > 0 ? "Needs attention" : draft.started === "paused" ? "Connected, not syncing" : "Syncing"

  const retryGroup = (group: ErrorGroup) => {
    const ids = group.rows.map((r) => r.id)
    setRetrying((r) => [...r, ...ids])
    window.setTimeout(() => {
      setRetrying((r) => r.filter((x) => !ids.includes(x)))
      saveLocal({ retried: [...local.retried, ...ids] })
    }, 700)
  }

  const mappingSummary = (() => {
    const per = (o: ObjectName) => draft.pairs.filter((p) => p.object === o).length
    const suggested = draft.pairs.filter((p) => p.state === "suggested").length
    const required = isCrm
      ? crmFieldsFor(seed, kind, "Contacts").filter((f) => f.required && !draft.pairs.some((p) => p.remote === f.name)).length
      : 0
    return `${per("Contacts")} contact, ${per("Companies")} company, ${per("Deals")} deal fields · ${suggested} suggested · ${required} required ${kind} field${required === 1 ? "" : "s"} unmapped`
  })()

  const doors: RecordDoor[] = []
  if (isCrm) {
    doors.push({
      id: `int.what-syncs.${id}`,
      label: `What syncs — ${draft.objects.map((o) => `${o.object} ${o.direction === "both" ? "both ways" : o.direction === "off" ? "off" : `${o.direction} only`}`).join(" · ")}`,
      content: (
        <div className="grid gap-3">
          <SyncStep session={session} draft={draft} save={save} />
          <div><Button size="sm" onClick={() => toast("Saved · What syncs. It takes effect on the next run.")}>Save what syncs</Button></div>
        </div>
      ),
    })
    doors.push({
      id: `int.mapping.${id}`,
      label: `Field mapping — ${mappingSummary}`,
      content: (
        <div className="grid gap-3">
          <MapStep session={session} draft={draft} save={save} />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => toast("Saved · Field mapping. Applies to records created or changed from now on.")}>Save the mapping</Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirm({
                title: "Apply the mapping to existing records?",
                body: `Rewrites the mapped fields on ${n(b.counts.contacts)} contacts and ${n(b.counts.companies)} companies in ollopA and in ${kind}. It runs as one pass and appears in the sync history.`,
                label: `Apply to ${n(b.counts.contacts + b.counts.companies)} records`,
                run: () => toast(`Applying the mapping to ${n(b.counts.contacts + b.counts.companies)} records · it will appear in the sync history`),
              })}
            >
              Apply mapping to existing records
            </Button>
            <span className="text-xs text-muted-foreground">Saved changes otherwise reach new and changed records only.</span>
          </div>
        </div>
      ),
    })
    doors.push({
      id: `int.rules.${id}`,
      label: `Sync rules — Pull: ${draft.pullAll ? "every record" : draft.pullConditions.map((c) => `${c.field.toLowerCase()} ${c.op} ${c.value}`).join(", ")} · Push: ${draft.pushAll ? "every record" : draft.pushConditions.map((c) => `${c.field.toLowerCase()} ${c.op} ${c.value}`).join(", ")} · Deletions ${draft.onCrmDelete} · Merges ${draft.onCrmMerge === "mirror" ? "mirrored" : "ignored"}`,
      content: (
        <div className="grid gap-3">
          <RulesStep draft={draft} save={save} />
          <div><Button size="sm" onClick={() => toast("Saved · Sync rules. They apply from the next run.")}>Save the sync rules</Button></div>
        </div>
      ),
    })
  }
  doors.push({
    id: `int.auth.${id}`,
    label: `Authorisation — connected as ${draft.authUser || live?.auth?.user || "nobody yet"}${(live?.auth?.validUntil ?? draft.validUntil) ? ` · valid until ${day(live?.auth?.validUntil ?? draft.validUntil)}` : ""}`,
    content: (
      <div className="grid gap-3 text-sm">
        <div>Sync user: {draft.authUser || live?.auth?.user || "—"}</div>
        {kind === "Salesforce" && <div>Environment: {draft.environment}</div>}
        <div>Token: {(live?.auth?.validUntil ?? draft.validUntil) ? `valid until ${day(live?.auth?.validUntil ?? draft.validUntil)}` : `valid until it is revoked in ${kind}`}</div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => toast(`Re-authorised ${kind} as ${draft.authUser || live?.auth?.user}`)}>Re-authorise</Button>
          <Button size="sm" variant="outline" onClick={() => toast("Sign in as the new sync user to change it")}>Change sync user</Button>
        </div>
      </div>
    ),
  })
  doors.push({
    id: `int.history.${id}`,
    label: `Sync history — ${runs.length} runs${lastFailed ? ` · last failed run ${ago(lastFailed.started)}` : " · none failed"}`,
    count: runs.length,
    content: (
      <div className="grid gap-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setConfirm({ title: `Pull now from ${kind}?`, body: `Reads about ${n(live?.remoteCounts.Contacts ?? b.counts.contacts)} contacts and ${n(live?.remoteCounts.Companies ?? b.counts.companies)} companies and updates what has changed.`, label: "Pull now", run: () => toast("Pull started · it appears in the sync history") })}>Pull now</Button>
          <Button size="sm" variant="outline" onClick={() => setConfirm({ title: `Push now to ${kind}?`, body: `Writes ${n(b.counts.contacts)} contacts and ${n(b.counts.companies)} companies that match your push rule.`, label: "Push now", run: () => toast("Push started · it appears in the sync history") })}>Push now</Button>
        </div>
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">The last {runs.length} sync runs, newest first.</caption>
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th scope="col" className="py-1 pr-3 font-medium">Started</th><th scope="col" className="py-1 pr-3 font-medium">Object</th>
              <th scope="col" className="py-1 pr-3 font-medium">Direction</th><th scope="col" className="py-1 pr-3 font-medium">Pulled</th>
              <th scope="col" className="py-1 pr-3 font-medium">Pushed</th><th scope="col" className="py-1 font-medium">Failed</th>
            </tr></thead>
            <tbody>
              {runs.slice(0, 12).map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-1 pr-3">{day(r.started)} {r.started.slice(11)}</td>
                  <td className="py-1 pr-3">{r.object}</td><td className="py-1 pr-3">{r.direction}</td>
                  <td className="py-1 pr-3 tabular-nums">{n(r.pulled)}</td><td className="py-1 pr-3 tabular-nums">{n(r.pushed)}</td>
                  <td className="py-1 tabular-nums">{r.failed ? n(r.failed) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  })

  const disconnectConsequence = `Stops syncing. Records already in ${kind} stay. Records pulled into ollopA stay and lose their link.`

  const doorIds = doors.map((d) => d.id)
  const ribbon = justStarted
    ? justStarted === "paused"
      ? `${kind} is connected and paused. Nothing syncs until you press Resume syncing.`
      : `${kind} is syncing. First sync started ${live?.lastSync.slice(11) ?? "just now"}, usually done within 30 minutes.`
    : paused
      ? `Paused by ${local.pausedBy || session.user}${local.pausedOn ? ` on ${day(local.pausedOn)}` : ""}. Nothing syncs and nothing is lost; Resume picks up where it stopped.`
      : null

  return (
    <>
      {/* A disabled fieldset makes every control on the page read-only at once, so a seat that may
          read the CRM's page cannot change it by any route, and the sentence above names who can. */}
      <fieldset disabled={readOnly} className="flex min-h-full min-w-0 flex-col border-0 p-0">
        {readOnly && (
          <div role="note" className="border-b bg-muted/40 px-5 py-2 text-sm lg:px-6">
            You can read this page. Changes to {kind} are made by {admin ? `${admin.user} (${admin.title})` : "the admin"}.
          </div>
        )}
        <header className="border-b px-5 pt-4 lg:px-6">
          <a href={href("/ollopa/settings/integrations")} className="text-xs text-muted-foreground hover:underline">← Settings › Integrations</a>
          <div className="mt-2 flex flex-wrap items-start gap-x-4 gap-y-2">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">{live?.name ?? `${kind}${kind === "Salesforce" ? ` (${draft.environment})` : ""}`}</h2>
              <p className="text-sm text-muted-foreground">{kind}{live?.environment ? ` · ${live.environment}` : ""}</p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2" data-print-hide>
              <Button size="sm" onClick={() => { saveLocal({ paused: !paused, pausedBy: session.user, pausedOn: TODAY }); toast(paused ? `${kind} is syncing again` : `${kind} paused by ${session.user}`) }}>
                {paused ? "Resume syncing" : "Pause syncing"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirm({ title: `Pull now from ${kind}?`, body: `Reads about ${n(live?.remoteCounts.Contacts ?? b.counts.contacts)} contacts and ${n(live?.remoteCounts.Companies ?? b.counts.companies)} companies and updates what has changed.`, label: "Pull now", run: () => toast("Pull started · it appears in the sync history") })}>Pull now</Button>
              <Button size="sm" variant="outline" onClick={() => setConfirm({ title: `Push now to ${kind}?`, body: `Writes ${n(b.counts.contacts)} contacts and ${n(b.counts.companies)} companies that match your push rule.`, label: "Push now", run: () => toast("Push started · it appears in the sync history") })}>Push now</Button>
              <Button size="sm" variant="outline" onClick={() => navigate(`/ollopa/connect/${slug}?step=1`)}>Re-run setup</Button>
              {disconnecting ? (
                <span className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/40 px-2 py-1">
                  <span className="text-xs text-destructive">{disconnectConsequence}</span>
                  <Button size="sm" variant="destructive" onClick={() => { toast(`${kind} disconnected · ${disconnectConsequence}`); navigate("/ollopa/settings/integrations") }}>Disconnect {kind}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDisconnecting(false)}>Keep it</Button>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDisconnecting(true)}>Disconnect {kind}</Button>
                  <span className="max-w-[22rem] text-xs text-muted-foreground">{disconnectConsequence}</span>
                </span>
              )}
            </div>
          </div>

          {ribbon && (
            <div role="status" aria-live="polite" className="mt-3 rounded-md bg-muted px-3 py-2 text-sm">{ribbon}</div>
          )}

          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 pb-4 sm:grid-cols-3 xl:grid-cols-5">
            {[
              { label: "Status", value: status },
              { label: "Last sync", value: live ? `${day(live.lastSync)} ${live.lastSync.slice(11)}` : "not yet" },
              { label: "Next sync", value: paused ? "—, while paused" : live ? `every ${live.pollMinutes} minutes` : "every 15 minutes" },
              { label: "Records synced today", value: n(live?.recordsToday ?? 0) },
              { label: "Errors today", value: n(live?.errorsToday ?? 0) },
            ].map((f) => (
              <div key={f.label} className="min-w-0">
                <dt className="text-xs text-muted-foreground">{f.label}</dt>
                <dd className="mt-0.5 text-sm">{f.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <DoorGroup>
          <div className="grid max-w-5xl gap-8 px-5 py-6 lg:px-6">
            <section>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{groups.length ? `Errors, grouped by cause · ${filtered.length}` : "Errors"}</h3>
                {groups.length > 0 && <Button size="sm" variant="outline" onClick={() => toast(`Exported ${filtered.length} error rows as CSV`)}>Export as CSV</Button>}
              </div>
              {groups.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No errors held. When one happens it appears here, grouped by cause, with the fix printed in the row.</p>
              ) : (
                <div className="mt-3 grid gap-3">
                  <div className="grid gap-2 sm:grid-cols-[14rem_14rem_1fr]">
                    <Picker label="When" value={windowPick} options={WINDOWS} onChange={setWindowPick} />
                    <Picker label="Object" value={objectPick} options={objectNames} onChange={setObjectPick} />
                    <div className="flex items-end">
                      <Button size="sm" variant="outline" onClick={() => groups.forEach(retryGroup)}>
                        Retry all {filtered.length} · 100 at a time, {Math.max(1, Math.ceil(filtered.length / 100))} pass{Math.ceil(filtered.length / 100) === 1 ? "" : "es"}
                      </Button>
                    </div>
                  </div>

                  {groups.map((group) => {
                    const busy = group.rows.some((r) => retrying.includes(r.id))
                    return (
                      <div key={group.cause} className="rounded-lg border p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{group.cause} · {group.rows.length}</p>
                            <p className="text-xs text-muted-foreground">Fix: {group.fix}</p>
                          </div>
                          <Button size="sm" variant="outline" disabled={busy} onClick={() => retryGroup(group)}>
                            {busy ? "Retrying…" : `Retry these ${group.rows.length} · 100 at a time, ${Math.max(1, Math.ceil(group.rows.length / 100))} pass${Math.ceil(group.rows.length / 100) === 1 ? "" : "es"}`}
                          </Button>
                        </div>
                        <div className="mt-2 border-t">
                          <Door id={`int.error.${id}.${group.cause.slice(0, 24)}`} label={`The ${group.rows.length} records this happened to`} count={group.rows.length}>
                            <div className="min-w-0 overflow-x-auto">
                              <table className="w-full min-w-[40rem] border-collapse text-xs">
                                <caption className="sr-only">{group.cause}: the records it happened to, with the message, the fix and the number of attempts.</caption>
                                <thead><tr className="border-b text-left text-muted-foreground">
                                  <th scope="col" className="py-1 pr-3 font-medium">When</th><th scope="col" className="py-1 pr-3 font-medium">Object</th>
                                  <th scope="col" className="py-1 pr-3 font-medium">Record</th><th scope="col" className="py-1 pr-3 font-medium">Direction</th>
                                  <th scope="col" className="py-1 pr-3 font-medium">Message</th><th scope="col" className="py-1 pr-3 font-medium">Fix</th>
                                  <th scope="col" className="py-1 font-medium">Attempts</th>
                                </tr></thead>
                                <tbody>
                                  {group.rows.map((row) => (
                                    <tr key={row.id} className="border-b">
                                      <td className="py-1 pr-3">{day(row.at)} {row.at.slice(11)}</td>
                                      <td className="py-1 pr-3">{row.object}</td>
                                      <td className="py-1 pr-3"><a className="underline" href={href("/ollopa/people")}>{row.record}</a></td>
                                      <td className="py-1 pr-3">{row.direction}</td>
                                      <td className="py-1 pr-3">{retrying.includes(row.id) ? "Retrying…" : row.message}</td>
                                      <td className="py-1 pr-3">{row.fix}</td>
                                      <td className="py-1 tabular-nums">{row.attempts}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </Door>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-sm font-semibold">Everything this connection is set to do</h3>
                <ExpandDoors ids={doorIds} />
              </div>
              <div className="rounded-lg border">
                {doors.map((d) => (
                  <Door key={d.id} id={d.id} label={d.label} count={d.count}>{d.content}</Door>
                ))}
              </div>
            </section>
          </div>
        </DoorGroup>
      </fieldset>

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
