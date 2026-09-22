// One request, from the ask to the verified change.
//
// The two approvals are two separately-dated actions and they say different things: approving to
// investigate carries no consequence line and says so; approving to implement carries its consequence
// in the label and again in the confirmation, is never bulk, and is not offered until the affected
// count and the rollback path have been written.
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Actions } from "../../ui/Actions"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { href, navigate } from "@/app/router"
import { openBeside } from "../../beside"
import { Chip, FamilyIcon } from "../../ui/Identity"
import { follow } from "../../chain"
import { Announcement } from "../../ui/Announcement"
import { useDoorState } from "../../ui/Door"
import { RecordPage, type RecordField } from "../../templates/RecordPage"
import { businessById } from "../../data/businesses"
import { seedFor, type Request } from "../../data/seed"
import type { Session } from "../../session"
import { businessDaysBetween, day, longDay, money, plural } from "./format"
import { STATE_LABEL, STATE_STATUS, waitingOf } from "./RequestsPage"
import { toast } from "./state"

/**
 * What a request touches, and where that thing lives.
 *
 * A setting is a row, and a row read while deciding a request is a look, not a trip: it opens in the
 * pane beside the request, with its own control and the page's Save bar, and the request stays on
 * screen behind it. A workflow or a report is a page of its own, so that one is a `follow` and the
 * crumb comes back to this record.
 */
const TOUCH_ROW: Record<string, string> = {
  field: "pipe.fields",
  stage: "pipe.stages",
  profile: "team.profiles",
  "plan feature": "plan.price",
}

const TOUCH_ROUTE: Record<string, string> = {
  workflow: "/ollopa/workflows",
  report: "/ollopa/reports",
}

