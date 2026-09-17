// U-api, U-hooks, U-mcp, U-cli, U-slack, U-digest: the surfaces with no screen of their own.
//
// A response, a POST body, a tool result, an exit code and a Slack message cannot be drawn, so this
// page prints what each of them returns, from this workspace's own data. The rule-7 test is run here
// with no screen to run it on: without clicking anything, can a caller find the price, the limit, the
// destructive action's consequence and any pending approval? The limits line, the cost table, the
// delivery contract and the ceiling are not doors, because each informs a decision made before a
// surface is ever called (spec 17 §3.7, §6.1, §6.2).
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { href, navigate, useRoute } from "@/app/router"
import { toast } from "../../templates/TablePage"
import { Door, DoorGroup, ExpandAll } from "../../ui/Door"
import { Locked } from "../../ui/Locked"
import { gate, money } from "../../ui/gate"
import { businessById } from "../../data/businesses"
import { API_LIMITS, CLI_EXIT_CODES, ENDPOINT_COSTS, SECOND_APPROVAL, seedFor } from "../../data/seed"
import type { Session } from "../../session"
import { day } from "../deal/format"
import { Code, Consequence, n } from "./bits"

/** The three shapes of "cannot see it", as spec 17 §3.7 states them for a surface with no screen. */
function Shapes({ lines }: { lines: [string, string, string] }) {
  return (
    <div className="grid gap-1 rounded-md border p-3 text-sm">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">The three shapes of “you cannot see it”</h4>
      <p><span className="font-medium">An object you do not own.</span> {lines[0]}</p>
      <p><span className="font-medium">An area your seat does not hold.</span> {lines[1]}</p>
      <p><span className="font-medium">A page the profile left out.</span> {lines[2]}</p>
    </div>
  )
}

function Surface({ id, title, promise, children, current }: {
  id: string; title: string; promise: string; children: React.ReactNode; current: boolean
}) {
  const box = useRef<HTMLElement>(null)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (current) box.current?.scrollIntoView({ block: "start", behavior: "smooth" })
  }, [current])
  return (
    <section ref={box} id={id} className={cn("scroll-mt-4 rounded-lg border p-4", current && "border-foreground")}>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm">{promise}</p>
      <div className="mt-4 grid gap-4 [&>*]:min-w-0">{children}</div>
    </section>
  )
}

