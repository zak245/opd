// R-integration: where a connection lives for the rest of its life.
//
// Status, errors and the destructive controls are on the surface; what syncs, the mapping, the rules,
// the authorisation and the history are five doors, each with a summary line that says what is inside
// before it opens. Everything the wizard asked can be changed here, in place — the wizard is for the
// first connection and nothing else (spec 15 §3.2).
import { useMemo, useState } from "react"
import { Actions, type Action } from "../../ui/Actions"
import { href, navigate, useRoute } from "@/app/router"
import { toast } from "../../templates/TablePage"
import type { RecordDoor } from "../../templates/RecordPage"
import { Door, DoorGroup } from "../../ui/Door"
import { Chip } from "../../ui/Identity"
import { Container, Group } from "../../ui/Surface"
import { businessById } from "../../data/businesses"
import { TODAY, seedFor, type Integration, type IntegrationError } from "../../data/seed"
import type { Session } from "../../session"
import { ago, day } from "../deal/format"
import { ExpandDoors, Picker, n } from "./bits"
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

  if (!live && draft.seededFrom === "nothing" && !draft.started) {
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <a href={href("/ollopa/settings/integrations")} className="t-body text-muted-foreground hover:underline">Settings › Integrations</a>
        <h2 className="t-section mt-6">This integration is not connected</h2>
        <Actions className="mt-5 justify-center" surface="page" items={[{ kind: "primary", label: "Connect an integration", onClick: () => navigate("/ollopa/connect/new?step=1") }]} />
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

  const pullNow: Action = {
    kind: "secondary", label: "Pull now",
    onClick: () => toast("Pull started · it appears in the sync history"),
    irreversible: {
      title: `Pull now from ${kind}?`,
      consequence: `Reads about ${n(live?.remoteCounts.Contacts ?? b.counts.contacts)} contacts and ${n(live?.remoteCounts.Companies ?? b.counts.companies)} companies and updates what has changed.`,
      confirmLabel: "Pull now",
    },
  }
  const pushNow: Action = {
    kind: "secondary", label: "Push now",
    onClick: () => toast("Push started · it appears in the sync history"),
    irreversible: {
      title: `Push now to ${kind}?`,
      consequence: `Writes ${n(b.counts.contacts)} contacts and ${n(b.counts.companies)} companies that match your push rule.`,
      confirmLabel: "Push now",
    },
  }

  const doors: RecordDoor[] = []
  if (isCrm) {
    doors.push({
      id: `int.what-syncs.${id}`,
      label: `What syncs — ${draft.objects.map((o) => `${o.object} ${o.direction === "both" ? "both ways" : o.direction === "off" ? "off" : `${o.direction} only`}`).join(" · ")}`,
      content: (
        <div className="grid gap-3">
          <SyncStep session={session} draft={draft} save={save} />
          <Actions surface="card" items={[{ kind: "secondary", label: "Save what syncs", onClick: () => toast("Saved · What syncs. It takes effect on the next run.") }]} />
        </div>
      ),
    })
    doors.push({
      id: `int.mapping.${id}`,
      label: `Field mapping — ${mappingSummary}`,
      content: (
        <div className="grid gap-3">
          <MapStep session={session} draft={draft} save={save} />
          <Actions surface="card" items={[
            { kind: "secondary", label: "Save the mapping", onClick: () => toast("Saved · Field mapping. Applies to records created or changed from now on.") },
            {
              kind: "secondary", label: "Apply mapping to existing records",
              onClick: () => toast(`Applying the mapping to ${n(b.counts.contacts + b.counts.companies)} records · it will appear in the sync history`),
              irreversible: {
                title: "Apply the mapping to existing records?",
                consequence: `Rewrites the mapped fields on ${n(b.counts.contacts)} contacts and ${n(b.counts.companies)} companies in ollopA and in ${kind}. It runs as one pass and appears in the sync history.`,
                confirmLabel: `Apply to ${n(b.counts.contacts + b.counts.companies)} records`,
              },
            },
          ]} />
        </div>
      ),
    })
    doors.push({
      id: `int.rules.${id}`,
      label: `Sync rules — Pull: ${draft.pullAll ? "every record" : draft.pullConditions.map((c) => `${c.field.toLowerCase()} ${c.op} ${c.value}`).join(", ")} · Push: ${draft.pushAll ? "every record" : draft.pushConditions.map((c) => `${c.field.toLowerCase()} ${c.op} ${c.value}`).join(", ")} · Deletions ${draft.onCrmDelete} · Merges ${draft.onCrmMerge === "mirror" ? "mirrored" : "ignored"}`,
      content: (
        <div className="grid gap-3">
          <RulesStep draft={draft} save={save} />
          <Actions surface="card" items={[{ kind: "secondary", label: "Save the sync rules", onClick: () => toast("Saved · Sync rules. They apply from the next run.") }]} />
        </div>
      ),
    })
  }
  doors.push({
    id: `int.auth.${id}`,
    label: `Authorisation — connected as ${draft.authUser || live?.auth?.user || "nobody yet"}${(live?.auth?.validUntil ?? draft.validUntil) ? ` · valid until ${day(live?.auth?.validUntil ?? draft.validUntil)}` : ""}`,
    content: (
      <div className="t-body grid gap-3">
        <div>Sync user: {draft.authUser || live?.auth?.user || "—"}</div>
        {kind === "Salesforce" && <div>Environment: {draft.environment}</div>}
        <div>Token: {(live?.auth?.validUntil ?? draft.validUntil) ? `valid until ${day(live?.auth?.validUntil ?? draft.validUntil)}` : `valid until it is revoked in ${kind}`}</div>
        <Actions surface="card" items={[
          { kind: "secondary", label: "Re-authorise", onClick: () => toast(`Re-authorised ${kind} as ${draft.authUser || live?.auth?.user}`) },
          { kind: "secondary", label: "Change sync user", onClick: () => toast("Sign in as the new sync user to change it") },
        ]} />
      </div>
    ),
  })
  doors.push({
    id: `int.history.${id}`,
    label: `Sync history — ${runs.length} runs${lastFailed ? ` · last failed run ${ago(lastFailed.started)}` : " · none failed"}`,
    count: runs.length,
    content: (
      <div className="grid gap-3">
        <Actions surface="card" items={[pullNow, pushNow]} />
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse t-body">
            <caption className="sr-only">The last {runs.length} sync runs, newest first.</caption>
            <thead><tr className="border-b text-left t-small text-muted-foreground">
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

  /**
   * The header's acts. Pausing is reversible, so it acts at once and is outlined like the rest.
   * Disconnecting is the one act that cannot be taken back: text in the destructive colour, last,
   * after a gap, with everything it does inside its own confirmation and the verb on the affirmative
   * (DESIGN.md §1 and §2) — which is why no sentence sits beside it any more.
   */
  const headerActions: Action[] = [
    { kind: "secondary", label: paused ? "Resume syncing" : "Pause syncing", onClick: () => { saveLocal({ paused: !paused, pausedBy: session.user, pausedOn: TODAY }); toast(paused ? `${kind} is syncing again` : `${kind} paused by ${session.user}`) } },
    pullNow,
    pushNow,
    { kind: "link", label: "Re-run setup", href: href(`/ollopa/connect/${slug}?step=1`), onClick: () => navigate(`/ollopa/connect/${slug}?step=1`) },
    {
      kind: "destructive", label: `Disconnect ${kind}`,
      onClick: () => { toast(`${kind} disconnected · ${disconnectConsequence}`); navigate("/ollopa/settings/integrations") },
      irreversible: { title: `Disconnect ${kind}?`, consequence: disconnectConsequence, confirmLabel: `Disconnect ${kind}` },
    },
  ]

  const doorIds = doors.map((d) => d.id)
  const ribbon = justStarted
    ? justStarted === "paused"
      ? `${kind} is connected and paused`
      : `${kind} is syncing · first sync started ${live?.lastSync.slice(11) ?? "just now"}`
    : paused
      ? `Paused by ${local.pausedBy || session.user}${local.pausedOn ? ` on ${day(local.pausedOn)}` : ""}`
      : null

  return (
    <>
      {/* A disabled fieldset makes every control on the page read-only at once, so a seat that may
          read the CRM's page cannot change it by any route, and the sentence above names who can. */}
      <fieldset disabled={readOnly} className="flex min-h-full min-w-0 flex-col border-0 p-0">
        {readOnly && (
          <div role="note" className="t-body border-b surface-raised px-5 py-2 lg:px-6">
            You can read this page. Changes to {kind} are made by {admin ? `${admin.user} (${admin.title})` : "the admin"}.
          </div>
        )}
        <header className="border-b px-5 pt-4 lg:px-6">
          <a href={href("/ollopa/settings/integrations")} className="t-small text-muted-foreground hover:underline">← Settings › Integrations</a>
          <div className="mt-2 flex flex-wrap items-start gap-x-4 gap-y-2">
            <div className="min-w-0">
              <h2 className="t-section">{live?.name ?? `${kind}${kind === "Salesforce" ? ` (${draft.environment})` : ""}`}</h2>
              <p className="t-body text-muted-foreground">{kind}{live?.environment ? ` · ${live.environment}` : ""}</p>
            </div>
            {/* A seat that may not change this connection is shown no controls at all; the line
                above the header names who does (RULES.md rule 4). */}
            {!readOnly && <Actions className="ml-auto" surface="page" items={headerActions} />}
          </div>

          {ribbon && (
            <div role="status" aria-live="polite" className="t-body mt-3">{ribbon}</div>
          )}

          <Group as="dl" className="-mx-5 mt-3 grid grid-cols-2 gap-x-6 gap-y-3 border-t px-5 py-3 sm:grid-cols-3 xl:grid-cols-5 lg:-mx-6 lg:px-6">
            {[
              { label: "Status", value: <Chip status={status}>{status}</Chip> },
              { label: "Last sync", value: live ? `${day(live.lastSync)} ${live.lastSync.slice(11)}` : "not yet" },
              { label: "Next sync", value: paused ? "—, while paused" : live ? `every ${live.pollMinutes} minutes` : "every 15 minutes" },
              { label: "Records synced today", value: n(live?.recordsToday ?? 0) },
              { label: "Errors today", value: n(live?.errorsToday ?? 0) },
            ].map((f) => (
              <div key={f.label} className="min-w-0">
                <dt className="t-small text-muted-foreground">{f.label}</dt>
                <dd className="t-body mt-0.5">{f.value}</dd>
              </div>
            ))}
          </Group>
        </header>

        <DoorGroup>
          <div className="grid max-w-5xl gap-8 px-5 py-6 lg:px-6">
            <Container
              component="list"
              padded={false}
              heading="Errors, grouped by cause"
              count={groups.length ? filtered.length : undefined}
              actions={groups.length > 0 ? <Actions surface="card" items={[{ kind: "secondary", label: "Export as CSV", onClick: () => toast(`Exported ${filtered.length} error rows as CSV`) }]} /> : undefined}
            >
              {groups.length === 0 ? (
                <p className="t-body px-4 pb-3 text-muted-foreground">No errors held.</p>
              ) : (
                <div className="grid">
                  <div className="grid gap-2 border-t px-4 py-3 sm:grid-cols-[14rem_14rem_1fr]">
                    <Picker label="When" value={windowPick} options={WINDOWS} onChange={setWindowPick} />
                    <Picker label="Object" value={objectPick} options={objectNames} onChange={setObjectPick} />
                    <div className="flex items-end">
                      <Actions surface="card" items={[{
                        kind: "secondary",
                        label: `Retry all ${filtered.length} · 100 at a time, ${Math.max(1, Math.ceil(filtered.length / 100))} pass${Math.ceil(filtered.length / 100) === 1 ? "" : "es"}`,
                        onClick: () => groups.forEach(retryGroup),
                      }]} />
                    </div>
                  </div>

                  {groups.map((group) => {
                    const busy = group.rows.some((r) => retrying.includes(r.id))
                    return (
                      <div key={group.cause} className="border-t px-4 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="t-label flex flex-wrap items-center gap-2">
                              <Chip status={busy ? "running" : "failed"}>{busy ? "Retrying" : "Failing"}</Chip>
                              {group.cause} · {group.rows.length}
                            </p>
                            <p className="t-small text-muted-foreground">Fix: {group.fix}</p>
                          </div>
                          <Actions surface="card" items={[{
                            kind: "secondary",
                            label: busy ? "Retrying…" : `Retry these ${group.rows.length} · 100 at a time, ${Math.max(1, Math.ceil(group.rows.length / 100))} pass${Math.ceil(group.rows.length / 100) === 1 ? "" : "es"}`,
                            onClick: () => retryGroup(group),
                            disabledBecause: busy ? "Running now" : undefined,
                          }]} />
                        </div>
                        <div className="mt-2">
                          <Door id={`int.error.${id}.${group.cause.slice(0, 24)}`} label={`The ${group.rows.length} records this happened to`} count={group.rows.length}>
                            <div className="min-w-0 overflow-x-auto">
                              <table className="w-full min-w-[40rem] border-collapse t-small">
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
            </Container>

            <Container
              component="section"
              padded={false}
              heading="Everything this connection is set to do"
              actions={<ExpandDoors ids={doorIds} />}
            >
              <div className="border-t">
                {doors.map((d) => (
                  <Door key={d.id} id={d.id} label={d.label} count={d.count}>{d.content}</Door>
                ))}
              </div>
            </Container>
          </div>
        </DoorGroup>
      </fieldset>

    </>
  )
}