export function RequestRecord({ session, id }: { session: Session; id?: string }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const target = seed.workspace.answerTarget.businessDays
  const request = seed.requests.find((r) => r.id === id) ?? seed.requests[0]
  const [state, setState] = useState<Request["state"] | null>(null)
  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState("")
  const [scope, setScope] = useState<string>(request?.scope.name ?? "Everyone")
  const [, openDiscussion] = useDoorState("request.discussion")

  if (!request) {
    return <div className="p-6 text-sm text-muted-foreground">That request is not in this workspace.</div>
  }

  const live = state ?? request.state
  const w = waitingOf(request, target)
  const upgrade = request.upgrade
  const canImplement = request.affected.count > 0 && !!request.rollback
  const implemented = live === "approved" || live === "shipped" || live === "verified"

  const consequence = upgrade
    ? `Approve · ${upgrade.feature} on ${upgrade.plan} · ${money(upgrade.monthlyTotal)} a month · the workspace bill becomes ${money(upgrade.newTotalForPeriod)} a month`
    : `Approve · ${request.outcome.toLowerCase()} · ${plural(request.affected.count, "person", "people")} see the change · applies to ${request.scope.kind === "everyone" ? "everyone" : request.scope.name} first · rollback: ${request.rollback.replace(/\.$/, "")}`

  const fields: RecordField[] = [
    { key: "kind", label: "Kind", value: request.kind === "upgrade" ? "A locked feature" : "A workspace change" },
    { key: "asked", label: "Asked by", value: `${request.requester.user} · ${request.requester.seat} · ${longDay(request.raisedOn)}` },
    {
      key: "waiting", label: "Waiting", wide: false,
      value: w.past > 0 ? <Chip status="overdue">{w.text}</Chip> : <span>{w.text}</span>,
      under: <span className="text-xs text-muted-foreground">This queue owes an answer in {target} business days: approve to investigate, approve to implement, or decline.</span>,
    },
    { key: "state", label: "State", value: <Chip status={STATE_STATUS[live]}>{STATE_LABEL[live]}</Chip> },
    { key: "owner", label: "Decision owner", value: request.decisionOwner },
    {
      key: "affects", label: "Who will feel it",
      value: `${plural(request.affected.count, "person", "people")}`,
      under: <span className="text-xs text-muted-foreground">{request.affected.how}: {request.affected.count}</span>,
    },
    {
      key: "scope", label: "Applies to", dependsOn: ["affects"],
      value: (
        <span className="flex flex-wrap items-center gap-2">
          <Select value={scope} onValueChange={(v) => { setScope(v); toast(`Widened to ${v}. The date is on the record.`) }}>
            <SelectTrigger className="h-8 w-56" aria-label="Applies to"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[request.scope.name ?? "One team", ...seed.territories.map((t) => t.name), "Everyone"].filter((v, i, a) => v && a.indexOf(v) === i).map((v) => (
                <SelectItem key={v} value={v!}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
      ),
      under: <span className="text-xs text-muted-foreground">
        ollopA has no sandbox and no change set. A change is applied to one team or one territory first and widened from this row; each widening keeps its date.
      </span>,
    },
    {
      key: "rollback", label: "Rollback", dependsOn: ["scope"],
      value: request.rollback,
      under: <span className="text-xs text-muted-foreground">Written before the change ships, in words, not as a button.</span>,
    },
    ...(upgrade ? [
      { key: "cost", label: "Monthly total", value: `${money(upgrade.monthlyTotal)} a month` } as RecordField,
      { key: "newtotal", label: "New total for the period", value: `${money(upgrade.newTotalForPeriod)} a month for ${b.plan.seats} seats`, dependsOn: ["cost"] } as RecordField,
    ] : []),
  ]

  const approvals = (
    <dl className="grid gap-2">
      <div className="flex flex-wrap items-baseline gap-x-3 border-b pb-2">
        <dt className="w-52 shrink-0 text-sm font-medium">Approve to investigate</dt>
        <dd className="text-sm text-muted-foreground">
          {request.approvals.investigate
            ? `${request.approvals.investigate.by}, ${longDay(request.approvals.investigate.on)}`
            : "Not yet. Nothing changes for anybody yet — this says the question is worth the admin's time."}
        </dd>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3 border-b pb-2">
        <dt className="w-52 shrink-0 text-sm font-medium">Approve to implement</dt>
        <dd className="text-sm text-muted-foreground">
          {request.approvals.implement
            ? `${request.approvals.implement.by}, ${longDay(request.approvals.implement.on)}`
            : "Not yet. This one is read on its own record, never in a batch."}
        </dd>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3">
        <dt className="w-52 shrink-0 text-sm font-medium">Declined</dt>
        <dd className="text-sm text-muted-foreground">
          {request.declined ? `${request.declined.by}, ${longDay(request.declined.on)} — ${request.declined.reason}` : "No."}
        </dd>
      </div>
    </dl>
  )

  const sections = [
    {
      id: "ask", title: "The ask",
      children: (
        <div className="grid gap-3 text-sm">
          <p className="t-section">{request.outcome}</p>
          <p><span className="text-muted-foreground">Reason:</span> {request.reason} — {request.reasonText}</p>
          <p>
            <span className="text-muted-foreground">Where it came from:</span> {request.originLabel}{" "}
            <a className="underline underline-offset-4" href={href(request.origin === "report" ? "/ollopa/reports" : request.origin === "routing" ? "/ollopa/workflows" : "/ollopa/settings")}>Open it</a>
          </p>
          <div>
            <span className="text-muted-foreground">Attached:</span>{" "}
            {request.evidence.map((e) => e.label).join(", ")}
          </div>
          <p className="border-t pt-3">
            <span className="text-muted-foreground">Impact estimate:</span>{" "}
            {live === "captured"
              ? <span className="text-muted-foreground">Empty until this is approved to investigate. The request is captured before it is estimated.</span>
              : request.estimate}
          </p>
        </div>
      ),
    },
    {
      id: "decision", title: "The decision",
      children: (
        <div className="grid gap-3">
          <p className="text-sm"><span className="text-muted-foreground">Owned by</span> {request.decisionOwner}, named by the decision they own.</p>
          {approvals}
          {declining && (
            <div className="rounded-md border p-3">
              <label htmlFor="decline-reason" className="text-sm font-medium">Why are you declining?</label>
              <Textarea id="decline-reason" rows={3} className="mt-2" value={reason} onChange={(e) => setReason(e.target.value)} />
              <Actions className="mt-2" surface="card" items={[
                { label: "Decline", kind: "secondary", disabledBecause: reason.trim() ? undefined : "Write the reason first",
                  onClick: () => { setDeclining(false); setState("declined"); toast(`Declined. ${request.requester.user} reads the reason where they asked.`) } },
                { label: "Keep it open", kind: "secondary", onClick: () => setDeclining(false) },
              ]} />
            </div>
          )}
        </div>
      ),
    },
    ...(upgrade ? [{
      id: "upgrade", title: "The upgrade",
      children: (
        <div className="grid gap-2 text-sm">
          <p><span className="text-muted-foreground">Feature:</span> {upgrade.feature}</p>
          <p><span className="text-muted-foreground">Plan that carries it:</span> {upgrade.plan}</p>
          <p><span className="text-muted-foreground">Monthly total:</span> {money(upgrade.monthlyTotal)} a month</p>
          <p><span className="text-muted-foreground">The workspace bill becomes:</span> {money(upgrade.newTotalForPeriod)} a month for {b.plan.seats} seats</p>
          <p><span className="text-muted-foreground">Without it:</span> {upgrade.alternative}</p>
          <p><span className="text-muted-foreground">Also asked by:</span> {upgrade.alsoAskedBy.length ? upgrade.alsoAskedBy.join(", ") : "nobody else yet"}</p>
          <p className="text-xs text-muted-foreground">
            If this is declined, the lock stays exactly where it was and nothing moves.
          </p>
        </div>
      ),
    }] : [
      {
        id: "changes", title: "What it changes",
        children: (
          <div className="grid gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">It touches:</span>{" "}
              {request.touches.map((t, i) => (
                <span key={t.id}>
                  {i > 0 && ", "}
                  {TOUCH_ROW[t.kind] ? (
                    <button
                      data-item={TOUCH_ROW[t.kind]}
                      className="inline-flex items-center gap-1 underline underline-offset-4"
                      onClick={(e) => openBeside({ kind: "setting", id: TOUCH_ROW[t.kind], opener: e.currentTarget })}
                    >{t.name}</button>
                  ) : (
                    <a className="underline underline-offset-4" href={href(TOUCH_ROUTE[t.kind] ?? "/ollopa/settings")}
                       onClick={(e) => {
                         if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                         e.preventDefault()
                         follow(TOUCH_ROUTE[t.kind] ?? "/ollopa/settings", {
                           route: `/ollopa/requests/${request.id}`,
                           title: `${request.outcome} · Requests`,
                           anchor: t.id,
                         })
                       }}>
                      <FamilyIcon of={t.kind === "workflow" ? "workflows" : "reports"} className="mr-1 inline-block align-text-bottom" />
                      {t.name}
                    </a>
                  )}
                  <span className="text-muted-foreground"> ({t.kind})</span>
                </span>
              ))}
            </div>
            <p><span className="text-muted-foreground">Who will feel it:</span> {request.affected.how}: {request.affected.count}</p>
            <p><span className="text-muted-foreground">Applies to:</span> {scope}{request.scopeHistory.length > 0 && ` · ${request.scopeHistory.map((h) => `${longDay(h.at)}: ${h.to}`).join("; ")}`}</p>
            <p><span className="text-muted-foreground">Rollback:</span> {request.rollback}</p>
            <p className="border-t pt-3"><span className="text-muted-foreground">Before this request:</span> {request.baseline}</p>
          </div>
        ),
      },
      {
        id: "rollout", title: "Rollout and verification",
        children: (
          <div className="grid gap-3 text-sm">
            <p>
              <span className="text-muted-foreground">Shipped:</span>{" "}
              {request.shippedOn ? `${longDay(request.shippedOn)} by ${request.shippedBy}` : "Not yet. ollopA does not make the change for you — the link above opens the place it is made."}
            </p>
            {request.announcement && (
              <div>
                <p className="pb-1 text-muted-foreground">The line the affected people read:</p>
                <Announcement text={request.announcement.text} href="#/ollopa/settings/pipeline" />
                <p className="pt-1 text-xs text-muted-foreground">
                  Written {longDay(request.announcement.writtenOn)}, gone by {longDay(request.announcement.expiresOn)} or on first contact with the changed thing.
                </p>
              </div>
            )}
            <p>
              <span className="text-muted-foreground">Verified:</span>{" "}
              {request.verify
                ? `${request.verify.used} of ${request.verify.of} have used it since ${longDay(request.verify.since)}`
                : request.shippedOn
                  ? businessDaysBetween(request.shippedOn) > 30
                    ? "Nothing has used this since it shipped."
                    : `Shipped ${longDay(request.shippedOn)} · nothing counted yet`
                  : "Nothing to verify until it ships."}
            </p>
            {request.state === "verified" && (
              <Actions surface="card" items={[{ label: "Reopen: the change did not hold", kind: "secondary",
                onClick: () => { setState("investigating"); toast("Reopened. The history keeps both passes.") } }]} />
            )}
          </div>
        ),
      },
    ]),
  ]

  return (
    <RecordPage
      back={{ label: "Requests", href: href("/ollopa/requests") }}
      title={{ value: request.outcome }}
      subtitle={{ label: `${request.requester.user} · ${request.requester.seat}`, href: href("/ollopa/settings/team") }}
      chips={
        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{request.kind === "upgrade" ? "A locked feature" : "A workspace change"}</span>
          <span>·</span>
          {w.past > 0 ? <Chip status="overdue">{w.text}</Chip> : <span>{w.text}</span>}
        </span>
      }
      ribbon={
        live === "declined" && request.declined
          ? { tone: "warning", text: `Declined by ${request.declined.by} on ${longDay(request.declined.on)} — ${request.declined.reason}` }
          : w.past > 0 && live === "captured"
            ? { tone: "error", text: `${w.past} business days past the ${target}-day answer target. ${request.requester.user} is still waiting.` }
            : undefined
      }
      fields={fields}
      actions={{
        primary: live === "captured"
          ? [{
              label: "Approve to investigate",
              onClick: () => { setState("investigating"); toast(`Approved to investigate. Nothing changes for anybody yet. ${request.requester.user} is told where they asked.`) },
            }]
          : implemented
            ? [{ label: "Mark it shipped", onClick: () => { setState("shipped"); toast("Marked shipped. The announcement line is written and the verify count starts.") } }]
            : [{
                label: canImplement ? `Approve · ${plural(request.affected.count, "person", "people")} see the change · ${request.rollback.replace(/\.$/, "")}` : "Write the rollback path first",
                confirm: canImplement ? consequence : undefined,
                onClick: () => {
                  if (!canImplement) { toast("Still missing: the affected count and the rollback path."); return }
                  setState("approved")
                  toast("Approved to implement. The announcement line is written for the affected people.")
                },
              }],
        secondary: [
          { label: "Decline", onClick: () => setDeclining(true) },
          { label: "Hand the decision over", onClick: () => toast("Handed over with one line saying why. The waiting clock does not restart, because the requester's week does not restart.") },
          { label: "Copy out", onClick: () => { navigator.clipboard?.writeText(`${request.outcome}\n${request.requester.user}\n${location.href}`); toast("Copied the request and its link, for a tracker of your own.") } },
        ],
      }}
      main={{ kind: "sections", sections }}
      side={[
        {
          id: "answer", title: "What this queue owes",
          children: (
            <div className="grid gap-1 text-sm">
              <p>{target} business days to an answer: approve to investigate, approve to implement, or decline.</p>
              <p className="text-muted-foreground">Raised {longDay(request.raisedOn)} · {w.text}</p>
              <p className="text-xs text-muted-foreground">An answer, never a shipped change.</p>
            </div>
          ),
        },
        ...(request.relatedTo ? [{
          id: "related", title: "Came out of",
          children: (
            <a className="text-sm underline underline-offset-4" href={href(`/ollopa/requests/${request.relatedTo}`)}>
              {seed.requests.find((r) => r.id === request.relatedTo)?.outcome ?? request.relatedTo}
            </a>
          ),
        }] : []),
      ]}
      doors={[
        {
          id: "request.discussion", label: "The discussion", count: request.notes.length,
          content: (
            <ul className="grid gap-2">
              {request.notes.map((n, i) => (
                <li key={i} className="grid gap-0.5 border-b pb-2 last:border-b-0">
                  <span className="text-xs text-muted-foreground">{n.by} · {day(n.at)}</span>
                  <span className="text-sm">{n.text}</span>
                </li>
              ))}
              {request.notes.length === 0 && <li className="text-sm text-muted-foreground">Nothing said yet.</li>}
            </ul>
          ),
        },
        {
          id: "request.evidence", label: "Implementation evidence and the test result",
          content: request.test ? (
            <dl className="grid gap-1 text-sm">
              <div><dt className="inline text-muted-foreground">What was tested: </dt><dd className="inline">{request.test.what}</dd></div>
              <div><dt className="inline text-muted-foreground">On: </dt><dd className="inline">{longDay(request.test.on)}</dd></div>
              <div><dt className="inline text-muted-foreground">By: </dt><dd className="inline">{request.test.by}</dd></div>
              <div><dt className="inline text-muted-foreground">Result: </dt><dd className="inline">{request.test.result}</dd></div>
            </dl>
          ) : <p className="text-sm text-muted-foreground">Nothing has been tested yet. It is written once the change ships.</p>,
        },
        {
          id: "request.history", label: "Full history", count: request.history.length,
          content: (
            <ul className="grid gap-1 text-sm">
              {request.history.map((h, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-x-3">
                  <span className="w-28 shrink-0 text-xs text-muted-foreground">{day(h.at)}</span>
                  <span>{h.what}</span>
                  <span className="text-xs text-muted-foreground">{h.by}</span>
                </li>
              ))}
            </ul>
          ),
        },
      ]}
      shortcuts={[{ keys: "e", label: "The discussion", run: () => openDiscussion(true) }]}
    />
  )
}

export function requestTitle(session: Session, id?: string): string {
  const r = seedFor(session.business).requests.find((x) => x.id === id)
  return r?.outcome ?? "Request"
}

export { navigate }