export function DeveloperSurfaces({ session, node }: { session: Session; node: string }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const route = useRoute()
  const api = gate("api", session.business)
  const hooks = gate("webhooks", session.business)
  const mcpWrite = gate("mcp.write", session.business)

  const admin = b.roles.find((r) => r.role === "admin")?.user ?? "your RevOps admin"
  const mailbox = seed.mailboxes[0]?.address ?? `${session.user.split(" ")[0].toLowerCase()}@${seed.domains[0]?.domain ?? "example.com"}`
  const key = seed.apiKeys[0]
  const hook = seed.webhooks.find((h) => h.state === "failing") ?? seed.webhooks[0]
  const deliveries = seed.webhookDeliveries.filter((d) => d.webhookId === hook?.id)
  const failing = deliveries.filter((d) => d.status === "failed")
  const mine = seed.mcpTokens.find((t) => t.user === session.user) ?? seed.mcpTokens[0]
  const devices = seed.cliDevices
  const waiting = seed.agentEvents.filter((e) => e.needsApproval && e.status.startsWith("waiting"))
  const batch = waiting.filter((e) => e.batchKey === waiting[0]?.batchKey).slice(0, 3)
  const batchCredits = batch.reduce((s, e) => s + e.credits, 0)
  const slack = seed.integrations.find((i) => i.kind === "Slack")

  const surfaces = [
    { id: "api", node: "U-api", label: "The API" },
    { id: "webhooks", node: "U-hooks", label: "Webhooks" },
    { id: "mcp", node: "U-mcp", label: "MCP" },
    { id: "cli", node: "U-cli", label: "The CLI" },
    { id: "slack", node: "U-slack", label: "Slack messages" },
    { id: "digest", node: "U-digest", label: "The daily digest" },
  ]
  const here = surfaces.find((s) => s.node === node)?.id ?? route.path[2] ?? "api"

  const capRefusal = `{
  "error": "credit_cap_reached",
  "message": "This workspace has spent its monthly cap of ${n(seed.credits.monthlyCap)} credits.",
  "cap": ${seed.credits.monthlyCap},
  "spent_this_cycle": ${seed.credits.monthlyCap},
  "resets_on": "${seed.credits.cycleEnds}",
  "raise_it": "${admin}",
  "written": "nothing"
}`

  const pendingApproval = `{
  "status": "approval_needed",
  "id": "${batch[0]?.id ?? "run-1"}",
  "actions": ${batch.length},
  "credits": ${batchCredits},
  "consequence": "${batch[0] ? `Sends 1 email to ${batch[0].to ?? batch[0].contact ?? "a contact"} from ${mailbox} · ${batch[0].credits} credits` : "Sends 1 email · 4 credits"}",
  "approver": "${batch[0]?.actorUser ?? session.user}",
  "over_threshold": ${batchCredits > SECOND_APPROVAL.credits},
  "also_waiting_in": "ollopA › Agents"
}`

  const approvalCard = `Approval needed · ${batch.length} action${batch.length === 1 ? "" : "s"} · ${batch.filter((e) => e.kind === "drafted" || e.kind === "sent").length} emails, ${batch.filter((e) => e.kind === "proposed").length} proposals · ${batchCredits} credits
${batch.map((e, i) => `  ${i + 1}. ${e.summary} — ${e.credits} credits`).join("\n")}
Requested by ${batch[0]?.actorUser ?? session.user} · ${mine?.client ?? "Claude"} (MCP) · ${batch[0]?.at ?? "09:14"}
Over ${n(SECOND_APPROVAL.recipients)} recipients or ${n(SECOND_APPROVAL.credits)} credits? ${batchCredits > SECOND_APPROVAL.credits ? "Yes — a second approver is needed." : "No."}
Approve all · Approve one · Decline all          Also waiting in ollopA › Agents`

  const cliSession = `$ ollopa credits --workspace "${b.name}"
${b.name}: ${n(seed.credits.balance)} credits left · cap ${n(seed.credits.monthlyCap)} a month · resets ${seed.credits.cycleEnds}

$ ollopa people update --workspace "${b.name}" --list "${seed.lists[0]?.name ?? "Q4 outbound"}" --set stage=Contacted
${b.name} · ${n(seed.lists[0]?.memberIds.length ?? 0)} records will change · 0 credits · allocation checked: ${n(seed.credits.balance)} left
This is a destructive bulk write. Type the workspace name to continue: ${b.name}
Done. ${n(seed.lists[0]?.memberIds.length ?? 0)} records changed.                                   exit 0

$ ollopa sequences enrol --workspace "${b.name}" --list "${seed.lists[0]?.name ?? "Q4 outbound"}" --sequence "${seed.sequences[0]?.name ?? "Q4 enterprise outbound"}"
Approval needed · 1 action · ${n(seed.lists[0]?.memberIds.length ?? 0)} enrolments · ${n((seed.lists[0]?.memberIds.length ?? 0) * 2)} credits
Decide in ollopA › Agents, or run: ollopa approvals decide --resume ap_7f31c0
Interrupted, resume with the token printed.                                exit 7`

  return (
    <DoorGroup>
      <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
        <a href={href("/ollopa/settings/developer")} className="text-xs text-muted-foreground hover:underline">Settings › API, webhooks, MCP and CLI</a>
        <div className="mt-2 flex flex-wrap items-start gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">What each surface returns</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Written from this workspace: {b.name}, {b.plan.name}, {n(b.plan.seats)} seats. A response has no second level, so everything a caller needs is on the response.
            </p>
          </div>
          <div className="ml-auto" data-print-hide><ExpandAll /></div>
        </div>

        <nav aria-label="The surfaces" className="mt-4 flex flex-wrap gap-2">
          {surfaces.map((s) => (
            <Button key={s.id} size="sm" variant={here === s.id ? "default" : "outline"} onClick={() => navigate(`/ollopa/developer/${s.id === "webhooks" ? "webhooks" : s.id}`)}>
              {s.label}
            </Button>
          ))}
        </nav>

        {/* Level one, above every surface: the facts that decide a design before a key exists. */}
        <section className="mt-6 grid gap-4 rounded-lg border p-4 [&>*]:min-w-0">
          <div>
            <h2 className="text-sm font-semibold">Limits are per workspace, not per key</h2>
            <p className="mt-1 text-sm">{n(API_LIMITS.perMinute)} a minute · {n(API_LIMITS.perHour)} an hour · {n(API_LIMITS.perDay)} a day. Every plan.</p>
            <p className="mt-1 text-xs text-muted-foreground">Minting a second key buys nothing. There are no per-key rate limits, and saying so is the feature.</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">What each endpoint costs</h2>
            <p className="mt-1 text-xs text-muted-foreground">Reads and writes cost nothing. Enrichment costs, and the maximum is not the average.</p>
            <div className="mt-2 min-w-0 overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse text-sm">
                <caption className="sr-only">What each endpoint costs: reads and writes cost nothing; enrichment costs, and the maximum is not the average.</caption>
                <thead><tr className="border-b text-left text-xs text-muted-foreground">
                  <th scope="col" className="py-2 pr-3 font-medium">Endpoint</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Typical</th>
                  <th scope="col" className="py-2 font-medium">Maximum</th>
                </tr></thead>
                <tbody>
                  {ENDPOINT_COSTS.slice(0, 6).map((e) => (
                    <tr key={e.endpoint} className="border-b">
                      <th scope="row" className="py-2 pr-3 text-left font-normal"><code className="font-mono text-xs">{e.endpoint}</code></th>
                      <td className="py-2 pr-3 tabular-nums">{e.typical}</td>
                      <td className="py-2">{e.maximum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold">The 80% alert</h2>
            <p className="mt-1 text-sm">
              On. {key ? `${key.alertOwner} is told when "${key.name}" reaches 80% of the allocation.` : `The key's owner is told at 80% of the allocation.`}
            </p>
            <Consequence tone="plain">Turned off, nobody is told before the allocation runs out.</Consequence>
          </div>
        </section>

        <div className="mt-6 grid gap-6 [&>*]:min-w-0">
          {/* ------------------------------------------------------------------- the API */}
          <Surface
            id="api" current={here === "api"} title="The API"
            promise="Two headers on every credit-consuming response, a refusal that names the cap rather than a partial result, and a pending-approval object returned in the same call that caused it."
          >
            {api.locked && (
              <Locked feature="The REST API" plan={api.plan} pricePerMonth={api.pricePerMonth} what={api.what}>
                <Button variant="outline">The API is on {api.plan} · {money(api.pricePerMonth)} a month for {b.plan.seats} seats</Button>
              </Locked>
            )}
            <div>
              <h3 className="text-sm font-medium">Every response that spends credits</h3>
              <Code block label="Copy the headers" text={`HTTP/1.1 200 OK\nX-RateLimit-Remaining: ${API_LIMITS.perMinute - 12}\nX-RateLimit-Reset: 41\nX-Credits-Remaining: ${seed.credits.balance}\nX-Credits-Cap: ${seed.credits.monthlyCap}`} />
              <p className="mt-1 text-xs text-muted-foreground">
                A rate limit is not a budget: a nightly job that stops when it runs out of requests still burns credits until it does. Both numbers are on every response for that reason.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">At the credit cap — a refusal, never a partial result</h3>
              <Code block label="Copy the refusal" text={capRefusal} />
            </div>
            <div>
              <h3 className="text-sm font-medium">Over the second-approval threshold</h3>
              <Code block label="Copy the object" text={pendingApproval} />
              <p className="mt-1 text-xs text-muted-foreground">The same item is in the app's queue and is decided once, in either place. The ledger records which surface decided it.</p>
            </div>
            <Shapes lines={[
              `The object comes back with its readable fields and an "owner" line. Edit fields are absent, not empty: ${key ? `"${key.name}" carries ${key.scopes.join(", ")}.` : "a key carries the scopes it was given."}`,
              `A refusal naming the seats that hold the area and the admin to ask: "${admin}, RevOps admin."`,
              "Profile omission does not exist for a key. A key sees every area its seat holds, and this line is in the document rather than left to inference.",
            ]} />
            <Consequence tone="plain">
              What this surface promises: the price is published, the limit is a header, a refusal is total, and an approval arrives as an object in the same turn.
            </Consequence>
          </Surface>

          {/* -------------------------------------------------------------- the webhooks */}
          <Surface
            id="webhooks" current={here === "webhooks"} title="Webhooks"
            promise="Outbound only, at-least-once, out of order, signed, attempt-numbered, retried for 24 hours, never silently disabled — and reconciliation is expected, not optional."
          >
            {hooks.locked && (
              <Locked feature="Webhooks" plan={hooks.plan} pricePerMonth={hooks.pricePerMonth} what={hooks.what}>
                <Button variant="outline">Webhooks are on {hooks.plan} · {money(hooks.pricePerMonth)} a month for {b.plan.seats} seats</Button>
              </Locked>
            )}
            <div>
              <h3 className="text-sm font-medium">One delivery, as it arrives</h3>
              <Code
                block label="Copy the delivery"
                text={`POST ${hook?.url ?? "https://hooks.example.com/ollopa/1"}\nollopA-Event: ${deliveries[0]?.event ?? "deal.updated"}\nollopA-Delivery: ${deliveries[0]?.id ?? "del-1"}\nollopA-Attempt: ${deliveries[0]?.attemptNumber ?? 1}\nollopA-Signature: t=1789012345,v1=<HMAC-SHA256 of the raw body with your secret>\nContent-Type: application/json\n\n{ "event": "${deliveries[0]?.event ?? "deal.updated"}", "id": "${deliveries[0]?.recordId ?? "deal-1"}", "at": "${deliveries[0]?.at ?? ""}" }`}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Verify the signature over the raw body before you parse it. The attempt number is how you tell a retry from a second event.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium">The delivery contract</h3>
              <ol className="mt-1 grid gap-1 text-sm">
                <li>1. At-least-once: the same event can arrive twice.</li>
                <li>2. Signed: every body carries <code className="font-mono text-xs">ollopA-Signature</code>.</li>
                <li>3. Attempt-numbered: <code className="font-mono text-xs">ollopA-Attempt</code> counts from 1.</li>
                <li>4. Retried for 24 hours, with a widening gap.</li>
                <li>5. Never silently disabled: a failing subscription keeps its place and says how long it has been failing.</li>
                <li className="flex flex-wrap items-center gap-2">6. Reconcile nightly: <Code text="GET /v1/changes?since=<cursor>" label="Copy the endpoint" /></li>
              </ol>
            </div>

            {hook && (
              <div>
                <h3 className="text-sm font-medium">
                  {hook.url} · {hook.state === "failing" ? `Failing since ${day(hook.failingSince ?? "")} · ${failing.length} deliveries` : "Delivering"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">Events: {hook.events.join(", ")} · secret set on {day(hook.secretSetOn)}.</p>
                {failing.length > 0 && (
                  <div className="mt-2 rounded-md border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{failing[0].cause} · {failing.length}</p>
                      <Button size="sm" variant="outline" onClick={() => toast(`Replaying ${failing.length} deliveries · the group leaves or comes back with a new cause`)}>Replay these {failing.length}</Button>
                    </div>
                    <div className="mt-2 border-t">
                      <Door id={`dev.hook.${hook.id}`} label={`${failing[0].cause} · the ${failing.length} deliveries`} count={failing.length}>
                        <ul className="grid gap-1 text-xs text-muted-foreground">
                          {failing.slice(0, 10).map((f) => (
                            <li key={f.id}>{day(f.at)} {f.at.slice(11)} · {f.event} · {f.recordId} · attempt {f.attemptNumber} · {f.cause}</li>
                          ))}
                        </ul>
                      </Door>
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm">Approvals are not webhook events. A webhook fires on what happened, never on what needs deciding.</p>
            <Shapes lines={[
              "A record you do not own still fires its event; the body carries the readable fields and an owner.",
              `An event from an area the subscription's seat does not hold is not sent at all, and the subscription says so rather than dropping it quietly.`,
              "Profile omission does not exist for an endpoint. What you receive is decided by the event list, and nothing else.",
            ]} />
            <Consequence tone="plain">
              What this surface promises: delivery is neither guaranteed nor ordered, so reconcile nightly from the endpoint above. A failing subscription is never disabled by us.
            </Consequence>
          </Surface>

          {/* -------------------------------------------------------------------- MCP */}
          <Surface
            id="mcp" current={here === "mcp"} title="MCP: read, safe writes, destructive writes"
            promise="Authorised as the person, carrying their permissions, their credit limit and this workspace's compliance restrictions. Every credit-consuming result states what is left; at the cap it refuses rather than writing part of a batch."
          >
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">The three tiers</h3>
              {[
                { tier: "read", label: "Read", what: "search, open, list", locked: false },
                { tier: "write_safe", label: "Safe writes", what: "create a draft, create a task, create a record", locked: mcpWrite.locked },
                { tier: "write_destructive", label: "Destructive writes", what: "update, delete, enrol, send, enrich", locked: mcpWrite.locked },
              ].map((row) => {
                const body = (
                  <div className={cn("rounded-lg border p-3 text-sm", mine?.tier === row.tier && "border-foreground")}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{row.label}</span>
                      {mine?.tier === row.tier && <span className="text-xs">· this workspace's tier</span>}
                      {row.locked && <span className="text-xs text-muted-foreground">· {mcpWrite.plan} · {money(mcpWrite.pricePerMonth)} a month for {b.plan.seats} seats</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{row.what}</p>
                  </div>
                )
                return row.locked
                  ? <Locked key={row.tier} feature={`MCP ${row.label.toLowerCase()}`} plan={mcpWrite.plan} pricePerMonth={mcpWrite.pricePerMonth} what={mcpWrite.what}>{body}</Locked>
                  : <div key={row.tier}>{body}</div>
              })}
              <p className="text-xs text-muted-foreground">Read is on every plan. The lock sits on the tier, before any work exists — there is no gate at the moment a write fails.</p>
            </div>

            {mine && (
              <div>
                <h3 className="text-sm font-medium">Each action inside the tier</h3>
                <ul className="mt-1 grid gap-1 text-sm">
                  {Object.entries(mine.actions).map(([action, state]) => (
                    <li key={action} className="flex flex-wrap items-center gap-2 border-b py-1 last:border-b-0">
                      <span className="min-w-0 flex-1">{action}</span>
                      <span className="text-xs">{state === "allow" ? "Allowed" : state === "approve" ? "Approval required" : "Blocked"}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your limit: {b.roles.find((r) => r.user === session.user)?.creditLimit ? `${n(b.roles.find((r) => r.user === session.user)!.creditLimit!)} a month` : "none"} · workspace cap {n(seed.credits.monthlyCap)} a month, {n(seed.credits.balance)} left. This workspace requires model training to be off in your client ({seed.workspace.modelTraining}).
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium">The card at the end of the client's turn</h3>
              <Code block label="Copy the card" text={approvalCard} />
              <p className="mt-1 text-xs text-muted-foreground">
                One card for the whole turn, never one per tool call. It is returned as content the client must render, not as a string the model may paraphrase, and it is not collapsible.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium">Your connections</h3>
              <ul className="mt-1 grid gap-1 text-sm">
                {seed.mcpTokens.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center gap-2 border-b py-1 last:border-b-0">
                    <span className="min-w-0 flex-1">{t.user} · {t.client} · authorised {day(t.authorisedOn)} · last used {t.lastUsedAt ? day(t.lastUsedAt) : "never"}</span>
                    <span className="text-xs">{t.tier === "read" ? "Read" : t.tier === "write_safe" ? "Safe writes" : "Destructive writes"}</span>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => toast(`${t.client} stops working at its next call · runs already approved finish`)}>Revoke</Button>
                  </li>
                ))}
              </ul>
            </div>

            <Shapes lines={[
              "A record the person does not own comes back readable, with an owner, and the write tools for it are absent from the result.",
              `The server's tool list is exactly the seat's areas. An area the seat does not hold has no tool, and the connection document names ${admin} as the person who can grant it.`,
              "There is no profile filtering on the tool list, and the connection document says so in one line.",
            ]} />
            <Consequence tone="plain">
              What this surface promises: the tier is set once, the ceiling is printed at connection, every credit-spending result states what is left, and the only interruption is the card.
            </Consequence>
          </Surface>

          {/* -------------------------------------------------------------------- the CLI */}
          <Surface
            id="cli" current={here === "cli"} title="The CLI"
            promise="Narrow on purpose: authenticate, search, export, bulk update with --resume, allocation check, analytics. Every command takes --workspace and echoes the workspace name in every confirmation."
          >
            <div>
              <h3 className="text-sm font-medium">A session, as it reads</h3>
              <Code block label="Copy the session" text={cliSession} />
              <p className="mt-1 text-xs text-muted-foreground">
                Before any bulk write it prints what will change, how many records and how many credits, and checks the allocation first rather than failing halfway. A destructive bulk write asks for the workspace name to be typed back, exactly as Delete workspace does in Settings.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium">The published exit codes</h3>
              <div className="mt-1 min-w-0 overflow-x-auto">
                <table className="w-full min-w-[22rem] border-collapse text-sm">
                  <caption className="sr-only">The seven exit codes the CLI publishes.</caption>
                  <thead><tr className="border-b text-left text-xs text-muted-foreground"><th scope="col" className="py-1 pr-4 font-medium">Code</th><th scope="col" className="py-1 font-medium">Meaning</th></tr></thead>
                  <tbody>
                    {CLI_EXIT_CODES.map((e) => (
                      <tr key={e.code} className="border-b">
                        <th scope="row" className="py-1 pr-4 text-left font-normal tabular-nums">{e.code}</th>
                        <td className="py-1">{e.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">A locked capability prints the plan name and the monthly total, not a 403.</p>
            </div>

            <div>
              <h3 className="text-sm font-medium">Device authorisations</h3>
              {devices.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">No devices authorised. Signing in is a browser round trip, or a device flow where there is no browser.</p>
              ) : (
                <ul className="mt-1 grid gap-1 text-sm">
                  {devices.map((dv) => (
                    <li key={dv.id} className="flex flex-wrap items-center gap-2 border-b py-1 last:border-b-0">
                      <span className="min-w-0 flex-1">{dv.label} · {dv.user} · {dv.workspace} · authorised {day(dv.authorisedOn)} · last used {dv.lastUsedAt ? day(dv.lastUsedAt) : "never"}</span>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => toast(`${dv.label} stops working at its next command`)}>Revoke</Button>
                    </li>
                  ))}
                </ul>
              )}
              {session.business === "halyard" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Credits are per workspace. <code className="font-mono">ollopa credits --all-workspaces</code> reports across all ten — the accelerator this page cannot give.
                </p>
              )}
            </div>

            <Shapes lines={[
              "An unowned record exports its readable fields with an owner column. Nothing is silently dropped from the file.",
              `An area the seat does not hold exits 4, naming the seats that hold it and ${admin} to ask.`,
              "Profile omission does not apply to a terminal, and --help says so.",
            ]} />
            <Consequence tone="plain">
              What this surface promises: the workspace is echoed, the three pre-flight facts are printed, a destructive write is typed back, and an interrupted run resumes from a token without re-applying anything.
            </Consequence>
          </Surface>

          {/* ----------------------------------------------------------------- Slack */}
          <Surface
            id="slack" current={here === "slack"} title="Slack messages"
            promise="Five events, each to a channel you chose. The message never holds a control; it carries the deep link to the place the decision is made."
          >
            <ul className="grid gap-1 text-sm">
              {(slack?.channels.length ? slack.channels : [{ event: "A reply lands", channel: "not connected" }]).map((c) => (
                <li key={c.event} className="border-b py-1 last:border-b-0">{c.event} → {c.channel}</li>
              ))}
            </ul>
            <Code block label="Copy the message" text={`ollopA · ${slack?.channels[0]?.channel ?? "#revenue"}\n${seed.replies[0]?.contact ?? "A contact"} replied to "${seed.sequences[0]?.name ?? "a sequence"}" — ${seed.replies[0]?.outcome ?? "Interested"}\nOpen in ollopA › Inbox`} />
            <Consequence tone="plain">
              What this surface promises: a notification, not a control. An approval posted here carries a link, and the decision is taken in ollopA or on the client's own card.
            </Consequence>
          </Surface>

          {/* ----------------------------------------------------------------- digest */}
          <Surface
            id="digest" current={here === "digest"} title="The daily email digest"
            promise="One message a day: what is waiting, what was spent, and what failed. The credit total is in the body, not behind a link."
          >
            <Code
              block label="Copy the digest"
              text={`ollopA · ${b.name} · ${day(seed.workspace.declaredAt)}\n${n(seed.tasks.filter((t) => t.status === "Open").length)} tasks due · ${n(seed.replies.filter((r) => r.status === "open").length)} replies open · ${n(waiting.length)} approvals waiting\nCredits: ${n(seed.credits.burnPerWeek)} this week · ${n(seed.credits.balance)} left · cap ${n(seed.credits.monthlyCap)}\n${seed.webhooks.some((h) => h.state === "failing") ? "1 webhook failing · handler returned 500" : "No failing subscriptions"}\nOpen in ollopA`}
            />
            <Consequence tone="plain">
              What this surface promises: the same numbers as the app, in the body of the message, with one link per line back to the place the work is.
            </Consequence>
          </Surface>
        </div>
      </div>
    </DoorGroup>
  )
}
